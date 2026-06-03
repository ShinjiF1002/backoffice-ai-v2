import type { Db } from '../db/connection.js'
import { denial, type Denial } from '../denial.js'
import { insertAudit, nextSeq } from '../audit.js'
import {
  type Ctx,
  type Cmd,
  type CaseRow,
  type HandlerResult,
  isSelfApproval,
  loadCase,
  loadEscalation,
} from './shared.js'
import type {
  ApproveCaseInput,
  OverrideInput,
  CaseSendbackInput,
  EscalateInput,
  ResolveEscalationInput,
  AssignInput,
  BulkApproveInput,
  ReverseInput,
  CreateCaseInput,
} from './schemas.js'

type CaseResult = HandlerResult<CaseRow>
const ok = (db: Db, id: string, auditEvent?: ReturnType<typeof insertAudit>): HandlerResult<CaseRow> => ({
  ok: true,
  entity: loadCase(db, id)!,
  auditEvent,
})

const isActor = (db: Db, id: string): boolean => db.prepare('SELECT 1 FROM actors WHERE id = ?').get(id) !== undefined
const isWorkflow = (db: Db, id: string): boolean => db.prepare('SELECT 1 FROM workflows WHERE id = ?').get(id) !== undefined

/** case/approve (#1 input / #2 checker). input: STATE only. checker: STATE + identity-SoD. */
function approveOne(db: Db, ctx: Ctx, id: string, by: 'input' | 'checker'): CaseResult {
  const cur = loadCase(db, id)
  if (!cur) return denial('NOT_FOUND')
  if (by === 'input') {
    if (cur.status !== 'ready') return denial('WRONG_STATE')
    if (cur.flags > 0) return denial('FLAGS_REMAIN')
    const audit = db.transaction(() => {
      db.prepare('UPDATE cases SET status = ?, input_approved_by = ? WHERE id = ?').run('business-approval-waiting', ctx.effectiveActorId, id)
      return insertAudit(db, ctx, {
        entityType: 'case',
        entityId: id,
        caseId: id,
        action: '入力者承認',
        before: JSON.stringify({ status: 'ready' }),
        after: JSON.stringify({ status: 'business-approval-waiting' }),
      })
    })()
    return ok(db, id, audit)
  }
  // checker
  if (cur.status !== 'business-approval-waiting') return denial('WRONG_STATE')
  if (isSelfApproval(cur.input_approved_by, ctx.effectiveActorId)) return denial('SELF_APPROVAL')
  const audit = db.transaction(() => {
    db.prepare('UPDATE cases SET status = ? WHERE id = ?').run('reflected', id)
    const seq = nextSeq(db) // == the seq insertAudit will use (no audit row inserted yet)
    return insertAudit(db, ctx, {
      entityType: 'case',
      entityId: id,
      caseId: id,
      action: '承認者承認',
      before: JSON.stringify({ status: 'business-approval-waiting' }),
      // approvalId = A-(8000+seq) ported from live reducer (reducer.ts:95); recorded in after_json
      // rather than a redundant column (08 makes approval_id optional/derivable from seq).
      after: JSON.stringify({ status: 'reflected', approvalId: `A-${8000 + seq}` }),
    })
  })()
  return ok(db, id, audit)
}

export function approveCase(db: Db, ctx: Ctx, input: Cmd<ApproveCaseInput> & { id: string }): CaseResult {
  return approveOne(db, ctx, input.id, input.by)
}

/** case/override (#3): resolve a field + decrement flags. STATE only (idempotent on resolved). */
export function overrideField(db: Db, ctx: Ctx, input: Cmd<OverrideInput> & { id: string }): CaseResult {
  const cur = loadCase(db, input.id)
  if (!cur) return denial('NOT_FOUND')
  if (input.value.trim() === '') return denial('EMPTY_VALUE')
  const field = db
    .prepare('SELECT resolved FROM case_fields WHERE case_id = ? AND field_label = ?')
    .get(input.id, input.fieldLabel) as { resolved: number } | undefined
  if (field && field.resolved === 1) return denial('ALREADY_RESOLVED')
  const audit = db.transaction(() => {
    if (field) {
      db.prepare('UPDATE case_fields SET resolved = 1, human_value = ? WHERE case_id = ? AND field_label = ?').run(input.value, input.id, input.fieldLabel)
    } else {
      db.prepare('INSERT INTO case_fields (case_id, field_label, reconcile_state, resolved, human_value) VALUES (?, ?, ?, 1, ?)').run(
        input.id,
        input.fieldLabel,
        'manually_confirmed',
        input.value,
      )
    }
    db.prepare('UPDATE cases SET flags = MAX(0, flags - 1) WHERE id = ?').run(input.id)
    return insertAudit(db, ctx, {
      entityType: 'case',
      entityId: input.id,
      caseId: input.id,
      action: '項目確定',
      after: JSON.stringify({ field: input.fieldLabel, resolved: true }),
    })
  })()
  return ok(db, input.id, audit)
}

/** case/sendback (#4): ready|business-approval-waiting → sent-back. */
export function sendbackCase(db: Db, ctx: Ctx, input: Cmd<CaseSendbackInput> & { id: string }): CaseResult {
  const cur = loadCase(db, input.id)
  if (!cur) return denial('NOT_FOUND')
  if (input.reason.trim() === '') return denial('EMPTY_REASON')
  if (cur.status !== 'ready' && cur.status !== 'business-approval-waiting') return denial('WRONG_STATE')
  const audit = db.transaction(() => {
    db.prepare('UPDATE cases SET status = ?, sendback_reason = ?, sendback_category = ? WHERE id = ?').run('sent-back', input.reason, input.category, input.id)
    return insertAudit(db, ctx, {
      entityType: 'case',
      entityId: input.id,
      caseId: input.id,
      action: '差戻し',
      after: JSON.stringify({ status: 'sent-back', category: input.category }),
    })
  })()
  return ok(db, input.id, audit)
}

/** case/escalate (#5): record an arbitration request (status unchanged). */
export function escalateCase(db: Db, ctx: Ctx, input: Cmd<EscalateInput> & { id: string }): CaseResult {
  const cur = loadCase(db, input.id)
  if (!cur) return denial('NOT_FOUND')
  if (input.reason.trim() === '') return denial('EMPTY_REASON')
  if (!isActor(db, input.to)) return denial('VALIDATION') // arbiter must be a known actor
  const audit = db.transaction(() => {
    db.prepare(
      `INSERT INTO escalations (case_id, reason, category, escalated_to, escalated_from, resolution)
       VALUES (?, ?, ?, ?, ?, NULL)
       ON CONFLICT(case_id) DO UPDATE SET reason = excluded.reason, category = excluded.category,
         escalated_to = excluded.escalated_to, escalated_from = excluded.escalated_from, resolution = NULL`,
    ).run(input.id, input.reason, input.category, input.to, ctx.effectiveActorId)
    return insertAudit(db, ctx, {
      entityType: 'case',
      entityId: input.id,
      caseId: input.id,
      action: 'エスカレーション',
      after: JSON.stringify({ to: input.to, category: input.category }),
    })
  })()
  return ok(db, input.id, audit)
}

/** case/resolveEscalation (#6): designated-arbiter-only (identity-SoD). */
export function resolveEscalation(db: Db, ctx: Ctx, input: Cmd<ResolveEscalationInput> & { id: string }): CaseResult {
  const cur = loadCase(db, input.id)
  if (!cur) return denial('NOT_FOUND')
  const esc = loadEscalation(db, input.id)
  if (!esc) return denial('NO_ESCALATION')
  if (esc.resolution !== null) return denial('ALREADY_RESOLVED')
  if (ctx.effectiveActorId !== esc.escalated_to) return denial('NOT_ARBITRATOR')
  const audit = db.transaction(() => {
    if (input.resolution === 'proceed') {
      db.prepare('UPDATE escalations SET resolution = ? WHERE case_id = ?').run('proceed', input.id)
      return insertAudit(db, ctx, {
        entityType: 'case',
        entityId: input.id,
        caseId: input.id,
        action: 'エスカレーション裁定',
        after: JSON.stringify({ resolution: 'proceed' }),
      })
    }
    const reason = input.reason ?? esc.reason
    const category = input.category ?? esc.category
    db.prepare('UPDATE cases SET status = ?, sendback_reason = ?, sendback_category = ? WHERE id = ?').run('sent-back', reason, category, input.id)
    db.prepare('UPDATE escalations SET resolution = ? WHERE case_id = ?').run('sendback', input.id)
    return insertAudit(db, ctx, {
      entityType: 'case',
      entityId: input.id,
      caseId: input.id,
      action: 'エスカレーション裁定',
      after: JSON.stringify({ resolution: 'sendback', status: 'sent-back' }),
    })
  })()
  return ok(db, input.id, audit)
}

/** case/assign (#7): STATE only, NO audit (live behaviour). */
export function assignCase(db: Db, _ctx: Ctx, input: Cmd<AssignInput> & { id: string }): CaseResult {
  const cur = loadCase(db, input.id)
  if (!cur) return denial('NOT_FOUND')
  db.transaction(() => {
    db.prepare('UPDATE cases SET assignee_name = ? WHERE id = ?').run(input.assignee, input.id)
  })()
  return { ok: true, entity: loadCase(db, input.id)! }
}

/** case/bulkApprove (#8): partial-success (self-approval / prior-state mismatch rows auto-skip). */
export function bulkApprove(
  db: Db,
  ctx: Ctx,
  input: Cmd<BulkApproveInput>,
): { ok: true; entity: { approved: number; skipped: number } } | Denial {
  let approved = 0
  let skipped = 0
  for (const id of input.ids) {
    const r = approveOne(db, ctx, id, input.by)
    if (r.ok) approved += 1
    else skipped += 1
  }
  return { ok: true, entity: { approved, skipped } }
}

/** case/reverse (#9): reflected → sent-back; double-reverse blocked. */
export function reverseCase(db: Db, ctx: Ctx, input: Cmd<ReverseInput> & { id: string }): CaseResult {
  const cur = loadCase(db, input.id)
  if (!cur) return denial('NOT_FOUND')
  if (input.reason.trim() === '') return denial('EMPTY_REASON')
  // reversal check BEFORE status: after one reverse the case is sent-back (not reflected); a second
  // attempt must surface ALREADY_REVERSED (T-DOUBLE), not WRONG_STATE.
  if (cur.reversal_kind !== null) return denial('ALREADY_REVERSED')
  if (cur.status !== 'reflected') return denial('WRONG_STATE')
  const audit = db.transaction(() => {
    db.prepare('UPDATE cases SET status = ?, reversal_kind = ?, reversal_reason = ? WHERE id = ?').run('sent-back', input.kind, input.reason, input.id)
    return insertAudit(db, ctx, {
      entityType: 'case',
      entityId: input.id,
      caseId: input.id,
      action: input.kind,
      after: JSON.stringify({ status: 'sent-back', kind: input.kind }),
    })
  })()
  return ok(db, input.id, audit)
}

/** case/reprocess (#10): sent-back → ready; clear sendback/reversal. */
export function reprocessCase(db: Db, ctx: Ctx, input: { id: string }): CaseResult {
  const cur = loadCase(db, input.id)
  if (!cur) return denial('NOT_FOUND')
  if (cur.status !== 'sent-back') return denial('WRONG_STATE')
  const audit = db.transaction(() => {
    db.prepare(
      'UPDATE cases SET status = ?, sendback_reason = NULL, sendback_category = NULL, reversal_kind = NULL, reversal_reason = NULL WHERE id = ?',
    ).run('ready', input.id)
    return insertAudit(db, ctx, {
      entityType: 'case',
      entityId: input.id,
      caseId: input.id,
      action: '再処理',
      after: JSON.stringify({ status: 'ready' }),
    })
  })()
  return ok(db, input.id, audit)
}

/** case/create (#11): manual draft. duplicate id → CONFLICT; any empty field → INCOMPLETE. */
export function createCase(db: Db, ctx: Ctx, input: Cmd<CreateCaseInput>): CaseResult {
  if (loadCase(db, input.id)) return denial('CONFLICT')
  if (!isWorkflow(db, input.workflowId)) return denial('VALIDATION')
  for (const label of input.fieldLabels) {
    const v = input.values[label]
    if (v === undefined || v.trim() === '') return denial('INCOMPLETE')
  }
  const audit = db.transaction(() => {
    db.prepare(
      `INSERT INTO cases (id, workflow_id, status, assignee_name, flags, origin, received_at)
       VALUES (?, ?, 'ready', ?, 0, 'manual', ?)`,
    ).run(input.id, input.workflowId, input.assignee ?? null, input.receivedAt)
    for (const label of input.fieldLabels) {
      db.prepare(
        'INSERT INTO case_fields (case_id, field_label, reconcile_state, resolved, human_value) VALUES (?, ?, ?, 1, ?)',
      ).run(input.id, label, 'manually_confirmed', input.values[label]!)
    }
    return insertAudit(db, ctx, {
      entityType: 'case',
      entityId: input.id,
      caseId: input.id,
      action: '手動起票',
      after: JSON.stringify({ origin: 'manual', status: 'ready' }),
    })
  })()
  return ok(db, input.id, audit)
}
