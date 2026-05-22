import type { SendBackCategory } from '@/data/types'

export interface SendBackCategoryOption {
  value: SendBackCategory
  label: string
  description: string
}

export const SENDBACK_CATEGORIES = [
  {
    value: 'misunderstanding',
    label: '誤読',
    description: 'AI が文書の意図を誤って解釈した (例: 旧住所 → 新住所 の方向誤認、確認項目の取り違え)',
  },
  {
    value: 'ui_change',
    label: 'UI 差異',
    description: '業務システム側の UI が変更されている (旧フォーマット表示、項目位置変更、新規項目の追加)',
  },
  {
    value: 'edge_case',
    label: '境界条件',
    description: '想定外パターン (新形式、未登録、海外住所、複数事業所、特殊法人 等)',
  },
  {
    value: 'judgment_gap',
    label: '判断境界',
    description: 'AI 判断ルールが不足している (新パターンに既存ルール非適用、信頼度閾値外)',
  },
  {
    value: 'data_error',
    label: '入力誤り',
    description: '入力データそのものが誤っている (印字ミス、記入漏れ、不鮮明スキャン 等)',
  },
] as const satisfies readonly SendBackCategoryOption[]

export const SENDBACK_CATEGORY_LABELS = Object.fromEntries(
  SENDBACK_CATEGORIES.map(({ value, label }) => [value, label])
) as Record<SendBackCategory, string>

export function getSendbackCategoryLabel(category: SendBackCategory): string {
  return SENDBACK_CATEGORY_LABELS[category]
}
