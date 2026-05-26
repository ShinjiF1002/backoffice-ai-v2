# Claude Design Prompt Template — Gate 1 (PR 2 前段、F-2 + F-5 + F-7)

claude.ai/design Chat で新規 conversation を開き、以下 prompt を順番に投入。各 finding 別に prompt 投入、`screenshots/wave2-design-exploration/` に export。

## Common preamble (各 finding prompt の前に paste、または 1 度だけ最初に paste)

```
backoffice-ai-v2 prototype の Wave 2 implementation 前 visual decision gate。

# Project context
- Banking BO (back-office) HIL (Human-in-the-Loop) system
- JP-only UI (日本語のみ、技術固有名詞のみ英語可: React / Vite / Tailwind / AI / PDF / OCR / API / SLO / KPI)
- Operational Premium Light design system (装飾抑制方向、SaaS marketing aesthetic ではない)
- 既に Day 19 v1.4 で 18 finding が applied 済み (HypothesisChip / Disclosure / DetailDrawer / PageHelpDisclosure / NextActionStrip の 5 primitive 実装済、これらは rewrite 禁止)

# Hard constraints (絶対遵守)
1. Operational Premium Light token: slate-50 / white / indigo (#635BFF) / emerald / amber / red / radius 8/6/4px / Inter + Noto Sans JP + JetBrains Mono — 他 token 提案禁止
2. 装飾禁止: gradient / glow / glassmorphism / 3D / large rounded (>8px) / cream-beige / dark mode を一切使わない
3. Chip taxonomy 3 系統 (StatusBadge 4px no-border / FilterChip 6px border / MetaChip 6px no-border) を維持
4. CaseReview 5-step Lifecycle (受付 → AI 処理 → 入力者確認 → 承認者承認 → 反映) を変更しない、`手順承認` は含めない (別 flywheel)
5. Citation governance 4 rule (引用根拠 emerald compiled only / 未承認ヒント slate-50 inset + `citation 対象外` label / 関連手順アラート amber banner 独立 / data_error は staging 除外)
6. Mock data 規範 (active workflow UC-BO-01/02 only、国際送金 UI 化なし、具体閾値数値出さない、Tier 3 規制語 exact 禁止、KPI/SLO は `[仮説 / 要検証]` ラベル必須)

# Attached
- 01-design-system-constraints.md: SSOT 詳細
- 02-audit-findings-context.md: F-2 / F-5 / F-7 verbatim
- 04-cards-claim-verbatim.md: Card 1 / 2 / 8 verbatim
- 03-existing-source/: 既存 React + Tailwind code (CaseReview / ProposalReview / Inbox / Dashboard / AuditTrail / 5 shared primitives / types / mock subsets)

# Generation request
本 conversation で 3 finding (F-2 / F-5 / F-7) について、それぞれ複数案の visual design を HTML mock として生成。各案 1-2 sentence の design rationale 付き。
```

## Prompt for F-2 — Diff Preview 3-view + Metadata Strip (3 案生成)

```
F-2 DiffPreviewBlock + MetadataStrip primitives の visual design を 3 案生成してください。

# Context
- Page: CaseReview (5 field AI 入力結果) + ProposalReview (proposedDiff section)
- 既存 source: 03-existing-source/pages-CaseReview.tsx + pages-ProposalReview.tsx + components-case-AddressDiffBlock.tsx (char-level inline diff、新住所 field のみ)
- Mock data: 03-existing-source/data-mock-cases-subset.ts (CASE-2026-0142, 5 field with optional changeAuthor/changeReason/affectedScope/reversibility)、data-mock-proposals-subset.ts (PROP-2026-031, proposedDiff with 2 section)
- Card: 04-cards-claim-verbatim.md Card 2 ★

# Request
3 案を生成、各案で以下要件を満たすこと:

案 A — Inline default + Field table toggle (CaseReview optimized)
- 既存 AddressDiffBlock の inline diff を default view として retain
- 新規 toggle で Field table view (5 field × before/after column) に切替可能
- Metadata Strip footer 上 (差戻し / 承認 button の前) に 5 element horizontal: Change author (AI 抽出 v2.3) / Change reason (OCR 信頼度未達) / Confidence (0.84) / Affected scope (1 customer) / Reversibility (Revertible)
- 承認 button: 初期 aria-disabled、Metadata Strip scroll-into-view または click で active 化

案 B — Side-by-side + Inline toggle (ProposalReview optimized)
- 既存 proposedDiff の文中 before/after 記述を Side-by-side view (左=before / 右=after column) に refactor
- Toggle で Inline diff に切替可能
- Metadata Strip header 下 (PageHeader 直下) に 5 element: Change author (AI 日次分析) / Reason (OCR 信頼度 0.85-0.88 帯人手上書き率 75%) / Confidence (0.81) / Affected scope (12 cases) / Reversibility (Revertible)
- 承認 button: 同様 metadata gate

案 C — Field table default + 3-view toggle (両 page 統一)
- Field table view を default、Inline / Side-by-side / Field table の 3-view toggle (chip group or tab)
- Metadata Strip は collapsible PageHelpDisclosure 連携で details on demand
- 承認 button gate は scroll-into-view trigger

# Output
- HTML mock for each (3 case)
- 1-2 sentence design rationale per case
- 各案で MetadataStrip と DiffPreviewBlock primitive の Props shape を React TypeScript で示す (Claude Code 実装時の reference)
```

## Prompt for F-5 — ActorBand primitive (2 案生成)

```
F-5 ActorBand primitive (HIL actor band + icon prefix) の visual design を 2 案生成してください。

# Context
- Pages: Inbox 担当者 column + Dashboard 業務 card breakdown + AuditTrail row
- 既存 source: 03-existing-source/pages-Inbox.tsx + pages-Dashboard.tsx + pages-AuditTrail.tsx
- Card: 04-cards-claim-verbatim.md Card 1 (icon prefix + color band で agent/human 区別、scrolling 中 actor 判定速度向上)

# Request
2 案を生成:

案 A — 4px 左 color band + lucide-react icon prefix
- 4px width 左 vertical color band: agent=indigo / human=slate / system=neutral
- Icon prefix (lucide-react): agent=Bot / human=User / system=Cog
- size variant: sm (h-5) / md (h-7)
- Inbox 担当者 column 内 inline、Dashboard 業務 card breakdown row inline、AuditTrail row 左端

案 B — Circle avatar + tone-tinted halo (text fallback)
- Circle 24px: agent=indigo bg + Bot icon white / human=slate bg + initial chars (e.g. 田中) / system=slate-100 bg + Cog icon
- Tone-tinted background halo for scroll visibility
- Inbox / Dashboard / AuditTrail で同 component reuse

# Output
- HTML mock for each
- 1-2 sentence design rationale per case
- ActorBand Props shape: `{ actor: 'agent' | 'human' | 'system', size?: 'sm' | 'md', label?: string, className?: string }` confirmed?
```

## Prompt for F-7 — SLA per step + Delegate visibility (2 案生成)

```
F-7 LifecycleStepper SLA per step + Inbox Delegate flag の visual design を 2 案生成してください。

# Context
- Pages: CaseReview LifecycleStepper (5 step) + Inbox 担当者 column
- 既存 source: 03-existing-source/components-case-LifecycleStepper.tsx + pages-Inbox.tsx
- Card: 04-cards-claim-verbatim.md Card 8 (SLA per step + delegate model + all approvers visible)

# Request
2 案を生成:

案 A — Per-step SLA badge (inline) + Delegate icon
- LifecycleStepper の各 step 下に SLA badge: target (slate chip "4h" 等) / elapsed (amber chip if 50%+ / red if 100%+ over)
- step hover で approver name (e.g. "田中 美咲") visible (tooltip pattern)
- Inbox 担当者 column: 通常 name + Delegate flag (small icon e.g. lucide UserSwitch + tooltip "代理")

案 B — Compact SLA progress bar + Delegate badge
- LifecycleStepper の各 step に progress bar (slate base + amber/red fill if over target)
- step click で expand 詳細 SLA + approver name
- Inbox 担当者 column: name + small MetaChip "代理中 (田中 → 鈴木)" if delegated

# Output
- HTML mock for each
- 1-2 sentence design rationale per case
- LifecycleStepper Props 拡張 shape (SLA per step element 追加)
```

## Export instruction (各 generation 後)

1. HTML mock を export し、`screenshots/wave2-design-exploration/F-{X}-{案番号}.html` に保存
2. PNG screenshot も同 folder に `F-{X}-{案番号}.png` として保存 (optional、HTML render は user 側で確認可なら省略可)
3. Decision を `gate1-decision.md` に記録 (各 finding × 採用案 × Safety rail 5 軸 check)
