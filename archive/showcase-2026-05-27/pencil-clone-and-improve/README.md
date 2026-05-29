# Pencil Clone & Improve — Backoffice AI v2 prototype 9 画面

> 既存 `prototype/src/**` は **zero-touch**。最新 dev server (npm run dev) から撮影した screenshot を基に Pencil で 9 画面を **structural clone** し、3 つの UX 問題 (文字過多 / 一目で次行動不明 / レイアウト) に対処する **改善案 (2-3 案 / 画面 = 20 案)** を per-screen で提示する reference set。

## Mission

user 指示:
1. 既存 prototype の画面 clone を Pencil MCP で全画面作成
2. その上で「文字が多すぎる」「一目で何をしたら良いかわからない」「画面レイアウトの問題」 に対処する改善案を作る
3. 既存 prototype は一切変更しない

## 構成

- **Phase A**: 最新 dev server (port 5181) から 9 画面の screenshot を撮影、画面構造を inventory
- **Phase B**: 各画面の structural clone を Pencil で構築 (`exports/clones/` × 9)
- **Phase C**: 3 問題に対処する改善案を per-screen で 2-3 案構築 (`exports/improvements/` × 20)

## 9 画面 clone × 改善案 一覧

各行: clone (左) + 改善案 (右、2-3 案)。1 列 = 1 frame、PNG をクリックで開く。

### R1 Dashboard

| | |
|---|---|
| **Clone (現状)** | [R1-dashboard.png](exports/clones/R1-dashboard.png) |
| **P1 Today's Action** | [R1-P1-todays-action.png](exports/improvements/R1-P1-todays-action.png) |
| **P2 Status Pulse** | [R1-P2-status-pulse.png](exports/improvements/R1-P2-status-pulse.png) |
| **P3 Personal Workspace** | [R1-P3-personal-workspace.png](exports/improvements/R1-P3-personal-workspace.png) |

### R2 Inbox

| | |
|---|---|
| **Clone** | [R2-inbox.png](exports/clones/R2-inbox.png) |
| **P1 Critical-first sort** | [R2-P1-critical-first.png](exports/improvements/R2-P1-critical-first.png) |
| **P2 Status Kanban** | [R2-P2-status-kanban.png](exports/improvements/R2-P2-status-kanban.png) |

### R3 CaseReview

| | |
|---|---|
| **Clone** | [R3-case-review.png](exports/clones/R3-case-review.png) |
| **P1 Decision-focused** | [R3-P1-decision-focused.png](exports/improvements/R3-P1-decision-focused.png) |
| **P2 Source vs Output** | [R3-P2-source-vs-output.png](exports/improvements/R3-P2-source-vs-output.png) |
| **P3 Single Question** | [R3-P3-single-question.png](exports/improvements/R3-P3-single-question.png) |

### R4 SendBackComment

| | |
|---|---|
| **Clone** | [R4-sendback-comment.png](exports/clones/R4-sendback-comment.png) |
| **P1 AI-suggested + numbered steps** | [R4-P1-ai-suggested.png](exports/improvements/R4-P1-ai-suggested.png) |
| **P2 3-step Wizard** | [R4-P2-3step-wizard.png](exports/improvements/R4-P2-3step-wizard.png) |

### R5 ProposalReview

| | |
|---|---|
| **Clone** | [R5-proposal-review.png](exports/clones/R5-proposal-review.png) |
| **P1 Diff-hero** | [R5-P1-diff-hero.png](exports/improvements/R5-P1-diff-hero.png) |
| **P2 Single Question** | [R5-P2-single-question.png](exports/improvements/R5-P2-single-question.png) |

### R6 AgentSettings

| | |
|---|---|
| **Clone** | [R6-agent-settings.png](exports/clones/R6-agent-settings.png) |
| **P1 Progress Roadmap** | [R6-P1-progress-roadmap.png](exports/improvements/R6-P1-progress-roadmap.png) |
| **P2 Tabbed Workspace** | [R6-P2-tabbed-workspace.png](exports/improvements/R6-P2-tabbed-workspace.png) |

### R7 AuditTrail

| | |
|---|---|
| **Clone** | [R7-audit-trail.png](exports/clones/R7-audit-trail.png) |
| **P1 Search + Date-grouped** | [R7-P1-search-grouped.png](exports/improvements/R7-P1-search-grouped.png) |
| **P2 Case-grouped (accordion)** | [R7-P2-case-grouped.png](exports/improvements/R7-P2-case-grouped.png) |

### R8 Metrics

| | |
|---|---|
| **Clone** | [R8-metrics.png](exports/clones/R8-metrics.png) |
| **P1 Goal-progress (KPI bars)** | [R8-P1-goal-progress.png](exports/improvements/R8-P1-goal-progress.png) |
| **P2 Trend-focused (spark per KPI)** | [R8-P2-trend-focused.png](exports/improvements/R8-P2-trend-focused.png) |

### R9 KnowledgeBrowser

| | |
|---|---|
| **Clone** | [R9-knowledge-browser.png](exports/clones/R9-knowledge-browser.png) |
| **P1 3-stage Kanban (未承認 / 確認済 / 承認済)** | [R9-P1-3stage-kanban.png](exports/improvements/R9-P1-3stage-kanban.png) |
| **P2 Compiled Library (承認済のみ)** | [R9-P2-compiled-library.png](exports/improvements/R9-P2-compiled-library.png) |

## 改善案の方向性 — 3 問題への対処

詳細は [issue-trace.md](issue-trace.md) 参照。

| 画面 | 改善案 | 文字削減 | 次の action 明確化 | レイアウト見直し |
|---|---|---|---|---|
| R1 | P1 Today's Action | hero に urgent case 集約 / cockpit 5 tile 削除 | 1 件のみ大型 + filled CTA | 5 section → 3 section |
| R1 | P2 Status Pulse | 状態別 6 tile に集約 / 案件オペ動線 削除 | SLA 超過 banner + 開く CTA | tile-strip 主体 + sparkline footer |
| R1 | P3 Personal Workspace | tab で「今やる/全体/トレンド」分離 / 自分タスクのみ default | top row #1 hero + 開く CTA | tab + queue + footer の 3 layer |
| R2 | P1 Critical-first | filter chips 「すべて」削除 / 状態文言 短縮 | top row 強調 + 開く CTA | 3 section (SLA超過 / 注意あり / 通常 折りたたみ) |
| R2 | P2 Status Kanban | テーブル列 5 → 3 / 経過 列 mono のみ | column header 自体が action | kanban (5 列 × n card) |
| R3 | P1 Decision-focused | hero diff 大型 + 4 accordion で残り情報 | 承認 → filled bottom | 1 hero summary + 4 accordion |
| R3 | P2 Source vs Output | 中央 column 削除 / 証跡は別画面 | 承認 + 差戻し sticky bottom | 2-column (原本 / AI 出力 並置) |
| R3 | P3 Single Question | metadata 全削除 / diff のみ + 信頼度 3 数値 | 「承認してよろしいですか?」 question framing | centered question + 2 CTA |
| R4 | P1 AI-suggested | 5 radio → 5 chip + AI 推測 1 件 | "Step 1 → Step 2" + 差戻しを記録 CTA | 縦 step layout |
| R4 | P2 3-step wizard | 5 radio reframe (action 言語) | step indicator 1/3 → 「次へ」 CTA | wizard (3 step × 1 step / page) |
| R5 | P1 Diff-hero | 3 column → 1 hero + 4 数値 + 2 accordion | 業務責任者へ送付 filled CTA | hero + accordion |
| R5 | P2 Single Question | proposal description 全削除 / diff のみ | 「更新してよろしいですか?」 + 2 CTA | centered question + meta strip |
| R6 | P1 Progress Roadmap | 5 領域 詳細 削除 / 4 KPI bar + 引き上げ申請 | 引き上げ申請 disabled 理由付き + 5 領域 row | hero bar chart + KPI progress + 5 領域 list |
| R6 | P2 Tabbed Workspace | tab で 5 領域分離 / サマリ default | 引き上げ申請 sticky right | sidebar tab + main content |
| R7 | P1 Search + Date-grouped | 行ヘッダ + 説明文 削除 / 日付 group header | 検索 + critical filter | sidebar filter + date-grouped timeline |
| R7 | P2 Case-grouped (accordion) | event meta 大幅削減 / case ID で集約 | 案件 ID で展開 / 案件レビューに飛ぶ | case-card with expandable events |
| R8 | P1 Goal-progress | KPI 説明文 削減 / progress bar が肝 | Checkpoint 進化条件 1 文 + bar 4本 | hero progress + KRI alert + 補助 KPI |
| R8 | P2 Trend-focused | KPI 表 → sparkline grid | (operational dashboard、CTA 不要) | 4 KPI sparkline + 補助 KPI + 9 KRI |
| R9 | P1 3-stage Kanban | 一覧 → 3 column / desc 短縮 | 未承認 → 確認済 → 承認済 の動線可視 | 3 column kanban (status flow) |
| R9 | P2 Compiled Library | 未承認/確認済 隠す default | 承認済のみ表示 toggle | reading library layout |

## 既存 prototype 比較ガイド

実際の dev server (`cd prototype && npm run dev`、port 5181) と clone PNG を side-by-side で確認できる。clone が現状の structural fidelity であることを確認後、改善案 PNG を見て user が「採用」「却下」「保留」を判断する。

採用決定後、production への back-port は別 session で実施 (本 directory は read-only reference として保持)。

## Token / 構造規範

- 全 29 frame は Operational Premium Light token (`docs/03-ui-prototype-design.md` §2.7 SSOT) を 100% 使用、新 token 0
- プロトタイプ pill 全 frame に persistent
- 9 route invariant 維持 (10 番目の route なし)
- JP-first (英語は技術固有名詞のみ)
- BusinessApproval chip UI 表示 = `業務承認: 承認待ち` (component 名 leak 禁止)

## 既存 prototype 不変

```
$ git diff --stat prototype/
(no output — confirmed zero-touch)
```
