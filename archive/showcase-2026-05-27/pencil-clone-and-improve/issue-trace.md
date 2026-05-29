# Issue Trace — 3 問題 × 9 画面 × 20 改善案

> user が指摘した 3 問題に対し、各改善案がどう対処しているかを明示的に trace する ledger。「採用」「却下」判断の根拠資料。

## 3 問題 (user 明示)

1. **文字が多すぎる** — ユーザが確認する必要のない情報まで表示
2. **一目で何をしたら良いかわからない** — Intuitive な理解ができない
3. **画面レイアウトの問題** — 全体構成が最適でない

## 共通 原則 (改善案全体に適用)

- **削った text**: instructional copy / "[仮説 / 要検証]" 注釈 / 「次の実装段階で対応」 footer caption / 重複 chip / 説明文 with "(...で...)" 例示
- **保持した text**: governance / hedge label / RACI / 業務名 / case ID / 信頼度 数値
- **追加した affordance**: filled CTA / 番号付き row / SLA color band / 状態 group header / wizard step indicator / progress bar

---

## R1 Dashboard

### 既存 (clone) の課題
- 「ダッシュボード」 breadcrumb + h1 + 3 chip + 並び SLA hint + UC-BO-01 + UC-BO-02 chip (重複 5 箇所)
- 5 cockpit tile + 業務 2 card + workflow lane 5 node + footer caption = 6 section
- 「次に処理すべき案件」 hero CTA は あるが、その下の cockpit / 業務 / workflow が attention を分散

### R1-P1 Today's Action
- 文字削減: cockpit 集計 5 tile 削除 / workflow lane 削除 / 業務 card の status 5 sub-row → なし / footer caption 削除
- 次の action: hero に urgent case 1 件大型 + filled「この案件を開く」 CTA + ⌘1-5 候補 4 件
- レイアウト: 6 section → 3 section (hero / queue 4 row / footer chip)

### R1-P2 Status Pulse
- 文字削減: cockpit 5 tile を 6 状態 strip に集約 / 業務 card の status sub-row を bar に集約
- 次の action: SLA 超過 banner + 開く CTA (urgent case 1 件) / status tile click で Inbox filter
- レイアウト: 6 status tile (top) + 業務 sparkline (right) の 2 zone

### R1-P3 Personal Workspace
- 文字削減: 「ようこそ」 「今日の」 など framing copy を minimize / 業務 card 大幅 compaction
- 次の action: 自分のタスク 5 件 (top #1 highlighted、red border + filled 開く CTA)
- レイアウト: tab (今やる / 全体状況 / トレンド) + queue + team footer の 3 layer、tab で context 切替

---

## R2 Inbox

### 既存 (clone) の課題
- 並び順 selector + 4 filter chip ("業務:すべて" 等 4 件) = 重複「すべて」5 箇所
- table 13 行 × 6 列 + 一括承認 / 一括差戻し disabled (footer)
- どの行を最初に処理するか不明 (経過 column に SLA color band あるが weak signal)

### R2-P1 Critical-first
- 文字削減: filter chips 「すべて」 4 つ → 「絞り込み (0)」 1 chip に集約 / 状態文言 short label / 並び順 → 「優先度 (SLA + 注意)」 active 状態 chip
- 次の action: 3 section header (SLA 超過 / 注意あり / 通常 折りたたみ)、SLA 超過の top #1 row は red border + filled 開く CTA
- レイアウト: 1 大型テーブル → 3 段グループ (critical / warning / normal 折りたたみ)

### R2-P2 Status Kanban
- 文字削減: 6 列 table → 5 column kanban、各 card に case ID + workflow + SLA のみ
- 次の action: column 全体が semantic な action group / 入力者確認待ち column 内で priority sort
- レイアウト: 一覧 / ボード toggle、ボード mode で 5 状態 column 並置

---

## R3 CaseReview

### 既存 (clone) の課題
- 3 column (AI 入力 5 field / 証跡 4 step / 関連手順 + 引用根拠 + 未承認ヒント) 等価重み
- 注意 2 件 alert strip + lifecycle stepper + breadcrumb + h1 + 経過 chip
- 「承認」と「差戻し」 footer button は地味、業務承認 chip と並んで埋没
- 最も重要な diff (新住所 1 field) は左 column の 3 番目 field に埋め込まれている

### R3-P1 Decision-focused
- 文字削減: 5 field の 4 つ (法人名 / 旧住所 / 支店コード / 効力発生日 = 変更なし) は accordion 「他の AI 入力結果」 へ / 証跡・引用根拠・未承認ヒント 全て accordion 化
- 次の action: hero summary + 大型 diff + 信頼度 0.84 + 注意 2 件 + 引用根拠 3 件 strip → 「承認」filled CTA (footer)
- レイアウト: 1 hero summary card + 4 accordion + sticky footer

### R3-P2 Source vs Output
- 文字削減: 3 column → 2 column (申請書 原本 / AI 入力結果)、証跡 column 削除 (別画面 link)
- 次の action: 原本 vs AI 出力 並置で diff を user 自身が認識、各 field の confidence bar が決定 補助
- レイアウト: 2 column (源データ / 出力)、各 cell に warning sub-band

### R3-P3 Single Question
- 文字削減: metadata 全削除 / lifecycle stepper も top status bar に集約
- 次の action: centered question 「以下の通り変更してよろしいですか?」 + 2 大型 CTA (差戻し outline / 承認 filled)
- レイアウト: status bar (slim) + centered question + diff card + 2 CTA

---

## R4 SendBackComment

### 既存 (clone) の課題
- 5 radio option (誤読 / UI 差異 / 境界条件 / 判断境界 / 入力誤り) 各 60-80 字 descriptive text
- 差戻しを記録 button disabled + 「送信動作は次の実装段階で対応」 footer caption
- 案件概要 box が小さく redundant (CaseReview に戻れば見える)

### R4-P1 AI-suggested
- 文字削減: 5 radio → 5 chip 横並び (1 行 desc) / 案件概要 削除 / 「次の実装段階」 footer caption 削除
- 次の action: ✦ AI による事前推測 banner で 「誤読」を pre-select + 「差戻しを記録」 ⌘↵ active filled CTA
- レイアウト: AI 推測 banner + Step 1 chip row + Step 2 textarea + footer 2 button

### R4-P2 3-step Wizard
- 文字削減: 5 radio の enum identifier (誤読 等) は sub-text に、main label は action 言語 (「AI が文書を読み間違えた」)
- 次の action: step indicator 1/3 → 「次へ: 補足を書く」 → 確認 の wizard 動線
- レイアウト: top step indicator + centered card (1 step / page) + footer 「次へ」 CTA

---

## R5 ProposalReview

### 既存 (clone) の課題
- 3 column (判定基準 + 元案件 + 未承認ヒント / 提案要旨 + 差分 / RACI + メタ情報) 各 重い text
- 「業務責任者へ送付」 disabled + 「手順承認は次の実装段階で対応」 caption

### R5-P1 Diff-hero
- 文字削減: 3 column → 1 hero summary + 4 数値 strip + 2 accordion
- 次の action: hero に 提案 title + 4 reason 数値 (5/78%/0/Type B) + 差分 + footer「業務責任者へ送付」 filled CTA
- レイアウト: hero + diff card + 2 accordion + sticky footer

### R5-P2 Single Question
- 文字削減: proposal description / 元案件 / RACI 詳細 全削除、diff のみ + 4 数値 strip
- 次の action: 「以下の通り更新してよろしいですか?」 question + 差戻し / 送付 2 大型 CTA
- レイアウト: status bar + centered question + diff card + 2 CTA

---

## R6 AgentSettings

### 既存 (clone) の課題
- Trust Level Progression 3 stage + 4 KPI 進化要件 + 5 領域 詳細 (Model / Prompt / Tool / 権限) 各長文
- 「変更を申請」 disabled + 「設定変更・申請は次の実装段階で対応」 caption

### R6-P1 Progress Roadmap
- 文字削減: 5 領域 詳細 → 1 行 summary、4 KPI → progress bar 化
- 次の action: hero「Supervised → Checkpoint で 3 ヶ月以上連続達成」 + 4 KPI bar + KRI alert + 「引き上げ申請 (2/4 未達)」 visible disabled with reason
- レイアウト: hero progress + KRI alert + 5 領域 row

### R6-P2 Tabbed Workspace
- 文字削減: 6 tab (サマリ / Trust Level / Model & Prompt / Tool / 権限 / 変更履歴) に分離、サマリ default
- 次の action: サマリ tab に Trust Level card + 4 KPI card + 5 領域 read-only + 引き上げ申請 outline filled CTA
- レイアウト: sidebar tab + main 2 column card layout

---

## R7 AuditTrail

### 既存 (clone) の課題
- 11 event row 各 case_id / workflow / version / actor / 時間 / 詳細 = 4 行で表示
- 「ナレッジ 承認可否 / 反映結果 等の詳細項目が展開」 instructional copy
- 行頭 icon 大、event type は中で小

### R7-P1 Search + Date-grouped
- 文字削減: event row の workflow ID / actor 等を 1 行に集約、説明 caption 削除
- 次の action: 検索 input (top) + sidebar facet filter + critical のみ filter / Export CSV / PDF button
- レイアウト: sidebar filter (event type / 業務 / actor) + date-grouped timeline (日付 header + event list)

### R7-P2 Case-grouped (accordion)
- 文字削減: 11 event を 5 case ID で集約 (1 case = 1-3 event)、 event meta 1 行に圧縮
- 次の action: 案件別 view toggle + 案件 ID で展開 → 案件レビューに飛ぶ
- レイアウト: case card with expandable events (default 1 case open)

---

## R8 Metrics

### 既存 (clone) の課題
- 4 KPI 進化判断 + 補助 KPI 表 + 9 KRI grid + 業務別 sparkline の 4 zone
- 「本画面は本番導入可否を判定する gate ではない」 framing 注釈 長文 / 各 KPI に [仮説 / 要検証] 重複
- どの KPI が target 未達か視覚的に弱い

### R8-P1 Goal-progress
- 文字削減: KPI 表 → progress bar 4 本、補助 KPI も 1 行 summary
- 次の action: hero「Checkpoint 進化 ロードマップ」 + 4 KPI bar + 「2 / 4 KPI 達成」 大 chip + KRI 警戒 1 件 alert
- レイアウト: hero progress + 補助 KPI + KRI alert

### R8-P2 Trend-focused
- 文字削減: 説明文 全削減、現在値 + sparkline + target のみ
- 次の action: visual trend (sparkline) で increase / decrease を即読、9 KRI sidebar で警戒 1 件をすぐ確認
- レイアウト: top 4 KPI sparkline + 左 補助 KPI (3 行) + 右 9 KRI sidebar

---

## R9 KnowledgeBrowser

### 既存 (clone) の課題
- ナレッジ 5 件 list (承認済 5 + 確認済 2 + 未承認 3 mix)、各 row が 4-5 行
- 「ナレッジは 承認済 / 確認済 / 未承認 の 3 段階で管理されます」 instructional copy
- 重要度 filter (全重要度 / 承認済 / 確認済 / 未承認) + 分類 6 chip = 並列 filter row 2 段

### R9-P1 3-stage Kanban
- 文字削減: 3 column kanban (未承認 / 確認済 / 承認済) で stage flow を視覚化、各 card 2 行
- 次の action: 「未承認 → 確認済 → 承認済」 動線が visual に明確、NEW tag で新規 staging を強調
- レイアウト: 3 column kanban

### R9-P2 Compiled Library
- 文字削減: 未承認 / 確認済 を default で隠す toggle (承認済 5 件 のみ表示)
- 次の action: 「AI が引用根拠として使えるのは 承認済 のみ」明示 + 承認済 card に large ✓ + 業務責任者 名前
- レイアウト: 表示 toggle (承認済のみ / 未承認込み) + reading library style cards

---

## 採用判断のための見方

1. clone PNG (`exports/clones/`) を実 dev server screenshot と side-by-side で確認、構造再現の fidelity 確認
2. 各画面の改善案 PNG を見て、3 問題への対処を視覚的に評価
3. 採用案を選んで `README.md` の「採用判断 hand-off」セクションに記入 (任意)
4. 採用決定後、production への back-port は別 session で実施 (本 directory は read-only reference)

## 既存 prototype 不変

```
$ git diff --stat prototype/
(no output — confirmed zero-touch)
```
