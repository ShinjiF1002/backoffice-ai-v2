# Backoffice AI v2 — Flywheel と Knowledge Loop

| 項目            | 値                                                                               |
| --------------- | -------------------------------------------------------------------------------- |
| 文書 ID         | DOC-FW-01                                                                        |
| 文書名          | Flywheel と Knowledge Loop (差戻し → staging → compiled → 手順承認 → 設定承認)   |
| 版数            | v0.1                                                                             |
| ステータス      | Draft                                                                            |
| オーナー        | backoffice-ai-v2 maintainer                                                      |
| 承認者          | self — 設定承認 (Flywheel 設計の確定)                                            |
| 閲覧対象        | Internal / Project team                                                          |
| 機密区分        | Internal                                                                         |
| 関連文書        | DOC-OV-00, DOC-APP-02, DOC-KNW-04, DOC-MON-05, DOC-S4-06, DOC-ROOT-prior-art-map |
| SSOT 区分       | Flywheel 因果 + 5 段ステージ詳細 + Loop の不変条件 の SSOT                       |
| Evidence Status | N/A (設計のみ、定量値なし。本番 SLO は Phase 1 で要定義の旨を §3.2 で明示)       |
| 改版履歴        | v0.1 (2026-05-23): 初版作成 (Day 3)。v0.2 (2026-05-25): Day 5 整合化 update (Core message 連携 / Snippet schema 8 field / SLO _SSOT 参照 / Compiled 昇格 AI 日次 + Proposal source = AI + R = Manual 管理者 / BOUNDARY review proposal / 過去 case Alert / Matrix B 表現 rewrite、Plan v1.3 final patch 反映)。v0.3 (2026-05-27): CR R8 patch 反映 (§3.5 staging knowledge runtime 利用範囲 (Safety boundary) 新規 subsection 追加、core message Sub message 2「承認された手順だけを AI に覚えさせる」と staging visibility の論理衝突を解消、Plan v1.4 P0-1 / v1.4.1 Fix 1)。v0.4 (2026-05-30): Day 10.1 hygiene patch (CR R15 反映、§4.3 「自動化禁止業務」→「restricted boundary pack」表記統一、§3.2 SLO _SSOT 参照を 05 §3 へ張替 [Day 9 移管済]、§10 Tier 3 exact list 抽象化 + prior-art-map.md 参照、boundary review proposal $10M exact text 削除して `BOUNDARY.md` §2 pointer 化、関連 P0-1 / P0-2 / P1) |

---

## 1. 全体構造

Flywheel は 5 段の loop であり、**v2 の中核 message「差戻しを、次の正解手順に変える仕組み」が体現される最重要文書**。

| 段                    | 主要動詞                                                                                    | Proposal source / Owner (R) / Approver (A)              | 詳細 section |
| --------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------- | ------------ |
| ① 差戻し送信          | 入力者が AI 結果を reject + 5-category                                                      | 入力者 self                                             | §2           |
| ② staging 生成        | AI が自動 draft、低 weight、同セッション内で参照可                                          | Proposal source: AI (auto-draft)                        | §3           |
| ③ compiled 昇格       | AI が日次分析で Procedure Update Proposal を自動生成 → Manual 管理者 triage → 業務責任者承認 | Proposal source: AI / R: Manual 管理者 / A: 業務責任者  | §4           |
| ④ 設定承認 (条件付き) | AI 設定変更必要時のみ trigger                                                               | R: AI 管理者 / A: Type 別 co-A                          | §5           |
| ⑤ 反映後の波及        | 新 case で citation、過去 case は不変 (関連ルール更新時は Alert)                            | (自動)                                                  | §6           |

責任分界の静的構造 (RACI) は DOC-APP-02 が SSOT。本 doc は **loop 因果 + 各段のステージ詳細 + Loop の不変条件** を SSOT とする。

「起票者」表現は手順承認では使わない。AI proposal source を起票者と呼ばず、Manual 管理者を Queue owner (R) と呼ぶ。

## 2. ① 起点: 入力者確認による差戻し

### 2.1 入力者の役割

入力者は 4-eyes flow の 1 段目で AI 入力結果を確認する。これを「**入力者確認**」と呼ぶ。

**入力者確認 単独では 4-eyes と呼ばない**。4-eyes は 入力者 + 承認者 の 2 者が揃って案件承認全体を構成するときの呼称。Approval Taxonomy SSOT は `docs/_SSOT.md` を参照。

### 2.2 差戻しの構造

入力者は Case Review 画面 (`/cases/:id`) で AI 入力結果を見て:

- **承認**: AI 結果を accept、承認者の業務承認 queue に進める
- **差戻し**: SendBackComment 画面 (`/cases/:id/comment`) で 5-category + free-text コメント + 該当 case の context (PDF / screenshot / agent output) を送信

5-category は backoffice-ai/knowledge/error_taxonomy.md を継承:

1. `misunderstanding` — AI の意図誤解
2. `ui_change` — 業務システム UI 変更
3. `edge_case` — 想定外パターン
4. `judgment_gap` — 判断ルール不足
5. `data_error` — 入力データの誤り (AI 責でない)

詳細 routing logic と category ごとの取扱は DOC-KNW-04 で詳述。本 doc は loop side のみ。

### 2.3 差戻しが loop に入る trigger

差戻し送信の瞬間、§3 staging 生成に進む。承認者の業務承認は不要 (入力者単独の判断で staging に進める)。これは Flywheel の流量を確保するための設計判断 (承認者を絡めると batch 化が必要になり、loop が遅くなる)。

ただし、`data_error` カテゴリは AI 責でないため、staging knowledge への昇格は別 routing (DOC-KNW-04 参照)。

## 3. ② Staging knowledge 生成 (直後、AI auto-draft)

### 3.1 AI による draft

入力者の差戻しコメント + 5-category + case context を受け、AI が staging md snippet を自動 draft する。

配置: `workflows/{業務}/knowledge/staging/{YYYY-MM-DD}-{slug}.md`

snippet の構造 (frontmatter 8 field 必須、`docs/_SSOT.md` Knowledge snippet schema SSOT 参照):

```markdown
---
date: 2026-06-08
workflow_id: UC-BO-01
workflow_slug: corporate-address-change
agent_id: agent-corporate-address-change
agent_version: v0.1
source_case: CASE-2026-051
category: ui_change
weight: low
---

# 福岡支店の住所マスタが旧形式

法人住所変更を福岡支店適用で実行する際、住所マスタが旧形式 (郵便番号なし) のまま登録されているケースがある。
AI が 7 桁郵便番号を自動補完してしまうと差戻しになる。

## 暫定対応

入力者は新形式適用前に郵便番号 field を空にすることを確認。

## 関連 case

- CASE-2026-051 (本件 source)
```

**`weight` 解釈 (信頼度限定)**:

- `low`: staging (未承認、AI auto-draft 直後)
- `medium`: reviewed staging (人間が読んだが compiled 承認前)
- `high`: compiled approved (手順承認済み、正式手順反映済み)

昇格優先度は当面 field 化せず、AI 日次分析 logic 内で扱う (weight と混ぜない、§4 参照)。

**Category routing 注**:

- `data_error` は通常の compiled 昇格対象外、log / audit / 別 routing 扱い (§2.3、DOC-KNW-04 参照)
- `agent_id` は将来複数 Agent 体制を想定、現状 1 Agent / 業務でも明示
- `workflow_id` / `agent_id` は snippet を抜粋・aggregate 表示する際に業務・Agent attribution を明示するため必須

### 3.2 反映タイミング

- **prototype では同一セッション内に反映** (mock state を AppContext で immediate update、永続化なし)
- **本番仮値: 当日中 `[仮説 / 要検証]`** (`docs/05-metrics-and-gates.md` §3 SLO 仮値表参照、Day 9 で `_SSOT.md` §1.3 から移管済、Phase 1 で実証)
- SLO 仮値は `_SSOT.md` を SSOT とし、本 doc では参照のみ。表現規範: 「同一セッション内」「当日中」「日次」「次回 AI 処理から」を使う (real-time guarantee と誤読される表現は使わない、該当語彙の trace は `docs/prior-art-map.md`)

### 3.3 Weight と参照優先度

- staging の `weight` は **`low`** (信頼度: 未承認、AI auto-draft 直後)
- AI runtime は staging を参照可、ただし compiled (`weight: high`) より優先度低
- staging は人間レビュー前なので、誤った snippet が混在する可能性あり (Manual 管理者が triage、§4 参照)
- `weight: medium` は reviewed staging (人間が読んだが compiled 承認前)、`weight: high` は compiled approved

### 3.4 staging に留めるべき条件

- 1 件のみで再現性が確認できていない
- Manual 管理者の curate / 業務責任者の承認を経ていない
- weight 上げ (compiled 昇格) には複数 case 再発 + 手順承認が必要 (§4)

### 3.5 staging knowledge の runtime 利用範囲 (Safety boundary)

staging knowledge は AI runtime に visible だが、**AI が業務手順を実行する根拠 (citation) としては使用しない**。利用範囲は以下 3 用途に限定:

1. AI proposal の confidence 低下シグナル (未承認領域を flag する)
2. Human reviewer (入力者 / 承認者) への hint 表示 (「過去に同種差戻し履歴あり」)
3. AI が追加確認質問を生成する trigger

citation 根拠として使用できるのは compiled approved knowledge (`weight: high`) のみ。compiled と staging が矛盾する場合、compiled が runtime 採用される (staging は当該 conflict subset で runtime 参照対象外)。

これにより「**承認された手順だけを AI に覚えさせる**」core message (DOC-OV-00 §1.2 Sub message 2) と、staging が runtime に visible である運用設計が両立する。

`data_error` category の staging は本 safety boundary とは別 routing (§2.3、DOC-KNW-04 参照、compiled 昇格対象外 / citation 対象外 / log / audit / 別 routing)。

## 4. ③ Compiled 昇格 (AI 日次分析、手順承認 trigger)

### 4.1 昇格 trigger

AI が日次で staging knowledge を分析し、十分なナレッジが溜まり手順反映候補と判断した場合、AI が **Procedure Update Proposal** を自動生成して承認キューに入れる (Proposal source = AI)。Manual 管理者がキュー責任を持ち triage / forward / reject する (R = Queue owner)。

判断基準 (仮、`[仮説 / 要検証]`、本番 threshold は Phase 1 で要定義):

- 同種の差戻しが **複数 case で再発** (demo mock では 3 件まとめて表示する想定)
- 共通 pattern が確認可能 (差戻しコメントの主旨が一致)
- staging 内容に内部矛盾なし

提案画面は ProposalReviewPage (`/proposals/:id`)。`proposals/pending/` は prototype では in-memory queue として表現 (物理ディレクトリは作らない)。

### 4.2 手順承認の主体 (RACI)

- **Proposal source**: AI (日次分析で自動生成)
- **R (Queue owner)**: Manual 管理者 (キュー責任、受理 / triage / forward / reject)
- **A (承認)**: 業務責任者
- **C (合議)**: SME / AI 管理者 (影響範囲確認)
- **I (通知)**: 入力者 / 承認者 (反映後の運用に影響)

詳細 RACI は DOC-APP-02 §手順承認 を参照。本 doc は trigger 経路のみ。

「起票者」表現は手順承認では使わない。AI proposal source を起票者と呼ばず、Manual 管理者を Queue owner と呼ぶ。**SoD**: Queue owner (Manual 管理者) と Approver (業務責任者) の同一人物化禁止。

### 4.3 手順承認時の diff 適用範囲

業務責任者が承認すると、以下のファイルに diff が適用される:

- `workflows/{業務}/workflow.md` (業務目的 / 手順 / 期待状態 / 禁止事項)
- `workflows/{業務}/agent-instructions.md` (AI 実行方針 / 参照ナレッジ / スクショ粒度)
- `workflows/{業務}/approval-policy.md` (担当者確認 / 承認者確認 / Alert / 差戻し条件)
- `workflows/{業務}/knowledge/staging/*.md` → `workflows/{業務}/knowledge/compiled/*.md` に move (`weight: high` に昇格)

**`workflows/{業務}/BOUNDARY.md` (国際送金 restricted boundary pack) は本 Flywheel の通常更新対象外**。BOUNDARY.md は scope 画定文書であり、通常の staging → compiled → workflow diff 経路では更新しない。ただし、AI が発生頻度・差戻し頻度・例外傾向を分析し **boundary review proposal** を自動生成できる (DOC-APP-02 §9.6 参照):

- Proposal source: AI (boundary review proposal)
- R (Queue owner): Manual 管理者 or AI 管理者
- A: 設定承認 Type A (通常 boundary 調整) / Type C (Automation Maturity 関連の場合)
- 国際送金高額閾値の変更も本 mechanism の対象 (具体閾値は `workflows/international-transfer-boundary/BOUNDARY.md` §2、実閾値は Phase 1 で検証・決定)
- 発生頻度想定: 月次以下 `[仮説 / 要検証]`、頻発する場合は通常 loop 組み込み再評価

### 4.4 反映タイミング

手順承認後、AI runtime は次の case 処理から新版を参照する。**過去 case は遡って書き換えない** (§6 で詳述)。

## 5. ④ 設定承認 (条件付き、AI 設定変更必要時のみ)

### 5.1 trigger 条件

手順承認の影響範囲が AI 設定 (Agent / Model / Tool / Prompt / 権限) に及ぶ場合のみ trigger:

- 例: agent-instructions.md の更新で新 tool 呼び出しが必要
- 例: 参照ナレッジ範囲拡大で Agent の権限変更が必要
- 例: Automation Maturity の昇格 (Supervised → Checkpoint)

### 5.2 Type 別 co-A (概要のみ)

設定承認は変更の性質に応じて Type A / B / C のいずれかに分かれる。Type 区分の判定基準、各 Type の R / A / C / I、co-A の必要性 (Type B/C で co-A 必須) は **DOC-APP-02 §設定承認** が SSOT。本 doc では「Flywheel が設定承認を trigger する」経路と「§5.3 手順承認のみで完結する case」の切り分けのみ扱う。

### 5.3 手順承認のみで完結する case

手順承認後の diff が AI 設定に及ばない場合 (workflow.md の業務手順説明追記、approval-policy.md の Alert 条件微調整等)、設定承認は不要。Flywheel は §4 で閉じる。

## 6. ⑤ 反映後の Case Review への波及

### 6.1 新 case の citation

反映後、AI runtime は新 case で:

- compiled knowledge を引用 (AiProposalPanel の citation list に明示)
- confidence score 上昇 (引用ナレッジが増える → 不確実性減)
- Alert ルール更新 (approval-policy.md 反映時、新 case から適用)

### 6.2 KPI 観測

反映効果は Metrics 画面 (`/metrics`) で観測する。観測対象 KPI の例:

- **AI 入力承認率** ↑ (差戻し率 ↓)
- **人手上書き率** ↓
- **Alert 命中率** (新 rule の有効性)

数値は全件 `[仮説]` ラベル付。詳細 KPI 定義 + 4 KPI multi-criteria gate は DOC-MON-05 が SSOT。

### 6.3 過去 case は遡って書き換えない + 関連ルール更新 Alert

**反映後も過去 case の AI proposal 本文は不変**。理由:

- audit trail 保護 (過去判断の根拠を後から書き換えない)
- 入力者・承認者の判断履歴を変更しない
- 「いつ何が変わったか」を Audit Trail (`/audit`) で trace できる

ただし、**関連手順・ルールが後から承認された場合、AI Proposal 画面で Alert を出す**ことで承認者が気付けるようにする (案件本文は変更しないが、コンテキスト変化は visible にする)。

Alert 文言案:

- 「関連手順が更新されています」
- 「このcase作成後に承認されたルールがあります」
- 「AI提案本文は当時のまま保持されています」

3 適用範囲:

- **未承認・承認待ち case**: Case Review / AI Proposal panel に Alert
- **承認済み過去 case**: Audit Trail (`/audit`) に関連更新履歴を表示
- **新規 case**: 新ルールを通常 citation として参照

Mock data でもこの原則を踏襲: `prototype/src/data/mock-cases.ts` の過去 case AI proposal 本文は反映後も不変、新 case のみ反映済 proposal を持つ。Audit Trail mock (`mock-audit.ts`) は state transition log で「いつ どの workflow / agent-instructions / approval-policy 版が適用された case か」を明示し、関連 case の Alert source を提供する。

## 7. Loop の不変条件

### 7.1 Matrix B 原則 (Automation Maturity との関係)

Automation Maturity (Supervised / Checkpoint / Autonomous) が進化しても、**手順承認・設定承認の loop は同じ強度で残る**。縮小するのは案件承認 (= 入力者確認 + 承認者承認) の介在頻度のみ。

Slide 7 主表現: **AIに任せる量は段階的に増やすが、人によるコントロールは渡さない**。

slogan: **案件確認は減らす。ルール承認は残す。**

| Automation 段階 | 案件承認の介在         | 手順承認 | 設定承認 |
| --------------- | ---------------------- | -------- | -------- |
| Supervised      | 全件 (入力者 + 承認者) | 通常     | 通常     |
| Checkpoint      | 重要分岐のみ           | 通常     | 通常     |
| Autonomous      | サンプリング           | 通常     | 通常     |

これは v2 の重要 message であり、**Session 4 Slide 7 で参加者に伝える核** となる (DOC-S4-06 参照)。

### 7.2 出典 (prior art pointer)

本原則の prior art pointer: `ai-operator/docs/01-hitl-policy.md` line 198-204 (Matrix B 該当箇所)。

**外部規制根拠ではなく、ai-operator paper の設計判断を v2 が継承したもの**。本 v2 では prior art reference として扱い、外部規制論拠 (Tier 3 規制語) としては主張しない。規制語の hedge ルールは CLAUDE.md / `docs/_SSOT.md` / `docs/prior-art-map.md` 参照。

### 7.3 Loop は単方向

- 差戻し → staging → compiled → 手順承認 → (設定承認) → 反映 の順に進む
- staging から workflow.md に **直接 diff は飛ばない** (compiled 昇格 + 業務責任者承認 必須)
- 反映後の rollback も同 loop を逆向きに辿る (緊急時の Forced Downgrade は別 process、DOC-APP-02 参照)
- BOUNDARY.md (restricted boundary pack) は通常 loop の更新対象外 (§4.3 参照)

### 7.4 Loop の停止条件 (v2 scope 内)

v2 (prototype) の範囲では Loop 停止は以下のみ:

- 差戻しが 0 件 (Flywheel が「静止」状態、ただし KPI gate 未達なら昇格はしない)
- staging が compiled 昇格 threshold に達しない (Manual 管理者の判断で破棄も可)
- 手順承認が業務責任者に reject される (差戻し → staging に戻る、または完全破棄)

緊急停止 (Forced Downgrade / Emergency stop) は DOC-APP-02 Matrix C の範疇、本 doc scope 外。

## 8. 関連文書

- DOC-OV-00 §4 (Flywheel 1 枚図、本 doc が詳細版)
- DOC-APP-02 (3 層承認 + 4-eyes + Matrix A/B/C RACI + Automation Maturity の SSOT、本 doc §4-5 RACI 詳細はこちら)
- DOC-KNW-04 (5-category routing 詳細、staging/compiled file 配置、LLMOps framework、本 doc §2-3 詳細はこちら)
- DOC-MON-05 (4 KPI gate / 7 KPI catalogue / 9 KRI、本 doc §6.2 観測の SSOT)
- DOC-S4-06 (8 slide narrative、Slide 7 で本 doc §7.1 Matrix B 原則を語る)
- DOC-ROOT-prior-art-map (旧 repo 参照関係、本 doc §7.2 prior art pointer の出典管理)
