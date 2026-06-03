## P0 #6 — DB 運用契約 (DB Operation Contract)

**Purpose**: server DB (better-sqlite3) の運用メカニクス（forward-only マイグレーション / 冪等 seed / `db:reset-demo` / audit_events append-only の運用層強制 / 1 トランザクション境界）を確定し、現行 client `persist.ts` の「version-bump + 不一致は静かに seed fallback で白画面化を防ぐ」挙動を server DB に忠実に写像する。**right-size**: forward-only + rollback NOTE + reset で足りる。online migration framework / zero-downtime / multi-env pipeline は作らない。

> **Scope 境界 (#8(f) との分担)**: 本契約は運用メカニクス（どう適用・冪等化・初期化・トランザクション化するか）を所有する。DDL の正規化・FK・列定義・enum CHECK・audit_events の **DB trigger 本体**は P0 #8 が所有する。本契約は #8 の成果物を「どう運用するか」だけを定義し、schema の中身は重複定義しない（衝突時は #8 の DDL を SSOT とする）。

---

### 写像の根拠（現行 client → server DB）

| 現行 client 挙動 | live 根拠 (file:line) | server DB への写像 |
|---|---|---|
| `SCHEMA_VERSION = 8`、schema 変更時に bump | `prototype-redesign/src/store/persist.ts:25` | `schema_migrations` テーブルで適用済 version を追跡。version 番号は migration ファイル連番に置換（単一整数 const → 追記型 ledger） |
| version 不一致 / shape 不正 / parse 失敗で**静かに seed fallback**（白画面化防止） | `persist.ts:88-100` (`loadPersisted`), `:95` (`parsed.v !== SCHEMA_VERSION \|\| !isStoreStateShape`) | server は「version 不一致＝起動失敗 (fail-fast)」が正しい。client の「壊れたら seed」は端末ローカルの defensive 挙動であり、server DB に**そのまま持ち込まない**（後述 OPEN-DB-3）。代わりに `db:reset-demo` で明示再生成 |
| shape guard で malformed state を弾く | `persist.ts:32-74` (`isStoreStateShape`) | server では DB schema 制約（NOT NULL / FK / CHECK、#8 所有）が同役割。アプリ層 shape guard は不要 |
| 冪等 seed（version 一致時は既存維持、不一致時のみ seed 投入） | `persist.ts:108` (同値再書き込み skip), `seed.ts:25-112` (`seed()`) | 冪等 seed: 既に seed 済の demo DB に再実行しても重複行を作らない（後述 §冪等 seed） |
| seed は CASE_LIST / PROPOSAL_LIST / AGENT_LIST から正規化し固定 fixture を投入 | `seed.ts:28-97` | 同一 fixture を server seed スクリプトへ移植（cardinality は #8 が SSOT） |
| 操作証跡は `auditEvents` に **push only**（更新/削除なし） | `types.ts:131` (append-only コメント), `reducer.ts:66` (`auditEvents: [...state.auditEvents, event]`) | `audit_events` テーブルへ INSERT only。UPDATE/DELETE API なし + DB trigger（trigger 本体は #8b 所有） |
| **audit を伴う** mutation = domain 状態変化 + 証跡 1 行を**同一 reducer 呼び出しで atomic に生成** | `reducer.ts:88-89`（approveCase → patchCase → logEvent を 1 return で連結）。**audit を伴わない** mutation は `patchProposal`/`patchAgent` を return するのみで `logEvent` 非呼出（`reducer.ts:204-234`, `:248-274`） | audit-emitting mutation のみ「domain 行 UPDATE/INSERT + `audit_events` INSERT」を **1 つの better-sqlite3 transaction** に包む。非 audit mutation は domain 行のみ（後述 §トランザクション境界 / 契約 4） |
| 決定的 ts（`Date.now` 不使用、`2026-05-30 18:00` + auditSeq） | `reducer.ts:34-41` (`auditTs(seq)`), `reducer.ts:54` (`ts: auditTs(state.auditSeq)`), `reducer.ts:66` (`auditSeq: state.auditSeq + 1`), `lib/dates.ts` `NOW_ISO='2026-05-30T18:00:00+09:00'` | demo clock 関数 (`auditTs`) は #8 が SSOT として移植。本契約は (a) audit_events INSERT がこの clock 値を使うこと、(b) **`auditSeq` 単調増分カウンタを server が永続/復元**して各 INSERT で `auditTs(seq)` を確定的に採番すること、を運用要件として所有する（後述 §auditSeq 運用） |
| 操作 actor は `currentActorId`（owner/fixtures ではなく store identity）から解決 | `reducer.ts:52` (`actorById(ev.actorId ?? state.currentActorId)`), `reducer.ts:74-76` (`isSelfApproval(requesterId, currentActorId)`) | server は dual-identity を request ごとに解決する。`session_operator_id` = verified token（`X-Operator-Token`）由来の real operator、`effective_actor_id` = request body `{ actorId }` 由来の demo persona（`allowed_actors`（5 = 3 operational + ≥2 governance）に対し server-side validate）。body の actorId は `effective_actor_id` のみ設定し `session_operator_id` には**決して**触れない（後述 §actor identity 解決）。audit 行の actor も SoD 判定も `effective_actor_id` 由来 |

> **drift note**: 過去の dated roadmap (`remediation-roadmap-*`, `p0-remediation-plan-*`) は SCHEMA_VERSION の途中段階（4/5/6 等）を記述する箇所があるが、live `persist.ts:25` は **8** が現値。本契約は live を採用する。

---

### §actor identity 解決（本契約が所有する運用要件）

audit 行の actor 列も SoD self-approval block も、すべて live の `currentActorId` 由来である（`reducer.ts:52` で actor を解決、`reducer.ts:74-76` の `isSelfApproval(requesterId, currentActorId)` で四眼判定）。server ではこれを dual-identity に写像する: `session_operator_id`（verified token の real operator）と `effective_actor_id`（validated body の demo persona）。したがって server は「この request はどの operator がどの persona で行ったか」を mutation 処理の**前に**確定できねばならない。これがないと audit-actor の正しさも self-approval block も DB-ops 層で falsifiable にならない。

**right-size**: full auth framework / IdP / RBAC engine は作らない（production hardening、除外）。**demo-only の署名付きトークン + persona body**で operator と acting persona を確定すれば十分。

| 項目 | 内容 |
|---|---|
| **メカニズム** | operator identity は HMAC 署名トークン `X-Operator-Token`（payload `operator_id.issued_at.expires_at.jti`、HMAC-SHA256、expiry 30 min）で運ぶ。検証 secret は**単一 env var `BOAI_SESSION_SECRET`**（全箇所同名、`BOAI_ACTOR_SECRET` / `DEMO_ACTOR_SECRET` / `X-Actor-Id` 等の旧名は使わない）。replay 拒否は in-memory `Set<jti>`（DB テーブルではない）。トークン発行は demo login `POST /api/session/operator`（2 demo operator `op-demo-1` / `op-demo-2` の CODE CONSTANT、DB テーブルではない）。persona は専用 server switch endpoint を**持たず**、client state + 各 write の body `{ actorId }` を server-side validate（`POST /session/switch` / `POST /session/actor` は作らない、rejected alternative）。OAuth/JWT issuer・IdP・session store・refresh token は**作らない** |
| **actor universe（2 層を混同しない）** | **persona validation（layer 1）の universe = `allowed_actors` = seed 済 `actors` テーブル全件 = 3 operational（`actor-inputter` 山田太郎 / `actor-checker` 鈴木課長 / `actor-approver` 業務責任者、live `DEMO_ACTORS` `actors.ts:17-21`、UNCHANGED）+ postv5 が seed する ≥2 net-new governance actor（`actor-gov-legal` / `actor-gov-compliance`、role='governance'）= **計 5 件**。各 endpoint 境界は zod schema（`.strict()`）で validate し body `{ actorId }` を `allowed_actors`（`actors` lookup）に対し検証、未知 actorId は reject（UNKNOWN_ACTOR）/ unknown field は reject（mass-assignment 防御。live `actorById` が undefined を返す `session/switchActor` no-op `reducer.ts:247` と整合）。**この検証 universe を「UI persona 切替の 3 operational」と同一視しない** — UI persona switcher は demo flow 用に 3 operational のみを切替え、governance は P3 governance view 経由で操作（operational switcher には出さない）。governance actorId が layer 1 を**通過**することで、governance-boundary test が layer 2（後述の governance reject）に到達できる。<br>**authorization（layer 2、別レイヤ）**: governance role は全 mutation を REJECT（read-only、SD-2）。operational role は identity-SoD + state guard で判定。operational mutation test は 3 operational を、governance-boundary test は governance actorId を使う |
| **audit/SoD への接続** | mutation 各行は `session_operator_id`（token 由来）と `effective_actor_id`（validated body 由来）の**両方を NOT NULL で記録**（単一 operator が persona を演じる seed では両者 equal）。(a) `audit_events.actor_id` = `effective_actor_id`、(b) `isSelfApproval` 相当の SoD 判定（申請者 vs `effective_actor_id`）の入力になる。case 承認 (`inputApprovedBy`) / proposal/approve (`forwardedBy`) / promotion 承認 (`promotionRequestedBy`) の 3 層すべてで同一 `effective_actor_id` を使う |
| **blocking 完了基準** | (1) 有効 token を持たない／不正署名／期限切れ／replay の mutation request が reject される server test green。(2) 異なる persona で承認した audit 行の `actor_id`（= `effective_actor_id`）がその persona になり `session_operator_id` が token operator になる server test green。(3) 申請 persona と同一 persona の承認 request が SoD で block される server test green（後述 契約 5-(3) と接続）|
| **STOP signal** | IdP 連携・role-permission マトリクス・複数 secret・token refresh・DB-backed session/replay テーブルを入れ始めたら STOP（demo に不要な production hardening） |

---

### §auditSeq 運用（本契約が所有する運用要件）

live の audit ts は `Date.now` を使わず `auditTs(state.auditSeq)`（`reducer.ts:36-41,54`）で決定的に生成され、各 audit-emitting mutation で `auditSeq` が +1 される（`reducer.ts:66`）。client では reducer 純粋性のため state に持つカウンタだが、server では**DB をまたいで単調増分する `auditSeq` を永続/復元する運用責務**が生じる。これは #8 の DDL（列定義）ではなく、本契約が所有する運用メカニクスである。

| 項目 | 内容 |
|---|---|
| **保持先** | server は `auditSeq` の現値を DB に持つ（既存 `audit_events` 行数からの導出、または専用 counter 行のいずれか。列の物理形は #8 と co-review）。プロセス再起動後も連番が継続すること |
| **採番規則** | audit-emitting mutation のみが `auditSeq` を消費し +1（live `reducer.ts:66`）。非 audit mutation（proposal/*・promotion/*・notification/*・session/switchActor・assign）は `auditSeq` を進めない |
| **seed/reset 整合** | 空 DB seed 直後は `audit_events` 0 行ゆえ `auditSeq` 初期値 = 0（live `seed.ts:110` `auditSeq: 0`）。`db:reset-demo` 後も 0 |
| **blocking 完了基準** | (1) seed/reset 直後 `auditSeq`==0 server test green。(2) audit-emitting mutation を N 回実行 → 生成 audit 行の `ts` が `auditTs(0..N-1)` と完全一致する server test green（決定的採番の falsifiable test）。(3) プロセス再起動後の次 audit-emitting mutation が連番を継続する server test green |

---

### 契約 1: マイグレーション方式（forward-only + rollback NOTE）

| 項目 | 内容 |
|---|---|
| **table 名** | `schema_migrations` |
| **必須列** | `version` INTEGER PRIMARY KEY（migration 連番、現行 `SCHEMA_VERSION=8` に対応する初期 baseline = `0001`）／ `name` TEXT NOT NULL（migration ファイル名）／ `applied_at` TEXT NOT NULL（demo clock 値、`NOW_ISO` 由来）／ `checksum` TEXT NOT NULL（適用した migration ファイルの hash。**適用時 (apply time) に migration ファイルの内容から計算して格納**する）。**＝ `schema_migrations(version, name, applied_at, checksum)`**（prompt #8(f) + cover ledger の canonical signature と一致、#8 / 05 / 07 / 09 と同型）。**right-size**: hash の compute + store のみが本契約の所有範囲。起動時 checksum 再計算による drift-on-startup 検知は別個の optional nice-to-have であり、起動失敗 gate にはしない（separately stated、production hardening への越境を避ける） |
| **migration 方式** | forward-only。`migrations/NNNN_*.sql` を連番昇順で適用。起動時に `schema_migrations.version` の max を読み、未適用 (version > max) のみを順に適用。各 migration は 1 transaction 内で「DDL/DML 適用 → `schema_migrations` に 1 行 INSERT」を atomic 実行 |
| **rollback NOTE** | 各 migration ファイル冒頭コメントに `-- ROLLBACK NOTE: <手順 or 不可理由>` を必須記載。**auto-rollback は実装しない**（down マイグレーションなし）。誤適用の復旧 = `db:reset-demo` で demo DB を再生成。production hardening（online migration / zero-downtime）は scope 外 |
| **blocking 完了基準** | (1) `schema_migrations` が存在し baseline `0001` が seed 済。(2) 起動時マイグレーション runner が「未適用のみ適用・既適用は skip」を満たす server test green。(3) **per-migration-file lint（CI gate、one-time check ではない）**: `migrations/` 配下の全 `.sql` を走査し、各ファイルに `-- ROLLBACK NOTE:` コメントが 1 件以上あること（mechanical: `migration file 数 == ROLLBACK NOTE を持つ file 数`）。authoring 時は baseline `0001` のみで 1==1 と trivial だが、これは将来 migration 追加のたびに走る恒久 lint であり、新規 migration が NOTE を欠けば fail させる（trivial pass を「検証済」と誤認しない）。(4) 同一 migration の二重適用が no-op（冪等）である server test green |
| **approval owner** | ガバナンス担当者（最終 user 承認 gate）。技術整合は #8 owner と co-review |

> rollback を auto 化しない理由: demo DB は単一・再生成容易（fixture から決定的）。down migration を書く工数 > 価値。これは production の irreversible データ移行とは前提が異なる（OPEN-DB-1 で default 固定）。

---

### 契約 2: 冪等 seed

| 項目 | 内容 |
|---|---|
| **table 名** | seed 対象 = `cases` / `proposals` / `agents`（+ それぞれの escalation/override 等の子データ、列定義は #8 SSOT）。seed は `audit_events` に **行を入れない**（live `seed.ts:109` `auditEvents: []` と一致、セッション操作証跡は空から始まる） |
| **必須列** | seed 投入は live fixture を権威 source とする: `cases` ← CASE_LIST（`seed.ts:28-43`、`workflowId` は `WORKFLOW_NAME_TO_ID` 解決 `seed.ts:12-23`、`business-approval-waiting` の seed case は `inputApprovedBy = DEFAULT_ACTOR_ID` `seed.ts:39`）／ seed escalations 5 件（4 未裁定 + 1 resolved、`seed.ts:48-65`）／ `agents` の `agent-direct-debit` のみ `promotionStatus='requested'` + `promotionRequestedBy=DEFAULT_ACTOR_ID`（`seed.ts:90-93`）／ `currentActorId` 初期 = `DEFAULT_ACTOR_ID`（`actors.ts:24` = `actor-inputter`） |
| **冪等性方式** | seed スクリプトは固定 id を持つ行を `INSERT ... ON CONFLICT(id) DO NOTHING`（または事前 `SELECT count` で skip）で投入。**再実行しても重複・上書きを起こさない**。fixture の id は決定的（CASE-2026-*, agent-*）なので冪等性が成立する。seed は明示コマンド/起動時 empty-DB 判定でのみ走る（既存 demo DB を黙って上書きしない） |
| **db:reset-demo との関係** | 冪等 seed = 「空 DB を埋める／既存を壊さない」。完全初期化は `db:reset-demo`（契約 3）が担当。両者は責務分離 |
| **blocking 完了基準** | (1) 空 DB に seed → `cases`/`proposals`/`agents` の行数が fixture cardinality と一致（**集計の絶対数 (CASE_LIST/PROPOSAL_LIST/AGENT_LIST の件数) は #8 SSOT** ゆえ本契約は「fixture 由来で一致」を要求し独自の数値は持たない）。(2) 同一 DB に seed を 2 回実行 → 行数・内容が 1 回目と完全一致する server test green（冪等の falsifiable test、#8 を待たず local に測れる）。(3) seed 直後 `audit_events` が 0 行（live `seed.ts:109` `auditEvents: []` 整合）。(4) **本契約が独自に local 検証できる決定的アンカー**（#8 を待たずに falsifiable）: (4a) seed escalation はちょうど **5 件 = 未裁定 4 + 裁定済 1**（未裁定 = `CASE-2026-0145/0201/0231/0241` の `escalation.resolution===undefined`、裁定済 = `CASE-2026-0120` の `escalation.resolution==='proceed'`、`seed.ts:48-65`）。(4b) `agent-direct-debit` のみ `promotionStatus='requested'` + `promotionRequestedBy=actor-inputter`、他 agent は `'none'`（四眼原則 demo の前提、`seed.ts:90-93`）。(4c) `business-approval-waiting` の seed case は `inputApprovedBy=actor-inputter`（`seed.ts:39`）。(4d) `currentActorId` 初期 = `actor-inputter`（`seed.ts:106`, `actors.ts:24`）|
| **approval owner** | ガバナンス担当者（fixture 内容の honest 性）。cardinality 整合は #8 owner |

---

### 契約 3: `db:reset-demo`

| 項目 | 内容 |
|---|---|
| **table 名** | 全 domain テーブル + `audit_events` + `schema_migrations`（demo DB ファイル全体を対象） |
| **必須列** | P0 reset 契約 = **CLI コマンド `npm run db:reset-demo` のみ**（`package.json` scripts に追加、現行 build script 群 `dev/build/lint/check:*/test` `package.json` と同列、default 無効・env-gated・**HTTP 非経由**）。動作: demo DB ファイルを drop/再作成 → 全 migration を `0001` から再適用 → 冪等 seed を投入。結果は決定的（同一 fixture + demo clock）で毎回同じ DB。CLI が DB を再生成（migration 再適用 + 冪等 seed）するため reset 後 `audit_events` は**空から始まる**（reset audit 行なし）。よって P0 では `audit_events.entity_type` CHECK は `('case','proposal','agent')` のまま拡張不要（reset marker を持たない、#8 SSOT）。`/session/reset` 等の旧名は使わない（rejected alternative）。**HTTP `POST /api/admin/reset` は P0 では作らない / blocking evidence に gate しない** — governance は厳格に read-only（SD-2）ゆえ reset authorizer になれず（「governance は全 mutation を reject」と矛盾する）、governance-role gate + reset-success audit marker は P0 から除外。HTTP reset を将来足す場合は **OUT-OF-P0** であり、別の `admin`/`system` role（governance ではない）に属し `audit_events.entity_type` 拡張も要するが、これは P0 scope 外（gate しない） |
| **client 等価物** | `clearPersisted()`（`persist.ts:131-139`, `localStorage.removeItem`）+ 次回 seed の組合せに対応。client の「表示データを初期化」reset がこの server コマンドに写像される |
| **冪等性** | reset は何度実行しても同一終端 DB（drop → migrate → seed が全て決定的）。失敗時は中間状態を残さない（reset 自体を 1 transaction か、ファイル丸ごと再生成で atomic に） |
| **blocking 完了基準** | (1) `npm run db:reset-demo` が exit 0 で完走。(2) reset 後の DB が「全 migration 適用済 (`schema_migrations.version` == 最新) + seed 済 + `audit_events` 0 行」を満たす server test green。(3) 操作で汚れた DB（承認/差戻し済）に reset → seed 直後状態へ確実に戻る server test green。(4) reset を連続 2 回 → 2 回目も同一終端（決定性） |
| **approval owner** | ガバナンス担当者。CI/deploy への組込み可否は #9 deploy baseline と co-review |

---

### 契約 4: audit_events append-only enforcement（運用層）

| 項目 | 内容 |
|---|---|
| **table 名** | `audit_events`（列・DB trigger 本体は #8b SSOT、本契約は運用層の禁止事項を所有） |
| **必須列（運用契約として保証する不変条件）** | (1) **API 表面に audit_events への UPDATE/DELETE エンドポイントを一切作らない**（INSERT は mutation transaction 内のみ、read は `GET /api/audit-events` のみ）。(2) アプリ層のどの mutation も `audit_events` を `INSERT` でしか触らない（live `reducer.ts:66` の push-only を server 化）。各 INSERT 行は `session_operator_id`（token 由来）と `actor_id`（= `effective_actor_id`、validated body 由来）を共に NOT NULL で持つ。(3) DB trigger による UPDATE/DELETE 拒否は #8b が実装し、本契約は「trigger が存在し API がそれを破る手段を提供しない」ことを運用要件として宣言・参照する |
| **honest framing** | これは backend の WORM / 改竄防止 / 長期保持 (retention) を主張するものではない。live `types.ts:9-11` / `persist.ts:3-5` の通り「このセッション・この DB 内の操作記録 (mock)」であり、Observatory に honest disclaimer を併記する（D2 継承）。append-only は「セッション内で証跡が後から書き換わらない」ことの実証であって、規制グレードの WORM ではない |
| **blocking 完了基準** | (1) `audit_events` に対する UPDATE / DELETE を試みる server test が**拒否される**（falsifiable: API 経由・直 SQL 経由とも、後者は #8b trigger で拒否）。(2) mutation API endpoint 一覧に audit_events の update/delete route が 0 件（mechanical: route grep）。(3) **audit を伴う mutation**（後述 §audit-emitting set の 12 種）が成功 → `audit_events` が**ちょうど +1 行**増える server test green（live `reducer.ts:66` の 1-event-per-emitting-mutation と整合）。(3b) **audit を伴わない mutation**（proposal/forward・approve・reject・sendback / agent promotion request・approve・sendback / notification/markRead・markAllRead / session/switchActor / case/assign）が成功 → `audit_events` が**変化しない (+0)**（live でこれらは `logEvent` 非呼出、`reducer.ts:204-234,248-274` 他。"任意 mutation → 必ず +1" は live で偽であり、忠実な server で fail するか存在しない emission を捏造させる criterion なので採らない）。(4) guard で no-op になった操作（live `reducer.ts:88` precondition 不一致や `:93` self-approval block）では `audit_events` が**増えない (+0)**（live `reducer.ts:46` 「実際に起きた状態変化だけが残る」と整合）|
| **approval owner** | ガバナンス担当者（証跡保全の honest 性が規制レビュー核心）。trigger 実装は #8b owner |

---

### 契約 5: トランザクション境界

| 項目 | 内容 |
|---|---|
| **table 名** | 全 mutation（対象 domain テーブル）+ `audit_events` |
| **必須列（規則）** | **audit を伴う mutation = domain 行の update/insert + `audit_events` への INSERT を、ただ 1 つの better-sqlite3 transaction に包む**。`better-sqlite3` の `db.transaction(fn)` で wrap し、関数内のいずれかが throw すれば全体 rollback（domain 変更も証跡も両方なかったことになる）。これは live reducer が「patchCase → logEvent を 1 つの純粋関数 return で atomic に生成」する（`reducer.ts:88-89` ほか audit-emitting mutation 同型）挙動の server 等価物。**audit を伴わない mutation は domain 行 update のみ**で `audit_events` を触らない（依然 1 transaction で包んでよいが INSERT 対象は audit_events を含まない） |
| **対象 mutation（live `reducer.ts` の `logEvent` 呼び出し = ちょうど 12 箇所、grep 確認済）** | **audit-emitting mutation（= transaction が audit_events INSERT を含む）**: case/approve の **input path**（`reducer.ts:89`「入力者承認」）+ **checker path**（`:95`「承認者承認」）／ case/override（`:114`）／ case/sendback（`:125`）／ case/escalate（`:136`）／ case/resolveEscalation の **proceed path**（`:148`）+ **sendback path**（`:158`）／ case/reverse（`:176`）／ case/create（`:194`）／ case/reprocess（`:202`）／ agent/emergencyStop（`:287`）／ agent/resume（`:306`）。**＝ 12 emit site**（case/* が 10、agent/* が 2）。<br>**domain-only mutation（audit_events を伴わない、`logEvent` 非呼出）**: proposal/forward（`:204-208`）・proposal/approve（`:209-216`）・proposal/reject（`:217-225`）・proposal/sendback（`:226-234`）／ agent/requestPromotion（`:248-257`）・agent/approvePromotion（`:258-264`）・agent/sendbackPromotion（`:265-274`）／ notification/markRead（`:235`）・notification/markAllRead（`:240`）／ session/switchActor（`:245`）／ case/assign（`:160`）。これらは live で `patchProposal`/`patchAgent`/状態更新を return するのみで `logEvent` を呼ばない（grep: lines 204-234・248-274 に `logEvent` 0 件）。<br>**注**: 以前の本契約は対象集合に proposal/* と promotion/* を含めて「12 箇所」と称し count と enumeration が矛盾していた。live を真とし、proposal/* と promotion/* を domain-only 側へ移動した。case/bulkApprove は `approveCase` 経由で **1 件あたり** 上記 input/checker path を再利用し件数分の audit を emit（`reducer.ts:162-163`） |
| **rollback 整合 / SoD reject 方式（denialReason enum truth）** | mutation の precondition 違反 / SoD 違反（live `reducer.ts:88` status guard・`:93` self-approval block・`:144` escalation.to 不一致）は **transaction を開始する前に検証し `{ ok: false, denialReason: <ENUM> }` で reject する**（domain も audit も一切触らない）。live client は reducer が unchanged state を return する silent no-op だが、これは「UI が再描画しないだけ」の端末ローカル挙動。server では blocked self-approval を **denial response（`denialReason` enum、domain 不変・audit_events +0）に pin** する — silent `200`-unchanged だと「弾かれたのか成功して変化が無かったのか」が区別できず統制が falsifiable にならないため。HTTP code は authz/SoD/precondition denial で default `403`、IDOR existence-hiding のみ `404`（`denialReason='NOT_FOUND'`）。**test は HTTP code をそのまま assert せず `denialReason` enum を assert する**（旧 `422` pin は drop、SD-4）。これは OPEN-DB-3 と同じ「白画面防止の no-op を server 文脈で正しく translate（≠単純コピー）」判断 |
| **blocking 完了基準** | (1) audit-emitting mutation 内で audit INSERT を意図的に失敗させた fault-injection server test で、domain 行も rollback され**変更が 0**（atomic の falsifiable test）。(2) 成功した audit-emitting mutation 1 回 = domain 行変化 1 + audit_events +1 が同一 transaction（test で commit 後にのみ両方観測）。domain-only mutation 1 回 = domain 行変化 1 + audit_events **+0**。(3) precondition/SoD 違反 mutation は **non-2xx + `denialReason` enum を返し**（HTTP code 自体は assert せず enum を assert）domain も audit_events も**不変 (+0)**（live no-op の server translate、上記 pin）。(4) `db.transaction` を使わず生 INSERT を並べた mutation handler が 0 件（mechanical: mutation handler grep で `db.transaction` ラップを要求）|
| **approval owner** | ガバナンス担当者（atomic 性 = 証跡と状態の不一致が起きない保証が統制核心）。実装整合は #8 / #9-1 mutation table owner と co-review |

---

### Open decisions

- **OPEN-DB-1（forward-only に down migration を付けないか）** — 推奨 default: **付けない（rollback NOTE のみ）**。rationale: demo DB は fixture から決定的に再生成でき、`db:reset-demo` が復旧手段になる。down migration の保守コスト > 価値。reversibility: **高**（後から特定 migration に down を追加するのは独立 task、既存 forward path に無影響）。production を見据える段階で再検討。
- **OPEN-DB-2（demo DB ファイルを git 追跡するか、起動時生成か）** — 推奨 default: **git 追跡しない / 起動時に空 DB を検出して migrate+seed**。DB path は env-driven `DB_PATH`（dev default `prototype-redesign/server/data/dev.sqlite`、gitignored。hosted/stakeholder demo は `DB_PATH` を repo tree 外に向ける）。startup test は「DB ファイルが gitignored かつ `git ls-files` に出現しない（commit-safety）」を assert（厳密な「物理的に repo tree 外」ではない）。rationale: バイナリ DB を commit すると diff 不能・schema drift の温床。決定的 seed があるので追跡不要。reversibility: **高**（`.gitignore` 1 行の変更）。
- **OPEN-DB-3（server 起動時に version 不一致を fail-fast にするか、client 流に seed fallback するか）** — 推奨 default: **fail-fast（マイグレーション未適用は起動エラー、黙って seed しない）**。rationale: client の silent seed fallback（`persist.ts:95`）は「端末ローカルで白画面を避ける」ための defensive 挙動。server で同じことをすると「壊れた本番 DB を黙って空に上書き」になり危険。明示 `db:reset-demo` で再生成する。これは client の意図（白画面防止）を server 文脈で正しく translate した判断であり、写像の単純コピーではない。reversibility: **中**（起動 path の挙動分岐、test と共に変更が要る）。
- **OPEN-DB-4（reset / seed を CI・deploy に自動組込みするか）** — 推奨 default: **手動コマンドのみ（CI 自動 reset はしない）**。rationale: demo 中に誤 reset すると操作証跡が消える。deploy baseline は #9 が所有するため、自動化判断は #9 と束ねる。reversibility: **高**（後から CI step 追加は独立）。

---

### Right-sizing notes

- **採用した最小化**: forward-only + rollback NOTE（コメント）+ `db:reset-demo` のみ。down migration / online migration framework / zero-downtime / multi-env (dev/stg/prod) migration pipeline は**全て除外**。demo DB が決定的再生成可能という前提でこれで十分。
- **採用した最小化**: 冪等性は `ON CONFLICT DO NOTHING` + 固定 id で達成。マイグレーション state machine やバージョン互換マトリクスは作らない。
- **採用した最小化**: append-only は「API に update/delete route を作らない + #8b trigger」の 2 線で足りる。証跡署名 / hash chain / WORM ストレージ / retention policy engine は production hardening として**除外**（honest disclaimer で「セッション記録 mock」と明示するのが正しい right-size）。
- **採用した最小化（actor identity）**: operator は HMAC 署名トークン `X-Operator-Token` + 単一 env var secret `BOAI_SESSION_SECRET`、persona は client state + body `{ actorId }` の server-side validate（zod `.strict()`）に限定（§actor identity 解決）。replay 拒否は in-memory `Set<jti>`、login は `POST /api/session/operator`。IdP / OAuth / JWT issuer / RBAC engine / DB-backed session store / 専用 persona switch endpoint は production hardening として**除外**。SoD/audit-actor を falsifiable にするのに必要な最小機構だけを所有する。
- **採用した最小化（auditSeq）**: 決定的 ts のため `auditSeq` 単調カウンタの永続/復元のみ所有（§auditSeq 運用）。これは clock 値の SSOT (`auditTs` 関数) とは別の「運用カウンタ」で、#8 の DDL ではなく本契約の責務。署名/版管理付き event store などは作らない。
- **STOP signal として監視すべき over-engineering**: (a) migration に down/up 双方向 framework を導入し始めたら STOP。(b) audit に署名・改竄検知・hash chain を足し始めたら STOP（WORM 主張は honest framing 違反でもある）。(c) reset/seed に環境別分岐や外部 secret manager を入れ始めたら STOP。(d) actor identity に IdP 連携 / role-permission マトリクス / token refresh / 複数 secret / DB-backed session・replay テーブル / 専用 persona switch endpoint を入れ始めたら STOP。**secret は env 1 個原則**（本契約が持つ secret は operator token 署名検証用の単一 env var `BOAI_SESSION_SECRET` のみ、それ以上は持たない）。
- **#8 との重複回避**: 列定義・FK・enum CHECK・trigger 本体・seed cardinality 数値は #8 を SSOT として**重複記載しない**。本契約はそれらを「どう運用するか」のみ。重複が生じたら #8 を真とし本契約を引用に留める（SSOT 単一化）。
