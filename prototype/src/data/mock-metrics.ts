/**
 * Mock metrics — Day 11 placeholder (light)
 * SSOT: docs/05-metrics-and-gates.md §3 SLO + §4 4 KPI + §5 7 KPI + §6 9 KRI
 *
 * 重要: 表示時は必ず `[仮説 / 要検証]` ラベル付き (Phase 1 hypothesis)。
 * 本 mock data は CaseReview 連動の minimum subset。Metrics page full 実装は Day 14-18。
 */

export interface KpiHypothesis {
  id: string
  name: string
  /** target hypothesis (e.g., "≥ 99%") */
  target: string
  /** 現在値 (mock) */
  current: string
  /** Sparkline trend (7-day、0-1) */
  trend: number[]
  /** [仮説 / 要検証] ラベル必須 */
  status: '仮説 / 要検証'
}

export const mockKpiHypotheses: KpiHypothesis[] = [
  {
    id: 'K1',
    name: 'AI 入力承認率',
    target: '≥ 99%',
    current: '98.4%',
    trend: [0.972, 0.975, 0.978, 0.981, 0.983, 0.984, 0.984],
    status: '仮説 / 要検証',
  },
  {
    id: 'K2',
    name: '人手上書き率',
    target: '≤ 1%',
    current: '1.2%',
    trend: [0.018, 0.016, 0.015, 0.014, 0.013, 0.012, 0.012],
    status: '仮説 / 要検証',
  },
  {
    id: 'K3',
    name: 'Alert 発生率',
    target: '≤ 5%',
    current: '4.7%',
    trend: [0.061, 0.058, 0.054, 0.051, 0.049, 0.048, 0.047],
    status: '仮説 / 要検証',
  },
  {
    id: 'K4',
    name: '承認者差戻し率',
    target: '≤ 1%',
    current: '0.8%',
    trend: [0.012, 0.011, 0.010, 0.009, 0.009, 0.008, 0.008],
    status: '仮説 / 要検証',
  },
]

/**
 * 業務別 7 日推移 (Dashboard card sparkline + 件数推移 表示用)。
 *
 * Day 12 Page 3 (Dashboard) 追加。値はすべて wireframe placeholder = `[仮説 / 要検証]`、Phase 1 で実値検証。
 * 国際送金 (restricted boundary pack) は表示対象外のため本 mock にも含めない。
 */
export interface WorkflowTrend {
  workflowId: string
  /** 7 日推移 (日次 case 件数の正規化、0-1)、Dashboard sparkline 用 [仮説 / 要検証] */
  caseVolume7Day: number[]
  /** 7 日推移 (日次 alert 発生率、0-1)、Dashboard 補助 sparkline 候補 [仮説 / 要検証] */
  alertRatio7Day: number[]
}

export const mockWorkflowTrends: WorkflowTrend[] = [
  {
    workflowId: 'UC-BO-01',
    caseVolume7Day: [0.62, 0.65, 0.78, 0.72, 0.81, 0.74, 0.76],
    alertRatio7Day: [0.18, 0.22, 0.25, 0.21, 0.28, 0.24, 0.20],
  },
  {
    workflowId: 'UC-BO-02',
    caseVolume7Day: [0.42, 0.48, 0.55, 0.61, 0.52, 0.45, 0.48],
    alertRatio7Day: [0.40, 0.45, 0.50, 0.60, 0.65, 0.70, 0.75],
  },
]

/** Get workflow trend by ID (mock helper) */
export function getWorkflowTrend(workflowId: string): WorkflowTrend | undefined {
  return mockWorkflowTrends.find((t) => t.workflowId === workflowId)
}
