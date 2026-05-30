import { DataTable } from '@/components/shared/DataTable'
import type { DataTableColumn } from '@/components/shared/DataTable'
import { MetaChip } from '@/components/shared/MetaChip'
import type { MetaTone } from '@/components/shared/MetaChip'
import { useForwardedProposals, usePendingPromotions } from '@/store/hooks'

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
  kind: ApprovalKind
  kindLabel: string
  title: string
  href: string
}

const KIND_TONE: Record<ApprovalKind, MetaTone> = { proposal: 'primary', promotion: 'inset' }

const columns: DataTableColumn<ConfigApprovalRow>[] = [
  { key: 'kind', header: '承認種別', cell: (r) => <MetaChip tone={KIND_TONE[r.kind]} label={r.kindLabel} /> },
  { key: 'id', header: 'ID', className: 'font-mono text-[13px] text-[var(--color-fg)]', cell: (r) => r.id, sortValue: (r) => r.id },
  { key: 'title', header: '対象業務', className: 'text-[var(--color-fg)]', cell: (r) => r.title },
]

export function ConfigApprovals() {
  const proposals = useForwardedProposals()
  const promotions = usePendingPromotions()
  const rows: ConfigApprovalRow[] = [
    ...proposals.map((p): ConfigApprovalRow => ({ id: p.id, kind: 'proposal', kindLabel: '手順承認', title: p.workflowName, href: `/proposals/${p.id}` })),
    ...promotions.map((a): ConfigApprovalRow => ({ id: a.id, kind: 'promotion', kindLabel: '設定承認', title: a.workflowName, href: `/agents/${a.id}` })),
  ]
  return (
    <div className="flex flex-col">
      <header
        data-page-header
        className="sticky top-0 z-30 flex min-h-[var(--height-pageheader)] flex-col justify-center border-b border-[var(--color-border)] bg-[var(--color-panel)] px-6 py-4"
      >
        <h1 className="text-lg font-semibold text-[var(--color-fg)]">設定承認 — 手順・設定変更の承認待ち</h1>
        <p className="mt-1 text-xs text-[var(--color-fg-muted)]">
          手順承認（提案）{proposals.length} 件 ／ 設定承認（昇格申請）{promotions.length} 件 ／ 行を選んで承認・差戻しします
        </p>
      </header>

      <div className="p-4">
        <DataTable
          rows={rows}
          columns={columns}
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
