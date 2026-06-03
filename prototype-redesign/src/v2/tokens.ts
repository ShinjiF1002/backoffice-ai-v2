import { CheckIcon, AlertTriangleIcon, ClockIcon, CircleIcon } from 'lucide-react'
import type { Tone } from '@/components/shared/StatusBadge'
import type { ApprovalType } from '@/data/types'

/**
 * v2 非 component helper (component file から分離 = react-refresh 規律)。
 * status→tone は lib/status-tones SSOT を再利用、ここでは tone→class / tone→glyph を解決する。
 */

/** tone → soft badge class (3 重符号の色面)。 */
export function statusBadgeCls(t: Tone): string {
  switch (t) {
    case 'primary':
      return 'border-[var(--v2-accent-soft-border)] bg-[var(--v2-accent-soft)] text-[var(--v2-accent-soft-fg)]'
    case 'success':
      return 'border-[var(--v2-success-soft-border)] bg-[var(--v2-success-soft)] text-[var(--v2-success-soft-fg)]'
    case 'alert':
      return 'border-[var(--v2-alert-soft-border)] bg-[var(--v2-alert-soft)] text-[var(--v2-alert-soft-fg)]'
    case 'error':
      return 'border-[var(--v2-error-soft-border)] bg-[var(--v2-error-soft)] text-[var(--v2-error-soft-fg)]'
    case 'slate':
      return 'border-[var(--v2-border-strong)] bg-[var(--v2-panel-inset)] text-[var(--v2-fg)]'
    default:
      return 'border-[var(--v2-border)] bg-[var(--v2-panel-inset)] text-[var(--v2-fg-tertiary)]'
  }
}

/**
 * tone → glyph の静的 map (3 重符号の記号)。
 * render 中に component を生成しない (react-hooks/static-components) ため、関数でなく静的 map で持つ。
 */
export const STATUS_GLYPH: Record<Tone, typeof CheckIcon> = {
  success: CheckIcon,
  alert: AlertTriangleIcon,
  error: AlertTriangleIcon,
  primary: ClockIcon,
  slate: ClockIcon,
  inset: CircleIcon,
  neutral: CircleIcon,
}

/**
 * tone → soft bg / fg を別々に要する場面 (notification icon 等、bg+icon fg) の shared map。
 * statusBadgeCls は border+bg+text 一体ゆえ、icon 用に bg/fg を分離して持つ (screen-local 再宣言を避ける)。
 */
export const TONE_SOFT_BG: Record<Tone, string> = {
  primary: 'bg-[var(--v2-accent-soft)]',
  success: 'bg-[var(--v2-success-soft)]',
  alert: 'bg-[var(--v2-alert-soft)]',
  error: 'bg-[var(--v2-error-soft)]',
  slate: 'bg-[var(--v2-panel-inset)]',
  inset: 'bg-[var(--v2-panel-inset)]',
  neutral: 'bg-[var(--v2-panel-inset)]',
}
export const TONE_SOFT_FG: Record<Tone, string> = {
  primary: 'text-[var(--v2-accent-soft-fg)]',
  success: 'text-[var(--v2-success-soft-fg)]',
  alert: 'text-[var(--v2-alert-soft-fg)]',
  error: 'text-[var(--v2-error-soft-fg)]',
  slate: 'text-[var(--v2-fg)]',
  inset: 'text-[var(--v2-fg-tertiary)]',
  neutral: 'text-[var(--v2-fg-tertiary)]',
}

/** 設定承認の種別 (ApprovalType A/B/C) → tone / 業務語ラベル (screen-local 再宣言を避ける)。 */
export const CONFIG_TYPE_TONE: Record<ApprovalType, Tone> = { A: 'inset', B: 'alert', C: 'primary' }
export const CONFIG_TYPE_LABEL: Record<ApprovalType, string> = { A: '通常', B: 'セキュリティ', C: '自律度変更' }
