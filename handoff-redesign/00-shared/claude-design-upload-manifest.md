# Claude Design Upload Manifest + Data Hygiene

> ⚠️ Claude Design は **データレジデンシー非対応** (support.claude.com admin guide)。投入物は **mock / synthetic のみ**。本 manifest は投入前のローカル gate (Claude Design には投入しない)。

## 投入許可 (claude-design-bundle-v2/context/ の 9 file のみ)

| # | file | 内容 | mock/synthetic |
|---|---|---|---|
| 1 | `01-design-system.md` | Operational Premium Light token / chip / chrome | ✅ |
| 2 | `02-ia-overview-v2.md` | Process-First IA (9 画面 / selector / 横断 component) | ✅ |
| 3 | `03-screen-contracts-v2.md` | 9 画面の contract | ✅ |
| 4 | `04-reconcile-panel-spec.md` | reconcile UI 仕様 | ✅ |
| 5 | `05-metric-vs-threshold-spec.md` | 実績値 vs 閾値 | ✅ |
| 6 | `06-consequence-panel-spec.md` | 変更影響 | ✅ |
| 7 | `07-process-selector-spec.md` | Process 切替 | ✅ |
| 8 | `08-allowed-actions-and-state-transitions.md` | role×status 許可操作 | ✅ |
| 9 | `09-mock-fixture-spec-v2.md` | 固定 mock 数値 | ✅ |

+ `prompts/` 配下 (画面ごとに手動 paste)

## 投入禁止 (絶対)

- ❌ 実顧客情報 (氏名 / 口座 / 住所 / 取引)
- ❌ 実銀行資料 (内規 / 業務マニュアル / 実 PDF / 実 OCR 出力)
- ❌ 内部機密文書 / Tier 3 規制語を含む doc
- ❌ 旧 6 画面 prompt (`historical/`、反例)
- ❌ `prototype/` 配下の docs (実規制 cite / Tier 3 規制語の hedge を含む)
- ❌ mock-fixture-spec-v2.md に定義されていない任意の数値

## Data hygiene gate (upload 前チェック)

1. 投入する全 file が `claude-design-bundle-v2/context/` 9 file + `prompts/` に限定されているか
2. 数値は `09-mock-fixture-spec-v2.md` の固定値のみか (Claude Design に勝手な数字を作らせない)
3. 個人名は mock (山田太郎 / 佐藤花子 等) のみか
4. 業務 Process は 2 つ (法人住所変更 / 口座開設書類完備) のみ、国際送金等の restricted boundary を含まないか
5. Claude Design 生成物を export する際、機密が混入していないか (mock のみ前提なので原則問題なし)

## なぜ manifest が必要か

Claude Design は監査ログ・usage tracking 非対応 (公式)。何を投入したかの記録が残らないため、投入前に本 manifest で許可/禁止を確認し、`claude-design-evidence-ledger.md` に投入記録を残す。
