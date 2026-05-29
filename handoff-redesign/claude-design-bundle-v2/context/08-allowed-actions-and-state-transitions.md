# Allowed Actions + State Transitions (R-VALID, operate 完了条件)

> 各 object (案件 / 提案 / Agent) の **status × role で実行可能な操作 / enabled 条件 / 必須コメント / 次 status / audit event / SoD / escalation** を定義。operate がこの table で完結する (見るべき情報だけでなく、できる操作と帰結を固定)。

## 1. 案件 (Case)

status: `pending` (AI処理中) / `ready` (入力者確認待ち) / `sent-back` (差戻し再処理) / `business-approval-waiting` (承認者待ち) / `reflected` (反映済)

| status | role | 許可操作 | enabled 条件 | 次 status | audit event |
|---|---|---|---|---|---|
| pending | (なし) | 監視のみ | — | AI 完了で自動 ready | `ai_input` |
| ready | 入力者 | **承認** | 全 field reconcile が 一致/正規化一致/手入力確認済 | business-approval-waiting | `human_review` (approve) |
| ready | 入力者 | **差戻し** | 5-category 選択 + **コメント必須** | sent-back | `human_sendback` |
| ready | 入力者 | field override | override 理由必須 | (same) | `field_override` |
| ready | 入力者 | escalate | 判断不能 | (escalation lane) | `escalate` |
| business-approval-waiting | 承認者 | **最終承認** | 入力者承認済 + **SoD (承認者 ≠ 入力者)** | reflected | `business_approve` |
| business-approval-waiting | 承認者 | 差戻し | コメント必須 | sent-back (入力者へ) | `human_sendback` |
| sent-back | (なし) | AI 再処理 | — | ready | `ai_input` (retry) |
| reflected | (なし) | 参照のみ | — | (終端) | — |

**SoD**: 入力者 ≠ 承認者 を system 強制 (同一人物の self-approval 禁止)。
**escalation**: reconcile エスカレーション or Alert 判断不能 → Matrix C escalation lane (業務責任者介入)。

## 2. 提案 (Proposal)

status: `pending-triage` / `forwarded` / `approved` / `rejected`

| status | role | 許可操作 | enabled 条件 | 次 status | audit event |
|---|---|---|---|---|---|
| pending-triage | Manual 管理者 | **forward** | 判定基準 + 実績値 (MetricVsThreshold) 確認 | forwarded | `proposal_forward` |
| pending-triage | Manual 管理者 | reject | 理由必須 | rejected | `proposal_reject` |
| forwarded | 業務責任者 | **承認** | consequence (before/after) 確認 | approved | `proposal_approve` (config 反映 trigger) |
| forwarded | 業務責任者 | 差戻し | 理由必須 | pending-triage | `proposal_sendback` |

## 3. Agent 設定 (Trust 昇格)

| 操作 | role | enabled 条件 | audit event |
|---|---|---|---|
| **設定変更を申請** | AI 管理者 | MetricVsThreshold (実績 vs 閾値) 確認 + ConsequencePanel 確認 | `config_change_request` |
| **設定承認** | 業務責任者 | 申請内容 + consequence + SoD | `config_approve` |
| 設定差戻し | 業務責任者 | 理由必須 | `config_sendback` |

## 4. Validation 規範 (R-VALID-01)

- **差戻し**: コメント未入力で button 押下 → **即 error + 入力 focus** (送信させない)
- **field override**: 理由未入力で確定不可
- **案件承認**: reconcile 要確認 field が残る状態で「承認」button は **disabled** (tooltip: 「要確認 N 項目を解消してください」)
- **提案 forward / Agent 申請**: 必須確認項目 (実績値 / consequence) 未閲覧なら CTA disabled or 確認 prompt

### 4.1 field「項目の対応」統合 modal (pilot review ③)

field 単位の **override / 差戻し / エスカレーションは 1 つの UI modal「項目の対応」に統合**する (`window.prompt` は使わない)。これは *入力 UI の統合* であり、data 層の status 遷移・SoD・audit event は §1 の table どおり別物として保持する。

| modal 内の対応 | 共有入力 | 結果 (outcome、modal 内に 1 行明示) | data: 次 status | data: audit event |
|---|---|---|---|---|
| 手入力で上書き | 値 + **理由必須** | この案件内で確定し、承認へ進む | (same) ready | `field_override` |
| 差戻し | 5-category + **コメント必須** | 案件全体を AI / 申請者へ戻し、再処理後に再び確認待ちへ | sent-back | `human_sendback` |
| エスカレーション | 送り先 + 理由 | 業務責任者の判断 lane へ送る | escalation lane | `escalate` |

- 共有 validation: 理由・コメント未入力で確定不可 (即 error + focus)。
- 案件単位「差戻し」(footer) も同じ modal を field 未指定で開く。
- **UI に出さない**: 上表の status enum (`sent-back` 等) と audit event 名 (`field_override` 等) は operator 画面に表示しない (業務語に翻訳、`reconcile-panel-spec.md` §UI 言語規範)。

## 5. button enabled の UI 表現

- enabled: primary tone
- disabled: muted + 理由 tooltip (なぜ押せないか明示、Charter「Make the State Visible」)
- status / audit event の **enum literal は UI に出さない** (「確認待ち」「差戻し済」等の業務語で表示)

### 5.1 単一決定面 (pilot review rev.3 ③、C 型 detail 共通)

各 detail 画面の **standing 決定ボタンは object 単位の 1 セットのみ**:
- CaseDetail: 承認 / 差戻し (案件単位)
- ProposalDetail: forward / reject (Manual 管理者 mode) **または** 承認 / 差戻し (業務責任者 mode) — **mode で出し分け、2 セット同時表示しない**
- AgentDetail: 設定変更を申請 (+ 補助のみ、競合 cluster なし)

field / 部分単位の操作 (override・項目差戻し・該当箇所修正) は **行クリック→統合 modal** に畳み込み、standing button cluster を 2 個目として置かない。

## 関連
- reconcile 状態 → 承認可否: `reconcile-panel-spec.md` §3
- audit event の timeline 表示: `ia-overview-v2.md` §9.3 (Observatory)
- mock の status 分布: `mock-fixture-spec-v2.md`
