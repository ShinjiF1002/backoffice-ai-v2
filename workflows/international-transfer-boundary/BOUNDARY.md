# 国際送金 — Scope Boundary (restricted boundary pack)

| 項目            | 値                                                                                                                         |
| --------------- | -------------------------------------------------------------------------------------------------------------------------- |
| 文書 ID         | DOC-WF-international-transfer-BOUNDARY                                                                                     |
| 文書名          | 国際送金 Scope Boundary (restricted の画定、UC-BO-IT-BOUNDARY)                                                             |
| 版数            | v0.1                                                                                                                       |
| ステータス      | Draft                                                                                                                      |
| オーナー        | 業務責任者 + Security 関係者 + AI 管理者 (boundary 設計の合議)                                                             |
| 承認者          | 設定承認 Type A or Type C — boundary 変更は通常 loop 対象外、boundary review proposal mechanism (DOC-APP-02 §9.7) 経由のみ |
| 閲覧対象        | Internal / Project team                                                                                                    |
| 機密区分        | Internal                                                                                                                   |
| 関連文書        | workflow.md, \_meta.yaml, DOC-FW-01 §4.3, DOC-APP-02 §3.4 / §9.7, DOC-OV-00 §2.1                                           |
| SSOT 区分       | 国際送金 restricted 条件 / 閾値 rationale / boundary review proposal mechanism 詳細 の SSOT                                |
| Evidence Status | Hypothesis — `$10M` 閾値は demo 用仮値、実閾値は Phase 1 で evidence-based 検証                                            |
| 改版履歴        | v0.1 (2026-05-27): 初版作成 (Day 7、restricted boundary pack の scope 画定文書)                                            |

---

## 1. Scope 画定 (restricted の意味)

国際送金は `automation_status: restricted` (条件付き制限業務)。以下の境界線を持つ:

| 案件区分                   | 閾値                                         | AI 自動化        | 対応                                                   |
| -------------------------- | -------------------------------------------- | ---------------- | ------------------------------------------------------ |
| **high-value (high risk)** | 送金額 ≥ `$10M equivalent` `[仮説 / 要検証]` | **prohibited**   | 人間判断必須 (業務責任者 + Security 関係者の合議)      |
| **low-value**              | 送金額 < `$10M equivalent` `[仮説 / 要検証]` | future_candidate | フレームワーク信頼性確認後 (Phase 2+) に限定自動化検討 |

**実閾値は Phase 1 で検証・決定**。本 v2 では `$10M` を `[hypothesis_requires_validation]` ラベル付き仮値として使用。

## 2. Rationale (なぜ restricted か)

国際送金は以下の人間判断要素を含むため、本 v2 phase では **AI 自動化を boundary で制限** する設計:

- **送金先・受取人・取引目的の確認**: 取引パターン / 送金先国 / 受取人 background の人間判断
- **制限対象 (送金先・受取人) との照合確認**: 制限対象リストとの照合、false positive / negative の人間判断
- **国別ルール・為替制限の判断**: 国際為替制限 / 国別ルールの人間判断
- **報告要否の判断**: 高額案件の報告義務、報告 trigger の人間判断
- **顧客リスク区分の再評価**: high-value 案件は顧客リスク区分の再評価を伴う場合がある

これらは規制 / コンプライアンス領域に属する人間判断を含む業務領域。本 v2 docs 内では具体的な規制名を事実主張せず、設計判断として「人間判断必須」を採用。

詳細な規制論拠は `docs/prior-art-map.md` 経由参照、および DOC-APP-02 §10 (規制 cite hedge prior-art pointer 一覧) に集約。Phase 1 で external regulatory review を経て確定する (本 v2 では reference link のみ)。

## 3. 通常 loop 適用外 (DOC-FW-01 §4.3、DOC-APP-02 §3.4)

本 BOUNDARY.md は **Flywheel の通常 loop の対象外**:

- 差戻し → staging → compiled → workflow diff の経路では BOUNDARY.md を更新しない
- 通常業務 (UC-BO-01 / UC-BO-02) の手順承認 RACI (R = Manual 管理者 / A = 業務責任者) では本 doc を変更しない
- 通常 loop で BOUNDARY.md に diff が生まれる経路は **存在しない**

理由: BOUNDARY.md は scope 画定文書であり、更新には経営判断 / Security review / 規制 review が必要。通常の手順承認の頻度 (週次〜月次想定) より低頻度 (月次以下 `[仮説 / 要検証]`)。

## 4. Boundary review proposal mechanism (詳細)

BOUNDARY.md の更新は **boundary review proposal mechanism** (DOC-APP-02 §9.7) 経由でのみ可能。

### 4.1 起点 (Proposal source = AI)

AI (`agent-international-transfer-boundary-analyzer`、`v0.1`) が以下を analyze し、boundary review proposal を自動生成:

- 発生頻度: 高額案件の月次 case 数 trend
- 差戻し頻度: 閾値前後の判定 marginal case
- 例外傾向: 送金先・受取人確認 / 制限対象照合 / 報告要否判断 trigger 頻度
- フレームワーク信頼性 metric: KPI / KRI (DOC-MON-05) の trend

判断基準 (仮、`[仮説 / 要検証]`、本番 threshold は Phase 1 で要定義):

- 閾値前後 (例: `$8M-12M` range) の case が一定数発生
- 送金先・受取人確認 / 制限対象照合の人間判断 confidence が安定 (false positive 率低下)
- フレームワーク 4 KPI が gate 基準 pass (DOC-MON-05 Day 9 起稿予定)

### 4.2 RACI (本 boundary review proposal)

| RACI 列         | 主体                                                       | 役割                                                        |
| --------------- | ---------------------------------------------------------- | ----------------------------------------------------------- |
| Proposal source | AI (`agent-international-transfer-boundary-analyzer`)      | boundary review proposal を自動生成                         |
| R (Queue owner) | Manual 管理者 or AI 管理者                                 | キュー責任、boundary 提案の受理 / triage / forward / reject |
| A (承認)        | 設定承認 Type A (通常) / Type C (Automation Maturity 関連) | 設定承認、業務責任者 + Security 関係者の合議で判断          |
| C (合議)        | SME / 業務責任者 / Security 関係者                         | 規制 / コンプライアンス領域の影響評価 (詳細は `docs/prior-art-map.md` 経由参照) |
| I (通知)        | 入力者 / 承認者                                            | 反映後の運用に影響、case 処理での判断材料                   |

### 4.3 反映先

承認後、以下を update:

- 本 BOUNDARY.md (scope 画定 / 閾値 / rationale 更新)
- `_meta.yaml` (`restricted_conditions.high_value_threshold` / `threshold_status` 等)
- workflow.md (関連箇所のみ)
- Plan (`~/.claude/plans/ai-backoffice-ai-virtual-muffin.md`) の関連箇所

### 4.4 発生頻度想定

**月次以下** `[仮説 / 要検証]`。頻発する場合 (週次以上) は通常 loop への組み込み再評価 (DOC-APP-02 §9.7)。本 v2 docs 内では月次以下を仮定。

## 5. Demo / Session 4 での扱い

- **Demo 操作なし**: Day 20 demo-script で本 boundary pack に言及なし。Day 9 narrative (DOC-S4-06 Slide 7) では境界例として 1 行だけ言及可 (Tier 3 規制語は出さない)
- **Dashboard カード化なし**: Dashboard 並列カードは UC-BO-01 + UC-BO-02 のみ
- **UI 画面化なし**: prototype の 9 画面に boundary 業務 entry point は出さない
- **Tier 3 規制語の表層出力なし**: Session 4 slide / UI label / mock data には Tier 3 規制語 (CLAUDE.md Tier 3 list 参照、DOC-APP-02 §10 hedge ルール) を出さない

本 BOUNDARY.md は **docs として残す** ことで、Phase 1 hand-off (regulatory review + boundary review proposal の運用開始) の foundation とする。

## 6. 関連文書

- workflow.md: 国際送金 業務概要 + restricted boundary pack の意味
- `_meta.yaml`: machine-readable metadata (`restricted_conditions` schema)
- DOC-FW-01 §4.3: 通常 loop の BOUNDARY 適用外 (Flywheel side)
- DOC-APP-02 §3.4: BOUNDARY 通常 loop 対象外 (Approval side)
- DOC-APP-02 §9.7: Boundary Review Proposal の設定承認扱い (本 doc §4 と整合)
- DOC-APP-02 §10: 規制 cite hedge (prior-art pointer 一覧)
- DOC-OV-00 §2.1: 対象業務 (国際送金 = restricted、`$10M [仮説 / 要検証]`、実閾値は Phase 1 で検証・決定)
- DOC-OV-00 §3: 非スコープ (UI 画面化なし)
- DOC-ROOT-\_PROGRESS §2.2: Day 7 影響分析
