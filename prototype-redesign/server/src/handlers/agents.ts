import type { Db } from '../db/connection.js'
import { denial } from '../denial.js'
import { insertAudit } from '../audit.js'
import { type Ctx, type Cmd, type AgentRow, type HandlerResult, isSelfApproval, loadAgent } from './shared.js'
import type { AgentReasonInput } from './schemas.js'

type R = HandlerResult<AgentRow>
const ok = (db: Db, id: string, auditEvent?: ReturnType<typeof insertAudit>): R => ({
  ok: true,
  entity: loadAgent(db, id)!,
  auditEvent,
})

// Promotion mutations are audit-LESS; emergencyStop/resume ARE audit-emitting (12-set, 06 §契約5).

/** agent/requestPromotion (#16): promotion_status != approved → requested. audit-less. */
export function requestPromotion(db: Db, ctx: Ctx, input: { id: string }): R {
  const cur = loadAgent(db, input.id)
  if (!cur) return denial('NOT_FOUND')
  if (cur.promotion_status === 'approved') return denial('ALREADY_APPROVED')
  db.transaction(() => {
    db.prepare('UPDATE agents SET promotion_status = ?, promotion_requested_by = ?, promotion_sendback_reason = NULL WHERE id = ?').run(
      'requested',
      ctx.effectiveActorId,
      input.id,
    )
  })()
  return ok(db, input.id)
}

/** agent/approvePromotion (#17): requested → approved; identity-SoD. audit-less. */
export function approvePromotion(db: Db, ctx: Ctx, input: { id: string }): R {
  const cur = loadAgent(db, input.id)
  if (!cur) return denial('NOT_FOUND')
  if (cur.promotion_status !== 'requested') return denial('WRONG_STATE')
  if (isSelfApproval(cur.promotion_requested_by, ctx.effectiveActorId)) return denial('SELF_APPROVAL')
  db.transaction(() => {
    db.prepare('UPDATE agents SET promotion_status = ?, promotion_sendback_reason = NULL WHERE id = ?').run('approved', input.id)
  })()
  return ok(db, input.id)
}

/** agent/sendbackPromotion (#18): requested → none + reason. audit-less. */
export function sendbackPromotion(db: Db, _ctx: Ctx, input: Cmd<AgentReasonInput> & { id: string }): R {
  const cur = loadAgent(db, input.id)
  if (!cur) return denial('NOT_FOUND')
  if (input.reason.trim() === '') return denial('EMPTY_REASON')
  if (cur.promotion_status !== 'requested') return denial('WRONG_STATE')
  db.transaction(() => {
    db.prepare('UPDATE agents SET promotion_status = ?, promotion_sendback_reason = ?, promotion_requested_by = NULL WHERE id = ?').run(
      'none',
      input.reason,
      input.id,
    )
  })()
  return ok(db, input.id)
}

/** agent/emergencyStop (#19): trust → supervised (audit on the un-paused → paused transition only). */
export function emergencyStop(db: Db, ctx: Ctx, input: Cmd<AgentReasonInput> & { id: string }): R {
  const cur = loadAgent(db, input.id)
  if (!cur) return denial('NOT_FOUND')
  if (input.reason.trim() === '') return denial('EMPTY_REASON')
  if (cur.paused === 1) {
    // idempotent: already paused → only update the reason, NO audit (live behaviour)
    db.transaction(() => {
      db.prepare('UPDATE agents SET paused_reason = ? WHERE id = ?').run(input.reason, input.id)
    })()
    return ok(db, input.id)
  }
  const audit = db.transaction(() => {
    db.prepare('UPDATE agents SET paused = 1, paused_reason = ?, trust_before_pause = ?, trust = ? WHERE id = ?').run(
      input.reason,
      cur.trust,
      'supervised',
      input.id,
    )
    return insertAudit(db, ctx, {
      entityType: 'agent',
      entityId: input.id,
      caseId: null,
      action: '緊急停止',
      before: JSON.stringify({ trust: cur.trust }),
      after: JSON.stringify({ trust: 'supervised', paused: true }),
    })
  })()
  return ok(db, input.id, audit)
}

/** agent/resume (#20): restore trust; un-paused → NOT_PAUSED. audit-emitting. */
export function resumeAgent(db: Db, ctx: Ctx, input: Cmd<AgentReasonInput> & { id: string }): R {
  const cur = loadAgent(db, input.id)
  if (!cur) return denial('NOT_FOUND')
  if (input.reason.trim() === '') return denial('EMPTY_REASON')
  if (cur.paused !== 1) return denial('NOT_PAUSED')
  const restored = cur.trust_before_pause ?? cur.trust
  const audit = db.transaction(() => {
    db.prepare('UPDATE agents SET paused = 0, paused_reason = NULL, trust = ?, trust_before_pause = NULL WHERE id = ?').run(restored, input.id)
    return insertAudit(db, ctx, {
      entityType: 'agent',
      entityId: input.id,
      caseId: null,
      action: '再開',
      before: JSON.stringify({ trust: 'supervised', paused: true }),
      after: JSON.stringify({ trust: restored, paused: false }),
    })
  })()
  return ok(db, input.id, audit)
}
