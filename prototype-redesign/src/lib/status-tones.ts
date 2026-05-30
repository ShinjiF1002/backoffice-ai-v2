import type { Tone } from '@/components/shared/StatusBadge'
import type { CaseStatus, ProposalStatus, TrustLevel } from '@/data/types'

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

/**
 * 案件の実行結果 tone (裏付け sample / 実績行の MetaChip 用、success|alert の 2 値 projection)。
 * caseStatusToTone の業務語意味論を踏襲し「AI が人手介在なく確定 = success / 人手介在・未完 = alert」に圧縮する。
 *   - reflected (反映済) ・ ready かつ要確認0 (自動入力で確定) → success
 *   - sent-back (差戻し) ・ ready かつ要確認あり ・ pending ・ business-approval-waiting → alert (人手の確認/介在)
 * remediation B2: 各 sample の手書き個別 tone を排し、status-tones SSOT で一元導出して tone drift を封じる。
 */
export function caseResultTone(status: CaseStatus, flags: number): Extract<Tone, 'success' | 'alert'> {
  if (status === 'reflected') return 'success'
  if (status === 'ready' && flags === 0) return 'success'
  return 'alert'
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

/**
 * TrustLevel → Tone resolver (W0、literal tone 撲滅の SSOT)。
 * 信頼度の段階を tone semantic v2 に写像する: 全件確認=慎重(inset) / 要所確認=進行(primary) / 自律=良好(success)。
 * trust chip の画面ローカル `tone="primary"` 固定 (Agents/Hub/AgentDetail) を本 resolver に寄せるのは W1 per-screen refine。
 */
export function trustTone(level: TrustLevel): Tone {
  switch (level) {
    case 'supervised':
      return 'inset'
    case 'checkpoint':
      return 'primary'
    case 'autonomous':
      return 'success'
    case 'n/a':
      return 'neutral'
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
