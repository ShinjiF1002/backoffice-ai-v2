import { useState } from 'react'
import type { ReactNode } from 'react'
import { ArrowUpIcon, ArrowDownIcon, ChevronsUpDownIcon } from 'lucide-react'

/**
 * DataTable — v2 list archetype の汎用 table (Tier 3 高密度)。
 * 行は単一 hit-target (<a> grid row) で stretched-link/table 競合を回避。
 * - selection: 先頭 checkbox 列 (a11y: checkbox と行 link を別 cell)、一括操作の母集合を screen state で管理。
 * - sort: col.sortValue を持つ列はヘッダが sort button 化 (operator triage、昇順↔降順 toggle)。
 * 各 list 画面は cols + rows + rowHref の薄い config。
 */

export type Col<T> = { label: string; align?: 'right'; render: (row: T) => ReactNode; sortValue?: (row: T) => string | number }

export interface DataTableSelection {
  selectedIds: string[]
  onToggle: (id: string) => void
  onToggleAll: () => void
}

export function DataTable<T,>({
  cols,
  gridCols,
  rows,
  rowHref,
  getKey,
  selection,
}: {
  cols: Col<T>[]
  gridCols: string
  rows: T[]
  rowHref?: (row: T) => string
  getKey: (row: T) => string
  selection?: DataTableSelection
}) {
  const [sort, setSort] = useState<{ label: string; dir: 'asc' | 'desc' } | null>(null)
  const base = `grid ${gridCols} items-center gap-3 px-4`
  const checkboxCls = 'h-4 w-4 flex-shrink-0 cursor-pointer rounded border-[var(--v2-border-strong)] accent-[var(--v2-accent)]'

  // sort: 指定列の sortValue で row を並べ替え (元 rows は不変、copy を sort)。
  const activeCol = sort ? cols.find((c) => c.label === sort.label && c.sortValue) : undefined
  const sortedRows = activeCol && sort
    ? [...rows].sort((a, b) => {
        const av = activeCol.sortValue!(a)
        const bv = activeCol.sortValue!(b)
        const cmp = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv), 'ja')
        return sort.dir === 'asc' ? cmp : -cmp
      })
    : rows
  const toggleSort = (label: string) =>
    setSort((s) => (s && s.label === label ? (s.dir === 'asc' ? { label, dir: 'desc' } : null) : { label, dir: 'asc' }))

  const allSelected = selection ? sortedRows.length > 0 && sortedRows.every((r) => selection.selectedIds.includes(getKey(r))) : false
  const someSelected = selection ? selection.selectedIds.length > 0 && !allSelected : false

  const headerCells = cols.map((c) => {
    const cls = c.align === 'right' ? 'flex items-center justify-end' : 'flex items-center'
    if (!c.sortValue) {
      return <span key={c.label} className={cls}>{c.label}</span>
    }
    const active = sort?.label === c.label
    const Icon = active ? (sort!.dir === 'asc' ? ArrowUpIcon : ArrowDownIcon) : ChevronsUpDownIcon
    return (
      <button
        key={c.label}
        type="button"
        onClick={() => toggleSort(c.label)}
        className={`${cls} gap-1 rounded text-[11px] font-medium uppercase tracking-wide ${active ? 'text-[var(--v2-fg)]' : 'text-[var(--v2-fg-tertiary)] hover:text-[var(--v2-fg)]'}`}
      >
        {c.label}
        <Icon className="h-3 w-3" aria-hidden="true" />
      </button>
    )
  })
  const headerInner = `${base} border-b border-[var(--v2-border)] bg-[var(--v2-panel-inset)] py-2 text-[11px] font-medium uppercase tracking-wide text-[var(--v2-fg-tertiary)]`

  return (
    <div className="overflow-hidden rounded-[var(--v2-radius-card)] border border-[var(--v2-border)] bg-[var(--v2-panel)] shadow-[var(--v2-shadow-sm)]">
      {/* header */}
      {selection ? (
        <div className="grid grid-cols-[44px_1fr] items-center border-b border-[var(--v2-border)] bg-[var(--v2-panel-inset)]">
          <span className="flex items-center justify-center">
            <input
              type="checkbox"
              checked={allSelected}
              ref={(el) => { if (el) el.indeterminate = someSelected }}
              onChange={selection.onToggleAll}
              aria-label="すべて選択 / 解除"
              className={checkboxCls}
            />
          </span>
          <div className={`${base} py-2`}>{headerCells}</div>
        </div>
      ) : (
        <div className={headerInner}>{headerCells}</div>
      )}

      {/* rows */}
      <ul>
        {sortedRows.map((r) => {
          const key = getKey(r)
          const inner = cols.map((c) => (
            <span key={c.label} className={c.align === 'right' ? 'min-w-0 text-right' : 'min-w-0'}>
              {c.render(r)}
            </span>
          ))
          const rowCls = `${base} py-2.5 text-[13px] transition-colors`
          if (selection) {
            const checked = selection.selectedIds.includes(key)
            return (
              <li key={key}>
                <div className={'grid grid-cols-[44px_1fr] items-center border-b border-[var(--v2-hairline)] last:border-b-0 ' + (checked ? 'bg-[var(--v2-accent-soft)]' : '')}>
                  <span className="flex items-center justify-center">
                    <input type="checkbox" checked={checked} onChange={() => selection.onToggle(key)} aria-label={`${key} を選択`} className={checkboxCls} />
                  </span>
                  {rowHref ? (
                    <a href={rowHref(r)} className={`${rowCls} hover:bg-[var(--v2-panel-inset)]`}>{inner}</a>
                  ) : (
                    <div className={rowCls}>{inner}</div>
                  )}
                </div>
              </li>
            )
          }
          const cls = `${rowCls} border-b border-[var(--v2-hairline)] last:border-b-0`
          return (
            <li key={key}>
              {rowHref ? (
                <a href={rowHref(r)} className={`${cls} hover:bg-[var(--v2-panel-inset)]`}>{inner}</a>
              ) : (
                <div className={cls}>{inner}</div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
