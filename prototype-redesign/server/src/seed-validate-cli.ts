import { openDb } from './db/connection.js'
import { runMigrations } from './db/migrate-runner.js'
import { seedDemo } from './seed/seed.js'
import { validateSeed } from './seed/validate.js'

// CLI: `npm run seed:validate`. Builds a fresh in-memory DB (migrate + seed) and validates parity.
const db = openDb(':memory:')
runMigrations(db)
seedDemo(db)
const { ok, errors } = validateSeed(db)
db.close()
if (!ok) {
  console.error(`[seed:validate] FAIL (${errors.length}):`)
  for (const e of errors) console.error(`  - ${e}`)
  process.exit(1)
}
console.log('[seed:validate] OK — seed parity + integrity verified')
