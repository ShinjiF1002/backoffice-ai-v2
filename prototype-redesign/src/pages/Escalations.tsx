import { DataTable } from '@/components/shared/DataTable'
import type { DataTableColumn } from '@/components/shared/DataTable'
import { useEscalations } from '@/store/hooks'
import { caseElapsedLabel } from '@/lib/dates'

/**
 * エスカレーション受信 (Escalations, /escalations) — B 型 queue / 業務責任者
 * SSOT: handoff-redesign/00-shared/remediation-roadmap §3.3 (P1-3、IA scope=(a))
 *
 * case/escalate された難案件の受信 queue (C2「難案件が宙に消える」解消)。
 * row → 該当 case detail。裁定は CaseDetail で case/sendback を再利用 (JG-3=a、新 action を増やさない)。
 */
interface EscalationRow {
  id: string
  workflow: string
  elapsed: string
  reason: string
}

const columns: DataTableColumn<EscalationRow>[] = [
  { key: 'id', header: '案件 ID', className: 'font-mono text-[13px] text-[var(--color-fg)]', cell: (r) => r.id, sortValue: (r) => r.id },
  { key: 'workflow', header: '業務', className: 'text-[var(--color-fg-muted)]', cell: (r) => r.workflow },
  { key: 'elapsed', header: '経過', className: 'text-[var(--color-fg-muted)]', cell: (r) => r.elapsed },
  { key: 'reason', header: 'エスカレーション理由', className: 'text-[var(--color-fg)]', cell: (r) => r.reason },
]

export function Escalations() {
  const escalations = useEscalations()
  const rows: EscalationRow[] = escalations.map((c) => ({
    id: c.id,
    workflow: c.workflowName,
    elapsed: caseElapsedLabel(c.receivedAt, c.status),
    reason: c.escalation?.reason ?? '—',
  }))
  return (
    <div className="flex flex-col">
      <header
        data-page-header
        className="sticky top-0 z-30 flex min-h-[var(--height-pageheader)] flex-col justify-center border-b border-[var(--color-border)] bg-[var(--color-panel)] px-6 py-4"
      >
        <h1 className="text-lg font-semibold text-[var(--color-fg)]">エスカレーション受信</h1>
        <p className="mt-1 text-xs text-[var(--color-fg-muted)]">
          現場から上がった難案件 {rows.length} 件 ／ 行を選んで案件を確認し、裁定（差戻し）します
        </p>
      </header>

      <div className="p-4">
        <DataTable
          rows={rows}
          columns={columns}
          rowKey={(r) => r.id}
          rowHref={(r) => `/cases/${r.id}`}
          ariaLabel="エスカレーション受信一覧"
          emptyTitle="エスカレーションはありません"
          emptyDescription="現場から裁定依頼が上がると、ここに表示されます。"
          pageSize={10}
        />
      </div>
    </div>
  )
}
