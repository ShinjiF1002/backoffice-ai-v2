import { Check } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { CaseLifecycleStep, CaseLifecycleStepSpec } from '@/data/types'

/**
 * LifecycleStepper — case lifecycle stepper (header 内)
 * SSOT: docs/03-ui-prototype-design.md §2.7.2 (case lifecycle 訂正)
 *
 * 受付 → AI 処理 → 入力者確認 → 承認者承認 → 反映
 * **`手順承認` は current case stepper に含めない** (手順承認は別 flywheel / Proposal loop、§6 Alert UI 適用範囲 3)
 *
 * Day 11.3 #5d: current step indicator を旧 bracketed text marker → indigo dot + font-semibold に変更
 *
 * F-7 Wave 2 PR 2 Commit 5 (Implementation Plan v3.0、gate1-decision.md F-7 採用案 A spec):
 *  - `specs` prop (CaseLifecycleStepSpec[]) で per-step SLA badge (target/elapsed chip) + approver hover を有効化
 *  - 未指定なら従来の chip-only 表示 (backward compat)
 */

const steps: CaseLifecycleStep[] = ['受付', 'AI処理', '入力者確認', '承認者承認', '反映']

interface LifecycleStepperProps {
  current: CaseLifecycleStep
  /** F-7 拡張: 未指定なら従来の chip-only 表示 (Day 11.3 baseline) */
  specs?: CaseLifecycleStepSpec[]
}

export function LifecycleStepper({ current, specs }: LifecycleStepperProps) {
  const currentIdx = steps.indexOf(current)
  const specMap = new Map(specs?.map((s) => [s.step, s]) ?? [])
  return (
    <ol className="flex items-start gap-1.5 text-xs">
      {steps.map((step, idx) => {
        const completed = idx < currentIdx
        const isCurrent = idx === currentIdx
        const spec = specMap.get(step)
        const over = spec?.elapsedPercent !== undefined && spec.elapsedPercent >= 100
        const approverHint = spec?.approver ? `${spec.approver.role}: ${spec.approver.name}` : undefined
        const slaHint = spec?.slaTargetLabel
        const titleParts = [approverHint, slaHint].filter(Boolean)
        return (
          <li key={step} className="flex items-start gap-1.5">
            <div className="flex flex-col items-start gap-0.5">
              <span
                title={titleParts.length > 0 ? titleParts.join(' · ') : undefined}
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
              {/* F-7: per-step SLA badge (target + elapsed)、specs 指定時のみ表示 */}
              {spec && (
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-mono text-[9px] tabular',
                    isCurrent && over && 'bg-red-50 text-[var(--color-error-soft-fg)]',
                    isCurrent && !over && 'bg-amber-50 text-[var(--color-alert-soft-fg)]',
                    !isCurrent && 'bg-slate-50 text-slate-500'
                  )}
                >
                  {spec.elapsedLabel ? (
                    <>
                      <span>{spec.elapsedLabel}</span>
                      <span className="text-slate-400">/</span>
                      <span>{spec.slaTargetLabel.replace(' [仮説 / 要検証]', '')}</span>
                    </>
                  ) : (
                    <span>{spec.slaTargetLabel.replace(' [仮説 / 要検証]', '')}</span>
                  )}
                </span>
              )}
            </div>
            {idx < steps.length - 1 && (
              <svg width="8" height="8" viewBox="0 0 8 8" className="mt-2 text-slate-300" aria-hidden="true">
                <path d="M2 1l4 3-4 3" stroke="currentColor" strokeWidth="1.25" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </li>
        )
      })}
    </ol>
  )
}
