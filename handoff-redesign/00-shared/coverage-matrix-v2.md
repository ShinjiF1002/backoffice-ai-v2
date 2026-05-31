# Coverage Matrix v2 (F-* × R-* × screen × component × prompt × gate)

> user 16 指摘を個別分解した **F-01〜F-19** が、要件 R-* → 画面 → component → prompt → Acceptance gate で**漏れなく閉じる**ことを mechanical に追跡する。

## 指摘 F-* 正規化 (19、個別分解)

| group | F-ID | 指摘 (要約) |
|---|---|---|
| Observatory | F-01 | 監査証跡は業務 Process ごと |
| | F-02 | AI 入力がいつ行われたか監査に出ない |
| | F-03 | timeline 論理矛盾 (Human 後に AI OCR / 承認者欠落) + cron 用語 |
| | F-04 | メトリクスは Process ごと |
| | F-05 | ナレッジも Process ごと |
| AgentDetail | F-06 | 実 metrics vs threshold (進化要件 % でなく) |
| | F-07 | Agent 一覧が必要 |
| | F-08 | Trust 変更の consequence |
| ProposalDetail | F-09 | 提案一覧 (どの Process のどの部分か) |
| | F-10 | 判定基準の実績値 |
| | F-11 | ルール改定の影響 |
| CaseDetail | F-12 | confidence 0.96/0.84 意味不明 → 削除 |
| | F-13 | 差戻しコメント未入力で即 error |
| | F-14 | AI 入力 vs 申請書類 reconcile |
| | F-15 | 「field 平均 (5 field)」削除 |
| Queue | F-16 | 右パネル default 非表示 + click 表示 |
| | F-17 | パネル内 confidence 削除 |
| | F-18 | パネルで何が変わったか |
| Hub | F-19 | Alert がどの Process か |

## Coverage matrix (全 19 指摘、漏れ 0)

| F-ID | R-ID | screen | component | prompt (bundle-v2/prompts/) | Acceptance gate |
|---|---|---|---|---|---|
| F-01 | R-OBS-01 | 09 Observatory | ProcessSelector | 09-observatory | Process 別切替可能 |
| F-02 | R-OBS-02 | 09 Observatory | lifecycle view | 09-observatory | AI 入力 event に時刻明示 |
| F-03 | R-OBS-02/03 | 09 Observatory | lifecycle view | 09-observatory | 業務順 timeline + 承認者 event + 「日次提案分析」(cron 排除) |
| F-04 | R-OBS-04 | 09 Observatory | MetricVsThreshold | 09-observatory | metrics tab が Process 別 |
| F-05 | R-OBS-05 | 09 Observatory | — | 09-observatory | knowledge tab が Process 別 grouping |
| F-06 | R-AGENT-02 | 08 エージェント詳細 | MetricVsThreshold | 08-agent-detail | 実績値 vs 閾値 vs 判定 (75% 集約排除) |
| F-07 | R-AGENT-01 | 07 エージェント一覧 | table | 07-agents | Agent 一覧画面が存在 |
| F-08 | R-AGENT-03 | 08 エージェント詳細 | ConsequencePanel | 08-agent-detail | 昇格の before/after・review coverage 変化 |
| F-09 | R-PROP-01 | 05 提案一覧 | table | 05-proposals | 提案一覧 + どの Process のどの部分か |
| F-10 | R-PROP-02 | 06 提案詳細 | MetricVsThreshold | 06-proposal-detail | 判定基準に実績値併記 |
| F-11 | R-PROP-03 | 06 提案詳細 | ConsequencePanel | 06-proposal-detail | before/after・影響件数・誤検知方向 |
| F-12 | R-RECON-02 | 04 案件詳細 | ReconcilePanel | 04-case-detail | confidence 生数字なし |
| F-13 | R-VALID-01 | 04 案件詳細 | (validation) | 04-case-detail | 差戻しコメント未入力で即 error |
| F-14 | R-RECON-01 | 04 案件詳細 | ReconcilePanel | 04-case-detail | AI vs 申請書類 突合 UI |
| F-15 | R-RECON-02 | 04 案件詳細 | ReconcilePanel | 04-case-detail | 「field 平均」表記なし |
| F-16 | R-QUEUE-01 | 02 案件一覧 | (drawer) | 02-cases | 右パネル default 非表示・click 表示 |
| F-17 | R-RECON-02 | 02 案件一覧 | ReconcilePanel summary | 02-cases | drawer 内 confidence 数字なし |
| F-18 | R-QUEUE-02 | 02 案件一覧 | (drawer) | 02-cases | 何が変わったか (変更内容) |
| F-19 | R-PROC-01 | 01 Hub | ProcessSelector / Alert tag | 01-hub | Alert に Process tag + drill |

→ **全 19 指摘が R-* + screen + component + prompt + gate に mapping**。漏れ 0。

## F 由来でない要件 (critical review / audit 追加、F に直接対応しないが必須)

| R-ID | 源 | screen | prompt | 理由 |
|---|---|---|---|---|
| R-APPR-01 | CR (4-eyes 後半) | 03 承認待ち | 03-approvals | 承認者 queue 新設 |
| R-APPR-02/03 | CR | 04 案件詳細 (checker mode) | 04-case-detail | 承認者 mode で最終承認 |
| R-CASE-01 | audit | 04 案件詳細 | 04-case-detail | 差戻しコメントを同 page section |
| R-PROP-04 | audit | 06 提案詳細 | 06-proposal-detail | 業務責任者の最終承認動線 |
| R-QUEUE-01 | F-16 | 02 案件一覧 | 02-cases | (F-16 と同一) |

## 全 22 要件の screen mapping 確認

R-PROC-01 (Hub/全画面) / R-QUEUE-01/02 (02) / R-RECON-01/02 (04, 02) / R-VALID-01 (04) / R-CASE-01 (04) / R-APPR-01 (03) / R-APPR-02/03 (04) / R-PROP-01 (05) / R-PROP-02/03/04 (06) / R-AGENT-01 (07) / R-AGENT-02/03 (08) / R-OBS-01/02/03/04/05 (09)

→ **全 22 R-* が 9 画面のいずれかに mapping**。どの画面でも閉じない要件 = 0。

> **remediation 画面拡張 (2026-05-30)**: 9 → 11 (W2b: `/search`・`/inbox`) → 14 (W2c: 業務責任者面)。R-* mapping は historical 9 画面基準。新画面 (検索/通知/業務責任者面) は監査由来 (audit §7 #9/#10) で R-* 体系外、完成定義は **remediation-roadmap §1b** が SSOT。最終 closure は roadmap §4末 3 軸 count gate。

## prompt × screen 対応 (bundle-v2/prompts/、各 wireframe + mockup)

01-hub / 02-cases / 03-approvals / 04-case-detail (pilot) / 05-proposals / 06-proposal-detail / 07-agents / 08-agent-detail / 09-observatory

→ 9 画面 × 2 (wireframe/mockup) = 18 prompt。各 prompt の Acceptance check に上記 gate を binary 化。

## 漏れ 0 verification (手動 gate)

- [ ] 全 F-01〜F-19 が matrix に 1 行以上
- [ ] 全 22 R-* が screen に mapping
- [ ] 各 screen prompt の Acceptance check に該当 F の gate が含まれる
- [ ] 承認者 (R-APPR) / 差戻し同 page (R-CASE-01) / 業務責任者 (R-PROP-04) が prompt に反映
