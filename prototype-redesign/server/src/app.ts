import express from 'express'
import type { Express, Request, Response } from 'express'
import { z } from 'zod'
import type { Db } from './db/connection.js'
import { loadConfig } from './config.js'
import { httpStatusFor, type DenialReason } from './denial.js'
import { SessionStore } from './identity/session.js'
import { loginOperator, resolveOperator, loadAllowedActors } from './identity/identity.js'
import { parseStrict } from './validation.js'
import { mountMutations } from './handlers/router.js'
import { mountReads } from './handlers/reads.js'
import { securityHeaders, errorSanitizer, makeRateLimiter } from './exposure.js'

/** Liveness probe logic (testable in-process without HTTP). */
export function healthCheck(db: Db): { ok: boolean; status: string } {
  const row = db.prepare('SELECT 1 AS ok').get() as { ok: number } | undefined
  return { ok: row?.ok === 1, status: 'healthy' }
}

const OperatorLoginSchema = z.object({ operatorId: z.string().min(1) }).strict()

export interface AppDeps {
  /** HMAC secret; default = config (env). Absent → token ops degrade to denial. */
  secret?: string | undefined
  sessionStore?: SessionStore
}

function sendDenial(res: Response, reason: DenialReason): void {
  res.status(httpStatusFor(reason)).json({ ok: false, denialReason: reason })
}

/**
 * Express app factory (thin HTTP adapter). Domain/SoD/read logic lives in pure handler functions
 * tested in-process; routes parse → call handler → map result to HTTP. PR4 wires the session
 * endpoints; mutation/read routes arrive in PR5/PR6.
 */
export function createApp(db: Db, deps: AppDeps = {}): Express {
  const secret = deps.secret ?? loadConfig().sessionSecret
  const sessionStore = deps.sessionStore ?? new SessionStore()

  const rateLimit = makeRateLimiter()

  const app = express()
  app.use(express.json())
  app.use(securityHeaders) // CSP + nosniff + referrer on every response

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json(healthCheck(db))
  })

  // operator login (issuer): demo operators are CODE CONSTANT; issues an X-Operator-Token.
  app.post('/api/session/operator', (req: Request, res: Response) => {
    const parsed = parseStrict(OperatorLoginSchema, req.body)
    if (!parsed.ok) {
      sendDenial(res, parsed.denialReason)
      return
    }
    const result = loginOperator(parsed.data.operatorId, { sessionStore, secret })
    if (!result.ok) {
      sendDenial(res, result.denialReason)
      return
    }
    res.json(result)
  })

  // current operator + allowed persona set.
  app.get('/api/session/current-actor', (req: Request, res: Response) => {
    const result = resolveOperator(req.header('X-Operator-Token'), { sessionStore, secret })
    if (!result.ok) {
      sendDenial(res, result.denialReason)
      return
    }
    res.json({
      ok: true,
      session_operator_id: result.sessionOperatorId,
      allowed_actors: [...loadAllowedActors(db)],
      expires_at: result.expiresAt,
    })
  })

  // 22 mutation endpoints (SoD / state / audit; governance-boundary gated + rate-limited).
  mountMutations(app, db, { sessionStore, secret, rateLimit })
  // read endpoints (business all-role + governance-only + IDOR-scoped).
  mountReads(app, db, { sessionStore, secret })

  app.use(errorSanitizer) // terminal handler: never leak stack/SQL (must be last)
  return app
}
