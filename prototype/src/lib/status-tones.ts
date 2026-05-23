import type { Tone } from '@/components/shared/StatusBadge'
import type { CaseStatus, ProposalStatus } from '@/data/types'

/**
 * Domain status → Tone semantic resolver (Day 14 P1.5 C3、Plan B-lite v2.6 / Review #1 F-01)
 *
 * StatusBadge primitive は domain-free (`tone: Tone` のみ受ける)、domain enum → tone の解決は本 lib で行う。
 * 呼び出し側 page (CaseReview / Inbox / ProposalReview / Dashboard 等) は `<StatusBadge tone={caseStatusToTone(c.status)} label={c.statusLabel} />` の形で使う。
 *
 * Tone semantic (StatusBadge.tsx と整合):
 * - `neutral`: slate (待機 / pending)
 * - `primary`: indigo (active / 進行中)
 * - `success`: emerald (完了 / 反映済)
 * - `alert`: amber (注意 / 承認待ち)
 * - `error`: red (差戻し / エラー)
 */

/** CaseStatus → Tone resolver (5 状態) */
export function caseStatusToTone(status: CaseStatus): Tone {
  switch (status) {
    case 'pending':
      return 'neutral'
    case 'ready':
      return 'primary'
    case 'sent-back':
      return 'error'
    case 'business-approval-waiting':
      return 'alert'
    case 'reflected':
      return 'success'
  }
}

/** ProposalStatus → Tone resolver (4 状態、Day 12 ProposalReview Hero 2 と整合) */
export function proposalStatusToTone(status: ProposalStatus): Tone {
  switch (status) {
    case 'pending-triage':
      return 'primary'
    case 'forwarded':
      return 'alert'
    case 'approved':
      return 'success'
    case 'rejected':
      return 'error'
  }
}
