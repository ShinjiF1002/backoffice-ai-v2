# SUMMARY — Backoffice AI v2 Copy Review (Step 4 統合)

- Audit Date: 2026-05-25
- Scope: 9 画面 WebUI 文字列の網羅 review (`prototype/src/{pages,components,data,lib,App.tsx}`)
- Persona SSOT: `audits/copy-review/_persona.md` v0.3
- Source: 12 audit file (00-glossary + 01-09 per-screen + 99-cross-screen + _persona)
- 関連 plan: `~/.claude/plans/sprightly-prancing-tower.md`

---

## §1. Statistics

| Metric | 値 |
| --- | --- |
| Total findings 分類 | **P0 / harmful: 0 件** / **P1 needs-fix: 3 件** / **P2 directional: 25+ 件** / **S strategic: 0 件** |
| 影響 file (P1) | 3 個 (`components/case/CitationPanel.tsx` / `components/case/StagingHintPanel.tsx` / `data/mock-proposals.ts`) |
| 推定工数 (P1) | AI work 5-10 min + human review 5 min |
| 9 画面 Verdict 内訳 | keep-as-is dominant (各画面 15-25 件) / needs-fix 0-2 件 / harmful 0 件 |
| Day 13 sign-off 整合 | ✅ P0 0 件は CR R37-R51 cycle で hygiene が深く吸収済の整合性ある結果 (Plan §9.2 「0 件根拠付き accept」基準 pass) |

---

## §2. P0 findings (Day 14 着手前必修)

**0 件**。`_persona.md` G-A2/A3/A4 hard gate + G-B1-B5 hard gate すべて pass、Tier 3 規制語 grep 0 件、PrototypeModeLabel 完全実装、SHOW_INTERNAL_METADATA gate 完全実装。

Plan §9.2 基準を満たす根拠:
- Step 1 §F mechanical grep 0 件 (snake_case / component leak / 英語 governance core / Tier 3)
- Day 13 持ち越し B/D の carryover evidence は §3 P1-C で吸収
- 9 画面 audit すべて harmful 判定 0 件

---

## §3. P1 findings (本 session 内 fix 済 — 2026-05-26)

### §3.0 P1 fixed / verify done (2026-05-26)

User 判断 (本 session 内 fix) に従い、以下 3 件を適用 + preview 検証完了:
- **P1-A**: `components/case/CitationPanel.tsx` L29 — `>high<` → `KNOWLEDGE_WEIGHT_STYLE.high.shortLabel` 経由「承認済」、import 追加
- **P1-B**: `components/case/StagingHintPanel.tsx` L43 — `{h.weight}` → `KNOWLEDGE_WEIGHT_STYLE[h.weight].shortLabel` 経由「確認済」/「未承認」、import 追加
- **P1-C**: `data/mock-proposals.ts` L44 — 「staging 内部矛盾」 → 「未承認ナレッジ 内部矛盾」

Visual verify (preview server `backoffice-v2-dev` port 5181):
- CaseReview `/cases/CASE-2026-0142`: CitationPanel 「承認済」 ×3 表示 ✅、StagingHintPanel expand 後「確認済」「未承認」表示 ✅
- ProposalReview `/proposals/PROP-2026-031`: 判定基準 3 行目「未承認ナレッジ 内部矛盾」表示 ✅、旧 `staging 内部矛盾` 0 件
- Console error 0 件、build clean

### §3.1 原 P1 listing (history、本 session で適用済)

**3 件、すべて cross-screen consistency 局所修正 (`_persona.md` G-B5 違反)**。Day 14-15 で text + visual を同時 touch する箇所として最小 scope、carry-forward すると修正 cost 上がる。

| # | File:line | 現状 | 修正案 | knowledge card binding | Audit file |
| --- | --- | --- | --- | --- | --- |
| **P1-A** | [components/case/CitationPanel.tsx:28-30](prototype/src/components/case/CitationPanel.tsx) | `<span ... mono ... text-success>high</span>` (static raw weight value) | `<span ...>{KNOWLEDGE_WEIGHT_STYLE.high.shortLabel}</span>` = 「承認済」 (lib/knowledge-labels.ts D.2 既存 SSOT 経由)、または badge text 削除 (emerald soft fill で visual signal 十分) | `citation-and-source-disclosure-ui.md` | [01-case-review.md §3.3](audits/copy-review/01-case-review.md) |
| **P1-B** | [components/case/StagingHintPanel.tsx:36-44](prototype/src/components/case/StagingHintPanel.tsx) | `<span>{h.weight}</span>` (dynamic raw weight `medium` / `low`) | `<span>{KNOWLEDGE_WEIGHT_STYLE[h.weight].shortLabel}</span>` = 「確認済」 / 「未承認」 | `citation-and-source-disclosure-ui.md` / `confidence-and-uncertainty-visualization-ui.md` | [01-case-review.md §3.3](audits/copy-review/01-case-review.md) |
| **P1-C** | [data/mock-proposals.ts:44](prototype/src/data/mock-proposals.ts) | `decisionCriteria[2].label: 'staging 内部矛盾'` (governance paraphrase 辞書「staging→未承認」違反) | 「未承認ナレッジ 内部矛盾」 | `feedback_decision_criterion_hygiene.md` MEMORY | [02-proposal-review.md §3.3](audits/copy-review/02-proposal-review.md) |

### §3.2 P1 修正 commit pattern (適用済)

- 3 file edit を本 session 内で適用、KnowledgeBrowser reference pattern (`audits/copy-review/03-knowledge-browser.md` §3.5) を 2 component に back-port、mock-proposals は governance 辞書遵守
- Day 14-15 着手前 clean state 確保

---

## §4. P2 findings (Day 16+ polish)

**25+ 件**。Tier 2 vocab CLAUDE.md OK + facilitator catch up 可能、Day 16+ medium-fi 完了後の polish phase で global decision。

### §4.1 OCR 露出 26 件 — Day 16+ polish 判断ルール確定 (2026-05-26)

mock data 集中 (mock-agents 5 + mock-proposals 12 + mock-cases 6 + mock-knowledge 3、UI shell 直接 0)。User 判断 (本 session): 一括置換は domain precision を落とし mock SME fidelity を壊す risk があるため defer to Day 16+。

**Day 16+ 適用ルール (確定)**:
- **UI label / alert heading**: 「読み取り」 または 「読み取り (OCR)」
- **mock body / proposal description / knowledge body**: 原則 `OCR` keep (domain precision 優先)
- **初出補助のみ**: 「OCR 読み取り」 ではなく 「読み取り (OCR)」 に寄せる

### §4.2 Tier 2 英語残存 (Day 16+ polish 検討)

- Trust Level / Supervised / Checkpoint / Autonomous (AgentSettings + Metrics + mock-agents)
- Automation Maturity (AgentSettings Type C simulation)
- Agent (Sidebar entry + Header + KnowledgeBrowser DetailRow + AgentSettings + mock-agents.name suffix)
- RACI / SoD / SME (ProposalReview DetailDrawer / mock-proposals.raci.c)
- Alert (Metrics K3/R3/R6 + Dashboard + mock-cases alert struct vs UI 「注意」 use)
- メトリクス (Sidebar / Dashboard / Breadcrumb / Metrics H1、global rename 候補だが慎重判定)

### §4.3 5 領域 label inconsistency (AgentSettings)

- `Model` / `Prompt` / `Tool` / `Trust Level` (英語) vs `権限 / 範囲` (JP) の mix、Day 16+ で統一検討

### §4.4 画面別 minor polish

- Inbox L128 並び順 affordance / L251 footer summary 視覚分離
- SendBackComment L155 / L229 paraphrase
- Dashboard L161 lane naming / L130 meta separator / L266 metadata
- AgentSettings 5 領域 / Automation Maturity
- AuditTrail L218 mono visual / DetailRow note 集約
- Metrics L131 meta description / Sparkline label

---

## §5. S findings (strategic、`review-needed/` escalate)

**0 件**。本 review session では設計判断級の語彙体系再設計 / persona 再考は escalate 不要。Phase 1 本番 persona 再設計時に別途検討。

---

## §6. MEMORY 昇格候補 (`project_backoffice_ai_v2.md` Next session checklist 4 個目 対応)

### §6.1 新規 `feedback_*.md` 昇格候補 (3 件)

| Memo 案 | 観察 evidence | 提案根拠 |
| --- | --- | --- |
| `feedback_internal_metadata_query_gate.md` | `lib/show-internal.ts` SSOT + KnowledgeBrowser L434-437 + AuditTrail L408-411 で `SHOW_INTERNAL_METADATA` (debug=1 opt-in) gate paradigm を 2 画面実装 | `_persona.md` §3.4 G-B2 (過剰回避) hard gate + §3.3 Auditor「machine-parseable identifier」要件の両立、Auditor 用 metadata visibility と入力者 / 業務責任者 view の cognitive load 分離 — 他 PJ (clarity / lucent / source-to-system) の Audit / DevTools 画面で再利用可能性 |
| `feedback_hedge_label_section_aggregation.md` | Day 19 Commit 1 U-1: Metrics + AgentSettings で per-row `[仮説 / 要検証]` × 4/9 を section-level HypothesisChip summary 1 surface に集約 | `_persona.md` G-B4 (hedge 必須 + AI voice consolidation) + visual noise 削減の両立、AI agent 設計全般で再利用可能 (regulated AI / 数値 hedge / status enum hedge) |
| `feedback_kpi_ssot_closure.md` | mock-metrics.ts `mockKpiHypotheses` を AgentSettings の `KPI_PROGRESSION` (Hero) に import 共有、CR R40 M5 closure で KPI 名 / target drift 防止 | KPI / KRI / metric SSOT が複数画面で再利用される時の drift prevention paradigm、本 PJ + 一般 dashboard PJ で適用可能 |

### §6.2 既存 MEMORY verify

- `project_backoffice_ai_v2.md` §B.5 (JP label primary + snake_case sub-caption dual display、R46 paradigm) — KnowledgeBrowser L434-437 + AuditTrail L408-411 で **完全実装 confirm**、verify 完了
- `project_backoffice_ai_v2.md` §B.6 (enum identifier 非露出 + JP map mandatory、R37/R47 paradigm) — 9 画面 audit で **完全実装 confirm** (例外: weight raw 2 件 + staging 1 件 = §3 P1)、verify 完了 + cross-page propagation pattern 確立
- `project_backoffice_ai_v2.md` §B.9 (governance term paraphrase 辞書、R44 paradigm) — 9 画面で完全実装、例外は §3 P1-C のみ、Day 14-15 持ち越し B 「例文内英語 paraphrase」の **解消 evidence**

### §6.3 既存 MEMORY 棄却候補

- `project_backoffice_ai_v2.md` §A.1 (mock content vs UI shell paradigm の audit gap、CR R49 再認識) — 本 audit で mock 自然文も hygiene 対象として §1.1 vocabulary table に統合済、別途昇格不要
- `project_backoffice_ai_v2.md` §A.2 (judgement delegation overreach、CR R49 M1/M2 conflict 候補) — 本 audit で SSOT 整合性 check (governance paraphrase 辞書 9 画面横断 verify) は私 (Claude) 側で即指摘可能だった、`_persona.md` G-B5 cross-screen consistency が SSOT として機能、別途昇格不要

---

## §7. `docs/_PROGRESS.md` patch 案

### §7.1 §1 Status table

Day 13 row に補記:
- 「Day 13 sign-off ✅ done」 + 「2026-05-25 copy review 実施、P0 0 件、P1 3 件、P2 25+ 件、Day 14 着手前 P0 0 件で gate clean」

### §7.2 §4 Open items

Day 14-15 持ち越し table への merge:
- 既存 A (sendback-categories / knowledge-labels shared module 化) — keep
- 既存 B (例文内英語 paraphrase) — **本 audit P1-C で部分解消 (`staging 内部矛盾` → 「未承認ナレッジ 内部矛盾」)**、残 `OCR` global decision は §4.1 で Step 4 §8 user 判断後の対応
- 既存 C (KnowledgeBrowser detail panel raw trace note の dev-only 寄せ検討) — **本 audit §8 で SHOW_INTERNAL_METADATA gate paradigm 確立、AuditTrail にも完全実装、解消方針確定**
- 既存 D (mock-knowledge.ts body 内軽微 文中表現 polish) — `OCR` global decision に統合
- **追加 E (本 review P1)**: P1-A / P1-B / P1-C の 3 件、Day 14-15 medium-fi 着手の最初の commit で適用 (file 3 個、推定工数 AI work 5-10 min + human review 5 min)
- **追加 F (本 review P2)**: Day 16+ polish 候補 25+ 件、global decision 必要なもの (OCR / Tier 2 vocab paraphrase / メトリクス global rename) は別途 user 判断 session

### §7.3 §4 末尾 narrative

「2026-05-25 copy review session 完了。`audits/copy-review/` 配下に 12 file (00-glossary + 01-09 per-screen + 99-cross-screen + _persona) 生成。P0 0 件 / P1 3 件 / P2 25+ 件、Day 14 着手前 gate clean。詳細は `audits/copy-review/SUMMARY.md` 参照。」

---

## §8. User decisions 確定 (2026-05-26)

本 Step 4 完了時の 4 判断、user 確定済:

- **§8.1 P1 fix timing**: ✅ 本 session 内で今 fix (§3.0 verify done)
- **§8.2 OCR 26 件**: ✅ Defer to Day 16+ polish (§4.1 判断ルール確定)
- **§8.3 MEMORY 昇格 3 件**: ✅ 後日別 session で判定 — Day 14-15 着手後の Phase B 確認後に再評価、今は本 SUMMARY §6 への記録のみ。`feedback_kpi_ssot_closure.md` は既存 MEMORY と重複 risk のため除外候補
- **§8.4 `docs/_PROGRESS.md` patch**: ✅ Claude が今適用 (§7 patch case、限定内容: copy review 完了 / 件数 / P1 fix 済 / OCR Day 16+ / MEMORY 後日 / SUMMARY 参照、P2 詳細列挙なし / MEMORY 作成済表現なし)

---

## §9. 関連 reference

- Persona SSOT: `audits/copy-review/_persona.md` v0.3
- Audit files: `audits/copy-review/00-glossary.md` + `01-09` per-screen + `99-cross-screen.md`
- Plan: `~/.claude/plans/sprightly-prancing-tower.md` (本 audit session の plan SSOT)
- Project state MEMORY: `project_backoffice_ai_v2.md` (Day 13 sign-off + Day 14-15 持ち越し A-D)
- Project root: `active/backoffice-ai-v2/CLAUDE.md` (Tier 1/2/3 語彙 + JP-only + scope-out)
- UI design SSOT: `active/backoffice-ai-v2/docs/03-ui-prototype-design.md`
- Approval model: `active/backoffice-ai-v2/docs/02-approval-model.md` §9.8 Role × 画面 access matrix
- R7 recipe: `active/research-compounder/templates/artifact-recipes/ai-native-ui-spec.md` Ship Gate
- Audit template: `active/research-compounder/templates/artifact-audit-template.md`
