# Backoffice AI v2 — Compliance Evidence Matrix (v0.1 Draft)

> **目的**: US 規制 framework (Federal + State) 各 control に対し、AWS service mapping + DOC-CA-08 / DOC-DM-07 / DOC-TM-10 / DOC-SRE-11 / DOC-PFC-09 内の evidence pointer + counsel comment slot を提供する control matrix。Phase 1 Type B 設定承認の PFC-02 (external counsel review) input doc として運用。
> **位置付け**: 規制 control 単位の forensic-grade trace doc。Compliance officer + external legal counsel + 外部監査が "AWS Bedrock + Computer Use sandbox + Aurora Global DB がどの control を どう充足するか" を逐条 verify するための reference matrix。

| 項目            | 値                                                                                                                                                                                |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 文書 ID         | DOC-CEM-12                                                                                                                                                                        |
| 文書名          | Compliance Evidence Matrix (US 規制 control × AWS service × design evidence pointer × counsel comment)                                                                            |
| 版数            | v0.2 (autonomous prod-ready loop Cycle 9: §2 NYDFS Part 500.15 row に Bedrock Geo CRIS data residency interpretation + DM-07 §5.10 column-level encryption defense in depth + counsel legal opinion prerequisite を追加、CA-08 v2.5 P0-V correction downstream sync) |
| ステータス      | Draft (autonomous prod-ready loop Cycle 4 起稿)                                                                                                                                   |
| オーナー        | Compliance officer (primary) + Security 関係者 + AI 管理者 (Model Risk Management co-owner)                                                                                       |
| 承認者          | 設定承認 Type B (regulatory compliance 評価を含むため) + external legal counsel co-sign (PFC-02 acceptance condition #1)                                                          |
| 閲覧対象        | Compliance officer / Security 関係者 / AI 管理者 / Model Risk Management / 外部監査 / external legal counsel / BSA Officer / OFAC Compliance / 経営層 (Type B 承認時)              |
| 機密区分        | Confidential (規制適用 framing を含むため、counsel review 経由でない external 配布禁止)                                                                                          |
| 関連文書        | **DOC-CA-08 v2.6** (control mapping target), **DOC-DM-07 v1.7.2** (control mapping target), **DOC-TM-10 v0.1** (threat × control linkage), **DOC-SRE-11 v0.1** (incident notification SLA), **DOC-PFC-09 v0.2 PFC-02** (本 doc が input doc) |
| SSOT 区分       | US 規制 control × AWS service mapping + design evidence pointer の SSOT (counsel review input)                                                                                    |
| Evidence Status | 設計 + 公開規制 source (NYDFS Part 500 / FRB SR 11-7 / OCC SR 11-7 / FFIEC IT / BSA-AML / OFAC / GLBA + Reg P / SOX / State law)。最終 verify は external counsel sign-off で確定 |
| 改版履歴        | v0.1 (2026-05-25、autonomous prod-ready loop Cycle 4): 初版作成、NYDFS 23 NYCRR Part 500 全 23 section + FRB SR 11-7 4 要件 + OCC 2023-17 + FFIEC AIO + BSA-AML core sections + OFAC + GLBA Reg P + Safeguards Rule + SOX + State law 7 jurisdiction を control 単位 matrix 化 |

---

## 0. 本 doc の読み方 (3 分要約)

- **対象**: Phase 1 (UC-BO-01 法人住所変更、AWS us-east-1 + us-west-2、JP 銀行 America division) の US 規制 framework 全 control
- **scope**: §2 NYDFS Part 500 / §3 FRB SR 11-7 / §4 OCC SR 11-7 + 2023-17 / §5 FFIEC IT + AIO / §6 BSA-AML + USA PATRIOT 326 CIP / §7 OFAC / §8 GLBA + Reg P + Safeguards / §9 SOX / §10 State law (NY SHIELD / CCPA-CPRA / VA / CO / CT / UT / IL BIPA / WA)
- **out of scope**: (a) 業界自主規制 (FFIEC CAT 等の self-assessment は別 doc)、(b) PCI DSS (Phase 1 は cardholder data 扱わない)、(c) HIPAA (medical data 扱わない)、(d) JP 規制 (FISC 安全対策基準 / 個情法 等は v1.4 US pivot で scope 外、DOC-CA-09 JP parent layer candidate で扱う)
- **Control row format**: `<Section>` × `<Control name>` × `<AWS service mapping>` × `<DOC pointer>` × `<Evidence type>` × `<Verification method>` × `<Counsel comment slot>` × `<Status>`
- **Status enum**: `⏸ Draft mapping` / `🔍 Counsel review` / `⚠ Gap identified` / `✅ Counsel signed-off`
- **本 doc の更新責務**: Compliance officer が counsel review session で finding を取得 → 対応 row の `Counsel comment slot` を update + Status 切替、最終的に全 row が `✅ Counsel signed-off` で PFC-02 acceptance condition #1 (DOC-PFC-09 §2 PFC-02) 充足

---

## 1. Framework 適用範囲 + 階層

```
Federal (across-state) ─┬─ FRB SR 11-7 (Model Risk Management) ……………… Bedrock Claude + Computer Use を "model" として 4 要件
                        ├─ OCC SR 11-7 + 2023-17 (Third-Party RM) ……… AWS Bedrock + Anthropic Computer Use API を third-party AI service として risk assessment
                        ├─ FFIEC IT Examination Handbook + AIO ………… Automated Activity / AI/ML 監督
                        ├─ BSA-AML (FinCEN 31 CFR 1010) ……………………… 国際送金 boundary 適用 (UC-BO-IT-BOUNDARY)
                        ├─ USA PATRIOT 326 CIP ………………………………… 顧客 identification + KYC (Phase 1 = address 変更、CIP refresh trigger)
                        ├─ OFAC (50 CFR Part 501) ………………………………… SDN list screening (国際送金 boundary)
                        ├─ GLBA + Reg P (CFR 1016) + Safeguards (16 CFR 314) … PII handling, Privacy notice, Information security program
                        └─ SOX (Section 404) ……………………………………… IT general control + audit immutability (financial reporting impact)

State ────────────────┬─ NYDFS 23 NYCRR Part 500 ………………………………… NY 拠点で primary regulator、cybersecurity の most stringent
                      ├─ NY SHIELD Act ……………………………………………… data breach notification (NY resident)
                      ├─ CCPA / CPRA (California) ……………………………… consumer privacy + opt-out
                      ├─ VA-CDPA / CO Privacy / CT DPA / UT CPA ……… same-day state privacy law family
                      ├─ IL BIPA ……………………………………………………… biometric (FIDO2/WebAuthn が触れる可能性)
                      └─ WA My Health My Data Act …………………………… medical-adjacent (Phase 1 適用外想定、PFC-02 で counsel confirm)
```

各 framework の **応用条件** + 本 doc § と DOC-CA-08 / DM-07 evidence pointer は §2 以降の matrix で逐条 mapping。

---

## 2. NYDFS 23 NYCRR Part 500 (Cybersecurity Regulation)

NY State Department of Financial Services は covered entity (state-chartered banks / branches of foreign banks / etc.) に対し本 Part を強制。JP 銀行 America division (NY 拠点想定) は covered entity。Phase 1 で primary regulator。

| § (control)              | Control name                                                                                          | AWS service mapping                                                                                                            | Design evidence pointer                                                                                                                                                                                                                  | Evidence type                                | Verification method                                       | Counsel comment slot | Status        |
| ------------------------ | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | --------------------------------------------------------- | -------------------- | ------------- |
| **500.02**               | Cybersecurity program (risk-based、written program)                                                   | (organizational、本 doc + DOC-CA-08 + DOC-TM-10 + DOC-SRE-11 全体)                                                              | DOC-CA-08 v2.6 全体 / DOC-TM-10 全体 / DOC-SRE-11 全体                                                                                                                                                                                  | Document set                                 | Compliance officer review + counsel sign-off              | (TBD)                | ⏸ Draft       |
| **500.03**               | Cybersecurity policy (board-approved)                                                                 | (organizational)                                                                                                               | (Phase 1 sprint 0 で board-approved policy doc 起稿、本 doc 範囲外)                                                                                                                                                                       | Board minutes + policy doc                   | Board attestation                                          | (TBD)                | ⏸ Pending     |
| **500.04**               | Chief Information Security Officer (CISO) 指名                                                        | (organizational)                                                                                                               | (Phase 1 sprint 0 で CISO 指名、本 doc 範囲外)                                                                                                                                                                                            | Appointment letter                           | Internal HR record                                         | (TBD)                | ⏸ Pending     |
| **500.05**               | Penetration testing + vulnerability assessment                                                        | AWS Inspector + Security Hub + GuardDuty + 外部 pentest (Phase 1 着手 -7 day)                                                  | DOC-TM-10 §8 Monitoring controls / DOC-SRE-11 RB-07                                                                                                                                                                                       | Service config + pentest report              | Annual pentest + AWS Inspector report quarterly           | (TBD)                | ⏸ Draft       |
| **500.06**               | Audit trail (5-year retention)                                                                        | DM-07 §9 audit_event + S3 Object Lock Compliance + Kinesis Firehose streaming export (≤ 5 min)                                | DOC-DM-07 §9.1 (4 ring 防御) / §9.4 retention class `audit_immutable=7yr` (SOX baseline、NYDFS 500.06 5yr 上回る)                                                                                                                          | Schema + retention class lifecycle config    | Audit chain verify (daily) + S3 Object Lock manifest      | (TBD)                | ⏸ Draft       |
| **500.07**               | Access privilege (least privilege + role-based)                                                       | IAM Identity Center + Cognito + IAM permission boundary + SCP                                                                  | DOC-CA-08 §4 (Identity layer 2 系統) / §4.4 Auditor permission boundary / §12.1 SCP                                                                                                                                                       | IAM policy + SCP                             | Access advisor + IAM Access Analyzer quarterly review     | (TBD)                | ⏸ Draft       |
| **500.08**               | Application security (secure SDLC)                                                                    | CDK + GitHub Actions OIDC + ECR scanning + Squawk linter + Liquibase forward-only + Bedrock Guardrails                         | DOC-CA-08 §9 (CI/CD) / DOC-TM-10 §5 (Supply chain T-SC-01 ~ T-SC-04)                                                                                                                                                                      | Pipeline config + scan reports               | CI gate + Snyk + Dependabot                                | (TBD)                | ⏸ Draft       |
| **500.09**               | Risk assessment (periodic)                                                                            | (organizational)                                                                                                               | DOC-TM-10 全体 + quarterly threat model refresh (§11 TODO #8)                                                                                                                                                                             | Risk register                                 | Quarterly review                                          | (TBD)                | ⏸ Draft       |
| **500.10**               | Cybersecurity personnel + intelligence                                                                | (organizational)                                                                                                               | Phase 1 sprint 0 で SRE Lead + AI/ML SRE + on-call rotation 確立 (DOC-SRE-11 §1)                                                                                                                                                          | Org chart + training record                   | Internal HR + training completion                          | (TBD)                | ⏸ Pending     |
| **500.11**               | Third-party service provider (AWS / Anthropic)                                                        | AWS Service Provider Information + Anthropic enterprise terms + DPA                                                            | DOC-TM-10 §5 T-SC-01 ~ T-SC-04 + counsel-reviewed AWS + Anthropic contractual terms                                                                                                                                                       | Contractual terms + SOC 2 report             | AWS SOC 2 + Anthropic SOC 2 (if available) annual review  | (TBD)                | ⏸ Draft       |
| **500.12**               | Multi-Factor Authentication                                                                           | Entra ID Conditional Access + Cognito federation + FIDO2/WebAuthn for high-priv role                                          | DOC-CA-08 §4.2 (Cognito MFA 担当層分離 F1) / DOC-TM-10 T-SP-03                                                                                                                                                                            | Cognito + Entra ID config                    | Sandbox MFA bypass attempt (PFC verification)             | (TBD)                | ⏸ Draft       |
| **500.13**               | Limitation on data retention (only as long as necessary)                                              | DM-07 §9.4 retention class 6 段                                                                                                | DOC-DM-07 §9.4 (audit_immutable=7yr / customer_pii=5yr / kyc_document=5yr / knowledge_compiled=indef / kpi_aggregate=3yr / case_evidence=5yr)                                                                                              | Retention class lifecycle config             | S3 + Aurora purge job audit                                | (TBD)                | ⏸ Draft       |
| **500.14**               | Training + monitoring (cybersecurity awareness)                                                       | (organizational)                                                                                                               | Phase 1 sprint 0 で全 user 対象 cybersec training (annual)                                                                                                                                                                                | Training record                              | Annual completion                                          | (TBD)                | ⏸ Pending     |
| **500.15**               | Encryption (in transit + at rest) + **data residency interpretation** (v0.2 P0-V 追加)                | KMS + Aurora encryption at rest + S3 SSE-KMS + TLS 1.2+ + KMS multi-Region key + **DM-07 §5.10 column-level KMS DataKey-per-tenant envelope encryption (PII tier 3 defense in depth)** + **CA-08 v2.6 §7.5 SCP enforced Bedrock Geo CRIS (`us.anthropic.*`) within US geography routing + §14.6.7 cross-region transfer cost analytics** | DOC-CA-08 v2.6 §5.5 KMS multi-Region key / §7.1 Bedrock Geo CRIS data residency posture / §7.5 SCP allow Geo CRIS + Deny global/eu/jp/au / §12.4 cross-account encryption / §14.6.7 Geo CRIS cost / DM-07 §5.10 column-level encryption / §10.2 KMS / Secret rotation | KMS config + encryption settings + Bedrock SCP + Geo CRIS data residency legal opinion | AWS Config rule + Bedrock SCP integrity test + **counsel legal opinion: US geography Geo CRIS = NYDFS 500.15(a)(2) "encryption at rest" 充足 + alternative compensating controls (500.15(a)(2)(B)) で column-level encryption が over-meet** | (TBD - **PFC-02 acceptance #2 強化、open question #30 と sync**) | ⏸ Draft (P0-V revised)       |
| **500.16**               | Incident response plan                                                                                | (organizational)                                                                                                               | DOC-SRE-11 §6 Incident response 5 phase + §4 Severity matrix + §7 Postmortem template                                                                                                                                                     | Incident response doc                        | Tabletop exercise quarterly                                | (TBD)                | ⏸ Draft       |
| **500.17**               | Notice (cybersecurity event 72-hr to NYDFS)                                                            | (organizational)                                                                                                               | DOC-SRE-11 §7 Postmortem template に NYDFS 500.17 row + DOC-TM-10 §9 RR-acceptance gate                                                                                                                                                   | Notification SOP + template                  | Internal tabletop                                          | (TBD)                | ⏸ Draft       |
| **500.18**               | Confidentiality (program / record)                                                                    | (organizational + S3 + KMS encrypts本)                                                                                          | DOC-CA-08 §12 Security baseline 全体                                                                                                                                                                                                       | Access policy + encrypts                     | Internal audit                                             | (TBD)                | ⏸ Draft       |
| **500.19**               | Exemption (該当しない、Phase 1 covered entity)                                                       | -                                                                                                                              | -                                                                                                                                                                                                                                         | -                                            | -                                                          | -                    | N/A           |
| **500.20**               | Enforcement (NYDFS 側)                                                                               | -                                                                                                                              | -                                                                                                                                                                                                                                         | -                                            | -                                                          | -                    | N/A           |
| **500.21**               | Effective date / transition                                                                          | -                                                                                                                              | -                                                                                                                                                                                                                                         | -                                            | -                                                          | -                    | N/A           |
| **500.22**               | Certification (annual)                                                                                | (organizational)                                                                                                               | Phase 1 ops 開始後 annual certification、CISO sign-off + board attestation                                                                                                                                                                | Annual certification letter                   | Annual                                                     | (TBD)                | ⏸ Pending     |
| **500.23**               | Severability                                                                                          | -                                                                                                                              | -                                                                                                                                                                                                                                         | -                                            | -                                                          | -                    | N/A           |

**NYDFS Part 500 PFC-02 acceptance condition #2 (DOC-PFC-09 PFC-02)**: §500.02 / 500.06 / 500.12 / 500.15 / 500.17 / 500.22 の 6 条全て counsel sign-off → 上記 6 row 全て `✅ Counsel signed-off` 状態が gate。

---

## 3. FRB SR 11-7 (Model Risk Management)

FRB SR 11-7 は AI/ML を含む "model" に対し 4 要件 (Inventory / Validation / Ongoing Monitoring / Governance) を要求。Bedrock Claude + Computer Use を model として直接適用。

| Requirement              | Sub-requirement                                                                                                                              | Design evidence pointer                                                                                                                                                                                                                       | Evidence type                                | Verification method                                       | Counsel comment slot | Status   |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | --------------------------------------------------------- | -------------------- | -------- |
| **Model inventory**      | All models in inventory with: ID / Type / Owner / Purpose / Inputs / Outputs / Limitations / Dependencies / Vintage                          | DM-07 §3.2 `agent_version` + `agent_prompt_config_version` + `agent_tool_binding_version` + `agent_model_config_version` + `agent_permission_grant_version` / DOC-TM-10 §3 AI/ML 固有 threat catalog                                              | Schema + Model card per agent_version         | Model risk management committee quarterly review          | (TBD)                | ⏸ Draft  |
| **Validation framework** | Pre-deployment validation: Conceptual soundness + Process verification + Outcome analysis                                                    | DOC-TM-10 §3.1 prompt injection mitigation + PFC-04 attack scenario 5 件 (DOC-PFC-09 PFC-04) / DM-07 §5.4 citation weight=high enforcement (data quality) / DOC-SRE-11 SLO-04 1st-pass acceptance rate                                          | Validation report per agent_version + PFC-04 evidence | Pre-deployment + Type B 設定承認                          | (TBD)                | ⏸ Draft  |
| **Ongoing monitoring**   | Continuous monitoring of: Performance / Inputs distribution / Outputs distribution / Drift detection                                          | DOC-SRE-11 §2.1 SLO-04 (AI proposal quality) + §10 quarterly recalibrate / DM-07 §3.6 K3 precision/FP metric / DOC-TM-10 §8 Bedrock invocation log analysis                                                                                    | Monitoring dashboard + drift alarm           | CloudWatch dashboard + monthly review                     | (TBD)                | ⏸ Draft  |
| **Governance committee** | Model Risk Management Committee + Charter + Escalation + Independence (from model development)                                              | Phase 1 sprint 0 で establish (DOC-TM-10 §10 + DOC-SRE-11 §1 AI/ML SRE 新 role)                                                                                                                                                                | Committee charter + meeting minutes          | Quarterly meeting + annual review                          | (TBD)                | ⏸ Pending |

**FRB SR 11-7 PFC-02 acceptance condition #3 (DOC-PFC-09 PFC-02)**: 4 要件全て counsel sign-off → 上記 4 row 全て `✅ Counsel signed-off`。

---

## 4. OCC SR 11-7 + 2023-17 (Third-Party Risk Management)

OCC は 2023-17 (interagency final guidance、FRB + FDIC + OCC 共同) で third-party risk management の lifecycle 6 段 (Planning / Due Diligence and Third-Party Selection / Contract Negotiation / Ongoing Monitoring / Termination / Documentation) を要求。AWS Bedrock + Anthropic Computer Use API を third-party AI service として直接適用。

| Lifecycle stage          | Activity                                                                                                                                     | Design evidence pointer                                                                                                                                                                                                                       | Evidence type                                | Verification method                                       | Counsel comment slot | Status        |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | --------------------------------------------------------- | -------------------- | ------------- |
| Planning                 | Risk-based strategy for third-party use                                                                                                      | DOC-CA-08 §13 ADR-4 (Bedrock 採用判断) + ADR-7 (CDK 採用判断) + DOC-TM-10 §5 supply chain T-SC-01 ~ T-SC-04                                                                                                                                     | ADR docs                                     | Type B 設定承認 (initial adoption)                        | (TBD)                | ⏸ Draft       |
| Due diligence            | Vendor evaluation: Financial / Operational / Compliance / Information security / Resilience                                                  | AWS SOC 2 Type II + Anthropic SOC 2 (if available) + Anthropic enterprise terms / DPA review                                                                                                                                                  | Vendor diligence report                       | Pre-engagement + annual refresh                            | (TBD)                | ⏸ Pending     |
| Contract negotiation     | Right to audit / Data ownership / Breach notification / Termination / SLA / Subcontractor restrictions                                       | AWS Customer Agreement + AWS Data Processing Addendum + Anthropic enterprise terms (counsel-reviewed)                                                                                                                                         | Executed contracts                            | Counsel review pre-execution                              | (TBD)                | ⏸ Pending     |
| Ongoing monitoring       | Performance / Compliance / Risk profile changes / Financial condition                                                                        | DOC-SRE-11 §2.1 SLO-01 ~ SLO-04 (per-vendor SLA tracking) + AWS Health Dashboard subscription + Anthropic status page subscription                                                                                                            | Monitoring dashboard                          | Monthly review + quarterly vendor risk review              | (TBD)                | ⏸ Draft       |
| Termination              | Exit strategy / Data return + destruction / Transition plan                                                                                  | DOC-CA-08 §15 DR (multi-region) + Aurora point-in-time recovery 7yr retention + Anthropic data retention terms (counsel-reviewed)                                                                                                              | Exit strategy doc                             | Phase 1 sprint 0 で起稿                                   | (TBD)                | ⏸ Pending     |
| Documentation            | Complete documentation throughout lifecycle                                                                                                  | Full DOC-* doc set + vendor risk file (Compliance officer maintained)                                                                                                                                                                         | Document set                                  | Annual audit                                              | (TBD)                | ⏸ Pending     |

---

## 5. FFIEC IT Examination Handbook + AIO Booklet

FFIEC は federal banking agencies (FRB/FDIC/OCC/NCUA/CFPB) 共同 IT 監督 framework。AIO Booklet (Architecture, Infrastructure, and Operations) は最新 (2021)、AI/ML は IT general control の延長として扱う。

| Booklet section          | Control                                                                                                                                     | Design evidence pointer                                                                                                                                                                                                                       | Status        |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| Architecture             | Reference architecture + Resilience + Capacity planning                                                                                     | DOC-CA-08 §3 (12 layer) / §15 DR / §14 Cost (Phase 1 capacity planning)                                                                                                                                                                         | ⏸ Draft       |
| Infrastructure           | Network / Compute / Storage / Backup                                                                                                        | DOC-CA-08 §5 Network / §6 Compute / DM-07 §7 物理 stack / DM-07 §10.3 Backup                                                                                                                                                                    | ⏸ Draft       |
| Operations               | Change management / Configuration management / Incident management / Problem management                                                     | DOC-CA-08 §9 CI/CD + change management / DOC-SRE-11 §6 incident response                                                                                                                                                                       | ⏸ Draft       |
| AIO + AI/ML              | Automated activity governance + AI/ML model lifecycle                                                                                       | FRB SR 11-7 mapping (§3 of本 doc) + DOC-TM-10 §3 AI/ML threat + DOC-SRE-11 §1 AI/ML SRE 新 role                                                                                                                                                  | ⏸ Draft       |

---

## 6. BSA-AML + USA PATRIOT 326 CIP (国際送金 boundary 適用)

国際送金 boundary (UC-BO-IT-BOUNDARY) は AML / CIP / OFAC の重点 scope。Phase 1 の UC-BO-01 (住所変更) は CIP refresh trigger に該当。

| 31 CFR section           | Control                                                                                                                                     | Design evidence pointer                                                                                                                                                                                                                       | Status        |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| 1010.220                 | CIP (Customer Identification Program、address verification 含む)                                                                            | DM-07 §3.1 + §3.3 (`customer_reference` + `kyc_document`) + DOC-CA-08 §1.4 用語 (US address verification provider) + DOC-PFC-09 PFC-02 acceptance condition #5                                                                                  | ⏸ Draft       |
| 1010.230                 | Beneficial ownership (Phase 1 適用想定 = corporate customer の address 変更)                                                                | DM-07 §3.3 `customer_reference` (corporate tier) + workflows/corporate-address-approval-policy + boundary integration                                                                                                                          | ⏸ Draft       |
| 1010.430                 | Record retention (5 year)                                                                                                                   | DM-07 §9.4 `kyc_document` retention 5yr (BSA Section 1010.430 baseline)                                                                                                                                                                         | ⏸ Draft       |
| 1020.220                 | CIP (banks specific)                                                                                                                        | 1010.220 と同様、bank entity 適用                                                                                                                                                                                                                | ⏸ Draft       |
| 1010.620                 | Due diligence for correspondent + private banking                                                                                           | DOC-CA-08 §1.3 非目的 (国際送金 boundary は restricted、AI 自動化対象外) + workflows/international-transfer-boundary/_meta.yaml `automation_status='restricted'`                                                                                | ⏸ Draft       |

---

## 7. OFAC sanctions (50 CFR Part 501)

国際送金 boundary は OFAC SDN list screening 必須。Phase 1 UC-BO-01 (住所変更) で OFAC は customer onboarding 時の screening を継承、新たな screening は通常発生しない。

| Control                  | Design evidence pointer                                                                                                                     | Status        |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| SDN screening (onboarding) | (UC-BO-01 scope 外、onboarding workflow 別 system 想定)                                                                                       | N/A (Phase 1) |
| SDN screening (国際送金)   | workflows/international-transfer-boundary/ + DOC-CA-08 §1.3 非目的 + DOC-PFC-09 PFC-02 acceptance condition #5                                  | ⏸ Draft       |
| Reporting (50 CFR 501)   | Compliance officer + OFAC Compliance team (Phase 1 sprint 0 で SOP)                                                                          | ⏸ Pending     |

---

## 8. GLBA + Reg P (CFR 1016) + Safeguards Rule (16 CFR 314)

GLBA は consumer financial information の privacy + safeguard を要求。Reg P (CFPB / FTC) は privacy notice、Safeguards Rule (FTC、2023 amendments) は information security program。

| Control                  | Sub-control                                                                                                                                | Design evidence pointer                                                                                                                                                                                                                       | Status        |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| Reg P (privacy)          | Privacy notice + Opt-out (sharing with non-affiliates)                                                                                     | Customer privacy notice (Phase 1 sprint 0 起稿、bank legal team) + UI 表示 (本 doc 範囲外)                                                                                                                                                    | ⏸ Pending     |
| Reg P                    | NPI (nonpublic personal information) handling                                                                                              | DM-07 §6.1 PII 分類 4 段 + §6.2 物理配置 + DOC-CA-08 §12 Security baseline                                                                                                                                                                     | ⏸ Draft       |
| Safeguards Rule (314.4)  | Information security program (qualified individual + risk assessment + safeguard implementation + service provider oversight + evaluation) | DOC-CA-08 全体 (cybersecurity program、500.02 と同等) + DOC-TM-10 + DOC-SRE-11 + DOC-PFC-09                                                                                                                                                    | ⏸ Draft       |
| Safeguards Rule (314.4(a))| Designate qualified individual                                                                                                            | CISO 指名 (NYDFS 500.04 と同じ)                                                                                                                                                                                                                | ⏸ Pending     |
| Safeguards Rule (314.4(c))| Encryption (data in transit + at rest)                                                                                                    | DOC-CA-08 §5.5 KMS / DM-07 §10.2                                                                                                                                                                                                              | ⏸ Draft       |
| Safeguards Rule (314.4(e))| MFA                                                                                                                                       | NYDFS 500.12 と同じ                                                                                                                                                                                                                            | ⏸ Draft       |
| Safeguards Rule (314.4(j))| Incident response                                                                                                                         | DOC-SRE-11 §6 Incident response                                                                                                                                                                                                                | ⏸ Draft       |
| Breach notification       | Customer + regulator notification (state-specific 連動)                                                                                    | DOC-SRE-11 §7 Postmortem template + per-state breach notification SOP (CCPA / VA / CO / 等、state-specific)                                                                                                                                    | ⏸ Pending     |

**GLBA PFC-02 acceptance condition #6 (DOC-PFC-09 PFC-02)**: PII handling matrix (DOC-DM-07 §6.1) counsel sign-off。

---

## 9. SOX (Sarbanes-Oxley Section 404)

SOX 404 は IT general control (ITGC) の COSO/COBIT-based audit を要求。本 system が financial reporting に直接 impact する場合 (= 業務 system の transaction 影響)、ITGC scope。Phase 1 UC-BO-01 (住所変更) は indirect (customer master data variation) で SOX impact あり。

| ITGC area                | Control                                                                                                                                     | Design evidence pointer                                                                                                                                                                                                                       | Status        |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| Access management        | Logical access + privileged access + segregation of duties                                                                                  | DOC-CA-08 §4 Identity + §4.4 Permission boundary + DM-07 §5.1 4-eyes + §5.8 SoD 強 enforcement matrix                                                                                                                                            | ⏸ Draft       |
| Change management        | Change approval + testing + deployment                                                                                                      | DOC-CA-08 §9 CI/CD + DM-07 §5.8.1 Type B/C SoD + DOC-SRE-11 §6 incident response                                                                                                                                                                | ⏸ Draft       |
| Computer operations      | Job scheduling + backup + DR                                                                                                                | DOC-CA-08 §6 Compute + §15 DR + DM-07 §10.3 Backup + §10.7 DR drill                                                                                                                                                                             | ⏸ Draft       |
| Program development      | SDLC + segregation between dev / prod                                                                                                       | DOC-CA-08 §9 CI/CD + Liquibase forward-only + branch protection                                                                                                                                                                                  | ⏸ Draft       |
| Audit immutability       | Audit trail 7-year retention (SOX baseline)                                                                                                 | DM-07 §9 (audit_event + hash chain + cross-account Object Lock) + §9.4 retention class `audit_immutable=7yr`                                                                                                                                    | ⏸ Draft       |

**SOX PFC-02 acceptance condition #9 (DOC-PFC-09 PFC-02)**: audit immutability + retention 7yr (DM-07 §9.4) counsel sign-off。

---

## 10. State law (operating state finalize 必須)

State law 適用は **実 operating state** に依存。Phase 1 で external legal counsel が operating state を finalize、適用 state 群を本 §10 で活性化。

### 10.1 NY SHIELD Act (NY General Business Law §899)

| Control                  | Design evidence pointer                                                                                                                     | Status        |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| Data security req'mt     | DOC-CA-08 §12 Security baseline (NYDFS 500 と double-coverage)                                                                                | ⏸ Draft       |
| Breach notification      | DOC-SRE-11 §7 Postmortem template (NY resident notification 30 day target)                                                                  | ⏸ Pending     |

### 10.2 CCPA / CPRA (California Civil Code §1798.100-)

| Right                     | Design evidence pointer                                                                                                                     | Status        |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| Right to know             | (Customer-facing API + UI で response、本 doc 範囲外)                                                                                         | ⏸ Pending     |
| Right to delete           | **DM-07 §9.6 Pseudo-anonymization resolution (introduced in DM-07 v1.7、Cycle 5 で詳細化済)** + DM-07 §5.10 crypto-erasure (column-level KMS DataKey destroy) | 🔍 Counsel review (resolution available、counsel sign-off pending) |
| Right to opt-out (sale)   | Bank context で "sale" 概念限定的、counsel review                                                                                            | ⏸ Pending     |
| Right to correct          | UC-BO-01 (法人住所変更) 自体が right-to-correct workflow                                                                                       | ⏸ Draft       |
| Right to portability      | (Customer-facing data export API、本 doc 範囲外)                                                                                              | ⏸ Pending     |

**Right to delete × Audit immutability conflict (resolution、DM-07 v1.7 で実装)**: DM-07 §9 で audit immutability (7yr retention) は規制要件、CCPA/CPRA right-to-delete は customer request。**Resolution**: DM-07 §9.6 pseudo-anonymization (HMAC-SHA-256 stable pseudonym で customer_reference field を pseudonymize、audit_event row は immutable retention 維持、column-level KMS DataKey destroy で crypto-erasure) + §5.10 row-level encryption (KMS DataKey-per-tenant envelope encryption) で実装。CCPA 1798.145(e) banking exemption + GLBA Reg P 1016.3(q)(1) deidentified concept alignment、BSA 5yr retention 期間中は defer、5yr 経過後に erasure execute。Counsel review focus 4 件 (DM-07 §9.6.2.5) で final sign-off pending → **🔍 Counsel review (resolution available)**。

### 10.3 VA-CDPA / CO Privacy / CT DPA / UT CPA (same-day state privacy family)

CCPA に similar、各 state ごとに minor difference (operating threshold、opt-in vs opt-out、sensitive data 定義 等)。Counsel review で adapter SOP 起稿。

### 10.4 IL BIPA (Biometric Information Privacy Act)

FIDO2/WebAuthn は biometric を直接 collect しないが、device に保存される biometric template を attribute する case で BIPA 適用 risk。Counsel review で confirm。

### 10.5 WA My Health My Data Act

医療 adjacent data 想定外 (Phase 1 UC-BO-01 は address のみ、WA HMHMD 適用外見込み)。Counsel review で confirm。

---

## 11. Counsel review process

### 11.1 PFC-02 acceptance condition (DOC-PFC-09 PFC-02 §c)

9 acceptance condition と本 doc rows の mapping:

| PFC-02 §c # | Condition                                                                                                       | 本 doc 対応 section                            |
| ----------- | --------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| 1           | DOC-CEM-12 (本 doc) full populate                                                                              | (本 doc 全体)                                  |
| 2           | NYDFS Part 500.02 / 500.06 / 500.12 / 500.15 / 500.17 / 500.22 の 6 条全て counsel sign-off                    | §2 NYDFS Part 500 該当 row                     |
| 3           | FRB SR 11-7 4 要件                                                                                              | §3 FRB SR 11-7                                 |
| 4           | OCC SR 11-7 + 2023-17 Third-Party Risk Management                                                              | §4 OCC                                         |
| 5           | BSA-AML / USA PATRIOT 326 CIP / OFAC sanctions screening                                                       | §6 BSA-AML + §7 OFAC                           |
| 6           | GLBA Reg P + Safeguards Rule の PII handling matrix                                                            | §8 GLBA                                        |
| 7           | State law operating state finalize 後の counsel sign-off                                                       | §10 State law                                  |
| 8           | FFIEC IT Examination Handbook + AIO Booklet                                                                    | §5 FFIEC                                       |
| 9           | SOX audit immutability + retention 7yr                                                                         | §9 SOX                                         |

### 11.2 Counsel firm 選定 + engagement

- **Bid request**: Phase 1 着手 -90 day までに 3 候補 firm (US banking + AI/ML regulatory experience) から bid 取得
- **Selection criteria**: AI/ML regulatory experience (FRB SR 11-7 / OCC) + NYDFS Part 500 expertise + AWS cloud expertise + JP bank America division experience
- **Engagement letter**: Compliance officer + counsel co-sign、本 doc を deliverable input として明示
- **Review session × 3**: Kickoff / Mid-review (Phase 1 -60 day) / Final (Phase 1 -7 day)

### 11.3 Counsel comment slot 運用

各 row の `Counsel comment slot (TBD)` を counsel が markdown comment で書き込み:

```markdown
> **Counsel comment (2026-XX-XX、<counsel firm>)**: <comment>
> **Status update**: ⏸ → 🔍 / ⚠ / ✅
```

最終 sign-off は engagement letter 別添 final opinion letter で formal、本 doc は work-product として運用。

---

## 12. 後続 PR / TODO

1. ✅ **完了 (本 doc 起稿、autonomous prod-ready loop Cycle 4)** — DOC-CEM-12 v0.1 起稿、NYDFS Part 500 全 23 section + FRB SR 11-7 4 要件 + OCC + FFIEC + BSA-AML core + OFAC + GLBA + SOX + State law 6 family を control 単位 mapping
2. **Cycle 5 で DM-07 §9 に "right-to-delete × audit immutability conflict" resolution (pseudo-anonymization SOP) を追記** (本 doc §10.2 ⚠ Gap fix)
3. **DOC-ROOT-_SSOT row 追加** — DOC-CEM-12 row (Cycle 9)
4. **DOC-CA-08 §19.1 external reference に本 doc DOC-CEM-12 row 追加** (Cycle 9)
5. **Phase 1 着手 -90 day で counsel firm bid + selection** (DOC-PFC-09 PFC-02 critical path)
6. **State operating state finalize 後の §10 full populate** (Compliance officer)
7. **Right-to-delete conflict scenario の DM-07 §9 詳細化** (Cycle 5)
8. **Annual refresh** (Phase 1 ops 開始後、新規 state law / federal guidance 反映)
