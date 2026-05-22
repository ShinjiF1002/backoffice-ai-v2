/**
 * Mock metrics — Day 12 Page 6 拡張 (Metrics wireframe 用)
 * SSOT: docs/05-metrics-and-gates.md §3 SLO + §4 4 KPI + §5 7 KPI + §6 9 KRI
 *
 * 重要: 表示時は必ず `[仮説 / 要検証]` ラベル付き (Phase 1 hypothesis)。
 * 4 KPI gate (mockKpiHypotheses) + 7 KPI 補助 (mockAuxiliaryKpis K5-K7) + 9 KRI (mockKriCatalogue R1-R9) + 業務別 trend (mockWorkflowTrends)。
 * AgentSettings は mockKpiHypotheses を import で再利用 (CR R40 M5 closure、KPI label/target drift 防止)。
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

/**
 * 7 KPI catalogue の補助 KPI (K5-K7)、Metrics page で 4 KPI gate 下の補助 row として表示
 * SSOT: docs/05-metrics-and-gates.md §5
 */
export interface AuxiliaryKpi {
  id: string
  name: string
  /** target hypothesis (e.g., "≥ 70%" / "業務別に定義") */
  target: string
  /** 現在値 (mock) */
  current: string
  /** 内容 description */
  description: string
  /** [仮説 / 要検証] ラベル必須 */
  status: '仮説 / 要検証'
}

export const mockAuxiliaryKpis: AuxiliaryKpi[] = [
  {
    id: 'K5',
    name: '案件平均処理時間',
    target: '業務別に定義',
    current: '2 時間 24 分',
    description: 'AI 入力開始 → 承認者承認完了までの平均時間',
    status: '仮説 / 要検証',
  },
  {
    id: 'K6',
    name: '手順承認 昇格成功率',
    target: '≥ 70%',
    current: '68%',
    description: '差戻しコメントから生成された AI 提案が業務責任者に承認される率',
    status: '仮説 / 要検証',
  },
  {
    id: 'K7',
    name: '未承認ナレッジ整理時間',
    target: '当日中',
    current: '8 時間',
    description: '未承認ナレッジ生成 → 手順管理者 整理 開始までの平均時間',
    status: '仮説 / 要検証',
  },
]

/**
 * 9 KRI catalogue (Key Risk Indicator) — 異常検知 trigger
 * SSOT: docs/05-metrics-and-gates.md §6
 *
 * state は mock 表示用 (normal / caution / warning)、Phase 1 で実測値接続。
 */
export type KriState = 'normal' | 'caution' | 'warning'

export interface KriCatalogueEntry {
  id: string
  name: string
  /** trigger 条件 (1-line summary) */
  triggerCondition: string
  /** 対応 (response action summary) */
  responseAction: string
  /** mock 現在 state */
  state: KriState
  /** [仮説 / 要検証] ラベル必須 */
  status: '仮説 / 要検証'
}

export const mockKriCatalogue: KriCatalogueEntry[] = [
  {
    id: 'R1',
    name: 'AI 入力承認率 推移悪化',
    triggerCondition: '週次平均が target (≥ 99%) を 2 週連続 下回り',
    responseAction: '手順管理者 通知、AI 管理者 review',
    state: 'normal',
    status: '仮説 / 要検証',
  },
  {
    id: 'R2',
    name: '人手上書き率 急増',
    triggerCondition: '日次平均が target (≤ 1%) を 3 倍以上 超過',
    responseAction: '手順管理者 通知 + Forced Downgrade 検討',
    state: 'normal',
    status: '仮説 / 要検証',
  },
  {
    id: 'R3',
    name: 'Alert 誤検知 急増',
    triggerCondition: 'Alert 精度 (precision) が週次で 50% 下回り',
    responseAction: '承認方針の Alert 条件 review trigger',
    state: 'caution',
    status: '仮説 / 要検証',
  },
  {
    id: 'R4',
    name: '承認者差戻し率 急上昇',
    triggerCondition: '週次平均が target (≤ 1%) を 5 倍以上 超過',
    responseAction: '業務責任者 通知 + Forced Downgrade 検討',
    state: 'normal',
    status: '仮説 / 要検証',
  },
  {
    id: 'R5',
    name: 'UI 変更 検知',
    triggerCondition: '業務システム画面 layout 変更による操作失敗',
    responseAction: 'AI 管理者 通知 + Agent 指示書 review',
    state: 'normal',
    status: '仮説 / 要検証',
  },
  {
    id: 'R6',
    name: '承認済 / 未承認 ナレッジの 矛盾',
    triggerCondition: '同一業務内で 承認済 と 未承認 が矛盾',
    responseAction: '手順管理者 整理 強制',
    state: 'normal',
    status: '仮説 / 要検証',
  },
  {
    id: 'R7',
    name: '同種差戻し 再発頻度',
    triggerCondition: '同一案件 ID で 2 回以上 差戻し',
    responseAction: '手順管理者 + AI 管理者 通知',
    state: 'normal',
    status: '仮説 / 要検証',
  },
  {
    id: 'R8',
    name: 'Agent 版数 旧版発生',
    triggerCondition: '提案ソース AI が 旧 Agent 版数 で生成',
    responseAction: 'AI 管理者 通知、Agent 版数 強制 upgrade',
    state: 'normal',
    status: '仮説 / 要検証',
  },
  {
    id: 'R9',
    name: 'データ品質 低下',
    triggerCondition: '入力誤り 分類 差戻しが 週次平均で 2 倍以上 増加',
    responseAction: '入力 PDF 受領元への 連絡経路 review trigger',
    state: 'normal',
    status: '仮説 / 要検証',
  },
]

/** Get KRI by ID (mock helper) */
export function getKriById(id: string): KriCatalogueEntry | undefined {
  return mockKriCatalogue.find((k) => k.id === id)
}
