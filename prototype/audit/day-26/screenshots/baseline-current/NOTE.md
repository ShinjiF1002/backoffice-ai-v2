# baseline-current PNG Status (PR 0 closure)

## 現状 (2026-05-26 PR 0 closure 時点)

**PNG 0 file 保存** (`.gitkeep` placeholder のみ)。Implementation Plan v3.0 §PR 0 step (f) は "4 critical page × 2 viewport = 8 PNG 保存" を spec したが、`preview_screenshot` MCP tool は inline JPEG return only (disk 保存 API なし) のため、PR 0 内では実 PNG 保存不能と判明。

## 確認済 (in-session inline)

PR 0 closure 時点で `audit/day-26-closure` branch HEAD は main fast-forward 後 (origin/main `7200edc`) の state。Dashboard を `preview_screenshot` で 1440×900 inline 確認、layout 健全 (sidebar 220px + main + PrototypeModeLabel + NextActionStrip + 業務 card 2 + 動線 button) を確認済。Console error 0。

## Backlog (PR 1 着手時に解消候補)

baseline-current PNG を実 disk 保存するには以下 3 option:

1. **Playwright install** (`npm i -D @playwright/test`) + script 起動で headless Chrome → PNG 保存
2. **Computer-use MCP** で local Chrome を直接 screenshot → save_file
3. **手動** (user が Chrome dev tools で screenshot 撮影 → 配置)

本 v3.0 plan §Out of Scope 9 で `Lighthouse / Playwright / axe-cli tooling install は backlog` と明示しているため、option 1 は本 plan scope 外。

## 推奨 (PR 1 着手時の handling)

- baseline-current は **conceptual anchor only**、実 PNG は **PR 1 着手時点で再撮影 → wave1/ に保存** で代用
- Visual regression は `wave1/`〜`wave4/` 内の PR ごとの screenshot 自己比較で実施 (baseline-current との strict diff は本 plan では実施しない)
- closure-table.md F-1〜F-10 の Verification evidence 列で `screenshots/wave{N}/` への pointer を記載

## Reference

- Implementation Plan v3.0 §PR 0 step (f): "baseline-current/ 8 PNG via preview MCP" の spec
- Implementation Plan v3.0 §Out of Scope 9: "Lighthouse / Playwright / axe-cli tooling install は backlog"
- Audit Report v1.3 Evidence Status: "visual observation log only" (PNG 未保存)
