---
date: 2026-05-15
workflow_id: UC-BO-01
workflow_slug: corporate-address-change
agent_id: agent-corporate-address-change
agent_version: v0.1
source_case: CASE-2026-051
category: ui_change
weight: low
---

# 福岡支店の住所マスタが旧形式

法人住所変更を福岡支店適用で実行する際、業務システムの住所マスタが旧形式 (郵便番号なし、市区町村名が漢字旧字体) のまま登録されているケースがある。AI が step 4 (住所変更フォーム) で 7 桁郵便番号を自動補完してしまうと、業務システムが旧形式と新形式を別住所として保存し、差戻しになる。

## 観測された pattern

- 顧客検索 (step 2) で福岡支店を hit
- 顧客詳細 (step 3) で現住所表示時、郵便番号 field が空
- 住所変更フォーム (step 4) で AI が新郵便番号を補完
- 業務システム側で reconciliation 失敗 → step 7 最終確認で乖離検知

## 暫定対応 (本 snippet では仮策)

入力者は新形式適用前に郵便番号 field を空にすることを確認、または旧形式での反映を選択。

## 関連 case

- CASE-2026-051 (本件 source、福岡支店 法人 A)

## 次の改善方向 (未確定)

支店ごとの住所マスタ形式差異が他にも存在する可能性 (大阪 / 名古屋等の旧支店)。複数 case で再発を観測したら、compiled 昇格候補として AI が日次分析で Procedure Update Proposal を自動生成する (DOC-FW-01 §4、DOC-APP-02 §3)。

## 性質 (本 snippet)

- `weight: low` (staging、未承認、AI auto-draft 直後)
- AI runtime は参照可、ただし compiled より優先度低
- Manual 管理者 (Queue owner) の triage を待つ
