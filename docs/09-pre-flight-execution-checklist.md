# Backoffice AI v2 — Phase 1 Pre-Flight Execution Checklist (v0.1 Draft)

> **目的**: DOC-CA-08 v2.6 + DOC-DM-07 v1.7.2 が **「設計 SSOT として design-complete」** に到達した上で、**Phase 1 本番投入の Type B 設定承認** を取るために、外部依存 7 項 (real workload 実測 / DR drill / external counsel review / Bedrock primary source verify / Computer Use isolation 実証 / TLS inspection 実証 / warm pool 実測) を **autonomously 不能な外部 execution work** として明示分離し、各項目に owner / acceptance criteria / 証跡 template / 推定工数 / sign-off authority を pin する SSOT。
> **位置付け**: DOC-CA-08 §16 (inline 7 項 list) を本 doc に hoist + 拡張、Phase 1 着手 sprint 0 の execution backlog として運用。本 doc 自体は「設計 doc」ではなく「外部 execution の orchestration doc」。Claude が autonomously 完了できる項目は 0、全項目が外部 human + AWS account + 外部 counsel に依存する。

| 項目            | 値                                                                                                                                                                                                  |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 文書 ID         | DOC-PFC-09                                                                                                                                                                                          |
| 文書名          | Phase 1 Pre-Flight Execution Checklist (外部 7 項 × RACI × acceptance × 証跡 template × sign-off authority、Type B 設定承認 prerequisite)                                                            |
| 版数            | v0.2 (autonomous prod-ready loop Cycle 8.5 P0-V correction: PFC-03 全面 rewrite to Bedrock Geo CRIS active state + acceptance condition #6 追加 + counsel sign-off prerequisite 強化)                |
| ステータス      | Draft (autonomous prod-ready loop Cycle 1 起稿)                                                                                                                                                     |
| オーナー        | backoffice-ai-v2 maintainer (AI 管理者 + Security 関係者 + SRE + 業務責任者 + Compliance officer + 外部 legal counsel の 6 stakeholder coordination)                                                |
| 承認者          | 設定承認 Type B (Phase 1 本番投入 prerequisite gate、全 7 項 sign-off 後に Type B approval gate に進む)                                                                                              |
| 閲覧対象        | Phase 1 implementation team / Security 関係者 / Compliance 関係者 / Network team / SRE team / 業務責任者 / 経営層 (Type B 承認者) / 外部 legal counsel                                              |
| 機密区分        | Internal                                                                                                                                                                                            |
| 関連文書        | **DOC-CA-08 v2.6 §16** (hoist source), **DOC-DM-07 v1.7.2** (persistence foundation), DOC-CEM-12 v0.2 (Compliance Evidence Matrix), DOC-TM-10 v0.1 (Threat Model), DOC-SRE-11 v0.1 (SRE Runbook) |
| SSOT 区分       | Phase 1 本番投入 pre-flight execution の SSOT (外部 execution owner / acceptance criteria / 証跡 template / sign-off chain)                                                                          |
| Evidence Status | N/A (本 doc は execution orchestration、定量値は 各 owner が実測後に append)                                                                                                                       |
| 改版履歴        | v0.1 (2026-05-25、autonomous prod-ready loop Cycle 1): 初版作成、CA-08 §16 inline 7 項を本 doc に hoist + RACI / acceptance / 証跡 template / 工数 / sign-off authority に拡張、PFC-01 ~ PFC-07 として ID 化、§3 統合 sign-off chain + §4 dependency graph + §5 evidence package binder structure を新設。v0.2 (2026-05-25、autonomous prod-ready loop Cycle 8.5 + Cycle 9): PFC-03 全面 rewrite (CA-08 v2.5 ADR-4 active state Geo CRIS default に sync、acceptance condition 5 → 6 項、Bedrock Geo CRIS quota verify + SCP enforce sandbox 実証 + data residency counsel sign-off prerequisite 追加)。本 PFC-03 update は CA-08 §16 PFC #3 + §17 open question #30-#32 + §18 R1/R11 と整合 |

---

## 0. 本 doc の読み方 (3 分要約)

- **対象**: Phase 1 本番投入の **Type B 設定承認 gate** に持ち込むための **外部 execution 7 項**。Claude (本 doc 起稿主体) は本項を autonomously 完了不能 = AWS account / 外部 counsel / 業務 owner / Security officer の execution work が必須
- **位置付け**: DOC-CA-08 §16 を SSOT として hoist、本 doc は **execution orchestration** (誰が何を / どの基準で / どの証跡で / 誰が sign-off するか) の SSOT
- **scope**: PFC-01 ~ PFC-07 (Bedrock primary source verify / Computer Use isolation / TLS inspection / Warm pool sizing / Token cost re-estimate / US 規制 external counsel review / Hand-off package bundle)
- **out of scope**: 各項目の execution 実行そのもの (= owner 領域)、Phase 2+ items (DSQL / Knowledge Bases 等、別 gate)、JP parent layer (DOC-CA-09 candidate、別 doc)
- **完了状態**: 全 7 PFC が `Sign-off: ✅` に到達した時点で、本 doc を Type B 設定承認 input package に bundle (DOC-CA-08 + DOC-DM-07 + DOC-PFC-09 + DOC-TM-10 + DOC-SRE-11 + DOC-CEM-12)
- **本 doc の更新責務**: 各 PFC owner は execution 完了時に §5 evidence binder の該当行を ✅ + URL + evidence file pointer で update、最終 sign-off は §3 で chain 化

---

## 1. 7 PFC item catalog (ID / 主題 / 外部依存度)

| PFC ID    | 主題                                            | 外部依存度                                                                | DOC-CA-08 §16 元 # |
| --------- | ----------------------------------------------- | ------------------------------------------------------------------------- | ------------------- |
| **PFC-01** | Hand-off package bundle + Type B input set 確定 | 中 (Security + 業務 + AI 管理者 内部合議)                                  | #1                  |
| **PFC-02** | US 規制 framework AWS service mapping 逐条 review | **高 (外部 legal counsel + Compliance officer + 外部監査)**               | #2                  |
| **PFC-03** | Bedrock In-Region 再 verify + quota 確認        | 中 (AWS account + service quota team)                                     | #3                  |
| **PFC-04** | Computer Use Fargate per-case isolation 検証    | 高 (AWS account + Security + 開発者 demo + 3 case 並走実証)               | #4                  |
| **PFC-05** | Network Firewall TLS inspection sandbox 検証    | 高 (AWS account + Private CA 発行 + ECH 無効化検証)                       | #5                  |
| **PFC-06** | Computer Use warm pool Little's Law 実測         | 高 (AWS account + 想定 case rate 負荷生成)                                | #6                  |
| **PFC-07** | Bedrock token cost re-estimate 実測             | 高 (AWS account + Computer Use case 1 件の actual screenshot × 8 step)    | #7                  |

**外部依存度の定義**: 低 = 1 internal team only / 中 = 2-3 internal team / 高 = 外部 vendor or 外部 counsel or AWS account 必須。

**完了順序の dependency** は §4 graph 参照。PFC-03 (Bedrock primary source) が他項目の AWS account 利用前提として最上流、PFC-02 (external counsel) は最も lead time が長く Phase 1 着手 -90 day から並行開始推奨。

---

## 2. PFC-01 ~ PFC-07 詳細 (owner / acceptance / 証跡 template / 工数 / sign-off)

各項目は 9 軸で記述: **(a) 主題 / (b) RACI / (c) 受入条件 (binary) / (d) 検証方法 / (e) 証跡 template / (f) 推定工数 / (g) 依存 (上流) / (h) deadline / (i) sign-off authority**。

### PFC-01: Hand-off package bundle + Type B input set 確定

- **(a) 主題**: DOC-CA-08 + DOC-DM-07 + DOC-TM-10 + DOC-SRE-11 + DOC-CEM-12 + DOC-PFC-09 (本 doc) を 1 つの hand-off package に bundle、Type B 設定承認 input set として確定
- **(b) RACI**:
  - **R (Responsible)**: backoffice-ai-v2 maintainer (= AI 管理者 兼任)
  - **A (Accountable)**: AI 管理者
  - **C (Consulted)**: Security 関係者 / 業務責任者 / SRE / Compliance officer
  - **I (Informed)**: 経営層 (Type B 承認者) / Phase 1 implementation team
- **(c) 受入条件 (binary、全 5 項 ✅ 必須)**:
  1. ☐ 6 doc (CA-08 / DM-07 / PFC-09 / TM-10 / SRE-11 / CEM-12) が全て `Approved` ステータス、`Phase 1 hand-off Draft` 残存 0
  2. ☐ 各 doc の §改版履歴 が最新 v までで sequential、stale section 0 (negative-pattern grep でゼロ確認)
  3. ☐ DOC-ROOT-_SSOT に 6 doc の row が登録、SSOT 区分衝突 0
  4. ☐ PFC-02 ~ PFC-07 が全て `Sign-off: ✅` (本 PFC-01 が他 6 PFC の downstream)
  5. ☐ Type B 設定承認 agenda template (本 doc §6) に 6 doc の link + 1 page exec summary が貼られている
- **(d) 検証方法**:
  - Step 1: `grep -nE '^\| ステータス\s+\|' docs/{07,08,09,10,11,12}-*.md` で 6 doc 全て `Approved`
  - Step 2: `grep -nE 'Phase 1 hand-off Draft|Draft \(autonomous' docs/{07-12}-*.md` で hit 0
  - Step 3: `docs/_SSOT.md` を Read、6 row 確認
  - Step 4: §5 evidence binder で PFC-02 ~ PFC-07 全行 ✅ 確認
  - Step 5: Type B agenda template (本 doc §6) の link 全て resolve 確認
- **(e) 証跡 template**: 本 doc §5 evidence binder PFC-01 行に: (i) hand-off package zip / PR URL、(ii) Type B agenda PDF、(iii) SSOT row diff、(iv) sign-off email / Slack record (Security / 業務 / AI 管理者 4 名分)
- **(f) 推定工数 (AI agent / human review / external waiting / risk 分解)**:
  - AI work: 0.5 day (Claude が package bundle 整形 + grep 検証 + agenda template 化)
  - Human review: 1 day (4 stakeholder の review)
  - External waiting: 0
  - Risk: 低 (PFC-02 ~ PFC-07 完了が前提のため、自身は mechanical)
- **(g) 上流依存**: PFC-02 / PFC-03 / PFC-04 / PFC-05 / PFC-06 / PFC-07 全件完了
- **(h) deadline**: Phase 1 着手 -7 day (sprint 0 last week)
- **(i) sign-off authority**: **AI 管理者 (A) + Security 関係者 + 業務責任者** の 3 名 co-sign、最終 Type B 設定承認は経営層

---

### PFC-02: US 規制 framework AWS service mapping 逐条 review

- **(a) 主題**: AWS service (Bedrock / Cognito / Aurora Global DB / S3 Object Lock / KMS / VPC / WAF / GuardDuty 等) が NYDFS 23 NYCRR Part 500 + FRB SR 11-7 + OCC SR 11-7 + 2023-17 + FFIEC IT Handbook + BSA-AML + OFAC + GLBA + Reg P + Safeguards Rule + SOX + State law (NY SHIELD / CCPA-CPRA / VA / CO / CT / UT / IL BIPA / WA) の各条 control に逐条で充足することを **external legal counsel + Compliance officer + 外部監査** が verify
- **(b) RACI**:
  - **R**: Compliance officer
  - **A**: Compliance officer + external legal counsel co-A
  - **C**: AI 管理者 / Security 関係者 / 業務責任者 / BSA Officer / OFAC Compliance / Model Risk Management
  - **I**: 経営層 / 外部監査 (Big4 想定) / Phase 1 implementation team
- **(c) 受入条件 (binary、全 9 項 ✅ 必須)**:
  1. ☐ DOC-CEM-12 (Compliance Evidence Matrix、Cycle 4 起稿) が full populate、全 control 行に AWS service mapping + DOC-CA-08/DM-07 §番号 evidence pointer + counsel comment
  2. ☐ NYDFS Part 500.02 / 500.06 / 500.12 / 500.15 / 500.17 / 500.22 の 6 条全て counsel sign-off
  3. ☐ FRB SR 11-7 の 4 要件 (model inventory / validation framework / ongoing monitoring / governance committee) について Bedrock Claude + Computer Use の SOP が counsel sign-off
  4. ☐ OCC SR 11-7 + 2023-17 Third-Party Risk Management で AWS Bedrock + Anthropic Computer Use API を third-party AI service として risk assessment 完了
  5. ☐ BSA-AML / USA PATRIOT 326 CIP / OFAC sanctions screening の国際送金 boundary 適用 SOP が BSA Officer + OFAC Compliance sign-off
  6. ☐ GLBA Reg P + Safeguards Rule (16 CFR 314) について PII handling matrix (DOC-DM-07 §6.1) が counsel sign-off
  7. ☐ State law operating state finalize、適用 state について CCPA-CPRA / VA-CDPA / CO / CT / UT / IL BIPA / WA 全て counsel sign-off
  8. ☐ FFIEC IT Examination Handbook + AIO Booklet について Bedrock Claude + Computer Use の Automated Activity / AI/ML 監督 SOP が counsel sign-off
  9. ☐ SOX baseline について audit immutability + retention 7yr (DM-07 §9.4) が counsel sign-off
- **(d) 検証方法**:
  - Step 1: DOC-CEM-12 (Cycle 4 起稿) を起稿、control × AWS service × evidence pointer matrix を fully populate
  - Step 2: external legal counsel に DOC-CEM-12 + DOC-CA-08 + DOC-DM-07 を送付、bid request (3 候補 firm から 1 選定)
  - Step 3: counsel review session × 3 回 (kickoff / mid-review / final)、findings を本 doc §5 evidence binder に accumulate
  - Step 4: Compliance officer + BSA Officer + OFAC Compliance + Model Risk Management の internal sign-off chain
  - Step 5: 外部監査 (Big4) の preliminary opinion (Type B 承認 input として、formal opinion は Phase 1 ops 開始後)
- **(e) 証跡 template**: §5 evidence binder PFC-02 行に: (i) DOC-CEM-12 final version PDF、(ii) counsel engagement letter + final opinion letter、(iii) Compliance officer sign-off memo、(iv) 外部監査 preliminary opinion、(v) BSA Officer + OFAC Compliance + Model Risk Management の 3 individual sign-off email
- **(f) 推定工数**:
  - AI work: 5 day (DOC-CEM-12 起稿 + counsel への送付 package 整形 + draft response to counsel findings)
  - Human review: 15 day (Compliance officer + 4 内部 sign-off + 整合化)
  - **External waiting: 60-90 day** (counsel review lead time、3 review session、外部監査 preliminary opinion 含む)
  - Risk: **高** (本 doc 全 PFC で最長 lead time、counsel finding 次第で設計変更 risk)
- **(g) 上流依存**: DOC-CEM-12 起稿完了 (Cycle 4) + counsel firm 選定完了
- **(h) deadline**: Phase 1 着手 -7 day (counsel final opinion 必須、lead time から逆算で Phase 1 着手 -90 day から並行開始)
- **(i) sign-off authority**: **Compliance officer + external legal counsel co-sign**、Type B 設定承認は経営層

---

### PFC-03: Bedrock Geo CRIS 再 verify + quota 確認 (v0.2 P0-V correction、autonomous loop Cycle 8.5)

- **(a) 主題 (v0.2 corrected)**: AWS Bedrock model card primary source 再 verify で Phase 1 着手時点の active state confirm:
  - Sonnet 4.6: us-east-1 + us-west-2 共に In-Region: NO、Geo CRIS `us.anthropic.claude-sonnet-4-6` のみ available (CA-08 v2.5 ADR-4 で active state)
  - Haiku 4.5: us-east-1 In-Region: YES、us-west-2 NO、Geo CRIS `us.anthropic.claude-haiku-4-5-20251001-v1:0` available
  - Phase 1 想定 token 量を **Geo CRIS profile invocation** で sandbox sustain 実測 + service quota increase 申請 (Geo CRIS は In-Region と独立 quota possibility あり、AWS Support 確認)
- **(b) RACI**:
  - **R**: AI 管理者
  - **A**: AI 管理者
  - **C**: SRE / Security 関係者 / Compliance officer (data residency 解釈 sync 必要)
  - **I**: 経営層 / 業務責任者
- **(c) 受入条件 (binary、全 6 項 ✅ 必須、v0.2 で 5 → 6 項に拡張)**:
  1. ☐ AWS Bedrock model card (Sonnet 4.6 + Haiku 4.5) Phase 1 着手時点 page を archive (Wayback Machine + 内部 evidence)、In-Region / Geo / Global 3 status が **autonomous loop Cycle 8.5 verify 結果と一致** (Sonnet 4.6 両 region In-Region: NO + Geo CRIS YES、Haiku 4.5 us-east-1 In-Region: YES + us-west-2 NO + Geo CRIS YES) であることを screenshot 証跡化、乖離あれば即 escalation
  2. ☐ Phase 1 想定 token 量 (low / mid / high scenario、DOC-CA-08 §14) を **Geo CRIS profile** で sandbox sustain 実測、TPM (tokens per minute) / RPM (requests per minute) + cross-region data transfer cost が requirement 充足
  3. ☐ Service quota increase 申請が approved (AWS Support case ID + approved quota value 記録)、Geo CRIS profile 専用 quota の有無 + In-Region quota との関係を AWS Support 確認
  4. ☐ SCP §7.5 v2.5 rewrite (Allow `us.anthropic.*` + Haiku 4.5 us-east-1 direct + Deny `eu/jp/au/global.anthropic.*` + Deny outside us-east-1/us-west-2) が sandbox で正しく enforce されることを実証
  5. ☐ Model version pin (DOC-DM-07 §3.2 `agent_model_config_version.model_label`) が Geo CRIS profile (`us.anthropic.claude-sonnet-4-6`) + Haiku 4.5 direct (`anthropic.claude-haiku-4-5-20251001-v1:0`) で lock
  6. ☐ (新 v0.2 P0-V) **Geo CRIS data residency 解釈 counsel sign-off** (open question §17 #30、PFC-02 acceptance condition #2 強化と sync): "US geography Geo CRIS = NYDFS 500.15 / GLBA / state law 充足" であることが external counsel から sign-off
- **(d) 検証方法**:
  - Step 1: Bedrock model card primary source を WebSearch + 直接 browse、archive
  - Step 2: AWS sandbox account で Phase 1 想定 token rate で 1 hour sustain test (low / mid / high 3 scenario)、throttle 発生 0 を確認
  - Step 3: Service quota increase 申請、AWS Support case ID record
  - Step 4: SCP deploy + sandbox で `aws bedrock invoke-model --region eu-west-1` 等で deny 確認
  - Step 5: `agent_model_config_version` row insert + activation
- **(e) 証跡 template**: §5 evidence binder PFC-03 行に: (i) Bedrock model card archive (Wayback URL + 内部 PDF)、(ii) sandbox sustain test report (TPM/RPM × scenario × 1hr graph)、(iii) AWS Support case ID + approved quota letter、(iv) SCP deny test log、(v) model version pin DB row screenshot
- **(f) 推定工数**:
  - AI work: 1 day (model card archive + sandbox test script 起稿 + SCP deploy CDK + DB row insert SQL)
  - Human review: 2 day (SRE review + Security 関係者 SCP review)
  - External waiting: 7-14 day (AWS Support service quota increase lead time)
  - Risk: 中 (v2.5 P0-V correction で Sonnet 4.6 In-Region 不在判明、Geo CRIS profile に切替、In-Region status の継続 monitor + Geo CRIS quota 実態 verify が新たな main risk)
- **(g) 上流依存**: AWS sandbox account + Bedrock access enable + Phase 1 想定 token 量 scenario 確定 (DOC-CA-08 §14)
- **(h) deadline**: Phase 1 着手 -30 day (quota increase lead time 含む)
- **(i) sign-off authority**: AI 管理者 + SRE co-sign

---

### PFC-04: Computer Use Fargate per-case isolation 検証

- **(a) 主題**: Computer Use ECS Fargate sandbox が 1 case = 1 ephemeral task で完全 isolation、3 case 並走時 cross-task data leak 0、task 終了で全 process kill + ephemeral storage 破棄 を sandbox で実証
- **(b) RACI**:
  - **R**: AI 管理者 + 開発者 (Computer Use 担当)
  - **A**: Security 関係者
  - **C**: SRE / Network team
  - **I**: 業務責任者
- **(c) 受入条件 (binary、全 6 項 ✅ 必須)**:
  1. ☐ 3 case 同時並走 Fargate task で各 task の screenshot stack が tenant-isolated (DM-07 §3.3 `screenshot_stack` table の tenant_id 整合)
  2. ☐ Task 終了後 ephemeral storage 破棄を AWS ECS API で confirmed (`task-definition` ephemeralStorage 設定 + task lifecycle log)
  3. ☐ Cross-task memory leak 試験: 1 case 完了直後に同 task slot を別 case に reuse して PII residue 0 を確認 (task 単位破棄で reuse なしを default に、念のため verify)
  4. ☐ Computer Use prompt injection 4 段防御 (DOC-CA-08 §7.3.1 F10) の各段が機能していることを attack scenario × 5 で確認
  5. ☐ Browser egress allowlist (DOC-CA-08 §5.3) の host header 不一致 / SNI 不一致 / ECH attempt 全て block されていることを sandbox 確認
  6. ☐ Screenshot redaction (PII mask) が顧客 name / address / id_document field で機能していることを 10 sample で確認
- **(d) 検証方法**:
  - Step 1: AWS sandbox で 3 case 同時並走 Fargate task を起動、各 case で異なる tenant_id + 異なる顧客 data を流す
  - Step 2: 各 task の screenshot_stack S3 path を inspect、tenant boundary 越え 0 を確認
  - Step 3: Task lifecycle CloudWatch event を 1 hour 観察、ephemeral storage 破棄 event を confirm
  - Step 4: Prompt injection attack scenario 5 種 (URL-based / OCR-based / instruction override / tenant switching / exfiltration) を実行、4 段防御で全 5 件 block
  - Step 5: Browser egress test (curl 経由 in-task で external IP 接続試行)、Network Firewall block log で全件 deny
  - Step 6: Screenshot redaction test (10 sample で PII field redact 確認)
- **(e) 証跡 template**: §5 evidence binder PFC-04 行に: (i) 3 case 並走 sandbox demo video、(ii) screenshot_stack tenant_id audit SQL、(iii) ephemeral storage 破棄 CloudWatch log、(iv) prompt injection attack 5 scenario report、(v) Network Firewall block log、(vi) screenshot redaction sample 10 件 (before / after)
- **(f) 推定工数**:
  - AI work: 3 day (sandbox CDK + attack scenario script + verify script)
  - Human review: 5 day (Security 関係者 + 開発者 demo + review)
  - External waiting: 0
  - Risk: 中 (prompt injection 4 段防御の各段が full implement 必須、F10 primary risk closure)
- **(g) 上流依存**: PFC-03 完了 (Bedrock access) + DOC-CA-08 §7.3.1 prompt injection 4 段防御 design lock
- **(h) deadline**: Phase 1 着手 -14 day
- **(i) sign-off authority**: Security 関係者 + AI 管理者 co-sign

---

### PFC-05: Network Firewall TLS inspection sandbox 検証

- **(a) 主題**: Computer Use Fargate egress に対し L4 (FQDN) + L7 (TLS inspection、Private CA) + Application (Playwright host-resolver + ECH 無効化) の 3 段防御が機能、Private CA 発行 + Fargate task OS trust store inject が SOP 化
- **(b) RACI**:
  - **R**: Network team + Security 関係者
  - **A**: Security 関係者
  - **C**: AI 管理者 / 開発者 (Computer Use 担当) / SRE
  - **I**: 業務責任者
- **(c) 受入条件 (binary、全 5 項 ✅ 必須)**:
  1. ☐ Private CA (AWS Private CA) 発行 + Fargate task OS trust store に CA cert inject、CDK で自動化
  2. ☐ Network Firewall stateful rule (TLS inspection enabled) で SNI / HTTP host header allowlist の 3 段 verify 機能
  3. ☐ Chromium / Playwright で ECH (Encrypted Client Hello) 無効化、`--disable-features=EncryptedClientHello` 等の flag が enforce
  4. ☐ Allowlist 外 FQDN への接続試行が L4 + L7 + Application の 3 段で block されることを sandbox 確認
  5. ☐ Allowlist 内 FQDN への接続が成功 + TLS inspection log が出力されることを sandbox 確認
- **(d) 検証方法**:
  - Step 1: AWS Private CA 発行 + CDK で Fargate task definition の `initContainers` で CA cert inject
  - Step 2: Network Firewall stateful rule group deploy (TLS inspection cert 設定)
  - Step 3: Sandbox で allowlist 外 (例: `evil.example.com`) 接続試行、L4 / L7 / Application の 3 段 block log 確認
  - Step 4: Sandbox で allowlist 内 (例: USPS API endpoint) 接続成功 + TLS inspection log 確認
  - Step 5: ECH attempt 試験 (chromium flag remove で ECH enable 状態を作り、block 確認)
- **(e) 証跡 template**: §5 evidence binder PFC-05 行に: (i) Private CA cert 発行 record、(ii) Fargate task definition snippet、(iii) Network Firewall rule group JSON、(iv) sandbox block log (allowlist 外)、(v) sandbox success log (allowlist 内)、(vi) ECH attempt block log
- **(f) 推定工数**:
  - AI work: 2 day (CDK + Network Firewall rule group + sandbox test script)
  - Human review: 3 day (Network team + Security 関係者 review)
  - External waiting: 0
  - Risk: 中 (Network Firewall TLS inspection は AWS service の learning curve あり、Playwright + ECH の互換性が AWS docs に明記されていない)
- **(g) 上流依存**: DOC-CA-08 §5.3 design lock + AWS sandbox account + AWS Private CA enable
- **(h) deadline**: Phase 1 着手 -14 day
- **(i) sign-off authority**: Security 関係者 + Network team co-sign

---

### PFC-06: Computer Use warm pool Little's Law 実測

- **(a) 主題**: Computer Use Fargate warm pool の sizing (DOC-CA-08 §6.3.1 で **5 task** 想定) を Phase 1 想定 case rate で sandbox 実測、Auto Scaling thresholds を calibrate
- **(b) RACI**:
  - **R**: SRE
  - **A**: SRE
  - **C**: AI 管理者 / 開発者 (Computer Use 担当)
  - **I**: 業務責任者 (case rate scenario provide)
- **(c) 受入条件 (binary、全 5 項 ✅ 必須)**:
  1. ☐ Phase 1 想定 case rate (low / mid / high scenario、DOC-CA-08 §14) で warm pool 5 task が cold start ゼロで sustained throughput を達成
  2. ☐ Auto Scaling target 70% で queue depth > 3 → +2 (max 15) のルールが Phase 1 burst で正常作動 (sandbox 負荷生成)
  3. ☐ P50 / P95 / P99 task allocation latency が SLO (P95 < 30 sec、DOC-SRE-11 で定義) 充足
  4. ☐ Auto Scaling cool-down 中の queue spike で SLO 違反が発生しないことを burst test で確認
  5. ☐ Sandbox 実測値で DOC-CA-08 §6.3.1 Little's Law 計算 (`L = λ × W`) を re-calibrate、warm pool 数を Phase 1 開始値に finalize
- **(d) 検証方法**:
  - Step 1: AWS sandbox で warm pool 5 task deploy
  - Step 2: 負荷生成 tool (例: AWS Distributed Load Testing) で low / mid / high case rate を 1 hour sustain
  - Step 3: CloudWatch metrics で P50/P95/P99 latency + queue depth + task scaling event を観察
  - Step 4: Burst test (5x rate spike for 5 min) で SLO 違反 0 を確認
  - Step 5: 実測 λ (case/sec) + W (task 処理時間 sec) から `L` 算出、warm pool 数を re-calibrate、CDK update + commit
- **(e) 証跡 template**: §5 evidence binder PFC-06 行に: (i) 負荷生成 script + run report、(ii) CloudWatch P50/P95/P99 graph (1 hour × 3 scenario)、(iii) queue depth + Auto Scaling event timeline、(iv) burst test report、(v) Little's Law calibration calc memo + CDK diff
- **(f) 推定工数**:
  - AI work: 2 day (負荷 script + CDK warm pool + monitoring dashboard)
  - Human review: 3 day (SRE review)
  - External waiting: 0
  - Risk: 低 (Little's Law 計算 framework は確立、実測値 calibration のみ)
- **(g) 上流依存**: PFC-04 完了 (Fargate isolation) + Phase 1 case rate scenario 確定 (業務責任者)
- **(h) deadline**: Phase 1 着手 -14 day
- **(i) sign-off authority**: SRE + AI 管理者 co-sign

---

### PFC-07: Bedrock token cost re-estimate 実測

- **(a) 主題**: Computer Use case 1 件の actual token consumption (Sonnet vision pricing で screenshot × 8 step) を sandbox 計測、DOC-CA-08 §14.1 cost table を実測値で narrow
- **(b) RACI**:
  - **R**: AI 管理者 + Cost team
  - **A**: 経営層 (cost approval gate)
  - **C**: SRE / 開発者 (Computer Use 担当)
  - **I**: 業務責任者
- **(c) 受入条件 (binary、全 5 項 ✅ 必須)**:
  1. ☐ Computer Use case 1 件 (UC-BO-01 法人住所変更想定 workflow) の actual token consumption が 10 sample で計測 (input tokens / output tokens / image tokens 分離)
  2. ☐ Sonnet vision pricing で 1 case cost を 10 sample 平均 + P95 で算出 (現行 v1.1 試算は 40k token / case、実測で narrow)
  3. ☐ DOC-CA-08 §14.1 cost table を実測値で update、low / mid / high scenario cost を re-calculate
  4. ☐ Phase 1 case 件数想定 (業務責任者 + 経営層 確定後) で 月次 Bedrock cost forecast + 95% upper bound 算出
  5. ☐ Cost approval gate (経営層 sign-off) を通過、Phase 1 cost budget commit
- **(d) 検証方法**:
  - Step 1: AWS sandbox で UC-BO-01 workflow を Computer Use で 10 sample 実行
  - Step 2: Bedrock invocation log (DOC-CA-08 §12.4 cross-account) から input/output/image token を抽出
  - Step 3: Pricing calc spreadsheet で 1 case cost + monthly forecast 算出
  - Step 4: DOC-CA-08 §14.1 を edit、実測値で table update
  - Step 5: 経営層 cost approval session で 95% upper bound + Reserved / Savings Plan strategy を提示、sign-off 取得
- **(e) 証跡 template**: §5 evidence binder PFC-07 行に: (i) 10 sample Bedrock invocation log query result、(ii) cost calc spreadsheet、(iii) DOC-CA-08 §14.1 diff、(iv) 経営層 cost approval memo
- **(f) 推定工数**:
  - AI work: 2 day (sandbox 10 sample 実行 + cost calc spreadsheet + CA-08 update)
  - Human review: 5 day (Cost team review + 経営層 approval session 準備 + meeting)
  - External waiting: 14-30 day (経営層 approval session schedule)
  - Risk: 中 (実測 cost が試算より高い場合は Phase 1 scope 削減 or 経営層 budget increase 判断必要)
- **(g) 上流依存**: PFC-03 完了 (Bedrock access) + PFC-04 完了 (Computer Use sandbox) + Phase 1 case rate scenario 確定 (業務責任者 + 経営層)
- **(h) deadline**: Phase 1 着手 -14 day
- **(i) sign-off authority**: AI 管理者 + Cost team + **経営層 (final cost approval)**

---

## 3. 統合 sign-off chain

7 PFC が個別 sign-off されたあと、本 doc §5 evidence binder を full populate した状態で **統合 sign-off** を以下の chain で実行:

```
PFC-03 ✅ ──┐
PFC-04 ✅ ──┼──→ PFC-06 ✅ ──┐
PFC-05 ✅ ──┘                ├──→ PFC-07 ✅ ──→ PFC-01 ✅ ──→ Type B 設定承認 (経営層)
PFC-02 ✅ ─────────────────────────────────────→ PFC-01 ✅ ─↗
```

**Phase 段階別 milestone**:
- **M1 (Phase 1 -90 day)**: PFC-02 kick-off (counsel firm 選定 + engagement letter)、PFC-03 開始 (AWS sandbox provision)
- **M2 (Phase 1 -60 day)**: PFC-04 / PFC-05 / PFC-06 / PFC-07 sandbox 構築完了、計測開始
- **M3 (Phase 1 -30 day)**: PFC-03 / PFC-04 / PFC-05 / PFC-06 / PFC-07 sign-off 完了、PFC-02 counsel mid-review
- **M4 (Phase 1 -7 day)**: PFC-02 counsel final opinion 取得、PFC-01 hand-off package bundle 確定、**Type B 設定承認 session 開催**
- **M5 (Phase 1 着手)**: 経営層 Type B 設定承認 ✅ で Phase 1 ops 開始

**critical path**: PFC-02 (counsel review 60-90 day lead time) が最長、M1 から並行で開始しないと M4 に間に合わない。

---

## 4. PFC 間 dependency graph

```
                                   ┌─────────────┐
                                   │ PFC-02      │ 外部 counsel (60-90 day)
                                   │ (US 規制)    │ 独立 critical path
                                   └──────┬──────┘
                                          │
                                          ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────────┐
│  PFC-03     │───→│  PFC-04     │───→│  PFC-06         │
│  (Bedrock)  │    │  (CU isolat)│    │  (warm pool)    │
└─────────────┘    └─────┬───────┘    └────────┬────────┘
                         │                     │
                         ▼                     ▼
                  ┌─────────────┐    ┌─────────────────┐
                  │  PFC-05     │    │  PFC-07         │
                  │  (TLS insp) │    │  (token cost)   │
                  └─────────────┘    └────────┬────────┘
                                              │
                                              ▼
                                     ┌─────────────────┐
                                     │  PFC-01         │  ← all of above
                                     │  (hand-off pkg) │
                                     └────────┬────────┘
                                              │
                                              ▼
                                  ┌──────────────────────┐
                                  │ Type B 設定承認 (経営) │
                                  └──────────────────────┘
```

**並行可能 path**: PFC-02 は他全てと並行、PFC-04 / PFC-05 は並行、PFC-06 / PFC-07 は PFC-04 完了後に並行。
**直列依存**: PFC-03 → PFC-04 → PFC-06 / PFC-07、PFC-04 → PFC-05 (TLS inspection 検証は CU sandbox が稼働してから)、全部完了 → PFC-01。

---

## 5. Evidence Binder (各 owner が execution 完了時に update)

各行は owner が completion 時に編集、`Status` を `✅ Signed-off` に切替、Evidence pointer に内部 URL / PDF / log location を pin する。

| PFC ID  | 主題                          | Owner                  | Status      | Acceptance ✅ count | Evidence pointer (URL / PDF / log location)                  | Sign-off date | Sign-off authority             |
| ------- | ----------------------------- | ---------------------- | ----------- | ------------------- | ------------------------------------------------------------ | ------------- | ------------------------------ |
| PFC-01  | Hand-off package bundle       | AI 管理者              | ⏸ Pending   | 0 / 5               | (TBD)                                                        | TBD           | AI 管理者 + Security + 業務責任者 |
| PFC-02  | US 規制 counsel review        | Compliance officer     | ⏸ Pending   | 0 / 9               | (TBD - DOC-CEM-12 起稿 + counsel engagement)                  | TBD           | Compliance officer + ext counsel |
| PFC-03  | Bedrock In-Region 再 verify   | AI 管理者              | ⏸ Pending   | 0 / 5               | (TBD - Bedrock model card archive + sandbox sustain test)    | TBD           | AI 管理者 + SRE                |
| PFC-04  | Computer Use isolation        | AI 管理者 + 開発者     | ⏸ Pending   | 0 / 6               | (TBD - 3 case 並走 demo + injection attack 5 scenario)        | TBD           | Security + AI 管理者           |
| PFC-05  | Network Firewall TLS insp     | Network team + Sec     | ⏸ Pending   | 0 / 5               | (TBD - Private CA + sandbox block log)                       | TBD           | Security + Network team        |
| PFC-06  | Warm pool Little's Law 実測   | SRE                    | ⏸ Pending   | 0 / 5               | (TBD - 1hr sustain × 3 scenario + burst test)                | TBD           | SRE + AI 管理者                |
| PFC-07  | Token cost re-estimate        | AI 管理者 + Cost team  | ⏸ Pending   | 0 / 5               | (TBD - 10 sample invocation + cost calc + 経営 approval)     | TBD           | AI 管理者 + Cost team + **経営層** |

**Evidence pointer format** (owner update 時):
- 内部 URL: Confluence / SharePoint / Google Drive path
- PDF: 内部 storage path + SHA-256 hash
- Log location: CloudWatch Logs group / S3 path

**Status enum**: `⏸ Pending` / `🔄 In-progress` / `⚠ Blocked` / `✅ Signed-off`。`⚠ Blocked` の場合は §7 risk register に row 追加。

---

## 6. Type B 設定承認 agenda template (PFC-01 deliverable の一部)

Type B 設定承認 session 用 agenda template。PFC-01 完了時に本 doc §5 evidence binder からこの template を populate。

```markdown
# Backoffice AI v2 — Phase 1 Type B 設定承認 Session Agenda

**Date**: <yyyy-mm-dd>
**Approver**: 経営層 (CXO / Risk Committee)
**Co-approver**: Security 関係者 + 業務責任者 + AI 管理者
**Hand-off package**: DOC-CA-08 v<X> / DOC-DM-07 v<Y> / DOC-PFC-09 v<Z> / DOC-TM-10 v<A> / DOC-SRE-11 v<B> / DOC-CEM-12 v<C>

## 1. Executive summary (1 page、~5 min)
- Phase 1 scope: UC-BO-01 法人住所変更 (single tenant, Supervised tier only)
- Region: us-east-1 primary + us-west-2 DR
- Regulatory framework: NYDFS Part 500 + FRB SR 11-7 + OCC + BSA-AML + OFAC + GLBA + SOX + State (operating state finalize 済)
- Pre-flight 7 項 全 sign-off ✅
- Phase 1 cost: 実測 $<X>k / 月 (low) / $<Y>k / 月 (mid) / $<Z>k / 月 (high)

## 2. Pre-flight evidence walkthrough (~20 min)
- PFC-01 ~ PFC-07 evidence binder review (DOC-PFC-09 §5)

## 3. Compliance officer + external counsel opinion (~15 min)
- DOC-CEM-12 walk-through + counsel final opinion letter highlights

## 4. Threat model walk-through (~10 min)
- DOC-TM-10 critical scenarios (Computer Use prompt injection / insider / supply chain / key compromise)
- mitigation コミット

## 5. SRE readiness + operational runbook (~10 min)
- DOC-SRE-11 SLO / alert / on-call / postmortem template
- DR drill plan (quarterly)

## 6. Decision (~5 min)
- ✅ Approve Phase 1 ops 開始
- ❌ Reject + findings (要追加 work)
- ⏸ Conditional approve (条件付き、特定 finding 解消後再 review)

## 7. Sign-off
- 経営層: ____________________  Date: __________
- Security 関係者: ____________________  Date: __________
- 業務責任者: ____________________  Date: __________
- AI 管理者: ____________________  Date: __________
```

---

## 7. Risk register (PFC 実行中の blocker)

各 PFC が `⚠ Blocked` になった場合、本 §7 に row 追加:

| ID    | Blocking PFC  | Risk description | Mitigation owner | Mitigation deadline | Status |
| ----- | ------------- | ---------------- | ---------------- | ------------------- | ------ |
| (TBD) | (TBD)         | (TBD)            | (TBD)            | (TBD)               | (TBD)  |

**Pre-anticipated risks** (initial population、本 doc 起稿時点):

| ID  | Blocking PFC | Risk description                                                                                                | Mitigation owner       | Mitigation deadline       |
| --- | ------------ | --------------------------------------------------------------------------------------------------------------- | ---------------------- | ------------------------- |
| RR1 | PFC-02       | Counsel finding で 設計変更 要求 (例: NYDFS 500.15 暗号化要件で row-level encryption 必須化)                       | AI 管理者 + Compliance | Counsel finding 通知 +14 day |
| RR2 | PFC-03       | Phase 1 着手時点で Bedrock model card status が変動 (In-Region: No に regression)                                | AI 管理者              | Phase 1 着手 -7 day        |
| RR3 | PFC-04       | Prompt injection 4 段防御の特定段が attack scenario で bypass (再設計必要)                                       | Security + AI 管理者   | Attack scenario 検出 +21 day |
| RR4 | PFC-05       | AWS Network Firewall TLS inspection が Playwright + Chromium で interoperability 問題発生                        | Network team           | 検出 +14 day               |
| RR5 | PFC-06       | Warm pool 実測値が試算より大幅高 (= cost 上振れ)                                                                | SRE + Cost team        | 実測完了 +7 day            |
| RR6 | PFC-07       | 実測 token cost が試算より高く 経営層 budget 超過、Phase 1 scope 削減 or budget increase 判断                    | 経営層                 | Cost approval session     |
| RR7 | PFC-02       | Counsel firm 選定遅延 (lead time 60-90 day) で Phase 1 着手 deadline 圧迫                                       | Compliance officer     | Phase 1 -90 day 開始       |

---

## 8. 関連文書 + 出典

- **DOC-CA-08** (`docs/08-cloud-architecture.md` v2.3.2+、§16 inline 7 項の hoist source)
- **DOC-DM-07** (`docs/07-data-model.md` v1.6.2+、persistence foundation)
- **DOC-TM-10** (`docs/10-threat-model.md`、autonomous loop Cycle 2 起稿予定、PFC-04 prompt injection scenario の SSOT)
- **DOC-SRE-11** (`docs/11-sre-runbook.md`、Cycle 3 起稿予定、PFC-06 warm pool SLO の SSOT)
- **DOC-CEM-12** (`docs/12-compliance-evidence-matrix.md`、Cycle 4 起稿予定、PFC-02 counsel review の input doc)
- **DOC-CA-08 §16** 元 inline 7 項 (本 doc が hoist + 拡張)
- **DOC-CA-08 §17** open question #21-#29 (PFC-02 / PFC-03 / 業務 system 接続経路 等の defer 項目)
- **DOC-CA-08 §18** risk R12-R14 (US 規制 verify 未完 / 業務 system 接続経路 / JP parent layer)

---

## 9. 後続 PR / TODO

1. ✅ **完了 (本 doc 起稿、autonomous prod-ready loop Cycle 1)** — DOC-PFC-09 v0.1 起稿、CA-08 §16 inline 7 項を hoist + RACI / acceptance / 証跡 / 工数 / sign-off 拡張
2. **DOC-CA-08 §16 update** — inline 7 項を本 doc への pointer に compress (Cycle 9 integration sweep で実施)
3. **DOC-ROOT-_SSOT row 追加** — DOC-PFC-09 row 追加 (Cycle 9)
4. **DOC-TM-10 起稿** (Cycle 2、本 doc PFC-04 で参照)
5. **DOC-SRE-11 起稿** (Cycle 3、本 doc PFC-06 で参照)
6. **DOC-CEM-12 起稿** (Cycle 4、本 doc PFC-02 で参照、counsel review input doc)
7. **本 doc の段階的 update** — Phase 1 着手準備期間中 (M1 ~ M4) で owner が §5 evidence binder + §7 risk register を 継続 update
