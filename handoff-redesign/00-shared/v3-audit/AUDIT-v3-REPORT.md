# Backoffice AI v2 — prototype-redesign v3 本番昇格監査レポート

| 項目 | 内容 |
|---|---|
| 監査対象 | `prototype-redesign/` (production build を vite preview :4174 配信、現 working tree から rebuild) |
| 監査範囲 | 15 route × 全 viewport/persona、44 stakeholder journey、328 interactive control |
| 最終目標 | ユーザ/コンプラ/リーガル/当局 (US: SR 26-2・OCC・NYDFS Part 500 主軸 / JP: FSA MRM・AI DP・FISC 補助) のいずれが見ても一切指摘できない、本番品質の中でも際立った frontend prototype |
| finding SSOT | `final-ledger.json` (56 件、全件 live 検証済、rejected 0) |
| 監査日 | 2026-05-30 |
| 規制 frame | US 主軸 (**SR 26-2** = OCC/FRB/FDIC 合同 MRM 改訂 2026-04-17、SR 11-7 / OCC 2011-12 を supersede) + JP 補助。層B backend は全 finding で scope-out 維持 (統制は UI 上に honest に表現する前提) |
| 規制 honesty 注記 | **SR 26-2 は生成・agentic AI を MRM scope 外と明示** (脚注3)。本 prototype の model governance 表現 (F-039) は「embedded な非生成 model に SR 26-2 原則を適用した governance を represent」+「agentic 層は組織判断の good-practice を honest に可視化」であり **規制準拠を主張しない**。SoD (F-001) / audit trail (F-002) / a11y (F-003) の規制含意は SR 26-2 / NYDFS Part 500 §500.06 / FISC の一般要請として有効。primary source: [SR 26-2](https://www.federalreserve.gov/supervisionreg/srletters/SR2602.htm) |

---

## 1. Executive Summary

現 prototype は **runtime 健全で mature** な到達点にある。Phase 0-2 の実走で、旧 112-finding 監査の主要欠陥 (台帳全行が同一 case を開く X-10、kill-switch 不在 UX-05、参照専用案件の操作 false-success、reflected 不可逆) は **すべて live 上で解消済**と確認した。これらは現 docs/旧 audit が今なお欠陥として主張する **stale claim** であり、docs を信じた監査は誤指摘を生む段階にある。

一方、flawless bar (どの担当者も一切指摘できない) に対する残存 gap の本質は **3 件の P0** と、**27 件の P1 (うち truthfulness 8 + control-legibility 10 = 18 件が統制の honesty/legibility に集中)** にある。P0 は (1) 四眼原則(SoD)の入力者/承認者 actor が一覧・承認待ち・詳細・台帳で三者三様に矛盾する真実性破綻 (F-001)、(2) 監査台帳・KPI・lineage が store を subscribe しない静的 fixture で操作者の決定・手動起票が一切記録されず append-only 完全性が破綻 (F-002)、(3) 最頻 semantic token が WCAG AA を割り 74/74 evidence cell が color-contrast serious になる systemic a11y 欠陥 (F-003)。いずれも単一画面の polish ではなく **統制の真実性そのもの**に関わり、SR 26-2 の SoD 検証 / NYDFS Part 500 §500.06 の監査証跡 / a11y 100% bar で確実に指摘される。

P1 の中核は、手動起票案件の AI/OCR/押印捏造 (F-006/F-051)、唯一の包括免責 PrototypeModeLabel が AA 未達かつ折り畳み依存で機能しない (F-052)、self-approval block が live 経路で一度も発火しない dead path (F-042)、エスカレーション/reversal が証跡に残らず closure もしない (F-013/F-016/F-017/F-018) など、**統制を「実装した」と説明できても「画面上で実演・検証できない」種類の gap** である。

**go/no-go 観点**: 現状は当局向けデモには **no-go**。理由は防御 (指摘ゼロ) が成立しないこと — 規制担当が四眼の actor を突合 (F-001)、台帳に自分の操作を探す (F-002)、a11y 100% を要求 (F-003) すれば即指摘に至る。ただし 3 P0 は**いずれも単一 token / 単一 selector / 単一 SSOT field の集約修正で全 route に波及**する性質で、AI coding agent 基準では実装負荷は低い。P0 3 件 + truthfulness P1 群 (捏造・免責・dead path) を閉じれば防御ラインは成立し、distinction の攻め (flywheel motion・signature interaction、F-035) と net-new 不在統制画面 (model inventory/drift、F-039、roadmap 更新を伴う) で「際立ち」に到達できる。

---

## 2. 監査方法

**distrust-SSOT 方針**: 既存 SSOT (docs / 旧 audit / MEMORY) を ground truth とせず、現 working tree から rebuild した **live app を唯一の ground truth** とした。旧 112-finding 監査の主要項目が live で既に解消済であることを実走確認し、これら stale claim も §6 で報告する。

| Phase | 内容 | 証跡規模 |
|---|---|---|
| **Phase 0** 証跡 pack 捕捉 | production build を vite preview :4174 で配信し Playwright で 74-cell 証跡 pack (screenshot + live axe-core + aria + DOM + focus-trace) を捕捉。328 interactive control を棚卸し | 74 cell / 328 control |
| **Phase 1** journey 構築 | 6 stakeholder で 44 journey を構築し全 control を踏む coverage を確立 (uncovered ≈ 0) | 44 journey |
| **Phase 2** adversarial walk | 15 route walker + 8 cross-route flow walker が実ブラウザで全 control を操作 + 7 stakeholder lens (operator / compliance / legal / US-regulator / a11y / craft / SSOT) → 253 raw → 56 canonical に dedup → route 別 refute-default 検証で全件 confirmed/adjusted | 253 → 56 / rejected 0 |

**dedup と verdict**: 253 raw finding を 56 canonical に統合 (各 finding の `mergedFrom` に lens 横断の出所を記録)。adversarial refute-default 検証 (default で却下し live 証拠が残った場合のみ採用) を全件に適用した結果、verdict は confirmed 系 52 / adjusted 3 (F-010 P1→P2, F-019 P1→P2, F-024 severity 据置で title 整理) / no-verdict 1 (F-037、機能影響軽微で severity 確定保留)。**rejected は 0 件** — 全 56 件が live で再現される。

**coverage の honest 開示は §7 に記載**。

---

## 3. 4 本柱別サマリ

severity と直交する評価軸として、各 finding を 7 pillar に分類した (4 本柱 Truthfulness/Control-Legibility/Craft/Distinction + 補助 3 軸 a11y/operator-efficiency/ssot-integrity)。

| Pillar | 件数 | P0 | 代表 finding | 柱の本質 |
|---|---|---|---|---|
| **Truthfulness** (虚偽/誤認/honesty) | 13 | 1 | F-001 SoD actor 三者三様 / F-006 手動起票の AI・OCR・押印捏造 / F-052 免責が機能しない | 画面が事実でない統制状態・provenance・免責を主張。規制監査の第一指摘軸 |
| **Control-Legibility** (統制の可視性) | 14 | 1 | F-002 台帳 static fixture / F-013 エスカレ不可視 / F-039 model inventory/drift 不在 / F-042 self-approval dead path | 統制は実装されても画面上で追跡・実演・検証できない。"実装した"と"見せられる"の乖離 |
| **Craft** (完成度) | 5 | 0 | F-023 mobile CJK 縦折れ / F-036 PageHeader 手書き重複・Observatory 逸脱 / F-037 検索 box 二重 | 本番級の仕上げ。CJK 1 文字縦折れ・clip は本番品質で許容されない |
| **Distinction** (際立ち) | 2 | 0 | F-028 旗艦 /escalations が恒久 empty / F-035 flywheel lineage 未描画・signature motion 不在 | 製品中核ナラティブが UI 上で際立たず "丁寧な generic SaaS" に留まる。攻めの差別化軸 |
| a11y (補助) | 7 | 1 | F-003 全 74 cell color-contrast / F-050 skip-link 不在 / F-004 diff 2.24:1 | WCAG AA。規制 prototype の下限 = axe serious 0 |
| operator-efficiency (補助) | 10 | 0 | F-011 queue sort 不能 / F-027 統制 toast 即時消滅 / F-031 期間 filter 不在 | 連続処理する操作者の triage/回遊コスト。本番想定件数で線形に効く |
| ssot-integrity (補助) | 5 | 0 | F-009 demo seam 未配線で route 間不一致 / F-055 分母 SSOT 自己矛盾 / F-056 dev assert over-claim | 実装と docs/コメントの乖離。observer が canonical を判断できない |

**観察**: P0 が 3 柱 (truthfulness/control-legibility/a11y) に 1 件ずつ分散し、いずれも単一画面でなく **systemic** (全 route/全 mutation/全 cell)。P1 27 件のうち truthfulness 8 + control-legibility 10 = 18 件が統制の honesty/legibility に集中しており、本監査の修正主軸はこの 2 柱である。craft/distinction は件数こそ少ないが、distinction は「攻め」の不在 (F-028/F-035) として防御とは別軸で本番昇格の差別化を左右する。

---

## 4. P0 深掘り 3 件

### F-001 — 四眼原則(SoD)の入力者/承認者 actor が route 間で三者三様 [truthfulness]

| 項目 | 内容 |
|---|---|
| **route** | /approvals, /cases, /cases/CASE-2026-0128 (全 business-approval-waiting 案件) |
| **現象** | 四眼原則の中核 fact「誰が入力者承認したか」が route 間で矛盾。同一 CASE-2026-0128 で、一覧/承認待ちは入力者=鈴木課長・承認者=田中部長 を表示する一方、CaseDetail footer/承認者バナーは「入力者 山田太郎 ≠ 承認者 鈴木課長」と表示。鈴木課長が一覧では入力者・詳細では承認者(現 persona) として現れる。さらに承認者 persona=鈴木課長 が「画面上の入力者=自分」の案件を self-approval block 無しで最終承認でき、live で「1 件を最終承認しました」(rows 1→0) を確認 |
| **根本原因** | 二重 source の不整合。一覧/承認待ち = `Approvals.tsx:75` inputter=`CASE_DETAILS[e.id].inputter` (`mock-case-list.ts:35` owner='鈴木課長')。詳細 = `CaseDetail.tsx:110` inputApproverName=`actorById(entity.inputApprovedBy).name`、その値は `store/seed.ts:35` で一律 `DEFAULT_ACTOR_ID` (`actors.ts:24` = 'actor-inputter' = 山田太郎)。`CaseDetail.tsx:108-109` のコメントは混同を認識しつつ詳細側だけ直し queue 側を未修正 |
| **規制含意** | SR 26-2 / NYDFS Part 500 / FSA MRM の SoD 検証で actor を突き合わせれば確実に指摘される honesty 欠落。「誰が入力し誰が承認したか」が surface ごとに違う台帳は監査証跡として成立しない |
| **影響 journey** | CHK-01 (承認待ち→詳細で actor 不整合)、GOV-02 (四眼実効性検証)、INP-10 (権限境界)、flow-4eyes |
| **修正方向** | 1 案件につき (入力者 actor, 承認者 actor) を単一 SSOT (owner 文字列でなく actorId を案件 entity field) にし、全 surface が同一 helper 経由で解決。`Approvals.tsx:75` inputter を `actorById(e.inputApprovedBy)?.name` に、`seed.ts:35` の一律 DEFAULT_ACTOR_ID を案件 owner 由来に置換。「画面上の入力者=現操作者」なら最終承認を disabled にし self-approval block を発火 |

### F-002 — 監査台帳・KPI・lineage が store 非 subscribe の静的 fixture で append-only 完全性が破綻 [control-legibility]

| 項目 | 内容 |
|---|---|
| **route** | /observatory, /cases/new, /cases/:id (全 mutation) |
| **現象** | 証跡台帳 (CROSS_LEDGER)・KPI・承認済ナレッジが store state から decoupled な frozen fixture。手動起票案件 (CASE-MANUAL-NNN) を入力者承認→承認者最終承認→反映済まで完走しても、台帳を MANUAL で検索すると常に 0 件「該当する証跡がありません」、lifecycle view は固定 CASE-2026-0142 に pin。承認/差戻し/reversal/persona 切替/reset も新規 ledger 行を生まず KPI も再計算されない (53→53) |
| **根本原因** | `mock-observatory.ts:122-125` CROSS_LEDGER = module-level const (OBS_LEDGER + CASE_LIST(seed) flatten で state.cases 非 subscribe)。`mock-kpi.ts:31-35` KPI_ROWS frozen。case/create は `reducer.ts:111-127` で state.cases/caseOrder のみ書込み、台帳へ伝播しない |
| **規制含意** | SR 26-2 audit trail / NYDFS Part 500 §500.06 / FISC 証跡完全性が要求する「全操作が append-only trail に記録される」前提に対する重大な完全性欠落。台帳が「append-only…出力可能」と提示しつつ静的サンプルである旨の disclaimer も無いため、監査者は操作の不在を記録漏れと誤認する |
| **影響 journey** | AUD-02/03/05 (台帳横断レビュー・手動起票の台帳反映)、AUD-06 (reset 痕跡)、GOV-01 (証跡完全性) |
| **修正方向** | (a) 台帳/KPI/lineage を store-truth に subscribe し操作者自身の session 操作を時系列で append (`CROSS_LEDGER` を `useCrossLedger` selector 化、OBS_LEDGER の canonical 0142 は seed 由来として温存し store 由来行を append)、または (b) 最小修正として台帳 header に「本台帳は代表的な静的サンプルで、本セッションの操作・手動起票は反映されない」と明示 disclaimer (`Observatory.tsx:209-213`) |

### F-003 — 最頻 semantic token が WCAG AA 未達で全 74/74 cell が color-contrast serious [a11y]

| 項目 | 内容 |
|---|---|
| **route** | 全 route (15 routes × 全 viewport/persona) |
| **現象** | Operational Premium Light の token 自体が最頻 semantic 色で AA を割る。MetaChip/StatusBadge/FilterChip-active/Sidebar-active の primary tone = `#635bff` on `#eef2ff` = **4.20:1 (FAIL)**、active nav on canvas `#f8fafc` = **4.49:1**、neutral muted `#64748b` on panel-inset `#f1f5f9` = **4.34:1**。これらが chrome/一覧/詳細に遍在し、74 cell 全てで axe color-contrast (serious) が発火 (唯一発火している rule)。統制ラベル「手順承認/確認済/全件確認」や規制告知 PrototypeModeLabel まで低コントラスト |
| **根本原因** | token SSOT 自体の欠陥。`MetaChip.tsx:17` + `StatusBadge.tsx:31` + `FilterChip.tsx:53` が `bg-[primary-soft] text-[primary]`、`Sidebar.tsx:114,160` が active primary。`index.css:17` のコメント自身が「panel-inset 上は fg-muted AA 未達 → fg-tertiary/fg を使う」と SSOT で自認しながら広範に使用 (self-documented R7 違反) |
| **規制含意** | a11y 100% (axe serious 0) は規制 prototype の下限。NYDFS/当局 a11y 観点で全 route fail は一括指摘される。規制告知 (免責) ラベルが低コントラストなのは特に重い |
| **影響 journey** | 全 journey (chrome 経由)。特に GOV-04 (disclaimer 可視性)、INP-01 (Hub)、AIADMIN-J2 (/agents/:id axeSerious=22 最大級) |
| **修正方向** | token SSOT で一括是正 (全 route 波及)。`--color-primary-strong` (#4f46e5 級、eef2ff 上 ~5.0:1) を新設し chip/nav/active text を全て strong 経由に統一。neutral muted を panel-inset 上 AA pass する `fg-tertiary` (#475569, ~7:1) へ降格。是正後 15 route で axe 再走し color-contrast=0 を gate 化 |

**3 P0 の共通性質**: いずれも single-screen polish ではなく **SSOT 集約点 1 箇所** (entity の actorId field / store-derived selector / token) の修正で全 route に波及する。AI coding agent 基準では実装負荷は低く、リスクは「波及範囲の回帰検証」(全 route の axe 再走・全 surface の actor 表示突合) に集中する。

---

## 5. 全 56 finding ledger

severity (P0→P3) → pillar 順。verdict: confirmed = live 再現確認 / adjusted = severity または title 調整後確定 / no-verdict = 確定保留。`(L3)(L7)` は出所 lens (L3=legal, L7=ssot)。

| ID | Sev | Pillar | Route | 要約 | Verdict |
|---|---|---|---|---|---|
| F-001 | P0 | truthfulness | /approvals,/cases,/cases/:id | SoD 入力者/承認者 actor が一覧・承認待ち・詳細で三者三様、自己承認も block されず最終承認可 | confirmed |
| F-002 | P0 | control-legibility | /observatory,/cases/new,/cases/:id | 台帳/KPI/lineage が store 非 subscribe の静的 fixture、操作・手動起票が append されず完全性破綻 | confirmed |
| F-003 | P0 | a11y | 全 route | 最頻 semantic token が AA 未達で全 74/74 cell が color-contrast serious | confirmed |
| F-006 | P1 | truthfulness | /cases/new→/cases/CASE-MANUAL | 手動起票案件が AI処理/OCR/.pdf 走査書類/(押印済)印影を捏造表示 | confirmed |
| F-018 | P1 | truthfulness | /cases/:id | reversal が who/when を欠き台帳/lifecycle に残らず、着地後 UI が承認可能と誤誘導・再処理不在で dead-end | confirmed |
| F-021 | P1 | truthfulness | /proposals/:id,/observatory,/cases/:id | flywheel lineage の起点「差戻し実例」がドリル先の反映済・全確認済・差戻し痕跡なしと矛盾 | confirmed |
| F-022 | P1 | truthfulness | /proposals/:id | metric 値が raw decimal 0.93/>0.90 で spec (92%/≥95%) と乖離、raw confidence 非表示制約に抵触 | confirmed |
| F-025 | P1 | truthfulness | /business-approver,/approvals | ハブ「あなたが判断する案件 N 件」が default persona=入力者では偽、権限外 dead-end へ誘導 | confirmed |
| F-026 | P1 | truthfulness | /approvals | error/loading でもヘッダ件数「· N 件」と caption が残り body の取得失敗と矛盾 | confirmed |
| F-051 | P1 | truthfulness | /cases/:id | 全案件の文書ビューアが無条件で「押印/署名欄:(押印済)」を表示し存在しない押印を一律主張 | confirmed(L3) |
| F-052 | P1 | truthfulness | all (chrome) | 唯一の包括免責 PrototypeModeLabel が AA 未達(4.34:1)かつ折り畳み依存で機能しない | confirmed(L3) |
| F-007 | P1 | control-legibility | /cases/new→CASE-MANUAL | 手動起票直後に全項目「確認済(manually_confirmed)」で四眼一次確認が自動成立、照合工程が name-only | confirmed |
| F-013 | P1 | control-legibility | /cases/:id,/cases,/observatory,/inbox | エスカレ後に詳細・一覧に永続マーカーなし、審級中が不可視 + 操作者の決定が他画面に反映されない | confirmed |
| F-014 | P1 | control-legibility | /agents/:id,/agents | kill-switch が trust を降格しない cosmetic + 再開が確認なし・理由なし 1 クリックで停止理由を消去 | confirmed |
| F-015 | P1 | control-legibility | /agents/:id,/proposals/:id,/config-approvals | 設定承認 SoD が代表 route で到達不能、提案承認は identity SoD でなく role 分離のみで三層非対称 | confirmed |
| F-016 | P1 | control-legibility | /escalations,/cases/:id | エスカレ裁定が業務責任者に lock されず起票者が自己裁定可 + 肯定的裁定経路なし差戻しが唯一の出口 | confirmed |
| F-017 | P1 | control-legibility | /escalations,/inbox,all(bell) | 裁定後もエスカレ通知が bell/inbox に未読のまま残り起票者へ裁定結果が因果として戻らない | confirmed |
| F-020 | P1 | control-legibility | /observatory(台帳) | 台帳 export が 0 件でも成功 toast を出し空エクスポートを完全な出力と誤認させる | confirmed |
| F-024 | P1 | control-legibility | /business-approver | 手順承認/設定承認カードが同一 /config-approvals に着地しハブの区別が消える + 同名 link 衝突 | adjusted |
| F-039 | P1 | control-legibility | /agents,/agents/:id,/observatory | model inventory・trust 昇格の独立検証・drift/bias 監視が UI 上に存在しない | confirmed |
| F-042 | P1 | control-legibility | /cases/:id,persona switcher | self-approval block (reducer isSelfApproval) が live UI 経路で一度も発火しない dead path | confirmed |
| F-023 | P1 | craft | /observatory,/proposals/:id,/cases/:id | mobile 375px で decision-critical な CJK 見出し/判定基準表/LifecycleStepper が 1 文字縦折れ・clip | confirmed |
| F-028 | P1 | distinction | /escalations,/business-approver | /escalations が default seed で恒久 empty、旗艦「難案件を消さない」面が初期表示で空白 | confirmed |
| F-004 | P1 | a11y | /proposals/:id | ProposalDetail の diff add/del 文字色が 2.24:1/3.95:1 で flywheel 中核の差分表示が判読困難 | confirmed |
| F-005 | P1 | a11y | / | Hub 最優先 CTA の kicker/detail が text-white/85 で 3.36-3.85:1、入口 hero が AA 未達 | confirmed |
| F-008 | P1 | a11y | /cases/new | 起票エラーが SR に通知されず(role=alert/aria-live 欠落) 無効フィールドへ focus も移らない | confirmed |
| F-050 | P1 | a11y | all routes | キーボードのみで案件を捌けない、skip-link 不在で先頭行まで 25+ Tab、main も focus 受け皿なし | confirmed |
| F-011 | P1 | operator-efficiency | /cases,/approvals,/escalations,/search | 経過(滞留)・要確認・担当が sort 不可、Approvals 経過は整形済文字列で時系列ソート不能 | confirmed |
| F-012 | P1 | operator-efficiency | /cases/:id,/proposals/:id,/agents/:id | 詳細パンくず「案件一覧」が非クリック span、案件処理後に一覧へ戻る明示導線がない | confirmed |
| F-009 | P1 | ssot-integrity | /search,/inbox,/escalations,/config-approvals 他 | ?demo=loading/error が 6+ route で no-op、useListData seam 未配線で縮退が route 間非一貫 | confirmed |
| F-019 | P2 | truthfulness | /observatory(メトリクス) | synthetic/frozen KPI を「直近30日の実績」と表示し hedge は隅 10px のみ + 分母 4 種が SSOT コメント(980統一)と矛盾 | adjusted |
| F-053 | P2 | truthfulness | / | Hub「最終更新 2026-05-30 11:42」が static hardcode で操作後も不変、鮮度を誤認させる | confirmed(L3/L7) |
| F-054 | P2 | truthfulness | /agents/:id | ConsequencePanel の自動化件数予測が断定数値で隣接 KPI の[仮説/要検証]ラベルを欠く | confirmed(L3) |
| F-034 | P2 | control-legibility | /cases/new | 手動起票が全 persona(承認者含む)で無制限に可能・SoD 注記なし、起票が四眼のどの眼か legible でない | confirmed |
| F-040 | P2 | control-legibility | all routes,/config-approvals,/escalations | 画面 RBAC 不在で権限外面を全 persona が閲覧でき、queue 行が遷移先の裁定可否を予告しない | confirmed |
| F-032 | P2 | craft | /observatory(台帳 filter) | actor/action FilterChip が英語/snake_case schema (system/ai_input/field_override) を JP-only UI に露出 | confirmed |
| F-036 | P2 | craft | all 15 routes | PageHeader/toast が 15 画面で手書き重複、Observatory header が --height-pageheader contract から逸脱 | confirmed |
| F-037 | P2 | craft | /search(desktop) | desktop で同一 aria-label「横断検索」の searchbox が 2 個同時可視で曖昧・SR 重複 | no-verdict |
| F-035 | P2 | distinction | /agents/:id,all(modal),/cases/new | flywheel lineage(relatedProposals)が model にあるのに未描画 + status/modal に entrance motion なし | confirmed |
| F-049 | P2 | a11y | /search(empty),/escalations(empty),/inbox | EmptyState 説明文・inbox 未読本文が AA を僅かに割る(4.25-4.55:1)、自 token 規約 R7 違反 | confirmed |
| F-010 | P2 | operator-efficiency | /search | 横断検索が deep-link 不可・URL 非同期で検索状態が ephemeral、証跡の共有/bookmark/再現が不能 | adjusted |
| F-027 | P2 | operator-efficiency | /approvals,/cases/:id,/agents/:id 他 | 統制重要 toast が 2.4-2.8 秒で自動消滅・手動 dismiss/永続化なし・常時 success 緑、見落とし後追い不能 | confirmed |
| F-029 | P2 | operator-efficiency | /cases,/proposals,/config-approvals | 主要受信トレイ(/cases)等に一括操作がなく件数増で 1 件ずつ往復するしかない | confirmed |
| F-030 | P2 | operator-efficiency | /inbox | ワークインボックスが既読を消化できない(dismiss/archive/未読フィルタ・発生時刻なし) | confirmed |
| F-031 | P2 | operator-efficiency | /observatory(台帳) | 監査台帳に期間フィルタ・一括フィルタ解除がなく証跡スライス操作が高コスト | confirmed |
| F-033 | P2 | operator-efficiency | /cases/new | 起票フォームの日付/コードが素テキスト入力で型・形式検証・入力支援が皆無、未充足の事前 FB なし | confirmed |
| F-038 | P2 | operator-efficiency | /config-approvals | 混在 queue が承認種別/対象業務 sort 不可・kind filter なし、設定承認 row が内部 slug ID を露出 | confirmed |
| F-048 | P2 | ssot-integrity | /(Hub),/observatory(メトリクス) | 手動起票案件が業務 KPI 母数(980 固定)・Hub 件数に反映されず、母集合整合が起票で崩れる | confirmed |
| F-055 | P2 | ssot-integrity | cross | mock-kpi.ts の SSOT コメントが「980 統一」を謳うが実データは 4 種 denominator で自己矛盾 | confirmed(L7) |
| F-056 | P2 | ssot-integrity | cross | canonical-design-spec が C型 detail を「型・dev assert で強制」と主張するが実装に dev assert がない | confirmed(L7) |
| F-044 | P3 | truthfulness | /escalations,/cases/:id | Escalations 経過列が案件受付 age を表示しエスカレ age でない + escalation に空 category の偽データ保存 | confirmed |
| F-046 | P3 | control-legibility | /search,/observatory(reset modal) | ProcessSelector の業務 scope を横断検索が無視するが明示なし + reset modal が persona 初期化を非明示 | confirmed |
| F-041 | P3 | craft | /cases/:id | 入力者承認直後に disabled「承認」ボタンが残り次アクター(承認者待ち)への前向き導線がない | confirmed |
| F-047 | P3 | a11y | all (chrome) | TopBar に banner landmark なし、PrototypeModeLabel の role=status 誤用、dirty overlay 未ラベル等の細目 | confirmed |
| F-043 | P3 | operator-efficiency | /business-approver | 0 件カードも遷移可で空 queue へ無駄誘導、urgent(裁定)と routine(承認)をヘッダで等価合算 | confirmed |
| F-045 | P3 | ssot-integrity | /approvals | 単一案件 queue 時に filter chip が 1 候補のみの退化 UI、rowHref が機能しない歴史的 query ?view=checker 保持 | confirmed |

---

## 6. 旧 SSOT の陳腐化・誤り

`ssot-drift.json` の 43 観測 + L7 lens。**stale claim** (docs が誤って defect/古い前提を主張、live では解消済または正しい設計) と **未解消 drift** (live に実在する gap で docs が silent または誤り) を分離する。stale claim は「docs を信じた監査が誤指摘を生む」リスク、未解消 drift は「実在 gap」である。

### 6a. 解消済 stale claim — docs が誤って欠陥/古い前提を主張 (誤指摘リスク)

| journey | docs の主張 | live の実態 |
|---|---|---|
| GOV-01 | 旧 audit: 台帳「全行が同一 case を開く」(X-10) | **解消済** — 台帳各行が r.caseId へ個別 drill |
| GOV-03 | 旧 audit: 「kill-switch 不在」(UX-05) | **解消済** — header に緊急停止/再開、reducer に emergencyStop/resume (ただし trust 降格は cosmetic = F-014) |
| GOV-05 | docs: 「reflected は終端」(allowed-actions-and-state-transitions.md) | **解消済** — reflected の可逆化を W3 C3 で実装、docs が古い |
| GOV-06 | 旧 audit: 「ProposalDetail の差戻し dispatch 欠落」 | **解消済** — proposal/sendback dispatch を後発補完 |
| CHK-07 | 旧 audit: 「参照専用案件で操作できる false-success」 | **解消済** — readOnly guard が機能 |
| CHK-02 | screen-contracts-v2: 「差戻しコメント必須」 | **drift なし (claim 妥当)** — 理由空送信が live で弾かれる |
| AIADMIN-J3 | ドメインモデル: 「設定昇格も同論理 (SoD)」が申請段階に効くと読める | **正しい設計** — SoD block は approvePromotion (承認段階) のみ、申請は誰でも可 |
| GOV-07 | CLAUDE.md/MEMORY: 15 route・業務責任者面 3 分離を実装済と記録 | **実装済だが source 内 SSOT コメントが旧 9 画面前提を残し新旧混在** (F-052/GOV-04 と連動) |
| J5-cross-cutting | production-readiness の「a11y 解消済」主張 | **未解消** — 全 route で color-contrast serious が残存 (F-003)。docs の「解消済」が誤り |

### 6b. 未解消 drift — live に実在する gap で docs が silent または誤り (実在 gap)

| journey | 観測 | 対応 finding |
|---|---|---|
| AUD-01/03/04/05 | lifecycle/KPI/承認済ナレッジ/CROSS_LEDGER が静的 fixture で store 操作を反映しない | **F-002** |
| AUD-02 | docs/タスク前提は「期間絞込」を挙げるが ledger は直近30日固定で期間 filter control が存在しない | **F-031** |
| AUD-06 | reset/persona 切替/エクスポートが台帳非記録、「全操作が台帳に残る」前提と不一致 | F-002 系 |
| AIADMIN-J1/J2/J5, INP-01/03 | route-summary の axeSerious (agents 16 / agents:id 22 / config-approvals 18 / hub 40) が color-contrast | **F-003** |
| AIADMIN-J6 | AgentDetail (/agents/:id) が ?demo=loading/error 非対応、詳細画面の縮退が未定義 | **F-009** |
| INP-01 | Hub「最終更新 2026-05-30 11:42」が static、操作後も不変 | **F-053** |
| INP-02 | demo=loading/error 中もヘッダ件数「8 件」と caption が残り error と矛盾 | **F-026** (同型) |
| INP-05 | seed 由来差戻し案件 (0131) は理由未記録で fallback 文言、in-session と非対称 | 単発 (本 ledger 未昇格、低 severity) |
| INP-06 | エスカレ後 status 不変で /cases に ready のまま、視覚マーカーなし | **F-013** |
| INP-10 | 画面 RBAC 不在で入力者が全権限面を閲覧可 (本番 RBAC は scope-out 前提) | **F-040** |
| INP-11 | mobile 375px で LifecycleStepper ラベルが重なり/truncate | **F-023** |
| GOV-02 | ?view=checker が mode 決定に未使用の歴史的 query、URL 偽装と誤解されうる | **F-045** |
| GOV-04 | PrototypeModeLabel.tsx の SSOT コメントが「9 画面横断」と古い前提を残す (live は 15 route 適用) | F-052 系 |
| J2-owner | persona 自動切替なし、業務責任者ハブでも操作者は入力者のまま | **F-025** |
| J3-config | 代表 ID agent-corporate-address-change は achieved:false で設定承認 approve を実演不能 | **F-015** 系 |
| J4-escalation | 裁定が既存 case/sendback 再利用で独立 audit event がなく差戻しが唯一の裁定手段 | **F-016** |
| CHK-01 | 承認待ちキューと詳細 footer で同一案件の入力者/承認者が食い違う (CRITICAL) | **F-001** |
| CHK-05 | self-approval block が同一 actor が両 role を持てないため UI から到達不能な dead path (CRITICAL) | **F-042** |

**要旨**: 43 drift のうち約 9 件が「docs が誤って欠陥/古い前提を主張する stale claim」(うち GOV-07/J5 は新旧混在で誤った安心を与える)、残り約 34 件が実在 gap で本 ledger の P0/P1 に収斂する。**本番昇格時は docs (旧 audit / source 内 SSOT コメント / production-readiness の解消済主張) を SSOT として信頼せず、live を ground truth とする運用を継続する**ことが最重要 — さもなくば監査者が GOV-01/03/05 等で誤指摘し、F-001/F-002/F-003 等の実在 gap を見落とす二重の誤りに陥る。

---

## 7. Coverage statement と残存 limitation

### 実走したこと (live ground truth)

- **15 route** を production build (vite preview :4174) で実走。route walker が各 route の interactive control を実ブラウザで操作。
- **8 cross-route flow** (4eyes / escalation / flywheel / manual-entry / reversal 等) を end-to-end で walk し、状態遷移の帰結を store と画面の両面で観測。
- **328 interactive control** を棚卸しし Phase 1 の 44 journey で uncovered ≈ 0 を確立。
- **74 cell** で live axe-core / aria / DOM / focus-trace を捕捉 (静的近似でなく実コンポーネント + app context)。
- **7 stakeholder lens** (operator/compliance/legal/US-regulator/a11y/craft/SSOT) で 253 raw → 56 canonical、全件 route 別 adversarial refute-default 検証で confirmed/adjusted。

### 一般化したこと・実走しなかったこと (honest 開示)

- **F-051/F-052/F-053/F-054/F-055/F-056** は L3(legal)/L7(ssot) lens で出所し、`final-ledger.json` の evidence が他 finding より簡略 (DocumentViewer.tsx / PrototypeModeLabel.tsx 等の指摘) — file:line の網羅実走でなく lens 観測ベース。本番修正前に該当 src の現物確認を推奨。
- **F-037** は no-verdict (機能影響軽微で severity 確定保留)。
- **persona 別証跡**: inventory-raw.json は全 route で操作者=山田太郎(入力者)採取のため、業務責任者固有の owner chrome (ハブの urgent tone 等) は静的証跡に不在で、owner 系は flow walker (J2-J4) の live 検証を正とした。
- **層B backend は全 finding で scope-out**。本監査は frontend prototype として「統制が UI 上に honest に表現されているか」のみを評価。実 LLM / 実接続 / 実証跡 store は対象外で、F-002 等の「store-truth に subscribe」修正も frontend mock store 内の話に限る。
- **axe の網羅性**: color-contrast (serious) は 74/74 cell で発火するが、axe は自動検出可能な WCAG 違反のみをカバー。focus-trace で ringMissing=0 (可視 focus ring は全到達 control で担保) は確認したが、screen reader の実機読み上げ (NVDA/VoiceOver) は未実施で F-008/F-047 の SR 挙動は aria 属性の静的検査ベース。

### 残存 limitation

1. **net-new 画面 (F-039)** — model inventory/drift 監視 UI の新規追加は plan-lock 上 roadmap 更新を伴う。本監査は「存在しない」事実と規制含意を確定したが、新規画面の設計仕様は本レポート範囲外。
2. **本番想定件数での挙動** — seed は各 queue 1-数件で、F-011/F-029/F-031 等の operator-efficiency gap は「件数増で線形に効く」と一般化したが、実負荷下の挙動 (pagination/virtualization) は未測定。
3. **修正の波及検証** — 3 P0 はいずれも SSOT 集約点 1 箇所の修正で全 route 波及する性質ゆえ、修正後は 15 route の axe 再走 (F-003) / 全 surface の actor 表示突合 (F-001) / 全 mutation の台帳反映 (F-002) を gate として再実走する必要がある。本監査は修正前 baseline の確定のみ。
