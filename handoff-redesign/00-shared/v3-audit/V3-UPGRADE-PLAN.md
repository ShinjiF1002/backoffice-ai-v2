# backoffice-ai-v2 / prototype-redesign — v3 アップグレード計画 (execution-ready)

**日付**: 2026-05-31 ／ **由来**: v3 production-readiness 監査 (`final-ledger.json` 56 confirmed canonical findings = P0 3 + P1 27 + P2 20 + P3 6、rejected 0) ／ **対象**: `prototype-redesign/src` ／ **frame**: 最大網羅 (統制完全可視化 + frontend 本番級 + 不在統制画面の新規 UI 化) ／ **規制 frame**: US 主軸 (**SR 26-2** = OCC/FRB/FDIC 合同 MRM 改訂 2026-04-17、SR 11-7 / OCC 2011-12 を supersede; **生成・agentic AI は MRM scope 外** = 脚注3 / NYDFS Part 500) + JP 補助 (FSA MRM・AI DP / FISC) ／ **層B backend**: 全 wave scope-out 維持 (統制は UI 上に honest に表現)。**規制 honesty (lock)**: F-039 / L4 の model governance surface は「embedded な非生成 model に SR 26-2 原則を適用した governance を represent」+「SR 26-2 が scope 外とする agentic 層は組織判断の good-practice を honest に可視化」であり、**規制準拠 (compliance) を主張しない**。primary source: [SR 26-2](https://www.federalreserve.gov/supervisionreg/srletters/SR2602.htm)。

> **本計画の SSOT 位置づけ**: 本 file は v3 remediation の **実行 SSOT**。`remediation-roadmap-p0-p1-p2-2026-05-29.md` (= W0-W3 の as-built SSOT) を **継承・supersede** する後継であり、v3 監査が発見した 56 finding を flawless bar まで remediate する。各 wave 完了時に roadmap §4末 closure ledger と本計画の finding→wave 表 (§4) を同期する。
>
> **plan-lock (重要、as-built 更新済)**: `backoffice-ai-v2/CLAUDE.md`「Plan に書かれていない変更は禁止」+ `remediation-roadmap` が scope SSOT。本計画の **W1-W6 は既存 15 画面の remediation** ゆえ画面追加を伴わず plan-lock 内。**当初 plan は W7 (F-039) を net-new route と想定し plan-lock 手続きを置いたが、as-built では F-039 を Observatory「モデルガバナンス」tab + Agents/AgentDetail 拡張で実装し画面数 15 を維持したため、`remediation-roadmap` 画面 ledger の更新は不要となり plan-lock 手続きは発生しなかった** (§3.W7 / 上記 as-built banner 参照)。

> **W1 as-built closure (2026-05-31、実装済)**: **F-001 / F-002 / F-003 完了・検証済**。`npm run check:all` green = **225 test** (W1.5 後; selectors 4 / audit-events 5 / persist 4 追加) / build / design-gate 0 / lint 0。`audit-v3-capture.mjs` full 再走 = **74 cell axe serious 0/0** (W1 後維持、`/tmp/bo-v3-audit/evidence-w1` + `capture-w1d.log`)。詳細 as-built は `BUILD-PROGRESS.md`。
> - **F-002 実装 scope**: case 操作 (create/approve/override/sendback/escalate/reverse) を append-only `auditEvents` に記録。**agent/proposal の event 記録は W3** (F-014/F-015 と同 wave、LedgerEvent は case-centric)。**action label の JP 統一** (seed の英語 `business_approve` 等) は **F-032 / W5**。
> - **F-018 data-model 決定 (証跡 SSOT 二重化回避、lock)**: **`auditEvents` が who/when/action の canonical 証跡 SSOT**。`CaseEntity` は操作 state のみ (status / sendback / reversal{kind,reason} / escalation) を保持し、**audit metadata (actor/timestamp) を denormalize しない**。よって **F-018 (W2) の「reversal who/when」は `auditEvents` の reversal event から表示**する (`CaseEntity.reversal` に actorId/timestamp を足さない)。これにより証跡の責任境界が単一化する。
> - **W1.5 (closure sync)**: persist shape guard を **同一 version の malformed auditEvents/auditSeq (非 array / 非 number) で fallback** するよう補強 + test。`withAuditDefaults` (両 load path 共有) は欠落のみ補完。

> **★ 全 wave as-built closure (2026-05-31、CR 反映済)**: **W1-W7 すべて実装・検証完了**。`npm run check:all` green = **vitest 272 test (31 file)** / lint 0 / no-op 0 / check:design 0 / build OK (baseline 212 → +60)。**live axe (Playwright + axe-core、`audit-v3-axe-sweep.mjs`)**: 15 route + モデルガバナンス tab + escalation 裁定面 + reflected + loading + 2 modal 計 **22 surface で serious/critical = 0**。**56 finding を disposition** — working-tree 独立検証 (workflow wx50pzau4) で 56/56 実在確認、**implemented 55 / accepted deviation 1 (F-045 — 中核欠陥は修正済、suggestedFix の seed padding は artificial と判断し defer、`closure-ledger.json` に judgment 記録)**。うち F-004/F-005/F-049 は W1/W2 既解消を live 検証で確認しコード変更なし。「56 件すべて closed」ではなく「**55 implemented + 1 accepted deviation**」が正確な完了表現。
> - **W7 approach 変更 (本計画 §3 W7 / §4 末で SSOT 化済)**: F-039 は当初 plan の「新規 route /models」でなく、finding の route 指定/suggestedFix に従い **Observatory「モデルガバナンス」tab + Agents/AgentDetail 拡張**で実装。**route count は 15 維持 (16 へ拡張せず)** → **remediation-roadmap 画面 ledger の plan-lock 手続きは発生せず不要**。よって本 file 旧記述の「net-new 画面 / 15→16 / 専用 route」は §3 W7 の as-built が supersede する。
> - **closure 台帳の位置づけ**: `final-ledger.json` は **監査入力の原本 (immutable)** として保持。56 件の closure status/evidence は `BUILD-PROGRESS.md` 末尾の wave 別 closure ledger + `closure-ledger.json` (working-tree 照合済) を SSOT とする。

---

## 1. v3 の定義 (flawless bar)

v3 = 「どのユーザ・コンプラ・リーガル・当局担当者が見ても一切指摘できない、本番品質の中でも際立ったフロントエンドプロトタイプ」。56 finding を remediate した結果、4 本柱で以下が達成される。

| 本柱 | v3 で達成される状態 | 根拠 finding (代表) |
|---|---|---|
| **Truthfulness** (虚偽/誤認/honesty) | 案件の (入力者, 承認者) actor が全 surface で単一 SSOT。手動起票案件が AI/OCR/押印を捏造しない。全 mock 文書に押印・署名の mock 明示。KPI が「実績」でなく仮説として framing され分母が SSOT 一致。提案 metric が spec 準拠 %。flywheel lineage の根拠と原本が整合。reversal が who/when を持つ。disclaimer (PrototypeModeLabel) が常時 AA で可視。Hub freshness が虚偽固定値でない。 | F-001, F-006, F-051, F-019, F-022, F-021, F-018, F-052, F-053, F-054, F-055 |
| **Control-Legibility** (統制の可視性) | 監査台帳・KPI・lineage が store-truth を subscribe し操作が append-only に記録 (or honest disclaimer)。escalation/reversal が永続マーカーで可視。kill-switch が trust を実降格し再開が確認+理由必須。SoD 強制が 3 承認層 (案件/手順/設定) で一貫し identity ベース、self-approval block が live で発火。escalation 裁定が業務責任者に lock され肯定経路を持ち closure する。 | F-002, F-013, F-014, F-015, F-016, F-017, F-042, F-007, F-020, F-024, F-040 |
| **Craft** (完成度) | 全 viewport で CJK 見出し/決定根拠表が判読可 (mobile 縦折れ解消)。PageHeader/Toast が単一 primitive に集約され密度統一。台帳 filter chip が業務語。検索 control が単一。状態遷移/modal に signature motion。 | F-003, F-004, F-005, F-023, F-036, F-027, F-032, F-037, F-035, F-041, F-049 |
| **Distinction** (際立ち) | 防御 = 全 route で axe serious 0、全 finding closure。攻め = flywheel を Observatory↔AgentDetail↔ProposalDetail を貫く視覚 motif に昇華、escalation 旗艦面が初期 live content、状態確定の micro-interaction、model inventory/drift 監視/独立検証という不在統制を Observatory「モデルガバナンス」tab で表現し「規制対応の深さ」自体を差別化点にする (as-built: route 非追加)。 | F-028, F-035, F-039 + §5 攻めリスト |

**「際立ち」の攻めの差別化点 (防御を超える 4 点)**:
1. **Flywheel を製品の視覚 motif に**: 差戻し→改善ヒント→手順承認→設定承認の lineage を Observatory・AgentDetail・ProposalDetail で共通 timeline component として貫通させ、「差戻しを次の正解手順に変える」中核 message を UI 構造そのもので体現 (F-035, F-028)。
2. **Model risk governance surface (F-039)**: SR 26-2 / FSA MRM が要求する model inventory・trust 昇格の独立検証・drift/bias 監視を **Observatory「モデルガバナンス」tab** で表現 (as-built、新規 route でなく監視 view に集約)。規制担当が「どのモデルがどの統制下か」を一目で追える surface は同種 prototype に通常存在せず、際立ちの中核。
3. **Append-only audit trail の生きた可視化**: 操作者自身の session 操作 (起票/承認/差戻し/reversal/緊急停止) が台帳に時系列で append され、自分の作業が監査証跡に残る様を demo で見せられる (F-002 連動)。
4. **Signature micro-interaction**: 状態確定 (LifecycleStepper 段階点灯) と modal 開閉に regulated UI 規律内 (motion budget T1 ≤5 event、prefers-reduced-motion で off) の控えめだが reference-grade の motion を付与 (F-035)。

**falsifiable な完了条件**: 全 route で axe serious = 0、56 finding すべてが verification gate を通過 (working-tree 独立検証で実在確認)。**as-built**: 55 finding は expectedFlawless を満たし、1 finding (F-045) は中核欠陥を満たしつつ suggestedFix の seed padding を accepted deviation として defer (`closure-ledger.json` の judgment 参照)。完了表現は「56 closed」でなく「**55 implemented + 1 accepted deviation**」。

---

## 2. アーキテクチャ方針 (全 wave 共通、tech debt 回避)

| 原則 | 適用 |
|---|---|
| **SSOT 単一化** | actor 解決 (F-001)・台帳行生成 (F-002)・status→tone・reconcile-display は単一 helper/selector に集約し、画面ローカル再宣言を禁止。手書き重複 (PageHeader/Toast、F-036/F-027) は primitive 化して drift 源を断つ。 |
| **token 経由の一括是正** | contrast (F-003/F-004/F-005/F-049) は `index.css` token 層で直し、消費側は token 参照のまま波及させる (off-token hex 禁止規律維持)。 |
| **store-truth driven** | 監視 surface (台帳/KPI/lineage/inbox) は静的 fixture を store-derived selector に置換 (F-002/F-013/F-017/F-048)。fixture 温存が妥当な箇所は honest disclaimer で代替。 |
| **identity-based SoD** | 既存 `isSelfApproval(requesterId, currentActorId)` helper を 3 承認層で再利用 (F-015/F-042)、role 派生だけに依存しない。 |
| **加法的 schema 進化** | CaseEntity に `origin:'manual'|'ai'` (F-006/F-007)、escalation に `from`/`escalatedAt`/`resolution`(表示用、who/when は auditEvents) (F-016/F-017/F-044) を加法追加。**reversal の who/when は CaseEntity に持たず `auditEvents` の reversal event を canonical とする** (F-018、上記 F-018 data-model 決定)。SCHEMA_VERSION bump を伴う wave のデプロイは demo 当日と別日 (roadmap §6 継承)。 |
| **継承デザイン規律不変** | token / lucide icon / chip taxonomy / tone v2 / status-tones SSOT / JP-only は不変。新 visual language は導入しない (`#635bff` 維持)。 |

---

## 3. Remediation Wave 計画 (severity + 依存で順序化)

依存グラフの要点: **F-002 (store-truth 台帳) と F-018 (reversal event)・F-014 (kill-switch event)・F-027 (toast→audit entry)・F-048 (KPI 母集合) は台帳基盤に依存**するため、F-002 を最初の P0 wave で土台化し後続 wave がそこに append する。**F-003 (token AA) は F-004/F-005/F-049/F-052 の contrast 系を巻き取る**ため最初に token 層を確定する。**F-001 (SoD identity 単一化) は F-041/F-042 の SoD demo path・F-024/F-025 の persona 整合の前提**。

### W1 — P0 (3 件): 規制致命 + systemic a11y の土台

> 致命度最高 + 後続 wave の依存土台。SCHEMA bump を伴う (F-002 escalation/reversal 基盤の準備)。

#### F-001 SoD identity 単一化 (truthfulness, P0)
- **修正 approach**: 案件の (入力者 actor, 承認者 actor) を単一 SSOT 化。一覧/承認待ちが owner 文字列 (`CASE_DETAILS[id].inputter`) を表示し、詳細が store の `inputApprovedBy` を表示する二重 source を統合。`inputter`/`approver` を解決する単一 helper を lib に新設し CaseDetail と Approvals が共用。「画面上の入力者=現操作者」なら最終承認を disabled にし self-approval block を発火。
- **対象 file:line**:
  - `src/pages/Approvals.tsx:75` `inputter: CASE_DETAILS[e.id]?.inputter` → store 由来 `actorById(e.inputApprovedBy)?.name` に置換。
  - `src/store/seed.ts:35` `inputApprovedBy: row.status === 'business-approval-waiting' ? DEFAULT_ACTOR_ID : undefined` → 一律 `DEFAULT_ACTOR_ID` でなく案件 owner 由来 actor に解決。
  - `src/store/actors.ts:26` `actorById` + 新設 `resolveCaseActors(entity)` helper (lib or store/selectors)。
  - `src/pages/CaseDetail.tsx:110` `inputApproverName` は既に store 由来 → helper に吸収し Approvals と source 統一。
- **アーキ方針**: 表示と bulkApprove skip 判定の source を単一 helper に揃える (bulkApprove は既に store 由来 `inputApprovedBy` を見ているため、表示側を合わせるだけで一致)。owner=assignee と input-approver=actor を型レベルで分離。
- **検証**: store.test に「同一案件で list/detail/queue/ledger の入力者名が一致」assert 追加。live walk: `/approvals` 行 → `/cases/CASE-2026-0128` 詳細 → footer SoD で「入力者 X ≠ 承認者 Y」の X/Y が queue と一致。`audit-v3-capture.mjs` の facts probe で 0128 の SoD 三者一致を再現。

#### F-002 Observatory を store-truth 駆動化 (control-legibility, P0)
- **修正 approach**: `CROSS_LEDGER`・`KPI metrics`・`OBS_KNOWLEDGE`・`lifecycle` を静的 const から store-derived selector に変更。`state.caseOrder`/`cases` を走査し受付/AI入力(or 手動起票)/入力者承認/承認者承認/反映を deterministic に台帳行へ展開。`OBS_LEDGER` (canonical 0142 rich event) は seed 由来として温存し、store 由来行を append。lifecycle view も対象 case を query 可能に。**最小代替**: store 化が demo リスクなら、台帳 header に「本台帳は代表的な静的サンプルで、本セッションの操作・手動起票は反映されない」disclaimer を置く (操作の不在を記録漏れと誤認させない honest fallback)。
- **対象 file:line**:
  - `src/data/mock-observatory.ts:122-125` `CROSS_LEDGER` module-level const → `useCrossLedger()` selector (`src/store/hooks.ts`)。
  - `src/data/mock-kpi.ts:31-35` frozen `KPI_ROWS` → store 母集合反映 (or disclaimer、F-048/F-055 連動)。
  - `src/store/reducer.ts:111-127` case/create が `state.cases`/`caseOrder` のみ書込 → 台帳 selector が走査。
  - `src/pages/Observatory.tsx:209-213` 台帳 header に disclaimer (最小代替時)。
- **アーキ方針**: 台帳は append-only。store mutation (起票/承認/差戻し/reversal/緊急停止) が selector 経由で台帳行に必ず現れる single source。fixture と store-derived の境界を明示。
- **検証**: `audit-v3-capture.mjs` の manual-entry probe で手動起票案件が台帳に append (`manualCaseInLedger:true`)、approve 後 `ledgerCountUnchangedAfterApprove` が `53→54+` に変化。observatory-drill.test に store 化検証追加。live walk: AUD-02/03/05/GOV-01 journey 再現。

#### F-003 contrast token AA 化 (a11y, P0)
- **修正 approach**: 最頻 semantic token を AA 化。`--color-primary-strong` (#4f46e5 級、eef2ff 上 ~5.0:1) を新設し chip/nav/active text を全て strong 経由に統一。neutral muted を panel-inset 上 AA pass する `fg-tertiary` (#475569 ~7:1) へ降格。PrototypeModeLabel は規制告知ゆえ AA 必達 (F-052 と同時)。
- **対象 file:line**:
  - `src/index.css:21` `--color-primary` 周辺に `--color-primary-strong` 追加。`:17` の `--color-fg-muted` AA 未達コメントが既に self-document。
  - `src/components/shared/MetaChip.tsx:17`, `StatusBadge.tsx:31`, `FilterChip.tsx:53` (bg-primary-soft text-primary → text-primary-strong)。
  - `src/components/shell/Sidebar.tsx:114,160` active nav primary text → strong。
  - 操作者ラベル/EmptyState description の muted-on-inset → fg-tertiary。
- **アーキ方針**: token SSOT で一括是正、消費側は token 参照のまま波及。off-token hex 禁止規律維持。
- **検証**: `audit-v3-capture.mjs` 全 15 route で color-contrast = 0 (現 74/74 cell fail → 0)。routes-axe.test を gate 化。
- **依存巻き取り**: F-004/F-005/F-049/F-052 は別 token・別箇所だが本 wave で token 層を確定し W2/W4/W5 で消費側を是正 (token 不在による手戻り回避)。

**W1 verification gate**: §4共通 gate (下記)。**特に** color-contrast = 0 (全 route) + SoD 三者一致 + 台帳 store-truth append を必達とする。

---

### W2 — Truthfulness P1 (押印/署名 mock 化・捏造 AI 表示・metrics hedge): 9 件 (F-007 含む)

> **as-built (2026-05-31)**: 4/9 done — F-006/F-007/F-051 (手動起票 honesty) + F-018 (reversal who/when = auditEvents-canonical + dead-end 解消)。残 5 = F-021 / F-022 / F-025 / F-026 / F-052。詳細は `BUILD-PROGRESS.md`。

> 規制 honesty の中核。F-001 が解決した actor SSOT の上に積む。

| finding | 修正 approach | 対象 file:line |
|---|---|---|
| **F-006** 手動起票が AI/OCR/.pdf/押印を捏造 | `CaseEntity.origin:'manual'|'ai'` を加法追加し表示分岐。手動起票は専用 lifecycle builder で AI処理 step を omit (受付=手動起票→入力者入力→承認者承認→反映)、左 pane を「手入力値の控え（書類画像なし）」、捏造印影を出さない、右 panel 見出しを「入力項目（手動起票）」 | `mock-case-detail.ts:350` `buildManualCaseDetail` / `:202-209` AI step / `:226` 押印 push / `:343-349` `.pdf` fileName; `ReconcilePanel.tsx:34` 見出し; `reducer.ts:111-127` origin 付与 |
| **F-007** 手動起票直後に全項目「確認済」自動成立 | 起票直後を `needs_review` 相当「手入力・要自己確認」にし、入力者の明示確認後に `manually_confirmed` へ。最低限 label を「手入力確認済」とし AI 照合確認と弁別 | `mock-case-detail.ts:331` 全 field `manually_confirmed` 固定; `reducer.ts:121` flags:0; `ReconcilePanel.tsx:38,112` |
| **F-018** reversal が who/when 欠落・台帳非記録・dead-end | **who/when は `auditEvents` の reversal event を canonical とする** (F-002 で `case/reverse` は actor=操作者・ts 付きで記録済 ＝ 台帳化は完了)。CaseDetail の reversal banner / lifecycle はこの event 由来で「いつ・誰が 訂正/取消したか」を表示 (`CaseEntity.reversal` は {kind,reason} のまま、actorId/timestamp を足さない)。reversed→sent-back 着地後 LifecycleStepper/ReconcilePanel/banner を「訂正/取消反映済」表示に分岐し承認 CTA を出さない。sent-back→ready 再処理 action を追加し loop を閉じる | `CaseDetail.tsx` banner (auditEvents 参照) / `LifecycleStepper.tsx` / `ReconcilePanel.tsx` / `reducer.ts` (sent-back→ready 再処理 action) |
| **F-021** flywheel lineage 起点と原本が矛盾 | `HISTORICAL_CASE_ROWS` 各行に差戻し→是正履歴を持たせ change.to を修正後正値に (0098 ビル名を「サンプルビルディング」に)、参照専用 banner/lifecycle に「過去に差戻し後 是正・再反映」追記。または sourceCases コメントを原本の反映済表示と整合させる | `mock-proposal-detail.ts:80-83` sourceCases; `mock-case-detail.ts:294-298` `HISTORICAL_CASE_ROWS` / `:254-256` / `:202-217` |
| **F-022** proposal metric が raw decimal で spec 乖離 | metric 値を spec 通り % 表記 (92%/≥95%) にし raw decimal を出さない。「mock 値」注記を metric 表に付す。raw confidence 非表示制約遵守 | `ProposalDetail.tsx` metric 表示 |
| **F-025** ハブ「あなたが判断する案件」が default persona で偽 | `useCurrentActor().role` が business-approver でなければハブに「業務責任者に切替えてください」inline hint。権限の無いキューでは action 前に disabled 理由を事前提示。または demo 既定 persona を承認者に | `BusinessApproverHub.tsx:42`; `Approvals.tsx:117-124` |
| **F-026** error/loading でも Approvals 件数/caption 残存 | ヘッダ件数を `list.status` 依存に (error/loading は非表示か「—」、ready のみ実数)。caption を `effectiveStatus==='ready'` のみ表示 | `Approvals.tsx:95`; `DataTable.tsx:439` |
| **F-051** 全案件で「押印済」を一律捏造 | DocumentViewer に prototype watermark + 押印/署名を mock 明示 (実データ駆動 or「サンプル/モック」ラベル)。F-006 の手動起票分岐と整合 | `DocumentViewer.tsx` |
| **F-052** PrototypeModeLabel が AA 未達 + 折り畳み依存 | 唯一の包括 disclaimer を AA token (W1 token) + 常時可視 pill 化、折り畳み非依存。法務観点で免責が機能する状態に | `PrototypeModeLabel.tsx` |

**W2 gate**: §4共通 + L3-legal/L4-regulator の honesty probe (lifecycleMentionsAI:false for manual / claimsStampSignature:false / metric % / disclaimer 常時 AA) が pass。journey GOV-04 (over-claim 監査) live walk。

> 注: F-019/F-053/F-054/F-055 (truthfulness 系) は finalSeverity P2 ゆえ W5 に配置 (§4 表参照)。

---

### W3 — Control-Legibility P1 (escalation/reversal 永続マーカー・kill-switch 実効化・SoD 到達性・lineage 可視化): 9 件

> 統制の可視性。F-002 (store-truth) の上に escalation/reversal/promotion event を積む。

| finding | 修正 approach | 対象 file:line |
|---|---|---|
| **F-013** escalation 後に永続マーカー無し | `entity?.escalation` banner を sendback/reversal banner と同 pattern (alert tone) で追加。`/cases` 一覧に escalation!==undefined のとき「裁定依頼中」chip (status-tones SSOT 経由)。再エスカレ抑止 | `CaseDetail.tsx:175,187` banner 条件; `Cases.tsx` status/meta 列 |
| **F-014** kill-switch が cosmetic + 再開が無理由 | `emergencyStop` で trust を `supervised` に降格 (型コメント `types.ts:74,110` と実装を一致)。`resume` に確認 modal + 再開理由必須を追加し pausedReason を消さず履歴化。停止/再開を台帳 event 化 (F-002 連動) | `reducer.ts:194-203`; `AgentDetail.tsx:115-126` resume; `types.ts:74,110` |
| **F-015** 設定承認 SoD が role 分離のみ・代表 route 到達不能 | `ProposalEntity` に `forwardedBy:actorId` 追加し proposal/forward で記録、proposal/approve で `isSelfApproval(forwardedBy, currentActorId)` を block (案件と同 helper 再利用)。`canOwnerAct` を `useCanApproveProposal(id)` selector に差替え。AgentDetail に設定承認デモ経路 | `reducer.ts:36-38,54,181`; `ProposalDetail.tsx:46,82-83` |
| **F-016** escalation 裁定が lock されず肯定経路無し | `case/resolveEscalation` action 追加: `proceed` は escalation.resolution 記録しキューから外す (status ready 維持)、`sendback` は既存再利用。reducer guard で escalation 存在時のみ resolve 可。CaseDetail で `entity.escalation && mode==='input'` のとき sendback を disable し「裁定待ち」表示、footer に escalated 専用決定面 (続行可/差戻し) | `reducer.ts:85-93`; `CaseDetail.tsx:106,130` |
| **F-017** 裁定後も通知が closure しない・起票者へ因果が戻らない | `useNotifications` の escalation 分岐に status guard 追加 (useEscalations と同条件)、または reducer の sendback/reverse 時に `escalation.resolved` を立て両 selector が参照。`escalation` 型に `from`(起票 actorId) 追加し裁定完了通知 kind を追加 | `hooks.ts:350` useNotifications / `:388` useEscalations / `:323`; `types.ts` escalation |
| **F-020** 0 件 export でも成功 toast | export onClick を `ledgerRows.length===0` で guard (button disable or toast に row count 含める) | `Observatory.tsx:214-221` |
| **F-024** 業務責任者ハブ 2 カードが同一着地 + 同名 link 衝突 | 2 receptacle href に `?kind=proposal`/`?kind=promotion` を付与し ConfigApprovals で `useSearchParams` で初期 filter/tab。カード数字 span に `aria-hidden`、Link に `aria-label`。H1 を両系統包含語に | `BusinessApproverHub.tsx:28-29,60-71`; `ConfigApprovals.tsx:46,36-39`; `Sidebar.tsx:61` |
| **F-042** self-approval block が dead path・demo で発火せず | `DEMO_ACTORS` に兼務 actor 追加 or CaseDetail に currentActor が `inputApprovedBy` と一致する checker-mode 時「四眼原則により最終承認できません」block を明示表示し reducer guard が live で発火する E2E path を 1 本通す。あるいは GOV 文書で「prototype の SoD は role 分離由来、guard は本番 RBAC 用 defense-in-depth」と honest に記す | `CaseDetail.tsx:48`; `actors.ts:17-21`; `reducer.ts:54` |
| **F-007** (W2 で同時着手可、control 側面) | ※ F-007 は truthfulness 主管で W2 配置。control-legibility 観点で W2/W3 跨ぐが二重実装回避のため W2 で完結 | — |

**W3 gate**: §4共通 + escalation/reversal/promotion の永続マーカーと台帳 event が live で確認。journey INP-06/CHK-04/CHK-05/J3/J4/GOV-02/GOV-03/GOV-05/GOV-06 walk。self-approval block が live 発火 (or honest 文書化)。

---

### W4 — a11y + operator-efficiency P1 (?demo seam・sort・breadcrumb・form error SR・skip-link・一括操作): 6 件

> 操作性と a11y の P1。systemic chrome (skip-link/form error) を含む。

| finding | 修正 approach | 対象 file:line |
|---|---|---|
| **F-009** ?demo seam が 6+ route で no-op | 各 route で `const {status,rows,onRetry}=useListData(...)` を呼び DataTable に status/onRetry を渡す (Proposals.tsx:57/71 同型)。fixture-backed route (Observatory/BusinessApproverHub) は disclaimer か共通 demo-state hook | `useListData.ts`; `SearchResults/Notifications/Escalations/ConfigApprovals/Observatory/BusinessApproverHub/AgentDetail` |
| **F-011** queue が経過/要確認/担当 sort 不可 | Cases 経過列に `sortValue:(r)=>r.receivedAt`、確認列に `sortValue:(r)=>r.flags`。Approvals は receivedAt を行に保持し sortValue 付与。Escalations 行に escalatedAt/owner/category 列追加。Search 種別列に sortValue + kind filter | `Cases.tsx:43-50`; `Approvals.tsx:58`; `Escalations.tsx:20-25`; `SearchResults.tsx:24-29`; `DataTable.tsx:287` |
| **F-012** 詳細パンくず「案件一覧」が非クリック span | `CaseDetail.tsx:145` の「案件一覧」span を `<Link to='/cases' className='hover:underline'>` に。決定 footer 付近に「一覧へ戻る」を 1 つ。ProposalDetail/AgentDetail も同様 | `CaseDetail.tsx:142-148`; `ProposalDetail.tsx`; `AgentDetail.tsx` |
| **F-008** 起票/modal エラーが SR 非通知・focus 非移動 | エラー span に `role='alert'` + id、各 input に `aria-describedby`、送信失敗時に最初の無効 input へ programmatic focus。ReasonDialog/FieldActionModal も同様 | `CaseDraft.tsx:122,135-140`; `ReasonDialog.tsx`; `FieldActionModal.tsx` |
| **F-050** skip-link 不在 (WCAG 2.4.1) | AppShell で Sidebar の前に `<a href='#main' className='sr-only focus:not-sr-only'>本文へスキップ</a` を追加し `<main id='main' tabIndex={-1}>` に。Sidebar/TopBar に nav/banner landmark | `AppShell.tsx:18` |
| **F-029** 主要 inbox(/cases) に一括操作無し | Cases.tsx DataTable に `selection={{actions:[{label:'一括で入力者確認', onRun, disabled:(rows)=>rows.some(r=>r.flags>0||r.status!=='ready')}]}}` を配線 (Approvals.tsx:110-128 同型)。個別判断要操作は個別のまま | `Cases.tsx:103-116` |
| **F-004** diff add/del 文字色が AA 大幅未達 (a11y) | diff block 文字色を `--color-success-soft-fg` (#047857) / `--color-error-soft-fg` (#b91c1c) へ。`index.css` の `--color-diff-add/del` を AA 達成色に。W1 token 確定後の消費側是正 | `ProposalDetail.tsx:225-226`; `index.css:41-44` |
| **F-005** Hub hero CTA kicker/detail が AA 未達 (a11y) | `text-white/85` を不透明 white か white@95%以上、または primary-hover 地に | `Hub.tsx:87,89` |
| **F-023** mobile 375px CJK 見出し縦折れ/表 clip (craft) | page header title 行に `min-w-0`+`flex-wrap`、h1 に `whitespace-nowrap`。判定基準表を mobile card 化 or `overflow-x-auto`。LifecycleStepper を sm 未満で `flex-col`/`overflow-x-auto` | `Observatory.tsx:102-106`; ProposalDetail 判定基準表; `LifecycleStepper.tsx` |

**W4 gate**: §4共通 + keyboard-a11y.test に skip-link + form-error SR + main focus 受け皿 assert。`audit-v3-capture.mjs` の form-error probe (errorHasLiveRegion / activeAfterSubmit) + ?demo seam の md5 差分 (loading≠ready≠error)。journey INP-02/INP-09/AUD-05/GOV-07 walk。

---

### W5 — P2 (20 件): minor truthfulness / craft / efficiency / ssot

> 個別影響は小さいが本番品質では指摘対象。token (W1) と primitive (W4) 確定後にまとめて。

| finding | 一行 approach |
|---|---|
| **F-010** 検索 deep-link/URL 同期不能 (operator-eff) → SearchResults で `useSearchParams` 読み復元 + setSearchParams replace、TopBar onSubmit に `?q=`。※roadmap は deep-link scope-out 記載あり、本 wave で再評価し採否を SSOT に記録 |
| **F-019** Observatory KPI を「実績」でなく仮説 framing (truthfulness) → subtitle を hypothesis-explicit、hypothesisLabel を leading badge、分母を `:9` コメントと reconcile (`Observatory.tsx:393`/`MetricVsThreshold.tsx:56`/`mock-kpi.ts:17-26`) |
| **F-027** 統制重要 toast の永続化 + tone 区別 (operator-eff) → shared `Toast.tsx` 新設し 5 page 置換、重要結果は manual-dismiss or audit ledger entry 化 (F-002 連動) |
| **F-029** ※W4 に前倒し配置済 (一括操作) |
| **F-030** inbox dismiss/未読フィルタ/時刻 (operator-eff) → 「未読のみ表示」トグル + receivedAt 由来時刻、承認者宛 reversal/escalation を seed 1 件、空文言 3 kind 反映 |
| **F-031** 台帳に期間 filter/一括 clear 無し (operator-eff) → period selector + 条件付き「クリア」button (`Observatory.tsx:224-260`) |
| **F-032** 台帳 filter chip に英語 schema 露出 (craft/JP-only) → raw→JP label mapping (`Observatory.tsx:264-300`、raw は filter key 保持、table cell は維持) |
| **F-033** 起票 form の型/形式検証/入力支援皆無 (operator-eff) → 日付系 `type='date'`、コードは inputMode/pattern、見出しに `N/5 入力済` (`CaseDraft.tsx:114-132`) |
| **F-034** 手動起票が全 persona 無制限・SoD 注記無し (control) → 起票 form 上部に SoD 注記 1 行 (`CaseDraft.tsx`) |
| **F-035** ※W6 に配置 (distinction、lineage + motion) |
| **F-036** PageHeader 15 画面手書き重複 (craft) → 共通 `PageHeader` component 新設し 15 画面置換 (最低 Observatory.tsx:100 を 12 画面 pattern に) |
| **F-037** desktop /search で searchbox 2 個 (craft、verdict=no-verdict) → SearchResults page input に `lg:hidden` (`TopBar.tsx:33` は hidden lg:flex)。※no-verdict ゆえ着手前に live 再確認 |
| **F-038** config-approvals 混在 queue の sort/filter/ID 体系 (operator-eff) → kind/title に sortValue + filters、promotion row に申請番号、sub-header に「全業務横断」 |
| **F-040** 画面 RBAC 不在・queue が裁定可否を予告せず (control) → ConfigApprovals/Escalations header に裁定者でない場合の注記、useEscalations を role filter or subtitle 明示。本番 route-level RBAC は scope-out 維持 (`actors.ts` 明示) |
| **F-044** escalation 経過列が受付 age・空 category 保存 (truthfulness) → escalatedAt 保存し列を裁定待ち age に or header rename、escalation.category を optional 化 (`Escalations.tsx:32`/`reducer.ts:91`/`FieldActionModal.tsx:94,217`/`CaseDetail.tsx:130`) ※P3 だが truthfulness で W5 に集約 |
| **F-048** 手動起票が KPI 母数/Hub 件数に非反映 (ssot) → KPI 母集合注記 or 台帳 (F-002) 反映、Hub 件数 store-derived 確認 (`mock-observatory.ts:127-135`) |
| **F-049** EmptyState/inbox 未読本文が AA 微割れ (a11y) → description/未読本文を `fg-muted`→`fg-tertiary` (`EmptyState.tsx:44`/`Notifications.tsx:90`、W1 token と同時) |
| **F-053** Hub 「最終更新」static hardcode (truthfulness) → store-derived or 相対表現 or `[仮説]` 化 (`mock-hub.ts`/`Hub.tsx`) |
| **F-054** ConsequencePanel 予測が断定数値 (truthfulness) → 予測値に `[仮説/要検証]` label (`ConsequencePanel.tsx`) |
| **F-055** mock-kpi コメントと実データ 4 種 denom 矛盾 (ssot) → 分母を単一 SSOT 化 or コメント是正 (`mock-kpi.ts`、F-019/F-048 と同時) |
| **F-056** canonical-design-spec の dev assert over-claim (ssot) → C 型 contract の dev assert 実装 or doc 修正 (`canonical-design-spec.md`) |

**W5 gate**: §4共通 + JP-only grep (台帳 filter chip に英語 string 0)。F-037 は no-verdict ゆえ live 再確認後に着手。journey AUD-02/AUD-03/AUD-06/J5 walk。

---

### W6 — P3 + distinction (micro-interaction・motion・header primitive 共通化): 5 件

> 最終 polish + 攻めの差別化。F-036 (PageHeader) は W5 で primitive 化済の前提。

| finding | approach |
|---|---|
| **F-041** 入力者承認後に disabled 承認残存・前向き導線無し (craft, P3) → mode=input かつ status≠ready のとき disabled approve を出さず「承認者の最終承認待ちです」に切替。SoD 矛盾の無い baw 案件を 1 件正準化し承認者ビュー実演 (F-001 前提) (`CaseDetail.tsx` footer) |
| **F-043** 業務責任者ハブ 0 件カードも遷移可・urgent/routine 合算 (operator-eff, P3) → count=0 カードは CTA 非表示 or「新規なし」+ Link を div/aria-disabled、header に escalations 件数を別出し (urgent>0 で alert tone)、urgent tone 点灯 seed 1 件 (`BusinessApproverHub.tsx:49,78,32,30`) |
| **F-045** 単一行 queue で退化 filter・dead query ?view=checker (ssot, P3) → filter options.length<2 で非表示、rowHref を `/cases/${r.id}` に、seed の baw を 2-3 件に (`Approvals.tsx:83-86,105`) |
| **F-046** ProcessSelector scope を検索が無視・reset modal が persona 非明示 (control, P3) → SearchResults サブヘッダに「全業務を横断検索 (業務フィルタ非適用)」、reset modal body に「操作者の選択も入力者に戻ります」 (`SearchResults.tsx:43`/`Observatory.tsx:547-549`) |
| **F-047** TopBar banner landmark 無し・role=status 誤用・dirty overlay 未ラベル・未読 SR 非対称 (a11y, P3) → TopBar を `role=banner`、PrototypeModeLabel の role=status 除去、dirty overlay に alertdialog role+label、未読数変化を aria-live polite で通知 (`AppShell/TopBar`/`PrototypeModeLabel.tsx`/`Modal.tsx`/`Notifications.tsx`) |
| **F-028** /escalations 恒久 empty (distinction, P1*) → 代表 escalation を 1 件 seed (category+reason+escalating actor)、C2「難案件を消さない」を初回ロードで実演可能に (`mock-case-list.ts`/`seed.ts`)。※P1 だが seed-only ゆえ distinction 系として W6 に集約 (W3 escalation 基盤に依存) |
| **F-035** flywheel lineage 未描画 + motion 無し (distinction, P2) → AgentDetail に relatedProposals lineage timeline section 追加。`index.css` に modal-overlay-fade/modal-panel-in keyframe を追加し Modal の overlay/panel に適用。承認確定時に LifecycleStepper 達成段に控えめ pulse/check motion (motion budget T1 ≤5、prefers-reduced-motion で off) (`mock-agent-detail.ts`/`AgentDetail.tsx`/`Modal.tsx:130-145`/`index.css`) |

**W6 gate**: §4共通 + motion が `prefers-reduced-motion` で off (axe + manual)。/escalations 初回 live content。journey GOV-06/J4/CHK-01 walk。

---

### W7 — model risk governance surface (F-039 model inventory / drift 監視 / trust 独立検証): 1 件 / 3 surface

> **as-built 確定 (2026-05-31、当初 plan から approach 変更)**: finding F-039 の `route` 指定 (/agents, /agents/:id, /observatory) と `suggestedFix` (既存画面拡張) に従い、**新規 route を追加せず** モニタリング (Observatory) に「モデルガバナンス」タブを新設して 3 surface を集約実装した。**route count は 15 維持** (16 へ拡張せず)、**verified surface = 22** (15 route + governance tab + escalation 裁定面 + reflected + loading + 2 modal、live axe serious/critical 0)。route 非追加ゆえ **remediation-roadmap 画面 ledger の plan-lock 手続きは不要**となった。

- **修正 approach (as-built)**: SR 26-2 / FSA MRM が要求する基盤統制を、規制担当の自然な着地点 (= Observatory = 監査/監視 view) に集約:
  1. **モデル台帳 (model inventory)**: モデルガバナンス tab に版/用途/所有者/SR 26-2 区分/独立検証状況の表。決定 lineage の `policy:v3.1` を個別 model 版 (ocr-2.4 / cls-1.8 / rule-v3.1 等) に分解。data = 新規 `mock-governance.ts`。Agents 一覧にも「モデル検証」列を追加。
  2. **trust 昇格の独立検証**: モデルガバナンス tab の独立検証 section + AgentDetail に独立検証注記 + ガバナンス誘導。
  3. **drift/bias 監視**: モデルガバナンス tab の drift/bias 監視指標表 (すべて [仮説/要検証] mock)。
- **scope 判断 (drop / scope-0 / 既存拡張 / 新規 route の 4 択)**:
  | 選択肢 | 内容 | 帰結 |
  |---|---|---|
  | **(a′) Observatory タブ拡張** (採用 = as-built) | 3 surface を Observatory「モデルガバナンス」tab + Agents/AgentDetail 拡張で実装 | **route 非追加 → roadmap plan-lock 不要**。監視 view に集約され規制担当の動線と一致。最大網羅を満たす |
  | (a) 新規 route /models (当初 plan) | 専用 route を追加 | 画面 15→16 → roadmap ledger 更新 + Sidebar/nav + route render gate bump が必要。finding の route 指定/suggestedFix は既存画面ゆえ **scope 過剰** |
  | (b) scope-0 + honest 注記のみ | 新規 surface を作らず注記で逃げる | distinction 弱、不採用 |
  | (c) drop | F-039 未対応 | 規制指摘リスク、不採用 |
- **採用変更の根拠**: finding 自身の `route: /agents, /agents/:id, /observatory` + `suggestedFix: Agents 一覧拡張 / AgentDetail section / Observatory drift placeholder` がいずれも **既存画面拡張**を指す。当初 plan の「新規 route」は roadmap lock + nav 追加を伴う scope 過剰ゆえ、Observatory タブ集約に変更。CLAUDE.md「Plan に書かれていない変更は禁止」に対しては、**本 §の as-built 更新を以て plan SSOT を実装に一致**させ整合する (画面数 15 不変ゆえ `remediation-roadmap-p0-p1-p2-2026-05-29.md` の画面 ledger 変更は不要)。
- **honest framing (SR 26-2、primary source 検証済)**: 統制を represent し規制準拠 (compliance) は主張しない。非生成 model (OCR/分類) に MRM 原則適用、reconcile は rule-based (SR 26-2 の model 定義外)、生成・agentic 層は SR 26-2 が明示的に scope 外 (脚注3)、実体は本番の別 module。すべて [仮説/要検証] mock。
- **対象 file (as-built)**: 新規 `src/data/mock-governance.ts` / `src/pages/Observatory.tsx` (governance tab + policy 版分解の表現) / `src/pages/Agents.tsx` (モデル検証列) / `src/pages/AgentDetail.tsx` (独立検証注記 + ガバナンス誘導)。`App.tsx` / `Sidebar.tsx` は **不変** (route 非追加)。
- **検証 (as-built)**: §4共通 + governance tab の live axe serious/critical 0 + `observatory-drill.test` に governance tab 内容 test + axe smoke 追加。route render gate は新 route 無しゆえ bump 不要。

---

## 4. Verification Gate (各 wave 共通) + finding→wave マッピング表

### 各 wave 共通 verification gate

各 wave 完了時に以下を必達 (1 つでも fail なら wave 未完了):

1. **`npm run check:all`** green = `lint` + `check:no-op` + `check:types` (app) + `check:types:test` + `check:design` (off-token hex 0 / lucide / status-tones / JP-only) + `test` (vitest) + `build` (tsc -b + vite build)。
2. **v3 監査ハーネス再走**: production build を `vite preview :4174` で配信し `node /Users/shinjifujiwara/code/active/backoffice-ai-v2/prototype-redesign/audit-v3-capture.mjs` を実行。**axe serious が当該 wave 対象 route で 0 に向かう** (W1 後に全 15 route で color-contrast=0) + 当該 wave の finding probe (SoD 三者一致 / 台帳 store-truth / 押印捏造不在 / form-error SR 等) が expectedFlawless 方向に解消。
3. **該当 journey の live walk 再現**: 各 wave 表の journey ID (`journey-index.json` の 44 journey から該当分) を実ブラウザで walk し、finding の expectedFlawless が満たされることを確認。
4. **回帰防止**: 既存 test 数 (現 working tree で `npx vitest run` = 212 passed / 21 files、2026-05-31 実測) を減らさず、各 wave で新 assert を追加 (fix 前 fail を確認してから green)。baseline は fuzzy 値でなく wave 着手時点の実測 count を SSOT とする。

> **harness 鮮度 (MEMORY: Review against working tree)**: ハーネスは必ず **現 working tree を rebuild した `vite preview`** に対して走らせる。stale build / HEAD に対して走らせない。browser evidence は build 鮮度を疑う。

### finding→wave マッピング表 (全 56 件)

| Wave | finding | finalSeverity | pillar | 主管 | 一行サマリ |
|---|---|---|---|---|---|
| **W1** | F-001 | P0 | truthfulness | actor SSOT | SoD identity 単一化 (list/detail/queue/ledger 一致) |
| **W1** | F-002 | P0 | control-legibility | store-truth | 台帳/KPI/lineage を store-derived 化 (or disclaimer) |
| **W1** | F-003 | P0 | a11y | token | contrast token AA 化 (全 74 cell color-contrast 解消) |
| **W2** | F-006 | P1 | truthfulness | CaseDraft | 手動起票の AI/OCR/.pdf/押印 捏造除去 |
| **W2** | F-007 | P1 | control-legibility | CaseDraft | 手動起票直後の自動「確認済」を要自己確認に |
| **W2** | F-018 | P1 | truthfulness | reducer | reversal who/when 記録 + 台帳化 + dead-end 解消 |
| **W2** | F-021 | P1 | truthfulness | mock-proposal | flywheel lineage 起点と原本の整合 |
| **W2** | F-022 | P1 | truthfulness | ProposalDetail | metric % 表記 + mock 値注記 (raw decimal 除去) |
| **W2** | F-025 | P1 | truthfulness | BusinessApproverHub | persona 偽装是正 + 権限事前提示 |
| **W2** | F-026 | P1 | truthfulness | Approvals | error/loading で件数/caption 抑止 |
| **W2** | F-051 | P1 | truthfulness | DocumentViewer | 全案件の押印/署名 mock 明示 + watermark |
| **W2** | F-052 | P1 | truthfulness | PrototypeModeLabel | disclaimer 常時 AA + 折り畳み非依存 |
| **W3** | F-013 | P1 | control-legibility | CaseDetail | escalation 永続マーカー + 一覧 chip |
| **W3** | F-014 | P1 | control-legibility | reducer/AgentDetail | kill-switch 実 trust 降格 + 再開確認/理由 + 台帳化 |
| **W3** | F-015 | P1 | control-legibility | ProposalDetail | 設定承認 SoD を identity 強制 + 代表 route 到達可 |
| **W3** | F-016 | P1 | control-legibility | reducer/CaseDetail | escalation 裁定 lock + 肯定経路 + closure |
| **W3** | F-017 | P1 | control-legibility | hooks/types | 裁定後の通知 closure + 起票者へ因果通知 |
| **W3** | F-020 | P1 | control-legibility | Observatory | 0 件 export の misleading-success guard |
| **W3** | F-024 | P1 | control-legibility | BusinessApproverHub | 2 カード別着地 (?kind) + 同名 link 衝突解消 |
| **W3** | F-042 | P1 | control-legibility | CaseDetail/actors | self-approval block の live 発火 path (or honest 文書化) |
| **W3** | F-039 | P1 | control-legibility | (→W7) | model inventory 系。本体 UI は **W7** で実装 |
| **W4** | F-009 | P1 | ssot-integrity | useListData | ?demo seam を 6+ route に配線 |
| **W4** | F-011 | P1 | operator-efficiency | DataTable | queue の経過/要確認/担当 sort 可能化 |
| **W4** | F-012 | P1 | operator-efficiency | CaseDetail | パンくず「案件一覧」を Link 化 + 戻る導線 |
| **W4** | F-008 | P1 | a11y | CaseDraft/modal | form error の role=alert + aria-describedby + focus 移動 |
| **W4** | F-050 | P1 | a11y | AppShell | skip-link + main focus 受け皿 + landmark |
| **W4** | F-004 | P1 | a11y | ProposalDetail/index.css | diff add/del 文字色を AA (success/error-soft-fg) ※W1 token 確定後の消費側是正 |
| **W4** | F-005 | P1 | a11y | Hub | hero CTA kicker/detail を不透明 white/AA に ※W1 token 群と同系 |
| **W4** | F-023 | P1 | craft | Observatory/ProposalDetail/LifecycleStepper | mobile 375px CJK 見出し縦折れ/判定基準表/Stepper 是正 (responsive) |
| **W4** | F-029 | P2 | operator-efficiency | Cases | /cases に安全な一括操作 (一括入力者確認) ※P2 だが a11y/eff の P1 群と同 surface で前倒し |
| **W5** | F-010 | P2 | operator-efficiency | SearchResults | 検索 deep-link/URL 同期 (scope 採否を SSOT 記録) |
| **W5** | F-019 | P2 | truthfulness | Observatory | KPI を仮説 framing + 分母 reconcile |
| **W5** | F-027 | P2 | operator-efficiency | shared/Toast | 統制重要 toast 永続化 + tone 区別 |
| **W5** | F-030 | P2 | operator-efficiency | Notifications | inbox 未読フィルタ/dismiss/時刻 |
| **W5** | F-031 | P2 | operator-efficiency | Observatory | 台帳 期間 filter + 一括 clear |
| **W5** | F-032 | P2 | craft | Observatory | 台帳 filter chip を業務語化 (JP-only) |
| **W5** | F-033 | P2 | operator-efficiency | CaseDraft | 起票 form の型/形式検証/入力支援 |
| **W5** | F-034 | P2 | control-legibility | CaseDraft | 手動起票の SoD 注記 |
| **W5** | F-036 | P2 | craft | shared/PageHeader | PageHeader 共通 primitive 化 (15 画面) |
| **W5** | F-037 | P2 | craft | SearchResults | desktop searchbox 単一化 (no-verdict、live 再確認) |
| **W5** | F-038 | P2 | operator-efficiency | ConfigApprovals | 混在 queue の sort/filter/ID 体系 |
| **W5** | F-040 | P2 | control-legibility | ConfigApprovals/Escalations | 画面 RBAC 注記 + queue 裁定可否予告 |
| **W5** | F-044 | P3 | truthfulness | Escalations | 経過列を裁定待ち age に + escalation.category 是正 |
| **W5** | F-048 | P2 | ssot-integrity | mock-observatory | 手動起票の KPI 母集合注記 / 台帳反映 |
| **W5** | F-049 | P2 | a11y | EmptyState/Notifications | secondary/empty text を AA (fg-tertiary) |
| **W5** | F-053 | P2 | truthfulness | Hub | 最終更新を store-derived/[仮説] 化 |
| **W5** | F-054 | P2 | truthfulness | ConsequencePanel | 帰結予測に [仮説/要検証] |
| **W5** | F-055 | P2 | ssot-integrity | mock-kpi | 分母 SSOT 統一 or コメント是正 |
| **W5** | F-056 | P2 | ssot-integrity | canonical-design-spec | C 型 dev assert 実装 or doc 修正 |
| **W6** | F-041 | P3 | craft | CaseDetail | 入力者承認後の前向き導線 + baw 案件正準化 |
| **W6** | F-043 | P3 | operator-efficiency | BusinessApproverHub | 0 件カード沈静化 + urgent/routine 分離 |
| **W6** | F-045 | P3 | ssot-integrity | Approvals | 退化 filter 非表示 + dead query 除去 + seed 複数件 |
| **W6** | F-046 | P3 | control-legibility | SearchResults/Observatory | 検索 scope 明示 + reset modal persona 明示 |
| **W6** | F-047 | P3 | a11y | TopBar/Modal | banner landmark + role=status 是正 + overlay label + 未読 aria-live |
| **W6** | F-028 | P1 | distinction | seed | /escalations 恒久 empty を seed で解消 (C2 旗艦実演) |
| **W6** | F-035 | P2 | distinction | AgentDetail/Modal | flywheel lineage timeline + modal/status motion |
| **W7** | F-039 | P1 | control-legibility | Observatory governance tab | model inventory / 独立検証 / drift 監視 を Observatory「モデルガバナンス」tab + Agents/AgentDetail 拡張で実装 (route 非追加) |

**集計検証** (表 row 実数): W1=3 (F-001/002/003), W2=9 (F-007 含む), W3=9 行 (うち F-039 は依存明示行 — 実装は W7), W4=9 (F-009/011/012/008/050/004/005/023/029), W5=19, W6=7, W7=1 (F-039 実装)。**finding ユニーク総数 = 56** (F-039 は W3 依存行 + W7 実装行の 2 箇所に出るため row 合計 57 = ユニーク 56 + F-039 重複 1)。主管: F-007=W2、F-039=W7。F-004/005/023 は W1 token 確定後の消費側 a11y/craft 是正として W4。

> **wave 数 = 7**。**route count = 15 維持 (新規 route 追加なし、as-built)**。F-039 は Observatory「モデルガバナンス」tab + Agents/AgentDetail 拡張で 3 surface (model inventory / 独立検証 / drift 監視) を実装。**verified surface = 22** (15 route + governance tab + escalation 裁定面 + reflected + loading + 2 modal、live axe serious/critical 0)。当初 plan の「net-new route」approach は finding の route 指定/suggestedFix が既存画面を指すため不採用 (§3 W7 参照)。

---

## 5. リスク + stop condition + 「際立ち」の攻めの施策リスト

### リスク

| リスク | 影響 | 緩和 |
|---|---|---|
| **SCHEMA bump の demo 当日衝突** | W1 (F-002 基盤)・W2 (origin)・W3 (escalation/reversal/promotion field) で SCHEMA_VERSION bump。persist shape 不整合で既存 localStorage が壊れる | persist shape guard を bump ごとに更新 (roadmap 既存パターン)。bump wave のデプロイは Session 4 (6/12) demo 当日と別日に置く (roadmap §6 継承) |
| **F-002 store 化が demo 値を変質** | canonical 0142 の rich event や KPI 表示が変わると demo narrative がブレる | `OBS_LEDGER` (0142 rich) は seed 由来として温存し store 行を append。store 化が高リスクなら最小代替 (disclaimer) を採用 (finding 自身が許容) |
| **F-042 self-approval が UI で原理的に発火不能** | 現 3 actor は role 重複なし → guard が dead path。兼務 actor 追加は demo 複雑化 | (a) 兼務 demo actor で live 発火 path 1 本 or (b) GOV 文書で honest に「role 分離由来 + guard は本番 defense-in-depth」と記す。どちらも flawless 許容 (finding expectedFlawless) |
| **W7 plan-lock 違反** | roadmap 未更新で画面追加すると CLAUDE.md「Plan に書かれていない変更は禁止」違反 | **解消 (as-built)**: F-039 を新規 route でなく Observatory タブ拡張で実装し画面数 15 を維持したため roadmap 画面 ledger 変更が不要となり、plan-lock 手続き自体が発生しなかった。本 plan §3 W7 の as-built 更新で SSOT を実装に一致させ整合 (§3.W7 参照) |
| **F-037 no-verdict** | verdict 未確定の finding を盲目修正すると不要変更 | 着手前に live 再確認 (desktop で searchbox 2 個を実観測)。再現しなければ skip |
| **MEMORY: silent lint bypass** | `npm run check:all` が config 不在で silent pass | 各 wave で実際に test 数増加 + axe 0 を mechanical count で確認 (fuzzy 判定禁止) |

### stop condition (各 wave で 1 つでも満たしたら停止し user judgement を仰ぐ)

- `npm run check:all` が修正で green にならず原因が外部依存 (build pipeline / flaky integration) に起因。
- v3 ハーネスの axe serious が token 修正後も特定 route で残り、原因が finding 範囲外の third-party / 想定外影響範囲。
- W7 の画面追加が roadmap 更新だけでは scope を超え、新業務/新 KPI/新接続前提を要する (= 別 plan 化が必要)。
- finding の expectedFlawless が他 finding の expectedFlawless と矛盾する (例 F-002 store 化 vs demo 値固定) → どちらを優先するか strategic 判断。
- SCHEMA bump が既存 persist data と非互換で migration が非自明。

### 「際立ち」の攻めの施策リスト (防御 = 指摘ゼロ を超える差別化)

1. **Flywheel 視覚 motif の貫通** (W6, F-035): 差戻し→改善ヒント→手順承認→設定承認を Observatory・AgentDetail・ProposalDetail で共通 lineage timeline として描き、中核 message を UI 構造で体現。`FLYWHEEL_STAGES` (mock-observatory.ts:60) を既に持つため component 化のみ。
2. **Model risk governance surface** (W7, F-039): model inventory + trust 昇格の独立検証 + drift/bias 監視。SR 26-2 / FSA MRM の基盤統制を frontend で honest に可視化し、「規制対応の深さ」を製品の差別化点に昇華。
3. **Append-only audit trail の生きた demo** (W1/W3, F-002+F-014+F-018+F-027): 操作者の session 操作 (起票/承認/差戻し/reversal/緊急停止) が台帳に時系列 append され、demo で「自分の操作が監査証跡に残る」様を見せる。
4. **Signature micro-interaction** (W6, F-035): LifecycleStepper 段階点灯 + modal overlay fade/panel scale-in。motion budget T1 ≤5 event、prefers-reduced-motion で完全 off の regulated 規律内で reference-grade の完成度。
5. **C2 旗艦面の初回 live content** (W6, F-028): /escalations が初回ロードで「難案件を消さない」を実演でき、空白 landing の domain-specific 弱点を解消。

---

## 6. 推奨実行順序と AI work / human review の見積もり

| Wave | 性質 | AI work | human review | external waiting | risk |
|---|---|---|---|---|---|
| W1 | P0 土台 (token + SoD SSOT + store-truth) | 中 | SCHEMA bump 確認 + demo 値変質の judgement | demo 別日デプロイ調整 | store 化が demo narrative に影響 |
| W2 | truthfulness P1 | 中 | 押印/disclaimer の copy 承認 | — | 低 (表示分岐中心) |
| W3 | control P1 (escalation/reversal/SoD/kill-switch) | 大 (reducer + action 追加) | self-approval path の (a)/(b) 選択 | — | SCHEMA + state machine |
| W4 | a11y + eff P1 | 中 | — | — | 低 (chrome/sort/seam) |
| W5 | P2 (20) | 大 (件数多) | F-010 deep-link 採否 / F-037 再確認 | — | 低 (個別影響小) |
| W6 | P3 + distinction | 中 | motion tone の visual 承認 | — | 低 |
| W7 | 統制 surface (Observatory governance tab、as-built) | 中 | governance tab の honest framing 承認 | — | 低 (route 非追加ゆえ plan-lock 不発生) |

各 wave は前 wave の gate green を前提に着手。W1 → W2 → W3 (escalation/reversal 基盤) → W4 → W5 → W6 → W7 の順。**as-built**: W7 は新規 route でなく Observatory タブ拡張で実装したため、当初想定した roadmap 更新 commit の先行は不要となった。
