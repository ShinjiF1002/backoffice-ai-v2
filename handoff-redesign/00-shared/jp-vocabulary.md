# JP Vocabulary — Tier 1 / Tier 2 / 規制語回避

## JP-only 原則

UI / slide / docs / mock copy はすべて日本語。英語 string は bug。

**例外** (英語 OK): 技術固有名詞 — `React` / `Vite` / `Tailwind` / `AI` / `PDF` / `OCR` / `API` / `SLO` / `KPI` / `JSON` / `URL` 等。

## Tier 1 語彙 (UI label / slide / copy で表面に出して良い)

| 語 | 意味 |
|---|---|
| **案件承認** | 個別案件の処理結果を人間が確認 |
| **手順承認** | コメントや暗黙知を正式手順に反映 |
| **設定承認** | AI の権限・モデル・プロンプト・ツール変更を確認 |
| **入力者** | AI 入力結果を確認 / 差戻しする role |
| **承認者** | 入力者確認後の最終確認 role |
| **Flywheel** | 差戻し → staging → compiled → 手順承認 → 設定承認 の loop |
| **業務別ファイル群** | `workflows/{業務}/` 配下の文書群 |

## Tier 2 語彙 (UI label / docs 内で OK、slide では補助使用)

`staging` / `compiled` / `Trust Level` / `Supervised` / `Checkpoint` / `Autonomous` / `Alert` / `差戻し` / `Knowledge` / `Plan First` / `Verification gate`

## 規制語回避 (絶対に出さない)

Tier 3 規制語 (具体 list は `prototype/CLAUDE.md` 内部、user の private knowledge) は:

- UI label / mock copy / Claude Design prompt の中で**事実主張禁止**
- Session 4 / 表層 audience に絶対出さない
- 必要なら `[本 v2 では将来確認項目]` の hedge 表現で扱う

→ Claude Design に渡す全 prompt で、Tier 3 規制語の **exact list 表記は禁止**。「規制対応」「コンプライアンス」程度の generic 表記まで。

## Active workflow

UI に出して良い workflow は **2 つのみ**:

1. **UC-BO-01 法人住所変更**
2. **UC-BO-02 口座開設書類完備** (チェック)

国際送金 (UC-BO-03 相当、restricted boundary) は **UI / Dashboard / Claude Design prompt 全てから除外**。

## 数値 / KPI ラベル

KPI / SLO / target 数値は表示時に必ず `[仮説 / 要検証]` または `[仮説]` ラベル付き。

- 例: `AI 入力承認率 92% [仮説 / 要検証]`
- 例外: AuditTrail / Metrics ページ内のみ、隣接 inline hedge を許容 (L4)
- Hub / Queue / CaseDetail / ProposalDetail では PageHeader 1 chip に集約 (重複禁止)

## copy hygiene

- 略語禁止: `BO` ではなく `Backoffice`、`認可` ではなく `承認`
- 「承認待ち」と「確認待ち」は別物: `承認待ち` = 業務責任者待ち、`確認待ち` = 入力者待ち
- 「Component 名 leak 禁止」: `BusinessApprovalChip` 等の component 名は UI 文言に出さない
- 「Operational Premium Light」「Operations Hub」など design system / typology 名も UI に出さない (内部 spec only)
