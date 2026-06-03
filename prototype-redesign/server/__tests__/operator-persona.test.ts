import { describe, it, expect } from 'vitest'
import { seededDb } from './helpers/db.js'
import * as cases from '../src/handlers/cases.js'

const READY0 = 'CASE-2026-0139'

// Contract 03 §4 honest-framing (gate-1 F7): the cross-row property distinct from the single-row
// both-ids-in-audit assertion — a single operator who switches persona to complete four-eyes passes,
// but BOTH audit rows carry the same session_operator_id, leaving the played-both-personas trace VISIBLE.
describe('operator ≠ persona (SD-1 honest framing)', () => {
  it('persona-switch-passes-four-eyes-visibly: same operator, two personas → four-eyes passes + shared session_operator_id', () => {
    const db = seededDb()
    const asInputter = { sessionOperatorId: 'op-demo-1', effectiveActorId: 'actor-inputter', role: 'inputter' as const }
    const asChecker = { sessionOperatorId: 'op-demo-1', effectiveActorId: 'actor-checker', role: 'checker' as const }

    expect(cases.approveCase(db, asInputter, { id: READY0, by: 'input' }).ok).toBe(true)
    // four-eyes PASSES because the persona changed (actor-checker ≠ actor-inputter), even though the
    // real operator is the same — that is the demonstrated honest-framing behaviour.
    expect(cases.approveCase(db, asChecker, { id: READY0, by: 'checker' }).ok).toBe(true)
    expect((db.prepare('SELECT status FROM cases WHERE id = ?').get(READY0) as { status: string }).status).toBe('reflected')

    const rows = db
      .prepare('SELECT actor_id, session_operator_id FROM audit_events WHERE case_id = ? ORDER BY seq')
      .all(READY0) as { actor_id: string; session_operator_id: string }[]
    expect(rows.map((r) => r.actor_id)).toEqual(['actor-inputter', 'actor-checker']) // two distinct personas
    expect(rows.every((r) => r.session_operator_id === 'op-demo-1')).toBe(true) // same operator on BOTH rows → VISIBLE
    db.close()
  })

  it('two distinct operators completing four-eyes leave distinct session_operator_id rows', () => {
    const db = seededDb()
    expect(cases.approveCase(db, { sessionOperatorId: 'op-demo-1', effectiveActorId: 'actor-inputter', role: 'inputter' }, { id: READY0, by: 'input' }).ok).toBe(true)
    expect(cases.approveCase(db, { sessionOperatorId: 'op-demo-2', effectiveActorId: 'actor-checker', role: 'checker' }, { id: READY0, by: 'checker' }).ok).toBe(true)
    const ops = (db.prepare('SELECT session_operator_id FROM audit_events WHERE case_id = ? ORDER BY seq').all(READY0) as { session_operator_id: string }[]).map(
      (r) => r.session_operator_id,
    )
    expect(ops).toEqual(['op-demo-1', 'op-demo-2'])
    db.close()
  })
})
