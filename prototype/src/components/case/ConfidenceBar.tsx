import { cn } from '@/lib/cn'

/**
 * ConfidenceBar — per-field AI confidence indicator
 * SSOT: docs/03-ui-prototype-design.md §2.7.3 + Operational Premium Light
 *
 * 4px tall semantic color:
 *  - emerald: ≥ 0.85
 *  - amber: 0.65-0.85
 *  - red: < 0.65
 */
export function ConfidenceBar({ value, className }: { value: number; className?: string }) {
  const pct = Math.round(value * 100)
  const semantic =
    value >= 0.85
      ? 'bg-[var(--color-success)]'
      : value >= 0.65
        ? 'bg-[var(--color-alert)]'
        : 'bg-[var(--color-error)]'

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
    </div>
  )
}
