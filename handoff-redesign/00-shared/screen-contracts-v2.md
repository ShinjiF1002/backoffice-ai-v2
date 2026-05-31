# Screen Contracts v2 (9 画面)

> 各画面の operate 完了に必要な契約。Claude Design prompt の各画面 Acceptance check はこの contract から導出する。

## 凡例
Screen(route) / Role / Process context / Master-Detail / Primary decision (この画面で決めること) / Required data / Required component / Validation gate / Audit event / Anti-pattern (禁止表現)

---

## 全画面共通 UI コピー原則 (pilot review ① 由来、9 画面に適用)

画面に出してよいのは **operator が判断に使う情報だけ**。要件の traceability や system 内部語を画面に書くこと自体が認知負荷。**以下は spec / ledger / code comment 専用で、どの画面の UI にも出さない**:

- 要件 ID (`R-*`)、audit event 名 (`human_sendback` `proposal_forward` `config_approve` 等)、status enum literal (`sent-back` `pending-triage` `forwarded` 等)
- system 内部語 (`confidence` `OCR raw` `master` `正規化` `突合` `3 者` `field 平均` `trigger` `cron`)
- 開発注記 (`(mock)` `(demo)`)、英語断片の実装メモ (`requires resolve of …` 等)

必要な情報は **operator にわかる平易 JP に翻訳**して出す (status は「確認待ち」「差戻し済」等の業務語、AI 判断根拠は「なぜ確認が必要か」を行動文で)。各画面の Anti-pattern はこの原則の画面別具体化。詳細・対訳例は `reconcile-panel-spec.md` §UI 言語規範。

---

## 全画面共通 検証・操作原則 (pilot review rev.3 由来、sign-off 系画面に適用)

人が AI 出力に sign-off する画面 (CaseDetail / ProposalDetail / AgentDetail = C 型 detail) に共通適用。詳細は `cross-screen-refresh-findings.md`。

- **A 全体レビュー可能性**: 判断対象の**全体**を見せる。注意項目だけを default 表示し残りを隠さない。理由: (i) sign-off の説明責任、(ii)「AI が自信を持って間違える未フラグ誤り」(reconcile §7) は隠した所に潜む。注意順に並べてよいが折りたたみ default にしない。
- **B 証拠アンカー可視性**: 判断の一次証拠を、参照 chip ではなく**読めるサイズで併置**し、入力値と相互リンクして見比べられる。
- **C 単一決定面**: 1 画面の standing 決定ボタンは **1 セット**。object 単位 (案件承認/差戻し 等) の決定と field/部分単位の操作を 2 セット併存させない。部分操作は行クリック→modal に畳み込む。
- **D nav/section ラベル平易化**: 内部概念名を operator 語に (例: 観測→**モニタリング**)。

---

## 1. Hub (`/`) — A 型
- **Role**: 全 role (landing は role 別、process-selector-spec §role landing)
- **Process**: selector 連動 (全業務=横断 Alert / 特定=Process 状況)
- **Master-Detail**: master (Alert → drill で各 Process の画面へ)
- **Primary decision**: 今どの Process に問題があるか / 次に何を見るか
- **Required data**: Process 別 Alert (注意 / SLA 経過 / 承認待ち) に **Process tag**
- **Required component**: ProcessSelector, Alert card (Process tag), PrimaryAnchor
- **Validation**: なし (参照)
- **Audit**: なし
- **Anti-pattern**: 全社合算で Process 不明 (F-19) / vanity KPI を Headline

## 2. 案件一覧 (`/cases`) — B 型
- **Role**: 入力者
- **Process**: scoped
- **Master-Detail**: master (row click → 案件詳細)
- **Primary decision**: 次にどの案件を処理するか
- **Required data**: 案件 queue (ID / 業務 / 状態 / 経過 / 担当 / reconcile サマリ「要確認 N」)
- **Required component**: table, ReconcilePanel summary (drawer 内)
- **Validation**: なし
- **Audit**: なし
- **Anti-pattern**: 右パネル default 表示 (F-16) / confidence 生数字 (F-17)

## 3. 承認待ち (`/approvals`) — B 型 ★新設
- **Role**: 承認者
- **Process**: scoped
- **Master-Detail**: master (row → 案件詳細 checker mode)
- **Primary decision**: 入力者確認済をどれから最終承認するか
- **Required data**: business-approval-waiting queue + 入力者の判断 + reconcile 結果サマリ
- **Required component**: table
- **Validation**: SoD (承認者 ≠ 入力者、system 強制)
- **Audit**: business_approve / human_sendback
- **Anti-pattern**: 画面欠落 (旧 scope-out、R-APPR-01)

## 4. 案件詳細 (`/cases/:id`) — C 型 ★pilot
- **Role**: 入力者 / 承認者 (mode 切替)
- **Process**: scoped
- **Master-Detail**: detail (案件一覧 / 承認待ち から navigate)
- **Primary decision**: AI 入力を申請書類と照合し承認するか差戻すか (承認者 mode = 最終承認); 反映済は承認者/業務責任者が訂正/取消 (前進のみ→可逆、W3 C3)
- **Required data**: FieldReview (reconcile 6 状態) **全件** + source locator + **申請書類 mock (fixture §11)** + LifecycleStepper
- **Required component**: **ReconcilePanel** (pilot gate) = 文書アンカー型 2-pane (左 申請書類ビューア / 右 全項目)、LifecycleStepper、統合「項目の対応」modal、反映済の訂正/取消 ReasonDialog (理由必須)
- **Validation**: 要確認残存で承認 disabled / 差戻しコメント必須 (R-VALID-01) / override 理由必須 / 反映済の訂正・取消は理由必須 (承認者/業務責任者のみ)
- **Audit**: human_review / human_sendback / field_override / escalate / case_reverse (訂正/取消)
- **Anti-pattern**: confidence 生数字 (F-12/15) / 別 route 差戻し (R-CASE-01) / **一致を折りたたみ default で全項目を隠す (原則 A 違反、rev.3)** / **申請書類が小さい参照 chip 止まり (原則 B、rev.3)** / **field 行と footer の決定ボタンが 2 セット併存 (原則 C、rev.3)**

## 5. 提案一覧 (`/proposals`) — B 型 ★新設
- **Role**: Manual 管理者
- **Process**: scoped
- **Master-Detail**: master (row → 提案詳細)
- **Primary decision**: どの提案を triage するか
- **Required data**: 提案 list (ID / 業務 / **どの部分の改定か** / 影響件数 / status)
- **Required component**: table
- **Validation**: なし
- **Audit**: なし
- **Anti-pattern**: 一覧欠落・どの Process か不明 (F-09)

## 6. 提案詳細 (`/proposals/:id`) — C 型
- **Role**: Manual 管理者 / 業務責任者
- **Process**: scoped
- **Master-Detail**: detail
- **Primary decision**: forward / reject (Manual) → 承認 (業務責任者)
- **Required data**: 判定基準 + **実績値** + before/after **consequence** + **手順 before/after 全体** + **根拠となった差戻し case 群 (読める形)**
- **Required component**: MetricVsThreshold, ConsequencePanel, (手順 diff/全文 view, 根拠 case リスト)
- **Validation**: forward は実績値確認 / reject・差戻し 理由必須
- **Audit**: proposal_forward / reject / approve (R-PROP-04)
- **Anti-pattern**: 実績値なし (F-10) / 影響不明 (F-11) / **diff だけで手順全体を見せない (原則 A、rev.3)** / **根拠 case が要約のみで原文参照不可 (原則 B、rev.3)** / **forward/reject と承認/差戻しを 2 セット同時表示 (原則 C — mode で出し分け、rev.3)**

## 7. エージェント一覧 (`/agents`) — B 型 ★新設
- **Role**: AI 管理者
- **Process**: scoped (全業務 = 全 Agent 横断)
- **Master-Detail**: master (row → エージェント詳細)
- **Primary decision**: どの Agent の Trust を見直すか
- **Required data**: Agent list (名 / 業務 / Trust Level / 直近パフォーマンス sparkline / 昇格可否)
- **Required component**: table, Sparkline
- **Validation**: なし
- **Audit**: なし
- **Anti-pattern**: 一覧欠落 (F-07)

## 8. エージェント詳細 (`/agents/:id`) — C 型
- **Role**: AI 管理者
- **Process**: scoped
- **Master-Detail**: detail
- **Primary decision**: Trust 昇格を申請するか
- **Required data**: **実 metrics vs threshold (4 KPI 全部)** + **consequence** (昇格の帰結) + **metrics の裏の実行履歴 / sample case (参照可)**
- **Required component**: MetricVsThreshold, ConsequencePanel
- **Validation**: 申請は metrics + consequence 確認後 enabled
- **Audit**: config_change_request
- **Anti-pattern**: 進化要件 75% 集約値 (F-06) / consequence なし (F-08) / **未達 KPI だけ見せ 4 KPI 全件を隠す (原則 A、rev.3)** / **metrics の裏付け sample が参照不可 (原則 B、rev.3)** / **申請ボタンと別の操作セットが競合 (原則 C、rev.3)**

## 9. モニタリング (`/observatory`、内部名 Observatory) — A 型 (3 tab)
- **UI ラベル**: 「モニタリング」(旧「観測」を rename、原則 D)。route / 内部名は `Observatory` 維持
- **Role**: 監査者
- **Process**: scoped (全業務 = 横断)
- **Master-Detail**: hub (3 tab: 監査 / メトリクス / ナレッジ)
- **Primary decision**: Process 別の状態・AI 精度・証跡を監視
- **Required data**: 監査 = **lifecycle view + raw event ledger view の 2 view** / metrics = Process 別 KPI / ナレッジ = Process 別 grouping
- **Required component**: ProcessSelector, timeline (2 view), MetricVsThreshold
- **Validation**: なし (read-only)
- **Audit**: (監査 view 自体)
- **Anti-pattern**: Process 横断のみ (F-01/04/05) / timeline 論理矛盾・AI 時刻なし・承認者 event 欠落 (F-02/03) / cron 用語 (F-03)

---

## typology lock
A 型 (Hub / Observatory) ×2 / B 型 (案件一覧 / 承認待ち / 提案一覧 / エージェント一覧) ×4 / C 型 (案件詳細 / 提案詳細 / エージェント詳細) ×3。

> **remediation 画面拡張 (2026-05-30)**: 9 → **11** (W2b/P1-2: `/search`・`/inbox` = B ×2 → A×2/B×6/C×3、✓) → **14** (W2c/P1-3 ✓: 業務責任者面 3 画面 = A×3/B×8/C×3)。新画面の画面契約は **remediation-roadmap §1b ledger + §3.2/§3.3** が SSOT。本 doc 冒頭の「9 画面」は historical baseline。
