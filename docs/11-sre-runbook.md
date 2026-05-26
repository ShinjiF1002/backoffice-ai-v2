# Backoffice AI v2 — SRE Runbook (v0.1 Draft)

> **目的**: DOC-CA-08 v2.6 + DOC-DM-07 v1.7.2 が定義する surface を Phase 1 で operationally run するための SLO/SLI / Error budget policy / alert severity matrix / on-call rotation / incident response / postmortem template / runbook 集 の SSOT。
> **位置付け**: DOC-CA-08 §10 (CloudWatch baseline) + §10.4 (主要 alarm) を起点に、運用層 (SRE / on-call) の SSOT。Type B 設定承認 input package の SRE readiness 章として bundle。Phase 1 ops 開始後は本 doc が daily runbook reference となる。

| 項目            | 値                                                                                                                                                                                |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 文書 ID         | DOC-SRE-11                                                                                                                                                                        |
| 文書名          | SRE Runbook (SLO/SLI + Error budget + Alert severity matrix + On-call rotation + Incident response + Postmortem template + 主要 runbook 集)                                       |
| 版数            | v0.1                                                                                                                                                                              |
| ステータス      | Draft (autonomous prod-ready loop Cycle 3 起稿)                                                                                                                                   |
| オーナー        | SRE team + AI 管理者 (Model Risk Management co-owner for AI/ML SLO)                                                                                                                |
| 承認者          | 設定承認 Type B (operational readiness 評価を含むため)                                                                                                                            |
| 閲覧対象        | Phase 1 implementation team / SRE team / on-call engineer / Security 関係者 / 業務責任者 / 経営層 (SLO breach escalation)                                                          |
| 機密区分        | Internal                                                                                                                                                                          |
| 関連文書        | **DOC-CA-08 v2.6 §10 (Observability) / §15 (DR) / §6.3.1 (warm pool sizing)**, **DOC-DM-07 v1.7.2 §10 (Operations Playbook)**, DOC-TM-10 §8 (Monitoring + Detection controls), DOC-PFC-09 PFC-06 (warm pool sizing 実測), DOC-MON-05 (KPI/KRI catalogue) |
| SSOT 区分       | SLO/SLI / Error budget policy / Alert severity matrix / On-call rotation / Incident response process / Postmortem template / Runbook 集 の SSOT                                    |
| Evidence Status | 設計のみ。SLO 値は Phase 1 着手時点で実測 calibration (PFC-06 + 4 週運用後に first revision)                                                                                       |
| 改版履歴        | v0.1 (2026-05-25、autonomous prod-ready loop Cycle 3): 初版作成、5 SLO + 4 KPI/KRI 接続 + Error budget policy + S0-S4 severity matrix + on-call rotation + incident response 5 phase + postmortem template + 12 主要 runbook 集 |

---

## 0. 本 doc の読み方 (3 分要約)

- **対象**: Phase 1 ops 開始後の SRE / on-call 運用全体
- **scope**: §2 SLO/SLI / §3 Error budget policy / §4 Alert severity matrix S0-S4 / §5 On-call rotation / §6 Incident response 5 phase / §7 Postmortem template / §8 主要 runbook 12 件 / §9 quarterly DR drill SOP / §10 SLO review cadence
- **out of scope**: (a) Phase 0 (設計期間) の dev workflow、(b) UI bug triage (frontend team scope)、(c) 業務 SLA 約束 (経営層 + 業務責任者 scope、本 doc は internal SLO のみ)
- **SLO/SLI 表記**: SLI-<NN> ID で全 SLI を unique 識別、SLO target は 99.9% / 99.95% 等の availability + latency P95 / P99 percentile で表現
- **Severity 表記**: S0 (catastrophic、即時 escalation) → S4 (informational) の 5 段、各 severity に response SLA + on-call action + escalation path 付与

---

## 1. 運用 organization + RACI

### 1.1 Phase 1 SRE team 構成

| Role                    | Headcount (Phase 1)   | 責務                                                                                                                                |
| ----------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **SRE Lead**            | 1                     | SLO/SLI definition + Error budget policy ownership + escalation の最終受け / postmortem owner / quarterly review chair                |
| **On-call Engineer**    | 2 (rotation)          | S0-S2 incident 初動 (P1 within 5 min for S0, 15 min for S1)、runbook 実行、escalation 判断                                            |
| **SRE Engineer (Day)**  | 1-2                   | non-incident work (SLO dashboard 整備 / capacity planning / DR drill / CI gate)、on-call backup                                       |
| **AI/ML SRE (新 role)** | 1 (Phase 1 で creation) | Bedrock + Computer Use 特有 SLO/SLI、model performance regression detection、AI 関係 incident triage                                |

### 1.2 RACI

| Activity                        | SRE Lead | On-call | AI/ML SRE | Security 関係者 | AI 管理者 | 業務責任者 | 経営層 |
| ------------------------------- | -------- | ------- | --------- | --------------- | --------- | ---------- | ------ |
| SLO definition / change         | **A**    | C       | C         | C               | C         | I          | I      |
| S0-S1 incident 初動             | C        | **R**   | C         | I               | I         | I          | I      |
| S0 escalation                   | A        | R       | C         | C               | C         | C          | **I**  |
| Postmortem owner                | **A**    | C       | C         | I               | I         | I          | I      |
| Quarterly SLO review            | **R**    | C       | C         | I               | C         | C          | I      |
| DR drill (quarterly)            | **R**    | C       | C         | C               | C         | C          | I      |
| Security incident (T-SP, T-EP)  | C        | C       | I         | **R/A**         | C         | I          | I      |
| AI incident (T-AI-01 ~ T-AI-10) | C        | C       | **R**     | C               | A         | I          | I      |
| Cost incident                   | C        | C       | I         | I               | C         | I          | **A**  |

---

## 2. SLO / SLI

Phase 1 で commit する 5 SLO。Phase 1 着手 -7 day までに PFC-06 実測値 + 4 週運用後 first revision で recalibrate。

### 2.1 SLO catalog

| SLO ID  | 主題                                  | SLI 定義 (measurement)                                                                                          | SLO target (Phase 1 v0.1) | Error budget (28 day window) | 算出 source                                  |
| ------- | ------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------- | ---------------------------- | -------------------------------------------- |
| **SLO-01 Availability** | End-to-end case processing availability | `(成功 case 件数) / (受付 case 件数)` per case (timeout / 5xx / unhandled exception を fail カウント)             | **99.9%** (Phase 1 v0.1)  | 40 min downtime / 28 day      | DM-07 case_record + audit_event              |
| **SLO-02 Inbox latency** | Inbox queue → AI 入力完了 latency P95   | `received_at` → `ai_input_completed_at` の duration P95                                                          | **P95 < 2 min**           | 1.4% over 2 min / 28 day      | DM-07 case_record timestamps                  |
| **SLO-03 Approval latency** | 入力者確認 → 承認者承認 → 反映 latency P95 | `input_confirmed_at` → `reflected_at` の duration P95                                                            | **P95 < 30 min** [仮説 / 要検証] | 1.4% over 30 min / 28 day | DM-07 case_record + human_decision           |
| **SLO-04 AI proposal quality** | AI 提案 1st-pass acceptance rate        | `(入力者 reject 0 + 承認者 reject 0 で reflect 到達 case) / (全 case)`                                            | **99% [仮説 / 要検証]** (DOC-MON-05 K1) | 1% reject / 28 day  | DM-07 case_record + human_decision (Phase 1) |
| **SLO-05 Audit chain integrity** | Audit chain hash verify success rate    | `(daily verify success) / (daily verify total)` over 28 day                                                     | **100%** (no breach acceptable) | **0 breach** (S0 incident on breach) | DM-07 §9.3 verify cron               |

### 2.2 SLI 詳細 (per-SLO measurement query)

各 SLO の SLI を実装する CloudWatch metric / SQL query / log query を pin。

#### SLI-01 (SLO-01 Availability)

- **Metric source**: DM-07 `case_record.status` final state
- **CloudWatch metric**: `BackofficeAi/Case/StatusFinal` custom metric (per status enum)
- **SQL query** (per 5 min sliding window):
  ```sql
  SELECT
    SUM(CASE WHEN status IN ('reflected', 'manual_resolved') THEN 1 ELSE 0 END) AS success,
    SUM(CASE WHEN status IN ('error', 'timeout', 'unhandled') THEN 1 ELSE 0 END) AS fail
  FROM app.case_record
  WHERE updated_at >= NOW() - INTERVAL '5 min';
  ```
- **Alert threshold**: 5 min window で `fail / (success + fail) > 0.5%` → S2 alert、`> 5%` → S1、`> 50%` → S0

#### SLI-02 (SLO-02 Inbox latency)

- **Metric source**: DM-07 `case_record.received_at` → `case_record.ai_input_completed_at`
- **CloudWatch metric**: `BackofficeAi/Case/InboxLatencyMs` histogram
- **SQL query**:
  ```sql
  SELECT
    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (ai_input_completed_at - received_at)) * 1000) AS p95_ms
  FROM app.case_record
  WHERE ai_input_completed_at >= NOW() - INTERVAL '5 min';
  ```
- **Alert threshold**: 5 min window で P95 > 120,000 ms (2 min) → S3、> 300,000 ms (5 min) → S2

#### SLI-03 (SLO-03 Approval latency)

- **Metric source**: DM-07 `case_record.input_confirmed_at` → `case_record.reflected_at`
- 同様の SQL + CloudWatch histogram、alert threshold P95 > 30 min → S3

#### SLI-04 (SLO-04 AI proposal quality)

- **Metric source**: DM-07 `human_decision` per-case reject count
- **CloudWatch metric**: `BackofficeAi/AI/RejectRate` (per 28 day rolling)
- DOC-MON-05 K1 と SSOT 同期 (mv_kpi_4gate_daily.refresh で nightly)
- **Alert threshold**: 28 day rolling > 1% → S3、> 5% → S2

#### SLI-05 (SLO-05 Audit chain integrity)

- **Metric source**: DM-07 §9.3 audit_chain_head verify cron
- **CloudWatch metric**: `BackofficeAi/Audit/ChainVerifyResult` (binary success/fail per day)
- **Alert threshold**: any single failure → **S0** (catastrophic、tampering detection)

---

## 3. Error budget policy

### 3.1 28-day rolling window

各 SLO は 28-day rolling window で error budget を消費。週次の SLO review で残 budget を確認。

| 残 budget          | Policy                                                                                                                                                                            |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| > 50%              | Normal ops、feature deploy 通常 cadence、CI/CD pipeline 通常運用                                                                                                                   |
| 25 - 50%           | **Yellow**: SRE Lead + AI 管理者 で root cause review、deploy cadence 維持だが新規 chaos engineering 控える                                                                       |
| 10 - 25%           | **Orange**: Feature deploy freeze (新規 ADR 適用 freeze)、bug fix + DR drill のみ、Type B 設定承認 issue は経営層通知必須                                                          |
| 0 - 10%            | **Red**: Full deploy freeze (Liquibase migration も freeze、emergency security fix のみ exception)、SRE Lead + AI 管理者 + 経営層 emergency review                                  |
| Budget exhausted   | **Black**: Phase 1 ops 一時停止判断、業務責任者 + 経営層 escalation、根本原因 SLA-week 改善計画 commit                                                                              |

### 3.2 SLO-05 (Audit chain integrity) 例外

SLO-05 は **0 breach** が target、any breach は即時 S0 incident で deploy freeze + 経営層 + Compliance officer + Security 関係者 immediate notification (10 分以内)。Error budget policy の段階適用は SLO-05 には適用しない。

---

## 4. Alert severity matrix S0-S4

### 4.1 Severity definition

| Severity | 状態定義                                                                                              | Response SLA                          | Escalation path                                                                                                            |
| -------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **S0**   | Catastrophic: audit chain breach / data residency violation / cross-tenant data leak / DR 発動 / SLO-01 > 50% fail | **5 min ack / 30 min mitigation start**  | On-call → SRE Lead (5 min) → AI 管理者 + Security 関係者 (10 min) → 業務責任者 (15 min) → 経営層 + Compliance officer (30 min) |
| **S1**   | Critical: SLO-01 5-50% fail / Bedrock TPM exhaustion / Aurora write availability lost / SCP integrity drift | **15 min ack / 1 hr mitigation start**  | On-call → SRE Lead (15 min) → AI 管理者 (30 min) → 業務責任者 (1 hr)                                                       |
| **S2**   | Major: SLO-02/03/04 violation / partial component outage / Cost anomaly > 2x baseline                  | **30 min ack / 4 hr mitigation start** | On-call → SRE Lead (30 min) → on-call backup (1 hr)                                                                        |
| **S3**   | Minor: 単発 error / latency spike < 5 min / single Lambda function elevated error                      | **2 hr ack / next business day mitigation** | On-call → SRE Engineer (Day) (next business day)                                                                          |
| **S4**   | Informational: capacity warning / cost anomaly < 2x / planned maintenance reminder                    | **next business day**                  | SRE Engineer (Day) review                                                                                                  |

### 4.2 Severity assignment matrix (alarm → severity mapping)

| Alarm category                                | S0   | S1   | S2   | S3   | S4   |
| --------------------------------------------- | ---- | ---- | ---- | ---- | ---- |
| Audit chain verify failure                    | ✅   |      |      |      |      |
| Bedrock invocation log redirect failure       | ✅   |      |      |      |      |
| Cross-tenant data leak detected (RLS bypass) | ✅   |      |      |      |      |
| SCP integrity drift (Config rule violation)   | ✅   |      |      |      |      |
| DR 発動 (Aurora Global DB failover)           | ✅   |      |      |      |      |
| SLO-01 Availability 5xx > 50% for 5 min       | ✅   |      |      |      |      |
| SLO-01 5xx 5-50%                              |      | ✅   |      |      |      |
| Bedrock TPM throttle sustained > 5 min        |      | ✅   |      |      |      |
| Aurora writer DB connection loss > 1 min      |      | ✅   |      |      |      |
| Computer Use Fargate task spawn failure burst |      | ✅   |      |      |      |
| SLO-02 Inbox latency P95 > 5 min sustained    |      |      | ✅   |      |      |
| SLO-03 Approval latency P95 > 30 min sustained |      |      | ✅   |      |      |
| SLO-04 AI reject rate > 5% (28 day rolling)   |      |      | ✅   |      |      |
| Cost anomaly > 2x daily baseline              |      |      | ✅   |      |      |
| Single Lambda error rate > 1% < 5 min         |      |      |      | ✅   |      |
| WAF block rate spike < threshold              |      |      |      | ✅   |      |
| Capacity warning (e.g., RDS Proxy connection 80%) |  |      |      |      | ✅   |

---

## 5. On-call rotation

### 5.1 Rotation pattern

- **Phase 1 開始**: 2 person primary rotation、weekly handoff (Wed 16:00 JST 想定 → US side 02:00 ET、運用 timezone は Phase 1 着手前に確定)
- **Primary on-call**: S0-S2 first responder、5 min ack SLA、ack 失敗時 backup auto-page
- **Backup on-call**: primary が ack 失敗時に 5 min auto-page、または primary 自己 escalation
- **Coverage**: 24/7、weekend / holiday も rotation 通り、handoff 時に open incident hand-off

### 5.2 Tooling

- **Paging**: PagerDuty (Phase 1 着手 -30 day までに license 確保) または AWS Chatbot + Slack mention + phone call escalation policy
- **Runbook access**: 本 doc を Confluence / SharePoint に mirror、mobile readable formatting
- **War room**: Slack channel `#incident-active`、S0/S1 で auto-create + 関係者 invite

### 5.3 On-call expectation

| 軸                    | Expectation                                                                                                                              |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Response SLA          | S0: 5 min ack / 30 min mitigation start、S1: 15 min ack / 1 hr mitigation start                                                          |
| Working location      | Remote OK、ただし stable network + laptop + 2FA device + AWS console access 24/7                                                          |
| Required skill        | AWS console basic + CloudWatch dashboard reading + runbook §8 主要 12 件の execution + Slack war room facilitate                          |
| Escalation 権限       | S1 以上は SRE Lead escalation 必須、judgement call 不要 (自動 escalate)、S0 は 5 min 以内に SRE Lead 接触                                  |
| Postmortem 義務       | S0-S2 で primary on-call が draft postmortem を 3 business day 以内に initialize、SRE Lead が final owner                                  |

---

## 6. Incident response 5 phase

### Phase 1: Detection + Ack (0-15 min)

1. Alarm 発火 → PagerDuty / Slack mention で primary on-call page
2. On-call が 5 min (S0) / 15 min (S1) 以内に ack (PagerDuty button or Slack reply)
3. War room channel auto-create or join、initial assessment 5 min 以内
4. Severity confirm (initial alert severity と乖離あれば SRE Lead 確認)

### Phase 2: Triage + Initial mitigation (15 min - 1 hr)

1. 関連 runbook (§8) を execute
2. Customer-facing impact assessment (case 件数 / tenant 件数 / SLO breach)
3. Communication: business owner + Compliance officer (S0 で必須、S1 で必要に応じ) に initial notify
4. Mitigation action start (rollback / scale / failover / circuit breaker)、変更は全 audit_event 化

### Phase 3: Stabilization (1 hr - 4 hr)

1. Mitigation 効果確認 (SLI metric recovery、CloudWatch dashboard)
2. Root cause hypothesis development、log + metric 収集
3. War room status update を 30 min cadence で post (S0)、1 hr cadence (S1)
4. 関係者 status update (business owner / Compliance officer / 経営層 if S0)

### Phase 4: Resolution + Closure (4 hr - 24 hr)

1. SLI metric が baseline に復帰 + 連続 1 hr 安定 → resolve declare
2. Final status update + close war room channel
3. Open work item assignment (root cause investigation / permanent fix)
4. Incident ticket close、postmortem ticket open

### Phase 5: Postmortem (24 hr - 5 business day)

1. Primary on-call が postmortem draft initialize (§7 template) within 3 business day
2. SRE Lead が postmortem owner として review + action item assign
3. Postmortem review meeting (週次 SRE sync) で 関係者 walk-through
4. Action item を Phase 1 sprint backlog に push、quarterly review で完了 verify
5. **Blameless culture**: 個人の責任追及禁止、process + system の改善に focus

---

## 7. Postmortem template

```markdown
# Postmortem — Incident <YYYY-MM-DD>-<short title>

## 1. Summary
- **Date / Time**: <yyyy-mm-dd HH:MM UTC> ~ <yyyy-mm-dd HH:MM UTC>
- **Duration**: <X hr Y min>
- **Severity**: S0 / S1 / S2 / S3
- **Customer impact**: <件数 case / 業務 / tenant>
- **SLO breach**: SLO-NN by <X>% / <Y> error budget consumed
- **Root cause (1 line)**: <root cause summary>

## 2. Timeline (UTC)
| Time     | Event                                              | Action by         |
| -------- | -------------------------------------------------- | ----------------- |
| HH:MM    | (alarm 発火 / first detection)                     | CloudWatch / on-call |
| HH:MM    | On-call ack                                        | <name>            |
| HH:MM    | (key 状態変化 / mitigation action / status update) | <name>            |
| ...      | ...                                                | ...               |
| HH:MM    | Resolved                                           | <name>            |

## 3. Root cause analysis
- **What happened**: <factual description, no blame>
- **Why did it happen**: <5 Whys analysis>
- **Why wasn't it caught earlier**: <gap in monitoring / runbook / process>

## 4. Impact
- **Customer impact (business-level)**: <件数 case affected, business SLA impact>
- **SLO impact**: <SLI metric breach detail>
- **Cost impact**: <unexpected cost incurred>
- **Compliance impact**: <regulatory notification required (Y/N), incident class per NYDFS 500.17 etc.>

## 5. What went well
- <list 2-3 positive findings>

## 6. What went poorly
- <list 2-3 improvement areas, blameless>

## 7. Action items
| ID  | Action                                       | Owner       | Target date | Status |
| --- | -------------------------------------------- | ----------- | ----------- | ------ |
| A1  | <prevention action>                          | <name>      | YYYY-MM-DD  | open   |
| A2  | <detection improvement>                      | <name>      | YYYY-MM-DD  | open   |
| A3  | <runbook update>                             | <name>      | YYYY-MM-DD  | open   |

## 8. Lessons learned (for future docs / training)
- <bullet>

## 9. Regulatory notification (if applicable)
- NYDFS 500.17 reportable? (Y/N): <answer>
- 72-hour notification timeline met? (Y/N): <answer>
- Compliance officer notified at: <yyyy-mm-dd HH:MM>
```

---

## 8. 主要 runbook 集 (12 件)

### RB-01: Bedrock TPM throttle sustained (S1)

**Symptom**: Bedrock throttle exception alarm sustained > 5 min
**Verify**:
```bash
aws cloudwatch get-metric-statistics --namespace AWS/Bedrock \
  --metric-name InvocationThrottles --start-time -PT15M --end-time 0 --period 60 --statistics Sum
```
**Action**:
1. Service quota increase 緊急申請 (AWS Support priority case)
2. Step Functions で AI 入力 burst を 75% に rate limit (`MaxConcurrency` 50→38)
3. Inbox queue depth monitoring、SLO-02 breach 観測
4. Recovery 後 step 2 を reset

### RB-02: Aurora writer 接続喪失 (S1)

**Symptom**: RDS Proxy ConnectionAttempt fail > 1 min
**Verify**:
```bash
aws rds describe-db-clusters --db-cluster-identifier backofficeai-prod
```
**Action**:
1. Aurora cluster status (`available` / `failing-over`) 確認
2. Auto failover が trigger されていない場合 manual failover (`aws rds failover-db-cluster`)
3. Application reconnect 確認 (Lambda + Step Functions retry behavior)
4. Failover 完了後 5 min stabilize observe

### RB-03: Audit chain verify failure (S0)

**Symptom**: Daily audit_chain_head verify cron failure
**Verify**:
```sql
SELECT * FROM audit.audit_chain_head WHERE chain_verify_status = 'fail' ORDER BY verified_at DESC LIMIT 10;
```
**Action**:
1. **5 min 以内に SRE Lead + Security 関係者 + Compliance officer 同時 page**
2. Deploy freeze IMMEDIATE
3. Aurora point-in-time recovery target time 確定 (last successful verify timestamp)
4. S3 Object Lock manifest を別 region で archive (preserve)
5. Tampering scope identify、affected partition list
6. Regulatory notification required check (NYDFS 500.17 72 hr)、Compliance officer 主導
7. Recovery action は Type B 緊急設定承認 経由

### RB-04: Computer Use Fargate spawn failure burst (S1)

**Symptom**: ECS RunTask failure rate > 10% for 5 min
**Verify**:
```bash
aws ecs list-tasks --cluster computer-use --desired-status RUNNING | wc -l
```
**Action**:
1. ECS service quota (per region task count) check、quota increase 申請
2. Warm pool 5 → 2 に temp downsize、burst 排除 (queue depth まで recovery)
3. Network Firewall block log 確認 (allowlist regression)
4. Sample task 1 件を manual run + log 詳細確認

### RB-05: Cost anomaly > 2x baseline (S2)

**Symptom**: AWS Cost Anomaly Detection alert
**Verify**:
```bash
aws ce get-anomalies --date-interval StartDate=YYYY-MM-DD,EndDate=YYYY-MM-DD
```
**Action**:
1. 主要 driver (Bedrock token / Fargate task hour / S3 storage / data transfer) 特定
2. 異常 driver の per-tenant tag analysis
3. Bedrock の場合 invocation log で abnormal pattern 特定 (prompt injection scenario の可能性 → T-AI-01)
4. Cost guardrail 適用 (AWS Budgets action で Bedrock invoke を一時 deny も Phase 1 検討)、経営層 / Cost team escalation

### RB-06: SCP integrity drift (S0)

**Symptom**: Config rule `scp-integrity-check` violation
**Verify**:
```bash
aws organizations describe-policy --policy-id p-xxxxxxxx
```
**Action**:
1. Deploy freeze
2. Drift 内容 inspect (4 SCP 各 statement diff)
3. CDK source-of-truth と reconcile、bring back
4. Drift period 中の affected resource list (e.g., cross-region inference attempt log)
5. Postmortem 必須 (process gap analysis)

### RB-07: Cross-tenant data leak detected (S0)

**Symptom**: RLS bypass attempt audit + per-Lambda tenant_id setting test fail
**Verify**:
```sql
SELECT * FROM audit.rls_bypass_attempt_log ORDER BY occurred_at DESC LIMIT 100;
```
**Action**:
1. **5 min 以内に SRE Lead + Security + Compliance officer 同時 page**
2. Deploy freeze
3. Affected case + tenant identify、leak scope assessment
4. Regulatory notification (NYDFS 500.17 + GLBA Reg P breach notification rule)、Compliance officer 主導
5. Lambda 該当 function を SCP で deny (緊急 mitigation)、root cause investigate

### RB-08: KMS key policy drift (S1)

**Symptom**: CDK structural diff CI gate fail / KMS Config rule violation
**Action**:
1. Deploy freeze
2. CDK source vs apply diff (us-east-1 / us-west-2 両方)
3. Bring back to source-of-truth
4. Drift period 中の Encrypt/Decrypt event audit
5. Postmortem

### RB-09: Step Functions Standard workflow stuck > 30 min (S2)

**Symptom**: Step Functions execution duration alarm
**Verify**:
```bash
aws stepfunctions list-executions --state-machine-arn ARN --status-filter RUNNING --max-results 50
```
**Action**:
1. Stuck execution の current state name 確認
2. Lambda function error log (CloudWatch Logs Insights)
3. Idempotency_registry duplicate check
4. Manual stop + restart from last successful state、audit_event で record

### RB-10: WebSocket connection registry burst (S2)

**Symptom**: DynamoDB connection_registry write throttle
**Verify**:
```bash
aws dynamodb describe-table --table-name connection_registry
```
**Action**:
1. DynamoDB on-demand 動作確認 (auto-scale 確認)、provisioned mode の場合 capacity increase
2. Stale connection cleanup (TTL 確認)
3. Per-tenant connection limit 適用 (Phase 1 sandbox で limit calibrate)

### RB-11: Cognito sign-in failure spike (S1 / Security)

**Symptom**: CloudTrail Cognito sign-in failure rate spike + GuardDuty UserPwdSpray
**Verify**:
```bash
aws guardduty list-findings --finding-criteria 'type:UnauthorizedAccess:IAMUser/UserPwdSpray'
```
**Action**:
1. WAF RateBasedRule で attacker IP range block
2. Compromised account 候補特定 (per-sub failure rate)、forced password reset
3. Security 関係者 escalation、Entra ID sentinel 連動 check

### RB-12: DR drill quarterly (planned、§9 参照)

(planned procedure、actual incident ではない、§9 で詳述)

---

## 9. Quarterly DR drill SOP

### 9.1 Frequency + Scope

- **Frequency**: Quarterly (3 month cadence)、+ Phase 1 着手 -7 day に full drill 1 回
- **Scope** (rotate per quarter):
  - Q1: Aurora Global DB failover (us-east-1 → us-west-2 promote)
  - Q2: S3 Cross-Region Replication failover + bucket restore
  - Q3: Cognito region failover + Step Functions + EventBridge cross-region
  - Q4: Full-stack DR (Q1+Q2+Q3 同時)、加えて Phase 1 着手前 full drill

### 9.2 Drill execution (each quarter)

1. **Plan (drill -14 day)**: DR scenario確定、关係者 schedule、stakeholder notify
2. **Pre-check (drill -1 day)**: us-west-2 secondary region state confirm (Aurora replica lag、S3 replication metric、Cognito user pool sync)
3. **Execute (drill day)**:
   - T+0: drill 開始 declare、war room channel create
   - T+5 min: us-east-1 simulate outage (Route 53 health check で us-east-1 endpoints fail を演出)
   - T+10 min: Manual failover trigger (Aurora promote、Route 53 failover target switch、Cognito region cutover)
   - T+15 min: Application traffic を us-west-2 へ rerouting
   - T+30 min: Smoke test (case 1 件 e2e 処理)、RTO measurement
   - T+60 min: us-east-1 restore (Aurora new replica setup、Cognito sync re-enable)
   - T+90 min: drill 終了 declare
4. **Postmortem (drill +5 business day)**: §7 template で drill 結果 record、RTO 実測 + DR doc update (CA-08 §15)

### 9.3 Drill 成功基準

- RTO 実測 < 30 min (DOC-CA-08 §15.1 target)
- RPO 実測 < 1 sec (Aurora Global DB) / < 15 min (S3 CRR)
- In-flight case の `dr_paused` state 適用 + DR 中 0 leak + 復旧後 audit chain integrity verify pass
- Cognito employee_ref-based SoD continuity (F20) verify pass

---

## 10. SLO review cadence

| Cadence    | Activity                                                                                                       | Owner          |
| ---------- | -------------------------------------------------------------------------------------------------------------- | -------------- |
| Daily      | Dashboard glance (SLO-01 ~ SLO-05 SLI metric)                                                                  | On-call Engineer |
| Weekly     | SRE sync meeting で error budget burn rate + open incident review + postmortem walk-through                    | SRE Lead       |
| Monthly    | SLO consumption report + capacity planning + cost review                                                       | SRE Lead + Cost team |
| Quarterly  | SLO recalibrate (target 値 review、Phase 1 4 週運用後 first revision、その後 quarterly)、DR drill + threat model refresh | SRE Lead + AI 管理者 + Security 関係者 |
| Annual     | Annual readiness review + budget review + roadmap update (Phase 2 transition)                                  | 経営層 + SRE Lead |

---

## 11. 関連文書 + 出典

- **DOC-CA-08 v2.6** (`docs/08-cloud-architecture.md` §10 Observability / §15 DR / §6.3.1 warm pool)
- **DOC-DM-07 v1.7.2** (`docs/07-data-model.md` §10 Operations Playbook / §9 Audit verify)
- **DOC-TM-10 v0.1** (`docs/10-threat-model.md` §8 Monitoring + Detection controls)
- **DOC-PFC-09 v0.2** (`docs/09-pre-flight-execution-checklist.md` PFC-06 warm pool 実測 + PFC-03 Bedrock Geo CRIS verify)
- **DOC-MON-05** (`docs/05-metrics-and-gates.md` 4 KPI / 9 KRI catalogue)
- Google SRE Book + Workbook (SLO / error budget framework reference)
- NYDFS 23 NYCRR Part 500.17 (72 hr cybersecurity event notification、Postmortem template §9 regulatory notification 項目)
- AWS Well-Architected Reliability Pillar

---

## 12. 後続 PR / TODO

1. ✅ **完了 (本 doc 起稿、autonomous prod-ready loop Cycle 3)** — DOC-SRE-11 v0.1 起稿、5 SLO + S0-S4 severity matrix + on-call rotation + 5 phase incident response + 12 runbook + DR drill SOP
2. **CloudWatch dashboard CDK skeleton** (Phase 1 sprint 0 で実装、本 doc §2.2 SLI query を metric filter + composite alarm 化)
3. **PagerDuty / Slack alert integration** (Phase 1 着手 -30 day、本 doc §5 rotation)
4. **DR drill quarterly schedule確定** (Phase 1 着手 -14 day、本 doc §9)
5. **DOC-ROOT-_SSOT row 追加** — DOC-SRE-11 row (Cycle 9)
6. **DOC-CA-08 §10.4 alarm table から本 doc §4.2 severity matrix への pointer 追加** (Cycle 9 integration sweep)
7. **Phase 1 4 週運用後の SLO recalibrate** (§10 quarterly review、first revision)
