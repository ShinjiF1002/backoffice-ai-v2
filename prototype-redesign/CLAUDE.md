# prototype-redesign/CLAUDE.md — Phase 2 React 集約 (Process-First v2) ローカル SSOT

`backoffice-ai-v2` の UI prototype を **Process-First v2 で React 再構築**する project (`prototype/` と並走、port 5174)。`prototype/` の成熟デザイン層を継承し、9 画面 Process-First IA + rev.3 doc-anchored + 監査 drift 解消を載せる。

> **正準 (SSOT)**:
> - design = `../handoff-redesign/00-shared/canonical-design-spec.md` (token / lucide / status-tones / chip taxonomy 継承 + soft-tint -200 + tone v2 + C 型 contract)
> - IA / chrome = `../handoff-redesign/00-shared/ia-overview-v2.md` §2 (9 画面 / 6-nav grouped)
> - 画面契約 = `../handoff-redesign/00-shared/screen-contracts-v2.md`
> - 操作・状態遷移 = `../handoff-redesign/00-shared/allowed-actions-and-state-transitions.md`
> - pixel-parity reference = `../handoff-redesign/screens-v2/0N-*/canonical-export.md`
> - 計画 = `~/.claude/plans/hashed-conjuring-spark.md`「Phase 2 — React 集約 & 新規正準」

## 9 routes (Process-First、`ia-overview-v2.md` §2 SSOT)

`src/App.tsx` で React Router v7、exactly 9 画面:

1. `Hub` — `/`
2. `Cases` (案件一覧) — `/cases`
3. `Approvals` (承認待ち) — `/approvals`
4. `CaseDetail` — `/cases/:id` (入力者 + 承認者 mode、rev.3 文書アンカー)
5. `Proposals` (提案一覧) — `/proposals`
6. `ProposalDetail` — `/proposals/:id`
7. `Agents` (エージェント一覧) — `/agents`
8. `AgentDetail` — `/agents/:id`
9. `Observatory` (モニタリング) — `/observatory`

CaseDetail / ProposalDetail / AgentDetail は master の row click から navigate (sidebar 非表示)。**旧 IA (Dashboard/Inbox/CaseReview/SendBackComment/AuditTrail/Metrics/KnowledgeBrowser) は使わない**。

## Sidebar (6-nav grouped)

ハブ / ─処理─ 受信トレイ(`/cases`)・承認待ち(`/approvals`) / ─改善─ AI 提案レビュー(`/proposals`)・Agent 設定(`/agents`) / ─監視─ モニタリング(`/observatory`)。TopBar に ProcessSelector + PrototypeModeLabel。

## 継承デザイン規律 (`prototype/` から、有効)

`canonical-design-spec.md` §1 が SSOT。要点:
- **token**: `src/index.css` `@theme inline` (Operational Premium Light + v2 soft-tint -200 + 紙文書 token)。off-token hex 禁止。
- **icon**: **lucide-react** のみ (Icon suffix 統一)。inline SVG / 独自 Icon switch 禁止。icon-per-concept = canonical-spec §5。
- **chip taxonomy 3 系統**: StatusBadge (status fill、4px) / FilterChip (filter、6px border) / MetaChip (meta、6px) 混在禁止。
- **tone v2**: StatusBadge `Tone = neutral|inset|slate|primary|success|alert|error` / MetaChip `MetaTone = neutral|inset|primary|success|alert|error`。status→tone は `lib/status-tones.ts` 単一 SSOT (画面ローカル再宣言禁止)。
- **soft-fg regime**: `text-{amber,emerald,red}-{700,800,900}` 直書き禁止、`--color-*-soft-fg` 経由。
- **prop 規律**: tone / severity / status / kind の軸混在禁止。
- **C 型 detail contract** (canonical-spec §6): A 全体レビュー可能性 / B 証拠アンカー / C 単一決定面 を CaseDetail/ProposalDetail/AgentDetail で守る。

## scope-out / JP-only (`prototype/` 継承、有効)

- 実 LLM / Computer use / 外部接続 / 完全自動化 / 実 customer data / 実 PDF / 実規制 cite なし。mock data + in-memory state のみ。
- UI copy は日本語のみ (技術固有名詞 React/Vite/Tailwind/AI/PDF/OCR/API/KPI のみ英語可)。
- KPI/閾値は `[仮説 / 要検証]` ラベル。confidence 生数字を業務 UI に出さない (監査 raw ledger のみ可)。
- PrototypeModeLabel「プロトタイプ表示 — 外部システム未接続 / 証跡はモック」を全画面 TopBar に常時表示。

## Phase 2B 段階 (plan、per-phase 承認)

- P2B-0 scaffold ✓ / **P2B-1** primitive ✓ (a 基盤: tone v2/status-tones / b chrome: 6-nav/ProcessSelector / c skeleton + legacy quarantine `src/legacy`)
- **P2B-2** CaseDetail pilot (rev.3 doc-anchored、screens-v2/04 parity、C 型 contract 基準)
  - **2a contract hardening** ✓: `ReconcileState` data enum + `lib/reconcile-display` resolver (UI 表示は「正規化一致→一致」集約、内部語を画面に出さない型契約) / `data/mock-case-detail.ts` (CASE-2026-0142 model)
  - **2b UI 実装**: 文書ビューア 2-pane / 全項目 / 統合 modal / LifecycleStepper / 単一決定 footer
- P2B-3 残り 8 画面 (screens-v2 parity) / P2B-4 QC (full 一貫性 gate + a11y + baseline)

### gate scope (phasing)
- **P2B-2 gate** = CaseDetail が import する file + 本 step 新規/変更 file が gate-clean (off-token hex 0 / lucide のみ / status-tones+reconcile-display 単一 resolver / 内部語非露出 / skeleton 文言除去)。
- **full active-source gate** (継承 shared/lib の旧違反 [Sparkline svg / DiffPreviewBlock 等 text-700 / actor-mapping #635BFF] 含む全 cleanup) は **P2B-4** に集約。`src/legacy` は常に gate 対象外。

## prototype/ 不変

`prototype/` は Plan v1.3 lock。本 project は copy 元として read-only 参照のみ。`git status --porcelain prototype/` が作業開始時 baseline と同じであること (新規差分ゼロ)。
