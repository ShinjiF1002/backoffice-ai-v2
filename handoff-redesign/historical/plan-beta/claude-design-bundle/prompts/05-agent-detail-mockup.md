Requested output style: high-fidelity polished mockup (full color, real data render, design system applied)
(**新たな High Fidelity session を作成してから本 prompt を paste**してください — Claude Design UI に固定 mode pill あり、Hub pilot で確認済)
(design system は Project に登録済み (Step 1 で恒久 register)。**同 Project 内 Wireframe session で生成した同 page の wireframe を layout baseline として参照**してください — Claude Design は Project 共有 context で wireframe を継承します、再 attach 不要)

# Page: AgentDetail (Agent 設定) — polished mockup 化

## Polish 指示

1. previous wireframe の 2-col layout + PrimaryAnchor + Section A/B/C + aux 2 panel + L3 Disclosure はそのまま保持
2. design system full 適用
3. Trust Level badge:
   - Supervised (current): slate-100 bg + slate-700 fg (neutral)
   - Checkpoint (next): primary-soft #EEF2FF + primary #635BFF (target tone)
   - Autonomous (future): success-soft + emerald (将来 stage)
4. 進化要件 progress bar:
   - 75% = 1 行 horizontal、bg primary-soft、fg primary indigo
   - 0-100% scale、threshold markers なし (L3 Disclosure 内側で詳細)
5. Config 3 行 (L1):
   - label + value (mono for token / version、sans for モデル / 権限)
   - 行 padding `py-2.5`、border-bottom 1px slate-100
6. Simulation snapshot (L2):
   - badge "4 success / 1 caution"
   - 直近 5 件 inline (case ID mono + status badge + confidence mono)
7. Recent change history (aux col L1):
   - timeline 5 行、各行 (date mono + change description + approved by)
   - date は JetBrains Mono、approver は ActorBand
8. Trust Progression 4 KPI grid (L3 Disclosure 内):
   - 2x2 grid
   - 各 KPI: 数値 (mono large) + threshold (mono small) + [仮説 / 要検証] hedge
   - 状態 conditional badge (target 達成 = success-soft、未達 = alert-soft)
9. PrimaryAnchor strip (Header 直下):
   - bg primary-soft slight tint
   - CTA "設定変更を申請" primary indigo
10. Footer:
    - "設定変更を申請" right (primary) + "草稿保存" tertiary text + 左 caption
11. micro-interaction:
    - Disclosure expand 250ms
    - Progress bar fade in 300ms on mount
    - PrimaryAnchor CTA hover indigo-700
12. PrototypeModeLabel pill TopBar 右、Sidebar "Agent 設定" active

## Visual constraint re-stated

- Primary indigo / Trust badge tone (Supervised neutral / Checkpoint primary-soft / Autonomous success-soft)
- Card radius 8px, control 6px, chip 4px
- Mono tabular for agent version / threshold / case count
- No decoration

## State coverage

- **Ideal**: Trust = Supervised、75% 進化要件、Config 3 行、Simulation 4/1
- **Loading**: 各 section skeleton
- **Error**: agent fetch failed → EmptyState (error variant)
- **Empty**: 新規 agent 未設定時 (rare)
- **Partial**: simulation 0 件のとき "Simulation 未実行" placeholder

## Acceptance check
- [ ] Trust Level badge "Supervised" が neutral tone (slate)、Checkpoint badge は primary-soft で next stage 提示
- [ ] 進化要件 75% progress bar が primary tone で描画
- [ ] Config 3 行 (モデル / 上限 / 権限) が L1 compact、残 2 行は L3 Disclosure
- [ ] Recent change history 5 行が aux col timeline 形式
- [ ] Trust Progression 4 KPI grid が L3 Disclosure default closed、開いた時 2x2 grid 描画
- [ ] PrimaryAnchor "設定変更を申請" + Footer 同 CTA の 2 段配置
