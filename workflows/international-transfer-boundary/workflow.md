# 国際送金 — 業務手順書 (restricted boundary pack)

| 項目            | 値                                                                                                       |
| --------------- | -------------------------------------------------------------------------------------------------------- |
| 文書 ID         | DOC-WF-international-transfer-workflow                                                                   |
| 文書名          | 国際送金 業務手順書 (restricted boundary pack、UC-BO-IT-BOUNDARY)                                        |
| 版数            | v0.1                                                                                                     |
| ステータス      | Draft                                                                                                    |
| オーナー        | 業務責任者 (boundary 設計は業務責任者と Security 関係者 + AI 管理者の合議)                               |
| 承認者          | 設定承認 Type A or Type C — boundary 変更は通常 loop 対象外、boundary review proposal mechanism 経由のみ |
| 閲覧対象        | Internal / Project team                                                                                  |
| 機密区分        | Internal                                                                                                 |
| 関連文書        | DOC-FW-01 §4.3, DOC-APP-02 §3.4 / §9.7, DOC-OV-00 §2.1 / §3, DOC-ROOT-\_PROGRESS, BOUNDARY.md            |
| SSOT 区分       | 国際送金 業務概要 / restricted boundary pack の意味 / boundary review proposal entry point の SSOT       |
| Evidence Status | N/A (業務設計のみ、閾値は `[仮説 / 要検証]` ラベル付き)                                                  |
| 改版履歴        | v0.1 (2026-05-27): 初版作成 (Day 7、restricted boundary pack として起稿、UI 画面化なし)                  |

---

## 1. 業務概要

国際送金は本 backoffice 業務体系の中で **条件付き制限業務 (restricted)** に位置付ける。通常業務 (UC-BO-01 法人住所変更 / UC-BO-02 口座開設書類完備) と異なり、本 workflow pack は AI 自律実行の対象外であり、boundary spec のみを記述する。

詳細な scope 画定 (高額閾値 / threshold 以上の prohibited / threshold 未満の future candidate) は BOUNDARY.md を参照。

## 2. restricted boundary pack の意味

`automation_status: restricted` (`_meta.yaml`、docs/\_SSOT.md §1.1) は、以下を意味する:

- **業務全体の自動化禁止 (prohibited) ではない**: 国際送金業務自体を AI 自動化対象外と扱うわけではない
- **高額・高リスク条件で AI 自動化不可**: `$10M` 相当以上 `[仮説 / 要検証]` の case は AI 自動化対象外、人間判断必須
- **閾値未満は将来限定自動化検討**: フレームワーク信頼性が確認された後 (Phase 2+) に限定自動化を検討
- **本 v2 では UI 画面化なし / Dashboard カード化なし**: prototype scope-out、boundary spec のみ docs として残す

詳細は BOUNDARY.md (scope 画定) + DOC-OV-00 §2.1 (対象業務) + DOC-OV-00 §3 (非スコープ) 参照。

## 3. 通常業務との対比

| 軸                                  | UC-BO-01 法人住所変更 (active)       | UC-BO-02 口座開設書類完備 (active)   | 国際送金 (restricted、本 pack)             |
| ----------------------------------- | ------------------------------------ | ------------------------------------ | ------------------------------------------ |
| `automation_status`                 | `active`                             | `active`                             | `restricted`                               |
| AI 自律実行                         | 8 step 実行 (mock screenshot)        | 5 step 実行 (mock screenshot)        | scope-out                                  |
| 入力者確認 / 承認者承認             | 4-eyes 案件承認                      | 4-eyes 案件承認                      | scope-out (本 v2 では画面化なし)           |
| Trust Level Progression             | supervised → checkpoint → autonomous | supervised → checkpoint → autonomous | n/a (boundary pack)                        |
| 通常 loop (差戻し→staging→compiled) | 通常 loop 対象                       | 通常 loop 対象                       | 通常 loop 対象外                           |
| 更新経路                            | 手順承認 (R = Manual 管理者)         | 手順承認 (R = Manual 管理者)         | boundary review proposal (DOC-APP-02 §9.7) |

## 4. boundary review proposal entry point

通常 loop ではなく **boundary review proposal mechanism** (DOC-APP-02 §9.7) で本 boundary を更新する。

- **Proposal source**: AI (boundary review proposal、`_meta.yaml` `approvers.proposal_source_for_boundary_change: ai`)
- **R (Queue owner)**: Manual 管理者 or AI 管理者
- **A (承認)**: 設定承認 Type A (通常 boundary 調整) / Type C (Automation Maturity 関連の場合)
- **反映先**: 本 workflow.md + BOUNDARY.md + `_meta.yaml` (`restricted_conditions` 等) + plan update
- **発生頻度想定**: 月次以下 `[仮説 / 要検証]`、頻発する場合は通常 loop 組み込み再評価

国際送金 `$10M [仮説 / 要検証]` 閾値変更も本 mechanism の対象。実閾値は Phase 1 で検証・決定。

## 5. 本 v2 prototype での扱い

- UI 画面化なし (Inbox / CaseReview / Dashboard 等に boundary 業務 entry point は出さない)
- Dashboard カード化なし (Dashboard 並列カードは UC-BO-01 + UC-BO-02 のみ)
- Demo Chapter での扱い: Demo 操作なし、Day 20 demo-script で言及なし。Day 9 narrative (Slide 7) では境界例として 1 行だけ言及可 (Tier 3 規制語は出さない、DOC-APP-02 §10 hedge)
- 本 pack は **docs として残す** ことで、Plan v1.3 final patch の整合性と Phase 1 への hand-off を確保

## 6. 関連文書

- BOUNDARY.md: scope 画定詳細 ($10M [仮説 / 要検証] 閾値 / boundary review proposal mechanism 詳細)
- `_meta.yaml`: machine-readable metadata (`restricted_conditions` schema)
- DOC-FW-01 §4.3: 通常 loop の boundary 適用外 (Flywheel side)
- DOC-APP-02 §3.4: BOUNDARY 通常 loop 対象外 (Approval side)
- DOC-APP-02 §9.7: Boundary Review Proposal の設定承認扱い (主要 SSOT)
- DOC-OV-00 §2.1: 対象業務 (国際送金 = restricted)
- DOC-OV-00 §3: 非スコープ (UI 画面化なし)
- DOC-ROOT-\_PROGRESS §2.2: Day 7 影響分析と plan 詳細化
- DOC-ROOT-\_index (`workflows/_index.md`): 業務一覧 + Trust Level Progression
