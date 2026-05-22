import { cn } from '@/lib/cn'
import type { CaseStatus } from '@/data/types'

/**
 * StatusBadge — case status indicator
 * SSOT: docs/03-ui-prototype-design.md §2.7.4 UI label SSOT
 *
 * Japanese label only (component name leak 禁止)
 */

interface Props {
  status: CaseStatus
  label: string
}

export function StatusBadge({ status, label }: Props) {
  const semantic = {
    pending: 'bg-slate-100 text-slate-600',
    ready: 'bg-[var(--color-primary-soft)] text-[var(--color-primary)]',
    'sent-back': 'bg-[var(--color-error-soft)] text-[var(--color-error)]',
    'business-approval-waiting': 'bg-[var(--color-alert-soft)] text-amber-900',
    reflected: 'bg-[var(--color-success-soft)] text-[var(--color-success)]',
  }[status]

  return (
    <span className={cn('inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium', semantic)}>
      {label}
    </span>
  )
}
