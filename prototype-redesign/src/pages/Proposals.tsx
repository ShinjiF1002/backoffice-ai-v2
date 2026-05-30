import { PROPOSAL_LIST } from '@/data/mock-proposal-list'
import type { ProposalListRow } from '@/data/mock-proposal-list'
import type { ProposalStatus } from '@/data/types'
import { proposalStatusToTone, proposalStatusLabel } from '@/lib/status-tones'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { DataTable } from '@/components/shared/DataTable'
import type { DataTableColumn, DataTableFilter } from '@/components/shared/DataTable'
import { useProposals } from '@/store/hooks'
import { useView } from '@/context/view-context'

/**
 * 提案一覧 (Proposals, /proposals) — B 型 queue / Manual 管理者
 * SSOT: screen-contracts-v2 §5 / screens-v2/05-proposals。Phase 3 で共通 DataTable に載せ替え。
 * 「日次提案分析」表記、status resolver 経由、row → 提案詳細。状態 filter。
 */
const PROPOSAL_STATUS_VALUES: ProposalStatus[] = ['pending-triage', 'forwarded', 'approved', 'rejected']

const columns: DataTableColumn<ProposalListRow>[] = [
  { key: 'id', header: '提案 ID', className: 'font-mono text-[13px] text-[var(--color-fg)]', cell: (r) => r.id, sortValue: (r) => r.id },
  { key: 'workflow', header: '業務', className: 'text-[var(--color-fg-muted)]', cell: (r) => r.workflow },
  { key: 'changeArea', header: 'どの部分の改定か', className: 'text-[var(--color-fg)]', cell: (r) => r.changeArea },
  {
    key: 'impactCount',
    header: '影響件数',
    className: 'text-[var(--color-fg-muted)]',
    cell: (r) => `過去 ${r.impactCount} 件相当`,
    sortValue: (r) => r.impactCount,
  },
  {
    key: 'status',
    header: '状態',
    cell: (r) => <StatusBadge tone={proposalStatusToTone(r.status)} label={proposalStatusLabel(r.status)} />,
    sortValue: (r) => r.status,
  },
]

const filters: DataTableFilter<ProposalListRow>[] = [
  {
    id: 'status',
    label: '状態',
    options: PROPOSAL_STATUS_VALUES.map((s) => ({ value: s, label: proposalStatusLabel(s) })),
    predicate: (r, v) => v.includes(r.status),
  },
]

const PROPOSAL_BY_ID = Object.fromEntries(PROPOSAL_LIST.map((r) => [r.id, r]))

export function Proposals() {
  const { process } = useView()
  const proposals = useProposals(process)
  // store entity → list row view-model (status は store-truth、表示列は list mock を join)
  const rows: ProposalListRow[] = proposals.flatMap((e) => {
    const base = PROPOSAL_BY_ID[e.id]
    return base ? [{ ...base, status: e.status }] : []
  })
  return (
    <div className="flex flex-col">
      <header
        data-page-header
        className="sticky top-0 z-30 flex min-h-[var(--height-pageheader)] flex-col justify-center border-b border-[var(--color-border)] bg-[var(--color-panel)] px-6 py-4"
      >
        <h1 className="text-lg font-semibold text-[var(--color-fg)]">AI 提案レビュー — 提案一覧</h1>
        <p className="mt-1 text-xs text-[var(--color-fg-muted)]">日次提案分析が差戻しパターンから生成した手順改定の候補 · {rows.length} 件</p>
      </header>

      <div className="p-4">
        <DataTable
          rows={rows}
          columns={columns}
          rowKey={(r) => r.id}
          rowHref={(r) => `/proposals/${r.id}`}
          ariaLabel="提案一覧"
          filters={filters}
          caption="毎日の差戻し分析から自動生成された改定候補です。承認すると正式手順に反映されます。"
        />
      </div>
    </div>
  )
}
