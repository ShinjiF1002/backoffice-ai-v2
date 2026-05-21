# 法人住所変更処理 — AI 実行方針 (Agent Instructions)

| 項目            | 値                                                                                                                        |
| --------------- | ------------------------------------------------------------------------------------------------------------------------- |
| 文書 ID         | DOC-WF-corporate-address-agent-instructions                                                                               |
| 文書名          | 法人住所変更処理 AI 実行方針 (UC-BO-01)                                                                                   |
| 版数            | v0.1                                                                                                                      |
| ステータス      | Draft                                                                                                                     |
| オーナー        | AI 管理者                                                                                                                 |
| 承認者          | 設定承認 Type A (通常) — agent-instructions.md の更新は AI 実行方針 (参照 knowledge / Tool / Permission) の変更を伴うため |
| 閲覧対象        | Internal / Project team                                                                                                   |
| 機密区分        | Internal                                                                                                                  |
| 関連文書        | DOC-WF-corporate-address-workflow, DOC-WF-corporate-address-approval-policy, DOC-FW-01, DOC-APP-02, DOC-KNW-04            |
| SSOT 区分       | UC-BO-01 AI 実行方針 / 参照ナレッジ / スクショ粒度 の SSOT                                                                |
| Evidence Status | N/A (AI 実行方針のみ、定量値は SLO で `[仮説 / 要検証]` ラベル付き)                                                       |
| 改版履歴        | v0.1 (2026-05-26): 初版作成 (Day 6)。v0.2 (2026-05-30): Day 10.1 hygiene patch (CR R15 反映、§1 staging citation 表現を Plan v1.4 P0-1 規範に整合化 [「参照可、ただし compiled より優先度低」→「正式実行根拠 (citation) ではない、3 用途限定」]、§2 参照ナレッジ表 staging medium/low row「citation 注意付き / citation せず」→「citation 不可 (hint / confidence / review question のみ)」、§2.2 DOC-KNW-04 詳述予定 stale pointer を §4.5 + §8 へ張替、関連 P0-3 / P0-4)。v0.3 (2026-05-30): Day 10.2 hygiene patch (CR R16 Blocking 反映、§2.1 + §関連文書 で `DOC-KNW-04 (Day 8 起稿予定)` を実 path `docs/04-knowledge-pipeline.md` へ張替、Day 10.1 verification failure 解消) |

---

## 1. AI 実行方針

AI (`agent-corporate-address-change`, `v0.1`) は本業務の 8 step (DOC-WF-corporate-address-workflow §2) を自律的に実行し、各 step で screenshot を取得して入力者の Case Review 画面に提示する。

実行は次の原則に従う:

- **承認された手順だけを AI に覚えさせる** (Core message sub 2): 本 doc + compiled knowledge (`workflows/corporate-address-change/knowledge/compiled/`) のみを base instruction とする
- **staging knowledge は AI runtime に visible** (信頼度低、未承認): **正式実行根拠 (citation) ではない**。利用範囲は (1) confidence 低下シグナル / (2) human reviewer への hint / (3) AI 追加確認質問 trigger の 3 用途に限定 (DOC-FW-01 §3.5、DOC-ROOT-\_SSOT §1.4 末尾「staging knowledge の runtime 利用範囲 (Safety boundary)」)
- **差戻し受領時の挙動**: 差戻しコメント + 5-category を受領 → AI runtime は次の case 処理から compiled を優先参照、過去 case の AI proposal は不変 (DOC-FW-01 §6.3、audit trail 保護)
- **AI は組織責任主体ではない**: 提案生成 (Proposal source) として動作、組織責任は Manual 管理者 (Queue owner) と業務責任者 (Approver) の 2 ロール構造に保持

## 2. 参照ナレッジ

AI runtime が参照する knowledge の優先順位:

| 優先度 | source                                                          | weight | 性質                                           |
| ------ | --------------------------------------------------------------- | ------ | ---------------------------------------------- |
| 高     | 本 doc + workflow.md + approval-policy.md (compiled procedures) | -      | 手順承認済の正式手順、`workflows/{業務}/*.md`  |
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

- 同種の差戻しが複数 case で再発 (demo mock では 3 件まとめて表示)
- 共通 pattern が確認可能 (差戻しコメントの主旨が一致)
- staging 内容に内部矛盾なし

詳細 logic SSOT は DOC-KNW-04 (`docs/04-knowledge-pipeline.md` §2 AI 日次分析 logic)。

### 2.2 `data_error` の routing

`data_error` カテゴリは **AI 責でない入力データの誤り**。staging に格納はされるが:

- 通常の compiled 昇格対象外
- log / audit / 別 routing 扱い
- AI runtime の参照対象外 (上記表 §2 「対象外」)

代わりに Audit Trail (`/audit`) に記録、Manual 管理者が定期的に review (DOC-FW-01 §2.3、DOC-KNW-04 §4.5 data_error 例外 + §8 audit event model で詳述)。

## 3. スクショ粒度 (8 step × 8 枚、mock screenshot)

各 step で 1 枚の screenshot を取得 (DOC-WF-corporate-address-workflow §2 と整合):

| #   | Step                  | Screenshot file        | 内容                                                                |
| --- | --------------------- | ---------------------- | ------------------------------------------------------------------- |
| 1   | ログイン              | `login.png`            | service account ログイン画面                                        |
| 2   | 顧客検索              | `customer-search.png`  | 法人名検索結果 list                                                 |
| 3   | 顧客詳細 (現住所)     | `customer-detail.png`  | 現住所 + 契約内容表示                                               |
| 4   | 住所変更フォーム      | `address-form.png`     | 新住所入力中 (郵便番号 / 都道府県 / 市区町村 / 番地 / 建物名)       |
| 5   | 住所入力確認          | `address-validate.png` | syntax / format check 結果                                          |
| 6   | 国土地理院 API verify | `gsi-verify.png`       | API verify 結果 (pass / fail)                                       |
| 7   | 最終確認              | `final-review.png`     | 全項目 reconciliation (現住所 / 新住所 / 顧客情報 / Alert 発火状況) |
| 8   | 完了                  | `completion.png`       | 業務システム反映後の confirmation                                   |

prototype では mock screenshot を `prototype/src/assets/mock-screenshots/uc-bo-01/` に配置 (Day 11+ で実体化)。**実接続はしない** (CLAUDE.md scope-out、実 customer data / 実 PDF も使わない)。

## 4. AI が要求する Tool / Permission

| Tool / Permission     | 用途                        | 設定承認 Type                                | v2 prototype での扱い            |
| --------------------- | --------------------------- | -------------------------------------------- | -------------------------------- |
| 業務システム read     | 顧客検索 / 顧客詳細表示     | Type A 通常                                  | 実行されず、本 doc 記述のみ      |
| 業務システム write    | 住所変更フォーム入力 / 反映 | Type B (Security 関係者 co-A 必須)           | 実行されず、本 doc 記述のみ      |
| 国土地理院 API read   | 住所 verify                 | Type B (外部 API 接続、Security 関係者 co-A) | 実行されず、本 doc 記述のみ      |
| screenshot キャプチャ | 8 step 証跡取得             | Type A 通常                                  | mock screenshot を assets に配置 |

詳細 Type 区分は DOC-APP-02 §4 (設定承認 Type A/B/C) 参照。本番接続方式の tier 化 (標準 API / 準標準 MQ / 代替 RPA・Computer Use・MCP / 例外 DB 直接続 read-only) は DOC-OV-00 §2.2 接続層メモ。

## 5. AI の挙動制約

| 制約                    | 説明                                                                                      |
| ----------------------- | ----------------------------------------------------------------------------------------- |
| 自律進行                | 8 step を順次実行、各 step で screenshot 取得 + Case Review 画面更新                      |
| 例外時の停止            | Alert 発火 (approval-policy §3 の 5 条件) または API verify 失敗時は処理停止 + Alert 表示 |
| 差戻し受領時の learning | staging snippet 自動生成 + AI runtime visible、過去 case は不変                           |
| Automation Maturity     | supervised level (全件 4-eyes)、Day 6 起稿時点では Checkpoint 未到達                      |

Automation Maturity の進化は Matrix B 原則 (DOC-APP-02 §7.1) に従う:

> **AIに任せる量は段階的に増やすが、人によるコントロールは渡さない。**
>
> 案件確認は減らす。ルール承認は残す。

## 6. 関連文書

- DOC-WF-corporate-address-workflow: 業務手順 (8 step / 期待状態 / 禁止事項)
- DOC-WF-corporate-address-approval-policy: Alert 5 条件 / 差戻し条件 / 過去 case 関連ルール更新 Alert
- DOC-FW-01 §3 / §4: staging / compiled 反映 path、AI 日次分析 trigger
- DOC-APP-02 §3: 手順承認 RACI / §4: 設定承認 Type A/B/C / §7: Matrix B 不変条件
- DOC-KNW-04 (`docs/04-knowledge-pipeline.md`): AI 日次分析 logic SSOT / 5-category routing 詳細 / LLMOps framework
- `_meta.yaml`: machine-readable metadata
