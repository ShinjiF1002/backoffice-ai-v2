# 次セッション handoff prompt — backoffice-ai-v2 (P0+W0+W1-A remediation main merge 後)

> このファイルがそのまま次セッションへの prompt。先頭から読ませること。作成 2026-05-30。
> **唯一の実行 SSOT は `remediation-roadmap-p0-p1-p2-2026-05-29.md`**。本 prompt は起動 context、矛盾時は roadmap が正。
> **本 prompt は volatile な HEAD hash を pin しない** (commit/rebase ごとに即 stale 化するため)。live な commit/PR 状態は **git / GitHub を直接参照**。本文の数値は「作成時点」値、必ず実コマンドで再実測する。

---

## あなた (次セッション) のタスク

backoffice-ai-v2 / prototype-redesign の remediation は **P0 + W0 + W1-A + P1-5-remainder まで `main` に merge 済**。あなたの仕事は **(1) 着手前に working tree + main を実コマンドで再検証 → (2) 下記「次アクション」から user 判断を 1 つ得て着手 → (3) 各 wave 末に check:all green + browser proof + roadmap SSOT sync**。**plan 構造の追加 CR はしない (収束済)。有界実装 → 検証 → SSOT 同期のループに徹する。**

---

## まず読む (SSOT + context、この順)

1. **唯一の実行 SSOT**: `handoff-redesign/00-shared/remediation-roadmap-p0-p1-p2-2026-05-29.md` — §1.0 (wave W0/W1/W2/W3 + closure) / §1b (per-screen ledger、P1-W5 まで ✓) / §3 (P1 deep-plan、§3.5 P1-5 as-built 済) / §4 (P2 + §4.0 W3 必須昇格群) / §5 (master plan rebaseline) / §6 (gate/risk、§6.4 で 6/12 後送り線引き)。
2. **design SSOT**: `canonical-design-spec.md` (§4 tone / §8 gate / §9 contrast R7 / §10 visual foundation) + `prototype-redesign/src/index.css`。
3. **project rules**: `prototype-redesign/CLAUDE.md` + root `CLAUDE.md`。
4. **historical (実行判断に使わない)**: `next-session-handoff-w1a-done-2026-05-30.md` (前 prompt、SUPERSEDED 済) / `~/.claude/plans/generic-noodling-lampson.md` (overlay、吸収済)。

---

## 現状 (2026-05-30 merge 完了、実コマンドで再検証すること)

- **`main` に P0(#14 squash) + W0+W1-A+P1-5-remainder(#15 squash) が merge 済**。remediation branch (`remediation/p0-store-foundation`, `remediation/p1`) は **削除済**。次の作業は **`main` から新規 branch を切って開始**。
- **完了済 scope** (すべて main、roadmap §1.0/§1b が SSOT):
  - **P0** (#14): store/SoD/flywheel/kill-switch/突合修正/証拠アンカー (SCHEMA_VERSION=4、口座開設 case、route 9)。
  - **W0**: contrast SSOT (`--color-fg-tertiary`、R7 gate `scripts/check-design.mjs`) / tone SSOT (却下=inset + `trustTone`) / strict-ts Stage1 (app 39→0) / icon-suffix gate / `prefers-reduced-motion`。
  - **W1-A**: strict-ts Stage2 (test 68→0 + `check:types:test`) / ProcessSelector→ViewContext 配線 (useView consumer 5) / loading-error hidden seam (`?demo=loading|error`)。
  - **P1-5-remainder**: detail 3 画面 not-found → `EmptyState(truly-empty, role=status)` 統一 + `EmptyState` permission-empty dead branch 除去。
- **作成時点の数値 (再実測対象)**: routes **9** (target 12)、`SCHEMA_VERSION` **4** (W2a で 4→5)、test **119 pass / 11 files**、app/test strict-ts **0**、check:design **0**。

---

## 着手前に再検証 (教訓: 数値・現状は実コマンドで裏取りしてから信じる)

```
cd prototype-redesign
git -C .. fetch origin && git -C .. log --oneline -2 origin/main   # #15 squash (W0+W1-A) が main tip 付近
git -C .. status --porcelain                                       # main clean (untracked output/ は無害)
npm run check:all                                                  # green (119 tests / build) を再確認
node scripts/check-design.mjs                                      # R7/icon/emoji 違反 0
```
- **browser proof は build+preview を fresh プロセスで** (`npm run build && npm run preview`、稼働中 dev server を信じない)。

---

## 次アクション (user 判断ゲート、1 つ選ぶ — 自動着手しない)

| 案 | 内容 | 前提 / 規模 |
|---|---|---|
| **A. 6/12 demo 準備優先** | `demo/demo-script.md` (Day 20) / `BusinessApprovalView` static mock (`demo/static-mocks/`) / Session 4 narrative slides (`docs/06-session4-narrative.md`)。demo 中核は P0+W0+W1-A で観測可能 | 小〜中・前提なし。**Session 4 = 2026-06-12 Fri (作成時点で約 13 日)** ゆえ最優先候補 |
| **B. W2/W3 (P1-W6/W7) 着手** | 検索 `/search` + 通知 `/inbox` (P1-2) / 業務責任者面 `/oversight` (P1-3) / Observatory drill + 台帳 (P1-7)。9→12 画面 + SCHEMA 4→5 | **大・hard precondition: master plan rebaseline 承認 (§5) + JG (IA scope §3.7 JG-1 / polish tier)**。roadmap §6.4 で **6/12 後送り推奨** |
| **C. W3 ungated polish** | §4 batched backlog のうち rebaseline 不要なもの (axe a11y smoke / modal hardening §4.2 G5 / @media print / multi-tab storage event)。画面追加なしの品質底上げ | 中・低 risk・画面追加なしゆえ rebaseline 不要。roadmap §4.0 W3 必須昇格群 参照 |
| **D. stop / do-nothing** | remediation を一旦区切り、demo 後に再開 | drop / scope-0。merge 済分で demo 中核は成立 |

> **推奨の出し方**: 6/12 が近い場合は A (demo 準備) を優先。production-ready 化を進めるなら B だが rebaseline 承認 + JG が hard precondition (承認なき着手は禁則)。画面追加を伴わない品質底上げを先に消化するなら C。

---

## 規律・gate (全 wave 不変、継承)

- **roadmap = 唯一の実行 SSOT**。各 milestone で正確に sync (status / 数値 / as-built)。stale 表現を残さない。
- **plan 構造の追加 CR 禁止** (収束済)。新規 cross-cutting のみ §1b/§4 に追記。
- 各 wave 末: `npm run check:all` green + `git diff --check` clean + browser proof (build+preview fresh)。
- 継承デザイン規律: off-token hex 0 / lucide Icon-suffix (`check:design`) / chip 3-system / status→tone 単一 SSOT (`lib/status-tones.ts`) / JP-only / C 型 detail contract / **S8 境界** (検索・台帳・previousValue・非同期 fetch を store state に載せない)。
- **strict-ts**: 新規 `as any` / 不要 `!` を入れない (既存 active src `!` 3 箇所 = FieldActionModal:68/92・DocumentViewer:80)。
- **hidden seam pattern**: demo chrome に dev affordance を足さない (P1-5 の `?demo` 前例)。
- **W2/W3 着手前提**: master plan rebaseline 承認 (画面追加を伴うため、§5)。SCHEMA_VERSION bump 含む deploy は 6/12 demo と別日。
- **merge 方針**: feature branch → PR → squash-merge (#14/#15 の監査線)。main 直 push しない。

## この session の教訓 (必読)

1. **handoff/snapshot doc に volatile HEAD hash を pin しない**: commit/rebase ごとに即 self-stale 化する (本 prompt の前身は 1 session で 3 回 stale 化)。進行状態は hash-relational に書き、live 状態は git/PR を直接参照。安定 hash (merged squash commit 等) のみ引用可。
2. **stacked branch を squash-merged base に統合する時は rebase --onto**: base が squash-merge されると元の commit と hash が変わり直接 merge で重複 conflict。`git rebase --onto origin/main <旧base> <branch>` で重複を解消してから PR。
3. **数値・現状・CR 引用は実コマンドで裏取り**: 引き継ぎ数値や external CR の主張 (件数・hash・PR 状態) を盲信しない。本 session で「PR #14 OPEN」(実際は merged)・「@b323553/9commit」(rebase 後 stale) を実測訂正した。
4. **有界編集に徹する**: 収束済 plan への最小 bounded edit。plan-loop に戻らない。
5. **ship gate は user に出す**: main merge / scope 選択 / 不可逆操作は AskUserQuestion で確定。preflight (rebase 検証・check:all) までは自走、merge click は user。
