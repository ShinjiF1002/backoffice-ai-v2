---
date: 2026-05-20
workflow_id: UC-BO-01
workflow_slug: corporate-address-change
agent_id: agent-corporate-address-change
agent_version: v0.1
source_case: CASE-2026-063
category: data_error
weight: low
---

# PDF 透かしによる OCR confidence 低下

受領した法人住所変更依頼 PDF に法人ロゴ透かしが入っている case。OCR の confidence が threshold 以下に下がり、step 3 (顧客詳細) と PDF 上の住所文字列の reconciliation が失敗。AI が確信できないまま step 4 (住所変更フォーム) に進むと差戻しになる。

## 観測された pattern

- 受領 PDF の背景に法人ロゴ (薄い灰色透かし)
- OCR confidence が 0.65 以下 (threshold 0.85 [仮説 / 要検証] と比較、`compiled/ocr-confidence-threshold.md` 参照)
- AI は「OCR confidence 低下」Alert chip を表示するが、入力者が手動 OCR 結果を override しないと進行できない

## 性質: data_error カテゴリ (重要)

本 snippet は `category: data_error` (入力データの誤り、AI 責でない)。**通常の compiled 昇格対象外** (DOC-WF-corporate-address-agent-instructions §2.2、DOC-FW-01 §2.3、DOC-APP-02 §3.3):

- log / audit / 別 routing 扱い
- AI runtime の参照対象外 (citation 不可、`weight: low` fixed、compiled 昇格不可)
- Manual 管理者 (Queue owner) の triage 時に「business 側へ feedback」処理
- Audit Trail (`/audit`) に記録、Manual 管理者が定期 review

## 暫定対応 (本 snippet では仮策)

- 入力者は OCR confidence 低下 Alert を見て、PDF を手動 review
- 透かしが理由と判定したら入力者は差戻しせず override で進行 (data_error 経路の特性)
- PDF 提出元 (法人) に透かしなし版の再提出を依頼 (business 側 feedback)

## 関連 case

- CASE-2026-063 (本件 source、透かし付き PDF を提出した法人 C)

## 次の改善方向 (未確定)

`data_error` 経路の handling は DOC-KNW-04 (Day 8 起稿予定) で詳述。本 snippet は compiled 昇格対象外なので、agent-instructions / approval-policy への diff 適用は行わない。

## 性質 (本 snippet)

- `weight: low` (staging、未承認)
- **`data_error` の例外 routing**: compiled 昇格対象外、log / audit に格納、AI runtime citation 対象外
- 別 routing として business 側 feedback、Manual 管理者の定期 review 対象
