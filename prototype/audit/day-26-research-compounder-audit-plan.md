| 項目 | 値 |
| --- | --- |
| 文書 ID | DOC-AUDIT-D26-RC-PLAN |
| 文書名 | Day 26 Research-Compounder × End-to-End UI/UX Audit Plan |
| 版数 | **v1.0 (G0 lock)** |
| ステータス | **Locked (G0 user approval 取得済、2026-05-26)** |
| オーナー | backoffice-ai-v2 maintainer |
| 承認者 | user (G0 sign-off 完了) |
| 閲覧対象 | Internal / 本 audit execution session |
| 機密区分 | Internal |
| 関連文書 | DOC-AUDIT-D19-UXC-REQ v1.4 (Day 19、co-exist 前提、applied 18 ledger source) / DOC-PROTO-CLAUDE / DOC-ROOT-CLAUDE / `research-compounder/templates/artifact-recipes/ai-native-ui-spec.md` (R7) / `research-compounder/templates/artifact-audit-template.md` |
| SSOT 区分 | Day 26 audit の scope / 5 review angle / 10 must-have cards / R7 deferred ledger / Day 19 重複禁止 scope / pre-flight + execution + sign-off gate (3 gate) / deliverable / out-of-scope (9 項) / 中止条件 (3 signal) の SSOT。Findings SSOT は execution 後の report doc (`day-26-research-compounder-audit-report.md`) に分離 |
| Evidence Status | plan-lock (本 doc は計画 v1.0 lock。empirical evidence は P1-P4 execution 後の applied-ledger + screenshots + pattern-matrix + report に蓄積) |
| 改版履歴 | v0.1 (2026-05-26): 初版 draft、25 cards / 12×9 matrix / 5 gate を提案、user G0 で reject。v0.2 (2026-05-26): 別 AI 批判 5 blocker (Day 19 baseline / 25 cards / R4 改名 / mechanical preflight / gate 圧縮) + Phase 1 verify (Day 19 applied 18/21) を反映、10 must-have cards + 3 gate + ~7-8h work に縮小。v1.0 (2026-05-26): user G0 approval lock、Implementation Pending 文言全削除、Day 19 ledger 表記正規化 (Day 18.5 ext 1 + Day 19 patch 17 + Defer 2 + Excluded 1 = 21)、R7 deferred ledger 追加、adjacent-to-Day19 tag 導入 |

---

# Day 26 Research-Compounder × End-to-End UI/UX Audit Plan v1.0

## 0. TL;DR

- **何**: Day 19 v1.4 (NN/g 8 軸 clarity audit、**applied 18/21 confirmed at HEAD `846afa4`**) と co-exist する **pattern / regulatory disclosure surface / temporal / layout 軸** の補完 audit。本 doc は **G0 lock 後の execution SSOT**。
- **何のため**: Day 19 が cover していない 5 angle (R0 SSOT 差分 / R1 Layout end-to-end / R2 R7 Pattern Conformance / R3 Workflow temporal / R4 Oversight surface / R5 Mechanical preflight) を埋め、Session 4 (2026-06-12 Fri) 前に prototype を **R7 recipe + Operational Premium Light SSOT 両方** に conform させる。
- **何をしない**: Day 19 applied 18 finding (Day 18.5 ext 1 + Day 19 patch 17) と **同一 finding / 同一 fix proposal** の重複指摘禁止 (同一 surface の別 angle R7 gap は `adjacent-to-Day19` tag で許可)。全面再設計禁止。9 routes 拡張禁止。装飾系 (gradient / glass / glow) 提案禁止。
- **承認**: G0 user 承認済。execution は P1 Preflight 着手可。
- **想定工期 (AI agent 基準)**: AI work ~ 7-8h / human review ~ 2-3h / external waiting 0 / 想定終了 = 2026-05-29 (Session 4 9 営業日前)

## 1. Background (なぜ今やるか)

### 1.1 既存 audit 資産 (verified at HEAD `846afa4`)

- **Day 18.5 patch** (適用済) — Disabled CTA + TopBar aria-hidden + Inbox FilterChip 整備、U-3 in-memory CaseReview 承認実装
- **Day 19 v1.4 audit** (`day-19-ux-clarity-*.md`) — 4-AI converged、21 unified findings、8 commit、Phase 1 verify で **applied 18 (Day 18.5 ext 1 + Day 19 patch 17) / Defer 2 (U-15 Dashboard lane Phase 1 / U-19 FilterToolbar Day 18.5 post-judgement) / Excluded 1 (U-21 docs/03 normal state) = 21** 確定
- **5 新規 primitive** (HypothesisChip / Disclosure / DetailDrawer / PageHelpDisclosure / NextActionStrip) は **全部実装済み**、9 page で usage 確認
- **Reverted 1 件**: commit 441e194 (audit doc + 3 minor label) のみ、core implementation は intact

### 1.2 Gap = 本 audit の存在理由

Day 19 が触れていない 4 角度を補完:

| Gap | 何が抜けている | 本 audit で埋める |
| --- | --- | --- |
| Pattern conformance | research-compounder R7 が指す 10 must-have canonical pattern (5-state HIL / 3-view diff preview / 5-layer audit timeline / citation boundary / confidence-uncertainty / empty-error-loading / 3-viewport cockpit / multi-step approval 4 element / RACI-A 5-role / agent failure explainability) への 9 page 適合度 | 10 card × applicable route only matrix (推定 50-60 cell) |
| Workflow / Trust temporal | Demo Chapter 1/2 を **flow として** failure explainability + multi-step approval 4 element に照らす | 5-stage flow gap + state coverage gap |
| Oversight / Disclosure / Auditability Surface | UI が EU AI Act Art.14 5 oversight + 3LoD + RACI-A + Citation 4-layer の **surface 露出** を満たしているか (compliance 判定はしない) | UI ↔ disclosure surface mapping、docs/ 側に還流 |
| Layout end-to-end (multi-viewport + state) | Day 19 は static frame、1440×900 のみ | **1440×900 + 390×844 + drawer/hover/disabled/expanded state** を含む multi-dimensional screenshot evidence |

### 1.3 Out of Scope (本 audit で **やらない**、9 項)

1. **Day 19 applied 18 finding と同一 finding / 同一 fix proposal** の重複指摘 (同一 surface の別 angle R7 gap は `adjacent-to-Day19` tag で許可)
2. **9 routes 拡張 / 10th route 追加** — `prototype/CLAUDE.md` §9 routes lock 絶対遵守
3. **Operational Premium Light token 変更** — slate-50 / white / indigo / emerald / amber / red、radius 8/6/4px、`docs/03` §2.7.3 SSOT
4. **装飾追加** — gradient mesh / glow / glassmorphism / 3D / illustration / large rounded (>8px) / cream-beige / dark mode は全禁止
5. **Mock data 構造変更** — UC-BO-01/02 active + 国際送金 boundary-only + Tier 3 規制語 exact 禁止 + KPI/SLO は `[仮説 / 要検証]` 必須
6. **同 session 内 commit (本番 src/)** — 本 audit は **plan → finding → fix commit plan draft までで停止**、実装 commit は user G2 sign-off 後の別 task
7. **Phase 1 設計書 (docs/) の編集** — 本 audit は prototype focus、regulatory finding が docs/ に還流する場合は cross-reference として report に記載するのみ
8. **Sub-agent / 並列 AI audit** — single Claude Opus 4.7 で converge、別 AI 投入は P4 後の別 task
9. **production-safe regulatory citation 取得** — R4 は surface review のみ、compliance 判定しない、citation 昇格は research-compounder side の別 task

## 2. Operational Goal Definition

「本 audit ready」を以下に翻訳:

✅ **Day 19 applied 18 finding ledger sealed** (P1 で `applied-ledger.md` に固定)
✅ **prototype 9 route × multi-viewport / multi-state screenshot evidence** baseline (~25 shot、v0.1 50 shot から半減)
✅ **R7 must-have 10 card × applicable route only matrix** で pass / partial / absent / N/A 判定 (~50-60 cell)
✅ **R7 deferred ledger** で落とした card の理由を per-card 明示 (`a11y` + `RBAC` は mechanical preflight sub-check に embed)
✅ **5 review angle 横断 unified findings** を P0 / P1 / P2 / Defer / Excluded に classify、Day 19 重複 `adjacent-to-Day19` tag で区別
✅ **Findings → fix commit plan draft** (Day 19 8 commit と co-exist、post-Day 19 sequence `feat(audit-d26):` prefix)
✅ **Mechanical preflight** (`npm run check:all` 単独 + `a11y-default` + `agent-permission-rbac` sub-check) を **本 audit の pass 条件** として明示

❌ Sub-agent / external AI による parallel audit (Day 19 で 4-AI 統合済、本 audit は single Opus 4.7 で converge)
❌ Production-safe regulatory citation の取得

## 3. 5 Review Angle (本 audit の中核 framework)

| # | Review | Day 19 重複 | Screenshot 依存 | 期待 finding |
| --- | --- | --- | --- | --- |
| **R0** | **SSOT 差分 + Day 19 Applied Ledger** (touchable range + applied 18 (Day 18.5 ext 1 + Day 19 patch 17) / defer 2 / excluded 1 を ledger 化) | 0% | 不要 | (input only) |
| **R1** | **Layout end-to-end** (1440×900 + 390×844 + 4 state、current HEAD baseline) | 10% | High | 3-6 |
| **R2** | **R7 Pattern Conformance** (10 must-have card × applicable route) | 20% | High | 5-10 |
| **R3** | **Workflow / Trust temporal** (Demo Chapter 1/2 flow + failure + multi-step) | 30% | Medium | 3-5 |
| **R4** | **Oversight / Disclosure / Auditability Surface Review** (UI 上の surface 露出のみ、compliance 判定なし) | 5% | Low | 2-4 |
| **R5** | **Mechanical Gate preflight** (P1 に前倒し、`a11y-default` + `agent-permission-rbac` sub-check embed) | — | Low | pass/fail (0-2 NG 想定) |

v0.1 で別建てだった Copy / 語彙 / Progressive Disclosure angle (旧 R5) は drop。Day 19 U-1/U-2/U-4/U-5/U-7/U-8/U-9/U-10/U-11/U-14/U-16/U-17/U-18 で copy/disclosure は十分 cover 済。

## 4. 採用 Cards (must-have 10 件)

backoffice-ai-v2 の banking BO HIL prototype に直結する core surface のみ:

| # | Card | 該当 page | 何を測る |
| --- | --- | --- | --- |
| 1 | [`ai-native-hil-approval-ui.md`](../../../research-compounder/knowledge/ui-design/ai-native-hil-approval-ui.md) | CaseReview / Inbox / AuditTrail | 5-state + actor band + audit log column separation |
| 2 | [`diff-and-change-preview-ui.md`](../../../research-compounder/knowledge/ui-design/diff-and-change-preview-ui.md) ★ | CaseReview / ProposalReview | 3-view diff (side-by-side / inline / field table) + metadata strip (author / reason / confidence / scope / reversibility) |
| 3 | [`action-history-timeline-audit-trail-ui.md`](../../../research-compounder/knowledge/ui-design/action-history-timeline-audit-trail-ui.md) | AuditTrail | 5-layer timeline (time axis / 5 mandatory column / drill-down / 5 facet filter / export) + 7 outcome state |
| 4 | [`citation-and-source-disclosure-ui.md`](../../../research-compounder/knowledge/ui-design/citation-and-source-disclosure-ui.md) | KnowledgeBrowser / CaseReview | citation boundary 表示 (citation 対象 / 対象外) |
| 5 | [`confidence-and-uncertainty-visualization-ui.md`](../../../research-compounder/knowledge/ui-design/confidence-and-uncertainty-visualization-ui.md) | CaseReview / ProposalReview / Metrics | confidence numeric + uncertainty band + threshold |
| 6 | [`empty-error-loading-states.md`](../../../research-compounder/knowledge/ui-design/empty-error-loading-states.md) | 9 page 横串 | truly-empty / filtered-empty / permission-empty / error 3 sub-state / loading duration prediction |
| 7 | [`operator-cockpit-multi-agent-oversight-ui.md`](../../../research-compounder/knowledge/ui-design/operator-cockpit-multi-agent-oversight-ui.md) | Dashboard | 3 viewport (aggregate KPI / per-agent card / drill-down) |
| 8 | [`multi-step-approval-and-workflow.md`](../../../research-compounder/knowledge/ux-design/multi-step-approval-and-workflow.md) | CaseReview / Inbox / Dashboard | 4 element (Step graph / Approver routing / Visibility / Escape hatches) + SLA per step + Delegate |
| 9 | [`raci-on-agent-action.md`](../../../research-compounder/knowledge/ai-agents-automation/raci-on-agent-action.md) | ProposalReview / AgentSettings | RACI-A 5-role surface (R/A/C/I/Agent-executor) — disclosure check only, not compliance |
| 10 | [`agent-failure-explainability-ui.md`](../../../research-compounder/knowledge/ux-design/agent-failure-explainability-ui.md) | CaseReview / AuditTrail | failure mode explainability layer |

★ Card 2 (Diff/Change Preview) は決定的 gap として priority highest。

## 5. Optional Backlog (defer or N/A、本 audit では使わない)

agent-action-confirmation-ui / kill-switch-and-emergency-control-ui / boring-reliable-ui-banking-healthcare / tool-call-visualization / data-table-premium-tier / trust-building-sequence / hil-error-recovery-flow / jp-multilingual-jp-en-cn-ui / progressive-disclosure-and-density / wow-audit-checklist-for-web-ui / web-ui-cliche-tells-negative-block

→ G2 review 後に user 判断で別 audit task 化、or Phase 1 scope に defer

## 6. R7 Required Cards Deferred Ledger

R7 recipe (`ai-native-ui-spec.md` §Required Cards Layer A-E) が required としている card のうち、本 audit must-have 10 件に含めなかったものの理由 (別 AI 批判 P1-3 対応):

| R7 required card | 本 audit 扱い | 理由 |
| --- | --- | --- |
| `a11y-default-for-enterprise-ai` | **R5 mechanical preflight に sub-check として embed** | Lighthouse a11y ≥ 90 + keyboard tab + focus ring を mechanical gate で gate 化、独立 finding 化はしない |
| `agent-permission-rbac-pattern` | **R5 mechanical preflight に sub-check として embed** | AgentSettings の権限 grant UI 対する surface review のみ、permission model 自体は v2 prototype scope-out (実 LLM 接続なし) |
| `onboarding-for-enterprise-ai` | **defer** | v2 prototype は単一 persona (入力者) demo focus、onboarding flow は Phase 1 scope |
| `generative-ui-with-llm-outputs` | **defer** | v2 prototype は mock data ベース、generative UI は scope-out |
| `enterprise-saas-information-architecture` | **defer** | 9 routes IA は Day 19 + Day 18.5 で固定済み、新規 IA gap は Day 19 で既に拾われている |
| `executive-dashboard-layout-pattern` | **must-have 7 に統合** | `operator-cockpit-multi-agent-oversight-ui` の 3 viewport で代替 |
| `bento-grid-and-visual-heterogeneity` | **N/A** | banking BO は wow 抑制方向、bento heterogeneity 適用外 |
| `multilingual-jp-en-cn-ui` | **defer (Day 19 大幅 cover)** | JP-only conformance は Day 19 U-9 / U-11 で cover、本 audit からは drop |
| `ai-native-web-architecture` / `rag-architecture-and-pitfalls` / `api-design-rest-vs-grpc-vs-event` | **N/A (Layer D — system architecture)** | docs/ 側で扱う、prototype UI audit からは out |
| `mcp-security-model` | **N/A (Layer E — security/consent)** | v2 scope-out (実接続なし) |

## 7. Execution Phase (5 phase、3 gate)

| Phase | Output | Gate |
| --- | --- | --- |
| **P0 Plan Lock** | 本 doc v1.0 lock | **G0 ✅ user 承認済 (2026-05-26)** |
| **P1 Preflight + SSOT** | (a) Day 19 applied ledger (Phase 1 verify 結果) を `day-26/applied-ledger.md` に sealed、(b) `npm run check:all` を current HEAD で実行 (`check:all` は package.json で `lint` + `check:no-op` + `build` を bundle 済、別途実行不要)、(c) Card 10 件 claim を `day-26/cards-claims.md` に verbatim 抽出、(d) `a11y-default` + `agent-permission-rbac` sub-check rubric を mechanical gate に embed | mechanical gate fail → **stop**、pass → P2 |
| **P2 Screenshot Inventory** | 9 page × 1440×900 + 4 critical page × 390×844 + 5-7 state shot = **~25 shot**、`day-26/observation-log.md` に per-page 観察 + console error 0 check | console error 0 + viewport 整合 + agent ID resolution 済 |
| **P3 Pattern Matrix + Synthesis** | (a) 10 card × applicable route only matrix (`day-26/pattern-matrix.md`、~50-60 cell pass/partial/absent/N/A、各 cell 1 line rationale + evidence pointer)、(b) R1 + R3 + R4 finding を `day-26/unified-findings.md` に統合 | **G1 Evidence Sanity** — verdict 分布 bias check (全 absent or 全 pass なら rubric 見直し)、Day 19 applied 18 finding overlap 検査 (同一 finding / 同一 fix proposal は Excluded、別 angle R7 gap は `adjacent-to-Day19` tag) |
| **P4 Report** | `day-26-research-compounder-audit-report.md` (artifact-audit-template 準拠、Top Findings P0/P1/P2/Defer/Excluded、commit plan draft `feat(audit-d26):` prefix post-Day19 sequence) | **G2 Findings Lock** — finding 数 10-20 cap、Day 19 同一重複 0、commit plan は post-Day19 で sequence |

## 8. 中止条件 (3 signal)

- P3 cell verdict が **absent 60+ %** → 全面再設計議論に切替
- P1 mechanical gate (`npm run check:all` 単独) **NG** → 補完 audit 以前に基礎修復必要
- Session 4 timeline が **5 日以内に切迫** → **Day 22 rehearsal / final demo review 優先** (Day 20 demo script + Day 21 verification gate は `docs/_PROGRESS.md` 上 done、優先先は rehearsal phase に shift)

## 9. Timeline (AI agent 基準、6/12 Session 4 まで 17 日)

| Phase | AI work | Human review | External wait | 累計 day | 完了想定日 |
| --- | --- | --- | --- | --- | --- |
| P0 Plan Lock | (done) | done | 0 | 0 | 2026-05-26 ✅ |
| P1 Preflight + SSOT | ~1h | ~20min | 0 | 0.5 | 2026-05-26 |
| P2 Screenshot Inventory | ~1.5h | ~15min | 0 | 1.0 | 2026-05-27 |
| P3 Pattern Matrix + Synthesis | ~2h | ~30min | 0 | 1.5 | 2026-05-27 |
| P4 Report + G2 | ~2h | ~1h | 0 | 2.5 | 2026-05-28 |
| Hand-off (G2 後の merge plan) | ~30min | ~30min | 0 | 3.0 | 2026-05-29 |

**合計**: AI work ~7-8h / Human review ~2-3h / External wait 0 / 想定終了 = 2026-05-29 (Session 4 9 営業日前)

## 10. Deliverable

```
prototype/audit/
├── day-26-research-compounder-audit-plan.md          # 本 doc v1.0 (P0、locked)
├── day-26-research-compounder-audit-report.md        # P4 最終 SSOT
└── day-26/
    ├── applied-ledger.md                             # P1 (Phase 1 verify sealed)
    ├── cards-claims.md                               # P1 (10 card claim verbatim)
    ├── screenshots/                                  # P2 (~25 shot)
    │   ├── desktop-1440x900/01-09 (9 page)
    │   ├── mobile-390x844/01-04 (Dashboard / Inbox / CaseReview / ProposalReview)
    │   └── states/05-07 (drawer / hover / expanded / disabled)
    ├── observation-log.md                            # P2 (per-page + console + viewport)
    ├── pattern-matrix.md                             # P3 (10 × applicable route)
    └── unified-findings.md                           # P3 (R1+R3+R4 統合)
```

## 11. Reference

- Day 19 v1.4 final SSOT: `prototype/audit/day-19-ux-clarity-requirements.md`
- Day 19 integrated plan: `prototype/audit/day-19-ux-clarity-integrated-plan.md`
- R7 recipe: `~/code/active/research-compounder/templates/artifact-recipes/ai-native-ui-spec.md`
- Artifact audit template: `~/code/active/research-compounder/templates/artifact-audit-template.md`
- Operating contract (Evidence Strength rule): `~/code/active/research-compounder/operating-contract.md`
- Prototype CLAUDE.md (local SSOT): `prototype/CLAUDE.md`
- Project CLAUDE.md (parent SSOT): `../CLAUDE.md`

---

# G0 Sign-off (Locked 2026-05-26)

User approval received. v0.2 → v1.0 lock transition complete:
- v0.1 `Implementation Pending` 文言全削除 ✅
- Day 19 ledger 表記正規化 (applied 18/21 = Day 18.5 ext 1 + Day 19 patch 17) ✅
- R7 deferred ledger 追加 (a11y + RBAC は R5 mechanical sub-check に embed) ✅
- adjacent-to-Day19 tag 導入 (Day 19 重複禁止 scope を「同一 finding / 同一 fix proposal」に絞り) ✅
- Mechanical preflight 前倒し (P1)、3 gate に圧縮 ✅
- 中止条件 timeline 優先先 update (Day 22 rehearsal / final demo review) ✅

P1 Preflight 着手可。
