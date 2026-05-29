Requested output style: high-fidelity polished mockup (full color, real data render, design system applied)
(**新たな High Fidelity session を作成してから本 prompt を paste**してください — Claude Design UI に固定 mode pill あり、Hub pilot で確認済)
(design system は Project に登録済み (Step 1 で恒久 register)。**同 Project 内 Wireframe session で生成した同 page の wireframe を layout baseline として参照**してください — Claude Design は Project 共有 context で wireframe を継承します、再 attach 不要)

# Page: Hub (Operations Overview) — polished mockup 化

## Polish 指示

1. previous wireframe in this conversation の layout / typology / hierarchy はそのまま保持
2. design system (registered in Step 1) を full 適用 (color / typography / radius / shadow / motion)
3. KPI card に sparkline (7 day) を実描画 (mock 数値 7 個 inline で提供):
   - 注意あり (alert-soft bg): [3, 5, 4, 6, 4, 3, 4]
   - SLA 3h 超 (alert-soft bg): [0, 1, 0, 2, 1, 1, 1]
   - 承認者承認待ち (primary-soft bg): [1, 2, 1, 2, 3, 2, 2]
4. 業務 card 1-liner の sparkline (注意率 7 day):
   - UC-BO-01: [0.30, 0.40, 0.20, 0.50, 0.30, 0.40, 0.375]
   - UC-BO-02: [0.10, 0.20, 0.10, 0.30, 0.20, 0.20, 0.20]
5. micro-interaction:
   - Disclosure expand 250ms、ease-out
   - KPI card hover: 1px shadow-elevation slight lift (Charter Micro-Polish "hover-lift")
   - PrimaryAnchor CTA hover: bg indigo #635BFF → #4F46E5、150ms
   - 業務 card 1-liner text-link hover: underline + color shift
6. PrototypeModeLabel pill を TopBar 右に固定表示 (文言「プロトタイプ表示 — 外部システム未接続 / 証跡はモック」、bg slate-100 / fg slate-600、警告色禁止)
7. Sidebar の "ハブ" nav が active (bg primary-soft #EEF2FF / fg primary #635BFF / font-semibold)
8. tabular numeric: 経過時間 (03:24:15) / 案件 ID (CASE-2026-0142) / KPI 数値はすべて JetBrains Mono + tabular-nums

## Visual constraint re-stated (1 paste 完結性のための最小 inline、design system 適用済前提)

- Primary indigo #635BFF / hover #4F46E5
- Alert-soft bg #FFFBEB / fg #78350F、Primary-soft bg #EEF2FF / fg #635BFF
- Card radius 8px, control 6px, chip 4px
- Inter + Noto Sans JP + JetBrains Mono (numeric tabular)
- 1px hairline border #E5E7EB
- No decoration: gradient mesh / glow / glassmorphism / 3D icon / illustration / cream-beige / dark mode

## State coverage (Charter 5 state 規範)

mockup 中で以下 5 state の visual を Hub 1 画面で示せる範囲で表現:

- **Ideal** (default 描画): 13 件、注意 4、KPI 3 個に値
- **Empty** (Disclosure 内): "詳細集計を見る" 内側の breakdown は collapsed default、empty も表現可
- **Loading**: 不要 (mockup は static)
- **Error**: 不要 (Hub は global error 表示しない、Observatory audit tab で扱う)
- **Partial**: 不要 (Hub は集計表示、partial は Observatory audit / metrics で扱う)

## Acceptance check (mockup polished 後 visual judge)
- [ ] Sparkline 3 (KPI) + 2 (業務 card) = 5 個実描画 (placeholder ではなく具体線)
- [ ] Disclosure default collapsed、expand transition 250ms smooth
- [ ] PrototypeModeLabel pill が常時 visible (TopBar 右)
- [ ] 色は design system token に一致 (任意の hex hardcode なし、token name 経由)
- [ ] previous wireframe の Header / PrimaryAnchor / Body 3-tier / Footer 規範はそのまま保持
- [ ] sidebar の "ハブ" active state (primary-soft bg)
- [ ] 経過時間 / 案件 ID は tabular-nums で揃っている
