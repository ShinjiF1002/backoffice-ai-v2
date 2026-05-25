# Backoffice AI v2 — Threat Model (v0.1 Draft)

> **目的**: DOC-CA-08 v2.3.2 + DOC-DM-07 v1.6.2 の設計 surface に対し、STRIDE framework + AI/ML 固有 threat (prompt injection / model extraction / data poisoning) + insider / supply chain / key compromise scenario を逐軸で enumerate、各 threat に既存 mitigation の pointer + residual risk + monitoring control を pin する。
> **位置付け**: DOC-CA-08 §7.3.1 F10 (Computer Use prompt injection 4 段防御) を起点に、threat surface 全体を STRIDE × 12 layer matrix で覆い、Phase 1 Type B 設定承認 + FRB SR 11-7 model risk governance + OCC SR 11-7 third-party AI risk assessment の input doc として運用。

| 項目            | 値                                                                                                                                                                                |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 文書 ID         | DOC-TM-10                                                                                                                                                                         |
| 文書名          | Threat Model (STRIDE × 12 layer + AI/ML threat + insider / supply chain / key compromise + abuse case catalog)                                                                    |
| 版数            | v0.1                                                                                                                                                                              |
| ステータス      | Draft (autonomous prod-ready loop Cycle 2 起稿)                                                                                                                                   |
| オーナー        | Security 関係者 + AI 管理者 (Model Risk Management co-owner)                                                                                                                       |
| 承認者          | 設定承認 Type B (Security-impacting、threat surface 評価を含むため) + FRB SR 11-7 model risk governance committee                                                                  |
| 閲覧対象        | Phase 1 implementation team / Security 関係者 / Compliance 関係者 / Model Risk Management / 外部監査 / external legal counsel                                                      |
| 機密区分        | **Confidential** (attack scenario 詳述を含むため、本 doc 単独で attacker reference にならないよう取扱注意)                                                                          |
| 関連文書        | **DOC-CA-08 v2.3.2 §7.3.1 (F10) / §5.3 (Computer Use egress) / §12 (Security baseline)**, **DOC-DM-07 v1.6.2 §5 (Enforcement) / §6 (PII) / §9 (Immutable Audit)**, DOC-PFC-09 (PFC-04 攻撃 scenario の SSOT), DOC-CEM-12 (Cycle 4、Compliance Evidence Matrix への入力), DOC-SRE-11 (Cycle 3、incident response への接続) |
| SSOT 区分       | Threat surface enumeration + STRIDE mapping + AI/ML threat catalog + abuse case の SSOT                                                                                            |
| Evidence Status | 設計 + 公開 threat intelligence ベース (OWASP Top 10 for LLM / NIST AI RMF / MITRE ATLAS)。実測 verification は PFC-04 (Cycle 1 起稿済) で実行                                       |
| 改版履歴        | v0.1 (2026-05-25、autonomous prod-ready loop Cycle 2): 初版作成、STRIDE × 12 layer matrix + AI/ML 固有 7 threat + insider 3 scenario + supply chain 4 scenario + key compromise 3 scenario + abuse case 12 件を catalog 化、各 threat に既存 mitigation pointer + residual risk + monitoring control 付与 |

---

## 0. 本 doc の読み方 (3 分要約)

- **対象**: Phase 1 (UC-BO-01 法人住所変更、AWS us-east-1 + us-west-2、JP 銀行 America division) の threat surface
- **scope**: §2 STRIDE × 12 layer / §3 AI/ML 固有 threat / §4 insider / §5 supply chain / §6 key compromise / §7 abuse case catalog / §8 monitoring + detection control / §9 residual risk register
- **out of scope**: (a) 物理 facility threat (AWS Region の physical security は AWS shared responsibility)、(b) DDoS at scale (AWS Shield Advanced 想定、Phase 2 評価)、(c) JP 本店側 internal threat (DOC-CA-09 candidate、別 doc)、(d) UI/UX phishing 個別事例 (DOC-SRE-11 で incident response 側で扱う)
- **threat 表記**: T-<category>-<NN> ID で全 threat を unique 識別 (T-SP=spoofing / T-TM=tampering / T-RP=repudiation / T-ID=info disclosure / T-DS=denial of service / T-EP=elevation of privilege / T-AI=AI/ML 固有 / T-IN=insider / T-SC=supply chain / T-KC=key compromise / T-AB=abuse case)
- **mitigation 引用**: `[CA-08 §X.Y]` / `[DM-07 §X.Y]` 形式で既存 control への pointer、residual risk は §9 register に accumulate

---

## 1. Threat modeling methodology + scope

### 1.1 採用 framework

- **STRIDE** (Microsoft、6 category): Spoofing / Tampering / Repudiation / Information Disclosure / Denial of Service / Elevation of Privilege
- **OWASP Top 10 for LLM Applications** (2025): LLM01 Prompt Injection / LLM02 Sensitive Information Disclosure / LLM03 Supply Chain / LLM04 Data and Model Poisoning / LLM05 Improper Output Handling / LLM06 Excessive Agency / LLM07 System Prompt Leakage / LLM08 Vector and Embedding Weaknesses / LLM09 Misinformation / LLM10 Unbounded Consumption
- **NIST AI Risk Management Framework (AI RMF 1.0)**: Govern / Map / Measure / Manage
- **MITRE ATLAS** (Adversarial Threat Landscape for AI Systems): ML attack lifecycle (Reconnaissance / Resource Development / Initial Access / ML Model Access / Execution / Persistence / Defense Evasion / Discovery / Collection / ML Attack Staging / Exfiltration / Impact)

### 1.2 12 layer surface (DOC-CA-08 §3.1 と一致)

L1 Identity / L2 Network / L3 Compute / L4 AI Runtime / L5 Integration / L6 Persistence / L7 Observability / L8 CI/CD / H1 Security baseline / H2 DR / H3 Cost / H4 Frontend

### 1.3 Trust boundary

| Boundary           | Across                                                                       |
| ------------------ | ---------------------------------------------------------------------------- |
| TB1: User ↔ Frontend | End user device (untrusted) ↔ CloudFront edge (trusted)                       |
| TB2: Frontend ↔ API | CloudFront ↔ API Gateway (Cognito JWT)                                        |
| TB3: API ↔ Compute  | API Gateway ↔ Lambda / Step Functions (IAM role assume)                       |
| TB4: Compute ↔ AI Runtime | Lambda ↔ Bedrock (KMS-encrypted invocation + cross-account audit log)   |
| TB5: Compute ↔ Computer Use Fargate | Step Functions ↔ ECS Fargate (per-case ephemeral sandbox)         |
| TB6: Compute ↔ Persistence | Lambda ↔ Aurora (RDS Proxy + IAM auth + RLS + KMS)                       |
| TB7: AI Runtime ↔ External | Computer Use Fargate ↔ 業務 system (TLS inspection + FQDN allowlist)     |
| TB8: Account boundary | Application account ↔ Security account (cross-account audit immutability) |
| TB9: Operator ↔ AWS Console | Engineer ↔ IAM Identity Center (federated to Entra ID)               |
| TB10: Region boundary | us-east-1 ↔ us-west-2 (cross-region replication / DR failover)           |

各 STRIDE category × TB を §2 で逐軸 enumerate。

---

## 2. STRIDE × 12 layer × Trust boundary matrix

### 2.1 Spoofing (T-SP)

| ID    | Threat                                                                                                       | Affected layer / TB | Existing mitigation                                                                                       | Residual risk                                                                                                | Monitoring                                              |
| ----- | ------------------------------------------------------------------------------------------------------------ | ------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------- |
| T-SP-01 | Cognito JWT 偽造 + replay attack による end user impersonation                                                | L1 / TB1, TB2       | Cognito JWT signature verify (Lambda authorizer)、`jti` claim + short-lived token (1hr) + rotating refresh [CA-08 §4.2] | refresh token cookie XSS 経路で漏洩 → BFF-mediated HttpOnly cookie + CSRF double-submit で mitigation [CA-08 §11.2 F18] | CloudTrail Cognito sign-in failure rate + GuardDuty UserPwdSpray |
| T-SP-02 | Entra ID SAML assertion 改竄 (IdP-side compromise scenario)                                                  | L1 / TB1            | SAML signature verify + IdP cert pin、Entra Conditional Access policy で device compliance 強制 [CA-08 §4.2] | IdP-side compromise は AWS layer では検知不能 (Entra ID 側 monitoring 必須)、Conditional Access bypass risk    | Entra ID risky sign-in detection + Sentinel integration |
| T-SP-03 | 高権限 role (承認者 / AI 管理者) phishing による step-up MFA bypass                                            | L1 / TB1            | FIDO2/WebAuthn 必須 (TOTP/SMS 禁止) + `acr` claim Lambda authorizer 検証 [CA-08 §4.2 F1]                  | FIDO2 device 物理盗難 + Entra PIN 既知 scenario (極めて低確率)                                                | CloudTrail step-up failure + role assume per-IP anomaly |
| T-SP-04 | IAM role assume via stolen access key (engineer credential 漏洩)                                              | L1 / TB9            | IAM Identity Center による access key 不発行 (短命 STS token) + SCP `iam:CreateAccessKey` deny [CA-08 §12.1 F19] | Identity Center session token 盗難 (browser compromise) は session duration 1hr + IP restriction で部分 mitigation | GuardDuty UnauthorizedAccess + access advisor |
| T-SP-05 | API Gateway custom domain certificate 改竄 / MITM                                                            | L5 / TB2            | ACM-managed cert + DNS validation + HSTS + CloudFront origin verify                                       | DNS hijack scenario (CloudFront origin override) は Route 53 + Route 53 Resolver DNS Firewall で mitigation   | Certificate Transparency monitoring + Config rule       |
| T-SP-06 | Step Functions execution role impersonation (cross-account assume role abuse)                                | L3 / TB3            | SCP `aws:SourceVpc` condition + `external_id` 必須 [CA-08 §12.1 F19]                                      | Application account compromise scenario (Step Functions role が compromise account 内で abuse される)         | CloudTrail AssumeRole event correlation                 |
| T-SP-07 | Bedrock invoke 偽装 (別 tenant 名で invoke + audit log 偽行)                                                   | L4 / TB4            | Lambda 側 application enforcement で `tenant_id` を Bedrock invocation metadata に強制 record、cross-account immutable log [CA-08 §12.4 F14] | Lambda code injection scenario (CodePipeline compromise) は ADR-9 audit immutability で post-hoc 検出可     | Bedrock invocation log audit query (per-tenant volume anomaly) |

### 2.2 Tampering (T-TM)

| ID    | Threat                                                                                                       | Affected layer / TB | Existing mitigation                                                                                       | Residual risk                                                                                | Monitoring                                              |
| ----- | ------------------------------------------------------------------------------------------------------------ | ------------------- | --------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| T-TM-01 | Past case `ai_proposal_snapshot` 改竄 (DBA / root 経路)                                                       | L6 / TB6            | DM-07 §5.5 AI proposal freeze trigger (UPDATE/DELETE block) + RLS + audit_event append-only + hash chain  | DB super-user (rds_superuser equiv) は trigger bypass 可、ADR-9 cross-account immutable audit で post-hoc 検出 | Audit chain head verify (daily) + S3 Object Lock manifest tamper detect |
| T-TM-02 | `workflow_version` snapshot 改竄 (compiled knowledge swap)                                                   | L6 / TB6            | DM-07 §5.2 immutability trigger + Config change Type B 経由でのみ新版 publish [CA-08 ADR-9]                | 同上 (DB super-user)、加えて compiled snippet weight 改竄で staging を citation source 化する risk → §5.4 trigger で防御 | `compiled_snippet` mutation event + procedure_proposal sign-off chain audit |
| T-TM-03 | `audit_event` hash chain 切断 (1 行 delete + chain regen)                                                    | L6 / TB6            | DM-07 §9.1 4 ring 防御 (REVOKE update/delete + RLS + trigger + cross-account streaming export ≤ 5 min)    | 5 min export window 内の event を delete + Aurora point-in-time recovery で seal 前に rollback する scenario  | Chain head divergence alarm + S3 Object Lock manifest divergence |
| T-TM-04 | Computer Use screenshot tampering (Fargate compromise → S3 object overwrite)                                | L3 / TB5            | S3 VPC endpoint + bucket policy `aws:SecureTransport=true` + Object Lock + per-task IAM role write-only [CA-08 §5.4, §12.4] | Fargate task が write-only IAM role を misuse できる scenario (object versioning + Object Lock で防御)        | S3 PutObject anomaly + Object Lock retention check       |
| T-TM-05 | CodePipeline artifact tampering (CI/CD compromise)                                                            | L8 / TB3            | CodePipeline KMS encryption + ECR image signing + GitHub Actions OIDC + branch protection (review 必須)    | GitHub repo compromise scenario (ADR-7 で Terraform 不採用、CDK source repo は branch protection 必須)        | Sigstore / cosign verify + GuardDuty CodePipeline alert  |
| T-TM-06 | Liquibase changelog injection (forward-only 制約 bypass)                                                     | L8                  | Squawk linter + `[liquibase-destructive-approved]` magic comment + contract phase 限定 [CA-08 §9.3 F17]   | Magic comment が CI で正しく enforce されない (CI bypass scenario) → review 必須                              | GitHub PR check + Squawk CI gate                         |
| T-TM-07 | CDK stack drift (manual console change)                                                                       | L8 / TB9            | Config rule drift detection + CDK structural diff CI gate [CA-08 §9.4 F16] + SCP `iam:CreateAccessKey` deny | SREAdmin role が console で resource modify scenario → SCP で write deny は無理、access log + drift alarm で post-hoc | Config drift event + CloudTrail console action audit     |
| T-TM-08 | Bedrock invocation log tampering (logging bucket write 経路)                                                  | H1 / TB8            | Cross-account S3 Object Lock Compliance (root も bypass 不能) + KMS key cross-account grant [CA-08 §12.4 F14] | KMS key administrative compromise scenario (極めて低確率、Phase 2 で HSM-backed CMK 検討)                     | Object Lock manifest verify + KMS CloudTrail audit       |

### 2.3 Repudiation (T-RP)

| ID    | Threat                                                                                                       | Affected layer / TB | Existing mitigation                                                                                       | Residual risk                                                            | Monitoring                                              |
| ----- | ------------------------------------------------------------------------------------------------------------ | ------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------- |
| T-RP-01 | 承認者が「approve したのは自分ではない」と否認 (4-eyes 後の repudiation)                                       | L6 / TB6            | DM-07 §3.4 `human_decision.actor_user_id` + Cognito `sub` claim binding + audit_event 4-eyes binding + WebAuthn signed attestation [CA-08 §4.2 F1] | Shared device + WebAuthn cred 共有 scenario (operational SOP で防御、技術的に完全排除不能) | WebAuthn attestation chain verify + per-user device list |
| T-RP-02 | AI 管理者が Type B 設定承認後「設定変更を承認していない」と否認                                              | L6 / TB6            | DM-07 §5.8 Type B SoD trigger + audit_event + hash chain                                                 | DB super-user による trigger bypass + audit log tamper (T-TM-03 と同じ)  | Type B approval per-actor weekly audit                  |
| T-RP-03 | 業務責任者が「reflect 命令を出していない」と否認                                                              | L6 / TB6            | Type C SoD trigger (業務責任者 co-approval) + audit_event                                                  | 同上                                                                     | Type C approval audit + Slack record cross-correlate    |

### 2.4 Information Disclosure (T-ID)

| ID    | Threat                                                                                                       | Affected layer / TB | Existing mitigation                                                                                       | Residual risk                                                                                                              | Monitoring                                              |
| ----- | ------------------------------------------------------------------------------------------------------------ | ------------------- | --------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| T-ID-01 | Bedrock invocation prompt + response が CloudWatch Logs に露出 (PII leak)                                    | L4 / TB4            | Bedrock invocation logging を S3 redirect、CloudWatch には metadata のみ [CA-08 §12.4 Round 2 #1]         | Lambda console.log で raw prompt を出力する code mistake → grep gate + CI で `console.log` detect                          | CloudWatch log scan (per-week)、Macie PII detection     |
| T-ID-02 | Computer Use screenshot に顧客 PII (name / address / id_document) が映る                                     | L3 / TB5, TB7       | Screenshot redaction (PII mask) を Bedrock Guardrails で enforce + S3 KMS-encrypted + Object Lock [CA-08 §12.4] | Guardrails redaction で抜け patterns (新 PII format / OCR で読めない pattern) は PFC-04 sample test で検出      | Macie scan on screenshot_stack S3 + PFC-04 sample audit |
| T-ID-03 | SPA bundle に API endpoint + Cognito client_id 露出 (Phase 1 で attack surface 認識)                          | H4 / TB1            | Cognito client_id は public 想定、API endpoint も public、authz は JWT で enforce                          | Bundle 内に accidental hardcoded secret 混入 → CI で `gitleaks` + GitGuardian scan                                          | gitleaks CI gate + GitHub secret scanning               |
| T-ID-04 | RDS Proxy connection pool 経由で別 tenant data 漏洩 (RLS bypass scenario)                                    | L6 / TB6            | RDS Proxy session variable `app.tenant_id` per-invocation 設定 + RLS policy が `current_setting` で enforce [DM-07 §5.7] | Lambda code mistake で `tenant_id` 設定漏れ → application unit test で必須、加えて RLS が default DENY であることを sandbox verify | RLS bypass attempt audit + per-Lambda tenant_id setting test |
| T-ID-05 | OpenSearch Serverless cross-tenant query (multi-tenant Phase 2 想定)                                          | L6                  | Phase 1 single tenant のみ active、Phase 2 で OpenSearch tenancy 別 collection or per-tenant index 評価     | Phase 2 設計時に再評価、Phase 1 では risk 顕在化せず                                                                       | (Phase 2 で追加)                                        |
| T-ID-06 | Bedrock Cross-Region inference でデータが eu-west-1 / us-east-2 等の外 region に出る                          | L4 / TB10           | SCP `Deny bedrock:InvokeModel*` outside us-east-1 + us-west-2 [CA-08 §7.5, §12.1]                         | SCP misconfigure scenario → CI で SCP integrity test、Config rule で SCP drift detect                                       | Config SCP rule + Bedrock invocation log region anomaly  |
| T-ID-07 | Aurora Global DB cross-region replication 経路で PII が us-west-2 に出る (= region 内、residency 観点 OK)    | L6 / TB10           | us-west-2 は in-scope region (regulatory framework は両 region 同じ)、KMS Multi-Region Key + TLS in-flight | regulator が us-west-2 を accepted region と認識する確認 (PFC-02 counsel review 範囲)                                       | PFC-02 sign-off check                                   |
| T-ID-08 | S3 bucket public access 誤設定 (screenshot_stack / model_artifact 等の PII 含 bucket)                         | L6                  | S3 Block Public Access account-wide enforced + bucket policy explicit deny + SCP `s3:PutBucketPolicy` の condition [CA-08 §12.1] | SCP integrity (T-ID-06 と同様) + Config rule で `s3-bucket-public-read-prohibited`                                          | Config rule + Macie public bucket scan                  |
| T-ID-09 | DMS read endpoint 経由で例外 tier DB から bulk PII 取得                                                       | L5 / TB7            | DMS Query proxy Lambda が SQL parse + customer_reference 抽出 + audit_event + break-glass のみ ad-hoc 許可 [CA-08 §8.4 F13] | Query proxy bypass scenario (Lambda code injection) → CI で query proxy lambda integrity check                              | DMS query log review + per-query customer_reference count |
| T-ID-10 | Backup / snapshot 経由の PII 流出 (DBA が manual snapshot を別 account に export)                            | L6 / H2             | Aurora snapshot KMS-encrypted、`rds:ModifyDBSnapshotAttribute` cross-account share を SCP で deny [CA-08 §12.1] | SCP integrity                                                                                                              | Config rule + CloudTrail snapshot share event           |

### 2.5 Denial of Service (T-DS)

| ID    | Threat                                                                                                       | Affected layer / TB | Existing mitigation                                                                                       | Residual risk                                                                                       | Monitoring                                              |
| ----- | ------------------------------------------------------------------------------------------------------------ | ------------------- | --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| T-DS-01 | API Gateway flooding (anonymous / authenticated)                                                              | L5 / TB2            | WAF RateBasedRule (per-IP) + Cognito-authenticated rate limit per `sub` + AWS Shield Standard [CA-08 §11.3, ADR-13] | Distributed authenticated request (compromised accounts) は Phase 2 で Shield Advanced 検討          | WAF block rate + API Gateway 4xx/5xx spike alarm        |
| T-DS-02 | Lambda concurrency quota 枯渇 (AI 入力 burst で Phase 1 reserved 200 超え)                                     | L3                  | Reserved concurrency + provisioned concurrency + Auto Scaling [CA-08 §6.2]                                | Burst が想定超で reserved 枯渇 → CloudWatch alarm + Auto Scaling target review                       | Lambda concurrent execution alarm                       |
| T-DS-03 | Bedrock TPM quota 枯渇 (Computer Use 並走 + AI 入力 burst)                                                    | L4                  | Service quota increase + Phase 1 想定 token 量 PFC-03 sandbox 実測                                         | Quota increase 申請 reject scenario (AWS 内部 capacity) → Bedrock multi-region split を Phase 2 検討 | Bedrock throttle exception alarm                        |
| T-DS-04 | RDS Proxy connection pool exhaustion                                                                          | L6                  | RDS Proxy max connections quota + connection pool tuning + Lambda Reserved concurrency で connection cap [CA-08 ADR-11] | Phase 1 sandbox で実測、PFC-06 で warm pool + connection cap calibrate                              | RDS Proxy ConnectionAttempt + DatabaseConnections alarm |
| T-DS-05 | Aurora storage IO 枯渇 (audit_event partition + pgvector index)                                              | L6                  | Aurora Serverless v2 auto-scale + monthly partition + BRIN index + pg_partman [CA-08 ADR-3, DM-07 §8.2]   | Sustained burst write で auto-scale が間に合わない scenario → CloudWatch alarm                       | Aurora ACU + StorageReadOps / WriteOps alarm            |
| T-DS-06 | Computer Use Fargate task spawn flooding (cost + capacity)                                                    | L3                  | warm pool + Auto Scaling max 15 task + Step Functions queue depth control [CA-08 §6.3.1]                  | 上限 15 task でも処理不能な burst → queue depth alarm + 業務 burst control                          | ECS RunTask rate + queue depth alarm                    |
| T-DS-07 | S3 PutObject rate limit (screenshot_stack burst)                                                              | L6                  | S3 prefix sharding (per-case ULID prefix) で auto-scale + Express bucket 不採用                          | Prefix sharding 不十分 (single tenant 大量 case) → CloudWatch S3 5xx alarm                          | S3 5xx error alarm                                      |
| T-DS-08 | EventBridge throttling (case state fan-out burst)                                                            | L5                  | EventBridge throughput limit (region default 10,000 events/sec) + DLQ                                    | Burst で event drop scenario → DLQ retry + alarm                                                    | EventBridge FailedInvocations alarm                     |

### 2.6 Elevation of Privilege (T-EP)

| ID    | Threat                                                                                                       | Affected layer / TB | Existing mitigation                                                                                       | Residual risk                                                                                                 | Monitoring                                              |
| ----- | ------------------------------------------------------------------------------------------------------------ | ------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| T-EP-01 | Cognito user が `custom:role_key_list` JWT claim 改竄 (browser dev tools で local 書き換え)                  | L1 / TB2            | JWT は server-side signed、Lambda authorizer で signature verify、改竄 token は reject                    | (該当なし、JWT signature が技術的に防御)                                                                       | -                                                       |
| T-EP-02 | Auditor role が write API endpoint を invoke (permission boundary bypass attempt)                            | L1 / TB3            | `AuditorPermissionBoundary` IAM policy + SCP `sts:AssumeRole` deny for write role [CA-08 §4.4, §12.1 F3] | Permission boundary misconfigure scenario → CI で IAM policy diff gate                                        | IAM access advisor + role assume per-action audit       |
| T-EP-03 | Computer Use Fargate task escape (container escape attack)                                                    | L3 / TB5            | Fargate (managed Firecracker microVM) + IMDSv2 enforced + per-task IAM role minimum privilege [CA-08 ADR-12] | Firecracker zero-day scenario (極めて低確率、AWS shared responsibility)                                       | GuardDuty Runtime Monitoring + AWS Inspector            |
| T-EP-04 | Lambda execution role permission escalation (`iam:PassRole` abuse)                                            | L3                  | Per-Lambda IAM role minimum privilege + `iam:PassRole` condition `aws:ResourceTag/Workload`              | Tag drift scenario → Config rule + CI で tag enforcement                                                      | CloudTrail PassRole event + IAM access advisor          |
| T-EP-05 | RDS Proxy IAM auth bypass (DB native user 経由)                                                              | L6 / TB6            | RDS Proxy IAM auth required + DB native user 無効化 [CA-08 ADR-11] + `rds_iam` role 必須                  | DB super-user (rds_superuser) は emergency 用 KMS-encrypted credential、Secrets Manager rotation [DM-07 §10.2] | KMS Decrypt event + Secrets Manager GetSecretValue 監査 |
| T-EP-06 | CDK / CodePipeline role が production resource を編集 (環境 boundary 越え)                                   | L8                  | CDK pipeline per-stage role 分離 + SCP `aws:SourceVpc` condition + 環境 tag 必須                          | Stage role misconfigure → CI で role policy diff                                                              | CodePipeline action role audit                          |
| T-EP-07 | Knowledge snippet `weight` field manipulation で staging → compiled 不正昇格                                | L6                  | DM-07 §5.4 snippet promotion trigger (procedure_proposal sign-off chain 経由必須) + RLS                   | Trigger bypass (DB super-user)                                                                                | weight transition audit                                 |

---

## 3. AI/ML 固有 threat (OWASP Top 10 for LLM + MITRE ATLAS)

### 3.1 Prompt injection (T-AI-01 ~ T-AI-04、LLM01)

| ID      | Sub-threat                                                                                             | Mitigation                                                                                                       | Residual risk                                                                                                                                            | PFC-04 検証 scenario # |
| ------- | ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| T-AI-01 | Direct prompt injection (input text に "ignore previous instructions, do X" を含む)                    | F10 4 段防御の段 1: per-workflow action allowlist [CA-08 §7.3.1]                                                  | Allowlist 外 action は block、内 action で意図不明な request は段 2 (pre-action confirmation gate) で human review                                       | scenario 3             |
| T-AI-02 | Indirect prompt injection (Computer Use が読む業務 system page に隠し instruction が埋め込まれている) | F10 段 2: pre-action confirmation gate + 段 3: tenant cross-contamination check                                  | 高度に細工された hidden instruction (white-on-white text、UTF-8 zero-width) → screenshot OCR で extract + Guardrails で抑制                              | scenario 1, 2          |
| T-AI-03 | URL-based prompt injection (page 内 URL の query string で instruction)                                | F10 段 4: screenshot redaction + Network Firewall egress allowlist (不正 URL は接続不能)                          | Allowlist 内 URL に injection が仕込まれる scenario → URL query string sanitize + Guardrails                                                              | scenario 1             |
| T-AI-04 | Multi-step prompt injection (1 step では benign、step 累積で escalation)                               | F10 段 2 per-step confirmation + audit_event chain で step 間整合性 audit                                         | 高度な多段 manipulate → human review (Inbox の入力者確認 step) で最終 stop                                                                              | scenario 4             |

### 3.2 Sensitive Information Disclosure (T-AI-05、LLM02)

| ID      | Threat                                                                                                | Mitigation                                                                                                       | Residual risk                                                                                       | Monitoring                                              |
| ------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| T-AI-05 | LLM が training data の PII / secret を memorize して response に leak                                  | Bedrock managed model (Anthropic Claude) は anthropic 側 training data control、prompt injection mitigation で副次防御 | Anthropic-side training data leak は AWS layer では detect 不能、Bedrock managed responsibility | Bedrock Guardrails PII detection on output              |

### 3.3 Supply Chain (T-AI-06、LLM03)

| ID      | Threat                                                                                                | Mitigation                                                                                                       | Residual risk                                                                                       | PFC linkage             |
| ------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ----------------------- |
| T-AI-06 | Bedrock model update (Claude version bump) で behavior regression / safety regression                  | Model version pin + canary 5% → promote → rollback SOP [CA-08 §7.6 F11] + Type B 設定承認 per cutover            | Anthropic-side silent model behavior change (version pin でも patch-level 差異)                     | PFC-03 (model version pin) |

### 3.4 Data and Model Poisoning (T-AI-07、LLM04)

| ID      | Threat                                                                                                | Mitigation                                                                                                       | Residual risk                                                              |
| ------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| T-AI-07 | RAG vector store (pgvector) に malicious snippet injection で AI 出力 manipulation                    | DM-07 §5.4 citation weight=high enforcement + procedure_proposal sign-off chain で snippet 昇格 control          | staging snippet injection は staging usage rule (citation 不可) で部分 mitigation、compiled 昇格は 4-eyes 必須 |

### 3.5 Improper Output Handling (T-AI-08、LLM05)

| ID      | Threat                                                                                                | Mitigation                                                                                                       | Residual risk                                                              |
| ------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| T-AI-08 | LLM output を downstream system に直接 inject (SSRF / SQL injection / RCE)                              | Application-side output validation + Computer Use action allowlist + DB write は parameterized only              | Computer Use が新規 UI element に対し未知の action を生成する scenario → allowlist で deny |

### 3.6 Excessive Agency (T-AI-09、LLM06)

| ID      | Threat                                                                                                | Mitigation                                                                                                       | Residual risk                                                              |
| ------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| T-AI-09 | Trust Level 進化 (Supervised → Checkpoint → Autonomous) で AI agency が広がり過ぎ                      | DM-07 §3.2 `agent_permission_grant_version` + Trust Level Type C SoD + Phase 1 Supervised only                  | Phase 2+ で Autonomous 拡張時の risk assessment 別 doc 必須                |

### 3.7 System Prompt Leakage (T-AI-10、LLM07)

| ID      | Threat                                                                                                | Mitigation                                                                                                       | Residual risk                                                              |
| ------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| T-AI-10 | System prompt が response に leak、attacker が prompt structure を inferring して injection を強化      | System prompt から PII / secret 除外 (生 secret は system prompt に書かない、Secrets Manager 参照のみ)            | Prompt design pattern (system prompt 内 example) の leak で attacker advantage 増加 → prompt versioning + audit |

---

## 4. Insider threat (T-IN)

| ID    | Threat                                                                                                       | Mitigation                                                                                                       | Residual risk                                                                                                              |
| ----- | ------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| T-IN-01 | SREAdmin が production data を console から閲覧 (PII exfiltration)                                            | SCP で SREAdmin の data plane access deny (Aurora console SELECT 不可)、break-glass のみ Type B 経由              | Break-glass abuse → break-glass の Type B 監査 + per-access audit                                                          |
| T-IN-02 | Security 関係者 が KMS key delete / disable (audit / data 全体不可)                                          | KMS key deletion 7-30 day window + SCP `kms:ScheduleKeyDeletion` Type B 必須 + multi-region key replication      | 共謀 scenario (Type B 承認者 2 名共謀) は SoD で部分 mitigation、外部監査 + 経営層 review で detect                          |
| T-IN-03 | AI 管理者 が agent_version で malicious system prompt を slip-in (Type B 設定承認 evade)                     | DM-07 §3.2 `agent_prompt_config_version` per-field diff + Type B SoD trigger (approver ≠ proposer)              | Approver 1 名 + proposer 1 名共謀 → external audit + 4-eyes SoD で部分 mitigation                                          |

---

## 5. Supply chain threat (T-SC)

| ID    | Threat                                                                                                       | Mitigation                                                                                                       | Residual risk                                                                                                              |
| ----- | ------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| T-SC-01 | npm / pip package malicious dependency (typosquat / hijacked package)                                         | CI で `npm audit` + `pip-audit` + Snyk + Dependabot + SBOM (CycloneDX) 生成 + cosign sign                        | Zero-day in trusted package → SBOM diff alarm + dep mirror (Phase 2)                                                       |
| T-SC-02 | Container base image compromise (Docker Hub / public ECR)                                                    | AWS ECR private registry + cosign / Notary v2 signing + Amazon Inspector container scan + AWS Signer            | Base image upstream compromise → image diff alarm + private base image (Phase 2)                                            |
| T-SC-03 | GitHub Actions runner compromise (CI/CD pipeline injection)                                                  | OIDC + branch protection + per-workflow least privilege + GITHUB_TOKEN permission scope                          | GitHub-side compromise → AWS-side cross-account audit + CodePipeline KMS                                                   |
| T-SC-04 | AWS service-side supply chain (AWS managed service silent change)                                            | AWS Shared Responsibility (service-side は AWS 領域)、Bedrock model version pin + Type B per-cutover            | AWS-side silent change は customer-side detect 不能 (AWS post-event communicate に依存)                                    |

---

## 6. Key compromise scenario (T-KC)

| ID    | Threat                                                                                                       | Mitigation                                                                                                       | Recovery                                                                                                                   |
| ----- | ------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| T-KC-01 | KMS CMK の grant 漏洩 (cross-account misconfig)                                                              | 5 CMK 分離 (用途別、共有禁止) [CA-08 ADR-10] + per-CMK policy CI gate + Config rule                              | Grant revoke + key rotation + audit chain re-verify + 漏洩期間中の data inventory                                          |
| T-KC-02 | Customer-managed key 認証情報の漏洩 (BYOK 想定外、Phase 1 default は AWS KMS managed)                         | Phase 1 BYOK 不採用、Phase 2 XKS 検討時に dedicated SOP                                                          | (Phase 2)                                                                                                                  |
| T-KC-03 | Cognito User Pool secret 漏洩 (app client secret)                                                            | App client secret rotation + SCP `cognito-idp:DescribeUserPoolClient` 制限                                       | Secret rotation + ID token / refresh token revoke for affected app                                                         |

---

## 7. Abuse case catalog (T-AB-01 ~ T-AB-12、business-level)

| ID    | Abuse scenario                                                                                                                                  | Mitigation pointer                                                                                                                                                                |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| T-AB-01 | 入力者が同案件で AI 提案を意図的に reject、staging に misleading hint を蓄積 (= AI 学習 poisoning)                                              | DM-07 §5.4 staging citation 不可 + procedure_proposal sign-off chain で 4-eyes + per-actor reject rate KRI alarm                                                                  |
| T-AB-02 | 承認者が 4-eyes SoD bypass (入力者 = 承認者 self-approval)                                                                                       | DM-07 §5.1 4-eyes trigger (actor / tenant / case_id / decision_kind / 時系列 5 軸整合)                                                                                            |
| T-AB-03 | AI 管理者が Type B 設定承認を回避 (agent_version を staging-like backdoor で publish)                                                            | DM-07 §5.8 Type B SoD trigger + audit_event Type B path + external audit per-quarter                                                                                              |
| T-AB-04 | 業務責任者が国際送金 boundary を「通常」case として処理 (boundary classification bypass)                                                          | DM-07 §3.4 + workflows/international-transfer-boundary/_meta.yaml `automation_status='restricted'` + restricted_conditions threshold trigger                                       |
| T-AB-05 | 承認者が Bedrock Computer Use 結果を rubber-stamp (review 実態なし)                                                                              | DM-07 §3.4 `human_decision.review_duration_sec` field (Phase 1 候補) + per-actor < threshold 件数 KRI alarm                                                                       |
| T-AB-06 | Auditor role が他 tenant data を read (read-only でも policy bypass)                                                                            | RLS + `AuditorPermissionBoundary` + audit_event 自己 audit (Auditor self-action は別 path)                                                                                        |
| T-AB-07 | 外部 attacker が 大量 sign-in 試行で Cognito user pool brute force                                                                              | WAF RateBasedRule + Cognito advanced security features (compromised credential detection) + GuardDuty UserPwdSpray                                                                |
| T-AB-08 | Phishing で end user credential 盗難 → 承認 endpoint 不正使用                                                                                  | WebAuthn 必須 (T-SP-03) + step-up MFA + Entra Conditional Access device compliance                                                                                                |
| T-AB-09 | 開発者が production sandbox に test data として顧客 PII を流す                                                                                  | Sandbox 環境 tag + Macie scan + SCP `s3:PutObject` condition `aws:ResourceTag/Environment=production`                                                                            |
| T-AB-10 | Computer Use Fargate で他 case の screenshot が残る (cross-case data leak)                                                                      | Fargate task ephemeral per-case (T-EP-03 と PFC-04) + screenshot_stack tenant_id RLS                                                                                              |
| T-AB-11 | 承認 chain 内で意図的に手順を変更し knowledge poisoning                                                                                          | DM-07 §3.5 procedure_proposal version history + diff review + per-actor reject rate KRI                                                                                           |
| T-AB-12 | DR 発動を理由に in-flight case を意図的に skip / drop                                                                                            | CA-08 §15.3 in-flight case の `dr_paused` state + 復旧後 audit (DR drill quarterly verify) + employee_ref-based SoD continuity                                                    |

---

## 8. Monitoring + Detection controls (across all threats)

各 threat の Monitoring 列を集約、共通 detection layer:

| Detection layer                           | Coverage                                                                                                  |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| **GuardDuty**                             | UserPwdSpray / UnauthorizedAccess / Runtime Monitoring (T-EP-03) / Bedrock Anomaly (Phase 2)               |
| **Security Hub**                          | AWS Foundational Security Best Practices + CIS AWS Foundations + PCI DSS                                  |
| **Macie**                                 | S3 PII scan (T-ID-02, T-ID-03, T-ID-08, T-AB-09)                                                          |
| **AWS Config**                            | drift detection (T-TM-07, T-ID-06, T-ID-08, T-ID-10), SCP integrity (T-ID-06)                            |
| **CloudTrail org-wide**                   | All control plane event (T-SP-01 ~ T-SP-06, T-EP-04 ~ T-EP-06)                                            |
| **VPC Flow Logs + DNS query logs**        | Network Firewall block (T-SP-05, T-ID-09), exfil attempt                                                  |
| **Bedrock invocation log cross-account**  | Per-tenant volume anomaly (T-SP-07), prompt+response retention (T-ID-01, T-AI-05)                          |
| **Audit chain head verify (daily)**       | Hash chain divergence (T-TM-01 ~ T-TM-03, T-TM-08)                                                        |
| **Bedrock Guardrails**                    | PII detection on input/output (T-AI-05, T-ID-01), prompt injection block (T-AI-01 ~ T-AI-04)              |
| **Custom CloudWatch dashboard**           | per-actor reject rate (T-AB-01, T-AB-11), review duration (T-AB-05), step-up failure (T-SP-03)            |
| **Cost Anomaly Detection**                | Bedrock TPM spike (T-DS-03), Computer Use Fargate spawn flood (T-DS-06)                                   |
| **External audit (quarterly)**            | Insider共謀 detection (T-IN-02, T-IN-03), SoD 観点 review                                                  |

---

## 9. Residual risk register (mitigation 適用後、Phase 1 に残る risk)

| ID     | Risk description                                                                                                       | Acceptable? | Mitigation roadmap (Phase 2+)                                                                          |
| ------ | ---------------------------------------------------------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------ |
| RR-01  | DB super-user (rds_superuser) は trigger bypass 可、tamper は post-hoc 検出のみ (T-TM-01 ~ T-TM-03)                       | ✅ (with monitoring) | Phase 2 で HSM-backed CMK + dedicated DB administrator role limited window + privileged session monitoring (PSM) |
| RR-02  | KMS administrative compromise scenario (T-TM-08)                                                                       | ✅ (low likelihood) | Phase 2 で AWS CloudHSM + dual control + custom key store                                              |
| RR-03  | Firecracker zero-day (T-EP-03)                                                                                         | ✅ (AWS shared responsibility) | Bedrock model serving 側に持っていけば customer-side 責務減 (Phase 2 評価)                       |
| RR-04  | IdP-side compromise (T-SP-02)                                                                                          | ✅ (Entra layer monitoring) | Entra Sentinel integration + Microsoft Defender for Identity                                          |
| RR-05  | Distributed authenticated DDoS (T-DS-01)                                                                                | ⚠ (Phase 1 で受容) | Phase 2 で Shield Advanced + CloudFront geo restriction expand                                       |
| RR-06  | Insider 共謀 scenario (T-IN-02, T-IN-03)                                                                                | ⚠ (external audit で部分) | Phase 2 で privileged session recording + behavior analytics (UEBA)                                  |
| RR-07  | Anthropic-side training data leak (T-AI-05)                                                                            | ⚠ (Bedrock managed)  | Anthropic との contractual reps + Bedrock data privacy policy compliance verify                       |
| RR-08  | AWS-side silent service change (T-SC-04)                                                                               | ⚠ (AWS shared)        | AWS Health Dashboard subscribe + post-event communicate dependency                                    |
| RR-09  | OpenSearch cross-tenant query (T-ID-05、Phase 2 multi-tenant 想定)                                                       | (Phase 1 N/A)        | Phase 2 で per-tenant collection / index 評価                                                          |
| RR-10  | High-grade prompt injection (T-AI-01 ~ T-AI-04 で 4 段 bypass scenario)                                                  | ⚠ (PFC-04 で実証必須) | PFC-04 で 5 scenario attack 全 block 実証、検出時は scenario 追加 + 段 5 防御追加                       |
| RR-11  | Sandbox 環境への production PII 流入 (T-AB-09)                                                                           | ✅ (Macie + SCP)      | Phase 2 で per-environment tag enforcement + sandbox 自動 wipe                                        |
| RR-12  | DR 発動時の SWIFT 締切跨ぎ (T-AB-12 + DOC-CA-08 §15.1 F21)                                                              | ⚠ (manual SOP)        | Phase 2 で active-active (Aurora DSQL 評価) で eliminated 可                                          |

**Risk acceptance**: 全 ⚠ risk は Phase 1 着手時に経営層 + Risk Committee の formal acceptance を取る (Type B 設定承認 session の agenda 5 に含む)、本 doc §9 + DOC-CA-08 §18 R12-R14 を input として提示。

---

## 10. FRB SR 11-7 model risk governance との接続

FRB SR 11-7 は Bedrock Claude + Computer Use を "model" として 4 要件 (inventory / validation / monitoring / governance committee) を要求。本 doc は以下の subset を提供:

| SR 11-7 要件          | 本 doc セクション                                                                                          | 追加必要 (DOC-CEM-12 で詳細化)                                                |
| --------------------- | ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Model inventory       | §3 AI/ML 固有 threat catalog + DM-07 §3.2 `agent_*_version`                                                | Model card per `agent_version`、Anthropic model attestation                   |
| Validation framework  | §3.1 T-AI-01 ~ T-AI-04 + PFC-04 attack scenario 5 件                                                       | Pre-deployment validation runbook、threshold acceptance criteria              |
| Ongoing monitoring    | §8 Monitoring + Detection controls + DM-07 §3.6 K3 precision/FP                                            | Drift detection + per-agent_version performance regression alarm              |
| Governance committee  | Type B 設定承認 + Model Risk Management committee (Phase 1 sprint 0 で establish)                          | Charter document + quarterly review schedule + escalation path                |

---

## 11. 後続 PR / TODO

1. ✅ **完了 (本 doc 起稿、autonomous prod-ready loop Cycle 2)** — DOC-TM-10 v0.1 起稿、STRIDE × 12 layer + AI/ML 7 threat + insider/supply chain/key compromise + abuse case 12 件 catalog 化
2. **DOC-CA-08 §7.3.1 から本 doc §3.1 への pointer 追加** (Cycle 9 integration sweep)
3. **DOC-PFC-09 PFC-04 攻撃 scenario 5 件を本 doc §3.1 と sync** (Cycle 9)
4. **DOC-ROOT-_SSOT row 追加** — DOC-TM-10 row (Cycle 9)
5. **DOC-CEM-12 起稿** (Cycle 4) で SR 11-7 model risk governance の詳細化 + 本 doc §10 expand
6. **DOC-SRE-11 起稿** (Cycle 3) で §8 Monitoring controls の alert + on-call response runbook 化
7. **Phase 1 sprint 0 で Model Risk Management committee charter 起稿** (§10)
8. **Quarterly threat model refresh** (Phase 1 ops 開始後、新 threat intelligence + incident learning 反映)
