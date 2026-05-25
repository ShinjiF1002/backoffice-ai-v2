# Backoffice AI v2 — Data Model & Persistence Architecture (Phase 1 hand-off Draft)

> **Status downgrade (2026-05-24)**: 初版で "Production-Ready" を main title に置いたが、user critical review (Decision Brief) で 6 finding (3 P0 + 3 P1) が出たため **"Phase 1 hand-off Draft"** に降格。本 doc 単独では (a) Liquibase 化 / (b) IaC bootstrap / (c) Type B 設定承認 のいずれも prerequisite を満たさない。§0.1 status + §2.9 pre-flight checklist 参照。

| 項目            | 値                                                                                                                                                                                                                                          |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 文書 ID         | DOC-DM-07                                                                                                                                                                                                                                   |
| 文書名          | Data Model & Persistence Architecture (logical model + physical schema + DB 技術選定 + immutable audit + ops playbook)                                                                                                                      |
| 版数            | v1.7 (autonomous prod-ready loop Cycle 5: §5.10 row-level encryption + §9.5 audit chain repair playbook + §9.6 right-to-erasure × audit immutability conflict resolution、DOC-CEM-12 §10.2 ⚠ Gap → resolution、DOC-TM-10 T-ID-04 + T-IN-01 defense in depth) |
| ステータス      | Phase 1 hand-off Draft (前提条件未充足、§2.9 + §0.1 参照、production-ready claim 撤回済)                                                                                                                                                    |
| オーナー        | backoffice-ai-v2 maintainer (AI 管理者 + 業務責任者 + Security 関係者 合議想定)                                                                                                                                                             |
| 承認者          | 設定承認 Type B (Security-impacting、外部接続 + PII scope + 鍵管理を含むため) + Type C (Trust Level 進化 path を機械的に enforce する schema を含むため、業務責任者 co-A)                                                                    |
| 閲覧対象        | Internal / Project team / Phase 1 implementation team / Security 関係者 / Compliance 関係者 (内部総称、Tier 2 外)                                                                                                                           |
| 機密区分        | Internal                                                                                                                                                                                                                                    |
| 関連文書        | DOC-OV-00 §2.2 (接続層), DOC-FW-01 (Flywheel), DOC-APP-02 (3 層承認), DOC-UI-03 §4 (9 画面), DOC-KNW-04 §3 / §6-§8 (snippet schema / staging usage / audit event model), DOC-MON-05 (KPI/KRI), DOC-ROOT-\_SSOT, workflows/_index.md          |
| SSOT 区分       | 物理データモデル / DB 技術選定 / immutable audit 設計 / RLS + RBAC policy / pgvector + embedding store / KMS + secret rotation / RPO/RTO + DR / retention policy の SSOT                                                                    |
| Evidence Status | 設計のみ。Phase 1 で (a) sample workload で IO 計測、(b) AWS us-east-1 + us-west-2 multi-AZ で DR drill、(c) **US 規制 mapping table 作成** (Federal: FRB SR 11-7 / OCC / BSA-AML / OFAC / GLBA + State: NYDFS Part 500 / NY SHIELD / CCPA-CPRA 等)、(d) cost 実測 → 設計 calibration (introduced in v1.4 US pivot、current v1.6.2)                                |
| 改版履歴        | v1.0 (2026-05-24): 初版作成 (Phase 1 hand-off の foundation)。v1 から v4 までの内部 critique trace を §2 に記録、最終形を §3 以降に lock。`docs/00-06` の SSOT に整合、`docs/_SSOT.md` 拡張は本 doc lock 後に別 PR で行う (Out-of-scope 条項)。v1.1 (2026-05-24): 外部 critical review (AWS + JP メガバンク + FISC 監査経験 視点) から 13 finding を取得し全件反映 (§2.8 patch trace 参照)。主要修正: (a) `case` → `case_record` rename (Postgres 予約語衝突)、(b) CHECK subquery 不可問題を trigger へ移行 (Finding 1/4)、(c) audit immutability を 4-ring + streaming export 化 (Finding 2/3)、(d) idempotency_registry 分離 (Finding 7)、(e) retention class に kyc_document 7 年新設 (Finding 8)、(f) Blue/Green 3 段 expand-contract 詳細 (Finding 9)、(g) K3 precision/FP denominator 分離 (Finding 10)、(h) §2.4 stack 比較に Azure Confidential Ledger 列追加 (Finding 11)、(i) workflow_version publish 時 outbox 即時 Alert (Finding 12)、(j) boundary_definition_version typed threshold (Finding 13)、(k) FISC 9 版 章番号 mapping 表 (Finding 6)。v1.2 (2026-05-24): user Decision Brief round 1 (6 finding、3 P0 + 3 P1) 反映 (§2.10)。**main title から "Production-Ready" claim を撤回し "Phase 1 hand-off Draft" に降格**。主要修正: (a) §0.1 doc status + plan 接続順序の明文化、(b) §3 entity 数 42 → 47 訂正 + `customer_reference` 新規定義、(c) §6.1 FISC 章番号 placeholder 化 (版数特定を Phase 1 に委譲)、(d) §8 冒頭 DDL excerpt status disclaimer、(e) §10.4.1 pg_partman + Blue/Green 衝突 SOP、(f) §5.1 4-eyes trigger を 5 軸整合 (actor + tenant + case_id + decision_kind + 時系列) に強化、(g) §13 open question #19-#21 追加。**ただし v1.2 自己採点「全 6 finding 反映済」は不正確** (R2 で apply failure 5 件発見)。v1.3 (2026-05-24): user Decision Brief round 2 で v1.2 の apply failure 5 件を指摘 + 全件修正 (§2.11)。主要修正: (a) §2.10 / §16 で P0 #1 を未解消と honest 明記、(b) §2.9 / §13 / §2.10 から FISC "9 版" active claim 削除 (現行版 = v13 想定として表現)、(c) §0 / §1.1 で "本番 ready" / "本番投入可能" を Phase 1 文脈に paraphrase、(d) 全 11 trigger ON 句に schema-qualify 追加、outbox aggregate_type comment を entity rename と整合、(e) §16 TODO numbering を 1-11 で sequential 化。**ただし v1.3 の grep verify も apply failure 3 件残存** (R3 で指摘)。v1.3.1 (2026-05-24): user Decision Brief round 3 micro-patch — FISC 9 版 active claim 残存 2 箇所 (§7.3 row 2、§13 #3) + bare-table trigger 1 件 (§5.2 `trg_wfv_immutable ... ON workflow_version` → `ON app.workflow_version`) を修正。v1.3 検証で使った positive-enum grep pattern (table 名を私が enumerate) が `workflow_version` を見落としたため、§2.11 verification methodology note に **負パターン (`grep -vE 'ON (app\.\|audit\.)'`) を default にする教訓** を追記 (Decision Brief R3-P2)。v1.4 (2026-05-24、US pivot): user 新情報「US リージョン deploy + JP 銀行 America division」で DOC-CA-08 v2.0 と同期 pivot、§6.1 PII mapping を FISC + 個情法 + 銀行法 + 犯収法 → **US framework** (Federal: FRB SR 11-7 / OCC / FFIEC / BSA-AML (FinCEN) / USA PATRIOT 326 CIP / OFAC / GLBA + Reg P / Safeguards Rule / SOX、State: NYDFS 23 NYCRR Part 500 / NY SHIELD / CCPA-CPRA / VA-CDPA / CO / CT / UT / IL BIPA) に swap、§9.4 retention class を BSA + SOX baseline に swap (kyc_document 7 年 → 5 年、audit_immutable 10 年 → 7 年)、JP parent (本店) reporting は別 doc (DOC-CA-09 candidate、Phase 2 検討、本 doc scope 外) と明示。v1.0-v1.3.2 は historical archive として trace に保存。Plan v1.7 で US pivot 承認済。v1.3.2 (2026-05-24): user Decision Brief round 5 governance micro-patch — Plan v1.5 + `_SSOT.md` v0.9 反映後に DM-07 本体の §0.1 / §16 が「未完 TODO」表現で stale だった問題を修正。§0.1 git 管理 + SSOT 接続 を「Plan v1.5 / _SSOT.md v0.9 反映済、残るは `git add` のみ (user 領域)」に update、§16 #1 + #2 を ✅ 完了マーク化。`v1.3.1 lock` は内容 lock (§3-§15) であり governance metadata sync (§0.1 / §16) は lock 違反外と判断。本 patch で active な状態不整合 0 を達成。v1.4 (2026-05-24、US pivot): §6.1 PII mapping + §9.4 retention class を FISC + 個情法 + 銀行法 + 犯収法 → US framework (NYDFS Part 500 / FRB SR 11-7 / OCC / BSA-AML / OFAC / GLBA + Reg P + Safeguards Rule + SOX + State law) に swap、kyc_document 7yr → 5yr (BSA Section 1010.430)、audit_immutable 10yr → 7yr (SOX baseline)、JP parent reporting は別 doc DOC-CA-09 candidate scope。v1.5 (2026-05-24): §13 #3 + #20 + §16 #3 の active FISC claim を US framework に swap、§7.3 R3 推奨 rationale も US pivot 反映 (active FISC claim 0 達成)。v1.6 (2026-05-24): §7.3 R2 / §2.9 pre-flight / §0.1 governance / §7.1 / §7.2 / §10.1 / §10.7 / §14 R9/R10 の active stale US pivot reflect、AlloyDB row 比較軸を FISC → US 規制 (NYDFS / FRB / FFIEC) に swap。v1.6.1 (2026-05-24): §0.1 + §7.1 AlloyDB row + §7.3 R1/R2 + §16 TODO の metadata `introduced in vX.Y / current vX.Y.Z` provenance label 化、_SSOT.md v0.11 row + DOC-CA-08 v2.3.2 と sync 完了。v1.6.2 (2026-05-24): P1 metadata sync — §6.1 / §9.4 section headings の `(v1.4 US pivot)` → `(introduced in v1.4 US pivot、current v1.6.2)` 形式統一、§7.2 ASCII diagram の [v1.4 US pivot] label を [introduced v1.4、current v1.6.2] 化、§7.1 Aurora row の `(v1.4 US pivot)` を `(introduced in v1.4 US pivot、current v1.6.2)` 化、AWS Japan FISC reference を Historical reference only label 化 (§19.1)、改版履歴 v1.5/v1.6/v1.6.1 entry を本 entry まで継続。P2 batch: 全 active `v1.4 US pivot` literal を `introduced in vX.Y / current v1.6.2` provenance label に統一 (active stale literal 0、provenance trace 完全保存)。v1.7 (2026-05-25、autonomous prod-ready loop Cycle 5): defense in depth + ⚠ Gap resolution の 3 章追加。(a) §5.10 Row-level encryption (PII tier 3 = `id_document_hash` 用 KMS DataKey-per-tenant envelope encryption、pgcrypto AES-256-GCM、RLS + at-rest との triple defense、NYDFS 500.15(a)(2)(B) alternative compensating controls + GLBA Safeguards 16 CFR 314.4(c)(3) over-meet 想定、key rotation half-yearly + yearly re-encrypt + performance trade-off catalog)。(b) §9.5 Audit chain repair playbook (DOC-SRE-11 RB-03 連動、7 phase: Detection → Immediate freeze → Forensic isolation → Scope identification → NYDFS 500.17 72hr notification → PITR + S3 export canonical reconciliation → Postmortem → Defense in depth strengthening)。(c) §9.6 Right-to-erasure × Audit immutability conflict resolution (DOC-CEM-12 §10.2 ⚠ Gap fix、pseudo-anonymization 推奨案 = HMAC-SHA-256 stable pseudonym + customer_reference erasure_status + column-level KMS DataKey destroy crypto-erasure + audit_event chain append-only 維持 + counsel review focus 4 件、Alternative 4 案 rejection rationale 完備、CCPA 1798.105 + 1798.145(e) banking exemption + GLBA Reg P 1016.3(q)(1) deidentified concept alignment)。改版履歴 P1 metadata sync 完了 (本 entry まで sequential)。 |

---

## 0.1 Doc status + ガバナンス位置付け (Decision Brief P0 #1 反映)

- **git 管理 (current v1.6.2、v1.3.2 governance pattern 継承)**: CLAUDE.md §Non-Negotiables 「非自明な scope 変更 (新 doc 追加) は plan を update してから実装」に従い、(1) Plan v1.5 section 追加 → ✅ 完了 + Plan **v1.7 US pivot 承認** 追加済 (`~/.claude/plans/ai-backoffice-ai-virtual-muffin.md` L1001-1135、~1,135 行)、(2) `docs/_SSOT.md` への DM-07 row 追加 → ✅ 完了 (**v0.11、L56、current DM-07 v1.6.2 lock + US pivot 反映**)、(3) `git add docs/07-data-model.md docs/08-cloud-architecture.md docs/_SSOT.md` → ⏸ pending (**user 領域**、1 commit 推奨)。本 doc を Type B 設定承認 / Liquibase 化 / IaC bootstrap に流す前提条件は §2.9 pre-flight 3 項 (DDL validation / **US 規制 framework mapping verify (introduced in v1.4 US pivot、current v1.6.2、historical: FISC 章番号 review は v1.4 で superseded)** / streaming RPO) で別途定義
- **SSOT 接続 (current v1.6.2)**: 本 doc が言及する `docs/_SSOT.md` §1.4 (snippet schema) / §1.5 (接続 control matrix) は既存、本 doc 側で contract を follow する立場。**`_SSOT.md` v0.11** で本 doc を **DM-07 v1.6.2 lock** として Topic mapping table L56 に登録済 (US pivot 反映 + §0.1/§2.9/§7.3 stale cleanup + §7.1 AlloyDB metadata sync)
- **想定 reader**: AI 管理者 + 業務責任者 + Security 関係者 + Phase 1 implementation team。経営層向け summary は §0 + §2.8 + §7.3 で十分

## 0. 本 doc の読み方 (3 分要約)

- **対象**: Phase 0 (v2 設計) で固定した Flywheel + 3 層承認 + Knowledge governance を、Phase 1 (生 ops 投入) で運用可能にする persistence layer を **Phase 1 hand-off に必要な設計深度** まで落とす (§2.9 pre-flight checklist 3 項 + Decision Brief 残課題が prerequisite、本 doc 単独では production-ready ではない)。
- **scope**: 論理データモデル (§3) + 状態機械 (§4) + 不変条件 (§5) + DB 技術選定 (§7) + 物理スキーマ (§8) + immutable audit (§9) + 運用 playbook (§10)。
- **out of scope (本 doc では決定しない)**: (1) 業務システム側 API の具体スキーマ (= 外部 system、本 doc は contract のみ握る)、(2) UI 状態の reactive store (Phase 1 frontend 詳細設計)、(3) ML model 学習 pipeline (LLMOps の training 側、本 doc は serving + audit のみ)。
- **推奨 stack の結論先出し (introduced in v1.4 US pivot、current v1.6.2)**: **AWS (us-east-1 primary + us-west-2 secondary、US 規制 framework: NYDFS Part 500 + FRB SR 11-7 + OCC + BSA-AML + OFAC + GLBA + State law mapping)**、Aurora PostgreSQL 16 Serverless v2 + S3 Object Lock (Compliance mode) + OpenSearch Serverless + pgvector + KMS multi-Region key + EventBridge + Step Functions。理由詳細は §7 (v1.0-v1.3.2 の Tokyo + Osaka + FISC 前提は v1.4 US pivot で superseded)。
- **critique trace**: §2 に v1→v4 の内部 review loop (10 軸 Round 1 / 7 軸 Round 2 / 10 軸 Round 3) を記録、本文 §3 以降は v4 lock 後の最終形のみ。

---

## 1. 設計目的・前提・非目的

### 1.1 目的 (3 項)

1. **Flywheel の loop を機械的に enforce する**: 差戻し → staging → AI 日次分析 → 手順承認 → compiled 昇格 → 反映 → (案件) の 5 段が、データ層の不変条件 (constraint / trigger / RLS / event store) で外せないように設計する。
2. **過去案件不変 + 監査証跡保護を物理的に担保する**: 反映 (publish) 後の AI proposal / human decision / 引用根拠は **append-only な event store + 不変 snapshot 参照** で書き換え不能、関連手順更新時の Alert (3 適用範囲) は `workflow_version_id` snapshot との差分計算で導出する。
3. **Phase 1 で sample 業務 (UC-BO-01) の本番投入を検討開始できる最小 viable persistence の設計**: 多店舗化・複数 tenant・Autonomous 昇格を将来 enable するが、Day 1 では single tenant / Supervised のみ active で良い。実投入可否は §2.9 pre-flight + Type B 設定承認 + external regulatory review の通過後 (本 doc 自身の設計だけでは投入決定不可)。

### 1.2 前提 (本 doc が依存する v2 設計の lock 事項)

| 前提                                                       | source                                          | 本 doc での扱い                                                                                              |
| ---------------------------------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Flywheel 5 段 + 単方向                                     | DOC-FW-01 §1 / §7.3                             | Case state 機械 + AI Proposal の write-once 制約                                                             |
| 3 層承認 (案件 / 手順 / 設定) + 4-eyes + Type A/B/C        | DOC-APP-02 §1-§4                                | 別 table、SoD は trigger + RLS で enforce                                                                    |
| Knowledge snippet 8 field frontmatter                      | DOC-ROOT-\_SSOT §1.4                            | `knowledge_snippet` table の core columns                                                                    |
| 5-category routing (`data_error` は別 routing + citation 不可) | DOC-KNW-04 §4                                   | enum + partial index + check constraint                                                                      |
| Staging usage rules (citation 不可、3 用途 hint のみ)      | DOC-FW-01 §3.5 / DOC-KNW-04 §6                  | `citation_linkage` は `weight='high'` のみ FK 可、`staging_hint_visibility` を別 table 分離                  |
| 過去案件 AI proposal 本文不変                              | DOC-FW-01 §6.3                                  | `ai_proposal_snapshot` immutable + `workflow_version_id` snapshot FK                                         |
| 関連手順更新 Alert (3 適用範囲)                            | DOC-UI-03 §6 / DOC-WF-corporate-address-approval-policy §5 | snapshot 差分計算 view、銀 alert table は持たない (= 派生)                                                  |
| Audit event 15 行 (実 18 field) append-only                | DOC-KNW-04 §8                                   | `audit_event` partition + hash chain + S3 Object Lock 連携                                                   |
| 接続層 4 tier (標準 / 準標準 / 代替 / 例外) + 証跡         | DOC-OV-00 §2.2 / DOC-ROOT-\_SSOT §1.5           | `connection_attempt` + idempotency key uniqueness                                                            |
| restricted boundary pack (国際送金 BOUNDARY)               | workflows/international-transfer-boundary/      | `boundary_definition` + `boundary_review_proposal` 別 table                                                  |
| KPI / KRI 仮閾値はすべて `[仮説 / 要検証]`                 | DOC-MON-05                                      | `kpi_measurement` + `kri_state_snapshot` の time-series + `hypothesis_label` 必須 column                     |
| Role × 画面 access matrix は Phase 1 hand-off              | DOC-APP-02 §9.8                                 | `role` + `role_assignment` + `screen_access_grant` を skeleton 化、enforcement は Phase 1 で activation       |

### 1.3 非目的 (本 doc で決定しない)

- 業務システム (基幹勘定系 / KYC / 国土地理院 API / Computer Use target app) 側の schema。本 doc は **接続 contract** (request / response / idempotency / artifact hash) のみ握り、target side schema は対象 system 所管。
- 実 LLM の学習 pipeline / fine-tune データ flow。本 doc は **serving 側 + audit 側** のみ。
- UI 側の reactive state store (Zustand / Redux / Recoil) の構造。本 doc は **API contract** までで止め、UI store は Phase 1 frontend 詳細設計。
- Phase 2+ で導入される **Autonomous tier の sampling rule の具体実装**。本 doc は **schema を Autonomous 対応にしておく** が、ロジック自体は Phase 2 で別 docs。
- 多通貨換算 / 為替 rate fetch (国際送金 boundary 側の Phase 2+)。

### 1.4 用語注記

- **Snapshot**: 反映 (publish) された immutable な workflow / agent / knowledge の bundle。`*_version` で id 化、`*_snapshot` で per-bundle content を持つ。
- **Append-only event store**: `audit_event` table。`UPDATE` / `DELETE` を物理的に block (revoke + RLS + trigger 三重)、hash chain + S3 Object Lock により tamper evident。
- **Citation linkage**: AI proposal が runtime で参照した `compiled approved snippet` への explicit FK (weight=`high` のみ)。staging hint visibility は別 table。
- **Snapshot diff (= 派生 Alert)**: 「関連手順更新 Alert (適用範囲 2)」は実 table を持たず、`case.workflow_version_id` (case 処理時の版) と current `workflow_version` (最新承認版) を materialized view で差分計算したもの。
- **Strong vs Soft SoD**: Strong = DB-level trigger / RLS で reject。Soft = アプリ層 + audit alert で検知後 review。本 doc は **強 SoD を default**、Soft SoD は明示した箇所のみ。

---

## 2. 設計プロセス trace (v1 → v4 critique loop)

本 §2 は internal review trace。読み飛ばし可。本文 §3 以降は v4 lock 後の最終形のみ。

### 2.1 v1 draft (素朴 ER)

最初に v2 docs から自然に派生する 19 entity を起こした:

```
tenant, user, role, workflow, agent, case, ai_proposal, human_decision,
sendback_comment, alert, knowledge_snippet, procedure_proposal, proposal_diff,
config_change_request, audit_event, kpi_measurement, kri_state, connection_attempt,
boundary_definition
```

この時点で「素朴に書ける」設計。

### 2.2 Round 1 critique (gap 10 軸)

| # | 軸                                  | Gap 検出                                                                                                                                                                       | 解決方針                                                                                                                                                                                                          |
| - | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 | 過去案件不変 (DOC-FW-01 §6.3)       | v1 では `case.workflow_id` (= 業務 ID 文字列) を FK にしているため、業務手順 update で過去 case が新版を見える化してしまう                                                     | `workflow_version` (immutable snapshot) を新設、`case.workflow_version_id` で当時の版を pin する。`workflow.id` は logical pointer、版 reference は version 経由                                                   |
| 2 | Agent 多 version + Type A/B/C 単位  | v1 の `agent` は単一行、prompt/tool/model/permission 変更を区別できず、Type B (Security-impacting) と Type A (通常) の自動判定が不能                                            | `agent_version` + 4 child config table (`agent_prompt_config_version`, `agent_tool_binding_version`, `agent_model_config_version`, `agent_permission_grant_version`) に分離、Type 判定 trigger に diff source を渡す |
| 3 | Citation vs staging 境界            | v1 の `citation` table は `knowledge_id` FK 1 本のみ、staging snippet も同じ FK で参照可能になり、`weight='high'` のみ citation 原則を物理的に保証できない                       | `citation_linkage` (compiled 専用、FK は `compiled_snippet_id` という partial unique view 経由) と `staging_hint_visibility` (low/medium 用) を別 table 分離、check constraint で `weight='high'` を強制      |
| 4 | 4-eyes SoD                          | v1 の `human_decision` は actor 1 名のみ、入力者 = 承認者 self-approval を block できない                                                                                       | `case.input_confirmation_decision_id` + `case.business_approval_decision_id` の 2 FK に分離、trigger で両 decision の `actor_user_id` 不一致を enforce                                                            |
| 5 | 手順承認 SoD                        | v1 の `procedure_proposal` は Queue owner と Approver を区別する column がない                                                                                                  | `procedure_proposal.queue_owner_user_id` + `procedure_proposal.approver_user_id` の 2 column、trigger で `queue_owner_user_id != approver_user_id`                                                                |
| 6 | KPI / KRI time-series               | v1 の `kpi_measurement` は (kpi_id, value, timestamp) のみ、`hypothesis_label` / sample_size / 集計 window を持たない                                                            | `kpi_measurement` に `hypothesis_label`, `sample_size`, `window_start/end`, `aggregation_kind` 追加、partition by month                                                                                            |
| 7 | Connection tier 整合                | v1 の `connection_attempt` は tier (標準 / 準標準 / 代替 / 例外) を持たず、Read/Write 区別もない                                                                                | `connection_attempt` に `tier`, `direction`, `idempotency_key`, `artifact_hash`, `response_status`, `dead_letter_ref` 追加、(tool_id, idempotency_key) unique                                                     |
| 8 | PII 分類                            | v1 では customer 情報を `case.payload` JSONB に格納していて、PII 分類が schema 上に表現されていない                                                                             | `customer_reference` table 分離 + `pii_classification` enum (`bank_internal_id_only` / `name_address` / `id_document_hash`)、Aurora column-level encryption + KMS による envelope encryption                       |
| 9 | Immutable audit                     | v1 では `audit_event` を通常 table に置いただけ、DBA 権限で削除可能、規制 retention に対応できない                                                                              | `audit_event` を append-only schema (REVOKE update/delete from all roles)、SHA-256 hash chain + S3 Object Lock (Compliance mode) への daily snapshot、QLDB は 2025-06 EOL のため自前 hash chain 採用              |
| 10 | Regulatory retention                | v1 は retention policy 未定義                                                                                                                                                  | 5 retention class (audit_immutable / customer_pii / knowledge_compiled / kpi_aggregate / case_evidence) 各々 lifecycle policy 設定、S3 Object Lock の Compliance mode は legal hold 含む                          |

### 2.3 v2 (Round 1 反映)

19 entity → 32 entity に拡張。`*_version` snapshot table 群、`citation_linkage`/`staging_hint_visibility` 分離、4-eyes/SoD trigger、time-series partition 追加。

### 2.4 Round 2 critique (tech stack stress test 7 軸)

候補 3 stack を 7 軸で stress test:

| 軸                              | AWS (Aurora PG + S3 OL + OpenSearch)                     | GCP (AlloyDB PG + GCS + BigQuery)                      | Azure (Flexible Server PG + Blob + Synapse)             |
| ------------------------------- | -------------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------- |
| **JP Region + DR**              | Tokyo + Osaka local zone、Aurora Global DB sub-second RPO | Tokyo + Osaka、AlloyDB regional + cross-region replica | Japan East + West、Geo-redundant storage RA-GRS         |
| **FISC マッピング成熟度**       | 公開 mapping doc 完備、AWS Japan Financial Services team | mapping あり、Anthos / Workspace 経由の bank ref       | Mizuho/SMBC ref 多い、mapping doc あり                  |
| **PG ecosystem (pgvector, RLS, partition)** | Aurora PG 16 で pgvector / RLS / declarative partition full | AlloyDB は pgvector / RLS 対応、partition は pg_partman | Flexible Server PG 16 で pgvector 公式 GA、RLS は manual |
| **WORM / immutable storage**    | S3 Object Lock (Compliance mode) — legal-hold + retain   | GCS Bucket Lock (Retention policy lock)                | Azure Blob Immutable storage (Time-based retention)     |
| **Tampering 防御 managed service** (Finding 11 追加) | QLDB EOL (2025-06) → 自前 hash chain + S3 Object Lock 構成 | Cloud Audit Logs immutable + GCS Bucket Lock          | **Azure Confidential Ledger (SGX enclave, GA)** — managed append-only ledger、SGX で root-level tampering 防御 |
| **KMS / HSM**                   | KMS + CloudHSM、multi-Region key、BYOK + XKS              | Cloud KMS / Cloud HSM、CMEK + EKM                      | Key Vault / Managed HSM、CMK + BYOK                     |
| **Embedding / vector**          | pgvector on Aurora、Bedrock Knowledge Bases も併用可     | pgvector on AlloyDB、Vertex AI vector search 強い      | pgvector + Azure AI Search vector tier                  |
| **Cost (idle Phase 1 想定)**    | Aurora Serverless v2 (0.5 ACU min ≒ $43/mo) + S3 OL 安価 | AlloyDB Serverless preview 段階                        | Flexible Server B1ms ≒ $25/mo + Blob 安価               |

**判定**: **AWS 推奨** (理由 §7.3)。決定要因:
- **R1**: Aurora PostgreSQL 16 の RLS + declarative range partition + pgvector の本番運用 maturity が 3 stack で最高
- **R2**: S3 Object Lock の Compliance mode は **root account でも削除不能** (= 規制 retention の最強 enforcement)、GCS Bucket Lock も同等だが S3 の方が運用 doc 厚い
- **R3 (introduced in v1.4 US pivot、current v1.6.2)**: AWS us-east-1 + us-west-2 の latency profile + global infrastructure maturity、JP 銀行 America division は典型的 NY ops で us-east-1 ~10ms。FISC mapping は v1.0-v1.3.2 の Tokyo deploy 想定で記述、v1.4 で US framework に swap (FRB SR 11-7 + OCC + NYDFS 500 + FFIEC を AWS Japan / US Public Sector / Financial Services team が compliance 支援)
- **R4**: Aurora Global Database + RPO sub-second + cross-region failover < 1 分は本案件の RPO/RTO 要件と整合
- **R5**: 既存 stack に AI 連携 (Bedrock / Step Functions / EventBridge) を載せる時の choreography が最も短く書ける

### 2.5 v3 (tech stack + 物理化)

AWS 確定後、Aurora PostgreSQL 16 前提で物理 DDL を起草。partition / RLS / trigger / materialized view / pgvector index を含む。

### 2.6 Round 3 critique (本番稼働 ready 10 軸)

| # | 軸                                | Gap                                                                                                                                          | 解決                                                                                                                                                                                                            |
| - | --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 | write hot spot                    | `case.id` を bigserial にすると Inbox queue insert で 1 leaf に集中 (B-tree right edge)                                                       | ULID/UUIDv7 採用 (時系列で sortable、leaf 分散) + `case_id_text` (`CASE-2026-NNNN`) は表示用 separate column                                                                                                    |
| 2 | Read 性能 (Inbox queue)           | `WHERE status='ready' AND workflow_id=$1 ORDER BY received_at` は全 case scan                                                                | covering index `(workflow_id, status, received_at DESC) INCLUDE (assignee_user_id, alert_count)`                                                                                                                |
| 3 | AuditTrail filter                 | event 表は append-only で巨大化、`WHERE workflow_id AND event_type AND timestamp BETWEEN` で fullscan                                         | monthly range partition (`audit_event_YYYYMM`) + 各 partition 内に BRIN index on timestamp、`(workflow_id, event_type)` BTree subset                                                                            |
| 4 | Metrics aggregation               | KPI を case 表 join で実時間集計するのは expensive                                                                                            | `kpi_measurement` 表に pre-aggregate (daily window) + materialized view `mv_kpi_4gate_daily` を Step Functions で nightly refresh                                                                                |
| 5 | Migration 戦略                    | online schema change が必要 (Aurora は DDL block を最小化)                                                                                    | `pg_repack` or AWS Schema Conversion 不要 → Liquibase (forward-only changelog) + expand/contract pattern (新 column add → backfill → cutover → drop old) を SOP 化                                              |
| 6 | Blue-green / online schema        | Aurora blue-green deployment は schema 変更を別 cluster で先 apply → switchover                                                               | RDS Blue/Green Deployments 採用 (Aurora PG 16 GA)、本 doc §10.4 に SOP                                                                                                                                          |
| 7 | Data lineage                      | citation_linkage は持ったが、AI 提案 → human decision → diff → publish の系譜が join 複雑                                                     | `case_lineage_view` (materialized view、case → proposal → decisions → procedure_proposal → diff → publish) を Step Functions で hourly refresh                                                                  |
| 8 | AI model artifact storage         | `agent_model_config_version` で model id + prompt は持つが、bin artifact (LoRA / fine-tune weights、将来) を持つ場所がない                     | `model_artifact` table + S3 bucket reference (`s3://...`、KMS-encrypted、Object Lock 任意)、`agent_model_config_version.model_artifact_id` FK                                                                   |
| 9 | Secret rotation                   | Tool API key / 業務 system 認証は AWS Secrets Manager 任せ、DB から見える形にしない                                                            | `external_credential_ref` table は `secrets_manager_arn` のみ持ち、実 secret 値は DB に置かない。回転は Lambda rotation function、`rotation_schedule_days` 列で監視                                              |
| 10 | DR drill / RTO 検証               | 設計だけでは RPO/RTO 達成保証なし                                                                                                              | Phase 1 で quarterly DR drill (Aurora Global DB failover + S3 Cross-Region Replication failover + Step Functions / EventBridge cross-region) を §10.7 SOP 化、target RTO 30 min / RPO 1 sec                     |

### 2.7 v4 lock

Round 3 反映後、42 entity 構成 + 物理 DDL + ops playbook を本 doc §3 以降に固定。

### 2.8 v5 lock — 外部 critical review patch trace (13 finding 全反映)

v1.0 lock 後、AWS + JP メガバンク + FISC 監査経験視点で **external critical review** を実施、13 finding を取得し全件反映した (v1.1)。Finding 別 patch summary:

| Finding | 観点                                | 重大度 | Patch 適用先 (§)                                              | 修正内容要約                                                                                       |
| ------- | ----------------------------------- | ------ | ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| F1      | SoD CHECK 文法 (Type A)             | Fail   | §3.4 / §5.8 / §5.8.1                                          | CHECK 制約から trigger `enforce_config_approval_sod` に集約 (外部 table 参照不可問題 + NULL semantics) |
| F2      | Audit immutability "root 防御"      | Fail   | §9.1 / §9.2 / §9.3 / §14 R12                                 | 3 ring → 4 ring、daily snapshot → streaming export (≤ 5 min)、exporter Lambda digest 固定           |
| F3      | hash chain TPS 直列化                | Fail at scale | §3.6 / §5.6 / §14 R1                                  | `audit_chain_head` 別 table 分離、目標 200-300 events/sec/tenant                                  |
| F4      | citation CHECK subquery 不可        | Fail   | §3.5 / §5.4                                                   | CHECK → trigger 3 個 (citation / staging_hint / snippet promotion)、data_error 防御も追加          |
| F5      | `case` 予約語衝突                    | Fail   | §3.3 / §4.1 / §5.1 / §8.3 / §8.4 / §8.7 / §10.4 全箇所         | `case` → `case_record` rename、`user` も Phase 1 で `app_user` rename 提案 §10.5                    |
| F6      | FISC mapping 不在                    | Concern | §6.1 / §9.4                                                  | PII 4 段表に FISC 安全対策基準 / 個情法 / 銀行法 / 犯収法 章番号列追加、外部 review pending (※初版 v1.0 で版数を「v9 (現行)」と書いたが、AWS 公式は v13 対応を示しており誤り、v1.2 で placeholder 化 + v1.3 で版数特定を §13 #20 に分離) |
| F7      | idempotency UNIQUE 不全              | Fail   | §3.7 / §14 R11                                                | `idempotency_registry` 別 table 新設、connection_attempt の UNIQUE は partition friendly only と注記 |
| F8      | retention 5 段 が犯収法 7 年と矛盾    | Fail   | §9.4                                                          | retention class 5 → 6 段、`kyc_document` 7 年 新設、per-artifact lifecycle、case 一括 delete 不可    |
| F9      | Blue/Green reverse 不可 SOP 不在     | Concern | §10.4 / §14 R13                                              | 3 段 expand-contract 詳細、destructive DDL は単独 release 禁止、CI で block                        |
| F10     | K3 precision/FP denominator 不在     | Concern | §3.6 / §13 #18                                                | K3 専用 4 column + measurement_formula_ref、DOC-MON-05 §4.2.3 と SSOT 同期                        |
| F11     | AWS 推奨 R5 単独優位ではない          | Concern | §2.4 / §7.3 R5 / §13 #16                                     | Stack 比較表に Azure Confidential Ledger 列追加、R5 を合算理由に再 framing                         |
| F12     | 派生 Alert refresh 遅延               | Fail in practice | §4.3 step 6                                          | workflow_version publish 同 transaction で cdc_outbox insert、EventBridge 即時 Alert path 担保     |
| F13     | boundary JSONB untyped                | Concern | §3.7 / §5.9 / §13 #17                                        | `boundary_definition_version` に typed `boundary_kind` + `structured_threshold` + validation trigger |

### 2.11 v7 (v1.3) — User Decision Brief round 2 corrective patch (5 finding 修正、v1.2 apply failure 解消)

v1.2 patch round で「全 6 finding 反映済」と自己採点したが、user 自身の再 critical review で **5 件の apply failure** (diagnosis-execution gap) を指摘された。本 v1.3 で全件正直に修正:

| Finding | 内容                                                            | v1.2 の実態                  | v1.3 修正                                                                              |
| ------- | --------------------------------------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------- |
| R2-P0-1 | TODO 化は完了ではない                                            | "✅ 反映済" を表明したが実際は §0.1 / §16 への記録のみ | §2.10 表 / §16 #1 で **未解消 + user 領域** を明記、本 doc の git add / plan update は scope 外と honest 表現 |
| R2-P0-3 | FISC 9 版 claim が active section に残存                         | §6.1 だけ placeholder、§2.9 / §13 / §2.8 / §2.10 に "9 版" 残存 | §2.9 #2 / §13 #20 / §2.10 F6 行 で「現行版 (AWS 公式は v13 対応) の Phase 1 特定」と明示、改版履歴・patch trace は historical context として keep |
| R2-P1   | Production-ready 撤回が §0 / §1.1 に徹底されていない             | title だけ降格               | §0「本番 ready まで落とす」→「Phase 1 hand-off に必要な設計深度」、§1.1「本番投入可能」→「本番投入を検討開始できる最小 viable」に paraphrase |
| R2-P1   | DDL mismatch は修正ではなく免責化                                | §8 冒頭 disclaimer 追加のみ、本体の trigger ON 句は unqualified、outbox `aggregate_type='case'` 残存 | 全 11 trigger ON 句に `app.` / `audit.` prefix 追加、`case_event_outbox.aggregate_type` comment を entity rename に整合 (`'case_record' / 'procedure_proposal' / ...`) |
| R2-P2   | §16 TODO numbering 破綻 (`4.` 重複)                              | Liquibase 行 + CDK 行 が両方 `4.`     | §16 を 1-11 で sequential 化                                                          |

v1.3 で **active claim と完了表現は整合** — と v1.3 完了報告で claim したが、**user Decision Brief round 3 で 3 件の apply failure 再発見** (Decision Brief R3): (1) §7.3 row 2 に `FISC 安全対策基準 9 版` active claim 残存、(2) §13 #3 に `FISC マッピング 9 版` active claim 残存、(3) §5.2 `trg_wfv_immutable ... ON workflow_version` が bare table。原因は v1.3 検証で **positive-enum grep** (私が enumerate した table 名 list で grep) を使ったため、enumeration 漏れの `workflow_version` を見落とし、§7.3 / §13 #3 の FISC 9 版残存も「§2.9 / §13 / §2.10」だけ確認して §7.3 を verify scope から落としていた。v1.3.1 で 3 件修正 + 以下の **verification methodology** に lock:

| Verify 対象              | 推奨 grep pattern (default、負パターン優先)                                                          |
| ------------------------ | --------------------------------------------------------------------------------------------------- |
| schema-qualified trigger | `grep -nE '^CREATE TRIGGER.+ ON [a-z_]+' file \| grep -vE 'ON (app\.\|audit\.\|analytics\.\|cdc_outbox\.)'` |
| FISC 9 版 残存            | `grep -nE 'FISC[^|]{0,40}(第\s*)?9\s*版' file` (universe = FISC 文脈の「(第) 9 版」全パターン、distance window を 5 → 40 に拡大 + `第` 前置詞を optional に含める。historical context = changelog / §2.10 / §2.11 patch trace / §6.1 版数注記 は exclude 後 0 hit を確認、本 doc では 6 line hits / 4 sections 全件 historical)   |
| "本番 ready" / "production-ready" 残存 | 同上、changelog / patch trace 除く                                                       |
| outbox aggregate_type vs entity rename | `grep -n "aggregate_type" file` で rename 整合確認                                       |

残る非 prerequisite (Liquibase / IaC / CI lint / DR drill SOP) は §16 で Phase 1 implementation team に hand-off、本 doc 単独責務外。

### 2.10 v6 (v1.2) — User Decision Brief round 1 hygiene patch (6 finding 反映、Production-Ready claim 撤回)

v1.1 lock 後、user 自身の critical review (Decision Brief) で 6 finding (3 P0 + 3 P1) を取得し全件反映 (v1.2)。Finding 別 patch summary:

| Finding | 観点                                       | 重大度 | Patch 適用先 (§)                                | 修正内容要約                                                                                       |
| ------- | ------------------------------------------ | ------ | ----------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| DB-P0-1 | 未追跡 + plan 未反映                       | P0     | title / §0.1 (新規)、§16 #1                     | **未解消 (v1.3 でも継続)**。doc 内で実施したのは (a) title 降格、(b) §0.1 で「現状 untracked」「plan → SSOT → git add の順序が prerequisite」を明文化、(c) §16 #1 で plan update を最優先 TODO 化、まで。**実 git add / 実 plan update / 実 SSOT row 追加は user 領域 (plan は user-controlled)**、本 patch round の scope 外 |
| DB-P0-2 | 42 entity claim 実数齟齬 + customer_reference 不在 | P0     | §3 intro / §3.3                                | 42 → 47 へ訂正、漏れ 4 entity (procedure_proposal_source_link / audit_chain_head / idempotency_registry / boundary_definition_version) を集計表に算入、`customer_reference` を §3.3 で新規定義 (PII 分離 layer) |
| DB-P0-3 | FISC 9 版 claim が AWS 公式 (v13 想定) と齟齬 | P0     | §6.1                                            | 章番号 cell を **placeholder** 化、版数特定 + 章番号 mapping を Phase 1 設計 gate (open question §13 #20) で外部 Security review 必須に                |
| DB-P1-4 | DDL excerpt 実行不能 + schema mismatch     | P1     | §8 冒頭 (新規 status disclaimer)                | DDL excerpt は **indicative**、Liquibase 化前に schema-qualify 統一 + parse check 必須を §2.9 #1 と同期、"Phase 1 hand-off Locked" 昇格条件として明文化  |
| DB-P1-5 | pg_partman + Blue/Green 衝突 SOP 不在      | P1     | §10.4.1 (新規)                                  | Blue/Green window 前後の BGW 停止 / partition 事前生成 / Phase 2 で Step Functions 代替評価、open question §13 #19                                       |
| DB-P1-6 | 4-eyes trigger が actor 差分のみ           | P1     | §5.1                                            | tenant / case_id / decision_kind / 時系列 の 5 軸整合に強化、同パターンを citation_linkage / procedure_proposal / config_change_approval にも展開推奨    |

### 2.9 v5 → production-ready: Phase 1 pre-flight checklist (外部 review が "Phase 1 着手前に追加で詰めるべき" と判定した 3 項)

本 doc v1.1 lock 後、Phase 1 着手前に以下 3 件を完了する。完了するまで本 doc は **"Phase 1 hand-off draft"** 状態を維持、production-ready 主張は保留:

1. **DDL syntactic validation** (Finding 1 / 4 / 5 / 7 / 13 修正の verify): 本 doc § 3 以降の全 DDL excerpt を Liquibase changeset に起こし、Aurora PG 16 sandbox で `pg_verifyschema` 相当の dry-run pass を確認。CI に `psql --dry-run` ステップを追加
2. **US 規制 framework mapping 表の外部 Security 関係者 + Compliance officer + external legal counsel review** (introduced in v1.4 US pivot、current v1.6.2): §6.1 PII mapping + §9.4 retention class が **NYDFS 23 NYCRR Part 500 + FRB SR 11-7 + OCC SR 11-7 + 2023-17 + FFIEC IT Examination Handbook + BSA-AML (FinCEN) + USA PATRIOT 326 CIP + OFAC + GLBA + Reg P + Safeguards Rule + SOX + State law (NY SHIELD / CCPA-CPRA / VA-CDPA / CO / CT / UT / IL BIPA / WA)** の各条 control に充足することを Compliance officer + external legal counsel + 外部監査 が逐条確認。Type B 設定承認 (本 doc 自身の承認) の prerequisite (open question §13 #3 + #20 と同期、historical: v1.0-v1.3.2 では FISC 章番号 mapping review が prerequisite だったが v1.4 で superseded、JP parent layer は別 doc DOC-CA-09 candidate scope)
3. **Audit immutability の streaming vs daily snapshot 決定 + RPO 計測** (Finding 2 修正): §9.2 の Kinesis Firehose 5 min buffer 構成を sandbox で構築、tamper detection RPO を実測。5 min 達成できない場合は (a) Firehose buffer 短縮、(b) Kinesis Data Streams 直 consume、の選択を Phase 1 設計 gate で決定

加えて、本 doc を Type B 設定承認に通す前に DOC-OV-00 §2.2 + DOC-APP-02 §9.8 + 本 doc を 1 つの hand-off package として bundle、Security 関係者 + 業務責任者 + 経営層に同時提示する (§16 #7)。

---

## 3. 論理データモデル (Entity catalog、47 entity) — Decision Brief P0 #2 修正

7 層に分類。初版で「42 entity」と数えていたが、Round 1-3 + 外部 review patch で追加した entity を集計表に算入し損ねていた。実数は **47 entity** (本 §3 配下 `####` 見出しのうち trigger/subsection を除いた 46 + 本 patch で新規定義する `customer_reference` 1):

| 層                                         | Entity 数 | 主 entity                                                                                                                                                                                                                                       |
| ------------------------------------------ | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| §3.1 Tenant / Identity                     | 5         | tenant, user, role, role_assignment, screen_access_grant                                                                                                                                                                                        |
| §3.2 Workflow / Agent / Config (versioned) | 11        | workflow, workflow_version, agent, agent_version, agent_prompt_config_version, agent_tool_binding_version, agent_model_config_version, agent_permission_grant_version, tool_definition, model_artifact, external_credential_ref                |
| §3.3 Case / Evidence                       | **9**     | case_record, case_lifecycle_event, input_artifact, evidence_step, ai_proposal, ai_proposal_field, alert, screenshot_stack, **customer_reference** (新規定義、P0 #2 漏れ補正)                                                                    |
| §3.4 Approval                              | **8**     | human_decision, sendback_comment, procedure_proposal, procedure_proposal_diff, **procedure_proposal_source_link** (集計表漏れ補正), config_change_request, config_change_approval, boundary_review_proposal                                       |
| §3.5 Knowledge                             | 5         | knowledge_snippet, knowledge_snippet_version, citation_linkage, staging_hint_visibility, snippet_lifecycle_state                                                                                                                                |
| §3.6 Audit / Observability                 | **5**     | audit_event, **audit_chain_head** (Finding 3 で追加、集計表漏れ補正), kpi_measurement, kri_state_snapshot, matrix_c_event                                                                                                                       |
| §3.7 External Integration                  | **4**     | connection_attempt, **idempotency_registry** (Finding 7 で追加、集計表漏れ補正), boundary_definition, **boundary_definition_version** (Finding 13 で追加、集計表漏れ補正)                                                                       |

**Patch trace** (initial v1.0 → Decision Brief patch): 42 → 47。差分 5 件 = 集計漏れ 4 (procedure_proposal_source_link, audit_chain_head, idempotency_registry, boundary_definition_version) + 新規定義 1 (customer_reference)。

### 3.1 Tenant / Identity 層

#### tenant
```
tenant_id UUID PK
tenant_name TEXT NOT NULL
fisc_classification TEXT  -- 'jp_domestic_bank' / 'jp_us_branch' / 'sandbox' 等
default_region TEXT NOT NULL  -- 'us-east-1' (introduced in v1.4 US pivot、current v1.6.2)
dr_region TEXT NOT NULL       -- 'us-west-2' (Oregon、introduced in v1.4 US pivot、current v1.6.2)
created_at TIMESTAMPTZ
```
- Phase 1 は single tenant (v2 sample bank)、schema は multi-tenant ready
- 全 子 table に `tenant_id` を持たせ、Row-Level Security (RLS) policy で `current_setting('app.current_tenant_id') = tenant_id` を強制

#### user
```
user_id UUID PK
tenant_id UUID FK → tenant
email_hash BYTEA UNIQUE  -- SHA-256 of normalized email (PII minimization)
display_name TEXT
employee_ref TEXT  -- 行員 ID (KMS-encrypted column)
status TEXT CHECK IN ('active','suspended','retired')
last_login_at TIMESTAMPTZ
created_at TIMESTAMPTZ
```
- 認証 ID Provider (AWS IAM Identity Center / Okta) は別、本 table は **business 主体としての user 投影**
- email は hash のみ保持、KMS-encrypted PII は `employee_ref` のみ

#### role
```
role_id UUID PK
tenant_id UUID FK
role_key TEXT  -- 'input_operator' / 'business_approver' / 'business_owner' / 'manual_admin' / 'ai_admin' / 'auditor'
display_name TEXT
description TEXT
is_audit_only BOOLEAN  -- Auditor は true
```
- 6 主要 role を seed、Security 関係者 / Compliance 関係者 は internal 補助 role (DOC-APP-02 §5.3) として別 seed

#### role_assignment
```
role_assignment_id UUID PK
tenant_id UUID
user_id UUID FK
role_id UUID FK
workflow_id UUID NULL  -- NULL = tenant-wide assignment (Auditor 等)
valid_from TIMESTAMPTZ
valid_to TIMESTAMPTZ NULL
delegation_of_user_id UUID NULL  -- 代理承認 (休暇 / 異動) の chain trace
UNIQUE (user_id, role_id, workflow_id, valid_from)
```
- 代理承認は `delegation_of_user_id` で chain、`valid_to` で時限失効
- 重要: 同一 user に複数 role の同時 active 可、ただし **SoD 制約** (§5.1) で同案件内 4-eyes の同時行使は trigger 拒否

#### screen_access_grant
```
screen_access_grant_id UUID PK
tenant_id UUID
role_id UUID FK
screen_key TEXT CHECK IN ('inbox','case_review','sendback','proposal_review','agent_settings','audit_trail','metrics','knowledge_browser')
access_level TEXT CHECK IN ('read','write','approve','triage','none')
```
- DOC-APP-02 §9.8 の matrix を schema 化、Phase 1 で enforcement activation
- `none` 行も明示 (Auditor の write 等)、`role × screen` で完備

---

### 3.2 Workflow / Agent / Configuration 層 (versioned)

ここが **過去案件不変 + 関連手順更新 Alert** の foundation。version snapshot pattern が要。

#### workflow
```
workflow_id UUID PK
tenant_id UUID
workflow_key TEXT  -- 'UC-BO-01' / 'UC-BO-02' / 'UC-BO-IT-BOUNDARY'
workflow_slug TEXT  -- 'corporate-address-change'
display_name TEXT
risk_level TEXT CHECK IN ('low','medium','high')
automation_status TEXT CHECK IN ('active','restricted','prohibited')
trust_level TEXT CHECK IN ('supervised','checkpoint','autonomous','n/a')
current_version_id UUID FK → workflow_version
created_at TIMESTAMPTZ
UNIQUE (tenant_id, workflow_key)
```
- enum は `docs/_SSOT.md` §1.1 と整合
- `current_version_id` は **可変**、過去 case は別 column で当時の `workflow_version_id` を pin

#### workflow_version (immutable snapshot)
```
workflow_version_id UUID PK  -- ULID (sortable)
workflow_id UUID FK
version_label TEXT  -- 'v0.1' / 'v0.2' (display only)
workflow_md_sha256 BYTEA NOT NULL
agent_instructions_md_sha256 BYTEA NOT NULL
approval_policy_md_sha256 BYTEA NOT NULL
boundary_md_sha256 BYTEA NULL  -- restricted の場合のみ
meta_yaml_sha256 BYTEA NOT NULL
content_storage_ref TEXT NOT NULL  -- s3://...
approved_by_procedure_proposal_id UUID FK → procedure_proposal
approved_at TIMESTAMPTZ NOT NULL
published_at TIMESTAMPTZ NOT NULL  -- 案件 runtime で適用開始 timestamp
superseded_at TIMESTAMPTZ NULL     -- 次 version published 時に set
prev_version_id UUID NULL FK self
content_diff_jsonb JSONB  -- prev_version との diff の structured form
CHECK (published_at >= approved_at)
```
- **immutable**: insert のみ、update / delete は revoke (詳細 §5.2)
- `*_sha256` は content-addressable storage への refer、S3 (KMS-encrypted) に bin 保存
- 公開 (publish) の瞬間に `case` 側で当時の version を pin (§3.3 case.workflow_version_id)

#### agent
```
agent_id UUID PK
tenant_id UUID
workflow_id UUID FK
agent_key TEXT  -- 'agent-corporate-address-change'
display_name TEXT
current_version_id UUID FK → agent_version
UNIQUE (tenant_id, workflow_id, agent_key)
```

#### agent_version (immutable snapshot bundle)
```
agent_version_id UUID PK
agent_id UUID FK
version_label TEXT  -- 'v0.1'
prompt_config_version_id UUID FK
tool_binding_version_id UUID FK
model_config_version_id UUID FK
permission_grant_version_id UUID FK
trust_level TEXT  -- snapshot 時の trust level
approved_by_config_change_approval_id UUID FK → config_change_approval
approved_at TIMESTAMPTZ
published_at TIMESTAMPTZ
superseded_at TIMESTAMPTZ NULL
prev_version_id UUID NULL FK self
```
- 4 sub-config version は **独立に bump 可**、agent_version は combined snapshot
- Type 判定: 4 sub のどれが diff したか → trigger で `config_change_request.detected_type` を計算

#### agent_prompt_config_version
```
prompt_config_version_id UUID PK
agent_id UUID FK
content_sha256 BYTEA NOT NULL
content_storage_ref TEXT  -- s3://... (prompt template + reference knowledge list)
referenced_compiled_snippet_ids UUID[] -- compiled approved snippets at publish time
approved_at TIMESTAMPTZ
prev_version_id UUID NULL FK self
```

#### agent_tool_binding_version
```
tool_binding_version_id UUID PK
agent_id UUID FK
content_sha256 BYTEA
tool_bindings JSONB  -- [{ tool_id, permitted_actions[], rate_limit }]
prev_version_id UUID NULL FK self
```

#### agent_model_config_version
```
model_config_version_id UUID PK
agent_id UUID FK
model_artifact_id UUID FK → model_artifact
model_label TEXT  -- 'AI ベースモデル A (検証用)' 等
inference_params JSONB  -- temperature / top_p / max_tokens
prev_version_id UUID NULL FK self
```

#### agent_permission_grant_version
```
permission_grant_version_id UUID PK
agent_id UUID FK
data_scope TEXT
boundary TEXT
pii_classification_allowed TEXT[] CHECK ⊂ ('bank_internal_id_only','name_address','id_document_hash')
connection_tier_allowed TEXT[] CHECK ⊂ ('standard','quasi_standard','alternative','exception')
write_allowed BOOLEAN
prev_version_id UUID NULL FK self
```
- write_allowed = false が default、Type B 承認後に true に bump

#### tool_definition
```
tool_id UUID PK
tenant_id UUID
tool_key TEXT  -- 'ocr', 'address-master-lookup', 'business-system-write'
display_name TEXT
connection_tier TEXT CHECK IN ('standard','quasi_standard','alternative','exception')
direction TEXT CHECK IN ('read','write','read_write')
external_credential_ref_id UUID FK NULL
idempotency_required BOOLEAN
default_timeout_ms INT
UNIQUE (tenant_id, tool_key)
```

#### model_artifact
```
model_artifact_id UUID PK
tenant_id UUID
artifact_kind TEXT  -- 'base_model_pointer' / 'lora_weights' / 'fine_tune_checkpoint'
storage_ref TEXT  -- s3://... or bedrock model id
sha256 BYTEA NULL  -- self-hosted のみ
license TEXT
registered_at TIMESTAMPTZ
deprecated_at TIMESTAMPTZ NULL
```
- v2 phase は `base_model_pointer` のみ (Bedrock model id を pointer 化)、Phase 2+ で fine-tune artifact 想定

#### external_credential_ref
```
external_credential_ref_id UUID PK
tenant_id UUID
secrets_manager_arn TEXT NOT NULL
rotation_schedule_days INT
last_rotated_at TIMESTAMPTZ
status TEXT CHECK IN ('active','rotation_pending','expired','revoked')
```
- **DB は secret 値を持たない**、ARN refer only

---

### 3.3 Case / Evidence / AI Proposal 層

#### customer_reference (P0 #2 漏れ補正、PII 分離 layer)
```
customer_reference_id UUID PK
tenant_id UUID FK → tenant
external_customer_key_hash BYTEA NOT NULL  -- 顧客番号 SHA-256 (PII minimization)
legal_name_encrypted BYTEA NOT NULL        -- KMS column encryption (per-tenant data key)、`name_address` 分類
address_encrypted BYTEA NULL               -- 同上
corporate_form TEXT NULL                   -- '株式会社' / '合同会社' 等 (非 PII)
pii_classification TEXT NOT NULL CHECK IN ('bank_internal_id_only','name_address','id_document_hash','mixed')
retention_class TEXT NOT NULL              -- §9.4 で trigger 自動付与 (kyc_document / customer_pii)
created_at TIMESTAMPTZ
last_seen_in_case_at TIMESTAMPTZ NULL      -- 直近 case 参照 timestamp、retention lifecycle 起算用
synced_from_master_at TIMESTAMPTZ NULL     -- 基幹 master との sync timestamp (open question §13 #6)
UNIQUE (tenant_id, external_customer_key_hash)
```
- 顧客 master とは別 layer。基幹 system 側 master の cache + PII 分離 boundary
- `case_record.customer_reference_id` から refer、`case_record` 側に PII を持たない (column-level encryption の鍵集約点)
- `synced_from_master_at` の更新方法 (CDC / API / nightly batch) は open question §13 #6
- 1 customer は複数 case を持つ、case 完了後も retention class に従って保持

#### case_record  (Postgres 予約語 `case` 衝突回避、表示 ID は `display_case_id` で別管理)
```
case_id UUID PK  -- ULID/UUIDv7
tenant_id UUID
workflow_id UUID FK
workflow_version_id UUID FK → workflow_version  -- 反映時の版を pin (DOC-FW-01 §6.3)
agent_version_id UUID FK → agent_version  -- 案件処理時の agent 版を pin
display_case_id TEXT UNIQUE  -- 'CASE-2026-0142' (表示用)
status TEXT CHECK IN ('pending','ready','sent-back','business-approval-waiting','reflected','escalated','rolled-back')
current_lifecycle_step TEXT CHECK IN ('受付','AI処理','入力者確認','承認者承認','反映')
received_at TIMESTAMPTZ
assignee_user_id UUID FK NULL  -- 入力者
business_approval_decision_id UUID NULL FK → human_decision
input_confirmation_decision_id UUID NULL FK → human_decision
customer_reference_id UUID FK NULL  -- customer PII layer (§3.6 PII)
business_approval_status TEXT CHECK IN ('未送付','承認待ち','承認済','差戻し')
alert_count INT DEFAULT 0
created_at TIMESTAMPTZ
reflected_at TIMESTAMPTZ NULL  -- 反映完了 timestamp
elapsed_label_cache TEXT  -- 表示用 cache (Inbox queue 列、worker で更新)
```
- **不変条件**:
  - `reflected_at IS NOT NULL` → `business_approval_decision_id IS NOT NULL`
  - `input_confirmation_decision_id` と `business_approval_decision_id` の actor_user_id 不一致 (§5.1 4-eyes)
- `workflow_version_id` / `agent_version_id` は受付時 (`received_at`) の current version を snapshot pin、以降 update しない (§5.3)

#### case_lifecycle_event
```
case_lifecycle_event_id UUID PK
case_id UUID FK
tenant_id UUID
from_status TEXT
to_status TEXT
from_step TEXT
to_step TEXT
event_at TIMESTAMPTZ
triggered_by_user_id UUID NULL  -- system event は NULL
triggered_by_agent_version_id UUID NULL  -- AI event は agent
audit_event_id UUID FK NULL  -- 対応する audit_event があれば
```
- case state machine の transition を記録、`audit_event` とは目的別 (UI 表示 + 業務的 transition history)

#### input_artifact
```
input_artifact_id UUID PK
case_id UUID FK
tenant_id UUID
artifact_kind TEXT  -- 'pdf' / 'image' / 'form_submission'
file_name TEXT
pages INT NULL
content_sha256 BYTEA NOT NULL
storage_ref TEXT  -- s3://... (KMS-encrypted, Object Lock optional)
mime_type TEXT
received_at TIMESTAMPTZ
pii_classification TEXT CHECK IN ('bank_internal_id_only','name_address','id_document_hash','mixed','unknown')
```

#### evidence_step
```
evidence_step_id UUID PK
case_id UUID FK
tenant_id UUID
step_order INT
step_name TEXT  -- 'OCR 抽出' / 'マスタ照合' / 'AI 入力結果生成' 等
actor TEXT CHECK IN ('AI','入力者','承認者','system')
source_identifier TEXT  -- 'ocr-engine-v2.3' / 'db.address_master' / 'ai.address-extractor-v2.3'
screenshot_stack_id UUID FK NULL
confidence NUMERIC(4,3) NULL
status TEXT CHECK IN ('completed','warning','pending')
event_at TIMESTAMPTZ
connection_attempt_id UUID FK NULL  -- 外部 tool call があれば
```

#### screenshot_stack
```
screenshot_stack_id UUID PK
case_id UUID FK
tenant_id UUID
storage_ref TEXT  -- s3://... (KMS-encrypted)
sha256 BYTEA NOT NULL
frame_count INT
captured_at TIMESTAMPTZ
captured_by_agent_version_id UUID FK
```

#### ai_proposal (write-once after human decision)
```
ai_proposal_id UUID PK
case_id UUID FK
tenant_id UUID
agent_version_id UUID FK  -- 生成時の agent 版
workflow_version_id UUID FK  -- 生成時の workflow 版 (case と同じ snapshot)
confidence_overall NUMERIC(4,3)
generated_at TIMESTAMPTZ
proposal_content_sha256 BYTEA NOT NULL
proposal_storage_ref TEXT
prompt_config_version_id UUID FK
referenced_staging_hint_set_id UUID FK NULL  -- staging hint visibility batch
status TEXT CHECK IN ('draft','active','superseded_by_resubmit')
frozen_at TIMESTAMPTZ NULL  -- human decision rendered 時に freeze
UNIQUE (case_id, ai_proposal_id)
```
- **不変条件**: `frozen_at IS NOT NULL` → 以降 update / delete reject (trigger §5.5)、入力者差戻し → 再 generate は **新 row** insert、旧 row は `status='superseded_by_resubmit'` で history 化

#### ai_proposal_field
```
ai_proposal_field_id UUID PK
ai_proposal_id UUID FK
field_label TEXT  -- '法人名' / '新住所' 等
field_value_encrypted BYTEA  -- KMS envelope encryption (PII の可能性ある field)
field_value_plaintext TEXT NULL  -- PII でない場合のみ
old_value_encrypted BYTEA NULL
confidence NUMERIC(4,3)
has_diff BOOLEAN
monospace BOOLEAN
display_order INT
CHECK (field_value_encrypted IS NOT NULL OR field_value_plaintext IS NOT NULL)
```
- field 単位で PII か否か判定、encrypted column は KMS data key (per-tenant) envelope

#### alert
```
alert_id UUID PK
case_id UUID FK
tenant_id UUID
ai_proposal_id UUID FK NULL  -- 生成 trigger となった proposal
alert_key TEXT  -- 'kyc_overlap' / 'past_90day_changes' / 'gsi_verify_fail' / 'corporate_form_change' / 'address_mismatch'
severity TEXT CHECK IN ('caution','severe')
message TEXT  -- operational copy
source_step TEXT
triggered_at TIMESTAMPTZ
triaged_by_user_id UUID NULL FK
triage_decision TEXT CHECK IN ('accept_proceed','escalate','request_more_info','rejected_as_false_positive') NULL
triaged_at TIMESTAMPTZ NULL
```

---

### 3.4 Approval 層

#### human_decision
```
human_decision_id UUID PK
tenant_id UUID
case_id UUID FK
ai_proposal_id UUID FK
decision_kind TEXT CHECK IN ('input_confirmation_accept','input_confirmation_sendback','business_approval_accept','business_approval_reject','business_approval_escalate')
actor_user_id UUID FK
actor_role_assignment_id UUID FK  -- どの role で実施したか
decided_at TIMESTAMPTZ
comment TEXT NULL  -- free text (PII 可能性、KMS encrypted)
sendback_comment_id UUID NULL FK → sendback_comment
prev_decision_id UUID NULL FK self  -- sendback 後の re-confirmation で chain
```
- 不変: `frozen_at` 相当として `decided_at` 確定後 update / delete reject (§5.4)

#### sendback_comment
```
sendback_comment_id UUID PK
tenant_id UUID
case_id UUID FK
ai_proposal_id UUID FK
human_decision_id UUID FK
category TEXT CHECK IN ('misunderstanding','ui_change','edge_case','judgment_gap','data_error')
free_text TEXT
selected_evidence_ids UUID[]  -- 関連根拠の evidence_step_id array
created_at TIMESTAMPTZ
created_by_user_id UUID FK
```

#### procedure_proposal
```
procedure_proposal_id UUID PK
tenant_id UUID
display_proposal_id TEXT UNIQUE  -- 'PROP-2026-031'
workflow_id UUID FK
proposed_workflow_version_id UUID NULL FK  -- 承認時に set
proposal_source TEXT CHECK IN ('ai_daily_analysis','manual_admin','boundary_review')  -- v2 では ai_daily_analysis のみ
ai_analysis_run_id UUID NULL  -- AI 日次分析の run reference
generated_at TIMESTAMPTZ
title TEXT
summary TEXT
status TEXT CHECK IN ('pending_triage','forwarded','approved','rejected','superseded')
queue_owner_user_id UUID FK NULL  -- Manual 管理者 (R)
approver_user_id UUID FK NULL  -- 業務責任者 (A)
forwarded_at TIMESTAMPTZ NULL
approved_at TIMESTAMPTZ NULL
rejected_at TIMESTAMPTZ NULL
rejection_reason TEXT NULL
decision_criteria JSONB  -- [{label, value, threshold, met}]
hypothesis_label TEXT DEFAULT '仮説 / 要検証'
CHECK (queue_owner_user_id IS DISTINCT FROM approver_user_id)  -- SoD
```
- v2 確定: source = AI、組織責任は 2 ロール (Queue owner / Approver)、SoD 強 enforcement

#### procedure_proposal_diff
```
procedure_proposal_diff_id UUID PK
procedure_proposal_id UUID FK
tenant_id UUID
target_file TEXT CHECK IN ('workflow.md','agent-instructions.md','approval-policy.md')
section_anchor TEXT
before_content_sha256 BYTEA
after_content_sha256 BYTEA
diff_storage_ref TEXT  -- unified diff or structured patch
display_order INT
```

#### procedure_proposal_source_link
```
procedure_proposal_source_link_id UUID PK
procedure_proposal_id UUID FK
case_id UUID FK   -- 元 case (sendback origin)
sendback_comment_id UUID FK
knowledge_snippet_version_id UUID FK NULL  -- 元 staging snippet (low/medium)
contribution_weight NUMERIC(3,2)  -- AI 日次分析が算出
```

#### config_change_request
```
config_change_request_id UUID PK
tenant_id UUID
agent_id UUID FK
proposed_agent_version_id UUID NULL FK
proposal_source TEXT CHECK IN ('ai_admin_manual','ai_boundary_review','procedure_approval_cascade')
proposed_changes JSONB  -- which sub-config (prompt/tool/model/permission) changed
detected_type TEXT CHECK IN ('A','B','C')  -- trigger で自動算出
requested_by_user_id UUID FK
requested_at TIMESTAMPTZ
status TEXT CHECK IN ('pending','approved','rejected','rolled_back')
```

#### config_change_approval
```
config_change_approval_id UUID PK
tenant_id UUID
config_change_request_id UUID FK
approval_type TEXT CHECK IN ('A','B','C')
approver_user_id UUID FK
co_approver_user_id UUID NULL FK  -- Type B/C 必須
approved_at TIMESTAMPTZ
rollback_plan_ref TEXT NOT NULL  -- DOC-APP-02 §4.4
post_apply_check_status TEXT CHECK IN ('pending','passed','failed','skipped') DEFAULT 'pending'
-- Note (Finding 1 修正): CHECK constraint で外部 table (`config_change_request.requested_by_user_id`) を参照不可、
-- かつ AND/OR 優先順位 + IS DISTINCT FROM の NULL semantics の combo で Type A SoD が壊れていた。
-- SoD enforcement は §5.8 の trigger `enforce_config_approval_sod` で 1 箇所に集約。CHECK constraint は持たない。
```

#### boundary_review_proposal
```
boundary_review_proposal_id UUID PK
tenant_id UUID
workflow_id UUID FK  -- restricted boundary pack
proposal_source TEXT CHECK IN ('ai_analysis')
generated_at TIMESTAMPTZ
analysis_run_id UUID
proposed_changes JSONB  -- e.g. high_value_threshold delta
queue_owner_user_id UUID FK
approver_config_change_approval_id UUID FK
status TEXT CHECK IN ('pending','approved','rejected')
hypothesis_label TEXT DEFAULT '仮説 / 要検証'
```

---

### 3.5 Knowledge 層

#### knowledge_snippet (current pointer)
```
knowledge_snippet_id UUID PK
tenant_id UUID
display_snippet_id TEXT UNIQUE  -- 'KN-CORP-001' / 'STG-CORP-005'
workflow_id UUID FK
agent_id UUID FK
current_version_id UUID FK → knowledge_snippet_version
current_lifecycle_state TEXT CHECK IN ('new','review_required','stale','archived','rejected')
current_weight TEXT CHECK IN ('low','medium','high')
category TEXT CHECK IN ('misunderstanding','ui_change','edge_case','judgment_gap','data_error')
created_at TIMESTAMPTZ
created_from_sendback_comment_id UUID FK NULL  -- 元 sendback (staging origin の場合)
created_from_case_id UUID FK NULL
data_error_special_routing BOOLEAN GENERATED ALWAYS AS (category = 'data_error') STORED
```

#### knowledge_snippet_version (immutable)
```
knowledge_snippet_version_id UUID PK
knowledge_snippet_id UUID FK
version_label TEXT
weight TEXT CHECK IN ('low','medium','high')
title TEXT
body_content_sha256 BYTEA
body_storage_ref TEXT
agent_version_id UUID FK  -- frontmatter agent_version との整合
date_field DATE NOT NULL  -- frontmatter date
promoted_at TIMESTAMPTZ NULL  -- weight 昇格時刻
promoted_by_procedure_proposal_id UUID NULL FK
prev_version_id UUID NULL FK self
embedding VECTOR(1536)  -- pgvector、Bedrock Titan Embedding v2 想定
-- Note (Finding 4 修正): CHECK constraint 内の subquery は PostgreSQL で禁止 (`ERROR: cannot use subquery in check constraint`)。
-- data_error の weight=high 昇格禁止は §5.4 の trigger `enforce_snippet_weight_promotion` で enforce。
```
- 不変 (insert only)、weight 昇格は **新 version 作成**、旧 version は archive
- pgvector で similarity search (AI 日次分析の embedding clustering)

#### snippet_lifecycle_state (transition log)
```
snippet_lifecycle_state_id UUID PK
knowledge_snippet_id UUID FK
from_state TEXT
to_state TEXT
from_weight TEXT
to_weight TEXT
transitioned_at TIMESTAMPTZ
trigger_kind TEXT CHECK IN ('age_based','manual_triage','procedure_approval','conflict_detection','rejection','auto_merge')
related_procedure_proposal_id UUID NULL FK
related_audit_event_id UUID NULL FK
```

#### citation_linkage (compiled only)
```
citation_linkage_id UUID PK
tenant_id UUID
ai_proposal_id UUID FK
knowledge_snippet_version_id UUID FK
relevance NUMERIC(4,3)
display_order INT
UNIQUE (ai_proposal_id, knowledge_snippet_version_id)
-- Note (Finding 4 修正): CHECK の subquery は不可、enforcement は §5.4 trigger `enforce_citation_weight_high` に集約。
-- citation = weight='high' AND category != 'data_error' を trigger で物理 enforce (DOC-FW-01 §3.5 / DOC-KNW-04 §6.2)。
-- 過去 case が pin した version_id の weight は immutable (version 不変)、後の supersede は新 version_id を別に作るため、
-- citation の version_id 自体は永続的に当時の `high` を refer する (= 過去 case 不変原則と整合)。
```

#### staging_hint_visibility (low/medium only)
```
staging_hint_visibility_id UUID PK
tenant_id UUID
ai_proposal_id UUID FK
knowledge_snippet_version_id UUID FK
hint_purpose TEXT CHECK IN ('confidence_signal','reviewer_hint','follow_up_question_trigger')
display_order INT
-- Note (Finding 4 修正): CHECK の subquery は不可、enforcement は §5.4 trigger `enforce_staging_hint_visibility` に集約。
-- weight IN ('low','medium') AND category != 'data_error' を trigger で enforce、
-- AI prompt 組み立て時に table を join して取得 (DOC-KNW-04 §6.2 の Reference section)。
```

---

### 3.6 Audit / Observability 層

#### audit_event (append-only、partition、hash chain)
```
audit_event_id UUID PK  -- ULID
tenant_id UUID
event_type TEXT  -- 'system_intake' / 'ai_input' / 'human_review' / 'human_sendback' / 'ai_analysis' / 'proposal_approve' / 'business_approve' / 'reflect' / 'rule_update_alert' / 'config_approve' / 'matrix_c_escalation' / 'matrix_c_emergency_stop' / 'matrix_c_rollback' / 'matrix_c_forced_downgrade'
case_id UUID FK NULL
workflow_id UUID FK NULL
workflow_version_id UUID FK NULL
agent_id UUID FK NULL
agent_version_id UUID FK NULL
prompt_config_version_id UUID FK NULL
tool_config_version_id UUID FK NULL  -- tool_binding_version_id alias
model_config_version_id UUID FK NULL
input_artifact_id UUID FK NULL
input_artifact_hash BYTEA NULL  -- materialized for tamper detection
screenshot_stack_id UUID FK NULL
ai_proposal_id UUID FK NULL
human_decision_id UUID FK NULL
sendback_category TEXT NULL
compiled_knowledge_citation_ids UUID[] NULL  -- knowledge_snippet_version_id array
approval_timestamp TIMESTAMPTZ NULL
approver_id UUID NULL
diff_id UUID NULL  -- procedure_proposal_diff_id
rollback_ref UUID NULL  -- matrix_c_event_id
actor TEXT  -- 'system' / 'AI' / 'input-operator' / 'approver' / 'manual-admin' / 'ai-admin' / 'business-owner'
actor_user_id UUID NULL
event_at TIMESTAMPTZ NOT NULL
summary TEXT
extra_payload JSONB
prev_hash BYTEA NOT NULL  -- chain hash (SHA-256 of prev row canonical bytes)
this_hash BYTEA NOT NULL  -- this row hash
) PARTITION BY RANGE (event_at)
```
- 15 行 (実 18 field、paired field 含む) SSOT (DOC-KNW-04 §8.1) を物理化
- **hash chain (Finding 3 修正)**: chain head 参照を `audit_event` partition table から **`audit_chain_head` 別 table** に分離 (§3.6 直下)、partition 跨ぎ scan + 取りこぼし risk を排除。詳細 trigger 実装は §5.6
- 月次 partition、**streaming export** (5 分以下) を S3 Object Lock Compliance bucket に (§9 で daily snapshot から差し替え)
- 物理 `REVOKE UPDATE, DELETE ON audit_event_*` from all roles + trigger `RAISE EXCEPTION ON UPDATE OR DELETE`

#### audit_chain_head (Finding 3、per-tenant chain head 分離)
```
tenant_id UUID PRIMARY KEY
last_audit_event_id UUID NOT NULL
last_this_hash BYTEA NOT NULL
last_event_at TIMESTAMPTZ NOT NULL
chain_length BIGINT NOT NULL
updated_at TIMESTAMPTZ NOT NULL
```
- audit_event insert trigger は本 table の 1 row のみ `FOR UPDATE` lock、partition 跨ぎ scan 不要
- `audit_chain_head` 自体は mutable、ただし update は audit_event trigger 経由でのみ、他 path からは REVOKE

#### kpi_measurement (time-series)
```
kpi_measurement_id UUID PK
tenant_id UUID
workflow_id UUID FK
kpi_key TEXT  -- 'K1' .. 'K7'
window_start TIMESTAMPTZ NOT NULL
window_end TIMESTAMPTZ NOT NULL
aggregation_kind TEXT CHECK IN ('daily','weekly','monthly')
numerator INT  -- 分子 (raw count)
denominator INT  -- 分母
value NUMERIC(8,5)  -- numerator/denominator
target_hypothesis TEXT  -- '≥ 0.99' etc
hypothesis_label TEXT DEFAULT '仮説 / 要検証'
sample_size INT
exclusions_jsonb JSONB  -- {'data_error_excluded': true, 'minor_revision_excluded': true} 等 (K2 軽微 vs 実質、K4 二重カウント防止)
-- K3 拡張 (Finding 10): precision と FP rate は denominator が異なる (precision = alert 中、FP = no-alert 中) ため
-- 単一 denominator では表現不能。K3 専用 4 column を追加、formula_ref で算出式 SSOT を pointer 化
k3_alert_total INT NULL                  -- precision denominator (Alert 発生 case 数)
k3_alert_true_positive INT NULL          -- precision numerator (Alert 該当の真陽性 case 数)
k3_no_alert_total INT NULL               -- FP rate denominator (Alert 不発火 case 数)
k3_no_alert_false_negative INT NULL      -- FP rate との対 (Alert 不発火だが本来 Alert 必要だった case)
precision_value NUMERIC(8,5) NULL        -- = k3_alert_true_positive / k3_alert_total
false_positive_rate NUMERIC(8,5) NULL    -- = (k3_alert_total - k3_alert_true_positive) / k3_alert_total (Alert 中の FP)
measurement_formula_ref TEXT NULL        -- s3://... or hash pointer、計算式 SSOT (DOC-MON-05 §4.2.3 と同期)
computed_at TIMESTAMPTZ
source_query_sha256 BYTEA  -- 集計 query の hash (再現性)
CHECK (kpi_key <> 'K3' OR (k3_alert_total IS NOT NULL AND k3_alert_true_positive IS NOT NULL))
UNIQUE (tenant_id, workflow_id, kpi_key, window_start, aggregation_kind)
) PARTITION BY RANGE (window_start)
```
- KPI K1-K7 (DOC-MON-05 §5) を統一 schema、K2 / K3 / K4 の特殊 field は optional column
- **Finding 10 修正**: K3 (Alert 発生率 + precision + FP rate) は denominator 異なる 2 指標を 1 row に格納。`measurement_formula_ref` で DOC-MON-05 §4.2.3 と SSOT 同期、population-level FP vs alert-level FP の式定義は Phase 1 設計 gate で確定 (open question §13 #18)

#### kri_state_snapshot
```
kri_state_snapshot_id UUID PK
tenant_id UUID
workflow_id UUID FK NULL  -- tenant-wide なら NULL
kri_key TEXT  -- 'R1' .. 'R9'
snapshot_at TIMESTAMPTZ
state TEXT CHECK IN ('normal','caution','warning')
trigger_condition_evaluation JSONB  -- evaluated values
response_action_taken TEXT NULL
related_matrix_c_event_id UUID NULL FK
hypothesis_label TEXT DEFAULT '仮説 / 要検証'
) PARTITION BY RANGE (snapshot_at)
```

#### matrix_c_event
```
matrix_c_event_id UUID PK
tenant_id UUID
event_kind TEXT CHECK IN ('escalation','emergency_stop','rollback','forced_downgrade')
initiated_by_user_id UUID FK
initiated_at TIMESTAMPTZ
target_scope JSONB  -- {workflow_id, agent_version_id, ...}
reason TEXT
risk_classification TEXT
co_approver_user_id UUID NULL  -- emergency stop / forced downgrade は事後 co-A
post_event_status TEXT CHECK IN ('open','reviewed','closed')
rollback_target_version_id UUID NULL  -- rollback の場合
audit_event_id UUID FK
```

---

### 3.7 External Integration 層

#### connection_attempt
```
connection_attempt_id UUID PK
tenant_id UUID
case_id UUID FK NULL
evidence_step_id UUID FK NULL
tool_id UUID FK
agent_version_id UUID FK
tier TEXT CHECK IN ('standard','quasi_standard','alternative','exception')
direction TEXT CHECK IN ('read','write')
idempotency_key TEXT
attempted_at TIMESTAMPTZ
completed_at TIMESTAMPTZ NULL
request_storage_ref TEXT  -- s3://... (request payload archive, KMS-encrypted)
response_storage_ref TEXT
response_status TEXT  -- HTTP status / MQ ack / RPA result code
artifact_hash BYTEA  -- response content hash
correlation_id TEXT
retry_count INT
dead_letter_ref TEXT NULL  -- DLQ entry pointer (準標準 tier)
ui_drift_detected BOOLEAN  -- 代替 tier (RPA/Computer Use)
human_fallback_user_id UUID NULL  -- UI drift 時の fallback
write_authorized_by_config_approval_id UUID NULL  -- write 時必須 (Type B 承認 trace)
UNIQUE (tenant_id, tool_id, idempotency_key, attempted_at)  -- partition friendly only、真の idempotency 防御ではない
) PARTITION BY RANGE (attempted_at)
```
- DOC-OV-00 §2.2 + DOC-ROOT-\_SSOT §1.5 の control matrix を物理化
- write は `write_authorized_by_config_approval_id` 必須 (trigger enforce)
- 例外 (DB 直接続) tier は read only を check constraint で
- **Finding 7 修正**: `UNIQUE (tenant_id, tool_id, idempotency_key, attempted_at)` は partition table の partition key 必須制約への妥協であり、`attempted_at` が異なる retry を別 row として許容する = **真の重複防止にならない**。真の idempotency 防御は次の `idempotency_registry` table で行う

#### idempotency_registry (Finding 7、真の重複 write 防御の SSOT)
```
tenant_id UUID NOT NULL
tool_id UUID NOT NULL
idempotency_key TEXT NOT NULL
first_attempt_id UUID NOT NULL REFERENCES connection_attempt(connection_attempt_id)
first_attempted_at TIMESTAMPTZ NOT NULL
final_status TEXT CHECK IN ('in_flight','success','failed','dlq_routed')
completed_at TIMESTAMPTZ NULL
PRIMARY KEY (tenant_id, tool_id, idempotency_key)
```
- application は `connection_attempt` insert 前に `INSERT INTO idempotency_registry ... ON CONFLICT DO NOTHING`、conflict 時は既存 `first_attempt_id` の result を返す
- `final_status='in_flight'` の retry は同一 attempt として扱う、`success`/`failed` 確定後は再試行 = 業務 system 側の二重発注 risk として alarm

#### boundary_definition_version (Finding 13、typed threshold 強化)
```
boundary_definition_version_id UUID PK
boundary_definition_id UUID FK
boundary_kind TEXT CHECK IN ('international_transfer','kyc_final','credit_final','other')
schema_version TEXT NOT NULL DEFAULT 'v1'
structured_threshold JSONB NOT NULL
  -- international_transfer の expected shape:
  --   { high_value_threshold: { amount: number, currency: TEXT, status: 'hypothesis_requires_validation' | 'validated' },
  --     automation_above_threshold: 'prohibited',
  --     automation_below_threshold: 'future_candidate' }
rationale TEXT
hypothesis_label TEXT
approved_by_config_change_approval_id UUID FK
approved_at TIMESTAMPTZ
prev_version_id UUID NULL FK self
-- shape validation は §5.9 trigger `validate_boundary_threshold` で per boundary_kind に enforce
-- Phase 2+ で kyc_final / credit_final が追加されたら同 trigger に分岐追加
```

#### boundary_definition
```
boundary_definition_id UUID PK
tenant_id UUID
workflow_id UUID FK  -- restricted のみ
current_version_id UUID FK → boundary_definition_version
created_at TIMESTAMPTZ

-- 子 table:
boundary_definition_version
  boundary_definition_version_id UUID PK
  boundary_definition_id UUID FK
  threshold_definition JSONB  -- { high_value_threshold, threshold_status: 'hypothesis_requires_validation', ... }
  rationale TEXT
  hypothesis_label TEXT
  approved_by_config_change_approval_id UUID FK
  approved_at TIMESTAMPTZ
  prev_version_id UUID NULL FK self
```

---

## 4. 状態機械

### 4.1 Case state

```
                   ┌─────────────────────────────────────────────────────────┐
                   │                                                         │
                   ▼                                                         │
[pending] ──AI完了──▶ [ready] ──入力者accept──▶ [business-approval-waiting]
   │                    │                              │       │
   │                    │ 入力者sendback                │       │ 承認者reject
   │                    ▼                              │       ▼
   │              [sent-back] ──再AI処理──▶ [ready]    │  [sent-back]
   │                                                   │
   │ alert escalate                                    │ 承認者approve
   ▼                                                   ▼
[escalated]                                       [reflected] ─関連手順更新──▶ (派生 Alert、本体は不変)
                                                       │
                                                       │ Matrix C rollback
                                                       ▼
                                                  [rolled-back]
```

不変条件:
- `reflected` 以降は `ai_proposal`, `ai_proposal_field`, `human_decision`, `sendback_comment` の update / delete reject
- `escalated` / `rolled-back` も history 保護のため update / delete reject (例外: `business_approval_status` の 1 度だけ可、auditor 承認 trail 付き)

### 4.2 Knowledge snippet weight & lifecycle 2 軸

Weight axis: `low` → `medium` → `high` (一方向)、`high` から `low` 戻りは不可。`high` を取り下げる場合は **新 procedure_proposal で superseding** (旧 version archive、新 version で再定義)。

Lifecycle axis: `new` → `review_required` → `stale` → `archived` (時間 + Manual 管理者 triage)、`rejected` は独立、`auto_merged` は archive 経由。

2 軸独立: `weight=low, lifecycle=stale` の組合せあり。

### 4.3 Procedure proposal state

```
[pending_triage] ──forward──▶ [forwarded] ──approve──▶ [approved] (= workflow_version publish trigger)
       │                          │
       │ reject                   │ reject
       ▼                          ▼
   [rejected]                 [rejected]
```

approved 時に **同 transaction** で:
1. 新 `workflow_version` row insert
2. 関連 `knowledge_snippet_version` で weight = high の version insert (旧 staging version を superseding)
3. `workflow.current_version_id` update
4. `audit_event (event_type='proposal_approve')` insert
5. `audit_event (event_type='rule_update_alert')` insert (派生 Alert 用 marker、過去 case の Audit Trail 表示で使う)
6. **`cdc_outbox.case_event_outbox` に `event_type='workflow_version_published'` insert** (Finding 12 修正、transactional outbox §8.5)
   → EventBridge → Lambda が即座に該当 `workflow_id` 配下の `ready` / `business-approval-waiting` case に対し
   application-layer Alert (適用範囲 1) を即時可視化 (UI poll / WebSocket push)。
   `mv_related_rule_update_alert` の hourly refresh 遅延に依存しない経路を担保。
7. `mv_related_rule_update_alert` は **集計 + AuditTrail 表示用** として best-effort hourly refresh (UI 即時 Alert は #6 が SSOT)

### 4.4 Config change state

```
[pending] ──A: approve──▶ [approved] ──post_apply_check_passed──▶ (active)
   │                          │                                       │
   │                          │ check_failed                          │ Matrix C rollback
   │                          ▼                                       ▼
   │                      [rolled_back]                          [rolled_back]
   │
   │ reject
   ▼
[rejected]
```

Type B/C は **co_approver_user_id IS NOT NULL** check constraint で強制。

---

## 5. 不変条件 + Enforcement Layer

### 5.1 4-eyes (案件承認 SoD) — Decision Brief P1 #6 強化: tenant/case/decision_kind 整合も verify

```sql
CREATE OR REPLACE FUNCTION enforce_case_4eyes() RETURNS TRIGGER AS $$
DECLARE
  v_input RECORD;
  v_business RECORD;
BEGIN
  IF NEW.business_approval_decision_id IS NOT NULL AND NEW.input_confirmation_decision_id IS NOT NULL THEN
    SELECT actor_user_id, tenant_id, case_id, decision_kind, decided_at
      INTO v_input FROM app.human_decision
     WHERE human_decision_id = NEW.input_confirmation_decision_id;
    SELECT actor_user_id, tenant_id, case_id, decision_kind, decided_at
      INTO v_business FROM app.human_decision
     WHERE human_decision_id = NEW.business_approval_decision_id;

    -- (1) actor 不一致 (本来の 4-eyes 主条件)
    IF v_input.actor_user_id = v_business.actor_user_id THEN
      RAISE EXCEPTION 'SoD violation: case 4-eyes — input_confirmation actor (%) must differ from business_approval actor (%)',
        v_input.actor_user_id, v_business.actor_user_id USING ERRCODE = '23514';
    END IF;

    -- (2) tenant 整合 (cross-tenant FK leak 防御)
    IF v_input.tenant_id IS DISTINCT FROM NEW.tenant_id OR v_business.tenant_id IS DISTINCT FROM NEW.tenant_id THEN
      RAISE EXCEPTION 'integrity: decision tenant_id mismatch with case_record';
    END IF;

    -- (3) case_id 整合 (異 case の decision FK 設定防御)
    IF v_input.case_id IS DISTINCT FROM NEW.case_id OR v_business.case_id IS DISTINCT FROM NEW.case_id THEN
      RAISE EXCEPTION 'integrity: decision.case_id must equal case_record.case_id';
    END IF;

    -- (4) decision_kind 整合 (入力者確認 ⇄ 承認者承認 の役割逆転防御)
    IF v_input.decision_kind NOT IN ('input_confirmation_accept','input_confirmation_sendback') THEN
      RAISE EXCEPTION 'integrity: input_confirmation_decision_id points to wrong decision_kind: %', v_input.decision_kind;
    END IF;
    IF v_business.decision_kind NOT IN ('business_approval_accept','business_approval_reject','business_approval_escalate') THEN
      RAISE EXCEPTION 'integrity: business_approval_decision_id points to wrong decision_kind: %', v_business.decision_kind;
    END IF;

    -- (5) 時系列整合 (承認者は入力者確認 後に decide)
    IF v_business.decided_at < v_input.decided_at THEN
      RAISE EXCEPTION 'integrity: business_approval (%s) must occur after input_confirmation (%s)',
        v_business.decided_at, v_input.decided_at;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_case_4eyes BEFORE INSERT OR UPDATE ON app.case_record FOR EACH ROW EXECUTE FUNCTION enforce_case_4eyes();
```

同じ整合性パターン (tenant / case / proposal 一致) を **citation_linkage trigger (§5.4)** + **procedure_proposal Queue owner ≠ Approver (§5.8 row)** + **config_change_approval SoD trigger (§5.8.1)** にも適用すべき。Phase 1 ops gate で全 SoD trigger に統一 review。`citation_linkage` の場合: `ai_proposal.tenant_id` = `knowledge_snippet.tenant_id` = `citation_linkage.tenant_id` を trigger で verify。

### 5.2 Workflow version / Agent version immutability

```sql
REVOKE UPDATE, DELETE ON workflow_version FROM PUBLIC, app_writer, app_reader;
CREATE TRIGGER trg_wfv_immutable BEFORE UPDATE OR DELETE ON app.workflow_version
  FOR EACH ROW EXECUTE FUNCTION raise_immutable_violation();
-- 同上を agent_version + 4 sub-config _version + knowledge_snippet_version + ai_proposal (after frozen_at) + human_decision (after decided_at) + audit_event に適用
```

### 5.3 Case snapshot pinning

```sql
CREATE OR REPLACE FUNCTION pin_case_versions_at_intake() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND (NEW.workflow_version_id IS DISTINCT FROM OLD.workflow_version_id OR NEW.agent_version_id IS DISTINCT FROM OLD.agent_version_id) THEN
    RAISE EXCEPTION 'case_record.workflow_version_id and agent_version_id are pinned at intake and cannot be modified';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### 5.4 Citation weight = high enforcement (Finding 4、subquery 不可問題 + data_error 防御)

```sql
CREATE OR REPLACE FUNCTION enforce_citation_weight_high() RETURNS TRIGGER AS $$
DECLARE v_weight TEXT; v_category TEXT;
BEGIN
  SELECT v.weight, ks.category INTO v_weight, v_category
    FROM knowledge_snippet_version v
    JOIN knowledge_snippet ks ON ks.knowledge_snippet_id = v.knowledge_snippet_id
   WHERE v.knowledge_snippet_version_id = NEW.knowledge_snippet_version_id;
  IF v_weight <> 'high' THEN
    RAISE EXCEPTION 'citation_linkage requires version.weight=high (got %, snippet_version=%)',
      v_weight, NEW.knowledge_snippet_version_id USING ERRCODE='23514';
  END IF;
  IF v_category = 'data_error' THEN
    RAISE EXCEPTION 'citation_linkage cannot reference data_error category snippet' USING ERRCODE='23514';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_citation_weight BEFORE INSERT ON app.citation_linkage FOR EACH ROW EXECUTE FUNCTION enforce_citation_weight_high();

CREATE OR REPLACE FUNCTION enforce_staging_hint_visibility() RETURNS TRIGGER AS $$
DECLARE v_weight TEXT; v_category TEXT;
BEGIN
  SELECT v.weight, ks.category INTO v_weight, v_category
    FROM knowledge_snippet_version v
    JOIN knowledge_snippet ks ON ks.knowledge_snippet_id = v.knowledge_snippet_id
   WHERE v.knowledge_snippet_version_id = NEW.knowledge_snippet_version_id;
  IF v_weight NOT IN ('low','medium') THEN
    RAISE EXCEPTION 'staging_hint_visibility requires weight low/medium (got %)', v_weight USING ERRCODE='23514';
  END IF;
  IF v_category = 'data_error' THEN
    RAISE EXCEPTION 'staging_hint_visibility cannot reference data_error category snippet' USING ERRCODE='23514';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_staging_hint_vis BEFORE INSERT ON app.staging_hint_visibility FOR EACH ROW EXECUTE FUNCTION enforce_staging_hint_visibility();

CREATE OR REPLACE FUNCTION enforce_snippet_weight_promotion() RETURNS TRIGGER AS $$
DECLARE v_category TEXT;
BEGIN
  SELECT category INTO v_category FROM knowledge_snippet WHERE knowledge_snippet_id = NEW.knowledge_snippet_id;
  IF NEW.weight = 'high' AND v_category = 'data_error' THEN
    RAISE EXCEPTION 'data_error category cannot be promoted to weight=high (compiled)' USING ERRCODE='23514';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_snippet_weight_promo BEFORE INSERT ON app.knowledge_snippet_version FOR EACH ROW EXECUTE FUNCTION enforce_snippet_weight_promotion();
```

### 5.5 AI proposal freeze

```sql
CREATE OR REPLACE FUNCTION freeze_ai_proposal_on_decision() RETURNS TRIGGER AS $$
BEGIN
  UPDATE ai_proposal SET frozen_at = NOW() WHERE ai_proposal_id = NEW.ai_proposal_id AND frozen_at IS NULL;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_freeze_proposal AFTER INSERT ON app.human_decision FOR EACH ROW EXECUTE FUNCTION freeze_ai_proposal_on_decision();

CREATE OR REPLACE FUNCTION block_frozen_proposal_update() RETURNS TRIGGER AS $$
BEGIN
  IF OLD.frozen_at IS NOT NULL THEN
    RAISE EXCEPTION 'ai_proposal % is frozen since %, modification not permitted', OLD.ai_proposal_id, OLD.frozen_at;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_proposal_frozen BEFORE UPDATE ON app.ai_proposal FOR EACH ROW EXECUTE FUNCTION block_frozen_proposal_update();
```

### 5.6 Audit event append-only + hash chain (Finding 3、chain head 分離で per-tenant TPS 改善)

```sql
-- chain head 別 table への lock 分離により partition 跨ぎ scan 排除、
-- per-tenant 200-300 events/sec を Aurora Serverless v2 で sustain 目標 (Phase 1 measurement)。
CREATE OR REPLACE FUNCTION audit_event_hash_chain() RETURNS TRIGGER AS $$
DECLARE
  v_prev_hash BYTEA;
  v_canonical BYTEA;
BEGIN
  SELECT last_this_hash INTO v_prev_hash
    FROM audit.audit_chain_head
   WHERE tenant_id = NEW.tenant_id
   FOR UPDATE;
  IF NOT FOUND THEN
    v_prev_hash := decode('00', 'hex');
    INSERT INTO audit.audit_chain_head(tenant_id, last_audit_event_id, last_this_hash, last_event_at, chain_length, updated_at)
      VALUES (NEW.tenant_id, NEW.audit_event_id, decode('00','hex'), NEW.event_at, 0, now());
  END IF;
  v_canonical := convert_to(
    NEW.audit_event_id::text || '|' || NEW.tenant_id::text || '|' || NEW.event_type || '|' ||
    COALESCE(NEW.case_id::text, '') || '|' || COALESCE(NEW.ai_proposal_id::text, '') || '|' ||
    NEW.event_at::text || '|' || NEW.actor || '|' || COALESCE(NEW.summary, '') || '|' ||
    encode(v_prev_hash, 'hex'),
    'UTF8'
  );
  NEW.prev_hash := v_prev_hash;
  NEW.this_hash := digest(v_canonical, 'sha256');
  UPDATE audit.audit_chain_head
     SET last_audit_event_id = NEW.audit_event_id,
         last_this_hash = NEW.this_hash,
         last_event_at = NEW.event_at,
         chain_length = chain_length + 1,
         updated_at = now()
   WHERE tenant_id = NEW.tenant_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_audit_hash BEFORE INSERT ON audit.audit_event FOR EACH ROW EXECUTE FUNCTION audit_event_hash_chain();

CREATE OR REPLACE FUNCTION audit_event_block_mutation() RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'audit_event is append-only';
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_audit_no_update BEFORE UPDATE OR DELETE OR TRUNCATE ON audit.audit_event FOR EACH STATEMENT EXECUTE FUNCTION audit_event_block_mutation();
```

**Note (Phase 2+ TPS 拡張)**: 200-300 events/sec/tenant を超過する規模 (Computer Use screenshot stack で multi-workflow 同時並走) になった場合、(a) chain head を `(tenant_id, workflow_id)` sub-chain に分割、(b) batch hash chain (event を queue で受けて N event ごとに 1 hash anchor) を別 schema で評価。本 v2 phase では 200 events/sec/tenant を Phase 1 exit criterion とする。

### 5.7 RLS (Row-Level Security) policy

全 tenant-aware table:
```sql
ALTER TABLE workflow ENABLE ROW LEVEL SECURITY;
CREATE POLICY workflow_tenant_isolation ON workflow USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
-- 同上を 42 entity 中 38 (tenant 自体と 3 個の seed/共有 lookup 除く) に適用
```

加えて role-based read filter:
```sql
CREATE POLICY case_role_visibility ON app.case_record FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM role_assignment ra
    JOIN screen_access_grant sag ON sag.role_id = ra.role_id AND sag.screen_key = 'case_review'
    WHERE ra.user_id = current_setting('app.current_user_id')::UUID
      AND ra.tenant_id = case_record.tenant_id
      AND (ra.workflow_id IS NULL OR ra.workflow_id = case_record.workflow_id)
      AND sag.access_level IN ('read','write','approve','triage')
      AND now() BETWEEN ra.valid_from AND COALESCE(ra.valid_to, 'infinity'::timestamptz)
  )
);
```

### 5.8 SoD 強 enforcement matrix (Finding 1 修正、CHECK subquery 不可問題解消)

| 主体ペア (要 distinct)                                         | enforce 層                                                                       | 起源 docs              |
| -------------------------------------------------------------- | -------------------------------------------------------------------------------- | ---------------------- |
| 入力者 ≠ 承認者 (案件承認 4-eyes)                              | `case_record` trigger §5.1 + RLS                                                | DOC-APP-02 §2.2 / §6.1 |
| Queue owner ≠ Approver (手順承認)                              | `procedure_proposal` CHECK constraint (同 table 内列のみ) + trigger              | DOC-APP-02 §3.6        |
| 起票者 ≠ 承認者 (設定承認 Type A)                              | **§5.8.1 trigger `enforce_config_approval_sod`** (CHECK は外部参照不可)          | DOC-APP-02 §4.3        |
| 承認者 ≠ co-Approver (Type B/C)                                | **§5.8.1 同 trigger** (CHECK で書いていた条件を trigger に統合)                 | DOC-APP-02 §4.2        |
| Auditor は never approve (read_only)                           | RLS + trigger (`is_audit_only=true` role での `human_decision` insert reject)    | DOC-APP-02 §5.2        |
| Manual 管理者 と 業務責任者 の役職兼務不可 (Phase 1 SOP 任せ)  | Soft enforcement: `role_assignment` 2 重 active → audit_event WARN flag         | DOC-APP-02 §3.6        |

#### 5.8.1 `enforce_config_approval_sod` (Finding 1 統合 trigger)

```sql
CREATE OR REPLACE FUNCTION enforce_config_approval_sod() RETURNS TRIGGER AS $$
DECLARE
  v_requested_by UUID;
BEGIN
  -- Type B/C: co-A 必須
  IF NEW.approval_type IN ('B','C') THEN
    IF NEW.co_approver_user_id IS NULL THEN
      RAISE EXCEPTION 'SoD: Type % requires co_approver_user_id', NEW.approval_type USING ERRCODE='23514';
    END IF;
    IF NEW.co_approver_user_id = NEW.approver_user_id THEN
      RAISE EXCEPTION 'SoD: co_approver must differ from approver for Type %', NEW.approval_type USING ERRCODE='23514';
    END IF;
  END IF;

  -- Type A fallback (co がいる組織は別人)
  IF NEW.approval_type = 'A' AND NEW.co_approver_user_id IS NOT NULL
     AND NEW.co_approver_user_id = NEW.approver_user_id THEN
    RAISE EXCEPTION 'SoD: co_approver must differ from approver (Type A fallback)' USING ERRCODE='23514';
  END IF;

  -- Type A SoD: 起票者 ≠ 承認者 (= config_change_request.requested_by_user_id ≠ approver)
  SELECT requested_by_user_id INTO v_requested_by
    FROM config_change_request
   WHERE config_change_request_id = NEW.config_change_request_id;
  IF v_requested_by = NEW.approver_user_id THEN
    RAISE EXCEPTION 'Type A SoD: requested_by_user_id (%) must differ from approver_user_id (%)',
      v_requested_by, NEW.approver_user_id USING ERRCODE='23514';
  END IF;
  IF v_requested_by = NEW.co_approver_user_id THEN
    RAISE EXCEPTION 'SoD: requested_by must differ from co_approver' USING ERRCODE='23514';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_config_approval_sod BEFORE INSERT OR UPDATE ON app.config_change_approval
  FOR EACH ROW EXECUTE FUNCTION enforce_config_approval_sod();
```

### 5.9 Boundary threshold shape validation (Finding 13)

```sql
CREATE OR REPLACE FUNCTION validate_boundary_threshold() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.boundary_kind = 'international_transfer' THEN
    IF NOT (NEW.structured_threshold ? 'high_value_threshold'
            AND NEW.structured_threshold->'high_value_threshold' ? 'amount'
            AND NEW.structured_threshold->'high_value_threshold' ? 'currency') THEN
      RAISE EXCEPTION 'international_transfer boundary requires high_value_threshold.{amount, currency}';
    END IF;
    IF NOT (NEW.structured_threshold ? 'automation_above_threshold'
            AND NEW.structured_threshold->>'automation_above_threshold' = 'prohibited') THEN
      RAISE EXCEPTION 'international_transfer boundary requires automation_above_threshold = prohibited';
    END IF;
  END IF;
  -- Phase 2+ で kyc_final / credit_final 分岐追加
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_boundary_threshold_shape BEFORE INSERT OR UPDATE ON app.boundary_definition_version
  FOR EACH ROW EXECUTE FUNCTION validate_boundary_threshold();

-- boundary_review_proposal 承認時の Type cross-check
CREATE OR REPLACE FUNCTION enforce_boundary_approval_type() RETURNS TRIGGER AS $$
DECLARE v_approval_type TEXT;
BEGIN
  IF NEW.approver_config_change_approval_id IS NOT NULL THEN
    SELECT approval_type INTO v_approval_type FROM config_change_approval
     WHERE config_change_approval_id = NEW.approver_config_change_approval_id;
    -- automation_status 変更を含む boundary review は Type C 必須 (DOC-APP-02 §9.7)
    IF NEW.proposed_changes ? 'automation_status_change' AND v_approval_type <> 'C' THEN
      RAISE EXCEPTION 'boundary change touching automation_status requires config_change_approval Type C, got %', v_approval_type;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_boundary_approval_type BEFORE INSERT OR UPDATE ON app.boundary_review_proposal
  FOR EACH ROW EXECUTE FUNCTION enforce_boundary_approval_type();
```

### 5.10 Row-level encryption (PII tier 3 = `id_document_hash`、introduced in v1.7、autonomous prod-ready loop Cycle 5)

DOC-TM-10 T-ID-04 (RLS bypass scenario) + T-IN-01 (SREAdmin が console から PII 閲覧) + NYDFS Part 500.15 (encryption in transit + at rest) + GLBA Safeguards Rule (16 CFR 314.4(c)) を背景に、**Aurora encryption at rest (volume-level KMS) + RLS** に加え、**PII tier 3 (`id_document_hash` + 関連 ai_proposal_field) は column-level KMS DataKey-per-tenant envelope encryption を追加** (defense in depth)。

#### 5.10.1 適用 column

| Table.column                                                     | Encryption layer                                                                                  |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `input_artifact.payload_jsonb` (where `pii_classification='id_document_hash'`) | KMS DataKey-per-tenant envelope (column-level) on top of Aurora at-rest KMS                       |
| `screenshot_stack.s3_pointer` (where related case の `kyc_document` retention) | S3 SSE-KMS + 同 DataKey で metadata index 暗号化                                                  |
| `evidence_step.extracted_text` (where `pii_classification='id_document_hash'`) | KMS DataKey-per-tenant envelope (column-level)                                                    |
| `customer_reference.normalized_name_hash` (high-entropy hash)    | Aurora at-rest のみ (hash済、column-level encryption 不要)                                         |

#### 5.10.2 Envelope encryption scheme

```sql
-- pgcrypto extension で AES-256-GCM
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA app;

-- per-tenant data key を Secrets Manager に保持 (rotation 半年)
-- application が KMS Decrypt で plaintext data key を取得 → row-level encrypt/decrypt

-- 暗号化 column 例
ALTER TABLE app.evidence_step
  ADD COLUMN extracted_text_ciphertext BYTEA,
  ADD COLUMN extracted_text_key_version TEXT,
  ADD COLUMN extracted_text_iv BYTEA;

-- application側 encrypt (例、Lambda 内)
-- ciphertext = aes_gcm_encrypt(plaintext, data_key, iv) ++ tag
-- iv = random 96-bit
-- key_version = `tenant_id:data_key_version_id`

-- application側 decrypt (RLS 通過後、Lambda が KMS Decrypt で data key 取得し復号)
```

#### 5.10.3 RLS との重畳防御

```sql
-- RLS は tenant boundary を enforce、column-level encryption は AccessException 後の defense in depth
-- 攻撃者が RLS bypass (T-ID-04) で別 tenant row に到達した場合、別 tenant の data key を持たないため復号不能

-- Lambda 側 data key access pattern:
-- 1. Lambda は IAM 経由で自分の tenant_id のみ KMS Decrypt 可
-- 2. cross-tenant data key access は IAM policy で deny
-- 3. break-glass cross-tenant access は Type B 設定承認 + audit_event
```

#### 5.10.4 Key rotation SOP

| Rotation cadence | Action                                                                                                                 |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Half-yearly      | Per-tenant data key を Secrets Manager rotation Lambda で rotate、新 key_version で新規 write、old version で read のみ |
| Yearly           | Re-encrypt cron: 旧 key_version の row を新 key で re-encrypt (Step Functions、partition 単位、audit_event 記録)         |
| Annual           | KMS CMK rotation (AWS managed、自動)、data key 自体は影響なし (CMK は envelope 上位 layer)                              |

#### 5.10.5 Performance trade-off

| Operation         | Latency overhead          | Mitigation                                                                                                                                    |
| ----------------- | ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Per-row encrypt   | +0.5-1 ms (KMS Decrypt cache hit) | Lambda execution context で data key を 5 min cache、KMS Decrypt は 1 invocation あたり 1 回                                                  |
| Per-row decrypt   | +0.5-1 ms                 | 同上                                                                                                                                          |
| Bulk re-encrypt   | high cost (partition単位) | Yearly cron で off-peak window 実行、Aurora Serverless v2 で自動 scale                                                                       |
| Index             | Cannot index ciphertext directly | hash-based search column (high-entropy salt) を別 column で保持、ciphertext 自体は equality search 不可 (Phase 1 で affected query なし) |

#### 5.10.6 NYDFS 500.15 + GLBA Safeguards mapping

- **NYDFS 500.15(a)(1)**: "Encryption of nonpublic information in transit over external networks" — TLS 1.2+ (CA-08 §5.5) で充足
- **NYDFS 500.15(a)(2)**: "Encryption of nonpublic information at rest" — Aurora at-rest KMS で baseline、本 §5.10 column-level encryption で tier 3 PII の defense in depth (NYDFS 500.15(a)(2)(B) "alternative compensating controls" 解釈で counsel sign-off)
- **GLBA Safeguards 16 CFR 314.4(c)(3)**: "Encrypt all customer information held or transmitted" — at-rest + transit + column-level の 3 layer で over-meet

---

## 6. PII / 機密 / Tier 分類

### 6.1 PII 分類 4 段 (3 PII + 非 PII) + US 規制 mapping (introduced in v1.4 US pivot、current v1.6.2、JP 銀行 America division)

**Pivot trace**: v1.3.1 までは FISC + 個情法 + 銀行法 + 犯収法 mapping だったが、introduced in v1.4 (DOC-CA-08 v2.0 US pivot と同期) で **US 規制 framework** に swap (current v1.6.2)。JP parent (本店) reporting は別 doc (DOC-CA-09 candidate、本 doc scope 外)。

| 分類                    | 例                              | Federal (FRB / OCC / FFIEC / FinCEN / GLBA)                                | NYDFS 23 NYCRR Part 500        | State law (適用 operating state 依存)             | 暗号化                                      | retention                                |
| ----------------------- | ------------------------------- | --------------------------------------------------------------------------- | ------------------------------ | ------------------------------------------------- | ------------------------------------------- | ---------------------------------------- |
| `bank_internal_id_only` | 顧客番号 / 口座番号             | GLBA + Reg P (12 CFR 1016)、FFIEC IT Examination Handbook                  | 500.15 Encryption + 500.06 Audit Trail | CCPA-CPRA "personal information" 該当 (CA ops)、NY SHIELD Act "private information" 該当 (NY ops) | KMS column encryption (per-tenant data key) | case retention (`customer_pii` class)    |
| `name_address`          | 法人名 / 代表者 / 住所          | GLBA + Reg P、FFIEC、CIP under USA PATRIOT 326 (BSA-AML)                   | 500.15 + 500.06 + 500.17 (breach notice 72hr) | CCPA-CPRA、NY SHIELD、VA-CDPA、CO Privacy Act、CT Data Privacy Act 等 | KMS column + S3 SSE-KMS                     | case retention (`customer_pii` class)    |
| `id_document_hash`      | 本人確認書類 hash + thumbnail   | **BSA Section 1010.430 retention 5yr (after account closure)** + USA PATRIOT 326 CIP、Safeguards Rule (16 CFR 314 by FTC、applied to banks via FRB/OCC) | 500.15 + 500.06 + 500.17       | IL BIPA (biometric)、state-specific id doc handling | KMS column、原本は S3 Object Lock + KMS     | **5 年 = `kyc_document` class (§9.4)** (BSA + FinCEN baseline、state law 厳しい場合は longer) |
| `none`                  | KPI / 設定 / metadata           | FFIEC IT Examination Handbook (access management)、SOX (internal controls) | 500.07 Access Privileges       | -                                                 | SSE-KMS                                     | indefinite (audit)                       |

- **AI/ML governance 共通**: 全 PII を扱う AI model (Bedrock Claude + Computer Use) は **FRB SR 11-7 + OCC SR 11-7 (Model Risk Management)** 直接適用。Phase 1 で model inventory + validation framework + ongoing monitoring + governance committee SOP を別 doc で確立 (DOC-CA-08 open question §17 #25 と同期)
- **Sanctions screening**: 国際送金 boundary (UC-BO-IT-BOUNDARY) は **OFAC SDN/SSI list screening** 必須 (50 CFR Part 501 reporting)、`alert` table に `ofac_alert` enum 追加 (Phase 1 で確定)
- **State law operating state 依存**: 実際の operating state (NY / CA / TX / 等) は Phase 1 で external legal counsel が finalize、DOC-CA-08 open question §17 #27 と同期
- **JP parent (本店) layer**: cross-border data flow / 連結 reporting / supervisory submission は本 v1.4 doc scope 外、別 doc (DOC-CA-09 candidate、Phase 2 検討、open question DOC-CA-08 §17 #28)
- **Historical (v1.0-v1.3.1)**: FISC 安全対策基準 + 個情法 + 銀行法 + 犯収法 mapping は Tokyo deploy 前提で記述、introduced in v1.4 US pivot、current v1.6.2 で superseded。historical context として §改版履歴 + DM-07 過去版で trace

### 6.2 PII の物理配置

- **column-level encryption**: `ai_proposal_field.field_value_encrypted` / `human_decision.comment` / `user.employee_ref` / `customer_reference.legal_name_encrypted` 等は pgcrypto + KMS envelope (Aurora supports per-DB KMS via `pg_tle` extension + AWS data key)
- **Field-Level Encryption (FLE)** pattern: per-tenant data key (DK) を KMS から取得、DK で field 暗号化、DK 自身は customer master key (CMK) で encrypt して `data_key_envelope` table に格納
- **検索可能性**: 暗号化 field の partial match は NG。検索が必要な field (法人名等) は **deterministic encryption** (AEAD-SIV) を採用、index 可能だが weaker
- **PII redaction view**: Auditor 用 read role には `v_case_redacted` (PII field を hash 化した view) のみ grant、生 field は AI 管理者 + 業務責任者の限定 role のみ

### 6.3 Tier 3 規制語の格納禁止 enforcement

- `mock_data` schema は production には deploy しない (Liquibase changelog で skip)
- `audit_event.summary` 列に Tier 3 規制語が含まれないかを check (DB trigger では fuzzy 困難なので、insert 前に application-layer linter)
- Phase 1 で `pg_textcheck` style trigger を入れる候補は open question §13

---

## 7. 物理 DB 技術選定 (本番 stack)

### 7.1 候補と除外理由

| Stack                                  | 評価                                                                                                                     | 採否        |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ----------- |
| Aurora PostgreSQL 16 (AWS)             | RLS + partition + pgvector + JSONB + trigger 全機能成熟、us-east-1 + us-west-2 multi-AZ + Global DB (introduced in v1.4 US pivot、current v1.6.2) | **採用**    |
| AlloyDB (GCP)                          | pgvector 強化版あり、AI Studio 連携 ◯、ただし RLS / partition 運用知見が AWS より浅い、**US 規制 mapping** (NYDFS / FRB SR 11-7 / FFIEC) の banking 採用実績 + AWS US Public Sector 経験 が AWS より薄い (US pivot introduced in v1.4、比較軸 swap completed in v1.6、current v1.6.2、historical v1.0-v1.3.2 は FISC 比較軸) | 不採用      |
| Azure DB for PG Flexible               | PG 16 GA、pgvector GA、ただし banking 案件 ref で Azure 優位なのは .NET ecosystem、本案件は ts/python stack なので利得低 | 不採用      |
| Spanner / Cosmos DB (NewSQL)           | 強整合だが PG 機能 (RLS / trigger / pgvector) 不在 or 制限大、本案件の trigger-heavy 設計に不適                          | 不採用      |
| DynamoDB (NoSQL)                       | scale 強、ただし trigger / RLS / hash chain / partition with materialized view が application-side 実装重く、本案件不適 | 不採用 (補助 cache のみ可) |
| Snowflake / BigQuery (analytics 専用)  | 分析 OK、operational write / RLS / immediate trigger に不適                                                              | 分析 layer のみ (Aurora から CDC) |
| Aurora I/O-Optimized                   | Write-heavy 想定で IO 削減、Phase 1 sample 規模では Standard で十分、評価項目                                            | Phase 2 で再評価 |

### 7.2 推奨 stack 全景

```
┌────────────────────────────────────────────────────────────────────────┐
│ AWS us-east-1 (Virginia, primary) + us-west-2 (Oregon, DR) [introduced v1.4、current v1.6.2] │
│                                                                        │
│ Operational store:                                                     │
│   - Aurora PostgreSQL 16 Serverless v2 (Multi-AZ, Global DB to us-west-2) [introduced v1.4、current v1.6.2] │
│   - Aurora I/O-Optimized (Phase 2 で評価)                              │
│   - Extension: pgvector, pgcrypto, pg_partman, pg_repack, btree_gin    │
│                                                                        │
│ Immutable evidence + WORM audit:                                       │
│   - S3 bucket (Object Lock, Compliance mode, KMS-SSE)                  │
│   - Cross-Region Replication to us-west-2                              │
│   - Daily snapshot from audit_event partitions → Parquet → S3          │
│                                                                        │
│ Search / OLAP:                                                         │
│   - OpenSearch Serverless (AuditTrail filter, KnowledgeBrowser full-text) │
│   - Athena + Glue Data Catalog (long-term audit query, Parquet/Iceberg) │
│                                                                        │
│ Embedding / vector:                                                    │
│   - pgvector on Aurora (snippet embedding 1536-dim, Bedrock Titan v2)  │
│   - Bedrock Knowledge Bases (Phase 2 で代替検討)                       │
│                                                                        │
│ Secret / KMS:                                                          │
│   - AWS KMS multi-Region key (CMK per tenant + per environment)        │
│   - Secrets Manager (rotation Lambda per credential)                   │
│   - CloudHSM (Phase 2、ハードウェア証跡が要求されたら)                  │
│                                                                        │
│ Orchestration:                                                         │
│   - EventBridge (case state transition fan-out)                        │
│   - Step Functions (AI 日次分析 cron + materialized view refresh)      │
│   - Lambda / Fargate (AI 推論 wrapper、tool call wrapper)              │
│                                                                        │
│ Object storage:                                                        │
│   - S3 (PDF / screenshot / model artifact)                             │
│   - S3 Glacier Deep Archive (retention 超過後 archive)                 │
│                                                                        │
│ Observability + governance:                                            │
│   - CloudTrail (control plane audit)                                   │
│   - CloudWatch (logs, metrics, alarms)                                 │
│   - Config + Security Hub + GuardDuty + Macie                          │
│   - AWS Backup (Aurora snapshot + S3 + KMS multi-Region)               │
└────────────────────────────────────────────────────────────────────────┘
```

### 7.3 推奨 rationale (8 軸)

| 軸                       | AWS 推奨理由                                                                                                                            |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| 1. US-region + DR        | us-east-1 (3 AZ) + us-west-2 (3 AZ) の 2 region 構成、Aurora Global DB で RPO < 1 sec / cross-region failover < 1 min (introduced in v1.4 US pivot、current v1.6.2、~3,900km distance impact は Phase 1 で実測 calibrate) |
| 2. US 規制 mapping (introduced in v1.6 / current v1.6.2) | AWS US Public Sector + Financial Services team による **NYDFS 23 NYCRR Part 500 / FRB SR 11-7 / OCC SR 11-7 + 2023-17 / FFIEC IT Examination Handbook / BSA-AML (FinCEN) / OFAC / GLBA + Reg P / Safeguards Rule** の compliance 支援 + bank 監査受け入れ実績多数。FISC mapping は historical (Tokyo deploy 想定の v1.0-v1.3.2 で参照、introduced in v1.4 US pivot、current v1.6.2 で superseded、JP parent layer 別 doc DOC-CA-09 candidate scope) |
| 3. PG ecosystem 成熟度   | RLS, partition, trigger, pgvector が GA、Aurora I/O-Optimized で write-heavy ワークロード対応 (Phase 2 で評価)                          |
| 4. WORM enforcement      | S3 Object Lock **Compliance mode** は root account でも削除不能、Governance mode と区別、規制 retention の唯一の DBs 抜け道防止 path  |
| 5. Hash chain DBs        | QLDB EOL 後の AWS 構成 (自前 hash chain + S3 Object Lock streaming export) と Azure Confidential Ledger (managed, SGX backed) は **ほぼ同等の保証強度**。AWS 採用は R5 単独優位ではなく **R1-R4 + R6-R7 の合算理由**。Phase 2 で Azure Confidential Ledger を audit_immutable backup の cross-cloud 二重化候補として再評価 (open question §13 #16) |
| 6. AI / LLM 連携         | Bedrock model invoke + Knowledge Bases + EventBridge fan-out が IAM 内 short path、Step Functions で日次分析 orchestration              |
| 7. Cost (idle Phase 1)   | Aurora Serverless v2 (0.5 ACU min) + S3 OL + OpenSearch Serverless で月 ~$300-500 (Phase 1 sample 規模)、Phase 2 でスケール             |
| 8. 運用ツール / 監査     | CloudTrail + Config + Security Hub + Macie で内部監査 +外部監査の cover、IaC は CDK or Terraform、Liquibase で schema migration         |

### 7.4 GCP / Azure を後で評価すべき条件

- **GCP 切替候補**: Vertex AI Agent Builder が必要、または BigQuery + Looker での analyst self-serve が経営要件
- **Azure 切替候補**: Microsoft 365 / Entra ID との SSO 統合が支配的、または既存 banking workload が Azure に集中

### 7.5 multi-cloud / hybrid 検討

- 本案件 Phase 1 は **single cloud (AWS)** を強推奨。multi-cloud は audit + complexity 倍増し、benefit (vendor lock-in 回避) が Phase 1 規模では cost 超過
- ただし **secret rotation Lambda / model artifact 配布 Lambda** は cloud-agnostic に書く (Phase 2 で hedge)

---

## 8. 物理スキーマ (Aurora PostgreSQL 16 DDL excerpt)

> **§8 / §5 DDL excerpt の status (Decision Brief P1 #4)**: 本 doc に含まれる DDL / trigger / view excerpt は **indicative for Liquibase authoring**、Liquibase changeset への 1:1 変換は不可。以下の手戻りを必ず修正してから dry-run に流すこと:
>
> - `CREATE TABLE audit.audit_event (...)` のように本体省略している箇所 (column 詳細は §3.6 entity catalog を canonical source として参照)
> - schema-qualify 不揃い (`ON audit_event` ⇄ `ON audit.audit_event`、`citation_linkage` ⇄ `app.citation_linkage` 等) は Liquibase changeset では `app.` / `audit.` を統一付与
> - `cdc_outbox.case_event_outbox` の `aggregate_type` 列に `'case'` を書く箇所と、entity rename (`case` → `case_record`) の不整合は post-patch grep で確認
> - 全 trigger 関数の schema-qualify (`app.enforce_*`, `audit.audit_*`) 付与
> - `RAISE EXCEPTION` 内 `ERRCODE` リテラルの統一 (現在 `'23514'` (check_violation) を多用、custom code への置換は Phase 1 で判断)
>
> **DDL validation gate (§2.9 pre-flight #1 と同期)**: 本 §8 を Liquibase changeset に起こした後、Aurora PG 16 sandbox で `psql --dry-run` 相当の parse check を CI に組み込み、全 excerpt の syntactic pass を本 doc の "Phase 1 hand-off Draft → Phase 1 hand-off Locked" 昇格条件とする。

### 8.1 schema / extension setup

```sql
-- Database: backoffice_v2
-- Owner: backoffice_app (限定 grant)、DBA は AWS RDS master credential 経由のみ

CREATE SCHEMA app;          -- operational
CREATE SCHEMA audit;        -- audit_event + materialized snapshots
CREATE SCHEMA reference;    -- enum / seed
CREATE SCHEMA analytics;    -- materialized views
CREATE SCHEMA cdc_outbox;   -- transactional outbox for EventBridge

CREATE EXTENSION pgcrypto;
CREATE EXTENSION vector;       -- pgvector
CREATE EXTENSION pg_partman;
CREATE EXTENSION btree_gin;
CREATE EXTENSION pg_trgm;      -- KnowledgeBrowser full-text search
CREATE EXTENSION uuid-ossp;
```

### 8.2 partition (audit_event / kpi_measurement / kri_state_snapshot / connection_attempt)

```sql
CREATE TABLE audit.audit_event (...) PARTITION BY RANGE (event_at);

SELECT partman.create_parent(
  p_parent_table => 'audit.audit_event',
  p_control => 'event_at',
  p_type => 'native',
  p_interval => 'monthly',
  p_premake => 3,
  p_start_partition => '2026-06-01'
);
```

- 月次 partition、`pg_partman` で auto create / retention
- 過去 partition は `ALTER TABLE ... DETACH` → S3 Iceberg export → DROP の手順 (§9.3)

### 8.3 index 戦略

| Table                     | Index                                                                                                                         | 用途                                       |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| case_record               | `(tenant_id, workflow_id, status, received_at DESC) INCLUDE (assignee_user_id, alert_count, display_case_id)`                | Inbox queue                                |
| case_record               | `(tenant_id, display_case_id)`                                                                                                | URL lookup                                 |
| case_record               | `(tenant_id, customer_reference_id)`                                                                                          | customer 別 case query                     |
| ai_proposal               | `(case_id, generated_at DESC)`                                                                                                | 案件履歴                                   |
| audit_event_*             | `(tenant_id, case_id)`、`(tenant_id, event_type, event_at)`、BRIN on event_at                                                | AuditTrail filter                          |
| knowledge_snippet_version | `(tenant_id, workflow_id, weight)`、`USING hnsw (embedding vector_cosine_ops)` (pgvector)                                     | similarity search                          |
| connection_attempt        | `(tenant_id, tool_id, idempotency_key, attempted_at)` UNIQUE、BRIN on attempted_at                                            | idempotency lookup                         |
| procedure_proposal        | `(tenant_id, workflow_id, status)`、`(tenant_id, queue_owner_user_id, status)`                                                | ProposalReview queue                       |
| kpi_measurement           | `(tenant_id, workflow_id, kpi_key, window_start DESC)`、`(tenant_id, kpi_key, aggregation_kind, window_start DESC)`           | Metrics dashboard                          |
| human_decision            | `(case_id, decided_at)`、`(actor_user_id, decided_at DESC)`                                                                   | 案件 timeline + user activity              |

### 8.4 Materialized views (analytics schema)

```sql
CREATE MATERIALIZED VIEW analytics.mv_kpi_4gate_daily AS
SELECT
  tenant_id,
  workflow_id,
  date_trunc('day', window_start) AS day,
  MAX(CASE WHEN kpi_key='K1' THEN value END) AS k1_input_accept_rate,
  MAX(CASE WHEN kpi_key='K2' THEN value END) AS k2_manual_override_rate,
  MAX(CASE WHEN kpi_key='K3' THEN value END) AS k3_alert_rate,
  MAX(CASE WHEN kpi_key='K4' THEN value END) AS k4_business_sendback_rate,
  bool_and(value <= ... ) AS gate_pass_hypothesis  -- multi-criteria 判定
FROM app.kpi_measurement
WHERE aggregation_kind = 'daily' AND kpi_key IN ('K1','K2','K3','K4')
GROUP BY tenant_id, workflow_id, date_trunc('day', window_start);

CREATE UNIQUE INDEX ON analytics.mv_kpi_4gate_daily (tenant_id, workflow_id, day);

CREATE MATERIALIZED VIEW analytics.mv_related_rule_update_alert AS
-- 過去 case と 最新 workflow_version の diff から「適用範囲 2 Alert」を導出
SELECT
  c.case_id, c.tenant_id, c.workflow_id, c.workflow_version_id AS case_version_id,
  w.current_version_id AS current_version_id,
  c.reflected_at,
  pp.procedure_proposal_id AS related_proposal_id,
  pp.approved_at AS rule_update_at
FROM app.case_record c
JOIN app.workflow w ON w.workflow_id = c.workflow_id
JOIN app.workflow_version cv ON cv.workflow_version_id = c.workflow_version_id
JOIN app.workflow_version wv ON wv.workflow_id = w.workflow_id AND wv.approved_at > cv.approved_at
JOIN app.procedure_proposal pp ON pp.proposed_workflow_version_id = wv.workflow_version_id
WHERE c.status IN ('reflected','business-approval-waiting','ready');

CREATE UNIQUE INDEX ON analytics.mv_related_rule_update_alert (case_id, related_proposal_id);
```

`REFRESH MATERIALIZED VIEW CONCURRENTLY` を Step Functions で hourly 実行。

### 8.5 Outbox (EventBridge fan-out)

```sql
CREATE TABLE cdc_outbox.case_event_outbox (
  outbox_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  aggregate_type TEXT NOT NULL,   -- 'case_record' / 'procedure_proposal' / 'knowledge_snippet' / 'workflow_version' / 'config_change_approval' (entity 名と一致、Finding 5 case → case_record rename と整合)
  aggregate_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  dispatched_at TIMESTAMPTZ NULL
);
CREATE INDEX ON cdc_outbox.case_event_outbox (dispatched_at) WHERE dispatched_at IS NULL;
```

- Transactional outbox pattern: `case` update と同一 transaction で outbox insert、Lambda が poll → EventBridge publish → 各 consumer (Step Functions、OpenSearch index update、analytics)

### 8.6 pgvector index

```sql
CREATE INDEX idx_snippet_embedding ON app.knowledge_snippet_version
  USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);

-- 日次分析 query (同種差戻し 3+ 件 clustering)
SELECT v.knowledge_snippet_version_id, 1 - (v.embedding <=> :query_embedding) AS similarity
FROM app.knowledge_snippet_version v
WHERE v.weight IN ('low','medium')
  AND v.knowledge_snippet_id IN (SELECT knowledge_snippet_id FROM app.knowledge_snippet WHERE workflow_id = :wf AND category != 'data_error')
ORDER BY v.embedding <=> :query_embedding
LIMIT 50;
```

### 8.7 RLS 適用例

```sql
ALTER TABLE app.case_record ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.case_record FORCE ROW LEVEL SECURITY;  -- owner にも適用

CREATE POLICY case_tenant ON app.case_record
  USING (tenant_id = current_setting('app.current_tenant_id', true)::UUID);

CREATE POLICY case_role_filter ON app.case_record FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM app.role_assignment ra
    JOIN app.role r ON r.role_id = ra.role_id
    JOIN app.screen_access_grant sag ON sag.role_id = r.role_id AND sag.screen_key = 'case_review'
    WHERE ra.user_id = current_setting('app.current_user_id', true)::UUID
      AND ra.tenant_id = case_record.tenant_id
      AND (ra.workflow_id IS NULL OR ra.workflow_id = case_record.workflow_id)
      AND sag.access_level IN ('read','write','approve','triage')
      AND now() BETWEEN ra.valid_from AND COALESCE(ra.valid_to, 'infinity'::timestamptz)
  )
);

-- Auditor 用 read all policy:
CREATE POLICY case_auditor ON app.case_record FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM app.role_assignment ra
    JOIN app.role r ON r.role_id = ra.role_id
    WHERE ra.user_id = current_setting('app.current_user_id', true)::UUID
      AND r.is_audit_only = true
      AND ra.tenant_id = case_record.tenant_id
  )
);
```

---

## 9. Immutable Audit + WORM 設計 (Finding 2 修正、4 ring + streaming export)

### 9.1 4 ring 防御

| Ring | 仕組み                                                                                       | 破壊難度                                                              |
| ---- | -------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| R1   | `audit_event` REVOKE update/delete + trigger raise                                          | DB super user が trigger drop で破られる                              |
| R2   | per-tenant SHA-256 hash chain (`audit_chain_head` 別 table)                                  | DB super user が chain 全 row 再計算すれば破られる                    |
| R3   | **streaming export (≤ 5 min)** → S3 Object Lock Compliance mode bucket                       | Object Lock 期間中は root account でも変更不能                        |
| R4   | snapshot manifest **第二経路 hash 配信** (CloudTrail Lake + 別 account KMS sign)             | 別 account の侵害が同時に必要、現実困難                               |

### 9.2 Streaming export (旧 daily snapshot を置換)

```
Aurora audit_event (partition writes)
  → Aurora logical replication slot (pgoutput)
  → AWS DMS or self-managed Lambda consumer → Kinesis Data Streams
  → Kinesis Firehose (buffer ≤ 5 min) → S3 Object Lock Compliance bucket
     prefix: s3://backoffice-audit-immutable/{tenant}/{YYYY}/{MM}/{DD}/{HH-MM}.jsonl.gz
     Object Lock retain-until = put_time + retention_period (class 別、§9.4)
     SSE-KMS (multi-Region key)
  → exporter Lambda image digest を 別 account の `audit-config` bucket に Object Lock 固定
     (= exporter 自体の tampering 防御、変更は別 account Security IAM role のみ)
  → manifest entry (sha, size, anchor_hash, retain_until, exporter_image_digest)
    を Aurora `audit_snapshot_manifest` + CloudTrail Lake (cross-account append-only S3) の 2 経路で記録
  → 2 経路 hash 比較を §9.3 chain walk の最終 step で実施
```

- **露出窓 (tamper detection RPO)**: ≤ 5 分 (Phase 1 measurement target)
- 失敗 alarm: Firehose delivery failure → Severity 1 (Matrix C `emergency_stop` 候補)
- 旧 daily snapshot 案は廃止 (24h 窓で root tampering 可能だったため)

### 9.3 検証 (verification) 手順

四半期ごとに DR drill の一部として:

1. `SELECT verify_audit_chain(tenant_id, start_date, end_date)` で chain hash を walk → mismatch があれば critical alert
2. ランダム sampled hour の S3 export object を retrieve → re-canonical → re-hash → manifest hash と比較
3. **cross-account 経路 hash と Aurora manifest hash の 2 経路一致確認** (Finding 2 R4 防御)
4. exporter Lambda image digest を 別 account 固定 digest と照合
5. 失敗時は Matrix C `emergency_stop` 発動 (DOC-APP-02 §8.1)

### 9.3.1 audit_snapshot_manifest 自体の防御
- 書込 role = 単一 IAM role (`manifest_writer`)、application role からは grant 不可
- 書込時に CloudTrail Lake (cross-account append-only S3) に manifest entry の二重記録
- Aurora 側 entry と sha 比較を §9.3 step 3 で実施

### 9.4 retention class 6 段 (introduced in v1.4 US pivot、current v1.6.2、US framework swap)

**v1.4 pivot**: v1.0-v1.3.2 は FISC + 犯収法 7 年 baseline、v1.4 で US deploy に伴い BSA + FinCEN + SOX + GLBA + state law baseline に swap。各 class の保持期間は **長い方が勝つ** principle (US federal + state law の max)。

| Class                       | 対象                                                            | 保持期間 (v1.4 US baseline、Phase 1 で external legal counsel review) | 媒体                                  | 法的根拠 (US framework)                                                                                   |
| --------------------------- | --------------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| audit_immutable             | audit_event 5-min streaming export                              | **7 年** (SOX baseline 7yr、FFIEC IT exam、NYDFS 500.06 audit trail)  | S3 Object Lock Compliance + Glacier   | SOX 802 / FFIEC IT Examination Handbook / NYDFS 500.06 / OCC SR 11-7 model audit trail                   |
| **kyc_document**            | `pii_classification='id_document_hash'` の input_artifact + 関連 ai_proposal_field encrypted | **5 年 (account closure 起算)** baseline                              | S3 Object Lock Governance + KMS       | **BSA Section 1010.430 + 1010.605 (5yr after account closed) + USA PATRIOT 326 CIP**、Safeguards Rule、state-specific id doc law |
| customer_pii (general)      | `pii_classification IN ('name_address','bank_internal_id_only')` の field | 5 年 baseline、CCPA-CPRA deletion right 別 path で 12 month response  | S3 SSE-KMS                            | GLBA + Reg P (12 CFR 1016)、Safeguards Rule、CCPA-CPRA deletion right (banking exemption あり)            |
| knowledge_compiled          | workflow_version, agent_version, snippet_version (high)         | indefinite (現役 + 過去 N 年、FRB SR 11-7 model history)             | Aurora + S3                           | FRB SR 11-7 + OCC SR 11-7 model lineage / validation trace (audit reproducibility)                       |
| kpi_aggregate               | kpi_measurement (daily/weekly/monthly), kri_state_snapshot      | 3 年                                                                  | Aurora + S3 Parquet                   | 業務分析 + FFIEC ongoing monitoring                                                                       |
| case_evidence               | screenshot_stack, evidence_step (kyc 該当 case は 5 年継承)      | 5 年 (kyc case と同期)                                                | S3 SSE-KMS + Glacier transition       | BSA + Safeguards Rule + business evidence                                                                |

**Cross-state operating notes**:
- IL BIPA 適用案件 (biometric data) は別 retention 検討、Phase 1 で external legal counsel
- CCPA-CPRA **deletion right** (1798.105) は user 削除要求 12 month 以内 response。BSA / FRB の保管義務 (5yr / 7yr) と conflict 場合は **banking exemption** (CCPA 1798.145(e) / GLBA carve-out) で federal 規制が優先、ただし trace 必須 (DOC-CA-08 open question §17 #27)

**Historical context (v1.0-v1.3.2、Tokyo deploy 前提)**: 犯収法 6 条 7 年保存が個情法 23 条を支配する設計だったが、introduced in v1.4 US pivot、current v1.6.2 で **BSA 5yr baseline** に swap。`kyc_document` class 7 年 → 5 年、`audit_immutable` class 10 年 → 7 年 (SOX baseline)。各 class 保持期間の最終確定は Phase 1 で external legal counsel が actual operating state + business 要件と照合。

#### retention assignment trigger (Finding 8)

```sql
-- input_artifact insert 時に pii_classification から retention_class を自動付与
ALTER TABLE app.input_artifact ADD COLUMN retention_class TEXT NOT NULL DEFAULT 'customer_pii';

CREATE OR REPLACE FUNCTION assign_input_artifact_retention() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.pii_classification = 'id_document_hash' THEN
    NEW.retention_class := 'kyc_document';
  ELSIF NEW.pii_classification IN ('name_address','bank_internal_id_only','mixed') THEN
    NEW.retention_class := 'customer_pii';
  ELSE
    NEW.retention_class := 'customer_pii';  -- safe default
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_input_artifact_retention BEFORE INSERT ON app.input_artifact FOR EACH ROW EXECUTE FUNCTION assign_input_artifact_retention();

-- case_record lifecycle: 同 case 内 input_artifact に kyc_document が含まれる場合、
-- 関連 screenshot_stack / evidence_step も 7 年継承 (per-artifact lifecycle で個別判定、case 一括 delete 不可)
```

- `case_record` 全体一括 lifecycle は **不採用**、per-artifact retention で個別判定 (kyc が紛れた case の早期削除を防止)
- S3 lifecycle policy は retention_class タグで分岐、Object Lock retain-until は class 別に PutObject 時設定

### 9.5 Audit chain repair playbook (breach detection → recovery、introduced in v1.7、autonomous prod-ready loop Cycle 5)

DOC-SRE-11 RB-03 (Audit chain verify failure S0) 連動。breach detection → mitigation → recovery の 7 phase playbook。

#### Phase 0: Detection (automated)

`verify_audit_chain()` daily cron が `audit_chain_head.chain_verify_status='fail'` を検出。CloudWatch alarm `BackofficeAi/Audit/ChainVerifyResult` で S0 page。

#### Phase 1: Immediate freeze (5 min 以内)

1. **Deploy freeze**: CodePipeline `manual_approval` step を auto-trigger (CDK 経由で immediate enforcement)
2. **Application-side write block (optional)**: 該当 partition への `audit_event` insert を application 側 circuit breaker で停止 (case 処理一時停止と等価、業務 impact)、SRE Lead 判断で発動
3. **Stakeholder paging**: SRE Lead + Security 関係者 + Compliance officer + AI 管理者 を 5 min 以内に page

#### Phase 2: Forensic isolation (30 min 以内)

1. **Aurora point-in-time recovery prep**: Last successful verify timestamp を identify (`audit_chain_head` 最終 success row の `verified_at`)
2. **S3 Object Lock manifest preservation**: 該当 partition の S3 manifest を read-only fork (別 region / 別 account 想定の forensic bucket に copy)、original は touch しない
3. **CloudTrail Lake cross-account manifest read**: 2 経路 hash 比較で発散点 identify

#### Phase 3: Scope identification (1 hr 以内)

1. **Tampered row enumeration**: chain walk で発散点以降の row を mark
   ```sql
   SELECT event_id, occurred_at, computed_hash, recorded_hash
     FROM audit.audit_event ae
     JOIN audit.audit_chain_head ch ON ch.tenant_id = ae.tenant_id
    WHERE ae.tenant_id = $1
      AND ae.occurred_at >= ch.last_verified_at_failure
    ORDER BY ae.occurred_at;
   ```
2. **Cross-reference S3 export**: S3 export manifest hash と比較、`audit_event` row が S3 export と一致するか確認
3. **Affected case + tenant + actor mapping**: SoD chain (DM-07 §5.1 + §5.8) を含めて impact assessment

#### Phase 4: Regulatory notification (72 hr 以内、NYDFS 500.17)

1. **Compliance officer 主導** で NYDFS 500.17 reportable assessment (Cybersecurity Event 定義に該当するか)
2. 該当する場合 72 hr 以内に NYDFS Superintendent に notice (electronic filing)
3. **GLBA breach notification** assessment (consumer impact あれば state-specific notification rule、CCPA/NY SHIELD Act 等)
4. Customer notification timing (state law per-state) は Compliance officer + legal team で finalize

#### Phase 5: Recovery (24 hr - 5 business day)

1. **Aurora point-in-time recovery**: 発散点 -10 min を target、`audit_event` partition を staging cluster に restore
2. **S3 export 経路 reconciliation**: tampered window (発散点 ~ detection time) の S3 export を canonical source として採用 (Object Lock Compliance のため tamper 不能)
3. **Audit chain rebuild**: staging cluster で chain hash 再計算、verify pass 確認
4. **Production swap**: Type B 緊急設定承認経由で production audit_event partition を staging で置換
5. **Re-verify**: Recovery 後の chain walk + S3 manifest 2 経路 hash 一致確認、`audit_chain_head` row 再作成

#### Phase 6: Postmortem (5 business day 以内)

1. DOC-SRE-11 §7 template で postmortem 起稿
2. **Root cause investigation**: DBA / root account compromise / trigger drop / hash chain logic bug 等の hypothesis 系統的検証
3. **Action items**: process gap fix (e.g., DB super-user activity の per-action audit 強化、KMS administrative event の review cadence 短縮)
4. External audit + regulator follow-up (quarterly external audit との sync)

#### Phase 7: Defense in depth strengthening (Phase 1 ops 開始後 quarterly review に組み込み)

1. **Ring 5 防御候補**: AWS CloudHSM-backed CMK で envelope encryption 上位 layer 強化 (Phase 2 評価)
2. **Privileged session monitoring (PSM)**: DB super-user activity の screen recording (Phase 2 評価)
3. **AI/ML anomaly detection**: audit_event volume per-tenant baseline + ML drift alarm (Phase 2 評価)

### 9.6 Right-to-erasure × Audit immutability conflict resolution (CCPA/CPRA 1798.105 vs §9 audit chain、introduced in v1.7、autonomous prod-ready loop Cycle 5)

DOC-CEM-12 §10.2 で identify した ⚠ Gap (CCPA right-to-delete vs §9.1 audit immutability 7yr retention) の resolution。

#### 9.6.1 Conflict 定義

| Side                                  | 要件                                                                                                                            |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| CCPA/CPRA 1798.105 (consumer rights)  | 12 month 以内に consumer の personal information を delete (state-specific、CCPA = CA、similar VA/CO/CT/UT/etc.)                  |
| GLBA / NYDFS / SOX / BSA (audit imm.) | audit_event は 5-7 year retention 必須、tamper 不能                                                                              |
| **Conflict point**                    | audit_event 内に customer_reference (PII) が含まれる場合、delete request で全体 erase 不能、partial erasure では audit chain 破壊 |

#### 9.6.2 Resolution = Pseudo-anonymization (推奨案)

**Principle**: audit_event 自体は immutable + retention 保持、ただし audit_event 内の **customer_reference field を pseudonymize** することで personal information 不在状態に変換。

##### 9.6.2.1 Schema design

```sql
-- 既存 audit_event は customer_reference を直接持たず、`customer_reference_id` FK のみ保持
ALTER TABLE audit.audit_event
  ADD COLUMN customer_reference_id_pseudo TEXT;  -- pseudonymized stable ID

-- customer_reference table 側で pseudonymize 状態 enum 追加
ALTER TABLE app.customer_reference
  ADD COLUMN erasure_status TEXT NOT NULL DEFAULT 'active',
  ADD COLUMN erasure_requested_at TIMESTAMPTZ,
  ADD COLUMN erasure_executed_at TIMESTAMPTZ,
  ADD CONSTRAINT erasure_status_chk CHECK (erasure_status IN ('active','erasure_requested','pseudonymized'));
```

##### 9.6.2.2 Pseudo-anonymization process

```sql
CREATE OR REPLACE FUNCTION pseudonymize_customer_reference(p_customer_ref_id UUID)
RETURNS VOID AS $$
DECLARE
  v_pseudo_id TEXT;
BEGIN
  -- Step 1: Generate stable pseudonym (HMAC-SHA-256 with tenant-specific salt)
  v_pseudo_id := encode(
    hmac(p_customer_ref_id::TEXT, current_setting('app.pseudonym_salt'), 'sha256'),
    'hex'
  );

  -- Step 2: customer_reference の PII field を pseudonymize
  UPDATE app.customer_reference
     SET normalized_name_hash = v_pseudo_id,
         pii_classification = 'pseudonymized',  -- 新 enum value
         erasure_status = 'pseudonymized',
         erasure_executed_at = NOW()
   WHERE customer_reference_id = p_customer_ref_id;

  -- Step 3: 関連 input_artifact / evidence_step / screenshot_stack を pseudo-replace
  -- (column-level encryption key を destroy、ciphertext は残るが復号不能)
  UPDATE app.evidence_step
     SET extracted_text_ciphertext = NULL,  -- ciphertext destroy
         extracted_text_key_version = 'erased:' || v_pseudo_id
   WHERE case_id IN (SELECT case_id FROM app.case_record WHERE customer_reference_id = p_customer_ref_id);

  -- Step 4: audit_event 自体は immutable、ただし customer_reference_id_pseudo を append
  -- (新 row insert で「erasure executed」event を chain に追加、過去 row は touch しない)
  INSERT INTO audit.audit_event (
    tenant_id, event_type, customer_reference_id_pseudo, occurred_at, actor_user_id, ...
  ) VALUES (
    current_setting('app.tenant_id')::UUID,
    'consumer_erasure_executed',
    v_pseudo_id,
    NOW(),
    current_setting('app.actor_user_id')::UUID,
    ...
  );

  -- Step 5: Compliance officer notify (audit_event 経由 + Slack)
END;
$$ LANGUAGE plpgsql;
```

##### 9.6.2.3 Compliance posture

| Regulator view                         | Posture                                                                                                                                |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| CCPA/CPRA 1798.105                     | Pseudonymization は personal information の definition (1798.140(o)) を満たさない pseudonymous information への変換、erasure 要件充足 (CCPA 1798.140(r) "deidentified"-similar concept) |
| **CCPA banking exemption (1798.145(e))** | GLBA-covered consumer financial information の retention は federal 規制で優先、ただし pseudonymization は best-effort で実施可能      |
| GLBA Reg P + Safeguards                | Pseudonymized state は NPI に該当せず、Safeguards Rule の対象外 (Reg P 1016.3(q)(1) deidentified definition と整合)                    |
| NYDFS 500.13 (data minimization)       | 必要以上の保持を防止する原則と整合 (erasure executed 状態が NPI 排除)                                                                  |
| SOX / NYDFS 500.06 audit trail         | audit_event row 自体は immutable retention 7yr、customer_reference_id_pseudo は audit chain integrity を保ったまま PII 不在化           |
| BSA 1010.430                           | KYC retention 5yr after account closure までは pseudo-anonymization 不可、5yr 経過後に consumer request あれば pseudonymize 可          |

##### 9.6.2.4 Consumer request workflow

```
consumer erasure request
  ↓
Compliance officer + legal review (12 month SLA、CCPA)
  ↓
判断 split:
  ├─ BSA 5yr retention 期間中 → defer (federal exemption 通知 + erasure 受付 record 保持)
  ├─ NYDFS 500.13 義務外 + 5yr 経過 → pseudonymize_customer_reference() 実行
  └─ Other state (VA/CO/CT/UT) → state-specific SLA で同様判定
  ↓
audit_event 'consumer_erasure_executed' chain 内 append (immutable)
  ↓
consumer notification (state-specific format)
  ↓
12 month sliding window で consumer request 件数 + execution rate を Compliance dashboard で monitor
```

##### 9.6.2.5 Counsel review (PFC-02 acceptance condition #6)

本 §9.6 は counsel review session で sign-off 取得必須。Counsel review focus:
1. Pseudonymization の technical definition が CCPA "deidentified" 同等であることの legal opinion
2. BSA / SOX retention exemption が CCPA 1798.145(e) で適用可能であることの legal opinion
3. State-specific (VA / CO / CT / UT) でも同 framework が適用可能か逐 state confirm
4. 上記 sign-off 後、本 §9.6 を DOC-CEM-12 §10.2 ⚠ Gap → ✅ Counsel signed-off に切替

##### 9.6.2.6 Alternative considered (rejected)

| 案                                       | Rejection 理由                                                                              |
| ---------------------------------------- | ------------------------------------------------------------------------------------------- |
| audit_event 自体を delete                | NYDFS 500.06 + SOX baseline violation、deploy 不可                                            |
| customer_reference table を delete       | audit_event の FK 整合性破壊 + chain hash divergence、§9.1 ring 1 violation                  |
| Encryption key destroy (crypto-erasure)  | §5.10 で column-level KMS DataKey-per-tenant + erasure_executed 時 destroy = 本 §9.6 で採用 |
| 物理 storage purge                       | Aurora + S3 layer の operational complexity 高、Object Lock Compliance との conflict        |

---

## 10. Operations Playbook

### 10.1 RPO / RTO 目標

| 項目                          | 目標 (Phase 1 measurement 後 calibration)             |
| ----------------------------- | ----------------------------------------------------- |
| RPO (Aurora primary failure)  | < 1 sec (Aurora Global DB)                            |
| RTO (Aurora primary failure)  | < 60 sec (managed failover)                           |
| RPO (Region failure → us-west-2) | < 5 sec (cross-region writer storage replication、~3,900km distance により Tokyo↔Osaka より latency 高、Phase 1 で実測 calibrate、introduced in v1.4 US pivot、current v1.6.2) |
| RTO (Region failure → us-west-2) | < 30 min (manual failover trigger + Route 53 + warm pool、long distance impact 許容) |
| RPO (S3 audit immutable)      | < 15 min (CRR latency)                                |
| RTO (S3 audit immutable)      | Read available all time、write は別 region で復旧後   |

### 10.2 KMS / Secret rotation

- **CMK rotation**: 年次 (AWS 自動)、key alias 経由で application は意識しない
- **DK rotation**: 半年、re-encrypt 対象 column を background re-write (case partition 単位、Step Functions)
- **Secrets Manager rotation**: 業務 system credential = 90 日、外部 API key = 90 日、Lambda rotation function を per credential 設置
- 全 rotation event は `audit_event (event_type='config_approve' subtype='key_rotation')` で記録

### 10.3 Backup

- **Aurora**: continuous backup + manual snapshot 日次 (35 日保持)、月次 snapshot を別 KMS key で再暗号化して 7 年保持
- **S3 Object Lock**: legal hold default on for audit_immutable class
- **PITR (Point-In-Time Recovery)**: 35 日以内任意の秒に復旧可、四半期 drill で実行

### 10.4 Blue/Green schema deployment (Finding 9 修正、3 段 expand-contract 詳細 + reverse 不可制約)

**重要制約**: Aurora Blue/Green は switchover 後に green → blue へ traffic を戻すと、green で apply した destructive DDL (column drop / rename) は blue 側に無いため戻せない (AWS doc 明記)。**したがって destructive DDL を含む release では rollback path が事実上 1 方向 = 必ず expand-contract 3 段に分割**:

#### Release N (expand)
1. 新 column / 新 table を nullable / 別名で追加 (backward compat、旧 column は残す)
2. application code は新旧両方を書く **dual-write** 化
3. backfill job で過去 row を新 column に migrate (Step Functions、idempotent)
4. RDS Blue/Green deploy → switchover (rollback 可能、destructive DDL なし)

#### Release N+1 (migrate read)
1. application code を **新 column のみ読む** 形に切替
2. dual-write は維持
3. 1 release cycle 観察 (production verification、最低 1 週間)

#### Release N+2 (contract)
1. dual-write 停止、旧 column への write off
2. **完全に 1 release cycle 待機** (rollback 余地確保、旧 column は最低 N+1 期間中 NOT DROPPED)
3. 旧 column drop は Blue/Green では行わず、**maintenance window で直接 DDL** (Blue/Green の switchover reverse 不可制約を回避)

#### rollback rule
- 各 release で必ず「前回の release に戻せる」状態を維持
- column drop / type narrowing / NOT NULL 強化 は **単独 release で行わない** (必ず 3 段)

#### Banking 固有制約
- switchover 中の TPS 0 window (Aurora は ~1 min) は **営業時間外 (06:00 JST 等)** のみ
- 営業時間内 deploy は禁止、change advisory (Type B 設定承認) で時間帯を制約
- switchover 中の 4-eyes 進行中 case は (a) input_confirmation 後 / business_approval 前で pause、(b) switchover 後に同 transaction で再開、を application 側で SOP 化 (open question §13 #15)

#### 10.4.1 pg_partman ⇄ Blue/Green Deployment 衝突制約 (Decision Brief P1 #5)

Aurora Blue/Green Deployment は logical replication で blue → green を sync する仕組みのため、green 側で **DDL を発生させる background worker (BGW)** は replication を破壊する可能性がある。`pg_partman` は新 partition を `maintenance_*` worker で自動生成し、これは DDL = green 側で発火すれば sync conflict、または同 DDL が両 side で並行発火すれば sequence drift を起こす。

**SOP (Phase 1 で SOP 化)**:

1. **Blue/Green window 前**: `partman.run_maintenance_proc()` を schedule から除外、必要 partition を blue 側で **事前生成** (`SELECT partman.run_maintenance(p_analyze := false)`)
2. **Blue/Green window 中**: `pg_partman` BGW を blue / green 両側で **停止** (`ALTER SYSTEM SET pg_partman_bgw.interval = 0; SELECT pg_reload_conf();`)
3. **Switchover 後**: 旧 blue を drop する前に新 primary (旧 green) で BGW を再 enable、partition 状態の差分が無いことを `pg_partman.show_partitions()` で確認
4. **代替案 (Phase 2 で評価)**: BGW に頼らず、別途 Step Functions で nightly partition pre-create job を回す (`pg_partman` extension は keep するが BGW は disable)、Blue/Green と DDL のタイミング衝突を構造的に排除

詳細は AWS doc: https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/blue-green-deployments-considerations.html (logical replication 制約 section 参照)。

Open question §13 #19 として「Phase 1 ops gate で pg_partman BGW vs Step Functions partition job の SOP 選択」を追加。

### 10.5 Migration tooling (Liquibase)

- Changelog は `db/changelog/v{semver}/` 配下、forward-only
- 各 changeset に `<rollback>` を書く (Liquibase rollback 実行は限定運用)
- DDL changeset には reviewer 2 名必須 (人間 + Security)
- 環境 promote 順: dev → staging (synthetic data) → production
- production 適用は Change Advisory (Type B/C config_change_approval) を通す

### 10.6 Secret 管理 SOP

- `external_credential_ref.secrets_manager_arn` で参照、Lambda + RDS proxy 経由でのみ retrieve
- Aurora 内 connection は IAM database authentication (短命 token)、long-lived password は禁止
- 開発者 access は AWS IAM Identity Center + 短命 session (1h)、踏み台 EC2 経由

### 10.7 DR Drill (quarterly)

| Drill                                              | 頻度       | 検証項目                                                                            |
| -------------------------------------------------- | ---------- | ----------------------------------------------------------------------------------- |
| Aurora us-east-1a 障害 → us-east-1b 自動 failover  | 月次       | application reconnect time、open transaction loss、observability alarms (introduced in v1.4 US pivot、current v1.6.2) |
| Aurora us-east-1 Region 障害 → us-west-2 manual failover | 四半期     | RPO 計測 (~3,900km long distance impact)、application Route 53 cutover、credential / RLS context recovery |
| Audit hash chain verification                      | 四半期     | full chain walk + S3 snapshot re-hash + mismatch 検知                              |
| Backup restore (PITR + manual snapshot)            | 半年       | 任意の case_id 復元、application bind test                                          |
| Secret rotation Lambda 全 endpoint                 | 半年       | rotation 中の application impact 計測                                               |

### 10.8 Cost monitoring

- AWS Cost Anomaly Detection を tenant tag (`Tenant=...`) で alarm
- Aurora Performance Insights で slow query 上位 10 を週次 review
- S3 Storage Lens で audit_immutable bucket の月次成長と Glacier transition rate を track

### 10.9 Security baseline

| 領域               | 設定                                                                                          |
| ------------------ | --------------------------------------------------------------------------------------------- |
| Network            | Aurora は VPC private subnet、Public access disabled、RDS proxy 経由 only                     |
| TLS                | TLS 1.3 only、internal も TLS                                                                 |
| Audit              | CloudTrail organizational trail、S3 bucket logging、Aurora `log_statement = 'mod'`            |
| Threat detection   | GuardDuty + Security Hub + Macie (PII scanning on S3)                                        |
| Patch              | Aurora minor version auto-upgrade (maintenance window)、major は手動 + Blue/Green             |
| Pen test           | 年次 + 大規模変更時、結果は `audit_event (event_type='matrix_c_review')` に記録               |

---

## 11. Migration (prototype mock → physical)

### 11.1 mock → seed mapping

| prototype mock file        | 対応 physical table                              | 注                                                                            |
| -------------------------- | ------------------------------------------------ | ----------------------------------------------------------------------------- |
| `mock-cases.ts`            | case + ai_proposal + ai_proposal_field + alert + evidence_step | mock では in-memory、physical は seed data として synthetic で reload          |
| `mock-knowledge.ts`        | knowledge_snippet + knowledge_snippet_version    | 8 field frontmatter を schema mapping、embedding は seed 時に Bedrock で生成    |
| `mock-agents.ts`           | agent + agent_version + 4 sub-config             | mockAgents → seed                                                              |
| `mock-audit.ts`            | audit_event                                      | mock 13 events を seed (production には deploy しない、staging のみ)            |
| `mock-metrics.ts`          | kpi_measurement + kri_state_snapshot             | mock の仮値はすべて `[仮説 / 要検証]` ラベル付き seed                          |
| `mock-proposals.ts`        | procedure_proposal + procedure_proposal_diff     | PROP-2026-031 mock を seed                                                     |

### 11.2 seed 戦略

- `db/seed/staging/*.sql` に synthetic seed (mock data 由来)
- `db/seed/production/*.sql` には **enum + role + screen_access_grant + tenant + system user のみ**、業務 data は手動 onboarding
- production seed は Liquibase context `production` のみ apply

---

## 12. Application API contract (簡易)

DB と Application の境界:
- Application は **RDS proxy 経由 + per-request session context** (`SET app.current_tenant_id`, `SET app.current_user_id`) を渡す
- 認可 short-circuit (= application 側で先に reject) は二重防御、DB RLS は最後の防御線
- Transactional outbox は **同一 transaction** で書く (case update + event_outbox insert)、Lambda は outbox poll → EventBridge

API layer は本 doc 範囲外。OpenAPI / GraphQL schema は Phase 1 別 doc。

---

## 13. Phase 1 hand-off: open question + defer 項目

| #  | 項目                                                          | 決定者                                                | deadline (case 想定)              |
| -- | ------------------------------------------------------------- | ----------------------------------------------------- | --------------------------------- |
| 1  | retention 各 class の正確な保持年数                            | 業務責任者 + Security 関係者 + Compliance 関係者     | Phase 1 設計 gate                 |
| 2  | KMS CMK の per-tenant vs per-environment 配分                  | Security 関係者 + AI 管理者                          | Phase 1 設計 gate                 |
| 3  | **US 規制 framework AWS service mapping doc** (introduced in v1.4 US pivot、current v1.6.2): NYDFS 23 NYCRR Part 500 + FRB SR 11-7 + OCC SR 11-7 + 2023-17 + FFIEC IT Examination Handbook + BSA-AML + OFAC + GLBA + Reg P + Safeguards Rule + State law (NY SHIELD / CCPA-CPRA / VA / CO / CT / UT / IL BIPA) の各条 control への AWS service mapping | Security 関係者 + Compliance officer + external legal counsel + 外部監査 | Phase 1 サンプル業務 投入 1 month 前 |
| 4  | Tier 3 規制語 linter の application or DB layer 配置          | AI 管理者                                             | Phase 1 設計 gate                 |
| 5  | input_artifact (PDF) の OCR 後 raw text 保持要否               | 業務責任者 (audit reproducibility) + Security        | Phase 1 設計 gate                 |
| 6  | Customer master との同期方法 (CDC / API / nightly batch)       | 業務責任者 + 基幹 system 所管                         | Phase 1 接続 gate                 |
| 7  | Vector embedding model の固定 (Bedrock Titan v2 vs alternative) | AI 管理者                                             | Phase 1 設計 gate                 |
| 8  | Autonomous tier sampling 率の決定 logic                        | 業務責任者 + AI 管理者 (Phase 2 で再評価)             | Phase 2 で extend                 |
| 9  | 多通貨 / 為替 rate fetch (国際送金 boundary 側)               | 業務責任者 (boundary 内部判断、Phase 2+ scope)        | Phase 2                           |
| 10 | Cost per tenant chargeback の計上方法                          | 経営層 + Finance                                      | Phase 1 ops gate                  |
| 11 | RPO / RTO 目標の SLA 化 (現在は本 doc § 10.1 の hypothesis)    | 業務責任者 + Security 関係者                          | Phase 1 設計 gate                 |
| 12 | `audit_snapshot_manifest` 自体の append-only enforce 強度       | Security 関係者                                       | Phase 1 設計 gate                 |
| 13 | RBAC を Aurora native role に展開するか、application-only か   | AI 管理者 + Security 関係者                          | Phase 1 設計 gate                 |
| 14 | Test data masking SOP (production data を staging に持つか禁止か) | Security 関係者                                       | Phase 1 ops gate                  |
| 15 | Blue/Green switchover 中の 4-eyes 進行中 case の handling SOP (Finding 9) | AI 管理者 + 業務責任者                              | Phase 1 ops gate                  |
| 16 | Azure Confidential Ledger を cross-cloud backup として導入するか (Finding 11) | Security 関係者 + 経営層 (cost)                       | Phase 2 検討                       |
| 17 | boundary_kind enum の Phase 2+ 拡張 (kyc_final / credit_final) の Type 判定 logic (Finding 13) | 業務責任者 + Security 関係者                          | Phase 2                            |
| 18 | K3 precision / FP の denominator 定義 (population-level FP vs alert-level FP、Finding 10) — 本 doc §3.6 と DOC-MON-05 §4.2.3 の SSOT 同期 | AI 管理者 + 業務責任者                                | Phase 1 設計 gate                 |
| 19 | pg_partman BGW vs Step Functions partition job の SOP 選択 (Decision Brief P1 #5、Aurora Blue/Green 衝突回避) | AI 管理者 + Security 関係者                          | Phase 1 ops gate                  |
| 20 | ~~FISC 安全対策基準 現行公開版の正式特定~~ — **v1.4 US pivot で closure** (US deploy 前提に swap、FISC は JP parent layer 別 doc DOC-CA-09 candidate scope、本 v1.4 doc では NYDFS / FRB / OCC 等 US framework が primary、open #3 と同期) | -                                                  | closed in v1.4 |
| 21 | `customer_reference` を基幹 master と同期する方法 (CDC / API / nightly batch、P0 #2 新規 entity の運用面) — open question #6 と統合検討 | 業務責任者 + 基幹 system 所管                         | Phase 1 接続 gate                 |

---

## 14. 既知のリスク + 残存 gap

| #  | リスク                                                                                            | mitigation                                                                                                                                        |
| -- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| R1 | hash chain serialize lock により audit_event insert TPS が制約 (Finding 3)                          | chain head 別 table 分離 (`audit_chain_head`)、**目標 200-300 events/sec/tenant** を Phase 1 exit criterion、超過時は (a) `(tenant_id, workflow_id)` sub-chain 分割、(b) async batch hash chain を Phase 2 で評価 |
| R2 | KMS column encryption の query 性能劣化                                                            | deterministic encryption (AEAD-SIV) を search 必要 field のみ、それ以外は random IV、Aurora 内 cache hit 重視                                     |
| R3 | pgvector HNSW index の rebuild cost (snippet 増加時)                                              | snippet < 100k では問題なし、増大時に IVFFLAT へ移行 or external vector DB (OpenSearch vector) 評価                                                |
| R4 | RLS policy の漏れ (新 table 追加時に enable し忘れ)                                                | CI で `pg_class WHERE relkind='r' AND relrowsecurity=false` を tenant-aware table list と diff、漏れ検出 fail                                     |
| R5 | trigger drop → audit_event 直接 update の risk                                                     | (a) trigger drop 自体を CloudTrail で alarm、(b) 日次 hash chain verify で発覚、(c) S3 Object Lock daily snapshot で真正性最終担保                  |
| R6 | Workflow version snapshot の sha256 content と Storage の不整合                                    | nightly job で sha256 再計算 + storage 比較                                                                                                       |
| R7 | Phase 1 単一 tenant 想定で multi-tenant 経路の bug 隠れ                                            | Phase 1 末で synthetic 2nd tenant を staging で常駐、cross-tenant leak の RLS test を CI に                                                       |
| R8 | EventBridge → consumer 失敗時の outbox 未配送                                                      | outbox dispatched_at NULL の alarm、Phase 1 で manual replay SOP                                                                                  |
| R9 | Bedrock model availability の region 制約 (新 Claude version GA から us-east-1 / us-west-2 対応まで 0-1 month、introduced in v1.4 US pivot、current v1.6.2 で Tokyo lag risk 大幅低下) | model_artifact で `artifact_kind='base_model_pointer'` + region 列を持ち、不在時は staging region 経由 (cross-region inference、PII 注意) |
| R10 | Aurora Global DB の write-forwarding 制約 (introduced in v1.4 US pivot、current v1.6.2)                                          | DR 時のみ us-west-2 に writer promote、平常時は read-only replica として monitor                                                                   |
| R11 | `connection_attempt` の partition friendly UNIQUE が真の重複防御にならない (Finding 7)             | `idempotency_registry` PK uniqueness を SSOT、application は connection_attempt insert 前に必ず idempotency_registry に INSERT ... ON CONFLICT DO NOTHING、final_status='success' 後の retry は alarm |
| R12 | exporter Lambda 自体の tampering risk (Finding 2 R4 防御の前提)                                    | image digest を別 account `audit-config` bucket に Object Lock で固定、CodePipeline 経由のみ更新、変更時は Security 関係者 Type B 設定承認         |
| R13 | Blue/Green switchover 不可逆 destructive DDL (Finding 9)                                          | 3 段 expand-contract 強制、rollback rule 違反は CI で検出 (DDL changeset の diff 解析、column drop を含む単独 release を block)                    |

---

## 15. 関連文書 + 出典

- DOC-OV-00 §2.2 (接続層 control matrix)
- DOC-FW-01 §3 / §4 / §6.3 / §7 (Flywheel、staging safety、過去 case 不変)
- DOC-APP-02 §1-§9 (3 層承認 + 4-eyes + Type A/B/C + SoD + Matrix C + Role × 画面)
- DOC-UI-03 §4 / §6 / §9 (9 画面 + Alert UI + Staging UI pattern)
- DOC-KNW-04 §3 / §4 / §6 / §7 / §8 (snippet schema + 5-category routing + staging usage + lifecycle + audit event 15 行)
- DOC-MON-05 §3-§6 (SLO + 4 KPI + 7 KPI + 9 KRI)
- DOC-ROOT-\_SSOT §1.1 / §1.4 / §1.5 (enum / snippet schema / connection control matrix)
- DOC-ROOT-prior-art-map (Tier 3 hedge ルール、規制語 trace)
- workflows/_index.md (3 業務並列 + Trust Level Progression)
- workflows/corporate-address-change/_meta.yaml + workflow.md + agent-instructions.md + approval-policy.md
- workflows/international-transfer-boundary/_meta.yaml + BOUNDARY.md
- prototype/src/data/{types,mock-cases,mock-knowledge,mock-agents,mock-audit,mock-metrics,mock-proposals}.ts (current shape の reverse-engineering source)

### 15.1 外部 reference

- AWS Aurora PostgreSQL 16 documentation (RLS, partition, pgvector, Global DB)
- AWS S3 Object Lock (Compliance vs Governance mode) — https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lock.html
- AWS QLDB end-of-life announcement (2025-06) + AWS recommended migration pattern (Aurora + S3 Object Lock + hash chain)
- AWS Japan FISC 安全対策基準 mapping doc (Japan public sector & financial services compliance page) — **Historical reference only** (Tokyo deploy 想定の v1.0-v1.3.2 で参照、introduced in v1.4 US pivot、current v1.6.2 で superseded、current は AWS US Public Sector + Financial Services team による NYDFS / FRB / OCC / FFIEC mapping、DOC-CA-08 §19.1 参照)
- pgvector HNSW vs IVFFLAT trade-off study
- Transactional Outbox pattern (Chris Richardson, microservices.io)
- AWS Well-Architected Financial Services Industry Lens

---

## 16. 後続 PR / TODO

1. ✅ **完了 (v1.3.2 → current v1.6.2 で sync 済)** — `~/.claude/plans/ai-backoffice-ai-virtual-muffin.md` Plan v1.5 section 追加済 + Plan v1.7 US pivot 承認 (L1001-1135)
2. ✅ **完了 (v1.3.2 → current v1.6.2 / _SSOT.md v0.11 で sync 済)** — `docs/_SSOT.md` v0.11 Topic mapping table L56 に DM-07 row 追加済
3. **§2.9 Phase 1 pre-flight checklist 3 項 完了** (introduced in v1.4 US pivot、current v1.6.2: DDL syntactic validation / **US 規制 framework mapping verify** (NYDFS 500 + FRB SR 11-7 + OCC + BSA-AML + OFAC + GLBA + State、§13 #3 と同期、FISC 章番号 review は v1.4 で superseded) / streaming export RPO 計測)
4. `db/changelog/v1.0.0/` に Liquibase changeset 起稿 (Phase 1 着手時、§2.9 #1 と同時)
5. CDK / Terraform IaC repo の bootstrap (Aurora cluster + S3 OL bucket + KMS keys + Secrets rotation + Kinesis Firehose audit pipeline)
6. RBAC / RLS policy test suite (CI で cross-tenant leak / SoD violation を automated、Finding 5 の `case_record` rename 含む schema 全体を test fixture 化)
7. DR drill SOP doc (本 §10.7 を実 runbook 化、四半期 drill schedule)
8. retention class 6 段の正確な年数 (open question §13 #1 + #3) lock
9. Phase 1 hand-off review (本 doc + DOC-OV-00 §2.2 + DOC-APP-02 §9.8 を 1 つの hand-off package に bundle、Type B 設定承認に提示)
10. Liquibase changeset CI に **destructive DDL block linter** 追加 (Finding 9、column drop / NOT NULL 強化 / type narrowing を含む単独 release を reject)
11. exporter Lambda image digest 固定 SOP doc 起稿 (Finding 2 R12、別 account `audit-config` bucket 運用)
