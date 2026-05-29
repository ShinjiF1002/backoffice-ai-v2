# Operational Premium Light — Token Contact Sheet

> Step 1 の design-system.md と意図的に重複。Claude Design が token を確実に register するための再提示。

## Color swatches (semantic + hex)

### Surface
| Token | Hex | Description |
|---|---|---|
| canvas | `#F8FAFC` | shell 背景、slate-50 |
| panel | `#FFFFFF` | card / drawer 背景 |
| panel-inset | `#F1F5F9` | inset block、slate-100 |
| border | `#E5E7EB` | 1px hairline |
| border-strong | `#CBD5E1` | 強調 border |

### Foreground
| Token | Hex | Description |
|---|---|---|
| fg | `#0F172A` | main body text、slate-900 |
| fg-muted | `#64748B` | secondary、slate-500 |
| fg-subtle | `#94A3B8` | tertiary、slate-400 |

### Primary
| Token | Hex |
|---|---|
| primary | `#635BFF` |
| primary-hover | `#4F46E5` |
| primary-fg | `#FFFFFF` |
| primary-soft | `#EEF2FF` |

### Semantic state (4 token per tone: solid / solid-fg / soft / soft-fg)

| Tone | solid | solid-fg | soft | soft-fg |
|---|---|---|---|---|
| success | `#10B981` | `#FFFFFF` | `#ECFDF5` | `#047857` |
| alert | `#F59E0B` | `#FFFFFF` | `#FFFBEB` | `#78350F` |
| error | `#DC2626` | `#FFFFFF` | `#FEF2F2` | `#B91C1C` |

### Diff
| Token | Hex |
|---|---|
| diff-add (fg) | `#10B981` |
| diff-add (bg) | `#D1FAE5` |
| diff-del (fg) | `#DC2626` |
| diff-del (bg) | `#FEE2E2` |

## Radius
- card: `8px`
- control: `6px`
- chip: `4px` (StatusBadge 専用)

## Typography stack
- sans: `'Inter', 'Noto Sans JP', system-ui, sans-serif`
- mono: `'JetBrains Mono', 'SF Mono', Menlo, Consolas, monospace`
- numeric cadence: `font-variant-numeric: tabular-nums` を必ず適用
- JP: `font-feature-settings: 'palt' 1`

## Size scale
| Role | Size | Weight |
|---|---|---|
| h1 (page title) | 18px | 600 |
| h2 (section) | 14px | 600 |
| h3 (sub) | 12px | 500-600 |
| body | 13px | 400 |
| caption | 11px | 400-500 |
| chip / badge | 10-11px | 500 |
| mono numeric | 11-12px | 400-500 |

## Layout primitives
- PageHeader min-height: `88px` (sticky)
- Body container: full-width + `p-4`
- Form constraint inner: `max-w-3xl`
- Grid rhythm: 24/32px、density medium-high

## Motion
- duration: 150-250ms
- easing: `cubic-bezier(0.4, 0, 0.2, 1)`
- prefers-reduced-motion: honor、motion event ≤5 per page (Operations Hub)

## 装飾禁止 (anti-pattern)
gradient mesh / glow / glassmorphism / 3D icon / illustration / cream-beige 背景 / large rounded (>8px) / dark mode

## chrome
- Sidebar: 5 nav (ハブ / 受信トレイ / AI 提案レビュー / Agent 設定 / 観測)
- TopBar: Search silhouette (cursor-default) + Notification (static) + **PrototypeModeLabel pill**
- PrototypeModeLabel: `bg-slate-100 text-slate-600`、文言「プロトタイプ表示 — 外部システム未接続 / 証跡はモック」
