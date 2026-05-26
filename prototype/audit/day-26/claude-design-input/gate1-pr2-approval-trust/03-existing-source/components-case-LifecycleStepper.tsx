import { Check } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { CaseLifecycleStep } from '@/data/types'

/**
 * LifecycleStepper — case lifecycle stepper (header 内)
 * SSOT: docs/03-ui-prototype-design.md §2.7.2 (case lifecycle 訂正)
 *
 * 受付 → AI 処理 → 入力者確認 → 承認者承認 → 反映
 * **`手順承認` は current case stepper に含めない** (手順承認は別 flywheel / Proposal loop、§6 Alert UI 適用範囲 3)
 *
 * Day 11.3 #5d: current step indicator を旧 bracketed text marker → indigo dot + font-semibold に変更
 */

const steps: CaseLifecycleStep[] = ['受付', 'AI処理', '入力者確認', '承認者承認', '反映']

export function LifecycleStepper({ current }: { current: CaseLifecycleStep }) {
  const currentIdx = steps.indexOf(current)
  return (
    <ol className="flex items-center gap-1.5 text-xs">
      {steps.map((step, idx) => {
        const completed = idx < currentIdx
        const isCurrent = idx === currentIdx
        return (
          <li key={step} className="flex items-center gap-1.5">
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-md px-2 py-1 transition-colors',
                completed && 'bg-[var(--color-success-soft)] text-[var(--color-success)]',
                isCurrent && 'bg-[var(--color-primary-soft)] font-semibold text-[var(--color-primary)]',
                !completed && !isCurrent && 'text-slate-400'
              )}
            >
              {completed && <Check className="h-3 w-3" aria-hidden="true" />}
              {isCurrent && (
                <span
                  className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]"
                  aria-hidden="true"
                />
              )}
              {step}
            </span>
            {idx < steps.length - 1 && (
              <svg width="8" height="8" viewBox="0 0 8 8" className="text-slate-300" aria-hidden="true">
                <path d="M2 1l4 3-4 3" stroke="currentColor" strokeWidth="1.25" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </li>
        )
      })}
    </ol>
  )
}
