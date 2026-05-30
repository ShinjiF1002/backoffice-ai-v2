import { cn } from '@/lib/cn'

/**
 * MetricVsThreshold — 実績値 vs 閾値 vs 判定 (集約値を捨てる、原則 A 全件表示)
 * SSOT: handoff-redesign/00-shared/metric-vs-threshold-spec.md
 * reference: screens-v2/06-proposal-detail + 08-agent-detail (title / subtitle / rows)。
 * 適用: AgentDetail (4 KPI 全件) / ProposalDetail (判定基準)。未達は alert tone、全数 [仮説/要検証]。
 *
 * spec schema 反映: row = exclusions (除外条件、指標ごと) / 表全体 = owner (対象) + hypothesisLabel (仮説ラベル)。
 * spec layout に従い owner/hypothesisLabel は per-row でなく表 header に置く (同一ラベルの行反復を避ける)。
 */
export interface MetricRow {
  metricLabel: string
  actualValue: string
  threshold: string
  /** 達成 / 未達 (+ 差分) */
  judgment: string
  achieved: boolean
  period: string
  denominator: string
  previousDelta?: string
  /** 除外条件 (spec)。例: エスカレーション案件を除く */
  exclusions?: string
}

export interface MetricVsThresholdProps {
  rows: MetricRow[]
  title?: string
  /** 表の補足説明 (reference: subtitle) */
  subtitle?: string
  /** 対象 (spec、表全体)。例: 法人住所変更 Agent */
  owner?: string
  /** 仮説ラベル (spec、表全体)。default で実値でない参考値である旨を明示。 */
  hypothesisLabel?: string
}

export function MetricVsThreshold({
  rows,
  title = '実績 vs 閾値',
  subtitle,
  owner,
  hypothesisLabel = '［仮説 / 要検証］参考値',
}: MetricVsThresholdProps) {
  return (
    <section className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-panel)]">
      <div className="flex items-start justify-between gap-3 border-b border-[var(--color-border)] px-4 py-2.5">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-[var(--color-fg)]">{title}</h3>
          {subtitle && <p className="mt-0.5 text-[11px] leading-snug text-[var(--color-fg-muted)]">{subtitle}</p>}
          {owner && <p className="mt-0.5 text-[11px] text-[var(--color-fg-tertiary)]">対象: {owner}</p>}
        </div>
        <span className="flex-shrink-0 text-[10px] text-[var(--color-fg-tertiary)]">{hypothesisLabel}</span>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--color-border)] text-left text-[11px] text-[var(--color-fg-muted)]">
            <th className="px-4 py-1.5 font-medium">指標</th>
            <th className="px-4 py-1.5 font-medium">実績</th>
            <th className="px-4 py-1.5 font-medium">閾値</th>
            <th className="px-4 py-1.5 font-medium">判定</th>
            <th className="px-4 py-1.5 font-medium">期間 / 分母</th>
            <th className="px-4 py-1.5 font-medium">前回差</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.metricLabel}
              className={cn('border-b border-[var(--color-border)] last:border-b-0', !r.achieved && 'bg-[var(--color-alert-soft)]')}
            >
              <td className="px-4 py-2 text-[var(--color-fg)]">{r.metricLabel}</td>
              <td className="px-4 py-2 font-mono text-[var(--color-fg)]">{r.actualValue}</td>
              <td className="px-4 py-2 font-mono text-[var(--color-fg-muted)]">{r.threshold}</td>
              <td className={cn('px-4 py-2 font-medium', r.achieved ? 'text-[var(--color-success-soft-fg)]' : 'text-[var(--color-alert-soft-fg)]')}>
                {r.judgment}
              </td>
              <td className="px-4 py-2 text-[11px] text-[var(--color-fg-muted)]">
                {r.period} / {r.denominator}
                {r.exclusions && <span className="mt-0.5 block text-[var(--color-fg-tertiary)]">除外: {r.exclusions}</span>}
              </td>
              <td className="px-4 py-2 text-[11px] text-[var(--color-fg-muted)]">{r.previousDelta ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
