import { describe, it, expect } from 'vitest'
import { seededDb, ctxFor } from './helpers/db.js'
import type { Db } from '../src/db/connection.js'
import { SessionStore } from '../src/identity/session.js'
import type { MutationDeps } from '../src/handlers/router.js'
import * as reads from '../src/handlers/reads.js'
import { ListCasesQuery } from '../src/handlers/reads.js'

const SECRET = 'reads-fixture-secret'
const T0 = Date.parse('2026-05-30T18:00:00+09:00')
const reason = (r: unknown): string | undefined => (r && typeof r === 'object' && 'denialReason' in r ? (r as { denialReason: string }).denialReason : undefined)

function setup(): { db: Db; deps: MutationDeps; token: string } {
  const db = seededDb()
  const store = new SessionStore()
  const { token } = store.issue('op-demo-1', SECRET, { now: T0, jti: 'j1' })
  return { db, deps: { sessionStore: store, secret: SECRET, now: T0 }, token }
}

const GOV = 'actor-gov-legal'

describe('governance read-gate (09 §3)', () => {
  it('operational role is rejected on governance-only reads (FORBIDDEN_ROLE); governance is allowed', () => {
    const db = seededDb()
    const op = ctxFor(db, 'actor-inputter')
    const gov = ctxFor(db, GOV)
    for (const fn of [reads.getAuditEvents, reads.getGovernanceModels, reads.getConfigApprovals]) {
      expect(reason(fn(db, op))).toBe('FORBIDDEN_ROLE')
      expect(fn(db, gov).ok).toBe(true)
    }
    db.close()
  })

  it('audit-events read dumps no before/after rows and has no confidence column', () => {
    const db = seededDb()
    const gov = ctxFor(db, GOV)
    const r = reads.getAuditEvents(db, gov)
    expect(r.ok).toBe(true)
    if (r.ok) {
      const rows = r.data as Record<string, unknown>[]
      for (const row of rows) {
        expect('before_json' in row).toBe(false)
        expect('after_json' in row).toBe(false)
      }
    }
    const cols = (db.prepare('PRAGMA table_info(audit_events)').all() as { name: string }[]).map((c) => c.name)
    expect(cols).not.toContain('confidence')
    db.close()
  })
})

describe('read-side IDOR (09 §1-2)', () => {
  it('idor-direct-id-fetch: a non-owner persona gets NOT_FOUND; the owner gets the object', () => {
    const db = seededDb()
    const checker = ctxFor(db, 'actor-checker') // not involved in any escalation
    const approver = ctxFor(db, 'actor-approver') // the designated arbiter (escalated_to)
    expect(reason(reads.getNotificationById(db, checker, undefined, { id: 'esc-to:CASE-2026-0145' }))).toBe('NOT_FOUND')
    expect(reads.getNotificationById(db, approver, undefined, { id: 'esc-to:CASE-2026-0145' }).ok).toBe(true)
    // escalation object: arbiter/requester see it; an uninvolved persona gets NOT_FOUND
    expect(reason(reads.getEscalationById(db, checker, undefined, { id: 'CASE-2026-0145' }))).toBe('NOT_FOUND')
    expect(reads.getEscalationById(db, approver, undefined, { id: 'CASE-2026-0145' }).ok).toBe(true)
    db.close()
  })

  it('idor-cross-actor-read: getNotifications returns only the acting persona’s queue', () => {
    const db = seededDb()
    const approver = reads.getNotifications(db, ctxFor(db, 'actor-approver'))
    const inputter = reads.getNotifications(db, ctxFor(db, 'actor-inputter'))
    expect(approver.ok && inputter.ok).toBe(true)
    if (approver.ok && inputter.ok) {
      const a = (approver.data as { type: string }[]).map((n) => n.type)
      const i = (inputter.data as { type: string }[]).map((n) => n.type)
      expect(a).toContain('arbitration-request') // escalated_to queue
      expect(i).toContain('arbitration-result') // escalated_from closure
      expect(i).toContain('sendback') // sent-back case assigned to 山田太郎 (actor-inputter)
    }
    db.close()
  })

  it('idor sendback vector: a non-assignee persona gets NOT_FOUND for a sendback notification', () => {
    const db = seededDb()
    // CASE-2026-0131 is sent-back, assignee 山田太郎 (= actor-inputter); actor-checker (鈴木課長) is not the assignee
    const inputter = ctxFor(db, 'actor-inputter')
    const checker = ctxFor(db, 'actor-checker')
    expect(reads.getNotificationById(db, inputter, undefined, { id: 'sendback:CASE-2026-0131' }).ok).toBe(true)
    expect(reason(reads.getNotificationById(db, checker, undefined, { id: 'sendback:CASE-2026-0131' }))).toBe('NOT_FOUND')
    db.close()
  })
})

describe('business reads (all-role) coverage', () => {
  it('proposals / agents / approvals lists + detail return data and 404 on missing', () => {
    const db = seededDb()
    const ctx = ctxFor(db, 'actor-inputter')
    for (const r of [reads.listProposals(db), reads.listAgents(db), reads.listApprovals(db)]) {
      expect(r.ok).toBe(true)
      if (r.ok) expect(Array.isArray(r.data)).toBe(true)
    }
    expect(reads.getProposalById(db, ctx, undefined, { id: 'PROP-2026-031' }).ok).toBe(true)
    expect(reason(reads.getProposalById(db, ctx, undefined, { id: 'PROP-NOPE' }))).toBe('NOT_FOUND')
    expect(reads.getAgentById(db, ctx, undefined, { id: 'agent-direct-debit' }).ok).toBe(true)
    expect(reason(reads.getAgentById(db, ctx, undefined, { id: 'agent-nope' }))).toBe('NOT_FOUND')
    // business-approver sees pending promotions via /api/agents (promotion_status included)
    const agents = reads.listAgents(db)
    if (agents.ok) {
      const rows = agents.data as { id: string; promotion_status: string }[]
      expect(rows.find((a) => a.id === 'agent-direct-debit')?.promotion_status).toBe('requested')
    }
    db.close()
  })
})

describe('input allowlist + pagination + injection (09 §2)', () => {
  it('pagination-cap: size is clamped to ≤100 (200 OK, not a reject)', () => {
    const db = seededDb()
    const r = reads.listCases(db, ctxFor(db, 'actor-inputter'), { actorId: 'actor-inputter', size: 500 })
    expect(r.ok).toBe(true)
    if (r.ok) expect((r.data as { size: number }).size).toBe(100)
    db.close()
  })

  it('workflow/status allowlist: an out-of-allowlist filter → VALIDATION', () => {
    const db = seededDb()
    const ctx = ctxFor(db, 'actor-inputter')
    expect(reason(reads.listCases(db, ctx, { actorId: 'actor-inputter', workflow: 'UC-BO-99' }))).toBe('VALIDATION')
    expect(reason(reads.listCases(db, ctx, { actorId: 'actor-inputter', status: 'bogus' }))).toBe('VALIDATION')
    db.close()
  })

  it('pagination-reject: negative/non-int page/size → VALIDATION (via dispatch)', () => {
    const { db, deps, token } = setup()
    const neg = reads.dispatchRead(db, deps, { token, query: { actorId: 'actor-inputter', page: '-1' }, params: {} }, ListCasesQuery, (d, c, q) => reads.listCases(d, c, q))
    expect((neg.body as { denialReason: string }).denialReason).toBe('VALIDATION')
    db.close()
  })

  it('sql-injection-search: SQL meta is bound as a literal — table intact, no leak', () => {
    const db = seededDb()
    const before = (db.prepare('SELECT COUNT(*) AS c FROM cases').get() as { c: number }).c
    const r = reads.searchCases(db, ctxFor(db, 'actor-inputter'), { actorId: 'actor-inputter', q: "'; DROP TABLE cases; --" })
    expect(r.ok).toBe(true)
    if (r.ok) expect((r.data as { rows: unknown[] }).rows.length).toBe(0) // no id literally contains the meta string
    expect((db.prepare('SELECT COUNT(*) AS c FROM cases').get() as { c: number }).c).toBe(before) // table survives
    db.close()
  })
})
