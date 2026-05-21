# 共通ヘッダ雛形 (全文書冒頭に配置)

| 項目            | 値                                                                |
| --------------- | ----------------------------------------------------------------- |
| 文書 ID         | DOC-ROOT-_HEADER_TEMPLATE                                         |
| 文書名          | 共通ヘッダ雛形 (12 項目 markdown 表)                              |
| 版数            | v0.1                                                              |
| ステータス      | Draft                                                             |
| オーナー        | backoffice-ai-v2 maintainer                                       |
| 承認者          | self — 設定承認 (文書 hygiene の確定)                             |
| 閲覧対象        | Internal / Project team                                           |
| 機密区分        | Internal                                                          |
| 関連文書        | DOC-ROOT-_SSOT, DOC-ROOT-prior-art-map                            |
| SSOT 区分       | 全 docs / workflows / demo 文書の冒頭ヘッダ規格 の SSOT           |
| Evidence Status | N/A (規格定義のみ、定量値なし)                                    |
| 改版履歴        | v0.1 (2026-05-22): 初版作成 (Day 2)、ai-operator 雛形を v2 用に compress |

---

backoffice-ai-v2 内の `docs/*.md`、`workflows/{業務}/*.md`、`demo/*.md` の冒頭に以下の 12 項目を Markdown 表形式で配置する。ai-operator paper の同 file を v2 用に compress、規制 framing (NYDFS / SR 11-7 等の cite) は除外。

## 雛形 (Markdown 表形式、コピペ可)

```markdown
| 項目            | 値                                                                     |
| --------------- | ---------------------------------------------------------------------- |
| 文書 ID         | DOC-XX-NAME (例: DOC-OV-00, DOC-APP-02)                                |
| 文書名          | 〇〇                                                                   |
| 版数            | v0.1                                                                   |
| ステータス      | Draft / Review / Approved / Superseded                                 |
| オーナー        | 〇〇 (作成・維持責任者)                                                |
| 承認者          | 〇〇 (Gate 通過判定者) — 案件 / 手順 / 設定 のどれに該当するか明記     |
| 閲覧対象        | Internal / Session 4 audience / Specific role                          |
| 機密区分        | Internal / Confidential                                                |
| 関連文書        | DOC-XX, DOC-YY, ...                                                    |
| SSOT 区分       | この文書が何の SSOT か (無ければ "参照のみ")                           |
| Evidence Status | N/A / Unknown / Hypothesis / Sample-based / Measured                   |
| 改版履歴        | v0.1 (YYYY-MM-DD): 初版作成 by 〇〇                                    |
```

---

## 項目ごとの運用ルール

### 文書 ID

`DOC-{CATEGORY}-{NAME}` 形式。

| Category | 意味 | 該当ファイル |
|---|---|---|
| ROOT | repo-level meta | `prior-art-map.md` / `_SSOT.md` / `_HEADER_TEMPLATE.md` |
| OV | Overview / scope | `00-overview.md` |
| FW | Flywheel / knowledge loop | `01-flywheel-and-knowledge.md` |
| APP | Approval model | `02-approval-model.md` |
| UI | UI prototype design | `03-ui-prototype-design.md` |
| KNW | Knowledge pipeline | `04-knowledge-pipeline.md` |
| MON | Metrics / gates | `05-metrics-and-gates.md` |
| S4 | Session 4 narrative | `06-session4-narrative.md` |
| WF | Workflow per-業務 | `workflows/{業務}/*.md` (workflow / agent-instructions / approval-policy / BOUNDARY)。`_meta.yaml` は対象外 |
| DEMO | Demo artifacts | `demo/*.md` (demo-script / demo-data-reset) |

NAME 部は短い英小文字 slug (例: `prior-art-map`, `00`, `corporate-address-workflow`)。

### 版数

Semantic: `v{major}.{minor}`

- major: 意味が変わる変更 (SSOT 再配分、スコープ変更、enum 変更等)
- minor: 加筆・訂正・文言修正

### ステータス

| 状態 | 意味 | v2 での適用 |
|---|---|---|
| Draft | 執筆中。正本としての確定参照は禁止、暫定参照は可 | Day 1-10 の起稿中 |
| Review | レビュー中。参照可、ただし変更前提 | Day 5 / 10 / 19 buffer 中 |
| Approved | 承認済 | Day 10 Design Gate 通過後 |
| Superseded | 後続版に置換済。履歴目的で残置 | (v2 内では基本未使用) |

v2 では Day 10 Design Gate で全 docs を Approved に格上げ。それ以前は Draft が default。

### 承認者の 3 層分類

`承認者` 欄には、その文書の Gate 通過判定が **案件 / 手順 / 設定 承認** のどれに該当するかを明記:

- **案件承認** はほぼ該当しない (案件単位ではなく文書単位の承認のため)
- **手順承認**: workflow.md / agent-instructions.md / approval-policy.md / knowledge/compiled/*.md の昇格
- **設定承認**: その他の docs (scope / 方針 / アーキテクチャ / KPI 仮説 等)

### SSOT 区分

この文書が何の **唯一正本** か記述。例:

- "旧 repo 参照関係 + 継承 / 再編 / 捨てる の SSOT" (`prior-art-map.md`)
- "文書間 SSOT mapping + Approval Taxonomy" (`_SSOT.md`)
- "3 層承認 + 4-eyes + Automation Maturity の SSOT" (`02-approval-model.md`)
- "9 画面 UI Screen Card の SSOT" (`03-ui-prototype-design.md`)
- "4 KPI multi-criteria 仮説 gate + 7 KPI / 9 KRI catalogue" (`05-metrics-and-gates.md`)
- "参照のみ" (SSOT 無し)

複数文書が同じ SSOT 区分を主張したら **矛盾**。`_SSOT.md` で 1 文書に決め、もう一方は reference 化。Day 10 Design Gate で grep 検出。

### Evidence Status

v2 では **Evidence-safe 原則** に従い、定量値・事実記述の根拠レベルを明示。

| 区分 | 意味 | v2 での出現 |
|---|---|---|
| N/A | 定量値・事実記述を含まない (原則・設計のみ) | 多くの docs |
| Unknown | 取得計画なし (本 v2 scope では Phase 1 以降) | (v2 内では基本未使用) |
| Hypothesis | 仮説。根拠を本文に明記 | 4 KPI gate (99% / 1% / 5%)、`mock-*.ts` 数値 |
| Sample-based | サンプリングデータで確認 | (v2 では未使用、Phase 1 以降) |
| Measured | 運用ログ・台帳で測定済 | (v2 では未使用、Phase 1 以降) |

v2 では大半が **N/A or Hypothesis**。文書全体で混在する場合、章単位で注記 (例: §5 は Hypothesis、§6 は N/A)。

### 機密区分

v2 では:

- **Internal**: default、project team / Session 4 facilitator が読む
- **Confidential**: Session 4 audience に直接見せない裏設計 (例: 規制 framing の hedge 表現を含む箇所)

`Public` / `Restricted` は v2 では未使用。

---

## 適用例 (`prior-art-map.md` 想定)

```markdown
# Prior Art Map - backoffice-ai-v2

| 項目            | 値                                                                |
| --------------- | ----------------------------------------------------------------- |
| 文書 ID         | DOC-ROOT-prior-art-map                                            |
| 文書名          | Prior Art Map (旧 repo → v2 継承 / 再編 / 捨てる)                 |
| 版数            | v0.1                                                              |
| ステータス      | Draft                                                             |
| オーナー        | backoffice-ai-v2 maintainer                                       |
| 承認者          | self — 設定承認 (旧 repo 取扱方針の確定)                          |
| 閲覧対象        | Internal / Project team                                           |
| 機密区分        | Internal                                                          |
| 関連文書        | DOC-ROOT-_SSOT, DOC-APP-02, DOC-UI-03, DOC-MON-05                 |
| SSOT 区分       | 旧 repo (v1 + ai-operator) 参照関係 + 継承 / 再編 / 捨てる の SSOT |
| Evidence Status | N/A (設計のみ、定量値なし)                                        |
| 改版履歴        | v0.1 (2026-05-21): 初版作成 (Day 1)                                |

...本文...
```
