# Backoffice AI v2 — Knowledge pipeline + AI 日次分析

| 項目            | 値                                                                                                                                                                                                                              |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 文書 ID         | DOC-KNW-04                                                                                                                                                                                                                      |
| 文書名          | Knowledge pipeline + AI 日次分析 (5-category routing / Staging usage rules / Staging lifecycle / Audit evidence event model / LLMOps framework)                                                                                 |
| 版数            | v0.1                                                                                                                                                                                                                            |
| ステータス      | Draft                                                                                                                                                                                                                           |
| オーナー        | backoffice-ai-v2 maintainer (AI 管理者 + 業務責任者 合議)                                                                                                                                                                       |
| 承認者          | self — 設定承認 (knowledge pipeline 設計 + AI 日次分析 logic + audit event model schema の確定)                                                                                                                                 |
| 閲覧対象        | Internal / Project team                                                                                                                                                                                                         |
| 機密区分        | Internal                                                                                                                                                                                                                        |
| 関連文書        | DOC-OV-00 §1.2, DOC-FW-01 §3-§4, DOC-APP-02 §3 / §9.8, DOC-UI-03 §6 / §9, DOC-MON-05 (Day 9), DOC-ROOT-\_SSOT §1.4 / §1.5                                                                                                       |
| SSOT 区分       | AI 日次分析 logic + 5-category routing 詳細 + Staging usage rules (UI 表示 + agent prompt embedding) + Staging lifecycle + Audit evidence event model (15 行、paired field 含む実 18) + LLMOps framework + Connection control matrix reference の SSOT |
| Evidence Status | N/A (knowledge pipeline 設計のみ。判断基準 / lifecycle 期間 / KPI gate 仮閾値はすべて `[仮説 / 要検証]`)                                                                                                                        |
| 改版履歴        | v0.1 (2026-05-28): 初版作成 (Day 8、Plan v1.4 P0-1 (staging safety) + P1-1 (staging usage rules) + P1-5 (audit event model) + P1-6 (connection control matrix reference) + P1-8 (staging lifecycle) + v1.4.1 Fix 1/Fix 4 反映)。v0.2 (2026-05-28): CR R10+R11 hygiene patch (§8.1 audit event「15 field event model」→「15-row audit event model (paired field 含む実 field 数 18)」paraphrase)。v0.3 (2026-05-29): CR R12+R13 hygiene patch (Major 2「Day 9 起稿予定」stale pointer 解消、§5.3 + §11 関連文書 で DOC-MON-05 + DOC-S4-06 を実 path pointer に置換)。v0.4 (2026-05-30): Day 10 Design Gate transitive fix (R14 規範 `[仮値]` → `[仮説 / 要検証]` 統一を 04 + workflows knowledge files + _PROGRESS にも transitive 適用、04 内 7 箇所 [Evidence Status / §2.1 頻度 / §2.2 判断基準 heading / §2.2 末尾 / §7 heading / §7.1 期間列 / §7.1 末尾] + workflows knowledge 5 箇所 + _PROGRESS 1 箇所 = 計 13 箇所 fix)。v0.5 (2026-05-30): Day 10.1 hygiene patch (CR R15 反映、§4.5 data_error 「任意 weight」→「`weight: low` fixed、citation 不可、compiled 昇格不可」整合化、関連 P1) |

---

## 1. 概要

本 doc は v2 の **knowledge pipeline** (差戻し → staging → compiled) と **AI 日次分析 logic** の SSOT。Flywheel の loop 因果 (DOC-FW-01) と 3 層承認の RACI (DOC-APP-02) を前提に、運用設計の field-level 詳細を定義する。

主要 section:

- §2 AI 日次分析 logic (Procedure Update Proposal 自動生成 + 承認キュー routing)
- §3 Snippet schema reference (8 field、DOC-ROOT-\_SSOT §1.4 を SSOT として参照)
- §4 5-category routing 詳細 (`misunderstanding / ui_change / edge_case / judgment_gap / data_error`)
- §5 LLMOps framework (Prompt management / Model versioning / Evaluation / Observability)
- §6 Staging usage rules (UI 表示 + agent prompt embedding rule)
- §7 Staging lifecycle (New / Review-required / Stale / Archived + conflict / reject / 重複統合 / `data_error` 例外)
- §8 Audit evidence event model (15 行、paired field 含む実 18)
- §9 Connection control matrix reference (本 doc は pipeline 側連携点のみ、SSOT は DOC-ROOT-\_SSOT §1.5)
- §10 Role × 画面 access matrix reference (本 doc は pipeline 上の role 連携のみ、SSOT は DOC-APP-02 §9.8)

## 2. AI 日次分析 logic SSOT

### 2.1 trigger

- **頻度**: 日次 (本番想定。cron / scheduled task) `[仮説 / 要検証]`
- **対象**: 過去 N 日分の staging knowledge (`workflows/{業務}/knowledge/staging/*.md`、frontmatter 8 field 準拠)
- **scope**: workflow 単位で実行 (workflow_id ごと)

prototype では同一セッション内で mock 簡略化 (`mock-knowledge.ts` 経由)、本番 SLO 仮値は DOC-ROOT-\_SSOT「SLO 仮値」表参照。

### 2.2 判断基準 [仮説 / 要検証]

AI が Procedure Update Proposal を自動生成する条件:

1. **同種差戻しが 3+ 件再発** (同一 workflow + 同一 category + 共通 pattern)
2. **共通 pattern が確認可能** (差戻しコメントの主旨が一致、AI が embedding similarity / topic clustering で判定)
3. **staging 内容に内部矛盾なし** (同 source_case 群の中で AI が矛盾を検出した場合は除外)
4. **`data_error` category でない** (data_error は compiled 昇格対象外、§4.5)
5. **compiled と矛盾しない** (conflict 検知時は §7.2 conflict 解決 routing)

本 v2 phase ではすべて `[仮説 / 要検証]`。本番 threshold は Phase 1 で measurement → calibration → governance review。

### 2.3 Procedure Update Proposal 生成

判断基準を満たす staging group を AI が集約し、**Procedure Update Proposal** として自動生成 (Proposal source = AI、DOC-APP-02 §3 RACI と整合):

- 提案 ID: `PROP-YYYY-NNN`
- 元 staging 一覧 (source_case + frontmatter)
- 提案 diff: `workflow.md` / `agent-instructions.md` / `approval-policy.md` の before/after
- 影響範囲 hint (AI 設定変更を伴うか → 伴う場合は §5.2 設定承認 trigger)

### 2.4 承認キューへの送出

生成された proposal は ProposalReview queue (DOC-UI-03 §4.5) に送出:

- **R (Queue owner)**: Manual 管理者 (triage / forward to 業務責任者 / reject)
- **A (承認)**: 業務責任者 (approve → compiled 昇格 + 反映 diff 適用)
- **C (合議)**: SME / AI 管理者
- **I (通知)**: 入力者 / 承認者

詳細 RACI は DOC-APP-02 §3、UI 反映は DOC-UI-03 §4.5。SoD: Queue owner ≠ Approver (DOC-APP-02 §9.8 / Type A SoD 既定方針)。

## 3. Snippet schema reference

`workflows/{業務}/knowledge/{staging,compiled}/*.md` の frontmatter は **8 field 必須**。schema SSOT は `docs/_SSOT.md` §1.4 (Knowledge snippet schema SSOT) を参照、本 doc では概要のみ:

```yaml
---
date: YYYY-MM-DD
workflow_id: UC-BO-XX # e.g., UC-BO-01
workflow_slug: corporate-address-change
agent_id: agent-corporate-address-change
agent_version: v0.1 # 仮値 OK、将来差分追跡用
source_case: CASE-2026-XXX
category: misunderstanding | ui_change | edge_case | judgment_gap | data_error
weight: low | medium | high # 信頼度のみを表す
---
```

`weight` 解釈は §6 (Staging usage rules) と §7 (Staging lifecycle) で詳述。

## 4. 5-category routing 詳細

5-category enum (DOC-FW-01 §2.2 起点) の処理経路:

### 4.1 `misunderstanding` (AI の意図誤解)

- **compiled 昇格対象**: ✅
- **主反映先**: `agent-instructions.md` (参照ナレッジ / プロンプト hint) / `workflow.md` (業務目的の明確化)
- **典型例**: AI が「住所変更」を「移転」と誤理解、AI が「法人」を「個人」と誤判定

### 4.2 `ui_change` (業務システム UI 変更)

- **compiled 昇格対象**: ✅
- **主反映先**: `agent-instructions.md` (スクショ粒度 / セレクタ / 参照ナレッジ更新)
- **典型例**: 業務システム画面 layout 変更、ボタン位置変更、新項目追加

### 4.3 `edge_case` (想定外パターン)

- **compiled 昇格対象**: ✅
- **主反映先**: `workflow.md` (手順 / 期待状態 / 禁止事項追記) + `approval-policy.md` (Alert 条件追加)
- **典型例**: 外国法人書類が英語のみ、印影が薄くて confidence 低下、複数住所が併記

### 4.4 `judgment_gap` (判断ルール不足)

- **compiled 昇格対象**: ✅
- **主反映先**: `approval-policy.md` (判断基準 / Alert 条件 / 差戻し条件)
- **典型例**: 印鑑照合 confidence threshold が不明確、KYC overlap 判断基準なし

### 4.5 `data_error` (入力データの誤り、AI 責でない) — 例外 routing

- **compiled 昇格対象**: ❌ (Plan v1.3 既定、v1.4 keep)
- **動作**: staging に記録するが、`weight: low` fixed (medium / high 昇格不可)
- **routing**: log / audit / 別 routing で扱う (本 doc §8 audit event model `sendback_category: data_error` で trace)
- **UI 表示**: KnowledgeBrowser で「**runtime citation 対象外**」badge (DOC-UI-03 §9.6)
- **AI runtime 利用**: §6 staging usage rules の hint 対象外 (citation / hint いずれも参照外)
- **典型例**: 入力 PDF の印字ミス、依頼書の記入漏れ、依頼者側の OCR 不能スキャン

5-category の選択 UI は SendBackComment (DOC-UI-03 §4.3)、`data_error` 選択時は入力者に warning「`data_error` は AI 責ではない判定、log / audit / 別 routing に回ります」を表示する。

## 5. LLMOps framework (ai-operator 24 §11 v2 圧縮)

### 5.1 Prompt management

- **SSOT**: `workflows/{業務}/agent-instructions.md` (workflow ごと、業務責任者 / AI 管理者の手順承認経由でのみ更新)
- **versioning**: `_meta.yaml` `agent_version` で追跡 (Plan v1.3 確定、`v0.1` 仮値 OK)
- **prompt 階層**: agent_id 単位の system prompt + workflow_id 単位の business context + tool definitions + reference knowledge (compiled / staging 区分は §6.2 で SSOT)

### 5.2 Model / config versioning

- **`_meta.yaml` field**: `agent_version` (将来差分追跡)
- **本 v2 では**: agent_version のみ。`prompt_config_version` / `tool_config_version` / `model_config_version` は audit event model (§8) の field として skeleton 化、実装は Phase 1
- **設定承認 trigger**: model 変更 → Type B、Trust Level 変更 → Type C、それ以外 → Type A (DOC-APP-02 §4 + DOC-UI-03 §4.6)

### 5.3 Evaluation

- **SSOT pointer**: DOC-MON-05 (`docs/05-metrics-and-gates.md`) の 4 KPI multi-criteria 仮説 gate + 7 KPI catalogue + 9 KRI catalogue
- **4 KPI 仮閾値**: AI 入力承認率 ≥ 99% / 人手上書き率 ≤ 1% / Alert 発生率 ≤ 5% / 承認者差戻し率 ≤ 1% (すべて `[仮説 / 要検証]`、ai-operator 24 §3.2 継承、Plan v1.4 P0-2 / v1.4.1 Fix 2 で「本番導入可否を判定する gate ではない、Phase 1 で測定・再設定する検証仮説」と再 framing 済)
- **Evaluation event**: 各 case の AI proposal → human decision (accept / reject / sendback) を audit event model (§8) で記録、Metrics 画面 (DOC-UI-03 §4.8) で集計

### 5.4 Observability

- **SSOT**: §8 Audit evidence event model (15 行 / 実 18 field、本 doc § 内 SSOT)
- **trace 単位**: case_id + ai_proposal_id + human_decision_id + diff_id
- **永続化**: 本 v2 prototype は in-memory mock state (`prototype/src/data/mock-audit.ts`)、実 audit log 永続化 + immutable storage は Phase 1 hand-off

## 6. Staging knowledge usage rules (Plan v1.4 P0-1 / v1.4.1 Fix 1)

DOC-FW-01 §3.5 (staging safety boundary) + DOC-ROOT-\_SSOT §1.4 staging knowledge runtime 利用範囲 + DOC-UI-03 §9 (Staging UI pattern) と整合。本 doc は **UI 表示 + agent prompt embedding rule** の field-level 詳細を SSOT 化する。

### 6.1 UI 表示 pattern

DOC-UI-03 §9 が SSOT。本 doc は cross-reference のみ:

- staging hint は AiProposalPanel 内、citation list の下に「未承認ヒント」として分離配置 (DOC-UI-03 §9.1)
- weight インジケータ (灰色 / amber / emerald dot) で `low` / `medium` / `high` 区別 (DOC-UI-03 §9.2)
- confidence 低下シグナル / 追加確認質問 trigger / conflict 解決 / `data_error` 例外表示は DOC-UI-03 §9.3-§9.6

### 6.2 agent prompt embedding rule

AI runtime が prompt を組み立てる際の knowledge embedding 規則:

| Knowledge 種別                      | Prompt section                            | Citation                           |
| ----------------------------------- | ----------------------------------------- | ---------------------------------- |
| `weight: high` (compiled approved)  | **Authoritative rules (citation source)** | ✅ AI が citation 根拠として使用可 |
| `weight: medium` (reviewed staging) | **Reference (uncertified hints)**         | ❌ citation 対象外、hint のみ      |
| `weight: low` (staging)             | **Reference (uncertified hints)**         | ❌ citation 対象外、hint のみ      |
| `data_error` (`weight: low` fixed)  | **(参照外)**                              | ❌ runtime 完全参照外、citation 不可、compiled 昇格不可 |

- AI が tool call / proposal generation 時に **citation する根拠** として使用できるのは `weight: high` (compiled approved) のみ
- `weight: low` / `medium` は (1) confidence 低下シグナル / (2) human reviewer への hint / (3) AI が追加確認質問を生成する trigger に限定
- conflict 時 (同一 workflow 内で compiled と staging が矛盾) は compiled を runtime 採用、staging は当該 conflict subset で参照外 (§7.2)

### 6.3 「承認された手順だけを AI に覚えさせる」core message との整合

DOC-OV-00 §1.2 Sub message 2 「承認された手順だけを AI に覚えさせる」と、staging が runtime に visible である運用設計の論理的整合性:

- **AI が覚える (= citation 根拠として使う) のは compiled のみ** (本 §6.2 表で明示)
- **AI が見える (= prompt の Reference section で visible) のは staging も含む**、ただし用途は hint / confidence 低下 / 追加確認質問に限定 (本 §6.2 表)
- 両者を分離することで、core message と運用設計が両立する (Plan v1.4 P0-1 / v1.4.1 Fix 1 / DOC-FW-01 §3.5)

## 7. Staging lifecycle (Plan v1.4 P1-8) [仮説 / 要検証]

### 7.1 4 段階

| 段階                | 期間 [仮説 / 要検証] | 動作                                                                                                    |
| ------------------- | ----------- | ------------------------------------------------------------------------------------------------------- |
| **New**             | 0-30 日     | 通常 staging、`weight: low`、agent prompt の Reference section で AI runtime 参照可 (hint)              |
| **Review-required** | 31-60 日    | Manual 管理者 triage 要求 (KnowledgeBrowser で flag 表示)、未 triage は通知 trigger                     |
| **Stale**           | 61-90 日    | runtime 参照 visible だが UI 上「stale」deprecated 表示、KnowledgeBrowser で警告 badge                  |
| **Archived**        | 90+ 日      | runtime 参照外 (Reference section から除外)、archive table 移行 (`workflows/{業務}/knowledge/archive/`) |

本 v2 phase ではすべて `[仮説 / 要検証]`。本番期間は Phase 1 で measurement → calibration → governance review。

### 7.2 conflict 解決 (compiled vs staging)

- **rule**: 同一 workflow 内で compiled と矛盾する staging は **runtime 参照不可** (compiled が runtime 採用)
- **検知**: AI 日次分析 (§2) で staging と compiled の embedding similarity / 主張対立を検出
- **UI 通知**: KnowledgeBrowser 上部に red banner Alert (DOC-UI-03 §9.5)、Manual 管理者に triage 要求
- **解決経路**:
  1. staging が誤り → reject (§7.3)
  2. compiled が古い → compiled の修正 Procedure Update Proposal を AI 日次分析で生成 (§2)
  3. 業務責任者判断必要 → ProposalReview queue へ forward

### 7.3 reject lifecycle

- Manual 管理者が reject した staging は **archive 移行** (削除しない、audit trail 保護)
- archive 場所: `workflows/{業務}/knowledge/archive/rejected/`
- **再提案条件**: 同等内容の再提案には **新 case evidence** が必要 (同一 source_case の再提出は AI が自動 reject)
- reject 理由は audit event model (§8) の `human_decision_id` に紐付き trace

### 7.4 重複統合 (auto merge)

- **rule**: 同一 source_case + 同一 category の staging は AI が自動 merge (latest 優先)
- **動作**: AI 日次分析 (§2) で重複検知 → merge → 元 staging は archive 移行 (履歴保持)
- **merge 履歴**: audit trail に「N 件 merge → 1 件 staging に統合」記録

### 7.5 `data_error` 例外 (§4.5 と整合)

- `data_error` category の staging は本 lifecycle の **compiled 昇格 path には乗らない**
- `data_error` staging は New 段階で `weight: low` fixed (medium / high 昇格不可)、Review-required / Stale / Archived は通常 timeline で適用
- log / audit / 別 routing で扱う (本 doc §8 audit event model `sendback_category: data_error` で trace)

## 8. Audit evidence event model (Plan v1.4 P1-5)

本 v2 prototype は in-memory mock state で **field 構造のみ示す** (実 audit log 永続化は scope-out、Phase 1 hand-off)。

### 8.1 15-row audit event model (paired field 含む実 field 数 18)

| #   | Field                                | 説明                                                                                                    | mock 実装                                                   |
| --- | ------------------------------------ | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| 1   | `case_id`                            | Case 識別子 (UC-XX-YYYY-NNN)                                                                            | `mock-cases.ts` 由来                                        |
| 2   | `workflow_id` + `workflow_version`   | 業務 ID + 版数 (v0.1 等)                                                                                | `_meta.yaml` + procedure_version log                        |
| 3   | `agent_id` + `agent_version`         | Agent ID + 版数                                                                                         | `_meta.yaml` 由来                                           |
| 4   | `prompt_config_version`              | Prompt 設定 version (skeleton、Phase 1 実装)                                                            | mock field only                                             |
| 5   | `tool_config_version`                | Tool 設定 version (skeleton)                                                                            | mock field only                                             |
| 6   | `model_config_version`               | Model + temperature 等 (skeleton)                                                                       | mock field only                                             |
| 7   | `input_artifact_hash`                | 入力 PDF / 帳票 hash (実 PDF は scope-out、mock では fake hash 文字列)                                  | mock field only                                             |
| 8   | `screenshot_stack_id`                | 操作 screenshot stack ID (RPA / Computer Use trace、scope-out)                                          | mock field only                                             |
| 9   | `ai_proposal_id`                     | AI 提案 ID (本 case の AI proposal を一意特定)                                                          | `mock-cases.ts` 内で生成                                    |
| 10  | `human_decision_id`                  | 入力者 / 承認者の判断 ID (accept / reject / sendback)                                                   | `mock-cases.ts` 内で生成                                    |
| 11  | `sendback_category`                  | 5-category routing (`misunderstanding` / `ui_change` / `edge_case` / `judgment_gap` / `data_error`、§4) | `mock-cases.ts` の差戻し event で記録                       |
| 12  | `compiled_knowledge_citation_ids`    | runtime 採用 compiled snippet ID list (§6.2 citation source のみ)                                       | `mock-knowledge.ts` の compiled snippet ID 配列             |
| 13  | `approval_timestamp` + `approver_id` | 承認時刻 + 承認者                                                                                       | `mock-cases.ts` / `mock-audit.ts`                           |
| 14  | `diff_id`                            | 反映 diff ID (compiled 昇格時の workflow.md / agent-instructions.md / approval-policy.md diff)          | `mock-knowledge.ts` の compiled 昇格 event で生成           |
| 15  | `rollback_ref`                       | rollback された場合の reference (緊急時 Forced Downgrade、DOC-APP-02 Matrix C)                          | mock field only (本 v2 phase で rollback flow は scope-out) |

### 8.2 TypeScript type definition (prototype)

`prototype/src/types/audit.ts` で type 定義 (Day 11+ 実装):

```typescript
export type AuditEvent = {
  case_id: string;
  workflow_id: string;
  workflow_version: string;
  agent_id: string;
  agent_version: string;
  prompt_config_version?: string;
  tool_config_version?: string;
  model_config_version?: string;
  input_artifact_hash?: string;
  screenshot_stack_id?: string;
  ai_proposal_id?: string;
  human_decision_id?: string;
  sendback_category?:
    | "misunderstanding"
    | "ui_change"
    | "edge_case"
    | "judgment_gap"
    | "data_error";
  compiled_knowledge_citation_ids?: string[];
  approval_timestamp?: string;
  approver_id?: string;
  diff_id?: string;
  rollback_ref?: string;
};
```

### 8.3 UI 表示 (AuditTrail / DOC-UI-03 §4.7)

- `/audit` page で event timeline 表示
- 個別 event click で 15 行 (paired field 含む実 18 field) detail panel 展開
- `compiled_knowledge_citation_ids` → KnowledgeBrowser link、`diff_id` → ProposalReview link、`case_id` → CaseReview link で関連 entity navigation
- 過去 case 関連ルール更新 Alert UI 適用範囲 2 (DOC-UI-03 §6.2) を timeline 上で inline 表示

### 8.4 永続化 (Phase 1 hand-off)

本 v2 prototype は in-memory mock state、Phase 1 で:

- 実 audit log 永続化 (immutable storage、append-only)
- credential / secret 管理
- access control (DOC-APP-02 §9.8 Role × 画面 access matrix の Auditor read all を実装)
- retention policy (rollback / regulatory requirement に応じた保持期間)

詳細は Phase 1 design memo として hand-off。

## 9. Connection control matrix reference

本番接続方式の control matrix SSOT は `docs/_SSOT.md` §1.5「接続方針 SSOT pointer (control matrix)」+ `docs/00-overview.md` §2.2 接続層メモ (Plan v1.4 P1-6 / v1.4.2 Rule 5、Day 8 冒頭で先行反映済)。

本 doc は **knowledge pipeline 側の連携点** のみ:

- **知識更新の反映経路**: compiled 昇格 → workflow.md / agent-instructions.md / approval-policy.md 反映は **本番では接続層を介さず file system / git commit 経由** (内部 docs 更新であり、業務システム接続ではない)
- **AI runtime が業務システムにアクセスする際の接続**: `docs/_SSOT.md` §1.5 control matrix (標準 API / 準標準 MQ / 代替 RPA / 例外 DB) を参照
- **本 v2 prototype**: 接続層自体を実装しない (control matrix は Phase 1 design memo として docs に残す scope)

## 10. Role × 画面 access matrix reference

Role × 画面 access matrix SSOT は `docs/02-approval-model.md` §9.8 (Phase 1 hand-off memo、Plan v1.4 P1-7)。

本 doc は **knowledge pipeline 上の role 連携** のみ:

- **AI 日次分析 (§2)**: Proposal source = AI (組織責任主体ではない、情報項目)
- **ProposalReview queue (§2.4)**: R = Manual 管理者 (Queue owner、KnowledgeBrowser / ProposalReview で triage)
- **手順承認 (§2.4)**: A = 業務責任者 (ProposalReview で approve)
- **設定承認 trigger (§5.2)**: R = AI 管理者 (AgentSettings で submit)、A = Type 別 co-A
- **Audit trace (§8)**: Auditor (read all)、他 role は限定 read

本 v2 prototype は in-memory mock state、access enforcement 未実装。mock data の人物表記分離のみで簡略化 (DOC-APP-02 §9.8、Type A SoD 既定方針)。

## 11. 関連文書

- DOC-OV-00 §1.2 (Core message、§6.3 と整合)
- DOC-FW-01 §3-§4 (staging → compiled flow、本 doc §2 / §6 / §7 と整合) + §3.5 (staging safety boundary、§6.2 と整合) + §6.3 (過去 case 不変 + Alert、§8.3 と整合)
- DOC-APP-02 §3 (手順承認 RACI、§2.4 と整合) + §9.8 (Role access matrix、§10 reference)
- DOC-UI-03 §4.5 (ProposalReview、§2.4 と整合) + §4.7 (AuditTrail、§8.3 と整合) + §6 (AiProposalPanel Alert UI) + §9 (Staging UI pattern、§6.1 と整合)
- DOC-MON-05 (`docs/05-metrics-and-gates.md`、4 KPI 仮閾値 + 7 KPI + 9 KRI、§5.3 reference)
- DOC-ROOT-\_SSOT §1.4 (Snippet schema SSOT、§3 reference) + §1.5 (接続方針 control matrix、§9 reference)
- DOC-S4-06 (`docs/06-session4-narrative.md`、Session 4 narrative)
- `~/.claude/plans/ai-backoffice-ai-virtual-muffin.md` Plan v1.4 P0-1 (staging safety) + P1-1 (staging usage rules) + P1-5 (audit event model) + P1-6 (connection control matrix) + P1-7 (role access matrix reference) + P1-8 (staging lifecycle) + v1.4.1 Fix 1 / Fix 4
