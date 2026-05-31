import { useState } from 'react'
import { ChevronRightIcon, ShieldCheckIcon, PencilLineIcon, CheckIcon } from 'lucide-react'
import { useApprovals, useStoreDispatch, useCurrentActor } from '@/store/hooks'
import { useView } from '@/context/view-context'
import { useListData } from '@/hooks/useListData'
import { caseElapsedLabel } from '@/lib/dates'
import { CASE_DETAILS } from '@/data/mock-case-detail'
import { MetaChip } from '@/components/shared/MetaChip'
import { DataTable } from '@/components/shared/DataTable'
import type { DataTableColumn, DataTableFilter } from '@/components/shared/DataTable'

/**
 * 承認待ち (Approvals, /approvals) — B 型 queue / 承認者
 * SSOT: screen-contracts-v2 §3 / screens-v2/03-approvals。Phase 4b で store-truth 化。
 * rows は useApprovals() (business-approval-waiting) 由来。承認すると queue から消える (D1/D9)。
 * inputter/approver は detail dict から join、modifiedCount は store の resolvedFieldIds.length 由来
 * (この端末での修正件数。過去履歴の事実ではない、R3)。一括承認は case/bulkApprove(by:checker)。
 */
interface ApprovalViewRow {
  id: string
  workflow: string
  inputter: string
  approver: string
  /** この端末で確定/上書きした項目数 (resolvedFieldIds.length) */
  modifiedCount: number
  /** 残要確認 (business-approval-waiting は通常 0、一括承認 gate 用) */
  flags: number
  /** 入力者承認した actorId (B4 SoD: 一括承認で自己承認案件を skip する判定材料)。 */
  inputApprovedBy?: string
  elapsed: string
}

const columns: DataTableColumn<ApprovalViewRow>[] = [
  { key: 'id', header: '案件 ID', className: 'font-mono text-[13px] text-[var(--color-fg)]', cell: (r) => r.id, sortValue: (r) => r.id },
  { key: 'workflow', header: '業務', className: 'text-[var(--color-fg-muted)]', cell: (r) => r.workflow },
  {
    key: 'modified',
    header: '入力者の確認',
    cell: (r) =>
      r.modifiedCount > 0 ? (
        <MetaChip tone="primary" label={`この端末で修正済 ${r.modifiedCount} 件`} />
      ) : (
        <MetaChip tone="success" label="修正なし" />
      ),
  },
  {
    key: 'assignee',
    header: '担当 (入力者 → 承認者)',
    cell: (r) => (
      <span className="flex items-center gap-1.5 text-xs text-[var(--color-fg-muted)]">
        <ShieldCheckIcon className="h-3.5 w-3.5 text-[var(--color-success-soft-fg)]" aria-hidden="true" />
        <strong className="text-[var(--color-fg)]">{r.inputter}</strong>
        <ChevronRightIcon className="h-3 w-3" />
        <strong className="text-[var(--color-fg)]">{r.approver}</strong>
      </span>
    ),
  },
  { key: 'elapsed', header: '経過', className: 'text-[var(--color-fg-muted)]', cell: (r) => r.elapsed },
]

export function Approvals() {
  const { process } = useView()
  const approvals = useApprovals(process)
  const dispatch = useStoreDispatch()
  const actor = useCurrentActor()
  const [toast, setToast] = useState<string | null>(null)
  const showToast = (m: string) => {
    setToast(m)
    window.setTimeout(() => setToast(null), 2800)
  }
  // store entity → view row。inputter/approver は detail dict から join、修正件数は resolvedFieldIds 由来 (R3)。
  const rows: ApprovalViewRow[] = approvals.map((e) => ({
    id: e.id,
    workflow: e.workflowName,
    inputter: CASE_DETAILS[e.id]?.inputter ?? '—',
    approver: CASE_DETAILS[e.id]?.approver ?? '—',
    modifiedCount: e.resolvedFieldIds.length,
    flags: e.flags,
    inputApprovedBy: e.inputApprovedBy,
    elapsed: caseElapsedLabel(e.receivedAt, e.status),
  }))
  const list = useListData(rows)
  const inputters = [...new Set(rows.map((r) => r.inputter))]
  const filters: DataTableFilter<ApprovalViewRow>[] = [
    { id: 'inputter', label: '入力者', options: inputters.map((i) => ({ value: i, label: i })), predicate: (r, v) => v.includes(r.inputter) },
  ]

  return (
    <div className="flex flex-col">
      <header
        data-page-header
        className="sticky top-0 z-30 flex min-h-[var(--height-pageheader)] flex-col justify-center border-b border-[var(--color-border)] bg-[var(--color-panel)] px-6 py-4"
      >
        <h1 className="text-lg font-semibold text-[var(--color-fg)]">承認待ち</h1>
        <p className="mt-1 text-xs text-[var(--color-fg-muted)]">入力者が確認済の案件を最終承認 · {rows.length} 件</p>
      </header>

      <div className="p-4">
        <DataTable
          rows={list.rows}
          status={list.status}
          onRetry={list.onRetry}
          columns={columns}
          rowKey={(r) => r.id}
          rowHref={(r) => `/cases/${r.id}?view=checker`}
          ariaLabel="承認待ち"
          filters={filters}
          // 一括承認 = case/bulkApprove(by:checker)。要確認残 (flags>0) があれば一括不可。
          // SoD: 自分が入力者承認した案件は reducer が四眼原則で skip → 承認/スキップ件数を toast で可視化 (B4)。
          selection={{
            actions: [
              {
                label: '一括承認',
                icon: <CheckIcon className="h-3 w-3" aria-hidden="true" />,
                onRun: (ids) => {
                  const selected = rows.filter((r) => ids.includes(r.id))
                  const skipped = selected.filter((r) => r.inputApprovedBy !== undefined && r.inputApprovedBy === actor?.id).length
                  dispatch({ type: 'case/bulkApprove', ids, by: 'checker' })
                  const approved = selected.length - skipped
                  showToast(
                    skipped > 0
                      ? `${approved} 件を最終承認しました（自己承認 ${skipped} 件は四眼原則によりスキップ — 承認者に切替えてください）`
                      : `${approved} 件を最終承認しました`,
                  )
                },
                disabled: (selectedRows) => selectedRows.some((r) => r.flags > 0),
              },
            ],
          }}
          caption={
            <span className="flex items-center gap-1">
              <PencilLineIcon className="h-3 w-3" aria-hidden="true" />
              「修正済」は入力者がこの端末で項目を上書きした件数です。承認者は別担当者として最終確認します。
            </span>
          }
        />
      </div>

      {toast && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 z-[80] -translate-x-1/2 rounded-[var(--radius-card)] border border-[var(--color-success)] bg-[var(--color-success-soft)] px-4 py-2 text-sm font-medium text-[var(--color-success-soft-fg)] shadow-lg"
        >
          {toast}
        </div>
      )}
    </div>
  )
}
