# Artifact Audit: AuditTrail (Copy Review、Step 3 Batch #5)

- Audit Date: 2026-05-25
- Artifact Path: `prototype/src/pages/AuditTrail.tsx` (421 行) + `components/shared/{PageFooter, FilterChip, MetaChip, PageHelpDisclosure}` + `lib/{sendback-categories, show-internal}` + mock-audit.ts (13 events)
- Primary user: Auditor (週次〜月次、読解 + 追跡 mode、grep 検索前提)
- Persona SSOT: `_persona.md` v0.3

## §1. Scope

PageHeader (Breadcrumb 2-level / H1「監査証跡」 / 期間 MetaChip / `15 項目記録` mono / 業務 filter 3 chip) / PageHelpDisclosure「本画面の説明」(L4 expand) / 監査イベント timeline (時系列降順、各 row = event_type icon + JP label + case_id + workflow_id + version + 過去案件への影響 chip conditional + summary + timestamp + actorLabel) / DetailPanel 15 項目 (SHOW_INTERNAL_METADATA gate 経由 dual display)

## §2. Verdict Matrix

| Aspect | 層 A | 層 B (Auditor) | 総合 |
| --- | --- | --- | --- |
| Information completeness | Demo Chapter 1 で audit visibility narrative「過去案件は遡って書き換えない」を timeline 上で取得可能、`rule_update_alert` event で「過去案件への影響」 chip 視覚化 | Auditor 読解 + 追跡 mode: case_id / workflow_id+version / agent_id+version / prompt_config_version / tool_config_version / model_config_version / input_artifact_hash / ai_proposal_id / human_decision_id / sendback_category / compiled_knowledge_citation_ids / approval_timestamp+approver_id / diff_id / rollback_ref / screenshot_stack_id 15 項目 SSOT schema 揃う | keep-as-is |
| Information clutter | snake_case schemaKey は SHOW_INTERNAL_METADATA gate (debug=1 query opt-in) で default 非表示、Auditor 用 detail を 一般 user 視野から hide | Auditor 用 schemaKey は debug mode で visible、入力者 / 業務責任者 / AI 管理者 視野では JP primary label のみ — `_persona.md` G-B2 過剰回避 perfect | keep-as-is |
| Comprehensibility | EVENT_TYPE_LABEL JP map (PDF 受付 / AI 入力 / 入力者確認 / 入力者差戻し / AI 日次分析 / 手順承認 / 承認者承認 / 反映 / 関連ルール更新 / 設定承認) — Tier 1 vocab、3 秒読み OK | Auditor 習熟 vocab + machine-parseable identifier 整合 (case_id / workflow_id+version mono) | keep-as-is |
| Glossary consistency | 「承認済ナレッジ 参照 ID」 (compiled_knowledge_citation_ids) governance paraphrase 辞書通り、`compiled`→「承認済」 | 「監査証跡」「監査イベント」「人手判断 ID」 cross-screen 整合 | keep-as-is |
| Identifier hygiene | snake_case schemaKey SHOW_INTERNAL_METADATA gate で hide、user-facing は JP primary | DetailRow に snake_case schema visible (debug=1 mode) は Auditor 用、`_persona.md` §3.3 Auditor 「machine-parseable identifier」要件と整合 | keep-as-is |
| Component name leak | DetailPanel / DetailRow code only | 同左 | keep-as-is |
| Tone / Register / AI voice | actorLabel 明示 (「システム」「AI 入力」「AI 日次分析」「{name} (入力者 / 承認者 / 業務責任者)」) — actor band separation perfect、AI 1 人称不使用 | Auditor 追跡 mode で actor + role + name の triplet visual | keep-as-is |
| Mock content fidelity | 13 events: 3 case_id (CASE-2026-0142 current + CASE-2026-0118 historical Demo Chapter 2 narrative + CASE-2026-0148 口座開設) でデモシナリオ整合、`rule_update_alert` event au-008「2026-05-17 に 住所マスタ照合 v0.2 が承認されました (本案件の処理時の版は当時のまま 監査証跡 に保持)」 = §6.2 適用範囲 2 perfect 文例 | `_persona.md` §4.3 mock SME pass | keep-as-is |

## §3. Findings

### §3.1 Keep-as-is

- L110-116 Breadcrumb / H1「監査証跡」 (top-level)
- L120 期間 MetaChip「直近 30 日 (検証用)」
- L122-124 「15 項目記録」 mono (Day 19 Commit 2 で schema metadata leak 削除)
- L127-141 業務 filter「業務:」 + workflow chip set (全業務 / 法人住所変更 / 口座開設書類完備)
- L150-156 PageHelpDisclosure body: 「監査イベントは 15 項目で記録されます」「行を選択すると詳細項目が展開されます。」 — 機能説明 concise
- L170-172 「監査イベント 時系列」 + 「最新が上、行を選択すると 15 項目 詳細展開」
- L211 EVENT_TYPE_LABEL render (10 種 JP map)
- L214 case_id mono + L216 workflow_id + version mono
- L221 「過去案件への影響」 chip — rule_update_alert event のみ amber chip、Day 13 持ち越し B/D の delta を覆う governance signal
- L226 event.summary 1 行 (例: 「AI 入力結果 生成 (信頼度 0.87)」「入力者差戻し (誤読、住所マスタ照合の方向誤認)」「手順承認 (AI 提案 PROP-2026-031 を 承認済ナレッジ へ昇格)」「2026-05-17 に 住所マスタ照合 v0.2 が承認されました (本案件の処理時の版は当時のまま 監査証跡 に保持)」)
- L229 timestamp mono + actorLabel
- L274 「監査イベント 詳細 (15 項目)」 DetailPanel header
- L278-381 15 DetailRow entries (case_id / workflow_id+workflow_version / agent_id+agent_version / prompt_config_version / tool_config_version / model_config_version / input_artifact_hash / ai_proposal_id / human_decision_id / sendback_category / compiled_knowledge_citation_ids / approval_timestamp+approver_id / diff_id / rollback_ref / screenshot_stack_id) — JP primary label + SHOW_INTERNAL_METADATA gate snake_case sub-caption + conditional note「次の実装段階で実装予定 (検証用項目)」/「検証用項目」/「関連画面への遷移は次の実装段階で対応」/「緊急時 段階の強制引き下げ、本 v2 では次の実装段階で対応」/「操作画面記録、次の実装段階で対応」
- L406-411 DetailRow primary label + SHOW_INTERNAL_METADATA gate sub-caption (KnowledgeBrowser と同 paradigm)
- mock-audit.ts actorLabel formats: 「システム」「AI 入力」「AI 日次分析」「田中 美咲 (入力者)」「渡辺 真理 (業務責任者)」「山本 直樹 (承認者)」 — actor + role + name triplet visual
- mock-audit.ts inputArtifactHash: `sha256:abc123def456789...` — Auditor grep 親和性 + length truncation for visual

### §3.2 Directional (P2 polish)

- L218 「{workflow_id} {workflow_version}」 mono — `UC-BO-01 v0.1` 形式、Auditor 観点 OK だが業務責任者 / Manual 管理者 視野では mono が visual noise (層 B Auditor Primary 想定で keep-as-is)
- DetailRow note 内「次の実装段階で対応」が複数 row に分散 — Day 16+ で「次の実装段階で対応 (フィールド: prompt_config / tool_config / model_config / 反映差分 / ロールバック / 操作画面記録)」等の集約候補 (directional)
- mock-audit.ts au-008 summary 内「監査証跡」自己参照 — 「2026-05-17 に 住所マスタ照合 v0.2 が承認されました (本案件の処理時の版は当時のまま 監査証跡 に保持)」 — `監査証跡` が画面名と同じ、Auditor 視点では循環参照ぽい感覚もあるが governance message として正確、keep-as-is

### §3.3 Needs-fix

- なし

### §3.4 Harmful

- なし

### §3.5 Cross-screen 観察

- **SHOW_INTERNAL_METADATA gate paradigm** が AuditTrail + KnowledgeBrowser 両方で実装、`_persona.md` §3.3 G-B2 (過剰防止) 完璧、Step 3 §99 で本 paradigm を「Auditor 用 metadata visibility gate」として MEMORY 昇格候補 (§99 で判定)
- **Actor band perfect**: mock-audit.ts actor enum (`system` / `AI` / `input-operator` / `approver` / `manual-admin` / `ai-admin` / `business-owner`) + actorLabel JP localization が R7 Ship Gate「Actor band (agent / human / system) icon prefix が timeline / log で表示」と整合、本 PJ の reference

## §4. Knowledge card binding

- `research-compounder/knowledge/ui-design/action-history-timeline-audit-trail-ui.md` — actor band + audit log column の standard、本画面が full implementation
- `research-compounder/knowledge/ai-agents-automation/agent-permission-rbac-pattern.md` — Auditor read-only role、permission boundary
- `research-compounder/knowledge/ui-design/ai-native-hil-approval-ui.md` — 5-state HIL approval timeline の actor 分離
- MEMORY: `feedback_charter_read_before_done.md` (本画面が CHARTER 4 IA の Audit 層 reference として整合)

## §5. Recommendations

- P0 / P1: なし
- P2 directional: L218 mono visual / DetailRow note 集約 — Day 16+
- Cross-screen elevate: SHOW_INTERNAL_METADATA gate paradigm を Step 4 §6 MEMORY 昇格候補に記録

## §6. Files Affected

- 修正不要
