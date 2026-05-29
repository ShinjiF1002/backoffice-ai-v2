# ConsequencePanel Spec (R-AGENT-03 / R-PROP-03)

> 変更 (Trust 昇格 / ルール改定) の before/after **だけでなく**「何が減り、何が増え、どこで止められるか」を示す。意思決定者が帰結を理解して承認/差戻しを判断できる。

## 適用画面

- **AgentDetail**: Trust Level 昇格の帰結
- **ProposalDetail**: ルール改定の帰結

## Agent (Trust 昇格) の consequence

| 項目 | 内容 | 例 (Supervised → Checkpoint) |
|---|---|---|
| **review coverage 変化** | 人レビューがどう減るか | 全件人レビュー → 高信頼度 case は AI 自動入力 (1 日 80 件中 ~50 件が自動化、人は要確認 30 件に集中) |
| **例外 queue 増減** | 人が見る対象の変化 | 要確認 case のみが queue に (例外 queue ~30 件/日) |
| **rollback 条件** | 異常時の復帰 trigger | 承認率が 7 日連続で閾値割れ → Supervised に自動降格 |

## Proposal (ルール改定) の consequence

| 項目 | 内容 | 例 (OCR 閾値 0.85 → 0.88) |
|---|---|---|
| **適用対象** | 影響範囲 | UC-BO-01 の OCR 抽出、過去 12 case 相当 |
| **誤検知 / 見逃し方向** | trade-off の向き | 閾値↑ → 見逃し↓ (より多く人確認に回す) / 誤検知 (過剰な要確認)↑ |
| **非遡及** | 既存への影響 | 既存承認済 case には適用しない (遡及なし) |

## Layout

```
┌─ before → after ──────────────┬─ 影響サマリ ─────────┐
│ Supervised → Checkpoint        │ ↓ 人レビュー 80→30/日 │
│                                │ ↑ 自動入力 0→50/日    │
│                                │ 🛡 rollback: 7日閾値割れ│
└────────────────────────────────┴───────────────────────┘
```

before/after の 2 列 + 影響サマリ (減る↓ / 増える↑ / 止められる🛡)。

## 旧との差分

旧 (Plan β) は変更の帰結が画面になし (user 指摘 Agent#3 / Proposal#3)。新 v2 は「何を捨て、何が増え、どこで止まるか」を明示し、意思決定材料を提供。

## Acceptance check

- [ ] before/after の状態変化
- [ ] 「何が減り何が増えるか」(review coverage / 例外 queue / 誤検知方向)
- [ ] rollback / 非遡及 等の安全条件
- [ ] 影響件数 (mock)
- [ ] mock 明示

## 関連
- mock 数値: `mock-fixture-spec-v2.md` § consequence
- 昇格申請の操作: `allowed-actions-and-state-transitions.md` § Agent
