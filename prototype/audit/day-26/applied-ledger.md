| 項目 | 値 |
| --- | --- |
| 文書 ID | DOC-AUDIT-D26-APPLIED-LEDGER |
| 文書名 | Day 19 v1.4 Applied Ledger (HEAD `846afa4` snapshot、P1 sealed) |
| 版数 | v1.0 (sealed) |
| ステータス | Sealed — execution P1 gate pass |
| オーナー | backoffice-ai-v2 maintainer |
| 関連文書 | DOC-AUDIT-D26-RC-PLAN v1.0 / DOC-AUDIT-D19-UXC-REQ v1.4 |
| SSOT 区分 | Day 26 audit の **Day 19 重複除外** 入力 SSOT。本 ledger に applied 記載の 18 finding と同一 finding / 同一 fix proposal を Day 26 で再 propose することは禁止 |
| Evidence Status | empirical (Phase 1 Explore agent + Day 19 v1.4 SSOT §1 unified matrix + 現行 source code path verify) |

---

# Day 19 v1.4 Applied Ledger — HEAD `846afa4`

## Summary

- **Total unified findings**: 21 (U-1 〜 U-21)
- **Applied**: **18** = Day 18.5 ext 1 (U-3) + Day 19 patch 17 (U-1/U-2/U-4/U-5/U-6/U-7/U-8/U-9/U-10/U-11/U-12/U-13/U-14/U-16/U-17/U-18/U-20)
- **Defer**: **2** (U-15 Dashboard lane deletion → Phase 1 / U-19 FilterToolbar 6 disabled → Day 18.5 post-judgement)
- **Excluded**: **1** (U-21 docs/03 SSOT recovery → normal state、no-op)
- **5 新規 primitive**: 全 5 件実装済 (HypothesisChip / Disclosure / DetailDrawer / PageHelpDisclosure / NextActionStrip)
- **Reverted** (audit doc + 3 label のみ): commit 441e194 (`feat(audit): copy review session 2026-05-26`) が 846afa4 で revert、core implementation は intact

## Detailed Ledger (verbatim from Phase 1 verify)

| U-ID | Requirement | Status | Evidence | Day 26 重複禁止 scope |
| --- | --- | --- | --- | --- |
| U-1 | `[仮説 / 要検証]` hedge → HypothesisChip primitive (section-level) | **APPLIED** | `src/components/shared/HypothesisChip.tsx` + Metrics:16 + AgentSettings:46 + Dashboard | 同一 finding (HypothesisChip 反復削減) 再 propose 禁止、別 angle (例: HypothesisChip の confidence range 表記 craft) は `adjacent-to-Day19` 可 |
| U-2 | Internal SSOT metadata leak gate (`?debug=1` query opt-in) | **APPLIED** | `src/lib/show-internal.ts:17-19` + AuditTrail conditional + KnowledgeBrowser conditional | 同一 finding (DOC-* leak、schema key leak) 禁止 |
| U-3 | CaseReview 承認 enabled no-op fix (in-memory state) | **APPLIED (Day 18.5 ext)** | `src/pages/CaseReview.tsx:40-51, 235-244, 257-265` | 同一 finding (承認 button enabled no-op) 禁止 |
| U-4 | EvidenceTimeline actor/source/conf paraphrase + L3 PDR drawer | **APPLIED** | `src/components/case/EvidenceTimeline.tsx` (paraphrase) + DetailDrawer | 同一 finding (mono raw cadence) 禁止、別 angle (例: 5-layer timeline conformance) は `adjacent-to-Day19` 可 |
| U-5 | PageHelpDisclosure primitive (L1 framing → L4 expand) | **APPLIED** | `src/components/shared/PageHelpDisclosure.tsx` + Metrics + AuditTrail + KnowledgeBrowser × 4 instance each | 同一 finding (framing 注 box L1 dense) 禁止 |
| U-6 | ProposalReview 4-col → 2-col + DetailDrawer (RACI) | **APPLIED** | `src/pages/ProposalReview.tsx:122` grid + 264-328 drawer + DetailDrawer | 同一 finding (4-col density) 禁止、別 angle (例: RACI-A 5-role surface conformance) は `adjacent-to-Day19` 可 |
| U-7 | Footer caption 9 page → PrototypeModeLabel 統合 | **APPLIED** | `src/components/shared/PrototypeModeLabel.tsx` + 9 page footer caption 削除 | 同一 finding (footer caption 重複) 禁止 |
| U-8 | Tier 1 vocab 統一 (`承認者承認` 全 instance、`業務承認` 削除) | **APPLIED** | CaseReview + ProposalReview + mock data 整合 | 同一 finding (vocab 表記揺れ) 禁止 |
| U-9 | Raw vocab paraphrase (met/miss → 達成/未達) | **APPLIED** | Metrics:173-176 + ProposalReview:113-116 | 同一 finding (raw enum leak) 禁止 |
| U-10 | StagingHintPanel collapse (P2) | **APPLIED** | `src/components/case/StagingHintPanel.tsx:24-27` (Disclosure wrapper) | 同一 finding (staging hint visual weight) 禁止 |
| U-11 | `(5 分類)` redundant suffix 削除 | **APPLIED** | UI-visible instance 0、JSDoc retain | 同一 finding (redundant suffix) 禁止 |
| U-12 | Inbox row click → preview drawer (PDR) | **APPLIED** | `src/components/shared/DetailDrawer.tsx` + Inbox row click | 同一 finding (row click 1-step) 禁止、別 angle (例: data-table-premium sort/filter column header) は backlog defer 済 |
| U-13 | NextActionStrip primitive (4 page) | **APPLIED** | `src/components/shared/NextActionStrip.tsx` + Dashboard×4 + Inbox×4 + CaseReview×3 + ProposalReview×3 | 同一 finding (next action ambiguity) 禁止、別 angle (例: 3-viewport cockpit Dashboard) は `adjacent-to-Day19` 可 |
| U-14 | SendBackComment radio description default (Disclosure for L4) | **APPLIED** | `src/pages/SendBackComment.tsx:201-210` (Disclosure wrapper) | 同一 finding (radio description verbosity) 禁止 |
| U-15 | Dashboard workflow lane deletion + hardcoded case_id | **DEFER (Phase 1)** | Day 19 SSOT 明示 defer、現行 HEAD で touched せず | 本 audit でも `defer-by-Day19` tag で touched せず、Phase 1 scope |
| U-16 | ProposalReview footer free-floating span 削除 | **APPLIED** | ProposalReview footer + DisabledAction adoption | 同一 finding (free-floating span) 禁止 |
| U-17 | AgentSettings Hero clutter 削減 (4 KPI grid → Disclosure) | **APPLIED** | `src/pages/AgentSettings.tsx:180-195` (Disclosure) + 249-260 (tool Disclosure) | 同一 finding (Hero 6 layer dense) 禁止、別 angle (例: agent-permission-rbac surface) は R5 sub-check に embed |
| U-18 | CaseReview footer left explainer 削除 (NH6) | **APPLIED** | `src/pages/CaseReview.tsx:232-244` (success flash only) | 同一 finding (footer explainer 重複) 禁止 |
| U-19 | Inbox FilterToolbar integration (6 disabled surface) | **DEFER (Day 18.5 post-judgement)** | Day 19 SSOT 明示 defer | 本 audit でも `defer-by-Day19` tag で touched せず |
| U-20 | Mock data trim pass (PROP-2026-031 summary 100→60 char) | **APPLIED** | `src/data/mock-proposals.ts:28-29` (~60 char) + 173-176 | 同一 finding (mock summary verbosity) 禁止 |
| U-21 | docs/03 SSOT status recovery | **EXCLUDED (no-op)** | docs/03 normal state verified | 本 audit でも touched せず、SSOT 正常 |

## 5 New Primitives Verified

| Primitive | File | Status | Used in |
| --- | --- | --- | --- |
| HypothesisChip | `src/components/shared/HypothesisChip.tsx` | EXISTS | Metrics / AgentSettings / Dashboard (5 instance) |
| Disclosure | `src/components/shared/Disclosure.tsx` | EXISTS | 7 page × multiple instance (U-5/U-10/U-14/U-17) |
| DetailDrawer | `src/components/shared/DetailDrawer.tsx` | EXISTS | ProposalReview RACI + Inbox preview + CaseReview EvidenceTimeline (non-modal `<aside role="complementary">`) |
| PageHelpDisclosure | `src/components/shared/PageHelpDisclosure.tsx` | EXISTS | Metrics + AuditTrail + KnowledgeBrowser × 4 each = 12 instance |
| NextActionStrip | `src/components/shared/NextActionStrip.tsx` | EXISTS | Dashboard×4 + Inbox×4 + CaseReview×3 + ProposalReview×3 = 14 instance |

## P1 Mechanical Gate Pass — `npm run check:all`

実行 timestamp: 2026-05-26 (HEAD `846afa4`)

```
> prototype@0.0.0 lint
> eslint .
(no errors)

> prototype@0.0.0 check:no-op
> node scripts/check-no-op.mjs
✓ no enabled no-op <button> (checked 37 .tsx files)

> prototype@0.0.0 build
> tsc -b && vite build
✓ 1795 modules transformed
dist/index.html                   0.93 kB │ gzip:   0.53 kB
dist/assets/index-BQsqIfsY.css   34.88 kB │ gzip:   7.21 kB
dist/assets/index-BvrSAjkb.js   423.73 kB │ gzip: 118.52 kB
✓ built in 182ms
```

**Gate verdict: PASS** — lint clean / no-op 37 .tsx files OK / build pass (modules 1795 / js 423.73 kB gzip 118.52 kB / css 34.88 kB gzip 7.21 kB)。P2 着手可。

## a11y + RBAC Sub-check Rubric (R5 embed、別 AI 批判 P1-3 対応)

R7 required cards `a11y-default-for-enterprise-ai` + `agent-permission-rbac-pattern` は独立 finding 化せず、本 ledger の rubric で mechanical 判定:

### a11y sub-check (P5 → P2 で screenshot 時に並行確認)

| Rubric item | Pass 条件 | Verify 方法 |
| --- | --- | --- |
| a11y-1 Lighthouse a11y score | ≥ 90 | Lighthouse (Chrome DevTools) on Dashboard / CaseReview / Inbox / ProposalReview |
| a11y-2 Keyboard tab order | 全 interactive element に到達可能、focus ring visible | preview_eval で `document.activeElement` trace |
| a11y-3 ARIA role hygiene | DetailDrawer `<aside role="complementary">` non-modal、PrototypeModeLabel `role="status"`、PageHeader `<sectionheader>` | preview_snapshot accessibility tree |
| a11y-4 Color contrast (Operational Premium Light) | bg-{success,alert,error}-soft の text fg は `*-soft-fg` token 経由 (Day 14 P1.5 C1)、Tailwind palette 直接使用なし | code grep `text-(amber|emerald|red)-(700|800|900)` |

NG が 1 item でもあれば finding 化 (P0 or P1)、すべて pass なら R5 mechanical preflight pass。

### RBAC sub-check (R5 で AgentSettings surface review)

| Rubric item | Pass 条件 | Verify 方法 |
| --- | --- | --- |
| rbac-1 Agent permission grant UI | AgentSettings に Tool / 権限 / Trust Level 5 領域が visible | preview_snapshot AgentSettings |
| rbac-2 RACI-A 5-role disclosure | ProposalReview の RACI 列に Responsible / Accountable / Consulted / Informed / Agent-executor が分離 visible | preview_snapshot ProposalReview DetailDrawer |
| rbac-3 Trust Level progression | AgentSettings Hero に 3-stage stepper visible (Supervised / Checkpoint / Autonomous) | preview_snapshot AgentSettings Hero |
| rbac-4 Least-privilege expression | AgentSettings の Tool list に scope (read / write / approval) が visible | code grep AgentSettings Tool prop |

NG が 1 item でもあれば finding 化 (R4 oversight surface finding)、すべて pass なら disclosure surface OK。

両 sub-check は P2 screenshot 取得時に並行確認、P3 matrix の R5 行に集約。
