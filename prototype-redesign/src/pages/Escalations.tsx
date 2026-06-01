import { AlertTriangleIcon } from 'lucide-react'
import { DataTable } from '@/components/shared/DataTable'
import type { DataTableColumn } from '@/components/shared/DataTable'
import { PageHeader } from '@/components/shared/PageHeader'
import { useEscalations, useCurrentActor } from '@/store/hooks'
import { useListData } from '@/hooks/useListData'
import { roleLabel } from '@/store/actors'
import { caseElapsedLabel } from '@/lib/dates'

/**
 * エスカレーション受信 (Escalations, /escalations) — B 型 queue / 業務責任者
 * SSOT: handoff-redesign/00-shared/remediation-roadmap §3.3 (P1-3、IA scope=(a))
 *
 * case/escalate された難案件の受信 queue (C2「難案件が宙に消える」解消)。
 * row → 該当 case detail。裁定は CaseDetail の裁定面 (case/resolveEscalation) で 続行可 / 差戻し の 2 出口
 * (F-016)。裁定 (resolution 確定) で本 queue から外れ、結果は起票者へ通知される (F-017)。
 */
interface EscalationRow {
  id: string
  workflow: string
  elapsed: string
  receivedAt: string
  category: string
  reason: string
}

const columns: DataTableColumn<EscalationRow>[] = [
  { key: 'id', header: '案件 ID', className: 'font-mono text-[13px] text-[var(--color-fg)]', cell: (r) => r.id, sortValue: (r) => r.id },
  { key: 'workflow', header: '業務', className: 'text-[var(--color-fg-muted)]', cell: (r) => r.workflow, sortValue: (r) => r.workflow },
  // F-011/F-044: 滞留 triage 用に receivedAt を数値 sortValue に。列は案件受付からの経過を表す (エスカレ時刻ではない) ため honest に rename。
  { key: 'elapsed', header: '受付からの経過', className: 'text-[var(--color-fg-muted)]', cell: (r) => r.elapsed, sortValue: (r) => new Date(r.receivedAt).getTime() },
  // F-011: 裁定種別 (category) 列を追加し category で triage 可能に。
  { key: 'category', header: '区分', className: 'text-[var(--color-fg-muted)]', cell: (r) => r.category, sortValue: (r) => r.category },
  { key: 'reason', header: 'エスカレーション理由', className: 'text-[var(--color-fg)]', cell: (r) => r.reason },
]

export function Escalations() {
  const escalations = useEscalations()
  // F-040: 権限外 persona (業務責任者以外) には「閲覧のみ・裁定は業務責任者」を inline hint で明示 (list/通知の audience 差を説明)。
  const actor = useCurrentActor()
  const isArbiter = actor?.role === 'business-approver'
  const rows: EscalationRow[] = escalations.map((c) => ({
    id: c.id,
    workflow: c.workflowName,
    elapsed: caseElapsedLabel(c.receivedAt, c.status),
    receivedAt: c.receivedAt,
    category: c.escalation?.category ?? '—',
    reason: c.escalation?.reason ?? '—',
  }))
  // F-009: 取得状態 (?demo=loading/error) を全 list route で一貫させる demo seam。
  const list = useListData(rows)
  return (
    <div className="flex flex-col">
      <PageHeader
        title="エスカレーション受信"
        subtitle={<>現場から上がった難案件{!list.status && ` ${rows.length} 件`} ／ 行を選んで案件を確認し、裁定（続行可・差戻し）します</>}
      >
        {!isArbiter && (
          <p className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[var(--color-alert-soft-fg)]">
            <AlertTriangleIcon className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
            閲覧のみ — 裁定は業務責任者の操作です（現在の操作者は「{actor ? roleLabel(actor.role) : '—'}」。右上で業務責任者に切替えてください）。
          </p>
        )}
      </PageHeader>

      <div className="p-4">
        <DataTable
          rows={list.rows}
          status={list.status}
          onRetry={list.onRetry}
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
