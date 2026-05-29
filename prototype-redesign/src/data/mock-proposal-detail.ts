import type { ProposalStatus } from './types'
import type { MetricRow } from '@/components/cross-cutting/MetricVsThreshold'
import type { ConsequenceImpact } from '@/components/cross-cutting/ConsequencePanel'

/**
 * 提案詳細 (PROP-2026-031) detail 専用 model
 * SSOT: mock-fixture §6 / §10、reference: screens-v2/06-proposal-detail/proposal-detail.jsx。
 * 平易 JP、旧 mock-proposals の内部語 (OCR raw / staging / threshold) は使わない。
 * 原則 A: 手順全体の中で変更 1 箇所を before/after で示す / B: 根拠 差戻し case 原文 / C: mode 出し分け。
 */
export interface ProcedureStep {
  n: number
  text: string
  /** 改定で変わる step。changed の時のみ before/after を持つ */
  changed?: boolean
  before?: string
  after?: string
}
export interface SourceCase {
  id: string
  /** どの項目で起きたか */
  field: string
  /** 差戻しコメント原文 (要約でなく) */
  comment: string
  date: string
}

export interface ProposalDetailModel {
  id: string
  workflow: string
  changeTitle: string
  status: ProposalStatus
  criteria: MetricRow[]
  consequence: { before: string; after: string; scope: string; impacts: ConsequenceImpact[] }
  /** 原則 A: 手順全体 (5 step)。changed step のみ before/after を持つ */
  procedureSteps: ProcedureStep[]
  sourceCases: SourceCase[]
  queueOwner: string // Manual 管理者
  approver: string // 業務責任者
}

export const PROP_2026_031: ProposalDetailModel = {
  id: 'PROP-2026-031',
  workflow: '法人住所変更',
  changeTitle: '住所読み取りの判定基準を厳しめに調整',
  status: 'pending-triage',
  // 判定基準 vs 実測 (mock-fixture §6 / reference METRIC_ROWS)
  criteria: [
    { metricLabel: '番地表記の読み取り精度', actualValue: '0.93', threshold: '> 0.90', judgment: '達成 (+0.03)', achieved: true, period: '直近 30 日', denominator: '12 件で試算', previousDelta: '前回 +0.01', exclusions: 'エスカレーション案件を除く' },
    { metricLabel: '影響件数', actualValue: '12 件', threshold: '≤ 20 件', judgment: '達成 (余裕 8 件)', achieved: true, period: '過去案件で試算', denominator: '12 件' },
  ],
  consequence: {
    before: '判定基準 現行',
    after: '判定基準 厳しめ',
    scope: '法人住所変更の住所読み取り、過去 12 件で試算',
    impacts: [
      { direction: 'down', label: '誤って自動確定してしまう見逃しが減る' },
      { direction: 'up', label: '人の要確認が増える可能性 (過剰な要確認のリスク)' },
      { direction: 'guard', label: '非遡及: すでに承認済みの案件には適用しない' },
    ],
  },
  // 原則 A: 手順全体 (5 step) の中で changed step (3) を before/after で示す
  procedureSteps: [
    { n: 1, text: '申請書類を受け付ける' },
    { n: 2, text: 'AI が住所欄を読み取る' },
    {
      n: 3,
      text: '読み取り結果を判定基準と照合する',
      changed: true,
      before: '判定基準が現行のとき、基準以上を自動確定・未満を要確認に振り分け',
      after: '判定基準を厳しめにし、より多くを入力者の要確認に回す',
    },
    { n: 4, text: '自動確定、または入力者の確認へ振り分ける' },
    { n: 5, text: '入力者が確認し、承認または差戻しする' },
  ],
  // 原則 B: 根拠となった差戻し case の原文コメント
  sourceCases: [
    { id: 'CASE-2026-0098', field: 'ビル名', comment: 'ビル名が申請書類と異なっていたが、自動確定されていた。「サンプルビルディング」が正しい。判定基準が甘く見逃された。', date: '2026-05-22' },
    { id: 'CASE-2026-0087', field: '新住所', comment: '番地の枝番 (2-3-5 の「5」) が欠落したまま自動確定。読み取りが微妙な精度だったが基準を超えて確定していた。', date: '2026-05-18' },
    { id: 'CASE-2026-0079', field: 'ビル名', comment: 'カナ表記の揺れを誤読。要確認に回すべきだったが自動確定された。基準引き上げで防げる類型。', date: '2026-05-14' },
  ],
  queueOwner: '佐藤',
  approver: '田中部長',
}
