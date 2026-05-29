# IA Overview v2 — Process-First 再設計 SSOT

> **本 file は再設計の対応方針 SSOT**。`operational-audit.md` の 18 要件 (R-*) を 9 画面に mapping し、Process-First IA + 横断 component + confidence→reconcile 置換を確定する。
> v1 (`ia-overview.md`) は Plan β (機能集約 9→6) の IA。**v2 が現行 SSOT**、v1 は historical。

---

## 0. 設計転換の核 (v1 → v2)

| 軸 | v1 (機能集約) | v2 (Process-First) |
|---|---|---|
| 組織の第一軸 | 機能 (Hub/Queue/Case/...) | **業務 Process** (法人住所変更 / 口座開設) |
| nav | 機能 5 nav | **Global Process Selector + Process-scoped 機能 nav** |
| master-detail | detail 直行 (master 削除) | **master 完備** (承認待ち / 提案一覧 / Agent 一覧 新設) |
| 意思決定支援 | 集約値のみ | **実数値 vs 閾値 / before-after / reconcile** |
| confidence | 生数字 0.84 | **削除 → rule-based reconcile** |
| 承認者 (4-eyes 後半) | 画面なし (scope-out) | **承認待ち Queue + 承認 detail 新設** |

転換理由: ユーザは業務 Process Driven で思考し、一覧→詳細を辿り、実数値・変更影響を見て operate する (operational-audit.md §2)。

---

## 1. Global Process Selector 仕様

### 配置
TopBar 左端に Process selector を常時表示:
```
[業務: 法人住所変更 ▾]   ← 選択肢: 法人住所変更 / 口座開設書類完備 / 全業務
```

### 挙動
- **特定 Process 選択時**: Sidebar 全機能 nav がその Process に scoped (案件/承認待ち/提案/Agent/モニタリング すべて該当 Process のみ)
- **全業務選択時**: 横断表示 (各一覧に「業務」列、Hub は全 Process Alert、Agent は全 Agent 一覧)
- Process 切替は全画面で保持 (URL param `?process=UC-BO-01` or context)
- pattern 出典: Linear team switcher / Stripe account switcher

### data 基盤
全 entity (cases/agents/proposals/audit/metrics/knowledge) が `workflowId` 保持済 → filter は既存 data で成立。

---

## 2. Sidebar 構造 (Process-scoped)

```
TopBar:  [業務: 法人住所変更 ▾]  ……  PrototypeModeLabel
─────────────────────────────────────
Sidebar:
  ◆ ハブ                    /
  ─ 処理 ─
  ◉ 案件                    /cases            (入力者 queue)
  ◉ 承認待ち                /approvals        (承認者 queue) ★新設
  ─ 改善 ─
  ◉ 提案                    /proposals        (一覧→detail)
  ◉ Agent                   /agents           (一覧→detail)
  ─ 監視 ─
  ◉ モニタリング            /observatory      (監査/メトリクス/ナレッジ)
```

> nav UI ラベルは **「モニタリング」** (旧「観測」を rename、pilot review D)。route / spec 内部名は `Observatory` 維持。画面タイトル・breadcrumb も「モニタリング」で統一。

CaseDetail (`/cases/:id`) / ProposalDetail (`/proposals/:id`) / AgentDetail (`/agents/:id`) は各 master の row click から navigate (sidebar 非表示)。

nav group 3 つ (処理 / 改善 / 監視) で role の mental model に整合:
- **処理** = 入力者・承認者の日次オペレーション (案件承認)
- **改善** = Manual 管理者・AI 管理者の手順承認/設定承認
- **監視** = 監査者の read-only 監視

---

## 3. 9 画面 inventory + typology

| # | 画面 | route | typology | 由来 | P0 要件 |
|---|---|---|---|---|---|
| 1 | **Hub** | `/` | A | 改修 | Process tag Alert (Hub#1) |
| 2 | **案件 Queue** | `/cases` | B | 改修 | 右パネル click 表示 (R-QUEUE-01) |
| 3 | **承認待ち Queue** | `/approvals` | B | ★新設 | 承認者 4-eyes (R-APPR-01) |
| 4 | **CaseDetail** | `/cases/:id` | C | 改修 | reconcile + validation (R-RECON/R-VALID) |
| 5 | **提案一覧** | `/proposals` | B | ★新設 | Process 別一覧 (R-PROP-01) |
| 6 | **ProposalDetail** | `/proposals/:id` | C | 改修 | 実績値 + before/after (R-PROP-02/03) |
| 7 | **Agent 一覧** | `/agents` | B | ★新設 | 全 Agent Trust/perf (R-AGENT-01) |
| 8 | **AgentDetail** | `/agents/:id` | C | 改修 | 実 metrics vs threshold + consequence (R-AGENT-02/03) |
| 9 | **Observatory** | `/observatory` | A | 改修 | Process 別 + timeline 修正 (R-OBS-*) |

typology lock: **A 型 ×2 / B 型 ×4 / C 型 ×3** (v1 の 3-typology lock を継承)。

---

## 4. 横断 component (新規、全画面共通)

### 4.1 `<ProcessSelector>` (TopBar)
業務 selector。全画面で Process context を提供。

### 4.2 `<ReconcilePanel>` (CaseDetail / 承認待ち detail / Queue drawer)
**confidence 生数字を置換する中核 component** (R-RECON-01/02):
```
AI 入力値        申請書類 (OCR)        照合
─────────────────────────────────────────
法人名: A社      法人名: A社          ✅ 一致
新住所: ...2丁目  申請書: ...2丁目      ✅ 一致
支店: 042        申請書: 042          ✅ 一致
効力日: 6/15     申請書: 6/15         ✅ 一致
(不一致があれば) AI: X  申請: Y       ⚠️ 要確認
```
- 3 状態: 一致 (success-soft) / 要確認 (alert-soft) / 未取得 (slate)
- ユーザは数字でなく「要確認の項目だけ」見ればよい
- rule-based (文字列一致 / 差分)、ML 不要、Day1 実装可能

### 4.3 `<MetricVsThreshold>` (AgentDetail / ProposalDetail)
**実数値 vs 閾値の比較** (R-AGENT-02 / R-PROP-02):
```
指標              実績値    閾値      判定
─────────────────────────────────────────
AI 入力承認率     92%   ≥ 95%      ✗ 未達 (-3pt)
人手上書き率      0.12  ≤ 0.15     ✓ 達成
Alert 発生率      0.08  ≤ 0.10     ✓ 達成
承認者差戻し率    0.05  ≤ 0.07     ✓ 達成
```
- 進化要件達成度 (75%) の集約値を置換
- 各指標: 実績値 + 閾値 + 達成/未達 + 差分
- 申請者は「どの指標が昇格基準に未達か」を即判断

### 4.4 `<ConsequencePanel>` (AgentDetail / ProposalDetail)
**変更の before/after・影響** (R-AGENT-03 / R-PROP-03):
- AgentDetail (Trust 昇格): 「Supervised → Checkpoint: 全件人レビュー → 高信頼度 case は AI 自動入力、低信頼度のみ人確認 (影響: 1 日 約 X 件が自動化)」
- ProposalDetail (ルール改定): 「OCR 閾値 0.85 → 0.88: 適用すると過去 12 case 中 N 件が要確認に変化、差戻し率 -M pt 見込み」

### 4.5 既存継承 component
StatusBadge / FilterChip / MetaChip / ActorBand / Sparkline / Disclosure / PrototypeModeLabel / Lifecycle Stepper (CaseDetail / ProposalDetail)。

---

## 5. 各画面の再設計方針 (現状→新、audit 要件 mapping)

### 5.1 Hub (`/`) — A 型
| 項目 | 現状 (Hub.html) | 新 (v2) | 要件 |
|---|---|---|---|
| Headline KPI | 注意あり / SLA / 承認者待ち (全社合算) | 同 KPI だが **各 Alert に Process tag** + Process 別 breakdown | Hub#1 |
| 原因究明動線 | なし | KPI drill → 該当 Process の案件/Agent へ (「特定 Process の Agent 設定問題か / 低品質リクエスト大量か」を判断可能に) | Hub#1 |
| Process selector | なし | TopBar に追加、全業務時 = 横断 / 特定時 = Process 状況 | R-PROC-01 |
| keep | PrimaryAnchor / Drill 1-liner / Diagnostic Disclosure | 維持 | — |

### 5.2 案件 Queue (`/cases`) — B 型
| 項目 | 現状 (Queue.html) | 新 | 要件 |
|---|---|---|---|
| 右パネル | default 表示 (clutter) | **default 非表示、row click で開く** | R-QUEUE-01 |
| パネル内 confidence | 0.96 / 0.84 表示 | **削除**、reconcile サマリ (要確認 N 項目) に置換 | R-RECON-02 |
| パネル内変更内容 | なし | **何が変わったか** (新住所 diff 等) | R-QUEUE-02 |
| Process | 横断のみ | Process selector 連動 | R-PROC-01 |
| keep | recommended row highlight / 5 column / status badge | 維持 | — |

### 5.3 承認待ち Queue (`/approvals`) — B 型 ★新設
- 入力者確認済 (status = business-approval-waiting) の案件一覧
- column: 案件 ID / 業務 / 入力者の判断 (承認/修正) / reconcile 結果サマリ / 経過 / →
- row click → CaseDetail (承認者 mode)
- 要件: R-APPR-01

### 5.4 CaseDetail (`/cases/:id`) — C 型
| 項目 | 現状 (CaseDetail.html) | 新 | 要件 |
|---|---|---|---|
| confidence 0.96/0.84 | field 横に表示 | **全削除** | R-RECON-02 (CaseDetail#1) |
| 「field 平均 (5 field)」 | 表示 | **削除** | CaseDetail#4 |
| AI 入力結果 | 値 + confidence | **`<ReconcilePanel>`** (AI 入力 vs 申請書類 OCR、一致/要確認) | R-RECON-01 (CaseDetail#3、最重要) |
| 差戻し validation | コメント未入力でも可 | **コメント未入力なら Error で即時入力促す** | R-VALID-01 (CaseDetail#2) |
| 差戻しコメント | 別 route | 同 page section (tab/inline) | R-CASE-01 |
| mode | 入力者のみ | 入力者 mode (承認/差戻し) + 承認者 mode (最終承認、入力者判断 + reconcile 表示) | R-APPR-02 |
| keep | Lifecycle Stepper sticky / Citation / Alert | 維持 | — |

### 5.5 提案一覧 (`/proposals`) — B 型 ★新設
- Process 別の AI 生成提案一覧 (status = pending-triage / forwarded)
- column: 提案 ID / 業務 / **どの部分の改定か** (例: OCR 閾値) / 影響 case 数 / status / →
- 「どの Process のどの部分の話か」を一覧で把握 (Proposal#1)
- row click → ProposalDetail
- 要件: R-PROP-01

### 5.6 ProposalDetail (`/proposals/:id`) — C 型
| 項目 | 現状 (ProposalDetail.html) | 新 | 要件 |
|---|---|---|---|
| 判定基準 | 基準のみ | **`<MetricVsThreshold>`** (基準 + 実測値) | R-PROP-02 (Proposal#2) |
| 改定の影響 | なし | **`<ConsequencePanel>`** (before/after、影響 case 数、差戻し率見込み) | R-PROP-03 (Proposal#3) |
| 文脈 | どの Process か不明瞭 | 提案一覧から navigate、breadcrumb に Process | R-PROP-01 |
| keep | Proposal Lifecycle Stepper / 元案件 link / 未承認ヒント L3 | 維持 | — |

### 5.7 Agent 一覧 (`/agents`) — B 型 ★新設
- 全 Agent (全業務時) or Process 内 Agent (特定時) の一覧
- column: Agent 名 / 業務 / Trust Level / **直近パフォーマンス** (承認率等 sparkline) / 昇格可否 flag / →
- row click → AgentDetail
- 要件: R-AGENT-01 (Agent#2)

### 5.8 AgentDetail (`/agents/:id`) — C 型
| 項目 | 現状 (AgentDetail.html) | 新 | 要件 |
|---|---|---|---|
| 進化要件達成度 75% | 集約 progress bar | **`<MetricVsThreshold>`** (4 KPI の実績値 vs 閾値、未達項目明示) | R-AGENT-02 (Agent#1、最重要) |
| Trust 昇格の影響 | なし | **`<ConsequencePanel>`** (Supervised→Checkpoint で「全件人レビュー → どう変わるか」) | R-AGENT-03 (Agent#3) |
| hex hardcode | #334155 / #1e293b (2 個) | token (`--fg` 等) or `--fg-strong` 追加で吸収 | (minor、前 verify) |
| keep | Config 3 行 / Recent history / Simulation | 維持 | — |

### 5.9 Observatory (`/observatory`) — A 型 (3-tab)
| tab | 現状 | 新 | 要件 |
|---|---|---|---|
| 監査 | Process 横断、timestamp 順、AI 入力時刻なし、承認者 event 欠落、cron trigger 露出 | **Process 別 + case lifecycle 順 (受付→AI処理→入力者確認→承認者承認→反映) + AI 入力時刻明示 + 承認者 event 追加 + 「日次提案分析」表記** | R-OBS-01/02/03 (Obs#1/2/3) |
| メトリクス | 全社合算 4 KPI + 9 KRI | **Process 別 AI 精度・KPI** (業務ごとに承認率/上書き率/Alert率/差戻し率) | R-OBS-04 (Obs#4) |
| ナレッジ | フラット並列 | **Process 別 grouping** | R-OBS-05 (Obs#5) |

---

## 6. Disclosure 規範 (v1 継承)

L1/L2/L3/L4 規範は `disclosure-rules.md` を継承。新 component の Disclosure 配置:
- `<ReconcilePanel>`: 一致項目は L1 簡潔 (✅ のみ)、不一致は L1 強調、詳細 diff は L3
- `<MetricVsThreshold>`: L1 (実績 vs 閾値 vs 判定)、計算根拠は L3
- `<ConsequencePanel>`: L1 (要約 1-2 文)、詳細影響リストは L3

---

## 7. confidence → reconcile 置換 (T4 確定方針)

- **Day1**: confidence 生数字を全画面削除、`<ReconcilePanel>` (rule-based 一致/要確認) に置換
- **将来 backlog**: ML calibrated confidence (学習データ蓄積後)、表示は別途 UX 検討 (項目毎数字でなく優先確認順 等)
- 詳細: `operational-audit.md` §5

---

## 8. 次工程 (Claude Design 引き継ぎ pack v2)

本 SSOT を基に、`claude-design-bundle-v2/` を生成:
- **context/**: design-system (不変) + **ia-overview-v2** + **operational-audit** + disclosure-rules + jp-vocabulary + charter-summary + research-compounder-refs + prototype-current-reference (+ 新 component spec: reconcile / metric-vs-threshold / consequence)
- **prompts/**: 9 画面 × wireframe + mockup = 18 prompt (既存 6 改修 + 新設 3)

各 prompt の Acceptance check は本 SSOT の各画面 audit 要件 (R-*) を binary 化。

---

## 9. v2 critical review patch (P0/P1 反映、§1-8 と衝突時は §9 優先)

> critical review (`process-first-critical-review.md`) 後の確定事項。

### 9.1 承認者 UI scope (P0-4 決定文)
承認者 UI (`/approvals` queue + CaseDetail checker mode) は handoff-redesign/ Process-First redesign scope で **P0 scope-in**。旧 prototype/ CLAUDE.md / Plan v1.3 lock は historical baseline として変更しない。React 化時は prototype-redesign/ のローカル指示で `/approvals` と承認者 mode を明示。

### 9.2 ProcessSelector を万能解にしない (P1-1)
TopBar selector 維持 + **role landing** (各 role の既定着地画面) + saved view。Process が 10+ に増えた時は searchable selector + grouped (recent / favorite)。詳細は `process-selector-spec.md`。

### 9.3 Observatory 監査 2 view (P1-4)
監査 tab は 2 view: (a) **case lifecycle view** (受付→AI処理→入力者確認→承認者承認→反映 の業務順) + (b) **raw event ledger view** (actor / role / SoD evidence / before-after / source doc / policy version / approval id / exportable schema)。UI は業務語、詳細は exportable。

### 9.4 投入 context の確定 (§8 を override)
Claude Design 投入 context は `claude-design-bundle-v2/context/` の **9 file のみ**:
`01-design-system` / `02-ia-overview-v2` / `03-screen-contracts-v2` / `04-reconcile-panel-spec` / `05-metric-vs-threshold-spec` / `06-consequence-panel-spec` / `07-process-selector-spec` / `08-allowed-actions-and-state-transitions` / `09-mock-fixture-spec-v2`。
§8 に挙げた charter-summary / research-compounder-refs / prototype-current-reference は **historical 行き** (design-system.md に必要分統合済、`claude-design-upload-manifest.md` 参照)。

### 9.5 v2 screen output dir
9 画面 export は `screens-v2/0N-{page}/` に保存: `01-hub` / `02-cases` / `03-approvals` / `04-case-detail` / `05-proposals` / `06-proposal-detail` / `07-agents` / `08-agent-detail` / `09-observatory`。

### 9.6 関連 spec (本 SSOT の詳細は各 spec に委譲)
- `reconcile-panel-spec.md` (R-RECON、CaseDetail pilot gate) / `metric-vs-threshold-spec.md` (R-AGENT-02 / R-PROP-02) / `consequence-panel-spec.md` (R-AGENT-03 / R-PROP-03) / `process-selector-spec.md` (R-PROC-01) / `allowed-actions-and-state-transitions.md` (R-VALID / operate 完了条件) / `mock-fixture-spec-v2.md` (固定数値) / `screen-contracts-v2.md` (9 画面 contract) / `coverage-matrix-v2.md` (F-* × R-* 充足)

## Change Log

| Date | Change |
|---|---|
| 2026-05-27 | 初版。Process-First IA (Global Process Selector + 9 画面 + master 3 新設)、operational-audit 18 要件を 9 画面に mapping、横断 component 4 種 (ReconcilePanel / MetricVsThreshold / ConsequencePanel / ProcessSelector)、confidence→reconcile 置換確定 |
| 2026-05-27 | §9 patch 追加 (critical review 反映): 承認者 scope-in / ProcessSelector role landing / Observatory 2 view / context 9 file 確定 (§8 override) / screens-v2 output dir / 関連 spec 委譲 | 
