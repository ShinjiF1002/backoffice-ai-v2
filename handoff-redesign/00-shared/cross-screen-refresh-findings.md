# Cross-Screen Refresh Findings (pilot review rev.3、検証完全性・証拠アンカー・操作単純化)

> CaseDetail pilot review rev.3 (全項目+PDF併置 / ボタン1セット / 観測rename) から抽出した原則を全画面に波及検討。前回 rev.1-2 = ワークフロー言語化軸。本 doc = それと直交する**新軸**。8 画面生成時 (pilot 合格後) に本 findings を各 prompt に反映する。

## 軸の本質

承認系画面の operator タスク = **AI 出力に責任を持って sign-off する**こと。そのために必要な 3 条件が前回まで不足していた:
1. 判断対象の**全体**が見える (注意項目だけでは不足)
2. 判断の**一次証拠**が読めるサイズで併置される
3. **決定面が単一**で迷わない

## 4 原則

| 原則 | 定義 | なぜ重要か |
|---|---|---|
| **A 全体レビュー可能性** | 判断対象の全体を default 表示。注意項目だけ出し残りを隠さない (注意順 OK、折りたたみ default NG) | sign-off の説明責任 + 「AI が自信を持って間違える未フラグ誤り」(reconcile §7) は隠れた所に潜む。隠す設計は自分の脅威モデルと矛盾 |
| **B 証拠アンカー可視性** | 一次証拠を参照 chip でなく読めるサイズで併置、入力値と相互リンク | 照合は「証拠と入力値を見比べる」行為。証拠が小さいと照合が成立しない |
| **C 単一決定面** | standing 決定ボタンは 1 セット。object 決定と部分操作を 2 セット併存させない | 2 セットは「どれが本筋の決定か」を曖昧化 (confusing) |
| **D nav/label 平易化** | 内部概念名を operator 語に | 内部語の nav は機能を誤認させる |

## 画面別 同種修正箇所

| 画面 | 型 | A 該当 | B 該当 | C 該当 | D 該当 |
|---|---|---|---|---|---|
| 1 Hub | A | — (monitoring) | — | — | nav 確認 (ハブ は許容) |
| 2 案件一覧 | B | — (queue は filter 前提) | — | — | — |
| 3 承認待ち | B | — | — | — | — |
| **4 案件詳細** | C | ★ 一致 折りたたみ→全件表示 | ★ PDF 小→読めるサイズ併置 | ★ field/footer 2 セット→footer 1 セット | — (本画面で確定済 rev.3) |
| 5 提案一覧 | B | — | — | — | — |
| **6 提案詳細** | C | ★ diff だけ→手順 before/after 全体 | ★ 根拠差戻し case を読める形で | ★ forward/reject と承認/差戻しを mode 出し分け | — |
| 7 エージェント一覧 | B | — | — | — | — |
| **8 エージェント詳細** | C | ★ 未達 KPI だけ→4 KPI 全件 | ★ metrics の裏の実行履歴/sample 参照可 | ★ 申請ボタンに整理 (競合なし) | — |
| **9 モニタリング** | A | — (監査 view は証跡そのもの) | — | — | ★ 観測→モニタリング |

→ **C 型 detail 3 画面 (4/6/8) が A・B・C すべてに該当** (CaseDetail と同型の sign-off 画面)。B 型一覧と A 型 Hub は該当薄 (一覧は filter/triage が役割、Hub は俯瞰)。D は nav の観測のみ。

## 各画面の具体修正 (8 画面生成時に prompt へ反映)

### 6 提案詳細 (ProposalDetail)
- **A**: 改定 diff (例: 閾値 0.85→0.88) だけでなく、**手順全体の before/after** を見せ、どこが変わるかを全体の中で示す。
- **B**: 提案の根拠 = `mock-fixture §10 日次提案分析` が拾った**実際の差戻し case 群**を、要約でなく原文 (差戻しコメント) を読める形でリスト + 開閉。
- **C**: Manual 管理者 mode = forward / reject、業務責任者 mode = 承認 / 差戻し。**mode 切替で 1 セットのみ表示** (2 セット同時禁止)。MetricVsThreshold / ConsequencePanel は判断材料として併置。

### 8 エージェント詳細 (AgentDetail)
- **A**: 4 KPI (承認率 / 上書き率 / Alert / 差戻し率) を**全件表示** (未達の承認率だけ出さない)。`mock-fixture §5`。「75% 集約値」は既に否定済 (F-06) で方向一致。
- **B**: 各 metric の裏付け = 実行履歴 / sample case を参照可能に (metric の数字だけでなく根拠 case へ drill)。
- **C**: standing は「設定変更を申請」1 つ。補助操作 (履歴/rollback 説明) は競合 cluster にしない。

### 9 モニタリング (Observatory)
- **D**: UI ラベル「観測」→「**モニタリング**」(sidebar nav + 画面タイトル + breadcrumb)。route `/observatory` / 内部名は維持。

## 適用方針

- 本軸の原則 A-C は `screen-contracts-v2.md` §全画面共通 検証・操作原則 に bake 済 → 8 画面生成時に自動参照。
- 原則 D (rename) は `ia-overview-v2.md` / `process-selector-spec.md` / `mock-fixture-spec-v2.md` に反映済。
- CaseDetail rev.3 は `reconcile-panel-spec.md` §5/§8/§9 + `prompts/04-case-detail-mockup.md` に具体化済 (本軸の pilot)。
- 6/8/9 の具体修正は pilot 合格後の prompt 生成時に上記を各 prompt の Layout/Anti-pattern に展開。
