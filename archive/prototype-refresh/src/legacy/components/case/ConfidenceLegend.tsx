import { cn } from '@/lib/cn'

const LEGEND = [
  { dotClass: 'bg-[var(--color-success)]', label: '0.85 以上 (高信頼)' },
  { dotClass: 'bg-[var(--color-alert)]',   label: '0.65〜0.84 (確認推奨)' },
  { dotClass: 'bg-[var(--color-error)]',   label: '0.65 未満 (要確認)' },
] as const

interface Props {
  className?: string
}

export function ConfidenceLegend({ className }: Props) {
  return (
    <div className={cn('flex flex-wrap items-center gap-x-3 gap-y-1 pt-2 text-[10px] text-slate-500', className)}>
      {LEGEND.map((item) => (
        <span key={item.label} className="inline-flex items-center gap-1">
          <span className={cn('inline-block h-2 w-2 shrink-0 rounded-full', item.dotClass)} aria-hidden="true" />
          {item.label}
        </span>
      ))}
    </div>
  )
}
