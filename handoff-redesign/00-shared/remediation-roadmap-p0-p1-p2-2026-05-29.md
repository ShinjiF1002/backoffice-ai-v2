# backoffice-ai-v2 / prototype-redesign — 統合 Remediation Roadmap (P0 + P1 + P2)

**日付**: 2026-05-29 (統合改訂 2026-05-30) ／ **由来**: `user-perspective-ui-audit-2026-05-29.md` §7 (raw 121 → confirmed 112 = major 33 + minor 79、refuted 12。major 33 を P0 8 + P1 9 の work-item に consolidate、minor 79 を P2 backlog 29 batch 化) ／ **frame**: C (production-ready lens、即フル着手) ／ **新 baseline**: 本 roadmap が以降の実装 baseline。

> **本 roadmap は P0保全 + W0/W1/W2/W3 rebuild execution plan** (2026-05-30 統合改訂)。finding 軸の deep-plan (§3 P1 / §4 P2) と **screen 軸の完成定義 (§1b per-screen ledger)** を併載する。「rebuild」= IA/契約/findings/欠落画面の構造的再構築であり、visual のゼロ作り直しではない (既存路線 Operational Premium Light + Charter v1.0 + canonical-design-spec を精練化、`#635bff` 維持、新 visual language なし)。
>
> **SSOT 単一化 (2026-05-30)**: 本 roadmap が **唯一の実行 SSOT**。screen 軸の overlay (`~/.claude/plans/generic-noodling-lampson.md`、repo 外) と next-session handoff prompt (`next-session-handoff-full-rebuild-2026-05-30.md`、in-repo) は本 roadmap §1/§1b に吸収済 → **以後 historical / prompt-only** として扱い、実行判断に用いない。
>
> **CR 収束 (2026-05-30)**: 計画構造は ~6 CR round + external CR で converged。**本 statement 以降、plan 構造の追加 CR を禁止**。**W0 + W1-A (= P1-W4 strict Stage2 [`c7276a8`] + P1-1 ProcessSelector→ViewContext [`56d6dfa`] + P1-5 Loading/Error CORE) 実装完了 (§1.0 の closure 状態参照)。**P1-W5 完了 (W1-A CORE + P1-5-remainder [下記] 実装済 = full close、2026-05-30)**。次アクションは **P1-W6/W7 (6/12 後送り維持、master plan rebaseline 承認が前提)**。新規 cross-cutting 要件が出た場合のみ §1b/§4 に追記し、構造 re-CR はしない。
>
> **P1-5 closure (CORE + remainder 完了)**: loading/error を **hidden QA seam** (`useListData` + URL query) で到達可能化。**再現手順**: 任意 list route に `?demo=loading` (skeleton) / `?demo=error` (ErrorState + 再試行で ready 回復) を付与 (例 `/cases?demo=loading`、`/cases?demo=error`)。default OFF で demo chrome 非汚染、visible DevControls 不採用 (TopBar 混雑回避、CR)。DataTable は loading/error 中 filter chips + 一括操作 bar を非表示 (CR)。検証: behavioral test (`loading-error.test.tsx` 3) + browser proof (skeleton / ErrorState 両状態、filter 非表示確認)。**P1-5-remainder (実装済 2026-05-30)**: detail 3 画面 (CaseDetail/ProposalDetail/AgentDetail) の bespoke not-found → `EmptyState(truly-empty, role=status, Link action, 文言維持)` 統一 + `EmptyState` permission-empty dead branch 除去 (type/iconMap/LockIcon import、active caller 0)。検証: check:all green (119 test、not-found 3 route 文言 assert 維持) + 3 not-found route browser proof。not-found icon は truly-empty の Inbox を許容 (variant 不要、as-built)。

> **読み方**: P0 は `p0-remediation-plan-2026-05-29.md` で詳細計画済。本 roadmap は §2 で wave 名 + 1 行 recap に留め、本体は §3 (P1 deep-plan) と §4 (P2 batched backlog)。§5 で master plan supersession、§6 で gate / risk / 工数。
>
> **timeline 注記**: 本 roadmap は frame C (production-ready lens、9→11→14 画面化・業務責任者 surface 新設を許容) を前提とする。これは locked master plan (`~/.claude/plans/ai-backoffice-ai-virtual-muffin.md`、Day 1-22 → **Session 4 = 2026-06-12 Fri**) を rebaseline する (§5)。**Session 4 までに現実的に入る範囲と 6/12 後送りの線引きは §6 末**。SCHEMA_VERSION bump を含む wave のデプロイは 6/12 demo 当日と別日に置く。

> **本 roadmap は一部実装済 + 残り forward-looking の実装計画である** (2026-05-30 更新)。**実装済**: P0 (SCHEMA_VERSION=4、`proposal/sendback`・`session/switchActor` action、口座開設 case、route 9) + W0 + W1-A = **P1-W5** (= P1-W4 strict Stage1+Stage2/icon/contrast/tone + P1-1 ProcessSelector→ViewContext + P1-5 Loading/Error CORE + P1-5-remainder detail not-found→EmptyState + permission-empty dead branch 除去)。**未実装 (forward-looking)**: W2 (P1-2/3/6dropdown/7、新 5 画面)、W3 (P2)。未実装 wave のコードが記述どおりでないのは **正常であり defect ではない**。批判レビューは「未実装 wave の計画 (設計・順序・gate) が妥当か」+「実装済 wave の現物が gate green か」を評価すること (round-2 CR が前者を誤評価したため明記)。
>
> **実行 status 更新 (2026-05-30、W2 着手)**: user が **option B (W2/W3 画面追加)** を選択。**JG 確定**: P1-3 IA scope = **(a) 3画面分離** (/business-approver landing + /config-approvals + /escalations)、最終画面数 **9→14** (unified /oversight = (b) は不採用ゆえ 12 ではない)。新画面 polish tier = **95% equal 厳密**。その他 JG は roadmap 推奨を採用: SLA=(b)scope-0 / 検索 scope=(a)store-entity / nav=TopBar単独 / config SoD=(a)reducer hard-block / escalation 帰結=(a)差戻し / ProcessSelector ARIA=(B)li直化 / 台帳母集合=(a)-lite / 期間=(b)直近30日固定 / before-after=previousValue 新設+inline。master plan rebaseline は frame C で承認済 (master plan REBASELINE NOTICE + 本 roadmap SSOT)。
>
> **W2a 実装完了 (2026-05-30)**: store/schema 基盤。SCHEMA_VERSION **4→5** / AgentEntity.promotionRequested(boolean)→**promotionStatus**('none'|'requested'|'approved') + promotionRequestedBy + promotionSendbackReason 移行 (8ref/6file: types/seed/reducer/store.test/AgentDetail/Agents) / CaseEntity.escalation / StoreState.readNotificationIds 加法 / StoreAction += case/escalate・agent/approvePromotion・agent/sendbackPromotion・notification/markRead・notification/markAllRead / reducer に **isSelfApproval helper 抽出** (案件 B4 + 設定 P1-3 SoD を共通化) + exhaustive never 維持 + persist shape guard に readNotificationIds 追加。`npm run check:all` green (lint/no-op/types app+test 0/design 0/**test 127 pass [11 files]**/build) + 本番 build preview boot smoke (index/JS/CSS HTTP 200)。**実装注記**: approve/sendbackPromotion の SoD は action に actorId を載せず state.currentActorId を承認 actor とする (P0 helper 再利用に整合した簡素化、roadmap 署名 `(actorId)` からの逸脱を明示)。派生 selector (useForwardedProposals 等) + screen は W2b/W2c。
>
> **W2b 実装完了 (2026-05-30)**: P1-2 (横断検索/通知) + P1-6 (keyboard a11y)。**9→11 画面** (`/search` B + `/inbox` B)。
> - **P1-2**: useSearchResults/useNotifications/useUnreadCount 派生 selector (store-truth、S8 不変、新 static fixture なし)。TopBar 検索 silhouette→機能 input (Enter→/search、searchQuery は ViewContext ephemeral) + BellIcon→`/inbox` NavLink + 未読 live ドット (>0 のみ)。SearchResults (種別 chip + mono ID + 空クエリ prompt と zero-result 専用文言を分離) / Notifications (差戻し受領 + escalation、actor 厳密 (JG-a)、markRead/markAllRead、SLA=scope-0 (JG-b))。seed 差戻し案件 (理由未記録) も fallback 文言で通知化 (初期 inbox 非空)。
> - **P1-6**: ProcessSelector roving listbox (Arrow/Home/End/Enter/Space) + Esc 復帰 + outside-click + `<li role=option>` 直化 (AR2 invalid ARIA 解消) / DocumentViewer・ReconcilePanel 要確認カードに role=button + keyboard (SC1、内側 button と二重発火しない target 限定)。
> - 契約 3 doc (ia-overview/screen-contracts/coverage-matrix) typology lock に 9→11→14 expansion note + roadmap §1b SSOT pointer を付与し count gate close。
> - `npm run check:all` green (test **143** / build) + 本番 build preview boot smoke (/、/search、/inbox HTTP 200) + routes.test に /search・/inbox 追加 (11 route render gate)。commit: P1-6 + P1-2 は feature branch `remediation/w2-screens` (未 push/merge、merge は user gate)。**残り W2c** (業務責任者 3 画面 + Observatory drill) で 11→14。
>
> **W2c-0 preflight 完了 (2026-05-30、外部 CR 4 findings 是正)**: W2c 着手前に SSOT/可視 copy のズレを是正。
> - **F1 (Blocker) SSOT 14 正規化**: 本 roadmap の旧 `9→12`/`unified /oversight`/`typology 12 (A×2/B×7・A×3/B×6)` 表記を **14 / IA scope=(a) 3 画面 / A×3/B×8/C×3** へ全置換 (§1.0 W2 row / §1b ledger /oversight→3 行 / §3.3 / §5 supersede / §6 gate・sprint・timeline)。説明的に「12 ではない」と記す行 (§17相当 status / nav 注) のみ (b) 名残を意図的に保持。
> - **F2 (Major) PrototypeModeLabel copy**: `:50` の「検索/通知/一括操作/フィルタ は次の実装段階」(全て実装済 = demo-facing 虚偽) を「AI の入力・分析・自動化は模擬 (実 LLM/実行系未接続)」へ (G7 前倒し)。
> - **F3 (Major) mobile 到達性**: bell を全幅可視化 (/inbox)、lg 未満に検索 icon→/search、SearchResults ページに自前 search input (TopBar input が出ない狭幅でも自己完結)。nav=TopBar 単独方針は維持 (Sidebar 不肥大)。
> - **F4 (Medium) `?q=` 契約**: 実装は ViewContext searchQuery (ViewProvider が router 上位ゆえ result→detail→back で query 保持 = back-nav 担保済)。ledger を `?q=` URL param 不採用 + ViewContext 永続機構に reconcile (deep-link は scope-out)。
> - check:all green (test 143 / build) + 本番 boot smoke (/、/cases、/search、/inbox、/observatory HTTP 200)。commit `remediation/w2-screens`。

---

## 1. 全体像 — unified waves

### 1.0 screen 組織の実行 wave (primary、overlay §0 吸収 map)

P0 完了を base に、残りを **screen 軸**で W0/W1/W2/W3 に再構成する。P1-1〜P1-9 + P2 G1-G11 を 1 項目も落とさず吸収 (下表 + §1.1 linearization 詳細 + §1b per-screen ledger で機械確認)。

| wave | screen scope | 内容 | 吸収する P1/P2 項目 |
|---|---|---|---|
| **P0 (完了・保全)** | 既存 9 画面 | B1/B2/B3/B4 + SoD/flywheel/kill-switch/sendback/reset/status-badge。`remediation/p0-store-foundation` @ `cf8df94` 実装済 (再実装しない、W0 着手の base) | (audit major P0 8) |
| **W0 — functional foundation** | 全画面が継承 | contrast SSOT (`--color-fg-tertiary #475569`) / tone SSOT (却下=inset + trustTone。**toastTone は Shared Toast 構築時に co-locate = W1/W2**) / strict-ts Stage1 (app 39→0) / icon-suffix gate。**visual token (shadow/type/density/motion) は定義のみ、適用は W1 (非 gating、functional-first)。fg-muted-on-panel-inset は W1 audit** | **P1-4, P1-9(Stage1)** |
| **W1 — 既存 9 画面 per-screen refine** | 既存 9 画面 | P0-done 保全 + per-screen findings 解消 + W0-visual 適用 + **strict Stage2 (test 68→0 + check:types:test、W1-A 完了)** | **P1-1, P1-5, P1-6(行), P1-8** |
| **W2 — 新 5 画面 + IA + store** (W2a→b→c、IA scope=(a)) | 9→14 画面 | **W2a** store/schema (`agent/approvePromotion`・`sendbackPromotion`・`case/escalate` + `readNotificationIds` + `promotionStatus`/`escalation` 加法 + **SCHEMA 単一 4→5 bump** + promotionRequested→promotionStatus 移行 8ref/6file) ✓ → **W2b** /search + /inbox + ProcessSelector dropdown a11y ✓ → **W2c** /business-approver + /config-approvals + /escalations (3 画面) + AgentDetail 承認者 mode + Observatory drill/CrossLedger/Period + IA sync (typology **A×3/B×8/C×3=14**) | **P1-2 ✓, P1-3, P1-6 ✓, P1-7** |
| **W3 — production-ready completion** | 14 画面 | P2 batched backlog (§4) + §8 残存 gap。**§4 必須昇格群** (下記 A-5) を含む | **P2 G1-G11** |

> **W0 着手条件**: master plan rebaseline 承認は **不要** (W0 は画面追加なし、§5 の rebaseline 必須は画面追加の W2 = P1-2/P1-3)。**W2/W3 着手前に master plan rebaseline 承認が前提** (§5、frame C で承認済)。route 名は `/inbox` に統一 (`/notifications` 系記述を一掃)。business-approver = **IA scope=(a) 3-route** (`/business-approver` landing + `/config-approvals` + `/escalations`)。**旧 unified `/oversight` 1-route 表記は (b) 案の名残で superseded** — 14 画面/(a) が正。
>
> **W3 必須昇格群** (P2 batched から W3 mandatory へ格上げ、§4 で個別 mark): **reversal** (C3 訂正/取消) / **manual entry** (C4 手動起票) / **modal hardening** (inert/scroll-lock/unsaved-guard、§4.2 G5) / **multi-tab** (storage event、§8) / **axe** (14画面 axe smoke、§4.2 G9/G11) / **@media print** (§8)。これらは production-ready の必須要件であり optional backlog 扱いにしない。

> **W0 closure 状態 (2026-05-30、commit `cabf4ec`)**: contrast SSOT (`--color-fg-tertiary #475569`、意味テキスト 22 箇所置換 + R7 gate `scripts/check-design.mjs`) / tone SSOT (§4 却下=inset 整合 + `trustTone`) / strict-ts Stage1 (app 39→0、`check:types` を check:all へ) / icon-suffix (4 file + emoji 除去) を実装。`npm run check:all` green (lint/no-op/types/design/test 113/build) + `tsc -p tsconfig.app.json --strict --noUncheckedIndexedAccess`=0 + browser proof 4 画面 (tertiary 視認・hierarchy 維持・emoji 除去)。**W1 へ送った項目**: strict Stage2 (test 68→0 + check:types:test、**W1-A 完了**)、fg-muted-on-panel-inset audit (未)、W0-visual (shadow/type/density、§10 定義済) per-screen 適用 (未)、toastTone (未、Shared Toast 構築時)。**W0 で新規 non-null `!` 導入なし** (既存 `!` は active src 3 箇所 = FieldActionModal:68/92・DocumentViewer:80、W0 非 touch、strict-clean cleanup は W1 Stage2 候補)。

### 1.1 finding 軸の wave linearization 詳細 (store hot-file 衝突最小化)

> 下表は §1.0 の screen-org wave を **store hot-file (types/reducer/persist/seed/hooks) + Observatory.tsx の編集衝突を最小化する dependency linearization** で展開した実装順序。§3 (P1 deep-plan) / §6 (gate) が参照する granular pointer。**§1.0 が screen 軸の primary、本表が finding 軸の実装順序** (両者は同一 scope の別 view)。

frame C で P0 + P1 + P2 を 8 wave に直列/部分並行配置する。

| wave | 含む項目 | gate (→ 次 wave 着手条件) |
|---|---|---|
| **P0-W0** | P0 6 judgement gate + frame C 2 判断 (master plan rebaseline 承認 / 業務責任者 scope-out 解除) + P1-9 tsconfig フラグ ON タイミング + **新 5 画面 polish tier 判断** | 全 gate 回答 + rebaseline 承認 + drop 規則確定 |
| **P0-W1** | P0 B1 store / B4 SoD-actor / sendback-guard / SCHEMA_VERSION 2→3 集約 bump ＋ **[積層] P1-3 の store 拡張 (agent/approvePromotion・sendbackPromotion・case/escalate + AgentEntity/CaseEntity field) を同 bump に相乗り** ＋ [条件] P1-9 NUIA フラグ前倒し ON。**[実装整合 2026-05-30]**: P1-3 の store 拡張 (approvePromotion / sendbackPromotion / case/escalate) は W1 で実装せず P1 各 wave へ defer — W1-as-built は P0 scope (B1/B4/sendback) のまま。emergencyStop/resume + AgentEntity.paused は別途 W3 で追加、最終 SCHEMA_VERSION=4 | check:all green / store.test 新署名 green / exhaustive never 全 case 網羅 (W1 実装は P0 action のみ、P1-3 相乗りは未実施) |
| **P0-W2** | P0 B3 (mock-kpi SSOT + 口座開設 5 件 + verification fixture 分離) → B2 (証拠アンカー整合) → status-badge-resolver | check:all green / 証拠アンカー整合 test / 手書き分母 0 grep |
| **P0-W3** | P0 B1/B4/sendback UI 配線 / **persona switcher 新 chrome** (Gate 4a) / **Observatory lineage view IA** (Gate 5ii) / reset-confirm / status-badge UI | §6 画面 evidence 全項目 / P2B-4 full gate clean / demo-script 実走 |
| **P1-W4** | P1-9 (strict + NUIA + test typecheck) ／ P1-4 (contrast SSOT + R7 gate) | check:all green (**strict+NUIA app 39→0 error**) / fg-subtle negative grep 0 / R7 green |
| **P1-W5** | P1-1 (ProcessSelector → ViewContext + list 配線) ／ P1-5 (Loading/Error 到達 + 共有 not-found) | useView consumer 0→5+ / UC-BO-02 で口座開設 5 件 / loading・error 到達 |
| **P1-W6** | P1-2 (横断検索 + 通知 screen、9→11 画面) ／ P1-6 (DocumentViewer/ReconcilePanel keyboard + ProcessSelector a11y) | 契約 3 doc typology lock 11 画面 count gate / keyboard axe 0 |
| **P1-W7** | P1-3 (業務責任者 surface、11→14 画面) ／ P1-7 (Observatory drill + 案件横断台帳) ／ P1-8 (before/after) | check:all green / P2B-4 gate / demo-script 2 journey / typology lock 14 画面 |
| **P2-Bx** | P2 batched backlog (3 domain × G1-G11) を §4.末 placement に従い各 wave 後に随時消化 | 各 batch の group verification gate (deep-plan しない) |

> **P0 closure 状態 (2026-05-30)**: W1 (`ba2f2ba`) / W2 (`955bf0c` 他) / W3 (`c72362e`) 実装完了。W3 は `npm run check:all` green (test 113 pass / build) + 実 Chromium browser proof (4 route render + 390px persona switcher 可視) で検証。plan-vs-code drift は P-C1/C5/C3 を本 roadmap + `p0-remediation-plan-2026-05-29.md` に honest reconcile 済 (`1202626`)。**P0 は closeable**。なお別 AI 向け handoff の「P0 not closeable」verdict は committed HEAD 監査 + browser build 鮮度の stale evidence による誤判定と critical-review で判明し棄却 (3/4 code blocker は working tree で既修正)。

**itemKey ↔ audit §7 cross-walk** (採番ずれ防止、批判レビュー must-fix):

| 本 roadmap itemKey | audit §7 P1 # | P0 依存先 |
|---|---|---|
| P1-1-process-selector | #8 | B3 fixture |
| P1-2-search-notify | #9 | Gate4 actor / sendback / P1-1 |
| P1-3-business-approver-surface | #10 | Gate4 / sendback / W1 bump |
| P1-4-contrast-ssot | #12 | Sidebar:123 のみ Gate4 |
| P1-5-loading-error-reachable | #13 | persona switcher chrome 配置のみ |
| P1-6-keyboard-a11y | #14 | P1-1 |
| P1-7-observatory-drill-traceability | #15 | Gate5ii / B3 / P1-1 (/ P1-2 JG-2a 時) |
| P1-8-before-after | #16 | B1 (ReconcilePanel:119) |
| P1-9-strict-ts | #17 + build-health | W1 store hot-file |

> audit §7 P1 #11 (SoD identity role-scoped) は **本 roadmap で deep-plan item に持たず P0 B4 に畳み込み済**。P1-3 の SoD は B4 の reducer hard-block helper を再利用する (新規 P1 node なし)。

---

## 1b. per-screen 完成 ledger (screen 軸の完成定義、overlay 吸収)

> finding 軸 (§1.1 / §3 / §4) を補完する **screen 軸の完成定義**。各画面の「何をもって完成とするか」を type × 主 refine × 解消 finding で定義。W1 (既存 9 画面 refine) + W2 (新 5 画面) を 1 表で閉じる。実装詳細は §3 deep-plan を per-component pointer として参照。P0-done (B1/B2/B3/B4/A2/A3/A4/A5/I2/DC1/RD1/C6/R4) は **保全** (各 C 型画面で regression させない)。

### W1 — 既存 9 画面 refine (P0-done 保全 + W0-visual 適用 + per-screen findings)

| 画面 | type | 主 refine (visual + IA + density + findings) | 解消 finding |
|---|---|---|---|
| **Hub /** | A | 4-band 維持、X4 query-emit + `DataTable.initialFilters` + trustTone resolver + timestamp + daily-summary store 派生 | X4, D1, AR1, trust, ts |
| **Cases /cases** | B | T3 density、AttentionCell chip 化、**ProcessSelector 配線 (P1-1)**、Hub carry-in、自分の担当 default、pageSize、useQueueState (round-trip) | X1, X4, 担当, search, count, pageSize, AR1, §8#2 |
| **Approvals /approvals** | B | T3、bulk 部分成功 tone-only、count post-filter、pageSize、次の1件 | X1, pageSize, count, §8承認者, bulk-tone |
| **CaseDetail /cases/:id** | C | header T1/body T2、breadcrumb Link 化、**before/after (P1-8/I1)**、**keyboard 選択 (P1-6/SC1)**、2-pane a11y、SoD proof verbose 維持、完了 CTA | DC1, AR1, I1, SC1, B4, B1, I2, journey, doc-multipage |
| **Proposals /proposals** | B | T3、AR1、却下 tone、carry-in | X1, pageSize, 却下, AR1 |
| **ProposalDetail /proposals/:id** | C | 2-pane 保全、A1 forward leg、footer 正直化、MetricVsThreshold overflow、AR1、toast tone | A1, A4/A5/R3 (保全), MetricVsThr, AR1 |
| **Agents /agents** | B | T3、**trustTone resolver**、process carry、MiniTrend a11y、AR1、pageSize | A1, A3, trust, AR1, pageSize |
| **AgentDetail /agents/:id** | C | 2-pane 保全、A1 reverse (RelatedProposalsBlock)、A2 拡張、R4 harden、promotion cancel、AR1、toast | A1, A2/A3/R4 (保全+harden), MetricVsThr, AR1, 降格 |
| **Loading/Error (= P1-5) ✓** | — | 4 list status/onRetry + useListData + `?demo` seam (CORE)、detail NotFound→EmptyState 統一 (remainder ✓ 2026-05-30) | SC state-coverage |

### W2 — 新 5 画面 完成定義 (9→14、IA scope=(a) 確定、deep-plan = §3.2/§3.3/§3.7)

| 画面 | type | 主構築 | 解消 finding | deep-plan |
|---|---|---|---|---|
| **/search ✓** | B | DataTable + TopBar SearchInput、種別 chip + mono ID、row→detail。back は ViewContext searchQuery 永続で担保 (`?q=` URL param は不採用 = ViewProvider が router 上位ゆえ result→detail→back で query 保持、deep-link は scope-out)。空クエリ prompt と zero-result 専用文言を分離 (W2b ✓ 2026-05-30) | §7 #9 (search), §6 novelty=new | §3.2 (P1-2) |
| **/inbox ✓** | B | NotificationRow + NotificationList、bell 未読 live、role-filtered (currentActor 宛)、markRead/markAllRead (W2b ✓ 2026-05-30) | §7 #9 (notify), §5a 欠落 | §3.2 (P1-2) |
| **/business-approver** | A | 業務責任者 landing。forwarded 提案 / 昇格申請 / escalation の 3 受け口を集約 drill (useBusinessApproverInbox)。IA scope=(a) | §7 #10, §5a, §8 persona gap | §3.3 (P1-3) |
| **/config-approvals** | B | 設定承認 queue (forwarded 提案 + Agent 昇格申請)。row→owner-mode C-detail drill。承認/差戻し = approvePromotion/sendbackPromotion (SoD = isSelfApproval helper 再利用、W2a ✓) | §7 #10, §5a | §3.3 (P1-3) |
| **/escalations** | B | escalation 受信 queue (case/escalate された難案件)。裁定 = 既存 case/sendback 再利用 (JG-3=a) | §7 #10 (C2), §8 persona gap | §3.3 (P1-3) |

> **closure 注記**: 本 ledger (screen 軸) + §1 itemKey↔§7 cross-walk (finding 軸 major) + §4末 minor 79 cross-walk count gate (finding 軸 minor) の 3 機構で 112 findings の閉鎖を担保する。最終 count gate は §4末参照。

---

## 2. P0 recap (詳細は `p0-remediation-plan-2026-05-29.md` 参照)

| wave | 1 行 |
|---|---|
| **P0-W0** | 6 judgement gate を AskUserQuestion 確定 (B1 action / 分母 / fixture 分離 / SoD 強制 / flywheel / B2 範囲)。回答前に W1 着手禁止 |
| **P0-W1** | store 基盤 1 patch: action union 必須化 + CaseEntity/StoreState field + SCHEMA_VERSION 2→3 集約 bump + reducer SoD hard-block。同一 hot-file を 3 項目共有で不可分 |
| **P0-W2** | mock data SSOT: mock-kpi.ts 新設 + 口座開設 5 件 CASE_LIST 入り + verification fixture 分離 (2a) → 証拠アンカー整合 (B2) → status field 追加 (2b)。store action 非 touch |
| **P0-W3** | UI 配線 + 観測可能化: B1 値入力 + humanValue 表示 / mode→persona switcher 分離 + SoD disabled / sendback 理由再表示 / flywheel lineage view + kill-switch / reset confirm Modal / status-badge resolver 経由 |

P0 の strategic gate (user 決定済): Gate 4(a) = reducer hard-block + persona switcher 分離、Gate 5(ii) = Observatory lineage view IA 新設 (P1 carve → P0 必須昇格)。

---

## 3. P1 deep-plan

### 3.0 P1 wave 順序と gate

P0 全 wave 完了後に P1-W4 → P1-W7 を直列。順序の根拠:

- **P1-9 先頭 (P1-W4)**: tsconfig フラグ ON 後は新規コードが guard 必須。後続 P1 (P1-2/P1-3 が新 hook/page を足す) を NUIA-clean で書ける土台にする。
- **P1-1 が consumer pattern owner (P1-W5)**: useView consumer 配線を確立。P1-2 (検索を同 useView)・P1-6 (selector a11y)・P1-7 (台帳 Process scope) が依存。
- **P1-W7 に judgement-heavy (P1-3/P1-7) + Observatory hot-file を集約**: 機械的配線 (P1-9/1/2/6) を先に固めてから IA 拡張を最後に置く。

**judgement gate (着手前 user 確定、§3.3 / §3.7 に問い+選択肢+推奨)**: P1-3 業務責任者面 IA scope、P1-7 Observatory drill / 台帳母集団 / lineage seat。これらは persona switcher 挙動 (P0 Gate4) と pair で決める。

---

### 3.1 P1-1 — ProcessSelector → ViewContext 配線 + list hook に process 伝播

**根本原因**: ProcessSelector が ViewContext 非接続。selector は component-local `useState('UC-BO-01')` (`ProcessSelector.tsx:19`、`:47-50` setSelected) で閉じる。一方 ViewContext は完備で死蔵 (`view-context.ts:13-43` process/setProcess/loadProcess、`grep useView` consumer 0)。4 list hook は filter 口実装済 (`hooks.ts` matchesWorkflow + optional workflowId) だが consumer は引数なし呼び出し (`Cases.tsx:63` `useCases()` 他)。entity は全て workflowId 保持。欠けているのは「selector→context→hook 引数」の 3 点配線のみ。

| file:line | 変更 |
|---|---|
| `ProcessSelector.tsx:19,47-50` | local useState 削除 → `useView()` の process/setProcess に置換。open の local state は残す。a11y (Esc/roving) は P1-6 scope なので触らない |
| `view-context.ts:11` | DEFAULT_PROCESS を G1 決定値に設定 (型・API 不変)。コメント同期 |
| `Cases.tsx:63,80` | `useCases(process)` + header :80 の '法人住所変更' hardcode を process 由来ラベルへ ('all'='全業務') |
| `Approvals.tsx:56` / `Proposals.tsx:48` / `Agents.tsx:93` | `useApprovals/Proposals/Agents(process)` 配線。header 文言は process 非依存で不変 |
| `hooks.ts:91-124` | **G2 採択時のみ** useHubModel に optional workflowId。G2 '全業務固定' なら無変更 |
| `Hub.tsx:56` / `Observatory.tsx` | **G2/G3 採択時のみ** 連動。default 'all' なら現状維持 |
| `view-persist.test.ts` / `routes.test.tsx` | 「Phase 5」コメント実態化 + 新 it (UC-BO-02 選択で口座開設 case のみ表示) |

- **p0Dependency**: P0 B3 の口座開設 case fixture に強依存 (P0 前は seed 内 UC-BO-02 が 0 件で「配線が効いているのに空」破綻)。G2/G3 採択時は mock-kpi SSOT + HUB_PROCESSES 物理削除の上に積層。persona switcher (Gate 4a、TopBar right) とは配置分離だが両者 TopBar chrome を触る。
- **store contract**: 影響なし (read 面 selector のみ、process 状態は ViewContext localStorage に閉じ store persist と別層)。
- **判断 gate**:
  - **G1 (DEFAULT_PROCESS)**: 'UC-BO-01' 維持 (demo 主軸直行、ただし口座開設が初期非表示) / 'all' 変更 (両業務初期表示、ただし process scope demo 価値が初手で伝わらない)。**推奨**: persona switcher の role landing 既定と pair 決定 (G1 + role 既定の二軸同時確定)。
  - **G2 (Hub 連動範囲)**: selector 連動 (特定 process の Alert のみ) / 全業務横断固定。**推奨**: A 型 landing の俯瞰性を尊重し default 'all' なら現状維持寄り。
  - **G3 (Observatory scope 連動の深さ)**: metrics/knowledge を絞るか / 監査 tab 単一 case 固定 (M3) は P0 lineage + P1-7 に委ねるか。**推奨**: metrics/knowledge のみ最小連動、台帳は P1-7。
  - **G4 (Cases header hardcode 解消方式)**: process→label resolver / header から業務名除き件数のみ。低 stakes。
- **検証**: check:all green / `useView` consumer 0→5+ / 引数なし `useCases()` 等 0 / Cases に '法人住所変更' literal 0 / behavioral test (UC-BO-02 で口座開設のみ、UC-BO-01 で法人住所変更のみ) / persist round-trip / screen evidence (P0 fixture 着地後、selector 切替で 4 list + 「業務」列即連動 + reload 保持) / P2B-4 full gate。
- **dependsOnP1**: なし。**effort**: AI=S / review=S / judgement=med。
- **reconcile**: production-remediation R0-1 (ProcessSelector filter) の実装 leg。Change Log に「audit §7 P1 #8 を R0-1 配線として実装」を 1 回追記。検索 zero-result / pageSize 欠落は別 P2 (scope creep 回避)。

---

### 3.2 P1-2 — 横断 free-text 検索 + 通知/ワークインボックス screen 契約化・配線

**根本原因**: 2 系統の死蔵・偽装。(1) **検索**: `ViewProvider.tsx:11,19` で searchQuery 生成済だが consumer 0 (view-context.ts:6 自ら「配線は Phase 5」明記)。TopBar.tsx:19-27 は `aria-hidden` + input 不在の silhouette。案件 ID/法人名で過去案件を引く動線がプロダクト全体に不在。(2) **通知/inbox**: TopBar.tsx:32-38 の BellIcon は `aria-hidden` + 常時赤ドットの cosmetic。クリック不可・遷移先 0。差戻し受領・エスカレーション・SLA 警告の能動 push 受け手面が構造欠落 (reducer.ts:60-61 が status を sent-back にするのみで宛先概念が store に無い)。

| file:line | 変更 |
|---|---|
| `view-context.ts:6,13-18` | searchQuery を配線基盤化 (型不変、コメント実態化)。永続化しない (ephemeral) |
| `TopBar.tsx:19-27,32-38` | 検索 silhouette → 機能 input (value/onChange、Enter で /search navigate)。BellIcon → NavLink `/inbox` + 赤ドットを store 派生未読数連動 (>0 のみ) |
| `SearchResults.tsx` (新規) | 横断 free-text 検索結果 (B 型)。store-truth から id/法人名/Agent名 部分一致 + DataTable。zero-result を structurally-empty と分離した専用文言。行 click で各 detail |
| `Notifications.tsx` (新規) | 通知/inbox (B 型)。差戻し受領/エスカレーション/SLA 警告を行表示、click で detail、markRead dispatch。JP-only |
| `hooks.ts` | useHubModel 同型派生: useSearchResults(query) / useNotifications() / useUnreadCount()。新 static fixture を増やさない |
| `types.ts` | StoreState root に `readNotificationIds: string[]`。StoreAction に notification/markRead, markAllRead を加法追加。検索は store state 持たない |
| `reducer.ts` / `persist.ts` / `seed.ts` | markRead/markAllRead (冪等) 追加 / isStoreStateShape に Array.isArray guard 1 行 (**SCHEMA_VERSION bump は P0 W1 集約に相乗り、単独再 bump 禁止**) / readNotificationIds: [] 初期化 |
| `App.tsx` / `Sidebar.tsx` | /search + `/inbox` を AppShell 配下に追加 (9→11 画面)。nav は TopBar 単独 (検索 input + bell、Sidebar 不肥大、as-built W2b) |
| `search-notify.test.tsx` (新規) | 検索 id/法人名 hit + zero-result 分離。通知 sendback 出現 + markRead で未読減 + unreadCount 連動 |

- **p0Dependency**: 強依存。(1) actor identity (Gate 4a): 通知の「自分宛」は currentActorId が入力者の案件が sent-back を filter する必要。(2) sendback reason (P0): 通知本文に差戻し理由を出す。(3) SCHEMA_VERSION (P0 W1 集約 2→3): readNotificationIds を相乗りで二重 bump 回避。検索は store-truth が P0 B3 後に正しく揃う。
- **store contract**: 加法的のみ (readNotificationIds 1 field + markRead/markAllRead action)。検索は store 不変 (ViewProvider ephemeral)。新 static notification fixture を作らず派生 selector で都度算出。
- **判断 gate**:
  - **SLA 警告 source**: (a) elapsedLabel 文字列 parse の擬似判定 / (b) **scope-0** (差戻し受領 + エスカレーションの 2 種のみ)。**推奨 (b)** — datetime 化が範囲外で偽 SLA は audit §4 の static SLA minor を再生産する Tech Debt。
  - **actor フィルタ粒度**: (a) currentActorId 厳密 / (b) 全 actor 横断 + 宛先 chip。**推奨**: demo-script 整合に依存、P0 Gate4 persona 挙動と pair。
  - **検索 scope**: (a) store entity のみ / (b) OBS_LEDGER も含む。**推奨 (a)** — 監査台帳は store 非載 (S8 境界)、台帳横断検索は P1-7 に carve。
  - **nav 配置**: TopBar 単独 / Sidebar にも。**推奨 TopBar 単独** (chrome 役割分担、Sidebar 肥大回避)。
- **検証**: check:all green (検索 input/ベル button/markRead は新設 interactive、**ただし check:no-op は `<button>` のみ対象 → input/NavLink/div は behavioral test が唯一の wiring gate**) / searchQuery consumer 0 解消 + aria-hidden 除去 negative grep / search-notify.test / screen evidence (TopBar 検索→/search→zero-result 専用文言、案件差戻し→赤ドット→`/inbox`→click→既読化) / 契約 3 doc typology lock 11 画面 count gate / **新画面の status 概念 (未読) を status-tones resolver に追加 (画面ローカル tone-map 0)、chip は 3 系統のみ**。
- **dependsOnP1**: `P1-1-process-selector`。**effort**: AI=L / review=M / judgement=high。
- **risks**: 契約 IA 変更が複数 doc に波及 (1 doc だけ更新で次サイクル監査が画面数矛盾を再検出 → 3 doc 同時 + count gate) / SLA 偽装 Tech Debt / actor 依存 demo 詰み / S8 境界侵犯 (検索を浅 field 限定) / 赤ドット常時点灯の挙動変更 / P1-1 との useView 交差 (P1-1 先行で回避)。
- **reconcile**: audit §6 novelty=new に対応する純増分。production-remediation 重複なし。台帳横断検索 (#15) は本 item scope 外で Observatory 側に残す (S8 遵守)。

---

### 3.3 P1-3 — 業務責任者 persona の専用 queue/landing + config-approval surface + escalation 受信 queue 〔judgement gate item〕

**根本原因**: 業務責任者 (提案承認・Agent 設定承認・エスカレーション裁定の主体) の受け口 IA が persona 単位で欠落。3 系統破綻: (1) 提案 config 承認: ProposalDetail.tsx:101-116 の mode toggle で間借り、差戻しは `:368` showToast のみ (`proposal/sendback` action 不在)。forwarded 提案集約 queue が無い。(2) Agent 設定承認: reducer.ts:76-77 は requestPromotion のみ、承認/差戻し action 不在 (C1「Trust 昇格が永久停止」)。(3) エスカレーション受信: FieldActionModal escalate が CaseDetail.tsx:91-93 で showToast のみ、受信 queue 不在 (C2「難案件が宙に消える」)。

> **scope 正確化 (批判レビュー should-fix)**: 提案承認面は既存契約済 (ProposalDetail owner mode、screen-contracts §6 / allowed-actions §2 / 実装済 ProposalDetail.tsx:164)。genuine な契約 void は **(a) config 承認面 (AgentDetail に owner mode 不在)、(b) escalation 受信 lane (真に不在)、(c) persona 横断の統合 landing/queue** の 3 系統。本 item は既存 ProposalDetail owner mode を別 surface へ移す scope 拡張を含む — 「契約 void を埋める」のではなく契約済 IA 決定の置換を伴う。

| file:line | 変更 |
|---|---|
| `types.ts:36-45,13-25,63-74` | AgentEntity に promotionStatus/promotionSendbackReason (promotionRequested boolean 統合)、CaseEntity に escalation?{reason,category,to}、StoreAction に agent/approvePromotion(actorId)・sendbackPromotion(actorId,reason)・case/escalate。全加法的 |
| `reducer.ts` | approvePromotion (SoD: 申請 actorId≠承認 actorId を **P0 Gate4a hard-block helper 再利用** で no-op block) / sendbackPromotion / escalate。P0 proposal/sendback precondition 確認 |
| `hooks.ts:45-54` | useForwardedProposals / usePendingPromotions / useEscalations / useBusinessApproverInbox (派生 selector) |
| `BusinessApproverHub.tsx` (新規) | A 型 landing、3 受け口集約 drill |
| `ConfigApprovals.tsx` / `Escalations.tsx` (新規) | B 型 queue (forwarded 提案 + 昇格申請 / escalation case) |
| `AgentDetail.tsx:155-188` | 承認者 mode 追加 (C 型単一決定面契約遵守、mode 出し分け)、promotionStatus==='requested' に設定承認/差戻し footer |
| `ProposalDetail.tsx` / `CaseDetail.tsx:83-94` | queue からの owner mode 導線配線 (P0 補完の proposal/sendback の上)。escalate を `case/escalate` dispatch に store 化 |
| `Sidebar.tsx:32-52` / `App.tsx:27-39` | ─承認─ group (/config-approvals, /escalations) + /business-approver。9→14 画面 (typology lock 更新) |

- **p0Dependency**: 強依存。(1) actor identity + (2) persona switcher (到達経路、無いと demo 詰み) + (3) session/switchActor + (4) proposal/sendback (P0 W1) + (5) SCHEMA_VERSION (本 item の field 追加を **P0 W1 集約 bump に相乗り**)。
- **store contract**: 大 (action 3 拡張 + entity field)。exhaustive never が reducer 漏れ検出。SoD は P0 hard-block helper 再利用 (再発明禁止、四眼原則を 案件/手順/設定 3 層統一)。store-truth 維持 (rich data は mock dict)。
- **判断 gate**:
  - **JG-1 (IA scope)**: (a) landing + 2 queue の 3 画面 / (b) 統合 queue 1 画面 (tab 分割) / (c) mode 配線のみ landing/queue なし / (d) **scope-0** (mode 間借りのまま R1 へ carve)。trade-off: (a) IA 網羅最大だが 9→14 で polish target 拡大 (95% equal と衝突) / (b) 中庸 / (c) §8 persona IA 欠落が残り再指摘 / (d) frame C と矛盾。**推奨 (b)** 単一統合 queue + landing は role landing 代替。**frame C ゆえ (a) も妥当 → user 判断。選択後に polish tier (95% equal / prototype-tier 低-fi) を pair 確定し effort=L を再確定**。 **【確定 2026-05-30: (a) 3画面分離 (/business-approver + /config-approvals + /escalations) + polish 95% equal 厳密、最終画面数 9→14、effort=L】**
  - **JG-2 (config 承認 SoD 強制度)**: (a) reducer hard-block / (b) UI disabled のみ / (c) 表示のみ。**推奨 (a)** P0 案件 SoD と一貫、config 層も hard-block。
  - **JG-3 (エスカレーション裁定の帰結)**: (a) 差戻し / (b) 差戻し + 再割当 / (c) 直接解決。**推奨 (a)** 最小 (escalation→sendback)。(c) は SoD と緊張。
  - **JG-4 (typology lock 更新の可否)**: 9→14 を許容するか。frame C 許容前提だが master plan rebaseline 承認 (P0-W0) が前提。新 5 画面の polish tier は user 判断。
- **検証**: check:all green (新 button が check:no-op pass) / store.test 新 describe (approvePromotion SoD no-op / escalate 格納 / proposal/sendback consume) / 新 selector test / 画面 evidence (persona 切替で /business-approver → /config-approvals → 承認/差戻し store 反映 → AgentDetail 承認者 mode で SoD self-approval disabled → /escalations 裁定) / negative grep (showToast-only config 差戻し 0 / tone='primary' literal 0) / P2B-4 / demo-script 2 journey。
- **dependsOnP1**: なし (SoD/actor の実依存は P0 Gate4 = p0Dependency に記録)。**effort**: AI=L / review=M / judgement=high。
- **risks**: IA scope creep (95% equal 衝突、polish tier 未確定で工数不定) / master plan rebaseline 未承認の着手は禁則 / SoD logic 二重実装 (helper 再利用必須) / SCHEMA_VERSION 二重 bump (W1 相乗り必須) / persona switcher 未完で到達不能 (hard precondition) / promotionRequested↔promotionStatus drift (boolean 廃止、consumer 全箇所同時更新) / mode 非対称解消 (C 型 footer 1 セット維持)。
- **reconcile**: audit §7 #10 + §5a (major) + §8 残存 gap を塞ぐ。production-remediation の UX-03/REG-01/R1-3 は backend 層 (別レイヤ)。P0 = action/dispatch、本 item = queue/landing/config承認/escalation 受信 (責務分離)。

---

### 3.4 P1-4 — fg-subtle をテキストから排除 + コントラスト基準を design SSOT 明文化

**根本原因**: fg-subtle (#94a3b8、`index.css:18`) は panel 上 2.56:1 / canvas 2.45:1 / panel-inset 2.34:1 で **AA-large 3.0:1 にも全背景で未達** = 装飾/disabled/icon を除くあらゆる意味テキストに使用不可。実 text-carrying は ~23 箇所 (Cases:18-19,42 / Agents:40,51 / Observatory:266 / ProposalDetail:199,248,280 / MetricVsThreshold:50,52,79 / ReconcilePanel:77,124 / FieldActionModal:115 / Sidebar:75,85,123,147 / LifecycleStepper:44 / DataTable:439 + **TopBar:24**)。第2: fg-muted (#64748b) は panel-inset 上 4.34:1 で AA 未達。第3: contrast 基準が design SSOT 不在 (canonical-design-spec §8 / p2b4-gate にルール無し)。

> **gate universe 同期 (批判レビュー should-fix)**: 着手前に plan の negative grep を 1 回実走し survive 行を全列挙 (実測 ~23 行/11 file)。**TopBar.tsx:24 は P1-2 で input 化されるため P1-4 では除外し、P1-2 が aria-hidden 除去後に R7 を満たすことを co-locate**。negative gate pattern に `pointer-events-none` を装飾例外として追加。

| file:line | 変更 |
|---|---|
| `index.css:18` | fg-subtle は**削除も値変更もしない** (disabled/icon の意図的弱コントラストを保つ)。意味テキスト用 AA-pass token `--color-fg-tertiary: #475569` (全背景 7.58/7.24/6.92:1) を追加。コメントで用途分離明記 |
| `Cases/Agents/Observatory/ProposalDetail/MetricVsThreshold/ReconcilePanel/FieldActionModal/Sidebar/LifecycleStepper/DataTable` (上記 ~20 箇所) | text-[fg-subtle] → fg-tertiary。disabled/icon 箇所は据え置き。Sidebar:123 は **P0 Gate4 の useCurrentActor 化後に当てる** (二重編集回避) |
| Observatory panel-inset 上 fg-muted 行 (**W1 per-screen audit**) | 全数監査し panel-inset 上は fg-tertiary/fg へ昇格 (背景文脈依存で機械 grep 不可、W0 closure は fg-subtle-on-text のみ、canonical §9 整合) |
| (契約) canonical-design-spec §8 / p2b4-gate §2,§3 / design-system:16-19 | R7 (contrast) 追加 + 例外表 (aria-hidden icon / disabled / placeholder / pointer-events-none) + 数値根拠 (2.56/4.34/4.5/3.0) を 1 箇所 SSOT 化 |

- **p0Dependency**: Sidebar.tsx:123「入力者」のみ P0 Gate4 依存 (useCurrentActor 化と二重編集回避)。残り ~20 箇所は store 直交で独立。
- **store contract**: なし (純 CSS token + className + 契約 doc)。P0 と並行可 (Sidebar:123 のみ順序依存)。
- **判断 gate**:
  - **代替 token 選択**: (a) **fg-tertiary=#475569** (tertiary 階層維持) / (b) fg-muted へ集約 (階層廃止、panel-inset は別途昇格要) / (c) fg-subtle 値を上げる (disabled/icon の弱コントラスト意図を破壊)。**推奨 (a)**。視覚 hierarchy は user 決定。
  - **panel-inset 上 fg-muted**: (a) 厳格 AA で全昇格 / (b) AA-large 許容で据え置き。WCAG 厳格なら (a)。
  - **R7 厳格度**: hard-fail (CI block) / warn のみ。**推奨 hard-fail だが段階制御は user**。
  - **scope**: 5 行のみ (audit 文面準拠、token 残し再混入) vs 全 ~23 箇所 + panel-inset。**推奨 全数** (SSOT 化が核)。
- **検証**: WCAG 計算再現 (#475569 が 3 背景全て ≥4.5:1) / 全数 negative grep (active src で fg-subtle の意味テキスト hit 0、aria-hidden/disabled/cursor-not-allowed/pointer-events-none/Icon 除外) / panel-inset fg-muted 全数監査 (**W1 per-screen へ送る** — 背景文脈依存で機械 grep 不可、W0 closure は fg-subtle-on-text のみ、canonical §9 整合) / check:all green / **R7 を新規 design-lint script (scripts/check-contrast.mjs 等) として check:all に直列追加** (現 check:all は grep gate 層が無いため script 実装が R7 green の前提条件) / Playwright screenshot (4 画面で tertiary 視認 + hierarchy 維持) / 契約 3 doc に数値 SSOT 化。
- **dependsOnP1**: なし (P1-5 が本 token を踏襲する逆結合のみ。本 item 先行が望ましい)。**effort**: AI=M / review=S / judgement=med。
- **risks**: 5 行のみ修正で token 残存 → 再混入 / fg-subtle 値上げで disabled 視覚退行 / Sidebar:123 P0 前で二重編集 / panel-inset 全昇格で hierarchy 平板化 / hard-fail で他要因 red 阻害 (R7 を本項目 grep に限定)。
- **reconcile**: audit §7 #12 (AR1) 直接実装。soft-fg (-soft 背景) は index.css:28-38 で解決済 (touch しない)。p2b4-gate §4d の手動 contrast 確認を grep gate + token SSOT で機械化。**R7 追加を P0 W3 gate (P2B-4 full gate) 着手前に確定すると gate 定義 drift を防ぐ**。

---

### 3.5 P1-5 — Loading/Error 状態を到達可能化 (status/onRetry 配線 + mock 遅延/失敗トグル)

**根本原因**: 3 系統。(1) DataTable は status/onRetry/loading/error 完全実装済 (`DataTable.tsx:49,140-141,248-251`) だが 4 list caller が status 不渡しで branch 構造的不到達。(2) store 完全同期 (`grep setTimeout|async|Promise src/data src/store` 0 hit) で latency/failure 不在 → loading/error 発火に非同期層が必要。(3) detail 3 画面 not-found が EmptyState 迂回の bespoke inline で `role=status` 欠落 (CaseDetail:30-39 / ProposalDetail:38-47 / AgentDetail:19-28、対照: EmptyState.tsx:36 は role 持つ)。(4) EmptyState permission-empty dead branch (active caller 0、RBAC は R1+)。

| file:line | 変更 |
|---|---|
| `dev/mock-fetch.ts` (新規) | demo-only 非同期 simulation SSOT。simulateFetch<T> が ViewProvider の latency/failNext を読む。store 非汚染 leaf |
| `ViewProvider.tsx:9-23` / `view-context.ts` | mockLatencyMs/mockFailNext + setter (in-memory、persist しない) |
| `hooks/useListData.ts` (新規) | 4 list 共通の store selector → {status, rows, onRetry}。default (latency=0) は同期 'ready' で既存挙動保持。onRetry が failNext 消費 |
| `Cases/Approvals/Proposals/Agents.tsx` | useListData 経由で status/onRetry 配線 (caller 変更最小化、selection prop 不変) |
| `EmptyState.tsx` ✓ | permission-empty を type/iconMap + LockIcon import から削除 (dead branch 解消、active caller 0、as-built 2026-05-30) |
| `CaseDetail/ProposalDetail/AgentDetail.tsx` ✓ | bespoke NotFound 削除 → EmptyState(truly-empty, 文言維持, Link action) に統一 (role=status 付与、中央寄せ wrapper)、as-built 2026-05-30 |
| `TopBar 近傍` (DevControls 新規) | 遅延/失敗トグル UI を PrototypeModeLabel 近傍に。**P0 persona switcher chrome 確定後に余白配置** |
| `datatable.test.tsx` / detail not-found test | loading/error reachability (role=status/alert + onRetry 発火) / 未知 id で role=status |
| `DataTable.tsx:194-219,222-246` | **filter chips / selection bar を `effectiveStatus !== 'loading'/'error'` で gate** (批判レビュー: risk ではなく実コード確定欠陥、loading/error 時に bar が残る) |

- **p0Dependency**: persona switcher chrome 配置のみ (DevControls を同 PrototypeModeLabel 近傍に置くため P0 chrome 確定後)。store substrate 非依存 (非同期を store 外に閉じ P0 reducer/persist と衝突しない)。P0 B3 後の口座開設 5 件は rows が useCases() 由来で自動追従。
- **store contract**: **変更ゼロ** (本設計の中核)。loading/error は store domain state ではなくデータ取得の非同期性。ViewProvider の in-memory flag + useListData hook に閉じ S8 境界 + P0 SCHEMA_VERSION bump と直交。
- **判断 gate**:
  - **トグル UI 配置 [as-built P1-5: (c) 採用]**: (a) TopBar DevControls / (b) PrototypeModeLabel tooltip 畳み / (c) **URL query (hidden seam、`useListData`、採用)**。**visible DevControls (a) は不採用** (TopBar 混雑回避、CR)。**本 §3.5 中の DevControls (TopBar 配置) 記述 (file:line 表 / p0Dependency / 検証行) は未採用 plan として読み替える** — 実装は §1.0 の P1-5 closure 注記 (`?demo` seam) が SSOT。
  - **error cause 文言**: 'タイムアウト (mock)' / '接続エラー'。JP-only + disclaimer 整合。
  - **not-found icon [as-built: 許容]**: truly-empty の Inbox icon を not-found でも使用 (variant 追加せず)。3 route browser proof で誤誘導なしを確認。
  - **mock default**: **OFF 推奨** (現 demo 体験不変、toggle 時のみ可視) / 軽 latency default (本物っぽさ、ただし demo もたつき)。
- **検証**: check:all green (DevControls/ErrorState 再試行 button が check:no-op pass、**ただし新 input/div は behavioral test が wiring gate**) / datatable.test loading/error reachability / detail not-found role=status + bespoke div 不在 / negative grep (NotFound 関数 0 / permission-empty 0) / Playwright (遅延 ON→skeleton / 失敗 ON→ErrorState+再試行 / 未知 id→role=status、**loading/error 時に filter chips・一括操作 bar 非表示**) / P2B-4 / P0 B3 後 regression (rows が UC-BO-02 5 件反映)。
- **dependsOnP1**: なし。**effort**: AI=M / review=S / judgement=med。
- **risks**: 非同期層の Tech Debt 化 (useListData signature 固定で差し替え面 1 hook 限定) / persona switcher chrome 衝突 / default ON で demo もたつき / truly-empty 流用の意味論ずれ。
- **reconcile**: audit §4 state-coverage + §7 #13 に 1:1。P0 plan 重複なし (P0 は B1-B4+flywheel+sendback+reset+status の 8 項目)。detail 3 画面の not-found 置換は P0 detail 変更後に積層 (file-level 衝突最小)。

---

### 3.6 P1-6 — DocumentViewer/ReconcilePanel 行 keyboard selectable + ProcessSelector dropdown Esc/roving

**根本原因**: 3 つの keyboard/ARIA 欠落。(1) DocumentViewer.tsx:78-94 paper row が `<div onClick>` で role/tabIndex/onKeyDown 無し → 左 PDF↔右 field ハイライトが keyboard 不到達。(2) ReconcilePanel.tsx:47-53 の要確認カードが `<div onClick>` で keyboard 不能 (対照: 確認済カード :109-121 は既に `<button>`)= 最も操作が必要な要確認カードだけ keyboard 不能の保護逆転。(3) ProcessSelector dropdown が Esc/outside-click/roving 全欠落 + role=option を button にネストする invalid ARIA。Modal.tsx:66-93 が Esc close + cleanup の先例。

| file:line | 変更 |
|---|---|
| `DocumentViewer.tsx:78-94` | clickable row に role=button + tabIndex=0 + onKeyDown (Enter/Space, preventDefault) + aria-pressed。clickable=false は role 付けない |
| `ReconcilePanel.tsx:47-53` | open カードに role=button + tabIndex + onKeyDown + aria-pressed。内側「対応」button は stopPropagation 済 → keydown は `e.target===e.currentTarget` 限定で二重発火防止。確認済カードは不変 |
| `ProcessSelector.tsx` | (a) useEffect で document keydown (Esc→close+trigger focus) + mousedown outside-click (Modal pattern 踏襲) (b) roving (activeIndex + ArrowUp/Down/Home/End + Enter/Space) (c) option を `<li role=option tabIndex aria-selected onClick onKeyDown>` 直化 (button ネスト排除)。**selected の置換は P1-1 scope なので触らず process は useView に委譲、初期 activeIndex を useView().process に合わせる** |
| `a11y/keyboard-a11y.test.tsx` (新規) | user-event で keyboard 駆動 (DocumentViewer/ReconcilePanel Enter 発火 + ProcessSelector roving/Esc/outside-click + jest-axe open violations 0) |

- **p0Dependency**: なし (presentational 改修)。ただし P0 W3 が ReconcilePanel :119 を humanValue 表示に変えるため、同 file 衝突回避なら P0 W3 後に着手が clean。DocumentViewer は P0 計画に登場せず衝突ゼロ。
- **store contract**: なし。check:no-op は `<button>` のみ対象で div→role=button を flag しない。
- **判断 gate**:
  - **ProcessSelector ARIA pattern**: (A) listbox+option(button nested) 最小改修 / (B) li 直化で invalid nesting 構造解消 / (C) combobox role まで。**推奨 (B)** (AR2 指摘を根本解消、check:no-op 影響最小)。(C) は overkill。
  - **interactive 表現**: role=button div / `<button>` 置換。**推奨 div+role=button** (既存 visual parity 維持)。
  - **P0 W3 編集順序**: Wave 3 後着手で :119 衝突ゼロ。
- **検証**: check:all green / keyboard-a11y.test (3 component の Tab focus + Enter/Space 発火、ProcessSelector roving/Esc/focus 復帰、jest-axe 0) / negative grep (onClick div で role 未付与 0 / ProcessSelector に addEventListener+removeEventListener pair) / Playwright keyboard 目視 (CaseDetail で行 focus→Enter ハイライト連動、TopBar selector Tab→open→Arrow→Esc) / P2B-4。
- **dependsOnP1**: `P1-1-process-selector` (selected を useView 化した後に a11y 層を載せ、roving activeIndex と process の同期ずれ回避)。**effort**: AI=M / review=M / judgement=med。
- **risks**: P1-1 と同一 onClick setter/open 周辺を編集 (P1-1 先行で merge 衝突回避) / ARIA pattern 未確定で着手すると roving 書き直し / div→role=button の二重発火 (target 限定) / focus ring が off-token を持ち込まない / Space scroll は preventDefault。
- **reconcile**: audit §3.5 SC1 + AR2 を 1:1 解消 (#14)。14 画面 screen-level axe (P2、W3) とは別レイヤ (補完)。canonical-design-spec §8 keyboard 行追記は AR1 (P1-4) の SSOT 明文化と pair。

---

### 3.7 P1-7 — Observatory drill 導線 + 案件横断監査台帳 〔judgement gate item〕

**根本原因**: (1) Observatory が外向き drill link を持たず monitoring が dead-end (`Observatory.tsx:130` case ID が plain span、:199-211 台帳行 / MetricVsThreshold KPI 行が非リンク、唯一の Link は :247 /proposals)。(2) 監査台帳が単一 case 固定 (`mock-observatory.ts:50` OBS_CASE_ID + :56-71 OBS_LIFECYCLE/LEDGER が CASE-2026-0142 1 件、案件選択/検索/期間/actor/action 絞り込み/pagination 不在)。DataTable は free-text search input を持たない。

| file:line | 変更 |
|---|---|
| `mock-observatory.ts:50,56-71` | 単一 OBS_LEDGER → caseId/workflowName を持つ CROSS_LEDGER (P0 B3 の 13 業務 case + lifecycle flatten)。OBS_CASE_ID 固定参照を「選択中 case」へ。**P0 lifecycle SSOT と二重定義せず派生 selector で flatten** |
| `Observatory.tsx:130,199-211,247` | (a) case ID span を /cases/{id} Link、台帳行に rowHref、未達 KPI 行に /agents/{id} drill (b) 監査 ledger を DataTable (案件選択 + workflow + 期間/actor filter + pageSize + free-text 検索) に置換 (c) P0 Gate5(ii) lineage view と座席整合 |
| `MetricVsThreshold.tsx:12-24,66-83` | MetricRow に optional agentHref。row が持つ時のみ Link 化 (未達 KPI を Agent へ)。tone/severity と別軸 prop |
| `DataTable.tsx` | optional searchPredicate + 検索 input、もしくは **Observatory ローカル検索で DataTable 不変** (JG-2 で選択) |
| `mock-observatory.ts (LedgerEvent 型)` | caseId/workflowName 加法追加。期間絞り込みは ts 文字列 slice 比較 (Date UTC parse 月境界ずれ回避) |
| `routes.test.tsx` | drill (台帳→/cases, 未達 KPI→/agents) + 案件横断 (選択切替/検索 filter/pagination) + lineage 協調 |

- **p0Dependency**: 強依存。(1) 口座開設 case 正規 CASE_LIST 入り (B3、横断台帳の母集合) (2) lineage view IA (Gate 5ii、同 tab 同居 → IA seat 協調、P0=lineage owner / 本項目=drill+台帳 owner) (3) mock-kpi SSOT (B3、未達 KPI drill anchor) (4) status→tone resolver + lifecycle (status-badge/B2)。独立部分: MetricVsThreshold agentHref + DataTable 検索は P0 非依存で先行可。
- **store contract**: 変更なし (read-only drill + 表示拡張)。台帳 rich event は mock dict に残し store からは order/status のみ派生 (S8 境界、台帳を store state に載せると永続化が証跡統制を誤認させる禁則)。
- **判断 gate**:
  - **JG-1 (台帳母集合)**: (a) 13 業務 case 全件 lifecycle flatten / (b) 代表 3-5 件のみ手書き。**推奨 (a)-lite** (全 case を行に出すが rich event は代表のみ詳細、他は 4 event 雛形 deterministic 生成)。デモ深さ vs mock 工数。
  - **JG-2 (検索 surface 置き場)**: (a) DataTable searchPredicate prop (P1-9 横断検索と DRY だが API 面拡大) / (b) Observatory ローカル (DataTable 不変、P1 単独完結)。**P1-2 が同 batch なら (a)、独立なら (b)**。
  - **JG-3 (lineage と台帳の IA seat)**: (a) 監査 tab を lifecycle/ledger/lineage の 3 view / (b) lineage 独立 tab (4 tab) / (c) ledger 内 section 同居。**typology A 型 3 tab lock との整合で P0 lineage owner と座席を先に確定 (stop 条件)**。
  - **JG-4 (期間/actor/action 粒度)**: (a) 3 軸 + 期間 selector / (b) actor/action は FilterChip、期間は省略。**推奨 (b) + '直近30日' 固定ラベル**、時系列は別 carve (固定日時 fixture では data shape 不足、未来日矛盾を継承)。
- **検証**: check:all green / negative grep (OBS_CASE_ID 直書き 0 / 台帳行に rowHref / 未達 KPI に agentHref) / off-token hex 0 + JP-only (英語 schema 値は監査 raw ledger sanctioned 例外、見出しは P2 G8/G9 で和訳) / Playwright (台帳 row→口座開設 detail、未達 KPI→Agent detail、案件 selector/検索/pagination 動作) / lineage view と台帳の chrome 両立 / __tests__ drill/検索/選択切替。
- **dependsOnP1**: `P1-1-process-selector`、(JG-2a 採択時) `P1-2-search-notify`。**effort**: AI=M / review=M / judgement=high。
- **risks**: lineage seat 衝突 (JG-3 未確定で competing chrome、typology lock 崩壊 → P0 lineage owner と先に確定) / 母集合全件で lifecycle mock 工数膨張 (代表 + 雛形で抑制) / store-derived で rich event を store 載せると S8 違反 / 期間絞り込みは別 carve / drill 先が B2 修正前だと法人住所変更届に着地 (B2 後に drill 有効化) / DataTable searchPredicate が他 consumer API 面拡大。
- **reconcile**: audit §7 #15 (M3 / §5a) に 1:1。P0 = lineage view owner (Gate 5ii)、本項目 = drill + 台帳 owner。**Observatory.tsx 編集を P0 W3 (lineage/reset) → P1-W5 (P1-1 process) → P1-W7 (P1-7 台帳) で直列化 (並行不可)**。本番 lineage graph R3-7 とは別 layer。

---

### 3.8 P1-8 — before/after (現行登録値→変更後) を ReconcilePanel に表示

**根本原因**: 変更系業務で「現行登録値→変更後」が CaseDetail/ReconcilePanel に表示されず、reconcile が「AI 値 vs 申請書類」の 2 軸のみで「正しく変わるか」を支援しない。3 死蔵: (1) mock-case-list.ts:18 の change?{field,from,to} が detail で from を捨てる (mock-case-detail.ts:143-153 が change.to のみ aiValue に注入)。(2) types.ts:313 masterValue は契約上「現在の登録値」だが値が旧値を保持していない。(3) ReconcilePanel.tsx:62-71/118-119 が before/after の表示口を持たず humanValue/masterValue/previousValue を読まない。

| file:line | 変更 |
|---|---|
| `types.ts:308-320` | FieldReview に previousValue?: string (現行登録値) を加法追加。masterValue (突合マスタ参照) と意味論分離。JSDoc 明記 |
| `mock-case-detail.ts:143-153,193-243` | baseFields に change 伝搬、change.field 一致 field に previousValue: change.from 注入 (変更対象のみ)。canonical 0142 の新住所/ビル名に旧値手書き。**口座開設 (新規登録) は previousValue 省略 = B2 builder と協調** |
| `ReconcilePanel.tsx:62-71,118-119` | (a) 要確認カードに previousValue 有る field の「現在の登録値 → 確定値」行追加 (表示値 = `humanValue ?? aiValue` で P0 B1 と整合) (b) 確認済行 :119 に inline 併記。矢印は lucide ArrowRightIcon + fg-tertiary (P1-4 token)。**P0 B1 と同一行 :119 を編集するため統合実装必須** |

- **p0Dependency**: P0 B1 (override-persist) に強依存。B1 が ReconcilePanel:119 を `humanValue ?? aiValue` に変え CaseEntity.overrides を入れる → before/after の右辺は B1 の確定値表示と同一 source (B1 無しだと右辺が AI 値固定で override 反映されず audit R1 再来)。P0 B2 (口座開設 builder) にも従属。
- **store contract**: 影響なし。FieldReview は mock dict の rich data で store 非載 (S8 境界)。右辺のみ P0 store overlay (overrides) 経由、左辺は完全に静的 mock 由来。
- **判断 gate**:
  - **gate-1 (data source)**: (a) **previousValue 新設** / (b) masterValue 再利用。**推奨 (a)** (masterValue を旧値に流用すると将来 3 者突合実装時に突合値と旧値の二重責務で破綻)。
  - **gate-2 (口座開設方針)**: (a) previousValue 省略 (新規整合) / (b) '(新規登録)' ラベル。**推奨 (a)、ただし P0 B2 の口座開設 builder と同時確定**。
  - **gate-3 (確認済行レイアウト)**: (a) 同行 inline / (b) 値セル 2 段。**推奨 (a)** (density 維持)。screenshot 後 sign-off。
- **検証**: check:all green (button 新設なしで自動 pass) / detail-routing.test (0142 新住所が previousValue 持つ / 口座開設は持たない) / negative grep (mock-case-detail で change.from 参照 0→1+ / ReconcilePanel に旧値 hardcode 0) / design grep (off-token hex 0 / ArrowRightIcon / fg-tertiary) / screen evidence (0142 で現行登録値→変更後、P0 B1 override 後に右辺更新、口座開設は非表示)。
- **dependsOnP1**: なし。**effort**: AI=S / review=S / judgement=low。
- **risks**: P0 B1 と同一行 :119 編集衝突 (同 Wave 統合実装、右辺は B1 ロジック再利用) / masterValue 流用で将来衝突 (新設で回避) / 口座開設意味論 (B2 が SSOT) / scope creep (previousValue 持つ変更系 field のみ併記)。
- **reconcile**: audit §7 #16 (I1)。P0 plan は before/after を status-badge 文脈で P1 carve (line 79/203/232)。P0 = humanValue 確定値 (右辺)、本 item = previousValue 現行登録値 (左辺) で相補。同一 file 共有のため **P0 B1 と同 Wave (P1-W7 で P0 W3 後) で統合実装**。

---

### 3.9 P1-9 — TypeScript strict + noUncheckedIndexedAccess 有効化 + test typecheck 包含

**根本原因**: `tsconfig.app.json` が strict 系を一切設定せず linting 系のみ (現状 app baseline 0 error)。**実測 (2026-05-30、`tsc -p tsconfig.app.json --noEmit --strict --noUncheckedIndexedAccess`)**: **strict+NUIA 結合 = app 39 error** (内訳 TS18048×24 [NUIA の null-check、store/hooks.ts 集中] + TS2322×11 + TS2532×3 + TS2345×1 [結合時に表面化する strict 系])、**test config (`tsconfig.test.json`) = 107 error (W0 前、app+test 合算)**。pattern: dict map `s.caseOrder.map(id=>s.cases[id])` が `(T|undefined)[]` / array-index `STATUSES[i%len]`。reducer.ts は既に NUIA-clean (早期 return guard が canonical)。**訂正注記**: 旧 probe の「NUIA 単独 24 / strict 単独 0」は per-flag 単独計測値。**gate target = app 39→0 (Stage1、W0 完了) / test 68→0 (Stage2、W1-A 完了。107 は W0 前値、app 39→0 修正で test config 由来 error が 68 に減)**。tsconfig.test.json は `tsc -b` build graph 外ゆえ test 型は別途検査要 (Stage2 で `check:types:test` を check:all へ追加済)。

| file:line | 変更 |
|---|---|
| `tsconfig.app.json:23-27` | strict: true + noUncheckedIndexedAccess: true 追加。strict は strict-clean で追加修正不要。exclude (legacy/__tests__) 不変 |
| `store/hooks.ts` (15 error) | dict map を `.flatMap(id=>{const c=s.cases[id]; return c?[c]:[]})` or type-guard filter で narrow。reducer 早期 return pattern と一貫 (non-null `!` 禁止)。useHubModel も 1 回 narrow で下流解消 |
| `mock-case-list.ts:45-55` | index-access を tuple `as const` + 非空 invariant or 明示 fallback で確定 |
| `mock-case-detail.ts:205` | splice 結果を guard (`const [moved]=...; if(moved) ...`) |
| `Modal.tsx:80-81` | focusable[0]/[length-1] を `.at()` + guard |
| `pages/{CaseDetail,ProposalDetail,Proposals,Agents}.tsx` | hooks.ts narrow で連鎖解消、残る index guard を明示 |
| `tsconfig.test.json` + `package.json` | check:types:test (`tsc -p tsconfig.test.json --noEmit`) を check:all chain に挿入 (lint→no-op→types:test→test→build) |
| `__tests__/store/store.test.ts` (+ detail-routing/hub-model) | dict 直 index を throw helper getCase() 経由 (不在は test 失敗を維持)。P0 が store.test 大改訂と同時に guard 化 |

- **p0Dependency**: P0 Wave1 (store hot-file 統合) に強依存。P0 が新 selector (useFlywheelLineage/useCurrentActor) + 新 dict (overrides/actors) で NUIA index-access を新規導入。P1-9 を先行すると hooks.ts narrow が P0 書き換えで上書き競合。フラグ ON 自体は **G-A 採択時 P0 W1 冒頭に前倒し** すると P0 を最初から NUIA-clean で書ける利点。test typecheck 包含は P0 store.test 大改訂後が安全。
- **store contract**: runtime 不変 (型注釈厳格化のみ、emit 0)。型レベルで 2 不変条件を codify: selector 戻り値が T[] (undefined 混入なし) / persist drift 経路の index-access 強制 narrow (white screen 化リスクの型側塞ぎ)。
- **判断 gate**:
  - **フラグ ON タイミング**: (A) **P0 W1 冒頭前倒し** (二重編集ゼロ、P0 PR diff 膨張) / (B) P0 後独立 PR。**推奨 (A) だが P0 PR scope 肥大の許容は user (P0-W0 で確定)**。
  - **test typecheck 手段**: (A) **新 script check:types:test を check:all 追加** (最小可逆) / (B) composite 化 + references (build graph 再編)。**推奨 (A)**。
  - **narrow 方式**: type-guard filter / flatMap。codebase 既存 pattern (reducer 早期 return) 一貫性優先。
  - **test guard 方式**: (A) `!` non-null / (B) **throw helper** (不在 = test 失敗維持)。**推奨 (B)**。
- **検証**: 実測再現 (strict+NUIA で **app 39 error → guard 後 0**、Stage1) / `npm run build` clean build 0 error / check:types:test (**test config 68→0**、Stage2 = W1-A 完了、107 は W0 前値) / check:all green / negative grep (`as any` / 不要 `!` 新規混入 0) / legacy 不変 (strict-exempt) / probe artifact cleanup。
- **dependsOnP1**: なし。**effort**: AI=M / review=S / judgement=med。
- **risks**: P0 hot-file 競合 (P0 後積層 or フラグ ON のみ前倒し) / P0 が新 NUIA error 持ち込み (フラグ前倒しで NUIA-clean 強制) / test guard 意味喪失 (throw helper で regression 維持) / フラグ ON が P2 実装摩擦 (品質向上の対価) / mock-case-list fallback 誤値 (tuple invariant で回避)。
- **reconcile**: audit §7 build-health (#17) + line 299/303 を統合 (二重計画回避)。P0 §6 の test TS resolution 扱いと相補 (P0=action 署名、P1-9=型検査範囲拡大)。p2b4-gate §4c (build green) に型安全 gate を上乗せ。

---

## 4. P2 batched backlog

> **方針**: P2 (audit §4 minor 79 件) は **batched fix-group** として group 単位 verification gate で消化し、deep-plan しない。domain 別に shared root cause でクラスタリングし、各 group は 1 つの sharedFix + 1 つの gate を持つ。**最終 batch で minor 79 件 ↔ batch の cross-walk count gate を張り取りこぼしを防ぐ** (批判レビュー should-fix)。

### 4.0 W3 必須昇格群 (production-ready mandatory、optional backlog にしない)

> P2 のうち以下 6 項目は **production-ready の必須要件** であり、W3 で必ず close する (group gate を skip 可能な optional backlog 扱いにしない、2026-05-30 昇格)。配置:
>
> | W3 必須項目 | 配置 / 由来 | 完成 gate |
> |---|---|---|
> | **reversal** (C3 反映済の訂正/取消) | audit §7 P2 / C3 / 旧 overlay W3b。CaseDetail affordance + reducer reversal action + 「前進のみ→可逆」state machine (新 route なし) | reversal action store.test + 不可逆 guard test |
> | **manual entry** (C4 手動起票) | audit §7 P2 / C4 / 旧 overlay W3b。Cases に「新規案件作成」+ 全項目手入力 form (AI 障害時の業務継続)。route 化 (typology 15) vs modal (14 維持) は着手時 decision | draft 作成 test + (route 時) typology 再同期 |
> | **modal hardening** | §4.2 **G5** (inert/scroll-lock + unsaved-guard) | scroll-lock + dirty-dismiss block test |
> | **multi-tab** (session continuity) | audit §8 / 旧 overlay W3c。StoreProvider に storage event listener + last-write-wins | storage event 反映 test |
> | **axe** (14 画面 axe smoke) | §4.2 **G9/G11** (現状 2 component → 14 route 網羅) | axe 0 violation × 14 route |
> | **@media print** | audit §8 / §4末 placement (4) / 旧 overlay W3c。証跡/document の print stylesheet | print stylesheet 適用確認 |
>
> SLA real computation (elapsedLabel static → 受付 datetime base 実算出、audit §3.2 SLA scope-0 の本実装) も W3 で本実装 (旧 overlay W3b)。残りの §4.1-4.3 batch は通常 P2 (W3 内で随時消化)。

### 4.1 domain: nav-content-queue

| batch | 含む minor (代表) | sharedFix | gate | 依存 | effort |
|---|---|---|---|---|---|
| **G1** | CaseDetail breadcrumb 中段非リンク (3 件、同根) | CaseDetail.tsx:106 span → Link、checker 由来で /approvals + ラベル出し分け | span 0 + Link 1 / 目視出し分け | none | S |
| **G2** | sidebar active 誤判定 + 未知 path NotFound (2) | Sidebar:58 を ?view=checker 参照で active 修正 + App.tsx:38 `Navigate to=/` を NotFound 画面に | 目視 + Navigate path=* 0 | P0 Gate4 弱整合 | S |
| **G3** | list URL query 同期 (filter/sort/page/scroll) + detail mode 双方向同期 (2) | UI 状態を useSearchParams 派生に | back/戻りで状態保持 + mode reload 復元 | P0 B4 (mode→persona)、filter は独立 | M |
| **G4** | queue default (自分の担当) + 過去案件検索 + 横断検索 screen + zero-result + chrome (5) | searchQuery consumer 化 + DataTable initialActiveFilters + currentActor owner default | 検索 filter + zero-result + default 担当 | P0 Gate4 currentActor、**P1-2 と overlap** | L |
| **G5** | list header 件数/業務名 SSOT + pageSize 横展開 (3) | 業務名 rows 導出 + 件数 'N 件中 M 件' + Approvals/Proposals/Agents に pageSize | 件数整合 + pageSize grep | P0 B3 fixture、pageSize 独立 | S |
| **G6** | Hub agentTo 非対称 (1) | mock-hub.ts:74 UC-BO-02 agentTo を個別 AgentDetail へ統一 | agentTo:'/agents' 0 | P0 B2 弱依存 | S |
| **G7** | 未来日 (2026-05-31) 統一 (2) | Hub.tsx:71 + mock-observatory 全 timestamp を基準日以前へ | active src で 2026-05-31 0 | P0 B3 弱依存 | S |
| **G8** | 業務語化 / 英語残り / 状態非依存断定 (6) | PrototypeModeLabel copy 実態化 + ProposalDetail footer status 出し分け + Manual 確認 和文 + LEDGER_HEADERS 和訳 + %統一 | 可視 label 英語 0 + footer 断定 0 | P0 sendback footer (G8 一部) | M |
| **G9** | APPROVAL_LIST dead code + orphan id (1) | APPROVAL_LIST 削除 (store 由来で十分) + 承認者名 factory 一本化 | APPROVAL_LIST 0 + orphan 0 | P0 B4 actors.ts SSOT | S |

### 4.2 domain: design-a11y-state

| batch | 含む minor (代表) | sharedFix | gate | 依存 | effort |
|---|---|---|---|---|---|
| **G1** | lucide Icon-suffix + emoji ✓ 除去 (2) | 4 component の非 suffix import を alias 化 + Observatory:163 ✓ 除去 + §8 grep gate 追加 | **identifier 単位 grep** (multi-line 閉じ括弧の false positive 回避、批判レビュー) | P0 W3 後に最終実行 | S |
| **G2** | Trust tone + toast 色 + §4 spec 矛盾 (4) | TrustLevelBadge resolver + 共有 Toast tone 引数化 + §4 honest update | tone='primary' literal 0 / toast neutral-alert | P1-4 同 sprint、Toast は G6 共有 | M |
| **G3** | state 網羅 (Loading/Error 配線 + EmptyState 死蔵 + 共有 not-found) (6) | dev-state seam + 4 list status/onRetry + detail を EmptyState へ + Observatory 空状態 | status= ≥4 / NotFound 0 / 空配列分岐 | **P1-5 melt-in ✓** (detail→EmptyState・permission-empty 除去 done 2026-05-30)、Observatory 空状態は W3 | M |
| **G4** | 読めない/clip される data surface (5) | truncate 全文化 + MetricVsThreshold 横スクロール + CaseDetail 2-pane overflow + breakpoint | 360/768/1024px で clip 0 | **P1-8 と ReconcilePanel 同 sprint** | M |
| **G5** | Modal hardening (背景 inert/scroll-lock + unsaved guard) (2) | Modal.tsx に body lock + inert + confirmOnDismiss | scroll-lock + dirty-dismiss block test | P0 reset-confirm/FieldActionModal 後 | S |
| **G6** | 共有 Toast 集約 + 永続 aria-live + MiniTrend SR + tab semantic (3) | 永続 aria-live region + role=tablist/tab + aria-pressed | inline toast 0 / role=tab present | Toast は G2 共有、tab は P0 Gate5ii 後 | M |
| **G7** | PrototypeModeLabel 開示 copy 整合 (2、同箇所) | :50 copy を検索/通知のみ未実装に + touch trigger | '一括操作/フィルタ' 文字列 0 | P1-2 後に最終 copy | S |
| **G8** | JP-only / 英語 schema / 表記混在 / 未来日 (5) | LEDGER_HEADERS 和訳 + Manual 和文 + 0-1 小数を % + 未来日統一 + footer 断定 | schema 見出し 0 / 未来日 0 | footer は P1 forward gate、% は P0 B3 後 | M |
| **G9** | build-health (strict/NUIA/test typecheck/14画面 axe/code-split) (5) | tsconfig 強化 + check:types:test + 14 route axe + React.lazy split | check:all に全 gate green | **P1-9 と統合済**、NUIA は P0 後 | M |

### 4.3 domain: observatory-data-build

| batch | 含む minor (代表) | sharedFix | gate | 依存 | effort |
|---|---|---|---|---|---|
| **G1** | Observatory KPI を store 派生に統一 (4) | mock-kpi selector + useHubModel daily summary + HUB dead 値削除 | 分母/total/dist literal 0 | P0 W2 (mock-kpi SSOT) | M |
| **G2** | 監査を case-id keyed + 選択/検索/期間/空状態 (4) | mock-observatory を case-id dict 化 + filter predicate + EmptyState | OBS_CASE_ID 直参照 0 / 空状態 | P0 Gate5ii、**P1-7 に積層** | L |
| **G3** | ProcessSelector → Observatory scope 連動 (1) | ProcessSelector state 上げ + Observatory filter | useView hit 1+ | P0 Gate4、G2 と predicate 共有 | M |
| **G4** | 証跡台帳 export を client-side 実出力化 (1) | Blob + anchor download | Blob/createObjectURL hit | G2 後 (フィルタ後台帳 export) | S |
| **G5** | case-id 衝突・状態矛盾を別 id 化 (4) | OBS_CASE_ID を完結 historical 別 id + timestamp 基準日統一 | CASE-2026-0142 完結 hardcode 0 | P0 B2 + Gate5ii | S |
| **G6** | ProposalDetail footer を p.status 連動 + forward gate (3) | footer status gating + MetricVsThreshold 閲覧条件 + toast 実結果 | p.status 参照 + 無条件 toast 0 | P0 W1 (proposal status guard) | M |
| **G7** | 提案層 SoD (mode 自己切替禁止) + AgentDetail 未達 footer 動線 (2) | mode を persona 固定 + PROP-031 link + samples kpi 可視化 | mode 自由切替 0 | P0 Gate4a + B2 relatedProposals | M |
| **G8** | APPROVAL_LIST dead code + orphan (1、G9 nav と同件) | APPROVAL_LIST 削除 + store 一本化 | APPROVAL_LIST 0 | P0 W2 (B3 CASE_LIST 正規化) | S |
| **G9** | Observatory 英語 schema 和訳 + emoji ✓ + lucide suffix (3) | LEDGER_HEADERS 和訳 + ✓ 除去 + suffix 統一 | 英語見出し 0 / emoji 0 | P0 state-coverage 復活後 | S |
| **G10** | TypeScript 型 guardrail (strict/NUIA/test typecheck) (3) | **P1-9 と統合 (二重計画回避、本 batch は cross-walk 注記に縮退)** | P1-9 gate に委譲 | P0 W1 | M |
| **G11** | 14 画面 axe smoke + route-level code-split (2) | a11y smoke を 14 route 網羅 + React.lazy | axe 0 + chunk 分割 | P0 + 全 P2 design-a11y 後 (最後) | M |

> **coverage-reconcile (最終 closure、3 軸)**: 112 findings の閉鎖を 3 機構の count gate で機械確認する:
> 1. **major 33 (finding 軸)** ↔ §1 itemKey↔§7 cross-walk (P0 8 + P1 9 work-item) で全 hit。
> 2. **minor 79 (finding 軸)** ↔ 本 §4 batch itemTitle の cross-walk 表で全 79 件がいずれかの batch に hit (意図的 defer は scope-out 明記)。
> 3. **全 finding (screen 軸)** ↔ §1b per-screen ledger の各画面 verification で「どの画面のどの gate で閉じるか」を併記し、画面横断の漏れを検出。
>
> **未配置リスク minor を明示配置**: (1) sent-back→ready 遷移未実装 (reducer.ts:60-61、backend step ゆえ R0 では disclaimer or scope-out) → nav-content-queue / (2) sidebar user-area 非インタラクティブ div (Sidebar:117-125、P0 persona switcher と co-locate) → P0 Gate4 / (3) ヘルプ/用語集導線 不在 (legacy 隔離) → nav-content-queue / (4) @media print → design-a11y (**§4.0 W3 必須昇格群**)。

---

## 5. master plan rebaseline 注記

**本 roadmap が新 baseline となる。** locked master plan (`~/.claude/plans/ai-backoffice-ai-virtual-muffin.md` v1.1.2、Day 1-22 → Session 4 2026-06-12) と CLAUDE.md (`prototype-redesign`) の以下を supersede する:

| locked plan / CLAUDE.md の前提 | 本 roadmap の supersede |
|---|---|
| **9 画面 lock** (ia-overview-v2 / screen-contracts / coverage-matrix) | **P1-2 で 9→11 (検索/通知、W2b ✓)、P1-3 (IA scope=(a)) で 11→14 (業務責任者 landing + config-approvals + escalations の 3 画面)**。typology lock を **A×3/B×8/C×3** へ更新 (W2b で expansion note 付与済、W2c で 14 relock) |
| **KPI 分母 (4 file drift)** | P0 B3 で mock-kpi.ts SSOT 化 (UC-BO-02 分母 980 統一)、P2 observatory G1 で consumer 配線 |
| **業務 (法人住所変更中心)** | P0 B3 で口座開設 (UC-BO-02) 5 件を正規 CASE_LIST 入り (業務追加) |
| **承認者 (Business Approval) の画面化 = scope-out** (CLAUDE.md「route/page/smoke 対象外」) | **frame C で scope-out 解除**。P1-3 で業務責任者専用 landing/queue/config承認/escalation 受信を新設 (業務追加) |
| **polish target 9 画面 ALL 95% equal** | 新 5 画面の polish tier (95% equal に含めるか prototype-tier 低-fi 許容か) を **P0-W0 で master plan rebaseline と pair 確定** (§3.3 JG-1) |

**実装手順上の必須条件** (CLAUDE.md「Plan に書かれていない変更は禁止」):

1. **P0-W0 で master plan を update** (または本 roadmap を新 baseline として lock 差し替え)。画面追加 / KPI 変更 / 業務追加 / 業務責任者 scope-out 解除を plan 本文に反映。
2. rebaseline 承認**前**に P1-2/P1-3 (画面追加を伴う item) に着手すると規律違反。**各 item の risks に「master plan rebaseline 未承認なら着手禁止」を hard precondition として co-locate** (批判レビュー should-fix)。
3. 契約 doc 群 (ia-overview-v2 / screen-contracts-v2 / coverage-matrix-v2 + CLAUDE.md) の typology lock を画面追加と同時更新し count gate で整合 (1 doc だけ更新で次サイクル監査が画面数矛盾を再検出する drift を封じる)。

---

## 6. 検証 gate & リスク & 工数サマリ

### 6.1 各 wave の検証 gate (check:all + screen evidence)

各 wave 末に `npm run check:all` (lint + check:no-op + check:types:test [P1-9 後] + test + build) green を必須とし、red なら次 wave 着手禁止。**check:no-op は `<button>` のみ対象 → 新規 input/NavLink/div role=button は behavioral test + screen evidence が唯一の wiring gate** (批判レビュー)。

| wave | check:all 焦点 | screen evidence (Playwright MCP, port 5174) |
|---|---|---|
| P0-W1 | store.test 新署名 / exhaustive never 全 9 action | (UI 配線は W3) |
| P0-W2 | 証拠アンカー整合 / 手書き分母 0 grep | 口座開設 5 件 + KPI 同一分母 (3 画面) |
| P0-W3 | check:no-op (新 button) / P2B-4 full + **R7 (P1-4 後) を含めるか W3 前に確定** | B1-status の 8 項目 + persona 切替 demo-script |
| P1-W4 | strict+NUIA app 39→0 / fg-subtle negative grep 0 / R7 green | 4 画面で tertiary 視認 + hierarchy 維持 |
| P1-W5 | useView 0→5+ / UC-BO-02 で 5 件 / detail NotFound 0 | selector 切替で 4 list 連動 + **`?demo` hidden seam で loading/error 到達** (DevControls 不採用、as-built) + detail not-found→EmptyState 統一 (P1-5-remainder ✓ 2026-05-30) |
| P1-W6 | 契約 3 doc 11 画面 count gate / keyboard axe 0 | 検索→/search→zero-result / 差戻し→赤ドット→通知 / keyboard roving / **既存 9 画面 chrome regression** (TopBar 検索 input・ベル追加後に 9 routes 無崩れ render) |
| P1-W7 | store.test (SoD no-op/escalate) / typology 14 画面 | persona 切替で業務責任者 queue / 台帳 drill / before-after / demo-script 2 journey / **既存 9 画面 chrome regression** (persona switcher 追加後の余白・list 密度劣化なし) |

> **regression の二層**: render-level の 9 画面 no-white-screen は `routes.test.tsx` が check:all (test) で全 wave 自動 gate 済。上表の手動 visual evidence は変更面 + **chrome 変更 wave (W6/W7) の既存 9 画面 visual 再確認**のみを対象とし、全 wave 全画面 screenshot は課さない (過剰 gate 回避、axe 網羅は P2 G11)。

### 6.2 cross-cutting risk

1. **SCHEMA_VERSION 二重 bump (最大)**: P0 W1 が 2→3 を 1 回集約するが P1-3 (entity field) + P1-2 (readNotificationIds) が同 persist 層を触る。**P0-W1 に co-locate / 同 bump 相乗りで封じ済**。bump 含む build の本番反映を **6/12 demo 当日と別日に置く gate を P0-W1 gateBeforeNext に追加** (旧 v2 localStorage が field 欠落で読まれ overlay undefined → 白画面化、批判レビュー)。
2. **Observatory.tsx hot-file 直列化**: P0 (reset/lineage) + P1-1 (process) + P1-7 (台帳) + P2 observatory G1-G5/G9 が多重編集。**P0-W3 → P1-W5 → P1-W7 → P2 の厳格直列 + JG-3 を P0 lineage owner と先に確定する stop 条件**。
3. **exhaustive never の両刃性**: P0 6 + P1-3 3 = 9 action を union に足すため Wave1 で全 case 網羅の最終確認必須。P1-9 (test typecheck) が _exhaustive 効果を test に及ぼし相補だが P1-9 を P0 後に置くため W1 中は vitest runtime でしか落ちない (G-A 前倒しで緩和)。
4. **S8 境界侵犯の再燃**: P1-2 検索 / P1-7 台帳 rich event / P1-8 previousValue を store 載せると types.ts:5-8 違反。**3 項目とも派生 selector / mock dict に閉じ store contract 非 touch を grep gate で機械検証**。
5. **judgement gate 集中で demo 詰み**: P1-2/P1-3/P1-7 に judgement-high 集中。**着手前 articulate + persona switcher 挙動と pair 決定**。
6. **9→11→14 画面化が polish 規律と衝突**: 新 5 画面の polish tier を P0-W0 で確定 + typology lock 同時更新 + count gate。
7. **未来日 fixture (2026-05-31 > 2026-05-29)**: P1-7 期間 filter は固定日時で data shape 不足。**P1-7 から期間 carve ('直近30日' 固定ラベル)、実時系列は P2 G7/G8 が基準日へ統一**。
8. **TopBar chrome 混雑**: persona switcher (right) + ProcessSelector (left) + 検索 input/ベル (W2)。**P1-5 DevControls は as-built で不採用** (hidden `?demo` seam ゆえ chrome に dev affordance を追加せず、混雑要因から除外)。→ chrome 変更 wave (W6/W7) は §6.1 で既存 9 画面 visual regression を gate 化。

### 6.3 工数感 (AI coding agent 基準、AI work / human review / judgement)

| 群 | AI work | human review | judgement | 主 review 負荷 |
|---|---|---|---|---|
| P0 (8 項目) | ~M-L 集計 | M | high gate 集中 | B2 視覚 parity / B4 IA・demo-script |
| P1-1/4/5/6/8/9 (機械配線・token・型) | S-M 各 | S-M | low-med | P1-4 hierarchy 目視 / P1-9 narrow |
| P1-2/3/7 (画面追加・IA) | L 各 | M | **high** | 契約 IA 整合 / 業務責任者 polish tier / lineage seat |
| P2 (3 domain × G1-G11) | S-M 各 batch | S-M | low | group gate (deep-plan なし) |

**P0+P1 合計感**: AI work は集計 L 規模だが本質的難所は judgement gate の確定 (実装負荷ではない)。最大 review コストは P1-2/3 の契約 IA 整合 (3-4 doc typology lock 同時更新 + count gate) と P1-7 の Observatory hot-file 直列化。external waiting なし。risk は store hot-file + Observatory.tsx の同時編集衝突に集中するが exhaustive never + grep negative gate + 直列化が機械検出。

**推奨 sprint 区切り**:
- **Sprint A-D = P0** (W0 判断 → W1 store → W2 mock → W3 UI、p0-plan §8 継承)
- **Sprint E = P1-W4** (strict + contrast、機械的・低 risk、P0 直後の足場固め)
- **Sprint F = P1-W5** (ProcessSelector + state-coverage 配線)
- **Sprint G = P1-W6** (検索/通知 + keyboard、9→11 画面)
- **Sprint H = P1-W7** (業務責任者 + Observatory + before-after、11→14 画面、judgement-heavy)
- **Sprint I+ = P2 batched** (各 wave 後に group gate で随時)

### 6.4 Session 4 (6/12) までに現実的に入る範囲 / 後送りの線引き

> **判断基準**: demo の中核 message (「差戻しを次の正解手順に変える Flywheel」+ SoD + 突合修正 + 証拠アンカー) を観測可能にする最小集合を 6/12 前に、IA 拡張・観測性向上は demo 価値への寄与順で。

> **P1-W6/W7 着手前提 (3、いずれか 6/12 前に未確定なら当該 wave は自動的に 6/12 後へ倒す)**: (1) master plan rebaseline 承認 (P0-W0) / (2) JG-1 IA scope 確定 (§3.3) / (3) 新 5 画面 polish tier 確定 (§3.3 JG-1)。判断者 = user、timing = calendar 日付ではなく各 wave 着手前の gate-based (§3.0 と整合)。

| 区分 | 範囲 | 根拠 |
|---|---|---|
| **6/12 前 必須** | **P0 全 wave** (W0-W3) | demo 中核 4 系統 (Flywheel/SoD/突合修正/証拠アンカー) の観測可能化。これ無しでは demo 説得力が store 層で破綻 |
| **6/12 前 望ましい** | **P1-W4** (strict + contrast)、**P1-W5** (ProcessSelector + state-coverage) | strict/contrast は低 risk で品質底上げ。ProcessSelector 配線は「業務切替」という demo の基本操作を成立させる。state-coverage は demo 中に list が空/失敗しても破綻しない保険 |
| **6/12 後送り (推奨)** | **P1-W6** (検索/通知、9→11)、**P1-W7** (業務責任者/Observatory drill/before-after、11→14) | 画面追加を伴い master plan rebaseline + polish tier 確定 + 契約 3 doc 更新が前提。judgement-heavy で 6/12 前の確定が困難。demo は P0 の 9 画面で中核 message を伝えられる |
| **6/12 後送り (確定)** | **P2 batched backlog 全般** | production-ready polish。demo 中核に非必須。SCHEMA_VERSION bump を含む P1-3/P1-2 のデプロイは 6/12 と別日 |

**線引きの stop 条件**: P0 W3 の demo-script 実走 (入力者→承認者 persona 切替) が詰まらないことを 6/12 前の go gate とする。P1-W6/W7 は上記 3 着手前提 (§6.4 冒頭 bullet) のいずれかが 6/12 前に揃わなければ自動的に 6/12 後へ倒す。**IA gate 確定は P0 W3 demo-script go-gate と非依存ゆえ、IA 未確定でも 6/12 demo 自体は揺らがない** (frame C の production-ready 着地は demo 後 sprint で継続)。

---

**本 roadmap の主要ファイル**: 実装 root = `/Users/shinjifujiwara/code/active/backoffice-ai-v2/prototype-redesign/`。P0 詳細 = `p0-remediation-plan-2026-05-29.md`。基盤 hot file = `src/store/{types,reducer,persist,seed,hooks}.ts` + Observatory.tsx (直列化対象)。契約 = `00-shared/{ia-overview-v2,screen-contracts-v2,coverage-matrix-v2,canonical-design-spec,p2b4-gate-contract,process-selector-spec,reconcile-panel-spec,allowed-actions-and-state-transitions}.md`。reconcile = `production-remediation-plan.md` Change Log (audit 番号併記で 1 回追記)。master plan = `~/.claude/plans/ai-backoffice-ai-virtual-muffin.md` (rebaseline 対象)。
