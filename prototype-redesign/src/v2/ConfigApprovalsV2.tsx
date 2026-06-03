import { PageHeader, ToneChip } from './ui'
import { DataTable } from './DataTable'
import { CONFIG_TYPE_TONE, CONFIG_TYPE_LABEL } from './tokens'
import type { ApprovalType } from '@/data/types'

/** ConfigApprovalsV2 — 設定承認 (list)。AI の設定変更 (種別 A/B/C) を業務責任者が承認。 */
const CONFIG_APPROVALS: { id: string; target: string; change: string; type: ApprovalType; requestedBy: string; status: string }[] = [
  { id: 'CFG-2026-014', target: '法人住所変更 Agent', change: '住所読み取りの判定基準を更新', type: 'A', requestedBy: '手順管理者', status: '承認待ち' },
  { id: 'CFG-2026-013', target: '口座開設書類完備 Agent', change: '有効期限チェックを追加（手順承認済）', type: 'C', requestedBy: '手順管理者', status: '承認待ち' },
]

export function ConfigApprovalsV2() {
  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="設定承認"
        sub={
          <>
            AI の設定変更の承認 — <span className="v2-tnum font-medium text-[var(--v2-fg)]">{CONFIG_APPROVALS.length}</span> 件（人のコントロールは渡さない）
          </>
        }
      />
      <div className="flex-1 overflow-auto px-6 py-4">
        <DataTable
          gridCols="grid-cols-[150px_180px_1fr_128px_120px_104px]"
          rows={CONFIG_APPROVALS}
          getKey={(r) => r.id}
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
