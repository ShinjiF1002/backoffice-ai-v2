import { ChevronRightIcon, ShieldCheckIcon, PencilLineIcon } from 'lucide-react'
import { APPROVAL_LIST } from '@/data/mock-approvals'
import type { ApprovalRow } from '@/data/mock-approvals'
import { MetaChip } from '@/components/shared/MetaChip'
import { DataTable } from '@/components/shared/DataTable'
import type { DataTableColumn, DataTableFilter } from '@/components/shared/DataTable'

/**
 * 承認待ち (Approvals, /approvals) — B 型 queue / 承認者
 * SSOT: screen-contracts-v2 §3 / screens-v2/03-approvals。Phase 3 で共通 DataTable に載せ替え。
 * row → CaseDetail (承認者ビュー、?view=checker)。承認者 ≠ 入力者 を明示。一括承認 (selection)。
 */
const INPUTTERS = [...new Set(APPROVAL_LIST.map((r) => r.inputter))]

const columns: DataTableColumn<ApprovalRow>[] = [
  { key: 'id', header: '案件 ID', className: 'font-mono text-[13px] text-[var(--color-fg)]', cell: (r) => r.id, sortValue: (r) => r.id },
  { key: 'workflow', header: '業務', className: 'text-[var(--color-fg-muted)]', cell: (r) => r.workflow },
  {
    key: 'judgement',
    header: '入力者の判断',
    cell: (r) =>
      r.judgement === 'modified' ? (
        <MetaChip tone="primary" label={`修正あり ${r.modifiedCount} 件`} />
      ) : (
        <MetaChip tone="success" label="確認のみ (修正なし)" />
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

const filters: DataTableFilter<ApprovalRow>[] = [
  { id: 'inputter', label: '入力者', options: INPUTTERS.map((i) => ({ value: i, label: i })), predicate: (r, v) => v.includes(r.inputter) },
]

export function Approvals() {
  return (
    <div className="flex flex-col">
      <header
        data-page-header
        className="sticky top-0 z-30 flex min-h-[var(--height-pageheader)] flex-col justify-center border-b border-[var(--color-border)] bg-[var(--color-panel)] px-6 py-4"
      >
        <h1 className="text-lg font-semibold text-[var(--color-fg)]">承認待ち</h1>
        <p className="mt-1 text-xs text-[var(--color-fg-muted)]">入力者が確認済の案件を最終承認 · {APPROVAL_LIST.length} 件</p>
      </header>

      <div className="p-4">
        <DataTable
          rows={APPROVAL_LIST}
          columns={columns}
          rowKey={(r) => r.id}
          rowHref={(r) => `/cases/${r.id}?view=checker`}
          ariaLabel="承認待ち"
          filters={filters}
          // Phase 3 は選択 UI (checkbox + 件数) のみ。一括承認 action は no-op を出さず、
          // Phase 4 で store の case/bulkApprove (by:checker) に接続してから表示する。
          selection={{ actions: [] }}
          caption={
            <span className="flex items-center gap-1">
              <PencilLineIcon className="h-3 w-3" aria-hidden="true" />
              「修正あり」は入力者が項目を上書き済。承認者は別担当者として最終確認します。
            </span>
          }
        />
      </div>
    </div>
  )
}
