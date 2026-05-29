import type { SendBackCategory } from '@/data/types'

/**
 * sendback-categories.ts — 5 分類 enum + JP label + description
 *
 * SSOT: docs/04-knowledge-pipeline.md §4.5 5-category routing
 *
 * Day 19 Commit 4 U-14:
 *  - description は L1 短縮版 (≤30字、常時表示でも認知負荷低)
 *  - 例 / edge case 詳細は detail field (L4 expand 用、SendBackComment で Disclosure wrap)
 *  - Commit 5 mock trim と整合 (data 側 trim、UI 側 Disclosure demote)
 */

export interface SendBackCategoryOption {
  value: SendBackCategory
  label: string
  /** L1 短縮版 (≤30字、SendBackComment radio 説明文として常時表示) */
  description: string
  /** L4 詳細 (例 / edge case enumeration、Disclosure expand 内表示) */
  detail: string
}

export const SENDBACK_CATEGORIES = [
  {
    value: 'misunderstanding',
    label: '誤読',
    description: 'AI が文書の意図を誤って解釈した',
    detail: '例: 旧住所 → 新住所 の方向誤認、確認項目の取り違え',
  },
  {
    value: 'ui_change',
    label: 'UI 差異',
    description: '業務システム UI が変更されている',
    detail: '旧フォーマット表示、項目位置変更、新規項目の追加',
  },
  {
    value: 'edge_case',
    label: '境界条件',
    description: '想定外パターン',
    detail: '新形式、未登録、海外住所、複数事業所、特殊法人 等',
  },
  {
    value: 'judgment_gap',
    label: '判断境界',
    description: 'AI 判断ルールが不足している',
    detail: '新パターンに既存ルール非適用、信頼度閾値外',
  },
  {
    value: 'data_error',
    label: '入力誤り',
    description: '入力データそのものが誤っている',
    detail: '印字ミス、記入漏れ、不鮮明スキャン 等',
  },
] as const satisfies readonly SendBackCategoryOption[]

export const SENDBACK_CATEGORY_LABELS = Object.fromEntries(
  SENDBACK_CATEGORIES.map(({ value, label }) => [value, label])
) as Record<SendBackCategory, string>

export function getSendbackCategoryLabel(category: SendBackCategory): string {
  return SENDBACK_CATEGORY_LABELS[category]
}
