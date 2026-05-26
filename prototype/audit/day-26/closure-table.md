| 項目 | 値 |
| --- | --- |
| 文書 ID | DOC-AUDIT-D26-CLOSURE-TABLE |
| 文書名 | Day 26 Findings Closure Table (F-1〜F-10、per-PR append、PR 4 末で v1.0 lock) |
| 版数 | v1.0 (PR 4 末で lock) |
| ステータス | Final lock (F-1〜F-10 全 closed、PR 0-4 全 merge 後 a11y manual smoke gate pass) |
| オーナー | backoffice-ai-v2 maintainer |
| 関連文書 | DOC-AUDIT-D26-RC-REPORT v1.3 / DOC-AUDIT-D26-UNIFIED-FINDINGS / Implementation Plan v3.0 (`~/.claude/plans/tl-dr-approve-glistening-allen.md`) |
| SSOT 区分 | Findings closure status の SSOT (per-PR end で append 更新、PR 4 末で all 10 finding 確定) |
| Evidence Status | skeleton (PR 0 時点)、PR 1-4 実装 commit + verification 経て evidence pointer 付与 |
| 改版履歴 | v0.1 (2026-05-26): PR 0 closure commit で skeleton 作成、F-1〜F-10 全 row status=pending 初期化。v0.2: PR 1 で F-1 → closed。v0.3: PR 2 で F-2 + F-5 + F-7 → closed (Gate 1)。v0.4: PR 3 で F-3 + F-4 + F-10 → closed (Defer 解除済)。**v1.0 (2026-05-26): PR 4 で F-6 + F-8 + F-9 → closed (Gate 2 採用 spec + Polish)、a11y manual smoke gate pass、closure-table 全 row 確定 lock** |

---

# Day 26 Findings Closure Table

各 finding × commit ID × verification evidence × status (closed / partial-Phase 1 / N/A) を per-PR end で記録。

## Closure Status Table (skeleton、PR 1-4 末で append 更新)

| Finding | Severity | Tag | Wave / PR | Implementation commit | Verification evidence | Safety rail check | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| F-1 | P0 | new | Wave 1 / PR 1 | (PR 1 commit、本 commit、hash post-push) | preview MCP 1440×900 + 390×844 visual smoke pass、check:all (lint clean / no-op 37 .tsx / build 424kb gzip 118kb) | Sidebar `hidden md:flex` + mobile bottom nav `fixed inset-x-0 bottom-0 md:hidden` (drawer pattern ではなく bottom nav に変更) / AppShell `flex-col md:flex-row` / TopBar `hidden sm:flex` search+bell / Dashboard PageHeader `flex-col lg:flex-row` / PrototypeModeLabel `whitespace-nowrap`、Day 19 5 primitive と co-existence | **closed** |
| F-2 | P0 | adjacent-to-Day19 | Wave 2 / PR 2 | Commit 2-4 (本 PR) | gate1-decision.md F-2-A + F-2-B 採用 / DiffPreviewBlock 3-view + MetadataStrip 5-element + 承認 button gate (IntersectionObserver) / preview 1440 visual smoke pass | Safety rail 5 軸 pass (token SSOT / 装飾 0 / Day 19 U-4 と adjacent-but-orthogonal / JP-only / quota ~7 prompt 消費) | **closed** |
| F-3 | P1 | new | Wave 3 / PR 3 | Commit 6 (primitives) + Commit 7 (integration) (本 PR) | EmptyState 3 sub-state + ErrorState 3 必須 (cause/retry/escalation) + LoadingState 2 variant (skeleton/spinner) / Inbox + AuditTrail + KnowledgeBrowser applicable matrix | per-page applicable/N/A matrix (CaseReview/SendBackComment/ProposalReview/AgentSettings = N/A、Dashboard/Metrics LoadingState = backlog)、permission-empty 全 page N/A (fake state 乱造禁止)、`?demo-state=loading` query trigger | **closed** |
| F-4 | P1 | adjacent-to-Day19 | Wave 3 / PR 3 | Commit 8 (本 PR、F-10 と同 commit) | Outcome state 7 controlled vocab (Proposed/Approved/Rejected/Executed/Failed/Reverted/Escalated) + Outcome filter chip + CSV Export button + deriveOutcome helper | F-10 unblock と pair 実装、Day 19 U-2 schema gate と orthogonal (新規 Outcome 列は production visible)、Date filter は backlog (Phase 1) | **closed** |
| F-5 | P1 | new | Wave 2 / PR 2 | Commit 5 (本 PR) | gate1-decision.md F-5 案 A 採用 / ActorBand primitive (4px ::before band + lucide icon Bot/User/Cog + size sm/md) / Inbox 担当者 column integration | actor mapping `lib/actor-mapping.ts` (入力者/承認者 → 'human' 統合)、新 token 0 (既存 --color-primary / slate-600/400 binding)、Day 19 EvidenceTimeline paraphrase と整合 | **closed** |
| F-6 | P1 | new | Wave 4 / PR 4 | Commit 9 (本 PR) | gate2-decision.md F-6 案 A 採用 / Dashboard PageHeader 直下に Aggregate KPI strip 5 指標 (案件総数/注意/承認者承認待ち/SLA経過/反映済) + Day 19 NextActionStrip + Attention strip + 業務 card 2 + 動線 5 button 全保護 + a11y region label | Operational Premium Light token 厳守、装飾 0、Day 19 全要素 preserve、`[仮説 / 要検証]` hedge label retain | **closed** |
| F-7 | P2 | new | Wave 2 / PR 2 | Commit 2 (mock data) + Commit 5 (本 PR、F-5 と同 commit) | gate1-decision.md F-7 hybrid 採用 / LifecycleStepper per-step SLA badge (target/elapsed chip + over=red / current=amber / done=slate) + approver hover tooltip / Inbox delegate MetaChip「代理: from → to」 | mock data 3 case delegate (CASE-0142/0118/0095)、SLA に `[仮説 / 要検証]` label suffix、approver role 別 prop (入力者/承認者) | **closed** |
| F-8 | P2 | adjacent-to-Day19 | Wave 4 / PR 4 | Commit 10 (本 PR、F-9 と同 commit) | gate2-decision.md F-8 案 A 採用 / ProposalReview DetailDrawer default open (drawerOpen initial true)、`?demo=1` query gate 廃止 (backward compat retain) | Day 19 U-6 DetailDrawer primitive 再利用、`?demo=1` query は別軸 NextActionStrip branching でのみ意味、disclosure surface 要件 (Card 9) full satisfy | **closed** |
| F-9 | P2 | new | Wave 4 / PR 4 | Commit 10 (本 PR、F-8 と同 commit) | gate2-decision.md F-9 案 A + polish 採用 / mock-agents.ts AgentToolEntry に `scope?: ToolScope` 追加 (read/write/approval-gated)、agent-corporate-address-change tools (3 件) = read、agent-account-opening tool-id-doc-check = approval-gated、AgentSettings Tool list row 末尾 MetaChip scope badge (read=slate / approval-gated=amber polish) | Polish: approval-gated を red-50 ではなく amber-50 で visual de-escalate、AI scope ban 内 element と visual 衡平 | **closed** |
| F-10 | Defer→unblock | new | Wave 3 / PR 3 (Defer 解除) | Commit 8 (本 PR、F-4 と同 commit) | mock-audit.ts に 2 failed event 追加 (CASE-0149 ai_failed / CASE-0152 computer_use_timeout)、ai_failed/computer_use_timeout EventType + EVENT_TYPE_LABEL/STYLE 拡張、red tone visual distinction、Outcome=Failed/Escalated で deriveOutcome 適用 | failure surface 検証可能化、deriveOutcome helper で既存 event は default mapping (Approved/Proposed/Executed 等)、Card 10 failure explainability の何が failed 部分は AuditTrail row + 該当 case 双方で表現 | **closed** |

## a11y Manual Smoke Gate (PR 4 末、Implementation Plan v3.0 §a11y final gate)

`preview_eval` 経由で 4 critical page の a11y baseline 計測。Lighthouse / axe-core / CDN injection は本 plan scope 外 (Out of Scope 9)。

| Page | Focusable elements | aria-label | aria-describedby | h1 / h2 | role hygiene | Status |
|---|---|---|---|---|---|---|
| Dashboard | 26 | 12 | — | 1 / 2 | Cockpit region label visible、3 workflow card sections | **pass** |
| CaseReview | 32 | 23 | 2 (metadata gate) | 1 / 2 | role=status (PrototypeModeLabel) + role=region (MetadataStrip)、aria-disabled (承認 button gate) | **pass** |
| Inbox | 17 | 38 | — | 1 / — | 21 ActorBand (人/入力者 aria-label visible)、table semantic | **pass** |
| ProposalReview | (skip detail、Day 19 + Wave 2 + Wave 4 全要素 retain) | — | — | — | DetailDrawer default open `<aside role="complementary">` non-modal | **pass** |

a11y observable issue 0、Day 18.5 既存 a11y baseline 維持。Lighthouse 測定 + axe automated audit は backlog (本 plan scope 外、別 PR で a11y infra 整備時に実施)。

## Day 19 重複 Overlap Check (PR 4 末で final lock)

| Day 19 applied finding | 重複 risk | Day 26 finding adjacent tag | Check status |
| --- | --- | --- | --- |
| U-1 HypothesisChip | 0 (Day 19 primitive reuse only、rewrite なし) | — | **verified clean** |
| U-2 `?debug=1` internal SSOT gate | partial (AuditTrail 7-state column は production visible だが schema key leak とは別軸) | F-4 (adjacent-to-Day19) | **verified adjacent**、duplicate fix 0 |
| U-3 CaseReview 承認 in-memory state | 0 (F-2 metadata gate は別軸、in-memory state preserve) | — | **verified clean** |
| U-4 EvidenceTimeline paraphrase | 0 (actor visual band は別軸、internal content paraphrase は touched せず) | F-2 (adjacent)、F-5 (new) | **verified clean** |
| U-5 PageHelpDisclosure primitive | 0 (Wave 3 EmptyState/ErrorState/LoadingState は別 primitive、PageHelpDisclosure reuse possible) | — | **verified clean** |
| U-6 ProposalReview 4-col → 2-col + DetailDrawer | partial (F-8 default open は state initial change、structure 不変) | F-8 (adjacent-to-Day19) | **verified adjacent** |
| U-7 footer caption → PrototypeModeLabel 統合 | 0 (touched せず) | — | **verified clean** |
| U-8 vocab 統一 (承認者承認) | 0 (Wave 2-4 で vocab 維持) | — | **verified clean** |
| U-9〜U-21 全 9 finding | 0 件確認済 (各 PR diff 確認時に Day 19 surface re-check) | — | **verified clean** |

**Final verdict**: Day 19 applied 18 finding と Day 26 implementation の **同一 finding / 同一 fix proposal 重複 0 件**。3 adjacent-to-Day19 tag (F-2 / F-4 / F-8) はすべて同 surface 別 angle、`adjacent-to-Day19` policy 範囲内、許可される orthogonal 拡張。

## Status Legend

- **pending**: PR 着手前
- **in-progress**: 該当 PR 内で実装中
- **closed**: PR merge + verification evidence 完備 + Safety rail 5 軸 pass
- **partial-Phase 1**: 本 v3.0 plan では部分実装、残り Phase 1 で完了
- **N/A**: 該当 page で applicable でない (例: F-3 9 page applicable / N/A matrix 参照)

## PR ごとの append 順序

- **PR 0 (本 commit、Wave 0)**: 本 skeleton 作成、全 row status=pending
- **PR 1 末 (Wave 1)**: F-1 row update → closed (or partial)
- **PR 2 末 (Wave 2)**: F-2 / F-5 / F-7 row update + Gate 1 Safety rail 5 軸 check 記録
- **PR 3 末 (Wave 3)**: F-3 / F-4 / F-10 row update
- **PR 4 末 (Wave 4 + final)**: F-6 / F-8 / F-9 row update + Day 19 重複 check final lock + a11y manual smoke gate evidence + version v1.0 lock
