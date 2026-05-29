# Redesign Mockups — Backoffice AI v2

> Phase 1: HTML mockup × 20 variants (本 directory)
> Phase 2: 採用 variant のみ React fork で実装、置換 (別 session)

既存 `prototype/` の 3 問題 (文字過多 / 一目で次行動不明 / 画面レイアウト) に対処する改善案を、9 画面 × 2-3 variant = 20 HTML mockup で提示。Figma / Pencil 不使用、Tailwind なし純 HTML/CSS + Google Fonts のみ。既存 `prototype/` zero-touch。

## 使い方

```
open redesign-mockups/index.html
```

ブラウザで `index.html` を開くと 20 variant の thumbnail grid + 比較表。各 variant をクリックで mockup 詳細を新タブで開く。Cmd+クリックで複数並べて比較。

## 構造

```
redesign-mockups/
├── README.md
├── index.html                    ← 比較 landing (thumbnail grid)
├── _shared/
│   ├── tokens.css                ← Operational Premium Light tokens
│   ├── shell.css                 ← sidebar + topbar + 共通 primitive
│   └── shell.html                ← shell snippet (参考用、各 mockup は inline 済)
├── dashboard/
│   ├── v1-todays-action.html
│   ├── v2-status-pulse.html
│   └── v3-personal-workspace.html
├── inbox/
│   ├── v1-critical-first.html
│   └── v2-status-kanban.html
├── case-review/
│   ├── v1-decision-focused.html
│   ├── v2-source-vs-output.html
│   └── v3-single-question.html
├── sendback-comment/
│   ├── v1-ai-suggested.html
│   └── v2-3step-wizard.html
├── proposal-review/
│   ├── v1-diff-hero.html
│   └── v2-single-question.html
├── agent-settings/
│   ├── v1-progress-roadmap.html
│   └── v2-tabbed-workspace.html
├── audit-trail/
│   ├── v1-search-grouped.html
│   └── v2-case-grouped.html
├── metrics/
│   ├── v1-goal-progress.html
│   └── v2-trend-focused.html
└── knowledge-browser/
    ├── v1-3stage-kanban.html
    └── v2-compiled-library.html
```

## 3 問題への対処方針

| 問題 | 対処パターン |
|---|---|
| ① 文字が多すぎる | instructional copy / 「次の実装段階で対応」 footer / 重複 chip 削除、accordion / 折りたたみ / drawer に逃がす |
| ② 一目で次にやることが分からない | primary CTA の唯一性 + 大型化 + 色階層強化、case ID よりも顧客名 + action verb を hero に |
| ③ 画面レイアウト | 等価重み 3 column → 1 hero + accordion、status group header、kanban / wizard で動線を visual に |

## 採用判断 → Phase 2

1. `index.html` を開き、各画面で採用 variant を 1 つ選ぶ (採用しない / 保留も可)
2. 採用案 list を確定
3. **Phase 2**: 採用 variant を React で実装、`prototype-redesign/` に配置 → 既存 `prototype/` 置換 (別 session)
4. 本 directory は reference として保持 (Phase 2 中に参照)

## token / 構造

- `_shared/tokens.css` は `prototype/src/index.css @theme inline` の subset (同 token 名 / 同 value)
- `_shared/shell.css` は sidebar (212px) + topbar (48px) + 共通 primitive (chip / btn / card / kbd / SLA color)
- 各 mockup は self-contained (shell HTML を inline、CSS は shared link)
- フォント: Inter (sans) + Noto Sans JP (jp) + JetBrains Mono (mono) を Google Fonts で
- viewport: 1440 想定、grid layout で sidebar 212 + 残り auto
- Tailwind / React / build 一切なし、ブラウザで開けば render

## 既存 prototype 不変

```bash
git diff --stat prototype/
# (no output — confirmed zero-touch)
```
