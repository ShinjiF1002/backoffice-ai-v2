import { useState, useEffect } from 'react'
import { XIcon, AlertTriangleIcon } from 'lucide-react'
import { cn } from '@/lib/cn'

/**
 * ReasonDialog — 理由必須の確認 modal (汎用)
 * SSOT: screen-contracts-v2 (却下/差戻しは理由必須) + reference screens-v2/06-proposal-detail (ReasonDialog)。
 * 却下 / 差戻し 等、理由未入力では送信不可 (即 error)。outcome を 1 行明示。
 * overlay / validation 規律は FieldActionModal と共有 (単一決定面、submit は primary)。
 */
export interface ReasonDialogProps {
  open: boolean
  title: string
  /** textarea ラベル (例: 却下の理由 (必須)) */
  label: string
  placeholder: string
  submitLabel: string
  /** 送信後に何が起きるか 1 行 */
  outcome: string
  onClose: () => void
  onSubmit: (reason: string) => void
}

export function ReasonDialog({ open, title, label, placeholder, submitLabel, outcome, onClose, onSubmit }: ReasonDialogProps) {
  const [reason, setReason] = useState('')
  const [showError, setShowError] = useState(false)

  useEffect(() => {
    if (open) {
      setReason('')
      setShowError(false)
    }
  }, [open])

  if (!open) return null

  const handleSubmit = () => {
    if (!reason.trim()) {
      setShowError(true)
      return
    }
    onSubmit(reason.trim())
    onClose()
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--color-overlay)] p-6"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex w-[480px] max-w-full flex-col overflow-hidden rounded-[var(--radius-card)] bg-[var(--color-panel)] shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-3">
          <h2 className="text-sm font-semibold text-[var(--color-fg)]">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="閉じる"
            className="rounded p-1 text-[var(--color-fg-muted)] hover:bg-[var(--color-panel-inset)]"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col gap-3 p-5">
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label htmlFor="reason-dialog-input" className="text-xs font-medium text-[var(--color-fg)]">
                {label}
              </label>
              {showError && (
                <span className="flex items-center gap-1 text-xs text-[var(--color-error-soft-fg)]">
                  <AlertTriangleIcon className="h-3 w-3 text-[var(--color-error)]" />
                  入力してください
                </span>
              )}
            </div>
            <textarea
              id="reason-dialog-input"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value)
                if (showError && e.target.value.trim()) setShowError(false)
              }}
              rows={3}
              aria-invalid={showError}
              className={cn(
                'w-full rounded-[var(--radius-control)] border px-3 py-2 text-sm outline-none',
                showError
                  ? 'border-[var(--color-error)] bg-[var(--color-error-soft)]'
                  : 'border-[var(--color-border-strong)] bg-[var(--color-panel)] focus:border-[var(--color-primary)]'
              )}
              placeholder={placeholder}
            />
          </div>
          <div className="rounded-[var(--radius-card)] bg-[var(--color-panel-inset)] px-3 py-2 text-xs text-[var(--color-fg-muted)]">
            {outcome}
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-[var(--color-border)] bg-[var(--color-panel-inset)] px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-[var(--radius-control)] border border-[var(--color-border-strong)] bg-[var(--color-panel)] px-3 py-1.5 text-sm text-[var(--color-fg)] hover:bg-[var(--color-panel-inset)]"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="rounded-[var(--radius-control)] bg-[var(--color-primary)] px-3 py-1.5 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)]"
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
