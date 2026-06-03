import type { Db } from '../db/connection.js'
import { denial } from '../denial.js'
import { type Ctx, type Cmd, type ProposalRow, type HandlerResult, isSelfApproval, loadProposal } from './shared.js'
import type { ProposalRejectInput, ProposalSendbackInput } from './schemas.js'

type R = HandlerResult<ProposalRow>
const ok = (db: Db, id: string): R => ({ ok: true, entity: loadProposal(db, id)! })

// All proposal mutations are audit-LESS (contract 04 audit column `—`); each still wraps its domain
// write in db.transaction (06 §契約5 / mechanical grep gate).

/** proposal/forward (#12): pending-triage → forwarded; record forwarded_by (SoD discriminant). */
export function forwardProposal(db: Db, ctx: Ctx, input: { id: string }): R {
  const cur = loadProposal(db, input.id)
  if (!cur) return denial('NOT_FOUND')
  if (cur.status !== 'pending-triage') return denial('WRONG_STATE')
  db.transaction(() => {
    db.prepare('UPDATE proposals SET status = ?, forwarded_by = ? WHERE id = ?').run('forwarded', ctx.effectiveActorId, input.id)
  })()
  return ok(db, input.id)
}

/** proposal/approve (#13): forwarded → approved; identity-SoD (sender ≠ approver). */
export function approveProposal(db: Db, ctx: Ctx, input: { id: string }): R {
  const cur = loadProposal(db, input.id)
  if (!cur) return denial('NOT_FOUND')
  if (cur.status !== 'forwarded') return denial('WRONG_STATE')
  if (isSelfApproval(cur.forwarded_by, ctx.effectiveActorId)) return denial('SELF_APPROVAL')
  db.transaction(() => {
    db.prepare('UPDATE proposals SET status = ? WHERE id = ?').run('approved', input.id)
  })()
  return ok(db, input.id)
}

/** proposal/reject (#14): pending-triage|forwarded → rejected; reason required. */
export function rejectProposal(db: Db, _ctx: Ctx, input: Cmd<ProposalRejectInput> & { id: string }): R {
  const cur = loadProposal(db, input.id)
  if (!cur) return denial('NOT_FOUND')
  if (input.reason.trim() === '') return denial('EMPTY_REASON')
  if (cur.status !== 'pending-triage' && cur.status !== 'forwarded') return denial('WRONG_STATE')
  db.transaction(() => {
    db.prepare('UPDATE proposals SET status = ?, decision_kind = ?, decision_reason = ?, decision_category = ? WHERE id = ?').run(
      'rejected',
      'reject',
      input.reason,
      input.category ?? null,
      input.id,
    )
  })()
  return ok(db, input.id)
}

/** proposal/sendback (#15): forwarded → pending-triage; reason required. */
export function sendbackProposal(db: Db, _ctx: Ctx, input: Cmd<ProposalSendbackInput> & { id: string }): R {
  const cur = loadProposal(db, input.id)
  if (!cur) return denial('NOT_FOUND')
  if (input.reason.trim() === '') return denial('EMPTY_REASON')
  if (cur.status !== 'forwarded') return denial('WRONG_STATE')
  db.transaction(() => {
    db.prepare('UPDATE proposals SET status = ?, decision_kind = ?, decision_reason = ?, decision_category = ? WHERE id = ?').run(
      'pending-triage',
      'sendback',
      input.reason,
      input.category ?? null,
      input.id,
    )
  })()
  return ok(db, input.id)
}
