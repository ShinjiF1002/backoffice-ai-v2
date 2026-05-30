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
  /** この提案が改定対象とする Agent (remediation B2: proposal→agent 双方向 link の片側、AGENT_DETAILS.relatedProposals と対称)。 */
  agentId: string
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
  agentId: 'agent-corporate-address-change',
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

// ──────────────────────────────────────────────────────────────────────────
// Phase 4a — id-keyed detail dict。PROPOSAL_LIST 全 3 件を網羅 (PROP_2026_031 温存)。
// list が小さいため factory ではなく literal で 2 件追加。sourceCases は実在 case id に link。
// ──────────────────────────────────────────────────────────────────────────

/** 法人名の表記ゆれ補正 (上長へ送付済)。 */
export const PROP_2026_028: ProposalDetailModel = {
  id: 'PROP-2026-028',
  workflow: '法人住所変更',
  agentId: 'agent-corporate-address-change',
  changeTitle: '法人名の表記ゆれ補正ルールを追加',
  status: 'forwarded',
  criteria: [
    { metricLabel: '法人名の表記ゆれ検出精度', actualValue: '0.95', threshold: '> 0.90', judgment: '達成 (+0.05)', achieved: true, period: '直近 30 日', denominator: '7 件で試算', previousDelta: '前回 +0.02', exclusions: 'エスカレーション案件を除く' },
    { metricLabel: '影響件数', actualValue: '7 件', threshold: '≤ 20 件', judgment: '達成 (余裕 13 件)', achieved: true, period: '過去案件で試算', denominator: '7 件' },
  ],
  consequence: {
    before: '表記ゆれ補正 なし',
    after: '表記ゆれ補正 あり',
    scope: '法人住所変更の法人名照合、過去 7 件で試算',
    impacts: [
      { direction: 'down', label: '全角・半角や旧字体の揺れによる誤った差戻しが減る' },
      { direction: 'up', label: '補正ルールの保守対象が増える' },
      { direction: 'guard', label: '非遡及: すでに承認済みの案件には適用しない' },
    ],
  },
  procedureSteps: [
    { n: 1, text: '申請書類を受け付ける' },
    { n: 2, text: 'AI が法人名欄を読み取る' },
    {
      n: 3,
      text: '読み取り結果を登録情報と照合する',
      changed: true,
      before: '表記をそのまま完全一致で照合',
      after: '全角半角・旧字体の揺れを補正してから照合',
    },
    { n: 4, text: '一致しなければ入力者の要確認へ振り分ける' },
    { n: 5, text: '入力者が確認し、承認または差戻しする' },
  ],
  sourceCases: [
    { id: 'CASE-2026-0131', field: '法人名', comment: '旧商号の表記が登録情報と全角半角で異なり、要確認に回された。実体は同一法人で、補正できれば自動確定できた。', date: '2026-05-20' },
    { id: 'CASE-2026-0118', field: '法人名', comment: '「髙」と「高」の旧字体差で不一致判定。人手で同一と確認した。補正対象にすべき類型。', date: '2026-05-15' },
    { id: 'CASE-2026-0106', field: '法人名', comment: '「株式会社」の前後位置の違いで不一致。表記補正で吸収できる。', date: '2026-05-11' },
  ],
  queueOwner: '佐藤',
  approver: '田中部長',
}

/** 本人確認書類の有効期限チェック (承認済)。 */
export const PROP_2026_024: ProposalDetailModel = {
  id: 'PROP-2026-024',
  workflow: '口座開設書類完備',
  agentId: 'agent-account-opening',
  changeTitle: '本人確認書類の有効期限チェックを追加',
  status: 'approved',
  criteria: [
    { metricLabel: '期限切れ書類の検出率', actualValue: '0.98', threshold: '> 0.95', judgment: '達成 (+0.03)', achieved: true, period: '直近 30 日', denominator: '19 件で試算', previousDelta: '前回 +0.01', exclusions: 'エスカレーション案件を除く' },
    { metricLabel: '影響件数', actualValue: '19 件', threshold: '≤ 25 件', judgment: '達成 (余裕 6 件)', achieved: true, period: '過去案件で試算', denominator: '19 件' },
  ],
  consequence: {
    before: '有効期限チェック なし',
    after: '有効期限チェック あり',
    scope: '口座開設書類完備の本人確認、過去 19 件で試算',
    impacts: [
      { direction: 'down', label: '期限切れ書類の見逃しが減る' },
      { direction: 'up', label: '期限間近の書類で要確認が増える可能性' },
      { direction: 'guard', label: '非遡及: すでに承認済みの案件には適用しない' },
    ],
  },
  procedureSteps: [
    { n: 1, text: '申請書類を受け付ける' },
    { n: 2, text: 'AI が本人確認書類を読み取る' },
    {
      n: 3,
      text: '記載事項の完備を確認する',
      changed: true,
      before: '記載項目の有無のみ確認',
      after: '記載項目に加えて有効期限の残存を確認',
    },
    { n: 4, text: '不備があれば入力者の要確認へ振り分ける' },
    { n: 5, text: '入力者が確認し、承認または差戻しする' },
  ],
  sourceCases: [
    { id: 'CASE-2026-0112', field: '本人確認書類', comment: '運転免許証の有効期限が切れていたが完備扱いになっていた。期限チェックが必要。', date: '2026-05-19' },
    { id: 'CASE-2026-0104', field: '本人確認書類', comment: '在留カードの期限が翌週で、更新確認が漏れた。', date: '2026-05-12' },
    { id: 'CASE-2026-0101', field: '本人確認書類', comment: 'パスポートの残存期間不足を見逃した。', date: '2026-05-09' },
  ],
  queueOwner: '高橋',
  approver: '渡辺部長',
}

/** id-keyed dict。PROPOSAL_LIST 全 id を網羅。 */
export const PROPOSAL_DETAILS: Record<string, ProposalDetailModel> = {
  'PROP-2026-031': PROP_2026_031,
  'PROP-2026-028': PROP_2026_028,
  'PROP-2026-024': PROP_2026_024,
}
