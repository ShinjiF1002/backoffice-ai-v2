import { PrototypeModeLabel } from '@/components/shared/PrototypeModeLabel'
import { Search, Bell } from 'lucide-react'

/**
 * TopBar — sticky header
 * SSOT: docs/03-ui-prototype-design.md §5
 *
 * Layout: Search (left) + Notifications + PrototypeModeLabel + UserMenu (right)
 * PrototypeModeLabel は UserMenu 左隣に配置 (§8 SSOT)。
 *
 * Day 18.5 audit cleanup (HEAD post-9b935ca):
 *  - Search: enabled no-op input → `<div aria-hidden="true">` silhouette (cursor-default、focus 不可、SR 無視、placeholder noise 回避)
 *  - Notification: enabled no-op button → `<span aria-hidden="true">` static Bell icon (cursor-default、focus 不可、SR 無視、unread dot は visual cue keep)
 *  - kbd shortcut badge 削除 (command palette は scope-out、未実装 shortcut hint は trust 違反)
 *  - 検索 / 通知 / Sidebar shortcut の未実装説明は PrototypeModeLabel 経由で SR に伝達 (§8 SSOT)
 */
export function TopBar() {
  return (
    <header className="flex h-14 items-center justify-end border-b border-slate-200 bg-white px-3 sm:justify-between sm:px-6">
      {/* Left: search silhouette (aria-hidden、cursor-default、Day 18.5 P1 + R4) */}
      <div className="hidden items-center gap-3 sm:flex">
        <div
          aria-hidden="true"
          className="relative flex h-9 w-72 cursor-default items-center rounded-md border border-slate-200 bg-slate-50 pl-9 pr-3"
        >
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Right: notification static icon + prototype label (Day 18.5 P1 + R5) */}
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <span
          aria-hidden="true"
          className="relative hidden h-8 w-8 cursor-default items-center justify-center rounded-md text-slate-500 sm:flex"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[var(--color-alert)]" />
        </span>
        <PrototypeModeLabel />
      </div>
    </header>
  )
}
