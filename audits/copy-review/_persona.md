# Backoffice AI v2 — Copy Review 用 Persona Spec

| 項目            | 値                                                                                                                                                                                                                                              |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 文書 ID         | WORKING-COPY-REVIEW-PERSONA (working rubric、`audits/copy-review/` 配下、docs 規約適用外、Phase 1 本番 persona 必要時は別途 `docs/` に正式 DOC-ID 付きで起稿)                                                                                  |
| 文書名          | Copy Review 用 Persona Spec (画面文字列 review の判定基準 SSOT)                                                                                                                                                                                 |
| 版数            | v0.3                                                                                                                                                                                                                                            |
| ステータス      | Working rubric (Day 13 sign-off 後の copy review session 用、Step 0.5 hygiene patch 完了)                                                                                                                                                       |
| 関連文書        | DOC-OV-00 §2.1 / DOC-APP-02 §5 / DOC-APP-02 §9.8 / DOC-S4-06 §1.2 / DOC-UI-03                                                                                                                                                                  |
| SSOT 区分       | Copy Review (画面文字列 audit) 用の persona / 判定基準 SSOT (review session 限定、本番運用 persona 文書ではない)                                                                                                                                |
| 利用方法        | Step 1 Glossary 抽出以降の各 finding を本 spec の persona × aspect 表で評価。本 spec を gate にしない finding は "subjective" として除外。                                                                                                       |
| 改版履歴        | v0.1 (2026-05-25): 初版 draft、二層 persona + 8 軸 × 4 階層 verdict 設計。v0.2 (2026-05-25): user confirm 反映 — (1) 優先順位を A 主 → B 主に逆転 (= A 補助化)、衝突時 B 優先、(2) 9 画面 × 6 role 主要利用 matrix 追加、(3) AI voice 1 人称不使用 + hedge 必須を明文化、(4) mock SME plausibility check methodology を §4.3 に明示。v0.3 (2026-05-25): 外部 AI critical review 反映 hygiene patch — (P0-1) §4 Verdict 階層の「両層 pass のみ keep」を §1.1 と整合化、(P0-2) v0.2 改版履歴文言の優先順位 inversion 表現を「A 主 → B 主」と書き直し、(P1-3) `docs/persona-copy-review.md` → `audits/copy-review/_persona.md` に move、frontmatter 8 項目化、ID を `WORKING-COPY-REVIEW-PERSONA` に rename、(P1-4) §3.5 序文 「DOC-APP-02 §9.8 准拠」→「DOC-APP-02 §9.8 + DOC-UI-03 を copy review 用に拡張」、(P1-5) §2.2 技術用語を 3 層分離 + operator UI 言い換え、(P2-6) §4.3 mock SME escalation 規則統一 |

---

## 1. 二層 persona 構造 + 優先順位

本 prototype は 2 つの異なる user 層が同じ画面を見る。**衝突時は B (本番想定 operator) を優先** (user 判断 2026-05-25):

| 層 | 名称                              | 特徴                                                                                                                                                                  | 本 review での扱い                                                                                  |
| - | --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| **B (主)** | **本番想定 operator (習熟操作者)**   | 6 role (入力者 / 承認者 / 業務責任者 / Manual 管理者 / AI 管理者 / Auditor)、本番運用での想定操作者。本 prototype は実装しないが design の妥当性は本層が gate。            | **主 gate**。9 画面全部を本層の各 role の主要利用 matrix (§3.5) で評価。本層を満たさない copy は needs-fix / harmful。 |
| A (補)    | **Session 4 audience (初見視聴者)** | 2026-06-12 60 min session、10 名、業務責任者層 + Manual 管理者層 + 業務 SME + Security 関係者 + 経営層。画面を **初見**、demo facilitator の説明と並行して画面を見る。 | **補助 gate**。facilitator の口頭説明で catch up 可能な前提を取る (≠ 画面単独で 3 秒理解必須ではない)。層 A 専用 gate は最低限 (Tier 3 不在 / component leak 不在 / identifier leak 不在) に限定、それ以外は B 充足で代替する。 |

### 1.1 優先順位の運用ルール

- B が成立 + A も成立 → keep-as-is
- B が成立 + A は不成立 (facilitator 説明で catch up 可能) → keep-as-is、ただし facilitator 説明事項として `demo/demo-script.md` の Day 20 起稿対象に **追記候補** を記録
- B が不成立 → needs-fix / harmful (A の充足は判断材料にしない)
- B 不成立 + A 不成立 → harmful (即修正)

---

## 2. 層 A (補助): Session 4 audience persona

> 補助 gate。facilitator 説明で catch up 可能な前提のもと、最低限の gate (G-A2 / G-A3 / G-A4) のみを copy review の合否判定に使う。それ以外の項目 (G-A1 即時理解性 / G-A5 governance JP-paraphrase) は **directional** 扱いで、B 充足なら keep-as-is とする (facilitator 説明事項として demo-script に追記候補)。

### 2.1 構成 (DOC-S4-06 §1.2 准拠)

| 役職層           | 想定人数 | 関心軸                                                                                  |
| ---------------- | -------- | --------------------------------------------------------------------------------------- |
| 業務責任者層     | 3-4 名   | 業務影響範囲、承認 RACI、運用負荷                                                       |
| Manual 管理者層  | 2-3 名   | キュー triage の現実性、Procedure Update Proposal の妥当性                              |
| 業務 SME         | 1-2 名   | 5-category routing が現場感覚と整合するか、差戻し flow の現場 fit                       |
| Security 関係者  | 1 名     | Type B 承認 path、SoD、Tier 3 規制語の hedge、Computer use / 外部接続の scope-out 明確性 |
| 経営層           | 1 名     | Slide 7 Matrix B の意思決定 message、Slide 8 4 KPI の本番導入可否判断 gate ではない hedge |

### 2.2 知識前提

| 領域                                       | 前提                                              |
| ------------------------------------------ | ------------------------------------------------- |
| Tier 1 語彙 (案件承認 / 手順承認 / 設定承認 / 入力者 / 承認者 / Flywheel / 業務別ファイル群) | **slide / demo で説明される、画面で初見**         |
| Tier 2 語彙 (staging / compiled / Supervised / Checkpoint / Autonomous / Alert / 差戻し / Knowledge) | slide / facilitator 説明と整合していれば理解可能 |
| Tier 3 語彙 (規制語 list、`docs/prior-art-map.md`)                                          | **画面に出てはいけない (gate 違反)**              |
| 法人住所変更業務 / 口座開設業務の用語                                                       | 業務 SME 以外は **専門 domain 知識を持たない**    |
| AI / ML 用語 (RAG / citation / hallucination / runtime / staging area / prompt 等)         | 経営層 + Security 関係者は **AI 一般用語のみ**、ML 内部用語は理解できない前提 |
| 技術用語 (React / Vite / Tailwind / API / PDF / OCR / SLO / KPI / その他)                  | **3 層分離 (user 判断 2026-05-25)** — (a) **operator UI / demo 表層**: `PDF` / `KPI` は許可、`OCR` → `読み取り`、`API` → `外部連携`、`SLO` → `対応目安` に言い換え、`React` / `Vite` / `Tailwind` は不可。(b) **dev-only / `prototype/src/lib/show-internal.ts` 経由 / debug Disclosure**: 全技術用語 (React / Vite / Tailwind / API / OCR / SLO / KPI / 他) 許可。(c) Step 3 §99 cross-screen audit で本 3 層分離を grep 検証。 |
| snake_case identifier (`misunderstanding` / `data_error` / `ui_change` 等)                  | **意味不明、即座に「中身が漏れている」と認識される (gate 違反)** |
| component 名 (`BusinessApprovalChip` / `AiProposalPanel` 等)                                | **画面に出てはいけない (CLAUDE.md gate 違反)**     |
| 英語 governance 用語 (staging / compiled / citation / runtime / triage / forward)           | Tier 2 として UI label OK だが **JP-paraphrase 推奨** (Day 14 持ち越し B) |

### 2.3 操作 mode

- demo facilitator が 1 画面を **60-180 秒** 説明、その間 audience は画面を眺める
- click は facilitator 主導、audience 自身は click しない (Session 4 は hands-on workshop ではない、`docs/06` §1.2)
- 画面に出ている文字を **3 秒読みで意図を取りたい** (補足説明なしで)
- 1 文 30 字超 / 専門用語 / 略語 / snake_case は **読み飛ばし対象**

### 2.4 判定 gate (層 A)

- **G-A1 即時理解性** [directional]: 画面 heading / primary CTA / status label は 3 秒読みで意図が取れる (1 文 30 字以内、Tier 1 語彙中心)。**B 充足なら facilitator 説明で catch up 可、demo-script 追記候補として記録**。
- **G-A2 component 名 leak** [hard gate]: 画面文字列に component 名が出ていない (`BusinessApprovalChip` / `AiProposalPanel` 等)。**B と独立に harmful 判定**。
- **G-A3 identifier leak** [hard gate]: snake_case enum / 完全 path / hash / index 等の internal identifier が user-facing 文字列に出ていない (`misunderstanding` 等は CATEGORY_JP map 経由)。**B と独立に harmful 判定**。
- **G-A4 Tier 3 規制語不在** [hard gate]: 規制語が画面に出ていない (Day 19 / 21 grep gate と同様)。**B と独立に harmful 判定**。
- **G-A5 governance 用語 JP-paraphrase** [directional]: 英語 governance 用語 (staging / compiled / triage / forward / runtime / citation) は JP-paraphrase 体系 (未承認 / 承認済 / 整理 / 送付 / AI 実行時 / 引用根拠) 経由表示が推奨。**B 充足なら facilitator 説明で catch up 可、Day 14-15 持ち越し B で別途対応**。

---

## 3. 層 B (主): 本番想定 operator persona

### 3.1 6 role × operating mode (DOC-APP-02 §5.1 / §9.8 准拠)

| Role            | 主要画面                                          | 1 日想定件数 / 操作 mode                                                                                                                                                                                                                                                                                  |
| --------------- | ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **入力者**      | Inbox / CaseReview / SendBackComment              | 1 日 **30-80 件** `[仮説 / 要検証]`。skim → AI 結果 / 証跡確認 → accept or 5-category 差戻しコメント。case 単位 60-180 秒。**画面文字列はラベル想起、毎回読まない**。                                                                                                                                          |
| **承認者**      | Inbox / CaseReview (read-only)                    | 1 日 **30-80 件**。入力者確認済 case を最終確認、accept or 差戻し。skim mode。                                                                                                                                                                                                                              |
| **業務責任者**  | ProposalReview / Dashboard / AgentSettings (Type C co-A 時) | 週 **5-15 件** Procedure Update Proposal の承認判断。diff + impact + citation を熟読、1 件あたり 5-15 分。**深読み mode**。                                                                                                                                                                                |
| **Manual 管理者** | ProposalReview (Queue owner) / KnowledgeBrowser | 日次 **10-30 件** staging knowledge の triage、forward / reject / 修正依頼。staging body の自然文を 1 件あたり 30-60 秒読み。**skim + judge mode**。                                                                                                                                                       |
| **AI 管理者**   | AgentSettings / Dashboard / Metrics               | 週 **1-5 件** 設定変更承認、月次 KPI / KRI 確認、incident 時 Emergency stop / Rollback / Forced Downgrade (`docs/02` §8)。**深読み + 操作 mode**。                                                                                                                                                          |
| **Auditor**     | AuditTrail / Metrics / 全画面 read-only            | 週次〜月次の独立検証、Matrix C 発動 event の追跡、過去 case の不変性確認。**読解 + 追跡 mode**、文字列は精密に読む。                                                                                                                                                                                       |

### 3.2 知識前提

| 領域                                                                  | 前提                                                                                              |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Tier 1 / Tier 2 語彙                                                  | **全 role 理解可**                                                                                |
| Tier 3 語彙                                                           | **画面に出てはいけない (層 A と同 gate)**                                                          |
| 法人住所変更業務 / 口座開設業務の専門用語                              | **入力者 / 承認者 / 業務責任者 / 業務 SME は理解可**、Manual 管理者 / AI 管理者 / Auditor は部分的 |
| AI / ML 用語 (citation / hallucination / RAG / runtime / staging)     | **AI 管理者は理解可**、その他 role は限定的、UI label は JP-paraphrase が安全                     |
| snake_case identifier                                                 | 全 role で **意味不明**、UI に出してはいけない                                                    |
| 5-category enum (`misunderstanding` / `ui_change` / `edge_case` / `judgment_gap` / `data_error`) | JP map (`誤認識` / `画面変更` / `例外` / `判断難` / `データ不整合` 等) 経由必須                   |

### 3.3 操作 mode 細部 (copy 判定への影響)

- **入力者 / 承認者** は skim mode が default。**heading + primary CTA + status badge の 3 要素で判断**、本文を毎回読まない → **label が省略形すぎると意味取れない / 冗長すぎると skim 妨害**、両端 risk
- **業務責任者** は深読み mode。**Proposal diff / citation / impact 説明文を熟読**、説明文に「言い切らない hedge」(`[仮説]` 等) が必要、過度な短縮は判断材料不足
- **Manual 管理者** は staging body / 差戻しコメント本文を 30-60 秒で要約把握 → **mock data 自然文も hygiene 対象** (Day 13 持ち越し B/D)
- **Auditor** は文字列精読 + grep 検索 → **identifier / case_id / timestamp は machine-parseable 形式が必要**、人間読みやすさより一貫性優先

### 3.4 判定 gate (層 B)

- **G-B1 不足側 (information completeness)** [hard gate]: 各 role の主要画面 (§3.5 matrix) で「次の action を決めるのに必要な情報」が画面上に揃っている (例: 入力者の case 判断には AI 結果 + 主要 field diff + citation + Alert が同画面、承認者は更に入力者の判断履歴も必要)
- **G-B2 過剰側 (clutter)** [hard gate]: 各 role の判断に効かない info が混入していない (例: AI 管理者向けの advanced setting が入力者画面に出ていない、Auditor 向けの machine-parseable timestamp が入力者画面 primary view を占有していない)
- **G-B3 mock content fidelity** [hard gate]: mock data の title / body / 差戻しコメント本文 / staging body / Proposal description が、層 B の対応 role に対し違和感がない (Day 13 持ち越し B/D、§4.3 plausibility check methodology 適用)
- **G-B4 tone / register / AI voice** [hard gate]: 敬体 / 操作的 / 冷静、絵文字・装飾・感情表現なし。**AI voice 規範 (user 判断 2026-05-25)**:
  - **1 人称不使用**: 「私」「私たち」「付けました」「判断しました」等の 1 人称 + 主体的完了形は AI 文言で禁止
  - **hedge 必須**: AI の発話 (proposal title / body / comment / staging hint) は推測 / hedge 表現 (`[仮説 / 要検証]` / `〜の可能性が高い` / `〜と推測されます` / `要確認` 等) で描画。断言調 (`〜です` / `〜しました` 単独) は禁止
  - **AI 発話と人間発話の境界明示**: AI が出した文言は「AI 提案」「AI 推測」等の prefix / actor band で人間発話と分離 (R7 Ship Gate「Actor band」と整合)
- **G-B5 cross-screen consistency** [hard gate]: 同概念に対し画面間で異表記が出ない (例: 「承認」「確定」「approve」を画面間で揺らさない、enum map (CATEGORY_JP / WEIGHT_STYLE / AGENT_LABEL) 一元化 — Day 13 持ち越し A の延長)

### 3.5 9 画面 × 6 role 主要利用 matrix

各画面が「主に誰がどの mode で利用するか」を明示。**G-B1 (不足) / G-B2 (過剰) の判定根拠**。**DOC-APP-02 §9.8 (6 画面 access matrix) と DOC-UI-03 (9 画面 Screen Card) を copy review 用に拡張**。`Primary` は本層 review で copy が gate 通過必須、`Secondary` は read-only または例外利用、`-` は本画面の主要 user ではない (G-B2 過剰 risk source)。

| 画面                | 入力者     | 承認者     | 業務責任者   | Manual 管理者 | AI 管理者    | Auditor      | 画面の copy 重点                                                                                                                                                                       |
| ------------------- | ---------- | ---------- | ------------ | ------------- | ------------ | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Dashboard**       | Secondary  | Secondary  | Primary      | Secondary     | Primary      | Secondary    | 業務カード (再発差戻し 3+ 件 alert 等)、KPI snapshot、AI 管理者 + 業務責任者の skim mode。**過剰 risk**: AI 管理者向け詳細を業務責任者 skim 視野に被せない。                          |
| **Inbox**           | **Primary**| **Primary**| -            | Secondary     | -            | Secondary    | case list、status filter、優先度・期限。**入力者 / 承認者 skim mode**。**不足 risk**: case 1 行から judge 不能 (workflow 名 / 案件区分 / 入力者状態 / 期限 のうち欠落)。**過剰 risk**: AI 管理者向け technical metadata 混入。 |
| **CaseReview**      | **Primary**| **Primary**| Secondary    | -             | -            | Secondary    | AI 入力結果 + 主要 field diff + 証跡 + AiProposalPanel (citation + staging hint + Alert) + 4-eyes status。**入力者 = 判断 mode (60-180 秒)、承認者 = 確認 mode**。**不足 risk**: 入力者判断に必要な material が同画面に揃わない (citation 別画面、Alert 折り畳み 等)。 |
| **SendBackComment** | **Primary**| Secondary  | -            | -            | -            | Secondary    | 5-category 選択 (JP map 経由)、free-text、preview。**入力者の作文 mode (90-180 秒)**。**不足 risk**: category 5 個の意味 differentiation が JP label だけで区別不能 (例文 / hint が必要)。 |
| **ProposalReview**  | -          | -          | **Primary**  | **Primary**   | Secondary    | Secondary    | AI 提案 diff、citation、impact、RACI box (Proposal source = AI / R = Manual 管理者 / A = 業務責任者)、accept / sendback / reject。**業務責任者 = 深読み (5-15 min)、Manual 管理者 = triage skim (30-60 sec)**。**不足 risk**: 業務責任者深読みに必要な impact 説明が短すぎる、Manual 管理者 triage に必要な priority signal が欠落。 |
| **AgentSettings**   | -          | -          | Secondary (Type C co-A 時) | -    | **Primary**  | Secondary    | Agent 一覧、prompt / model / tool / 権限の現状、変更 diff、Type A/B/C 判定。**AI 管理者の深読み + 操作 mode**。**過剰 risk**: 全 role に向けた general explanation が技術詳細を埋没させる。**不足 risk**: 業務責任者 (Type C co-A) が「業務リスク受容」判断に必要な business impact 情報の欠落。 |
| **AuditTrail**      | Secondary (read own) | Secondary  | Secondary    | Secondary     | Secondary    | **Primary**  | state transition log、Matrix C 発動 event、actor band (agent / human / system)。**Auditor の読解 + 追跡 mode、grep 検索前提**。**不足 risk**: machine-parseable identifier (case_id / timestamp / actor) の欠落、actor band の人間/AI/system 分離欠落。**過剰 risk**: 入力者向け operational copy が Auditor 画面を雑音化。 |
| **Metrics**         | Secondary (limited) | Secondary (limited) | Secondary | -        | **Primary**  | **Primary**  | 4 KPI target hypothesis + trend、9 KRI catalogue snapshot、`[仮説 / 要検証]` ラベル、「本番導入可否を判定する gate ではない」注。**AI 管理者 = 月次 KPI 確認、Auditor = 追跡**。**不足 risk**: `[仮説]` hedge ラベルの欠落で本番 gate と誤認、KRI catalogue が abstract すぎて Auditor 追跡不能。 |
| **KnowledgeBrowser**| -          | -          | Secondary    | **Primary**   | Secondary    | Secondary    | staging / compiled knowledge 一覧、weight、5-category、citation 経路、source。**Manual 管理者 skim + judge mode**。**不足 risk**: staging vs compiled 区別が一目で取れない、weight 数値の意味 mapping (WEIGHT_STYLE) が画面上に出ていない。**過剰 risk**: dev-only raw trace note が user-facing に残る (Day 13 持ち越し C)。 |

**Matrix の運用**:
- Primary user に対する **G-B1 (不足)** は hard gate 違反 → needs-fix 以上
- `-` user 向けの info が混入 → **G-B2 (過剰)** 違反、ただし重要度は混入の程度による
- Secondary user は G-B1 / G-B2 とも directional 扱い、ただし「該当 role が read-only でこの画面を使う」想定が明確に成立する場合のみ Primary に格上げ

---

## 4. 過不足 + 即時理解性の判定基準 (8 軸の判定方法)

Step 2 / Step 3 各 audit で finding を分類するときの判定方法。各 aspect は **層 B 主 + 層 A 補助で判定** (§1.1 優先順位ルールと整合)。`keep-as-is` 条件は §4 末尾 Verdict 階層を参照。

| Aspect                                   | 層 A での判定                                                              | 層 B での判定                                                                | Verdict                                                       |
| ---------------------------------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------- |
| **Information completeness (不足側)**    | 3 秒読みで demo message の意図が取れる情報が画面に揃っている               | 該当 role の next action 判断に必要な情報が同一画面に揃っている             | keep-as-is / needs-fix (具体 wording 案) / harmful (欠落致命) |
| **Information clutter (過剰側)**         | 不要要素で focal CTA / 主要情報が埋もれない                                | role mismatch (他 role 用情報の混入) がない                                  | keep-as-is / needs-fix / harmful                              |
| **Comprehensibility (即時理解性)**       | 1 文 30 字以内 + Tier 1 中心、3 秒読みで意図が取れる                         | label / status / button text が習熟 user の想起 vocabulary と一致              | keep-as-is / needs-fix / directional (好み)                   |
| **Glossary consistency**                 | governance paraphrase 辞書遵守 (staging→未承認 / compiled→承認済 等)、Tier 3 不在 | 同概念に対し画面間で揺れない、enum map 経由                                   | keep-as-is / needs-fix                                        |
| **Identifier hygiene**                   | snake_case / 英語 enum identifier / 完全 path / hash が user-facing に leak していない | 同左 + machine-parseable 形式は維持 (Auditor 用)                              | keep-as-is / needs-fix / harmful                              |
| **Component name leak**                  | component 名 (`BusinessApprovalChip` 等) が user-facing に出ていない         | 同左                                                                          | keep-as-is / harmful (即修正)                                 |
| **Tone / Register**                      | 敬体 / 冷静 / 操作的、装飾 / 感情表現 / 1 人称断言なし                        | AI の hedge 表現 (`[仮説]` / `可能性が高い` / `要確認` 等) を適切に使用       | keep-as-is / needs-fix / directional                          |
| **Mock content fidelity** (mock data 自然文) | 5-category 例 / case title / staging body が demo message と整合           | mock 自然文が層 B role の現場感覚と整合 (専門用語 / register / 情報粒度)      | keep-as-is / needs-fix / directional                          |

### 4.3 Mock content fidelity 判定 methodology (G-B3 hard gate の具体手順)

私 (Claude) が business SME role を **代行** して mock data 自然文 (case_id / 法人名 / 住所 / 差戻しコメント本文 / staging body / Proposal title+description) の plausibility を check (user 判断 2026-05-25)。**Escalation 規則 (統一)**: `needs-fix` 以上のみ user confirm へ escalate、`directional` 以下は keep-as-is + `demo/demo-script.md` (Day 20 起稿対象) の補足候補に記録。

**Check 軸** (各 mock data file ごとに):

| 軸                          | 判定方法                                                                                                                                                                                                                                                                  | reference                                                                                                                            |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **case_id 形式**            | `CASE-YYYY-NNNN` 等の 一意 identifier 形式が日本のメガバンク back-office 業務 case 管理として妥当か (年・連番・略号構成、固定 width)、grep / sort 親和性                                                                                                                  | `research-compounder/knowledge/ui-design/banking-mobile-app-jp-conventions.md`、`samples/ui-patterns/hil-approval-table-and-detail.md` |
| **法人名 / 取引主体名**    | 法人格 (株式会社 / 合同会社 等) の表記、日本実在企業との衝突回避 (fictive prefix `サンプル` / `テスト` 等の付与有無)、業種・規模の demo 妥当性 (UC-BO-01 法人住所変更の主体として現実的か)                                                                                | `knowledge/ui-design/jp-corporate-site-patterns.md`                                                                                  |
| **住所表記**                | 日本住所の正規表記 (郵便番号 / 都道府県 / 市区町村 / 番地 / 建物名)、英字混入の有無、半角全角の一貫性、demo 妥当性 (実在住所衝突回避)                                                                                                                                    | `knowledge/ui-design/jp-form-conventions.md`                                                                                         |
| **差戻しコメント本文**      | 入力者の business register (敬体 / 短文 / 5-category と整合)、AI への指示性 (`〜してください` / `〜の確認をお願いします`)、過度な感情表現 / 個人攻撃 / 略語の不在                                                                                                          | `knowledge/ux-design/conversational-ai-tone-and-persona.md`                                                                          |
| **staging body**            | AI が自動生成した hint 文の register (1 人称不使用 / hedge 必須、§3.4 G-B4 と整合)、`[仮説 / 要検証]` ラベル運用、citation hint vs runtime citation 対象外の区別                                                                                                          | `knowledge/ui-design/citation-and-source-disclosure-ui.md`、`knowledge/ux-design/agent-failure-explainability-ui.md`                |
| **Proposal title + description** | AI 自動生成の文体規範 (1 人称不使用 / hedge 必須)、業務責任者深読み mode に耐える具体性 (`〜の手順を追加することを提案します` レベル、抽象 `改善` のみは不足)、5-category root cause との logical 接続性                                                              | `knowledge/ui-design/diff-and-change-preview-ui.md`、`knowledge/ux-design/multi-step-approval-and-workflow.md`                       |
| **時刻表記**                | `YYYY-MM-DD HH:MM` 形式の一貫性、time zone 明示の必要性 (JST 前提なら表記揺れ防止)、Auditor grep 親和性                                                                                                                                                                  | `knowledge/ui-design/action-history-timeline-audit-trail-ui.md`                                                                      |
| **5-category routing 実例** | `misunderstanding` / `ui_change` / `edge_case` / `judgment_gap` / `data_error` の各 category の代表例 mock が、category 定義 (`docs/04-knowledge-pipeline.md` §4) と整合し、JP map (`誤認識` / `画面変更` / `例外` / `判断難` / `データ不整合` 等) 経由表示が確認できる | `docs/04-knowledge-pipeline.md` §4 + `prototype/src/lib/sendback-categories.ts`                                                       |

**Escalation 規則 (§4.3 冒頭と統一)**: `harmful` 判定は即 user 確認 (review-needed/ 経由ではなく本 session 内で確認)、`needs-fix` は audit findings に集約して Step 4 で user 確認、`directional` 以下は keep-as-is + demo-script 補足候補に記録 (= 「`needs-fix` 以上のみ user confirm へ escalate」を harmful / needs-fix の 2 階層に展開した規則、同義)。

---

**Verdict 階層** (research-compounder Evidence Strength を copy review 用に転用):

| Verdict        | 意味                                                                                                |
| -------------- | --------------------------------------------------------------------------------------------------- |
| **keep-as-is** | 層 B 主 gate (G-B1-B5 hard) を pass + 層 A hard gate (G-A2/A3/A4) を pass、層 A directional gate (G-A1/A5) は不問 (B 充足なら facilitator 説明で catch up、demo-script 補足候補に記録) |
| **directional** | 好み・微調整余地はあるが gate 違反ではない (P2 polish 候補)                                          |
| **needs-fix**  | 1 つ以上の gate を違反、Day 14-15 medium-fi 着手前または着手中に修正 (P0 / P1)                       |
| **harmful**    | Session 4 失敗 risk が高い、CLAUDE.md 規範違反、即修正 (P0 必須、Day 13 sign-off の延長で対応すべき) |

---

## 5. 本 spec の運用範囲 / 制約

- 本 spec は **copy review session 限定** の判定基準。本番 persona 文書ではない (本番 persona は Phase 1 で再設計)。
- 「1 日想定件数」「skim / 深読み mode」「想起 vocabulary」は **`[仮説 / 要検証]`**、Phase 1 で測定・修正前提。
- copy review の finding はすべて本 spec の persona × aspect で justify。本 spec の枠外で「個人の好み」だけでの finding 提出は禁止 (`docs/02` §10 と同様の規律)。
- 本 spec の修正は本 review session 内では行わない。Step 4 (統合) で本 spec の不足が発覚した場合、`review-needed/` に escalate して別途修正。

---

## 6. 関連 reference

- DOC-OV-00 §2.1 対象業務 (UC-BO-01 法人住所変更 / 口座開設書類完備チェック)
- DOC-OV-00 §2.3 UI scope + Prototype mode label
- DOC-APP-02 §2.2 4-eyes 構造、§5.1 5 役割、§5.2 Auditor、§9.8 Role × 画面 access matrix
- DOC-S4-06 §1.2 audience 想定、§1.3 Tier 1/2/3 vocabulary 適用
- DOC-UI-03 9 画面 Screen Card
- `CLAUDE.md` JP-only 原則、Tier 1/2/3 語彙、component 名 leak 禁止
- `research-compounder/templates/artifact-recipes/ai-native-ui-spec.md` (R7) Ship Gate
- `research-compounder/knowledge/ui-design/jp-form-conventions.md`、`jp-multilingual-bilingual-ui.md`、`jp-display-typography-premium.md`
- `research-compounder/knowledge/ux-design/conversational-ai-tone-and-persona.md`

