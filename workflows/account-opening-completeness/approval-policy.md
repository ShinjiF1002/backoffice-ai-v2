# 口座開設書類完備チェック — 承認方針 (Approval Policy)

| 項目            | 値                                                                                                                                                                |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 文書 ID         | DOC-WF-account-opening-approval-policy                                                                                                                            |
| 文書名          | 口座開設書類完備チェック 承認方針 (UC-BO-02)                                                                                                                      |
| 版数            | v0.1                                                                                                                                                              |
| ステータス      | Draft                                                                                                                                                             |
| オーナー        | 業務責任者 + Manual 管理者 (共同 ownership、業務側 Alert / 差戻し条件は業務責任者、手順 curation 側は Manual 管理者)                                              |
| 承認者          | 手順承認 — approval-policy.md の更新は AI 実行方針 (Alert 条件 / 差戻し条件) の変更を伴う (R = Manual 管理者 = Queue owner、A = 業務責任者、Proposal source = AI) |
| 閲覧対象        | Internal / Project team / Session 4 facilitator                                                                                                                   |
| 機密区分        | Internal                                                                                                                                                          |
| 関連文書        | DOC-WF-account-opening-workflow, DOC-WF-account-opening-agent-instructions, DOC-FW-01, DOC-APP-02, DOC-UI-03                                                      |
| SSOT 区分       | UC-BO-02 担当者確認 / 承認者確認 / Alert / 差戻し条件 / 過去 case Alert の SSOT                                                                                   |
| Evidence Status | N/A (承認方針のみ、Alert threshold は `[仮説 / 要検証]` ラベル付き)                                                                                               |
| 改版履歴        | v0.1 (2026-05-27): 初版作成 (Day 7)。v0.2 (2026-05-30): Day 10.1 hygiene patch (CR R15 反映、§3 data_error DOC-KNW-04 詳述予定 stale pointer を §4.5 + §8 へ張替、staging citation 不可注記 (DOC-ROOT-\_SSOT §1.4 末尾) 追加、SLO 仮値表参照を 05 §3 へ張替 [Day 9 移管済]、関連 P0-3 / P0-4 / P1)。v0.3 (2026-05-30): Day 10.2 hygiene patch (CR R16 Blocking 反映、§Alert UI + §関連文書 で `DOC-UI-03 (Day 8 起稿予定)` を実 path `docs/03-ui-prototype-design.md` §6 へ張替、Day 10.1 verification failure 解消)        |

---

## 1. 担当者確認 (入力者確認)

入力者は Case Review 画面 (`/cases/:id`) で AI 完備性 check 結果を確認し、以下を判定:

- 5 step 全ての screenshot が期待どおりであること (DOC-WF-account-opening-agent-instructions §3)
- 完備性 check (step 3) が pass している、または不備が triage 済であること
- 印鑑照合 confidence (step 4) が threshold 以上 (`compiled/seal-verification-threshold.md` 参照)
- Alert (§3 参照) が未発火、または発火した Alert に承認者が triage 済であること
- 過去 case 関連ルール更新 Alert (§5 参照) があれば内容を確認

**判定**:

- **承認**: AI 結果を accept、承認者の業務承認 queue に進める
- **差戻し**: SendBackComment 画面 (`/cases/:id/comment`) で 5-category + free-text コメント + 該当 case の context (PDF / screenshot / agent output) を送信

詳細は DOC-FW-01 §2、DOC-APP-02 §2 参照。「**入力者確認 単独では 4-eyes と呼ばない**」原則を厳守。

## 2. 承認者確認 (承認者承認)

承認者は同じ証跡 (AI 完備性 check 結果 + 書類一覧 + 印鑑照合 score + Alert + 入力者承認 timestamp + 過去 case Alert) を見て最終確認:

- 入力者と異なる視点で reconciliation
- 高リスク要素 (§3 Alert 発火) があれば escalate (業務責任者へ)
- 関連手順更新 Alert (§5) があれば AI Proposal panel の banner を確認、影響を判断

**判定**:

- **承認**: case completed、Audit trail に記録、口座開設の次工程へ
- **差戻し**: 入力者に戻す
- **escalate**: 業務責任者へ (Matrix C Escalation lane、DOC-APP-02 §8)

**SoD**: 入力者 ≠ 承認者 (システム制約として強制)。

「**4-eyes**」はこの 2 者が揃った案件承認全体を指す呼称。

## 3. Alert 5 条件 (高リスク検知)

| #   | Alert                        | 発火条件                                                    | Severity | 対応                                                 |
| --- | ---------------------------- | ----------------------------------------------------------- | -------- | ---------------------------------------------------- |
| 1   | **必須書類欠落**             | step 3 完備性 check で必須書類が欠落                        | high     | 入力者差戻し、追加提出依頼                           |
| 2   | **印鑑照合 confidence 低下** | step 4 で confidence < threshold (`compiled/seal-...` 参照) | high     | 入力者手動 review or Retry (Phase 1 で retry policy) |
| 3   | **書類期限切れ**             | 本人確認の有効期限超過 / 登記簿の発行日超過 等              | medium   | 入力者差戻し、再提出依頼                             |
| 4   | **KYC overlap**              | 同一顧客で他 KYC プロセスが進行中                           | high     | 業務責任者へ escalate、KYC 完了待ち                  |
| 5   | **外国法人の書類形式不一致** | 外国法人で日本式書類形式を期待した case                     | medium   | 承認者 triage、外国法人専用 routing 検討             |

Alert threshold (有効期限、severity 区分) は `[仮説 / 要検証]`、本番閾値は Phase 1 で要定義。

## 4. 差戻し条件 (5-category 必須)

入力者が差戻しする時、5-category のいずれかを必須選択 (DOC-FW-01 §2.2 と同じ規範):

| Category           | 意味                           | compiled 昇格対象         | 例                                            |
| ------------------ | ------------------------------ | ------------------------- | --------------------------------------------- |
| `misunderstanding` | AI の意図誤解                  | ✅                        | 必須書類リストの解釈誤り                      |
| `ui_change`        | 業務システム UI 変更           | ✅                        | 書類一覧 field 配置変更                       |
| `edge_case`        | 想定外パターン                 | ✅                        | 外国法人 / 個人事業主 / 学校法人等の特殊 case |
| `judgment_gap`     | 判断ルール不足                 | ✅                        | 印鑑照合 confidence threshold 未設定          |
| `data_error`       | 入力データの誤り (AI 責でない) | ❌ (log/audit/別 routing) | PDF スキャン品質不良、印影の擦れ              |

`data_error` 以外の差戻しコメントは staging knowledge として AI runtime に visible になる (DOC-FW-01 §3、ただし citation 不可、hint / confidence / review question のみ、DOC-ROOT-\_SSOT §1.4 末尾)。`data_error` は staging に記録するが、AI runtime citation 対象外とし、log / audit / 別 routing で扱う (DOC-WF-account-opening-agent-instructions §2.2、DOC-KNW-04 §4.5 data_error 例外 + §8 audit event model で詳述)。

prototype では同一セッション内、本番仮値は DOC-MON-05 §3 SLO 仮値表 (`_SSOT.md` §1.3 から Day 9 で移管済) に従う (`[仮説 / 要検証]`)。

## 5. 過去 case 関連ルール更新 Alert (3 適用範囲)

**過去 case の AI proposal 本文は不変** (audit trail 保護、DOC-FW-01 §6.3)。ただし関連手順・ルールが後から承認された場合、AI Proposal 画面で Alert を出す。

| #   | 適用範囲              | 表示位置                        | Alert 内容                                                                                                                                                             |
| --- | --------------------- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | 未承認・承認待ち case | Case Review / AI Proposal panel | banner Alert (top of panel)、dismissible、文言: 「関連手順が更新されています」「このcase作成後に承認されたルールがあります」「AI提案本文は当時のまま保持されています」 |
| 2   | 承認済み過去 case     | Audit Trail (`/audit`)          | 関連更新履歴を timeline 表示                                                                                                                                           |
| 3   | 新規 case             | AiProposalPanel citation list   | 新ルールを通常 citation として参照                                                                                                                                     |

Alert UI 詳細仕様は DOC-UI-03 (`docs/03-ui-prototype-design.md` §6 AiProposalPanel Alert UI) 参照。

## 6. 手順承認 RACI (本 doc + workflow.md + agent-instructions.md の更新 trigger)

本 doc 群に更新がある場合 (Alert 条件追加 / 印鑑照合 threshold 変更 / 5 step 修正等)、AI が日次分析で Procedure Update Proposal を自動生成、Manual 管理者がキュー責任、業務責任者が承認する。

| RACI 列         | 主体                                      | 役割                                                            |
| --------------- | ----------------------------------------- | --------------------------------------------------------------- |
| Proposal source | AI (`agent-account-opening-completeness`) | 日次分析で staging を集約、Procedure Update Proposal を自動生成 |
| R (Queue owner) | Manual 管理者                             | キュー責任、受理 / triage / forward / reject                    |
| A (承認)        | 業務責任者                                | 最終承認、業務リスクの受容判断                                  |
| C (合議)        | SME / AI 管理者                           | 影響範囲確認                                                    |
| I (通知)        | 入力者 / 承認者                           | 反映後の運用に影響                                              |

**SoD**: Queue owner (Manual 管理者) ≠ Approver (業務責任者) (システム制約として強制、AI Proposal source は人間ロールに影響しない)。

詳細は DOC-APP-02 §3、§6.1、DOC-FW-01 §4 参照。

## 7. 関連文書

- DOC-WF-account-opening-workflow: 業務手順 (5 step / 期待状態 / 禁止事項)
- DOC-WF-account-opening-agent-instructions: AI 実行方針 / 参照ナレッジ / スクショ粒度
- DOC-FW-01 §2 / §3 / §6.3: 差戻し / staging / 過去 case 不変原則 + Alert
- DOC-APP-02 §2 / §3 / §6.1: 案件承認 (4-eyes) / 手順承認 RACI / SoD 原則
- DOC-UI-03 (`docs/03-ui-prototype-design.md`): AiProposalPanel Alert UI 仕様 (3 適用範囲)
- `_meta.yaml`: machine-readable metadata
- `knowledge/staging/`, `knowledge/compiled/`: 8 field frontmatter snippet (Day 7 は staging 1 + compiled 1)
