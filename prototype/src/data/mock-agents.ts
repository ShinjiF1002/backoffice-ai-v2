import type { TrustLevel, RiskLevel, AutomationStatus } from './types'

/**
 * Mock agents — Day 11 placeholder (light、AgentSettings page で Day 14-18 拡充)
 * SSOT: docs/_SSOT.md §1.1 enum + workflows/_index.md (3 業務並列、Trust Level Progression)
 *
 * 国際送金 (restricted) は UI 対象外、本 mock data に含めない (docs/00 §2.1)。
 */

export interface AgentRecord {
  id: string
  name: string
  workflowId: string
  trustLevel: TrustLevel
  riskLevel: RiskLevel
  automationStatus: AutomationStatus
  version: string
  modelLabel: string
}

export const mockAgents: AgentRecord[] = [
  {
    id: 'agent-corporate-address-change',
    name: '法人住所変更 Agent',
    workflowId: 'UC-BO-01',
    trustLevel: 'supervised',
    riskLevel: 'medium',
    automationStatus: 'active',
    version: 'v0.1',
    modelLabel: 'AI ベースモデル A (mock)',
  },
  {
    id: 'agent-account-opening',
    name: '口座開設書類完備 Agent',
    workflowId: 'UC-BO-02',
    trustLevel: 'supervised',
    riskLevel: 'medium',
    automationStatus: 'active',
    version: 'v0.1',
    modelLabel: 'AI ベースモデル A (mock)',
  },
]
