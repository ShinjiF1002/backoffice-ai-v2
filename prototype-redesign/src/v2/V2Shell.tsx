import { Outlet, useSearchParams, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutGridIcon,
  InboxIcon,
  ClipboardCheckIcon,
  ActivityIcon,
  ShieldCheckIcon,
  AlertTriangleIcon,
  SparklesIcon,
  BotIcon,
  SearchIcon,
  BellIcon,
  PlusIcon,
  ChevronDownIcon,
} from 'lucide-react'
import { useCases, useApprovals, useEscalations, useProposals, useUnreadCount, useCurrentActor, useStoreDispatch } from '@/store/hooks'
import { useView } from '@/context/view-context'
import { DEMO_ACTORS, roleLabel } from '@/store/actors'
import { ProcessSelector } from '@/components/shell/ProcessSelector'

/**
 * V2Shell — greenfield Operator Console shell (graphite recessive chrome × bright content、store 配線済)。
 * 新 IA: 3 group (処理 / 監督 / 改善)。chrome = 横断検索 (/search)・通知 (/inbox、未読 live)・操作者 (persona switch)・起票。
 * sidebar count は store-truth (案件/承認待ち/escalation/提案)。prototype label 常時表示。全 capability 保全。
 */

type CountKey = 'cases' | 'approvals' | 'escalations' | 'proposals'
type NavItem = { label: string; icon: typeof InboxIcon; href?: string; match?: string; countKey?: CountKey }
type NavGroup = { group: string | null; items: NavItem[] }

// href = 実装済 v2 route。match = active 判定の path prefix。countKey = store 由来 件数の source。
const NAV: NavGroup[] = [
  { group: null, items: [{ label: 'ハブ', icon: LayoutGridIcon, href: '/hub', match: '/hub' }] },
  {
    group: '処理',
    items: [
      { label: '案件キュー', icon: InboxIcon, href: '/cases', match: '/case', countKey: 'cases' },
      { label: '承認待ち', icon: ClipboardCheckIcon, href: '/approvals', match: '/approvals', countKey: 'approvals' },
    ],
  },
  {
    group: '監督',
    items: [
      { label: 'モニタリング', icon: ActivityIcon, href: '/observatory', match: '/observatory' },
      { label: '業務責任者', icon: ShieldCheckIcon, href: '/business-approver', match: '/business-approver' },
      { label: 'エスカレーション', icon: AlertTriangleIcon, href: '/escalations', match: '/escalations', countKey: 'escalations' },
    ],
  },
  {
    group: '改善',
    items: [
      { label: 'AI 提案', icon: SparklesIcon, href: '/proposals', match: '/proposals', countKey: 'proposals' },
      { label: 'Agent 設定', icon: BotIcon, href: '/agents', match: '/agents' },
    ],
  },
]

export function V2Shell() {
  const [sp] = useSearchParams()
  const loc = useLocation()
  const navigate = useNavigate()
  const { searchQuery, setSearchQuery } = useView()
  const actor = useCurrentActor()
  const dispatch = useStoreDispatch()
  const unread = useUnreadCount()
  const counts: Record<CountKey, number> = {
    cases: useCases().length,
    approvals: useApprovals().length,
    escalations: useEscalations().length,
    proposals: useProposals().length,
  }
  const lightChrome = sp.get('chrome') !== 'dark' // light を default 確定 (dark は ?chrome=dark で比較用)
  return (
    <div className={'v2-root flex h-screen w-screen overflow-hidden' + (lightChrome ? ' v2-chrome-light' : '')}>
      {/* skip-link */}
      <a
        href="#main-content"
        className="sr-only rounded-[var(--v2-radius-control)] focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-[100] focus:bg-[var(--v2-accent)] focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
      >
        本文へスキップ
      </a>

      {/* === Sidebar (graphite recessive chrome) === */}
      <aside className="flex w-[244px] flex-shrink-0 flex-col border-r border-[var(--v2-chrome-border)] bg-[var(--v2-chrome)] text-[var(--v2-chrome-fg)]">
        {/* brand */}
        <div className="flex h-14 items-center gap-2.5 px-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-[var(--v2-radius-control)] bg-[var(--v2-accent)] text-sm font-bold text-white">
            B
          </div>
          <div className="leading-tight">
            <div className="text-[13px] font-semibold tracking-tight">Backoffice AI</div>
            <div className="text-[10px] text-[var(--v2-chrome-faint)]">Operator Console</div>
          </div>
        </div>

        {/* nav */}
        <nav aria-label="サイドバーナビゲーション" className="flex-1 overflow-y-auto px-2.5 py-2">
          {NAV.map((g, gi) => (
            <div key={g.group ?? 'top'} className={gi > 0 ? 'mt-4' : ''}>
              {g.group && (
                <div className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--v2-chrome-faint)]">
                  {g.group}
                </div>
              )}
              <ul className="flex flex-col gap-0.5">
                {g.items.map((it) => {
                  const active = it.match ? loc.pathname.startsWith(it.match) : false
                  const count = it.countKey ? counts[it.countKey] : undefined
                  return (
                    <li key={it.label}>
                      <a
                        href={it.href}
                        aria-current={active ? 'page' : undefined}
                        aria-disabled={it.href ? undefined : true}
                        title={it.href ? undefined : 'preview — 本実装で配線'}
                        className={
                          'group relative flex items-center gap-2.5 rounded-[var(--v2-radius-control)] px-2.5 py-2 text-[13px] transition-colors ' +
                          (active
                            ? 'bg-[var(--v2-chrome-3)] font-medium text-[var(--v2-chrome-fg)]'
                            : 'text-[var(--v2-chrome-muted)] hover:bg-[var(--v2-chrome-2)] hover:text-[var(--v2-chrome-fg)]')
                        }
                      >
                        {active && (
                          <span className="absolute left-0 h-5 w-[3px] -translate-x-2.5 rounded-r bg-[var(--v2-accent)]" aria-hidden="true" />
                        )}
                        <it.icon className="h-[18px] w-[18px] flex-shrink-0" aria-hidden="true" />
                        <span className="flex-1 truncate">{it.label}</span>
                        {count !== undefined && count > 0 && (
                          <span
                            className={
                              'v2-tnum rounded-full px-1.5 text-[11px] font-medium ' +
                              (active ? 'bg-[var(--v2-accent)] text-white' : 'bg-[var(--v2-chrome-2)] text-[var(--v2-chrome-muted)]')
                            }
                          >
                            {count}
                          </span>
                        )}
                      </a>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* actor footer — persona switcher (透明 select overlay、見た目は維持) */}
        <div className="border-t border-[var(--v2-chrome-border)] p-2.5">
          <label
            title="操作者（デモ用の担当者）を切替えます。入力者と承認者を演じ分けて職務分離を確認できます。"
            className="relative flex w-full cursor-pointer items-center gap-2.5 rounded-[var(--v2-radius-control)] px-2 py-1.5 text-left hover:bg-[var(--v2-chrome-2)]"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--v2-chrome-3)] text-[11px] font-semibold text-[var(--v2-chrome-fg)]">
              {actor ? actor.name.slice(0, 2) : '—'}
            </span>
            <span className="flex-1 leading-tight">
              <span className="block text-[12px] font-medium text-[var(--v2-chrome-fg)]">{actor?.name ?? '未選択'}</span>
              <span className="block text-[10px] text-[var(--v2-chrome-faint)]">{actor ? roleLabel(actor.role) : ''}</span>
            </span>
            <ChevronDownIcon className="h-4 w-4 text-[var(--v2-chrome-faint)]" aria-hidden="true" />
            <select
              aria-label="操作者（デモ用の担当者）の切替"
              value={actor?.id ?? ''}
              onChange={(e) => dispatch({ type: 'session/switchActor', actorId: e.target.value })}
              className="absolute inset-0 cursor-pointer opacity-0"
            >
              {DEMO_ACTORS.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}（{roleLabel(a.role)}）
                </option>
              ))}
            </select>
          </label>
        </div>
      </aside>

      {/* === content column === */}
      <div className="flex flex-1 flex-col overflow-hidden bg-[var(--v2-canvas)]">
        {/* TopBar (bright chrome) */}
        <header className="flex h-12 flex-shrink-0 items-center gap-3 border-b border-[var(--v2-border)] bg-[var(--v2-panel)] px-4">
          {/* process selector (Process-First: 全 list の業務 filter SSOT) */}
          <ProcessSelector />
          {/* search */}
          <form
            role="search"
            onSubmit={(e) => { e.preventDefault(); navigate('/search') }}
            className="flex h-8 w-full max-w-[360px] items-center gap-2 rounded-[var(--v2-radius-control)] border border-[var(--v2-border)] bg-[var(--v2-canvas)] px-2.5 text-[var(--v2-fg-muted)]"
          >
            <SearchIcon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="案件・提案・Agent を横断検索 (Cmd+K)"
              aria-label="横断検索"
              className="w-full bg-transparent text-[13px] text-[var(--v2-fg)] placeholder:text-[var(--v2-fg-subtle)] focus:outline-none"
            />
          </form>
          <div className="flex-1" />
          {/* prototype pill */}
          <span className="hidden items-center gap-1.5 rounded-full border border-[var(--v2-alert-soft-border)] bg-[var(--v2-alert-soft)] px-2.5 py-1 text-[11px] font-medium text-[var(--v2-alert-soft-fg)] lg:inline-flex">
            プロトタイプ表示 — 外部システム未接続 / 証跡はモック
          </span>
          {/* 起票 */}
          <button
            type="button"
            onClick={() => navigate('/cases/new')}
            className="flex h-8 items-center gap-1.5 rounded-[var(--v2-radius-control)] bg-[var(--v2-accent)] px-3 text-[13px] font-medium text-white hover:bg-[var(--v2-accent-hover)]"
          >
            <PlusIcon className="h-4 w-4" aria-hidden="true" />
            起票
          </button>
          {/* bell */}
          <a
            href="/inbox"
            className="relative flex h-8 w-8 items-center justify-center rounded-[var(--v2-radius-control)] text-[var(--v2-fg-muted)] hover:bg-[var(--v2-panel-inset)]"
            aria-label={unread > 0 ? `通知（未読 ${unread} 件）` : '通知'}
          >
            <BellIcon className="h-[18px] w-[18px]" aria-hidden="true" />
            {unread > 0 && (
              <span
                className="v2-tnum absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--v2-accent)] px-1 text-[10px] font-semibold text-white"
                aria-hidden="true"
              >
                {unread}
              </span>
            )}
          </a>
          <span aria-live="polite" className="sr-only">
            {unread > 0 ? `未読の通知が ${unread} 件あります` : '未読の通知はありません'}
          </span>
        </header>

        <main id="main-content" tabIndex={-1} className="flex-1 overflow-hidden outline-none">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
