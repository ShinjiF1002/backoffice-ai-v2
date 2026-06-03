import type { Request, Response, NextFunction } from 'express'

/**
 * Exact CSP (contract 01 §B-1 #4). style-src allows 'unsafe-inline' because live V2 uses dynamic
 * inline style={{...}} (e.g. trend bars). Asserted by value-equality, not presence.
 */
export const CSP =
  "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'"

/** Minimal security headers on every response (01 §B-1 #4). */
export function securityHeaders(_req: Request, res: Response, next: NextFunction): void {
  res.setHeader('Content-Security-Policy', CSP)
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('Referrer-Policy', 'no-referrer')
  next()
}

/**
 * Fixed-window in-memory rate limiter (01 §B-1 #5): 60 req/min per key (default). Applied to the
 * SoD/execute mutation set only; reads are unlimited. Returns true when the request is allowed.
 */
export function makeRateLimiter(opts: { limit?: number; windowMs?: number; now?: () => number } = {}): (key: string) => boolean {
  const limit = opts.limit ?? 60
  const windowMs = opts.windowMs ?? 60_000
  const clock = opts.now ?? Date.now
  const buckets = new Map<string, { count: number; resetAt: number }>()
  return (key: string): boolean => {
    const t = clock()
    const bucket = buckets.get(key)
    if (!bucket || t >= bucket.resetAt) {
      buckets.set(key, { count: 1, resetAt: t + windowMs })
      return true
    }
    if (bucket.count >= limit) return false
    bucket.count += 1
    return true
  }
}

/**
 * Terminal error handler (01 §B-1 #3): never leak a stack trace, SQL text, or better-sqlite3 error
 * to the client — return a safe message only. Internal detail goes to the server log.
 */
export function errorSanitizer(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  console.error('[error]', err instanceof Error ? err.message : String(err))
  if (res.headersSent) return
  res.status(500).json({ ok: false, error: 'internal error' })
}
