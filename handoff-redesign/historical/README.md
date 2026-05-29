# historical/ — Plan β (機能集約 6 画面) の成果物隔離

> ⚠️ **v2 実装には使用不可**。外部レビュー時のみ「反例」として添付可。

## 隔離理由

Plan β (9→6 機能集約) で Claude Design 生成した成果物。Process-First v2 への転換 (critical review、`00-shared/process-first-critical-review.md`) で旧方針となった。SSOT 分裂を防ぐため隔離。

## 残存問題 (v2 で解消すべき反例)

| 旧 (Plan β) | 問題 | v2 での解消 |
|---|---|---|
| confidence 生数字 (0.84 / 0.96) | 業務判断に使えない、何を測るか不明 | `ReconcilePanel` の一致/要確認 (reconcile-panel-spec) |
| cron trigger | 内部用語が UI 露出 | 「日次提案分析」(業務語) |
| 進化要件 75% 集約値 | 実 metrics vs threshold が見えない | `MetricVsThreshold` (実績値 vs 閾値 vs 判定) |
| 承認者 UI 欠落 | 4-eyes 後半が UI 化されていない | `/approvals` queue + CaseDetail checker mode |
| Process 軸欠落 | 機能横断フラット集約 | Process-First (Global ProcessSelector + Process-scoped nav) |

## 構成

- `plan-beta/`: 旧 6 画面 (01-hub〜06-observatory の prompt+HTML+spec) + `claude-design-bundle` + `.zip` + 旧 `ia-overview.md` (v1) + `visual-reference.md`
- `upload-once-plan-beta/`: 旧 Claude Design upload 資材 (contact-sheet / charter-summary / research-compounder-refs / prototype-current-reference)。v2 では `claude-design-bundle-v2/context/` が代替

## v2 の現行 SSOT (これを使う)

- IA: `00-shared/ia-overview-v2.md`
- screen contract: `00-shared/screen-contracts-v2.md`
- Claude Design 投入物: `claude-design-bundle-v2/context/` の 9 file のみ
- データ hygiene: `00-shared/claude-design-upload-manifest.md`

## 外部レビューでの扱い

旧 6 画面 HTML は「機能集約版の反例 (採用候補ではない)」として、現物 drift をレビューしてもらう目的でのみ添付可。
