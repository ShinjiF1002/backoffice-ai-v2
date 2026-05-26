# Artifact Audit: AgentSettings (Copy Review、Step 3 Batch #4)

- Audit Date: 2026-05-25
- Artifact Path: `prototype/src/pages/AgentSettings.tsx` (423 行) + `components/shared/{TrustLevelBadge, DisabledAction, Disclosure, PageFooter, HypothesisChip}` + mock-agents.ts (2 agents) + mock-metrics.ts (mockKpiHypotheses import)
- Primary user: AI 管理者 (週 1-5 件、深読み + 操作 mode)、Secondary 業務責任者 (Type C co-A 時)
- Persona SSOT: `_persona.md` v0.3

## §1. Scope

PageHeader (Breadcrumb 3-level / H1 = agent.name / workflow chip / TrustLevelBadge compact / Agent 版数) / Hero Trust Level Progression (3-stage stepper + Matrix B 主表現 + 4 KPI 進化要件 Disclosure + Type C 引き上げ説明文) / Agent 構成 5 領域 (Model / Prompt / Tool / 権限 / Trust Level、read-only) / 変更 simulation panel (Type A/B/C 3 シナリオ + co-A 要件表示) / 設定承認 history (直近 N 件 type chip + summary + 承認者) / Sticky footer (ダッシュボード戻り + 変更を申請 disabled)

## §2. Verdict Matrix

| Aspect | 層 A | 層 B (AI 管理者) | 総合 |
| --- | --- | --- | --- |
| Information completeness | Slide 7 Matrix B 主表現 (「AIに任せる量は段階的に増やすが、人によるコントロールは渡さない」) を Hero L168-170 で画面表示、3 秒読みで Matrix B narrative 取得可能 | AI 管理者深読み: Trust Level progression + 4 KPI 進化要件 + 5 領域 config + Type A/B/C simulation + 履歴、揃う。業務責任者 (Type C co-A 時): 「Type C 設定承認 (AI 管理者 + 業務責任者 co-A 必須) で判定されます」inline 説明 | keep-as-is |
| Information clutter | Hero L1 visible = heading + Matrix B 主表現 + 3-stage stepper のみ (Day 19 Commit 5 U-17 で trim 済)、4 KPI 進化要件は Disclosure default closed、Tool description は Disclosure default closed — visual hierarchy 明確 | AI 管理者深読み + 業務責任者の dual audience に対し disclosure pattern で適切に segregation | keep-as-is |
| Comprehensibility | Hero copy「AIに任せる量は段階的に増やすが、人によるコントロールは渡さない。」「案件確認は減らす。手順承認 / 設定承認は同強度で残る。」 — Tier 1 主表現を 3 秒読み OK | AI 管理者習熟 vocab: Type A/B/C 区分、co-A 要件、Trust Level 段階、自動化段階 (`_persona.md` G-A5 directional: Trust Level / Supervised / Checkpoint / Autonomous は Tier 2 残存、§3.2 directional) | keep-as-is |
| Glossary consistency | 「手順承認 / 設定承認」用語 cross-screen 整合、Type A/B/C は CLAUDE.md Tier 1 (案件 / 手順 / 設定) と分離した設定 sub-category 専門用語 | enum map 経由 (AI 管理者 simulation Type 判定は scenario.type で表示) | keep-as-is |
| Identifier hygiene | snake_case enum 露出 0、agent ID は code-level | machine-parseable 形式 (`agent-{slug}` ID) | keep-as-is |
| Component name leak | TrustLevelBadge / DisabledAction 等 code only | 同左 | keep-as-is |
| Tone / Register / AI voice | 「変更内容を選ぶと、設定承認 Type 区分と co-A 要件の判定例を確認できます」 — 敬体 + 操作的、AI 1 人称不使用 (Agent description / change history も同) | AI 管理者 deep mode 整合 (「Prompt v0.0 → v0.1: OCR 信頼度閾値 0.80 → 0.85 引き上げ」 mock-agents.ts) | keep-as-is |
| Mock content fidelity | 2 agents (UC-BO-01 + UC-BO-02)、modelLabel「AI ベースモデル A (検証用)」 = 技術 vendor 名抽象化 plausible、changeHistory 3 件 (Type A / A / C) で SoD demo (起票 ≠ 承認、approver 表記「佐藤 隆 (AI 管理者)」「渡辺 真理 (業務責任者) + 佐藤 隆 (AI 管理者)」) 整合 | `_persona.md` §4.3 mock SME pass | keep-as-is |

## §3. Findings

### §3.1 Keep-as-is

- L122-129 Breadcrumb 3-level: `ダッシュボード › Agent 設定 › {agent.name}` — Sidebar entry「Agent 設定」と整合
- L134-138 H1 = agent.name (例: `法人住所変更 Agent`) + workflow_id chip mono + TrustLevelBadge compact
- L141-143 「Agent 版数 {a.version}」 mono right
- **L162-173 Hero copy**: 「Trust Level の進化段階」 + 「AIに任せる量は段階的に増やすが、人によるコントロールは渡さない。案件確認は減らす。手順承認 / 設定承認は同強度で残る。」 — **Slide 7 Matrix B 主表現の画面実装、Tier 1 vocab perfect**
- L177 TrustLevelBadge progression (3-stage stepper)
- L182 「4 KPI 進化要件」 Disclosure title + HypothesisChip「4 KPI 全て [仮説 / 要検証]」
- L186-194 4 KPI 進化要件 dl (KPI name + target via `mockKpiHypotheses` SSOT closure)
- L199-202 「Trust Level 引き上げは Type C 設定承認 (AI 管理者 + 業務責任者 co-A 必須) で判定されます。」
- L213-219 「Agent 構成」 + 「5 領域の現状設定 (閲覧のみ)、編集は次の実装段階で対応」 + 「5 領域」 mono
- L243-264 Tool entries: `Wrench` icon + Disclosure title `{t.name}` (default closed) + description (例: 「PDF → テキスト抽出 (信頼度 0.85 閾値、未達時は 注意 を発する)」)
- L271-273 「権限 / 範囲」 dt (5 領域内唯一 JP label) + dataScope/boundary
- L281 「詳細は上部 Trust Level Progression セクション参照」 — internal navigation hint
- L295-301 「変更影響の事前確認」 + 「変更内容を選ぶと、設定承認 Type 区分と co-A 要件の判定例を確認できます」
- L329 simulation card title + L331 description (Tier 2 残存検証含む)
- L340-348 simulation selected display: 「Type {type} 判定 — 承認者 / co-A 要件」 + approvers + rule (mono)
- L362-364 「設定承認 履歴」 + 「直近 {n} 件の設定変更 (詳細表示は次の実装段階で対応)」 + 件数 mono
- L385-394 history row: type chip (A=slate / B=amber / C=primary) + summary + date + 承認者
- L413 footer DisabledAction reason: 「設定変更を Type A/B/C 区分で申請 (動作は次の実装段階で対応)」

### §3.2 Directional (P2 polish)

- **5 領域 label**: `Model` / `Prompt` / `Tool` / `Trust Level` (英語) vs `権限 / 範囲` (JP) の **inconsistency** — Tier 2 vocab OK だが mix で visual hierarchy が weak、Day 16+ で「モデル / プロンプト / ツール / 権限・範囲 / Trust Level」または「Model / Prompt / Tool / 権限 / Trust Level」(`権限 / 範囲` → `権限`) で統一検討
- mock-agents.ts changeHistory summary 内 `Prompt` 英語残存 (例: 「Prompt v0.0 → v0.1: OCR 信頼度閾値 0.80 → 0.85 引き上げ」) — Tier 2 OK、§3.2 directional
- L138 TrustLevelBadge compact + L177 progression + L279 compact 再露出 — 3 箇所表示で重複 visible だが Hero / config section / summary の異なる context で necessary、keep
- L83 simulation Type C title 「Trust Level Supervised → Checkpoint 引き上げ」 + L84 description 「Automation Maturity 段階変更、案件確認の介在頻度を全件 → 重要分岐のみに縮小、4 KPI 進化要件の達成が前提」 — `Automation Maturity` 英語残存、Tier 2 OK、Day 16+ で「自動化段階」徹底候補

### §3.3 Needs-fix

- なし

### §3.4 Harmful

- なし

### §3.5 Cross-screen elevate

- **5 領域 label inconsistency** (`Model` / `Prompt` / `Tool` / `権限 / 範囲` / `Trust Level`) — 本 page のみの local issue だが Step 3 §99 で「Tier 2 英語 + JP 混在の統一規範」として検討候補

## §4. Knowledge card binding

- `research-compounder/knowledge/ui-design/agent-action-confirmation-ui.md` (Type A/B/C 設定承認 confirmation pattern)
- `research-compounder/knowledge/ai-agents-automation/agent-permission-rbac-pattern.md` (5 領域 read-only viewing state, RBAC paradigm)
- `research-compounder/knowledge/ui-design/diff-and-change-preview-ui.md` (変更内容 simulation panel の preview pattern)
- `research-compounder/knowledge/ux-design/multi-step-approval-and-workflow.md` (Type C co-A 構造 = AI 管理者 + 業務責任者)
- `research-compounder/knowledge/ui-design/confidence-and-uncertainty-visualization-ui.md` (4 KPI 進化要件の hypothesis label)

## §5. Recommendations

- P0 / P1: なし
- P2 directional: 5 領域 label の Tier 2 英語 + JP 統一、`Automation Maturity` → 「自動化段階」 等 — Day 16+
- Cross-screen elevate: なし (本 §3.5 は local polish 候補)

## §6. Files Affected

- 修正不要 (本 page 単独、Day 16+ polish 候補のみ)
