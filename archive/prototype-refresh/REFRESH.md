# prototype-refresh — UI Refresh Studio (研究目的)

`prototype-redesign` を **既存コード非改変** で最新 UI トレンドにリフレッシュする実験 studio。
元 `../prototype-redesign/` は物理別ファイルとして完全保全 (本 studio は `cp -R` の独立コピー、port 5175)。
本番化トラック (test 212 green, PR #20) には一切触れない。

- 手法: **B (コピー studio)** — `research-compounder` の dense-enterprise / boring-reliable トレンドを当てる
- トレンド SSOT: `../../research-compounder/knowledge/ui-design/` + `audits/ui-ux-audits/2026-05-29-frontend-ui-trends-2025-2026.md`
- 採用方針: regulated/dense 向け high-fit のみ。**liquid glass / translucency / decorative motion / Wow factor は不採用** (research が avoid 判定)

## 起動

```bash
cd prototype-refresh
npm run dev      # http://localhost:5175  (元 prototype-redesign は 5174 で共存可)
npm run build    # tsc -b && vite build
npm run check:all
```

## 適用トレンド ledger

| # | トレンド (research source) | 適用層 | 状態 |
|---|---|---|---|
| 1 | OKLCH token 体系 (modern CSS substrate, Baseline Widely) | `src/index.css` @theme | ✅ foundation |
| 2 | elevation-over-borders (dense-enterprise: 面階層を影で語る) | `--shadow-*` token | ✅ foundation |
| 3 | recessive chrome (Linear/Datadog: nav を沈め data を前進) | Sidebar / TopBar | ✅ foundation |
| 4 | radius/density/type-scale/motion substrate token | @theme (substrate) | ✅ foundation (消費は screen step) |
| 5 | Density Tier 4-band (operator=T3 / audit=T4 / exec=T1) | Observatory / Hub / 一覧系 | ✅ screen #4 — density toggle 全 list + Observatory T4 cockpit + Hub T1 |
| 6 | Operator Cockpit (aggregate oversight strip) | Observatory | ✅ screen #4 — 運用サマリー集約ストリップ (6 指標 store-truth) |
| 7 | HIL 5-state timeline + actor 分離 | Approvals | ✅ screen #3 — agent/human/system 分離の承認 lifecycle strip + 「最終承認は必ず人」 |
| 8 | Diff/Change Preview + reversibility tier | CaseDetail | ✅ screen #2 — premium diff 着色 + 取消可能性 tier + irreversible-on-top |
| 9 | Data Table Premium (density toggle/sort/click-expand) | Cases / 一覧系 | ✅ screen #1 (Cases) — sort/filter は既存、density toggle + click-to-expand peek を追加 |
| 10 | Confidence/Uncertainty viz (role-gated, band) | CaseDetail / Approvals | ✅ screen #2 — AI 確信度 band (高/中/低、生数字非表示) |
| 11 | Dense Enterprise 5手 (recessive chrome / 集約バッジ / click-expand) | 全体 / section header | ✅ recessive chrome (基盤) + 集約バッジ (Hub/Observatory) + click-to-expand peek。inline keyboard は deferred |

## screen step log

### screen #1 — Cases (Data Table Premium) ✅

変更 2 ファイル (studio 内、後方互換):
- `src/components/shared/DataTable.tsx`: optional prop 3 つ追加 — `density` (狭い/標準/広い トグル、`--density-row-*` token 消費)・`renderExpanded` (行 inline 展開 peek、modal でなく click-to-expand)。未指定の他 8 一覧画面は render byte 互換のまま。ヘッダに inset 着色 + card に shadow-sm (elevation-over-borders)。
- `src/pages/Cases.tsx`: `density` 点灯 + `renderExpanded={<CasePeek>}` (業務/状態/担当/確認状況 + 「案件を開く」)。
- 検証: `npm run check:all` green (272 test + build)。証跡 `/tmp/bo-refresh-compare/cases-after-{default,expanded,compact}.png`。
- deferred (本番化時): sticky header (要 height-constrained scroller)・inline-edit・virtualization (200+ 行、現 mock <20 行ゆえ N/A)。

### screen #2 — CaseDetail (Diff/Change Preview + Confidence band + Reversibility) ✅

変更 3 ファイル (studio 内、後方互換):
- `src/data/types.ts`: `FieldReview` に optional `confidence?` / `reversibility?` 追加 (既存 data 非破壊)。
- `src/data/mock-case-detail.ts`: 5 field に confidence + reversibility を populate (新住所=Irreversible で序列実証)。
- `src/components/cross-cutting/ReconcilePanel.tsx`: metadata strip (AI 確信度 band + 取消可能性 tier chip)・premium diff 着色 (現行→確定を `--color-diff-*` で del/add、line-through + arrow で色覚非依存)・irreversible-on-top 並べ替え・取消不可の注意文。
- compliance: 生 confidence 数字は非表示、qualitative band (高/中/低) のみ (CLAUDE.md「confidence 生数字を業務 UI に出さない」遵守 + recon の role-gated 表現)。
- 検証: `npm run check:all` green (272 test + build)。証跡 `/tmp/bo-refresh-compare/detail-{before,after}.png`。

### screen #3 — Approvals (HIL 5-state timeline + actor 分離) ✅

変更 1 ファイル (studio 内、後方互換):
- `src/pages/Approvals.tsx`: DataTable に `density` 点灯 + `renderExpanded` で **HIL lifecycle strip** を追加。受付/AI処理/入力者確認/承認者承認/反映 の 5 step を、agent (BotIcon + primary 帯) / human (UserCheckIcon) / system (ServerIcon) の **actor 分離**で常時可視化。現在 step (承認者承認) は ring + 「承認待ち」、legend + 「最終承認は必ず人の操作です（AI は提案・入力のみ）」を明示 (recon: approved は always human)。
- lifecycle は status から決定論的に導出 (per-case data 依存なし)。
- 検証: `npm run check:all` green (272 test + build)。emoji gate に comment 内 ✓ が掛かり是正済。証跡 `/tmp/bo-refresh-compare/approvals-{before,after-default,after-expanded}.png`。

### screen step #4 — 残り全画面 (batch density + bespoke) ✅

**density 一括 (5 画面、自分で edit)**: Agents / Proposals / SearchResults / ConfigApprovals / Escalations の DataTable に `density` 点灯。共有 DataTable は premium 済ゆえ 1 prop 追加で premium baseline が伝播。

**bespoke (3 画面、workflow で各 agent が distinct file を並列編集)**:
- `Observatory.tsx`: Operator Cockpit 集約ストリップ「運用サマリー」(案件総数/処理中/承認待ち/要確認/差戻し/エスカレーション の 6 指標、`useCases('all')` store-truth から導出、tabular + 注意 chip)。
- `Hub.tsx`: section 見出しに集約カウントバッジ (計N件 / 案件N件・要対応N件) を additive 付与、Density Tier T1 framing。
- `ProposalDetail.tsx`: proposedDiff を premium 化 (radius token / 現行→改定 label / XIcon・CheckIcon + line-through + ArrowRight、色覚非依存)。

**foundation-only でカバー (bespoke 不要、token/recessive chrome のみで成立)**: CaseDraft / AgentDetail / Notifications / BusinessApproverHub。

検証: `npm run check:all` green (272 test + build)。元 `prototype-redesign/` git 差分ゼロ。証跡 `/tmp/bo-refresh-compare/{observatory,hub-after2,proposaldetail,agents,businessapprover,...}-*.png`。

---

## カバレッジ (全 15 画面)

刷新 src 17 ファイル / 元トラック差分ゼロ / 各 step で test 272 green。

| 画面 | 適用 |
|---|---|
| Hub | 基盤 + Density Tier T1 + 集約バッジ |
| Cases | 基盤 + Data Table Premium (density / peek) |
| Approvals | 基盤 + HIL 5-state timeline + actor 分離 (density / peek) |
| CaseDetail | 基盤 + Diff/Change Preview + Confidence band + Reversibility |
| Observatory | 基盤 + Operator Cockpit 集約ストリップ + Density Tier T4 |
| Proposals / Agents / SearchResults / ConfigApprovals / Escalations | 基盤 + Data Table Premium (density) |
| ProposalDetail | 基盤 + premium Diff |
| CaseDraft / AgentDetail / Notifications / BusinessApproverHub | 基盤 (OKLCH token + recessive chrome + elevation) でカバー |

deferred (本番化時): sticky header / inline-edit / virtualization (200+ 行) / inline keyboard signposting。

## foundation step の刷新内容 (既存 component 無改変で効く範囲)

- **token 値の OKLCH 化**: 全 token 名を継承したまま値のみ刷新 → 15 画面が自動で再テーマ。
- **radius**: card 8→10 / control 6→8 / chip 4→6 px (わずかに丸く、抑制内)。全画面に自動適用。
- **elevation**: `--shadow-{2xs,xs,sm,md,lg}` を low-chroma cool shadow に刷新。既存 `shadow-sm/md/lg` utility が新値を拾う。
- **recessive chrome**: Sidebar / TopBar / mobile nav の面を `--color-chrome` (panel より一段沈む) に変更。content の白 panel が前進。
- **substrate token** (`--density-row-*` / `--text-2xs` / `--ease-emphasized` / `--duration-*`): screen step で Data Table Premium / Cockpit が消費。

## 検証 gate (studio 独立)

- `npm run check:all` (lint / no-op / types / check:design / 227 test / build) を維持する。
- motion は `prefers-reduced-motion` で default off (regulated policy)。
- before/after スクショで視覚判定 (ピクセルで calibrate、理論で決めない)。

## 不変条件

- 元 `../prototype-redesign/` を変更しない (`git status --short ../prototype-redesign` が空であること)。
- 本 studio は使い捨て実験。本番統合する場合は別途 token diff を本体へ back-port する判断を行う。
