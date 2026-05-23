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

  return (
    <div className="rounded-md border border-amber-200 bg-[var(--color-alert-soft)] p-3">
      <div className="flex items-start gap-2">
        <AlertCircle className="h-4 w-4 shrink-0 text-[var(--color-alert)]" aria-hidden="true" />
        <div className="flex-1">
          <h3 className="text-xs font-semibold text-[var(--color-alert-soft-fg)]">関連手順が更新されています</h3>
          <p className="mt-0.5 text-[11px] leading-relaxed text-[var(--color-alert-soft-fg)]">
            本案件作成後に新ルールが承認されました。AI 提案本文は当時のまま保持されています (監査証跡 参照)。
          </p>
          <ul className="mt-2 space-y-1">
            {updates.map((u) => (
              <li key={u.ruleId} className="rounded border border-amber-200 bg-white px-2 py-1.5 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-900">{u.ruleName}</span>
                  <span className="font-mono text-[10px] text-slate-500">{u.approvedAt}</span>
                </div>
                <div className="mt-0.5 flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] text-slate-400">{u.ruleId}</span>
                  {u.proposalId && (
                    <Link
                      to={`/proposals/${u.proposalId}`}
                      className="text-[11px] font-medium text-[var(--color-primary)] hover:underline"
                    >
                      更新内容を見る
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
