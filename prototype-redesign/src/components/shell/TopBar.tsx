import { NavLink, useNavigate } from 'react-router-dom'
import { SearchIcon, BellIcon } from 'lucide-react'
import { PrototypeModeLabel } from '@/components/shared/PrototypeModeLabel'
import { PersonaSwitcher } from '@/components/shared/PersonaSwitcher'
import { ProcessSelector } from './ProcessSelector'
import { useView } from '@/context/view-context'
import { useUnreadCount } from '@/store/hooks'
import { cn } from '@/lib/cn'

/**
 * TopBar — sticky header (Process-First v2)
 * SSOT: handoff-redesign/00-shared/ia-overview-v2.md §2 + canonical-design-spec.md §2.3
 *
 * Layout: ProcessSelector + 横断検索 input (left) / 通知ベル + PersonaSwitcher + PrototypeModeLabel (right)。
 * P1-2: 検索 silhouette → 機能 input (Enter で /search)、BellIcon → /inbox NavLink + 未読 live ドット (>0 のみ)。
 *   nav 配置は TopBar 単独 (Sidebar 肥大回避、roadmap §3.2 JG)。検索語は ViewContext (ephemeral) SSOT。
 */
export function TopBar() {
  const { searchQuery, setSearchQuery } = useView()
  const navigate = useNavigate()
  const unread = useUnreadCount()
  return (
    <header className="flex h-14 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-panel)] px-3 sm:px-6">
      {/* Left: ProcessSelector (Process-First IA 中核) + 横断検索 */}
      <div className="flex min-w-0 items-center gap-3">
        <ProcessSelector />
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault()
            navigate('/search')
          }}
          className="relative hidden h-9 w-56 items-center lg:flex"
        >
          <SearchIcon
            className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-fg-subtle)]"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="案件 ID・業務・担当で検索"
            aria-label="横断検索"
            className="h-full w-full rounded-md border border-[var(--color-border)] bg-[var(--color-panel-inset)] pl-9 pr-3 text-sm text-[var(--color-fg)] placeholder:text-[var(--color-fg-tertiary)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
          />
        </form>
      </div>

      {/* Right: 通知ベル (/inbox) + persona switcher (demo) + prototype label */}
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <NavLink
          to="/inbox"
          aria-label={unread > 0 ? `通知 (未読 ${unread} 件)` : '通知'}
          className={({ isActive }) =>
            cn(
              'relative hidden h-8 w-8 items-center justify-center rounded-md sm:flex',
              isActive
                ? 'bg-[var(--color-primary-soft)] text-[var(--color-primary)]'
                : 'text-[var(--color-fg-muted)] hover:bg-[var(--color-panel-inset)]',
            )
          }
        >
          <BellIcon className="h-4 w-4" aria-hidden="true" />
          {unread > 0 && (
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[var(--color-alert)]" aria-hidden="true" />
          )}
        </NavLink>
        <PersonaSwitcher />
        <PrototypeModeLabel />
      </div>
    </header>
  )
}
