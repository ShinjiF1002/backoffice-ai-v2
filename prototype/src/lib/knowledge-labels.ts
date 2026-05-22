import type { SendBackCategory, Weight } from '@/data/types'

export interface KnowledgeWeightStyle {
  /** JP full label (filter chip / badge / detail panel chip 用、§9.2 SSOT) */
  label: string
  /** JP short label (PageHeader counter / framing banner 3 状態並列 用、CR R50 M2) */
  shortLabel: string
  /** dot 色 (§9.2 SSOT) */
  dotClass: string
  /** badge tint (snippet card 用) */
  badgeClass: string
  /** detail panel chip 用 */
  chipClass: string
}

export const KNOWLEDGE_WEIGHT_STYLE: Record<Weight, KnowledgeWeightStyle> = {
  high: {
    label: '承認済',
    shortLabel: '承認済',
    dotClass: 'bg-emerald-600',
    badgeClass: 'bg-emerald-50 text-emerald-700',
    chipClass: 'bg-emerald-100 text-emerald-800',
  },
  medium: {
    label: '確認済 (未承認)',
    shortLabel: '確認済',
    dotClass: 'bg-amber-500',
    badgeClass: 'bg-amber-50 text-amber-700',
    chipClass: 'bg-amber-100 text-amber-800',
  },
  low: {
    label: '未承認',
    shortLabel: '未承認',
    dotClass: 'bg-slate-400',
    badgeClass: 'bg-slate-100 text-slate-700',
    chipClass: 'bg-slate-200 text-slate-700',
  },
}

export const KNOWLEDGE_CATEGORY_DISABLED: Record<SendBackCategory, boolean> = {
  misunderstanding: false,
  ui_change: false,
  edge_case: false,
  judgment_gap: false,
  data_error: true,
}

export function formatKnowledgeSourceLabel(weight: Weight, date: string): string {
  if (weight === 'high') return `承認済ナレッジ · ${date}`
  if (weight === 'medium') return `確認済 (未承認) ナレッジ · ${date}`
  return `未承認ナレッジ · ${date}`
}
