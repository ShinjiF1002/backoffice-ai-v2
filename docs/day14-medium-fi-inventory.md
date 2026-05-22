| 項目            | 値                                                                                                                                                                                                                                                                                                            |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 文書 ID         | DOC-UI-D14-INV                                                                                                                                                                                                                                                                                                |
| 文書名          | Day 14 medium-fi inventory + allowlist + gate checklist                                                                                                                                                                                                                                                       |
| 版数            | v0.2                                                                                                                                                                                                                                                                                                          |
| ステータス      | Draft (P0 verify + P1 完了、P2 + Day 15 gate 進行中)                                                                                                                                                                                                                                                          |
| オーナー        | backoffice-ai-v2 maintainer                                                                                                                                                                                                                                                                                   |
| 承認者          | self — 設定承認 (文書 hygiene、Day 14-15 medium-fi の execution checklist 化)                                                                                                                                                                                                                                 |
| 閲覧対象        | Internal / Project team                                                                                                                                                                                                                                                                                       |
| 機密区分        | Internal                                                                                                                                                                                                                                                                                                      |
| 関連文書        | DOC-UI-03 (`docs/03-ui-prototype-design.md` §2.7 token + §6.1 Alert UI + §7 BusinessApprovalChip + §10 集約方針), DOC-ROOT-\_PROGRESS (`docs/_PROGRESS.md` §3 Day 15 gate + §4 Open items)                                                                                                                     |
| SSOT 区分       | Day 14-15 medium-fi 実行 checklist + token allowlist + 9 画面 × 6 軸 matrix の SSOT (design SSOT ではない、DOC-UI-03 §2.7 を正本として参照)                                                                                                                                                                    |
| Evidence Status | empirical (Day 14 開始時の implementation 現状 snapshot、Day 14-15 進行で update)                                                                                                                                                                                                                             |
| 改版履歴        | v0.1 (2026-06-02): Day 14 着手前起稿 (Plan B-lite v2.3、`~/.claude/plans/fuzzy-marinating-starfish.md` ref、A-D closure grep zero hit verify 済、Day 13 canonical hash `7766874`)。v0.2 (2026-06-02): P0 verify + P1 完了反映 (commit `f1af8db`、6 grep gate 全 zero hit、DOM smoke pass for `/cases/CASE-2026-0142`)                                                                                                                                                                                  |

---

## 1. 概要 + scope

Day 14-15 medium-fi phase の execution checklist。Plan B-lite v2.3 を実体化:

- **目的**: 9 画面の static visual register を統一 (PageHeader / footer / chip / badge / card / table)、Operational Premium Light token を 9 画面に均等適用、Demo 中核 3 画面 (CaseReview / ProposalReview / Dashboard) の minor spec gap 3 件を closure
- **方針**: 新規 design なし、Day 11 lock 済 token cadence を 9 画面 cross-cutting に伝播
- **Phase**: medium-fi (静的 register)、動き (hover / transition / animation) は Day 16-18 high-fi で扱う

### Scope-in

- AppShell / Sidebar / TopBar + 13 component の token 適用 + register 統一 (P0)
- Demo 中核 3 画面 (CaseReview / ProposalReview / Dashboard) の PageHeader 6 element register + spec gap closure 3 件 (P1)
- 残り 6 画面の register 揃え + table primitive 統一 (P2)
- shared component 抽出 (3 条件適合のみ、PageFooter / FilterChipRow 候補) (P3、発生時のみ)
- BusinessApprovalChip enabled no-op 解消 + `slide-only mock` 内部用語撤去 (P1 sub-task、CR R32+R38 disabled wrapper title pattern)
- RelatedRuleAlert icon Bell→AlertCircle + optional link to ProposalReview (P1 sub-task、JSDoc + JSX 本文 + types.ts JSDoc を file-wide JP 化)
- docs/03 §4.1 + §7 の 5 箇所 internal term JP 化 + Day 14 disabled / Day 20 enable phase 明記
- visual smoke 9 PNG export + 4 criteria gate verify (Day 15)

### Scope-out

- 実 LLM / PDF / 外部接続
- AppContext 状態遷移の本格実装
- Day 16-18 high-fi 領域 (hover / focus transition / status animation / Lighthouse a11y 90+ 厳密化 / micro-interaction 5-8 例)
- KnowledgeBrowser raw trace expandable toggle (Day 16-18 で再判定)
- 10 番目の画面化 / 新規 route 追加
- shared component 先回り抽出 (3 条件未達は inline 維持)
- token system 自体の見直し (Operational Premium Light Day 11 lock 済)
- BusinessApprovalView static mock の Day 14 内実装 (Day 20 scope)

---

## 2. 9 画面 × 6 軸 軽量 matrix

各 cell: `✏️ 対応必要 (Day 14-15 で touch)` / `✓ 対応不要 (既揃い)` / `🔧 spec gap closure (P1 sub-task)`。Day 14-15 進行で update、Day 15 末で全 ✓ が target。

| 行 (12) | PageHeader register | Density | Card register | Table register | Footer register | Token compliance |
| --- | --- | --- | --- | --- | --- | --- |
| AppShell | N/A | ✓ | N/A | N/A | N/A | ✓ (P0 verify、touch なしで揃い済) |
| Sidebar | N/A | ✓ | N/A | N/A | N/A | ✓ (P0 verify) |
| TopBar | N/A | ✓ | N/A | N/A | N/A | ✓ (P0 verify) |
| Dashboard | ✓ (P1) | ✓ | ✓ | N/A | ✓ (P1) | ✓ (hex L351 → var(--color-fg-subtle)) |
| Inbox | ✏️ | ✏️ | ✏️ | ✏️ | ✏️ | ✓ (Day 14 開始時から 0 hit) |
| CaseReview | ✓ (P1) | ✓ | ✓ | N/A | ✓ (P1) | ✓ + 🔧 spec gap 1+2+3 closure 済 |
| SendBackComment | ✏️ | ✏️ | ✏️ | N/A | ✏️ | ✓ |
| ProposalReview | ✓ (P1) | ✓ | ✓ | N/A | ✓ (P1) | ✓ |
| AgentSettings | ✏️ | ✏️ | ✏️ | N/A | ✏️ | ✓ |
| AuditTrail | ✏️ | ✏️ | ✏️ | ✏️ | ✏️ | ✓ |
| Metrics | ✏️ | ✏️ | ✏️ | N/A | ✏️ | ✓ (hex L226 + L469 → var(--color-success)/var(--color-alert)) |
| KnowledgeBrowser | ✏️ | ✏️ | ✏️ | ✏️ | ✏️ | ✓ |

Token baseline 推移 (pre-flight 再計測 → P1 完了):
- **hex literal**: 3 hit (Day 14 開始) → **0 hit ✅** (commit `f1af8db` で 3 件すべて `var(--color-*)` resolve、`--color-fg-subtle` (#94a3b8) / `--color-success` (#10b981) / `--color-alert` (#f59e0b) は既存 token と 1:1 対応、allowlist exception 不要)
- **non-mono text-[Npx]**: 0 hit ✅ (allowlist 9/10/11/12/20 で吸収済)
- **inline style (width 除外)**: 0 hit ✅
- **drift 監視 (stale internal term)**: 0 hit ✅ (持ち越し C closure retain)
- **E console.log + slide-only mock** (target files): 0 hit ✅ (P1 spec gap 1)
- **F 本 case + audit trail** (RelatedRuleAlert + types.ts): 0 hit ✅ (P1 spec gap 2 + types.ts L92/L128 paraphrase)

P1 DOM smoke verify (`/cases/CASE-2026-0142`、Day 14 P1 完了後、commit `f1af8db` 状態):
- BusinessApprovalChip: wrapper span `title="業務承認画面 (Day 20 で実装予定の静的画面) は実装後に別タブで開きます"` + button `disabled` + `aria-disabled="true"` + `aria-label="業務承認画面を別タブで開く (Day 20 で実装予定)"`、`onClick` listener 完全削除、`cursor-not-allowed opacity-60` 適用 ✅
- RelatedRuleAlert: icon `lucide lucide-circle-alert` (AlertCircle、Bell 完全撤去) + `text-[var(--color-alert)]` token ✅
- 「更新内容を見る」link: visible / `href="/proposals/PROP-2026-031"` / `className="text-[11px] font-medium text-[var(--color-primary)] hover:underline"` ✅
- 関連手順 Alert 文言: 「本案件作成後に新ルールが承認されました ... (監査証跡 参照)」 (JP paraphrase 反映済) ✅
- Console error: 0 hit ✅

---

## 3. P0-P3 priority + 完了 criteria

(本 plan `~/.claude/plans/fuzzy-marinating-starfish.md` §5 mirror)

### P0: 共通 UI ズレ削減 (AI ~1.5h)

対象: AppShell / Sidebar / TopBar + shared/case primitive (PrototypeModeLabel / TrustLevelBadge / StatusBadge)

完了 criteria: 9 画面で AppShell / Sidebar / TopBar が visually identical、shell + shared chunk から token grep zero hit

### P1: Demo 中核 3 画面 + spec gap closure (AI ~2.5h)

対象: CaseReview / ProposalReview / Dashboard + BusinessApprovalChip + RelatedRuleAlert + types.ts + mock-cases.ts + docs/03 §4.1/§7 sync

完了 criteria: 3 画面 PageHeader が register 一致、spec gap 3 件 closure、grep zero hit (file-wide)、TypeScript compile pass

### P2: 残り 6 画面 (AI ~1.7h)

対象: Inbox / SendBackComment / AgentSettings / AuditTrail / Metrics / KnowledgeBrowser

完了 criteria: 6 画面 PageHeader / footer が P1 と register identical、6 画面から token grep zero hit、TypeScript compile pass

### P3: shared 抽出 (AI 0-1h、発生時のみ)

候補: PageFooter (7 画面) / FilterChipRow (3 画面)、PageHeader は降格 (prop 増えやすい)

抽出基準: 3 箇所以上同型 + prop ≤ 3 + net 行数減少 (全条件適合のみ)

---

## 4. Token audit allowlist (本 plan §4 embed)

### A. hex literal: token 化必須、Sparkline/Recharts も CSS var first try

- **first try**: Sparkline / Recharts color prop に `var(--color-primary)` 等を渡す + `getComputedStyle(document.documentElement).getPropertyValue('--color-primary')` で JS resolve
- **second try**: 上記不可なら allowlist に file:line で明示
- Dashboard `#94a3b8` (L351) は **必ず token 化** (slate-400 相当の var / Tailwind utility)

Allow (CSS var resolve 検証後の最終 allowlist):
- `prototype/src/index.css` 内 `--color-*` variable 定義
- (TBD) Sparkline / Recharts series color (CSS var resolve 失敗時のみ、Day 14 P1/P2 で確定して本 section に file:line で追記)

Grep:
```bash
grep -rEn "#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b" prototype/src --include="*.tsx" \
  | grep -vE "index\.css"
```

期待: 0 hit (現 3 hit → 0、Sparkline/Recharts は CSS var resolve / allowlist の二択)

### B. text-[Npx] arbitrary: 用途別 allow

- `text-[9px]` — R46 paradigm の snake_case sub-caption (AuditTrail / KnowledgeBrowser DetailRow `schemaKey`、body label sub-caption) + dense badge (ConfidenceBar) + axis label (Dashboard Sparkline)
- `text-[10px]` — mono numeric / case_id / version / timestamp
- `text-[11px]` — annotation / caption
- `text-[12px]` ≒ `text-xs` (Stripe 風 dense label)
- `text-[20px]` — KPI 数値 (Metrics page、font-semibold tabular)

Disallow: `text-[13/14/16/18/24/etc px]`

Grep:
```bash
grep -rEn "text-\[[0-9]+px\]" prototype/src --include="*.tsx" \
  | grep -vE "text-\[9px\]|text-\[10px\]|text-\[11px\]|text-\[12px\]|text-\[20px\]"
```

期待: 0 hit (現状 0、Day 15 末も 0 維持)

### C. inline `style={{`: width 動的計算のみ allow

Allow: `style={{ width: '${pct}%' }}` (ConfidenceBar / progress bar)

Disallow: color / padding / margin / border-radius / font-size の inline

Grep:
```bash
grep -rEn "style=\{\{" prototype/src --include="*.tsx" | grep -vE "width:"
```

期待: 0 hit (現状 0 維持)

### Drift 監視 grep (stale internal term)

```bash
grep -rEn "account-opening|agent-account-opening" prototype/src --include="*.tsx" \
  | grep -v "import\|from '@/"
```

期待: 増加 0 (持ち越し C closure retain)

---

## 5. Demo 中核 3 画面 spec gap closure list (P1 sub-task)

### Spec gap 1: BusinessApprovalChip

- **問題**: enabled no-op (`onClick={() => console.log(...)}`、L37) + user-facing で `slide-only mock` 露出 (title + aria-label)
- **修正**: 
  - `<span title="業務承認画面 (Day 20 で実装予定の静的画面) は実装後に別タブで開きます">` で button wrap
  - `<button disabled aria-disabled="true" aria-label="業務承認画面を別タブで開く (Day 20 で実装予定)">` (slide-only mock 撤去)
  - `onClick` 完全削除
- **docs sync (5 箇所)**: docs/03 §2.7.4 L26 / §2.7.5 L165 / §4.1 L232 / §7 L365 / §7 L367 を JP 化 + Day 14 disabled / Day 20 enable phase 明記

### Spec gap 2: RelatedRuleAlert

- **問題**: icon Bell (spec は AlertCircle) + JSDoc L9 + JSX 本文 L21 で「本 case」「audit trail」露出 + types.ts L92 + L128 JSDoc 同型残留
- **修正**:
  - icon `Bell` → `AlertCircle` (lucide-react import 1 行 + JSX 1 行)
  - JSDoc + JSX 本文「本 case」 → 「本案件」、「audit trail」 → 「監査証跡」 (file-wide grep で 0 hit)
  - types.ts L92 + L128 JSDoc 同 paraphrase (`proposalId?: string` 追加 commit と同時)

### Spec gap 3: RelatedRuleAlert optional link

- **問題**: spec §6.1 で「更新内容を見る」link → ProposalReview だが未実装
- **修正**:
  - types.ts `RelatedRuleUpdate.proposalId?: string` (optional) 追加
  - mock-cases.ts `CASE-2026-0142.relatedRuleUpdates[0]` (L159、唯一の entry) に `proposalId: 'PROP-2026-031'` 付与
  - RelatedRuleAlert.tsx で `u.proposalId &&` 条件 link rendering (proposalId なし update は link 非表示)

---

## 6. Day 15 gate 4 criteria + visual smoke export 規範

### Criterion 1: Build pass

```bash
cd prototype && npm run build
```

期待: `tsc -b` + `vite build` 共に exit 0、warning 0

### Criterion 2: Token / hygiene grep zero-hit

§4 の 4 grep (hex / non-mono text / inline style / stale term) を実行、Day 15 commit message に 4 行 zero-hit summary embed

### Criterion 3: Visual smoke + console error 0 + screenshot export

実 mock seed に固定 (9 route):
- `/dashboard`
- `/inbox`
- `/cases/CASE-2026-0142` (Demo Chapter 1 起点 + 関連 rule update Alert 表示)
- `/cases/CASE-2026-0142/comment`
- `/proposals/PROP-2026-031` (Demo Chapter 2 主提案)
- `/agents/agent-corporate-address-change` (UC-BO-01 Agent)
- `/audit`
- `/metrics`
- `/knowledge`

各 route で console error 0 確認 + `/cases/CASE-2026-0142` で BusinessApprovalChip disabled DOM 構造 confirm。1440 × 900 viewport screenshot を `prototype/screenshots/day-15-medium-fi/0X-{slug}.png` に export (連番命名 `01-dashboard.png` ... `09-knowledge-browser.png`)。

PNG commit policy (v2.1 M1):
- ≤ 5MB total → commit OK
- > 5MB → `.gitignore` 追加 + `_PROGRESS.md` §4 に path のみ記録

### Criterion 4: Design consistency (register 5 軸 visual diff)

9 screenshot を 3×3 grid に並べ、以下 5 軸で diff:
1. PageHeader sticky height (≤ 5px diff OK)
2. breadcrumb color / size (identical)
3. card primitive: border / radius / bg (identical)
4. table th/td padding (identical)
5. footer height + content alignment (identical)

### Gate sign-off

4 criteria 全 pass → `_PROGRESS.md` §3 Day 15 row `🟡 pending` → `✅ pass (<commit hash>)`
