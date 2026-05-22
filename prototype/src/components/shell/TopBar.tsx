import { PrototypeModeLabel } from './PrototypeModeLabel'
import { Search, Bell } from 'lucide-react'

/**
 * TopBar — sticky header
 * SSOT: docs/03-ui-prototype-design.md §5
 *
 * Layout: Search (left) + Notifications + PrototypeModeLabel + UserMenu (right)
 * PrototypeModeLabel は UserMenu 左隣に配置 (§8 SSOT)。
 */
export function TopBar() {
  return (
    <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-6">
      {/* Left: search */}
      <div className="flex items-center gap-3">
        <div className="relative w-72">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="text"
            placeholder="案件 ID / 業務 / 担当者で検索"
            className="h-9 w-full rounded-md border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[var(--color-primary)] focus:bg-white focus:outline-none"
          />
        </div>
        <kbd className="hidden rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[10px] text-slate-500 lg:inline">
          ⌘K
        </kbd>
      </div>

      {/* Right: notifications + prototype label + user menu */}
      <div className="flex items-center gap-3">
        <button
          className="relative flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          aria-label="通知"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[var(--color-alert)]" />
        </button>
        <PrototypeModeLabel />
      </div>
    </header>
  )
}
