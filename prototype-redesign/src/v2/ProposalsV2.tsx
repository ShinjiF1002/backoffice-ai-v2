import { PROPOSAL_LIST } from '@/data/mock-proposal-list'
import { proposalStatusToTone, proposalStatusLabel } from '@/lib/status-tones'
import { PageHeader, ToneChip } from './ui'
import { DataTable } from './DataTable'

/** ProposalsV2 — AI 提案 (list)。差戻しから生成された手順改定の提案。 */
export function ProposalsV2() {
  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="AI 提案"
        sub={
          <>
            差戻しから生成された手順改定の提案 — <span className="v2-tnum font-medium text-[var(--v2-fg)]">{PROPOSAL_LIST.length}</span> 件
          </>
        }
      />
      <div className="flex-1 overflow-auto px-6 py-4">
        <DataTable
          gridCols="grid-cols-[152px_140px_1fr_84px_120px]"
          rows={PROPOSAL_LIST}
          getKey={(r) => r.id}
          rowHref={() => '/v2/proposal'}
          cols={[
            { label: '提案ID', render: (r) => <span className="v2-mono font-medium text-[var(--v2-fg)]">{r.id}</span> },
            { label: '業務', render: (r) => <span className="truncate text-[var(--v2-fg-muted)]">{r.workflow}</span> },
            { label: '変更内容', render: (r) => <span className="truncate text-[var(--v2-fg)]">{r.changeArea}</span> },
            { label: '影響', render: (r) => <span className="v2-tnum text-[var(--v2-fg-muted)]">{r.impactCount} 件</span> },
            { label: '状態', render: (r) => <ToneChip tone={proposalStatusToTone(r.status)} label={proposalStatusLabel(r.status)} /> },
          ]}
        />
      </div>
    </div>
  )
}
