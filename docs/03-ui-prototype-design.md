# Backoffice AI v2 — UI prototype design

| 項目            | 値                                                                                                                                            |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| 文書 ID         | DOC-UI-03                                                                                                                                     |
| 文書名          | UI prototype design (Stripe 風 design language + 9 画面 Screen Card + AiProposalPanel Alert UI + Prototype mode label + Staging UI pattern)   |
| 版数            | v0.1                                                                                                                                          |
| ステータス      | Draft                                                                                                                                         |
| オーナー        | backoffice-ai-v2 maintainer (UI design lead)                                                                                                  |
| 承認者          | self — 設定承認 (UI design language + 9 画面 spec の確定)                                                                                     |
| 閲覧対象        | Internal / Project team                                                                                                                       |
| 機密区分        | Internal                                                                                                                                      |
| 関連文書        | DOC-OV-00 §2.3, DOC-FW-01 §3.5, DOC-APP-02 §9.8, DOC-KNW-04, DOC-S4-06, DOC-ROOT-\_SSOT §1.4 / §1.5                                           |
| SSOT 区分       | 9 画面 UI Screen Card + Stripe 風 design language + AiProposalPanel Alert UI (3 適用範囲) + Prototype mode label + Staging UI pattern の SSOT |
| Evidence Status | N/A (UI 設計のみ。polish target 9 画面 ALL 95% target equal は v1.4.1 Fix 3 / v1.4.2 Rule 6 確定、Hero 3 区分は demo-script 遷移順序のみ)     |
| 改版履歴        | v0.1 (2026-05-28): 初版作成 (Day 8、Plan v1.4 P1-1 + P1-5 (audit event reference) + v1.4 P0-3 / v1.4.1 Fix 3 / Fix 5 反映)。v0.2 (2026-05-28): CR R10+R11 hygiene patch (§4.1 「Hero 起点」→「Demo Chapter 1 起点」 / §10 AiProposalPanel utilizers から ProposalReview 削除 / §4.7 audit event「15 field」→「15-row (paired field 含む実 18)」paraphrase)                    |

---

## 1. 概要

本 doc は v2 prototype の **UI 設計 SSOT**。Stripe 風の高密度・高信頼 SaaS UI を 9 画面で構成、Wireframe → medium-fi → high-fi の 3 段階で詳細化する。

- **9 画面 ALL 95% target equal** (Hero 3 区分は `demo-script` (Day 20) の画面遷移順序としてのみ残し、polish target には適用しない、v1.4.1 Fix 3 / v1.4.2 Rule 6)
- React 19 + Vite 8 + Tailwind v4 + shadcn/ui (in-memory mock state、永続化なし)
- 承認者画面は実装せず、`BusinessApprovalChip` + slide-only static mock (`demo/static-mocks/business-approval-view.html`) で代替

## 2. Stripe 風 design language SSOT

### 2.1 色 token (Tailwind v4 `@theme` で定義予定)

| Token               | 用途                                 | Tailwind base |
| ------------------- | ------------------------------------ | ------------- |
| `--color-bg`        | page background                      | `slate-50`    |
| `--color-surface`   | card / panel background              | `white`       |
| `--color-border`    | divider / input border               | `slate-200`   |
| `--color-text`      | body text                            | `slate-900`   |
| `--color-text-mute` | caption / placeholder                | `slate-500`   |
| `--color-accent`    | primary action / link / focus        | `indigo-600`  |
| `--color-warning`   | non-critical Alert / deprecated      | `amber-500`   |
| `--color-danger`    | critical Alert / error / destructive | `red-600`     |
| `--color-success`   | approval / confirmed state           | `emerald-600` |

dark mode は v2 scope-out (Phase 1 / 将来検討)。

### 2.2 typography

- font-family: `Inter` (en) + `Noto Sans JP` (jp)、Tailwind v4 `font-sans` で stack
- weight: `400` (body) / `500` (semibold UI label) / `600` (display heading) / `700` (page title)
- size scale: `text-xs` (12) / `sm` (14) / `base` (16) / `lg` (18) / `xl` (20) / `2xl` (24) / `3xl` (32)
- line-height: `tight` (1.25、heading) / `normal` (1.5、body) / `relaxed` (1.625、long-form)
- letter-spacing: default。`tracking-tight` は heading のみ

### 2.3 spacing (8-grid)

| Token | Value | Tailwind notation |
| ----- | ----- | ----------------- |
| xs    | 4px   | `1` (p-1)         |
| sm    | 8px   | `2`               |
| md    | 12px  | `3`               |
| base  | 16px  | `4`               |
| lg    | 24px  | `6`               |
| xl    | 32px  | `8`               |
| 2xl   | 48px  | `12`              |
| 3xl   | 64px  | `16`              |

### 2.4 shadow (3 段 + 1 elevated)

| Token       | 用途                       | Tailwind notation     |
| ----------- | -------------------------- | --------------------- |
| `shadow-xs` | subtle elevation           | `shadow-sm` (1-2px)   |
| `shadow-sm` | card resting state         | `shadow` (2-4px)      |
| `shadow-md` | hover / interactive        | `shadow-md` (6-8px)   |
| `shadow-lg` | modal / popover / dropdown | `shadow-lg` (12-16px) |

### 2.5 animation curve

| Token         | Curve                            | 用途                |
| ------------- | -------------------------------- | ------------------- |
| `ease-out`    | `cubic-bezier(0.22, 1, 0.36, 1)` | 入場 / hover        |
| `ease-in`     | `cubic-bezier(0.55, 0, 0.45, 1)` | 退場 / dismiss      |
| `ease-in-out` | default                          | toggle / state 切替 |

duration: `duration-150` (instant feedback) / `duration-250` (default) / `duration-400` (heavy transition)。real-time guarantee 風表現は使わない (DOC-ROOT-\_SSOT SLO 表現規範参照)。

### 2.6 マイクロインタラクション 8 例 (Day 16-18 high-fi で実装)

1. **button hover scale**: `transform scale-100 → scale-[1.02]`、`duration-150 ease-out`
2. **card hover lift**: `shadow-sm → shadow-md`、`duration-250 ease-out`
3. **status badge color transition**: background + text color、`duration-250`
4. **form submit feedback**: loading spinner → check icon、`duration-400`
5. **toast slide-in**: top-right、`translate-y-[-100%] → translate-y-0`、`duration-250 ease-out`
6. **tooltip fade**: `opacity-0 → opacity-100`、`duration-150`、`delay-150` で hover 確定
7. **accordion expand**: `h-0 → h-auto` (実際は `max-h-0 → max-h-screen`)、`duration-250 ease-out`
8. **chip ripple**: radial gradient overlay、`duration-150` on click

## 3. 段階詳細化 SSOT (Wireframe → medium-fi → high-fi)

### 3.1 Wireframe phase (Day 11-13)

- **9 画面 ALL low-fi** (情報設計 + 状態遷移を固定)
- Stripe 風 design token は適用せず (default Tailwind grayscale)
- AppShell + Sidebar + Header + BottomNav + Routing setup
- mock data initial files (`mock-cases.ts` / `mock-knowledge.ts` / `mock-agents.ts` / `mock-audit.ts` / `mock-metrics.ts`)

完了 gate: 9 画面 routing 動作 + low-fi wireframe 完成 + TypeScript compile pass + 9-field Screen Card と整合確認 (`_PROGRESS.md` Day 13 gate)。

### 3.2 medium-fi phase (Day 14-15)

- **9 画面 ALL** に Stripe design token 適用 (color / typography / spacing)
- BusinessApprovalChip 表示 (CaseReview 内)
- AiProposalPanel に過去 case Alert UI (banner 形式) を first cut で実装
- **Prototype mode label 実装** (全画面共通 persistent pill、文言「プロトタイプ表示 — 外部システム未接続 / 証跡はモック」)

完了 gate: 9 画面 ALL に Stripe design token 適用、visual smoke OK、Prototype mode label 実装済 (`_PROGRESS.md` Day 15 gate、v1.4.1 Fix 3 / v1.4.2 Rule 6 と整合)。

### 3.3 high-fi phase (Day 16-18)

- **9 画面 ALL 95% target equal** 仕上げ + マイクロインタラクション 5-8 例 (§2.6)
- AiProposalPanel Alert UI 詳細化 (3 適用範囲、文言 / 配置 / dismiss、§6 参照)
- Prototype mode label 詳細化 (a11y / tooltip / 配置 finalize)
- TypeScript compile + visual smoke + Lighthouse a11y 90+

完了 gate: 9 画面 ALL 95% 仕上げ + マイクロインタラクション + AiProposalPanel Alert UI (3 適用範囲) + Prototype mode label + Lighthouse a11y 90+ (`_PROGRESS.md` Day 18 gate)。

## 4. 9 画面 Screen Card (9-field × 9)

Screen Card template (ai-operator 11 §4 v2 再編):

1. **画面 ID + path**: route + 画面識別子
2. **目的**: 主要 user value (1 sentence)
3. **主要ユーザー**: role (`_SSOT.md` Approval Taxonomy SSOT との整合)
4. **主要 action**: verb (approve / sendback / triage 等)
5. **状態 (states)**: variants list
6. **表示要素**: key UI components
7. **遷移 (entry / exit)**: 前後画面 / link
8. **mock data 依存**: file references
9. **Day 11+ 実装メモ**: priority / dependencies

---

### 4.1 Inbox (`/inbox`) [Demo Chapter 1 起点]

1. **画面 ID**: SCR-01 Inbox
2. **目的**: 入力者が AI 処理待ち案件の queue を見て、優先度順に着手する
3. **主要ユーザー**: 入力者
4. **主要 action**: case を click → CaseReview に遷移
5. **状態**: `pending` (AI 処理中) / `ready` (入力者確認待ち) / `sent-back` (再処理中) / `business-approval-waiting` (承認者送出済)
6. **表示要素**: case list table (workflow / case_id / 状態 badge / 経過時間 / Alert 件数 / progress)、filter (workflow / 状態)、sort (受付順 / 経過時間順)、PageHeader、Prototype mode label
7. **遷移**: case row click → `/cases/:id`、filter / sort interaction
8. **mock data 依存**: `mock-cases.ts` (case list)
9. **Day 11+ 実装メモ**: Wireframe で table layout + filter chip + 状態 badge 配置確定。Demo Chapter 1 開始画面 (Hero 1-3 polish target equal、本画面は demo 起点として遷移順序上の意味のみ)

### 4.2 CaseReview (`/cases/:id`) [Hero 1]

1. **画面 ID**: SCR-02 CaseReview
2. **目的**: 入力者が AI 入力結果 + 証跡 + ナレッジ citation を見て、承認 / 差戻しを判断する
3. **主要ユーザー**: 入力者 (主)、承認者 (read)
4. **主要 action**: 承認 / 差戻し (5-category 選択 → SendBackComment 遷移) / BusinessApprovalChip click
5. **状態**: `ready` / `sent-back` / `approved` / `business-approval-waiting`
6. **表示要素**: PageHeader (case_id + workflow + 状態 badge)、左 panel (AI 入力結果 + 編集可能 form)、中 panel (PDF preview / screenshot stack / Alert list)、右 panel (`AiProposalPanel` = citation list + staging hint + Alert UI 適用範囲 1)、footer (承認 / 差戻し ボタン + `BusinessApprovalChip`)、Prototype mode label
7. **遷移**: 差戻し click → `/cases/:id/comment`、承認 click → state 変更 + Inbox queue 戻る、`BusinessApprovalChip` click → static mock new tab
8. **mock data 依存**: `mock-cases.ts` (case detail) + `mock-knowledge.ts` (citation list) + `mock-audit.ts` (state transition log)
9. **Day 11+ 実装メモ**: AiProposalPanel は §6 Alert UI と §9 Staging UI pattern を組み込む。Hero 1 (Demo Chapter 1 主画面)

### 4.3 SendBackComment (`/cases/:id/comment`)

1. **画面 ID**: SCR-03 SendBackComment
2. **目的**: 入力者が差戻し理由を 5-category + free-text で送信する
3. **主要ユーザー**: 入力者
4. **主要 action**: 5-category 選択 + コメント入力 + 送信 → staging knowledge 生成
5. **状態**: `composing` / `submitting` / `submitted` (toast 表示 + CaseReview / Inbox 戻る)
6. **表示要素**: PageHeader、case context summary、5-category radio (`misunderstanding / ui_change / edge_case / judgment_gap / data_error`)、コメント textarea、関連 evidence checklist (PDF / screenshot / agent output どれが該当か)、submit button、Prototype mode label
7. **遷移**: submit → toast 「差戻しを記録しました (staging knowledge に反映)」+ CaseReview 戻る
8. **mock data 依存**: `mock-cases.ts` (case context) + 新規 mock state (差戻し送信 → staging 反映、同一セッション内)
9. **Day 11+ 実装メモ**: 5-category radio + `data_error` 選択時は warning「`data_error` は AI 責ではない判定、log / audit / 別 routing に回ります」を表示 (DOC-KNW-04 §4.5 と整合)

### 4.4 Dashboard (`/dashboard` または `/`)

1. **画面 ID**: SCR-04 Dashboard
2. **目的**: 入力者 / 承認者 / 業務責任者が複数業務 (UC-BO-01 + UC-BO-02) の進捗 + Alert を俯瞰する
3. **主要ユーザー**: 全 role (read access)
4. **主要 action**: 業務 card click → 業務別 Inbox (`/inbox?workflow=...`)、Alert click → 該当 CaseReview
5. **状態**: 業務 active / busy / quiet (case 件数で表現)
6. **表示要素**: PageHeader、業務 card grid (UC-BO-01 + UC-BO-02 並列、各 card に case 件数 / Alert 件数 / pending business-approval 件数 / 直近 7 日 KPI sparkline)、Prototype mode label。**国際送金は restricted boundary pack のため card 表示しない** (DOC-OV-00 §3、`workflows/_index.md`)
7. **遷移**: card click → Inbox filtered view、Alert click → CaseReview
8. **mock data 依存**: `mock-cases.ts` (件数集計) + `mock-metrics.ts` (sparkline data)
9. **Day 11+ 実装メモ**: 業務 card は 2 並列 (UC-BO-01 Hero + UC-BO-02 並列カード)。restricted 業務は表示しない原則を mock data から徹底 (DOC-OV-00 §3 / `workflows/_index.md` §1 と整合)

### 4.5 ProposalReview (`/proposals/:id`) [Hero 2]

1. **画面 ID**: SCR-05 ProposalReview
2. **目的**: Manual 管理者 (Queue owner) / 業務責任者が AI が生成した Procedure Update Proposal を triage / 承認する
3. **主要ユーザー**: Manual 管理者 (R = Queue owner、triage / forward / reject)、業務責任者 (A = 承認)
4. **主要 action**: triage → forward (業務責任者へ) / reject、業務責任者は approve / send-back
5. **状態**: `pending-triage` (Manual 管理者 action 待ち) / `forwarded` (業務責任者 action 待ち) / `approved` / `rejected`
6. **表示要素**: PageHeader (proposal_id + workflow + 状態 badge + 「Proposal source: AI (日次分析)」明示)、左 panel (元 staging 一覧 + source_case link)、中 panel (proposed diff: workflow.md / agent-instructions.md / approval-policy.md の before/after)、右 panel (RACI box: Proposal source AI / R Manual 管理者 / A 業務責任者 / C SME・AI 管理者 / I 入力者・承認者)、footer (Manual 管理者: triage forward / reject、業務責任者: approve / send-back)、Prototype mode label
7. **遷移**: forward → 業務責任者 queue、approve → state 変更 + compiled 昇格 reflect + reflected case の Alert UI 適用範囲 1 trigger
8. **mock data 依存**: `mock-knowledge.ts` (staging + compiled) + `mock-cases.ts` (source_case list) + 新規 proposal mock state
9. **Day 11+ 実装メモ**: SoD enforcement (Queue owner ≠ Approver) は mock data 上で人物表記分離のみで簡略化 (DOC-APP-02 §9.8 / Type A SoD 既定方針)。Hero 2 (Demo Chapter 2 主画面、AI 提案 → 手順承認 の体験)

### 4.6 AgentSettings (`/agents/:id`)

1. **画面 ID**: SCR-06 AgentSettings
2. **目的**: AI 管理者が agent の model / prompt / tool / 権限 / Trust Level 設定を確認・変更し、設定承認を申請する
3. **主要ユーザー**: AI 管理者 (R + A propose) / 業務責任者 (Type C co-A、Automation Maturity 関連)
4. **主要 action**: 設定編集 → 設定承認申請 (Type A/B/C 区分自動判定)、TrustLevelBadge 表示
5. **状態**: `viewing` / `editing` / `submitting-approval` / `approval-pending` (Type B/C で co-A 待ち)
6. **表示要素**: PageHeader (agent_id + agent_version + workflow + TrustLevelBadge)、Model / Prompt / Tool / 権限 / Trust Level の 5 section、各 section の現状値 + 編集 form、change-summary panel (diff preview)、Type 判定結果 badge (A / B / C)、submit-approval button、Prototype mode label
7. **遷移**: submit → 設定承認 queue (mock state)、approval-pending 中は read-only
8. **mock data 依存**: `mock-agents.ts` (agent metadata + 現状設定) + `_meta.yaml` 由来の `agent_version`
9. **Day 11+ 実装メモ**: Type 区分判定 logic は mock 簡略化 (model 変更 → B、Trust Level 変更 → C、それ以外 → A)。TrustLevelBadge は shared component (`prototype/src/components/shared/TrustLevelBadge.tsx`)

### 4.7 AuditTrail (`/audit`)

1. **画面 ID**: SCR-07 AuditTrail
2. **目的**: Auditor / 業務責任者 / Manual 管理者 / AI 管理者 が全 case / proposal / approval / diff の event timeline を時系列で trace する
3. **主要ユーザー**: Auditor (read all)、他 role は限定 read
4. **主要 action**: filter (workflow / event type / date range) + 個別 event click で詳細展開
5. **状態**: list view / detail expanded
6. **表示要素**: PageHeader、filter chips (workflow / event type / role / date range)、event timeline (icon + event type + actor + timestamp + summary)、expanded event panel (15-row event model from DOC-KNW-04 §8、paired field 含む実 field 数 18、特に `compiled_knowledge_citation_ids` と `diff_id` link で関連 entity navigation)、**過去 case 関連ルール更新 Alert UI 適用範囲 2** (timeline 上で「YYYY-MM-DD に [手順名] が更新されました (本 case 処理時の版は当時のまま保持)」を inline 表示、§6.2 参照)、Prototype mode label
7. **遷移**: event detail expand、diff_id link → 該当 proposal page、citation_id link → KnowledgeBrowser
8. **mock data 依存**: `mock-audit.ts` (15-row event model schema、paired field 含む実 field 数 18、sample events 含む) + 全 mock data の cross-reference
9. **Day 11+ 実装メモ**: event model schema (15 行、paired field 含む実 18 field) は `prototype/src/types/audit.ts` で TypeScript type 定義 (DOC-KNW-04 §8 と整合)

### 4.8 Metrics (`/metrics`) [Hero 3]

1. **画面 ID**: SCR-08 Metrics
2. **目的**: 業務責任者 / AI 管理者 / Auditor が KPI / KRI dashboard を観測し、Automation Maturity 進化判断材料を得る
3. **主要ユーザー**: 業務責任者 / AI 管理者 / Auditor (read)
4. **主要 action**: 期間 filter / 業務 filter / KPI 個別 drilldown
5. **状態**: dashboard view / KPI detail view
6. **表示要素**: PageHeader、4 KPI multi-criteria gate card 群 (AI 入力承認率 / 人手上書き率 / Alert 発生率 / 承認者差戻し率、各 card に target hypothesis ≥ 99% / ≤ 1% / ≤ 5% / ≤ 1% + 仮値 caption + sparkline)、**全 KPI 数値に `[仮説 / 要検証]` ラベル必須** (DOC-MON-05 Day 9 起稿予定 SSOT)、9 KRI summary (Alert badge style)、業務別 trend chart、Prototype mode label
7. **遷移**: KPI card click → drilldown view (期間 / 業務 breakdown)
8. **mock data 依存**: `mock-metrics.ts` (KPI / KRI sample data、すべて `[仮説]` caption 付き)
9. **Day 11+ 実装メモ**: 「本番導入可否を判定する gate ではない、Phase 1 で測定・再設定する検証仮説」注 (Plan v1.4 P0-2 / v1.4.1 Fix 2) を PageHeader 直下に必ず表示。Hero 3 (Demo Chapter 2 終盤、4 KPI 仮閾値の説明画面)

### 4.9 KnowledgeBrowser (`/knowledge` or `/workflows/:slug/knowledge`)

1. **画面 ID**: SCR-09 KnowledgeBrowser
2. **目的**: 全 role が業務別の staging / compiled knowledge snippet 一覧を閲覧、source_case / category / weight で絞り込む
3. **主要ユーザー**: 全 role (read access)、Manual 管理者は staging triage の入口としても使う
4. **主要 action**: filter (workflow / category / weight / date range)、snippet click で詳細展開
5. **状態**: list view / detail expanded
6. **表示要素**: PageHeader、business / category / weight filter chips、snippet list (frontmatter 8 field の date / workflow_id / category / weight + body 抜粋)、weight インジケータ (`low` 灰色 dot / `medium` amber dot / `high` emerald dot、§9.2 と整合)、detail panel (frontmatter 全体 + body markdown render + source_case link)、Prototype mode label
7. **遷移**: source_case link → CaseReview、Manual 管理者は staging snippet から「triage / forward to ProposalReview」action 可能
8. **mock data 依存**: `mock-knowledge.ts` (staging + compiled、frontmatter 8 field 準拠)
9. **Day 11+ 実装メモ**: weight 表現は §9.2 (Staging UI pattern) と整合。`data_error` category snippet は「runtime citation 対象外」badge を表示 (DOC-FW-01 §3.5、DOC-KNW-04 §4.5)

## 5. ナビゲーション + AppShell 構造

- **Sidebar (left)**: Dashboard / Inbox / ProposalReview queue (counter badge) / AgentSettings list / AuditTrail / Metrics / KnowledgeBrowser
- **Header (top)**: PageBreadcrumb (left) + StatusBadge + **Prototype mode label** (UserMenu 左隣、§8 参照) + UserMenu (right)
- **BottomNav (mobile fallback、scope-out 候補)**: 主要 5 画面 (Dashboard / Inbox / ProposalReview / Metrics / Knowledge)
- **Route SSOT**: `prototype/src/App.tsx` で React Router v6 にて 9 画面 + `/cases/:id/comment` をマウント

## 6. AiProposalPanel 過去 case 関連ルール更新 Alert UI 仕様 (3 適用範囲)

DOC-FW-01 §6.3 「過去 case は遡って書き換えない + 関連ルール更新 Alert」の UI 実装。3 適用範囲を分離:

### 6.1 適用範囲 1: 未承認・承認待ち case (CaseReview 内 AiProposalPanel)

- **配置**: `AiProposalPanel` 最上部、citation list の前 (banner Alert 形式)
- **文言**: 「**関連手順が更新されています** / このcase作成後に承認されたルールがあります / AI提案本文は当時のまま保持されています」
- **色 token**: `bg-amber-50` + `border-amber-200` + `text-amber-800` (warning tone、critical ではない)
- **icon**: `AlertCircleIcon` (lucide、amber-600)
- **dismiss**: user dismissible (close icon)、`auto-hide なし`、reload で再表示
- **link**: 「更新内容を見る」→ 該当 ProposalReview page

### 6.2 適用範囲 2: 承認済み過去 case (AuditTrail)

- **表示位置**: `/audit` page timeline、該当 case event の inline
- **形式**: timeline event として inline 表示 (banner ではない、event row 配下に nested item)
- **文言**: 「YYYY-MM-DD に [手順名] v0.X が承認されました (本 case 処理時の版は当時のまま audit trail に保持)」
- **link**: 該当 procedure version の diff 画面へ (proposal_id link)

### 6.3 適用範囲 3: 新規 case (AiProposalPanel citation list)

- **表示位置**: AiProposalPanel citation list 内
- **形式**: 通常 citation として表示 (Alert なし、§9.2 weight インジケータで `high` 表示)
- **文言**: 「[手順名] v0.2 (承認 YYYY-MM-DD)」
- **link**: KnowledgeBrowser 該当 compiled snippet

### 6.4 mock data 連携

`prototype/src/data/mock-cases.ts` の過去 case AI proposal 本文は **不変** (DOC-FW-01 §6.3)、関連 procedure_version_diff のみ追加。`mock-audit.ts` の state transition log で「いつ どの workflow / agent-instructions / approval-policy 版が適用された case か」を明示し、関連 case の Alert source を提供する。

## 7. BusinessApprovalChip 仕様

承認者画面 (`/business-approval`) は本 v2 prototype では画面化しない (DOC-OV-00 §3 scope-out)。代わりに:

- **CaseReview** footer に `BusinessApprovalChip` を表示
- **表示内容**: 「業務承認: 承認者 [mock 氏名] - 承認待ち / 承認済み」+ 状態 badge
- **click action**: `demo/static-mocks/business-approval-view.html` を browser tab で開く (slide-only static mock、design token は本 doc と整合、Day 20 実体化)
- 本 prototype 内では実承認 flow は実装しない (mock state 切替のみ)
- a11y: button role、aria-label「業務承認画面 (slide-only mock) を開く」

## 8. Prototype mode label spec (必須、Plan v1.4 P0-3 / v1.4.1 Fix 5)

全画面共通 persistent pill。Plan v1.4.1 Fix 5 で CLAUDE.md / 00-overview.md にも条件追記済。

- **配置**: AppShell header right (UserMenu 左隣)
- **文言**: 「**プロトタイプ表示 — 外部システム未接続 / 証跡はモック**」
- **色 token**: `bg-slate-100` + `text-slate-600` + `border-slate-200` (muted、警告色は使わない)
- **typography**: `text-xs` + `font-medium`
- **shape**: pill (rounded-full + px-3 py-1)
- **hover で expanded tooltip**:
  > 本 prototype は in-memory mock state です。永続化なし / 外部システム未接続 / 実顧客データ未使用 / 実規制 cite なし
- **a11y**: `role="status"` + `aria-label="prototype mode indicator"` + tooltip は `aria-describedby` で関連付け
- **必須対象**: 9 画面全部 + `BusinessApprovalView` static mock (`demo/static-mocks/business-approval-view.html`)

実装: `prototype/src/components/shared/PrototypeModeLabel.tsx` に集約 (1 file 1 component、CLAUDE.md File 編集 hygiene 準拠)。

## 9. Staging knowledge runtime usage rules の UI 表示 pattern (Plan v1.4 P0-1 / v1.4.1 Fix 1)

DOC-FW-01 §3.5 (staging safety boundary) + DOC-ROOT-\_SSOT §1.4「staging knowledge の runtime 利用範囲」を UI 表示として実装。

### 9.1 staging hint 表示位置 (CaseReview / AiProposalPanel)

- `AiProposalPanel` 内、citation list の下に **「未承認ヒント (staging knowledge)」** section を分離配置
- citation list と視覚的に分離: 灰色 border + 「**未承認**」badge + dotted divider
- 文言例: 「過去に同種差戻し履歴あり: [snippet 抜粋 (200 chars)]」+ weight インジケータ (§9.2)
- footer: 「これらは未承認ヒントです。AI が citation する根拠としては使用していません。」

### 9.2 weight インジケータ (KnowledgeBrowser + AiProposalPanel 共通)

| weight   | 視覚 (dot + label)                                     | 利用範囲                                                              |
| -------- | ------------------------------------------------------ | --------------------------------------------------------------------- |
| `low`    | 灰色 dot (`bg-slate-400`) + 「未承認」                 | staging。confidence 低下シグナル / hint / 追加確認質問 trigger に限定 |
| `medium` | amber dot (`bg-amber-500`) + 「レビュー済み (未承認)」 | reviewed staging。citation 対象外、low と同等扱い                     |
| `high`   | emerald dot (`bg-emerald-600`) + 「承認済み」          | compiled approved。citation 根拠として使用可                          |

### 9.3 confidence 低下シグナル (CaseReview header)

- AI proposal の confidence が staging 領域に依存する場合、`AiProposalPanel` header に warning chip を表示
- 文言: 「**低 confidence**: 未承認領域に該当する case のため、確認をお願いします」
- 色: `bg-amber-50` + `text-amber-800` (warning、§6.1 Alert UI と同 tone)

### 9.4 追加確認質問 trigger

- staging hint がある case で、AI が「以下の確認をお願いします: [質問文]」を proposal 内に**質問 section**として表示
- 入力者が質問に回答すると、回答内容は新 staging knowledge として記録される (`mock-knowledge.ts` 連携)

### 9.5 compiled / staging conflict 解決の UI 表示

- 同一 workflow 内で compiled と staging が矛盾する場合、UI 上で Manual 管理者に Alert
- 配置: `KnowledgeBrowser` page 上部に banner Alert (red tone、§6 Alert より高優先度)
- 文言: 「**conflict 検出**: compiled と矛盾する staging があります ([snippet link])。compiled が runtime 優先されます。triage が必要です」
- link: ProposalReview triage 画面へ

### 9.6 `data_error` 例外表示

- `data_error` category の staging snippet は KnowledgeBrowser で「**runtime citation 対象外**」badge (灰色) を表示
- AiProposalPanel には表示されない (runtime 参照外)
- 詳細 routing は DOC-KNW-04 §4.5

## 10. Component 集約方針 (`prototype/src/components/shared/`)

CLAUDE.md File 編集 hygiene 準拠で 1 file 1 component。複数 page で再利用される shared component:

| Component               | 用途                                                | 利用画面                                      |
| ----------------------- | --------------------------------------------------- | --------------------------------------------- |
| `PrototypeModeLabel`    | §8 全画面共通 pill                                  | 9 画面 + BusinessApprovalView mock            |
| `AiProposalPanel`       | citation list + staging hint + Alert UI (§6.1 / §9) | CaseReview                                    |
| `BusinessApprovalChip`  | §7、承認者画面 mock 起動                            | CaseReview                                    |
| `TrustLevelBadge`       | Trust Level 視覚化                                  | AgentSettings、Metrics、Inbox                 |
| `WeightIndicator`       | §9.2 weight dot + label                             | KnowledgeBrowser、AiProposalPanel             |
| `StatusBadge`           | case / proposal / approval state visualization      | Inbox、CaseReview、ProposalReview、AuditTrail |
| `PageHeader`            | breadcrumb + title + actions                        | 全 9 画面                                     |
| `KpiCard` / `Sparkline` | §4.8 Metrics 表示                                   | Metrics、Dashboard                            |

1-off component は inline で書く (集約しない)。

## 11. Mock data initial files

`prototype/src/data/` に以下 5 file (Day 11 morning scaffolding で空 schema + 1-2 sample):

- `mock-cases.ts`: case list + detail (state / 履歴 / Alert)
- `mock-knowledge.ts`: snippet list (staging + compiled、frontmatter 8 field 準拠)
- `mock-agents.ts`: agent metadata (`_meta.yaml` 由来) + 現状設定
- `mock-audit.ts`: 15-row event model (DOC-KNW-04 §8、paired field 含む実 field 数 18) + sample events
- `mock-metrics.ts`: 4 KPI + 9 KRI sample (すべて `[仮説]` caption 付き)

mock data は restricted boundary pack (国際送金) を含めない (DOC-OV-00 §3 / `workflows/_index.md` §1 と整合)。

## 12. a11y / responsive 方針

### 12.1 a11y (Lighthouse 90+ 目標、Day 18 gate)

- 全 interactive element に `aria-label` / `aria-describedby`
- color contrast: WCAG AA (4.5:1 body、3:1 large text)
- keyboard navigation: Tab / Shift+Tab / Enter / Space で全 action 到達可能
- focus ring: `ring-2 ring-indigo-500 ring-offset-2`
- Prototype mode label は `role="status"` で screen reader にも通知 (§8)

### 12.2 responsive

- desktop first (1280+ px target)、tablet (768-1279 px) でも崩れない
- mobile (< 768 px) は scope-out (BottomNav は将来検討)

## 13. 関連文書

- DOC-OV-00 §2.3 (UI scope 概要、9 画面 ALL 95% target equal)
- DOC-FW-01 §3.5 (staging knowledge runtime safety boundary、§9 と整合)
- DOC-FW-01 §6.3 (過去 case 関連ルール更新 Alert、§6 と整合)
- DOC-APP-02 §3 (手順承認 RACI、§4.5 ProposalReview と整合)
- DOC-APP-02 §9.8 (Role × 画面 access matrix、Phase 1 hand-off memo)
- DOC-KNW-04 §4 (5-category routing、§4.3 SendBackComment と整合) + §8 (audit event model、§4.7 AuditTrail と整合)
- DOC-MON-05 (4 KPI 仮閾値 + 7 KPI + 9 KRI、Day 9 起稿予定、§4.8 Metrics SSOT)
- DOC-S4-06 (Session 4 narrative、Slide 3 BusinessApprovalView mock figure spec)
- DOC-ROOT-\_SSOT §1.4 (Snippet schema SSOT、§9.2 weight インジケータと整合) + §1.5 (接続方針 control matrix)
- `~/.claude/plans/ai-backoffice-ai-virtual-muffin.md` Plan v1.4 P0-1 / P0-3 / P1-1 + v1.4.1 Fix 3 / Fix 5
