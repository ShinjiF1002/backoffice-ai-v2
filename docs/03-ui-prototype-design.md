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
| 改版履歴        | v0.1 (2026-05-28): 初版作成 (Day 8、Plan v1.4 P1-1 + P1-5 (audit event reference) + v1.4 P0-3 / v1.4.1 Fix 3 / Fix 5 反映)。v0.2 (2026-05-28): CR R10+R11 hygiene patch (§4.1 「Hero 起点」→「Demo Chapter 1 起点」 / §10 AiProposalPanel utilizers から ProposalReview 削除 / §4.7 audit event「15 field」→「15-row (paired field 含む実 18)」paraphrase)。v0.3 (2026-05-29): CR R12+R13 hygiene patch (Major 2「Day 9 起稿予定」stale pointer 解消、§4.8 Metrics + §13 関連文書 で DOC-MON-05 を実 path pointer に置換)。v0.4 (2026-05-30): Day 10.1 hygiene patch (CR R15 反映、§4.1 Hero polish drift 解消「Hero 1-3 polish target equal」→「9 画面 ALL polish target equal、Hero 1-3 label は demo sequence indicator のみで polish target ではない」、Plan v1.4.1 Fix 3 / v1.4.2 Rule 6 と整合化、関連 P1)。v0.5 (2026-05-31): Day 11 Step 2 visual direction lock (CR R18+R19+R20 統合 = 4 AI converged: Operational Premium Light section §2.7 新規追加 [3 reference mockup paths / composition rules / design token / UI label vs component name 分離原則 / 9-screen routing 明確化]、§2.6 chip ripple radial gradient overlay → subtle press feedback に置換 [装飾 gradient scope-out]、§5 Route SSOT 表記 「9 画面 + /cases/:id/comment」→ 「exactly 9 page route」明確化、Day 11 Step 3-4 scaffolding + CaseReview 実装 anchor SSOT 確定) |

---

## 1. 概要

本 doc は v2 prototype の **UI 設計 SSOT**。Stripe 風の高密度・高信頼 SaaS UI を 9 画面で構成、Wireframe → medium-fi → high-fi の 3 段階で詳細化する。

- **9 画面 ALL 95% target equal** (Hero 3 区分は `demo-script` (Day 20) の画面遷移順序としてのみ残し、polish target には適用しない、v1.4.1 Fix 3 / v1.4.2 Rule 6)
- React 19 + Vite 8 + Tailwind v4 (in-memory mock state、永続化なし、Day 11 Step 3 では custom component で進行、shadcn/ui は未導入 = Day 14 以降必要時に判断)
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

duration: `duration-150` (instant feedback) / `duration-250` (default) / `duration-400` (heavy transition)。real-time guarantee 風表現は使わない (DOC-ROOT-\_SSOT の表現規範参照、real-time 風表現の exact list は `docs/prior-art-map.md` 参照)。

### 2.6 マイクロインタラクション 8 例 (Day 16-18 high-fi で実装)

1. **button hover scale**: `transform scale-100 → scale-[1.02]`、`duration-150 ease-out`
2. **card hover lift**: `shadow-sm → shadow-md`、`duration-250 ease-out`
3. **status badge color transition**: background + text color、`duration-250`
4. **form submit feedback**: loading spinner → check icon、`duration-400`
5. **toast slide-in**: top-right、`translate-y-[-100%] → translate-y-0`、`duration-250 ease-out`
6. **tooltip fade**: `opacity-0 → opacity-100`、`duration-150`、`delay-150` で hover 確定
7. **accordion expand**: `h-0 → h-auto` (実際は `max-h-0 → max-h-screen`)、`duration-250 ease-out`
8. **chip press feedback**: subtle outline + `bg-opacity-90` for `duration-150` on click (NO radial gradient / NO ripple decoration、Operational Premium Light 規範: 装飾 gradient effect は scope-out)

## 2.7 Operational Premium Light (Day 11 visual direction lock、4 AI CR converged)

Day 11 Step 1 で 3 reference mockup を ChatGPT 画像生成で並列生成、4 AI review (3 別 AI + 自己評価) すべて Direction B (Stripe + Controlled operational heterogeneity) を primary と判定、Image 3 の citation governance + Image 1 の diff block を hybrid composition で取り込み。**Direction name = "Operational Premium Light"**。装飾 Wow ではなく、**統制・証跡・AI 判断・承認状態が一目で分かる operational Wow** を狙う。

### 2.7.1 3 reference mockup paths (Day 11 Step 1 成果物)

- **Primary**: `docs/design-references/day-11-visual-direction-lock/direction-b-controlled-operational-heterogeneity-PRIMARY.png` (Stripe restraint base + per-column heterogeneity)
- **Citation boundary borrow**: `docs/design-references/day-11-visual-direction-lock/direction-c-linear-dense-light.png` (compiled approved only + citation 対象外 separation)
- **Diff block borrow**: `docs/design-references/day-11-visual-direction-lock/direction-a-stripe-operational-restraint.png` (old/new address red/green inline diff)

### 2.7.2 Composition rules (Day 11+ 実装 anchor)

| 要素 | Source reference | 実装方針 |
| ---- | ---------------- | -------- |
| 3-column CaseReview layout | Primary | 左 AI 入力 / 中央 証跡 timeline / 右 AI Proposal panel |
| 証跡 timeline rail | Primary + Citation borrow | CaseReview 中央 column 主役、PDF / OCR / マスタ照合 を timeline rail (6-8px dots + 1px line) で表示 |
| 住所 diff highlight | Diff borrow | 旧住所 (red strikethrough) / 新住所 (green underline) を inline char-level 表示、AddressDiffBlock primitive |
| Citation panel (高 only) | Citation borrow | 見出し `引用根拠 — 承認済みナレッジのみ`、weight badge "high" の compiled knowledge のみ表示 |
| Staging hint panel (low/medium 分離) | Citation borrow | 見出し `未承認ヒント — citation 対象外`、別 background tint (#F1F5F9) で視覚分離、weight badge "low" / "medium"、`citation 対象外` ラベル明示 |
| 関連手順更新 Alert (過去 case Alert UI) | Citation borrow | 別 amber banner、citation panel + staging hint とは視覚的に独立 (§6 Alert UI 3 適用範囲) |
| BusinessApproval chip | Primary + Diff borrow | sticky bottom action bar の右端、UI 表示文言は **`業務承認: 承認待ち`** または **`業務責任者承認`** (component 名 `BusinessApprovalChip` は internal、UI 表示には出さない) |
| Prototype mode label | All references | AppShell header right pill 常時表示 |
| Case lifecycle stepper | Primary (訂正後) | **`受付 → AI 処理 → 入力者確認 → 承認者承認 → 反映`** のみ (current step は indigo dot + font-semibold で UI 表示、`LifecycleStepper.tsx` SSOT、Day 11.3 #5d で旧 text indicator (bracketed inline marker) から訂正済)。**`手順承認` は current case stepper に含めない** (手順承認は別 flywheel / Proposal loop = §6 Alert UI 適用範囲 3 で別 entry point として表示) |

### 2.7.3 Design token (Operational Premium Light、§2.1-§2.6 と整合)

- **Background**: `slate-50` (#F8FAFC) app shell base、white (#FFFFFF) panel surface
- **Border / Surface separation**: 1px hairline (#E5E7EB) を panel separation の primary tool、shadow は restrained (shadow-sm 程度) のみ
- **Primary**: indigo (#635BFF) — CTA / status / focus
- **Success / citation high**: emerald (#10B981) — compiled approved citation badge
- **Alert**: amber (#F59E0B) — Alert chip / 関連手順更新 banner
- **Error / delete diff**: red (#DC2626) — Alert critical / diff strikethrough
- **Radius**: `--radius-card: 8px` / `--radius-control: 6px` (大丸角 16-24px は scope-out、Operational density 維持)
- **Typography**: Inter (en) + Noto Sans JP (jp) mixed、headings text-2xl semibold、body text-sm regular、monospace (JetBrains Mono) for case_id / weight / version / numeric data / timestamps / source paths
- **Density**: medium-high tabular、24/32 px grid、operational dashboard density
- **Motion**: 150-250ms subtle hover / focus / status transition のみ、装飾 gradient / ripple は scope-out

### 2.7.4 UI label vs component name 分離原則 (CR R20 Major Fix 3)

| Internal component name | UI 表示文言 (user-facing) |
| ----------------------- | -------------------------- |
| `BusinessApprovalChip` | `業務承認: 承認待ち` / `業務責任者承認` |
| `AiProposalPanel` (heading) | `AI 提案` |
| `CitationPanel` (heading) | `引用根拠 — 承認済みナレッジのみ` |
| `StagingHintPanel` (heading) | `未承認ヒント — citation 対象外` |
| `EvidenceTimeline` (heading) | `証跡` |
| `ConfidenceBar` | (label なし、視覚的 indicator のみ) |
| `StatusBadge` | (case 状態の Japanese 文言: `入力者確認待ち` / `承認者承認待ち` / `反映済` 等) |
| `PrototypeModeLabel` | `プロトタイプ表示 — 外部システム未接続 / 証跡はモック` |

**原則**: Component 名 (`BusinessApprovalChip` 等) は実装 internal にのみ存在、user-facing UI には出さない。`docs/03` 本文 + Screen Card 内の component 名は **implementation reference**、UI に出す表示文言は本 §2.7.4 table で SSOT 化。

### 2.7.5 9-screen routing 明確化 (CR R20 Major Fix 6)

`prototype/src/App.tsx` は **以下 9 page component を React Router v7 にて exactly 9 routes でマウント**:

1. `Dashboard` (`/dashboard` または `/`)
2. `Inbox` (`/inbox`)
3. `CaseReview` (`/cases/:id`)
4. **`SendBackComment` (`/cases/:id/comment`)** ← 9 画面の 1 つ、CaseReview の子 detail route として実装、**ただし 10 番目の独立画面ではなく 9 画面 polish target equal 内の 1 つ**
5. `ProposalReview` (`/proposals/:id`)
6. `AgentSettings` (`/agents/:id/settings`)
7. `AuditTrail` (`/audit`)
8. `Metrics` (`/metrics`)
9. `KnowledgeBrowser` (`/knowledge`)

**10 番目の画面 (例: BusinessApprovalView の route 化、Cases queue の独立画面等) は禁止** (Plan v1.4.1 Fix 3 / v1.4.2 Rule 6 「9 画面 ALL 95% target equal」に整合)。

`BusinessApprovalView` は `demo/static-mocks/business-approval-view.html` (Day 20 起稿) として static mock のみ、React route 対象外。CaseReview footer の `BusinessApprovalChip` click で別 tab で開く。

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
5. **状態**: `pending` (AI 処理中) / `ready` (入力者確認待ち) / `sent-back` (再処理中) / `business-approval-waiting` (承認者送出済) / `reflected` (反映済、Day 11.3 訂正で追加された 5 番目の lifecycle 状態、Inbox queue では完了後 N 時間以内のみ可視想定)
6. **表示要素**: case list table (workflow / case_id / 状態 badge / 経過時間 [status 連動 SLA tint、Day 12.2 CR R28 M1] / 担当者 [Day 12 追加、ai-operator paper の queue assignment SSOT と整合] / 注意 chip [alertCount > 0 のみ amber-soft、CaseReview register と統一、Day 12.1 CR R27 P2])、filter (業務 / 状態 / 担当者 / 経過時間 の 4 chip、Day 12 で 2 → 4 拡張)、sort (受付順 / 経過時間順)、footer (一括承認 / 一括差戻し disabled wireframe + 件数 summary、Day 14-15+ で interactive 化)、PageHeader、Prototype mode label
7. **遷移**: case row click → `/cases/:id`、filter / sort interaction
8. **mock data 依存**: `mock-cases.ts` (case list)
9. **Day 11+ 実装メモ**: Wireframe で table layout + filter chip + 状態 badge 配置確定。Demo Chapter 1 開始画面 (9 画面 ALL polish target equal、Hero 1-3 label は demo sequence indicator のみで polish target ではない、本画面は demo 起点として遷移順序上の意味のみ)。Screen Card 旧 "progress" 列は Day 12 で 担当者 列に置換 (mini-stepper による進捗可視化は Day 14-15 medium-fi で別途検討、現状の Inbox grammar は status badge + 経過列 SLA tint で進捗 signal を 2 軸で表現)

### 4.2 CaseReview (`/cases/:id`) [Hero 1]

1. **画面 ID**: SCR-02 CaseReview
2. **目的**: 入力者が AI 入力結果 + 証跡 + ナレッジ citation を見て、承認 / 差戻しを判断する
3. **主要ユーザー**: 入力者 (主)、承認者 (read)
4. **主要 action**: 承認 / 差戻し (5-category 選択 → SendBackComment 遷移) / BusinessApprovalChip click
5. **状態**: `ready` / `sent-back` / `approved` / `business-approval-waiting`
6. **表示要素**: PageHeader (case_id + workflow + 状態 badge + LifecycleStepper)、case alert strip (LifecycleStepper 直下、Day 11.3 #3a で構造移動、case-level alerts 専用)、左 panel (AI 入力結果 + 編集可能 form)、中 panel (PDF preview / `EvidenceTimeline` = 4 step rail + per-step mono metadata `actor · source · conf`、alerts は除外)、右 panel (`AiProposalPanel` = `RelatedRuleAlert` 最上部 + citation list + staging hint、Alert UI 適用範囲 1)、footer (承認 / 差戻し ボタン + `BusinessApprovalChip`)、Prototype mode label
7. **遷移**: 差戻し click → `/cases/:id/comment`、承認 click → state 変更 + Inbox queue 戻る、`BusinessApprovalChip` click → static mock new tab
8. **mock data 依存**: `mock-cases.ts` (case detail) + `mock-knowledge.ts` (citation list) + `mock-audit.ts` (state transition log)
9. **Day 11+ 実装メモ**: AiProposalPanel は §6 Alert UI と §9 Staging UI pattern を組み込む。Hero 1 (Demo Chapter 1 主画面)

### 4.3 SendBackComment (`/cases/:id/comment`)

1. **画面 ID**: SCR-03 SendBackComment
2. **目的**: 入力者が差戻し理由を 5-category + free-text で送信する
3. **主要ユーザー**: 入力者
4. **主要 action**: 5-category 選択 + コメント入力 + 送信 → staging knowledge 生成
5. **状態**: `composing` (Day 12 Page 4 wireframe phase、`useState` で category default `misunderstanding` / comment empty / evidenceSelected empty array)、`submitting` → `submitted` transition は Day 14-15+ で AppContext 経由 staging 反映 + toast feedback
6. **表示要素**: Sticky PageHeader (breadcrumb 3-level 受信トレイ › CASE-ID › 差戻しコメント + h1 + workflow chip + StatusBadge + 経過 + LifecycleStepper)、案件概要 card (AI 入力結果 4 field + 案件レビュー戻り link)、5-category radio (5 分類: 誤読 / UI 差異 / 境界条件 / 判断境界 / 入力誤り、enum identifier は user UI 非露出 = JP label + 1-line description のみ表示、CR R37 B1 反映)、`data_error` 選択時 amber warning banner (conditional)、差戻し理由 textarea (resize-y + 文字数 counter)、関連根拠 checklist (`case.evidence` から動的、name + timestamp のみ表示、CR R38 で actor·source identifier 削除 = CaseReview EvidenceTimeline 主役 vs SendBackComment checklist 補助 の責務分離)、Sticky footer (キャンセル real navigate + 差戻しを記録 disabled wrapper span title pattern)、Prototype mode label (AppShell 経由)
7. **遷移**: Day 12 wireframe では submit button disabled (キャンセル real navigate `/cases/:id` のみ、wrapper span title pattern で送信動作 scope-out signal)、Day 14-15+ で submit → toast 「差戻しを記録しました (未承認ナレッジに反映)」+ CaseReview 戻る
8. **mock data 依存**: `mock-cases.ts` (case context、`getCaseById` で AI 入力結果 + evidence 動的)、Day 12 wireframe は composing のみ・新規 mock state なし、新規 mock state (差戻し送信 → staging 反映、同一セッション内) は Day 14-15+ AppContext 経由
9. **Day 12 Page 4 実装注記** (commit `5a82838` + CR R37 patch + CR R38 patch): **CR R37 1 次 localization**: JP-only first principle で user-facing 内部語 (`log` / `audit` / `routing` / `staging knowledge` / `compiled` / `evidence` / `field`) を localize (記録・監査用別経路 / 未承認ナレッジ / 根拠 / 項目)、enum identifier (`misunderstanding` 等) も radio UI から削除。**CR R38 2 次 localization** (R37 patch 後の残留 internal pipeline 用語 cleanup): `data_error` radio description は判別言語のみ (`印字ミス、記入漏れ、不鮮明スキャン 等`) に圧縮 = 選択結果の routing 判定 (AI 責 / 別経路 / 昇格対象外) は warning banner に集約 (責務分離) / textarea sub-caption 「AI 日次分析の未承認ナレッジ候補になります」削除、SSOT 未規定の独自付加を解消 / 関連根拠 sub-caption 「監査記録で未承認ナレッジ候補に紐付け」削除、audit trail internal mental model 露出を解消 / 関連根拠 checklist 内 `{ev.actor} · {ev.source}` (`intake.pdf-upload-v1` / `ocr-engine-v2.3` / `db.address_master` / `ai.address-extractor-v2.3` 等 system identifier) を非表示、CaseReview EvidenceTimeline 主役 vs SendBackComment checklist 補助 で責務分離 (CaseReview §4.2 の actor·source grammar は主役 timeline として keep) / warning 主文 「AI 責ではない判定です」 → 「AI の学習対象になりません」 paraphrase、詳細は本文継続 / 差戻しを記録 button title scope-out 重複解消、footer caption「送信動作は次の実装段階で対応」を実装段階 signal の単一表現とし、button title は将来機能説明「差戻し理由を記録し AI の改善材料に反映」のみ。docs SSOT 内の governance term は internal context のため keep (CR R37 B1+B2+M1 + CR R38 B1+B2+B3+B4+M1+M3 反映)。`data_error` 選択時 warning は DOC-KNW-04 §4.5 と整合

### 4.4 Dashboard (`/dashboard` または `/`)

1. **画面 ID**: SCR-04 Dashboard
2. **目的**: 入力者 / 承認者 / 業務責任者が複数業務 (UC-BO-01 + UC-BO-02) の進捗 + 注意 + 承認待ちを俯瞰する。Demo Chapter 1/2 の入口でもある
3. **主要ユーザー**: 全 role (read access)
4. **主要 action**: 業務 card click → 業務別 Inbox (`/inbox?workflow=...` で workflow filter 適用)、attention strip 注意 click → 該当 CaseReview、workflow lane 5 node click → 各 page route
5. **状態**: 業務 active / busy / quiet (alert 比率 + sent-back 件数で 3 段階分類、wireframe 段階の placeholder heuristic [仮説 / 要検証]、Day 14-15 で thresholds 精緻化)
6. **表示要素**: PageHeader (breadcrumb ダッシュボード + h1 + 案件数 / 注意 / 承認待ち の 3 compact chip + UC-BO-01 + UC-BO-02 [仮説 / 要検証] meta)、(任意) attention strip (queue-level 注意 1 本まで、CaseReview の case alert strip と register 統一)、業務 card grid (UC-BO-01 + UC-BO-02 並列、各 card に business id + 業務名 + state chip [要注意 / 通常稼働 / 静穏] + 3 metric [案件数 / 注意 / 承認待ち] + 5 status breakdown [AI 処理中 / 入力者確認待ち / 再処理中 / 承認者承認待ち / 反映済] + 直近 7 日件数推移 sparkline [仮説 / 要検証] + CTA Link)、workflow lane (Demo Chapter 1+2 動線、5 node: 受信トレイ → 案件レビュー → コメント付き差戻し → AI 提案レビュー → メトリクス確認、各 node 実 route Link で enabled no-op 0)、footer (mock state + 次の実装段階 scope、PrototypeModeLabel と内容重複なし)。**国際送金は restricted boundary pack のため card / metric / sparkline / attention 全て表示しない** (DOC-OV-00 §3、`workflows/_index.md`)。PrototypeModeLabel は AppShell TopBar 経由で自動表示、本 page 内で重複しない
7. **遷移**: card click → Inbox `?workflow=` filter (Day 12 Page 3 で Inbox 側 useSearchParams + 業務 filter chip active state 実装で実機能化)、attention strip 確認 → 該当 CaseReview、workflow lane node → 該当 page
8. **mock data 依存**: `mock-cases.ts` (13 件、件数集計 + status breakdown + alertCount + businessApprovalStatus) + `mock-metrics.ts` (mockKpiHypotheses + Day 12 Page 3 で `mockWorkflowTrends` + `getWorkflowTrend` 追加、業務別 7 日件数推移 + alert ratio 7 日推移)
9. **Day 11+ 実装メモ**: 業務 card は 2 並列 (UC-BO-01 + UC-BO-02、国際送金は restricted boundary pack で表示しない原則を mock data から徹底)。Day 12 Page 3 で wireframe 実装、CaseReview / Inbox / ProposalReview と同 Operational Premium Light tokens + JP-only + mono cadence、Dashboard 固有 page-specific layout (3-column body は CaseReview 専用、Dashboard は 業務 card grid + workflow lane が主役)。Inbox 側 `?workflow=` filter 連携で card click 動線を enabled no-op なく実機能化 (Day 12 Page 3 で Inbox.tsx に useSearchParams + workflowFilter chip active state を minimal 追加)

### 4.5 ProposalReview (`/proposals/:id`) [Hero 2]

1. **画面 ID**: SCR-05 ProposalReview
2. **目的**: 手順管理者 (整理担当) / 業務責任者が AI が生成した Procedure Update Proposal を triage / 承認する
3. **主要ユーザー**: 手順管理者 (R = 整理担当、triage / forward / reject)、業務責任者 (A = 承認)
4. **主要 action**: triage → forward (業務責任者へ) / reject、業務責任者は approve / send-back
5. **状態**: `pending-triage` (手順管理者 action 待ち) / `forwarded` (業務責任者 action 待ち) / `approved` / `rejected`
6. **表示要素**: PageHeader (breadcrumb 受信トレイ › AI 提案レビュー › proposal_id + h1 提案 title + workflow chip + 状態 badge + 経過 + 「提案ソース: AI (日次分析)」annotation + ProposalLifecycleStepper [整理 → 承認 → 反映、Day 12.4 CR R31 M1])、左パネル 3 part (判定基準 [3-5 criterion × value / threshold 仮説 / met 判定]、元案件 [source_case link + 差戻し reason + 差戻し分類 chip JP / Day 12.4 CR R31 M3]、未承認ヒント [元 staging snippet、citation 対象外 panel inset、CaseReview StagingHintPanel と register 統一])、中パネル (summary + 提案 差分: workflow.md / agent-instructions.md / approval-policy.md の 変更前 / 変更後、border-l-2 hairline + tint /20 + 文書テキスト差分 明示 / Day 12.4 CR R31 M2、line-level diff highlight は Day 14-15 medium-fi で検討)、右パネル (RACI box: 提案ソース AI / R 手順管理者 + 整理担当 氏名 / A 業務責任者 + 承認者 氏名 / C SME・AI 管理者 / I 入力者・承認者 + 職務分離 (SoD) note + 提案メタ情報)、footer (Day 12 wireframe では disabled state、CR R28 lesson: enabled no-op 複製禁止、wrapper span title による per-button JP tooltip [Day 12.5 CR R32 Major 1]、status-conditional rendering [手順管理者: 差戻し / 業務責任者へ送付、業務責任者: 修正依頼 / 承認] は Day 14-15 で state machine 接続)、Prototype mode label は AppShell 経由
7. **遷移**: forward → 業務責任者 queue、approve → state 変更 + compiled 昇格 reflect + reflected case の Alert UI 適用範囲 1 trigger
8. **mock data 依存**: `mock-proposals.ts` (PROP-2026-031 seed、Day 12 Page 2 で新規作成、CR R29 sidebar seed ID 整合) + `mock-knowledge.ts` (staging + compiled) + `mock-cases.ts` (source_case list、Day 12.3 CR R30 で CASE-2026-0118 / 0095 を historical reflected として追加し source_case link 整合確保)
9. **Day 11+ 実装メモ**: SoD enforcement (整理担当 ≠ 承認者) は mock data 上で人物表記分離のみで簡略化 (DOC-APP-02 §9.8 / Type A SoD 既定方針)。Hero 2 (Demo Chapter 2 主画面、AI 提案 → 手順承認 の体験)。Day 12 Page 2 で wireframe 実装、CaseReview visual grammar 継承 (PageHeader + 3-column main + sticky footer + Operational Premium Light tokens + JP-only + mono cadence)。Day 12.4 CR R31 で ProposalLifecycleStepper / 差戻し分類 chip / 文書テキスト差分 hairline grammar / RACI 全 JP / 職務分離 (SoD) note を Page 2 完了形として lock、Day 12.5 CR R32 で SSOT / JSDoc 残りを閉じた

### 4.6 AgentSettings (`/agents/:id`)

1. **画面 ID**: SCR-06 AgentSettings
2. **目的**: AI 管理者が agent の model / prompt / tool / 権限 / Trust Level 設定を確認・変更し、設定承認を申請する
3. **主要ユーザー**: AI 管理者 (R + A propose) / 業務責任者 (Type C co-A、Automation Maturity 関連)
4. **主要 action**: 設定編集 → 設定承認申請 (Type A/B/C 区分自動判定)、TrustLevelBadge 表示
5. **状態**: `viewing` / `editing` / `submitting-approval` / `approval-pending` (Type B/C で co-A 待ち)
6. **表示要素** (Day 12 wireframe 実装実態、CR R42 で #6 を impl 同期): Sticky PageHeader (breadcrumb 3-level ダッシュボード › Agent 設定 › agent name + h1 + workflow chip + TrustLevelBadge compact + Agent 版数 mono)、Hero Trust Level の進化段階 (3-stage stepper + 4 KPI 進化要件 + 統制原則 caption + Trust Level 引き上げ申請 disabled wrapper span title)、Agent 構成 5 領域 read-only (Model / Prompt / Tool / 権限 / Trust Level summary、編集は閲覧のみ)、変更影響の事前確認 panel (Type A/B/C judgment mock 3 シナリオ click → 承認者 / co-A 要件 detail)、設定承認 履歴 (直近 3 件、Type chip A/B/C + 承認者 mono)、Sticky footer (ダッシュボード戻り link + 変更を申請 disabled wrapper span title)、Prototype mode label (AppShell 経由)。編集 form / change-summary panel (diff preview) / submit-approval button は Day 14-15+ で AppContext 経由 (interactive phase)
7. **遷移**: submit → 設定承認 queue (mock state)、approval-pending 中は read-only
8. **mock data 依存**: `mock-agents.ts` (agent metadata + 現状設定) + `_meta.yaml` 由来の `agent_version`
9. **Day 12 Page 5 実装注記** (commit `eaec9ab` + CR R40 patch): **route SSOT** = `/agents/:id` (§4.6 header と一致、`/agents/:id/settings` は drift で CR R40 B1 で App.tsx + Sidebar + prototype/CLAUDE.md を同期)。**TrustLevelBadge** は shared component (`prototype/src/components/shared/TrustLevelBadge.tsx`、`compact` = PageHeader meta chip / `progression` = Hero 3-stage stepper 両 variant、`getStageState` で現在/候補/対象外 判定)。**Type 区分判定 logic** は mock 簡略化 (model / prompt 変更 + Trust Level 不変 → A、新 external tool 追加 + 権限拡張 → B、Trust Level 変更 → C)、`SIMULATION_SCENARIOS` const で 3 シナリオ click → 承認者 / co-A 要件表示。**Type chip color**: A = slate / B = amber / C = indigo primary (CR R40 M4 で emerald → indigo に変更、emerald は完了・成功 連想で Type C 統制重視と semantic conflict)。**Hero = Trust Level Progression** (Slide 7 Matrix B 「AIに任せる量は段階的に増やすが、人によるコントロールは渡さない」 を 3-stage horizontal stepper + 4 KPI 進化要件 で視覚化、`[仮説 / 要検証]` ラベル discipline + DOC-MON-05 §3 reference)、page-level Wow factor 中核。**JP-only user-facing 規範** (CR R40 B2+B3): Security / PII / CISO 系 (`PII access` / `vendor LLM` / `Security-impacting` / `CISO + Security Officer + Risk`) は UI 露出禁止 (DOC-APP-02 §10.1 と整合)、個人情報アクセス範囲 / 外部 AI サービス / 情報管理に影響する変更 / 情報管理責任者 + リスク確認担当 に localize。Internal reference / impl copy (`Matrix B · DOC-APP-02 §7.1` / `multi-criteria 仮説 gate` / `read-only` / `変更 simulation` / `判定 logic mock`) は user-facing で 統制原則 / 4 KPI 進化要件 / 閲覧のみ / 変更影響の試算 / 判定ルール例 に paraphrase。docs SSOT 内の governance term は internal context のため keep。**Day 12 wireframe** は viewing state のみ (5 領域: Model / Prompt / Tool / 権限 / Trust Level summary)、editing / submitting-approval / approval-pending state は Day 14-15+ で AppContext 経由。引き上げ申請 / 変更を申請 は disabled wrapper span title pattern (CR R32+R38 pattern と整合)。**CR R41 二次 hygiene** (CR R40 patch 後の Hero 見出し / DOC chip / external tool 表記揺れ / mock-agents raw enum + 残留英語 cleanup): Hero h2「Trust Level Progression」→「Trust Level の進化段階」(英語 phrase を JP-first hybrid に)、DOC-MON-05 §3 + DOC-APP-02 §4 user-facing chip 削除 (internal SSOT pointer leak)、sim-b title「新 external tool 追加」→「外部 AI サービス 追加」(R40 description との表記同期、claim drift 解消)、「設定承認 history」→「設定承認 履歴」(japanglish h2 解消)、breadcrumb 末尾 a.id (kebab slug) → a.name (human label)、`agent_version` raw snake_case → 「Agent 版数」+ Model section duplicate 削除、Day 12/14-15+ internal milestone caption 削除 (M2/M3、PrototypeModeLabel と二重)、`mock-agents.ts` tool descriptions の raise → 注意を発する / cross-check → 突合 / entry → 未承認のナレッジ / prompt 注入 → プロンプトに付加 / citation → 引用根拠 一括 localize (両 agent)、permissions `(read-only)` → `(閲覧のみ)` + `active` enum prefix 削除、changeHistory `住所マスタ照合 tool に都道府県 cross-check` → `ツールに ... 突合` localize、Mn3「変更影響の試算」→「変更影響の事前確認」(分類 action と整合的)。**4 KPI 進化要件 SSOT**: 本 page では `KPI_PROGRESSION` const に inline (label / target / `[仮説 / 要検証]`)、Page 6 Metrics 実装時に `mock-metrics.ts` へ統合予定 (CR R40 M5、drift 防止)。**restricted boundary pack** (国際送金) は `trust_level: 'n/a'` で Trust Level Progression 対象外、`mock-agents.ts` に含めない (DOC-OV-00 §2.1、workflows/_index.md §3)

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
6. **表示要素** (Day 12 wireframe 実装実態、CR R43+R44 で #6 を impl 同期): Sticky PageHeader (breadcrumb 2-level + h1 + 直近 7 日 (検証用) chip + meta「4 KPI 進化判断 目安 + 補助 3 KPI + 9 KRI」)、仮説 framing 注 (mandatory PageHeader 直下、slate-50 inset + amber AlertTriangle、目標仮説値 / 検証仮説 framing)、Hero 4 KPI 進化判断 目安 (border-2 primary/30 card + multi-criteria 進化判断 + 仮判定 X/4 chip + 4 KPI card grid K1-K4 各 card 目標仮説 + 現在値 + [仮説 / 要検証] + sparkline state-conditional meets/misses)、補助 KPI 一覧 (K5-K7 表形式、# / KPI 名 / 内容 / 目標仮説 / 現在値 columns、stripe alternating row)、9 KRI 監視 (R1-R9 grid 3-col + state badge + triggerCondition + [仮説 / 要検証] inline label + responseAction mono caption)、業務別 推移 (UC-BO-01 + UC-BO-02 並列 sparkline、案件数 + Alert 発生率 2 軸、workflow filter chip を section header に局所化 = scope mismatch 解消、CR R44 B5)、Sticky footer (ダッシュボード戻り link + 検証用 KPI 表示の拡張 caption)、Prototype mode label (AppShell 経由)、**全 KPI / KRI / 仮説閾値に `[仮説 / 要検証]` ラベル必須** (DOC-MON-05 (`docs/05-metrics-and-gates.md`) §4.1 SSOT)
7. **遷移**: KPI card click → drilldown view (期間 / 業務 breakdown)
8. **mock data 依存**: `mock-metrics.ts` (KPI / KRI sample data、すべて `[仮説]` caption 付き)
9. **Day 12 Page 6 実装注記** (commit `d912cd9` + CR R43 patch): 「本番導入可否を判定する基準ではない、Phase 1 で測定・再設定する検証仮説」注 (Plan v1.4 P0-2 / v1.4.1 Fix 2) を PageHeader 直下に必ず表示 (mandatory framing 注、slate-50 inset + amber-600 AlertTriangle icon)。**5 section layout** (Sticky PageHeader: breadcrumb + h1 + 期間 chip「直近 7 日 (検証用)」+ meta「4 KPI 進化要件 + 7 KPI 補助 + 9 KRI」+ 業務 filter chip [全業務 / UC-BO-01 / UC-BO-02、useState]) / **Hero — 4 KPI 進化要件 (Wow factor 中核、Slide 8 視覚化)**: border-2 primary/30 card + 進化要件 explanation + 仮判定 count chip (X / 4) + 4 KPI gate card grid (K1-K4、各 card 目標仮説 + 現在値 + [仮説 / 要検証] + sparkline、meets → emerald / misses → amber state-conditional、`evaluateGate` helper で ≥ / ≤ 文字列 parse 簡略化) / 補助 KPI 一覧 (K5-K7 表形式、# / KPI 名 / 内容 / 目標仮説 / 現在値 columns、stripe alternating row) / 9 KRI 監視 (R1-R9 grid 3-column、各 KRI に state badge [正常 emerald / 注意 amber / 警告 red] + 検知条件 + [仮説 / 要検証] inline label + 対応 mono caption、state aggregation chip [正常 X / 注意 Y / 警告 Z]) / 業務別 推移 (mockWorkflowTrends を業務 filter 反映、UC-BO-01 + UC-BO-02 並列 sparkline、案件数 + Alert 発生率 2 sparkline)、Sticky footer (ダッシュボード戻り link + 検証用 KPI 表示の拡張は次の実装段階で対応 caption)。**KPI_PROGRESSION 統合 (CR R40 M5 closure)**: AgentSettings.tsx は `mockKpiHypotheses` を import で再利用 (`KPI_PROGRESSION = mockKpiHypotheses.map(...)`)、SSOT 単一化、KPI label/target drift 防止。**新規 mock 拡張** (`mock-metrics.ts`): `mockAuxiliaryKpis` (K5/K6/K7 + 目標仮説 + 現在値 + description)、`mockKriCatalogue` (R1-R9 + triggerCondition + responseAction + state + KriState enum) + `getKriById` helper。**CR R43 user-facing 規範** (Page 6 patch 後): governance jargon (`target hypothesis` / `gate` / `trigger` / `trend` / `Session 4` / `実 KPI 接続`) は user-facing で 目標仮説値 / 判定基準 / 検知条件 / 推移 / 本画面 / 検証用 KPI 表示の拡張 に paraphrase、`達成` 強表現は `仮判定` softer wording で hypothesis discipline と整合、全 KPI/KRI 数値 + 仮説閾値に `[仮説 / 要検証]` ラベル必須 (mandatory)。**CR R44 二次 hygiene** (CR R43 patch 後の mock-metrics responseAction / triggerCondition + Metrics.tsx 取りこぼし回収 + filter scope 整合): mock-metrics.ts `responseAction × 7 cards` (R1/R2/R3/R4/R5/R8/R9) の `review` / `Forced Downgrade` / `upgrade` / `review trigger` を `確認` / `見直しを起動` / `強制更新` / `段階の強制引き下げ` に一括 localize、`triggerCondition × 3 cards` (R1/R2/R4) の `target` → `目標仮説`、R3 `precision` 削除、R5 `layout` → `表示構成`、Metrics.tsx 補助 KPI section sub-caption `trend` → `推移`、PageHeader meta chip `7 KPI 補助` → `補助 3 KPI` (section 内 count chip との数値矛盾解消)、Hero h2 `4 KPI 進化要件` → `4 KPI 進化判断 目安` (Metrics page 文脈で production-ready 寄りニュアンス softening、AgentSettings 4 KPI sub-heading は Trust Level progression criteria context のため `4 KPI 進化要件` keep)、workflow filter chip を PageHeader から 業務別推移 section header に移動 (`scope mismatch` による mental model violation 解消、filter scope を local 化)、UC-BO-02 alertRatio7Day を `[0.40, 0.42, 0.43, 0.44, 0.43, 0.45, 0.46]` に下方修正 (急上昇 vs KRI all normal の mock data inconsistency 解消)。Hero 3 (Demo Chapter 2 終盤、4 KPI 仮閾値の説明画面)

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
- **Route SSOT**: `prototype/src/App.tsx` で React Router v7 にて exactly 9 page route をマウント (§2.7.5 詳細、`/cases/:id/comment` は SendBackComment = 9 画面の 1 つ、10 番目ではない)

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
- **shape**: rounded-md + px-2.5 py-1 (Operational Premium Light の radius-control 6px と整合、Stripe 風 SaaS UI として円形 pill ではなく rounded-md chip 形状)
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
- DOC-MON-05 (`docs/05-metrics-and-gates.md`、4 KPI 仮閾値 + 7 KPI + 9 KRI、§4.8 Metrics SSOT)
- DOC-S4-06 (Session 4 narrative、Slide 3 BusinessApprovalView mock figure spec)
- DOC-ROOT-\_SSOT §1.4 (Snippet schema SSOT、§9.2 weight インジケータと整合) + §1.5 (接続方針 control matrix)
- `~/.claude/plans/ai-backoffice-ai-virtual-muffin.md` Plan v1.4 P0-1 / P0-3 / P1-1 + v1.4.1 Fix 3 / Fix 5
