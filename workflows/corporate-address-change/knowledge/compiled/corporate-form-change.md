---
date: 2026-04-25
workflow_id: UC-BO-01
workflow_slug: corporate-address-change
agent_id: agent-corporate-address-change
agent_version: v0.1
source_case: CASE-2026-042
category: edge_case
weight: high
---

# 法人格変更時の handling

株式会社 ↔ 合同会社 / 一般社団法人 / 学校法人等の **法人格変更を伴う住所変更は本 workflow scope 外**。AI は「法人格変更可能性」Alert (approval-policy §3 #4) を発火し、業務責任者へ escalate する。住所変更単独の workflow では扱わない。

## 背景 (compiled 昇格までの経緯)

3 件の staging snippet (CASE-2026-029 / -036 / -042) が再発を観測:

- 顧客検索 (step 2) で法人格表記の不一致を hit (登記簿: 株式会社、業務システム: 合同会社)
- 法人格変更は登記住所変更とセットで届出されることが多く、別 workflow (法人格変更登記) で扱うべき
- 住所変更 workflow で先に反映すると、後続の法人格変更 workflow で reconciliation 失敗が起こる
- AI が日次分析で集約、Procedure Update Proposal を自動生成

## 反映後の AI 挙動

step 2 (顧客検索) or step 3 (顧客詳細) で法人格表記の不一致を検知時:

| 検知 pattern                        | AI 挙動                                                   |
| ----------------------------------- | --------------------------------------------------------- |
| 業務システム vs PDF の法人格 一致   | 通常進行                                                  |
| 業務システム vs PDF の法人格 不一致 | Alert #4「法人格変更可能性」発火、step 4 に進まず処理停止 |
| 検知不能 (法人格情報なし)           | 業務責任者へ判断要求 (Alert chip + escalate ボタン)       |

業務責任者の判断:

- 法人格変更を伴う case → 別 workflow (`workflows/corporate-form-change/`、未起稿、Phase 2+ scope) へ移管
- 住所変更のみ → 業務責任者が override で本 workflow 継続

## 反映先

- `agent-instructions.md` §5 (AI の挙動制約)「例外時の停止」に法人格変更検知を追記
- `approval-policy.md` §3 Alert 5 条件 #4「法人格変更可能性」と整合 (本 snippet が source rationale)
- `workflow.md` §4 禁止事項 #2「法人格変更を伴う住所変更は本業務 scope 外」と整合

## 関連 case (集約 source)

- CASE-2026-029 (初出、株式会社 → 合同会社)
- CASE-2026-036 (再発、有限会社 → 株式会社)
- CASE-2026-042 (再発、一般財団法人 → 公益財団法人、compiled 昇格 trigger)

## 反映承認

- Proposal source: AI (日次分析、`agent-corporate-address-change`)
- R (Queue owner): Manual 管理者
- A (承認): 業務責任者
- 承認日: 2026-04-25 (本 snippet date)

## 性質 (本 snippet)

- `weight: high` (compiled approved、手順承認済)
- AI runtime は本 snippet を優先 citation 対象
- 別 workflow への boundary 設計、Phase 2+ で `workflows/corporate-form-change/` 起稿予定
