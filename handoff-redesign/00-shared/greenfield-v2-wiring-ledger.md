# greenfield v2 配線 ledger + parity matrix

> branch `redesign/greenfield-v2` @ 起点 `59fcd8e`。v2 (`src/v2/`) を store 配線 → v1 機能 parity → 本番 route 昇格。
> **不可侵**: v2 light operator console の視覚方向は locked。data 源 (static mock→store hook) と handler (no-op→実 dispatch) のみ差替、presentation 不変。
> baseline: 272 test / 31 file green、check:no-op は v2 除外で 81 .tsx pass。

## 決定事項

- **overlay 再利用**: v2 screen は shared overlay primitive (`Toast`/`useToast`/`ReasonDialog`/`FieldActionModal`/`Modal`) を再利用する (CaseDetailV2 が `Toast` を既に再利用済の precedent)。新規 v2 modal は作らない (presentation 発明回避)。modal は v1 `--color-*` token で表示されるが Toast 再利用と同一規律。
- **banner token map**: v1 `--color-X-soft*` → v2 `--v2-X-soft*`。v1 `--color-primary-soft` (reversal banner) → **`--v2-accent-soft`** (v2 の primary = accent、v2.css に `--v2-primary-soft` なし)。banner icon は `--v2-X-soft-fg` (既存 v2 慣習)。
- **nav link**: 配線 phase 中は v2 内 link は `/v2/*`。route-swap で `/v2/*`→本番 path に一括変更。
- **process filter**: v2 chrome に ProcessSelector 無。useCases 等は filter 省略で全件。process-filter は 15 capability に含まれずゆえ parity 必須外 (honest deviation、report に明記)。

## parity matrix (15 capability、v1 action → v2 配線)

| # | capability | v1 action | 配線先 v2 | 状態 |
|---|---|---|---|---|
| 1 | 案件承認 (入力者) | case/approve by:input | CaseDetailV2 | 既配線 (parity中) |
| 2 | 案件承認 (承認者/最終) | case/approve by:checker | CaseDetailV2 / ApprovalsV2 | pending |
| 3 | 案件差戻し | case/sendback | CaseDetailV2 (modal) | parity中 |
| 4 | 項目確定/上書き | case/override | CaseDetailV2 (modal) | parity中 |
| 5 | エスカレーション起票 | case/escalate | CaseDetailV2 (field modal) | pending |
| 6 | escalation 裁定 | case/resolveEscalation | CaseDetailV2 | pending |
| 7 | 反映済 訂正/取消 | case/reverse | CaseDetailV2 | pending |
| 8 | 再処理 | case/reprocess | CaseDetailV2 | pending |
| 9 | 手動起票 | case/create | CaseDraftV2 | pending |
| 10 | 一括承認 | case/bulkApprove | ApprovalsV2/CasesV2 (v1で確認) | pending |
| 11 | 提案 送付/承認/却下/差戻し | proposal/forward·approve·reject·sendback | ProposalDetailV2 | pending |
| 12 | 手順承認 (forwarded 承認) | proposal/approve | BusinessApproverHubV2/ProposalDetailV2 | pending |
| 13 | Agent 昇格申請/設定承認/差戻し | agent/requestPromotion·approvePromotion·sendbackPromotion | AgentDetailV2 / ConfigApprovalsV2 | pending |
| 14 | Agent 緊急停止/再開 | agent/emergencyStop·resume | AgentDetailV2 | pending |
| 15 | 通知既読 | notification/markRead·markAllRead | NotificationsV2 | pending |

## screen 配線進捗

| screen | prod route | 状態 | note |
|---|---|---|---|
| CaseDetailV2 | /cases/:id | ✅ | banner×5 + footer 5-way + field/case FieldActionModal + reverse/arbitrate ReasonDialog。typecheck green。cap 1-8 配線 |
| V2Shell (chrome) | (shell) | ⏳ | 起票/persona/search/bell/sidebar-count |
| HubV2 | / | ⏳ | useHubModel |
| CasesV2 | /cases | ✅ | useCases() 全件 + recommended mock補完 + 起票→Link。bulk(by:input) deferred |
| ApprovalsV2 | /approvals | ✅ | useApprovals() data-swap。bulk/banner/filter/HIL = batched deviation |
| ProposalsV2 | /proposals | ✅ | useProposals() + mock join + :id rowHref |
| ProposalDetailV2 | /proposals/:id | ✅ | useProposal + forward/approve/reject/sendback + mode footer + 2 ReasonDialog + :id |
| AgentsV2 | /agents | ✅ | useAgents() + mock join + live trust + :id rowHref |
| AgentDetailV2 | /agents/:id | ✅ | useAgent + requestPromotion/approve/sendback/emergencyStop/resume + kill-switch header + mode footer + 2 Modal + 2 ReasonDialog + :id |
| ObservatoryV2 | /observatory | ✅ | useCrossLedger (case 絞り) + 抜き取り→toast。Flywheel stage 図 static 維持 |
| SearchV2 | /search | ✅ | useSearchResults + controlled query + ?q= sync。台帳 group drop (store kind 無) |
| NotificationsV2 | /inbox | ✅ | useNotifications + markRead (行 click)。markAllRead/未読 toggle deferred |
| BusinessApproverHubV2 | /business-approver | ✅ | useBusinessApproverInbox (2 受け口) + per-item drill + SoD note。手順承認カード非追加 |
| ConfigApprovalsV2 | /config-approvals | ✅ | usePendingPromotions + rowHref→AgentDetail (action は detail owner mode) |
| EscalationsV2 | /escalations | ✅ | useEscalations() + to 名前解決。read-only hint deferred |
| HubV2 | / | ✅ | useHubModel (headline/primaryAction/processes 動的) + honest drill |
| CaseDraftV2 | /cases/new | ✅ | useCases 採番 + case/create + 全必須 validation |
| V2Shell (chrome) | (shell) | ✅ | live count + 起票→nav + controlled search + bell unread + persona select overlay |

**配線 batch 完了** (2026-06-03): 全 16 unit ✅。`check:all` green (lint/check:no-op[99 .tsx, v2 含む]/types/types:test/design/test 272/build)。v1 不変、/v2 prefix 保持 (route-swap 未実施)。

## verify (配線 batch、route-swap 前)

- **check:all** green (上記)。**axe-core (Playwright, build+preview)**: 全 16 /v2 route で serious/critical = 0、page error 0 (`v2-axe-sweep.mjs`)。
- **screenshot 目視** (`/tmp/v2-shots/`): 全 16 route 確認、light operator console 視覚不変 + store data 反映 (live count / status / KPI / 通知 / escalation / 監査台帳)。
- **Codex review #1** (read-only): 1 blocking + 3 high 修正済、3 high は v1-parity/sanctioned で accept。
  - 修正: CaseDraftV2 assignee 既定 (通知 routing 断絶解消) / AgentsV2 昇格列 promotionStatus+paused 反映 / BusinessApproverHub 起票=escalation.from / V2Shell search placeholder 台帳 除去。
  - accept (v1 一致/sanctioned): AgentDetail「昇格を反映」copy (reducer は trust 不変、v1 同一) / Hub daily summary static (store source 無・v1 同一) / modal 内 `--color-*` (shared Modal shell に整合、screen body は --v2 clean)。
  - 修正後 re-verify: check:all green + axe 0/16 維持。

## UX/compliance parity 追加 (user 指示: UX最大 + コンプラ充足 + 工数無制限、2026-06-03)
- DataTable に selection (checkbox 列) 追加 → ApprovalsV2 一括最終承認 (case/bulkApprove checker、SoD skip) + SoD permission banner / CasesV2 一括入力者確認 (by:input、eligible のみ)。
- NotificationsV2: 未読のみ toggle + すべて既読 (markAllRead)。EscalationsV2: 非業務責任者の閲覧のみ警告。BusinessApproverHubV2: 手順承認カード追加 (3 受け口、forwardedProposals)。
- AgentsV2 昇格列: promotionStatus/paused 反映。V2Shell a11y: skip-link/main → #main-content + nav aria-label。
- 機能 parity proof: Playwright **14/14 flow pass** (parity.mjs 9 + parity2.mjs 5 = 承認/一括承認SoD/SoD banner/forward/promotion req+approve/create/markAllRead/escalate/escalation queue/reverse/emergencyStop/resume)。axe 0/16 維持。check:all green 維持。

## route-swap 実行 (2026-06-03)
- App.tsx: V2Shell + v2 15 画面を**本番 route** (`/`・`/cases`… `/v2` prefix 除去) に昇格。v1 AppShell + v1 route 撤去。
- v2 内部 link の `/v2` prefix を全 strip (14 file)。v1 pages (`src/pages/*` 15) 削除。
- **test 移行 + 旧 v1 component (shell/cross-cutting) cleanup + check:all green 収束 = Codex 委譲 (実装、strict coverage 保持 spec) — 進行中**。
- CLAUDE.md route SSOT 更新済。IA doc (ia-overview/screen-contracts/coverage-matrix) banner 更新。

## 完了状態 — **historical snapshot (route-swap 時点 2026-06-03)。現行 status は下記「残 (deferred)」section が SSOT**

> ⚠ 本 section の数値は route-swap 完了時点の snapshot。その後 #23 merge (281/14/295) → postv4 cleanup で **test 278 pass + 8 skip = 286 / main 置換 DONE (PR #24, fd35150)** に更新済。下記 deferred section が現行 SSOT。

- **配線 + parity + route-swap + operator-UX port 完了**。`check:all` green (snapshot: test 250 pass + 25 skip = 275、現行は 278/8/286)。
- **axe-core (Playwright, build+preview)**: 全 16 **本番 route** で serious/critical = 0 (`prod-axe-sweep.mjs`)。
- **機能 parity (Playwright 14/14)**: 承認/一括承認(SoD)/SoD banner/forward/promotion req+approve/create/markAllRead/escalate/escalation queue/reverse/emergencyStop/resume。
- **Codex #1 (配線後)**: 1 blocking + 3 high 修正済。**Codex #2 (pre-merge)**: 0 blocking、1 high (CaseDraftV2 focus-to-first-invalid a11y) 修正済 + v2 test 追加。全 8 capability が passing test に map (Codex 確認)。skip 25 件は v2 design 差として正当 (silent drop 無し、product code 非弱体化を Codex 確認)。
- route-swap: v2 15 画面 = 本番 route (`/`…)、v1 pages 削除、`/v2` prefix 全除去。CLAUDE.md route SSOT + IA doc banner 更新。
- **#23 merge reconciliation (2026-06-03)**: PR 作成後に origin/main が PR #23 (post-v3 data: 自動化業務 2→5、UC-BO-03/04/05) を先取り。`git merge origin/main` で v1 4 page の modify/delete conflict は **削除側を採用**。v2 への影響は **data 増分のみ** (route/視覚不変): HubV2 `PROC_ICON` を transfer/stamp/card へ拡張 (RepeatIcon/StampIcon/CreditCardIcon、#23 v1 Hub と同 icon)。ObservatoryV2 メトリクスは OBS_METRICS (5 業務) を render、未達 2 件 (法人住所変更/改印・代表者変更届=agent-corp-notification) のみ drill link → observatory-drill.test の 5-業務期待に適合。再 verify: **check:all green (test 281 pass + 14 skip = 295)** / prod-axe 16 route 0 s/c / Observatory 5 tab 0 s/c。

### 残 (deferred、follow-up) — **全 close 済 (postv4、2026-06-03)**
1. ~~**Observatory depth + model governance**~~ → **DONE (route-swap で port 済)**。ObservatoryV2 = 5-tab cockpit (監査/メトリクス/ナレッジ/モデルガバナンス [SR11-7 model台帳/drift]/証跡台帳)、observatory-drill 9 test un-skip+pass、5 tab とも axe 0。当初「最大の残」は解消済 (この deferred 記載が stale だった)。
2. ~~**dead-code 0**~~ → **active src は DONE (postv4)**。純データ型 `MetricRow`・`ConsequenceImpact` を `data/types.ts` へ移設 → 4 mock importer を `./types` へ再 point → cross-cutting (ReconcilePanel/ConsequencePanel/MetricVsThreshold) + case (DocumentViewer/LifecycleStepper) 5 file 削除。before-after.test 撤去、keyboard-a11y は ProcessSelector block のみ残置。tsc/build/test green。CSS は v1 `--color-*` 死蔵 class が消え ~2.3kB 減 (v2 presentation 不変)。
   - **残: `src/legacy/` graveyard** (別 slice)。`legacy/pages/{CaseReview,SendBackComment}` 等は v1 component への dangling import を多数 (CaseReview は 17 `@/` import の大半が削除済) 抱える完全な dead quarantine で、tsconfig.app/test が `src/legacy` を exclude するため全 gate 影響無。LifecycleStepper 削除で dangling が +1 したが piecemeal fix はせず (一貫性が無い)、legacy/ は将来 wholesale purge する。
   - **残: v2 keyboard a11y** (別 batch)。CaseDetailV2 の文書行・要確認 card row-select が `<div onClick>` で mouse-only (v1 の keyboard 選択経路は v2 で消失)。field 実 action「対応」は native button で keyboard 可ゆえ実害限定的だが、row-select の keyboard 化 (role=button + tabIndex + onKeyDown) は a11y 残課題。
3. ~~manual-entry v1-form skip / loading-error seam~~ → **整理済 (postv4)**。manual-entry: v1 skip block 撤去 + v2 form の create→navigate→手動起票 detail 統合 test 追加 (honesty F-006/F-051 は manual-honesty.test が data 層で担保)。w3 緊急停止→一覧反映: persist→remount 経路で v2 DOM 用に re-enable (skip 解除)。loading-error: v2 同期設計で loading/error 状態が発生しない旨を明記した恒久 skip 維持 (偽 seam を作らない)。skip 14→8 (loading-error のみ)。
4. ~~v2-parity*.mjs 等 temp script~~ → **削除済 (postv4)**。/v2 prefix 時代の historical script (v2-parity*/v2-axe-sweep/capture/compare/shot) + 本番 route 版 (prod-axe-sweep/obs-verify) を含む全 untracked 検証 script を削除 (再検証時は再生成)。
- **main 置換 = DONE**。PR #24 で merge 済 (`fd35150`)。本 cleanup は postv4 follow-up (branch `postv4/dead-code-test-cleanup` → PR)。

## feature-richness port (user 指示 2026-06-03: 全 bank stakeholder の end-to-end UX 最大化 + compliance、判断委任)

route-swap で判明した v2 簡素化 gap を stakeholder 価値 + 規制で優先 port:
1. **Model governance** (compliance/model-risk stakeholder、SR11-7): AgentDetailV2 F-039 panel + ObservatoryV2 モデルガバナンス。← port
2. **ProcessSelector** (operator、Process-First triage): V2Shell chrome + 全 list を useView().process filter。← port
3. **Observatory depth** (oversight/risk): metrics + 監査台帳 filter/free-text/pagination/drill-link。← port
4. **Column sort + relative elapsed** (operator triage): v2 DataTable sort + CasesV2 caseElapsedLabel。← port
5. **loading/error ?demo seam**: v2 は in-memory 同期で状態発生せず → **skip** (偽 UI を作らない、honest)。
→ port した feature の test は v2 で pass 化、skip した seam は honest skip+注記。各 port 後 screenshot + test 収束。

## route-swap 前 user 判断待ち (解決済 — 上記 UX/compliance parity で対応)
- bulkApprove (一括承認/一括確認): v2 に selection UI 無、単一承認は配線済。→ user 判断 (build minimal / drop)。
- visual-only deferral (markAllRead/未読 toggle / Approvals HIL-expand・filter / Escalations 閲覧 hint / BizHub 手順承認カード): capability 非該当。→ user 判断 (defer / port)。
| CaseDraftV2 | /cases/new | ⏳ | case/create |

凡例: ⏳ pending / 🔧 進行中 / ✅ 配線完了+typecheck / ✔ verify済

## 配線原則 (確定)

- **既存 no-op button → 実 dispatch** (handler のみ差替、見た目不変) — 常に実施
- **static data → store hook** (data源のみ差替、見た目不変) — 常に実施。v2 list は unfiltered hook (全件表示、ProcessSelector 無)
- **既存 UI が無い capability で新規 UI 発明が必要** → batch して user 判断 (§1「機能を落とす場合は停止」)。例外: CaseDetailV2 (banner/modal 移植は prompt 明示許可)

## 機能 parity を落とさないための batched 判断事項 (route-swap 前に user へ)

1. **bulkApprove (一括承認/一括確認)**: v1 は Cases/Approvals の DataTable selection 由来。v2 DataTable に selection 機構なし。単一承認は CaseDetailV2 で配線済 (capability 充足)。一括は (a) v2-styled 全件 button 追加 / (b) 単一のみで一括 drop、の判断。§7 named operation には 一括 含まれず。
2. **Approvals SoD permission banner / 入力者 filter / HIL expand strip**: v1 固有の visualization/convenience。store action 無し (capability 非該当)。v2 に出すには新規 UI。visual-only ゆえ drop しても機能 parity 不変だが見た目追加要否を確認。
3. (以降の screen で判明した deviation を追記)
