import { loadConfig } from './config.js'
import { openDb, ensureDbDir } from './db/connection.js'
import { runMigrations } from './db/migrate-runner.js'

// CLI: `npm run server:migrate` (tsx). Forward-only boot-apply of pending migrations.
const config = loadConfig()
ensureDbDir(config.dbPath)
const db = openDb(config.dbPath)
const applied = runMigrations(db)
console.log(`[migrate] applied ${applied} migration(s); DB at ${config.dbPath}`)
db.close()
