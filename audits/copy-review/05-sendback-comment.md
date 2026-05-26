# Artifact Audit: SendBackComment (Copy Review、Step 3 Batch #2)

- Audit Date: 2026-05-25
- Artifact Path: `prototype/src/pages/SendBackComment.tsx` (349 行) + `components/{case/LifecycleStepper, shared/{StatusBadge, DisabledAction, Disclosure, PageFooter}}` + `lib/sendback-categories.ts` SSOT
- Primary user: 入力者 (90-180 sec 作文 mode)
- Persona SSOT: `_persona.md` v0.3

## §1. Scope

PageHeader (Breadcrumb 3-level / H1 `{case_id} 差戻しコメント` / workflow chip / StatusBadge / 経過 / LifecycleStepper) / Main form (案件概要 / 差戻し分類 5-radio + Disclosure 例 / data_error warning conditional / 差戻し理由 textarea / 関連根拠 checklist) / Sticky footer (キャンセル + 差戻しを記録 disabled)

## §2. Verdict Matrix

| Aspect | 層 A | 層 B | 総合 |
| --- | --- | --- | --- |
| Information completeness | demo「差戻し → staging → compiled」narrative で SendBackComment は staging 入口、5-category + 自由 textarea + 関連根拠 で flow visible | 入力者 90-180 sec 作文 mode: 5 category 全文記述 (L4 例 Disclosure expand)、textarea placeholder で example provided、関連根拠 checklist で AI 日次分析へのフィードバック品質 raise、揃う | keep-as-is |
| Information clutter | 5 section linear form (案件概要 / 分類 / data_error warning / textarea / evidence) — visual hierarchy 明確 | inner max-w-3xl wrap で form readability、過剰 noise なし | keep-as-is |
| Comprehensibility | 「差戻し分類」「差戻し理由」「関連根拠 (任意)」 — Tier 1 vocab 3 秒読み OK | 5 category JP label (誤読 / UI 差異 / 境界条件 / 判断境界 / 入力誤り) + description 短文 (≤30字) で choice cognition 低、L4 詳細は Disclosure expand 経由 | keep-as-is |
| Glossary consistency | `差戻し` 統一、`未承認ナレッジ` paraphrase 適用 (L229) | 5-category JP map 経由徹底 (sendback-categories.ts L26-50) | keep-as-is |
| Identifier hygiene | enum identifier (`data_error` 等) UI 露出 0、conditional logic は code-level | machine-parseable 形式維持 | keep-as-is |
| Component name leak | DisabledAction / Disclosure / LifecycleStepper code only | 同左 | keep-as-is |
| Tone / Register / AI voice | 「具体的な差戻し理由・修正提案を記述してください」 — 敬体 + 操作的、AI 1 人称不使用、actor 明示なし (人間入力 form) | 入力者 register 整合 (「修正提案」「未承認ナレッジへの昇格対象外」)、hedge 「次の実装段階で対応」 | keep-as-is |
| Mock content fidelity | placeholder「例: 福岡支店の住所マスタが旧形式 (- を含む) のため、新形式 (空白区切り) への正規化が必要です。」 — 業務 domain plausible、入力者の典型 sendback コメント | sendback-categories.ts description + detail 5 entry すべて業務典型 | keep-as-is |

## §3. Findings

### §3.1 Keep-as-is

- L75-85 Breadcrumb 3-level: `受信トレイ › {case_id} link › 差戻しコメント` — 戻り動線完備
- L90 H1: `{c.id} 差戻しコメント` — `prototype/CLAUDE.md` h1 規範通り (detail page で対象明示)
- L103 LifecycleStepper render (current step CaseReview と共通)
- L116 「案件概要」 + L119 「AI 入力結果からの抜粋。差戻し対象の文脈を確認してください。」 — 機能 + context 説明、tone OK
- L139 「案件レビューに戻る」 戻り link
- L151 「差戻し分類」 + L154 「5 分類から最も近いものを選択 (入力誤りは AI 責ではないため別経路)」 — 分類選択 instruction + data_error の意味事前明示
- L161 sr-only legend「差戻し分類を選択」 — SR 整合
- L191 category label + L197 description (≤30字) per cat — choice cognition 低
- L205 Disclosure title「例を見る」 + cat.detail expand
- L220-233 data_error warning banner: 「入力誤りは AI の学習対象になりません」 + 「記録・監査用の別経路に回り、未承認ナレッジへの昇格対象外となります。AI 入力結果の修正は通常の案件処理側で対応してください。」 — conditional warning、governance boundary 完全説明 + next action 明示
- L243 「差戻し理由」 + L246 「具体的な差戻し理由・修正提案を記述してください」
- L250 「{charCount} 文字」 mono right
- L257 textarea placeholder 自然例
- L272 「関連根拠 (任意)」 + L275 「差戻し対象に関連する根拠を選択してください (任意)」 — 任意 marker 明示
- L332 キャンセル button + L338 DisabledAction reason 「差戻し理由を記録し AI 日次分析に反映 (動作は次の実装段階で対応)」 — 本番動作 + prototype caveat

### §3.2 Directional (P2 polish)

- L155 「(入力誤りは AI 責ではないため別経路)」 括弧表記 — 5 category 選択前に instruction として表示、初見 audience に parse 重い可能性、Day 16+ で本文 separate
- L229 「記録・監査用の別経路に回り、未承認ナレッジへの昇格対象外となります。AI 入力結果の修正は通常の案件処理側で対応してください。」 — 完璧だが 2 文と長め、Day 16+ で「修正は通常の案件処理画面で」等 paraphrase 候補

### §3.3 Needs-fix

- なし

### §3.4 Harmful

- なし

## §4. Knowledge card binding

- `research-compounder/knowledge/ui-design/form-design-premium-tier.md` (form 5 section + radio + textarea)
- `research-compounder/knowledge/ux-design/hil-error-recovery-flow.md` (4-mode error recovery、本画面 = `sendback` mode の入り口)
- `research-compounder/knowledge/ui-design/agent-action-confirmation-ui.md` (confirmation form の structure)
- `research-compounder/knowledge/ux-design/conversational-ai-tone-and-persona.md` (data_error warning tone)

## §5. Recommendations

- P0 / P1: なし
- P2 directional: L155 / L229 paraphrase 候補 — Day 16+

## §6. Files Affected

- 修正不要 (本画面単独)
