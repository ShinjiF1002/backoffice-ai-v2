import { cn } from '@/lib/cn'

/**
 * FilterChip — interactive filter selection chip (Phase 2 で legacy quarantine から復活、color を token 化)。
 * chip taxonomy: radius 6px (rounded-md = control radius)。配線は Phase 3 (DataTable filter)。
 *
 * Note: onRemove は未使用 (nested button は invalid interactive)。将来 multi-select で separate control 化。
 */
interface FilterChipProps {
  label?: string
  children?: React.ReactNode
  active?: boolean
  disabled?: boolean
  mono?: boolean
  icon?: React.ReactNode
  /** 将来用 — 未使用 */
  onRemove?: () => void
  /** disabled 時の wrapper tooltip (button[disabled] は title 無効なため span wrapper 経由) */
  title?: string
  /** disabled 時の SR 用 caption 紐付け */
  'aria-describedby'?: string
  onClick?: () => void
  'aria-pressed'?: boolean
  className?: string
}

export function FilterChip({
  label,
  children,
  active = false,
  disabled = false,
  mono = false,
  icon,
  title,
  onClick,
  'aria-pressed': ariaPressedProp,
  'aria-describedby': ariaDescribedby,
  className,
}: FilterChipProps) {
  const button = (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-pressed={ariaPressedProp ?? active}
      aria-describedby={ariaDescribedby}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] transition-colors',
        mono && 'font-mono tabular',
        disabled
          ? 'cursor-not-allowed border border-[var(--color-border)] bg-[var(--color-panel-inset)] text-[var(--color-fg-subtle)]'
          : active
            ? 'border border-[var(--color-primary)] bg-[var(--color-primary-soft)] text-[var(--color-primary)]'
            : 'border border-[var(--color-border)] bg-[var(--color-panel)] text-[var(--color-fg-muted)] hover:bg-[var(--color-panel-inset)]',
        className
      )}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children ?? label}
    </button>
  )

  if (disabled && title) {
    return <span title={title}>{button}</span>
  }
  return button
}
