# research-compounder Cards (Gate 1 関連 3 card verbatim)

`prototype/audit/day-26/cards-claims.md` から該当 card の Claim block を verbatim 抽出。Claude Design に「Pattern reference」として投入。

---

## Card 1: ai-native-hil-approval-ui (F-5 ActorBand reference)

> AI agent action を含む業務 UI では、**5 つの state (pending / approved / rejected / failed / escalated)** を timeline 列で常時露出し、**agent と human の action を icon prefix + color band で区別**し、audit log を **actor-separated column (agent 列 / human 列)** で 1 行 1 transition として保存する。

**該当 page**: CaseReview / Inbox / AuditTrail

**Verdict criterion**:
- pass: 5-state全部 visible + actor distinguishable + audit log actor-separated
- partial: 5-state visible だが actor band absent、or audit log actor column 統合
- absent: 5-state 未実装 or 3-state 等 reduced
- N/A: agent action surface 不在

---

## Card 2 ★: diff-and-change-preview-ui (F-2 DiffPreviewBlock + MetadataStrip reference)

> Diff / Change Preview UI は **3 view + 1 metadata strip** で構築する: (View 1) **Side-by-side** (左=before / 右=after、word-level highlight、structured field の add/remove/modify を color 区別 green/red/yellow) (View 2) **Inline diff** (1 column、changed segment のみ展開) (View 3) **Field table** (Structured record で各 field の before / after / change type / impact tier を行表示)。**Metadata strip**: Change author (AI agent name + model version) / Change reason / Confidence / Affected scope (customer count / $ amount / regulator-touchable Y/N) / Reversibility (Revertible / Partial / Irreversible) を 1 行で。**承認 button は metadata strip 確認後にのみ active 化** (UX gate)。

**該当 page**: CaseReview / ProposalReview

**Verdict criterion**:
- pass: 3 view 全部 + metadata strip 5 element 全部
- partial: 1-2 view + metadata strip 部分実装
- absent: diff visible だが view も metadata strip も無構造
- N/A: diff surface 不在

---

## Card 8: multi-step-approval-and-workflow (F-7 SLA + delegate reference)

> Multi-step approval workflow は **4 element**: (1) **Step graph** (sequential / parallel / conditional の DAG) (2) **Approver routing** (role-based + dollar threshold + risk-tier + delegate hierarchy) (3) **Visibility + transparency** (current step、all steps、who pending、SLA per step) (4) **Escape hatches** (escalation up、return for changes、cancel)。Default rule: 3-5 step max、Per-step SLA (4h/24h/business-day)、Delegate model (out-of-office で auto-route)、All approvers visible、Reason required for reject + return、Audit log per step。

**該当 page**: CaseReview Lifecycle (受付 → AI処理 → 入力者確認 → 承認者承認 → 反映) / Inbox / Dashboard

**Verdict criterion**:
- pass: 4 element 全部 + SLA per step visible + delegate + escape hatch (差戻し)
- partial: step graph + visibility あり、SLA or delegate absent
- absent: step 不可視 or 単一 step flat
- N/A

---

## Note for Claude Design

各 card は research-compounder の knowledge base の verbatim Claim block。Banking BO HIL 業務の craft pattern として確立。本 Gate 1 では F-2 (Card 2)、F-5 (Card 1 actor band 部)、F-7 (Card 8 SLA + delegate 部) を visual decision 対象。

Card claim の wording は変更不可、Operational Premium Light + JP-only context で **適切に翻案** して visual design に落とす。

例: Card 1 "icon prefix + color band" → ActorBand primitive (4px color band + lucide-react icon: bot/user/cog)、Card 8 "SLA per step visible" → LifecycleStepper 拡張で per-step SLA badge (amber chip "4h target" / red chip "24h escalation")
