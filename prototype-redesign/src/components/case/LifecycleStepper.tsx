import { CheckIcon } from 'lucide-react'
import type { CaseLifecycleEvent } from '@/data/mock-case-detail'
import { cn } from '@/lib/cn'

/**
 * LifecycleStepper (active v2) — 案件 lifecycle を業務順で表示
 * 受付 → AI処理 → 入力者確認 → 承認者承認 → 反映 (canonical-design-spec / mock-fixture §8)
 * lucide icon + token。旧 components/case (legacy) とは別の active 実装。
 */
export function LifecycleStepper({ steps }: { steps: CaseLifecycleEvent[] }) {
  return (
    <ol className="flex items-center gap-0" aria-label="案件の進行状況">
      {steps.map((s, i) => {
        const last = i === steps.length - 1
        return (
          <li key={s.step} className={cn('flex items-center', !last && 'flex-1')}>
            <div className="flex flex-shrink-0 items-center gap-2">
              <span
                className={cn(
                  'flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-full border',
                  s.done
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary)]'
                    : s.current
                      ? 'border-[var(--color-primary)] bg-[var(--color-panel)]'
                      : 'border-[var(--color-border-strong)] bg-[var(--color-panel)]'
                )}
              >
                {s.done && <CheckIcon className="h-3 w-3 text-white" strokeWidth={2.5} aria-hidden="true" />}
                {s.current && <span className="h-2 w-2 rounded-full bg-[var(--color-primary)]" />}
              </span>
              <div className="flex flex-col leading-tight">
                <span
                  className={cn(
                    'text-xs',
                    s.current
                      ? 'font-semibold text-[var(--color-primary-hover)]'
                      : s.done
                        ? 'font-medium text-[var(--color-fg)]'
                        : 'text-[var(--color-fg-muted)]'
                  )}
                >
                  {s.step}
                </span>
                <span className="font-mono text-[10px] text-[var(--color-fg-subtle)]">{s.time}</span>
              </div>
            </div>
            {!last && (
              <span
                className={cn(
                  'mx-3 h-px flex-1',
                  s.done ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border-strong)]'
                )}
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}
