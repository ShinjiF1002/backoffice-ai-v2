# ⚠️ SUPERSEDED (履歴・実装入力にしない) — Phase 2 起動 paste 文

> **本 file は Phase 2 React 実装の入力にしない (Contract Freeze)。**
> 旧 `PageShell + 3 Body + 5 nav (`/queue`) + legacy-ready + 6 route` 前提の paste 文で **superseded**。
> 現行の実装入力:
> - **計画**: `~/.claude/plans/hashed-conjuring-spark.md`「Phase 2 — React 集約 & 新規正準」
> - **canonical**: `00-shared/canonical-design-spec.md`
> - **chrome SSOT**: `00-shared/ia-overview-v2.md` §2 (6-nav grouped)
> - **reference**: `screens-v2/0N-*/canonical-export.md`
> 下記の旧 paste 文 (5 nav / `/queue` / 6 route / PageShell / legacy-ready) は historical。

---

<details><summary>(旧 paste 文、履歴・参考のみ — 実装入力にしない)</summary>

# (旧) Phase 2 起動: Claude Code に React 化を依頼する文 (paste 用)

> README Step 5 でこの file を Claude Code 新 session に paste します。
>
> ⚠️ **v2 9 画面 override**: 現行は **9 画面 Process-First** (SSOT = `ia-overview-v2.md` + `screen-contracts-v2.md`)。React 化 input = `screens-v2/0N-{page}/mockup-output.html` (9 画面)。横断 component に **ProcessSelector / ReconcilePanel / MetricVsThreshold / ConsequencePanel** 追加。下記本文の Plan β (6 画面 / 旧 component) 由来記述は Phase 2 起動 session で screens-v2 + spec から精緻化する。


> ⚠️ **Hub pilot で確定: handoff bundle ❌ 不成立** ("Send to Claude Code" メニューが現 UI に不在)。
> 本 instructions の **主 reference は HTML export (`mockup-output.html`)** + 各画面 `spec.md` + `design-system.md` の組み合わせ。
> 下記「## Claude Code に paste する依頼文」内の `input` block は **末尾「bundle 不成立の場合の代替 path」セクションを採用** してください。
> bundle 取得を試みる必要はありません (Phase 1A で観察済の確定事項)。

---

## Claude Code に paste する依頼文 (以下を全選択 + copy + paste)

```
@~/code/active/backoffice-ai-v2/handoff-redesign/ 配下の mockup 出力 (各画面の `mockup-output.html` または `mockup-output.pdf`) と handoff bundle (`99-claude-code-handoff/bundle/`) を入力に、`~/code/active/backoffice-ai-v2/prototype-redesign/` を新規 Vite project として scaffold し、9 画面 (Hub / 案件一覧 / 承認待ち / 案件詳細 [入力者+承認者 mode] / 提案一覧 / 提案詳細 / エージェント一覧 / エージェント詳細 / Observatory) を React 化してください。

前提 plan:
- `~/.claude/plans/hashed-conjuring-spark.md` の "Phase 2 (別 plan)" section
- 同 plan の旧 revision で書いた React scaffold 内容: `<PageShell>` primitive + 3 Body 型 (HubBody / QueueBody / DetailBody) + 5 nav Sidebar + Operational Premium Light token snapshot copy + legacy-ready/ Wave 2 primitive 温存 + dev runtime assert + grep gate
- 詳細: `handoff-redesign/99-claude-code-handoff/target-structure.md` 参照

scope:
- Phase 2 全体は target-structure.md の Phase 構成 (Phase 1 scaffold + Phase 2 primitive + Phase 3 Hub 起点画面 + Phase 4-9 残 5 画面 + 9 final QC) に従う
- 本 paste では Phase 1+2 (scaffold + primitive) まで完了させてください、Phase 3 以降は別 session で再起動

input:
- handoff-redesign/01-hub/mockup-output.html (Hub 高 fidelity HTML、pixel parity target)
- handoff-redesign/02-queue/mockup-output.html
- ... 〜 06-observatory/
- handoff-redesign/99-claude-code-handoff/bundle/ (Claude Design handoff bundle、file 構造は user 観察済 in hub-pilot-findings.md)
- handoff-redesign/00-shared/design-system.md (token spec、prototype-redesign/src/index.css に転写)
- handoff-redesign/00-shared/upload-once/operational-premium-light-contact-sheet.md (補完)
- handoff-redesign/01-hub/spec.md 〜 06-observatory/spec.md (各画面 mechanical metric / Charter 適用 / research-compounder 違反対応)

verification gate (Phase 2 完了判定):

1. `cd ~/code/active/backoffice-ai-v2/prototype-redesign` で
   - `npm ci` deterministic install
   - `npm run dev` port 5174 で起動 (旧 5173 と並走)
   - `npm run build` tsc + vite build pass
   - `npm run check:all` (lint + check:no-op + build) pass

2. Mechanical gates:
   - `<PageShell.PrimaryAnchor>` count per page ≤ 1 (grep gate)
   - typology lock: each page で `type="hub|queue|detail"` 1 回
   - 旧 primitive 残存 0 (PageFooter / NextActionStrip / HypothesisChip / PageHelpDisclosure)
   - legacy-ready/ から import 0 (Phase 1+2 では未使用)

3. Pixel parity:
   - 各 page の React 出力を mockup-output.html と visual smoke 比較 (Playwright or 手動 screenshot diff)
   - design token 一致 (任意の hex hardcode なし)

4. 旧 prototype 不変性:
   - `git status --porcelain prototype/` が baseline と同じ (作業前 /tmp/handoff-baseline.txt と比較)

完了後、user に「Phase 2 (scaffold + primitive) 完了、prototype-redesign/ で 9 画面 placeholder + skeleton primitive (横断 4 component 含む) が build pass。Phase 3 (CaseDetail から per-screen 実装、pilot 検証済の reconcile を最初に) は別 session で起動してください」と報告してください。

注: Phase 3 以降の per-screen 実装 (Hub → Queue → CaseDetail → ProposalDetail → AgentDetail → Observatory) は本 paste の scope 外。target-structure.md の Phase 構成に従って別 session で起動。
```

---

## bundle 不成立の場合の代替 path

もし Hub pilot で handoff bundle 取得不成立だった場合 (hub-pilot-findings.md に "bundle 未取得" と記録)、上の依頼文の `input` 部分を以下に修正:

```
input:
- handoff-redesign/01-hub/mockup-output.html (Hub 高 fidelity HTML、pixel parity target)
- ... 〜 06-observatory/
- handoff-redesign/00-shared/hub-pilot-findings.md (bundle file 構造 unknown と記録、HTML export を主 reference として扱う)
- handoff-redesign/0N-{page}/spec.md (各画面 spec、Layout / Acceptance / Charter 適用)
- handoff-redesign/00-shared/design-system.md + upload-once/operational-premium-light-contact-sheet.md (token spec)
```

つまり bundle なしでも HTML mockup + spec 4 (design-system / contact-sheet / spec.md / mockup-output.html) で十分。Claude Code は HTML を解析して React 化を進めます。

---

## Phase 2 全体の Phase 構成 (target-structure.md の Phase 構成と同期)

| Phase | scope | 本 paste 対象 |
|---|---|---|
| **Phase 1** (scaffold) | `prototype-redesign/` Vite project scaffold + node_modules install + 6 routes 骨 + token snapshot copy | ★ 対象 |
| **Phase 2** (primitive) | `<PageShell>` + 3 Body 型 + Disclosure + Sidebar 5 nav + TopBar + chrome + legacy-ready 温存 | ★ 対象 |
| Phase 3 (Hub) | 旧 Dashboard → 新 Hub 実装 + mockup pixel parity | 別 session |
| Phase 4 (Queue) | 旧 Inbox → 新 Queue + Table + Drawer | 別 session |
| Phase 5 (CaseDetail) | 旧 CaseReview + SendBackComment 統合 | 別 session |
| Phase 6 (ProposalDetail) | 旧 ProposalReview 移植 | 別 session |
| Phase 7 (AgentDetail) | 旧 AgentSettings 移植 | 別 session |
| Phase 8 (Observatory) | 旧 Audit + Metrics + Knowledge 統合 (3-tab) | 別 session |
| Phase 9 (Final QC) | Mechanical gates 再実行 + pixel parity + Charter sign-off + baseline diff verify | 別 session |

</details>

> (再掲) 上記 `<details>` 内は **superseded、実装入力にしない**。現行は `canonical-design-spec.md` + plan「Phase 2 — React 集約」。
