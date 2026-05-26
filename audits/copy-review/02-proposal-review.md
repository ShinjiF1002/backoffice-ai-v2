# Artifact Audit: ProposalReview (Copy Review、Step 2 Sample #2)

- Audit Date: 2026-05-25
- Artifact Path: `prototype/src/pages/ProposalReview.tsx` (363 行) + `components/proposal/ProposalLifecycleStepper.tsx` + `components/shared/{StatusBadge, DisabledAction, DetailDrawer, NextActionStrip, PageFooter}` + mock-proposals.ts PROP-2026-031
- Reviewer: agent (Claude、user review 待ち)
- Domain: UI Copy / Backoffice AI v2 / Hero 2 (Demo Chapter 2 主画面、手順承認 loop)
- Persona SSOT: `audits/copy-review/_persona.md` v0.3

---

## §1. Scope

- **Primary user (層 B)**: 業務責任者 (週 5-15 件、深読み mode、1 件 5-15 min) + Manual 管理者 (日 10-30 件、triage skim 30-60 sec)
- **Secondary**: AI 管理者 (consult)、Auditor (read)、入力者 / 承認者 (information notice)
- **対象 surface**: PageHeader (Breadcrumb / H1 提案 title / workflow chip / status badge / 経過 / 提案ソース annotation / ProposalLifecycleStepper) / NextActionStrip / 2-column main (左: 判定基準 + 元案件 + 未承認ヒント、中央: 提案 差分) / DetailDrawer (RACI + メタ情報) / Sticky footer (差戻し / 業務責任者へ送付 + per-button DisabledAction reason)
- **mock surface**: PROP-2026-031 (法人住所変更、OCR 閾値引き上げ提案、status `pending-triage`、決定基準 3/3 達成、元案件 3 件、staging 3 件、proposed diff 2 ファイル)

---

## §2. Verdict Matrix (8 軸)

| Aspect | 層 A | 層 B | 総合 verdict |
| --- | --- | --- | --- |
| **Information completeness (不足)** | Demo Chapter 2 narrative「AI 日次分析 → 整理 → 業務責任者承認 → compiled 昇格」が画面上で 3 秒読み取れる (提案ソース annotation + 判定基準 + ProposalLifecycleStepper + footer instruction) | 業務責任者深読み: 判定基準 / 元案件 sendback reason / staging snippet excerpt / proposed diff before-after / RACI / 提案メタ揃う。Manual 管理者 triage: NextActionStrip 「提案要約」 + footer instruction「提案を整理し、業務責任者へ送付するか差戻しを判断してください」で triage 判断材料揃う | **keep-as-is** |
| **Information clutter (過剰)** | 2-column 構成 (Day 19 Commit 3b で右 column を DetailDrawer 化) で過剰 column 解消済、初見 audience に dense だが Hero 2 = demo climax として visual density 正当化 | 業務責任者深読み中に triage 用 footer instruction が visible だが「{p.raci.r}: ...」 prefix で role mismatch を回避、AI 管理者 / Auditor 用 detail は DetailDrawer に hide | **keep-as-is** |
| **Comprehensibility (即時理解性)** | 「提案要約」「判定基準」「元 案件」「未承認ヒント」「提案 差分 (変更前 / 変更後)」「提案詳細を見る」 — Tier 1+2 vocab、3 秒読み OK、ただし「[仮説 / 要検証]」threshold annotation は深読み mode 前提 | 業務責任者習熟 vocab 整合 (「業務責任者へ送付」「整理担当」「職務分離」「変更前 / 変更後」)、ただし「RACI」 英語残存 (Tier 2 OK、§3.2 directional) | **keep-as-is** |
| **Glossary consistency** | `承認済` / `未承認` / `引用根拠` paraphrase 適用、Tier 3 不在 | **「staging 内部矛盾」 decision criterion label (mock-proposals.ts) で `staging` 英語残存** — governance paraphrase 辞書 (staging→未承認) 違反、cross-screen consistency (G-B5) leak (§3.3 P1) | **needs-fix** |
| **Identifier hygiene** | snake_case enum 直接表示なし、proposal ID mono visual | machine-parseable 形式維持 (`PROP-YYYY-NNN`)、 raw weight value 露出は本 page 直接にはなし (StagingHintPanel の `{h.weight}` raw は CaseReview 経由でのみ rendering、本 page では「未承認ヒント」 panel inset で dot color のみ表示) | **keep-as-is** |
| **Component name leak** | DetailDrawer / NextActionStrip / DisabledAction / ProposalLifecycleStepper — code only、UI 表示 0 件 | 同左 | **keep-as-is** |
| **Tone / Register / AI voice** | AI 1 人称不使用、actor 明示 (「AI (日次分析)」)、hedge 適切 (`[仮説 / 要検証]` threshold)、敬体 footer instruction (「提案を整理し、業務責任者へ送付するか差戻しを判断してください」) | 業務責任者深読み register 整合、「(差戻し理由をコメント付きで AI 日次分析にフィードバック)」「(業務責任者 {approver} の承認者承認待ちへ転送)」DisabledAction reason が具体的 next action 明示、actor 分離完璧 | **keep-as-is** |
| **Mock content fidelity** | proposalTitle 「OCR 信頼度閾値の段階引き上げ提案 (0.85 → 0.88)」、summary 自然文 、decisionCriteria threshold 「3 件以上 [仮説 / 要検証]」 + sourceCases sendbackReason 「OCR 信頼度 0.86 で新住所の番地表記を誤抽出、入力者が手動修正」 — 法人住所変更 + AI agent 改善 narrative として plausible | 業務責任者 register 整合 (判定基準 / 差分 / RACI / impact)、Manual 管理者 triage 用 footer instruction 整合、queueOwner「高橋 美穂」 / approver「渡辺 真理」 = mock-cases.ts assignee 集合と SoD enforcement demo 整合 | **keep-as-is** (但し §3.2 directional に `OCR` / `pattern` paraphrase 候補) |

---

## §3. Findings

### §3.1 Keep-as-is

- **L76-80 Breadcrumb**: `受信トレイ › AI 提案レビュー › {p.id}` — Sidebar entry「AI 提案レビュー」と整合 (`Sidebar.tsx:42`)、proposal ID mono visual
- **L86 H1**: proposalTitle render — 「OCR 信頼度閾値の段階引き上げ提案 (0.85 → 0.88)」 が full title、初見でも提案 essence 取得可能
- **L98-104 提案ソース annotation**: 「提案ソース: AI (日次分析) · 判断根拠は左の判定基準 + 元案件 を参照」 — AI actor 明示 + 次の action navigation hint、tone perfect
- **L108 ProposalLifecycleStepper**: 整理 → 承認 → 反映 (3 段、CaseReview の 5 段と grammar 継承、状態理解 OK)
- **L115-117 NextActionStrip**: 「提案要約」 + 動的 summary 「元案件 {n} 件、判定基準 {met}/{total} 達成、提案差分 {n} ファイル」 — Manual 管理者 triage 視点で 3 metrics で即時判断可能
- **L127 「判定基準」** + 3 items + L142 「基準: {threshold}」 mono — 業務責任者深読みに足る decision context
- **L151 「元 案件」** + L152 件数 + L155 sourceCases (caseId link + categoryLabel JP chip + title + sendbackReason) — 元案件への drill-down path、Auditor grep 親和性も維持 (caseId mono)
- **L166 title attr「差戻し分類 (同種傾向の根拠)」** — chip role explanation, tooltip で深読み補助
- **L181 「未承認ヒント」 + L183 「引用根拠 対象外」 chip** — governance boundary 明示、CaseReview の StagingHintPanel と同 paradigm
- **L187 「本提案を支える未承認ナレッジ。承認後、正式手順 (承認済) に昇格予定。」** — staging → compiled lifecycle 明示、業務責任者教育に有効
- **L220 「提案詳細を見る (RACI + メタ情報)」** — DetailDrawer trigger、ただし `RACI` 英語残存 (§3.2 directional)
- **L226-227 「提案 差分 (変更前 / 変更後)」 + 「· 文書テキスト差分 (住所の行内差分とは別)」** — `proposed diff` の英語を「差分 (変更前 / 変更後)」JP paraphrase、CR R31 M2 で得た grammar として完璧、住所行内差分との区別注も適切
- **L243 「− 変更前」 / L250 「＋ 変更後」** — minus/plus prefix で diff visual 強化、JP label OK
- **L268 DetailDrawer title 「提案詳細 (RACI + メタ情報)」** — `RACI` Tier 2 英語残存 (§3.2 directional)
- **L279-298 DetailDrawer RACI 5-row** (`提案ソース` / `R · 整理担当` / `A · 承認` / `C · 相談` / `I · 情報共有`) — 「R · A · C · I」 + JP description で R/A/C/I 略字を業務責任者習熟 vocab に橋渡し、queueOwner / approver の names 副表示で SoD demo 整合
- **L302 「職務分離 (SoD): 整理担当 ≠ 承認者 (同一人物化禁止、Type A 既定)」** — `SoD` Tier 2 英語残存 (§3.2 directional)、ただし JP 「職務分離」prefix で意味取得可能
- **L307-323 提案メタ情報 4-row**: 提案 ID / 業務 / 生成日時 / 経過 — Auditor / 業務責任者 双方の追跡情報
- **L334-336 Footer instruction**: 「{p.raci.r}: 提案を整理し、業務責任者へ送付するか差戻しを判断してください」 — Manual 管理者 triage 視点で actor + 2 つの next action 明示、tone 敬体、role-targeted
- **L344, L352 DisabledAction reason**: 「差戻し動作は次の実装段階で対応 (差戻し理由をコメント付きで AI 日次分析にフィードバック)」「業務責任者送付動作は次の実装段階で対応 (業務責任者 {approver} の承認者承認待ちへ転送)」 — prototype mode caveat + 本番動作の説明、用語 specific (「フィードバック」「転送」)
- **mock-proposals.ts proposalTitle / summary**: 「OCR 信頼度閾値の段階引き上げ提案 (0.85 → 0.88)」「OCR 信頼度 0.85-0.88 範囲で人手上書き率が高い (12 件中 9 件)。...」 — `_persona.md` §4.3 mock SME check pass (具体的、業務責任者深読み mode 想定値、件数 / 割合 / 範囲 数値整合)
- **mock-proposals.ts sourceCases**: caseId / category / title / sendbackReason 4 field — 業務責任者深読みの drill-down material 完備
- **mock-proposals.ts proposedDiff**: targetFile `workflows/corporate-address-change/agent-instructions.md` + section `§3.2 OCR 信頼度判定` + before/after 自然文 「AI 抽出後に信頼度が 0.85 以上の場合、確認なしで自動補完を完了する [仮説 / 要検証]。」 — 業務責任者がそのまま読める文体、hedge ラベル徹底

### §3.2 Directional (P2 polish 候補)

- **`RACI` 英語残存** (L220 button text、L268 DetailDrawer title、L275 drawer内 heading) — Tier 2 vocab、CLAUDE.md OK、`_persona.md` §2.4 G-A5 directional gate 評価対象、Layer A facilitator 説明で catch up 可。Day 16+ polish 候補: 「役割分担」「責任分担」paraphrase 検討、ただし R/A/C/I 略字との一貫性で「RACI」維持の方が深読み user には認知 cost 低い可能性、Step 3 §99 で benchmark 後 final decision
- **`SoD` 英語残存** (L302 「職務分離 (SoD): ...」) — JP「職務分離」prefix で意味取得可能、Tier 2 OK、Day 16+ で「(SoD)」括弧 metadata 削除候補
- **L335 「業務責任者へ送付」 vs L356 button text 「業務責任者へ送付」 + DisabledAction reason** — `forward` の JP paraphrase「送付」徹底、`_persona.md` §3.4 governance paraphrase 辞書「forward→送付」整合 ✅、ただし「業務責任者送付動作」(L352) は連結語として違和感 (「業務責任者への送付動作」「業務責任者へ送付する動作」が natural)、Day 16+ で minor polish
- **mock-proposals.ts H1 + summary 内 `OCR` 残存** — `_persona.md` §2.2 P1-5 operator UI 言い換え方針では「読み取り」、ただし業務責任者は AI agent 改善提案を読む役割で `OCR` を業務専門用語として理解、layer B B-G1 (不足) を考慮すると言い換えで深読み user の precision 損失 risk。directional P2、Step 3 §99 で OCR 全露出を batch 評価
- **decisionCriteria 「共通 pattern 一致度」** (mock-proposals.ts L38 label) — `pattern` 英語残存、Tier 2 OK、Day 16+ で「傾向」「共通傾向 一致度」検討候補
- **mock-proposals.ts raci.c の 「SME (法人事務 SME)」** — `SME` 英語残存、Tier 2 OK、ただし業務責任者向け文脈で「専門担当」paraphrase 検討候補 (directional)
- **L334 「{p.raci.r}: 提案を整理し、業務責任者へ送付するか差戻しを判断してください」** — 完璧だが Manual 管理者 = `手順管理者 (整理担当)` の長い名称が前置されるため、簡潔化候補。Day 16+ で minor

### §3.3 Needs-fix (Day 14 着手前または着手中)

- **【P1】mock-proposals.ts L44 「staging 内部矛盾」 decision criterion label**
  - 違反 gate: `_persona.md` §3.4 G-B5 (cross-screen consistency)、`prototype/CLAUDE.md` governance paraphrase 辞書「staging→未承認」違反
  - 現状: `decisionCriteria[2].label: 'staging 内部矛盾'` (mock-proposals.ts L44)
  - **修正案**: 「未承認ナレッジ 内部矛盾」 (governance 辞書「staging→未承認」適用) — 「未承認ヒント 内部矛盾」も候補、ただし「未承認ヒント」は UI display 用 (本 panel の section heading L181)、knowledge 単位を指す本 criterion 文脈では「未承認ナレッジ」が precise
  - knowledge card binding: `research-compounder/knowledge/ui-design/citation-and-source-disclosure-ui.md` (staging / compiled の visual + linguistic boundary)、`feedback_decision_criterion_hygiene.md` MEMORY (Mechanical count + Semantic alignment)
  - priority: P1 (Day 14-15 medium-fi で text touch 機会あり、mock data 修正は単純)
  - 影響 file: `prototype/src/data/mock-proposals.ts` L44 (label) — 1 行修正、render side は thresholdの値 (`'矛盾なし'`) も整合 (G-B5 cross-screen で同一 paraphrase 維持)

### §3.4 Harmful (P0 必須)

(本画面 P0 0 件 — Day 13 sign-off 後の Sample audit として既存 hygiene が深いため整合性ある結果)

---

## §4. Knowledge card binding

- `research-compounder/knowledge/ux-design/multi-step-approval-and-workflow.md` — Manual 管理者 R + 業務責任者 A の 2-stage approval、DetailDrawer の RACI 5-row 構造整合
- `research-compounder/knowledge/ui-design/diff-and-change-preview-ui.md` — 「変更前 / 変更後」hairline border + tint diff、minus/plus prefix の standard pattern
- `research-compounder/knowledge/ui-design/ai-native-hil-approval-ui.md` — ProposalLifecycleStepper 3-state (pending-triage / forwarded / approved / rejected) の HIL 4-state HIL approval 整合
- `research-compounder/knowledge/ux-design/conversational-ai-tone-and-persona.md` — 「AI (日次分析)」 actor band + Manual 管理者 footer instruction tone
- `research-compounder/knowledge/ui-design/citation-and-source-disclosure-ui.md` — 「未承認ヒント (引用根拠 対象外)」 panel inset + 補足 paragraph の governance display
- MEMORY: `feedback_decision_criterion_hygiene.md` (Mechanical count + Semantic alignment、本 audit §3.3 P1 の判定根拠)

---

## §5. Recommendations

### §5.1 Day 14 着手前 (P0)

- なし

### §5.2 Day 14-15 medium-fi 着手中 (P1)

1. **mock-proposals.ts L44 「staging 内部矛盾」 → 「未承認ナレッジ 内部矛盾」** に変更 (governance paraphrase 辞書遵守)。1 行修正、影響範囲は ProposalReview L130-133 で render される 1 row のみ

### §5.3 Day 16+ polish (P2 directional)

- `RACI` 英語表記の paraphrase / metadata 削除検討 (L220, L268, L275)
- `SoD` 英語の「(SoD)」括弧 metadata 削除 (L302)
- `共通 pattern 一致度` → 「共通傾向 一致度」検討 (mock-proposals.ts L38)
- 「SME (法人事務 SME)」 → 「専門担当 (法人事務)」検討 (mock-proposals.ts raci.c)
- proposalTitle / summary / sendbackReason 内 `OCR` 露出は Step 3 §99 cross-screen batch 評価で final decision

### §5.4 Strategic (S)

- なし

---

## §6. Files Affected

- `prototype/src/data/mock-proposals.ts` (L44 label / §3.3 P1 修正)
- `prototype/src/pages/ProposalReview.tsx` (修正不要、mock-proposals.ts 経由で render 反映)
- `docs/_PROGRESS.md` §4 Open items (Day 14-15 持ち越し B「例文内英語 paraphrase」と統合検討、本 P1 修正は持ち越し B の subset)
