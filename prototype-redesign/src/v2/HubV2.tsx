import {
  AlertTriangleIcon,
  ClockIcon,
  InboxIcon,
  Building2Icon,
  WalletIcon,
  ArrowRightIcon,
  ChevronRightIcon,
  ActivityIcon,
  ShieldCheckIcon,
} from 'lucide-react'
import { HUB_DAILY_SUMMARY } from '@/data/mock-hub'
import { useHubModel } from '@/store/hooks'
import { PageHeader, Card } from './ui'

/**
 * HubV2 — エントリ (dashboard archetype)。「今日 誰が何を処理すべきか」を 1 秒で。
 * 最優先アクション → KPI strip → 日次サマリ → 業務 health。oversight 入口。Tier 2 (status 把握優先)。
 */

const KPI_ICON = { alert: AlertTriangleIcon, clock: ClockIcon, inbox: InboxIcon } as const
const PROC_ICON = { building: Building2Icon, wallet: WalletIcon } as const

export function HubV2() {
  const { processes, headline, primaryAction } = useHubModel()
  return (
    <div className="flex h-full flex-col overflow-auto">
      <PageHeader title="ハブ" sub="今日の状況 — 2026-06-02" />

      <div className="mx-auto w-full max-w-[1080px] px-6 py-5">
        {/* 最優先アクション */}
        <a
          href={primaryAction.to}
          className="flex items-center justify-between gap-4 rounded-[var(--v2-radius-card)] border border-[var(--v2-accent-soft-border)] bg-[var(--v2-accent-soft)] px-5 py-4 transition-colors hover:border-[var(--v2-accent)]"
        >
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-[var(--v2-accent-soft-fg)]">{primaryAction.kicker}</div>
            <div className="mt-1 text-[15px] font-semibold text-[var(--v2-fg)]">{primaryAction.title}</div>
            <div className="mt-0.5 text-[13px] text-[var(--v2-fg-muted)]">{primaryAction.detail}</div>
          </div>
          <span className="flex flex-shrink-0 items-center gap-1.5 rounded-[var(--v2-radius-control)] bg-[var(--v2-accent)] px-3.5 py-2 text-[13px] font-medium text-white">
            承認待ちへ
            <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
          </span>
        </a>

        {/* KPI strip */}
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {headline.map((k) => {
            const Icon = KPI_ICON[k.icon]
            const soft = k.tone === 'alert' ? 'alert' : 'accent'
            return (
              <a key={k.key} href={k.to} className="group">
                <Card className="h-full p-4 transition-colors group-hover:border-[var(--v2-border-strong)]">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-medium text-[var(--v2-fg-muted)]">{k.label}</span>
                    <Icon className={`h-4 w-4 text-[var(--v2-${soft}-soft-fg)]`} aria-hidden="true" />
                  </div>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="v2-tnum text-[28px] font-semibold leading-none text-[var(--v2-fg)]">{k.total}</span>
                    <span className="text-[12px] text-[var(--v2-fg-tertiary)]">件</span>
                    {k.hypothetical && (
                      <span className="rounded-[var(--v2-radius-chip)] border border-[var(--v2-border)] bg-[var(--v2-panel-inset)] px-1.5 py-0.5 text-[10px] text-[var(--v2-fg-tertiary)]">
                        仮説 / 要検証
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-0.5 text-[12px] text-[var(--v2-fg-muted)]">
                    {k.breakdown.map((b) => (
                      <span key={b.name} className="v2-tnum">
                        {b.name} <span className="font-medium text-[var(--v2-fg)]">{b.n}</span>
                      </span>
                    ))}
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-[12px] text-[var(--v2-accent-strong)]">
                    {k.drill}
                    <ChevronRightIcon className="h-3 w-3" aria-hidden="true" />
                  </div>
                </Card>
              </a>
            )
          })}
        </div>

        {/* 日次サマリ + 業務 health */}
        <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-[1fr_1.4fr]">
          <Card className="p-4">
            <div className="text-[13px] font-medium text-[var(--v2-fg)]">本日の処理サマリ</div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              {[
                { label: '受付', n: HUB_DAILY_SUMMARY.intake },
                { label: '反映', n: HUB_DAILY_SUMMARY.reflected },
                { label: '差戻し', n: HUB_DAILY_SUMMARY.sentBack },
              ].map((s) => (
                <div key={s.label} className="rounded-[var(--v2-radius-control)] bg-[var(--v2-panel-inset)] py-3">
                  <div className="v2-tnum text-[22px] font-semibold text-[var(--v2-fg)]">{s.n}</div>
                  <div className="mt-0.5 text-[11px] text-[var(--v2-fg-muted)]">{s.label}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium text-[var(--v2-fg)]">業務の健全性</span>
              <a href="/observatory" className="flex items-center gap-1 text-[12px] text-[var(--v2-accent-strong)] hover:underline">
                <ActivityIcon className="h-3.5 w-3.5" aria-hidden="true" />
                モニタリングへ
              </a>
            </div>
            <ul className="mt-3 flex flex-col gap-2">
              {processes.map((p) => {
                const Icon = PROC_ICON[p.icon]
                return (
                  <li key={p.id} className="flex items-center gap-3 rounded-[var(--v2-radius-control)] border border-[var(--v2-hairline)] px-3 py-2.5">
                    <Icon className="h-4 w-4 flex-shrink-0 text-[var(--v2-fg-muted)]" aria-hidden="true" />
                    <span className="flex-1 text-[13px] font-medium text-[var(--v2-fg)]">{p.name}</span>
                    <span className="inline-flex items-center gap-1 rounded-[var(--v2-radius-chip)] border border-[var(--v2-border)] bg-[var(--v2-panel-inset)] px-1.5 py-0.5 text-[11px] text-[var(--v2-fg-tertiary)]">
                      <ShieldCheckIcon className="h-3 w-3" aria-hidden="true" />
                      {p.trustLabel}
                    </span>
                    {p.approvalRate !== null && (
                      <span
                        className={
                          'v2-tnum text-[13px] font-medium ' +
                          (p.approvalRateOk === false ? 'text-[var(--v2-alert-soft-fg)]' : 'text-[var(--v2-success-soft-fg)]')
                        }
                      >
                        承認率 {p.approvalRate}%
                      </span>
                    )}
                  </li>
                )
              })}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
}
