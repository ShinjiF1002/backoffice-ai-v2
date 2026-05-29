import { AlertOctagon, RefreshCcw, ExternalLink } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

/**
 * ErrorState — エラー状態表示 (Phase 2 で legacy quarantine から復活、color を semantic token 化)。
 * 配線は Phase 6 (各 list/detail)。`--color-error-soft-border` は Phase 2 で index.css に追加。
 *
 * 必須 3 要素: (a) 観測可能 cause / (b) 再試行 (onRetry、idempotency は caller 責任) / (c) escalation channel。
 */
interface ErrorStateProps {
  title: string
  /** Observable cause (e.g. 'タイムアウト (15 秒)') */
  cause?: string
  onRetry?: () => void
  escalation?: { href: string; label: string }
  description?: ReactNode
  className?: string
}

export function ErrorState({ title, cause, onRetry, escalation, description, className }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col gap-3 rounded-md border border-[var(--color-error-soft-border)] bg-[var(--color-error-soft)] px-4 py-4',
        className
      )}
    >
      <div className="flex items-start gap-2.5">
        <AlertOctagon className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--color-error-soft-fg)]" aria-hidden="true" />
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-sm font-medium text-[var(--color-error-soft-fg)]">{title}</p>
          {cause && <p className="font-mono text-[11px] text-[var(--color-error-soft-fg)] tabular">原因: {cause}</p>}
          {description && <div className="text-xs leading-relaxed text-[var(--color-fg)]">{description}</div>}
        </div>
      </div>
      {(onRetry || escalation) && (
        <div className="ml-7 flex flex-wrap items-center gap-2 text-xs">
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-1 rounded-md border border-[var(--color-error-soft-border)] bg-[var(--color-panel)] px-2.5 py-1 text-[11px] font-medium text-[var(--color-error-soft-fg)] transition-colors hover:bg-[var(--color-error-soft)]"
            >
              <RefreshCcw className="h-3 w-3" aria-hidden="true" />
              再試行
            </button>
          )}
          {escalation && (
            <a
              href={escalation.href}
              className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-medium text-[var(--color-fg-muted)] transition-colors hover:bg-[var(--color-panel-inset)]"
            >
              <ExternalLink className="h-3 w-3" aria-hidden="true" />
              {escalation.label}
            </a>
          )}
        </div>
      )}
    </div>
  )
}
