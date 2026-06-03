## P0 #8 — データモデル契約 (DDL: a–g)

postv5 で SoD / propose-execute 分離 / append-only 証跡を「サーバテストで falsifiable に」するための、SQLite 単一ファイル (WAL) スキーマ契約。本契約の deliverable = **CREATE TABLE DDL スケッチ + 制約・トリガ・ビュー定義 + 派生/格納分類表**。承認単位 = DDL (TypeScript object shape の直写しではない)。

> **right-sizing 宣言**: 本契約は「規制レビュアーが coherent と判断できる最小スキーマ + 統制破りを reject するサーバテスト」のみを目標とする。Postgres / sharding / read replica / 監査 WORM ストレージ / 暗号化 at-rest / マルチテナント分離は **すべて scope-out** (production hardening = DEFECT)。SQLite + better-sqlite3 + 単一 `.db` ファイル、demo データは `db:reset-demo` で物理再生成。
>
> **live grounding note**: 本スキーマは live store (postv4 @ `1e45ea7`) を ported したもので、過去の roadmap doc (`remediation-roadmap-*`, `p0-remediation-plan-*`) ではなく以下の live file を権威とする。drift があれば live を信じる。SCHEMA_VERSION=8 (`prototype-redesign/src/store/persist.ts:25`)、エンティティは `src/store/types.ts`、enum は `src/data/types.ts`、SoD は `src/store/reducer.ts`、demo clock は `src/lib/dates.ts:8`。

---

### (0) 全コネクション起動 PRAGMA (起動テストで検証)

すべての better-sqlite3 コネクションが open 直後に以下を発行する。サーバ起動テスト (`db:startup`) が `PRAGMA foreign_keys` 等を読み返して 1 / 'wal' / 5000 を assert する (= falsifiable)。

```sql
PRAGMA foreign_keys = ON;      -- FK 強制 (SQLite default OFF。OFF だと ON DELETE RESTRICT が無効 = 統制破り)
PRAGMA journal_mode = WAL;     -- 単一プロセス + 読み書き並行 (demo + テストで十分)
PRAGMA busy_timeout = 5000;    -- multi-tab / 並行テストの SQLITE_BUSY 緩和 (live multi-tab.test.ts の DB 版相当)
```

| 表名 | 必須列 | blocking 完了基準 | approval owner |
|---|---|---|---|
| (PRAGMA 契約) | `foreign_keys` / `journal_mode` / `busy_timeout` | `db:startup` テストが 3 PRAGMA を読み返し 1 / 'wal' / 5000 を assert。FK OFF を仕込んだ fixture で RESTRICT 違反が通ってしまうことを別テストで再現し、ON で reject されることを確認 | バックエンド技術責任者 |

---

### (a) 正規化方針とテーブル一覧

**enum 方針**: enum は `TEXT + CHECK (col IN (...))` で表現。lookup テーブル化するのは **運用で UI ラベルを変える可能性があるものだけ** (= `roles` の表示ラベル `入力者/承認者/業務責任者`、`workflows` の業務名)。`CaseStatus` / `ProposalStatus` / `TrustLevel` / `PromotionStatus` / 差戻し category / reconcile state は **CHECK 制約**で固定 (運用変更しない業務語彙ゆえ lookup table 不要、`src/data/types.ts:202,291` / `src/store/types.ts`)。

**nested fixture の扱い**: 検索 / FK / validator が要る child fixture は **子テーブルに正規化** (JSON カラムにダンプしない)。具体的に正規化するもの = `case_fields` (FieldReview[]、`src/data/types.ts:308`)、`case_documents` + `case_document_rows` (申請書類ビューア DocumentRow、`src/data/mock-case-detail.ts:22`)、`lifecycle_events` (CaseLifecycleEvent、`src/data/mock-case-detail.ts:12`)、`proposal_source_cases` (proposal↔case 多対多、列 source = `SourceCase {id,field,comment,date}` @ `src/data/mock-proposal-detail.ts:17`、※`ProposalSourceCase` @ `types.ts:213` は別型でこの列を持たない)、`agent_samples` (AgentSampleCase、`src/data/mock-agent-detail.ts:12`)。JSON 許容は `before_json` / `after_json` (audit の自由形 diff スナップショット) のみ。

**FK 原則**: すべて `ON DELETE RESTRICT`。物理削除は `db:reset-demo` (DB ファイル破棄→再 seed) のみ。論理削除カラムは置かない (下記 (g) soft-delete 参照)。

#### 最小テーブル一覧 (21)

行数列の意味: **(seed)** = seed が直接持つ固定 cardinality (テスト target は `<SOURCE>.length` で再導出可能、列に source を明記)。**(generated)** = `buildCaseDetail()` 等が CASE_LIST から合成する派生件数で、seed リテラルではない (formula を明記、行数テストは formula で target を再構成する)。

| # | テーブル | 役割 | 主な FK | 行数 (live seed) | 権威 source / formula |
|---|---|---|---|---|---|
| 1 | `workflows` | 5 業務 (UC-BO-01..05) | — | 5 (seed) | `WORKFLOW_NAME_TO_ID` 5 key (`src/store/seed.ts:12`) |
| 2 | `actors` | demo persona (3 operational DEMO_ACTORS) + net-new governance actor ≥2 | `role_id`→roles | **5** (seed: 3 + ≥2) | `DEMO_ACTORS.length` (3, `src/store/actors.ts:17`) + governance net-new (`actor-gov-legal`/`actor-gov-compliance`、P0 #2 ratified) |
| 3 | `roles` | inputter/checker/business-approver/**governance** + 表示ラベル | — | **4** (seed) | `ActorRole` 4 値 (additive `'governance'`、P0 #2 ratified、live は 3 値) |
| 4 | `cases` | 案件 (操作対象 = status/assignee/flags) | `workflow_id`, `assignee_id`, `input_approved_by` | 29 (seed) | `CASE_LIST.length` (`src/data/mock-case-list.ts`) |
| 5 | `case_fields` | FieldReview (要確認/一致/上書き) | `case_id` | 154 (generated) | Σ per-case `fieldsForWorkflow().length` (下表) |
| 6 | `case_documents` | 申請書類ビューア header | `case_id` | 29 (generated) | 1 / CASE_LIST 案件 (`buildCaseDetail` が各案件 1 document) |
| 7 | `case_document_rows` | 書類 1 欄 (DocumentRow) | `document_id` | ~154 (generated) | `buildDocRows(fields)` ≒ 案件 field 数 (`src/data/mock-case-detail.ts:324`) |
| 8 | `lifecycle_events` | 案件 lifecycle (業務 view) | `case_id` | ~145 (generated) | `buildLifecycle(status)` step 数 × 29 案件 (status 別 4-5 step、`mock-case-detail.ts:307`) |
| 9 | `proposals` | 提案 (status + decision) | `workflow_id`, `agent_id`, `forwarded_by` | **4** (seed) | `PROPOSAL_LIST.length` = 4 (PROP-2026-031/028/024/019、`src/data/mock-proposal-list.ts:18`) |
| 10 | `proposal_source_cases` | 提案↔元案件 多対多 | `proposal_id`, `case_id` | **12** (seed) | Σ `PROPOSAL_DETAILS[*].sourceCases.length` = 4 提案 × 3 = 12 (`mock-proposal-detail.ts:78,126,169,217`) |
| 11 | `agents` | Agent (trust/昇格/緊急停止) | `workflow_id`, `promotion_requested_by` | 5 (seed) | `AGENT_LIST.length` (`src/data/mock-agent-list.ts`) |
| 12 | `agent_samples` | 裏付け sample | `agent_id`, `case_id` | 16 (seed) | Σ `AGENT_DETAILS[*].samples.length` = 16 (`mock-agent-detail.ts`) |
| 13 | `governance_model_inventory` | モデル台帳 (MRM honest framing) | `agent_id` | 15 (seed) | `MODEL_INVENTORY.length` = 15 (`src/data/mock-governance.ts:33`) |
| 14 | `drift_monitors` | drift/bias 監視 | `workflow_id` | 10 (seed) | `DRIFT_MONITORS.length` = 10 (`src/data/mock-governance.ts:69`) |
| 15 | `escalations` | エスカレーション (裁定依頼) | `case_id`, `escalated_to`, `escalated_from` | **5** (4 unresolved + 1 resolved) (seed) | `SEED_ESCALATIONS` 4 (`seed.ts:48-53`) + CASE-2026-0120 resolved 1 (`seed.ts:59-65`) |
| 16 | `notifications_read_state` | 既読化した通知 id | `actor_id` (任意) | 0 (seed 空、`seed.ts:107`) | `readNotificationIds: []` |
| 17 | `synthetic_metric_rows` | KPI seed 固定値 (再計算しない) | `workflow_id` | 20 (seed) | Σ `KPI_ROWS` = 5 業務 × 4 metric = 20 (`src/data/mock-kpi.ts:20`) |
| 18 | `audit_events` | append-only 操作証跡 | `case_id`, `actor_id` | 0 (seed 空、操作で増える、`seed.ts:109`) | `auditEvents: []` |
| 19 | `demo_clock` | demo 基準時刻 SSOT (単一行) | — | 1 (seed) | `NOW_ISO` 単一値 (`src/lib/dates.ts:8`) |
| 20 | `schema_migrations` | forward-only migration 台帳 | — | N (適用済 migration 数) | コード側 migration ファイル数 |
| 21 | `historical_cases` | read-only 参照専用案件 (提案 sourceCases drill-in 先、CASE_LIST 非対象) | — | **5** (seed) | `HISTORICAL_CASE_ROWS.length` = 5 (CASE-2026-0098/0087/0079/0118/0106、`mock-case-detail.ts:427`) |

> **case_fields generated formula (行数テストの target 再構成)**: `case_fields` は seed リテラルではなく `CASE_DETAILS` = `CASE_LIST.map(buildCaseDetail)` の派生 (`mock-case-detail.ts:419-420`)。各 workflow の field 数 = `fieldsForWorkflow(workflow).length`、live は全 workflow 5 field。CASE_LIST 分布 = 法人住所変更 9 / 口座開設書類完備 5 / 口座振替登録 5 / 改印・代表者変更届 5 / カード再発行 6 (= 29)。canonical `CASE-2026-0142` のみ手書き 9 field で上書き (`mock-case-detail.ts:61,422`、法人住所変更 group の合成 5 を置換)。**P1a 実装時訂正**: canonical `CASE-2026-0142` は live で **5 field** (本 contract旧版の「9 field」は誤り)、法人住所変更は **8 件** (9 ではない、CASE_LIST.length=29 の内訳 = 法人住所変更 8 / 口座開設 5 / 口座振替 5 / 改印 5 / カード 6)。全 workflow が 5-field set ゆえ store 行数 = 29 × 5 = **145** (旧 154 は 0142=9 + 法人住所変更=9 の二重誤り)。seed:validate は literal ではなく `Σ CASE_DETAILS[id].fields.length` から再導出するため、この訂正は count gate を自動追従する。
> **HISTORICAL_CASE_ROWS の扱い (read-only `historical_cases` に分離)**: `CASE_DETAILS` には CASE_LIST に **載らない** 参照専用 5 案件 (`HISTORICAL_CASE_ROWS`、`mock-case-detail.ts:427`、提案 sourceCases の drill-in 先 = CASE-2026-0098/0087/0079/0118/0106) も登録される。これらは store/seed されない (= `cases` テーブルに入らない)。本契約は HISTORICAL を **read-only テーブル `historical_cases` (#21)** に分離し、`HISTORICAL_CASE_ROWS` (5 行) から seed する。`cases` の行数 (= `CASE_LIST.length` 由来) には HISTORICAL の +5 を混ぜない (cardinality テストの落とし穴回避)。`proposal_source_cases.case_id` は `cases` への hard FK を持たず、`seed:validate` が **全 `case_id` ∈ (`cases` ∪ `historical_cases`)** であることを assert する (drill-in 先が必ず一方に存在 = NotFound を防ぐ)。`historical_cases` は更新操作を受けない参照専用 (`audit_events` / mutation 対象外)。

> live は escalation を `cases.escalation` に denormalize しているが (`src/store/types.ts:47`)、本契約は **別テーブル `escalations`** に分離する。理由: `/escalations` queue の母集合 = `resolution IS NULL` の行を index 付きで引く必要があり (`src/store/seed.ts:48`)、また SoD lock (`escalated_to` のみ裁定可、`src/store/reducer.ts:144`) を FK + サーバ mutation で強制するため。1 案件 0..1 escalation を `UNIQUE(case_id)` で保証。

#### DDL スケッチ (中核テーブル)

```sql
-- 1. workflows (lookup: 業務名は運用で変わりうる)
-- 注: trust は live では per-AGENT (AgentEntity.trust、src/store/types.ts:78 / AGENT_LIST 各行) に存在し、
--     workflow に trust 列は無い (live に WorkflowEntity 自体が無い)。trust は agents テーブルにのみ持たせ、
--     workflow には denormalize しない (= live shape を捏造しない)。Hub の trustLabel/trustEn は表示文字列で enum ではない (mock-hub.ts:11)。
CREATE TABLE workflows (
  id            TEXT PRIMARY KEY,                 -- 'UC-BO-01'..'UC-BO-05'
  name          TEXT NOT NULL UNIQUE,             -- '法人住所変更' 等 (src/store/seed.ts:12)
  display_order INTEGER NOT NULL
);

-- 3. roles (lookup: 表示ラベルは運用で変わりうる、src/store/actors.ts:31)
-- 'governance' は P0 #2 ratified の net-new READ-ONLY role (additive、live は 3 値)。
CREATE TABLE roles (
  id    TEXT PRIMARY KEY                          -- 'inputter'|'checker'|'business-approver'|'governance'
          CHECK (id IN ('inputter','checker','business-approver','governance')),
  label TEXT NOT NULL                             -- '入力者'|'承認者'|'業務責任者'|'ガバナンス担当者'
);

-- 2. actors (3 operational DEMO_ACTORS + net-new governance ≥2、src/store/actors.ts:17 + P0 #2)
CREATE TABLE actors (
  id      TEXT PRIMARY KEY,                       -- 'actor-inputter'..、'actor-gov-legal'/'actor-gov-compliance'
  name    TEXT NOT NULL,                          -- '山田太郎' 等、governance は 'リーガル担当'/'コンプラ担当'
  role_id TEXT NOT NULL REFERENCES roles(id) ON DELETE RESTRICT  -- governance actor は role_id='governance'
);

-- 4. cases (操作対象。enum は CHECK 固定、rich data は子テーブル)
CREATE TABLE cases (
  id                TEXT PRIMARY KEY,             -- 'CASE-2026-0142'
  workflow_id       TEXT NOT NULL REFERENCES workflows(id) ON DELETE RESTRICT,
  status            TEXT NOT NULL
                      CHECK (status IN ('pending','ready','sent-back',
                                        'business-approval-waiting','reflected')),
  assignee_name     TEXT,                          -- 表示用所有者名 (live owner、NULL = 未割当)。**FK にしない** (P1a 実装時訂正): live owner は自由氏名で actor 非対象の値 (佐藤花子 / 高橋) を含むため actors FK 不能。identity/SoD は input_approved_by (= actor) が担い、assignee は表示専用名。通知 queue IDOR (#9-2 row1) は assignee 氏名 vs persona 氏名で照合 (氏名→actorId 正規化、09 D4)。
  flags             INTEGER NOT NULL DEFAULT 0 CHECK (flags >= 0),  -- 要確認数。>0 は一括承認不可
  origin            TEXT NOT NULL DEFAULT 'ai' CHECK (origin IN ('ai','manual')), -- src/data/mock-case-detail.ts:38
  input_approved_by TEXT REFERENCES actors(id) ON DELETE RESTRICT, -- SoD discriminant (src/store/reducer.ts:88)
  -- 差戻し記録 (理由を捨てない、reducer.ts:121)
  sendback_reason   TEXT,
  sendback_category TEXT,
  -- 反映済の訂正/取消 (不可逆 guard discriminant、reducer.ts:171)
  reversal_kind     TEXT CHECK (reversal_kind IN ('訂正','取消')),
  reversal_reason   TEXT,
  received_at       TEXT NOT NULL,                -- tz-aware ISO-8601 (下記 (d))
  CHECK ((reversal_kind IS NULL) = (reversal_reason IS NULL)) -- kind/reason は同時に在/不在
);

-- 5. case_fields (FieldReview、要確認/一致/上書き。検索・per-field 確定ゆえ子テーブル化)
CREATE TABLE case_fields (
  id              INTEGER PRIMARY KEY,
  case_id         TEXT NOT NULL REFERENCES cases(id) ON DELETE RESTRICT,
  field_label     TEXT NOT NULL,
  ai_value        TEXT,
  master_value    TEXT,
  previous_value  TEXT,                           -- before/after の現行登録値 (types.ts:314)
  human_value     TEXT,                           -- 人が確定/上書きした値 (= overrides、reducer.ts:111)
  reconcile_state TEXT NOT NULL
                    CHECK (reconcile_state IN ('matched','normalized_match','needs_review',
                                               'not_extracted','manually_confirmed','escalated')),
  resolved        INTEGER NOT NULL DEFAULT 0 CHECK (resolved IN (0,1)), -- CaseEntity.resolvedFieldIds (store/types.ts:33) を per-field 正規化。live は case 側 string[]、本契約は field 行の boolean に分解
  confidence_milli INTEGER CHECK (confidence_milli BETWEEN 0 AND 1000), -- 0.000-1.000 を整数化 (下記 g)。live FieldReview.confidence は OPTIONAL ゆえ NULL 可 (大多数の合成 field は NULL)
  UNIQUE (case_id, field_label)
);
-- 注: CaseEntity.resolvedFieldIds (store/types.ts:33) は live では cases 側の string[]。
--     本契約はこれを case_fields.resolved (per-field boolean) に正規化する (case に array 列を持たせない)。
--     resolved の集合 = ある case の resolved=1 行の field_label 群、が live resolvedFieldIds と一致することをサーバテストで assert。

-- 10. proposal_source_cases (proposal↔case 多対多、fixture lineage)
-- 列 source = SourceCase {id, field, comment, date} @ src/data/mock-proposal-detail.ts:17
--   (※ types.ts:213 ProposalSourceCase は {caseId,title,category,sendbackReason} の別型で field/comment/date を持たない)。
-- observed_date は live `SourceCase.date` (例 '2026-05-22') の rename。live は YYYY-MM-DD の表示専用文字列 (下記 (d) parse 禁止対象)。
-- case_id は cases への hard FK を持たない (drill-in 先には HISTORICAL_CASE_ROWS = cases に載らない参照専用案件が含まれるため)。
-- 代わりに seed:validate が case_id ∈ (cases ∪ historical_cases) を assert する (下記 (a) 注 + テーブル #21)。
CREATE TABLE proposal_source_cases (
  proposal_id    TEXT NOT NULL REFERENCES proposals(id) ON DELETE RESTRICT,
  case_id        TEXT NOT NULL,                   -- cases または historical_cases の id (hard FK なし、seed:validate で和集合 membership 検証)
  field          TEXT NOT NULL,                   -- どの項目で起きたか (live SourceCase.field)
  comment        TEXT NOT NULL,                   -- 日次分析の指摘原文 (誤確定→是正の実例、live SourceCase.comment)
  observed_date  TEXT NOT NULL,                   -- live SourceCase.date (YYYY-MM-DD 表示専用、経過計算に使わない)
  PRIMARY KEY (proposal_id, case_id)
);

-- 11. agents (trust/昇格/緊急停止、src/store/types.ts:74)
CREATE TABLE agents (
  id                    TEXT PRIMARY KEY,
  workflow_id           TEXT NOT NULL REFERENCES workflows(id) ON DELETE RESTRICT,
  trust                 TEXT NOT NULL
                          CHECK (trust IN ('supervised','checkpoint','autonomous','n/a')),
  promotion_status      TEXT NOT NULL DEFAULT 'none'
                          CHECK (promotion_status IN ('none','requested','approved')),
  promotion_requested_by TEXT REFERENCES actors(id) ON DELETE RESTRICT, -- SoD discriminant (reducer.ts:262)
  promotion_sendback_reason TEXT,
  paused                INTEGER NOT NULL DEFAULT 0 CHECK (paused IN (0,1)),
  paused_reason         TEXT,
  trust_before_pause    TEXT CHECK (trust_before_pause IN ('supervised','checkpoint','autonomous','n/a')),
  -- 停止中のみ原状を保持 (reducer.ts:284 / 299)
  CHECK ((paused = 1) OR (trust_before_pause IS NULL))
);
```

#### DDL スケッチ (残テーブル: column-level DDL を補完)

中核以外のテーブル DDL を concise に補完 (PK / 必須列 / FK / CHECK / seed source を各 1 行明記、exhaustive prose は避ける right-sized)。

```sql
-- 9. proposals (提案 = status + decision、src/store/types.ts:58 ProposalEntity + mock-proposal-list.ts)
CREATE TABLE proposals (
  id              TEXT PRIMARY KEY,               -- 'PROP-2026-031' (seed: PROPOSAL_LIST.id、mock-proposal-list.ts:18)
  workflow_id     TEXT NOT NULL REFERENCES workflows(id) ON DELETE RESTRICT,
  status          TEXT NOT NULL
                    CHECK (status IN ('pending-triage','forwarded','approved','rejected')), -- data/types.ts:202
  agent_id        TEXT REFERENCES agents(id) ON DELETE RESTRICT, -- 提案元 Agent (任意)
  forwarded_by    TEXT REFERENCES actors(id) ON DELETE RESTRICT, -- SoD discriminant (送付者≠承認者、store/types.ts:71)
  -- 却下/差戻し判断記録 (理由を捨てない、ProposalEntity.decision、store/types.ts:64)
  decision_kind   TEXT CHECK (decision_kind IN ('reject','sendback')),
  decision_reason TEXT,
  decision_category TEXT,
  change_area     TEXT NOT NULL,                  -- 平易語の改定内容 (ProposalListRow.changeArea)
  impact_count    INTEGER NOT NULL CHECK (impact_count >= 0), -- 影響件数 (ProposalListRow.impactCount)
  CHECK ((decision_kind IS NULL) = (decision_reason IS NULL)) -- kind/reason 同時在/不在
);
-- seed source: PROPOSAL_LIST (4 行、mock-proposal-list.ts:18)。status='rejected' は PROP-2026-019。

-- 12. agent_samples (裏付け sample、AgentSampleCase @ mock-agent-detail.ts:12)
CREATE TABLE agent_samples (
  id        INTEGER PRIMARY KEY,
  agent_id  TEXT NOT NULL REFERENCES agents(id) ON DELETE RESTRICT,
  case_id   TEXT NOT NULL REFERENCES cases(id) ON DELETE RESTRICT, -- 紐づく案件。samples の case は全て CASE_LIST 内 (mock-agent-detail.ts、historical 非参照ゆえ hard FK 保持)
  outcome   TEXT NOT NULL,                        -- 結果 (AgentSampleCase.outcome)
  tone      TEXT NOT NULL CHECK (tone IN ('success','alert')), -- caseResultTone 由来 (手書きしない、mock-agent-detail.ts:35)
  note      TEXT NOT NULL,                        -- 補足 (AgentSampleCase.note)
  kpi       TEXT NOT NULL                         -- 紐づく KPI (参照用、画面非表示)
);
-- seed source: Σ AGENT_DETAILS[*].samples = 16 行 (mock-agent-detail.ts)。

-- 13. governance_model_inventory (モデル台帳 MRM honest framing、ModelInventoryRow @ mock-governance.ts:16)
CREATE TABLE governance_model_inventory (
  id            INTEGER PRIMARY KEY,
  agent_id      TEXT NOT NULL REFERENCES agents(id) ON DELETE RESTRICT, -- 紐づく Agent (route 連携)
  process       TEXT NOT NULL,                    -- 業務名
  model         TEXT NOT NULL,                    -- モデル名 (embedded、非生成)
  version       TEXT NOT NULL,                    -- 個別 model 版 ('ocr-2.4' 等、決定 lineage 版分解)
  purpose       TEXT NOT NULL,
  owner         TEXT NOT NULL,
  validation    TEXT NOT NULL
                  CHECK (validation IN ('独立検証済','検証中','要再検証')), -- ValidationStatus
  last_validated TEXT NOT NULL,                   -- 直近独立検証日 (date-only 表示専用、下記 (d) parse 禁止対象)
  scope         TEXT NOT NULL
                  CHECK (scope IN ('MRM 適用 (非生成 model)','rule-based (model 定義外)','生成・agentic (SR 26-2 scope 外)')) -- SR 26-2 honest 区分
);
-- seed source: MODEL_INVENTORY (15 行、mock-governance.ts:33)。confidence 生数字を持つ静的台帳の一系統。

-- 14. drift_monitors (drift/bias 監視、DriftMonitorRow @ mock-governance.ts:59、全て [仮説/要検証])
CREATE TABLE drift_monitors (
  id          INTEGER PRIMARY KEY,
  workflow_id TEXT NOT NULL REFERENCES workflows(id) ON DELETE RESTRICT, -- process→workflow 正規化
  metric      TEXT NOT NULL,                      -- '入力分布 drift (PSI)' 等
  value       TEXT NOT NULL,                      -- 監視値 (表示文字列、再計算しない)
  threshold   TEXT NOT NULL,                      -- '< 0.10' 等
  status      TEXT NOT NULL CHECK (status IN ('安定','監視中','要確認'))
);
-- seed source: DRIFT_MONITORS (10 行、mock-governance.ts:69)。

-- 15. escalations (裁定依頼、live cases.escalation を別テーブルに正規化、store/types.ts:47)
CREATE TABLE escalations (
  case_id        TEXT PRIMARY KEY REFERENCES cases(id) ON DELETE RESTRICT, -- 1 案件 0..1 (UNIQUE = PK)
  reason         TEXT NOT NULL,                   -- 裁定依頼理由
  category       TEXT NOT NULL,                   -- '業務ルール抵触' 等
  escalated_to   TEXT NOT NULL REFERENCES actors(id) ON DELETE RESTRICT,   -- 裁定者 ('actor-approver'、SoD lock = この actor のみ裁定可)
  escalated_from TEXT NOT NULL REFERENCES actors(id) ON DELETE RESTRICT,   -- 起票者 (自己裁定 block 用、reducer.ts:144)
  resolution     TEXT CHECK (resolution IN ('proceed','sendback'))         -- NULL = 未裁定 (= /escalations queue 母集合、reducer.ts:44)
);
-- seed source: SEED_ESCALATIONS 4 (未裁定、seed.ts:48) + CASE-2026-0120 resolution='proceed' 1 (seed.ts:63) = 5 行。

-- 16. notifications_read_state (既読化した通知 id、StoreState.readNotificationIds @ store/types.ts:129)
CREATE TABLE notifications_read_state (
  notification_id TEXT NOT NULL,                  -- 既読化した通知 id (universe は selector 算出、ここは既読 fact のみ)
  actor_id        TEXT REFERENCES actors(id) ON DELETE RESTRICT, -- どの actor が既読化したか (任意)
  PRIMARY KEY (notification_id, actor_id)
);
-- seed source: readNotificationIds = [] (seed 空、seed.ts:107)。未読数 = 通知 universe − この表 (派生 api)。

-- 21. historical_cases (read-only 参照専用案件、HISTORICAL_CASE_ROWS @ mock-case-detail.ts:427)
-- 提案 sourceCases drill-in 先で CASE_LIST に載らない 5 案件。store/mutation/audit 対象外 (純 read-only)。
CREATE TABLE historical_cases (
  id           TEXT PRIMARY KEY,                  -- 'CASE-2026-0098' 等 (cases と id 空間 disjoint)
  workflow_id  TEXT NOT NULL REFERENCES workflows(id) ON DELETE RESTRICT,
  status       TEXT NOT NULL
                 CHECK (status IN ('pending','ready','sent-back','business-approval-waiting','reflected')), -- seed は全行 'reflected'
  owner_name   TEXT NOT NULL,                     -- 表示用所有者名 (CaseListRow.owner、actors FK にしない: 表示専用 read-only)
  received_at  TEXT NOT NULL,                     -- tz-aware ISO-8601 (例 '2026-05-22T09:00:00+09:00')
  history_note TEXT NOT NULL                      -- 「誤確定→是正の実例」注記 (mock-case-detail.ts historyNote)
);
-- seed source: HISTORICAL_CASE_ROWS (5 行: CASE-2026-0098/0087/0079/0118/0106、mock-case-detail.ts:427)。
```

| 表名 | 必須列 | blocking 完了基準 | approval owner |
|---|---|---|---|
| 全 21 テーブル | 上記一覧の「主な FK」+ 各 enum CHECK | `db:reset-demo` 後に行数テストが各テーブルの target を**権威 source.length から再導出**して assert (リテラル数値を手書きしない): cases=`CASE_LIST.length`(29) / historical_cases=`HISTORICAL_CASE_ROWS.length`(**5**) / agents=`AGENT_LIST.length`(5) / proposals=`PROPOSAL_LIST.length`(**4**) / governance=`MODEL_INVENTORY.length`(15) / drift=`DRIFT_MONITORS.length`(10) / escalations=`SEED_ESCALATIONS.length`+resolved(4+1=**5**) / synthetic_metric_rows=`Σ KPI_ROWS`(20) / workflows=5 / roles=4 (3 live + governance) / actors=`DEMO_ACTORS.length`(3)+governance(≥2)=5。generated テーブル (case_fields=154 / case_documents=29 / lifecycle=~145) は上記 formula で再構成し、`cases` 行数に HISTORICAL_CASE_ROWS(+5) を混ぜない (HISTORICAL は historical_cases へ)。各 enum CHECK に不正値を INSERT して reject されることをテスト | データモデル責任者 + 業務責任者 (enum 語彙) |
| `proposal_source_cases` | `proposal_id` FK / `case_id` (hard FK なし) / `field` / `comment` / `observed_date` | (1) 多対多が成立 (1 proposal が複数 case を引く)、(2) `case_id` は `cases` への hard FK を持たない (HISTORICAL drill-in を許すため) — その代わり `seed:validate` が全 `case_id` ∈ (`cases` ∪ `historical_cases`) を assert し、和集合外の case_id (例: 存在しない CASE-XXXX) を仕込むと検証 fail することをテストで確認 | データモデル責任者 |
| `historical_cases` | `id` PK / `workflow_id` FK / `status` CHECK / `owner_name` / `received_at` / `history_note` / seed source `HISTORICAL_CASE_ROWS` | (1) 行数 = `HISTORICAL_CASE_ROWS.length`(5)、(2) `cases` と id 空間が重複しない (両テーブルの id 集合が disjoint)、(3) `proposal_source_cases.case_id` の和集合 membership を満たす、(4) read-only (mutation / audit_events 対象外、UPDATE 経路が無いことを確認) | データモデル責任者 |
| `proposals` | `id` PK / `workflow_id` FK / `status` CHECK(4) / `agent_id` FK / `forwarded_by` FK (SoD) / `decision_kind` CHECK / `change_area` / `impact_count` / seed `PROPOSAL_LIST` | (1) 行数=`PROPOSAL_LIST.length`(4)、(2) status enum に不正値 INSERT が reject、(3) `decision_kind`/`decision_reason` の片方欠落が CHECK で reject、(4) status='rejected' (PROP-2026-019) が到達可能 | データモデル責任者 + 業務責任者 |
| `agent_samples` | `id` PK / `agent_id` FK / `case_id` FK→cases (samples は全て CASE_LIST 内、historical 非参照) / `outcome` / `tone` CHECK(2) / `note` / `kpi` / seed `AGENT_DETAILS[*].samples` | (1) 行数=Σ samples(16)、(2) `tone` が success/alert 以外で reject、(3) 存在しない case_id INSERT が FK で reject | データモデル責任者 |
| `governance_model_inventory` | `id` PK / `agent_id` FK / `process`/`model`/`version`/`purpose`/`owner` / `validation` CHECK(3) / `last_validated` (date-only) / `scope` CHECK(3) / seed `MODEL_INVENTORY` | (1) 行数=`MODEL_INVENTORY.length`(15)、(2) `validation`/`scope` enum に不正値 INSERT が reject、(3) `last_validated` は経過計算に使わない (date-only 表示専用) | ガバナンス責任者 + データモデル責任者 |
| `drift_monitors` | `id` PK / `workflow_id` FK / `metric`/`value`/`threshold` / `status` CHECK(3) / seed `DRIFT_MONITORS` | (1) 行数=`DRIFT_MONITORS.length`(10)、(2) `status` が 安定/監視中/要確認 以外で reject、(3) `value`/`threshold` は表示文字列で再計算しない | データモデル責任者 |
| `escalations` | `case_id` PK(=UNIQUE) FK / `reason`/`category` / `escalated_to` FK / `escalated_from` FK / `resolution` CHECK(nullable) / seed `SEED_ESCALATIONS`+resolved | (1) 行数=4+1(5)、(2) 2 件目同一 case_id INSERT が PK で reject (1 案件 0..1)、(3) `resolution` NULL 行のみ `/escalations` queue 母集合、(4) `resolution` に proceed/sendback 以外で reject | データモデル責任者 + 業務責任者 |
| `notifications_read_state` | `notification_id`+`actor_id` 複合 PK / `actor_id` FK (任意) / seed 空 | (1) seed 後 0 行 (`readNotificationIds:[]`)、(2) 既読化 mutation 後に行が増え冪等 (同一 id 二重 markRead が PK 重複せず no-op)、(3) 未読数 = 通知 universe − 本表 (派生 api テスト) | データモデル責任者 |

---

### (b) audit_events — DB レベル append-only

live は `StoreState.auditEvents` への push-only + 決定的 `auditTs(auditSeq)` (`src/store/reducer.ts:36,66`)。これを DB レベルで **immutable** にする = UPDATE/DELETE を BEFORE トリガで RAISE(ABORT)。`seq` は live `auditSeq` を port した単調増加。

> **dual-identity (SD-1)**: postv5 は operator≠persona を分離する。`session_operator_id` = verified token (`X-Operator-Token`) 由来の実 operator (`op-demo-1` / `op-demo-2`)。operator は **CODE CONSTANT (`OPERATORS`)** であって actor 行ではない (= `actors` に operator を seed しない、operator/persona を collapse させない)。よって `session_operator_id` は **`TEXT NOT NULL` で `actors(id)` への FK を持たず**、`CHECK (session_operator_id IN ('op-demo-1','op-demo-2'))` で語彙を固定する (right-sized、falsifiable)。`actor_id` (= effective_actor_id) = リクエスト body の `{ actorId }` を server 検証した persona。検証 universe は **`allowed_actors` = seed 済 `actors` テーブル全行 = 3 operational + governance ≥2 = 5 actor** (3 DEMO_ACTORS 限定ではない)。body `{ actorId }` は actorId ∈ `allowed_actors` の時のみ valid、未知 id は reject (UNKNOWN_ACTOR)。governance actorId も persona 検証 (layer 1) を **PASS** し、続く authorization (layer 2) で governance role の全 mutation reject に到達する (3 DEMO_ACTORS のみで検証すると governance-boundary テストが layer 2 に到達できず検証不能になる)。なお **UI persona switcher は 3 operational actor** (入力者/承認者間の demo 切替) のままで、governance は operational switcher ではなく P3 governance view で操作する — この「UI 切替 = 3」を server の effective-actor 検証規則に流用しない。body の actorId は `actor_id` (effective) のみを決め、`session_operator_id` は決して書き換えない。**audit_events は両方を書き込み行で NOT NULL に記録** (単一 operator が persona を演じる demo では `session_operator_id` を operator 定数で seed、`actor_id` は演じた persona id)。`session_operator_id` は **audit provenance 専用** = 「1 人の実 operator が両 persona を演じた」かをレビュアーが後から検知するための記録であり、SoD 比較キーではない (SoD 比較は effective_actor_id、#8 では非検証 = 下記移譲)。

> **live `LedgerEvent` (`src/store/types.ts:101-113`) との差分 (意図的 drop / add を明示)**:
> - **drop**: `doc` / `policy` / `confidence` — live `logEvent` がこの 3 列を**常に `'—'`** で埋める (`reducer.ts:59-62`、操作証跡では値を持たない) ため、DB 列としては持たせず drop する (constant '—' を列にしても情報量ゼロ)。本 append-only 操作証跡 (live `auditEvents`) に **`confidence` 列は持たせない**。confidence が実値を持つのは静的参照台帳 **`OBS_LEDGER` / `CROSS_LEDGER`** (model-governance) 側のみで、confidence-redaction (生数字を業務 view に出さない) の検証はそちらの static governance テーブルに **re-point** する (operational audit_events には confidence 列が無いため redaction 対象でもない)。
> - **role**: live `LedgerEvent.role` = 操作 actor の `roleLabel` (`reducer.ts:56`)。本契約では列を持たず `actor_id → roles.label` で**派生**する (正規化、二重持ちしない、列に格納しない)。`session_operator_id` も同様に `roles` 経由で役割を引ける。
> - **approvalId**: live は承認者承認時のみ `A-${8000 + auditSeq}` を採番 (`reducer.ts:95`)。本契約では `seq` から同式で派生でき独立列にしないが、必要なら nullable `approval_id` 列を任意追加可 (非 blocking)。
> - **add**: `entity_type` / `entity_id` / `before_json` / `after_json` は live `LedgerEvent` に直接対応列が無い (live は `caseId` + `beforeAfter` 1 文字列要約)。`entity_type/id` は agent/proposal 操作も同一台帳に載せるための正規化 (live `logEvent` は caseId 主体だが agent/proposal mutation も append する)、`before_json/after_json` は live `beforeAfter` 要約文字列を構造化 diff へ拡張する付加列 (内容粒度は DM-2 で「変化フィールドのみ」default)。
> - **session_operator_id**: SD-1 dual-identity の operator 列。`X-Operator-Token` (HMAC-SHA256 署名、payload `operator_id.issued_at.expires_at.jti`、secret env `BOAI_SESSION_SECRET`、expiry 30 min) を検証して得た実 operator id。operator は CODE CONSTANT (`OPERATORS` = `op-demo-1` / `op-demo-2`) であり `actors` 行ではないため、この列は **`actors(id)` への FK を持たず `TEXT NOT NULL` + `CHECK (session_operator_id IN ('op-demo-1','op-demo-2'))`** で固定する。body の actorId では決して上書きしない。audit provenance 専用 (SoD 比較キーではない)。

```sql
-- 18. audit_events (append-only、UPDATE/DELETE 禁止)
-- SD-1 dual-identity: actor_id (= effective_actor_id、検証済 body { actorId }) と
--   session_operator_id (検証済 X-Operator-Token 由来の実 operator) を両方、書き込み行で NOT NULL 記録。
--   role は格納せず actor_id->roles.label で派生。confidence 列は持たない (静的 OBS_LEDGER/CROSS_LEDGER 側のみ)。
CREATE TABLE audit_events (
  id          INTEGER PRIMARY KEY,
  seq         INTEGER NOT NULL UNIQUE,            -- 単調増加 (live auditSeq、reducer.ts:66)
  entity_type TEXT NOT NULL CHECK (entity_type IN ('case','proposal','agent')),
  -- entity_type は ('case','proposal','agent') の 3 値で固定。P0 reset 契約は CLI db:reset-demo のみ
  --   (DB を物理再生成 = migration 再適用 + 再 seed、audit_events は空で再 seed) ゆえ reset 証跡行が出ず、
  --   'reset'/'system' 等の entity_type を P0 で追加しない (HTTP reset は OUT-OF-P0、別 role なら将来拡張)。
  entity_id   TEXT NOT NULL,
  case_id     TEXT REFERENCES cases(id) ON DELETE RESTRICT, -- 案件証跡 (agent/proposal は NULL 可)
  -- actor_id = effective_actor_id (行使した役割 = 検証済 body { actorId })。検証 universe = allowed_actors
  --   = seed 済 actors 全行 (3 operational + governance ≥2 = 5)、3 DEMO_ACTORS 限定ではない。書き込み行で NOT NULL
  actor_id    TEXT NOT NULL REFERENCES actors(id) ON DELETE RESTRICT,
  -- session_operator_id = 検証済 X-Operator-Token (HMAC-SHA256、secret BOAI_SESSION_SECRET) 由来の実 operator。
  --   operator は CODE CONSTANT (OPERATORS = op-demo-1/op-demo-2)、actors 行ではない → FK なし、CHECK で語彙固定。
  --   audit provenance 専用 (SoD 比較キーではない = effective_actor_id で比較)。body の actorId では決して上書きしない。
  --   書き込み行で NOT NULL (単一 operator が persona を演じる demo は operator 定数で seed、actor_id は演じた persona)
  session_operator_id TEXT NOT NULL CHECK (session_operator_id IN ('op-demo-1','op-demo-2')),
  action      TEXT NOT NULL,                      -- '入力者承認'|'差戻し'|'緊急停止' 等 (JP 業務語)
  occurred_at TEXT NOT NULL,                      -- tz-aware ISO-8601 へ正規化 (下記注: live auditTs は非 ISO 文字列、port で変換 + テスト)
  before_json TEXT,                               -- 操作前スナップショット (自由形 diff)
  after_json  TEXT                                -- 操作後スナップショット
  -- role 列なし (actor_id->roles.label で派生)。confidence 列なし (OBS_LEDGER/CROSS_LEDGER 側に re-point)
);

CREATE TRIGGER audit_events_no_update
  BEFORE UPDATE ON audit_events
  BEGIN SELECT RAISE(ABORT, 'audit_events is immutable'); END;

CREATE TRIGGER audit_events_no_delete
  BEFORE DELETE ON audit_events
  BEGIN SELECT RAISE(ABORT, 'audit_events is immutable'); END;
```

> **occurred_at の正規化 (live は tz-aware ISO ではない)**: live `auditTs(seq)` は **`'2026-05-30 18:00:00'` 形式** (空白区切り・`T` なし・`+09:00` offset なし) を返す (`src/store/reducer.ts:36-40`)。これは ISO-8601 でも tz-aware でもない。demo_clock の `now_iso` (`'2026-05-30T18:00:00+09:00'`、tz-aware) とは別の文字列規約である。本契約は port 時に audit 時刻を **tz-aware ISO-8601 に正規化** (`demo_clock.now_iso` の tz を継承し、`18:00 + seq 分` を `2026-05-30T18:XX:00+09:00` 形式で格納) し、live の非 ISO 文字列をそのまま持ち込まない。**falsifiable**: 全 `audit_events.occurred_at` が `^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$` に match することをサーバテストで assert (live の space-separated 文字列を INSERT すると fail する負例も用意)。
>
> **session_operator_id と actor_id (= effective_actor_id)** (SD-1 dual-identity、#3 認証 / #9-2 actor identity への link): live は `currentActorId` 単一で SoD 判定 (`src/store/reducer.ts:52`)。postv5 では「誰がログインしているか (`session_operator_id` = verified `X-Operator-Token` 由来の実 operator)」と「どの persona/役割で操作したか (`actor_id` = effective_actor_id = 検証済 body `{ actorId }`)」を分け、SoD 違反監査で「同一 operator が入力者と承認者の両役割を行使していないか」を後から検証可能にする。**effective_actor_id は独立列ではなく `actor_id` 列そのもの** (SD-1: `actor_id FK (= effective_actor_id)`、別列を作らない)。**両列とも書き込み行で NOT NULL**、単一 operator が persona を演じる demo では両者を等値で seed する (live は単一 actor)。operator-vs-effective の **SoD split を実際に検証するテストは #3 (認証) / #9-2 (actor identity) 契約に属する** ため、本 #8 の blocking 完了基準は「両列の NOT NULL 制約 + actor_id->roles.label 派生」までとし、SoD split 検証は移譲する (下表参照、scope-leak 回避)。
>
> **right-sizing**: WORM ストレージ / ハッシュチェーン / 改竄検知署名は **scope-out**。トリガによる UPDATE/DELETE 禁止 = 「regulatory reviewer が append-only と納得できる最小実装」。live persist.ts:9-11 の honest disclaimer (「backend 改竄防止/長期保持を主張しない、session 操作記録」) を継承し、Observatory に disclaimer 併記。

| 表名 | 必須列 | blocking 完了基準 | approval owner |
|---|---|---|---|
| `audit_events` | `id` / `seq UNIQUE` / `entity_type` / `entity_id` / `case_id` FK / `actor_id` FK (= effective_actor_id、NOT NULL) / `session_operator_id` (`TEXT NOT NULL`、FK なし、`CHECK IN ('op-demo-1','op-demo-2')`) / `action` / `occurred_at` / `before_json` / `after_json` (role 列なし=actor_id->roles.label 派生、confidence 列なし=OBS_LEDGER/CROSS_LEDGER 側) | **本契約 #8 の blocking** = (1) UPDATE 試行が RAISE(ABORT) で reject、(2) DELETE 試行が reject、(3) seq が gap なし単調増加、(4) 同一 seq 二重 INSERT が UNIQUE 違反、(5) `occurred_at` が全行 tz-aware ISO-8601 regex に match (live 非 ISO 文字列の INSERT は負例で reject)、(6) `actor_id` / `session_operator_id` のいずれかを NULL とする書き込み行 INSERT が NOT NULL 制約で reject (両列が全 write 行で埋まる)、(7) audit_events に confidence 列が **存在しない** (`PRAGMA table_info` で否定確認)、(8) `session_operator_id` に `op-demo-1`/`op-demo-2` 以外を INSERT すると CHECK で reject (operator 語彙固定) — をサーバテストで assert。**非 blocking (#3/#9-2 へ移譲)**: operator≠effective を使った SoD 比較 (= effective_actor_id 同士の四眼検証) は本契約では assert しない (両列の NOT NULL 存在 + operator CHECK のみ保証。`session_operator_id` は audit provenance 専用で SoD 比較キーではない、SoD split 検証は認証/actor-identity 契約の責務) | 監査/コンプライアンス責任者 |

---

### (c) KPI 派生 vs 格納の分類 (最重要データポイント)

live は 2 系統を厳密分離: (1) **synthetic な seed 固定 KPI** = `KPI_ROWS` (`src/data/mock-kpi.ts:20`、再計算しない synthetic 値、`Object.freeze` で mutation 禁止)、(2) **store-derived な運用カウント** = Hub の total/breakdown は `useHubModel` が store から算出 (`src/data/mock-hub.ts:67` コメント「total/dist は useHubModel が store から算出」)。

→ DB では (1) を `synthetic_metric_rows` テーブルに格納 (case 行数から再計算しない)、(2) を `cases` から引く **VIEW** にする。

```sql
-- 17. synthetic_metric_rows (seed 固定、再計算しない。UC-BO-02 分母は 980 不変)
CREATE TABLE synthetic_metric_rows (
  id             INTEGER PRIMARY KEY,
  workflow_id    TEXT NOT NULL REFERENCES workflows(id) ON DELETE RESTRICT,
  metric_label   TEXT NOT NULL,                   -- 'AI 入力承認率'|'人手上書き率'|'Alert 発生率'|'承認者差戻し率'
  actual_value   TEXT NOT NULL,                   -- '96%' 等 (表示文字、再計算しない)
  threshold      TEXT NOT NULL,                   -- '≥ 95%' 等
  achieved       INTEGER NOT NULL CHECK (achieved IN (0,1)),
  denominator    TEXT NOT NULL,                   -- '980 件' 等 (metric 単位、UC-BO-02=980 固定)
  exclusions     TEXT,
  period         TEXT NOT NULL DEFAULT '直近 30 日',
  UNIQUE (workflow_id, metric_label)
);

-- 運用カウント VIEW (cases から派生、絶対に synthetic_metric_rows に混ぜない)
CREATE VIEW v_case_status_distribution AS
  SELECT workflow_id, status, COUNT(*) AS n FROM cases GROUP BY workflow_id, status;

CREATE VIEW v_hub_attention AS                    -- 要対応 = 確認待ち(ready) + 差戻し再処理(sent-back)
  SELECT COUNT(*) AS n FROM cases WHERE status IN ('ready','sent-back');

CREATE VIEW v_hub_approval_waiting AS             -- 承認待ち
  SELECT COUNT(*) AS n FROM cases WHERE status = 'business-approval-waiting';

CREATE VIEW v_hub_total AS                        -- Hub total (業務母数)
  SELECT COUNT(*) AS n FROM cases;
```

#### 全 KPI / カウント分類表

| 指標 | 系統 | source | 理由 |
|---|---|---|---|
| AI 入力承認率 (UC-BO-01=92% / 02=96% / 03=95% / 04=93% / 05=97%) | **格納 (synthetic)** | `synthetic_metric_rows` | synthetic 値、実処理から再計算しない。5 値すべて live `KPI_ROWS` で確認済 (`mock-kpi.ts:22,28,35,41,47`) |
| 人手上書き率 (0.10-0.13) | **格納 (synthetic)** | `synthetic_metric_rows` | 同上 |
| Alert 発生率 (0.05-0.09) | **格納 (synthetic)** | `synthetic_metric_rows` | 同上 |
| 承認者差戻し率 (0.03-0.06) | **格納 (synthetic)** | `synthetic_metric_rows` | 母集合 = 承認者到達分のみ、exclusions 列に明示 (mock-kpi.ts:12) |
| 分母 (UC-BO-02 = 980) | **格納 (synthetic)** | `synthetic_metric_rows.denominator` | **980 は UC-BO-02 専用不変**。case 行数 (live 5 件) から再計算しては絶対にいけない |
| Hub total (業務母数) | **派生 (view)** | `v_hub_total` | live `useHubModel` が store から算出 (mock-hub.ts:67) |
| status 分布 | **派生 (view)** | `v_case_status_distribution` | 操作で変わる運用数 |
| 要対応の注意 (ready+sent-back) | **派生 (view)** | `v_hub_attention` | 操作で変わる |
| 承認待ち (business-approval-waiting) | **派生 (view)** | `v_hub_approval_waiting` | 操作で変わる |
| 未読通知数 | **派生 (api)** | 通知 universe − `notifications_read_state` | live: selector が universe 算出、reducer は既読 fact のみ (types.ts:129) |

| 表名 | 必須列 | blocking 完了基準 | approval owner |
|---|---|---|---|
| `synthetic_metric_rows` | `workflow_id` FK / `metric_label` / `actual_value` / `threshold` / `achieved` / `denominator` / `exclusions` / `period` | (1) UC-BO-02 承認率の denominator が文字列 '980 件' で seed 後も不変、(2) cases に行を追加しても synthetic 値が変わらないことをテスト、(3) Hub total view は cases 追加で +1 されることをテスト = 派生/格納の分離を falsify | KPI/業務責任者 |
| (運用カウント views) | `v_hub_total` / `v_case_status_distribution` / `v_hub_attention` / `v_hub_approval_waiting` | 各 view が live seed cardinality (total 29、attention 値) と一致 | データモデル責任者 |

---

### (d) demo clock — 単一行 SSOT

live `NOW_ISO = '2026-05-30T18:00:00+09:00'` (`src/lib/dates.ts:8`) を DB の単一行に port。サーバは **表示計算に runtime `now()` を使わない** (= テスト決定性 + mock 再現性、live dates.ts:5 の不変条件)。

```sql
-- 19. demo_clock (単一行 SSOT)
CREATE TABLE demo_clock (
  id      INTEGER PRIMARY KEY CHECK (id = 1),     -- 単一行を強制
  now_iso TEXT NOT NULL                           -- '2026-05-30T18:00:00+09:00' (tz-aware)
);
INSERT INTO demo_clock (id, now_iso) VALUES (1, '2026-05-30T18:00:00+09:00');
```

- **経過計算に使う日時列** (`received_at` / `occurred_at`) は **tz-aware ISO-8601** で格納 (live `receivedAt` 例 `'2026-05-30T16:40:00+09:00'` は既に tz-aware、`occurred_at` は上記 (b) の通り port で正規化)。
- **表示専用の日付列は date-only 文字列のまま**: governance `last_validated` (live `lastValidated` 例 `'2026-04-30'`、`mock-governance.ts:34`) と `proposal_source_cases.observed_date` (live `SourceCase.date` 例 `'2026-05-22'`) は live が `YYYY-MM-DD` の表示専用文字列ゆえ、**tz-aware 化せず原文のまま格納**し経過計算に使わない (live と乖離させない)。
- **`YYYY-MM-DD` のみの値を経過/比較計算に parse することを禁止** (UTC 解釈で月境界がずれる既知バグ、MEMORY: Date string ymkey grouping)。date-only 列は表示専用に限定し、elapsed を出す列は必ず時刻 + tz を含める。
- **elapsed は API 層で派生** = `demo_clock.now_iso − cases.received_at` をサーバが計算 (live `elapsedLabelFrom`/`caseElapsedLabel`、`src/lib/dates.ts:16,31`)。reflected は '処理済' を返す。負/未来/不正は '—'。

| 表名 | 必須列 | blocking 完了基準 | approval owner |
|---|---|---|---|
| `demo_clock` | `id` (=1 強制) / `now_iso` (tz-aware) | (1) 2 行目 INSERT が CHECK で reject (単一行)、(2) elapsed API が live `caseElapsedLabel` と同一文字列を返す (reflected→'処理済'、未来→'—')、(3) コード全体に runtime `Date.now()`/`new Date()`(引数なし) が表示計算経路に無いことを grep/test で確認 | データモデル責任者 |

---

### (e) state machine SSOT

live reducer (`src/store/reducer.ts`) が状態遷移の唯一の権威。これを `state_transition_rules` artifact (JSON または TS const、postv5 サーバ src 内の single source) に抽出し、**サーバ mutation が唯一の enforcer** とする (クライアント/API caller は遷移を直接書けない)。`seed:validate` が terminal-status の event 列を機械検査する。

#### 抽出する遷移ルール (live reducer 由来)

| object | 遷移 | precondition (reducer 行) | SoD/guard |
|---|---|---|---|
| case | ready → business-approval-waiting | by='input' AND status='ready' AND flags=0 (`reducer.ts:87`) | flags>0 は前進不可 |
| case | business-approval-waiting → reflected | by='checker' AND status='business-approval-waiting' (`reducer.ts:91`) | `isSelfApproval(input_approved_by, current)` なら block (`reducer.ts:93`) |
| case | {ready, business-approval-waiting} → sent-back | 差戻し (`reducer.ts:120`) | reason/category required |
| case | reflected → sent-back | reverse: status='reflected' AND reversal IS NULL (`reducer.ts:171`) | 二重 reversal block |
| case | sent-back → ready | reprocess: status='sent-back' (`reducer.ts:200`) | sendback/reversal クリア |
| case | escalation 裁定 | resolution IS NULL AND current = escalated_to (`reducer.ts:143-144`) | 起票者の自己裁定 block |
| proposal | pending-triage → forwarded | status='pending-triage' (`reducer.ts:206`) | forwarded_by 記録 |
| proposal | forwarded → approved | status='forwarded' (`reducer.ts:213`) | `isSelfApproval(forwarded_by, current)` block |
| proposal | forwarded → pending-triage / {pending-triage,forwarded} → rejected | sendback/reject (`reducer.ts:220,229`) | reason required |
| agent | none → requested → approved | promotion_status 遷移 (`reducer.ts:251,261`) | `isSelfApproval(promotion_requested_by, current)` block (`reducer.ts:262`) |
| agent | trust → supervised (emergencyStop) / 復元 (resume) | paused 遷移 (`reducer.ts:280,298`) | trust_before_pause に原状保存 |

> `isSelfApproval(requesterId, currentActorId)` (`src/store/reducer.ts:74`) は案件 (`input_approved_by`) / 提案 (`forwarded_by`) / 設定 (`promotion_requested_by`) の 3 層で共通。postv5 サーバはこの 1 関数を再利用し、3 mutation endpoint が同一 SoD ロジックを通す (再発明しない)。

| 表名 | 必須列 | blocking 完了基準 | approval owner |
|---|---|---|---|
| `state_transition_rules` (artifact、テーブルではない) | object / from_status / to_status / precondition / sod_guard | (1) サーバ mutation のみが status を変更でき、API 経由で不正遷移 (例 pending→reflected、自己承認) が **HTTP エラー + DB 不変**で reject、(2) **サーバ mutation 経由で reflected にした case** の `audit_events` に「入力者承認(actor A)→承認者承認(actor B、A≠B)」の 2 イベントが seq 順で揃うことを機械検査 (※ live seed の `auditEvents:[]`、`seed.ts:109` ゆえ **seed 直後の状態を検査してはならない** — seed の business-approval-waiting/reflected 案件は監査列が空。必ず ready→承認の server mutation を 1 本通してから検査する)、(3) self-approval を試みる test が全 3 層 (案件 `input_approved_by` / 提案 `forwarded_by` / 設定 `promotion_requested_by`) で reject | 業務責任者 + バックエンド技術責任者 |

---

### (f) migration / versioning

live `SCHEMA_VERSION=8` + 不一致時 seed fallback (`src/store/persist.ts:25,95`) の DB 版。**forward-only** migration、drift 検知、demo-DB 破棄条件、`db:reset-demo`。

```sql
-- 20. schema_migrations (forward-only 台帳。version + name + applied_at + checksum)
-- checksum は prompt #8f + cover ledger に整合させて復元する (適用時に migration ファイル hash を計算・格納)。
CREATE TABLE schema_migrations (
  version    INTEGER PRIMARY KEY,                 -- 1,2,3... (forward-only、down migration なし)
  name       TEXT NOT NULL,                       -- '0008_init' 等
  applied_at TEXT NOT NULL,                       -- tz-aware ISO
  checksum   TEXT NOT NULL                        -- 適用時に計算した migration ファイル hash
);
```

- **forward-only**: down migration を持たない (demo DB は捨てて作り直せるため down 不要 = right-sized)。
- **demo-DB 破棄条件** (live の version 不一致 seed fallback の analog): (1) `schema_migrations` の最大 version がコードの期待 version と異なる、(2) `cases`/`workflows` 等の必須テーブル欠落 → いずれも `db:reset-demo` を促す (本番のような自動 migration リカバリは scope-out)。SCHEMA_VERSION 不一致で seed fallback する live `persist.ts:25,95` の DB 版。
- **`db:reset-demo`** = `.db` ファイル削除 → 全 migration 再適用 → live seed 投入 (`src/store/seed.ts` を port)。live `clearPersisted` + `seed()` (`src/store/persist.ts:132` / `src/store/seed.ts:25`) の DB 版。**統制復旧パスは「version 不一致 / テーブル欠落 → 物理 reset」で完結** (DB は disposable)。

> **right-sizing (checksum は格納まで、drift-on-startup gate は optional に分離)**: `checksum TEXT NOT NULL` は prompt #8f + cover ledger と整合させて復元する。right-sized 範囲 = **適用時に migration ファイル hash を計算して格納するところまで**。起動時に checksum を再計算して不一致なら起動失敗にする **drift-on-startup 検知は optional** であり、本契約の blocking gate には含めず別途記載する (復旧はどの drift でも `db:reset-demo` で完結するため起動失敗 gate は不要。起動 gate 化は最小 credible schema の枠を超える)。

| 表名 | 必須列 | blocking 完了基準 | approval owner |
|---|---|---|---|
| `schema_migrations` | `version` (PK、forward-only) / `name` / `applied_at` / `checksum` (NOT NULL) | (1) 同一 version 二重適用が冪等 (再 INSERT されない)、(2) version 不一致 / 必須テーブル欠落で `db:reset-demo` フローが起動し、reset 後に全 migration が再適用され live seed cardinality に戻る、(3) 各 migration 適用後に `checksum` が NULL でなく migration ファイル hash として格納されている (NOT NULL 制約 + 値存在を assert)。**optional (非 blocking)**: 起動時 checksum 再計算による drift-on-startup 検知は別途実装し得るが gate にはしない | バックエンド技術責任者 |

---

### (g) その他 (PK/index/精度/UTF-8/soft-delete/read-after-write)

**index** (filter 経路に絞る、過剰 index は scope-out):

```sql
CREATE INDEX idx_cases_workflow_status ON cases(workflow_id, status); -- Hub/Cases filter
CREATE INDEX idx_cases_status           ON cases(status);             -- approvals/escalations 母集合
CREATE INDEX idx_case_fields_case       ON case_fields(case_id);
CREATE INDEX idx_audit_case             ON audit_events(case_id);     -- 案件証跡 drill
CREATE INDEX idx_audit_seq              ON audit_events(seq);
CREATE INDEX idx_escalations_unresolved ON escalations(case_id) WHERE resolution IS NULL; -- /escalations queue
CREATE UNIQUE INDEX idx_escalation_one_per_case ON escalations(case_id); -- 1 案件 0..1 escalation
```

**numeric precision**: live `MetricRow` は全て **文字列** ('96%', '0.10', '980 件'、`src/data/types.ts:333`)。KPI 表示値は表示文字列のまま `synthetic_metric_rows.actual_value`/`denominator` に格納 (再計算しないので精度問題なし、canonical text)。**生の confidence** (`FieldReview.confidence` 0-1、`src/data/types.ts:323`) のみ計算可能性があるため `case_fields.confidence_milli` = **整数 0-1000** (×1000) で格納し float 誤差を避ける。ただし live `FieldReview.confidence` は **OPTIONAL** で、`buildCaseDetail` の合成 field は confidence を埋めない (canonical `CASE-2026-0142` の一部 field のみが値を持ち得る)。したがって `confidence_milli` は **nullable で大多数の行が NULL**。「業務 view に生数字を出さない (band 表示)」契約のテストは **NULL-majority を前提**にし、NULL 行は band 表示・raw 非露出ともに成立することを assert する (NULL を 0 と誤読しない)。金額 cents は本 demo に金額フィールド無しのため不要 (= scope-out、将来必要なら integer cents)。

**UTF-8**: SQLite default が UTF-8。JP 業務語 (`入力者`/`差戻し`/`緊急停止`) はそのまま格納。better-sqlite3 は UTF-8 を透過。

**soft-delete**: **論理削除カラムを置かない**。live に削除操作が無い (reducer に delete action 無し、`src/store/types.ts:171-204` の 24 action は全て create/update)。物理削除は `db:reset-demo` のみ。FK は全て `ON DELETE RESTRICT` ゆえ参照中の行は削除不可。これが「statu changes は append/update のみ、証跡は immutable」という統制と整合 (= right-sized、soft-delete 機構は不要)。

**read-after-write**: 全 mutation endpoint は **更新後の行 + 採番された `seq`** を返す (live reducer が新 state を返すのと同じ単一トランザクション内で `RETURNING` または直後 SELECT)。クライアントは楽観更新なしで確定値を受け取れる。

| 表名 | 必須列 | blocking 完了基準 | approval owner |
|---|---|---|---|
| (index 群) | 上記 7 index (P1a 実装は **6 explicit index**; `idx_escalation_one_per_case` は `escalations.case_id` PRIMARY KEY が生成する autoindex が 1-案件-0..1 を強制するため別 index を作らない = redundant 回避) | (1) `/escalations` queue が `idx_escalations_unresolved` を使う (EXPLAIN QUERY PLAN)、(2) `UNIQUE(case_id)` で 2 件目 escalation INSERT が reject | データモデル責任者 |
| `case_fields.confidence_milli` | 整数 0-1000 (nullable) | float 直接格納をしない (0.72 → 720)。live confidence は OPTIONAL ゆえ **NULL-majority** を前提に、(1) NULL 行 / 値あり行の双方で業務 view に生数字を出さない (band 表示のみ) ことを API 層テストで assert、(2) NULL を 0 と誤表示しない | データモデル責任者 |
| (mutation 共通) | read-after-write | 案件承認 endpoint が更新後 status + 新 `seq` を 1 レスポンスで返すことをテスト | バックエンド技術責任者 |

---

### Open decisions

| id | 問い | 推奨 default | rationale | reversibility |
|---|---|---|---|---|
| DM-1 | escalation を live 同様 `cases` に denormalize するか、別テーブル `escalations` にするか | **別テーブル** | `/escalations` queue を `resolution IS NULL` の partial index で引け、SoD lock (`escalated_to` のみ裁定) を FK で表現できる。live の denormalize は localStorage 都合 | 中 (queue 算出箇所のみ影響、DDL + seed の局所変更) |
| DM-2 | `before_json`/`after_json` を audit に持たせる粒度 (全フィールド diff か、変化フィールドのみか) | **変化フィールドのみ** | live `LedgerEvent.beforeAfter` は 1 文字列要約 (`reducer.ts:89` 等)。全フィールドダンプは production hardening 寄りで over-engineering | 高 (列はそのまま、書き込み内容のみ後で拡張可) |
| DM-3 | `session_operator_id` を #3 (認証) 確定前に列だけ置くか | **置く (NOT NULL)、ただし SoD split 検証は #3 へ移譲** | SD-1 dual-identity 確定済 — `session_operator_id` (verified `X-Operator-Token` 由来) と `actor_id` (= effective_actor_id、検証済 body `{ actorId }`) を **両列とも書き込み行で NOT NULL** 記録。demo は両者一致を seed。**本 #8 では両列の NOT NULL 存在 + actor_id->roles.label 派生のみ保証し、operator-vs-effective SoD split のテストは #3 (認証) / #9-2 (actor identity) 契約に置く** (#8 が認証 concern を抱えると scope-leak)。(rejected alternative: nullable で先置きのみ — SD-1 で両 NOT NULL に確定し却下) | 高 (列は確定、SoD split 検証のみ移譲) |
| DM-4 | KPI synthetic 値を `synthetic_metric_rows` 1 テーブルに集約するか、proposal/agent 試算 metric (`mock-proposal-detail.ts:50` の '12 件で試算' 等) も同居させるか | **同居させない** (proposal/agent 試算は各 detail テーブルの子に) | KPI SSOT は「業務 4 KPI」の単一性が価値 (live mock-kpi.ts の二重保持解消)。試算 metric は別文脈 | 中 |

### Right-sizing notes

- **トリガ 2 本で append-only**: ハッシュチェーン / WORM / 署名は除外。「UPDATE/DELETE を RAISE(ABORT)」が regulatory reviewer に append-only と納得させる最小実装。production hardening として持ち込まない。
- **forward-only migration、down 無し + checksum は格納まで (drift-on-startup gate は optional)**: demo DB は `db:reset-demo` で捨てて作り直せるため reversible migration 機構は除外。`checksum TEXT NOT NULL` は適用時に migration ファイル hash を計算・格納する (prompt #8f + cover ledger 整合)。起動時 checksum 再計算による drift-on-startup 起動失敗は optional で blocking gate にしない ((f) 参照)。復旧は version 不一致/テーブル欠落 → 物理 reset で完結。
- **audit は常時 '—' 列を持たない**: live `logEvent` が常に '—' で埋める `doc`/`policy`/`confidence` は DB 列にしない ((b) 参照)。`role` は `actor_id→roles.label` で派生し二重持ちしない。append-only 制御に不要な列は足さない。
- **soft-delete 機構なし**: live に delete operation が無い (24 action 全て create/update)。論理削除カラム/復元 API は不要。
- **runtime now 不使用 (demo_clock 1 行)**: タイムゾーン DB / NTP 同期 / clock skew 対策は不要。固定 1 行で live `NOW_ISO` を再現するのが目的。
- **index は filter 経路の 7 本のみ**: 全列 index / covering index / 統計 ANALYZE 自動化は除外 (demo cardinality は数十行、フルスキャンでも問題ない箇所は index を足さない)。
- **enum は CHECK、lookup table は roles/workflows のみ**: RBAC エンジン / 動的 enum 管理画面は scope-out。運用で変えない語彙は CHECK で固定。
- **SQLite 単一ファイル + WAL**: Postgres / sharding / read replica / 接続プール調整は除外。better-sqlite3 同期 API + busy_timeout で multi-tab 並行を吸収。
- **STOP signal (もし出たら re-right-size)**: 「監査署名」「暗号化 at-rest」「テナント分離列」「migration rollback runner」「checksum drift-on-startup を blocking gate 化 (格納は OK、起動失敗 gate 化が越境)」「ORM 抽象層 (Prisma 等)」「#8 内での operator-vs-effective SoD 比較検証 (認証 concern の #8 流入)」が要求に混ざったら production hardening / scope-leak の越境として停止・再相談する。live は素の better-sqlite3 + SQL 文字列で足りる。
