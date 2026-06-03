import type { Express, Request, Response } from 'express'
import type { z } from 'zod'
import type { Db } from '../db/connection.js'
import { denial, httpStatusFor, type Denial, type DenialReason } from '../denial.js'
import { resolveIdentity, loadAllowedActors } from '../identity/identity.js'
import type { SessionStore } from '../identity/session.js'
import { parseStrict } from '../validation.js'
import { type Ctx, type HandlerResult, resolveRole } from './shared.js'
import * as cases from './cases.js'
import * as proposals from './proposals.js'
import * as agents from './agents.js'
import * as notifications from './notifications.js'
import * as S from './schemas.js'

export interface MutationDeps {
  sessionStore: SessionStore
  secret: string | undefined
  now?: number
}

/**
 * Resolve the mutation context (SD-1 + SD-2): dual-ID identity, role lookup, and the single
 * governance-boundary gate (governance role = READ-ONLY → FORBIDDEN_GOVERNANCE for ALL mutations).
 * Operational roles fall through with no per-action role gate (identity-SoD + state only).
 */
export function resolveMutationContext(
  db: Db,
  deps: MutationDeps,
  token: string | undefined,
  bodyActorId: string | undefined,
): { ok: true; ctx: Ctx } | Denial {
  const identity = resolveIdentity(token, bodyActorId, loadAllowedActors(db), deps)
  if (!identity.ok) return identity
  const role = resolveRole(db, identity.effectiveActorId)
  if (!role) return denial('UNKNOWN_ACTOR')
  if (role === 'governance') return denial('FORBIDDEN_GOVERNANCE')
  return {
    ok: true,
    ctx: { sessionOperatorId: identity.sessionOperatorId, effectiveActorId: identity.effectiveActorId, role },
  }
}

export interface DispatchResult {
  status: number
  body: Record<string, unknown>
}

const deny = (reason: DenialReason): DispatchResult => ({
  status: httpStatusFor(reason),
  body: { ok: false, denialReason: reason },
})

export interface RawRequest {
  token?: string | undefined
  body: unknown
  params?: Record<string, string>
}

/**
 * In-process mutation dispatch (no HTTP server; contract 05 OD-5 / 09 D5): zod `.strict()` parse →
 * dual-ID identity + governance gate → run the pure handler → map to {status, denialReason|entity}.
 * The Express route is a 3-line adapter over this; tests call it directly.
 */
export function dispatchMutation<I extends { actorId: string }>(
  db: Db,
  deps: MutationDeps,
  raw: RawRequest,
  schema: z.ZodType<I>,
  run: (db: Db, ctx: Ctx, input: I, params: Record<string, string>) => HandlerResult,
): DispatchResult {
  const parsed = parseStrict(schema, raw.body)
  if (!parsed.ok) return deny(parsed.denialReason)
  const resolved = resolveMutationContext(db, deps, raw.token, parsed.data.actorId)
  if (!resolved.ok) return deny(resolved.denialReason)
  const result = run(db, resolved.ctx, parsed.data, raw.params ?? {})
  if (!result.ok) return deny(result.denialReason)
  return { status: 200, body: { ok: true, entity: result.entity, auditEvent: result.auditEvent } }
}

/** The 22 mutation routes (24-matrix minus persona-switch #23 + store/hydrate/reset #24). */
export function mountMutations(app: Express, db: Db, deps: MutationDeps): void {
  const route = <I extends { actorId: string }>(
    method: 'post',
    path: string,
    schema: z.ZodType<I>,
    run: (db: Db, ctx: Ctx, input: I, params: Record<string, string>) => HandlerResult,
  ): void => {
    app[method](path, (req: Request, res: Response) => {
      const r = dispatchMutation(
        db,
        deps,
        { token: req.header('X-Operator-Token'), body: req.body, params: req.params as Record<string, string> },
        schema,
        run,
      )
      res.status(r.status).json(r.body)
    })
  }

  // cases
  route('post', '/api/cases/:id/approve', S.ApproveCaseSchema, (d, c, i, p) => cases.approveCase(d, c, { ...i, id: p.id! }))
  route('post', '/api/cases/:id/fields/override', S.OverrideSchema, (d, c, i, p) => cases.overrideField(d, c, { ...i, id: p.id! }))
  route('post', '/api/cases/:id/sendback', S.CaseSendbackSchema, (d, c, i, p) => cases.sendbackCase(d, c, { ...i, id: p.id! }))
  route('post', '/api/cases/:id/escalate', S.EscalateSchema, (d, c, i, p) => cases.escalateCase(d, c, { ...i, id: p.id! }))
  route('post', '/api/cases/:id/escalation/resolve', S.ResolveEscalationSchema, (d, c, i, p) => cases.resolveEscalation(d, c, { ...i, id: p.id! }))
  route('post', '/api/cases/:id/assign', S.AssignSchema, (d, c, i, p) => cases.assignCase(d, c, { ...i, id: p.id! }))
  route('post', '/api/cases/bulk-approve', S.BulkApproveSchema, (d, c, i) => cases.bulkApprove(d, c, i))
  route('post', '/api/cases/:id/reverse', S.ReverseSchema, (d, c, i, p) => cases.reverseCase(d, c, { ...i, id: p.id! }))
  route('post', '/api/cases/:id/reprocess', S.ReprocessSchema, (d, c, _i, p) => cases.reprocessCase(d, c, { id: p.id! }))
  route('post', '/api/cases', S.CreateCaseSchema, (d, c, i) => cases.createCase(d, c, i))
  // proposals
  route('post', '/api/proposals/:id/forward', S.ActorOnlySchema, (d, c, _i, p) => proposals.forwardProposal(d, c, { id: p.id! }))
  route('post', '/api/proposals/:id/approve', S.ActorOnlySchema, (d, c, _i, p) => proposals.approveProposal(d, c, { id: p.id! }))
  route('post', '/api/proposals/:id/reject', S.ProposalRejectSchema, (d, c, i, p) => proposals.rejectProposal(d, c, { ...i, id: p.id! }))
  route('post', '/api/proposals/:id/sendback', S.ProposalSendbackSchema, (d, c, i, p) => proposals.sendbackProposal(d, c, { ...i, id: p.id! }))
  // agents
  route('post', '/api/agents/:id/promotion/request', S.ActorOnlySchema, (d, c, _i, p) => agents.requestPromotion(d, c, { id: p.id! }))
  route('post', '/api/agents/:id/promotion/approve', S.ActorOnlySchema, (d, c, _i, p) => agents.approvePromotion(d, c, { id: p.id! }))
  route('post', '/api/agents/:id/promotion/sendback', S.AgentReasonSchema, (d, c, i, p) => agents.sendbackPromotion(d, c, { ...i, id: p.id! }))
  route('post', '/api/agents/:id/emergency-stop', S.AgentReasonSchema, (d, c, i, p) => agents.emergencyStop(d, c, { ...i, id: p.id! }))
  route('post', '/api/agents/:id/resume', S.AgentReasonSchema, (d, c, i, p) => agents.resumeAgent(d, c, { ...i, id: p.id! }))
  // notifications
  route('post', '/api/notifications/:id/read', S.ActorOnlySchema, (d, c, _i, p) => notifications.markRead(d, c, { id: p.id! }))
  route('post', '/api/notifications/read-all', S.MarkAllReadSchema, (d, c, i) => notifications.markAllRead(d, c, i))
}
