import { Bell } from 'lucide-react'
import type { RelatedRuleUpdate } from '@/data/types'

/**
 * RelatedRuleAlert — 過去 case 関連ルール更新 Alert
 * SSOT: docs/03-ui-prototype-design.md §6 Alert UI 適用範囲 1 + DOC-FW-01 §6.3
 *
 * 視覚分離: citation + staging hint とは別 amber banner (Image 3 governance borrow)
 * 文言: "関連手順が更新されています — 本 case 作成後に新ルールが承認されました (audit trail 参照)"
 */
export function RelatedRuleAlert({ updates }: { updates: RelatedRuleUpdate[] }) {
  if (updates.length === 0) return null

  return (
    <div className="rounded-md border border-amber-200 bg-[var(--color-alert-soft)] p-3">
      <div className="flex items-start gap-2">
        <Bell className="h-4 w-4 shrink-0 text-[var(--color-alert)]" aria-hidden="true" />
        <div className="flex-1">
          <h3 className="text-xs font-semibold text-amber-900">関連手順が更新されています</h3>
          <p className="mt-0.5 text-[11px] leading-relaxed text-amber-800">
            本 case 作成後に新ルールが承認されました。AI 提案本文は当時のまま保持されています (audit trail 参照)。
          </p>
          <ul className="mt-2 space-y-1">
            {updates.map((u) => (
              <li key={u.ruleId} className="rounded border border-amber-200 bg-white px-2 py-1.5 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-900">{u.ruleName}</span>
                  <span className="font-mono text-[10px] text-slate-500">{u.approvedAt}</span>
                </div>
                <span className="font-mono text-[10px] text-slate-400">{u.ruleId}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
