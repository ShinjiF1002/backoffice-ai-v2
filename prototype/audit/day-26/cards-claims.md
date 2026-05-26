| 項目 | 値 |
| --- | --- |
| 文書 ID | DOC-AUDIT-D26-CARDS-CLAIMS |
| 文書名 | Day 26 must-have 10 cards claim verbatim 抽出 |
| 版数 | v1.0 |
| ステータス | P1 sealed (P3 matrix の SSOT input) |
| Evidence Status | empirical (research-compounder knowledge cards verbatim copy) |

---

# 10 Must-have Cards — Claim Verbatim (matrix judge SSOT)

各 card の `## Claim` block を verbatim 抽出。P3 で各 cell の verdict (pass/partial/absent/N/A) はこの claim 文を criterion とする。

## Card 1: ai-native-hil-approval-ui

> AI agent action を含む業務 UI では、**5 つの state (pending / approved / rejected / failed / escalated)** を timeline 列で常時露出し、**agent と human の action を icon prefix + color band で区別**し、audit log を **actor-separated column (agent 列 / human 列)** で 1 行 1 transition として保存する。

**該当 page**: CaseReview / Inbox / AuditTrail

**Verdict criterion**:
- pass: 5-state全部 visible + actor distinguishable + audit log actor-separated
- partial: 5-state visible だが actor band absent、or audit log actor column 統合
- absent: 5-state 未実装 or 3-state 等 reduced
- N/A: agent action surface 不在

## Card 2 ★: diff-and-change-preview-ui

> Diff / Change Preview UI は **3 view + 1 metadata strip** で構築する: (View 1) **Side-by-side** (左=before / 右=after、word-level highlight、structured field の add/remove/modify を color 区別 green/red/yellow) (View 2) **Inline diff** (1 column、changed segment のみ展開) (View 3) **Field table** (Structured record で各 field の before / after / change type / impact tier を行表示)。**Metadata strip**: Change author (AI agent name + model version) / Change reason / Confidence / Affected scope (customer count / $ amount / regulator-touchable Y/N) / Reversibility (Revertible / Partial / Irreversible) を 1 行で。**承認 button は metadata strip 確認後にのみ active 化** (UX gate)。

**該当 page**: CaseReview / ProposalReview

**Verdict criterion**:
- pass: 3 view 全部 + metadata strip 5 element 全部
- partial: 1-2 view + metadata strip 部分実装
- absent: diff visible だが view も metadata strip も無構造
- N/A: diff surface 不在

## Card 3: action-history-timeline-audit-trail-ui

> AI Agent Action History は **5 layer の timeline UI** で構築する: (1) **Time axis** (Absolute timestamp ISO 8601 + Relative + UTC+local timezone、≥1 year retention) (2) **Action row** (5 mandatory columns: Timestamp / Agent ID / Action verb / Target object / Outcome state、Outcome は **Proposed / Approved / Rejected / Executed / Failed / Reverted / Escalated の 7 state**) (3) **Drill-down panel** (右 drawer: Input full payload + Output diff + Reasoning trace + Source citation + Human reviewer ID + Approval timestamp) (4) **Filter / pivot** (Agent / Date range / Outcome / Risk tier / Customer segment の 5 必須 facet + 全文 search) (5) **Export** (CSV / JSON / PDF — regulator submission 用、digital signature optional)。Timeline は **read-only** が default。

**該当 page**: AuditTrail

**Verdict criterion**:
- pass: 5 layer 全部 + 7 outcome state visible + 5 facet filter
- partial: 3-4 layer、Outcome state 5 or less、filter 3 facet 以下
- absent: timeline visible だが drill-down / filter 無構造
- N/A

## Card 4: citation-and-source-disclosure-ui

> citation surface は **承認済 (compiled approved) と未承認 (staging) を視覚的に分離**、各 entry に source ref + tier (T1/T2/T3) + accessed date を表示、staging は別 background + `citation 対象外` label 明示、AI が `引用根拠` として使えるのは **承認済のみ** に制限。

**該当 page**: KnowledgeBrowser / CaseReview

**Verdict criterion**:
- pass: compiled / staging boundary visible + 対象外 label + source ref + tier
- partial: boundary visible だが tier or source ref absent
- absent: boundary 不在 or staging citation 候補化
- N/A

## Card 5: confidence-and-uncertainty-visualization-ui

> Confidence は **numeric (0.00-1.00) + visual bar + threshold band (高信頼 ≥0.85 / 確認推奨 0.65-0.84 / 要確認 <0.65)** で表現、uncertainty source (data noise / model variance / out-of-distribution) を hover で expose、**threshold 未達時は CTA を visual de-emphasize**。Hedge は qualitative chip (HypothesisChip 等) と分離、numeric は数値、qualitative は status chip。

**該当 page**: CaseReview / ProposalReview / Metrics

**Verdict criterion**:
- pass: numeric + bar + 3-band threshold + uncertainty source expose
- partial: numeric + bar のみ、threshold absent
- absent: confidence visible だが threshold or visual unstructured
- N/A

## Card 6: empty-error-loading-states

> Empty / Error / Loading は装飾ではなく **state machine の outlet 設計**。Empty は (a) 原因 (filter? 未投入? 権限?) (b) 直近の代替 action 1 つ、Error は (a) 観測可能 cause (b) 再試行 idempotency 保証 (c) escalation channel、Loading は (a) duration prediction (skeleton vs spinner vs progress) (b) cancel 可能性、を必ず持つ。Empty sub-state: `truly-empty` / `filtered-empty` / `permission-empty` の 3 区別。

**該当 page**: 9 page 横串 (特に Inbox / AuditTrail / KnowledgeBrowser の filter / search 経路)

**Verdict criterion**:
- pass: 3 state 全部 + Empty 3 sub-state 区別 + Error escalation channel
- partial: 1-2 state 実装、Empty sub-state 単一化
- absent: state machine 不在 (happy path only)
- N/A

## Card 7: operator-cockpit-multi-agent-oversight-ui

> Operator Cockpit は **3 viewport の F-pattern layout**: (Viewport 1 — top strip) **Aggregate KPI** 5 指標 (Total throughput / Approval queue depth / Error rate / Pending escalation / Avg latency) (Viewport 2 — left grid) **Per-agent card** 5-30 cards (Agent name + 4 mini-metric)、状態順 sort (Error 多 → top) (Viewport 3 — right detail) **選択 agent drill-down** (action history timeline + recent error + kill switch + re-route button)。Polling 5 sec、Intervention action は 4 種 (Kill / Re-route / Throttle / Escalate) controlled vocabulary。

**該当 page**: Dashboard (multi-workflow 統括) / Metrics (KPI aggregate)

**Verdict criterion**:
- pass: 3 viewport 全部 + aggregate 5 KPI + per-workflow grid + drill-down
- partial: 2 viewport + KPI 部分 + drill-down absent
- absent: single viewport flat、aggregate-to-detail drill 不在
- N/A

## Card 8: multi-step-approval-and-workflow

> Multi-step approval workflow は **4 element**: (1) **Step graph** (sequential / parallel / conditional の DAG) (2) **Approver routing** (role-based + dollar threshold + risk-tier + delegate hierarchy) (3) **Visibility + transparency** (current step、all steps、who pending、SLA per step) (4) **Escape hatches** (escalation up、return for changes、cancel)。Default rule: 3-5 step max、Per-step SLA (4h/24h/business-day)、Delegate model (out-of-office で auto-route)、All approvers visible、Reason required for reject + return、Audit log per step。

**該当 page**: CaseReview Lifecycle (受付 → AI処理 → 入力者確認 → 承認者承認 → 反映) / Inbox / Dashboard

**Verdict criterion**:
- pass: 4 element 全部 + SLA per step visible + delegate + escape hatch (差戻し)
- partial: step graph + visibility あり、SLA or delegate absent
- absent: step 不可視 or 単一 step flat
- N/A

## Card 9: raci-on-agent-action (RACI-A 5-role)

> AI agent を含む business action は RACI 拡張 (`RACI-A`) で **Responsible / Accountable / Consulted / Informed / Agent-executor** の 5 role を分離記録。Agent (`E`) は execute 専用、Responsible / Accountable には絶対ならない。Accountable = ≥1 named role、Agent-executor は技術的 capability であり責任 actor ではないことを契約に明記。**UI 上で 5 role visible が disclosure surface 要件**。

**該当 page**: ProposalReview (RACI 表示) / AgentSettings (権限 grant UI) / AuditTrail (actor column)

**Verdict criterion** (本 audit は **surface 露出のみ**、compliance 判定なし):
- pass: 5 role 全部 visible + Agent-executor が R/A になっていない + Accountable に named role
- partial: 5 role の subset (3-4 role) visible、Agent / human boundary 混在
- absent: RACI 不可視 or single actor flat
- N/A

## Card 10: agent-failure-explainability-ui

> Agent failure は **3 layer の explainability**: (1) **What failed** (tool name + error category + retry count) (2) **Why** (input out-of-scope / model uncertainty / external timeout / policy violation) (3) **What user can do** (retry idempotent / manual fallback / escalate / cancel)。Failure は **error**, **failed (agent execution error)**, **rejected (human reject)** を区別、failed → escalated → manual fallback の recovery flow を visible に。

**該当 page**: CaseReview (`再処理中` state) / AuditTrail (failed event row)

**Verdict criterion**:
- pass: 3 layer 全部 + failed / rejected / error 区別 + recovery flow visible
- partial: 2 layer 実装、recovery flow 部分
- absent: failure state unexplained (黒箱)
- N/A
