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
  db.pragma('wal_checkpoint(TRUNCATE)') // flush WAL into the temp main file so it is self-contained
  db.close()

  // Failure-atomic swap (06 §契約3 "失敗時は中間状態を残さない"): move the live DB aside to .bak,
  // move the new DB in, and on any failure restore .bak — the serving path is never left absent
  // without a recoverable backup.
  const SIDECARS = ['', '-wal', '-shm'] as const
  const moveSet = (from: string, to: string): void => {
    for (const s of SIDECARS) {
      const f = `${from}${s}`
      if (fs.existsSync(f)) fs.renameSync(f, `${to}${s}`)
    }
  }
  const rmSet = (p: string): void => {
    for (const s of SIDECARS) {
      const f = `${p}${s}`
      if (fs.existsSync(f)) fs.rmSync(f)
    }
  }
  const bak = `${config.dbPath}.bak`
  rmSet(bak)
  const hadLive = fs.existsSync(config.dbPath)
  if (hadLive) moveSet(config.dbPath, bak)
  try {
    moveSet(tmp, config.dbPath)
  } catch (err) {
    rmSet(config.dbPath)
    if (hadLive) moveSet(bak, config.dbPath) // restore the previous DB on swap failure
    throw err
  }
  rmSet(bak)
  return { ok: true, migrationsApplied }
}
