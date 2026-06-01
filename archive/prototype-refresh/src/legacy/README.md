# src/legacy/ — 旧 IA quarantine (P2B-1c)

`prototype/` から継承した**旧 9-route IA 専用ソース** (Dashboard/Inbox/CaseReview/… の旧 pages + `components/case/` + `components/proposal/`)。Process-First v2 では未使用。

- **build/typecheck 除外**: `tsconfig.app.json` の `exclude: ["src/legacy"]` で対象外。App.tsx からも未参照のため vite bundle にも入らない (inert)。
- **一貫性 gate 除外**: P2B-4 の grep gate は active source (= `src` から `src/legacy` を除く) のみ対象。本 dir の `<svg>` / `text-red-700` 等は false fail させない。
- **用途**: 旧画面実装の reference として温存 (reversible)。再利用する primitive は `components/shared/` 側 (active) を使う。

## P2B-4b 追加 quarantine (2026-05-28、未使用 inherited primitive)

import-graph (BFS from `main`/`App`) で **active 参照 0** と判定した inherited primitive を追加隔離。**廃棄ではなく revivable** — 将来画面が必要とすれば `components/shared/` (または `lib/`) へ戻して使う。

- `components/shared/` (17): ActorBand / BusinessApprovalChip / DetailDrawer / DiffPreviewBlock / DisabledAction / Disclosure / EmptyState / ErrorState / FilterChip / HypothesisChip / LoadingState / MetadataStrip / NextActionStrip / PageFooter / PageHelpDisclosure / ScreenPlaceholder / TrustLevelBadge
- `lib/` (5): actor-mapping / elapsed / knowledge-labels / sendback-categories / show-internal
- `pages/` (1): placeholders

> 隔離理由は「未使用」であり品質ではない。`Disclosure` (off-token slate/white) 等の debt も含むが、active 非参照のため tokenize せず隔離で解消。revive 時は token 化してから active へ。

SSOT: `handoff-redesign/00-shared/p2b4-gate-contract.md` §1 (import-graph 分類)。
