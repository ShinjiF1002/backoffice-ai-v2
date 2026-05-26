# 13 — Showcase Narrative (Paper-First Design)

> **Scope**: `showcase/` 独立 sub-app の paper SSOT。Cycle 0-1 で scaffold 済、Cycle 2-4 で実装、Cycle 5-6 で Figma roundtrip + back-port。
>
> **Position**: `prototype/` Day 13 sign-off baseline と完全分離。Pattern catalog (component library) として並列稼働。
>
> **Source**: research-compounder R7 recipe + ui-patterns / ux-design knowledge cards + Figma MCP implementation playbook。

## 1. Persona + Job-to-be-Done

**Persona**: Backoffice operator (中堅 SMBC 系 BO 担当、AI agent と同じ queue を扱う、JP-first speaker、a11y baseline 必要)。

**Job-to-be-done**: 「AI agent が draft を作った proposal を、5 秒以内に context 把握し、approve / sendback / escalate のどれかを誤りなく決める」。

**Anti-persona** (今 scope 外):
- Business approver (経営側、Type B 設定承認)
- External demo audience (Session 4 観衆)
- Customer-facing user

## 2. 1-Sentence Thesis

> **AI agent と human operator が同じ queue を扱う backoffice 業務で、operator が「秒で判断できる」UI を、研究蓄積パターンから組む。**

## 3. Catalog IA

| Layer | 役割 | 実装 |
|---|---|---|
| Landing (`/`) | Hero + 6 pattern grid + methodology の 3 section | `src/pages/Landing.tsx` ✅ |
| Pattern detail (`/p/:id`) | per-pattern: header + live demo + research binding + primitives + ship gate | `src/pages/PatternDetail.tsx` ⚠️ Cycle 3-4 で demo slot 拡張 |

## 4. 6 Pattern 一覧 (live / preview)

| # | ID | Title | Category | Status | Knowledge card | Sample |
|---|---|---|---|---|---|---|
| 1 | hil-approval | HIL Approval | governance | live | ai-native-hil-approval-ui | hil-approval-table-and-detail |
| 2 | operator-cockpit | Operator Cockpit | overview | live | operator-cockpit-multi-agent-oversight-ui | operator-cockpit-3-viewport-layout |
| 3 | diff-preview | Diff & Change Preview | review | live | diff-and-change-preview-ui | — |
| 4 | citation-disclosure | Citation & Source Disclosure | evidence | live | citation-and-source-disclosure-ui | — |
| 5 | action-confirmation | Agent Action Confirmation | control | live | agent-action-confirmation-ui | — |
| 6 | audit-trail | Action History / Audit Trail | evidence | preview | action-history-timeline-audit-trail-ui | — |

## 5. 各 Pattern の Data Shape + Primitive Coverage

Per `feedback_reference_first_plan` (Reference-first plan) + `feedback_primitive_coverage_audit` (採用/defer/未検討 3 分類)。

### 5.1 hil-approval

**Demo data shape**:
```ts
type Case = {
  id: string          // "CASE-2026-0142"
  type: 'address-change' | 'kyc-review' | 'aml-alert' | 'loan-exception'
  actor: 'agent' | 'human' | 'system'
  state: 'pending' | 'approved' | 'rejected' | 'failed' | 'escalated'
  slaRemainingPct: number  // 0-100
  lastActionBy: string
  lastActionAt: string   // ISO
  proposal: { before: Record<string, unknown>, after: Record<string, unknown> }
}
```

**Primitives (採用)**: `Table`, `Drawer`, `TimelineDots`, `StateBadge`, `ActorBand`, `SLAChip`, `ActionBar`
**Primitives (defer)**: `BulkAction`, `FilterPopover` (catalog scope では非必須)
**Primitives (未検討)**: `KeyboardShortcutTooltip` (banking compliance では shortcut 非推奨)

### 5.2 operator-cockpit

**Demo data shape**:
```ts
type AgentRow = {
  agentId: string
  status: 'running' | 'paused' | 'failed' | 'awaiting-approval'
  queueDepth: number
  errorRate24h: number
  lastInterventionAt: string | null
}
type FleetKpi = { running: number; failed: number; queueDepth: number; sloHit: number }
```

**Primitives (採用)**: `KpiCard`, `AgentCard`, `StatusDot`, `TimelineRow`, `InterventionButton`
**Primitives (defer)**: `MobileCockpit` (本 catalog は desktop 1280+ only)

### 5.3 diff-preview

**Demo data shape**:
```ts
type DiffField = { key: string; label: string; before: string | null; after: string | null; changed: boolean }
type DiffSet = { caseId: string; fields: DiffField[]; reason: string | null }
```

**Primitives (採用)**: `DiffPair`, `FieldRow`, `ReasonInput`, `ConfirmFooter`

### 5.4 citation-disclosure

**Demo data shape**:
```ts
type Citation = {
  sourceUrl: string
  sourceTitle: string
  passage: string
  evidenceTier: 'T1-primary' | 'T2-secondary' | 'T3-derived'
  freshness: 'breaking' | 'monthly' | 'quarterly' | 'stable'
  dateAccessed: string
  stagingHint: boolean    // ★ staging hint と確定 source を視覚分離
}
```

**Primitives (採用)**: `SourceCard`, `FreshnessBadge`, `EvidenceTier`, `StagingDivider`

### 5.5 action-confirmation

**Demo data shape**:
```ts
type ActionTier = {
  tier: 'T1-read' | 'T2-local' | 'T3-external' | 'T4-critical'
  action: string
  confirmation: 'none' | 'click' | 'typed' | 'second-factor'
  auditAttach: boolean
}
```

**Primitives (採用)**: `TierBadge`, `ConfirmDialog`, `TypedConfirm`, `AuditAttach`

### 5.6 audit-trail (preview のみ)

Cycle 6 で live 化候補。本 session では PatternDetail の research binding のみ。

## 6. Figma SSOT 構造 (Cycle 2 で seed)

各 pattern の Figma page 構造 (per `figma-mcp-agent-cockpit-workflow.md`):

```
00 Showcase Index            ← landing 全 pattern overview
01 hil-approval / Desktop
01 hil-approval / States     ← 7-state matrix
02 operator-cockpit / Desktop
03 diff-preview / Desktop
04 citation-disclosure / Desktop
05 action-confirmation / Desktop
99 Tokens                    ← color / radius / typography variables
```

Mobile pages は本 session scope 外 (timebox)。

## 7. Out of Scope (本 session)

- prototype/ 9 routes との Figma roundtrip (`backoffice-figma-mcp-capture-readiness` の指針は本 sub-app 文脈外)
- Mobile viewport の Figma seed (code 側のみ responsive 対応)
- Full Code Connect mapping (6 primitive minimum)
- audit-trail pattern の live 実装 (preview 止め)
- generate_figma_design による code-to-canvas 自動 capture (本 session MCP 未 expose、screenshot 代替で対応)
- 第三者 MCP package 使用 (CVE-2025-53967 risk)

## 8. Verification Gate (Cycle 6)

Per `figma-mcp-ship-gate-checklist.md` 8 gate:

- [ ] Context — Figma file URL + node ID 明示
- [ ] Component reuse — duplicate primitive 0
- [ ] Token — raw px / hex 0 (CSS variable 経由)
- [ ] Web/Mobile — desktop 1280+ で確認 (mobile は scope-out)
- [ ] State — 7 state (Default/Loading/Empty/Error/Permission/Dense/LongText) per pattern
- [ ] a11y — keyboard nav / focus-visible / contrast 4.5+ / aria
- [ ] Performance — heavy image 0、motion budget 守る
- [ ] Roundtrip — preview_screenshot + use_figma upload_assets で代替 capture

## 9. Back-port (Cycle 6)

実装で得た新 pattern を research-compounder に書き戻す候補:

- `samples/web-ui/showcase-catalog-pattern-card-layout.md` (本 catalog 自体の card layout pattern)
- `knowledge/ui-design/showcase-vs-prototype-coexistence.md` (prototype/ と並列稼働させる design contract)
- `samples/ui-patterns/figma-mcp-via-use_figma-only-fallback.md` (generate_figma_design 未 expose 環境の workflow)
