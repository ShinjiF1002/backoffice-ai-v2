# Artifact Audit: Inbox (Copy Review、Step 3 Batch #1)

- Audit Date: 2026-05-25
- Artifact Path: `prototype/src/pages/Inbox.tsx` (349 行) + `components/shared/{StatusBadge, PageFooter, FilterChip, MetaChip, DetailDrawer, DisabledAction, NextActionStrip}` + mock-cases.ts 14 records
- Primary user: 入力者 + 承認者 (skim mode、30-80 件 / 日)
- Persona SSOT: `_persona.md` v0.3

## §1. Scope

PageHeader (Breadcrumb / H1「受信トレイ」 / 件数 chip / 並び順 selector / Filter chip row 4 chip) / NextActionStrip / Queue table (7 column) / Sticky footer (1 - {N} / {total} 件 + status breakdown + bulk action 2 disabled) / DetailDrawer (row preview)

## §2. Verdict Matrix

| Aspect | 層 A | 層 B | 総合 |
| --- | --- | --- | --- |
| Information completeness | NextActionStrip「次に処理すべき案件」+ queue table の 7 column で skim 判断材料揃う、3 秒読み OK | 入力者 skim mode に必要: 案件 ID mono / 業務 / 状態 / 経過 SLA tint / 担当者 / 注意 chip / row click → DetailDrawer preview → 案件レビューを開く CTA、揃う | keep-as-is |
| Information clutter | filter chip 4 個 (業務 active / 状態 / 担当者 / 経過時間 disabled) が PageHeader 下段に並ぶが、disabled 状態 visual で affordance 抑制 | 過剰 metadata なし、AI 管理者向け情報 0 件混入 | keep-as-is |
| Comprehensibility | 「受信トレイ」「業務」「状態」「経過」「注意」「並び順: 受付順」「次に処理すべき案件」 — Tier 1 vocab 3 秒読み OK | 入力者習熟 vocab 整合 | keep-as-is |
| Glossary consistency | `承認待ち` 区別 (`承認者承認待ち` / footer 「確認待ち {readyCount}」差別化) 整合、Tier 3 不在 | enum map 経由徹底 (caseStatusToTone + statusLabel) | keep-as-is |
| Identifier hygiene | case ID mono / status enum raw 露出 0 / SLA tint logic は code-level (UI 表示 0) | machine-parseable 形式 OK | keep-as-is |
| Component name leak | StatusBadge / FilterChip / DetailDrawer 等 code only | 同左 | keep-as-is |
| Tone / Register / AI voice | 敬体 + 操作的、AI 1 人称不使用、actor 明示 | 入力者 register 整合、`aria-label="案件 {id} {workflowName} の概要を開く"` 自然 | keep-as-is |
| Mock content fidelity | mock-cases.ts 14 records: case_id 連番 + 5 status mix + assignee 11 名 + alert count 適切分布 | 入力者 queue として plausible、`_persona.md` §4.3 mock SME pass | keep-as-is |

## §3. Findings

### §3.1 Keep-as-is

- L113-119 Breadcrumb / H1「受信トレイ」 (single segment、top-level)
- L120-122 件数 chip mono `{total} 件`
- L126-129 「並び順: 受付順」 read-only span (Day 12 CR R33 B2 で enabled no-op 解消済)
- L137-162 Filter chip row: workflow active chip + X 解除 icon (`aria-label="filter 解除"`) / 残 3 chip disabled (状態 / 担当者 / 経過時間)、DisabledAction caption footer 集約済
- L168-172 NextActionStrip 「次に処理すべき案件」 + summary `{case_id} (経過 {elapsed})` + actionHref
- L181-187 Table headers: 案件 ID / 業務 / 状態 / 経過 / 担当者 / 注意 / aria-label「開く」
- L205 row `aria-label="案件 {c.id} {c.workflowName} の概要を開く"` — SR + visible context 整合
- L225-227 注意 chip: mono `{count}` + AlertTriangle icon、alertCount > 0 のみ
- L248-252 Footer status summary: `1 - {total} / {total} 件 | AI処理中 {n} / 確認待ち {n} / 承認者承認待ち {n} / 差戻し {n} / 完了 {n}` — Tier 1 vocab 整合
- L260, L268 DisabledAction reason: 「一括承認動作は次の実装段階で対応」「一括差戻し動作は次の実装段階で対応」 — prototype mode caveat
- L282 DetailDrawer title 「{case_id} 概要」 + L288 workflow heading
- L295 「注意 {count}」 drawer 内 chip
- L302 「主要項目 (先頭 3 件)」 / L319 「注意 ({n})」 / L331 「引用根拠」 — drawer section heading 整合
- L332 「{count} 件 (承認済ナレッジ)」 — governance paraphrase 辞書通り
- L340 「案件レビューを開く」 CTA

### §3.2 Directional (P2 polish)

- L128 「並び順: 受付順」 — read-only span、CR R33 で enabled no-op 解消済だが「並び順」right-aligned で affordance あるかの誤読 risk、Day 16+ で「並び順 (現在: 受付順)」等 paraphrase 検討
- L222 担当者 fallback `{c.assignee ?? '—'}` — 仕様上 mock data 全 case に assignee あり、UI 露出 0 だが defensive code (keep)
- L251 footer summary 「AI処理中 / 確認待ち / 承認者承認待ち / 差戻し / 完了」 5 値 inline 表示 — 入力者 skim 視野では「確認待ち」「承認者承認待ち」 vocab 階層 cognitively heavy、Day 16+ で visual 分離検討
- L309 drawer 内 信頼度 display 「信頼度 {value.toFixed(2)}」 — 小数 2 桁 mono、Auditor 観点 OK、入力者 visual focus 視野では minor noise (keep)

### §3.3 Needs-fix (P0 / P1)

- なし (本画面 P1 0 件)

### §3.4 Harmful

- なし

## §4. Knowledge card binding

- `research-compounder/knowledge/ui-design/data-table-premium-tier.md` (queue table 7-column structure)
- `research-compounder/knowledge/ui-design/ai-native-hil-approval-ui.md` (HIL approval queue、入力者 + 承認者の 2-stage)
- `research-compounder/knowledge/ui-design/search-and-filter-premium-tier.md` (filter chip + active state + disabled affordance)
- `research-compounder/knowledge/ui-design/modal-drawer-popover-decision-deep.md` (DetailDrawer non-modal preview pattern)

## §5. Recommendations

- P0: なし
- P1: なし
- P2 directional: L128 並び順 affordance / L251 footer summary visual 分離 — Day 16+ polish
- Cross-screen elevate: なし (本画面は KnowledgeBrowser paradigm を既に充足、weight raw badge 不使用)

## §6. Files Affected

- 修正不要 (本画面単独)
