import type { SendBackCategory } from './types'

/**
 * Mock audit events — Day 12 Page 7 拡張 (AuditTrail wireframe 用)
 *
 * SSOT:
 *  - docs/04-knowledge-pipeline.md §8.1 15-row audit event model (paired field 含む実 18)
 *  - docs/03-ui-prototype-design.md §4.7 (AuditTrail UI)
 *  - docs/03-ui-prototype-design.md §6.2 (適用範囲 2 関連ルール更新 Alert)
 *
 * Field mapping (TypeScript camelCase ⇔ SSOT snake_case):
 *  - caseId → case_id
 *  - workflowId / workflowVersion → workflow_id / workflow_version
 *  - agentId / agentVersion → agent_id / agent_version
 *  - promptConfigVersion → prompt_config_version (skeleton、Phase 1)
 *  - toolConfigVersion → tool_config_version (skeleton)
 *  - modelConfigVersion → model_config_version (skeleton)
 *  - inputArtifactHash → input_artifact_hash
 *  - screenshotStackId → screenshot_stack_id (scope-out)
 *  - aiProposalId → ai_proposal_id
 *  - humanDecisionId → human_decision_id
 *  - sendbackCategory → sendback_category (5-category routing)
 *  - compiledKnowledgeCitationIds → compiled_knowledge_citation_ids
 *  - approvalTimestamp / approverId → approval_timestamp / approver_id
 *  - diffId → diff_id
 *  - rollbackRef → rollback_ref (scope-out)
 *
 * AuditTrail page では snake_case schema label を mono font で表示、value は JP-localized。
 *
 * 国際送金 (restricted boundary pack) は本 mock event source 対象外 (workflow_id に含めない)。
 */

export type EventType =
  | 'system_intake'
  | 'ai_input'
  | 'human_review'
  | 'human_sendback'
  | 'ai_analysis'
  | 'proposal_approve'
  | 'business_approve'
  | 'reflect'
  | 'rule_update_alert'
  | 'config_approve'
  // F-10 Wave 3 PR 3 Commit 8: failure event types (Defer 解除、mock-audit に failed event 追加)
  | 'ai_failed'
  | 'computer_use_timeout'

/**
 * F-4 Wave 3 PR 3 Commit 8: Card 3 action-history-timeline-audit-trail-ui の 7 outcome state
 * (Proposed / Approved / Rejected / Executed / Failed / Reverted / Escalated)
 *
 * Action verb 系の EventType (`ai_input`, `human_sendback` 等) とは別軸:
 *  - Outcome は「結果状態」(成功 / 失敗 / 差戻し / 取消 / 上位エスカレーション)
 *  - EventType は「何の操作か」(AI 抽出 / 人手確認 / 反映 等)
 *
 * Day 19 schema gate (?debug=1) 経由で display、production timeline 上は controlled vocab chip としても表示
 */
export type OutcomeState =
  | 'Proposed'
  | 'Approved'
  | 'Rejected'
  | 'Executed'
  | 'Failed'
  | 'Reverted'
  | 'Escalated'

export type EventActor =
  | 'system'
  | 'AI'
  | 'input-operator'
  | 'approver'
  | 'manual-admin'
  | 'ai-admin'
  | 'business-owner'

export interface AuditEvent {
  id: string
  /** SSOT: case_id */
  caseId: string
  /** SSOT: workflow_id + workflow_version */
  workflowId: string
  workflowVersion: string
  /** SSOT: agent_id + agent_version (optional、system event では未設定) */
  agentId?: string
  agentVersion?: string
  /** SSOT: prompt_config_version (skeleton、Phase 1) */
  promptConfigVersion?: string
  /** SSOT: tool_config_version (skeleton) */
  toolConfigVersion?: string
  /** SSOT: model_config_version (skeleton) */
  modelConfigVersion?: string
  /** SSOT: input_artifact_hash (実 PDF は scope-out、mock では fake hash) */
  inputArtifactHash?: string
  /** SSOT: screenshot_stack_id (RPA / Computer Use trace、scope-out) */
  screenshotStackId?: string
  /** SSOT: ai_proposal_id */
  aiProposalId?: string
  /** SSOT: human_decision_id */
  humanDecisionId?: string
  /** SSOT: sendback_category (5-category routing) */
  sendbackCategory?: SendBackCategory
  /** SSOT: compiled_knowledge_citation_ids */
  compiledKnowledgeCitationIds?: string[]
  /** SSOT: approval_timestamp + approver_id */
  approvalTimestamp?: string
  approverId?: string
  /** SSOT: diff_id */
  diffId?: string
  /** SSOT: rollback_ref (緊急時 段階の強制引き下げ、scope-out) */
  rollbackRef?: string
  // === Display fields (not in SSOT schema) ===
  /** Event 発生 timestamp (YYYY-MM-DD HH:mm:ss) */
  timestamp: string
  /** Actor 識別 enum */
  actor: EventActor
  /** Actor 表示ラベル (JP-localized、roles + 氏名) */
  actorLabel: string
  /** Event type identifier */
  type: EventType
  /** Display summary for timeline row */
  summary: string
  /** F-4 Wave 3 PR 3 Commit 8: Card 3 outcome state (Proposed/Approved/Rejected/Executed/Failed/Reverted/Escalated) — optional、未指定なら deriveOutcome(type) で derive */
  outcome?: OutcomeState
}

/** EventType → OutcomeState default mapping (Card 3 7 state controlled vocab) */
export function deriveOutcome(event: Pick<AuditEvent, 'type' | 'outcome'>): OutcomeState {
  if (event.outcome) return event.outcome
  switch (event.type) {
    case 'system_intake': return 'Proposed'
    case 'ai_input': return 'Proposed'
    case 'ai_analysis': return 'Proposed'
    case 'human_review': return 'Approved'
    case 'human_sendback': return 'Rejected'
    case 'proposal_approve': return 'Approved'
    case 'business_approve': return 'Approved'
    case 'reflect': return 'Executed'
    case 'rule_update_alert': return 'Reverted'
    case 'config_approve': return 'Approved'
    case 'ai_failed': return 'Failed'
    case 'computer_use_timeout': return 'Failed'
    default: return 'Proposed'
  }
}

export const mockAuditEvents: AuditEvent[] = [
  // === CASE-2026-0142 (current、法人住所変更、Demo Chapter 1 起点) ===
  {
    id: 'au-001',
    caseId: 'CASE-2026-0142',
    workflowId: 'UC-BO-01',
    workflowVersion: 'v0.1',
    timestamp: '2026-05-31 09:00:14',
    actor: 'system',
    actorLabel: 'システム',
    type: 'system_intake',
    summary: 'PDF 受付 (法人住所変更届)',
    inputArtifactHash: 'sha256:abc123def456789...',
  },
  {
    id: 'au-002',
    caseId: 'CASE-2026-0142',
    workflowId: 'UC-BO-01',
    workflowVersion: 'v0.1',
    agentId: 'agent-corporate-address-change',
    agentVersion: 'v0.1',
    promptConfigVersion: 'v0.1',
    toolConfigVersion: 'v0.1',
    modelConfigVersion: 'v0.1',
    timestamp: '2026-05-31 09:02:11',
    actor: 'AI',
    actorLabel: 'AI 入力',
    type: 'ai_input',
    summary: 'AI 入力結果 生成 (信頼度 0.87)',
    aiProposalId: 'PROP-2026-0142-01',
    compiledKnowledgeCitationIds: ['KN-CORP-001', 'KN-CORP-002', 'KN-CORP-003'],
  },
  // === CASE-2026-0118 (historical、Demo Chapter 2 narrative 中核) ===
  {
    id: 'au-003',
    caseId: 'CASE-2026-0118',
    workflowId: 'UC-BO-01',
    workflowVersion: 'v0.1',
    timestamp: '2026-05-15 10:00:22',
    actor: 'system',
    actorLabel: 'システム',
    type: 'system_intake',
    summary: 'PDF 受付 (法人住所変更届)',
    inputArtifactHash: 'sha256:def456ghi789abc...',
  },
  {
    id: 'au-004',
    caseId: 'CASE-2026-0118',
    workflowId: 'UC-BO-01',
    workflowVersion: 'v0.1',
    agentId: 'agent-corporate-address-change',
    agentVersion: 'v0.0',
    promptConfigVersion: 'v0.0',
    toolConfigVersion: 'v0.0',
    modelConfigVersion: 'v0.0',
    timestamp: '2026-05-15 10:02:48',
    actor: 'AI',
    actorLabel: 'AI 入力',
    type: 'ai_input',
    summary: 'AI 入力結果 生成 (信頼度 0.79、閾値 0.85 未達)',
    aiProposalId: 'PROP-2026-0118-01',
    compiledKnowledgeCitationIds: ['KN-CORP-001'],
  },
  {
    id: 'au-005',
    caseId: 'CASE-2026-0118',
    workflowId: 'UC-BO-01',
    workflowVersion: 'v0.1',
    timestamp: '2026-05-15 10:15:33',
    actor: 'input-operator',
    actorLabel: '田中 美咲 (入力者)',
    type: 'human_sendback',
    summary: '入力者差戻し (誤読、住所マスタ照合の方向誤認)',
    sendbackCategory: 'misunderstanding',
    humanDecisionId: 'HD-2026-0118-01',
  },
  {
    id: 'au-006',
    caseId: 'CASE-2026-0118',
    workflowId: 'UC-BO-01',
    workflowVersion: 'v0.1',
    timestamp: '2026-05-16 00:30:00',
    actor: 'AI',
    actorLabel: 'AI 日次分析',
    type: 'ai_analysis',
    summary: '未承認ナレッジ 候補生成 (同種 差戻し 3 件を集約、住所マスタ照合 方向修正案)',
    aiProposalId: 'PROP-2026-031',
  },
  {
    id: 'au-007',
    caseId: 'CASE-2026-0118',
    workflowId: 'UC-BO-01',
    workflowVersion: 'v0.1',
    timestamp: '2026-05-17 14:22:08',
    actor: 'business-owner',
    actorLabel: '渡辺 真理 (業務責任者)',
    type: 'proposal_approve',
    summary: '手順承認 (AI 提案 PROP-2026-031 を 承認済ナレッジ へ昇格)',
    aiProposalId: 'PROP-2026-031',
    diffId: 'DIFF-2026-005',
    approvalTimestamp: '2026-05-17 14:22:08',
    approverId: '渡辺 真理',
  },
  // === 適用範囲 2 関連ルール更新 Alert (DOC-UI-03 §6.2) ===
  {
    id: 'au-008',
    caseId: 'CASE-2026-0118',
    workflowId: 'UC-BO-01',
    workflowVersion: 'v0.2',
    timestamp: '2026-05-17 14:22:09',
    actor: 'system',
    actorLabel: 'システム',
    type: 'rule_update_alert',
    summary: '2026-05-17 に 住所マスタ照合 v0.2 が承認されました (本案件の処理時の版は当時のまま 監査証跡 に保持)',
    diffId: 'DIFF-2026-005',
  },
  {
    id: 'au-009',
    caseId: 'CASE-2026-0118',
    workflowId: 'UC-BO-01',
    workflowVersion: 'v0.2',
    agentId: 'agent-corporate-address-change',
    agentVersion: 'v0.1',
    timestamp: '2026-05-18 09:45:12',
    actor: 'input-operator',
    actorLabel: '田中 美咲 (入力者)',
    type: 'human_review',
    summary: '入力者再確認 (信頼度 0.91、業務 v0.2 で再処理)',
    humanDecisionId: 'HD-2026-0118-02',
  },
  {
    id: 'au-010',
    caseId: 'CASE-2026-0118',
    workflowId: 'UC-BO-01',
    workflowVersion: 'v0.2',
    timestamp: '2026-05-18 11:30:45',
    actor: 'approver',
    actorLabel: '山本 直樹 (承認者)',
    type: 'business_approve',
    summary: '承認者承認 (案件処理 完了)',
    approvalTimestamp: '2026-05-18 11:30:45',
    approverId: '山本 直樹',
  },
  {
    id: 'au-011',
    caseId: 'CASE-2026-0118',
    workflowId: 'UC-BO-01',
    workflowVersion: 'v0.2',
    timestamp: '2026-05-18 11:30:46',
    actor: 'system',
    actorLabel: 'システム',
    type: 'reflect',
    summary: '反映 (基幹システム へ住所更新を反映、案件 完了)',
  },
  // === CASE-2026-0148 (口座開設書類完備、Dashboard で 要注意) ===
  {
    id: 'au-012',
    caseId: 'CASE-2026-0148',
    workflowId: 'UC-BO-02',
    workflowVersion: 'v0.1',
    timestamp: '2026-05-31 05:14:08',
    actor: 'system',
    actorLabel: 'システム',
    type: 'system_intake',
    summary: 'PDF 受付 (口座開設書類完備)',
    inputArtifactHash: 'sha256:ghi789jklmnopqr...',
  },
  {
    id: 'au-013',
    caseId: 'CASE-2026-0148',
    workflowId: 'UC-BO-02',
    workflowVersion: 'v0.1',
    agentId: 'agent-account-opening',
    agentVersion: 'v0.1',
    promptConfigVersion: 'v0.1',
    timestamp: '2026-05-31 05:16:32',
    actor: 'AI',
    actorLabel: 'AI 入力',
    type: 'ai_input',
    summary: 'AI 入力結果 生成 (信頼度 0.84、Alert 1 件: 印鑑照合 未達)',
    aiProposalId: 'PROP-2026-0148-01',
  },

  // === F-10 Wave 3 PR 3 Commit 8: failed event 投入 (Defer 解除、failure explainability surface 検証可能化) ===

  // CASE-0149 (法人住所変更) AI 抽出失敗 (OCR engine 内部エラー) → 再処理中
  {
    id: 'au-014',
    caseId: 'CASE-2026-0149',
    workflowId: 'UC-BO-01',
    workflowVersion: 'v0.2',
    agentId: 'agent-corporate-address-change',
    agentVersion: 'v0.2',
    promptConfigVersion: 'v0.2',
    timestamp: '2026-05-31 04:21:18',
    actor: 'AI',
    actorLabel: 'AI 入力 (失敗)',
    type: 'ai_failed',
    summary: 'AI 抽出失敗 (OCR engine 内部エラー、retry 3 回まで実施済、re-route が必要)',
    outcome: 'Failed',
  },
  // CASE-0152 (口座開設) Computer Use timeout (RPA 経路、外部システム応答 15 秒超過) → escalate
  {
    id: 'au-015',
    caseId: 'CASE-2026-0152',
    workflowId: 'UC-BO-02',
    workflowVersion: 'v0.2',
    agentId: 'agent-account-opening',
    agentVersion: 'v0.2',
    timestamp: '2026-05-31 03:08:45',
    actor: 'AI',
    actorLabel: 'AI 自動化 (タイムアウト)',
    type: 'computer_use_timeout',
    summary: 'Computer Use 経路 timeout (外部マスタ照合 API 応答 15 秒超過、escalate to 入力者)',
    outcome: 'Escalated',
  },
]

/** Get audit events by case ID (mock helper) */
export function getAuditEventsByCaseId(caseId: string): AuditEvent[] {
  return mockAuditEvents.filter((e) => e.caseId === caseId)
}

/** Get audit events by workflow ID (mock helper) */
export function getAuditEventsByWorkflowId(workflowId: string): AuditEvent[] {
  return mockAuditEvents.filter((e) => e.workflowId === workflowId)
}
