# 残り 8 画面 — Claude Design コピペ手順 (これだけ見れば OK)

> CaseDetail (04) は rev.3 でサインオフ済。残り 8 画面を同じ要領で生成する。
> 渡すファイルは全て **この `claude-design-bundle-v2/` 一箇所**にあります:
> - `context/` = 設計 context 9 file (project に upload)
> - `prompts/` = 各画面の prompt (1 画面 = 1 ファイル、New Session に paste)

---

## Step 0: context を最新化 (最初に 1 回だけ)

rev.3 で context を更新済。**確実なのは「新しい project を作り `context/` の 9 file を全部 upload」**。
(既存 project を使う場合は、下記 7 file が rev.3 版か確認 → 違えば差し替え: 01,02,03,04,07,08,09)

upload する 9 file (`context/`):
```
01-design-system          02-ia-overview-v2          03-screen-contracts-v2
04-reconcile-panel-spec   05-metric-vs-threshold-spec 06-consequence-panel-spec
07-process-selector-spec  08-allowed-actions...       09-mock-fixture-spec-v2
```
upload 後の前置き: 「これらを設計 context として登録。各画面はこの context に従う」

---

## Step 1: 8 画面を 1 つずつ生成 (順番推奨)

各画面 = **New Session 作成 → mode = High Fidelity → 対応する prompt を全文 copy & paste → 生成 → export**。
prompt は自己完結なので、Step 0 さえ済んでいれば paste だけで OK。

| # | 画面 | paste するファイル (`prompts/`) | 保存先 (export) |
|---|---|---|---|
| 1 | ハブ | `01-hub-mockup.md` | `screens-v2/01-hub/` |
| 2 | 案件一覧 | `02-cases-mockup.md` | `screens-v2/02-cases/` |
| 3 | 承認待ち | `03-approvals-mockup.md` | `screens-v2/03-approvals/` |
| 4 | 提案一覧 | `05-proposals-mockup.md` | `screens-v2/05-proposals/` |
| 5 | 提案詳細 | `06-proposal-detail-mockup.md` | `screens-v2/06-proposal-detail/` |
| 6 | エージェント一覧 | `07-agents-mockup.md` | `screens-v2/07-agents/` |
| 7 | エージェント詳細 | `08-agent-detail-mockup.md` | `screens-v2/08-agent-detail/` |
| 8 | モニタリング | `09-observatory-mockup.md` | `screens-v2/09-observatory/` |

(CaseDetail 04 は完了済。番号 05/06… は画面番号、上表の # は作業順)

export は zip / HTML どちらでも可。**1 画面できるごとに、あるいは全部まとめて Downloads に保存 → 私に「saved to downloads」と投げてください。** 私が展開・検証 (render smoke + 各 prompt の Acceptance check) して `screens-v2/` に配置し、evidence ledger を更新します。

---

## 各画面の要点 (生成物の見るべき点)

- **ハブ**: Headline 3 KPI に業務 tag + drill、業務別 card 2、PrimaryAnchor 1。
- **案件一覧 / 承認待ち / 提案一覧 / エージェント一覧** (一覧系): 高密度 table、status は業務語、row click で詳細へ。confidence 生数字なし。承認待ちは SoD (入力者≠承認者) 明示。
- **提案詳細 / エージェント詳細** (詳細系、★ 検証原則 A/B/C 適用):
  - A 全体表示 (提案=手順全体 / Agent=4 KPI 全件)
  - B 証拠を読める形 (提案=差戻し case 原文 / Agent=実行履歴 sample)
  - C 決定ボタン 1 セット (提案=mode 出し分け / Agent=申請 1 つ)
- **モニタリング**: nav・タイトルが「モニタリング」(観測なし)、監査 tab = lifecycle + raw ledger の 2 view、メトリクス/ナレッジは Process 別。

各 prompt 末尾の Acceptance check が合否条件です。詳細原則: `../00-shared/cross-screen-refresh-findings.md`。

---

## データレジデンシー注意 (毎回)
投入は mock / synthetic のみ。実顧客情報・実銀行資料・機密は投入禁止 (`../00-shared/claude-design-upload-manifest.md`)。本 prompt 群は全て fixture の mock 値で固定済。
