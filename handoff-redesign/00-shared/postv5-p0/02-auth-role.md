## P0 #2 — Auth-role taxonomy (persona → 3 target roles)

**目的**: postv5 で四眼原則 (SoD) / propose・execute 分離 / 追記専用台帳を server 側で *falsifiable* にするための前提。現 demo persona 3 名 + net-new ガバナンス担当者 (read-only) を「実 endpoint と DB に乗る role 集合」へ正規化し、各 role が叩ける action / 見える route / DB field / session source を確定する。これは DB schema 契約 (P0 #3) と auth 契約 (P0 #4) の入力となる。

> **scope-out (右サイズ)**: 本契約は **4 enum role (inputter / checker / business-approver / governance) + demo actor 5 名 (3 operational + ≥2 governance)** のみ。3-role IA の user-facing nav は {checker, business-approver}→「承認者」の visibility grouping で実現 (enum flatten はしない)。組織 / 部門 / グループ階層、permission 継承エンジン、IdP / OAuth / JWT issuer、RBAC engine は **対象外** (= production hardening、DEFECT)。governance は READ-ONLY (execute を持たない) ゆえ additive で四眼に無影響。session は **dual-identity 署名トークン 1 本** (`X-Operator-Token`、HMAC-SHA256、env secret `BOAI_SESSION_SECRET` 1 個) で十分。実 customer data / 実 AI / 実外部接続なし (mock) は保持。
>
> **dual-identity model (canonical, SD-1)**: `session_operator_id` = 実 operator (verified `X-Operator-Token` から解決、2 demo operator `op-demo-1` / `op-demo-2` は **CODE CONSTANT**、DB table ではない)。`effective_actor_id` = demo persona (per-write body の `{ actorId }` から、`allowed_actors` = 5 seeded actors (3 operational + ≥2 governance) に対し server-side validate。UI persona switch = 3 operational actors のみだが、server validation universe は seed 済 `actors` table 全体)。body `actorId` は **`effective_actor_id` のみ**を設定し、`session_operator_id` は **絶対に**変えない。`audit_events` は両者を全 write row に NOT NULL 記録 (single operator が persona を演じる seed では equal)。

---

### 1. 中核判断: persona → 目標 role の写像

現 live は `ActorRole = 'inputter' | 'checker' | 'business-approver'` の 3 値で、reducer が `state.currentActorId` を SoD の主キーとして強制している (`src/store/actors.ts:7`, `src/store/reducer.ts:74-76,88,93`)。出発仮説 (checker→承認者 統合、governance=read-only) を live SoD ロジックに照合した結論:

| 判断 | 結論 | live 根拠 |
|------|------|-----------|
| ガバナンス担当者 (リーガル/コンプラ/モデルリスク) を新規 role として足すか | **足す (SD-2 ratified)。net-new な READ-ONLY role として additive 追加。execute を一切持たないため四眼写像に無影響** | item 3 の 3-role IA target = 入力者 / 承認者 / **ガバナンス担当者**。governance は monitoring / モデルガバナンス / 監査台帳 / AI提案レビューの oversight を担い、**全 mutation endpoint は server が governance role を reject**、**governance-only read endpoint (`GET /api/audit-events` 等) は他 3 role を reject** (SD-2)。read-only ゆえ `isSelfApproval` の identity-SoD を二重化しない (execute を持たないので四眼に影響しない)。enum は additive (`'governance'` 追加)、新 governance demo actor ≥2 を seed (P2 cardinality) |
| checker / business-approver を 1 enum 値に統合するか | **統合しない (enum は additive 維持)。3-role IA の NAV では {checker, business-approver} を「承認者」group に束ね、business-approver は 承認者 group 内の senior tier (設定承認/裁定)** | live は案件最終承認 (checker) と 設定承認/裁定 (business-approver) を別 execute として持つ (`reducer.ts:144,214,262`、`ProposalDetailV2.tsx:25`, `AgentDetailV2.tsx:74`)。enum を merge すると「業務責任者のみ設定承認可」を将来表現できず、四眼対称性 (案件 `inputApprovedBy` / 設定 `promotionRequestedBy` / 手順 `forwardedBy` の 3 層) も崩れる。**user-facing 3-role は visibility grouping で実現**し、enum flatten はしない (= migration 最小、additive)。残る granularity 判断は OD-1 |
| business-approver の execute (承認/裁定/設定承認) は誰の責務か | **承認者 group (business-approver tier)。governance には渡さない** | `case/resolveEscalation` は `currentActorId===escalation.to` のみ可 (`reducer.ts:144`)、`proposal/approve`/`agent/approvePromotion` は business-approver mode (`ProposalDetailV2.tsx:25`, `AgentDetailV2.tsx:74`)。これらを read-only governance に移すと execute が消え四眼が成立しない |

**結論の写像 (Required column 1→2)**:

| 現 persona | actor_id | 現 role (enum) | 目標 role (3-role IA nav) | 性格 |
|------------|----------|----------------|--------------------------|------|
| 山田太郎 | `actor-inputter` | `inputter` | **入力者** | propose / 入力 / 1 次確認 (execute は前進のみ) |
| 鈴木課長 | `actor-checker` | `checker` | **承認者** (group) | 案件最終承認 / 反映 / 訂正・取消 (execute) |
| 業務責任者 | `actor-approver` | `business-approver` | **承認者** (group、業務責任者 tier) | 手順承認 / 設定承認 / エスカレーション裁定 (execute、higher-stakes) |
| (新規) リーガル担当 | `actor-gov-legal` | `governance` (新規 enum) | **ガバナンス担当者** | oversight / read-only (監査台帳 / モデルガバナンス / AI提案レビュー、execute なし) |
| (新規) コンプラ担当 | `actor-gov-compliance` | `governance` (新規 enum) | **ガバナンス担当者** | oversight / read-only (同上)。P2 cardinality「ガバナンス担当者 ≥2」を満たす最小 2 actor |

> ラベル `inputter=入力者 / checker=承認者 / business-approver=業務責任者` は `ROLE_LABEL` の verbatim (`actors.ts:31-35`)。actor 名 (山田太郎/鈴木課長/業務責任者) は `DEMO_ACTORS` verbatim (`actors.ts:18-20`)。`DEFAULT_ACTOR_ID='actor-inputter'` (`actors.ts:24`)。
>
> **「ガバナンス担当者」の扱い (SD-2 ratified)**: item 3 の 3-role IA target は「入力者 / 承認者 / ガバナンス担当者」。**ガバナンス担当者は live `ActorRole` に存在しない net-new role** なので、本契約は enum に `'governance'` を **additive** で追加し、新 governance demo actor を ≥2 seed する。governance は **READ-ONLY** (oversight: モニタリング/モデルガバナンス/監査台帳/AI提案レビュー) で execute を一切持たないため、`isSelfApproval` 由来の四眼写像には影響しない (additive、既存 SoD ロジックを再設計しない)。live の `business-approver`=業務責任者 は消えず、3-role IA の **「承認者」group** に checker と共に束ねられる (business-approver = 承認者 group の senior tier)。enum の granularity (4 値 additive のまま vs 将来 flatten) は OD-1。

---

### 2. ActorRole enum 変更 + migration (出発仮説の具体化)

**結論: enum は additive 変更 (`'governance'` を 1 値追加)。既存 3 値は不変。加えて「actor_id が server identity になる」。** 仕様文の「enum 変更 + migration」要求に対する right-sized 回答:

| 変更項目 | postv4 (live) | postv5 (本契約) | migration |
|----------|---------------|-----------------|-----------|
| `ActorRole` 型 | `'inputter' \| 'checker' \| 'business-approver'` (`actors.ts:7`) | **additive: `'inputter' \| 'checker' \| 'business-approver' \| 'governance'`** | `'governance'` を 1 値追加 (既存 3 値・既存 SoD ロジックは不変)。`actor` table の role CHECK 制約に `'governance'` を含める。新 governance actor (`actor-gov-legal` / `actor-gov-compliance`、≥2) を seed |
| `DEMO_ACTORS` (operational) + governance seed | client const (`actors.ts:17-21`、3 operational のみ) | **3 operational を DB `actor` table seed 行へ昇格 + ≥2 governance を net-new seed** = `allowed_actors` 5 行 (id/name/role を seed)。`DEMO_ACTORS` 自体は 3 のまま (UI persona switch の subset)、governance は live const に**足さない** | client const (3 operational) は残置 (UI label + persona switch SSOT)。DB 側は 3 operational を同 id で seed + governance ≥2 を追加、`actor_id` が両者の join key。server `effective_actor_id` validation universe = `allowed_actors` (5) |
| identity の権威 | `state.currentActorId` (client reducer, `types.ts:123`) | **server: `X-Operator-Token` → `session_operator_id`、per-write body `{ actorId }` → `effective_actor_id`** (dual-identity)。client store の `currentActorId` は demo persona 切替の UI hint に降格 | persona switch は postv5 で **専用 server switch endpoint を持たない**。persona = client state + per-write body `{ actorId }` の server-side validation (`reducer.ts:245-247` の no-op guard 相当は「未知 actorId を validate で reject」に対応) |
| SoD 主キー | reducer の `isSelfApproval(requesterId, currentActorId)` (`reducer.ts:74-76`) | **server が requester `effective_actor_id` (DB 保持) と現 request body `effective_actor_id` を比較** | 同一論理を server へ移送。client gate (`useCanApprove`, `hooks.ts:135-149`) は UX 先回りとして残置 |

**migration approach (右サイズ)**: enum 変更は `'governance'` の additive 追加のみ (既存 3 値の型 migration は不要)。必要なのは (1) `'governance'` を `ActorRole` + `actor.role` CHECK に追加、(2) governance demo actor を ≥2 seed、(3)「`effective_actor_id` を server-validated にする」で、これは P0 #3 (DB schema: `actor` table = 3 operational + ≥2 governance 行 seed + `schema_migrations` ledger #20、forward-only / boot-apply) と P0 #4 (`X-Operator-Token` → `session_operator_id` 解決 + body `{ actorId }` → `effective_actor_id` validation) が引き受ける。本契約は **その actor 行集合と 4-enum / 3-role-nav の確定** が deliverable。DB schema 変更は `schema_migrations(version, name, applied_at, checksum)` 経由で forward-only 適用、`db:reset-demo` が全 migration を再適用する (SD-3)。

---

### 3. role → 24 StoreAction (future endpoint) の allowed/denied 写像

reducer (`reducer.ts:100-323`) を live 権威として、各 action の future endpoint と allowed role を確定。

**「allowed role」の精密化 (UI mode の実体を反映)**: live UI は dispatch 前に role を **2 値 mode へ collapse** している。この collapse が「どの role がその操作を起こせるか」の実体である:

- 案件操作 (`CaseDetailV2.tsx:152`): `mode = role==='inputter' ? 'input' : 'checker'`。→ **承認者 (checker) と業務責任者 (business-approver) は両方 `checker` mode に collapse され、案件 approve/reverse では区別されない**。
- 提案操作 (`ProposalDetailV2.tsx:25`): `mode = role==='business-approver' ? 'owner' : 'manual'`、`canManualAct = mode==='manual'` (`:50`)。→ **`manual` = 入力者 OR 承認者 (= non-business-approver の全員)**。`forward` は両者が起こせる。
- 設定操作 (`AgentDetailV2.tsx:74`): `mode = role==='business-approver' ? 'owner' : 'manual'`。→ 同上、`requestPromotion` は入力者 OR 承認者。

**従って SoD は role 分離ではなく identity (`effective_actor_id`) 比較で効く**。デモは 3 persona が別人ゆえ四眼が UI 上では発火しないが、server は **identity 比較 (requester `effective_actor_id` == 現 request body `effective_actor_id` → reject)** を強制する。role-distinction に依存してはならない (案件 approve/reverse では checker と business-approver が dispatch 層で同一なので、role gate では SoD を担保できない)。

> **denial response convention (canonical, SD-4)**: 全 reject は `{ ok: false, denialReason: <ENUM> }` shape を返す。server test は **bare HTTP code ではなく `denialReason` enum を assert** する。default HTTP は authz / SoD / precondition 違反すべて **403**、HTTP 404 は **IDOR existence-hiding (`denialReason='NOT_FOUND'`) のみ**。endpoint 境界は全て **zod schema `.strict()`** で validate (unknown-field reject = mass-assignment 防御、SD-5)。

| 操作面 / action | 想定 endpoint | allowed role (UI mode 実体) | server enforce 種別 | SoD subject (reject 対象 actor_id) | live 根拠 |
|------|------|------|------|------|------|
| `case/approve {by:'input'}` | `POST /api/cases/:id/approve?by=input` | 入力者 (input mode) | STATE のみ (role gate なし) | — (前進のみ。flags>0 / status≠ready は reject) | `reducer.ts:87-90`, `hooks.ts:139-142`, `CaseDetailV2.tsx:152` |
| `case/approve {by:'checker'}` | `POST /api/cases/:id/approve?by=checker` | 承認者 + 業務責任者 (両者 checker mode に collapse) | STATE + **identity-SoD** | **`inputApprovedBy` と同一 `effective_actor_id`** | `reducer.ts:91-96`, `hooks.ts:145-147`, `CaseDetailV2.tsx:152` |
| `case/override` | `POST /api/cases/:id/fields/:label/override` | 入力者, 承認者 | STATE のみ | — (冪等、resolved 済は no-op) | `reducer.ts:104-115` |
| `case/sendback` | `POST /api/cases/:id/sendback` | 入力者, 承認者 (state のみ判定、role 無関係) | STATE のみ | — (ready/business-approval-waiting のみ) | `reducer.ts:116-126` |
| `case/escalate` | `POST /api/cases/:id/escalate` | 入力者, 承認者 | STATE のみ (`escalation_from`=現 `effective_actor_id` 記録) | — | `reducer.ts:127-137` |
| `case/resolveEscalation` | `POST /api/cases/:id/escalation/resolve` | **指名された裁定者のみ** (デモは `escalation.to='actor-approver'`) | **identity-SoD (designated arbiter)** | **現 `effective_actor_id` ≠ `escalation.to` を reject** (= 指名裁定者以外の resolve を block) | `reducer.ts:138-159`, `CaseDetailV2.tsx:236` |
| `case/assign` | `POST /api/cases/:id/assign` | 承認者, 業務責任者 | STATE のみ | — | `reducer.ts:160-161` |
| `case/bulkApprove` | `POST /api/cases/bulk-approve` | 入力者 (by=input) / 承認者+業務責任者 (by=checker) | STATE + identity-SoD (approveCase 経由) | approveCase 経由ゆえ flagged/自己承認分は当該行のみ自動 skip | `reducer.ts:162-163` |
| `case/reverse` | `POST /api/cases/:id/reverse` | 承認者 + 業務責任者 (両者 checker mode に collapse) | STATE のみ (role gate なし) | — (reflected かつ未 reversal のみ。入力者=input mode は UI 上不可だが server は STATE precondition で判定) | `reducer.ts:164-177`, `hooks.ts:156-164`, `CaseDetailV2.tsx:152` |
| `case/reprocess` | `POST /api/cases/:id/reprocess` | 入力者 | STATE のみ | — (sent-back のみ) | `reducer.ts:196-203` |
| `case/create` | `POST /api/cases` | 入力者 | STATE のみ | — (id 重複は冪等 no-op) | `reducer.ts:178-195` |
| `proposal/forward` | `POST /api/proposals/:id/forward` | **入力者 OR 承認者** (= manual mode = non-business-approver) | STATE のみ (`forwarded_by`=現 `effective_actor_id` 記録) | — | `reducer.ts:204-208`, `ProposalDetailV2.tsx:25,50,153` |
| `proposal/approve` | `POST /api/proposals/:id/approve` | **業務責任者のみ** (owner mode) | STATE + **identity-SoD** | **送付 actor (`forwarded_by`) 本人を reject** | `reducer.ts:209-216`, `ProposalDetailV2.tsx:25,51,168` |
| `proposal/reject` | `POST /api/proposals/:id/reject` | 業務責任者 (owner) | STATE のみ | — (pending-triage/forwarded のみ) | `reducer.ts:217-225` |
| `proposal/sendback` | `POST /api/proposals/:id/sendback` | 業務責任者 (owner) | STATE のみ | — (forwarded のみ) | `reducer.ts:226-234` |
| `agent/requestPromotion` | `POST /api/agents/:id/promotion/request` | 入力者 OR 承認者 (manual mode) | STATE のみ (`promotion_requested_by` 記録) | — (approved 済は no-op) | `reducer.ts:248-257`, `AgentDetailV2.tsx:74` |
| `agent/approvePromotion` | `POST /api/agents/:id/promotion/approve` | **業務責任者のみ** (owner) | STATE + **identity-SoD** | **申請 actor (`promotion_requested_by`) 本人を reject** | `reducer.ts:258-264`, `AgentDetailV2.tsx:73-74` |
| `agent/sendbackPromotion` | `POST /api/agents/:id/promotion/sendback` | 業務責任者 (owner) | STATE のみ | — (requested のみ) | `reducer.ts:265-274`, `AgentDetailV2.tsx:74` |
| `agent/emergencyStop` | `POST /api/agents/:id/emergency-stop` | (state-only、起こせる role を gate しない) | STATE のみ (role gate なし、冪等、理由必須) | — | `reducer.ts:275-293` |
| `agent/resume` | `POST /api/agents/:id/resume` | (state-only、起こせる role を gate しない) | STATE のみ (role gate なし、未停止は no-op、理由必須) | — | `reducer.ts:294-312` |
| `notification/markRead` | `POST /api/notifications/:id/read` | 全 role (自分宛のみ) | STATE のみ (冪等) | — | `reducer.ts:235-239` |
| `notification/markAllRead` | `POST /api/notifications/read-all` | 全 role (自分宛のみ) | STATE のみ (冪等) | — | `reducer.ts:240-244` |
| `session/switchActor` | **専用 server switch endpoint なし** (persona = client state + per-write body `{ actorId }`) | UI persona switch = 3 operational actors (demo persona 切替) | server switch endpoint を持たない。各 write の body `{ actorId }` を zod `.strict()` + `allowed_actors` (5 seeded) validate | `allowed_actors` に無い actorId は write 時に validate で reject (`UNKNOWN_ACTOR`、§3a OD-3 参照) | `reducer.ts:245-247` (client state) |
| `store/hydrate` | (client only、multi-tab) | — | — | — (server endpoint 化しない) | `reducer.ts:313-315` |
| `store/reset` | **CLI `db:reset-demo` のみ** (default disabled、env-gated、no HTTP)。HTTP `POST /api/admin/reset` は **out-of-P0** | CLI 実行者 (HTTP role gate なし)。HTTP reset を将来足す場合は `admin`/`system` role (governance ではない) | CLI: env-gated full DB reset (migration 再適用 + 再 seed)。`audit_events` は空から再開 = reset audit row なし。governance は READ-ONLY ゆえ reset authorizer になり得ない (SD-2) | — | `reducer.ts:316-317`, `ObservatoryV2.tsx:382` |

> **non-four-eyes 行の server enforce 規律 (vague 化を排す)**: 上表で `STATE のみ` と記した行 (override / sendback / escalate / assign / reprocess / create / forward / requestPromotion / **reverse** / **emergencyStop** / **resume** / proposal-reject / proposal-sendback / promotion-sendback / notification) は **状態前提条件 (precondition) のみを server で enforce し、role gate は掛けない**。理由: reducer がこれらの行で role を一切参照しないため (例 `case/sendback` は `reducer.ts:120` で status のみ check、`agent/emergencyStop`/`resume` は live reducer が state のみ判定し role を見ない)。具体的 falsifiable 基準: **入力者が checker-stage 案件に sendback を投げても、status が ready/business-approval-waiting なら 200 で受理する (role 由来の reject ではない)**。逆に status が reflected なら STATE precondition 違反で reject (`{ ok:false, denialReason }`、HTTP 403)。「role が違うから no-op」は live に存在しない挙動なので server contract でも作らない。`emergencyStop` / `resume` に「承認者・業務責任者 allowed」のような role-gate phrasing は **置かない** (= STATE-only)。

#### 3a. SoD reject の falsifiable assertion table (server test 必須集合)

SoD が credible に demonstrate されるのは、下記 **4 reject** が「指定 actor_id pair で要求 → 4xx」を返すと server test で確認できた時。これが P0 #4 / server-test 契約の必須 assertion。各行に「prerequisite write (誰が discriminant field を server-record するか)」と「attack request (誰が同一 actor_id で叩くか)」を pin する。reject が falsifiable になるのは、prerequisite が server 側に記録されていることが前提だからである。

> 各 attack の expected は **HTTP 403 + `{ ok:false, denialReason:<ENUM> }`**。server test は HTTP code 単体ではなく **`denialReason` enum を assert** する (SD-4)。「by `actor-X`」は request body `{ actorId:'actor-X' }` (= `effective_actor_id`) を指す。

| # | SoD 種別 | prerequisite write (discriminant を populate する request) | attack request (reject されるべき要求) | expected (HTTP + denialReason) | live 根拠 |
|---|---------|-----------------------------------------------------------|----------------------------------------|----------|-----------|
| 1 | 四眼 (案件最終承認) | `POST /api/cases/:id/approve?by=input` by `actor-inputter` → server が `case.input_approved_by = actor-inputter` を記録 | `POST /api/cases/:id/approve?by=checker` by **`actor-inputter`** (= 同一 effective_actor_id が最終承認) | **403 + denialReason** | `reducer.ts:93` (`isSelfApproval(inputApprovedBy, current)`) |
| 2 | 四眼 (手順承認) | `POST /api/proposals/:id/forward` by `actor-inputter` → server が `proposal.forwarded_by = actor-inputter` を記録 | `POST /api/proposals/:id/approve` by **`actor-inputter`** (= 送付者本人が承認) | **403 + denialReason** | `reducer.ts:214` (`isSelfApproval(forwardedBy, current)`) |
| 3 | 四眼 (設定承認) | `POST /api/agents/:id/promotion/request` by `actor-inputter` → server が `agent.promotion_requested_by = actor-inputter` を記録 | `POST /api/agents/:id/promotion/approve` by **`actor-inputter`** (= 申請者本人が承認) | **403 + denialReason** | `reducer.ts:262` (`isSelfApproval(promotionRequestedBy, current)`) |
| 4 | エスカレーション裁定 (designated arbiter) | `POST /api/cases/:id/escalate` by `actor-inputter` → server が `case.escalation_to = actor-approver`、`escalation_from = actor-inputter` を記録 (デモは `to` を `actor-approver` に hard-code、`CaseDetailV2.tsx:236`) | `POST /api/cases/:id/escalation/resolve` by **`actor-inputter`** または **`actor-checker`** (= 指名裁定者 `actor-approver` 以外) | **403 + denialReason** | `reducer.ts:144` (`currentActorId !== escalation.to`) |

> **# 4 の正確な意味論 (前版の誤記訂正)**: 前版は「起票した入力者が自分の escalation を裁定 → reject」と書いていたが、live reject 条件は **現 `effective_actor_id` !== `escalation.to`** であり「起票者 (from) の identity」ではなく「指名された裁定者 (to) と一致するか」で効く。デモは `escalate` 時に `to='actor-approver'` を hard-code する (`CaseDetailV2.tsx:236`) ため **`from == to` (入力者が自分を指名) は構造的に発生しない**。よって falsifiable な reject は「**指名裁定者 (actor-approver) 以外の actor が resolve を試みる → 403 + denialReason**」であり、`escalation-arbitration.test.tsx:46-48` が入力者 (= 非裁定者) の裁定面非表示を確認しているのと整合する。

> **falsifiable 最小集合 = 4 reject** (四眼 3: case-checker / proposal-approve / promotion-approve + escalation self-arbitration 1)。これ以上の server test (role-distinction 由来の reject 等) は live に対応挙動が無いため over-engineering = STOP 兆候。

> **object-level IDOR reject (canonical, SD-2)**: cross-actor が直接 ID で他 actor の object へ access しようとした場合は **HTTP 404 + `denialReason='NOT_FOUND'`** (existence-hiding)。authz/SoD/precondition の 403 とは区別し、IDOR のみ 404 を返す。

> **governance read-boundary reject (canonical, SD-2)**: governance role は **READ-ONLY**。(a) 全 mutation endpoint は governance role に対し reject。(b) governance-only READ endpoint (`GET /api/audit-events`、model-governance reads、config-approvals reads) は governance role に gate し、inputter / checker / business-approver は endpoint で reject。いずれも `{ ok:false, denialReason }` (HTTP 403)。

> **server-auth の前提 reject (P0 #4 へ申し送り、本契約で要明示)**: 上記 4 reject が成立する前提として、guarded endpoint へ **`X-Operator-Token` 不在 / 改竄 (HMAC-SHA256 不一致) / 期限切れ (30 min) / 既使用 jti (in-memory `Set<jti>` で replay reject) の request は reject** でなければならない (= `session_operator_id` が server-authoritative である保証)。加えて body `{ actorId }` が **`allowed_actors` (5 seeded actors = 3 operational + ≥2 governance) に無い場合は zod `.strict()` validate で reject** (`effective_actor_id` の妥当性、`denialReason='UNKNOWN_ACTOR'`)。**layer 分離**: persona validation = `actorId ∈ allowed_actors` (5)、authorization = governance role は全 mutation reject (read-only) / operational role は identity-SoD + state。governance actorId は layer 1 (persona validation) を **pass** し layer 2 (governance reject) に到達する必要があるため、validation universe は 5 であって 3 ではない (3 のみで validate すると governance-boundary test が到達不能になる = bug)。これは P0 #4 (`X-Operator-Token` → `session_operator_id` 解決 + body `{ actorId }` → `effective_actor_id` validation) の契約だが、SoD reject の falsifiability がこの前提に依存するため本契約が要件として明記する: **`/api/cases/:id/approve` 等の guarded execute endpoint に (a) トークン無し / (b) 署名不正 / (c) `allowed_actors` (5 seeded) に無い actorId を渡す → reject (`{ ok:false, denialReason }`)**。persona 切替の「存在しない actor → write 時 validate reject」(`reducer.ts:245-247` の client defensive guard 相当) は per-write body validation の一部であり、専用 server switch endpoint は存在しない (別レイヤ)。

---

### 4. 15 route → role 可視性

App.tsx の 15 route (`App.tsx:34-54`) を role 可視性に写像。**現 live は route gate を持たない (全 route が全 role に見え、画面内 banner で「あなたの操作ではない」と warn する soft-gate)**。例: `BusinessApproverHubV2.tsx:75-80` と `EscalationsV2.tsx:34-39` は非 business-approver に「右上で切替えてください」を出すが route 自体は塞がない。postv5 も **route hard-gate は導入しない** (右サイズ: 可視性 = soft、execute = server hard-gate)。下表の「primary role」は「その画面の execute owner」、可視性は全 role read-OK。

| # | route | component | primary role (execute owner) | 可視性 | live 根拠 |
|---|-------|-----------|------------------------------|--------|-----------|
| 1 | `/` `/hub` | `HubV2` | 全 role (landing) | 全 role | `App.tsx:36-37` |
| 2 | `/cases` | `CasesV2` | 入力者 | 全 role | `App.tsx:38` |
| 3 | `/approvals` | `ApprovalsV2` | 承認者 (+業務責任者、checker mode) | 全 role | `App.tsx:42` |
| 4 | `/cases/:id` | `CaseDetailV2` | 入力者 (input mode) / 承認者+業務責任者 (checker mode) | 全 role (mode は role 由来、business-approver→checker) | `CaseDetailV2.tsx:152` |
| 5 | `/proposals` | `ProposalsV2` | 入力者 OR 承認者 (manual mode が forward 起票) | 全 role | `App.tsx:43`, `ProposalDetailV2.tsx:25,50` |
| 6 | `/proposals/:id` | `ProposalDetailV2` | 業務責任者 (owner=承認/差戻し) / 入力者・承認者 (manual=却下/送付) | 全 role (mode は role 由来) | `ProposalDetailV2.tsx:25,50,51` |
| 7 | `/agents` | `AgentsV2` | 承認者/業務責任者 | 全 role | `App.tsx:45` |
| 8 | `/agents/:id` | `AgentDetailV2` | 業務責任者 (owner=設定承認) / 入力者・承認者 (manual=申請) | 全 role (mode は role 由来) | `AgentDetailV2.tsx:74` |
| 9 | `/observatory` | `ObservatoryV2` | **oversight/read (全 role 閲覧)、execute なし** | 全 role | dispatch 不在 (`ObservatoryV2.tsx` 全体、例外 store/reset=demo) |
| 10 | `/search` | `SearchV2` | 全 role | 全 role | `App.tsx:48` |
| 11 | `/inbox` | `NotificationsV2` | 全 role (自分宛のみ表示) | 全 role | `App.tsx:49`, `hooks.ts:336-398` |
| 12 | `/business-approver` | `BusinessApproverHubV2` | **業務責任者** | 全 role (非該当は warn banner) | `BusinessApproverHubV2.tsx:51,75-80` |
| 13 | `/config-approvals` | `ConfigApprovalsV2` | **業務責任者** (drill→AgentDetail owner) | 全 role | `ConfigApprovalsV2.tsx` (read-only list、dispatch 無し) |
| 14 | `/escalations` | `EscalationsV2` | **業務責任者** (drill→CaseDetail 裁定) | 全 role (非該当は warn banner) | `EscalationsV2.tsx:15,34-39` |
| 15 | `/cases/new` | `CaseDraftV2` | 入力者 (手動起票) | 全 role | `App.tsx:40` |

> **注 (案件操作の role collapse)**: row 3/4 の「承認者」は UI 上 `checker` mode (`CaseDetailV2.tsx:152` で inputter 以外は全て checker mode) に collapse され、業務責任者も同 mode に入る。case approve/reverse では server が role を区別せず **identity-SoD (§3a #1)** で守る。「primary role=承認者(+業務責任者)」が正しいのは両者が checker mode に写るためであり、役割名で gate するのではない。

> **注 (ガバナンス担当者の可視性、SD-2)**: route hard-gate は依然入れない (OD-2、可視性は soft)。ただし governance role の enforcement は **endpoint 層**で効く: (a) governance は全 mutation endpoint で reject (read-only)、(b) governance-only read endpoint (`GET /api/audit-events`、model-governance reads、config-approvals reads) は inputter/checker/business-approver を reject (§3a governance read-boundary)。route 9 `/observatory`・13 `/config-approvals` 等の oversight 画面は **ガバナンス担当者が primary read-owner**だが、画面 read 自体は soft (全 role 可視)、raw な監査 endpoint だけが governance-gated。governance 用の 3-role IA nav (item 3 = モニタリング/モデルガバナンス/監査台帳/AI提案レビュー) は P3 の UI 実装。

---

### 5. role → DB fields / session source

| 目標 role | actor_id | DB fields (P0 #3 への入力) | session source |
|-----------|----------|----------------------------|----------------|
| 入力者 | `actor-inputter` | `actor(id, name='山田太郎', role='inputter')`。SoD discriminant **書込元** (`effective_actor_id`): `case.input_approved_by` (← `POST /api/cases/:id/approve?by=input`)、`proposal.forwarded_by` (← `proposal/forward`)、`agent.promotion_requested_by` (← `agent/requestPromotion`)、`case.escalation_from`+`escalation_to` (← `case/escalate`) | `X-Operator-Token` → `session_operator_id` 解決 + body `{ actorId }` → `effective_actor_id` (P0 #4)。env secret `BOAI_SESSION_SECRET` 1 個。client `currentActorId` は UI hint に降格 |
| 承認者 | `actor-checker` | `actor(id, name='鈴木課長', role='checker')`。読: 上記 discriminant を SoD 比較。書: `case.status` 遷移 (← `POST /api/cases/:id/approve?by=checker`)、`case.reversal` (← `case/reverse`) | 同上 |
| 業務責任者 | `actor-approver` | `actor(id, name='業務責任者', role='business-approver')`。読: `escalation_to` / `forwarded_by` / `promotion_requested_by` を自己比較。書: `proposal.status` (← `proposal/approve`)、`agent.promotion_status` (← `agent/approvePromotion`)、`case.escalation_resolution` (← `case/resolveEscalation`) | 同上 |
| (台帳行、全 role) | — | `audit_events`: id / seq INTEGER UNIQUE / entity_type / entity_id / case_id FK / actor_id FK (= `effective_actor_id`) / **session_operator_id** / action / occurred_at (tz-aware ISO-8601) / before_json / after_json。append-only。両 ID とも NOT NULL (single operator が persona を演じる seed では equal)。role は stored せず **actor_id→roles.label で DERIVED**。operational `audit_events` に confidence column は **持たない** (live `logEvent` は '—' 埋め)。`entity_type` CHECK は `('case','proposal','agent')` のまま (P0 の reset は CLI `db:reset-demo` が DB を recreate する方式ゆえ reset marker 行が無く、`entity_type` 拡張は P0 不要、#8 参照)。DDL は P0 #8 が owner | `reducer.ts:48-67` の `logEvent` を server insert へ移送。`occurred_at = auditTs(seq)` の決定的論理を live reducer から port (tz-aware ISO-8601 に正規化、**runtime wall-clock を使わない**) |

> **discriminant の「書込元 request」を pin する理由**: §3a の reject が falsifiable なのは、prerequisite write (例 `forwardedBy` を populate する `proposal/forward`) が server に記録された後でないと self-approval が判定できないため。各 discriminant の populate request を上表に明記し、server test が「prerequisite → attack → reject」の順で組めるようにする。

> **DB seed = `allowed_actors` 5 行** (`actor` table = 3 operational + ≥2 governance)。column = `id` (PK, `actor-*`), `name` (JP), `role` (`inputter|checker|business-approver|governance` の CHECK 制約)。3 operational は `DEMO_ACTORS` (`actors.ts:17-21`) の verbatim 移送、governance ≥2 (`actor-gov-legal` / `actor-gov-compliance`) は net-new seed。`allowed_actors` (5) が server `effective_actor_id` validation universe。階層/グループ/権限テーブルは作らない。demo operator (`op-demo-1` / `op-demo-2`) は **CODE CONSTANT** であり DB table ではない (operator login `POST /api/session/operator` が `X-Operator-Token` を issue)。`schema_migrations(version, name, applied_at, checksum)` ledger (data-model table #20、forward-only / boot-apply / 各 migration に rollback NOTE) は P0 #3 が owner。

---

### Open decisions

- **OD-1 (confirmed SD-2 + 残 granularity 判断): ガバナンス担当者 = net-new READ-ONLY role を追加する。残る判断は enum granularity**
  - 確定 (SD-2): `'governance'` を `ActorRole` に **additive** 追加 + governance demo actor ≥2 seed。governance は全 mutation を server reject、governance-only read endpoint (`GET /api/audit-events` 等) を他 role に reject。read-only ゆえ四眼 (`isSelfApproval`) に無影響。これは item 3 の 3-role IA (入力者/承認者/ガバナンス担当者) を server で enforce するための前提。
  - **残 sub-decision (granularity、user 可変)**: 「承認者」group 内で checker と business-approver を **4-enum のまま保持** (推奨、additive・migration 最小・「業務責任者のみ設定承認」を将来表現可能) か、**3-enum に flatten** (inputter/approver/governance、設定承認/裁定 を identity-SoD のみで区別) か。**推奨 default = 4-enum 保持** (live の execute 区別を壊さない)。
  - rationale: governance read-gate が無いと item 3 の「ガバナンスは propose/read のみ、execute は持たない」が server で falsifiable にならない。enum granularity は user-facing 3-role nav とは独立 (nav は visibility grouping で実現)。
  - reversibility: **高** (governance は additive read-only; enum flatten も pre-implementation なら可逆)。

- **OD-2: route hard-gate (非該当 role を route ごと塞ぐ) を入れるか**
  - 推奨 default: **入れない (soft-gate=banner 維持)**。live は全 route 可視 + 画面内 warn (`BusinessApproverHubV2.tsx:75-80`, `EscalationsV2.tsx:34-39`)。execute は server hard-gate (§3a の 4 reject) で守る。
  - rationale: 規制レビュアが見るのは「壊そうとした操作が server で弾かれるか」。可視性の hard-gate は production hardening 寄りで、DEMONSTRATE 価値が低い。
  - reversibility: **高** (client route guard は後付け additive)。

- **OD-3 (canonical 確定、SD-1): persona 切替は専用 server switch endpoint を持たない**
  - 確定: **persona = client state + per-write body `{ actorId }` の server-side validation**。`POST /session/switch` / `POST /session/actor` のような dedicated server switch endpoint は **作らない (rejected alternative)**。operator login のみ server endpoint = `POST /api/session/operator` (demo login、`op-demo-1` / `op-demo-2` の 2 demo operator に `X-Operator-Token` を issue)。本番 IdP は作らない。
  - **切替の blocking 基準 (vague 化を排す)**: persona は `effective_actor_id` を変える操作なので、各 write の body `{ actorId }` を **(a) zod `.strict()` + `allowed_actors` (5 seeded = 3 operational + ≥2 governance) のいずれかであることを validate (未知は reject、`reducer.ts:247` の defensive guard 相当)、(b) persona validation を pass した後の authorization は別 layer (operational = identity-SoD + state、governance = 全 mutation reject)。UI persona switch 自体は 3 operational 間を自由に切替えられる demo housekeeping (governance は operational switcher ではなく P3 governance view で操作)、(c) 切替自体は監査台帳に append しない (write 操作の audit_events のみが両 ID を記録)**。理由: live `session/switchActor` は `logEvent` を呼ばず (`reducer.ts:245-247`)、業務 execute ではなく demo の persona 切替 UI だから。`session_operator_id` は body `actorId` で **絶対に**変わらない (SD-1)。
  - rationale: デモは 3 persona を 1 画面で行き来して四眼を見せるのが価値。実認証は scope-out。
  - reversibility: **中** (本番では IdP 由来 operator/actor に置換、demo persona switch は無効化される設計を前提に)。

---

### Right-sizing notes

- **enum は additive 最小変更**が right-size: 既存 3 role (`inputter`/`checker`/`business-approver`) を rename/flatten せず保持し、governance を **1 値だけ additive 追加**。既存 SoD ロジックの再設計はゼロ (governance は read-only ゆえ四眼写像に無影響)。加えて actor_id を server-authoritative 化する。
- **ガバナンス担当者 = net-new READ-ONLY role (additive、SD-2)**: item 3 の 3-role IA を server で enforce するため `'governance'` を additive 追加。read-only ゆえ execute 写像 (四眼) を再設計せず、right-sized (mutation 全 reject + governance-only read gate のみ)。execute を持たせない点が DEFECT 回避の要。
- **DB は actor 3 operational + ≥2 governance 行 + CHECK 制約のみ**: 階層/グループ/permission inheritance テーブルは production hardening = DEFECT として除外。
- **route hard-gate を作らない**: 可視性は soft (banner)、execute だけ server hard-gate。falsifiable な価値は「壊す操作の reject」に集中。
- **session = dual-identity 署名トークン 1 本 (`X-Operator-Token`、HMAC-SHA256、env secret `BOAI_SESSION_SECRET`)**: OAuth/JWT issuer/RBAC engine は除外。operator login = `POST /api/session/operator` のみ、persona 切替は専用 endpoint を作らず per-write body `{ actorId }` validation で行う。
- **non-four-eyes 行は STATE precondition のみ enforce**: override/sendback/assign/reverse/emergencyStop/resume 等に role gate を足すのは live に無い挙動 = over-engineering。reducer が role を見ない行は server でも見ない。`emergencyStop`/`resume` は STATE-only (role gate なし)。
- **falsifiable 最小集合 = 4 reject** (四眼 3: case-checker / proposal-approve / promotion-approve、+ escalation self-arbitration 1)。各 reject は `{ ok:false, denialReason }` (HTTP 403)、IDOR のみ HTTP 404 + `denialReason='NOT_FOUND'`。これ以上の operational server test は over-engineering の兆候。**SoD は identity (`effective_actor_id`) 比較で効き、role-distinction では効かない** (案件操作で checker と business-approver が同 mode に collapse するため)。**governance role boundary は別軸**: governance = READ-ONLY (全 mutation reject + governance-only READ endpoint を他 role に reject)。
- **endpoint は全て `/api/` prefix**: `POST /api/cases/:id/approve` 等。reset は **P0 では CLI `db:reset-demo` のみ** (env-gated、no HTTP、`DEMO_RESET_ENABLED=false` default)。CLI が migration 再適用 + 再 seed で DB を recreate するため `audit_events` は空から再開し、reset audit marker / `entity_type` 拡張は P0 で不要 (#8 参照)。HTTP `POST /api/admin/reset` は **out-of-P0** であり、足す場合は `admin`/`system` role (governance ではない、governance は READ-ONLY ゆえ reset authorizer になり得ない)。`/session/reset` は **作らない (rejected alternative)**。
- **input validation = zod `.strict()`** (SD-5): 全 endpoint 境界で zod schema validate、unknown-field reject = mass-assignment 防御。
- **DB lifecycle = `schema_migrations` ledger** (SD-3): forward-only / boot-apply / 各 migration に rollback NOTE、`db:reset-demo` が全 migration 再適用。
