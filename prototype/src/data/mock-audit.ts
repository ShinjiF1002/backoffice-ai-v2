/**
 * Mock audit events — Day 11 placeholder (light)
 * SSOT: docs/04-knowledge-pipeline.md §8 (Audit evidence event model 15-row、paired field 含む実 18)
 *
 * Day 14-18 で AuditTrail page で full 15-row event model を実装。
 * 本 mock data は CaseReview 連動の minimum subset。
 */

export interface AuditEvent {
  id: string
  caseId: string
  workflowVersion: string
  agentVersion: string
  timestamp: string
  actor: string
  action: string
  /** Reference type (compiled_knowledge_citation_ids など) */
  refType?: string
  refId?: string
}

export const mockAuditEvents: AuditEvent[] = [
  {
    id: 'au-001',
    caseId: 'CASE-2026-0142',
    workflowVersion: 'v0.1',
    agentVersion: 'v0.1',
    timestamp: '2026-05-31 09:00:14',
    actor: 'system',
    action: 'PDF 受付',
  },
  {
    id: 'au-002',
    caseId: 'CASE-2026-0142',
    workflowVersion: 'v0.1',
    agentVersion: 'v0.1',
    timestamp: '2026-05-31 09:02:11',
    actor: 'AI',
    action: 'AI 入力結果生成 + citation 参照',
    refType: 'compiled_knowledge_citation_ids',
    refId: 'KN-CORP-001,KN-CORP-002,KN-CORP-003',
  },
]
