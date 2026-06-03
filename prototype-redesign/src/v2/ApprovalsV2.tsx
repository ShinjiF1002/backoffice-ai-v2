import { useState } from 'react'
import { CheckIcon, AlertTriangleIcon } from 'lucide-react'
import { useApprovals, useStoreDispatch, useCurrentActor } from '@/store/hooks'
import { useView } from '@/context/view-context'
import { roleLabel } from '@/store/actors'
import { resolveCaseActors } from '@/store/selectors'
import { CASE_DETAILS } from '@/data/mock-case-detail'
import { caseElapsedLabel } from '@/lib/dates'
import { Toast } from '@/components/shared/Toast'
import { useToast } from '@/hooks/useToast'
import { PageHeader, ToneChip } from './ui'
import { DataTable } from './DataTable'

/**
 * ApprovalsV2 — 承認待ち (list、store 配線済)。承認者の最終承認待ちキュー。
 * 行 click → CaseDetailV2 (単一最終承認)、checkbox 選択 → 一括最終承認 (case/bulkApprove by:checker)。
 * SoD (四眼原則): 自分が入力者承認した案件は reducer が skip + UI で disabled/理由提示 (F-025/F-027)。
 */
export function ApprovalsV2() {
  const { process } = useView()
  const approvals = useApprovals(process)
  const dispatch = useStoreDispatch()
  const actor = useCurrentActor()
  const { toast, show: showToast, dismiss } = useToast()
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const rows = approvals.map((e) => {
    const { inputterName, approverName } = resolveCaseActors(e, CASE_DETAILS[e.id])
    return {
      id: e.id,
      workflow: e.workflowName,
      judgement: (e.resolvedFieldIds.length > 0 ? 'modified' : 'approved') as 'modified' | 'approved',
      modifiedCount: e.resolvedFieldIds.length,
      inputter: inputterName,
      approver: approverName,
      flags: e.flags,
      inputApprovedBy: e.inputApprovedBy,
      elapsed: caseElapsedLabel(e.receivedAt, e.status),
    }
  })

  // store 操作で queue が縮んだら消えた id を選択から除く。
  const validIds = new Set(rows.map((r) => r.id))
  const selected = selectedIds.filter((id) => validIds.has(id))
  const toggle = (id: string) => setSelectedIds((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
  const toggleAll = () => setSelectedIds(() => (rows.every((r) => selected.includes(r.id)) ? [] : rows.map((r) => r.id)))

  // F-025: 操作前の権限提示。入力者、または可視行すべてを自分が入力者承認している (押しても全件 skip) 場合。
  const blocksAll = rows.length > 0 && rows.every((r) => r.inputApprovedBy !== undefined && r.inputApprovedBy === actor?.id)
  const showPermissionHint = actor?.role === 'inputter' || blocksAll

  const selectedRows = rows.filter((r) => selected.includes(r.id))
  const bulkDisabled =
    selectedRows.length === 0 ||
    selectedRows.some((r) => r.flags > 0) ||
    selectedRows.every((r) => r.inputApprovedBy !== undefined && r.inputApprovedBy === actor?.id)
  const bulkDisabledReason = selectedRows.some((r) => r.flags > 0)
    ? '要確認の残る案件は一括承認できません'
    : '選択した案件はすべて自分が入力者承認したため承認できません（四眼原則）。承認者に切替えてください。'

  const runBulk = () => {
    if (bulkDisabled) return
    const skipped = selectedRows.filter((r) => r.inputApprovedBy !== undefined && r.inputApprovedBy === actor?.id).length
    dispatch({ type: 'case/bulkApprove', ids: selected, by: 'checker' })
    const approved = selectedRows.length - skipped
    setSelectedIds([])
    if (skipped > 0) showToast(`${approved} 件を最終承認しました（自己承認 ${skipped} 件は四眼原則によりスキップ）`, { tone: 'alert', sticky: true })
    else showToast(`${approved} 件を最終承認しました`)
  }

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="承認待ち"
        sub={
          <>
            承認者の最終承認待ち — <span className="v2-tnum font-medium text-[var(--v2-fg)]">{rows.length}</span> 件（入力者 ≠ 承認者）
          </>
        }
      />
      {showPermissionHint && (
        <div className="flex items-center gap-1.5 border-b border-[var(--v2-alert-soft-border)] bg-[var(--v2-alert-soft)] px-6 py-2 text-[12px] font-medium text-[var(--v2-alert-soft-fg)]">
          <AlertTriangleIcon className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
          現在の操作者は「{actor ? roleLabel(actor.role) : '—'}」です。最終承認は承認者の操作で、自分が入力者承認した案件は承認できません（四眼原則）。右上で承認者に切替えてください。
        </div>
      )}
      {selected.length > 0 && (
        <div className="flex items-center justify-between gap-3 border-b border-[var(--v2-border)] bg-[var(--v2-panel)] px-6 py-2">
          <span className="text-[12px] text-[var(--v2-fg-muted)]">
            <span className="v2-tnum font-medium text-[var(--v2-fg)]">{selected.length}</span> 件を選択中
          </span>
          <button
            type="button"
            disabled={bulkDisabled}
            title={bulkDisabled ? bulkDisabledReason : undefined}
            onClick={runBulk}
            className={
              'flex items-center gap-1.5 rounded-[var(--v2-radius-control)] px-3.5 py-1.5 text-[13px] font-medium ' +
              (bulkDisabled ? 'cursor-not-allowed bg-[var(--v2-panel-inset)] text-[var(--v2-fg-subtle)]' : 'bg-[var(--v2-accent)] text-white hover:bg-[var(--v2-accent-hover)]')
            }
          >
            <CheckIcon className="h-4 w-4" aria-hidden="true" />
            選択した {selected.length} 件を最終承認
          </button>
        </div>
      )}
      <div className="flex-1 overflow-auto px-6 py-4">
        <DataTable
          gridCols="grid-cols-[150px_1fr_116px_72px_100px_100px_88px]"
          rows={rows}
          getKey={(r) => r.id}
          rowHref={(r) => '/cases/' + r.id}
          selection={{ selectedIds: selected, onToggle: toggle, onToggleAll: toggleAll }}
          cols={[
            { label: '案件ID', render: (r) => <span className="v2-mono font-medium text-[var(--v2-fg)]">{r.id}</span> },
            { label: '業務', render: (r) => <span className="truncate text-[var(--v2-fg)]">{r.workflow}</span> },
            { label: '入力者の判断', render: (r) => <ToneChip tone={r.judgement === 'modified' ? 'alert' : 'success'} label={r.judgement === 'modified' ? '上書きあり' : '承認'} /> },
            { label: '上書き', render: (r) => <span className="v2-tnum text-[var(--v2-fg-muted)]">{r.modifiedCount || '—'}</span> },
            { label: '入力者', render: (r) => <span className="truncate text-[var(--v2-fg-muted)]">{r.inputter}</span> },
            { label: '承認者', render: (r) => <span className="truncate text-[var(--v2-fg-muted)]">{r.approver}</span> },
            { label: '経過', align: 'right', render: (r) => <span className="v2-tnum text-[var(--v2-fg-tertiary)]">{r.elapsed}</span> },
          ]}
        />
      </div>
      <Toast toast={toast} onDismiss={dismiss} />
    </div>
  )
}
