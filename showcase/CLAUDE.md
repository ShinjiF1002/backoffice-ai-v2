# showcase/ — Backoffice AI v2 Pattern Showcase

backoffice operator persona 向けの polished pattern catalog。`prototype/` (Day 13 sign-off baseline) とは **完全独立** の sub-app。

## Position vs prototype/

| Aspect | prototype/ | showcase/ (本 sub-app) |
|---|---|---|
| Purpose | Session 4 demo + 9 routes business workflow | Pattern catalog (component library) |
| Source | docs/ SSOT + workflows/ | research-compounder/samples/ui-patterns/ |
| Touch | Day 13 sign-off 後 freeze | active dev |
| Token | SSOT 元 | mirror (consumer) |
| Route count | 9 (fixed contract) | 1 landing + N pattern detail |

**MUST NOT** touch `prototype/` from this sub-app. Token は copy で borrow、symlink ではなく explicit duplicate (drift detect 用)。

## Stack

React 19 + Vite 8 + Tailwind v4 + React Router v7。prototype/ と完全 mirror stack で migration 自由度を残す。

## Dev

```bash
cd showcase/
npm install
npm run dev    # http://localhost:5273
```

Port は 5273 (prototype/ の 5173 と衝突回避)。

## Figma MCP Project Rules

本 sub-app は Figma MCP design-to-code 経由で開発する。`use_figma` 呼び出し時は以下を守る:

1. **Library-first** — 既存 component (showcase/src/components/) を再利用、duplicate primitive 禁止
2. **Token-bound** — color / spacing / radius / typography は `--color-*` / `--radius-*` 等の CSS variable のみ。raw hex / px 禁止
3. **Auto Layout** — Figma 側 frame は absolute position ではなく Auto Layout で構造化
4. **Small-step write** — 1 use_figma 呼出で 1 page or 1 frame、複数 page を一括生成しない
5. **Mobile required** — 各 pattern は desktop (1440x900) + mobile (390x844) の 2 viewport 設計
6. **a11y default** — keyboard nav / focus-visible / contrast 4.5+ / aria label / icon-only ctrl にラベル
7. **No image asset** — `use_figma` の write-to-canvas は image / custom font 非対応。要時は `upload_assets` で別 path
8. **State Matrix mandatory** — Default / Loading / Empty / Error / Permission / Dense / LongText の 7 state を 1 frame に並べる

## Pattern Catalog

`src/data/patterns.ts` が SSOT。各 pattern entry は research-compounder の `knowledge/ui-design/<id>.md` + `samples/ui-patterns/<id>.md` に bound。

| Pattern | Status | Knowledge Card | Sample |
|---|---|---|---|
| hil-approval | live | ai-native-hil-approval-ui | hil-approval-table-and-detail |
| operator-cockpit | live | operator-cockpit-multi-agent-oversight-ui | operator-cockpit-3-viewport-layout |
| diff-preview | live | diff-and-change-preview-ui | — |
| citation-disclosure | live | citation-and-source-disclosure-ui | — |
| action-confirmation | live | agent-action-confirmation-ui | — |
| audit-trail | preview | action-history-timeline-audit-trail-ui | — |

## Ship Gate (mechanical check before "done")

per `research-compounder/samples/ui-patterns/figma-mcp-ship-gate-checklist.md`:

- [ ] Context gate — Figma URL / node 明示、large frame 分割
- [ ] Component reuse — duplicate primitive なし
- [ ] Token — raw px / hex なし
- [ ] Web/Mobile — 1440 + 390 両方確認
- [ ] State — 7 state 揃い
- [ ] a11y — keyboard / focus / contrast / label
- [ ] Performance — heavy image / motion 制限
- [ ] Roundtrip — code-to-canvas evidence (本 session は preview screenshot 代替)
