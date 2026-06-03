import type { DenialReason } from './denial.js'

/**
 * Structured-log allowlist (contract 01 §B-1 #8 / SD-1 dual-ID). ONLY these fields are ever emitted —
 * never the token/secret, customer values, or full before/after rows. Anything not on the allowlist
 * is dropped before logging, so PII/secrets cannot leak into logs.
 */
export const LOG_ALLOWLIST = ['session_operator_id', 'effective_actor_id', 'action', 'result', 'denialReason'] as const

export interface AuditLogInput {
  session_operator_id?: string
  effective_actor_id?: string
  action: string
  result: 'ok' | 'deny'
  denialReason?: DenialReason
  // any extra fields a caller might pass (token/secret/PII) are intentionally NOT in the allowlist
  [extra: string]: unknown
}

/** Project an input to the allowlisted log shape (pure; the caller decides where to write it). */
export function toLogPayload(input: AuditLogInput): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const field of LOG_ALLOWLIST) {
    const value = input[field]
    // allowlist by key AND require a scalar value — an object value (e.g. {token,secret}) is dropped
    if (value !== undefined && (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean')) out[field] = value
  }
  return out
}

/** Emit a structured log line (allowlisted fields only). */
export function logAudit(input: AuditLogInput): void {
  console.log(JSON.stringify(toLogPayload(input)))
}
