import { useState } from 'react'
import { ChevronDownIcon } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useView } from '@/context/view-context'

/**
 * ProcessSelector — TopBar の業務 (Process) 切替 (Process-First IA の中核)
 * SSOT: handoff-redesign/00-shared/process-selector-spec.md
 *
 * P2B-1b: chrome として最小実装 (業務 list + 全業務)。
 * P2B-1c で role landing / saved view / 10+ searchable 等を typed skeleton として拡張。
 */
const PROCESSES = [
  { id: 'all', label: '全業務' },
  { id: 'UC-BO-01', label: '法人住所変更' },
  { id: 'UC-BO-02', label: '口座開設書類完備' },
] as const

export function ProcessSelector() {
  // P1-1: 業務選択は ViewContext SSOT (localStorage 永続)。local useState は廃止し全画面の list filter と同期。
  const { process, setProcess } = useView()
  const [open, setOpen] = useState(false)
  const current = PROCESSES.find((p) => p.id === process) ?? PROCESSES[0]

  return (
    <div className="relative">
      <span className="mr-2 text-xs text-[var(--color-fg-muted)]">業務</span>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex h-8 items-center gap-2 rounded-[var(--radius-control)] border border-[var(--color-border-strong)] bg-[var(--color-panel)] px-3 text-sm font-semibold text-[var(--color-fg)] hover:bg-[var(--color-panel-inset)]"
      >
        {current.label}
        <ChevronDownIcon className="h-3.5 w-3.5 text-[var(--color-fg-muted)]" aria-hidden="true" />
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute left-0 top-9 z-50 min-w-44 rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-panel)] py-1 shadow-lg"
        >
          {PROCESSES.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                role="option"
                aria-selected={p.id === process}
                onClick={() => {
                  setProcess(p.id)
                  setOpen(false)
                }}
                className={cn(
                  'flex w-full items-center px-3 py-1.5 text-left text-sm hover:bg-[var(--color-panel-inset)]',
                  p.id === process
                    ? 'font-medium text-[var(--color-primary)]'
                    : 'text-[var(--color-fg)]'
                )}
              >
                {p.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
