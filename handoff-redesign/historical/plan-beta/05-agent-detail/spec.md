# AgentDetail — Internal Spec

## Page identity

| 項目 | 値 |
|---|---|
| 旧 mapping | `prototype/src/pages/AgentSettings.tsx` |
| 新 route | `/agents/:agentId` (Sidebar nav `Agent 設定`) |
| typology | C (Detail Workspace、2-col grid) |

## Goal

Agent 設定担当者が Trust Level current + Config primary + Simulation snapshot を 1 viewport で確認、変更を申請する (設定承認 flow を起動)。

## Primary Action (1 つ)

- **"設定変更を申請"** — PrimaryAnchor strip CTA + Footer CTA

## Mechanical metric (target)

| Metric | 旧 AgentSettings | 新 AgentDetail |
|---|---|---|
| 4 KPI 進化要件 grid 表示位置 | L1 full visible | **L3 Disclosure default closed** |
| Config 表示 field 数 (L1) | 5 (full grid) | **3 (primary)、残 2 は L3** |
| Section 数 (L1) | 4 (Trust / Config / Simulation / History) | **3 (Trust current / Config 3 行 / Simulation snapshot)、History は aux col compact** |
| Sticky elements | PageHeader のみ | **PageHeader + PrimaryAnchor strip + Footer** |

## Layout 詳細

### Header (sticky)
- breadcrumb 3 segment
- h1 = agent workflow name
- chip × 1 (TrustLevelBadge compact)
- L2: version mono

### Body 2-col
- primary 7/12: Trust current (Section A) / Config 3 行 (Section B) / Simulation snapshot (Section C)
- aux 5/12: Recent change history 5 行 (L1) / 4 KPI grid (L3) / 完全 Config (L3) / 全 simulation (L3) / 全履歴 (L3)

### Footer
- 設定変更を申請 (primary) + 草稿保存 + caption

## Trust Level enum

- **Supervised** (current default): 人間確認必須 / 全 case で input
- **Checkpoint** (next stage): 高信頼度 case は自動 input、低信頼度のみ人間確認
- **Autonomous** (future): 全 case 自動、人間は監視のみ

各 stage には 4 KPI 進化要件 (承認率 / 上書き率 / Alert / 承認者差戻し率) が target 達成で next stage 移行可能。

## research-compounder 違反対応

- **Executive Dashboard Layout** (3 layer): Trust current + Config primary (L1) / Simulation snapshot + history (L2) / 4 KPI grid + 詳細 Config + 全履歴 (L3)
- **Enterprise SaaS IA** (master-detail): AgentDetail は detail page (URL share)、Sidebar から直接 navigate

## Charter 適用

- One-Glance Hierarchy: PrimaryAnchor + Trust current badge で「今 Agent はどの stage か / 何を変更できるか」即可視
- Progressive Disclosure: 4 KPI grid を L3 Disclosure (旧は L1 full visible)
- Action Proximity: Config 表示 → PrimaryAnchor CTA inline
- State Transparency: Trust badge + 進化要件 progress + version + Recent history で history 透明性
- Subtract before Adding: 旧 4 section 縦並び → 新 3 section + L3 Disclosure
- Make the State Visible: Trust stage 3 badge (Supervised / Checkpoint / Autonomous) で stage 可視
- Invest in the Smallest Thing: 進化要件 progress bar / TrustLevelBadge compact / version mono

## Phase 1A pilot 後 Step 2.6 patch 想定

- Trust Level 3 badge の visual 区別 (slate / primary-soft / success-soft) が伝わるか
- 4 KPI Disclosure expand 後の 2x2 grid が読みやすいか
- Recent change history の timeline 5 行が cluttering しないか
