import { getCatalogStats, freshnessLabels, categoryLabels, patterns } from '@/data/patterns'
import type { Freshness, Pattern } from '@/data/patterns'
import { cn } from '@/lib/cn'

/**
 * 蓄積ステータス board — Landing に置く research-compounder の状態 snapshot。
 * card count / sample count / freshness 分布 / category 分布 / production-safe ratio。
 */
export function CatalogStatusBoard() {
  const s = getCatalogStats()
  return (
    <section className="border-t border-[color:var(--color-border)] bg-[color:var(--color-panel)]">
      <div className="mx-auto max-w-[var(--container-wide)] px-6 py-16">
        <header className="max-w-[var(--container-narrow)] mb-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-[color:var(--color-success-soft)] px-3 py-1 text-[11px] font-medium text-[color:var(--color-success-soft-fg)] mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--color-success)] animate-pulse" />
            蓄積ステータス
          </div>
          <h2 className="text-[28px] font-bold tracking-tight text-[color:var(--color-ink)]">
            研究蓄積の現状 snapshot
          </h2>
          <p className="mt-3 text-[14px] leading-[1.7] text-[color:var(--color-fg-muted)]">
            各 pattern は <strong className="text-[color:var(--color-fg)] font-semibold">research-compounder の knowledge card</strong> に bound されており、
            evidence strength と freshness で再検証 trigger が定義されている。下記は本 catalog の状態。
          </p>
        </header>

        {/* 4 metric tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <MetricTile
            icon="●"
            label="Live patterns"
            value={s.live}
            total={s.total}
            tone="primary"
            sub={`${Math.round((s.live / s.total) * 100)}% complete`}
          />
          <MetricTile
            icon="✓"
            label="Production-safe"
            value={s.productionSafe}
            total={s.total}
            tone="success"
            sub="primary source verified"
          />
          <MetricTile
            icon="◇"
            label="Knowledge cards"
            value={s.cardsBound}
            total={s.total}
            tone="muted"
            sub="research-compounder bound"
          />
          <MetricTile
            icon="◈"
            label="Retrieval tags"
            value={s.allTags}
            tone="muted"
            sub="unique index keys"
          />
        </div>

        {/* Freshness distribution + Category distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <FreshnessDistribution dist={s.freshnessDist} />
          <CategoryDistribution dist={s.categoryDist} />
        </div>

        {/* Refresh radar */}
        <RefreshRadar />
      </div>
    </section>
  )
}

function MetricTile({
  icon, label, value, total, tone, sub,
}: { icon: string; label: string; value: number; total?: number; tone: 'primary' | 'success' | 'muted'; sub: string }) {
  const toneClass = {
    primary: 'text-[color:var(--color-primary)]',
    success: 'text-[color:var(--color-success-soft-fg)]',
    muted: 'text-[color:var(--color-fg-muted)]',
  }[tone]
  return (
    <div className="rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[color:var(--color-panel)] p-4 shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-medium text-[color:var(--color-fg-subtle)]">
        <span className={toneClass} aria-hidden>{icon}</span>
        {label}
      </div>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="text-[32px] font-bold tabular text-[color:var(--color-ink)]">{value}</span>
        {total !== undefined && (
          <span className="text-[13px] text-[color:var(--color-fg-muted)] tabular">/ {total}</span>
        )}
      </div>
      <p className="mt-1 text-[11px] text-[color:var(--color-fg-muted)]">{sub}</p>
    </div>
  )
}

function FreshnessDistribution({ dist }: { dist: Record<Freshness, number> }) {
  const order: Freshness[] = ['breaking', 'monthly', 'quarterly', 'stable']
  const total = Object.values(dist).reduce((a, b) => a + b, 0)
  const color: Record<Freshness, string> = {
    breaking: 'bg-[color:var(--color-error)]',
    monthly: 'bg-[color:var(--color-alert)]',
    quarterly: 'bg-[color:var(--color-primary)]',
    stable: 'bg-[color:var(--color-success)]',
  }

  return (
    <div className="rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[color:var(--color-panel)] p-5">
      <h3 className="text-[12px] uppercase tracking-wider font-bold text-[color:var(--color-ink)] mb-3">
        Freshness 分布 — 再検証期限の分散
      </h3>

      {/* Stacked bar */}
      <div className="mb-4 flex h-3 w-full overflow-hidden rounded-full bg-[color:var(--color-panel-inset)]">
        {order.map((f) => {
          const w = total === 0 ? 0 : (dist[f] / total) * 100
          if (w === 0) return null
          return (
            <div
              key={f}
              className={cn('h-full', color[f])}
              style={{ width: `${w}%` }}
              title={`${f}: ${dist[f]}`}
            />
          )
        })}
      </div>

      {/* Legend */}
      <ul className="space-y-1.5">
        {order.map((f) => (
          <li key={f} className="flex items-center gap-2 text-[12px]">
            <span className={cn('h-2 w-2 rounded-full flex-none', color[f])} />
            <span className="font-medium text-[color:var(--color-fg)] w-20">{f}</span>
            <span className="text-[color:var(--color-fg-muted)] text-[11px]">
              ({freshnessLabels[f].period})
            </span>
            <span className="ml-auto font-mono tabular text-[color:var(--color-fg)] font-semibold">
              {dist[f]}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function CategoryDistribution({ dist }: { dist: Record<string, number> }) {
  const color: Record<string, string> = {
    governance: 'bg-[color:var(--color-primary)]',
    review: 'bg-[color:var(--color-success)]',
    evidence: 'bg-[color:var(--color-alert)]',
    control: 'bg-[color:var(--color-error)]',
    overview: 'bg-[color:var(--color-fg-muted)]',
  }
  const entries = Object.entries(dist).sort((a, b) => b[1] - a[1])

  return (
    <div className="rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[color:var(--color-panel)] p-5">
      <h3 className="text-[12px] uppercase tracking-wider font-bold text-[color:var(--color-ink)] mb-3">
        Category 分布 — 問題領域の偏り
      </h3>
      <ul className="space-y-2.5">
        {entries.map(([cat, count]) => {
          const max = Math.max(...Object.values(dist))
          const w = max === 0 ? 0 : (count / max) * 100
          return (
            <li key={cat} className="flex items-center gap-3">
              <span className="w-24 text-[12px] font-medium text-[color:var(--color-fg)]">
                {categoryLabels[cat as keyof typeof categoryLabels] ?? cat}
              </span>
              <div className="flex-1 h-2.5 rounded-full bg-[color:var(--color-panel-inset)] overflow-hidden">
                <div
                  className={cn('h-full rounded-full', color[cat] ?? 'bg-[color:var(--color-fg-subtle)]')}
                  style={{ width: `${w}%` }}
                />
              </div>
              <span className="font-mono tabular text-[12px] text-[color:var(--color-fg)] font-semibold w-6 text-right">
                {count}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function RefreshRadar() {
  // 再検証 trigger を pattern 毎に拾い、freshness order でソート
  const sorted = [...patterns].sort(
    (a, b) => freshnessOrder(a.freshness) - freshnessOrder(b.freshness)
  )
  return (
    <details className="mt-5 group rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[color:var(--color-panel)]">
      <summary className="flex items-center justify-between cursor-pointer px-5 py-3 list-none">
        <div className="flex items-center gap-2">
          <span className="text-[12px] uppercase tracking-wider font-bold text-[color:var(--color-ink)]">
            Refresh Radar
          </span>
          <span className="text-[11px] text-[color:var(--color-fg-muted)]">
            各 pattern の再検証 trigger を一覧
          </span>
        </div>
        <ChevronIcon />
      </summary>
      <ul className="border-t border-[color:var(--color-border)] divide-y divide-[color:var(--color-border)]">
        {sorted.map((p) => (
          <li key={p.id} className="px-5 py-3 grid grid-cols-[120px_120px_1fr] gap-3 items-start">
            <a
              href={`/p/${p.id}`}
              className="text-[12px] font-medium text-[color:var(--color-primary)] hover:underline truncate"
            >
              {p.title}
            </a>
            <FreshnessChip f={p.freshness} />
            <span className="text-[11px] text-[color:var(--color-fg-muted)] leading-[1.55]">
              {p.refreshTrigger}
            </span>
          </li>
        ))}
      </ul>
    </details>
  )
}

function FreshnessChip({ f }: { f: Pattern['freshness'] }) {
  const map: Record<Pattern['freshness'], string> = {
    breaking: 'bg-[color:var(--color-error-soft)] text-[color:var(--color-error-soft-fg)]',
    monthly: 'bg-[color:var(--color-alert-soft)] text-[color:var(--color-alert-soft-fg)]',
    quarterly: 'bg-[color:var(--color-primary-soft)] text-[color:var(--color-primary)]',
    stable: 'bg-[color:var(--color-success-soft)] text-[color:var(--color-success-soft-fg)]',
  }
  return (
    <span className={cn('inline-flex w-fit items-center rounded px-1.5 py-0.5 text-[10px] font-mono font-medium', map[f])}>
      {f} · {freshnessLabels[f].period}
    </span>
  )
}

function freshnessOrder(f: Pattern['freshness']) {
  return { breaking: 1, monthly: 2, quarterly: 3, stable: 4 }[f]
}

function ChevronIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="transition-transform group-open:rotate-180" aria-hidden>
      <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
