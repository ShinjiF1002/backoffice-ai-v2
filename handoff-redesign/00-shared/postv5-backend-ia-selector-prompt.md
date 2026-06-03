# postv5 self-driving prompt — SQLite backend + 3-role IA + selector UX 【確定版 v1.0 (FINAL)、2026-06-03】

> 次フェーズ実行用 self-driving prompt (**確定**)。決定済: Node server + better-sqlite3 + API (server-authoritative
> SoD/execute)、目標 3 ロール (入力者 / 承認者 / ガバナンス担当者)。
> レビュー履歴: Codex 5 pass (arch ×2 / data / security / **全体 acceptance**) + Opus 内部最終 1 pass = 計 6。
> 全体 acceptance verdict = **GO** (整合性 OK: count 一致・mutation table 統合・auth 統合に矛盾なし・right-sizing が
> 重厚 P0 の制御線として機能)。最終 3 fix 反映: 進め方 skill 参照を条件付き化 / item2 の role 表記矛盾解消 / 承認 gate に SSOT 更新 stop 明示。反映要点:
> - (arch) P0 各 contract に必須列スキーマ / auth identity 単一化 / sync→async UX 契約 / P1a・P2 seed 責務分離 / SSOT gate。
> - (data) P0 #8 = schema 正規化・FK / audit append-only trigger / KPI derived-vs-stored 分離 / demo clock (既存 NOW_ISO 移植) /
>   state-transition rules / migration / seed cardinality。
> - (security) P0 #9 = mutation invariant matrix / operator≠persona 分離記録 / RBAC+IDOR endpoint 強制 / injection 検証 /
>   audit 保全 / destructive guard / deploy baseline / dependency vetting。
> - (Opus 最終) **right-sizing 原則** (統制の実証 ≠ production hardening) / mutation table 統合 (#4+#9-1) /
>   role taxonomy の出発仮説 (governance=oversight 中心) / deploy 推奨 default。

---

## Goal
backoffice-ai-v2 の prototype (branch: main @ postv4 = greenfield v2 light operator console、15 route、
mock + in-memory store の静的 SPA) を、以下 4 点で「もっといい感じの prototype」へ昇格させる。
視覚方向 (light operator console) と規制業務セマンティクスは不変のまま、アーキテクチャ・IA・UX を進化させる。

## 不可侵 (§1)
1. 視覚方向 = v2 light operator console は locked。token (--v2-*)、lucide-react のみ、chip taxonomy 3 系統、
   tone v2、status-tones SSOT、JP-only。見た目の発明は redesign 対象 (item 3/4) のみ。他画面の look は不変。
2. 規制業務セマンティクス不変: 四眼 SoD (入力者≠承認者)、propose/execute 分離、honest framing (起きていない
   AI/OCR/押印/.pdf を捏造しない)、confidence 生数字は監査台帳のみ、[仮説/要検証]、PrototypeModeLabel 常時表示。
3. SQLite/server は **app 状態の永続化 + 実 API + server-authoritative な統制実証** のために導入する。
   **依然 mock**: 実 LLM/OCR/外部銀行系/実顧客データ/実 PDF/実規制 cite は無し。AI 出力は seed/mock のまま。
4. 機能を落とさない (落とす場合は停止して user 承認)。
5. **postv5 以降は静的 Pages 単体で動かない** (server 常駐が要る)。deploy 方針は P0 で確定する。
6. main 置換は user 最終承認 gate。各 phase は branch → PR、承認 gate を通ってから次へ。

## 設計原則 — prototype-appropriate rigor (right-sizing、最優先で読むこと)
本 prompt は P0 に 9 contract を課すが、これは **「統制を credible に *実証* し、test で falsifiable にする」** ためであって、
**production bank backend を作るためではない**。実装は次の原則で right-size する:
- 各統制は「規制レビュアーに見せて筋が通る最小実装 + それを破る試みを拒否する server test」で足りる。
  full auth framework / IdP / RBAC engine / prod infra / 監視 stack を作らない。
- demo-only signed header または軽量 session で十分 (OAuth/JWT issuer 等は不要)。secret は env 1 個で可。
- 「実顧客データ・実 AI・実外部接続なし (mock)」は維持。SoD/execute/audit の *enforcement* だけが real になる。
- 迷ったら **「これは統制の実証に必要か、それとも production hardening か」** を問い、後者なら入れない。
- 各 phase は AI agent 1 人が数 PR で回せる粒度。過剰設計の兆候 (新規 framework 導入、抽象層の増殖) は stop して再 right-size。

## アーキテクチャ (決定済)
- **Node server + better-sqlite3 + API** (Express か Fastify、REST か tRPC は P0 で proposal → 承認)。
- **server-authoritative**: SoD (四眼)、案件採番、state 遷移、監査台帳 (append-only ledger) を server へ移管。
  「Agent は propose/read のみ、Backend が operator-auth で execute」(規制 AI thesis) を実アーキで実証。
- **操作者 identity は request body の actorId を信用しない** (現状 actor は client store の `currentActorId`)。
  P0 で identity 方式を **1 つに固定** (demo-only signed header **か** server session のどちらか) し、cookie/header 名・
  署名/検証・期限・切替 API・body actorId 無視 test・audit actor source を明文化。自己承認拒否は **server test で falsifiable に証明**。
- **transaction + append-only**: 全 mutation は SQLite transaction 内で domain row 更新 + `audit_events` INSERT を
  atomic に。`audit_events` に UPDATE/DELETE API を作らず、repository layer test で append-only を保証。
- **mutation semantics は pessimistic default**: server は `{ ok, entity, auditEvent?, denialReason? }` を返し、
  client は成功後 invalidate/refetch。楽観更新は冪等 notification 系のみ許可、**SoD/execute 系は楽観禁止**。
  現 UI は dispatch 即時反映前提 (CaseDetailV2 の toast/遷移、CaseDraftV2 の submit→navigate、ApprovalsV2 の
  selection reset/toast) ゆえ、**action 単位の post-mutation UX 契約を P0 mutation table で確定** (下記)。
- SPA は API client 化: 現 StoreProvider/reducer の logic を server へ移し、client は API + cache
  (TanStack Query 等を P0 proposal)。API 化で loading/error 状態が実際に発生する。
- SQLite schema は現 store types (cases/fields/agents/proposals/escalations/notifications/audit_events/
  actors/roles/config-approvals) を忠実に反映。
- DB operation: **forward-only migration + rollback note + 冪等 seed + `db:reset-demo`**。現 `persist.ts` の
  `SCHEMA_VERSION` fallback (白画面回避) と同等の reset/rollback 契約を server DB でも持つ。
- 最小 observability: structured log (actorId/action/ok|deny)、`GET /health`、DB open 失敗時 fatal exit。

---

## P0 preflight — **実装開始前に user 承認必須 (最大の gate)**
以下 9 項目 (下記 1-7 + データモデル契約 #8 + セキュリティ統制契約 #9) を **table で確定**し承認を得てから P1 に入る。
ここを飛ばすと P3 で schema/auth 再設計が発生する。各 contract の deliverable は
`table 名 / 必須列 / blocking 完了基準 / approval owner` を満たすこと。**列は下記を最低限満たす**。

1. **deploy decision** (1 択を確定):
   ① Pages 維持 + static mock API fallback / ② Node host 移行 / ③ Pages は v1 archive + postv5 は hosted server URL。
   - **推奨 default (未定なら)**: ② に近い軽量案 = dev は localhost (`dev:full`)、stakeholder demo は単一 Node host
     (簡易 PaaS or 一時 URL)。Pages の旧 v1 は archive。right-sizing 原則に従い deploy infra は最小に。
   - blocking 基準: 1 案に確定し、CI/build/deploy 手順と stakeholder 閲覧手段が書けること。確定まで server 実装に入らない。

2. **auth-role taxonomy** (現 persona → 目標 role の再 mapping、これが DB schema と auth contract の前提):
   - 必須列: `現 persona (inputter 山田/checker 鈴木課長/business-approver 業務責任者) → 目標 role (入力者/承認者/
     ガバナンス) → actor_id → allowed endpoints → SoD subject → denied 例 → visible routes → DB fields → session source`。
   - `business-approver` (手順承認/設定承認/エスカレーション裁定) と新「ガバナンス担当者」(リーガル/コンプラ/モデルリスク)
     は別概念。**提案の出発仮説 (SoD 精査で検証・調整)**: ガバナンスは **oversight/read 中心** (モニタリング/モデルガバナンス/
     監査台帳/AI提案レビュー) で execute 系を持たない。business-approver の **承認/裁定/設定承認 という execute は承認者側**に
     寄せる (governance が execute を継承すると四眼が崩れる)。checker→承認者統合の是非と合わせ確定。現 `store/actors.ts` の
     `ActorRole` enum 変更案 + migration 方針も列に含める。

3. **auth/session contract** (identity を 1 方式に固定):
   - 必須列: `identity 方式 (header|session の 1 択) / cookie or header 名 / 署名・検証方式 / 期限 / 切替 API
     (例 GET·POST /session/current-actor) / audit actor source / body actorId 無視の証明 test`。

4. **API mutation semantics** (action 単位):
   - 必須列: `action / endpoint / optimistic 可否 (SoD·execute は不可) / denial response shape / pending UI /
     success UI / denial UI / refetch target / post-success navigation / toast timing / pending 中 disabled`。
   - 現 UI の同期前提 (toast/navigate/selection reset) を pessimistic 後の UX としてどう置換するかを action ごとに確定。

5. **test migration plan** (file 単位):
   - 必須列: `test file / 現 dependency (StoreProvider/MemoryRouter/localStorage hydrate 等) / expected break /
     new layer (server unit / API test / MSW component / Playwright) / keep·rewrite·delete / unskip phase`。
   - 現況の見積り材料: 全 31 test file。StoreProvider 依存 ~19、reducer/persist/localStorage 依存 ~14、loading-error は
     skip 中、w3 は unmount/remount で localStorage hydrate に依存。MSW・TanStack Query は package 未導入 (採用可否も決める)。

6. **DB operation contract**:
   - 必須列: `migration 方式 (forward-only + rollback note) / 冪等 seed / db:reset-demo / audit_events append-only
     enforcement / transaction boundary`。

7. **package layout & scripts** (P0 で確定):
   - dir 構成 (client=prototype-redesign、server=?)、server TS project (現 `tsconfig.node.json` は vite.config のみ
     include で server 非対応)、exact scripts (`server:dev`/`server:test`/`server:migrate`/`dev:full`/`check:server`、
     `check:all` への統合)、Node version + better-sqlite3 native install 確認。

**SSOT 更新 gate (P0 承認後・P1a 開始前)**: backend 決定と矛盾する現 SSOT 記述を更新する —
ルート `CLAUDE.md` / `prototype-redesign/CLAUDE.md` の「mock + in-memory only / 外部接続なし」scope-out、
`.github/workflows/pages.yml`、README。これを P1a 着手の必須 gate にする。

### P0 #8 — データモデル契約 (Codex data review 反映、DDL を P0 で承認)
TypeScript object shape を直写しにしない。以下を P0 で DDL contract として承認:

**(a) schema 正規化方針**: enum は P1a では TEXT + CHECK constraint (UI ラベルを運用変更するものだけ lookup table)。
nested fixture (case が fields/documents/lifecycle/citations/escalation/sendback を内包) は、検索・FK・validator が要る
ものを子 table 化し JSON column に丸めない。最低 table:
`workflows / actors / roles / cases / case_fields / case_documents / case_document_rows / lifecycle_events /
proposals / proposal_source_cases / agents / agent_samples / governance_model_inventory / drift_monitors /
escalations / notifications_read_state / synthetic_metric_rows / audit_events / demo_clock / schema_migrations`。
**`PRAGMA foreign_keys=ON; journal_mode=WAL; busy_timeout=5000`** を全 connection で強制 (startup test で検証)。
FK 原則 `ON DELETE RESTRICT`、物理削除 API は `db:reset-demo` 以外作らない。`proposal_source_cases(case_id)→cases`
で proposal↔case の多対多を表現 (現 `proposal.sourceCases: SourceCase[]`)。

**(b) audit_events append-only (DB レベル)**: 列 `id / seq INTEGER UNIQUE / entity_type / entity_id / case_id FK /
actor_id FK / action / occurred_at (tz付ISO) / before_json / after_json`。`BEFORE UPDATE/DELETE RAISE(ABORT,'immutable')`
trigger で immutability を強制 (API 層禁止だけに頼らない)。順序は `seq` 単調増 (現 StoreState.auditSeq を移植)。

**(c) KPI derived vs stored の分離** (これが最大の data 論点): KPI を 2 種に分ける。
  - `synthetic_metric_rows` (seed 固定): 承認率/上書き率/Alert率/差戻し率/denominator=980 等。**case row count から再計算しない**
    (P2 で件数が増えても denominator 不変、[仮説/要検証] の synthetic 値)。
  - `operational_count_views` (DB view 派生): Hub total / status 分布 / 承認待ち / 要対応 は cases から都度集計。
  変更時は KPI seed migration と画面文言を同時変更。どちらに属すかを全 KPI で table 化。

**(d) demo clock / 時刻 (既存規律の server 移植)**: client は既に `lib/dates.ts` の `NOW_ISO='2026-05-30T18:00:00+09:00'`
固定 clock + timezone 明示 + elapsed 派生 (stored しない) + 未来/不正の防御を持つ。**server も runtime now() を表示計算に使わず**、
`demo_clock(now_iso)` を DB に 1 行保持し同値を SSOT 化。received_at/occurred_at は tz 付 ISO-8601 統一、
`YYYY-MM-DD` only parse 禁止 (過去の UTC 月境界ずれ bug 回避)。elapsed は API 層で `demo_clock - received_at` 派生。

**(e) state machine SSOT**: case state 遷移ルール (差戻し/reversal/escalation/proposal/agent promotion 網羅) を
現 reducer action union から抽出し `state_transition_rules` artifact 化。server mutation のみが enforcer、
seed:validate は全 terminal status に必要 event sequence を機械検査。

**(f) migration / versioning**: `schema_migrations(version, name, applied_at, checksum)`、forward-only、
schema drift 検出、demo DB 破棄条件、`db:reset-demo` (現 persist.ts の SCHEMA_VERSION fallback 相当)。

**(g) その他**: PK/unique/FK index + filter index、数値精度方針 (MetricRow は現 string → canonical text か integer cents)、
UTF-8、soft-delete 方針、mutation 後は更新 row + seq を返す (read-after-write)。

### P0 #9 — セキュリティ統制契約 (Codex security review 反映、P0 blocking)
postv5 の価値は「Agent は propose/read のみ、Backend が operator-auth で execute」を**実証**することなので、統制設計の信頼性自体が
プロダクト価値。**UI 非表示は統制ではない。client は untrusted** とみなし、全 mutation/read API で authorization/validation/
state transition/audit を server 完結させる。以下を P0 で contract 化:

**(1) mutation invariant matrix** (**P0 #4 と単一 table に統合** — UX 列 [pending/success/denial UI・refetch・navigation・
toast・disabled] と security 列を 1 つの per-action mutation contract にする。table を 2 つに割らない):
全 StoreAction を展開し security 列
`action / endpoint / allowed roles / object-scope rule / required prior state / SoD subject / input schema / state transition /
audit event / denial response / server test 名`。server test で拒否証明: body actorId 指定でも session actor のみ使用 /
入力者=承認者の自己承認拒否 / flags>0 の承認拒否 / 非指名裁定者の escalation resolve 拒否 / 申請者本人の proposal・promotion
承認拒否 / direct state patch・unknown field 拒否。

**(2) auth/session identity (P0 #3 と統合、operator≠persona を分離)**: **`session_operator_id` (実操作者) と
`effective_actor_id` (demo persona) を常に分離記録**。これにより demo の自由 persona 切替と四眼 SoD 実証を両立 (同一実操作者が
入力↔承認を演じても audit に両 ID が残り、SoD subject は server 判定)。body actorId は常に無視、actor switch は server API のみ +
許可 demo actor 以外を拒否。signed header 採用時: server-only secret + 短期限 + nonce/jti replay reject、bundle に secret を含めない。
cookie session 採用時: HttpOnly/SameSite/Secure/session regeneration/CSRF token。

**(3) RBAC / IDOR**: 全 endpoint に role middleware + object-level authorization。test: 入力者が governance audit/model
governance/設定承認 API を読めない / ガバナンスが execute 系 mutation を実行できない / 他 actor の queue・通知・escalation を
ID 直指定で取得できない。**visible route と allowed endpoint を別列管理し endpoint 側拒否を必ず test**。

**(4) injection / 入力検証**: API boundary で params/query/body を zod 等で全 endpoint 検証。better-sqlite3 は
`db.prepare()` binding のみ (SQL 文字列連結禁止)。search/filter/sort/pagination は allowlist + server cap。mutation は
command schema のみ受付、entity row の mass-assignment 禁止、unknown field は reject。

**(5) audit 保全**: `audit_events` は DB trigger で UPDATE/DELETE 拒否 (P0 #8b) に加え、`GET /audit-events` は governance role
のみ / before_json·after_json は allowlist + redaction (PII/secret/full row dump を出さない) / reset が audit を消す場合は
DB 再作成限定 + hosted 無効化。

**(6) destructive 操作**: `db:reset-demo` は default disabled。localhost CLI 原則、HTTP endpoint 化する場合は
governance/admin role + CSRF + confirmation phrase + audit marker。hosted は `DEMO_RESET_ENABLED=false` default。
現 reset (表示データ初期化) も role gate を付与。

**(7) deploy / exposure baseline (P0 #1 deploy decision に統合)**: server default `127.0.0.1` bind (public host は明示承認)、
CORS allowlist (credentialed で wildcard 禁止)、stack/SQL error を client に返さない error sanitizer、security headers、
rate limit、DB file は repo 外 + permission 最小、secret は env (bundle 非混入)、log は actorId/action/ok|deny の allowlist のみ、
README/CLAUDE.md に「実顧客データ・実 PDF・実規制 cite なし、mock-only」明記 (mock-only = privacy safeguard)。

**(8) dependency**: P0 #7 package decision に `package/version/reason/license/native build/npm audit 結果/lockfile policy`。
lockfile commit + CI 再現性、`npm audit` 同等 gate を `check:server` に含める、不要 dependency を入れない。

---

## 作業項目 (4)
### item 1 — SQLite backend
P0 承認後に着手。P1a で server shell + schema + **minimal parity seed** + validator 実装、P1b で client API adapter。
現 15 capability 全てが API 経由で動くこと (機能 parity) が gate。

### item 2 — モックデータ拡充
**責務分離 (Codex 指摘): P1a = schema + 現 parity を満たす最小 seed + `seed:validate` 実装。P2 = realistic volume への拡充 +
validator 全項目 pass。** P2 で全 5 業務 (UC-BO-01〜05) に複数 case を多様な state (受付/AI処理/入力者確認/承認者承認/
反映/差戻し/エスカレーション/反映済) で、監査台帳・proposals・agents・notifications・escalations・config-approvals も増量、
各 role に複数 actor、時系列も realistic に。list/filter/pagination/metrics が「本物の量感」になる水準。
- **`npm run seed:validate`** (fail-fast): 5 workflowId / 全 CASE_LIST id coverage / CASE_DETAILS 相互参照 /
  KPI_ROWS 分母不変 (UC-BO-02=980 等) / **proposal.sourceCases[] が実在 case id (CASE_DETAILS 整合) に link** +
  agent.workflowId と proposal の workflow 一致 / state と audit_events の因果一致 (reflected case は受付→AI入力→
  入力者確認→承認者承認→反映 の event sequence 保有 等) / SoD actor 整合 / origin='manual' honesty (ocr/master/
  source_locator NULL) / future timestamp・timezone 欠落・YYYY-MM-DD only parse の禁止 /
  verification-only fixture を業務母数に混ぜない。
- **manual-entry 対応業務**: 現 CaseDraftV2 は 2 業務のみ手動起票可。「5 業務 seed」が手動起票 UI 拡張を含むか否かを
  P0/P2 で `manual-entry supported workflows: [list]` として明示 (含むなら field 定義/API validation/validator 対象に追加)。
- **P2 seed cardinality 目標** (恣意的 volume を防ぐ最低条件、role は P0 #2 確定 taxonomy に従う): cases = 各 workflow
  ≥50 件・各 CaseStatus が各 workflow に ≥3 件・30 日に分散 / actors = 入力者 ≥3・承認者 ≥3 (checker/business-approver の
  P0 mapping 込み)・ガバナンス担当者 ≥2 / proposals = 各 workflow ≥2 件 +
  pending/forwarded/approved/rejected 全網羅 / proposal_source_cases ≥3 (FK 検証) / agents = 各 workflow ≥1 +
  promotion 全 status 網羅 / escalations = 未裁定/proceed/sendback 各 ≥3 / audit_events = reflected case は
  受付→AI入力→入力者確認→承認者承認→反映 の順序保有。

### item 3 — 入力者/承認者/ガバナンス担当者の 3 ロール分離ナビ
**ロール taxonomy は P0 #2 で確定済** (P3 へ defer しない)。P3 は UI 実装:
- サイドバーをロール別に完全分離 (現操作者の role で menu セット切替)。共通画面は共有 (action は role-scoped)。
- HUB を 3 ロール別に分割 (入力者HUB / 承認者HUB / ガバナンスHUB)、**デザインの平仄を取る** (共通の構造原則・
  component・tone で再構築、現 HubV2 と BusinessApproverHubV2 の差異を解消)。
- screen 集合は P0 確定 taxonomy に従う (想定: 入力者=起票/入力者確認/手動起票/自 queue、承認者=承認待ち/最終承認/
  エスカレーション裁定/(業務責任者承認)/(設定承認)、ガバナンス=モニタリング/モデルガバナンス/監査台帳/AI提案レビュー、
  共通=検索/通知/案件詳細)。
- SoD は server-authoritative。**P3 a11y gate に postv4 残課題を畳み込む**: CaseDetailV2 の row-select を keyboard 操作可に
  (`<div onClick>` → role=button + tabIndex + onKeyDown + 対応 assertion)。

### item 4 — 業務 selector UX 刷新
左上業務プルダウン (全業務/法人住所変更/口座開設書類完備/口座振替登録/改印・代表者変更届/カード再発行) の UX 刷新。
**判断基準を先に固定**してから 2-3 案を mockup + 根拠付きで proposal → 承認 → 実装:
- keyboard a11y (Arrow/Home/End/Esc、現 roving tabindex 同等以上)、375px mobile、screen-reader name、
- 件数 badge の source (API query cache か静的計算か)、role sidebar と二重 navigation にならないこと、
- 既定 process と「全業務」filter の互換、ViewContext SSOT との同期。
候補例: 常設 segmented tabs / 左 rail process nav / command-palette quick-switcher / 件数付き filter bar。

---

## Phasing (P0 preflight → 実装、各 phase = branch → gate → PR → 承認 → 次へ)
- **P0 preflight** (承認必須): 9 項目 (deploy/auth-role/auth-session/mutation/test-migration/DB-ops/package layout/
  データモデル契約 #8/**セキュリティ統制契約 #9**) + SSOT 更新方針 を table 確定。
- **SSOT 更新** (P0 承認後・P1a 前): CLAUDE.md ×2 / pages.yml / README を backend 決定に整合。
- **P1a** server shell + schema + **minimal parity seed** + `seed:validate` 実装。gate: `check:server` green +
  audit_events append-only test pass + actor 自己承認拒否 test pass + seed:validate (parity) pass。
- **P1b** client API adapter (UI 不変)。gate: `check:all` green + 全 capability API 経由 parity (Playwright) +
  test migration table 通り移行 + loading/error test (route 別) unskip pass。
- **P2** data expansion (realistic volume)。gate: list/metrics/pagination realistic populate + seed:validate 全項目 pass +
  KPI SSOT 整合。
- **P3** role IA UI (taxonomy は P0 確定)。gate: 各ロール正しい menu/画面 + SoD server enforce + row-select keyboard 化 +
  axe 0 (全 route × 全ロール) + 視覚不変 (design-review)。
- **P4** selector UX (基準確定 → option proposal → 実装)。gate: keyboard/mobile/SR 基準充足 + axe 0 + 視覚整合。

## Verification gates (§7、各 gate は mechanical/falsifiable に)
- 拡張 **check:all** green: client (lint/no-op/types/types:test/design/test/build) + **server (`check:server` = types + unit/API test)**。
- **server test (security)**: SoD 自己承認拒否 / body actorId 無視 (session actor のみ) / 採番 / state 遷移 /
  audit_events append-only (UPDATE/DELETE 不可) / transaction atomicity / **RBAC endpoint 拒否 + cross-role IDOR (403) /
  injection (prepared statement) / mass-assignment 拒否 / operator≠persona の両 ID audit 記録**。
- **seed:validate** pass (上記項目)。
- Playwright axe-core: 全 route × 全ロールで serious/critical 0 (contrast+grayscale)。
- 機能 parity: 既存全 capability が新 backend 経由で動作 (Playwright flow)。
- loading/error: API 化で実状態が発生 → loading-error skip を route 別に unskip し実 assert。
- screenshots: 各ロール HUB + selector を before/after。
- 着手前 + 主要 phase で primary 前提 (依存 lib version、better-sqlite3 native、Node version) を re-verify。
- 各 phase 末に多角 adversarial QC (型/SoD/parity/視覚不変/doc 整合/append-only)。

## 承認 gate (strategic/irreversible — 停止して user 判断)
1. **P0**: 9 項目 (deploy / auth-role taxonomy / auth-session / mutation semantics / test-migration / DB-ops /
   package layout / **データモデル契約 #8** (DDL: 正規化/FK/audit append-only trigger/KPI derived-vs-stored/demo clock/
   state-transition rules/migration/cardinality) / **セキュリティ統制契約 #9** (mutation invariant matrix/operator≠persona/
   RBAC+IDOR/injection/audit 保全/destructive guard/deploy baseline/dependency))。
1b. **SSOT 更新** (P0 承認後・P1a 開始前の必須 gate): CLAUDE.md ×2 / pages.yml / README を backend 決定に整合させた上で着手。
2. P3: 3 ロール IA の UI (ロール専用 vs 共通画面の最終 layout)。
3. P4: selector の設計方向。
4. 最終: main 置換。

## Demo / deploy contract
postv5 以降は静的 Pages 単体では動かない。PR merge gate の証跡に追加:
- local `check:all` green (client + server)。
- server 起動手順 + `db:reset-demo` 手順を README/CLAUDE.md に記載。
- hosted URL または localhost での stakeholder smoke path (最低 3 route × 3 role)。
- `.github/workflows/pages.yml` を archive または server deploy workflow に切替えた旨を明記。

## 既知の残課題 (postv4 から畳み込み、ledger 記録済)
- `src/legacy/` graveyard (gate-excluded、dangling import 多数) の wholesale purge → P1a で server 移行と同時に削除候補。
- CaseDetailV2 の row-select keyboard 操作性 → P3 a11y gate に畳み込み済 (上記 item 3)。

## 進め方
各 phase で active SSOT (CLAUDE.md / wiring-ledger / 最新 dated plan) と live baseline (main/branch/PR 状態) を確認してから着手する
(rebase → re-diagnose)。以下の skill は **利用可能な環境では併用** (必須参照ではない): `backoffice-cycle-guard` (preflight/routing) /
`critical-review` (proposal 批判) / `design-review` (視覚規律) / `playwright` (実 route 証跡) / `citation-verification` (依存 lib version/API)。
skill 不在でも同等の確認を手動で行う。ledger (handoff-redesign/00-shared/) に living で記録。
