import { SlidersHorizontalIcon, AlertTriangleIcon, ChevronRightIcon, ClipboardCheckIcon } from 'lucide-react'
import { useBusinessApproverInbox, useCurrentActor } from '@/store/hooks'
import { actorById, roleLabel } from '@/store/actors'
import { PROPOSAL_DETAILS } from '@/data/mock-proposal-detail'
import { PageHeader, Card } from './ui'

/**
 * BusinessApproverHubV2 — 業務責任者ハブ (hub、store 配線済)。設定承認 + エスカレーション裁定の判断待ちを集約。
 * 件数/行は useBusinessApproverInbox() 由来 (pendingPromotions / escalations)。承認・裁定の実行は drill 先
 * (AgentDetailV2 設定承認 owner mode / CaseDetailV2 escalation 裁定) の責務 (この hub は landing、dispatch 無し)。
 * 手順承認 (forwardedProposals) は ProposalsV2 → ProposalDetailV2 owner mode に集約 (v2 は 2 受け口構成を維持)。
 */
type QueueItem = { id: string; label: string; meta: string }

function QueueCard({ title, icon: Icon, items, hrefFor }: { title: string; icon: typeof SlidersHorizontalIcon; items: QueueItem[]; hrefFor: (it: QueueItem) => string }) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-[var(--v2-border)] px-4 py-2.5">
        <span className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--v2-fg)]">
          <Icon className="h-4 w-4 text-[var(--v2-fg-muted)]" aria-hidden="true" />
          {title}
        </span>
        <span className="v2-tnum rounded-full bg-[var(--v2-accent-soft)] px-2 text-[12px] font-medium text-[var(--v2-accent-soft-fg)]">{items.length}</span>
      </div>
      <ul>
        {items.length === 0 ? (
          <li>
            <div className="px-4 py-3 text-[12px] text-[var(--v2-fg-tertiary)]">新規の判断待ちはありません</div>
          </li>
        ) : (
          items.map((it) => (
            <li key={it.id}>
              <a href={hrefFor(it)} className="flex items-center justify-between gap-3 border-b border-[var(--v2-hairline)] px-4 py-2.5 transition-colors last:border-b-0 hover:bg-[var(--v2-panel-inset)]">
                <span className="min-w-0">
                  <span className="block truncate text-[13px] text-[var(--v2-fg)]">{it.label}</span>
                  <span className="v2-mono block truncate text-[11px] text-[var(--v2-fg-tertiary)]">{it.id} · {it.meta}</span>
                </span>
                <ChevronRightIcon className="h-4 w-4 flex-shrink-0 text-[var(--v2-fg-subtle)]" aria-hidden="true" />
              </a>
            </li>
          ))
        )}
      </ul>
    </Card>
  )
}

export function BusinessApproverHubV2() {
  const { forwardedProposals, pendingPromotions, escalations } = useBusinessApproverInbox()
  const actor = useCurrentActor()
  const isBusinessApprover = actor?.role === 'business-approver'
  const procItems: QueueItem[] = forwardedProposals.map((p) => ({
    id: p.id,
    label: PROPOSAL_DETAILS[p.id]?.changeTitle ?? p.workflowName,
    meta: p.workflowName,
  }))
  const configItems: QueueItem[] = pendingPromotions.map((a) => ({
    id: a.id,
    label: `${a.workflowName} Agent の昇格申請`,
    meta: `種別 C · ${actorById(a.promotionRequestedBy ?? '')?.name ?? '—'}`,
  }))
  const escItems: QueueItem[] = escalations.map((c) => ({
    id: c.id,
    label: `${c.workflowName} — ${c.escalation?.reason ?? ''}`,
    meta: `起票: ${actorById(c.escalation?.from ?? '')?.name ?? c.assignee ?? '—'}`,
  }))

  return (
    <div className="flex h-full flex-col overflow-auto">
      <PageHeader
        title="業務責任者ハブ"
        sub={
          <>
            <span className="block">設定承認とエスカレーション裁定 — {isBusinessApprover ? 'あなたが判断待ち' : '業務責任者が判断待ち'}</span>
            {!isBusinessApprover && (
              <span className="mt-1 flex items-center gap-1.5 text-[var(--v2-alert-soft-fg)]">
                <AlertTriangleIcon className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
                現在の操作者は「{actor ? roleLabel(actor.role) : '—'}」です。承認・裁定は業務責任者の操作です。右上で業務責任者に切替えてください。
              </span>
            )}
          </>
        }
      />
      <div className="mx-auto w-full max-w-[1180px] px-6 py-5">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <QueueCard title="手順承認待ち" icon={ClipboardCheckIcon} items={procItems} hrefFor={(it) => '/proposals/' + it.id} />
          <QueueCard title="設定承認待ち" icon={SlidersHorizontalIcon} items={configItems} hrefFor={(it) => '/agents/' + it.id} />
          <QueueCard title="エスカレーション裁定待ち" icon={AlertTriangleIcon} items={escItems} hrefFor={(it) => '/cases/' + it.id} />
        </div>
      </div>
    </div>
  )
}
