# Operational Journey Audit — 実オペレーション逆算の証跡ドキュメント

> **本 file は Process-First 再設計の single source of truth**。
> 各 role の実オペレーション walkthrough を起こし、各 step で必要な情報 / 操作 / validation / reconcile を洗い出し、現 12 HTML (Phase 1A/B/C 成果物) との gap を記録する。再設計の全要件はここから逆算する。
>
> 作成根拠: user review (2026-05-27) の 16 指摘 + 業務フロー SSOT (`docs/02-approval-model.md` 3 層承認 + 4-eyes + Automation Maturity)。

---

## 0. 業務フロー SSOT (前提)

### 3 層承認 (docs/02 §1)
| 層 | 何を承認 | 構造 |
|---|---|---|
| **案件承認** | 個別案件の AI 入力結果 | 4-eyes (入力者確認 + 承認者承認)、SoD: 入力者 ≠ 承認者 |
| **手順承認** | 差戻しコメント → 正式手順への昇格 | AI 日次分析が Proposal 生成 → Manual 管理者 triage → 業務責任者承認 |
| **設定承認** | Agent / Model / Tool 変更 | AI 管理者申請 → 業務責任者承認 |

### Case Lifecycle (docs/02 §2.2)
```
受付 → AI 処理 → 入力者確認 → 承認者承認 → 反映
```

### Automation Maturity (docs/02 §1)
- **Supervised**: 全件 4-eyes (Day1 default)
- **Checkpoint**: 重要分岐のみ 4-eyes、他は AI 自動
- **Autonomous**: サンプリング (将来)

### 業務 Process (2、全 entity が workflowId 保持)
- **UC-BO-01 法人住所変更** (Agent: agent-corporate-address-change)
- **UC-BO-02 口座開設書類完備** (Agent: agent-account-opening)

---

## 1. Role 定義 (6 role、主要 journey 5)

| Role | 別名 | 主タスク | 関与する承認層 |
|---|---|---|---|
| **入力者** | Maker | AI 入力結果を申請書類と突合し accept / 差戻し | 案件承認 (前半) |
| **承認者** | Checker | 入力者確認済の最終承認 | 案件承認 (後半) |
| **Manual 管理者** | Queue owner | 手順承認 Proposal の triage / forward / reject | 手順承認 (R) |
| **業務責任者** | Business Owner | 手順承認・設定承認の最終承認 | 手順承認・設定承認 (A) |
| **AI 管理者** | Agent 設定者 | Agent config 変更・Trust 昇格を申請 | 設定承認 (申請) |
| **監査者** | Auditor | 業務 Process 別に監査証跡・メトリクスを確認 | 全層を read-only で監視 |

---

## 2. Role × Journey walkthrough (現 UI gap 付き)

各 step の凡例: **必要情報** = その step で見えるべき情報 / **操作** = 実行すべきアクション / **gap** = 現 12 HTML の不足 / **要件** = 再設計要件 ID。

### 2.1 入力者 (Maker) Journey — 「AI 入力を申請書類と突合し処理する」

| # | step | 必要情報 | 操作 | 現 UI gap | 要件 ID |
|---|---|---|---|---|---|
| M1 | 自分の担当案件を確認 | **業務 Process 別**に自分の未処理 queue | Process 選択 → 案件選択 | Queue は Process 横断フラット、Process 別動線なし | **R-PROC-01** |
| M2 | 案件を開く | 案件サマリ | row click | Queue 右パネルが default 表示 (clutter)、click で開く UX でない | **R-QUEUE-01** |
| M3 | **AI 入力結果を申請書類 (OCR/PDF) と突合** | AI 入力値 / 申請書類の対応値 / 一致・不一致 | 項目ごと照合 | ❌ **reconcile UI 不在**。confidence 0.84 生数字のみで、何を確認すべきか不明 | **R-RECON-01** (最重要) |
| M4 | 不一致項目を判定 | どの項目が「要確認」か | 目視 | ❌ 要確認 flag なし、全項目を生 confidence で並べるだけ | **R-RECON-02** |
| M5 | 問題なければ承認 | 承認後の遷移先 (承認者へ) | 承認 click | 承認ボタンあり (OK) | — |
| M6 | 問題あれば差戻し (コメント付き) | 5-category 分類 + 理由 | 差戻し click → コメント入力 | ❌ **コメント未入力でも差戻し可能** (validation なし) | **R-VALID-01** |
| M7 | 差戻し送信 | 差戻し先 (AI 再処理 staging へ) | 送信 | SendBackComment あり (OK)、ただし別 route → 同 page section が望ましい | R-CASE-01 |

**入力者 journey の致命 gap**: M3-M4 (reconcile)。この role の本質は「AI 入力 vs 申請書類の照合」だが、現 UI は照合 UI がなく confidence 数字を見せるだけ。**この画面でオペレーションが完結しない** (user CaseDetail #3 の核心)。

### 2.2 承認者 (Checker) Journey — 「入力者確認済を最終承認する」

| # | step | 必要情報 | 操作 | 現 UI gap | 要件 ID |
|---|---|---|---|---|---|
| C1 | 入力者確認済の案件を確認 | **Process 別**の承認待ち queue | 案件選択 | ❌ **承認者画面が存在しない** (旧 scope-out)。user Observatory #3 で「承認者の確認・承認があるべき」と要求 | **R-APPR-01** |
| C2 | 入力者の判断 + AI 入力結果を確認 | 入力者が何を承認/修正したか + reconcile 結果 | レビュー | ❌ | R-APPR-02 |
| C3 | 最終承認 or 差戻し | 承認後 = 反映 / 差戻し = 入力者へ戻る | 承認 click | ❌ BusinessApprovalChip static mock のみ | R-APPR-03 |

**承認者 journey の致命 gap**: 画面そのものが不在。4-eyes の片翼が UI 化されていない。再設計で **承認者 queue + 承認 detail を新設** (CaseDetail を承認者 mode で再利用も可)。

### 2.3 Manual 管理者 (Queue owner) Journey — 「手順改定提案を triage する」

| # | step | 必要情報 | 操作 | 現 UI gap | 要件 ID |
|---|---|---|---|---|---|
| Q1 | AI 生成の提案一覧を確認 | **Process 別**の pending 提案、各提案が「どの Process のどの部分か」 | 提案選択 | ❌ **提案一覧が存在しない** (detail 直行)。user Proposal #1 | **R-PROP-01** |
| Q2 | 提案の中身を確認 | どの差戻しパターンから生まれたか / 影響 case 数 | レビュー | ProposalDetail あり (部分) | — |
| Q3 | **判定基準 vs 実績値を照合** | 判定基準 + **実測値** (例: OCR 信頼度 0.85→0.88 提案なら現状の実績分布) | 比較 | ❌ 判定基準はあるが **実績値なし**。user Proposal #2 | **R-PROP-02** |
| Q4 | **改定の影響を確認** | このルール改定で **何がどう変わるか** (before/after、影響 case 数) | 影響評価 | ❌ **consequence/before-after 不在**。user Proposal #3 | **R-PROP-03** |
| Q5 | triage (forward / reject) | forward 先 = 業務責任者 | forward click | 業務責任者へ送付ボタンあり (OK) | — |

### 2.4 業務責任者 (Business Owner) Journey — 「手順・設定を最終承認する」

| # | step | 必要情報 | 操作 | 現 UI gap | 要件 ID |
|---|---|---|---|---|---|
| B1 | forward された提案/設定変更を確認 | 提案/変更の要約 + Manual 管理者の triage 判断 | レビュー | 部分 (ProposalDetail 流用可) | R-PROP-04 |
| B2 | 最終承認 | 承認後の反映範囲 (workflow.md 等への diff) | 承認 click | 部分 | — |

### 2.5 AI 管理者 (Agent 設定者) Journey — 「Agent の Trust を昇格申請する」

| # | step | 必要情報 | 操作 | 現 UI gap | 要件 ID |
|---|---|---|---|---|---|
| A1 | 全 Agent の状態を確認 | **Agent 一覧** (Process / Trust Level / 直近パフォーマンス) | Agent 選択 | ❌ **Agent 一覧が存在しない** (detail 直行)。user Agent #2 | **R-AGENT-01** |
| A2 | 特定 Agent を開く | Agent config + 現 Trust Level | — | AgentDetail あり | — |
| A3 | **Trust 昇格を検討** | **各 Metrics の実数値 vs あらかじめ定義した Threshold の比較** | 数値評価 | ❌ 「進化要件達成度 75%」の集約値のみ。**実 metrics vs threshold が見えない**。user Agent #1 | **R-AGENT-02** (最重要) |
| A4 | **昇格の影響を確認** | 昇格すると **全件人レビュー → どう変わるか** (Supervised→Checkpoint で何が自動化されるか) | consequence 評価 | ❌ **Consequence 不在**。user Agent #3 | **R-AGENT-03** |
| A5 | 設定変更を申請 | 申請先 = 業務責任者 (設定承認) | 申請 click | 申請ボタンあり (OK) | — |

### 2.6 監査者 (Auditor) Journey — 「Process 別に証跡・精度を監視する」

| # | step | 必要情報 | 操作 | 現 UI gap | 要件 ID |
|---|---|---|---|---|---|
| AU1 | 監視対象の業務 Process を選ぶ | **Process 別**の監査 entry | Process 選択 | ❌ Observatory が Process 横断のみ。user Observatory #1 | **R-OBS-01** |
| AU2 | 各 case の lifecycle を時系列で追う | 受付→AI処理→**入力者確認→承認者承認**→反映 の正しい順序、各 event の actor + 時刻 | timeline 追跡 | ❌ timestamp 順で異 case event が混在し case lifecycle を追えない。**AI 入力時刻が出ない** (user Obs #2)、**承認者 event 欠落 + 順序矛盾** (user Obs #3) | **R-OBS-02** |
| AU3 | 内部用語を排除した表現 | 「日次提案分析」等の業務語 | 読解 | ❌ 「cron trigger」が UI に露出 (user Obs #3) | **R-OBS-03** |
| AU4 | **Process 別の AI 精度・KPI を確認** | 各 Process の AI 入力承認率 / 上書き率 / Alert 率 / 差戻し率 | メトリクス参照 | ❌ メトリクス全社合算。user Observatory #4 | **R-OBS-04** |
| AU5 | **Process 別のナレッジを確認** | 各 Process の compiled knowledge | ナレッジ参照 | ❌ ナレッジ フラット並列。user Observatory #5 | **R-OBS-05** |

---

## 3. 横断 gap summary (5 theme への集約)

| Theme | gap | 該当要件 ID | 影響画面 |
|---|---|---|---|
| **T1 業務 Process 軸の欠落** | 全 journey が Process 起点を必要とするが、UI は機能横断フラット | R-PROC-01, R-OBS-01/04/05, Hub #1 | 全画面 |
| **T2 master-detail の master 欠如** | Agent 一覧・提案一覧・承認者 queue が不在 | R-AGENT-01, R-PROP-01, R-APPR-01 | Agent / Proposal / 承認者 |
| **T3 意思決定支援情報の欠如** | 実数値 vs 閾値 / consequence / before-after がない | R-AGENT-02/03, R-PROP-02/03, R-QUEUE-02 | Agent / Proposal / Queue |
| **T4 confidence 生数字の露出** | 0.84 等を行動に紐づけず表示 | R-RECON-01/02 (reconcile に置換) | CaseDetail / Queue |
| **T5 オペレーション完結性の欠如** | reconcile / validation / 監査 timeline / 承認者画面の不在 | R-RECON-01, R-VALID-01, R-OBS-02/03, R-APPR-01 | CaseDetail / 承認者 / Observatory |

---

## 4. 要件一覧 (再設計の acceptance source、全 18 件)

| ID | 要件 | 優先度 | Day1 可否 |
|---|---|---|---|
| **R-PROC-01** | 業務 Process を第一階層の組織軸にする (Sidebar = Process list、各 Process 内に機能をネスト) | P0 | ✅ |
| **R-QUEUE-01** | Queue 右パネルは default 非表示、row click で開く | P0 | ✅ |
| **R-QUEUE-02** | Queue 右パネルで「何が変わったか」(変更内容) を表示 | P1 | ✅ |
| **R-RECON-01** | CaseDetail に **AI 入力 vs 申請書類 (OCR) reconcile UI** を新設、一致/不一致を表示 | P0 (最重要) | ✅ (rule-based、ML 不要) |
| **R-RECON-02** | confidence 生数字を全削除、不一致のみ「要確認」flag | P0 | ✅ |
| **R-VALID-01** | 差戻しはコメント未入力なら Error で即時入力促す validation | P0 | ✅ |
| **R-CASE-01** | 差戻しコメントは別 route でなく CaseDetail 同 page section | P1 | ✅ |
| **R-APPR-01** | **承認者 queue + 承認 detail を新設** (4-eyes 後半の UI 化) | P0 | ✅ |
| **R-APPR-02** | 承認者画面で入力者の判断 + reconcile 結果を表示 | P0 | ✅ |
| **R-APPR-03** | 承認者の最終承認 / 差戻し動線 | P0 | ✅ |
| **R-PROP-01** | **提案一覧を新設** (Process 別、どの Process のどの部分か明示) | P0 | ✅ |
| **R-PROP-02** | 判定基準に **実測値** を併記 | P0 | ✅ |
| **R-PROP-03** | ルール改定の **before/after・影響 case 数 (consequence)** を表示 | P0 | ✅ |
| **R-PROP-04** | 業務責任者の最終承認動線 | P1 | ✅ |
| **R-AGENT-01** | **Agent 一覧を新設** (Process / Trust / 直近パフォーマンス) | P0 | ✅ |
| **R-AGENT-02** | Trust 昇格画面で **実 Metrics vs Threshold の比較**を表示 (進化要件 % を置換) | P0 (最重要) | ✅ (実績値は集計可能) |
| **R-AGENT-03** | Trust 昇格の **Consequence (全件人レビュー → どう変わるか)** を表示 | P0 | ✅ |
| **R-OBS-01** | Observatory を Process 別に切替可能化 (監査 / メトリクス / ナレッジ全 tab) | P0 | ✅ |
| **R-OBS-02** | 監査 timeline を **case lifecycle 順** (受付→AI→入力者→承認者→反映) に整理、AI 入力時刻明示、承認者 event 追加 | P0 | ✅ |
| **R-OBS-03** | 内部用語 (cron trigger 等) を業務語 (日次提案分析) に置換 | P1 | ✅ |
| **R-OBS-04** | メトリクスを Process 別 AI 精度・KPI に分解 | P0 | ✅ |
| **R-OBS-05** | ナレッジを Process 別 grouping | P1 | ✅ |

**全 18 要件が Day1 実装可能** (ML calibrated confidence のみ将来 backlog、reconcile は rule-based で代替)。

---

## 5. confidence / reconcile の扱い (T4 詳細)

### Day1 (本再設計)
- confidence 生数字 (0.96 / 0.84 / field 平均) を **全画面から削除**
- 代わりに **rule-based reconcile** を CaseDetail / 承認者画面 / Queue drawer に実装:
  - AI 入力値 vs 申請書類 (OCR raw text) vs マスタ照合結果 の 3 者突合
  - 完全一致 = 「確認済」(緑)、不一致 = 「要確認」(amber)、欠損 = 「未取得」(灰)
  - ユーザは数字でなく「どの項目を人が確認すべきか」だけ見ればよい
- ML 不要、ルールベース (文字列一致 / 差分検出) で Day1 実装可能

### 将来 (backlog)
- ML calibrated confidence (過去事例ベース) は学習データ蓄積後
- 表示方法は項目毎数字ではなく別途 UX 検討 (例: 「優先確認順」「過去 N 件 M% 正確」の信頼区間)

---

## 6. Process-First IA への含意 (次工程の入力)

本 audit から、Process-First IA は以下を満たす必要がある:

1. **Sidebar = 業務 Process list** (法人住所変更 / 口座開設書類完備)、各 Process が組織の第一軸
2. **Process 内に role 別 entry**: 案件 queue (入力者) / 承認待ち (承認者) / Agent / 提案 / 監査 / メトリクス / ナレッジ
3. **横断 Hub**: 全 Process の Alert を Process tag 付きで集約、drill で Process 内へ
4. **新設 master 画面**: Agent 一覧 / 提案一覧 / 承認者 queue
5. **意思決定支援の埋め込み**: reconcile (CaseDetail/承認者)、実 metrics vs threshold (Agent)、before/after (Proposal/Agent)
6. **operational completeness**: validation (差戻し)、timeline 順序修正 (監査)

→ 詳細 IA は次工程 `ia-overview-v2.md` (or ia-overview.md 改訂) で確定。各画面の再設計方針は本 audit の要件 ID を acceptance に逆算する。

---

## Change Log

| Date | Change |
|---|---|
| 2026-05-27 | 初版作成。user review 16 指摘 + 業務フロー SSOT (docs/02) から 4-6 role journey を起こし、18 要件を逆算。Process-First 再設計の single source |
