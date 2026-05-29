import type { Tone } from '@/components/shared/StatusBadge'
import type { CaseStatus, ProposalStatus } from '@/data/types'

/**
 * Domain status → Tone semantic resolver (Day 14 P1.5 C3、Plan B-lite v2.6 / Review #1 F-01)
 *
 * StatusBadge primitive は domain-free (`tone: Tone` のみ受ける)、domain enum → tone の解決は本 lib で行う。
 * 呼び出し側 page (CaseReview / Inbox / ProposalReview / Dashboard 等) は `<StatusBadge tone={caseStatusToTone(c.status)} label={c.statusLabel} />` の形で使う。
 *
 * Tone semantic v2 (canonical-design-spec §4、screens-v2 parity に再定義):
 * - `inset`:   中立 / 受付 / system
 * - `primary`: 進行中 / 確認待ち / AI
 * - `slate`:   次段待ち (承認待ち / 上長へ送付済、solid fill)
 * - `alert`:   要対応 / 人手介在 (要確認 / 差戻し再処理)
 * - `success`: 完了 / 良好 (反映済 / 承認済)
 * - `error`:   重大 / エスカレーション
 *
 * ※ prototype/ (lock) の旧 resolver とは値が異なる (差戻し error→alert / 承認待ち alert→slate / 受付 neutral→inset)。
 *   本 prototype-redesign は screens-v2 pixel-parity に合わせる。
 */

/** CaseStatus → Tone resolver (5 状態、v2) */
export function caseStatusToTone(status: CaseStatus): Tone {
  switch (status) {
    case 'pending':
      return 'inset'
    case 'ready':
      return 'primary'
    case 'sent-back':
      return 'alert'
    case 'business-approval-waiting':
      return 'slate'
    case 'reflected':
      return 'success'
  }
}

/** ProposalStatus → Tone resolver (4 状態、v2) */
export function proposalStatusToTone(status: ProposalStatus): Tone {
  switch (status) {
    case 'pending-triage':
      return 'primary'
    case 'forwarded':
      return 'slate'
    case 'approved':
      return 'success'
    case 'rejected':
      return 'inset'
  }
}

/** CaseStatus → UI 業務語ラベル (status enum literal を画面に出さない) */
export function caseStatusLabel(status: CaseStatus): string {
  switch (status) {
    case 'pending':
      return '受付済'
    case 'ready':
      return '確認待ち'
    case 'sent-back':
      return '差戻し再処理'
    case 'business-approval-waiting':
      return '承認待ち'
    case 'reflected':
      return '反映済'
  }
}

/** ProposalStatus → UI 業務語ラベル */
export function proposalStatusLabel(status: ProposalStatus): string {
  switch (status) {
    case 'pending-triage':
      return '確認待ち'
    case 'forwarded':
      return '上長へ送付済'
    case 'approved':
      return '承認済'
    case 'rejected':
      return '却下'
  }
}
