/**
 * 既存 list mock を store の初期 state に正規化 (Phase 1 — 状態基盤)。
 * list 行を権威 source とし、workflow 名 → workflowId を解決して entity dict を組む。
 */
import { CASE_LIST } from '@/data/mock-case-list'
import { PROPOSAL_LIST } from '@/data/mock-proposal-list'
import { AGENT_LIST } from '@/data/mock-agent-list'
import type { CaseEntity, ProposalEntity, AgentEntity, StoreState } from './types'
import { DEFAULT_ACTOR_ID } from './actors'

/** workflow 名 → workflowId。Hub/ProcessSelector の id 体系と整合 (mock-hub: UC-BO-01/02)。 */
const WORKFLOW_NAME_TO_ID: Record<string, string> = {
  法人住所変更: 'UC-BO-01',
  口座開設書類完備: 'UC-BO-02',
}

function workflowIdOf(name: string): string {
  return WORKFLOW_NAME_TO_ID[name] ?? name
}

export function seed(): StoreState {
  const cases: Record<string, CaseEntity> = {}
  const caseOrder: string[] = []
  for (const row of CASE_LIST) {
    cases[row.id] = {
      id: row.id,
      workflowId: workflowIdOf(row.workflow),
      workflowName: row.workflow,
      status: row.status,
      assignee: row.owner === '—' ? undefined : row.owner,
      flags: row.flags,
      resolvedFieldIds: [],
      overrides: {},
      // 既に承認待ちの seed 案件は入力者承認済とみなし inputApprovedBy を埋める (B4 SoD を seeded baw にも普遍適用)。
      inputApprovedBy: row.status === 'business-approval-waiting' ? DEFAULT_ACTOR_ID : undefined,
      elapsedLabel: row.elapsed,
    }
    caseOrder.push(row.id)
  }

  const proposals: Record<string, ProposalEntity> = {}
  const proposalOrder: string[] = []
  for (const row of PROPOSAL_LIST) {
    proposals[row.id] = {
      id: row.id,
      workflowId: workflowIdOf(row.workflow),
      workflowName: row.workflow,
      status: row.status,
    }
    proposalOrder.push(row.id)
  }

  const agents: Record<string, AgentEntity> = {}
  const agentOrder: string[] = []
  for (const row of AGENT_LIST) {
    agents[row.id] = {
      id: row.id,
      workflowId: workflowIdOf(row.workflow),
      workflowName: row.workflow,
      trust: row.trust,
      promotionRequested: false,
      paused: false,
    }
    agentOrder.push(row.id)
  }

  return { cases, caseOrder, proposals, proposalOrder, agents, agentOrder, currentActorId: DEFAULT_ACTOR_ID }
}
