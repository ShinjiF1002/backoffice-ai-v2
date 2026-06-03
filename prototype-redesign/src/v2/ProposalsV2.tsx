import { PROPOSAL_LIST } from '@/data/mock-proposal-list'
import { useProposals } from '@/store/hooks'
import { useView } from '@/context/view-context'
import { proposalStatusToTone, proposalStatusLabel } from '@/lib/status-tones'
import { PageHeader, ToneChip } from './ui'
import { DataTable } from './DataTable'

/**
 * ProposalsV2 — AI 提案 (list、store 配線済)。差戻しから生成された手順改定の提案。
 * status は store-truth (useProposals)、表示列 (workflow/changeArea/impactCount) は list mock 由来 (v1 Proposals と同一 view-model)。
 * 承認/差戻し操作は行 click → ProposalDetailV2 (/proposals/:id) に集約 (この画面は read-only)。
 */
export function ProposalsV2() {
  const { process } = useView()
  const proposals = useProposals(process)
  const rows = proposals.flatMap((e) => {
    const base = PROPOSAL_LIST.find((r) => r.id === e.id)
    return base ? [{ ...base, status: e.status }] : []
  })

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="AI 提案"
        sub={
          <>
            差戻しから生成された手順改定の提案 — <span className="v2-tnum font-medium text-[var(--v2-fg)]">{rows.length}</span> 件
          </>
        }
      />
      <div className="flex-1 overflow-auto px-6 py-4">
        <DataTable
          gridCols="grid-cols-[152px_140px_1fr_84px_120px]"
          rows={rows}
          getKey={(r) => r.id}
          rowHref={(r) => '/proposals/' + r.id}
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
