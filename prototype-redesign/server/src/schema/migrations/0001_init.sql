-- ROLLBACK NOTE: forward-only. No down migration. To revert, run `npm run db:reset-demo`
-- (drops the DB file and re-applies all migrations + re-seed). The demo DB is disposable
-- (deterministic fixture), so a reversible down path is intentionally out of scope (06 OPEN-DB-1).
--
-- 0001_init — postv5 baseline schema (contract 08 DDL SSOT). Pure DDL + triggers + views + indexes.
-- All data (workflows/roles/actors/cases/.../demo_clock) is inserted by the idempotent seed (PR3),
-- NOT here. schema_migrations (#20) is created/owned by the migration runner, not this file.
-- 20 tables here + schema_migrations (runner) = 21 total.

------------------------------------------------------------------------------
-- lookups (enum labels運用で変わりうる → lookup table; 業務語彙 enum は CHECK 固定)
------------------------------------------------------------------------------

-- 3. roles (4 値; 'governance' は P0 #2 ratified の net-new READ-ONLY role、additive)
CREATE TABLE roles (
  id    TEXT PRIMARY KEY
          CHECK (id IN ('inputter','checker','business-approver','governance')),
  label TEXT NOT NULL                                   -- '入力者'|'承認者'|'業務責任者'|'ガバナンス担当者'
);

-- 1. workflows (5 業務 UC-BO-01..05)
CREATE TABLE workflows (
  id            TEXT PRIMARY KEY,                        -- 'UC-BO-01'..'UC-BO-05'
  name          TEXT NOT NULL UNIQUE,                    -- '法人住所変更' 等
  display_order INTEGER NOT NULL
);

-- 2. actors (3 operational DEMO_ACTORS + ≥2 governance、= allowed_actors universe)
CREATE TABLE actors (
  id      TEXT PRIMARY KEY,                              -- 'actor-inputter'..、'actor-gov-legal'/'actor-gov-compliance'
  name    TEXT NOT NULL,
  role_id TEXT NOT NULL REFERENCES roles(id) ON DELETE RESTRICT
);

------------------------------------------------------------------------------
-- cases + children
------------------------------------------------------------------------------

-- 4. cases
CREATE TABLE cases (
  id                TEXT PRIMARY KEY,
  workflow_id       TEXT NOT NULL REFERENCES workflows(id) ON DELETE RESTRICT,
  status            TEXT NOT NULL
                      CHECK (status IN ('pending','ready','sent-back','business-approval-waiting','reflected')),
  assignee_id       TEXT REFERENCES actors(id) ON DELETE RESTRICT,   -- NULL = 未割当
  flags             INTEGER NOT NULL DEFAULT 0 CHECK (flags >= 0),
  origin            TEXT NOT NULL DEFAULT 'ai' CHECK (origin IN ('ai','manual')),
  input_approved_by TEXT REFERENCES actors(id) ON DELETE RESTRICT,   -- SoD discriminant (= effective_actor_id)
  sendback_reason   TEXT,
  sendback_category TEXT,
  reversal_kind     TEXT CHECK (reversal_kind IN ('訂正','取消')),
  reversal_reason   TEXT,
  received_at       TEXT NOT NULL,                       -- tz-aware ISO-8601
  CHECK ((reversal_kind IS NULL) = (reversal_reason IS NULL))
);

-- 5. case_fields (FieldReview を per-field 正規化)
CREATE TABLE case_fields (
  id               INTEGER PRIMARY KEY,
  case_id          TEXT NOT NULL REFERENCES cases(id) ON DELETE RESTRICT,
  field_label      TEXT NOT NULL,
  ai_value         TEXT,
  master_value     TEXT,
  previous_value   TEXT,
  human_value      TEXT,                                 -- 人が確定/上書きした値 (= overrides)
  reconcile_state  TEXT NOT NULL
                     CHECK (reconcile_state IN ('matched','normalized_match','needs_review',
                                                'not_extracted','manually_confirmed','escalated')),
  resolved         INTEGER NOT NULL DEFAULT 0 CHECK (resolved IN (0,1)),
  confidence_milli INTEGER CHECK (confidence_milli BETWEEN 0 AND 1000),  -- 0.000-1.000 ×1000、nullable (大半 NULL)
  UNIQUE (case_id, field_label)
);

-- 6. case_documents (申請書類ビューア header、1 / case)
CREATE TABLE case_documents (
  id         INTEGER PRIMARY KEY,
  case_id    TEXT NOT NULL UNIQUE REFERENCES cases(id) ON DELETE RESTRICT,
  file_name  TEXT NOT NULL,
  page       TEXT NOT NULL,
  page_count INTEGER NOT NULL CHECK (page_count >= 0),
  title      TEXT NOT NULL
);

-- 7. case_document_rows (DocumentRow、書類 1 欄)
CREATE TABLE case_document_rows (
  id          INTEGER PRIMARY KEY,
  document_id INTEGER NOT NULL REFERENCES case_documents(id) ON DELETE RESTRICT,
  row_order   INTEGER NOT NULL,
  label       TEXT NOT NULL,
  value       TEXT NOT NULL,
  field_label TEXT,                                      -- リンク先 field (nullable: 押印欄等)
  highlight   INTEGER NOT NULL DEFAULT 0 CHECK (highlight IN (0,1))
);

-- 8. lifecycle_events (CaseLifecycleEvent、案件 lifecycle view)
CREATE TABLE lifecycle_events (
  id         INTEGER PRIMARY KEY,
  case_id    TEXT NOT NULL REFERENCES cases(id) ON DELETE RESTRICT,
  step_order INTEGER NOT NULL,
  step       TEXT NOT NULL CHECK (step IN ('受付','AI処理','入力者確認','承認者承認','反映')),
  time_label TEXT NOT NULL,                              -- '完了'|'進行中'|'—'|'16:40' (表示専用)
  actor      TEXT NOT NULL,
  detail     TEXT NOT NULL,
  done       INTEGER NOT NULL CHECK (done IN (0,1)),
  is_current INTEGER NOT NULL DEFAULT 0 CHECK (is_current IN (0,1))
);

------------------------------------------------------------------------------
-- agents + proposals + governance
------------------------------------------------------------------------------

-- 11. agents
CREATE TABLE agents (
  id                        TEXT PRIMARY KEY,
  workflow_id               TEXT NOT NULL REFERENCES workflows(id) ON DELETE RESTRICT,
  trust                     TEXT NOT NULL
                              CHECK (trust IN ('supervised','checkpoint','autonomous','n/a')),
  promotion_status          TEXT NOT NULL DEFAULT 'none'
                              CHECK (promotion_status IN ('none','requested','approved')),
  promotion_requested_by    TEXT REFERENCES actors(id) ON DELETE RESTRICT,   -- SoD discriminant
  promotion_sendback_reason TEXT,
  paused                    INTEGER NOT NULL DEFAULT 0 CHECK (paused IN (0,1)),
  paused_reason             TEXT,
  trust_before_pause        TEXT CHECK (trust_before_pause IN ('supervised','checkpoint','autonomous','n/a')),
  CHECK ((paused = 1) OR (trust_before_pause IS NULL))
);

-- 12. agent_samples (裏付け sample; samples の case は全て CASE_LIST 内 = hard FK)
CREATE TABLE agent_samples (
  id       INTEGER PRIMARY KEY,
  agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE RESTRICT,
  case_id  TEXT NOT NULL REFERENCES cases(id) ON DELETE RESTRICT,
  outcome  TEXT NOT NULL,
  tone     TEXT NOT NULL CHECK (tone IN ('success','alert')),
  note     TEXT NOT NULL,
  kpi      TEXT NOT NULL
);

-- 9. proposals
CREATE TABLE proposals (
  id                TEXT PRIMARY KEY,
  workflow_id       TEXT NOT NULL REFERENCES workflows(id) ON DELETE RESTRICT,
  status            TEXT NOT NULL
                      CHECK (status IN ('pending-triage','forwarded','approved','rejected')),
  agent_id          TEXT REFERENCES agents(id) ON DELETE RESTRICT,
  forwarded_by      TEXT REFERENCES actors(id) ON DELETE RESTRICT,   -- SoD discriminant
  decision_kind     TEXT CHECK (decision_kind IN ('reject','sendback')),
  decision_reason   TEXT,
  decision_category TEXT,
  change_area       TEXT NOT NULL,
  impact_count      INTEGER NOT NULL CHECK (impact_count >= 0),
  CHECK ((decision_kind IS NULL) = (decision_reason IS NULL))
);

-- 10. proposal_source_cases (proposal↔case 多対多; case_id は hard FK なし [historical drill-in 許容])
CREATE TABLE proposal_source_cases (
  proposal_id   TEXT NOT NULL REFERENCES proposals(id) ON DELETE RESTRICT,
  case_id       TEXT NOT NULL,                           -- cases ∪ historical_cases (seed:validate が membership 検証)
  field         TEXT NOT NULL,
  comment       TEXT NOT NULL,
  observed_date TEXT NOT NULL,                           -- YYYY-MM-DD 表示専用 (経過計算に使わない)
  PRIMARY KEY (proposal_id, case_id)
);

-- 13. governance_model_inventory (MRM honest framing)
CREATE TABLE governance_model_inventory (
  id             INTEGER PRIMARY KEY,
  agent_id       TEXT NOT NULL REFERENCES agents(id) ON DELETE RESTRICT,
  process        TEXT NOT NULL,
  model          TEXT NOT NULL,
  version        TEXT NOT NULL,
  purpose        TEXT NOT NULL,
  owner          TEXT NOT NULL,
  validation     TEXT NOT NULL CHECK (validation IN ('独立検証済','検証中','要再検証')),
  last_validated TEXT NOT NULL,                          -- date-only 表示専用
  scope          TEXT NOT NULL
                   CHECK (scope IN ('MRM 適用 (非生成 model)','rule-based (model 定義外)','生成・agentic (SR 26-2 scope 外)'))
);

-- 14. drift_monitors (drift/bias 監視、全て [仮説/要検証])
CREATE TABLE drift_monitors (
  id          INTEGER PRIMARY KEY,
  workflow_id TEXT NOT NULL REFERENCES workflows(id) ON DELETE RESTRICT,
  metric      TEXT NOT NULL,
  value       TEXT NOT NULL,                             -- 表示文字列 (再計算しない)
  threshold   TEXT NOT NULL,
  status      TEXT NOT NULL CHECK (status IN ('安定','監視中','要確認'))
);

------------------------------------------------------------------------------
-- escalations / notifications / metrics / historical
------------------------------------------------------------------------------

-- 15. escalations (1 案件 0..1 = case_id PK; SoD lock = escalated_to のみ裁定可)
CREATE TABLE escalations (
  case_id        TEXT PRIMARY KEY REFERENCES cases(id) ON DELETE RESTRICT,
  reason         TEXT NOT NULL,
  category       TEXT NOT NULL,
  escalated_to   TEXT NOT NULL REFERENCES actors(id) ON DELETE RESTRICT,
  escalated_from TEXT NOT NULL REFERENCES actors(id) ON DELETE RESTRICT,
  resolution     TEXT CHECK (resolution IN ('proceed','sendback'))   -- NULL = 未裁定 (= /escalations queue)
);

-- 16. notifications_read_state (既読化した通知 id; seed 空)
CREATE TABLE notifications_read_state (
  notification_id TEXT NOT NULL,
  actor_id        TEXT REFERENCES actors(id) ON DELETE RESTRICT,
  PRIMARY KEY (notification_id, actor_id)
);

-- 17. synthetic_metric_rows (KPI seed 固定値、再計算しない。UC-BO-02 分母 980 不変)
CREATE TABLE synthetic_metric_rows (
  id           INTEGER PRIMARY KEY,
  workflow_id  TEXT NOT NULL REFERENCES workflows(id) ON DELETE RESTRICT,
  metric_label TEXT NOT NULL,
  actual_value TEXT NOT NULL,                            -- '96%' 等 (表示文字、再計算しない)
  threshold    TEXT NOT NULL,
  achieved     INTEGER NOT NULL CHECK (achieved IN (0,1)),
  denominator  TEXT NOT NULL,                            -- '980 件' 等
  exclusions   TEXT,
  period       TEXT NOT NULL DEFAULT '直近 30 日',
  UNIQUE (workflow_id, metric_label)
);

-- 21. historical_cases (read-only 参照専用、提案 sourceCases drill-in 先、CASE_LIST 非対象)
CREATE TABLE historical_cases (
  id           TEXT PRIMARY KEY,                         -- cases と id 空間 disjoint
  workflow_id  TEXT NOT NULL REFERENCES workflows(id) ON DELETE RESTRICT,
  status       TEXT NOT NULL
                 CHECK (status IN ('pending','ready','sent-back','business-approval-waiting','reflected')),
  owner_name   TEXT NOT NULL,                            -- 表示専用 (actors FK にしない)
  received_at  TEXT NOT NULL,                            -- tz-aware ISO-8601
  history_note TEXT NOT NULL
);

------------------------------------------------------------------------------
-- audit_events (append-only WORM、UPDATE/DELETE は trigger で ABORT)
------------------------------------------------------------------------------

-- 18. audit_events — dual-identity (SD-1): actor_id (= effective_actor_id、検証済 body) と
--   session_operator_id (検証済 X-Operator-Token 由来の実 operator、CODE CONSTANT ゆえ FK なし + CHECK) を
--   両方 NOT NULL 記録。role は actor_id->roles.label で派生 (格納しない)。confidence 列なし。
CREATE TABLE audit_events (
  id                  INTEGER PRIMARY KEY,
  seq                 INTEGER NOT NULL UNIQUE,           -- 単調増加 (live auditSeq)
  entity_type         TEXT NOT NULL CHECK (entity_type IN ('case','proposal','agent')),
  entity_id           TEXT NOT NULL,
  case_id             TEXT REFERENCES cases(id) ON DELETE RESTRICT,   -- agent/proposal は NULL 可
  actor_id            TEXT NOT NULL REFERENCES actors(id) ON DELETE RESTRICT,
  session_operator_id TEXT NOT NULL CHECK (session_operator_id IN ('op-demo-1','op-demo-2')),
  action              TEXT NOT NULL,                     -- '入力者承認'|'差戻し' 等 (JP 業務語)
  occurred_at         TEXT NOT NULL,                     -- tz-aware ISO-8601 (auditTs(seq) を正規化)
  before_json         TEXT,
  after_json          TEXT
);

CREATE TRIGGER audit_events_no_update
  BEFORE UPDATE ON audit_events
  BEGIN SELECT RAISE(ABORT, 'audit_events is immutable'); END;

CREATE TRIGGER audit_events_no_delete
  BEFORE DELETE ON audit_events
  BEGIN SELECT RAISE(ABORT, 'audit_events is immutable'); END;

-- 19. demo_clock (単一行 SSOT、行は seed が INSERT)
CREATE TABLE demo_clock (
  id      INTEGER PRIMARY KEY CHECK (id = 1),
  now_iso TEXT NOT NULL                                  -- '2026-05-30T18:00:00+09:00' (tz-aware)
);

------------------------------------------------------------------------------
-- 運用カウント VIEW (cases から派生; 絶対に synthetic_metric_rows に混ぜない、08 (c))
------------------------------------------------------------------------------
CREATE VIEW v_case_status_distribution AS
  SELECT workflow_id, status, COUNT(*) AS n FROM cases GROUP BY workflow_id, status;

CREATE VIEW v_hub_attention AS
  SELECT COUNT(*) AS n FROM cases WHERE status IN ('ready','sent-back');

CREATE VIEW v_hub_approval_waiting AS
  SELECT COUNT(*) AS n FROM cases WHERE status = 'business-approval-waiting';

CREATE VIEW v_hub_total AS
  SELECT COUNT(*) AS n FROM cases;

------------------------------------------------------------------------------
-- index (filter 経路に絞る、08 (g))
------------------------------------------------------------------------------
CREATE INDEX idx_cases_workflow_status  ON cases(workflow_id, status);
CREATE INDEX idx_cases_status           ON cases(status);
CREATE INDEX idx_case_fields_case       ON case_fields(case_id);
CREATE INDEX idx_audit_case             ON audit_events(case_id);
CREATE INDEX idx_audit_seq              ON audit_events(seq);
-- /escalations queue 母集合 (resolution IS NULL)。1 案件 0..1 は escalations.case_id PRIMARY KEY が強制。
CREATE INDEX idx_escalations_unresolved ON escalations(case_id) WHERE resolution IS NULL;
