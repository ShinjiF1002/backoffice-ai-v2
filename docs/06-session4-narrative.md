# Backoffice AI v2 — Session 4 narrative

| 項目            | 値                                                                                                                                                                                               |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 文書 ID         | DOC-S4-06                                                                                                                                                                                        |
| 文書名          | Session 4 narrative (8 slide × 60 min + Demo Chapter 1/2 message spine + BusinessApprovalView mock figure spec)                                                                                  |
| 版数            | v0.1                                                                                                                                                                                             |
| ステータス      | Draft                                                                                                                                                                                            |
| オーナー        | backoffice-ai-v2 maintainer (Session 4 facilitator)                                                                                                                                              |
| 承認者          | self — 設定承認 (Session 4 narrative 構造の確定)                                                                                                                                                 |
| 閲覧対象        | Internal / Project team / Session 4 facilitator                                                                                                                                                  |
| 機密区分        | Internal                                                                                                                                                                                         |
| 関連文書        | DOC-OV-00, DOC-FW-01, DOC-APP-02, DOC-UI-03, DOC-KNW-04, DOC-MON-05, DOC-ROOT-\_SSOT (特に「Session 4 表層表現規範」)                                                                            |
| SSOT 区分       | 8 slide message + Demo Chapter 1/2 message spine + BusinessApprovalView mock figure spec の SSOT (demo の execution step は `demo/demo-script.md` Day 20 起稿に分離)                             |
| Evidence Status | N/A (narrative 設計のみ、定量値は DOC-MON-05 を pointer)                                                                                                                                         |
| 改版履歴        | v0.1 (2026-05-29): 初版作成 (Day 9、Plan v1.4 P0-4 (国際送金 Session 4 表層抽象化) + P2-11 (Autonomous footnote) + DOC-MON-05 connection (Slide 8)、Session 4 表層表現規範 `docs/_SSOT.md` 適用)。v0.2 (2026-05-29): CR R12+R13 hygiene patch (Blocking 2 規制語 gate self-contradictory 解消 §1.3 / §5 で Tier 3 exact list を paraphrase、Day 19/21 grep scope 明示、Minor 60 min summary math fix [Slide 1-8 28→32 / Q&A 4→2]、Minor Demo Chapter 1「Hero 1/2/3 画面遷移」を「Hero 1、Hero 2/3 は Demo 2」に clarify、Minor Demo Chapter 2 SoD enforcement explicit 1 行追加)。v0.3 (2026-05-30): Day 10.1 hygiene patch (CR R15 反映、Slide 7 注記の $10M exact text を「具体閾値 (`BOUNDARY.md` §2)」に paraphrase、§1.1 60min summary table Q&A 4→2 min transitive 適用 [v0.2 で記録した math fix が table row に未適用だった漏れを解消]、関連 P0-1 / Minor) |

---

## 1. 概要 + 60 min 構造

本 doc は Session 4 (2026-06-12 Fri、60 min、audience 10 名) の **narrative SSOT**。slide message + Demo Chapter 1/2 の message spine + BusinessApprovalView mock figure spec を扱う。Demo の execution step (どのボタンを click するか) は `demo/demo-script.md` (Day 20 起稿) に分離する。

### 1.1 60 min 構造

| 時間 (min) | 段        | 内容                                                                                                       |
| ---------- | --------- | ---------------------------------------------------------------------------------------------------------- |
| 0-2        | Intro     | self-intro + Session 4 の outcome 確認 (audience が来週、サンプル業務を選んで設計検討を始められる感触獲得) |
| 2-22       | Slide 1-4 | 課題 → Core message → 案件承認 4-eyes → 3 層承認 (各 5 min)                                                |
| 22-38      | Demo 1    | Demo Chapter 1: UC-BO-01 法人住所変更 (差戻し → staging → 反映観測、Hero 1 画面、Hero 2 / 3 は Demo 2 で展開) |
| 38-46      | Slide 5-7 | Flywheel 全景 → 過去 case 不変 + Alert → Matrix B (各 ~2.5 min)                                            |
| 46-54      | Demo 2    | Demo Chapter 2: AI 日次分析 → ProposalReview → 手順承認 → Metrics 観測                                     |
| 54-58      | Slide 8   | Metrics 4 KPI multi-criteria 仮説 gate + 9 KRI                                                             |
| 58-60      | Q&A       | 想定 2 min (収まらない場合 follow-up channel 明示)                                                         |

合計: Intro 2 min + Slide 1-8 32 min (Slide 1-4 = 5×4 / Slide 5-7 ≈ 2.5×3 / Slide 8 = 4) + Demo 1/2 計 24 min + Q&A 2 min = **60 min**。Q&A は table の 58-60 段 (2 min buffer) で扱う。

### 1.2 audience 想定

- 規模: 10 名
- 構成: 業務責任者層 + Manual 管理者層 + 業務 SME + Security 関係者 + 経営層
- 関心軸: 「自社で来週サンプル業務を選んで設計検討を始められるか」
- **本番運用開始ではない**。Session 4 outcome は「設計検討に踏み出せる感触の獲得」(DOC-OV-00 §5)

### 1.3 narrative の Tier 1/2/3 vocabulary 適用

- Tier 1 語 (`CLAUDE.md` §「Tier 1 語彙」、案件承認 / 手順承認 / 設定承認 / 入力者 / 承認者 / Flywheel / 業務別ファイル群) は slide / 説明で自由使用
- Tier 2 語 (`staging` / `compiled` / `Trust Level` / `Supervised` / `Checkpoint` / `Autonomous` / `Alert` / `差戻し` / `Knowledge`) は UI label / 補助説明で使用、メイン message では言い換え可
- **Tier 3 語 (規制語、詳細 list は `CLAUDE.md` §Tier 3 語彙 / `docs/prior-art-map.md` 参照) は slide / UI label / mock data に出さない** (DOC-APP-02 §10 hedge、`docs/_SSOT.md` Session 4 表層表現規範、self-hit 回避のため本 doc には exact list を置かない)

## 2. 各 slide 詳細 (Slide 1-8)

### 2.1 Slide 1: 現状課題 (二択問題)

**主張**:

> バックオフィス業務は「**一括自動化**」か「**諦める**」の二択に陥りやすい。

**補強**:

- 一括自動化 → 高リスク (例外対応の難しさ + 規制対応の重さで実装が止まる)
- 諦める → 持続不可能 (人手不足 + 退職リスクで現状維持不能)

**visual**: 二択の対比 figure (左: 自動化 lightning + ⚠️、右: 諦める stagnation + ⚠️)、中央 ? mark で第 3 の道への問題提起

**所要時間**: 5 min

### 2.2 Slide 2: Core message + 補助 3 コピー

**主張 (Top message、DOC-ROOT-\_SSOT §「Core Message 表現 SSOT」)**:

> **差戻しを、次の正解手順に変える仕組み**。

**補助 3 コピー (Sub messages)**:

1. AI を一気に自動化するのではなく、現場の差戻しを毎日の改善提案に変える
2. 承認された手順だけを AI に覚えさせる
3. 減らすのは確認作業。残すのは手順変更と AI 設定変更の承認

**Slide 2 で必ず言及**: 「staging knowledge は AI runtime に visible だが、citation 根拠としては承認済み (compiled) のみ使う」(Sub message 2 と staging visibility の論理整合、DOC-FW-01 §3.5 + DOC-OV-00 §1.2 と整合)

**visual**: 差戻し → staging → compiled → 反映の 4 段 mini-flywheel、Top message を主表記

**所要時間**: 5 min

### 2.3 Slide 3: 案件承認 4-eyes + BusinessApprovalView mock figure

**主張**:

> 案件承認は **入力者確認 + 承認者承認 の 2 段** が揃って「4-eyes」を構成する。

**補強**:

- 「入力者確認単独」は 4-eyes ではない (DOC-APP-02、DOC-FW-01 §2.1)
- 入力者確認 = AI 結果の accept / sendback、承認者承認 = 入力者確認後の最終確認
- prototype では承認者画面は実装せず、CaseReview 内 `BusinessApprovalChip` + slide-only mock で代替

**visual**: **BusinessApprovalView mock figure** (本 doc §4 で spec、Day 20 で `demo/static-mocks/business-approval-view.html` 実体化、Day 20 PNG export を slide に挿入)

**所要時間**: 5 min

### 2.4 Slide 4: 3 層承認 + Type A/B/C

**主張**:

> 承認は 3 層: **案件承認** (Slide 3 の 4-eyes) + **手順承認** + **設定承認**。設定承認は変更性質で Type A/B/C に分かれる。

**補強**:

- 案件承認: 個別案件、4-eyes (Slide 3)
- 手順承認: AI が日次分析で **Procedure Update Proposal を自動生成 (Proposal source = AI)**、Manual 管理者がキュー責任 (R = Queue owner)、業務責任者が承認 (A) — DOC-APP-02 §3
- 設定承認: AI 管理者起点、Type A (通常) / B (Security) / C (Automation Maturity) の co-A 構造

**visual**: 3 層承認 box figure (案件 / 手順 / 設定 の 3 行 + 各 RACI summary)

**所要時間**: 5 min

### 2.5 Slide 5: Flywheel 全景 + Knowledge loop

**主張**:

> 差戻し → staging → compiled → 手順承認 → 設定承認 の 5 段 loop で、現場の差戻しが正式手順に蒸留される。

**補強**:

- 5 段の details は DOC-FW-01 §2-6
- staging は AI runtime に visible だが citation 根拠ではない、citation は compiled のみ (Sub message 2 と整合)
- 5-category routing: `misunderstanding / ui_change / edge_case / judgment_gap / data_error` (data_error は compiled 昇格対象外、DOC-KNW-04 §4.5)

**visual**: 5 段 Flywheel circular figure (DOC-OV-00 §4 の ASCII を visual 化)、staging / compiled の weight インジケータ (灰色 / amber / emerald) と citation 凡例

**所要時間**: ~2.5 min

### 2.6 Slide 6: 過去 case 不変 + 関連ルール更新 Alert + audit trail

**主張**:

> 過去 case の AI proposal 本文は **遡って書き換えない** (audit trail 保護)。関連ルール更新時は AI Proposal 画面で Alert を出す。

**補強**:

- 過去 case 不変 = audit trail 保護 (DOC-FW-01 §6.3)
- 関連ルール更新 Alert 3 適用範囲 (DOC-UI-03 §6):
  - 未承認・承認待ち case: CaseReview AiProposalPanel に banner Alert
  - 承認済み過去 case: AuditTrail に timeline 表示
  - 新規 case: 新ルールを通常 citation として参照
- Alert 文言: 「関連手順が更新されています / このcase作成後に承認されたルールがあります / AI提案本文は当時のまま保持されています」

**visual**: timeline figure (過去 case → 反映 → 新 case の 3 段、過去 case 本文は変わらず Alert badge で差分を示す)

**所要時間**: ~2.5 min

### 2.7 Slide 7: Matrix B + slogan + Autonomous footnote (国際送金 1 行)

**主張 (Matrix B 主表現、DOC-ROOT-\_SSOT §「Core Message 表現 SSOT」)**:

> **AIに任せる量は段階的に増やすが、人によるコントロールは渡さない**。

**slogan**:

> 案件確認は減らす。ルール承認は残す。

**Autonomous footnote (Plan v1.4 P2-11)**:

> Autonomous = 人間統制なし、ではない。案件確認がサンプリング化するだけで、手順承認 / 設定承認は同じ強度で残る。

**国際送金 1 行 (Plan v1.4 P0-4、`docs/_SSOT.md` 「Session 4 表層表現規範」適用)**:

> なお、**高額・高リスク取引** (国際送金等) は本 v2 では条件付き制限業務 (boundary pack のみ docs) とし、自動化対象外。具体閾値は Phase 1 で業務・法務・リスク観点から検証する。

**注**:

- 高額閾値の具体数値は出さない (具体閾値は boundary pack 内部 `workflows/international-transfer-boundary/BOUNDARY.md` §2 + `_meta.yaml` の `[hypothesis_requires_validation]` ラベル付き仮値のみ)
- Tier 3 規制語 (詳細 list は `CLAUDE.md` §Tier 3 語彙 / `docs/prior-art-map.md` 参照) は出さない (DOC-APP-02 §10 hedge、self-hit 回避のため本 doc には exact list を置かない)
- demo 操作なし (DOC-WF-international-transfer-workflow §5)

**visual**: Matrix B 表 (Automation 段階 × 案件承認 / 手順承認 / 設定承認 の介在頻度)、Autonomous footnote は小字で添える、国際送金は表外 callout で 1 行

**所要時間**: ~2.5 min

### 2.8 Slide 8: Metrics 4 KPI multi-criteria 仮説 gate + 9 KRI

**主張**:

> AI Automation Maturity の進化判断は **4 KPI multi-criteria 仮説 gate** で行う。本 v2 phase の数値は **target hypothesis**、本番導入可否を判定する gate ではない。

**補強 (DOC-MON-05 §4 + §9)**:

- 4 KPI target hypothesis:
  - AI 入力承認率 ≥ 99% `[仮説 / 要検証]`
  - 人手上書き率 ≤ 1% `[仮説 / 要検証]` (実質修正のみ)
  - Alert 発生率 ≤ 5% `[仮説 / 要検証]` (precision / FP 併記)
  - 承認者差戻し率 ≤ 1% `[仮説 / 要検証]` (二重カウント防止)
- **本番導入可否を判定する gate ではない、Phase 1 で測定・再設定する検証仮説**
- 9 KRI catalogue (DOC-MON-05 §6): drift / spike / FP 急増 / UI drift / conflict 等の異常検知

**visual**: 4 KPI 並列 card (Hero 3 = Metrics 画面 mock figure、DOC-UI-03 §4.8 と整合)、各 card 下に `[仮説 / 要検証]` caption、PageHeader 直下に「本番導入可否を判定する gate ではない」注

**所要時間**: 4 min

## 3. Demo Chapter 1/2 message spine

Demo の execution step (どの画面の何を click するか) は `demo/demo-script.md` (Day 20 起稿) に分離。本 doc は **何を伝えるか** の message spine のみ扱う。

### 3.1 Demo Chapter 1: UC-BO-01 法人住所変更 (22-38 min)

**目的**: audience に「差戻しが当日中に staging knowledge として反映される」体験を mock で示す。

**画面遷移 (Hero designation = demo-script 遷移順序のみ、polish target は 9 画面 ALL 95% target equal、Plan v1.4.1 Fix 3)**:

1. **Inbox (`/inbox`) [Demo Chapter 1 起点]**: AI 処理待ち case を見せる
2. **CaseReview (`/cases/:id`) [Hero 1]**: AI 入力結果 + 証跡 + AiProposalPanel (citation + staging hint + Alert UI 適用範囲 1) を見せる
3. **SendBackComment**: 差戻し送信 (5-category 選択 + free-text)
4. **CaseReview 戻り**: staging knowledge が同一セッション内に runtime visible に反映されたことを AiProposalPanel hint で示す
5. **AuditTrail (`/audit`) (任意)**: state transition log で「いつ staging が生成されたか」を示す

**message spine**:

- 「差戻しが当日中に staging knowledge として AI runtime に visible になる (citation 根拠ではなく hint としての visible)」
- 「Sub message 2: 承認された手順だけを AI に覚えさせる、と staging visibility の境界線」

**所要時間**: 16 min

### 3.2 Demo Chapter 2: AI 日次分析 → ProposalReview → 手順承認 → Metrics (46-54 min)

**目的**: audience に「AI が日次分析で Procedure Update Proposal を自動生成、Manual 管理者 + 業務責任者が承認すると compiled に昇格し、Metrics に反映される」体験を mock で示す。

**画面遷移**:

1. **Dashboard (`/dashboard`)**: 業務 card で「同種差戻しが 3+ 件再発」状態を示す
2. **ProposalReview (`/proposals/:id`) [Hero 2]**: AI が自動生成した Procedure Update Proposal を見せる (Proposal source: AI / R: Manual 管理者 / A: 業務責任者 の RACI box、proposed diff)
3. **Manual 管理者 triage**: forward 業務責任者 (**mock data 上で Manual 管理者と業務責任者は異なる person 表記、SoD enforcement の demo 上 visualization、DOC-APP-02 §9.8 既定**)
4. **業務責任者 approve**: compiled 昇格 + workflow.md / agent-instructions.md / approval-policy.md diff 適用
5. **Metrics (`/metrics`) [Hero 3]**: 4 KPI target hypothesis 達成 trend を見せる (PageHeader 直下に「本番導入可否を判定する gate ではない」注表示)

**message spine**:

- 「AI が Proposal source、Manual 管理者が Queue owner、業務責任者が Approver の 3 主体構造」
- 「縮小するのは案件承認の介在頻度のみ。手順承認 / 設定承認 loop は Automation Maturity 進化後も同じ強度で残る (Matrix B 主表現)」
- 「4 KPI は Phase 1 検証仮説、本番導入可否を判定する gate ではない」

**所要時間**: 8 min

## 4. BusinessApprovalView mock figure spec (Slide 3 内)

承認者画面 (`/business-approval`) は本 v2 prototype では画面化しない (DOC-OV-00 §3 scope-out、DOC-UI-03 §7)。代わりに Slide 3 内に mock figure を表示。本 §4 が figure の **spec SSOT**、Day 20 で `demo/static-mocks/business-approval-view.html` として実体化 + PNG export。

### 4.1 figure 内容

- **PageHeader**: 「承認者承認画面 (mock、slide 用)」+ Prototype mode label (v1.4 Commit 4 U-8、旧 `業務承認画面` から rename、HTML mock impl と整合)
- **case 概要 card**: case_id / workflow (UC-BO-01) / 入力者確認 status (済 + 入力者名) / 申請日時
- **AI 入力結果 summary**: 主要 field (住所 / 法人名 / 申請理由) の AI 結果 + diff (申請前後)
- **証跡 thumbnail list**: PDF サムネ / screenshot stack (Day 11+ 実装の mock 画像を流用)
- **AiProposalPanel summary**: citation list (compiled 2-3 件) + Alert UI 適用範囲 1 (banner 形式、「関連手順が更新されています」)
- **承認者 action box**: approve / sendback button + コメント field (mock、click 不可)
- **footer**: 承認後の遷移先説明 (本 mock では遷移なし、説明文のみ)

### 4.2 design token

- DOC-UI-03 §2 (Stripe 風 design language SSOT) と整合
- 色 / typography / spacing / shadow / animation 全て同じ token を使用 (Tailwind CDN 1 file HTML、Day 20 実体化)
- Prototype mode label を必ず表示 (Plan v1.4 P0-3 / v1.4.1 Fix 5)

### 4.3 PNG export

- **Day 20 実体化済 (2026-05-23)**: `demo/static-mocks/business-approval-view.html` を Playwright headless chromium で screenshot、`demo/screenshots/business-approval-view.png` に export 済 (viewport 1280×1600、full-page、286KB)
- **再生成手順** (project root から実行):
  ```bash
  # Terminal A: 静的 HTML serve (port 5182、任意の空き port に変更可)
  python3 -m http.server 5182 --directory demo/static-mocks
  # Terminal B: Playwright で full-page screenshot
  cd prototype && npx playwright screenshot \
    --viewport-size 1280,1600 --full-page --wait-for-timeout 1500 \
    http://localhost:5182/business-approval-view.html \
    ../demo/screenshots/business-approval-view.png
  ```
- Slide 3 visual として slide deck に挿入
- **CR 案 B 同時実装**: `BusinessApprovalChip.tsx` を Day 20 で再 enabled、`window.open(import.meta.env.BASE_URL + 'demo/business-approval-view.html', '_blank')` で CaseReview footer から別タブ起動可。Vite が `prototype/public/demo/business-approval-view.html` (symlink → canonical SSOT) を serve、`BASE_URL` 起点で dev / production root deploy / GitHub Pages sub-path deploy 全て resolves (`vite.config.ts` の `base: process.env.VITE_BASE_PATH ?? '/'` と整合)

## 5. 規制語 hedge (Tier 3 不在原則)

Session 4 narrative は **Tier 3 規制語を出さない** (DOC-APP-02 §10 + `CLAUDE.md` §「Tier 3 語彙」):

- slide / UI label / mock data に出さない: Tier 3 規制語 (詳細 list は `CLAUDE.md` §Tier 3 語彙 / `docs/prior-art-map.md` 参照、self-hit 回避のため本 doc には exact list を置かない)
- 国際送金は「**高額・高リスク取引**」と抽象化 (Slide 7、Plan v1.4 P0-4)
- 規制論拠は外部 cite せず、ai-operator paper への reference link 経由のみ (内部 docs)
- audience 質問で Tier 3 語が出た場合は「具体的な規制名は Phase 1 で external regulatory review を経て扱う、本 v2 は設計検討段階」と返す

**Day 19 / Day 21 grep**: `CLAUDE.md` Tier 3 語彙の exact list を grep target として、`docs/06-session4-narrative.md` (本 doc) / `demo/demo-script.md` / `demo/static-mocks/` / `prototype/src/data/` の **slide 本文 / UI label / mock data 用 string が 0 件** であることを確認 (CLAUDE.md scope-out / `docs/_SSOT.md` §規制語 hedge)。本 doc 内の rule description (本 §5 / §1.3) は gate scope 外 (self-hit 回避)。

## 6. 関連文書

- DOC-OV-00 §1 (Core message、本 doc Slide 2 / 5 と整合) + §4 (Flywheel 1 枚図、Slide 5 と整合) + §5 (想定 outcome、Session 4 全体の goal 確認)
- DOC-FW-01 §2-§6 (Flywheel 5 段詳細、Slide 5 narrative + Demo Chapter 1/2 の根拠) + §3.5 (staging safety boundary、Slide 2 + Slide 5 と整合) + §6.3 (過去 case 不変 + Alert、Slide 6 と整合) + §7.1 (Matrix B 主表現、Slide 7 と整合)
- DOC-APP-02 §3 (手順承認 RACI、Slide 4 + Demo Chapter 2 と整合) + §7 (Matrix B + Automation Maturity、Slide 7 と整合) + §10 (規制 cite hedge、§5 と整合)
- DOC-UI-03 §4 (9 画面 Screen Card、Demo Chapter 1/2 画面遷移と整合) + §6 (Alert UI 3 適用範囲、Slide 6 と整合) + §7 (BusinessApprovalChip、Slide 3 と整合) + §8 (Prototype mode label、§4 figure spec と整合)
- DOC-KNW-04 §4 (5-category routing、Slide 5 と整合) + §6 (staging usage rules、Slide 2 + Slide 5 と整合)
- DOC-MON-05 §4 (4 KPI multi-criteria 仮説 gate、Slide 8 SSOT) + §6 (9 KRI catalogue、Slide 8 と整合) + §9 (「仮説 gate / target hypothesis」表現規範、Slide 8 注表現 SSOT)
- DOC-ROOT-\_SSOT §「Core Message 表現 SSOT」(本 doc Slide 2 + Slide 7 SSOT) + §「Session 4 表層表現規範」(Slide 7 国際送金 1 行 SSOT)
- `demo/demo-script.md` (Day 20 起稿、本 doc §3 の execution step を担当)
- `demo/static-mocks/business-approval-view.html` (Day 20 実体化、本 doc §4 spec を実装)
- `~/.claude/plans/ai-backoffice-ai-virtual-muffin.md` Plan v1.4 P0-4 (国際送金 表層抽象化) + P2-11 (Autonomous footnote)
