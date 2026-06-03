import { describe, it, expect } from 'vitest'
import { migratedMemDb, seedRefData } from './helpers/db.js'

// Contract 08 (a): enum CHECK rejects invalid values; FK ON DELETE RESTRICT enforced (08 §0).
describe('schema constraints', () => {
  it('rejects an invalid roles.id enum value (CHECK)', () => {
    const db = migratedMemDb()
    expect(() => db.prepare("INSERT INTO roles (id, label) VALUES ('bogus', 'x')").run()).toThrow(
      /CHECK/i,
    )
    db.close()
  })

  it('rejects an invalid cases.status enum value (CHECK)', () => {
    const db = migratedMemDb()
    seedRefData(db)
    expect(() =>
      db
        .prepare(
          "INSERT INTO cases (id, workflow_id, status, flags, origin, received_at) VALUES ('C1','UC-BO-01','bogus',0,'ai','2026-05-30T18:00:00+09:00')",
        )
        .run(),
    ).toThrow(/CHECK/i)
    db.close()
  })

  it('rejects an invalid audit_events.session_operator_id (CHECK on operator vocab)', () => {
    const db = migratedMemDb()
    seedRefData(db)
    expect(() =>
      db
        .prepare(
          `INSERT INTO audit_events (seq, entity_type, entity_id, actor_id, session_operator_id, action, occurred_at)
           VALUES (1,'case','C1','actor-inputter','op-demo-9','x','2026-05-30T18:00:00+09:00')`,
        )
        .run(),
    ).toThrow(/CHECK/i)
    db.close()
  })

  it('enforces FK RESTRICT (case_fields with non-existent case_id rejected)', () => {
    const db = migratedMemDb()
    expect(() =>
      db
        .prepare(
          "INSERT INTO case_fields (case_id, field_label, reconcile_state) VALUES ('NOPE','住所','matched')",
        )
        .run(),
    ).toThrow(/FOREIGN KEY/i)
    db.close()
  })

  it('enforces the reversal paired-null CHECK (kind without reason rejected)', () => {
    const db = migratedMemDb()
    seedRefData(db)
    expect(() =>
      db
        .prepare(
          "INSERT INTO cases (id, workflow_id, status, flags, origin, reversal_kind, received_at) VALUES ('C2','UC-BO-01','reflected',0,'ai','訂正','2026-05-30T18:00:00+09:00')",
        )
        .run(),
    ).toThrow(/CHECK/i)
    db.close()
  })
})
