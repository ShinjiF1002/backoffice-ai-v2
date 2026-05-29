# Operational Walkthrough Evidence v2 (6 role × 2 process、QA template)

> 9 画面生成後、各 role が業務 journey を**画面横断で完結できるか**を検証する。各 step で 操作 / validation / audit event / 未完了点 を記録。operational-audit.md の journey が実 mockup で閉じることを確認。

## 検証方法
各 role の journey を screens-v2/ の HTML を辿って walkthrough。閉じない step (操作不能 / 情報不足 / 遷移先なし) を「未完了点」に記録。

---

## Role 1: 入力者 (法人住所変更 Process)
| step | 画面 | 操作 | validation | audit event | 閉じる? | 未完了点 |
|---|---|---|---|---|---|---|
| M1 担当案件確認 | 02 案件一覧 | Process 選択→案件選択 | — | — | ☐ | |
| M2 案件を開く | 02→04 | row click | — | — | ☐ | |
| M3 reconcile 突合 | 04 案件詳細 | field 確認 | — | — | ☐ | |
| M4 要確認判定 | 04 | accept/override | override 理由必須 | field_override | ☐ | |
| M5 承認 | 04 | 承認 | 要確認残存で disabled | human_review | ☐ | |
| M6 差戻し | 04 | 差戻し | コメント必須 | human_sendback | ☐ | |

## Role 2: 承認者 (法人住所変更)
| step | 画面 | 操作 | validation | audit | 閉じる? | 未完了点 |
|---|---|---|---|---|---|---|
| C1 承認待ち確認 | 03 承認待ち | 案件選択 | — | — | ☐ | |
| C2 入力者判断+reconcile 確認 | 04 (checker mode) | レビュー | — | — | ☐ | |
| C3 最終承認 | 04 | 最終承認 | SoD (≠入力者) | business_approve | ☐ | |

## Role 3: Manual 管理者
| step | 画面 | 操作 | validation | audit | 閉じる? | 未完了点 |
|---|---|---|---|---|---|---|
| Q1 提案一覧確認 | 05 提案一覧 | 提案選択 | — | — | ☐ | |
| Q2 提案中身 | 06 提案詳細 | レビュー | — | — | ☐ | |
| Q3 判定基準 vs 実績 | 06 | MetricVsThreshold 確認 | — | — | ☐ | |
| Q4 改定影響 | 06 | ConsequencePanel 確認 | — | — | ☐ | |
| Q5 forward/reject | 06 | forward | 実績確認 / reject 理由必須 | proposal_forward/reject | ☐ | |

## Role 4: 業務責任者
| step | 画面 | 操作 | validation | audit | 閉じる? | 未完了点 |
|---|---|---|---|---|---|---|
| B1 forward 提案確認 | 06 提案詳細 | レビュー | — | — | ☐ | |
| B2 最終承認 | 06 | 承認 | consequence 確認 | proposal_approve | ☐ | |

## Role 5: AI 管理者
| step | 画面 | 操作 | validation | audit | 閉じる? | 未完了点 |
|---|---|---|---|---|---|---|
| A1 Agent 一覧 | 07 エージェント一覧 | Agent 選択 | — | — | ☐ | |
| A2 Agent 開く | 07→08 | row click | — | — | ☐ | |
| A3 Trust 昇格検討 | 08 | 実 metrics vs threshold 確認 | — | — | ☐ | |
| A4 昇格影響確認 | 08 | ConsequencePanel 確認 | — | — | ☐ | |
| A5 設定変更申請 | 08 | 申請 | metrics+consequence 確認 | config_change_request | ☐ | |

## Role 6: 監査者
| step | 画面 | 操作 | validation | audit | 閉じる? | 未完了点 |
|---|---|---|---|---|---|---|
| AU1 Process 選択 | (TopBar) | ProcessSelector | — | — | ☐ | |
| AU2 case lifecycle 追跡 | 09 監査 tab | lifecycle view | — | — | ☐ | 受付→AI→入力者→承認者→反映 順か |
| AU3 業務語確認 | 09 | — | — | — | ☐ | cron 用語が出ていないか |
| AU4 Process 別 AI 精度 | 09 metrics tab | — | — | — | ☐ | |
| AU5 Process 別ナレッジ | 09 knowledge tab | — | — | — | ☐ | |

## 2 process 確認
- 上記を **法人住所変更** + **口座開設書類完備** の両 Process で確認 (ProcessSelector 切替)

## QA サマリ
| role | journey 完結? | 未完了点数 |
|---|---|---|
| 入力者 | ☐ | |
| 承認者 | ☐ | |
| Manual 管理者 | ☐ | |
| 業務責任者 | ☐ | |
| AI 管理者 | ☐ | |
| 監査者 | ☐ | |

> 未完了点があれば該当画面の prompt を Claude Code で修正 → Claude Design 再生成。全 journey 閉じたら本 plan 完了。
