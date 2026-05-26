# research-compounder Cards (Gate 2 関連 2 card verbatim)

`prototype/audit/day-26/cards-claims.md` から該当 card の Claim block を verbatim 抽出。Claude Design に「Pattern reference」として投入。

---

## Card 7: operator-cockpit-multi-agent-oversight-ui (F-6 Dashboard 3-viewport reference)

> Operator Cockpit は **3 viewport の F-pattern layout**: (Viewport 1 — top strip) **Aggregate KPI** 5 指標 (Total throughput / Approval queue depth / Error rate / Pending escalation / Avg latency) (Viewport 2 — left grid) **Per-agent card** 5-30 cards (Agent name + 4 mini-metric)、状態順 sort (Error 多 → top) (Viewport 3 — right detail) **選択 agent drill-down** (action history timeline + recent error + kill switch + re-route button)。Polling 5 sec、Intervention action は 4 種 (Kill / Re-route / Throttle / Escalate) controlled vocabulary。

**該当 page**: Dashboard (multi-workflow 統括) / Metrics (KPI aggregate)

**Verdict criterion**:
- pass: 3 viewport 全部 + aggregate 5 KPI + per-workflow grid + drill-down
- partial: 2 viewport + KPI 部分 + drill-down absent
- absent: single viewport flat、aggregate-to-detail drill 不在
- N/A

---

## Card 9: raci-on-agent-action (F-8 RACI default + F-9 permission scope reference)

> AI agent を含む business action は RACI 拡張 (`RACI-A`) で **Responsible / Accountable / Consulted / Informed / Agent-executor** の 5 role を分離記録。Agent (`E`) は execute 専用、Responsible / Accountable には絶対ならない。Accountable = ≥1 named role、Agent-executor は技術的 capability であり責任 actor ではないことを契約に明記。**UI 上で 5 role visible が disclosure surface 要件**。

**該当 page**: ProposalReview (RACI 表示) / AgentSettings (権限 grant UI) / AuditTrail (actor column)

**Verdict criterion** (本 audit は **surface 露出のみ**、compliance 判定なし):
- pass: 5 role 全部 visible + Agent-executor が R/A になっていない + Accountable に named role
- partial: 5 role の subset (3-4 role) visible、Agent / human boundary 混在
- absent: RACI 不可視 or single actor flat
- N/A

---

## Note for Claude Design

各 card は research-compounder の knowledge base の verbatim Claim block。banking BO HIL 業務の craft pattern として確立。本 Gate 2 では F-6 (Card 7 3-viewport)、F-8 (Card 9 disclosure surface)、F-9 (Card 9 + RBAC sub-check rbac-4) を visual decision 対象。

backoffice-ai-v2 prototype は 2 workflow only (UC-BO-01 法人住所変更 + UC-BO-02 口座開設書類完備)、Card 7 の "per-agent card 5-30 cards" は applicable 範囲外。本 prototype では **per-workflow card 2 only** + aggregate KPI strip + drill-down drawer に翻案。

例: Card 7 "kill switch + re-route button" は v2 prototype scope 外 (実 LLM 接続なし)、drill-down は read-only navigation + Day 19 NextActionStrip 連携で代替。Card 9 "Agent-executor は責任 actor ではない" は Tier 1 vocab `Agent` + `承認者承認` で明示。
