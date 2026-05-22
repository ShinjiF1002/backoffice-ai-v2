import { FileText, ScanLine, Database, Sparkles } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { EvidenceStep } from '@/data/types'

/**
 * EvidenceTimeline — 証跡 vertical timeline rail (CaseReview 中央 column 主役)
 * SSOT: docs/03-ui-prototype-design.md §2.7.2 (Image 2 primary)
 *
 * 8px dots + 1px line、step ごとに icon + name + timestamp + mono metadata line (actor · source · conf)
 *
 * Day 11.3 #3a + #3b:
 *  - alerts prop は撤去 (CaseReview の LifecycleStepper 直下 strip に構造移動、timeline event と分離)
 *  - per-step に mono metadata line (actor · source · conf) を追加、operational signature 強化
 *  - 「ALERT」uppercase 英語 header 削除 (alerts 移動で不要、§5a)
 */

function iconForLabel(label: string) {
  switch (label) {
    case 'PDF':
      return FileText
    case 'IMG':
      return ScanLine
    case 'DB':
      return Database
    case 'AI':
      return Sparkles
    default:
      return FileText
  }
}

export function EvidenceTimeline({
  pdfName,
  pdfPages,
  steps,
}: {
  pdfName: string
  pdfPages: number
  steps: EvidenceStep[]
}) {
  return (
    <div className="flex h-full flex-col">
      {/* Section heading */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900">証跡</h2>
        <span className="font-mono text-[10px] text-slate-500">{steps.length} step</span>
      </div>

      {/* PDF preview thumbnail */}
      <div className="mb-4 flex gap-3 rounded-md border border-slate-200 bg-slate-50 p-3">
        <div className="flex h-16 w-12 shrink-0 items-center justify-center rounded border border-slate-200 bg-white">
          <FileText className="h-5 w-5 text-slate-400" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-medium text-slate-900">{pdfName}</span>
          <span className="mt-0.5 font-mono text-[10px] text-slate-500">{pdfPages} ページ</span>
          <button className="mt-1 text-left text-[11px] font-medium text-[var(--color-primary)] hover:underline">
            プレビュー →
          </button>
        </div>
      </div>

      {/* Vertical timeline rail */}
      <ol className="relative space-y-3 border-l border-slate-200 pl-5">
        {steps.map((step) => {
          const Icon = iconForLabel(step.thumbnailLabel)
          return (
            <li key={step.id} className="relative">
              {/* dot */}
              <span
                className={cn(
                  'absolute -left-[26px] top-1.5 h-2 w-2 rounded-full ring-2 ring-white',
                  step.status === 'completed' && 'bg-[var(--color-success)]',
                  step.status === 'warning' && 'bg-[var(--color-alert)]',
                  step.status === 'pending' && 'bg-slate-300'
                )}
                aria-hidden="true"
              />
              <div className="rounded-md border border-slate-200 bg-white p-2.5">
                <div className="flex items-start gap-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded border border-slate-200 bg-slate-50">
                    <Icon className="h-3.5 w-3.5 text-slate-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-slate-900">{step.name}</span>
                      <span className="font-mono text-[10px] text-slate-400 tabular">{step.timestamp}</span>
                    </div>
                    {/* Day 11.3 #3b: per-step mono metadata line (actor · source · conf) */}
                    <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 font-mono text-[10px] text-slate-500">
                      <span>
                        actor: <span className="text-slate-700">{step.actor}</span>
                      </span>
                      {step.source && (
                        <>
                          <span className="text-slate-300">·</span>
                          <span>
                            source: <span className="text-slate-700">{step.source}</span>
                          </span>
                        </>
                      )}
                      {typeof step.confidence === 'number' && (
                        <>
                          <span className="text-slate-300">·</span>
                          <span
                            className={cn(
                              'tabular',
                              step.confidence >= 0.85
                                ? 'text-[var(--color-success)]'
                                : step.confidence >= 0.65
                                  ? 'text-[var(--color-alert)]'
                                  : 'text-[var(--color-error)]'
                            )}
                          >
                            conf: {step.confidence.toFixed(2)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
