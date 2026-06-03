import { AlertTriangleIcon } from 'lucide-react'
import { actorById, roleLabel } from '@/store/actors'
import { useEscalations, useCurrentActor } from '@/store/hooks'
import { PageHeader, ToneChip } from './ui'
import { DataTable } from './DataTable'

/**
 * EscalationsV2 — エスカレーション受信 (list、store 配線済)。業務責任者の裁定待ちキュー。
 * 母集合 = useEscalations() (escalation 有り & resolution 未確定)。宛先は escalation.to (actorId) を名前解決。
 * 裁定 (続行可/差戻し) は行 click → CaseDetailV2 (case/resolveEscalation) で行う (この画面は read-only queue)。
 */
export function EscalationsV2() {
  const escalations = useEscalations()
  const actor = useCurrentActor()
  const isArbiter = actor?.role === 'business-approver'
  const rows = escalations.map((c) => ({
    id: c.id,
    workflow: c.workflowName,
    reason: c.escalation?.reason ?? '—',
    to: actorById(c.escalation?.to ?? '')?.name ?? '—',
    status: '裁定待ち',
  }))

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="エスカレーション"
        sub={
          <>
            業務責任者の裁定待ち — <span className="v2-tnum font-medium text-[var(--v2-fg)]">{rows.length}</span> 件
          </>
        }
      />
      {!isArbiter && (
        <div className="flex items-center gap-1.5 border-b border-[var(--v2-alert-soft-border)] bg-[var(--v2-alert-soft)] px-6 py-2 text-[12px] font-medium text-[var(--v2-alert-soft-fg)]">
          <AlertTriangleIcon className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
          閲覧のみ — 裁定（続行可 / 差戻し）は業務責任者の操作です。現在の操作者は「{actor ? roleLabel(actor.role) : '—'}」。右上で業務責任者に切替えてください。
        </div>
      )}
      <div className="flex-1 overflow-auto px-6 py-4">
        <DataTable
          gridCols="grid-cols-[150px_140px_1fr_104px_104px]"
          rows={rows}
          getKey={(r) => r.id}
          rowHref={(r) => '/cases/' + r.id}
          cols={[
            { label: '案件ID', render: (r) => <span className="v2-mono font-medium text-[var(--v2-fg)]">{r.id}</span> },
            { label: '業務', render: (r) => <span className="truncate text-[var(--v2-fg-muted)]">{r.workflow}</span> },
            { label: '依頼理由', render: (r) => <span className="truncate text-[var(--v2-fg)]">{r.reason}</span> },
            { label: '宛先', render: (r) => <span className="text-[var(--v2-fg-muted)]">{r.to}</span> },
            { label: '状態', render: (r) => <ToneChip tone="alert" label={r.status} /> },
          ]}
        />
      </div>
    </div>
  )
}
