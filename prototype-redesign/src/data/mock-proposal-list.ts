import type { ProposalStatus } from './types'

/**
 * 提案一覧 (Proposals) mock — screen-contracts-v2 §5 / screens-v2/05-proposals / mock-fixture §6
 * list 専用 view-model: 平易語のみ (旧 mock-proposals の OCR/threshold 等 内部語は使わない)。
 * 「日次提案分析」が差戻しパターンから生成した改定候補。cron/trigger 表記なし。
 */
export interface ProposalListRow {
  id: string
  workflow: string
  /** どの部分の改定か (平易語) */
  changeArea: string
  /** 影響件数 (過去 case 相当) */
  impactCount: number
  status: ProposalStatus
}

export const PROPOSAL_LIST: ProposalListRow[] = [
  { id: 'PROP-2026-031', workflow: '法人住所変更', changeArea: '住所読み取りの判定基準を厳しめに調整', impactCount: 12, status: 'pending-triage' },
  { id: 'PROP-2026-028', workflow: '法人住所変更', changeArea: '法人名の表記ゆれ補正ルールを追加', impactCount: 7, status: 'forwarded' },
  { id: 'PROP-2026-024', workflow: '口座開設書類完備', changeArea: '本人確認書類の有効期限チェックを追加', impactCount: 19, status: 'approved' },
]
