Requested output style: high-fidelity polished mockup (full color, real data render, design system applied)
(**新たな High Fidelity session を作成してから本 prompt を paste**してください — Claude Design UI に固定 mode pill あり、Hub pilot で確認済)
(design system は Project に登録済み (Step 1 で恒久 register)。**同 Project 内 Wireframe session で生成した同 page の wireframe を layout baseline として参照**してください — Claude Design は Project 共有 context で wireframe を継承します、再 attach 不要)

# Page: Queue (案件受信トレイ) — polished mockup 化

## Polish 指示

1. previous wireframe の layout (5 column table + Drawer + PrimaryAnchor + L3 Disclosure) はそのまま保持
2. design system full 適用 (token / typography / radius / shadow)
3. Recommended row highlight: CASE-2026-0142 行に alert-soft tint (#FFFBEB) + 1px left border alert (#F59E0B)
4. Status badge tone:
   - "入力者確認待ち" → primary-soft (#EEF2FF / #635BFF)
   - "AI 処理中" → neutral (slate-100 / slate-700)
   - "承認者承認待ち" → primary-soft
   - "差戻し" → alert-soft (#FFFBEB / #78350F)
   - "反映済" → success-soft (#ECFDF5 / #047857)
5. ActorBand icon prefix (担当者 column):
   - human icon (lucide `User`) で sm size
   - 名前を `text-xs` で右隣 inline
6. 注意 chip: alertCount > 0 のときのみ表示、bg alert-soft + AlertTriangle icon + 数値 mono tabular
7. 経過時間: JetBrains Mono + tabular-nums + 状態連動 tint (pending/ready/sent-back のみ tint):
   - 3h 超 → text-error-soft-fg (#B91C1C)
   - 1h-3h → text-alert-soft-fg (#78350F)
   - <1h → text-fg-muted (#64748B)
   - business-approval-waiting / reflected → text-fg-muted 固定 (入力者責任範囲外)
8. micro-interaction:
   - Row hover: bg slate-50、cursor pointer
   - Row click → Drawer slide-in 250ms ease-out
   - Drawer overlay: bg-transparent (non-modal、background scrollable)
   - PrimaryAnchor CTA hover: bg indigo #635BFF → #4F46E5、150ms
9. Drawer (480px width):
   - Header: case ID + workflow name + StatusBadge + 経過 chip + 注意 chip
   - Section 1: 主要 field 先頭 3 (label + value + 信頼度 mono)
   - Section 2: 引用根拠 N 件 chip
   - Section 3: CTA "案件レビューを開く" (primary full-width)
10. PrototypeModeLabel pill TopBar 右、Sidebar "受信トレイ" active

## Visual constraint re-stated (1 paste 完結性のための最小 inline)

- Primary indigo #635BFF / hover #4F46E5
- Status tone: primary-soft / alert-soft / success-soft / neutral (slate-100)
- Table border-bottom: 1px slate-100 (row 間)、header border: 1px slate-200
- Card radius 8px, control 6px, chip 4px
- Inter + Noto Sans JP + JetBrains Mono (numeric tabular)
- No decoration

## State coverage (5 state)

- **Ideal** (default): 13 行 table + recommended highlight
- **Empty** (mock data なし時): table 中央に "まだ案件がありません" + secondary CTA、Drawer は閉じ
- **Filtered-empty** (filter chip active で 0 件時、L3 Disclosure 内 filter ON): "フィルタに一致する案件がありません"
- **Loading**: 5 行 skeleton (row height h-9)
- **Error / Partial**: 本画面 scope-out (Observatory audit / metrics で扱う)

## Acceptance check
- [ ] CASE-2026-0142 row が alert-soft tint で highlight
- [ ] Status badge 5 種が semantic tone で描き分けられている
- [ ] ActorBand icon + 担当者名が compact 1-line に収まる
- [ ] Drawer が row click で開き、CTA "案件レビューを開く" が primary
- [ ] L3 Disclosure ("絞り込み・並び順・一括操作を見る") が default closed
- [ ] PrototypeModeLabel pill が TopBar 右に visible
