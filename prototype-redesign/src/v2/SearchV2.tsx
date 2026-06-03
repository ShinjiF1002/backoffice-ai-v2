import { SearchIcon, InboxIcon, SparklesIcon, BotIcon, ActivityIcon, ChevronRightIcon } from 'lucide-react'
import { PageHeader, Card } from './ui'

/**
 * SearchV2 — 横断検索 (list)。案件 / 提案 / Agent / 台帳 を 1 query で横断 retrieval。
 * Cmd+K (transient jump) と分離し、durable な faceted retrieval を担う。
 */
const GROUPS = [
  {
    label: '案件',
    icon: InboxIcon,
    href: '/v2/cases/CASE-2026-0142',
    items: [
      { id: 'CASE-2026-0142', sub: '法人住所変更 · 確認待ち' },
      { id: 'CASE-2026-0145', sub: '法人住所変更 · 確認待ち' },
    ],
  },
  { label: '提案', icon: SparklesIcon, href: '/v2/proposals', items: [{ id: 'PROP-2026-031', sub: '住所読み取りの判定基準を調整' }] },
  { label: 'Agent', icon: BotIcon, href: '/v2/agents', items: [{ id: '法人住所変更 Agent', sub: '全件確認 · 承認率 92%' }] },
  { label: '台帳', icon: ActivityIcon, href: '/v2/observatory', items: [{ id: 'CASE-2026-0142 監査台帳', sub: '5 イベント · 承認 A-7731' }] },
]

export function SearchV2() {
  const total = GROUPS.reduce((n, g) => n + g.items.length, 0)
  return (
    <div className="flex h-full flex-col">
      <PageHeader title="横断検索" sub={<>案件・提案・Agent・台帳を横断</>} />
      <div className="mx-auto w-full max-w-[860px] flex-1 overflow-auto px-6 py-4">
        {/* query */}
        <div className="flex h-10 items-center gap-2 rounded-[var(--v2-radius-control)] border border-[var(--v2-border-strong)] bg-[var(--v2-panel)] px-3">
          <SearchIcon className="h-4 w-4 flex-shrink-0 text-[var(--v2-fg-muted)]" aria-hidden="true" />
          <input
            defaultValue="丸の内"
            aria-label="横断検索"
            className="w-full bg-transparent text-[14px] text-[var(--v2-fg)] focus:outline-none"
          />
        </div>
        <div className="mt-2 text-[12px] text-[var(--v2-fg-tertiary)]">
          「丸の内」の検索結果 — <span className="v2-tnum">{total}</span> 件
        </div>

        <div className="mt-4 flex flex-col gap-4">
          {GROUPS.map((g) => (
            <section key={g.label}>
              <div className="mb-1.5 flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wide text-[var(--v2-fg-tertiary)]">
                <g.icon className="h-3.5 w-3.5" aria-hidden="true" />
                {g.label}
                <span className="v2-tnum font-normal">{g.items.length}</span>
              </div>
              <Card className="overflow-hidden">
                <ul>
                  {g.items.map((it) => (
                    <li key={it.id}>
                      <a
                        href={g.href}
                        className="flex items-center justify-between gap-3 border-b border-[var(--v2-hairline)] px-4 py-2.5 transition-colors last:border-b-0 hover:bg-[var(--v2-panel-inset)]"
                      >
                        <span className="min-w-0">
                          <span className="v2-mono block truncate text-[13px] font-medium text-[var(--v2-fg)]">{it.id}</span>
                          <span className="block truncate text-[12px] text-[var(--v2-fg-muted)]">{it.sub}</span>
                        </span>
                        <ChevronRightIcon className="h-4 w-4 flex-shrink-0 text-[var(--v2-fg-subtle)]" aria-hidden="true" />
                      </a>
                    </li>
                  ))}
                </ul>
              </Card>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
