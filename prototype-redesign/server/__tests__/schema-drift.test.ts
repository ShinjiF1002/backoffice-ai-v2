import { describe, it, expect } from 'vitest'
import { migratedMemDb } from './helpers/db.js'
import { checkSchemaDrift, REQUIRED_TABLES } from '../src/db/migrate-runner.js'

// Contract 08 (f) / 06 OPEN-DB-3: drift = missing required table OR version behind latest.
describe('schema drift detection', () => {
  it('reports ok on a freshly migrated DB (all 21 tables, version current)', () => {
    const db = migratedMemDb()
    const drift = checkSchemaDrift(db)
    expect(drift.ok).toBe(true)
    expect(drift.missingTables).toEqual([])
    expect(drift.dbVersion).toBe(drift.expectedVersion)
    expect(drift.expectedVersion).toBe(1)
    db.close()
  })

  it('detects a missing required table (simulated corruption)', () => {
    const db = migratedMemDb()
    // drop a leaf table (no inbound FK) to simulate a corrupt/partial DB
    db.exec('DROP TABLE drift_monitors')
    const drift = checkSchemaDrift(db)
    expect(drift.ok).toBe(false)
    expect(drift.missingTables).toContain('drift_monitors')
    db.close()
  })

  it('REQUIRED_TABLES has 21 entries', () => {
    expect(REQUIRED_TABLES.length).toBe(21)
  })
})
