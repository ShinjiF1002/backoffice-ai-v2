import type { ReactNode } from 'react'

/**
 * Shared shell for pattern demos.
 * Provides: section heading + body container + optional "use when / avoid when" footer.
 */
export function PatternDemo({
  children,
  notes,
}: {
  children: ReactNode
  notes?: { useWhen: string[]; avoidWhen: string[] }
}) {
  return (
    <section className="mt-2">
      <div className="rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[color:var(--color-panel)] shadow-[var(--shadow-card)] overflow-hidden">
        {children}
      </div>
      {notes && <UseWhenAvoidWhen notes={notes} />}
    </section>
  )
}

export function DemoFrame({ children, viewport }: { children: ReactNode; viewport?: string }) {
  return (
    <div className="relative bg-[color:var(--color-panel-inset)] border-b border-[color:var(--color-border)] p-6">
      {viewport && (
        <div className="absolute top-3 right-4 text-[10px] font-mono text-[color:var(--color-fg-subtle)] tabular">
          {viewport}
        </div>
      )}
      <div className="rounded-[var(--radius-control)] bg-[color:var(--color-panel)] border border-[color:var(--color-border)] overflow-hidden">
        {children}
      </div>
    </div>
  )
}

function UseWhenAvoidWhen({ notes }: { notes: { useWhen: string[]; avoidWhen: string[] } }) {
  return (
    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="rounded-[var(--radius-card)] border border-[color:var(--color-success-soft)] bg-[color:var(--color-success-soft)]/40 p-5">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-success-soft-fg)] mb-2">
          ✓ Use when
        </div>
        <ul className="space-y-1.5 text-[13px] text-[color:var(--color-fg)]">
          {notes.useWhen.map((s, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-[color:var(--color-success-soft-fg)] mt-0.5">·</span>
              <span>{s}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-[var(--radius-card)] border border-[color:var(--color-error-soft)] bg-[color:var(--color-error-soft)]/40 p-5">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-error-soft-fg)] mb-2">
          ✗ Avoid when
        </div>
        <ul className="space-y-1.5 text-[13px] text-[color:var(--color-fg)]">
          {notes.avoidWhen.map((s, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-[color:var(--color-error-soft-fg)] mt-0.5">·</span>
              <span>{s}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
