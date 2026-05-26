| 項目 | 値 |
| --- | --- |
| 文書 ID | DOC-AUDIT-D26-UNIFIED-FINDINGS |
| 文書名 | Day 26 Unified Findings (R1 + R2 + R3 + R4 + R5 統合) |
| 版数 | v1.0 |
| ステータス | P3 sealed、G2 lock 候補 (P4 report の input) |
| Evidence Status | empirical |

---

# Unified Findings (10 件、P0 ×2 / P1 ×4 / P2 ×3 / Defer ×1)

10-20 cap 遵守 (10 件)、Day 19 同一重複 0、adjacent-to-Day19 tag 3 件、new tag 7 件。

| # | Severity | Tag | Finding (1 sentence) | Evidence | Card citation | Day 19 重複 |
| --- | --- | --- | --- | --- | --- | --- |
| F-1 | **P0** | new | **Mobile layout 完全 breakage** — Sidebar 220px が viewport 390px の 56% を占有、main column 文字単位 vertical wrap、9 page 横串で発生。Sidebar collapse / mobile drawer pattern 不在。 | observation-log M-01 + M-02 | (Card 全般、layout pre-requisite) | 0 (Day 19 1440×900 only) |
| F-2 | **P0** | adjacent-to-Day19 | **Diff / Change Preview の 3-view + metadata strip 5-element craft gap** — CaseReview / ProposalReview の承認 surface で Inline diff のみ、Side-by-side / Field table absent、metadata strip Confidence + author 部分のみ (Change reason / Affected scope / Reversibility 不在)、承認 button の metadata gate 不在。 | observation-log D-03 + D-05 | Card 2 ★ diff-and-change-preview-ui | 0 (Day 19 U-4 EvidenceTimeline paraphrase は別 angle) |
| F-3 | **P1** | new | **Empty / Error / Loading state machine 不在** — 9 page で truly-empty / filtered-empty / permission-empty の 3 sub-state 区別なし、Error escalation channel 不在、Loading duration prediction 不在。filter 適用後 0 件 / 権限不足 / 失敗 row のいずれも UI 検証不能 (happy path のみ)。 | observation-log D-01〜D-09 横串 | Card 6 empty-error-loading-states | 0 |
| F-4 | **P1** | adjacent-to-Day19 | **AuditTrail Timeline 5-layer + 7 outcome state structural gap** — Time axis Relative + UTC + retention 不可視、Outcome state column 不在 (event type に implicit、7 state {Proposed/Approved/Rejected/Executed/Failed/Reverted/Escalated} 明示分離なし)、5 facet filter 1/5 (業務 only)、Export (CSV/JSON/PDF) 不在。 | observation-log D-07 + snapshot | Card 3 action-history-timeline-audit-trail-ui | partial (Day 19 U-2 schema gate は別 angle) |
| F-5 | **P1** | new | **HIL actor band + icon prefix の visual hierarchy 不足** — Inbox / Dashboard / AuditTrail で agent / human / system 区別が text/色 のみ、icon prefix + color band の併用なし、scrolling 中の actor 判定速度低下。Day 19 U-4 EvidenceTimeline paraphrase は内容 paraphrase で、actor visual band 軸は touched せず。 | observation-log D-02 + D-01 + D-07 | Card 1 ai-native-hil-approval-ui | 0 |
| F-6 | **P1** | new | **Operator Cockpit 3 viewport pattern 不在** — Dashboard で aggregate KPI strip absent (top に独立 strip なし、業務 card 内分散)、per-workflow card 2 only (3-30 想定の scale 想定)、in-page drill-down 不在 (route 遷移)。Metrics は Tier 2 Manager dashboard で別 page、Dashboard が Tier 3 Operator console との role separation 明確でない。 | observation-log D-01 + D-08 | Card 7 operator-cockpit-multi-agent-oversight-ui | 0 |
| F-7 | **P2** | new | **Multi-step approval の SLA per step + Delegate model 不在** — CaseReview Lifecycle 5 step は visible だが per-step SLA (4h/24h target) 不可視、out-of-office delegate routing 不在、All approvers (具体 name) は anonymous step label に隠れている。経過時間 case-level のみ、step-level breakdown なし。 | observation-log D-02 + D-03 | Card 8 multi-step-approval-and-workflow | 0 |
| F-8 | **P2** | adjacent-to-Day19 | **RACI-A 5-role default closed (Demo Chapter 2 限定 visible)** — ProposalReview default で RACI 列 visible でない、`?demo=1` query で DetailDrawer expand 必要。1st-time user / 入力者 が 5-role surface に到達するのに query gate がある、disclosure surface 要件 partial。 | observation-log D-05 + D-05b | Card 9 raci-on-agent-action | partial (Day 19 U-6 DetailDrawer 移動は適用済、default closed は別 finding) |
| F-9 | **P2** | new | **Agent permission scope (read/write/approval) visible 不在** — AgentSettings の Tool list で各 tool の scope (read-only / write / approval-gated) 不可視、tool description 4-line のみ。least-privilege expression 弱、RBAC sub-check rbac-4 fail。 | observation-log D-06 | Card 9 + R7 deferred ledger rbac sub-check | 0 |
| F-10 | **Defer** | new | **Failure explainability 3 layer split surface** — CaseReview に What failed (注意 strip) + Why (OCR 信頼度未達) は visible、SendBackComment に Why (5 radio category) + What user can do (差戻し記録) visible、ただし 3 layer が 2 page 跨ぐ split surface design。AuditTrail の failed event row が mock data 0 件で failure UI 検証不能。Phase 1 で mock failed case 追加後に re-judge 推奨。 | observation-log D-03 + D-04 + D-07 | Card 10 agent-failure-explainability-ui | 0 |

---

## Findings Severity Distribution

- **P0** (Session 4 前 must-fix): 2 — F-1 Mobile layout / F-2 Diff preview craft
- **P1** (Session 4 前 should-fix): 4 — F-3 State machine / F-4 Audit Timeline / F-5 HIL actor band / F-6 Cockpit 3 viewport
- **P2** (Phase 1 candidate): 3 — F-7 SLA per step / F-8 RACI default closed / F-9 Permission scope
- **Defer** (Phase 1 mock 拡充後): 1 — F-10 Failure explainability

合計 10 件、cap 10-20 上限 OK。

## Adjacent-to-Day19 vs new ratio

- adjacent-to-Day19: 3 (F-2 / F-4 / F-8)
- new: 7 (F-1 / F-3 / F-5 / F-6 / F-7 / F-9 / F-10)

Day 19 が触れていない核心 surface (mobile / non-happy state / cockpit pattern / SLA / permission / failure flow) を全て new で carve out 完了。

## Commit Plan Draft (post-Day19 sequence)

Day 19 8 commit (Commit 0-5) の後ろに append:

```
feat(audit-d26): Commit 6 (P0) — mobile responsive baseline (Sidebar collapse 768px breakpoint + drawer pattern + main full-width)
feat(audit-d26): Commit 7 (P0) — Diff/Change Preview metadata strip primitive (Card 2 ★) on CaseReview + ProposalReview
feat(audit-d26): Commit 8 (P1) — empty/error/loading state machine (3 sub-state + Error escalation + Loading skeleton)
feat(audit-d26): Commit 9 (P1) — AuditTrail 7 outcome state column + 5 facet filter expansion + Export action (CSV first)
feat(audit-d26): Commit 10 (P1) — HIL actor band primitive (icon prefix + color band) on Inbox + Dashboard + AuditTrail
feat(audit-d26): Commit 11 (P1) — Dashboard 3-viewport Cockpit refactor (aggregate KPI strip + per-workflow grid + drill-down)
feat(audit-d26): Commit 12 (P2) — Multi-step SLA per step + Delegate visibility (CaseReview Lifecycle + Inbox)
feat(audit-d26): Commit 13 (P2) — RACI default open or query-less surface (ProposalReview)
feat(audit-d26): Commit 14 (P2) — Tool scope visible (AgentSettings、read/write/approval badge)
(Defer: F-10 Failure explainability、Phase 1 mock 拡充後に再判定)
```

**Commit 数**: 9 件 (P0 ×2 / P1 ×4 / P2 ×3、Defer 0 commit)、Day 19 後の sequence で並列実装可能 (一部 conflict なし)。

P4 報告着手可。
