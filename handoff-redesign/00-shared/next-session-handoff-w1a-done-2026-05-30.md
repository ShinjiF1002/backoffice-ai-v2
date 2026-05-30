# 次セッション handoff prompt — backoffice-ai-v2 remediation (W0 + W1-A CORE 完了後)

> **⚠ SUPERSEDED / 消化済 (2026-05-30)**: 本 prompt は当該セッションで消化完了。**option A (P1-5-remainder) を `07b4073` で実装・検証・commit 済** (detail 3 画面 not-found → `EmptyState(truly-empty, role=status)` 統一 + permission-empty dead branch 除去)。現 HEAD = `07b4073` (`cf8df94..HEAD` = 11 commit)。下記「現状」の `@b323553` / 全 9 commit は **本 prompt 作成時点 (W1-A-done) の historical snapshot** であり現状ではない。下記「次アクション」表は **A = 完了済**として読むこと (B/C/D のみ live)。**次の実行 = merge preflight** (本 prompt 廃止/historical 確定 → PR #14 [P0] merge → `remediation/p1` を main 再統合 → `check:all`)。実行 SSOT は roadmap §1.0/§1b。
>
> このファイルがそのまま次セッションへの prompt。先頭から読ませること。作成 2026-05-30。
> **唯一の実行 SSOT は `remediation-roadmap-p0-p1-p2-2026-05-29.md`**。本 prompt は起動 context、矛盾時は roadmap が正。

---

## あなた (次セッション) のタスク

backoffice-ai-v2 / prototype-redesign の本番 Readiness remediation を継続する。**P0 + W0 + W1-A CORE は実装・検証・commit 済**。あなたの仕事は **(1) 着手前に working tree を実コマンドで再検証 → (2) 下記「次アクション」から user 判断を得て 1 つ着手 → (3) 各 wave 末に check:all green + browser proof + roadmap SSOT sync**。**plan 構造の追加 CR はしない (収束済)。有界実装 → 検証 → SSOT 同期のループに徹する。**

---

## まず読む (SSOT + context、この順)

1. **唯一の実行 SSOT**: `handoff-redesign/00-shared/remediation-roadmap-p0-p1-p2-2026-05-29.md` — §1.0 (screen 軸 wave W0/W1/W2/W3 + closure 状態) / §1b (per-screen 完成 ledger) / §1.1 (finding 軸 linearization) / §3 (P1 deep-plan、**§3.5/§3.9 等に as-built 注記あり**) / §4 (P2 + §4.0 W3 必須昇格群) / §5 (master plan rebaseline) / §6 (gate/risk)。
2. **design SSOT**: `canonical-design-spec.md` (§4 tone / §8 gate / **§9 contrast R7** / §10 visual foundation) + `prototype-redesign/src/index.css`。
3. **project rules**: `prototype-redesign/CLAUDE.md` + root `CLAUDE.md`。
4. **historical (実行判断に使わない)**: `~/.claude/plans/generic-noodling-lampson.md` (overlay、吸収済) / `next-session-handoff-full-rebuild-2026-05-30.md` (旧 prompt、historical mark 済)。

---

## 現状 (2026-05-30、commit 済・要再検証)

- **branch `remediation/p1`** @ `b323553`、base = `cf8df94` (P0 含む、`remediation/p0-store-foundation` tip)。**全 9 commit** (Part A 統合 → W0 → W0 closure → P1-W4 → P1-1 → sync → P1-5 CORE → docs sync → handoff)。
- **完了 wave**:
  - **P0** (8 項目、PR #14): store/SoD/flywheel/突合修正/証拠アンカー。
  - **W0** functional foundation (`cabf4ec`): contrast SSOT (`--color-fg-tertiary #475569`、意味テキスト 22 箇所、R7 gate `scripts/check-design.mjs`) / tone SSOT (却下=inset + `trustTone`) / strict-ts Stage1 (app 39→0) / icon-suffix (4 file + emoji 除去) / `prefers-reduced-motion`。
  - **W1-A CORE** (= P1-W4 + P1-1 + P1-5 CORE):
    - **P1-W4** (`c7276a8`): strict-ts Stage2 (test 68→0 + `check:types:test` を check:all へ)。
    - **P1-1** (`56d6dfa`): ProcessSelector→ViewContext 配線 (useView consumer 0→5、業務切替が全 list に伝播、Cases header も process 連動)。
    - **P1-5 CORE** (`cfa318b`): loading/error を **hidden QA seam** (`useListData` + `?demo=loading`/`?demo=error`) で到達可能化。DataTable は loading/error 中 filter/一括操作 bar 非表示。**visible DevControls 不採用**。
- **検証済 (commit 時点)**: `npm run check:all` green = lint / check:no-op / check:types (app 0) / check:types:test (test 0) / check:design (R7/icon/emoji 0) / **test 119 pass (11 files)** / build。browser proof: P1-1 (/cases 法人住所変更 8件 + header 連動) / P1-5 (skeleton・ErrorState 両状態、filter 非表示)。

---

## 着手前に再検証 (教訓: 数値・現状は実コマンドで裏取りしてから信じる)

```
cd prototype-redesign
git -C .. log --oneline cf8df94..HEAD          # 9 commit 確認
npm run check:all                               # green (119 tests / build) を再確認
npx tsc -p tsconfig.app.json --noEmit | grep -c "error TS"   # 0 (strict+NUIA 済)
npx tsc -p tsconfig.test.json --noEmit | grep -c "error TS"  # 0 (Stage2 済)
node scripts/check-design.mjs                   # R7/icon/emoji 違反 0
gh pr view 14 --json state,mergeable            # PR #14 は time-varying、gate にしない (本 branch は #14 非依存)
```
- **browser proof は build+preview を fresh プロセスで** (`npm run build && npm run preview`、稼働中 dev server を信じない)。loading/error 再現: `/cases?demo=loading` (skeleton) / `/cases?demo=error` (ErrorState + 再試行で ready 回復)。

---

## 次アクション (user 判断ゲート、1 つ選ぶ — 自動着手しない)

| 案 | 内容 | 前提 / 規模 |
|---|---|---|
| **A. P1-5-remainder** ✅ **完了 (`07b4073`)** | detail 3 画面 not-found (`CaseDetail`/`ProposalDetail`/`AgentDetail` の bespoke `*NotFound`) → `EmptyState(truly-empty, role=status)` 統一 + `EmptyState` の permission-empty dead branch 除去 (caller 0)。state-coverage polish 【実装済 + check:all green + 3 route browser proof】 | 小・低 risk・前提なし。roadmap §1.0 P1-5 closure + §3.5 参照 |
| **B. P1-W6 / W7** | 検索 `/search` + 通知 `/inbox` (P1-2) / 業務責任者面 `/oversight` (P1-3) / Observatory drill + 台帳 (P1-7)。9→12 画面 + store 拡張 (SCHEMA 4→5) | **大・master plan rebaseline 承認が前提 (§5)**、roadmap §6.4 で **6/12 demo 後送り**。着手前に rebaseline 承認 + JG (IA scope / polish tier) を確定 |
| **C. merge 方針** | PR #14 (P0) + `remediation/p1` (W0+W1-A) の main merge / PR 化 | user 判断。time-varying な PR 状態を再確認してから |
| **D. do-nothing** | 6/12 demo 準備を優先し remediation を一旦停止 | demo 中核は P0 で観測可能 (§6.4)。W1-A は品質底上げ済 |

> **推奨の出し方**: 6/12 demo が近い場合は A (低 risk polish) か D。demo 後の production-ready 化を進めるなら B だが rebaseline 承認が hard precondition。

---

## 規律・gate (全 wave 不変、継承)

- **roadmap = 唯一の実行 SSOT**。各 milestone で roadmap を正確に sync (status / 数値 / as-built 決定)。stale 表現を残さない (本 session は SSOT 同期を毎 commit で実施)。
- **plan 構造の追加 CR 禁止** (収束済)。新規 cross-cutting のみ §1b/§4 に追記。
- 各 wave 末: `npm run check:all` green + `git diff --check` clean + browser proof (build+preview fresh)。
- 継承デザイン規律: off-token hex 0 / lucide Icon-suffix (`check:design`) / chip 3-system / status→tone 単一 SSOT (`lib/status-tones.ts`) / JP-only / C 型 detail contract / **S8 境界** (検索・台帳・previousValue・非同期 fetch を store state に載せない)。
- **strict-ts**: 新規 `as any` / 不要 `!` を入れない (既存 `!` は active src 3 箇所 = FieldActionModal:68/92・DocumentViewer:80、strict-clean cleanup は任意)。test の `!` は throw 相当 (不在=test 失敗維持)。
- **hidden seam pattern**: demo chrome に dev affordance を足さない。QA 機能は URL query 等で隠す (P1-5 の `?demo` 前例)。
- **W2/W3 着手前提**: master plan rebaseline 承認 (画面追加を伴うため、§5)。SCHEMA_VERSION bump 含む deploy は 6/12 demo と別日。

## 検証済 数値 (再実測してから信じる)

- app strict+NUIA = **0** (W0 で 39→0)、test config = **0** (W1-A で 68→0)。**107 は W0 前の旧値** (roadmap §3.9 参照)。
- `SCHEMA_VERSION = 4` (`persist.ts`)。W2a で 4→5 bump 予定。
- routes 現 **9** (target 12、W2 で +3)。test **119 pass / 11 files**。
- useView consumer = **5** (ProcessSelector + 4 list)。`fg-subtle` 意味テキスト hit = 0 (装飾/icon/disabled のみ残存、`check:design` で gate)。

## この session の教訓 (必読)

1. **roadmap を毎 milestone で sync**: 「唯一 SSOT」を宣言したら、実装後に stale 表現 (完了状態・数値・as-built 決定) を必ず潰す。本 session は 4 回 (W0 closure / 107→68 / P1-1 sync / P1-5 docs sync) の SSOT 同期 patch を要した。
2. **数値は再実測**: test typecheck は W0 前 107 → W0 後 68 と変動した (app 修正で test config 由来 error が減)。引き継ぎ数値を盲信しない。
3. **CR の引用も自分で裏取り**: external CR の line 番号・件数・主張も実コマンド/Read で確認してから反映 (本 session で「2 site」→ 実測 3 箇所等の訂正あり)。
4. **有界編集に徹する**: roadmap 全面 re-key でなく、収束済 plan への最小 bounded edit。plan-loop に戻らない。
5. **product-judgment gate は user に出す**: P1-5 の DevControls 可視性は demo-facing ゆえ AskUserQuestion で確定 (hidden seam 採用)。scope/preference/irreversible は自動判断しない。
