import { describe, it, expect } from 'vitest'
import { seededDb } from './helpers/db.js'
import type { Db } from '../src/db/connection.js'
import { SessionStore } from '../src/identity/session.js'
import { dispatchMutation, type MutationDeps } from '../src/handlers/router.js'
import { ApproveCaseSchema } from '../src/handlers/schemas.js'
import * as cases from '../src/handlers/cases.js'

const SECRET = 'dispatch-fixture-secret'
const T0 = Date.parse('2026-05-30T18:00:00+09:00')
const READY0 = 'CASE-2026-0139'

function setup(): { db: Db; deps: MutationDeps; token: string } {
  const db = seededDb()
  const store = new SessionStore()
  const { token } = store.issue('op-demo-1', SECRET, { now: T0, jti: 'j1' })
  return { db, deps: { sessionStore: store, secret: SECRET, now: T0 }, token }
}

const approve = (db: Db, deps: MutationDeps, raw: { token?: string; body: unknown; id?: string }) =>
  dispatchMutation(db, deps, { token: raw.token, body: raw.body, params: { id: raw.id ?? READY0 } }, ApproveCaseSchema, (d, c, i, p) =>
    cases.approveCase(d, c, { ...i, id: p.id! }),
  )

describe('mutation dispatch — identity + governance + validation', () => {
  it('happy path: 200 + updated entity', () => {
    const { db, deps, token } = setup()
    const r = approve(db, deps, { token, body: { actorId: 'actor-inputter', by: 'input' } })
    expect(r.status).toBe(200)
    expect((r.body as { ok: boolean }).ok).toBe(true)
    db.close()
  })

  it('T-GOV-NO-MUTATE: governance persona is rejected on every mutation (FORBIDDEN_GOVERNANCE)', () => {
    const { db, deps, token } = setup()
    const r = approve(db, deps, { token, body: { actorId: 'actor-gov-legal', by: 'input' } })
    expect(r.body).toEqual({ ok: false, denialReason: 'FORBIDDEN_GOVERNANCE' })
    expect(r.status).toBe(403)
    db.close()
  })

  it('T-PERSONA-VALIDATED / T-UNKNOWN-ACTOR: unknown body actorId → UNKNOWN_ACTOR', () => {
    const { db, deps, token } = setup()
    const r = approve(db, deps, { token, body: { actorId: 'actor-evil', by: 'input' } })
    expect(r.body).toEqual({ ok: false, denialReason: 'UNKNOWN_ACTOR' })
    db.close()
  })

  it('T-STRICT-BODY: unknown body key → UNKNOWN_FIELD (mass-assignment blocked)', () => {
    const { db, deps, token } = setup()
    const r = approve(db, deps, { token, body: { actorId: 'actor-inputter', by: 'input', status: 'reflected' } })
    expect(r.body).toEqual({ ok: false, denialReason: 'UNKNOWN_FIELD' })
    db.close()
  })

  it('input-enum-rejection: bad enum value on a known key → VALIDATION', () => {
    const { db, deps, token } = setup()
    const r = approve(db, deps, { token, body: { actorId: 'actor-inputter', by: 'admin' } })
    expect(r.body).toEqual({ ok: false, denialReason: 'VALIDATION' })
    db.close()
  })

  it('token missing/invalid → TOKEN_INVALID (401)', () => {
    const { db, deps } = setup()
    const noTok = approve(db, deps, { token: undefined, body: { actorId: 'actor-inputter', by: 'input' } })
    expect(noTok.status).toBe(401)
    expect((noTok.body as { denialReason: string }).denialReason).toBe('TOKEN_INVALID')
    db.close()
  })

  it('T-OPERATOR-IMMUTABLE: body actorId sets effective only; session_operator_id stays token-derived', () => {
    const { db, deps, token } = setup()
    expect(approve(db, deps, { token, body: { actorId: 'actor-inputter', by: 'input' } }).status).toBe(200)
    const row = db.prepare('SELECT actor_id, session_operator_id FROM audit_events ORDER BY seq DESC LIMIT 1').get() as {
      actor_id: string
      session_operator_id: string
    }
    expect(row.actor_id).toBe('actor-inputter') // effective (body)
    expect(row.session_operator_id).toBe('op-demo-1') // operator (token) — not influenced by body actorId
    db.close()
  })
})
