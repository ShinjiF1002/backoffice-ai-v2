import { ExternalLink, UserCheck } from 'lucide-react'
import { cn } from '@/lib/cn'

/**
 * BusinessApprovalChip — 承認者承認 status chip (CaseReview footer action bar)
 * SSOT: docs/03-ui-prototype-design.md §2.7.4 + §7、Day 20 で再 enabled
 *
 * UI 表示文言は "承認者承認: {status}"。component 名 (`BusinessApprovalChip`) は internal のみ。
 *
 * Day 14 medium-fi (Plan B-lite v2.3 P1 Spec gap 1):
 *  - 旧 enabled no-op (logging のみ) を完全削除 (no-op 0 規範、`docs/03` §7 sync 済)
 *  - disabled wrapper title pattern (CR R32+R38 paradigm)、外側 <span title> + 内側 button disabled
 *  - user-facing 文言 (title + aria-label) は静的 mock 内部用語を排除し JP-only に統一
 *
 * Day 20 (Plan v1.3 final patch Day 20、CR 案 B 採用):
 *  - 再 enabled、`window.open(import.meta.env.BASE_URL + 'demo/business-approval-view.html', '_blank')` で 承認者承認画面 static mock を別タブで開く
 *  - Static mock の canonical = `demo/static-mocks/business-approval-view.html` (SSOT、docs/06-session4-narrative.md §4)
 *  - Vite が `prototype/public/demo/business-approval-view.html` (symlink → canonical) を serve、`import.meta.env.BASE_URL` 起点で:
 *      - dev / production root deploy → `/demo/business-approval-view.html`
 *      - GitHub Pages 等 sub-path deploy (`VITE_BASE_PATH=/backoffice-ai-v2/`) → `/backoffice-ai-v2/demo/business-approval-view.html`
 *    両 case で正しく resolves (CR v1.4.2 blocker 2 反映、`vite.config.ts` の `base: process.env.VITE_BASE_PATH ?? '/'` と整合)
 *  - 10 番目画面化禁止 (`prototype/CLAUDE.md`、9 routes exactly) → React route 化せず static HTML 別タブで開く
 *  - AST no-op gate: `onClick` 設定により enabled <button> として pass
 */

interface Props {
  status: '未送付' | '承認待ち' | '承認済' | '差戻し'
}

function openBusinessApprovalView() {
  if (typeof window === 'undefined') return
  // import.meta.env.BASE_URL は Vite が base path 適用後の URL prefix を提供 ('/' or '/backoffice-ai-v2/' 等)、必ず trailing slash 付き
  const baseUrl = import.meta.env.BASE_URL
  window.open(`${baseUrl}demo/business-approval-view.html`, '_blank', 'noopener,noreferrer')
}

export function BusinessApprovalChip({ status }: Props) {
  const semantic =
    status === '承認済'
      ? 'border-emerald-200 bg-[var(--color-success-soft)] text-[var(--color-success)]'
      : status === '差戻し'
        ? 'border-red-200 bg-[var(--color-error-soft)] text-[var(--color-error)]'
        : status === '承認待ち'
          ? 'border-amber-200 bg-[var(--color-alert-soft)] text-[var(--color-alert-soft-fg)]'
          : 'border-slate-200 bg-slate-50 text-slate-600'

  return (
    <button
      type="button"
      onClick={openBusinessApprovalView}
      aria-label="承認者承認画面を別タブで開く (Session 4 slide 用 static mock)"
      title="承認者承認画面 (Session 4 slide 用 static mock) を別タブで開きます"
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]',
        semantic
      )}
    >
      <UserCheck className="h-3.5 w-3.5" />
      <span>承認者承認: {status}</span>
      <ExternalLink className="h-3.5 w-3.5 text-current opacity-60" />
    </button>
  )
}
