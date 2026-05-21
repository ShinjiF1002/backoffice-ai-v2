# CLAUDE.md - Backoffice AI v2

Backoffice 業務に AI Agent を段階自動化する構想 の v2 repo。cowork-workshop Session 4 (2026-06-12 Fri) で構想共有するための「設計書 + UI prototype + workshop demo」の 3 点 set。

## Plan

実装は `~/.claude/plans/ai-backoffice-ai-virtual-muffin.md` (v1.3 final patch 適用版 lock、Plan v1.1.2 22 日 base + Day 5 整合化 update、5/21 Thu Day 1 - 6/11 Thu Day 22) に従う。非自明な scope 変更 (新 doc 追加、画面追加、KPI 変更、業務追加) は plan を update してから実装。Plan に書かれていない変更は禁止。

## 中核 message

**差戻しを、次の正解手順に変える仕組み**。差戻し → staging ナレッジに記録 (未承認ヒント、AI 正式実行根拠ではない) → AI 日次分析 + 手順承認 → 設定承認で正式手順に昇格、の loop が中心。

- AI を一気に自動化するのではなく、現場の差戻しを毎日の改善提案に変える
- 承認された手順だけを AI に覚えさせる
- 減らすのは確認作業。残すのは手順変更と AI 設定変更の承認

Matrix B (Slide 7) 主表現: **AIに任せる量は段階的に増やすが、人によるコントロールは渡さない**。slogan: 案件確認は減らす。ルール承認は残す。

## Connectivity (本番想定、設計メモ、prototype 実装対象外)

AI が業務システムにアクセスする本番接続は tier 化。v2 prototype はフロントエンド Web UI のみ、実接続は scope-out (Phase 1 で実設計予定)。

| Tier | 接続方式 | 用途 |
|------|---------|------|
| 標準 | API | 通常想定の接続方式 |
| 準標準 | MQ / event / file bridge | レガシー / 非同期連携 |
| 代替 | RPA / Computer Use / MCP | API 不在のレガシーシステム |
| 例外 | DB 直接続 | **原則 read-only、write は明示承認 + 限定条件** |

データ参照 / データ入力 両対応。詳細は `docs/00-overview.md` §2.2 接続層メモ参照。

## UI Scope (段階詳細化、Stripe 風)

UI は wireframe-first で詳細化する。Stripe 風の高密度・高信頼 SaaS UI を目指し、マイクロインタラクションを丁寧に作り込む。**polish target は 9 画面 ALL 95% target equal**。Hero 3 区分は `demo-script` (Day 20) の画面遷移順序としてのみ残し、polish target には適用しない (Plan v1.4.1 Fix 3、v1.4.2 Rule 6)。

- **Step 1 (Day 11-13)**: Wireframe で情報設計と状態遷移を固定 (9 画面 low-fi)
- **Step 2 (Day 14-15)**: Stripe 風 design language 詳細化 (9 画面 ALL に design token 適用、medium-fi)
- **Step 3 (Day 16-18)**: マイクロインタラクション (hover / transition / inline feedback / status animation) を丁寧に作り込む (high-fi、9 画面 ALL 95% target equal)

**Prototype mode label (必須)**: 全画面共通 persistent pill を AppShell header right に表示。文言「プロトタイプ表示 — 外部システム未接続 / 証跡はモック」。必須対象: 9 画面全部 + `BusinessApprovalView` static mock (Plan v1.4 P0-3、v1.4.1 Fix 5)。

backend / external connection / real automation は実装しない (scope-out)。

## Tier 1 語彙 (Session 4 audience に出す、slide / UI label / copy 全部 OK)

| 語 | 意味 |
|---|---|
| **案件承認** | 個別案件の処理結果を人間が確認 |
| **手順承認** | コメントや暗黙知を正式手順に反映 |
| **設定承認** | AI の権限・モデル・プロンプト・ツール変更を確認 |
| **入力者** | AI 入力結果を確認 / 差戻し |
| **承認者** | 入力者確認後の最終確認 |
| **Flywheel** | 差戻し → staging → compiled → 手順承認 → 設定承認 |
| **業務別ファイル群** | `workflows/{業務}/` 配下の文書群。通常業務は 5 文書、boundary-only 業務は 3 文書 |

## Tier 2 語彙 (UI label / docs OK、slide では補助)

`staging` / `compiled` / `Trust Level` / `Supervised` / `Checkpoint` / `Autonomous` / `Alert` / `差戻し` / `Knowledge` / `Plan First` / `Verification gate`

## Tier 3 語彙 (裏設計のみ、表層 NG、v2 docs 内でも事実主張禁止)

`MRM` / `CISO` / `Risk` (固有部署として) / `NYDFS` / `SR 11-7` / `CCPA` / `OFAC` / `BSA` / `SAR` / `CTR` / `ECOA`

これら規制語は v2 docs 内でも事実主張禁止。参照する場合は `[ai-operator paper §X.Y 参照、本 v2 では将来確認項目]` の hedge 表現で扱う。Session 4 slide / UI label / copy には完全に出さない。

Day 10 Design Gate + Day 19 + Day 21 で `grep -rEn "(MRM|CISO|NYDFS|SR 11-7|CCPA|OFAC|BSA|SAR|CTR|ECOA)"` を v2 repo + `cowork-workshop/CLAUDE.md` + `cowork-workshop/workshop-design.md` に限定して確認。`cowork-workshop/session-{1,2,3}-narrative.md` は scope 外 (内部の旧 S4 参照は expected historical hit)。

## scope-out

### v2 (Session 4) でやらない
- 実 LLM API 呼び出し / Computer use / desktop control / 外部システム接続 / 完全自動化
- 実 customer data / 実 PDF (mock のみ、サンプル画像で代替)
- 実規制 cite (NYDFS / SR 11-7 等は v2 docs 内でも事実主張せず、`docs/prior-art-map.md` から ai-operator paper への reference link のみ)
- 実送金 trigger / 実 master data 更新
- 国際送金業務の UI 画面化 + Dashboard カード化 (`workflows/international-transfer-boundary/` に 3 文書のみ)
- 承認者 (Business Approval) の画面化 (`case/BusinessApprovalChip.tsx` + slide-only static mock で代替、route / page / smoke test 対象外)
- hands-on workshop (Session 4 は説明 + demo のみ)
- 旧 repo (`backoffice-ai`, `ai-operator`) の archive 移動 (v2 完成まで `~/code/active/` に保持)
- `cowork-workshop/session-{1,2,3}-narrative.md` の編集 (S1-3 SSOT、Day 19 で touch しない)

詳細は Plan §8 Out of Scope 参照。

## JP-only 原則

UI / slide / docs / workflow 内の copy は日本語のみ。英語 string は bug。例外: 技術固有名詞 (`React` / `Vite` / `Tailwind` / `Skill` / `Claude.md` / `npm` 等) は OK。

## File 編集 hygiene

### 文書冒頭の共通ヘッダ
- 全 `docs/*.md` / `workflows/{業務}/*.md` / `demo/*.md` の冒頭に `docs/_HEADER_TEMPLATE.md` の 12 項目 markdown 表を配置 (文書 ID / 文書名 / 版数 / ステータス / オーナー / 承認者 / 閲覧対象 / 機密区分 / 関連文書 / SSOT 区分 / Evidence Status / 改版履歴)
- 文書 ID は `DOC-{CATEGORY}-{NAME}` 形式、Category は `_HEADER_TEMPLATE.md` の表を参照 (ROOT / OV / FW / APP / UI / KNW / MON / S4 / WF / DEMO)
- `_meta.yaml` (workflows/{業務}/_meta.yaml) は markdown ではないので 12 項目 header は不要、独自 YAML schema

### `_meta.yaml` enum 統一 (衝突禁止)
- `trust_level`: `supervised` / `checkpoint` / `autonomous` / `n/a`
- `risk_level`: `low` / `medium` / `high`
- `automation_status`: `active` / `restricted` / `prohibited` (← `restricted` / `prohibited` はこの field にのみ出現)
  - `active`: 通常 AI 自動化対象
  - `restricted`: 条件付き制限 (条件は `restricted_conditions` で machine-readable に保持。国際送金が該当、`$10M` 相当以上は AI 自動化不可 `[仮説 / 要検証]`)
  - `prohibited`: 業務全体が AI 自動化対象外 (現時点で該当業務なし、将来用 enum)

`trust_level=prohibited` のような書き方は無効。Day 7 で 3 業務すべての `_meta.yaml` を grep 確認。

### KPI / Metric の数値ラベル
- 4 KPI gate (AI 入力承認率 / 人手上書き率 / Alert 発生率 / 承認者差戻し率) には必ず `[仮説 / 要検証]` または `[仮説]` ラベルを付ける
- 実 gate ではなく Session 4 説明用の仮説値であることを明示

### shared component 集約
- `prototype/src/components/shared/` に 1 file 1 component
- shared component が複数 page で再利用される時のみ集約、1-off は inline

### 規制語 hedge
- 事実主張禁止
- `[ai-operator paper §X.Y 参照、本 v2 では将来確認項目]` の hedge 表現
- Session 4 表層には完全に出さない

## SSOT

`docs/_SSOT.md` で各論点の SSOT を mapping。文書間で衝突発生時は SSOT 側を更新、reference 側は引用に留める。Day 10 Design Gate + Day 19 で refresh。

## 旧 repo 参照

- v1 (`~/code/active/backoffice-ai/`): UI prior art (Enterprise Premium design token、5-category error taxonomy、JP typography、shared component pattern)
- ai-operator paper (`~/code/active/ai-operator/`): governance paper (3 層承認、Matrix A/B/C RACI、Automation Maturity、KPI/KRI catalogue、9-field Screen Card template)
- v2 が「継承 / 再編 / 捨てる」を file:line 単位で記録する SSOT = `docs/prior-art-map.md` (Day 1 起稿)
- 旧 repo は v2 完成まで touch しない (read-only prior art、move なし)

## Plan First

非自明な変更は実装前に plan 化 + user review。Plan に書かれていない変更は禁止。Plan update は `~/.claude/plans/ai-backoffice-ai-virtual-muffin.md` を直接編集 (現 lock v1.1.2)。

## Archived artifacts

- `docs-review.html` (root) は Day 5 整合化 update (Plan v1.3 final patch) 以前の review artifact。**以降参照しない / 再生成しない**。
- 過去の review 版は `archive/docs-review-{YYYY-MM-DD}-pre-{version}.html` に退避済。
- `.gitignore` で root の `docs-review*.html` は untracked 運用、`archive/` 配下のみ git 管理。
- 進捗管理 + Day 1-22 status + Plan v1.3 影響分析は `docs/_PROGRESS.md` を参照 (Day 5 起稿)。

## Demo / Session 4

- Demo Chapter 1+2 の進行 = `demo/demo-script.md` (Day 20 起稿)
- Session 4 narrative の SSOT = `docs/06-session4-narrative.md` (Day 9 起稿)
- cowork-workshop 側は Day 19 で `CLAUDE.md` + `workshop-design.md` のみ link 更新 (`session-3-narrative.md` は touch しない)
- BusinessApprovalView mock figure spec = `docs/06-session4-narrative.md` Slide 3 内 figure (Day 9 spec) → `demo/static-mocks/business-approval-view.html` (Day 20 実体化) → `demo/screenshots/business-approval-view.png` (Day 20 export)
