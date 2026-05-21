---
date: 2026-05-22
workflow_id: UC-BO-02
workflow_slug: account-opening-completeness
agent_id: agent-account-opening-completeness
agent_version: v0.1
source_case: CASE-2026-067
category: edge_case
weight: low
---

# 外国法人の英文本人確認書類が日本式 format 期待で検知失敗

外国法人 (シンガポール / 米国 / 英国等) の口座開設依頼で、本人確認書類が英文 (Passport copy / Driver's License 等) のケース。AI が step 3 (完備性 check) で日本式書類 format (運転免許証 / マイナンバーカード等) を期待し、書類自体は受領されているのに「必須書類欠落」として誤検知する。

## 観測された pattern

- 顧客検索 (step 1) で外国法人 (`country_code != JP`) を hit
- 書類一覧 (step 2) で英文書類が併存
- 完備性 check (step 3) で AI が日本式書類 only の lookup を実行、英文書類を recognize できず欠落判定
- Alert #1 「必須書類欠落」が誤発火
- 入力者の差戻しコメント: 「外国法人なので英文書類で OK のはず、AI が認識していない」

## 暫定対応 (本 snippet では仮策)

入力者は外国法人案件と判定したら、AI の「必須書類欠落」Alert を override し、英文書類を accept として手動 review。または、業務責任者へ escalate して「外国法人向け書類受理 routing」を別 case として処理。

## 関連 case

- CASE-2026-067 (本件 source、シンガポール法人 F)

## 次の改善方向 (未確定)

外国法人向けの書類受理 routing を本 workflow に追加するか、別 workflow (`workflows/foreign-corporate-account-opening/`、未起稿、Phase 2+ scope) として切り出すか、両案を Manual 管理者 (Queue owner) が curate して業務責任者の判断を待つ。複数 case で再発を観測したら compiled 昇格候補。

## 性質 (本 snippet)

- `weight: low` (staging、未承認、AI auto-draft 直後)
- 外国法人 + 国際送金 boundary pack と関連 (国際送金 restricted の高額閾値 (`workflows/international-transfer-boundary/BOUNDARY.md` §2) とは別軸の「国外法人」軸)
- Manual 管理者 (Queue owner) の triage を待つ
