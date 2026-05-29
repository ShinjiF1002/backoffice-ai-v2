import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Building2Icon,
  WalletIcon,
  AlertTriangleIcon,
  ClockIcon,
  InboxIcon,
  ArrowRightIcon,
  ChevronRightIcon,
  BotIcon,
  ZapIcon,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { HUB_PROCESSES, HUB_HEADLINE, HUB_PRIMARY_ACTION, HUB_DAILY_SUMMARY } from '@/data/mock-hub'
import type { HubHeadlineKpi, HubProcess } from '@/data/mock-hub'
import type { CaseStatus } from '@/data/types'
import type { Tone } from '@/components/shared/StatusBadge'
import { caseStatusToTone, caseStatusLabel } from '@/lib/status-tones'
import { MetaChip } from '@/components/shared/MetaChip'
import { cn } from '@/lib/cn'

/**
 * Hub (/) — Process-First v2 / typology A (全体俯瞰、単一決定面なし)
 * SSOT: screens-v2/01-hub/canonical-export.md + ia-overview-v2 §2 + canonical-design-spec
 * A 型: 業務横断の注意点と次のアクションへの「誘導」。承認/差戻し等の最終判断ボタンは持たない (footer 決定面なし)。
 * drill は実 route (mock-hub の to/agentTo)、status は status-tones resolver で業務語化。
 */
const PROCESS_ICON: Record<HubProcess['icon'], LucideIcon> = {
  building: Building2Icon,
  wallet: WalletIcon,
}
const KPI_ICON: Record<HubHeadlineKpi['icon'], LucideIcon> = {
  alert: AlertTriangleIcon,
  clock: ClockIcon,
  inbox: InboxIcon,
}
const KPI_TONE: Record<HubHeadlineKpi['tone'], { box: string; fg: string }> = {
  alert: { box: 'bg-[var(--color-alert-soft)]', fg: 'text-[var(--color-alert-soft-fg)]' },
  primary: { box: 'bg-[var(--color-primary-soft)]', fg: 'text-[var(--color-primary)]' },
}
// status dot 色 (resolver の Tone → token)
const DOT: Record<Tone, string> = {
  neutral: 'bg-[var(--color-fg-subtle)]',
  inset: 'bg-[var(--color-fg-subtle)]',
  slate: 'bg-[var(--color-fg)]',
  primary: 'bg-[var(--color-primary)]',
  success: 'bg-[var(--color-success)]',
  alert: 'bg-[var(--color-alert)]',
  error: 'bg-[var(--color-error)]',
}
const STATUS_ORDER: CaseStatus[] = ['ready', 'business-approval-waiting', 'sent-back', 'pending', 'reflected']

export function Hub() {
  const [summaryOpen, setSummaryOpen] = useState(false)

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <header
        data-page-header
        className="sticky top-0 z-30 flex min-h-[var(--height-pageheader)] items-end justify-between border-b border-[var(--color-border)] bg-[var(--color-panel)] px-6 py-3"
      >
        <div>
          <h1 className="text-xl font-semibold text-[var(--color-fg)]">ハブ</h1>
          <p className="mt-0.5 text-xs text-[var(--color-fg-muted)]">業務別の注意点と次のアクション</p>
        </div>
        <div className="text-xs text-[var(--color-fg-muted)]">
          最終更新 <span className="font-mono">2026-05-31 11:42</span>
        </div>
      </header>

      {/* Body (A 型: スクロール、決定 footer なし) */}
      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto flex max-w-[1120px] flex-col gap-6">
          {/* PrimaryAnchor — 最優先アクションへの誘導 CTA (判断は遷移先 /approvals で行う) */}
          <Link
            to={HUB_PRIMARY_ACTION.to}
            className="flex items-center gap-4 rounded-[var(--radius-card)] bg-[var(--color-primary)] px-5 py-4 text-white transition-colors hover:bg-[var(--color-primary-hover)]"
          >
            <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[var(--radius-control)] bg-white/15">
              <ZapIcon className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-medium uppercase tracking-wide text-white/85">{HUB_PRIMARY_ACTION.kicker}</div>
              <div className="mt-0.5 text-base font-semibold">{HUB_PRIMARY_ACTION.title}</div>
              <div className="mt-0.5 text-xs text-white/85">{HUB_PRIMARY_ACTION.detail}</div>
            </div>
            <ArrowRightIcon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
          </Link>

          {/* Headline KPI — クリックで該当画面へ drill */}
          <section>
            <h2 className="mb-2.5 text-sm font-semibold text-[var(--color-fg)]">全業務の注意 — クリックで該当画面へ</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {HUB_HEADLINE.map((k) => {
                const Icon = KPI_ICON[k.icon]
                const tone = KPI_TONE[k.tone]
                return (
                  <Link
                    key={k.key}
                    to={k.to}
                    className="flex flex-col gap-2.5 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-panel)] p-4 transition-colors hover:border-[var(--color-border-strong)]"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={cn('flex h-7 w-7 items-center justify-center rounded-[var(--radius-control)]', tone.box)}>
                          <Icon className={cn('h-4 w-4', tone.fg)} aria-hidden="true" />
                        </span>
                        <span className="text-sm font-semibold text-[var(--color-fg)]">{k.label}</span>
                      </div>
                      <ArrowRightIcon className="h-4 w-4 text-[var(--color-fg-subtle)]" aria-hidden="true" />
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className={cn('font-mono text-3xl font-semibold leading-none', tone.fg)}>{k.total}</span>
                      <span className="text-xs text-[var(--color-fg-muted)]">件</span>
                      {k.hypothetical && <MetaChip label="仮説 / 要検証" className="ml-1" />}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {k.breakdown.map((b) => (
                        <MetaChip key={b.name} label={`${b.name} ${b.n}`} />
                      ))}
                    </div>
                    <div className="text-xs text-[var(--color-fg-muted)]">{k.drill}</div>
                  </Link>
                )
              })}
            </div>
          </section>

          {/* Process cards */}
          <section>
            <h2 className="mb-2.5 text-sm font-semibold text-[var(--color-fg)]">業務別の状況</h2>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {HUB_PROCESSES.map((p) => {
                const ProcessIcon = PROCESS_ICON[p.icon]
                const attention = (p.dist.ready ?? 0) + (p.dist['sent-back'] ?? 0)
                return (
                  <section
                    key={p.id}
                    className="flex flex-col gap-3.5 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-panel)] p-5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-control)] bg-[var(--color-panel-inset)]">
                          <ProcessIcon className="h-[18px] w-[18px] text-[var(--color-fg-muted)]" aria-hidden="true" />
                        </span>
                        <div>
                          <h3 className="text-base font-semibold text-[var(--color-fg)]">{p.name}</h3>
                          <span className="text-xs text-[var(--color-fg-muted)]">
                            案件 <span className="font-mono font-semibold text-[var(--color-fg)]">{p.total}</span> 件
                          </span>
                        </div>
                      </div>
                      {attention > 0 && <MetaChip tone="alert" label="要対応あり" />}
                    </div>

                    {/* status breakdown (resolver 経由) */}
                    <div className="flex flex-wrap gap-2">
                      {STATUS_ORDER.filter((s) => p.dist[s]).map((s) => (
                        <div key={s} className="flex items-center gap-1.5 rounded-[var(--radius-control)] bg-[var(--color-panel-inset)] px-2.5 py-1.5">
                          <span className={cn('h-[7px] w-[7px] rounded-full', DOT[caseStatusToTone(s)])} />
                          <span className="text-xs text-[var(--color-fg)]">{caseStatusLabel(s)}</span>
                          <span className="font-mono text-xs font-semibold text-[var(--color-fg)]">{p.dist[s]}</span>
                        </div>
                      ))}
                    </div>

                    {/* agent + approval rate */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-[var(--color-border)] py-2.5">
                      <div className="flex items-center gap-2">
                        <BotIcon className="h-[15px] w-[15px] text-[var(--color-fg-muted)]" aria-hidden="true" />
                        <span className="text-xs text-[var(--color-fg-muted)]">担当 Agent</span>
                        <MetaChip tone="primary" label={p.trustLabel} />
                        <MetaChip tone="inset" label={p.trustEn} />
                      </div>
                      {p.approvalRate != null && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[var(--color-fg-muted)]">承認率</span>
                          <span className={cn('font-mono text-sm font-semibold', p.approvalRateOk ? 'text-[var(--color-success-soft-fg)]' : 'text-[var(--color-alert-soft-fg)]')}>
                            {p.approvalRate}%
                          </span>
                          {!p.approvalRateOk && <MetaChip tone="alert" label="基準 95% 未達" />}
                          <MetaChip label="仮説 / 要検証" />
                        </div>
                      )}
                    </div>

                    {/* drill (誘導のみ、Agent 粒度は agentTo で出し分け) */}
                    <div className="flex gap-2">
                      <Link
                        to="/cases"
                        className="flex items-center gap-1.5 rounded-[var(--radius-control)] border border-[var(--color-border-strong)] bg-[var(--color-panel)] px-2.5 py-1.5 text-xs font-medium text-[var(--color-fg)] hover:bg-[var(--color-panel-inset)]"
                      >
                        案件一覧へ
                        <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
                      </Link>
                      <Link
                        to={p.agentTo}
                        className="flex items-center gap-1.5 rounded-[var(--radius-control)] px-2.5 py-1.5 text-xs font-medium text-[var(--color-fg-muted)] hover:bg-[var(--color-panel-inset)]"
                      >
                        {p.agentTo === '/agents' ? 'Agent 一覧で確認' : 'Agent 設定へ'}
                        <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
                      </Link>
                    </div>
                  </section>
                )
              })}
            </div>
          </section>

          {/* 今日の処理サマリ (token-clean custom collapse) */}
          <section className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-panel)] p-3">
            <button
              type="button"
              onClick={() => setSummaryOpen((o) => !o)}
              aria-expanded={summaryOpen}
              className="flex w-full items-center gap-1.5 text-left text-xs font-medium text-[var(--color-fg-muted)]"
            >
              <ChevronRightIcon className={cn('h-3 w-3 flex-shrink-0 transition-transform', summaryOpen && 'rotate-90')} aria-hidden="true" />
              <span className="text-[var(--color-fg)]">今日の処理サマリ</span>
              <MetaChip label="仮説 / 要検証" className="ml-auto" />
            </button>
            {summaryOpen && (
              <div className="flex flex-wrap gap-x-6 gap-y-1 pt-2 text-xs text-[var(--color-fg-muted)]">
                <span>本日の受付 <span className="font-mono font-semibold text-[var(--color-fg)]">{HUB_DAILY_SUMMARY.intake}</span> 件</span>
                <span>反映済 <span className="font-mono font-semibold text-[var(--color-fg)]">{HUB_DAILY_SUMMARY.reflected}</span> 件</span>
                <span>差戻し再処理 <span className="font-mono font-semibold text-[var(--color-fg)]">{HUB_DAILY_SUMMARY.sentBack}</span> 件</span>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
