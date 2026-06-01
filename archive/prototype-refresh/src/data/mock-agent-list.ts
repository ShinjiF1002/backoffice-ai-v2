import type { TrustLevel } from './types'

/**
 * エージェント一覧 (Agents) mock — screen-contracts-v2 §7 / screens-v2/07-agents / mock-fixture §5
 * list 専用 view-model。承認率 [仮説/要検証]。trend は MiniTrend (CSS、SVG なし) 用の 0-100 配列。
 */
export interface AgentListRow {
  id: string
  name: string
  workflow: string
  trust: TrustLevel
  /** 直近 承認率 (表示用、[仮説/要検証]) */
  approvalRate: string
  /** 直近推移 (0-100、MiniTrend 用) */
  trend: number[]
  promotable: boolean
  /** 昇格可否の理由 (平易語) */
  promoteNote: string
}

export const AGENT_LIST: AgentListRow[] = [
  {
    id: 'agent-corporate-address-change',
    name: '法人住所変更 Agent',
    workflow: '法人住所変更',
    trust: 'supervised',
    approvalRate: '92%',
    trend: [88, 90, 89, 91, 90, 92, 92],
    promotable: false,
    promoteNote: '承認率が基準 (95%) に未達のため昇格は保留',
  },
  {
    id: 'agent-account-opening',
    name: '口座開設書類完備 Agent',
    workflow: '口座開設書類完備',
    trust: 'supervised',
    approvalRate: '96%',
    trend: [93, 94, 95, 95, 96, 96, 96],
    promotable: true,
    promoteNote: '直近の実績が基準を満たしています',
  },
]
