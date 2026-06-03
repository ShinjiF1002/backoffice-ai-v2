import { describe, it, expect } from 'vitest'
import type { Request, Response } from 'express'
import { seededDb } from './helpers/db.js'
import { loadConfig } from '../src/config.js'
import { CSP, securityHeaders, errorSanitizer, makeRateLimiter } from '../src/exposure.js'
import { SessionStore } from '../src/identity/session.js'
import { dispatchMutation } from '../src/handlers/router.js'
import { ApproveCaseSchema } from '../src/handlers/schemas.js'
import * as cases from '../src/handlers/cases.js'

const SECRET = 'exposure-fixture-secret'
const T0 = Date.parse('2026-05-30T18:00:00+09:00')

function mockRes() {
  const headers: Record<string, string> = {}
  const state = { statusCode: 200, jsonBody: undefined as unknown, headersSent: false }
  const res = {
    setHeader: (k: string, v: string) => {
      headers[k] = v
    },
    status(c: number) {
      state.statusCode = c
      return this
    },
    json(b: unknown) {
      state.jsonBody = b
      return this
    },
    get headersSent() {
      return state.headersSent
    },
  }
  return { res: res as unknown as Response, headers, state }
}

describe('exposure: bind / CSP / headers (01 §B-1 #1,#4)', () => {
  it('default bind is loopback 127.0.0.1; public host only via explicit env', () => {
    expect(loadConfig({}).host).toBe('127.0.0.1')
    expect(loadConfig({ SERVER_HOST: '0.0.0.0' }).host).toBe('0.0.0.0')
  })

  it('CSP is the exact contract value, set with nosniff + referrer', () => {
    expect(CSP).toBe(
      "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'",
    )
    const { res, headers } = mockRes()
    let called = false
    securityHeaders({} as Request, res, () => {
      called = true
    })
    expect(headers['Content-Security-Policy']).toBe(CSP)
    expect(headers['X-Content-Type-Options']).toBe('nosniff')
    expect(headers['Referrer-Policy']).toBe('no-referrer')
    expect(called).toBe(true)
  })
})

describe('exposure: error sanitizer (01 §B-1 #3)', () => {
  it('never leaks a stack trace / SQL text to the client', () => {
    const { res, state } = mockRes()
    errorSanitizer(new Error('SQLITE_ERROR: no such column: secret_value near "DROP"'), {} as Request, res, () => {})
    expect(state.statusCode).toBe(500)
    expect(state.jsonBody).toEqual({ ok: false, error: 'internal error' })
    expect(JSON.stringify(state.jsonBody)).not.toMatch(/SQLITE|DROP|secret/)
  })
})

describe('exposure: rate limit (01 §B-1 #5)', () => {
  it('makeRateLimiter allows up to the limit then denies', () => {
    const limiter = makeRateLimiter({ limit: 2, now: () => T0 })
    expect(limiter('actor-x')).toBe(true)
    expect(limiter('actor-x')).toBe(true)
    expect(limiter('actor-x')).toBe(false) // 3rd over the limit
    expect(limiter('actor-y')).toBe(true) // independent key
  })

  it('mutation dispatch returns RATE_LIMITED 429 once over the limit (reads unaffected)', () => {
    const db = seededDb()
    const store = new SessionStore()
    const { token } = store.issue('op-demo-1', SECRET, { now: T0, jti: 'j1' })
    const deps = { sessionStore: store, secret: SECRET, now: T0, rateLimit: makeRateLimiter({ limit: 1, now: () => T0 }) }
    const approve = (id: string) =>
      dispatchMutation(db, deps, { token, body: { actorId: 'actor-inputter', by: 'input' }, params: { id } }, ApproveCaseSchema, (d, c, i, p) =>
        cases.approveCase(d, c, { ...i, id: p.id! }),
      )
    expect(approve('CASE-2026-0139').status).toBe(200)
    const over = approve('CASE-2026-0202')
    expect(over.status).toBe(429)
    expect((over.body as { denialReason: string }).denialReason).toBe('RATE_LIMITED')
    db.close()
  })
})
