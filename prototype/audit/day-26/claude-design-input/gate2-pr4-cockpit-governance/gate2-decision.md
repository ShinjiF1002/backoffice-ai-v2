| 項目 | 値 |
| --- | --- |
| 文書 ID | DOC-AUDIT-D26-GATE2-DECISION |
| 文書名 | Gate 2 (PR 4 Cockpit + governance) — Design Decision Record |
| 版数 | v1.0 (approved 2026-05-26) |
| ステータス | Approved (Claude Design 5 mock 生成、user 採用判定済、PR 4 commit に含める) |
| オーナー | backoffice-ai-v2 maintainer (user 自身) |
| 承認者 | user (approved 2026-05-26) |
| Evidence Status | empirical (Claude Design mock 5 file in `screenshots/wave4-design-exploration/` + design-canvas.jsx wrapper + index.html navigation hub) |

---

# Gate 2 Decision Record

Claude Design Chat session で 5 mock を生成、PR 4 Commit 9-10 の design spec source として user 採用判定済。

## Design Decision Table

| Finding | Generated案 | 採用案 | Rationale | Export path | Safety rail |
|---|---|---|---|---|---|
| F-6 Dashboard 3-viewport cockpit | 2 (A: top KPI strip + grid + right drawer / B: full-width KPI band + inline expand) | **★ 案 A** | Plan v3.0 §Commit 9 spec と一致、Day 19 DetailDrawer primitive 再利用、F-pattern (top → middle → right) で operator scan path 最適化 | `F-6-A.html` (採用) + `F-6-B.html` (不採用) | S1-S5 pass |
| F-8 ProposalReview RACI surface | 2 (A: DetailDrawer default open / B: PageHelpDisclosure 1-click) | **★ 案 A** | `?demo=1` query gate 廃止、ProposalReview を開いた瞬間 5 role visible、disclosure surface 要件 (Card 9 RACI-A) を full satisfy | `F-8-A.html` (採用) + `F-8-B.html` (不採用) | S1-S5 pass |
| F-9 AgentSettings tool scope badge | 1 (A: inline scope badge) | **★ 案 A (with polish)** | Plan v3.0 spec と一致、Tool list 各 row に scope badge inline。Polish: approval-gated を red-50 ではなく **amber-50** で visual de-escalate (AI scope ban 内 element と visual 衡平、Operational Premium Light restraint pattern 強化) | `F-9-A.html` (採用、polish 適用) | S1-S5 pass |

## Safety Rail Detail (採用案 verify 後 record)

### F-6 (案 A)
- ✅ S1 Token SSOT: slate-50 / white / indigo / emerald / amber / red のみ、新 token 0
- ✅ S2 Chip taxonomy: StatusBadge 4px / FilterChip 6px border / MetaChip 6px no-border 不変
- ✅ S3 Lifecycle 不変: Dashboard は Lifecycle 非対象、業務 card 内 5 breakdown も不変
- ✅ S4 Citation governance: Dashboard には citation surface 不在、影響なし
- ✅ S5 Mock data: UC-BO-01/02 only + 既存 mock-metrics + KPI に `[仮説 / 要検証]` HypothesisChip 維持

### F-8 (案 A)
- ✅ S1 Token SSOT
- ✅ S2 Chip taxonomy
- ✅ S3 Lifecycle 不変 (ProposalReview は ProposalLifecycleStepper、Day 19 別 flywheel 維持)
- ✅ S4 Citation governance
- ✅ S5 Mock data + Day 19 U-6 DetailDrawer primitive 再利用、`?demo=1` query 廃止 (`adjacent-to-Day19` tag)

### F-9 (案 A + polish)
- ✅ S1 Token SSOT (polish 後: amber-50 = 既存 token 利用)
- ✅ S2 Chip taxonomy (MetaChip 6px no-border pattern)
- ✅ S3 Lifecycle 不変
- ✅ S4 Citation governance
- ✅ S5 Mock data: mock-agents.ts に scope field 拡張 (`read` / `write` / `approval-gated`)、tool description preserve

## Implementation Spec for Claude Code (PR 4 Commit 9-10)

### Dashboard 3-viewport refactor (Commit 9、F-6 案 A)

```tsx
// pages/Dashboard.tsx 拡張:
// - PageHeader 直下 Viewport 1: <AggregateKpiStrip /> (5 指標、horizontal、mock-metrics.ts から source)
// - 既存 NextActionStrip + Alert strip + 業務 card 2 を Viewport 2 として preserve (Day 19 不変)
// - 動線 5 button: 既存維持 (DetailDrawer 内に移動はせず、page footer 化も不要、F-6-A mock そのまま)
// - Viewport 3 = DetailDrawer (Day 19 primitive reuse、業務 card click で workflow drill-down expand、route /inbox?workflow=XX 廃止せず併存)
//
// 採用 mock の構成 (F-6-A.html):
// - Aggregate KPI 5 指標: 案件総数 / 注意 / 承認者承認待ち / SLA 経過 / 反映済
// - Drill-down: 状態分布 (17 件) + 注意のある案件 list (in-drawer)
```

### ProposalReview RACI default open (Commit 10、F-8 案 A)

```tsx
// pages/ProposalReview.tsx 修正:
// - 既存 `const isDemo = searchParams.get('demo') === '1'` + `const [drawerOpen, setDrawerOpen] = useState<boolean>(isDemo)` を:
// - `const [drawerOpen, setDrawerOpen] = useState<boolean>(true)` に変更 (default true、query gate 廃止)
// - `?demo=1` query は backward compat で残置 (NextActionStrip ?demo=1 branching と別軸)
// - 5 role visible (業務責任者 R / 管理者 A / 入力者 C / Audit I / AI Agent E) 既存維持
```

### AgentSettings tool scope badge (Commit 10、F-9 案 A + polish)

```tsx
// data/mock-agents.ts Tool object に scope field 追加:
// type ToolScope = 'read' | 'write' | 'approval-gated'
// interface AgentTool {
//   ...existing
//   scope?: ToolScope
// }
//
// mock-agents.ts agent-corporate-address-change tools:
// - tool-ocr: scope: 'read'
// - tool-master-lookup: scope: 'read'
// - tool-staging-knowledge: scope: 'read'
// (UC-BO-01 は現在 read-only tools のみ、Phase 1 で write/approval-gated tool 追加想定)
//
// pages/AgentSettings.tsx:
// - Tool list 各 row 末尾に MetaChip scope badge:
//   - read: slate-100 / slate-700 「読み取り」
//   - write: amber-50 / [var(--color-alert-soft-fg)] 「書き込み」
//   - approval-gated: amber-50 / [var(--color-alert-soft-fg)] 「承認必須」(★ Polish: 当初 red-50 提案を amber-50 に de-escalate、AI scope ban 内 element と visual 衡平)
```

## Total Quota Consumption

- Gate 2 想定: ~5 prompt
- 実消費: 5 prompt (F-6 × 2 + F-8 × 2 + F-9 × 1)
- Pro/Max weekly limit 残: TBD (user 側で確認)

## Reject 案 / Discarded artifacts

- **F-6-B (不採用)**: full-width KPI band + inline expand、DetailDrawer 廃止案。Inline expand は density 上は妥当だが、F-6-A の F-pattern が plan v3.0 spec と一致するため reject。F-6-B.html は commit に含む (Reference 用、`screenshots/wave4-design-exploration/`)。
- **F-8-B (不採用)**: PageHelpDisclosure 1-click pattern。default closed で initial 誤クリック防止になるが、Card 9 disclosure surface 要件 (UI 上で 5 role visible が要件) は default open がより満たすため reject。

## Output Path (commit 対象)

- `prototype/audit/day-26/screenshots/wave4-design-exploration/F-6-A.html` ★ 採用
- `prototype/audit/day-26/screenshots/wave4-design-exploration/F-6-B.html` (Reference)
- `prototype/audit/day-26/screenshots/wave4-design-exploration/F-8-A.html` ★ 採用
- `prototype/audit/day-26/screenshots/wave4-design-exploration/F-8-B.html` (Reference)
- `prototype/audit/day-26/screenshots/wave4-design-exploration/F-9-A.html` ★ 採用 (polish 適用)
- `prototype/audit/day-26/screenshots/wave4-design-exploration/icons.html` (lucide icon palette、Reference)
- `prototype/audit/day-26/screenshots/wave4-design-exploration/tokens.css` (Operational Premium Light token snapshot)
- `prototype/audit/day-26/screenshots/wave4-design-exploration/design-canvas.jsx` (Figma-ish wrapper、Reference)
- `prototype/audit/day-26/screenshots/wave4-design-exploration/index.html` (5 mock navigation hub)

## Next action

Gate 2 完了。PR 4 Commit 9-10 を Claude Code で実装、本 decision record を design spec source として参照:
1. Commit 9 (F-6): Dashboard 3-viewport refactor
2. Commit 10 (F-8 + F-9): ProposalReview RACI default open + AgentSettings tool scope badge
3. a11y manual smoke gate (keyboard + focus + aria) on 4 critical page
4. closure-table.md v1.0 lock (F-1〜F-10 全 row 確定)
5. gh pr create

---

**Decision date**: 2026-05-26
**Approver**: user (approved 2026-05-26、Gate 2 5 mock 確認 + Open Q 0 件 + Polish 1 件 (F-9 amber-50 de-escalate) 反映)
