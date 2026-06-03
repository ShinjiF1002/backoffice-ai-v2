import { describe, it, expect } from 'vitest'
import { migratedMemDb, seedRefData } from './helpers/db.js'
import { createApp } from '../src/app.js'
import { signToken, issueToken, verifyToken, TOKEN_EXPIRY_MS } from '../src/identity/token.js'
import { SessionStore } from '../src/identity/session.js'
import { resolveOperator, resolveIdentity, loginOperator, loadAllowedActors } from '../src/identity/identity.js'

const SECRET = 'test-fixture-secret-9f3a'
const T0 = Date.parse('2026-05-30T18:00:00+09:00')
const ALLOWED = new Set(['actor-inputter', 'actor-checker', 'actor-approver', 'actor-gov-legal', 'actor-gov-compliance'])

describe('token sign/verify (03 §1)', () => {
  it('round-trips a valid token', () => {
    const { token, payload } = issueToken('op-demo-1', SECRET, { jti: 'j1', now: T0 })
    const v = verifyToken(token, SECRET, { now: T0 })
    expect(v.ok).toBe(true)
    if (v.ok) expect(v.payload.operator_id).toBe('op-demo-1')
    expect(payload.jti).toBe('j1')
  })

  it('tampered-token-rejected → TOKEN_INVALID', () => {
    const { token } = issueToken('op-demo-1', SECRET, { jti: 'j1', now: T0 })
    const tampered = token.slice(0, -2) + (token.endsWith('aa') ? 'bb' : 'aa')
    const v = verifyToken(tampered, SECRET, { now: T0 })
    expect(v.ok).toBe(false)
    if (!v.ok) expect(v.denialReason).toBe('TOKEN_INVALID')
  })

  it('wrong-secret-rejected → TOKEN_INVALID', () => {
    const { token } = issueToken('op-demo-1', SECRET, { jti: 'j1', now: T0 })
    const v = verifyToken(token, 'different-secret', { now: T0 })
    expect(v.ok).toBe(false)
    if (!v.ok) expect(v.denialReason).toBe('TOKEN_INVALID')
  })

  it('expired-token-rejected → TOKEN_EXPIRED', () => {
    const { token } = issueToken('op-demo-1', SECRET, { jti: 'j1', now: T0 })
    const v = verifyToken(token, SECRET, { now: T0 + TOKEN_EXPIRY_MS + 1 })
    expect(v.ok).toBe(false)
    if (!v.ok) expect(v.denialReason).toBe('TOKEN_EXPIRED')
  })

  it('malformed-expiry-rejected → TOKEN_INVALID (a non-date expires_at is NOT immortal)', () => {
    // signed with the real secret but a non-date expiry — Date.parse → NaN must not pass as unexpired
    const token = signToken({ operator_id: 'op-demo-1', issued_at: '2026-05-30T09:00:00.000Z', expires_at: 'not-a-date', jti: 'j1' }, SECRET)
    const v = verifyToken(token, SECRET, { now: T0 })
    expect(v.ok).toBe(false)
    if (!v.ok) expect(v.denialReason).toBe('TOKEN_INVALID')
  })
})

describe('SessionStore jti revoke-on-reissue (03 OD-4)', () => {
  it('revoked-jti-rejected: re-login revokes the prior jti → JTI_REPLAYED on the old token', () => {
    const store = new SessionStore()
    const a = store.issue('op-demo-1', SECRET, { now: T0, jti: 'jti-A' })
    expect(store.isActive('jti-A')).toBe(true)
    const b = store.issue('op-demo-1', SECRET, { now: T0, jti: 'jti-B' }) // revokes jti-A
    expect(store.isActive('jti-A')).toBe(false)
    expect(store.isActive('jti-B')).toBe(true)
    // the old (stale) token is still cryptographically valid + unexpired, but its jti is revoked
    const old = resolveOperator(a.token, { sessionStore: store, secret: SECRET, now: T0 })
    expect(old.ok).toBe(false)
    if (!old.ok) expect(old.denialReason).toBe('JTI_REPLAYED')
    const fresh = resolveOperator(b.token, { sessionStore: store, secret: SECRET, now: T0 })
    expect(fresh.ok).toBe(true)
  })
})

describe('loginOperator (03 §3)', () => {
  it('issues a token for a known operator', () => {
    const store = new SessionStore()
    const r = loginOperator('op-demo-1', { sessionStore: store, secret: SECRET, now: T0 })
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.session_operator_id).toBe('op-demo-1')
      expect(resolveOperator(r.token, { sessionStore: store, secret: SECRET, now: T0 }).ok).toBe(true)
    }
  })

  it('rejects an unknown operator → UNKNOWN_OPERATOR', () => {
    const r = loginOperator('op-evil', { sessionStore: new SessionStore(), secret: SECRET, now: T0 })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.denialReason).toBe('UNKNOWN_OPERATOR')
  })

  it('degrades (no hardcoded fallback secret) when BOAI_SESSION_SECRET is unset → TOKEN_INVALID', () => {
    const r = loginOperator('op-demo-1', { sessionStore: new SessionStore(), secret: undefined, now: T0 })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.denialReason).toBe('TOKEN_INVALID')
  })
})

describe('resolveIdentity dual-ID (SD-1)', () => {
  function freshToken(): { store: SessionStore; token: string } {
    const store = new SessionStore()
    const { token } = store.issue('op-demo-1', SECRET, { now: T0, jti: 'j1' })
    return { store, token }
  }

  it('resolves session_operator_id (token) + effective_actor_id (body)', () => {
    const { store, token } = freshToken()
    const r = resolveIdentity(token, 'actor-inputter', ALLOWED, { sessionStore: store, secret: SECRET, now: T0 })
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.sessionOperatorId).toBe('op-demo-1')
      expect(r.effectiveActorId).toBe('actor-inputter')
    }
  })

  it('body-actorId-not-promoted-to-operator: body actorId sets only effective, never session_operator_id', () => {
    const { store, token } = freshToken()
    const asInputter = resolveIdentity(token, 'actor-inputter', ALLOWED, { sessionStore: store, secret: SECRET, now: T0 })
    const asChecker = resolveIdentity(token, 'actor-checker', ALLOWED, { sessionStore: store, secret: SECRET, now: T0 })
    expect(asInputter.ok && asChecker.ok).toBe(true)
    if (asInputter.ok && asChecker.ok) {
      expect(asInputter.sessionOperatorId).toBe('op-demo-1')
      expect(asChecker.sessionOperatorId).toBe('op-demo-1') // unchanged by body actorId
      expect(asInputter.effectiveActorId).toBe('actor-inputter')
      expect(asChecker.effectiveActorId).toBe('actor-checker')
    }
  })

  it('unknown-actor-rejected → UNKNOWN_ACTOR (governance actor passes layer-1 validation)', () => {
    const { store, token } = freshToken()
    const deps = { sessionStore: store, secret: SECRET, now: T0 }
    const evil = resolveIdentity(token, 'actor-evil', ALLOWED, deps)
    expect(evil.ok).toBe(false)
    if (!evil.ok) expect(evil.denialReason).toBe('UNKNOWN_ACTOR')
    // governance actorId is in allowed_actors (layer 1 passes; mutation reject is layer 2 = PR5)
    expect(resolveIdentity(token, 'actor-gov-legal', ALLOWED, deps).ok).toBe(true)
  })
})

describe('allowed_actors universe + app wiring', () => {
  it('loadAllowedActors returns the 5 seeded actors', () => {
    const db = migratedMemDb()
    seedRefData(db)
    // seedRefData inserts 2 operational; add the rest to make a representative 5
    db.exec(`INSERT INTO actors (id,name,role_id) VALUES
      ('actor-approver','業務責任者','business-approver'),
      ('actor-gov-legal','リーガル担当','governance'),
      ('actor-gov-compliance','コンプラ担当','governance')`)
    expect(loadAllowedActors(db).size).toBe(5)
    db.close()
  })

  it('createApp builds without throwing (session endpoints wired)', () => {
    const db = migratedMemDb()
    expect(() => createApp(db, { secret: SECRET })).not.toThrow()
    db.close()
  })
})
