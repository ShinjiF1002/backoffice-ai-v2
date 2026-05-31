# 次セッション handoff prompt — backoffice-ai-v2 W3 (production polish)

> このファイルがそのまま次セッションへの prompt。先頭から読ませること。作成 2026-05-30。
> **唯一の実行 SSOT は `handoff-redesign/00-shared/remediation-roadmap-p0-p1-p2-2026-05-29.md`** (§4.0 W3 必須昇格群 / §4.1-4.3 P2 batched / §4末 closure count gate)。本 prompt は起動 context、矛盾時は roadmap が正。
> **本 prompt は volatile な HEAD hash を pin しない** (commit/rebase/merge ごとに即 stale 化するため)。live な commit/PR/merge 状態は **git / GitHub を直接参照**。安定参照 = **PR #17** / `origin/main`。本文の数値は「作成時点」値、必ず実コマンドで再実測する。
> **本 prompt は前任 `next-session-handoff-remediation-merged-2026-05-30.md` (W2 着手) を SUPERSEDE する** (W2 = PR #17 で完遂)。

---

## あなた (次セッション) のタスク

W2 (9→14 画面 + 全 enhancement) は **PR #17 (`remediation/w2-screens` → main) で squash-merge 判断待ち**。あなたの仕事は **(1) #17 の merge 状態を実コマンドで確認 → (2) merge 済なら `main` から新 branch を切る (未 merge なら user に確認) → (3) W3 (production polish、§4.0 必須昇格群 + §4.3 G2 残) を有界 sub-wave で実装 → (4) 各 wave 末に check:all green + browser proof + roadmap SSOT sync**。**plan 構造の追加 CR はしない (収束済、CR 8 round 完了)。有界実装 → 検証 → SSOT 同期のループに徹する。**

---

## まず読む (SSOT + context、この順)

1. **唯一の実行 SSOT**: `remediation-roadmap-p0-p1-p2-2026-05-29.md` — §4.0 (W3 必須昇格群) / §4.1-4.3 (P2 batched backlog、特に §4.3 G2 Observatory 残) / **§4末 (112 findings 3 軸 count gate closure、W3 完了時に実行)** / §6.2 (cross-cutting risk、特に #1 SCHEMA bump deploy 別日)。
2. **W2 as-built**: roadmap 冒頭の W2*/P1-* 完了 note 群 + §1.0/§1b ledger (14 画面 = A×3/B×8/C×3、全 enhancement の現物状態)。
3. **design SSOT**: `canonical-design-spec.md` + `prototype-redesign/src/index.css`。
4. **project rules**: `prototype-redesign/CLAUDE.md` + root `CLAUDE.md`。

---

## 現状 (作成時点、実コマンドで再検証すること)

- **W2 = PR #17** (`remediation/w2-screens` → `main`、squash-merge 候補)。**本 W3 handoff doc 自体も #17 に含まれる** (merge で main に載り、次セッションが読める)。commit 数 / diff は volatile ゆえ pin せず `gh pr view 17` / `git rev-list` で実測。merge は **user judgement gate** (まだ未 merge の可能性)。
- 作成時点: test **161** (16 files) / **14 画面** / `SCHEMA_VERSION` **5** / check:all green。すべて実コマンドで再実測。
- W3 は **画面追加を原則伴わない品質底上げ** (例外: manual entry の route 化を選ぶ場合のみ 14→15)。

---

## 着手前に再検証 (教訓: 数値・現状は実コマンドで裏取りしてから信じる)

```
cd prototype-redesign
gh pr view 17 --json state,mergedAt,mergeStateStatus   # MERGED か / conflict ないか
git -C .. fetch origin && git -C .. log --oneline -3 origin/main   # #17 squash が main tip 付近か
git -C .. status --porcelain                                       # clean
npm run check:all                                                  # green (161+ tests / build) 再確認
node scripts/check-design.mjs                                      # R7/icon/emoji 違反 0
```

- **#17 merge 済 → `main` から新 branch (`remediation/w3-polish` 等) を切って開始** (推奨)。
- **#17 未 merge → user に merge 可否を確認**。stacked で進めるなら base squash 後の hash ずれに注意 (教訓: `git rebase --onto origin/main <旧base> <branch>`)。
- browser proof は **build+preview を fresh プロセスで** (`npm run build && npm run preview`、port は vite preview 既定 4173、稼働中 dev server を信じない)。

---

## W3 scope (§4.0 W3 必須昇格群 = production-ready mandatory、optional backlog 扱いにしない)

有界 sub-wave に分割推奨 (W2 の per-wave gate + 各 commit を継承)。各項目に **screen/flow test を最初から**付ける (W2 教訓)。

| sub-wave 候補 | 内容 | gate (test) |
|---|---|---|
| **reversal** (C3 反映済の訂正/取消) | CaseDetail affordance + reducer reversal action + 「前進のみ→可逆」state machine (**新 route なし**) | reversal store.test + 不可逆 guard test |
| **manual entry** (C4 手動起票) | Cases に「新規案件作成」+ 全項目手入力 form (AI 障害時の業務継続) | **JG: route 化 (typology 15) vs modal (14 維持) は着手時 user 判断** / draft 作成 test + (route 時) typology 再同期 |
| **modal hardening** (§4.2 G5) | Modal に背景 inert + scroll-lock + unsaved (dirty) guard | scroll-lock + dirty-dismiss block test |
| **multi-tab** (§8) | StoreProvider に storage event listener + last-write-wins | storage event 反映 test |
| **axe** (§4.2 G9/G11) | 14 画面 axe smoke (現状 a11y smoke は 2 component → 14 route 網羅) | axe 0 violation × 14 route |
| **@media print** (§8) | 証跡/document の print stylesheet | print 適用確認 |
| **SLA real computation** | `elapsedLabel` static → 受付 datetime base 実算出 (§3.2 SLA scope-0 の本実装) + 未来日 fixture 統一 (§4 G7) | SLA 算出 test / active src 未来日 0 grep |
| **§4.3 G2 残 (Observatory)** | 横断台帳の actor/action FilterChip + pagination/pageSize (W2c-2/P1-7b で W3 へ defer 済、roadmap §3.7 as-built note 参照) | filter/pagination 動作 test |

> **closure (W3 末必須)**: roadmap §4末の **112 findings 3 軸 count gate** (major 33 ↔ §1 itemKey / minor 79 ↔ §4 batch / screen 軸 ↔ §1b) を機械確認し、意図的 defer は scope-out 明記。

---

## 規律・gate (W2 で確立、継承)

- **roadmap = 唯一の実行 SSOT**。各 milestone で status/数値/as-built を正確に sync、**stale 表現を残さない** (内部矛盾も含む)。
- **UI 変更は screen/flow test を最初から** (W2 最大教訓: hook-only test は queue closure / role 境界 / terminal state の bug を見逃した)。
- 各 wave 末: `npm run check:all` green + `git diff --check` clean + browser proof (build+preview fresh)。
- 継承デザイン規律: off-token hex 0 / lucide Icon-suffix (`check:design`) / chip 3-system / status→tone 単一 SSOT (`lib/status-tones.ts`) / JP-only / **S8 境界** (検索・台帳・previousValue・非同期を store state に載せない) / **strict-ts** (新規 `as any` / 不要 `!` 禁止)。
- **merge 方針**: feature branch → PR → squash-merge (#14/#15/#17 の監査線)。main 直 push しない。SCHEMA bump を含む deploy は別日 gate (§6.2 risk #1)。
- **ship gate は user に出す**: PR 化までは自走、push/PR/merge click は user (AskUserQuestion or 明示 go)。

---

## この session (W2) の教訓 (必読)

1. **hook-only test は UI/behavioral bug を見逃す**: queue closure (/escalations が裁定後も閉じない)・role 境界 (業務責任者に申請 button)・terminal state (approved 後の再申請 false-success) は外部 CR で初めて顕在化。**screen/flow test (render + user-event + 状態遷移) を最初から**書く。fireEvent.keyDown は user-event の focus 追跡と別系統 (role=button keyboard test は fireEvent が確実)。
2. **外部 CR は doc-drift だけでなく実挙動 bug を出す**: 各 fix は **fix 前 fail の regression test** 付きで閉じる (機械 gate green ≠ 挙動正)。
3. **SSOT 整合は recall surface 全箇所を同期**: roadmap 本文 + 冒頭 as-built note + §6.4 + 契約 3 doc (ia-overview/screen-contracts/coverage-matrix) + prototype-redesign/CLAUDE.md + master plan notice。1 箇所更新で内部矛盾を残さない (W2 close で line 17 / §6.4 / CLAUDE.md route count の stale を CR 指摘で順次閉鎖)。
4. **as-built が plan と乖離したら plan 側を as-built に rebaseline + 明示 defer** (例: §3.7 DataTable 全置換 → table+local filter の as-built に寄せ、actor/action/pagination は W3/P2 defer と明記)。
5. **volatile hash を pin しない、現状は実コマンド裏取り** (PR state / merge / ahead-behind / test count)。
6. **backoffice-ai-v2 は nested git repo** (`active/backoffice-ai-v2/.git`、親 `~/code` は untracked 扱い)。git ops は必ず `active/backoffice-ai-v2/` 内で。
