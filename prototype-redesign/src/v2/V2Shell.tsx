import { Outlet, useSearchParams, useLocation } from 'react-router-dom'
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

/**
 * V2Shell — greenfield Operator Console shell (graphite recessive chrome × bright content)。
 * 新 IA: 3 group (処理 / 監督 / 改善)。監督が monitoring+業務責任者+escalation を 1 cluster に統合。
 * chrome (TopBar) = 検索 /search・通知 /inbox・操作者・起票。prototype label 常時表示。
 * 全 capability は保全 (削除なし)、route topology のみ再編。
 */

type NavItem = { label: string; icon: typeof InboxIcon; href?: string; match?: string; count?: number }
type NavGroup = { group: string | null; items: NavItem[] }

// href = 実装済 v2 route (未実装は preview の非リンク)。match = active 判定の path prefix。
const NAV: NavGroup[] = [
  { group: null, items: [{ label: 'ハブ', icon: LayoutGridIcon, href: '/v2/hub', match: '/v2/hub' }] },
  {
    group: '処理',
    items: [
      { label: '案件キュー', icon: InboxIcon, href: '/v2/cases', match: '/v2/case', count: 12 },
      { label: '承認待ち', icon: ClipboardCheckIcon, href: '/v2/approvals', match: '/v2/approvals', count: 5 },
    ],
  },
  {
    group: '監督',
    items: [
      { label: 'モニタリング', icon: ActivityIcon, href: '/v2/observatory', match: '/v2/observatory' },
      { label: '業務責任者', icon: ShieldCheckIcon, href: '/v2/business', match: '/v2/business' },
      { label: 'エスカレーション', icon: AlertTriangleIcon, href: '/v2/escalations', match: '/v2/escalations', count: 2 },
    ],
  },
  {
    group: '改善',
    items: [
      { label: 'AI 提案', icon: SparklesIcon, href: '/v2/proposals', match: '/v2/proposals', count: 3 },
      { label: 'Agent 設定', icon: BotIcon, href: '/v2/agents', match: '/v2/agents' },
    ],
  },
]

export function V2Shell() {
  const [sp] = useSearchParams()
  const loc = useLocation()
  const lightChrome = sp.get('chrome') !== 'dark' // light を default 確定 (dark は ?chrome=dark で比較用)
  return (
    <div className={'v2-root flex h-screen w-screen overflow-hidden' + (lightChrome ? ' v2-chrome-light' : '')}>
      {/* skip-link */}
      <a
        href="#v2-main"
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
        <nav className="flex-1 overflow-y-auto px-2.5 py-2">
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
                        {it.count !== undefined && (
                          <span
                            className={
                              'v2-tnum rounded-full px-1.5 text-[11px] font-medium ' +
                              (active ? 'bg-[var(--v2-accent)] text-white' : 'bg-[var(--v2-chrome-2)] text-[var(--v2-chrome-muted)]')
                            }
                          >
                            {it.count}
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

        {/* actor footer */}
        <div className="border-t border-[var(--v2-chrome-border)] p-2.5">
          <button className="flex w-full items-center gap-2.5 rounded-[var(--v2-radius-control)] px-2 py-1.5 text-left hover:bg-[var(--v2-chrome-2)]">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--v2-chrome-3)] text-[11px] font-semibold text-[var(--v2-chrome-fg)]">
              山田
            </span>
            <span className="flex-1 leading-tight">
              <span className="block text-[12px] font-medium text-[var(--v2-chrome-fg)]">山田 太郎</span>
              <span className="block text-[10px] text-[var(--v2-chrome-faint)]">入力者</span>
            </span>
            <ChevronDownIcon className="h-4 w-4 text-[var(--v2-chrome-faint)]" aria-hidden="true" />
          </button>
        </div>
      </aside>

      {/* === content column === */}
      <div className="flex flex-1 flex-col overflow-hidden bg-[var(--v2-canvas)]">
        {/* TopBar (bright chrome) */}
        <header className="flex h-12 flex-shrink-0 items-center gap-3 border-b border-[var(--v2-border)] bg-[var(--v2-panel)] px-4">
          {/* search */}
          <div className="flex h-8 w-full max-w-[420px] items-center gap-2 rounded-[var(--v2-radius-control)] border border-[var(--v2-border)] bg-[var(--v2-canvas)] px-2.5 text-[var(--v2-fg-muted)]">
            <SearchIcon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
            <input
              placeholder="案件・提案・Agent・台帳を横断検索 (Cmd+K)"
              className="w-full bg-transparent text-[13px] text-[var(--v2-fg)] placeholder:text-[var(--v2-fg-subtle)] focus:outline-none"
            />
          </div>
          <div className="flex-1" />
          {/* prototype pill */}
          <span className="hidden items-center gap-1.5 rounded-full border border-[var(--v2-alert-soft-border)] bg-[var(--v2-alert-soft)] px-2.5 py-1 text-[11px] font-medium text-[var(--v2-alert-soft-fg)] lg:inline-flex">
            プロトタイプ表示 — 外部システム未接続 / 証跡はモック
          </span>
          {/* 起票 */}
          <button className="flex h-8 items-center gap-1.5 rounded-[var(--v2-radius-control)] bg-[var(--v2-accent)] px-3 text-[13px] font-medium text-white hover:bg-[var(--v2-accent-hover)]">
            <PlusIcon className="h-4 w-4" aria-hidden="true" />
            起票
          </button>
          {/* bell */}
          <a href="/v2/inbox" className="relative flex h-8 w-8 items-center justify-center rounded-[var(--v2-radius-control)] text-[var(--v2-fg-muted)] hover:bg-[var(--v2-panel-inset)]" aria-label="通知（未読 3 件）">
            <BellIcon className="h-[18px] w-[18px]" aria-hidden="true" />
            <span
              className="v2-tnum absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--v2-accent)] px-1 text-[10px] font-semibold text-white"
              aria-hidden="true"
            >
              3
            </span>
          </a>
        </header>

        <main id="v2-main" tabIndex={-1} className="flex-1 overflow-hidden outline-none">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
