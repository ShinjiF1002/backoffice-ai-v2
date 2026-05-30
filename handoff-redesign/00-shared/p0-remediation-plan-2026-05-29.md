# backoffice-ai-v2 / prototype-redesign — P0 Remediation 実装計画

**日付**: 2026-05-29 ／ **由来**: `user-perspective-ui-audit-2026-05-29.md` §7 P0 (8 項目) ／ **設計**: multi-agent planning workflow (個別設計8 → 統合 → 3-lens 批判レビュー → 合成、must-fix 2 件検証反映)

## 監査者の gate 既定 (engineering-taste gate は recommendation で確定。user は override 可)

CLAUDE.md non-negotiable (Tech Debt 回避 / clean architecture) と可逆性に基づき、以下 4 gate は既定で確定する:

- **Gate 1 (B1 action 設計)** → **(b) `case/confirm` + `case/override` 2 action 分離**。accept/override の意味論を型で表現、Tech Debt 回避。
  - **[実装整合 2026-05-30]**: 実装は単一 `case/override` に統合 (accept/override は reducer 挙動が同一で label 差のみ、`prototype-redesign/src/store/types.ts:73-77` で deferred を明文化)。action 数を増やさず Tech Debt を回避する判断で、P0 要件 (訂正値の capture/persist) は単一 action で充足。2-action 分割は accept/override を別監査イベントに分ける要件が出た時点で再導入する。
- **Gate 2 (B3 承認率分母)** → **980 に統一** (agent-level metric を SSOT 化し Observatory は集約)。synthetic ゆえ 1 値変更で可逆。
- **Gate 3 (B3 検証 fixture 分離)** → **案A: seed 除外**。B1/B4/sendback の CaseEntity 衝突面を増やさない。pagination 検証は test-only 注入で確保。
- **Gate 6 (B2 実体化範囲)** → **(B) B3 統合で口座開設 case を正規 CASE_LIST 入り**。B3 が当該 case 追加を必須とするため一貫。historical 二重登録を回避。

## strategic gate 確定 (user 決定 2026-05-29)

- **Gate 4 (B4 SoD 強制度 + mode toggle)** → **(a) reducer hard-block + demo persona switcher 分離**。同一 actor の自己承認を reducer で no-op block。mode toggle を廃し persona switcher を PrototypeModeLabel 近傍に新 chrome 配置。**ia-overview-v2 / canonical-design-spec への persona switcher 追記 (IA 影響) を許容**。承認者 journey は persona 切替前提 (Wave 3 demo-script gate)。
- **Gate 5 (Flywheel 観測の深さ)** → **(ii) lineage view IA を新設 (P1 carve → P0 必須に昇格)**。Observatory に「承認済⇄改善の流れ」view 切替を新設。**§3 Wave 3・§5 Gate 5 行の「(ii) は P1 carve」を本決定で上書きし Wave 3 必須スコープへ繰り上げ**。togglePause は variant 1 を Wave 1 union 集約、kill-switch は header「緊急コントロール」配置。Wave 3 工数 L へ増。

> ⚠ **統治上の前提 (master plan 衝突)**: 本 remediation は locked master plan `~/.claude/plans/ai-backoffice-ai-virtual-muffin.md` (v1.1.2、Day 1-22 → Session 4 = 2026-06-12) の支配下にある。Gate 4(a) の persona switcher (画面追加) / Gate 5(ii) の lineage view (画面追加) / B3 の口座開設 case fixture (業務追加) / B3 の KPI 分母統一 (KPI 変更) は、いずれもプロジェクト規則「非自明 scope 変更は plan を update してから実装」に該当。**Wave 1 着手前に master plan の update (または本 remediation を post-Session-4 track として明示分離) が必須**。加えて、audit が defect とした「承認者専用面の欠落」は master plan では意図的 scope-out (Business Approval = static mock、route/page 対象外) であり、production-ready lens と Session 4 demo scope の frame 選択を要する (本文末 frame decision 参照)。

---

# Backoffice AI v2 / Prototype-Redesign — P0 Remediation 実装計画

## 1. Goal & Scope

本計画は user-perspective-ui-audit (2026-05-29) §7 が numbered P0 (item 1-7 + blocker 再分類 item 11) として確定した 8 項目を、prototype の R0 層 (front mock 完結) で解消する。中核は「突合修正というアプリの本質が store 層でサイレント破綻している」3 系統 — override が訂正値を捨てる (B1)、証拠アンカーが業務種別整合を保証しない (B2)、KPI 分母が 4 file で drift する (B3)、四眼原則 (SoD) が表示のみで未強制 (B4) — に、Flywheel 観測不能・差戻し理由の喪失・破壊操作の無 confirm・status バッジの resolver bypass を加えた 8 つ。完了基準は「触れる demo で Flywheel・SoD・突合修正・証拠アンカーが観測できる」までであり、本番 go-live ではない (production-remediation S8 disclaimer を継承し、SoD/lineage/kill-switch は統制ではなく観測可能化に留める)。

**対象外 (線引き)**: 本番 RBAC/IdP claim・サーバ側 SoD enforce・WORM 監査基盤・自動 trust 降格 logic・本番 drift 監視 dashboard は production-remediation-plan の R1-R4 (backend 層) に carve 済で本計画は触らない。本計画は R0 雛形のみ。

## 2. 前提と既存 production-remediation-plan.md との reconcile

| 項目 | 既存 plan の扱い | 本計画の上乗せ |
|---|---|---|
| B1 override persist | R0-10 (承認後 list 即反映) の隣だが override 値 capture は未 carve | 新規 R0 補充 (audit P0-1)。R3-5 反映後訂正 (backend) とは別 layer |
| B2 証拠アンカー整合 | R0-8 (id-keyed detail + 未知 id not-found) で「存在保証」済、内容整合は盲点 | 内容整合保証 + proposal↔agent 双方向 link (audit P0-2)。R3-7 本番 lineage graph とは別 |
| B3 KPI/fixture SSOT | R0-1 (ProcessSelector filter) の前提だが KPI drift は未 carve | 新規 R0 (audit M1/D2)。AI-04 本番 drift 監視 (R3-2) とは別レイヤ |
| B4 SoD | R1-3/REG-01/UX-03 で backend 強制を carve 済 (R0 では非統制 mock) | audit が blocker 再分類 (item 11)。R0 mock での actor identity 観測可能化 + mode toggle role-scoped 化 |
| flywheel | UX-02/UX-05 で R0 雛形→R3 実権限を明示 carve 済 | UX-02/UX-05 の **R0 leg そのもの**。reducer 半実装 (togglePause) と approve UI 観測欠落を塞ぐ |
| sendback 理由 | R3-5 (反映後訂正、backend) のみ。client store の理由喪失は未記載 | 新規 R0 (audit P0-6 / I2・A4・A5)。R3-1 監査書込の前提データを client に先行整備 |
| reset confirm | 未 carve (RD1 novelty) | 新規 R0 overlay |
| status badge | R0-8 (id-keyed) 完了後の status drift。R0-10 detail-内即時反映の拡張 | 新規 R0 (audit P0-7 / DC1) |

**reconcile アクション**: 二重計画にしない。production-remediation-plan.md の Change Log に「user-perspective-ui-audit-2026-05-29 §7 P0 item 1-7 + 11 を R0 で実装 (R0-15..R0-22)」を 1 回追記し、各行に audit P0 番号を併記して 8 design ↔ audit P0 の 1:1 cross-walk を追跡可能にする。本番統制 (R1-3/REG-01/UX-03/R3-x) は据え置き。

**前提 (assumptions)**: store は「操作で変わる最小集合」のみ保持し rich data は mock dict 側という S8 境界 (types.ts:5-8) を全項目で維持する。加法的変更 (新 field / 新 action literal) に限定し既存 action 署名の破壊変更を避ける。dev server は port 5174。**Wave 1 着手の統治前提** (master plan rebaseline 承認 or post-Session-4 track 分離) は本節冒頭の ⚠ 統治上の前提 callout を SSOT とし、`remediation-roadmap-p0-p1-p2-2026-05-29.md` §5 / P0-W0 gate と整合する。P0 は画面追加を伴わないため契約 doc typology lock の受領確認は不要 (画面数受領確認は P1-2/P1-3 の precondition、roadmap §5 step 3)。

## 3. 実装 Wave

統合設計の 4 wave (0 判断 → 1 store 基盤 → 2 mock data → 3 UI) を採用。基盤 (store schema・action 署名・mock SSOT) を最初の実装 wave (Wave 1) に集約する。

### Wave 0 — Judgement Gate Resolution (非実装)
- **含む**: §5 の 6 gate を AskUserQuestion で確定。
- **並行可否**: 単独。回答前に Wave 1 着手禁止 (action 署名未確定で実装すると B4 統合時に再変更 = Tech Debt)。
- **条件分岐の明示** (critical-review should-fix 反映): gate (3) で「案B (isVerification フラグ)」が選ばれた場合のみ、CaseEntity への `isVerification` 追加を **Wave 1 の CaseEntity 集約に繰り上げて含める**。案A (seed 除外、type 不変、推奨) なら Wave 1 の CaseEntity field は B1/B4/sendback の 3 つに留まる。
- **Gate**: 6 gate 全回答 + drop された項目を後続 wave items から除外する規則を確定。

### Wave 1 — Store 基盤統合 (B1 + B4 + sendback)
- **含む**: B1-override-persist / B4-sod-actor / sendback-reason-guard の store 部分 + UI 配線。flywheel の togglePause は variant 0 (無変更) または variant 1 (gate B 確定値) でこの wave の union に同居。
- **共通基盤変更 (1 patch で確定)**:
  - `store/types.ts` StoreAction union 最終署名: `case/override` に value、`case/approve`/`case/bulkApprove` に actorId、`case/sendback` に reason+category、`proposal/reject` に reason、新 `proposal/sendback`、新 `session/switchActor`。`_exhaustive: never` (reducer:84-88) が片側 patch 漏れを compile error で即検出。
  - `CaseEntity` に optional 3 field 集約: `overrides: Record<string,string>` (B1)、`inputApprovedBy?: string` (B4)、`sendback?: { reason; category }` (sendback)。`ProposalEntity` に `decision?: { kind; reason }`。`StoreState` root に `currentActorId: string` (B4)。
  - `store/persist.ts` SCHEMA_VERSION **2→3 を 1 回だけ** bump。isStoreStateShape に `typeof o.currentActorId === 'string'` (B4 必須) + `isDict(c.overrides)` (B1 必須) を追加。optional field は guard 不要。
  - `store/reducer.ts` approveCase を `(state,id,by,actorId)` に拡張: `by==='input'` で patch に `inputApprovedBy: actorId`、`by==='checker'` で `cur.inputApprovedBy === actorId` なら no-op (SoD self-approval block)。case/override に value 格納、case/sendback に precondition guard (ready / business-approval-waiting のみ) + reason/category 格納、proposal/reject precondition (pending-triage) + decision 格納、proposal/sendback (forwarded→pending-triage)、session/switchActor を追加。
  - `store/seed.ts` field 初期化 (`overrides:{}` / `inputApprovedBy:undefined` / `currentActorId`=入力者 persona)。`store/actors.ts` (新規) に demo persona を 1 const 固定。
- **並行可否**: 不可。同一 hot file (types/reducer/persist/seed) を 3 項目が共有するため必ず同時実装。
- **Gate**: `npm run check:all` (lint + check:no-op + test + build) green。`store.test.ts` を新署名で全更新後 green: override value 格納 / SoD self-approval no-op / bulkApprove SoD skip / sendback precondition + reason / proposal reject-sendback / persist v3 round-trip。grep: `actorId` が reducer に hit / SCHEMA_VERSION=3 / `humanValue` が types.ts 以外に hit。

### Wave 2 — Mock Data 整合 (B3 → B2 → status-badge)
- **含む**: B3-kpi-fixture-ssot / B2-evidence-integrity / status-badge-resolver。store action は touch せず Wave 1 基盤上で動く。
- **intra-wave 順序 (critical-review should-fix 反映)**: **2a** (B3 が CASE_LIST/seed の SSOT owner として口座開設 5 件追加 + mock-kpi.ts SSOT 化 + VERIFICATION_EXTRA_CASES 分離 → B2 が buildCaseDetail を workflow 分岐対応にし口座開設 detail 整合) で buildCaseDetail の最終構造を固める。**2b** (status-badge-resolver が確定済 buildCaseDetail に `status: row.status` 追加 + buildLifecycle export 化 + canonical 0142 status 追加)。理由: 3 項目が buildCaseDetail の同一 return literal を編集するため、workflow 分岐 + 口座開設 case 追加を先に確定してから status field を加える方が後戻りゼロ。
- **共通基盤変更**: `data/mock-kpi.ts` (新規 leaf module、KPI SSOT)。`data/mock-case-list.ts` / `data/mock-case-detail.ts` の口座開設 case 一元化 (SSOT を B3 に寄せ B2 は detail consumer)。
- **並行可否**: 不可 (2a→2b 直列、buildCaseDetail 共有)。
- **Gate**: `npm run check:all` green。`detail-routing.test.tsx` 新 describe『証拠アンカー内容整合』green (workflowName 一致 + 双方向 link 対称性)。`hub-model.test.tsx` UC-BO-02 total 0→5 **かつ UC-BO-01 total を業務 case 数式へ更新** (must-fix、§6 参照)。grep: 手書き分母リテラル 0 / `tone="primary"` リテラル 0 in CaseDetail / **口座開設 id (0112/0104/0101) が HISTORICAL_CASE_ROWS に出現しない** (二重登録 negative gate)。

### Wave 3 — UI 配線 + 観測可能化
- **含む**: B1/B4/sendback の UI 配線、flywheel-observability、reset-confirm。
- **共通基盤変更**: ~~なし (Wave 1/2 の基盤の上に画面を載せる)~~ → **[実装整合 2026-05-30] W3 で store/schema 変更あり**: kill-switch 実装のため `AgentEntity.paused`/`pausedReason` + `agent/emergencyStop`/`agent/resume` action を追加し `SCHEMA_VERSION` を 3→4 に bump (`prototype-redesign/src/store/persist.ts`)。Gate 5(B) variant 1 を Wave 1 union で集約する §5 line 207 方針は実際には W3 で実施。flywheel は store 派生 selector (`useFlywheelLineage`) を hooks に追加 (新 static fixture を増やさない)。
- **必須 / P1 分離 (critical-review should-fix 反映)**: P0 を閉じる**必須分**は B1 値入力欄+humanValue 表示 / B4 mode→persona switcher 分離+SoD disabled+理由 / sendback 理由再表示 / flywheel kill-switch UI (A3) + proposal approve lineage (A2) / reset confirm Modal。**P1 carve 候補** (Wave 0 判断次第): B2/flywheel の proposal↔agent 双方向 link section、Observatory knowledge tab の lineage view IA 再設計 (Gate A-ii)、status-badge の before/after 併記。必須分だけで 8 P0 が閉じることを Wave 3 gate で確認。
- **並行可否**: 部分並行可 (B1/B4/sendback/reset は別 file 中心)。flywheel は B4 (Wave1) + B2 (Wave2) 依存のため最後。
- **Gate**: §6 の画面 evidence 全項目 + `npm run check:all` green + P2B-4 full active-source gate (off-token hex 0 / lucide のみ / JP-only) clean + Session 4 demo-script 実走で詰まらないこと。

## 4. 項目別 Change Spec

### B1 — override が訂正値を capture/persist/display
| 対象 file (file:line) | 変更 | 検証 |
|---|---|---|
| `store/types.ts:65` (action) / `:13-25` (CaseEntity) | `case/override` に `value`、CaseEntity に `overrides: Record<string,string>` | tsc pass |
| `store/reducer.ts:51-58` | override に `overrides: {...cur.overrides, [fieldLabel]: value}` 格納 | store.test override value 格納 test |
| `store/seed.ts` | CaseEntity 生成に `overrides: {}` 初期化 | store.test seed |
| `store/persist.ts:10` | SCHEMA_VERSION 2→3 (Wave 1 集約) + isDict(overrides) guard | persist round-trip test |
| `components/case/FieldActionModal.tsx:19-24,38-76,111` | override 選択時に訂正値入力欄 (`useState('')`)、value 必須 validation、onSubmit に value 追加、reset 分岐に `setValue('')`、上部表示を `humanValue ?? aiValue` | 契約 conformance 手動 (空で確定不可) |
| `pages/CaseDetail.tsx:64-67,83-90` | handleAct に detail.value を dispatch、overlay で `humanValue: entity.overrides[fieldLabel]` を set。displayValue helper を `lib/reconcile-display.ts` に同居 (resolver 分散回避) | 画面 evidence (0142 ビル名) |
| `components/cross-cutting/ReconcilePanel.tsx:119` | 確認済行を `humanValue ?? aiValue` (要確認行は AI 値据え置き) | grep gate: 確認済表示が humanValue 優先 |

### B2 — 証拠アンカー整合 + proposal↔agent 双方向 link
| 対象 file | 変更 | 検証 |
|---|---|---|
| `data/mock-case-detail.ts:193-243,254-261` | 口座開設用 field/builder 新設 (汎用化しない)。**口座開設 case は CASE_LIST 経由 (B3) でのみ CASE_DETAILS に入り、HISTORICAL_CASE_ROWS に追加しない** (二重登録回避) | detail-routing 内容整合 test |
| `data/mock-proposal-detail.ts:28-40,124-127,166-169` | ProposalDetailModel に `agentId`、PROP-028 sourceCase 0118/0106 を法人名 historical に差替え | 双方向 link 対称性 test |
| `data/mock-agent-detail.ts:27-37,107-109` | AgentDetailModel に `relatedProposals`。**sample.tone は status-tones resolver から導出** (caseStatusToTone 経由、手書き個別 tone 禁止) | tone 整合を resolver-derived で assert |
| `pages/ProposalDetail.tsx:221-291` / `pages/AgentDetail.tsx:106-150` | (P1 carve 可) 双方向 link section。lucide Icon suffix / --color-primary 厳守 | 画面 evidence (往復 link) |
| `__tests__/pages/detail-routing.test.tsx:77-93` | 新 describe: sourceCase/sample の workflowName 一致 + tone↔status + 双方向 link 対称性 | green |

### B3 — KPI 分母 SSOT + 口座開設 fixture + 検証 fixture 分離
| 対象 file | 変更 | 検証 |
|---|---|---|
| `data/mock-kpi.ts` (新規) | KPI SSOT dict + selector (kpiRowsFor/kpiValue)。UC-BO-02 分母を単一値に統一 (gate)。leaf module (他 mock を import しない) | 循環 import なし (build) |
| `data/mock-observatory.ts:74-93` / `mock-agent-detail.ts:46-51,90-95` / `mock-agent-list.ts` | 手書き分母/承認率を selector 呼び出しに置換 | grep: 820/980/1240/1140/910 リテラル 0 |
| `data/mock-case-list.ts:22-55` | 口座開設 5 件を BASE_CASES に追加 (3 件は 0112/0104/0101)、EXTRA_CASES を `VERIFICATION_EXTRA_CASES` へ rename + id space 分離 (CASE-VRF-) | factory↔list gate green |
| `data/mock-hub.ts:64-75,131-135` | **HUB_PROCESSES.total/dist を物理削除** (useHubModel が唯一 source、型で強制)。approvalRate のみ static 残置 (gate: 96% 表示か否か) | grep: `total:`/`dist:` in mock-hub 0 |
| `store/seed.ts:23` / `store/hooks.ts:98-110` | 業務 case のみ entity 化 (案A) or isVerification フィルタ (案B)。UC-BO-02 total 実数化 | hub-model / store.test 更新 |
| `__tests__/store/hub-model.test.tsx:19-20` / `store.test.ts:11,117,123,130` | UC-BO-02 total 0→5 **かつ line 20 UC-BO-01 total を業務 case 数式へ** (must-fix)、CASE_LIST.length 直書きを分離方針に整合 | green |

### B4 — SoD: actor identity + role-scoped gating + mode toggle 分離
| 対象 file | 変更 | 検証 |
|---|---|---|
| `store/types.ts:47-54,64,68` | Role/Actor 型、StoreState に `currentActorId`、CaseEntity に `inputApprovedBy?`、approve/bulkApprove に actorId、session/switchActor | tsc pass |
| `store/reducer.ts:35-45` | approveCase に SoD guard (inputApprovedBy 照合、self-approval no-op) | reducer SoD test (同 actor 2 回目 no-op) |
| `store/actors.ts` (新規) | demo persona 2-3 名固定、mock 氏名の表記ゆれ (山田太郎/山田 太郎) を SSOT 統一 | — |
| `store/persist.ts:10,18-38` | SCHEMA_VERSION bump (Wave 1 集約) + currentActorId guard | persist test |
| `store/hooks.ts` | `useCurrentActor` / `useCanApprove` (SoD + status を 1 selector に集約) | — |
| `pages/CaseDetail.tsx:48,120-133,208` / `pages/ProposalDetail.tsx:53,103-115` | mode を actor role 由来に、自己切替 block、dispatch に actorId、canApprove を useCanApprove に置換 + SoD 理由 footer | 画面 evidence (自己承認不可) |
| `components/shell/Sidebar.tsx:117-125` | current actor を useCurrentActor 表示、hardcode 除去、persona switcher host | grep: hardcode 除去 |
| `pages/Approvals.tsx:91-97` | dispatch に actorId、SoD fail 案件 skip + 件数可視化 | bulkApprove SoD skip test |

### Flywheel — observability
| 対象 file | 変更 | 検証 |
|---|---|---|
| `store/hooks.ts:69-80` | `useFlywheelLineage` (approved proposal + PROPOSAL_DETAILS 派生、新 static fixture 最小化)、`useAgentAdoptedProposals` | selector test (段遷移) |
| `store/types.ts:35-45,73` / `reducer.ts:78-81` | (gate B 採択時) togglePause を emergencyStop/resume + pausedReason へ。default は variant 0 無変更 | store.test togglePause→paused 維持 or 置換 |
| `pages/Observatory.tsx:240-272` | (必須) staging disclaimer 付き lineage、(P1) view 切替 IA。staging は「未承認ヒント」明示 | 画面 evidence (approve→lineage 出現) |
| `pages/AgentDetail.tsx:155-189` / `pages/Agents.tsx:93-99` | kill-switch UI (footer 第2 cluster にしない、補助/header 配置)、paused 可視化 (MetaChip alert)、一覧反映 | 画面 evidence (緊急停止) |
| `data/mock-observatory.ts:38-42,96-114` | LineageStage の最小 literal のみ追加、内部語非露出 | grep (内部語 0) |

### sendback-reason-guard
| 対象 file | 変更 | 検証 |
|---|---|---|
| `store/types.ts:66,71` | case/sendback に reason+category、proposal/reject に reason、新 proposal/sendback、CaseEntity.sendback?/ProposalEntity.decision? | tsc pass |
| `store/reducer.ts:60-61,74-75` | case/sendback precondition (ready/business-approval-waiting のみ、終端逆行 no-op) + reason 格納、proposal/reject precondition、proposal/sendback case | store.test 各 precondition |
| `pages/CaseDetail.tsx:88-90,230-233,185-196` | handleAct に reason/category、**差戻し button disabled 条件を precondition と一致** (false-action 防止)、理由 read-only 再表示 (P1) | grep: 引数無し dispatch 0 |
| `pages/ProposalDetail.tsx:355-369` | reject/sendback dispatch に reason、**欠落していた sendback dispatch を補完**、useProposal 購読で decision 再表示 | grep: proposal/sendback dispatch 1+ |

### reset-confirm
| 対象 file | 変更 | 検証 |
|---|---|---|
| `pages/Observatory.tsx:60-86` | handleReset 直結を confirm Modal 経由に (既存 primitive 流用) | grep: onClick handleReset on button 0、check:no-op pass |

### status-badge-resolver
| 対象 file | 変更 | 検証 |
|---|---|---|
| `pages/CaseDetail.tsx:116,135,43-44` | StatusBadge を `caseStatusToTone/Label(liveStatus)` 経由に、LifecycleStepper を `buildLifecycle(liveStatus,...)` 再計算。`liveStatus = entity?.status ?? c.status` | grep: `tone="primary"` 0 / resolver hit |
| `data/mock-case-detail.ts:30-46,164,193-242` | CaseDetailModel に `status: CaseStatus`、buildCaseDetail 返却に status、canonical 0142 に `status:'ready'`、buildLifecycle export 化 | detail-routing tone test (reflected→success 等) |

## 5. ★ Judgement Gate (user 判断が要る決定)

各 gate は「問い + 選択肢 + 推奨」。推奨は付すが決定は user。Wave 0 で AskUserQuestion 提示。

| # | 決めるべき問い | 選択肢 | 推奨 |
|---|---|---|---|
| 1 | **B1 action 設計** | (a) `case/override` 1 本に value 追加 (最小) / (b) `case/confirm` (申請書類値確定) と `case/override` (手入力) を 2 action 分離 (契約 §4.1 の accept/override を型で表現) | **(b)** 意味論が正確で Tech Debt 回避。B4 統合の signature 調整が +1 action 分だが加法的で衝突小（実装整合 2026-05-30: 最終実装は単一 `case/override` に統合、§監査者 gate 既定 Gate 1 注参照） |
| 2 | **B3 UC-BO-02 承認率の分母** | 820 (Observatory 現値) / 980 (AgentDetail 現値)。mock-fixture §5 未定義、どちらも synthetic | **要 user 確定** (業務 anchor が無いため推奨を出せない。1 つ選べば SSOT 化で grep gate が drift を封じる) |
| 3 | **B3 検証 fixture 分離方式** | (A) seed 除外 = 業務母数 13、type 不変 / (B) CaseEntity に isVerification = 母数 28 維持、Cases pagination 検証残る | **(A)** B1/B4/sendback との CaseEntity 衝突面を増やさない。ただし pagination 検証は test-only 注入で別途確保 (案B 選択時は Wave 1 に field 繰り上げ) |
| 4 | **B4 SoD 強制度 + mode toggle** | 強制: (a) reducer hard-block + persona switcher / (b) UI disabled-only / (c) **scope-0** (表示のみ、R1-3 に全 carve)。toggle: (a) 完全廃止 role 固定 / (b) demo-only persona switcher 分離 / (c) toggle 残置 | **強制 (a) + toggle (b)**。契約忠実かつ demo 性両立。ただし IA に persona switcher (新 chrome) を足すため ia-overview-v2 影響を許容するか確認 |
| 5 | **flywheel Gate A/B/C** | A (lineage IA): (i) section 追加 / (ii) view 切替新設 / (iii) 監査 tab。B (togglePause): variant 0 無変更 / variant 1 emergencyStop 分割。C (kill-switch 配置): footer 第2 cluster / 補助・header | **A=(i) 必須 + (ii) P1 carve、B=variant 1 (Wave 1 集約)、C=header 緊急コントロール**。(ii) は R3-7 前倒しになるため R0 雛形に留める |
| 6 | **B2 実体化範囲** | (A) 口座開設 case を参照専用 historical のみ (B2 単独完結、Cases 一覧に出ない) / (B) B3 統合で正規 CASE_LIST 入り (一貫、seed 契約拡大) | **(B)** B3 と pair で「口座開設業務を mock 上で実在させる」一貫作業。SSOT を B3 に寄せ historical 二重登録を解消 |

## 6. 検証 Gate

**各 wave 末に `npm run check:all` (lint + check:no-op + test + build) を実行する。** check:no-op は button の `onClick/disabled/type` を AST 検出する gate であり、button を新設/改変する全 wave (B1 入力 button / B4 disabled button + Sidebar / flywheel kill-switch / reset confirm) で pass 条件を満たすことを受入基準とする (Wave 1/2 の従来 gate に check:no-op を明示追加)。

**test の TS resolution エラーの扱い**: 本計画は action union を必須 field 化するため、既存 test が旧署名で dispatch する箇所は compile error になる。これは「同時更新が必要な箇所」を `_exhaustive: never` と tsc が機械的に洗い出すための safe collision であり、エラー放置で gate を通すことは禁止。具体的に同時更新が必須な test (verified):
- `store.test.ts` の override dispatch 2 箇所 (line 59-67 単体 + 68-72 D1 フロー) を value 付き署名へ。
- `store.test.ts` の sendback dispatch 全 3 箇所 (line 45 + immutability line 95 + reset line 99) を reason/category 付きへ。
- `store.test.ts` の `CASE_LIST.length` assert 4 箇所 (line 11,117,123,130) を分離方針 (案A=業務 case 数 / 案B=据え置き) に整合。
- `hub-model.test.tsx` line 19 (UC-BO-02 total 0→5) **かつ line 20 (UC-BO-01 total)** を `caseOrder.length` 直書きから `workflowId==='UC-BO-01'` filter 件数へ (同一 it 内の同時 assert、片方だけ直すと当該 test が red のまま gate を通過できない — must-fix)。
- test dir に対しても negative grep gate (`case/sendback`/`case/override` の引数無し dispatch 0 件) を張る。

**B1-B4 ごとの screen-level evidence** (dev server port 5174 + Playwright MCP、design-test-fidelity 準拠で実コンポーネント + app context):

| 項目 | 画面 | 目視確認 |
|---|---|---|
| B1 | CaseDetail (CASE-2026-0142 ビル名) | 「手入力で上書き」で訂正値入力→確定→確認済行が AI 値 (サンプルビル) でなく訂正値表示、modal 再 open で訂正値が出る |
| B2 | /proposals/PROP-2026-024 → 「元の案件を開く」 / /agents/agent-account-opening | 着地 detail が口座開設書類 (document.title='口座開設書類')、法人住所変更届が出ない。双方向 link 往復が動作 |
| B3 | Hub process card / Observatory / AgentDetail (3 画面) | 口座開設「案件 5 件」表示 + 口座開設 KPI が 3 画面で同一分母 (store-truth と static-KPI の矛盾解消) |
| B4 | CaseDetail | 入力者が自己承認不可 + SoD 理由表示、persona 切替後に最終承認可。bulkApprove で自分が入力承認した案件が skip + 件数可視化 |
| flywheel | Observatory / AgentDetail / Agents | proposal 承認→lineage に「承認済」出現。緊急停止→header「緊急停止中」+ 一覧反映 + 昇格 button disabled |
| sendback | CaseDetail / ProposalDetail | ready 案件を理由付き差戻し→理由再表示。reflected/sent-back で差戻し button が disabled (false-action 防止) |
| reset | Observatory | データ初期化が confirm Modal 経由 (即時 reset しない) |
| status-badge | CaseDetail (各 status) | reflected→success/反映済、sent-back→alert/差戻し再処理、business-approval-waiting→slate/承認待ち。承認操作で badge + stepper が即時前進 |

**Session 4 demo-script 整合**: B4 hard-block + persona switcher は単一 localStorage + last-write-wins の単一端末 demo で承認者 journey に persona 切替を要する。Wave 3 gate で demo-script (入力者→承認者 遷移) を実走し詰まらないことを確認 (switcher 未実装だと demo 詰み)。

## 7. リスク & Stop 条件

**Cross-cutting risk**:
- **SCHEMA_VERSION 二重 bump**: B1/B4/sendback が個別に 2→3 すると version 競合。Wave 1 で 1 回集約しないと旧 v2 localStorage が field 欠落のまま読まれ overlay で undefined アクセス。persist guard と bump を必ずセット。
- **exhaustive never の両刃性**: 新 action (session/switchActor / proposal/sendback) の reducer 書き忘れは compile error で安全検出されるが、複数項目が action を足すため Wave 1 で全 case 網羅の最終確認が必須。片側 patch だけだと build red。
- **B2↔B3 循環依存**: 個別 JSON は B2.dependsOn=B3 かつ B3.dependsOn=B2 で循環。Wave 2 で B3 (list/seed owner) を B2 (detail consumer) より先行させ循環を断つ。順序を誤ると detail が法人住所変更のまま or NotFound、二重定義。個別 dependsOn は waves に従う (一方向: B3→B2)。
- **static mock dead 値の Tech Debt 再生産**: HUB_PROCESSES.total/dist を useHubModel が上書きする現設計を残すと口座開設追加後も dead。これは B3 root cause と同型 — defer せず物理削除して「store 派生が唯一 source」を型で強制 (critical-review should-fix)。
- **検証 fixture 分離 (案A) の副作用**: seed 除外で母数 13 → Cases pagination/sort 実動検証 (R0-6) のカバレッジ低下。test-only 注入を別途用意。
- **R0 非統制 disclaimer の継承**: SoD/lineage/kill-switch は統制ではない。PrototypeModeLabel + staging「未承認ヒント」disclaimer 維持。R0 完了 = 触れる demo まで、本番 go ではない。
- **scope creep の監視**: B2/flywheel 双方向 link・Observatory lineage view IA 再設計・status-badge before/after は P0 を超える観測性向上。必須分と P1 を分離し、必須分のみで P0 が閉じることを Wave 3 gate で検証。

**後戻り条件**:
- gate (3) で案B 採択なら CaseEntity field を Wave 1 に繰り上げ (Wave 2 で再度 types/persist を触る後戻り回避)。
- gate (5-B) で variant 1 採択なら togglePause 命名整理を Wave 1 union 集約で実施 (Wave 3 で store 再変更回避)。

**Early-stop signal**:
- **Wave 0**: drop/scope-0 を選んだ項目は後続 wave items から削除 (gate 4-c で B4 を全 carve した場合 B4 と flywheel SoD 依存部を除外)。
- **Wave 1**: union 統合が compile 通らない / test red が残るなら基盤統合を中止し 1 項目ずつ単独 PR に分割 fallback。
- **B3**: 検証 fixture 分離の代替路 (検証専用 route / test-only 注入) が Wave 0 で未確定なら、fixture 分離部分を保留し KPI SSOT 化のみ先行する分割を許容。
- **SCHEMA_VERSION bump タイミング**: bump を含む Wave のデプロイは Session 4 demo 当日と分離 (当日 localStorage 初期化で demo state 消失を回避)。

## 8. 工数サマリ

AI coding agent 基準。AI work / human review / judgement を分離。

| 項目 | AI work | human review | judgement | 主な review 負荷 |
|---|---|---|---|---|
| B1 override-persist | M | S | med | action 設計選択 (gate 1) |
| B2 evidence-integrity | L | M | med | 口座開設 detail の視覚 parity (DocumentViewer) screenshot |
| B3 kpi-fixture-ssot | M | S | med | 分母確定 (gate 2)・fixture 分離 (gate 3) |
| B4 sod-actor | M | M | high | SoD 強制度 + IA persona switcher (gate 4) |
| flywheel | L | M | high | lineage IA + kill-switch 配置 (gate 5) |
| sendback-reason-guard | M | S | med | precondition × disabled 整合 |
| reset-confirm | S | S | low | 単一 file・既存 primitive |
| status-badge-resolver | S | S | low | 文言 visible change (gate) |

**合計感**: AI work は集計 ~M-L 規模だが本質的難所は judgement gate の確定 (高 stakes な実装負荷ではない)。最大の human review コストは B2 の口座開設 detail 視覚 parity と B4 の IA/demo-script 整合 (視覚判断 + demo 詰み防止)。external waiting なし。risk は store hot file の同時編集衝突に集中するが、exhaustive never + grep negative gate が機械検出する。

**推奨 sprint 区切り**: Wave 0 (判断、~30min の AskUserQuestion + user 回答待ち) → **Sprint A = Wave 1** (store 基盤 1 patch、ここで SCHEMA_VERSION bump を 1 回集約) → **Sprint B = Wave 2** (mock data、2a→2b 直列) → **Sprint C = Wave 3 必須分** (UI 配線、P0 close) → 任意 **Sprint D = Wave 3 P1** (双方向 link / lineage IA / before-after)。各 sprint 末に `npm run check:all` + 該当 screen evidence を gate とし、red なら次 sprint 着手禁止。SCHEMA_VERSION bump (Sprint A) と Session 4 demo は別日に配置する。

---

**この計画の主要ファイル**: 実装対象 root = `/Users/shinjifujiwara/code/active/backoffice-ai-v2/prototype-redesign/`。基盤 hot file = `src/store/{types,reducer,persist,seed,hooks}.ts` + 新規 `src/store/actors.ts` / `src/data/mock-kpi.ts`。検証 gate = `package.json` (`check:all`) + `scripts/check-no-op.mjs` + `src/__tests__/store/{store,hub-model}.test.tsx` + `src/__tests__/pages/detail-routing.test.tsx`。reconcile 対象 = `prototype/audit/production-remediation-plan.md` (Change Log に R0-15..R0-22 を audit P0 番号併記で 1 回追記)。
