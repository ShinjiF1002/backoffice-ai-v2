# Artifact Audit: CaseReview (Copy Review、Step 2 Sample #1)

- Audit Date: 2026-05-25
- Artifact Path: `prototype/src/pages/CaseReview.tsx` (271 行) + 関連 components (`components/case/{LifecycleStepper, CitationPanel, StagingHintPanel, RelatedRuleAlert, EvidenceTimeline, AddressDiffBlock, ConfidenceBar, ConfidenceLegend}`、`components/shared/{StatusBadge, NextActionStrip, PageFooter, BusinessApprovalChip}`) + mock-cases.ts CASE-2026-0142 fields
- Reviewer: agent (Claude、user review 待ち、`_persona.md` v0.3 適用)
- Domain: UI Copy / Backoffice AI v2 / Hero 1 (Demo Chapter 1 主画面)
- Persona SSOT: `audits/copy-review/_persona.md` v0.3

---

## §1. Scope

- **Primary user (層 B、`_persona.md` §3.5)**: 入力者 + 承認者 (1 日 30-80 件、skim → judge mode、case 単位 60-180 sec)
- **Secondary**: 業務責任者 (escalate 時の確認 read)、Auditor (read own)
- **対象 surface**: PageHeader / Breadcrumb / H1 / LifecycleStepper / NextActionStrip / Case alert strip / 3-column main (AI 入力結果 / EvidenceTimeline / CitationPanel + StagingHintPanel + RelatedRuleAlert) / Sticky footer (差戻し / 承認 + BusinessApprovalChip)
- **mock surface**: CASE-2026-0142 (法人住所変更、入力者確認待ち、信頼度 0.84-1.0、alert 2 件、citation 3 件、staging hint 2 件、related rule update 1 件)

---

## §2. Verdict Matrix (8 軸)

| Aspect | 層 A (Session 4 audience) | 層 B (操作者 = 入力者 + 承認者) | 総合 verdict |
| --- | --- | --- | --- |
| **Information completeness (不足)** | 3 秒読みで demo message「入力者が AI 結果を確認 → 差戻し / 承認」が取れる (LifecycleStepper + NextActionStrip + 差戻し / 承認 CTA で flow visible) | 入力者の case 判断に必要な material が同画面に揃う (AI 入力結果 / Confidence / Citation / Staging hint / Alert / Related rule update / 4-eyes status BusinessApprovalChip) | **keep-as-is** |
| **Information clutter (過剰)** | NextActionStrip 「判定要約」 + LifecycleStepper + Case alert strip + 3-column の重畳が 88px PageHeader に集中、初見視覚的 dense | 入力者 skim 視野で 3-column の中央 timeline と右 citation 領域が常時可視、判断対象でない Auditor 用 sub-caption (mono、`{slug}` 等) は noise として visible だが size 抑制 (10px slate-400) | **directional** (P2、polish 候補、Day 16+ visual hierarchy 調整) |
| **Comprehensibility (即時理解性)** | Heading「{case_id} {workflowName}」+ 「AI 入力結果」+「引用根拠 — 承認済みナレッジのみ」「未承認ヒント (引用根拠 対象外)」の governance copy が 3 秒読みで意図取れる、Tier 1+2 中心 | label / status / button text が習熟 user の想起 vocabulary と一致 (`差戻し` / `承認` / `経過` / `注意 · N 件` / `項目` / `件`) | **keep-as-is** |
| **Glossary consistency** | `承認済` / `未承認` / `引用根拠` の governance paraphrase 統一済、Tier 3 不在 | 同概念 cross-screen 揺れなし (`案件処理` / `判定要約` は Inbox / Dashboard breadcrumb との整合 OK)、enum map (caseStatusToTone) 経由徹底 | **keep-as-is** |
| **Identifier hygiene** | snake_case enum 直接表示なし (`statusLabel` JP 経由)、case ID は mono font の visual hygiene (Auditor 観点 OK) | machine-parseable 形式維持 (case ID `CASE-YYYY-NNNN`、timestamp `YYYY-MM-DD HH:mm:ss`)、ただし **CitationPanel L29 `>high<` raw weight badge** が user-facing leak (詳細 §3.4) | **needs-fix** (G-B5 違反、Step 3 §99 cross-screen で broader impact 評価) |
| **Component name leak** | `BusinessApprovalChip` / `CitationPanel` / `StagingHintPanel` / `RelatedRuleAlert` 等は code only、UI 表示 0 件 | 同左 | **keep-as-is** |
| **Tone / Register / AI voice** | 敬体 / 冷静 / 操作的、AI hedge 適切 (`本案件は承認されました (モック動作) — 受信トレイへ遷移します`、StagingHintPanel 末尾 `※ 本セクションは未承認の参考情報です。AI の正式実行根拠 (引用根拠) ではなく、確認者のヒントとしてのみ使用してください。`) | AI 1 人称不使用 ✅、断言調なし、actor 分離 (AI proposal label = `AI 提案` tooltip、staging panel = panel inset で人間 review 対象として分離) | **keep-as-is** |
| **Mock content fidelity** | mock-cases.ts CASE-2026-0142 field 全 5 項目 (法人名 / 旧住所 / 新住所 / 支店コード / 効力発生日) は法人住所変更業務の典型、alert message も plausible | 入力者 register 整合 (alert: 「OCR 信頼度が閾値 (0.85) を下回りました — 新住所の番地表記をご確認ください」 = 敬体 + 具体的 next action、`OCR` 英語残存は §F.4 で別評価) | **keep-as-is** (但し §3.6 で `OCR` paraphrase の directional 検討) |

---

## §3. Findings

### §3.1 Keep-as-is (両層 + aspect pass)

- **L73-78 Breadcrumb**: `受信トレイ › 案件処理 › {c.id}` — 3 段階の page-name segment で context 取得可能、case ID は mono で identifier visibility 維持 (Auditor 観点)、A/B 両層 pass
- **L83 H1**: `{c.id} {c.workflowName}` (例: `CASE-2026-0142 法人住所変更`) — `prototype/CLAUDE.md` h1 規範通り、3 秒読み OK
- **L93 LifecycleStepper**: 受付 / AI処理 / 入力者確認 / 承認者承認 / 反映 (5 段) — 全 JP、CR R20 訂正で `手順承認` 除外済、入力者の現在地理解に十分
- **L98-116 NextActionStrip**: 「判定要約」label + 動的 summary (例: `AI 入力結果 5 項目確認、信頼度 0.84 で閾値未達、注意 2 件`) — 入力者 skim 時の judge gate として適切、layer A の facilitator 説明と整合
- **L119-153 Case alert strip**: 「注意 · {count} 件」 + 各 alert message + sourceStep — Hierarchy clear、入力者の判断 trigger として直接 actionable
- **L163 「AI 入力結果」 heading + L164 「{count} 項目」 mono** — Tier 1+2 vocab、3 秒読み OK
- **L171 field label** (mock-cases.ts: `法人名` / `旧住所` / `新住所` / `支店コード` / `効力発生日`) — JP, 業務用語整合
- **L174-178 AI 提案 indicator**: tiny indigo dot + `aria-label="AI 提案"` + `title="AI 提案"` — CR R11.3 #5c で density 化済、Auditor 観点 OK
- **L222 CitationPanel section heading**: 「引用根拠 — 承認済みナレッジのみ」 (CitationPanel.tsx L15) — governance signal 明示、staging boundary を初見で取れる copy
- **L224 StagingHintPanel section heading**: 「未承認ヒント (引用根拠 対象外、{count} 件)」 (StagingHintPanel.tsx L25) — citation 対象外を chip + title 両方で明示、governance boundary 完全
- **StagingHintPanel.tsx L57 補足注**: 「※ 本セクションは未承認の参考情報です。AI の正式実行根拠 (引用根拠) ではなく、確認者のヒントとしてのみ使用してください。」 — Long-form governance disclosure、user 教育に有効、tone perfect (敬体 + 操作的)
- **L220 RelatedRuleAlert** (RelatedRuleAlert.tsx L27-29): 「関連手順が更新されています — {count} 件の手順更新 — 最新: {ruleName}」 + 「更新内容を見る」 link — `docs/03` §6.1 SSOT 整合、過去案件 / 未承認 / 承認済 boundary を覆う Alert UI 適用範囲 1 として正確
- **L242 success flash**: 「本案件は承認されました (モック動作) — 受信トレイへ遷移します」 — モック動作 caveat 明示、demo mode 透明性 OK (`role="status" aria-live="polite"` で SR 通知も整合)
- **L255 / L264 Footer CTA**: 「差戻し」 / 「承認」 — Tier 1 vocab、operating user 想起 vocabulary そのまま
- **mock-cases.ts CASE-2026-0142 fields**: 法人名 (株式会社サンプルホールディングス) / 旧住所 / 新住所 (千代田区丸の内、サンプルビル prefix 統一) / 支店コード (`042` mono) / 効力発生日 (`2026-06-15`) — `_persona.md` §4.3 mock SME check pass (法人格 + サンプル prefix + 全角番地)
- **mock-cases.ts alert messages**: 「住所マスタ照合: 都道府県マスタに該当エントリがありません — 手動確認推奨」 — 敬体 + 具体 next action、入力者 register 整合

### §3.2 Directional (P2 polish 候補、B 充足、facilitator catch up 可)

- **L122 「注意 · {count} 件」 mono uppercase tracking-wide** — 視覚的に technical metadata 風、入力者 skim 視野で `件` 主体 / 数値強調が好まれる可能性、ただし visual 領域 (Day 14-15 medium-fi domain)、本 copy review では keep
- **L242 「本案件は承認されました (モック動作) — 受信トレイへ遷移します」** — 完璧だが「モック動作」括弧表記が初見 audience には parse 重い可能性、Day 16+ で「(モック上の動作です)」等 paraphrase 検討候補
- **mock-cases.ts alert message 内 `OCR` 露出**: 「OCR 信頼度が閾値 (0.85) を下回りました ...」 — `_persona.md` §2.2 P1-5 operator UI 言い換え方針では `OCR`→「読み取り」、ただし banking back-office の習熟 user は `OCR` を業務語彙として理解、layer A facilitator 説明で catch up 可、directional P2 (Step 3 §99 cross-screen で broader 評価)

### §3.3 Needs-fix (Day 14 着手前または着手中)

- **【P1】CitationPanel.tsx L29 `>high<` raw weight badge** (CaseReview L222 で render)
  - 違反 gate: `_persona.md` §3.4 G-B5 (cross-screen consistency)、§2.4 G-A3 (identifier hygiene、ただし英語小文字単語なので borderline、cross-screen evidence で elevate)
  - 現状: `<span ... mono ... text-[var(--color-success)]>high</span>` — weight enum value がそのまま user-facing badge
  - **修正案** (具体 wording): `<span>{KNOWLEDGE_WEIGHT_STYLE.high.shortLabel}</span>` = 「承認済」 (lib/knowledge-labels.ts D.2 既存 SSOT 経由) — alternatively, badge は既に emerald soft fill で承認済 visual 表現できているので **text を「承認済」**に変更 / **badge 自体 mono `high` → emerald soft chip without text** にする 2 案あり
  - knowledge card binding: `research-compounder/knowledge/ui-design/citation-and-source-disclosure-ui.md` (citation 表示の standard、source tier の visible signal)、`feedback_component_selection_map.md` (KPI / chip 選択 row 揺れ memo)
  - priority: P1 (Day 14-15 medium-fi で text と visual を同時 touch、carry-forward すると cost 上がる)
  - 影響 file: `components/case/CitationPanel.tsx` L28-30 / `components/case/StagingHintPanel.tsx` L36-44 (波及、§3.5 別 finding)
- **【P1】StagingHintPanel.tsx L43 `{h.weight}` raw badge** (CaseReview L224 で render)
  - 違反 gate: 同上 G-B5、ただし staging context では `medium` / `low` raw が weight semantic を直感伝達せず操作者の即時理解性を阻害 (`_persona.md` G-B1 不足側にも該当 — Manual 管理者 skim mode で「medium = 確認済 (未承認)」想起できない)
  - 現状: `<span>{h.weight}</span>` (medium / low literal)
  - **修正案**: `<span>{KNOWLEDGE_WEIGHT_STYLE[h.weight].shortLabel}</span>` = `確認済` / `未承認`
  - knowledge card binding: 同上 citation-and-source-disclosure-ui.md、`confidence-and-uncertainty-visualization-ui.md`
  - priority: P1

### §3.4 Harmful (P0 必須)

(本画面で `harmful` 判定 0 件 — Day 13 sign-off の CR R37-R51 cycle で hygiene が CaseReview を主軸に多周 cycle されたこと + `_persona.md` G-A2/A3/A4 hard gate が clean なことから、本画面 P0 0 件は **整合性ある結果**。`_persona.md` §9.2 と plan §9.2 「0 件根拠付き accept」基準を満たす)

### §3.5 Citation panel sourcePath truncation (Borderline、informational)

- CitationPanel.tsx L35: `c.sourcePath.replace('workflows/', '...').replace('/knowledge/compiled/', '/')`
  - 出力例: `workflows/corporate-address-change/knowledge/compiled/ocr-confidence-threshold.md` → `.../corporate-address-change/ocr-confidence-threshold.md`
  - `compiled` 文字列は truncate で消えるが `corporate-address-change` slug は visible (Auditor grep 親和性のため maintain)
  - 違反なし、Auditor (Step 3 §99 で別判定) の machine-parseable identifier 要件 (`_persona.md` §3.3) と整合
  - verdict: **keep-as-is** (G-B5 OK、ただし Step 3 §99 cross-screen で全 sourcePath display を一括確認推奨)

---

## §4. Knowledge card binding (本 audit で参照)

- `research-compounder/knowledge/ui-design/ai-native-hil-approval-ui.md` — 5-state HIL approval、actor band、Case lifecycle 5-step structure (受付 → AI処理 → 入力者確認 → 承認者承認 → 反映) と整合
- `research-compounder/knowledge/ui-design/citation-and-source-disclosure-ui.md` — citation chip / source tier 表示、本 audit §3.3 P1 修正案の根拠
- `research-compounder/knowledge/ui-design/confidence-and-uncertainty-visualization-ui.md` — ConfidenceBar per-field 表示 + 信頼度閾値 0.85 visible threshold は spec 整合
- `research-compounder/knowledge/ux-design/conversational-ai-tone-and-persona.md` — StagingHintPanel 末尾注 / Footer success flash の tone analysis 根拠
- `research-compounder/knowledge/ux-design/agent-failure-explainability-ui.md` — Case alert strip + RelatedRuleAlert の Alert UI 適用範囲 1 の根拠
- `research-compounder/knowledge/ui-design/action-history-timeline-audit-trail-ui.md` — EvidenceTimeline rail の `受付` / `OCR 抽出` / `マスタ照合` / `AI 入力結果生成` の audit log column 構造
- `research-compounder/knowledge/ui-design/empty-error-loading-states.md` — L53-62 「案件 {id} が見つかりません」 + 「受信トレイに戻る」 empty state 整合
- MEMORY: `feedback_component_selection_map.md` (KPI / chip / badge 選択精度)、`feedback_charter_read_before_done.md` (本 audit が CHARTER 4 層を coverage matrix 視点で見ているわけではなく、`_persona.md` の rubric に absent、Step 3 §99 で revisit)

---

## §5. Recommendations

### §5.1 Day 14 着手前 (P0)

- なし (本画面 P0 0 件)

### §5.2 Day 14-15 medium-fi 着手中 (P1)

1. **CitationPanel L29 + StagingHintPanel L43 の raw weight badge** を `KNOWLEDGE_WEIGHT_STYLE.{high/medium/low}.shortLabel` 経由に書き換え。`lib/knowledge-labels.ts` の既存 SSOT を活用、新規 map 追加不要。影響 file: 2 component + 関連 page (CaseReview / KnowledgeBrowser / ProposalReview などで CitationPanel / StagingHintPanel を使う箇所)。Step 3 §99 cross-screen で全 caller を sweep verify

### §5.3 Day 16+ polish (P2 directional)

- L122 注意 strip の mono uppercase tracking-wide → 入力者 skim 視野での `件` 強調検討
- L242 「(モック動作)」 → 「(モック上の動作です)」 等の paraphrase 検討
- mock-cases.ts alert 内 `OCR` → 「読み取り」言い換え 検討 (`_persona.md` §2.2 P1-5)、ただし banking back-office 習熟 user 想起 vocab とのトレードオフ、Step 3 §99 で全 OCR 露出を batch 評価して final decision

### §5.4 Strategic (S、review-needed/ escalate)

- なし

---

## §6. Files Affected

- `prototype/src/pages/CaseReview.tsx` (L222-224 — CitationPanel + StagingHintPanel render 箇所、修正自体は component 側で完結)
- `prototype/src/components/case/CitationPanel.tsx` (L28-30 — weight badge text)
- `prototype/src/components/case/StagingHintPanel.tsx` (L36-44 — weight badge conditional rendering)
- `prototype/src/lib/knowledge-labels.ts` (修正不要、既存 `shortLabel` SSOT を活用)
- `docs/03-ui-prototype-design.md` §2.7.2 (Citation / Staging Governance、weight display 規範に「shortLabel 経由必須」追記検討)
- `docs/_PROGRESS.md` §4 Open items (Day 14-15 持ち越し A に対応する shared module 化と統合検討)
