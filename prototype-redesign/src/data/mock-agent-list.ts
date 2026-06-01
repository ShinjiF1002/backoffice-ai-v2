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
  // PV2a (2026-06-01) 新業務 Agent ×3。カード再発行は checkpoint = trust 多様性。
  {
    id: 'agent-direct-debit',
    name: '口座振替登録 Agent',
    workflow: '口座振替登録',
    trust: 'supervised',
    approvalRate: '95%',
    trend: [92, 93, 93, 94, 94, 95, 95],
    promotable: true,
    promoteNote: '直近の実績が基準を満たしています',
  },
  {
    id: 'agent-corp-notification',
    name: '改印・代表者変更届 Agent',
    workflow: '改印・代表者変更届',
    trust: 'supervised',
    approvalRate: '93%',
    trend: [90, 91, 92, 92, 93, 93, 93],
    promotable: false,
    promoteNote: '承認率が基準 (95%) に未達のため昇格は保留',
  },
  {
    id: 'agent-card-reissue',
    name: 'カード再発行 Agent',
    workflow: 'カード再発行',
    trust: 'checkpoint',
    approvalRate: '97%',
    trend: [95, 96, 96, 96, 97, 97, 97],
    promotable: false,
    promoteNote: '要所確認レベルで安定運用中（次段階は追加検証後）',
  },
]
