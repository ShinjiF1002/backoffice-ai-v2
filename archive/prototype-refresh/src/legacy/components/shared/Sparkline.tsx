/**
 * Sparkline — compact 7-day trend visualization (60-80px wide)
 * SSOT: docs/03-ui-prototype-design.md §2.7.2 (Operational visual element)
 *
 * Pure SVG, no chart library dependency. Operational Premium Light spec:
 *  - hairline path with semantic color
 *  - tabular numeric stable
 */
export function Sparkline({
  data,
  width = 64,
  height = 18,
  className,
  color = 'var(--color-primary)',
}: {
  data: number[]
  width?: number
  height?: number
  className?: string
  color?: string
}) {
  if (data.length === 0) return null
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const stepX = data.length > 1 ? width / (data.length - 1) : 0

  const points = data
    .map((v, i) => {
      const x = i * stepX
      const y = height - ((v - min) / range) * height
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')

  const lastX = (data.length - 1) * stepX
  const lastY = height - ((data[data.length - 1] - min) / range) * height

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className={className} aria-hidden="true">
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lastX} cy={lastY} r="2" fill={color} />
    </svg>
  )
}
