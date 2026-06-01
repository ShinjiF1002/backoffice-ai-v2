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
      receivedAt: row.receivedAt,
    }
    caseOrder.push(row.id)
  }

  // F-028 (distinction): C2「難案件が宙に消える」の旗艦面 (/escalations + 業務責任者ハブ裁定タイル) を初回ロードで
  //   live にするため、代表的な未裁定 escalation を 1 件 seed する (手動 setup 無しで C2 解決を実演)。
  //   起票 actor = 既定 (入力者)、裁定先 = 業務責任者。status は不変 (escalation は依頼記録)。who/when は in-session 操作でないため banner では理由のみ。
  const seedEscalationId = 'CASE-2026-0145'
  const seedEscalationCase = cases[seedEscalationId]
  if (seedEscalationCase) {
    cases[seedEscalationId] = {
      ...seedEscalationCase,
      escalation: { reason: '前例のない住所表記で確定可否の判断に迷う', category: '業務ルール抵触', to: 'actor-approver', from: DEFAULT_ACTOR_ID },
    }
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
      promotionStatus: 'none',
      paused: false,
    }
    agentOrder.push(row.id)
  }

  return {
    cases,
    caseOrder,
    proposals,
    proposalOrder,
    agents,
    agentOrder,
    currentActorId: DEFAULT_ACTOR_ID,
    readNotificationIds: [],
    // F-002: セッション操作証跡は空から始まる (静的参照台帳 OBS_LEDGER/CROSS_LEDGER は data 側、useCrossLedger が append)。
    auditEvents: [],
    auditSeq: 0,
  }
}
