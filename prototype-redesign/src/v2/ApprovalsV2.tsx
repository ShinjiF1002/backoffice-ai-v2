import { APPROVAL_LIST } from '@/data/mock-approvals'
import { PageHeader, ToneChip } from './ui'
import { DataTable } from './DataTable'

/** ApprovalsV2 — 承認待ち (list)。承認者の最終承認待ちキュー。 */
export function ApprovalsV2() {
  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="承認待ち"
        sub={
          <>
            承認者の最終承認待ち — <span className="v2-tnum font-medium text-[var(--v2-fg)]">{APPROVAL_LIST.length}</span> 件（入力者 ≠ 承認者）
          </>
        }
      />
      <div className="flex-1 overflow-auto px-6 py-4">
        <DataTable
          gridCols="grid-cols-[150px_1fr_116px_72px_100px_100px_88px]"
          rows={APPROVAL_LIST}
          getKey={(r) => r.id}
          rowHref={(r) => '/v2/cases/' + r.id}
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
    </div>
  )
}
