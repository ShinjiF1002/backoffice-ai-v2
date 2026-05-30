import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import { ChevronDownIcon } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useView } from '@/context/view-context'

/**
 * ProcessSelector — TopBar の業務 (Process) 切替 (Process-First IA の中核)
 * SSOT: handoff-redesign/00-shared/process-selector-spec.md
 *
 * P1-1: 業務選択は ViewContext SSOT (localStorage 永続)。選択値は useView に委譲し全画面 list filter と同期。
 * P1-6 (keyboard a11y): listbox を roving tabindex で keyboard 駆動可能化。
 *   - Esc → close + trigger へ focus 復帰 / outside-click → close (Modal.tsx の listener pattern 踏襲)
 *   - ArrowUp/Down/Home/End で activeIndex 移動、Enter/Space で確定 (Space scroll は preventDefault)
 *   - option は `<li role=option tabIndex aria-selected>` 直化 (button ネスト = invalid ARIA を排除、AR2)
 */
const PROCESSES = [
  { id: 'all', label: '全業務' },
  { id: 'UC-BO-01', label: '法人住所変更' },
  { id: 'UC-BO-02', label: '口座開設書類完備' },
] as const

export function ProcessSelector() {
  const { process, setProcess } = useView()
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const listboxRef = useRef<HTMLUListElement>(null)
  const optionRefs = useRef<(HTMLLIElement | null)[]>([])

  const currentIndex = Math.max(
    0,
    PROCESSES.findIndex((p) => p.id === process),
  )
  const current = PROCESSES[currentIndex] ?? PROCESSES[0]

  function openMenu() {
    setActiveIndex(currentIndex) // 開いた時は現在値を起点に roving
    setOpen(true)
  }
  function closeMenu(returnFocus = true) {
    setOpen(false)
    if (returnFocus) triggerRef.current?.focus()
  }
  function selectAt(i: number) {
    const p = PROCESSES[i]
    if (p) setProcess(p.id)
    closeMenu()
  }

  // roving: active option へ focus 移動 (open 中のみ)
  useEffect(() => {
    if (open) optionRefs.current[activeIndex]?.focus()
  }, [open, activeIndex])

  // Esc close (+ trigger 復帰) / outside-click close (Modal.tsx pattern 踏襲、addEventListener+removeEventListener pair)
  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        closeMenu()
      }
    }
    const onMouseDown = (e: MouseEvent) => {
      const t = e.target as Node
      if (!listboxRef.current?.contains(t) && !triggerRef.current?.contains(t)) closeMenu(false)
    }
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('mousedown', onMouseDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('mousedown', onMouseDown)
    }
  }, [open])

  function onOptionKeyDown(e: ReactKeyboardEvent<HTMLLIElement>, i: number) {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActiveIndex((i + 1) % PROCESSES.length)
        break
      case 'ArrowUp':
        e.preventDefault()
        setActiveIndex((i - 1 + PROCESSES.length) % PROCESSES.length)
        break
      case 'Home':
        e.preventDefault()
        setActiveIndex(0)
        break
      case 'End':
        e.preventDefault()
        setActiveIndex(PROCESSES.length - 1)
        break
      case 'Enter':
      case ' ':
        e.preventDefault() // Space scroll を抑止
        selectAt(i)
        break
    }
  }

  return (
    <div className="relative">
      <span className="mr-2 text-xs text-[var(--color-fg-muted)]">業務</span>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => (open ? closeMenu(false) : openMenu())}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex h-8 items-center gap-2 rounded-[var(--radius-control)] border border-[var(--color-border-strong)] bg-[var(--color-panel)] px-3 text-sm font-semibold text-[var(--color-fg)] hover:bg-[var(--color-panel-inset)]"
      >
        {current.label}
        <ChevronDownIcon className="h-3.5 w-3.5 text-[var(--color-fg-muted)]" aria-hidden="true" />
      </button>
      {open && (
        <ul
          ref={listboxRef}
          role="listbox"
          aria-label="業務"
          className="absolute left-0 top-9 z-50 min-w-44 rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-panel)] py-1 shadow-lg"
        >
          {PROCESSES.map((p, i) => (
            <li
              key={p.id}
              ref={(el) => {
                optionRefs.current[i] = el
              }}
              role="option"
              aria-selected={p.id === process}
              tabIndex={activeIndex === i ? 0 : -1}
              onClick={() => selectAt(i)}
              onKeyDown={(e) => onOptionKeyDown(e, i)}
              className={cn(
                'flex w-full cursor-pointer items-center px-3 py-1.5 text-left text-sm outline-none hover:bg-[var(--color-panel-inset)] focus-visible:bg-[var(--color-panel-inset)] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-primary)]',
                p.id === process ? 'font-medium text-[var(--color-primary)]' : 'text-[var(--color-fg)]',
              )}
            >
              {p.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
