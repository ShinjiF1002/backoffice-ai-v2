import type { ReactNode } from 'react'
import { AlertTriangleIcon } from 'lucide-react'
import type { Tone } from '@/components/shared/StatusBadge'
import type { CaseStatus } from '@/data/types'
import { caseStatusToTone, caseStatusLabel } from '@/lib/status-tones'
import { statusBadgeCls, STATUS_GLYPH } from './tokens'

/**
 * v2 shared primitives (components only = react-refresh 規律)。
 * 非 component helper (statusBadgeCls / STATUS_GLYPH) は ./tokens に分離。
 * 意味は色単独に載せず glyph+label+tone の 3 重符号 (grayscale 弁別)。
 */

export function StatusChip({ status }: { status: CaseStatus }) {
  const t = caseStatusToTone(status)
  const G = STATUS_GLYPH[t]
  return (
    <span className={`inline-flex items-center gap-1 rounded-[var(--v2-radius-chip)] border px-2 py-0.5 text-[12px] font-medium ${statusBadgeCls(t)}`}>
      <G className="h-3 w-3" aria-hidden="true" />
      {caseStatusLabel(status)}
    </span>
  )
}

/** 任意 tone+label の chip (proposal status / trust level 等、3 重符号)。 */
export function ToneChip({ tone, label }: { tone: Tone; label: string }) {
  const G = STATUS_GLYPH[tone]
  return (
    <span className={`inline-flex items-center gap-1 rounded-[var(--v2-radius-chip)] border px-2 py-0.5 text-[12px] font-medium ${statusBadgeCls(tone)}`}>
      <G className="h-3 w-3" aria-hidden="true" />
      {label}
    </span>
  )
}

/** 件数 badge (要確認 N 等)。tone で意味付け、glyph 併用。 */
export function CountChip({ n, tone = 'alert', label }: { n: number; tone?: Tone; label?: string }) {
  if (n === 0) {
    return <span className="text-[12px] text-[var(--v2-fg-subtle)]">—</span>
  }
  return (
    <span className={`v2-tnum inline-flex items-center gap-1 rounded-[var(--v2-radius-chip)] border px-1.5 py-0.5 text-[11px] font-medium ${statusBadgeCls(tone)}`}>
      <AlertTriangleIcon className="h-3 w-3" aria-hidden="true" />
      {label ? `${label} ` : ''}
      {n}
    </span>
  )
}

export function PageHeader({ title, sub, actions }: { title: string; sub?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[var(--v2-border)] bg-[var(--v2-panel)] px-6 py-4">
      <div>
        <h1 className="text-[18px] font-semibold text-[var(--v2-fg)]">{title}</h1>
        {sub && <div className="mt-0.5 text-[13px] text-[var(--v2-fg-muted)]">{sub}</div>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}

/** filter chip (segmented、count 付き)。視覚 filter。 */
export function FilterChip({ label, count, active, onClick }: { label: string; count?: number; active?: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        'inline-flex items-center gap-1.5 rounded-[var(--v2-radius-control)] border px-2.5 py-1 text-[13px] transition-colors ' +
        (active
          ? 'border-[var(--v2-accent-soft-border)] bg-[var(--v2-accent-soft)] font-medium text-[var(--v2-accent-soft-fg)]'
          : 'border-[var(--v2-border)] bg-[var(--v2-panel)] text-[var(--v2-fg-muted)] hover:border-[var(--v2-border-strong)] hover:text-[var(--v2-fg)]')
      }
    >
      {label}
      {count !== undefined && <span className="v2-tnum text-[var(--v2-fg-tertiary)]">{count}</span>}
    </button>
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-[var(--v2-radius-card)] border border-[var(--v2-border)] bg-[var(--v2-panel)] shadow-[var(--v2-shadow-sm)] ${className}`}>
      {children}
    </div>
  )
}
