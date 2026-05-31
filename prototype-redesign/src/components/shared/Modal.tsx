import { useEffect, useId, useRef, useState } from 'react'
import type { ReactNode, RefObject } from 'react'
import { XIcon } from 'lucide-react'
import { cn } from '@/lib/cn'

/**
 * Modal — 共通 dialog shell (Phase 2 — 共通 primitive)。
 * SSOT: ~/.claude/plans/reactive-percolating-gizmo.md Phase 2 / Track B。
 *
 * 提供するのは shell (overlay + panel + header + footer slot + a11y) のみ。
 * body の中身・state・validation は各 consumer (FieldActionModal / ReasonDialog 等) が持つ。
 *
 * a11y (新 dep なしの自作 focus 管理):
 *  - open 時: 直前の活性要素を保存し、initialFocusRef (or panel 内最初の focusable) へ focus
 *  - Esc: onClose
 *  - Tab: panel 内で循環 (focusable は keydown 時に都度 query = 動的要素に対応)
 *  - close (unmount): trigger へ focus 復帰
 *  - overlay click: onClose / `role=dialog` + `aria-modal` + `aria-labelledby`
 */
const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

function getFocusable(container: HTMLElement | null): HTMLElement[] {
  if (!container) return []
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => el.offsetParent !== null || el === document.activeElement,
  )
}

export interface ModalProps {
  open: boolean
  onClose: () => void
  /** header に表示する title (aria-labelledby 用に内部 h2 を生成) */
  title: string
  /** panel 幅。sm=480 / md=520。default sm */
  size?: 'sm' | 'md'
  /** open 時に focus を当てる要素 (未指定なら panel 内最初の focusable) */
  initialFocusRef?: RefObject<HTMLElement | null>
  /** footer slot (cancel / primary 等を consumer が渡す)。未指定なら footer 非表示 */
  footer?: ReactNode
  /** 未保存入力あり (W3 G5)。confirmOnDismiss と併用で Esc/backdrop/X の閉じを破棄確認に切替える。 */
  dirty?: boolean
  /** dirty 時に閉じ操作を破棄確認に切替える (W3 G5)。未指定 (既存 consumer) は即閉じ = 挙動不変。 */
  confirmOnDismiss?: boolean
  children: ReactNode
}

export function Modal({ open, onClose, title, size = 'sm', initialFocusRef, footer, dirty, confirmOnDismiss, children }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const discardBtnRef = useRef<HTMLButtonElement>(null)
  const titleId = useId()
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false)
  // open が閉じたら破棄確認を reset (再 open で fresh)。render 中の prop 変化検知 (set-state-in-effect 回避)。
  const [wasOpen, setWasOpen] = useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (!open) setShowDiscardConfirm(false)
  }
  // W3 G5: dirty + confirmOnDismiss の時、閉じ操作を破棄確認へ振り替える。それ以外は即 onClose (既存 consumer 挙動不変)。
  const requestClose = () => {
    if (dirty && confirmOnDismiss) setShowDiscardConfirm(true)
    else onClose()
  }
  // W3 G5: open 中は body scroll-lock (背景スクロール抑止)。前値を保存し close/unmount で復元 (単一 modal 前提)。
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  // focus 移動 + 復帰 (open 遷移時のみ。onClose を deps に含めず focus 横取りを防ぐ)
  useEffect(() => {
    if (!open) return
    const previouslyFocused = document.activeElement as HTMLElement | null
    const target = initialFocusRef?.current ?? getFocusable(panelRef.current)[0]
    target?.focus()
    return () => {
      previouslyFocused?.focus?.()
    }
  }, [open, initialFocusRef])

  // Esc close + Tab 循環 (onClose 変化で listener 再束縛、focus には触れない)
  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        if (dirty && confirmOnDismiss) setShowDiscardConfirm(true)
        else onClose()
        return
      }
      if (e.key !== 'Tab') return
      const focusable = getFocusable(panelRef.current)
      if (focusable.length === 0) {
        e.preventDefault()
        return
      }
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (!first || !last) return
      const active = document.activeElement
      if (e.shiftKey && active === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && active === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose, dirty, confirmOnDismiss])

  // W3 G5: 破棄確認 overlay 表示時は「編集に戻る」へ focus を移す (背景 inert と併せ Tab を overlay に閉じる)。
  useEffect(() => {
    if (showDiscardConfirm) discardBtnRef.current?.focus()
  }, [showDiscardConfirm])

  if (!open) return null

  return (
    // backdrop = click target のみ。dialog container は panel 側 (a11y 責務分離、Phase 2 CR)
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--color-overlay)] p-6"
      onClick={requestClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          'relative flex max-w-full flex-col overflow-hidden rounded-[var(--radius-card)] bg-[var(--color-panel)] shadow-2xl',
          size === 'md' ? 'w-[520px]' : 'w-[480px]',
        )}
      >
        {/* W3 G5: 破棄確認中は背景 (header/body/footer) を inert 化し focus/操作を overlay に閉じる。 */}
        <div className="flex flex-col" inert={showDiscardConfirm || undefined}>
          <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-3">
            <h2 id={titleId} className="text-sm font-semibold text-[var(--color-fg)]">
              {title}
            </h2>
            <button
              type="button"
              onClick={requestClose}
              aria-label="閉じる"
              className="rounded p-1 text-[var(--color-fg-muted)] hover:bg-[var(--color-panel-inset)]"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </div>

          <div className="p-5">{children}</div>

          {footer && (
            <div className="flex justify-end gap-2 border-t border-[var(--color-border)] bg-[var(--color-panel-inset)] px-5 py-3">
              {footer}
            </div>
          )}
        </div>

        {/* W3 G5: dirty 時の破棄確認 overlay (Esc/backdrop/X で即閉じず、入力を捨てる前に確認)。 */}
        {showDiscardConfirm && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 rounded-[var(--radius-card)] bg-[var(--color-panel)] p-6 text-center">
            <p className="text-sm font-medium text-[var(--color-fg)]">入力内容を破棄して閉じますか？</p>
            <p className="text-xs text-[var(--color-fg-muted)]">入力した内容は保存されません。</p>
            <div className="mt-2 flex gap-2">
              <button
                ref={discardBtnRef}
                type="button"
                onClick={() => setShowDiscardConfirm(false)}
                className="rounded-[var(--radius-control)] border border-[var(--color-border-strong)] bg-[var(--color-panel)] px-3 py-1.5 text-sm text-[var(--color-fg)] hover:bg-[var(--color-panel-inset)]"
              >
                編集に戻る
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDiscardConfirm(false)
                  onClose()
                }}
                className="rounded-[var(--radius-control)] bg-[var(--color-error)] px-3 py-1.5 text-sm font-medium text-white hover:opacity-90"
              >
                破棄して閉じる
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
