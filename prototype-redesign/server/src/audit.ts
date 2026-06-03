import type { Db } from './db/connection.js'

/**
 * Deterministic audit timestamp (contract 06 §auditSeq / 08 (b)). Ported from the live reducer
 * `auditTs(seq)` (`2026-05-30 HH:MM:00`) and NORMALIZED to tz-aware ISO-8601 (`...THH:MM:00+09:00`).
 * No runtime wall-clock — the value is a pure function of seq (test-deterministic).
 */
export function auditTs(seq: number): string {
  // deterministic + MONOTONIC: fixed JST epoch 2026-05-30T18:00:00+09:00 + seq minutes, with the
  // DATE rolling forward past midnight (the live reducer's `% 24` wrapped the hour keeping the date,
  // which is non-monotonic after seq 360 — fixed here while keeping the +09:00 tz). No wall-clock.
  const pad = (n: number): string => String(n).padStart(2, '0')
  const epochUtcMs = Date.UTC(2026, 4, 30, 9, 0, 0) // 2026-05-30T18:00:00+09:00 == 09:00Z
  const jst = new Date(epochUtcMs + seq * 60_000 + 9 * 3_600_000) // +9h to read JST wall-clock via getUTC*
  return `${jst.getUTCFullYear()}-${pad(jst.getUTCMonth() + 1)}-${pad(jst.getUTCDate())}T${pad(jst.getUTCHours())}:${pad(jst.getUTCMinutes())}:${pad(jst.getUTCSeconds())}+09:00`
}

/** Next monotonic seq = contiguous 0-based (= current row count). */
export function nextSeq(db: Db): number {
  return (db.prepare('SELECT COALESCE(MAX(seq), -1) + 1 AS n FROM audit_events').get() as { n: number }).n
}

export type EntityType = 'case' | 'proposal' | 'agent'

export interface AuditInput {
  entityType: EntityType
  entityId: string
  caseId: string | null
  action: string
  before?: string | null
  after?: string | null
}

export interface AuditEventRow {
  id: number
  seq: number
  entity_type: EntityType
  entity_id: string
  case_id: string | null
  actor_id: string
  session_operator_id: string
  action: string
  occurred_at: string
}

/**
 * Append one audit row with the dual identity (SD-1): actor_id = effective_actor_id (persona),
 * session_operator_id = token operator (provenance). occurred_at = auditTs(seq). Append-only
 * (UPDATE/DELETE blocked by DB trigger). MUST be called inside the mutation's db.transaction.
 */
export function insertAudit(
  db: Db,
  ctx: { sessionOperatorId: string; effectiveActorId: string },
  ev: AuditInput,
): AuditEventRow {
  const seq = nextSeq(db)
  const occurredAt = auditTs(seq)
  const info = db
    .prepare(
      `INSERT INTO audit_events
        (seq, entity_type, entity_id, case_id, actor_id, session_operator_id, action, occurred_at, before_json, after_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(seq, ev.entityType, ev.entityId, ev.caseId, ctx.effectiveActorId, ctx.sessionOperatorId, ev.action, occurredAt, ev.before ?? null, ev.after ?? null)
  return {
    id: Number(info.lastInsertRowid),
    seq,
    entity_type: ev.entityType,
    entity_id: ev.entityId,
    case_id: ev.caseId,
    actor_id: ctx.effectiveActorId,
    session_operator_id: ctx.sessionOperatorId,
    action: ev.action,
    occurred_at: occurredAt,
  }
}
