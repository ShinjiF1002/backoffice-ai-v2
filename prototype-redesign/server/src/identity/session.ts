import crypto from 'node:crypto'
import { issueToken, type TokenPayload } from './token.js'

/**
 * In-memory jti active-set (contract 03 OD-3/OD-4, SD-1): the minimal mechanism to make replay
 * reject falsifiable. A token is valid for its 30-min life across requests, but the same operator
 * re-logging-in revokes the prior jti (revoke-on-reissue). Volatile across process restart = demo OK.
 * No `session` / `operator` DB table (HMAC is stateless; operators are CODE CONSTANT).
 */
export class SessionStore {
  private readonly activeJtis = new Set<string>()
  private readonly jtiByOperator = new Map<string, string>()

  /** Issue a new token for an operator; revoke that operator's prior jti (revoke-on-reissue). */
  issue(operatorId: string, secret: string, opts: { now?: number; jti?: string } = {}): {
    token: string
    payload: TokenPayload
  } {
    const jti = opts.jti ?? crypto.randomUUID()
    const prior = this.jtiByOperator.get(operatorId)
    if (prior !== undefined) this.activeJtis.delete(prior)
    this.activeJtis.add(jti)
    this.jtiByOperator.set(operatorId, jti)
    return issueToken(operatorId, secret, { jti, now: opts.now })
  }

  isActive(jti: string): boolean {
    return this.activeJtis.has(jti)
  }
}
