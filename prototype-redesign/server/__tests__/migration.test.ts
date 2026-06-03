import { describe, it, expect } from 'vitest'
import crypto from 'node:crypto'
import { openDb } from '../src/db/connection.js'
import {
  runMigrations,
  appliedVersions,
  listMigrations,
  listTables,
  REQUIRED_TABLES,
} from '../src/db/migrate-runner.js'

interface MigRow {
  version: number
  name: string
  applied_at: string
  checksum: string
}

describe('migration boot-apply (06 §契約1 / SD-3)', () => {
  it('applies 0001 on an empty DB and records schema_migrations', () => {
    const db = openDb(':memory:')
    expect(runMigrations(db)).toBe(1)
    const rows = db
      .prepare('SELECT version, name, applied_at, checksum FROM schema_migrations')
      .all() as MigRow[]
    expect(rows).toHaveLength(1)
    const row = rows[0]!
    expect(row.version).toBe(1)
    expect(row.name).toMatch(/^0001_/)
    expect(row.applied_at).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/) // tz-ISO demo clock
    expect(row.checksum).toMatch(/^[0-9a-f]{64}$/)
    db.close()
  })

  it('records checksum = sha256 of the migration file at apply time', () => {
    const db = openDb(':memory:')
    runMigrations(db)
    const mig = listMigrations()[0]!
    const expected = crypto.createHash('sha256').update(mig.sql).digest('hex')
    const stored = (db.prepare('SELECT checksum FROM schema_migrations WHERE version = 1').get() as {
      checksum: string
    }).checksum
    expect(stored).toBe(expected)
    db.close()
  })

  it('is idempotent: re-running applies 0 and does not duplicate', () => {
    const db = openDb(':memory:')
    runMigrations(db)
    expect(runMigrations(db)).toBe(0)
    expect(appliedVersions(db).size).toBe(1)
    db.close()
  })

  it('creates 21 tables (20 in 0001 + schema_migrations)', () => {
    const db = openDb(':memory:')
    runMigrations(db)
    const tables = listTables(db)
    expect(tables.length).toBe(21)
    for (const t of REQUIRED_TABLES) expect(tables).toContain(t)
    db.close()
  })

  it('PRAGMA + schema_migrations row smoke post-boot-apply (PR1 subset completion, F2)', () => {
    const db = openDb(':memory:')
    runMigrations(db)
    expect(db.pragma('foreign_keys', { simple: true })).toBe(1)
    const count = (db.prepare('SELECT COUNT(*) AS c FROM schema_migrations').get() as { c: number }).c
    expect(count).toBe(1)
    db.close()
  })
})
