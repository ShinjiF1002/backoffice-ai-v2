import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutGridIcon,
  InboxIcon,
  ClipboardCheckIcon,
  SparklesIcon,
  BotIcon,
  ActivityIcon,
} from 'lucide-react'
import { cn } from '@/lib/cn'

/**
 * Sidebar — 6-nav grouped (Process-First v2)
 * SSOT: handoff-redesign/00-shared/ia-overview-v2.md §2 + canonical-design-spec.md §2.3
 *
 * group: 処理 (受信トレイ/承認待ち) / 改善 (AI 提案レビュー/Agent 設定) / 監視 (モニタリング)。
 * 詳細画面 (CaseDetail/ProposalDetail/AgentDetail) は master row click から navigate (sidebar 非表示)。
 * lucide icon (Icon suffix 統一)、icon-per-concept = canonical-design-spec §5。
 */
interface NavItem {
  to: string
  label: string
  icon: typeof LayoutGridIcon
  /** 指定時、isActive を path prefix match で評価 (detail route を master nav に含める) */
  activePrefix?: string
}
interface NavGroup {
  group: string | null
  items: NavItem[]
}

const navGroups: NavGroup[] = [
  { group: null, items: [{ to: '/', label: 'ハブ', icon: LayoutGridIcon }] },
  {
    group: '処理',
    items: [
      { to: '/cases', label: '受信トレイ', icon: InboxIcon, activePrefix: '/cases' },
      { to: '/approvals', label: '承認待ち', icon: ClipboardCheckIcon, activePrefix: '/approvals' },
    ],
  },
  {
    group: '改善',
    items: [
      { to: '/proposals', label: 'AI 提案レビュー', icon: SparklesIcon, activePrefix: '/proposals' },
      { to: '/agents', label: 'Agent 設定', icon: BotIcon, activePrefix: '/agents' },
    ],
  },
  {
    group: '監視',
    items: [{ to: '/observatory', label: 'モニタリング', icon: ActivityIcon, activePrefix: '/observatory' }],
  },
]

const allItems = navGroups.flatMap((g) => g.items)

function isItemActive(item: NavItem, pathname: string): boolean {
  if (item.to === '/') return pathname === '/'
  if (item.activePrefix) return pathname.startsWith(item.activePrefix)
  return pathname === item.to
}

export function Sidebar() {
  const location = useLocation()
  return (
    <>
      <aside className="hidden h-full w-56 flex-col border-r border-[var(--color-border)] bg-[var(--color-panel)] md:flex">
        {/* Brand */}
        <div className="flex h-14 items-center border-b border-[var(--color-border)] px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--color-primary)] text-white">
              <span className="text-sm font-bold">B</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-[var(--color-fg)]">Backoffice AI</span>
              <span className="font-mono text-[10px] text-[var(--color-fg-subtle)]">v2 prototype</span>
            </div>
          </div>
        </div>

        {/* Nav (grouped) */}
        <nav className="flex-1 overflow-y-auto p-2">
          {navGroups.map((g, gi) => (
            <div key={g.group ?? 'top'} className={cn(gi > 0 && 'mt-3')}>
              {g.group && (
                <div className="px-2.5 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-fg-subtle)]">
                  {g.group}
                </div>
              )}
              <ul className="space-y-0.5">
                {g.items.map((item) => {
                  const Icon = item.icon
                  const active = isItemActive(item, location.pathname)
                  return (
                    <li key={item.to}>
                      <NavLink
                        to={item.to}
                        className={cn(
                          'group flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors',
                          active
                            ? 'bg-[var(--color-primary-soft)] font-medium text-[var(--color-primary)]'
                            : 'text-[var(--color-fg)] hover:bg-[var(--color-panel-inset)]'
                        )}
                      >
                        <Icon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                        <span className="flex-1 truncate">{item.label}</span>
                      </NavLink>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* User menu */}
        <div className="border-t border-[var(--color-border)] p-2">
          <div className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-[var(--color-fg)]">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-panel-inset)] font-mono text-xs font-medium text-[var(--color-fg)]">
              山田
            </div>
            <div className="flex flex-1 flex-col items-start">
              <span className="text-xs font-medium text-[var(--color-fg)]">山田 太郎</span>
              <span className="text-[10px] text-[var(--color-fg-subtle)]">入力者</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile bottom nav (flat、group 見出しなし) */}
      <nav
        aria-label="主要ナビゲーション"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--color-border)] bg-[var(--color-panel)]/95 px-2 py-1.5 backdrop-blur md:hidden"
      >
        <ul className="flex items-center justify-between gap-1">
          {allItems.map((item) => {
            const Icon = item.icon
            const active = isItemActive(item, location.pathname)
            return (
              <li key={`mobile-${item.to}`} className="min-w-0 flex-1">
                <NavLink
                  to={item.to}
                  aria-label={item.label}
                  className={cn(
                    'flex h-11 items-center justify-center rounded-md transition-colors',
                    active
                      ? 'bg-[var(--color-primary-soft)] text-[var(--color-primary)]'
                      : 'text-[var(--color-fg-subtle)] hover:bg-[var(--color-panel-inset)]'
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>
    </>
  )
}
