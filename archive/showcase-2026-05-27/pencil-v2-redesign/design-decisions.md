# Design Decisions — Pencil v2 Redesign (14 frames)

> 1 frame = 1 brief。各 brief は build 前 lock、build 中の逸脱は audit-loop.md に記録。

## Cross-cutting decisions

- **Wow base**: Editorial (primary) × Density (secondary) を全 frame の base、各 frame で primary/secondary を tuning
- **JP-first**: JP body = Noto Sans JP / mono numerals (case ID / version / timestamp / 件数 / 信頼度) = JetBrains Mono / labels = Inter
- **App header**: 全 frame で brand mark + breadcrumb 1 段 + プロトタイプ pill + ⌘K hint + avatar (高密度の単一 bar、削れない部分は固定)
- **Bottom action bar**: 主要 CTA は sticky bottom (CaseReview / Proposal / SendBack)、grid 系画面は header の右端に primary action 配置
- **Color discipline**: indigo = action、emerald = success/compiled、amber = warning/staging、red = critical/diff-removed、slate = neutral。装飾 gradient なし (Onboarding は範囲外、本 task は production-tier surface のみ)
- **Lifecycle stepper**: 受付 → AI 処理 → 入力者確認 → 承認者承認 → 反映 (CaseReview / SendBack のみ表示、Dashboard 等は表示しない)
- **承認者承認 chip**: UI 表示文言 `承認者承認: 承認待ち` (component 名 leak 禁止)
- **削減 default**: 説明文 / instructional copy / `[仮説 / 要検証]` 注は drawer / footer に移動、本文 viewport に置かない

---

## R1A — Dashboard Editorial Overview

| 項目 | 値 |
|---|---|
| Density tier | 1 — Executive |
| Wow primary | Editorial (大型 display numerals + 余白支配) |
| Wow secondary | Density (sub-strip のみ) |
| 1 秒で分かること | 今 attention 必要な top 1 件 + fleet health grade A− |
| Primary CTA | "BO-7281 を開く" (top urgent case を強調) |
| Scan pattern | Layer-cake (上から下、hero → 業務 2 card → workflow lane) |
| 削る要素 (3) | 工程説明 caption / 「次の実装段階」 footer / workflow 名以外の冗長 stat |
| 残す要素 + 理由 | 業務 card x2 (UC-BO-01/02 SSOT)、attention strip (queue-level 警告、削れない判断 surface)、プロトタイプ pill (削れない governance signal) |
| 適用 compounder card | `executive-dashboard-layout-pattern` / `dashboard-density-tier-bands-ui` (tier 1) / `editorial-typography-for-premium-web` / `when-minimalism-beats-wow` |

## R1B — Dashboard Operator Cockpit

| 項目 | 値 |
|---|---|
| Density tier | 3 — Operator |
| Wow primary | Density (F-pattern 3-viewport + heterogeneous queue) |
| Wow secondary | Editorial (KPI strip のみ) |
| 1 秒で分かること | 業務 2 種の queue depth / 注意件数 / 自分の next 案件 |
| Primary CTA | "Pick top case" (1-key shortcut hint) |
| Scan pattern | F-pattern (KPI strip → queue grid → drill panel) |
| 削る要素 (3) | 「ようこそ」copy / 工程説明 / sub-KPI 単位説明文 |
| 残す要素 + 理由 | 5 KPI (operator が 1 sec 把握)、業務別 queue counts、attention chip、プロトタイプ pill |
| 適用 compounder card | `operator-cockpit-multi-agent-oversight-ui` / `dashboard-density-tier-bands-ui` (tier 3) / `bento-grid-and-visual-heterogeneity` |

## R2 — Inbox Density Power-user

| 項目 | 値 |
|---|---|
| Density tier | 4 — Power-user (Bloomberg-grade) |
| Wow primary | Density (dense table + 5 facet filter + 1-key sort) |
| Wow secondary | Editorial (header KPI strip) |
| 1 秒で分かること | critical-first sort で自分が次に開く 1 件 |
| Primary CTA | "Open BO-7281" (top row highlight + ⌘O hint) |
| Scan pattern | Marking (top row highlighted、F の縦軸 scan) |
| 削る要素 (3) | 列ヘッダ tooltip caption / 「次の実装段階」 footer caption / filter chip の "すべて" default 表記 |
| 残す要素 + 理由 | 5 facet filter (削ると power-user 不全)、status badge、SLA 経過 mono tint (critical 判断)、注意 chip |
| 適用 compounder card | `data-table-premium-tier` / `search-and-filter-premium-tier` / `keyboard-shortcuts-and-power-user` / `dashboard-density-tier-bands-ui` (tier 4) |

## R3A — CaseReview Editorial-led

| 項目 | 値 |
|---|---|
| Density tier | 3 — Operator |
| Wow primary | Editorial (large display numerals for confidence + typographic diff calligraphy) |
| Wow secondary | Density (evidence timeline mono cadence) |
| 1 秒で分かること | AI の **what changed** (char-level diff) と **confidence 91% high** |
| Primary CTA | "approve" (sticky bottom action bar、indigo filled) |
| Scan pattern | Commitment (上から read → 下の commit へ) |
| 削る要素 (3) | citation full body (drawer 移行) / staging hints 詳細 (drawer hint chip のみ) / metadata strip の単位説明文 |
| 残す要素 + 理由 | diff 本体 (red strikethrough + green underline、削ると承認判断不能)、confidence numerals、citation T1 強度 indicator、lifecycle stepper、承認者承認 chip |
| 適用 compounder card | `diff-and-change-preview-ui` / `citation-and-source-disclosure-ui` / `confidence-and-uncertainty-visualization-ui` (form 4 interval) / `ai-native-hil-approval-ui` |

## R3B — CaseReview Density-split

| 項目 | 値 |
|---|---|
| Density tier | 3 — Operator |
| Wow primary | Density (3-column tight + per-step timeline mono cadence) |
| Wow secondary | Editorial (diff block の display typography) |
| 1 秒で分かること | 全証跡 (PDF + OCR + マスタ照合) timeline と AI 提案を並列 scan |
| Primary CTA | "approve" (sticky bottom action bar) |
| Scan pattern | Layer-cake × 3 column (各 column が縦 scan) |
| 削る要素 (3) | 各 step の補足説明 / panel 装飾 / 重複した badge |
| 残す要素 + 理由 | 6-step timeline (証跡完結性)、diff block、citation + staging panel 分離、承認者 chip |
| 適用 compounder card | `diff-and-change-preview-ui` / `action-history-timeline-audit-trail-ui` / `artifact-panel-conversation-pattern-deep` / `tool-call-visualization` |

## R4 — SendBackComment Form

| 項目 | 値 |
|---|---|
| Density tier | 3 — Operator (form-mode) |
| Wow primary | Editorial (typographic form + large category chips) |
| Wow secondary | (none、form-mode は単一系統) |
| 1 秒で分かること | 差戻し reason 4 種から 1 つ選択 + 必須 free-text |
| Primary CTA | "差戻しを記録" (footer right、disabled→active feedback) |
| Scan pattern | Layer-cake (上から下) |
| 削る要素 (3) | 各カテゴリの長い説明 (inline 1 行に圧縮) / 関連 evidence section の冗長注 / footer caption の補助説明 |
| 残す要素 + 理由 | 4 category (5-category から data_error を分離 banner 化、削れない routing 判断)、free-text mandatory、文字数 counter、proposal 影響 hint |
| 適用 compounder card | `form-design-premium-tier` / `jp-form-conventions` / `agent-failure-explainability-ui` (差戻し reason 言語化) / `when-more-text-is-correct` (rejection 文脈で過剰削減防止) |

## R5A — ProposalReview Editorial diff

| 項目 | 値 |
|---|---|
| Density tier | 3 — Operator |
| Wow primary | Editorial (proposal title 大型 + diff before/after typographic) |
| Wow secondary | Density (元案件 list + RACI compact) |
| 1 秒で分かること | 提案の status + 差分要約 + 3 択 (approve / reject / defer) |
| Primary CTA | "業務責任者へ送付" (footer right) |
| Scan pattern | Commitment (read → commit) |
| 削る要素 (3) | RACI 詳細説明文 / 元案件 row の冗長 meta / 「次の実装段階」 caption |
| 残す要素 + 理由 | 提案 summary、diff before/after、RACI box (削れない governance)、元案件 link、proposal status badge |
| 適用 compounder card | `diff-and-change-preview-ui` / `multi-step-approval-and-workflow` / `ai-native-hil-approval-ui` |

## R5B — ProposalReview Density list

| 項目 | 値 |
|---|---|
| Density tier | 3 — Operator |
| Wow primary | Density (list + side drawer pattern) |
| Wow secondary | Editorial (drawer detail) |
| 1 秒で分かること | 提案 queue 5 件 + selected の detail drawer |
| Primary CTA | "承認 →" (drawer footer、selected proposal) |
| Scan pattern | Marking (selected row + drawer) |
| 削る要素 (3) | 列ヘッダ tooltip / proposal 補助 caption / 装飾 chip |
| 残す要素 + 理由 | 5 row table (queue scan)、drawer (detail)、status badge、approval action |
| 適用 compounder card | `data-table-premium-tier` / `modal-vs-drawer-vs-fullpage-decision` / `multi-step-approval-and-workflow` |

## R6 — AgentSettings Form

| 項目 | 値 |
|---|---|
| Density tier | 2 — Manager |
| Wow primary | Editorial (Trust Level Progression hero + form sections) |
| Wow secondary | (none) |
| 1 秒で分かること | 現在 Trust Level (Supervised) + 次段階の 4 KPI ゲート + 引き上げ申請可否 |
| Primary CTA | "Request raise" (disabled with reason) |
| Scan pattern | Layer-cake (hero → 5 領域) |
| 削る要素 (3) | KPI gate の長い説明 / 5 領域の各補助 caption / 設定承認 history の詳細 |
| 残す要素 + 理由 | Trust Level Progression hero (Matrix B 視覚化、削れない核)、5 領域 read-only summary、approval history meta |
| 適用 compounder card | `agent-action-confirmation-ui` / `form-design-premium-tier` / `kill-switch-and-emergency-control-ui` (引き上げ申請 wiring) |

## R7 — AuditTrail Density swimlane

| 項目 | 値 |
|---|---|
| Density tier | 4 — Power-user |
| Wow primary | Density (actor-separated swimlane + 5 facet) |
| Wow secondary | Editorial (event count strip + replay control) |
| 1 秒で分かること | actor 別 timeline + critical event の位置 |
| Primary CTA | "Filter critical only" + "Export PDF" (header right) |
| Scan pattern | Marking (critical event highlight) + Layer-cake (時系列) |
| 削る要素 (3) | 各 event の冗長 schema 注 / governance term 説明 / footer caption |
| 残す要素 + 理由 | 5 facet filter、replay control、Agent / Human / System 3-actor swimlane、event count meta、export action |
| 適用 compounder card | `action-history-timeline-audit-trail-ui` / `data-table-premium-tier` / `search-and-filter-premium-tier` |

## R8A — Metrics Editorial IR

| 項目 | 値 |
|---|---|
| Density tier | 2 — Manager |
| Wow primary | Editorial (IR prospectus large display numerals) |
| Wow secondary | Density (sparkline cadence) |
| 1 秒で分かること | 6 metric の現在値と 90 日 trend |
| Primary CTA | "Drill into Knowledge promotion" (linked tile) |
| Scan pattern | Spotted (各 tile 独立 read) |
| 削る要素 (3) | methodology 注 (drawer 移行) / 単位説明文 / 「次の実装段階」 footer |
| 残す要素 + 理由 | 6 metric × value/delta/spark/CI、[仮説 / 要検証] hedge label (governance、削れない)、grade hero |
| 適用 compounder card | `executive-dashboard-layout-pattern` / `financial-chart-and-data-viz-deep` / `editorial-typography-for-premium-web` |

## R8B — Metrics Density Manager

| 項目 | 値 |
|---|---|
| Density tier | 2 — Manager |
| Wow primary | Density (4 KPI gate hero + 9 KRI grid + 業務別 sparkline) |
| Wow secondary | Editorial (KPI display) |
| 1 秒で分かること | 4 KPI multi-criteria gate 進捗 + 9 KRI 健全度 + 業務別 trend |
| Primary CTA | "View 9 KRI detail" |
| Scan pattern | Layer-cake (KPI hero → KRI grid → trend) |
| 削る要素 (3) | KRI 補足説明 / KPI 単位の冗長 caption / framing 注の長文 |
| 残す要素 + 理由 | 4 KPI gate (multi-criteria visualize)、9 KRI grid (state badge + trigger)、業務別 sparkline、仮説 hedge |
| 適用 compounder card | `dashboard-density-tier-bands-ui` (tier 2) / `financial-chart-and-data-viz-deep` / `state-text-density-alignment` |

## R9A — Knowledge Editorial Library

| 項目 | 値 |
|---|---|
| Density tier | 3 — Operator |
| Wow primary | Editorial (大型 article-card + reading rhythm) |
| Wow secondary | Density (sidebar filter) |
| 1 秒で分かること | 今週の compiled approved 上位 3 article |
| Primary CTA | "今週 compiled を読む" |
| Scan pattern | Spotted (各 article card) |
| 削る要素 (3) | enum identifier の長い caption / snippet meta の冗長 / 「次の実装段階」 footer |
| 残す要素 + 理由 | weight badge (high/medium/low)、tier 区別 (compiled/staging)、citation 対象外 label (governance)、業務 filter |
| 適用 compounder card | `account-hierarchy-and-portfolio-ui` (適応) / `citation-and-source-disclosure-ui` / `note-taking-document-editor-ui` |

## R9B — Knowledge Density Bento

| 項目 | 値 |
|---|---|
| Density tier | 3 — Operator |
| Wow primary | Density (Bento heterogeneity: pipeline status + feed + matrix + trend) |
| Wow secondary | Editorial (hero promotion card) |
| 1 秒で分かること | 「今週 promote」「今週 revoked」「期限切れ予定」3 lane + pipeline status |
| Primary CTA | "Open promoted" / "Review staging" (2 lane primary) |
| Scan pattern | Spotted (Bento cell 独立) |
| 削る要素 (3) | 各 lane の補足説明 / staging 注の長文 / 装飾 chip |
| 残す要素 + 理由 | 3 lane (promote/revoked/期限切れ)、pipeline status、weight legend、業務 filter、citation 対象外 banner |
| 適用 compounder card | `bento-grid-and-visual-heterogeneity` / `account-hierarchy-and-portfolio-ui` / `citation-and-source-disclosure-ui` |
