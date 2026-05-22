import { ExternalLink, UserCheck } from 'lucide-react'
import { cn } from '@/lib/cn'

/**
 * BusinessApprovalChip — 業務承認 status chip (CaseReview footer action bar)
 * SSOT: docs/03-ui-prototype-design.md §2.7.4 + §7
 *
 * UI 表示文言は "業務承認: {status}"。component 名 (`BusinessApprovalChip`) は internal のみ。
 *
 * Day 14 medium-fi (Plan B-lite v2.3 P1 Spec gap 1):
 *  - 旧 enabled no-op (logging のみ) を完全削除 (no-op 0 規範、`docs/03` §7 sync 済)
 *  - disabled wrapper title pattern (CR R32+R38 paradigm)、外側 <span title> + 内側 button disabled
 *  - user-facing 文言 (title + aria-label) は静的 mock 内部用語を排除し JP-only に統一
 * Day 20 (将来) では再度 enabled + window.open('demo/static-mocks/business-approval-view.html', '_blank') に戻す。
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
    <span title="業務承認画面 (Day 20 で実装予定の静的画面) は実装後に別タブで開きます">
      <button
        type="button"
        disabled
        aria-disabled="true"
        aria-label="業務承認画面を別タブで開く (Day 20 で実装予定)"
        className={cn(
          'inline-flex cursor-not-allowed items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium opacity-60',
          semantic
        )}
      >
        <UserCheck className="h-3.5 w-3.5" />
        <span>業務承認: {status}</span>
        <ExternalLink className="h-3 w-3 text-current opacity-60" />
      </button>
    </span>
  )
}
