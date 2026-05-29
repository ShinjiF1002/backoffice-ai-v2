# Design System Spec — Operational Premium Light (Step 1 paste 用)

> 以下を Claude Design の design system spec として恒久登録してください (project 全体で全画面に自動適用される token / typography / chip / density / 装飾禁止 / chrome を定義します)。

---

## 1. Color tokens (semantic)

### Surface
- **canvas** (shell 背景): `#F8FAFC` (slate-50)
- **panel** (card / drawer 等の panel 背景): `#FFFFFF` (white)
- **panel-inset** (panel 内の inset block): `#F1F5F9` (slate-100)
- **border** (1px hairline、panel 分離の primary tool): `#E5E7EB`
- **border-strong** (強調 border): `#CBD5E1`

### Foreground (text)
- **fg** (main body): `#0F172A` (slate-900)
- **fg-muted** (secondary): `#64748B` (slate-500)
- **fg-subtle** (tertiary、placeholder): `#94A3B8` (slate-400)

### Primary
- **primary**: `#635BFF` (indigo)
- **primary-hover**: `#4F46E5` (indigo-600 強)
- **primary-fg** (primary 背景上の文字): `#FFFFFF`
- **primary-soft** (background-soft 用): `#EEF2FF`

### Semantic state
| Tone | Solid | Solid-fg | Soft (bg) | Soft-fg (text on soft) |
|---|---|---|---|---|
| success | `#10B981` | `#FFFFFF` | `#ECFDF5` | `#047857` |
| alert | `#F59E0B` | `#FFFFFF` | `#FFFBEB` | `#78350F` |
| error | `#DC2626` | `#FFFFFF` | `#FEF2F2` | `#B91C1C` |

> **規範**: `bg-{success/alert/error}-soft` の上の文字色は必ず `*-soft-fg` token を経由。Tailwind palette の直接使用 (`text-amber-700` 等) 禁止。

### Diff (compare 用)
- **diff-add (foreground)**: `#10B981`、**diff-add (background)**: `#D1FAE5`
- **diff-del (foreground)**: `#DC2626`、**diff-del (background)**: `#FEE2E2`

---

## 2. Radius

- **card** (panel / card): `8px`
- **control** (button / input / chip outline): `6px`
- **chip** (status badge): `4px` ← StatusBadge 専用

---

## 3. Typography

### Font stack
- **sans (default)**: `'Inter', 'Noto Sans JP', system-ui, sans-serif`
- **mono (numeric / IDs / timestamps / weight / version)**: `'JetBrains Mono', 'SF Mono', Menlo, Consolas, monospace`

### Numeric cadence
- `font-variant-numeric: tabular-nums` を numeric 表示 (案件 ID / 数値 / 経過時間 / version) に必ず適用
- JP には `font-feature-settings: 'palt' 1` (proportional alternate widths)

### Scale (sizes)
| Role | Size | Weight |
|---|---|---|
| h1 (page title) | 18px (text-lg) | 600 (semibold) |
| h2 (section) | 14px (text-sm) | 600 |
| h3 (sub-section) | 12px (text-xs) | 500-600 |
| body | 13px (text-[13px]) | 400 |
| caption / meta | 11px (text-[11px]) | 400-500 |
| chip / badge | 10-11px | 500 |
| mono numeric | 11-12px | 400-500、tabular |

---

## 4. Chip taxonomy (3 系統、混在禁止)

| Component | Radius | Border | Background | 用途 |
|---|---|---|---|---|
| **StatusBadge** | 4px | なし | tone solid fill | workflow status (fill state) |
| **FilterChip** | 6px | `1px border` | white / primary-soft | filter 切替 (outline interactive) |
| **MetaChip** | 6px | なし | `slate-100` / tone-soft | 非インタラクティブ meta 情報 |

---

## 5. Layout

- **PageHeader min-height**: `88px` (sticky top、全画面共通)
- **Body container**: full-width + `p-4` (form 中心画面のみ inner `max-w-3xl` 例外)
- **Grid**: 24/32px のリズム、density medium-high
- **Sticky top**: PageHeader (`top-0 z-30`)
- **Sticky bottom**: PageFooter (`bottom-0`)

---

## 6. Density

- **medium-high** を default
- 行間 `leading-relaxed` (1.625)、見出しは `tight` (1.25)
- card 内 padding: `p-4` ~ `p-5`、行 padding (table cell): `px-3 py-2`
- icon size: `h-3 w-3` (chip) / `h-4 w-4` (nav / button)

---

## 7. Motion

- 150-250ms transition (hover / focus / status / Disclosure expand)
- easing: `cubic-bezier(0.4, 0, 0.2, 1)` (Material standard)
- `prefers-reduced-motion: reduce` を honor、motion event 数は画面 tier ≤5 (Operations Hub)

---

## 8. 装飾禁止 (anti-pattern list)

以下は絶対に使わない:

- gradient mesh / radial gradient
- glow / outer glow / inner glow
- glassmorphism (frosted glass / backdrop-filter blur)
- 3D icon / isometric illustration
- cream-beige / warm 背景 (`#F4EEE3` 系)
- 大きい rounded (> 8px)
- dark mode (本 system は light-only)
- icon background as decoration (icon は意味伝達のみ)

---

## 9. 全画面共通 chrome

### Sidebar (left rail、6 nav grouped、SSOT = `ia-overview-v2.md`)

グループ見出し付き 6 項目 (chrome.jsx で確定済の構造):

- ハブ — `/` (Hub)
- ─ 処理 ─
  - 受信トレイ — `/cases` (案件一覧 master)
  - 承認待ち — `/approvals` (承認者 queue)
- ─ 改善 ─
  - AI 提案レビュー — `/proposals` (提案一覧→詳細)
  - Agent 設定 — `/agents` (一覧→詳細)
- ─ 監視 ─
  - モニタリング — `/observatory` (旧「観測」、内部名 Observatory)

CaseDetail (`/cases/:id`) は 案件一覧 row click から navigate、sidebar に非表示。
> nav の SSOT は `ia-overview-v2.md` §2。旧「5 nav / `/queue`」記述は廃止 (Contract Freeze)。
Sidebar 上部: Brand "Backoffice AI" + "v2 prototype" tag。
Sidebar 下部: User menu (山田太郎 / 入力者 role)。

### TopBar (sticky top of main area)
- Left: Search silhouette (cursor-default、focus 不可、aria-hidden)
- Right: Notification icon (static、aria-hidden) + **PrototypeModeLabel pill** + UserMenu (placeholder)

### PrototypeModeLabel (固定表示、全画面共通)
- Pill 色: `bg-slate-100` + `text-slate-600` (muted、警告色禁止)
- 文言: `プロトタイプ表示 — 外部システム未接続 / 証跡はモック`
- hover/focus tooltip: `本プロトタイプはメモリ上のモック状態です。永続化なし / 外部システム未接続 / 実顧客データ未使用 / 実規制の引用なし`

---

## 10. JP-only 原則

- UI / slide / docs / mock copy はすべて日本語
- 英語 string は bug、例外は技術固有名詞 (`React` / `Vite` / `Tailwind` / `AI` / `PDF` / `OCR` / `API` / `SLO` / `KPI` 等) のみ
