## P0 #9 — セキュリティ統制契約 (RBAC/IDOR・injection・audit 保全・破壊的操作)

**目的**: postv5 で追加する Node + better-sqlite3 + API backend について、`UI 非表示は統制ではない (client は untrusted)` を出発点に、認可・入力検証・audit 改竄防止・破壊的操作の 4 統制をサーバ側で完結させ、`統制を破る試みを拒否する server test` で falsifiable にする。production hardening (SIEM / anomaly detection / 本格 pentest / IdP) は本契約の defect として除外する。

> **right-sizing 原則 (本契約 全体の判定基準)**: 各統制は「規制レビュアーが coherent と認める最小実装 + それを破る試みを拒否する 1 本の server test」で足りる。`falsifiable にする artifact は rejection test であって、policy table / DB 抽象レイヤの存在ではない`。demo backend (~9 endpoint クラス × 3 固定 role) に対し、防御レイヤを積み増す (confirm-phrase + CSRF + audit-marker を 1 つの reset ボタンに重ねる等)、runtime 設定変更が無いのに policy を DB table 化する、実 PII が存在しないのに redaction tooling を足す — これらは production hardening drift = **defect** として除外/降格する。

> **前提 (server/test harness は未存在)**: LIVE は static SPA で server entrypoint が存在しない (server module なし)。LIVE の test 層は **全件 vitest 4.1 の in-process 実行** (`src/__tests__/`、31 files、supertest / node:test / HTTP client / fetch-mock は不採用)。本契約の server invariant/security test は **#5 と整合し、HTTP を立てず handler 関数を in-process で直接 invoke する (Vitest node project)** ことを default とする。したがって本契約の全 blocking 完了基準は **#1 server scaffold (handler module 確立) を precondition とする** (それまで「server test green」gate は vacuous)。real-HTTP smoke が必要な場合は、本 invariant 層ではなく **thin Playwright/e2e 層** に置く (OPEN DECISION D5)。

---

### 0. scope 境界 (本契約が own する範囲)

`#9` の全項目のうち、他契約に既に集約されたものは参照のみとし、本契約は **#9-3 / #9-4 / #9-5 / #9-6** を own する。

| #9 項目 | 帰属 | 本契約での扱い |
|---|---|---|
| #9-1 統制マトリクス | → P0 #4 | 参照のみ (各統制の SoD 意味論は #4 SSOT) |
| #9-2 actor identity | → P0 #3 | 参照のみ (`X-Operator-Token` 署名ヘッダ / `POST /api/session/operator` 発行 / dual-id (session_operator_id ≠ effective_actor_id) は #3) |
| #9-7 deploy baseline | → P0 #1 | 参照のみ (hosted 判定 env は #1) |
| #9-8 dependency | → P0 #7 | 参照のみ (better-sqlite3/zod 追加は #7) |
| **#9-3 RBAC / IDOR** | **本契約** | role middleware + object-level authorization |
| **#9-4 injection / 入力検証** | **本契約** | zod 境界検証 + prepared bindings + allowlist |
| **#9-5 audit 保全** | **本契約** | DB trigger + role-gate read + redaction (#8b と接続) |
| **#9-6 破壊的操作** | **本契約** | reset 既定無効 + CLI env-gate (P0 は HTTP reset surface なし、governance role gate は撤回 = SD-2) |

**現状 (LIVE) との drift**: ルート CLAUDE.md / prototype-redesign CLAUDE.md は「mock data + in-memory state のみ / 外部接続なし」と宣言している (prototype-redesign/CLAUDE.md「scope-out / JP-only」節)。本契約はこの宣言を **SoD/execute/audit の enforcement に限ってサーバ実装する** ものであり、`実 customer data なし / 実 AI なし / 実外部接続なし (mock)` は保持する。SSOT doc 側はこの enforcement 追加を反映する更新が #1 で必要 (drift flag)。

**actor identity の前提 (#3 から継承、dual-identity model)**: サーバは operator≠persona の dual-identity を解決する。`session_operator_id` = 検証済 `X-Operator-Token` (HMAC-SHA256 署名、payload = operator_id.issued_at.expires_at.jti、expiry 30 min、replay reject = in-memory `Set<jti>`) から得る実 operator。`effective_actor_id` = request body の `{ actorId }` を **`allowed_actors` (= seed 済 `actors` table 全件 = 3 operational `DEMO_ACTORS` (actors.ts:17-21) + ≥2 governance actors `actor-gov-legal` / `actor-gov-compliance` (role='governance')、計 5)** に照合した persona。unknown actorId は reject (`denialReason='UNKNOWN_ACTOR'`)。**`DEMO_ACTORS` (live const、actors.ts:17-21) は 3 operational actor のまま不変** — governance actor は const ではなく postv5 seed が `actors` DB 行として追加する。`effective_actor_id` の validation universe は `DEMO_ACTORS` (3) ではなく `allowed_actors` (5) である点が肝で、governance actorId が persona 検証 (layer 1) を通過して初めて governance-boundary gate (layer 2、後述) に到達できる (3 固定照合だと governance-boundary test が unreachable になる)。**UI persona switcher は 3 operational actor のまま** (demo flow は 入力者/承認者/業務責任者 を切替える)。governance は P3 governance view で操作し、operational switcher には現れない (= UI switch subset (3) を server validation rule に流用しない)。**body の `actorId` は `effective_actor_id` のみを設定し、`session_operator_id` を絶対に設定しない**。token 発行 = `POST /api/session/operator` (demo login、2 demo operators op-demo-1 / op-demo-2 は CODE CONSTANT であって DB table ではない)。persona 切替に専用 server switch endpoint は持たない (persona = client state + per-write body `{ actorId }` の server-side 検証、`POST /session/switch` / `POST /session/actor` は drop)。secret は単一 env var `BOAI_SESSION_SECRET` (BOAI_ACTOR_SECRET / DEMO_ACTOR_SECRET / BO_DEMO_SIGNING_SECRET / X-Actor-Id 等の別名は不採用)。OAuth/JWT issuer/IdP は不要 (本契約の over-engineering 判定対象)。

**LIVE の identity/SoD 根拠 (サーバ移植元)**:
- `ActorRole = 'inputter' | 'checker' | 'business-approver'` (actors.ts:7)、`DEFAULT_ACTOR_ID='actor-inputter'` (actors.ts:24)。
- `isSelfApproval(requesterId, currentActorId)` (reducer.ts:74-76) — 四眼原則の identity-SoD。案件 (inputApprovedBy)・提案 (forwardedBy)・設定 (promotionRequestedBy) で共用 (reducer.ts:93,214,262)。**これは identity SoD であって role 認可ではない** — 本契約 #9-3 が role 層を追加する。

---

### 1. RBAC / IDOR (#9-3)

**原則 (SD-2 right-sized 認可境界)**: 認可は三系統に分ける。(A) **governance-boundary gate** — governance role は READ-ONLY (全 mutation endpoint を reject)、かつ governance-only READ endpoint (`GET /api/audit-events`、model-governance reads、config-approvals reads) は governance role に gate し inputter/checker/business-approver を endpoint で reject する。(B) **operational execute actions** (inputter/checker/business-approver の 24 mutation) は **identity-SoD + prior-state のみ** で判定し、per-action の role gate を持たない。さらに (C) **object-level authorization** (IDOR) を全 endpoint に重ねる。`visible-route` (UI が描画するか) と `allowed-endpoint` (サーバが受理するか) を別概念として扱い、テストは常に endpoint-side rejection を検証する (UI 非表示に依存しない)。

#### 1-1. governance read-gate + operational execute マトリクス

LIVE の selector/reducer から各 endpoint クラスの判定根拠を逆算した。operational execute = 状態を前進/破壊させる mutation (identity-SoD + state のみ、role gate なし)、governance-read = 監査/モデルガバナンス/設定承認の参照 (governance role 限定)。

| endpoint クラス | 代表 endpoint | LIVE 由来 | 判定 (gate kind) | 拒否すべき試行 (テスト対象) |
|---|---|---|---|---|
| 案件 入力者承認 | `POST /api/cases/:id/approve {by:'input'}` | reducer.ts:87-90 | operational: identity-SoD + state (prior status 確認、`by=input` の precondition) | self-approval / prior-state 違反 |
| 案件 承認者承認 | `POST /api/cases/:id/approve {by:'checker'}` | reducer.ts:91-96 | operational: identity-SoD + state (`isSelfApproval(inputApprovedBy)` block) | inputApprovedBy と同一 actor の checker 承認 |
| escalation 裁定 | `POST /api/cases/:id/escalation/resolve` | reducer.ts:138-159 (identity-SoD: 裁定者=`escalation.to` のみ可、reducer.ts:144) | operational: identity-SoD + state (role gate なし) | 裁定者 (`escalation.to`) でない actor の裁定 |
| 設定承認 (昇格承認) | `POST /api/agents/:id/promotion/approve` | reducer.ts:258-264 (identity-SoD: `isSelfApproval(promotionRequestedBy)` のみ、reducer.ts:262) | operational: identity-SoD + state (role gate なし) | promotionRequestedBy と同一 actor の承認 |
| 提案 承認 | `POST /api/proposals/:id/approve` | reducer.ts:209-216 — identity-SoD のみ (`isSelfApproval(forwardedBy)`, reducer.ts:214) | operational: identity-SoD + state (role gate なし) | forwardedBy と同一 actor の承認 |
| 提案 差戻し | `POST /api/proposals/:id/sendback` | reducer.ts:226-234 — SoD なし / role なし (status 確認のみ) | operational: state のみ (LIVE 等価、role gate なし) | prior-status 違反 |
| 緊急停止/再開 | `POST /api/agents/:id/emergency-stop`・`/api/agents/:id/resume` | reducer.ts:275-312 — role 制約なし (`cur` 存在のみ、reducer.ts:279) | operational: STATE のみ (role gate なし、live reducer 等価) | prior-state 違反 (`cur` 不在) |
| 監査台帳 参照 | `GET /api/audit-events` | ObservatoryV2.tsx:39,52 (LIVE: 静的 fixture 表示、role gate なし) + types.ts:101 | governance-read: governance role 限定 (server-backed 化時の forward 要件) | inputter / checker / business-approver |
| モデルガバナンス 参照 | `GET /api/governance/models` | ObservatoryV2.tsx:14,273 (LIVE: 静的 MODEL_INVENTORY、role gate なし) | governance-read: governance role 限定 | inputter / checker / business-approver |
| 設定承認 list 参照 | `GET /api/config-approvals` | ConfigApprovalsV2.tsx:15 (LIVE: 派生 selector、role gate なし) | governance-read: governance role 限定 | inputter / checker / business-approver |

**※注 (LIVE 由来 列の読み方)**: `LIVE 由来` 列は LIVE が enforce する制約の正確な範囲を示す。operational execute 行の判定は **identity-SoD + prior-state のみ** で、本契約は LIVE に無い fine-grained role gate を ADD しない (SD-2)。LIVE が enforce するのは (a) 一部 mutation の identity-SoD (自己承認/自己裁定 block) と (b) prior-state precondition のみで、**ActorRole を inspect する execute 分岐は reducer に一切存在せず本契約も追加しない**。governance-read 行の role gate は read endpoint が server 化された時の forward 要件 (read endpoint は LIVE に存在しない、static SPA)。

> **(rejected alternative) 旧 D1 / D6 / D7 (fine-grained execute role gate)** — 旧版は emergencyStop に checker+business-approver role 層 (D1)、escalation 裁定・昇格承認に business-approver role 層 (D6)、提案承認/差戻しに business-approver role 層 (D7) を ADD する案だった。**SD-2 で却下**。これらは LIVE の live reducer 由来でない後付け role 層であり、operational execute は identity-SoD + prior-state のみで判定する。emergencyStop/resume は STATE-only (role gate なし、reducer.ts:279 等価)。governance read-gate (B) と object-level IDOR (C) のみが本契約の追加 enforcement。

#### 1-2. object-level authorization (IDOR)

LIVE の actor 絞り込みは **すべて client-side** (`useNotifications`/`useEscalations`)。これらが endpoint 化されると、別 actor の object を直接 ID 指定で取得できる IDOR が成立する。サーバは object の所有/宛先 field を currentActor と照合する。

**IDOR の判定原則**: cross-actor の object を直接 ID 指定で取得/変更する試みは `denialReason='NOT_FOUND'` (HTTP **404**、existence-hiding) で拒否する。照合 actor は **`effective_actor_id`** (検証済 body の persona) を server-resolved として用い、header/body の改竄は無効。

| IDOR ベクタ | LIVE の client-side 絞り込み | サーバ object-level rule | 拒否すべき試行 (テスト対象) | #3 依存 |
|---|---|---|---|---|
| 他人の通知 queue | `c.assignee === actor.name` (**氏名文字列**、hooks.ts:354) | `GET /api/notifications` は `effective_actor_id` 宛のみ返す。`assignee` を **actorId 正規化後**に照合 | actor-checker が actor-inputter 宛 sendback 通知を取得 | **依存あり** (氏名→actorId 正規化が前提、D4) |
| escalation 受信 (裁定者宛) | `escalation.to === currentActorId` (**actorId**、hooks.ts:384) | `GET /api/escalations/:id` は `escalation.to === effective_actor_id` のみ | actor-inputter が業務責任者宛 escalation を直接 ID 取得 | 依存なし (既に actorId key) |
| escalation 裁定結果 (起票者宛) | `escalation.from === currentActorId` (**actorId**、hooks.ts:390) | 裁定結果通知は `escalation.from === effective_actor_id` のみ | 起票者でない actor が他人の裁定結果を取得 | 依存なし (既に actorId key) |
| escalation 全件 inbox | `useEscalations` は **actor 絞り込み無し** (hooks.ts:426-435) | `GET /api/escalations` 一覧は object-level に未裁定 (`resolution===undefined`) かつ自身が関与する escalation のみ | 他人の escalation を直接 ID 取得 (object-not-owned) | 依存なし (既に actorId key) |
| 裁定の他人なりすまし | `currentActorId === escalation.to` (**actorId**、reducer.ts:144) | mutation でも server-resolved `effective_actor_id` で再判定 (body actorId 改竄無効) | body の actorId を escalation.to に詐称して裁定 | 依存なし (既に actorId key) |
| 自己承認 bypass | `isSelfApproval` (reducer.ts:74) | server-resolved `effective_actor_id` で `inputApprovedBy`/`forwardedBy`/`promotionRequestedBy` と照合 | inputApprovedBy と同一 actor が checker 承認 | 依存なし (既に actorId key) |

> **注意 (氏名照合の脆さ、依存範囲を限定)**: LIVE の **通知 queue ベクタ (row 1) のみ** 氏名文字列照合 (`c.assignee === actor.name`、hooks.ts:354) で、ここだけ `assignee` の actorId 正規化 (#3 依存) を要する。**escalation 系の全ベクタ (row 2-5) は既に actorId を canonical key に持つ** (`escalation.to`/`from`/`currentActorId`、hooks.ts:384,390・reducer.ts:144) ため、`effective_actor_id` 照合に直接 map できる。したがって escalation IDOR test (idor-direct-id-fetch / idor-actor-spoof-mutation) は #3 を待たず本契約単独で書ける。`#3 依存` 列で per-vector に分離した (D4 参照)。

#### 1-3. RBAC/IDOR contract table

| 成果物 (config 表現) | 必須要素 | blocking 完了基準 | approval owner |
|---|---|---|---|
| governance read-gate マッピング (1-1 の governance-read 行を表現。**typed const map をサーバコードに置く**) | `endpoint_class` / `http_method` / `path_pattern` (`/api/` prefix) / `gate_kind` (`governance-read`) / `live_ref` (file:line) | 全 governance-read endpoint (audit-events / governance/models / config-approvals) が governance role 限定で、非 governance role は endpoint で reject。全 mutation endpoint は governance role を reject (governance = READ-ONLY) | business-approver (統制 owner) + #4 owner |
| object → owner field マッピング (1-2 を表現。**typed const map をサーバコードに置く**) | `object_type` (case/escalation/notification/proposal/agent) / `owner_field` (assignee_actor_id / escalation_to / escalation_from) / `rule_kind` (read/mutate) / `live_ref` | 全 6 ベクタが定義され、object-level middleware が §1 で pin した denialReason + HTTP code を返す | business-approver + #4 owner |

> **right-sizing (config 配置の判断)**: governance read-gate と object→owner mapping は **サーバコード内の typed const map で表現する** (DB table 化しない)。`falsifiable にする artifact は rejection test であり、mapping の格納先 (DB table か const か) ではない`。DB table 化は migration + seeding + drift surface を増やすだけで、runtime 設定変更要件が無い demo では over-engineering。**operational execute (24 mutation) は per-action role gate を持たず identity-SoD + prior-state のみで判定する** (SD-2) ため、role→endpoint 許可 table 自体が不要。runtime config 変更が実要件になった時点で table 昇格を再検討する (現時点では非要件)。

**denial 応答の固定 (SD-4、falsifiable のため `denialReason` enum を assert)**:
- 応答 shape は `{ ok: false, denialReason: <ENUM> }`。テストは **bare HTTP code でなく `denialReason` enum を assert** する。
- **governance-boundary 拒否** (governance が mutation を呼ぶ / 非 governance が governance-read を呼ぶ) → 既定 HTTP **403** + `denialReason` (authz enum)。
- **operational SoD / precondition 拒否** (自己承認 / prior-state 違反) → 既定 HTTP **403** + `denialReason` (SoD / precondition enum)。
- **object-not-owned 拒否** (object は存在するが `effective_actor_id` のものでない) → HTTP **404** + `denialReason='NOT_FOUND'` (existence-hiding。id 推測による存在開示を防ぐ)。
- 各 test は 1 vector に対し 1 expected `denialReason` を assert する (enum の OR は禁止)。

**server test** (vitest、サーバ層に新設。LIVE の 31 test files [src/\_\_tests\_\_/] と同じ vitest 4.1 で記述。**handler を in-process で直接 invoke (Vitest node project)、HTTP client は立てない** [#5 整合]。**precondition: #1 server scaffold (handler module) 確立、D5**):

| server test 名 | 検証内容 | 期待 (`denialReason` を assert) |
|---|---|---|
| `governance-mutation-rejection.test` | governance role が任意 mutation endpoint を呼ぶ | `denialReason` (authz、403)、状態不変、audit_events 不変 |
| `governance-read-gate.test` | inputter/checker/business-approver が governance-read endpoint (audit-events / governance/models / config-approvals) を呼ぶ | `denialReason` (authz、403)、payload 漏洩なし |
| `idor-cross-actor-read.test` | actor-checker が actor-inputter 宛 `GET /api/notifications` (object-not-owned) | `denialReason='NOT_FOUND'` (404、存在秘匿)、他人 object 漏洩なし |
| `idor-direct-id-fetch.test` | 別 actor 宛 escalation を `:id` 直指定 GET (object-not-owned) | `denialReason='NOT_FOUND'` (404、route 非表示でなく endpoint 拒否、存在秘匿) |
| `idor-actor-spoof-mutation.test` | body actorId を escalation.to に詐称し resolveEscalation | `denialReason` (SoD、403)、server-resolved `effective_actor_id` で再判定 (body 非信頼) |
| `self-approval-server.test` | inputApprovedBy と同一 server-resolved actor が by=checker 承認 | `denialReason` (SoD、403。reducer.ts:93 の server 等価)、status 不変 |

---

### 2. injection / 入力検証 (#9-4)

**原則 (SD-5 zod 採用)**: 全 endpoint 境界 (`/api/` prefix) で params/query/body を **zod schema の `.strict()`** (#7 で dependency 追加、unknown-field reject = mass-assignment 防御、#4 の UNKNOWN_FIELD invariant を満たす) で検証。better-sqlite3 は `db.prepare()` の bind パラメータのみ使用 (SQL 文字列連結禁止)。検索/絞り込み/ソート/ページングは allowlist + server cap。mutation は command schema のみ受理し、entity 行の mass-assignment を禁止、未知 field を reject する。

#### 2-1. command schema (mutation の唯一の受理形)

mutation の受理 schema は LIVE の `StoreAction` union (types.ts:171-204) を SSOT とする。サーバは action ごとに zod schema を持ち、列挙された field のみ受理する (entity 行を直接 PATCH させない)。

| 検証対象 | LIVE 由来 | zod schema rule | 拒否すべき入力 (テスト対象) |
|---|---|---|---|
| `case/approve` の `by` | types.ts:172 | `z.enum(['input','checker'])` | `by:'admin'` 等の enum 外 |
| status 系 enum | data/types.ts (CaseStatus/ProposalStatus/TrustLevel) | サーバ enum と一致を強制 | 不正 status 注入 |
| 裁定 `resolution` | types.ts:176 | `z.enum(['proceed','sendback'])` | enum 外値 |
| reverse `kind` | types.ts:179 | `z.enum(['訂正','取消'])` | 任意文字列 |
| reason/category | reducer.ts:120,219 (required 化済) | `z.string().min(1).max(N)` | 空文字 / 過大長 |
| case/create body | types.ts:181-190 | 列挙 field のみ。`values: z.record(z.string())` だが `fieldLabels` allowlist 照合 | id 重複 (reducer.ts:181 冪等) / 未知 field |
| mass-assignment | — | entity の `status`/`inputApprovedBy`/`trust` 等を body から直接受けない | body に `status:'reflected'` を混入し状態詐称 |
| 未知 field | — | zod `.strict()` で unknown key reject | 余剰 key 注入 |

#### 2-2. 検索/絞り込み/ソート/ページング allowlist

LIVE の Observatory 証跡台帳 filter (ObservatoryV2.tsx:55-63) と検索 (`useSearchResults`、hooks.ts:285) を endpoint 化する際、自由入力を SQL に流さず allowlist 化する。

| パラメタ | LIVE 由来 | allowlist / cap | 拒否すべき入力 |
|---|---|---|---|
| `workflowName` filter | ObservatoryV2.tsx:31-35,57 (LEDGER_PROC) | 5 業務 + 'all' の enum allowlist (UC-BO-01〜05) | allowlist 外 workflow 名 |
| `action` chip filter | ObservatoryV2.tsx:53,57 | サーバ既知 action enum allowlist | 任意 action 文字列 |
| free-text 検索 `q` | ObservatoryV2.tsx:54,59 | prepared bind パラメタとして LIKE bind (連結禁止)、max length cap | `'; DROP TABLE` 等の SQL meta |
| sort key | (新設) | sort 可能 column の allowlist | 任意 column 名 (`ORDER BY` 注入) |
| pagination `page`/`size` | ObservatoryV2.tsx:36 (PAGE_SIZE=8) | `size` を server cap (例 ≤100)、`page` ≥0 int | 過大 size (resource 枯渇) / 負値 |

#### 2-3. injection contract table

| 成果物 (config 表現) | 必須要素 | blocking 完了基準 | approval owner |
|---|---|---|---|
| 各 endpoint の zod schema 登録簿 (**サーバコードの typed const、DB table 化しない**) | `endpoint` (`/api/` prefix) / `schema_name` / `strict` (zod `.strict()` で unknown-key reject) / `command_only` (mass-assignment 禁止) / `live_action_ref` (types.ts StoreAction 行) | 全 mutation endpoint が `command_only` かつ `.strict()`。全 24 StoreAction (types.ts:171-204) に対応 zod schema が存在 | #4 owner + #7 owner (zod 追加) |
| 検索/sort/filter の許可値 allowlist (**サーバコードの typed const**) | `param` / `allowed_values` (enum or リテラル集合) / `server_cap` (size 上限) / `bind_only` (prepared bind 強制) | 2-2 の全 5 パラメタが定義。`bind_only` 対象は文字列連結検出 lint で 0 件 | #4 owner |

> **right-sizing**: schema/allowlist も DB table ではなく **zod schema + typed const をサーバコードに置く** (#1-3 と同じ理由 — falsifiable artifact は rejection test)。

**server test** (handler を in-process で直接 invoke [Vitest node project]、HTTP client は立てない [#5 整合]。**precondition: #1 server scaffold [handler module] 確立、D5**):

| server test 名 | 検証内容 | 期待 (`denialReason` enum を assert、bare HTTP code でなく) |
|---|---|---|
| `input-enum-rejection.test` | enum 外 `by`/`resolution`/`kind`/status を送信 | non-2xx + `denialReason` (validation enum)、状態/audit 不変 |
| `mass-assignment-rejection.test` | body に `status`/`inputApprovedBy`/`trust` を混入 | non-2xx + `denialReason='UNKNOWN_FIELD'` (zod `.strict()` が command schema 外 key を reject。silent-ignore 分岐は不採用 — §2 原則の unknown-key reject と整合) |
| `unknown-field-rejection.test` | 余剰 key を mutation body に注入 | non-2xx + `denialReason='UNKNOWN_FIELD'` (zod `.strict()`) |
| `sql-injection-search.test` | `q`/sort/filter に SQL meta (`'`, `;`, `--`, `OR 1=1`) | 結果は bind 解釈 (literal 検索)、テーブル破壊なし、別 row 漏洩なし |
| `pagination-cap.test` | 過大 `size` | **server cap でクランプ** (例: `size>100` → 100、200 OK で件数上限) |
| `pagination-reject.test` | 負 `page` / 非 int `size` (型不正) | non-2xx + `denialReason` (validation enum、型/範囲不正は reject、クランプ対象外) |

> **right-sizing**: WAF / 汎用 injection スキャナは不要。代表的注入文字列を bind で literal 化することの証明 (server test 1 本) で十分。

---

### 3. audit 保全 (#9-5)

**原則**: `audit_events` テーブルを **append-only** とし DB trigger で UPDATE/DELETE を拒否 (#8b の WORM 契約と接続)。`GET /api/audit-events` は governance role のみ。`before_json`/`after_json` は allowlist + 全行 dump 禁止 (変更 field の前後値のみ)。reset が audit を消す場合は DB 再作成に限定し hosted では無効。**audit_events は書き込み行ごとに `session_operator_id` (token 由来) と `actor_id` (= `effective_actor_id`、検証済 body 由来) の両方を NOT NULL で記録する** (single operator が persona を演じる場合は seed で等値)。

**LIVE の現状**: `auditEvents` は in-memory の push-only 配列 (reducer.ts:66 `[...state.auditEvents, event]`)。これは「session 操作記録 (mock)」であり「backend の改竄防止/長期保持を主張しない」と honest disclaimer 済 (types.ts:8-11, persist.ts:5)。本契約は append-only を **DB 強制**へ昇格させ falsifiable にする。

**監査台帳 read gate は forward 要件 (現在の leak ではない)**: ObservatoryV2 の監査 tab / 証跡台帳は **静的 fixture を render している** — `useCrossLedger` は `[...CROSS_LEDGER, ...s.auditEvents]` で `data/mock-observatory` の静的台帳に live session 証跡を append するだけ (ObservatoryV2.tsx:13,16,39,52-63)。LIVE は server を持たない static SPA であり、**実 user data の漏洩は今日存在しない**。`confidence`/`beforeAfter` を role gate 無しで表示しているのは事実だが、その内容は mock fixture + 自セッションの操作記録に限られる。したがって本要件は **「`GET /api/audit-events` が server-backed になった時点で、監査 read を governance role に gate する」forward 要件**であり、現存 leak の closure ではない。同様にモデルガバナンス参照 / 設定承認 list 参照も LIVE は静的 fixture / 派生 selector で、read endpoint が server 化された時に governance role gate を ADD する。

#### 3-1. audit redaction allowlist (confidence は static governance 台帳に re-point)

**operational `audit_events` には `confidence` column を持たない** — LIVE の `logEvent` は operational 操作記録に confidence を埋めず `'—'` を入れる (confidence は real な値を持たない)。したがって confidence-redaction は operational audit ではなく、**confidence が real な静的 governance 台帳 `OBS_LEDGER` / `CROSS_LEDGER` (`data/mock-observatory`) に re-point する**。ここを server-backed の governance-read endpoint にする際に governance role gate を enforce する。`beforeAfter` (operational audit の状態遷移ラベル + reason) は LIVE shape を **そのまま維持する** (demo は実 customer data を持たないため [scope: `実 customer data なし (mock)`]、自由文字列 reason に redaction tooling を足すのは存在しない脅威への hardening = right-sizing 違反)。`role` は audit_events に **格納せず** `actor_id -> roles.label` で derive する (#8 owns DDL、後述)。

| 対象 | LIVE 由来 | redaction rule |
|---|---|---|
| operational `audit_events` の who/when/what (`actor_id` / `occurred_at` / `action` / `entity_*`) | reducer.ts logEvent | そのまま。`role` は格納せず `actor_id -> roles.label` で derive |
| operational `beforeAfter` (before_json / after_json) | types.ts:106 | **LIVE shape 維持** (状態遷移ラベル + reason を内包、reducer.ts が組み立て)。demo は実 PII を持たないため別 field 分離 / PII redaction は不要 (D3 撤回、後述) |
| `confidence` (static `OBS_LEDGER` / `CROSS_LEDGER` のみ) | types.ts:110 + `data/mock-observatory` | **governance role のみ** (operational audit_events には confidence column が無く `'—'`。confidence が real な static governance 台帳の read を server-backed 化時に governance gate — これが redaction allowlist の本体) |
| `doc`/`policy`/`approvalId` (static 台帳) | types.ts:107-109 | ID 参照のみ。全行 dump 禁止 |
| before/after の full-row | — | **禁止**: entity 全 row を JSON dump しない。変更 field の前後値のみ |

#### 3-2. audit 保全 contract table + DDL/trigger

| 成果物 | 必須要素 | blocking 完了基準 | approval owner |
|---|---|---|---|
| `audit_events` テーブル (append-only WORM、**#8 owns DDL**、本 #9 は保全観点で column set 整合を要件提示) | canonical columns (#8): `id` / `seq` (INTEGER UNIQUE、deterministic 順) / `entity_type` / `entity_id` / `case_id` (FK) / `actor_id` (FK、= `effective_actor_id`) / `session_operator_id` / `action` / `occurred_at` (tz ISO) / `before_json` / `after_json`。**`role` は格納せず `actor_id -> roles.label` で derive、`confidence` column は無し**。**`entity_type` CHECK は P0 では `('case','proposal','agent')` のまま** (CLI `db:reset-demo` は DB 再作成ゆえ reset marker 行を残さず、`'reset'`/`'system'` 等の entity_type 拡張は P0 では不要) | UPDATE/DELETE trigger が存在し reject。`actor_id` = server-resolved `effective_actor_id`、`session_operator_id` = token 由来 (両者 NOT NULL)。`seq` は単調増加で `occurred_at` 順序を保証 (下記 server-seq 規定) | business-approver + #8 owner |
| audit read gate + redaction (**サーバコードの typed const、DB table 化しない**) | `target` / `min_role` / `redact_kind` (none / governance-only) | static `OBS_LEDGER`/`CROSS_LEDGER` の `confidence` が `governance-only` (= governance role のみ)。operational audit_events は confidence column を持たず none。read endpoint は governance gate を enforce | business-approver + #4 owner |

> **right-sizing**: read policy も DB table ではなく typed const (理由は #1-3/#2 と同一)。redaction kind は `none` と `governance-only` のみ — demo に実 PII が無いため `pii` kind は不要 (D3 撤回)。

**DDL / trigger (better-sqlite3、#8 owns DDL、本契約は audit 保全観点で要件提示)**:

```sql
-- append-only WORM: UPDATE/DELETE を trigger で拒否 (#8 本体、本 #9 は保全要件として参照)
CREATE TRIGGER IF NOT EXISTS audit_events_no_update
BEFORE UPDATE ON audit_events
BEGIN SELECT RAISE(ABORT, 'audit_events is append-only'); END;

CREATE TRIGGER IF NOT EXISTS audit_events_no_delete
BEFORE DELETE ON audit_events
BEGIN SELECT RAISE(ABORT, 'audit_events is append-only'); END;
```

**server seq + ts determinism の扱い (#8/#6 に defer)**: LIVE の `auditTs(seq)` (reducer.ts:36-41) は `seq` から決定的に ts を生成する。**server 移行時もこの deterministic `auditTs(seq)` を移植し、tz-aware ISO-8601 に正規化して `occurred_at` に入れる。runtime wall-clock (`new Date()` 等) は使わない**。ts determinism の確定は #8/#6 owns (本契約は defer)。ordering 保証 = `seq` 昇順 = append 順。これにより append-only / ordering / immutable の 3 性質は `seq` 単調性 + UPDATE/DELETE trigger で falsifiable になる。

**server test** (handler を in-process で直接 invoke [Vitest node project]、HTTP client は立てない [#5 整合]。**precondition: #1 server scaffold [handler module] 確立、D5**):

| server test 名 | 検証内容 | 期待 |
|---|---|---|
| `audit-immutable.test` | `audit_events` を直接 UPDATE/DELETE | RAISE(ABORT)、行不変 |
| `audit-read-role-gate.test` | 非 governance role が `GET /api/audit-events` | `denialReason` (authz、403。governance のみ) |
| `audit-confidence-redaction.test` | 非 governance role が static `OBS_LEDGER`/`CROSS_LEDGER` 参照系 endpoint | `denialReason` (authz、403。confidence を含む governance 台帳は governance gate)。operational audit_events に confidence column が無いことも確認 |
| `audit-no-full-row-dump.test` | before/after に entity 全 row を期待 | 変更 field のみ、entity 全 row JSON dump なし |
| `audit-dual-id-recorded.test` | 任意 mutation 成功時 | `audit_events` 行に `session_operator_id` (token 由来) と `actor_id` (= `effective_actor_id`) が両方 NOT NULL で記録される |
| `audit-append-on-mutation.test` | 任意 mutation 成功時 | 1 行 append、`seq` = 直前 +1 で単調増加 (reducer.ts:66 の server 等価)、`occurred_at` は deterministic `auditTs(seq)` の tz-ISO、失敗 mutation は append 無し (reducer.ts:46 の no-op = logEvent 非呼出) |

> **right-sizing**: 暗号署名チェーン / 外部 WORM ストレージ / retention 自動削除は不要 (production hardening)。DB trigger で UPDATE/DELETE を拒否し test で証明するのが最小実装。長期保持/WORM の本格主張は #8b の scope。

---

### 4. 破壊的操作 (#9-6)

**原則 (最小 credible control)**: P0 の reset 契約は **CLI `db:reset-demo` のみ** (既定 DISABLED、env-gated、HTTP 非公開)。CLI は demo DB を再作成する (全 migration 再適用 + 再 seed)。これにより `audit_events` は EMPTY で start する — **reset の audit 行は残らず、`entity_type` 拡張も P0 では不要**。HTTP reset (`POST /api/admin/reset`) は **OUT-OF-P0**: もし将来追加するなら **`admin`/`system` role に属し、governance role ではない** (governance は SD-2 で strictly READ-ONLY ゆえ破壊的 write を authorize できない)。その場合に限り `audit_events.entity_type` 拡張が必要になるが、**P0 scope 外**であり P0 evidence の gate には含めない。

> **right-sizing (防御レイヤの積み増しを除外)**: 「表示データ初期化」という demo control 1 つに対し、role gate + confirm-phrase + double-submit CSRF + audit-marker + CLI env gate の **5 レイヤを重ねるのは production hardening drift**。control の唯一の仕事は「credible であること」なので、**最小 credible control = CLI `db:reset-demo` + `DEMO_RESET_ENABLED` env (既定無効) + env-unset で exit non-zero** で demonstrate できる。HTTP reset を governance role に gate する案は撤回 (governance = READ-ONLY、破壊的 write の authorizer にできない = SD-2 と矛盾)。`requires_confirm_phrase` / `requires_csrf` も **OPEN DECISION (optional) に降格** し blocking set から外す (HTTP reset は OUT-OF-P0)。

**LIVE の現状**: `store/reset` (reducer.ts:316-317 `return seed()`) + `clearPersisted()` (persist.ts:132-138) が ObservatoryV2 の「表示データを初期化」ボタンに **role gate 無し**で配線されている (ObservatoryV2.tsx:382)。全 actor がセッション操作 (承認/差戻し/起票/訂正) と audit を破棄できる。サーバ化後はこれが破壊的 endpoint になる。

#### 4-1. 破壊的操作 contract table

| 成果物 (config 表現) | 必須要素 (minimal) | blocking 完了基準 | approval owner |
|---|---|---|---|
| 破壊的操作の発動条件 (**サーバコードの typed const**) | `op` (db:reset-demo) / `default_enabled` (既定無効) / `transport` (cli 固定、HTTP なし) / `live_ref` | `db:reset-demo` 行は `default_enabled=false` (CLI、HTTP 経路なし、全 migration 再適用 + 再 seed)。HTTP reset 行は OUT-OF-P0 (追加するなら `admin`/`system` role、governance ではない) | business-approver + #1 owner (hosted env) |

`requires_confirm_phrase` / `requires_csrf` は **OPEN DECISION (optional)** であり minimal blocking set には含めない (D2 参照)。HTTP `POST /api/admin/reset` 自体が OUT-OF-P0 (下記)。

| 破壊的操作 | surface | enforcement (minimal) | server test 名 (blocking) | right-sizing note |
|---|---|---|---|---|
| DB 全 reset (CLI) | `npm run db:reset-demo` (default disabled、env-gated、HTTP なし、全 migration 再適用 + 再 seed) | 既定 DISABLED、`DEMO_RESET_ENABLED=true` + CLI のみ。HTTP 経路なし。再作成ゆえ `audit_events` は EMPTY で start | `reset-cli-disabled-by-default.test`・`reset-recreates-db-not-deletes-rows.test` | env 1 個で gate。reset audit marker は不要 (再作成で audit は空) |
| 表示データ初期化 (HTTP) | `POST /api/admin/reset` — **OUT-OF-P0** (LIVE ObservatoryV2.tsx:382 の操作は P0 では CLI 経由のみ) | **P0 では非公開**。追加するなら `admin`/`system` role + hosted-disabled + `audit_events.entity_type` 拡張が必要だが **P0 scope 外**。governance role には gate しない (READ-ONLY、破壊的 write を authorize できない) | (なし、OUT-OF-P0) | governance role gate は撤回 (SD-2 矛盾)。P0 evidence の gate にしない |

**server test** (blocking set。handler を in-process で直接 invoke [Vitest node project]、HTTP client は立てない [#5 整合]。**precondition: #1 server scaffold [handler module] 確立、D5**):

| server test 名 | 検証内容 | 期待 |
|---|---|---|
| `reset-cli-disabled-by-default.test` | env 未設定で `db:reset-demo` 実行 | **非ゼロ exit + 明示メッセージ + 書き込み 0** (no-op で正常終了させない — user が実行成功と誤認するのを防ぐ) |
| `reset-recreates-db-not-deletes-rows.test` | enabled CLI reset 実行 | DB 再作成 (全 migration 再適用 + 再 seed) のみ。trigger 経由の audit_events row DELETE は発生しない。再作成後 `audit_events` は EMPTY で start (reset audit marker 行は無い) |

> **OPEN DECISION D2 (HTTP reset と confirm-phrase / CSRF — すべて OUT-OF-P0)** — P0 の reset は CLI `db:reset-demo` (env-gated) のみで十分 demonstrate できる。HTTP `POST /api/admin/reset` は P0 では非公開。confirm-phrase + double-submit CSRF は単一ボタンへの belt-and-suspenders で right-sizing 原則の「防御レイヤ増殖」signal。**推奨既定 = HTTP reset を P0 に入れない**。将来 HTTP 公開する場合は `admin`/`system` role (governance ではない) + `audit_events.entity_type` 拡張を伴う別 scope であり、その時に SameSite=strict + double-submit token の軽量形 (framework 不要) を検討する。

> **right-sizing**: 破壊的操作の rate-limit / 多要素確認 / 承認ワークフロー化 / confirm-phrase / CSRF / HTTP role-gate は P0 最小実装に不要 (demo reset に対し過剰)。「CLI 既定無効 + env gate + 再作成 (audit を trigger 越しに DELETE しない)」を test で証明するのが最小 credible control。reset 成功 audit marker は不要 — CLI 再作成で `audit_events` は空から start する。

---

### Open decisions

- **D1 (緊急停止の許可 role) — (rejected alternative)、SD-2 で却下**: 旧案は kill-switch に checker + business-approver role 層を ADD するものだった。**SD-2 で却下** — emergencyStop/resume は **STATE-only** (role gate なし、reducer.ts:279 等価)。operational execute に fine-grained role gate を後付けしない。
- **D2 (HTTP reset と confirm-phrase / CSRF — すべて OUT-OF-P0)**: P0 reset = CLI `db:reset-demo` (env-gated) のみで十分。HTTP `POST /api/admin/reset` は **P0 では非公開** (追加するなら `admin`/`system` role + `audit_events.entity_type` 拡張、governance role には gate しない = SD-2 と矛盾)。confirm-phrase / CSRF も **推奨既定 = 採用しない** (HTTP reset が OUT-OF-P0 ゆえ moot)。将来 HTTP 公開時のみ SameSite=strict + double-submit token (framework 不要) を別 scope で検討。理由: 単一 demo ボタンへの防御レイヤ増殖は right-sizing 違反。可逆 (middleware 1 個)。
- **D3 (audit reason の field 分離) — 撤回**: 当初は PII redaction 容易化のため reason を `beforeAfter` から別 column へ分離する案だったが、**撤回**。理由: demo は実 customer data / 実 PII を持たない (scope: `実 customer data なし (mock)`) ため、free-text reason への PII redaction tooling は存在しない脅威への hardening。`beforeAfter` を LIVE shape のまま維持し、全 logEvent 呼出の refactor を回避する。redaction allowlist は confidence が real な static `OBS_LEDGER`/`CROSS_LEDGER` の governance-only gate のみをカバーする (operational audit_events に confidence column は無い、types.ts:98-99,110)。
- **D4 (氏名→actorId 正規化の帰属 — 依存範囲を限定)**: LIVE の **通知 queue ベクタのみ** 氏名文字列照合 (`c.assignee === actor.name`、hooks.ts:354) で #3 の actorId 正規化に依存する。**escalation 系の全ベクタ (idor-direct-id-fetch / idor-actor-spoof-mutation) は既に actorId を canonical key に持つ** (hooks.ts:384,390・reducer.ts:144) ため、`effective_actor_id` 照合に直接 map でき **#3 を待たず本契約単独で書ける**。**推奨既定** = 通知 queue test (`idor-cross-actor-read.test`) のみ #3 blocked、escalation IDOR test は #1 server scaffold (D5) のみ blocked。本契約全体が #3 に block されるわけではない。
- **D5 (server test の実行形態、新規)**: LIVE は server entrypoint も HTTP test client も持たない (supertest / fetch-mock なし、test 層は全件 in-process vitest)。本契約の全 server invariant/security test は **#1 server scaffold (handler module) が確立されるまで実行不能**。**推奨既定 = #5 と整合し、HTTP を立てず handler 関数を in-process で直接 invoke する (vitest 4.1、Vitest node project、LIVE と同一 runner、専用 HTTP framework 不要)**。supertest / HTTP-client は本 invariant 層では不採用。real-HTTP の smoke が必要なら **thin Playwright/e2e 層** に最小限置く (invariant 層には混ぜない)。実行形態の確定は #1 owner との合意事項、それまで全 blocking 基準は precondition 待ち。
- **D6 (escalation 裁定・設定承認の role 層) — (rejected alternative)、SD-2 で却下**: 旧案は escalation 裁定・昇格承認に business-approver role 層を ADD するものだった。**SD-2 で却下** — これらは **identity-SoD + prior-state のみ** で判定する (reducer.ts:144,262 等価)。fine-grained execute role gate は追加しない。
- **D7 (提案 承認/差戻しの role 層) — (rejected alternative)、SD-2 で却下**: 旧案は提案 承認/差戻しに business-approver role 層を ADD するものだった。**SD-2 で却下** — approve は identity-SoD + state、reject/sendback は state のみ (reducer.ts:214,217-234 等価)。fine-grained execute role gate は追加しない。

### Right-sizing notes

- 認可は (A) **governance-boundary gate** (governance = READ-ONLY、governance-read endpoint は governance role 限定) + (B) **operational execute = identity-SoD + prior-state のみ** (per-action role gate なし、SD-2) + (C) **object-level IDOR** の 3 系統。RBAC エンジン / policy DSL / ABAC / fine-grained execute role gate (旧 D1/D6/D7、rejected) は不要。governance read-gate と object→owner の mapping は **サーバコードの typed const** で表現 (DB table 化しない — falsifiable artifact は rejection test であって table の存在ではない)。「ハードコード禁止 / DB table SSOT」mandate は撤回。
- identity は #3 の dual-id model に乗る: `X-Operator-Token` (HMAC-SHA256、expiry 30 min、replay = in-memory `Set<jti>`) → `session_operator_id`、body `{ actorId }` → `effective_actor_id` (`allowed_actors` = seed 済 `actors` table 全件 = 3 operational `DEMO_ACTORS` + ≥2 governance actor = 5 に照合、unknown は `UNKNOWN_ACTOR` reject)。**`DEMO_ACTORS` live const (3) は不変、UI persona switcher も 3 operational のまま** (governance は P3 view 経由)。validation universe は `allowed_actors` (5)、persona 検証通過後に governance-boundary gate (governance = mutation 全 reject / governance-read のみ許可) が効く。token 発行 = `POST /api/session/operator`。secret = 単一 env var `BOAI_SESSION_SECRET`。IdP / OAuth / JWT issuer / 専用 persona switch endpoint は本契約の defect。
- injection 防御は **zod `.strict()`** 境界 (SD-5 採用、#7 で dependency 追加) + prepared bind + allowlist の証明 test。schema/allowlist も typed const (DB table 化しない)。WAF / 汎用スキャナ / 本格 pentest suite は除外。
- audit 保全は DB trigger (UPDATE/DELETE 拒否) + governance-gate read + static `OBS_LEDGER`/`CROSS_LEDGER` の `confidence` governance-only redaction (operational audit_events に confidence column は無い)。**`audit_events` テーブルだけは DB table が本来必要** (永続/trigger 強制が要件、column DDL は #8 owns、`role` は `actor_id->roles.label` で derive、`session_operator_id` + `actor_id` 両 NOT NULL)。read policy は typed const。暗号署名チェーン / 外部 WORM / 自動 retention / 実 PII redaction tooling (demo に実 PII 不在、D3 撤回) は除外。ts determinism は deterministic `auditTs(seq)` の tz-ISO を移植 (#8/#6 owns、runtime wall-clock は使わない)。
- 破壊的操作は P0 では **CLI `db:reset-demo` (env 既定無効) のみ**の最小 credible control。CLI は DB 再作成 (全 migration 再適用 + 再 seed) ゆえ `audit_events` は EMPTY で start し、reset audit marker 行は不要。HTTP `POST /api/admin/reset` は **OUT-OF-P0** (追加するなら `admin`/`system` role + `audit_events.entity_type` 拡張、governance role には gate しない = SD-2 READ-ONLY と矛盾)。confirm-phrase / CSRF も OUT-OF-P0 (D2)。rate-limit / SIEM / anomaly detection は除外。
- denial 応答は SD-4 enum: `{ ok: false, denialReason: <ENUM> }`。test は `denialReason` を assert (bare HTTP code でなく)。既定 403 (authz/SoD/precondition)、IDOR の existence-hiding のみ 404 + `denialReason='NOT_FOUND'`。
- schema lifecycle (#8/#6): `schema_migrations(version, name, applied_at, checksum)` で forward-only migration を boot 時に順次適用、各 migration は rollback NOTE を持つ。`db:reset-demo` は全 migration を再適用する (本契約は audit 再作成観点で参照)。
- 全統制の合格判定は「破る試みを拒否する server test が green」。test は **#5 と整合し handler を in-process で直接 invoke (Vitest node project、HTTP client なし)**、real-HTTP smoke が要るなら thin Playwright/e2e 層に置く。server module は LIVE 未存在ゆえ **#1 server scaffold (handler module) 確立を precondition とする (D5)**。監視スタック / alerting は postv5 scope 外 (production hardening)。
- 各 phase 粒度 = AI agent が数 PR で実装可能 (middleware + zod schema + trigger + test)。新 framework や抽象レイヤ (policy engine / DB-backed config registry) の増殖が見えたら STOP / re-right-size signal。
