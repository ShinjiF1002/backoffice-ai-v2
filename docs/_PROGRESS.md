# Backoffice AI v2 — 進捗管理 tracker

| 項目            | 値                                                                                       |
| --------------- | ---------------------------------------------------------------------------------------- |
| 文書 ID         | DOC-ROOT-\_PROGRESS                                                                      |
| 文書名          | 進捗管理 tracker (Day 1-22 status + Plan v1.3 影響分析 + Verification gate 一覧)         |
| 版数            | v0.1                                                                                     |
| ステータス      | Active (Day 5 末で起稿、各 Day 末で update)                                              |
| オーナー        | backoffice-ai-v2 maintainer                                                              |
| 承認者          | self                                                                                     |
| 閲覧対象        | Internal / Project team                                                                  |
| 機密区分        | Internal                                                                                 |
| 関連文書        | DOC-ROOT-\_SSOT, DOC-ROOT-prior-art-map, Plan v1.3 final patch                           |
| SSOT 区分       | Day-by-day status + Plan v1.3 影響分析 + Verification gate の SSOT                       |
| Evidence Status | N/A (進捗管理のみ、定量値なし)                                                           |
| 改版履歴        | v0.1 (2026-05-25): 初版作成 (Day 5 整合化 update 後、Plan v1.3 final patch 影響分析含む) |

Refresh: 各 Day 末で Status table 更新。Day 10 Design Gate / Day 19 SSOT Refresh / Day 21 Final で整合性確認。

---

## 1. Status overview (Day 1-22 + Session 4)

| Day       | Date       | Status        | Commit      | Note                                                                                                |
| --------- | ---------- | ------------- | ----------- | --------------------------------------------------------------------------------------------------- |
| Day 1     | 2026-05-21 | ✅ completed  | `d596387`   | skeleton (README / CLAUDE / .gitignore / prior-art-map / \_SSOT)                                    |
| Day 2     | 2026-05-22 | ✅ completed  | `3f7fee7`   | \_HEADER_TEMPLATE.md (12 項目 header SSOT)                                                          |
| Day 3     | 2026-05-23 | ✅ completed  | `c1e952d`   | 00-overview.md + 01-flywheel-and-knowledge.md                                                       |
| Day 4     | 2026-05-24 | ✅ completed  | `35b67a8`   | 02-approval-model.md                                                                                |
| Day 5     | 2026-05-25 | ✅ completed  | `fb0df04` + `1bd5385` | **整合化 update (Plan v1.3 final patch、6 docs rewrite) + progress tracker + archive 退避 + hygiene patch** |
| Day 6     | 2026-05-26 | 🟡 pending    | -           | workflows/corporate-address-change/ 5 docs + knowledge 6 件 (Snippet 8 field schema 適用)           |
| Day 7     | 2026-05-27 | 🟡 pending    | -           | workflows/account-opening-completeness + workflows/international-transfer-boundary (restricted)     |
| Day 8     | 2026-05-28 | 🟡 pending    | -           | 03-ui-prototype-design.md (Stripe 風 + Wireframe 段階) + 04-knowledge-pipeline.md (AI 日次分析)     |
| Day 9     | 2026-05-29 | 🟡 pending    | -           | 05-metrics-and-gates.md (SLO 移管) + 06-session4-narrative.md (Core msg / Matrix B 新表現)          |
| Day 10    | 2026-05-30 | 🟡 pending    | -           | **Design Gate (大): SSOT 衝突 grep + Refresh + 規制語 grep + 整合性 spot-check**                   |
| Day 11    | 2026-05-31 | 🟡 pending    | -           | UI Wireframe phase (9 画面 low-fi、Day 11-13 の 1 日目)                                             |
| Day 12    | 2026-06-01 | 🟡 pending    | -           | UI Wireframe phase 続き (Day 11-13 の 2 日目)                                                       |
| Day 13    | 2026-06-02 | 🟡 pending    | -           | UI Wireframe phase 完了 (Day 11-13 の 3 日目、9 画面 low-fi 完成)                                  |
| Day 14    | 2026-06-03 | 🟡 pending    | -           | UI medium-fi phase (Hero 3 画面に design token 適用、Day 14-15 の 1 日目)                          |
| Day 15    | 2026-06-04 | 🟡 pending    | -           | UI medium-fi phase 完了 (Day 14-15 の 2 日目)                                                       |
| Day 16    | 2026-06-05 | 🟡 pending    | -           | UI high-fi phase (Hero 3 = 95% + マイクロインタラクション、Day 16-18 の 1 日目)                    |
| Day 17    | 2026-06-06 | 🟡 pending    | -           | UI high-fi phase 続き (Day 16-18 の 2 日目)                                                         |
| Day 18    | 2026-06-07 | 🟡 pending    | -           | UI high-fi phase 完了 (Hero 3 = 95% + 残り 6 = 85%、Day 16-18 の 3 日目)                            |
| Day 19    | 2026-06-08 | 🟡 pending    | -           | SSOT Refresh + cowork-workshop/CLAUDE.md + workshop-design.md update                                |
| Day 20    | 2026-06-09 | 🟡 pending    | -           | demo (demo-script.md + business-approval-view.html + screenshot export)                             |
| Day 21    | 2026-06-10 | 🟡 pending    | -           | Final integration + 規制語 grep + 旧表現 grep + 全体整合性                                          |
| Day 22    | 2026-06-11 | 🟡 pending    | -           | Session 4 rehearsal (60 min run-through) + 最終 review                                              |
| Session 4 | 2026-06-12 | 🎯 milestone | -           | 本番 (Backoffice AI v2 構想共有、audience 10 名)                                                     |

凡例: ✅ completed / 🟡 pending / 🔵 in_progress / 🎯 milestone

---

## 2. Plan v1.3 final patch の Day 6 以降への影響分析

Plan v1.1.2 (22-day base) に Plan v1.3 final patch (Day 5 整合化 update) を overlay。Day 6 以降の各 day で何が影響を受けるか、何を反映すべきかを整理する。

### 2.1 Day 6: workflows/corporate-address-change/ (5 docs + knowledge 6 件)

**影響項目**:

- **Snippet schema 適用**: knowledge 6 件 (staging 3 + compiled 3) すべてが 8 field frontmatter (`date / workflow_id / workflow_slug / agent_id / agent_version / source_case / category / weight`)
- **`weight` 値域**: 信頼度限定 (`low` = staging、`medium` = reviewed staging、`high` = compiled approved)
- **`workflow_id`**: `UC-BO-01`、`workflow_slug`: `corporate-address-change`、`agent_id`: `agent-corporate-address-change`、`agent_version`: `v0.1` (仮値)
- **`category`**: 5-category enum (`misunderstanding / ui_change / edge_case / judgment_gap / data_error`)、`data_error` は通常 compiled 昇格対象外
- **`agent-instructions.md`**: AI が日次分析で Procedure Update Proposal を自動生成する流れ、Manual 管理者が Queue owner として triage する文書化 (DOC-FW-01 §4 + DOC-APP-02 §3 と整合)
- **`approval-policy.md`**: 過去 case 関連ルール更新 Alert (3 適用範囲: 未承認 / 承認済み / 新規) を反映、Alert 文言案 (関連手順が更新されています / このcase作成後に承認されたルールがあります / AI提案本文は当時のまま保持されています)
- **`workflow.md`**: 中核 message (差戻しを、次の正解手順に変える仕組み) と整合する記述、業務目的 / 手順 / 期待状態 / 禁止事項
- **`_meta.yaml`**: `automation_status: active`、`trust_level: supervised` (v2 default)、`risk_level: medium`

**要 user 確認 (前 turn の outline gate)**:

1. Owner マップ (workflow / agent-instructions / approval-policy / \_meta.yaml / knowledge の owner と承認層)
2. スクショ粒度 (8 step × 8 枚)
3. Alert 5 条件 (KYC overlap / 過去 90 日他届出 / 国土地理院 API 未確認 / 法人格変更 / 銀行 vs 登記住所整合性)
4. Knowledge snippet schema (frontmatter、§2.1 で 8 field に拡張済)
5. knowledge 6 件の内訳 (staging 3: 福岡 / 国際郵便 / 透かし + compiled 3: OCR confidence / 法人格変更 / 多店舗)

### 2.2 Day 7: workflows/account-opening-completeness + workflows/international-transfer-boundary

**account-opening-completeness 影響**:

- 5 docs + knowledge 2 件、Day 6 と同じ schema (Snippet 8 field、weight 信頼度)
- `workflow_id`: `UC-BO-02`、`workflow_slug`: `account-opening-completeness`、`agent_id`: `agent-account-opening-completeness`
- `_meta.yaml`: `automation_status: active`、`trust_level: supervised`、`risk_level: medium`

**international-transfer-boundary 影響 (restricted boundary pack)**:

- 3 docs only (`workflow.md` / `BOUNDARY.md` / `_meta.yaml`)、画面化なし / Dashboard カードなし
- **`_meta.yaml` 予定値** (Plan v1.3 確定):
  ```yaml
  workflow_id: UC-BO-IT-BOUNDARY
  trust_level: n/a
  risk_level: high
  automation_status: restricted
  restricted_conditions:
    high_value_threshold: "$10M equivalent [hypothesis_requires_validation]"
    automation_above_threshold: prohibited
    automation_below_threshold: future_candidate_after_framework_validation
  approvers:
    proposal_source_for_boundary_change: ai
    queue_owner: ai_admin_or_manual_admin
    approver: configuration_approval_type_a_or_c
  ```
- `BOUNDARY.md`: scope 画定 (高額閾値以上は AI 自動化不可)、boundary review proposal mechanism reference (DOC-APP-02 §9.7)
- `workflow.md`: 業務概要、未満 (条件未達) の限定自動化を将来検討する記述

**workflows/\_index.md**:

- 3 業務並列 (UC-BO-01 active / UC-BO-02 active / international-transfer-boundary restricted)
- Trust Level Progression は active 2 業務のみ表示、boundary 業務は restricted 1 行で別表示

### 2.3 Day 8: 03-ui-prototype-design.md + 04-knowledge-pipeline.md

**03 影響**:

- **Stripe 風 design language SSOT 定義**: 色 token (slate + indigo accent) / typography (Inter + Noto Sans JP) / spacing 8-grid / shadow 3 段 / anim curve (cubic-bezier(0.22, 1, 0.36, 1)) / マイクロインタラクション 5-8 例
- **段階詳細化 SSOT**: Wireframe (Day 11-13 low-fi) → medium-fi (Day 14-15 token 適用) → high-fi (Day 16-18 マイクロインタラクション)
- **9 画面 Screen Card** (9-field × 9): Inbox / CaseReview / SendBackComment / Dashboard / ProposalReview / AgentSettings / AuditTrail / Metrics / KnowledgeBrowser
- **AiProposalPanel**: 過去 case 関連ルール更新 Alert UI 仕様 (3 適用範囲)
- **BusinessApprovalChip**: 承認者画面は slide-only mock で代替、CaseReview 内 chip 表示

**04 影響**:

- **AI 日次分析 logic SSOT**: 判断基準 (同種差戻し 3+ 件 / 共通 pattern / staging 矛盾なし、`[仮説 / 要検証]`)
- **Snippet schema reference**: `docs/_SSOT.md` §1.4 を pointer
- **5-category routing**: 各カテゴリの処理経路詳細、`data_error` は通常 compiled 昇格対象外 (log / audit / 別 routing)
- **LLMOps framework**: 旧 ai-operator 24 §11 を v2 用に圧縮

### 2.4 Day 9: 05-metrics-and-gates.md + 06-session4-narrative.md

**05 影響**:

- **SLO 仮値表移管**: `docs/_SSOT.md` §1.3 → 05 が SSOT、`_SSOT.md` は pointer 化 (本 v1.3 final patch では `_SSOT.md` が暫定 SSOT、Day 9 で移管)
- **4 KPI multi-criteria 仮説 gate** (AI 入力承認率 / 人手上書き率 / Alert 発生率 / 承認者差戻し率)、すべて `[仮説 / 要検証]` ラベル必須
- **7 KPI catalogue + 9 KRI catalogue**: 旧 ai-operator 24 §3.2 + §4.1 圧縮
- **real-time guarantee 風表現は禁止** (該当語彙の trace は `docs/prior-art-map.md` で記録): SLO 表現は `[仮説 / 要検証]` 付き具体値 (同一セッション内 / 当日中 / 日次 / 次回 AI 処理から) で統一

**06 影響**:

- **Slide 1-2**: Core message 新表現 (差戻しを、次の正解手順に変える仕組み) + 補助 3 コピー
- **Slide 3**: BusinessApprovalView mock figure spec、AI Proposal Alert UI 表示 (過去 case 関連更新)
- **Slide 7 (重要)**: Matrix B 主表現 (AIに任せる量は段階的に増やすが、人によるコントロールは渡さない) + slogan (案件確認は減らす。ルール承認は残す。)
- **過去 case 不変 + Alert**: Slide 5 or 6 で言及 (audit trail 保護 / 関連ルール更新時の Alert)
- **規制語**: Tier 3 は slide に出さない、prior-art pointer のみ docs 内部に残存

### 2.5 Day 10: Design Gate (大)

**影響項目**:

- **SSOT 衝突 grep**: 本 plan §Verification (Day 5 gate) を全 docs + 起稿済 workflows に対して再走
- **\_SSOT.md Refresh**: Day 5 update に加え、03 / 04 / 05 / 06 起稿分も SSOT に反映 (Topic → SSOT mapping table 更新)
- **規制語 grep**: v2 repo + cowork-workshop/CLAUDE.md + workshop-design.md 限定
- **既知 potential 衝突 spot-check**:
  - Demo Chapter (06 message vs demo/demo-script.md execution)
  - 業務承認画面 (03 spec vs 06 figure)
  - 4 KPI gate 数値 (05 SSOT vs mock-metrics.ts visualization)
  - Trust Level Progression (02 SSOT vs \_index per-業務値 vs TrustLevelBadge visual)

### 2.6 Day 11-18: UI 実装 (3 段詳細化)

**Day 11-13 (Wireframe phase)**:

- 9 画面 low-fi wireframe (Stripe 風の design language は適用せず、情報設計 + 状態遷移を固定)
- Inbox / CaseReview / SendBackComment / Dashboard / ProposalReview / AgentSettings / AuditTrail / Metrics / KnowledgeBrowser
- AppShell + Routing + Mock data 連携
- 各画面 9-field Screen Card と整合確認

**Day 14-15 (medium-fi phase)**:

- Hero 3 画面 (CaseReview / Dashboard / Metrics) に design token 適用
- Tailwind v4 + shadcn/ui 詳細設定 (色 / typography / spacing)
- BusinessApprovalChip 表示
- AiProposalPanel に過去 case Alert UI (banner 形式) を first cut で実装

**Day 16-18 (high-fi phase)**:

- Hero 3 = 95% 仕上げ + マイクロインタラクション 5-8 例 (hover / transition / inline feedback / status animation)
- 残り 6 = 85% 仕上げ (基本 token 適用 + 主要 interaction、デザイン全体感は Hero 3 と同等)
- AiProposalPanel Alert UI 詳細化 (3 適用範囲、文言 / 配置 / dismiss)
- TypeScript compile + visual smoke + a11y check (Lighthouse)

### 2.7 Day 19: SSOT Refresh + cowork-workshop 連携

**影響項目**:

- **cowork-workshop/CLAUDE.md**: v2 完成内容を反映、Backoffice AI v2 の構想共有 link update
- **cowork-workshop/workshop-design.md**: Session 4 内容 (60 min × 8 slide + demo Chapter 1/2) の最新 spec link update
- **session-{1,2,3}-narrative.md は touch しない** (S1-3 SSOT keep)
- **規制語 grep** (Day 21 と並行で 2 度確認)

### 2.8 Day 20: demo (demo-script + business-approval-view.html)

**影響項目**:

- **demo-script.md**: Demo Chapter 1/2 実行 step、Core message 新表現使用、Type A SoD は深く扱わない (concise)
- **business-approval-view.html**: 過去 case 関連ルール更新 Alert UI 反映 (slide-only static mock)、Matrix B 新表現 slide 7 反映、Tailwind CDN 1 file html、AiProposalPanel と design token 整合
- **screenshot export**: business-approval-view.png (browser open + screenshot)

### 2.9 Day 21-22: Final integration + Rehearsal

**Day 21 影響**:

- **規制語 grep** (3 回目、最終確認): MRM / CISO / NYDFS / SR 11-7 / CCPA / OFAC / BSA / SAR / CTR / ECOA を表層に出さない確認
- **旧表現 grep** (現行 SSOT 表層、`prior-art-map.md` と `_HEADER_TEMPLATE.md` 除外)
- **全体整合性**: docs / workflows / prototype / demo の cross-reference 整合性確認

**Day 22 影響**:

- Session 4 rehearsal (60 min run-through、8 slide + Demo Chapter 1/2)
- 最終 review (Core message / Matrix B / Type A SoD / Boundary / 過去 case Alert の通し確認)

---

## 3. Verification gate 一覧

| Day                                        | Gate name                           | 内容                                                                                            | 状態          |
| ------------------------------------------ | ----------------------------------- | ----------------------------------------------------------------------------------------------- | ------------- |
| Day 5                                      | grep gate A-H                       | 旧表現 / 新表現 / 構造 SSOT / 国際送金 / 接続層 / Alert UI / 規制語 / 履歴文書                  | ✅ pass (fb0df04) |
| Day 6                                      | Snippet schema gate                 | knowledge 6 件 frontmatter 8 field 必須、weight 信頼度限定、category enum                       | 🟡 pending    |
| Day 7                                      | restricted_conditions gate          | international-transfer-boundary/\_meta.yaml の restricted_conditions field 存在 + 値整合       | 🟡 pending    |
| Day 8                                      | UI design language gate             | 03 の design token / 04 の AI 日次分析 logic SSOT                                                | 🟡 pending    |
| Day 9                                      | Message gate                        | Core msg / Matrix B 表現が 05 / 06 と整合、SLO 仮値表が 05 に移管完了                            | 🟡 pending    |
| Day 10                                     | Design Gate (大)                    | 全 SSOT 衝突 grep + \_SSOT.md Refresh + 規制語 + 4 既知 potential 衝突 spot-check                | 🟡 pending    |
| Day 11-18                                  | UI build gate (per day or per phase) | TypeScript compile + visual smoke + a11y (Lighthouse) + Stripe 風 design language 適合          | 🟡 pending    |
| Day 19                                     | Bridge gate                         | cowork-workshop/CLAUDE.md + workshop-design.md update、session-{1,2,3}-narrative.md 無変更      | 🟡 pending    |
| Day 20                                     | Demo gate                           | demo-script step 動作 + business-approval-view.html screenshot export                            | 🟡 pending    |
| Day 21                                     | Regulatory gate                     | 規制語 grep (3 回目) + 旧表現 grep + 全体整合性                                                   | 🟡 pending    |
| Day 22                                     | Final rehearsal                     | 60 min run-through (8 slide + Demo Chapter 1/2)、最終 review                                     | 🟡 pending    |

---

## 4. Open items (Day 5 末時点)

| Item                                                                                                  | 状態                | Due  | Note                                                                                                       |
| ----------------------------------------------------------------------------------------------------- | ------------------- | ---- | ---------------------------------------------------------------------------------------------------------- |
| Day 6 outline gate 承認 (5 preemptive decisions: Owner マップ / スクショ粒度 / Alert 5 条件 / Snippet schema / knowledge 6 件内訳) | 🟡 user 承認待ち    | Day 6 開始前 | 前 turn で outline 提示済、user 承認後 Day 6 着手                                                          |
| Plan v1.3 final patch の Day 6+ への先取り影響整理                                                     | ✅ 本 file §2 で完了 | Day 5 | docs/\_PROGRESS.md (本 file) で記述                                                                          |
| docs-review.html 退避                                                                                  | ✅ 完了             | Day 5 | archive/docs-review-2026-05-25-pre-v1.3.html に move、`.gitignore` 更新、CLAUDE.md Archived artifacts 注記 |
| 05-metrics-and-gates.md 起稿時の SLO 仮値表移管                                                       | 🟡 Day 9 で実行     | Day 9 | 現在は \_SSOT.md §1.3 が暫定 SSOT、Day 9 で 05 に SSOT 移譲                                                |
| Stripe 風 design language 具体 token の Day 8 確定                                                    | 🟡 Day 8 で実行     | Day 8 | 色 / typography / spacing / shadow / anim curve / マイクロインタラクション 5-8 例                          |

---

## 5. Refresh schedule

- **各 Day 末**: 該当 Day 行の Status (✅) + Commit hash + Note を update
- **Day 10 Design Gate**: §2.1-2.4 の影響分析 reassessment、不整合あれば Plan update
- **Day 19 SSOT Refresh**: cowork-workshop 連携前に整合性 final check、§2.7 影響実行
- **Day 21 Final**: 全 Day 行の Status / Commit / Note を最終確認、Session 4 直前

## 6. 関連文書

- DOC-ROOT-\_SSOT (`docs/_SSOT.md`): 各論点の SSOT mapping + enum / RACI / SLO / Snippet schema / connection tier / Core Message 表現
- DOC-ROOT-prior-art-map (`docs/prior-art-map.md`): 旧 repo (v1 + ai-operator) 参照関係、legacy wording trace 許容文書
- Plan v1.3 final patch: `~/.claude/plans/ai-backoffice-ai-virtual-muffin.md` (Day 5 起稿、Plan v1.1.2 22 日 base + Day 5 整合化 update)
- 本 file の Day-by-day status と Plan v1.3 の 「Plan v1.1.2 への波及」 table が整合
