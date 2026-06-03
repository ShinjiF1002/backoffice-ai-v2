import type { Db } from '../db/connection.js'
import type { Denial } from '../denial.js'
import type { AuditEventRow } from '../audit.js'

export type ActorRole = 'inputter' | 'checker' | 'business-approver' | 'governance'

/** Handler input = the command minus actorId (the dispatcher consumes actorId into Ctx). */
export type Cmd<T> = Omit<T, 'actorId'>

/** Resolved identity for a mutation (operational role only; governance is rejected upstream). */
export interface Ctx {
  sessionOperatorId: string
  effectiveActorId: string
  role: ActorRole
}

export interface HandlerOk<E = unknown> {
  ok: true
  entity: E
  auditEvent?: AuditEventRow
}
export type HandlerResult<E = unknown> = HandlerOk<E> | Denial

/** SoD self-approval (ported from reducer `isSelfApproval`): requester persona === acting persona. */
export function isSelfApproval(requesterId: string | null | undefined, actorId: string): boolean {
  return requesterId != null && requesterId === actorId
}

export function resolveRole(db: Db, actorId: string): ActorRole | undefined {
  const row = db.prepare('SELECT role_id FROM actors WHERE id = ?').get(actorId) as { role_id: string } | undefined
  return row?.role_id as ActorRole | undefined
}

export interface CaseRow {
  id: string
  workflow_id: string
  status: string
  assignee_name: string | null
  flags: number
  origin: string
  input_approved_by: string | null
  sendback_reason: string | null
  sendback_category: string | null
  reversal_kind: string | null
  reversal_reason: string | null
  received_at: string
}
export const loadCase = (db: Db, id: string): CaseRow | undefined =>
  db.prepare('SELECT * FROM cases WHERE id = ?').get(id) as CaseRow | undefined

export interface ProposalRow {
  id: string
  workflow_id: string
  status: string
  agent_id: string | null
  forwarded_by: string | null
  decision_kind: string | null
  decision_reason: string | null
  decision_category: string | null
  change_area: string
  impact_count: number
}
export const loadProposal = (db: Db, id: string): ProposalRow | undefined =>
  db.prepare('SELECT * FROM proposals WHERE id = ?').get(id) as ProposalRow | undefined

export interface AgentRow {
  id: string
  workflow_id: string
  trust: string
  promotion_status: string
  promotion_requested_by: string | null
  promotion_sendback_reason: string | null
  paused: number
  paused_reason: string | null
  trust_before_pause: string | null
}
export const loadAgent = (db: Db, id: string): AgentRow | undefined =>
  db.prepare('SELECT * FROM agents WHERE id = ?').get(id) as AgentRow | undefined

export interface EscalationRow {
  case_id: string
  reason: string
  category: string
  escalated_to: string
  escalated_from: string
  resolution: string | null
}
export const loadEscalation = (db: Db, caseId: string): EscalationRow | undefined =>
  db.prepare('SELECT * FROM escalations WHERE case_id = ?').get(caseId) as EscalationRow | undefined
