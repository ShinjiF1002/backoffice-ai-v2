import type { Express, Request, Response } from 'express'
import { z } from 'zod'
import type { Db } from '../db/connection.js'
import { denial, httpStatusFor, type Denial, type DenialReason } from '../denial.js'
import { resolveIdentity, loadAllowedActors } from '../identity/identity.js'
import { parseStrict } from '../validation.js'
import { type Ctx, resolveRole, loadCase, loadEscalation } from './shared.js'
import type { MutationDeps } from './router.js'

export type ReadResult = { ok: true; data: unknown } | Denial

const CASE_STATUSES = ['pending', 'ready', 'sent-back', 'business-approval-waiting', 'reflected']
const PAGE_CAP = 100

// ── read identity (governance is ALLOWED for reads; per-endpoint gating) ──────
export function resolveReadContext(
  db: Db,
  deps: MutationDeps,
  token: string | undefined,
  actorId: string | undefined,
): { ok: true; ctx: Ctx } | Denial {
  const identity = resolveIdentity(token, actorId, loadAllowedActors(db), deps)
  if (!identity.ok) return identity
  const role = resolveRole(db, identity.effectiveActorId)
  if (!role) return denial('UNKNOWN_ACTOR')
  return {
    ok: true,
    ctx: { sessionOperatorId: identity.sessionOperatorId, effectiveActorId: identity.effectiveActorId, role },
  }
}

function requireGovernance(ctx: Ctx): Denial | null {
  return ctx.role === 'governance' ? null : denial('FORBIDDEN_ROLE')
}

// ── query schemas (all reads carry actorId for auth/role; .strict()) ──────────
const ActorQuery = z.object({ actorId: z.string().min(1) }).strict()
export const ListCasesQuery = z
  .object({
    actorId: z.string().min(1),
    workflow: z.string().optional(),
    status: z.string().optional(),
    page: z.coerce.number().int().min(0).optional(),
    size: z.coerce.number().int().min(1).optional(),
  })
  .strict()
const SearchQuery = z.object({ actorId: z.string().min(1), q: z.string() }).strict()

// ── business reads (all roles) ────────────────────────────────────────────────
export function listCases(db: Db, _ctx: Ctx, q: z.infer<typeof ListCasesQuery>): ReadResult {
  const workflowIds = (db.prepare('SELECT id FROM workflows').all() as { id: string }[]).map((r) => r.id)
  if (q.workflow && q.workflow !== 'all' && !workflowIds.includes(q.workflow)) return denial('VALIDATION')
  if (q.status && q.status !== 'all' && !CASE_STATUSES.includes(q.status)) return denial('VALIDATION')
  const size = Math.min(q.size ?? PAGE_CAP, PAGE_CAP) // server cap (clamp, not reject; 09 §2-2)
  const offset = (q.page ?? 0) * size
  const where: string[] = []
  const binds: (string | number)[] = []
  if (q.workflow && q.workflow !== 'all') {
    where.push('workflow_id = ?')
    binds.push(q.workflow)
  }
  if (q.status && q.status !== 'all') {
    where.push('status = ?')
    binds.push(q.status)
  }
  const sql = `SELECT id, workflow_id, status, assignee_name, flags, received_at FROM cases
    ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY id LIMIT ? OFFSET ?`
  const rows = db.prepare(sql).all(...binds, size, offset)
  return { ok: true, data: { rows, size, page: q.page ?? 0 } }
}

export function searchCases(db: Db, _ctx: Ctx, q: z.infer<typeof SearchQuery>): ReadResult {
  // literal substring via instr() — LIKE wildcards (% / _) in user input are NOT treated as wildcards
  // (bound param + instr means `q='%'` matches nothing, not every row)
  const rows = db.prepare('SELECT id, workflow_id, status FROM cases WHERE instr(id, ?) > 0 ORDER BY id LIMIT ?').all(q.q, PAGE_CAP)
  return { ok: true, data: { rows } }
}

export function getCaseById(db: Db, _ctx: Ctx, _q: unknown, params: Record<string, string>): ReadResult {
  const row = loadCase(db, params.id!)
  if (!row) return denial('NOT_FOUND')
  return { ok: true, data: row }
}

export function listProposals(db: Db): ReadResult {
  return { ok: true, data: db.prepare('SELECT id, workflow_id, status, agent_id, change_area, impact_count FROM proposals ORDER BY id').all() }
}

export function getProposalById(db: Db, _ctx: Ctx, _q: unknown, params: Record<string, string>): ReadResult {
  const row = db.prepare('SELECT * FROM proposals WHERE id = ?').get(params.id!)
  if (!row) return denial('NOT_FOUND')
  return { ok: true, data: row }
}

export function listAgents(db: Db): ReadResult {
  // promotion_status is included so the business-approver sees the pending-promotion surface here
  // (config-approvals is the separate governance oversight view).
  return { ok: true, data: db.prepare('SELECT id, workflow_id, trust, promotion_status, promotion_requested_by, paused FROM agents ORDER BY id').all() }
}

export function getAgentById(db: Db, _ctx: Ctx, _q: unknown, params: Record<string, string>): ReadResult {
  const row = db.prepare('SELECT * FROM agents WHERE id = ?').get(params.id!)
  if (!row) return denial('NOT_FOUND')
  return { ok: true, data: row }
}

export function listApprovals(db: Db): ReadResult {
  // approver queue = business-approval-waiting cases
  return {
    ok: true,
    data: db.prepare("SELECT id, workflow_id, status, assignee_name, input_approved_by, received_at FROM cases WHERE status = 'business-approval-waiting' ORDER BY id").all(),
  }
}

export function getHub(db: Db): ReadResult {
  const n = (sql: string): number => (db.prepare(sql).get() as { n: number }).n
  return {
    ok: true,
    data: {
      total: n('SELECT n FROM v_hub_total'),
      attention: n('SELECT n FROM v_hub_attention'),
      approvalWaiting: n('SELECT n FROM v_hub_approval_waiting'),
      metrics: db.prepare('SELECT workflow_id, metric_label, actual_value, threshold, achieved, denominator FROM synthetic_metric_rows').all(),
    },
  }
}

// ── governance-only reads (operational roles rejected) ────────────────────────
export function getAuditEvents(db: Db, ctx: Ctx): ReadResult {
  const gate = requireGovernance(ctx)
  if (gate) return gate
  // who/when/what only — NO before_json/after_json (no full-row dump); no confidence column exists
  const rows = db
    .prepare('SELECT seq, entity_type, entity_id, case_id, actor_id, session_operator_id, action, occurred_at FROM audit_events ORDER BY seq')
    .all()
  return { ok: true, data: rows }
}

export function getGovernanceModels(db: Db, ctx: Ctx): ReadResult {
  const gate = requireGovernance(ctx)
  if (gate) return gate
  return { ok: true, data: db.prepare('SELECT * FROM governance_model_inventory ORDER BY id').all() }
}

export function getConfigApprovals(db: Db, ctx: Ctx): ReadResult {
  const gate = requireGovernance(ctx)
  if (gate) return gate
  return {
    ok: true,
    data: db.prepare("SELECT id, workflow_id, promotion_status, promotion_requested_by FROM agents WHERE promotion_status = 'requested'").all(),
  }
}

// ── persona-scoped reads (object-level IDOR) ──────────────────────────────────
interface EscRow {
  case_id: string
  escalated_to: string
  escalated_from: string
  resolution: string | null
}
function notificationsFor(db: Db, actorId: string): { id: string; type: string; caseId: string }[] {
  const out: { id: string; type: string; caseId: string }[] = []
  // escalation queue (arbiter, escalated_to) + resolution closure (requester, escalated_from) — keyed by actor id
  const escs = db.prepare('SELECT case_id, escalated_to, escalated_from, resolution FROM escalations').all() as EscRow[]
  for (const e of escs) {
    if (e.escalated_to === actorId && e.resolution === null) out.push({ id: `esc-to:${e.case_id}`, type: 'arbitration-request', caseId: e.case_id })
    if (e.escalated_from === actorId && e.resolution !== null) out.push({ id: `esc-from:${e.case_id}`, type: 'arbitration-result', caseId: e.case_id })
  }
  // sendback + reversal notifications go to the case assignee, matched by display name (live
  // useNotifications). SAFE because actor display names are unique (enforced by seed:validate);
  // cases assigned to a non-actor owner (e.g. 佐藤花子/高橋, free names not in `actors`) have no
  // matching persona and are intentionally unreachable (those owners are not demo personas).
  const actorName = (db.prepare('SELECT name FROM actors WHERE id = ?').get(actorId) as { name: string } | undefined)?.name
  if (actorName) {
    const rows = db.prepare("SELECT id, reversal_kind FROM cases WHERE status = 'sent-back' AND assignee_name = ?").all(actorName) as {
      id: string
      reversal_kind: string | null
    }[]
    for (const c of rows) {
      if (c.reversal_kind === null) out.push({ id: `sendback:${c.id}`, type: 'sendback', caseId: c.id })
      else out.push({ id: `reversal:${c.id}`, type: 'reversal', caseId: c.id })
    }
  }
  return out
}

export function getNotifications(db: Db, ctx: Ctx): ReadResult {
  return { ok: true, data: notificationsFor(db, ctx.effectiveActorId) }
}

export function getNotificationById(db: Db, ctx: Ctx, _q: unknown, params: Record<string, string>): ReadResult {
  const found = notificationsFor(db, ctx.effectiveActorId).find((n) => n.id === params.id)
  if (!found) return denial('NOT_FOUND') // existence-hiding for cross-actor access
  return { ok: true, data: found }
}

export function getEscalationById(db: Db, ctx: Ctx, _q: unknown, params: Record<string, string>): ReadResult {
  const esc = loadEscalation(db, params.id!)
  if (!esc) return denial('NOT_FOUND')
  if (esc.escalated_to !== ctx.effectiveActorId && esc.escalated_from !== ctx.effectiveActorId) return denial('NOT_FOUND')
  return { ok: true, data: esc }
}

// ── dispatch + mount ──────────────────────────────────────────────────────────
export interface DispatchResult {
  status: number
  body: Record<string, unknown>
}
const deny = (reason: DenialReason): DispatchResult => ({ status: httpStatusFor(reason), body: { ok: false, denialReason: reason } })

export function dispatchRead<Q extends { actorId: string }>(
  db: Db,
  deps: MutationDeps,
  raw: { token?: string | undefined; query: unknown; params?: Record<string, string> },
  schema: z.ZodType<Q>,
  run: (db: Db, ctx: Ctx, query: Q, params: Record<string, string>) => ReadResult,
): DispatchResult {
  const parsed = parseStrict(schema, raw.query)
  if (!parsed.ok) return deny(parsed.denialReason)
  const resolved = resolveReadContext(db, deps, raw.token, parsed.data.actorId)
  if (!resolved.ok) return deny(resolved.denialReason)
  const result = run(db, resolved.ctx, parsed.data, raw.params ?? {})
  if (!result.ok) return deny(result.denialReason)
  return { status: 200, body: { ok: true, data: result.data } }
}

export const READ_MANIFEST = [
  'GET /api/cases',
  'GET /api/cases/:id',
  'GET /api/approvals',
  'GET /api/proposals',
  'GET /api/proposals/:id',
  'GET /api/agents',
  'GET /api/agents/:id',
  'GET /api/search',
  'GET /api/hub',
  'GET /api/audit-events (governance)',
  'GET /api/governance/models (governance)',
  'GET /api/config-approvals (governance)',
  'GET /api/notifications (idor)',
  'GET /api/notifications/:id (idor)',
  'GET /api/escalations/:id (idor)',
] as const

export function mountReads(app: Express, db: Db, deps: MutationDeps): void {
  const route = <Q extends { actorId: string }>(
    path: string,
    schema: z.ZodType<Q>,
    run: (db: Db, ctx: Ctx, query: Q, params: Record<string, string>) => ReadResult,
  ): void => {
    app.get(path, (req: Request, res: Response) => {
      const r = dispatchRead(
        db,
        deps,
        { token: req.header('X-Operator-Token'), query: req.query, params: req.params as Record<string, string> },
        schema,
        run,
      )
      res.status(r.status).json(r.body)
    })
  }

  route('/api/cases', ListCasesQuery, (d, c, q) => listCases(d, c, q))
  route('/api/cases/:id', ActorQuery, (d, c, q, p) => getCaseById(d, c, q, p))
  route('/api/approvals', ActorQuery, (d) => listApprovals(d))
  route('/api/proposals', ActorQuery, (d) => listProposals(d))
  route('/api/proposals/:id', ActorQuery, (d, c, q, p) => getProposalById(d, c, q, p))
  route('/api/agents', ActorQuery, (d) => listAgents(d))
  route('/api/agents/:id', ActorQuery, (d, c, q, p) => getAgentById(d, c, q, p))
  route('/api/search', SearchQuery, (d, c, q) => searchCases(d, c, q))
  route('/api/hub', ActorQuery, (d) => getHub(d))
  route('/api/audit-events', ActorQuery, (d, c) => getAuditEvents(d, c))
  route('/api/governance/models', ActorQuery, (d, c) => getGovernanceModels(d, c))
  route('/api/config-approvals', ActorQuery, (d, c) => getConfigApprovals(d, c))
  route('/api/notifications', ActorQuery, (d, c) => getNotifications(d, c))
  route('/api/notifications/:id', ActorQuery, (d, c, q, p) => getNotificationById(d, c, q, p))
  route('/api/escalations/:id', ActorQuery, (d, c, q, p) => getEscalationById(d, c, q, p))
}
