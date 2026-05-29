Requested output style: low-fi wireframe sketch (mono color, basic shapes, gray scale, placeholder text 可)
(**New Session 作成時に "Wireframe" mode を選んでから本 prompt を paste**してください — Claude Design UI に固定 mode pill あり、Hub pilot で確認済)

# Page: Hub (Operations Overview)
Typology: A (Operations Hub、3-tier: Headline / Drill / Diagnostic)
Goal: 入力者が「次に処理すべき案件」を 3 秒以内に判断し開く

## Layout

### Header (sticky top、min-height 88px)
- breadcrumb: "ハブ"
- h1: "ハブ"
- chip × 1 (件数のみ): "案件数 13"
- 右端 hedge chip (page-level): "[仮説 / 要検証]" (1 つ、全画面共通 pattern)
- (NG: 注意 chip / 承認者承認待ち chip など chip 2 個目以降は禁止)

### PrimaryAnchor strip (Header 直下、alert-soft tint 背景、CTA primary indigo)
- label: "次に処理すべき案件"
- summary: "CASE-2026-0142 (法人住所変更 / 経過 03:24:15)"
- CTA: "開く" (primary、indigo #635BFF)
- (NG: 他に primary anchor を置かない、業務 card への CTA も demoted text-link)

### Body — Hub typology = Headline + Drill + Diagnostic 3 tier

#### Headline tier (3 KPI card 横並び、actionable のみ、各 card に sparkline placeholder)
1. **注意あり案件**: 4
   - sub: "差戻し対応"
   - background: alert-soft
   - sparkline: 7 day (placeholder で OK)
2. **SLA 3h 超**: 1
   - sub: "優先処理"
   - background: alert-soft
   - sparkline: 7 day
3. **承認者承認待ち**: 2
   - sub: "承認者へ催促"
   - background: primary-soft
   - sparkline: 7 day

(NG: 「案件総数」「反映済」など vanity metric を Headline に置かない。Diagnostic Disclosure 行き)

#### Drill tier (2 業務 card、1 行 4 element の compact row、card grid ではなく 1-liner)
- UC-BO-01 法人住所変更
  - 案件 8 / 注意 3 / 承認者承認待ち 1
  - sparkline placeholder (7 day 注意率)
  - text-link: "→ 開く" (primary)
- UC-BO-02 口座開設書類完備
  - 案件 5 / 注意 1 / 承認者承認待ち 1
  - sparkline placeholder
  - text-link: "→ 開く"

(NG: 各業務 card に breakdown 5 行 / chip 多数 / state badge / CTA button は置かない、すべて L3 Disclosure 行き)

#### Diagnostic tier (Disclosure、default closed)
- toggle 文言: "詳細集計を見る"
- 中身 (collapsed default):
  - 旧 Cockpit 5 KPI のうち vanity 2: 案件総数 13 / 反映済 (本日) 2
  - 業務別 status breakdown:
    - UC-BO-01: AI処理中 2 / 入力者確認待ち 3 / 再処理中 1 / 承認者待ち 1 / 反映済 1
    - UC-BO-02: AI処理中 1 / 入力者確認待ち 2 / 再処理中 0 / 承認者待ち 1 / 反映済 1
  - (optional) 業務オペレーション動線 5 button shortcut (旧 Workflow lane を Disclosure 内に隠す)

### Footer (sticky bottom)
- caption 1 文 only: "業務カード・KPI は画面内モック状態からの集計"
- (NG: status counter / action button / 2 つ目の caption は置かない)

## Data (mock 5 件 inline)
- CASE-2026-0142 / 法人住所変更 / 経過 03:24:15 / 注意 2 / 入力者 山田太郎
- CASE-2026-0138 / 法人住所変更 / 経過 02:11:00 / 注意 0 / 入力者 佐藤花子
- CASE-2026-0135 / 口座開設書類完備 / 経過 01:45:32 / 注意 1 / 入力者 鈴木一郎
- CASE-2026-0131 / 法人住所変更 / 経過 00:58:14 / 注意 0 / 入力者 山田太郎
- CASE-2026-0128 / 口座開設書類完備 / 経過 00:30:45 / 注意 1 / 入力者 田中由美

## Visual constraint (design system is already registered, key tokens re-stated for safety)
- Canvas: slate-50 #F8FAFC
- Panel: white #FFFFFF + 1px hairline #E5E7EB
- Primary: indigo #635BFF (CTA / focus)
- Alert soft bg: #FFFBEB, alert soft fg: #78350F
- Primary soft bg: #EEF2FF, primary fg: #635BFF
- Radius: card 8px / control 6px / chip 4px
- Typography: Inter + Noto Sans JP + JetBrains Mono (numeric は tabular)
- Density: medium-high (24/32px grid)
- JP-only copy
- NG decoration: gradient mesh / glow / glassmorphism / 3D icon / illustration / cream-beige 背景 / dark mode

## Chrome (全画面共通、Hub も適用)
- Sidebar (left 224px): 5 nav (ハブ / 受信トレイ / AI 提案レビュー / Agent 設定 / 観測)、ハブ active
- TopBar: Search silhouette (cursor-default) + Notification (static) + PrototypeModeLabel pill (文言「プロトタイプ表示 — 外部システム未接続 / 証跡はモック」) + UserMenu placeholder
- Bottom mobile nav: 5 nav 同じ

## Anti-pattern (旧 prototype Dashboard で直したい点)
- 旧: NextActionStrip + 業務 card 2 + Workflow lane 5 button = primary action 3 並列 (8 entry-point)
  → 本 Hub では PrimaryAnchor 1 本に集約、業務 card は demoted text-link、lane は Disclosure 行き
- 旧: Cockpit 5 KPI に vanity (案件総数 / 反映済) → 本 Hub では Headline 3 actionable のみ、vanity は Diagnostic Disclosure
- 旧: 業務 card 1 つに 11 element (chip + 3 数値 + 5 breakdown + sparkline + CTA)
  → 本 Hub では 4 element 1-liner (workflow 名 + 3 数値 + sparkline、CTA は text-link)
- 旧: hedge `[仮説 / 要検証]` が画面内 3 surface 散在
  → 本 Hub では PageHeader 1 chip に集約

## Acceptance check (生成後 visual judge、5 個 binary)
- [ ] Header chip は 1 つ (案件数 13)、hedge chip は 1 つ別
- [ ] PrimaryAnchor strip は 1 本 (CTA は 1 つ「開く」)
- [ ] Headline KPI card は 3 個 (注意 / SLA / 承認者待ち)、vanity (案件総数 / 反映済) は Headline にない
- [ ] Diagnostic Disclosure は default collapsed (vanity / breakdown / lane が初期表示で見えない)
- [ ] Footer は caption 1 文 only (status counter / action button なし)
