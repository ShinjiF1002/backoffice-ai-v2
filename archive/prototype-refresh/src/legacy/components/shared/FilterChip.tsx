import { cn } from '@/lib/cn'

/**
 * FilterChip — interactive filter selection chip
 * Day 16 C1a chip taxonomy (radius 6px / rounded-md、FilterChip の radius は control radius と同じ)
 *
 * Note: `onRemove` は Day 16 では使用しない。nested button は invalid interactive になるため、
 *   将来 multi-select で必要になる場合は separate control として再設計する。
 */

interface FilterChipProps {
  label?: string
  children?: React.ReactNode
  active?: boolean
  disabled?: boolean
  mono?: boolean
  icon?: React.ReactNode
  /** 将来用 — Day 16 では使用しない */
  onRemove?: () => void
  /** disabled 時の wrapper tooltip (button[disabled] は title 無効なため span wrapper 経由) */
  title?: string
  /** disabled 時の SR 用 caption 紐付け (visible footer caption の id、Day 18.5 P1-2 反映、CR R32+R38 wrapper title と共存) */
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
          ? 'cursor-not-allowed border border-slate-100 bg-slate-50 text-slate-400'
          : active
            ? 'border border-[var(--color-primary)] bg-[var(--color-primary-soft)] text-[var(--color-primary)]'
            : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
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
