import { loadConfig } from './config.js'
import { openDb, ensureDbDir, type Db } from './db/connection.js'
import { runMigrations } from './db/migrate-runner.js'
import { createApp } from './app.js'

/** Boot entrypoint (`server:dev` via tsx). DB-open failure is fatal (contract 01 §B-1 / observability). */
function main(): void {
  const config = loadConfig()
  let db: Db
  try {
    ensureDbDir(config.dbPath)
    db = openDb(config.dbPath)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error(`[boot] fatal: cannot open DB at ${config.dbPath}: ${msg}`)
    process.exit(1)
  }
  runMigrations(db)
  const app = createApp(db)
  app.listen(config.port, config.host, () => {
    console.log(`[boot] server listening on http://${config.host}:${config.port} (DB: ${config.dbPath})`)
  })
}

main()
