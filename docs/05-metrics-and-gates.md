# Backoffice AI v2 — Metrics & Gates

| 項目            | 値                                                                                                                                                                                                                                                             |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 文書 ID         | DOC-MON-05                                                                                                                                                                                                                                                     |
| 文書名          | Metrics & Gates (SLO 仮値 + 4 KPI multi-criteria 仮説 gate + 各 KPI 定義 + 7 KPI catalogue + 9 KRI catalogue + Audit evidence event model reference)                                                                                                           |
| 版数            | v0.1                                                                                                                                                                                                                                                           |
| ステータス      | Draft                                                                                                                                                                                                                                                          |
| オーナー        | backoffice-ai-v2 maintainer (AI 管理者 + 業務責任者 合議)                                                                                                                                                                                                      |
| 承認者          | self — 設定承認 (Metrics + 仮説 gate / target hypothesis 設計の確定)                                                                                                                                                                                           |
| 閲覧対象        | Internal / Project team / Session 4 facilitator                                                                                                                                                                                                                |
| 機密区分        | Internal                                                                                                                                                                                                                                                       |
| 関連文書        | DOC-OV-00 §1.2, DOC-FW-01 §6.2 / §7.1, DOC-APP-02 §7, DOC-UI-03 §4.8 (Metrics screen), DOC-KNW-04 §5.3 / §8, DOC-S4-06 Slide 8, DOC-ROOT-\_SSOT §1.3 (SLO pointer) / §1.4                                                                                      |
| SSOT 区分       | SLO 仮値 + 4 KPI multi-criteria 仮説 gate + 各 KPI 定義 (分母 / 対象 / 除外 / sampling / 軽微 vs 実質 / precision-FP / 二重カウント防止) + 7 KPI catalogue + 9 KRI catalogue + Audit event reference の SSOT                                                   |
| Evidence Status | N/A (本 doc 内の数値はすべて `[仮説 / 要検証]`。Phase 1 で measurement → calibration → governance review、本番導入可否を判定する gate ではない)                                                                                                                |
| 改版履歴        | v0.1 (2026-05-29): 初版作成 (Day 9、Plan v1.4 P0-2 (KPI re-framing) + P1-2-a (KPI 各定義) + P1-5 (Audit event reference) + v1.4.1 Fix 2 反映、SLO 仮値表を \_SSOT.md §1.3 から移管、Day 8 deferred "gate" 語を「仮説 gate / target hypothesis」に正式 framing)。v0.2 (2026-05-29): CR R12+R13 hygiene patch (Blocking 1 禁止語 self-hit 解消 §2 / §3.2 paraphrase、Major 3 仮説ラベル統一 [仮値/要検証] → [仮説/要検証]、Minor R8 注追加 agent_version lifecycle Phase 1 定義予定) |

---

## 1. 概要

本 doc は v2 の **Metrics & Gates SSOT**。SLO 仮値、4 KPI multi-criteria 仮説 gate (Automation Maturity 進化判断材料)、7 KPI catalogue、9 KRI catalogue、各 KPI の measurement 定義 (分母 / 対象 / 除外 / sampling 等)、Audit event reference を 1 文書に集約する。

主要 section:

- §2 位置付け (KPI / SLO 仮値はすべて Phase 1 検証仮説、本番導入可否を判定する gate ではない)
- §3 SLO 仮値表 (`docs/_SSOT.md` §1.3 から移管した本体)
- §4 4 KPI multi-criteria 仮説 gate + §4.1 一覧 + §4.2 各 KPI 定義
- §5 7 KPI catalogue (ai-operator 24 §3.2 圧縮)
- §6 9 KRI catalogue (ai-operator 24 §4.1 圧縮)
- §7 Automation Maturity 進化条件 (Supervised → Checkpoint → Autonomous の 4 KPI gate)
- §8 Audit evidence event model reference (`docs/04-knowledge-pipeline.md` §8 pointer)
- §9 「仮説 gate / target hypothesis」表現規範 (Day 8 deferred 解消)

## 2. 位置付け (Plan v1.4 P0-2 / v1.4.1 Fix 2)

**重要**: 本 doc に記載の SLO 仮値および 4 KPI 仮閾値 (AI 入力承認率 ≥ 99% / 人手上書き率 ≤ 1% / Alert 発生率 ≤ 5% / 承認者差戻し率 ≤ 1%) は、すべて以下の性格を持つ:

- **本番導入可否を判定する gate ではない**
- **Phase 1 で測定・再設定する検証仮説 (target hypothesis)**
- **Session 4 で示す数値は target hypothesis であり実績値ではない**

実 gate 化は Phase 1 でサンプル業務に対する measurement → calibration → governance review を経て決定する。

各値には `[仮説 / 要検証]` ラベル必須。real-time guarantee 風表現は使わない (該当語彙の trace は `docs/prior-art-map.md` で記録)。

real-time guarantee 風表現は禁止 (Plan v1.4.1 Fix 2、該当語彙の exact list と trace は `docs/prior-art-map.md` で記録、self-hit 回避のため本 doc には exact text を置かない)。SLO 表現は「同一セッション内」「当日中」「日次」「次回 AI 処理から」「15 分以内」「月次」に統一。

## 3. SLO 仮値表 (本 doc が SSOT、`docs/_SSOT.md` §1.3 から移管)

本 §3 が SLO 仮値の **SSOT 本体**。`docs/_SSOT.md` §1.3 は pointer 化された (Plan v1.4.1 Fix 4 / v1.4.2 Rule 3 と整合)。

### 3.1 SLO 仮値表 [仮説 / 要検証]

| 段                           | 値                                                               |
| ---------------------------- | ---------------------------------------------------------------- |
| 差戻し送信 → staging 反映    | prototype: 同一セッション内 / 本番仮値: 当日中 `[仮説 / 要検証]` |
| staging 生成 (AI auto-draft) | prototype: 同一セッション内 / 本番仮値: 当日中 `[仮説 / 要検証]` |
| compiled 候補分析 (AI 日次)  | 日次 `[仮説 / 要検証]`                                           |
| 手順承認後の反映             | 次回 AI 処理から `[仮説 / 要検証]`                               |
| 設定承認 (Ad-hoc)            | 申請時 review 着手 当日中 `[仮説 / 要検証]`                      |
| 設定承認 (Batch)             | 月次 `[仮説 / 要検証]`                                           |
| Emergency stop               | 15 分以内 `[仮説 / 要検証]`                                      |
| Rollback                     | 当日中 `[仮説 / 要検証]`                                         |

### 3.2 表現規範

- 使用語: 「同一セッション内」「当日中」「日次」「次回 AI 処理から」「15 分以内」「月次」
- 禁止表現: real-time guarantee 風表現 (該当語彙の exact list と trace は `docs/prior-art-map.md` で記録、self-hit 回避のため本 doc には exact text を置かない)
- prototype は「同一セッション内」のみ (in-memory state、永続化なし)
- 本番仮値はすべて `[仮説 / 要検証]` ラベル必須

## 4. 4 KPI multi-criteria 仮説 gate

### 4.1 4 KPI 一覧 [仮説 / 要検証] (ai-operator 24 §3.2 継承)

| KPI            | target hypothesis       | 性格                             |
| -------------- | ----------------------- | -------------------------------- |
| AI 入力承認率  | ≥ 99% `[仮説 / 要検証]` | 入力者が AI 結果を accept する率 |
| 人手上書き率   | ≤ 1% `[仮説 / 要検証]`  | 入力者が AI 結果を編集する率     |
| Alert 発生率   | ≤ 5% `[仮説 / 要検証]`  | 案件に対して Alert が出る率      |
| 承認者差戻し率 | ≤ 1% `[仮説 / 要検証]`  | 承認者が業務承認を reject する率 |

**注**: 上記 4 KPI は Automation Maturity (Supervised → Checkpoint → Autonomous、§7 + DOC-APP-02 §7) 進化判断の **multi-criteria 仮説 gate**。**本番導入可否の即時判定 gate ではなく、Phase 1 検証仮説** として扱う (Plan v1.4 P0-2 / v1.4.1 Fix 2)。

### 4.2 各 KPI 定義 (Plan v1.4 P1-2-a)

#### 4.2.1 AI 入力承認率

| 項目        | 定義                                                                                                        |
| ----------- | ----------------------------------------------------------------------------------------------------------- |
| 分母        | 対象 workflow の case 件数 (期間内) — 入力者確認まで到達した全 case                                         |
| 分子        | 入力者が AI 結果を accept した case 件数 (編集 / 差戻しなし)                                                |
| 対象業務    | active 業務のみ (UC-BO-01 + UC-BO-02)。restricted boundary pack (国際送金) は除外                           |
| 除外条件    | (1) `data_error` category の差戻し case (AI 責でない、DOC-KNW-04 §4.5) (2) prototype 開発期間中の test case |
| sample size | Phase 1 で確定 [仮説 / 要検証]。Session 4 では sample 仮値で説明                                            |
| 集計頻度    | 日次 + 週次 + 月次 (Metrics 画面 DOC-UI-03 §4.8 で表示)                                                     |

#### 4.2.2 人手上書き率

| 項目                           | 定義                                                                                                                            |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| 分母                           | 対象 workflow の case 件数 (期間内、入力者確認まで到達)                                                                         |
| 分子                           | 入力者が AI 結果を編集した case 件数                                                                                            |
| **軽微修正 vs 実質修正の区別** | 軽微修正 (typo / format 微調整) と 実質修正 (内容変更 / 判断変更) を区別。本 KPI は **実質修正のみカウント** (Plan v1.4 P1-2-a) |
| 対象業務                       | active 業務のみ                                                                                                                 |
| 除外条件                       | (1) 軽微修正のみの case (2) `data_error` 由来の修正                                                                             |
| sample size                    | Phase 1 で確定 [仮説 / 要検証]                                                                                                  |
| 集計頻度                       | 日次 + 週次 + 月次                                                                                                              |

#### 4.2.3 Alert 発生率

| 項目                                | 定義                                                                                                                                               |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| 分母                                | 対象 workflow の case 件数 (期間内)                                                                                                                |
| 分子                                | Alert が 1 件以上発生した case 件数                                                                                                                |
| **precision / false positive 併記** | Alert 発生率と並んで **precision (Alert → 実 Alert 該当の率)** + **false positive 率 (Alert → 実 Alert 不該当の率)** を必ず併記 (Plan v1.4 P1-2-a) |
| 対象業務                            | active 業務のみ                                                                                                                                    |
| 除外条件                            | (1) 通知のみの info Alert (action 不要、warning 未満) (2) test Alert                                                                               |
| sample size                         | Phase 1 で確定 [仮説 / 要検証]                                                                                                                     |
| 集計頻度                            | 日次 + 週次 + 月次                                                                                                                                 |

#### 4.2.4 承認者差戻し率

| 項目                 | 定義                                                                                            |
| -------------------- | ----------------------------------------------------------------------------------------------- |
| 分母                 | 対象 workflow の case 件数 (期間内、承認者確認まで到達)                                         |
| 分子                 | 承認者が業務承認を reject した case 件数                                                        |
| **二重カウント防止** | 入力者差戻しと別 KPI。**承認者差戻しのみカウント** (入力者差戻しと加算しない、Plan v1.4 P1-2-a) |
| 対象業務             | active 業務のみ                                                                                 |
| 除外条件             | (1) `data_error` 由来の差戻し (2) input 側の修正 (担当差し戻し) — 承認者由来のみ                |
| sample size          | Phase 1 で確定 [仮説 / 要検証]                                                                  |
| 集計頻度             | 日次 + 週次 + 月次                                                                              |

### 4.3 Automation Maturity 進化 multi-criteria gate

4 KPI **全件** が target hypothesis を満たした場合に Automation Maturity の進化を **検討対象** とする (進化判断は業務責任者 + AI 管理者 + Security 関係者の合議、即時自動進化ではない):

- Supervised → Checkpoint: 4 KPI 全件で 3 ヶ月以上連続達成 `[仮説 / 要検証]`
- Checkpoint → Autonomous: 4 KPI 全件で 6 ヶ月以上連続達成 + 9 KRI に異常なし `[仮説 / 要検証]`

詳細 RACI と進化判断 process は DOC-APP-02 §7 (Matrix B + Automation Maturity)、Phase 1 で正式 governance review。

## 5. 7 KPI catalogue (ai-operator 24 §3.2 圧縮)

§4 の 4 KPI に加え、補助 KPI 7 件を catalogue:

| #   | KPI 名              | 内容                                                      | sample target hypothesis |
| --- | ------------------- | --------------------------------------------------------- | ------------------------ |
| K1  | AI 入力承認率       | (§4.2.1)                                                  | ≥ 99% `[仮説 / 要検証]`           |
| K2  | 人手上書き率        | (§4.2.2)                                                  | ≤ 1% `[仮説 / 要検証]`            |
| K3  | Alert 発生率        | (§4.2.3)                                                  | ≤ 5% `[仮説 / 要検証]`            |
| K4  | 承認者差戻し率      | (§4.2.4)                                                  | ≤ 1% `[仮説 / 要検証]`            |
| K5  | 案件平均処理時間    | AI 入力開始 → 承認者承認完了までの平均時間                | 業務別に定義 `[仮説 / 要検証]`    |
| K6  | compiled 昇格成功率 | Procedure Update Proposal が業務責任者に approve される率 | ≥ 70% `[仮説 / 要検証]`           |
| K7  | staging triage 時間 | staging 生成 → Manual 管理者 triage までの平均時間        | 当日中 `[仮説 / 要検証]` |

K1-K4 は §4 multi-criteria gate 対象。K5-K7 は補助 KPI (Metrics 画面表示、進化判断には直接使わないが trend 観測)。

## 6. 9 KRI catalogue (ai-operator 24 §4.1 圧縮)

KRI (Key Risk Indicator) は **異常検知 trigger**。閾値超過時は Manual 管理者 / AI 管理者に通知、必要に応じて Forced Downgrade (DOC-APP-02 Matrix C) を発動:

| #   | KRI 名                           | trigger 条件                                                                     | 対応                                         |
| --- | -------------------------------- | -------------------------------------------------------------------------------- | -------------------------------------------- |
| R1  | AI 入力承認率 drift              | target hypothesis (≥ 99%) を週次平均で下回り、2 週連続 `[仮説 / 要検証]`         | Manual 管理者通知、AI 管理者 review          |
| R2  | 人手上書き率 spike               | target hypothesis (≤ 1%) を日次平均で 3 倍以上超過 `[仮説 / 要検証]`             | Manual 管理者通知 + Forced Downgrade 検討    |
| R3  | Alert false positive 急増        | precision (§4.2.3 併記) が週次で 50% 下回り `[仮説 / 要検証]`                    | approval-policy.md Alert 条件 review trigger |
| R4  | 承認者差戻し率 急上昇            | target hypothesis (≤ 1%) を週次平均で 5 倍以上超過 `[仮説 / 要検証]`             | 業務責任者通知 + Forced Downgrade 検討       |
| R5  | UI drift 検知                    | 業務システム画面 layout 変更による RPA / Computer Use 操作失敗 `[仮説 / 要検証]` | AI 管理者通知 + agent-instructions.md review |
| R6  | compiled / staging conflict 発生 | 同一 workflow 内で compiled と staging が矛盾 (DOC-KNW-04 §7.2) `[仮値]`         | Manual 管理者 triage 強制                    |
| R7  | 同種差戻し再発頻度               | 同一 case ID で 2 回以上 sendback `[仮説 / 要検証]`                              | Manual 管理者 + AI 管理者通知                |
| R8  | agent_version drift              | proposal source AI が deprecated agent_version で生成 `[仮説 / 要検証]` (注: Phase 1 で `agent_version` lifecycle (current / deprecated / archived) を定義予定、本 v2 phase では skeleton) | AI 管理者通知、agent_version 強制 upgrade    |
| R9  | データ品質低下                   | `data_error` category 差戻しが週次平均で 2 倍以上増加 `[仮説 / 要検証]`          | 入力 PDF 受領元への channel review trigger   |

KRI 閾値はすべて `[仮説 / 要検証]`。Phase 1 で measurement → calibration → governance review。

## 7. Automation Maturity 進化条件 (4 KPI gate 関連)

DOC-APP-02 §7 (Matrix B) と整合。Automation Maturity は Supervised → Checkpoint → Autonomous の 3 段:

| 段階       | 案件承認の介在         | 4 KPI 全件達成期間 `[仮説 / 要検証]` | 9 KRI 状態 |
| ---------- | ---------------------- | ------------------------------------ | ---------- |
| Supervised | 全件 (入力者 + 承認者) | (初期段階、進化未検討)               | -          |
| Checkpoint | 重要分岐のみ           | 3 ヶ月以上連続達成                   | 異常なし   |
| Autonomous | サンプリング           | 6 ヶ月以上連続達成                   | 異常なし   |

**Matrix B 原則**: Automation Maturity が進化しても **手順承認・設定承認 loop は同じ強度で残る**。縮小するのは案件承認の介在頻度のみ (DOC-FW-01 §7.1、DOC-APP-02 §7、DOC-S4-06 Slide 7)。

## 8. Audit evidence event model reference

Audit evidence event model (15 行、paired field 含む実 field 数 18) の SSOT は `docs/04-knowledge-pipeline.md` §8。本 doc は KPI / KRI 集計の source data として参照のみ:

- `case_id` → 案件平均処理時間 (K5) 算出
- `human_decision_id` + accept/reject status → AI 入力承認率 (K1) / 人手上書き率 (K2) / 承認者差戻し率 (K4) 算出
- `sendback_category` → `data_error` 除外、5-category 別 trend
- `ai_proposal_id` + `compiled_knowledge_citation_ids` → compiled 昇格成功率 (K6) 算出
- `approval_timestamp` → SLO 「手順承認後の反映」「設定承認 (Ad-hoc / Batch)」測定

詳細 schema (15 行 / 18 field) は DOC-KNW-04 §8 を SSOT として参照。

## 9. 「仮説 gate / target hypothesis」表現規範 (Day 8 deferred 解消)

Day 8 docs (DOC-UI-03 / DOC-KNW-04) で残存していた「gate」表現を本 doc で正式 framing:

- **使用語**: 「仮説 gate」「target hypothesis」「multi-criteria 仮説 gate」「Phase 1 検証仮説」
- **避ける語**: 「即時 gate」「本番導入可否を判定する gate」(Plan v1.4 P0-2 / v1.4.1 Fix 2、§2 と整合)
- **文脈別**:
  - Session 4 表層 (Slide 8): 「4 KPI multi-criteria 仮説 gate (target hypothesis)」と表現
  - 内部 docs: 「4 KPI multi-criteria 仮説 gate」「Phase 1 で正式 gate 化」と表現
  - Metrics 画面 (DOC-UI-03 §4.8): PageHeader 直下に「本番導入可否を判定する gate ではない、Phase 1 で測定・再設定する検証仮説」注を必ず表示

本規範は本 doc 起稿 (Day 9) 以降の docs / UI / slide に適用。既存 Day 6-8 docs の「gate」表現は本 doc §2 + §9 文脈で許容 (paraphrase 不要、本 doc reference が解消手段)。

## 10. 関連文書

- DOC-OV-00 §1.2 (Core message、§7 Matrix B と連携)
- DOC-FW-01 §6.2 (反映効果の KPI 観測、§4-7 と整合) + §7.1 (Matrix B 主表現)
- DOC-APP-02 §7 (Matrix B + Automation Maturity、§7 と整合)
- DOC-UI-03 §4.8 (Metrics screen、本 doc を SSOT として visual 化)
- DOC-KNW-04 §5.3 (Evaluation reference、本 doc を pointer) + §8 (Audit evidence event model SSOT、§8 で reference)
- DOC-S4-06 Slide 8 (Metrics + multi-criteria 仮閾値、本 doc を SSOT として narrative 化)
- DOC-ROOT-\_SSOT §1.3 (SLO 仮値 pointer、本 doc §3 が移管後の本体) + §1.4 (Snippet schema、KPI の sample source 整合)
- `~/.claude/plans/ai-backoffice-ai-virtual-muffin.md` Plan v1.4 P0-2 (KPI re-framing) + P1-2-a (KPI 各定義) + P1-5 (Audit event reference) + v1.4.1 Fix 2 (即時 gate paraphrase)
