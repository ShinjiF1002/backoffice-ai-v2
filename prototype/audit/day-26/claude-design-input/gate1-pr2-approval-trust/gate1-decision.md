# Gate 1 Decision — Wave 2 Approval Trust System (F-2 + F-5 + F-7)

PR 2 着手前の visual decision gate。Claude Design 生成 7 mock のうち、各 finding で 1 案を採用候補として記録、Safety rail 5 軸 check を通過したものを Wave 2 PR 2 (Commit 2-5) の design spec source とする。

最終投入 mock: `screenshots/wave2-design-exploration/F-{2,5,7}-{A,B,C}.html`

## Safety rail 5 軸 (記録用 checklist)

各案について以下 5 軸を pass / partial / fail で評価:

| 軸 | 内容 |
|---|---|
| **S1 token compliance** | Operational Premium Light token (slate-50/white/indigo/emerald/amber/red、radius 8/6/4、Inter+Noto Sans JP+JetBrains Mono) のみ。新 token / 装飾 (gradient/glow/glass/3D/large rounded) 0 |
| **S2 chip taxonomy** | 3 系統 (StatusBadge 4px no-border / FilterChip 6px border / MetaChip 6px no-border) を壊さない |
| **S3 lifecycle 不変** | 5 step (受付→AI処理→入力者確認→承認者承認→反映) 順序を変えず、`手順承認` を current case stepper に混入させない |
| **S4 citation governance** | 引用根拠 emerald compiled only / 未承認ヒント slate-50 inset + `引用根拠 対象外` label / 関連手順アラート amber 独立 / data_error は staging 除外 |
| **S5 mock data 規範** | active workflow (UC-BO-01/02) only、国際送金 UI 化 0、Tier 3 規制語 exact 0、KPI/SLO に `[仮説 / 要検証]` label |

## F-2 — Diff Preview 3-view + MetadataStrip 5-element

| 案 | mock | 概要 | S1 | S2 | S3 | S4 | S5 | 採用判定 |
|---|---|---|---|---|---|---|---|---|
| **A** | `F-2-A.html` | Inline default + Field table toggle (CaseReview) / MetadataStrip = footer 直上 / 承認 button = MetadataStrip ack で active 化 | pass | pass | pass | pass | pass | **★ 採用候補 (CaseReview)** |
| **B** | `F-2-B.html` | Side-by-side default + Inline toggle (ProposalReview) / MetadataStrip = PageHeader 直下 | pass | pass | pass (lifecycle 非対象、ProposalLifecycle) | pass | pass | **★ 採用候補 (ProposalReview)** |
| C | `F-2-C.html` | Field table default + 3-view toggle / MetadataStrip = collapsible (`PageHelpDisclosure` 連携) | pass | pass | pass | pass | pass | 両 page 統一 API は理想だが、 ProposalReview の手順 markdown 差分には Field table が不適。3 view tab の常時露出が CaseReview density を圧迫 |

### F-2 採用方針

**Page 別の最適案を採用** (`DiffPreviewBlock` / `MetadataStrip` は 1 component で `availableViews` props 切替可能):

- **CaseReview = 案 A** — `defaultView='inline'`, `availableViews=['inline','fieldTable']`, MetadataStrip `placement='footer'`
- **ProposalReview = 案 B** — `defaultView='sideBySide'`, `availableViews=['sideBySide','inline']`, MetadataStrip `placement='header'`

両 page で同一 React primitive を共有しつつ、 props で挙動を分岐させる (案 C を 1 段 lite 化したアプローチ)。

### F-2 採用 props 統合 (Commit 2-4 で実装)

```ts
// data/types.ts (Commit 2)
interface CaseField {
  // …existing
  changeAuthor?: string         // 'AI 抽出 v2.3'
  changeReason?: string         // 'OCR 信頼度 0.84 (閾値 0.85 未達)、新住所の番地表記'
  affectedScope?: string        // '1 customer'
  reversibility?: 'Revertible' | 'Partial' | 'Irreversible'
}

interface ProposalDiffSection {
  // …existing
  changeAuthor?: string         // 'AI 日次分析 v1.2'
  changeReason?: string
  affectedScope?: string        // '12 cases (3 週間履歴) + 今後の UC-BO-01 全件'
  reversibility?: 'Revertible' | 'Partial' | 'Irreversible'
}

// components/shared/DiffPreviewBlock.tsx (Commit 3)
type DiffView = 'inline' | 'sideBySide' | 'fieldTable'
type DiffSource =
  | { kind: 'fields'; fields: CaseField[] }
  | { kind: 'sections'; sections: ProposalDiffSection[] }

interface DiffPreviewBlockProps {
  source: DiffSource
  defaultView: DiffView
  availableViews: DiffView[]
  onViewChange?: (v: DiffView) => void
}

// components/shared/MetadataStrip.tsx (Commit 3)
interface MetadataStripProps {
  changeAuthor?: string
  changeReason?: string
  confidence?: number
  affectedScope?: string
  reversibility?: 'Revertible' | 'Partial' | 'Irreversible'
  placement?: 'header' | 'footer'    // anchor position
  onAck?: () => void                 // approval gate trigger
}
```

### F-2 採用後の Card 2 ★ verdict

- View: 2 view (Inline + Field table) on CaseReview / 2 view (Side-by-side + Inline) on ProposalReview = **partial** (両 page 合算で 3 view を全 cover、各 page では 2 view ずつ)
- MetadataStrip 5 element: 全部 = **pass**
- 承認 button gate: **pass** (`onAck` + IntersectionObserver / click)

## F-5 — ActorBand primitive

| 案 | mock | 概要 | S1 | S2 | S3 | S4 | S5 | 採用判定 |
|---|---|---|---|---|---|---|---|---|
| **A** | `F-5-A.html` | 4px 左 color band + lucide icon prefix (Bot/User/Cog) / sm h-5 / md h-7 | pass | pass | N/A | N/A | pass | **★ 採用候補** |
| B | `F-5-B.html` | 24px circle avatar + tone-tinted halo + initial fallback | pass | partial (avatar が新規 chip-like 要素、 chip taxonomy 3 系統と隣接) | N/A | N/A | pass | 面積で識別の強み有り、ただし row height +4px / density 圧迫 |

### F-5 採用方針

**案 A を採用**。理由:

1. Operational Premium Light の density-first 原則と整合 (band 4px のみ、 row height 不変)
2. Chip taxonomy 3 系統と <em>隣接しない</em> 完全に新規 layout primitive (`::before` band)
3. 色 + 形 dual cue で色覚 a11y を確保しつつ、 token 追加 0
4. Inbox queue / Dashboard breakdown / AuditTrail row 全てで size 切替 (sm/md) のみで再利用可能

案 B は avatar の人間味は強いが、 chip taxonomy への影響 / 行高 +4px の trade-off が大きく、 Operational Premium Light の本流 (装飾抑制) から逸脱気味。

### F-5 採用 props (Commit 5 で実装)

```ts
// components/shared/ActorBand.tsx
type Actor = 'agent' | 'human' | 'system'

interface ActorBandProps {
  actor: Actor
  label?: string                // e.g. '田中 美咲' / 'AI 抽出 v2.3' / 'system 反映'
  size?: 'sm' | 'md'            // sm = h-5 (Inbox queue), md = h-7 (AuditTrail row)
  className?: string
}

// Color mapping (binding to existing tokens, no new tokens)
// agent  → --color-primary (#635BFF)
// human  → slate-600 (#475569)
// system → slate-400 (#94A3B8)

// Icons (lucide-react)
// agent  → Bot
// human  → User
// system → Cog
```

### F-5 採用後の Card 1 verdict

- icon prefix + color band で agent/human/system 区別 = **pass**
- scrolling 中の actor 判別速度: 4px band の左端 visual anchor で達成
- Day 19 EvidenceTimeline actor paraphrase との整合: actor enum を `'agent'|'human'|'system'` に normalize する mapping table を `lib/actor-mapping.ts` に追加 (Commit 5 で実装)

## F-7 — LifecycleStepper SLA per step + Delegate visibility

| 案 | mock | 概要 | S1 | S2 | S3 | S4 | S5 | 採用判定 |
|---|---|---|---|---|---|---|---|---|
| **A** | `F-7-A.html` | Per-step SLA badge (target/elapsed chip) + step hover で approver 名 / Inbox = UserSwitch icon + tooltip | pass | pass | pass (5 step 不変、`手順承認` 不混入) | N/A | pass | **★ 採用候補** |
| B | `F-7-B.html` | Step を card 化 + 3px progress bar / click expand 詳細 / Inbox = MetaChip 「代理中 (元 → 代理)」 | pass | partial (step card が新規 panel-like 要素、 chip taxonomy 隣接) | pass | N/A | pass | 1 行で代理可視は強み、ただし stepper の vertical 領域 +80px、 CaseReview 上部 density 圧迫 |

### F-7 採用方針

**案 A を採用** + Inbox delegate 表示は **案 B の MetaChip 表記 (代理中 (元 → 代理)) を hybrid 採用** する:

1. LifecycleStepper 拡張 = 案 A (chip + hover tooltip、 stepper の visual rhythm 維持)
2. Inbox delegate visibility = 案 B の MetaChip 表記 (icon + tooltip より「scroll 中に読める」 row 内テキスト表現が出張・休暇 routing の即時把握に強い)

### F-7 採用 props (Commit 5 で実装)

```ts
// data/types.ts
type CaseLifecycleStep = '受付' | 'AI処理' | '入力者確認' | '承認者承認' | '反映'

interface CaseLifecycleStepSpec {
  step: CaseLifecycleStep
  state: 'done' | 'current' | 'pending'
  slaTargetLabel: string            // '4 h' / '24 h' / '即時' / '5 分'
  slaTargetMinutes: number | 'instant'
  elapsedLabel?: string             // '2:18' (current step のみ)
  elapsedPercent?: number           // 0-200+
  approver?: { name: string; role: '入力者' | '承認者' | 'AI' | 'system' }
}

interface DelegateInfo {
  from: string                      // 元 assignee (e.g. '渡辺 真理')
  to: string                        // 代理 assignee (e.g. '鈴木 直樹')
  absentFrom: string                // '2026-05-30'
  absentTo: string                  // '2026-06-02'
}

interface CaseRecord {
  // …existing
  lifecycleSpecs?: CaseLifecycleStepSpec[]   // F-7 拡張、未指定なら従来通り step 名のみ
  delegate?: DelegateInfo                     // 代理 routing が active な時のみ
}

// components/case/LifecycleStepper.tsx
interface LifecycleStepperProps {
  current: CaseLifecycleStep
  specs?: CaseLifecycleStepSpec[]           // 未指定なら従来の chip-only 表示
}

// CASE-2026-0142 mock data 拡張 (Commit 5):
// lifecycleSpecs = [
//   { step: '受付',    state: 'done',    slaTargetLabel: '即時', slaTargetMinutes: 'instant', elapsedLabel: '14 秒', elapsedPercent: 100,
//     approver: { name: 'system', role: 'system' } },
//   { step: 'AI処理',  state: 'done',    slaTargetLabel: '5 分', slaTargetMinutes: 5, elapsedLabel: '1:57', elapsedPercent: 39,
//     approver: { name: 'AI 抽出 v2.3', role: 'AI' } },
//   { step: '入力者確認', state: 'current', slaTargetLabel: '4 h', slaTargetMinutes: 240, elapsedLabel: '2:18', elapsedPercent: 57,
//     approver: { name: '田中 美咲', role: '入力者' } },
//   { step: '承認者承認', state: 'pending', slaTargetLabel: '24 h', slaTargetMinutes: 1440,
//     approver: { name: '渡辺 真理', role: '承認者' } },
//   { step: '反映',    state: 'pending', slaTargetLabel: '即時', slaTargetMinutes: 'instant',
//     approver: { name: 'system', role: 'system' } },
// ]
```

### F-7 採用後の Card 8 verdict

- Step graph: **pass** (5 step sequential)
- Approver routing (role-based + delegate hierarchy): **pass** (approver per step + DelegateInfo)
- Visibility + transparency (current step / all steps / who pending / SLA per step): **pass** (per-step SLA chip + hover で approver 名 + Inbox MetaChip 代理表記)
- Escape hatches: **partial** (差戻し は既存実装、 escalation は本 Wave では未対応 — Wave 3 候補)

## 統合 Safety rail 5 軸最終 check

採用 3 案 (F-2-A + F-2-B + F-5-A + F-7-A、 Inbox delegate は F-7-B hybrid) について:

| 軸 | 評価 | 根拠 |
|---|---|---|
| S1 token compliance | **pass** | slate-50 / white / indigo / emerald / amber / red のみ。 装飾要素 0 (案 A の sticky footer + MetadataStrip strip も全て hairline + soft background のみ) |
| S2 chip taxonomy | **pass** | StatusBadge / FilterChip / MetaChip 3 系統を維持。 ActorBand は band ::before のみで新規 chip 系統を作らない |
| S3 lifecycle 不変 | **pass** | 5 step 順序 + step 名不変。 `手順承認` を case stepper に混入させない (ProposalReview 側の `ProposalLifecycleStepper` で別 flywheel) |
| S4 citation governance | **pass** | 採用案 mock 全てで 引用根拠 emerald + 未承認ヒント slate-50 inset + `引用根拠 対象外` label + 関連手順アラート amber 独立を retain |
| S5 mock data 規範 | **pass** | UC-BO-01 (CASE-2026-0142) + UC-BO-02 (CASE-2026-0148) のみ。 国際送金 UI 化 0、Tier 3 規制語 exact 0、SLA target は `4 h` / `24 h` / `5 分` の operational 値、 KPI 関連は既存 `[仮説 / 要検証]` chip 維持 |

## PR 2 Commit 構成 (採用後)

| Commit | 内容 | 採用案 |
|---|---|---|
| Commit 2 | `data/types.ts` 拡張 (`CaseField` / `ProposalDiffSection` に 4 metadata、`CaseLifecycleStepSpec` / `DelegateInfo` 追加) + mock data 投入 | F-2 + F-7 |
| Commit 3 | `DiffPreviewBlock` / `MetadataStrip` primitive 新規 | F-2-A + F-2-B |
| Commit 4 | CaseReview / ProposalReview 統合 (各 page 別 `availableViews` / `placement` props) | F-2-A + F-2-B |
| Commit 5 | `ActorBand` primitive 新規 + `LifecycleStepper` 拡張 (`specs` prop) + Inbox delegate MetaChip | F-5-A + F-7-A + F-7-B hybrid |

## Open question (PR 2 着手前に user 解決)

1. **SLA target 値 (`4 h` / `24 h` / `5 分`)** は demo mock 内で固定で良いか? `boundary pack` 内部の実 SLA 値とは別途 [仮説 / 要検証] label を付けるか?
2. **DelegateInfo の data 投入 case** は CASE-2026-0118 + CASE-2026-0095 の 2 件で十分か? それとも CASE-2026-0142 (Demo Chapter 1 主役) にも delegate を当てて Hero scenario として見せるか?
3. **ActorBand の actor mapping** で既存 `EvidenceStep.actor` (`'AI' | '入力者' | '承認者' | 'system'`) を `'agent' | 'human' | 'system'` に正規化する場合、`'入力者' / '承認者'` は両方 `'human'` にまとめる方針で良いか? (Day 19 EvidenceTimeline paraphrase との整合)

---

**生成 mock 一覧** (`screenshots/wave2-design-exploration/`):

- `index.html` — 7 mock の navigation hub
- `F-2-A.html` — Inline default + Field table toggle (CaseReview) ★ 採用
- `F-2-B.html` — Side-by-side default + Inline toggle (ProposalReview) ★ 採用
- `F-2-C.html` — Field table default + 3-view toggle (両 page 統一案、不採用)
- `F-5-A.html` — 4px color band + icon prefix ★ 採用
- `F-5-B.html` — Circle avatar + tone-tinted halo (不採用)
- `F-7-A.html` — Per-step SLA badge + Delegate icon ★ 採用 (LifecycleStepper 部分)
- `F-7-B.html` — Compact SLA progress bar + Delegate badge (LifecycleStepper 部分は不採用、Inbox Delegate MetaChip 表記のみ hybrid 採用)

---

**Decision date**: 2026-05-26
**Approver**: user (approved 2026-05-26、PR 2 着手前 Open Q 3 件 resolution 含む)

---

## Open Question Resolution (PR 2 着手直前、user 確認済)

| # | 質問 | 採用 resolution |
|---|---|---|
| 1 | SLA target 値 (`4 h` / `24 h` / `5 分`) を demo mock 内でどう扱うか | **mock 固定 + `[仮説 / 要検証]` label**。boundary pack 内部の実 SLA 値とは独立、demo 上 hedge を明示 |
| 2 | DelegateInfo の data 投入 case | **3 case**: CASE-2026-0118 + CASE-2026-0095 + **CASE-2026-0142 (Demo Hero)**。Session 4 demo で Hero scenario として SLA + Delegate を 1 画面 cover |
| 3 | ActorBand actor mapping で `'入力者' / '承認者'` の扱い | **両方 `'human'` に統合**。Day 19 EvidenceTimeline paraphrase と整合、ActorBand は 3-enum (`'agent' / 'human' / 'system'`) 維持、Role 区別 (入力者 vs 承認者) は label / hover で表現 |

### Implementation reflection (PR 2 commits)

- **Commit 2 (types + mock)**: SLA `slaTargetLabel` に `[仮説 / 要検証]` suffix を付けた値を投入 (例: `'4 h target [仮説 / 要検証]'`)、DelegateInfo を CASE-0142/0118/0095 の 3 case で投入、ActorBand mapping table を `lib/actor-mapping.ts` に追加
- **Commit 5 (ActorBand + Lifecycle)**: `lib/actor-mapping.ts` で `'AI' → 'agent'`, `'入力者' → 'human'`, `'承認者' → 'human'`, `'system' → 'system'` の mapping table、ActorBand 側は 3-enum のまま、call site で role label を separate prop で渡す

Resolution これにより PR 2 Commit 2-5 を gate1-decision.md spec 通りに実装可能。
