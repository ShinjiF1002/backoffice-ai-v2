import { useState } from 'react'
import { StarIcon, CheckIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { CASE_LIST } from '@/data/mock-case-list'
import type { CaseStatus } from '@/data/types'
import { useCases, useStoreDispatch } from '@/store/hooks'
import { useView } from '@/context/view-context'
import { caseElapsedLabel } from '@/lib/dates'
import { Toast } from '@/components/shared/Toast'
import { useToast } from '@/hooks/useToast'
import { PageHeader, StatusChip, CountChip, FilterChip } from './ui'
import { DataTable } from './DataTable'

/**
 * CasesV2 — 案件キュー (list、store 配線済)。ProcessSelector の業務 filter (useView().process) を反映。
 * 行 click → CaseDetailV2、checkbox 選択 → 一括入力者確認 (case/bulkApprove by:input、ready かつ要確認0 のみ)。
 * 経過/担当/確認 列は sort 可能、経過は受付 datetime から caseElapsedLabel で算出 (reflected=処理済)。
 */

/** recommended は store CaseEntity に無い → list mock から id 引きで補完 (v2 一覧の推奨マーカー保全)。 */
const RECOMMENDED_BY_ID: Record<string, boolean> = Object.fromEntries(CASE_LIST.map((r) => [r.id, !!r.recommended]))

const FILTERS: { key: CaseStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'すべて' },
  { key: 'ready', label: '確認待ち' },
  { key: 'business-approval-waiting', label: '承認待ち' },
  { key: 'sent-back', label: '差戻し' },
  { key: 'pending', label: '受付済' },
  { key: 'reflected', label: '反映済' },
]

export function CasesV2() {
  const { process } = useView()
  const cases = useCases(process)
  const dispatch = useStoreDispatch()
  const { toast, show: showToast, dismiss } = useToast()
  const [filter, setFilter] = useState<CaseStatus | 'all'>('all')
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const allRows = cases.map((e) => ({
    id: e.id,
    workflow: e.workflowName,
    status: e.status,
    owner: e.assignee ?? '—',
    flags: e.flags,
    recommended: RECOMMENDED_BY_ID[e.id] ?? false,
    receivedAt: e.receivedAt,
  }))
  const rows = filter === 'all' ? allRows : allRows.filter((r) => r.status === filter)
  const countFor = (k: CaseStatus | 'all') => (k === 'all' ? allRows.length : allRows.filter((r) => r.status === k).length)

  const validIds = new Set(rows.map((r) => r.id))
  const selected = selectedIds.filter((id) => validIds.has(id))
  const toggle = (id: string) => setSelectedIds((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
  const toggleAll = () => setSelectedIds(() => (rows.every((r) => selected.includes(r.id)) ? [] : rows.map((r) => r.id)))

  // 一括入力者確認: 選択が全て ready かつ要確認0 のときのみ活性 (要確認残は個別判断のまま、v1 F-029 parity)。
  const selectedRows = rows.filter((r) => selected.includes(r.id))
  const bulkDisabled = selected.length === 0 || selectedRows.some((r) => !(r.status === 'ready' && r.flags === 0))
  const runBulk = () => {
    if (bulkDisabled) return
    dispatch({ type: 'case/bulkApprove', ids: selected, by: 'input' })
    const n = selected.length
    setSelectedIds([])
    showToast(`${n} 件を入力者確認しました — 承認者待ちへ`)
  }

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="案件キュー"
        sub={
          <>
            処理待ちの案件 — <span className="v2-tnum font-medium text-[var(--v2-fg)]">{allRows.length}</span> 件
          </>
        }
        actions={
          <Link to="/cases/new" className="flex h-8 items-center gap-1.5 rounded-[var(--v2-radius-control)] border border-[var(--v2-border-strong)] bg-[var(--v2-panel)] px-3 text-[13px] font-medium text-[var(--v2-fg)] hover:bg-[var(--v2-panel-inset)]">
            起票
          </Link>
        }
      />

      {/* filters */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[var(--v2-border)] bg-[var(--v2-panel)] px-6 py-2.5">
        {FILTERS.map((f) => (
          <FilterChip key={f.key} label={f.label} count={countFor(f.key)} active={filter === f.key} onClick={() => setFilter(f.key)} />
        ))}
      </div>

      {/* selection toolbar */}
      {selected.length > 0 && (
        <div className="flex items-center justify-between gap-3 border-b border-[var(--v2-border)] bg-[var(--v2-panel)] px-6 py-2">
          <span className="text-[12px] text-[var(--v2-fg-muted)]">
            <span className="v2-tnum font-medium text-[var(--v2-fg)]">{selected.length}</span> 件を選択中
          </span>
          <button
            type="button"
            disabled={bulkDisabled}
            title={bulkDisabled ? '確認待ち・要確認なしの案件のみ一括入力者確認できます' : undefined}
            onClick={runBulk}
            className={
              'flex items-center gap-1.5 rounded-[var(--v2-radius-control)] px-3.5 py-1.5 text-[13px] font-medium ' +
              (bulkDisabled ? 'cursor-not-allowed bg-[var(--v2-panel-inset)] text-[var(--v2-fg-subtle)]' : 'bg-[var(--v2-accent)] text-white hover:bg-[var(--v2-accent-hover)]')
            }
          >
            <CheckIcon className="h-4 w-4" aria-hidden="true" />
            全項目一致をまとめて入力者確認
          </button>
        </div>
      )}

      {/* table */}
      <div className="flex-1 overflow-auto px-6 py-4">
        <DataTable
          gridCols="grid-cols-[148px_1fr_116px_104px_92px_104px]"
          rows={rows}
          getKey={(r) => r.id}
          rowHref={(r) => '/cases/' + r.id}
          selection={{ selectedIds: selected, onToggle: toggle, onToggleAll: toggleAll }}
          cols={[
            {
              label: '案件ID',
              render: (r) => (
                <span className="v2-mono flex items-center gap-1.5 font-medium text-[var(--v2-fg)]">
                  {r.recommended && <StarIcon className="h-3 w-3 flex-shrink-0 text-[var(--v2-accent-strong)]" aria-label="推奨" />}
                  {r.id}
                </span>
              ),
            },
            { label: '業務', render: (r) => <span className="truncate text-[var(--v2-fg)]">{r.workflow}</span> },
            { label: '状態', render: (r) => <StatusChip status={r.status} /> },
            { label: '担当', sortValue: (r) => r.owner, render: (r) => <span className="truncate text-[var(--v2-fg-muted)]">{r.owner === '—' ? '未割当' : r.owner}</span> },
            { label: '確認', sortValue: (r) => r.flags, render: (r) => <CountChip n={r.flags} /> },
            { label: '経過', align: 'right', sortValue: (r) => new Date(r.receivedAt).getTime(), render: (r) => <span className="v2-tnum text-[var(--v2-fg-tertiary)]">{caseElapsedLabel(r.receivedAt, r.status)}</span> },
          ]}
        />
      </div>
      <Toast toast={toast} onDismiss={dismiss} />
    </div>
  )
}
