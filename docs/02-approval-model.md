# Backoffice AI v2 — 承認モデル (Approval Model)

| 項目            | 値                                                                             |
| --------------- | ------------------------------------------------------------------------------ |
| 文書 ID         | DOC-APP-02                                                                     |
| 文書名          | 承認モデル (3 層承認 + 4-eyes + Matrix A/B/C + Automation Maturity)            |
| 版数            | v0.1                                                                           |
| ステータス      | Draft                                                                          |
| オーナー        | backoffice-ai-v2 maintainer                                                    |
| 承認者          | self — 設定承認 (承認モデルの確定)                                             |
| 閲覧対象        | Internal / Project team                                                        |
| 機密区分        | Internal                                                                       |
| 関連文書        | DOC-OV-00, DOC-FW-01, DOC-UI-03, DOC-MON-05, DOC-S4-06, DOC-ROOT-prior-art-map |
| SSOT 区分       | 3 層承認 + 4-eyes 構造 + Matrix A/B/C RACI + Automation Maturity の SSOT       |
| Evidence Status | N/A (設計のみ、定量値なし)                                                     |
| 改版履歴        | v0.1 (2026-05-24): 初版作成 (Day 4)                                            |

---

## 1. 全体構造 (3 軸の関係)

3 軸の交差で承認モデルが構成される:

- **3 層承認** (案件承認 / 手順承認 / 設定承認): 何を承認するか
- **4-eyes**: 案件承認の構造 (入力者確認 + 承認者承認 が揃って全体を構成)
- **Automation Maturity** (Supervised / Checkpoint / Autonomous): いつ承認を発動するか

### 1.1 1 枚図 (ASCII)

```
                          ┌───────────────────────────────────────┐
                          │   3 軸の交差                          │
                          │                                       │
  3 層承認 ──────────────►│  ① 案件承認 (4-eyes)                  │
  (何を承認)              │  ② 手順承認 (knowledge → procedure)   │
                          │  ③ 設定承認 (Agent / Model / Tool)    │
                          │                                       │
  4-eyes ────────────────►│  入力者確認 + 承認者承認 = 案件承認   │
  (案件承認の構造)        │  (単独では 4-eyes と呼ばない)         │
                          │                                       │
  Automation Maturity ───►│  Supervised: 全件 4-eyes              │
  (頻度)                  │  Checkpoint: 重要分岐のみ             │
                          │  Autonomous: サンプリング (将来)      │
                          │  ▸ 知識・設定承認 loop は不変         │
                          └───────────────────────────────────────┘
```

### 1.2 規制語の hedge ルール (再確認)

本 doc 内で `MRM` / `CISO` / `Risk` / `NYDFS` / `SR 11-7` / `CCPA` / `OFAC` / `BSA` / `SAR` / `CTR` / `ECOA` を使う時:

- **事実主張** → 禁止
- **参照のみ** → §10 に prior art pointer 一覧として集約、ai-operator paper への reference link 形式

v2 docs では `Security 関係者` / `Compliance 関係者` を **docs 内部の補助語彙** として使う。これは Tier 2 (UI label OK) には含めず、本 doc + Matrix RACI 内部のみで使用する。UI / slide / mock data には出さない。

## 2. 案件承認 (Case Approval)

### 2.1 定義

個別案件の処理結果 (AI 入力結果 + 業務システム状態 + Alert) を人間が確認する承認。

### 2.2 4-eyes 構造

| 段階       | 役割   | 内容                                                   | 反映タイミング                          |
| ---------- | ------ | ------------------------------------------------------ | --------------------------------------- |
| 入力者確認 | 入力者 | AI 入力結果を accept / 差戻し (5-category + free-text) | 送信時 (prototype では同一セッション内) |
| 承認者承認 | 承認者 | 入力者承認済の最終確認                                 | 承認時 (prototype では同一セッション内) |

**4-eyes** はこの 2 者が揃った案件承認全体を指す呼称。入力者確認単独 / 承認者承認単独に対しては使わない (DOC-FW-01 §2.1 と整合)。

SoD: 入力者 ≠ 承認者 (システム制約として強制、同一人物による self-approval は禁止)。

### 2.3 反映 SLO

- prototype: 同一セッション内に mock state 更新
- 本番 SLO は Phase 1 で要定義 (本 doc では分単位の数値を断定しない)

### 2.4 エスカレーション条件

以下のいずれかで案件承認 path を外れ、Matrix C §8 の Escalation lane に進む:

- Alert 発火 + 入力者・承認者の判断不能
- 業務責任者の介入が必要 (高リスク要素検知)
- データ整合性異常 (5-category の `data_error`)

## 3. 手順承認 (Procedure Approval)

### 3.1 定義

差戻しコメントを正式手順に反映する承認。knowledge → procedure / workflow.md / agent-instructions.md / approval-policy.md への昇格 trigger。

### 3.2 主体 (RACI)

- **R (起票)**: Manual 管理者
- **A (承認)**: 業務責任者
- **C (合議)**: SME / AI 管理者 (影響範囲確認)
- **I (通知)**: 入力者 / 承認者 (反映後の運用に影響)

### 3.3 Trigger

DOC-FW-01 §4.1 が SSOT。要点:

- 同種の差戻しが複数 case で再発 (demo mock では 3 件まとめて表示、本番 threshold は Phase 1 で要定義)
- Manual 管理者が `proposals/pending/` に手順更新提案を起票
- 提案画面は ProposalReviewPage (`/proposals/:id`、DOC-UI-03)

### 3.4 反映範囲

業務責任者が承認すると以下のファイルに diff 適用:

- `workflows/{業務}/workflow.md`
- `workflows/{業務}/agent-instructions.md`
- `workflows/{業務}/approval-policy.md`
- `workflows/{業務}/knowledge/staging/*.md` → `workflows/{業務}/knowledge/compiled/*.md` (move、weight 上げ)

**`workflows/{業務}/BOUNDARY.md` は通常 loop の更新対象外** (DOC-FW-01 §4.3 参照)。BOUNDARY.md 変更は scope 拡張・自動化禁止条件見直しを伴うため、明示的な設定承認 + plan update を経る別 process で扱う。

### 3.5 反映タイミング

- 手順承認後、AI runtime は次の case 処理から新版を参照
- 過去 case は遡って書き換えない (DOC-FW-01 §6.3 audit trail 保護原則)

### 3.6 SoD

Manual 管理者 ≠ 業務責任者 (システム制約として強制、起票者と承認者の同一人物化は禁止)。

## 4. 設定承認 (Configuration Approval) — Type A/B/C

### 4.1 定義

AI の権限・モデル・プロンプト・ツール変更を承認。DOC-FW-01 §5 から委譲された SSOT。

### 4.2 Type 区分

| Type                                | 対象                                                            | R (起票)  | A (承認)                                | co-A |
| ----------------------------------- | --------------------------------------------------------------- | --------- | --------------------------------------- | ---- |
| **Type A 通常**                     | Prompt minor update / 既存 Tool 範囲内 / Model patch release    | AI 管理者 | AI 管理者 (起票者 ≠ 承認者の SoD 強制)  | なし |
| **Type B Security-impacting**       | 新 external tool / 権限拡張 / data boundary 変更 / 認証方式変更 | AI 管理者 | AI 管理者 + Security 関係者             | 必須 |
| **Type C Automation Maturity 変更** | Supervised → Checkpoint → Autonomous の段階変更                 | AI 管理者 | AI 管理者 + 業務責任者 (業務リスク受容) | 必須 |

Type 例:

- Type A: Agent-X の prompt v1.3 → v1.4
- Type B: 外部 vendor LLM 新規採用、PII scope 拡大
- Type C: UC-BO-01 法人住所変更処理を Supervised → Checkpoint

### 4.3 Type A の SoD (重要)

Type A は AI 管理者の承認 path だが、**同一 change の起票者本人によるセルフ承認は禁止**。同一 change の起票者 ≠ 承認者であることをシステム制約として強制する。

運用パターン:

- **複数 AI 管理者体制**: 組織内の AI 管理者ロールを持つ別人物が承認 (default)
- **1 人体制の組織 (fallback)**: Type A も co-A (= 業務責任者 または Security 関係者) を必須とする運用
- 起票と承認を別 commit / 別 timestamp で記録、AuditTrail に SoD evidence として残す

### 4.4 反映タイミング

- Ad-hoc + batch
- 適用前に必ず rollback plan を記録、適用後の基本動作確認を必須化する (本番 SLO は Phase 1 で要定義、本 doc では時間値を断定しない)

### 4.5 Type 判定

変更 diff + scope を system automated で判定し、Type A/B/C に振る (DOC-UI-03 AgentSettingsPage で表示)。判定ロジックは Phase 1 で要定義、v2 では mock data で固定 (mock-agents.ts)。

## 5. 役割定義 (5 主要 + 1 補助)

### 5.1 主要 5 役割 (CLAUDE.md Tier 1 と整合)

| 役割              | 主要責任                                           | 主に関与する承認                      |
| ----------------- | -------------------------------------------------- | ------------------------------------- |
| **入力者**        | 業務実行、AI draft レビュー、修正コメント入力      | 案件承認の前段確認 (入力者確認)       |
| **承認者**        | 案件承認の業務側最終確認                           | 案件承認の最終確認 (承認者承認)       |
| **業務責任者**    | 業務の正解を決める、手順承認の最終 approver        | 手順承認 (A) / 設定承認 Type C (co-A) |
| **Manual 管理者** | 業務手順ファイル群の curator、手順更新提案の起票者 | 手順承認 (R)                          |
| **AI 管理者**     | Agent 登録・更新・停止、設定承認主導               | 設定承認 (R + A)                      |

### 5.2 補助 1 役割

| 役割        | 主要責任                       | 関与する承認                                                          |
| ----------- | ------------------------------ | --------------------------------------------------------------------- |
| **Auditor** | 監査 trail の reader、独立検証 | 承認なし (read-only)、Audit Trail 画面 (`/audit`、DOC-UI-03) の owner |

### 5.3 docs 内部の補助語彙 (Tier 3 裏設計の総称、UI/slide には出さない)

ai-operator paper では Risk / MRM / Compliance / CISO が固有部署として登場するが、v2 では総称表現に rename:

| v2 内部語彙           | ai-operator 対応 (prior art)                  | 出現箇所                                     |
| --------------------- | --------------------------------------------- | -------------------------------------------- |
| **Security 関係者**   | CISO + Security Officer + Risk (Security 側)  | §4.2 Type B co-A、§8 Matrix C Emergency stop |
| **Compliance 関係者** | Compliance Officer + Legal + MRM (model risk) | §3 手順承認 C (合議、escalation 時)          |

これら総称は **docs 内部限定**。Session 4 slide / UI label / mock data には出さない。CLAUDE.md Tier 2 (UI label OK) には含めず、本 doc + Matrix RACI 内部のみで使用する。CLAUDE.md の Tier 2 を変更する必要が出た場合は別途 plan update で扱う。

## 6. Matrix A — 承認対象ごとの基本責任 (RACI)

R: 起票責任 / A: 最終承認 / C: 合議 / I: 通知

| 活動                      | 入力者 | 承認者 | 業務責任者      | Manual 管理者 | AI 管理者  | Auditor | Security 関係者 |
| ------------------------- | ------ | ------ | --------------- | ------------- | ---------- | ------- | --------------- |
| **案件承認 (入力者確認)** | R+A    | -      | C (escalate 時) | I             | -          | I       | -               |
| **案件承認 (承認者承認)** | I      | R+A    | C (escalate 時) | I             | I          | I       | -               |
| **手順承認**              | I      | I      | A               | R             | C          | I       | -               |
| **設定承認 Type A**       | -      | -      | I               | I             | R+A (別人) | I       | -               |
| **設定承認 Type B**       | -      | -      | I               | I (影響時)    | R+A        | I       | A (co-A)        |
| **設定承認 Type C**       | -      | -      | A (co-A)        | I (影響時)    | R+A        | I       | -               |

### 6.1 SoD 原則

- 案件承認: 入力者 ≠ 承認者 (4-eyes)
- 手順承認: Manual 管理者 ≠ 業務責任者 (起票 ≠ 承認)
- 設定承認 Type A: 同一 change の起票者 ≠ 承認者 (組織内 AI 管理者ロールの別人物、または fallback で co-A 必須)
- 設定承認 Type B: AI 管理者 + Security 関係者 co-A 必須
- 設定承認 Type C: AI 管理者 + 業務責任者 co-A 必須

## 7. Matrix B — Automation Maturity 別の最低人間関与

| Automation 段階   | 案件承認の介在         | 手順承認 | 設定承認 |
| ----------------- | ---------------------- | -------- | -------- |
| Supervised        | 全件 (入力者 + 承認者) | 通常     | 通常     |
| Checkpoint        | 重要分岐のみ           | 通常     | 通常     |
| Autonomous (将来) | サンプリング           | 通常     | 通常     |

### 7.1 不変条件

**Automation Maturity が進化しても、知識・設定承認 loop は縮小しない**。縮小するのは案件承認 (= 入力者確認 + 承認者承認) の介在頻度のみ。

これは v2 の重要 message であり、DOC-FW-01 §7.1 と整合、Session 4 Slide 7 (DOC-S4-06) で参加者に伝える核となる。

### 7.2 出典 (prior art pointer)

`ai-operator/docs/01-hitl-policy.md` line 198-204 (Matrix B 該当)。外部規制根拠ではなく、ai-operator paper の設計判断を v2 が継承したもの。本 v2 では prior art reference として扱う。

## 8. Matrix C — 例外・緊急時の権限 (policy-only)

**本 §8 は policy 記述のみ。Exception Center / Incident Console 等の専用 UI 画面は v2 で実装しない**。AuditTrailPage (`/audit`、DOC-UI-03) で過去の Matrix C 発動を timeline 表示するのみ。

### 8.1 4 例外パス

| 活動                 | 発動条件                                     | R / A                                                         | 反映タイミング                        | ログ要件                                         |
| -------------------- | -------------------------------------------- | ------------------------------------------------------------- | ------------------------------------- | ------------------------------------------------ |
| **Escalation**       | 高リスク要素検知 / 不確実性 / ルール衝突     | R: 入力者または承認者、A: 業務責任者 (受領)                   | 案件処理中に即時                      | 理由、リスク区分、引き受け者                     |
| **Emergency stop**   | Incident (drift / データ漏洩疑い / 異常出力) | R+A: AI 管理者 または Security 関係者 (即時可、事後 co-A)     | 即時可 (本番 SLO は Phase 1 で要定義) | stop timestamp、発動者、対象 Agent / scope       |
| **Rollback**         | Emergency stop 後の restore 判断             | R: AI 管理者、A: 業務責任者 (事後承認 = retroactive 設定承認) | 検知から早期に完了 (本番 SLO は未定)  | 変更差分、影響 case 再評価、retroactive 承認記録 |
| **Forced Downgrade** | KPI 悪化 / UI drift 検知 / 例外発生率異常    | R+A: AI 管理者 または Security 関係者 (単独可、事後 co-A)     | 検知から早期 (本番 SLO は未定)        | trigger 詳細、降格前/後レベル、影響範囲          |

### 8.2 v2 prototype での見せ方

- Matrix C 発動は本 doc の policy 記述のみ
- prototype では AuditTrailPage (`/audit`) で過去の発動 event を mock data で表示 (mock-audit.ts の 12 件のうち 1-2 件)
- 専用 UI (Exception Center / Incident Console) は v2 では作らない (DOC-UI-03 9 画面に含まない)

## 9. Automation Maturity 詳細

### 9.1 Supervised (初期レベル、v2 prototype の default)

- 行動 spec: AI は draft を作成、全ステップで入力者が確認・差戻し → 承認者が業務承認
- 人間介入率: 100% (全案件)
- 適用対象: 新規投入業務、v2 prototype の現状 default、UC-BO-01 法人住所変更処理
- v2 prototype での挙動: mock-cases.ts の全 case が Supervised level、Trust Level Badge が `supervised` 表示

### 9.2 Checkpoint (中間レベル)

- 行動 spec: AI は自律処理、重要分岐 (金額 threshold / 顧客リスク区分変化 / 例外検知) で 4-eyes 案件承認
- 人間介入率: 重要分岐発生 case のみ
- 適用対象: §9.4 昇格条件を満たした業務
- v2 prototype での挙動: Metrics 画面 (DOC-MON-05) で「Checkpoint 到達条件」を visual 表示するのみ、実挙動なし

### 9.3 Autonomous (将来モデル、低リスクのみ)

- 行動 spec: AI は事前ルール内で完結、サンプリングレビューで人間が事後確認、Mandatory Human Checkpoint は必ず実行
- 人間介入率: サンプリング率 (本番 threshold は未定)
- 適用対象: §9.4 昇格条件を満たし、低リスク判定された業務のみ
- **v2 prototype では実挙動なし**。Metrics 画面で「Autonomous 到達条件」「不変条件 (知識・設定 loop は縮小しない)」を visual 表示するのみ。Session 4 audience には将来モデルの説明として提示

### 9.4 昇格条件 (multi-criteria 仮説 gate)

DOC-MON-05 が SSOT。要点:

- 4 KPI 仮説 gate: AI 入力承認率 ≥ 99% `[仮説 / 要検証]` + 人手上書き率 ≤ 1% `[仮説]` + Alert 発生率 ≤ 5% `[仮説]` + 承認者差戻し率 ≤ 1% `[仮説]`
- 実 gate ではなく Session 4 説明用の仮説値
- 昇格 = Type C 設定承認 (AI 管理者 + 業務責任者 co-A)

### 9.5 降格 trigger

- KPI 悪化 (4 KPI のいずれかが gate 値を下回る)
- UI drift 検知 (業務システム UI 変更で AI 入力が失敗増)
- 例外発生率異常
- 降格 = Matrix C Forced Downgrade (§8.1)

### 9.6 非対象業務 (Autonomous 永続禁止)

以下は Autonomous に到達できない。Phase が進んでも Supervised / Checkpoint レベルまで:

| 業務                                 | v2 での扱い                                                        | 理由                                       |
| ------------------------------------ | ------------------------------------------------------------------ | ------------------------------------------ |
| 国際送金                             | `workflows/international-transfer-boundary/` に boundary spec のみ | 高額・規制リスク・国境を越えた人間判断必須 |
| KYC 最終判定                         | v2 では boundary 文書化しない (Phase 2+ scope)                     | 顧客リスク区分の最終判断は人間             |
| 与信最終承認                         | v2 では boundary 文書化しない (Phase 2+ scope)                     | 与信判断の最終承認は人間                   |
| 組織的判断・規制要件で禁止される業務 | 業務責任者 + Security 関係者の判断                                 | case-by-case                               |

## 10. 規制 cite の hedge (prior art pointer 一覧)

本 doc の各 section で参照する prior art pointer。すべて `ai-operator/docs/01-hitl-policy.md` への reference link、外部規制論拠ではない:

| 本 doc section         | 参照箇所 (ai-operator/docs/01-hitl-policy.md)                | 内容                                       |
| ---------------------- | ------------------------------------------------------------ | ------------------------------------------ |
| §3 手順承認            | line 94-103 (§3.2 Knowledge Approval)                        | knowledge → procedure 昇格の主体・反映範囲 |
| §4 設定承認 Type A/B/C | line 105-148 (§3.3 Type A/B/C 詳細)                          | Type 区分・co-A 条件                       |
| §4.3 Type A SoD        | line 81-103 (§3.1 業務承認 + §3.2 知識承認の SoD 議論)       | 起票者 ≠ 承認者原則                        |
| §6 Matrix A            | line 175-194 (§5 Matrix A)                                   | RACI 表構造                                |
| §7 Matrix B            | line 198-204 (§5 Matrix B)                                   | Automation Maturity との関係、不変条件     |
| §8 Matrix C            | line 206-213 (§5 Matrix C)                                   | 例外・緊急時の権限                         |
| §9 Automation Maturity | line 217-243 (§6 Supervised / Checkpoint / Autonomous)       | 各段階の行動 spec                          |
| §9.6 非対象業務        | line 240-242 (§6.4 非対象業務) + `00-vision-charter.md` §4.2 | Autonomous 永続禁止業務                    |

v2 docs 内では `MRM` / `CISO` / `NYDFS` / `SR 11-7` / `CCPA` / `OFAC` / `BSA` / `SAR` / `CTR` / `ECOA` を事実主張せず、上記 prior art pointer のみを使う。Session 4 slide / UI label / mock data には完全に出さない。

## 11. 関連文書

- DOC-OV-00 §1.2 中核 message (Flywheel の前提となる承認モデル)
- DOC-FW-01 §2.1 入力者確認、§4 手順承認 trigger、§5 設定承認 trigger、§7 Matrix B 不変条件
- DOC-UI-03 9 画面 (Case Review / ProposalReview / AgentSettings / AuditTrail への RACI 反映)
- DOC-MON-05 4 KPI 仮説 gate (Automation Maturity 昇格条件)、9 KRI (Forced Downgrade trigger)
- DOC-S4-06 Session 4 Slide 3 (案件承認の 4-eyes と scope-out)、Slide 7 (Trust Level Progression と不変条件)、Slide 8 (Metrics + multi-criteria gate)
- DOC-ROOT-prior-art-map ai-operator paper への reference link 集約
