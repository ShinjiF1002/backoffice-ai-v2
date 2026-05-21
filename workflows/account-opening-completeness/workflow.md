# 口座開設書類完備チェック — 業務手順書 (UC-BO-02)

| 項目            | 値                                                                                                                            |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| 文書 ID         | DOC-WF-account-opening-workflow                                                                                               |
| 文書名          | 口座開設書類完備チェック 業務手順書 (UC-BO-02)                                                                                |
| 版数            | v0.1                                                                                                                          |
| ステータス      | Draft                                                                                                                         |
| オーナー        | 業務責任者                                                                                                                    |
| 承認者          | 手順承認 — 業務責任者 (R = Manual 管理者 = Queue owner、A = 業務責任者、Proposal source = AI)                                 |
| 閲覧対象        | Internal / Project team / Session 4 facilitator                                                                               |
| 機密区分        | Internal                                                                                                                      |
| 関連文書        | DOC-FW-01, DOC-APP-02, DOC-WF-account-opening-agent-instructions, DOC-WF-account-opening-approval-policy, DOC-ROOT-\_PROGRESS |
| SSOT 区分       | UC-BO-02 口座開設書類完備チェック 業務目的 / 手順 / 期待状態 / 禁止事項 の SSOT                                               |
| Evidence Status | N/A (業務設計のみ、定量値なし)                                                                                                |
| 改版履歴        | v0.1 (2026-05-27): 初版作成 (Day 7)                                                                                           |

---

## 1. 業務目的

口座開設依頼を受領した時、AI が必要書類の完備性を check し、不備 / 不整合があれば Alert を draft、入力者が確認する。Dashboard 並列カードとして UC-BO-01 (主役、法人住所変更) と並んで表示、Demo Chapter 2 で 1 シーン open。

Core message との対応: 「**差戻しを、次の正解手順に変える仕組み**」の副 demo として、書類完備性 check の差戻しが staging knowledge を生成し、AI 日次分析で compiled knowledge に昇格する Flywheel を体現する。

## 2. 業務 step (5 step)

| #   | Step                    | 内容                                                                              | screenshot 取得        |
| --- | ----------------------- | --------------------------------------------------------------------------------- | ---------------------- |
| 1   | 顧客検索                | 新規顧客 ID / 法人名で対象を特定                                                  | customer-search.png    |
| 2   | 書類一覧                | 受領済書類リストを表示 (本人確認 / 印鑑証明 / 法人登記 / 役員情報 / 取引目的 等)  | document-list.png      |
| 3   | 完備性 check            | 必須書類の存在 / 期限 / 形式を check、欠落 / 期限切れ / 形式不適合を検知          | completeness-check.png |
| 4   | 印鑑照合                | 受領印影 vs 印鑑証明印影の confidence check (照合 score 計算)                     | seal-verification.png  |
| 5   | 不備 list + Alert draft | 不備項目 list と Alert (§3 approval-policy) を draft、入力者の Case Review へ提示 | alert-draft.png        |

各 step で AI は mock screenshot を取得し、Case Review 画面 (`/cases/:id`) で入力者に提示する。

詳細 AI 実行方針は DOC-WF-account-opening-agent-instructions 参照。

## 3. 期待状態

業務 case が以下の状態で完了する:

- 必須書類が全件揃っている (欠落 0、期限切れ 0、形式不適合 0)
- 印鑑照合 confidence が threshold 以上 (`compiled/seal-verification-threshold.md` 参照)
- 関連 Alert (DOC-WF-account-opening-approval-policy §3) は全て triage 済または未発火
- 入力者が AI 完備性 check 結果を全項目承認する (入力者確認 OK)
- 承認者が最終 case を accept する (承認者承認 OK)
- Audit trail に full 証跡が残る

「4-eyes」は入力者確認 + 承認者承認が揃った案件承認全体を指す呼称 (DOC-FW-01 §2.1、DOC-APP-02 §2.2 と整合)。

## 4. 禁止事項

以下のいずれかに該当する case は本業務 scope 外。AI は自動完了せず、Alert 発火 + 入力者差戻し or 業務責任者 escalate を実行する。

| #   | 禁止事項                                                               | 検知方法                         | 対応                                                                                       |
| --- | ---------------------------------------------------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------ |
| 1   | 必須書類欠落で口座開設を完了してはならない                             | step 3 完備性 check で欠落検知   | 入力者差戻し、書類追加提出依頼                                                             |
| 2   | 印鑑照合 confidence 低下案件で自動完了してはならない                   | step 4 印鑑照合で threshold 未達 | 入力者手動 review or Retry                                                                 |
| 3   | 期限切れ書類 (本人確認の有効期限超過等) で口座開設を完了してはならない | step 3 で期限 check              | 入力者差戻し、再提出依頼                                                                   |
| 4   | KYC overlap (同一顧客で他 KYC 進行中) の case を進めてはならない       | step 1 顧客検索で他 KYC 検知     | 業務責任者へ escalate、KYC 完了待ち                                                        |
| 5   | 国際送金関連の口座開設は本業務 scope 外                                | 顧客の取引目的 / 関連業務 query  | `workflows/international-transfer-boundary/` (restricted boundary pack) を参照、Day 7 起稿 |

## 5. 関連文書

- DOC-FW-01 (`docs/01-flywheel-and-knowledge.md`): 本業務が体現する Flywheel と Knowledge loop
- DOC-APP-02 (`docs/02-approval-model.md`): 入力者確認 + 承認者承認 (案件承認)、手順承認 RACI、Matrix B 不変条件
- DOC-WF-account-opening-agent-instructions (`agent-instructions.md`): AI 実行方針 / 参照ナレッジ / スクショ粒度
- DOC-WF-account-opening-approval-policy (`approval-policy.md`): Alert 条件 / 差戻し条件 / 過去 case 関連ルール更新 Alert
- `_meta.yaml`: machine-readable metadata
- `knowledge/staging/`: 未承認 staging snippet (AI auto-draft、weight low)
- `knowledge/compiled/`: 手順承認済 compiled snippet (weight high)
- DOC-ROOT-\_PROGRESS (`docs/_PROGRESS.md`) §2.2: Day 7 影響分析と plan 詳細化
- DOC-ROOT-\_index (`workflows/_index.md`): 業務一覧 + Trust Level Progression
