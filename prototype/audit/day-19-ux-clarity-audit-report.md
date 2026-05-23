| 項目 | 値 |
| --- | --- |
| 文書 ID | DOC-AUDIT-D19-UXC-REPORT |
| 文書名 | Day 19+ UX Density / First-Glance Comprehension / Progressive Disclosure Audit Report |
| 版数 | v0.1 |
| ステータス | Draft (Day 19 SSOT refresh + Day 18.5 P0/P1 patch と co-exist 想定、本 audit 受け取り後 user / maintainer 判断で patch 適用) |
| オーナー | backoffice-ai-v2 maintainer |
| 承認者 | self — 設定承認 (audit 結果 + Day 19+ patch plan の確定) |
| 閲覧対象 | Internal / Project team / Day 19+ patch 適用 session |
| 機密区分 | Internal |
| 関連文書 | DOC-AUDIT-D19-UXC-PROMPT (v0.2、本 audit の input) / DOC-PROTO-CLAUDE / DOC-ROOT-CLAUDE / DOC-OV-00 / DOC-APP-02 / DOC-KNW-04 / DOC-MON-05 / DOC-S4-06 / DOC-ROOT-_SSOT / DOC-UI-D14-INV / DOC-UI-03 (current HEAD では UI 設計 SSOT として存在、CR-6 で prompt premise と repo state の差分確認) |
| SSOT 区分 | Day 19+ UX clarity audit 結果 + Top Findings + IA Layer Plan + Improvement Plan の SSOT (audit framework SSOT は DOC-AUDIT-D19-UXC-PROMPT v0.2) |
| Evidence Status | empirical (9 screenshot 1440×900 + 9 page source 3,374 LOC + 12 SSOT doc + Industry references 9 件 を直接 input、static frame review + source direct read、動的挙動は `inference:` 注記) |
| 改版履歴 | v0.1 (2026-05-23): 初版作成、Day 18 high-fi 完了直後 (hash `9b935ca`) audit。8 軸 (Axis 1 First-Glance / Axis 2 Necessary-Sufficient / Axis 3 Progressive Disclosure / Axis 4 IA / Axis 5 Microcopy / Axis 6 Mock data / Axis 7 Role Fit / Axis 8 Trust & Safety) × 9 page = 72 cell coverage、Top Findings 12 件 (P0 ×2 / P1 ×4 / P2 ×4 / Defer ×1 / Drop ×1)、IA Layer Plan L1-L4 9 page、CR-1〜CR-8 cross-cutting、Improvement Plan 6 commit (Day 18.5 P0/P1 patch co-exist 設計) |

---

# Day 19+ UX Density / First-Glance Comprehension / Progressive Disclosure Audit Report

**Project**: backoffice-ai-v2 / Phase: Day 18 high-fi 完了後、Day 19 SSOT refresh + Day 18.5 P0/P1 patch と並行
**Audit HEAD**: `9b935ca` / Screenshot 撮影日: 2026-05-23 / Viewport: 1440 × 900
**Audit scope**: 9 React route × 8 軸 (Axis 1-8) + Mock data + Microcopy
**Audit prompt SSOT**: `prototype/audit/day-19-ux-clarity-audit-prompt.md` (DOC-AUDIT-D19-UXC-PROMPT v0.2)
**Industry references**: 9 件 (§0 SSOT、NH1-10 / SM1-3 / NPD / K5S / NFC / TUF / STR / DAT / PDR)
**Reviewer constraint**: static frame review + source code direct read、動的挙動は `inference:` と明記
**Output 制約**: Markdown only、5 段階 (Keep / Tune / Add / Defer / Drop) 厳格分離、P0/P1/P2/Defer/Drop 混在禁止

**Evidence baseline note**: Prototype source line evidence is `@9b935ca` unless explicitly marked `current HEAD 34e3907`。Current HEAD already includes Day 18.5 patch commits; this audit uses the Day 18 high-fi baseline for screen evidence and only uses current HEAD to verify SSOT drift claims.

**Industry reference index**: NH1-10 = https://www.nngroup.com/articles/usability-heuristics-complex-applications/ / SM1-3 = https://www.cs.umd.edu/~ben/papers/Shneiderman1996eyes.pdf / NPD = https://www.nngroup.com/articles/progressive-disclosure/ / K5S = https://www.nngroup.com/videos/5-second-usability-test/ / NFC = https://www.nngroup.com/articles/testing-visual-design/ / STR = https://blog.logrocket.com/ux-design/great-examples-fintech-ux/ / TUF = https://mapuipatterns.com/data-ink-ratio/ / DAT = https://docs.datadoghq.com/account_management/audit_trail/ / PDR = https://www.pencilandpaper.io/articles/ux-pattern-analysis-data-dashboards

---

## 0. TL;DR

- **Verdict**: **Conditional Go** (Day 19 SSOT refresh + Day 18.5 P0/P1 patch 前に **P0 2 件 + P1 4 件** の patch を入れる条件で Go、Day 18.5 patch と co-exist 可能)
- **最大の問題** (1 sentence): 9 page 共通で「画面が自分を説明する meta 文 (SSOT framing 注 / `[仮説 / 要検証]` 反復 / `次の実装段階で対応` 反復 / internal schema ID / DOC-* / `source:` prefix)」が L1-L2 表面に常時露出しており、規制 / 監査 UI として必要な証跡性 (Tier 1 vocabulary + citation/staging governance) と無関係な L4 dev metadata が**初見ユーザの primary action 識別を阻害**している (NH8 + TUF + NH6 violation、特に Metrics / AuditTrail / KnowledgeBrowser 3 page で顕著)
- **推奨方針** (1 sentence): 「文字を減らす」ではなく **「同じ情報を L2 section-level hedge / L3 disclosure / L4 tooltip・footer・PrototypeModeLabel に再配置」** することで、L1-L2 を primary task (案件処理 / 提案承認 / 設定確認 / 監査閲覧) に絞り、規制 / 監査 / Demo narrative 必須情報 (Tier 1 + citation governance + Demo Chapter 1/2 narrative) は L1-L3 に完全保全する。

---

## 1. Judgement Criteria (5-7 個、CR-8 verbatim、§3 Top Findings の前)

本 audit の改善提案を勧告する判断基準は以下 7 個に絞る。これら criteria に該当しない improvement candidate は本 audit 出力に含めない。

1. **C1 (NH1 + K5S + NH7)** — 初見ユーザが 5 秒で **what / why I'm here / where** + **primary action 1 つ** を識別できる
2. **C2 (規制 / 監査必須情報の保全)** — L1 必須情報 (Tier 1 vocabulary + citation/staging governance + workflow ID / 案件 ID / 状態 / Lifecycle step) が UI 上で defer / 削除されていない
3. **C3 (NPD + PDR + SM1-3)** — L3 disclosure pattern が 1 click + non-destructive (right-side drawer / expand row / tooltip) で実現、新 route 追加なし
4. **C4 (NH5 + Day 18.5 SSOT)** — enabled no-op を増やさない、既存 disabled CTA pattern (DisabledAction wrapper / caption / inline) と co-exist
5. **C5 (NH4 — Tier 1 一貫性)** — `案件承認 / 手順承認 / 設定承認 / 入力者 / 承認者 / Flywheel` の 6 語 + workflow 状態 (`入力者確認待ち / 承認者承認待ち / 反映済 / 再処理中 / AI 処理中`) が user-facing で 1 表記に統一されている
6. **C6 (Demo narrative integrity)** — mock data trim が Demo Chapter 1 (CASE-2026-0142 法人住所変更) / Demo Chapter 2 (PROP-2026-031 OCR 信頼度調整) を破壊しない
7. **C7 (8 verification gate retain)** — 改善 plan が §3.6 8 gate (build / 8 grep / 9 route DOM smoke / sticky top=56px / chip taxonomy / Lighthouse a11y / keyboard focus / Day 18.5 P0+P1 patch) を破壊しない

---

## 2. Coverage Matrix — 8 軸 × 9 page = 72 cell

| Page | Axis 1 (NH1+K5S+NH7) | Axis 2 (NH8+TUF) | Axis 3 (SM+NPD+PDR) | Axis 4 (SM1+NH2+STR) | Axis 5 (NH2+NH4+NH10) | Axis 6 (TUF+NH8) | Axis 7 (NH2) | Axis 8 (NH1+NH5+NH9+DAT) |
| ---- | -------------------- | ----------------- | -------------------- | --------------------- | ---------------------- | ----------------- | ------------- | --------------------------- |
| Dashboard | partial (Hero card は強い、業務オペレーション動線 5-button が Sidebar duplicate で primary action 識別を弱化) | partial (`次の実装段階で対応` caption + `[仮説 / 要検証]` ×4 + `表示対象: 登録済み 2 業務` meta が L1 noise) | partial (各 業務 card の status breakdown 5 dt/dd が常時 inline、SM3 details on demand 化候補) | partial (注意 strip → Hero 業務 card → 動線 strip の 3 anchor で scan 良好だが 動線 strip が L2 と Sidebar 重複) | partial (`承認待ち` chip = `承認者承認待ち` Status と表記揺れ NH4 violation) | pass (mockCases 13 件、Demo narrative 保全 OK) | partial (入力者 + Manual 管理者 + Auditor 混在、role 別の primary action 不明示) | pass (Day 18.5 patch 後の enabled no-op risk なし) |
| Inbox | partial (13 row queue は task identification 強、ただし 4 disabled filter chip が「UI 半壊」trust feeling) | partial (filter 4 disabled + sort read-only span + footer caption の 3 重 L4 表示) | partial (row click → CaseReview 1-step OK、column sort 不在で zoom/filter step 欠落 = SM2 violation) | pass (sticky header + table + footer の 3 anchor 順 OK) | partial (`業務: すべて` / `状態: すべて` の `:` 区切り label pattern が他 page filter と不整合) | pass (13 行 / 5 status / SLA 経過 spread OK) | pass (入力者 primary 明確) | partial (Day 18.5 patch 適用後 filter chip disabled は OK、ただし `(一括操作は次の実装段階で対応)` caption と filter caption が同 footer に重複) |
| CaseReview | pass (Hero 3-column = AI 入力 / 証跡 / 引用根拠 + LifecycleStepper で Where 明示、primary action = 承認 / 差戻し 2 択 明示) | partial (alert strip `source: OCR 抽出` prefix が L1 leak、footer `入力者確認: 内容を確認し、承認または差戻しを選択してください` が CTA 重複) | pass (右 panel 3-card 引用根拠 + 未承認ヒント citation 対象外 + 証跡 timeline で SM3 details on demand 実装済) | pass (左 form → 中 evidence → 右 citation の 3-col scan order が primary task と整合) | partial (`citation 対象外` raw 英語 leak、引用根拠 card 内 `corporate-address-change/ocr-confidence` 内部 path leak) | pass (CASE-2026-0142 Demo narrative 核、保全必須) | pass (入力者 primary、承認者 secondary 明確) | pass (citation/staging boundary UI 上 明示分離、Day 18.5 後の trust gap なし) |
| SendBackComment | pass (h1 `CASE-2026-0142 差戻しコメント` + 5-radio + textarea で task 明確) | partial (radio description 5 行 × 5 + 案件概要 4-field grid 重複 = density 上限近接) | partial (案件概要 expand で L3 化候補、関連根拠 checklist は任意で L1 visible 妥当) | pass (form 縦 1-col scan path 自然) | partial (`5 分類` mono chip + `(入力誤りは AI 責ではないため別経路)` 説明文 + radio description 各 50 字超 で microcopy 過剰) | pass (radio + textarea で trim 余地少) | pass (入力者 primary、SoD 明確) | partial (`差戻しを記録` disabled CTA + caption pattern OK、ただし `送信動作は次の実装段階で対応` caption が footer + DisabledAction caption mode で 2 重) |
| ProposalReview | partial (4-column が scan 重、Demo Chapter 2 主画面の Wow が 判定基準 + 元案件 + 未承認ヒント の左 3 panel stacking で薄れる) | partial (左 3 panel stack + 右 RACI 5-row + 提案メタ 4-row + 「判断根拠は左の判定基準 + 元案件 を参照」meta-explanation の合計 density) | partial (RACI 5-row + 提案メタ → 右 drawer 化候補、SoD note は L4 footer に逃がせる) | partial (4-col 中 中央 6/12 が hero だが、判定基準 3 件 + 元案件 3 件 + 未承認ヒント 2 件 を左 3/12 に詰めると scan 効率低下) | partial (file path mono `workflows/corporate-address-change/agent-instructions.md` が L1 leak、`citation 対象外` 再出) | partial (PROP-2026-031 Demo narrative 核、`(...は次の実装段階で対応)` 重複 trim 余地) | partial (Manual 管理者 primary + 業務責任者 approval point だが、UI 上 RACI 表示で 5 role 並列に見える) | partial (Day 18.5 後 disabled action 2 件 + footer caption 2 重で trust noise) |
| AgentSettings | partial (Hero = Trust Level Progression が強い anchor だが、Agent 構成 5 領域 + 変更 simulation + 履歴 の 4 section 縦並びで Hero が viewport 端で見切れ) | fail (Hero 内: title + body + caption + 3-stage stepper + 4 KPI grid + 引き上げ申請 disabled + 統制原則 mono caption = **6 layer 同時表示**、NH8 + TUF 違反顕著) | partial (Agent 構成 5 領域 (Model / Prompt / Tool / 権限 / Trust Level) を L3 expand 化候補、変更 simulation panel は L3 妥当) | partial (Hero → 5 領域 → simulation → 履歴 の 4 section だが Hero 内 6 layer で視線 anchor 過剰) | partial (`Agent ベース モデル A (検証用)` の `検証用` 内部 dev label + `(検証用)` mono chip 多用) | pass (Agent 1 個 mock、5 領域 trim 余地少) | pass (AI 管理者 primary 明確) | pass (Day 18.5 後 disabled CTA pattern 整合) |
| AuditTrail | partial (h1 `監査証跡` + 業務 filter + 件数 chip + `15 項目構造 · 関連項目 含む実 18` の 4 meta が PageHeader 詰め込み、primary task = 「過去の AI 入力 / 承認 履歴を確認」が一目で識別困難) | fail (PageHeader meta + slate-50 framing box `監査イベントは 15 項目構造... で記録されます` + 行 click hint paragraph + 件数 chip = **page 自分を説明する meta** が L1 で 4 場所に分散、NH8 顕著) | pass (expand row で 15 row schema detail に SM3 details on demand 実装、PDR right-side drawer 化候補だが既存 expand pattern も妥当) | partial (timeline 行で event type icon が全て slate-600 mono なので type 区別 anchor 弱、行 anchor 過多で scan slow) | fail (`15 項目構造 · 関連項目 含む実 18` schema metadata leak、`DOC-KNW-04 §8.1` SSOT pointer L1 leak、行 `UC-BO-01 v0.1` agent version L1 leak、行 expand 内 `case_id` / `workflow_id + workflow_version` 等 snake_case schemaKey は spec 通り L3 OK だが L1 PageHeader meta leak は不適切) | pass (mock 11 件 timeline Demo 整合) | partial (Auditor primary、ただし全 role read 想定なので role 不明示が許容範囲) | partial (event type icon 全 mono = `関連ルール更新` (`rule_update_alert`) は amber bg なのに icon 同 slate-600、type 強度不一致) |
| Metrics | partial (Hero 4 KPI gate が強い、ただし PageHeader subtitle + framing 注 paragraph + Hero subtitle + legend + 仮判定 chip の 5 重 hedge で primary action `各 KPI 進化判定の現状確認` が薄まる) | fail (`[仮説 / 要検証]` ラベル ×12 (Hero 4 + 補助 KPI 3 + KRI 9) + `本画面の閾値・現在値・推移はすべて [仮説 / 要検証] です` framing 注 + PageHeader `4 KPI 進化判断 目安 + 補助 3 KPI + 9 KRI` の **同 page で hedge 過剰**、NH8 + TUF + 「Hedge over-display」anti-pattern 明示違反) | partial (KPI card 単位の 詳細 (分母 / 対象業務 / 除外条件 / sample size) を L3 expand 化候補、現状 inline 不在) | partial (Hero → 補助 KPI → KRI → 推移 の 4 anchor 順 OK だが、Hero 内 4 KPI card 並列 + legend explain = 視覚 anchor weight 配分が hero 過剰) | partial (`本番導入可否を判定する基準ではなく、Phase 1 で測定・再設定する検証仮説` 全文 framing + `[仮説 / 要検証]` 各 KPI 反復 = same hedge を 2 surface で表現) | pass (mock-metrics 4 KPI + 3 補助 + 9 KRI、Slide 8 narrative 核 保全必須) | partial (AI 管理者 + 業務責任者 primary、Auditor secondary 並列で role 不明示) | partial (Filter chip 業務別 2 row 重複 (PageHeader 内 + 業務別推移 section 内)、ただし enabled no-op risk なし) |
| KnowledgeBrowser | partial (h1 `ナレッジ` + 全期間 chip + `8 件 (承認済 5 · 確認済 2 · 未承認 1)` count meta + 業務 filter で task 識別 OK、ただし `(検証用)` 内部 label noise) | partial (slate-50 framing box `ナレッジは 承認済 / 確認済 / 未承認 の 3 段階で管理されます ... AI が 引用根拠 として使えるのは 承認済 ナレッジのみです` 2 段落 + 分類 + 重要度 2 軸 filter chip = L1 dense) | pass (expand row で 8 項目 frontmatter detail に SM3 details on demand 実装、PDR drawer 化候補) | partial (framing → filter → list の 3 anchor OK、ただし重要度 filter `全段階 / 承認済 / 確認済 / 未承認` が PageHeader count meta と重複 visual) | partial (`(検証用)` label + 行 expand 内 `id` / `date` / `workflow_id + workflow_slug` snake_case schemaKey は L3 OK だが PageHeader `8 件 (承認済 5 · 確認済 2 · 未承認 1)` の `· ` 区切りが他 page と表記揺れ) | pass (mockKnowledge 8 件、staging/compiled 整合、`data_error` 例外表示 OK) | pass (Manual 管理者 + 業務責任者 primary 明確) | pass (`citation 対象外` raw 英語 leak (CR-5 抽出)、ただし governance core boundary 表示は適切) |

**Verdict 統計**:
- Axis 1: 1 pass / 7 partial / 1 fail (AgentSettings Hero)
- Axis 2: 1 pass / 6 partial / **3 fail (AgentSettings Hero / AuditTrail / Metrics)** — 本 audit の最大 fail 軸
- Axis 3: 2 pass / 7 partial / 0 fail
- Axis 4: 1 pass / 8 partial / 0 fail
- Axis 5: 1 pass / 7 partial / 1 fail (AuditTrail schema leak)
- Axis 6: 9 pass / 0 partial / 0 fail (mock data は trim 余地少、保全必須が主)
- Axis 7: 5 pass / 4 partial / 0 fail
- Axis 8: 3 pass / 6 partial / 0 fail (Day 18.5 patch 適用前提)

---

## 3. Top Findings (Ranked, 12 件)

| ID | Severity | 論点名 | Heuristic ID | Evidence | Why it matters | Recommended fix (L?→L?) | Touch files | Scope |
| --- | -------- | ------- | ------------- | -------- | -------------- | ----------------------- | ----------- | ----- |
| **F-1** | **P0** | Metrics + AuditTrail + KnowledgeBrowser の slate-50 framing 注 paragraph 3 page で L1 常時表示 (= 「画面が自分を説明する meta」が primary task を阻害) | NH8 + TUF + NPD | Metrics.tsx@9b935ca:139-155 (`本画面の閾値・現在値・推移はすべて [仮説 / 要検証] です ... 本番導入可否を判定する基準ではなく、Phase 1 で測定・再設定する検証仮説`)、AuditTrail.tsx@9b935ca:147-160 (`監査イベントは 15 項目構造 (関連項目 含む実 18) で記録されます ...`)、KnowledgeBrowser.tsx@9b935ca:137-149 (`ナレッジは 承認済 / 確認済 / 未承認 の 3 段階で管理されます ...`) + screenshot 07/08/09 で各 slate-50 box visible | 初見ユーザは 1 回読めば内容が分かる L4 explanation。**毎回見せる必要なし**。3 page で同 pattern = 9 page 中 1/3 が「自分を説明する」meta で L1 を消費。規制 / 監査 UI として必要な L1 情報 (Tier 1 + citation governance) を阻害 | **L1 → L4 expand**: 各 page header 右に小さな `i` icon button (`本画面の説明`) を置き、default closed / no persistence で展開。Hero は KPI card / event timeline / snippet list を L1 のまま保持 | `prototype/src/pages/Metrics.tsx` (削除 framing 注 → `<PageHelpDisclosure>` (新規 shared primitive)) / `prototype/src/pages/AuditTrail.tsx` (同上) / `prototype/src/pages/KnowledgeBrowser.tsx` (同上) / `prototype/src/components/shared/PageHelpDisclosure.tsx` (新規) | **P0** |
| **F-2** | **P0** | `[仮説 / 要検証]` hedge over-display: Metrics で 12+ 回、Dashboard で 4 回、AgentSettings で 4 回、CaseReview/SendBackComment/AuditTrail/KnowledgeBrowser で各 1+ 回 = 9 page 横断で 25+ surface に常時表示 | NH8 + TUF + NH10 | Metrics.tsx@9b935ca:148-149 (framing 注内 hedge) + Metrics.tsx@9b935ca:230-233 (Hero 4 KPI card 各) + Metrics.tsx@9b935ca:309-311 (補助 KPI 3 card 各) + Metrics.tsx@9b935ca:382-386 (KRI 9 card 各 trigger 条件) + AgentSettings.tsx@9b935ca:192-196 (4 KPI 進化要件 各)、Dashboard.tsx@9b935ca:206-207 (注意 strip メッセージ内) + Dashboard.tsx@9b935ca:341-342 (Sparkline label) + screenshot で目視確認 | informational hedge の真の意味 (= **本番 gate ではなく Phase 1 検証仮説**) が noise に埋没。重要 hedge が 25+ 反復で muted、TUF data-ink ratio 低下、Operational Premium Light の restraint 違反。完全削除ではなく、数値との対応が切れない section-level hedge に圧縮する必要がある | **L2 inline repetition → L2 section-level hedge surface + L4 detail**: KPI/SLO 数値に隣接する section-level `<HedgeBanner>` で `[仮説 / 要検証]` を保持し、個別 card の反復 caption は削除。Metrics は Hero KPI / 補助 KPI / KRI の 3 section 単位、AgentSettings は KPI 進化要件 section 単位、Dashboard は trend/threshold section 単位で保持 | `prototype/src/components/shared/HedgeBanner.tsx` (新規) / `prototype/src/pages/Metrics.tsx` (16 個別 caption → 3 section-level hedge) / `prototype/src/pages/AgentSettings.tsx` (4 個別 caption → 1 section-level hedge) / `prototype/src/pages/Dashboard.tsx` (4 個別 caption → 1 section-level hedge) | **P0** |
| **F-3** | **P1** | AuditTrail + KnowledgeBrowser で **internal SSOT schema metadata** (`15 項目構造 · 関連項目 含む実 18` / `DOC-KNW-04 §8.1` / `DOC-ROOT-_SSOT §1.4` / agent version `v0.1` / file path `workflows/corporate-address-change/...`) が L1 (PageHeader) と L3 (expand panel header) で leak | NH2 + NH6 + 「Tooltip dependency for primary info」 risk + CR-5 internal vocabulary leakage | AuditTrail.tsx:119-121 (PageHeader `15 項目構造 · 関連項目 含む実 18`) + AuditTrail.tsx:280-282 (expand `DOC-KNW-04 §8.1` ref)、KnowledgeBrowser.tsx:341-344 (expand `DOC-ROOT-_SSOT §1.4`)、ProposalReview.tsx:210 (proposed diff `targetFile` mono path `workflows/corporate-address-change/agent-instructions.md`) | regulated UI で user 向けに `DOC-` ID / `§8.1` reference / snake_case version は **dev metadata leak**。NH2 (user の言葉) 違反、初見 user が「何の規格?」になる。L3 expand 内 schemaKey `case_id` / `workflow_id + workflow_version` 等は audit doc spec で意図的露出 (SSOT integrity)、ただし `DOC-* §X.X` reference / `15 項目構造 · 関連項目 含む実 18` の PageHeader 露出 / `targetFile` raw path は L4 dev-only に逃がせる | **L1/L3 → L4 dev-only or remove**: (a) AuditTrail PageHeader `15 項目構造 · 関連項目 含む実 18` 削除、expand `DOC-KNW-04 §8.1` reference 削除 (schemaKey はそのまま、reference link は dev-only annotation 化)、(b) KnowledgeBrowser `DOC-ROOT-_SSOT §1.4` reference 削除、(c) ProposalReview `targetFile` mono path を JP-localized 「業務手順 (法人住所変更) / 5.2 AI 入力結果」等の sectionFriendly に paraphrase | `prototype/src/pages/AuditTrail.tsx` / `prototype/src/pages/KnowledgeBrowser.tsx` / `prototype/src/pages/ProposalReview.tsx` / `prototype/src/data/mock-proposals.ts` (targetFile JP-friendly に変換 or section property 追加) | **P1** |
| **F-4** | **P1** | 9 page footer 全てに `(...は次の実装段階で対応)` caption が固定表示、内容も page 毎にバラバラ (`フィルタ・並び順・一括操作は次の実装段階で対応` / `送信動作は次の実装段階で対応` / `(承認動作は次の実装段階で対応)` / `設定変更・申請は次の実装段階で対応` / `検証用 監査機能の拡張は次の実装段階で対応` / `検証用 KPI 表示の拡張は次の実装段階で対応` / `未承認 → 提案レビューへの送付は次の実装段階で対応`) | NH4 + NH8 + CR-4 Copy Reduction target 1 | Inbox.tsx:254 / SendBackComment.tsx:332 / ProposalReview.tsx:321 (inline ml-1) / AgentSettings.tsx:435 / AuditTrail.tsx:265 / Metrics.tsx:494 / KnowledgeBrowser.tsx:326 / Dashboard.tsx:407 / CaseReview footer は無し (Day 18.5 patch 後) + screenshot 01-04/06-09 で目視 confirm | 9 page で 7 種類異なる文言 = NH4 Consistency violation、TopBar PrototypeModeLabel `プロトタイプ表示 — 外部システム未接続 / 証跡はモック` 1 surface で同じ意図伝達可能だが、page 毎の disabled CTA の具体 reason は失われる。現状は specific だが反復で muted | **L4 footer caption → L4 unified PrototypeModeLabel tooltip 集約**: PrototypeModeLabel hover tooltip 末尾に「・検索 / 通知 / 一括操作 / フィルタ / 送信 / 承認 / 申請 / 監査拡張 / KPI 拡張 / ナレッジ送付 は次の実装段階で対応」を 1 文集約 (現状 PrototypeModeLabel.tsx:50 で `検索 / 通知 / 一括操作 / フィルタ` のみ既存)、各 page footer caption は **削除 or 1-2 語短縮** (`送信は実装段階` 等)。disabled CTA 個別の reason は DisabledAction `reason` prop で SR / hover に届ける | `prototype/src/components/shared/PrototypeModeLabel.tsx` (tooltip 末尾拡張) / 9 page footer caption 全削除 or 短縮 | **P1** |
| **F-5** | **P1** | Tier 1 vocabulary 表記揺れ: `承認待ち` (Dashboard chip Line 193) vs `承認者承認待ち` (CaseStatus StatusBadge `case-review.png` 右上 visible) vs `業務承認: 未提出` (BusinessApprovalChip CaseReview footer) | NH4 Consistency violation + CR-5 Tier 1 cross-page consistency | Dashboard.tsx:193 (`承認待ち` chip)、mock-cases.ts statusLabel `承認者承認待ち` (Inbox 行 + CaseReview Header)、components/shared/BusinessApprovalChip.tsx で `業務承認: ...` 表示 + screenshot 01 Dashboard 右上 `承認待ち 1` chip vs screenshot 02 Inbox CASE-2026-0147 行 `承認者承認待ち` StatusBadge vs screenshot 03 CaseReview footer `業務承認: 未提出` chip 各 visible | Tier 1 語彙 `承認者承認` を Dashboard では `承認待ち` に省略している (CaseStatus `business-approval-waiting` を「承認者承認待ち」と表示する Inbox と整合しない)、`業務承認` (BusinessApprovalChip) も同 concept で `承認` 種別 fragmentation。初見 user は「承認は 1 種類か 3 種類か」が分からない | **L1 統一**: Dashboard chip を `承認待ち` → `承認者承認待ち` に paraphrase、BusinessApprovalChip 文言を `業務承認: 未提出` → `承認者承認: 未提出` に統一 (`業務承認` = 旧表現を `承認者承認` SSOT に揃える、`docs/02-approval-model.md` §2.2 SSOT) | `prototype/src/pages/Dashboard.tsx:193` (`承認待ち` → `承認者承認待ち`) / `prototype/src/components/shared/BusinessApprovalChip.tsx` (`業務承認` → `承認者承認` 統一) | **P1** |
| **F-6** | **P1** | ProposalReview 4-column layout で 左 3/12 column に **判定基準 + 元案件 + 未承認ヒント** の 3 sub-panel stack、右 3/12 column に **RACI 5-row + 提案メタ 4-row** stack = scan 効率低下 + Demo Chapter 2 主画面の Hero (中央 提案差分) が薄まる | SM1 Overview first violation + STR Stripe restraint (5-9 core elements) violation + IA Layer L2/L3 mis-routing | ProposalReview.tsx:107-194 (left 3-panel) + ProposalReview.tsx:233-290 (right 2-panel) + screenshot 05 で目視: 中央 6/12 提案差分は visible だが、左右両 column の dense panel stack で視線分散 | Demo Chapter 2 中核 = 「AI が Procedure Update Proposal を自動生成 → 中央の提案差分 を audience に見せる」(`docs/06-session4-narrative.md` §3.2)。現状 4-col で 中央 6/12 hero と左右 panel が **同等 weight** に見え、Hero の signal 強度が弱い。RACI / 提案メタ は L3 detail (右 drawer 化候補)、未承認ヒント は L2 reference (中央下 inline 化候補) | **L1/L2/L3 再配置**: (a) 中央 提案差分 を **8/12 width** に拡大、(b) 左 3/12 = 判定基準 + 元案件 (Demo narrative 必須、L1 keep)、(c) 右 1/12 → **削除して 右 drawer 化**: RACI 5-row + 提案メタ 4-row を `<DetailDrawer trigger="提案詳細を見る">` (PDR right-side drawer) に L3 化、(d) 未承認ヒント を中央 提案差分 直下に inline summary 化 (L2)、(e) SoD note を L4 footer caption 化 | `prototype/src/pages/ProposalReview.tsx` (4-col → 2-col + drawer) / `prototype/src/components/shared/DetailDrawer.tsx` (新規、PDR 1st-class disclosure pattern) | **P1** |
| **F-7** | **P2** | Dashboard `業務オペレーション動線` 5-button strip が Sidebar nav と機能重複 (受信トレイ / 案件レビュー / コメント付き差戻し / AI 提案レビュー / メトリクス確認 = Sidebar 8 nav の 5 つと同 destination) | NH4 Consistency violation + STR restraint violation (5-9 core elements の上限近接) | Dashboard.tsx:144-153 (workflowLaneSteps 5 nav)、Sidebar.tsx:38-47 (navItems 8 件で受信トレイ + 案件処理 + AI 提案レビュー + メトリクス + 監査証跡 等が hit) + screenshot 01 Dashboard 下部に visible | Dashboard の primary task は「業務状況確認 + 注意 事項 trigger 行動」、navigation 二重化は STR Stripe restraint の「5-9 core elements」上限を破壊。初見 user は 「Sidebar と Dashboard 内動線、どちらを click すべきか」迷う | **L1 → L4 削除**: 業務オペレーション動線 5-button section 削除、または **「業務 card click → /inbox?workflow=...」既存動線 1 つだけ keep** で簡素化。Sidebar 経由 navigation を default に | `prototype/src/pages/Dashboard.tsx:375-401` (workflow lane section 削除) | **P2** |
| **F-8** | **P2** | CaseReview footer left `<span className="text-xs text-slate-500"><span className="font-medium text-slate-700">入力者確認:</span> 内容を確認し、承認または差戻しを選択してください</span>` が footer 右の `差戻し / 承認` 2 button と意味重複 | NH8 + NH6 Recognition rather than recall violation | CaseReview.tsx:196-198 + screenshot 03 footer visible | footer 右の primary CTA 2 つ (`差戻し / 承認`) が visible なら左 explainer は不要 (user は「承認 or 差戻し どちらかを click する」と直感推察可能)。CTA を見て recall できる前に「読まされる」instruction text は recognition over recall 違反 | **L2 → L4 削除 or 1 文短縮**: footer left explainer 削除、または **`入力者確認` 1 chip だけ残す** (StatusBadge `入力者確認待ち` と redundant なら削除も可) | `prototype/src/pages/CaseReview.tsx:195-199` (PageFooter left prop 削除) | **P2** |
| **F-9** | **P2** | AgentSettings Hero 内 **6 layer 同時表示** (title + body + caption + 3-stage stepper + 4 KPI grid + 引き上げ申請 disabled + 統制原則 mono caption) で Hero が cluttered、Demo Chapter `Slide 7 Matrix B 視覚化` の Wow 中核を薄める | NH8 + TUF + 「Decorative motion / illustration / icon proliferation」anti-pattern 系 | AgentSettings.tsx:149-217 + screenshot 06 Hero card visible | Hero (Trust Level Progression) は本 page の **Wow 中核** (Plan B-lite v1.3 hero 指定)、6 layer 同時で visual weight 分散 = Wow signal 低下。4 KPI 進化要件 grid は Metrics page と重複 (current value も Metrics に既出)、 引き上げ申請 disabled CTA は footer に既存 = duplicate | **L1 → L2/L3 demote**: (a) 4 KPI 進化要件 grid を `<DetailDisclosure title="4 KPI 進化要件">` (expand) に L3 化、Metrics page link で詳細誘導、(b) `統制原則` mono caption を Hero 右端 → 削除 (body 文中で十分)、(c) `Trust Level 引き上げは Type C 設定承認 ... で判定されます` body 文 を 1 sentence に短縮、(d) Hero 内 引き上げ申請 disabled CTA を削除 (footer 既存 `変更を申請` と機能重複) | `prototype/src/pages/AgentSettings.tsx:149-217` | **P2** |
| **F-10** | **P2** | Inbox filter row 4 chip (業務 / 状態 / 担当者 / 経過時間) 全 disabled (active workflow filter のみ enabled)、PageHeader 上「並び順: 受付順」span (read-only)、footer `フィルタ・並び順・一括操作は次の実装段階で対応` caption、bulk action 2 disabled = **L4 dev metadata の L1 surface 過多** | NH5 Error prevention + 「UI 半壊 trust feeling」 + CR-4 Copy Reduction target | Inbox.tsx:117-148 (filter row) + Inbox.tsx:108-114 (並び順 span) + Inbox.tsx:230-256 (footer) + screenshot 02 で目視 | Day 18.5 patch で `<span>` → `<button disabled>` 化済 (`feedback_diagnosis_execution_gap` 適用)、enabled no-op は解消されたが、4 disabled filter + 1 read-only sort span + 2 disabled bulk = **6 disabled surface** が L1 で「この UI は半分壊れている」trust feeling を残す | **L1 → L2 統合**: filter 4 chip + sort span + bulk action 2 button を **1 つの `<FilterToolbar mode="locked-mvp">`** にまとめ、explicit `MVP 範囲 — フィルタ拡張は実装段階で` の 1 sentence subtitle、disabled state は keep だが visual 統合で「壊れた」感を「明示的 MVP scope-out」に変換 | `prototype/src/components/shared/FilterToolbar.tsx` (新規) / `prototype/src/pages/Inbox.tsx` (filter + sort + bulk 統合) | **P2** |
| **F-11** | **Defer** | Metrics `業務別 推移` section に独自 FilterChip row (`全業務 / UC-BO-01 / UC-BO-02`) が PageHeader (本 page 全体 filter なし) と別系統で配置 — Metrics 内 section-local filter | NH4 + Phase 1 design 待ち | Metrics.tsx:418-435 (業務別 推移 section 内 FilterChip) + screenshot 08 で目視 | section-local filter は page-global filter と異なる UX、初見 user は「ここだけ filter が効く」誤解 risk。ただし現状 page-global filter は AuditTrail / KnowledgeBrowser でも存在し、Metrics だけ section-local の合理性 (Hero KPI gate は workflow 横断 evaluation 想定) は妥当。**Phase 1 で page-global vs section-local 統一基準を governance review** の方が ROI 高 | **Defer (Phase 1)**: 本 audit では keep、Phase 1 で governance review 後に統一判断 | (`/metrics` 業務別 推移 section) | **Defer** |
| **F-12** | **Drop** | AgentSettings Hero `[仮説 / 要検証]` を `<sup>` notation 化して visual compact | TUF data-ink ratio improvement 候補 | (F-2 と同 axis) | F-2 で 1 page header banner に集約する方が compact + Heuristic 強度高、`<sup>` 個別注釈は表記揺れ risk | **Drop**: 本 audit / 将来 backlog に残さない明示却下 | — | **Drop** |

---

## 4. Per-Screen Output (9 page × §5 9-column table + 補助 structured field)

### 4.1 `/` Dashboard

**Screenshot reference**: `prototype/screenshots/day-15-medium-fi/01-dashboard.png`
**Source**: `prototype/src/pages/Dashboard.tsx` (LOC: 412) + 主要 component: `Sparkline`, `PageFooter`
**Mock dependency**: `prototype/src/data/mock-cases.ts` (13 case) + `mock-metrics.ts` (workflow trend)
**Primary task**: 業務状況を 5 秒で把握、注意 事項を 1 click で開く
**Primary user persona**: 入力者 (queue 状態確認) + Manual 管理者 (業務全体把握)

| Page section | User job | 5秒で分かるか (Persona × NH/K5S) | 主操作 | 残す情報 (N) | Demote する情報 (S/X) | Dig-into 導線 (SM/NPD/PDR) | 主な問題 | Priority |
| ------------ | -------- | -------------------------------- | ------ | ------------ | --------------------- | -------------------------- | -------- | -------- |
| PageHeader | 業務範囲確認 | partial (入力者: pass、Manual 管理者: pass、Auditor: partial — 注意 6 件 + 承認待ち 1 だが which workflow 不明示) | (なし) | h1 + 件数 chip 3 (案件 / 注意 / 承認者承認待ち) | `UC-BO-01 + UC-BO-02` mono は L2 footer 化 | (なし) | `承認待ち` 表記が `承認者承認待ち` (Inbox) と不整合 | **P1** (F-5) |
| 注意 strip | 注意 trigger 確認 | pass (`入力者確認待ちで 3 時間 [仮説 / 要検証] 以上経過した案件があります`) | `確認` link → /cases/CASE-2026-0148 | 注意 文言 + 案件 ID + 経過 | `[仮説 / 要検証]` inline は F-2 で削除 | (`確認` link が L3 navigation) | hedge inline (F-2) | **P0** (F-2) |
| 業務 card | 業務状況 把握 + 次 action | partial (Hero card 強い、ただし state chip `通常稼働` / `要注意` 2 段で重複 visual) | card link `法人住所変更 の案件を開く >` | UC-BO-* + 業務名 + 案件数 + 注意 + 承認待ち + 5 status breakdown + sparkline | 5 status breakdown (`AI 処理中 2 / 入力者確認待ち 3 / 再処理中 0 / 承認者承認待ち 1 / 反映済 2`) を L3 expand 化候補、`直近 7 日 注意発生率 [仮説 / 要検証]` の hedge は F-2 で削除 | (card click → /inbox?workflow=UC-BO-01) | 5 status breakdown が常時 L1 visible で密度高、F-2 hedge over-display | **P1** (F-2) / **P2** (status breakdown 候補) |
| 業務オペレーション動線 strip | navigation アクセラレータ | partial (5 button 並列で primary action 不明示、Sidebar nav と機能重複) | (なし、5 button 並列) | (なし) | section 全削除候補 (Sidebar と重複) | (sidebar nav に統合) | F-7 nav 二重化 | **P2** (F-7) |
| Footer | mock 状態説明 | partial | (なし) | (なし) | `業務カード・動線・注意行は画面内モック状態からの集計。検証用 KPI 表示の拡張を予定。` を PrototypeModeLabel に統合 | (なし) | F-4 footer caption 反復 | **P1** (F-4) |

**Persona simulation (Axis 1)**:
- **入力者 (queue 操作者)**: What pass (業務 card で 13 件分かる) / Why pass (`受信トレイ` link で次へ) / Where partial (current location 不明示、breadcrumb 1-level)。`注意 strip 確認` button が primary action として識別可能
- **Manual 管理者 (業務全体把握)**: What pass / Why partial (Dashboard で集計確認可だが「次に何 review」が不明示) / Where pass。primary action 不明示、Auditor secondary
- **Auditor (read-only)**: What pass / Why pass (read only) / Where pass

**Information bucket (Axis 2)**:
| Element | Bucket | Action |
|---------|--------|--------|
| h1 `ダッシュボード` + 案件数 chip | N | keep |
| 注意 + 承認待ち chip | N | keep |
| 注意 strip 1 件 | N | keep |
| 業務 card hero (workflow ID + 業務名 + 3 数値 + state chip + sparkline) | N | keep |
| 5 status breakdown (dl/dd 5 pair per card) | S | L3 expand 化 (`5 status の内訳を見る` toggle) |
| 業務オペレーション動線 5 button strip | X | Delete (Sidebar 機能重複) |
| `直近 7 日 注意発生率 [仮説 / 要検証]` label | X (hedge) | F-2 で削除 |
| `[仮説 / 要検証]` 注意 strip 内 | X (hedge) | F-2 で削除 |
| Footer `業務カード・動線・注意行は画面内モック状態からの集計。検証用 KPI 表示の拡張を予定。` | X (L4) | F-4 で PrototypeModeLabel 統合 |

**Disclosure mapping (Axis 3)**:
| Current element | Currently inline / buried | Disclosure pattern | A11y attribute | File touch |
| --------------- | ------------------------ | ------------------- | ---------------- | ---------- |
| 5 status breakdown | inline | expand (`aria-expanded`) | `aria-controls="status-breakdown"` | `Dashboard.tsx:313-337` |

**Scan path (Axis 4)**: 視線動線 = h1 → 注意 strip → 業務 card 2 並列 → 動線 strip → footer。primary task (業務状況 + 注意 trigger) との gap = 動線 strip が 4 目に来るが Sidebar と重複なので scan 効率低下。anchor count: 3 (h1 + 注意 strip + 業務 card) + 1 (動線 strip 重複) = anchor 過剰

**Microcopy issues (Axis 5)**:
| Location | Current wording | Issue | Proposed wording |
|---|---|---|---|
| `Dashboard.tsx:193` | `承認待ち` (chip 文言) | Tier 1 統一違反 (Inbox は `承認者承認待ち`) | `承認者承認待ち` |
| `Dashboard.tsx:407` | `業務カード・動線・注意行は画面内モック状態からの集計。検証用 KPI 表示の拡張を予定。` | 32 字 footer caption、L4 重複 | PrototypeModeLabel tooltip に統合、footer は **削除** |
| `Dashboard.tsx:127` | `入力者確認待ちで 3 時間 [仮説 / 要検証] 以上経過した案件があります` | hedge inline | `入力者確認待ちで 3 時間以上経過した案件があります` (hedge を page header banner に集約) |

**Mock data issues (Axis 6)**:
| Field | Current length | Issue | Proposed trim |
|---|---|---|---|
| mockCases assignee names | 10 distinct names for 13 rows | acceptable (variety 必要、Demo narrative 整合) | trim 不要 |

**Role fit (Axis 7)**: primary role = 入力者 + Manual 管理者 並列、secondary = Auditor。混在 risk: 3 role 並列だが「業務全体可視化」共通 task で許容、role 別 primary action 不明示は P2

**Trust issue (Axis 8)**: enabled no-op なし、Day 18.5 patch 後の trust gap なし

**Verdict (本 page 全 8 軸)**: Axis 1 partial / Axis 2 partial / Axis 3 partial / Axis 4 partial / Axis 5 partial / Axis 6 pass / Axis 7 partial / Axis 8 pass
**Page-level priority**: **P1** (F-2 hedge + F-5 vocab + F-4 footer の同時 fix で大幅改善)
**Touch files**: `Dashboard.tsx` (193, 127, 313-337, 375-401, 407) + `PrototypeModeLabel.tsx` (50 拡張) + `HedgeBanner.tsx` 新規 + `PageHelpDisclosure.tsx` 新規 (F-1 と共通)

### 4.2 `/inbox` Inbox

**Screenshot reference**: `02-inbox.png`
**Source**: `Inbox.tsx` (LOC: 255) + 主要 component: `StatusBadge`, `FilterChip`, `MetaChip`, `PageFooter`
**Mock dependency**: `mock-cases.ts` (13 case)
**Primary task**: 13 件 queue を見る → 1 件 click → CaseReview に移動
**Primary user persona**: 入力者 primary

| Page section | User job | 5秒で分かるか | 主操作 | 残す情報 (N) | Demote する情報 (S/X) | Dig-into 導線 | 主な問題 | Priority |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PageHeader | queue 範囲 + filter | partial (入力者: pass、Manual 管理者: pass、Auditor: partial — 13 件 だが workflow scope 不明示で「全業務?」) | (なし) | h1 + 件数 chip | `並び順: 受付順` read-only span は F-10 統合 | (なし) | 並び順 span が L4 dev surface | **P2** (F-10) |
| Filter chip row | 絞り込み | partial (`業務: すべて` active workflow chip 1 + 3 disabled) | (active workflow chip 解除) | active workflow chip | 3 disabled filter chip を F-10 統合 | (なし) | 4 disabled filter = UI 半壊 trust feeling | **P2** (F-10) |
| Queue table | case 1 件 select | pass (StatusBadge 4 tone + SLA 経過 tinted + 注意 chip で urgency 識別可) | row click → /cases/:id | 案件 ID / 業務 / 状態 / 経過 / 担当者 / 注意 | (`→` chevron 列は L3 navigation indicator OK) | row click → CaseReview (L3 page) | column sort 不在 (`docs/03 §4.1` で sort 動線記載なし)、SM2 zoom/filter step 欠落 | **P2** |
| Footer | bulk action + caption | partial | (2 disabled bulk button) | 件数 summary | `フィルタ・並び順・一括操作は次の実装段階で対応` caption は F-4 で PrototypeModeLabel 統合 | (なし) | F-4 footer caption 反復、bulk action は F-10 統合候補 | **P1** (F-4) / **P2** (F-10) |

**Persona simulation (Axis 1)**:
- **入力者**: What pass / Why pass (case select) / Where pass。primary action = row click 明示
- **Manual 管理者**: What pass / Why partial (bulk approve 不可で監督 task 半端) / Where pass
- **Auditor**: read scope だけ提供、primary action 不要

**Verdict**: Axis 1 partial / Axis 2 partial / Axis 3 partial / Axis 4 pass / Axis 5 partial / Axis 6 pass / Axis 7 pass / Axis 8 partial
**Page-level priority**: **P1** (F-4) と **P2** (F-10)
**Touch files**: `Inbox.tsx` (108-114, 117-148, 230-256) + `PrototypeModeLabel.tsx` + `FilterToolbar.tsx` 新規 (F-10)

### 4.3 `/cases/:id` CaseReview

**Screenshot reference**: `03-case-review.png`
**Source**: `CaseReview.tsx` (LOC: 222) + 主要 component: `ConfidenceBar`, `AddressDiffBlock`, `EvidenceTimeline`, `CitationPanel`, `StagingHintPanel`, `RelatedRuleAlert`, `LifecycleStepper`, `BusinessApprovalChip`, `PageFooter`
**Mock dependency**: `mock-cases.ts` (CASE-2026-0142 = Demo Chapter 1 起点)
**Primary task**: AI 入力結果 + 証跡 + 引用根拠 を確認、承認 or 差戻し 1 選択
**Primary user persona**: 入力者 primary、承認者 secondary read

| Page section | User job | 5秒で分かるか | 主操作 | 残す情報 (N) | Demote する情報 (S/X) | Dig-into 導線 | 主な問題 | Priority |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PageHeader | case orient + lifecycle | pass (breadcrumb 3-level + h1 case_id + 業務名 + StatusBadge + LifecycleStepper) | (なし) | breadcrumb + h1 + status + lifecycle | (なし) | (なし) | (なし) | — |
| 注意 strip | 注意 trigger 確認 | partial (`source: OCR 抽出` / `source: マスタ照合` raw `source:` prefix leak) | (なし) | 注意 文言 + 件数 | `source: ...` prefix は L4 dev、JP-localized に paraphrase or 削除 | (なし) | NH2 違反 + F-3 internal leak | **P1** (F-3) |
| AI 入力結果 (左 4/12) | 5 field 確認 + 信頼度 | pass (各 field + ConfidenceBar + 凡例) | (field 内 edit、現状 read-only) | 5 field + 信頼度 + 凡例 | (各 field 上の `tiny indigo dot` AI 提案 indicator は OK) | (なし) | (なし) | — |
| 証跡 timeline (中央 4/12) | PDF + 4 step 履歴確認 | pass (mono step + actor / source / conf 3 mono metadata で trust 高) | `プレビュー →` link → PDF view | PDF name + 4 step + actor + source + conf | (`actor: ...` / `source: ...` / `conf: ...` 3 mono metadata は L3 detail OK、ただし `source:` prefix は注意 strip leak と関連、L4 dev-only 候補) | (PDF preview L3 navigation) | F-3 注意 strip と同 `source:` prefix が timeline でも reused、判断は context (timeline は L3、注意 strip は L1) | — |
| 引用根拠 (右 4/12) | high citation 3 件確認 | pass (KB-CORP-001 + 名前 + 関連度) | (citation card click → KnowledgeBrowser detail、現状 inline) | 3 件 citation card | citation card 内の `corporate-address-change/ocr-confidence` 内部 path は F-3 で L4 化 | (citation card → KnowledgeBrowser detail で L3 navigation 候補) | F-3 internal path leak | **P1** (F-3) |
| 未承認ヒント (右下) | staging hint 確認 | partial (`citation 対象外` raw 英語 leak) | (なし、read-only) | 2 hint + `引用対象外` label | `citation 対象外` → `引用対象外` JP-localized | (なし) | NH2 + JP-only 違反 (F-3 と同種) | **P1** (F-3) |
| Footer | 承認 or 差戻し | pass (`差戻し` + `承認` 2 button + BusinessApprovalChip) | `承認` button (primary CTA) | 2 button | left explainer `入力者確認: 内容を確認し、承認または差戻しを選択してください` 削除 (F-8) | (BusinessApprovalChip → BusinessApprovalView mock、現状 disabled) | F-8 left explainer 重複 | **P2** (F-8) |

**Verdict**: Axis 1 pass / Axis 2 partial / Axis 3 pass / Axis 4 pass / Axis 5 partial / Axis 6 pass / Axis 7 pass / Axis 8 pass
**Page-level priority**: **P1** (F-3 + F-5 共通 fix) / **P2** (F-8)
**Touch files**: `CaseReview.tsx` (195-199 = F-8、注意 strip 100-115 = F-3 source: prefix paraphrase) + `CitationPanel.tsx` (F-3 internal path JP-localize) + `StagingHintPanel.tsx` (`citation 対象外` → `引用対象外`)

### 4.4 `/cases/:id/comment` SendBackComment

**Screenshot reference**: `04-sendback-comment.png`
**Source**: `SendBackComment.tsx` (LOC: 337) + 主要 component: `LifecycleStepper`, `StatusBadge`, `DisabledAction`, `PageFooter`
**Mock dependency**: `mock-cases.ts` (CASE-2026-0142) + `lib/sendback-categories.ts` (5 enum)
**Primary task**: 5 分類 select + textarea 入力 → 差戻しを記録 click
**Primary user persona**: 入力者

| Page section | User job | 5秒で分かるか | 主操作 | 残す情報 (N) | Demote する情報 (S/X) | Dig-into 導線 | 主な問題 | Priority |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PageHeader | case + lifecycle | pass | (なし) | breadcrumb 3-level + h1 + 業務 + status + lifecycle | (なし) | (なし) | (なし) | — |
| 案件概要 card | 差戻し対象の context 確認 | pass (4 field grid + 案件レビューに戻る link) | (なし) | 4 field | `AI 入力結果からの抜粋。差戻し対象の文脈を確認してください。` 説明は L2 keep | (`案件レビューに戻る` link) | (なし) | — |
| 差戻し分類 card | 5 radio select | pass (各 radio + description) | radio click | 5 radio + label | `5 分類` mono chip は L4 dev (radio count visible) → 削除、`5 分類から最も近いものを選択 (入力誤りは AI 責ではないため別経路)` 説明は L4 expand 化候補 | (radio click → data_error 選択時 warning banner = L3 inline) | description 5×3 行で density 高、L2 expand 化候補 | **P2** |
| data_error warning banner | 警告 | pass (conditional 表示) | (なし) | warning 2 sentence | (なし) | (なし) | (なし) | — |
| 差戻し理由 textarea | 理由入力 | pass (placeholder + 文字数 counter) | textarea 入力 | textarea + placeholder + counter | (なし) | (なし) | (なし) | — |
| 関連根拠 checklist (任意) | evidence link | pass (任意ラベル明示) | checkbox toggle | checklist + count | (なし) | (なし) | (なし) | — |
| Footer | 差戻し記録 | partial | `キャンセル` link + `差戻しを記録` disabled CTA | キャンセル + CTA | `送信動作は次の実装段階で対応` caption は F-4 で PrototypeModeLabel 統合 | (なし) | F-4 footer caption + DisabledAction caption mode で 2 重 | **P1** (F-4) |

**Verdict**: Axis 1 pass / Axis 2 partial / Axis 3 partial / Axis 4 pass / Axis 5 partial / Axis 6 pass / Axis 7 pass / Axis 8 partial
**Page-level priority**: **P1** (F-4) / **P2** (radio description trim)
**Touch files**: `SendBackComment.tsx` (157, 153-155, 332) + `PrototypeModeLabel.tsx`

### 4.5 `/proposals/:id` ProposalReview

**Screenshot reference**: `05-proposal-review.png`
**Source**: `ProposalReview.tsx` (LOC: 338) + 主要 component: `ProposalLifecycleStepper`, `StatusBadge`, `DisabledAction`, `PageFooter`
**Mock dependency**: `mock-proposals.ts` (PROP-2026-031 = Demo Chapter 2 主提案)
**Primary task**: AI 自動生成 Proposal を確認、業務責任者へ送付 or 差戻し
**Primary user persona**: Manual 管理者 primary、業務責任者 = 次 stage approval point

| Page section | User job | 5秒で分かるか | 主操作 | 残す情報 (N) | Demote する情報 (S/X) | Dig-into 導線 | 主な問題 | Priority |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PageHeader | 提案 orient + Proposal source + lifecycle | pass (3-level breadcrumb + h1 + status + Proposal source annotation + ProposalLifecycleStepper) | (なし) | breadcrumb + h1 + source + lifecycle | `判断根拠は左の判定基準 + 元案件 を参照` meta-explanation は L4 削除候補 | (なし) | meta-explanation L4 noise | **P2** (F-6 と統合) |
| 判定基準 (左 3/12 1st) | 3 criteria 確認 | pass (件数 / pattern一致度 / 矛盾なし) | (なし) | 3 criteria + 基準 | (なし) | (なし) | (なし) | — |
| 元案件 (左 3/12 2nd) | 3 source case 確認 | pass (case link + category chip + 1-line reason) | case ID click → CaseReview | 3 source case | (なし) | (case link L3 navigation) | (なし) | — |
| 未承認ヒント (左 3/12 3rd) | staging hint 確認 | partial (`citation 対象外` raw 英語 leak) | (なし) | 2 hint + `引用対象外` label | F-3 で JP-localize | (なし) | F-3 (CaseReview と同) | **P1** (F-3) |
| 提案差分 (中央 6/12) | diff 3 file 確認 | pass (target file + section + 変更前 / 変更後) | (なし、現状 read-only) | 3 file diff | `targetFile` raw path `workflows/corporate-address-change/agent-instructions.md` mono は F-3 で JP-friendly に paraphrase | (diff click → KnowledgeBrowser knowledge entry navigation 候補) | F-3 internal path leak、F-6 中央 hero width 6/12 → 8/12 推奨 | **P1** (F-3 + F-6) |
| RACI (右 3/12 1st) | 5-row + SoD note | partial (5-row label + 1 SoD note + 4 person value) | (なし) | RACI 5 row + SoD note | RACI 5-row は F-6 で右 drawer 化、SoD note は L4 footer caption 化 | (drawer 化、PDR pattern) | F-6 4-col scan 効率 | **P1** (F-6) |
| 提案メタ (右 3/12 2nd) | 提案 ID + 業務 + 生成日時 + 経過 | partial (4 row、Hero と重複情報多い) | (なし) | (なし、PageHeader と重複) | 4 row 全削除 (`提案 ID` は PageHeader breadcrumb 既出、`業務` は PageHeader chip 既出、`生成日時` + `経過` のみ keep) | (なし) | F-6 右 column 削除候補 | **P1** (F-6) |
| Footer | 差戻し + 業務責任者へ送付 | pass (2 button + explainer + caption) | `業務責任者へ送付` primary CTA | 2 button + left explainer | `(承認動作は次の実装段階で対応)` caption は F-4 で PrototypeModeLabel 統合 | (なし) | F-4 footer caption + DisabledAction wrapper の 2 重 | **P1** (F-4) |

**Verdict**: Axis 1 partial / Axis 2 partial / Axis 3 partial / Axis 4 partial / Axis 5 partial / Axis 6 partial / Axis 7 partial / Axis 8 partial
**Page-level priority**: **P1** (F-3 + F-4 + F-6 = Demo Chapter 2 hero 強化が 3 finding 共同)
**Touch files**: `ProposalReview.tsx` (107-194, 233-290, 195-231, 91-97, 321) + `DetailDrawer.tsx` 新規 + `mock-proposals.ts` (targetFile JP-friendly)

### 4.6 `/agents/:id` AgentSettings

**Screenshot reference**: `06-agent-settings.png`
**Source**: `AgentSettings.tsx` (LOC: 446) + 主要 component: `TrustLevelBadge`, `DisabledAction`, `PageFooter`
**Mock dependency**: `mock-agents.ts` (agent-corporate-address-change) + `mock-metrics.ts` (mockKpiHypotheses import for KPI_PROGRESSION)
**Primary task**: Trust Level 進化段階確認、設定変更申請 (現状 disabled)
**Primary user persona**: AI 管理者

| Page section | User job | 5秒で分かるか | 主操作 | 残す情報 (N) | Demote する情報 (S/X) | Dig-into 導線 | 主な問題 | Priority |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PageHeader | Agent orient + Trust Level | pass (3-level breadcrumb + h1 Agent 名 + workflow chip + TrustLevelBadge compact + 版数) | (なし) | breadcrumb + h1 + workflow + TrustLevelBadge + 版数 | (なし) | (なし) | (なし) | — |
| Hero — Trust Level Progression | 進化段階 + 4 KPI 要件 確認 | **fail** (6 layer 同時表示: title + body + caption + 3-stage stepper + 4 KPI grid + 引き上げ申請 disabled、Wow signal 散漫) | (引き上げ申請 disabled CTA) | title + body + 3-stage stepper | 4 KPI grid → L3 expand 化、`統制原則` mono caption → 削除、Hero 引き上げ申請 disabled → 削除 (footer 既存) | (4 KPI grid expand → Metrics 全体 link)、(引き上げ申請 → footer CTA) | **F-9 Hero cluttered** + F-2 hedge | **P0** (F-2) / **P2** (F-9) |
| Agent 構成 5 領域 | 5 領域 read-only | partial (Model / Prompt / Tool / 権限 / Trust Level、5 領域縦並びで dense) | (なし) | 5 領域 | Model + Prompt は inline keep、Tool 3 entries の各 description は L3 expand 化、`権限 / 範囲` の 2-line description は L2 keep、Trust Level 行 (Hero 既出) → 削除 | (Tool entries → expand) | Tool entries L3 化候補 | **P2** |
| 変更 simulation panel | Type A/B/C 区分判定 | pass (3 シナリオ button + 詳細 panel) | scenario button click | 3 シナリオ + 詳細 | (なし) | (詳細 panel inline expand = L3 OK) | (なし) | — |
| 設定承認 履歴 | 直近 3 件確認 | pass | (なし、現状 read-only) | 3 row 履歴 | (なし) | (entry click → AuditTrail navigation 候補) | (なし) | — |
| Footer | 変更を申請 | partial | `変更を申請` disabled CTA + `ダッシュボードに戻る` link | CTA + link | `設定変更・申請は次の実装段階で対応` caption は F-4 で PrototypeModeLabel 統合 | (なし) | F-4 footer caption | **P1** (F-4) |

**Verdict**: Axis 1 partial / Axis 2 **fail (Hero clutter)** / Axis 3 partial / Axis 4 partial / Axis 5 partial / Axis 6 pass / Axis 7 pass / Axis 8 pass
**Page-level priority**: **P0** (F-2 hedge) + **P2** (F-9 Hero) — F-2 fix で 4 KPI grid hedge label 削除すれば Hero clutter 50% 軽減
**Touch files**: `AgentSettings.tsx` (149-217 = F-9 Hero) + Tool entries L3 化 + `HedgeBanner.tsx` + `PrototypeModeLabel.tsx`

### 4.7 `/audit` AuditTrail

**Screenshot reference**: `07-audit-trail.png`
**Source**: `AuditTrail.tsx` (LOC: 424) + 主要 component: `FilterChip`, `MetaChip`, `PageFooter`, internal `DetailPanel` + `DetailRow`
**Mock dependency**: `mock-audit.ts` (13 audit event)
**Primary task**: 時系列で 監査イベント を確認、特定 event の 15 row schema を expand 表示
**Primary user persona**: Auditor (read primary)、他 role secondary read

| Page section | User job | 5秒で分かるか | 主操作 | 残す情報 (N) | Demote する情報 (S/X) | Dig-into 導線 | 主な問題 | Priority |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PageHeader | 監査 orient + 業務 filter | partial (h1 + 直近 30 日 chip + `15 項目構造 · 関連項目 含む実 18` schema metadata + 3 button filter) | filter chip click | h1 + 直近 30 日 + 3 filter | `15 項目構造 · 関連項目 含む実 18` mono caption は **L1 削除** (F-3) | (なし) | F-3 schema metadata leak | **P1** (F-3) |
| Framing 注 box (slate-50) | 画面 model 説明 | partial (1 paragraph + 1 sub-paragraph、毎回 visible で noise) | (なし) | (なし、削除候補) | 全削除 → F-1 `<PageHelpDisclosure>` で expand 化 | (PageHelpDisclosure toggle 経由 L4 expand) | **F-1 framing 注 L1 常時表示** | **P0** (F-1) |
| 監査イベント timeline | 13 event 確認 + expand | pass (icon + timestamp + event type + case_id + actor + summary、行 click expand) | row click → expand | 各 row 6 field + expand icon | row mono `UC-BO-01 v0.1` の agent version `v0.1` は L4 (F-3) | (expand → 15 row schema detail = L3 SM3 details on demand) | event type icon 全 slate-600 monochrome で type 区別弱 (Day 17 C2 既知)、`v0.1` version L1 leak | **P1** (F-3) + (icon mono は Day 17 既決定、本 audit 触らず) |
| Expand DetailPanel | 15 row schema 詳細 | pass (DetailRow JP label + snake_case schemaKey + value + note) | (なし、現状 read-only) | 15 row (8 mandatory + 7 optional) | `DOC-KNW-04 §8.1` reference → 削除 (F-3)、各 DetailRow note `次の実装段階で対応` 反復は F-4 PrototypeModeLabel 統合候補 | (snake_case schemaKey は L3 spec OK keep) | F-3 SSOT ref + F-4 next-impl note 反復 | **P1** (F-3 + F-4) |
| Footer | dashboard 戻り + 拡張 caption | partial | `ダッシュボードに戻る` link | (なし) | `検証用 監査機能の拡張は次の実装段階で対応` caption は F-4 で PrototypeModeLabel 統合 | (なし) | F-4 | **P1** (F-4) |

**Verdict**: Axis 1 partial / Axis 2 **fail** (F-1 framing 注 + F-3 schema metadata) / Axis 3 pass / Axis 4 partial / Axis 5 **fail** (F-3 schema leak) / Axis 6 pass / Axis 7 partial / Axis 8 partial
**Page-level priority**: **P0** (F-1) + **P1** (F-3 + F-4)
**Touch files**: `AuditTrail.tsx` (119-121, 147-160, 280-282, 265) + `PageHelpDisclosure.tsx` 新規 + `PrototypeModeLabel.tsx`

### 4.8 `/metrics` Metrics

**Screenshot reference**: `08-metrics.png`
**Source**: `Metrics.tsx` (LOC: 498) + 主要 component: `Sparkline`, `PageFooter`, `FilterChip`
**Mock dependency**: `mock-metrics.ts` (4 KPI + 3 補助 KPI + 9 KRI + 2 workflow trend)
**Primary task**: 4 KPI 進化判断 目安 確認 + KRI 状態確認
**Primary user persona**: AI 管理者 + 業務責任者 primary、Auditor secondary

| Page section | User job | 5秒で分かるか | 主操作 | 残す情報 (N) | Demote する情報 (S/X) | Dig-into 導線 | 主な問題 | Priority |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PageHeader | KPI / KRI orient | partial (h1 + 直近 7 日 chip + `4 KPI 進化判断 目安 + 補助 3 KPI + 9 KRI` 自己説明 meta) | (なし) | h1 + 期間 chip | `4 KPI 進化判断 目安 + 補助 3 KPI + 9 KRI` mono は L4 削除 (本 page section 構造の self-描写) | (なし) | NH8 self-description meta | **P1** (F-3) |
| Framing 注 box | 仮説 framing | partial (`本画面の閾値・現在値・推移はすべて [仮説 / 要検証] です ... 本番導入可否を判定する基準ではなく` 2 sentence) | (なし) | (削除候補) | 全削除 → F-1 + F-2 で `<HedgeBanner pageType="metrics-hypothesis" />` 1 行 + `<PageHelpDisclosure>` 統合 | (PageHelpDisclosure 経由 L4 expand) | **F-1 framing 注 + F-2 hedge over-display 両軸** | **P0** (F-1 + F-2) |
| Hero — 4 KPI gate | 4 KPI 達成判定 | pass (4 KPI card grid + `仮判定 met / miss` legend + 仮判定 2/4 summary chip) | (card click → KPI detail expand 候補) | 4 KPI card + 仮判定 chip + legend | 各 KPI card 内 `[仮説 / 要検証]` mono caption ×4 → F-2 で削除、`仮判定 met / miss [仮説 / 要検証]` legend mono ×3 → F-2 で削除 | (card click → 補助 KPI / 内訳 expand) | F-2 hedge 16+ surface | **P0** (F-2) |
| 補助 KPI 一覧 (table) | K5/K6/K7 推移 | pass (5 col table) | (なし、現状 read-only) | KPI 名 + 内容 + 目標仮説 + 現在値 | 各 row `[仮説 / 要検証]` ×3 → F-2 で削除 | (なし) | F-2 hedge | **P0** (F-2) |
| 9 KRI 監視 | 異常 trigger 確認 | pass (3 col grid + state badge + trigger 条件 + 対応) | (なし、現状 read-only) | 9 KRI + state | 各 KRI `[仮説 / 要検証]` ×9 → F-2 で削除 | (KRI click → 詳細 historical trend expand 候補) | F-2 hedge | **P0** (F-2) |
| 業務別 推移 (Sparkline) | 推移確認 | pass (Sparkline 2 軸 × 2 workflow) | filter chip workflow 切替 | Sparkline | section-local filter chip vs PageHeader filter 不整合 (F-11 Defer) | (sparkline click → 時系列 detail expand 候補) | F-11 Defer | **Defer** (F-11) |
| Footer | dashboard 戻り + 拡張 caption | partial | `ダッシュボードに戻る` link | (なし) | `検証用 KPI 表示の拡張は次の実装段階で対応` caption は F-4 PrototypeModeLabel 統合 | (なし) | F-4 | **P1** (F-4) |

**Verdict**: Axis 1 partial / Axis 2 **fail** (F-1 + F-2 同時、本 audit 最大 fail) / Axis 3 partial / Axis 4 partial / Axis 5 partial / Axis 6 pass / Axis 7 partial / Axis 8 partial
**Page-level priority**: **P0** (F-1 + F-2 + F-4 が同 page 集中)
**Touch files**: `Metrics.tsx` (128-130, 139-155, 230-233, 309-311, 382-386, 494) + `HedgeBanner.tsx` 新規 + `PageHelpDisclosure.tsx` 新規 + `PrototypeModeLabel.tsx`

### 4.9 `/knowledge` KnowledgeBrowser

**Screenshot reference**: `09-knowledge-browser.png`
**Source**: `KnowledgeBrowser.tsx` (LOC: 442) + 主要 component: `FilterChip`, `MetaChip`, `PageFooter`, internal `DetailPanel` + `DetailRow`
**Mock dependency**: `mock-knowledge.ts` (8 knowledge snippet)
**Primary task**: 8 件 knowledge snippet 確認、weight / category / workflow 別 filter、特定 snippet を expand 表示
**Primary user persona**: Manual 管理者 + 業務責任者 primary

| Page section | User job | 5秒で分かるか | 主操作 | 残す情報 (N) | Demote する情報 (S/X) | Dig-into 導線 | 主な問題 | Priority |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PageHeader | 範囲 + filter + count | partial (h1 + 全期間 chip + count `8 件 (承認済 5 · 確認済 2 · 未承認 1)` + 業務 filter 3 button) | filter click | h1 + count + filter | `(検証用)` 内部 dev label → 削除 (F-3 と同種) | (なし) | F-3 dev label | **P1** (F-3) |
| Framing 注 box | weight semantics + citation rule | partial (2 sentence: `ナレッジは 承認済 / 確認済 / 未承認 の 3 段階で管理されます` + `AI が 引用根拠 として使えるのは 承認済 ナレッジのみです`) | (なし) | (citation governance 必須 L1 だが framing 注全体は L4 expand 化候補) | F-1 で `<PageHelpDisclosure>` 化、ただし citation governance 1 sentence は L1 PageHeader subtitle 化推奨 (`docs/01-flywheel-and-knowledge.md` §3.5 + `_SSOT.md` §1.4 SSOT) | (PageHelpDisclosure 経由 L4 expand) | F-1 framing 注 L1 + 一部 governance 必須 | **P0** (F-1 with carve-out: citation governance core 1 sentence keep) |
| 分類 + 重要度 filter chip row | 2 軸 filter | pass (分類 5 + 重要度 4 = 9 chip + 全分類 / 全段階) | filter chip click | filter chip row | (なし) | (なし) | (なし) | — |
| Snippet list | 8 件 review + expand | pass (各 row weight dot + title + weight badge + body excerpt + meta 4 mono) | row click expand | dot + title + badge + body excerpt + meta (date / workflow / category / sourceCase) | row expand 内 DetailPanel `DOC-ROOT-_SSOT §1.4` ref 削除 (F-3) | (expand → 8 項目 frontmatter detail + body = L3 SM3) | F-3 SSOT ref | **P1** (F-3) |
| Expand DetailPanel | 8 項目 frontmatter + 本文 | pass (DetailRow 8 row + 本文 paragraph) | (なし、現状 read-only) | 8 row + 本文 | `DOC-ROOT-_SSOT §1.4` reference 削除、snake_case schemaKey は L3 spec OK | (なし) | F-3 SSOT ref leak | **P1** (F-3) |
| Footer | dashboard 戻り + 拡張 caption | partial | `ダッシュボードに戻る` link | (なし) | `未承認 → 提案レビューへの送付は次の実装段階で対応` caption は F-4 で PrototypeModeLabel 統合 | (なし) | F-4 | **P1** (F-4) |

**Verdict**: Axis 1 partial / Axis 2 partial / Axis 3 pass / Axis 4 partial / Axis 5 partial / Axis 6 pass / Axis 7 pass / Axis 8 pass
**Page-level priority**: **P0** (F-1) + **P1** (F-3 + F-4)
**Touch files**: `KnowledgeBrowser.tsx` (108-110 = `(検証用)`, 137-149 = framing 注, 341-344 = DOC ref, 326 = footer) + `PageHelpDisclosure.tsx` + `PrototypeModeLabel.tsx`

---

## 5. IA Layer Plan (L1-L4、9 page table)

| Page | L1 (常時表示、Overview first SM1) | L2 (要約、Zoom and filter SM2) | L3 (掘る、Details on demand SM3 + NPD + PDR) | L4 (内部 / 将来 / 検証情報、tooltip / footer / dev-only / docs) | Notes |
| ---- | -------- | -------- | -------- | -------- | ----- |
| **Dashboard** | h1 + 案件数 / 注意 / 承認者承認待ち chip + 注意 strip 1 件 + 業務 card 2 (workflow ID + 業務名 + 3 数値 + state chip + sparkline + CTA link) | 業務 card 内 sparkline 7 日 trend label | 業務 card 内 5 status breakdown (expand `内訳を見る`)、業務 card click → /inbox?workflow= | PrototypeModeLabel tooltip 内 `業務カード集計について` + `[仮説 / 要検証]` page-level banner | F-7 業務オペレーション動線 strip 削除、Sidebar 機能と重複 |
| **Inbox** | h1 + 件数 + StatusBadge tone + SLA 経過 + 担当者 + 注意 chip + table row | active workflow filter chip (`?workflow=` URL state) + 件数 summary footer | row click → CaseReview、column sort (Phase 1 で追加候補) | filter 3 disabled + sort read-only + bulk action 2 disabled → `<FilterToolbar mode="locked-mvp">` 統合、F-4 footer caption は PrototypeModeLabel 統合 | F-10 統合で 6 disabled surface → 1 statement |
| **CaseReview** | h1 case_id + 業務名 + StatusBadge + LifecycleStepper + 注意 strip + 3-col (AI 入力 / 証跡 / 引用根拠) + footer 2 button | AI 入力結果 各 field の ConfidenceBar + 凡例、引用根拠 3 card relevance% + 名前、未承認ヒント 2 件 | 証跡 timeline step 詳細 (actor / source / conf mono、L3 OK)、引用根拠 card click → KnowledgeBrowser detail、BusinessApprovalChip click → BusinessApprovalView mock | `source: OCR 抽出` prefix → JP-localize、`citation 対象外` → `引用対象外`、`corporate-address-change/ocr-confidence` 内部 path → JP-friendly、footer left explainer 削除 (F-8) | F-3 + F-5 + F-8 が CaseReview に集中 |
| **SendBackComment** | h1 + 業務 chip + StatusBadge + LifecycleStepper + 案件概要 4 field + 差戻し分類 5 radio + textarea + 関連根拠 checklist + footer 2 button | 案件概要 4 field grid (L1 inline 妥当)、各 radio の description (`誤読: AI が文書の意図を誤って解釈した` 等、L2 keep) | data_error 選択時 warning banner (L3 inline conditional)、関連根拠 checklist (任意 L3) | `5 分類` mono chip 削除、`(入力誤りは AI 責ではないため別経路)` 説明 → expand 化、footer caption 削除 (F-4) | radio description trim 候補 (P2) |
| **ProposalReview** | h1 提案 title + Proposal source + ProposalLifecycleStepper + 判定基準 3 件 + 元案件 3 件 + 提案差分 hero (中央 8/12 拡大) + footer 2 button | 元案件 category chip + 1-line reason、提案差分 file header summary | 未承認ヒント 2 件 (中央下 inline summary)、RACI 5-row + 提案メタ → 右 drawer (`<DetailDrawer trigger="提案詳細を見る">`)、SoD note → footer L4 | 提案差分 `targetFile` raw path → JP-friendly section name、`citation 対象外` → `引用対象外`、`提案メタ 提案 ID / 業務` PageHeader 重複部分削除、footer caption 削除 | F-3 + F-4 + F-6 で 4-col → 2-col + drawer |
| **AgentSettings** | h1 Agent 名 + workflow chip + TrustLevelBadge compact + 版数 + Hero (Trust Level 3-stage stepper + body 1 sentence) + Agent 構成 5 領域 (Model / Prompt / 権限 / Trust Level) + 設定承認 履歴 + footer 1 button | Agent 構成 Tool 3 entries (各 name visible) | Hero `4 KPI 進化要件 grid` → `<DetailDisclosure trigger="4 KPI 進化要件を見る">` (expand)、Tool entries description → expand、変更 simulation panel (現状 L3 expand 妥当) | `(検証用)` label 削除、Hero 統制原則 mono caption 削除、Hero 引き上げ申請 disabled 削除 (footer 既存)、footer caption F-4 統合 | F-2 + F-9 で Hero clutter 解消 |
| **AuditTrail** | h1 + 直近 30 日 chip + 3 業務 filter + timeline 13 行 (icon + timestamp + event type + case_id + workflow + actor + summary) + footer link | `関連ルール更新 (rule_update_alert)` event の `過去案件への影響` chip (amber-soft、L2 emphasis) | row click → expand DetailPanel (15 row schema + JP label + snake_case schemaKey value、L3 SM3 + spec OK) | `15 項目構造 · 関連項目 含む実 18` PageHeader meta 削除、framing 注 box → `<PageHelpDisclosure>` (F-1)、行内 `v0.1` agent version 削除、`DOC-KNW-04 §8.1` reference 削除、footer caption F-4 統合 | F-1 + F-3 + F-4 が AuditTrail に集中 |
| **Metrics** | h1 + 直近 7 日 chip + Hero 4 KPI gate card grid + 仮判定 2/4 chip + 補助 KPI table + 9 KRI grid + 業務別 推移 Sparkline + footer link | 各 KPI card current value + target + sparkline、9 KRI state badge、補助 KPI target/current | KPI card click → 詳細 (分母 / 対象業務 / 除外条件 / sample size) expand 候補 (Phase 1 で追加)、KRI click → historical trend expand 候補 | `[仮説 / 要検証]` ×16 の個別反復 → Hero KPI / 補助 KPI / KRI の section-level `<HedgeBanner>` 3 surface に圧縮 (F-2)、framing 注 box → `<PageHelpDisclosure>` (F-1)、`4 KPI 進化判断 目安 + 補助 3 KPI + 9 KRI` self-description 削除 (F-3)、footer caption F-4 統合、業務別推移 section-local filter (F-11 Defer) | F-1 + F-2 + F-3 + F-4 全 P0/P1 finding が Metrics に集中、本 audit 最大 fix scope |
| **KnowledgeBrowser** | h1 + 全期間 chip + count `8 件 (承認済 5 · 確認済 2 · 未承認 1)` + 業務 filter + citation governance 1 sentence subtitle (`引用根拠は承認済のみ`) + 分類 + 重要度 filter + snippet list (dot + title + weight badge + excerpt + meta) | weight badge tone (emerald / amber / slate)、`data_error` 例外 `AI 引用対象外` badge | row click → expand DetailPanel (8 項目 frontmatter + 本文、L3 SM3 + PDR drawer 化候補) | `(検証用)` label 削除、framing 注 box 2 sentence → `<PageHelpDisclosure>` (F-1、citation governance 1 sentence のみ L1 subtitle 残置)、`DOC-ROOT-_SSOT §1.4` reference 削除、footer caption F-4 統合 | F-1 carve-out (citation governance L1 keep)、F-3 + F-4 集中 |

---

## 6. Cross-Cutting Findings (CR-1 〜 CR-8)

### CR-1: Shared Primitive 候補

| Pattern | 現状 (file:line × N 箇所) | 抽出基準 (3 箇所 + prop ≤ 3 + net 行数減少) | 提案 component | 適用 page |
| ------- | --------------------------- | ----------------------------------------- | -------------- | --------- |
| **Page-level help disclosure** (`<PageHelpDisclosure>`) | Metrics.tsx:139-155 + AuditTrail.tsx:147-160 + KnowledgeBrowser.tsx:137-149 = 3 箇所 framing 注 box pattern (`<div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-[12px] leading-relaxed text-slate-700"><div className="flex items-start gap-2.5"><Icon /><div><p>...</p><p>...</p></div></div></div>`) | **適合** (3 page + prop = `title` + `children` + `defaultOpen` = 3 / net 行数 = 各 page 14 → 3 = 33 行削減) | `<PageHelpDisclosure title="本画面の説明" defaultOpen={false}>...</PageHelpDisclosure>` | Metrics + AuditTrail + KnowledgeBrowser (3 page、F-1 で導入) |
| **Section-level hedge banner** (`<HedgeBanner>`) | Metrics.tsx (Hero + 補助 + KRI で 16+ inline hedge) + AgentSettings.tsx (Hero 4 KPI で 4 inline hedge) + Dashboard.tsx (sparkline label + 注意 strip で 4 inline hedge) | **適合** (3 page + prop = `pageType: 'metrics-hypothesis' | 'kpi-progression' | 'workflow-trend'` 1 prop / net 行数 = per-card hedge label を section-level へ圧縮して 15+ 行削減) | `<HedgeBanner pageType="metrics-hypothesis" />` | Metrics + AgentSettings + Dashboard (3 page、F-2 で導入。Metrics は Hero KPI / 補助 KPI / KRI の 3 section に隣接配置) |
| **Right-side detail drawer** (`<DetailDrawer>`、PDR pattern) | ProposalReview.tsx:233-290 (RACI + 提案メタ右 column、4-col scan 効率低下) — **1 箇所のみだが本 audit 推奨 pattern として新規** | **不適合 (1 箇所のみ)、ただし PDR Industry pattern として SSOT 化価値あり** | `<DetailDrawer trigger="提案詳細を見る" side="right" width="md">` (Radix Dialog 流用 or 自前 implementation) | ProposalReview (F-6)、将来 CaseReview citation card detail / AuditTrail event detail / KnowledgeBrowser snippet detail で再利用候補 (現状 expand pattern で運用、drawer 移行は Phase 1) |
| **Filter toolbar (locked-MVP mode)** (`<FilterToolbar>`) | Inbox.tsx:117-148 (filter 4 chip + sort span + bulk action 2 disabled = 6 disabled surface) — **1 箇所のみ** | **不適合 (1 箇所)、Phase 1 で 他 page filter 統一時に再判定** | `<FilterToolbar mode="locked-mvp" subtitle="MVP 範囲 — フィルタ拡張は実装段階で">` | Inbox (F-10)、Defer 系 |

### CR-2: IA Refactor (L1-L4 framework、9 page 横断)

§5 IA Layer Plan で確立した layer 再配置を以下 4 大 IA refactor finding に集約:

1. **L4 → 削除 / PrototypeModeLabel 統合**: `次の実装段階で対応` footer caption 9 page → PrototypeModeLabel tooltip 1 行集約 (F-4)
2. **L1 → L4 expand**: 3 page framing 注 box (Metrics + AuditTrail + KnowledgeBrowser) → `<PageHelpDisclosure>` expand 化 (F-1)
3. **L1/L2 inline → L2 section-level banner**: 25+ surface の `[仮説 / 要検証]` hedge → 数値と対応が切れない section-level `<HedgeBanner>` に圧縮 (F-2)
4. **L1 → L3 drawer**: ProposalReview 右 column (RACI 5-row + 提案メタ) → 右 drawer 化 (F-6、PDR pattern)

### CR-3: Mock Data Trim Pass (UI 非依存 commit 候補)

| Mock file | Trim 対象 | 影響 page | Demo narrative integrity |
| --------- | --------- | --------- | ------------------------ |
| `mock-proposals.ts` | `targetFile` raw path `workflows/corporate-address-change/agent-instructions.md` → JP-friendly section name 追加 (`sectionFriendly: '法人住所変更 - AI 入力指示'` 等の新 field、UI 側で raw path or friendly を切替) | ProposalReview 提案差分 | pass (PROP-2026-031 narrative 整合、targetFile 値そのものは keep して新 field 追加) |
| `mock-cases.ts` | (なし、Demo Chapter 1 narrative 必須、trim 余地少) | Dashboard / Inbox / CaseReview / SendBackComment | pass |
| `mock-knowledge.ts` | (なし、staging/compiled governance 必須) | KnowledgeBrowser / CaseReview citation panel / ProposalReview 未承認ヒント | pass |
| `mock-audit.ts` | (なし、Audit narrative 必須) | AuditTrail | pass |
| `mock-agents.ts` | Agent description `住所変更の OCR 抽出 + 住所マスタ照合 + 信頼度 0.85 関連 + 多店舗 / 法人格 / 海外住所 の境界判定` (51 字、L2 description) → 28 字以内 短縮提案 (`AI 入力 + 信頼度判定 + 境界条件 review`) | AgentSettings | pass |
| `mock-metrics.ts` | (なし、Slide 8 narrative + KPI / KRI catalogue 必須) | Metrics / AgentSettings (KPI_PROGRESSION import) / Dashboard (workflow trend) | pass |

**Demo narrative 保全 confirmation**: CASE-2026-0142 + PROP-2026-031 の核 narrative は trim 対象外、本 mock trim pass は P2 priority

### CR-4: Copy Reduction Rules (11 verbatim targets、必須 cover)

| Target | 現行出現箇所 (file:line) | 現行 wording (verbatim) | Issue | Proposed rule | 配置 layer (L1-L4) |
| ------ | ------------------------ | ----------------------- | ----- | ------------- | ------------------ |
| 1. `次の実装段階で対応` | Inbox.tsx:254 + SendBackComment.tsx:332 + ProposalReview.tsx:321 + AgentSettings.tsx:435 + AuditTrail.tsx:265 + Metrics.tsx:494 + KnowledgeBrowser.tsx:326 + Dashboard.tsx:407 + AuditTrail expand DetailRow note ×複数 = **9+ 箇所** | `フィルタ・並び順・一括操作は次の実装段階で対応` 他 7 種類 | NH4 + NH8、9 page で 7 種類異なる文言 = 表記揺れ + 反復 | **削除**、PrototypeModeLabel tooltip 末尾 1 行集約 (`PrototypeModeLabel.tsx:50` 既存「・検索 / 通知 / 一括操作 / フィルタは次の実装段階で対応」を「・検索 / 通知 / 一括操作 / フィルタ / 送信 / 承認 / 設定変更 / 監査拡張 / KPI 拡張 / ナレッジ送付 は次の実装段階で対応」に拡張) | L4 PrototypeModeLabel tooltip |
| 2. `[仮説 / 要検証]` | Metrics ×16 + AgentSettings Hero ×4 + Dashboard ×4 + 注意 strip ×1 + CaseReview ConfidenceBar 凡例 ×1 + KnowledgeBrowser snippet meta = **25+ 箇所** | `[仮説 / 要検証]` (mono caption) | NH8 + 「Hedge over-display」 anti-pattern、反復で hedge の真の意味 muted | Hero / 補助 / KRI / sparkline label の **per-card 反復を削り**、数値グループ直上に `<HedgeBanner>本 section の数値は [仮説 / 要検証] です</HedgeBanner>` を置く。Metrics は Hero KPI / 補助 KPI / KRI の 3 surface、Dashboard と AgentSettings は 1 surface ずつ。Tier 2 docs / Tier 3 hedge rule とは別 surface (本 banner は UI section-level、docs 内 hedge は別 rule) | L2 section-level (HedgeBanner) + L4 expand (詳細根拠) |
| 3. `検証用` | Metrics.tsx:127 (`直近 7 日 (検証用)`) + AuditTrail.tsx:118 (`直近 30 日 (検証用)`) + KnowledgeBrowser.tsx:108 (`全期間 (検証用)`) + AuditTrail.tsx:265 footer (`検証用 監査機能の拡張は次の実装段階で対応`) + Metrics.tsx:494 footer (`検証用 KPI 表示の拡張は次の実装段階で対応`) = **5+ 箇所** | `(検証用)` 期間 chip suffix + footer caption 内 | 内部 dev label leak、NH2 違反 | 期間 chip suffix `(検証用)` **削除** (PrototypeModeLabel + HedgeBanner で page-level 仮説性は伝達済)、footer caption は target 1 で削除 | L4 削除 |
| 4. `source:` | CaseReview.tsx 注意 strip 内 (`source: OCR 抽出` / `source: マスタ照合`) + CaseReview.tsx 証跡 timeline 各 step (`source: db.address_master` 等) + RelatedRuleAlert.tsx (`source:` prefix existed before Day 14-15) = **5+ 箇所** | `source: {raw_value}` mono prefix | 内部 schema prefix leak、JP user に「source とは?」不要 cognitive load | 注意 strip は **削除** (注意 文言 inline で context 自明)、証跡 timeline は **`出典: {JP-localized}` に paraphrase**、actor: / conf: prefix は L3 expand 内なら spec OK keep | L1 削除 (注意 strip)、L3 paraphrase (timeline) |
| 5. `field` / `step` (snake_case dev label) | AuditTrail expand DetailPanel + KnowledgeBrowser expand DetailPanel = **多数 (各 DetailRow `schemaKey` prop で snake_case 表示)** | `case_id` / `workflow_id + workflow_version` / `agent_id + agent_version` 等 9-15 schemaKey 表示 | L3 expand 内では SSOT spec 通り (Day 18 で確立した spec)、ただし L1 PageHeader の `15 項目構造 · 関連項目 含む実 18` は L4 化 | **L3 keep** (spec 通り) / L1 metadata は **削除** (target 7 と一括) | L3 keep / L1 削除 |
| 6. `citation` (raw 用語) | CaseReview StagingHintPanel `citation 対象外` label + ProposalReview 未承認ヒント `citation 対象外` label = **2 箇所** | `citation 対象外` (raw 英語) | JP-only 違反、Tier 2 paraphrase | **`引用対象外`** に paraphrase (Tier 2 vocabulary `引用根拠` = `citation` の JP form と整合) | L1-L2 (UI surface) |
| 7. `DOC-*` / `SSOT` / `schema key` | AuditTrail.tsx:119-121 (`15 項目構造 · 関連項目 含む実 18`) + AuditTrail.tsx:280-282 (`DOC-KNW-04 §8.1`) + KnowledgeBrowser.tsx:341-344 (`DOC-ROOT-_SSOT §1.4`) + Metrics.tsx:128-130 (`4 KPI 進化判断 目安 + 補助 3 KPI + 9 KRI`) = **4 箇所** | `15 項目構造 · 関連項目 含む実 18` 他 SSOT pointer / DOC-ID | NH2 + dev metadata leak | **L1 削除**、必要なら L4 PageHelpDisclosure 内 dev annotation として keep (audit doc trace 用) | L4 dev-only or remove |
| 8. 長い説明文 (60 字超 inline) | Metrics.tsx:148-153 (framing 注 2 sentence 計 ~120 字) + AuditTrail.tsx:151-157 (framing 注 ~95 字) + KnowledgeBrowser.tsx:142-146 (framing 注 ~110 字) + AgentSettings.tsx:162-167 (Hero body ~75 字) + SendBackComment.tsx:153-156 (radio description 5 行 各 ~50 字) = **多数** | 各 framing 注 / Hero body / radio description | NH8 + 「Tooltip dependency for primary info」近接 risk | framing 注 → `<PageHelpDisclosure>` (F-1) で L4 expand、Hero body は 1 sentence に短縮 (F-9)、radio description は L2 keep (form 入力時 context として必要、ただし trim 候補 P2) | L3 expand or trim |
| 9. footer caption (3+ sentence) | (target 1 + 3 と統合、本 prototype は基本 1-2 sentence 内) | (target 1 verbatim) | (target 1 と同) | (target 1 で削除) | L4 1-2 sentence (PrototypeModeLabel 統合) |
| 10. disabled tooltip (Day 18.5 patch 後の残余) | Day 18.5 Commit 3 で `<DisabledHint>` shared component 統一済 (本 audit 時点で `<DisabledAction>` mode='wrapper' / 'caption' / 'inline' で SSOT) | (各 DisabledAction の `reason` prop) | (Day 18.5 SSOT 統一済、本 audit で再 audit せず) | **Day 18.5 SSOT keep**、本 audit では target 1 (footer caption 削除) と co-exist | L4 (Day 18.5 SSOT 統合) |
| 11. Prototype mode label (表示頻度・場所) | TopBar.tsx 経由 9 page 共通 + PrototypeModeLabel.tsx:30 (`プロトタイプ表示 — 外部システム未接続 / 証跡はモック`) + tooltip line 39-51 (5 行) | `プロトタイプ表示 — 外部システム未接続 / 証跡はモック` + tooltip 5 行 (永続化なし / 外部システム未接続 / 実顧客データ未使用 / 実規制の引用なし / 検索 / 通知 / 一括操作 / フィルタは次の実装段階で対応) | 現状 L4 常時 surface OK (regulated UI 必須、`docs/00-overview.md` §2.3 で必須指定)、ただし tooltip 内容が target 1 (`次の実装段階で対応` 列挙) と F-4 で集約候補 | **常時 keep** (L4 SSOT)、tooltip 末尾を target 1 拡張 (F-4 で `送信 / 承認 / 設定変更 / 監査拡張 / KPI 拡張 / ナレッジ送付` 追加) | L4 (常時表示で OK、tooltip 拡張) |

### CR-5: Tier 1 / Tier 3 vocabulary cross-page consistency

**Tier 1 表記揺れ list** (NH4 Consistency violation):
- `承認待ち` (Dashboard chip Line 193) vs `承認者承認待ち` (CaseStatus StatusBadge、Inbox / CaseReview Header / status-tones.ts SSOT で `'business-approval-waiting': '承認者承認待ち'`) vs `業務承認: 未提出` (BusinessApprovalChip CaseReview footer)
  - **統一案**: Dashboard chip `承認者承認待ち`、BusinessApprovalChip `承認者承認: 未提出` (F-5)
- `案件処理` (Sidebar.tsx:41 nav item `to=/inbox` + activePrefix=/cases/) vs `案件レビュー` (Dashboard workflow lane button) vs `案件処理` (Inbox PageHeader breadcrumb) vs `案件処理` (CaseReview PageHeader breadcrumb middle segment "受信トレイ › 案件処理 › CASE-...")
  - **統一案**: `案件処理` (`/cases/:id` 主呼称)、Dashboard workflow lane の `案件レビュー` button は F-7 で削除済になるため考慮不要

**Tier 3 規制語 leak check**:
- `prototype/src/` source 内に Tier 3 規制語 (`docs/prior-art-map.md` §規制語 hedge ルール) **0 件** (Day 19 grep target で確認推奨、本 audit 視認では 0 hit)
- **pass**

**`[仮説 / 要検証]` hedge over / under check**:
- KPI / SLO 数値で hedge 必須箇所 = Metrics 4 KPI + 3 補助 + 9 KRI + AgentSettings 4 KPI grid + Dashboard sparkline / 注意 strip 経過時間 = 必要
- ただし F-2 で section-level banner 集約推奨 (各 card 個別 hedge は muted)

**Component 名 leak check** (`BusinessApprovalChip` 等 component 名が user-facing に出ていないか):
- `BusinessApprovalChip` 自体は L1 visible ではない (component name)、ただし表示 wording `業務承認` は F-5 で `承認者承認` に統一推奨
- `PrototypeModeLabel` 表示 wording `プロトタイプ表示` (user-friendly) で component 名 leak なし
- **pass**

**Internal SSOT 用語 leak check** (`DOC-*` / `_meta.yaml` / `snake_case` field 名):
- AuditTrail PageHeader `15 項目構造 · 関連項目 含む実 18` + expand `DOC-KNW-04 §8.1` = leak (F-3)
- KnowledgeBrowser expand `DOC-ROOT-_SSOT §1.4` = leak (F-3)
- ProposalReview 提案差分 `targetFile` raw path = leak (F-3)
- CaseReview citation card 内 path label = leak (F-3)
- **fail (F-3 で fix)**

### CR-6: docs/03 / Day 18.5 audit location reconciliation

`docs/03-ui-prototype-design.md` について、audit prompt は「Day 18.5 audit content で上書き済、UI design SSOT loss」と前提化している。ただし **current HEAD 34e3907 ではこの前提は確認できない**。`docs/03-ui-prototype-design.md:1-22` は UI prototype design SSOT として残っており、`prototype/audit-bundle/2026-05-23-day-18-5/docs-03-day-18-5-snapshot.md:1-15` が Day 18.5 audit content である。したがって本 audit では「復旧」ではなく **prompt premise と repo state の差分確認 / docs 配置の reconciliation** と扱う。

**対応候補**:
- **A (条件付き)**: もし別 branch / bundle で `docs/03-ui-prototype-design.md` が本当に Day 18.5 audit に置換されているなら、git history から元 SSOT を復元 + Day 18.5 audit を `docs/audits/day-18-5-micro-interaction-audit.md` に move
- **B (current HEAD 推奨)**: current HEAD の `docs/03-ui-prototype-design.md` は維持し、Day 18.5 audit snapshot の置き場所だけを `docs/audits/` または `prototype/audit-bundle/` のどちらにするか整理する。Day 19 audit finding を docs/03 に統合するのは patch 適用後に限定する

**reconciliation 優先度**: **P2** (current HEAD では UI SSOT が存在するため、Day 19 patch の blocker ではない。ただし prompt bundle と repo state の差分は reviewer-back question として残す)

**commit 含めるか**: 本 Improvement Plan §7 **Commit 6 (optional) は reconciliation commit に変更**。current HEAD では blind restore を実行しない。

### CR-7: End-to-End User Flow Walk

9 page を Dashboard → Inbox → CaseReview → SendBackComment → ProposalReview → AgentSettings → Metrics → AuditTrail → KnowledgeBrowser の順で sequential walk。

#### Step 1: Dashboard

| 項目 | 内容 |
| --- | --- |
| ユーザが知りたいこと | 「今、どの業務に注意 / 承認待ち 案件 が何件あるか? 自分が次に何を見るべきか?」 |
| 画面が最初に答えるべきこと | 案件数 13 + 注意 6 + 承認者承認待ち 1 + 業務 別 状況 (UC-BO-01 法人住所変更: 通常稼働 8 件 / UC-BO-02 口座開設書類完備: 要注意 5 件) |
| 次に押すべきもの | 注意 strip `確認` link → CaseReview、または 業務 card `法人住所変更 の案件を開く >` → Inbox |
| 詳細を見たい時の導線 | 業務 card 内 5 status breakdown を expand (L3、現状 inline、F-2 で keep) |
| 現状の阻害要因 | (1) F-2 hedge inline ×4 で hedge muted (2) F-5 `承認待ち` vs `承認者承認待ち` 表記揺れ (3) F-7 業務オペレーション動線 strip が Sidebar nav と重複 (4) F-4 footer caption |
| 修正方針 | F-2 page-level HedgeBanner + F-5 vocab 統一 + F-7 strip 削除 + F-4 footer caption 削除 |

#### Step 2: Inbox

| 項目 | 内容 |
| --- | --- |
| ユーザが知りたいこと | 「13 件 queue から自分が次に処理する 1 件はどれか?」 |
| 画面が最初に答えるべきこと | 13 行 table (案件 ID / 業務 / 状態 / SLA 経過 / 担当者 / 注意) で urgency 識別 |
| 次に押すべきもの | row click → CaseReview |
| 詳細を見たい時の導線 | column sort (Phase 1 で追加候補)、active workflow filter chip 解除動線 |
| 現状の阻害要因 | (1) F-10 filter 4 disabled + sort span read-only + bulk 2 disabled = 6 disabled surface で「UI 半壊」trust feeling (2) F-4 footer caption |
| 修正方針 | F-10 `<FilterToolbar mode="locked-mvp">` 統合 + F-4 footer caption 削除 |

#### Step 3: CaseReview

| 項目 | 内容 |
| --- | --- |
| ユーザが知りたいこと | 「この案件の AI 入力結果は正しいか? 引用根拠は信頼できるか? 承認 / 差戻し どちらを選ぶか?」 |
| 画面が最初に答えるべきこと | LifecycleStepper (入力者確認 current) + 3-col (AI 入力 5 field + 信頼度 / 証跡 timeline 4 step / 引用根拠 high 3 件 + 未承認ヒント) + 注意 strip 2 件 |
| 次に押すべきもの | footer `承認` primary CTA、または `差戻し` → SendBackComment |
| 詳細を見たい時の導線 | 証跡 PDF preview link、citation card click → KnowledgeBrowser detail (Phase 1 で実装) |
| 現状の阻害要因 | (1) F-3 注意 strip `source:` prefix leak + 引用根拠 card 内 path leak (2) F-5 `citation 対象外` raw 英語 (3) F-8 footer left explainer 重複 |
| 修正方針 | F-3 prefix paraphrase + `citation 対象外` → `引用対象外` + F-8 explainer 削除 |

#### Step 4: SendBackComment

| 項目 | 内容 |
| --- | --- |
| ユーザが知りたいこと | 「差戻し理由 (5 分類 + 自由記述) を記録して staging knowledge に反映させたい」 |
| 画面が最初に答えるべきこと | 案件概要 (差戻し対象 context) + 5 分類 radio + textarea + 任意 関連根拠 checklist |
| 次に押すべきもの | footer `差戻しを記録` (現状 disabled) |
| 詳細を見たい時の導線 | data_error 選択時 warning banner (L3 conditional) |
| 現状の阻害要因 | (1) F-4 footer caption + DisabledAction caption 2 重 (2) radio description 5×3 行で density 高 |
| 修正方針 | F-4 footer caption 削除 + radio description trim (P2) |

#### Step 5: ProposalReview

| 項目 | 内容 |
| --- | --- |
| ユーザが知りたいこと | 「AI が自動生成した手順変更 Proposal を業務責任者へ送付すべきか?」 |
| 画面が最初に答えるべきこと | Hero 提案差分 (workflow.md / approval-policy.md / agent-instructions.md の変更前 / 変更後) + 判定基準 3 件 + 元案件 3 件 |
| 次に押すべきもの | footer `業務責任者へ送付` (現状 disabled) |
| 詳細を見たい時の導線 | RACI + 提案メタ (右 drawer 化推奨、F-6)、元案件 case ID click → CaseReview |
| 現状の阻害要因 | (1) F-6 4-col scan 効率低下、中央 hero 6/12 → 8/12 推奨 (2) F-3 `targetFile` raw path leak (3) F-4 footer caption + (承認動作は次の実装段階で対応) inline 2 重 |
| 修正方針 | F-6 right drawer + F-3 path JP-friendly + F-4 footer caption 削除 |

#### Step 6: AgentSettings

| 項目 | 内容 |
| --- | --- |
| ユーザが知りたいこと | 「この Agent は今どの Trust Level か? 次の Checkpoint に進む条件は満たしているか?」 |
| 画面が最初に答えるべきこと | Hero Trust Level Progression 3-stage stepper (Supervised current) + body 1 sentence + (4 KPI 進化要件 は L3 expand 化推奨) |
| 次に押すべきもの | footer `変更を申請` (現状 disabled)、Hero 引き上げ申請 disabled は F-9 で削除 |
| 詳細を見たい時の導線 | 4 KPI 進化要件 expand (L3、F-9)、変更 simulation Type A/B/C button (L3 既存)、設定承認 履歴 row click → AuditTrail (Phase 1) |
| 現状の阻害要因 | (1) F-2 4 KPI hedge ×4 (2) F-9 Hero 6 layer clutter (3) F-4 footer caption |
| 修正方針 | F-2 HedgeBanner + F-9 Hero trim + F-4 footer caption 削除 |

#### Step 7: Metrics

| 項目 | 内容 |
| --- | --- |
| ユーザが知りたいこと | 「4 KPI gate を満たしているか? KRI に異常はないか?」 |
| 画面が最初に答えるべきこと | Hero 4 KPI gate (`98.4% / 1.2% / 4.7% / 1.0%` 達成 2/4) + KRI 状態 (正常 N / 注意 M / 警告 K) + 業務別 推移 sparkline |
| 次に押すべきもの | (現状 disabled、L1 CTA 不要、観測 primary)、各 KPI card click → 詳細 expand (Phase 1 候補) |
| 詳細を見たい時の導線 | 補助 KPI 一覧 table / 9 KRI grid / 業務別 推移 sparkline filter (L2 既存) |
| 現状の阻害要因 | (1) F-1 framing 注 L1 常時 (2) F-2 hedge ×16+ over-display (3) F-3 `4 KPI 進化判断 目安 + 補助 3 KPI + 9 KRI` self-description (4) F-4 footer caption (5) F-11 section-local filter (Defer) |
| 修正方針 | F-1 PageHelpDisclosure + F-2 HedgeBanner + F-3 self-description 削除 + F-4 footer caption 削除 (本 audit 最大 fix 集中 page) |

#### Step 8: AuditTrail

| 項目 | 内容 |
| --- | --- |
| ユーザが知りたいこと | 「直近 30 日の AI 入力 / 承認 履歴を確認、特定 event の詳細 schema を見たい」 |
| 画面が最初に答えるべきこと | 監査イベント timeline 13 行 (icon + timestamp + event type + case_id + workflow + actor + summary) + 業務 filter |
| 次に押すべきもの | row click → expand DetailPanel (15 row schema) |
| 詳細を見たい時の導線 | expand panel 内 15 row schema (L3 SM3 既存)、行内 case ID click → CaseReview (Phase 1) |
| 現状の阻害要因 | (1) F-1 framing 注 + F-3 PageHeader `15 項目構造` schema leak + 行内 `v0.1` version leak + expand `DOC-KNW-04 §8.1` ref leak (2) F-4 footer caption (3) event type icon 全 mono は Day 17 既決定で本 audit 触らず |
| 修正方針 | F-1 PageHelpDisclosure + F-3 metadata 削除 + F-4 footer caption 削除 |

#### Step 9: KnowledgeBrowser

| 項目 | 内容 |
| --- | --- |
| ユーザが知りたいこと | 「現在の knowledge (承認済 / 確認済 / 未承認) を 3 段階で確認、特定 snippet の本文 + 8 項目 frontmatter を見たい」 |
| 画面が最初に答えるべきこと | snippet list 8 件 (weight dot + title + weight badge + body excerpt + meta) + 業務 + 分類 + 重要度 filter + count |
| 次に押すべきもの | row click → expand DetailPanel (8 項目 + 本文) |
| 詳細を見たい時の導線 | expand panel 内 8 項目 frontmatter + 本文 (L3 SM3 既存)、未承認 snippet → 提案レビューへの送付 (現状 footer caption 既述、Phase 1 実装) |
| 現状の阻害要因 | (1) F-1 framing 注 (citation governance 1 sentence は L1 keep carve-out) (2) F-3 `(検証用)` label + `DOC-ROOT-_SSOT §1.4` ref leak (3) F-4 footer caption |
| 修正方針 | F-1 PageHelpDisclosure (citation governance carve-out) + F-3 削除 + F-4 footer caption 削除 |

### CR-8: Judgement Criteria Pre-Statement (本 §1 と一致確認)

本 audit の Top Findings § 3 群は、本 §1 Judgement Criteria 7 個に該当する improvement candidate のみで構成されている:

| Finding ID | 該当 Criteria |
| --- | --- |
| F-1 framing 注 L1 → L4 expand | C1 (5 秒 primary action 識別) + C2 (規制必須情報保全 = citation governance carve-out) + C3 (L3 disclosure pattern: PageHelpDisclosure expand) + C7 (8 gate retain) |
| F-2 hedge over-display | C1 (Hero KPI gate signal 強化) + C2 (KPI/SLO 値の hedge 性質保全) + C4 (新 enabled no-op なし) + C7 |
| F-3 internal SSOT/schema leak | C1 (initial cognitive load 削減) + C5 (NH2 user 言葉) + C7 |
| F-4 footer caption 9 page 反復 | C5 (NH4 Consistency) + C7 |
| F-5 Tier 1 vocab 表記揺れ (`承認待ち` vs `承認者承認待ち` vs `業務承認`) | C2 (規制必須 Tier 1) + C5 (NH4 + Tier 1 一貫性) + C7 |
| F-6 ProposalReview 4-col → 2-col + drawer | C1 (Demo Chapter 2 Hero 強化) + C3 (PDR drawer pattern) + C6 (PROP-2026-031 narrative 保全) + C7 |
| F-7 Dashboard workflow lane 削除 | C1 (Sidebar nav 重複削除で primary action 明示) + C7 |
| F-8 CaseReview footer left explainer | C1 (NH6 recognition over recall) + C7 |
| F-9 AgentSettings Hero clutter | C1 (Wow 中核 signal 強化) + C7 |
| F-10 Inbox filter toolbar 統合 | C1 (`UI 半壊` trust feeling 解消) + C4 (Day 18.5 disabled CTA pattern 整合) + C7 |
| F-11 Metrics section-local filter | (Defer、Phase 1 で governance review) |
| F-12 hedge `<sup>` notation | (Drop、F-2 集約案の方が ROI 高) |

すべて Judgement Criteria に該当、外れた candidate なし。

---

## 7. Improvement Plan (Day 19+ patch、6 commit、§9 format verbatim + Heuristic ID + first-click test verify)

### Commit 1 — `feat(day-19-ux): page-level help disclosure + hedge banner SSOT 化 (F-1, F-2, P0, NH8 + TUF)`

- **目的** (1 sentence + 対応 Heuristic ID): Metrics / AuditTrail / KnowledgeBrowser 3 page の framing 注 box (NH8 violation) を `<PageHelpDisclosure>` 新規 shared primitive で L4 expand 化、25+ surface の `[仮説 / 要検証]` hedge over-display (TUF violation) を `<HedgeBanner>` 新規 shared primitive で section-level に圧縮
- **判断基準該当** (CR-8): C1 (5 秒 primary action 識別) + C2 (規制必須 carve-out: KnowledgeBrowser citation governance 1 sentence は L1 subtitle 残置) + C3 (L3 disclosure pattern) + C7 (8 gate retain)
- **Touch files**:
  - `prototype/src/components/shared/PageHelpDisclosure.tsx` (新規) — title + children + defaultOpen={false} で folded by default、no persistence
  - `prototype/src/components/shared/HedgeBanner.tsx` (新規) — pageType prop で `metrics-hypothesis` / `kpi-progression` / `workflow-trend` 別 wording
  - `prototype/src/pages/Metrics.tsx` (Line 139-155 framing 注 → `<PageHelpDisclosure>`、Line 230-233 / 309-311 / 382-386 の per-card hedge を Hero KPI / 補助 KPI / KRI 各 section の `<HedgeBanner pageType="metrics-hypothesis" />` に圧縮)
  - `prototype/src/pages/AuditTrail.tsx` (Line 147-160 framing 注 → `<PageHelpDisclosure>`)
  - `prototype/src/pages/KnowledgeBrowser.tsx` (Line 137-149 framing 注 → `<PageHelpDisclosure>` + 1 sentence `citation governance` を L1 PageHeader subtitle に残置 carve-out)
  - `prototype/src/pages/AgentSettings.tsx` (Line 192-196 4 KPI 進化要件 grid 内 hedge ×4 を KPI 進化要件 section の `<HedgeBanner pageType="kpi-progression" />` に圧縮)
  - `prototype/src/pages/Dashboard.tsx` (Line 127 注意 strip 内 hedge と Line 341-342 sparkline label hedge を workflow trend section の `<HedgeBanner pageType="workflow-trend" />` に圧縮)
- **Change summary** (3-5 文 + 対応 IA layer 移動): (1) PageHelpDisclosure は title + body 構造、page header 右上に小さな `i` icon button (`本画面の説明`) を置き、default closed / no persistence で展開する。(2) HedgeBanner は該当 section 直上の slate-50 inline strip 1 行、pageType prop で「本 section の数値は [仮説 / 要検証] です」「本 section の KPI 進化要件は Phase 1 で再設定する仮説値です」等を表示する。(3) 個別 KPI card / KRI / sparkline label の反復 caption は削るが、section-level hedge で数値との対応は保持する。(4) KnowledgeBrowser は citation governance 1 sentence (`AI が引用根拠として使えるのは承認済のみ`) を L1 PageHeader subtitle に残置 (規制必須 carve-out)。(5) L1/L2 inline → L4 expand + L2 section-level hedge の 2 段 demotion。
- **Verification** (gate retain + 新規 sub-check):
  - build pass warning 0 / 8 grep gate retain (全 0 hit) / 9 route DOM smoke retain (error 0) / sticky top=56px retain / Chip taxonomy retain / Lighthouse a11y target retain
  - Day 18.5 P0/P1 patch co-exist: 本 patch は PageHeader + framing box + KPI card 内 hedge label のみ touch、Day 18.5 patch (Inbox filter chip / TopBar Notification / sticky scroll shadow / DisabledHint SSOT / row hover token) と co-exist 可能
  - 新規 sub-check: (a) `<PageHelpDisclosure>` が 3 page で defaultOpen={false} で render、(b) `<HedgeBanner>` が Metrics 3 section / AgentSettings 1 section / Dashboard 1 section で数値の近傍に visible、(c) Metrics page で per-card `[仮説 / 要検証]` caption は 0 件、section-level banner は 3 件
  - first-click test (NFC): Metrics page で初見ユーザ ($n=3$ persona = AI 管理者 + 業務責任者 + Auditor) の最初の click が「Hero 4 KPI card 内の特定 KPI」または「KRI grid 内の特定 KRI」(observation primary task)、framing 注 / hedge label への misclick 0%
- **Scope-out**: KPI card click → 詳細 expand (Phase 1)、KRI historical trend (Phase 1)、F-3 SSOT/schema leak (本 Commit 2 で別途)、F-4 footer caption (本 Commit 3 で別途)、F-5 Tier 1 vocab (本 Commit 3 で別途)

### Commit 2 — `chore(day-19-ux): internal SSOT/schema/path leak removal (F-3, P1, NH2 + NH6)`

- **目的**: 9 page で発見した internal SSOT pointer / schema metadata / file path raw leak を JP-localize or 削除、NH2 (user の言葉) + NH6 (recognition over recall) 違反解消
- **判断基準該当**: C1 + C5 + C7
- **Touch files**:
  - `prototype/src/pages/AuditTrail.tsx` (Line 119-121 `15 項目構造 · 関連項目 含む実 18` mono caption 削除、Line 280-282 expand DetailPanel header `DOC-KNW-04 §8.1` reference 削除 (schemaKey row はそのまま keep))
  - `prototype/src/pages/KnowledgeBrowser.tsx` (Line 108-110 `(検証用)` chip 削除、Line 341-344 expand DetailPanel header `DOC-ROOT-_SSOT §1.4` reference 削除)
  - `prototype/src/pages/CaseReview.tsx` (Line 100-115 注意 strip 内 `source: OCR 抽出` / `source: マスタ照合` の `source:` prefix → 削除 (注意 文言 inline で context 自明))
  - `prototype/src/components/case/StagingHintPanel.tsx` (`citation 対象外` → `引用対象外` label)
  - `prototype/src/components/case/CitationPanel.tsx` (citation card 内 `corporate-address-change/ocr-confidence` 内部 path label → 削除 or 「業務手順 - AI 入力指示」JP-friendly に置換)
  - `prototype/src/pages/ProposalReview.tsx` (Line 210 提案差分 `targetFile` mono raw path → mock-proposals.ts に `sectionFriendly` 新 field 追加、UI 側で friendly 表示)
  - `prototype/src/data/mock-proposals.ts` (proposedDiff entries に `sectionFriendly: '法人住所変更 - AI 入力指示'` 等の新 field 追加)
  - `prototype/src/pages/Metrics.tsx` (Line 128-130 `4 KPI 進化判断 目安 + 補助 3 KPI + 9 KRI` self-description mono 削除)
  - `prototype/src/pages/AuditTrail.tsx` (Line 220 行内 `{event.workflowId} {event.workflowVersion}` から `{event.workflowVersion}` `v0.1` 部分削除、または expand panel 内のみ L3 表示)
- **Change summary**: 4 page で 7 種類の internal leak を JP-localize / 削除。L1 PageHeader meta / L1 注意 strip prefix / L1 citation panel path / L3 expand SSOT pointer の 4 surface で「dev metadata の user 露出」を解消。`citation 対象外` → `引用対象外` で JP-only 原則整合。
- **Verification**:
  - build / 8 grep / 9 route DOM smoke / sticky top=56px / Chip taxonomy / Lighthouse a11y retain
  - Day 18.5 patch co-exist
  - 新規 sub-check: (a) `grep -rEn "DOC-" prototype/src/pages` で 0 件 (本来は audit doc trace 用に dev-only annotation で残置可、ただし L1 visible は 0)、(b) `grep -rEn "citation" prototype/src/{pages,components}` で `citation` raw 英語 0 件 (`引用根拠` / `引用対象外` paraphrase 確認)
  - first-click test: AuditTrail page で初見ユーザの click が「特定 event row expand」(primary task)、PageHeader meta への misclick 0%
- **Scope-out**: F-3 完全解消には mock-proposals.ts schema 変更必要、本 patch で同時実施。schemaKey raw display は spec 通り L3 expand 内で keep。

### Commit 3 — `chore(day-19-ux): footer caption + Tier 1 vocab consistency (F-4, F-5, P1, NH4)`

- **目的**: 9 page footer の `次の実装段階で対応` caption 7 種類異 wording を PrototypeModeLabel tooltip 1 行に集約、Tier 1 vocabulary 表記揺れ 3 件 (`承認待ち` vs `承認者承認待ち` vs `業務承認`) を `承認者承認待ち` / `承認者承認: 未提出` に統一
- **判断基準該当**: C2 (規制 Tier 1 保全) + C5 (NH4 Consistency) + C7
- **Touch files**:
  - `prototype/src/components/shared/PrototypeModeLabel.tsx` (Line 50 tooltip 末尾 1 行を「・検索 / 通知 / 一括操作 / フィルタ / 送信 / 承認 / 設定変更 / 監査拡張 / KPI 拡張 / ナレッジ送付 は次の実装段階で対応」に拡張)
  - `prototype/src/pages/Inbox.tsx` (Line 254 footer caption 削除、`<PageFooter caption={...} />` の caption prop 削除)
  - `prototype/src/pages/SendBackComment.tsx` (Line 332 footer caption 削除、DisabledAction caption mode は keep)
  - `prototype/src/pages/ProposalReview.tsx` (Line 321 inline `(承認動作は次の実装段階で対応)` mono 削除)
  - `prototype/src/pages/AgentSettings.tsx` (Line 435 footer caption 削除)
  - `prototype/src/pages/AuditTrail.tsx` (Line 265 footer caption 削除 + DetailPanel 内 `next-impl` note 反復 review)
  - `prototype/src/pages/Metrics.tsx` (Line 494 footer caption 削除)
  - `prototype/src/pages/KnowledgeBrowser.tsx` (Line 326 footer caption 削除)
  - `prototype/src/pages/Dashboard.tsx` (Line 407 footer caption 削除、`業務カード・動線・注意行は画面内モック状態からの集計` 部分は PageHelpDisclosure に統合 or 削除)
  - `prototype/src/pages/Dashboard.tsx` (Line 193 `承認待ち` chip → `承認者承認待ち`)
  - `prototype/src/components/shared/BusinessApprovalChip.tsx` (`業務承認` → `承認者承認` 統一)
- **Change summary**: 9 page で 7 種類 footer caption 削除 (内容は PrototypeModeLabel tooltip 1 surface 集約)、`承認待ち` / `業務承認` を `承認者承認(待ち / 未提出)` に統一。`docs/02-approval-model.md` §2.2 SSOT 整合。
- **Verification**:
  - build / 8 grep / 9 route DOM smoke / sticky top=56px / Chip taxonomy / Lighthouse a11y / Day 18.5 patch co-exist
  - 新規 sub-check: (a) `grep -rEn "次の実装段階で対応" prototype/src` で `PrototypeModeLabel.tsx` 1 hit のみ (他 page 0 hit)、(b) `grep -rEn "承認待ち" prototype/src/pages` で `承認者承認待ち` のみ hit (`承認待ち` 単体 0 hit)、(c) `grep -rEn "業務承認" prototype/src` で BusinessApprovalChip 旧 wording 0 hit
  - first-click test: 9 page footer に 9 種類異 caption が表示されないこと、PrototypeModeLabel hover で tooltip 拡張内容 visible
- **Scope-out**: DisabledAction `reason` prop 内の disabled CTA 個別 reason は Day 18.5 SSOT で keep。

### Commit 4 — `refactor(day-19-ux): ProposalReview 4-col → 2-col + right drawer (F-6, P1, SM1 + STR + PDR)`

- **目的**: Demo Chapter 2 主画面 ProposalReview の 4-col scan 効率を改善、中央 提案差分 hero を 6/12 → 8/12 拡大、右 column RACI + 提案メタ を `<DetailDrawer>` (PDR right-side drawer pattern) で L3 化
- **判断基準該当**: C1 (Hero 強化) + C3 (PDR pattern) + C6 (PROP-2026-031 narrative 保全) + C7
- **Touch files**:
  - `prototype/src/components/shared/DetailDrawer.tsx` (新規、Radix Dialog 流用 or 自前 implementation、`trigger` + `side="right"` + `width="md"` prop)
  - `prototype/src/pages/ProposalReview.tsx` (Line 105-292 grid 構造 grid-cols-12 → grid-cols-{4,8} 2-col、左 4/12 = 判定基準 + 元案件 (未承認ヒントは中央下 inline summary に移動)、中央 8/12 = 提案差分 (現状 6/12 → 8/12)、右 drawer = RACI 5-row + 提案メタ + SoD note (現状 right 3/12 削除))
  - `prototype/src/pages/ProposalReview.tsx` (Line 91-97 `判断根拠は左の判定基準 + 元案件 を参照` meta-explanation 削除、L4 dev noise 解消)
- **Change summary**: 4-col → 2-col + right drawer で scan order が「左 判定基準 + 元案件 → 中央 提案差分 hero → footer CTA」の 3-anchor に整理、Demo Chapter 2 Wow 中核 (中央 提案差分) signal 強化。RACI / SoD は drawer 経由 L3 disclosure、初見 user は drawer 開かなくても primary task (差分 review + 送付 / 差戻し判断) 可能。未承認ヒントは中央下 inline summary に格下げ L2。
- **Verification**:
  - build / 8 grep / 9 route DOM smoke / sticky top=56px / Chip taxonomy / Lighthouse a11y / Day 18.5 patch co-exist
  - 新規 sub-check: (a) DetailDrawer DOM smoke (`role="dialog" aria-modal="false"` + keyboard focus trap + `aria-labelledby` / `aria-describedby`)、(b) 中央 提案差分 width が grid-cols-8 (現 6 から拡大確認)、(c) RACI 5-row が drawer 内のみ visible (default closed)
  - first-click test: ProposalReview page で初見 Manual 管理者 の最初の click が「中央 提案差分 区分」または「右下 提案詳細を見る」(primary task)、左 column 判定基準 single click rate 上昇 → drawer trigger click rate 30%+ (DetailDrawer の dig-into 動線 validity 検証)
- **Scope-out**: DetailDrawer pattern を他 page (CaseReview citation card detail / AuditTrail event detail / KnowledgeBrowser snippet detail) に展開は Phase 1 (本 audit 1 page のみ proof of concept、3 page+ で再利用 検証後に shared 化基準満たす)

### Commit 5 — `chore(day-19-ux): Dashboard + AgentSettings + CaseReview + Inbox P2 cleanup (F-7, F-8, F-9, F-10, P2)`

- **目的**: Dashboard workflow lane 削除 (F-7、Sidebar 重複)、CaseReview footer left explainer 削除 (F-8、NH6)、AgentSettings Hero clutter trim (F-9、4 KPI grid expand 化)、Inbox FilterToolbar 統合 (F-10、6 disabled surface → 1)
- **判断基準該当**: C1 + C4 + C7
- **Touch files**:
  - `prototype/src/pages/Dashboard.tsx` (Line 375-401 業務オペレーション動線 section 削除)
  - `prototype/src/pages/CaseReview.tsx` (Line 195-199 PageFooter left prop 削除、または `入力者確認` 1 chip だけ残す)
  - `prototype/src/pages/AgentSettings.tsx` (Line 149-217 Hero 内 4 KPI grid を `<PageHelpDisclosure>` or `<DetailDisclosure>` (新規) で expand 化、`統制原則` mono caption 削除、Hero 引き上げ申請 disabled CTA 削除)
  - `prototype/src/components/shared/FilterToolbar.tsx` (新規、Inbox filter + sort + bulk 統合) — または既存 FilterChip / DisabledAction の組合せで page-local 統合 (shared 化 3 箇所基準未満なので page-local が経済的)
  - `prototype/src/pages/Inbox.tsx` (Line 117-148 filter row + Line 108-114 sort span + Line 230-256 footer bulk action を 1 つの `<FilterToolbar mode="locked-mvp">` に統合、または explicit `MVP 範囲 — フィルタ拡張は実装段階で` 1 sentence subtitle 化)
- **Change summary**: 4 page で IA Layer L1 → L4 / 削除 の 4 finding を一括処理。Dashboard / Inbox / CaseReview / AgentSettings 各 page の cognitive load 削減、primary action signal 強化。
- **Verification**:
  - build / 8 grep / 9 route DOM smoke / sticky top=56px / Chip taxonomy / Lighthouse a11y / Day 18.5 patch co-exist
  - 新規 sub-check: (a) Dashboard で workflow lane section が DOM 0 件、(b) Inbox で 1 `<FilterToolbar>` または explicit 1 subtitle visible、(c) CaseReview footer left text が `入力者確認:` chip 1 つのみ または完全空
  - first-click test: 各 page の primary action click rate 上昇 (Dashboard 業務 card link / Inbox row click / CaseReview 承認 CTA / AgentSettings footer 変更を申請)
- **Scope-out**: Tool entries L3 expand (P2、本 commit 5 で AgentSettings Hero 主体に集中)、radio description trim (P2、Phase 1 で)

### Commit 6 (optional) — `chore(day-19-ux): docs/03 / Day 18.5 audit location reconciliation (CR-6)`

- **目的**: audit prompt の `docs/03 SSOT loss` 前提と current HEAD の実態差分を閉じ、Day 19 SSOT refresh 時に UI design SSOT と audit archive の置き場所を混同しない
- **判断基準該当**: C7 (audit framework SSOT integrity)
- **Touch files**:
  - `docs/03-ui-prototype-design.md` — current HEAD で UI design SSOT が残っていることを確認し、必要なら Day 19 patch 後に追記対象を明確化
  - `prototype/audit-bundle/2026-05-23-day-18-5/docs-03-day-18-5-snapshot.md` — Day 18.5 audit snapshot として archive 位置を維持するか、`docs/audits/day-18-5-micro-interaction-audit.md` へ copy/move するかを決める
  - `docs/_SSOT.md` / `docs/_PROGRESS.md` — Day 18.5 audit と Day 19 audit report の参照先を current repo state に合わせて明記
- **Change summary**: current HEAD では blind restore を行わず、UI design SSOT (`docs/03`) と audit artifact (`docs/audits/` または `prototype/audit-bundle/`) を分離する。もし別 branch で本当に `docs/03` が audit content に置換されている場合だけ、A 案として git history から復元する。
- **Verification**:
  - current HEAD: `docs/03-ui-prototype-design.md:1-22` が UI design SSOT のまま、Day 18.5 audit snapshot は audit archive として参照可能
  - alternate branch only: `docs/03-ui-prototype-design.md` が audit content に置換されている場合は復元後に UI design SSOT header + §1 概要が visible
- **Scope-out**: Day 19 findings を docs/03 に先回りで統合しない。実装 patch 適用後に SSOT refresh として別 commit。

### Day 18.5 P0/P1 patch co-exist 確認

本 audit の 6 commit は Day 18.5 既決定 P0 2 (Inbox filter chip / TopBar Notification) + P1 3 (sticky scroll shadow / DisabledHint SSOT / row hover token) と完全に直交、同 day 19 内に both apply 可能:

- Day 18.5 Inbox filter chip patch (`<button disabled>` 化) → 本 audit Commit 5 F-10 (FilterToolbar 統合) と co-exist (button disabled state + footer caption 統合は別 surface)
- Day 18.5 TopBar Notification disabled → 本 audit Commit 1-5 で TopBar touch なし、co-exist
- Day 18.5 sticky scroll shadow → 本 audit Commit 1-5 で PageHeader sticky 構造 keep、shadow 適用 co-exist
- Day 18.5 DisabledHint SSOT (DisabledAction shared component) → 本 audit Commit 3 F-4 footer caption 削除と co-exist (DisabledAction の reason prop は keep、footer caption 別 surface)
- Day 18.5 row hover token → 本 audit Commit 1-5 で row hover touch なし、co-exist

---

## 8. Verification Gates Retain Check

| # | Gate | 本 patch 適用後の retain 確認 | Day 18.5 patch co-exist |
| - | ---- | ---------------------------- | ----------------------- |
| 1 | build warning 0 | pass (各 commit 後 `pnpm build` warning 0 期待) | OK |
| 2 | 8 grep gate 0 hit (hex / non-mono text-px / inline style / stale term / palette / severity / 旧 case path / outer max-w) | pass (本 audit fix は token system / register に touch なし) | OK |
| 3 | 9 route DOM smoke error 0 | pass (新 component PageHelpDisclosure + HedgeBanner + DetailDrawer + FilterToolbar 各 stable a11y) | OK |
| 4 | Sticky top=56px | pass (PageHeader 構造 keep、HedgeBanner は PageHeader 直下の inline strip、top 距離不変) | OK |
| 5 | Chip taxonomy retain | pass (StatusBadge / FilterChip / MetaChip 3 系統 touch なし) | OK |
| 6 | Lighthouse a11y target retain | pass (PageHelpDisclosure に `aria-expanded` + `aria-controls`、HedgeBanner に `role="status"`、DetailDrawer に `role="dialog" aria-modal="false"` 等 a11y attribute 完備) | OK |
| 7 | Keyboard focus | pass (PageHelpDisclosure / DetailDrawer は keyboard accessible、Tab order 維持) | OK |
| 8 | Day 18.5 P0 2 + P1 3 patch | co-exist (§7 末尾 co-exist 確認済) | OK |
| 9 | First-click test (NFC) — 該当 page で初見ユーザが最初に押すべき操作を 1 つ言えるか | 本 audit P0/P1 patch 適用 page (Dashboard / Inbox / CaseReview / SendBackComment / ProposalReview / AgentSettings / AuditTrail / Metrics / KnowledgeBrowser) で primary action 識別率 80%+ 期待 | — |
| 10 | enabled no-op audit (本 patch 適用後の sweep) | 0 hit (本 audit 6 commit は enabled no-op 追加なし、Day 18.5 patch SSOT 維持) | — |
| 11 | text density audit (CR-4 11 targets verify) | rule 通り (footer caption 9 page → 1 surface、hedge 25+ → section-level 5 surface 程度、framing 注 3 page → expand) | — |
| 12 | internal vocabulary leakage grep (CR-5、component 名 / DOC-* / SSOT / schema key / snake_case) | 0 hit (Commit 2 で `DOC-` / `_SSOT` / raw path / `citation` / `(検証用)` L1 visible 削除、L3 expand 内 snake_case schemaKey は spec 通り keep) | — |
| 13 | JP-only user-facing copy check | pass (`citation 対象外` → `引用対象外` で JP-only 復元、Tier 3 規制語 leak 0、技術固有名詞 React / Vite / Tailwind / AI / PDF / OCR / API / SLO / KPI のみ allow) | — |
| 14 | `[仮説 / 要検証]` の表示箇所数 + 統合方針 (CR-4 target 2) | rule 通り (Metrics page で 16+ → Hero KPI / 補助 KPI / KRI の 3 section-level HedgeBanner、Dashboard 4 → 1 section-level HedgeBanner、AgentSettings 4 → 1 section-level HedgeBanner) | — |
| 15 | 本 audit 新規 sub-check (P0/P1 finding 由来、独立 grep gate 化禁止) | pass (各 commit verification の 新規 sub-check は 9 route DOM smoke の sub-check として実施、独立 grep gate 昇格なし) | — |

---

## 9. Audit Closing Notes + Reviewer-back Questions

### Closing notes

- 本 audit は **static frame review + source code direct read** であり、scroll 中の sticky shadow / hover 連鎖 / focus 連鎖 / chevron rotation / ConfidenceBar transition は Day 18.5 scope。本 audit はそれらに findings を出していない (Commit 1-5 で同 surface に追加 motion を提案していない)
- mock data 由来 finding は UI primitive 由来 finding と commit 分離 (Commit 2 で mock-proposals.ts schema 追加、Commit 5 で mock-agents.ts description trim 候補)
- **docs/03 SSOT loss (CR-6) は prompt premise と current HEAD で不一致**。current HEAD では UI design SSOT が存在するため、Day 19 patch blocker ではなく、Commit 6 optional は reconciliation として扱う
- 本 audit の改善 plan は Day 18.5 P0/P1 patch と co-exist 可能な形で plan、両 patch を同 day 19 内に apply 可能 (§7 末尾 co-exist 確認済)
- 本 audit の最大 fix 集中 page は **Metrics** (F-1 + F-2 + F-3 + F-4 が同 page 集中)、次点が **AuditTrail / KnowledgeBrowser / ProposalReview**
- 本 audit の P0 2 件 (F-1 framing 注 + F-2 hedge over-display) は **Operational Premium Light の "restrained Stripe-like" core principle と整合**、Stripe Dashboard restraint (5-9 core elements / 北極星 metric 前面化) の SSOT 引用で正当化可能

### Reviewer-back questions (最大 5 個、実装に入る前に user / maintainer に確認すべき未確認事項)

1. **PageHelpDisclosure の defaultOpen state 戦略**: `永続化なし` 原則を守るため default closed / no persistence で固定してよいか、それとも明示的な in-memory beginner mode を設けるか?(F-1 関連、Commit 1)
2. **HedgeBanner の page-level 集約は KnowledgeBrowser の citation governance carve-out との両立で OK か**: 本 audit は KnowledgeBrowser の `AI が引用根拠として使えるのは承認済のみ` 1 sentence を L1 subtitle に残置推奨、これと HedgeBanner banner 並存で「Hero subtitle 2 行」になる risk あり (F-1 + F-2 関連、Commit 1)
3. **ProposalReview DetailDrawer は 1 page のみ proof of concept で経済性に見合うか**: shared 化基準 (3 箇所 + prop ≤ 3 + net 行数減少) 未満だが、Demo Chapter 2 主画面の改善で justify、他 page (CaseReview / AuditTrail / KnowledgeBrowser) の disclosure pattern 統一は Phase 1 で?(F-6 関連、Commit 4)
4. **Tier 1 vocab 統一は `業務承認` → `承認者承認` で本当に SSOT に整合か**: `docs/02-approval-model.md` §2.2 で `承認者承認` が SSOT、ただし「業務承認」は legacy 表現として残置可能性あり、本 audit fix で全削除して良いか?(F-5 関連、Commit 3)
5. **docs/03 SSOT loss premise の確認**: current HEAD では `docs/03-ui-prototype-design.md` が UI design SSOT として残っているため、CR-6 は復旧ではなく audit archive の配置整理で進めてよいか?(CR-6 関連、Commit 6)

### Audit receiver self-check (23/23)

| # | Self-check | Result |
| - | ---------- | ------ |
| 1 | SSOT files (§3.5) 18 件を全 read 済み (§0 9 reference 含む) | yes |
| 2 | 9 page source + 9 screenshot を全 read 済み | yes |
| 3 | Day 18.5 audit / Day 14-15 inventory を re-audit していない | yes |
| 4 | 8 軸 × 9 page = 72 cell の coverage matrix を埋めた | yes |
| 5 | 各 finding が file:line / screenshot / mock data / DOM / Heuristic ID のいずれかで evidence cite | yes |
| 6 | 5-level verdict (Keep/Tune/Add/Defer/Drop) を 1 finding 1 verdict で分離 | yes |
| 7 | P0/P1/P2/Defer/Drop を混在させていない | yes |
| 8 | 改善 plan の各 commit が §3.6 8 gate retain | yes |
| 9 | 改善 plan の各 commit が Day 18.5 P0/P1 patch と co-exist 可能 | yes |
| 10 | 9 route 厳守 (新 route 提案なし) | yes |
| 11 | 装飾追加 (motion / glow / gradient mesh / glassmorphism 等) を提案していない | yes |
| 12 | enabled no-op を増やす提案をしていない | yes |
| 13 | Tier 3 規制語の事実主張を audit 出力に含めていない | yes |
| 14 | JP-only 原則を破る wording 提案を含めていない | yes |
| 15 | Mock 修正と UI 修正を commit 分離している | yes |
| 16 | Demo narrative (CASE-2026-0142 / PROP-2026-031) integrity を破壊する mock trim を提案していない | yes |
| 17 | docs/03 / Day 18.5 audit location reconciliation 優先度に対する立場を CR-6 で表明している | yes |
| 18 | inference / observed / mock data 由来を明示している | yes |
| 19 | §0 Industry Pattern Reference 9 件 (NH/SM/NPD/K5S/NFC/TUF/STR/DAT/PDR) を reference index + findings + per-screen で明示引用している | yes |
| 20 | §5 IA Layer Plan (L1-L4) を 9 page 全部埋め、CR-2 IA Refactor + CR-7 E2E flow walk と整合している | yes |
| 21 | §9 Reviewer-back questions 最大 5 個を closing で出力している | yes |
| 22 | §1 Judgement Criteria を §3 Top Findings の前に 5-7 個明示し、Top Findings 群が criteria に該当することを cross-check 済み | yes |
| 23 | CR-4 Copy Reduction 11 verbatim targets を全 cover している | yes |

End of audit.
