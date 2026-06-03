/**
 * Canonical denial vocabulary (SD-4). The `denialReason` enum is the machine-readable truth;
 * tests assert the enum, not bare HTTP codes. Default HTTP = 403; token authn = 401; IDOR
 * existence-hiding = 404; rate limit = 429.
 */
export type DenialReason =
  // authn (token) — HTTP 401
  | 'TOKEN_INVALID'
  | 'TOKEN_EXPIRED'
  | 'JTI_REPLAYED'
  // identity / input validation — HTTP 403
  | 'UNKNOWN_OPERATOR'
  | 'UNKNOWN_ACTOR'
  | 'UNKNOWN_FIELD'
  | 'VALIDATION'
  // SoD / authorization — HTTP 403
  | 'SELF_APPROVAL'
  | 'NOT_ARBITRATOR'
  | 'FORBIDDEN_GOVERNANCE'
  | 'FORBIDDEN_ROLE'
  // state preconditions — HTTP 403
  | 'WRONG_STATE'
  | 'FLAGS_REMAIN'
  | 'ALREADY_RESOLVED'
  | 'NO_ESCALATION'
  | 'ALREADY_REVERSED'
  | 'ALREADY_APPROVED'
  | 'NOT_PAUSED'
  | 'EMPTY_REASON'
  | 'EMPTY_VALUE'
  | 'INCOMPLETE'
  | 'CONFLICT'
  // existence-hiding (IDOR / not found) — HTTP 404
  | 'NOT_FOUND'
  // rate limit — HTTP 429
  | 'RATE_LIMITED'

export function httpStatusFor(reason: DenialReason): number {
  switch (reason) {
    case 'TOKEN_INVALID':
    case 'TOKEN_EXPIRED':
    case 'JTI_REPLAYED':
      return 401
    case 'NOT_FOUND':
      return 404
    case 'RATE_LIMITED':
      return 429
    default:
      return 403
  }
}

export interface Denial {
  ok: false
  denialReason: DenialReason
}

export function denial(reason: DenialReason): Denial {
  return { ok: false, denialReason: reason }
}
