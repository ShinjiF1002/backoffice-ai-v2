import { cn } from '@/lib/cn'
import type { StagingHintRef } from '@/data/types'

/**
 * StagingHintPanel — 未承認ヒント (低/中 weight、citation 対象外)
 * SSOT: docs/03-ui-prototype-design.md §2.7.2 (Image 3 governance borrow) + Plan v1.4 P0-1
 *
 * 重要 governance:
 *  - weight: low / medium のみ表示 (high は CitationPanel)
 *  - 別 background tint (slate-50 panel inset、distinct from citation white)
 *  - 各 entry に "citation 対象外" label 明示
 *  - badge は slate (muted)、emerald accent は使わない (citation 専用)
 */
export function StagingHintPanel({ hints }: { hints: StagingHintRef[] }) {
  if (hints.length === 0) return null

  return (
    <div className="rounded-md bg-[var(--color-panel-inset)] p-3">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">未承認ヒント — citation 対象外</h3>
        <span className="font-mono text-[10px] text-slate-500">{hints.length} 件</span>
      </div>

      <ul className="space-y-1.5">
        {hints.map((h) => (
          <li
            key={h.knowledgeId}
            className="rounded-md border border-slate-200 bg-white p-2.5"
          >
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  'inline-flex items-center rounded px-1.5 py-0.5 font-mono text-[10px] font-medium',
                  h.weight === 'medium'
                    ? 'bg-slate-200 text-slate-700'
                    : 'bg-slate-100 text-slate-500'
                )}
              >
                {h.weight}
              </span>
              <span className="inline-flex items-center rounded bg-slate-50 px-1.5 py-0.5 font-mono text-[10px] text-slate-500 ring-1 ring-slate-200">
                citation 対象外
              </span>
              <span className="font-mono text-[10px] text-slate-400">{h.knowledgeId}</span>
            </div>
            <p className="mt-1 text-xs font-medium text-slate-800">{h.title}</p>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-600">{h.excerpt}</p>
          </li>
        ))}
      </ul>

      <p className="mt-2.5 text-[10px] leading-relaxed text-slate-500">
        ※ 本セクションは未承認の参考情報です。AI の正式実行根拠 (citation) ではなく、人間 reviewer の hint としてのみ使用してください。
      </p>
    </div>
  )
}
