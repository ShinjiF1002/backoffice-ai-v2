import { z } from 'zod'

// All write bodies extend ActorPersonaBody { actorId } and are .strict() (SD-5: unknown key reject).
// reason/value/category use z.string() (NOT .min(1)) so emptiness yields the specific EMPTY_REASON /
// EMPTY_VALUE denial in the handler (not a generic VALIDATION). Enums reject bad values as VALIDATION.
const actorId = z.string().min(1)

export const ApproveCaseSchema = z.object({ actorId, by: z.enum(['input', 'checker']) }).strict()
export const OverrideSchema = z.object({ actorId, fieldLabel: z.string().min(1), value: z.string() }).strict()
export const CaseSendbackSchema = z.object({ actorId, reason: z.string(), category: z.string() }).strict()
export const EscalateSchema = z.object({ actorId, reason: z.string(), category: z.string(), to: z.string().min(1) }).strict()
export const ResolveEscalationSchema = z
  .object({ actorId, resolution: z.enum(['proceed', 'sendback']), reason: z.string().optional(), category: z.string().optional() })
  .strict()
export const AssignSchema = z.object({ actorId, assignee: z.string().min(1) }).strict()
export const BulkApproveSchema = z.object({ actorId, ids: z.array(z.string()).min(1), by: z.enum(['input', 'checker']) }).strict()
export const ReverseSchema = z.object({ actorId, kind: z.enum(['訂正', '取消']), reason: z.string() }).strict()
export const ReprocessSchema = z.object({ actorId }).strict()
export const CreateCaseSchema = z
  .object({
    actorId,
    id: z.string().min(1),
    workflowId: z.string().min(1),
    workflowName: z.string().min(1),
    assignee: z.string().optional(),
    fieldLabels: z.array(z.string()).min(1),
    values: z.record(z.string(), z.string()),
    receivedAt: z.string().min(1),
  })
  .strict()

export const ActorOnlySchema = z.object({ actorId }).strict()
export const ProposalRejectSchema = z.object({ actorId, reason: z.string(), category: z.string().optional() }).strict()
export const ProposalSendbackSchema = z.object({ actorId, reason: z.string(), category: z.string().optional() }).strict()
export const AgentReasonSchema = z.object({ actorId, reason: z.string() }).strict()
export const MarkReadSchema = z.object({ actorId, id: z.string().min(1) }).strict()
export const MarkAllReadSchema = z.object({ actorId, ids: z.array(z.string()) }).strict()

export type ApproveCaseInput = z.infer<typeof ApproveCaseSchema>
export type OverrideInput = z.infer<typeof OverrideSchema>
export type CaseSendbackInput = z.infer<typeof CaseSendbackSchema>
export type EscalateInput = z.infer<typeof EscalateSchema>
export type ResolveEscalationInput = z.infer<typeof ResolveEscalationSchema>
export type AssignInput = z.infer<typeof AssignSchema>
export type BulkApproveInput = z.infer<typeof BulkApproveSchema>
export type ReverseInput = z.infer<typeof ReverseSchema>
export type CreateCaseInput = z.infer<typeof CreateCaseSchema>
export type ProposalRejectInput = z.infer<typeof ProposalRejectSchema>
export type ProposalSendbackInput = z.infer<typeof ProposalSendbackSchema>
export type AgentReasonInput = z.infer<typeof AgentReasonSchema>
export type MarkReadInput = z.infer<typeof MarkReadSchema>
export type MarkAllReadInput = z.infer<typeof MarkAllReadSchema>
