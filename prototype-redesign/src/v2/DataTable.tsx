import type { ReactNode } from 'react'

/**
 * DataTable — v2 list archetype の汎用 table (Tier 3 高密度)。
 * 行は単一 hit-target (<a> grid row) で stretched-link/table 競合を回避。
 * 各 list 画面は cols + rows + rowHref の薄い config になる。
 */

export type Col<T> = { label: string; align?: 'right'; render: (row: T) => ReactNode }

export function DataTable<T,>({
  cols,
  gridCols,
  rows,
  rowHref,
  getKey,
}: {
  cols: Col<T>[]
  gridCols: string
  rows: T[]
  rowHref?: (row: T) => string
  getKey: (row: T) => string
}) {
  const base = `grid ${gridCols} items-center gap-3 px-4`
  return (
    <div className="overflow-hidden rounded-[var(--v2-radius-card)] border border-[var(--v2-border)] bg-[var(--v2-panel)] shadow-[var(--v2-shadow-sm)]">
      <div className={`${base} border-b border-[var(--v2-border)] bg-[var(--v2-panel-inset)] py-2 text-[11px] font-medium uppercase tracking-wide text-[var(--v2-fg-tertiary)]`}>
        {cols.map((c) => (
          <span key={c.label} className={c.align === 'right' ? 'text-right' : ''}>
            {c.label}
          </span>
        ))}
      </div>
      <ul>
        {rows.map((r) => {
          const inner = cols.map((c) => (
            <span key={c.label} className={c.align === 'right' ? 'min-w-0 text-right' : 'min-w-0'}>
              {c.render(r)}
            </span>
          ))
          const cls = `${base} border-b border-[var(--v2-hairline)] py-2.5 text-[13px] transition-colors last:border-b-0`
          return (
            <li key={getKey(r)}>
              {rowHref ? (
                <a href={rowHref(r)} className={`${cls} hover:bg-[var(--v2-panel-inset)]`}>
                  {inner}
                </a>
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
