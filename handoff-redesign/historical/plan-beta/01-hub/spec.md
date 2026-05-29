# Hub — Internal Spec (user 用 reference、Claude Design へ paste しない)

## Page identity

| 項目 | 値 |
|---|---|
| 旧 mapping | `prototype/src/pages/Dashboard.tsx` |
| 新 route | `/` (Sidebar nav `ハブ`) |
| typology | A (Operations Hub) |
| Phase 1A pilot 対象 | ✅ Yes (本画面のみ最初に pilot、観察結果を hub-pilot-findings.md に記録) |

## Goal (核 message)

入力者が画面開いた直後 (≤3 秒) に「次に処理すべき案件」を判断し、PrimaryAnchor CTA を 1 click で開ける。

## Primary Action (1 つ)

- **「次に処理すべき案件を開く」** — PrimaryAnchor strip CTA
- recommendedCase = `?demo=1` で固定 CASE-2026-0142、default は `alertCount > 0` で `parseElapsed` 最大の 1 件

## Mechanical metric (旧 → 新 target)

| Metric | 旧 Dashboard | 新 Hub (target) | gate |
|---|---|---|---|
| viewport 内 text token block | ~45 | **≤15** | 5 個以内の超過なら警告 |
| L1 primary action 数 | 3 並列 (NextActionStrip + 業務 card 2 + Workflow lane 5) | **1** (PrimaryAnchor のみ) | exact 1 |
| L1 KPI card 数 | 5 (Cockpit) | **3** (actionable のみ) | exact 3 |
| Disclosure 化対象 | なし | vanity 2 KPI + 業務 breakdown 5×2 + Workflow lane 5 | default closed |
| 業務 card element 数 | 11 / card | **4** (1-liner: workflow + 3 数値 + sparkline) | exact 4 |
| hedge surface | 3 surface 散在 | **1** (PageHeader 1 chip) | exact 1 |

## Layout 詳細

### Header (sticky, min-h 88px)
- L1: breadcrumb "ハブ"
- L1: h1 "ハブ"
- L1: chip × 1 (件数: 案件数 13)
- L2: hedge chip × 1 (PageHeader 右端「[仮説 / 要検証]」)

### PrimaryAnchor (sticky Header 直下、alert-soft tint background)
- label "次に処理すべき案件"
- summary "CASE-2026-0142 (法人住所変更 / 経過 03:24:15)"
- CTA "開く" (primary)

### Body — Hub 3-tier

#### Headline tier
- 3 KPI card 横並び (`grid-cols-3 gap-3`)
- 各 card: 数値 (large mono) + sub-label + sparkline (7 day, 80×24px)
- background: alert-soft / alert-soft / primary-soft

#### Drill tier
- 2 業務 card 1-liner row (`grid-cols-1 gap-2` or table-like rows)
- 1 row: workflow 名 + 3 数値 (案件 / 注意 / 承認者待ち) + sparkline + text-link "→ 開く"

#### Diagnostic tier
- Disclosure default closed
- 中身: vanity 2 KPI + 業務 breakdown 5×2 + workflow lane 5 button shortcut (旧 footer 動線)

### Footer
- caption 1 文: "業務カード・KPI は画面内モック状態からの集計"

## Data 依存

mock 5 件 (Header chip 件数 13、Headline 3 KPI 値、Drill 2 業務 card 数値、Diagnostic breakdown) は本 prompt 内 inline。実 mock data source は `prototype/src/data/mock-cases.ts` / `mock-metrics.ts` (Phase 2 で React 化時に取り込み)。

## Acceptance check (5 個、binary、Phase 1A pilot で user 判定)

- [ ] Header chip は 1 つ (案件数 13)、hedge chip は 1 つ別
- [ ] PrimaryAnchor strip は 1 本 (CTA は 1 つ「開く」)
- [ ] Headline KPI card は 3 個 (注意 / SLA / 承認者待ち)、vanity (案件総数 / 反映済) は Headline にない
- [ ] Diagnostic Disclosure は default collapsed (vanity / breakdown / lane が初期表示で見えない)
- [ ] Footer は caption 1 文 only (status counter / action button なし)

## research-compounder 違反対応

- **Executive Dashboard Layout** (Headline 3-5 actionable): 旧 Cockpit 5 (vanity 含む) → 新 Headline 3 actionable のみ
- **Enterprise SaaS IA** (card grid は visual 用途のみ): 旧業務 card grid → 新 1-liner row (table-like)
- **AI-native HIL Approval UI** (timeline 1 viewport): 旧 LifecycleStepper は CaseDetail へ、Hub では status を簡潔表現 (Drill 1-liner 内の 3 数値)

## Charter 適用

- One-Glance Hierarchy: PrimaryAnchor が画面左上 above-the-fold
- Progressive Disclosure: vanity / breakdown / lane を Disclosure default closed
- Action Proximity: PrimaryAnchor CTA は label / summary 直後 inline
- State Transparency: hedge chip 1 個で「仮説 / 要検証」、sparkline 7 day で trend
- Subtract before Adding: 旧 8 entry-point → 新 1 PrimaryAnchor + 2 demoted text-link
- Make the State Visible: KPI 3 個の background tone で urgency 表現
- Signal over Ornament: 装飾禁止 keep
- Invest in the Smallest Thing: chip 1 個 / hedge 1 個 / CTA hover transition 150ms

## Phase 1A pilot で観察すべき項目 (hub-pilot-findings.md に記録)

1. Claude Design UI に固定 mode pill (wireframe / mockup) があるか
2. 本 prompt 1 paste の文字数制限に当たるか
3. Acceptance check 5 個が visual で判定可能か
4. handoff bundle の取得が成立するか、file 構造はどうか
5. polished mockup の token 適用率
6. wireframe → mockup の継承 (previous wireframe in this conversation 参照) が成立するか
7. 02-06 prompt に必要な軽量修正点 (UI mode / 分割 / Acceptance 表現 / token 適用)
