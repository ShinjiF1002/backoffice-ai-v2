import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SearchIcon, InboxIcon, SparklesIcon, BotIcon, ChevronRightIcon } from 'lucide-react'
import { useSearchResults } from '@/store/hooks'
import type { SearchResultItem } from '@/store/hooks'
import { useView } from '@/context/view-context'
import { PageHeader, Card } from './ui'

/**
 * SearchV2 — 横断検索 (list、store 配線済)。案件 / 提案 / Agent を 1 query で横断 retrieval。
 * query 源は ViewContext.searchQuery (TopBar 検索と共有 SSOT) + URL ?q= 双方向同期 (deep-link)。結果は kind 別 group。
 * v1 SearchResults の「台帳」kind は store selector に無いため drop (v1=正)。row → 各 detail (r.href)。
 */
const KIND_ICON: Record<SearchResultItem['kind'], typeof InboxIcon> = {
  case: InboxIcon,
  proposal: SparklesIcon,
  agent: BotIcon,
}
const KIND_ORDER: SearchResultItem['kind'][] = ['case', 'proposal', 'agent']

export function SearchV2() {
  const { searchQuery, setSearchQuery } = useView()
  const [params, setParams] = useSearchParams()
  const urlQ = params.get('q') ?? ''
  // mount once: URL ?q= ↔ ViewContext searchQuery の初期整合 (deep-link 復元 / cross-nav 反映)。
  useEffect(() => {
    if (urlQ && urlQ !== searchQuery) setSearchQuery(urlQ)
    else if (!urlQ && searchQuery) setParams({ q: searchQuery }, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const onSearchChange = (v: string) => {
    setSearchQuery(v)
    setParams(v ? { q: v } : {}, { replace: true })
  }
  const q = searchQuery.trim()
  const results = useSearchResults(searchQuery)
  const groups = KIND_ORDER.map((kind) => ({
    kind,
    label: results.find((r) => r.kind === kind)?.kindLabel ?? kind,
    items: results.filter((r) => r.kind === kind),
  })).filter((g) => g.items.length > 0)

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="横断検索" sub={<>案件・提案・Agent を横断（全業務横断）</>} />
      <div className="mx-auto w-full max-w-[860px] flex-1 overflow-auto px-6 py-4">
        {/* query */}
        <div className="flex h-10 items-center gap-2 rounded-[var(--v2-radius-control)] border border-[var(--v2-border-strong)] bg-[var(--v2-panel)] px-3">
          <SearchIcon className="h-4 w-4 flex-shrink-0 text-[var(--v2-fg-muted)]" aria-hidden="true" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="横断検索"
            placeholder="案件 ID・業務名・担当者・Agent 名"
            className="w-full bg-transparent text-[14px] text-[var(--v2-fg)] placeholder:text-[var(--v2-fg-subtle)] focus:outline-none"
          />
        </div>

        {!q ? (
          <div className="mt-10 text-center">
            <div className="text-[13px] text-[var(--v2-fg-muted)]">検索語を入力してください</div>
            <div className="mt-1 text-[12px] text-[var(--v2-fg-tertiary)]">案件 ID・業務名・担当者名・Agent 名で横断検索します。</div>
          </div>
        ) : results.length === 0 ? (
          <div className="mt-10 text-center text-[13px] text-[var(--v2-fg-muted)]">「{q}」に一致する項目がありません。</div>
        ) : (
          <>
            <div className="v2-tnum mt-2 text-[12px] text-[var(--v2-fg-tertiary)]">
              「{q}」の検索結果 {results.length} 件 ・ 全業務横断（業務フィルタ非適用）
            </div>
            <div className="mt-4 flex flex-col gap-4">
              {groups.map((g) => {
                const Icon = KIND_ICON[g.kind]
                return (
                  <section key={g.kind}>
                    <div className="mb-1.5 flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wide text-[var(--v2-fg-tertiary)]">
                      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                      {g.label}
                      <span className="v2-tnum font-normal">{g.items.length}</span>
                    </div>
                    <Card className="overflow-hidden">
                      <ul>
                        {g.items.map((it) => (
                          <li key={it.kind + ':' + it.id}>
                            <a
                              href={it.href}
                              className="flex items-center justify-between gap-3 border-b border-[var(--v2-hairline)] px-4 py-2.5 transition-colors last:border-b-0 hover:bg-[var(--v2-panel-inset)]"
                            >
                              <span className="min-w-0">
                                <span className="block truncate text-[13px] font-medium text-[var(--v2-fg)]">{it.title}</span>
                                <span className="mt-0.5 flex items-center gap-1.5 truncate text-[12px] text-[var(--v2-fg-muted)]">
                                  <span className="v2-mono flex-shrink-0 text-[var(--v2-fg-tertiary)]">{it.id}</span>
                                  <span className="truncate">{it.subtitle}</span>
                                </span>
                              </span>
                              <ChevronRightIcon className="h-4 w-4 flex-shrink-0 text-[var(--v2-fg-subtle)]" aria-hidden="true" />
                            </a>
                          </li>
                        ))}
                      </ul>
                    </Card>
                  </section>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
