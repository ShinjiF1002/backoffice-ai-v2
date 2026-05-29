import { PrototypeModeLabel } from '@/components/shared/PrototypeModeLabel'
import { ProcessSelector } from './ProcessSelector'
import { SearchIcon, BellIcon } from 'lucide-react'

/**
 * TopBar — sticky header (Process-First v2)
 * SSOT: handoff-redesign/00-shared/ia-overview-v2.md §2 + canonical-design-spec.md §2.3
 *
 * Layout: ProcessSelector + search silhouette (left) / notification + PrototypeModeLabel (right)。
 * ProcessSelector = Process-First IA の中核 (業務切替)。
 * search / notification は scope-out の static silhouette (aria-hidden、focus 不可、未実装説明は PrototypeModeLabel 経由)。
 */
export function TopBar() {
  return (
    <header className="flex h-14 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-panel)] px-3 sm:px-6">
      {/* Left: ProcessSelector (Process-First IA 中核) + search silhouette */}
      <div className="flex min-w-0 items-center gap-3">
        <ProcessSelector />
        <div
          aria-hidden="true"
          className="relative hidden h-9 w-56 cursor-default items-center rounded-md border border-[var(--color-border)] bg-[var(--color-panel-inset)] pl-9 pr-3 lg:flex"
        >
          <SearchIcon
            className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-fg-subtle)]"
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Right: notification static icon + prototype label */}
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <span
          aria-hidden="true"
          className="relative hidden h-8 w-8 cursor-default items-center justify-center rounded-md text-[var(--color-fg-muted)] sm:flex"
        >
          <BellIcon className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[var(--color-alert)]" />
        </span>
        <PrototypeModeLabel />
      </div>
    </header>
  )
}
