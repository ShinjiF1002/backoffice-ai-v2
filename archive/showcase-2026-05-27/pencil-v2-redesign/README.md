# Pencil v2 Redesign — Backoffice AI v2 Prototype 9 画面の刷新案

> **既存 prototype/src/** は zero-touch。本 directory は production 9 画面の参照 reference として、Pencil MCP で独立に再 design した刷新案を 14 frame で提供する。user が A/B variant を選択 → 後段で back-port 判断を行うための reference set。

## Mission

「文字を読ませない・ぱっと見で次の行動が分かる・追加情報は深掘り可能」UI への lift。screenshot による self-audit + 改善 loop を frame ごとに rubric pass まで反復。compounder knowledge cards (`active/research-compounder/knowledge/ui-design/*`) を per-frame に最低 3 card 適用。

## 14 Frame 構成

5 routes は viable variant 候補 2+ につき A/B 2 version 構築 (Wow 路線が IA を変える場合のみ)、残り 4 routes は単 version。

| # | Route | Tier | Wow 路線 | 1 秒で分かること | Primary CTA | Thumbnail |
|---|---|---|---|---|---|---|
| **R1A** | Dashboard | 1 Exec | Editorial | top urgent 案件 + フリート grade A− | 「案件を開く」 | [exports/R1A-dashboard-editorial-overview.png](exports/R1A-dashboard-editorial-overview.png) |
| **R1B** | Dashboard | 3 Op | Density (Cockpit) | 業務別 queue depth + next 1 件 | 「1 を開く」⌘1 | [exports/R1B-dashboard-operator-cockpit.png](exports/R1B-dashboard-operator-cockpit.png) |
| **R2** | Inbox | 4 Power | Density (Bloomberg) | 自 queue critical-first 1 件 | 「先頭を開く」⌘O | [exports/R2-inbox-density.png](exports/R2-inbox-density.png) |
| **R3A** | CaseReview | 3 Op | Editorial (calligraphy diff) | what changed (大型 diff) + 91% high | 「承認」⌘↵ | [exports/R3A-case-review-editorial.png](exports/R3A-case-review-editorial.png) |
| **R3B** | CaseReview | 3 Op | Density (3-col tight) | AI 入力結果 + 全証跡 + AI 提案 並列 | 「承認」⌘↵ | [exports/R3B-case-review-density-split.png](exports/R3B-case-review-density-split.png) |
| **R4** | SendBackComment | 3 Op | Editorial (form) | 差戻し category 4 種 + 必須 free-text | 「差戻しを記録」⌘↵ | [exports/R4-send-back-comment.png](exports/R4-send-back-comment.png) |
| **R5A** | ProposalReview | 3 Op | Editorial (diff body) | 提案 summary + 大型 diff + 3 択 | 「業務責任者へ送付」 | [exports/R5A-proposal-review-editorial.png](exports/R5A-proposal-review-editorial.png) |
| **R5B** | ProposalReview | 3 Op | Density (list + drawer) | queue 5 件 + 選択 detail drawer | 「業務責任者へ送付」 | [exports/R5B-proposal-review-density.png](exports/R5B-proposal-review-density.png) |
| **R6** | AgentSettings | 2 Mgr | Editorial (Trust Hero) | 現在 Supervised + 引き上げ申請可否 | 「引き上げ申請」(disabled w/ reason) | [exports/R6-agent-settings.png](exports/R6-agent-settings.png) |
| **R7** | AuditTrail | 4 Power | Density (swimlane) | actor 別 timeline + critical 位置 | 「critical のみ」/「⇣ digitally signed」 | [exports/R7-audit-trail-swimlane.png](exports/R7-audit-trail-swimlane.png) |
| **R8A** | Metrics | 2 Mgr | Editorial (IR prospectus) | 6 KPI snapshot + grade B+ | 「⇣ PDF prospectus」 | [exports/R8A-metrics-editorial-ir.png](exports/R8A-metrics-editorial-ir.png) |
| **R8B** | Metrics | 2 Mgr | Density (Manager) | 4 KPI gate + 9 KRI + 業務別 trend | (chip nav) | [exports/R8B-metrics-density-manager.png](exports/R8B-metrics-density-manager.png) |
| **R9A** | KnowledgeBrowser | 3 Op | Editorial (Library) | 今週 compiled 3 + staging 4 | (card hover) | [exports/R9A-knowledge-editorial-library.png](exports/R9A-knowledge-editorial-library.png) |
| **R9B** | KnowledgeBrowser | 3 Op | Density (Bento) | 218 compiled + 3 lane (promote/revoked/期限切れ) | (lane hover) | [exports/R9B-knowledge-density-bento.png](exports/R9B-knowledge-density-bento.png) |

## A / B Variant 比較 (5 routes)

| Route | A: Editorial 系 | B: Density 系 | Variant 判断材料 |
|---|---|---|---|
| **R1 Dashboard** | A: Exec overview。1 文 hero + 業務 2 card + 5 工程 lane。CEO / Board 想定。 | B: Op cockpit。5 KPI strip + 業務別 stage 分布 + next 5 queue。daily ops 想定。 | role × time pressure で選択 (Exec daily / Op shift) |
| **R3 CaseReview** | A: 大型 diff calligraphy + supporting strip 3 (confidence 91 / cite T1 / staging 詳細→drawer)。承認判断の "what changed" 1 秒。 | B: 3-column tight。AI 入力 6 field + 6 step 証跡 + AI 提案 (compact diff + cite + staging)。並列 scan 重視。 | 1 件深掘り (A) vs 全 evidence 並列 (B) |
| **R5 ProposalReview** | A: 大型 diff body + 元案件 14 件 list + RACI box。読解重視。 | B: queue 5 件 list + drawer detail。複数 proposal を流す power-user 想定。 | 1 件熟読 (A) vs 複数 triage (B) |
| **R8 Metrics** | A: IR prospectus 6 KPI tile + grade hero B+。役員向け / 報告書配布想定。 | B: 4 KPI gate hero + 9 KRI grid (3×3) + 業務別 sparkline。manager daily ops 想定。 | 報告書 (A) vs operational dashboard (B) |
| **R9 KnowledgeBrowser** | A: Library reading style。今週 compiled 3 article + staging 4 card。ナレッジ熟読想定。 | B: Bento dashboard。218 KPI dark card + 3 lane (promote/revoked/期限切れ) + weight donut + coverage matrix + refresh trigger list。pipeline 監視想定。 | 読み物 (A) vs pipeline ops (B) |

## Compounder Knowledge 適用

各 frame 最低 3 card を適用、出典 trace は [compounder-trace.md](compounder-trace.md)。共通 base:

- `wow-taxonomy-for-web-ui` — 1 primary + 1 secondary、残り意図的に弱める
- `when-minimalism-beats-wow` — banking restraint = premium signal
- `dashboard-density-tier-bands-ui` — 1 画面 1 tier 厳守
- `progressive-disclosure-and-density` — drawer 折りたたみ default
- `scan-pattern-induced-by-layout` — F / layer-cake / spotted / marking / commitment
- `text-density-investigation-framework` + `when-more-text-is-correct` — 削減と保持の境界
- `editorial-typography-for-premium-web` + `jp-display-typography-premium`

frame 個別の specific card は [compounder-trace.md](compounder-trace.md) 参照。

## Audit Loop (per frame、rubric 9/9 pass)

各 frame は build → screenshot → 9 rubric check → patch → 再 screenshot を pass まで反復。詳細は [audit-loop.md](audit-loop.md)、削減 / 保持の理由は [design-decisions.md](design-decisions.md)。

Rubric (mechanical):
- A1 squint test (1 秒で次 button 分かる) / A2 text count (説明 ≤ 5%) / A3 density tier 整合 / A4 scan pattern alignment / A5 CJK bypassing 回避 / A6 Charter 4 層成立 / A7 default 露出制限 / A8 primary CTA 唯一性 / A9 when-more-text 安全装置 (governance hedge 残存)

## 既存 prototype 比較 → back-port 判断 (user 委任)

本 reference set は **production 9 画面 polish target SSOT (Plan v1.4.1 Fix 3 / v1.4.2 Rule 6 「ALL 95% equal」) を更新しない**。user squint review (本 README の 14 thumbnail) 後、以下を確定して頂きたい:

1. **A/B variant 5 routes (R1/R3/R5/R8/R9) の選択** — どちらを production に back-port するか
2. **採用判断**: 全 14 frame、部分 7-9 frame、全部却下、いずれか
3. **back-port scope 確定後、Plan update → 9 画面 production polish を別 session で実行** (本 directory は read-only reference として保持)

## Token / Composition 規範 (既存 SSOT 整合)

- Operational Premium Light token (`docs/03-ui-prototype-design.md` §2.7 SSOT) を 100% 流用、新 token 0
- 「プロトタイプ表示」persistent pill 全 14 frame に配置
- BusinessApproval chip UI 表示 = `承認者承認: 承認待ち` (component 名 leak 禁止)
- Lifecycle stepper exactly: `受付 → AI 処理 → 入力者確認 → 承認者承認 → 反映` (手順承認 含まない、R3A/R3B/R4 のみ表示)
- 9 route invariant 厳守 (10 番目の route / 画面追加なし)
- JP-first (英語は技術固有名詞のみ、`React` / `JST` / `UTC` / `API` / `PDF` / `OCR` / `KPI` / `SLO` / `SoD` / `DKIM` / `SPF` / case ID / agent name / version)
- `[仮説 / 要検証]` hedge label は Metrics 系 (R8A/R8B) で残置 (governance)
