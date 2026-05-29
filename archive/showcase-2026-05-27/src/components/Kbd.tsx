import { cn } from '@/lib/cn'

/**
 * Inline keyboard shortcut hint — Bloomberg / Linear / GitHub universal convention.
 * Used as a slot inside primary buttons (e.g., `<button>Approve <Kbd>⌘↵</Kbd></button>`).
 * Muted by default、focus / hover で primary color へ shift。
 */
export function Kbd({
  children,
  tone = 'on-light',
  className,
}: {
  children: React.ReactNode
  tone?: 'on-light' | 'on-primary' | 'on-danger'
  className?: string
}) {
  const map = {
    'on-light':   'bg-[color:var(--color-panel-inset)] text-[color:var(--color-fg-muted)] border-[color:var(--color-border)]',
    'on-primary': 'bg-white/15 text-[color:var(--color-primary-fg)] border-white/20',
    'on-danger':  'bg-white/15 text-white border-white/20',
  }[tone]
  return (
    <kbd
      className={cn(
        'inline-flex items-center justify-center min-w-[18px] h-[16px] px-1 rounded border font-mono text-[10px] font-medium leading-none',
        map,
        className
      )}
    >
      {children}
    </kbd>
  )
}

/**
 * EmptyState — Tier-aligned filtered-empty / truly-empty / permission-empty.
 * 短文 + 1 action のみ、illustration なし (Tier 1 marketing 系 anti-pattern 回避)。
 */
export function EmptyState({
  variant = 'filtered',
  message,
  action,
}: {
  variant?: 'filtered' | 'truly' | 'permission'
  message: string
  action?: { label: string; onClick: () => void; primary?: boolean }
}) {
  const pad = variant === 'truly' ? 'py-12' : 'py-10'
  return (
    <div className={cn('px-5 text-center', pad)}>
      <p className="text-[12px] text-[color:var(--color-fg-muted)] mb-2">{message}</p>
      {action &&
        (action.primary ? (
          <button
            onClick={action.onClick}
            className="text-[13px] font-medium px-3 py-2 rounded-[var(--radius-control)] bg-[color:var(--color-primary)] text-[color:var(--color-primary-fg)] hover:bg-[color:var(--color-primary-hover)] transition-colors"
          >
            {action.label}
          </button>
        ) : (
          <button
            onClick={action.onClick}
            className="text-[12px] text-[color:var(--color-primary)] underline hover:no-underline"
          >
            {action.label}
          </button>
        ))}
    </div>
  )
}
