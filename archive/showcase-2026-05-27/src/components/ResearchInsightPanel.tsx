import type { Pattern } from '@/data/patterns'
import { evidenceLabels, freshnessLabels } from '@/data/patterns'
import { cn } from '@/lib/cn'

/**
 * Renders the research-compounder knowledge card excerpt inline on a pattern detail.
 * 4 sections: Evidence + Freshness header / Audit notes / Customization / Retrieval tags.
 *
 * Use-when / Avoid-when は demo notes に既出のため本 panel では重複させない (separation of concern).
 */
export function ResearchInsightPanel({ pattern }: { pattern: Pattern }) {
  return (
    <section className="mt-10">
      <div className="flex items-center gap-3 mb-4">
        <h3 className="text-[18px] font-semibold tracking-tight text-[color:var(--color-ink)]">
          Knowledge Card 抜粋
        </h3>
        <span className="text-[11px] text-[color:var(--color-fg-muted)] font-mono">
          {pattern.knowledgeCard ?? '—'}
        </span>
      </div>

      {/* Evidence + Freshness header */}
      <EvidenceFreshnessHeader pattern={pattern} />

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AuditNotesCard pattern={pattern} />
        <CustomizationCard pattern={pattern} />
      </div>

      <RetrievalTagsRow pattern={pattern} />
    </section>
  )
}

function EvidenceFreshnessHeader({ pattern }: { pattern: Pattern }) {
  const ev = evidenceLabels[pattern.evidence]
  const fr = freshnessLabels[pattern.freshness]

  const evColor =
    pattern.evidence === 'production-safe'
      ? 'bg-[color:var(--color-success-soft)] text-[color:var(--color-success-soft-fg)] border-[color:var(--color-success-soft)]'
      : pattern.evidence === 'directional'
      ? 'bg-[color:var(--color-alert-soft)] text-[color:var(--color-alert-soft-fg)] border-[color:var(--color-alert-soft)]'
      : 'bg-[color:var(--color-error-soft)] text-[color:var(--color-error-soft-fg)] border-[color:var(--color-error-soft)]'

  const frBar = {
    breaking: 1 / 4,
    monthly: 2 / 4,
    quarterly: 3 / 4,
    stable: 4 / 4,
  }[pattern.freshness]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div className={cn('rounded-[var(--radius-card)] border p-4', evColor)}>
        <div className="flex items-center gap-2 mb-1.5">
          <ShieldIcon />
          <span className="text-[10px] uppercase tracking-wider font-bold">Evidence Strength</span>
          <span className="ml-auto text-[11px] font-mono font-semibold">{ev.label}</span>
        </div>
        <p className="text-[12px] leading-[1.55] opacity-90">{ev.description}</p>
        <p className="text-[11px] leading-[1.5] mt-1.5 opacity-80 italic">{pattern.evidenceWhy}</p>
      </div>

      <div className="rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[color:var(--color-panel)] p-4">
        <div className="flex items-center gap-2 mb-1.5">
          <ClockIcon />
          <span className="text-[10px] uppercase tracking-wider font-bold text-[color:var(--color-fg-muted)]">
            Freshness
          </span>
          <span className="ml-auto text-[11px] font-mono font-semibold text-[color:var(--color-ink)]">
            {fr.label} · {fr.period}
          </span>
        </div>
        <div className="mt-2 h-1.5 w-full rounded-full bg-[color:var(--color-panel-inset)] overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[color:var(--color-alert)] to-[color:var(--color-success)]"
            style={{ width: `${frBar * 100}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-[9px] font-mono text-[color:var(--color-fg-subtle)] tabular">
          <span>breaking</span>
          <span>monthly</span>
          <span>quarterly</span>
          <span>stable</span>
        </div>
        <p className="text-[11px] leading-[1.5] mt-2.5 text-[color:var(--color-fg-muted)] italic">
          再検証 trigger: {pattern.refreshTrigger}
        </p>
      </div>
    </div>
  )
}

function AuditNotesCard({ pattern }: { pattern: Pattern }) {
  if (pattern.auditNotes.length === 0) return null
  return (
    <div className="rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[color:var(--color-panel)] p-5">
      <div className="flex items-center gap-2 mb-3">
        <NotesIcon />
        <h4 className="text-[12px] uppercase tracking-wider font-bold text-[color:var(--color-ink)]">
          Audit Notes — 設計時の落とし穴
        </h4>
      </div>
      <ul className="space-y-2">
        {pattern.auditNotes.map((n, i) => (
          <li key={i} className="flex gap-2 text-[12px] leading-[1.55] text-[color:var(--color-fg)]">
            <span className="text-[color:var(--color-alert)] mt-1 flex-none" aria-hidden>
              <DotIcon />
            </span>
            <span>{n}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function CustomizationCard({ pattern }: { pattern: Pattern }) {
  const c = pattern.customization
  return (
    <div className="rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[color:var(--color-panel)] p-5">
      <div className="flex items-center gap-2 mb-3">
        <CustomIcon />
        <h4 className="text-[12px] uppercase tracking-wider font-bold text-[color:var(--color-ink)]">
          Customization Boundary
        </h4>
      </div>

      <div className="mb-3">
        <h5 className="text-[10px] uppercase tracking-wider font-semibold text-[color:var(--color-primary)] mb-1.5">
          置換必須 (社内文脈に合わせる)
        </h5>
        <ul className="space-y-1">
          {c.mustReplace.map((s, i) => (
            <li key={i} className="flex gap-2 text-[12px] text-[color:var(--color-fg)]">
              <span className="text-[color:var(--color-primary)] mt-1 flex-none">·</span>
              <span>{s}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h5 className="text-[10px] uppercase tracking-wider font-semibold text-[color:var(--color-error-soft-fg)] mb-1.5">
          変更禁止 (audit / compliance gate)
        </h5>
        <ul className="space-y-1">
          {c.mustNotChange.map((s, i) => (
            <li key={i} className="flex gap-2 text-[12px] text-[color:var(--color-fg)]">
              <span className="text-[color:var(--color-error)] mt-1 flex-none">×</span>
              <span>{s}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function RetrievalTagsRow({ pattern }: { pattern: Pattern }) {
  if (pattern.retrievalTags.length === 0) return null
  return (
    <div className="mt-4 rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[color:var(--color-panel-inset)]/50 p-4">
      <div className="flex items-center gap-2 mb-2">
        <TagsIcon />
        <h4 className="text-[10px] uppercase tracking-wider font-bold text-[color:var(--color-fg-muted)]">
          Retrieval tags — research-compounder index 引き当て
        </h4>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {pattern.retrievalTags.map((t) => (
          <span
            key={t}
            className="inline-flex items-center rounded-[var(--radius-chip)] bg-[color:var(--color-panel)] border border-[color:var(--color-border)] px-2 py-0.5 text-[10px] font-mono text-[color:var(--color-fg)]"
          >
            #{t}
          </span>
        ))}
      </div>
    </div>
  )
}

/* === Icons (inline svg、12-14px、currentColor) === */

function ShieldIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M7 1l5 2v4c0 3-2.5 5.5-5 6-2.5-.5-5-3-5-6V3l5-2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M5 7l1.5 1.5L9.5 5.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden>
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M7 4v3l2 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function NotesIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden>
      <rect x="2" y="2" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M4 5h6M4 7h6M4 9h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

function CustomIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M3 7l3 3 5-6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="11" cy="3" r="1.5" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  )
}

function TagsIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M2 7V2h5l5 5-5 5-5-5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <circle cx="4.5" cy="4.5" r="0.8" fill="currentColor" />
    </svg>
  )
}

function DotIcon() {
  return (
    <svg width="6" height="6" viewBox="0 0 6 6" aria-hidden>
      <circle cx="3" cy="3" r="2" fill="currentColor" />
    </svg>
  )
}
