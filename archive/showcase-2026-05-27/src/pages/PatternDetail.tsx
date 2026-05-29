import { useParams, Link, Navigate } from 'react-router-dom'
import { getPattern, categoryLabels, freshnessLabels } from '@/data/patterns'
import { HilApprovalDemo } from '@/patterns/hil-approval'
import { OperatorCockpitDemo } from '@/patterns/operator-cockpit'
import { DiffPreviewDemo } from '@/patterns/diff-preview'
import { CitationDisclosureDemo } from '@/patterns/citation-disclosure'
import { ActionConfirmationDemo } from '@/patterns/action-confirmation'
import { AuditTrailDemo } from '@/patterns/audit-trail'
import { ResearchInsightPanel } from '@/components/ResearchInsightPanel'

const DEMO_REGISTRY: Record<string, React.ComponentType> = {
  'hil-approval': HilApprovalDemo,
  'operator-cockpit': OperatorCockpitDemo,
  'diff-preview': DiffPreviewDemo,
  'citation-disclosure': CitationDisclosureDemo,
  'action-confirmation': ActionConfirmationDemo,
  'audit-trail': AuditTrailDemo,
}

export function PatternDetail() {
  const { id } = useParams<{ id: string }>()
  const pattern = id ? getPattern(id) : undefined
  if (!pattern) return <Navigate to="/" replace />

  return (
    <main className="mx-auto max-w-[var(--container-wide)] px-6 pt-12 pb-24">
      <Breadcrumb title={pattern.title} />
      <header className="mt-6 mb-10">
        <div className="flex items-center gap-2 mb-3 text-[12px] text-[color:var(--color-fg-muted)]">
          <span>{categoryLabels[pattern.category]}</span>
          <span aria-hidden>·</span>
          <span className="font-mono text-[11px]">{pattern.id}</span>
          <span aria-hidden>·</span>
          <FreshnessInlineBadge pattern={pattern} />
        </div>
        <h1 className="text-[36px] font-bold tracking-tight text-[color:var(--color-ink)]">
          {pattern.title}
        </h1>
        <p className="mt-2 text-[15px] text-[color:var(--color-fg-muted)]">{pattern.tagline}</p>
        <p className="mt-5 max-w-[var(--container-narrow)] text-[14px] leading-[1.7] text-[color:var(--color-fg)]">
          {pattern.problem}
        </p>
      </header>

      {/* Demo slot — filled in by per-pattern files in Cycle 3-4 */}
      <PatternDemoSlot id={pattern.id} />

      {/* Inline knowledge card excerpt (Cycle 7 — research-compounder deep integration) */}
      <ResearchInsightPanel pattern={pattern} />

      <ResearchBinding pattern={pattern} />
    </main>
  )
}

function FreshnessInlineBadge({ pattern }: { pattern: ReturnType<typeof getPattern> }) {
  if (!pattern) return null
  const fr = freshnessLabels[pattern.freshness]
  const map = {
    breaking: 'text-[color:var(--color-error-soft-fg)]',
    monthly: 'text-[color:var(--color-alert-soft-fg)]',
    quarterly: 'text-[color:var(--color-primary)]',
    stable: 'text-[color:var(--color-success-soft-fg)]',
  } as const
  return (
    <span className={`font-mono text-[11px] ${map[pattern.freshness]}`}>
      {fr.label} · {fr.period}
    </span>
  )
}

function Breadcrumb({ title }: { title: string }) {
  return (
    <nav className="text-[12px] text-[color:var(--color-fg-muted)]">
      <Link to="/" className="hover:text-[color:var(--color-fg)] transition-colors">
        Patterns
      </Link>
      <span className="mx-2" aria-hidden>
        /
      </span>
      <span className="text-[color:var(--color-fg)]">{title}</span>
    </nav>
  )
}

function PatternDemoSlot({ id }: { id: string }) {
  const Demo = DEMO_REGISTRY[id]
  if (Demo) return <Demo />
  return (
    <section className="rounded-[var(--radius-card)] border border-dashed border-[color:var(--color-border-strong)] bg-[color:var(--color-panel)] p-12 text-center">
      <div className="inline-flex items-center gap-2 rounded-full bg-[color:var(--color-accent-violet-soft)] px-3 py-1 text-[11px] font-medium text-[color:var(--color-primary)] mb-3">
        Demo — preview
      </div>
      <p className="text-[14px] text-[color:var(--color-fg-muted)]">
        <span className="font-mono text-[12px]">{id}</span> の interactive demo は次の cycle で追加。
      </p>
    </section>
  )
}

function ResearchBinding({ pattern }: { pattern: ReturnType<typeof getPattern> }) {
  if (!pattern) return null
  return (
    <aside className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[color:var(--color-panel)] p-5">
        <h3 className="text-[11px] uppercase tracking-wider text-[color:var(--color-fg-subtle)] font-medium mb-2">
          Research-compounder binding
        </h3>
        <dl className="space-y-2 text-[13px]">
          {pattern.knowledgeCard && (
            <div>
              <dt className="text-[11px] text-[color:var(--color-fg-muted)]">Knowledge card</dt>
              <dd className="font-mono text-[12px] text-[color:var(--color-fg)]">{pattern.knowledgeCard}</dd>
            </div>
          )}
          {pattern.sample && (
            <div>
              <dt className="text-[11px] text-[color:var(--color-fg-muted)]">Sample</dt>
              <dd className="font-mono text-[12px] text-[color:var(--color-fg)]">{pattern.sample}</dd>
            </div>
          )}
        </dl>
      </div>
      <div className="rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[color:var(--color-panel)] p-5">
        <h3 className="text-[11px] uppercase tracking-wider text-[color:var(--color-fg-subtle)] font-medium mb-2">
          Primitives
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {pattern.primitives.map((p) => (
            <span
              key={p}
              className="inline-block rounded-[var(--radius-chip)] bg-[color:var(--color-panel-inset)] px-2 py-0.5 text-[11px] font-mono text-[color:var(--color-fg)]"
            >
              {p}
            </span>
          ))}
        </div>
      </div>
    </aside>
  )
}
