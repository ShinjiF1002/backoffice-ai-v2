---
date: 2026-04-30
workflow_id: UC-BO-01
workflow_slug: corporate-address-change
agent_id: agent-corporate-address-change
agent_version: v0.1
source_case: CASE-2026-046
category: misunderstanding
weight: high
---

# 多店舗 / 多支店時の住所識別

多店舗 / 多支店を持つ法人 (例: チェーン店舗、銀行支店、研究拠点等) で、本社住所と支店住所が業務システムに併存するケース。AI が顧客検索 (step 2) で複数候補を hit した時、入力者の明示的指定がないと取り違える。

本 snippet 反映後、AI は「**本社住所を default 候補としつつ、入力者に明示確認を要求**」する挙動となる。

## 背景 (compiled 昇格までの経緯)

3 件の staging snippet (CASE-2026-031 / -039 / -046) が再発を観測:

- 顧客検索 (step 2) で同一法人名から複数住所候補が hit (本社 + 支店 N 件)
- AI が「最初の hit を採用」する旧挙動だと、支店変更依頼が誤って本社に適用される (or 逆)
- 入力者の差戻しコメントが共通 pattern (「変更対象の住所が違う」「支店ではなく本社の住所を変えたかった」「本社のはずが支店が変わっていた」)
- AI が日次分析で集約、Procedure Update Proposal を自動生成

## 反映後の AI 挙動

step 2 (顧客検索) で複数候補 hit 時:

| 候補数   | AI 挙動                                                                           |
| -------- | --------------------------------------------------------------------------------- |
| 1 件     | 通常進行 (step 3 に進む)                                                          |
| 2 件以上 | 本社候補を highlight + 全候補を Case Review に表示 + 入力者に「変更対象」明示要求 |
| 0 件     | Alert chip「顧客検索結果なし」+ 入力者差戻し (KYC overlap 可能性も check)         |

入力者は変更対象 (本社 / 支店 X / 支店 Y) を明示選択、AI は step 3 (顧客詳細) で選択された住所のみを reference として進行。

## 反映先

- `agent-instructions.md` §3 step 2 (顧客検索) に「複数 hit 時の本社 default + 明示要求」記述追加
- `approval-policy.md` §1 (入力者確認) に「複数住所候補時の選択確認」項目追加 (本 snippet が source rationale)

## 関連 case (集約 source)

- CASE-2026-031 (初出、チェーン店舗法人 D の支店住所変更が本社に誤適用)
- CASE-2026-039 (再発、銀行支店住所変更で逆 pattern)
- CASE-2026-046 (再発、研究拠点法人 E、compiled 昇格 trigger)

## 反映承認

- Proposal source: AI (日次分析、`agent-corporate-address-change`)
- R (Queue owner): Manual 管理者
- A (承認): 業務責任者
- 承認日: 2026-04-30 (本 snippet date)

## 性質 (本 snippet)

- `weight: high` (compiled approved、手順承認済)
- AI runtime は本 snippet を優先 citation 対象
- 過去 case (CASE-2026-031 / -039) の AI proposal 本文は不変 (DOC-FW-01 §6.3 audit trail 保護)
- 関連ルール更新 Alert (DOC-WF-corporate-address-approval-policy §5 適用範囲 1) として、未承認 case の Case Review に banner 表示
