import { cn } from '@/lib/cn'

/**
 * StatusBadge — domain-free chip primitive
 * SSOT: docs/03-ui-prototype-design.md §2.7.4 UI label SSOT
 *
 * Day 14 P1.5 C3 (Plan B-lite v2.6 / Review #1 F-01 + F-03):
 * - `case/` → `shared/` 移設 (Inbox / Dashboard / Metrics / SendBackComment / ProposalReview / CaseReview の 6 page で再利用)
 * - `status: CaseStatus` (domain enum) → `tone: Tone` (semantic) refactor
 * - domain enum → tone の resolve は呼び出し側 (`@/lib/status-tones`) で行う、本 component は domain non-aware
 *
 * Japanese label only (component name leak 禁止、`label` prop で受ける)。
 */

// tone v2 (canonical-design-spec §3.1): neutral は prototype 互換、inset/slate は v2 拡張
export type Tone = 'neutral' | 'inset' | 'slate' | 'primary' | 'success' | 'alert' | 'error'

interface Props {
  /** Color semantic (Day 14 P1.5 C3、status から tone semantic に refactor) */
  tone: Tone
  /** 表示文言 (日本語、`status` enum 値ではない) */
  label: string
  /** 追加 className (例: `font-mono tabular`、size 上書き) */
  className?: string
}

const TONE_CLASS: Record<Tone, string> = {
  neutral: 'bg-[var(--color-panel-inset)] text-[var(--color-fg-muted)]',
  inset: 'bg-[var(--color-panel-inset)] text-[var(--color-fg)]',
  slate: 'bg-[var(--color-fg)] text-white',
  primary: 'bg-[var(--color-primary-soft)] text-[var(--color-primary)]',
  success: 'bg-[var(--color-success-soft)] text-[var(--color-success-soft-fg)]',
  alert: 'bg-[var(--color-alert-soft)] text-[var(--color-alert-soft-fg)]',
  error: 'bg-[var(--color-error-soft)] text-[var(--color-error-soft-fg)]',
}

export function StatusBadge({ tone, label, className }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-[var(--radius-chip)] px-2 py-0.5 text-xs font-medium',
        TONE_CLASS[tone],
        className
      )}
    >
      {label}
    </span>
  )
}
