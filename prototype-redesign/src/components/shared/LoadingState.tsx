import { Loader2Icon } from 'lucide-react'
import { cn } from '@/lib/cn'

/**
 * LoadingState — 読込中表示 (Phase 2 で legacy quarantine から復活、color を semantic token 化)。
 * 配線は Phase 6 (各 list/detail)。
 *
 * 2 variant:
 *  - skeleton (content-shape preserving): grey block + animate-pulse
 *  - spinner (indeterminate, action-triggered): Loader2 spin + optional message
 * prefers-reduced-motion は Tailwind animate-* が media query で自動 stop。
 */
interface LoadingStateSpinnerProps {
  variant: 'spinner'
  message?: string
  className?: string
}

interface LoadingStateSkeletonProps {
  variant: 'skeleton'
  rowCount?: number
  /** Tailwind class、default 'h-10' */
  rowHeightClass?: string
  className?: string
}

type LoadingStateProps = LoadingStateSpinnerProps | LoadingStateSkeletonProps

export function LoadingState(props: LoadingStateProps) {
  if (props.variant === 'spinner') {
    const { message, className } = props
    return (
      <div
        role="status"
        aria-live="polite"
        className={cn(
          'inline-flex items-center gap-2 rounded-md bg-[var(--color-panel-inset)] px-3 py-2 text-xs text-[var(--color-fg-muted)]',
          className
        )}
      >
        <Loader2Icon className="h-3.5 w-3.5 animate-spin text-[var(--color-primary)]" aria-hidden="true" />
        <span>{message ?? '読み込み中...'}</span>
      </div>
    )
  }

  const { rowCount = 3, rowHeightClass = 'h-10', className } = props
  return (
    <div role="status" aria-live="polite" aria-label="読み込み中" className={cn('space-y-2', className)}>
      {Array.from({ length: rowCount }).map((_, idx) => (
        <div key={idx} className={cn('animate-pulse rounded-md bg-[var(--color-panel-inset)]', rowHeightClass)} />
      ))}
    </div>
  )
}
