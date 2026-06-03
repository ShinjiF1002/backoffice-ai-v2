import { describe, it, expect } from 'vitest'
import { seededDb, ctxFor } from './helpers/db.js'
import type { Db } from '../src/db/connection.js'
import * as cases from '../src/handlers/cases.js'
import * as proposals from '../src/handlers/proposals.js'
import * as agents from '../src/handlers/agents.js'
import * as notifications from '../src/handlers/notifications.js'

const auditCount = (db: Db): number => (db.prepare('SELECT COUNT(*) AS c FROM audit_events').get() as { c: number }).c
const statusOf = (db: Db, id: string): string => (db.prepare('SELECT status FROM cases WHERE id = ?').get(id) as { status: string }).status
const reason = (r: unknown): string | undefined => (r && typeof r === 'object' && 'denialReason' in r ? (r as { denialReason: string }).denialReason : undefined)

// fixtures (from the parity seed)
const READY0 = 'CASE-2026-0139' // ready, flags 0
const READY_FLAGGED = 'CASE-2026-0142' // ready, flags 1
const BAW = 'CASE-2026-0128' // business-approval-waiting, input_approved_by = actor-inputter
const PENDING = 'CASE-2026-0150'
const REFLECTED = 'CASE-2026-0112' // reflected, no escalation
const ESC_UNRESOLVED = 'CASE-2026-0145' // escalated_to actor-approver, resolution null
const ESC_RESOLVED = 'CASE-2026-0120' // resolution proceed

describe('four-eyes SoD (04 §3a)', () => {
  it('T-SELF: same persona input→checker approve is rejected', () => {
    const db = seededDb()
    const inputter = ctxFor(db, 'actor-inputter')
    expect(cases.approveCase(db, inputter, { id: READY0, by: 'input' }).ok).toBe(true)
    expect(statusOf(db, READY0)).toBe('business-approval-waiting')
    const self = cases.approveCase(db, inputter, { id: READY0, by: 'checker' })
    expect(reason(self)).toBe('SELF_APPROVAL')
    expect(statusOf(db, READY0)).toBe('business-approval-waiting') // unchanged
    // a different persona may complete it
    expect(cases.approveCase(db, ctxFor(db, 'actor-checker'), { id: READY0, by: 'checker' }).ok).toBe(true)
    expect(statusOf(db, READY0)).toBe('reflected')
    db.close()
  })

  it('T-PROP-SELF: proposal sender cannot self-approve', () => {
    const db = seededDb()
    const inputter = ctxFor(db, 'actor-inputter')
    expect(proposals.forwardProposal(db, inputter, { id: 'PROP-2026-031' }).ok).toBe(true)
    expect(reason(proposals.approveProposal(db, inputter, { id: 'PROP-2026-031' }))).toBe('SELF_APPROVAL')
    expect(proposals.approveProposal(db, ctxFor(db, 'actor-approver'), { id: 'PROP-2026-031' }).ok).toBe(true)
    db.close()
  })

  it('T-PROMO-SELF: promotion requester cannot self-approve', () => {
    const db = seededDb()
    // agent-direct-debit is seeded requested by actor-inputter
    expect(reason(agents.approvePromotion(db, ctxFor(db, 'actor-inputter'), { id: 'agent-direct-debit' }))).toBe('SELF_APPROVAL')
    expect(agents.approvePromotion(db, ctxFor(db, 'actor-approver'), { id: 'agent-direct-debit' }).ok).toBe(true)
    db.close()
  })

  it('T-ARB / idor-actor-spoof-mutation: only the designated arbiter (server-resolved persona) may resolve', () => {
    const db = seededDb()
    // escalated_to = actor-approver; a non-arbiter persona is rejected on the server-resolved effective_actor_id
    expect(reason(cases.resolveEscalation(db, ctxFor(db, 'actor-inputter'), { id: ESC_UNRESOLVED, resolution: 'proceed' }))).toBe('NOT_ARBITRATOR')
    expect(reason(cases.resolveEscalation(db, ctxFor(db, 'actor-checker'), { id: ESC_UNRESOLVED, resolution: 'proceed' }))).toBe('NOT_ARBITRATOR')
    expect(cases.resolveEscalation(db, ctxFor(db, 'actor-approver'), { id: ESC_UNRESOLVED, resolution: 'proceed' }).ok).toBe(true)
    db.close()
  })
})

describe('state preconditions (T-STATE discrete)', () => {
  it('rejects per-action prior-state mismatches', () => {
    const db = seededDb()
    const inp = ctxFor(db, 'actor-inputter')
    const chk = ctxFor(db, 'actor-checker')
    expect(reason(cases.approveCase(db, inp, { id: PENDING, by: 'input' }))).toBe('WRONG_STATE')
    expect(reason(cases.approveCase(db, chk, { id: PENDING, by: 'checker' }))).toBe('WRONG_STATE')
    expect(reason(cases.approveCase(db, inp, { id: READY_FLAGGED, by: 'input' }))).toBe('FLAGS_REMAIN')
    expect(reason(cases.sendbackCase(db, inp, { id: REFLECTED, reason: 'x', category: 'c' }))).toBe('WRONG_STATE')
    expect(reason(cases.reverseCase(db, chk, { id: READY0, kind: '訂正', reason: 'x' }))).toBe('WRONG_STATE')
    expect(reason(cases.reprocessCase(db, inp, { id: READY0 }))).toBe('WRONG_STATE')
    expect(reason(proposals.forwardProposal(db, inp, { id: 'PROP-2026-024' }))).toBe('WRONG_STATE') // approved, not pending-triage
    expect(reason(proposals.approveProposal(db, ctxFor(db, 'actor-approver'), { id: 'PROP-2026-031' }))).toBe('WRONG_STATE') // pending-triage, not forwarded
    expect(reason(agents.approvePromotion(db, ctxFor(db, 'actor-approver'), { id: 'agent-card-reissue' }))).toBe('WRONG_STATE') // none, not requested
    // approve direct-debit (seeded 'requested'), then a re-request is ALREADY_APPROVED
    expect(agents.approvePromotion(db, ctxFor(db, 'actor-approver'), { id: 'agent-direct-debit' }).ok).toBe(true)
    expect(reason(agents.requestPromotion(db, inp, { id: 'agent-direct-debit' }))).toBe('ALREADY_APPROVED')
    db.close()
  })

  it('T-DOUBLE: double reverse rejected; T-RESOLVED: re-resolve rejected; T-NOT-PAUSED: resume un-paused rejected', () => {
    const db = seededDb()
    const chk = ctxFor(db, 'actor-checker')
    expect(cases.reverseCase(db, chk, { id: REFLECTED, kind: '訂正', reason: 'x' }).ok).toBe(true)
    expect(reason(cases.reverseCase(db, chk, { id: REFLECTED, kind: '取消', reason: 'y' }))).toBe('ALREADY_REVERSED')
    expect(reason(cases.resolveEscalation(db, ctxFor(db, 'actor-approver'), { id: ESC_RESOLVED, resolution: 'proceed' }))).toBe('ALREADY_RESOLVED')
    expect(reason(agents.resumeAgent(db, chk, { id: 'agent-card-reissue', reason: 'x' }))).toBe('NOT_PAUSED')
    db.close()
  })

  it('T-EMPTY / T-DUP / T-INCOMPLETE', () => {
    const db = seededDb()
    const inp = ctxFor(db, 'actor-inputter')
    expect(reason(cases.sendbackCase(db, inp, { id: READY0, reason: '  ', category: 'c' }))).toBe('EMPTY_REASON')
    expect(reason(cases.overrideField(db, inp, { id: READY_FLAGGED, fieldLabel: '新住所', value: '' }))).toBe('EMPTY_VALUE')
    // override same field twice → 2nd ALREADY_RESOLVED
    expect(cases.overrideField(db, inp, { id: READY_FLAGGED, fieldLabel: '新住所', value: 'v' }).ok).toBe(true)
    expect(reason(cases.overrideField(db, inp, { id: READY_FLAGGED, fieldLabel: '新住所', value: 'v2' }))).toBe('ALREADY_RESOLVED')
    // create: duplicate id → CONFLICT; empty field → INCOMPLETE
    expect(reason(cases.createCase(db, inp, { id: READY0, workflowId: 'UC-BO-01', workflowName: '法人住所変更', fieldLabels: ['x'], values: { x: 'v' }, receivedAt: '2026-05-30T10:00:00+09:00' }))).toBe('CONFLICT')
    expect(reason(cases.createCase(db, inp, { id: 'CASE-MANUAL-1', workflowId: 'UC-BO-01', workflowName: '法人住所変更', fieldLabels: ['x'], values: { x: '' }, receivedAt: '2026-05-30T10:00:00+09:00' }))).toBe('INCOMPLETE')
    db.close()
  })
})

describe('bulk partial-success (#8)', () => {
  it('T-BULK-SELF + T-BULK-FLAGS: self-approval and prior-state mismatch rows auto-skip', () => {
    const db = seededDb()
    const inp = ctxFor(db, 'actor-inputter')
    // make BAW self-approvable by inputter (input_approved_by seeded = actor-inputter)
    // ids: [BAW (self for inputter), READY_FLAGGED (ready, not baw → checker skip), other baw]
    const checker = ctxFor(db, 'actor-checker')
    const r = cases.bulkApprove(db, checker, { ids: [BAW, READY_FLAGGED], by: 'checker' })
    expect(r.ok).toBe(true)
    if (r.ok) {
      // BAW (input_approved_by actor-inputter, checker ≠ inputter) → approved; READY_FLAGGED (ready, not baw) → skipped
      expect(r.entity.approved).toBe(1)
      expect(r.entity.skipped).toBe(1)
    }
    // self-approval skip: inputter bulk-approving a baw they input-approved
    const r2 = cases.bulkApprove(db, inp, { ids: ['CASE-2026-0110'], by: 'checker' }) // baw, input_approved_by actor-inputter
    expect(r2.ok && r2.entity.approved === 0 && r2.entity.skipped === 1).toBe(true)
    db.close()
  })
})

describe('audit emission (T-NO-AUDIT + monotonic seq)', () => {
  it('audit-emitting mutation appends exactly +1; guard no-op appends +0', () => {
    const db = seededDb()
    const before = auditCount(db)
    expect(cases.approveCase(db, ctxFor(db, 'actor-inputter'), { id: READY0, by: 'input' }).ok).toBe(true)
    expect(auditCount(db)).toBe(before + 1)
    // guard no-op (wrong state) → no audit
    cases.approveCase(db, ctxFor(db, 'actor-inputter'), { id: PENDING, by: 'input' })
    expect(auditCount(db)).toBe(before + 1)
    db.close()
  })

  it('T-NO-AUDIT: audit-less mutations (assign / proposal forward / promotion approve / markRead) append +0', () => {
    const db = seededDb()
    const before = auditCount(db)
    expect(cases.assignCase(db, ctxFor(db, 'actor-checker'), { id: READY0, assignee: '田中' }).ok).toBe(true)
    expect(proposals.forwardProposal(db, ctxFor(db, 'actor-inputter'), { id: 'PROP-2026-031' }).ok).toBe(true)
    expect(agents.approvePromotion(db, ctxFor(db, 'actor-approver'), { id: 'agent-direct-debit' }).ok).toBe(true)
    expect(notifications.markRead(db, ctxFor(db, 'actor-inputter'), { id: 'notif-x' }).ok).toBe(true)
    expect(auditCount(db)).toBe(before)
    db.close()
  })

  it('seq is monotonic 0,1,2 + occurred_at is deterministic auditTs', () => {
    const db = seededDb()
    const inp = ctxFor(db, 'actor-inputter')
    cases.sendbackCase(db, inp, { id: READY0, reason: 'r', category: 'c' }) // audit seq 0
    cases.sendbackCase(db, inp, { id: 'CASE-2026-0145', reason: 'r', category: 'c' }) // audit seq 1
    const rows = db.prepare('SELECT seq, occurred_at FROM audit_events ORDER BY seq').all() as { seq: number; occurred_at: string }[]
    expect(rows.map((r) => r.seq)).toEqual([0, 1])
    expect(rows[0]!.occurred_at).toBe('2026-05-30T18:00:00+09:00')
    expect(rows[1]!.occurred_at).toBe('2026-05-30T18:01:00+09:00')
    db.close()
  })

  it('dual-ID recorded: audit row carries effective_actor_id (body) + session_operator_id (token)', () => {
    const db = seededDb()
    cases.approveCase(db, { sessionOperatorId: 'op-demo-1', effectiveActorId: 'actor-inputter', role: 'inputter' }, { id: READY0, by: 'input' })
    const row = db.prepare('SELECT actor_id, session_operator_id FROM audit_events ORDER BY seq DESC LIMIT 1').get() as {
      actor_id: string
      session_operator_id: string
    }
    expect(row.actor_id).toBe('actor-inputter')
    expect(row.session_operator_id).toBe('op-demo-1')
    db.close()
  })
})

describe('idempotency + atomicity', () => {
  it('T-IDEMPOTENT: markRead/markAllRead do not grow the read-state set on repeat', () => {
    const db = seededDb()
    const inp = ctxFor(db, 'actor-inputter')
    notifications.markRead(db, inp, { id: 'n1' })
    notifications.markRead(db, inp, { id: 'n1' })
    notifications.markAllRead(db, inp, { ids: ['n1', 'n2'] })
    const size = (db.prepare('SELECT COUNT(*) AS c FROM notifications_read_state').get() as { c: number }).c
    expect(size).toBe(2) // n1, n2 — no duplicates
    db.close()
  })

  it('transaction atomicity: an audit INSERT failure rolls back the domain write', () => {
    const db = seededDb()
    const before = statusOf(db, READY0)
    const beforeAudit = auditCount(db)
    // invalid session_operator_id violates the audit_events CHECK → the INSERT throws inside the tx
    const badCtx = { sessionOperatorId: 'op-demo-INVALID', effectiveActorId: 'actor-inputter', role: 'inputter' as const }
    expect(() => cases.approveCase(db, badCtx, { id: READY0, by: 'input' })).toThrow()
    expect(statusOf(db, READY0)).toBe(before) // domain rolled back
    expect(auditCount(db)).toBe(beforeAudit)
    db.close()
  })
})
