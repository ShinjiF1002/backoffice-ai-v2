# Visual Reference — 旧 prototype 改善 narrative (high-level)

> **詳細 layout / element 位置 / ASCII diagram は** `upload-once/prototype-current-reference.md` **参照**。本 file は high-level な改善方針の narrative。

## 旧 prototype の認知負荷 3 問題 (再掲)

| 問題 | mechanical evidence |
|---|---|
| 文字が多すぎる | Dashboard 1 viewport で ~45 text token block、9 画面合計 3,861 行 |
| 一目で何をしたら良いかわからない | Dashboard に L1 primary action が 3 並列 (NextActionStrip / 業務 card 2 / Workflow lane 5 button = 8 entry-point) |
| 画面ごとレイアウト不統一 | 3 typology / 5 variant、PageHeader / Body / Footer 各画面ごと別ルール |

## 改善 4 軸

### 軸 1. 1 画面 1 Primary Action 規範

- 旧: Dashboard に 3 primary 並列、Inbox に NextActionStrip + Sort + Filter + Bulk action 並列
- 新: PrimaryAnchor 1 本 strip を Header 直下に sticky、CTA は 1 つ
- 旧 entry-point の 2 つ目以降は L3 Disclosure or sidebar / cmd menu

### 軸 2. 段階 Disclosure (L1-L4)

- 旧: Cockpit 5 KPI + 業務 card 11 element + Workflow lane 5 button が全部 L1 visible
- 新: L1 keep = Headline 3 actionable KPI + Drill 2 1-liner、L3 = vanity metric + breakdown + lane

### 軸 3. Typology lock (3 type、画面間一貫性)

- 旧: 9 画面で 3 typology / 5 variant (縦 section × 6 + table × 1 + 12-col × 2)、各 type 内も variation あり
- 新: A 型 (Operations Hub) × 2 + B 型 (Queue Master) × 1 + C 型 (Detail Workspace) × 3 で固定、PageShell primitive で skeleton 統一

### 軸 4. JP density (medium-high 維持、hedge SSOT 1 surface)

- 旧: hedge `[仮説 / 要検証]` が画面内 3 surface 散在 (Cockpit / sparkline label / footer)
- 新: PageHeader 1 chip に集約、L4 (Metrics page) だけ inline allow

## 6 画面ごとの改善 narrative

### Hub (旧 Dashboard)
- 旧: Cockpit 5 KPI + 業務 card 2 (各 11 element) + Workflow lane 5 button = 8 primary、45 token block
- 新: Headline 3 actionable KPI (注意あり / SLA 経過 / 承認者承認待ち) + Drill 2 1-liner 業務 card + Diagnostic Disclosure (vanity / breakdown / lane) = 1 primary、≤15 token block
- 改善幅: token block 45 → ≤15 (67% 削減)

### Queue (旧 Inbox)
- 旧: 7 列 table + filter chip 4 + bulk action 2 + footer 5 status counter
- 新: 5 列 table (案件 ID / 業務 / 状態 + 経過 timeline 圧縮 / 担当者 / →) + recommended row highlight + Drawer detail、filter は L3 Disclosure
- 改善幅: column 7 → 5、status chip 散在 → timeline 圧縮表現

### CaseDetail (旧 CaseReview + SendBackComment)
- 旧: 12-col grid + LifecycleStepper + Citation panel + Staging panel + Alert strip + Diff block、SendBackComment は別 route
- 新: 2-col DetailBody (primary 7/12 = AI 入力結果 + diff、aux 5/12 = lifecycle + citations + alerts、L3 = staging / pdf preview / evidence timeline)、差戻しコメントは同 page の section 切替
- 改善幅: 別 route → 同 page section、L1 element 厳選

### ProposalDetail (旧 ProposalReview)
- 旧: 12-col grid + Proposal title + 判定基準 + 元案件 + 未承認ヒント + 提案メタ (5 element) + Lifecycle stepper
- 新: 2-col DetailBody (primary = 提案 title + 判定基準 + 元案件 link、aux = 提案メタ compact、L3 = 未承認ヒント + meta 詳細)、業務責任者へ送付 CTA は status 連動
- 改善幅: meta 詳細を L3 へ移動

### AgentDetail (旧 AgentSettings)
- 旧: 4 section (trust progression / config / simulation / history)、4 KPI 進化要件 grid
- 新: 2-col DetailBody (primary = trust level current + config 3 行、aux = simulation snapshot + history compact、L3 = 4 KPI grid + 全 config history)
- 改善幅: 4 section → L1 2-col + L3、KPI grid を L3 へ

### Observatory (旧 AuditTrail + Metrics + KnowledgeBrowser)
- 旧: 3 別画面、各画面で別 layout (timeline / grid / list)、各画面 separately navigate
- 新: 1 画面 3 tab (`?tab=audit/metrics/knowledge`)、tab 内側で L4 (page-level pagination)、共通 filter strip
- 改善幅: 3 画面 → 1 画面 3 tab、context switch なし
