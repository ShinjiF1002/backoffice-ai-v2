import { useState } from 'react'
import { PatternDemo, DemoFrame } from '@/components/PatternShell'
import { cn } from '@/lib/cn'

type AgentStatus = 'running' | 'paused' | 'failed' | 'awaiting'

type Agent = {
  id: string
  name: string
  status: AgentStatus
  queue: number
  err24h: number
  lastIntervention: string | null
}

const AGENTS: Agent[] = [
  { id: 'agent-ops-v1.4', name: '住所変更 Bot',     status: 'running',  queue: 12, err24h: 0.4, lastIntervention: null },
  { id: 'agent-kyc-v2.1', name: 'KYC 再審査 Bot',   status: 'awaiting', queue: 4,  err24h: 1.2, lastIntervention: '08:54' },
  { id: 'agent-aml-v1.2', name: 'AML alert Bot',    status: 'failed',   queue: 0,  err24h: 8.7, lastIntervention: '08:30' },
  { id: 'agent-loan-v1.0', name: 'Loan triage Bot', status: 'running',  queue: 27, err24h: 0.1, lastIntervention: null },
  { id: 'agent-doc-v0.9', name: '書類完備 Bot',     status: 'paused',   queue: 0,  err24h: 0.0, lastIntervention: '07:12' },
  { id: 'agent-mail-v1.1', name: 'Inbox triage Bot', status: 'running', queue: 3,  err24h: 0.5, lastIntervention: null },
]

export function OperatorCockpitDemo() {
  const [selected, setSelected] = useState<string>('agent-aml-v1.2')
  const sel = AGENTS.find((a) => a.id === selected) ?? AGENTS[0]

  const fleet = {
    running: AGENTS.filter((a) => a.status === 'running').length,
    failed: AGENTS.filter((a) => a.status === 'failed').length,
    awaiting: AGENTS.filter((a) => a.status === 'awaiting').length,
    queueTotal: AGENTS.reduce((s, a) => s + a.queue, 0),
  }

  return (
    <PatternDemo
      notes={{
        useWhen: [
          '10+ AI agent を 1 operator が監督する fleet management',
          'aggregate KPI / per-agent grid / selected agent drill-down を同時に見せたい',
          'intervention を T1-T4 tier gate (read / local / external / critical) で扱う必要がある',
        ],
        avoidWhen: [
          'Agent が 3 以下 (single-agent dashboard で足りる)',
          'Operator が常駐せず on-call 通知のみで運用する場合 (alert-first UI へ)',
          'kill switch を視覚的に強調するだけで tier / audit / reason code を持たせない実装',
        ],
      }}
    >
      <DemoFrame viewport="Desktop 1280×800 · 3 viewport cockpit">
        <div className="flex flex-col">
          {/* === Top: KPI strip === */}
          <div className="grid grid-cols-4 border-b border-[color:var(--color-border)] divide-x divide-[color:var(--color-border)]">
            <KpiCell label="Running"        value={fleet.running}  total={AGENTS.length} dot="bg-[color:var(--color-success)]" />
            <KpiCell label="Failed"         value={fleet.failed}   total={AGENTS.length} dot="bg-[color:var(--color-error)]" emphasis />
            <KpiCell label="Awaiting human" value={fleet.awaiting} total={AGENTS.length} dot="bg-[color:var(--color-alert)]" emphasis />
            <KpiCell label="Queue depth"    value={fleet.queueTotal} dot="bg-[color:var(--color-primary)]" suffix="cases" />
          </div>
          {/* === Body: agent grid + detail rail === */}
          <div className="flex h-[440px]">
            <div className="flex-1 grid grid-cols-2 gap-3 p-4 overflow-y-auto bg-[color:var(--color-panel-inset)]/40">
              {AGENTS.map((a) => (
                <AgentCard key={a.id} a={a} selected={a.id === selected} onClick={() => setSelected(a.id)} />
              ))}
            </div>
            <div className="w-[360px] border-l border-[color:var(--color-border)] bg-[color:var(--color-panel)] p-5 overflow-y-auto">
              <DetailRail a={sel} />
            </div>
          </div>
        </div>
      </DemoFrame>
    </PatternDemo>
  )
}

function KpiCell({
  label, value, total, dot, suffix, emphasis,
}: { label: string; value: number; total?: number; dot: string; suffix?: string; emphasis?: boolean }) {
  return (
    <div className="px-5 py-4 bg-[color:var(--color-panel)]">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-medium text-[color:var(--color-fg-subtle)]">
        <span className={cn('h-1.5 w-1.5 rounded-full', dot)} />
        {label}
      </div>
      <div className="mt-1.5 flex items-baseline gap-1.5">
        <span className={cn('text-[28px] font-bold tabular', emphasis ? 'text-[color:var(--color-ink)]' : 'text-[color:var(--color-ink)]')}>
          {value}
        </span>
        {total !== undefined && (
          <span className="text-[12px] text-[color:var(--color-fg-muted)] tabular">/ {total}</span>
        )}
        {suffix && <span className="text-[11px] text-[color:var(--color-fg-muted)]">{suffix}</span>}
      </div>
    </div>
  )
}

function AgentCard({ a, selected, onClick }: { a: Agent; selected: boolean; onClick: () => void }) {
  const statusMap: Record<AgentStatus, { dot: string; label: string; text: string }> = {
    running:  { dot: 'bg-[color:var(--color-success)]', label: 'Running',   text: 'text-[color:var(--color-success-soft-fg)]' },
    paused:   { dot: 'bg-[color:var(--color-fg-subtle)]', label: 'Paused',  text: 'text-[color:var(--color-fg-muted)]' },
    failed:   { dot: 'bg-[color:var(--color-error)]', label: 'Failed',     text: 'text-[color:var(--color-error-soft-fg)]' },
    awaiting: { dot: 'bg-[color:var(--color-alert)]', label: 'Awaiting',   text: 'text-[color:var(--color-alert-soft-fg)]' },
  }
  const s = statusMap[a.status]
  return (
    <button
      onClick={onClick}
      className={cn(
        'text-left rounded-[var(--radius-control)] border bg-[color:var(--color-panel)] p-4 transition-all',
        selected
          ? 'border-[color:var(--color-primary)] shadow-[0_0_0_3px_var(--color-primary-soft)]'
          : 'border-[color:var(--color-border)] hover:border-[color:var(--color-border-strong)]'
      )}
    >
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className={cn('h-2 w-2 rounded-full', s.dot, a.status === 'running' && 'animate-pulse')} />
          <span className={cn('text-[10px] uppercase tracking-wider font-medium', s.text)}>{s.label}</span>
        </div>
        <span className="text-[10px] text-[color:var(--color-fg-subtle)] font-mono tabular">
          err {a.err24h}%
        </span>
      </div>
      <div className="text-[13px] font-semibold text-[color:var(--color-ink)] tracking-tight mb-0.5">{a.name}</div>
      <div className="text-[10px] font-mono text-[color:var(--color-fg-subtle)]">{a.id}</div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-[22px] font-bold tabular text-[color:var(--color-ink)]">{a.queue}</span>
        <span className="text-[11px] text-[color:var(--color-fg-muted)]">queue</span>
      </div>
    </button>
  )
}

function DetailRail({ a }: { a: Agent }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider font-medium text-[color:var(--color-fg-subtle)] mb-2">
        Selected agent
      </div>
      <h3 className="text-[16px] font-semibold tracking-tight text-[color:var(--color-ink)]">{a.name}</h3>
      <div className="text-[11px] font-mono text-[color:var(--color-fg-muted)] mb-4">{a.id}</div>

      <div className="space-y-3 mb-5">
        <Metric label="Queue depth" value={a.queue.toString()} />
        <Metric label="Error rate (24h)" value={`${a.err24h}%`} />
        <Metric label="Last intervention" value={a.lastIntervention ?? '—'} />
      </div>

      <div className="text-[10px] uppercase tracking-wider font-medium text-[color:var(--color-fg-subtle)] mb-2 mt-6">
        Interventions (T1-T4 tier gated)
      </div>
      <div className="grid grid-cols-2 gap-2">
        <TierButton tier="T1" label="View logs" />
        <TierButton tier="T2" label="Pause" />
        <TierButton tier="T3" label="Re-route queue" intent="alert" />
        <TierButton tier="T4" label="Kill switch" intent="danger" />
      </div>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-[11px] text-[color:var(--color-fg-muted)]">{label}</span>
      <span className="text-[12px] font-medium tabular text-[color:var(--color-fg)]">{value}</span>
    </div>
  )
}

function TierButton({ tier, label, intent }: { tier: string; label: string; intent?: 'alert' | 'danger' }) {
  return (
    <button
      className={cn(
        'group rounded-[var(--radius-control)] border px-3 py-2 text-left transition-colors',
        intent === 'danger'
          ? 'border-[color:var(--color-error-soft)] hover:bg-[color:var(--color-error-soft)]'
          : intent === 'alert'
          ? 'border-[color:var(--color-alert-soft)] hover:bg-[color:var(--color-alert-soft)]'
          : 'border-[color:var(--color-border)] hover:bg-[color:var(--color-panel-inset)]'
      )}
    >
      <div className={cn(
        'text-[9px] font-bold tracking-wider uppercase mb-0.5',
        intent === 'danger' ? 'text-[color:var(--color-error-soft-fg)]'
          : intent === 'alert' ? 'text-[color:var(--color-alert-soft-fg)]'
          : 'text-[color:var(--color-fg-subtle)]'
      )}>{tier}</div>
      <div className="text-[12px] font-medium text-[color:var(--color-fg)]">{label}</div>
    </button>
  )
}
