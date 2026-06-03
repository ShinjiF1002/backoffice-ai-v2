import { PageHeader, ToneChip } from './ui'
import { DataTable } from './DataTable'
import { CONFIG_TYPE_TONE, CONFIG_TYPE_LABEL } from './tokens'
import { usePendingPromotions } from '@/store/hooks'
import { actorById } from '@/store/actors'
import type { ApprovalType } from '@/data/types'

/**
 * ConfigApprovalsV2 — 設定承認 (list、store 配線済)。AI の設定変更を業務責任者が承認。
 * 設定承認待ち = Agent 昇格申請 (usePendingPromotions、promotionStatus==='requested')。
 * 信頼レベルの昇格 = 自律度変更ゆえ種別 C。承認/差戻し (approvePromotion/sendbackPromotion + SoD) は
 * 行 click → AgentDetailV2 (設定承認 owner mode) の責務 (v1 ConfigApprovals は router、本画面に dispatch 無し)。
 */
export function ConfigApprovalsV2() {
  const promotions = usePendingPromotions()
  const rows = promotions.map((a) => ({
    id: a.id,
    target: `${a.workflowName} Agent`,
    change: '信頼レベルの昇格申請',
    type: 'C' as ApprovalType,
    requestedBy: actorById(a.promotionRequestedBy ?? '')?.name ?? '—',
    status: '承認待ち',
  }))

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="設定承認"
        sub={
          <>
            AI の設定変更の承認 — <span className="v2-tnum font-medium text-[var(--v2-fg)]">{rows.length}</span> 件（人のコントロールは渡さない）
          </>
        }
      />
      <div className="flex-1 overflow-auto px-6 py-4">
        <DataTable
          gridCols="grid-cols-[150px_180px_1fr_128px_120px_104px]"
          rows={rows}
          getKey={(r) => r.id}
          rowHref={(r) => '/agents/' + r.id}
          cols={[
            { label: '設定ID', render: (r) => <span className="v2-mono font-medium text-[var(--v2-fg)]">{r.id}</span> },
            { label: '対象', render: (r) => <span className="truncate text-[var(--v2-fg)]">{r.target}</span> },
            { label: '変更内容', render: (r) => <span className="truncate text-[var(--v2-fg-muted)]">{r.change}</span> },
            { label: '種別', render: (r) => <ToneChip tone={CONFIG_TYPE_TONE[r.type]} label={`${r.type} ${CONFIG_TYPE_LABEL[r.type]}`} /> },
            { label: '申請者', render: (r) => <span className="text-[var(--v2-fg-muted)]">{r.requestedBy}</span> },
            { label: '状態', render: (r) => <ToneChip tone="primary" label={r.status} /> },
          ]}
        />
      </div>
    </div>
  )
}
