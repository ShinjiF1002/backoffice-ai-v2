import { cn } from '@/lib/cn'

/**
 * MetaChip — non-interactive meta info label
 * Day 16 C1a chip taxonomy (no border, slate-100 bg, or tinted tone)
 *
 * 用途: 期間ラベル (直近 30 日)、件数サマリー (5 分類) など
 * SLA 経過時間の tone 付きラベルにも使用 (C2-B)
 */

// MetaTone (canonical-design-spec §3.1): MetaChip 専用 union (slate 不要、StatusBadge の Tone とは別)
export type MetaTone = 'neutral' | 'inset' | 'primary' | 'success' | 'alert' | 'error'

const TONE_CLASS: Record<MetaTone, string> = {
  neutral: 'bg-[var(--color-panel-inset)] text-[var(--color-fg-muted)]',
  inset: 'bg-[var(--color-panel-inset)] text-[var(--color-fg)]',
  primary: 'bg-[var(--color-primary-soft)] text-[var(--color-primary)]',
  success: 'bg-[var(--color-success-soft)] text-[var(--color-success-soft-fg)]',
  alert: 'bg-[var(--color-alert-soft)] text-[var(--color-alert-soft-fg)]',
  error: 'bg-[var(--color-error-soft)] text-[var(--color-error-soft-fg)]',
}

interface MetaChipProps {
  label: string
  tone?: MetaTone
  mono?: boolean
  className?: string
}

export function MetaChip({ label, tone = 'neutral', mono = false, className }: MetaChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-[10px]',
        TONE_CLASS[tone],
        mono && 'font-mono tabular',
        className
      )}
    >
      {label}
    </span>
  )
}
