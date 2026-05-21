---
date: 2026-04-20
workflow_id: UC-BO-01
workflow_slug: corporate-address-change
agent_id: agent-corporate-address-change
agent_version: v0.1
source_case: CASE-2026-038
category: judgment_gap
weight: high
---

# OCR confidence threshold 設定

法人住所変更依頼 PDF の OCR 結果について、**confidence threshold = 0.85** `[仮値 / 要 Phase 1 検証]` を境界として運用する。閾値以下の case は入力者に「OCR confidence 低下」Alert chip を表示、手動 review を要求する。

## 背景 (compiled 昇格までの経緯)

3 件の staging snippet (CASE-2026-022 / -030 / -038) が再発を観測:

- いずれも OCR confidence 0.6-0.8 の range で AI が確信できないまま step 4 (住所変更フォーム) に進行
- 入力者の差戻しコメントが共通 pattern (「PDF の OCR が怪しい」「住所文字が正確に読めない」)
- AI が日次分析で Procedure Update Proposal を自動生成、Manual 管理者 (Queue owner) が triage、業務責任者 (Approver) が承認

## 反映後の AI 挙動

| OCR confidence range | AI 挙動                                                              |
| -------------------- | -------------------------------------------------------------------- |
| ≥ 0.85               | 通常進行 (8 step を auto-execute)                                    |
| 0.65 ≤ x < 0.85      | Alert chip 「OCR confidence 低下」+ 手動 review 要求 (入力者判断)    |
| < 0.65               | 処理停止、入力者差戻し or PDF 再提出依頼 (`data_error` 経路の可能性) |

## 反映先

- `agent-instructions.md` §3 step 3 (顧客詳細) と step 4 (住所変更フォーム) の confidence check 記述
- `approval-policy.md` §3 Alert 5 条件には未追加 (OCR 関連 Alert は app 層の implementation detail)

## 関連 case (集約 source)

- CASE-2026-022 (初出、OCR 0.72)
- CASE-2026-030 (再発、OCR 0.78)
- CASE-2026-038 (再発、OCR 0.66、compiled 昇格 trigger)

## 反映承認

- Proposal source: AI (日次分析、`agent-corporate-address-change`)
- R (Queue owner): Manual 管理者
- A (承認): 業務責任者
- 承認日: 2026-04-20 (本 snippet date)

## 性質 (本 snippet)

- `weight: high` (compiled approved、手順承認済)
- AI runtime は本 snippet を優先 citation 対象とする
- `[仮値 / 要 Phase 1 検証]`: 0.85 / 0.65 の閾値は demo 用仮値、本番閾値は Phase 1 evidence-based 検証で再決定
