import { useRef, useState } from 'react'
import type { RefObject } from 'react'
import { AlertTriangleIcon } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Modal } from './Modal'

/**
 * ReasonDialog — 理由必須の確認 modal (汎用)
 * SSOT: screen-contracts-v2 (却下/差戻しは理由必須) + reference screens-v2/06-proposal-detail (ReasonDialog)。
 * 却下 / 差戻し 等、理由未入力では送信不可 (即 error)。outcome を 1 行明示。
 * Phase 2: shell を共通 Modal に移譲。state / validation は本 component が保持 (挙動不変)。
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
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // open に遷移したら入力を初期化 (render 中の prop 変化検知、set-state-in-effect 回避)。挙動は不変。
  const [wasOpen, setWasOpen] = useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setReason('')
      setShowError(false)
    }
  }

  const handleSubmit = () => {
    if (!reason.trim()) {
      setShowError(true)
      return
    }
    onSubmit(reason.trim())
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      dirty={!!reason.trim()}
      confirmOnDismiss
      initialFocusRef={textareaRef as RefObject<HTMLElement | null>}
      footer={
        <>
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
        </>
      }
    >
      <div className="flex flex-col gap-3">
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
            ref={textareaRef}
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
    </Modal>
  )
}
