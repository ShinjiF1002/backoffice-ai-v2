# Artifact Audit: KnowledgeBrowser (Copy Review、Step 2 Sample #3)

- Audit Date: 2026-05-25
- Artifact Path: `prototype/src/pages/KnowledgeBrowser.tsx` (445 行) + `components/shared/{PageFooter, FilterChip, MetaChip, PageHelpDisclosure}` + `lib/{sendback-categories, knowledge-labels, show-internal}` + `data/mock-knowledge.ts` (10 snippets) + `data/mock-agents.ts` (agentName 解決)
- Reviewer: agent (Claude、user review 待ち)
- Domain: UI Copy / Backoffice AI v2 / `_persona.md` §3.5 Primary = Manual 管理者
- Persona SSOT: `audits/copy-review/_persona.md` v0.3

---

## §1. Scope

- **Primary user (層 B)**: Manual 管理者 (日 10-30 件、skim + judge mode、staging body 1 件 30-60 sec 読み)
- **Secondary**: 業務責任者 (proposal source 確認時の参照)、AI 管理者 (consult)、Auditor (read)
- **対象 surface**: PageHeader (Breadcrumb / H1 / 期間 MetaChip / weight summary / 業務 filter / L1 governance subtitle) / PageHelpDisclosure (本画面の説明) / Filter chip row (分類 / 重要度) / Snippet list (weight dot + title + ws.label badge + data_error 「AI 引用対象外」 chip + body line-clamp-2 + meta row) / DetailPanel (8 項目 + 本文) / Sticky footer
- **mock surface**: 10 snippets = compiled (high) 5 (UC-BO-01: 3 + UC-BO-02: 2) + staging (medium/low) 3 (UC-BO-01: 2 + UC-BO-02: 1)、`KN-*` / `STG-*` ID prefix で source state visual segregation 済

---

## §2. Verdict Matrix (8 軸)

| Aspect | 層 A | 層 B (Manual 管理者) | 総合 verdict |
| --- | --- | --- | --- |
| **Information completeness (不足)** | L133-135 governance core「AI が引用根拠として使えるのは 承認済 ナレッジのみ」 が 3 秒読みで取れる、PageHelpDisclosure expand で 3 段階説明補足 | Manual 管理者 skim mode: row 単位で weight dot + title + body line-clamp-2 + meta row (date / workflow / category / sourceCase) で triage 可能。Judge mode (展開後 8 項目): JP primary label + body 全文 + 引用可否 conditional note | **keep-as-is** |
| **Information clutter (過剰)** | 初期表示はやや dense (PageHeader + L1 subtitle + PageHelpDisclosure + filter chip row + snippet list) だが各 section の visual separation 明確、3 秒読みで navigate path 取れる | snake_case schemaKey は `SHOW_INTERNAL_METADATA` (debug=1 query opt-in) gate で default 非表示 = **Auditor 用 metadata が Manual 管理者 skim 視野を雑音化しない設計 ✅** | **keep-as-is** (本 audit 内 best practice、§3.5 で highlight) |
| **Comprehensibility (即時理解性)** | Tier 1 「承認済 / 確認済 / 未承認」徹底 (KNOWLEDGE_WEIGHT_STYLE.{shortLabel/label} 経由)、3 秒読み OK | 習熟 vocab 整合 (「分類」「重要度」「全業務」「全分類」「全段階」)、ナレッジ詳細 8 項目の JP primary label 整合 | **keep-as-is** |
| **Glossary consistency** | governance paraphrase 辞書「staging→未承認 / compiled→承認済 / citation→引用根拠」徹底 (本画面が辞書適用の reference) | enum map (`SENDBACK_CATEGORY_LABELS` / `KNOWLEDGE_WEIGHT_STYLE`) 全 row 経由、raw enum identifier 露出 0 | **keep-as-is** (本 audit 内 best practice) |
| **Identifier hygiene** | snake_case schemaKey は SHOW_INTERNAL_METADATA gate (debug=1) で default 非表示、user-facing 0 | machine-parseable identifier (`KN-CORP-001` / `CASE-2026-031`) mono visual、Auditor 用 (debug mode で schemaKey visible) | **keep-as-is** (本 audit 内 best practice) |
| **Component name leak** | FilterChip / MetaChip / PageHelpDisclosure / PageFooter / DetailRow 等 code only、UI 0 件 | 同左 | **keep-as-is** |
| **Tone / Register / AI voice** | 「AI が引用根拠として使えるのは...」「未承認ヒントとしては可視」「AI 引用対象外」(data_error chip) — AI hedge + actor clear、断言調なし | Manual 管理者向け敬体 + 操作的 register、「該当するナレッジはありません。絞り込み条件を変更してください。」 empty state も適切 | **keep-as-is** |
| **Mock content fidelity** | mock-knowledge.ts 10 snippets: compiled 「OCR 信頼度閾値 0.85 — 手動確認 要求」「多店舗法人の住所変更 — 全店舗一括処理」 / staging 「福岡支店の住所マスタが旧形式」「国外住所の郵便番号フォーマット」「新フォーム (2026-05 改訂) の印鑑欄 表示構成」 — 業務 domain plausible、Manual 管理者 register 整合 | body 自然文 1-2 文 / 句点終止 / 言い切り型 (例: 「2026-05 改訂の口座開設新フォームでは印鑑欄が右下から左下に移動。OCR の照合座標 更新が必要。確認済 (未承認)、手順承認待ち。」) — Manual 管理者 skim 30-60 sec で要約把握可能、`OCR` 業務専門用語 として OK (§3.2 directional) | **keep-as-is** |

---

## §3. Findings

### §3.1 Keep-as-is

- **L99-105 Breadcrumb**: `ダッシュボード › ナレッジ` — 2 段階 (top-level page)、Sidebar entry「ナレッジ」と整合
- **L108 H1**: 「ナレッジ」 — top-level page H1 規範通り (screen-name h1 維持)
- **L109 MetaChip**: 「全期間 (検証用)」 — 検証用 mode label + 期間 implicit、Manual 管理者の filter affordance hint
- **L110-112 weight summary**: 「{count} 件 (承認済 {high} · 確認済 {medium} · 未承認 {low})」 — `KNOWLEDGE_WEIGHT_STYLE.{shortLabel}` 経由、3 段階 metric を 1 行に圧縮、Manual 管理者 skim 視点で全体感把握可能
- **L115-129 業務 filter**: 「業務:」 + 「全業務 / 法人住所変更 / 口座開設書類完備」 chip、active 状態 visual + aria-pressed
- **L133-135 L1 governance core subtitle**: 「AI が引用根拠として使えるのは 承認済 ナレッジのみ」 — **本画面の最重要 1 文、3 秒読みで citation governance boundary を取得可能**、Tier 1 「承認済」徹底
- **L142-149 PageHelpDisclosure body**: 「ナレッジは 承認済 / 確認済 / 未承認 の 3 段階で管理されます」 + 「確認済 / 未承認 は AI 提案の補助 (未承認ヒント) としては可視ですが、引用根拠 にはなりません。」 — 3 段階意味 + 引用可否 boundary を完全説明、用語整合
- **L161 「分類:」 + L165 「全分類」 + L168 categories** — JP label map 経由、5 category (誤読 / UI 差異 / 境界条件 / 判断境界 / 入力誤り) 整合
- **L179-183 disabled FilterChip title「入力誤りは個別差戻し時に処理するため、本一覧の対象外」** — data_error category disabled 理由を JP で説明、Manual 管理者習熟 vocab 整合 (`_persona.md` §2.4 G-A5 directional: 「個別差戻し時に処理する」は業務 process 前提、layer A 初見には parse 重い可能性、§3.2 directional)
- **L191 「重要度:」 + L194 「全段階」 + L198-215 weight FilterChip with dot color + `ws.label`** — color + JP label dual visual、Manual 管理者 filter 操作の affordance 整合
- **L228 「ナレッジ一覧」 + L230 「記録日が新しい順、行を選択すると 8 項目 詳細展開」** — sort + interaction hint、Manual 管理者 first-visit 教育
- **L240 empty state 「該当するナレッジはありません。絞り込み条件を変更してください。」** — next action 明示、tone 敬体
- **L277 snippet badge `{ws.label}`** — `承認済` / `確認済 (未承認)` / `未承認` (full label) 表示、CitationPanel L29 の `>high<` raw とは対照的に **JP map 経由完璧** (§3.5 で highlight)
- **L282 data_error badge「AI 引用対象外」** — data_error が staging 対象外であることを明示する重要 governance signal
- **L289-297 meta row**: date + WORKFLOW_LABEL + getSendbackCategoryLabel + sourceCase — mono font, dot separator (`·`)、Auditor 親和性 + Manual 管理者 skim 整合
- **L341 「ナレッジ詳細 (8 項目)」** — DetailPanel 開閉時の section heading、項目数明示で expand affordance
- **L354 weight chip `{ws.label}` (DetailPanel)** — full label 表示
- **L358-396 DetailRow 8 items**: ナレッジ ID / 記録日 / 業務 / Agent / 元 案件 / 分類 / 重要度 / ファイル — JP primary label perfect (Agent は §3.2 directional)
- **L367 「Agent」 label DetailRow** — Tier 2 vocab、CLAUDE.md OK、mock-agents.ts agent name の suffix 「Agent」と整合、ただし directional (§3.2)
- **L387-388 重要度 row note conditional**: weight==='high' → 「AI の引用根拠として使用可」 / else → 「AI の引用根拠 対象外 (未承認ヒントとしては可視)」 — 引用可否 inline 説明、Manual 管理者 judge mode に最適
- **L401-405 本文 section**: 「本文」 label + SHOW_INTERNAL_METADATA gate で `body` schemaKey opt-in、user-facing は label のみ
- **L434-437 schemaKey rendering**: SHOW_INTERNAL_METADATA (debug=1 query) gate で snake_case sub-caption が default 非表示 — **dev-only / Auditor 用 metadata を default UI から hide、本 audit 内 best practice**
- **mock-knowledge.ts compiled titles**: 「OCR 信頼度閾値 0.85 — 手動確認 要求」「法人格変更を伴う住所変更 — 別業務へ移行」 — 業務 domain plausible、`_persona.md` §4.3 mock SME check pass
- **mock-knowledge.ts staging body 「新フォーム (2026-05 改訂) の印鑑欄 表示構成」**: body 自然文 「2026-05 改訂の口座開設新フォームでは印鑑欄が右下から左下に移動。OCR の照合座標 更新が必要。確認済 (未承認)、手順承認待ち。」 — Manual 管理者 register 整合、phase 状態 (確認済 (未承認), 手順承認待ち) 明示

### §3.2 Directional (P2 polish 候補)

- **L181 disabled title「入力誤りは個別差戻し時に処理するため、本一覧の対象外」** — Manual 管理者習熟 vocab OK、layer A 初見にはやや parse 重い可能性。Day 16+ で「入力誤りは個別案件処理時に対応するため、本一覧では非表示」等の paraphrase 検討候補
- **L367 DetailRow label「Agent」** — Tier 2 OK、mock-agents.ts naming「{業務名} Agent」と整合、ただし業務責任者 / Manual 管理者向け context では「業務 Agent」「対応 Agent」等の paraphrase で precise になる可能性、Day 16+ directional
- **mock-knowledge.ts body 内 `OCR` 露出多数** — `_persona.md` §2.2 P1-5 operator UI 言い換え方針では「読み取り」、ただし Manual 管理者は banking back-office staging 整理 role で `OCR` を業務専門用語として理解、layer B precision との trade-off、Step 3 §99 で全 OCR 露出を batch 評価
- **L367 Agent value rendering**: `{agentName} · {agentVersion}` (例: 「法人住所変更 Agent · v0.1」) — Tier 2 `Agent` 残存、Day 16+ で「法人住所変更 Agent」 → 「法人住所変更 業務 Agent」検討候補 (ただし mock-agents.ts の `name` field 修正で対応、本画面 source 修正不要)

### §3.3 Needs-fix (Day 14 着手前または着手中)

(本画面 P1 0 件 — `KNOWLEDGE_WEIGHT_STYLE` SSOT 経由徹底 + `SHOW_INTERNAL_METADATA` gate + governance paraphrase 辞書全面適用で hygiene が他 2 sample 画面より深い)

### §3.4 Harmful (P0 必須)

(本画面 P0 0 件)

### §3.5 Cross-audit observation (Step 3 §99 elevate 候補)

**KnowledgeBrowser は本 audit 3 sample の中で governance hygiene が最も深く、CaseReview / ProposalReview の reference として使える**:

1. **Weight label rendering**: KnowledgeBrowser は全箇所 `KNOWLEDGE_WEIGHT_STYLE.{label/shortLabel}` 経由 (L111 / L144 / L213 / L277 / L354) — CitationPanel L29 + StagingHintPanel L43 の raw weight badge は本 paradigm を **back-port すべき** finding (§01-case-review.md §3.3 P1 と整合、Step 3 §99 で elevate)
2. **snake_case schemaKey gate**: KnowledgeBrowser の `SHOW_INTERNAL_METADATA` (debug=1 query opt-in) gate paradigm は AuditTrail の DetailRow (Step 3 §08 audit 対象) でも採用すべき paradigm の可能性、Step 3 §99 で確認
3. **Governance paraphrase 辞書全面適用**: L48-50 JSDoc 規範「staging→未承認、compiled approved→承認済、citation→引用根拠」が本 file で完全実装、`_persona.md` §3.4 G-B5 cross-screen consistency の reference

---

## §4. Knowledge card binding

- `research-compounder/knowledge/ui-design/citation-and-source-disclosure-ui.md` — citation chip / source tier 表示、本 audit の weight visual + governance copy 基準
- `research-compounder/knowledge/ui-design/action-history-timeline-audit-trail-ui.md` — DetailPanel 8 項目 frontmatter + schemaKey dual display の audit log column パターン整合
- `research-compounder/knowledge/ui-design/confidence-and-uncertainty-visualization-ui.md` — `承認済 / 確認済 / 未承認` 3 段階 weight semantic visualization 整合
- `research-compounder/knowledge/ui-design/jp-form-conventions.md` — filter chip / detail panel の JP form convention 整合
- `research-compounder/knowledge/ui-design/empty-error-loading-states.md` — empty state 「該当するナレッジはありません。絞り込み条件を変更してください。」 整合
- `research-compounder/knowledge/ux-design/multi-step-approval-and-workflow.md` — weight high (citation 候補) vs medium/low (staging hint) lifecycle 整合
- MEMORY: `feedback_lucent_ia_pattern_contract_closure.md` (canonical IA promotions の closure pattern)、本画面が SSOT 経由徹底の reference となっている観察

---

## §5. Recommendations

### §5.1 Day 14 着手前 (P0)

- なし

### §5.2 Day 14-15 medium-fi 着手中 (P1)

- なし (本画面単独で P1 0 件)
- **Cross-screen elevate**: CitationPanel / StagingHintPanel の raw weight badge (§01-case-review.md §3.3 P1) を本画面の `KNOWLEDGE_WEIGHT_STYLE` 経由 paradigm に back-port (Step 3 §99 で final scope 確定)

### §5.3 Day 16+ polish (P2 directional)

- L181 disabled title 「入力誤りは個別差戻し時に処理するため、本一覧の対象外」 → 「入力誤りは個別案件処理時に対応するため、本一覧では非表示」等 paraphrase 検討
- L367 DetailRow label 「Agent」 → 「業務 Agent」等 検討 (mock-agents.ts の `name` field 修正で対応も可)
- mock-knowledge.ts body 内 `OCR` 露出 → Step 3 §99 で OCR 全露出 batch 評価後 final decision

### §5.4 Strategic (S)

- なし

### §5.5 MEMORY 昇格判定材料 (Step 4 §6 で final 判定)

- `project_backoffice_ai_v2.md` MEMORY 「B.5 JP label primary + snake_case sub-caption dual display (R46 paradigm)」 — 本画面の `SHOW_INTERNAL_METADATA` gate 化で進化、`feedback_jp_label_snake_sub_caption_gated.md` 新規昇格候補 (但し既存 R46 paradigm との関係整理が前提)
- `project_backoffice_ai_v2.md` MEMORY 「B.6 enum identifier 非露出 + JP map mandatory (R37/R47 paradigm)」 — 本画面が完全実装の reference、cross-page propagation audit (CR R37/R47 観察) の verify 完了、Step 3 §99 で他画面の status を見て最終判定

---

## §6. Files Affected

- **本画面修正不要**: KnowledgeBrowser.tsx + mock-knowledge.ts 修正対象なし
- **Cross-screen impact**: §3.5 #1 で CitationPanel / StagingHintPanel への back-port が Step 3 §99 で確定
- **MEMORY 昇格判定**: `~/.claude/projects/-Users-shinjifujiwara-code/memory/project_backoffice_ai_v2.md` (Step 4 §6 で更新候補)
