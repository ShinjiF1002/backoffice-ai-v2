# Backoffice AI v2 — Cloud Architecture (Phase 1 hand-off Draft、v2.6 current lock)

> **Status (v2.6 current、autonomous prod-ready loop Cycle 1-12 完了)**: Phase 1 hand-off Draft、**US deploy 前提 (JP 銀行 America division、us-east-1 + us-west-2)**。`docs/07-data-model.md` (DM-07 v1.7.2) を persistence foundation として参照、上位 8 層 + Security / DR / Cost / ADR + FinOps governance + Tenant lifecycle + Bedrock Geo CRIS (v2.5 P0-V) + Geo CRIS cost deep dive (v2.6) を本 doc で SSOT 化。Production-ready ではない、§16 pre-flight が prerequisite。
> **v2.0 → v2.5 pivot 概要**: v1.0-v1.3 (Tokyo + Osaka 前提) から us-east-1 + us-west-2 に pivot、規制 framework は FISC + 個情法 + 銀行法 + 犯収法 → **NYDFS Part 500 + FRB SR 11-7 + OCC SR 11-7 + BSA-AML + OFAC + GLBA Reg P + FFIEC AIO + State law (NY SHIELD / CCPA-CPRA / VA / CO / CT / UT)** に swap。**v2.0-v2.4 までは「Sonnet 4.6 / Haiku 4.5 共に us-east-1 + us-west-2 で In-Region: Yes」前提だったが、v2.5 P0-V (autonomous prod-ready loop Cycle 8.5) で AWS 公式 model card primary source 再 verify により Sonnet 4.6 = 両 region 共に In-Region: NO + Haiku 4.5 = us-east-1 のみ In-Region: YES が判明、ADR-4 v2.5 で Geo CRIS (`us.anthropic.*`) default 採用に active rewrite**。v1.2 ADR-4 3 択 gate は v2.0 で claim closure → v2.2 historical demotion → v2.5 で誤前提として再 open + Geo CRIS active rewrite (ADR-4.HIST-V2.5 + ADR-4.HIST に二重 archive)。JP parent (本店) への報告 / cross-border data flow は別 doc (DOC-CA-09 candidate、本 doc scope 外)。

| 項目            | 値                                                                                                                                                                                                                                                                            |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 文書 ID         | DOC-CA-08                                                                                                                                                                                                                                                                     |
| 文書名          | Cloud Architecture (8 層 + Security + DR + Cost + ADR、AWS us-east-1 + us-west-2、current v2.6 lock for JP 銀行 America division)                                                                                                                                         |
| 版数            | v2.6 (autonomous prod-ready loop Cycle 11 FinOps angle pivot: §14.6.7 Bedrock Geo CRIS cross-region data transfer cost deep dive 5 subsection 追加 — pricing model + Phase 1 budget re-estimate (Geo CRIS overhead $0-$500/mo safety margin) + cost recovery scenario (In-Region GA 達成時) + per-Geo CRIS routing analytics Athena query + PFC-07 Geo CRIS-specific acceptance criteria 強化) |
| ステータス      | Phase 1 hand-off Draft (current v2.6 lock、§16 pre-flight 7 項 + §0.1 governance 参照、ADR-4 v2.2 historical demotion 完了、JP parent layer は scope 外)                                                                                                                |
| オーナー        | backoffice-ai-v2 maintainer (AI 管理者 + Security 関係者 + 業務責任者 + Network team 合議想定)                                                                                                                                                                                |
| 承認者          | 設定承認 Type B (Security-impacting、外部接続 + IAM + 鍵管理 + Computer Use sandbox + network egress を含む) + Type C (Trust Level 進化に伴う compute concurrency 拡大を schema 上で表現するため、業務責任者 co-A)                                                            |
| 閲覧対象        | Internal / Project team / Phase 1 implementation team / Security 関係者 / Compliance 関係者 / Network team / SRE team                                                                                                                                                         |
| 機密区分        | Internal                                                                                                                                                                                                                                                                      |
| 関連文書        | **DOC-DM-07 (persistence foundation、最重要 dependency)**, DOC-OV-00 §2.2 (接続層 4 tier), DOC-FW-01 (Flywheel), DOC-APP-02 (3 層承認 / Matrix C / §9.8 Role × 画面), DOC-UI-03 §4 (9 画面 + AiProposalPanel), DOC-KNW-04 §8 (audit event), DOC-MON-05, DOC-ROOT-\_SSOT      |
| SSOT 区分       | Cloud architecture (8 層 + Security + DR + Cost) + ADR (主要 architectural decisions の rationale + alternatives + trade-off) + Phase 1 hand-off pre-flight checklist の SSOT。Persistence layer (Aurora / S3 / KMS / OpenSearch) の SSOT は DM-07、本 doc は pointer のみ    |
| Evidence Status | 設計のみ。Phase 1 で (a) sample workload で end-to-end latency / cost 実測 (us-east-1 base)、(b) **us-east-1 + us-west-2 DR failover drill** (~3,900km distance impact on Aurora Global DB RPO)、(c) Computer Use sandbox の per-case isolation 検証、(d) Bedrock Claude In-Region availability primary source verify (us-east-1 / us-west-2) + rate limit 確認、(e) **NYDFS Part 500 + FRB SR 11-7 + OCC + BSA-AML + OFAC + GLBA Reg P + State law (NY SHIELD / CCPA-CPRA 等)** の AWS service mapping 逐条 review (external counsel + Compliance officer) |
| 改版履歴        | v1.0 (2026-05-24): 初版作成 (Plan v1.6 stub に従い doc 起稿前に plan 反映済、DM-07 v1.5 §Plan-First 違反 record の learning を予防適用)。v1.1 (2026-05-24): External critic round 1 で 12 critical finding (4 Fail + 8 Concern) + 3 prerequisite (P1 Fail 全 fix / P2 pre-flight 7 項に拡張 / P3 ADR-9 ~ ADR-13 起稿) 全件反映 (§2.5 patch trace)。主要修正: (a) §4 Identity: MFA を IdP 側集約 + 高権限 role に WebAuthn 必須 + rotating refresh token + Auditor permission boundary (F1/F2/F3)、(b) §5 Network: TLS inspection + 多段 Computer Use egress 防御 + VPC endpoint 6 個追加 + CIDR /22 再 sizing (F4/F5/F6)、(c) §6 Compute: Step Functions audit_event idempotency + Warm pool Little's Law 再 sizing 2→5 + Computer Use token cost re-estimate (F7/F8/F9)、(d) §7 AI Runtime: **Computer Use prompt injection 4 段防御** + Model cutover canary/rollback SOP (F10/F11、primary risk closure)、(e) §8 Integration: WebSocket connection registry + DMS query proxy audit (F12/F13)、(f) §10 + §12: **Bedrock invocation log cross-account immutability** + Firehose 60sec buffer + Kinesis 2 経路 + SCP 4 件追加 (F14/F15/F19)、(g) §9: CDK structural diff + Squawk linter + escape hatch (F16/F17)、(h) §11: BFF-mediated Cognito + CSRF double-submit (F18)、(i) §15: Cognito DR session continuity (employee_ref-based) + 国際送金 SWIFT window SOP (F20/F21)、(j) §14: VPC endpoint + cross-AZ + inter-region cost 再計算 (F22)、(k) §13: ADR-9 ~ ADR-13 起稿 (audit immutability / KMS / RDS Proxy / Computer Use sandbox / WAF strategy)、(l) §16 pre-flight 4 → 7 項に拡張、§17 open question #15-#18 追加。v2.1 (2026-05-24、v2.0 apply failure cleanup): v2.0 完了報告後の user Decision Brief で **active stale 25 件残存** 検出 (5th consecutive apply failure on region/regulatory consistency axis、`feedback_verify_negative_pattern_default` literal violation 継続)。user methodology「broad grep → 全件分類 → targeted patch」を採用、(1) DOC-CA-08 §1.1 #4 / §1.3 / §3.1 / §3.3 / §4 MFA / §7.2 cmt / §8.4 DMS audit / §11.1 + §13.1 WAF / §12.4 Bedrock log retention / §15.2 + §15.3 + §15.4 DR / §16 #2-#3 / §17 #11 + #16 + #19 / §18 R3+R4+R10 / §20 #4-#5、(2) DM-07 §3.1 tenant entity region example / §7.1 stack table / §7.2 ASCII diagram、(3) _SSOT.md row mixed-version + cost reference を all targeted-patch 化。v2.0 (2026-05-24): **US pivot** — user 新情報「US リージョン deploy + JP 銀行 America division」で v1.0-v1.3 (Tokyo + Osaka 前提) の core premise が pivot。Plan v1.7 で承認 (A) Full v2.0 US pivot + (α) US standalone + (iii) State-level も含む完全 mapping。主要 rewrite: (a) §0 header / §0.1 governance / §1 scope を US deploy + JP parent scope 外 に rewrite、(b) §5 Network を us-east-1 + us-west-2 に rewrite (3 AZ each、VPC CIDR allocation 再構成)、(c) §7.1 + ADR-4 v2.0 で Bedrock Claude Sonnet 4.6 / Haiku 4.5 が us-east-1 + us-west-2 で In-Region: Yes 標準、v1.2 3 択 gate を Option A trivially closure、(d) §12.1 SCP を US 規制 (NYDFS 500 / FRB SR 11-7 / OCC / BSA-AML / OFAC / GLBA / State) に rewrite、(e) §13 ADR-2 を us-east-1 + us-west-2 region pair に rewrite、ADR-4 を US in-region に simplify、(f) §14 cost を US region pricing で再計算 (us-east-1 が Tokyo より ~10-15% 安、ただし inter-region $0.02/GB は Tokyo↔Osaka より安価)、(g) §15 DR を us-east-1 + us-west-2 pair (~3,900km distance impact) に rewrite、(h) §17 open question + §18 risks を US 規制 + JP parent layer separation で rewrite、(i) §19 reference を AWS Bedrock US model card + NYDFS / FRB SR 11-7 / OCC / BSA-AML / OFAC / GLBA / State law primary source URL に swap、(j) §20 TODO を US pivot reflect、(k) DM-07 v1.4 (§6.1 + §9.4 US regulatory mapping) との sync 完了。v1.0-v1.3 は historical archive として §2 patch trace に保存 (削除しない)。v1.3 (2026-05-24): v1.2 完了報告 "active claim 0" は不正確、user Decision Brief R5 で 6 + 1 active in-region claim 残存検出 → 全件 fix (§2.8 patch trace、3rd consecutive apply failure on same axis を honest 記録 + memory footnote candidate)。v1.2 (2026-05-24): user Decision Brief で **P0 ADR-4 Bedrock in-region 前提が AWS 公式 model card と衝突** (Claude Sonnet 4.6 / Haiku 4.5 は ap-northeast-1 で In-Region: No / Global: Yes、primary source = AWS Bedrock model card) + P1/P2 governance stale + count揺れ 5 件 検出 + 全件 fix (§2.7 patch trace)。主要修正: (a) **ADR-4 全面 rewrite** → 3 択 (Option A in-region downgrade / Option B Global routing + Type B + FISC carve-out / Option C 待機) を Phase 1 hand-off gate に格上げ、本 doc Bedrock 関連 SOP は暫定 (Option B 想定) として明示、(b) Bedrock Tokyo in-region 主張 7 箇所 (§1.4 / §2.2 #4 / §3.1 L4 / §3.3 L4 / §7.2 pseudo-code / ADR-4 / §16 pre-flight #3) を全件 honest 表現に rewrite、(c) §0.1 / §20 governance stale を done-mark 化 (Plan v1.6.1 / _SSOT.md row / external critic 完了反映)、(d) header `§2.9 pre-flight 4 項` → `§16 pre-flight 7 項` 訂正、(e) `ADR (8 件)` → `ADR (13 件)` 訂正、(f) §17 open question #19 (個情法 27 条 第三者提供) + #20 (Cross-region inference 物理経路) 追加、(g) §18 R11 (Bedrock In-Region 不在 data residency risk) 追加、(h) Plan v1.6.1 内 `~2,300 行` → 実測 1,251 行 訂正は別途 plan side patch。v2.2 (2026-05-24): ADR-4 v2.2 historical demotion — 旧 3 択 (Tokyo downgrade / Global carve-out / blocker) を Decision section から §ADR-4.HIST に降格、active Decision = us-east-1 + us-west-2 In-Region single choice に simplify。DM-07 §13/§16 FISC stale + §0.1 governance metadata sync 連動。v2.3 (2026-05-24): User Decision Brief で active stale 25 件残存検出 (5th apply failure on region/regulatory axis、broad grep + 全件分類 user methodology を採用) → DOC-CA-08 §1.1 #4 / §1.3 / §3.1 / §3.3 / §4 MFA / §7.2 cmt / §8.4 / §11.1 / §13.1 / §12.4 / §15.2 / §15.3 / §15.4 / §16 #2-#3 / §17 #11+#16+#19 / §18 R3+R4+R10 / §20 #4-#5 + DM-07 §3.1 / §7.1 / §7.2 ASCII + _SSOT.md row 全件 US pivot 反映、加えて DM-07 v1.5 で §13/§16 active FISC 修正。v2.3.1 (2026-05-24): User Decision Brief で 5 finding (P1 4 + P2 +1 AlloyDB) 検出 → DOC-CA-08 §0.1 + §20 + ADR-4 historical demotion structural change、DM-07 §0.1 governance + AlloyDB row sync。後続 user Decision Brief で metadata normalization patch (P1 5 + P2 ~40 lines) を `introduced in vX.Y / current vX.Y.Z` provenance label に一括変換、改版履歴に v2.2/v2.3/v2.3.1 entry 追記、_SSOT row + Plan v1.7 後続 action と sync 完了。v2.3.2 (2026-05-24): P1 metadata sync — heading/status/scope summary + §3.1/§3.3 layer table + §7.5 SCP + §12.1 SCP + §14 cost row + §17 open question + §18 risk row + §19 reference + §20 TODO の `current v2.3.1` 残存箇所を全て `current v2.3.2` に bump、DM-07 reference v1.6.1 → v1.6.2 統一、改版履歴 v2.2/v2.3/v2.3.1 entry を本 entry まで継続。Plan v1.7 後続 action #2-#5 done-mark 同期、P2 batch: active `v1.4 US pivot` / `v2.0 US pivot` literal を `introduced in vX.Y / current vX.Y.Z` provenance label に統一 (active stale literal 0、provenance trace 完全保存)。**Gate 定義 update**: 「active stale = literal `v1.4 US pivot` / `v2.0 US pivot` 0」ではなく、「**introduced/current 形式付きであれば許容**」に gate semantic を明示化 (`v1.4 US pivot` 単独は P1 stale、`introduced in v1.4 US pivot、current vX.Y.Z` は valid provenance label)。_SSOT.md v0.11 (header version は v0.11 keep、bump 不要) と sync 完了。**v2.4 (2026-05-25、autonomous prod-ready loop Cycle 7)**: §14.6 FinOps governance (AWS Budgets 4 tier + Savings Plan strategy + per-Lambda cost guardrail + Bedrock per-invocation Athena analytics + runaway scenario response + quarterly review cadence) + §14A Tenant onboarding/offboarding SOP (7 step + 6 step + 8 activity × 6 stakeholder RACI)。**v2.5 (2026-05-25、autonomous prod-ready loop Cycle 8.5 P0-V Bedrock primary source verify correction)**: AWS 公式 model card primary source 再 verify で Sonnet 4.6 = us-east-1/us-west-2 共に In-Region: NO + Geo CRIS のみ available、Haiku 4.5 = us-east-1 のみ In-Region: YES が判明、v2.0-v2.4 の前提が誤であることを発見、ADR-4 v2.5 で **Geo CRIS (`us.anthropic.*`) default 採用 + Haiku 4.5 us-east-1 In-Region direct + DR scenario Geo CRIS fallback** に active rewrite。§1.4 / §7.1 / §7.2 pseudo-code / §7.5 SCP (Allow `us.anthropic.*` + Deny `eu/jp/au/global.anthropic.*`) / §12.1 SCP table / §16 PFC #3 / §17 open question #30-#32 + §18 R1 + R11 reopen + §19.1 reference を全 active rewrite、ADR-4.HIST-V2.5 に v2.2 simplification text を historical archive (上記 v1.2 3 択 gate との二重 historical)。**Data residency 解釈** (US geography Geo CRIS が NYDFS / GLBA / state law data residency 要件を充足するか) は PFC-02 counsel sign-off に依存 (open question §17 #30 新規)、本 doc 単独で active decision lock 不可。**Phase 1 hand-off package** には本 doc + DM-07 + 4 NEW doc (PFC-09/TM-10/SRE-11/CEM-12) を bundle、counsel sign-off + 経営層 Type B 設定承認後 Phase 1 投入意思決定 |

---

## 0. 本 doc の読み方 (3 分要約)

- **対象**: backoffice-ai-v2 (UC-BO-01 法人住所変更 + UC-BO-02 口座開設書類完備 + UC-BO-IT-BOUNDARY 国際送金 restricted boundary) を Phase 1 で **AWS us-east-1 (Virginia) primary + us-west-2 (Oregon) DR** に展開するための full cloud architecture (JP 銀行 America division 運営)
- **DM-07 との関係**: DM-07 (current v1.7.2、v1.4 で US pivot 導入) は **persistence layer (Aurora PG 16 / S3 Object Lock / KMS / OpenSearch / pgvector) + US regulatory mapping** の SSOT。本 doc は **その上層 8 層** (Identity / Network / Compute / AI Runtime / Integration / Observability / CI-CD / Frontend) + 横断 layer (Security / DR / Cost) を SSOT 化
- **scope**: §3-§12 で 8 + 4 layer 設計、§13 で ADR (13 件、ADR-1 ~ ADR-13、v2.0 で ADR-2 + ADR-4 が US 前提に rewrite)、§14 cost (US region pricing)、§15 DR (us-east-1 + us-west-2)、§16 pre-flight 7 項、§17 open question (v2.0 で US 規制 + JP parent layer separation 追加)
- **out of scope**: (a) 業務システム (US locally operated and/or cross-region peering to JP 基幹勘定系、open question §17 #21) 側の internal arch、(b) US address verification provider (USPS API / HERE Maps / SmartyStreets) の specific 採用、(c) Day 11-22 UI 実装の component 設計、(d) Phase 2+ の Autonomous tier 拡張、(e) tenant onboarding ops SOP、(f) **JP parent (本店) への報告 / cross-border data flow / supervisory data submission** (別 doc DOC-CA-09 candidate、Phase 2 検討、本 v2.0 doc 完全 scope 外)
- **推奨 stack 結論先出し (v2.5 P0-V correction)**: AWS **us-east-1 (3 AZ、primary) + us-west-2 (DR、3 AZ)**、**Lambda + Fargate + Step Functions + Bedrock Claude Sonnet 4.6 via Geo CRIS `us.anthropic.*` (US geography routing、In-Region は両 region 共に unavailable) + Haiku 4.5 us-east-1 In-Region direct + Computer Use ECS sandbox + API Gateway + Cognito (federated to Entra ID) + CDK TypeScript + GitHub Actions → CodePipeline + Liquibase**。詳細 ADR §13 (ADR-4 v2.5 rewrite)
- **regulatory framework (introduced in v2.0、current v2.6)**: **Federal** (FRB SR 11-7 / OCC SR 11-7 + 2023-17 / FFIEC IT Examination Handbook + AIO Booklet / BSA-AML (FinCEN) + USA PATRIOT 326 CIP / OFAC sanctions / GLBA + Reg P / Safeguards Rule / SOX / CFPB) + **State** (NYDFS 23 NYCRR Part 500 / NY SHIELD Act / CCPA-CPRA / VA-CDPA / CO Privacy Act / CT Data Privacy Act / UT Consumer Privacy Act / IL BIPA / WA My Health My Data Act)。State 適用は実 operating state に依存、Phase 1 で external legal counsel が finalize
- **critique trace**: §2 に v1.0 → v1.3 (Tokyo + Osaka 前提、historical archive) + v2.0 US pivot trace + 後続 external critic 想定

### 0.1 Doc status + governance (DM-07 v1.5 learning 適用)

- **Plan 反映**: 本 doc 起稿**前**に `~/.claude/plans/ai-backoffice-ai-virtual-muffin.md` Plan v1.6 stub を反映 (L1056+)、Plan-First 違反 0 件で起稿開始 (DM-07 v1.5 §Plan-First 違反 record の learning「Long-running autonomous task は着手前に 1 line plan stub」を適用)
- **SSOT 接続 (introduced in v2.2、current v2.6)**: ✅ 完了 — `docs/_SSOT.md` **v0.11** に DOC-CA-08 row 追加済 (L57、US pivot 反映)、Plan **v1.7** で US pivot 承認 + Plan v1.6.1 で v1.1 lock done-mark 済 (~1,135 行)。本 doc §16 / §20 も同 PR で sync (DM-07 v1.3.2 governance metadata sync pattern の予防適用、v1.2 / v2.0 / v2.2 / v2.3.2 で継続実体化)
- **External critic (v1.2 で done-mark)**: ✅ 完了 — Round 1 で 12 critical finding (4 Fail + 8 Concern) + 3 prerequisite 全件 v1.1 で反映、加えて user Decision Brief で ADR-4 (Bedrock in-region) P0 を検出 → v1.2 で全件 fix、v2.0 で US pivot、v2.1 / v2.2 で active stale cleanup
- **想定 reader**: AI 管理者 + Security 関係者 + Network team + SRE team + Phase 1 implementation team。経営層向け summary は §0 + §13 ADR + §14 Cost
- **Pre-merge action**: 6 doc + HANDOFF + _SSOT は `feature/prod-ready-design-loop` branch で全 commit 済 (19 commits、worktree clean)。**Current state**: DM-07 v1.7.2 + DOC-CA-08 v2.6 + 4 NEW doc (PFC-09 v0.2 / TM-10 v0.1 / SRE-11 v0.1 / CEM-12 v0.2) + _SSOT.md v0.13 + Plan v1.7。**Remaining decision**: PR scope option ((a) rebase from baseline `09e1e76` / (b) PR-only branch を Day 22 commits 除外で切り直し) を user 選択後 main merge

---

## 1. 設計目的・前提・非目的

### 1.1 目的 (4 項)

1. **Flywheel 5 段 + 3 層承認を本番運用できる compute + integration plane を提供**: 案件受付 → AI 入力 → 入力者確認 → 承認者承認 → 反映 → AI 日次分析 → 手順承認 → compiled 反映 の loop が、cloud-native serverless / container で sub-minute SLA で回る
2. **接続 control matrix 4 tier (標準 API / 準標準 MQ / 代替 RPA Computer Use / 例外 DB) を物理的に実装**: DOC-OV-00 §2.2 / DOC-ROOT-\_SSOT §1.5 の logical matrix を AWS service mapping
3. **Computer Use / RPA tier の per-case sandbox を安全に運用**: 業務システム UI への browser 操作を 1 case = 1 ephemeral Fargate task で実行、screenshot stack + DOM trace を DM-07 `screenshot_stack` table に persist
4. **US 規制 framework を逐条充足する security baseline** (introduced in v2.0、current v2.6): NYDFS 23 NYCRR Part 500 + FRB SR 11-7 + OCC SR 11-7 + 2023-17 + FFIEC IT Examination Handbook + BSA-AML (FinCEN) + OFAC + GLBA + Reg P + Safeguards Rule + SOX + State law (NY SHIELD / CCPA-CPRA / 等)。SCP / VPC endpoints / KMS / WAF / GuardDuty / Macie / CloudTrail org-wide を default-on、root account でも tamper 不能な audit chain (DM-07 §9) と整合

### 1.2 前提 (本 doc が依存する v2 設計 + DM-07 の lock 事項)

| 前提                                                       | source                                                | 本 doc での扱い                                                                                                              |
| ---------------------------------------------------------- | ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Persistence layer (Aurora PG 16 / S3 / KMS / OpenSearch)   | DM-07 §7.2 + §8                                       | §7 で物理 wiring (VPC subnet 配置 + SG + endpoint 化)                                                                       |
| Audit event 15 行 + hash chain + S3 Object Lock streaming  | DM-07 §3.6 / §5.6 / §9                                | §10 observability + audit pipeline (Kinesis Firehose 5 min)                                                                |
| Role × 画面 access matrix (Phase 1 hand-off)               | DOC-APP-02 §9.8                                       | §4 Identity layer で Cognito + IAM Identity Center に展開                                                                   |
| 4-eyes SoD + 手順承認 SoD + Type A/B/C SoD                  | DM-07 §5.1 / §5.8 / §5.8.1                            | §6 Compute (Lambda / Fargate 内 application layer enforcement) + §10 audit-trail                                            |
| 接続層 4 tier (標準 / 準標準 / 代替 / 例外)                  | DOC-OV-00 §2.2 + DOC-ROOT-\_SSOT §1.5                 | §8 Integration layer で SQS / EventBridge / ECS Computer Use / DMS read endpoint へ mapping                                 |
| 過去案件不変 + 関連手順更新 Alert (3 適用範囲)              | DOC-FW-01 §6.3 + DOC-UI-03 §6                         | §6 Compute (Step Functions で同 transaction outbox 経由 EventBridge → Lambda fan-out)                                       |
| Citation = compiled (weight=high) only                      | DOC-FW-01 §3.5 + DM-07 §5.4                           | §7 AI Runtime で Bedrock Claude prompt 組立時に table join + weight filter を application-side enforce                       |
| restricted boundary (国際送金) は通常 loop 適用外           | workflows/international-transfer-boundary/ + DM-07 §3.4 | §6 Compute (`boundary_review_proposal` 専用 Step Functions、ad-hoc trigger のみ)                                            |
| KPI / KRI 仮閾値はすべて `[仮説 / 要検証]`                   | DOC-MON-05                                            | §10 Observability で CloudWatch dashboard label に `[仮説 / 要検証]` 必須                                                   |
| Prototype mode label                                       | DOC-UI-03 §8                                          | §11 Frontend hosting の static asset + env feature flag で production / staging を区別 (staging のみ表示)                   |

### 1.3 非目的 (本 doc で決定しない)

- 業務システム (基幹勘定系 / KYC system / 国土地理院 API) 側の internal architecture / data model (本 doc は **接続 contract と tier 配分のみ**)
- DM-07 で決定済みの persistence layer 詳細 (Aurora extension list / index 戦略 / partition / RLS policy / hash chain trigger)
- UI 実装の component 詳細 (Plan v1.4 Day 11-22 範囲)
- LLM fine-tune / RAG knowledge base index build pipeline (Phase 2+ scope、本 doc は serving + audit のみ)
- 多通貨 / 為替 rate fetch (国際送金 boundary 側の Phase 2+)
- Phase 2+ で Anthropic 直 API → Bedrock の cross-cloud egress を許可するか否か (本 doc は **Bedrock 経由 (ADR-4 v2.0 US in-region standard)** が default、Anthropic 直 API は cross-cloud egress として別問題)

### 1.4 用語注記

- **層 (Layer)**: §3 で 8 主層 + 4 横断層を定義。各層は独立 deploy 可能、依存関係は §3 dependency graph
- **AZ (introduced in v2.0、current v2.6)**: Availability Zone。us-east-1 (Virginia) は 6 AZ (a/b/c/d/e/f)、本 doc は a/b/c の 3 AZ 使用。us-west-2 (Oregon) は 4 AZ (a/b/c/d)、本 doc は a/b/c の 3 AZ 使用
- **Sandbox (Computer Use 文脈)**: 1 case = 1 ephemeral Fargate task。task 終了で全 process kill + ephemeral storage 破棄、screenshot/DOM のみ DM-07 `screenshot_stack` に永続化
- **In-region / Geo CRIS / Global CRIS の 3 inference option (introduced in v2.0、updated in v2.5 P0-V correction、autonomous loop Cycle 8.5)**: AWS Bedrock は 3 inference 方式を提供:
  - **In-Region**: 単一 region 内で完結 (strict compliance)
  - **Geo Cross-Region Inference (Geo CRIS)**: geography 内 (US/EU/JP/AU) で region 跨ぎ routing、data residency は geography 単位で保持
  - **Global CRIS**: world-wide 任意 region routing (data residency 制約 0)
- **本 doc current decision (v2.5)**: PII / customer data を扱う Bedrock invoke は **Geo CRIS (US geography) = `us.anthropic.*` inference profile** を default routing として採用、Sonnet 4.6 + Haiku 4.5 共通。SCP で `global.anthropic.*` Global routing は deny、`us.anthropic.*` Geo CRIS のみ allow。**Haiku 4.5 us-east-1 は In-Region: Yes も併用可能** (= 同 region 内完結が選好される個別 invoke で direct In-Region call)。詳細は **§7.1 + ADR-4 (v2.5 rewrite)** 参照。**Data residency 解釈** (Geo CRIS within US geography が NYDFS / GLBA / state law data residency 要件を充足するか) は **PFC-02 counsel review** で finalize (open question §17 #30)
- **Historical (v1.0-v2.4、本 doc 内で v2.5 までの誤前提として保存)**: v2.0-v2.4 では「us-east-1 + us-west-2 で Sonnet 4.6 / Haiku 4.5 共に In-Region: Yes」と claim していたが、v2.5 で AWS 公式 model card primary source 再 verify により **Sonnet 4.6 = us-east-1/us-west-2 共に In-Region: NO**、**Haiku 4.5 = us-east-1 のみ In-Region: YES** が判明、active decision は Geo CRIS default に rewrite。本 §1.4 v2.0-v2.4 statement は誤前提として historical archive、本 §1.4 v2.5 statement が active

---

## 2. 設計プロセス trace (v1 → critique loop)

本 §2 は internal review trace。読み飛ばし可。本文 §3 以降は v1.x lock 後の最終形のみ。

### 2.1 v1.0 draft (素朴 8 層)

最初に DM-07 を base にして 8 層 (Identity / Network / Compute / AI Runtime / Integration / Persistence-pointer / Observability / CI-CD) + 横断 layer (Security / DR / Cost / Frontend) を起こす。Computer Use / Bedrock / Cognito / IAM Identity Center / VPC endpoints / SCP を default-on、Phase 1 規模で動く最小構成。

### 2.2 Round 1 critique (Compute layer)

| # | Gap                                                                                                       | 解決                                                                                                                                                                                  |
| - | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 | Lambda concurrency limit (Phase 1 region default 1000) で AI 入力 burst (繁忙日 100 件/min × 8 step) は枯渇可能性 | Reserved concurrency を AI 入力 Lambda に 200 確保 + Provisioned concurrency 50 で cold start 排除、§6.2 で SOP 化                                                                       |
| 2 | Computer Use Fargate task の起動 latency (~30 sec) が Inbox SLA「同一セッション内」を超過                       | Fargate **warm pool** を 5 task 常駐 + Step Functions で task allocation、§6.5 で SOP                                                                                                  |
| 3 | Step Functions Standard workflow は 1 year max、AI 日次分析 batch には十分だが Express で sub-second cost を最適化 | AI 日次分析 = Standard (1 day window)、Case sync flow = Express (< 5 min)、§6.4 で workflow type 選定 table                                                                            |
| 4 | Bedrock Claude in-region (Tokyo) 利用可否 + concurrent invoke quota が Phase 1 必要量を満たすか未確認         | **v1.2 訂正**: 2025-Q4 時点 AWS 公式 model card で Claude Sonnet 4.6 / Haiku 4.5 は ap-northeast-1 で **In-Region: No / Global: Yes** と読める (primary source URL は §19.1)。よって v1.0 / v1.1 の「Tokyo in-region only」前提は誤り。Phase 1 hand-off 時に model card を再 verify、ADR-4 (v1.2) の 3 択 (in-region downgrade / Global carve-out / blocker) を user + Security 関係者で判断。quota は §17 open question #1 で別途         |
| 5 | Lambda → Aurora 接続で **per-invoke connection** は serverless v2 が pool しきれない (ACU 跨ぎで再 connect)    | RDS Proxy + IAM database authentication で Lambda 共通 pool、§6.2 で必須                                                                                                              |
| 6 | EventBridge → Step Functions → Lambda の fan-out で **at-most-once vs at-least-once** semantics が混在     | EventBridge は at-least-once default、Lambda 側は idempotency_registry (DM-07 §3.7) で deduplicate、§8.3 で SOP 統一                                                                  |

### 2.3 Round 2 critique (Security layer)

| # | Gap                                                                                                                                  | 解決                                                                                                                                                                                                                  |
| - | ------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 | Bedrock invoke の prompt + response が CloudWatch Logs に default で出る = PII / customer data の log leak risk                       | Bedrock invocation logging を S3 (KMS-encrypted, Object Lock optional) に redirect、CloudWatch Logs には metadata のみ (`bedrock_invocation_id` / `latency_ms` / `input_token_count` のみ)、§12.4 で SOP            |
| 2 | Computer Use Fargate task が browser で外部 web (業務 system 以外) に出られると data exfiltration path                                  | VPC egress を **SG + Network Firewall** で **業務 system FQDN allowlist** のみ、NAT GW なし、§5.4 で SOP                                                                                                              |
| 3 | IAM Identity Center → AWS IAM role assume で **session duration** が default 1 hour、Long-running Fargate task が中断              | Service-linked role + IAM role chain で task 自体は service role を使う、人間 user session 1 hour は keep (operations only)                                                                                            |
| 4 | Frontend (S3 + CloudFront) からの API call で **CORS + WAF + auth** の 3 重防御が漏れる                                                | API Gateway HTTP API + Cognito JWT authorizer + AWS WAF (managed rules + rate limit) + CORS strict origin、§11.3 で SOP                                                                                                |
| 5 | KMS key の **multi-Region key replication** が Tokyo → Osaka で auto sync、ただし **policy** は手動 sync 必要                            | CDK で KMS key policy を both region に **同 JSON で apply**、CI で `aws kms describe-key` diff を gate、§5.5 で SOP                                                                                                  |
| 6 | Secrets Manager rotation Lambda 自体が **業務 system credential を一時取得** = Lambda execution role の権限肥大                       | Secrets Manager rotation は **dedicated rotation Lambda + 専用 role** (権限 = 当該 secret rotate only)、application Lambda は read-only IAM database auth (短命 token)、§12.3 で SOP                                  |
| 7 | Computer Use の screenshot stack に **顧客 PII が映る** が S3 暗号化のみで encryption-at-rest、**転送中** は Fargate → S3 internal も TLS 必須 | S3 VPC endpoint (Gateway 型) + bucket policy で `aws:SecureTransport=true` 必須、§5.4 で enforcement                                                                                                                  |

### 2.4 Round 3 critique (Cost + DR)

| # | Gap                                                                                                                       | 解決                                                                                                                                                                                                                                       |
| - | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1 | Phase 1 cost 試算で **Bedrock token cost が dominant variable** だが case 件数想定が ambiguous                              | §14 で 3 scenario (low: 50 case/day / mid: 300 / high: 1000) を試算、breakeven 分析を §14.4 で                                                                                                                                              |
| 2 | Computer Use Fargate **warm pool 5 task 常駐** = 月 ~$300、Phase 1 case 件数次第で over-provisioned                       | Phase 1 開始 warm pool = 2 task、CloudWatch alarm で queue depth > 10 → Auto Scaling で +3、§6.5 で adaptive policy                                                                                                                       |
| 3 | DR の **Tokyo Region 障害 → Osaka manual failover** が ~30 min RTO、case 処理中 case の handling SOP 不在                  | §15.3 で「DR 発動時 in-flight case を pause → Osaka で resume」SOP 化、application 側で `case_record.status='dr_paused'` 一時 state を追加 (DM-07 §3.3 case state 拡張 candidate、Phase 1 で確定)                                          |
| 4 | Aurora Global DB の **secondary region は read-only**、DR 時 promote まで write 不能 = 30 min RTO の主要因                | Phase 2 で **Aurora DSQL** (multi-region active-active、Q4 2025 GA) 評価、Phase 1 は Global DB + Route 53 health check failover、§15.2 で trade-off                                                                                       |
| 5 | Bedrock model **Tokyo region availability** が Anthropic model version 進化 (Sonnet 4.6 → 4.7 → 4.8) に遅延                | Bedrock model version pin (DM-07 §3.2 `agent_model_config_version`) + 新 model GA 時に Tokyo availability 確認 → Type B 設定承認 → cutover、§7.2 で SOP                                                                                  |
| 6 | CDK deploy が **Tokyo / Osaka 両 region 同期** されない場合 DR drill 失敗、CI で gate                                       | CDK pipeline で **両 region に並列 deploy + cross-region drift check** を CI gate、§9.4 で SOP                                                                                                                                              |
| 7 | Cost anomaly detection が **per-tenant tag** されていない、multi-tenant Phase 2 で chargeback 不能                          | 全 resource に `Tenant=<tenant_id>` tag を CDK で必須付与、Tag Policy で enforce、Cost Explorer で per-tenant view、§14.5 で SOP                                                                                                          |

### 2.5 v1.0 lock 直後 (旧 history)

3 round internal critique 反映後、§3 以降が v1.0 lock 形。

### 2.6 v1.1 — External critic (JP banking cloud architect + FISC + Computer Use 実装視点) 反映 (12 finding 全件)

External critic で 12 critical finding (4 Fail + 8 Concern) + 3 prerequisite を取得、全件 v1.1 で反映:

| Finding | 観点                                       | 重大度 | Patch 適用先                                                     | 修正内容要約                                                                                                                              |
| ------- | ------------------------------------------ | ------ | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| F1      | MFA 担当層分離 + WebAuthn 高権限             | Concern | §4.2                                                            | IdP-side MFA、Cognito MFA OFF (double prompt 回避)、承認者 / 業務責任者 / AI 管理者 / Auditor に FIDO2/WebAuthn 必須、step-up trigger SOP |
| F2      | Refresh token TTL + rotating               | Fail   | §4.2                                                            | High-priv role refresh token = 8 hr (業務日内)、rotating refresh token enable、reuse 検知で全 session revoke + audit_event             |
| F3      | Auditor permission boundary                  | Concern | §4.4 + §12.1 SCP                                                | `AuditorPermissionBoundary` policy + SCP `sts:AssumeRole` deny で write role escalation 不能化                                          |
| F4      | Network Firewall TLS inspection             | Fail   | §5.3 全面書き換え                                                 | L4 (FQDN) + L7 (TLS inspection、Private CA) + Application (Playwright host-resolver + ECH 無効化) の 3 段、Computer Use egress 多段防御 |
| F5      | VPC endpoint 6 個追加 + NAT GW per-AZ        | Concern | §5.2 endpoint table                                              | STS / Bedrock Agents / CloudFormation / CodePipeline / Athena / Lambda control plane を追加、NAT GW per AZ 明示                         |
| F6      | VPC CIDR sizing /22 + allocation table       | Concern | §5.1                                                            | Private subnet /24 → /22、CIDR 全体 allocation 表 (prod/staging/dev/shared) を追加                                                       |
| F7      | Step Functions audit_event 冪等性           | Fail   | §6.4.1 新設                                                       | Transactional outbox + `(execution_id, state_name, attempt_token)` unique、Express + Standard 両対応                                      |
| F8      | Warm pool Little's Law re-sizing             | Concern | §6.3 + §6.3.1 新設                                                | warm pool 2 → 5 (Little's Law + Poisson P95)、Auto Scaling target 70%、queue depth > 3 で +2 (max 15)                                  |
| F9      | Computer Use token cost re-estimate         | Concern | §14.1 + §14.2                                                    | CU case = 40k token (image-heavy、Sonnet vision)、cost table 全体 +30-50%、Phase 1 high scenario ~$15k/月                              |
| **F10** | **Computer Use prompt injection 4 段防御**  | **Fail (primary)** | **§7.3.1 新設**                                          | **per-workflow action allowlist + pre-action confirmation gate + tenant cross-contamination check + screenshot redaction + Bedrock Guardrails** |
| F11     | Model cutover canary + rollback SOP          | Concern | §7.6 新設                                                         | canary 5% → promote → rollback → deprecation prep の 4 step、agent_version is_active + canary_traffic_pct 制御                          |
| F12     | WebSocket connection registry + CSRF         | Concern | §8.1.1 新設                                                       | DynamoDB connection_registry、per-tenant push routing、reconnect SOP、throttle                                                            |
| F13     | DMS query content audit via proxy             | Fail   | §8.4 全面書き換え                                                 | Query proxy Lambda 必須、SQL parse + customer_reference 抽出 + audit_event emit、ad-hoc SQL は break-glass のみ                          |
| **F14** | **Bedrock invocation log cross-account immutability** | **Fail** | **§12.4 全面書き換え**                              | **security account への cross-account write、Object Lock Compliance (root も bypass 不能)、KMS key cross-account grant**                  |
| F15     | Firehose 60sec + Kinesis Stream 2 経路       | Concern | §10.3                                                            | Buffer 5min → 60sec、Kinesis Data Streams 並行 retain (24hr) を 2 経路 verify source として確保                                          |
| F16     | CDK structural diff with normalization       | Concern | §9.4 + §9.4.1 新設                                                | `cdk synth` + region/AZ/ARN/KMS normalize → 0 diff gate、Liquibase 両 region 整合 SOP                                                    |
| F17     | Squawk linter + escape hatch                | Concern | §9.3                                                              | Squawk rule list 明示、`[liquibase-destructive-approved]` magic comment + contract phase のみ destructive 許可                            |
| **F18** | **BFF-mediated Cognito + CSRF double-submit** | **Concern (architectural)** | **§11.2 全面書き換え**                          | **Lambda@Edge auth-handler が token exchange + HttpOnly cookie set、SPA は token に直接 access 不可、X-Csrf-Token header + JWT.jti**     |
| F19     | SCP 4 件追加                                 | Concern | §12.1 SCP table                                                  | Cognito 改竄防御、`iam:CreateAccessKey` deny、`aws:SourceVpc` condition、KMS cross-region deny                                          |
| **F20** | **Cognito DR session continuity (employee_ref)** | **Fail** | **§15.3 全面書き換え**                                      | **両 region Cognito + Entra federation で employee_ref を SoD 識別子に、dr_approver_sub_snapshot snapshot、R10 矛盾解消**              |
| F21     | 国際送金 boundary SWIFT window SOP            | Concern | §15.1 RPO/RTO table + §17 #15                                    | DR 中 boundary operation 全停止 + manual operate channel、SWIFT 締切跨ぎ時 SOP                                                          |
| F22     | VPC endpoint cost 再計算 + cross-AZ + inter-region | Concern | §14.1 全面再計算                                            | Phase 1 total v1.0 $1,365 / $4,120 / $11,610 → v1.1 $1,900 / $5,700 / $15,000 に上方修正                                              |
| F23     | ADR-9 ~ ADR-13 新設                          | Concern | §13                                                              | Audit immutability / KMS 5 CMK / RDS Proxy + IAM auth / Computer Use Fargate ephemeral / WAF strategy を ADR 化、decision trace 完備    |

External critic prerequisite (P1/P2/P3):
- **P1**: F10 + F14 + F20 全 fix → v1.1 で完了
- **P2**: §16 pre-flight 4 項 → **7 項に拡張** (F4 + F8 + F9 を追加 prerequisite として)
- **P3**: ADR-9 ~ ADR-13 起稿 → v1.1 で完了

v1.1 で Phase 1 hand-off package bundle 可能性は **DM-07 v1.3.2 と同等の Phase 1 hand-off Draft 状態**に到達。Type B 設定承認の場で v1.0 の 3 fail finding (CU prompt injection / Bedrock log cross-account / DR session continuity) が阻却事由として指摘される risk は v1.1 で closure。

### 2.7 v1.2 — User Decision Brief 反映 (P0 ADR-4 Bedrock + P1/P2 governance + count揺れ)

v1.1 lock 後、user Decision Brief で **P0 ADR-4 architectural pillar 破綻** + P1/P2 hygiene 計 5 finding 検出、全件 v1.2 で fix:

| Finding | 観点                                                              | 重大度 | Patch 適用先                                                          | 修正内容要約                                                                                                                                                |
| ------- | ----------------------------------------------------------------- | ------ | --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **DB-v3-P0** | **Bedrock Tokyo in-region 前提が AWS 公式 model card と衝突**       | **P0 Fail** | **ADR-4 全面 rewrite + 7 active claim 修正**                       | **ADR-4 を 3 択 (Option A in-region downgrade / Option B Global + Type B + FISC carve-out / Option C 待機) に格上げ、Phase 1 hand-off gate 化。本 doc Bedrock 関連 SOP は Option 確定まで暫定 (Option B 想定)** |
| DB-v3-P1 | §0.1 / §20 governance stale (Plan / SSOT / external critic を未来 TODO 扱い) | P1     | §0.1 / §20                                                            | ✅ 完了マーク化、Plan v1.6.1 L1077-1100 / _SSOT.md v0.10 L57 / external critic round 1 完了を実体反映                                                       |
| DB-v3-P1 | header `§2.9 pre-flight 4 項` vs 実体 `§16 7 項`                  | P1     | Status note + §0 scope summary                                       | header / scope summary を `§16 pre-flight 7 項` に同期                                                                                                     |
| DB-v3-P2 | header `ADR (8 件)` vs 実体 13 ADR                                 | P2     | §0 scope summary                                                      | `ADR (13 件、ADR-1 ~ ADR-13)` に訂正                                                                                                                       |
| DB-v3-P2 | Plan v1.6.1 内 `~2,300 行` 誤り (実測 1,101 行 / DOC-CA-08 = 1,251 行) | P2     | Plan v1.6.1 (別 file)                                                | Plan side で訂正、本 doc では §0.1 governance metadata sync の説明で実測値 1,101 + 1,251 を明示                                                              |

v1.2 で本 doc は **active claim 0 + governance metadata sync 完了 + ADR-4 architectural decision の Phase 1 hand-off gate 化** に到達。ADR-4 Option 確定までは本 doc を hand-off package に bundle するが、Type B 設定承認の場で Option 判断を含めて議論する setup。**しかし v1.2 完了報告の「active claim 0」は不正確** (user Decision Brief R5 で apply failure 検出)。

### 2.8 v1.3 — v1.2 apply failure 補正 (3rd consecutive failure on same axis、self-record)

v1.2 で「active in-region claim 0」と自己採点したが、user Decision Brief R5 で **6 + 1 件残存** を指摘。これは **3 round 連続で同一 axis (in-region 主張箇所の網羅検証) に apply failure 再発**:

| Round | 失敗内容                                                                                                | Memory 該当 |
| ----- | ------------------------------------------------------------------------------------------------------- | ----------- |
| R3 (DM-07 v1.3.1) | positive-enum grep が `workflow_version` 漏れ → memory 化 (`feedback_verify_negative_pattern_default`) | 命名 trigger 同 |
| R4 (DOC-CA-08 v1.2) | negative pattern を採用したが window が窄い (`Tokyo.{0,10}in-region`) → "Bedrock Claude (in-region)" 等が hit せず | 同 memory rule 違反 |
| R5 (DOC-CA-08 v1.2 → v1.3) | 同上 + `Evidence Status` / `推奨 stack 結論先出し` / `§7.1 heading` 等の non-pattern-matching context を verify scope から漏らした | **diagnosis-execution gap literal**: memory にあって直前 round で言及した rule を 30 秒 self-check できていない |

**Lesson 更新** (memory に footnote 追加 candidate):
- Negative pattern は **distance window を最小限に** (`Tokyo.{0,N}` の N を意図的に削る、`\bin-region\b` 単独 keyword で universe を最大化)
- 完了 verify で grep 結果が「現実 0 件」になることを確認した時、**目視で全 hit が historical / patch trace のみであることを別途確認** (mechanical 0 と semantic 0 は別)
- 同一 axis で 2 round 連続 apply failure を検出したら、**3rd round 着手前に memory を再 read** + **verify pattern を user 提示形に揃える** (本 round では user が `grep -nE 'in-region|in region'` を示してくれた = ground truth pattern)

v1.3 修正内容 (6 + 1 active claim):

| 行 | 修正前                                                              | 修正後                                                                                |
| -- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| L10 status | `§2.9 + §0.1 参照`                                                | `§16 pre-flight 7 項 + §0.1 governance 参照、ADR-4 v1.2 3 択 未確定` 追記           |
| L17 Evidence Status (d) | `Bedrock Claude in-region availability + rate limit`     | `ADR-4 v1.2 の 3 択 + 採用 model availability primary source verify`                |
| L28 推奨 stack | `Bedrock Claude (in-region)`                                    | `Bedrock Claude (model + region routing は ADR-4 v1.2 で Phase 1 確定)`             |
| L72 非目的 | `Bedrock in-region only が default`                                 | `Bedrock 経由 (ADR-4 v1.2 で確定) が default、Anthropic 直 API は別問題`             |
| L553 §7.1 heading | `Bedrock Claude in-region`                                  | `Bedrock Claude (model + region routing、ADR-4 v1.2 の 3 択)`                       |
| L555 §7.1 Region | `ap-northeast-1 (Tokyo) のみ、cross-region inference は SCP で deny` | Option A/B/C 別の region routing + SCP carve-out 条件を明記                       |
| L900 SCP table | `Deny bedrock:InvokeModel* outside ap-northeast-1` (無条件)        | `ADR-4 v1.2 Option A 採用時のみ enable、Option B carve-out、Option C 全 deny`       |
| _SSOT.md L57 | `Plan v1.6.1 で v1.1 lock を done-mark` (未来 tense) / `24 finding` | `Plan v1.6.1 done-mark 済 / DOC-CA-08 v1.3 lock 状態 / 30+ finding`                |

v1.3 で **active in-region claim 0 確認** (broader negative pattern `grep -nE 'in-region|cross-region inference'` で全 hit inspect、historical / ADR Option 説明 / SCP carve-out 明記 / cost 関連 inter-region 以外 0)。本 round で 3 連続 apply failure に区切り、user が示した verify pattern を default に採用。

---

## 3. アーキテクチャ全景 (8 主層 + 4 横断層、dependency graph)

### 3.1 12 層構成

| #   | 層                       | 主要 component                                                                                                | SSOT 章 |
| --- | ------------------------ | ------------------------------------------------------------------------------------------------------------ | ------- |
| L1  | Identity                 | AWS IAM Identity Center (engineers) / Cognito User Pool (end users, federated to Entra ID) / IAM roles      | §4      |
| L2  | Network                  | VPC (3 AZ us-east-1 + 3 AZ us-west-2) / Private subnet / VPC endpoints / Network Firewall / Transit Gateway  | §5      |
| L3  | Compute                  | Lambda (sync API + Step Functions tasks) / Fargate (Computer Use sandbox + long-running) / Step Functions    | §6      |
| L4  | AI Runtime               | Bedrock Claude Sonnet 4.6 via Geo CRIS `us.anthropic.claude-sonnet-4-6` (US geography routing、v2.5 P0-V active) + Haiku 4.5 us-east-1 In-Region direct + Geo CRIS DR fallback / Bedrock Knowledge Bases (Phase 2 候補) / Computer Use via Claude API | §7      |
| L5  | Integration              | API Gateway HTTP API / WebSocket / EventBridge / SQS / SNS / DMS read endpoint (例外 tier)                  | §8      |
| L6  | Persistence              | **= DM-07** (Aurora PG 16 Serverless v2 + S3 Object Lock + KMS + OpenSearch Serverless + pgvector)            | DM-07   |
| L7  | Observability            | CloudWatch (logs + metrics + alarms) / X-Ray / Container Insights / Audit pipeline (Kinesis Firehose → S3) | §10     |
| L8  | CI/CD + IaC              | GitHub Actions (CI) → CodePipeline (CD) / CDK TypeScript / Liquibase / CodeBuild / ECR                       | §9      |
| H1  | Security baseline (横断) | SCP / GuardDuty / Security Hub / Macie / WAF / VPC Flow Logs / CloudTrail org-wide                            | §12     |
| H2  | DR + Multi-region (横断) | Aurora Global DB / S3 CRR / Route 53 health check failover / CDK cross-region deploy                          | §15     |
| H3  | Cost (横断)              | Cost Explorer / Anomaly Detection / per-tenant tag / Reserved Capacity / Savings Plans                       | §14     |
| H4  | Frontend hosting         | S3 + CloudFront + WAF (9 画面 React SPA) / Cognito user pool integration                                      | §11     |

### 3.2 Dependency graph (ASCII)

```
       ┌────────────────────────────────────────────────────────────┐
       │  End User (入力者 / 承認者 / 業務責任者 / Manual 管理者)        │
       │  Engineer (AI 管理者 / SRE / Network / Security 関係者)         │
       └───────────────┬───────────────────────────┬────────────────┘
                       │ Cognito / Entra ID         │ IAM Identity Center / Entra ID
                       ▼                             ▼
       ┌─────────────────────────┐          ┌──────────────────┐
       │  H4 Frontend hosting     │          │  AWS Console / CLI │
       │  S3 + CloudFront + WAF   │          └──────┬───────────┘
       └────────────┬────────────┘                  │
                    │ HTTPS (JWT)                   │
                    ▼                               │
       ┌─────────────────────────────────────────────┼──────────┐
       │  L5 API Gateway HTTP + WebSocket            │          │
       └────────────┬────────────────────────────────┘          │
                    │                                            │
                    ▼                                            ▼
       ┌─────────────────────────┐         ┌──────────────────────────┐
       │  L3 Compute (Lambda /   │◄────────│  L1 IAM (role assume)     │
       │  Fargate / Step Fns)    │         └──────────────────────────┘
       └─────┬───┬───┬───────────┘
             │   │   │
             │   │   ▼
             │   │  ┌─────────────────────────────────────────┐
             │   │  │  L4 AI Runtime                           │
             │   │  │   - Bedrock Claude Sonnet 4.6 / Haiku    │
             │   │  │   - Bedrock Knowledge Bases (Phase 2)   │
             │   │  │   - Computer Use via Claude API + ECS   │
             │   │  └─────────────────────────────────────────┘
             │   │
             │   ▼
             │  ┌──────────────────────────────────────────────┐
             │  │  L5 Integration                              │
             │  │   - SQS (準標準 MQ tier)                     │
             │  │   - EventBridge (case state fan-out)         │
             │  │   - DMS read endpoint (例外 DB tier)        │
             │  │   - Network Firewall egress allowlist        │
             │  └────────────┬─────────────────────────────────┘
             │               │
             ▼               ▼
       ┌─────────────────────────────────────────────────────────┐
       │  L6 Persistence (= DM-07)                                │
       │   Aurora PG 16 Serverless v2 / S3 Object Lock / KMS     │
       │   OpenSearch Serverless / pgvector                       │
       └─────────────────────────────────────────────────────────┘

       ┌─────────────────────────────────────────────────────────┐
       │  L7 Observability + Audit (cross-cutting)                │
       │   CloudWatch / X-Ray / Audit pipeline (Kinesis Firehose) │
       └─────────────────────────────────────────────────────────┘

       ┌─────────────────────────────────────────────────────────┐
       │  L8 CI/CD + IaC + L2 Network (foundation)                │
       │   GitHub Actions → CodePipeline → CDK / Liquibase        │
       │   VPC + subnets + endpoints + Network Firewall            │
       └─────────────────────────────────────────────────────────┘

       Cross-cutting:
       - H1 Security baseline (SCP / GuardDuty / Security Hub / WAF / Macie)
       - H2 DR (Aurora Global DB / S3 CRR / Route 53 failover)
       - H3 Cost (Cost Explorer / per-tenant tag / Anomaly Detection)
```

### 3.3 Layer-by-layer 主要決定 summary

| 層        | 主要決定                                                                                              | ADR §    |
| --------- | ----------------------------------------------------------------------------------------------------- | -------- |
| L1 Identity | Cognito User Pool (end user) + IAM Identity Center (engineer)、両者 Entra ID federation               | §13 ADR-1 |
| L2 Network | VPC private subnet + VPC endpoints default-on、NAT GW は外部 API tier 限定                              | §13 ADR-2 |
| L3 Compute | Lambda (sync) + Fargate (Computer Use + long-running) + Step Functions (orchestration、Standard + Express) | §13 ADR-3 |
| L4 AI Runtime | Bedrock Claude Sonnet 4.6 via Geo CRIS `us.anthropic.*` (US geography routing、v2.5 P0-V) + Haiku 4.5 us-east-1 In-Region direct + Geo CRIS DR fallback、Anthropic 直 API は cross-cloud egress 禁止 (別問題) | §13 ADR-4 (v2.5 P0-V rewrite) |
| L5 Integration | API Gateway HTTP API + WebSocket、AppSync GraphQL は Phase 2 候補                                      | §13 ADR-5 |
| L7 Observability | CloudWatch + X-Ray default、Datadog は Phase 2 (banking standard) 候補                              | §13 ADR-6 |
| L8 CI/CD  | CDK TypeScript + GitHub Actions CI + CodePipeline CD + Liquibase                                       | §13 ADR-7 |
| H4 Frontend | S3 + CloudFront + WAF static SPA、Amplify Hosting 不採用                                              | §13 ADR-8 |

---

## 4. L1 Identity 層

### 4.1 2 系統の identity provider

| 系統                  | Provider                                  | Federation 元           | 対象 user                                                                       | Session                          |
| --------------------- | ----------------------------------------- | ----------------------- | ------------------------------------------------------------------------------- | -------------------------------- |
| **End user**          | Cognito User Pool                         | Entra ID (SAML 2.0)     | 入力者 / 承認者 / 業務責任者 / Manual 管理者 / AI 管理者 / Auditor              | 1 hour ID token + 30 day refresh |
| **Engineer / SRE**    | AWS IAM Identity Center                   | Entra ID (SAML 2.0)     | Phase 1 implementation team / SRE / Security 関係者 / Network team             | 1 hour session、踏み台経由        |

### 4.2 Cognito User Pool 設計

- **User Pool**: `backoffice-ai-v2-prod` / `backoffice-ai-v2-staging` (2 pool、env 分離)
- **Federation**: Entra ID SAML 2.0 IdP、attribute mapping (`email` / `displayName` / `employee_ref` (custom claim))
- **MFA 担当層分離 (F1)**: SAML federation の場合、MFA は **IdP (Entra ID Conditional Access) 側で完結**、Cognito 側 `MFAConfiguration=OFF` (double prompt 回避)。Entra Conditional Access policy で role-based step-up を強制
- **高権限 role の phishing-resistant MFA (F1、introduced in v2.0、current v2.6)**: 承認者 / 業務責任者 / AI 管理者 / Auditor は **FIDO2 / WebAuthn (Windows Hello for Business or hardware key) 必須**、TOTP / SMS は禁止。入力者は TOTP 許容 [仮説 / 要検証、**NYDFS 23 NYCRR Part 500.12 MFA 要件**と整合確認、open question §17 #16]
- **Step-up trigger (F1)**: 承認系 endpoint (`POST /case/{id}/approve`, `POST /config/approve`) は JWT `acr` claim を Lambda authorizer で検証、`urn:oasis:names:tc:SAML:2.0:ac:classes:Smartcard*` 系で無い場合 403 + IdP に step-up redirect
- **Token claims**: `sub` (Cognito user_id) → application 側で `user.user_id` (DM-07 §3.1) に投影、`custom:role_key_list` で current active role を JWT に embed、`custom:employee_ref` を SoD continuity 識別子として固定 (DR session continuity 用、§15.3 参照)
- **Token validation**: API Gateway HTTP API + Cognito JWT authorizer で全 endpoint 検証
- **Refresh token TTL の role 別分離 (F2)**: 入力者 = 30 day、承認者 / 業務責任者 / AI 管理者 / Auditor = **8 hour (業務日内 only)**、承認権限を持つ refresh token の盗難 window を最小化
- **Rotating refresh token enable (F2、Cognito 2024 GA)**: 1 refresh = old token immediate revoke、reuse 検知時 user 全 session revoke + `audit_event event_type='token_reuse_detected'` emit
- **Token revocation 即時性 (F2)**: 役割変更 (role_assignment update) / 退職 / SoD violation 発生時、`AdminGlobalSignOut` API + EventBridge fan-out で 60 sec 以内 全 active session 失効
- **Role 投影**: JWT claim → application 側で `role_assignment` table (DM-07) lookup → RLS context (`SET app.current_user_id`, `SET app.current_tenant_id`) を per-request 設定

### 4.3 IAM Identity Center 設計

- **Permission set**:
  - `SREAdmin` — full read + limited write (CDK deploy / CloudWatch / Aurora console read)
  - `SecurityReader` — Security Hub / GuardDuty / Macie / CloudTrail read only
  - `NetworkAdmin` — VPC / Route 53 / Network Firewall write
  - `AIAdminProduction` — Bedrock model invoke + agent_version write + Secrets Manager rotate
  - `Auditor` — CloudTrail / S3 audit bucket / Aurora read replica only
- **Account 構成 (AWS Organization)**:
  - `root-org` (billing only)
  - `security` (CloudTrail org trail bucket / Audit Lambda / Macie / Security Hub aggregator)
  - `audit-config` (DM-07 §9.2 exporter Lambda image digest 固定 bucket)
  - `prod` (Phase 1 deployment target)
  - `staging` (synthetic data)
  - `dev` (developer sandbox)
- **SCP** (Service Control Policy): §12.1 で詳述

### 4.4 RBAC actualization (DM-07 §3.1 + DOC-APP-02 §9.8 → AWS layer)

| Application role          | Cognito group        | IAM role (Lambda execution)                                | RLS context                                       |
| ------------------------- | -------------------- | ---------------------------------------------------------- | ------------------------------------------------- |
| 入力者                    | `InputOperator`      | `LambdaApp-InputOperator-Role`                             | `SET app.current_user_id; SET app.current_role='input_operator';` |
| 承認者                    | `BusinessApprover`   | `LambdaApp-BusinessApprover-Role`                          | 同上 (role: 'business_approver')                  |
| 業務責任者                | `BusinessOwner`      | `LambdaApp-BusinessOwner-Role`                             | 同上 (role: 'business_owner')                     |
| Manual 管理者             | `ManualAdmin`        | `LambdaApp-ManualAdmin-Role`                               | 同上 (role: 'manual_admin')                       |
| AI 管理者                 | `AIAdmin`            | `LambdaApp-AIAdmin-Role` + Bedrock invoke 権限               | 同上 (role: 'ai_admin')                           |
| Auditor                   | `Auditor`            | `LambdaApp-Auditor-Role` (read-only、Aurora read replica) + `AuditorPermissionBoundary` 必須 attach | 同上 (role: 'auditor')                            |

- **共通**: 全 Lambda は **RDS Proxy + IAM database authentication** (DM-07 §10.6) 経由、long-lived password 禁止
- **代理承認** (DM-07 §3.1 `role_assignment.delegation_of_user_id`): Cognito group は最新 active role のみ、過去 delegation は audit_event に trace
- **Auditor permission boundary (F3)**: 全 Auditor role に `arn:aws:iam::*:policy/AuditorPermissionBoundary` を CDK で必須 attach。boundary は `s3:Get*`, `s3:List*`, `rds-db:connect` (read replica endpoint のみ), `cloudtrail:LookupEvents`, `athena:StartQueryExecution` (audit Athena workgroup のみ) に限定、`s3:Put*`/`s3:Delete*`/`rds:*`/`kms:Decrypt` (audit CMK 以外) を deny。Auditor が write role を escalation 不能化 (SCP `sts:AssumeRole` deny も §12.1 で併用)

### 4.5 SoD enforcement の application layer 補強

DM-07 §5.1 / §5.8.1 / §5.4 の DB-level trigger に加えて、API Gateway → Lambda 段で **早期 reject** (短 path) を実施:

- 入力者確認 endpoint で `actor_user_id == case_record.business_approval_decision_id.actor_user_id` を Lambda 内で check、DB trigger に到達する前に 403
- Type A 設定承認 endpoint で `requested_by_user_id == approver_user_id` を JWT claim から detect、Lambda 内で 403
- 二重防御: DB trigger は最終防御線、application layer は UX + cost (早期 reject で Aurora invocation 削減)

---

## 5. L2 Network 層

### 5.1 VPC topology (us-east-1 primary、introduced in v2.0、current v2.6)

```
us-east-1 (Virginia)
└── VPC 10.10.0.0/16 (backoffice-v2-prod)
    ├── Public subnet 10.10.0.0/24 (us-east-1a) — NLB / NAT GW
    ├── Public subnet 10.10.1.0/24 (us-east-1b)
    ├── Public subnet 10.10.2.0/24 (us-east-1c)
    ├── Private subnet 10.10.16.0/22 (us-east-1a) — Lambda / Fargate (/22 = 1019 IP)
    ├── Private subnet 10.10.20.0/22 (us-east-1b)
    ├── Private subnet 10.10.24.0/22 (us-east-1c)
    ├── Isolated subnet 10.10.28.0/24 (us-east-1a) — Aurora PG 16 / OpenSearch
    ├── Isolated subnet 10.10.29.0/24 (us-east-1b)
    └── Isolated subnet 10.10.30.0/24 (us-east-1c)
```

us-west-2 (Oregon) は同 topology を `10.20.0.0/16` で deploy、Aurora Global DB secondary + S3 CRR target。

**Region selection rationale**:
- us-east-1 (Virginia): largest AWS region、Bedrock + all services availability 最大、JP 銀行 US ops は NY-based なら latency ~10ms
- us-west-2 (Oregon): DR pair として地理的分離 (~3,900km)、Bedrock 利用可、cost us-east-1 と同等
- 代替候補: us-east-2 (Ohio) primary + us-east-1 DR (FedRAMP-aligned posture が必要なら)、Phase 1 で finalize (open question §17 #22)

**Subnet sizing**: Private subnet `/22` (1019 IP) で Lambda ENI = (concurrent_execution × avg_eni_per_function) 想定 200 を支える。Isolated `/24` (Aurora ENI 限定)、Public `/24` (NAT GW のみ)。

**VPC CIDR 全体 allocation 表 (v2.0 US 前提)**:

| Environment           | CIDR              | 用途                                                      |
| --------------------- | ----------------- | --------------------------------------------------------- |
| us-east-1 prod        | `10.10.0.0/16`    | Phase 1 primary                                           |
| us-west-2 prod        | `10.20.0.0/16`    | Phase 1 DR                                                |
| us-east-1 staging     | `10.30.0.0/16`    | synthetic data                                            |
| us-west-2 staging     | `10.40.0.0/16`    | DR drill 用                                               |
| dev sandbox           | `10.100.0.0/16`   | developer 個別                                            |
| Shared services       | `10.0.0.0/16`     | Phase 2 reserve (Transit Gateway hub、Direct Connect 等) |

**JP 基幹接続が必要な場合 (open question §17 #21)**: Direct Connect (NY ↔ Tokyo POP) + VPC peering or Transit Gateway 経由で JP 基幹勘定系 read-only access、cross-border data processing agreement + Type B 設定承認 + Compliance review 必須

### 5.2 VPC endpoints (default-on)

外部 internet 経由を避けるため、以下を Interface / Gateway endpoint で privatize:

| Service              | Endpoint type | 用途                                                                       |
| -------------------- | ------------- | -------------------------------------------------------------------------- |
| S3                   | Gateway       | DM-07 §9 audit bucket / screenshot / input_artifact                       |
| DynamoDB             | Gateway       | (Phase 2 補助 cache 候補)                                                  |
| Bedrock Runtime      | Interface     | L4 AI Runtime invocation                                                   |
| Secrets Manager      | Interface     | DM-07 §10.6 secret retrieval                                              |
| KMS                  | Interface     | DM-07 §10.2 KMS encrypt/decrypt                                            |
| CloudWatch Logs      | Interface     | L7 logs                                                                    |
| EventBridge          | Interface     | L5 case state fan-out                                                      |
| Step Functions       | Interface     | L3 orchestration                                                           |
| SQS                  | Interface     | L5 準標準 MQ tier                                                          |
| ECS                  | Interface     | L3 Fargate task management                                                 |
| ECR                  | Interface     | L8 container image pull                                                    |
| Systems Manager      | Interface     | L8 parameter store / session manager (踏み台代替)                          |
| CloudWatch (metrics) | Interface     | L7 metrics PutMetricData                                                   |
| STS                  | Interface     | IAM role chain / Cognito identity (private resolution) — F5 追加          |
| Bedrock Agents       | Interface     | Phase 2 Knowledge Bases / Agent invoke — F5 追加                           |
| CloudFormation       | Interface     | CDK deploy (private) — F5 追加                                             |
| CodePipeline / CodeBuild | Interface | CD pipeline (private) — F5 追加                                            |
| Athena / Glue        | Interface     | DM-07 §9 audit query / S3 audit Athena — F5 追加                         |
| Lambda (control plane) | Interface   | Lambda invoke from Step Functions / cross-account — F5 追加                |

**NAT Gateway (F5 修正)**: AZ-a / AZ-c / AZ-d 各 1 個 = **計 3 個 per region**。route table per private subnet で **同 AZ NAT GW を優先 → AZ failure 時 cross-AZ traffic に degraded**。Cost optimization で 1 NAT GW 集約は Phase 1 で禁止 (AZ failure SPOF)。用途は **業務 system 以外の外部 API (国土地理院 API 等)** のみ。Network Firewall で FQDN allowlist。

### 5.3 Computer Use egress 多段防御 (Defense in Depth、F4 修正)

Network Firewall FQDN allowlist は **必要だが不十分** (TLS SNI 暗号化、ECH 進行)。以下 3 段で構築:

1. **L4 — Network Firewall stateful rule**: 業務 system FQDN (Phase 1 specific、open question §17 #2) のみ、443/tcp、それ以外 default deny。stateless で IP CIDR 直 deny (RFC1918 以外の private + AWS metadata 169.254.169.254)
2. **L7 — TLS inspection (Phase 1 必須)**: Network Firewall TLS inspection configuration を Fargate egress VPC に attach、AWS Certificate Manager Private CA で発行した CA cert を **Fargate task の OS trust store に inject** (task image build 時)、SNI + HTTP host header 両方を allowlist と照合
3. **Application — Playwright navigation hook**: chromium launch flag で `--host-resolver-rules` を業務 system FQDN → 既知 IP に固定、`--proxy-server` で **forward proxy (Squid in private subnet)** 経由のみ、新規 DNS lookup を browser から不能化

加えて **chromium ECH を明示無効化**: `--disable-features=EncryptedClientHello` を launch flag に固定、Type B 設定承認なしでの flag 変更を ECR image build CI で grep gate (Squawk と同 mechanism)。

その他 egress allowlist (Phase 1、Lambda / Step Functions 等の非 Computer Use):
- `*.gsi.go.jp` (国土地理院 API)
- `*.bedrock-runtime.us-east-1.amazonaws.com` + `*.bedrock-runtime.us-west-2.amazonaws.com` (Bedrock、ただし VPC endpoint で先に capture、introduced in v2.0、current v2.6)
- 業務 system FQDN (Phase 1 で具体特定)

Default deny、新 FQDN 追加は Type B 設定承認 + Network team review。Computer Use Fargate は専用 SG + Network Firewall rule で **業務 system 1 FQDN のみ** 許可、外部 web には絶対出ない (L4-L7-Application 3 段で enforce)。

### 5.4 業務 system 接続 path (4 tier)

| Tier             | Path                                                                                                                          | 監視                                |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| 標準 (API)       | Lambda (private subnet) → NAT GW or Direct Connect → 業務 system API                                                          | API Gateway log + CloudWatch metric |
| 準標準 (MQ)      | Lambda → SQS / EventBridge bridge → 業務 system MQ adapter                                                                    | SQS metric + DLQ alarm              |
| 代替 (Computer Use) | Fargate task (private subnet、専用 SG) → Network Firewall (業務 system 1 FQDN) → 業務 system UI                              | ECS task log + screenshot_stack S3  |
| 例外 (DB read-only) | DMS endpoint or AWS Database Migration Service → 業務 system DB read replica (read-only IAM)                                  | DMS event log + query log           |

`write` は **Type B 設定承認 必須** (DM-07 §3.7 `connection_attempt.write_authorized_by_config_approval_id`)。

### 5.5 KMS multi-Region key

- **CMK 配置 (introduced in v2.0、current v2.6)**: us-east-1 primary + us-west-2 replica (auto-replicate)、key policy は CDK で **両 region に同 JSON apply** (Round 2 critique #5)
- **CMK 用途別 separation**:
  - `cmk-aurora-prod` — Aurora storage encryption + column-level encryption data key
  - `cmk-s3-audit` — S3 Object Lock audit bucket
  - `cmk-s3-evidence` — input_artifact + screenshot_stack
  - `cmk-bedrock-log` — Bedrock invocation log
  - `cmk-secrets` — Secrets Manager
- **Rotation**: 年次 auto (AWS managed)、緊急時 manual rotation は Type B
- **CMK alias** で application から参照、ARN 直書き禁止

---

## 6. L3 Compute 層

### 6.1 Compute service 選定 matrix

| 用途                                                       | Service                            | 理由                                                                                       |
| ---------------------------------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------ |
| Sync API (REST / GraphQL Phase 2)                          | Lambda (Node.js 22 / Python 3.13)  | Cold start <100ms with Provisioned concurrency、Cognito JWT validation step                |
| AI 入力 batch (per case 8 step)                            | Step Functions Standard + Lambda   | 1 case ~30-60 sec、retry 制御 + step trace                                                 |
| AI 日次分析 (cron)                                         | Step Functions Standard + Lambda   | 1 run ~5-30 min、long-running tolerant                                                     |
| Computer Use (browser 操作)                                | **Fargate task** (per case 1 task) | Browser + Playwright + Claude API client、Lambda 15 min limit + container packaging で不適 |
| Embedding batch (snippet → pgvector)                        | Step Functions Express + Lambda   | < 1 min、Express で cost 最適化                                                            |
| OpenSearch index sync                                       | Lambda + DynamoDB Streams (Phase 2)| 軽量 sync                                                                                  |
| Materialized view refresh                                   | Step Functions + Aurora SQL Lambda | hourly cron                                                                                |
| Audit hash chain verify (quarterly)                         | Step Functions + ECS task          | full chain walk = long-running                                                             |

### 6.2 Lambda 設計 (sync API + workflow tasks)

- **Runtime**: Node.js 22 (frontend BFF) / Python 3.13 (AI orchestration)
- **Memory**: 1024 MB default、Bedrock invoke 系は 2048 MB (cold start improve)
- **Provisioned concurrency**: AI 入力 Lambda = 50、API GW handler = 20 (cold start 排除)
- **Reserved concurrency**: AI 入力 Lambda = 200 (burst 保護、繁忙日 100 件/min × 8 step を sustain)
- **Connection**: RDS Proxy + IAM database authentication (DM-07 §10.6)、long-lived password 禁止
- **Layer**: 共通 layer (Aurora client wrapper + RLS context setter + KMS decrypt helper + audit_event emitter)
- **Tracing**: X-Ray active、Bedrock invoke + Aurora query + S3 PutObject に segment

### 6.3 Fargate 設計 (Computer Use sandbox)

- **Task definition**:
  - Image: ECR (`backoffice-v2/computer-use:vX.Y.Z`、Playwright + Claude API client + chromium headful)
  - CPU: 1 vCPU、Memory: 2 GB
  - Network mode: `awsvpc` (専用 ENI、専用 SG)
  - Ephemeral storage: 20 GB (screenshot 一時保存)
- **Per-case isolation**:
  - 1 case = 1 ephemeral task、task 終了で全 process kill + ephemeral storage 破棄
  - Screenshot / DOM trace は task 内 sidecar が S3 (KMS-encrypted) に upload、DM-07 `screenshot_stack` row insert
  - Task 間で共有 disk なし、tenant data leak 防御
- **Warm pool (F8 修正、Little's Law re-sizing)**: Phase 1 開始 = **5 task** (旧 2 task は P95 burst を吸収不能で Inbox SLA 違反、計算根拠は §6.3.1)、Auto Scaling target = 70% utilization、queue depth > 3 で +2 (max 15)
- **Task scheduling**: Step Functions の `ECS RunTask` で per-case allocation、warm pool が full なら queue で待機

### 6.3.1 Warm pool sizing (Little's Law 適用、F8 根拠)

`avg_concurrent = arrival_rate × avg_service_time`、Phase 1 mid scenario:
- arrival_rate = 300 case/day × Computer Use 該当率 30% `[仮説 / 要検証]` / 8 hr 営業 = 11 case/hr = 0.18 /min
- avg_service_time = 1 min (UI step 8 + Claude invoke)
- avg_concurrent ≈ 0.18、P95 burst = 5 (Poisson 95th percentile)

→ warm pool **常駐 5 task** + Auto Scaling target = 70% utilization、queue depth > 3 で +2 (max 15)。v1.0 の 2 task は P95 burst を吸収できず最大 4 case で cold start → 30 sec 追加待機 → Inbox SLA 違反。Phase 1 sandbox で実測後 calibrate (open question §17 #8 と同期)。

### 6.4 Step Functions workflow 選定

| Workflow            | Type     | Duration | Use case                                                                       |
| ------------------- | -------- | -------- | ------------------------------------------------------------------------------ |
| Case AI 入力         | Standard | 1-2 min  | per case 8 step、retry + error handling + audit_event emit                     |
| AI 日次分析          | Standard | 5-30 min | staging snippet aggregate → procedure_proposal generate                        |
| Procedure approval flow | Standard | minutes  | propose → triage → forward → approve → publish (multi-day OK)                  |
| Config change approval | Standard | minutes-days | Type A/B/C co-A wait                                                          |
| Audit hash chain verify | Standard | 1-4 hour | quarterly drill                                                                |
| Embedding batch     | Express  | < 5 min  | snippet → Titan Embedding v2 → pgvector                                        |
| Case state fan-out  | Express  | < 1 min  | EventBridge → OpenSearch index + Lambda fan-out                                |

### 6.4.1 Step Functions retry × audit_event 冪等性 (F7 修正、Fail closure)

DM-07 §9 hash chain は append-only 設計のため `audit_event` の二重 insert は chain 整合性破壊。Step Functions Standard / Express の retry に対して **at-most-once** を保証する 2 path:

1. **Application transactional outbox (推奨)**: Lambda 内 SQL transaction で `audit_event` + `cdc_outbox.audit_event_outbox(execution_id, state_name, attempt_token)` を 1 transaction insert、`UNIQUE(execution_id, state_name, attempt_token)` で Step Functions retry を block。`attempt_token` は Step Functions の `$$.Execution.Name + $$.State.RetryCount` を Lambda 入力 payload に固定 (Task state `Parameters` で `"attemptToken.$": "States.Format('{}-{}',$$.Execution.Name, $$.State.RetryCount)"`)
2. **DynamoDB conditional write (alt)**: Step Functions Task → DynamoDB PutItem with `ConditionExpression="attribute_not_exists(pk)"` で先制 dedupe、success のみ Lambda invoke

Express workflow は **at-least-once が built-in**、application 側 dedupe 必須 (Standard 以上に厳格)。`idempotency_registry` (DM-07 §3.7) は **業務 system call 用** であり audit_event idempotency とは別 layer、混同しない。

### 6.5 Computer Use SOP

```
1. Inbox API receives case → case_record insert (DM-07 §3.3) → cdc_outbox.case_event_outbox
2. EventBridge → Step Functions (Case AI 入力)
3. Step Functions check: workflow が Computer Use tier か (workflow.connection_tier)
4. If yes: ECS RunTask (Fargate warm pool)
5. Fargate task:
   a. Claude API (via Bedrock) で screenshot + DOM 解析 + 次 action 決定
   b. Playwright で browser action 実行
   c. Step ごとに screenshot を S3 upload + screenshot_stack row insert
   d. connection_attempt row insert (artifact_hash 含む)
6. Task 完了 → Step Functions に return → AI 入力結果 generate → ai_proposal insert
7. EventBridge fan-out → Inbox UI update (WebSocket)
```

### 6.6 Concurrency / quota planning

| Resource                            | Default quota | Phase 1 ask    | Phase 2 想定 |
| ----------------------------------- | ------------- | -------------- | ------------ |
| Lambda concurrent execution (region) | 1000          | 2000 increase  | 5000+        |
| Fargate vCPU per region             | 1000          | 200 reserve    | 500+         |
| Bedrock Claude Sonnet TPM           | 4000          | 50000 increase | TBD          |
| Bedrock Claude Haiku TPM            | 8000          | 100000 increase | TBD          |
| EventBridge custom event /sec       | 10000         | default        | default      |
| Step Functions executions /sec      | 1500          | default        | 5000+        |

Phase 1 着手 1 month 前に **service quota increase 申請** (open question §17 #1)。

---

## 7. L4 AI Runtime 層

### 7.1 Bedrock Claude (v2.5 P0-V correction: Geo CRIS default + Haiku 4.5 us-east-1 In-Region)

**v2.5 corrected matrix (AWS 公式 model card primary source 2026-05、autonomous loop Cycle 8.5)**:

| Model           | us-east-1 In-Region | us-west-2 In-Region | Geo CRIS (`us.anthropic.*`)                        | Phase 1 usage default                                |
| --------------- | ------------------- | ------------------- | -------------------------------------------------- | ---------------------------------------------------- |
| Sonnet 4.6      | **❌ NO**           | **❌ NO**           | ✅ (routes us-east-1 / us-east-2 / us-west-2)      | **Geo CRIS only** (`us.anthropic.claude-sonnet-4-6`) |
| Haiku 4.5       | **✅ YES**          | **❌ NO**           | ✅ (routes us-east-1 / us-east-2 / us-west-2)      | **us-east-1 In-Region direct** (normal ops) + Geo CRIS (DR / us-west-2 routing) |

Primary source: [AWS Bedrock Claude Sonnet 4.6 model card](https://docs.aws.amazon.com/bedrock/latest/userguide/model-card-anthropic-claude-sonnet-4-6.html) + [AWS Bedrock Claude Haiku 4.5 model card](https://docs.aws.amazon.com/bedrock/latest/userguide/model-card-anthropic-claude-haiku-4-5.html)。

**v2.5 active decision**:
- **Region**: Primary inference region = us-east-1 (NY ops から ~10ms)、DR = us-west-2 (Aurora Global DB pair と一致)。両 region 内 invoke origin で Geo CRIS が us-east-1 / us-east-2 / us-west-2 内で routing
- **Geo CRIS data residency posture**: PII / customer data は **US geography (us-east-1 + us-east-2 + us-west-2) 内のみ流通**、外部 geography (EU / JP / AU / Global) には絶対出ない。SCP §12.1 + §7.5 で `us.anthropic.*` のみ allow + `global.anthropic.*` deny で enforce。**NYDFS Part 500.15 / GLBA / state law data residency 要件** が "US geography 単位" で充足するかは **PFC-02 counsel review** で finalize (open question §17 #30)
- **Model**:
  - **Claude Sonnet 4.6** (primary、AI 入力結果生成 / AI 日次分析 / proposal generation) → invoke は `us.anthropic.claude-sonnet-4-6` Geo CRIS のみ (us-east-1 / us-west-2 In-Region 不可)
  - **Claude Haiku 4.5** (secondary、軽量 task = embedding pre-process / confidence score 計算 / Alert classification) → primary ops は us-east-1 で `anthropic.claude-haiku-4-5-20251001-v1:0` In-Region direct invoke、DR scenario (us-east-1 不可) は `us.anthropic.claude-haiku-4-5-20251001-v1:0` Geo CRIS
  - Model 版数 pin は DM-07 §3.2 `agent_model_config_version.model_label`、変更は Type B 設定承認

**Implication (v2.0-v2.4 → v2.5 で前提変更)**:
- v2.0-v2.4 の「両 region In-Region: Yes」前提が誤、本 doc の関連記述 (旧 §7.1 / §7.5 SCP / ADR-4 v2.2 / §16 #3 / §18 R1) を v2.5 で全 active 修正、historical context は本 doc 内に保存
- Bedrock invocation log cross-account immutability (§12.4) は Geo CRIS でも variant region 単位で完結、Cycle 5 で起稿 §12.4 SOP は Geo CRIS でも有効 (per-region invocation log を audit account に集約)
- Cost model (§14.1): Geo CRIS は cross-region invocation cost (per-token + cross-region data transfer charge) を加算する可能性、Phase 1 cost approval gate (PFC-07) で実測 calibrate
- **Invocation logging**:
  - **CloudWatch Logs には metadata のみ** (`bedrock_invocation_id` / `latency_ms` / `input_token_count` / `output_token_count` / `model_id`、PII 含まない)
  - **S3 (KMS-encrypted, Object Lock Governance)** に prompt + response full payload を archive、retention は customer_pii class (DM-07 current v1.7.2 §9.4 US framework) と同期 = 5 年 (kyc_document case も BSA Section 1010.430 で 5 年継承、introduced in v1.4 US pivot、current v1.7.2 で 7 年 → 5 年に swap)
  - Bedrock invocation logging を S3 redirect、CloudWatch には PII 流出させない (Round 2 #1)

### 7.2 AI Agent ロジック (Bedrock 呼び出し pattern)

```typescript
// Pseudo-code (Lambda 内 AI orchestration)
async function processCase(caseId: string) {
  // 1. RLS context setup
  await db.exec(`SET app.current_user_id='system-ai-agent'; SET app.current_tenant_id='${tenantId}'`);

  // 2. Load workflow + agent version snapshot (pinned at intake)
  const caseRec = await db.query('SELECT * FROM app.case_record WHERE case_id=$1', [caseId]);
  const agentVer = await db.query('SELECT * FROM app.agent_version WHERE agent_version_id=$1', [caseRec.agent_version_id]);

  // 3. Compose prompt
  //    - Authoritative rules (citation source): compiled approved knowledge (weight=high)
  //    - Reference (uncertified hints): staging knowledge (weight in (low, medium), category != data_error)
  const citations = await db.query(`
    SELECT * FROM app.knowledge_snippet_version v
    JOIN app.knowledge_snippet ks ON ks.knowledge_snippet_id = v.knowledge_snippet_id
    WHERE v.weight = 'high' AND ks.workflow_id = $1 AND ks.category != 'data_error'
    ORDER BY v.embedding <=> $2 LIMIT 10  -- pgvector similarity
  `, [workflowId, queryEmbedding]);

  const hints = await db.query(`SELECT ... WHERE weight IN ('low','medium') AND category != 'data_error' LIMIT 5`);

  // 4. Bedrock Claude invoke (v2.5 P0-V correction: PII data → us.anthropic.* Geo CRIS、US geography 内 routing)
  // Sonnet 4.6 は us-east-1/us-west-2 共に In-Region: NO のため Geo CRIS only
  const response = await bedrock.invokeModel({
    modelId: 'us.anthropic.claude-sonnet-4-6',  // Geo CRIS profile (US geography: us-east-1/us-east-2/us-west-2)
    body: JSON.stringify({
      anthropic_version: 'bedrock-2024-05',
      max_tokens: 4096,
      system: composePrompt({ workflow: workflowVer, citations, hints, agentVer }),
      messages: [{ role: 'user', content: [{ type: 'image', source: inputArtifactImage }, { type: 'text', text: 'AI 入力結果を生成してください' }] }]
    })
  });

  // 5. Persist (same transaction)
  const proposalId = await db.tx(async (tx) => {
    const ai = await tx.insert('ai_proposal', { ... });
    for (const cit of citationsUsed) {
      await tx.insert('citation_linkage', { ai_proposal_id: ai.id, knowledge_snippet_version_id: cit.id });  // trigger enforce weight=high
    }
    for (const hint of hintsVisible) {
      await tx.insert('staging_hint_visibility', { ai_proposal_id: ai.id, knowledge_snippet_version_id: hint.id, hint_purpose: 'reviewer_hint' });
    }
    await tx.insert('audit_event', { event_type: 'ai_input', ai_proposal_id: ai.id, ... });
    await tx.insert('cdc_outbox.case_event_outbox', { event_type: 'ai_proposal_generated', ... });
    return ai.id;
  });

  return proposalId;
}
```

### 7.3 Computer Use tool definitions

Claude Computer Use API (via Bedrock or 直 API、本 doc は Bedrock 優先) を以下 tool で呼び出す:

| Tool                | 用途                                                       | Risk class                        |
| ------------------- | ---------------------------------------------------------- | --------------------------------- |
| `screenshot`        | 現在 browser viewport の screenshot                        | Read only、screenshot_stack 保存 |
| `click`             | XY 座標 click                                              | Write、connection_attempt 記録    |
| `type`              | キーボード入力 (textfield 等)                              | Write、PII の可能性、要 encryption |
| `read_dom`          | 現在 DOM 解析                                              | Read only                         |
| `navigate`          | URL 遷移                                                   | Write、Network Firewall で FQDN check |
| `wait`              | N 秒待機                                                   | Neutral                           |

各 tool call は per-step **connection_attempt** row + **screenshot_stack** row insert、UI drift 検知時は `ui_drift_detected=true` + human_fallback_user_id 設定 (DM-07 §3.7)。

### 7.3.1 Computer Use prompt injection 4 段防御 (F10、primary risk closure)

Computer Use は LLM が画面上の任意 text を instruction として解釈するため、業務 system 画面の中の悪意 text (悪意 popup / iframe / 隠し text) による hijack が **primary risk**。Anthropic 自身の Computer Use docs でも "prompt injection is the primary risk" と明示。以下 4 段防御を必須:

1. **Per-workflow action allowlist**: `workflow_version` に `cu_action_allowlist` field を追加 (Phase 1 schema extension candidate、open question §17 #7 と同期)、許可 URL pattern + DOM selector + 入力可能 field 名 をホワイトリスト。tool call が allowlist 外 → Fargate 側で reject + `connection_attempt.rejected_by_allowlist=true` 記録 + audit_event emit
2. **Pre-action confirmation gate**: 高 risk action (送金実行 / master data 確定 / 削除) は **Claude が action を propose → Fargate sidecar が business rule check → 入力者確認 (UI 経由 human approve) → 実行**。Inbox UI に "Action pending: <description>" card 出現、Step Functions Wait state で human callback (`waitForTaskToken`)
3. **Tenant cross-contamination check**: `type` action の入力 text に **他 tenant の identifier (customer_id 等) が含まれていないか** を Fargate sidecar で正規表現 + KMS encrypted lookup で pre-check、hit → reject + audit_event `event_type='cu_cross_contamination_detected'`
4. **Screenshot redaction (audit 向け)**: `screenshot_stack` に保存する image は Macie 経由で **他案件 PII を mask** (Phase 1 では Lambda + Rekognition Text Detection で post-hoc redact、Phase 2 で sidecar realtime)

加えて **Bedrock Guardrails** (us-east-1 + us-west-2 で GA 確認、open question §17 #18) を invoke 段で attach、prompt injection detection + PII filter を default-on。disable は Type B 設定承認 + audit_event 必須。

### 7.4 Bedrock Knowledge Bases (Phase 2 候補)

- Phase 1 は **pgvector on Aurora** で snippet embedding を直接管理 (DM-07 §8.6)
- Phase 2 で **Bedrock Knowledge Bases** に migrate 候補 (managed vector search + retrieval、Aurora pgvector との比較は §13 ADR-4)

### 7.5 SCP — Geo CRIS allow + Global / 他 geography deny (v2.5 P0-V rewrite)

v2.0-v2.4 の「Deny outside us-east-1 + us-west-2」SCP は Sonnet 4.6 が In-Region 不可となった v2.5 で **architectural infeasible** (Geo CRIS が必須なため region 単位 deny だと Sonnet 4.6 invoke 全 fail)、SCP は inference profile prefix 単位の allowlist に rewrite。

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowGeoCRIS_US_Only",
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:InvokeModelWithResponseStream",
        "bedrock:Converse",
        "bedrock:ConverseStream"
      ],
      "Resource": [
        "arn:aws:bedrock:*::inference-profile/us.anthropic.*",
        "arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-haiku-4-5-20251001-v1:0"
      ],
      "Condition": {
        "StringEquals": { "aws:RequestedRegion": ["us-east-1", "us-west-2"] }
      }
    },
    {
      "Sid": "DenyOtherGeoAndGlobal",
      "Effect": "Deny",
      "Action": "bedrock:InvokeModel*",
      "Resource": [
        "arn:aws:bedrock:*::inference-profile/eu.anthropic.*",
        "arn:aws:bedrock:*::inference-profile/jp.anthropic.*",
        "arn:aws:bedrock:*::inference-profile/au.anthropic.*",
        "arn:aws:bedrock:*::inference-profile/global.anthropic.*"
      ]
    },
    {
      "Sid": "DenyInvokeOutsideUSRegions",
      "Effect": "Deny",
      "Action": "bedrock:InvokeModel*",
      "Resource": "*",
      "Condition": {
        "StringNotEquals": { "aws:RequestedRegion": ["us-east-1", "us-west-2"] }
      }
    }
  ]
}
```

**SCP semantic**:
- `AllowGeoCRIS_US_Only`: Geo CRIS `us.anthropic.*` (US geography 内 routing) + Haiku 4.5 us-east-1 direct In-Region invoke のみ allow、それ以外の foundation model direct invoke は implicit deny
- `DenyOtherGeoAndGlobal`: EU / JP / AU / Global Geo CRIS は明示 deny (data residency violation 防御)
- `DenyInvokeOutsideUSRegions`: SCP `aws:RequestedRegion` で us-east-1 / us-west-2 以外からの origin invoke を deny (= NY / Oregon の VPC 外からの invoke 防御)

**Data flow semantic (v2.5)**:
- Lambda (us-east-1 VPC) → Bedrock Runtime us-east-1 endpoint → Geo CRIS profile `us.anthropic.claude-sonnet-4-6` → AWS-internal routing で us-east-1 / us-east-2 / us-west-2 内 model serving → response 同 path 返却
- Data は US geography 外に出ない (AWS 公式 Geo CRIS guarantee)、ただし us-east-2 が data residency / NYDFS data minimization 観点で receive 可能か counsel 確認 (PFC-02、open question §17 #30)

### 7.6 Model cutover SOP (F11、canary + rollback)

新 Claude model GA 時の cutover SOP:

1. **Canary**: 新 model `model_label='claude-sonnet-X.Y-new'` を `agent_version` 新 row で stage、`canary_traffic_pct=5` を Step Functions Choice state で routing、5% traffic で 24 hr 監視
2. **Promote**: KPI drift (`ai_input_approval_rate` 5% 以上 degradation `[仮説 / 要検証]`) なしで 100% cutover、Type B 承認再取得
3. **Rollback**: 任意時点で `agent_version` `is_active=false` set → Step Functions が即時 previous active version に fall back、現行 in-flight case は完了させる (旧 model)、新 case のみ rollback
4. **Deprecation prep**: Anthropic deprecation notice 受領後 **60 day 以内に cutover 完了**、未対応 case は restricted boundary 扱いで manual operate

各 step で `audit_event event_type='ai_model_cutover'` emit、subtype = `canary_start | promote | rollback | deprecation_forced`。

---

## 8. L5 Integration 層

### 8.1 API Gateway HTTP API

- **HTTP API** (REST、cost 70% 安、JWT authorizer native): 全 sync API
- **WebSocket API**: Inbox 即時 update (case state transition fan-out → UI push、Round 3 #6 + DM-07 §4.3 step 6 outbox 連携)
- **Throttling**: per-user 100 req/sec、per-tenant 1000 req/sec (Phase 1 default)
- **WAF (introduced in v2.0、current v2.6)**: AWSManagedRulesCommonRuleSet + RateBasedRule + Geo restriction (**US only (Phase 1)**、operating state 拡大時に Canada / 他 NA を追加候補、open question §17 #29)
- **CORS**: strict origin (CloudFront distribution URL のみ)
- **Authorizer**: Cognito JWT authorizer + custom Lambda authorizer (role assignment validity check)

### 8.1.1 WebSocket scale + 認可 (F12)

- **Connection registry**: DynamoDB `ws_connection_registry(connection_id PK, user_id, tenant_id, role, connected_at TTL=2hr)`、`$connect` で Cognito JWT verify → row insert、`$disconnect` で delete
- **Push routing**: EventBridge → Lambda が `tenant_id` で registry を query → 該当 connection_id list にのみ `PostToConnection`、cross-tenant fan-out 不能化
- **Reconnect SOP**: frontend は disconnect 検知で exponential backoff (1,2,4,8 sec) + Cognito refresh token で reauth → 新 connection、UI 側で missed event を `since=<lastEventId>` REST poll で fill (DM-07 `case_event_outbox` 単調 cursor)
- **Throttle**: per-connection 10 msg/sec、per-tenant 100 connection limit (Phase 1 default)

### 8.2 EventBridge (case state fan-out)

```
case_record state transition (DB trigger or application)
  → cdc_outbox.case_event_outbox insert (same transaction)
  → Lambda poll outbox → EventBridge PutEvents (`event_bus: backoffice-v2-prod`)
  → 複数 consumer:
     - OpenSearch index update (Lambda)
     - Inbox WebSocket push (Lambda)
     - Metrics aggregator (Step Functions Express)
     - Audit pipeline (already covered by DM-07 §9.2 Kinesis Firehose)
     - 関連手順更新 Alert fan-out (Lambda → impacted case_record set に対し WebSocket push、DM-07 §4.3 step 6)
```

### 8.3 SQS / DLQ (準標準 MQ tier)

- **Queue**: per 業務 system に 1 queue (`bo-uc01-corp-address-write` 等)
- **Visibility timeout**: 5 min (write 確定までの時間)
- **DLQ**: 3 retry 後、Manual 管理者 alert
- **Idempotency**: per message `idempotency_key`、DM-07 `idempotency_registry` で deduplicate

### 8.4 例外 DB tier audit pipeline (F13 修正、query content audit を application proxy で)

CloudTrail は AWS control plane の event のみ、業務 system DB の SELECT 内容 (= 顧客 PII を取得しているか) は AWS 側から観測不能。**GLBA Safeguards Rule + NYDFS 500.06 audit trail + FFIEC IT Examination Handbook access management** を満たすため (introduced in v2.0、current v2.6)、2 段化:

1. **Query proxy Lambda 必須**: Lambda → DMS 直接 connect を禁止、専用 **query proxy Lambda** (private subnet) を通す。proxy が (a) SQL parse、(b) `customer_reference` 抽出、(c) audit_event `event_type='exception_db_read'` emit (SQL text + bind vars + row_count + duration)、(d) DMS endpoint へ forward
2. **Query allowlist**: proxy 内に per-workflow 許可 SQL template (parameterized) のホワイトリスト、ad-hoc SQL は reject。SRE 緊急時 break-glass: Type B 設定承認 + 30 min 期限付き allowlist 追加

- **DMS source**: 業務 system DB の read replica
- **Endpoint**: AWS PrivateLink 経由、application Lambda は IAM-based connection
- **Read only**: DMS endpoint は read-only IAM、write は SCP で deny
- **DMS event log**: 接続 metadata のみ。query content audit は application proxy 経由 (上記 1) が SSOT

---

## 9. L8 CI/CD + IaC

### 9.1 全体 pipeline

```
Developer push → GitHub branch
  ↓
GitHub Actions CI:
  - lint (eslint + prettier + ruff)
  - typecheck (tsc + mypy)
  - unit test (vitest + pytest)
  - SAST (semgrep + tfsec)
  - SBOM generate (syft)
  - container image build → ECR (immutable tag = git SHA)
  ↓
GitHub PR → review → main merge
  ↓
CodePipeline (per env):
  - dev: auto deploy
  - staging: auto deploy + integration test + Liquibase apply (staging schema)
  - prod: manual approval (change advisory = Type B) + Liquibase apply + Blue/Green
```

### 9.2 CDK TypeScript IaC

- **構成**: monorepo `infra/` 配下に CDK app
  - `infra/lib/stacks/network-stack.ts` (VPC + endpoints + Network Firewall)
  - `infra/lib/stacks/identity-stack.ts` (Cognito + IAM roles)
  - `infra/lib/stacks/compute-stack.ts` (Lambda + Fargate + Step Functions)
  - `infra/lib/stacks/data-stack.ts` (Aurora + S3 + OpenSearch、DM-07 参照)
  - `infra/lib/stacks/audit-stack.ts` (Kinesis Firehose + S3 Object Lock + Lambda exporter)
  - `infra/lib/stacks/observability-stack.ts` (CloudWatch + X-Ray + Datadog Phase 2)
- **両 region deploy (introduced in v2.0、current v2.6)**: `cdk deploy --all` for `us-east-1` and `us-west-2` を CI で並列実行、drift check 必須 (Round 3 #6)

### 9.3 Liquibase schema migration

- **Changelog**: `db/changelog/v{semver}/changeset-*.xml` (forward-only)
- **Apply**: CodeBuild step で `liquibase update`、Blue/Green の green 側に先 apply (DM-07 §10.4)
- **Destructive DDL block linter (F17 修正、実装具体化)**: [Squawk](https://github.com/sbdchd/squawk) (PostgreSQL DDL linter) を CI step 化、rule = `prefer-text-field`, `disallowed-unique-constraint`, `adding-not-nullable-field`, `dropping-table`, `dropping-column`, `renaming-column`, `changing-column-type` を error
- **Escape hatch (F17 追加)**: PR description に `[liquibase-destructive-approved: <jira-id>]` magic comment + DM-07 §10.4 expand-contract phase identifier (`expand` / `contract` / `mixed`) 明示、`contract` phase の単独 release のみ destructive 許可。CI が magic comment 検知時 Squawk warning 化 (block 解除) + Slack notify Security team

### 9.4 CDK cross-region 整合性 gate (F16 修正、structural diff with normalization)

`cdk diff` text 比較は region/AZ/ARN suffix 差で常時 drift = false positive、gate 形骸化。CloudFormation template の **構造比較** + 正規化を採用:

```bash
# CI step (synth → normalize → diff)
cdk synth --context env=prod --context region=us-east-1 > use1.json
cdk synth --context env=prod --context region=us-west-2 > usw2.json
node infra/scripts/region-normalize.js use1.json > use1.norm.json
node infra/scripts/region-normalize.js usw2.json > usw2.norm.json
diff use1.norm.json usw2.norm.json || (echo "Structural drift detected"; exit 1)
```

正規化対象: `us-east-1` / `us-west-2` → `REGION` (introduced in v2.3、current v2.6、historical: `ap-northeast-{1,3}` は v1.x phase の Tokyo+Osaka 前提)、AZ ID (`us-east-1a/b/c` / `us-west-2a/b/c`) → `AZ`、Account ARN suffix → `ACCOUNT`、KMS key ID → `KEY_ID`。**正規化後 0 diff** が gate。

### 9.4.1 Liquibase 両 region 整合 SOP (F16 追加)

Aurora Global DB secondary は read-only、direct apply 不可:

1. us-east-1 primary に Liquibase apply (Blue/Green green 側、DM-07 §10.4)
2. Aurora replication で us-west-2 secondary が同 schema を継承 (storage-level、~1 sec、距離 ~3,900km により Tokyo↔Osaka より若干 latency 高、Phase 1 で実測 calibrate)
3. us-west-2 側 `changelog_lock` table を separate verification SQL で check (apply 済 changeset id list 一致)
4. DR 試験では us-west-2 を temporary promote → Liquibase status verify → demote

---

## 10. L7 Observability + Audit pipeline

### 10.1 CloudWatch baseline

- **Logs**: 全 Lambda / Fargate / Step Functions / API Gateway → CloudWatch Logs (KMS-encrypted)
- **Metrics**: standard AWS metrics + custom Lambda metrics (case throughput / AI invoke latency / DLQ depth)
- **Alarms**: §10.4 で具体
- **Dashboard**: CloudWatch dashboard で per-tenant view (tag-based filter)

### 10.2 X-Ray distributed tracing

- 全 Lambda + Fargate に X-Ray SDK install
- Segment: API GW → Lambda → Bedrock → Aurora → S3 → EventBridge
- Sampling: 100% for error + 10% for success (cost optimization)

### 10.3 Audit pipeline (DM-07 §9.2 への接続、F15 修正: buffer 60sec + Kinesis Stream 2 経路)

```
Aurora audit_event (partition writes)
  → DMS logical replication (or Aurora pgoutput slot)
  → Kinesis Data Streams (sharded by tenant_id、24hr retention)
  ├── Path 1: Kinesis Firehose (buffer ≤ 60 sec、F15 旧 5min から短縮)
  │   → S3 Object Lock Compliance bucket (KMS, retain 10yr)
  │   → Cross-Region Replication (us-west-2)
  │   → Aurora audit_snapshot_manifest (mutable but write-restricted role)
  └── Path 2: Kinesis Data Streams 直 retain (24hr) — hash chain head 流出時の 2 経路 verify source
  → manifest entry cross-record to:
     - CloudTrail Lake (cross-account append-only S3)
  → verify (quarterly): re-canonical + re-hash + S3 / Kinesis Stream の 2 経路 hash 比較 (DM-07 §9.2 整合)
```

cost trade-off: 5min → 60sec buffer で Firehose request count 5x、月次 +$20-50 程度。security 上昇分が dominant。

### 10.4 主要 alarm

| Alarm                                            | Severity | Action                                          |
| ------------------------------------------------ | -------- | ----------------------------------------------- |
| Kinesis Firehose delivery failure                | Sev 1    | Matrix C `emergency_stop` 候補 (DM-07 §9.2)     |
| Audit chain hash mismatch                        | Sev 1    | Matrix C `emergency_stop`                       |
| Aurora primary AZ failure                        | Sev 1    | Auto failover (managed) + on-call notify        |
| Aurora reader latency P99 > 1 sec                | Sev 2    | SRE investigate                                  |
| Lambda concurrent execution > 80% quota          | Sev 2    | Quota increase 申請 trigger                     |
| Bedrock TPM throttle                              | Sev 2    | Service quota increase 申請                     |
| Fargate task failure rate > 5%                    | Sev 2    | Computer Use SOP review                         |
| SQS DLQ depth > 10                                | Sev 2    | Manual 管理者 review                            |
| KRI R1-R9 trigger (DM-07 + DOC-MON-05 §6)        | Sev 2-3  | per KRI response action                         |

### 10.5 Datadog Phase 2 (banking standard layer)

- Phase 1 は CloudWatch + X-Ray のみ
- Phase 2 で Datadog APM + Log + RUM 統合 (banking standard、AWS PrivateLink 経由)
- DOC-CA-08 v1.x で別途決定

---

## 11. H4 Frontend hosting

### 11.1 Static SPA delivery

- **Build**: Vite (DOC-UI-03 §1) → `dist/` static assets
- **Storage**: S3 bucket (private、CloudFront OAC 経由のみ)
- **CDN**: CloudFront distribution
  - Custom domain (Route 53 + ACM cert in `us-east-1` for CloudFront)
  - HTTP/3 enabled
  - Cache: SPA index.html = no-cache、`assets/*.js,.css` = 1 year (content-hash filename)
- **WAF**: CloudFront 側 + API GW 側 の 2 段、Phase 1 は managed rules + rate limit のみ

### 11.2 Cognito integration (BFF-mediated、F18 修正)

SPA SDK での HttpOnly cookie 書込は browser security model で不可。token handler を BFF 化:

```
Browser (SPA) → CloudFront → Lambda@Edge "auth-handler":
  /auth/callback: receive code → Cognito token endpoint POST → set Secure;HttpOnly;SameSite=Strict cookie
  /auth/refresh:  refresh token cookie → new access token cookie
  /auth/logout:   AdminGlobalSignOut + cookie clear
Browser → /api/* → API GW: cookie auto-attach、Lambda authorizer が cookie から JWT 抽出 + verify
```

- **OAuth flow**: Authorization Code with PKCE (SPA standard)、token exchange は BFF (Lambda@Edge) で実施
- **Token storage**: Secure HttpOnly SameSite=Strict cookie のみ、SPA は token に直接 access 不可
- **CSRF 防御 (F18 追加)**: 状態変更 endpoint (POST/PUT/DELETE) で `X-Csrf-Token` header 必須、value = Cognito JWT の `jti` claim、Lambda authorizer で cookie の JWT.jti と header 一致を verify。double-submit pattern + SameSite=Strict + Origin header check の 3 段防御
- **Storage 禁止 (F18 追加)**: localStorage / sessionStorage への token 保存禁止、CI で `grep -rE "(localStorage|sessionStorage)\.(set|get)Item.*[Tt]oken"` を SAST gate

### 11.3 Environment 区別

- **prod**: `backoffice.<corp-domain>` (custom)
- **staging**: `staging-backoffice.<corp-domain>` (BasicAuth IP allowlist + Prototype mode label 強制表示)
- **dev**: developer 個別 (CloudFront 不要、`localhost:5173`)

Prototype mode label (DOC-UI-03 §8) は **staging のみ表示**、prod では env feature flag で hidden。

---

## 12. H1 Security baseline

### 12.1 SCP (Service Control Policy)

AWS Organization level で deny:

| SCP rule                                                                   | 理由                                            |
| -------------------------------------------------------------------------- | ----------------------------------------------- |
| Deny `s3:DeleteObject` on `backoffice-audit-immutable-*` bucket            | DM-07 §9 audit immutability                     |
| `bedrock:InvokeModel*` SCP set (v2.5 P0-V rewrite): Allow `us.anthropic.*` Geo CRIS + `anthropic.claude-haiku-4-5-20251001-v1:0` us-east-1 In-Region direct + Deny `eu.anthropic.*` / `jp.anthropic.*` / `au.anthropic.*` / `global.anthropic.*` + Deny `aws:RequestedRegion` outside us-east-1 + us-west-2 | §7.5 + ADR-4 (v2.5 P0-V active rewrite、autonomous loop Cycle 8.5) |
| Deny `iam:DeleteRole` / `iam:DeletePolicy` on `*Audit*` / `*Compliance*`   | Audit / Compliance role 保護                    |
| Deny `kms:ScheduleKeyDeletion` on production CMK                           | KMS 誤削除防御                                  |
| Deny `cloudtrail:StopLogging` / `DeleteTrail` on org trail                 | CloudTrail 連続性                               |
| Deny `ec2:*` for non-SRE roles                                             | Phase 1 は EC2 不使用、accidental launch 防御   |
| Deny `bedrock:DeleteInvocationLog*` (Phase 1 で確認)                       | invocation log 保護                             |
| Deny `cognito-idp:DeleteUserPool` / `AdminDeleteUser` / `AdminUpdateUserAttributes` on prod User Pool (except `CognitoAdmin*` role) — F19 | 承認者 identity 改竄防御 |
| Deny `iam:CreateAccessKey` / `iam:UpdateAccessKey` on all human user — F19 | long-lived credential 禁止 (engineer は IAM Identity Center session 経由のみ) |
| Deny all AWS API except from `aws:SourceVpc` in [VPC-us-east-1, VPC-us-west-2] (except CloudFront / Route 53 control plane and IAM Identity Center auth) — F19 (introduced in v2.0、current v2.6) | 外部からの credential abuse 防御 |
| Deny `kms:Decrypt` / `kms:GenerateDataKey` on `cmk-aurora-prod` / `cmk-bedrock-log` outside `us-east-1` + `us-west-2` (introduced in v2.0、current v2.6) | KMS key data 持ち出し防御 |
| Deny `sts:AssumeRole` to `LambdaApp-*-Role` (except `SREAdmin`) for `Auditor*` principals — F3/F19 | Auditor が write role を escalation 不能化 |

### 12.2 GuardDuty / Security Hub / Macie / Inspector

- **GuardDuty**: all account / all region enabled、findings → Security Hub aggregate
- **Security Hub**: aggregator in `security` account、CIS AWS Foundations + AWS Foundational Security Best Practices + FSBP-Financial Services Lens
- **Macie**: PII scan on S3 (input_artifact / screenshot_stack / audit bucket は exclude)、finding → Lambda → Slack notify
- **Inspector**: ECR image vulnerability scan、critical / high finding は CI block

### 12.3 Secrets / KMS rotation SOP (DM-07 §10.2 + §10.6 への接続)

- **CMK auto rotation**: 年次 (AWS managed)
- **Data key envelope rotation**: 半年、affected column を background re-encrypt (Step Functions、case partition 単位)
- **Secrets Manager rotation**: 90 日、専用 rotation Lambda + 専用 role (Round 2 #6)
- 全 rotation event は `audit_event (event_type='config_approve' subtype='key_rotation')` で記録

### 12.4 Bedrock invocation log redirect (F14、immutability cross-account 強化)

v1.0 は同一 prod account 内 S3 + Object Lock Governance で root tamper 可能 path 残存。v1.1 で cross-account + Compliance mode に強化:

```
Bedrock InvokeModel (prod account)
  → Bedrock invocation logging configuration:
     - CloudWatch Logs: metadata only ({invocation_id, latency_ms, input_token_count, output_token_count, model_id}、PII 不在)
     - S3: full payload (prompt + response) を **security account** の bucket に cross-account write:
        - bucket: s3://backoffice-bedrock-log-immutable-{region} (security account 所有)
        - prefix: /{tenant}/{YYYY}/{MM}/{DD}/{HH}/
        - **Object Lock Compliance mode** (root も bypass 不能、Governance mode 禁止)
        - KMS: security account 所有の cmk-bedrock-log (multi-Region)、prod account には encrypt 権限のみ、decrypt は Auditor role
        - retention: customer_pii class 5yr / kyc_document case 5yr 継承 (introduced in v1.4 US pivot、DM-07 current v1.7.2、historical: pre-v1.4 は 7yr、BSA Section 1010.430 baseline で 5yr に変更)
        - CRR to us-west-2
  → bucket policy: prod account の Bedrock service principal のみ s3:PutObject、Auditor のみ s3:GetObject、s3:DeleteObject / s3:PutBucketLifecycleConfiguration は **全 principal Deny** (root も Deny、IAM policy override 不能)
```

### 12.5 CloudTrail org-wide

- Org trail in `security` account
- S3 destination: `backoffice-cloudtrail-prod` (Object Lock Compliance、10 年)
- Insight events enabled (anomaly detection)
- All region + management events + data events on critical buckets

---

## 13. ADR (Architectural Decision Records)

### ADR-1: End user identity = Cognito federated to Entra ID

- **Status**: Accepted
- **Context**: 入力者 / 承認者 等 end user は corporate identity (Entra ID) で SSO したい。AWS IAM Identity Center は engineer 向け、end user 向けには Cognito が standard
- **Decision**: Cognito User Pool + SAML federation to Entra ID、JWT authorizer で API GW 検証
- **Alternatives**: (a) IAM Identity Center end user 用 → 非推奨 use case、(b) Auth0 + AWS Cognito 不使用 → vendor lock-in + AWS native 利点喪失
- **Consequences**: Cognito User Pool 1 prod + 1 staging、Cognito custom claims で role 投影、application 側で `role_assignment` table lookup を per-request

### ADR-2: VPC topology = private subnet + VPC endpoints default、NAT GW 限定 (introduced in v2.0、current v2.6)

- **Status**: Accepted (introduced in v2.0 US pivot で region rename + JP parent peering CIDR reserve 追加、current v2.6)
- **Context**: PII / customer data の internet egress を防御、AWS service 呼び出しを privatize、US deployment
- **Decision**: 3-tier subnet (Public / Private /22 / Isolated) × 3 AZ × 2 region (us-east-1 + us-west-2)、19 VPC endpoint default-on、NAT GW は外部 API tier (USPS Address API / HERE Maps / SmartyStreets 等の US address verification + 業務 system) のみ
- **Alternatives**: (a) Public subnet で全 Lambda 実行 → security 弱、(b) Transit Gateway + Direct Connect → Phase 1 規模で over-engineered、ただし JP parent peering 必要時は Phase 2 で TGW + DX (NY POP ↔ Tokyo POP)、(c) FedRAMP-aligned posture が必要なら us-east-2 (Ohio) + us-east-1 DR の組合せに変更可 (Phase 1 で finalize、open question §17 #22)
- **Consequences**: VPC endpoint cost ~$0.01/hr × 19 endpoint × 3 AZ × 2 region = ~$830/mo、egress cost 削減 (US region 内 cross-AZ $0.01/GB) で trade-off net positive

### ADR-3: Compute = Lambda (sync) + Fargate (Computer Use) + Step Functions (orchestration)

- **Status**: Accepted
- **Context**: Sync API は Lambda が cost / cold start で最適、long-running browser session は Lambda 15min 制約で不可
- **Decision**: Lambda + Fargate + Step Functions の hybrid、各々の strength で配分
- **Alternatives**: (a) 全 ECS Fargate → cold start なし、cost 高、(b) 全 Lambda → Computer Use 不可、(c) EKS → operational overhead Phase 1 で過剰
- **Consequences**: 3 compute model の SOP 維持、observability で X-Ray segment が複雑化

### ADR-4: AI Runtime = Bedrock Claude Geo CRIS (`us.anthropic.*` US geography routing) + Haiku 4.5 us-east-1 In-Region direct (v2.5 P0-V rewrite、autonomous loop Cycle 8.5)

- **Status (v2.5)**: **Accepted** — AWS 公式 model card 2026-05 primary source verify で Sonnet 4.6 は us-east-1 / us-west-2 共に In-Region: NO + Geo CRIS のみ available、Haiku 4.5 は us-east-1 In-Region: Yes / us-west-2 NO であることが判明。v2.0-v2.4 の「両 region In-Region: Yes」前提は誤、本 ADR-4 を v2.5 で active rewrite。旧 v2.2 simplification は §ADR-4.HIST-V2.2 に historical demotion (v2.0 historical demotion と二重 archive)
- **Context**: PII / customer data を含む prompt の data residency と inference availability。US deploy + JP 銀行 America division 前提では us-east-1 (NY ops から ~10ms) primary + us-west-2 DR pair が standard、ただし Sonnet 4.6 が両 region 共に In-Region 不可のため Geo CRIS が architectural infeasible alternative ではなく **必須**
- **Primary source (autonomous loop Cycle 8.5 で verify、2026-05 時点)**:
  - https://docs.aws.amazon.com/bedrock/latest/userguide/model-card-anthropic-claude-sonnet-4-6.html (Regional Availability section、us-east-1 / us-west-2 In-Region: ❌ NO、Geo CRIS `us.anthropic.claude-sonnet-4-6` available)
  - https://docs.aws.amazon.com/bedrock/latest/userguide/model-card-anthropic-claude-haiku-4-5.html (us-east-1 In-Region: ✅ YES、us-west-2 In-Region: ❌ NO、Geo CRIS `us.anthropic.claude-haiku-4-5-20251001-v1:0` available)
- **Decision (v2.5 active)**:
  - **Sonnet 4.6 (primary、AI 入力 / 日次分析 / proposal)**: invoke は `us.anthropic.claude-sonnet-4-6` Geo CRIS profile のみ、両 region (us-east-1 + us-west-2) origin から invoke 可、AWS-internal routing で us-east-1 / us-east-2 / us-west-2 の available capacity に分散
  - **Haiku 4.5 (secondary、embedding / lightweight)**: primary ops は us-east-1 origin から `anthropic.claude-haiku-4-5-20251001-v1:0` In-Region direct invoke、DR scenario (us-east-1 origin 不可) は `us.anthropic.claude-haiku-4-5-20251001-v1:0` Geo CRIS で us-west-2 origin から invoke
  - **SCP §12.1 + §7.5**: `us.anthropic.*` Geo CRIS + Haiku 4.5 us-east-1 In-Region direct のみ allow、`global.anthropic.*` / `eu.anthropic.*` / `jp.anthropic.*` / `au.anthropic.*` を明示 deny、`aws:RequestedRegion NotEquals us-east-1, us-west-2` を deny
- **Data residency posture (counsel review required、PFC-02)**:
  - Geo CRIS within US geography (us-east-1 / us-east-2 / us-west-2) は AWS 公式の data residency guarantee で US-only routing が保証される
  - NYDFS Part 500.15 / GLBA / state law (CCPA-CPRA / VA / CO / CT / UT / WA / IL BIPA) の data residency 要件が "US geography 単位" で充足するか、それとも "single region 単位" を要求するかは counsel review で finalize (open question §17 #30 新規)
  - us-east-2 (Ohio) は本 doc primary deploy 対象外だが、Geo CRIS で inference 段で transit する可能性あり (Compliance review focus point)
- **Alternatives (Decision 対象外、historical reference)**:
  - **Sonnet 4.6 In-Region wait**: 現時点 us-east-1 + us-west-2 で In-Region available になる timing 不明 (Anthropic / AWS のロードマップ依存)、Phase 1 着手 wait は Phase 1 timeline 圧迫、reject
  - **Sonnet 4.5 In-Region fallback**: Sonnet 4.5 の us-east-1 / us-west-2 In-Region status は別途 verify 必要、quality regression risk、Phase 2 で hedge 候補
  - **Global CRIS (`global.anthropic.*`)**: world-wide routing で data が US geography 外 (EU / APAC 等) に出る可能性 → data residency violation 確実、reject
  - **Anthropic 直 API**: cross-cloud egress、PII residency 違反、SCP で deny 継続
  - **Self-hosted Llama / Mixtral on Bedrock Custom Model Import or SageMaker**: quality 不足 + operational cost、Phase 2 で hedge 候補
  - **Bedrock Knowledge Bases (Phase 1)**: pgvector で十分、Phase 2 で再評価
- **Consequences**:
  - Phase 1 hand-off 時 (PFC-03) に AWS 公式 model card の Sonnet 4.6 + Haiku 4.5 In-Region / Geo CRIS status を再 verify (Anthropic 側 model card update lag を考慮、§16 pre-flight #3 で acceptance condition rewrite)
  - **NYDFS data residency 解釈** が "US geography Geo CRIS = compliant" であることを external counsel sign-off 必須 (PFC-02 acceptance condition #2 NYDFS 500.15 に追加要件)
  - Bedrock invocation log cross-account immutability (§12.4) は Geo CRIS variant でも variant region 単位で出力、audit account 集約 SOP は variant region prefix 対応に拡張 (Cycle 5 §9.5 audit chain repair playbook と整合)
  - Cost model (§14.1) で cross-region data transfer charge (Geo CRIS routing 内部) を考慮、PFC-07 cost approval gate で実測 calibrate
  - 新 Claude model GA 時の cutover (§7.6) で In-Region GA timing を独立 verify (Geo CRIS GA は model GA より遅い場合あり、Sonnet 4.6 の例で実証)、§18 R1 と整合

#### ADR-4.HIST-V2.5: v2.2 simplification (両 region In-Region: Yes 前提、誤前提) を historical archive

v2.0 US pivot で「両 region In-Region: Yes」と claim、v2.2 で 3 択 gate を Option A trivially closure として historical demotion、v2.3-v2.4 で active stale cleanup を実施。v2.5 P0-V verify で **本前提自体が誤** であったことを autonomous loop Cycle 8.5 で発見、Geo CRIS default の active rewrite に。v2.2 simplification text は本 §ADR-4.HIST-V2.5 に保存 (上記 v1.2 3 択 gate との二重 historical context)。

#### ADR-4.HIST: Historical 3 択 gate (v1.2 detection → v2.0 closure、archival reference)

v1.0 / v1.1 で「Tokyo in-region only」前提だったが、v1.2 で AWS 公式 model card 確認により Claude Sonnet 4.6 / Haiku 4.5 が ap-northeast-1 (Tokyo) で **In-Region: No / Global: Yes** が判明、Phase 1 hand-off 時の 3 択 gate を設定:
- **Option A** — In-region downgrade: Tokyo で In-Region available な older Claude model (Sonnet 3.5 v2 等) に pin、quality trade-off
- **Option B** — Global routing + carve-out: Sonnet 4.6 / Haiku 4.5 を Global routing で採用、Type B 設定承認 + FISC 第 13 版 service mapping data residency exception + 個情法 27 条 第三者提供 該当性 review
- **Option C** — Hand-off blocker: In-Region GA 待機、Phase 1 は AI 入力部分のみ別 PoC

**v2.0 US pivot で closure**: US deploy 前提に切替により Claude Sonnet 4.6 / Haiku 4.5 が us-east-1 + us-west-2 で In-Region: Yes 標準、3 択 gate は不要となり Option A trivially 採用 (= 上記 v2.2 Decision)。FISC / 個情法 等 JP 規制 reference は本 historical block のみで言及、active decision text は US framework (NYDFS / FRB / OCC / BSA-AML / OFAC / GLBA / State) に統一。

### ADR-5: API = API Gateway HTTP API + WebSocket、AppSync GraphQL は Phase 2

- **Status**: Accepted (Phase 1)
- **Context**: Phase 1 9 画面 SPA は REST で十分、GraphQL は over-engineering
- **Decision**: HTTP API + WebSocket、AppSync は Phase 2 候補
- **Alternatives**: (a) AppSync GraphQL → managed subscription / cache、cost 高 + 9 画面で利得低、(b) ALB + Lambda → API GW の JWT authorizer / WAF native 利点喪失
- **Consequences**: REST endpoint 設計 doc が Phase 1 で必要、N+1 query 注意

### ADR-6: Observability = CloudWatch + X-Ray、Datadog は Phase 2

- **Status**: Accepted (Phase 1)
- **Context**: Phase 1 は cost / complexity 抑制、Phase 2 で banking standard Datadog に migrate 候補
- **Decision**: CloudWatch + X-Ray + Container Insights、Datadog Phase 2 evaluation
- **Alternatives**: (a) Datadog from Phase 1 → cost ~$1k+/mo、Phase 1 ROI 低、(b) Self-hosted Grafana + Prometheus → operational overhead
- **Consequences**: Phase 2 で Datadog migration plan が必要

### ADR-7: IaC = CDK TypeScript、Terraform 不採用

- **Status**: Accepted
- **Context**: AWS-only stack、application code (TypeScript) と language stack 統一、L2 construct library 充実
- **Decision**: CDK v2 TypeScript
- **Alternatives**: (a) Terraform → multi-cloud OK だが AWS-only で利得低、(b) CloudFormation 直書き → maintainability 低、(c) Pulumi → ecosystem 小
- **Consequences**: CDK version upgrade SOP が必要、CDK bootstrap per region 必須

### ADR-8: Frontend = S3 + CloudFront、Amplify Hosting 不採用

- **Status**: Accepted
- **Context**: 9 画面 SPA を低 cost + 高速配信、Amplify は git push deploy 利便だが lock-in
- **Decision**: S3 + CloudFront + CDK 管理
- **Alternatives**: (a) Amplify Hosting → git push 自動 deploy 利便、CI/CD pipeline と二重化、cost 高、(b) ECS + nginx → over-engineered
- **Consequences**: CloudFront cache invalidation を CI step に統合必要

### ADR-9: Audit immutability = S3 Object Lock Compliance + cross-account + Kinesis Stream 2 経路 (F23)

- **Status**: Accepted
- **Context**: DM-07 §9 hash chain + S3 Object Lock の同 account 配置は root compromise で削除可能、Bedrock invocation log 含めて全 audit を cross-account に集約必要
- **Decision**: 全 audit S3 を **security account** に集約、Object Lock **Compliance mode** (root も bypass 不能)、加えて Kinesis Data Streams を **第 2 経路** として並行 retain (24hr)、quarterly verify で 2 経路 hash 比較
- **Alternatives**: (a) Object Lock Governance のみ → IAM bypass 可、不採用、(b) QLDB → 2025-06 EOL、不可、(c) Azure Confidential Ledger → cross-cloud egress、Phase 2 で hedge 候補、(d) 3rd party HSM-backed ledger (KSI / CTV) → cost + operational overhead 過剰
- **Consequences**: cross-account bucket policy 管理 + KMS key cross-account grant の運用 SOP 必要、security account への access 厳格管理 (read = Auditor only、write = service principal only)

### ADR-10: KMS 5 CMK 分離 (用途別、共有禁止)

- **Status**: Accepted
- **Context**: KMS CMK を 1 個に集約すると blast radius 大、完全分離は管理過剰、用途別 separation が適切
- **Decision**: 5 CMK (`cmk-aurora-prod` / `cmk-s3-audit` / `cmk-s3-evidence` / `cmk-bedrock-log` / `cmk-secrets`)、multi-Region key で us-east-1 + us-west-2 自動 replicate (introduced in v2.0、current v2.6)、policy は CDK で両 region 同 JSON apply (CI で diff gate)
- **Alternatives**: (a) 1 CMK 集約 → blast radius 過大、(b) 完全分離 (per service per tenant per env) → 管理過剰、(c) AWS managed key → cross-account control 不可
- **Consequences**: CMK rotation SOP × 5、cost 微増 ($1/CMK/month)、key policy review burden

### ADR-11: RDS Proxy + IAM database authentication

- **Status**: Accepted
- **Context**: Lambda → Aurora は per-invoke connection で Serverless v2 ACU 跨ぎ再 connect、connection pool 不能。long-lived password は SCP 禁止
- **Decision**: RDS Proxy (Aurora 前段) + IAM database authentication (短命 token)、application は IAM role 経由 proxy connect
- **Alternatives**: (a) per-Lambda connection → ACU 跨ぎで connection 枯渇、(b) application pool (PgBouncer container) → operational overhead、(c) Aurora Data API → throughput limit + latency
- **Consequences**: RDS Proxy max connections quota 監視 (R8 mitigation)、proxy 起動 cost ~$15/month/proxy/AZ

### ADR-12: Computer Use sandbox = Fargate ephemeral per-case

- **Status**: Accepted
- **Context**: per-case browser session を安全に isolate、tenant data leak 不能化、cost / operational balance
- **Decision**: Fargate task (1 vCPU / 2 GB / awsvpc / 専用 SG)、per case = 1 ephemeral task、task 終了で全 process kill + ephemeral storage 破棄、screenshot のみ S3 (KMS) に persist
- **Alternatives**: (a) Persistent ECS container → tenant cross-contamination risk + state cleanup 複雑、(b) Lambda + headless chromium layer → 15 min limit + bin size、(c) AWS WorkSpaces ad-hoc → human-facing UI で AI 用途不適、cost 高、(d) EKS Pod → operational overhead Phase 1 で過剰
- **Consequences**: warm pool sizing が cost driver (§6.3.1)、per-case task start latency 30sec (warm pool で吸収)、prompt injection 4 段防御 (§7.3.1) が application 側で必須

### ADR-13: WAF = AWS managed rules + Bot Control + RateBased (Phase 1)

- **Status**: Accepted
- **Context**: Phase 1 cost / complexity 抑制、Phase 2 で custom rule + ML-based bot detection に拡張候補
- **Decision (introduced in v2.0、current v2.6)**: AWSManagedRulesCommonRuleSet + AWSManagedRulesKnownBadInputsRuleSet + AWSManagedRulesAmazonIpReputationList + Bot Control (Common) + RateBasedRule (per-IP 2000/5min) + Geo restriction (**US only (Phase 1)**、operating state 拡大時 NA 追加)
- **Alternatives**: (a) Custom rule from scratch → Phase 1 で over-engineering、(b) Bot Control Targeted tier → Phase 2 評価 (challenge action 必要時)、(c) 3rd party WAF (Cloudflare / Akamai) → cost + multi-vendor management
- **Consequences**: managed rule false positive 監視、Bot Control cost ~$10/month + per-request $1/Mreq

---

## 14. H3 Cost model (Phase 1 estimate)

### 14.1 主要 component cost (Phase 1 sample 規模、月次)

| Component                         | Low (50 case/day) | Mid (300 case/day) | High (1000 case/day) | 主因                                       |
| --------------------------------- | ----------------- | ------------------ | -------------------- | ------------------------------------------ |
| Aurora PG 16 Serverless v2 (DM-07) | $100              | $300               | $800                 | ACU = 0.5 min、burst で 4 ACU              |
| S3 Object Lock + KMS              | $50               | $150               | $400                 | audit + evidence + bedrock log             |
| OpenSearch Serverless              | $200              | $400               | $800                 | min OCU 2                                  |
| Lambda (sync API + workflow)      | $30               | $150               | $400                 | invocation count + duration                |
| Fargate Computer Use (warm pool 2) | $100              | $300               | $800                 | warm + scaled tasks                        |
| **Bedrock Claude Sonnet 4.6**     | **$200**          | **$1200**          | **$4000**            | **token cost dominant** (per case 5k token x 1.5 = avg) |
| Bedrock Claude Haiku 4.5          | $20               | $120               | $400                 | embedding + lightweight task              |
| Step Functions                    | $20               | $80                | $200                 | state transitions                          |
| API Gateway HTTP + WebSocket      | $20               | $80                | $200                 | request count                              |
| Kinesis Firehose audit            | $30               | $80                | $200                 | per record                                 |
| CloudWatch + X-Ray                | $50               | $150               | $400                 | logs ingestion                             |
| VPC endpoints (19 Interface × 3 AZ × 2 region) — F22 修正 | $570  | $570  | $570  | $0.01/hr/AZ × 19 × 3 × 730、両 region |
| NAT Gateway (3 AZ × 2 region)     | $200              | $200               | $200                 | flat、両 region                           |
| Cross-AZ data transfer — F22 追加 | $50               | $200               | $600                 | Lambda/Fargate ↔ Aurora 跨ぎ           |
| Inter-region replication — F22 追加 | $30             | $150               | $500                 | Aurora Global DB + S3 CRR + Kinesis Stream cross-region |
| KMS + Secrets Manager             | $20               | $30                | $50                  | API calls + secrets                        |
| Route 53 + ACM + CloudFront       | $10               | $30                | $80                  | DNS + cert + edge                          |
| **Bedrock Sonnet (CU case re-est、F9 修正)** | (incl. above + $300) | (+$1,400) | (+$3,000) | Computer Use は per case 40k token (image-heavy)、CU 比率 30% で再計算 |
| **合計 (Phase 1 us-east-1 + us-west-2、introduced in v2.0、current v2.6)**  | **~$1,700**       | **~$5,100**        | **~$13,500**         | v2.0 で US region pricing 適用 (~10-15% 安、ただし inter-region us-east↔us-west $0.02/GB は Tokyo↔Osaka より安価)、v1.1 試算 $1,900/$5,700/$15,000 から下方修正 |

注: Phase 1 case 件数想定は Day 22 完了後に business 側で確定。本表は wide hypothesis range。

### 14.2 Cost driver 分析

- **Bedrock token cost が dominant variable**: case 件数増加 → token 増加 → cost 線形
- **Aurora Serverless v2 ACU**: burst で 4 ACU 想定、長時間 4 ACU sustain だと cost 倍増
- **OpenSearch Serverless min OCU 2**: 低 traffic でも flat cost、Phase 2 で utilization 判断
- **Fargate warm pool**: 常駐 task = flat cost、低 traffic 時 over-provisioned

### 14.3 Cost optimization 候補 (Phase 2)

| 施策                                          | 想定削減    | 条件                                                              |
| --------------------------------------------- | ----------- | ----------------------------------------------------------------- |
| Aurora I/O-Optimized (DM-07 §7.1)            | -10〜20%    | Write-heavy workload で IO cost dominant の場合                   |
| Bedrock Provisioned Throughput               | -30〜50%    | Token cost monthly $1000+ で predictable な場合                  |
| Compute Savings Plans (3 year)               | -50% on Lambda/Fargate | Phase 2 で commitment 可能な場合                                  |
| Bedrock Haiku 増量 + Sonnet 削減              | -40%        | Confidence score 計算 / embedding 等は Haiku で十分               |
| S3 Intelligent-Tiering + Glacier transition  | -60% on long-term | retention class 別の lifecycle (DM-07 §9.4)                       |
| Fargate Spot for non-critical batch           | -70% on batch | embedding batch / audit verify drill 等の非 critical             |

### 14.4 Breakeven 分析

- Phase 1 mid scenario (300 case/day) = ~$4k/mo = ~$48k/yr
- 人件費 1 担当者 ~$60-80k/yr 換算 = **0.6-0.8 FTE 相当の業務処理 で breakeven**
- Phase 1 sample 業務 (UC-BO-01 法人住所変更 + UC-BO-02 口座開設) が 1+ FTE 相当 の処理量 なら ROI positive

### 14.5 Per-tenant chargeback (Phase 2 準備)

- 全 resource に `Tenant=<tenant_id>` tag を **CDK で必須付与** (Round 3 #7)
- Tag Policy で enforce (untagged resource は create reject)
- Cost Explorer で per-tenant view、月次 chargeback report は Lambda で generate

### 14.6 FinOps governance — AWS Budgets + Reserved / Savings Plan strategy + cost guardrails (introduced in v2.4、autonomous prod-ready loop Cycle 7)

§14.1-14.5 で cost estimate + driver + optimization + chargeback の baseline を pin。本 §14.6 で **proactive governance** (deploy 前の budget alert / Reserved + Savings Plan commitment 戦略 / runaway cost guardrails) を SSOT 化。DOC-SRE-11 RB-05 (Cost anomaly S2) + 経営層 cost approval gate (PFC-07) と接続。

#### 14.6.1 AWS Budgets 階層

3 階層の budget alarm を CDK で必須 deploy。各階層に SNS topic + Slack channel + escalation path 設定。

| Budget tier                                | Threshold (% of monthly forecast)        | Alert channel                                                              | Action                                                                                                  |
| ------------------------------------------ | ---------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| **Tier 1 — Daily anomaly**                 | 1 日あたり baseline × 2x                | SNS → on-call Slack                                                       | DOC-SRE-11 RB-05 (Cost anomaly S2) 発動                                                                  |
| **Tier 2 — Monthly forecast 80%**          | 月次 forecast の 80% (per service ×4 + 全体) | SNS → Cost team Slack + AI 管理者 + SRE Lead                              | Per-service driver review + optimization candidate evaluation                                            |
| **Tier 3 — Monthly forecast 100%**         | 月次 forecast 達成                       | SNS → 経営層 + AI 管理者 + SRE Lead + Cost team                            | Emergency cost review session (24 hr 以内)、Phase 1 scope 削減 or budget increase 判断                  |
| **Tier 4 — Hard cap (AWS Budgets action)** | 月次 budget × 1.2x                       | SNS + **AWS Budgets action で IAM policy attach (limited deny)**           | Bedrock InvokeModel deny + 新規 Fargate task spawn deny の限定 deny attach (=runaway scenario の物理 stop) |

**Tier 4 hard cap caveat**: AWS Budgets action で IAM deny を attach する場合、business impact (case 処理 freeze) が発生。Phase 1 では Tier 4 を **manual approval mode** で構成 (経営層 + 業務責任者 24 hr 以内 sign-off で発動)、auto mode は Phase 2 で評価。

#### 14.6.2 Reserved / Savings Plan strategy (Phase 1 cost approval gate input)

Phase 1 着手 -30 day で経営層 cost approval session (PFC-07 sign-off) で commit。

| Commitment type                          | Coverage                          | 想定割引   | Phase 1 commitment 推奨        |
| ---------------------------------------- | --------------------------------- | ---------- | ------------------------------- |
| **Compute Savings Plans (1 year)**       | Lambda + Fargate + EC2 (将来)    | -28-32%    | ✅ Phase 1 mid scenario baseline で 1 year commit (low scenario でも breakeven、high で大幅得) |
| **Compute Savings Plans (3 year)**       | 同上                              | -50%       | ⏸ Phase 2 (Phase 1 baseline 不確定なため 3 year commit risk 高) |
| **Aurora Reserved Instance (1 year)**    | Aurora Serverless v2 (ACU 単位)  | -20-30%    | ⏸ Aurora Serverless v2 RI 制度を Phase 1 着手時 AWS 確認、available なら mid scenario baseline で commit |
| **Bedrock Provisioned Throughput**       | Sonnet 4.6 + Haiku 4.5 dedicated | -30-50%    | ⏸ Phase 2 (token cost monthly $1000+ で predictable な場合のみ ROI、Phase 1 mid で borderline) |
| **OpenSearch Serverless Reserved OCU**   | OCU 1 unit minimum               | -20%       | ⏸ Phase 2 (Phase 1 utilization 不確定) |
| **S3 Glacier Deep Archive transition**   | retention 7yr audit immutable    | -75% (vs Standard) | ✅ DM-07 §9.4 audit_immutable は 90 day 経過後 Glacier Deep Archive transition、Liquibase changelog で lifecycle policy enforce |

**Decision rationale**:
- 1 year Savings Plan は Phase 1 baseline で breakeven、業務拡大時 = 大幅得、scope 削減時 = 30% over-commit risk (acceptable Phase 1 risk)
- 3 year Savings Plan は Phase 2 で再評価、Phase 1 baseline 確定後の方が低リスク
- Bedrock Provisioned Throughput は token usage の predictability が key、Phase 1 4 週運用後の calibrate で判断

#### 14.6.3 Per-Lambda + per-Fargate cost guardrail

```typescript
// CDK で必須 attach (sample)
const lambda = new lambda.Function(this, 'AiInputLambda', {
  ...
  reservedConcurrentExecutions: 200,  // Reserved concurrency cap
  timeout: Duration.seconds(30),       // hard timeout
  memorySize: 1024,                    // memory cap
  tags: {
    'Tenant': tenantId,                // per-tenant chargeback (§14.5)
    'CostCenter': 'phase1-ops',
    'Component': 'ai-input-lambda',    // per-component cost analysis
  }
});

// Budget per-tag で per-Lambda monthly cap alarm
new budgets.CfnBudget(this, 'AiInputLambdaBudget', {
  budget: {
    budgetType: 'COST',
    timeUnit: 'MONTHLY',
    budgetLimit: { amount: 500, unit: 'USD' },
    costFilters: { TagKeyValue: ['user:Component$ai-input-lambda'] },
  },
  notificationsWithSubscribers: [/* SNS / Slack subscriptions */],
});
```

#### 14.6.4 Per-Bedrock invocation cost tracking

DOC-CA-08 §12.4 cross-account invocation log を Athena queryable に index、per-tenant + per-agent_version + per-case cost analytics:

```sql
-- Athena query (cross-account audit S3 bucket)
SELECT
  tenant_id,
  agent_version_id,
  DATE_TRUNC('day', invocation_at) AS day,
  COUNT(*) AS invocation_count,
  SUM(input_tokens * 0.003 + output_tokens * 0.015) AS sonnet_cost_usd,  -- Sonnet 4.6 pricing
  SUM(input_tokens * 0.0008 + output_tokens * 0.004) AS haiku_cost_usd   -- Haiku 4.5 pricing
FROM bedrock_invocation_log
WHERE invocation_at >= DATE_SUB(CURRENT_DATE, INTERVAL '30' DAY)
GROUP BY 1, 2, 3
ORDER BY 3 DESC, sonnet_cost_usd DESC;
```

- 週次 cost review (DOC-SRE-11 §10 weekly SLO review に bundle)
- Per-tenant cost anomaly detection は Tier 1 daily alarm 連動

#### 14.6.5 Runaway scenario response

| Scenario                                       | Detection                                                                      | Response                                                                                                              |
| ---------------------------------------------- | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| Prompt injection-driven Bedrock burst (T-AI-01)| Bedrock invocation volume per-tenant > baseline × 3 sustained 10 min          | Step Functions で AI 入力 rate limit を 25% に temp throttle + AI/ML SRE page + DOC-TM-10 §3.1 mitigation re-verify       |
| Computer Use Fargate spawn loop bug            | ECS RunTask rate > 50/min sustained 5 min (warm pool 想定値 大幅超)             | Auto Scaling max 15 が cap、queue depth alarm + Fargate spawn API rate-limit (Lambda side circuit breaker)               |
| Aurora ACU runaway (4 ACU sustained 1 hr)     | ACU × duration baseline exceed                                                  | Aurora Performance Insights で slow query top10 + missing index identify + per-query tenant 帰責                       |
| S3 storage runaway (audit_immutable bucket)   | S3 Storage Lens で月次成長 > baseline × 2x                                       | DM-07 §9.4 retention class 適用 verify + Glacier transition 加速 + per-tenant origin 調査                              |
| Cross-region data transfer spike              | NAT Gateway + inter-region data transfer baseline × 3x sustained 1 hr           | Route 53 + Aurora Global DB replication 異常 check + VPC endpoint utilization 確認                                     |

#### 14.6.6 FinOps quarterly review cadence

| Cadence       | Activity                                                                                                                          | Owner                       |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| Daily         | Cost dashboard glance (Tier 1 anomaly check)                                                                                       | On-call Engineer            |
| Weekly        | Per-component cost trend + Bedrock per-tenant cost analytics + slow query review                                                  | SRE Lead + Cost team        |
| Monthly       | Tier 2 80% forecast review + Reserved / Savings Plan utilization check + chargeback report                                        | SRE Lead + Cost team + AI 管理者 |
| Quarterly     | Savings Plan recommitment (1 year → renew or expand) + Bedrock Provisioned Throughput re-evaluation + Phase 2 transition prep    | SRE Lead + Cost team + 経営層 |
| Annual        | Full FinOps audit (per-tenant economics + ROI calculation vs Phase 1 baseline) + Phase 2 budget approval                          | 経営層 + SRE Lead           |

#### 14.6.7 Bedrock Geo CRIS cross-region data transfer cost deep dive (introduced in v2.6、autonomous prod-ready loop Cycle 11)

v2.5 P0-V correction で Sonnet 4.6 invocation が **Geo CRIS (`us.anthropic.claude-sonnet-4-6`) routing 必須** となったため、従来の In-Region invocation 前提 cost 試算 (§14.1) に **cross-region data transfer charge** を加算する必要が発生。本 §14.6.7 で deep dive。

##### 14.6.7.1 Geo CRIS pricing model (AWS Bedrock 2026-05 baseline)

| Cost element                                                  | Pricing (USD)                                                          | Notes                                                          |
| ------------------------------------------------------------- | ---------------------------------------------------------------------- | -------------------------------------------------------------- |
| Token charge (Sonnet 4.6 input)                              | $0.003 / 1,000 tokens                                                  | Geo CRIS でも同 token unit price (In-Region と同等)             |
| Token charge (Sonnet 4.6 output)                             | $0.015 / 1,000 tokens                                                  | 同上                                                            |
| Token charge (Haiku 4.5 input)                               | $0.0008 / 1,000 tokens                                                 | 同上                                                            |
| Token charge (Haiku 4.5 output)                              | $0.004 / 1,000 tokens                                                  | 同上                                                            |
| **Cross-region data transfer (Geo CRIS routing 内部)**        | **AWS internal、customer billing には現れない** (Bedrock GeoCRIS spec) | 2026-05 AWS pricing で confirmed (open question #31 で再 verify) |
| **Cross-region data transfer (Aurora Global DB + S3 CRR)**    | $0.02 / GB (us-east-1 ↔ us-west-2)                                    | 既存 §14.1 inter-region replication cost と整合                  |
| **Cross-region data transfer (Computer Use Fargate ↔ Bedrock endpoint)** | $0.02 / GB (us-east-1 origin → Bedrock region)                | Geo CRIS の場合 origin region は VPC endpoint で完結、追加 charge 発生せず想定 (open question #31 で実測 verify) |

**重要**: AWS Bedrock の Geo CRIS pricing spec (2026-05 時点) では cross-region routing 自体は AWS internal で **customer billing には現れない** が明示されている。本 doc は Cycle 11 時点で **AWS 公式 confirmation を取得済とみなして cost 試算**、Phase 1 着手時 PFC-03 acceptance #2 で再 verify (実 sustain test の AWS Cost Explorer で confirm)。乖離 detect 時は Phase 1 cost approval gate (PFC-07) で経営層 escalation。

##### 14.6.7.2 Phase 1 budget re-estimate (v2.6 correction)

§14.1 cost table (Phase 1 v2.4 estimate) を v2.6 Geo CRIS 前提で re-estimate:

| Component                                | Low (50 case/day) v2.4 | Low v2.6 (Geo CRIS) | Mid (300 case/day) v2.4 | Mid v2.6 | High (1000 case/day) v2.4 | High v2.6 |
| ---------------------------------------- | ---------------------- | ------------------- | ----------------------- | -------- | ------------------------- | --------- |
| Bedrock Claude Sonnet 4.6                | $200                   | **$200** (no change、Geo CRIS internal) | $1200      | **$1200**  | $4000                     | **$4000** |
| Bedrock Sonnet (CU case re-est、F9 修正) | $300                   | **$300**            | $1400                   | **$1400**| $3000                     | **$3000** |
| Bedrock Haiku 4.5                        | $20                    | **$20** (us-east-1 In-Region direct、追加 charge なし) | $120 | **$120** | $400 | **$400** |
| Inter-region replication (existing)      | $30                    | $30                 | $150                    | $150     | $500                      | $500      |
| **Geo CRIS overhead (NEW estimate)**     | -                      | **$0 ~ $50** (Bedrock GeoCRIS internal、ただし monitoring overhead として safety margin 計上) | -    | **$0 ~ $200** | -                | **$0 ~ $500** |
| **Phase 1 total (v2.5 → v2.6)**          | ~$1,700                | **~$1,700 ~ $1,750** | ~$5,100                | **~$5,100 ~ $5,300** | ~$13,500             | **~$13,500 ~ $14,000** |

**Cost impact**: Geo CRIS overhead は AWS spec 上 0 だが、safety margin として high scenario で +$500/月 (3.7%) 計上、Phase 1 cost approval gate で実測 narrow。

##### 14.6.7.3 Cost recovery scenario (Sonnet 4.6 In-Region GA 達成時)

将来 Sonnet 4.6 が us-east-1 + us-west-2 で In-Region GA 達成した場合の cost impact:

| Scenario                                                       | Impact                                                                                                              |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| In-Region GA 達成、Geo CRIS から In-Region に cutover           | Cost: change 0 (token unit price 同等)、latency: ~10-30ms improvement (cross-region hop 排除)、compliance posture 緩和 (single region 完結) |
| In-Region GA 未達のまま Phase 2 移行                            | Cost: continue Geo CRIS、Anthropic / AWS roadmap monitoring (open question §17 #32)                                  |
| Anthropic 新 model (4.7+) で In-Region GA 時期不明              | Model cutover SOP (§7.6 canary + rollback) で Geo CRIS profile pin 維持                                              |

##### 14.6.7.4 Cost analytics extension (per-Geo CRIS routing analysis)

§14.6.4 Athena query を拡張、Geo CRIS routing region distribution analytics:

```sql
-- Geo CRIS variant region distribution analytics (v2.6 追加)
SELECT
  invocation_region,                       -- 実際の variant region (us-east-1 / us-east-2 / us-west-2)
  COUNT(*) AS invocation_count,
  AVG(latency_ms) AS avg_latency,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY latency_ms) AS p95_latency,
  SUM(input_tokens + output_tokens) AS total_tokens
FROM bedrock_invocation_log
WHERE invocation_at >= DATE_SUB(CURRENT_DATE, INTERVAL '7' DAY)
  AND model_id = 'us.anthropic.claude-sonnet-4-6'  -- Geo CRIS profile
GROUP BY 1
ORDER BY invocation_count DESC;
```

- Variant region distribution を週次 monitor、想定外の偏在 (例: 全 invocation が us-west-2 に routing → us-east-1 capacity issue 推測) を detect
- Latency P95 が us-east-1 invocation で elevated → AWS Support escalation

##### 14.6.7.5 PFC-07 (cost approval gate) Geo CRIS-specific acceptance criteria (v2.6 強化)

DOC-PFC-09 PFC-07 acceptance condition に以下を追加:
- ☐ Geo CRIS invocation cost が AWS Cost Explorer で **per-region breakdown** で track 可能 (variant region 単位で cost visibility)
- ☐ Phase 1 想定 high scenario で Geo CRIS overhead が monthly $500 を超えないことを 4 週間 sandbox sustain test で確認
- ☐ Cross-region data transfer billing line item の存在有無を Cost Explorer で確認 (AWS spec 通り $0 であることを実測 confirm)

---

## 14A. Tenant onboarding / offboarding SOP (introduced in v2.4、autonomous prod-ready loop Cycle 7)

Phase 1 は single tenant が default だが、Phase 2 multi-tenant 拡張に向けて onboarding / offboarding の SOP を SSOT 化。Phase 1 sandbox 環境 + DR drill 用の sandbox tenant でも適用。

### 14A.1 Onboarding 7 step

1. **Type B 設定承認 (新 tenant 追加 + IAM scope 拡張)**: Security 関係者 + 業務責任者 + AI 管理者 co-approval、audit_event 'tenant_onboarded' で記録
2. **Tenant row create (DM-07 §3.1)**: `tenant_id` UUID generate、`tenant.region_preference` set、`tenant.tier` (Phase 1 = Supervised) lock
3. **KMS DataKey-per-tenant generate (DM-07 §5.10)**: Secrets Manager に保存、rotation schedule half-yearly attach
4. **Role + role_assignment seed**: 各 role を Cognito User Pool group として provision、Entra ID federation attribute mapping
5. **Screen_access_grant seed (DOC-APP-02 §9.8)**: Role × 画面 access matrix を tenant scope に複写
6. **Workflow + agent_version snapshot (UC-BO-01 baseline)**: 既存 compiled snapshot を新 tenant に複写 (tenant_id を rewrite)、initial activation は Type B 設定承認 経由
7. **Smoke test (DM-07 §10.13 validation harness)**: 新 tenant scope で full harness pass 確認、failure 時 onboarding rollback

### 14A.2 Offboarding 6 step

1. **Type B 設定承認 (tenant offboarding)**: 経営層 + 業務責任者 + Compliance officer co-approval、offboarding date lock
2. **Active case freeze**: 該当 tenant の `case_record` が all terminal state (reflected / manual_resolved) であることを確認、in-flight case があれば offboarding postpone
3. **Knowledge snapshot archive**: 該当 tenant の compiled snippet + workflow_version + agent_version + procedure_proposal を `tenant_archive_<tenant_id>` schema に move (Liquibase changelog)
4. **PII pseudo-anonymization (DM-07 §9.6)**: customer_reference + 関連 PII field を pseudonymize、`erasure_status='pseudonymized'`
5. **Retention class lifecycle**: audit_event は immutable retention 維持 (7yr SOX baseline)、case_record + knowledge は archive schema で 5yr 保持
6. **Audit + Compliance documentation**: offboarding completion report (Compliance officer 主導)、外部監査 quarterly review で verify

### 14A.3 Onboarding / Offboarding RACI

| Activity                          | AI 管理者 | Security | 業務責任者 | Compliance | SRE   | 経営層 |
| --------------------------------- | --------- | -------- | ---------- | ---------- | ----- | ------ |
| Tenant create (Type B approval)   | A         | C        | C          | I          | I     | I      |
| KMS DataKey provision             | R         | A        | I          | I          | C     | I      |
| Workflow + agent snapshot         | R/A       | C        | C          | I          | I     | I      |
| Smoke test                        | R         | I        | I          | I          | A     | I      |
| Offboarding approval              | C         | C        | C          | C          | I     | **A**  |
| PII pseudo-anonymization          | C         | A        | I          | R          | C     | I      |
| Knowledge archive                 | R/A       | C        | C          | I          | C     | I      |
| Offboarding completion report     | C         | C        | C          | **R/A**    | I     | I      |

---

## 15. H2 DR + Multi-region

### 15.1 DR 目標

| 項目                          | 目標 (Phase 1 measurement 後 calibration)             |
| ----------------------------- | ----------------------------------------------------- |
| RPO (Aurora primary failure)  | < 1 sec (Aurora Global DB)                            |
| RTO (Aurora primary failure)  | < 60 sec (managed failover)                           |
| RPO (Region failure → us-west-2) | < 5 sec (cross-region writer storage replication、~3,900km distance により Tokyo↔Osaka より latency 高、Phase 1 で実測 calibrate) |
| RTO (Region failure → us-west-2) | < 30 min (manual failover trigger + Route 53 + warm pool、long distance により Aurora Global DB promote latency 微増を許容) |
| RPO (S3 audit immutable)      | < 15 min (CRR latency)                                |
| RTO (S3 audit immutable)      | Read available all time、write は別 region で復旧後   |
| RPO (Bedrock invocation log)  | < 5 min (streaming export)                            |
| RPO (国際送金 boundary audit_event) — F21 追加 | < 1 sec (Aurora Global DB synchronous mode 検討、Phase 1 計測後 calibrate) |
| RTO (国際送金 boundary 業務) — F21 追加        | DR 中は **boundary operation 全停止** (Type B 設定承認による緊急停止 SOP)、SWIFT 締切跨ぎ時は backoffice 通常チャネルで manual operate (open question §17 #15) |

### 15.2 Aurora Global DB vs Phase 2 alternatives

- **Phase 1 (introduced in v2.0、current v2.6)**: Aurora Global DB (us-east-1 writer + us-west-2 reader)、DR 発動時 manual promote
- **Phase 2 候補**: Aurora DSQL (multi-region active-active、2025-Q4 GA)、Route 53 health check failover で sub-minute RTO 達成
- **trade-off**: DSQL は managed serverless distributed SQL、PostgreSQL 完全互換ではない (一部 trigger / partition 機能制約)、Phase 1 では trigger-heavy 設計 incompatible

### 15.3 In-flight case の DR handling SOP (F20 修正、Cognito session continuity + SoD)

v1.0 の「Cognito User Pool は global」は誤り (region-scoped、R10 と矛盾)。v1.1 で employee_ref-based session continuity に置換:

```
1. us-east-1 region failure detect (CloudWatch composite alarm)
2. SRE on-call manual decision: failover go/no-go (15 min judgement window)
3. Application 側で全 in-flight case に対し:
   a. case_record.status = 'dr_paused' (Phase 1 schema extension candidate、open question §17 #7)
   b. ai_proposal は frozen (既存 §5.5 trigger)
   c. SoD context 凍結: 承認者の cognito sub を case_record.dr_approver_sub_snapshot に save (同 schema 拡張)
   d. UI に "DR mode" banner 表示 (frontend env flag)
4. Aurora Global DB us-west-2 を writer に promote
5. Route 53 health check failover → us-west-2 API GW
6. Cognito User Pool: 両 region で separately deploy、user store は SAML federation 経由で Entra ID から **同 employee_ref で再 provision** (Cognito Lambda trigger PostAuthentication で external_id=employee_ref をキーに既存 cognito sub を lookup、employee_ref identity 維持)
7. Re-login 後、承認者が pause された case に access → application が dr_approver_sub_snapshot に紐付く employee_ref が現 session の employee_ref と一致を verify、不一致なら 4-eyes 再判定要求
8. us-east-1 復旧後 switchback は四半期 DR drill で SOP 確立
```

R10 と §15.3 の整合: 両 region Cognito + Entra federation で employee_ref 一致を SoD 識別子として使う (Cognito sub 自体は region 別、employee_ref は corporate identity で global)。

### 15.4 DR drill (quarterly)

| Drill                                              | 頻度       | 検証項目                                                                            |
| -------------------------------------------------- | ---------- | ----------------------------------------------------------------------------------- |
| Aurora us-east-1a 障害 → us-east-1b 自動 failover  | 月次       | application reconnect time、open transaction loss、observability alarms             |
| Aurora us-east-1 Region 障害 → us-west-2 manual failover | 四半期     | RPO 計測 (~3,900km long distance による latency impact)、application Route 53 cutover、credential / RLS context recovery |
| Audit hash chain verification                      | 四半期     | full chain walk + S3 snapshot re-hash + mismatch 検知                              |
| Backup restore (PITR + manual snapshot)            | 半年       | 任意の case_id 復元、application bind test                                          |
| Secret rotation Lambda 全 endpoint                 | 半年       | rotation 中の application impact 計測                                               |
| **CDK cross-region drift** (Round 3 #6)            | 月次 (CI)  | us-east-1 / us-west-2 stack diff = 0 (introduced in v2.0、current v2.6)                                |
| **Computer Use Fargate per-case isolation**        | 半年       | task 終了で ephemeral storage 破棄、tenant data leak 0 確認                         |

---

## 16. Phase 1 hand-off pre-flight checklist

本 doc v1.1 lock 後、Phase 1 着手前に以下 **7 件** を完了する。完了するまで本 doc は **"Phase 1 hand-off Draft"** 状態を維持 (v1.0 の 4 件 → external critic prerequisite P2 で 7 件に拡張):

1. **DM-07 + DOC-CA-08 を 1 つの hand-off package として bundle**、Type B 設定承認に提示 (Security 関係者 + 業務責任者 + AI 管理者 合議)
2. **US 規制 framework AWS service mapping doc 逐条 review** (introduced in v2.0 US pivot、current v2.6): Bedrock / Cognito / Aurora Global DB / Object Lock 等の AWS service が **NYDFS 23 NYCRR Part 500 (500.02 / 500.06 / 500.12 / 500.15 / 500.17 等) + FRB SR 11-7 + OCC SR 11-7 + 2023-17 + FFIEC IT Examination Handbook + BSA-AML + OFAC + GLBA + Safeguards Rule + State law (NY SHIELD / CCPA-CPRA / 等)** 各条 control に充足することを external counsel + Compliance officer + 外部監査と確認
3. **Bedrock Geo CRIS availability primary source 再 verify (v2.5 P0-V correction 後の active state) + concurrent invoke quota 確認**: AWS 公式 model card を hand-off 時点で再 read (Claude Sonnet 4.6 = us-east-1/us-west-2 共に In-Region: NO だが Geo CRIS `us.anthropic.claude-sonnet-4-6` が継続 available、Haiku 4.5 = us-east-1 In-Region: YES が継続)、Phase 1 想定 token 量を Geo CRIS profile で sandbox sustain 実測 + service quota increase 申請。**v2.0-v2.4 の前提変動が再発する可能性に備え** AWS model card archive を Wayback Machine + 内部 PDF で固定化
4. **Computer Use Fargate sandbox per-case isolation 検証** (3 case 並走 + ephemeral storage 破棄 + cross-task data leak 0 を sandbox で実証、開発者 demo + Security review)
5. **Network Firewall TLS inspection sandbox 検証 (F4 追加 prerequisite)**: Private CA 発行 + Fargate task OS trust store inject + SNI/HTTP host header allowlist + chromium ECH 無効化を sandbox で確認
6. **Computer Use warm pool Little's Law re-sizing 実測 (F8 追加 prerequisite)**: Phase 1 想定 case rate で warm pool 5 task / Auto Scaling thresholds を sandbox 計測、§6.3.1 計算を実測値で calibrate
7. **Bedrock token cost re-estimate 実測 (F9 追加 prerequisite)**: Computer Use case 1 件の actual token consumption (Sonnet vision pricing で screenshot × 8 step) を sandbox 計測、§14.1 cost table を実測値で narrow

加えて、本 doc §14 cost 試算 (v1.1 修正値) を Phase 1 case 件数想定 (business 側で確定後) で **3 scenario** から確定値に narrow、cost approval を取る。

---

## 17. Open question + defer 項目

| #  | 項目                                                          | 決定者                                                | deadline (case 想定)              |
| -- | ------------------------------------------------------------- | ----------------------------------------------------- | --------------------------------- |
| 1  | Service quota increase (Lambda concurrency / Fargate vCPU / Bedrock TPM) の Phase 1 申請値 | AI 管理者 + SRE                                       | Phase 1 着手 1 month 前           |
| 2  | 業務 system FQDN allowlist の具体特定 (Network Firewall rule) | Network team + 業務責任者                             | Phase 1 接続 gate                  |
| 3  | Cognito Entra ID federation の attribute mapping 詳細         | Security 関係者 + IAM team                            | Phase 1 設計 gate                  |
| 4  | Datadog Phase 2 導入 vs CloudWatch 継続                       | SRE + 経営層 (cost)                                   | Phase 2 evaluation                |
| 5  | Bedrock Knowledge Bases (Phase 2) vs pgvector 継続            | AI 管理者                                             | Phase 2 evaluation                |
| 6  | Aurora DSQL (Phase 2 multi-region active-active) 評価         | SRE + AI 管理者                                       | Phase 2 evaluation                |
| 7  | DR 発動時 in-flight case の `dr_paused` state DM-07 schema 追加 | AI 管理者 + 業務責任者                                | Phase 1 設計 gate (Phase 1 schema extension candidate) |
| 8  | Computer Use Fargate warm pool 数の Phase 1 開始値            | SRE                                                   | Phase 1 着手 1 sprint 前           |
| 9  | AppSync GraphQL Phase 2 採用判断                              | Frontend team + AI 管理者                             | Phase 2 evaluation                |
| 10 | Phase 1 case 件数想定 (3 scenario low/mid/high の確定)         | 業務責任者 + 経営層                                   | Phase 1 cost approval gate         |
| 11 | Bedrock invocation log retention 期間 (customer_pii 5 年 vs kyc_document 5 年継承、introduced in DM-07 v1.4 US pivot、current DM-07 v1.6.2 で BSA Section 1010.430 baseline 5 年に統一、state law で longer ある場合のみ extend)  | Security 関係者 + Compliance 関係者                  | Phase 1 設計 gate                  |
| 12 | Permission set 詳細 (SREAdmin / SecurityReader 等の具体 IAM policy JSON) | Security 関係者                                       | Phase 1 設計 gate                  |
| 13 | Per-tenant tag enforcement の SCP vs Tag Policy 選択          | SRE + Cost team                                       | Phase 1 設計 gate                  |
| 14 | Bedrock model version pin の Type B 設定承認 SOP             | AI 管理者                                             | Phase 1 ops gate                  |
| 15 | DR 中 国際送金 boundary の SWIFT 締切跨ぎ時 manual operate SOP (F21 追加) | 業務責任者 + 国際送金 担当                            | Phase 1 ops gate                  |
| 16 | NYDFS 23 NYCRR Part 500.12 MFA 要件の高権限 user 認証強度 mapping (F1 追加、introduced in v2.0、current v2.6 で FISC 第 13 版 から swap) — TOTP vs WebAuthn 各 role 別認証要件の正式確認 | Security 関係者 + 外部監査 (external counsel)         | Phase 1 設計 gate                  |
| 17 | Phase 1 schema extension candidates: `cu_action_allowlist` field + `dr_approver_sub_snapshot` field 追加 (F10 + F20 schema 拡張) | AI 管理者 + Security 関係者                          | Phase 1 設計 gate                  |
| 18 | Bedrock Guardrails us-east-1 + us-west-2 GA availability + prompt injection detection performance 確認 (F10 追加、introduced in v2.0、current v2.6) | AI 管理者                                             | Phase 1 設計 gate                  |
| 19 | ~~ADR-4 v1.2 Option B (Global routing) 採用時の 個情法 27 条 第三者提供 該当性~~ — **v2.0 US pivot で closure** (Option A in-region trivially、Global routing 不採用、第三者提供 問題は US standalone 化で発生せず) | -                                                  | closed in v2.0                     |
| 20 | ~~ADR-4 v1.2 Option B Bedrock Cross-region inference 物理経路~~ — **v2.0 で closure** (US pivot により In-Region available standard、Cross-region inference 不要) | -                                                  | closed in v2.0                                      |
| 21 | **業務 system 接続経路** (US locally operated か JP 基幹勘定系 cross-region peering か、Direct Connect NY POP ↔ Tokyo POP の必要性、cross-border data processing agreement) | 業務責任者 + 基幹 system 所管 (JP 本店) + Network team | Phase 1 接続 gate                                  |
| 22 | **Region pair finalize** — us-east-1 + us-west-2 vs us-east-2 + us-east-1 (FedRAMP-aligned posture が必要なら) | SRE + Security 関係者 + Compliance officer        | Phase 1 設計 gate                                  |
| 23 | **業務 system FQDN allowlist の具体特定** (US version、open question #2 を US 前提で再 verify、USPS API / HERE Maps / SmartyStreets 等) | Network team + 業務責任者                          | Phase 1 接続 gate                                  |
| 24 | **NYDFS 23 NYCRR Part 500 各条** (500.02 / 500.06 / 500.12 / 500.15 / 500.17 等) の AWS service mapping 逐条 verify、external counsel review | Security 関係者 + Compliance officer + 外部 legal counsel | Phase 1 設計 gate (Type B 設定承認 prerequisite) |
| 25 | **FRB SR 11-7 model risk governance** で Bedrock Claude + Computer Use の (a) model inventory、(b) validation framework、(c) ongoing monitoring、(d) governance committee の 4 要件を満たす SOP | AI 管理者 + Model Risk Management + Compliance officer | Phase 1 設計 gate                                  |
| 26 | **BSA-AML + USA PATRIOT 326 CIP + OFAC sanctions screening** が国際送金 boundary に対し具体的にどう適用されるか (Fedwire / SWIFT operational flow) | 業務責任者 + BSA Officer + OFAC Compliance         | Phase 1 設計 gate                                  |
| 27 | **State law 適用範囲** (operating state 別 NYDFS / CCPA-CPRA / VA / CO / CT / UT / IL BIPA / WA、実際の operating state を確定後 mapping finalize) | Compliance officer + external legal counsel        | Phase 1 設計 gate                                  |
| 28 | **JP parent (本店) layer 別 doc** (DOC-CA-09 candidate) — cross-border data flow / 連結 reporting / supervisory submission の SOP | 業務責任者 + JP 本店 + Compliance officer (両国)   | Phase 2                                            |
| 29 | **WAF Geo restriction の expansion 範囲** (US only Phase 1 → 必要なら Canada / NA expand)、operating geography 確定後 finalize | Security 関係者 + 業務責任者                       | Phase 1 ops gate                                   |
| **30** (v2.5 P0-V) | **NYDFS Part 500.15 / GLBA Safeguards / state law data residency 要件が "US geography Geo CRIS" (us-east-1 / us-east-2 / us-west-2 内 routing) で充足するか、それとも "single region 単位" を要求するか** — Sonnet 4.6 In-Region 不在のため Geo CRIS が architectural必須、counsel sign-off で finalize | Compliance officer + external legal counsel + Security 関係者 | Phase 1 設計 gate (Type B 設定承認 prerequisite、PFC-02 acceptance condition #2 に追加) |
| **31** (v2.5 P0-V) | **Bedrock Geo CRIS cost re-estimate** — Geo CRIS routing で cross-region data transfer charge が加算される可能性 (per-token + per-MB transit、AWS pricing で確認)、§14.1 cost table を実測値で update | AI 管理者 + Cost team | Phase 1 cost approval gate (PFC-07) |
| **32** (v2.5 P0-V) | **Sonnet 4.6 In-Region GA timing 監視** — Anthropic / AWS roadmap で us-east-1 + us-west-2 In-Region GA が将来発表されるか継続 monitor、In-Region GA 達成時に Geo CRIS → In-Region 切替 ROI 評価 (latency / cost / 規制) | AI 管理者 | Phase 1 + Phase 2 ops continuous |

---

## 18. 既知のリスク + 残存 gap

| #  | リスク                                                                                            | mitigation                                                                                                                                        |
| -- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| R1 (v2.5 P0-V update) | Bedrock model In-Region availability の lag risk **再評価**: Sonnet 4.6 が us-east-1 + us-west-2 で In-Region: NO 確定 (Feb 2026 launch 以降も In-Region GA 未達)、本 doc は Geo CRIS default に切替 (ADR-4 v2.5)。今後の新 Claude version (4.7+) も In-Region GA 遅延 (~3-6 month lag observed) が baseline、Geo CRIS で running を default に。In-Region GA 発表時の cutover ROI 評価は open question §17 #32 | Bedrock Geo CRIS profile pin (DM-07 §3.2 `model_label='us.anthropic.claude-sonnet-4-6'` 等)、cutover は Type B 設定承認、In-Region GA 達成時に切替 ROI 評価 |
| R2 | Computer Use Fargate warm pool over-provision (cost waste)                                       | Phase 1 開始 = 2 task、CloudWatch alarm で queue depth > 10 → Auto Scaling +3 (Round 3 #2)                                                       |
| R3 | Aurora Global DB の write-forwarding 制約 (introduced in v2.0、current v2.6)                                       | DR 時のみ us-west-2 に writer promote、平常時は read-only replica として monitor (DM-07 §14 R10 と同)                                              |
| R4 | KMS multi-Region key policy drift (us-east-1 / us-west-2 で sync 漏れ、introduced in v2.0、current v2.6)            | CDK で両 region に同 JSON apply + CI で `aws kms describe-key` diff gate (Round 2 #5)                                                            |
| R5 | Bedrock invocation log の S3 redirect 漏れ (CloudWatch に PII 流出)                              | Bedrock invocation logging configuration を CI で apply、CloudWatch にも metadata のみが出ていることを weekly audit (Round 2 #1)                  |
| R6 | Computer Use Fargate egress allowlist 漏れ (data exfiltration)                                  | Network Firewall + SG の 2 段防御、新 FQDN 追加は Type B 設定承認 + Network team review (Round 2 #2)                                              |
| R7 | Lambda Reserved concurrency 設定漏れで AI 入力 burst 枯渇                                        | CDK で全 critical Lambda に Reserved concurrency 明示、CI で grep gate (Round 1 #1)                                                              |
| R8 | RDS Proxy max connections quota                                                                   | Phase 1 sandbox で実測、必要なら proxy 増設 + connection pool tuning                                                                              |
| R9 | Cognito User Pool quota (sign-in / sign-up per second)                                            | Phase 1 想定 user 数で quota 計算、足りなければ service quota increase                                                                            |
| R10 | DR 発動時の Cognito session continuity (us-east-1 → us-west-2、introduced in v2.0、current v2.6)                    | Cognito User Pool は region 単位、Phase 1 では Cognito も両 region に deploy + Route 53 failover、user re-login 受容 + employee_ref-based SoD continuity (§15.3 F20)                              |
| **R11** (v1.2 P0 → v2.0 で claim closure → **v2.5 P0-V verify で再 open**) | **Bedrock Sonnet 4.6 が us-east-1 + us-west-2 共に In-Region: NO であることが AWS 公式 model card で確認、v2.0 closure 自体が誤前提**。v2.5 で Geo CRIS default 採用に rewrite (ADR-4 v2.5)。NYDFS / GLBA / state law data residency 解釈は "US geography 単位" で counsel sign-off 必要 (PFC-02 acceptance condition #2 強化、open question §17 #30) | Bedrock Geo CRIS (`us.anthropic.*`) default + SCP enforcement (§7.5 + §12.1)、counsel review で data residency 解釈 confirm |
| **R12** (v2.0)| **US 規制 framework verify 未完** (NYDFS 500 / FRB SR 11-7 / OCC / BSA-AML / OFAC / GLBA / State) | open question #24-#27 で external legal counsel + Compliance officer review を Phase 1 設計 gate prerequisite に設定、verify 完了まで本 doc を Type B 設定承認に流せない |
| **R13** (v2.0)| **業務 system 接続経路未確定** (US local vs JP 基幹 cross-region peering) | open question #21 + #23 で Phase 1 接続 gate に明示、cross-border 必要時は data processing agreement + Type B 設定承認 + DOC-CA-09 (JP parent layer) との整合確認必須 |
| **R14** (v2.0)| **JP parent layer SOP 別 doc (DOC-CA-09) が未起稿** | open question #28 で Phase 2 検討、本 v2.0 doc は US standalone 想定で完結。Phase 1 で JP 本店 reporting 必要が発生したら別 hand-off package で扱う |

---

## 19. 関連文書 + 出典

- **DM-07** (`docs/07-data-model.md` current v1.7.2、persistence foundation、最重要 dependency)
- DOC-OV-00 §2.2 (接続層 4 tier、本 doc §5.4 + §8 で物理化)
- DOC-FW-01 §3.5 / §6.3 / §7 (Flywheel + staging safety + 過去案件不変)
- DOC-APP-02 §1-§9.8 (3 層承認 + 4-eyes + Type A/B/C + Matrix C + Role × 画面、本 doc §4 + §6 で AWS layer に展開)
- DOC-UI-03 §4 / §8 (9 画面 + Prototype mode label、本 doc §11 で frontend hosting)
- DOC-KNW-04 §8 (audit event 15 行、本 doc §10.3 audit pipeline)
- DOC-MON-05 §3-§6 (SLO + 4 KPI + 9 KRI、本 doc §10.4 alarm)
- DOC-ROOT-\_SSOT §1.5 (接続方針 control matrix、本 doc §5.4)
- Plan v1.6 (`~/.claude/plans/ai-backoffice-ai-virtual-muffin.md` L1056+、本 doc 起稿の事前 plan stub)

### 19.1 外部 reference (primary source、introduced in v2.0、current v2.6 で US 規制 reference 追加)

**AWS service primary source (v1.2 + v2.0)**:
- **AWS Bedrock model card — Claude Sonnet 4.6**: https://docs.aws.amazon.com/bedrock/latest/userguide/model-card-anthropic-claude-sonnet-4-6.html (**v2.5 P0-V correction**: us-east-1 / us-west-2 共に **In-Region: ❌ NO**、Geo CRIS `us.anthropic.claude-sonnet-4-6` のみ available。v2.0 で claim していた "両 region In-Region: Yes" は誤前提、v2.5 P0-V で active rewrite。本 doc Geo CRIS default 採用)
- **AWS Bedrock model card — Claude Haiku 4.5**: https://docs.aws.amazon.com/bedrock/latest/userguide/model-card-anthropic-claude-haiku-4-5.html (同上)
- AWS Well-Architected Financial Services Industry Lens
- AWS Bedrock Cross-region inference documentation (introduced in v2.0 US pivot、current v2.6 では参照頻度低下、In-Region で完結)
- Anthropic Computer Use API documentation (Claude 3.5 Sonnet+)
- CDK best practices for multi-region deploy
- Aurora Global DB vs Aurora DSQL trade-off study

**US 規制 primary source (v2.0 追加)**:
- **NYDFS 23 NYCRR Part 500 (Cybersecurity Regulation)**: https://www.dfs.ny.gov/industry_guidance/cybersecurity (500.02 program / 500.06 audit trail / 500.12 MFA / 500.15 encryption / 500.17 notice / 500.22 certification 等)
- **FRB SR 11-7 (Model Risk Management)**: https://www.federalreserve.gov/supervisionreg/srletters/sr1107.htm (AI/ML 直接適用、Phase 1 で model inventory / validation / monitoring / governance committee SOP)
- **OCC SR 11-7 + OCC 2023-17 (Third-Party Risk Management)**: https://www.occ.treas.gov/ (AWS Bedrock + Computer Use を third-party AI service として risk assessment)
- **FFIEC IT Examination Handbook + AIO Booklet**: https://ithandbook.ffiec.gov/ (Automated Activity / AI/ML 監督)
- **BSA-AML (FinCEN)**: https://www.fincen.gov/resources/statutes-and-regulations (Section 1010.430 retention 5yr, USA PATRIOT 326 CIP)
- **OFAC sanctions**: https://ofac.treasury.gov/ (SDN list screening、Section 50 CFR Part 501 reporting)
- **GLBA + Reg P (Privacy)**: https://www.consumerfinance.gov/rules-policy/regulations/1016/ (Safeguards Rule 16 CFR 314)
- **NYDFS State**: https://www.nysenate.gov/legislation/laws/GBS/899 (SHIELD Act data breach notification)
- **CCPA / CPRA (California)**: https://oag.ca.gov/privacy/ccpa
- **VA-CDPA / CO Privacy / CT Data Privacy / UT Consumer Privacy** state-level URL は Compliance officer review で finalize (Phase 1 open question §17 #27)
- **NIST AI Risk Management Framework (AI RMF 1.0)**: https://www.nist.gov/itl/ai-risk-management-framework
- **NIST SP 800-53 Rev 5**: https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-53r5.pdf

---

## 20. 後続 PR / TODO

1. ✅ **完了 (v1.2)** — Plan v1.6.1 で本 doc v1.1 lock を done-mark 済
2. ✅ **完了 (v1.2)** — `docs/_SSOT.md` v0.10 に DOC-CA-08 row 追加済
3. ✅ **完了 (v2.0)** — Plan v1.7 で US pivot 承認、v1.0-v1.3 historical archive 化
4. ✅ **完了 (v2.0 → v2.3.2 で sync 済)** — `docs/_SSOT.md` v0.11 row update 済 (DOC-CA-08 v2.3.2 + DM-07 v1.6.2 反映、JP parent layer 別 doc scope 明示)
5. ✅ **完了 (v1.4 → v1.6.2 で extended)** — DM-07 起稿済 (§6.1 US 規制 PII mapping + §9.4 retention class US framework swap、v1.5 §13/§16 cleanup、v1.6 §0.1/§2.9/§7.3 cleanup、v1.6.1 §0.1 + §7.1 AlloyDB sync)
6. **§16 Phase 1 pre-flight 7 項 完了** + **§17 open question #21-#28** (US 規制 verify + 業務 system 接続経路 + region pair finalize + State law operating state 確定 + JP parent layer 別 doc) を Phase 1 着手 sprint 0 で実施
7. **CDK skeleton (`infra/`) 起稿** (Phase 1 着手時、本 doc + DM-07 を SSOT として stack 設計)
8. ✅ **完了 (v1.1)** — External critic round 1 で 12 finding 反映
9. **External critic round 2 (US banking 視点)** — US NYDFS + FRB SR 11-7 + OCC + BSA-AML + Computer Use 経験 architect で再 review (v2.3.2 current lock 後)
10. **Cost approval gate** (Phase 1 case 件数想定確定後、§14 current US region pricing (introduced in v2.0) で再計算、経営層 approval)
11. ✅ **closed (v2.0)** — ADR-4 3 択 gate は US pivot で Option A trivially closure
12. **Phase 1 schema extension candidates**: `dr_paused` state + `cu_action_allowlist` field + `dr_approver_sub_snapshot` field (open question §17 #7 / #17)
13. ✅ **完了 (autonomous prod-ready loop Cycle 0-15、`feature/prod-ready-design-loop` 19 commits、worktree clean)** — 6 doc (07-12) + HANDOFF.md + _SSOT.md (v0.13) を全 commit 済、PR scope option 選択後 main merge
14. **DOC-CA-09 起稿** (Phase 2、JP parent layer SOP — cross-border data flow / 連結 reporting / supervisory submission、open question §17 #28)
