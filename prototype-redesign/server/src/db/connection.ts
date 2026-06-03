import fs from 'node:fs'
import path from 'node:path'
import Database from 'better-sqlite3'

export type Db = Database.Database

/**
 * Open a better-sqlite3 connection with the contract-mandated PRAGMAs (08 §0):
 *   foreign_keys=ON (else ON DELETE RESTRICT is a no-op = 統制破り) / journal_mode=WAL / busy_timeout=5000.
 * Throws if the file/parent path is unusable (boot path turns this into a fatal exit; see index.ts).
 * For non-`:memory:` files the mode is tightened to owner-only 0600 (contract 01 §B-1 #6).
 */
export function openDb(dbPath: string): Db {
  const db = new Database(dbPath)
  db.pragma('foreign_keys = ON')
  db.pragma('journal_mode = WAL')
  db.pragma('busy_timeout = 5000')
  if (dbPath !== ':memory:') {
    tightenMode(dbPath)
    tightenMode(`${dbPath}-wal`)
    tightenMode(`${dbPath}-shm`)
  }
  return db
}

/** owner-only (0600) file mode where the file exists; platform-equivalent best effort. */
function tightenMode(file: string): void {
  try {
    if (fs.existsSync(file)) fs.chmodSync(file, 0o600)
  } catch {
    // chmod is best-effort on platforms without POSIX modes; the gate documents the equivalent assertion.
  }
}

/** Ensure the parent directory of a file-backed DB exists (no-op for `:memory:`). */
export function ensureDbDir(dbPath: string): void {
  if (dbPath === ':memory:') return
  fs.mkdirSync(path.dirname(dbPath), { recursive: true })
}
