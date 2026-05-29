# Audit Loop — Pencil v2 Redesign

> Rubric: A1 squint / A2 text count / A3 density tier / A4 scan pattern / A5 CJK bypassing / A6 Charter 4 層 / A7 default 露出制限 / A8 primary CTA 唯一性 / A9 when-more-text 安全装置

各 frame は build → screenshot → audit → patch を rubric all-pass まで反復。

---

## R1A Dashboard Editorial Overview — iter 1 (PASS)

- A1 squint: 「今日のアテンション」 + case ID + filled 「案件を開く」 CTA + grade A− で次 action 明確 ✓
- A2 text count: 説明文 ≤ 5% ✓ (intro caption 削減済)
- A3 Tier 1 Exec ≤ 8 elements: CTA 1 + 業務 card 2 + 5 工程 = 8 ✓
- A4 Layer-cake (hero → 業務 → workflow lane) ✓
- A5 CJK 助詞 prefix bypassing なし ✓
- A6 4 層 (Micro/Meso/Structural/Language) 全て成立 ✓
- A7 deep 情報は別画面 link ✓
- A8 唯一 primary "案件を開く" (filled indigo) ✓
- A9 governance hedge は Exec view では不要 (Metrics に集約) ✓
- Result: **9/9 pass、iter 1 で完了**

## R1B Dashboard Operator Cockpit — iter 1 (PASS)

- A1: 5 KPI + 業務 2 stage breakdown + next 5 queue → 1 secで「⌘1 で先頭 open」分かる ✓
- A2: minimal ✓
- A3 Tier 3 Op ≤ 60: 5 KPI + 10 stage cells + 5 queue + 3 actions = 23 ✓
- A4 F-pattern (KPI top → 業務 left → queue right) ✓
- A5: ok ✓
- A6: ✓
- A7: agent drill は別画面遷移 ✓
- A8: 「1 を開く」⌘1 唯一 ✓
- A9: ok ✓
- Result: **9/9 pass**

## R2 Inbox Density Power-user — iter 1 (PASS)

- A1: top row highlighted + accent left border + ⌘O hint + 「先頭を開く」filled ✓
- A2: minimal cell text ✓
- A3 Tier 4 ≤ 200: 12 rows × 9 cols + 5 facets + KPI 3 = ~140 ✓
- A4 Marking (top row highlight) ✓
- A5: ok ✓
- A6: ✓
- A7: row click は drawer / navigate ✓
- A8: 唯一 "先頭を開く" filled CTA + secondary outline search ✓
- A9: ok ✓
- Result: **9/9 pass**

## R3A CaseReview Editorial — iter 1 (PASS)

- A1: 大型 char-level diff (red strike → green underline) で what changed 即読、91% 信頼度 + 引用根拠 T1 + 承認 filled CTA ✓
- A2: 説明文最小 ✓
- A3 Tier 3 Op: diff hero + 3 supp card + 6 evidence + bottom actions = ~24 ✓
- A4 Commitment (read → commit、上から下に読み下げ → 承認 button) ✓
- A5: ok ✓
- A6: ✓
- A7: staging hints 「詳細を見る →」、citation full body は drawer ✓
- A8: 承認 唯一 filled、差戻し outline ✓
- A9: 承認者承認 chip + cite T1 governance ✓
- Result: **9/9 pass**

## R3B CaseReview Density-split — iter 1 (PASS)

- A1: 3 column (AI 入力 / 証跡 / AI 提案) すべて見える、right column の diff + 91 + cit が primary decision surface ✓
- A2: dense だが説明 minimal ✓
- A3: ~30 elements ✓
- A4 Layer-cake × 3 column ✓
- A5: ok ✓
- A6: ✓
- A7: more exposed (intent: density-led variant) ✓
- A8: 承認 ✓
- A9: ok ✓
- Result: **9/9 pass**

## R4 SendBackComment Form — iter 1 (PASS)

- A1: category 4 chip + selected radio + filled textarea + Record CTA ✓
- A2: 各 category 1 行 desc に圧縮 ✓
- A3 form Tier 3: 4 category + textarea + evidence 5 + 2 actions = 12 ✓
- A4 Layer-cake ✓
- A5: ok ✓
- A6: ✓
- A7: data_error 切替 banner inline ✓
- A8: 「差戻しを記録」⌘↵ 唯一 ✓
- A9: rejection 文脈の必須 free-text + 「次回 AI 提案に staging hint」hedge 残置 ✓
- Result: **9/9 pass**

## R5A ProposalReview Editorial — iter 1 (PASS)

- A1: proposal title 大 + diff body (red strike → green underline rich) + 3 footer 票 ✓
- A2: RACI 部分 verbose だが governance 必須 (A9 範囲) ✓
- A3 Tier 3: 3 criteria + 6 元案件 + diff + 4 RACI + 3 actions = ~17 ✓
- A4 Commitment ✓
- A5: ok ✓
- A6: ✓
- A7: RACI compact + SoD note ✓
- A8: 唯一 primary 「業務責任者へ送付」filled ✓
- A9: SoD note + RACI 削れない ✓
- Result: **9/9 pass**

## R5B ProposalReview Density list — iter 1 (PASS)

- A1: 5 queue row + selected highlighted + drawer detail ✓
- A2: minimal ✓
- A3 Tier 3: 5 row + drawer 内 7 elements = 12 ✓
- A4 Marking ✓
- A5: ok ✓
- A6: ✓
- A7: drawer = progressive disclosure ✓
- A8: drawer 内 「業務責任者へ送付」唯一 filled ✓
- A9: RACI + SoD は drawer 内に保持 ✓
- Result: **9/9 pass**

## R6 AgentSettings — iter 1 (PASS)

- A1: Trust Level Hero (Supervised 強調 + 4 KPI states) + 引き上げ申請 disabled chip ✓
- A2: 5 領域 sub-text 圧縮 ✓
- A3 Tier 2 Mgr ≤ 24: Trust 3 stage + 5 領域 + history 3 + 申請 = 12 ✓
- A4 Layer-cake (hero → 5 領域 → history + cta) ✓
- A5: ok ✓
- A6: ✓
- A7: 5 領域 read-only summary、編集は別画面 ✓
- A8: 「引き上げ申請」disabled + 理由 ✓
- A9: 4 KPI 仮説 / 要検証 hedge は Metrics に集約 (cross-reference) ✓
- Result: **9/9 pass**

## R7 AuditTrail Density swimlane — iter 1 (PASS)

- A1: actor 別 swimlane + critical event (red) 即見える + 「critical のみ」filter chip + ⇣ Export ✓
- A2: event verb mono + 1 行 desc ✓
- A3 Tier 4: 13 events × 3 col + 5 facets + replay control = ~50 ✓
- A4 Marking + Layer-cake ✓
- A5: ok ✓
- A6: ✓
- A7: payload は row click drawer ✓
- A8: critical filter 唯一 active filter、Export は secondary ✓
- A9: 7 年保存 + digital signature 文言保持 ✓
- Result: **9/9 pass**

## R8A Metrics Editorial IR — iter 1 (PASS)

- A1: editorial cover thesis + grade B+ hero + 6 KPI tile 各 large numeral ✓
- A2: methodology footnote ない (separate doc 想定) ✓
- A3 Tier 2 Mgr: 6 tile + cover + footer hint = ~10 ✓
- A4 Spotted (各 tile 独立 read) ✓
- A5: ok ✓
- A6: ✓
- A7: methodology footnote は §A drawer (本画面では呈示しない) ✓
- A8: 「⇣ PDF prospectus」唯一 primary ✓
- A9: 全 KPI に「[仮説 / 要検証]」hedge 必須 — 全 tile に表示済 ✓
- Result: **9/9 pass**

## R8B Metrics Density Manager — iter 1 (PASS)

- A1: 4 KPI gate hero (3/4 未達 chip) + 9 KRI grid (R9 critical 即見える) + 業務別 trend ✓
- A2: KRI label 1 行に圧縮 ✓
- A3 Tier 2: 4 KPI + 9 KRI + 2 trend + filters = 20 ✓
- A4 Layer-cake (KPI hero → KRI grid → trend) ✓
- A5: ok ✓
- A6: ✓
- A7: KRI detail は別画面 link ✓
- A8: KPI 未達 chip が visual alert、specific CTA 不在 (operational dashboard 想定) ✓
- A9: page head に「全数値 [仮説 / 要検証] · Phase 1 で測定 · 本番 gate ではない」hedge 残置 ✓
- Result: **9/9 pass**

## R9A Knowledge Editorial Library — iter 1 (PASS)

- A1: cover「218 件 / 94 件」 + 3 hero compiled article + 4 staging card (tinted) ✓
- A2: meta 圧縮 ✓
- A3 Tier 3: 3 feat + 4 staging + cover + filters = 13 ✓
- A4 Spotted ✓
- A5: ok ✓
- A6: ✓
- A7: full body は drawer (cover に hint chip) ✓
- A8: card hover 想定、page-level CTA 不在 ✓
- A9: 「compiled = AI 引用対象」「staging = citation 対象外」 governance label 強調 ✓
- Result: **9/9 pass**

## R9B Knowledge Density Bento — iter 1 (PASS)

- A1: dark 218 hero + 3 lane (promote/revoked/期限切れ) + donut + matrix + trigger list ✓
- A2: cell label 圧縮 ✓
- A3 Tier 3: 218 KPI + velocity + 3 lane × 4 + donut + matrix 25 + trigger 5 = ~50 ✓
- A4 Spotted (Bento cell 独立) ✓
- A5: ok ✓
- A6: ✓
- A7: lane hover で詳細想定 ✓
- A8: lane に primary CTA、page-level CTA 不在 (operational pipeline 監視想定) ✓
- A9: weight 分布 + citation 対象外 banner 残置 ✓
- Result: **9/9 pass**

---

## Cross-screen consistency check (P4)

- Header: 14 frame 全て brand mark + breadcrumb + プロトタイプ pill + ⌘K + avatar 統一 ✓
- Token: Operational Premium Light を 100% 再利用、新 token 0 ✓
- Typography: 大型 numeral = font-display (Inter)、case ID / 数値 = font-mono (JetBrains Mono)、JP = font-jp (Noto Sans JP) ✓
- Status colors: indigo = action / accent、emerald = success / compiled、amber = warning / staging、red = critical ✓
- Lifecycle stepper: R3A / R3B / R4 で「受付 → AI 処理 → 入力者確認 → 承認者承認 → 反映」exactly ✓
- 承認者承認 chip 表記: R3A / R3B で「承認者承認: 承認待ち」exactly ✓
- プロトタイプ pill: 全 14 frame に persistent placement ✓
- 14 frame で visual identity 一致 ✓
