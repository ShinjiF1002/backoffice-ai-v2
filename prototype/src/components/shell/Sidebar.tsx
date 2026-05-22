import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Inbox as InboxIcon,
  FileText,
  Sparkles,
  Cog,
  ShieldCheck,
  Gauge,
  BookOpen,
} from 'lucide-react'
import { cn } from '@/lib/cn'

/**
 * Sidebar — 9 routes navigation
 * SSOT: docs/03-ui-prototype-design.md §5 + §2.7.5
 *
 * Exactly 9 routes (10 番目禁止)。SendBackComment は CaseReview の子 detail route。
 */

interface NavItem {
  to: string
  label: string
  icon: typeof LayoutDashboard
  shortcut?: string
}

// SendBackComment は CaseReview の子 route なので sidebar には出さない (9 navigable + 1 detail = 9 page components 維持)
const navItems: NavItem[] = [
  { to: '/dashboard', label: 'ダッシュボード', icon: LayoutDashboard, shortcut: '⌘1' },
  { to: '/inbox', label: '受信トレイ', icon: InboxIcon, shortcut: '⌘2' },
  { to: '/cases/CASE-2026-0142', label: '案件処理', icon: FileText, shortcut: '⌘3' },
  { to: '/proposals/PROP-2026-031', label: 'AI 提案レビュー', icon: Sparkles, shortcut: '⌘4' },
  { to: '/agents/agent-corporate-address-change/settings', label: 'Agent 設定', icon: Cog, shortcut: '⌘5' },
  { to: '/audit', label: '監査証跡', icon: ShieldCheck, shortcut: '⌘6' },
  { to: '/metrics', label: 'メトリクス', icon: Gauge, shortcut: '⌘7' },
  { to: '/knowledge', label: 'ナレッジ', icon: BookOpen, shortcut: '⌘8' },
]

export function Sidebar() {
  return (
    <aside className="flex h-full w-56 flex-col border-r border-slate-200 bg-white">
      {/* Brand */}
      <div className="flex h-14 items-center border-b border-slate-200 px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--color-primary)] text-white">
            <span className="text-sm font-bold">B</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-900">Backoffice AI</span>
            <span className="font-mono text-[10px] text-slate-500">v2 prototype</span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'group flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors',
                      isActive
                        ? 'bg-[var(--color-primary-soft)] font-medium text-[var(--color-primary)]'
                        : 'text-slate-700 hover:bg-slate-50'
                    )
                  }
                >
                  <Icon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.shortcut && (
                    <kbd className="hidden font-mono text-[10px] text-slate-400 group-hover:inline">
                      {item.shortcut}
                    </kbd>
                  )}
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User menu */}
      <div className="border-t border-slate-200 p-2">
        <button className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-slate-700 hover:bg-slate-50">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 font-mono text-xs font-medium text-slate-700">
            山田
          </div>
          <div className="flex flex-1 flex-col items-start">
            <span className="text-xs font-medium text-slate-900">山田 太郎</span>
            <span className="text-[10px] text-slate-500">入力者</span>
          </div>
        </button>
      </div>
    </aside>
  )
}
