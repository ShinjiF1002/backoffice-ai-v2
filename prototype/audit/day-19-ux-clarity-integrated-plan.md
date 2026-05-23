| 項目 | 値 |
| --- | --- |
| 文書 ID | DOC-AUDIT-D19-UXC-PLAN |
| 文書名 | Day 19+ UX Clarity Integrated Improvement Plan v1.3 (4-AI audit 統合 + user 確定要件 + critical review 2 round fix lock、7 Day 19 commit + Day 18.5 拡張 1 commit、Converged) |
| 版数 | v1.4 |
| ステータス | Approved (DOC-AUDIT-D19-UXC-REQ v1.4 確定要件 base、Cluster 1+2+3+4+5+6+7 全 23 question 回答 + critical review 4 round (v1.0→v1.1→v1.2→v1.3→v1.4) surgical patch 完了、**implementation-ready Converged (v1.4 hygiene)**) |
| オーナー | backoffice-ai-v2 maintainer |
| 承認者 | user (要件 doc v1.1 経由 設定承認) |
| 閲覧対象 | Internal / Day 19+ patch 実装 session |
| 機密区分 | Internal |
| 関連文書 | DOC-AUDIT-D19-UXC-REQ v1.4 (確定要件 SSOT) / DOC-AUDIT-D19-UXC-PROMPT v0.2 / 4-AI audit results / DOC-PROTO-CLAUDE / DOC-ROOT-CLAUDE / docs/02-approval-model.md §2.2 (Tier 1 vocab SSOT) / prototype/package.json (typescript ~6.0.2 既存 devDependency 使用、ts-morph 不要) |
| SSOT 区分 | Day 19+ patch 実装 plan SSOT (7 Day 19 commits + 1 Day 18.5 拡張 commit、各 commit の Touch files / Change summary / Verification / Scope-out 完備) |
| Evidence Status | empirical (要件 doc v1.1 SSOT 経由、4-AI audit convergence + user 11 質問回答 + source 検証 + screenshot verify + critical review 7 findings 反映) |
| 改版履歴 | v1.0 (2026-05-23): 初版作成、要件 doc v1.0 base、Day 18.5 拡張 + Day 19 patch 5 commit。v1.1 (2026-05-23): critical review 7 findings 反映 — (1) 件数 normalization、(2) Commit 0 option A 確定 lock、(3) Commit 2 DEV gate → `?debug=1` query opt-in 定数、(4) Commit 3 → 3a/3b/3c split、(5) DetailDrawer non-modal a11y、(6) Commit 4 footer caption option Y、(7) verification gate 10 = regex + Playwright DOM smoke。v1.2 (2026-05-23): v1.1 CR 4 findings surgical 反映 — gate 10 AST 化 + Commit 0 Touch files + Commit 3c NextActionStrip rule + §8 gate 10 sync。v1.3 (2026-05-23): v1.2 CR 5 findings surgical 反映 — (1) **P0**: gate 10 AST script を **既存 `typescript: ~6.0.2` devDependency 使用** に変更 (ts-morph 不要、新規 dep 追加なし)、Commit 0 Touch files から package.json/lock の change 除外、(2) **P0**: 旧 gate 10 文言 (regex + Playwright b.onclick) を requirements §5 + plan §9 / §10 / End of plan から完全削除、AST gate に統一、(3) **P1**: gate 10 pass 条件から `onKeyDown` / `aria-disabled` 単独削除 (4 条件のみ: `onClick` / `disabled` / `type="submit"` / `type="reset"`)、(4) **P1**: Commit 3c NextActionStrip ProposalReview summary `${metCount}/3 met` → `達成` + Commit 4 grep scope を `Metrics.tsx` → `prototype/src/pages/*.tsx` 全体拡張、(5) **P2**: title / 関連 docs / §9 / §10 / End の v1.1 stale 表記 → v1.3 統一 + Commit 3b 内の Demo シーン表記を曖昧表現から `Demo Chapter 2 の提案レビュー scene` に明確化。v1.4 (2026-05-23): v1.3 CR 4 round 目 3 hygiene findings surgical 反映 — (1) **P1**: requirements §1 matrix U-6 row + §4 Cluster 2 record の `Demo 1 シーンだけ` を plan SSOT (`Demo Chapter 2 の提案レビュー sceneだけ`) に統一、req vs plan SSOT 不一致解消、(2) **P2**: integrated-plan H1 が `v1.1` stale → `v1.3` に sync、(3) **P2**: integrated-plan §8 Master Summary heading + Day 19 新規 8 gate sub-heading 2 箇所の `v1.1 強化` → `v1.3 強化` に sync。**CR 4 round Converged**、implementation 開始可 |

---

# Day 19+ UX Clarity Integrated Improvement Plan v1.3

## 0. Plan Summary

- **Total commits**: **8** (Day 18.5 拡張 Commit 0 + Day 19 patch 7 commit = Commit 1/2/3a/3b/3c/4/5)
- **Total touch files**: ~26 files (新規 5 primitive + 9 page + 2 component + mock data 5 + lib 2 + shell 1 + 新規 scripts 1)
- **Total LOC**: ~1,140 (Day 18.5 拡張 ~50 + Day 19 patch ~1,090)
- **新規 shared primitive**: **5 件** (`HypothesisChip` / `Disclosure` / `DetailDrawer` / `PageHelpDisclosure` / `NextActionStrip`)
- **Day 18.5 patch との関係**: U-3 enabled no-op fix を Day 18.5 P0 拡張として **別 commit** で先行適用、Day 19 patch 7 commit は Day 18.5 全 P0/P1 patch と co-exist
- **Excluded scope**: U-21 docs/03 復旧 (現 SSOT 498 行で正常)、新規 route 追加禁止、Day 14-15 register / Day 18.5 micro-interaction re-audit 禁止
- **Defer scope**: U-15 Dashboard workflow lane (Phase 1)、U-19 Inbox FilterToolbar 統合 (Day 18.5 patch 後再判定)

## 1. Commit Sequence + Recommendation

| Order | Commit | Patch group | Touch files | LOC | Heuristic ID |
| ----- | ------ | ----------- | ----------- | --- | ------------ |
| **0** | Day 18.5 拡張: U-3 enabled no-op fix (3 件 button) | **Day 18.5 P0 拡張** | CaseReview / EvidenceTimeline / Sidebar / 新規 scripts/check-no-op.mjs | ~50 | NH1+NH5+NH9 |
| **1** | Day 19 P0: U-1 hedge HypothesisChip primitive + section-level | Day 19 patch | Metrics / AgentSettings / Dashboard / ProposalReview + HypothesisChip 新規 | ~150 | NH8+TUF |
| **2** | Day 19 P0: U-2 internal SSOT/schema leak (**`?debug=1` query opt-in 定数 gate**) | Day 19 patch | AuditTrail / KnowledgeBrowser + 新規 `prototype/src/lib/show-internal.ts` | ~80 | NH2+NH6 |
| **3a** | Day 19 P0: U-5 framing disclosure | Day 19 patch | Metrics / AuditTrail / KnowledgeBrowser + PageHelpDisclosure 新規 | ~120 | NH8+NPD |
| **3b** | Day 19 P0+P1: U-4 + U-6 + U-12 drawer primitives | Day 19 patch | CaseReview + EvidenceTimeline + ProposalReview + Inbox + Disclosure + DetailDrawer 新規 | ~220 | SM3+NPD+PDR |
| **3c** | Day 19 P1: U-13 NextActionStrip primitive | Day 19 patch | Dashboard + Inbox + CaseReview + ProposalReview + NextActionStrip 新規 | ~90 | NH1+K5S+NH7 |
| **4** | Day 19 P1: U-7 + U-8 + U-9 + U-11 + U-14 + U-16 microcopy SSOT (option Y) | Day 19 patch | 全 9 page + PrototypeModeLabel + BusinessApprovalChip + lib/sendback-categories | ~250 | NH2+NH4+NH8 |
| **5** | Day 19 P2: U-10 + U-17 + U-18 + U-20 P2 batch | Day 19 patch | StagingHintPanel + CaseReview + AgentSettings + mock-cases + mock-proposals + mock-agents + lib/sendback-categories | ~180 | NH8+TUF |

**Apply 順**:
- **先**: Commit 0 (Day 18.5 拡張) → Day 18.5 patch 全体と一括 apply (regulated UI 信頼性 baseline)
- **後**: Day 19 Commit 1 → 2 → 3a → 3b → 3c → 4 → 5 (各 commit 後 8 + 8 verification gate retain 確認)
- **co-exist**: Day 18.5 patch + Day 19 patch は同 Day 19 内 apply 可、両 patch direct conflict なし
- **Rollback unit**: 8 commits 各々独立 rollback 可、Commit 3 split (3a/3b/3c) で rollback 粒度を確保

---

## Commit 0 — `fix(day-18-5-ext): residual enabled no-op in CaseReview/EvidenceTimeline/Sidebar` (U-3, **Day 18.5 P0 拡張**, NH1+NH5+NH9)

- **目的**: GPT-5.5 Pro 独占検出 + source 検証で確定した 3 残余 enabled no-op を Day 18.5 P0 既存 patch と同 batch で fix、regulated UI 信頼性 baseline 拡張
- **判断基準該当**: C1 (5 sec primary action 識別) + C4 (enabled no-op 増加禁止) + C7 (Day 18.5 gate retain)
- **Fix mode (v1.1 lock、option A 確定)**:
  - **CaseReview 承認 button (`CaseReview.tsx:210-216`)** = **in-memory state mock 動作化**: `onClick={() => { setCaseApproved(true); setTimeout(() => navigate('/inbox'), 3000); }}` + footer に `{caseApproved && <div role="status" aria-live="polite">本案件は承認されました (mock)</div>}` flash。Demo Chapter 1 narrative 整合、`prototype/CLAUDE.md` Plan v1.4 P0-3 in-memory mock state 原則遵守
  - **EvidenceTimeline プレビュー button (`EvidenceTimeline.tsx:57-59`)** = `<DisabledAction mode="wrapper" reason="本 prototype では PDF プレビューは未実装、Phase 1 で実装予定">` 化
  - **Sidebar user menu (`Sidebar.tsx:100-108`)** = `<button>` → `<div role="status" aria-label="プロトタイプ表示: ユーザー切替は scope-out">` semantic 化 (user role 切替 navigate なし、`<DisabledAction>` は form submit context 系で非整合、`<div>` semantic が適切)
- **Touch files**:
  - `prototype/src/pages/CaseReview.tsx` (承認 button + caseApproved state + footer flash)
  - `prototype/src/components/case/EvidenceTimeline.tsx` (プレビュー button → DisabledAction)
  - `prototype/src/components/shell/Sidebar.tsx` (user menu button → div)
  - `prototype/scripts/check-no-op.mjs` (新規、**TypeScript Compiler API AST script、既存 `typescript: ~6.0.2` devDependency 使用** = ts-morph 追加不要、`package.json` / `package-lock.json` touch なし)、verification gate 10 主 gate で使用、build-time AST 走査 (Playwright runtime ではない)
- **Change summary**: CaseReview 承認は L1 primary CTA 維持 + in-memory mock で Demo flow 整合、EvidenceTimeline + Sidebar は disabled / static semantic に統合、3 場所すべて enabled no-op 解消。Day 18.5 既存 P0 patch (Inbox filter chip + TopBar Notification) と同 SSOT pattern。
- **Verification (Day 18.5 既存 gate + v1.3 強化 sub-check)**:
  - build pass warning 0 / 8 grep gate retain / 9 route DOM smoke retain / sticky top=56px retain / Chip taxonomy retain / Lighthouse a11y retain / keyboard focus retain
  - **v1.3 gate 10 (typescript Compiler API + pass 条件 strict)**:
    - (a) **主 gate = TypeScript Compiler API AST script** (`prototype/scripts/check-no-op.mjs`、**既存 `typescript: ~6.0.2` devDependency 使用、ts-morph 不要**): `pnpm exec node prototype/scripts/check-no-op.mjs` で全 `.tsx` file の JSX `<button>` (JsxOpeningElement + JsxSelfClosingElement) を走査、**pass 条件 = `onClick` / `disabled` / `type="submit"` / `type="reset"` の 4 条件のみ** (4 条件いずれも欠落 = enabled no-op として `process.exit(1)`)。`onKeyDown` 単独は除外 (`<button>` は browser native で Enter/Space → click 自動発火のため `onClick` で十分)、`aria-disabled` 単独も除外 (visual のみで native disabled でない、`disabled` 併用時補助扱い)。Whitelist: `<DisabledAction>` JSX wrapper (button tag ではない)、form submit context 内 `type="submit"` button。**実装 sketch**: `import ts from 'typescript'; import { readFileSync, readdirSync, statSync } from 'fs'; import { join } from 'path'; function walk(dir, ext, out = []) { for (const e of readdirSync(dir)) { const f = join(dir, e); if (statSync(f).isDirectory()) walk(f, ext, out); else if (f.endsWith(ext)) out.push(f); } return out; } const noOp = []; for (const file of walk('./prototype/src', '.tsx')) { const src = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX); function visit(node) { if ((ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) && node.tagName.getText() === 'button') { const has = (n) => node.attributes.properties.some(a => ts.isJsxAttribute(a) && a.name.getText() === n); const t = node.attributes.properties.find(a => ts.isJsxAttribute(a) && a.name.getText() === 'type')?.initializer?.getText() ?? ''; if (!has('onClick') && !has('disabled') && !t.includes('submit') && !t.includes('reset')) noOp.push(\`\${file}:\${src.getLineAndCharacterOfPosition(node.getStart()).line + 1}\`); } ts.forEachChild(node, visit); } visit(src); } if (noOp.length) { console.error('enabled no-op:', noOp); process.exit(1); }`
    - (b) **補助 gate = Playwright role audit**: 9 route × `document.querySelectorAll('button')` の Tab order + `:focus-visible` 整合性 + `aria-label` 存在 (role 一貫性のみ、`b.onclick` は React event delegation で false negative のため使用しない)
    - **理由**: v1.1 の `grep -E` lookahead は POSIX ERE 不対応エラー、Playwright `b.onclick` は React synthetic event で false negative、ts-morph は既存 devDependency 外 (新規追加で `package.json` + `package-lock.json` touch 必要になるため不採用)、既存 `typescript: ~6.0.2` の Compiler API で同等 (JsxOpeningElement + JsxSelfClosingElement 走査 + attribute check) を実現
  - CaseReview 承認 button: keyboard Enter + click で in-memory state mock 動作確認 (option A)、3 秒後 `/inbox` navigate
  - EvidenceTimeline プレビュー: `<DisabledAction>` disabled + reason tooltip visible
  - Sidebar user menu: `<div>` semantic、focusable なし
  - first-click test (NFC) CaseReview: 初見ユーザが「承認」 (actually works) を 5 秒識別
- **Scope-out**: Phase 1 backend 接続時の実 functionality、PDF 実 preview 実装、user role 切替の実 access enforcement

---

## Commit 1 — `feat(day-19-ux): HypothesisChip primitive + section-level hedge consolidation` (U-1, P0, NH8+TUF+Anti-pattern「Hedge over-display」)

- **目的**: 25+ surface に反復する `[仮説 / 要検証]` hedge を **section-level (Metrics 3 surface) + page-level (AgentSettings/Dashboard 各 1)** に集約、Codex section-level approach + Claude design HypothesisChip primitive の合成案
- **判断基準該当**: C1 (Hero KPI signal 強化) + C2 (KPI/SLO 値の hedge 性質保全) + C4 (enabled no-op なし) + C7 (gate retain)
- **Touch files**:
  - `prototype/src/components/shared/HypothesisChip.tsx` (新規) — props: `kind: 'framing' | 'summary'` + `children`、framing kind = slate-50 inset + Info icon、summary kind = mono chip 12px (MetaChip 系列、Day 16 C1a taxonomy 遵守)
  - `prototype/src/pages/Metrics.tsx` — Hero 4 KPI per-card hedge 4 reps 削除 + section top に `<HypothesisChip kind="summary">仮判定 2/4 (4 KPI 全て [仮説 / 要検証])</HypothesisChip>`、補助 KPI table 3 hedge 削除 + 上に summary chip 1、9 KRI grid 9 hedge 削除 + 上に summary chip 1 = **section-level 3 surface** (16 → 3)
  - `prototype/src/pages/AgentSettings.tsx` — Hero 4 KPI 進化要件 grid 4 hedge 削除 + section header 横に summary chip 1 = **page-level 1 surface** (4 → 1)
  - `prototype/src/pages/Dashboard.tsx` — Sparkline label hedge × 2 削除 + 業務 card section header に summary chip 1、注意 strip 内 hedge inline 削除 = **page-level 1 surface** (4 → 1)
- **Change summary**: HypothesisChip primitive で hedge 反復を 25+ → 9 (page あたり ≤ 3) に集約、L1 inline reps → L1 section-level summary + L4 framing SSOT に re-layer、Tier 1 governance (KPI/SLO 数値は仮説) は section heading で確実 visible、TUF data-ink ratio 改善
- **Verification**:
  - Day 18.5 既存 8 gate retain + Day 18.5 patch co-exist
  - **新規 sub-check**:
    - `grep -nE '\[仮説 / 要検証\]' prototype/src/pages/*.tsx` で **9 page 合計 ≤ 9 hits** (削減 25+ → 9)
    - `<HypothesisChip kind="summary">` DOM smoke (Metrics 3 + AgentSettings 1 + Dashboard 1 = 5 total visible)
    - Metrics page で Hero 4 KPI card border color + summary chip 1 visible
  - first-click test (NFC) Metrics: 「Hero 4 KPI card border color + summary chip」5 秒識別、framing 注 + per-card hedge への misclick 0%
- **Scope-out**: per-card に追加 visual indicator、framing 注 paragraph 本体短縮 (Commit 3a)、ProposalReview mock summary hedge (Commit 5)

---

## Commit 2 — `chore(day-19-ux): SHOW_INTERNAL_METADATA query opt-in gate for snake_case + DOC-*` (U-2, P0, NH2+NH6)

- **目的**: AuditTrail + KnowledgeBrowser の expanded DetailPanel から snake_case schema key + `DOC-*` doc reference + `body` raw schemaKey を **`?debug=1` query opt-in 定数 gate** で hide、本番 / demo / dev server 全 default hidden (v1.1 critical review 反映、`import.meta.env.DEV` は dev server demo 時に leak のため不採用)
- **判断基準該当**: C1 (expand panel scan 効率) + C5 (Tier 2 paraphrase、internal SSOT 用語 leak 0) + C7 (gate retain)
- **Touch files**:
  - `prototype/src/lib/show-internal.ts` (新規) — `export const SHOW_INTERNAL_METADATA = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('debug') === '1'`、default false (production / demo / dev server 全 hidden)、URL `?debug=1` で opt-in 可。SSR 安全 (`typeof window !== 'undefined'` guard)
  - `prototype/src/pages/AuditTrail.tsx`:
    - `DetailRow` `schemaKey` sub-caption 表示部を `{SHOW_INTERNAL_METADATA && <div className="font-mono text-[9px] text-slate-400 tabular">{schemaKey}</div>}` で gate (Line 412-419)
    - `DetailPanel` header の `DOC-KNW-04 §8.1` mono chip 完全削除 (Line 280-282)
    - PageHeader mono caption `15 項目構造 · 関連項目 含む実 18` → `15 項目記録` paraphrase (Line 119-121)
    - framing 注本体 (Line 147-160) 後半を 50字以下に短縮 (本 commit + Commit 3a で PageHelpDisclosure wrap)
  - `prototype/src/pages/KnowledgeBrowser.tsx`:
    - `DetailRow` `schemaKey` 同 gate (Line 432-435)
    - `DetailPanel` header `DOC-ROOT-_SSOT §1.4` mono 削除 (Line 341-344)
    - 本文 section の `<span>body</span>` schemaKey 完全削除 (F-13 同時解消)
  - `prototype/src/lib/knowledge-labels.ts` — `formatKnowledgeSourceLabel` を basename-only 表示 (例: `fukuoka.md`、full path 不要)
- **Change summary**: **`?debug=1` query opt-in 定数** (`import.meta.env.DEV` 不使用、dev server demo safe) で AuditTrail + KnowledgeBrowser の expand panel 内 schemaKey 表示を gate、本番 / demo / dev server 全 default invisible、URL opt-in で visible。`DOC-*` doc reference は完全削除 (audit doc trace は JSDoc 経由)、`body` raw schemaKey は本文 section header から削除、`formatKnowledgeSourceLabel` basename 抽出で path 短縮。**L3 → L4 (query opt-in)** demote
- **Verification**:
  - Day 18.5 既存 8 gate retain + Day 18.5 patch co-exist
  - **新規 sub-check**:
    - `pnpm build` 後 `dist/assets/*.js` 内に `DOC-KNW-04` / `DOC-ROOT-_SSOT` / `case_id` / `workflow_id` / `body` raw 文字列残置 (`SHOW_INTERNAL_METADATA` 経由 conditional render のため build には含まれる、ただし default render では invisible) — runtime DOM check で confirm
    - Default URL (`?debug=1` なし) で expand panel 内 schemaKey + DOC-* invisible (DOM check)、`?debug=1` URL で visible (opt-in 動作確認)
    - AuditTrail PageHeader mono caption が `15 項目記録` paraphrase 済
    - KnowledgeBrowser expand 内 `formatKnowledgeSourceLabel` basename short form (例: `fukuoka.md`)
  - first-click test (NFC) AuditTrail (default URL): row click → expand で 15 JP label + value のみ visible、`DOC-*` / snake_case 0 hit → 5 秒で「監査詳細項目」識別 pass
- **Scope-out**: AuditTrail / KnowledgeBrowser 以外 page の internal vocabulary leak (CR-5 grep 0 hit 確認済)、`(検証用項目)` note framing 注 expand 化 (Commit 3a + 4)、本文 (`body`) value 自体の trim (Commit 5 mock trim)

---

## Commit 3a — `feat(day-19-ux): PageHelpDisclosure primitive + framing 注 L4 expand` (U-5, P0, NH8+NPD)

- **目的**: Metrics + AuditTrail + KnowledgeBrowser 3 page の framing 注 box (NH8 + Anti-pattern「Hedge over-display」) を `<PageHelpDisclosure>` 新規 primitive で L4 expand 化、KnowledgeBrowser citation governance 1 sentence は L1 PageHeader subtitle として carve-out 残置
- **判断基準該当**: C1 (5 sec scan 改善) + C2 (citation governance carve-out 規制 retain) + C3 (1-click L4 disclosure) + C7 (gate retain)
- **Touch files**:
  - `prototype/src/components/shared/PageHelpDisclosure.tsx` (新規) — props: `title` (例: `本画面の説明`) + `children` (framing 注 body)、page header 右に `ℹ️` icon button、default closed / no persistence (Codex 案 Cluster 1 採用)
  - `prototype/src/pages/Metrics.tsx` (Line 139-155) — framing 注 box を `<PageHelpDisclosure title="本画面の説明">...</PageHelpDisclosure>` で wrap
  - `prototype/src/pages/AuditTrail.tsx` (Line 147-160) — 同 wrap (Commit 2 で paraphrase 済の本体を wrap)
  - `prototype/src/pages/KnowledgeBrowser.tsx` (Line 137-149) — 2 sentence 分割: `AI が引用根拠として使えるのは承認済ナレッジのみ` (Tier 1 governance core) は **L1 PageHeader subtitle 残置**、`ナレッジは 承認済 / 確認済 / 未承認 の 3 段階で管理されます` は `<PageHelpDisclosure>` 内 L4 expand 化
- **Change summary**: PageHelpDisclosure 新規 primitive で 3 page framing 注を L1 常時表示 → L4 expand (default closed)。KnowledgeBrowser citation governance 1 sentence は規制 / 監査 retain で L1 subtitle に残置 (carve-out 規範)。L1 → L4 (expand) demote、ただし governance core は L1 retain
- **Verification**:
  - Day 18.5 既存 8 gate retain
  - **新規 sub-check**:
    - `<PageHelpDisclosure>` DOM smoke: 3 page で defaultOpen={false} で render、icon button click で expand
    - KnowledgeBrowser PageHeader subtitle に `引用根拠は承認済のみ` 1 sentence visible (carve-out 確認)
  - first-click test 不要 (P0 framing 解消、primary action unchanged)
- **Scope-out**: framing 注本体の更なる短縮 (Commit 2 で AuditTrail paraphrase 済、KnowledgeBrowser + Metrics は wrap のみ)

---

## Commit 3b — `feat(day-19-ux): Disclosure + DetailDrawer primitives + L1 paraphrase + drawer batch` (U-4 + U-6 + U-12, P0+P1, SM3+NPD+PDR)

- **目的**: EvidenceTimeline dev cadence + ProposalReview 4-col + Inbox row click の 3 disclosure gap を Disclosure + DetailDrawer 2 primitive で同 batch 解消、**DetailDrawer は `<aside role="complementary">` non-modal a11y (PDR pattern 厳守、v1.1 critical review 反映)**
- **判断基準該当**: C1 (5 sec primary action 識別、CaseReview hero scan path 正常化) + C2 (citation governance retain) + C3 (1-click PDR + non-destructive + 同 route 内) + C4 (enabled no-op 0) + C7 (gate retain)
- **Touch files**:
  - `prototype/src/components/shared/Disclosure.tsx` (新規) — `<details>` semantic wrapper、props: `title` + `defaultOpen` + `children` (3 props)、`aria-expanded` + `aria-controls` 自動付与、chevron rotation transition (Day 18.5 既存 pattern)
  - `prototype/src/components/shared/DetailDrawer.tsx` (新規、**v1.1 a11y lock**) — **`<aside role="complementary" aria-labelledby="drawer-title">`** non-modal drawer、props: `open` + `onClose` + `title` + `children` (4 props、title slot で扱えば 3 props)、**focus trap なし** (PDR pattern 厳守、background interactive 維持)、**body scroll 保持** (non-destructive)、ESC + backdrop click で close、`<dialog>` HTML element 不使用 (modal default のため)、aria-modal 属性は付与しない (complementary landmark で十分)
  - `prototype/src/components/case/EvidenceTimeline.tsx` (U-4):
    - step `actor: AI · source: ai.address-extractor-v2.3 · conf: 0.92` mono cadence を **L1 paraphrase** に変更: `AI 抽出 (v2.3) · 信頼度 0.92` (raw `actor:` / `source:` / `conf:` 3 prefix 削除)
    - step click で `<DetailDrawer>` open、drawer 内に raw identifier (`actor: AI`, `source: ai.address-extractor-v2.3`, `confidence: 0.92`, `log: ...`) + step name + timestamp + 内部 status visible (監査担当 persona 向け full detail、Demo Chapter 2 の提案レビュー scene default open は demo-script.md `?demo=1` query 経由)
  - `prototype/src/pages/ProposalReview.tsx` (U-6):
    - grid-cols-12 → grid-cols-{4,8} 2-col 変更
    - 左 4/12 = 判定基準 + 元案件 + 未承認ヒント (existing 3 panel、未承認ヒントは中央下 inline summary に移動)
    - 中央 8/12 = 提案差分 hero (6/12 → 8/12 拡大)
    - 右 column 削除、`<DetailDrawer trigger="提案詳細を見る (RACI + メタ情報)">` で右 drawer 化 (RACI 5-row + 提案メタ 4-row content)
    - **Demo Chapter 2 の提案レビュー sceneだけ RACI default open** (Cluster 2 Q1 採用、demo-script.md `?demo=1` query 時に drawer.open=true)
    - SoD note は L4 footer caption 化 (Commit 4)
  - `prototype/src/pages/Inbox.tsx` (U-12):
    - `onClick={() => navigate(/cases/${c.id})}` を `onClick={() => setSelectedCaseId(c.id)}` に変更 (`useState` で state mgmt)
    - `<DetailDrawer open={selectedCaseId !== null} onClose={() => setSelectedCaseId(null)} title={selectedCaseId ?? ''}>` で右 drawer mount
    - drawer 内 content = case summary preview (`getCaseById(selectedCaseId)` の `fields[0..2]` + `confidence` + `alertCount` + `citations.length`)
    - drawer 内 CTA `<Link to={\`/cases/${selectedCaseId}\`}>案件レビューを開く</Link>` で full navigate (drill-down)
- **Change summary**: 2 shared primitive (Disclosure + DetailDrawer) 一括導入、DetailDrawer は **non-modal a11y** で PDR pattern 厳守 (focus trap なし、background interactive、body scroll 保持)。L1 → L3 demote: EvidenceTimeline raw prefix paraphrase + drawer expand、ProposalReview 右 column → drawer、Inbox row click → drawer preview。Demo Chapter 2 narrative integrity: ProposalReview drawer は Demo Chapter 2 の提案レビュー scene default open。Anti-pattern 回避: Modal cascade なし (drawer 内 modal 禁止)、Tooltip dependency なし (primary info は L1 NextActionStrip (Commit 3c) / L3 drawer)
- **Verification**:
  - Day 18.5 既存 8 gate retain + Day 18.5 patch co-exist
  - **新規 sub-check**:
    - `<DetailDrawer>` DOM smoke: Inbox row click + ProposalReview drawer trigger button = 2 instance、open/close + ESC + backdrop click 確認、`role="complementary"` 設定 + `aria-modal` 属性なし、body scroll 維持 (drawer 開閉中も page scroll 可)、background interactive (Tab で page 要素にも focus 移動可)
    - `<Disclosure>` DOM smoke: aria-expanded + aria-controls + chevron rotation 確認
    - EvidenceTimeline L1 paraphrase: `grep -nE 'actor:|source:|conf:' prototype/src/components/case/EvidenceTimeline.tsx` で 0 hit (raw prefix 削除確認)
    - ProposalReview 中央 8/12 提案差分 hero width 拡大確認 (grid-cols-{4,8})
  - first-click test (NFC):
    - Inbox: row click → drawer open → drawer 内 CTA「案件レビューを開く」5 秒で識別
    - CaseReview: EvidenceTimeline step click → drawer expand 「証跡詳細」5 秒で識別
    - ProposalReview: 中央 8/12 提案差分 hero visible、5 秒で「差分 review」identify
- **Scope-out**: ProposalReview 提案 summary 短縮 (Commit 5 mock trim)、CaseReview 注意 strip `source:` prefix (Commit 4 paraphrase)、CitationPanel 各 entry expand drawer (Phase 1 で再判定)、NextActionStrip (Commit 3c)

---

## Commit 3c — `feat(day-19-ux): NextActionStrip primitive + 4 page L1 anchor` (U-13, P1, NH1+K5S+NH7+NFC)

- **目的**: GPT-5.5 Pro 独占検出の Dashboard/Inbox/CaseReview/ProposalReview の L1 primary action anchor 不在を `<NextActionStrip>` 新規 primitive で 4 page に追加、5 秒識別性向上 (NH1 Visibility + K5S 5-Second Test + NH7 Flexibility + NFC First-Click Test)
- **判断基準該当**: C1 (5 sec primary action 識別) + C7 (gate retain)
- **Touch files**:
  - `prototype/src/components/shared/NextActionStrip.tsx` (新規) — props: `label` (例: `次に処理すべき案件`) + `summary` (例: `CASE-2026-0148 (経過 03:45:51)`) + `actionHref` (`/cases/CASE-2026-0148`、null なら summary mode CTA なし) (3 props)
  - `prototype/src/pages/Dashboard.tsx` — page top に `<NextActionStrip label="次に処理すべき案件" summary={\`${recommendedCase.id} (経過 ${recommendedCase.elapsedLabel})\`} actionHref={\`/cases/${recommendedCase.id}\`} />` 追加、attention strip 自体は L2 demote。**v1.2 lock - 推奨案件 rule**: `const isDemo = new URLSearchParams(location.search).get('demo') === '1'; const recommendedCase = isDemo ? mockCases.find(c => c.id === 'CASE-2026-0142')! : mockCases.filter(c => c.alertCount > 0).sort((a, b) => parseElapsed(b.elapsedLabel) - parseElapsed(a.elapsedLabel))[0]` — default = operational priority (SLA elapsed 最大の alert case、現 mock では CASE-2026-0148)、`?demo=1` 時 = Demo Chapter 1 起点 CASE-2026-0142 固定
  - `prototype/src/pages/Inbox.tsx` — PageHeader 直下に同 NextActionStrip 追加、同 `isDemo` 分岐 logic で `recommendedCase` 抽出 (queue table の最上位行と無関係に operational priority で決定、Demo 時のみ CASE-2026-0142 固定)
  - `prototype/src/pages/CaseReview.tsx` — PageHeader 直下に `<NextActionStrip label="判定 summary" summary={\`AI 入力結果 5 field 確認、信頼度 0.84 で閾値未達、注意 ${alertCount} 件\`} actionHref={null} />` 追加 (summary mode、CTA は footer の差戻し / 承認 button)
  - `prototype/src/pages/ProposalReview.tsx` — PageHeader 直下に `<NextActionStrip label="提案 summary" summary={\`元案件 3 件、判定基準 ${metCount}/3 達成、提案差分 ${diffCount} ファイル\`} actionHref={null} />` 追加 (v1.3 lock: `met` → `達成` paraphrase、Commit 4 grep scope と整合)
- **Change summary**: NextActionStrip 新規 primitive で 4 page に L1 primary action anchor 追加、Dashboard/Inbox = `actionHref` 付き CTA、CaseReview/ProposalReview = summary mode (CTA は既存 footer button)。L0 → L1 (add)、抽出基準 (3+ instance + prop ≤ 3) 4 page で適合
- **Verification**:
  - Day 18.5 既存 8 gate retain
  - **新規 sub-check**:
    - `<NextActionStrip>` DOM smoke: 4 page で render、`actionHref=null` の summary mode visible、`actionHref` ありの mode で `<Link>` element + click navigate
  - first-click test (NFC) Dashboard (default URL): `<NextActionStrip>` の `CASE-2026-0148 を開く` CTA visible (operational priority)、5 秒で primary action 識別 pass
  - first-click test (NFC) Dashboard (`?demo=1`): `CASE-2026-0142 を開く` CTA visible (Demo Chapter 1 固定)
  - first-click test Inbox: 同様、`isDemo` 分岐に応じて recommended row CTA 5 秒識別 pass
- **Scope-out**: Phase 1 backend 接続時の SLA elapsed dynamic 計算 (現状 mock data 由来 elapsed 表示)、recommended next case 選定 logic の更なる高度化 (alert weight + workflow 優先度 + assignee 等の multi-criteria、現状 SLA elapsed 単軸 + Demo 固定の 2 mode で十分)

---

## Commit 4 — `chore(day-19-ux): microcopy SSOT + option Y footer caption consolidation` (U-7 + U-8 + U-9 + U-11 + U-14 + U-16, P1, NH2+NH4+NH8)

- **目的**: 9 page footer caption + Tier 1 vocab 表記揺れ + raw internal vocab (`citation` / `source:` / `field` / `step` / `met/miss`) + `(5 分類)` reps + SendBackComment radio description + ProposalReview free-floating span を **option Y SSOT** (PageFooter caption 全 9 page で削除、DisabledAction reason + PrototypeModeLabel general framing に集約、v1.1 critical review 反映) で SSOT 化
- **判断基準該当**: C2 (Tier 1 governance core retain) + C4 (Day 18.5 SSOT 統合) + C5 (Tier 2 paraphrase + JP-only) + C7 (gate retain)
- **Touch files**:

  ### U-7 footer caption option Y (PageFooter caption 全削除):
  - `prototype/src/components/shared/PrototypeModeLabel.tsx` (Line 50 拡張) — tooltip 末尾「・検索 / 通知 / 一括操作 / フィルタは次の実装段階で対応」を「・検索 / 通知 / 一括操作 / フィルタ等の機能は次の実装段階で対応」に generalize (page-agnostic general mock framing、9 種類列挙不要)
  - **9 page PageFooter `caption` prop 全削除**:
    - Inbox.tsx:254 / SendBackComment.tsx:332 / ProposalReview.tsx (Commit 内 U-16 と同時) / AgentSettings.tsx:435 / AuditTrail.tsx:265 / Metrics.tsx:494 / KnowledgeBrowser.tsx:326 / Dashboard.tsx:407 — 全 page で `<PageFooter caption={...}>` の caption prop 削除 (PrototypeModeLabel general framing で代替)
  - **DisabledAction `reason` prop は per-button specific reason 保持** (差戻し記録 / 業務責任者へ送付 / 変更を申請 等の disabled CTA 個別 reason は DisabledAction prop に集約、page footer caption に重複させない)

  ### U-8 Tier 1 vocab 統一 (`承認者承認` 全統一、`業務承認` 全削除):
  - `prototype/src/pages/Dashboard.tsx:193` chip 文言 `承認待ち` → `承認者承認待ち`
  - `prototype/src/components/shared/BusinessApprovalChip.tsx` — `業務承認: 未提出` / `業務承認: 承認済` 等 → `承認者承認: 未提出` / `承認者承認: 承認済`、コンポーネント名 `BusinessApprovalChip` は code 内 keep
  - `prototype/src/data/mock-cases.ts` — `businessApprovalStatus` field の display value 確認 (data 側 raw enum keep、UI 側で paraphrase)

  ### U-9 raw internal vocab paraphrase (CR-4 target 4 + 6 + GPT-5.5 Pro 独占 `met/miss`):
  - CaseReview 注意 strip 内 `source: OCR 抽出` / `source: マスタ照合` (Line 100-115) → `source:` prefix 削除 (注意 文言 inline で context 自明)
  - StagingHintPanel section header `未承認ヒント — citation 対象外` → `未承認ヒント — 引用根拠 対象外`
  - `prototype/src/pages/Metrics.tsx` (Line 179-183) — `仮判定 met / miss` legend chip → `仮判定 達成 / 未達`、`evaluateGate` 関数 enum keep (code 内)、UI 側 conditional render で JP

  ### U-11 `(5 分類)` redundant suffix 削除:
  - `prototype/src/pages/KnowledgeBrowser.tsx:300` snippet meta + `:381` expand DetailRow value
  - `prototype/src/pages/AuditTrail.tsx:251` 同様削除

  ### U-14 SendBackComment radio description L3 demote:
  - `prototype/src/pages/SendBackComment.tsx` — 5 radio description を `<Disclosure defaultOpen={isSelected}>` で wrap (Commit 3b 新規 primitive)
  - `prototype/src/lib/sendback-categories.ts` — description 短縮 (50-80字 → 30字以内、L1 短縮版 default、Commit 5 mock trim 連動)

  ### U-16 ProposalReview free-floating span (Day 18.5 SSOT 違反 fix):
  - `prototype/src/pages/ProposalReview.tsx:306-308` `<span>...(承認動作は次の実装段階で対応)</span>` 完全削除
  - 両 `<DisabledAction mode="wrapper">` の `reason` prop に「業務責任者送付動作は次の実装段階で対応」「差戻し動作は次の実装段階で対応」を per-button specific に設定 (option Y SSOT、PageFooter caption は同 Commit で削除済)
- **Change summary**: option Y SSOT 採用 — PrototypeModeLabel = page-agnostic general framing (検索 / 通知 / 一括操作 / フィルタ 等の機能 generalize)、DisabledAction reason = per-button specific reason (差戻し / 承認 / 申請 等)、PageFooter caption = **全 9 page で削除**。Tier 1 vocab 「承認者承認」全統一、raw internal vocab (`source:` / `citation` / `met/miss`) paraphrase、`(5 分類)` 削除、SendBackComment radio description Disclosure 化、ProposalReview free-floating span 削除。**L1/L3 paraphrase + L4 SSOT 統合**
- **Verification**:
  - Day 18.5 既存 8 gate retain + Day 18.5 patch co-exist
  - **新規 sub-check**:
    - `grep -nE 'caption=' prototype/src/pages/*.tsx` で `<PageFooter caption=...>` 0 hit (option Y SSOT 確認、全 9 page で削除)
    - `grep -nE '次の実装段階で対応' prototype/src` で `PrototypeModeLabel.tsx` 1 hit + `<DisabledAction reason=...>` 内のみ visible、page footer caption 直書き 0 hit
    - `grep -nE '承認待ち' prototype/src/pages` で `承認者承認待ち` のみ hit、`承認待ち` 単体 0 hit
    - `grep -nE '業務承認' prototype/src` で 0 hit (component 名 `BusinessApprovalChip` は code 内 keep、user-facing wording 0)
    - `grep -nE 'citation[^/_-]' prototype/src/{pages,components}` で raw `citation` 英語 0 hit
    - `grep -nE 'source:' prototype/src/{pages,components}` で raw `source:` prefix 0 hit
    - `grep -nE '\\bmet\\b|\\bmiss\\b' prototype/src/pages/*.tsx` (**v1.3 lock**: Metrics.tsx 限定 → pages/*.tsx 全体に拡張、ProposalReview NextActionStrip summary の `met` 漏れ防止) で 英語 0 hit (`evaluateGate` 関数 enum は code 内 keep)
    - `grep -nE '\\(5 分類\\)' prototype/src/pages` で 0 hit
  - JP-only check: 本 commit で新規追加 wording は JP のみ
  - first-click test 不要 (microcopy のみ、primary action unchanged)
- **Scope-out**: `docs/02-approval-model.md §2.2` の SSOT 自体の編集 (本 commit は UI 側統一のみ)、`(検証用)` chip suffix (現状 MetaChip 表示は L2 OK、本 commit touch なし)、shared microcopy SSOT (`lib/ui-copy.ts`) の強制抽出 (3+ reps 満たす wording のみ shared 化判断、本 commit は inline page-local で OK)

---

## Commit 5 — `chore(day-19-ux): P2 batch (StagingHint collapsed + AgentSettings Hero trim + CaseReview footer + mock trim)` (U-10 + U-17 + U-18 + U-20, P2, NH8+TUF)

- **目的**: P2 batch で StagingHintPanel collapsed (Commit 3 carry-along 撤回、本 commit で実装) + AgentSettings Hero clutter trim + CaseReview footer left explainer 削除 + mock data trim pass を一括処理
- **判断基準該当**: C1 (5 sec scan 改善) + C6 (Demo narrative integrity) + C7 (gate retain)
- **Touch files**:

  ### U-10 StagingHint collapsed (v1.1 で Commit 3 carry-along 撤回、本 Commit 5 で実装):
  - `prototype/src/components/case/StagingHintPanel.tsx` — section を `<Disclosure title="未承認ヒント (引用根拠 対象外、N 件)" defaultOpen={false}>` で wrap (Commit 3b で導入した Disclosure primitive 再利用)、件数 chip visible + expand で全文

  ### U-17 AgentSettings Hero clutter trim:
  - `prototype/src/pages/AgentSettings.tsx` (Line 149-217 Hero section) — 4 KPI 進化要件 grid を `<Disclosure title="4 KPI 進化要件" defaultOpen={false}>` で wrap、Hero 内 visible = 3-stage stepper + body 1 sentence (Wow factor slogan keep)、`統制原則` mono caption 削除、Hero 内 引き上げ申請 disabled CTA 削除 (footer 既存 `変更を申請` と機能重複)
  - Tool entries description (Agent 構成 5 領域 内) も `<Disclosure>` wrap、各 tool name のみ default visible

  ### U-18 CaseReview footer left explainer 削除:
  - `prototype/src/pages/CaseReview.tsx:195-199` `<PageFooter left={...}>` の left prop 削除 (`入力者確認: 内容を確認し、承認または差戻しを選択してください` 完全削除、StatusBadge + footer button で recall 不要、NH6 解消)

  ### U-20 Mock data trim pass (UI 非依存、Demo narrative 不変):
  - `prototype/src/data/mock-cases.ts`: CASE-2026-0148 alert (50字 → 25字)、CASE-2026-0151 alert (60字 → 25字)、CASE-2026-0142 narrative **不変**
  - `prototype/src/data/mock-proposals.ts`: PROP-2026-031 summary 100字 → 60字 (Cluster 3 Q3、`Phase 1 で実値を検証・再設定する` 部分は HypothesisChip framing SSOT 経由)、core narrative + sourceCases link + proposedDiff 不変
  - `prototype/src/data/mock-agents.ts`: Agent description (51字 → 28字)、Tools description (3 tool × 60字 → 35字)
  - `prototype/src/data/mock-knowledge.ts`: body 内 hedge wording 確認、内容 trim 最小限
  - `prototype/src/data/mock-metrics.ts`: KRI description 長文 case 短縮
- **Change summary**: U-10 + U-17 で AgentSettings Hero clutter を Disclosure 軽減 (Wow factor L1 keep、4 KPI grid + Tool description L3 demote)。U-18 CaseReview footer left explainer 削除 (NH6 解消、L2 → L4 削除)。U-20 mock data 5 file trim、Demo Chapter 1/2 narrative core 不変
- **Verification**:
  - Day 18.5 既存 8 gate retain + Day 18.5 patch co-exist
  - **新規 sub-check (Demo narrative integrity 重要)**:
    - CASE-2026-0142 narrative: 法人住所変更 / OCR 信頼度 0.84 / 新住所 diff / 注意 2 件 / 引用根拠 KN-CORP-001/002/003 + RelatedRuleUpdate PROP-2026-031 — 全 retain
    - PROP-2026-031 narrative: OCR 信頼度閾値 0.85→0.88 引き上げ / 判定基準 3 件 / 元案件 3 件 (CASE-2026-0142 / 0118 / 0095) / 差分 2 file — 全 retain
    - `grep -nE '\[仮説 / 要検証\]' prototype/src/data/*.ts` で reduction 確認
    - AgentSettings page で Hero `<Disclosure>` collapsed、4 KPI grid expand 内 visible
    - CaseReview footer left empty、右 button 2 つのみ visible
    - StagingHintPanel section collapsed default、件数 chip visible
  - first-click test 不要 (P2)
- **Scope-out**: AgentSettings Hero 全削除 (Wow factor 残す)、CaseReview footer 右 button 削除 (Commit 0 で承認 button fix 済)、mock record 数追加 / 削除 (本 commit は trim のみ)

---

## 8. Verification Gates Master Summary (Day 18.5 既存 8 + Day 19 新規 8 = 16 gate、v1.3 強化)

### Day 18.5 既存 8 gate (本 Plan 全 Commit で retain 必須)

| # | Gate | 期待値 |
| - | ---- | ------ |
| 1 | `pnpm build` warning 0 / error 0 | retain (各 commit 後実行) |
| 2 | 8 grep gate (hex / non-mono text-px / inline style / stale term / palette / severity / 旧 case path / outer max-w) | 全 0 hit retain |
| 3 | 9 route DOM smoke (console error 0) | retain |
| 4 | sticky top=56px (data-page-header) | retain (NextActionStrip は PageHeader 直下 inline、影響なし) |
| 5 | Chip taxonomy 3 系統 | retain + HypothesisChip は MetaChip 系列 taxonomy 遵守 |
| 6 | Lighthouse a11y target (dashboard ≥ 96 / case-review ≥ 91 / metrics ≥ 96) | retain (5 新規 primitive 全 aria-* 完備、DetailDrawer は `role="complementary"` landmark で screen reader 対応) |
| 7 | keyboard focus check (Tab で 9 route 全 interactive surface に :focus-visible) | retain |
| 8 | Day 18.5 P0+P1 patch retain | retain **+ U-3 拡張部分 (Commit 0) を Day 18.5 patch 内に追加** |

### Day 19 新規 8 gate (Day 19 patch Commit 1〜5 sub-check、v1.3 強化)

| # | Gate | 期待値 | 該当 Commit |
| - | ---- | ------ | ----------- |
| 9 | First-click test (NFC) Dashboard / Inbox / CaseReview / ProposalReview で primary action 5 秒識別 | pass | Commit 3c |
| 10 | **v1.3 enabled no-op AST gate (strict 4 条件)**: (a) **主 gate** = `pnpm exec node prototype/scripts/check-no-op.mjs` (**既存 `typescript: ~6.0.2` devDependency Compiler API**、ts-morph 不要) で `<button>` JSX に **`onClick` / `disabled` / `type="submit"` / `type="reset"` の 4 条件いずれも欠落** = 0 件 (`onKeyDown` 単独 + `aria-disabled` 単独は pass 不可、`<button>` mouse click no-op 防止 gate のため)、(b) **補助** = Playwright role audit (Tab order + focus-visible のみ、`b.onclick` 不使用)。理由: grep `-E` lookahead POSIX 不対応、React synthetic event DOM 取得不可、ts-morph 新規 dep 追加不要 | pass | Commit 0 (Day 18.5 拡張) |
| 11 | text density audit: `[仮説 / 要検証]` reps per page ≤ 3 (framing + summary + carve-out limit) | pass | Commit 1 |
| 12 | internal vocabulary leakage grep (DOC-\* / SSOT / snake_case / `citation` raw / `source:` raw / `met` / `miss`) user-facing 0 hit (default URL、`?debug=1` opt-in 時は visible 可) | pass | Commit 2 + Commit 4 |
| 13 | JP-only check pass | pass | Commit 4 |
| 14 | Demo narrative integrity check (CASE-2026-0142 / PROP-2026-031) | pass | Commit 5 |
| 15 | NextActionStrip primitive 4 page render 確認 | pass | Commit 3c |
| 16 | 5 primitive smoke test (HypothesisChip / Disclosure / DetailDrawer non-modal a11y / PageHelpDisclosure / NextActionStrip) | pass | Commit 1 + Commit 3a + Commit 3b + Commit 3c |

---

## 9. Implementation Order Recommendation (v1.3、7 commit + Day 18.5 拡張)

### Phase A: Day 18.5 拡張 (先行 apply)
- **Commit 0** — Day 18.5 P0 拡張 (U-3 enabled no-op、~50 LOC、Day 18.5 既存 patch と一括 apply 推奨)
- 完了後、Day 18.5 patch 全体 + Commit 0 を verify (8 gate + **v1.3 gate 10 = typescript Compiler API AST script (`prototype/scripts/check-no-op.mjs`、strict 4 条件) + Playwright role audit 補助**)

### Phase B: Day 19 patch (7 commit 順次 apply)
- **Commit 1** — U-1 HypothesisChip primitive (~150 LOC)
- **Commit 2** — U-2 `?debug=1` query opt-in 定数 gate (~80 LOC)
- **Commit 3a** — U-5 PageHelpDisclosure primitive (~120 LOC)
- **Commit 3b** — U-4 + U-6 + U-12 Disclosure + DetailDrawer drawer primitives (~220 LOC)
- **Commit 3c** — U-13 NextActionStrip primitive (~90 LOC)
- **Commit 4** — U-7 + U-8 + U-9 + U-11 + U-14 + U-16 microcopy SSOT option Y (~250 LOC)
- **Commit 5** — U-10 + U-17 + U-18 + U-20 P2 batch (~180 LOC)

### Verification 順序
- 各 commit 後に **build + 8 grep gate + 9 route DOM smoke** (最低限) 実行
- Commit 1 + Commit 3c 後に **First-click test** (NFC、Dashboard / Inbox / CaseReview / ProposalReview)
- Commit 2 + Commit 4 後に **internal vocabulary leakage grep + JP-only check**
- Commit 5 後に **Demo narrative integrity check** (CASE-2026-0142 + PROP-2026-031)
- Commit 0 後に **v1.3 gate 10 (typescript Compiler API AST script、strict 4 条件 + Playwright role audit 補助)**
- 全 8 commits 後に **Lighthouse a11y full check** (Day 18.5 target retain confirm)

### Rollback Plan
- 各 commit 独立 (rollback 単位)、Commit N rollback で N-1 まで安全 retain
- **v1.1 + v1.3 強化**: Commit 3 split (3a/3b/3c) で rollback 粒度を framing / drawer / NextActionStrip 単位に細分化、large commit のリスク低減
- Demo narrative 影響 commit (Commit 3b ProposalReview drawer + Commit 5 mock trim) は Demo facilitator pre-review 推奨
- Day 18.5 patch との conflict 0 設計、Day 19 patch 全 7 commits を Day 18.5 patch 後 apply 推奨

---

## 10. Reviewer-back Question 解消 confirmation (v1.3 Converged)

要件 doc v1.3 §9 で 4 audit からの reviewer-back question 全 15+ を解消済、本 plan v1.3 で critical review 2 round (v1.0→v1.1 7 findings + v1.1→v1.2 4 findings + v1.2→v1.3 5 findings = 計 16 findings) 反映 + implementation 詳細 lock + Converged。

### v1.3 で解消した v1.2 CR 5 findings

| # | Finding | 解消 |
| - | ------- | ---- |
| 1 | P0: gate 10 ts-morph 未 install | §Commit 0 verification + Touch files で **既存 `typescript: ~6.0.2` Compiler API** 使用 (ts-morph 不要、package.json/lock touch なし)、実装 sketch `ts.createSourceFile` + `ts.forEachChild` 明示 |
| 2 | P0: 旧 gate 10 文言 stale | req §5 Verification + plan §9 Phase A / §9 Verification 順序 / §10 wording を **v1.3 AST gate** に統一、`regex + Playwright b.onclick` 文言完全削除 |
| 3 | P1: onKeyDown / aria-disabled 単独 pass | gate 10 pass 条件を **`onClick` / `disabled` / `type="submit"` / `type="reset"` の 4 条件のみ** に strict 化、`onKeyDown` (browser native で十分) + `aria-disabled` (native disabled でない) 削除 |
| 4 | P1: Commit 3c `met` paraphrase 漏れ | §Commit 3c NextActionStrip ProposalReview summary `${metCount}/3 met` → `${metCount}/3 達成` + §Commit 4 grep scope `Metrics.tsx` → `prototype/src/pages/*.tsx` 全体拡張 |
| 5 | P2: version hygiene | 文書 title v1.1 → v1.3、関連 docs v1.1 → v1.3、§9 / §10 / End of plan の v1.1 stale 表記 → v1.3 統一、Commit 3b 内の Demo シーン表記を曖昧表現 (Cluster 2 Q1 で `Demo 1 シーン` と記述された箇所) から `Demo Chapter 2 の提案レビュー scene` に明確化 |

### Implementation 開始前の confirm point

**v1.3 (Converged) では全 confirm point 解消済**。CR 3 round 経て blocking 0、Implementation session は本 plan v1.3 を base に直接 Commit 0 から順次 apply 可能。

End of plan v1.3 (Converged).
