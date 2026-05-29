import type { CaseStatus } from './types'

/**
 * Hub (/) data — Process-First v2, typology A (全体俯瞰、単一決定面なし)
 * SSOT: mock-fixture §3 (status 分布) + §5 (metric)、reference: screens-v2/01-hub/hub.jsx。
 * status は CaseStatus enum で保持し、表示は lib/status-tones.ts の resolver で業務語化 (UI に enum を出さない)。
 * drill 先は実 route (to) で保持 — reference の href="#" no-op を React 実装で実接続する。
 */
export interface HubProcess {
  id: string
  name: string
  icon: 'building' | 'wallet'
  trustLabel: string // 業務語 主 (全件確認)
  trustEn: string // Tier 補助 chip (Supervised)
  approvalRate: number | null
  approvalRateOk: boolean | null
  /** CaseStatus 別件数。表示ラベル/tone は status-tones resolver 経由 */
  dist: Partial<Record<CaseStatus, number>>
  total: number
  /** drill: Agent 設定 (/agents または /agents/:id) */
  agentTo: string
}

export interface HubHeadlineKpi {
  key: string
  label: string
  icon: 'alert' | 'clock' | 'inbox'
  tone: 'alert' | 'primary'
  total: number
  breakdown: { name: string; n: number }[]
  drill: string
  /** クリック先の実 route */
  to: string
  /** 仮説値 (SLA 等) は [仮説 / 要検証] chip を付ける */
  hypothetical: boolean
}

export interface HubPrimaryAction {
  kicker: string // 最優先のアクション
  title: string
  detail: string
  to: string // /approvals
}

export interface HubDailySummary {
  intake: number
  reflected: number
  sentBack: number
}

export const HUB_PROCESSES: HubProcess[] = [
  {
    id: 'UC-BO-01',
    name: '法人住所変更',
    icon: 'building',
    trustLabel: '全件確認',
    trustEn: 'Supervised',
    approvalRate: 92,
    approvalRateOk: false,
    dist: { pending: 2, ready: 3, 'sent-back': 1, 'business-approval-waiting': 1, reflected: 1 },
    total: 8,
    agentTo: '/agents/agent-corporate-address-change',
  },
  {
    id: 'UC-BO-02',
    name: '口座開設書類完備',
    icon: 'wallet',
    trustLabel: '全件確認',
    trustEn: 'Supervised',
    approvalRate: null,
    approvalRateOk: null,
    dist: { pending: 1, ready: 2, 'business-approval-waiting': 1, reflected: 1 },
    total: 5,
    agentTo: '/agents',
  },
]

// Headline KPI — §3 から導出した値を明示保持 (要対応の注意 = 確認待ち+差戻し再処理 / 承認待ち = business-approval-waiting)
export const HUB_HEADLINE: HubHeadlineKpi[] = [
  {
    key: 'attention',
    label: '要対応の注意',
    icon: 'alert',
    tone: 'alert',
    total: 6,
    breakdown: [
      { name: '法人住所変更', n: 4 },
      { name: '口座開設書類完備', n: 2 },
    ],
    drill: '確認待ち・差戻し再処理の案件を見る',
    to: '/cases',
    hypothetical: false,
  },
  {
    key: 'sla',
    label: 'SLA 経過',
    icon: 'clock',
    tone: 'alert',
    total: 1,
    breakdown: [
      { name: '法人住所変更', n: 1 },
      { name: '口座開設書類完備', n: 0 },
    ],
    drill: '経過時間の長い案件を見る',
    to: '/cases',
    hypothetical: true,
  },
  {
    key: 'approval',
    label: '承認待ち',
    icon: 'inbox',
    tone: 'primary',
    total: 2,
    breakdown: [
      { name: '法人住所変更', n: 1 },
      { name: '口座開設書類完備', n: 1 },
    ],
    drill: '承認待ちの案件を見る',
    to: '/approvals',
    hypothetical: false,
  },
]

export const HUB_PRIMARY_ACTION: HubPrimaryAction = {
  kicker: '最優先のアクション',
  title: '法人住所変更の承認待ち 1 件を確認',
  detail: '入力者確認が完了し、承認者の最終承認を待っています',
  to: '/approvals',
}

export const HUB_DAILY_SUMMARY: HubDailySummary = {
  intake: 13,
  reflected: 2,
  sentBack: 1,
}
