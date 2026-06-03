import { describe, it, expect } from 'vitest'
import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { issueToken } from '../src/identity/token.js'
import { toLogPayload, LOG_ALLOWLIST } from '../src/log.js'

const SECRET = 'super-secret-fixture-value-do-not-leak-7b21'
const CLIENT_SRC = path.resolve(import.meta.dirname, '..', '..', 'src') // prototype-redesign/src

// Contract 01 §B-1 #7/#8: secret never reaches the client; logs are allowlisted.
describe('exposure: secret + log allowlist', () => {
  it('secret-not-in-token: the issued token never contains the raw secret (HMAC is one-way)', () => {
    const { token } = issueToken('op-demo-1', SECRET, { jti: 'j1', now: Date.parse('2026-05-30T18:00:00+09:00') })
    expect(token.includes(SECRET)).toBe(false)
    // and the secret is not recoverable from the decoded payload body
    const body = Buffer.from(token.split('.')[0]!, 'base64url').toString('utf8')
    expect(body.includes(SECRET)).toBe(false)
  })

  it('log allowlist: non-allowlisted fields (token/secret/customer value) are dropped', () => {
    const payload = toLogPayload({
      session_operator_id: 'op-demo-1',
      effective_actor_id: 'actor-inputter',
      action: 'case/approve',
      result: 'deny',
      denialReason: 'SELF_APPROVAL',
      // these MUST NOT appear in the emitted log
      token: 'X-Operator-Token-value',
      secret: SECRET,
      customerName: '佐藤花子',
      before_json: '{"full":"row"}',
    })
    // all 5 allowlisted fields were supplied → exactly those keys survive; nothing else
    expect(Object.keys(payload).sort()).toEqual([...LOG_ALLOWLIST].sort())
    const serialized = JSON.stringify(payload)
    expect(serialized.includes(SECRET)).toBe(false)
    expect(serialized.includes('X-Operator-Token-value')).toBe(false)
    expect(serialized.includes('佐藤花子')).toBe(false)
    expect(serialized.includes('full')).toBe(false)
  })

  it('secret-not-in-bundle: BOAI_SESSION_SECRET is never referenced in client src (server-only env)', () => {
    let hits = ''
    try {
      hits = execFileSync('grep', ['-rl', 'BOAI_SESSION_SECRET', CLIENT_SRC], { stdio: 'pipe' }).toString()
    } catch {
      hits = '' // grep exits non-zero when there are no matches
    }
    expect(hits.trim()).toBe('')
  })
})
