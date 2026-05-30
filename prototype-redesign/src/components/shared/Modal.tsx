import { useEffect, useId, useRef } from 'react'
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
  children: ReactNode
}

export function Modal({ open, onClose, title, size = 'sm', initialFocusRef, footer, children }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const titleId = useId()

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
        onClose()
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
  }, [open, onClose])

  if (!open) return null

  return (
    // backdrop = click target のみ。dialog container は panel 側 (a11y 責務分離、Phase 2 CR)
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--color-overlay)] p-6"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          'flex max-w-full flex-col overflow-hidden rounded-[var(--radius-card)] bg-[var(--color-panel)] shadow-2xl',
          size === 'md' ? 'w-[520px]' : 'w-[480px]',
        )}
      >
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-3">
          <h2 id={titleId} className="text-sm font-semibold text-[var(--color-fg)]">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
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
    </div>
  )
}
