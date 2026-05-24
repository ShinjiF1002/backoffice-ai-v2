| 項目            | 値                                                                                                                                                                                       |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 文書 ID         | DOC-DEMO-demo-script                                                                                                                                                                     |
| 文書名          | Demo execution script (Session 4 Chapter 1 + Chapter 2 click-by-click playbook)                                                                                                          |
| 版数            | v0.1                                                                                                                                                                                     |
| ステータス      | Draft                                                                                                                                                                                    |
| オーナー        | backoffice-ai-v2 maintainer (Session 4 facilitator)                                                                                                                                      |
| 承認者          | self — 設定承認 (demo execution 確定)                                                                                                                                                    |
| 閲覧対象        | Session 4 facilitator (technical level、preview server / URL param 直接操作可)                                                                                                           |
| 機密区分        | Internal                                                                                                                                                                                 |
| 関連文書        | DOC-S4-06 (Session 4 narrative SSOT / message spine), DOC-UI-03 (9 画面 SSOT), DOC-APP-02 (3 層承認 RACI), DOC-MON-05 (4 KPI 仮説 gate), prototype/audit/day-19-ux-clarity-integrated-plan.md (Commit 3b/3c isDemo 動線 SSOT) |
| SSOT 区分       | Demo execution step (URL + click target + 期待表示 + narrative line) の SSOT、message 設計は DOC-S4-06 §3 が SSOT                                                                        |
| Evidence Status | N/A (execution playbook、定量値は DOC-MON-05 を pointer)                                                                                                                                 |
| 改版履歴        | v0.1 (2026-05-23): 初版作成 (Day 20、Plan v1.4 Commit 3b/3c の `?demo=1` 動線実装後)。Chapter 1 16min + Chapter 2 8min の dense technical script、Recovery scenarios + Pre-demo dry-run checklist + Mock 限界 disclosure 含む。 |

---

## 0. Pre-demo setup (T-5min)

### 0.1 環境準備

```bash
# Terminal A: dev server
cd ~/code/active/backoffice-ai-v2/prototype
npm run dev
# → Vite v8.0.14  ready in ~200ms
# → ➜  Local:   http://localhost:5173/
```

```bash
# Terminal B: gate verify (dry-run の保険)
cd ~/code/active/backoffice-ai-v2/prototype
npm run check:all
# → tsc + lint + AST no-op gate + build 全 pass を確認
```

### 0.2 ブラウザ準備

- ブラウザ: Chrome / Edge (Chromium 系) を推奨。Safari は OK だが drawer animation の transition timing が微妙に異なる
- ウィンドウサイズ: **1280 × 800** (audience 投影想定。Sidebar 200px + main 1080px の dual-column が崩れない)
- 表示倍率: **100%** (Cmd+0 でリセット)
- フルスクリーン: 投影前に **Cmd+Shift+F** (Chrome) で URL bar を隠す
- Bookmark bar: 非表示 (Cmd+Shift+B で toggle)
- DevTools: 閉じる (F12)

### 0.3 起点 URL

```
http://localhost:5173/?demo=1
```

- `?demo=1` で Dashboard / Inbox の NextActionStrip recommendedCase が **CASE-2026-0142 固定**
- `?demo=1` で ProposalReview RACI drawer が **defaultOpen=true**
- 起動時に `/` → `/dashboard` redirect (App.tsx の `<Navigate to="/dashboard" replace />`)、query param は React Router の `useSearchParams` で各 page が拾う
- **注意**: `/dashboard` への redirect 時に `?demo=1` が drop されないか確認 (React Router v7 動作上は preserved だが、念のため起動直後に URL bar で query 視認)

### 0.4 起動直後の dry-run (60sec)

| # | 確認 | 期待 |
|---|---|---|
| 1 | URL bar | `localhost:5173/dashboard?demo=1` |
| 2 | TopBar 右 | `プロトタイプ表示 — 外部システム未接続 / 証跡はモック` (slate-100 pill) |
| 3 | PageHeader 直下 | NextActionStrip slate-50 strip + `次に処理すべき案件 · CASE-2026-0142 (経過 00:12:34)` + 右に `開く` (indigo CTA) |
| 4 | 業務 card (UC-BO-01) | `状態: 注意` (amber) + 注意 chip / 入力者確認待ち count |
| 5 | Sidebar | 9 nav item (ダッシュボード〜ナレッジ) visible、active = ダッシュボード (indigo dot) |

1 項目でも欠ければ §3 Recovery を参照。

---

## 1. Demo Chapter 1: UC-BO-01 法人住所変更 (22-38 min、16 min)

**Message spine (DOC-S4-06 §3.1 verbatim)**:
> 差戻しが当日中に staging knowledge として AI runtime に visible になる (引用根拠 ではなく hint としての visible)。Sub message 2「承認された手順だけを AI に覚えさせる」と staging visibility の境界線。

### Scene 1.1 — Inbox 起点 (0:00-2:00、2 min)

| 項目 | 内容 |
|---|---|
| URL | `http://localhost:5173/inbox?demo=1` |
| 起動方法 | Sidebar `受信トレイ` click (query は preserve)、または URL bar 直接編集 |
| 期待表示 (上から) | (1) PageHeader: 受信トレイ + 件数 chip `13 件` + 並び順 = 受付順 / (2) NextActionStrip: slate-50 strip + Target icon + `次に処理すべき案件 · CASE-2026-0142 (経過 00:12:34)` + 右端 `開く` button / (3) Filter chip row (業務 / 状態 / 担当者 / 経過時間、全 disabled) / (4) queue table (案件 ID / 業務 / 状態 / 経過 / 担当者 / 注意 / →)、footer summary = `AI処理中 2 / 確認待ち 5 / 承認者承認待ち 1 / 差戻し 2 / 完了 3` |
| Click target | NextActionStrip 右端 `開く` (indigo `bg-primary` CTA) |
| 遷移先 | `/cases/CASE-2026-0142` |
| Narrative (facilitator 読み上げ) | "受信トレイを開くと、AI が経過時間と注意件数から優先案件を 1 件 pin します。CASE-2026-0142、法人住所変更、経過 12 分。これを開きます。" |
| Mock 注意 | NextActionStrip の recommendedCase は `?demo=1` 経由で CASE-2026-0142 固定。default では operational priority (alertCount + 経過最大) で動的決定 |

### Scene 1.2 — CaseReview Hero 1 (2:00-7:00、5 min)

| 項目 | 内容 |
|---|---|
| URL | `http://localhost:5173/cases/CASE-2026-0142` (`?demo=1` は query preserve されないこの遷移では drop 可、CaseReview は isDemo を見ない) |
| 起動方法 | Scene 1.1 の `開く` click から自動遷移 |
| 期待表示 (上から) | (1) PageHeader breadcrumb 受信トレイ › 案件処理 › `CASE-2026-0142` / h1 = `CASE-2026-0142 法人住所変更` + StatusBadge `入力者確認待ち` / 経過 00:12:34 / LifecycleStepper (受付 → AI 処理 → **入力者確認** [current] → 承認者承認 → 反映) / (2) NextActionStrip summary mode: `判定要約 · AI 入力結果 5 項目確認、信頼度 0.84 で閾値未達、注意 2 件` (CTA なし) / (3) Case alert strip (amber-soft、注意 · 2 件、OCR 信頼度 / 住所マスタ 2 alert) / (4) 3-column body: 左 = AI 入力結果 form + AddressDiffBlock (新住所 inline diff、差分 1 項目 · 1 セグメント mono) / 中央 = EvidenceTimeline (PDF サムネ + 4 step: 受付 / OCR 抽出 / マスタ照合 / AI 入力結果生成、各 step は click で DetailDrawer expand) / 右 = RelatedRuleAlert (amber banner、関連手順が更新されています PROP-2026-031) + CitationPanel (承認済 3 件: KN-CORP-001/002/003) + StagingHintPanel (Disclosure collapsed、未承認ヒント 2 件) |
| Click target (任意 1: drawer demo) | EvidenceTimeline の `AI 入力結果生成` step (4 番目) を click → 右側 DetailDrawer open |
| 期待表示 (drawer) | aria-labelledby 経由で title = `AI 入力結果生成 — 証跡詳細`、dl 表示: step 名称 / タイムスタンプ / 実行主体 = AI / 処理モデル / ソース = ai.address-extractor-v2.3 / 信頼度 = 0.92 / 状態 = 完了。`?debug=1` 時は schemaKey + raw value も visible (本 demo では出さない) |
| Drawer 閉じ | ESC、または drawer 外 click、または header 右 × icon click。背景の page は scroll 維持 + Tab 可 (non-modal PDR pattern) |
| Click target (任意 2: staging hint expand) | 右 column 下部の `未承認ヒント (引用根拠 対象外、2 件)` Disclosure header click → expand |
| 期待表示 (staging expand) | medium chip + KnowledgeId + title + 抜粋 × 2 件 (福岡支店の住所マスタ旧形式 / 国外住所の郵便番号フォーマット) |
| Narrative | "Hero 1 画面、CaseReview です。AI が PDF を OCR で抽出して、住所マスタと照合して、5 項目の入力結果を生成しました。中央上の判定要約に書いてあるように、信頼度 0.84 で閾値 0.85 を下回っています。右上の amber banner、関連手順が更新されています — これは過去の差戻しが生んだ手順変更 (PROP-2026-031) が今この案件に反映されているという表示です。中央の証跡 timeline は click すると右から detail drawer が開きますが、これは page 操作を止めない non-modal pattern です。右下の未承認ヒントは citation 根拠ではない、reviewer 向けの hint です。今回はこの 2 件の注意と未承認ヒントを根拠に、差戻しを選択します。" |
| Mock 注意 | 入力者 = 田中 美咲 (`mock-cases.ts`)、`承認` button を click すると 3 秒 success flash 後に自動で `/inbox` 遷移 (in-memory state、Commit 0 U-3 実装)。Chapter 1 では `承認` ではなく `差戻し` を選ぶので click しない |

### Scene 1.3 — SendBackComment 差戻し (7:00-11:00、4 min)

| 項目 | 内容 |
|---|---|
| URL | `http://localhost:5173/cases/CASE-2026-0142/comment` |
| 起動方法 | CaseReview footer 左の `差戻し` button click (caseApproved=false 時は enabled、navigate(`/cases/CASE-2026-0142/comment`)) |
| 期待表示 (上から) | (1) PageHeader breadcrumb 受信トレイ › 案件処理 › `CASE-2026-0142` › 差戻しコメント / h1 = `CASE-2026-0142 差戻しコメント` / (2) inner max-w-3xl wrap で form / 案件概要 card (workflow / 入力者 / 経過) / (3) 差戻し分類 fieldset (5 radio: 誤読 / UI 差異 / 境界条件 / 判断境界 / 入力誤り)、各 row は radio + label + 短い description + Disclosure `例を見る` (selected の時 defaultOpen=true) / (4) 差戻し理由 textarea / (5) 関連 evidence checklist |
| Click target 1 | 分類 radio = `境界条件` を click |
| 期待表示 | `境界条件` row が indigo border + bg-primary-soft、Disclosure auto-expand で `新形式、未登録、海外住所、複数事業所、特殊法人 等` visible |
| Click target 2 | textarea に "OCR 信頼度 0.84 で住所マスタにマッチしませんでした。福岡支店の旧形式が staging hint にあるので、その正規化規則を compiled に上げてください。" を type (or skip、説明だけ) |
| Click target 3 (実 click は不可) | footer `差戻しを記録` (indigo CTA、DisabledAction wrapper)、native title tooltip = `差戻し理由を記録し AI 日次分析に反映 (動作は次の実装段階で対応)` |
| Narrative | "差戻しコメント画面です。5 つの category から選びます — AI の誤読 / システムの UI 差異 / 想定外パターン (境界条件) / AI 判断ルール不足 / 入力データ誤り。今回は staging に既にある福岡支店パターンに該当するので、境界条件を選びます。差戻し理由を書いて記録すると、AI 日次分析が同種差戻し 3 件以上を検出して翌日の Procedure Update Proposal に上げる、というのが Chapter 2 で見せる loop です。今回は記録 button は click できません — これは prototype mock で、本番接続は Phase 1 で実装します。" |
| Mock 注意 | `差戻しを記録` button は **DisabledAction wrapper mode、native title で reason 表示**、click 不可。Phase 1 で実装予定。Demo では「click しません」と明示し、本 button が動く前提の話はしない |

### Scene 1.4 — CaseReview 戻り (staging hint pre-bake 視認) (11:00-14:00、3 min)

| 項目 | 内容 |
|---|---|
| URL | `http://localhost:5173/cases/CASE-2026-0142` |
| 起動方法 | ブラウザの **戻る button (Cmd+[)** で SendBackComment から CaseReview に戻る (差戻し button が動かないので、navigate 経路は browser back のみ) |
| 期待表示 | Scene 1.2 と同じ状態 (staging hints panel 内に STG-CORP-005 福岡支店 / STG-CORP-006 国外住所 が visible) |
| Click target | 右 column 下部 `未承認ヒント` Disclosure expand (まだ閉じていれば) |
| Narrative | "戻ってきました。右下の未承認ヒント panel に注目してください — STG-CORP-005、福岡支店の住所マスタが旧形式、という entry が visible です。**本 prototype は in-memory mock のため『今差戻したものが今 reflect された』という round-trip は実装していません。STG-CORP-005 は事前に mock data として用意した過去の差戻し痕跡で、Chapter 2 で扱う Proposal の元案件になります。**Sub message 2「承認された手順だけを AI に覚えさせる」の境界線 — staging hint は AI runtime に visible だが citation 根拠にはならない、reviewer の判断補助のみ、という governance です。" |
| Mock 限界 disclosure (必須) | 「今差戻したものが今 reflect された」と言わない。STG-CORP-005 は事前 bake 済 mock data であることを 1 文明示 |

### Scene 1.5 — AuditTrail (任意、14:00-16:00、2 min)

時間に余裕がある場合のみ。Chapter 1 の time pressure があれば skip 可。

| 項目 | 内容 |
|---|---|
| URL | `http://localhost:5173/audit` |
| 起動方法 | Sidebar `監査` click |
| 期待表示 (上から) | (1) PageHeader 監査 + 件数 chip / PageHelpDisclosure `本画面の説明` (default closed) / (2) main: audit event list (15 項目記録 model、JP label primary、Commit 2 で SHOW_INTERNAL_METADATA gate 化済 — default では snake_case schemaKey 非表示) |
| Click target (任意) | event row click → DetailPanel expand、15 項目 (case_id / workflow_version / agent_version / 等) JP label で visible |
| Narrative | "監査画面です。各 case の state transition (受付 / AI 処理 / 入力者確認 / 差戻し / 承認 / 反映) が 15 項目で記録されています。`?debug=1` を URL に付けると snake_case schemaKey も追加表示されますが、本番運用では default 非表示です。本 demo では概略を見せて、Slide 6 で詳述します。" |
| Mock 注意 | `?debug=1` を demo 中に切り替えない (audience 混乱回避)。`debug=1` 動線は Q&A で求められたら別 tab で見せる |

---

## 2. Demo Chapter 2: AI 日次分析 → ProposalReview → 手順承認 → Metrics (46-54 min、8 min)

**Message spine (DOC-S4-06 §3.2 verbatim)**:
> AI が Proposal source、Manual 管理者が Queue owner、業務責任者が Approver の 3 主体構造。縮小するのは案件承認の介在頻度のみ。手順承認 / 設定承認 loop は Automation Maturity 進化後も同じ強度で残る (Matrix B 主表現)。4 KPI は Phase 1 検証仮説、本番導入可否を判定する gate ではない。

### Scene 2.1 — Dashboard 業務 card (0:00-1:30、1.5 min)

| 項目 | 内容 |
|---|---|
| URL | `http://localhost:5173/dashboard?demo=1` |
| 起動方法 | Sidebar `ダッシュボード` click (Chapter 1 から Chapter 2 までの slide segment 後の再 entry) |
| 期待表示 | (1) PageHeader: ダッシュボード + 件数 chip × 3 (案件数 / 注意 / 承認者承認待ち) + HypothesisChip `推移・SLA 閾値は [仮説 / 要検証]` / (2) NextActionStrip: `次に処理すべき案件 · CASE-2026-0142 (経過 00:12:34) 開く` (Chapter 1 と同じ。Chapter 2 では別 case に進むので開かない) / (3) 業務 card 2 並列: **UC-BO-01 法人住所変更** (border 2 amber、状態 = 注意 / 案件数 / 注意件数 / 承認者承認待ち + Sparkline) + UC-BO-02 口座開設書類完備 / (4) workflow lane: 5 node 横並び (受信トレイ → 案件レビュー → 差戻し → AI 提案レビュー → メトリクス) |
| Click target | UC-BO-01 card 全体 click (= `/inbox?workflow=UC-BO-01` 遷移)、ただし demo 上は説明のみで実際は次の URL bar 編集で `/proposals/PROP-2026-031?demo=1` に飛ぶ方が time-efficient |
| Narrative | "Chapter 2 です。Dashboard、業務カード UC-BO-01 を見てください — 注意ステータスで、入力者確認待ちと差戻しがあります。Chapter 1 で差戻したのと同じ業務です。AI が日次分析でこの差戻しパターンを検出して、Procedure Update Proposal を 1 件自動生成しました。それを開きます。" |
| Mock 注意 | 業務 card の Sparkline / 注意件数は `mock-cases.ts` から動的集計、card click は `/inbox?workflow=...` filter 適用 (Day 12 Page 3 実装済)。Demo では Proposal に直行するため card click はスキップ可 |

### Scene 2.2 — ProposalReview Hero 2 + RACI drawer (1:30-5:00、3.5 min)

| 項目 | 内容 |
|---|---|
| URL | `http://localhost:5173/proposals/PROP-2026-031?demo=1` |
| 起動方法 | URL bar 直接編集 (Dashboard card click の場合は Inbox 経由で 1 step 増えるので、demo time 短縮のため URL bar 推奨) |
| 期待表示 (上から) | (1) PageHeader breadcrumb 受信トレイ › AI 提案レビュー › `PROP-2026-031` / h1 = 提案 title + workflow chip + StatusBadge `手順管理者の整理待ち` + 経過 / 提案ソース annotation (`AI` + Sparkles icon) / ProposalLifecycleStepper (整理 → 承認 → 反映) / (2) NextActionStrip summary mode: `提案要約 · 元案件 3 件、判定基準 3/3 達成、提案差分 2 ファイル` / (3) 2-column body (Commit 3b で 4-col → 2-col): 左 4/12 = 判定基準 (同種差戻し件数 / 共通 pattern / staging 内部矛盾) + 元 案件 (CASE-2026-0142 / 0118 / 0095、各 row に差戻し category chip) + 未承認ヒント / 中央 8/12 = 提案差分 hero (target file + § section + 変更前 / 変更後 × 2 diff) / (4) **右側に DetailDrawer 自動 open** (Commit 3b の `?demo=1` defaultOpen=true): aria-labelledby `提案詳細 (RACI + メタ情報)`、RACI 5 row (提案ソース AI / R 整理担当 / A 承認 / C / I) + 職務分離 (SoD) note + 提案メタ情報 4 row |
| Click target (drawer 操作 demo) | drawer 内を scroll、または header 右 × icon で close / 中央 `提案詳細を見る (RACI + メタ情報)` button で再 open |
| Narrative | "Hero 2 画面、ProposalReview です。今 demo 起動時に `?demo=1` で右側の RACI drawer が自動で開いています。これは Chapter 2 の主役、3 主体の責任分離を見せるためです。Proposal source = AI、R 整理担当 = Manual 管理者、A 承認 = 業務責任者。職務分離 (SoD) の note にあるように、同一人物が R と A を兼ねることは禁止です。中央 8/12 に提案差分が 2 ファイル — workflow.md と agent-instructions.md。OCR 信頼度閾値を 0.85 から 0.88 に引き上げ、0.85-0.88 範囲を人手確認に回す手順変更です。左 4/12 の判定基準を見ると、同種差戻し 12 件、共通 pattern 確認可、staging 内部矛盾なし — 3/3 達成。元案件 3 件には Chapter 1 で扱った CASE-2026-0142 が含まれています。" |
| Mock 注意 | RACI drawer は `?demo=1` 経由で defaultOpen=true (Commit 3b 実装、Cluster 2 Q1 採用)。default では closed、`提案詳細を見る` button で open |

### Scene 2.3 — Manual 管理者 triage → 業務責任者 forward (5:00-6:30、1.5 min)

| 項目 | 内容 |
|---|---|
| URL | `http://localhost:5173/proposals/PROP-2026-031?demo=1` (Scene 2.2 と同じ、scroll で footer まで) |
| Click target (実 click 不可) | footer 右側 `差戻し` (X icon、DisabledAction wrapper、reason = `差戻し動作は次の実装段階で対応 (差戻し理由をコメント付きで AI 日次分析にフィードバック)`) と `業務責任者へ送付` (Send icon、indigo primary、reason = `業務責任者送付動作は次の実装段階で対応 (業務責任者 [approver 名] の承認者承認待ちへ転送)`) |
| Narrative | "footer に 2 button — 差戻し / 業務責任者へ送付。これも click できませんが、説明します。Manual 管理者の役割は 'triage' です。AI の提案を見て、整理した上で業務責任者に forward するか差戻すか判断する。**ここで重要なのは SoD enforcement — Manual 管理者 (この prototype では `mock-proposals.ts` で queueOwner として表示) と業務責任者 (同 approver) は mock data 上で異なる person として表記されています。本番では Identity Provider 経由で同一人物による R と A 兼任を block する設計です。**業務責任者は別 UI (Slide 3 の static mock figure) で受信、approve すると compiled 昇格 + workflow.md / agent-instructions.md / approval-policy.md の diff が適用されます。" |
| Mock 限界 disclosure (必須) | 「button が click できれば forward される」と言わない。「実装は Phase 1」を 1 文明示。SoD enforcement は mock data 上の visualization のみ、本番では Identity Provider 経由 |
| Slide 3 への connection | "業務責任者の画面は Slide 3 で mock figure として見せています。React route 化していない理由は 10 番目画面化禁止 (DOC-UI-03 §7) の governance — 本 demo は 入力者 + Manual 管理者 の operational UI に focus" |

### Scene 2.4 — Metrics Hero 3 (6:30-8:00、1.5 min)

| 項目 | 内容 |
|---|---|
| URL | `http://localhost:5173/metrics` |
| 起動方法 | Sidebar `メトリクス` click |
| 期待表示 (上から) | (1) PageHeader breadcrumb ダッシュボード › メトリクス + 件数 chip + PageHelpDisclosure `本画面の説明` (default closed) / (2) 4 KPI multi-criteria 仮説 gate section: Disclosure header `4 KPI 進化要件` (default closed) + 右 HypothesisChip `4 KPI 全て [仮説 / 要検証]` + section 内 4 KPI card (AI 入力承認率 / 人手上書き率 / Alert 発生率 / 承認者差戻し率)、各 card に達成/未達 indicator (達成 = success、未達 = alert)、legend row に `仮判定 達成 / 未達 [仮説 / 要検証]` / (3) 補助 KPI section + HypothesisChip / (4) 9 KRI section + HypothesisChip / (5) Trends section (workflow trend Sparkline) |
| Click target (任意 1) | PageHelpDisclosure `本画面の説明` click → expand で framing 注 visible |
| Click target (任意 2) | `4 KPI 進化要件` Disclosure click → 4 card grid expand |
| Narrative | "Hero 3 画面、Metrics です。**重要**: ここで見せる 4 KPI と KRI の数値は全て `[仮説 / 要検証]` です。これは Phase 1 で測定して再設定する検証仮説であって、本番導入可否を判定する gate ではありません。framing 注は default で閉じてありますが、'本画面の説明' を expand すると governance が読めます。Matrix B 主表現の通り、案件承認の介在頻度は縮小しますが、手順承認 loop と設定承認 loop は Automation Maturity 進化後も同じ強度で残ります。Metrics は その loop の進化を観測する surface です。" |
| Mock 限界 disclosure (必須) | 「KPI 達成」と言うが、それが「本番 OK」を意味しないことを明示。「仮説 / 要検証」「Phase 1 検証」を 1 文以上織り込む |

---

## 3. Recovery scenarios (technical level、terminal command 込み)

### 3.1 `?demo=1` query が drop された (NextActionStrip recommendedCase が CASE-2026-0142 でない)

**症状**: NextActionStrip が `CASE-2026-0148` 等の別 case を pin している (= default operational priority logic が起動、isDemo=false)

**Fix (10sec)**:
1. URL bar を見る → `?demo=1` が末尾にあるか確認
2. なければ URL bar 末尾に `?demo=1` を append → Enter
3. または起点に戻って `http://localhost:5173/?demo=1` から再 start

**根因**: React Router v7 で同一 component 内 navigate 時は query preserved だが、Sidebar 経由の `<Link to="/dashboard">` 等は query を持ち越さない (Link href が hard-coded)。Demo 中は URL bar で都度 append が安全

### 3.2 ProposalReview drawer が open しない (defaultOpen=false 状態)

**症状**: `/proposals/PROP-2026-031` 開いたが右側 drawer が表示されない、中央右に `提案詳細を見る (RACI + メタ情報)` button が visible

**Fix (5sec)**:
1. URL bar 確認: `?demo=1` 付いているか
2. ない場合 append → reload (Cmd+R)
3. それでも開かない場合: 中央右 button `提案詳細を見る` を click (manual open)

**根因**: Commit 3b `const [drawerOpen, setDrawerOpen] = useState<boolean>(isDemo)`、isDemo = `searchParams.get('demo') === '1'`。query 不在で false 初期化

### 3.3 preview server crash / port 5173 占有

**症状**: `npm run dev` が `Port 5173 is in use` で起動失敗、または demo 中に server hang

**Fix (30sec)**:
```bash
# 占有 process 確認
lsof -i :5173
# kill (PID 確認後)
kill -9 <PID>
# server 再起動
cd ~/code/active/backoffice-ai-v2/prototype
npm run dev
```

**または HMR が壊れた場合**:
```bash
# 完全 restart
# Ctrl+C で server 停止
rm -rf node_modules/.vite  # vite cache clear
npm run dev
```

### 3.4 CaseReview 承認 button を誤 click → 3 秒 success flash → /inbox 自動遷移

**症状**: Chapter 1 Scene 1.2 で `承認` button を誤 click、footer 左に `本案件は承認されました (モック動作) — 受信トレイへ遷移します` 表示 → 3 秒後 /inbox

**Fix (5sec)**:
1. **慌てて押さない** (3 秒で遷移する)
2. ブラウザ back button (Cmd+[) で CaseReview に戻る
3. 戻った状態は in-memory mock のため `caseApproved=false` reset 済、再度 click 可能
4. または URL bar で `/cases/CASE-2026-0142` 直接編集 → 同 reset 効果

**根因**: Commit 0 U-3 で `caseApproved` state を in-memory 化、`useEffect` 3 秒 timer → `navigate('/inbox')`。AppContext 永続化なし、page unmount で reset

### 3.5 staging hint が空 / RelatedRuleAlert が表示されない

**症状**: CaseReview 右 column の StagingHintPanel に entry がない、または RelatedRuleAlert (amber banner) が見えない

**Fix (確認のみ)**:
1. URL bar が `/cases/CASE-2026-0142` か確認 (他 case ID では staging hint が異なる)
2. CASE-2026-0142 の `mock-cases.ts` 内 stagingHints + relatedRuleUpdates が空でないか git で確認:
   ```bash
   cd ~/code/active/backoffice-ai-v2/prototype
   grep -A2 "stagingHints" src/data/mock-cases.ts | head -10
   ```
3. mock data が壊れていれば `git checkout main -- src/data/mock-cases.ts` で復元

### 3.6 全体 reset (demo 中盤で混乱した時の last resort)

```bash
# Terminal A で server 停止 (Ctrl+C)
cd ~/code/active/backoffice-ai-v2/prototype
git status  # working tree clean 確認
npm run dev  # 再起動
```

ブラウザ: 全 tab close → `http://localhost:5173/?demo=1` で起点から再 start

---

## 4. Pre-demo dry-run checklist (T-1h)

Session 4 開始 1 時間前に実施 (15-20 min 想定):

### 4.1 Code health (5min)

```bash
cd ~/code/active/backoffice-ai-v2/prototype
git status                           # working tree clean
git log --oneline -1                 # 最新 commit が想定通り
npm run check:all                    # tsc + lint + AST gate + build 全 pass
```

### 4.2 9 route visit (5min)

各 route を順に visit、5-second test を facilitator 自身が実施:

| # | URL | 5-sec で識別すべき要素 |
|---|---|---|
| 1 | `/?demo=1` (→ /dashboard) | NextActionStrip CASE-2026-0142 |
| 2 | `/inbox?demo=1` | NextActionStrip CASE-2026-0142 + queue 13 件 (mock-cases.ts active = 5 ready + 2 pending + 2 sent-back + 1 approval-waiting + 3 reflected) |
| 3 | `/cases/CASE-2026-0142` | NextActionStrip 判定要約 + 注意 2 件 + 3-column body |
| 4 | `/cases/CASE-2026-0142/comment` | 5 radio + Disclosure 例を見る |
| 5 | `/proposals/PROP-2026-031?demo=1` | NextActionStrip 提案要約 + 中央 8/12 diff + 右 drawer auto-open |
| 6 | `/agents/agent-corporate-address-change` | Trust Level Progression Hero + Disclosure 4 KPI |
| 7 | `/audit` | PageHelpDisclosure + 15 項目 record table |
| 8 | `/metrics` | PageHelpDisclosure + 4 KPI Disclosure + HypothesisChip |
| 9 | `/knowledge` | PageHeader subtitle `引用根拠は承認済のみ` + 3 weight |

### 4.3 Drawer + Disclosure 動作 (3min)

- ProposalReview `?demo=1` で drawer auto-open → ESC close → 再 open button click → 外側 click close
- EvidenceTimeline step click → drawer open + raw schema は `?debug=1` 時のみ visible 確認
- Inbox row click → drawer preview + 内部 `案件レビューを開く` Link で navigate
- SendBackComment radio change → Disclosure `例を見る` auto-expand 確認
- StagingHintPanel Disclosure collapsed default → expand で 2 件 visible

### 4.4 Mock data integrity (2min)

```bash
grep -nE "CASE-2026-0142|PROP-2026-031" src/data/mock-cases.ts src/data/mock-proposals.ts | head -10
```

期待:
- CASE-2026-0142: workflow UC-BO-01、status `ready`、alertCount 2、stagingHints 2 件、relatedRuleUpdates PROP-2026-031
- PROP-2026-031: workflow UC-BO-01、status `triage-pending`、sourceCases 3 件 (CASE-2026-0142 含む)、proposedDiff 2 file、decisionCriteria 3/3 達成

### 4.5 環境 (2min)

- ブラウザ fullscreen + bookmark hide
- macOS 通知 OFF (Do Not Disturb)
- Slack / Mail 通知 OFF
- Screen share preview で audience 視点確認 (1280×800 で投影崩れなし)

---

## 5. Mock 限界 disclosure (facilitator が demo 中に明示すべき境界、verbatim 推奨)

以下 3 点は demo 中の **必ず織り込む** disclosure。1 文ずつ verbatim で使うことを推奨:

### 5.1 Staging round-trip 不在 (Scene 1.4)

> 「本 prototype は in-memory mock のため、今差戻したものが今 reflect されるという round-trip は実装していません。staging hint として visible なのは事前に mock data として用意した過去の差戻し痕跡です」

### 5.2 Action button 非動作 (Scene 1.3 + 2.3)

> 「差戻し記録 / 業務責任者へ送付 / 変更を申請 等の action button は本 prototype では click 不可です。動作は次の実装段階 (Phase 1) で対応します。本 demo は UI flow と governance 構造の visualization に focus しています」

### 5.3 KPI 数値の hedge (Scene 2.4)

> 「ここで見せる 4 KPI と KRI の数値は全て `[仮説 / 要検証]` です。Phase 1 で測定して再設定する検証仮説であって、本番導入可否を判定する gate ではありません」

これら 3 disclosure を抜くと、audience が「prototype が本番動作する」と誤解するリスクがある (NH8 + audit responsibility)。

---

## 6. 関連文書

- DOC-S4-06 (`docs/06-session4-narrative.md`): Session 4 narrative SSOT、message spine の SSOT (本 doc の上位)
- DOC-UI-03 (`docs/03-ui-prototype-design.md`): 9 画面 Screen Card + Operational Premium Light §2.7
- DOC-APP-02 (`docs/02-approval-model.md`): 3 層承認 RACI + 9.8 Role × 画面 access matrix
- DOC-MON-05 (`docs/05-metrics-and-gates.md`): 4 KPI 仮説 gate + 9 KRI catalogue
- `prototype/audit/day-19-ux-clarity-integrated-plan.md` v1.4 Commit 3b/3c: `?demo=1` 動線実装 SSOT
- `prototype/CLAUDE.md`: 9 routes exactly + Persistent Prototype Mode Label + Citation / Staging Governance
- `demo/static-mocks/business-approval-view.html` (Day 20 同 commit): Slide 3 mock figure spec の実体化

## 7. Scope-out

- BusinessApprovalView の実 button click 動作 (Phase 1 で実装、本 demo では Slide 3 mock figure として静的見せ)
- 実 LLM 呼び出し / 実 OCR / 実 PDF preview (Phase 1)
- AppContext 永続化 (in-memory only、page reload で reset)
- Multi-user simulation (1 facilitator + 仮想 audience の前提、SoD enforcement は mock data 上 visualization のみ)
- 国際送金業務の demo 内 露出 (DOC-OV-00 §2.1 + Slide 7 1 行抽象化のみ、demo Chapter には含めない)
