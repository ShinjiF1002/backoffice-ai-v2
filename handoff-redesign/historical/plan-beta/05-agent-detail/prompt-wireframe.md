Requested output style: low-fi wireframe sketch (mono color, basic shapes, gray scale, placeholder text 可)
(**New Session 作成時に "Wireframe" mode を選んでから本 prompt を paste**してください — Claude Design UI に固定 mode pill あり、Hub pilot で確認済)

# Page: AgentDetail (Agent 設定)
Typology: C (Detail Workspace、2-col grid)
Route: `/agents/:agentId`
Goal: Agent 設定担当者が trust level current + config primary 3 行 + simulation snapshot を 1 viewport で確認、変更を申請する

## Layout

### Header (sticky, min-h 88px)
- breadcrumb: "ハブ › Agent 設定 › agent-corporate-address-change"
- h1: "法人住所変更 Agent" (workflow 名)
- chip × 1 (Trust Level): "[Supervised]" (TrustLevelBadge compact)
- L2 demoted: agent version v2.3 (mono)
- 右端 hedge chip: "[仮説 / 要検証]"

### PrimaryAnchor strip (Header 直下)
- label: "設定変更"
- summary: "現在 Supervised / 進化要件 75% 達成"
- CTA primary "設定変更を申請" (設定承認 flow を起動)

### Body — Detail typology (2-col)

#### Primary (7/12 col)

##### Section A: Trust level current (compact、L1)
- 現在 Trust Level: Supervised (badge)
- 次の段階: Checkpoint (badge muted)
- 進化要件達成度: 75% (progress bar)
- (4 KPI 進化要件 grid は L3 Disclosure 行き、詳細は内側)

##### Section B: Config primary 3 行 (compact、L1)
- モデル: claude-opus-4-5-20250513
- 上限: 1 日 100 case、token 50000/case
- 権限: read-only (BO master)、staging write、formal write NG (settings 承認後のみ)
(残 2 行 [プロンプト / ツール] は L3 Disclosure 行き)

##### Section C: Simulation snapshot (L2 compact)
- 直近 5 case の simulation 結果: 4 success / 1 caution
- compact list、各 case ID + simulation status + confidence
(完全 simulation は L3 Disclosure 内)

#### Aux (5/12 col)

##### Recent change history (L1、compact 5 行)
- v2.3 (2026-05-15): プロンプト改定、approved by 山田課長
- v2.2 (2026-05-08): ツール拡張、approved by 山田課長
- v2.1 (2026-04-30): 上限緩和、approved by 田中部長
- ... (5 件まで)
- "全履歴を見る" link → L3 Disclosure 内側へ

##### Trust Progression 4 KPI grid (L3 Disclosure、default closed)
- toggle: "進化要件 4 KPI を見る"
- 中身:
  - AI 入力承認率 92% [仮説 / 要検証] (target 95%)
  - 人手上書き率 0.12 [仮説 / 要検証] (threshold 0.15)
  - Alert 発生率 0.08 [仮説 / 要検証] (threshold 0.10)
  - 承認者差戻し率 0.05 [仮説 / 要検証] (threshold 0.07)

##### L3 Disclosure (other):
- 完全 Config (5 field grid full)
- Simulation 全件
- 全変更履歴

### Footer (sticky)
- 設定変更を申請 (primary) / 草稿保存 + caption "本変更は設定承認 flow を起動します"

## Data (mock agent-corporate-address-change)
- agent name: 法人住所変更 Agent
- version: v2.3
- Trust Level: Supervised
- 進化要件達成度: 75%
- モデル: claude-opus-4-5-20250513
- 上限: 1 日 100 case、token 50000/case
- 権限: read-only (BO master)、staging write、formal write NG
- Simulation: 直近 5 case で 4 success / 1 caution
- Change history 5 件

## Visual constraint (key tokens re-stated)
- Canvas slate-50 / Panel white
- Primary indigo / Trust badge (Supervised = neutral slate / Checkpoint = primary-soft / Autonomous = success-soft)
- Radius card 8px / control 6px / chip 4px
- Inter + Noto Sans JP + JetBrains Mono (agent ID / version / threshold 数値)
- 装飾禁止

## Chrome
- Sidebar 5 nav、"Agent 設定" active
- TopBar: 共通

## Anti-pattern (旧 AgentSettings)
- 旧: 4 section 縦並び (Trust Progression / Config / Simulation / History)、Trust Progression 4 KPI grid が L1 full visible → 新: trust current + config 3 行 + simulation snapshot を L1、4 KPI grid を L3 Disclosure
- 旧: Config 5 field grid full → 新: primary 3 行 L1、残 2 行 (プロンプト / ツール) を L3
- 旧: Simulation / History が縦に積み重なる → 新: aux col に compact history、Simulation snapshot は primary L2

## Acceptance check
- [ ] Trust level current が L1 compact (Supervised badge + 進化要件 75% bar)
- [ ] Config primary 3 行 (モデル / 上限 / 権限) が L1、残 2 行は L3 Disclosure 内
- [ ] Simulation snapshot が L2 compact (直近 5 件)
- [ ] Recent change history 5 行が aux col L1、全履歴は L3 Disclosure
- [ ] Trust Progression 4 KPI grid が L3 Disclosure default closed
