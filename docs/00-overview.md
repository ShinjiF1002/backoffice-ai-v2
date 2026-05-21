# Backoffice AI v2 — 構想概要 (Overview)

| 項目            | 値                                                                                                                                                                                                                                              |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 文書 ID         | DOC-OV-00                                                                                                                                                                                                                                       |
| 文書名          | 構想概要 (Overview)                                                                                                                                                                                                                             |
| 版数            | v0.1                                                                                                                                                                                                                                            |
| ステータス      | Draft                                                                                                                                                                                                                                           |
| オーナー        | backoffice-ai-v2 maintainer                                                                                                                                                                                                                     |
| 承認者          | self — 設定承認 (構想の確定)                                                                                                                                                                                                                    |
| 閲覧対象        | Internal / Project team / Session 4 facilitator                                                                                                                                                                                                 |
| 機密区分        | Internal                                                                                                                                                                                                                                        |
| 関連文書        | DOC-FW-01, DOC-APP-02, DOC-UI-03, DOC-S4-06, DOC-ROOT-prior-art-map                                                                                                                                                                             |
| SSOT 区分       | 構想 / スコープ / 非スコープ / Flywheel 1 枚図 の SSOT                                                                                                                                                                                          |
| Evidence Status | N/A (設計のみ、定量値なし)                                                                                                                                                                                                                      |
| 改版履歴        | v0.1 (2026-05-23): 初版作成 (Day 3)。v0.2 (2026-05-25): Day 5 整合化 update (Core message rewrite / 国際送金 restricted / 接続層 tier 化 callout / UI Wireframe-first 3 段 / Flywheel table Proposal source 列追加、Plan v1.3 final patch 反映)。v0.3 (2026-05-27): CR R8 patch 反映 (§1.2 staging knowledge runtime safety boundary 注追加 / §2.1 国際送金 Session 4 表層「高額・高リスク取引」抽象化 / §2.3 prototype mode label 必須条件 + UI scope 「9 画面 ALL 95% target equal」統一 (Hero 3 区分は demo-script 遷移順序のみ)、Plan v1.4 P0-1 / P0-3 / P0-4 + v1.4.1 Fix 1 / Fix 3 / Fix 5)。v0.4 (2026-05-28): Day 8 update (§2.2 接続層メモ callout を control matrix bullet 形式 (Read / Write / 証跡 / 失敗時制御 / Phase 1 優先度) に拡張、Plan v1.4 P1-6)。v0.5 (2026-05-30): Day 10.1 hygiene patch (CR R15 反映、§2.1 国際送金 $10M exact text を `workflows/international-transfer-boundary/BOUNDARY.md` §2 + `_meta.yaml` への pointer 化 [user 補正方針: `_SSOT` は内部参照 pointer のみ keep]、§3 非スコープ Tier 3 exact list 「Tier 3 規制語」抽象化、関連 P0-1 / P0-2) |

---

## 1. 課題と中核 message

### 1.1 解く課題

バックオフィス業務は、ベテラン担当者の暗黙知に依存してきた領域である。組織として AI 導入を検討するとき、選択肢は実務上「**一括自動化** (高リスク、例外対応の難しさ・規制対応の重さで実装が止まる)」か「**諦める** (現状維持、人手不足と退職リスクで持続不可能)」の二択に陥りやすい。

v2 が解こうとするのは、この二択の間に **段階的な自動化 + 暗黙知の組織知への蒸留** という第 3 の選択肢を提示することである。

### 1.2 中核 message

**差戻しを、次の正解手順に変える仕組み**。

- AI を一気に自動化するのではなく、現場の差戻しを毎日の改善提案に変える
- 承認された手順だけを AI に覚えさせる
- 減らすのは確認作業。残すのは手順変更と AI 設定変更の承認

具体には次の loop:

- AI が業務手順を実行 → 入力者が結果を確認 / 差戻し
- 差戻しコメントは staging knowledge として AI runtime に visible になる (prototype: 同一セッション内 / 本番仮値: 当日中 `[仮説 / 要検証]`)。ただし **staging は正式実行根拠ではない**。用途は (1) confidence 低下シグナル / (2) 未承認ヒント (human reviewer 向け表示) / (3) 追加確認質問 trigger に限定。citation / 入力値 / 業務手順変更の根拠として AI が使用できるのは compiled approved knowledge のみ (DOC-FW-01 §3.5 参照)
- 複数 case で再発した staging は AI が日次分析、十分なナレッジが溜まり手順反映候補と判断した場合に Procedure Update Proposal を自動生成 (Proposal source = AI)、Manual 管理者が承認キューを管理 (R = Queue owner)、業務責任者が承認 (A) して compiled knowledge に昇格、業務手順ファイル群 (workflow.md / agent-instructions.md / approval-policy.md) に diff 適用される
- 手順変更が AI 設定 (Agent / Model / Tool / Prompt / 権限) に及ぶ場合は設定承認を通る
- Automation Maturity (Supervised / Checkpoint / Autonomous) が進化しても、知識・設定承認 loop は縮小せず、案件承認の介在頻度だけ縮小する (Matrix B 主表現: **AIに任せる量は段階的に増やすが、人によるコントロールは渡さない**。slogan: 案件確認は減らす。ルール承認は残す。)

Flywheel 詳細は DOC-FW-01、承認モデルの静的構造は DOC-APP-02 を参照。

## 2. 解くスコープ

### 2.1 対象業務

- **UC-BO-01 法人住所変更処理** (主役、Demo Chapter 1/2 の起点): 法人顧客の登記住所変更依頼を、PDF 受領から業務システム反映まで AI が実行し、入力者確認 + 承認者承認の 2 段で確認する
- **口座開設書類完備チェック** (Dashboard 並列カード、Demo で 1 シーン open): 書類完備性のチェック + Alert を AI が draft、入力者が確認
- **国際送金 boundary** (`workflows/international-transfer-boundary/`): 条件付き制限業務 (restricted boundary pack) として boundary spec のみ記述、UI 画面化なし、Dashboard カード化なし。**高額・高リスク条件で AI 自動化不可 `[仮説 / 要検証]`** (具体閾値は `workflows/international-transfer-boundary/BOUNDARY.md` §2 + `_meta.yaml` の boundary pack 内部のみ、**実閾値は Phase 1 で検証・決定**)。未満はフレームワーク信頼性確認後に限定自動化を検討。**Session 4 表層では「高額・高リスク取引」と抽象化** (DOC-ROOT-\_SSOT「Session 4 表層表現規範」参照)

### 2.2 起点 (本番想定の flow) と v2 prototype の見せ方

**本番想定の flow**:

1. 依頼書 PDF が特定フォルダに置かれる
2. AI watcher が検知、自動的に業務システム操作を開始
3. 入力結果 (スクショ stack + PDF preview + Alert) を入力者の Case Review 画面に提示
4. **入力者確認**: 承認 / 差戻し
5. 入力者承認後、**承認者承認**: 同じ証跡を見て最終確認

入力者確認 + 承認者承認 が揃って **案件承認** 全体を構成する。「4-eyes」はこの 2 者が揃った案件承認全体を指す呼称であり、入力者確認単独 / 承認者承認単独には使わない。

> **本番接続方式メモ (設計記述、prototype 実装対象外)**:
>
> AI が業務システムにアクセスする本番接続は tier 化 + control matrix (Read / Write / 証跡 / 失敗時制御 / Phase 1 優先度):
>
> - **標準 (API)**: Read 可、Write は idempotency key 必須、retry + idempotency check、Phase 1 優先度高
> - **準標準 (MQ / event / file bridge)**: Read 可、Write は message dedup、replay / dead letter queue、Phase 1 優先度中
> - **代替 (RPA / Computer Use / MCP)**: Read 可、Write は高制限、UI drift 検知 → human fallback、Phase 1 優先度低〜中
> - **例外 (DB 直接続)**: 原則 read-only、Write 原則不可、query log + result hash、Phase 1 例外扱い
>
> データ参照とデータ入力の両方に対応。v2 prototype はフロントエンド Web UI のみ、実接続は scope-out (Phase 1 で実設計予定、本 matrix は Phase 1 design memo として docs に残す)。詳細実装 (idempotency / rollback / drift detection / credential 管理 / change management) は Phase 1 hand-off。詳細は `docs/_SSOT.md`「接続方針 SSOT pointer (control matrix)」参照。

**v2 prototype の見せ方** (上記 flow を非実行で見せる):

- PDF Inbox 画面 (`/inbox`) で「AI 処理中」状態から開始 (実 PDF watcher は実装しない)
- Case Review 画面 (`/cases/:id`) で mock evidence (PDF サムネ / スクショ stack / Alert / agent proposal) を表示
- 入力者確認 / 承認者承認 の遷移は画面上の mock state 更新のみ、業務システム実操作 / 永続化 は scope-out
- 詳細は DOC-UI-03 (`docs/03-ui-prototype-design.md`) 参照

### 2.3 UI scope

- フロントエンドのみ (React 19 + Vite 8 + Tailwind v4 + shadcn/ui)
- in-memory mock state、永続化なし
- 9 画面 prototype、Stripe 風の高密度・高信頼 SaaS UI で段階詳細化。**polish target は 9 画面 ALL 95% target equal**。Hero 3 区分は `demo-script` (Day 20) の画面遷移順序としてのみ残し、polish target には適用しない (Plan v1.4.1 Fix 3、v1.4.2 Rule 6):
  - **Step 1 (Day 11-13)**: Wireframe で情報設計と状態遷移を固定 (9 画面 low-fi)
  - **Step 2 (Day 14-15)**: Stripe 風 design language 詳細化 (9 画面 ALL に design token 適用、medium-fi)
  - **Step 3 (Day 16-18)**: マイクロインタラクション (hover / transition / inline feedback / status animation) を丁寧に作り込む (high-fi、9 画面 ALL 95% target equal)
- **Prototype mode label (必須)**: 全画面共通 persistent pill を AppShell header right (UserMenu の左隣) に表示。文言「プロトタイプ表示 — 外部システム未接続 / 証跡はモック」。色 muted (警告色は使わない)、hover で expanded tooltip 「本 prototype は in-memory mock state です。永続化なし / 外部システム未接続 / 実顧客データ未使用 / 実規制 cite なし」。a11y: `role="status"` + `aria-label="prototype mode indicator"`。必須画面: 9 画面全部 + `BusinessApprovalView` static mock (Plan v1.4 P0-3、v1.4.1 Fix 5)
- 承認者画面は実装せず、CaseReview 内 `BusinessApprovalChip` + slide-only static mock で代替
- 詳細は DOC-UI-03 参照

## 3. 非スコープ (scope-out)

CLAUDE.md §scope-out を SSOT とし、本 doc では要点のみ:

- 実 LLM API 呼び出し / Computer use / desktop control / 外部システム接続 / 完全自動化
- 実 customer data / 実 PDF (mock のみ、サンプル画像で代替)
- 実規制 cite (Tier 3 規制語は v2 docs 内でも事実主張せず、DOC-ROOT-prior-art-map から ai-operator paper への reference link のみ)
- 実送金 trigger / 実 master data 更新
- 国際送金業務の UI 画面化 + Dashboard カード化 (`workflows/international-transfer-boundary/` に 3 文書のみ、条件付き制限 restricted boundary pack。「自動化禁止 (業務全体 prohibited)」とは異なり「高額閾値以上で AI 自動化不可」の意味)
- 承認者 (Business Approval) の画面化 (`case/BusinessApprovalChip.tsx` + slide-only static mock で代替、route / page / smoke test 対象外)
- hands-on workshop (Session 4 は説明 + demo のみ)
- 旧 repo (`backoffice-ai`, `ai-operator`) の archive 移動 (v2 完成まで `~/code/active/` に保持)
- `cowork-workshop/session-{1,2,3}-narrative.md` の編集 (S1-3 SSOT、Day 19 で touch しない)

## 4. Flywheel 1 枚図 (ASCII)

```
                ┌──────────────────────────────────────────────────────────┐
                │                                                          │
                ▼                                                          │
        ┌──────────────┐  入力者確認   ┌─────────────┐  AI auto-draft  ┌─────────────┐
        │ ① AI 入力   │  差戻し +     │ ② staging   │  ─────────────► │ ③ compiled │
        │   結果       │  5-category   │   knowledge │  AI 日次分析 +  │   knowledge │
        │   (Case)     │  ──────────►  │   (直後)    │  手順承認       │   (正式)    │
        └──────────────┘               └─────────────┘  ─────────────► └─────────────┘
              ▲                                                                │
              │                                                                ▼
              │                                                  ┌──────────────────────┐
              │      新 case で citation                          │ 業務手順ファイル群    │
              │  ◄──────────────────────────────────────────────  │ workflow.md /         │
              │                                                  │ agent-instructions /   │
              │                                                  │ approval-policy        │
              │                                                  └──────────────────────┘
              │                                                                │
              │                                                                │ AI 設定変更
              │                                                                │ 必要時のみ
              │                                                                ▼
              │                                                  ┌──────────────────────┐
              │                                                  │ ④ 設定承認           │
              │      反映後の新 case                              │   (Type A/B/C)       │
              │  ◄──────────────────────────────────────────────  └──────────────────────┘
              │
              └─ ⑤ 過去 case は遡って書き換えない (audit trail 保護)
```

| 段                    | Proposal source                                     | Owner (R, Queue owner) | Approver (A)              | 反映タイミング                                                                                |
| --------------------- | --------------------------------------------------- | ---------------------- | ------------------------- | --------------------------------------------------------------------------------------------- |
| ① 差戻し送信          | 入力者 (manual)                                     | 入力者                 | 入力者 (self、reject)     | 送信時 (prototype では同一セッション内)                                                       |
| ② staging 生成        | AI (auto-draft)                                     | -                      | (人間承認不要、weight 低) | prototype では同一セッション内 / 本番仮値: 当日中 `[仮説 / 要検証]`                           |
| ③ compiled 昇格       | **AI (日次分析)**                                   | **Manual 管理者**      | **業務責任者** (手順承認) | **AI 日次分析 → 承認キュー `[仮説 / 要検証]`**                                                |
| ④ 設定承認 (条件付き) | AI 管理者 (manual) or AI (boundary review proposal) | AI 管理者              | Type 別 co-A              | Ad-hoc + batch                                                                                |
| ⑤ 反映後の波及        | (自動)                                              | -                      | (自動)                    | 次の case 処理から、過去 case は不変 (関連ルール更新時は AI Proposal 画面で Alert、DOC-FW-01) |

「起票者」表現は手順承認では使わない (Proposal source = AI、R = Manual 管理者 = Queue owner)。詳細は DOC-FW-01 で各段を section 化。

## 5. 想定 outcome (Plan §1 抜粋)

1. Session 4 (60 min) で audience 10 名が「**自社で来週、サンプル業務を選んで設計検討を始められる**」と感じる prototype demo を提供する (= 本番運用開始という意味ではない、設計検討に踏み出せる感触の獲得)
2. 設計書 10 docs + 業務文書 (2 業務 × 5 文書 + 1 boundary pack × 3 文書) + UI 9 画面 prototype + Session 4 narrative + demo script + 1 static-mock html を `backoffice-ai-v2/` repo として gitable な状態で残す
3. 実 LLM / Computer use / 実規制 / 実送金は scope-out しつつ、後日 Phase 1 (生 ops 投入) の foundation として再利用できる skeleton

## 6. 関連文書

- DOC-FW-01 (`docs/01-flywheel-and-knowledge.md`): 本 doc §4 Flywheel 図の詳細版、各段のステージ詳細 + Loop の不変条件
- DOC-APP-02 (`docs/02-approval-model.md`): 3 層承認 (案件 / 手順 / 設定) + 4-eyes (入力者確認 / 承認者承認) + Matrix A/B/C RACI + Automation Maturity の SSOT
- DOC-UI-03 (`docs/03-ui-prototype-design.md`): 9 画面 Screen Card (9-field × 9)
- DOC-KNW-04 (`docs/04-knowledge-pipeline.md`): 5-category routing + staging/compiled file 配置 + LLMOps framework
- DOC-MON-05 (`docs/05-metrics-and-gates.md`): 4 KPI multi-criteria 仮説 gate + 7 KPI catalogue + 9 KRI
- DOC-S4-06 (`docs/06-session4-narrative.md`): 8 slide × 60 min + Demo Chapter 1/2 script
- DOC-ROOT-prior-art-map (`docs/prior-art-map.md`): 旧 repo (v1 + ai-operator) 参照関係 + 継承 / 再編 / 捨てる の SSOT
- Plan: `~/.claude/plans/ai-backoffice-ai-virtual-muffin.md` (v1.3 final patch 適用版 lock、Plan v1.1.2 22 日 base + Day 5 整合化 update)
