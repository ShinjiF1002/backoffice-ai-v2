# Backoffice AI v2

cowork-workshop Session 4 (2026-06-12 Fri) 向け、Backoffice 業務に AI Agent を段階自動化する構想の repo。

**差戻しを、次の正解手順に変える仕組み** を中核 message とし (差戻し → staging ナレッジに記録 (未承認ヒント、AI 正式実行根拠ではない) → AI 日次分析 + 手順承認 → 設定承認で正式手順に昇格)、UC-BO-01 法人住所変更処理を主役、口座開設書類完備チェックを Dashboard 並列カードとして見せる。国際送金は `workflows/international-transfer-boundary/` に restricted boundary pack (高額・高リスク条件で AI 自動化不可 `[仮説 / 要検証]`、具体閾値は boundary pack 内部 `BOUNDARY.md` §2 + `_meta.yaml` のみ、実閾値は Phase 1 で検証・決定。Dashboard カードなし、画面化なし。Session 4 表層では「高額・高リスク取引」と抽象化)。

主構成: 設計書 (`docs/`)、業務別ファイル (`workflows/`)、UI prototype (`prototype/`、Day 11+)、Session 4 演出物 (`demo/`、Day 20+)。

設計方針と作業規約は [`CLAUDE.md`](./CLAUDE.md)。文書間の SSOT 関係は [`docs/_SSOT.md`](./docs/_SSOT.md)。旧 repo (v1 `backoffice-ai` / `ai-operator`) との継承 / 再編 / 捨てるは [`docs/prior-art-map.md`](./docs/prior-art-map.md) で SSOT 化。Plan 全文は `~/.claude/plans/ai-backoffice-ai-virtual-muffin.md` (v1.3 final patch 適用版 lock、Plan v1.1.2 22 日 base + Day 5 整合化 update、5/21 Thu Day 1 - 6/11 Thu Day 22)。

## Status

Day 10 / 22 (2026-05-30 Fri)。docs scaffold + Design Gate 完了 (Day 1-10、SSOT lock 済)。Day 11 から `prototype/` UI 実装着手。本 README は repo 構造完成まで継続更新。

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
