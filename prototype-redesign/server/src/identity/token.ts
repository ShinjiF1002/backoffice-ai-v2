import crypto from 'node:crypto'
import type { DenialReason } from '../denial.js'

/** Signed-token payload (contract 03 §1, SD-1). HMAC-SHA256 over the base64url body. */
export interface TokenPayload {
  operator_id: string
  issued_at: string
  expires_at: string
  jti: string
}

export const TOKEN_EXPIRY_MS = 30 * 60 * 1000 // 30 min short expiry

const b64url = (buf: Buffer): string => buf.toString('base64url')

function hmac(body: string, secret: string): string {
  return b64url(crypto.createHmac('sha256', secret).update(body).digest())
}

/** token = base64url(JSON payload) . base64url(HMAC-SHA256(body, secret)). */
export function signToken(payload: TokenPayload, secret: string): string {
  const body = b64url(Buffer.from(JSON.stringify(payload), 'utf8'))
  return `${body}.${hmac(body, secret)}`
}

export function issueToken(
  operatorId: string,
  secret: string,
  opts: { jti: string; now?: number },
): { token: string; payload: TokenPayload } {
  const now = opts.now ?? Date.now()
  const payload: TokenPayload = {
    operator_id: operatorId,
    issued_at: new Date(now).toISOString(),
    expires_at: new Date(now + TOKEN_EXPIRY_MS).toISOString(),
    jti: opts.jti,
  }
  return { token: signToken(payload, secret), payload }
}

export type VerifyResult =
  | { ok: true; payload: TokenPayload }
  | { ok: false; denialReason: Extract<DenialReason, 'TOKEN_INVALID' | 'TOKEN_EXPIRED'> }

/**
 * Stateless verification (contract 03 §1): re-HMAC with the secret + constant-time compare, then
 * compare payload.expires_at to now. No DB lookup. jti-replay is checked separately by the SessionStore.
 */
export function verifyToken(token: string, secret: string, opts: { now?: number } = {}): VerifyResult {
  const now = opts.now ?? Date.now()
  const parts = token.split('.')
  if (parts.length !== 2) return { ok: false, denialReason: 'TOKEN_INVALID' }
  const body = parts[0]!
  const mac = parts[1]!
  const expected = hmac(body, secret)
  const macBuf = Buffer.from(mac)
  const expBuf = Buffer.from(expected)
  if (macBuf.length !== expBuf.length || !crypto.timingSafeEqual(macBuf, expBuf))
    return { ok: false, denialReason: 'TOKEN_INVALID' }
  let payload: TokenPayload
  try {
    payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as TokenPayload
  } catch {
    return { ok: false, denialReason: 'TOKEN_INVALID' }
  }
  if (
    typeof payload.operator_id !== 'string' ||
    typeof payload.jti !== 'string' ||
    typeof payload.issued_at !== 'string' ||
    typeof payload.expires_at !== 'string'
  )
    return { ok: false, denialReason: 'TOKEN_INVALID' }
  const expMs = Date.parse(payload.expires_at)
  if (!Number.isFinite(expMs)) return { ok: false, denialReason: 'TOKEN_INVALID' } // malformed expiry ≠ never-expires
  if (expMs <= now) return { ok: false, denialReason: 'TOKEN_EXPIRED' }
  return { ok: true, payload }
}
