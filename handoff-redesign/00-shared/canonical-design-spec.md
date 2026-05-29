# Canonical Design Spec (Phase 2 React 集約の正準 SSOT)

> Phase 2 React 実装 (`prototype-redesign/`) の**唯一の design SSOT**。canonical = 既存 `prototype/` の成熟デザイン層を**継承**し、v2 (Process-First / rev.3 doc-anchored / 監査 drift 解消) を**拡張**したもの。chrome の IA は `ia-overview-v2.md` §2、画面契約は `screen-contracts-v2.md`、操作は `allowed-actions-and-state-transitions.md` が SSOT。本 spec はそれらを束ねる design 層の正準。

## 0. 由来と狙い

9 画面 Claude Design 生成物の横断監査 (`cross-screen-consistency-audit.md`) で、基盤 (token/chrome/component) は一貫だが 5 drift を検出。各画面が独立生成 (self-contained) で**一貫性を構造的に強制する層が無い**のが根因。Phase 2 で全 9 画面を**単一 shared library 上に React 再構築**し、本 spec を契約として drift を構造的に封じる。

## 1. 継承 (`prototype/` デザイン層、snapshot copy 元)

`prototype/` は Plan v1.3 lock で不変。以下を `prototype-redesign/` に snapshot copy して正準土台とする:

| 層 | 継承元 | 内容 |
|---|---|---|
| token | `src/index.css` (Tailwind v4 `@theme inline`) | canvas/panel/panel-inset/border/border-strong, fg/-muted/-subtle, primary/-hover/-fg/-soft, success/alert/error (+ `-soft` + `-soft-fg`), diff-add/del(+bg), radius card8/control6/chip4, height-pageheader 88, font-sans/mono |
| icon | **lucide-react** | 全 icon は lucide。import は **Icon suffix 統一** (例: `AlertTriangleIcon`)。inline SVG / 独自 Icon switch は禁止 |
| status 色 | `lib/status-tones.ts` | status → tone の**単一 SSOT**。画面ローカルでの status→tone 再宣言は禁止 |
| chip | StatusBadge / FilterChip / MetaChip (3 系統、混在禁止) | §3 |
| soft-fg | `--color-*-soft-fg` 経由 | `text-{amber,emerald,red}-{700,800,900}` 直書き禁止 |
| prop 規律 | tone(色semantic) / severity(深刻度) / status(workflow) / kind(variant) | 軸混在禁止 |
| 既存 primitive | `components/shared/*` | MetaChip / FilterChip / Disclosure / EmptyState / ErrorState / LoadingState / Sparkline / ActorBand / PrototypeModeLabel / StatusBadge / (DiffPreviewBlock / MetadataStrip / TrustLevelBadge は流用候補) |
| chrome | `components/shell/*` | AppShell / Sidebar / TopBar (本 spec の 6-nav grouped に再編) |

## 2. 拡張 (v2 由来、本 spec で正準化)

### 2.1 soft-tint `-200` token 追加 → 監査 drift (c) 解消
`@theme inline` に追加 (現状ハードコードされていた tint を token 化):
```
--color-alert-soft-border:   #FDE68A;  /* amber-200、要確認 card の枠 */
--color-primary-soft-border: #C7D2FE;  /* indigo-200、checker/primary soft 枠 */
--color-success-soft-border: #A7F3D0;  /* emerald-200、一致 soft 枠 */
--color-error-soft-border:   #FECACA;  /* red-200、ErrorState 枠 (Phase 2 追加、4 tone 対称化) */
```
### 2.2 紙文書 token 追加 → drift (e) 解消 (CaseDetail 文書ビューア専用)
```
--color-paper:       #ffffff;  --color-paper-ink:  #1a1a1a;
--color-paper-label: #64748b;  --color-paper-line: #cbd5e1;  --color-paper-bg: #eef2f6;
```
docanchor の raw グレー (#666/#1a1a1a/#ccc 等) はこれに置換。

### 2.3 Process-First IA (chrome SSOT = `ia-overview-v2.md` §2)
- TopBar: ProcessSelector `[業務 ▾]` + PrototypeModeLabel
- Sidebar: **6-nav grouped**: ハブ / ─処理─ 受信トレイ・承認待ち / ─改善─ AI 提案レビュー・Agent 設定 / ─監視─ モニタリング
- route: `/` `/cases` `/approvals` `/cases/:id` `/proposals` `/proposals/:id` `/agents` `/agents/:id` `/observatory`

### 2.4 4 cross-cutting component (新規、shared library に追加)
ProcessSelector / ReconcilePanel (rev.3 文書アンカー 2-pane) / MetricVsThreshold / ConsequencePanel。spec は `reconcile-panel-spec.md` / `metric-vs-threshold-spec.md` / `consequence-panel-spec.md` / `process-selector-spec.md`。

### 2.5 rev.3 doc-anchored CaseDetail パターン (`screens-v2/04` 参照)
文書ビューア (左) + 全項目 (右) 2-pane / 統合「項目の対応」modal / 単一決定面 footer / LifecycleStepper。

## 3. chip taxonomy (継承、3 系統・混在禁止)

| Component | radius | border | bg | 用途 |
|---|---|---|---|---|
| StatusBadge | chip 4px | なし | tone fill | workflow status (確認待ち 等) |
| FilterChip | control 6px | あり | white / primary-soft | filter 切替 |
| MetaChip | control 6px | なし | slate-100 / tone-soft | 非インタラクティブ meta (要確認 N 等) |

### 3.1 tone v2 拡張 (継承元との型衝突を解消、CR P1 反映)

継承元 `prototype/` の tone union は `StatusBadge: neutral|primary|success|alert|error` / `MetaChip: neutral|primary|alert|error` のみ。screens-v2 は `inset` / `slate` を使う (受付・承認待ち)。React で `inset/slate` を返すと型・class 不足するため、**Phase 2B で v2 拡張する** (`neutral` は prototype 互換として残す):

```ts
// StatusBadge ToneV2
type ToneV2 = 'neutral' | 'inset' | 'slate' | 'primary' | 'success' | 'alert' | 'error'
// MetaChip ToneV2 (slate 不要)
type MetaToneV2 = 'neutral' | 'inset' | 'primary' | 'success' | 'alert' | 'error'

// TONE_CLASS 追加分:
//   inset: 'bg-[var(--color-panel-inset)] text-[var(--color-fg)]'      // 受付済 / system 中立
//   slate: 'bg-[var(--color-fg)] text-white'                            // 承認待ち (次段待ちの solid fill)
//   neutral: 'bg-slate-100 text-slate-600'  (prototype 互換、既存呼び出し維持)
```

> `neutral` (slate-100) と `inset` (panel-inset) は近いが別 token。screens-v2 parity は `inset` を使う。prototype 既存 page の `neutral` 呼び出しは変更しない (互換)。

## 4. status → tone 統一表 (canonical、`lib/status-tones.ts` に集約) → drift (b) 解消

> **重要 (CR P1)**: 下表は **screens-v2 (pixel-parity target) の割当**で、継承元 `prototype/` の `status-tones.ts` resolver 値とは一部異なる。Phase 2B では resolver を**下表の v2 値に再定義**する (prototype 側は lock で不変、`prototype-redesign` 側のみ v2 値):
> - 差戻し再処理: prototype=`error`(red) → **v2=`alert`**(amber)
> - 承認待ち: prototype=`alert`(amber) → **v2=`slate`**(solid)
> - 受付(済): prototype=`neutral` → **v2=`inset`**

tone semantic: **inset**=中立/受付/system, **primary**=進行中/AI/確認中, **alert**=要対応/人手介在, **slate**=次段待ち, **success**=完了/良好, **error**=重大/却下.

| ドメイン | status (UI ラベル) | tone |
|---|---|---|
| 案件 | 受付済 | inset |
| 案件 | 確認待ち | primary |
| 案件 | 差戻し再処理 | alert |
| 案件 | 承認待ち | slate |
| 案件 | 反映済 | success |
| 提案 | 確認待ち | primary |
| 提案 | 上長へ送付済 | slate |
| 提案 | 承認済 | success |
| 提案 | 却下 | inset |
| reconcile field | 一致 / 確認済 | success / primary |
| reconcile field | 要確認 | alert |
| reconcile field | 未取得 | inset |
| reconcile field | エスカレーション | error |
| Agent Trust | Supervised / Checkpoint / Autonomous | TrustLevelBadge (別系統) |

> 語彙統一: 案件 status は「**受付済**」(状態)。モニタリングの lifecycle **event** 名は「受付」(動作) で別軸 (両立)。

## 5. icon-per-concept (lucide、Icon suffix) → drift (d) 解消

| 概念 | lucide | 概念 | lucide |
|---|---|---|---|
| ハブ | `LayoutGridIcon` | 検索 | `SearchIcon` |
| 受信トレイ | `InboxIcon` | 通知 | `BellIcon` |
| 承認待ち | `ClipboardCheckIcon` | 展開 | `ChevronRightIcon`/`ChevronDownIcon` |
| AI 提案レビュー | `SparklesIcon` | 行き先 | `ArrowRightIcon` |
| Agent 設定 | `BotIcon` | 要確認 | `AlertTriangleIcon` |
| モニタリング | `ActivityIcon` | 一致/確認済 | `CheckIcon`/`CheckCircle2Icon` |
| 申請書類/locator | `FileTextIcon` | 修正(override) | `PencilLineIcon` (旧 `pencil-dot` 廃止) |
| 再取得 | `RotateCwIcon` | 差戻し | `CornerUpLeftIcon` |
| SoD/保護 | `ShieldCheckIcon` | エスカレーション | `ChevronsUpIcon` |

> 🔴 03-approvals の `pencil-dot` (未定義) は `PencilLineIcon` に置換。emoji (🛡↑✓ 等) は使わない。

## 6. C 型 detail contract (`screen-contracts-v2.md` §全画面共通 由来、React component 契約化)

C 型 detail 画面 (CaseDetail / ProposalDetail / AgentDetail) は以下を**型・dev assert で強制**:
- **A 全体レビュー可能性**: 判断対象の全項目を default 表示 (resolved/一致 を折りたたみ default にしない)。dev assert: 「対象集合の件数 == 表示件数」。
- **B 証拠アンカー**: 一次証拠 (申請書類 / 根拠 case / metrics sample) を読めるサイズで併置 + 入力値と相互リンク。
- **C 単一決定面**: standing 決定ボタンは object 単位 1 セットのみ。field/部分操作は行クリック→modal。dev assert: detail footer の primary button cluster == 1。

## 7. 監査 drift → 解消 mapping (要約)

| drift | 解消 |
|---|---|
| (a) 04 独自 chrome (shell.jsx) | shared AppShell/Sidebar/TopBar に統一 (6-nav grouped) |
| (b) status→tone SSOT 不在 | `lib/status-tones.ts` 単一 import、ローカル再宣言禁止 (§4) |
| (c) soft-tint 未 token | `-200` token 追加 (§2.1) |
| (d) pencil-dot 欠け / inline SVG | lucide icon-per-concept (§5) |
| (e) 紙グレー / 語彙ゆれ | 紙 token (§2.2) + 受付済/受付 軸分離 (§4) |

## 8. 一貫性 gate (Phase 2B QC、`prototype-redesign/src`)

- off-token hex 0 (soft-tint/紙 含む全色が token)
- status→tone は `lib/status-tones.ts` 単一 import のみ (ローカル `STATUS=` 再宣言 0)
- tone は ToneV2 union のみ (§3.1)。未定義 tone 文字列 0、`TONE_CLASS` に inset/slate class 定義済
- icon は lucide-react のみ (inline `<svg>` 0、`pencil-dot` 0、emoji 0)
- Sidebar/TopBar は shared component 単一実装 (画面ローカル chrome 0)
- nav 6 項目 grouped (処理/改善/監視)
- `text-{amber,emerald,red}-{700,800,900}` 直書き 0 (soft-fg token 経由)
- C 型 3 画面で A/B/C dev assert pass
