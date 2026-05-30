# 次セッション handoff prompt — audit P0/P1/P2 全対応の全画面 rebuild 計画

> **⚠ HISTORICAL / prompt-only (2026-05-30 統合後)**: 本 file の指示内容は `remediation-roadmap-p0-p1-p2-2026-05-29.md` §1/§1b に吸収済。**唯一の実行 SSOT は roadmap**。本 file は起動 prompt の記録としてのみ残し、実行判断 (wave 構造・gate・数値) には roadmap を参照すること。数値の食い違いがあれば roadmap が正 (例: strict+NUIA app 39/test 107)。

> このファイルがそのまま次セッションへの prompt。先頭から読ませること。作成 2026-05-30。

---

## あなた (次セッション) のタスク

backoffice-ai-v2 / prototype-redesign を、**昨晩の UI 監査 (112 findings) の P0/P1/P2 全項目に対応する「全画面 rebuild 計画」を 1 本に策定し、その後実装する**。目的は production-ready prototype。

**方向 (user 確定・不変)**: 既存路線 (Operational Premium Light + Design Charter v1.0 + canonical-design-spec) を **精練化**。`#635bff` primary 維持、**新 visual language は作らない**。「rebuild」= IA/契約/findings/欠落画面の構造的再構築であって、visual のゼロからの作り直しではない。

**重要な前提 (この session の最大の教訓)**: この session は計画/CR を **約 6 round** 回して analysis-paralysis に陥った。計画は既に収束している。**あなたは「1 回の有界な統合」で計画を確定し、すぐ W0 実装に入ること。plan 構造を再び何 round も CR しないこと。**

---

## まず読む (SSOT + context、この順)

1. **監査 (findings の源泉)**: `handoff-redesign/00-shared/user-perspective-ui-audit-2026-05-29.md` — blocker相当 B1-B4 / Major 33 (R/I/A/M/X/C/D/DC/AR/SC/RD) / Minor 79 / §5a 欠落画面 / **§7 が P0/P1/P2 優先順位**。
2. **roadmap (finding 組織の P0/P1/P2 SSOT、非常に詳細)**: `handoff-redesign/00-shared/remediation-roadmap-p0-p1-p2-2026-05-29.md` — §3 P1-1〜P1-9 deep-plan (file:line 変更表 + gate + judgement gate + risks + **audit finding への 1:1 reconcile**)、§4 P2 batched (3 domain × G1-G11、**§4末に「minor 79 ↔ batch cross-walk count gate」= finding 閉鎖証跡が既存**)、§5 master plan rebaseline supersede、§6 wave gate + risk + **§6.4 で 6/12 demo scope 線引き**。
3. **P0 remediation 実装計画**: `handoff-redesign/00-shared/p0-remediation-plan-2026-05-29.md`。
4. **overlay 計画 (screen 組織の W0/W1/W2/W3、本 session で CR-収束済)**: `/Users/shinjifujiwara/.claude/plans/generic-noodling-lampson.md` — roadmap の弱点 (finding 組織で per-screen 完成定義が無い) を補う screen 層 + W0 visual foundation を持つ。**統合の素材**。
5. **design SSOT**: `handoff-redesign/00-shared/canonical-design-spec.md` / `prototype-redesign/src/index.css` / `/Users/shinjifujiwara/code/design/CHARTER.md`。
6. **IA SSOT**: `handoff-redesign/00-shared/ia-overview-v2.md` / `screen-contracts-v2.md` / `coverage-matrix-v2.md`。
7. **project rules**: `prototype-redesign/CLAUDE.md` + root `CLAUDE.md`。

---

## 現状 (2026-05-30、検証済)

- **audit §7 P0 (8 項目) = 完了**。branch `remediation/p0-store-foundation` に commit 済 (`c72362e` 他)。**PR #14 = OPEN + MERGEABLE (未 merge)**。`npm run check:all` green。
- demo 中核 (Flywheel/SoD/突合修正/証拠アンカー) は P0 で観測可能。実 Chromium で render 確認済。
- **2 つの強い計画 artifact が並存**: roadmap (finding 組織) + overlay (screen 組織)。両者を 1 本に統合するのがタスクの第一歩。

---

## 成果物 (策定する計画の形)

**roadmap を SSOT 基盤に、overlay の screen 層を吸収した 1 本の計画**。要件:
- **screen 組織の W0/W1/W2/W3** に再構成し、**roadmap P1-1〜P1-9 + P2 G1-G11 を全て吸収** (1 項目も落とさない)。
- audit **P0 (完了・保全) + P1 + P2 を全被覆**。
- **finding → wave → file/screen → verification の閉鎖 ledger**。roadmap §4末の既存 cross-walk count gate を base に流用 (ゼロから作らない)。最終 count gate で全 finding が wave に hit することを機械確認。

### 決定済の wave 構造 (overlay 由来、これを base に)
- **W0 — functional foundation**: contrast SSOT (`--color-fg-tertiary #475569` 4-tier ladder、fg-subtle 装飾専用降格、fg-muted は panel/canvas のみ、canonical §9 + §8 gate) / tone SSOT (§4 矛盾解消 **却下=inset**、`trustTone`/`toastTone` resolver、literal tone 撲滅) / strict-ts Stage1 (下記) / icon-suffix gate。**visual token (shadow/type/density/motion) は W0 で定義のみ、適用は W1 (非 gating、functional-first)**。
- **W1 — 既存 9 画面 per-screen refine**: P0-done 保全 + roadmap P1-1(ProcessSelector 配線)/P1-4(contrast 適用)/P1-5(Loading-Error)/P1-6(行 keyboard)/P1-8(before-after) + 各画面 findings + W0-visual 適用。
- **W2 — 新 3 画面 + IA + store (3 sub-wave)**: **W2a** store/schema (`agent/approvePromotion`/`sendbackPromotion`/`case/escalate` + `readNotificationIds` + `promotionStatus`/`escalation` 加法 + **SCHEMA 単一 4→5 bump** + promotionRequested 移行) → **W2b** `/search` + `/inbox` + ProcessSelector dropdown a11y → **W2c** `/oversight` (W2a の store 依存を満たす) + Observatory drill/cross-ledger/period + IA sync。roadmap P1-2/P1-3/P1-7 を吸収。
- **W3 — P2 完成 (audit §7 P2 + §8 残存 gap)**: build-health (code-split React.lazy / 12画面 axe) / structural (C3 reversal / C4 手動起票 / SLA real datetime / 降格 TrustLevel enum + cancelPromotion) / polish (@media print / session・multi-tab storage event / modal unsaved-guard+inert+scroll-lock / DataTable bulk select scope / long-content DocumentViewer / a11y responsive / copy cleanup)。roadmap §4 P2 G1-G11 を吸収。

---

## 既決定 (再議論禁止、本 session で CR 解決済)

- SSOT 表現 = **roadmap が governance SSOT、計画は P1/P2 execution overlay を embed** (primary SSOT を奪わない、Plan-First 整合)。
- **strict-ts 二段 gate**: Stage1 (W0) = app 39 errors → 0 + `check:types`(app)。Stage2 (W1 末) = test 107 errors → 0 + `check:types:test` を check:all へ。中途で check:all を red 化させない。
- **W2 は W2a/b/c に分割** (rollback/review 軽量化)。store は UI より先 (W2a)。
- **route 名 `/inbox` に統一** (`/notifications` 系記述を一掃)。
- **W0 gate は functional 限定** (contrast/tone/strict/icon)、visual unit は W1 適用 gate。
- **typology sync 範囲拡大**: A×2/B×7/C×3=12 を byte-identical で atomic 更新 = ia-overview-v2 + screen-contracts-v2 + coverage-matrix-v2 + App.tsx + `prototype-redesign/CLAUDE.md` + canonical-design-spec + smoke test (`src/__tests__/smoke/routes.test.tsx`、現状 9-route) + Sidebar/TopBar。CI string-diff。
- **business-approver = unified `/oversight` 1-route** (内部 segment で 設定承認+裁定、C 型単一決定面契約を保つ)。
- **降格(demote)**: P2 が scope 入りのため W3 で TrustLevel enum 拡張 + `agent/cancelPromotion` + allowed-actions 3-way sync を実装。
- nav = Sidebar 6→4 group (処理/改善/**監督=/oversight 新設**/監視) + TopBar chrome (ProcessSelector/検索→/search/bell→/inbox/UserMenuPopover)。設定/profile/ヘルプは chrome (popover + HelpDrawer)、route 化しない。

## 検証済 数値 (信じる前に再実測せよ、ただし測定済)

- `tsc -p tsconfig.app.json --noEmit --strict --noUncheckedIndexedAccess` = **app 39 errors** (TS18048×24 中心、hooks.ts 集中)、`tsconfig.test.json` = **107 errors**。**「0」は誤計測 (bare tsc を -p 無しで走らせた agent の誤り)**。
- `SCHEMA_VERSION = 4` (persist.ts:14)。P1 の state 追加 = 単一 4→5 bump。
- fg-subtle 44 hits = text ~21 (置換) / 非text ~23 (据置)。`#475569` token 未定義。
- routes 現 9 (App.tsx)、target 12。promotionRequested = 8 参照/5 file。

---

## 規律・gate (全 wave)

- 各 wave 末 `npm run check:all` green + `git diff --check`。新 input/NavLink/div は check:no-op 対象外 → **behavioral test が唯一の wiring gate**。
- **browser proof は build+preview で確定 serve** (稼働中 dev server を信じない = stale build 回避)。Playwright 未導入なら headless Chrome (`/Applications/Google Chrome.app/...`) で fresh プロセス。
- 継承デザイン規律 (off-token hex 0 / lucide Icon-suffix / chip 3-system / status→tone 単一 SSOT / JP-only / C 型 detail contract) 不変。
- master plan rebaseline (frame C「9→12」承認済、CLAUDE.md) 配下。Plan-First 遵守。

## この session の教訓 (必読)

1. **計画しすぎるな**: 本 session は ~6 CR round で収束済。1 回の有界統合 → W0 実装。plan 構造の再 CR loop に入らない。
2. **着手前に working tree を re-verify**: 前回 handoff は stale browser evidence で「既修正バグ」を blocker と誤判定した (memory: `feedback_review_against_working_tree`)。計画の数値・現状主張は実コマンドで裏取りしてから信じる。
3. **sub-agent の計測を鵜呑みにしない**: strict error count は -p 無し tsc で「0」と誤報された。`-p tsconfig.app.json` で再現せよ。
4. **6/12 demo の現実 (roadmap §6.4)**: P0 (完了) が demo 中核を担う。full rebuild (P1-W6/W7 + P2 = 12画面 + production-ready) は **post-6/12**。全面再構築が demo path を止めないこと。

## 最初の実装ステップ

計画を 1 本に統合したら、**W0 (functional foundation) から実装開始**。W0 は全 plan 版で同一・確定済・低 risk。branch は現 HEAD (P0 含む) から `remediation/p1` を切る。W0 gate = check:all + `tsc -p tsconfig.app.json --strict --noUncheckedIndexedAccess` = 0 (Stage1)。
