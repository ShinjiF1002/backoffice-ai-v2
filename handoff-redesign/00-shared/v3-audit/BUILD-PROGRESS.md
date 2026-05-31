# v3 Build Progress (Phase 4 — remediation)

**実行 SSOT**: `V3-UPGRADE-PLAN.md` (7 wave) ／ **finding SSOT**: `final-ledger.json` (56) ／ **検証**: `npm run check:all` + `audit-v3-capture.mjs` (preview :4174 を現 working tree build で配信) + journey live walk。

## ハーネス運用メモ
- 監査ハーネス: `prototype-redesign/audit-v3-capture.mjs` (74-cell capture) + `audit-v3-probe.mjs` (probe helper)。`/tmp/bo-v3-audit/evidence/` = baseline (before)、`/tmp/bo-v3-audit/evidence-w1/` = W1 after。
- 再走手順: `npm run build` → `npx vite preview --port 4174 --strictPort` → `AUDIT_OUT=/tmp/bo-v3-audit/evidence-w1 node audit-v3-capture.mjs`。

## Wave 1 (P0 ×3)

| finding | 状態 | 検証 |
|---|---|---|
| **F-003** contrast token AA 化 | ✅ **完了** | `audit-v3-capture` の axe serious = **74/74 cell → 0/74 cell**。`check:all` green (212 test / build / design-gate 0 / lint 0)。 |
| **F-001** SoD actor identity 単一化 | ✅ **完了** | `check:all` green (**216 test**、selectors.test 4 追加) + live 検証: Approvals 行 `山田太郎 → 鈴木課長`、CaseDetail checker view `入力者 山田太郎`、旧 free-name `田中部長` 消滅、Observatory `OBS_SOD` と 3 surface 一致。 |
| **F-002** Observatory store-truth 化 | ✅ **完了** | `check:all` green（**221 test**、audit-events.test 5 追加）+ live 検証: checker で承認→Observatory 台帳に「承認者承認（鈴木課長）」が append（JP action label は live event 固有 ＝ wiring 実証）+ 台帳 disclaimer 表示。**全 74 cell axe serious=0 維持**（regression なし）。 |

### F-001 実装内容 (完了)
- 新規 `src/store/selectors.ts` `resolveCaseActors(entity, fallback?)` → `{ inputterActorId, inputterName, approverActorId, approverName }`。入力者 = `actorById(inputApprovedBy)`、承認者 = checker actor 固定（鈴木課長）。data 層を import せず structural fallback 型でクリーン layering。
- `Approvals.tsx`（row mapping）/ `CaseDetail.tsx`（L110）を resolver 経由に統一。`actorById` import を撤去。
- `src/__tests__/store/selectors.test.ts`（4 assert: actor 由来 / checker 固定 / SoD 成立 / fallback）。

### F-002 実装内容 (完了、3 guardrail 遵守)
- `store/types.ts`: `LedgerEvent` を store layer へ集約（guardrail #2）+ `StoreState.auditEvents/auditSeq` 追加 + S8 comment を nuance（静的台帳は非載 / セッション操作証跡は載せる + honest disclaimer）。
- `store/reducer.ts`: pure `logEvent`/`auditTs`（Date.now 不使用、基準日 2026-05-30 18:00 起点）。case create/approve(input/checker)/override/sendback/escalate/reverse で push のみ。**actor は currentActorId 由来で owner/CASE_DETAILS 非依存（guardrail #1）**。SoD block 等の no-op は event を残さない。
- `store/persist.ts`: SCHEMA 6→7 + 共有 `withAuditDefaults` を loadPersisted / loadPersistedFromStorageEvent 両方で適用（guardrail #3）。auditEvents 永続化（persisted case state と整合）。
- `store/hooks.ts`: `useCrossLedger()` = `[...CROSS_LEDGER, ...state.auditEvents]`（useFlywheelLineage パターン）。`data/mock-observatory.ts`: LedgerEvent を store から re-export、定義撤去。
- `pages/Observatory.tsx`: 台帳消費を useCrossLedger 経由 + actor/action filter を live 台帳から component 内 derive + honest disclaimer（session 操作記録 mock / 本番改竄防止は別 system）。
- `src/__tests__/store/audit-events.test.ts`（5 assert: seed 空 / 手動起票 append / guardrail#1 actor / append-only 不変 / SoD block 非記録 / 差戻し append）。
- **agent/proposal の event 記録は W3 へ scope**（F-014/F-015 と同 wave、LedgerEvent は case-centric ゆえ）。**action label の JP 統一（seed の英語 business_approve 等）は F-032/W5**。

### F-002 実装設計 (旧 lock、上記で実施済)
**方針**: 実 in-memory append-only event log（D2）。store-core 変更ゆえ単独 pass。
1. `store/types.ts`: `StoreState` に `auditEvents: LedgerEvent[]` + `auditSeq: number`。`LedgerEvent` 型は `mock-observatory.ts:27` を store/types へ移設 or re-export。
2. `store/seed.ts`: `auditEvents: []`, `auditSeq: 0` 初期化。
3. `store/reducer.ts`: pure helper `logEvent(state, partial)` = event を append + auditSeq++（**Date.now 不使用**。ts は session-base 定数 + auditSeq オフセットの決定的合成、honest disclaimer で session-mock 明示）。case/approve(input/checker)・override・sendback・escalate・reverse・create、agent/emergencyStop・resume、proposal/forward・approve で呼ぶ（push のみ、更新/削除なし）。actor = `actorById(currentActorId)?.name`、action label は JP（手動起票/入力者承認/承認者承認/差戻し/訂正/取消/緊急停止…、F-032 の JP 化 end-state と forward-consistent）。
4. `store/hooks.ts`: `useCrossLedger()` = `[...OBS_LEDGER（seed 温存）, ...state.auditEvents]`（`useFlywheelLineage` パターン、memoized）。
5. `data/mock-observatory.ts`: 静的 `CROSS_LEDGER` を撤去（consumer は useCrossLedger へ）、`OBS_LEDGER` は seed として温存。
6. `pages/Observatory.tsx`: ledger 消費を `useCrossLedger` 経由 + 台帳 header に honest disclaimer（「本証跡はこの端末・このセッションの操作記録(mock)。本番の改竄防止/長期保持は別 module」）。
7. `store/persist.ts`: SCHEMA_VERSION bump + load 時 `auditEvents`/`auditSeq` 欠落を default で補完（加法 migration、低リスク）。
8. test: 操作 dispatch 後に auditEvents が append される assert（手動起票/承認/差戻し各 1）。
**検証**: `check:all`（test 数増）+ harness（manual-entry probe で `manualCaseInLedger:true`、approve で ledger 件数増）+ 全 route axe serious=0 維持。
**fallback（stop-condition 時）**: SCHEMA migration 非自明なら auditEvents を非永続化 or header disclaimer + 静的 OBS_LEDGER に縮退、`BUILD-PROGRESS` に記録。

### F-003 実装内容 (完了)
- `index.css`: `--color-primary-strong: #4f46e5` 新設 (primary 系 TEXT/link/active-nav/chip 用、light 地 AA pass)。`--color-primary` #635bff は brand fill 専用に役割明確化。
- active src のみ (legacy quarantine 除外): `text-[var(--color-primary)]` (TEXT) → `text-[var(--color-primary-strong)]` 一括 (17 file)。
- chip primitive (MetaChip/StatusBadge) neutral tone + PrototypeModeLabel + EmptyState + Notifications 未読 + CaseDraft + ConsequencePanel + CaseDetail/ProposalDetail 操作ビュー span/icon: inset/soft 背景上の `fg-muted` → `fg-tertiary`。
- Hub hero CTA `text-white/85` → `text-white`。ProposalDetail diff text → `success-soft-fg`/`error-soft-fg`。
- legacy/ は不変 (gate-exempt、drive-by 回避: sed 誤適用を逆 sed で復元済)。

## Wave 1.5 — closure sync (完了)
- **persist guard 補強**: 同一 version の malformed `auditEvents` (非 array) / `auditSeq` (非 number) を shape guard で弾き fallback(seed) へ。欠落のみ `withAuditDefaults` が補完。`src/__tests__/store/persist.test.ts` (4 assert: round-trip / malformed array / malformed seq / 欠落補完)。**check:all = 225 test green**。
- **実行 SSOT 更新**: `V3-UPGRADE-PLAN.md` に W1 as-built closure (F-001/002/003 done, 225 test baseline, F-002 scope=case events, agent/proposal→W3, JP label→W5) + **F-018 data-model 決定** (auditEvents = who/when の canonical 証跡 SSOT、CaseEntity は操作 state のみで denormalize しない) を反映。
- **規制 frame 是正 (honesty)**: `V3-UPGRADE-PLAN.md` / `AUDIT-v3-REPORT.md` の anchor を **SR 11-7 → SR 26-2** (OCC/FRB/FDIC 合同 2026-04-17、primary source 検証済)。**SR 26-2 は生成・agentic AI を MRM scope 外** ゆえ F-039/L4 を「represent, not claim」に明記 (over-claim 解消)。

## Wave 2 — truthfulness P1 — ✅ **完了 (9/9)**

**W2 closure gate**: `check:all` **242 test** green (lint / no-op / types / types:test / design 0 / vitest / build) + `audit-v3-capture.mjs` full 再走 = **74 cell axe serious 0/0** + 各 finding の live walk 再現済。SSOT 矛盾 0 / stale 内部コメント 0 / 「差戻しパターン」UI 文言は「差戻し・誤確定」に統一 (F-021 整合)。

### 手動起票 honesty cluster (F-006 / F-007 / F-051) — ✅ 完了
起きていない AI 処理・OCR・スキャン書類・押印を捏造しない origin-aware 表示。
- `CaseDetailModel.origin: 'ai'|'manual'`。`buildCaseDetail`→ai / `buildManualCaseDetail`→manual / `CASE_2026_0142`→ai。
- **F-006**: `buildManualLifecycle`(AI処理 step 無し 4 段) + 手動 document (`.pdf`/押印欄を出さない、`fileName='(スキャン画像なし)'`) + field は humanValue のみ (ocrRawValue/sourceLocator 捏造せず)。`buildManualCaseDetail` は `status` 引数で承認後の段階遷移も AI 5 段に化けない。
- **F-007**: 手入力項目を「AI 照合確認」と弁別 (ReconcilePanel header `手入力項目（書類走査なし）`、`origin` prop)。
- **F-051**: `DocumentViewer` に「サンプル文書（モック）」watermark + 手動は「手入力値の控え」表示。押印欄値は `(押印済・サンプル)` に honest 化 (buildDocRows + canonical 0142)。
- F-007 補強: ReconcilePanel の全 resolved 文言も origin 分岐 (`手入力値は入力済みです — 承認者の確認へ進めます`)。
- 検証: `check:all` **232 test** green (manual-honesty.test 6 + manual-entry UI honesty 1 追加) + **UI-level closure**: manual-entry.test が起票→detail render で `AI処理`/`AI 入力項目`/`.pdf`/`押印` 非表示 + `手入力項目（書類走査なし）`/`手入力値の控え` 表示を assert。AI 案件で watermark/`押印済・サンプル`・旧 `(押印済)` 単独消滅・AI header 維持を live 確認 + **full harness 74 cell axe serious 0/0**。
  (手動起票 form は component test 環境で submit→navigate→honest render 確認済。F-033/W5 は form の validation/入力支援 強化で、form 自体は機能する。)

### F-018 reversal who/when + dead-end 解消 — ✅ 完了
W1.5 決定どおり **reversal の who/when は auditEvents (canonical) 由来表示**、CaseEntity は denormalize しない。
- `case/reprocess` action 追加 (sent-back → ready、sendback/reversal 記録 clear、`再処理` event log)。`useCaseAuditEvents(id)` selector。
- CaseDetail: reversal banner に「— 再処理が必要です」+ who/when (`{actor}（{role}） · {ts}`、auditEvents 由来)。sent-back+input で footer に「再処理する」CTA (dead-end 解消)。ReconcilePanel に `approvable` prop (sent-back では「承認できます」と誤誘導しない)。
- 検証: `check:all` **233 test** green (reversal.test に F-018 dead-end test 追加 + 既存 2 test を新 banner 文言に更新) + **live**: 取消→banner「再処理が必要です」+ who(業務責任者)/when(2026-05-30) → 入力者で「再処理する」→ click で banner 消失(ready復帰) + **full harness axe 0/0**。

### F-021 lineage 整合 — ✅ 完了
flywheel lineage の「差戻し実例」claim と drill-in 案件記録 (反映済) の矛盾を解消。
- 実体は「AI が基準内で誤確定し後に是正・再反映された実例」ゆえ ProposalDetail の framing を是正（`差戻しの実例`→`基準が甘く AI が誤確定した実例（後に是正・再反映済）` / `差戻しコメント (原文)`→`日次分析の指摘 (原文)`）。
- `CaseDetailModel.historyNote` を追加し HISTORICAL_CASE_ROWS (提案 sourceCases の drill-in 先) に履歴注記を付与。CaseDetail が readOnly 過去案件で banner 表示 → lineage 連鎖が整合。
- 検証: `check:all` **234 test** green (lineage-coherence.test 追加: sourceCases 実在 + historyNote + reflected) + live: 提案で「誤確定した実例」表示・「差戻しの実例」消滅 + drill-in 0098 に「是正・再反映された実例」注記 + harness 0/0。

### F-022 metric % 表記 — ✅ 完了
ProposalDetail の判定基準 metric を raw decimal (`0.93` / `> 0.90`) から **% 表記** (93%/>90% 等、3 提案) に。生 confidence と誤認させない。
- `mock-proposal-detail.ts` の `criteria` 3 accuracy metric を % + judgment/previousDelta を pt 表記に。MetricVsThreshold subtitle に **mock 値 [仮説/要検証]** hedge + 「% は精度指標で生 confidence でない」明示。
- ついで掃除: 古い内部コメント「差戻し case」2 箇所 (header + sourceCases) を「誤確定→是正の実例」に統一 (F-021 framing と整合、再混入源を消す)。
- 検証: `check:all` **235 test** green (lineage-coherence.test に F-022 assert 追加) + live: 93%/>90% 表示・raw decimal 消滅・[仮説/要検証] hedge 表示 + harness 0/0。**scope 厳守**: KPI 分母 / F-019 / F-048 / F-055 へ広げず。

### F-025 persona truthfulness — ✅ 完了
業務責任者ハブの「あなたが判断する案件 N 件」が既定 persona=入力者 では偽 → persona-aware に。
- `useCurrentActor().role === 'business-approver'` で文言分岐: 非 business-approver は「業務責任者が判断する案件 N 件」+ alert hint「現在の操作者は『{role}』です。…右上で業務責任者に切替えてください」。business-approver では「あなたが判断」+ hint なし。
- 検証: `check:all` **237 test** green (business-approver.test に F-025 persona test 2 追加) + live: 既定で偽 CTA 消滅 + 切替後「あなたが判断」 + harness 0/0。
- ついで掃除: 残存していた内部コメント「差戻し case」3 箇所 (ProposalDetail/types/hooks) を「誤確定→是正の実例」に統一 (F-021/F-022 framing と整合、再混入源を全消去)。

### F-026 error-state 件数整合 — ✅ 完了 (shared root-cause、4 list-header + DataTable caption)
取得失敗/読込中の body と矛盾する header 件数・caption を出さない。
- header `· {rows.length} 件` を `{!list.status && ...}` で **ready 時のみ表示** に。同一 root-cause ゆえ Approvals + **Cases / Proposals / Agents** の 4 list-header に一貫適用 (再監査で同型 bug 残さない)。
- DataTable の `caption` を `effectiveStatus !== loading/error` でgate (全 list 共通)。
- 検証: `check:all` **237 test** green (loading-error.test に F-026 assert 追加: error で `· N 件` 消滅 / retry 回復で再表示) + live: /approvals?demo=error で件数消滅・error UI 表示・ready で件数復帰 + harness 0/0。
- stale 掃除: `SourceCase.comment` の field doc も「差戻しコメント原文」→「日次分析の指摘原文 (誤確定→是正)」に統一 (F-021 framing 整合、再混入源 0)。

### F-052 PrototypeModeLabel 常時可視 — ✅ 完了
法務免責の常時到達性。包括的免責本文が hover-only tooltip で touch 不到達だった問題を解消。
- `<div role="status">` (静的 pill の live region 誤用) → `<button aria-expanded/aria-controls>` の disclosure に。常時可視 pill は material な 3 事実 (プロトタイプ/外部未接続/証跡モック) を表示し、詳細免責は **click/keyboard で開ける** (hover でも展開、desktop 利便)。role=status 除去 (F-047 forward、同一部品のみ、F-047 全体には広げず)。contrast は W1 で AA 化済。
- 検証: `check:all` **242 test** green (prototype-mode-label.test 4 追加: pill 常時表示 / click で aria-expanded toggle / 包括免責本文到達 / role=status 不在) + live: pill 常時可視・button 化・click で詳細可視化 (touch 到達) + harness 0/0。

## Wave 3 — control-legibility P1 (進行中) — **8 finding 中 2 done / 6 remaining**
> F-052 を B patch で正式 close 済 (常時可視 pill を material 4 事実に拡張、mobile overflow なし、242 test green) = **W2 完全 close**。

### F-020 0件 export guard — ✅ 完了
Observatory 台帳 export を `ledgerRows.length===0` で disable + toast に件数明示（空エクスポートの誤認防止）。
### F-024 業務責任者ハブ 2 カード別着地 — ✅ 完了
手順承認 / 設定承認 card の href を `?kind=proposal`/`?kind=promotion` に。ConfigApprovals が `useSearchParams` で kind 絞り込み + h1/件数文言を kind 反映。
### 残 W3 (6): F-013 escalation 永続マーカー / F-014 kill-switch 実 trust 降格+再開確認 / F-015 設定承認 SoD identity / F-016 escalation 裁定 lock+肯定経路 / F-017 裁定 closure 通知 / F-042 self-approval block 可視化

## Wave 4-7
未着手。`V3-UPGRADE-PLAN.md` §3 の順序 (W4 a11y/eff → W5 P2 → W6 P3+distinction → W7 net-new) で継続。W7 のみ roadmap 画面 ledger 更新 (plan-lock) 先行必須。
- data-model 前提: **F-018/F-013/F-014/F-017 の who/when は auditEvents の event から表示** (CaseEntity に audit metadata を denormalize しない、W1.5 F-018 決定)。

---

## Wave 3 — control-legibility P1 — ✅ 完了 (8/8)
- **F-020 / F-024**: 既述 (export 0件 guard / config-approvals kind 着地)。
- **F-013 escalation 永続マーカー**: CaseDetail に「裁定依頼中」banner (reason + who/when は auditEvents 由来) + Cases 一覧に「裁定依頼中」chip。`escalation.resolution` 未確定で永続。
- **F-016 / F-017 escalation 裁定**: 新 action `case/resolveEscalation` (proceed=続行可 / sendback=差戻し)。SoD lock = `currentActorId === escalation.to` でなければ no-op (起票者の自己裁定 block)。裁定面は CaseDetail footer (業務責任者のみ、続行可/差戻し)。裁定で queue closure + 裁定者の依頼通知 closure + 起票者 (`escalation.from`) へ `escalation-resolved` 通知が因果で戻る。
- **F-014 kill-switch 実効化**: `agent/emergencyStop` が trust を実降格 (`trustBeforePause` 保存→supervised) + 台帳 append、`agent/resume` は再開理由必須 (1-click 廃止) + trust 原状回復 + 台帳 append。`trustLevelLabel` helper 追加。
- **F-015 提案層 identity-SoD**: `ProposalEntity.forwardedBy` 追加、`proposal/approve` が `isSelfApproval(forwardedBy, currentActorId)` で block (案件/設定と対称化、3 承認層の非対称解消)。UI でも disabled + 理由。
- **F-042**: Observatory 職務分離注記に honest framing 追記 (四眼は 3 actor の role 分離で強制、identity guard は本番 RBAC 向け defense-in-depth でデモ経路非発火)。
- 検証: `check:all` 253 test green + live axe 0/0。

## Wave 4 — a11y + operator P1 — ✅ 完了 (9/9)
- **F-004 / F-005**: W1 contrast pass で既に解消済を確認 (diff text -soft-fg 4.83/5.29、hero CTA opaque white 4.70 ≥ AA、check:design + live axe 0)。コード変更なし。
- **F-012**: CaseDetail breadcrumb「案件一覧」を `<Link>` 化 (hover/focus ring)。
- **F-008**: 起票 form + 全 modal error に `role=alert` + `aria-describedby`、送信失敗で最初の無効 field へ programmatic focus。
- **F-050**: skip-link (本文へスキップ→`#main-content`) + `<main tabIndex=-1>` + nav landmark の明示 aria-label。
- **F-011**: 全 triage queue (Cases/Approvals/Escalations/Search) に経過(receivedAt 数値)/要確認/担当/種別 の sortValue + Escalations 区分列 + Search kind filter。
- **F-029**: Cases に安全な一括操作「全項目一致をまとめて入力者確認」(`case/bulkApprove`、要確認残/確認待ち以外を含む選択は disabled)。
- **F-009**: `?demo=loading/error` seam を全 list route (Escalations/ConfigApprovals/Search/Inbox) + detail route (`useDetailDemo` + `DetailDemoFallback`) に一貫配線。Observatory/BusinessApproverHub は fixture-backed ゆえ非対象を明示。
- **F-023**: mobile 375px の CJK 折返し (LifecycleStepper whitespace-nowrap + overflow-x、MetricVsThreshold table overflow-x + min-w、Observatory h1 min-w-0/flex-wrap)。
- 検証: `check:all` 263 test green + live axe 0/0。

## Wave 5 — P2 — ✅ 完了 (19/19)
- **F-049**: W1/W2 で fg-tertiary 化済を確認 (EmptyState desc / inbox detail 6.78:1 ≥ AA)。コード変更なし。
- **F-019 / F-055 / F-048**: mock-kpi の分母 (1,240/1,140/980/910) は metric 別母集合ゆえ正、コメントを実態へ是正 + 差戻し率 row に exclusions 明示。Observatory metrics を「想定値（実処理からの再計算ではない）」framing + 当日台帳 vs 30日KPI 別母集合の注記。
- **F-053 / F-054**: Hub「最終更新」→「表示基準（サンプル固定）」、ConsequencePanel 予測に [仮説/要検証] note。
- **F-056**: canonical-design-spec の「dev assert で強制」over-claim を「typed props + 単一 footer 構造 + contract test で担保」に是正 + 実 contract test (`detail-contract.test.tsx`、単一 footer + A 全項目表示) 追加で主張を真に。
- **F-044**: escalate も category 必須収集 (空 category 偽データ解消) + Escalations 経過列を「受付からの経過」に honest rename。
- **F-032**: Observatory 台帳 fixture の action/role/actor を JP 業務語化 (filter chip の snake_case/英語露出解消)。
- **F-033 / F-034**: 起票 form に type=date/inputMode/pattern/required + 進捗 N/5 + 起票=入力者の眼の SoD 注記。
- **F-010 / F-037**: 横断検索を URL `?q=` 同期 (deep-link/共有/戻る) + /search 着地で TopBar searchbox を隠し二重 searchbox 解消。
- **F-038**: config-approvals に kind filter + 種別/対象業務 sort + 申請番号 (内部 slug 非露出) + 全業務横断 sub-header。
- **F-040**: 業務責任者 queue (Escalations/ConfigApprovals) で非 arbiter persona に「閲覧のみ」role hint。
- **F-031**: 台帳に「直近30日固定（プロトタイプ）」明示 + 非デフォルト filter で「フィルタをクリア」全軸 reset。
- **F-030**: inbox に未読のみトグル + 発生時刻 (auditEvents ts / 受付時刻 fallback) + 空状態コピー 3 kind 反映。
- **F-027**: 共通 Toast primitive (tone success/alert/error + sticky) + useToast hook。統制重要 event (SoD skip/緊急停止/取消・訂正) は alert + sticky (手動 dismiss、後追いは台帳)。5 page 適用。
- **F-036**: 共通 PageHeader primitive (title/subtitle/actions/children + responsive) を 11 list/landing page に適用 + Observatory header の --height-pageheader contract 逸脱を是正。
- 検証: `check:all` 267 test green + live axe 0/0。

## Wave 6 — P3 + distinction — ✅ 完了 (7/7)
- **F-028**: seed に未裁定 escalation 1 件 (CASE-2026-0145) を投入し /escalations + 業務責任者ハブ裁定タイルを初回 live に (C2 旗艦面の恒久 empty 解消)。
- **F-035**: AgentDetail に flywheel lineage (relatedProposals) section 描画 + Modal entrance signature motion (overlay fade + panel scale/slide ≤200ms、prefers-reduced-motion で off)。
- **F-041**: 入力者承認後 (baw) の入力者ビューは disabled 承認でなく「承認者の最終承認待ち」状態カード + 承認待ちキュー導線。
- **F-043**: 業務責任者ハブの 0 件カードを非リンク沈静化 (「新規なし」) + urgent (裁定) を件数>0 で alert tone + header に「うち裁定 M 件」分離。
- **F-045**: DataTable は候補 2 以上の filter のみ表示 (退化 filter 非表示) + Approvals rowHref から無効な `?view=checker` 除去。
- **F-046**: 横断検索 sub-header に「全業務横断（業務フィルタ非適用）」明示 + reset modal body に persona/台帳 初期化を列挙。
- **F-047**: TopBar `role=banner` + 破棄確認 overlay `role=alertdialog`+aria-label + 未読数 aria-live='polite' (PrototypeModeLabel role=status は W2 で除去済)。
- 検証: `check:all` 269 test green + live axe 0/0。

## Wave 7 — net-new 統制 surface F-039 — ✅ 完了 (1/1)
- finding の route 指定 (/agents, /agents/:id, /observatory) と suggestedFix (既存画面拡張) に従い、**新規 route を増やさず** モニタリングに「モデルガバナンス」タブを新設 (規制担当の自然な着地点 = Observatory = 監査/監視 view、roadmap 画面 ledger の 15→16 拡張を回避)。
- 内容: (1) モデル台帳 (版/用途/所有者/SR 26-2 区分/独立検証状況、policy:v3.1 を個別 model 版に分解) (2) 自動化レベル昇格の独立検証注記 (3) drift/bias 監視指標。Agents 一覧に「モデル検証」列、AgentDetail に独立検証 + ガバナンス誘導注記。
- **honest framing (SR 26-2)**: 統制を represent し規制準拠は主張しない。非生成 model に MRM 原則適用、reconcile は rule-based (model 定義外)、生成・agentic 層は SR 26-2 scope 外 (脚注3)、実体は本番別 module。すべて [仮説/要検証] mock。
- 検証: `check:all` 269 test green (governance tab test + axe smoke 追加) + live axe 0/0。

## 検証 (W7 完了時点、CR 前スナップショット — 下の「Post-CR … 最終状態」が supersede)
- **`npm run check:all`**: lint 0 / no-op 0 / types(app+test) 0 / check:design 違反 0 / **vitest 269 test green (30 file)** / build OK。test 数は baseline 212 から +57。
- **live axe (Playwright + axe-core、`audit-v3-axe-sweep.mjs`)**: 15 route + モデルガバナンス tab + escalation 裁定面 + reflected 計 **19 surface で serious/critical = 0**。実 browser で initial sweep が検出した 4 surface の color-contrast (fg-muted on panel-inset/primary-soft、jsdom 不可検出) を fg-tertiary/fg 化 + DocumentViewer active 行を ring 化して解消。
- **finding 集計 (この時点)**: 56 confirmed finding すべて disposition。うち F-004/F-005/F-049 は W1/W2 で既解消を live 検証で確認 (コード変更不要)。F-039 は新 route でなく Observatory タブ拡張で resolve (finding の suggestedFix 準拠、scope 非拡張)。**注**: この時点では partial 検出前。CR 後の独立検証で F-003/F-021/F-025 の partial を是正し、最終は **implemented 55 + accepted deviation 1 (F-045)** = 下の Post-CR 節を SSOT とする。

---

## Post-CR SSOT sync + 独立検証 + 残 gap 修正 (2026-05-31)

CR (案 A: as-built 承認 + SSOT 同期) を受けた追加作業。

### 1. SSOT 同期 (plan ↔ as-built)
- `V3-UPGRADE-PLAN.md`: §3 W7 を「net-new route」→「Observatory モデルガバナンス tab + Agents/AgentDetail 拡張」の as-built に書換 + 上部に全 wave as-built closure banner + §1/§4/§5/§6 の「新規画面/15→16/plan-lock」記述を「route 15 維持 / verified surface 19 / plan-lock 不発生」へ是正。
- `final-ledger.json` は監査入力の原本 (immutable) として保持。56 件 closure の SSOT = `closure-ledger.json` (新規) + 本 ledger。

### 2. 独立検証 (distrust closure claims)
- workflow (7 agent、wave 別) で 56 finding を **working tree に対し独立に grep/read 照合**。結果: **56/56 実在を確認**、partial 4 件を surface。
- `closure-ledger.json` に per-finding {closureStatus, verifiedInWorkingTree, evidence(file:line), concern} を記録。

### 3. 独立検証が surface した残 gap の修正
- **F-003 (P0 a11y、partial→implemented)**: 静的 15-route axe が開かない modal/loading 状態に fg-muted-on-panel-inset の 4.34:1 AA fail が 4 箇所残存 (ReasonDialog/LoadingState/FieldActionModal×2)。fg-tertiary へ置換。**`audit-v3-axe-sweep.mjs` を modal/loading 状態へ拡張** (22 surface) し再発防止 + serious/critical=0 を確認。
- **F-021 (P1 truthfulness、partial→implemented)**: 起点案件 CASE-2026-0098 のビル名確定値が hardcode 'サンプルビル' で根拠コメント (正='サンプルビルディング') と矛盾。baseFields に汎用 change-pass を追加し change.to を反映 + previousValue で before/after 表示。`lineage-coherence.test` に regression。
- **F-025 (P1 truthfulness、partial→implemented)**: expectedFlawless の 2 条項目「権限の無いキューで action 前に inline/disabled 理由で事前提示」が Approvals 側で未達 (事後 toast のみ)。Approvals に事前権限 inline hint + 一括承認 disabled の自己承認 reason tooltip を追加。`approvals-permission.test` 追加。
- **F-045 (P3 ssot、partial 据え置き = judgment)**: 中核欠陥 (dead query + 退化 filter) は修正済。suggestedFix の「seed 複数件で queue 既定 multi-row 化」は 1-option filter を隠す現挙動が正しい UX ゆえ artificial padding と判断し defer (closure-ledger に judgment 記録、CR 報告)。

### 最終状態
- **`npm run check:all`**: vitest **272 test** green (31 file、baseline 212 → +60) / lint 0 / no-op 0 / check:design 0 / build OK。
- **live axe (`audit-v3-axe-sweep.mjs`、拡張版)**: **22 surface (15 route + governance tab + 裁定面 + reflected + loading + 2 modal) で serious/critical = 0**。
- **closure 集計** (`closure-ledger.json`): 56/56 working-tree 実在検証済、**implemented 55 / partial 1 (F-045、judgment documented)**。
