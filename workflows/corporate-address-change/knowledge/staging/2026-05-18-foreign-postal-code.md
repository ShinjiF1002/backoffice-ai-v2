---
date: 2026-05-18
workflow_id: UC-BO-01
workflow_slug: corporate-address-change
agent_id: agent-corporate-address-change
agent_version: v0.1
source_case: CASE-2026-058
category: edge_case
weight: low
---

# 国際郵便番号の補完誤り

法人住所が日本国外 (シンガポール / 香港 / 米国 NY 等) のケース。AI が step 5 (住所入力確認) で日本式 7 桁郵便番号を自動補完しようとし、正しい現地形式 (シンガポール 6 桁数字 / 米国 ZIP 5+4 等) が反映されない。

## 観測された pattern

- 顧客検索 (step 2) で外国法人を hit
- 顧客詳細 (step 3) で現住所が「Singapore 048619」等の国際形式
- 住所変更フォーム (step 4) で AI が日本式 7 桁形式を期待 → format error
- step 6 国土地理院 API verify で「日本国内住所のみ対応」を返す

## 暫定対応 (本 snippet では仮策)

国外法人の住所変更は本 workflow scope 外として入力者差戻し、業務責任者へ escalate。国際送金関連の case であれば `workflows/international-transfer-boundary/` の restricted boundary pack を参照。

## 関連 case

- CASE-2026-058 (本件 source、シンガポール法人 B)

## 次の改善方向 (未確定)

国外法人住所変更を別 workflow として scope 切り出すか、本 workflow に「国外住所判定」step を追加するか、両案を Manual 管理者 (Queue owner) が curate して業務責任者の判断を待つ。複数 case で再発を観測したら compiled 昇格候補。

## 性質 (本 snippet)

- `weight: low` (staging、未承認、AI auto-draft 直後)
- 国際送金 boundary pack と関連 (restricted、`workflows/international-transfer-boundary/BOUNDARY.md` §2 の高額閾値とは別軸の「国外住所」軸)
- Manual 管理者 (Queue owner) の triage を待つ
