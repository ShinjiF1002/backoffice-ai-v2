# Hub Pilot Findings — user 観察記録 (Phase 1A 完了)

> 観察日: 2026-05-27、Hub.html (high-fi) と Hub (wireframe).html を Downloads から verify 済。

---

## 観察日時

- 着手日時: 2026-05-27 (時刻不詳)
- 完了日時: 2026-05-27 12:56 (Downloads file 保存時刻)

## 1. Claude Design UI 上の mode pill (固定モード切替) は存在したか?

- [x] **あり**: 名称 = **"Wireframe / High Fidelity"** (両方を試した結果、両 mode で session 作成可能)、切替動線 = **New Session 作成時に選択**
- (任意) UI スクショ path: (未取得)

→ **02-06 patch への影響**:
- 各 prompt の `Requested output style:` 1 行は **補助** として keep
- 主動線は **New Session 作成時に mode を選ぶ**こと → README Step 1 + Step 3-5 で明示
- 02-06 進行: **High Fidelity 1 session で 1 画面ずつ**、wireframe ↔ mockup の同 session 内切替は不要 (per-page で別 session が pragmatic)

## 2. 1 paste の文字数制限に当たったか?

- [x] **当たらなかった** (Hub の prompt-wireframe.md / prompt-mockup.md とも 1 paste で完結)

→ **02-06 patch への影響**: 分割不要、prompt 構造を維持

## 3. Acceptance check (Hub) は visual で判定可能だったか?

### Wireframe (5/5 pass)
| Check | 判定可能 | 結果 |
|---|---|---|
| Header chip は 1 つ (案件数 13) + 別 hedge | ✅ | count-chip + hedge-chip 分離、判定容易 |
| PrimaryAnchor strip 1 本 | ✅ | strip + CTA「開く」 visual で判定容易 |
| Headline KPI 3 個 (vanity なし) | ✅ | vanity (案件総数 / 反映済) は Disclosure 内、Headline は actionable 3 |
| Diagnostic Disclosure default collapsed | ✅ | `<details>` (open 属性なし) |
| Footer caption 1 文 only | ✅ | 「業務カード・KPI は画面内モック状態からの集計」 |

### Mockup (6/6 pass)
| Check | 判定可能 | 結果 |
|---|---|---|
| Sparkline 5 個 (KPI 3 + 業務 card 2) 実描画 | ✅ | polyline 5 + area 5 + dot 5 個 |
| Disclosure default collapsed | ✅ (実装方法注意) | wireframe = `<details>`、mockup = `<button aria-expanded="false">` + JS controlled toggle |
| PrototypeModeLabel pill visible | ✅ | TopBar 右、文言完全一致 |
| 色は token 一致、hex hardcode なし | ✅ | raw hex 0、var(--*) 191 個 (完全遵守) |
| wireframe の規範保持 | ✅ | Header / PrimaryAnchor / Body 3-tier / Footer 一致 |
| sidebar "ハブ" active | ✅ | aria-current="page" + .active class + 左 indigo rail |

→ **02-06 patch への影響**: Acceptance check の表現は visual で判定可能、不能 check なし

## 4. handoff bundle の取得は成立したか? file 構造は?

- [x] **不成立**: 理由 = **Claude Design 内に "Send to Claude Code" メニューが見つからない** (現 subscription / UI version で不在)
- **代替**: HTML export を主 reference として使う
  - `~/Downloads/Hub (wireframe).html` (24KB) を `01-hub/wireframe-output.html` として保存予定
  - `~/Downloads/Hub.html` (35KB、high-fi) を `01-hub/mockup-output.html` として保存予定
  - `~/Downloads/CLAUDE.md` (Claude Design 内 project rules、auto-generated) — 参考

→ **Phase 2 への影響**: `phase-2-instructions.md` の **bundle 不成立代替 path** を採用 (HTML export + spec.md で Claude Code が React 化可能)

## 5. polished mockup の brand 適用度

- design system token 適用率: **~100%** (raw hex 0、var(--*) 191 個経由)
- 不適用箇所 example: なし (完全遵守)
- design system 再 paste で改善するか: 不要

→ **02-06 patch への影響**: 各 prompt の "Visual constraint" は十分機能している、追加 token inline 不要

## 6. 1 conversation で wireframe → mockup の継承は成立したか?

- [x] **不成立** (理由: New Session 作成時 mode 固定 = wireframe と mockup は別 session)
- 代替: per-page で別 session 2 つ (wireframe session + mockup session)、両方とも Project 配下に置けば design system は共有される

→ **02-06 patch への影響**:
- `prompt-mockup.md` の "previous wireframe in this conversation" 表記は不正確 → **「同 project 内の Wireframe session で生成した [Page] wireframe を layout baseline として参照」** に修正
- ただし Claude Design は project 共有 context を持つため、wireframe export を re-upload しなくても layout 継承は機能する

## 7. その他、02-06 prompt に必要な軽量修正

1. **Disclosure 実装 pattern が wireframe / mockup で異なる**: wireframe = `<details>` (HTML native)、mockup = `<button aria-expanded="false"> + <div aria-controls>` + JS toggleDiag()。02-06 で同じ pattern が再現される前提で OK (Claude Design の internal 判断)
2. **Project 内 CLAUDE.md が自動生成された**: Step 1 design-system + Step 1.5 upload-once が project rules として恒久 register 済 ← subsequent 02-06 session で再 paste / re-upload **不要**
3. **design system は 3 file 構造に分解された** (`design-system/tokens.css` + `design-system/chrome.md` + `design-system/spec.md`) + `references/INDEX.md` も自動生成 ← Claude Design の internal organization、user は意識不要
4. **KPI に delta annotation (`+1 vs 昨日` / `7 日推移`) が自動追加された**: prompt 明示なかったが Charter "State Transparency" と整合、02-06 でも同様の自動追加が期待できる ← prompt に明示しなくても良いと判断

## 8. 次の action

- [x] **Step 8: Claude Code 新 session で 02-06 prompt 一括 patch を依頼** (本 file を読み込ませる)
- handoff bundle 取得は **skip** (代替: HTML export を Phase 2 で直接 input)

---

## Verified output files (Phase 2 input 候補)

| file | size | acceptance pass |
|---|---|---|
| `~/Downloads/Hub (wireframe).html` | 24KB | 5/5 ✅ |
| `~/Downloads/Hub.html` (high-fi) | 35KB | 6/6 ✅ |
| `~/Downloads/CLAUDE.md` (project rules、auto-generated) | 2.2KB | 参考 |
