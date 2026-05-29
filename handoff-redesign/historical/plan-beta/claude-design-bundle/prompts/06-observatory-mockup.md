Requested output style: high-fidelity polished mockup (full color, real data render, design system applied)
(**新たな High Fidelity session を作成してから本 prompt を paste**してください — Claude Design UI に固定 mode pill あり、Hub pilot で確認済)
(design system は Project に登録済み (Step 1 で恒久 register)。**同 Project 内 Wireframe session で生成した同 page の wireframe を layout baseline として参照**してください — Claude Design は Project 共有 context で wireframe を継承します、再 attach 不要)

# Page: Observatory (3-tab 統合 hub) — polished mockup 化

## Polish 指示 (tab 別)

3 tab を 1 design file に同居させ、user が tab 切替で content swap される表現。各 tab の Body は以下:

### Tab 1: 監査証跡 (audit)
1. Filter strip (3 chip): 期間 / 業務 / actor、各 chip FilterChip outline tone
2. Timeline (3 col layout):
   - col1: timestamp mono (12px width 100px)
   - col2: ActorBand icon + actor label (Agent purple / Human emerald / System slate)
   - col3: action description + before-after diff (small text、diff badge 表示時 emerald/red)
3. event 25 件初期表示、scroll で append (pagination indicator は L3)

### Tab 2: メトリクス (metrics)
1. Headline tier 4 KPI card 横並び (Hub と同 pattern):
   - 各 card: 数値 large mono + sub-label + sparkline 7 day
   - sparkline mock 数値:
     - 承認率: [0.88, 0.90, 0.91, 0.93, 0.92, 0.92, 0.92]
     - 上書き率: [0.18, 0.15, 0.14, 0.13, 0.12, 0.13, 0.12]
     - Alert 率: [0.10, 0.09, 0.08, 0.09, 0.08, 0.08, 0.08]
     - 差戻し率: [0.07, 0.06, 0.06, 0.05, 0.05, 0.05, 0.05]
2. Drill tier 9 KRI grid (3 col):
   - 各 KRI compact card: 番号 + name + 現在値 mono + threshold mono + state badge
   - state: normal (slate) / caution (alert-soft) / breach (error-soft)
3. Trends / aux metrics は L3 Disclosure default closed

### Tab 3: ナレッジ (knowledge)
1. Filter strip (3 chip): 期間 / 業務 / weight (compiled approved 固定)
2. Citation governance banner (L1):
   - bg emerald-soft + Sparkles icon + text "ここに表示される knowledge は compiled approved のみ"
3. Snippet list (20 件初期表示):
   - 各 row: emerald badge "承認済" + title (sm semibold) + summary (1 行 truncate) + reference link + last_updated mono small

## 共通 polish

1. previous wireframe の 3 tab layout + Header chip 連動 + PrimaryAnchor 連動 + Body 連動 + Footer caption 連動 はそのまま保持
2. design system full 適用
3. Tab strip (sticky Header 下):
   - 3 tab 横並び、各 tab `px-4 py-2`、active = indigo border-bottom 2px + font-semibold + text-fg、inactive = text-fg-muted
   - tab click で content swap 200ms fade transition
4. Header chip 連動切替: audit = "event 124" / metrics = "対象期間 直近 7 日" / knowledge = "snippet 124"
5. PrimaryAnchor strip 連動 (audit = "全期間を見る" / metrics = "期間切替" / knowledge = "検索")
6. Footer caption 連動 (audit / metrics / knowledge で異なる文言)
7. PrototypeModeLabel pill TopBar 右、Sidebar "観測" active
8. micro-interaction:
   - Tab click content fade 200ms
   - Filter chip hover bg primary-soft
   - Disclosure expand 250ms

## Visual constraint re-stated

- Primary indigo / Citation emerald-soft / State semantic tones (success / alert / error)
- ActorBand color: Agent (purple/violet soft) / Human (emerald soft) / System (slate)
- Card radius 8px, control 6px, chip 4px
- Mono tabular for timestamp / KPI 数値 / case ID / threshold
- No decoration

## State coverage

- **Ideal**: 3 tab に各 content visible
- **Loading**: 各 tab content skeleton (event 5 行 / KPI 4 card / snippet 5 行)
- **Error**: tab content 取得失敗時 EmptyState (error) + retry
- **Empty**: filter 一致 0 件のとき EmptyState (filtered-empty)
- **Partial**: 一部 KRI / KPI が取得不能のとき、該当 card に "—" + small "取得不能" badge

## Acceptance check
- [ ] 3 tab strip が Header 下 sticky、active tab に indigo border-bottom + font-semibold
- [ ] Tab 1 audit: 3 col timeline (timestamp / actor / action+diff)、actor band 3 種で色分け
- [ ] Tab 2 metrics: Headline 4 KPI sparkline 実描画、Drill 9 KRI grid、Trends/aux Disclosure
- [ ] Tab 3 knowledge: citation governance banner emerald-soft + snippet 20 件 list
- [ ] Header chip / PrimaryAnchor / Footer が tab 連動切替
- [ ] PrototypeModeLabel pill が常時 visible
