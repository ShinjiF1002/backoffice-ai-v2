import type { Tone } from '@/components/shared/StatusBadge'
import type { ReconcileState } from '@/data/types'

/**
 * Reconcile data 状態 → UI 表示の resolver (canonical-design-spec §3-4)
 *
 * 「内部語を画面に出さない」契約を型で担保: data enum (`ReconcileState`) は code 専用、
 * UI に出すのは本 resolver が返す label のみ。`normalized_match` は UI 上「一致」に集約
 * (内部語「正規化」を operator 画面に出さない)。補正があった旨は normalizationNote で控えめに表現。
 */

/** data 状態 → UI 表示ラベル (正規化一致 → 「一致」に集約) */
export function reconcileStateLabel(state: ReconcileState): string {
  switch (state) {
    case 'matched':
    case 'normalized_match':
      return '一致'
    case 'needs_review':
      return '要確認'
    case 'not_extracted':
      return '未取得'
    case 'manually_confirmed':
      return '確認済'
    case 'escalated':
      return 'エスカレーション'
  }
}

/** data 状態 → tone (canonical-design-spec §4) */
export function reconcileStateTone(state: ReconcileState): Tone {
  switch (state) {
    case 'matched':
    case 'normalized_match':
      return 'success'
    case 'needs_review':
      return 'alert'
    case 'not_extracted':
      return 'inset'
    case 'manually_confirmed':
      return 'primary'
    case 'escalated':
      return 'error'
  }
}

/** 承認 gate: 要確認 / 未取得 が残っていると承認不可 (reconcile-panel-spec §3) */
export function isResolved(state: ReconcileState): boolean {
  return state !== 'needs_review' && state !== 'not_extracted'
}
