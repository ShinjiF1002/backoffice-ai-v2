import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import type { Db } from './connection.js'
import { DEMO_NOW_ISO } from '../constants.js'

/** Default migrations directory (contract 07 §1, prompt PR2: server/src/schema/migrations). */
export const MIGRATIONS_DIR = path.join(import.meta.dirname, '..', 'schema', 'migrations')

/**
 * schema_migrations ledger (SD-3 / contract 06 §契約1 / 08 #20).
 * forward-only; checksum is the sha256 of the migration file computed AT APPLY TIME.
 */
const SCHEMA_MIGRATIONS_DDL = `CREATE TABLE IF NOT EXISTS schema_migrations (
  version    INTEGER PRIMARY KEY,
  name       TEXT NOT NULL,
  applied_at TEXT NOT NULL,
  checksum   TEXT NOT NULL
);`

export interface MigrationFile {
  version: number
  name: string
  path: string
  sql: string
}

/** List `NNNN_*.sql` migrations in ascending version order. Missing dir → []. */
export function listMigrations(dir: string = MIGRATIONS_DIR): MigrationFile[] {
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.sql'))
    .sort()
    .map((f) => {
      const m = /^(\d+)_/.exec(f)
      if (!m) throw new Error(`migration file must be named NNNN_*.sql: ${f}`)
      const filePath = path.join(dir, f)
      return { version: Number(m[1]), name: f, path: filePath, sql: fs.readFileSync(filePath, 'utf8') }
    })
}

/** Ensure the ledger table exists, return the set of already-applied versions. */
export function appliedVersions(db: Db): Set<number> {
  db.exec(SCHEMA_MIGRATIONS_DDL)
  const rows = db.prepare('SELECT version FROM schema_migrations').all() as { version: number }[]
  return new Set(rows.map((r) => r.version))
}

/**
 * Forward-only boot-apply: apply each unapplied migration (version not in the ledger) in
 * ascending order, each inside one transaction (DDL/DML + ledger INSERT atomic; contract 06 §契約1).
 * Returns the number of migrations applied this run. Re-running is idempotent (already-applied skip).
 */
export function runMigrations(db: Db, opts: { dir?: string; appliedAt?: string } = {}): number {
  const dir = opts.dir ?? MIGRATIONS_DIR
  const applied = appliedVersions(db)
  const pending = listMigrations(dir).filter((m) => !applied.has(m.version))
  const appliedAt = opts.appliedAt ?? DEMO_NOW_ISO
  let count = 0
  for (const mig of pending) {
    const checksum = crypto.createHash('sha256').update(mig.sql).digest('hex')
    const apply = db.transaction(() => {
      db.exec(mig.sql)
      db.prepare(
        'INSERT INTO schema_migrations (version, name, applied_at, checksum) VALUES (?, ?, ?, ?)',
      ).run(mig.version, mig.name, appliedAt, checksum)
    })
    apply()
    count += 1
  }
  return count
}
