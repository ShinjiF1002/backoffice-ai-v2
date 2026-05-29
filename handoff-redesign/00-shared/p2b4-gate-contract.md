# P2B-4 Gate Contract & Import-Graph 棚卸し (P2B-4a、contract freeze)

> Phase 2B 最終 QC の gate 仕様 SSOT。`prototype-redesign/src` を対象に、active/dormant 分類・gate ルール・許容例外を固定する。これを基準に 4b (quarantine + token 化) / 4c (full gate) / 4d (a11y + baseline) を実行する。

## 1. Import-graph 分類 (機械的、BFS from `main.tsx`/`App.tsx`)

`src` の `.tsx`/`.ts` を entry から到達閉包で分類 (legacy 除外、basename 解決、iter 4 収束)。

- **ACTIVE = 39** (route 到達): 9 pages + shell 4 (AppShell/Sidebar/TopBar/ProcessSelector) + cross-cutting 3 (ReconcilePanel/MetricVsThreshold/ConsequencePanel) + case 3 (DocumentViewer/FieldActionModal/LifecycleStepper) + shared 5 (StatusBadge/MetaChip/MiniTrend/ReasonDialog/PrototypeModeLabel) + lib 3 (cn/status-tones/reconcile-display) + mock 10 + types。
- **DORMANT = 23** (active 参照 0):
  - shared 17: ActorBand / BusinessApprovalChip / DetailDrawer / DiffPreviewBlock / DisabledAction / **Disclosure** / EmptyState / ErrorState / FilterChip / HypothesisChip / LoadingState / MetadataStrip / NextActionStrip / PageFooter / PageHelpDisclosure / ScreenPlaceholder / TrustLevelBadge
  - lib 5: **actor-mapping** / elapsed / knowledge-labels / sendback-categories / show-internal
  - pages 1: placeholders

> 申し送りの「6 本」は過小。実態は 23 本。Disclosure (off-token) / actor-mapping (#635BFF) も **dormant** のため、tokenize ではなく quarantine で解消する。

## 2. Gate Contract (対象 = active source のみ、`src/legacy` は常に対象外)

| ID | ルール | 判定 |
|----|--------|------|
| R1 | off-token hex 0 | active `.tsx/.ts` に `#[0-9a-fA-F]{6}` literal 無し (§3 例外除く) |
| R2 | token-外 Tailwind 0 | `bg-white` / `bg-black` / `(slate\|gray\|zinc\|neutral)-[0-9]` / `rgba(` 無し (§3 例外除く) |
| R3 | status→tone SSOT | `lib/status-tones.ts` resolver 経由のみ。画面ローカル tone-map 再宣言 0 |
| R4 | icon = lucide のみ | inline `<svg>` 0、Icon suffix 統一 |
| R5 | 内部語非露出 | 突合 / 正規化一致 / OCR raw / staging / cron / skeleton / confidence / `(mock)` を業務 UI に出さない (§3 例外除く) |
| R6 | chrome 一貫 | nav 6 grouped、soft-fg regime (`text-{amber,emerald,red}-{700+}` 直書き 0) |

**判定方法**: active set (§1) のみに grep。**コメント行は除外**、**UI 到達文字列のみ**を違反とする。

## 3. 許容例外表 (false positive を gate から除外)

| 例外 | 範囲 | 理由 |
|------|------|------|
| hex literal | `src/index.css` の `@theme` token 定義のみ | token SSOT。component 側 hex は禁止のまま |
| token 名 / 内部語のコメント言及 | 全 active file のコメント | 説明文 (「OCR は使わない」等)。UI 非出力 |
| `text-white` / `text-white/NN` / `bg-white/NN` | **on-primary / on-fg surface** (`bg-[var(--color-primary)]` / `bg-[var(--color-fg)]` 上の前景色・装飾) | dark/primary 面の前景に token が無い。button/CTA/slate tone/stepper 全画面で canonical |
| `confidence` / action code (`ai_input` 等) | **Observatory 証跡台帳 view + `mock-observatory.ts` `LedgerEvent` のみ** | 監査 export schema (canonical-export §監査メモ 例外)。業務 view は型で非露出 |
| `番地表記正規化ルール` | KB 項目名 (`mock-observatory`/`mock-case-detail`) | KB 正式名 (正規化ルールという domain 用語)。status enum「正規化一致」の内部語 leak とは別 |
| `data/types.ts` の `confidence` / `staging*` field・`normalized_match` enum | データ層 type 定義 | UI render でなくデータ契約。confidence は audit metadata (業務 UI 非表示)、UI ラベルは resolver (`reconcile-display`) + Observatory ledger 封じ込めで担保 |
| `src/legacy/*` | 全 | dormant 隔離先。gate 対象外 (tsconfig exclude 済) |

## 4. 4b 作業リスト (contract 適用結果)

### 4b-1 dormant quarantine (23 → `src/legacy/`)
§1 の dormant 23 本を `src/legacy/{components/shared,lib,pages}/` へ移動 (active 参照 0 を確認済、revivable)。`placeholders.tsx` 含む。移動後 build + active 参照 0 を再確認。

### 4b-2 active token 化 (実違反のみ、3 箇所)
| file:line | 現状 | 修正 |
|-----------|------|------|
| `PrototypeModeLabel.tsx:36` | tooltip `border-slate-200 bg-white text-slate-700` | `border-[var(--color-border)] bg-[var(--color-panel)] text-[var(--color-fg-muted)]` |
| `Sidebar.tsx:132` | mobile nav `bg-white/95` + `shadow-[...rgba(15,23,42,0.06)]` | `bg-[var(--color-panel)]/95` + token shadow or 既存 elevation token |
| `Hub.tsx:81` | on-primary `bg-white/15` (装飾 icon 背景) | **判断**: on-primary 装飾として §3 許容 (text-white と同類) か、`bg-[var(--color-primary-hover)]` 等に置換 |

> `text-white` 系 (全画面の primary button / mode toggle / stepper) は §3 例外で **修正不要**。

### 4c full gate / build
4b 後に R1-R6 を active set 全体で再走 (0 違反) + `npm run build` green。

### 4d a11y + baseline
- **Lighthouse は `package.json` 未収録** → 実行可否を先に確認。実行可なら a11y 90+、不可なら **代替 a11y smoke** (主要 view の aria/contrast/keyboard を Claude_Preview で確認) + **「Lighthouse 未実施」を明記**。
- `prototype/` baseline diff = 新規差分 0 (最終確認)。

## 5. 未解決の triage 判断 (user CR 待ち)
1. **dormant quarantine 範囲**: 全 23 隔離 (推奨、gate 単純化 + revivable) か、clean primitive (EmptyState/ErrorState/FilterChip/TrustLevelBadge 等) は components/ 残置か。
2. **Hub.tsx:81 `bg-white/15`**: on-primary 許容か tokenize か。
3. **`MetricVsThreshold.owner` prop**: 両 consumer 未使用 → spec contract として keep か remove か。
4. **`mock-*-detail.ts` の `import type` (data→component)**: 現状維持 (runtime 非結合) か `data/types.ts` へ移動か。
