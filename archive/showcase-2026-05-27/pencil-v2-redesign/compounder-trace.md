# Compounder Trace — Pencil v2 Redesign

> 各 frame に適用した compounder knowledge card path と該当 claim を列記。back-port 時の audit 用 ledger。

## Common (全 14 frame 適用)

| Card | 適用 claim |
|---|---|
| `knowledge/ui-design/wow-taxonomy-for-web-ui.md` | 1 primary + 1 secondary 系統宣言、残り 3 系統は意図的に弱める |
| `knowledge/ui-design/when-minimalism-beats-wow.md` | banking restraint context = minimalism が premium signal、装飾 motion / gradient / glassmorphism は scope-out |
| `knowledge/ui-design/progressive-disclosure-and-density.md` | inline / drawer / modal / fullpage 4 surface 振り分け |
| `knowledge/ui-design/scan-pattern-induced-by-layout.md` | F / layer-cake / spotted / marking / commitment / bypassing から 1 つ宣言、Tier × Pattern matrix で diagnose |
| `knowledge/ux-design/text-density-investigation-framework.md` | 5 軸 (量 / 文 / hierarchy / reading-mode / CJK) で削減と保持の境界 |
| `knowledge/ui-design/when-more-text-is-correct.md` | 削減 reflex を default にしない 7 文脈 (audit / consent / citation / error / rejection / onboarding / editor) |
| `knowledge/ui-design/dashboard-density-tier-bands-ui.md` | 1 画面 1 tier 厳守、Exec/Manager/Operator/Power-user の 4 tier 選定 |
| `knowledge/ui-design/modal-vs-drawer-vs-fullpage-decision.md` | 確認・実行→modal / 詳細 read+context→drawer / 別 workflow→full page |
| `knowledge/ui-design/empty-error-loading-states.md` + `state-text-density-alignment.md` | state design (本 v2 は主に default state、empty/error は別 spec) |
| `knowledge/ui-design/cognitive-accessibility-deep.md` | reading flow / cognitive load |
| `knowledge/ui-design/editorial-typography-for-premium-web.md` + `jp-display-typography-premium.md` | typography hierarchy (display / heading / body / mono) |
| `knowledge/ui-design/spacing-and-rhythm-for-premium-web.md` + `grid-system-for-premium-web.md` | spacing scale + grid |
| `knowledge/ui-design/color-system-for-premium-web.md` | semantic color discipline (indigo / emerald / amber / red) |
| `knowledge/ui-design/micro-interaction-inventory.md` | static representation の interaction signaling (hover / selected state は frame で表現) |
| Memory `feedback_clear_language.md` | 略語禁止 + 平易日本語 |
| Memory `feedback_composition_over_components.md` | NARRATIVE > Composition > Component の harness |
| Memory `feedback_warm_bone_lp_aversion.md` | cool palette default 維持 (Operational Premium Light slate-50 base) |

## Frame-specific

### R1A Dashboard Editorial Overview

- `knowledge/ui-design/executive-dashboard-layout-pattern.md` — CEO/Board 向け Tier 1 layout、≤ 8 elements、large numerals、whitespace 40%+
- `knowledge/ui-design/editorial-typography-for-premium-web.md` — 大型 display + 余白支配 + monospaced numerals
- `knowledge/ui-design/empty-state-as-wow-opportunity.md` (subset) — hero stat の 「今日のアテンション」 framing

### R1B Dashboard Operator Cockpit

- `knowledge/ui-design/operator-cockpit-multi-agent-oversight-ui.md` — 3 viewport F-pattern (KPI strip + per-agent grid + drill panel)
- `knowledge/ui-design/dashboard-density-tier-bands-ui.md` — Tier 3 Operator (≤ 60 elements、24-32px element height、operator console)
- `knowledge/ui-design/bento-grid-and-visual-heterogeneity.md` — 業務 card heterogeneity (stage bar + queue meta + arrow)
- `knowledge/ui-design/keyboard-shortcuts-and-power-user.md` — ⌘1 quick-pick

### R2 Inbox Density Power-user

- `knowledge/ui-design/data-table-premium-tier.md` — 9 column dense table + striping + critical-first sort
- `knowledge/ui-design/search-and-filter-premium-tier.md` — 5 facet filter chip + active state coloring
- `knowledge/ui-design/keyboard-shortcuts-and-power-user.md` — ⌘O 先頭 open + ⌘1-9 row pick + ⌘F 検索
- `knowledge/ui-design/dashboard-density-tier-bands-ui.md` — Tier 4 Power-user (Bloomberg-grade)

### R3A CaseReview Editorial

- `knowledge/ui-design/diff-and-change-preview-ui.md` — 大型 char-level diff (3 view 中 inline diff、word/char highlight)
- `knowledge/ui-design/citation-and-source-disclosure-ui.md` — T1 in-line citation badge (4 tier 中 T1)、staging hint 「詳細を見る →」 progressive disclosure
- `knowledge/ui-design/confidence-and-uncertainty-visualization-ui.md` — Form 1 (numeric %) + Form 4 (interval 86-94) 併用、banking decision context
- `knowledge/ui-design/ai-native-hil-approval-ui.md` — 5-state timeline (sticky lifecycle stepper) + 承認者承認 chip + sticky action bar

### R3B CaseReview Density-split

- `knowledge/ui-design/diff-and-change-preview-ui.md` — compact diff (右 column 内)
- `knowledge/ui-design/action-history-timeline-audit-trail-ui.md` — 6-step evidence timeline (中央 column)
- `knowledge/ui-design/artifact-panel-conversation-pattern-deep.md` — 3 column = (AI 入力 form / 中央 evidence / AI 提案 detail)
- `knowledge/ui-design/tool-call-visualization.md` — tool call (API + OCR + マスタ照合) を timeline で観察可能化

### R4 SendBackComment Form

- `knowledge/ui-design/form-design-premium-tier.md` — radio chip × 4 + 必須 textarea + evidence checkbox + 文字数 counter
- `knowledge/ui-design/jp-form-conventions.md` — JP label first + textarea placeholder JP hint + 必須 label
- `knowledge/ux-design/agent-failure-explainability-ui.md` — 差戻し reason の言語化 (5 element 中 source attribution + counterfactual)
- `knowledge/ui-design/when-more-text-is-correct.md` — rejection 文脈で過剰削減防止 (placeholder JP hint + 「次回 AI 提案に staging hint」hedge 保持)

### R5A ProposalReview Editorial

- `knowledge/ui-design/diff-and-change-preview-ui.md` — 大型 diff body (3 view 中 side-by-side、red strike + green underline)
- `knowledge/ui-design/ai-native-hil-approval-ui.md` — 提案 lifecycle stepper (差戻し → 整理 → 承認 → 反映)
- `knowledge/ux-design/multi-step-approval-and-workflow.md` — RACI box + SoD (職務分離) note

### R5B ProposalReview Density list

- `knowledge/ui-design/data-table-premium-tier.md` — 5 row queue list + selected row highlight
- `knowledge/ui-design/modal-vs-drawer-vs-fullpage-decision.md` — drawer (詳細 read + context 維持)
- `knowledge/ux-design/multi-step-approval-and-workflow.md` — drawer 内 RACI compact + status pill

### R6 AgentSettings

- `knowledge/ui-design/agent-action-confirmation-ui.md` — Trust Level Progression hero (Matrix B 視覚化、3-stage stepper)
- `knowledge/ui-design/form-design-premium-tier.md` — 5 領域 read-only summary cards
- `knowledge/ui-design/kill-switch-and-emergency-control-ui.md` (subset) — 引き上げ申請 disabled with reason (dual-control pattern の applied)

### R7 AuditTrail Density swimlane

- `knowledge/ui-design/action-history-timeline-audit-trail-ui.md` — actor-separated swimlane (AI / Human / System) + 5 facet filter + replay control + export 4 format
- `knowledge/ui-design/data-table-premium-tier.md` — dense event row + state badge
- `knowledge/ui-design/search-and-filter-premium-tier.md` — 5 facet (業務 / actor / outcome / risk / search)
- `knowledge/ui-design/dashboard-density-tier-bands-ui.md` — Tier 4 Power-user

### R8A Metrics Editorial IR

- `knowledge/ui-design/executive-dashboard-layout-pattern.md` — IR prospectus cover + 6 tile + grade hero
- `knowledge/ui-design/financial-chart-and-data-viz-deep.md` — sparkline + CI bar + delta pill
- `knowledge/ui-design/editorial-typography-for-premium-web.md` — large display numerals + italic body

### R8B Metrics Density Manager

- `knowledge/ui-design/dashboard-density-tier-bands-ui.md` — Tier 2 Manager (≤ 24 elements、40-50px height、4 KPI gate hero + 9 KRI grid)
- `knowledge/ui-design/financial-chart-and-data-viz-deep.md` — multi-criteria gate visualization + state badge
- `knowledge/ui-design/state-text-density-alignment.md` — KRI state (normal / caution / critical) アライメント

### R9A Knowledge Editorial Library

- `knowledge/ui-design/account-hierarchy-and-portfolio-ui.md` (適応) — 218 compiled + 94 staging の hierarchy
- `knowledge/ui-design/citation-and-source-disclosure-ui.md` — T1 / T2 tier badge + 「compiled = AI 引用対象」 governance + 「staging = citation 対象外」分離 (`docs/03` Citation Governance SSOT 整合)
- `knowledge/ui-design/note-taking-document-editor-ui.md` (subset) — article card reading style

### R9B Knowledge Density Bento

- `knowledge/ui-design/bento-grid-and-visual-heterogeneity.md` — 8 cell heterogeneity (KPI dark / sparkline / 3 lane / donut / matrix / trigger list)
- `knowledge/ui-design/account-hierarchy-and-portfolio-ui.md` (適応) — coverage matrix (業務 × tier)
- `knowledge/ui-design/citation-and-source-disclosure-ui.md` — weight 分布 donut + staging tint + citation 対象外 governance

---

## Cross-frame governance trace

- **Operational Premium Light SSOT** (`docs/03-ui-prototype-design.md` §2.7) — 14 frame で 100% 遵守、新 token 0
- **Citation Governance** (`prototype/CLAUDE.md`) — R3A / R3B / R9A / R9B で「compiled (high) = 引用根拠」「staging (low/medium) = citation 対象外」を別 panel + 別 tint で分離表示
- **9 route invariant** — 14 frame は exactly 9 route の variant (5 routes × 2 + 4 routes × 1)、10 番目の route 追加なし
- **JP-first** — 14 frame で UI 文言は日本語、英語は技術固有名詞のみ (case ID / agent name / API / OCR / KPI / SLO / SoD / DKIM / SPF / version / JST / UTC)
- **`[仮説 / 要検証]` hedge** — Metrics 系 (R8A 全 tile / R8B page head) で governance hedge label 保持
- **承認者承認 chip** — R3A / R3B で「承認者承認: 承認待ち」UI label SSOT 遵守 (component 名 `BusinessApprovalChip` leak なし)
- **Lifecycle stepper** — R3A / R3B / R4 で「受付 → AI 処理 → 入力者確認 → 承認者承認 → 反映」exactly (手順承認 含まない、ProposalReview の lifecycle は別系統)
