import { Link } from 'react-router-dom'
import { patterns, categoryLabels, freshnessLabels } from '@/data/patterns'
import type { Pattern } from '@/data/patterns'
import { cn } from '@/lib/cn'
import { CatalogStatusBoard } from '@/components/CatalogStatusBoard'

export function Landing() {
  return (
    <main>
      <Hero />
      <PatternGrid />
      <CatalogStatusBoard />
      <Methodology />
    </main>
  )
}

function Hero() {
  return (
    <section className="hero-gradient border-b border-[color:var(--color-border)]">
      <div className="mx-auto max-w-[var(--container-wide)] px-6 pt-20 pb-16">
        <div className="max-w-[var(--container-narrow)]">
          <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--color-border-strong)] bg-[color:var(--color-panel)] px-3 py-1 text-[11px] font-medium text-[color:var(--color-fg-muted)] mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--color-primary)]" />
            Pattern catalog · v0.1
          </div>
          <h1 className="text-[44px] md:text-[56px] font-bold leading-[1.05] tracking-tight text-[color:var(--color-ink)]">
            Backoffice operator が
            <br />
            <span className="text-[color:var(--color-primary)]">秒で判断できる</span> UI を、
            <br />
            蓄積パターンから組む。
          </h1>
          <p className="mt-6 max-w-[620px] text-[16px] leading-[1.65] text-[color:var(--color-fg-muted)]">
            AI agent と human operator が同じ queue を扱う backoffice 業務向けに、
            <strong className="text-[color:var(--color-fg)] font-semibold">差戻し → staging → 承認 → 昇格</strong>{' '}
            の flywheel を回す UI patterns を catalog 化した showcase。各 pattern は
            research-compounder の knowledge card + sample に bound されており、Figma MCP で
            design SSOT を canvas にも持つ。
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#patterns"
              className="inline-flex h-10 items-center gap-2 rounded-md bg-[color:var(--color-primary)] px-4 text-[13px] font-medium text-[color:var(--color-primary-fg)] hover:bg-[color:var(--color-primary-hover)] transition-colors"
            >
              Pattern を見る
              <ArrowRight />
            </a>
            <a
              href="#methodology"
              className="inline-flex h-10 items-center gap-2 rounded-md border border-[color:var(--color-border-strong)] bg-[color:var(--color-panel)] px-4 text-[13px] font-medium text-[color:var(--color-fg)] hover:bg-[color:var(--color-panel-inset)] transition-colors"
            >
              なぜこの形か
            </a>
          </div>
        </div>

        <dl className="mt-16 grid grid-cols-2 gap-x-12 gap-y-6 md:grid-cols-4 max-w-[760px]">
          <Stat label="Pattern" value={patterns.filter((p) => p.status === 'live').length.toString()} suffix="live" />
          <Stat label="Knowledge card" value="30+" suffix="bound" />
          <Stat label="Persona" value="1" suffix="operator" />
          <Stat label="Mode" value="JP / EN" suffix="bilingual" />
        </dl>
      </div>
    </section>
  )
}

function Stat({ label, value, suffix }: { label: string; value: string; suffix: string }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wider text-[color:var(--color-fg-subtle)] font-medium">
        {label}
      </dt>
      <dd className="mt-1 flex items-baseline gap-2">
        <span className="text-[28px] font-bold text-[color:var(--color-ink)] tabular">{value}</span>
        <span className="text-[12px] text-[color:var(--color-fg-muted)]">{suffix}</span>
      </dd>
    </div>
  )
}

function PatternGrid() {
  const categories = Array.from(new Set(patterns.map((p) => p.category)))
  return (
    <section id="patterns" className="mx-auto max-w-[var(--container-wide)] px-6 pt-20 pb-16 scroll-mt-16">
      <div className="flex items-end justify-between mb-10">
        <div>
          <h2 className="text-[28px] font-bold tracking-tight text-[color:var(--color-ink)]">
            6 Patterns
          </h2>
          <p className="mt-2 text-[14px] text-[color:var(--color-fg-muted)] max-w-[560px]">
            各 pattern は単独で読めるよう設計。category は問題領域、status は live / preview / planned。
          </p>
        </div>
        <div className="hidden md:flex items-center gap-4 text-[12px] text-[color:var(--color-fg-muted)]">
          {categories.map((c) => (
            <span key={c} className="inline-flex items-center gap-1.5">
              <span className={cn('h-2 w-2 rounded-full', categoryDotClass(c))} />
              {categoryLabels[c]}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {patterns.map((p) => (
          <Link
            key={p.id}
            to={p.status === 'planned' ? '#' : `/p/${p.id}`}
            className={cn(
              'group relative flex flex-col rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[color:var(--color-panel)] p-6 shadow-[var(--shadow-card)] transition-all',
              p.status === 'planned'
                ? 'opacity-60 cursor-not-allowed pointer-events-none'
                : 'hover:shadow-[var(--shadow-card-hover)] hover:border-[color:var(--color-border-strong)] hover:-translate-y-[1px]'
            )}
            aria-disabled={p.status === 'planned'}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[color:var(--color-fg-muted)]">
                <span className={cn('h-2 w-2 rounded-full', categoryDotClass(p.category))} />
                {categoryLabels[p.category]}
              </span>
              <StatusChip status={p.status} />
            </div>
            <h3 className="text-[17px] font-semibold tracking-tight text-[color:var(--color-ink)] mb-1">
              {p.title}
            </h3>
            <p className="text-[12px] text-[color:var(--color-fg-muted)] mb-3">{p.tagline}</p>
            <p className="text-[13px] leading-[1.6] text-[color:var(--color-fg)] flex-1">{p.problem}</p>
            <div className="mt-5 pt-4 border-t border-[color:var(--color-border)] flex items-center justify-between">
              <div className="flex flex-wrap gap-1">
                {p.primitives.slice(0, 3).map((prim) => (
                  <span
                    key={prim}
                    className="inline-block rounded-[var(--radius-chip)] bg-[color:var(--color-panel-inset)] px-1.5 py-0.5 text-[10px] font-mono text-[color:var(--color-fg-muted)]"
                  >
                    {prim}
                  </span>
                ))}
                {p.primitives.length > 3 && (
                  <span className="text-[10px] text-[color:var(--color-fg-subtle)] self-center">
                    +{p.primitives.length - 3}
                  </span>
                )}
              </div>
              <span className="text-[12px] font-medium text-[color:var(--color-primary)] inline-flex items-center gap-1 transition-transform group-hover:translate-x-0.5">
                開く <ArrowRight size={12} />
              </span>
            </div>
            <div className="mt-2.5 flex items-center justify-between text-[10px]">
              <FreshnessCardChip pattern={p} />
              <EvidenceDot evidence={p.evidence} />
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

function Methodology() {
  const steps = [
    {
      n: 1,
      title: 'Knowledge card 引き当て',
      body: 'research-compounder の knowledge/ui-design + ux-design から domain 該当 card を pull。Evidence Strength / Freshness を確認。',
    },
    {
      n: 2,
      title: 'Sample で composition lock',
      body: 'samples/ui-patterns/<id>.md の Layout + Components + States + UX flow を spec として固定。改変は audit notes 内の禁則条項に従う。',
    },
    {
      n: 3,
      title: 'Figma MCP で design SSOT 作成',
      body: 'use_figma で 00 Scope + 01 State Matrix + 02 Desktop + 03 Mobile + 04 Components page を seed。Variables / Code Connect を small-step write。',
    },
    {
      n: 4,
      title: 'Design-to-code + Ship Gate',
      body: 'get_metadata → get_design_context → React 実装。Component reuse / Token / Web-Mobile / State / a11y の 8 gate を mechanical check。',
    },
  ]
  return (
    <section id="methodology" className="border-t border-[color:var(--color-border)] bg-[color:var(--color-panel-inset)] scroll-mt-16">
      <div className="mx-auto max-w-[var(--container-wide)] px-6 py-20">
        <div className="max-w-[var(--container-narrow)] mb-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-[color:var(--color-accent-violet-soft)] px-3 py-1 text-[11px] font-medium text-[color:var(--color-primary)] mb-5">
            Methodology
          </div>
          <h2 className="text-[28px] font-bold tracking-tight text-[color:var(--color-ink)]">
            研究蓄積 → Figma → Code を 1 本に閉じる
          </h2>
          <p className="mt-4 text-[14px] leading-[1.7] text-[color:var(--color-fg-muted)]">
            毎回ゼロから観点を立てない。Knowledge card 30+ と sample 35+ を SSOT として、
            Figma MCP で canvas にも持ち、Ship Gate で mechanical check してから実装に出す。
          </p>
        </div>
        <ol className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((s) => (
            <li
              key={s.n}
              className="rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[color:var(--color-panel)] p-5"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[color:var(--color-ink)] text-[11px] font-bold text-[color:var(--color-panel)]">
                  {s.n}
                </span>
                <div className="h-px flex-1 bg-[color:var(--color-border)]" />
              </div>
              <h3 className="text-[14px] font-semibold tracking-tight text-[color:var(--color-ink)] mb-1.5">
                {s.title}
              </h3>
              <p className="text-[12px] leading-[1.6] text-[color:var(--color-fg-muted)]">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function StatusChip({ status }: { status: 'live' | 'preview' | 'planned' }) {
  const map = {
    live: {
      bg: 'bg-[color:var(--color-success-soft)]',
      fg: 'text-[color:var(--color-success-soft-fg)]',
      dot: 'bg-[color:var(--color-success)]',
      label: 'Live',
    },
    preview: {
      bg: 'bg-[color:var(--color-alert-soft)]',
      fg: 'text-[color:var(--color-alert-soft-fg)]',
      dot: 'bg-[color:var(--color-alert)]',
      label: 'Preview',
    },
    planned: {
      bg: 'bg-[color:var(--color-panel-inset)]',
      fg: 'text-[color:var(--color-fg-muted)]',
      dot: 'bg-[color:var(--color-fg-subtle)]',
      label: 'Planned',
    },
  }[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium',
        map.bg,
        map.fg
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', map.dot)} />
      {map.label}
    </span>
  )
}

function FreshnessCardChip({ pattern }: { pattern: Pattern }) {
  const fr = freshnessLabels[pattern.freshness]
  const map = {
    breaking: 'text-[color:var(--color-error-soft-fg)]',
    monthly: 'text-[color:var(--color-alert-soft-fg)]',
    quarterly: 'text-[color:var(--color-primary)]',
    stable: 'text-[color:var(--color-success-soft-fg)]',
  } as const
  return (
    <span className={`font-mono ${map[pattern.freshness]}`}>
      {fr.label} · {fr.period}
    </span>
  )
}

function EvidenceDot({ evidence }: { evidence: Pattern['evidence'] }) {
  const map = {
    'production-safe': { color: 'bg-[color:var(--color-success)]', label: 'production-safe' },
    directional: { color: 'bg-[color:var(--color-alert)]', label: 'directional' },
    unverified: { color: 'bg-[color:var(--color-error)]', label: 'unverified' },
  } as const
  return (
    <span className="inline-flex items-center gap-1 text-[color:var(--color-fg-subtle)]" title={`Evidence: ${map[evidence].label}`}>
      <span className={cn('h-1.5 w-1.5 rounded-full', map[evidence].color)} aria-hidden />
      {map[evidence].label}
    </span>
  )
}

function categoryDotClass(c: 'governance' | 'review' | 'evidence' | 'control' | 'overview') {
  switch (c) {
    case 'governance':
      return 'bg-[color:var(--color-primary)]'
    case 'review':
      return 'bg-[color:var(--color-success)]'
    case 'evidence':
      return 'bg-[color:var(--color-alert)]'
    case 'control':
      return 'bg-[color:var(--color-error)]'
    case 'overview':
      return 'bg-[color:var(--color-fg-muted)]'
  }
}

function ArrowRight({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path d="M3 7h8m0 0L7.5 3.5M11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
