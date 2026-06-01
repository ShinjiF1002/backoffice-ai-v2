/**
 * MiniTrend — CSS bar による超小型トレンド表示 (SVG 要素を使わない)
 * 継承 Sparkline は SVG ベースで Phase 2B gate (inline SVG 0) に抵触するため、
 * B 型一覧の直近推移は本 CSS 実装で代替 (canonical-design-spec §5 / 一貫性 gate)。
 * 全色は token。values は 0-100。
 */
export function MiniTrend({ values, tone = 'primary' }: { values: number[]; tone?: 'primary' | 'success' }) {
  const max = Math.max(...values, 1)
  const min = Math.min(...values, 0)
  const range = Math.max(max - min, 1)
  const barColor = tone === 'success' ? 'var(--color-success)' : 'var(--color-primary)'
  return (
    <div className="flex h-6 items-end gap-0.5" aria-hidden="true">
      {values.map((v, i) => {
        const h = 20 + ((v - min) / range) * 80 // 20%-100% の高さ
        return (
          <span
            key={i}
            className="w-1 rounded-sm"
            style={{ height: `${h}%`, background: barColor, opacity: 0.4 + (i / values.length) * 0.6 }}
          />
        )
      })}
    </div>
  )
}
