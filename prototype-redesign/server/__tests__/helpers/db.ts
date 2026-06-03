import { openDb, type Db } from '../../src/db/connection.js'
import { runMigrations } from '../../src/db/migrate-runner.js'
import { seedDemo } from '../../src/seed/seed.js'
import { resolveRole, type Ctx } from '../../src/handlers/shared.js'

/** A migrated in-memory DB with PRAGMAs (FK on) applied — the default fixture for server tests. */
export function migratedMemDb(): Db {
  const db = openDb(':memory:')
  runMigrations(db)
  return db
}

/** A migrated + fully seeded in-memory DB (parity fixture for mutation tests). */
export function seededDb(): Db {
  const db = migratedMemDb()
  seedDemo(db)
  return db
}

/** Build a mutation Ctx for a persona (role resolved from the seeded actors table). */
export function ctxFor(db: Db, effectiveActorId: string, sessionOperatorId = 'op-demo-1'): Ctx {
  const role = resolveRole(db, effectiveActorId)
  if (!role) throw new Error(`ctxFor: unknown actor ${effectiveActorId}`)
  return { sessionOperatorId, effectiveActorId, role }
}

/** Minimal reference rows so child-table tests have valid FK parents. */
export function seedRefData(db: Db): void {
  db.exec(`
    INSERT INTO roles (id, label) VALUES
      ('inputter','入力者'),('checker','承認者'),('business-approver','業務責任者'),('governance','ガバナンス担当者');
    INSERT INTO workflows (id, name, display_order) VALUES ('UC-BO-01','法人住所変更',1);
    INSERT INTO actors (id, name, role_id) VALUES
      ('actor-inputter','山田太郎','inputter'),('actor-checker','鈴木課長','checker');
  `)
}
