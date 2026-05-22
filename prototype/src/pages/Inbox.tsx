import { Link } from 'react-router-dom'
import { mockCases } from '@/data/mock-cases'
import { ArrowRight } from 'lucide-react'

/**
 * Inbox — 9 画面の 1 つ
 * Day 11 placeholder + CaseReview への navigation entry。
 * SSOT: docs/03-ui-prototype-design.md §4.1 (Inbox Screen Card)
 */
export function Inbox() {
  return (
    <div className="mx-auto max-w-7xl p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">受信トレイ</h1>
        <p className="mt-1 text-sm text-slate-500">
          AI 処理待ちの案件 ({mockCases.length} 件)
        </p>
      </div>
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600">
            <tr>
              <th className="px-4 py-3 text-left font-medium">案件 ID</th>
              <th className="px-4 py-3 text-left font-medium">業務</th>
              <th className="px-4 py-3 text-left font-medium">状態</th>
              <th className="px-4 py-3 text-left font-medium">経過</th>
              <th className="px-4 py-3 text-left font-medium">Alert</th>
              <th className="px-4 py-3 text-right font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {mockCases.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-mono text-xs text-slate-700">{c.id}</td>
                <td className="px-4 py-3 text-slate-900">{c.workflowName}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center rounded-md bg-[var(--color-primary-soft)] px-2 py-0.5 text-xs font-medium text-[var(--color-primary)]">
                    {c.statusLabel}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-slate-600 tabular">{c.elapsedLabel}</td>
                <td className="px-4 py-3">
                  {c.alertCount > 0 && (
                    <span className="inline-flex items-center rounded bg-[var(--color-alert-soft)] px-1.5 py-0.5 font-mono text-xs text-[var(--color-alert)]">
                      {c.alertCount}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    to={`/cases/${c.id}`}
                    className="inline-flex items-center gap-1 text-xs font-medium text-[var(--color-primary)] hover:underline"
                  >
                    開く
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
