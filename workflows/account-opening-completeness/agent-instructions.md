# 口座開設書類完備チェック — AI 実行方針 (Agent Instructions)

| 項目            | 値                                                                                                                        |
| --------------- | ------------------------------------------------------------------------------------------------------------------------- |
| 文書 ID         | DOC-WF-account-opening-agent-instructions                                                                                 |
| 文書名          | 口座開設書類完備チェック AI 実行方針 (UC-BO-02)                                                                           |
| 版数            | v0.1                                                                                                                      |
| ステータス      | Draft                                                                                                                     |
| オーナー        | AI 管理者                                                                                                                 |
| 承認者          | 設定承認 Type A (通常) — agent-instructions.md の更新は AI 実行方針 (参照 knowledge / Tool / Permission) の変更を伴うため |
| 閲覧対象        | Internal / Project team                                                                                                   |
| 機密区分        | Internal                                                                                                                  |
| 関連文書        | DOC-WF-account-opening-workflow, DOC-WF-account-opening-approval-policy, DOC-FW-01, DOC-APP-02, DOC-KNW-04                |
| SSOT 区分       | UC-BO-02 AI 実行方針 / 参照ナレッジ / スクショ粒度 の SSOT                                                                |
| Evidence Status | N/A (AI 実行方針のみ、定量値は SLO で `[仮説 / 要検証]` ラベル付き)                                                       |
| 改版履歴        | v0.1 (2026-05-27): 初版作成 (Day 7)。v0.2 (2026-05-30): Day 10.1 hygiene patch (CR R15 反映、§1 staging citation 表現を Plan v1.4 P0-1 規範に整合化、§2 参照ナレッジ表 staging medium/low row を「citation 不可 (hint / confidence / review question のみ)」、§2.2 DOC-KNW-04 詳述予定 stale pointer を §4.5 + §8 へ張替、関連 P0-3 / P0-4) |

---

## 1. AI 実行方針

AI (`agent-account-opening-completeness`, `v0.1`) は本業務の 5 step (DOC-WF-account-opening-workflow §2) を自律的に実行し、各 step で screenshot を取得して入力者の Case Review 画面に提示する。

実行は次の原則に従う:

- **承認された手順だけを AI に覚えさせる** (Core message sub 2): 本 doc + compiled knowledge (`workflows/account-opening-completeness/knowledge/compiled/`) のみを base instruction とする
- **staging knowledge は AI runtime に visible** (信頼度低、未承認): **正式実行根拠 (citation) ではない**。利用範囲は (1) confidence 低下シグナル / (2) human reviewer への hint / (3) AI 追加確認質問 trigger の 3 用途に限定 (DOC-FW-01 §3.5、DOC-ROOT-\_SSOT §1.4 末尾「staging knowledge の runtime 利用範囲 (Safety boundary)」)
- **差戻し受領時の挙動**: 差戻しコメント + 5-category を受領 → AI runtime は次の case 処理から compiled を優先参照、過去 case の AI proposal は不変 (DOC-FW-01 §6.3、audit trail 保護)
- **AI は組織責任主体ではない**: 提案生成 (Proposal source) として動作、組織責任は Manual 管理者 (Queue owner) と業務責任者 (Approver) の 2 ロール構造に保持

## 2. 参照ナレッジ

AI runtime が参照する knowledge の優先順位 (UC-BO-01 と同じ規範):

| 優先度 | source                                                          | weight | 性質                                           |
| ------ | --------------------------------------------------------------- | ------ | ---------------------------------------------- |
| 高     | 本 doc + workflow.md + approval-policy.md (compiled procedures) | -      | 手順承認済の正式手順                           |
| 高     | `knowledge/compiled/*.md`                                       | high   | 手順承認済 snippet、citation 可                |
| 中     | `knowledge/staging/*.md` (`category != data_error`)             | medium | reviewed staging、**citation 不可** (hint / confidence / review question のみ) |
| 低     | `knowledge/staging/*.md` (`category != data_error`)             | low    | unreviewed staging、**citation 不可** (hint / confidence / review question のみ) |
| 対象外 | `knowledge/staging/*.md` (`category == data_error`)             | -      | log / audit / 別 routing 扱い、citation 対象外 |

### 2.1 AI 日次分析 logic (Procedure Update Proposal の自動生成)

AI が日次で staging knowledge を分析、十分なナレッジが溜まり手順反映候補と判断した場合に **Procedure Update Proposal** を自動生成する。

- **Proposal source**: AI (本 step)
- **Queue 投入後の R**: Manual 管理者 (キュー責任、受理 / triage / forward / reject)
- **A (承認)**: 業務責任者
- 詳細 RACI は DOC-APP-02 §3 参照

判断基準 (仮、`[仮説 / 要検証]`、本番 threshold は Phase 1 で要定義):

- 同種の差戻しが複数 case で再発
- 共通 pattern が確認可能
- staging 内容に内部矛盾なし

詳細 logic SSOT は DOC-KNW-04 (Day 8 起稿予定)。

### 2.2 `data_error` の routing

`data_error` カテゴリは **AI 責でない入力データの誤り** (本業務では PDF スキャン品質不良、印影の擦れ等)。staging に格納はされるが:

- 通常の compiled 昇格対象外
- log / audit / 別 routing 扱い
- AI runtime の参照対象外 (上記表 §2 「対象外」)

代わりに Audit Trail (`/audit`) に記録、Manual 管理者が定期的に review (DOC-FW-01 §2.3、DOC-KNW-04 §4.5 data_error 例外 + §8 audit event model で詳述)。

## 3. スクショ粒度 (5 step × 5 枚、mock screenshot)

| #   | Step                    | Screenshot file          | 内容                                                            |
| --- | ----------------------- | ------------------------ | --------------------------------------------------------------- |
| 1   | 顧客検索                | `customer-search.png`    | 新規顧客検索結果 list                                           |
| 2   | 書類一覧                | `document-list.png`      | 受領済書類リスト (本人確認 / 印鑑証明 / 法人登記 / 役員情報 等) |
| 3   | 完備性 check            | `completeness-check.png` | 欠落 / 期限切れ / 形式不適合の検知結果                          |
| 4   | 印鑑照合                | `seal-verification.png`  | 印影 vs 印鑑証明印影の confidence score                         |
| 5   | 不備 list + Alert draft | `alert-draft.png`        | 不備項目 list + Alert chip + 入力者向け summary                 |

prototype では mock screenshot を `prototype/src/assets/mock-screenshots/uc-bo-02/` に配置 (Day 11+ で実体化)。**実接続はしない** (CLAUDE.md scope-out)。

## 4. AI が要求する Tool / Permission

| Tool / Permission     | 用途                                         | 設定承認 Type                               | v2 prototype での扱い            |
| --------------------- | -------------------------------------------- | ------------------------------------------- | -------------------------------- |
| 業務システム read     | 顧客検索 / 書類一覧表示                      | Type A 通常                                 | 実行されず、本 doc 記述のみ      |
| 業務システム write    | (本業務では基本 read のみ、不備記録は audit) | Type A 通常                                 | 実行されず                       |
| 印鑑照合エンジン      | 印影 confidence 計算                         | Type B (Security 関係者 co-A、PII boundary) | 実行されず、本 doc 記述のみ      |
| screenshot キャプチャ | 5 step 証跡取得                              | Type A 通常                                 | mock screenshot を assets に配置 |

本業務は read 中心 (口座開設の実 write は別 workflow)。詳細 Type 区分は DOC-APP-02 §4 参照。本番接続方式の tier 化 (標準 API / 準標準 MQ / 代替 RPA・Computer Use・MCP / 例外 DB 直接続 read-only) は DOC-OV-00 §2.2 接続層メモ。

## 5. AI の挙動制約

| 制約                    | 説明                                                                                              |
| ----------------------- | ------------------------------------------------------------------------------------------------- |
| 自律進行                | 5 step を順次実行、各 step で screenshot 取得 + Case Review 画面更新                              |
| 例外時の停止            | Alert 発火 (approval-policy §3) または印鑑照合 confidence threshold 未達時は処理停止 + Alert 表示 |
| 差戻し受領時の learning | staging snippet 自動生成 + AI runtime visible、過去 case は不変                                   |
| Automation Maturity     | supervised level (全件 4-eyes)、Day 7 起稿時点では Checkpoint 未到達                              |

Automation Maturity の進化は Matrix B 原則 (DOC-APP-02 §7.1) に従う:

> **AIに任せる量は段階的に増やすが、人によるコントロールは渡さない。**
>
> 案件確認は減らす。ルール承認は残す。

## 6. 関連文書

- DOC-WF-account-opening-workflow: 業務手順 (5 step / 期待状態 / 禁止事項)
- DOC-WF-account-opening-approval-policy: Alert 条件 / 差戻し条件 / 過去 case 関連ルール更新 Alert
- DOC-FW-01 §3 / §4: staging / compiled 反映 path、AI 日次分析 trigger
- DOC-APP-02 §3: 手順承認 RACI / §4: 設定承認 Type A/B/C / §7: Matrix B 不変条件
- DOC-KNW-04 (Day 8 起稿予定): AI 日次分析 logic SSOT / 5-category routing 詳細
- `_meta.yaml`: machine-readable metadata
