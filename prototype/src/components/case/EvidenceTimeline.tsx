import { FileText, ScanLine, Database, Sparkles, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { EvidenceStep, CaseAlert } from '@/data/types'

/**
 * EvidenceTimeline — 証跡 vertical timeline rail (CaseReview 中央 column 主役)
 * SSOT: docs/03-ui-prototype-design.md §2.7.2 (Image 2 primary)
 *
 * 8px dots + 1px line、step ごとに thumbnail + timestamp + actor + status indicator
 * Alert chips を timeline 下に集約 (operational copy、internal-flavor debug text は避ける)
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

export function EvidenceTimeline({ pdfName, pdfPages, steps, alerts }: { pdfName: string; pdfPages: number; steps: EvidenceStep[]; alerts: CaseAlert[] }) {
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
                      <span className="font-mono text-[10px] text-slate-400">{step.actor}</span>
                    </div>
                    <div className="mt-0.5 flex items-center justify-between">
                      <span className="font-mono text-[10px] text-slate-500 tabular">{step.timestamp}</span>
                      {typeof step.confidence === 'number' && (
                        <span
                          className={cn(
                            'font-mono text-[10px] tabular',
                            step.confidence >= 0.85
                              ? 'text-[var(--color-success)]'
                              : step.confidence >= 0.65
                                ? 'text-[var(--color-alert)]'
                                : 'text-[var(--color-error)]'
                          )}
                        >
                          {step.confidence.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          )
        })}
      </ol>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="mt-4 space-y-1.5">
          <h3 className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Alert</h3>
          {alerts.map((al) => (
            <div
              key={al.id}
              className={cn(
                'flex items-start gap-2 rounded-md border px-2.5 py-2 text-xs',
                al.severity === 'amber' && 'border-amber-200 bg-[var(--color-alert-soft)] text-amber-900',
                al.severity === 'red' && 'border-red-200 bg-[var(--color-error-soft)] text-red-900'
              )}
            >
              <AlertTriangle
                className={cn(
                  'h-3.5 w-3.5 shrink-0',
                  al.severity === 'amber' && 'text-[var(--color-alert)]',
                  al.severity === 'red' && 'text-[var(--color-error)]'
                )}
              />
              <div className="flex-1">
                <p className="leading-relaxed">{al.message}</p>
                {al.sourceStep && (
                  <p className="mt-0.5 font-mono text-[10px] text-amber-700/70">{al.sourceStep}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
