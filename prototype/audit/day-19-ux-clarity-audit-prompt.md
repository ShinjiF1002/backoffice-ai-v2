| 項目 | 値 |
| --- | --- |
| 文書 ID | DOC-AUDIT-D19-UXC-PROMPT |
| 文書名 | Day 19+ UX Density / First-Glance Comprehension / Progressive Disclosure Audit Prompt |
| 版数 | v0.2 |
| ステータス | Draft (audit 受け手は本 prompt をそのまま input、Day 18.5 audit と直交軸で audit 出力) |
| オーナー | backoffice-ai-v2 maintainer |
| 承認者 | self — 設定承認 (audit framework lock、Day 19 SSOT refresh 前 patch scope 拡張) |
| 閲覧対象 | Internal / audit reviewer (fresh Claude session / external CR) |
| 機密区分 | Internal |
| 関連文書 | DOC-UI-03 (`docs/03-ui-prototype-design.md`、**現状 Day 18.5 audit 内容に上書き、要再構築**) / DOC-UI-D14-INV (`docs/day14-medium-fi-inventory.md`) / DOC-ROOT-CLAUDE (`CLAUDE.md`) / DOC-PROTO-CLAUDE (`prototype/CLAUDE.md`) / `_PROGRESS.md` / 外部 reference 9 件 (§0 SSOT) |
| SSOT 区分 | Day 19+ UX clarity audit framework SSOT (audit 出力の構造・軸・gate を定義、audit 結果自体は別 file) |
| Evidence Status | empirical (Day 18 hash `9b935ca` HEAD + `prototype/screenshots/day-15-medium-fi/01-...09-...png` 9 PNG + 9 route source 3,374 LOC を直接 input + 業界 best practice 9 reference を §0 で明示参照) |
| 改版履歴 | v0.1 (2026-05-23 13:41): Day 18.5 micro-interaction audit と直交する text density / first-glance / progressive disclosure 軸の audit prompt 起稿、user-locked 3 軸 + cross-cutting 3 軸、mock data scope-in、5-level verdict (Keep/Tune/Add/Defer/Drop) 厳格分離、audit + 改善 plan のみ (実装は別 session)。v0.2 (2026-05-23): user 指摘 (best practice 調査統合) を反映、§0 Industry Pattern References 新設 (Nielsen H1-10 / Shneiderman SM1-3 / NN/g PD / Krug 5-sec / NN/g first-click / Tufte data-ink / Stripe restraint / Datadog audit trail / right-side drawer pattern 9 件)、§3 軸定義に Heuristic ID 引用追加、Axis 7 Role Fit + Axis 8 Trust & Safety 新設 (別 AI prompt + G3 由来)、§5 per-screen output を別 AI 9-column table に置換、§5.5 IA Layer Plan (L1-L4) 新設、§6 CR-2 を L1-L4 framework に rewrite、§6 CR-4 を別 AI Copy Reduction 11 verbatim targets に置換、§6 CR-7 E2E User Flow Walk 新設、§6 CR-8 Judgement Criteria Pre-Statement 新設、§9 anti-pattern 5 件追加、§12 self-check 3 行追加、§13 reviewer-back 5 question 義務化 |

---

# Day 19+ UX Density / First-Glance Comprehension / Progressive Disclosure Audit

## 0. Industry Pattern References (本 audit が引用する公知 framework SSOT)

本 audit の独自軸名は **公知 framework の再記述に過ぎない**ことを明示する。受け手は finding を出すとき各軸の対応 Heuristic ID を併記し、引用可能性を保証する。

### G1 — Heuristics & methodology (5 件)

| ID | Framework | 1-line essence | Reference URL |
| -- | --------- | ---------------- | -------------- |
| **NH1-10** | Nielsen 10 Usability Heuristics (Jakob Nielsen + Rolf Molich, 1990, 1994 改訂) | 1 Visibility of system status / 2 Match between system and real world / 3 User control and freedom / 4 Consistency and standards / 5 Error prevention / 6 Recognition rather than recall / 7 Flexibility and efficiency of use / 8 Aesthetic and minimalist design / 9 Help users recognize, diagnose, recover from errors / 10 Help and documentation | https://www.nngroup.com/articles/usability-heuristics-complex-applications/ |
| **SM1-3** | Shneiderman's Information-Seeking Mantra (Ben Shneiderman, 1996) | 1 Overview first / 2 Zoom and filter / 3 Details on demand。Information visualization の foundational guideline | https://www.cs.umd.edu/~ben/papers/Shneiderman1996eyes.pdf |
| **NPD** | NN/g Progressive Disclosure (Jakob Nielsen, 1995) | Defer secondary options to subsidiary screens、focus users' attention on primary options shown by default。Improves learnability / efficiency / error rate | https://www.nngroup.com/articles/progressive-disclosure/ |
| **K5S** | Krug / NN/g 5-Second Test | Show stimulus 5 seconds、capture gut reaction (visual style first impression、reading copy 不可)。本 audit Axis 1 の test methodology の origin | https://www.nngroup.com/videos/5-second-usability-test/ |
| **NFC** | NN/g First-Click Test | 6 visual-design test methods の 1 つ。初見ユーザが最初に押す要素が primary action と一致するか測定 | https://www.nngroup.com/articles/testing-visual-design/ |

### G2 — Regulated SaaS dashboard exemplars (2 件)

| ID | Framework | 1-line essence | Reference URL |
| -- | --------- | ---------------- | -------------- |
| **STR** | Stripe Dashboard restraint principle | 5-9 core elements / north star metric front-and-center / neutral base + single primary accent + semantic colors only for status (no decorative color use) / "Most fintech copied Stripe's visual surface without copying the design logic — structural simplification, not visual" | https://blog.logrocket.com/ux-design/great-examples-fintech-ux/ |
| **TUF** | Tufte data-ink ratio (Edward Tufte) | 1 dashboard ink の data 担当比率を最大化、redundant ink (装飾 / 重複 grid / decorative chartjunk) を削減。high data density は OK だが upper limit あり、subtract too much も add too much も両 fail | https://mapuipatterns.com/data-ink-ratio/ |

### G3 — Audit trail / disclosure pattern (2 件)

| ID | Framework | 1-line essence | Reference URL |
| -- | --------- | ---------------- | -------------- |
| **DAT** | Datadog Audit Trail pattern | 100+ event types、out-of-the-box dashboard with retention / pipeline / dashboard changes、HIPAA / PCI / SOX / GDPR export support。本 audit AuditTrail page の specific reference | https://docs.datadoghq.com/account_management/audit_trail/ |
| **PDR** | Right-side drawer disclosure (Pencil & Paper SaaS UI pattern analysis) | Row click → details appear in right-side drawer。Non-destructive、keeps user in context。本 audit Axis 3 の 1st-class disclosure pattern | https://www.pencilandpaper.io/articles/ux-pattern-analysis-data-dashboards |

### Reference 引用 rule

- 本 audit 出力 (`day-19-ux-clarity-audit-report.md`) では **finding ID と併記する** (e.g., "F-3 (P1、NH4 Consistency + STR restraint)")
- verbatim quote は引用符 `"..."` で囲み、それ以外は paraphrase / inference として扱う
- 上記 9 reference 以外を新規引用したい場合、受け手判断で §0 を expand 可 (audit report 内に SSOT pointer 追加)
- 規制 cite (HIPAA / PCI / SOX / GDPR 等) は reference 紹介のみ、本 audit の事実主張に使わない (Tier 3 規制語 hedge rule)

---

## 1. How to Use This Prompt

You are an **external UX audit reviewer** invoked to audit `backoffice-ai-v2/prototype/` at Day 18 high-fi 完了状態 (hash `9b935ca`、本日 2026-05-23 撮影 9 PNG 在庫 + 9 page source code 3,374 LOC) on a **single orthogonal axis**: **text density / first-glance task identification / progressive disclosure**。

This audit is **NOT a re-do of Day 18.5 micro-interaction audit** (motion / hover / a11y polish / chip taxonomy / token drift — all closed) nor Day 14-15 medium-fi register audit (PageHeader / Footer / Card register / token compliance — all closed)。The 2 prior audits remain SSOT; this audit MUST NOT overlap their findings。

Output 1 markdown document at `prototype/audit/day-19-ux-clarity-audit-report.md` with §1 Gate Verdict / §2 Coverage Matrix / §3 Top Findings / §4 Per-Screen Output / §5 IA Layer Plan / §6 Cross-Cutting Findings / §7 Improvement Plan / §8 Verification Gates retain / §9 Audit closing notes including 5 reviewer-back questions。

Do **NOT** implement。Audit + improvement plan のみ。実装は別 session で apply される。

---

## 2. Audit Mission

> 「初めて画面を見たユーザが、最初の viewport だけで『この画面は何で / 自分は何をすればよいか / どこに居るか』を 5 秒で把握でき (NH1 + K5S)、必要な情報は必要十分に表示され (NH8 + TUF)、詳細は disclosure 経由で dig into できる (SM1-3 + NPD + PDR)、規制 / 監査 UI として必要な証跡性は落とさず (DAT)、enabled no-op / 内部用語リークを最小化する (NH4 + NH8)」状態に 9 画面を揃えるための、text density / information architecture / progressive disclosure 観点の **網羅的 audit + 改善 plan** を作成する。

「文字を減らす」が目的ではなく、**「summary / default view / expandable detail / drawer / drill-down / tooltip / footer note に再配置する」** が目的。規制・監査 UI として必要な証跡性 (Tier 1 vocabulary / `[仮説 / 要検証]` hedge / citation/staging governance) は落とさない。

---

## 3. Project Context (verbatim、受け手は本 §3 を読んでから §4 軸定義に進む)

### 3.1 Repository / Phase

- **Root**: `/Users/shinjifujiwara/code/active/backoffice-ai-v2/`
- **Prototype root**: `/Users/shinjifujiwara/code/active/backoffice-ai-v2/prototype/`
- **Audit HEAD**: `9b935ca` (Day 18 high-fi 完了直後、Day 19 SSOT refresh 前)
- **Today**: 2026-05-23
- **Phase status (`docs/_PROGRESS.md` §3 SSOT)**:
  - Day 13 ✅ low-fi wireframe sign-off
  - Day 15 ✅ medium-fi register sign-off (4 criteria pass、screenshot `prototype/screenshots/day-15-medium-fi/01-...09-...png`)
  - Day 18 ✅ high-fi マイクロインタラクション (9 画面 ALL 95% target equal + Lighthouse a11y 90+)
  - Day 18.5 ✅ external micro-interaction audit (Conditional Go、P0 2 + P1 3 patch plan、`docs/03-ui-prototype-design.md` に embed) — **本 audit と直交**
  - Day 19 🟡 SSOT refresh 待ち + **本 audit + 本 audit に基づく patch 適用 待ち**

### 3.2 9 Routes (exactly、本 prompt の audit scope = exactly 本 9 routes)

| # | Route | File | LOC | Screenshot |
| - | ----- | ---- | --- | ---------- |
| 1 | `/` または `/dashboard` | `prototype/src/pages/Dashboard.tsx` | 412 | `01-dashboard.png` |
| 2 | `/inbox` | `prototype/src/pages/Inbox.tsx` | 255 | `02-inbox.png` |
| 3 | `/cases/:id` | `prototype/src/pages/CaseReview.tsx` | 222 | `03-case-review.png` |
| 4 | `/cases/:id/comment` | `prototype/src/pages/SendBackComment.tsx` | 337 | `04-sendback-comment.png` |
| 5 | `/proposals/:id` | `prototype/src/pages/ProposalReview.tsx` | 338 | `05-proposal-review.png` |
| 6 | `/agents/:id` | `prototype/src/pages/AgentSettings.tsx` | 446 | `06-agent-settings.png` |
| 7 | `/audit` | `prototype/src/pages/AuditTrail.tsx` | 424 | `07-audit-trail.png` |
| 8 | `/metrics` | `prototype/src/pages/Metrics.tsx` | 498 | `08-metrics.png` |
| 9 | `/knowledge` | `prototype/src/pages/KnowledgeBrowser.tsx` | 442 | `09-knowledge-browser.png` |

- 9 routes 厳守 (10 番目の画面追加 / 既存画面削除 禁止、`prototype/CLAUDE.md` §9 routes SSOT)
- BusinessApprovalView は **route 化されない** static mock (本 audit scope 外)

### 3.3 Design Language (Operational Premium Light、STR と高度に整合)

- **Visual direction**: Stripe 風 high-density operational dashboard、装飾排除 (no gradient mesh / glow / glassmorphism / 3D / large rounded >8px / dark mode / cream-beige)。STR の「neutral base + single primary accent + semantic colors only for status」原則と verbatim 一致
- **Density**: medium-high (24/32px grid)。TUF の「high data density OK、ただし upper limit あり」原則に該当 — 本 audit はこの upper limit を超えていないか判定
- **Token system**: `prototype/src/index.css` `@theme inline` の `--color-*` / `--radius-*` / `--height-*` (Day 14-15 で 9 画面 cross-cutting 適用済、Day 18.5 で grep zero hit)
- **JP-only UI**: 英語 string は bug、例外は技術固有名詞 (`React` / `Vite` / `Tailwind` / `AI` / `PDF` / `OCR` / `API` / `SLO` / `KPI`)
- **Mono font (JetBrains Mono)**: `case_id` / `weight` / `version` / `timestamps` のみ
- **規制語 hedge**: Tier 3 規制語は v2 docs 内でも事実主張禁止、`docs/prior-art-map.md` 参照のみ

### 3.4 Audit History (scope-out 厳守、re-audit 禁止)

| Audit | Date | Scope | Status | 本 audit との関係 |
| ----- | ---- | ----- | ------ | --------------- |
| Day 14-15 medium-fi register check | 2026-06-02/03 | PageHeader / Footer / Card register / token compliance (hex / non-mono text-px / inline style / stale term / palette / severity / 旧 case path / outer max-w 8 grep) | Closed, 8 grep zero hit | **scope-out** — token drift / register reuse 系の finding は出さない |
| Day 18.5 micro-interaction audit | 2026-05-23 | hover / focus transition / status animation / chip taxonomy / disabled CTA pattern / sticky scroll shadow / row hover token / link hover SSOT / a11y polish | Conditional Go, P0 2 + P1 3 | **scope-out** — motion / hover / disabled / a11y 系の finding は出さない |

本 audit (Day 19+ UX Clarity) の scope = **上 2 audit と orthogonal な「text density / first-glance comprehension / progressive disclosure」**。直接 overlap する finding を出すと audit failure。

### 3.5 SSOT Files to Read FIRST (audit 開始前に必須読み込み)

1. `CLAUDE.md` (project root) — Tier 1/2/3 語彙、scope-out、JP-only、`_HEADER_TEMPLATE` 規範、規制語 hedge
2. `prototype/CLAUDE.md` — 9 routes、Operational Premium Light、Chip taxonomy (StatusBadge / FilterChip / MetaChip 3 系統)、PageHeader 規範、Soft 背景 foreground 規範、Prop 命名規範、Body container 規範、Citation / Staging Governance、Case Lifecycle Stepper、Mock Data 規範、Day 11-18 phase gate
3. `docs/_PROGRESS.md` — Day 1-22 status table + Open items §4
4. `docs/_SSOT.md` — 論点別 SSOT mapping
5. `docs/00-overview.md` — 接続層メモ、UC-BO-01 / UC-BO-02 active workflow、国際送金 restricted
6. `docs/01-flywheel-and-knowledge.md` — 差戻し → staging → compiled flywheel
7. `docs/02-approval-model.md` — 3 層承認 (案件 / 手順 / 設定)、Role × 画面 access matrix §9.8
8. `docs/04-knowledge-pipeline.md` — Staging usage rules、5-category routing、Audit event model、§4.5 data_error 別経路
9. `docs/05-metrics-and-gates.md` — 4 KPI multi-criteria gate、7 KPI catalogue、9 KRI catalogue
10. `docs/06-session4-narrative.md` — Session 4 narrative SSOT、8 slide + Demo Chapter 1/2 message spine
11. `docs/day14-medium-fi-inventory.md` — Day 14-15 inventory + 6 軸 matrix
12. **`docs/03-ui-prototype-design.md`** — **⚠️ 本日 Day 18.5 audit 内容で上書きされており、UI design SSOT が失われている**。本 audit では `docs/03` を UI 設計 SSOT として参照しない。`prototype/CLAUDE.md` + 各 page 内 JSDoc + Day 14-15 inventory + Day 18.5 audit が現状の擬似 SSOT。本 audit § 末尾で `docs/03` 復旧優先度を出す
13. 9 page source files (§3.2 表)
14. 13 mock data files (`prototype/src/data/mock-cases.ts` / `mock-knowledge.ts` / `mock-audit.ts` / `mock-proposals.ts` / `mock-agents.ts` / `mock-metrics.ts` / `types.ts`、+ `prototype/src/lib/sendback-categories.ts` / `knowledge-labels.ts` / `status-tones.ts` / `cn.ts`)
15. Shared / shell / case / proposal components (`prototype/src/components/shell/*` / `shared/*` / `case/*` / `proposal/*`)
16. 9 screenshots (`prototype/screenshots/day-15-medium-fi/01-...09-...png`、1440 × 900 viewport)
17. Day 18.5 audit (現 `docs/03-ui-prototype-design.md` 内容) — **本 audit が触らない領域の確認用、re-audit 禁止**
18. **本 prompt §0 Industry Pattern References 9 件** — 本 audit の Heuristic ID 引用 SSOT

### 3.6 Verification Gates to Retain (本 audit の改善 plan が破壊禁止)

| # | Gate | 期待値 | Source |
| - | ---- | ------ | ------ |
| 1 | `pnpm build` warning 0 / error 0 | pass | Day 18 |
| 2 | 8 grep gate (hex / non-mono text-px / inline style / stale term / palette / severity / 旧 case path / outer max-w) | 全 0 hit | Day 14-15 |
| 3 | 9 route DOM smoke (console error 0) | error 0 | Day 13 / Day 18 |
| 4 | Sticky header top=56px (data-page-header) | 9 route で `getBoundingClientRect().top = 56` | Day 18 |
| 5 | Chip taxonomy grep (StatusBadge `rounded-[var(--radius-chip)]` / FilterChip 4 page / AuditTrail 10 entry slate-100 / slate-600) | retain | Day 16 |
| 6 | Lighthouse a11y: dashboard ≥ 96 / case-review ≥ 91 / metrics ≥ 96 | retain | Day 18 |
| 7 | Keyboard focus check (Tab で 9 route 全 interactive surface に `:focus-visible`) | retain | Day 11.2 B2 |
| 8 | Day 18.5 P0 2 (Inbox filter chip / TopBar Notification disabled) + P1 3 (sticky scroll shadow / DisabledHint SSOT / row hover token) | Day 19 patch で apply 予定、本 audit の改善 plan と co-exist 可能 | Day 18.5 |

本 audit の改善 plan は上記 8 gate を **全て retain** する形で書くこと。新規 gate 追加は P0/P1 finding に対してのみ allow、9 つ目以上の独立 grep gate は禁止 (Day 18.5 closing notes と同方針)。

---

## 4. Audit Axes (8 軸、user-locked 3 + cross-cutting 3 + 別 AI 由来 2、各軸 Heuristic ID 併記)

### 4.1 Axis 1 — First-Glance Task Identification (user-locked、NH1 + K5S + NH7)

**問い**: 初めて本画面に landing したユーザが、最初の viewport (1440 × 900 想定) を 5 秒見て、以下 3 問に答えられるか?

1. **What**: この画面は何の画面か (1 文で言える)
2. **Why I'm here**: 自分は何のためにここに居て、次に何をすべきか (primary action)
3. **Where**: workflow 全体の中で自分は今どこに居るか (orientation: breadcrumb / status / step)

**Heuristic correspondence**:
- NH1 Visibility of system status — orientation / breadcrumb / status の有無
- K5S 5-Second Test — 5 秒で gut reaction が成立するか (NN/g standard methodology)
- NH7 Flexibility and efficiency of use — primary action が一目で識別可能 (Primary Action Clarity sub-axis)

**Sub-axis (別 AI prompt 由来) — Primary Action Clarity**:
- 主操作が 1 つに絞れているか
- 主操作・補助操作・将来機能・読み取り専用が visual hierarchy で分離されているか

**判定 method**:
- 各 page screenshot を「最初の viewport (1440 × 900) 範囲」に crop した想定で読む
- 上記 3 問 + Primary Action Clarity を、persona 3 種 (入力者 / 承認者 / 監査担当) で simulation
- 答えに必要な情報がどこに埋もれているか / どこに無いかを特定
- Tier 1 語彙 (案件承認 / 手順承認 / 設定承認 / 入力者 / 承認者 / Flywheel) の visibility を確認 (page に応じた必要 vocabulary だけ)

### 4.2 Axis 2 — Necessary AND Sufficient Information (user-locked、NH8 + TUF)

**問い**: 画面上に表示される情報は **必要十分** か? 不足 (sufficient でない) / 過剰 (necessary でない) を bucket 分類できるか?

**Heuristic correspondence**:
- NH8 Aesthetic and minimalist design — 過剰情報の削減
- TUF data-ink ratio — data ink 担当比率を最大化、redundant ink (装飾 / 重複 grid / chartjunk) を削減

**判定 method**:
- 画面上の全 visible element を 3 bucket 分類:
  - **N (Necessary)**: ユーザが primary task を完了するために first viewport で必要
  - **S (Sufficient context)**: primary task の判断材料 / context として必要、scroll で見えれば OK
  - **X (Superfluous)**: 装飾 / 重複 / dev metadata / 内部 SSOT 用語 / 仮説 disclaimer の過剰反復
- X bucket の element を「削除 / 統合 / disclosure 化 / mock trim」 の 4 action に分類
- 「必要だが現状無い」要素 (gap) も list 化 (Axis 1 fail の根本原因の一部)

**Mock data vs UI primitive 分離**:
- 同じ element の text density は (a) UI primitive の余分 chrome、(b) mock data の冗長 content、の 2 原因に分かれる
- 各 finding を **「UI primitive 修正で解決」 / 「mock data trim で解決」 / 「両方必要」** に taxonomy

### 4.3 Axis 3 — Progressive Disclosure / Dig into (user-locked、SM1-3 + NPD + PDR)

**問い**: 詳細確認したいユーザは追加 affordance (click / hover / drawer / expand / drill-down) で dig into できるか? 必要な詳細が現状 buried / inaccessible になっていないか?

**Heuristic correspondence**:
- SM1-3 Shneiderman mantra — Overview first / Zoom and filter / Details on demand の 3 step が成立するか
- NPD Progressive Disclosure — secondary options を subsidiary screen に defer
- PDR Right-side drawer pattern — row click → side drawer の non-destructive in-context disclosure

**判定 method**:
- 「現状 inline で表示されているが disclosure に押し下げられる詳細」を candidate list 化
- 「現状 buried / no affordance で access 不能な詳細」を gap list 化
- 各 candidate / gap に対して disclosure pattern を 1 つ提案:
  - **expand / accordion** (`aria-expanded`、AuditTrail / KnowledgeBrowser 既存 pattern)
  - **inline reveal** (hover popover、技術固有名詞補足等)
  - **drawer / side panel** (PDR right-side、CaseReview citation card detail、ProposalReview 差分詳細)
  - **drill-down navigation** (`/cases/:id` → detail layer、9 route 内に閉じる)
  - **tooltip** (title attr、Day 18.5 で disabled CTA に既存 pattern)
- 9 routes 厳守 (新 route 追加禁止) → 全 disclosure は同 route 内 component で実装
- enabled no-op を生やさない (Day 18.5 SSOT)、disclosure 操作は in-memory mock state で動く前提

### 4.4 Axis 4 — Information Architecture / Scan Path (cross-cutting、SM1 + NH2 + STR)

**問い**: 画面の視線動線 (F-pattern / Z-pattern / 中央集中) は primary task に沿っているか? 視覚的階層 (typography / spacing / color emphasis) は importance order と一致しているか?

**Heuristic correspondence**:
- SM1 Overview first — overview を最上位に置く
- NH2 Match between system and real world — 業務 workflow と画面 layout の対応
- STR Stripe restraint — 5-9 core elements、north star metric 前面化

**判定 method**:
- screenshot で「最初に目が行く要素」 → 「次に目が行く要素」 → 「最後に目が行く要素」を simulation
- 上記 scan order と primary task が要求する order の一致 / ズレを記録
- 視覚的 anchor (page-header h1 / sticky CTA / alert strip / hero card 等) の数と weight を確認、anchor 過剰 / 不足を判定
- 1 viewport 内の "white space" と "ink density" の比率を確認 (Operational Premium Light + STR + TUF の "restrained Stripe-like" との整合)

### 4.5 Axis 5 — Microcopy / Tier 1 Vocabulary (cross-cutting、NH2 + NH4 + NH10)

**問い**: 画面上の label / caption / help text / footer note / hover hint は **明瞭 / 簡潔 / 正確** か? Tier 1 語彙が一貫しているか? `[仮説 / 要検証]` hedge が必要箇所にだけ付いているか?

**Heuristic correspondence**:
- NH2 Match between system and real world — user の言葉で書く、internal jargon 排除
- NH4 Consistency and standards — Tier 1 語彙の表記揺れ禁止
- NH10 Help and documentation — help text は 1 read で意味が分かる

**判定 method**:
- 各 label / caption に対して「user は読まずに意味を当てられるか / 1 回読めば意味が分かるか / 2 回以上読まないと分からないか」の 3 段階で判定
- Tier 1 語彙の使用 consistency 確認 (`案件承認` を「案件確認」「案件チェック」等の表記揺れに分散していないか)
- footer caption の冗長度確認 (「(...は次の実装段階で対応)」reps が page 毎に多重表示されていないか)
- `[仮説 / 要検証]` hedge の必要箇所 (KPI / SLO 数値) / 不要箇所 (確定 mock content) の分離確認

### 4.6 Axis 6 — Mock Data Density (cross-cutting、user 明示 scope-in、TUF + NH8)

**問い**: mock data 自体が冗長 / 不自然 / 過剰 specific になっていないか? UI 改修と分離して mock trim だけで解決する density 問題はどれか?

**Heuristic correspondence**:
- TUF data-ink ratio — mock data も "ink" の一部、redundant content は ratio を下げる
- NH8 Aesthetic and minimalist design — UI primitive 修正と同 principle

**判定 method**:
- 各 mock file (`mock-cases.ts` / `mock-knowledge.ts` / `mock-audit.ts` / `mock-proposals.ts` / `mock-agents.ts` / `mock-metrics.ts`) を field 別に density 評価
- 過剰: 長すぎる title (40 字超) / body (150 字超) / 内部 SSOT 用語の rawリーク / fictional 過剰 specific 数値
- 不足: 短すぎて context が伝わらない title / 1 業務名しか登場しない workflow / 5 件未満で signal が出ない record count
- mock-cases.ts の `CASE-2026-0142` (Demo Chapter 1 起点) と `PROP-2026-031` (Demo Chapter 2 主提案) は **Demo narrative 固定**、本 audit でも narrative 整合性を破壊しない trim のみ allow

### 4.7 Axis 7 — Role Fit (別 AI prompt 由来、NH2)

**問い**: 各画面は **どの user role に向けた画面か** が明確か? 入力者 / 承認者 / AI 管理者 / 業務責任者 / 監査担当が 1 画面で混ざっていないか?

**Heuristic correspondence**:
- NH2 Match between system and real world — role の業務 mental model と画面情報が match
- `docs/02-approval-model.md` §9.8 Role × 画面 access matrix が SSOT

**判定 method**:
- 各 page の primary role を 1 つ identify (入力者 / 承認者 / AI 管理者 / 監査担当)
- secondary role (補助的に access する) を identify
- 1 page で 3+ role の primary surface が並存していないか確認 (mixed role page = audit fail)
- role 別の primary action を 1 つ明示できるか確認

### 4.8 Axis 8 — Trust & Safety (別 AI prompt 由来、NH1 + NH5 + NH9 + DAT)

**問い**: regulated UI として user の信頼を損ねる要素 (enabled no-op / clickable に見えて反応しない / disabled 理由不統一 / 検索 + 通知の未実装感) が残っていないか?

**Heuristic correspondence**:
- NH1 Visibility of system status — status / availability の透明性
- NH5 Error prevention — enabled no-op は user に「壊れた」誤認させる prevention violation
- NH9 Help users recognize, diagnose, recover from errors — disabled 理由が SR / sighted 両方に届くか
- DAT Datadog Audit Trail — 100+ event types を漏らさず timeline 化、`citation 対象外` 等の透明性 surface

**判定 method**:
- Day 18.5 で fix 予定の P0 2 件 (Inbox FilterChip / TopBar Notification) は本 audit でも同 issue を持つ前提だが、re-audit せず Day 18.5 patch apply 後の残余 trust issue だけを finding 化
- 規制 UI として「未実装感」が hide されすぎていないか (PrototypeModeLabel + 各 page footer caption の透明性)、過剰に hide されていないか (user が「実機能と勘違い」する risk)
- Citation / Staging Governance の境界が UI 上で violation されていないか (`weight: high` のみ citation panel、`low/medium` は staging hint panel)

---

## 5. Per-Screen Output Format (9 page × 9-column table)

For each of 9 routes (Dashboard / Inbox / CaseReview / SendBackComment / ProposalReview / AgentSettings / AuditTrail / Metrics / KnowledgeBrowser):

### 5.1 Main per-screen table (9-column、別 AI prompt format 採用)

```
### N.M `/route` ScreenName

**Screenshot reference**: `prototype/screenshots/day-15-medium-fi/0X-{slug}.png`
**Source**: `prototype/src/pages/{Name}.tsx` (LOC: N) + 主要 component
**Mock dependency**: `prototype/src/data/{mock-*.ts}` (record count: N)

| Page section | User job | 5秒で分かるか (Persona × NH/K5S) | 主操作 | 残す情報 (N) | Demote する情報 (S/X) | Dig-into 導線 (SM/NPD/PDR) | 主な問題 | Priority |
| ------------ | -------- | -------------------------------- | ------ | ------------ | --------------------- | -------------------------- | -------- | -------- |
| {section} | {1 sentence} | pass/partial/fail (1 文 + Heuristic ID) | {1 primary action} | {3-5 element} | {3-5 element + destination} | {pattern} | {1 sentence} | P0/P1/P2/Defer/Drop |
```

### 5.2 補助 structured field (per-screen の cross-reference として保持)

```
**Persona simulation (Axis 1)**: Persona 3 種 × What/Why/Where 9 question を simulation、verdict + root cause

**Information bucket (Axis 2)**: N / S / X bucket 全列挙、X に対する action (Delete / Merge / Disclose / Mock-trim)

**Disclosure mapping (Axis 3)**: 現状 inline で表示の要素 → 提案 disclosure pattern + a11y attribute + file touch

**Scan path (Axis 4)**: 視線動線 1 sentence + primary task との gap + anchor count

**Microcopy issues (Axis 5)**: file:line + current wording + issue + proposed wording

**Mock data issues (Axis 6)**: mock file:line + current length + issue + proposed trim

**Role fit (Axis 7)**: primary role + secondary role + mixed role risk

**Trust issue (Axis 8)**: enabled no-op / disabled 理由不統一 / 透明性 over-hide / under-hide / citation boundary violation

**Verdict (本 page 全 8 軸)**: 軸別 verdict + page-level priority
**Touch files (本 page 改善で touch する file)**: list
```

### 5.3 必須 9 page 適用順

Demo 中核 3 画面を先に audit、order:
1. Dashboard (Demo Chapter 1/2 入口)
2. Inbox (Demo Chapter 1 起点)
3. CaseReview (Demo Chapter 1 主画面 + benchmark)
4. SendBackComment (Demo Chapter 1 差戻し動線)
5. ProposalReview (Demo Chapter 2 主提案)
6. AgentSettings (Trust 進化 hero)
7. KnowledgeBrowser (Flywheel 可視化)
8. AuditTrail (証跡、DAT reference 直接適用)
9. Metrics (4 KPI gate)

---

## 6. IA Layer Plan (SM1-3 派生、別 AI prompt の 4 層モデル採用)

本 audit 出力は §5 per-screen 後に **`§5.5 IA Layer Plan (L1-L4)`** を必ず含める。これは Shneiderman mantra "Overview first → Zoom and filter → Details on demand" の 4 段階拡張 (L4 = 内部 / 将来 / 検証情報の更深層)。

### 6.1 4 層モデル (本 audit 受け手が 9 page を再分類する方法)

| Layer | 役割 | 画面上の扱い | Heuristic ID | 例 |
| ----- | --- | ----------- | ------------ | --- |
| **L1** | 初見で判断する情報 | 常時表示 (page header / hero card / 注意 strip) | SM1 Overview first | 次に処理すべき案件、承認 / 差戻し CTA、AI 入力結果 summary |
| **L2** | 判断を補強する情報 | 同一画面内の要約 (sticky panel / inline summary) | SM2 Zoom and filter | 信頼度 (ConfidenceBar)、主要根拠 (citation panel)、注意件数 |
| **L3** | 詳細確認 | expand / drawer / detail panel (PDR pattern) | SM3 Details on demand + NPD | 証跡 (EvidenceTimeline 詳細)、引用全文、監査項目、KPI 内訳 |
| **L4** | 内部 / 将来 / 検証情報 | tooltip / footer / dev-only / docs | NPD + Tier 3 hedge | 「次の実装段階で対応」、schema key、SSOT pointer、`[仮説 / 要検証]` の expand 形 |

### 6.2 9 page × L1-L4 再分類 table

本 audit 受け手は §5.5 で以下 table を必ず埋める:

```
| Page | L1 (常時) | L2 (要約) | L3 (掘る) | L4 (内部 / 将来) | Notes |
| ---- | --------- | --------- | --------- | ---------------- | ----- |
| Dashboard | {list} | {list} | {list} | {list} | {1 sentence} |
| Inbox | {list} | {list} | {list} | {list} | {1 sentence} |
| ... | ... | ... | ... | ... | ... |
```

### 6.3 再配置 rule

- **L1 → L2 demote**: page 上に visible のまま、weight (font-size / color / spacing) を下げる
- **L2 → L3 demote**: 同 page 内 disclosure (expand / drawer / tooltip) に押し下げる
- **L3 → L4 demote**: footer caption / dev-only / docs に逃がす、UI 上は default 非表示
- **L4 → 削除**: docs に既出で UI 露出が冗長なものは UI から削除
- **絶対に守る**: L1 から消す = 規制 / 監査 / 業務判断必須情報を消す = 却下対象

---

## 7. Cross-Cutting Output Format

### 7.1 CR-1: Shared Primitive 候補

| Pattern | 現状 (file:line × N 箇所) | 抽出基準 (3 箇所 + prop ≤ 3 + net 行数減少) | 提案 component | 適用 page |
| ------- | --------------------------- | ----------------------------------------- | -------------- | --------- |
| Disclosure (expand / accordion) | {list} | 適合 / 不適合 | `<Disclosure>` | {pages} |
| Right-side drawer (PDR) | {list} | 適合 / 不適合 | `<DetailDrawer>` | {pages} |
| Term tooltip (technical gloss) | {list} | 適合 / 不適合 | `<TermTooltip>` | {pages} |
| ... | ... | ... | ... | ... |

### 7.2 CR-2: IA Refactor (L1-L4 framework verbatim、§6 で確立した layer 再配置を 9 page 横断で集約)

- IA finding 1: page × layer × element 単位で「現 layer → 提案 layer + reason」
- IA finding 2: cross-page で同型 layer mismatch がある場合の grouping
- 9 page 全部 cover、最低 1 page あたり 1 IA finding は出す前提

### 7.3 CR-3: Mock Data Trim Pass (UI 非依存 commit 候補)

| Mock file | Trim 対象 | 影響 page | Demo narrative integrity |
| --------- | --------- | --------- | ------------------------ |
| mock-cases.ts | {field / record} | {pages} | pass (CASE-2026-0142 / PROP-2026-031 不変) |
| ... | ... | ... | ... |

### 7.4 CR-4: Copy Reduction Rules (別 AI prompt 11 verbatim targets、必須 cover)

各 target ごとに rule を 1-3 sentence で書く。「現行 → 圧縮 / 再配置」を verbatim で示す。

| Target | 現行出現箇所 (file:line) | 現行 wording (verbatim) | Issue | Proposed rule | 配置 layer (L1-L4) |
| ------ | ------------------------ | ----------------------- | ----- | ------------- | ------------------ |
| 1. `次の実装段階で対応` | {list} | "..." | {1 sentence} | "..." | L4 footer caption |
| 2. `[仮説 / 要検証]` | {list} | "..." | {1 sentence} | "..." | L2 inline + L4 expand |
| 3. `検証用` | {list} | "..." | {1 sentence} | "..." | L4 footer |
| 4. `source:` | {list} | "..." | {1 sentence} | "..." | L3 disclosure or L4 dev-only |
| 5. `field` / `step` (snake_case dev label) | {list} | "..." | {1 sentence} | "..." | L4 dev-only or remove |
| 6. `citation` (raw 用語) | {list} | "..." | {1 sentence} | "引用根拠" (Tier 2 paraphrase) | L1-L2 (UI surface) |
| 7. `DOC-*` / `SSOT` / `schema key` | {list} | "..." | {1 sentence} | "..." | L4 dev-only or remove |
| 8. 長い説明文 (60 字超 inline) | {list} | "..." | {1 sentence} | "..." | L3 expand or trim |
| 9. footer caption (3+ sentence) | {list} | "..." | {1 sentence} | "..." | L4 1-2 sentence |
| 10. disabled tooltip (Day 18.5 patch 後の残余) | {list} | "..." | {1 sentence} | "..." | L4 (Day 18.5 SSOT 統合) |
| 11. Prototype mode label (表示頻度・場所) | TopBar 9 page 共通 | "プロトタイプ表示 — 外部システム未接続 / 証跡はモック" | {1 sentence} | 現行 keep / 統合 / トリミング | L4 (常時表示で OK か再検証) |

### 7.5 CR-5: Tier 1 / Tier 3 vocabulary cross-page consistency (NH4)

- Tier 1 表記揺れ: list (file:line + 揺れ pattern + 統一案)
- Tier 3 規制語 リーク check: pass / fail
- `[仮説 / 要検証]` hedge over / under check: list
- Component 名 leak check: `BusinessApprovalChip` 等の component 名が user-facing に出ていないか grep
- Internal SSOT 用語 leak check: `DOC-*` / `_meta.yaml` / `snake_case` field 名 が user-facing に出ていないか grep

### 7.6 CR-6: docs/03 復旧優先度 (本 audit で発見した SSOT loss)

- `docs/03-ui-prototype-design.md` は本日 Day 18.5 audit で上書きされた (元 9 画面 Screen Card / §2.7 token / §4.X page detail / §6 Alert UI / §7 BusinessApprovalChip 等の SSOT 消失)
- 復旧 source 候補:
  - **A**: git history `git show 9b935ca^:docs/03-ui-prototype-design.md` から元 SSOT を復元 + Day 18.5 audit を `docs/audits/day-18-5-micro-interaction-audit.md` に move
  - **B**: `prototype/CLAUDE.md` + 各 page JSDoc + Day 14-15 inventory + Day 18.5 audit を統合した新 docs/03 v2 を起稿 (時間 cost 高)
- 復旧優先度: P0 / P1 / P2 (本 audit 受け手判断)
- 復旧 commit を Day 19 patch §7 (本 prompt) Commit 6 に含めるか否か

### 7.7 CR-7: End-to-End User Flow Walk (別 AI prompt 由来、SM1-3 + NH2)

9 page を **Dashboard → Inbox → CaseReview → SendBackComment → ProposalReview → AgentSettings → Metrics → AuditTrail → KnowledgeBrowser** の順で sequential walk、各 step に以下を書く:

```
### Step N: {Page Name}

| 項目 | 内容 |
| --- | --- |
| ユーザが知りたいこと | {1 sentence} |
| 画面が最初に答えるべきこと | {1 sentence} |
| 次に押すべきもの | {1 primary action} |
| 詳細を見たい時の導線 | {1-2 disclosure pattern + L3 / L4 layer} |
| 現状の阻害要因 | {1-3 issue + file:line} |
| 修正方針 | {1-2 sentence、§5 finding と cross-ref} |
```

E2E walk は IA layer plan (§6) と CR-2 IA Refactor と一貫している必要がある (3 つで同じ flow を 3 angles で見る)。

### 7.8 CR-8: Judgement Criteria Pre-Statement (別 AI prompt 由来、NN/g heuristic prioritization)

§3 Top Findings を出す前に、本 audit が採用する判断基準を **5-7 個に絞って** 提示する:

```
本 audit の改善提案を勧告する判断基準 (5-7 個):

1. {Criterion 1、1 sentence + 対応 Heuristic ID}
2. {Criterion 2、1 sentence + 対応 Heuristic ID}
...

(これらに該当しない improvement candidate は本 audit 出力に含めない)
```

例 (受け手 reference):
- C1: 初見 5 秒で primary action を識別できる (NH1 + K5S + NH7)
- C2: L1 必須情報が UI 上で defer / 削除されていない (規制 / 監査必須情報の保全)
- C3: L3 disclosure pattern が 1 click + non-destructive で実現する (NPD + PDR)
- C4: enabled no-op を増やさない (Day 18.5 SSOT)
- C5: Tier 1 vocabulary が user-facing で 1 表記に統一されている (NH4)
- C6: mock data trim が Demo narrative (CASE-2026-0142 / PROP-2026-031) を破壊しない
- C7: 改善 plan が §3.6 8 verification gate を破壊しない

判断基準を pre-statement することで、後続 §3 Top Findings 群の選別根拠が transparent になる。

---

## 8. 5-level Verdict Framework (Day 18.5 と同 framework、混在禁止)

各 finding は以下 5 verdict のいずれか:

- **Keep**: 現状で良い (改善不要)
- **Tune**: 軽微修正 (file:line + 1-2 行修正)
- **Add**: 新規追加 (新 component / 新 disclosure / 新 microcopy SSOT)
- **Defer**: 本 audit では plan しない (Phase 1 backend 接続時 / Day 20 polish 等、明示的に defer 先を指定)
- **Drop**: 将来 backlog にも残さない明示却下

**混在禁止**:
- P0 と P1 を 1 finding に混在させない
- Keep と Tune を 1 row に混在させない
- Defer と Drop を「未来でやる」一括りにしない

---

## 9. Improvement Plan Format (Day 19+ patch)

§7 Improvement Plan は 3-6 commit に分解、各 commit:

```
### Commit N — {prefix(day-19-ux): one-line summary} ({finding ID, priority, Heuristic ID})

- **目的** (1 sentence + 対応 Heuristic ID)
- **判断基準該当** (CR-8 で pre-statement した criteria のどれを満たすか): C1, C3, ...
- **Touch files** (file:line 単位、新規 file は (新規) と明記):
  - {file} — {変更 summary 1 文}
  - {file} — ...
- **Change summary** (3-5 文、何を / どう / なぜ + 対応 IA layer 移動 L? → L?)
- **Verification** (どの gate retain + 新規 sub-check):
  - build pass warning 0
  - 8 grep gate retain (全 0 hit)
  - 9 route DOM smoke retain (error 0)
  - sticky top=56px retain
  - Chip taxonomy retain
  - Lighthouse a11y target retain
  - Day 18.5 P0/P1 patch co-exist (本 patch 適用後も Day 18.5 patch 適用可能)
  - 新規 sub-check (本 patch 独自): {1-2 行}
  - first-click test (NFC): 該当 page で初見ユーザが最初に押すべき操作を 1 つ言えるか (本 commit で改善する page のみ verify)
- **Scope-out** (本 commit でやらないこと、他 commit / Defer / Drop に振り分け)
```

### 9.1 Commit 順序の Recommendation (P0/P1 は初見理解 + IA + enabled no-op 解消に限定)

- Commit 1: 最重要 P0 (Axis 1 / Axis 8 fail を解消する 1 件のみ、L1 必須情報の visibility 確保)
- Commit 2: 残り P0 (page-level priority P0、Trust & Safety 系)
- Commit 3: P1 IA refactor (CR-2 + §6 L1-L4 framework、3-5 page batch)
- Commit 4: P1 microcopy SSOT (CR-4 11 targets、shared microcopy SSOT 抽出可能性)
- Commit 5: P2 mock data trim (CR-3、UI 非依存で独立 commit に分離)
- Commit 6 (optional): docs/03 復旧 (CR-6、本 audit で発見した SSOT loss closure)
- Defer 系: Phase 1 backend 接続時、Day 20 polish branch、長期 backlog に明示分離

---

## 10. Constraints (HARD scope-out / scope-in)

### 10.1 Scope-in (本 audit で扱う)

- 9 route の text density / information architecture / first-glance comprehension / progressive disclosure
- Mock data density (UI primitive 修正と分離 commit で plan)
- Microcopy clarity / Tier 1 語彙 consistency / `[仮説 / 要検証]` hedge precision
- Role fit (mixed role page の identify)
- Trust & Safety (Day 18.5 残余 issue / citation / staging governance / 透明性 over-hide / under-hide)
- Shared primitive 候補 (3 抽出基準を満たす場合のみ、Day 19+ patch 内で実装可能なもの)
- docs/03 復旧優先度 (本 audit で発見した SSOT loss)

### 10.2 Scope-out (本 audit で扱わない、findings に出すと audit failure)

| Category | 理由 |
| -------- | --- |
| Day 18.5 micro-interaction 領域 | 直近 closed audit、re-audit 禁止 |
| Day 14-15 medium-fi register / token drift | 8 grep gate 全 0 hit、re-audit 禁止 |
| Motion / hover / focus transition / status animation | Day 18.5 scope |
| Chip taxonomy 3 系統分離 / radius / border / background | Day 16 C1a confirmed |
| Disabled CTA `<button disabled> + title + aria-describedby` pattern | Day 18.5 SSOT |
| A11y polish (Lighthouse score / focus-visible / aria-pressed) | Day 18.5 + Day 11.2 B2 SSOT |
| 装飾追加 (gradient mesh / glow / glassmorphism / 3D / large rounded >8px / cream-beige / dark mode) | `prototype/CLAUDE.md` Operational Premium Light §2.7 規範 |
| 10 番目の画面追加 / 既存 route 削除 | 9 routes exactly SSOT |
| Citation panel (high only) と Staging hint panel (low/medium) の境界曖昧化 | Plan v1.4 P0-1 SSOT、Tier 1 governance core |
| enabled no-op 増加 | `prototype/CLAUDE.md` SSOT、Day 18.5 reinforced |
| Tier 3 規制語の事実主張 | `CLAUDE.md` Tier 3 SSOT |
| 実 LLM / 実 PDF / 実規制 cite / 実 customer data / 実送金 / 実 master 更新 | scope-out |
| BusinessApprovalView の React 化 | static mock 専用、`demo/static-mocks/business-approval-view.html` SSOT |
| 国際送金 (restricted) を UI / Dashboard / mock に追加 | `docs/00` §2.1 SSOT、restricted boundary pack 内部のみ |
| 英語化 (JP-only 原則) | `CLAUDE.md` SSOT |
| Plan に書かれていない新規 feature / 画面 / KPI / 業務 | `CLAUDE.md` Plan First 原則 |

### 10.3 Anti-patterns (本 audit で却下対象、Heuristic ID と紐付け)

| Anti-pattern | Heuristic violation | 却下理由 |
| ------------ | ------------------- | -------- |
| Over-disclosure (L1 必須情報を L3 に押し下げ) | SM1 violation | 規制 / 監査 / 業務判断必須情報の visibility loss |
| Modal cascade (drawer 内に drawer / modal 内に modal) | NH3 User control + NPD violation | non-destructive principle 破壊、user の context loss |
| Tooltip dependency for primary info | NH6 Recognition rather than recall violation | tooltip は L4 用、L1-L2 primary info に使うと recall 強要 |
| Decorative motion / illustration / icon proliferation | NH8 + STR + TUF violation | data-ink ratio 低下、Operational Premium Light 違反 |
| Hedge over-display (`[仮説 / 要検証]` を非 KPI 数値にも全付与) | NH8 violation | 重要 hedge が noise に埋没、informational hedge の真の意味 loss |
| Audit / citation 痕跡の消去 (L1-L2 から完全除去) | DAT violation + 規制 UI 信頼性 loss | 規制 / 監査 UI として必要な証跡性は L1-L3 に必須残置 |

### 10.4 Decoration / motion / a11y 系 finding を出したくなった場合

→ Day 18.5 audit (現 `docs/03-ui-prototype-design.md`) を再読し、既出 finding と重複していないか確認。重複の場合は **本 audit findings に含めず**、Day 18.5 patch 適用済みであることを前提とする。

---

## 11. Evidence Discipline

### 11.1 Each finding must cite

- `file:line` (source code) OR
- `prototype/screenshots/day-15-medium-fi/0X-{slug}.png` の specific element (1 sentence で位置を記述) OR
- mock data file:line OR
- DOM observation (本 audit は static frame review のため `inference:` と明記) OR
- §0 Industry Pattern Reference (Heuristic ID + URL)

### 11.2 inference / observed の明示

- screenshot だけから判断した内容: `(screenshot 由来)` と注記
- source code から確認: `(source 由来)` と注記
- 動的挙動の推定: `inference:` と明記
- mock data 由来: `(mock data 由来)` と注記
- §0 framework 引用: `(Heuristic ID + URL)` と注記、verbatim quote は `"..."`、それ以外は paraphrase

### 11.3 Tier 1 / Tier 3 / hedge verbatim quote

- Tier 1 語彙を verbatim quote する場合: 必ず CLAUDE.md §Tier 1 語彙 table の対応 row を file:line で参照
- Tier 3 規制語 list / 高額閾値 exact / 規制 cite を本 audit 出力に書かない (規制語 hedge 原則)
- `[仮説 / 要検証]` hedge は KPI / SLO 数値に必ず付ける

---

## 12. Output Document Structure (本 audit が生成する markdown)

`prototype/audit/day-19-ux-clarity-audit-report.md` に以下構造で出力:

```
[12-item header per docs/_HEADER_TEMPLATE.md]

# Day 19+ UX Density / First-Glance Comprehension / Progressive Disclosure Audit Report

**Project**: backoffice-ai-v2 / Phase: Day 18 high-fi 完了後、Day 19 SSOT refresh + Day 18.5 P0/P1 patch と並行
**Audit HEAD**: 9b935ca / Screenshot 撮影日: 2026-05-23 / Viewport: 1440 × 900
**Audit scope**: 9 React route × 8 軸 (Axis 1-8) + Mock data + Microcopy
**Audit prompt SSOT**: `prototype/audit/day-19-ux-clarity-audit-prompt.md` (DOC-AUDIT-D19-UXC-PROMPT v0.2)
**Industry references**: 9 件 (§0 SSOT、NH1-10 / SM1-3 / NPD / K5S / NFC / TUF / STR / DAT / PDR)
**Reviewer constraint**: static frame review + source code direct read、動的挙動は `inference:` と明記
**Output 制約**: Markdown only、5 段階 (Keep / Tune / Add / Defer / Drop) 厳格分離、P0/P1/P2/Defer/Drop 混在禁止

---

## 0. TL;DR (1 page、Verdict + 最大問題 + 推奨方針)

- **Verdict**: Go / Conditional Go / No-Go (1 sentence)
- **最大の問題** (1 sentence): {...}
- **推奨方針** (1 sentence): {...}

## 1. Judgement Criteria (5-7 個、CR-8 verbatim、§3 Top Findings の前)

1. C1: ...
2. C2: ...
...

## 2. Coverage Matrix — 8 軸 × 9 page = 72 cell

| Page | Axis 1 (NH1+K5S+NH7) | Axis 2 (NH8+TUF) | Axis 3 (SM+NPD+PDR) | Axis 4 (SM1+NH2+STR) | Axis 5 (NH2+NH4+NH10) | Axis 6 (TUF+NH8) | Axis 7 (NH2) | Axis 8 (NH1+NH5+NH9+DAT) |
| ---- | -------------------- | ----------------- | -------------------- | --------------------- | ---------------------- | ----------------- | ------------- | --------------------------- |
| Dashboard | pass/partial/fail | ... | ... | ... | ... | ... | ... | ... |
| Inbox | ... | ... | ... | ... | ... | ... | ... | ... |
| CaseReview | ... | ... | ... | ... | ... | ... | ... | ... |
| SendBackComment | ... | ... | ... | ... | ... | ... | ... | ... |
| ProposalReview | ... | ... | ... | ... | ... | ... | ... | ... |
| AgentSettings | ... | ... | ... | ... | ... | ... | ... | ... |
| AuditTrail | ... | ... | ... | ... | ... | ... | ... | ... |
| Metrics | ... | ... | ... | ... | ... | ... | ... | ... |
| KnowledgeBrowser | ... | ... | ... | ... | ... | ... | ... | ... |

## 3. Top Findings (Ranked, 10-15 件)

| ID | Severity | 論点名 | Heuristic ID | Evidence | Why it matters | Recommended fix (L?→L?) | Touch files | Scope |
| --- | -------- | ------- | ------------- | -------- | -------------- | ----------------------- | ----------- | ----- |
| F-1 | P0 | ... | NH1+K5S | ... | ... | ... | ... | P0 |
| F-2 | P0 | ... | NH8+TUF | ... | ... | ... | ... | P0 |
| F-3 | P1 | ... | SM1+NPD | ... | ... | ... | ... | P1 |
| ... | ... | ... | ... | ... | ... | ... | ... | ... |

## 4. Per-Screen Output (9 page × §5 9-column table + 補助 structured field)

### 4.1 `/` Dashboard
### 4.2 `/inbox` Inbox
### 4.3 `/cases/:id` CaseReview
### 4.4 `/cases/:id/comment` SendBackComment
### 4.5 `/proposals/:id` ProposalReview
### 4.6 `/agents/:id` AgentSettings
### 4.7 `/audit` AuditTrail
### 4.8 `/metrics` Metrics
### 4.9 `/knowledge` KnowledgeBrowser

## 5. IA Layer Plan (L1-L4、§6 verbatim、9 page table 必須)

## 6. Cross-Cutting Findings (§7 verbatim、CR-1 〜 CR-8)

### CR-1 Shared Primitive 候補
### CR-2 IA Refactor (L1-L4 framework)
### CR-3 Mock Data Trim Pass
### CR-4 Copy Reduction Rules (11 verbatim targets)
### CR-5 Tier 1 / Tier 3 cross-page consistency + component / SSOT 用語 leak check
### CR-6 docs/03 復旧優先度
### CR-7 E2E User Flow Walk (9 page sequence)
### CR-8 Judgement Criteria Pre-Statement (本 §1 と一致確認)

## 7. Improvement Plan (Day 19+ patch、3-6 commit、§9 format verbatim)

### Commit 1 — ...
### Commit 2 — ...
### Commit 3 — ...
### Commit 4 — ...
### Commit 5 — ...
### Commit 6 (optional) — docs/03 復旧 ...

## 8. Verification Gates Retain Check

| # | Gate | 本 patch 適用後の retain 確認 | Day 18.5 patch co-exist |
| - | ---- | ---------------------------- | ----------------------- |
| 1 | build warning 0 | pass | OK |
| 2 | 8 grep gate 0 hit | pass | OK |
| 3 | 9 route DOM smoke error 0 | pass | OK |
| 4 | Sticky top=56px | pass | OK |
| 5 | Chip taxonomy | pass | OK |
| 6 | Lighthouse a11y target | pass | OK |
| 7 | Keyboard focus | pass | OK |
| 8 | Day 18.5 P0 2 + P1 3 patch | co-exist | OK |
| 9 | First-click test (NFC) — 該当 page で初見ユーザが最初に押すべき操作を 1 つ言えるか | 本 audit P0/P1 patch 適用 page で pass | — |
| 10 | enabled no-op audit (本 patch 適用後の sweep) | 0 hit | — |
| 11 | text density audit (CR-4 11 targets verify) | rule 通り | — |
| 12 | internal vocabulary leakage grep (CR-5、component 名 / DOC-* / SSOT / schema key / snake_case) | 0 hit | — |
| 13 | JP-only user-facing copy check | pass | — |
| 14 | `[仮説 / 要検証]` の表示箇所数 + 統合方針 (CR-4 target 2) | rule 通り | — |
| 15+ | 本 audit 新規 sub-check (P0/P1 finding 由来、独立 grep gate 化禁止) | pass | — |

## 9. Audit Closing Notes + Reviewer-back Questions

- 本 audit は static frame review + source code direct read であり、scroll 中の sticky shadow / hover 連鎖 / focus 連鎖 / chevron rotation / ConfidenceBar transition は Day 18.5 scope。本 audit はそれらに findings を出していない
- mock data 由来 finding は UI primitive 由来 finding と commit 分離 (§7 Commit 5)
- docs/03 SSOT loss (CR-6) を本 audit で発見、Day 19 SSOT refresh と並行で復旧推奨
- 本 audit の改善 plan は Day 18.5 P0/P1 patch と co-exist 可能な形で plan、両 patch を同 day 19 内に apply 可能

### Reviewer-back questions (最大 5 個、実装に入る前に user / maintainer に確認すべき未確認事項)

1. {1 sentence + 該当 finding ID}
2. {1 sentence + 該当 finding ID}
3. {1 sentence + 該当 finding ID}
4. {1 sentence + 該当 finding ID}
5. {1 sentence + 該当 finding ID}

End of audit.
```

---

## 13. Audit Receiver Self-check (audit 出力前に必須 verify)

| # | Self-check | 期待 |
| - | --------- | ---- |
| 1 | SSOT files (§3.5) 18 件を全 read 済み (§0 9 reference 含む) | yes |
| 2 | 9 page source + 9 screenshot を全 read 済み | yes |
| 3 | Day 18.5 audit / Day 14-15 inventory を re-audit していない | yes |
| 4 | 8 軸 × 9 page = 72 cell の coverage matrix を埋めた | yes |
| 5 | 各 finding が file:line / screenshot / mock data / DOM / Heuristic ID のいずれかで evidence cite | yes |
| 6 | 5-level verdict (Keep/Tune/Add/Defer/Drop) を 1 finding 1 verdict で厳格分離 | yes |
| 7 | P0/P1/P2/Defer/Drop を混在させていない | yes |
| 8 | 改善 plan の各 commit が §3.6 8 gate retain | yes |
| 9 | 改善 plan の各 commit が Day 18.5 P0/P1 patch と co-exist 可能 | yes |
| 10 | 9 route 厳守 (新 route 提案していない) | yes |
| 11 | 装飾追加 (motion / glow / gradient mesh / glassmorphism 等) を提案していない | yes |
| 12 | enabled no-op を増やす提案をしていない | yes |
| 13 | Tier 3 規制語の事実主張を audit 出力に含めていない | yes |
| 14 | JP-only 原則を破る wording 提案を含めていない | yes |
| 15 | Mock 修正と UI 修正を commit 分離している | yes |
| 16 | Demo narrative (CASE-2026-0142 / PROP-2026-031) integrity を破壊する mock trim を提案していない | yes |
| 17 | docs/03 復旧優先度に対する立場を §6 CR-6 で表明している | yes |
| 18 | inference / observed / mock data 由来を明示している | yes |
| 19 | **§0 Industry Pattern Reference 9 件 (NH/SM/NPD/K5S/NFC/TUF/STR/DAT/PDR) を本 audit の §3 軸定義 / §3 Top Findings / §4 Per-Screen で明示引用している** | yes |
| 20 | **§5 IA Layer Plan (L1-L4) を 9 page 全部埋め、CR-2 IA Refactor + CR-7 E2E flow walk と整合している** | yes |
| 21 | **§9 Reviewer-back questions 最大 5 個を closing で出力している** | yes |
| 22 | **§1 Judgement Criteria を §3 Top Findings の前に 5-7 個明示し、Top Findings 群がこれら criteria に該当することを cross-check 済み** | yes |
| 23 | **CR-4 Copy Reduction 11 verbatim targets を全 cover している (rule / 現行 / 圧縮案 / 配置 layer)** | yes |

---

## 14. Closing Output Checklist (本 audit 受け手が submit 前に確認)

- [ ] `prototype/audit/day-19-ux-clarity-audit-report.md` に出力 (12-item header 付き)
- [ ] §0 TL;DR で Verdict + 最大問題 + 推奨方針 (各 1 sentence)
- [ ] §1 Judgement Criteria 5-7 個 (§3 Top Findings の前)
- [ ] §2 Coverage Matrix で 72 cell 全埋め (空 cell 禁止、N/A も明記)
- [ ] §3 Top Findings 10-15 件で P0/P1/P2 ranked + Heuristic ID + file:line + screenshot + recommended fix (L?→L?)
- [ ] §4 Per-Screen Output で 9 page × §5 9-column + 補助 structured field
- [ ] §5 IA Layer Plan (L1-L4) で 9 page table
- [ ] §6 Cross-Cutting Findings で CR-1 〜 CR-8 全 cover
- [ ] §7 Improvement Plan で 3-6 commit、各 commit に §9 format verbatim + Heuristic ID + first-click test verify
- [ ] §8 Verification Gates Retain Check で 8+ gate co-exist + 新規 sub-check (NFC / no-op sweep / text density / leak grep / JP-only / hedge)
- [ ] §9 Audit Closing Notes + Reviewer-back questions 最大 5 個
- [ ] §13 Self-check 23 項目を全 yes 確認

End of prompt v0.2.
