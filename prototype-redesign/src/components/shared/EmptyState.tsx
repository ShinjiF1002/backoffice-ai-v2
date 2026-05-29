import { Inbox, Filter, Lock } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

/**
 * EmptyState — 空状態表示 (Phase 2 で legacy quarantine から復活、color を semantic token 化)。
 * 配線は Phase 3 (DataTable filtered-empty) / Phase 6 (各 list/detail)。
 *
 * 3 sub-state (sub-state ごとに icon + 原因 + action 1 つ):
 *  - truly-empty (新規 / 未投入): primary CTA
 *  - filtered-empty (filter で 0): secondary Reset (primary 不要、誤操作回避)
 *  - permission-empty (権限不足): 本 prototype 未使用 (RBAC は R1+)
 *
 * Operational Premium Light: 装飾 0、lucide のみ、縦 stack centered。
 */
type EmptySubState = 'truly-empty' | 'filtered-empty' | 'permission-empty'

interface EmptyStateProps {
  subState: EmptySubState
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

const iconMap: Record<EmptySubState, typeof Inbox> = {
  'truly-empty': Inbox,
  'filtered-empty': Filter,
  'permission-empty': Lock,
}

export function EmptyState({ subState, title, description, action, className }: EmptyStateProps) {
  const Icon = iconMap[subState]
  return (
    <div
      role="status"
      className={cn(
        'flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-[var(--color-border)] bg-[var(--color-panel-inset)] px-6 py-12 text-center',
        className
      )}
    >
      <Icon className="h-7 w-7 text-[var(--color-fg-subtle)]" aria-hidden="true" />
      <p className="text-sm font-medium text-[var(--color-fg)]">{title}</p>
      {description && (
        <p className="max-w-md text-xs leading-relaxed text-[var(--color-fg-muted)]">{description}</p>
      )}
      {action && <div className="mt-1.5">{action}</div>}
    </div>
  )
}
