## P0 #3 — Auth / Session contract（identity 一本化 + operator≠persona、#9-2 統合）

> **Canonical identity contract (SD-1 ratified); other sections realign to this.**

**目的**: 「誰が操作したか (実操作者)」をサーバ権威で記録し、demo persona の自由切替を許しつつ、四眼原則 (SoD) の判定主体をクライアント値 (`currentActorId`) からサーバが署名 token で resolve する identity へ移す。`body.actorId` は identity に昇格させず、サーバが許可集合で検証して `effective_actor_id` (persona 単位の SoD 判定主体、LIVE reducer の `currentActorId` と #4/#2 に整合) とする。`session_operator_id` は監査 PROVENANCE 専用 — 「1 人の実操作者が両ペルソナを演じた」かを reviewer が検出できるよう記録するが、SoD の比較キーではない。本人 (実操作者) が入力↔承認を演じ分けると persona 単位の四眼原則は通過するが、監査に同一 operator id が透明に残るため、bypass は隠蔽・block されず VISIBLE になる (honest-framing の核心価値)。

> **Right-sizing 宣言 (この契約の中核制約)**: demonstrate するのは control (effective_actor_id 基準 SoD / body actorId を identity に昇格させない / 両 ID 監査 / replay reject) **だけ**。HMAC は stateless 検証 (secret + payload) ゆえ `session` table も `operator` table も**建てない**。永続が必要なのは replay nonce のみで、それは in-memory `Set<jti>` 1 個で falsifiable。DB schema 追加・FK・identity store のミニチュアは production hardening = DEFECT として除外する (§Right-sizing notes / OD-3)。

---

### 0. 現状 (LIVE @ main 1e45ea7 = postv4) — 何を置換するか

| 項目 | 現状 (LIVE) | file:line | postv5 での扱い |
|---|---|---|---|
| identity の保持場所 | `StoreState.currentActorId` (client reducer state) | `src/store/types.ts:123` | サーバが署名 token から resolve する `session_operator_id` (provenance) + body から検証する `effective_actor_id` (SoD 主体) に置換。client は表示用 hint のみ。 |
| identity の永続化 | localStorage `bo-ai-v2:store` 内に丸ごと永続 (改竄可能) | `src/store/persist.ts:12,45,52` | identity は localStorage に**置かない**。署名トークンはメモリ保持 + サーバ secret で検証。 |
| actor 切替 | `<select>` → `dispatch({type:'session/switchActor', actorId})` | `src/store/reducer.ts:245-247` | **UI persona 切替は client-local のまま維持 (専用 server switch endpoint は作らない、SD-1)**。server は (a) operator-token 発行/現 operator (`POST /api/session/operator`) と (b) 各 write body の `{ actorId }` 検証のみを担う (後述 §3)。 |
| 切替の検証 | `actorById(action.actorId) ? ... : state` (存在チェックのみ) | `src/store/reducer.ts:247` | サーバが **per-write** に body `{ actorId }` を `allowed_actors` (5 seeded actors = 3 operational + ≥2 governance) に対し検証。不許可は reject (`denialReason='UNKNOWN_ACTOR'`)。 |
| SoD 判定 (自己承認系) の主キー | `state.currentActorId` を reducer が直接信頼 | `src/store/reducer.ts:74-76,88,93,207,214,254,262` | サーバが body の actorId を許可集合で検証した `effective_actor_id` (LIVE `currentActorId` と同主体)。client 自己申告値ではなくサーバ検証後の値で判定。 |
| SoD 判定 (escalation 系) の主キー | `state.currentActorId !== escalation.to` (指名裁定者一致、isSelfApproval **不使用**) | `src/store/reducer.ts:144` | パターンが別 (§7)。persona 軸の指名一致を維持 (`effective_actor_id !== escalation.to`)。escalation は persona 軸の指名一致のまま据え置く。 |
| `isSelfApproval` | `requesterId === currentActorId` (client 値同士) | `src/store/reducer.ts:74-76` | サーバ側で `requester_actor_id === effective_actor_id` を判定 (persona 基準、§7)。 |
| persist guard の actor 実在性 | `if (!actorById(o.currentActorId)) return false` | `src/store/persist.ts:52` | client 側 guard は残置 (UI hint の健全性のみ)、SoD の真偽はサーバが持つ。 |

> **重要な区別 (reducer.ts の SoD は 2 系統)**: (a) `isSelfApproval` を使う 3 箇所 (`inputApprovedBy` 93 / `forwardedBy` 214 / `promotionRequestedBy` 262) は「申請者 = 承認者か」の自己承認 block。(b) escalation (144) は `isSelfApproval` を**使わず** `currentActorId !== escalation.to` の「指名された裁定者本人か」チェック。両者はロジックが異なるため、operator 移設の扱いも分ける (§7)。

> **drift note**: dated roadmap (`remediation-roadmap-*`, `p0-remediation-plan-*`) は本番 RBAC/IdP を「R1-3 に carve」と記すが (`src/store/actors.ts:5`)、本契約は **IdP/RBAC エンジンを建てない**。下記 §「Right-sizing notes」が正準。

---

### 1. identity 方式の確定 (recommended default = 署名トークン)

| 決定軸 | 確定値 (recommended default) | 根拠 |
|---|---|---|
| identity 方式 | **署名トークン (signed token) を 1 択で採用** | サーバ権威 identity の最小実装。cookie/CSRF/session 再生成の機構が不要。demo は SPA + 単一バックエンドゆえブラウザ自動送信 (cookie) の利点が薄い。 |
| ヘッダ名 | `X-Operator-Token` (request) / 操作者切替応答は body で新トークン返却 | カスタムヘッダは CORS preflight 対象 = ブラウザが自動添付しない = CSRF 面を構造的に持たない。 |
| 署名・検証方式 | **HMAC-SHA256**。payload = `operator_id . issued_at . expires_at . jti`、token = `base64url(payload) . "." . base64url(hmac)`。secret = サーバ専用 env 1 本 `BOAI_SESSION_SECRET`。 | JWT issuer/JWK rotation 不要。lib は Node 標準 `crypto` のみ (新規 dep ゼロ)。**検証は stateless**: secret で再 HMAC して一致確認するだけ、DB lookup 不要。 |
| 期限 | `expires_at = issued_at + 30min` (short expiry)。期限切れは `denialReason='TOKEN_EXPIRED'` (HTTP 401) + 再 issue 要求 (SD-4)。 | **期限判定も stateless**: payload 内 `expires_at` を現在時刻と比較するのみ (`expired-token-rejected` は DB 不要)。refresh-token rotation は scope-out。 |
| replay 対策 | token は 30 分間 bearer として有効 (life 内は複数 request で再利用)。発行時に `jti` を **in-memory active-set (`Set<jti>`、default)** に記録し、同一 operator の再ログイン (新 token 発行) は直前の jti を **revoke** する。revoke された (stale) jti を持つ token は以降 reject。プロセス再起動で揮発 = demo 許容。 | replay reject を falsifiable にする**最小機構** (single-use-per-request ではなく revoke-on-reissue)。DB 列での永続は「再起動跨ぎ・複数プロセスの観測性」= production hardening ゆえ除外 (OD-3)。 |
| secret のバンドル非混入 | secret は server プロセス env のみ。Vite client bundle (`import.meta.env.VITE_*`) に**置かない**。検証 test = `dist/**` を grep して **secret の実値文字列** (test では既知の fixture 値) が 0 件。 | client 露出 = 即失格。test で機械的に保証。変数名 `BOAI_SESSION_SECRET` はそもそも server 専用で client bundle に出ない (検証対象にならない) ため、grep する pattern は**実値 (またはその指紋)** に固定する。 |
| audit actor source | サーバが署名検証後に resolve した `operator_id` (= `session_operator_id`)。`effective_actor_id` は request body で受け取り §3 の許可集合で検証。 | client 自己申告の actorId を audit に書かない (LIVE `logEvent` が `currentActorId` を信じる構造 `src/store/reducer.ts:52` をサーバ権威に置換)。 |

**署名トークン schema (decoded payload)**:

| field | 型 | 必須 | 意味 |
|---|---|---|---|
| `operator_id` | string | ✓ | 実操作者 (ログイン主体)。demo は固定集合 (例 `op-demo-1` / `op-demo-2`)。 |
| `issued_at` | ISO8601 | ✓ | 発行時刻。 |
| `expires_at` | ISO8601 | ✓ | 失効時刻 (`issued_at + 30min`)。 |
| `jti` | string (uuid) | ✓ | nonce。replay reject の主キー (in-memory active-set)。発行時に active 化、同一 operator 再ログインで直前 jti を revoke。 |

> token に `effective_actor_id` を**含めない**。persona は body で都度渡し、サーバが許可集合で検証する (token を persona ごとに再発行しない = demo の自由切替を安価に保つ)。SoD の真偽は `effective_actor_id` (body 由来・許可集合検証後) で判定する。1 人の実操作者が persona を切替えて入力↔承認を演じ分けると persona 単位の四眼原則は通過するが、`session_operator_id` (token 由来) が監査に併記され同一 operator が両ペルソナを演じた痕跡が透明に残る (bypass は隠蔽されず VISIBLE、§7)。

---

### 2. #9-2 — operator≠persona の二重 ID 記録 (常時)

四眼原則 demo の核心: **SoD は persona (`effective_actor_id`) 基準でサーバが判定する。1 人の実操作者が入力者ペルソナと承認者ペルソナを演じ分けると persona 単位の四眼原則は通過するが、監査に同一 `session_operator_id` が併記されるため bypass は隠蔽されず VISIBLE になる**。よって全 write 操作・全監査行に 2 つの ID を常時記録する。

| 記録 ID | 取得元 | 監査での意味 | 現状 LIVE との差分 |
|---|---|---|---|
| `session_operator_id` | 署名トークンの `operator_id` (サーバ権威) | 実際に手を動かした人。**監査 PROVENANCE 専用** — reviewer が「1 operator が両 persona を演じた」を検出する材料。SoD の比較キーではない。 | LIVE には存在しない (新規)。 |
| `effective_actor_id` | request body の `actorId` を §1/§3 許可集合で検証した値 | デモ上で演じているペルソナ (入力者/承認者/業務責任者)。**SoD の判定主体** (LIVE `currentActorId` と同主体)。表示・lineage も兼ねる。 | LIVE の `currentActorId` に相当するが、client 値ではなくサーバ検証後の値。 |

> **LIVE LedgerEvent との関係 (精密化)**: LIVE `LedgerEvent` (`src/store/types.ts:101-113`) は identity を表す列を **`actor` 名 1 つ** (103) だけ持つ (`role` (104) は actor から派生する 2 列目だが identity 本体ではない)。operator≠persona の分離は LIVE に**存在しない**。本契約はここに `session_operator_id` (新規) を加え、`effective_actor_id` を persona として明示する (= 監査行に operator と persona の両軸を持たせる)。

**不変条件 (常時成立)**:
1. `body.actorId` は identity (token 由来 `session_operator_id`) に**昇格しない**。許可集合検証後に `effective_actor_id` (persona) として扱う。`session_operator_id` は token からのみ。
2. SoD 判定 (`isSelfApproval` 相当) は `effective_actor_id` (persona) で行う。同一 persona が入力者承認→承認者承認を試みると reject。persona を切替えると persona 単位の四眼原則は通過する (= 単一 operator でも persona 切替で承認段階まで進む)。
3. 監査行には**両 ID を必ず併記**。同一 operator が両 persona を演じた痕跡が `session_operator_id` の重複として透明に残る (bypass は VISIBLE、block ではない)。
4. persona 切替 (`effective_actor_id` の変更) は `session_operator_id` を変えない (token 不変)。

**監査の operator≠persona 例 (demo の典型)**:

| event | session_operator_id | effective_actor_id | SoD 結果 |
|---|---|---|---|
| 入力者承認 (ready→待ち) | op-demo-1 | actor-inputter | OK |
| 承認者承認 (待ち→反映) を**同一 persona** で試行 | op-demo-1 | actor-inputter | **REJECT** (同一 persona = 自己承認、四眼原則) |
| 承認者承認を**別 persona** で試行 (同一 operator が演じ分け) | op-demo-1 | actor-checker | OK (persona 四眼原則は通過)。ただし両行の `session_operator_id` が op-demo-1 で一致 = 同一実操作者が両ペルソナを演じた痕跡が監査に VISIBLE |
| 承認者承認を別 operator で試行 | op-demo-2 | actor-checker | OK (persona も operator も別) |

> SoD は `effective_actor_id` (persona) 基準。1 operator が persona を切替えると persona 単位の四眼原則は通過し承認段階まで進む。これは「persona 切替だけで四眼原則を block する」のではなく、**「単一 operator による演じ分け」を監査が透明に記録 (`session_operator_id` の重複) して可視化する** honest-framing を**意図的に demonstrate** する仕様。bypass を block するのではなく VISIBLE にすることが核心価値。operator 切替 = 新 token 発行 = §3。

---

### 3. 切替 API (server-authoritative、`session/switchActor` の置換)

LIVE の `dispatch({type:'session/switchActor', actorId})` (`src/store/reducer.ts:245-247`) を以下に置換する。reducer の `session/switchActor` case は **client-local な表示 hint 更新のみ**に縮退 (SoD 判定からは切り離す)。

**endpoint は最小 2 本**。persona 切替は専用 endpoint を建てず、各 write request の body で都度渡してサーバが検証する (LIVE の persona switcher は単なる UI 状態で、SoD には影響しないため endpoint 化不要)。operator 切替だけは新トークン発行が必要 (HMAC 署名は server secret を要し client が自己発行できない) ゆえ issuer endpoint を 1 本持つ。

| method · endpoint | 用途 | request | response | エラー (denialReason enum、SD-4) |
|---|---|---|---|---|
| `GET /api/session/current-actor` | 現セッションの実操作者 + 許可 persona 集合の取得 | header `X-Operator-Token` | `{ session_operator_id, allowed_actors:[...], expires_at }` | `{ ok:false, denialReason:'TOKEN_INVALID' \| 'TOKEN_EXPIRED' }` (HTTP 401) |
| `POST /api/session/operator` | 実操作者切替 (demo login; 新 token 発行、jti 更新)。issuer endpoint。 | body `{ operatorId }` (demo 固定 2 名 op-demo-1/op-demo-2、コード内定数) | `{ token, session_operator_id, expires_at }` | `{ ok:false, denialReason:'UNKNOWN_OPERATOR' }` (HTTP 403、未知 operatorId) |

**persona 切替の扱い (endpoint なし)**:
- persona (`effective_actor_id`) は**全 write API の request body `{ actorId }`** で都度渡す。サーバは header token を検証して `session_operator_id` を resolve し、body の `actorId` を `allowed_actors` で検証して `effective_actor_id` とする。両者を監査行に記録する。
- demo の persona 自由切替は client 状態 (表示 hint) の更新のみで成立し、サーバ往復を要しない。サーバが persona を knowledge として保持する必要がない (operator≠persona の判定材料は write ごとに body から来る) ため。

**規律**:
- `actorId` を identity として受ける endpoint は**存在しない**。actor は表示ペルソナ専用で、各 write の body から検証付きで読む。persona 切替用の専用 server switch endpoint (`POST /session/switch` / `POST /session/actor` 等) は**建てない** (rejected alternative)。
- **全 endpoint boundary は zod schema (`.strict()`) で検証** (SD-5)。unknown-field は reject = mass-assignment 防御 (`denialReason='UNKNOWN_FIELD'`)。
- `allowed_actors` = **postv5 seeded actor 集合 = 3 operational (`DEMO_ACTORS`、`src/store/actors.ts:17-21`、`actor-inputter`/`actor-checker`/`actor-approver`) + ≥2 governance (`actor-gov-legal` / `actor-gov-compliance`、read-only role)**。governance actor も valid な `effective_actor_id` 値である (read-only role ゆえ mutation はしないが identity としては許可集合に含まれる)。不許可値は `denialReason='UNKNOWN_ACTOR'` (HTTP 403) で reject (LIVE の存在チェック `src/store/reducer.ts:247` をサーバへ移設・強化)。operational mutation test は 3 operational actor を、governance-boundary test (no-mutate / read-gate) は governance actor を使う。
- **persona と操作種別の関係 (LIVE 準拠で明示)**: LIVE reducer は操作を **role で制限しない** (`approveCase` 等は status + SoD のみを gate し、現 actor の role を見ない `src/store/reducer.ts:84-98,204-216,258-263`)。本契約も同様: **`allowed_actors` 内の operational actor なら全 persona で全 write を実行でき、操作の正当性は status precondition + persona (`effective_actor_id`) 基準 SoD だけが制御する**。「入力者承認は inputter persona のみ」のような role-gating は導入しない (production RBAC 方向ゆえ scope-out)。
- operator 集合は demo 固定 (例 `op-demo-1`, `op-demo-2`)。IdP/ログインフォームは作らない。operator は **コード内定数** (actors.ts の `DEMO_ACTORS` と同様、例 `OPERATORS = [op-demo-1, op-demo-2]`) で持ち、DB table は建てない (§5)。

---

### 4. body actorId 無視の証明 — 必須 test

各不変条件を falsifiable にするサーバ test。**いずれも reject/無視が観測できること**が blocking 完了基準。

> **denial response 規約 (SD-4 = enum is truth、P0 横断正準)**: 拒否応答の shape は `{ ok: false, denialReason: <ENUM> }`。test は **`denialReason` enum を assert** し、bare HTTP code は assert しない。HTTP は default 403 (authz/SoD/precondition 系の拒否)、IDOR existence-hiding のみ HTTP 404 + `denialReason='NOT_FOUND'`。**例外**: token 自体の認証失敗 (無効 HMAC・期限切れ) は authn 失敗ゆえ HTTP 401 を保持しつつ `denialReason` enum (`TOKEN_INVALID` / `TOKEN_EXPIRED`) を併せて返す (assert 対象は enum)。
> **入力検証 (SD-5 = zod)**: 全 endpoint boundary は zod schema (`.strict()`) で検証。unknown-field は reject (mass-assignment 防御)、`denialReason='UNKNOWN_FIELD'`。

| test 名 | 検証内容 | 期待結果 (assert = denialReason enum) | 対応する不変条件 |
|---|---|---|---|
| `body-actorId-not-promoted-to-operator` | token `operator_id=op-demo-1` で body `{ actorId:'actor-inputter' }` を渡し write → 監査行は `session_operator_id=op-demo-1` (token 由来、不変) かつ `actor_id=actor-inputter` (effective_actor_id、body 由来・許可集合検証後)。body の actorId を変えても `session_operator_id` は token から resolve され置換されない。 | body の actorId は `session_operator_id` (identity) に昇格しない。両 ID が分離記録される (assert: session_operator_id == op-demo-1 NOT NULL かつ actor_id == actor-inputter)。 | §2-(1) |
| `self-approval-rejected-by-persona` | (前提) token `operator_id=op-demo-1` で body `{ actorId:'actor-inputter' }` で入力者承認 → `input_approved_by=actor-inputter` 永続 (§5) → 同 persona で承認者承認を試行 (body `{ actorId:'actor-inputter' }`) | **REJECT** (SoD)。`denialReason='SELF_APPROVAL'` (HTTP 403)。SoD は `effective_actor_id` (persona) 基準で自己承認を block。 | §2-(2) |
| `persona-switch-passes-four-eyes-visibly` | 同 operator (op-demo-1) が persona を切替えて入力者承認 (`actor-inputter`) → 承認者承認 (`actor-checker`) | 承認は通過 (persona 四眼原則 OK)。両監査行の `session_operator_id` が op-demo-1 で一致 = 単一 operator の演じ分けが VISIBLE。assert: 2 行とも session_operator_id == op-demo-1。 | §2-(2)(3) honest-framing |
| `tampered-token-rejected` | HMAC を改竄した token で write | `denialReason='TOKEN_INVALID'` (HTTP 401、再 HMAC 不一致)。 | §1 署名検証 |
| `expired-token-rejected` | `expires_at` 過去の token で write | `denialReason='TOKEN_EXPIRED'` (HTTP 401、payload 内 expiry を現在時刻と比較、DB 不要)。 | §1 短期限 |
| `revoked-jti-rejected` | token A 発行 (`POST /api/session/operator`、jti_A active) → 同 operator 再ログインで token B 発行 (jti_A を revoke、jti_B active) → revoke 済の token A を reuse して write | reject。`denialReason='JTI_REPLAYED'` (in-memory active-set が jti_A の revoke = stale を検出)。token A は life 内でも再ログインで失効する (single-use-per-request ではなく revoke-on-reissue)。 | §1 nonce |
| `secret-not-in-bundle` | `dist/**` を grep し **secret の実値文字列** (test fixture の既知 secret) が 0 件 | 0 hit。変数名ではなく実値 (またはその指紋) を pattern にする。 | §1 secret 非混入 |
| `both-ids-in-audit` | 任意 write 後、`audit_events` 行に `session_operator_id` と `actor_id` (= effective_actor_id) が両方存在 | 両 field NOT NULL。 | §2-(3) |
| `unknown-actor-rejected` | write API body に `{ actorId:'actor-x' }` (`allowed_actors` = 3 operational + ≥2 governance の外) を渡す | `denialReason='UNKNOWN_ACTOR'` (HTTP 403、allowed_actors 検証)。 | §3 許可集合 |
| `unknown-field-rejected` | write API body に未知 field を含めて渡す (mass-assignment 試行) | `denialReason='UNKNOWN_FIELD'` (HTTP 403、zod `.strict()` が unknown-field reject)。 | §3 zod boundary |

---

### 5. データ契約 (新規列のみ。新規 table は建てない)

P0 全体で 1 つの DB を共有する前提。本契約は **identity 検証を stateless HMAC で行うため、専用 table を所有しない**。要求するのは「`audit_events` に `session_operator_id` 列 (provenance) を加えること」だけ。**SoD 比較は `effective_actor_id` (persona) 基準ゆえ LIVE の既存 persona/actorId 列 (`inputApprovedBy`/`forwardedBy`/`promotionRequestedBy`) をそのまま判定材料に使い、operator 基準の SoD 比較列は新設しない**。

#### 建てないもの (Right-sizing、理由付き)

| 候補 | 却下理由 | 代替 |
|---|---|---|
| `session` table (jti/operator_id/issued_at/expires_at/consumed) | HMAC は stateless 検証可能。expiry は payload 内 `expires_at` で判定でき、replay reject は in-memory `Set<jti>` 1 個で falsifiable。table 永続の唯一の正当化は「再起動跨ぎ・複数プロセスの観測性」= production hardening。control の demonstrate には不要。 | in-memory `Set<jti>` (OD-3 default) |
| `operator` table + FK + `created_at` | demo operator は 2 名固定。リレーショナル FK + テーブル化は identity store のミニチュア = IdP/RBAC へ滑る入口。 | コード内定数 `OPERATORS=[op-demo-1, op-demo-2]` (`src/store/actors.ts` の `DEMO_ACTORS` と同型) |

#### 要求する列 / blocking 完了基準 / approval owner

| 対象 table (所有契約) | 本契約が要求する列 | blocking 完了基準 | approval owner |
|---|---|---|---|
| `audit_events` (audit 契約所有、DDL は #8 が owner) | **`session_operator_id` (text, NOT NULL、provenance 専用)** + **`actor_id` (text FK, NOT NULL、= `effective_actor_id`)** が全 write 行で non-null。role は `actor_id->roles.label` で**派生** (列として保存しない)。 | `both-ids-in-audit` test green。LIVE `LedgerEvent` (`src/store/types.ts:101-113`) は identity 1 列 (`actor`、role は派生) → operator provenance (`session_operator_id`) / persona (`actor_id` = effective_actor_id、SoD 主体) の 2 軸へ拡張。 | Shinji + audit 契約 owner |
| case state (state/DB 契約所有) | **`input_approved_by` (text、= effective_actor_id = persona)** — LIVE 列をそのまま使用 | §7 の `case.input_approved_by === effective_actor_id` 比較材料 (persona 基準 SoD)。`self-approval-rejected-by-persona` test がこの列を読んで自己承認 reject を falsifiable にする。LIVE `inputApprovedBy` (actorId、`src/store/types.ts:37`) を流用 = 新規 operator 列は不要。 | Shinji + state 契約 owner |
| proposal state (state/DB 契約所有) | **`forwarded_by` (text、= effective_actor_id)** — LIVE 列をそのまま使用 | §7 の `proposal.forwarded_by === effective_actor_id` 比較材料。LIVE `forwardedBy` (actorId、`src/store/types.ts:70`) を流用。 | Shinji + state 契約 owner |
| agent state (state/DB 契約所有) | **`promotion_requested_by` (text、= effective_actor_id)** — LIVE 列をそのまま使用 | §7 の `agent.promotion_requested_by === effective_actor_id` 比較材料。LIVE `promotionRequestedBy` (actorId、`src/store/types.ts:82`) を流用。 | Shinji + state 契約 owner |
| case state (escalation、state/DB 契約所有) | LIVE の `escalation.to`/`from` (actorId = persona) をそのまま使用。新規列不要。 | escalation SoD は persona 軸の指名一致のまま据え置く (`effective_actor_id !== escalation.to`)。LIVE の `escalation.to`/`from` は actorId (persona、`src/store/types.ts:47`、seed.ts:56 `to:'actor-approver'`/`from:DEFAULT_ACTOR_ID`)。operator 基準には乗せないため operator 2 列は不要 (§7 / OD-5)。 | Shinji + state 契約 owner |

> **申請者 persona 列が判定材料な理由**: §7 の persona 比較は「過去に承認/送付/申請した persona (`effective_actor_id`)」を保存していて初めて成立する。LIVE の `inputApprovedBy`/`forwardedBy`/`promotionRequestedBy` (actorId = persona) がそのまま判定材料になり、自己承認系 SoD test (`self-approval-rejected-by-persona`) はこれを読んで falsifiable になる。四眼原則を **persona 基準**にする本契約では新規 operator_id 列は不要 — `session_operator_id` は audit provenance としてのみ記録する。

> **DB に新規 table を建てないため DDL block は本契約に無い**。要求列は上表の通り、所有契約 (audit / state) の table 定義に追記される。本契約は列の存在 + NOT NULL/比較可能性のみを要求する。

---

### 6. クライアント配線 (最小差分)

| 変更点 | LIVE | postv5 |
|---|---|---|
| token 取得 | なし | 起動時 `POST /api/session/operator { operatorId:'op-demo-1' }` → token をメモリ保持 (localStorage 不可)。 |
| 全 write fetch | なし (reducer 直接 dispatch) | `X-Operator-Token` header + body に現 persona `{ actorId }` を付与。401 → 再 issue → retry 1 回。 |
| persona 切替 (`session/switchActor`) | `dispatch(session/switchActor)` で `currentActorId` 更新 | **client hint のみ更新** (サーバ往復なし)。次の write で body `{ actorId }` として送られサーバが検証。 |
| `currentActorId` の役割 | SoD 判定主キー | **表示 hint のみ**に縮退。SoD はサーバ判定。 |
| localStorage | identity を含む store 全体を永続 | identity (token) は localStorage に置かない。 |

> reducer の `session/switchActor` (`src/store/reducer.ts:245-247`)・自己承認系の `currentActorId` 参照群 (93/214/262) はサーバ応答を反映する hint に降格。SoD の真偽値はサーバが返す。

> **真偽の権威 (source of truth、整合崩れ時の挙動を明示)**: SoD 判定材料 (LIVE persona 列 `inputApprovedBy`/`forwardedBy`/`promotionRequestedBy` = effective_actor_id・承認済 fact) は**サーバ DB を唯一の権威**とする。client localStorage は表示 hint (現 persona・楽観的 UI) のみを保持し、SoD には関与しない。両者が食い違う場合 (例 localStorage 改竄) は**サーバ判定が常に勝つ**: write はサーバ DB の persona 列と、body から許可集合検証した `effective_actor_id` で評価され、client 自己申告値は判定に入らない (`session_operator_id` は token から resolve され audit provenance に記録)。これにより「localStorage を書き換えて四眼原則を回避」は構造的に不可能。`body-actorId-not-promoted-to-operator` / `self-approval-rejected-by-persona` test がこの権威分離を falsifiable に保証する。

---

### 7. SoD 判定のサーバ移設 (LIVE helper の置換)

LIVE には SoD が **2 系統**ある。両者は別ロジックゆえ移設方針も分ける。

**(a) 自己承認系 (`isSelfApproval` 使用、3 箇所)** — `isSelfApproval(requesterId, currentActorId)` (`src/store/reducer.ts:74-76`) は client 値同士の比較。これをサーバの **persona (`effective_actor_id`) 基準**比較に置換する (client 自己申告 `currentActorId` ではなく、body から許可集合検証した `effective_actor_id` で判定 = LIVE と同主体だがサーバ権威化)。

| LIVE (client、isSelfApproval) | postv5 (server、persona 基準) |
|---|---|
| `cur.inputApprovedBy === state.currentActorId` (`reducer.ts:93`) | `case.input_approved_by === effective_actor_id` |
| `cur.forwardedBy === state.currentActorId` (`reducer.ts:214`) | `proposal.forwarded_by === effective_actor_id` |
| `cur.promotionRequestedBy === state.currentActorId` (`reducer.ts:262`) | `agent.promotion_requested_by === effective_actor_id` |

> 上 3 行の SoD は `effective_actor_id` (persona) で判定する (LIVE reducer の `currentActorId` と同主体)。同一 persona が入力↔承認を演じると reject。1 人の実操作者が persona を切替えると persona 単位の四眼原則は通過するが、`session_operator_id` (token 由来 provenance) が監査に併記され、同一 operator が両ペルソナを演じた痕跡が透明に残る (bypass は隠蔽・block されず VISIBLE = #9-2 の honest-framing)。`input_approved_by` 等の「申請者」記録は persona (`effective_actor_id`) を保存する (§5、LIVE 列流用)。

**(b) escalation 系 (`isSelfApproval` **不使用**、1 箇所)** — `currentActorId !== escalation.to` (`src/store/reducer.ts:144`) は「指名された裁定者本人か」のチェックで、自己承認系とはロジックが異なる。これは **persona 軸の指名一致**チェックであり、サーバ移設後も persona 基準のまま維持する (`effective_actor_id !== escalation.to`)。

| 軸 | LIVE | postv5 (persona 基準で維持) |
|---|---|---|
| 裁定者指名 (誰のロールが裁定するか) | `escalation.to` = persona (`reducer.ts:144`) | `effective_actor_id !== escalation.to` (persona のまま、指名は role 軸が自然) |
| 自己裁定 block (起票 persona ≠ 裁定 persona) | `currentActorId !== escalation.to` (persona で代理) | `effective_actor_id !== escalation.to` (同一比較を persona 軸で維持) |

> escalation の SoD は persona 軸の指名一致のまま据え置く (operator 基準には乗せない、OD-5 default)。LIVE の `escalation.to`/`from` は actorId (persona、`src/store/types.ts:47`、seed.ts:56 `to:'actor-approver'`/`from:DEFAULT_ACTOR_ID`) で、起票者と裁定者が別 persona である前提で「起票 persona ≠ 裁定 persona」を 1 比較で兼ねる。`session_operator_id` は escalation 監査行にも provenance として併記され、同一 operator が起票と裁定を演じた場合は痕跡が VISIBLE になる。operator 基準の追加列・追加比較は scope 外。

> escalation は persona 軸の指名一致のまま据え置く (`effective_actor_id !== escalation.to`)。本契約全体が SoD を persona (`effective_actor_id`) 基準に統一したため、自己承認系 3 箇所と同じ persona 軸で一貫する。operator 基準の追加列・追加比較は導入しない (§5 で新規 escalation operator 列は要求しない)。`session_operator_id` は escalation 監査行にも provenance として併記され、同一 operator の演じ分けは透明に残る。

---

### Open decisions

- **OD-1 (identity 方式: 署名トークン vs cookie session)** — recommended default = **署名トークン**。trade-off: 署名トークンは CSRF 機構不要・stateless 検証・secret 1 本で済むが、client が token を明示添付する配線が要る。cookie session は HttpOnly で XSS からの token 窃取に強いが、CSRF token / SameSite / session 再生成 / Secure 属性の machinery が増え demo には過剰。**reversibility: 中** (検証層を 1 module に閉じれば後から差替え可、ただし全 write fetch の header 付与配線は touch 範囲広め)。**判断者: Shinji**。
- **OD-2 (operator 数: 1 固定 vs 2 固定)** — recommended default = **2 (op-demo-1 / op-demo-2)**。理由: 四眼原則の「通過する」side を demo で見せるには 2 operator が必要 (1 のみだと最終承認が常に SoD で止まり、止まる側しか見せられない)。reversibility: 高 (コード内定数の行追加のみ)。**判断者: Shinji**。
- **OD-3 (nonce 保持: in-memory Set vs DB 列)** — recommended default = **in-memory `Set<jti>`**。`revoked-jti-rejected` を満たす最小は active-set 1 個で、これで control は falsifiable。DB 列 (`session.consumed` 等) の唯一の正当化は「再起動跨ぎ・複数プロセスの観測性」= production hardening 方向ゆえ **EXCLUDE**。demo はプロセス再起動で nonce が揮発して構わない (test は単一プロセス内で完結)。reversibility: 高。**判断者: Shinji**。
- **OD-4 (jti lifecycle: 失効の単位)** — recommended default = **revoke-on-reissue**。token は 30 分間 bearer として有効で、life 内は複数 request で再利用する (single-use-per-request ではない)。`jti` は発行時に in-memory active-set に記録し、**同一 operator の再ログイン (新 token 発行) が直前の jti を revoke** する。revoke 済 (stale) jti を持つ token は以降 reject。persona 切替は client hint 更新のみで token 不変ゆえ jti に影響しない (同一 token で複数回 persona を変える demo 操作を許すため)。reversibility: 高。**判断者: Shinji**。
- **OD-5 (escalation SoD の軸)** — confirmed = **persona 軸の指名一致のまま据え置く** (`effective_actor_id !== escalation.to`)。本契約は SoD 全体を persona (`effective_actor_id`) 基準に統一したため、escalation も自己承認系 3 箇所 (case/proposal/agent) と同じ persona 軸で一貫する。LIVE の `escalation.to`/`from` (persona 値) をそのまま使い、escalation 用の新規 operator 列・追加比較は導入しない。同一 operator の演じ分けは `session_operator_id` (provenance) の重複として監査に VISIBLE。reversibility: 高。**判断者: Shinji**。

### Right-sizing notes

- **建てるもの (control を demonstrate する最小)**: HMAC 署名検証 (Node 標準 `crypto`、新規 dep ゼロ、stateless) / 短期限 (payload 内 expiry 比較) + jti replay reject (**in-memory active-set、revoke-on-reissue**) / operator (provenance) ≠ persona (SoD 主体) の二重 ID 記録 / body actorId を `session_operator_id` (identity) に昇格させず許可集合検証後 `effective_actor_id` 化 / `audit_events` への `session_operator_id` provenance 列追加 (§5、SoD 比較は LIVE persona 列流用ゆえ新規 operator SoD 列なし) / §4 の 10 サーバ test。
- **建てないもの (production hardening = DEFECT 扱い)**: **`session` DB table** (HMAC stateless ゆえ不要、nonce は in-memory) / **`operator` DB table + FK** (demo 2 名はコード内定数) / IdP・ログイン UI・パスワード/MFA・OAuth/OIDC・JWT issuer + JWK rotation・refresh-token rotation・RBAC ポリシエンジン・permission マトリクス・role-gating (操作種別ごとの persona 制限)・session store クラスタ・rate limit/監視スタック・cookie session の CSRF 一式 (署名トークン採用時は不要)。
- **保全されるもの (postv5 で変えない)**: 「実 customer data なし / 実 AI なし / 実外部接続なし (mock)」。本契約が real 化するのは **identity の権威と SoD/audit の judge** だけ。
- **secret は env 1 本** (`BOAI_SESSION_SECRET`)。複数 secret・KMS・vault は scope-out。client bundle 非混入を test で機械保証 (実値文字列を grep)。
- **過剰実装シグナル (STOP & re-right-size)**: 新フレームワーク (Passport/NextAuth 等) 導入、permission 抽象層の増殖、operator を動的登録する管理 UI、`session`/`operator` の DB table 化 (stateless HMAC + in-memory nonce で足りるのに永続を建てる)、token に persona を埋めて persona ごと再発行する設計 (二重 ID 記録の意図に反する)、操作種別ごとの role-gating 導入 (LIVE は status+SoD のみ)。
