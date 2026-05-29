# Observatory — Internal Spec

## Page identity

| 項目 | 値 |
|---|---|
| 旧 mapping | `prototype/src/pages/AuditTrail.tsx` + `Metrics.tsx` + `KnowledgeBrowser.tsx` (統合) |
| 新 route | `/observatory?tab=audit|metrics|knowledge` (Sidebar nav `観測`) |
| typology | A (Operations Hub、3-tab、tab 内側で 3-tier Headline/Drill/Diagnostic) |

## Goal

監査者 / Agent 設定担当者 / 業務責任者が 1 画面 3-tab で監査 / メトリクス / ナレッジを観察、context switch なし。

## Primary Action (tab 連動、各 tab 1 つ)

| tab | PrimaryAnchor CTA |
|---|---|
| audit | "全期間を見る" (L4 page-level filter で expand) |
| metrics | "期間切替" |
| knowledge | "検索" |

## Mechanical metric (target)

| Metric | 旧 3 画面合計 | 新 Observatory |
|---|---|---|
| 画面数 | 3 (Audit / Metrics / Knowledge) | **1 (3-tab)** |
| 共通 chrome 重複 | 3 別 Sidebar / TopBar 切替 | **共通 chrome 維持、tab 切替で content swap** |
| Layout variant | 3 別 layout (timeline / 4 section / list) | **A typology 3-tier (Headline / Drill / Diagnostic)、各 tab 共通** |
| Filter strip | 各画面別 chip | **共通 3 chip pattern (期間 / 業務 / actor or weight)** |

## Layout 詳細

### Header (sticky)
- breadcrumb "観測"
- h1 "観測"
- chip × 1 (tab 連動: event 数 / 期間 / snippet 数)
- Sticky Tab strip 3 (audit / metrics / knowledge)

### Body (tab 連動 content)

#### Tab 1: audit
- Filter strip (3 chip)
- Timeline (3 col: timestamp / actor / action + diff)
- L3 Disclosure: filter 追加

#### Tab 2: metrics
- Headline 4 KPI gate (sparkline 必須)
- Drill 9 KRI grid (3 col)
- L3 Disclosure: Trends / aux metrics

#### Tab 3: knowledge
- Filter strip (3 chip、weight = compiled approved 固定)
- Citation governance banner (L1)
- Snippet list

### Footer
- tab 連動 caption (1 文 only)

## research-compounder 違反対応

- **Enterprise SaaS IA** (5-9 primary nav): 旧 Sidebar 8 nav に Audit / Metrics / Knowledge 3 nav 並ぶ → 新 Sidebar 5 nav に集約、Observatory tab で context switch なし
- **AI-native HIL Approval UI** (actor-separated audit log): audit tab で agent / human / system の 3 col timeline 明示
- **Executive Dashboard Layout** (3 layer): metrics tab で Headline 4 KPI / Drill 9 KRI / Diagnostic Trends の 3-tier 適用

## Charter 適用

- One-Glance Hierarchy: tab 内側で Headline (4 KPI gate / Citation banner / 直近 event) を viewport 上部に
- Progressive Disclosure: Trends / aux metrics / event 種別 filter / weight semantics を L3
- Action Proximity: Filter strip → 直下 Timeline / KPI / Snippet list
- State Transparency: hedge chip 1 個 (Header) + 4 KPI 各 sparkline + KRI state badge
- Subtract before Adding: 旧 3 画面 → 1 画面 3 tab
- Make the State Visible: KRI state badge (normal / caution / breach) で gate 可視
- Signal over Ornament: ActorBand 3 色 (agent / human / system) は semantic
- Invest in the Smallest Thing: tab transition 200ms fade、KPI sparkline 80x24、timestamp mono tabular

## Phase 1A pilot 後 Step 2.6 patch 想定

- 3 tab の Claude Design 表現方法 (1 design file 内側で tab swap or 3 別 design)
- Filter strip の chip 3 個共通化が tab 別に成立するか
- audit tab の 3 col timeline (actor-separated) が cluttering せず読めるか
- metrics tab の Headline 4 + Drill 9 = 13 数値が 1 viewport で過剰でないか
