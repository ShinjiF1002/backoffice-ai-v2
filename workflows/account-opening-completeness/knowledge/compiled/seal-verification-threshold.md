---
date: 2026-04-22
workflow_id: UC-BO-02
workflow_slug: account-opening-completeness
agent_id: agent-account-opening-completeness
agent_version: v0.1
source_case: CASE-2026-041
category: judgment_gap
weight: high
---

# 印鑑照合 confidence threshold 設定

口座開設書類完備チェックの step 4 (印鑑照合) について、**confidence threshold = 0.80** `[仮説 / 要検証]` を境界として運用する。閾値以下の case は入力者に「印鑑照合 confidence 低下」Alert (approval-policy §3 #2) を表示、手動 review を要求する。

## 背景 (compiled 昇格までの経緯)

3 件の staging snippet (CASE-2026-024 / -033 / -041) が再発を観測:

- いずれも印鑑照合 confidence 0.65-0.78 の range で AI が確信できないまま完備性 check を pass しようとした
- 入力者の差戻しコメントが共通 pattern (「印鑑照合 score が低いのに完備とされた」「印影と印鑑証明が微妙にずれている」)
- AI が日次分析で Procedure Update Proposal を自動生成、Manual 管理者 (Queue owner) が triage、業務責任者 (Approver) が承認

## 反映後の AI 挙動

| 印鑑照合 confidence range | AI 挙動                                                                    |
| ------------------------- | -------------------------------------------------------------------------- |
| ≥ 0.80                    | 完備性 check pass、入力者の承認待ち                                        |
| 0.60 ≤ x < 0.80           | Alert chip 「印鑑照合 confidence 低下」+ 手動 review 要求 (入力者判断)     |
| < 0.60                    | 処理停止、入力者差戻し or 顧客に印鑑再提出依頼 (`data_error` 経路の可能性) |

## 反映先

- `agent-instructions.md` §3 step 4 (印鑑照合) の confidence check 記述
- `approval-policy.md` §3 Alert 5 条件 #2 「印鑑照合 confidence 低下」の rationale source

## 関連 case (集約 source)

- CASE-2026-024 (初出、印鑑照合 0.71)
- CASE-2026-033 (再発、印鑑照合 0.76)
- CASE-2026-041 (再発、印鑑照合 0.68、compiled 昇格 trigger)

## 反映承認

- Proposal source: AI (日次分析、`agent-account-opening-completeness`)
- R (Queue owner): Manual 管理者
- A (承認): 業務責任者
- 承認日: 2026-04-22 (本 snippet date)

## 性質 (本 snippet)

- `weight: high` (compiled approved、手順承認済)
- AI runtime は本 snippet を優先 citation 対象
- `[仮説 / 要検証]`: 0.80 / 0.60 の閾値は demo 用仮値、本番閾値は Phase 1 evidence-based 検証で再決定
- UC-BO-01 の OCR confidence threshold (`workflows/corporate-address-change/knowledge/compiled/ocr-confidence-threshold.md`) と同じ「judgment_gap の閾値設定」pattern
