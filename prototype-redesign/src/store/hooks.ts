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
import { HUB_PROCESSES, HUB_HEADLINE, HUB_PRIMARY_ACTION } from '@/data/mock-hub'
import type { HubProcess, HubHeadlineKpi, HubPrimaryAction } from '@/data/mock-hub'
import type { CaseStatus } from '@/data/types'

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

// ── Hub 派生 model (Phase 4b、R1) ──────────────────────────────────────────
// process total/dist・attention(要対応)・承認待ち・primary action を store から都度算出 (操作後 stale なし)。
// SLA KPI は text elapsed 由来で datetime 化未整備のため static 仮説値のまま (R1、派生 scope 外)。
export interface HubModel {
  processes: HubProcess[]
  headline: HubHeadlineKpi[]
  primaryAction: HubPrimaryAction
}

export function useHubModel(): HubModel {
  const s = useStoreState()
  return useMemo(() => {
    const allCases = s.caseOrder.map((id) => s.cases[id])
    const countBy = (pid: string, statuses: CaseStatus[]) =>
      allCases.filter((c) => c.workflowId === pid && statuses.includes(c.status)).length

    const processes: HubProcess[] = HUB_PROCESSES.map((p) => {
      const cases = allCases.filter((c) => c.workflowId === p.id)
      const dist: Partial<Record<CaseStatus, number>> = {}
      for (const c of cases) dist[c.status] = (dist[c.status] ?? 0) + 1
      return { ...p, dist, total: cases.length }
    })

    const headline: HubHeadlineKpi[] = HUB_HEADLINE.map((k) => {
      if (k.key === 'sla') return k // SLA は static 仮説維持 (R1、datetime 化未整備)
      const statuses: CaseStatus[] = k.key === 'attention' ? ['ready', 'sent-back'] : ['business-approval-waiting']
      const breakdown = HUB_PROCESSES.map((p) => ({ name: p.name, n: countBy(p.id, statuses) }))
      return { ...k, breakdown, total: breakdown.reduce((sum, b) => sum + b.n, 0) }
    })

    const approvalTotal = allCases.filter((c) => c.status === 'business-approval-waiting').length
    const primaryAction: HubPrimaryAction = {
      ...HUB_PRIMARY_ACTION,
      title: approvalTotal > 0 ? `承認待ち ${approvalTotal} 件を確認` : '承認待ちの案件はありません',
      detail:
        approvalTotal > 0
          ? '入力者確認が完了し、承認者の最終承認を待っています'
          : '現在、最終承認を待つ案件はありません',
    }

    return { processes, headline, primaryAction }
  }, [s])
}
