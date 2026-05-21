# 法人住所変更処理 — 業務手順書 (UC-BO-01)

| 項目            | 値                                                                                                                                |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| 文書 ID         | DOC-WF-corporate-address-workflow                                                                                                 |
| 文書名          | 法人住所変更処理 業務手順書 (UC-BO-01)                                                                                            |
| 版数            | v0.1                                                                                                                              |
| ステータス      | Draft                                                                                                                             |
| オーナー        | 業務責任者                                                                                                                        |
| 承認者          | 手順承認 — 業務責任者 (R = Manual 管理者 = Queue owner、A = 業務責任者、Proposal source = AI)                                     |
| 閲覧対象        | Internal / Project team / Session 4 facilitator                                                                                   |
| 機密区分        | Internal                                                                                                                          |
| 関連文書        | DOC-FW-01, DOC-APP-02, DOC-WF-corporate-address-agent-instructions, DOC-WF-corporate-address-approval-policy, DOC-ROOT-\_PROGRESS |
| SSOT 区分       | UC-BO-01 法人住所変更 業務目的 / 手順 / 期待状態 / 禁止事項 の SSOT                                                               |
| Evidence Status | N/A (業務設計のみ、定量値なし)                                                                                                    |
| 改版履歴        | v0.1 (2026-05-26): 初版作成 (Day 6)                                                                                               |

---

## 1. 業務目的

法人顧客の登記住所変更依頼を、PDF 受領から業務システム反映まで AI が実行し、入力者確認 + 承認者承認の 2 段で確認する。

Core message との対応: 「**差戻しを、次の正解手順に変える仕組み**」の主役業務として、本業務の差戻しが staging knowledge を生成し、AI 日次分析で compiled knowledge に昇格する Flywheel を体現する。Session 4 Demo Chapter 1/2 の起点。

## 2. 業務 step (8 step)

| #   | Step                  | 内容                                                          | screenshot 取得      |
| --- | --------------------- | ------------------------------------------------------------- | -------------------- |
| 1   | ログイン              | 業務システムに service account でログイン                     | login.png            |
| 2   | 顧客検索              | 顧客 ID / 法人名で対象法人を特定                              | customer-search.png  |
| 3   | 顧客詳細 (現住所)     | 現住所と契約内容を確認                                        | customer-detail.png  |
| 4   | 住所変更フォーム      | 新住所を入力 (郵便番号 / 都道府県 / 市区町村 / 番地 / 建物名) | address-form.png     |
| 5   | 住所入力確認          | 入力内容の syntax / format を確認                             | address-validate.png |
| 6   | 国土地理院 API verify | 住所の正当性を verify                                         | gsi-verify.png       |
| 7   | 最終確認              | 全項目の reconciliation (現住所 / 新住所 / 顧客情報 / Alert)  | final-review.png     |
| 8   | 完了                  | 業務システムに反映、Case に completed status                  | completion.png       |

各 step で AI は mock screenshot を取得し、Case Review 画面 (`/cases/:id`) で入力者に提示する。

詳細 AI 実行方針 (Tool / Permission / 参照ナレッジ) は DOC-WF-corporate-address-agent-instructions 参照。

## 3. 期待状態

業務 case が以下の状態で完了する:

- 業務システムに新住所が反映される (8 step の write 完了)
- 入力者が AI 入力結果を全 step 承認する (入力者確認 OK)
- 承認者が最終 case を accept する (承認者承認 OK)
- Audit trail に full 8 step の証跡が残る (各 step の screenshot + timestamp + 操作者)
- 関連 Alert (DOC-WF-corporate-address-approval-policy §3 の 5 条件) は全て triage 済または未発火

「4-eyes」は入力者確認 + 承認者承認が揃った案件承認全体を指す呼称 (DOC-FW-01 §2.1、DOC-APP-02 §2.2 と整合)。

## 4. 禁止事項

以下のいずれかに該当する case は本業務 scope 外。AI は自動反映せず、Alert 発火 + 入力者差戻し or 業務責任者 escalate を実行する。

| #   | 禁止事項                                                | 検知方法                                                  | 対応                                                                               |
| --- | ------------------------------------------------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| 1   | 国土地理院 API で verify 失敗の住所を反映してはならない | step 6 で API verify pass を確認                          | 入力者差戻し or Retry                                                              |
| 2   | 法人格変更を伴う住所変更は本業務 scope 外               | KYC overlap / 法人格変更可能性 Alert (approval-policy §3) | 業務責任者へ escalate (別 workflow)                                                |
| 3   | 過去 90 日以内に他の届出変更がある case                 | 履歴 query (approval-policy §3)                           | 承認者 triage、整合性確認                                                          |
| 4   | 銀行登録住所 vs 登記住所が乖離している case             | 整合性 check (approval-policy §3)                         | 業務責任者 triage                                                                  |
| 5   | 国際送金関連業務に波及する住所変更                      | 関連 case query                                           | 国際送金 boundary pack (`workflows/international-transfer-boundary/`) と整合性確認 |

## 5. 関連文書

- DOC-FW-01 (`docs/01-flywheel-and-knowledge.md`): 本業務が体現する Flywheel と Knowledge loop
- DOC-APP-02 (`docs/02-approval-model.md`): 入力者確認 + 承認者承認 (案件承認)、手順承認 RACI、Matrix B 不変条件
- DOC-WF-corporate-address-agent-instructions (`agent-instructions.md`): AI 実行方針 / 参照ナレッジ / スクショ粒度
- DOC-WF-corporate-address-approval-policy (`approval-policy.md`): Alert 5 条件 / 差戻し条件 / 過去 case 関連ルール更新 Alert
- `_meta.yaml`: machine-readable metadata (trust_level / risk_level / automation_status / approvers / update_history)
- `knowledge/staging/`: 未承認 staging snippet (AI auto-draft、weight low)
- `knowledge/compiled/`: 手順承認済 compiled snippet (weight high)
- DOC-ROOT-\_PROGRESS (`docs/_PROGRESS.md`) §2.1: Day 6 影響分析と plan 詳細化
