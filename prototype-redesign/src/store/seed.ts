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
  // PV1 (2026-06-01): 新業務 3。新業務 case が CASE_LIST に入る PV2 まで未使用 (map 定義のみ、既存挙動に無影響)。
  口座振替登録: 'UC-BO-03',
  改印・代表者変更届: 'UC-BO-04',
  カード再発行: 'UC-BO-05',
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

  // F-028 (distinction) + PV2b: C2「難案件が宙に消える」の旗艦面 (/escalations + 業務責任者ハブ裁定タイル) を初回ロードで
  //   live にするため、未裁定 escalation を業務横断で複数 seed する (区分・業務を分散、queue/滞留/triage の demo 価値を成立)。
  //   起票 actor = 既定 (入力者)、裁定先 = 業務責任者。status は不変 (escalation は overlay 記録)。resolution 未確定 = active queue。
  const SEED_ESCALATIONS: { id: string; reason: string; category: string }[] = [
    { id: 'CASE-2026-0145', reason: '前例のない住所表記で確定可否の判断に迷う', category: '業務ルール抵触' },
    { id: 'CASE-2026-0201', reason: '収納企業コードが未登録で確定可否の判断に迷う', category: '前例なし' },
    { id: 'CASE-2026-0231', reason: '新代表者の本人確認書類の整合が取れない', category: '書類不備' },
    { id: 'CASE-2026-0241', reason: '送付先住所が登録と相違し本人確認が必要', category: '本人確認' },
  ]
  for (const e of SEED_ESCALATIONS) {
    const c = cases[e.id]
    if (c) cases[e.id] = { ...c, escalation: { reason: e.reason, category: e.category, to: 'actor-approver', from: DEFAULT_ACTOR_ID } }
  }
  // PV2b: 裁定済 (続行可) escalation を 1 件 seed → 起票者 (入力者) へ escalation-resolved 通知を初回 live に (F-017、resolution 確定で /escalations queue からは外れる)。
  const resolvedCase = cases['CASE-2026-0120']
  if (resolvedCase) {
    cases['CASE-2026-0120'] = {
      ...resolvedCase,
      escalation: { reason: '過去の住所表記との整合を確認依頼', category: '業務ルール抵触', to: 'actor-approver', from: DEFAULT_ACTOR_ID, resolution: 'proceed' },
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
      // PV2b: 口座振替登録 Agent (95% 達成) は昇格基準達成済 → 設定承認待ち (requested) を初回 seed し、
      //   業務責任者ハブ「設定承認」タイル / config-approvals を初回 live に (空タイル解消)。
      //   注: agent-account-opening は business-approver/w3-remediation test が「未申請」前提で使うため 'none' 維持。
      promotionStatus: row.id === 'agent-direct-debit' ? 'requested' : 'none',
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
