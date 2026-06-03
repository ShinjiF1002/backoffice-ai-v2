import { describe, it, expect, afterEach } from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { migratedMemDb } from './helpers/db.js'
import { openDb } from '../src/db/connection.js'
import { runMigrations } from '../src/db/migrate-runner.js'
import { resetDemo } from '../src/db/reset.js'
import { loadConfig } from '../src/config.js'
import { seedDemo, loadSeedData } from '../src/seed/seed.js'
import { validateSeed } from '../src/seed/validate.js'

const tmp: string[] = []
afterEach(() => {
  for (const d of tmp.splice(0)) fs.rmSync(d, { recursive: true, force: true })
})
const countOf = (db: ReturnType<typeof migratedMemDb>, t: string): number =>
  (db.prepare(`SELECT COUNT(*) AS c FROM ${t}`).get() as { c: number }).c

describe('seed + seed:validate (PR3 parity gate)', () => {
  it('seed:validate passes (errors empty) on a migrated + seeded DB', () => {
    const db = migratedMemDb()
    seedDemo(db)
    const { ok, errors } = validateSeed(db)
    expect(errors).toEqual([])
    expect(ok).toBe(true)
    db.close()
  })

  it('seed is idempotent — re-run is a no-op, no duplicate rows', () => {
    const db = migratedMemDb()
    expect(seedDemo(db).seeded).toBe(true)
    const before = countOf(db, 'cases')
    expect(seedDemo(db).seeded).toBe(false)
    expect(countOf(db, 'cases')).toBe(before)
    db.close()
  })

  it('seeds source-derived cardinalities (counts == seed-data array lengths, no literals)', () => {
    const db = migratedMemDb()
    seedDemo(db)
    const data = loadSeedData()
    expect(countOf(db, 'cases')).toBe(data.cases.length)
    expect(countOf(db, 'case_fields')).toBe(data.case_fields.length)
    expect(countOf(db, 'proposals')).toBe(data.proposals.length)
    expect(countOf(db, 'agent_samples')).toBe(data.agent_samples.length)
    expect(countOf(db, 'proposal_source_cases')).toBe(data.proposal_source_cases.length)
    expect(countOf(db, 'historical_cases')).toBe(data.historical_cases.length)
    expect(countOf(db, 'escalations')).toBe(data.escalations.length)
    expect(countOf(db, 'synthetic_metric_rows')).toBe(data.synthetic_metric_rows.length)
    expect(countOf(db, 'audit_events')).toBe(0)
    db.close()
  })

  it('UC-BO-02 AI 入力承認率 denominator pins 980', () => {
    const db = migratedMemDb()
    seedDemo(db)
    const row = db
      .prepare("SELECT denominator FROM synthetic_metric_rows WHERE workflow_id='UC-BO-02' AND metric_label='AI 入力承認率'")
      .get() as { denominator: string }
    expect(row.denominator).toContain('980')
    db.close()
  })

  it('reset-recreates-db-not-deletes-rows: reset rebuilds the DB (append-only trigger never blocks it)', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'boai-reset-'))
    tmp.push(dir)
    const dbPath = path.join(dir, 'demo.sqlite')
    const config = loadConfig({ DB_PATH: dbPath, DEMO_RESET_ENABLED: 'true' })

    // build once + append a real audit row (so audit_events is non-empty before reset)
    {
      const db = openDb(dbPath)
      runMigrations(db)
      seedDemo(db)
      db.prepare(
        `INSERT INTO audit_events (seq,entity_type,entity_id,actor_id,session_operator_id,action,occurred_at)
         VALUES (1,'case','CASE-2026-0142','actor-inputter','op-demo-1','入力者承認','2026-05-30T18:00:00+09:00')`,
      ).run()
      expect(countOf(db, 'audit_events')).toBe(1)
      db.close()
    }

    // reset must SUCCEED — it drops+recreates the file (a DELETE would be blocked by the append-only trigger)
    expect(resetDemo(config).ok).toBe(true)

    const db2 = openDb(dbPath)
    expect(countOf(db2, 'audit_events')).toBe(0) // empty: recreated, NOT trigger-deleted
    expect(countOf(db2, 'cases')).toBe(loadSeedData().cases.length) // re-seeded
    db2.close()
    // atomic swap leaves no .bak / .rebuild residue
    expect(fs.existsSync(`${dbPath}.bak`)).toBe(false)
    expect(fs.existsSync(`${dbPath}.rebuild`)).toBe(false)
  })

  it('detects an injected parity violation (negative control)', () => {
    const db = migratedMemDb()
    seedDemo(db)
    // corrupt the universe: a source_case pointing at a non-existent case must be caught
    db.prepare(
      "INSERT INTO proposal_source_cases (proposal_id,case_id,field,comment,observed_date) VALUES ('PROP-2026-031','CASE-NOPE','x','y','2026-05-01')",
    ).run()
    const { ok, errors } = validateSeed(db)
    expect(ok).toBe(false)
    expect(errors.some((e) => e.includes('CASE-NOPE'))).toBe(true)
    db.close()
  })

  it('seed:validate negative controls: missing demo_clock row + duplicate actor names', () => {
    const db = migratedMemDb()
    seedDemo(db)
    db.prepare('DELETE FROM demo_clock').run()
    expect(validateSeed(db).errors.some((e) => e.includes('demo_clock'))).toBe(true)
    db.close()
    const db2 = migratedMemDb()
    seedDemo(db2)
    db2.prepare("UPDATE actors SET name = '山田太郎' WHERE id = 'actor-checker'").run() // collide display names
    expect(validateSeed(db2).errors.some((e) => e.toLowerCase().includes('unique'))).toBe(true)
    db2.close()
  })
})
