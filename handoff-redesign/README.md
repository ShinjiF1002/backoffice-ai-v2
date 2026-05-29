# handoff-redesign — Process-First v2 (9画面 Claude Design 構築)

> ⚠️ 現行は **Process-First v2 (9 画面)**。旧 Plan β (6 画面集約) は `historical/` に隔離 (反例、v2 実装に使用不可)。

## 経緯

旧 prototype (9 画面) の認知負荷問題 → Plan β で 6 画面集約 (Claude Design 12 HTML) → user 16 指摘 → Process-First v2 へ転換 (critical review 2 巡)。詳細: `00-shared/process-first-critical-review.md` + `~/.claude/plans/hashed-conjuring-spark.md`。

## 現行 SSOT (これを使う)

| 文書 | 役割 |
|---|---|
| `00-shared/ia-overview-v2.md` | Process-First IA SSOT (§9 patch 含む) |
| `00-shared/operational-audit.md` | 6 role journey + 要件 R-* |
| `00-shared/screen-contracts-v2.md` | 9 画面 contract |
| `00-shared/coverage-matrix-v2.md` | F-* × R-* 充足表 |
| `claude-design-bundle-v2/context/` | Claude Design 投入物 (9 file のみ) |
| `00-shared/claude-design-upload-manifest.md` | data hygiene gate (投入許可/禁止) |

## 9 画面 (Process-First)

| # | 画面 | 主 role | 新設? |
|---|---|---|---|
| 1 | Hub | 全 role | 改修 (Process tag Alert) |
| 2 | 案件一覧 | 入力者 | 改修 |
| 3 | 承認待ち | 承認者 | ★ 新設 (4-eyes 後半) |
| 4 | 案件詳細 | 入力者 / 承認者 | 改修 (ReconcilePanel pilot) |
| 5 | 提案一覧 | Manual 管理者 | ★ 新設 |
| 6 | 提案詳細 | Manual 管理者 / 業務責任者 | 改修 (実績値 + before/after) |
| 7 | エージェント一覧 | AI 管理者 | ★ 新設 |
| 8 | エージェント詳細 | AI 管理者 | 改修 (実 metrics vs 閾値 + consequence) |
| 9 | Observatory | 監査者 | 改修 (Process 別 + 監査 2 view) |

## Claude Design 構築 flow (手順詳細は `claude-design-bundle-v2/README.md`)

1. claude.ai/design project 作成 + design system 登録 (`design-system-registration-check.md` gate)
2. `claude-design-bundle-v2/context/` 9 file を投入 (`claude-design-upload-manifest.md` で許可確認)
3. **CaseDetail (04) pilot** を先に生成・合格 (reconcile gate、不合格なら残り 8 画面に進まない)
4. 合格後、残り 8 画面生成
5. 各画面 export を `screens-v2/0N-{page}/` に保存、`claude-design-evidence-ledger.md` に記録
6. 9 画面後に `operational-walkthrough-evidence-v2.md` で 6 role × 2 process の journey QA

## ディレクトリ

```
handoff-redesign/
├── 00-shared/                  # v2 SSOT + spec 群
├── claude-design-bundle-v2/    # Claude Design 投入物 (context 9 + prompts 18)
├── screens-v2/                 # Claude Design export 保存先 (9 dir)
├── 99-claude-code-handoff/     # Phase 2 React 化 handoff
└── historical/                 # 旧 Plan β (反例、使用不可)
    ├── plan-beta/              #   旧 6 画面 + bundle + v1 IA
    └── upload-once-plan-beta/  #   旧 Claude Design 投入資材
```

## Phase

- Phase 0 (Plan β 6 画面): `historical/` 隔離済
- **本 phase**: 9 画面 Claude Design 構築 (CaseDetail pilot → 残り 8 → walkthrough QA)
- Phase 2: React 化 (`prototype-redesign/`、別 plan)

## data hygiene (銀行データ)

Claude Design はデータレジデンシー非対応 (公式)。投入は **mock / synthetic のみ**。実顧客情報・実銀行資料・機密文書・旧 6 画面 prompt は投入禁止 (`claude-design-upload-manifest.md`)。

## Claude Design 制約 (公式、運用時の注意)

- 反復: 構造変更は chat、局所修正は inline comment (comment 消失の既知制約 → 消えたら chat に貼り直し)
- 監査ログ / usage tracking 非対応 → 生成証跡は `claude-design-evidence-ledger.md` にローカル記録
- usage は Claude / Claude Code と別枠 metering → CaseDetail pilot 後に残り 8 画面へ進む分割で消費管理
