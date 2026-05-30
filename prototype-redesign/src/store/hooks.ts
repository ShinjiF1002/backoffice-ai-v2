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
import { PROPOSAL_DETAILS } from '@/data/mock-proposal-detail'
import type { CaseStatus, ProposalStatus } from '@/data/types'
import { actorById } from './actors'
import type { DemoActor } from './actors'

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

/**
 * order 配列 → entity 配列 (dict 欠落 id は drop)。
 * NUIA narrow: persist drift で order に dict 不在 id が混じっても undefined を後段に渡さず白画面化を防ぐ
 * (reducer の早期 return guard と同一思想、`!` non-null は使わない)。
 */
function resolveOrder<T>(order: readonly string[], dict: Record<string, T>): T[] {
  return order.flatMap((id) => {
    const e = dict[id]
    return e ? [e] : []
  })
}

export function useCases(workflowId?: string): CaseEntity[] {
  const s = useStoreState()
  return useMemo(
    () => resolveOrder(s.caseOrder, s.cases).filter((c) => matchesWorkflow(c.workflowId, workflowId)),
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
      resolveOrder(s.caseOrder, s.cases)
        .filter((c) => c.status === 'business-approval-waiting' && matchesWorkflow(c.workflowId, workflowId)),
    [s, workflowId],
  )
}

export function useProposals(workflowId?: string): ProposalEntity[] {
  const s = useStoreState()
  return useMemo(
    () => resolveOrder(s.proposalOrder, s.proposals).filter((p) => matchesWorkflow(p.workflowId, workflowId)),
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
    () => resolveOrder(s.agentOrder, s.agents).filter((a) => matchesWorkflow(a.workflowId, workflowId)),
    [s, workflowId],
  )
}

export function useAgent(id: string | undefined): AgentEntity | undefined {
  const s = useStoreState()
  return id ? s.agents[id] : undefined
}

/** 現在の操作 actor (remediation B4)。persona switcher / SoD 表示で使う。currentActorId 不明時は undefined。 */
export function useCurrentActor(): DemoActor | undefined {
  const s = useStoreState()
  return actorById(s.currentActorId)
}

/** 案件承認の可否 + disabled 理由 (footer / title 用)。allowed=true なら reason は undefined。 */
export interface ApproveGate {
  allowed: boolean
  reason?: string
}

/**
 * 案件の承認可否を status precondition + SoD (四眼原則) で 1 selector に集約 (remediation B4)。
 * reducer の approveCase precondition と一致させ、false success と自己承認を UI 側でも封じる。
 * - input: status=ready かつ要確認 (flags) 0。
 * - checker: status=business-approval-waiting かつ「現在の actor が入力者承認していない」(currentActorId 照合)。
 */
export function useCanApprove(id: string | undefined, by: 'input' | 'checker'): ApproveGate {
  const s = useStoreState()
  const entity = id ? s.cases[id] : undefined
  if (!entity) return { allowed: false, reason: '参照専用の案件です（この画面では操作できません）' }
  if (by === 'input') {
    if (entity.status !== 'ready') return { allowed: false, reason: 'この案件は入力者確認の段階ではありません' }
    if (entity.flags > 0) return { allowed: false, reason: `要確認 ${entity.flags} 項目を解消してください` }
    return { allowed: true }
  }
  if (entity.status !== 'business-approval-waiting') return { allowed: false, reason: 'この案件は承認者の最終承認の段階ではありません' }
  if (entity.inputApprovedBy !== undefined && entity.inputApprovedBy === s.currentActorId) {
    return { allowed: false, reason: '入力者として承認済みのため最終承認できません — 別の担当者（承認者）に切替えてください（四眼原則）' }
  }
  return { allowed: true }
}

// ── Flywheel 観測化 (remediation P0-W3、Gate 5ii) ─────────────────────────
// 承認段階に入った提案 (forwarded / approved) を「差戻し → 改善 → 承認」の lineage に派生。
// 新 static fixture は増やさず store (live status) + PROPOSAL_DETAILS (起点 case / 改定内容) から都度算出。
export interface FlywheelLineage {
  proposalId: string
  /** 改定内容 (changeTitle)。 */
  title: string
  workflow: string
  /** 改定対象 agent (agent→提案 link、B2)。 */
  agentId: string
  /** 起点となった差戻し case id 群 (Flywheel の入口)。 */
  sourceCaseIds: string[]
  /** live status (store-truth)。forwarded=手順承認待ち / approved=設定承認済。 */
  status: ProposalStatus
  /** 設定承認まで到達 (approved)。承認操作で true になり lineage に「承認済」が出現する。 */
  adopted: boolean
}

export function useFlywheelLineage(): FlywheelLineage[] {
  const s = useStoreState()
  return useMemo(
    () =>
      resolveOrder(s.proposalOrder, s.proposals)
        .filter((p) => p.status === 'forwarded' || p.status === 'approved')
        .map((p): FlywheelLineage => {
          const d = PROPOSAL_DETAILS[p.id]
          return {
            proposalId: p.id,
            title: d?.changeTitle ?? p.workflowName,
            workflow: p.workflowName,
            agentId: d?.agentId ?? '',
            sourceCaseIds: d?.sourceCases.map((sc) => sc.id) ?? [],
            status: p.status,
            adopted: p.status === 'approved',
          }
        }),
    [s],
  )
}

/** 指定 agent に採用された (approved) 提案 id 群 (flywheel→agent link、AgentDetail で「反映された改善」表示)。 */
export function useAgentAdoptedProposals(agentId: string | undefined): string[] {
  const s = useStoreState()
  return useMemo(() => {
    if (!agentId) return []
    return resolveOrder(s.proposalOrder, s.proposals)
      .filter((p) => p.status === 'approved' && PROPOSAL_DETAILS[p.id]?.agentId === agentId)
      .map((p) => p.id)
  }, [s, agentId])
}

// ── Hub 派生 model (Phase 4b、R1 / remediation B3) ─────────────────────────
// process total/dist・attention(要対応)・承認待ち・primary action を store から都度算出 (操作後 stale なし)。
// SLA KPI は text elapsed 由来で datetime 化未整備のため static 仮説値のまま (R1、派生 scope 外)。
// total/dist は HUB_PROCESSES (static) から物理削除済 → useHubModel が唯一の算出 source (型で強制、drift 不能)。
export interface HubProcessModel extends HubProcess {
  /** CaseStatus 別件数 (store 由来)。表示ラベル/tone は status-tones resolver 経由 */
  dist: Partial<Record<CaseStatus, number>>
  /** 業務 case 件数 (store 由来)。 */
  total: number
}

export interface HubModel {
  processes: HubProcessModel[]
  headline: HubHeadlineKpi[]
  primaryAction: HubPrimaryAction
}

export function useHubModel(): HubModel {
  const s = useStoreState()
  return useMemo(() => {
    const allCases = resolveOrder(s.caseOrder, s.cases)
    const countBy = (pid: string, statuses: CaseStatus[]) =>
      allCases.filter((c) => c.workflowId === pid && statuses.includes(c.status)).length

    const processes: HubProcessModel[] = HUB_PROCESSES.map((p) => {
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
