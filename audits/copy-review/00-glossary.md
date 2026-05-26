# 00-glossary — Backoffice AI v2 Copy Inventory (Step 1)

| 項目 | 値 |
| --- | --- |
| 文書 ID | WORKING-COPY-REVIEW-00-GLOSSARY |
| 文書名 | Copy Review Inventory (Step 1 mechanical extraction、Step 2-3 audit の input baseline) |
| 版数 | v1.0 |
| 抽出日 | 2026-05-25 |
| Scope | `prototype/src/{pages,components,data,lib,App.tsx}` の全 user-facing text + identifier/component/governance leak grep |
| 抽出方法 | rg `[ぁ-んァ-ヶ一-龥]` pattern + JSX text node `>...<` + string literal (`'...'` / `"..."`) + 必要箇所のみ Read |
| 判断保留 | 本 step は **mechanical only**、judgement は Step 2 以降 (`_persona.md` §4 verdict matrix 適用) |
| 関連 | `_persona.md` v0.3 / `prototype/CLAUDE.md` / `docs/03-ui-prototype-design.md` |

---

## §A. Cross-screen heading & navigation

### A.1 Sidebar nav (`components/shell/Sidebar.tsx:39-46`)

| Route | Label (JP) | Icon | activePrefix |
| --- | --- | --- | --- |
| `/dashboard` | ダッシュボード | LayoutDashboard | — |
| `/inbox` | 受信トレイ | InboxIcon | — |
| `/inbox` | 案件処理 | FileText | `/cases/` |
| `/proposals/PROP-2026-031` | AI 提案レビュー | Sparkles | `/proposals/` |
| `/agents/agent-corporate-address-change` | Agent 設定 | Cog | `/agents/` |
| `/audit` | 監査証跡 | ShieldCheck | — |
| `/metrics` | メトリクス | Gauge | — |
| `/knowledge` | ナレッジ | BookOpen | — |

(8 entries + Dashboard root、`receivetray + 案件処理` は同 `/inbox` を 2 entry に分割)

### A.2 User chip (`Sidebar.tsx:103-107`)

- 「山田 太郎」(11px primary) + 「入力者」(10px caption)

### A.3 Breadcrumb (各 page で実装、3-segment pattern)

| Page | Breadcrumb |
| --- | --- |
| Dashboard | `ダッシュボード` |
| Inbox | `受信トレイ` |
| CaseReview | `受信トレイ › 案件処理 › {case_id}` |
| SendBackComment | `受信トレイ › 案件処理 › {case_id} › 差戻しコメント` |
| ProposalReview | `受信トレイ › AI 提案レビュー › {proposal_id}` |
| AgentSettings | `Agent 設定` |
| AuditTrail | `監査証跡` |
| Metrics | `メトリクス` |
| KnowledgeBrowser | `ナレッジ` |

### A.4 Page H1 (`prototype/CLAUDE.md` PageHeader 規範)

| Page | H1 |
| --- | --- |
| Dashboard | `ダッシュボード` |
| Inbox | `受信トレイ` |
| CaseReview | `{c.id} {c.workflowName}` (例: `CASE-2026-0142 法人住所変更`) |
| SendBackComment | `{c.id} 差戻しコメント` |
| ProposalReview | h1 = proposal title (例: `OCR 信頼度閾値の段階引き上げ提案 (0.85 → 0.88)`) |
| AgentSettings | `Agent 設定` |
| AuditTrail | `監査証跡` |
| Metrics | `メトリクス` |
| KnowledgeBrowser | `ナレッジ` |

### A.5 PrototypeModeLabel (`components/shared/PrototypeModeLabel.tsx`)

- Pill: 「プロトタイプ表示 — 外部システム未接続 / 証跡はモック」
- Tooltip 6 行: 「本プロトタイプはメモリ上のモック状態です。」+ 5 bullet (永続化なし / 外部システム未接続 / 実顧客データ未使用 / 実規制の引用なし / 検索 / 通知 / 一括操作 / フィルタ等の機能は次の実装段階で対応)

---

## §B. Per-screen text inventory (要点のみ、line 出典つき)

### B.1 Dashboard (`pages/Dashboard.tsx`)

- Heading: 「ダッシュボード」(L183)
- Sub: HypothesisChip 「推移・SLA 閾値は [仮説 / 要検証]」(L211)
- 業務カード state label (L72-106、conditional): `静穏` / `通常稼働` / `要注意`
- 業務カード列: workflow name (`法人住所変更` / `口座開設書類完備`)、status 内訳 (`AI 処理中` / `入力者確認待ち` / `再処理中` / `承認者承認待ち` / `反映済`、L340-358)、`注意` (L310)
- NextActionStrip (L220): label「次に処理すべき案件」
- Action card (L159-163): `受信トレイ` / `案件レビュー` / `コメント付き差戻し` / `AI 提案レビュー` / `メトリクス確認`
- Footer caption: 「業務カード・動線・注意行は画面内モック状態からの集計。検証用 KPI 表示の拡張を予定。」(L431)

### B.2 Inbox (`pages/Inbox.tsx`)

- Heading: 「受信トレイ」(L119)
- Workflow filter label: `すべて` (L90、空 filter)、業務名展開時 `法人住所変更` / `口座開設書類完備`
- Filter chip set (L97-101): `業務` / `状態` / `担当者` / `経過時間` (4 chip、すべて `すべて` value)
- Filter chip aria-label: `filter 解除` (L149)
- NextActionStrip label: 「次に処理すべき案件」(L169)
- Table headers (L181-186): `案件 ID` / `業務` / `状態` / `経過` / `担当者` / `注意`
- Table header aria-label: `開く` (L187)
- Bulk action DisabledAction reason: 「一括承認動作は次の実装段階で対応」(L260) / 「一括差戻し動作は次の実装段階で対応」(L268)
- Drawer sections (L302, L331): 「主要項目 (先頭 3 件)」 / 「引用根拠」
- Drawer citation count (L332): `{count} 件 (承認済ナレッジ)`

### B.3 CaseReview (`pages/CaseReview.tsx`)

- Breadcrumb: `受信トレイ › 案件処理 › {case_id}` (L73-75)
- H1: `{c.id} {c.workflowName}` (例: `CASE-2026-0142 法人住所変更`)
- NextActionStrip label: 「判定要約」(L99)
- AI proposal section (L163, 176-177): heading 「AI 入力結果」、aria/title 「AI 提案」
- Citation panel heading (component): 「引用根拠 — 承認済みナレッジのみ」 + 件数
- Staging hint panel heading (component): 「未承認ヒント (引用根拠 対象外、{count} 件)」 + 末尾注「※ 本セクションは未承認の参考情報です。AI の正式実行根拠 (引用根拠) ではなく、確認者のヒントとしてのみ使用してください。」
- RelatedRuleAlert text: 「関連手順が更新されています」 + 「— {count} 件の手順更新 — 最新: {ruleName}」 + link 「更新内容を見る」

### B.4 SendBackComment (`pages/SendBackComment.tsx`)

- Breadcrumb: `... › 差戻しコメント` (L84)
- Section meta: 「5 分類」 mono badge (L158)
- Radio legend (sr-only): 「差戻し分類を選択」(L161)
- Category 例見出し button title: 「例を見る」(L205)
- Textarea placeholder: 「例: 福岡支店の住所マスタが旧形式 (- を含む) のため、新形式 (空白区切り) への正規化が必要です。」(L257)
- data_error warning (L227): 「入力誤りは AI の学習対象になりません」(+ 説明: 「AI 責ではない判定、log / audit / 別 routing に回ります」per `pages/SendBackComment.tsx:29` 内 comment)
- DisabledAction reason: 「差戻し理由を記録し AI 日次分析に反映 (動作は次の実装段階で対応)」(L338)

### B.5 ProposalReview (`pages/ProposalReview.tsx`)

- Breadcrumb: `受信トレイ › AI 提案レビュー` (L76-78)
- NextActionStrip label: 「提案要約」(L115)
- Section heads (L102, L127, L151, L181, L227, L307): 「判定基準」 / 「元 案件」 / 「未承認ヒント」 / 「· 文書テキスト差分 (住所の行内差分とは別)」 / 「提案メタ情報」
- 「· 判断根拠は左の判定基準 + 元案件 を参照」 (L102 sub-caption)
- Element title attrs (L166, L268): 「差戻し分類 (同種傾向の根拠)」 / 「提案詳細 (RACI + メタ情報)」
- DetailDrawer RACI labels (L279, L283, L288, L293, L297): `提案ソース` / `R · 整理担当` / `A · 承認` / `C · 相談` / `I · 情報共有`
- Meta dt (L310, L314, L318, L322): `提案 ID` / `業務` / `生成日時` / `経過`
- DisabledAction reason: 「差戻し動作は次の実装段階で対応 (差戻し理由をコメント付きで AI 日次分析にフィードバック)」(L344)

### B.6 AgentSettings (`pages/AgentSettings.tsx`)

- Breadcrumb: `Agent 設定` (L126)
- Disclosure header: 「4 KPI 進化要件」(L182) + HypothesisChip「4 KPI 全て [仮説 / 要検証]」
- Type A description (L67-69): 「既存 prompt の信頼度閾値調整、新規 tool 追加なし、Trust Level 不変」 / approvers「AI 管理者 (起票 ≠ 承認 SoD 強制)、別 AI 管理者または fallback で業務責任者 co-A」 / rule「判定ルール例: model / prompt 変更 + Trust Level 不変 → Type A」
- Type B (L74, 76-78): title「外部 AI サービス 追加 (個人情報アクセス範囲の拡張)」、approvers「AI 管理者 + 情報管理責任者 + リスク確認担当 の co-A 必須」、rule「判定ルール例: 外部 AI サービス追加 + 権限拡張 → Type B」
- Type C (L83, 85-87): title「Trust Level Supervised → Checkpoint 引き上げ」、approvers「AI 管理者 + 業務責任者 (業務リスク受容) の co-A 必須」
- Section nav heading「権限 / 範囲」(L269) + 5 領域 badge (L219)
- 「Type C 設定承認 (AI 管理者 + 業務責任者 co-A 必須) で判定されます。」(L201)
- DisabledAction reason: 「設定変更を Type A/B/C 区分で申請 (動作は次の実装段階で対応)」(L413)

### B.7 AuditTrail (`pages/AuditTrail.tsx`)

- Breadcrumb / H1: `監査証跡` (L115, L119)
- 業務 filter label「業務:」(L127) + workflow map (`UC-BO-01` → 「法人住所変更」 / `UC-BO-02` → 「口座開設書類完備」、L50-51) + `すべて` → 「全業務」(L130)
- Time filter MetaChip: 「直近 30 日 (検証用)」(L120)
- PageHelp Disclosure: 「本画面の説明」(L150)
- Event type label map (L55-64): `system_intake`→「PDF 受付」、`ai_input`→「AI 入力」、`human_review`→「入力者確認」、`human_sendback`→「入力者差戻し」、`ai_analysis`→「AI 日次分析」、`proposal_approve`→「手順承認」、`business_approve`→「承認者承認」、`reflect`→「反映」、`rule_update_alert`→「関連ルール更新」、`config_approve`→「設定承認」
- Detail panel DetailRow labels (L278-380): `案件 ID` / `業務` / `Prompt 設定 版数` / `Tool 設定 版数` / `Model 設定 版数` / `入力 PDF ハッシュ` / `AI 提案 ID` / `人手判断 ID` / `差戻し分類` / `承認済ナレッジ 参照 ID` / `承認時刻 + 承認者` / `反映差分 ID` / `ロールバック参照` / `操作画面記録 ID`
- schemaKey (sub-caption): `case_id` / `workflow_id` / `prompt_config_version` / `tool_config_version` / `model_config_version` / `input_artifact_hash` / `ai_proposal_id` / `human_decision_id` / `sendback_category` / `compiled_knowledge_citation_ids` / `approval_timestamp + approver_id` / `diff_id` / `rollback_ref` / `screenshot_stack_id` (R46 paradigm = JP primary + snake_case sub-caption)
- Internal-detail note (L296, L304, L312, L348, L364, L372, L380): 「次の実装段階で実装予定 (検証用項目)」 / 「検証用項目」 / 「関連画面への遷移は次の実装段階で対応」 / 「緊急時 段階の強制引き下げ、本 v2 では次の実装段階で対応」 / 「操作画面記録、次の実装段階で対応」

### B.8 Metrics (`pages/Metrics.tsx`)

- Breadcrumb / H1: `メトリクス` (L122, L126)
- Hedge intro (L144): 「`[仮説 / 要検証]` です」
- HypothesisChip (L196, L352): 「4 KPI 全て [仮説 / 要検証]」 / 「9 KRI 全て [仮説 / 要検証]」
- Workflow filter map (L44-45): `UC-BO-01`→「法人住所変更」、`UC-BO-02`→「口座開設書類完備」 + `全業務` (L415, L422)
- KRI state labels (L53-63): `正常` / `注意` / `警告`
- 4 KPI cards (mock-metrics.ts K1-K4): 「AI 入力承認率」 (target ≥ 99%、current 98.4%) / 「人手上書き率」 (≤ 1%、1.2%) / 「Alert 発生率」 (≤ 5%、4.7%) / 「承認者差戻し率」 (≤ 1%、0.8%)
- 7 KPI 補助 (K5-K7): 「案件平均処理時間」 / 「手順承認 昇格成功率」 / 「未承認ナレッジ整理時間」
- 9 KRI catalogue (R1-R9): 「AI 入力承認率 推移悪化」 / 「人手上書き率 急増」 / 「Alert 誤検知 急増」 / 「承認者差戻し率 急上昇」 / 「UI 変更 検知」 / 「承認済 / 未承認 ナレッジの 矛盾」 / 「同種差戻し 再発頻度」 / 「Agent 版数 旧版発生」 / 「データ品質 低下」

### B.9 KnowledgeBrowser (`pages/KnowledgeBrowser.tsx`)

- Breadcrumb / H1: `ナレッジ` (L104, L108)
- MetaChip (L109): 「全期間 (検証用)」
- 業務 filter (L115) + 「全業務」 / 「全分類」 (L163) / 「全段階」 (L193)
- Filter section headers (L161, L191): 「分類:」 / 「重要度:」 + 5 分類 / 3 段階
- data_error filter disabled title (L181): 「入力誤りは個別差戻し時に処理するため、本一覧の対象外」
- Citation note (L387-388): conditional weight==='high' → 「AI の引用根拠として使用可」 / else → 「AI の引用根拠 対象外 (未承認ヒントとしては可視)」
- DetailRow labels (L358-401): `ナレッジ ID` / `記録日` / `業務` / `元 案件` / `分類` / `重要度` / `ファイル` / 「本文」
- DetailRow note (L374, 392): 「関連画面への遷移は次の実装段階で対応」

---

## §C. Mock data natural language inventory

### C.1 mock-cases.ts (14 records)

- **case_id**: `CASE-2026-{0095, 0118, 0142-0152}` (年-連番 4 桁 / 一意 / mono font 表示前提)
- **法人名 (5 種、サンプル prefix 統一)**: 「株式会社サンプルホールディングス」「株式会社サンプル商事」「株式会社サンプルテックパートナーズ」「株式会社サンプル中央エンタープライズ」+ 各 case 担当者名
- **住所表記 (5 example)**: 「東京都千代田区丸の内 1 丁目 1 番 1 号 サンプルビル 8F」「東京都千代田区丸の内 2 丁目 3 番 5 号 サンプルビル 8F」「東京都品川区東品川 2 丁目 5 番 8 号 テストプラザ 12F」「東京都中央区日本橋本町 3 丁目 廣業ビル 5F」(全角半角混在、丁目/番/号 完全表記)
- **担当者 (assignee) 14 例**: 田中 美咲 / 鈴木 健一 / 佐藤 隆 / 高橋 美穂 / 伊藤 翔 / 渡辺 真理 / 山本 直樹 / 中村 葵 / 小林 拓海 / 加藤 千夏 (姓+名 半角 space)
- **status / statusLabel** (5 種): `pending`→「AI 処理中」 / `ready`→「入力者確認待ち」 / `sent-back`→「再処理中」 / `business-approval-waiting`→「承認者承認待ち」 / `reflected`→「反映済」
- **businessApprovalStatus** (4 種): 「未送付」 / 「差戻し」 / 「承認待ち」 / 「承認済」
- **currentStep** (CaseLifecycleStep): `受付` / `AI処理` / `入力者確認` / `承認者承認` / `反映` (5 段)
- **field labels**: `法人名` / `旧住所` / `新住所` / `支店コード` / `効力発生日` / `代表者` / `印鑑届出`
- **alert messages** (caution、6 例): 「OCR 信頼度が閾値 (0.85) を下回りました — 新住所の番地表記をご確認ください」 / 「住所マスタ照合: 都道府県マスタに該当エントリがありません — 手動確認推奨」 / 「印鑑照合 信頼度 0.78 — 手動確認推奨」 / 「法人格表記が登記簿と差異あり — 再確認後 AI 再処理中」 / 「本人確認書類 2 点目が未受領 — 補完依頼が必要」 / 「本店所在地と支店マスタ紐付け未確認」
- **evidence step names**: `受付` / `OCR 抽出` / `マスタ照合` / `AI 入力結果生成`
- **evidence thumbnailLabel**: `PDF` / `IMG` / `DB` / `AI`
- **citation titles**: 「OCR 信頼度閾値 0.85 — 手動 review 要求」 / 「多店舗法人の住所変更 — 全店舗一括処理」 / 「法人格変更を伴う住所変更 — 別 workflow 移行」
- **stagingHint titles**: 「福岡支店の住所マスタが旧形式」 / 「国外住所の郵便番号フォーマット」
- **relatedRuleName**: 「OCR 信頼度閾値の段階引き上げ (0.80 → 0.85)」
- **timestamps**: `2026-05-31 09:00:14` 形式 (YYYY-MM-DD HH:mm:ss)、TZ 明示なし

### C.2 mock-proposals.ts (1 record PROP-2026-031)

- proposalTitle: 「OCR 信頼度閾値の段階引き上げ提案 (0.85 → 0.88)」
- statusLabel: 「手順管理者の整理待ち」 (status `pending-triage`)
- summary: 「OCR 信頼度 0.85-0.88 範囲で人手上書き率が高い (12 件中 9 件)。現行閾値 0.85 → 0.88 に引き上げ、0.85-0.88 範囲を人手確認に回す手順変更を提案。」
- decisionCriteria labels: 「同種差戻し件数」 / 「共通 pattern 一致度」 / 「staging 内部矛盾」 + threshold「3 件以上 [仮説 / 要検証]」「0.70 以上 [仮説 / 要検証]」「矛盾なし」
- sourceCases title 例: 「法人住所変更 (千代田区サンプルビル)」 / 「(品川区テストプラザ)」 / 「(中央区サンプルセンター)」 + sendbackReason 例: 「OCR 信頼度 0.86 で新住所の番地表記を誤抽出、入力者が手動修正」
- stagingSnippet titles: 「福岡支店の住所マスタが旧形式」 / 「OCR 信頼度 0.85-0.88 帯の建物名誤認識」 / 「旧字体住所の OCR 信頼度低下」
- proposedDiff sections: 「§3.2 OCR 信頼度判定」 / 「§2.1 自動補完条件」 + before/after 自然文 「AI 抽出後に信頼度が 0.85 以上の場合、確認なしで自動補完を完了する [仮説 / 要検証]。」
- raci: `proposalSource`「AI (日次分析)」、`r`「手順管理者 (整理担当)」、`a`「業務責任者」、`c`「SME (法人事務 SME)」「AI 管理者」、`i`「入力者」「承認者」
- queueOwner「高橋 美穂」 / approver「渡辺 真理」 (mock-cases.ts の担当者集合と整合、SoD demo)

### C.3 mock-knowledge.ts (10 snippets、UC-BO-01: 5 + UC-BO-02: 3 + staging 2)

- **compiled (weight: high) titles**: 「OCR 信頼度閾値 0.85 — 手動確認 要求」 / 「多店舗法人の住所変更 — 全店舗一括処理」 / 「法人格変更を伴う住所変更 — 別業務へ移行」 / 「印鑑照合 信頼度閾値 0.90 — 手動確認 要求」 / 「法人口座 + 個人口座 同時開設 — 別業務へ分離」
- **staging (weight: medium/low) titles**: 「福岡支店の住所マスタが旧形式」 / 「国外住所の郵便番号フォーマット」 / 「新フォーム (2026-05 改訂) の印鑑欄 表示構成」
- **bodies (1-2 文 / 句点終止 / 敬体不使用 / 言い切り型)**: 例「OCR 信頼度が 0.85 を下回る案件は AI 自動化対象外とし、入力者の手動確認を要求する。閾値以上の案件は通常フロー。」、「2026-05 改訂の口座開設新フォームでは印鑑欄が右下から左下に移動。OCR の照合座標 更新が必要。確認済 (未承認)、手順承認待ち。」
- **agentVersion 表記**: `v0.1` / `v0.0` (semver-like)
- **date**: `2026-04-18` 形式 (YYYY-MM-DD)

### C.4 mock-agents.ts (2 agents UC-BO-01 + UC-BO-02)

- agent names: 「法人住所変更 Agent」 / 「口座開設書類完備 Agent」 (suffix `Agent` 英語残り、L58, L115)
- modelLabel: 「AI ベースモデル A (検証用)」 (technical name 抽象化)
- promptSummary: 「OCR 抽出 + 住所マスタ照合 + 信頼度 0.85 閾値 + 境界判定」 / 「口座開設書類の OCR 抽出 + 印鑑照合 + 本人確認書類 2 点完備チェック + 有効期限確認」
- tools (3 + 3): 「OCR 抽出」 / 「住所マスタ照合」 / 「未承認ナレッジ参照」 (UC-BO-01) + 「OCR 抽出」 / 「印鑑照合」 / 「本人確認書類チェック」 (UC-BO-02)
- tool descriptions 例: 「PDF → テキスト抽出 (信頼度 0.85 閾値、未達時は 注意 を発する)」 / 「未承認のナレッジを プロンプトに付加 (引用根拠としては使わない)」
- permissions dataScope: 「UC-BO-01 法人住所変更 内の個別顧客データ (閲覧のみ)」
- permissions boundary: 「通常 AI 自動化対象、Trust Level Supervised で全件確認」 (Tier 2 `Trust Level Supervised` 英語残り)
- changeHistory summary 例: 「Prompt v0.0 → v0.1: OCR 信頼度閾値 0.80 → 0.85 引き上げ」 / 「Trust Level Supervised 確立 (初回設定、自動化段階の初期設定)」 (Tier 2 英語残り)
- approver 形式: 「佐藤 隆 (AI 管理者)」「渡辺 真理 (業務責任者) + 佐藤 隆 (AI 管理者)」(姓名 + 役職 半角括弧)

### C.5 mock-audit.ts (13 events、3 caseId)

- actorLabel 例: 「システム」 / 「AI 入力」 / 「AI 日次分析」 / 「田中 美咲 (入力者)」 / 「渡辺 真理 (業務責任者)」 / 「山本 直樹 (承認者)」
- summary 例: 「PDF 受付 (法人住所変更届)」 / 「AI 入力結果 生成 (信頼度 0.87)」 / 「入力者差戻し (誤読、住所マスタ照合の方向誤認)」 / 「未承認ナレッジ 候補生成 (同種 差戻し 3 件を集約、住所マスタ照合 方向修正案)」 / 「手順承認 (AI 提案 PROP-2026-031 を 承認済ナレッジ へ昇格)」 / 「2026-05-17 に 住所マスタ照合 v0.2 が承認されました (本案件の処理時の版は当時のまま 監査証跡 に保持)」 / 「承認者承認 (案件処理 完了)」 / 「反映 (基幹システム へ住所更新を反映、案件 完了)」
- inputArtifactHash 表示: `sha256:abc123def456789...` (実 hash 偽装、`sha256:` prefix + ellipsis truncation)
- diffId / proposalId / decisionId 形式: `DIFF-2026-005` / `PROP-2026-031` / `HD-2026-0118-01`

### C.6 mock-metrics.ts (4 KPI + 3 補助 KPI + 9 KRI)

- KPI names: 「AI 入力承認率」 / 「人手上書き率」 / 「Alert 発生率」 / 「承認者差戻し率」 / 「案件平均処理時間」 / 「手順承認 昇格成功率」 / 「未承認ナレッジ整理時間」
- KPI status: すべて `'仮説 / 要検証'` (literal type、表示時 `[仮説 / 要検証]` mono badge)
- KRI 9 entries (R1-R9): 「AI 入力承認率 推移悪化」 / 「人手上書き率 急増」 / 「Alert 誤検知 急増」 / 「承認者差戻し率 急上昇」 / 「UI 変更 検知」 / 「承認済 / 未承認 ナレッジの 矛盾」 / 「同種差戻し 再発頻度」 / 「Agent 版数 旧版発生」 / 「データ品質 低下」
- KRI triggerCondition 例: 「週次平均が 目標仮説 (≥ 99%) を 2 週連続 下回り」 / 「同一案件 ID で 2 回以上 差戻し」
- KRI responseAction 例: 「手順管理者 へ通知、AI 管理者 が確認」 / 「手順管理者 + AI 管理者 通知」 / 「段階の強制引き下げ を検討」
- KRI state: `正常` / `注意` / `警告` (3 段、Metrics.tsx L53-63 で localized、現 mock では R3 のみ `caution`)

---

## §D. Label maps (baseline = cross-screen SSOT)

### D.1 sendback-categories.ts (5 category)

| enum value | label | description (≤30字) | detail |
| --- | --- | --- | --- |
| `misunderstanding` | 誤読 | AI が文書の意図を誤って解釈した | 例: 旧住所 → 新住所 の方向誤認、確認項目の取り違え |
| `ui_change` | UI 差異 | 業務システム UI が変更されている | 旧フォーマット表示、項目位置変更、新規項目の追加 |
| `edge_case` | 境界条件 | 想定外パターン | 新形式、未登録、海外住所、複数事業所、特殊法人 等 |
| `judgment_gap` | 判断境界 | AI 判断ルールが不足している | 新パターンに既存ルール非適用、信頼度閾値外 |
| `data_error` | 入力誤り | 入力データそのものが誤っている | 印字ミス、記入漏れ、不鮮明スキャン 等 |

### D.2 knowledge-labels.ts (3 weight tier)

| Weight | label | shortLabel | formatKnowledgeSourceLabel |
| --- | --- | --- | --- |
| `high` | 承認済 | 承認済 | 「承認済ナレッジ · {date}」 |
| `medium` | 確認済 (未承認) | 確認済 | 「確認済 (未承認) ナレッジ · {date}」 |
| `low` | 未承認 | 未承認 | 「未承認ナレッジ · {date}」 |

### D.3 status-tones.ts (CaseStatus / ProposalStatus → Tone)

| Status | Tone | UI 適用 |
| --- | --- | --- |
| `pending` | neutral | slate fill |
| `ready` | primary | indigo fill |
| `sent-back` | error | red fill |
| `business-approval-waiting` | alert | amber fill |
| `reflected` | success | emerald fill |
| `pending-triage` | primary | indigo |
| `forwarded` | alert | amber |
| `approved` | success | emerald |
| `rejected` | error | red |

### D.4 TrustLevelBadge labels (`components/shared/TrustLevelBadge.tsx:36-38`)

| value | label | caption |
| --- | --- | --- |
| `supervised` | **Supervised** | 全件確認 (入力者 + 承認者) |
| `checkpoint` | **Checkpoint** | 重要分岐のみ確認 |
| `autonomous` | **Autonomous** | サンプリング確認 (将来) |

**Note**: label が English (Tier 2 vocabulary、CLAUDE.md で UI 表示 OK)。`_persona.md` G-A5 directional gate 評価対象、Step 2-3 で判定。

---

## §E. Cross-screen vocabulary table

| 概念 | 採用表現 (canonical) | 出現画面 (file:line) | 異表記 / variants (画面間揺れ候補) |
| --- | --- | --- | --- |
| 承認 (案件) | 「承認者承認」「案件承認」 | Inbox / CaseReview / AuditTrail / Dashboard | 「承認」単独で出る箇所 → 階層曖昧 risk |
| 承認 (手順) | 「手順承認」 | AuditTrail L60 / Metrics K6 / proposal 関連 | 「proposal_approve」(audit type)、L60 で JP map 化済 |
| 承認 (設定) | 「設定承認」 | AgentSettings / AuditTrail L64 | `Type A/B/C` で枝分かれ |
| 承認 (4-eyes 全体) | 「案件承認」(docs SSOT) | 主に docs 出典、UI 直接出現は少 | UI では「入力者確認 + 承認者承認」分離表記が default |
| 差戻し | 「差戻し」「差戻しコメント」 | SendBackComment / AuditTrail / Inbox / mock-cases | 動詞「再処理中」(`sent-back` JP)、名詞「差戻し」両用 |
| AI 提案 | 「AI 提案」「AI 提案レビュー」 | Sidebar / ProposalReview / Dashboard | 「Procedure Update Proposal」(docs)、UI では「AI 提案」 |
| Staging (低/中 weight knowledge) | 「未承認」「未承認ナレッジ」「未承認ヒント」 | KnowledgeBrowser / CaseReview / StagingHintPanel / mock-knowledge | governance paraphrase `staging`→「未承認」徹底適用済 |
| Compiled (high weight knowledge) | 「承認済」「承認済ナレッジ」 | KnowledgeBrowser / CitationPanel / mock-knowledge | governance paraphrase `compiled`→「承認済」徹底適用済 |
| Confirmed staging (medium) | 「確認済 (未承認)」 | KnowledgeBrowser / mock-knowledge `weight: medium` | shortLabel「確認済」/ full「確認済 (未承認)」 |
| Citation | 「引用根拠」「引用根拠 — 承認済みナレッジのみ」 | CitationPanel / KnowledgeBrowser L387 / mock-knowledge | governance paraphrase `citation`→「引用根拠」徹底 |
| Runtime (AI 実行時) | 「AI 実行時」(プロンプトに付加)、「AI の正式実行根拠」 | StagingHintPanel L57 / mock-agents tool description | `runtime`→「AI 実行時」/ 「AI の正式実行根拠」分離 |
| Triage | 「整理」「整理担当」「整理待ち」 | ProposalReview L283 / mock-proposals.ts raci.r「手順管理者 (整理担当)」/ statusLabel「手順管理者の整理待ち」 | governance paraphrase `triage`→「整理」/ `pending-triage`→「整理待ち」 |
| Forward | (UI 不在 / 表現は「業務責任者へ送付」) | ProposalReview footer CTA / docs SSOT で `forwarded` | UI label 不出、`forwarded`→「業務責任者へ送付」風で paraphrase 候補 |
| 5-category enum | JP label map 経由 (誤読 / UI 差異 / 境界条件 / 判断境界 / 入力誤り) | SendBackComment / ProposalReview L20-23 / KnowledgeBrowser / AuditTrail | enum identifier (raw `misunderstanding` 等) は code only、UI 表示は全箇所 JP 経由済 |
| Weight (high/medium/low) | JP 言い換え (承認済 / 確認済 / 未承認) | KnowledgeBrowser / SendBackComment / mock-knowledge | **CitationPanel L29 で `high` raw 表示残存**、`StagingHintPanel` L43 で `{h.weight}` raw 表示 (Step 2-3 audit 対象) |
| Trust Level | English label (Supervised / Checkpoint / Autonomous) | TrustLevelBadge / AgentSettings / mock-agents permissions/changeHistory | Tier 2 (CLAUDE.md UI OK)、G-A5 directional |
| Automation Maturity | (UI 直接出現少、AgentSettings Type C で間接出現) | AgentSettings Type C row | Tier 2、現状英語、用語完全置換は未対応 |
| 注意 / Alert | 「注意」「Alert」「Alert 発生率」 | Inbox th L186 / mock-cases.ts alert severity / Metrics K3 / Dashboard L310 | **`Alert`** 英語と `注意` JP の混在 (Inbox table column = 注意、Metrics KPI = `Alert 発生率` / `Alert 誤検知 急増`)、Tier 2 |
| 監査証跡 | 「監査証跡」 | Sidebar / AuditTrail H1 / mock-audit summary | `audit trail`→「監査証跡」徹底 |
| OCR / PDF / KPI / API / SLO | 一部 JP 言い換え、多くは英語 (Tier 2) | mock-agents tools / Metrics / Dashboard / AuditTrail | persona §2.2 P1-5 で operator UI 言い換え方針: `OCR`→「読み取り」/ `API`→「外部連携」/ `SLO`→「対応目安」推奨、`PDF` / `KPI` 許可、Step 3 §99 grep verify 対象 |
| 仮説 / 要検証 | `[仮説 / 要検証]` mono badge | Dashboard L211 / Metrics 多数 / AgentSettings L182 / mock data 全般 | 全画面に hedge ラベル徹底 |
| 段階 (Trust Level / Automation) | 「段階」「段階の強制引き下げ」「自動化段階」 | mock-metrics R2/R4/KRI / mock-agents change history / AuditTrail L372 | `Forced Downgrade`→「段階の強制引き下げ」 |
| 5 領域 (Agent 設定) | 「5 領域」 (Model / Prompt / Tool / 権限 / Trust Level) | AgentSettings L219 / docs SSOT | `Model` / `Prompt` / `Tool` 英語残り (Tier 2)、`Trust Level` 英語残り |
| 同種差戻し | 「同種差戻し」「同種 差戻し」 (空白差) | mock-proposals.ts decisionCriteria / mock-audit summary / mock-metrics R7 | 空白の有無で表記揺れあり (空白あり 1 + 空白なし 1) |

---

## §F. Identifier / enum / English leak grep result (mechanical)

### F.1 snake_case identifier user-facing leak

Grep target: 5-category (`misunderstanding` / `ui_change` / `edge_case` / `judgment_gap` / `data_error`) + status enum (`pending` / `ready` / `sent-back` / `business-approval-waiting` / `reflected` / `pending-triage` / `forwarded` / `approved` / `rejected`) + Trust Level (`supervised` / `checkpoint` / `autonomous`) が JSX text node または string attribute として user-facing 文脈で出現するか。

**結果**:
- 5-category: 全画面で **JP map 経由** (`pages/ProposalReview.tsx:20-23` CATEGORY_JP、`pages/AuditTrail.tsx:55-64` event type map、`SendBackComment.tsx` `sendback-categories.ts` 経由)、**raw enum の user-facing leak 0 件**
- status enum: code logic 内 (`status === 'pending'` 等) は多数あるが UI 表示は `statusLabel` field 経由で JP localized、**raw enum の UI label 0 件**
- Trust Level: `Supervised` / `Checkpoint` / `Autonomous` 英語 label が **TrustLevelBadge L36-38 で UI 表示**、ただし Tier 2 vocabulary (CLAUDE.md OK)。`_persona.md` G-A5 directional gate 評価対象 (Step 2-3 で hard/soft 判定)
- `data_error` raw: SendBackComment 内 conditional warning に `data_error` enum 露出なし (JP「入力誤り」経由)、KnowledgeBrowser L181 disabled title「入力誤りは個別差戻し時に処理するため、本一覧の対象外」も JP 経由

### F.2 component name UI leak

Grep target: `BusinessApprovalChip` / `AiProposalPanel` / `CitationPanel` / `StagingHintPanel` / `RelatedRuleAlert` / `EvidenceTimeline` / `LifecycleStepper` / `ConfidenceBar` / `AddressDiffBlock` / `DetailDrawer` / `FilterChip` / `MetaChip` / `StatusBadge` / `TrustLevelBadge` / `HypothesisChip` / `NextActionStrip` / `PrototypeModeLabel` / `Disclosure` / `DisabledAction`

**結果**: すべて JSX element tag (`<DetailDrawer>` 等) または import / interface / comment として出現、**user-facing text / aria-label / placeholder / title attr の string content として 0 件 leak**。

### F.3 English governance term UI leak

Grep target: `staging` / `compiled` / `citation` / `triage` / `forward` / `approve` / `reject` / `escalate` / `runtime` / `RACI` / `RBAC` / `MCP`

**結果**:
- `RACI` 英語: ProposalReview L268 `title="提案詳細 (RACI + メタ情報)"` で user-facing 表示残存、Tier 2 boundary 候補 (Step 3 §99 cross-screen で評価)
- `compiled` / `staging`: code 内 weight field の文字列値、`mock-knowledge.ts` の sourcePath (`workflows/.../knowledge/compiled/`)、CitationPanel L35 で sourcePath を truncate 表示 (`...{slug}` 形式) — sourcePath 表示時に `compiled` 文字列が部分 visible
- `high` raw: **CitationPanel L29 で UI 表示** (mono badge、`{h.weight}` 直接 render)、StagingHintPanel L43 同様 (`{h.weight}` raw)、`_persona.md` G-A3 / G-B5 評価対象、Step 2 sample audit (CaseReview / KnowledgeBrowser) で具体判定
- 他 (triage / forward / approve / reject / escalate / runtime / RBAC / MCP): 全て comment / code logic 内、UI 表示 0 件

### F.4 Technical term operator UI 表示確認 (`_persona.md` §2.2 P1-5 patch 対象)

Grep target (operator UI): `React` / `Vite` / `Tailwind` / `API` / `OCR` / `SLO`

**結果**:
- `React` / `Vite` / `Tailwind`: pages / components の user-facing 文字列に **0 件**、code import / config / comment のみ ✅
- `OCR`: mock-cases.ts alert message / mock-agents tool name / mock-knowledge title / mock-proposals summary / changeHistory に多数出現、operator UI に raw `OCR` が表示される (Step 3 §99 で persona §2.2 P1-5 適用判定: `OCR`→「読み取り」言い換え対象)
- `API`: code 内のみ、UI 0 件 ✅
- `SLO`: Dashboard L211 HypothesisChip「推移・SLA 閾値は [仮説 / 要検証]」(=「**SLA**」表記、SLO ではない)、mock-cases.ts comment 内 `SLA` 言及 — 厳密には `SLA` ≠ `SLO`、ただし両者とも operator UI 露出候補。persona §2.2 P1-5 で `SLO`→「対応目安」言い換え方針あり (`SLA` も類同検討候補、Step 3 §99 で評価)
- `PDF`: 多数出現 (mock-cases.ts pdfName / evidence thumbnailLabel / SendBackComment / AuditTrail DetailRow / mock-agents tool description / mock-audit summary)、persona §2.2 P1-5 で operator UI 許可
- `KPI`: Metrics page heading / HypothesisChip「4 KPI 全て [仮説 / 要検証]」/ KRI catalogue / AgentSettings Type C「4 KPI 進化要件」、persona §2.2 P1-5 で operator UI 許可

### F.5 Tier 3 規制語 grep (CLAUDE.md scope-out gate)

Grep target: `CLAUDE.md` §Tier 3 規制語 list (`docs/prior-art-map.md` §規制語 hedge ルール 参照、self-hit 回避のため本文には exact list を置かない)。

**結果**: 本 Step 1 では Tier 3 grep を完全実行せず (audits/copy-review/_persona.md §2.4 G-A4 hard gate に該当、`CLAUDE.md` Day 19 / 21 grep gate と integrate 予定)。Step 3 §99 cross-screen で正式 grep 実行 (`CLAUDE.md` §「Day 10 Design Gate + Day 19 + Day 21」と同 pattern + scope: `prototype/src/data/` + `prototype/src/pages/` + `prototype/src/components/`)。

---

## §G. Step 2-3 audit 着手前の留意点 (mechanical observation、judgement なし)

本 Step 1 抽出で観察された **mechanical fact** を以下 list 化、Step 2 sample audit (3 画面) で `_persona.md` §3.4 / §4 verdict matrix を適用する際の input data 整理:

1. **`high` / `medium` / `low` raw weight 露出** — CitationPanel L29 + StagingHintPanel L43 で `{h.weight}` を mono badge として直接 render。JP map (WEIGHT_STYLE) の `label` / `shortLabel` を経由していない。Step 2 CaseReview audit + Step 2 KnowledgeBrowser audit + Step 3 §99 cross-screen で `_persona.md` §3.4 G-B5 (cross-screen consistency) + §2.4 G-A3 (identifier hygiene、ただし英語小文字単語なので strict identifier 違反かは判定要) で評価
2. **`Supervised` / `Checkpoint` / `Autonomous` 英語 label** — TrustLevelBadge で UI 表示、Tier 2 (CLAUDE.md OK)、`_persona.md` G-A5 directional 評価対象
3. **`RACI` 英語** — ProposalReview L268 title attr で表示、operator UI 視認、Tier 2 boundary
4. **`OCR` 英語** — mock data + UI 全般で多用、persona §2.2 P1-5 で「読み取り」言い換え推奨、Step 3 §99 で適用判定
5. **`Trust Level` 英語** — AgentSettings / mock-agents / TrustLevelBadge で多用、Tier 2 OK だが部分 JP 化候補
6. **mock-agents.ts の `Agent` suffix** — 「法人住所変更 Agent」「口座開設書類完備 Agent」、CLAUDE.md JP-only 原則で `Agent` は技術用語例外、persona §2.2 P1-5 では operator UI 許可リスト外 (3 層分離適用判定 Step 3 §99)
7. **「同種差戻し」表記揺れ** — 空白あり「同種 差戻し」 (mock-audit) vs 空白なし「同種差戻し」(mock-proposals / mock-metrics)、`_persona.md` G-B5 cross-screen consistency 違反候補
8. **timestamp TZ 明示なし** — 全 mock data の timestamp に TZ 不在、JST 前提と推定。Auditor (Step 3 AuditTrail audit) 観点で `_persona.md` §3.3 「machine-parseable 形式は維持」関連
9. **case ID 命名は一貫** — `CASE-YYYY-NNNN` (4 桁 0-padded)、Auditor grep 親和性 OK
10. **法人名 prefix「サンプル」徹底** — 4 件すべて「株式会社サンプル...」、persona §4.3 mock SME check の「日本実在企業との衝突回避」基準 pass

---

## §H. 抽出済 source file inventory (確認用)

- pages: 9 file = Dashboard / Inbox / CaseReview / SendBackComment / ProposalReview / AgentSettings / AuditTrail / Metrics / KnowledgeBrowser
- components: 26 file = case 8 + proposal 1 + shared 14 + shell 3 (本 Step では key components 6 read = PrototypeModeLabel / CitationPanel / StagingHintPanel / RelatedRuleAlert / LifecycleStepper / TrustLevelBadge labels; 残り 20 components は string literal grep ベース)
- data: 6 file (mock-cases / mock-proposals / mock-knowledge / mock-agents / mock-audit / mock-metrics) — **全 6 file full read 完了**
- lib: 5 file (sendback-categories / knowledge-labels / status-tones full read 完了、cn.ts + elapsed.ts + show-internal.ts は user-facing string 不在のため skip)
- App.tsx: 9 routes mount のみ、user-facing string 不在
- main.tsx: entry point のみ、user-facing string 不在

**Step 2 着手前 input**: 本 file + `audits/copy-review/_persona.md` v0.3 + R7 recipe + relevant knowledge cards (`_persona.md` §6 + plan §5.4) で sample audit 3 画面に進む。
