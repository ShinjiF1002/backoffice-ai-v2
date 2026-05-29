import { AlertOctagon, RefreshCcw, ExternalLink } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

/**
 * ErrorState — F-3 Wave 3 PR 3 Commit 6 (Implementation Plan v3.0、Card 6 empty-error-loading-states)
 *
 * Error 必須 3 要素:
 *  (a) 観測可能 cause (timeout / unauthorized / server)
 *  (b) 再試行 idempotency 保証 (onRetry 経由、optional)
 *  (c) escalation channel (support link or contact、`escalationHref` 経由)
 *
 * Operational Premium Light 規範:
 *  - red-50 / red-700 (error token 経由) で軽度 inset、装飾 0
 *  - cause + retry + escalation の 3-region 縦 stack、operator UI 想定の中密度
 */

interface ErrorStateProps {
  /** Title (e.g. 'データの取得に失敗しました') */
  title: string
  /** Observable cause (e.g. 'タイムアウト (15 秒)') */
  cause?: string
  /** Retry handler (idempotent retry の責任は caller 側、本 component は呼び出すだけ) */
  onRetry?: () => void
  /** Escalation channel link (support email / ticket URL / Slack channel 等) */
  escalation?: { href: string; label: string }
  /** Optional supplementary description / next step explanation */
  description?: ReactNode
  className?: string
}

export function ErrorState({
  title,
  cause,
  onRetry,
  escalation,
  description,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col gap-3 rounded-md border border-red-200 bg-red-50/40 px-4 py-4',
        className
      )}
    >
      <div className="flex items-start gap-2.5">
        <AlertOctagon
          className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--color-error-soft-fg)]"
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-sm font-medium text-[var(--color-error-soft-fg)]">{title}</p>
          {cause && (
            <p className="font-mono text-[11px] text-red-700 tabular">原因: {cause}</p>
          )}
          {description && (
            <div className="text-xs leading-relaxed text-slate-700">{description}</div>
          )}
        </div>
      </div>
      {(onRetry || escalation) && (
        <div className="ml-7 flex flex-wrap items-center gap-2 text-xs">
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-1 rounded-md border border-red-300 bg-white px-2.5 py-1 text-[11px] font-medium text-red-700 transition-colors hover:bg-red-50"
            >
              <RefreshCcw className="h-3 w-3" aria-hidden="true" />
              再試行
            </button>
          )}
          {escalation && (
            <a
              href={escalation.href}
              className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-medium text-slate-600 transition-colors hover:bg-slate-100"
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
