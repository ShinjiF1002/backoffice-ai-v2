import { AlertCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { RelatedRuleUpdate } from '@/data/types'

/**
 * RelatedRuleAlert — 過去案件 関連ルール更新 Alert
 * SSOT: docs/03-ui-prototype-design.md §6 Alert UI 適用範囲 1 + DOC-FW-01 §6.3
 *
 * 視覚分離: citation + staging hint とは別 amber banner (Image 3 governance borrow)
 * 文言: "関連手順が更新されています — 本案件作成後に新ルールが承認されました (監査証跡 参照)"
 *
 * Day 14 medium-fi (Plan B-lite v2.3 P1 Spec gap 2 + 3):
 *  - icon Bell → AlertCircle (docs/03 §6.1 spec 整合)
 *  - JSDoc + JSX 本文 file-wide で「本案件」「監査証跡」 JP paraphrase (内部英語表現を撤去)
 *  - optional link: u.proposalId 有る update のみ「更新内容を見る」link to /proposals/:id
 */
export function RelatedRuleAlert({ updates }: { updates: RelatedRuleUpdate[] }) {
  if (updates.length === 0) return null

  const firstWithProposal = updates.find((u) => u.proposalId)

  return (
    <div className="border-l-2 border-amber-400 bg-[var(--color-alert-soft)] px-3 py-2">
      <div className="flex items-center gap-2">
        <AlertCircle className="h-3.5 w-3.5 shrink-0 text-[var(--color-alert)]" aria-hidden="true" />
        <span className="text-[11px] text-[var(--color-alert-soft-fg)]">
          <span className="font-medium">関連手順が更新されています</span>
          {' — '}
          {updates.length} 件の手順更新 — 最新: {updates[0].ruleName}
        </span>
        {firstWithProposal && (
          <Link
            to={`/proposals/${firstWithProposal.proposalId}`}
            className="ml-auto shrink-0 text-[11px] font-medium text-[var(--color-primary)] hover:underline"
          >
            更新内容を見る
          </Link>
        )}
      </div>
    </div>
  )
}
