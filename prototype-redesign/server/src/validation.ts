import type { z } from 'zod'
import type { DenialReason } from './denial.js'

export type ParseResult<T> =
  | { ok: true; data: T }
  | { ok: false; denialReason: Extract<DenialReason, 'UNKNOWN_FIELD' | 'VALIDATION'> }

/**
 * Parse a request body against a zod `.strict()` schema (SD-5). Unknown keys (mass-assignment) →
 * UNKNOWN_FIELD; any other validation failure (bad enum value, empty required string, wrong type) →
 * VALIDATION. The caller maps the reason to an HTTP status via httpStatusFor.
 */
export function parseStrict<T>(schema: z.ZodType<T>, body: unknown): ParseResult<T> {
  const result = schema.safeParse(body)
  if (result.success) return { ok: true, data: result.data }
  const hasUnknownKey = result.error.issues.some((i) => i.code === 'unrecognized_keys')
  return { ok: false, denialReason: hasUnknownKey ? 'UNKNOWN_FIELD' : 'VALIDATION' }
}
