import { Circle, CircleDot } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { TrustLevel } from '@/data/types'

/**
 * TrustLevelBadge — Trust Level Progression 視覚化 (shared component)
 *
 * SSOT:
 *  - docs/03-ui-prototype-design.md §4.6 #9 (AgentSettings 実装メモ)
 *  - workflows/_index.md §2 (Trust Level Progression: Supervised → Checkpoint → Autonomous)
 *  - docs/02-approval-model.md §7 (Matrix B: AIに任せる量は段階的に増やすが、人によるコントロールは渡さない)
 *
 * Variant:
 *  - compact: PageHeader meta chip (small inline display)
 *  - progression: Hero 3-stage horizontal stepper (現在地 + 候補 visualization)
 *
 * 規範:
 *  - Operational Premium Light tokens (indigo primary / amber alert / emerald success)
 *  - restricted boundary pack (国際送金) は trust_level: 'n/a' で Progression 対象外
 *  - 案件確認の介在頻度のみ縮小、手順承認 / 設定承認 loop は同強度で残る (Matrix B)
 */

interface TrustLevelBadgeProps {
  current: TrustLevel
  /** compact = PageHeader meta、progression = Hero 3-stage stepper */
  variant?: 'compact' | 'progression'
}

interface TrustLevelEntry {
  value: Exclude<TrustLevel, 'n/a'>
  label: string
  caption: string
}

const TRUST_LEVELS: ReadonlyArray<TrustLevelEntry> = [
  { value: 'supervised', label: 'Supervised', caption: '全件確認 (入力者 + 承認者)' },
  { value: 'checkpoint', label: 'Checkpoint', caption: '重要分岐のみ確認' },
  { value: 'autonomous', label: 'Autonomous', caption: 'サンプリング確認 (将来)' },
] as const

function getStageState(current: TrustLevel, stage: TrustLevelEntry['value']): 'current' | 'candidate' | 'past' | 'na' {
  if (current === 'n/a') return 'na'
  const order: ReadonlyArray<TrustLevelEntry['value']> = ['supervised', 'checkpoint', 'autonomous']
  const currentIdx = order.indexOf(current as TrustLevelEntry['value'])
  const stageIdx = order.indexOf(stage)
  if (currentIdx === stageIdx) return 'current'
  if (stageIdx > currentIdx) return 'candidate'
  return 'past'
}

export function TrustLevelBadge({ current, variant = 'compact' }: TrustLevelBadgeProps) {
  if (variant === 'compact') {
    const entry = TRUST_LEVELS.find((l) => l.value === current)
    const label = entry?.label ?? 'n/a'
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 rounded px-2 py-0.5 font-mono text-[11px] font-medium tabular',
          current === 'supervised' && 'bg-[var(--color-primary-soft)] text-[var(--color-primary)]',
          current === 'checkpoint' && 'bg-amber-50 text-amber-700',
          current === 'autonomous' && 'bg-emerald-50 text-emerald-700',
          current === 'n/a' && 'bg-slate-100 text-slate-500'
        )}
      >
        <CircleDot className="h-2.5 w-2.5" aria-hidden="true" />
        Trust Level: {label}
      </span>
    )
  }

  // Progression variant: 3-stage horizontal stepper
  return (
    <ol
      className="flex flex-col gap-2 lg:flex-row lg:items-stretch lg:gap-3"
      aria-label="Trust Level Progression"
    >
      {TRUST_LEVELS.map((level, idx) => {
        const state = getStageState(current, level.value)
        const isCurrent = state === 'current'
        const isCandidate = state === 'candidate'
        return (
          <li key={level.value} className="flex flex-1 items-stretch">
            <div
              className={cn(
                'flex flex-1 flex-col rounded-md px-4 py-3 transition-colors',
                isCurrent && 'border-2 border-[var(--color-primary)] bg-[var(--color-primary-soft)]',
                isCandidate && 'border border-dashed border-slate-300 bg-white',
                state === 'past' && 'border border-slate-200 bg-slate-50'
              )}
            >
              <div className="flex items-center gap-2">
                {isCurrent ? (
                  <CircleDot
                    className="h-4 w-4 shrink-0 text-[var(--color-primary)]"
                    aria-hidden="true"
                  />
                ) : (
                  <Circle className="h-4 w-4 shrink-0 text-slate-300" aria-hidden="true" />
                )}
                <span
                  className={cn(
                    'font-mono text-[10px] font-medium uppercase tracking-wide tabular',
                    isCurrent ? 'text-[var(--color-primary)]' : 'text-slate-400'
                  )}
                >
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <span
                  className={cn(
                    'text-sm font-semibold',
                    isCurrent ? 'text-slate-900' : 'text-slate-500'
                  )}
                >
                  {level.label}
                </span>
                {isCurrent && (
                  <span className="ml-auto inline-flex items-center rounded bg-white px-1.5 py-0.5 font-mono text-[10px] font-medium text-[var(--color-primary)] tabular">
                    現在地
                  </span>
                )}
                {isCandidate && (
                  <span className="ml-auto inline-flex items-center rounded bg-slate-50 px-1.5 py-0.5 font-mono text-[10px] font-medium text-slate-500 tabular">
                    候補
                  </span>
                )}
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-slate-600">{level.caption}</p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
