# Artifact Audit: Dashboard (Copy Review、Step 3 Batch #3)

- Audit Date: 2026-05-25
- Artifact Path: `prototype/src/pages/Dashboard.tsx` (435 行) + `components/shared/{Sparkline, PageFooter, HypothesisChip, NextActionStrip}` + mock-cases / mock-metrics
- Primary user: 業務責任者 + AI 管理者 (skim → drill-down)
- Persona SSOT: `_persona.md` v0.3

## §1. Scope

PageHeader (Breadcrumb root / H1「ダッシュボード」 / 件数 + 注意 + 承認者承認待ち 3 chip / HypothesisChip + workflow scope) / NextActionStrip / Attention strip queue-level (conditional) / Workflow card grid 2 並列 (UC-BO-01 + UC-BO-02 each with 状態 chip + 3 column count + 5-row status breakdown + sparkline + CTA) / Workflow lane 5 node link / Footer

## §2. Verdict Matrix

| Aspect | 層 A | 層 B | 総合 |
| --- | --- | --- | --- |
| Information completeness | Demo 起点画面として「業務 2 種 (UC-BO-01/02) + 注意 + 承認者承認待ち + workflow lane」 で全体俯瞰 OK、HypothesisChip で hedge 明示 | 業務責任者 skim: 業務カード 3 column count + state chip / AI 管理者: 全体 KPI snapshot + workflow lane 動線 / どちらも揃う | keep-as-is |
| Information clutter | Card grid 内 5-row status breakdown が AI 管理者向け詳細、業務責任者 skim 視野で全部 visible、L99 alertRatio + sentBack heuristic で state 判定が透明 | 業務責任者 skim 主目的 = card 状態 chip (静穏 / 通常稼働 / 要注意) + 3 column count を 3 秒読み、5-row breakdown は drill-down for AI 管理者 — visual hierarchy で priority 表現済 | keep-as-is |
| Comprehensibility | 「業務別の状況」「業務オペレーション動線」「次に処理すべき案件」 — Tier 1 vocab 3 秒読み OK | 業務責任者 + AI 管理者習熟 vocab 整合、状態 chip JP (静穏 / 通常稼働 / 要注意) | keep-as-is |
| Glossary consistency | 「承認者承認待ち」 cross-screen 整合 (Inbox / mock-cases statusLabel と同じ) | enum map 経由徹底 | keep-as-is |
| Identifier hygiene | UC-BO-01 / UC-BO-02 mono uppercase tracking-wide (Auditor 観点 OK)、workflow ID 露出は intentional metadata、user-facing OK | machine-parseable 形式 | keep-as-is |
| Component name leak | Sparkline / HypothesisChip / NextActionStrip / PageFooter code only | 同左 | keep-as-is |
| Tone / Register / AI voice | 「業務カード・動線・注意行は画面内モック状態からの集計。検証用 KPI 表示の拡張を予定。」 footer caption — モック state caveat 明示 | 業務責任者 + AI 管理者向け analytical register 整合 | keep-as-is |
| Mock content fidelity | mock-cases.ts 14 records から derive、UC-BO-01 alert ratio + sent-back 数で `要注意`「通常稼働」「静穏」分類が deterministic | sparkline alertRatio7Day data UC-BO-01 (0.18→0.20) / UC-BO-02 (0.40→0.46) plausible、業務責任者 trend 視認可 | keep-as-is |

## §3. Findings

### §3.1 Keep-as-is

- L177 Breadcrumb root「ダッシュボード」 single segment
- L183 H1「ダッシュボード」
- L184-186 「案件数 {n}」 chip mono
- L187-197 注意 chip conditional bg color (alert-soft / slate-100) — 値 0 時に visual signal 抑制
- L198-207 承認者承認待ち chip 同 pattern
- L211 HypothesisChip 「推移・SLA 閾値は [仮説 / 要検証]」 (Day 19 Commit 1 で hedge SSOT 1 surface 集約済)
- L212 workflow scope 「UC-BO-01 + UC-BO-02」 mono
- L219-223 NextActionStrip 「次に処理すべき案件」
- L228-254 attention strip 「注意 · {n} 件」 + 「入力者確認待ちで 3 時間以上経過した案件があります ({case_id} · {workflow} · 経過 {elapsed})」 + 「確認」 link — queue-level signal 明示
- L262 「業務別の状況」 / L264 「表示対象: 登録済み 2 業務」
- L280-285 workflow card header: workflow_id mono uppercase + workflow name h3
- L295 state chip 「静穏」「通常稼働」「要注意」 (JP)
- L302-333 3 column count (案件数 / 注意 / 承認者承認待ち) mono tabular
- L338-360 5-row status breakdown (AI 処理中 / 入力者確認待ち / 再処理中 / 承認者承認待ち / 反映済)
- L365 「直近 7 日 注意発生率」 + Sparkline
- L386-391 CTA 「{workflow_name} の案件を開く」 — case-specific deep link
- L403 「業務オペレーション動線」 + 5 node lane (受信トレイ / 案件レビュー / コメント付き差戻し / AI 提案レビュー / メトリクス確認)
- L431 footer caption: 「業務カード・動線・注意行は画面内モック状態からの集計。検証用 KPI 表示の拡張を予定。」 — mock caveat + 次段階明示

### §3.2 Directional (P2 polish)

- L161 「コメント付き差戻し」 workflow lane label — Sidebar entries (受信トレイ / 案件処理 / AI 提案レビュー / Agent 設定 / 監査証跡 / メトリクス / ナレッジ) と命名 register 揺れ (Sidebar = top nav vs Dashboard lane = workflow specific)、Day 16+ で 「差戻しコメント記述」等 paraphrase 検討 / 統一検討
- L130 attention message「入力者確認待ちで 3 時間以上経過した案件があります ({case_id} · {workflow} · 経過 {elapsed})」 — meta dot-separator 3 fields、業務責任者 skim 視野で `·` parse cost あり、Day 16+ で visual separator 改善検討
- L266 「表示対象: 登録済み 2 業務」 — secondary informational、business owner には 軽い metadata 過剰、directional

### §3.3 Needs-fix

- なし

### §3.4 Harmful

- なし

## §4. Knowledge card binding

- `research-compounder/knowledge/ui-design/executive-dashboard-layout-pattern.md` (workflow card grid + state chip)
- `research-compounder/knowledge/ui-design/operator-cockpit-multi-agent-oversight-ui.md` (業務責任者 + AI 管理者 dual primary)
- `research-compounder/knowledge/ui-design/dashboard-density-tier-bands-ui.md` (3 column count + 5-row breakdown の density hierarchy)
- `research-compounder/knowledge/ui-design/financial-chart-and-data-viz-deep.md` (Sparkline trend visualization)

## §5. Recommendations

- P0 / P1: なし
- P2 directional: L161 lane labeling consistency、L130 meta separator、L266 metadata polish — Day 16+
- Cross-screen elevate: なし

## §6. Files Affected

- 修正不要
