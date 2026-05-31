import { useSearchParams } from 'react-router-dom'
import { AlertTriangleIcon } from 'lucide-react'
import { DataTable } from '@/components/shared/DataTable'
import type { DataTableColumn, DataTableFilter } from '@/components/shared/DataTable'
import { MetaChip } from '@/components/shared/MetaChip'
import type { MetaTone } from '@/components/shared/MetaChip'
import { PageHeader } from '@/components/shared/PageHeader'
import { useForwardedProposals, usePendingPromotions, useCurrentActor } from '@/store/hooks'
import { useListData } from '@/hooks/useListData'
import { roleLabel } from '@/store/actors'

/**
 * 設定承認 (ConfigApprovals, /config-approvals) — B 型 queue / 業務責任者
 * SSOT: handoff-redesign/00-shared/remediation-roadmap §3.3 (P1-3、IA scope=(a))
 *
 * 業務責任者の 2 系統の承認待ちを 1 queue に集約:
 *  - 手順承認 = forwarded 提案 (row → ProposalDetail owner mode)
 *  - 設定承認 = Agent 昇格申請 (row → AgentDetail owner mode、approvePromotion/sendbackPromotion + SoD)
 * 承認/差戻しは各 detail の owner mode で行う (C 型単一決定面契約)。
 */
type ApprovalKind = 'proposal' | 'promotion'
interface ConfigApprovalRow {
  id: string
  /** F-038: 全行一貫の業務向け採番 (内部 slug 'agent-...' を ID 列に露出しない)。 */
  reqNo: string
  kind: ApprovalKind
  kindLabel: string
  title: string
  href: string
}

const KIND_TONE: Record<ApprovalKind, MetaTone> = { proposal: 'primary', promotion: 'inset' }

const columns: DataTableColumn<ConfigApprovalRow>[] = [
  // F-038: 承認種別で sort 可能に。
  { key: 'kind', header: '承認種別', cell: (r) => <MetaChip tone={KIND_TONE[r.kind]} label={r.kindLabel} />, sortValue: (r) => r.kindLabel },
  // F-038: 内部 slug でなく業務向け採番 (申請番号) を全行一貫体系で表示。
  { key: 'reqNo', header: '申請番号', className: 'font-mono text-[13px] text-[var(--color-fg)]', cell: (r) => r.reqNo, sortValue: (r) => r.reqNo },
  // F-038: 対象業務で sort 可能に。
  { key: 'title', header: '対象業務', className: 'text-[var(--color-fg)]', cell: (r) => r.title, sortValue: (r) => r.title },
]

// F-038: 承認種別の filter chip (混在 queue を種別で triage)。
const filters: DataTableFilter<ConfigApprovalRow>[] = [
  {
    id: 'kind',
    label: '承認種別',
    options: [
      { value: 'proposal', label: '手順承認' },
      { value: 'promotion', label: '設定承認' },
    ],
    predicate: (r, v) => v.includes(r.kind),
  },
]

export function ConfigApprovals() {
  const proposals = useForwardedProposals()
  const promotions = usePendingPromotions()
  // F-040: 権限外 persona には「閲覧のみ・承認は業務責任者」を inline hint で明示。
  const actor = useCurrentActor()
  const isArbiter = actor?.role === 'business-approver'
  // F-024: 業務責任者ハブの 2 受け口 (手順承認 / 設定承認) は ?kind で着地時の絞り込みを変え区別を保つ。
  const [params] = useSearchParams()
  const kindFilter = params.get('kind')
  const activeKind: ApprovalKind | null = kindFilter === 'proposal' || kindFilter === 'promotion' ? kindFilter : null
  // F-038: 全行一貫の申請番号を deterministic 採番 (手順=REQ-P-NNN / 設定=REQ-C-NNN、内部 slug を ID 列に出さない)。
  const allRows: ConfigApprovalRow[] = [
    ...proposals.map((p, i): ConfigApprovalRow => ({ id: p.id, reqNo: `REQ-P-${String(i + 1).padStart(3, '0')}`, kind: 'proposal', kindLabel: '手順承認', title: p.workflowName, href: `/proposals/${p.id}` })),
    ...promotions.map((a, i): ConfigApprovalRow => ({ id: a.id, reqNo: `REQ-C-${String(i + 1).padStart(3, '0')}`, kind: 'promotion', kindLabel: '設定承認', title: a.workflowName, href: `/agents/${a.id}` })),
  ]
  const rows = activeKind ? allRows.filter((r) => r.kind === activeKind) : allRows
  // F-009: 取得状態 (?demo=loading/error) を全 list route で一貫させる demo seam。
  const list = useListData(rows)
  const h1 = activeKind === 'proposal' ? '手順承認 — 提案の承認待ち' : activeKind === 'promotion' ? '設定承認 — 昇格申請の承認待ち' : '設定承認 — 手順・設定変更の承認待ち'
  return (
    <div className="flex flex-col">
      <PageHeader
        title={h1}
        // F-038: 全業務横断スコープを明示 (どの業務の申請が混在するか legible に)。
        subtitle={
          <>
            <span className="font-medium text-[var(--color-fg-tertiary)]">全業務横断</span> ／ 手順承認（提案）{proposals.length} 件 ／ 設定承認（昇格申請）{promotions.length} 件{activeKind && '（ハブから絞り込み中）'} ／ 行を選んで承認・差戻しします
          </>
        }
      >
        {!isArbiter && (
          <p className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[var(--color-alert-soft-fg)]">
            <AlertTriangleIcon className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
            閲覧のみ — 承認・差戻しは業務責任者の操作です（現在の操作者は「{actor ? roleLabel(actor.role) : '—'}」。右上で業務責任者に切替えてください）。
          </p>
        )}
      </PageHeader>

      <div className="p-4">
        <DataTable
          rows={list.rows}
          status={list.status}
          onRetry={list.onRetry}
          columns={columns}
          filters={filters}
          rowKey={(r) => `${r.kind}:${r.id}`}
          rowHref={(r) => r.href}
          ariaLabel="設定承認一覧"
          emptyTitle="承認待ちはありません"
          emptyDescription="手順承認（提案の上長承認待ち）・設定承認（Agent 昇格申請）がここに集まります。"
          pageSize={10}
        />
      </div>
    </div>
  )
}
