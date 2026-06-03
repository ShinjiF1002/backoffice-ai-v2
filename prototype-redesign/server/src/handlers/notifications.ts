import type { Db } from '../db/connection.js'
import type { Ctx, Cmd, HandlerResult } from './shared.js'
import type { MarkAllReadInput } from './schemas.js'

// notification mutations are audit-LESS + idempotent (INSERT OR IGNORE on the (id, actor) PK).

/** notification/markRead (#21): idempotent mark-read for the acting persona (id from the path). */
export function markRead(db: Db, ctx: Ctx, input: { id: string }): HandlerResult<{ read: true }> {
  db.transaction(() => {
    db.prepare('INSERT OR IGNORE INTO notifications_read_state (notification_id, actor_id) VALUES (?, ?)').run(input.id, ctx.effectiveActorId)
  })()
  return { ok: true, entity: { read: true } }
}

/** notification/markAllRead (#22): idempotent bulk mark-read (selector-computed ids). */
export function markAllRead(db: Db, ctx: Ctx, input: Cmd<MarkAllReadInput>): HandlerResult<{ read: number }> {
  db.transaction(() => {
    const stmt = db.prepare('INSERT OR IGNORE INTO notifications_read_state (notification_id, actor_id) VALUES (?, ?)')
    for (const id of input.ids) stmt.run(id, ctx.effectiveActorId)
  })()
  return { ok: true, entity: { read: input.ids.length } }
}
