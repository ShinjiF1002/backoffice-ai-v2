/**
 * selector hooks — page が触る唯一の store 面 (Phase 1 — 状態基盤)。
 * page は entity dict を直接見ず、これらの hook 経由で必要 slice だけ購読する。
 * workflowId 指定で client filter (undefined / 'all' は全件 = ProcessSelector「全業務」)。
 * (Hub 派生 model useHubModel は Hub 配線時 = Phase 4 に追加)
 */
import { useContext, useMemo } from 'react'
import type { Dispatch } from 'react'
import { StoreStateContext, StoreDispatchContext } from './context'
import type { StoreState, StoreAction, CaseEntity, ProposalEntity, AgentEntity } from './types'

function useStoreState(): StoreState {
  const s = useContext(StoreStateContext)
  if (!s) throw new Error('store selector must be used within <StoreProvider>')
  return s
}

export function useStoreDispatch(): Dispatch<StoreAction> {
  const d = useContext(StoreDispatchContext)
  if (!d) throw new Error('useStoreDispatch must be used within <StoreProvider>')
  return d
}

function matchesWorkflow(workflowId: string, filter?: string): boolean {
  return !filter || filter === 'all' || workflowId === filter
}

export function useCases(workflowId?: string): CaseEntity[] {
  const s = useStoreState()
  return useMemo(
    () => s.caseOrder.map((id) => s.cases[id]).filter((c) => matchesWorkflow(c.workflowId, workflowId)),
    [s, workflowId],
  )
}

export function useCase(id: string | undefined): CaseEntity | undefined {
  const s = useStoreState()
  return id ? s.cases[id] : undefined
}

/** 承認待ち (business-approval-waiting) のみ。Approvals 画面の派生 view。 */
export function useApprovals(workflowId?: string): CaseEntity[] {
  const s = useStoreState()
  return useMemo(
    () =>
      s.caseOrder
        .map((id) => s.cases[id])
        .filter((c) => c.status === 'business-approval-waiting' && matchesWorkflow(c.workflowId, workflowId)),
    [s, workflowId],
  )
}

export function useProposals(workflowId?: string): ProposalEntity[] {
  const s = useStoreState()
  return useMemo(
    () => s.proposalOrder.map((id) => s.proposals[id]).filter((p) => matchesWorkflow(p.workflowId, workflowId)),
    [s, workflowId],
  )
}

export function useProposal(id: string | undefined): ProposalEntity | undefined {
  const s = useStoreState()
  return id ? s.proposals[id] : undefined
}

export function useAgents(workflowId?: string): AgentEntity[] {
  const s = useStoreState()
  return useMemo(
    () => s.agentOrder.map((id) => s.agents[id]).filter((a) => matchesWorkflow(a.workflowId, workflowId)),
    [s, workflowId],
  )
}

export function useAgent(id: string | undefined): AgentEntity | undefined {
  const s = useStoreState()
  return id ? s.agents[id] : undefined
}
