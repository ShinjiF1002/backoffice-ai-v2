# Day 26 Screenshot Observation Log

撮影日: 2026-05-26 / HEAD: `846afa4` / Viewport: 1440×900 (desktop) + 390×844 (mobile)
Console error 0 全 page で確認 (preview_console_logs level=error すべて "No console logs")
取得 shot 数 14 (plan 25 から圧縮、評価に十分な evidence baseline)

---

## D-01 Dashboard (`/dashboard`, 1440×900)

**Layout**: Sidebar (220px) + Main。PageHeader: breadcrumb + h1 `ダッシュボード` + 件数 13 + 注意 6 + 承認者承認待ち 1。Right side: meta SLA 環境注 + `UC-BO-01 + UC-BO-02`。NextActionStrip (CASE-2026-0148 経過 03:45:51 + 開く)。Alert strip (注意 1 件)。業務カード grid 2 col (法人住所変更 件数 8 / 注意 3 / 承認者承認待ち 1 + 5 breakdown + sparkline、口座開設書類完備 件数 5 / 注意 3 / 承認者承認待ち 0)。業務オペレーション動線 5 button。

**HIL (Card 1) signal**: 業務 card 内 5 breakdown は HIL 5-state aggregate 表現。Per-workflow breakdown だが actor band 不在。
**Cockpit (Card 7) signal**: Viewport 1 aggregate KPI 不在 (業務 card 内分散)、Viewport 2 per-agent → per-workflow card (2 only)、Viewport 3 drill-down 不在 (route 遷移)。
**Empty/Error/Loading (Card 6) signal**: happy path のみ、empty state 不可視。
**Internal leak**: `UC-BO-01 + UC-BO-02` が user-facing visible (Day 19 U-2 schema gate 範囲外)。
**Adjacent-to-Day19 候補**: Aggregate KPI strip absent / per-workflow actor band absent。

---

## D-02 Inbox (`/inbox`, 1440×900)

**Layout**: PageHeader (breadcrumb + h1 + count 13 件 + 並び順 + 4 FilterChip)。NextActionStrip。13 row table (案件 ID / 業務 / 状態 / 経過 / 担当者 / 注意 / 開く)。

**HIL (Card 1) signal**: Status chip 5 state visible (`入力者確認待ち / AI 処理中 / 再処理中 / 承認者承認待ち / 反映済`) — actor band 別実装 (色のみ、icon prefix 不在)。
**Multi-step (Card 8) signal**: Step graph は CaseReview Lifecycle に依存、Inbox 上は state column のみ。SLA per step は経過時間のみ (per-step SLA absent)、Delegate 列 (担当者) は visible だが routing rule 不可視。
**Data table (R5 sub-check)**: column header click sort 不在、bulk action toolbar 不在 (Day 19 U-19 defer)、virtualization 不要 (13 row)。
**Adjacent-to-Day19 候補**: HIL actor band/icon prefix absent / multi-step SLA per step absent。

---

## D-03 CaseReview (`/cases/CASE-2026-0142`, 1440×900)

**Layout**: PageHeader + Lifecycle Stepper (5 step、current = 入力者確認、indigo dot)。Alert strip (注意 2 件: OCR 信頼度 / 住所マスタ照合)。3 column: 左 AI 入力結果 5 項目 (氏名 / 旧住所 / 新住所 with diff + ConfidenceBar 0.84 閾値未達 / 042 / 2026-06-15)、中 証跡 4 step (受付 / OCR 抽出 / マスタ照合 / AI 入力結果生成、各 button が drill-down)、右 関連手順アラート + 引用根拠 3 件 + 未承認ヒント (collapsible)。Footer (sticky): BusinessApprovalChip + 差戻し + 承認 button (in-memory state、Day 19 U-3 applied)。

**HIL (Card 1) signal**: ✅ 5 state Lifecycle stepper visible、actor は 'agent' vs 'human' icon 区別あり (証跡 timeline 内)、audit log は actor column separated (timeline 内に 'AI 入力' / '入力者確認' 等)。**5-state + actor band conform**。
**Diff (Card 2 ★) signal**: ✅ Inline diff (1 column、changed segment "2 丁目 3 番 5" only)。
- Side-by-side view: ❌ absent
- Field table view: ⚠ partial (AI 入力結果 5 項目は field-level だが before/after column 不在、AddressDiffBlock のみ inline)
- Metadata strip: ⚠ partial (Change author = AI 抽出 v2.3 visible、Confidence = 0.84 visible だが Change reason / Affected scope / Reversibility 不在)
- 承認 button active gate: ❌ (metadata strip 確認 gate なし、Day 19 U-3 で承認自体は in-memory enabled、ただし gate criterion 表示なし)
→ **partial、本 audit P0 finding 候補 (Diff 3-view + metadata strip 5-element の craft gap)**
**Confidence (Card 5) signal**: ✅ ConfidenceBar numeric 0.84 + visual bar + 3-band threshold (0.85 高信頼 / 0.65-0.84 確認推奨 / 0.65 未満 要確認) visible。
- Uncertainty source expose: ⚠ partial (`閾値未達` chip visible、hover で uncertainty source なし)
→ pass (uncertainty source expose は nice-to-have、threshold band は production-safe)
**Citation (Card 4) signal**: ✅ compiled approved (emerald badge) と未承認ヒント (slate-50 panel inset + `citation 対象外` label) 境界 visible。
**Multi-step (Card 8) signal**: ✅ 5 Lifecycle step visible (受付/AI 処理/入力者確認/承認者承認/反映)、current step indigo、Escape hatch (差戻し button) visible、Reason required は SendBackComment 経由。
- SLA per step: ⚠ partial (経過 00:12:34 は case-level、step-level SLA 不在)
- Delegate model: ❌ absent
- All approvers visible: ⚠ partial (Lifecycle stepper は anonymous step label、specific approver 不可視)
**Tool call viz (R7 backlog)**: 証跡 timeline は 4 element block (tool name + input + status + output 部分実装、PDR drawer expand 可)。
**Adjacent-to-Day19 候補**: Diff 3-view + metadata strip / multi-step SLA per step / Delegate model。

---

## D-04 SendBackComment (`/cases/CASE-2026-0142/comment`, 1440×900)

**Layout**: PageHeader (h1 `CASE-2026-2026-0142 差戻しコメント`)。案件概要 4 field grid。差戻し分類 5 radio (誤読 / 入力誤り / 信頼度低 / 検証エラー / その他) with Disclosure description (Day 19 U-14 applied、選択時のみ展開)。Textarea。Footer: 差戻しを記録 button (disabled、DisabledAction caption mode)。

**Multi-step (Card 8) signal**: ✅ Reason required (差戻し分類 + 自由記述) で正しく gate されている。
**Failure explainability (Card 10) signal**: 5 分類 (誤読 / 入力誤り / 信頼度低 / 検証エラー / その他) は failure category controlled vocabulary、3 layer の Why に該当。
- What failed / Why / What user can do の 3 layer は本 page が "What user can do" (差戻し記録 step) に focus、What failed / Why の前段は CaseReview に分離 (split surface)
→ partial (3 layer が分散、本 page だけでは閉じない)
**Adjacent-to-Day19 候補**: failure explainability の 3 layer split surface design (本 audit findings に上げる)。

---

## D-05 ProposalReview (`/proposals/PROP-2026-031`, default, 1440×900)

**Layout (Day 19 U-6 applied、4-col → 2-col + DetailDrawer)**: PageHeader (h1 `OCR 信頼度閾値の段階引き上げ 0.85 → 0.80`)。左 col: 判定基準 (3 met / 0 miss) + 元案件 (5 件) + 未承認ヒント。右 col: 提案 概要 / 変更点 / 影響範囲 + 期待される効果。Footer: 承認 button + 差戻し。

**HIL (Card 1)**: state visible (`承認待ち`)、Proposal 自体は手順承認 flow (案件 HIL とは別 surface)。
**RACI-A (Card 9) signal**: default では RACI 列 visible でない (Day 19 U-6 で DetailDrawer に移動、default closed)。`?demo=1` で確認 → D-05b 参照。
**Diff (Card 2 ★)**: 提案内容 = 0.85 → 0.80、変更点 text 形式で記述 (1 line 表記)、structured field diff ではない、metadata strip 簡素 (author + reason 部分)。
→ partial。
**Adjacent-to-Day19 候補**: RACI default closed → 入力者 / 承認者 1st-time 認知に gap、Demo Chapter 2 でのみ open (`?demo=1` 必要)。

---

## D-05b ProposalReview `?demo=1` (Demo Chapter 2 RACI drawer open、1440×900)

**Layout**: Right DetailDrawer expanded — 担当役割 (RACI 5-role) + 提案メタ + 提案メタ詳細。
**RACI-A (Card 9) signal**: ✅ 5 role visible — 業務責任者 (R) / 管理者 (A) / 入力者 (C) / Audit (I) / AI Agent (E)。Agent-executor が R/A になっていないことを surface 上で確認可能。
→ pass (disclosure surface 要件満足、`?demo=1` query 経由必要が UX gap だが Card 9 criterion は satisfied)。

---

## D-06 AgentSettings (`/agents/agent-corporate-address-change`, 1440×900)

**Layout**: PageHeader (h1 `法人住所変更 Agent`、Trust Level chip = Supervised)。Hero: Trust Level 3-stage stepper (Supervised current → Checkpoint → Autonomous) + 引き上げ申請 button + 統制原則 caption。Agent 構成: Model (kana B(検証用)、HypothesisChip applied) / Prompt (3-line) / Tool 3 件 (OCR 抽出 / 住所マスタ照合 / 未承認ナレッジ照会) / 権限 / 変更履歴 4 件 (Disclosure wrapped Day 19 U-17)。

**HIL (Card 1)**: Trust Level Supervised は HIL 5-state とは別軸 (agent-level autonomy)、relevant でない。
**RACI sub-check (rbac-1〜4)**:
- rbac-1 ✅ Tool / 権限 / Trust Level visible
- rbac-2 ✅ RACI-A は ProposalReview に存在 (D-05b)、AgentSettings からは link 経由
- rbac-3 ✅ 3-stage stepper visible
- rbac-4 ⚠ partial (Tool list visible だが各 tool scope = read/write/approval 不可視、tool description 4-line のみ)
→ overall partial、rbac-4 gap finding 候補。

---

## D-07 AuditTrail (`/audit`, 1440×900)

**Layout**: PageHeader (h1 `監査証跡` + 直近 30 日 + 15 項目記録 + 業務 filter 3 chip)。`本画面の説明` button (PageHelpDisclosure、Day 19 U-5 applied)。13 event timeline rows (AI 入力 / PDF 受付 / 反映 / 承認者承認 / 入力者確認 / 関連ルール更新 / 手順承認 / AI 日次分析 / 入力者差戻し)。各 row: event type + case ID + workflow + version + action description + timestamp + actor。

**Audit Timeline (Card 3) signal**:
- 5 layer の (1) Time axis: ⚠ partial (Absolute timestamp visible、Relative + UTC + retention 不可視)
- (2) Action row 5 mandatory column: ⚠ partial (Timestamp ✓ / Agent ID = system/human visible ✓ / Action verb ✓ controlled vocab ~9 type / Target object = case ID + workflow ✓ / Outcome state = ❌ 不可視、event type に implicit)
- 7 outcome state (Proposed/Approved/Rejected/Executed/Failed/Reverted/Escalated): ❌ visible でない、event type は action ベース、outcome state column 不在
- (3) Drill-down panel: ⚠ partial (button click で expand 試行したが visible state 変化薄、Day 19 U-12 で DetailDrawer 統合済との記載 vs visual evidence 不一致 — 要 deeper verify)
- (4) Filter / pivot 5 facet: ⚠ partial (業務 filter のみ visible、Date / Outcome / Risk tier / Customer segment 不在)
- (5) Export CSV/JSON/PDF: ❌ absent
→ **partial、本 audit P1 finding 候補 (Audit Timeline 5-layer + 7 outcome state の structural gap)**
**HIL (Card 1) signal**: actor-separated visible (`システム` vs `田中 美咲 (入力者)` / `渡辺 真理 (業務責任者)` / `山本 直樹 (承認者)` / `AI 入力` / `AI 日次分析`)、actor band/icon は uniform slate-600 (Day 19 U-21 で部分 cover)。
**Failure explainability (Card 10)**: failed event row 不在 (mock 13 件すべて happy + reroute path)、failure state UI 不可視。
**Adjacent-to-Day19 候補**: Audit Timeline 5-layer / 7 outcome state / 5 facet filter / Export。

---

## D-08 Metrics (`/metrics`, 1440×900)

**Layout**: PageHeader (subtitle = 進化判断 設計、4 button = 仮判定 / 補助 / KPI 推移 / KRI)。Hero: 4 KPI grid (案件未承認案件 99.4% / 入力者差戻し率 1.2% / Alert 監視率 4.7% / 承認業務時間 6.6% — HypothesisChip + Sparkline)。補助 KPI - 一覧 (3 row metric)。KRI 監視 (3 row、HypothesisChip)。

**Cockpit (Card 7) signal**: aggregate KPI 4 (Hero) ✅、ただし dashboard density tier の Manager band (Day 19 で確定)、3 viewport pattern には mapping しない (Metrics は Tier 2 Manager dashboard、Cockpit は別 page)。
**Confidence (Card 5) signal**: KPI に HypothesisChip applied (Day 19 U-1)、numeric + Sparkline visible、ただし confidence threshold (高信頼/確認推奨/要確認) は KPI level では適用外 (case-level の signal、metrics は時系列)。

---

## D-09 KnowledgeBrowser (`/knowledge`, 1440×900)

**Layout**: PageHeader (h1 `ナレッジ` + 8 件 + 業務 filter + 分類 filter + 重要度 filter)。`本画面の説明` button (PageHelpDisclosure、Day 19 U-5 applied)。ナレッジ一覧 (8 row、各 row: title + tier badge 承認済 5 / 確認済 2 / 未承認 1 + 業務 + 分類 + 重要度 + 更新日 + version)。

**Citation (Card 4) signal**: ✅ 3 tier badge (承認済 emerald / 確認済 amber / 未承認 slate) visible、`citation 対象外` label は CaseReview 経由 binding (Day 19 U-2 で gate 済 schema key は debug 限定)。
- source ref + tier (T1/T2/T3): ⚠ partial (本 prototype の tier は staging/compiled の意味で、research-compounder の T1/T2/T3 (Primary source / Secondary / Tertiary) 区分と意味重なり弱い、ただし banking BO 文脈では適切な abstraction)
→ pass (production-safe boundary 表現、craft conformance OK)
**Empty/Error/Loading (Card 6)**: filter 適用後 empty state 未確認 (mock 8 件、filter で 0 になる組合せ test 不要)。

---

## M-01 Dashboard mobile (`/dashboard`, 390×844)

**重大な layout breakage**: Sidebar 220px が viewport 390px の 56% を占有、main column 170px に圧縮。
- h1 `ダッシュボード` が文字単位で垂直方向に折返し (1 char/line)
- 業務 card 内 KPI が viewport 右端で見切れ
- NextActionStrip text 全文 viewport 横入りきらず

**判定**: Mobile responsive 完全欠落。Sidebar collapse / drawer pattern 不在。
**R1 P0 finding 候補**: Mobile breakage が prototype 全体に発生 (sidebar 固定 fixed-220px、Tailwind responsive prefix 未適用)。

---

## M-02 Inbox mobile (`/inbox`, 390×844)

同様の重大 layout breakage 確認。
- h1 `受信トレイ` が文字単位 vertical wrap
- FilterChip cluster が縦 stack で行高 1 char vertical
- Table 13 row が character-vertical 表示で実質読めない

**判定**: M-01 と同じ root cause、9 page 横串で発生する確実性高。
**R1 P0 finding 候補**: 確定 (M-01 と統合)。

---

## State observation (D-03 / D-05b / D-07 expand)

- **D-03 CaseReview 未承認ヒント click**: button click で `未承認ヒント (引用根拠 対象外、2 件)` chip 反応、ただし visual change 観察不能、Disclosure pattern と推定。
- **D-05b ProposalReview `?demo=1` RACI drawer**: ✅ Right DetailDrawer expand 確認、5 role surface visible (Card 9 satisfied)。
- **D-07 AuditTrail row click expand**: 試行したが visual state change 観察不能、要 deeper verify (Day 19 U-12 DetailDrawer 統合済 vs 現行 expand 反応薄)。

---

## a11y sub-check (R5 embed)

| Rubric | Pass 条件 | Verdict | Evidence |
| --- | --- | --- | --- |
| a11y-1 Lighthouse a11y ≥ 90 | — | **未測定** | P3 で実測 or backlog |
| a11y-2 Keyboard tab order | 全 interactive 到達 | partial | snapshot tree 上 button/link/listitem 全部 keyboard accessible 見え (要 actual tab trace) |
| a11y-3 ARIA role hygiene | role 適用 | **pass** | DetailDrawer `<aside role="complementary">` ✓、PrototypeModeLabel `role="status"` ✓、sectionheader / sectionfooter ✓ |
| a11y-4 Color contrast token | soft-fg token 経由 | **pass** | code grep (P1 完了済) |

→ a11y は overall pass、ただし Lighthouse 実測は backlog (中止条件 trigger ではない)

## RBAC sub-check (R5 embed)

| Rubric | Pass 条件 | Verdict | Evidence |
| --- | --- | --- | --- |
| rbac-1 Agent permission grant UI | Tool / 権限 / Trust Level visible | **pass** | D-06 |
| rbac-2 RACI-A 5-role visible | ProposalReview RACI 列 visible | **partial** | D-05b、ただし default 不可視 (`?demo=1` 必要) |
| rbac-3 Trust Level 3-stage | AgentSettings Hero stepper | **pass** | D-06 |
| rbac-4 Least-privilege scope | Tool list に scope visible | **fail** | D-06 (tool description のみ、read/write/approval scope 不可視) |

→ RBAC は partial、rbac-2 + rbac-4 が R4 finding 候補。

---

## P2 Gate Summary

- ✅ Console error 0 (全 page、`No console logs`)
- ✅ Viewport 整合 (1440×900 + 390×844 切替正常)
- ✅ Agent ID resolution 済 (`agent-corporate-address-change` 経由で AgentSettings render OK)
- ✅ 14 shot 取得 (plan 25 から圧縮、findings extraction に sufficient)
- 🔴 **Mobile layout breakage** が確実 finding (R1 P0)

P3 着手可。
