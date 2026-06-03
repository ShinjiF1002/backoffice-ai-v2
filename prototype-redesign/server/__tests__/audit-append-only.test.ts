import { describe, it, expect } from 'vitest'
import { migratedMemDb, seedRefData } from './helpers/db.js'
import type { Db } from '../src/db/connection.js'

function insertAuditRow(db: Db, seq: number): void {
  db.prepare(
    `INSERT INTO audit_events
       (seq, entity_type, entity_id, case_id, actor_id, session_operator_id, action, occurred_at, before_json, after_json)
     VALUES (?, 'case', 'CASE-X', NULL, 'actor-inputter', 'op-demo-1', '入力者承認', '2026-05-30T18:00:00+09:00', NULL, NULL)`,
  ).run(seq)
}

// Contract 08 (b) / 09 §3 / 06 §契約4: audit_events is DB-level append-only.
describe('audit_events append-only (DB triggers)', () => {
  it('UPDATE of an existing row is rejected by trigger (RAISE ABORT)', () => {
    const db = migratedMemDb()
    seedRefData(db)
    insertAuditRow(db, 1)
    expect(() => db.prepare("UPDATE audit_events SET action = 'tamper' WHERE seq = 1").run()).toThrow(
      /immutable/i,
    )
    db.close()
  })

  it('DELETE of an existing row is rejected by trigger (RAISE ABORT)', () => {
    const db = migratedMemDb()
    seedRefData(db)
    insertAuditRow(db, 1)
    expect(() => db.prepare('DELETE FROM audit_events WHERE seq = 1').run()).toThrow(/immutable/i)
    db.close()
  })

  it('seq is UNIQUE (duplicate seq INSERT rejected)', () => {
    const db = migratedMemDb()
    seedRefData(db)
    insertAuditRow(db, 1)
    expect(() => insertAuditRow(db, 1)).toThrow(/UNIQUE/i)
    db.close()
  })

  it('INSERT (append) is allowed', () => {
    const db = migratedMemDb()
    seedRefData(db)
    insertAuditRow(db, 1)
    insertAuditRow(db, 2)
    const count = (db.prepare('SELECT COUNT(*) AS c FROM audit_events').get() as { c: number }).c
    expect(count).toBe(2)
    db.close()
  })
})
