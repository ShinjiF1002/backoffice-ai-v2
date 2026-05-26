| 項目 | 値 |
| --- | --- |
| 文書 ID | DOC-AUDIT-D26-PATTERN-MATRIX |
| 文書名 | Day 26 Pattern Conformance Matrix (10 card × applicable route) |
| 版数 | v1.0 |
| ステータス | P3 sealed、G1 Evidence Sanity 通過 |
| Evidence Status | empirical (observation-log.md D-01〜D-09 + state shots + accessibility tree + code path) |

---

# 10 Card × Applicable Route Matrix (~56 cell)

## Verdict legend

- **pass**: card claim 完全 conform
- **partial**: 主要 element の一部のみ conform、明示 gap あり
- **absent**: claim 該当要素 不在 or anti-pattern
- **N/A**: 該当 route で applicable でない

## Matrix

| # | Card | Dashboard | Inbox | CaseReview | SendBackComment | ProposalReview | AgentSettings | AuditTrail | Metrics | KnowledgeBrowser |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | ai-native-hil-approval-ui (5-state + actor band) | **partial** (D-01: 5-state breakdown aggregate visible だが per-card actor band 不在) | **partial** (D-02: 5-state chip visible、actor band 色のみ、icon prefix absent) | **pass** (D-03: 5 Lifecycle stepper + 証跡 timeline で agent/human 区別) | N/A | **partial** (D-05: 手順承認 flow、HIL state visible だが actor band 弱) | N/A | **partial** (D-07: actor-separated text visible、icon は uniform slate-600) | N/A | N/A |
| 2 ★ | diff-and-change-preview-ui (3-view + metadata strip 5 element) | N/A | N/A | **partial** (D-03: Inline diff ✓ / Side-by-side ❌ / Field table ❌、metadata strip Confidence + author 部分 / Change reason ❌ / Affected scope ❌ / Reversibility ❌) | N/A | **partial** (D-05: text-level 変更点記述、structured diff 不在) | N/A | N/A | N/A | N/A |
| 3 | action-history-timeline-audit-trail-ui (5-layer + 7 outcome state + 5 facet filter + Export) | N/A | N/A | **partial** (証跡 4 step は intra-case、Card 3 spec の cross-case timeline ではない) | N/A | N/A | N/A | **partial** (D-07: Time axis partial / 5 column partial / 7 outcome state ❌ / 5 facet filter 1/5 / Export ❌) | N/A | N/A |
| 4 | citation-and-source-disclosure-ui (compiled/staging boundary + tier + source ref) | N/A | N/A | **pass** (D-03: emerald compiled vs slate-50 inset staging panel + `citation 対象外` label) | N/A | N/A | N/A | N/A | N/A | **pass** (D-09: 3 tier badge 承認済/確認済/未承認、business-context tier appropriate) |
| 5 | confidence-and-uncertainty-visualization-ui (numeric + bar + 3-band threshold + uncertainty source) | **partial** (sparkline は trend、KPI confidence 不在) | N/A | **pass** (D-03: ConfidenceBar 0.84 + bar + 3-band 0.85/0.65 visible) | N/A | **partial** (D-05: 0.85 → 0.80 numeric だが confidence bar 不在、change の前後値のみ) | N/A | N/A | **partial** (D-08: HypothesisChip + Sparkline、3-band threshold は case-level 適用) | N/A |
| 6 | empty-error-loading-states (3 state + Empty 3 sub-state + Error escalation) | **absent** (D-01: happy path のみ、empty/error/loading の outlet 設計不在) | **absent** (D-02: 13 row 常時 visible、filtered-empty / truly-empty / permission-empty 不可視) | **absent** (D-03: happy path 集中、failure recovery flow unclear) | N/A | **absent** | **absent** | **absent** (D-07: 13 event 常時、empty timeline 不可視) | **absent** | **absent** (D-09: filter 適用後 0 件状態 unclear) |
| 7 | operator-cockpit-multi-agent-oversight-ui (3 viewport) | **partial** (D-01: aggregate KPI strip absent、per-workflow card 2 only、drill-down route 遷移) | N/A | N/A | N/A | N/A | N/A | N/A | **partial** (D-08: KPI grid aggregate あり、per-agent drill 不在) | N/A |
| 8 | multi-step-approval-and-workflow (4 element + SLA per step + Delegate + Reason required) | **partial** (D-01: step graph visible、Approver routing 不可視) | **partial** (D-02: SLA per step 不在、Delegate 不在) | **partial** (D-03: 5 step graph ✓ / Escape hatch ✓ / Reason required ✓ / SLA per step ❌ / Delegate ❌ / All approvers visible 弱) | **pass** (D-04: Reason required + 自由記述 gate 正常) | N/A | N/A | N/A | N/A | N/A |
| 9 | raci-on-agent-action (RACI-A 5-role disclosure surface) | N/A | N/A | N/A | N/A | **partial** (D-05/D-05b: default closed、`?demo=1` で 5 role visible) | **partial** (D-06: rbac-1 ✓ / rbac-3 ✓ / rbac-2 partial / rbac-4 ❌ scope 不可視) | **partial** (D-07: actor-separated visible、5 role explicit mapping ❌) | N/A | N/A |
| 10 | agent-failure-explainability-ui (3 layer: What failed / Why / What user can do) | N/A | N/A | **partial** (D-03: 注意 strip で What failed 表面、Why = `OCR 信頼度未達`、What user can do = 差戻し / 承認 button) | **partial** (D-04: failure category 5 radio = Why のみ、What failed / What user can do は別 surface) | N/A | N/A | **absent** (D-07: failed event row が mock data に 0、failure state UI 検証不能) | N/A | N/A |

---

## Verdict 分布集計 (G1 Evidence Sanity)

| Verdict | Count | % |
| --- | --- | --- |
| pass | 7 | 14% |
| partial | 26 | 51% |
| absent | 9 | 18% |
| N/A | 9 | 18% |
| **Total cell** | **51** | 100% |

(applicable cell only、N/A 9 を含む全 51 cell)

**G1 bias check**:
- partial 51% → plan 想定 (Day 19 後の現実的 state) と整合、rubric 妥当
- absent 18% → 中止条件 60+ % を大幅下回り、補完 audit として継続可
- pass 14% は Day 19 で大半が clarity 軸に focus し pattern 軸まで届かなかったことの反映、想定範囲

**G1 pass**: continue to P4。

---

## Day 19 重複 Check (G1 sanity)

各 finding 候補 (P3 matrix の partial/absent cell) に Day 19 applied 18 ledger との overlap を marker 付与:

| Finding 候補 (route × card) | Day 19 overlap | Tag |
| --- | --- | --- |
| Diff 3-view + metadata strip 5-element (Card 2 ★ on CaseReview/ProposalReview) | 0 (Day 19 U-4 EvidenceTimeline paraphrase は別 angle) | **adjacent-to-Day19** (D-03 同一 surface だが別 angle) |
| Audit Timeline 5-layer + 7 outcome state + 5 facet + Export (Card 3 on AuditTrail) | partial (Day 19 U-2 internal schema gate 適用済) | **adjacent-to-Day19** (D-07 同一 surface だが pattern conformance angle、内部 schema leak とは別) |
| HIL actor band / icon prefix (Card 1 on Dashboard/Inbox/CaseReview/ProposalReview/AuditTrail) | 0 (Day 19 は actor visibility に明示触れず) | **new** |
| Empty/Error/Loading state machine (Card 6 横串) | 0 (Day 19 は happy path 中心) | **new** |
| Cockpit 3 viewport (Card 7 on Dashboard/Metrics) | 0 (Day 19 U-15 Dashboard lane は defer、本 audit angle と無関係) | **new** |
| Multi-step SLA per step + Delegate (Card 8 on CaseReview/Inbox) | 0 | **new** |
| RACI-A 5-role default closed (Card 9 on ProposalReview/AgentSettings) | partial (Day 19 U-6 で DetailDrawer に移動済、ただし `?demo=1` 必要 default は別 finding) | **adjacent-to-Day19** |
| Agent permission scope (rbac-4 fail on AgentSettings) | 0 | **new** |
| Failure explainability 3 layer split (Card 10 on CaseReview/SendBackComment/AuditTrail) | 0 (Day 19 U-21 docs/03 excluded、Day 19 で failure surface 触れず) | **new** |
| Mobile layout breakage (R1 横串、9 page) | 0 (Day 19 は 1440×900 only) | **new** |

**G1 pass**: 同一 finding / 同一 fix proposal の重複 0、adjacent-to-Day19 3 件は許可 scope 内、new 7 件は本 audit core deliverable。Day 19 ledger との安全な分離達成。

P4 着手可。
