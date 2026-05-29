import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ChevronUpIcon, ChevronDownIcon, ChevronsUpDownIcon } from 'lucide-react'
import { cn } from '@/lib/cn'
import { FilterChip } from './FilterChip'
import { EmptyState } from './EmptyState'
import { ErrorState } from './ErrorState'
import { LoadingState } from './LoadingState'

/**
 * DataTable — 共通 list table (Phase 3 — list 操作性)。
 * SSOT: ~/.claude/plans/reactive-percolating-gizmo.md Phase 3 / Track B。
 *
 * typed column config (open children でなく typed props で構造散逸を防ぐ)。
 * 行は <Link> stretched-link 化 (Cmd+click 新規タブ + keyboard 到達 + 可視 focus ring)。
 * 列 sort / 状態+担当 filter (FilterChip) / pinTop (要確認上部固定) / pageSize pagination /
 * selection (複数選択 UI、実行は呼び出し側) / md 未満 card layout / Empty/Error/Loading status。
 *
 * stretched-link の視覚 stretch は browser 依存 → R0 Gate の実ブラウザ smoke で確認 (Phase 3 計画注記)。
 */
export interface DataTableColumn<Row> {
  key: string
  header: string
  cell: (row: Row) => ReactNode
  /** 指定列のみ sort 可 (比較キー抽出) */
  sortValue?: (row: Row) => string | number
  /** th/td の幅・揃え class (layout invariant) */
  className?: string
  /** md 未満 card で「header: 値」のラベルを出すか (default true) */
  mobileLabel?: boolean
}

export interface DataTableFilter<Row> {
  id: string
  label: string
  options: { value: string; label: string }[]
  predicate: (row: Row, activeValues: string[]) => boolean
}

export interface DataTableSelectionAction<Row> {
  label: string
  icon?: ReactNode
  onRun: (ids: string[]) => void
  /** 選択行集合に対する無効化 (例: 要確認残があれば一括承認不可) */
  disabled?: (rows: Row[]) => boolean
}

export type DataTableStatus = 'ready' | 'loading' | 'empty' | 'filtered-empty' | 'error'

export interface DataTableProps<Row> {
  rows: Row[]
  columns: DataTableColumn<Row>[]
  rowKey: (row: Row) => string
  /** 行 → 詳細 URL (Link 化)。null は非リンク行 */
  rowHref: (row: Row) => string | null
  ariaLabel: string
  /** 行強調 (token class、例 Cases recommended) */
  rowClassName?: (row: Row) => string | undefined
  /** 要確認上部固定: true の行を sort 後も先頭群へ */
  pinTop?: (row: Row) => boolean
  filters?: DataTableFilter<Row>[]
  /** 指定時のみ pagination。未指定は全件表示 */
  pageSize?: number
  /** 複数選択 UI (実行 handler は呼び出し側)。未指定なら選択列なし */
  selection?: { actions: DataTableSelectionAction<Row>[] }
  /** 明示 status (loading/error)。未指定なら rows から empty/filtered-empty/ready を自動判定 */
  status?: DataTableStatus
  emptyTitle?: string
  emptyDescription?: string
  errorTitle?: string
  onRetry?: () => void
  /** 表下の注記 */
  caption?: ReactNode
}

const thBase = 'px-4 py-2 font-medium'
const tdBase = 'px-4 py-2.5'

export function DataTable<Row>({
  rows,
  columns,
  rowKey,
  rowHref,
  ariaLabel,
  rowClassName,
  pinTop,
  filters,
  pageSize,
  selection,
  status,
  emptyTitle = '該当する項目がありません',
  emptyDescription,
  errorTitle = 'データの取得に失敗しました',
  onRetry,
  caption,
}: DataTableProps<Row>) {
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [active, setActive] = useState<Record<string, string[]>>({})
  const [page, setPage] = useState(0)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const hasActiveFilter = Object.values(active).some((v) => v.length > 0)

  const filtered = useMemo(() => {
    if (!filters) return rows
    return rows.filter((row) =>
      filters.every((f) => {
        const vals = active[f.id] ?? []
        return vals.length === 0 || f.predicate(row, vals)
      }),
    )
  }, [rows, filters, active])

  const sorted = useMemo(() => {
    const col = columns.find((c) => c.key === sortKey)
    let r = filtered
    if (col?.sortValue) {
      const get = col.sortValue
      r = [...filtered].sort((a, b) => {
        const av = get(a)
        const bv = get(b)
        const cmp = av < bv ? -1 : av > bv ? 1 : 0
        return sortDir === 'asc' ? cmp : -cmp
      })
    }
    if (pinTop) {
      const pinned = r.filter(pinTop)
      const rest = r.filter((x) => !pinTop(x))
      r = [...pinned, ...rest]
    }
    return r
  }, [filtered, columns, sortKey, sortDir, pinTop])

  const totalPages = pageSize ? Math.max(1, Math.ceil(sorted.length / pageSize)) : 1
  const safePage = Math.min(page, totalPages - 1)
  const pageRows = pageSize ? sorted.slice(safePage * pageSize, (safePage + 1) * pageSize) : sorted

  const effectiveStatus: DataTableStatus =
    status ?? (sorted.length === 0 ? (hasActiveFilter ? 'filtered-empty' : 'empty') : 'ready')

  const toggleFilter = (filterId: string, value: string) => {
    setActive((prev) => {
      const cur = prev[filterId] ?? []
      const next = cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value]
      return { ...prev, [filterId]: next }
    })
    setPage(0)
  }

  const resetFilters = () => {
    setActive({})
    setPage(0)
  }

  const toggleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  // 選択は filter/sort 後の表示集合 (scope) に正規化。filter で hidden になった ID は
  // 件数・payload・disabled 判定から除外する (一括操作に stale/hidden 行が混入するのを防ぐ)。
  const selectedInScope = sorted.filter((r) => selected.has(rowKey(r)))
  const selectedInScopeIds = selectedInScope.map(rowKey)
  const allVisibleSelected = pageRows.length > 0 && pageRows.every((r) => selected.has(rowKey(r)))
  const toggleSelectAll = () => {
    setSelected((prev) => {
      const next = new Set(prev)
      const allSel = pageRows.every((r) => next.has(rowKey(r)))
      for (const r of pageRows) {
        if (allSel) next.delete(rowKey(r))
        else next.add(rowKey(r))
      }
      return next
    })
  }
  const toggleSelectRow = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="flex flex-col gap-3">
      {/* filter chips */}
      {filters && filters.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          {filters.map((f) => (
            <div key={f.id} className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-medium text-[var(--color-fg-muted)]">{f.label}</span>
              {f.options.map((o) => (
                <FilterChip
                  key={o.value}
                  label={o.label}
                  active={(active[f.id] ?? []).includes(o.value)}
                  onClick={() => toggleFilter(f.id, o.value)}
                />
              ))}
            </div>
          ))}
          {hasActiveFilter && (
            <button
              type="button"
              onClick={resetFilters}
              className="text-[11px] font-medium text-[var(--color-primary)] hover:underline"
            >
              絞り込みを解除
            </button>
          )}
        </div>
      )}

      {/* 一括操作バー (選択中、in-scope のみ集計) */}
      {selection && selectedInScope.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-[var(--radius-control)] border border-[var(--color-primary-soft-border)] bg-[var(--color-primary-soft)] px-3 py-2 text-xs">
          <span className="font-medium text-[var(--color-primary)]">{selectedInScope.length} 件選択中</span>
          {selection.actions.map((a) => {
            const disabled = a.disabled?.(selectedInScope) ?? false
            return (
              <button
                key={a.label}
                type="button"
                disabled={disabled}
                onClick={() => a.onRun(selectedInScopeIds)}
                className={cn(
                  'inline-flex items-center gap-1 rounded-[var(--radius-control)] px-2.5 py-1 text-[11px] font-medium',
                  disabled
                    ? 'cursor-not-allowed bg-[var(--color-panel-inset)] text-[var(--color-fg-subtle)]'
                    : 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]',
                )}
              >
                {a.icon}
                {a.label}
              </button>
            )
          })}
        </div>
      )}

      {effectiveStatus === 'loading' ? (
        <LoadingState variant="skeleton" rowCount={pageSize ?? 6} />
      ) : effectiveStatus === 'error' ? (
        <ErrorState title={errorTitle} onRetry={onRetry} />
      ) : effectiveStatus === 'empty' || effectiveStatus === 'filtered-empty' ? (
        <EmptyState
          subState={effectiveStatus === 'filtered-empty' ? 'filtered-empty' : 'truly-empty'}
          title={effectiveStatus === 'filtered-empty' ? '条件に一致する項目がありません' : emptyTitle}
          description={emptyDescription}
          action={
            effectiveStatus === 'filtered-empty' ? (
              <button
                type="button"
                onClick={resetFilters}
                className="rounded-[var(--radius-control)] border border-[var(--color-border-strong)] bg-[var(--color-panel)] px-3 py-1.5 text-xs font-medium text-[var(--color-fg)] hover:bg-[var(--color-panel-inset)]"
              >
                絞り込みを解除
              </button>
            ) : undefined
          }
        />
      ) : (
        <>
          {/* desktop table (md 以上) */}
          <div className="hidden overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-panel)] md:block">
            <table className="w-full text-sm" aria-label={ariaLabel}>
              <thead>
                <tr className="border-b border-[var(--color-border)] text-left text-xs text-[var(--color-fg-muted)]">
                  {selection && (
                    <th className="w-10 px-4 py-2">
                      <input
                        type="checkbox"
                        aria-label="表示中をすべて選択"
                        checked={allVisibleSelected}
                        onChange={toggleSelectAll}
                      />
                    </th>
                  )}
                  {columns.map((c) => {
                    const sortable = !!c.sortValue
                    const isSorted = sortKey === c.key
                    return (
                      <th
                        key={c.key}
                        className={cn(thBase, c.className)}
                        aria-sort={isSorted ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined}
                      >
                        {sortable ? (
                          <button
                            type="button"
                            onClick={() => toggleSort(c.key)}
                            className="inline-flex items-center gap-1 font-medium hover:text-[var(--color-fg)]"
                          >
                            {c.header}
                            {isSorted ? (
                              sortDir === 'asc' ? (
                                <ChevronUpIcon className="h-3 w-3" />
                              ) : (
                                <ChevronDownIcon className="h-3 w-3" />
                              )
                            ) : (
                              <ChevronsUpDownIcon className="h-3 w-3 text-[var(--color-fg-subtle)]" />
                            )}
                          </button>
                        ) : (
                          c.header
                        )}
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody>
                {pageRows.map((row) => {
                  const id = rowKey(row)
                  const href = rowHref(row)
                  return (
                    <tr
                      key={id}
                      className={cn(
                        'relative border-b border-[var(--color-border)] last:border-b-0 hover:bg-[var(--color-panel-inset)] focus-within:bg-[var(--color-panel-inset)]',
                        rowClassName?.(row),
                      )}
                    >
                      {selection && (
                        <td className="relative z-10 w-10 px-4 py-2.5">
                          <input
                            type="checkbox"
                            aria-label={`${id} を選択`}
                            checked={selected.has(id)}
                            onChange={() => toggleSelectRow(id)}
                          />
                        </td>
                      )}
                      {columns.map((c, ci) => (
                        <td key={c.key} className={cn(tdBase, c.className)}>
                          {/* 先頭セルに stretched-link を置き行全体をクリック可能化 (内側 interactive は relative z-10) */}
                          {ci === 0 && href ? (
                            <Link
                              to={href}
                              className="after:absolute after:inset-0 after:rounded-[var(--radius-control)] after:content-[''] focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-inset focus-visible:after:ring-[var(--color-primary)]"
                            >
                              {c.cell(row)}
                            </Link>
                          ) : (
                            c.cell(row)
                          )}
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* mobile card (md 未満)。selection 時は checkbox を Link の兄弟に置く (Link 内 checkbox は navigate と競合) */}
          <ul className="flex flex-col gap-2 md:hidden">
            {pageRows.map((row) => {
              const id = rowKey(row)
              const href = rowHref(row)
              const content = columns.map((c) => (
                <div key={c.key} className="flex items-baseline justify-between gap-3 py-0.5 text-sm">
                  {c.mobileLabel !== false && <span className="shrink-0 text-[11px] text-[var(--color-fg-muted)]">{c.header}</span>}
                  <span className="min-w-0 text-right">{c.cell(row)}</span>
                </div>
              ))
              return (
                <li
                  key={id}
                  className={cn(
                    'flex items-start gap-2 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-panel)] p-3',
                    rowClassName?.(row),
                  )}
                >
                  {selection && (
                    <input
                      type="checkbox"
                      aria-label={`${id} を選択`}
                      checked={selected.has(id)}
                      onChange={() => toggleSelectRow(id)}
                      className="mt-1 shrink-0"
                    />
                  )}
                  {href ? (
                    <Link
                      to={href}
                      className="block min-w-0 flex-1 rounded-[var(--radius-control)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
                    >
                      {content}
                    </Link>
                  ) : (
                    <div className="min-w-0 flex-1">{content}</div>
                  )}
                </li>
              )
            })}
          </ul>

          {/* pagination */}
          {pageSize && totalPages > 1 && (
            <div className="flex items-center justify-between text-xs text-[var(--color-fg-muted)]">
              <span>
                {sorted.length} 件中 {safePage * pageSize + 1}–{Math.min((safePage + 1) * pageSize, sorted.length)} 件
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={safePage === 0}
                  onClick={() => setPage(safePage - 1)}
                  className="rounded-[var(--radius-control)] border border-[var(--color-border-strong)] bg-[var(--color-panel)] px-2.5 py-1 font-medium text-[var(--color-fg)] disabled:cursor-not-allowed disabled:text-[var(--color-fg-subtle)]"
                >
                  前へ
                </button>
                <span>
                  {safePage + 1} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={safePage >= totalPages - 1}
                  onClick={() => setPage(safePage + 1)}
                  className="rounded-[var(--radius-control)] border border-[var(--color-border-strong)] bg-[var(--color-panel)] px-2.5 py-1 font-medium text-[var(--color-fg)] disabled:cursor-not-allowed disabled:text-[var(--color-fg-subtle)]"
                >
                  次へ
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {caption && <p className="px-1 text-[10px] text-[var(--color-fg-subtle)]">{caption}</p>}
    </div>
  )
}
