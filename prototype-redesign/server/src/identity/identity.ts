import type { Db } from '../db/connection.js'
import { OPERATORS } from '../constants.js'
import { type DenialReason } from '../denial.js'
import { verifyToken } from './token.js'
import { SessionStore } from './session.js'

export interface IdentityDeps {
  sessionStore: SessionStore
  /** server HMAC secret (BOAI_SESSION_SECRET). Absent → all token ops degrade to TOKEN_INVALID. */
  secret: string | undefined
  now?: number
}

/** allowed_actors = every seeded actor id (3 operational + ≥2 governance = 5; contract 03 §3). */
export function loadAllowedActors(db: Db): Set<string> {
  const rows = db.prepare('SELECT id FROM actors').all() as { id: string }[]
  return new Set(rows.map((r) => r.id))
}

export type OperatorResult =
  | { ok: true; sessionOperatorId: string; expiresAt: string }
  | { ok: false; denialReason: Extract<DenialReason, 'TOKEN_INVALID' | 'TOKEN_EXPIRED' | 'JTI_REPLAYED'> }

/** Resolve the real operator from `X-Operator-Token`: verify HMAC + expiry + jti active-set. */
export function resolveOperator(token: string | undefined, deps: IdentityDeps): OperatorResult {
  if (!deps.secret || !token) return { ok: false, denialReason: 'TOKEN_INVALID' }
  const verified = verifyToken(token, deps.secret, { now: deps.now })
  if (!verified.ok) return { ok: false, denialReason: verified.denialReason }
  if (!deps.sessionStore.isActive(verified.payload.jti)) return { ok: false, denialReason: 'JTI_REPLAYED' }
  return { ok: true, sessionOperatorId: verified.payload.operator_id, expiresAt: verified.payload.expires_at }
}

export type IdentityResult =
  | { ok: true; sessionOperatorId: string; effectiveActorId: string; expiresAt: string }
  | { ok: false; denialReason: DenialReason }

/**
 * Dual-identity resolution for a write request (SD-1): `session_operator_id` from the verified
 * token (NEVER from the body), `effective_actor_id` from `body.actorId` validated against
 * `allowed_actors`. The body actorId sets only effective_actor_id; it cannot touch operator id.
 */
export function resolveIdentity(
  token: string | undefined,
  bodyActorId: string | undefined,
  allowedActors: Set<string>,
  deps: IdentityDeps,
): IdentityResult {
  const op = resolveOperator(token, deps)
  if (!op.ok) return op
  if (bodyActorId === undefined || !allowedActors.has(bodyActorId))
    return { ok: false, denialReason: 'UNKNOWN_ACTOR' }
  return {
    ok: true,
    sessionOperatorId: op.sessionOperatorId,
    effectiveActorId: bodyActorId,
    expiresAt: op.expiresAt,
  }
}

export type LoginResult =
  | { ok: true; token: string; session_operator_id: string; expires_at: string }
  | { ok: false; denialReason: Extract<DenialReason, 'UNKNOWN_OPERATOR' | 'TOKEN_INVALID'> }

/** Operator login (`POST /api/session/operator`): demo operators are CODE CONSTANT (OPERATORS). */
export function loginOperator(
  operatorId: string,
  deps: Pick<IdentityDeps, 'sessionStore' | 'secret' | 'now'>,
): LoginResult {
  if (!deps.secret) return { ok: false, denialReason: 'TOKEN_INVALID' } // degrade: cannot sign without secret
  if (!(OPERATORS as readonly string[]).includes(operatorId))
    return { ok: false, denialReason: 'UNKNOWN_OPERATOR' }
  const { token, payload } = deps.sessionStore.issue(operatorId, deps.secret, { now: deps.now })
  return { ok: true, token, session_operator_id: payload.operator_id, expires_at: payload.expires_at }
}
