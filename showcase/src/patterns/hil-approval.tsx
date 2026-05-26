import { useState } from 'react'
import { PatternDemo, DemoFrame } from '@/components/PatternShell'
import { cn } from '@/lib/cn'

type State = 'pending' | 'approved' | 'rejected' | 'failed' | 'escalated'
type Actor = 'agent' | 'human' | 'system'

type Case = {
  id: string
  type: string
  state: State
  actor: Actor
  sla: number // 0-100
  lastBy: string
  lastAt: string
  proposal: { field: string; before: string; after: string }[]
}

const CASES: Case[] = [
  {
    id: 'CASE-2026-0142',
    type: '法人住所変更',
    state: 'pending',
    actor: 'agent',
    sla: 62,
    lastBy: 'agent-ops-v1.4',
    lastAt: '09:00:01',
    proposal: [
      { field: '住所', before: '東京都港区六本木6-10-1', after: '東京都千代田区丸の内1-3-1' },
      { field: '郵便番号', before: '106-6126', after: '100-0005' },
    ],
  },
  {
    id: 'CASE-2026-0141',
    type: 'KYC 再審査',
    state: 'pending',
    actor: 'agent',
    sla: 28,
    lastBy: 'agent-kyc-v2.1',
    lastAt: '08:54:12',
    proposal: [{ field: 'リスク区分', before: 'Standard', after: 'Enhanced' }],
  },
  {
    id: 'CASE-2026-0140',
    type: 'AML alert',
    state: 'escalated',
    actor: 'system',
    sla: 8,
    lastBy: 'sla-monitor',
    lastAt: '08:30:00',
    proposal: [{ field: '判定', before: 'pending', after: 'team-lead-review' }],
  },
  {
    id: 'CASE-2026-0139',
    type: 'Loan exception',
    state: 'approved',
    actor: 'human',
    sla: 100,
    lastBy: 'u-12345',
    lastAt: '08:21:43',
    proposal: [{ field: 'LTV 例外', before: '85%', after: '92%' }],
  },
  {
    id: 'CASE-2026-0138',
    type: '法人住所変更',
    state: 'failed',
    actor: 'agent',
    sla: 45,
    lastBy: 'agent-ops-v1.4',
    lastAt: '08:11:09',
    proposal: [{ field: '住所', before: '神奈川県横浜市…', after: '神奈川県川崎市…' }],
  },
]

export function HilApprovalDemo() {
  const [selectedId, setSelectedId] = useState<string>('CASE-2026-0142')
  const selected = CASES.find((c) => c.id === selectedId) ?? CASES[0]

  return (
    <PatternDemo
      notes={{
        useWhen: [
          'AI agent が draft を作り、human が approve / reject する全 SaaS / 業務 (KYC, AML, 法人住所変更, refund 等)',
          'Actor (agent / human / system) を audit log で明示分離したい',
          '5 state (pending / approved / rejected / failed / escalated) を 1 画面に圧縮したい',
        ],
        avoidWhen: [
          'agent が単独で execute 完結する read-only workflow',
          '承認段が 1 段で済む単純 ticket (オーバースペック)',
          'banking compliance で keyboard shortcut approve を要求される文脈 (誤操作 risk)',
        ],
      }}
    >
      <DemoFrame viewport="Desktop 1280×800 · Master/Detail">
        <div className="flex h-[540px]">
          {/* === Table (master) === */}
          <div className="flex-1 border-r border-[color:var(--color-border)] flex flex-col">
            <TableHeader />
            <div className="flex-1 overflow-y-auto">
              {CASES.map((c) => (
                <CaseRow
                  key={c.id}
                  c={c}
                  selected={c.id === selectedId}
                  onClick={() => setSelectedId(c.id)}
                />
              ))}
            </div>
          </div>
          {/* === Drawer (detail) === */}
          <div className="w-[480px] bg-[color:var(--color-panel)] flex flex-col">
            <DrawerHeader c={selected} />
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <ProposalDiff c={selected} />
              <AuditLog c={selected} />
            </div>
            <ActionBar state={selected.state} />
          </div>
        </div>
      </DemoFrame>
    </PatternDemo>
  )
}

function TableHeader() {
  return (
    <div className="grid grid-cols-[36px_120px_140px_1fr_64px_72px] gap-3 px-4 py-2.5 border-b border-[color:var(--color-border)] bg-[color:var(--color-panel-inset)] text-[10px] uppercase tracking-wider font-medium text-[color:var(--color-fg-subtle)]">
      <div></div>
      <div>ID</div>
      <div>Type</div>
      <div>State / Actor</div>
      <div className="text-right">SLA</div>
      <div className="text-right">Last</div>
    </div>
  )
}

function CaseRow({ c, selected, onClick }: { c: Case; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full grid grid-cols-[36px_120px_140px_1fr_64px_72px] gap-3 px-4 py-3 border-b border-[color:var(--color-border)] text-left items-center text-[12px] transition-colors',
        selected
          ? 'bg-[color:var(--color-primary-soft)]'
          : 'hover:bg-[color:var(--color-panel-inset)]/60'
      )}
    >
      <ActorBand actor={c.actor} />
      <div className="font-mono text-[11px] tabular text-[color:var(--color-fg)]">{c.id}</div>
      <div className="text-[color:var(--color-fg)]">{c.type}</div>
      <div className="flex items-center gap-2">
        <StateBadge state={c.state} />
      </div>
      <div className="text-right tabular">
        <SLAChip pct={c.sla} />
      </div>
      <div className="text-right font-mono text-[10px] text-[color:var(--color-fg-muted)] tabular">
        {c.lastAt}
      </div>
    </button>
  )
}

function ActorBand({ actor }: { actor: Actor }) {
  const color: Record<Actor, string> = {
    agent: 'bg-[color:var(--color-primary)]',
    human: 'bg-[#3b82f6]',
    system: 'bg-[color:var(--color-fg-subtle)]',
  }
  const icon: Record<Actor, string> = { agent: '◆', human: '●', system: '◈' }
  return (
    <div className="flex items-center gap-2">
      <span className={cn('h-7 w-0.5 rounded-full', color[actor])} aria-hidden />
      <span className="text-[10px] text-[color:var(--color-fg-muted)] font-mono w-3" aria-label={actor}>
        {icon[actor]}
      </span>
    </div>
  )
}

function StateBadge({ state }: { state: State }) {
  const map: Record<State, { bg: string; fg: string; dot: string; label: string }> = {
    pending: {
      bg: 'bg-[color:var(--color-alert-soft)]',
      fg: 'text-[color:var(--color-alert-soft-fg)]',
      dot: 'bg-[color:var(--color-alert)]',
      label: 'Pending',
    },
    approved: {
      bg: 'bg-[color:var(--color-success-soft)]',
      fg: 'text-[color:var(--color-success-soft-fg)]',
      dot: 'bg-[color:var(--color-success)]',
      label: 'Approved',
    },
    rejected: {
      bg: 'bg-[color:var(--color-error-soft)]',
      fg: 'text-[color:var(--color-error-soft-fg)]',
      dot: 'bg-[color:var(--color-error)]',
      label: 'Rejected',
    },
    failed: {
      bg: 'bg-[color:var(--color-error-soft)]',
      fg: 'text-[color:var(--color-error-soft-fg)]',
      dot: 'bg-[#ea580c]',
      label: 'Failed',
    },
    escalated: {
      bg: 'bg-[color:var(--color-accent-violet-soft)]',
      fg: 'text-[color:var(--color-primary)]',
      dot: 'bg-[color:var(--color-primary)]',
      label: 'Escalated',
    },
  }
  const m = map[state]
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium', m.bg, m.fg)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', m.dot)} />
      {m.label}
    </span>
  )
}

function SLAChip({ pct }: { pct: number }) {
  const color =
    pct > 50 ? 'text-[color:var(--color-success-soft-fg)]'
    : pct > 10 ? 'text-[color:var(--color-alert-soft-fg)]'
    : 'text-[color:var(--color-error-soft-fg)]'
  return <span className={cn('text-[11px] font-medium tabular', color)}>{pct}%</span>
}

function DrawerHeader({ c }: { c: Case }) {
  return (
    <div className="px-5 py-4 border-b border-[color:var(--color-border)]">
      <div className="flex items-center justify-between mb-1.5">
        <span className="font-mono text-[11px] text-[color:var(--color-fg-muted)] tabular">{c.id}</span>
        <StateBadge state={c.state} />
      </div>
      <h3 className="text-[15px] font-semibold text-[color:var(--color-ink)] tracking-tight">{c.type}</h3>
      <TimelineDots state={c.state} />
    </div>
  )
}

function TimelineDots({ state }: { state: State }) {
  const states: State[] = ['pending', 'approved', 'rejected', 'failed', 'escalated']
  const labels = ['Pending', 'Approved', 'Rejected', 'Failed', 'Escalated']
  const currentIdx = states.indexOf(state)
  return (
    <div className="mt-3 flex items-center gap-1.5" aria-label="state timeline">
      {states.map((s, i) => {
        const isCurrent = i === currentIdx
        const isPast = i < currentIdx
        return (
          <div key={s} className="flex items-center gap-1.5 flex-1">
            <div
              className={cn(
                'h-2 w-2 rounded-full transition-colors flex-none',
                isCurrent && 'ring-2 ring-offset-2 ring-[color:var(--color-primary)] bg-[color:var(--color-primary)]',
                !isCurrent && isPast && 'bg-[color:var(--color-fg-subtle)]',
                !isCurrent && !isPast && 'bg-[color:var(--color-border-strong)]'
              )}
            />
            <span
              className={cn(
                'text-[9px] tracking-wider uppercase',
                isCurrent
                  ? 'text-[color:var(--color-primary)] font-medium'
                  : 'text-[color:var(--color-fg-subtle)]'
              )}
            >
              {labels[i]}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function ProposalDiff({ c }: { c: Case }) {
  return (
    <div className="mb-5">
      <div className="text-[10px] uppercase tracking-wider font-medium text-[color:var(--color-fg-subtle)] mb-2">
        Proposal (Before → After)
      </div>
      <div className="rounded-[var(--radius-control)] border border-[color:var(--color-border)] overflow-hidden">
        {c.proposal.map((p, i) => (
          <div
            key={i}
            className={cn(
              'grid grid-cols-[100px_1fr_1fr] gap-3 px-3 py-2.5 text-[12px] items-center',
              i > 0 && 'border-t border-[color:var(--color-border)]'
            )}
          >
            <div className="text-[11px] font-medium text-[color:var(--color-fg-muted)]">{p.field}</div>
            <div className="bg-[color:var(--color-diff-del-bg)] text-[color:var(--color-error-soft-fg)] rounded px-2 py-1 font-mono text-[11px] line-through opacity-80">
              {p.before}
            </div>
            <div className="bg-[color:var(--color-diff-add-bg)] text-[color:var(--color-success-soft-fg)] rounded px-2 py-1 font-mono text-[11px]">
              {p.after}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AuditLog({ c }: { c: Case }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider font-medium text-[color:var(--color-fg-subtle)] mb-2">
        Audit Log (actor-separated)
      </div>
      <div className="rounded-[var(--radius-control)] border border-[color:var(--color-border)] overflow-hidden">
        <div className="grid grid-cols-[80px_60px_1fr] gap-2 px-3 py-2 border-b border-[color:var(--color-border)] bg-[color:var(--color-panel-inset)] text-[9px] uppercase tracking-wider font-medium text-[color:var(--color-fg-subtle)]">
          <div>Time</div>
          <div>Actor</div>
          <div>Action</div>
        </div>
        {[
          { t: '09:00:01', actor: 'agent' as Actor, act: 'create-draft' },
          { t: c.lastAt, actor: c.actor, act: c.state === 'approved' ? 'approve' : c.state === 'escalated' ? 'escalate' : 'queue' },
        ].map((r, i) => (
          <div
            key={i}
            className={cn(
              'grid grid-cols-[80px_60px_1fr] gap-2 px-3 py-2 text-[11px] items-center',
              i > 0 && 'border-t border-[color:var(--color-border)]'
            )}
          >
            <div className="font-mono tabular text-[color:var(--color-fg-muted)]">{r.t}</div>
            <div>
              <ActorChip actor={r.actor} />
            </div>
            <div className="font-mono text-[color:var(--color-fg)]">{r.act}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ActorChip({ actor }: { actor: Actor }) {
  const color: Record<Actor, string> = {
    agent: 'bg-[color:var(--color-primary-soft)] text-[color:var(--color-primary)]',
    human: 'bg-[#dbeafe] text-[#1d4ed8]',
    system: 'bg-[color:var(--color-panel-inset)] text-[color:var(--color-fg-muted)]',
  }
  return (
    <span className={cn('inline-flex items-center rounded px-1.5 py-0.5 text-[9px] font-medium', color[actor])}>
      {actor}
    </span>
  )
}

function ActionBar({ state }: { state: State }) {
  const disabled = state !== 'pending'
  return (
    <div className="px-5 py-3.5 border-t border-[color:var(--color-border)] bg-[color:var(--color-panel)] flex gap-2 items-center">
      <button
        disabled={disabled}
        className="text-[12px] font-medium px-3 py-2 rounded-[var(--radius-control)] text-[color:var(--color-fg-muted)] hover:bg-[color:var(--color-panel-inset)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Reject
      </button>
      <button
        disabled={disabled}
        className="text-[12px] font-medium px-3 py-2 rounded-[var(--radius-control)] text-[color:var(--color-fg-muted)] hover:bg-[color:var(--color-panel-inset)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Escalate
      </button>
      <div className="flex-1" />
      <button
        disabled={disabled}
        className="text-[12px] font-semibold px-4 py-2 rounded-[var(--radius-control)] bg-[color:var(--color-primary)] text-[color:var(--color-primary-fg)] hover:bg-[color:var(--color-primary-hover)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Approve
      </button>
    </div>
  )
}
