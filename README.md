# Backoffice AI v2

cowork-workshop Session 4 (2026-06-12 Fri) 向け、Backoffice 業務に AI Agent を段階自動化する構想の repo。

「業務別ナレッジ文書を人間承認で育てる Flywheel」(差戻し → 即時 staging → batch 手順承認 → 設定承認で昇格) を中核 message とし、UC-BO-01 法人住所変更処理を主役、口座開設書類完備チェックを Dashboard 並列カードとして見せる。国際送金は `workflows/international-transfer-boundary/` に boundary spec only (Dashboard カードなし、画面化なし)。

主構成: 設計書 (`docs/`)、業務別ファイル (`workflows/`)、UI prototype (`prototype/`、Day 11+)、Session 4 演出物 (`demo/`、Day 20+)。

設計方針と作業規約は [`CLAUDE.md`](./CLAUDE.md)。文書間の SSOT 関係は [`docs/_SSOT.md`](./docs/_SSOT.md)。旧 repo (v1 `backoffice-ai` / `ai-operator`) との継承 / 再編 / 捨てるは [`docs/prior-art-map.md`](./docs/prior-art-map.md) で SSOT 化。Plan 全文は `~/.claude/plans/ai-backoffice-ai-virtual-muffin.md` (v1.1.2 lock、22 日 plan、5/21 Thu Day 1 - 6/11 Thu Day 22)。

## Status

Day 1 / 22 (2026-05-21 Thu)。docs scaffold 起稿中。本 README は repo 構造完成まで継続更新。

## 開発手順 (prototype は Day 11+ で立ち上げ)

```bash
cd prototype/
npm install     # Day 11 以降
npm run dev     # Vite dev server (Day 11+)
```

## 旧 repo 参照 (read-only prior art、v2 完成まで move しない)

- v1 (`backoffice-ai`): `~/code/active/backoffice-ai/`
- ai-operator paper: `~/code/active/ai-operator/`

両方の archive 移動は本 plan scope 外 (v2 完成後の user 判断)。継承 / 再編 / 捨てる の判断は [`docs/prior-art-map.md`](./docs/prior-art-map.md) 参照。

## scope-out (Session 4 / v2)

- 実 LLM 呼び出し / Computer use / desktop control / 外部接続 / 完全自動化
- 国際送金業務の UI 画面化 + Dashboard カード化
- 承認者 (Business Approval) の画面化 (BusinessApprovalChip + slide-only mock で代替)
- hands-on workshop (Session 4 は説明 + demo のみ)
- `cowork-workshop/session-{1,2,3}-narrative.md` の編集 (S1-3 SSOT、Day 19 で touch しない)

詳細は [`CLAUDE.md`](./CLAUDE.md) と Plan §8 Out of Scope。
