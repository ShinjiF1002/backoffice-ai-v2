import fs from 'node:fs'
import type { ServerConfig } from '../config.js'
import { openDb, ensureDbDir } from './connection.js'
import { runMigrations } from './migrate-runner.js'
import { seedDemo } from '../seed/seed.js'

export interface ResetResult {
  ok: boolean
  reason?: string
  migrationsApplied?: number
}

/**
 * Destructive demo reset (contract 09 §4 / 06 §契約3): drop the DB file and re-create it by
 * re-applying all migrations (+ re-seed, wired in PR3). Gated behind `DEMO_RESET_ENABLED`:
 * when disabled it performs ZERO writes and returns `{ ok:false }` (the CLI maps that to a
 * non-zero exit — never a silent no-op success). Recreating the DB means `audit_events` starts
 * EMPTY (no reset marker row); the reset never DELETEs audit rows through a trigger.
 */
export function resetDemo(config: ServerConfig): ResetResult {
  if (!config.resetEnabled) {
    return { ok: false, reason: 'DEMO_RESET_ENABLED is not set (refusing destructive reset; 0 writes)' }
  }
  if (config.dbPath === ':memory:') {
    const db = openDb(':memory:')
    const migrationsApplied = runMigrations(db)
    seedDemo(db)
    db.close()
    return { ok: true, migrationsApplied }
  }
  // ATOMIC (06 §契約3 "失敗時は中間状態を残さない"): build a fresh DB in a sibling temp file, then
  // swap. If migrate/seed throws, the live DB is untouched — no partial state on the serving path.
  const tmp = `${config.dbPath}.rebuild`
  for (const suffix of ['', '-wal', '-shm']) {
    const f = `${tmp}${suffix}`
    if (fs.existsSync(f)) fs.rmSync(f)
  }
  ensureDbDir(config.dbPath)
  const db = openDb(tmp)
  const migrationsApplied = runMigrations(db)
  seedDemo(db) // recreate = migrate + re-seed (audit_events starts empty; no trigger-DELETE)
  db.close() // checkpoint WAL into the temp main file
  // swap: remove the old DB only now that the new one is fully built, then rename in
  for (const suffix of ['', '-wal', '-shm']) {
    const f = `${config.dbPath}${suffix}`
    if (fs.existsSync(f)) fs.rmSync(f)
  }
  fs.renameSync(tmp, config.dbPath)
  for (const suffix of ['-wal', '-shm']) {
    const f = `${tmp}${suffix}`
    if (fs.existsSync(f)) fs.renameSync(f, `${config.dbPath}${suffix}`)
  }
  return { ok: true, migrationsApplied }
}
