# Claude Design Prompt Template — Gate 2 (PR 4 前段、F-6 + F-8 + F-9)

claude.ai/design Chat で新規 conversation を開き、以下 prompt を順番に投入。各 finding 別に prompt 投入、`screenshots/wave4-design-exploration/` に export。

## Common preamble (Gate 1 と共通、簡略再掲)

```
backoffice-ai-v2 prototype の Wave 4 implementation 前 visual decision gate。

# Project context
- Banking BO HIL system、JP-only UI、Operational Premium Light design system (装飾抑制方向)
- Day 19 v1.4 で 18 finding applied 済 (5 primitive: HypothesisChip / Disclosure / DetailDrawer / PageHelpDisclosure / NextActionStrip — rewrite 禁止、reuse + extend のみ)

# Hard constraints
1. Operational Premium Light token: slate-50 / white / indigo / emerald / amber / red、radius 8/6/4px、Inter + Noto Sans JP + JetBrains Mono
2. 装飾禁止: gradient / glow / glass / 3D / cream-beige / dark mode 一切なし
3. Chip taxonomy (StatusBadge 4px / FilterChip 6px border / MetaChip 6px no-border) 維持
4. Mock data 規範: active workflow UC-BO-01/02 only、KPI/SLO は `[仮説 / 要検証]` ラベル

# Attached
- 01-design-system-constraints.md
- 02-audit-findings-context.md (F-6 / F-8 / F-9 verbatim)
- 04-cards-claim-verbatim.md (Card 7 / Card 9 verbatim)
- 03-existing-source/: Dashboard / ProposalReview / AgentSettings / shared 2 / data 3
```

## Prompt for F-6 — Dashboard 3-viewport cockpit refactor (2 案生成)

```
F-6 Dashboard 3-viewport cockpit pattern の visual design を 2 案生成してください。

# Context
- Page: Dashboard
- 既存 source: 03-existing-source/pages-Dashboard.tsx + components-shared-NextActionStrip.tsx + components-shared-DetailDrawer.tsx + data-mock-metrics.ts
- Card: 04-cards-claim-verbatim.md Card 7 (3 viewport F-pattern: aggregate KPI / per-workflow grid / drill-down)

# Constraint (重要)
- 現状 Dashboard は NextActionStrip (Day 19 U-13 applied) + alert strip + per-workflow card (2 only) + 業務オペレーション動線 5 button の構成
- F-6 では **既存要素を preserve + wrap** する形で 3-viewport 構造を導入 (Day 19 NextActionStrip + 業務 card は維持)
- per-agent card 5-30 cards は v2 scope 外、**per-workflow card 2 only** に翻案
- kill switch / re-route は v2 scope 外 (実 LLM 接続なし)、drill-down は read-only navigation

# Request
2 案を生成:

案 A — Top aggregate strip + side-by-side workflow grid + right drawer
- Top: aggregate KPI strip (5 指標 horizontal: 案件総数 / 注意 / 承認者承認待ち / SLA 経過 / 反映済) 1 row、PageHeader 直下
- Middle: NextActionStrip + alert strip (Day 19 不変) + per-workflow grid (法人住所変更 / 口座開設書類完備、Day 19 不変)
- Right: DetailDrawer (480px) で per-workflow drill-down (workflow click で展開、in-page、route 遷移廃止)
- 動線 5 button: drawer 内 footer に移動

案 B — Full-width aggregate band + nested workflow card + inline drill expand
- Top: aggregate KPI band (大きな KPI card 5 個、Tier 1 dashboard density)
- Middle: per-workflow card (現状維持) + 各 card 内 expand row で drill detail (inline expand pattern、Disclosure primitive 連携)
- Right side: 動線 5 button 維持
- DetailDrawer は使わない (inline expand で代替、Day 19 Disclosure primitive 再利用)

# Output
- HTML mock for each
- 1-2 sentence design rationale per case
- aggregate KPI 5 指標の mock data shape を React TypeScript で提示 (mock-metrics.ts 拡張参考)
```

## Prompt for F-8 — RACI default surface (2 案生成)

```
F-8 ProposalReview RACI default surface の visual design を 2 案生成してください。

# Context
- Page: ProposalReview
- 既存 source: 03-existing-source/pages-ProposalReview.tsx + components-shared-DetailDrawer.tsx
- Card: 04-cards-claim-verbatim.md Card 9 (RACI-A 5-role disclosure surface 要件)
- 現状: `?demo=1` query で DetailDrawer default open、本来 default visible 必要

# Request
2 案を生成:

案 A — DetailDrawer default open (no query gate)
- ProposalReview を開いた瞬間に DetailDrawer (480px) が default expand
- 5 role visible: 業務責任者 (R) / 管理者 (A) / 入力者 (C) / Audit (I) / AI Agent (E)
- user が close button で hide 可能 (state)
- `?demo=1` query は不要化 (deprecated)

案 B — PageHelpDisclosure pattern (1-click 到達)
- ProposalReview header に PageHelpDisclosure (Day 19 U-5 applied primitive) で「担当役割を見る」button
- click で DetailDrawer expand (Day 19 DetailDrawer primitive 再利用)
- default は collapsed、初回 click で open
- 1-click 到達 (query gate 廃止)

# Output
- HTML mock for each
- 1-2 sentence design rationale per case
- どちらが 1st-time user / 入力者 の disclosure surface 要件をより満たすか分析
```

## Prompt for F-9 — AgentSettings permission scope badge (1 案生成)

```
F-9 AgentSettings Tool list scope badge の visual design を 1 案生成してください。

# Context
- Page: AgentSettings
- 既存 source: 03-existing-source/pages-AgentSettings.tsx + data-mock-agents.ts
- Card: Card 9 RACI + R7 deferred ledger rbac-4 sub-check (Tool scope visible)

# Request
1 案を生成:

案 A — Inline scope badge per tool row
- AgentSettings の Tool list 各 row 末尾に scope badge (MetaChip pattern):
  - `read` (slate-100 bg、`読み取り`) 
  - `write` (amber-50 bg、`書き込み`)
  - `approval-gated` (red-50 bg、`承認必須`)
- tool description 4-line と co-existence (description 上、scope badge 下 inline)
- mock-agents.ts の Tool object に `scope?: 'read' | 'write' | 'approval-gated'` field 追加で対応

# Output
- HTML mock
- 1-2 sentence design rationale
- mock-agents.ts Tool interface 拡張 spec (React TypeScript)
```

## Export instruction (各 generation 後)

1. HTML mock を export し、`screenshots/wave4-design-exploration/F-{X}-{案番号}.html` に保存
2. PNG screenshot も同 folder に `F-{X}-{案番号}.png` として保存 (optional)
3. Decision を `gate2-decision.md` に記録 (各 finding × 採用案 × Safety rail 5 軸 check)
