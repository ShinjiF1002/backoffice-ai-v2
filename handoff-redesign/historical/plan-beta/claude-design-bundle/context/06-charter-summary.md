# Design Charter v1.0 — Summary (for Claude Design context)

> Source: `~/code/design/CHARTER.md` v1.0 (2026-04-18、4 rounds CR converged)
> 本 file は redesign 工程の philosophical foundation。

## 4 Component Layers (component 階層)

| Layer | 性質 | 例 |
|---|---|---|
| **Foundation / Design Language** | 色 / typography / shape / spacing / motion / shadow / icon / voice / multi-sensory。component を共通の DNA で繋ぐ | token、design system spec |
| **Structural / Content** | surface 大、画面中央常駐、primary attention、5 state (Ideal / Empty / Loading / Error / Partial) | Table / Form / Card / AppShell / Sidebar / Dialog |
| **Meso / Flow** | 時間軸の洗練、複数 moment / 画面が時間的に連なる、context 継承、Perceived Performance (Optimistic UI) | Wizard / Stepper / multi-step form / page transition |
| **Micro-Polish** | surface 小、signal density 高、optional だが safety device。8 軸 (micro-interactions / transient feedback / contextual help / state transitions / ambient polish / affordance clarity / progress communication / error prevention) | press scale / hover-lift / Toast / Tooltip / Skeleton / undo toast |

## 4 IA Principles (情報構成原則)

| 原則 | 内容 |
|---|---|
| **One-Glance Hierarchy** | 1 画面 1 primary message。ユーザの視線最初到達点 (above the fold、左上) に最重要メッセージ |
| **Progressive Disclosure** | Level 0 (KPI 数字) → Level 1 (クリック展開) → Level 2 (詳細 Sheet / page)、Level 2 を Level 0 に露出禁止 |
| **Action Proximity** | ラベル (状態説明) とアクション (button / link) を視覚的に隣接 |
| **State Transparency** | データ表示には鮮度 (いつのデータか) を必ず示す (last updated / period / live badge) |

加えて、priority 5 段階 (P0-P4) で page 種別ごとに「どの priority を何件入れるか」の予算が事前定義される。

- **Overview Dashboard**: P1 を 3-5 件 + P3 を 1-2 件
- **Settings**: P4 を 1 件のみ
- **Marketing Landing**: P1 を 1 件のみ

逸脱した情報過多は「豊富」ではなく「混乱」と認識される。

## 4 Design Principles (ethos、判断の最終参照先)

| 原則 | 内容 |
|---|---|
| **Subtract before Adding** | 何かを加える前に、既に置かれているものを減らせないか問う。新 signal 追加時に同時に古い signal を削除 |
| **Make the State Visible** | ユーザが自分の現在位置・操作可能性・処理状態を推測で知ることがないよう、すべての state を視覚化。Disabled なら理由、Loading なら進捗、Error なら recovery path |
| **Signal over Ornament** | 装飾のための装飾を避ける。すべての visual treatment は signal を運ぶ (色 = 状態、影 = 層、motion = 変化) |
| **Invest in the Smallest Thing** | 最小の要素 (button 一押し / tooltip 一行 / border 1px) に最も deliberate な注意 |

## 5 State (Structural / Content 層の普遍的 state)

全 component (Table / Form / Card / Chart / List) で扱う 5 state:

1. **Ideal** — データ存在、理想的に流れている
2. **Empty** — 初回利用 / ゼロデータ / 条件一致なし
3. **Loading** — 非同期 fetch / 処理中
4. **Error** — fetch 失敗 / validation 失敗 / server error
5. **Partial** — 一部 widget 成功、他失敗 (graceful degradation: critical path の error は blocking、non-critical は静かに skip、error widget は retry 可能)

## 重要な Trade-off (緊張関係、redesign 判断時の参照軸)

| 軸 | 内容 |
|---|---|
| **Density ↔ Breathability** | Dashboard 高密度 vs Marketing 低密度、文脈で決める |
| **Expression ↔ Neutrality** | brand 色強調 vs semantic / neutral |
| **Delight ↔ Accessibility** | Motion / ambient polish vs reduced-motion / 認知負荷 |
| **Rich Polish ↔ Performance** | GlareSweep / BlurFade を 1000 行 table 全行 → 60fps 崩壊。ambient polish は flagship surface 限定 |
| **Consistency ↔ Context-adaptation** | 同 component 全画面一貫 vs context 別 variant |

## 本 redesign での Charter 適用

- **One-Glance Hierarchy** ← 1 画面 1 Primary Action 規範 (NextActionStrip 昇格)
- **Progressive Disclosure** ← L1/L2/L3/L4 段階規範 (旧 Cockpit 5 KPI → L3、業務 card breakdown → L3、Workflow lane → L3)
- **Action Proximity** ← PrimaryAnchor を Header 直下に sticky 配置、CTA inline
- **State Transparency** ← PageHeader 1 chip に hedge 集約、各 KPI に sparkline + delta
- **Subtract before Adding** ← 9 → 6 画面集約 (path β)、3 typology lock
- **Make the State Visible** ← LifecycleStepper sticky、Disclosure toggle 文言で内容明示
- **Signal over Ornament** ← 装飾禁止 list、color は semantic token のみ
- **Invest in the Smallest Thing** ← chip taxonomy 3 系統厳格、Disclosure transition 250ms、PrimaryAnchor strip 1px alert tint

## 本 redesign で意図的に**外した**もの

Charter は full spectrum (Foundation / Structural / Meso / Micro-Polish 4 層) を扱うが、本 Phase 0 では:

- **Foundation**: Operational Premium Light token は **keep** (Charter 適用先ではなく、redesign 対象ではない)
- **Structural / Content**: 6 画面 redesign の中心 (本 Phase 0 の scope)
- **Meso / Flow**: 部分 (PageShell skeleton + Disclosure transition 程度)
- **Micro-Polish**: 後段 (Phase 2 React 化以降、hover-lift / Toast / Skeleton は次 phase)
