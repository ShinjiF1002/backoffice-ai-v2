import { cn } from '@/lib/cn'

/**
 * MetaChip — non-interactive meta info label
 * Day 16 C1a chip taxonomy (no border, slate-100 bg, or tinted tone)
 *
 * 用途: 期間ラベル (直近 30 日)、件数サマリー (5 分類) など
 * SLA 経過時間の tone 付きラベルにも使用 (C2-B)
 */

type Tone = 'neutral' | 'alert' | 'error' | 'primary'

const TONE_CLASS: Record<Tone, string> = {
  neutral: 'bg-slate-100 text-slate-600',
  alert: 'bg-[var(--color-alert-soft)] text-[var(--color-alert-soft-fg)]',
  error: 'bg-[var(--color-error-soft)] text-[var(--color-error-soft-fg)]',
  primary: 'bg-[var(--color-primary-soft)] text-[var(--color-primary)]',
}

interface MetaChipProps {
  label: string
  tone?: Tone
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
