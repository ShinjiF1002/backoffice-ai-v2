# prototype-redesign/CLAUDE.md — Phase 2 React 集約 (Process-First v2) ローカル SSOT

`backoffice-ai-v2` の UI prototype を **Process-First v2 で React 再構築**する project (`prototype/` と並走、port 5174)。`prototype/` の成熟デザイン層を継承し、9 画面 Process-First IA + rev.3 doc-anchored + 監査 drift 解消を載せる。

> **⚠ REBASELINE (2026-05-29、frame C 承認) — remediation 実装 baseline へ移行**
> 本番 Readiness 監査を受け remediation を開始。**P0/P1 の実装 baseline = `../handoff-redesign/00-shared/remediation-roadmap-p0-p1-p2-2026-05-29.md`** が以下の本 doc lock を supersede する: 「exactly 9 画面」は **9→15 に拡張** (IA scope=(a) 確定 — W2b: `/search`・`/inbox` で 9→11 ✓ / W2c: 業務責任者面 3 画面分離 `/business-approver`・`/config-approvals`・`/escalations` で 11→14 ✓ / W3 C4: `/cases/new` 手動起票で 14→15、typology A×3/B×9/C×3) / KPI 分母は `mock-kpi.ts` SSOT で **980** 統一 / **口座開設 case を CASE_LIST に追加** / store に SoD actor・override 訂正値・sendback 理由を拡張 (P0-W1 実装済、commit ba2f2ba) + W2a で promotionStatus / escalation / readNotificationIds + SCHEMA 4→5、W3 で reversal + receivedAt(elapsedLabel 置換) + SCHEMA 5→6。**継承デザイン規律 (token / lucide icon / chip taxonomy / tone v2 / status-tones SSOT / JP-only) は不変**で remediation も遵守する。下記「9 routes」list は historical baseline、現行 route は roadmap §1b が SSOT。

> **⚠ REBASELINE (PV0、2026-06-01、承認済) — post-v3 増分**: 実装 baseline は **v3 (PR #20) + UI refresh (PR #22)、test 272 green**。実装 SSOT = `../handoff-redesign/00-shared/v3-audit/{V3-UPGRADE-PLAN.md, closure-ledger.json}` (上記 2026-05-29 roadmap を supersede)。増分 plan = `~/.claude/plans/boav2-postv3-data-and-cleanup-plan.md`。承認済スコープ変更: **自動化対象業務 2→5** (新規 口座振替登録 UC-BO-03 supervised / 改印・代表者変更届 UC-BO-04 supervised / カード再発行 UC-BO-05 **checkpoint**)。route 不変 (15 画面維持、既存 /cases・/agents のデータ母数増)。`KpiProcessKey` を UC-BO-03/04/05 に拡張 (`KPI_ROWS` 全 key を同 commit で充足)、`fieldsForWorkflow` を lookup map 化、`HubProcess.icon` enum 拡張。**980 は UC-BO-02 専用で不変、新業務は metric 単位母数**。Hub の total/breakdown は store-derived ゆえ静的値は触らない。**業務数 count gate = 5**。

> **⚠ REBASELINE (postv5、2026-06-03、P0 preflight 承認 + Codex 収束)**: client (現 `src/store` reducer + localStorage) を **API client 化**し、状態権威を Node + better-sqlite3 + API backend (`prototype-redesign/server/`) へ移す。実装 SSOT = **`../handoff-redesign/00-shared/postv5-p0-preflight-contract.md`**。**下記「scope-out / JP-only」節の `mock data + in-memory state のみ` は postv5 で改定**: state は **SQLite 永続化 + 実 API (server-authoritative な SoD/execute/audit enforcement)** になる。**ただし mock core は不変** — 実 LLM / 実 OCR / 実顧客データ / 実 PDF / 実外部銀行接続 / 実規制 cite は引き続き scope-out。新 dep: better-sqlite3 + HTTP framework (Express) + zod (server)、@tanstack/react-query + MSW (client/test)。継承デザイン規律 (token / lucide / chip / tone v2 / status-tones / JP-only) は不変。`SCHEMA_VERSION` localStorage 規律は server `schema_migrations` ledger へ移送。各 phase = branch → gate → PR → 承認。

> **正準 (SSOT)**:
> - design = `../handoff-redesign/00-shared/canonical-design-spec.md` (token / lucide / status-tones / chip taxonomy 継承 + soft-tint -200 + tone v2 + C 型 contract)
> - base IA (historical 9 画面) = `../handoff-redesign/00-shared/ia-overview-v2.md` §2 (9 画面 / 6-nav grouped、typology は expansion note 参照) ／ **現行 route・chrome (remediation 11→14) の SSOT = roadmap §1b ledger**
> - 画面契約 = `../handoff-redesign/00-shared/screen-contracts-v2.md`
> - 操作・状態遷移 = `../handoff-redesign/00-shared/allowed-actions-and-state-transitions.md`
> - pixel-parity reference = `../handoff-redesign/screens-v2/0N-*/canonical-export.md`
> - 計画 = `~/.claude/plans/hashed-conjuring-spark.md`「Phase 2 — React 集約 & 新規正準」

> **⚠ ROUTE-SWAP (2026-06-03) — greenfield v2 が本番 UI に昇格**
> `src/v2/*` (greenfield Operator Console、light operator console 視覚言語) を store 配線し v1 と機能 parity に到達後、
> **本番 route に昇格 (v1 pages 撤去、`/v2` prefix 除去)**。`src/App.tsx` は `V2Shell` layout 配下に v2 15 画面。
> **削除済**: 旧 v1 pages (`src/pages/*` 全 15) + v1 shell (`components/shell/{AppShell,Sidebar,TopBar}`) + v1-only shared
> (`components/shared/{PersonaSwitcher,MiniTrend,DetailDemoFallback}`) + v1-only cross-cutting/case
> (`cross-cutting/{ReconcilePanel,ConsequencePanel,MetricVsThreshold}`・`case/{DocumentViewer,LifecycleStepper}`)。
> 後者は dead-code 撤去 slice (postv4) で削除: live mock data が参照していた純データ型 `MetricRow`・`ConsequenceImpact` を
> `data/types.ts` へ移設 → 全 importer を `./types` へ再 point → component 5 file 削除 (tsc/build/test green)。
> **継続利用 (v2 が render)**: `components/shell/ProcessSelector` (v2 TopBar) + `components/shared/*` overlay primitive (Modal/ReasonDialog/FieldActionModal/Toast/DataTable 等)。
> **main 置換済**: PR #24 で main に merge 済 (`fd35150`)。dead-code 撤去は postv4 follow-up。
> 配線 ledger: `../handoff-redesign/00-shared/greenfield-v2-wiring-ledger.md`。

## 15 routes (v2 本番、Process-First)

`src/App.tsx` で React Router v7、`V2Shell` (Operator Console) layout 配下:

1. `HubV2` — `/`（+ `/hub`）   2. `CasesV2` (案件キュー) — `/cases`   3. `ApprovalsV2` (承認待ち) — `/approvals`
4. `CaseDetailV2` — `/cases/:id` (入力者 + 承認者 mode、文書アンカー 2-pane)   5. `ProposalsV2` — `/proposals`
6. `ProposalDetailV2` — `/proposals/:id`   7. `AgentsV2` — `/agents`   8. `AgentDetailV2` — `/agents/:id`
9. `ObservatoryV2` (モニタリング) — `/observatory`   10. `SearchV2` — `/search`   11. `NotificationsV2` — `/inbox`
12. `BusinessApproverHubV2` — `/business-approver`   13. `ConfigApprovalsV2` — `/config-approvals`
14. `EscalationsV2` — `/escalations`   15. `CaseDraftV2` (手動起票) — `/cases/new` (`cases/:id` より先に宣言)

detail (CaseDetail/ProposalDetail/AgentDetail) は list の row click から navigate。

## V2Shell chrome (Operator Console)

graphite recessive sidebar × bright content。Sidebar nav 3 group: ハブ / ─処理─ 案件キュー・承認待ち / ─監督─ モニタリング・業務責任者・エスカレーション / ─改善─ AI 提案・Agent 設定 (件数 badge は store-truth)。TopBar = 横断検索 (`/search`)・通知 (`/inbox`、未読 live)・操作者 persona 切替・起票・PrototypeModeLabel。

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
