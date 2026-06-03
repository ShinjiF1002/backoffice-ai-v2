import express from 'express'
import type { Express } from 'express'
import type { Db } from './db/connection.js'

/** Liveness probe logic (testable in-process without HTTP). */
export function healthCheck(db: Db): { ok: boolean; status: string } {
  const row = db.prepare('SELECT 1 AS ok').get() as { ok: number } | undefined
  return { ok: row?.ok === 1, status: 'healthy' }
}

/**
 * Express app factory (thin HTTP adapter). Domain/SoD/read logic lives in pure handler
 * functions (tested in-process); routes parse → call handler → map result to HTTP.
 * PR1 wires only GET /api/health; mutation/read routes arrive in PR5/PR6.
 */
export function createApp(db: Db): Express {
  const app = express()
  app.use(express.json())
  app.get('/api/health', (_req, res) => {
    res.json(healthCheck(db))
  })
  return app
}
