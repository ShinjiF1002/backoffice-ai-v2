import { describe, it, expect } from 'vitest'
import Database from 'better-sqlite3'
import { healthCheck } from '../src/app.js'

// In-process handler invocation (no HTTP server; contract 05 OD-5 / 09 D5).
describe('health check', () => {
  it('returns ok:true against a live DB', () => {
    const db = new Database(':memory:')
    expect(healthCheck(db)).toEqual({ ok: true, status: 'healthy' })
    db.close()
  })
})
