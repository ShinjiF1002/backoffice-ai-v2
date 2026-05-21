# SSOT Map - backoffice-ai-v2

各論点の Single Source of Truth (SSOT) を 1 つの文書に固定する mapping。文書間で衝突発生時は SSOT 側を更新、reference 側は引用に留める。本 file は Day 1 起稿、Day 10 (Design Gate) + Day 19 で refresh。

| 項目            | 値                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 文書 ID         | DOC-ROOT-\_SSOT                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| 文書名          | SSOT Map (各論点の Single Source of Truth mapping)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 版数            | v0.1                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ステータス      | Draft                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| オーナー        | backoffice-ai-v2 maintainer                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 承認者          | self — 設定承認 (SSOT 配分の確定)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 閲覧対象        | Internal / Project team                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 機密区分        | Internal                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| 関連文書        | DOC-ROOT-prior-art-map, DOC-ROOT-\_HEADER_TEMPLATE (全 docs / workflows / demo を mapping)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| SSOT 区分       | 文書間 SSOT mapping + Approval Taxonomy + enum 統一                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Evidence Status | N/A (mapping 定義のみ、定量値なし)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 改版履歴        | v0.1 (2026-05-21): 初版作成 (Day 1)。v0.1 (2026-05-22): Day 2 で 12 項目 header 追記。v0.2 (2026-05-25): Day 5 整合化 update (enum 拡張 / Approval Taxonomy RACI / SLO 仮値 / Snippet schema / 接続方針 SSOT pointer / Core Message 表現 SSOT 追加、Plan v1.3 final patch 反映)。v0.3 (2026-05-27): CR R8 patch 反映 (§1.4 末尾 staging knowledge runtime safety boundary 新規 subsection / SLO 表前注 KPI re-framing / 新 section「Session 4 表層表現規範 (Tier 1/2/3 言い換え rule)」、Plan v1.4 P0-1 / P0-2 / P0-4)。v0.4 (2026-05-28): Day 8 update (§1.5 接続方針 SSOT pointer を control matrix 5 列 (Read / Write / 証跡 / 失敗時制御 / Phase 1 優先度) に拡張、Plan v1.4 P1-6 / v1.4.2 Rule 5)。v0.5 (2026-05-29): Day 9 update (§「SLO 仮値」を `docs/05-metrics-and-gates.md` §3 への pointer 化、SLO 仮値表本体は 05 に SSOT 移管、Plan v1.4.1 Fix 4 / v1.4.2 Rule 3 と整合)。v0.6 (2026-05-29): CR R12+R13 hygiene patch (禁止語 self-hit 解消、§1.3 pointer の exact text を「real-time guarantee 風表現は禁止 (exact list と trace は `docs/prior-art-map.md`)」に paraphrase)。v0.7 (2026-05-30): Day 10 Design Gate refresh (既知 potential 衝突 table を 4 → 8 件に拡張 [v1.3 final patch 追加 4 件: 過去 case Alert UI / Snippet schema / Stripe design token / BOUNDARY review proposal を反映]、8 spot-check 全 pass 確認、grep gate 全 pass [I-M 拡張含む]、Topic mapping table は Day 6-9 起稿分すべて反映済を確認、修正不要) |

Refresh schedule: Day 5 / Day 10 (Design Gate) / Day 19。SSOT 衝突は Day 10 Design Gate で grep 検出。

## Topic → SSOT 文書 mapping

| 論点                                                                                                  | SSOT 文書                                                                          | 起稿 Day | 備考                                                                                                                      |
| ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------- |
| 構想 / スコープ / 非スコープ / Flywheel 1 枚図                                                        | `docs/00-overview.md`                                                              | Day 3    |                                                                                                                           |
| Flywheel 詳細 (差戻し → staging → compiled → 手順承認 → 設定承認)                                     | `docs/01-flywheel-and-knowledge.md`                                                | Day 3    |                                                                                                                           |
| 3 層承認 (案件 / 手順 / 設定)                                                                         | `docs/02-approval-model.md`                                                        | Day 4    | ai-operator 01 §3.1-3.3 圧縮 + 規制 cite hedge                                                                            |
| 4-eyes (入力 / 業務)                                                                                  | `docs/02-approval-model.md`                                                        | Day 4    |                                                                                                                           |
| Matrix A/B/C RACI                                                                                     | `docs/02-approval-model.md`                                                        | Day 4    | ai-operator 01 §5                                                                                                         |
| Automation Maturity (Supervised / Checkpoint / Autonomous)                                            | `docs/02-approval-model.md`                                                        | Day 4    | ai-operator 01 §6                                                                                                         |
| 9 画面 UI Screen Card                                                                                 | `docs/03-ui-prototype-design.md`                                                   | Day 8    | ai-operator 11 §4 9-field template (v2 再編)                                                                              |
| 5-category error taxonomy + Routing                                                                   | `docs/04-knowledge-pipeline.md`                                                    | Day 8    | backoffice-ai `knowledge/error_taxonomy.md`                                                                               |
| Knowledge staging / compiled 設計                                                                     | `docs/04-knowledge-pipeline.md`                                                    | Day 8    |                                                                                                                           |
| LLMOps framework                                                                                      | `docs/04-knowledge-pipeline.md`                                                    | Day 8    | ai-operator 24 §11                                                                                                        |
| 4 KPI multi-criteria 仮説 gate (AI 入力承認率 / 人手上書き率 / Alert 発生率 / 承認者差戻し率)         | `docs/05-metrics-and-gates.md`                                                     | Day 9    | `[仮説 / 要検証]` ラベル必須                                                                                              |
| 7 KPI catalogue + 9 KRI catalogue                                                                     | `docs/05-metrics-and-gates.md`                                                     | Day 9    | ai-operator 24 §3.2 + §4.1                                                                                                |
| Session 4 narrative 8 slide message                                                                   | `docs/06-session4-narrative.md`                                                    | Day 9    |                                                                                                                           |
| Demo Chapter 1/2 message spine                                                                        | `docs/06-session4-narrative.md`                                                    | Day 9    | message side                                                                                                              |
| Demo Chapter 1/2 実行 step                                                                            | `demo/demo-script.md`                                                              | Day 20   | execution side、narrative と分離                                                                                          |
| BusinessApprovalView mock figure spec                                                                 | `docs/06-session4-narrative.md` Slide 3 内 figure                                  | Day 9    | spec source                                                                                                               |
| BusinessApprovalView HTML source                                                                      | `demo/static-mocks/business-approval-view.html`                                    | Day 20   | 実体化 (Tailwind CDN 1 file html、AiProposalPanel と design token 整合)                                                   |
| BusinessApprovalView PNG export                                                                       | `demo/screenshots/business-approval-view.png`                                      | Day 20   | html を browser open + screenshot で export                                                                               |
| 旧 repo (v1 + ai-operator) 参照関係                                                                   | `docs/prior-art-map.md`                                                            | Day 1    | 継承 / 再編 / 捨てる の SSOT                                                                                              |
| Doc header template (12 項目)                                                                         | `docs/_HEADER_TEMPLATE.md`                                                         | Day 2    | Status / Evidence Status / SSOT 区分 / 機密区分 / Related Docs 等                                                         |
| UC-BO-01 法人住所変更 業務目的 / 手順 / 期待状態 / 禁止事項                                           | `workflows/corporate-address-change/workflow.md`                                   | Day 6    | 業務責任者 owner                                                                                                          |
| UC-BO-01 AI 実行方針 / 参照ナレッジ / スクショ粒度                                                    | `workflows/corporate-address-change/agent-instructions.md`                         | Day 6    | AI 管理者 owner                                                                                                           |
| UC-BO-01 担当者確認 / 承認者確認 / Alert / 差戻し条件                                                 | `workflows/corporate-address-change/approval-policy.md`                            | Day 6    |                                                                                                                           |
| UC-BO-01 metadata (owner / trust_level / risk_level / automation_status / approvers / update_history) | `workflows/corporate-address-change/_meta.yaml`                                    | Day 6    | machine-readable                                                                                                          |
| UC-BO-01 暗黙知 snippet (staging / compiled)                                                          | `workflows/corporate-address-change/knowledge/{staging,compiled}/*.md`             | Day 6    | staging ×3 + compiled ×3                                                                                                  |
| 口座開設書類完備チェック (同上 5 文書 + knowledge ×2)                                                 | `workflows/account-opening-completeness/`                                          | Day 7    |                                                                                                                           |
| 国際送金 boundary 仕様 + 条件付き制限 (restricted)                                                    | `workflows/international-transfer-boundary/{workflow.md, BOUNDARY.md, _meta.yaml}` | Day 7    | 3 文書 only、画面化なし、Dashboard カードなし。`$10M 相当以上 [仮説 / 要検証]` で AI 自動化不可、未満は将来限定自動化検討 |
| 業務一覧 + Trust Level Progression                                                                    | `workflows/_index.md`                                                              | Day 7    | 3 業務並列 (国際送金は automation_status=restricted 行で 1 行表示)                                                        |
| Session 4 audience / scope / safety / 開催 meta                                                       | `cowork-workshop/workshop-design.md` (Day 19 で update)                            | external | v2 完成後参照、Day 19 までは旧前提が残存                                                                                  |
| v2 ↔ cowork-workshop bridge                                                                           | `cowork-workshop/CLAUDE.md` (Day 19 で update)                                     | external | `session-{1,2,3}-narrative.md` は touch しない                                                                            |

## Approval Taxonomy SSOT

`docs/02-approval-model.md` (Day 4 起稿) で詳述、本 map では outline のみ:

| 承認種別       | Proposal source                                     | Owner (R, Queue owner) | Approver (A)                                                       | C 合議              | I 通知              | Scope                                                                                 | 反映タイミング                               |
| -------------- | --------------------------------------------------- | ---------------------- | ------------------------------------------------------------------ | ------------------- | ------------------- | ------------------------------------------------------------------------------------- | -------------------------------------------- |
| **入力者確認** | 入力者 (manual)                                     | 入力者                 | 入力者 (AI 結果を accept / reject)                                 | -                   | -                   | AI 入力結果 1 案件                                                                    | 送信時 (prototype では同一セッション内)      |
| **承認者承認** | 承認者 (manual)                                     | 承認者                 | 承認者                                                             | -                   | -                   | 入力者確認済の最終確認                                                                | 承認時 (prototype では同一セッション内)      |
| **手順承認**   | **AI (自動生成)**                                   | **Manual 管理者**      | **業務責任者**                                                     | **SME / AI 管理者** | **入力者 / 承認者** | knowledge → procedure / workflow.md / agent-instructions.md / approval-policy.md 昇格 | **AI 日次分析 → 承認キュー [仮説 / 要検証]** |
| **設定承認**   | AI 管理者 (manual) or AI (boundary review proposal) | AI 管理者              | Type 別 co-A (A: 通常 / B: Security / C: Automation Maturity 変更) | -                   | -                   | Agent / Model / Tool / Prompt / 権限 + boundary 変更                                  | Ad-hoc + batch                               |

**RACI 注**:

- `Proposal source = AI` は「AI が分析・提案を自動生成する」事実を示す情報項目。組織責任主体ではない。
- `Owner (R) = Manual 管理者` がキューの責任を持つ (受理 / triage / forward / reject)。
- UI 表示の「AI が提案を自動作成」表現は許可、ただし RACI 表記では Proposal source 列を使う。「起票者」表現は手順承認では使わない (AI proposal source を起票者と呼ばない)。
- **SoD**: Queue owner (Manual 管理者) と Approver (業務責任者) の同一人物化禁止。
- 案件承認 (入力者確認 + 承認者承認) は 4-eyes、入力者 ≠ 承認者。

Matrix A/B/C RACI は `docs/02-approval-model.md` (Day 4) で SSOT。

## Document Header Convention

全 `docs/*.md` / `workflows/{業務}/*.md` / `demo/*.md` は `docs/_HEADER_TEMPLATE.md` (Day 2 起稿) の 12 項目共通ヘッダを冒頭に置く。`_meta.yaml` は Markdown 文書ではないため対象外とし、別途 `_meta.yaml` schema で管理する。

## 規制語の hedge ルール

v2 docs 内で `MRM` / `CISO` / `Risk` (固有部署として) / `NYDFS` / `SR 11-7` / `CCPA` / `OFAC` / `BSA` / `SAR` / `CTR` / `ECOA` を使う時:

- **事実主張** → 禁止
- **参照のみ** → `[ai-operator paper §X.Y 参照、本 v2 では将来確認項目]` の hedge 表現
- **Session 4 表層** → 完全に出さない

Day 10 Design Gate + Day 19 + Day 21 で `grep -rEn` 確認 (v2 repo + `cowork-workshop/CLAUDE.md` + `cowork-workshop/workshop-design.md` に限定、`cowork-workshop/session-{1,2,3}-narrative.md` は scope 外、内部の旧 S4 参照は expected historical hit)。

## File enum 統一

| field               | 許可値                                             |
| ------------------- | -------------------------------------------------- |
| `trust_level`       | `supervised` / `checkpoint` / `autonomous` / `n/a` |
| `risk_level`        | `low` / `medium` / `high`                          |
| `automation_status` | `active` / `restricted` / `prohibited`             |

- `active`: 通常 AI 自動化対象
- `restricted`: 条件付き制限 (条件は `_meta.yaml` の `restricted_conditions` で machine-readable に保持。例: 国際送金は `high_value_threshold` 以上で AI 自動化不可)
- `prohibited`: 業務全体が AI 自動化対象外 (現時点で該当業務なし、将来用に enum 保持)

衝突禁止: `prohibited` / `restricted` は `automation_status` field にのみ出現。`trust_level=prohibited` のような書き方は無効 (Day 7 で `_meta.yaml` grep 確認)。

`restricted_conditions` schema (`_meta.yaml`):

```yaml
restricted_conditions:
  high_value_threshold: "$10M equivalent [hypothesis_requires_validation]"
  automation_above_threshold: prohibited
  automation_below_threshold: future_candidate_after_framework_validation
```

## SLO 仮値 [仮説 / 要検証] — pointer to DOC-MON-05 §3

**Day 9 で `docs/05-metrics-and-gates.md` §3 に SSOT 移管完了** (Plan v1.4 P0-2 / Day 9 deliverable)。本 section は historical context として残すが、**運用 SSOT は `docs/05-metrics-and-gates.md` §3「SLO 仮値表」**。

詳細は `docs/05-metrics-and-gates.md` §3 を参照。要点:

- 全 8 項目 (差戻し送信 → staging 反映 / staging 生成 / compiled 候補分析 / 手順承認後の反映 / 設定承認 Ad-hoc / 設定承認 Batch / Emergency stop / Rollback) すべて `[仮説 / 要検証]` ラベル必須
- 表現規範: 「同一セッション内」「当日中」「日次」「次回 AI 処理から」「15 分以内」「月次」を使う
- real-time guarantee 風表現は禁止 (該当語彙の exact list と trace は `docs/prior-art-map.md` で記録、self-hit 回避のため本 doc には exact text を置かない)
- **本番導入可否を判定する gate ではない、Phase 1 で測定・再設定する検証仮説** (DOC-MON-05 §2 + §9)

## Knowledge snippet schema SSOT

`workflows/{業務}/knowledge/{staging,compiled}/*.md` の frontmatter は以下 8 field 必須:

```yaml
---
date: YYYY-MM-DD
workflow_id: UC-BO-XX # e.g., UC-BO-01
workflow_slug: corporate-address-change
agent_id: agent-corporate-address-change # agent-{slug}
agent_version: v0.1 # 仮値 OK、将来差分追跡用
source_case: CASE-2026-XXX
category: misunderstanding | ui_change | edge_case | judgment_gap | data_error
weight: low | medium | high # 信頼度のみを表す
---
```

**`weight` 解釈 (信頼度限定)**:

- `low`: staging (未承認、AI auto-draft 直後)
- `medium`: reviewed staging (人間が読んだが compiled 承認前)
- `high`: compiled approved (手順承認済み、正式手順反映済み)

**昇格優先度 (promotion priority) は当面 field 化せず**、AI 日次分析 logic 内で扱う。将来必要なら `promotion_priority: low | medium | high` を別 field で導入 (weight と混ぜない)。

**Category routing 注**:

- `data_error` は通常の compiled 昇格対象外、log / audit / 別 routing 扱い
- `agent_id` は将来複数 Agent 体制を想定、現状 1 Agent / 業務でも明示

### staging knowledge の runtime 利用範囲 (Safety boundary)

`weight: low` (staging) および `weight: medium` (reviewed staging) は AI runtime に visible だが、**正式な実行根拠 (citation) ではない**。利用範囲は以下 3 用途に限定:

1. AI proposal の confidence 低下シグナル (未承認領域を flag)
2. Human reviewer (入力者 / 承認者) への hint 表示 (「過去に同種差戻し履歴あり」等)
3. AI が追加確認質問を生成する trigger

AI が業務手順 / 入力値 / 承認ルールを **citation する根拠** として使用できるのは `weight: high` (compiled approved) のみ。

compiled と staging が conflict した場合、compiled を runtime 採用 (staging は当該 conflict subset で runtime 参照対象外)。

`data_error` category の staging は本 safety boundary とは別 routing (compiled 昇格対象外、citation 対象外、log / audit / 別 routing)。

これにより「**承認された手順だけを AI に覚えさせる**」core message (Core Message 表現 SSOT Sub message 2) と、staging が runtime に visible である運用設計が両立する。

## 接続方針 SSOT pointer (control matrix)

本番接続方式の暫定 SSOT = `docs/00-overview.md` §2.2 接続層メモ。本表は **Phase 1 design memo** として docs に残す scope (v2 prototype は接続層自体を実装しない、Plan v1.4 P1-6 / v1.4.2 Rule 5)。

| Tier                              | Read           | Write                             | 証跡                                              | 失敗時制御                                      | Phase 1 優先度 |
| --------------------------------- | -------------- | --------------------------------- | ------------------------------------------------- | ----------------------------------------------- | -------------- |
| 標準 (API)                        | 可             | 条件付き可 (idempotency key 必須) | request / response / status code / correlation ID | retry (exponential backoff) + idempotency check | 高             |
| 準標準 (MQ / event / file bridge) | 可             | 条件付き可 (message dedup)        | message ID / file hash / sequence                 | replay / dead letter queue                      | 中             |
| 代替 (RPA / Computer Use / MCP)   | 可             | 高制限 (明示承認 + 限定条件)      | screenshot stack / DOM state / step trace         | UI drift 検知 → human fallback                  | 低〜中         |
| 例外 (DB 直接続)                  | 原則 read-only | 原則不可 (明示承認 + 限定条件)    | query log + result hash                           | no write                                        | 例外           |

データ参照 / データ入力 両対応。v2 prototype は接続層を実装しない (本 matrix は Phase 1 design memo として docs に残す scope)。詳細実装 (idempotency / rollback / drift detection / credential 管理 / change management / 操作単位の correlation ID / 二重更新防止 / 更新前後 snapshot / 手動上書きと AI 操作の reconciliation) は Phase 1 hand-off。

## Core Message 表現 SSOT (現行表層用)

| 用途            | 表現                                                                  |
| --------------- | --------------------------------------------------------------------- |
| Top message     | 差戻しを、次の正解手順に変える仕組み                                  |
| Sub message 1   | AI を一気に自動化するのではなく、現場の差戻しを毎日の改善提案に変える |
| Sub message 2   | 承認された手順だけを AI に覚えさせる                                  |
| Sub message 3   | 減らすのは確認作業。残すのは手順変更と AI 設定変更の承認              |
| Matrix B 主表現 | AIに任せる量は段階的に増やすが、人によるコントロールは渡さない        |
| Matrix B slogan | 案件確認は減らす。ルール承認は残す。                                  |

legacy wording (旧表現) の trace は `docs/prior-art-map.md` に記録 (履歴文書として残存可)。本 file には旧表現 exact text を置かない (grep gate の自己 hit 回避)。

## Session 4 表層表現規範 (Tier 1/2/3 言い換え rule)

Session 4 表層 (slide / demo / UI label / mock data) で扱う表現の規範。内部 docs / `_meta.yaml` は具体値を維持、表層では抽象化する:

| 内部 docs / `_meta.yaml` 表現                                         | Session 4 表層 (slide / demo / UI label / mock data) 表現         |
| --------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `$10M equivalent [hypothesis_requires_validation]` (国際送金高額閾値) | 「高額・高リスク取引」(数値は出さない)                            |
| 「規制 / コンプライアンス領域の人間判断」(汎用語)                     | 同左 (Tier 3 規制語は出さない)                                    |
| 「Phase 1 で検証・決定」                                              | 「具体閾値は Phase 1 で業務・法務・リスク観点から検証する」(1 行) |

詳細な Tier 1/2/3 vocabulary 体系は `CLAUDE.md` Tier 1/2/3 section + `docs/prior-art-map.md` (legacy trace) 参照。本 SSOT は Session 4 表層出力時の言い換え rule のみ。

## SSOT 競合検出 / Validation

文書間 SSOT 衝突 (= 同一論点を 2 文書が claim) を Day 10 Design Gate で grep 検出。検出時は本 map で SSOT を 1 つに決め、もう一方は reference 化。具体的 grep target は Day 10 で個別に定義。

## 既知の potential 衝突 (要注意)

| 論点                       | 衝突しうる文書                                                                                                                                       | 解決方針                                                                                                                                                                                          |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Demo Chapter 1/2           | `docs/06-session4-narrative.md` (message side) vs `demo/demo-script.md` (execution side)                                                             | message と execution step を明示分離、narrative は「何を伝えるか」、demo-script は「どのボタンを click するか」                                                                                   |
| 業務承認画面               | `docs/03-ui-prototype-design.md` (9 画面 spec) vs `docs/06-session4-narrative.md` Slide 3 内 figure (mock)                                           | 03 §7 は `BusinessApprovalChip` 仕様 (CaseReview footer)、06 §4 は mock figure content spec (Slide 3 用)、双方が `demo/static-mocks/business-approval-view.html` (Day 20 実体化) を共通 path として参照 |
| 4 KPI gate 数値            | `docs/05-metrics-and-gates.md` vs `prototype/src/data/mock-metrics.ts`                                                                               | 05 は仮説値の定義 SSOT、mock-metrics は visualization 用 sample data (caption で「仮説」明示)                                                                                                     |
| Trust Level Progression    | `docs/02-approval-model.md` vs `workflows/_index.md` vs `prototype/src/components/shared/TrustLevelBadge.tsx`                                        | 02 が SSOT、\_index は per-業務の現在値、TrustLevelBadge は visual representation                                                                                                                 |
| 過去 case Alert UI         | `docs/03-ui-prototype-design.md` §6 (3 適用範囲 spec) vs `docs/06-session4-narrative.md` §2.6 (Slide 6 narrative + Alert 文言) vs `demo/static-mocks/business-approval-view.html` (Day 20) | 03 §6 が UI spec SSOT (banner / timeline / citation list の 3 適用範囲)、06 §2.6 が Slide 6 narrative + Alert 文言 SSOT、Day 20 mock は 03 spec を実体化                                          |
| Snippet schema             | `docs/_SSOT.md` §1.4 (canonical) vs `docs/01-flywheel-and-knowledge.md` §3 reference vs `docs/04-knowledge-pipeline.md` §3 reference vs `workflows/{業務}/knowledge/{staging,compiled}/*.md` frontmatter | _SSOT.md §1.4 が 8 field canonical SSOT、01 / 04 は概要 + 用途反映 (reference)、workflows/ knowledge files は実体 (frontmatter 8 field 必須)                                                                              |
| Stripe design token        | `docs/03-ui-prototype-design.md` §2 (Stripe 風 design language SSOT) vs `prototype/tailwind.config.ts` (Day 11+ 実装)                                | 03 §2 が SSOT (color / typography / spacing 8-grid / shadow 3 段 + 1 elevated / cubic-bezier easing)、tailwind.config.ts は Day 11-15 で 03 §2 を実装                                                |
| BOUNDARY review proposal   | `docs/02-approval-model.md` §9.7 (mechanism SSOT) vs `workflows/international-transfer-boundary/BOUNDARY.md` §4 (per-業務適用)                       | 02 §9.7 が mechanism SSOT (Proposal source = AI / R = Manual 管理者 or AI 管理者 / A = 設定承認 Type A or C)、BOUNDARY.md §4 は国際送金固有の RACI + analyzer agent_id 詳細、双方が cross-reference  |

Day 10 Design Gate で各 potential 衝突を spot-check (8 件全 pass 確認、本 list は v1.3 final patch 追加 4 件 + Day 5 初版 4 件の合計)。
