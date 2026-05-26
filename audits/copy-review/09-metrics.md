# Artifact Audit: Metrics (Copy Review、Step 3 Batch #6)

- Audit Date: 2026-05-25
- Artifact Path: `prototype/src/pages/Metrics.tsx` (498 行) + `components/shared/{Sparkline, PageFooter, FilterChip, HypothesisChip, PageHelpDisclosure}` + mock-metrics.ts (4 KPI + 3 補助 KPI + 9 KRI + 2 workflow trend)
- Primary user: AI 管理者 (月次 KPI 確認) + Auditor (追跡)
- Persona SSOT: `_persona.md` v0.3

## §1. Scope

PageHeader (Breadcrumb / H1「メトリクス」 / 期間 chip / meta description) / PageHelpDisclosure (mandatory hedge framing) / Hero 4 KPI 進化判断 目安 (multi-criteria gate visualization + 4 KPI gate cards + Sparkline + 仮判定 N/4 chip + HypothesisChip) / 補助 KPI 一覧 (K5-K7 table) / 9 KRI 監視 (grid 3 column + state badge + trigger + 対応) / 業務別 推移 (UC-BO-01 + UC-BO-02 sparkline、案件数 + Alert 発生率) / Sticky footer

## §2. Verdict Matrix

| Aspect | 層 A | 層 B (AI 管理者 + Auditor) | 総合 |
| --- | --- | --- | --- |
| Information completeness | Slide 8 Metrics narrative「4 KPI multi-criteria 仮説 gate + 9 KRI」を画面実装、`[仮説 / 要検証]` hedge 多層、本番 gate ではないこと明示 | AI 管理者月次 KPI 確認: 4 KPI 進化判断 + 補助 K5-K7 + 9 KRI 監視 + 業務別 7 日推移、揃う。Auditor 追跡: KPI / KRI 名 + trigger + 対応 + state | keep-as-is |
| Information clutter | 5 section linear (PageHelp / Hero / 補助 KPI / KRI / trend)、視覚 hierarchy 明確、HypothesisChip 集約で per-row hedge 削除済 (Day 19 Commit 1 U-1) | AI 管理者 + Auditor の dual primary に対し table + grid 形式の dense data 表示 | keep-as-is |
| Comprehensibility | 「メトリクス」「4 KPI 進化判断 目安」「9 KRI 監視」「業務別 推移」 — Tier 1 vocab 3 秒読み OK | AI 管理者 + Auditor 習熟 vocab (`AI 入力承認率` / `人手上書き率` / `Alert 発生率` / `承認者差戻し率` / `案件平均処理時間` / `手順承認 昇格成功率` / `未承認ナレッジ整理時間` 等の KPI 名は業務側 vocabulary) | keep-as-is |
| Glossary consistency | 「未承認ナレッジ整理時間」「手順管理者」「自動化段階」 governance paraphrase 辞書通り | 4 KPI / 7 KPI / 9 KRI cross-screen 整合 (`mockKpiHypotheses` import で AgentSettings と SSOT 共有、CR R40 M5 closure) | keep-as-is |
| Identifier hygiene | KPI ID `K1-K4`, `K5-K7`, `R1-R9` mono uppercase tabular、Auditor grep 親和性 | machine-parseable identifier (KPI ID + KRI ID) | keep-as-is |
| Component name leak | Sparkline / HypothesisChip / PageHelpDisclosure 等 code only | 同左 | keep-as-is |
| Tone / Register / AI voice | hedge ラベル徹底 (PageHelpDisclosure expand「本画面の閾値・現在値・推移はすべて [仮説 / 要検証] です」「本番導入可否を判定する基準ではなく、Phase 1 で測定・再設定する検証仮説。本画面に表示される数値は目標仮説値であり、実績値ではありません。」)、AI 1 人称不使用 | AI 管理者 + Auditor analytical register 整合、`仮判定 達成 / 未達` paraphrase (Day 19 Commit 4 で met/miss → 達成/未達) | keep-as-is |
| Mock content fidelity | 4 KPI (K1-K4) + 7 KPI 補助 (K5-K7) + 9 KRI (R1-R9) + workflow trend 7-day data — `_persona.md` §4.3 mock SME pass (KPI 名 + target + 現在値の整合、K3 Alert 発生率 4.7% < 5% target で `meets` deterministic) | KRI 9 件すべて `[仮説 / 要検証]` ラベル + state (R3 caution、他 normal) で異常検知 narrative 整合 | keep-as-is |

## §3. Findings

### §3.1 Keep-as-is

- L117-123 Breadcrumb / H1 「メトリクス」 (top-level)
- L127-129 期間 chip「直近 7 日 (検証用)」
- L131 meta「4 KPI 進化判断 目安 + 補助 3 KPI + 9 KRI」
- **L141-148 PageHelpDisclosure body**: 「注: 本画面の閾値・現在値・推移はすべて [仮説 / 要検証] です」 + 「本番導入可否を判定する基準ではなく、Phase 1 で測定・再設定する検証仮説。本画面に表示される数値は目標仮説値であり、実績値ではありません。」 — **Slide 8 「本番導入可否を判定する gate ではない」注の完全実装、tone 敬体 + 操作的、Phase 1 hedge perfect**
- L162-179 Hero heading + intro: 「4 KPI 進化判断 目安」 + 「全 4 KPI が目標仮説値を満たすと **自動化段階 進化検討対象**。Supervised → Checkpoint で 3 ヶ月以上連続達成 [仮説 / 要検証]」 + state legend「仮判定 達成 / 未達」 + per-state dot
- L194 「仮判定 {met} / 4」 chip + HypothesisChip「4 KPI 全て [仮説 / 要検証]」
- L217-227 KPI card: ID mono + 名 + 現在値 large mono + `/ {target}` + Sparkline
- L256-258 「補助 KPI 一覧」 + 「進化判断には直接使わない 推移 観測対象 (K5-K7)」
- L266 HypothesisChip「補助 KPI {n} 件 [仮説 / 要検証]」
- L277-286 KPI table header (# / KPI 名 / 内容 / 目標仮説 / 現在値)
- L300-303 補助 KPI row: K5-K7 名 + description + target + current
- L330-332 「9 KRI 監視」 + 「異常検知の検知条件、閾値超過時は手順管理者 / AI 管理者に通知」
- L341-349 state summary: 正常 {n} / 注意 {n} / 警告 {n} per-state dot
- L352 HypothesisChip「9 KRI 全て [仮説 / 要検証]」
- L367 KRI ID mono + 名 truncate
- L383 state badge: 「正常」「注意」「警告」 (JP)
- L388 triggerCondition (例: 「週次平均が 目標仮説 (≥ 99%) を 2 週連続 下回り」)
- L390 「対応: {responseAction}」 mono
- L408-417 「業務別 推移 (直近 7 日)」 + conditional sub「件数推移 + Alert 発生率、{全業務 を並べて表示 / {workflow_label} のみ表示}」
- L446-451 trend card: workflow_id mono + workflow_name h3
- L456 「案件数 (推移)」 / L467 「Alert 発生率 (推移)」 + Sparkline

### §3.2 Directional (P2 polish)

- L169-170 Hero intro 「Supervised → Checkpoint で 3 ヶ月以上連続達成 [仮説 / 要検証]」 — `Supervised → Checkpoint` Tier 2 英語残存、CLAUDE.md OK だが AI 管理者深読み視点で「監視段階 → 重点点監視段階」等 paraphrase 候補、Day 16+
- L131 meta「4 KPI 進化判断 目安 + 補助 3 KPI + 9 KRI」 — 「進化判断 目安」がやや mono、初見 audience 視野では「進化判断 + 補助 + 監視」等 simplify 候補、directional
- mock-metrics.ts K3「Alert 発生率」 + R3「Alert 誤検知 急増」 + R6「承認済 / 未承認 ナレッジの 矛盾」 — `Alert` 英語残存 (Tier 2)、Day 16+ で「注意発生率」「注意誤検知 急増」等 paraphrase 検討候補
- mock-metrics.ts R5「UI 変更 検知」 + R8「Agent 版数 旧版発生」 — Tier 2 英語残存、`UI` / `Agent` は技術 vocabulary、ただし `_persona.md` §2.2 P1-5 operator UI 言い換え方針では `Agent` は許可リスト外、Day 16+ で「業務 Agent 版数 旧版」等 paraphrase 検討
- L131「メトリクス」H1 自身 — Tier 2、CLAUDE.md OK、Sidebar entry「メトリクス」と整合、ただし「指標」JP paraphrase 候補 — directional (Sidebar / Dashboard / Breadcrumb 4 箇所統合変更要、global scope のため Day 16+ で慎重判定)

### §3.3 Needs-fix

- なし

### §3.4 Harmful

- なし

### §3.5 Cross-screen observation

- **HypothesisChip section-level 集約 paradigm** (per-row hedge × 4 / × 9 削除 + 1 surface に集約、Day 19 Commit 1 U-1) — `_persona.md` §3.4 G-B4 (AI voice 1 surface 集約) と整合、Step 4 SUMMARY §6 MEMORY 昇格候補
- mockKpiHypotheses import 共有 (AgentSettings の `KPI_PROGRESSION` 経由再利用、CR R40 M5 closure) — KPI 名 / target drift 防止の正解 paradigm、Step 4 §6 MEMORY 昇格候補

## §4. Knowledge card binding

- `research-compounder/knowledge/ui-design/executive-dashboard-layout-pattern.md` (KPI grid + KRI grid + sparkline)
- `research-compounder/knowledge/ui-design/financial-chart-and-data-viz-deep.md` (Sparkline + state-conditional color)
- `research-compounder/knowledge/ai-agents-automation/eval-framework-design.md` (4 KPI multi-criteria gate + 9 KRI catalogue 設計)
- `research-compounder/knowledge/ui-design/confidence-and-uncertainty-visualization-ui.md` (`[仮説 / 要検証]` hedge ラベル paradigm)

## §5. Recommendations

- P0 / P1: なし
- P2 directional: `Supervised → Checkpoint` / `Alert` / `Agent` paraphrase / 「メトリクス」 → 「指標」 (global rename) — Day 16+
- Cross-screen elevate: HypothesisChip 集約 paradigm + mockKpiHypotheses SSOT 共有 paradigm を MEMORY 昇格候補に記録 (Step 4 §6)

## §6. Files Affected

- 修正不要
