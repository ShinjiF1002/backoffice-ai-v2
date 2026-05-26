import { Sparkline } from '@/components/shared/Sparkline'
import { KNOWLEDGE_WEIGHT_STYLE } from '@/lib/knowledge-labels'
import type { CitationRef } from '@/data/types'

/**
 * CitationPanel — 引用根拠 (compiled approved / high only)
 * SSOT: docs/03-ui-prototype-design.md §2.7.2 + §2.7.4 + Plan v1.4 P0-1
 *
 * 重要 governance: weight: high (compiled approved) のみ表示。
 * low / medium は別 StagingHintPanel で視覚分離 (citation 対象外)。
 */
export function CitationPanel({ citations }: { citations: CitationRef[] }) {
  return (
    <div>
      <div className="mb-2.5 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">引用根拠 — 承認済みナレッジのみ</h3>
        <span className="font-mono text-[10px] text-slate-500">{citations.length} 件</span>
      </div>

      <ul className="space-y-1.5">
        {citations.map((c) => (
          <li
            key={c.knowledgeId}
            className="rounded-md border border-slate-200 bg-white p-2.5 transition-colors hover:border-slate-300"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  {/* P1-A fix (2026-05-26): raw `high` → `KNOWLEDGE_WEIGHT_STYLE.high.shortLabel` (= 「承認済」) backport from KnowledgeBrowser reference paradigm */}
                  <span className="inline-flex items-center rounded bg-[var(--color-success-soft)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--color-success)]">
                    {KNOWLEDGE_WEIGHT_STYLE.high.shortLabel}
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">{c.knowledgeId}</span>
                </div>
                <p className="mt-1 truncate text-xs font-medium text-slate-900">{c.title}</p>
                <p className="mt-0.5 truncate font-mono text-[10px] text-slate-400" title={c.sourcePath}>
                  {c.sourcePath.replace('workflows/', '...').replace('/knowledge/compiled/', '/')}
                </p>
              </div>
              <Sparkline data={c.trend} color="var(--color-success)" className="shrink-0" />
            </div>
            <div className="mt-2 flex items-center gap-2">
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-[var(--color-primary)]"
                  style={{ width: `${Math.round(c.relevance * 100)}%` }}
                />
              </div>
              <span className="font-mono text-[10px] tabular text-slate-500">
                関連度 {Math.round(c.relevance * 100)}%
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
