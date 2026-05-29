# Design System Registration Gate

> Claude Design 公式: design system を先に設定・検証することを推奨 (support.claude.com admin guide)。9 画面量産前に design system 適用を pilot で確認する gate。

## Gate (CaseDetail pilot で確認、9 画面量産前に必須)

### Step 1: design system 登録
- Claude Design project に `01-design-system.md` を投入
- 前置き「以下を design system spec として恒久登録」

### Step 2: CaseDetail pilot で適用確認 (binary)

| 確認項目 | 期待 |
|---|---|
| Canvas | slate-50 `#F8FAFC` |
| Panel | white + 1px hairline `#E5E7EB` |
| Primary | indigo `#635BFF` (CTA / focus) |
| Chip taxonomy | 3 系統 (StatusBadge 4px fill / FilterChip 6px outline / MetaChip 6px soft) |
| Typography | Inter + Noto Sans JP + JetBrains Mono (numeric tabular) |
| Radius | card 8px / control 6px / chip 4px |
| 装飾禁止 | gradient mesh / glow / glassmorphism / 3D icon / illustration / dark mode = 0 |
| token 経由 | raw hex hardcode 最小、`var(--*)` 経由 |

### Step 3: 判定
- 全項目 pass → 9 画面量産へ進む
- トーンが外れた項目あり → **9 画面量産停止**、design-system 再投入 + pilot 再生成

## Fallback (org design system が使えない場合)

Claude Design の org-level design system 機能が Team/Enterprise でない、or 使えない場合:
- `01-design-system.md` を **project-level design-system prompt** として各 session の context に投入
- token 適用率を export HTML で grep 検証:
  - `grep -c '#[0-9a-fA-F]\{3,6\}'` (raw hex、低いほど良い、0 が理想)
  - `grep -c 'var(--'` (CSS variable 経由、多いほど良い)
- Hub pilot 実績 (旧 Plan β): raw hex 0 / var 191〜274 → fallback でも token 経由は機能した

## 記録

design system 適用確認の結果を `claude-design-evidence-ledger.md` の CaseDetail 行に記録 (適用率 / 不適用箇所 / 再投入有無)。
