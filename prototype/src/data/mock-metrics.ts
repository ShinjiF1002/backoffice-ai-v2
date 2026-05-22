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
