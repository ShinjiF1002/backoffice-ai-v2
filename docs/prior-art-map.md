# Prior Art Map - backoffice-ai-v2

v1 (`backoffice-ai`) + ai-operator paper から、本 v2 が「**継承 (HIGH) / 再編 (MEDIUM) / 捨てる (LOW / drop)**」する判断を file:line 単位で記録する SSOT。本 file は Day 1 起稿、Day 5 + Day 10 (Design Gate) + Day 19 で spot-check。旧 repo は本 map 完成後も touch しない (read-only prior art、move なし)。

| 項目            | 値                                                                 |
| --------------- | ------------------------------------------------------------------ |
| 文書 ID         | DOC-ROOT-prior-art-map                                             |
| 文書名          | Prior Art Map (旧 repo → v2 継承 / 再編 / 捨てる)                  |
| 版数            | v0.1                                                               |
| ステータス      | Draft                                                              |
| オーナー        | backoffice-ai-v2 maintainer                                        |
| 承認者          | self — 設定承認 (旧 repo 取扱方針の確定)                           |
| 閲覧対象        | Internal / Project team                                            |
| 機密区分        | Internal                                                           |
| 関連文書        | DOC-ROOT-_SSOT, DOC-ROOT-_HEADER_TEMPLATE                          |
| SSOT 区分       | 旧 repo (v1 + ai-operator) 参照関係 + 継承 / 再編 / 捨てる の SSOT |
| Evidence Status | N/A (設計のみ、定量値なし)                                         |
| 改版履歴        | v0.1 (2026-05-21): 初版作成 (Day 1)。v0.1 (2026-05-22): Day 2 で 12 項目 header 追記 |

Refresh schedule: Day 5 (review 1) + Day 10 (Design Gate) + Day 19 (UI freeze)。旧 repo は `~/code/active/` 内に保持、archive 移動は本 plan scope 外。

## Source repos

| Repo | Path | Role |
|---|---|---|
| v1 (backoffice-ai) | `~/code/active/backoffice-ai/` | UI prior art (Enterprise Premium token、5-category error taxonomy、shared component pattern) |
| ai-operator | `~/code/active/ai-operator/` | Governance paper (3 層承認、Matrix RACI、Automation Maturity、KPI/KRI catalogue) |
| cowork-workshop | `~/code/active/cowork-workshop/` | Session 1-3 narrative (Tier 1 語彙 source)、Session 4 開催 meta、Day 19 で `CLAUDE.md` + `workshop-design.md` を update (`session-*-narrative.md` は touch しない) |

## Inheritance Summary

| Source | 継承 (HIGH) | 再編 (MEDIUM) | 捨てる (LOW / drop) |
|---|---:|---:|---:|
| `ai-operator/docs/01-hitl-policy.md` | 9 sections | 4 sections | 6 sections (規制 framing 主) |
| `ai-operator/docs/22-prd.md` | 7-panel + 3-tab | 1 lane (BSA-Restricted のみ) | 3 spec (SAR / Adverse action / Customer Comms) |
| `ai-operator/docs/24-monitoring.md` | KPI / KRI catalogues | Alert routing | UC-specific Phase 0 targets |
| `ai-operator/docs/11-ia-screen-tree.md` | 9-field Screen Card template | Role-Screen Matrix (compress) | Incident Console (Screen 9) |
| `ai-operator/docs/_SSOT.md` + `_HEADER_TEMPLATE.md` | Approval Taxonomy + 12-項目 header | SSOT Mapping (recalibrate) | Regulation grid (drop) |
| `backoffice-ai/CLAUDE.md` | Trust Level + Tier 1/2 + JP typography rules | Component pattern (re-implement) | 95% / 90% mixed threshold (drop、v2 で 4 KPI 仮説 gate に再構築) |
| `backoffice-ai/knowledge/error_taxonomy.md` | 5-category routing | — | — |
| `backoffice-ai/ui-prototype/src/components/shared/*.tsx` | 9 component pattern | — | 11 画面 code (drop、v2 で 9 画面に再編、code は流用しない) |
| `backoffice-ai/CRYSTALLINE-MIGRATION-ANALYSIS.md` | — | — | drop (検討された design system pivot の archive) |
| `cowork-workshop/session-{1,2,3}-narrative.md` | Tier 1 語彙、tone register | Session arc continuity | hands-on 前提 (drop for S4) |
| `cowork-workshop/CLAUDE.md` + `workshop-design.md` | meta-config | Day 19 で update | — |

## Inheritance Details (HIGH 18 items)

`docs/02-approval-model.md` / `docs/03-ui-prototype-design.md` / `docs/04-knowledge-pipeline.md` / `docs/05-metrics-and-gates.md` / `docs/06-session4-narrative.md` / `prototype/src/` で消費する file:line pointer 集。

| # | 取込内容 | Source file:line | v2 反映先 | Day |
|---|---|---|---|---|
| 1 | 3 層承認 §3.1-3.3 (業務 / 知識 / 設定 Type A/B/C) + §4 役割定義 | `ai-operator/docs/01-hitl-policy.md` line 81-167 | `docs/02-approval-model.md` (規制 cite は hedge) | Day 4 |
| 2 | Matrix A/B/C RACI (§5) + 自動化成熟度 §6.1-6.4 (Supervised / Checkpoint / Autonomous) | `ai-operator/docs/01-hitl-policy.md` line 171-242 | `docs/02-approval-model.md` + `prototype/src/components/shared/TrustLevelBadge.tsx` | Day 4 + Day 12 |
| 3 | **Matrix B 重要原則**: 自動化レベル進化しても知識・設定承認 loop は縮小しない、縮小するのは業務承認頻度のみ | `ai-operator/docs/01-hitl-policy.md` line 198-204 | `docs/06-session4-narrative.md` Slide 7 message の核 | Day 9 |
| 4 | Promotion Criteria §7 (multi-criteria gate の base) | `ai-operator/docs/01-hitl-policy.md` §7 line 246-284 | `docs/05-metrics-and-gates.md` (4 KPI gate、`[仮説 / 要検証]` ラベル、実 gate ではない) | Day 9 |
| 5 | **Workbench 7-panel layout (A-G)** Case Review の core spec — A. Case meta / B. Customer info / C. Supporting doc / D. Agent proposal / E. Derived data scope / F. Action bar / G. Comments | `ai-operator/docs/22-prd.md` §4.4 line 163-174 | `prototype/src/pages/CaseReviewPage.tsx` + `prototype/src/components/case/AiProposalPanel.tsx` | Day 14 |
| 6 | Approval Center 3-tab spec — v2 では業務 tab は slide-only static mock 化、知識 tab → ProposalReviewPage、設定 tab → AgentSettingsPage に再編 | `ai-operator/docs/22-prd.md` §5.3-5.5 line 207-242 | `prototype/src/pages/ProposalReviewPage.tsx` + `prototype/src/pages/AgentSettingsPage.tsx` + `prototype/src/components/case/BusinessApprovalChip.tsx` + `demo/static-mocks/business-approval-view.html` | Day 15 + Day 17 + Day 12 + Day 20 |
| 7 | 9-field Screen Card template (Purpose / Personas / Objects / Actions / Approvals / Evidence / Prohibited / Dependencies / CTQ) | `ai-operator/docs/11-ia-screen-tree.md` §4 line 108-122 | `docs/03-ui-prototype-design.md` で 9 画面 × 9 field (v2 再編 taxonomy、ai-operator は別の 9 画面、継承ではなく taxonomy 新設) | Day 8 |
| 8 | 7 KPI catalogue (volume / latency / accuracy / exception rate / escalation % / rollback % / MAPE) | `ai-operator/docs/24-monitoring.md` §3.2 line 157-167 | `docs/05-metrics-and-gates.md` Secondary metrics | Day 9 |
| 9 | 9 KRI catalogue + Stub Label Taxonomy (Control minimum / Initial target / Hypothesis) | `ai-operator/docs/24-monitoring.md` §4.1 line 199-209 | `docs/05-metrics-and-gates.md` Alert section + `prototype/src/components/metrics/KpiGateCard.tsx` | Day 9 + Day 12 |
| 10 | SSOT mapping + Approval Taxonomy + 12-項目 header | `ai-operator/docs/_SSOT.md` line 10-26, 158-172 + `_HEADER_TEMPLATE.md` | `docs/_SSOT.md` (Day 1 起稿) + `docs/_HEADER_TEMPLATE.md` (Day 2 起稿)、規制 mapping grid は本 map でリンク化のみ | Day 1 + Day 2 |
| 11 | Enterprise Premium design token (indigo 275 / violet 290 / emerald / amber + premium shadows) | `backoffice-ai/design-explorations/02-enterprise-premium.html` + `backoffice-ai/ui-prototype/src/index.css` | `prototype/src/index.css` | Day 11 |
| 12 | shared component pattern (KpiTile / FlywheelDiagram / ConfidenceBadge / ListRowCard / StatusPill / Num / TrustLevelBadge / CategoryIcon / PageHeader) | `backoffice-ai/ui-prototype/src/components/shared/*.tsx` (9 files) | `prototype/src/components/shared/` (re-implement、code 流用なし) | Day 12 |
| 13 | 5-category error taxonomy (misunderstanding / ui_change / edge_case / judgment_gap / data_error) + routing logic | `backoffice-ai/knowledge/error_taxonomy.md` + `backoffice-ai/CLAUDE.md` §Error Taxonomy | `docs/04-knowledge-pipeline.md` + `prototype/src/pages/SendBackCommentPage.tsx` | Day 8 + Day 16 |
| 14 | JP typography rules (palt / tabular-nums / Num wrapper / tracking-normal leading-[1.4]) | `backoffice-ai/CLAUDE.md` line 155-160 | `prototype/src/components/shared/Num.tsx` + `prototype/src/index.css` | Day 11 + Day 12 |
| 15 | Tier 1/2/3 disclose 順 + Session 1-3 語彙整合 + S1 hard boundary → S4 soft + gated evolution | `cowork-workshop/session-{1,2,3}-narrative.md` (read-only 参照、編集なし) + `workshop-design.md` (Day 19 で update) + `CLAUDE.md` (Day 19 で update) | `docs/06-session4-narrative.md` Slide 1-3 | Day 9 |
| 16 | Workbench 許可 verbs (`create / update / retrieve / authorize.execute / reject / escalate / forward`) — `authorize.execute` は Backend service が Operator-authorized context で execute、Agent は propose/extract/map のみ | `ai-operator/docs/22-prd.md` §4.2 line 150 | `prototype/src/data/types.ts` + `prototype/src/components/case/ReviewActionBar.tsx` | Day 11 + Day 14 |
| 17 | Cross-screen rules (state machine、edge cases、error conditions) | `ai-operator/docs/22-prd.md` §14 line 630-669 | `prototype/src/context/AppContext.tsx` の state transition | Day 11 |
| 18 | LLMOps framework (Prompt version mgmt、A/B test、eval pipeline、drift detection、token tracking) | `ai-operator/docs/24-monitoring.md` §11 line 459-502 | `docs/04-knowledge-pipeline.md` LLMOps section | Day 8 |

## Re-organize Details (MEDIUM、9 画面 v2 再編 mapping)

ai-operator の 9 画面 (`docs/11-ia-screen-tree.md` §5) と本 v2 の 9 画面 (`docs/03-ui-prototype-design.md`、Day 8 起稿) の対応関係。**v2 は独自 taxonomy、ai-operator の 1:1 継承ではない**。

| ai-operator 画面 (11 §5) | v2 画面 (`docs/03`) | 関係 |
|---|---|---|
| Screen 1 Role Dashboard | `CaseDashboardPage` (`/home`) | role-aware dashboard を Session 4 用に compress、**2 業務カード化** (国際送金カードなし) |
| Screen 2 Workbench | `CaseReviewPage` (`/cases/:id`) + `SendBackCommentPage` (`/cases/:id/comment`) | 7-panel review と差戻しコメント capture を分離 |
| Screen 3 Approval Center | `ProposalReviewPage` + `AgentSettingsPage` + `BusinessApprovalChip` + `demo/static-mocks/business-approval-view.html` | 3-tab を 3 場所に split (業務 tab は static mock 化) |
| Screen 4 Exception & Escalation Center | — | drop for v2 (Phase 2+ deferred、Alert summary のみ各画面に埋め込む) |
| Screen 5 Knowledge Center | `KnowledgeLibraryPage` (`/knowledge`) | rename + 5-category integration |
| Screen 6 Agent Registry & Release Control | `AgentSettingsPage` (`/agents`) | rename + compress |
| Screen 7 Monitoring & Evaluation | `MetricsPage` (`/metrics`) | 4 KPI 仮説 gate visualization に compress |
| Screen 8 Audit & Evidence Explorer | `AuditTrailPage` (`/audit`) | audit trail / evidence search を compress |
| Screen 9 Incident Console | — | drop for v2 (Phase 2+ deferred) |
| (v2 新規) | `PdfInboxPage` (`/inbox`) | PDF watcher 起点 |

ai-operator 7 画面 (1, 2, 3, 5, 6, 7, 8) を v2 で rename + split + compress。ai-operator 2 画面 (4, 9) は drop / Phase 2+ defer。v2 新規は `PdfInboxPage`。合計 v2 9 画面。

## Drop Details (LOW、v2 で捨てる items)

| Source | Item | 理由 |
|---|---|---|
| `ai-operator/docs/22-prd.md` Screen 8 Customer Comms (line 600+) | (defer) | Phase 2+ scope、v2 では構造のみ `docs/03-ui-prototype-design.md` で言及 |
| `ai-operator/docs/22-prd.md` Screen 9 Incident Console (line 700+) | (defer) | 同上 |
| `ai-operator/docs/22-prd.md` Adverse action screen + SAR-Specific lane | (defer) | Phase 2+ scope、v2 では BSA-Restricted lane のみ言及 |
| `ai-operator/docs/00-vision-charter.md` §3 U.S. Regulatory Mapping (line 75-108) | (drop) | NYDFS / JPMC / Citi / ING bench references、v2 では cite せず本 map でのみリンク |
| `ai-operator/docs/01-hitl-policy.md` §10 Prohibited Domain 逐語引用 (line 351-381) | (drop) | regulatory citation、v2 では prohibited activity list のみ `docs/02-approval-model.md` に転載 (規制名なしで) |
| `ai-operator/docs/24-monitoring.md` §5.bis Alert logic (MRM / Risk 経路、line 230-281) | (drop) | regulatory severity routing、v2 では 3 severity (High / Medium / Low) に compress |
| `ai-operator/docs/00-vision-charter.md` §12 Governance MRM/Compliance/Risk meeting bodies | (drop) | Phase 0/1 narrative、v2 では Ops-only に compress |
| `backoffice-ai/CRYSTALLINE-MIGRATION-ANALYSIS.md` | (drop) | 検討された design system pivot の archive、v2 では再開しない |
| `backoffice-ai/ui-prototype/src/` の React code 全件 | (drop) | code 流用なし、structure + design token + shared component pattern + JP typography のみ参考 |
| `backoffice-ai/CLAUDE.md` 95% / 90% mixed threshold | (drop) | v2 で 4 KPI multi-criteria 仮説 gate に再構築 |
| `cowork-workshop/session-1-narrative.md` hands-on 22 min + Cowork install handoff | (drop for S4) | Session 4 は説明 + demo のみ、hands-on なし |

## Hedge ルール (規制語の扱い)

v2 docs 内で `MRM` / `CISO` / `Risk` (固有部署として) / `NYDFS` / `SR 11-7` / `CCPA` / `OFAC` / `BSA` / `SAR` / `CTR` / `ECOA` を使う時:

- **事実主張** → 禁止 (例: 「NYDFS Part 500 の要件は...」と書かない)
- **参照のみ** → `[ai-operator paper §X.Y 参照、本 v2 では将来確認項目]` の hedge 表現 (例: 「規制対応の参照は ai-operator paper §X.Y、本 v2 では将来確認項目」)
- **Session 4 表層** (slide / UI label / copy) → 完全に出さない

Day 10 Design Gate + Day 19 + Day 21 で `grep -rEn "(MRM|CISO|NYDFS|SR 11-7|CCPA|OFAC|BSA|SAR|CTR|ECOA)"` を **v2 repo + cowork-workshop/CLAUDE.md + cowork-workshop/workshop-design.md** に限定実行。`cowork-workshop/session-{1,2,3}-narrative.md` は scope 外 (内部の旧 S4 参照は expected historical hit として無視)。

## Drift Detection

旧 repo を touch しない前提で、本 map の drift (旧 repo 内容変更時の追従漏れ) は低リスク。ただし Day 5 + Day 10 + Day 19 buffer で:

- 旧 repo の git log を確認、変更があれば本 map の line range を spot-check
- 本 map の Reuse Pointer #1-#18 の Source file:line が旧 repo で生存しているか確認 (例: `head -200 ai-operator/docs/01-hitl-policy.md | grep "§3.1"`)

Day 10 Design Gate で全 18 items の line range を 1 回 sweep 検証。
