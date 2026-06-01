import { useState } from 'react'
import type { CaseField, ProposalDiffSection } from '@/data/types'
import { cn } from '@/lib/cn'

/**
 * DiffPreviewBlock — F-2 Wave 2 PR 2 Commit 3 (Implementation Plan v3.0、gate1-decision.md spec)
 *
 * Card 2 ★ diff-and-change-preview-ui の "3 view" 部分:
 *  - View 1 Side-by-side: 左=before / 右=after column、structured field の add/remove/modify を color 区別
 *  - View 2 Inline diff: 1 column、changed segment のみ展開 (AddressDiffBlock char-level algorithm 取込)
 *  - View 3 Field table: Structured record で 各 field × before/after column 行表示
 *
 * Page-別 design (gate1-decision.md F-2 採用方針):
 *  - CaseReview: defaultView='inline' / availableViews=['inline','fieldTable'] (案 A)
 *  - ProposalReview: defaultView='sideBySide' / availableViews=['sideBySide','inline'] (案 B)
 *
 * AddressDiffBlock は **deprecate せず** existing usage を retain。本 component は wrapper として並列。
 */

export type DiffView = 'inline' | 'sideBySide' | 'fieldTable'

export type DiffSource =
  | { kind: 'fields'; fields: CaseField[] }
  | { kind: 'sections'; sections: ProposalDiffSection[] }

interface DiffPreviewBlockProps {
  source: DiffSource
  defaultView: DiffView
  availableViews: DiffView[]
  onViewChange?: (v: DiffView) => void
  className?: string
}

const viewLabel: Record<DiffView, string> = {
  inline: 'インライン',
  sideBySide: '並列',
  fieldTable: '項目表',
}

/** Char-level common prefix/suffix diff (AddressDiffBlock pattern 踏襲) */
function diffSegments(before: string, after: string): {
  prefix: string
  removed: string
  added: string
  suffix: string
} {
  let prefixLen = 0
  const minLen = Math.min(before.length, after.length)
  while (prefixLen < minLen && before[prefixLen] === after[prefixLen]) prefixLen += 1
  let suffixLen = 0
  while (
    suffixLen < minLen - prefixLen &&
    before[before.length - 1 - suffixLen] === after[after.length - 1 - suffixLen]
  )
    suffixLen += 1
  return {
    prefix: before.slice(0, prefixLen),
    removed: before.slice(prefixLen, before.length - suffixLen),
    added: after.slice(prefixLen, after.length - suffixLen),
    suffix: before.slice(before.length - suffixLen) || after.slice(after.length - suffixLen),
  }
}

function InlineDiff({ before, after }: { before: string; after: string }) {
  const seg = diffSegments(before, after)
  return (
    <span className="whitespace-pre-wrap break-words text-[13px] leading-relaxed text-slate-900">
      {seg.prefix}
      {seg.removed && (
        <span className="text-red-700 line-through decoration-red-400">{seg.removed}</span>
      )}
      {seg.added && (
        <span className="rounded bg-emerald-50 px-1 font-medium text-emerald-700 underline decoration-emerald-400">
          {seg.added}
        </span>
      )}
      {seg.suffix}
    </span>
  )
}

function SideBySidePair({ before, after }: { before: string; after: string }) {
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <div className="rounded-md border border-red-200 bg-red-50/40 p-3">
        <div className="mb-1 font-mono text-[10px] uppercase tracking-wide text-red-700">変更前</div>
        <div className="whitespace-pre-wrap break-words text-[13px] leading-relaxed text-slate-800">
          {before}
        </div>
      </div>
      <div className="rounded-md border border-emerald-200 bg-emerald-50/40 p-3">
        <div className="mb-1 font-mono text-[10px] uppercase tracking-wide text-emerald-700">
          変更後
        </div>
        <div className="whitespace-pre-wrap break-words text-[13px] leading-relaxed text-slate-800">
          {after}
        </div>
      </div>
    </div>
  )
}

function FieldTableRow({ field }: { field: CaseField }) {
  const hasDiff = field.hasDiff && field.oldValue
  return (
    <tr className="border-b border-slate-100 last:border-b-0">
      <td className="py-2.5 pr-3 align-top">
        <span className="text-[12px] font-medium text-slate-900">{field.label}</span>
      </td>
      <td className="py-2.5 pr-3 align-top">
        {hasDiff ? (
          <span className="block whitespace-pre-wrap break-words text-[12px] leading-relaxed text-slate-600 line-through decoration-red-400">
            {field.oldValue}
          </span>
        ) : (
          <span className="block text-[12px] text-slate-400">—</span>
        )}
      </td>
      <td className="py-2.5 align-top">
        <span
          className={cn(
            'block whitespace-pre-wrap break-words text-[12px] leading-relaxed',
            field.monospace ? 'font-mono tabular' : '',
            hasDiff ? 'rounded bg-emerald-50 px-1 font-medium text-emerald-700' : 'text-slate-800'
          )}
        >
          {field.value}
        </span>
      </td>
    </tr>
  )
}

export function DiffPreviewBlock({
  source,
  defaultView,
  availableViews,
  onViewChange,
  className,
}: DiffPreviewBlockProps) {
  const [view, setView] = useState<DiffView>(defaultView)

  const change = (next: DiffView) => {
    setView(next)
    onViewChange?.(next)
  }

  return (
    <div
      className={cn('rounded-md border border-slate-200 bg-white', className)}
      role="region"
      aria-label="差分プレビュー"
    >
      {/* View toggle (2-3 view、availableViews が単一なら toggle 自体を hide) */}
      {availableViews.length > 1 && (
        <div className="flex items-center gap-1.5 border-b border-slate-200 px-3 py-1.5">
          <span className="font-mono text-[10px] uppercase tracking-wide text-slate-500">表示</span>
          <div role="group" aria-label="差分表示モード" className="inline-flex items-center gap-1">
            {availableViews.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => change(v)}
                className={cn(
                  'rounded-md px-2 py-0.5 text-[11px] transition-colors',
                  view === v
                    ? 'bg-[var(--color-primary-soft)] font-medium text-[var(--color-primary)]'
                    : 'text-slate-600 hover:bg-slate-50'
                )}
                aria-pressed={view === v}
              >
                {viewLabel[v]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content per view × source */}
      <div className="p-3">
        {source.kind === 'fields' && (
          <>
            {view === 'fieldTable' && (
              <table className="w-full table-fixed">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="w-[18%] py-2 pr-3 text-left font-mono text-[10px] uppercase tracking-wide text-slate-500">
                      項目
                    </th>
                    <th className="w-[41%] py-2 pr-3 text-left font-mono text-[10px] uppercase tracking-wide text-slate-500">
                      変更前
                    </th>
                    <th className="py-2 text-left font-mono text-[10px] uppercase tracking-wide text-slate-500">
                      変更後 / 値
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {source.fields.map((f) => (
                    <FieldTableRow key={f.label} field={f} />
                  ))}
                </tbody>
              </table>
            )}
            {view === 'inline' && (
              <ul className="space-y-2">
                {source.fields.map((f) => (
                  <li key={f.label} className="border-l-2 border-slate-200 pl-3">
                    <div className="font-mono text-[10px] uppercase tracking-wide text-slate-500">
                      {f.label}
                    </div>
                    <div className="mt-0.5">
                      {f.hasDiff && f.oldValue ? (
                        <InlineDiff before={f.oldValue} after={f.value} />
                      ) : (
                        <span
                          className={cn(
                            'text-[13px] text-slate-800',
                            f.monospace ? 'font-mono tabular' : ''
                          )}
                        >
                          {f.value}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {view === 'sideBySide' && (
              <ul className="space-y-3">
                {source.fields.map((f) => (
                  <li key={f.label}>
                    <div className="mb-1.5 font-mono text-[10px] uppercase tracking-wide text-slate-500">
                      {f.label}
                    </div>
                    {f.hasDiff && f.oldValue ? (
                      <SideBySidePair before={f.oldValue} after={f.value} />
                    ) : (
                      <div className="rounded-md border border-slate-200 bg-slate-50/40 p-2 text-[13px] text-slate-700">
                        {f.value}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
        {source.kind === 'sections' && (
          <>
            {view === 'sideBySide' && (
              <ul className="space-y-4">
                {source.sections.map((s) => (
                  <li key={`${s.targetFile}#${s.section}`}>
                    <div className="mb-2">
                      <div className="font-mono text-[11px] text-slate-500">{s.targetFile}</div>
                      <div className="text-[12px] font-medium text-slate-900">{s.section}</div>
                    </div>
                    <SideBySidePair before={s.before} after={s.after} />
                  </li>
                ))}
              </ul>
            )}
            {view === 'inline' && (
              <ul className="space-y-4">
                {source.sections.map((s) => (
                  <li key={`${s.targetFile}#${s.section}`}>
                    <div className="mb-1.5">
                      <div className="font-mono text-[11px] text-slate-500">{s.targetFile}</div>
                      <div className="text-[12px] font-medium text-slate-900">{s.section}</div>
                    </div>
                    <div className="rounded-md border border-slate-200 bg-slate-50/40 p-3">
                      <InlineDiff before={s.before} after={s.after} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {view === 'fieldTable' && (
              <table className="w-full table-fixed">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="w-[28%] py-2 pr-3 text-left font-mono text-[10px] uppercase tracking-wide text-slate-500">
                      対象
                    </th>
                    <th className="w-[36%] py-2 pr-3 text-left font-mono text-[10px] uppercase tracking-wide text-slate-500">
                      変更前
                    </th>
                    <th className="py-2 text-left font-mono text-[10px] uppercase tracking-wide text-slate-500">
                      変更後
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {source.sections.map((s) => (
                    <tr
                      key={`${s.targetFile}#${s.section}`}
                      className="border-b border-slate-100 last:border-b-0 align-top"
                    >
                      <td className="py-2.5 pr-3">
                        <div className="font-mono text-[10px] text-slate-500">{s.targetFile}</div>
                        <div className="text-[12px] font-medium text-slate-900">{s.section}</div>
                      </td>
                      <td className="py-2.5 pr-3">
                        <span className="block whitespace-pre-wrap break-words text-[12px] leading-relaxed text-slate-600 line-through decoration-red-400">
                          {s.before}
                        </span>
                      </td>
                      <td className="py-2.5">
                        <span className="block whitespace-pre-wrap break-words rounded bg-emerald-50 px-1 text-[12px] leading-relaxed font-medium text-emerald-700">
                          {s.after}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>
    </div>
  )
}
