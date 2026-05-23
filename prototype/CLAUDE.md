# prototype/CLAUDE.md — Day 11+ UI 実装ローカル SSOT

`backoffice-ai-v2` の UI prototype。Day 11 Step 3 で scaffold、Day 18 末に `9 画面 ALL 95% target equal` 仕上げ + マイクロインタラクションで完成。Visual direction = **Operational Premium Light** (Day 11 Step 1+2 で 4 AI converged、`docs/03-ui-prototype-design.md` §2.7 SSOT)。

## 基本方針

- **scope-out 厳守**: 実 LLM 呼び出し / Computer use / 外部接続 / 完全自動化 / 実 customer data / 実 PDF / 実規制 cite は実装しない。すべて mock data + AppContext で in-memory state。
- **JP-first UI**: UI / slide / docs / mock copy は日本語のみ。英語は技術固有名詞 (`React` / `Vite` / `Tailwind` / `AI` / `PDF` / `OCR` / `API` / `SLO` / `KPI`) のみ許可。
- **Component 名 leak 禁止**: `BusinessApprovalChip` 等の component 名を user-facing UI 文言に出さない。UI 表示文言は `docs/03` §2.7.4 の SSOT table に従う。

## 9 routes (exactly、`docs/03` §2.7.5 SSOT)

`src/App.tsx` で React Router v7 にて **exactly 9 page route** をマウント:

1. `Dashboard` — `/` または `/dashboard`
2. `Inbox` — `/inbox`
3. `CaseReview` — `/cases/:id`
4. `SendBackComment` — `/cases/:id/comment` (9 画面の 1 つ、CaseReview の子 detail route、**10 番目の独立画面ではない**)
5. `ProposalReview` — `/proposals/:id`
6. `AgentSettings` — `/agents/:id`
7. `AuditTrail` — `/audit`
8. `Metrics` — `/metrics`
9. `KnowledgeBrowser` — `/knowledge`

**10 番目の画面 (BusinessApprovalView route 化等) は禁止**。BusinessApproval は `demo/static-mocks/business-approval-view.html` (Day 20 起稿) として static mock のみ、React route 対象外。

## Operational Premium Light Design Token

`docs/03` §2.7.3 SSOT。実装は `src/index.css` の `@theme inline` で固定:

| Token | Value | 用途 |
| ----- | ----- | ---- |
| Background (shell) | `slate-50` (#F8FAFC) | AppShell base |
| Surface (panel) | white (#FFFFFF) | panel surface |
| Border (hairline) | (#E5E7EB) | panel separation primary tool |
| Primary | indigo (#635BFF) | CTA / status / focus |
| Success / citation high | emerald (#10B981) | compiled approved citation badge |
| Alert | amber (#F59E0B) | Alert chip / 関連手順更新 banner |
| Error / delete diff | red (#DC2626) | Alert critical / diff strikethrough |
| Radius (card) | 8px | panel / card |
| Radius (control) | 6px | button / input / chip |
| Font (en) | Inter | numeric / IDs / labels (technical) |
| Font (jp) | Noto Sans JP | 日本語 label / body |
| Font (mono) | JetBrains Mono | case_id / weight / version / timestamps |
| Density | medium-high | 24/32px grid、operational dashboard |
| Motion | 150-250ms | hover / focus / status transition |

**装飾要素 scope-out**: gradient mesh / glow / glassmorphism / 3D icon / illustration / large rounded (>8px) / cream-beige 背景 / dark mode は使わない (`docs/03` §2.7 規範)。

### Soft 背景上の foreground 規範 (Day 14 P1.5 C1)

`bg-{success,alert,error}-soft` (= `bg-emerald-50` / `bg-amber-50` / `bg-red-50` 等の soft 背景) と組み合わせる **foreground は必ず `text-[var(--color-*-soft-fg)]` token 経由**:

- `text-[var(--color-success-soft-fg)]` (= `#047857`、emerald-700 相当) — bg-success-soft の上
- `text-[var(--color-alert-soft-fg)]` (= `#78350f`、amber-900 相当) — bg-alert-soft の上
- `text-[var(--color-error-soft-fg)]` (= `#b91c1c`、red-700 相当) — bg-error-soft の上

**Tailwind palette `text-{amber|emerald|red}-{700|800|900}` の直接使用は禁止** (Day 14 P1.5 で 11 file / 31 occurrence sweep 済、`index.css` `@theme inline` の `--color-*-soft-fg` token を経由する)。`bg-*` / `border-*` Tailwind palette は今回 allow (Day 16-18 polish で再判定、`docs/day14-medium-fi-inventory.md` §4 SSOT)。

### Prop 命名規範 (Day 14 P1.5 C2)

意味軸の混在禁止。同じ component で複数 prop を使う場合、軸を分離:

- `tone`: 色 semantic (`'neutral' | 'primary' | 'success' | 'alert' | 'error'`)。StatusBadge / chip primitive 等で使う。Color name (amber/red 等) は禁止、必ず semantic
- `severity`: 深刻度 (`'caution' | 'severe'`)。Alert 系で使う。Day 14 P1.5 C2 で `CaseAlert.severity` を `'amber' | 'red'` から rename
- `status`: workflow state (CaseStatus / ProposalStatus 等 domain enum)
- `kind`: type / variant 区別 (例: `'banner' | 'inline'`)

Color name (amber/red) vs semantic (caution/severe) の混在は禁止 (C1 token 規範 + C2 prop 規範の合わせ技で防止)。

## Persistent Prototype Mode Label (必須、全画面)

AppShell header right に persistent pill を常時表示:

```
プロトタイプ表示 — 外部システム未接続 / 証跡はモック
```

- 色: muted (slate-100 background + slate-600 text)、警告色は使わない
- a11y: `role="status"` + `aria-label="prototype mode indicator"`
- hover で expanded tooltip: 「本 prototype は in-memory mock state です。永続化なし / 外部システム未接続 / 実顧客データ未使用 / 実規制 cite なし」

## Citation / Staging Governance (Plan v1.4 P0-1、`docs/03` §2.7.2)

UI 上で **絶対に守る**:

1. **`引用根拠 — 承認済みナレッジのみ`** panel: `weight: high` (compiled approved) のみ表示。badge は emerald。
2. **`未承認ヒント — citation 対象外`** panel: `weight: low` / `medium` (staging) のみ表示、別 background tint (slate-50 panel inset)、各 entry に `citation 対象外` label 明示。badge は slate (muted)。
3. **`関連手順が更新されています`** alert banner: amber background、citation panel + staging hint とは視覚的に独立 (`docs/03` §6 Alert UI 適用範囲 1)。
4. `data_error` category は staging から除外 (`docs/04` §4.5)、`AuditTrail` 経由のみ。

## Case Lifecycle Stepper (CR R20 訂正)

CaseReview の header lifecycle stepper:

```
受付 → AI 処理 → 入力者確認 → 承認者承認 → 反映 (current step は indigo dot + font-semibold で UI 表示、`LifecycleStepper.tsx` SSOT)
```

**`手順承認` は current case stepper に含めない** (手順承認は別 flywheel / Proposal loop、`docs/02` §3 SSOT)。`docs/03` §6 Alert UI 適用範囲 3 の Audit Trail 内で別 entry point として表示。

## Mock Data 規範

- **active workflow only**: UC-BO-01 (法人住所変更) + UC-BO-02 (口座開設書類完備チェック) のみ。
- **国際送金 (restricted) は UI / Dashboard カード化なし** (`docs/00` §2.1)。
- **具体閾値の数値は出さない**: 高額閾値 exact (具体数値含む) は mock data / UI / active instruction に出さない (boundary pack 内部のみ、`workflows/international-transfer-boundary/BOUNDARY.md` §2 + `_meta.yaml` `restricted_conditions`)。
- **Tier 3 規制語 exact list は出さない**: 具体 list は `docs/prior-art-map.md` 参照、UI / mock copy には category 表現「Tier 3 規制語」も出さない。
- **KPI / SLO 閾値**: 表示時は必ず `[仮説 / 要検証]` ラベル付き、Phase 1 hypothesis 明示。
- **citation = compiled approved のみ**: `mock-knowledge.ts` で `weight: high` の compiled のみ citation 候補に使用、`low` / `medium` の staging は staging hint のみ。

## Directory Structure (Day 11 Step 3)

```
prototype/
├── CLAUDE.md (本 file)
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── src/
│   ├── main.tsx          # entry
│   ├── App.tsx           # Router + 9 routes
│   ├── index.css         # Tailwind v4 + @theme inline
│   ├── components/
│   │   ├── shell/        # AppShell 構造 (AppShell / Sidebar / TopBar)
│   │   ├── case/         # CaseReview-specific (AddressDiffBlock / EvidenceTimeline / CitationPanel / StagingHintPanel / RelatedRuleAlert / BusinessApprovalChip / ConfidenceBar / StatusBadge / LifecycleStepper / Sparkline)
│   │   └── shared/       # cross-page 共通 (PrototypeModeLabel + 将来 Button / Badge / Card / etc.)
│   ├── pages/            # 9 page component
│   │   ├── Dashboard.tsx
│   │   ├── Inbox.tsx
│   │   ├── CaseReview.tsx
│   │   ├── SendBackComment.tsx
│   │   ├── ProposalReview.tsx
│   │   ├── AgentSettings.tsx
│   │   ├── AuditTrail.tsx
│   │   ├── Metrics.tsx
│   │   └── KnowledgeBrowser.tsx
│   ├── data/             # 5 mock data file
│   │   ├── mock-cases.ts
│   │   ├── mock-knowledge.ts
│   │   ├── mock-agents.ts
│   │   ├── mock-audit.ts
│   │   └── mock-metrics.ts
│   └── lib/
│       └── cn.ts         # className utility (clsx + tailwind-merge)
└── public/
```

## Day 11-18 phase gate (`docs/_PROGRESS.md` §2.6 SSOT)

| Phase | 完了 gate |
| ----- | -------- |
| Day 13 末 | 9 routes 動作 + low-fi wireframe + TypeScript compile pass + 9-field Screen Card 整合 |
| Day 15 末 | 9 画面 ALL に design token 適用 + visual smoke OK + Prototype mode label 実装済 |
| Day 18 末 | 9 画面 ALL 95% target equal + マイクロインタラクション + Lighthouse a11y 90+ |

## 親 SSOT へのリンク

- 親 CLAUDE.md: `../CLAUDE.md` (project-wide 規範、Tier 1/2/3 語彙、scope-out、JP-only 原則)
- UI design SSOT: `../docs/03-ui-prototype-design.md` (9 画面 Screen Card + Operational Premium Light §2.7 + AiProposalPanel Alert UI + Prototype mode label + Staging UI pattern)
- Knowledge pipeline: `../docs/04-knowledge-pipeline.md` (Staging usage rules + 5-category routing + Staging lifecycle + Audit event model)
- Approval model: `../docs/02-approval-model.md` (3 層承認 + Matrix RACI + 9.8 Role × 画面 access matrix)
- Metrics: `../docs/05-metrics-and-gates.md` (SLO 仮値表 + 4 KPI multi-criteria 仮説 gate + 7 KPI + 9 KRI)
- Session 4 narrative: `../docs/06-session4-narrative.md` (8 slide + Demo Chapter 1/2 message spine)
- Visual direction reference: `../docs/design-references/day-11-visual-direction-lock/` (3 PNG mockup、Day 11 Step 1 成果物)
