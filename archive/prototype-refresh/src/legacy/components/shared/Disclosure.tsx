import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

/**
 * Disclosure — general-purpose expand/collapse primitive (Day 19 Commit 3b、Plan v1.4 U-4 + U-14 + U-17 + U-10)
 *
 * SSOT: prototype/audit/day-19-ux-clarity-integrated-plan.md v1.4 Commit 3b
 *
 * 用途:
 *  - EvidenceTimeline step expand (drawer trigger までは不要な L3 inline expand)
 *  - SendBackComment radio description L3 demote (selected の時 default open、Commit 4 U-14)
 *  - AgentSettings Hero 4 KPI grid / Tool description L3 demote (Commit 5 U-17)
 *  - StagingHintPanel collapsed (Commit 5 U-10)
 *
 * 規範:
 *  - chevron rotation + smooth transition
 *  - aria-expanded + aria-controls auto wiring
 *  - default closed (defaultOpen prop で override 可)
 *  - 装飾排除 (Operational Premium Light §2.7)、shadow / motion なし
 *  - PageHelpDisclosure と並列 primitive (page-level vs inline-level の意味分離)
 */

interface DisclosureProps {
  /** toggle button label */
  title: string
  /** expanded panel body */
  children: ReactNode
  /** default 状態 (default = false) */
  defaultOpen?: boolean
  /** id 上書き (default は React generated)、aria-controls 連携用 */
  id?: string
  className?: string
  /** title row 右側の summary chip / count 等 (例: 件数 chip)、collapsed でも常時 visible */
  meta?: ReactNode
}

let _autoId = 0
function nextId() {
  return `disclosure-${++_autoId}`
}

export function Disclosure({
  title,
  children,
  defaultOpen = false,
  id,
  className,
  meta,
}: DisclosureProps) {
  const [open, setOpen] = useState(defaultOpen)
  const [contentId] = useState(() => id ?? nextId())

  return (
    <div className={cn('w-full', className)}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-controls={contentId}
        className={cn(
          'flex w-full items-center justify-between gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-left text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50',
          open && 'border-b-0 rounded-b-none bg-slate-50'
        )}
      >
        <span className="flex items-center gap-2">
          <ChevronDown
            className={cn(
              'h-3 w-3 shrink-0 text-slate-400 transition-transform duration-150',
              open && 'rotate-180'
            )}
            aria-hidden="true"
          />
          <span>{title}</span>
        </span>
        {meta && <span className="shrink-0 text-[10px] text-slate-500">{meta}</span>}
      </button>
      {open && (
        <div
          id={contentId}
          className="rounded-b-md border border-t-0 border-slate-200 bg-white p-3 text-xs leading-relaxed text-slate-700"
        >
          {children}
        </div>
      )}
    </div>
  )
}
