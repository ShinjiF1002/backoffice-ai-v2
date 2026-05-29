import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/cn'

/**
 * LoadingState — F-3 Wave 3 PR 3 Commit 6 (Implementation Plan v3.0、Card 6 empty-error-loading-states)
 *
 * 2 variant:
 *  - **skeleton** (predictable, content-shape preserving、duration < 2s): grey block + animate-pulse
 *  - **spinner** (indeterminate, action-triggered、e.g. CSV Export 生成、duration unknown): Loader2 spin + optional message
 *
 * Operational Premium Light 規範:
 *  - 装飾 0 (gradient / glow spinner なし、lucide-react Loader2 + animate-spin のみ)
 *  - skeleton は bg-slate-200/40 + animate-pulse の Tailwind native
 *  - prefers-reduced-motion respect (Tailwind animate-* は media query で自動 stop)
 */

interface LoadingStateSpinnerProps {
  variant: 'spinner'
  /** Optional progress message */
  message?: string
  className?: string
}

interface LoadingStateSkeletonProps {
  variant: 'skeleton'
  /** Number of skeleton rows (e.g. 3 for a small table、10 for inbox queue) */
  rowCount?: number
  /** Optional row height (Tailwind class、default 'h-10') */
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
          'inline-flex items-center gap-2 rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-600',
          className
        )}
      >
        <Loader2 className="h-3.5 w-3.5 animate-spin text-[var(--color-primary)]" aria-hidden="true" />
        <span>{message ?? '読み込み中...'}</span>
      </div>
    )
  }

  const { rowCount = 3, rowHeightClass = 'h-10', className } = props
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="読み込み中"
      className={cn('space-y-2', className)}
    >
      {Array.from({ length: rowCount }).map((_, idx) => (
        <div
          key={idx}
          className={cn(
            'animate-pulse rounded-md bg-slate-200/40',
            rowHeightClass
          )}
        />
      ))}
    </div>
  )
}
