Requested output style: low-fi wireframe sketch (mono color, basic shapes, gray scale, placeholder text 可)
(**New Session 作成時に "Wireframe" mode を選んでから本 prompt を paste**してください — Claude Design UI に固定 mode pill あり、Hub pilot で確認済)

# Page: Queue (案件受信トレイ)
Typology: B (Master、Table + Drawer)
Goal: 入力者が「次に処理すべき案件」を table 上で 1 行 highlight として見つけ、Drawer で preview してから開く

## Layout

### Header (sticky, min-h 88px)
- breadcrumb: "受信トレイ"
- h1: "受信トレイ"
- chip × 1 (件数のみ): "13 件"
- 右端 hedge chip: "[仮説 / 要検証]" (page-level 1 つ)
- (NG: status counter chip / 並び順 selector を Header に置かない、L3 Disclosure 行き)

### PrimaryAnchor strip (Header 直下、alert-soft tint 背景)
- label: "次に処理すべき案件"
- summary: "CASE-2026-0142 (法人住所変更 / 経過 03:24:15、注意 2)"
- CTA: "開く" (primary)
- (この CTA を押すと該当 row の Drawer が開く、それから CaseDetail へ遷移)

### Body — Queue typology (Table + Drawer master-detail)

#### Table (full-width、5 column、recommended row は alert-soft tint highlight)
| 列 | 内容 | width |
|---|---|---|
| 案件 ID | mono tabular | ~140px |
| 業務 | text-xs | ~120px |
| 状態 + 経過 | timeline 圧縮表現 (status badge + 経過 mono、stacked or inline) + actor band icon prefix | flex-grow |
| 担当者 | ActorBand icon + 名前 | ~100px |
| 注意 | alert chip if alertCount > 0 | ~60px |

Row click → Drawer 右から slide-in (non-modal、background scrollable)、Drawer 内に "Open in CaseDetail" CTA。

(NG: 旧の 7 column 全部置かない、注意 column / chevron > column は alert column 内 or row 右端の icon に統合)

#### Drawer (row click 時、width 480px、右からスライド)
- 案件 ID + 業務 + status badge
- 経過 + 注意件数
- 主要 field 先頭 3 件 (label + value + 信頼度)
- 引用根拠 N 件 (compact)
- CTA: "案件レビューを開く" (primary、CaseDetail へ navigate)

### Footer (sticky)
- caption 1 文 only: "1 - 13 / 13 件 (合計)、フィルタ・並び順・一括操作は次の実装段階で対応"
- (NG: 5 status counter inline / bulk action button を footer に置かない、L3 Disclosure 化)

### L3 Disclosure
- 旧 filter chip 4 (業務 / 状態 / 担当者 / 経過時間)
- 旧 sort selector (受付順 ▾)
- 旧 bulk action 2 (一括承認 / 一括差戻し)
- toggle: "絞り込み・並び順・一括操作を見る"

## Data (mock 5 件 inline、Header 13 件のうち先頭 5)
- CASE-2026-0142 / 法人住所変更 / 入力者確認待ち / 経過 03:24:15 / 山田太郎 / ⚠️ 2 ← recommended highlight
- CASE-2026-0138 / 法人住所変更 / AI 処理中 / 経過 02:11:00 / 佐藤花子 / —
- CASE-2026-0135 / 口座開設書類完備 / 承認者承認待ち / 経過 01:45:32 / 鈴木一郎 / ⚠️ 1
- CASE-2026-0131 / 法人住所変更 / 入力者確認待ち / 経過 00:58:14 / 山田太郎 / —
- CASE-2026-0128 / 口座開設書類完備 / 差戻し / 経過 00:30:45 / 田中由美 / ⚠️ 1

## Visual constraint (key tokens re-stated)
- Canvas slate-50 / Panel white + 1px hairline #E5E7EB
- Primary indigo #635BFF / Alert-soft #FFFBEB + fg #78350F
- Radius card 8px / control 6px / chip 4px
- Inter + Noto Sans JP + JetBrains Mono (numeric tabular)
- Density medium-high
- NG: gradient mesh / glow / glassmorphism / 3D icon / illustration / dark mode

## Chrome (Hub と同じ)
- Sidebar 5 nav、"受信トレイ" active
- TopBar (Search silhouette + Notification + PrototypeModeLabel pill + UserMenu)

## Anti-pattern (旧 Inbox で直したい点)
- 旧: 7 column table → 新: 5 column (status + 経過を圧縮 timeline 化)
- 旧: filter chip 4 disabled が Header に並ぶ → 新: L3 Disclosure 行き
- 旧: footer に 5 status counter inline + 一括 action 2 disabled → 新: caption 1 文 + L3 Disclosure
- 旧: NextActionStrip と table が独立 → 新: PrimaryAnchor から該当 row の Drawer を開く動線

## Acceptance check (生成後 visual judge)
- [ ] Table column は 5 個 (案件 ID / 業務 / 状態+経過 / 担当者 / 注意)
- [ ] recommended row が alert-soft tint で highlight (CASE-2026-0142)
- [ ] PrimaryAnchor strip は 1 本 (CTA「開く」)
- [ ] Filter chip / sort selector / bulk action button は L1 から消えている (L3 Disclosure 内)
- [ ] Footer caption 1 文 only (status counter / action なし)
