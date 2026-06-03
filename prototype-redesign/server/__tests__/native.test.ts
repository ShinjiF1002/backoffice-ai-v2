import { describe, it, expect } from 'vitest'
import Database from 'better-sqlite3'

// First smoke (contract 07 §3 / §4 NATIVE-VERIFY): the native module is built and loadable.
describe('better-sqlite3 native build', () => {
  it('opens :memory: and executes DDL without throwing', () => {
    const db = new Database(':memory:')
    expect(() => db.exec('CREATE TABLE t (x INTEGER)')).not.toThrow()
    db.close()
  })
})
