import { ExternalLink, UserCheck } from 'lucide-react'
import { cn } from '@/lib/cn'

/**
 * BusinessApprovalChip — 業務承認 status chip (CaseReview footer action bar)
 * SSOT: docs/03-ui-prototype-design.md §2.7.4 + §7
 *
 * UI 表示文言は "業務承認: {status}"。component 名 (`BusinessApprovalChip`) は internal のみ。
 * click action: demo/static-mocks/business-approval-view.html を別 tab で開く (Day 20 実体化)
 */

interface Props {
  status: '未送付' | '承認待ち' | '承認済' | '差戻し'
}

export function BusinessApprovalChip({ status }: Props) {
  const semantic =
    status === '承認済'
      ? 'border-emerald-200 bg-[var(--color-success-soft)] text-[var(--color-success)]'
      : status === '差戻し'
        ? 'border-red-200 bg-[var(--color-error-soft)] text-[var(--color-error)]'
        : status === '承認待ち'
          ? 'border-amber-200 bg-[var(--color-alert-soft)] text-amber-900'
          : 'border-slate-200 bg-slate-50 text-slate-600'

  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors hover:opacity-90',
        semantic
      )}
      title="業務責任者承認画面を別タブで開く (mock)"
      onClick={() => {
        // Day 20: window.open(demo/static-mocks/business-approval-view.html, '_blank')
        // For Day 11, just log
        console.log('[mock] BusinessApproval mock would open in new tab')
      }}
    >
      <UserCheck className="h-3.5 w-3.5" />
      <span>業務承認: {status}</span>
      <ExternalLink className="h-3 w-3 text-current opacity-60" />
    </button>
  )
}
