import { useState } from 'react'
import { PatternDemo, DemoFrame } from '@/components/PatternShell'
import { cn } from '@/lib/cn'

type Actor = 'agent' | 'human' | 'system'

type AuditRow = {
  ts: string
  actor: Actor
  actorId: string
  action: string
  before: string | null
  after: string | null
  reason: string | null
  caseId: string
}

const ROWS: AuditRow[] = [
  { ts: '2026-05-26 09:00:01.123', actor: 'agent', actorId: 'agent-ops-v1.4', action: 'create-draft',  before: null,                                  after: '{ addr: "東京都千代田区丸の内1-3-1" }', reason: null,                          caseId: 'CASE-2026-0142' },
  { ts: '2026-05-26 09:00:42.456', actor: 'human', actorId: 'u-12345 (op-team)', action: 'request-info', before: null,                                after: null,                                       reason: '登記簿謄本の写しを依頼',                caseId: 'CASE-2026-0142' },
  { ts: '2026-05-26 09:05:18.789', actor: 'human', actorId: 'u-12345 (op-team)', action: 'approve',     before: 'pending',                             after: 'approved',                                 reason: '登記簿謄本確認済、登記情報と整合',     caseId: 'CASE-2026-0142' },
  { ts: '2026-05-26 09:05:18.812', actor: 'system', actorId: 'exec-pipeline-v3', action: 'execute',      before: 'approved',                            after: 'committed (tx=abc123)',                    reason: null,                          caseId: 'CASE-2026-0142' },
  { ts: '2026-05-26 09:12:33.901', actor: 'agent', actorId: 'agent-kyc-v2.1', action: 'create-draft',   before: null,                                  after: '{ riskTier: "Enhanced" }',                  reason: null,                          caseId: 'CASE-2026-0141' },
  { ts: '2026-05-26 09:30:00.000', actor: 'system', actorId: 'sla-monitor', action: 'escalate',         before: 'pending',                             after: 'escalated (target=team-lead)',              reason: 'SLA exceed: pending > 2h',    caseId: 'CASE-2026-0140' },
  { ts: '2026-05-26 09:32:45.123', actor: 'human', actorId: 'u-67890 (team-lead)', action: 'reject',    before: 'escalated',                           after: 'rejected',                                 reason: '取引先 reputation 不適合',              caseId: 'CASE-2026-0140' },
]

const ACTORS: Array<{ id: Actor | 'all'; label: string }> = [
  { id: 'all',   label: 'All' },
  { id: 'agent', label: 'Agent' },
  { id: 'human', label: 'Human' },
  { id: 'system', label: 'System' },
]

export function AuditTrailDemo() {
  const [filter, setFilter] = useState<Actor | 'all'>('all')
  const filtered = filter === 'all' ? ROWS : ROWS.filter((r) => r.actor === filter)

  return (
    <PatternDemo
      notes={{
        useWhen: [
          '規制対象業務で「誰が・何時・何を・どうしたか」を不可逆 log として残す必要がある',
          'agent / human / system の actor を column 分離して compliance review 可能にする',
          'reason code + diff snippet を 1 行に圧縮、export 可能な tabular 形式が必要',
        ],
        avoidWhen: [
          '内部 debugging だけの軽い log (audit retention 不要なら overhead 過剰)',
          'free-form text dump (regulator review で actor / source / 差分が不能)',
          'PII を redact せずに full data を出す (compliance 違反)',
        ],
      }}
    >
      <DemoFrame viewport="Desktop 1280×800 · Tabular audit log">
        <div className="flex flex-col">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-[color:var(--color-border)] bg-[color:var(--color-panel-inset)]/60">
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-wider font-medium text-[color:var(--color-fg-subtle)]">
                Filter actor:
              </span>
              <div className="inline-flex rounded-[var(--radius-control)] border border-[color:var(--color-border)] bg-[color:var(--color-panel)] p-0.5">
                {ACTORS.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setFilter(a.id)}
                    className={cn(
                      'px-2.5 py-1 text-[11px] font-medium rounded-[3px] transition-colors',
                      filter === a.id
                        ? 'bg-[color:var(--color-primary-soft)] text-[color:var(--color-primary)]'
                        : 'text-[color:var(--color-fg-muted)] hover:bg-[color:var(--color-panel-inset)]'
                    )}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
              <span className="text-[11px] text-[color:var(--color-fg-muted)] ml-2">
                {filtered.length} / {ROWS.length} rows
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button className="inline-flex items-center gap-1.5 rounded-[var(--radius-control)] border border-[color:var(--color-border)] bg-[color:var(--color-panel)] px-2.5 py-1 text-[11px] font-medium text-[color:var(--color-fg)] hover:bg-[color:var(--color-panel-inset)]">
                <ExportIcon /> CSV export
              </button>
              <button className="inline-flex items-center gap-1.5 rounded-[var(--radius-control)] border border-[color:var(--color-border)] bg-[color:var(--color-panel)] px-2.5 py-1 text-[11px] font-medium text-[color:var(--color-fg)] hover:bg-[color:var(--color-panel-inset)]">
                <ExportIcon /> JSONL
              </button>
            </div>
          </div>

          {/* Header */}
          <div className="grid grid-cols-[170px_88px_120px_120px_1fr_1fr_1fr] gap-2 px-5 py-2 border-b border-[color:var(--color-border)] bg-[color:var(--color-panel-inset)] text-[9px] uppercase tracking-wider font-semibold text-[color:var(--color-fg-subtle)]">
            <div>Timestamp (ISO + tz)</div>
            <div>Actor type</div>
            <div>Actor ID</div>
            <div>Action</div>
            <div>Before</div>
            <div>After</div>
            <div>Reason</div>
          </div>

          {/* Rows */}
          <div className="max-h-[360px] overflow-y-auto">
            {filtered.map((r, i) => (
              <div
                key={i}
                className={cn(
                  'grid grid-cols-[170px_88px_120px_120px_1fr_1fr_1fr] gap-2 px-5 py-2.5 text-[11px] items-start',
                  i > 0 && 'border-t border-[color:var(--color-border)]',
                  'hover:bg-[color:var(--color-panel-inset)]/40'
                )}
              >
                <div className="font-mono tabular text-[color:var(--color-fg-muted)] text-[10px]">{r.ts}</div>
                <div>
                  <ActorBadge actor={r.actor} />
                </div>
                <div className="font-mono text-[color:var(--color-fg)] text-[10px]">{r.actorId}</div>
                <div className="font-mono text-[color:var(--color-fg)]">{r.action}</div>
                <div className={cn('font-mono text-[10px]', r.before ? 'text-[color:var(--color-error-soft-fg)]' : 'text-[color:var(--color-fg-subtle)]')}>
                  {r.before ?? '—'}
                </div>
                <div className={cn('font-mono text-[10px]', r.after ? 'text-[color:var(--color-success-soft-fg)]' : 'text-[color:var(--color-fg-subtle)]')}>
                  {r.after ?? '—'}
                </div>
                <div className={cn('text-[10px]', r.reason ? 'text-[color:var(--color-fg)]' : 'text-[color:var(--color-fg-subtle)]')}>
                  {r.reason ?? '—'}
                </div>
              </div>
            ))}
          </div>

          {/* Footer note */}
          <div className="border-t border-[color:var(--color-border)] px-5 py-2.5 bg-[color:var(--color-panel-inset)]/40 flex items-center justify-between">
            <span className="text-[10px] text-[color:var(--color-fg-subtle)]">
              Retention: 7 years (banking) · PII redacted at column level · Append-only
            </span>
            <span className="text-[10px] font-mono text-[color:var(--color-fg-subtle)]">
              schema v3.2
            </span>
          </div>
        </div>
      </DemoFrame>
    </PatternDemo>
  )
}

function ActorBadge({ actor }: { actor: Actor }) {
  const map: Record<Actor, { bg: string; fg: string; icon: string }> = {
    agent:  { bg: 'bg-[color:var(--color-primary-soft)]', fg: 'text-[color:var(--color-primary)]', icon: '◆' },
    human:  { bg: 'bg-[#dbeafe]',                          fg: 'text-[#1d4ed8]',                     icon: '●' },
    system: { bg: 'bg-[color:var(--color-panel-inset)]',  fg: 'text-[color:var(--color-fg-muted)]', icon: '◈' },
  }
  const m = map[actor]
  return (
    <span className={cn('inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider', m.bg, m.fg)}>
      <span className="text-[10px] leading-none" aria-hidden>{m.icon}</span>
      {actor}
    </span>
  )
}

function ExportIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden>
      <path d="M5.5 1.5v6m0 0L3 5m2.5 2.5L8 5M2 9.5h7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
