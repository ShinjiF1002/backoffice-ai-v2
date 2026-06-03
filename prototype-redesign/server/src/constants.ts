/**
 * Demo clock SSOT constant — ported verbatim from client `src/lib/dates.ts` NOW_ISO.
 * tz-aware ISO-8601. Used for `schema_migrations.applied_at` and the `demo_clock` seed,
 * and as the base for deterministic `auditTs(seq)` (no runtime wall-clock; contract 08 (d)).
 */
export const DEMO_NOW_ISO = '2026-05-30T18:00:00+09:00'

/** demo operators (CODE CONSTANT, not a DB table; contract 03 §3 / 08 (b)). */
export const OPERATORS = ['op-demo-1', 'op-demo-2'] as const
export type OperatorId = (typeof OPERATORS)[number]
