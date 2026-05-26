import { NavLink, useLocation } from 'react-router-dom'
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
 *
 * Active 判定 (Day 12.2 / CR R28 B1 対応):
 *  - `activePrefix` 未指定: NavLink デフォルト isActive (`to` 完全一致)
 *  - `activePrefix` 指定: location.pathname.startsWith(activePrefix) で評価し、
 *    `to` は queue / list page 等の安定先に固定 (hard-coded ID demo brittleness 回避)
 */

interface NavItem {
  to: string
  label: string
  icon: typeof LayoutDashboard
  /** 指定時、isActive を path prefix match で評価 (queue alias 動線用) */
  activePrefix?: string
}

// SendBackComment は CaseReview の子 route なので sidebar には出さない (9 navigable + 1 detail = 9 page components 維持)
// 案件処理 = Inbox queue alias (Day 12.2 CR R28 B1): /cases/:id へは Inbox row click から、sidebar からは queue へ戻る動線
// AI 提案レビュー / Agent 設定 = 現状 demo seed ID で固定 (Day 13 で localStorage based last-visited 化を検討)
// Day 18.5 audit cleanup: keyboard shortcut field + group-hover:inline kbd reveal 削除 (command palette / kbd shortcut hint は scope-out)
const navItems: NavItem[] = [
  { to: '/dashboard', label: 'ダッシュボード', icon: LayoutDashboard },
  { to: '/inbox', label: '受信トレイ', icon: InboxIcon },
  { to: '/inbox', label: '案件処理', icon: FileText, activePrefix: '/cases/' },
  { to: '/proposals/PROP-2026-031', label: 'AI 提案レビュー', icon: Sparkles, activePrefix: '/proposals/' },
  { to: '/agents/agent-corporate-address-change', label: 'Agent 設定', icon: Cog, activePrefix: '/agents/' },
  { to: '/audit', label: '監査証跡', icon: ShieldCheck },
  { to: '/metrics', label: 'メトリクス', icon: Gauge },
  { to: '/knowledge', label: 'ナレッジ', icon: BookOpen },
]

export function Sidebar() {
  const location = useLocation()
  return (
    <>
      <aside className="hidden h-full w-56 flex-col border-r border-slate-200 bg-white md:flex">
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
              // activePrefix 指定時は path prefix で active 判定 (queue alias 動線)
              const prefixActive = item.activePrefix
                ? location.pathname.startsWith(item.activePrefix)
                : undefined
              return (
                <li key={`${item.to}-${item.label}`}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) => {
                      const active = prefixActive ?? isActive
                      return cn(
                        'group flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors',
                        active
                          ? 'bg-[var(--color-primary-soft)] font-medium text-[var(--color-primary)]'
                          : 'text-slate-700 hover:bg-slate-50'
                      )
                    }}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                    <span className="flex-1 truncate">{item.label}</span>
                  </NavLink>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* User menu — Day 18.5 拡張 Commit 0 (U-3): <button> enabled no-op 解消、<div> semantic 化。
        * user role 切替は scope-out (Phase 1)、<DisabledAction> は form submit context との非整合のため div を採用、focusable なし。 */}
        <div className="border-t border-slate-200 p-2">
          <div className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-slate-700">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 font-mono text-xs font-medium text-slate-700">
              山田
            </div>
            <div className="flex flex-1 flex-col items-start">
              <span className="text-xs font-medium text-slate-900">山田 太郎</span>
              <span className="text-[10px] text-slate-500">入力者</span>
            </div>
          </div>
        </div>
      </aside>

      <nav
        aria-label="主要ナビゲーション"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-2 py-1.5 shadow-[0_-4px_16px_rgba(15,23,42,0.06)] backdrop-blur md:hidden"
      >
        <ul className="flex items-center justify-between gap-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = item.activePrefix
              ? location.pathname.startsWith(item.activePrefix)
              : location.pathname === item.to || (item.to === '/dashboard' && location.pathname === '/')
            return (
              <li key={`mobile-${item.to}-${item.label}`} className="min-w-0 flex-1">
                <NavLink
                  to={item.to}
                  aria-label={item.label}
                  className={cn(
                    'flex h-11 items-center justify-center rounded-md transition-colors',
                    active
                      ? 'bg-[var(--color-primary-soft)] text-[var(--color-primary)]'
                      : 'text-slate-500 hover:bg-slate-50'
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
