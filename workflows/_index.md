# Workflows Index — backoffice-ai-v2

| 項目            | 値                                                                                                                                                                 |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 文書 ID         | DOC-ROOT-\_index                                                                                                                                                   |
| 文書名          | Workflows Index (3 業務並列 + Trust Level Progression)                                                                                                             |
| 版数            | v0.1                                                                                                                                                               |
| ステータス      | Draft                                                                                                                                                              |
| オーナー        | backoffice-ai-v2 maintainer                                                                                                                                        |
| 承認者          | 設定承認 — 業務一覧と Trust Level Progression の整合確認 (個別 workflow の手順承認は各 pack 内で完結)                                                              |
| 閲覧対象        | Internal / Project team / Session 4 facilitator                                                                                                                    |
| 機密区分        | Internal                                                                                                                                                           |
| 関連文書        | DOC-WF-corporate-address-_ (UC-BO-01), DOC-WF-account-opening-_ (UC-BO-02), DOC-WF-international-transfer-\* (boundary), DOC-APP-02 §7 (Matrix B), DOC-ROOT-\_SSOT |
| SSOT 区分       | 業務一覧 + Trust Level Progression の SSOT (per-業務の現在値は各 `_meta.yaml`、本 doc は集約 view)                                                                 |
| Evidence Status | N/A (集約 view のみ、閾値は各 boundary pack の `[仮説 / 要検証]` ラベルに従う)                                                                                     |
| 改版履歴        | v0.1 (2026-05-27): 初版作成 (Day 7、3 業務並列の集約 view として起稿)                                                                                              |

---

## 1. 業務一覧 (3 業務並列)

| Workflow ID       | 業務名                              | Slug                              | `automation_status` | `trust_level` | `risk_level` | Demo / Dashboard 扱い                                |
| ----------------- | ----------------------------------- | --------------------------------- | ------------------- | ------------- | ------------ | ---------------------------------------------------- |
| UC-BO-01          | 法人住所変更処理                    | `corporate-address-change`        | `active`            | `supervised`  | `medium`     | **Hero** (Demo Chapter 1/2 の起点)                   |
| UC-BO-02          | 口座開設書類完備チェック            | `account-opening-completeness`    | `active`            | `supervised`  | `high`       | Dashboard 並列カード (Demo 1 シーン open)            |
| UC-BO-IT-BOUNDARY | 国際送金 (restricted boundary pack) | `international-transfer-boundary` | `restricted`        | `n/a`         | `high`       | **scope-out** (UI 画面化なし / Dashboard カードなし) |

詳細 metadata は各 workflow の `_meta.yaml` を参照。各 enum 定義は `docs/_SSOT.md` §1.1 (File enum 統一)。

## 2. Trust Level Progression (active 2 業務のみ)

Matrix B 原則 (DOC-APP-02 §7、`AIに任せる量は段階的に増やすが、人によるコントロールは渡さない`) に従い、active 業務は以下の段階的進化 path を持つ。restricted boundary pack (国際送金) は Trust Level Progression の対象外 (`trust_level: n/a`)。

| Automation 段階   | UC-BO-01 (法人住所変更) | UC-BO-02 (口座開設書類完備) | 案件承認の介在         | 手順承認 | 設定承認 |
| ----------------- | ----------------------- | --------------------------- | ---------------------- | -------- | -------- |
| Supervised        | **現在地 (Day 7)**      | **現在地 (Day 7)**          | 全件 (入力者 + 承認者) | 通常     | 通常     |
| Checkpoint        | 将来 candidate          | 将来 candidate              | 重要分岐のみ           | 通常     | 通常     |
| Autonomous (将来) | 将来 candidate          | 将来 candidate              | サンプリング           | 通常     | 通常     |

**Matrix B 主表現** (DOC-FW-01 §7.1、DOC-APP-02 §7.1):

> **AIに任せる量は段階的に増やすが、人によるコントロールは渡さない。**
>
> 案件確認は減らす。ルール承認は残す。

縮小するのは案件承認の介在頻度のみ。手順承認 / 設定承認の loop は automation 進化後も維持。

Automation Maturity 進化条件 (4 KPI multi-criteria 仮説 gate) は DOC-MON-05 (`docs/05-metrics-and-gates.md`) を SSOT、ai-operator 24 §3.2 継承 (`[仮説 / 要検証]`、Plan v1.3 final patch + `docs/_PROGRESS.md` §2.4 確定):

- AI 入力承認率 ≥ 99% `[仮説 / 要検証]`
- 人手上書き率 ≤ 1% `[仮説 / 要検証]`
- Alert 発生率 ≤ 5% `[仮説 / 要検証]`
- 承認者差戻し率 ≤ 1% `[仮説 / 要検証]`

## 3. restricted boundary pack の意味分離 (国際送金)

国際送金は `automation_status: restricted` (条件付き制限業務)。Trust Level Progression と異なる軸:

| 軸                              | 意味                                                                                                                                                                            |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `trust_level: n/a`              | Trust Level Progression の対象外 (AI 自律実行対象外のため進化 path がない)                                                                                                      |
| `automation_status: restricted` | 条件付き制限 (`$10M` 相当以上 `[仮説 / 要検証]` は AI 自動化不可、未満は将来限定自動化検討)                                                                                     |
| 通常 loop 適用                  | **対象外**。差戻し → staging → compiled → workflow diff の経路では BOUNDARY.md を更新しない (DOC-FW-01 §4.3、DOC-APP-02 §3.4)                                                   |
| 更新経路                        | boundary review proposal mechanism (DOC-APP-02 §9.7) 経由のみ。Proposal source = AI、A = 設定承認 Type A / Type C                                                               |
| Demo / Session 4                | Demo 操作なし / UI 画面化なし / Dashboard カードなし。Session 4 では Slide 7 または本 `_index.md` の境界例として 1 行だけ言及可 (Tier 3 規制語は出さない、DOC-APP-02 §10 hedge) |

「自動化禁止 (業務全体 `prohibited`)」とは異なる。`prohibited` は将来用 enum (現時点で該当業務なし、`docs/_SSOT.md` §1.1)。

詳細は `workflows/international-transfer-boundary/` 配下の workflow.md / BOUNDARY.md / `_meta.yaml` 参照。

## 4. 業務 pack の Directory Layout

```
workflows/
├── _index.md                                    # 本 doc (業務一覧 + Trust Level Progression)
├── corporate-address-change/                    # UC-BO-01 active
│   ├── workflow.md
│   ├── agent-instructions.md
│   ├── approval-policy.md
│   ├── _meta.yaml
│   └── knowledge/
│       ├── staging/ (× 3)
│       └── compiled/ (× 3)
├── account-opening-completeness/                # UC-BO-02 active
│   ├── workflow.md
│   ├── agent-instructions.md
│   ├── approval-policy.md
│   ├── _meta.yaml
│   └── knowledge/
│       ├── staging/ (× 1)
│       └── compiled/ (× 1)
└── international-transfer-boundary/             # UC-BO-IT-BOUNDARY restricted
    ├── workflow.md
    ├── BOUNDARY.md
    └── _meta.yaml                               # (knowledge ディレクトリなし、boundary pack only)
```

12 項目 DOC header は markdown docs に適用 (`_meta.yaml` は yaml で対象外、CLAUDE.md File 編集 hygiene 参照)。

## 5. 関連文書

- DOC-OV-00 §2.1 (対象業務): 3 業務の構想 / Demo での扱い
- DOC-OV-00 §3 (非スコープ): 国際送金の UI 画面化なし / Dashboard カードなし
- DOC-FW-01 §4.3: BOUNDARY 通常 loop 対象外 (Flywheel side)
- DOC-APP-02 §3.4: BOUNDARY 通常 loop 対象外 (Approval side)
- DOC-APP-02 §7: Matrix B 不変条件 / Automation Maturity
- DOC-APP-02 §9.7: Boundary Review Proposal の設定承認扱い
- DOC-MON-05 (`docs/05-metrics-and-gates.md`): 4 KPI multi-criteria 仮説 gate / 7 KPI / 9 KRI
- DOC-ROOT-\_SSOT §1.1: File enum 統一 (`automation_status` / `trust_level` / `risk_level`)
- DOC-ROOT-\_PROGRESS §2.2: Day 7 影響分析 (3 業務 pack の起稿)
- 各 workflow の `_meta.yaml`: machine-readable metadata (per-業務 SSOT)
