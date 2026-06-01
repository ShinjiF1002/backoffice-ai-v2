import { Check } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { ProposalStatus } from '@/data/types'

/**
 * ProposalLifecycleStepper — Proposal status stepper (header 内)
 * SSOT: docs/03-ui-prototype-design.md §4.5 (ProposalReview の状態 4 段階)
 *
 * 整理 → 承認 → 反映 (current step は indigo dot + font-semibold、LifecycleStepper.tsx と同 grammar)
 *
 * status マッピング:
 *  - pending-triage → 整理 (current、手順管理者 action 待ち)
 *  - forwarded      → 承認 (current、業務責任者 action 待ち、整理 complete)
 *  - approved       → 反映 (current、compiled 昇格反映済)
 *  - rejected       → 差戻し (側方状態、stepper 全 step が dim + 「差戻し」chip 末尾表示。Day 14-15 で詳細 visual finalize)
 *
 * Day 12.4 CR R31 M1: CaseReview LifecycleStepper の grammar 継承で Proposal flywheel 可視化
 */

type ProposalLifecycleStep = '整理' | '承認' | '反映'

const steps: ProposalLifecycleStep[] = ['整理', '承認', '反映']

function statusToIdx(status: ProposalStatus): number {
  switch (status) {
    case 'pending-triage':
      return 0
    case 'forwarded':
      return 1
    case 'approved':
      return 2
    case 'rejected':
      return -1 // side state、no current step highlighted
    default:
      return 0
  }
}

export function ProposalLifecycleStepper({ status }: { status: ProposalStatus }) {
  const currentIdx = statusToIdx(status)
  const isRejected = status === 'rejected'

  return (
    <ol className="flex items-center gap-1.5 text-xs">
      {steps.map((step, idx) => {
        const completed = !isRejected && idx < currentIdx
        const isCurrent = !isRejected && idx === currentIdx
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
                <path
                  d="M2 1l4 3-4 3"
                  stroke="currentColor"
                  strokeWidth="1.25"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </li>
        )
      })}
      {isRejected && (
        <li className="ml-2 inline-flex items-center rounded-md bg-[var(--color-error-soft)] px-2 py-0.5 font-medium text-[var(--color-error)]">
          差戻し
        </li>
      )}
    </ol>
  )
}
