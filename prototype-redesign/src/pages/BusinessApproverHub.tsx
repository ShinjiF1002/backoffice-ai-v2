import { Link } from 'react-router-dom'
import { SparklesIcon, BotIcon, AlertTriangleIcon, ArrowRightIcon } from 'lucide-react'
import { useBusinessApproverInbox } from '@/store/hooks'
import { cn } from '@/lib/cn'

/**
 * 業務責任者ハブ (BusinessApproverHub, /business-approver) — A 型 landing / 業務責任者
 * SSOT: handoff-redesign/00-shared/remediation-roadmap §3.3 (P1-3、IA scope=(a))
 *
 * 業務責任者の 3 受け口を集約 drill する role landing (§5a / §8 persona gap 解消)。
 *  - 手順承認 (forwarded 提案) → /config-approvals
 *  - 設定承認 (Agent 昇格申請) → /config-approvals
 *  - エスカレーション裁定 (case/escalate) → /escalations
 */
type Receptacle = {
  key: string
  icon: typeof SparklesIcon
  label: string
  count: number
  href: string
  desc: string
  urgent?: boolean
}

export function BusinessApproverHub() {
  const { forwardedProposals, pendingPromotions, escalations } = useBusinessApproverInbox()
  const receptacles: Receptacle[] = [
    { key: 'proposals', icon: SparklesIcon, label: '手順承認', count: forwardedProposals.length, href: '/config-approvals', desc: '現場の改善提案を正式手順に反映するか確認します' },
    { key: 'promotions', icon: BotIcon, label: '設定承認', count: pendingPromotions.length, href: '/config-approvals', desc: 'Agent の自動化レベル昇格（設定変更）を確認します' },
    { key: 'escalations', icon: AlertTriangleIcon, label: 'エスカレーション裁定', count: escalations.length, href: '/escalations', desc: '現場が判断に迷う難案件を裁定（差戻し）します', urgent: true },
  ]
  const total = forwardedProposals.length + pendingPromotions.length + escalations.length

  return (
    <div className="flex flex-col">
      <header
        data-page-header
        className="sticky top-0 z-30 flex min-h-[var(--height-pageheader)] flex-col justify-center border-b border-[var(--color-border)] bg-[var(--color-panel)] px-6 py-4"
      >
        <h1 className="text-lg font-semibold text-[var(--color-fg)]">業務責任者ハブ</h1>
        <p className="mt-1 text-xs text-[var(--color-fg-muted)]">
          あなたが判断する案件 {total} 件 ／ 手順承認・設定承認・エスカレーション裁定の受け口
        </p>
      </header>

      <div className="grid gap-3 p-4 sm:grid-cols-3">
        {receptacles.map((r) => {
          const Icon = r.icon
          const active = r.count > 0
          return (
            <Link
              key={r.key}
              to={r.href}
              className="group flex flex-col gap-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-panel)] p-4 transition-colors hover:border-[var(--color-border-strong)] hover:bg-[var(--color-panel-inset)]"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[var(--radius-control)] bg-[var(--color-panel-inset)]">
                  <Icon className="h-5 w-5 text-[var(--color-fg-muted)]" aria-hidden="true" />
                </span>
                <span
                  className={cn(
                    'font-mono text-2xl font-semibold tabular-nums',
                    active
                      ? r.urgent
                        ? 'text-[var(--color-alert-soft-fg)]'
                        : 'text-[var(--color-fg)]'
                      : 'text-[var(--color-fg-tertiary)]',
                  )}
                >
                  {r.count}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-semibold text-[var(--color-fg)]">{r.label}</span>
                <span className="text-xs leading-relaxed text-[var(--color-fg-muted)]">{r.desc}</span>
              </div>
              <span className="mt-auto inline-flex items-center gap-1 text-xs font-medium text-[var(--color-primary)]">
                {active ? `${r.count} 件を確認` : '確認する'}
                <ArrowRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
