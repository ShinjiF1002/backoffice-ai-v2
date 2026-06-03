import { describe, it, expect, afterEach } from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { openDb } from '../src/db/connection.js'

const created: string[] = []
function tmpDbPath(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'boai-pragma-'))
  const p = path.join(dir, 'test.sqlite')
  created.push(dir)
  return p
}
afterEach(() => {
  for (const dir of created.splice(0)) fs.rmSync(dir, { recursive: true, force: true })
})

// Connection-level PRAGMA smoke (contract 08 §0; prompt PR1 F2 bare-connection subset).
// PR2 re-runs the same PRAGMA read post-boot-apply, bundled with schema_migrations row check.
describe('db startup PRAGMAs', () => {
  it('sets foreign_keys=ON / journal_mode=WAL / busy_timeout=5000 on a file DB', () => {
    const db = openDb(tmpDbPath())
    expect(db.pragma('foreign_keys', { simple: true })).toBe(1)
    expect(db.pragma('journal_mode', { simple: true })).toBe('wal')
    expect(db.pragma('busy_timeout', { simple: true })).toBe(5000)
    db.close()
  })

  it('foreign_keys=ON actually enforces (parent-less child INSERT rejected)', () => {
    const db = openDb(tmpDbPath())
    db.exec(
      'CREATE TABLE parent (id TEXT PRIMARY KEY);' +
        'CREATE TABLE child (id TEXT PRIMARY KEY, pid TEXT REFERENCES parent(id) ON DELETE RESTRICT)',
    )
    expect(() => db.prepare("INSERT INTO child (id, pid) VALUES ('c1', 'missing')").run()).toThrow(
      /FOREIGN KEY/i,
    )
    db.close()
  })
})
