import { cn } from '@/lib/cn'

/**
 * ConfidenceBar — per-field AI confidence indicator
 * SSOT: docs/03-ui-prototype-design.md §2.7.3 + Operational Premium Light
 *
 * 4px tall semantic color:
 *  - emerald: ≥ 0.85
 *  - amber: 0.65-0.85
 *  - red: < 0.65
 *
 * Day 11.3 #1c: showThresholdChip prop (optional)
 *  - true + value < 0.85 → `閾値未達` chip を numeric の右に表示 (amber tone、mono)
 *  - diff field 等で threshold-aware indicator として使用
 */
export function ConfidenceBar({
  value,
  className,
  showThresholdChip = false,
}: {
  value: number
  className?: string
  showThresholdChip?: boolean
}) {
  const pct = Math.round(value * 100)
  const semantic =
    value >= 0.85
      ? 'bg-[var(--color-success)]'
      : value >= 0.65
        ? 'bg-[var(--color-alert)]'
        : 'bg-[var(--color-error)]'
  const belowThreshold = value < 0.85

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="h-1 flex-1 overflow-hidden rounded-full bg-slate-100">
        <div
          className={cn('h-full rounded-full transition-all duration-250', semantic)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="font-mono text-[10px] tabular text-slate-500">
        {value.toFixed(2)}
      </span>
      {showThresholdChip && belowThreshold && (
        <span className="inline-flex items-center rounded bg-[var(--color-alert-soft)] px-1 py-0.5 font-mono text-[9px] font-medium text-amber-900 ring-1 ring-amber-200">
          閾値未達
        </span>
      )}
    </div>
  )
}
