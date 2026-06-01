import { XIcon } from 'lucide-react'
import type { ToastState, ToastTone } from '@/hooks/useToast'
import { cn } from '@/lib/cn'

/**
 * Toast 共通 primitive (F-027) — 15 画面で手書き重複していた確認 toast を集約。
 * - tone (success/alert/error) で意味を分け、常時 success 緑の誤認を解消。
 * - **統制重要 event** (SoD skip / 緊急停止 / 取消・訂正 / 0 件 export 等) は `sticky` で auto-dismiss を無効化し
 *   手動 dismiss 可能にする (見落とし→後追い不能の解消)。後追いの canonical は監査台帳 (F-002) で別途担保。
 * - role=status + aria-live で SR に通知 (sticky は assertive)。
 * state/制御は `useToast` hook (`@/hooks/useToast`)。
 */
const TONE_CLASS: Record<ToastTone, string> = {
  success: 'border-[var(--color-success)] bg-[var(--color-success-soft)] text-[var(--color-success-soft-fg)]',
  alert: 'border-[var(--color-alert)] bg-[var(--color-alert-soft)] text-[var(--color-alert-soft-fg)]',
  error: 'border-[var(--color-error)] bg-[var(--color-error-soft)] text-[var(--color-error-soft-fg)]',
}

export function Toast({ toast, onDismiss }: { toast: ToastState | null; onDismiss: () => void }) {
  if (!toast) return null
  return (
    <div
      role="status"
      aria-live={toast.sticky ? 'assertive' : 'polite'}
      className={cn(
        'fixed bottom-20 left-1/2 z-[80] flex max-w-[90vw] -translate-x-1/2 items-center gap-2 rounded-[var(--radius-card)] border px-4 py-2 text-sm font-medium shadow-lg',
        TONE_CLASS[toast.tone],
      )}
    >
      <span>{toast.message}</span>
      {toast.sticky && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="通知を閉じる"
          className="ml-1 flex-shrink-0 rounded-[var(--radius-control)] p-0.5 hover:bg-[var(--color-panel)]/40"
        >
          <XIcon className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
