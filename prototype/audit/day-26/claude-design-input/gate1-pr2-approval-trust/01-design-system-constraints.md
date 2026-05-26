# Operational Premium Light SSOT (Claude Design 投入用、CLAUDE.md §2.7 抜粋)

## Project context

backoffice-ai-v2 prototype = banking BO (back-office) HIL system、JP-only UI、Operational Premium Light design system。Banking 業務の信頼性を優先する **restraint pattern** (装飾抑制方向)、SaaS marketing aesthetic ではない。

## Design Token (固定、変更禁止)

| Token | Value | 用途 |
|---|---|---|
| Background (shell) | slate-50 (#F8FAFC) | AppShell base |
| Surface (panel) | white (#FFFFFF) | panel surface |
| Border (hairline) | (#E5E7EB) | panel separation |
| Primary | indigo (#635BFF) | CTA / status / focus |
| Success / citation high | emerald (#10B981) | compiled approved badge |
| Alert | amber (#F59E0B) | Alert chip / 関連手順更新 |
| Error / delete diff | red (#DC2626) | Alert critical / diff strikethrough |
| Radius (card) | 8px |
| Radius (control) | 6px |
| Radius (chip/badge) | 4px (StatusBadge のみ) |
| Font (en) | Inter |
| Font (jp) | Noto Sans JP |
| Font (mono) | JetBrains Mono (case_id / weight / version / timestamps) |
| Density | medium-high (24/32px grid、operational dashboard) |
| Motion | 150-250ms (hover / focus / status transition) |

## 装飾要素 全禁止

以下は Operational Premium Light で **使わない**:

- gradient mesh / gradient background
- glow effect / shadow halo
- glassmorphism (backdrop-blur 等)
- 3D icon / illustration
- large rounded (>8px)
- cream-beige 背景
- dark mode
- AI brain / synapse 系 illustration
- emoji-heavy decoration

## Chip Taxonomy (3 系統、混在禁止)

| Component | Radius | Border | Background | 用途 |
|---|---|---|---|---|
| StatusBadge | 4px (rounded-[var(--radius-chip)]) | なし | tone 色 fill | workflow status 表示 |
| FilterChip | 6px (rounded-md) | あり (border border-*) | white / primary-soft | filter 切替 (outline interactive) |
| MetaChip | 6px (rounded-md) | なし | slate-100 / tone-soft | 非インタラクティブ meta 情報 |

## Soft 背景 + foreground 規範

`bg-{success,alert,error}-soft` の上の foreground は `*-soft-fg` token 経由:
- text-[var(--color-success-soft-fg)] (emerald-700 相当)
- text-[var(--color-alert-soft-fg)] (amber-900 相当)
- text-[var(--color-error-soft-fg)] (red-700 相当)

Tailwind palette `text-{amber|emerald|red}-{700|800|900}` 直接使用は禁止。

## JP-only 原則

UI copy は日本語のみ、英語は技術固有名詞 (`React` / `Vite` / `Tailwind` / `AI` / `PDF` / `OCR` / `API` / `SLO` / `KPI`) のみ許可。`案件承認 / 手順承認 / 設定承認 / 入力者 / 承認者 / Flywheel` は Tier 1 vocab で UI label にそのまま使用可。

## 既存 5 primitive (Day 19 v1.4 applied、rewrite 禁止)

以下 5 primitive は **既に実装済**、Claude Design が同等品を再提案するのは禁止 (`adjacent-to-Day19` rewrite 違反):

1. `HypothesisChip` (`components/shared/HypothesisChip.tsx`) — `[仮説 / 要検証]` hedge を section-level に集約
2. `Disclosure` (`components/shared/Disclosure.tsx`) — collapsible content wrapper
3. `DetailDrawer` (`components/shared/DetailDrawer.tsx`) — non-modal right drawer (480/560/640px)
4. `PageHelpDisclosure` (`components/shared/PageHelpDisclosure.tsx`) — page-level help expand
5. `NextActionStrip` (`components/shared/NextActionStrip.tsx`) — next-action prompt strip

これらは Claude Design output で **import + reuse** することは可、新規 primitive として再 design は禁止。新規 primitive は `DiffPreviewBlock` / `MetadataStrip` / `ActorBand` (F-2 + F-5 で新規実装予定)。

## CaseReview Lifecycle (5 step、変更禁止)

```
受付 → AI 処理 → 入力者確認 → 承認者承認 → 反映
```

current step は indigo dot + font-semibold で表示。`手順承認` は current case stepper に含めない (別 flywheel)。

## Citation / Staging Governance (4 rule、変更禁止)

1. **引用根拠** panel = `weight: high` (compiled approved) のみ、emerald badge
2. **未承認ヒント** panel = `weight: low/medium` (staging) のみ、slate-50 panel inset + `citation 対象外` label 明示、slate badge
3. **関連手順アラート** banner = amber background、citation/staging とは視覚独立
4. `data_error` category は staging から除外 (AuditTrail 経由のみ)

## Mock Data 規範

- active workflow: UC-BO-01 (法人住所変更) + UC-BO-02 (口座開設書類完備) のみ
- 国際送金は UI 化なし
- 具体閾値の数値は出さない (boundary pack 内部のみ)
- Tier 3 規制語 exact 禁止
- KPI/SLO は `[仮説 / 要検証]` ラベル必須
- citation = compiled approved のみ

## Body Container 規範

9 画面 outer は `<div className="space-y-4 p-4">` 統一。form 中心画面 (SendBackComment) のみ inner `<div className="mx-auto max-w-3xl">` で wrap。

## Page Header 規範

9 画面 header に `data-page-header` 属性 + `sticky top-0 z-30 min-h-[var(--height-pageheader)]` (88px)。
