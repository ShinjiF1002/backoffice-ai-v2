# Cross-Screen Audit (Step 3 §99、9 画面横断 consistency + 集計 + reference paradigm 確認)

- Audit Date: 2026-05-25
- Scope: 9 画面 + components + mock data + lib の横断 hygiene + 集計 + cross-screen elevate
- User guards (2026-05-25): (a) raw weight / staging / OCR 横断集計、(b) KnowledgeBrowser を reference pattern として明示維持
- Persona SSOT: `_persona.md` v0.3

---

## §1. Cross-screen vocabulary consistency (G-B5 hard gate)

### §1.1 同概念表記揺れ check

| 概念 | 採用表現 (canonical) | 揺れ確認結果 |
| --- | --- | --- |
| 承認 (案件) | `案件承認` / `承認者承認` / footer 「承認」 button | ✅ 整合、Inbox table `状態` column `承認者承認待ち`、CaseReview footer 「承認」、AuditTrail `business_approve`→「承認者承認」 |
| 承認 (手順) | `手順承認` | ✅ 整合、Slide 7 / ProposalReview / AuditTrail `proposal_approve`→「手順承認」 / Metrics K6「手順承認 昇格成功率」 |
| 承認 (設定) | `設定承認` | ✅ 整合、AgentSettings Type A/B/C / AuditTrail `config_approve`→「設定承認」 |
| 差戻し | `差戻し` | ✅ 整合、CaseReview footer 「差戻し」 / SendBackComment「差戻し分類」「差戻し理由」「差戻しを記録」 / mock-cases statusLabel「再処理中」(`sent-back`) / AuditTrail `human_sendback`→「入力者差戻し」 |
| AI 提案 | `AI 提案` / `AI 提案レビュー` | ✅ 整合、Sidebar / Dashboard lane / ProposalReview Breadcrumb / mock-audit summary |
| Staging knowledge | `未承認` / `未承認ナレッジ` / `未承認ヒント` | ✅ 整合 KnowledgeBrowser reference に従って 9 画面全箇所 paraphrase 適用済、**例外 1 件: mock-proposals.ts L44 「staging 内部矛盾」 (§3 P1-C)** |
| Compiled knowledge | `承認済` / `承認済ナレッジ` | ✅ 整合、KnowledgeBrowser / CitationPanel / mock-cases citations / mock-knowledge |
| Citation | `引用根拠` | ✅ 整合 9 画面全箇所、`引用根拠 対象外` chip / `引用根拠 — 承認済みナレッジのみ` panel heading |
| Runtime | `AI 実行時` / `AI の正式実行根拠` | ✅ 整合 StagingHintPanel 末尾注「AI の正式実行根拠」 / mock-agents tool description「未承認のナレッジを プロンプトに付加 (引用根拠としては使わない)」 |
| Triage | `整理` / `整理担当` / `手順管理者` | ✅ 整合 ProposalReview / mock-proposals raci.r / mock-metrics R6「手順管理者 整理 強制」 |
| Forward | `業務責任者へ送付` | ✅ 整合 ProposalReview footer + DisabledAction reason |
| Weight (high / medium / low) | `KNOWLEDGE_WEIGHT_STYLE.{shortLabel/label}` 経由 (承認済 / 確認済 / 未承認) | ✅ KnowledgeBrowser / Inbox drawer。**例外 2 件: CitationPanel L29 + StagingHintPanel L43 (§3 P1-A / P1-B)** |
| 5-category | JP label map 経由 (`SENDBACK_CATEGORIES`) | ✅ 整合 9 画面全箇所、raw enum identifier 露出 0 |
| Status enum | JP `statusLabel` 経由 (`pending`→「AI 処理中」等) | ✅ 整合、`caseStatusToTone` / `proposalStatusToTone` 経由徹底 |
| Trust Level | English (Supervised / Checkpoint / Autonomous) Tier 2 | ✅ Tier 2 vocab、CLAUDE.md OK、`_persona.md` G-A5 directional (§4) |
| Automation Maturity | `自動化段階` JP + `Automation Maturity` 一部残存 | △ AgentSettings simulation `Automation Maturity 段階変更` Tier 2 残、Metrics 「自動化段階 進化検討対象」 JP — Day 16+ で「自動化段階」徹底候補 (§4 directional) |
| Alert | `Alert` (Tier 2、KPI / KRI 名) + `注意` (UI chip) | △ Cross-screen `Alert` (Metrics / Dashboard / mock-cases alert struct) + `注意` (Inbox table column / CaseReview alert strip) の使い分けが visible、Tier 2 OK、用途 differentiation (`Alert` = backend signal / `注意` = user-facing display) は意図的、keep |
| 監査証跡 | `監査証跡` | ✅ 整合、AuditTrail H1 / mock-audit summary self-reference |
| 仮説 / 要検証 | `[仮説 / 要検証]` mono badge + HypothesisChip | ✅ 9 画面全箇所、Day 19 Commit 1 で section-level 集約 |

### §1.2 結論

- governance paraphrase 辞書 (staging→未承認 / compiled→承認済 / citation→引用根拠 / triage→整理 / forward→送付 / runtime→AI 実行時) は **9 画面で完全実装**、例外は §3 で elevate された 3 件のみ
- enum map / status label / 5-category JP map 経由徹底、raw identifier UI 露出 0 (CitationPanel/StagingHintPanel の weight raw 2 件のみ)

---

## §2. KnowledgeBrowser reference pattern 維持 (user guard #2)

KnowledgeBrowser は本 audit で **3 つの reference paradigm** を確立し、Step 4 で MEMORY 昇格候補に推す:

| Paradigm | 実装箇所 | 他画面への back-port 可能性 |
| --- | --- | --- |
| **1. `KNOWLEDGE_WEIGHT_STYLE.{shortLabel/label}` 経由徹底** | `lib/knowledge-labels.ts` SSOT + `pages/KnowledgeBrowser.tsx` L111 / L144 / L213 / L277 / L354 で完全活用 | CitationPanel / StagingHintPanel の raw weight badge (§3 P1-A / P1-B) で back-port 必須 |
| **2. `SHOW_INTERNAL_METADATA` (debug=1 query opt-in) gate** | `lib/show-internal.ts` SSOT + KnowledgeBrowser L435-437 / AuditTrail L408-411 で **既に 2 画面実装** | 完全 cross-screen 実装済 (KnowledgeBrowser DetailPanel + AuditTrail DetailPanel)、Step 4 MEMORY 昇格候補 §5 |
| **3. governance paraphrase 辞書全面適用** | `pages/KnowledgeBrowser.tsx` JSDoc L48-50 + 全 UI 文字列で staging→未承認 / compiled→承認済 / citation→引用根拠 徹底 | 9 画面 reference として既に diffusion 完了、§3 例外のみ未適用 |

### §2.1 補足: 既に back-port 済の paradigm

- **HypothesisChip section-level 集約** (Metrics §3.5 + AgentSettings Hero / 補助 KPI / 9 KRI / Day 19 Commit 1 U-1): per-row hedge × N 削除 + 1 surface に集約 — Step 4 MEMORY 昇格候補
- **mockKpiHypotheses SSOT import 共有** (Metrics + AgentSettings KPI_PROGRESSION 経由再利用、CR R40 M5 closure): KPI 名 / target drift 防止の正解 paradigm
- **EVENT_TYPE_LABEL JP map** (AuditTrail L54-65): snake_case event enum → JP map 経由徹底

---

## §3. P1 findings 横断集計 (Step 2 + Step 3 elevate)

| Finding | 出現範囲 | Priority | 修正案 | knowledge card binding |
| --- | --- | --- | --- | --- |
| **P1-A**: CitationPanel L29 `>high<` raw weight badge | `components/case/CitationPanel.tsx` L28-30、render は CaseReview L222 経由 (1 画面) | P1 | `<span>{KNOWLEDGE_WEIGHT_STYLE.high.shortLabel}</span>` = 「承認済」、or badge text 削除 (emerald soft fill で visual signal 十分) | `citation-and-source-disclosure-ui.md` |
| **P1-B**: StagingHintPanel L43 `{h.weight}` raw badge | `components/case/StagingHintPanel.tsx` L36-44、render は CaseReview L224 経由 (1 画面) | P1 | `<span>{KNOWLEDGE_WEIGHT_STYLE[h.weight].shortLabel}</span>` = 「確認済」「未承認」 | `citation-and-source-disclosure-ui.md` / `confidence-and-uncertainty-visualization-ui.md` |
| **P1-C**: mock-proposals.ts L44 「staging 内部矛盾」 | `data/mock-proposals.ts` decisionCriteria[2].label、render は ProposalReview L130-133 経由 (1 画面) | P1 | 「未承認ナレッジ 内部矛盾」 (governance paraphrase 辞書遵守) | `feedback_decision_criterion_hygiene.md` MEMORY |

### §3.1 P1 cross-screen scope

- **3 件すべて 1 画面 / 1 component / 1 mock data の局所修正**、cross-screen propagation なし — Day 14-15 medium-fi で text + visual を同時 touch する箇所として最小 scope
- 影響 file 3 個: `components/case/CitationPanel.tsx` / `components/case/StagingHintPanel.tsx` / `data/mock-proposals.ts`
- 推定工数: AI work 5-10 min (3 file Edit) + human review 5 min

---

## §4. P2 directional 横断集計 (Step 2 + Step 3、Day 16+ polish 候補)

### §4.1 OCR 露出 (operator UI 言い換え候補、`_persona.md` §2.2 P1-5)

26 件出現 (mock-agents 5 + mock-proposals 12 + mock-cases 6 + mock-knowledge 3、全 mock data に集中、UI shell に直接出現 0):
- proposalTitle / summary / sourceCases sendbackReason / stagingSnippets title+excerpt / proposedDiff section+before+after / agent tools / agent promptSummary / case alert message / case evidence step name / case citation title / case relatedRuleUpdates ruleName / knowledge title+body
- `_persona.md` §2.2 P1-5 operator UI 言い換え方針: `OCR`→「読み取り」
- **decision pending**: banking back-office 習熟 user は `OCR` を業務専門用語として理解、言い換えで precision 損失 risk あり (`_persona.md` G-B1 不足 risk)。Step 4 で user に global decision を問う候補 (3 案: a. 全 OCR → 「読み取り」、b. 全 keep `OCR`、c. mock data 内 keep + UI label 内 paraphrase の hybrid)

### §4.2 Trust Level / Supervised / Checkpoint / Autonomous / Automation Maturity / Agent 英語残存

- 5 領域 label (Model / Prompt / Tool / Trust Level + JP「権限 / 範囲」) inconsistency
- Trust Level 英語多用 (AgentSettings Hero + badge / Metrics Hero + KRI / mock-agents promptSummary + permissions.boundary)
- Automation Maturity 英語残存 (AgentSettings Type C simulation description / mock-agents)
- Agent 英語多用 (Sidebar entry / Header / mock-agents.name suffix / KnowledgeBrowser DetailRow / AgentSettings)
- Tier 2 vocab、CLAUDE.md OK、`_persona.md` G-A5 directional、layer A facilitator 説明で catch up 可

### §4.3 RACI / SoD / SME 英語残存

- ProposalReview DetailDrawer button「提案詳細を見る (RACI + メタ情報)」 / title 「提案詳細 (RACI + メタ情報)」 / heading「RACI」 / footer 「職務分離 (SoD): 整理担当 ≠ 承認者 (同一人物化禁止、Type A 既定)」
- mock-proposals raci.c[0]「SME (法人事務 SME)」
- Tier 2 vocab、CLAUDE.md OK、Day 16+ で「役割分担」「(SoD)」 metadata 削除 / 「専門担当」検討候補

### §4.4 Alert 英語残存

- Metrics K3「Alert 発生率」 / R3「Alert 誤検知 急増」 + Dashboard 「Alert 発生率」 sparkline label + mock-cases alert severity field
- Tier 2 vocab + 用途 differentiation (backend signal name = `Alert` / user-facing display = `注意`) で意図的、Day 16+ で paraphrase global rename 検討候補だが影響範囲広

### §4.5 「メトリクス」 H1 / Sidebar entry

- 4 surface (Sidebar entry / Dashboard lane / Breadcrumb / Metrics H1) で `メトリクス` Tier 2 vocab、`指標` JP paraphrase 候補だが global rename で慎重判定 (Day 16+)

---

## §5. Tier 3 規制語 grep (CLAUDE.md scope-out gate verify)

Grep pattern: `マネロン|KYC|AML|犯罪収益|外為法|為替|与信判断|融資|個人情報保護法|GDPR|FATCA|SOX|J-SOX`

**結果**: **0 件** (`prototype/src/pages/` / `prototype/src/components/` / `prototype/src/data/`)

`CLAUDE.md` § Tier 3 scope-out gate **完全 pass** ✅、`_persona.md` G-A4 hard gate clean、Day 19 / Day 21 grep gate と整合

---

## §6. 技術用語 3 層分離 (`_persona.md` §2.2 P1-5)

| Term | operator UI / demo 表層 | dev-only / show-internal | 現状 verify |
| --- | --- | --- | --- |
| React / Vite / Tailwind | ❌ 不可 | ✅ 許可 | UI 表示 0 件、SHOW_INTERNAL_METADATA gate もこれら 0 ✅ |
| PDF | ✅ 許可 | ✅ 許可 | 多数出現 OK ✅ |
| KPI | ✅ 許可 | ✅ 許可 | Metrics / AgentSettings / Dashboard 多用 OK ✅ |
| OCR → 「読み取り」 | 言い換え推奨 | ✅ 許可 | 26 件 mock data 出現、UI shell 0 件、§4.1 directional |
| API → 「外部連携」 | 言い換え推奨 | ✅ 許可 | UI 表示 0 件、code import 多数 (operator UI 露出なし) ✅ |
| SLO → 「対応目安」 | 言い換え推奨 | ✅ 許可 | UI 表示 0 件、JSDoc comment 内のみ ✅ |
| SLA | (`_persona.md` §2.2 P1-5 では `SLO` のみ言及、`SLA` 未定義) | (同上) | Dashboard HypothesisChip「推移・SLA 閾値は [仮説 / 要検証]」(1 件)、mock-cases.ts CR comment 言及 — `SLA` 1 件のみ、`_persona.md` 適用判定保留、Step 4 で user 判断候補 |

---

## §7. AppShell PrototypeModeLabel 完全実装 verify

- 9 画面すべて AppShell 経由で PrototypeModeLabel が persistent pill 表示 (CaseReview / Inbox / SendBackComment / Dashboard / ProposalReview / AgentSettings / AuditTrail / Metrics / KnowledgeBrowser)
- 文言: 「プロトタイプ表示 — 外部システム未接続 / 証跡はモック」 (Tier 1+2 vocab、3 秒読み OK)
- Tooltip: 6 bullet (永続化なし / 外部システム未接続 / 実顧客データ未使用 / 実規制の引用なし / 検索 / 通知 / 一括操作 / フィルタ等の機能は次の実装段階で対応) — Demo Chapter 視聴 audience の caveat 完全カバー
- a11y: `role="status"` + JP aria-label + stable aria-describedby ✅

---

## §8. SHOW_INTERNAL_METADATA gate paradigm 完全実装 verify

- KnowledgeBrowser DetailPanel L434-437 + AuditTrail DetailPanel L408-411 — 2 画面で完全実装
- snake_case schema key user-facing default 非表示、`?debug=1` query で opt-in
- 入力者 / 業務責任者 / AI 管理者 / Manual 管理者 視野では JP primary label のみ
- Auditor (debug mode + grep 検索前提) は schemaKey access path 維持
- **`_persona.md` §3.4 G-B2 (過剰回避) hard gate perfect** ✅

---

## §9. 結論

### §9.1 P0 hard gate violation: **0 件**

- 9 画面 9 audit すべてで P0 / harmful 判定 0 件
- `_persona.md` G-A2/A3/A4 (component leak / identifier leak / Tier 3 不在) + G-B1-B5 hard gate すべて pass
- 本 step 1 §F grep + 本 §1 vocabulary table + 本 §5 Tier 3 grep + 本 §7 PrototypeModeLabel + 本 §8 SHOW_INTERNAL_METADATA で確認
- Plan §9.2 「0 件根拠付き accept」基準を満たす — Day 13 sign-off の CR R37-R51 cycle で hygiene が深く吸収済の整合性ある結果

### §9.2 P1 needs-fix: **3 件 (cross-screen scope 局所)**

- P1-A / P1-B (weight raw badge 2 component)
- P1-C (mock-proposals.ts decision criterion label 1 行)
- 影響 file 3 個、cross-screen propagation なし、推定工数 AI work 5-10 min + human review 5 min
- Day 14-15 medium-fi で text + visual 同時 touch 機会あり

### §9.3 P2 directional: 25+ 件 (Day 16+ polish 候補)

- `OCR` 26 件 (mock data 集中、Step 4 global decision candidate)
- Trust Level / Supervised / Checkpoint / Autonomous / Automation Maturity / Agent / RACI / SoD / SME / Alert / メトリクス Tier 2 英語残存
- 5 領域 label inconsistency (Model / Prompt / Tool / Trust Level + JP「権限 / 範囲」)
- 各画面 directional findings (Inbox 並び順 affordance / SendBackComment 括弧表記 / Dashboard lane naming / AgentSettings 5 領域 / AuditTrail mono visual)

### §9.4 S strategic: 0 件 (review-needed/ escalate なし)

- 本 review session では設計判断級の語彙体系再設計 / persona 再考は escalate 不要
- Phase 1 本番 persona 再設計時に別途検討

### §9.5 MEMORY 昇格候補 (Step 4 §6 で final 判定)

1. **SHOW_INTERNAL_METADATA gate paradigm** (KnowledgeBrowser + AuditTrail 2 画面実装) — `feedback_internal_metadata_query_gate.md` 新規昇格候補
2. **HypothesisChip section-level 集約 paradigm** (Day 19 Commit 1 U-1、per-row hedge → 1 surface) — `feedback_hedge_label_section_aggregation.md` 新規昇格候補
3. **mockKpiHypotheses SSOT import 共有 paradigm** (Metrics + AgentSettings、CR R40 M5 closure) — `feedback_kpi_ssot_closure.md` 新規昇格候補
4. **既存 MEMORY verify**: `project_backoffice_ai_v2.md` §B.5 (JP label primary + snake_case sub-caption dual display、R46 paradigm) + §B.6 (enum identifier 非露出、R37/R47 paradigm) — 9 画面 audit で完全実装 confirm、verify 完了
