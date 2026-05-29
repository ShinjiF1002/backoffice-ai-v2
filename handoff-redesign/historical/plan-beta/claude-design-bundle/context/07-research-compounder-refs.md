# research-compounder Refs — 3 Card 違反 Mapping

> Source: `~/code/active/research-compounder/knowledge/ui-design/`
> 本 file は redesign の各画面判断の根拠。Claude Design に「なぜこの layout / hierarchy を採るか」を伝える。

---

## Card 1: Executive Dashboard Layout Pattern (`executive-dashboard-layout-pattern.md`)

### Claim
Executive dashboard は 3 layer: **(1) Headline tier (top, 3-5 KPI) = 月次 / 四半期の経営判断 KPI、各 KPI に delta vs target / vs PY / vs PoY、(2) Drill-down tier (mid, 5-10 subordinate KPI / chart) = segment / driver 別、(3) Diagnostic tier (bottom, on-demand) = filter / pivot / detail table。**

### Headline KPI 選定 rule
- **3-5 個** (6+ で attention dilute)
- 各 KPI = single number + delta + sparkline
- **Actionable** (経営が触れる lever に直結) — vanity (累積 user 数、累積 download 数) **禁則**
- Threshold-based color: green within target / yellow ±10% / red >10% miss

### 旧 prototype Dashboard violation
- Cockpit 5 KPI に「案件総数」「反映済 (本日)」が含まれる → **vanity metric が Headline tier 違反**
- 業務 card 2 は 11 element grid → Headline と Drill が同 viewport 混在
- 各 KPI に delta / sparkline 表示なし (Sparkline は業務 card 内のみ)

### 本 redesign Hub の対応
- Headline tier 3 KPI = 注意あり (actionable: 差戻し) / SLA 3h 超 (actionable: 優先処理) / 承認者承認待ち (actionable: 催促) — vanity 排除
- 各 KPI に sparkline 7 day 必須
- Drill tier = 業務 card 2 1-liner (4 element 1 row)
- Diagnostic tier = Disclosure default collapsed (vanity / breakdown / lane)

---

## Card 2: Enterprise SaaS Information Architecture (`enterprise-saas-information-architecture.md`)

### Claim
Enterprise SaaS の IA は 3 階層: **(1) Workspace switcher (top-bar 左)、(2) Primary nav (機能領域、left rail / top tab、5-9 個)、(3) Secondary nav / context switcher (機能領域内の view / filter)。Primary nav 数 = 5-9 個 で fix、10+ は cognitive load 過剰。各 view は table-centric (master) + drawer / detail page (detail) の master-detail に default、card grid / list は 限定用途。**

### Master-Detail デフォルト
| Pattern | 使い分け |
|---|---|
| **Table + Drawer** | Default、対象一覧 + 詳細を併存 |
| **Table + Detail page (URL)** | URL share が必要 (audit / casework) |
| Card grid | Visual / image 重視 (catalog、media) **のみ** |
| Kanban board | Workflow stage 固定で短い (ticket、deal stage) のみ |
| Timeline | Time-series が main axis (activity log) のみ |

### 旧 prototype violation
- Sidebar 8 nav (案件処理 alias 含む) → 5-9 範囲 OK だが alias は cognitive load
- Dashboard の業務 card grid → visual / image なし、非 visual 数値 card で grid 採用 = **violation**
- CaseReview / ProposalReview は detail page (URL share 用途で OK、ただし inline drawer も併用したい)

### 本 redesign の対応
- Sidebar 5 nav に削減 (案件処理 alias を drop、CaseDetail は Queue row click から navigate)
- Hub Drill tier = card grid ではなく 1-liner row (4 element)
- Queue = Table + Drawer (master-detail default)
- CaseDetail / ProposalDetail / AgentDetail = Detail page (URL share)
- Observatory = 3-tab、各 tab 内 table-centric

---

## Card 3: AI-native HIL Approval UI (`ai-native-hil-approval-ui.md`)

### Claim
AI agent action を含む業務 UI では、**5 つの state (pending / approved / rejected / failed / escalated) を timeline 列で常時露出**し、agent と human の action を **icon prefix + color band で区別**し、**audit log を actor-separated column (agent 列 / human 列) で 1 行 1 transition** として保存する。

### 誤用しやすい点
- 「approved」を AI agent が押せる UI → audit-trail で actor が区別不能、規制違反
- 5 state を tab 切替で見せる → pending と escalated の関係性 (SLA timer 等) が消える、timeline 列で全 state を 1 viewport
- failed と rejected を統合 → failed = agent execution error (再実行可能)、rejected = human が意思で却下 (再実行禁止)、recovery flow 破綻
- audit log を JSON dump → UI 上の challengeability に不足、actor / action / before-after diff を 3 列で見せる

### 旧 prototype violation
- Inbox table は status chip ばらまき、timeline 列で 1 viewport 表現していない
- CaseReview に LifecycleStepper はあるが、5 state (pending / approved / rejected / failed / escalated) と完全一致しない (旧 5 status: pending/ready/sent-back/business-approval-waiting/reflected)
- Audit log の actor-separated column は AuditTrail で部分実現、Queue / CaseDetail では actor band が散在

### 本 redesign の対応
- Queue table: 状態 column を timeline 圧縮表現 (status badge + 経過 mono + actor band 並列、color band で 1 行 1 transition)
- CaseDetail: LifecycleStepper を sticky 化、5 state を 1 viewport
- Observatory audit tab: actor-separated column (agent / human / system) 強調、icon prefix + color band

---

## redesign 全体の Layer 1 ref summary

| 旧 prototype 問題 | 該当 card | redesign 対応画面 |
|---|---|---|
| Dashboard primary action 3 並列 | Card 1 (3 layer 違反) | Hub: PrimaryAnchor 1 + Headline 3 + Drill 2 + Diagnostic Disclosure |
| Cockpit 5 KPI に vanity | Card 1 (actionable rule) | Hub: vanity を Diagnostic Disclosure に降格 |
| 業務 card grid 非 visual | Card 2 (master-detail) | Hub: 1-liner row、Queue: Table + Drawer |
| Sidebar alias 散在 | Card 2 (5-9 nav) | Sidebar 5 nav |
| Status timeline 散在 | Card 3 (timeline 列) | Queue: 圧縮 timeline、CaseDetail: sticky LifecycleStepper |
| Actor band 表記揺れ | Card 3 (actor-separated) | Observatory audit tab で actor column 強調 |
