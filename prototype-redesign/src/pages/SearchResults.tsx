import { SearchIcon } from 'lucide-react'
import { DataTable } from '@/components/shared/DataTable'
import type { DataTableColumn } from '@/components/shared/DataTable'
import { MetaChip } from '@/components/shared/MetaChip'
import type { MetaTone } from '@/components/shared/MetaChip'
import { EmptyState } from '@/components/shared/EmptyState'
import { useSearchResults } from '@/store/hooks'
import type { SearchResultItem } from '@/store/hooks'
import { useView } from '@/context/view-context'

/**
 * 横断検索結果 (SearchResults, /search) — B 型 / 全 persona
 * SSOT: handoff-redesign/00-shared/remediation-roadmap §3.2 (P1-2)
 *
 * TopBar 検索 input (ViewContext searchQuery) を消費し、store-truth から案件/提案/Agent を横断検索。
 * 種別 chip + mono ID + row→各 detail。空クエリ (prompt) と zero-result (専用文言) を分離。
 */
const KIND_TONE: Record<SearchResultItem['kind'], MetaTone> = {
  case: 'primary',
  proposal: 'inset',
  agent: 'neutral',
}

const columns: DataTableColumn<SearchResultItem>[] = [
  { key: 'kind', header: '種別', cell: (r) => <MetaChip tone={KIND_TONE[r.kind]} label={r.kindLabel} /> },
  { key: 'id', header: 'ID', className: 'font-mono text-[13px] text-[var(--color-fg)]', cell: (r) => r.id, sortValue: (r) => r.id },
  { key: 'title', header: '名称', className: 'text-[var(--color-fg)]', cell: (r) => r.title },
  { key: 'subtitle', header: '詳細', className: 'text-[var(--color-fg-muted)]', cell: (r) => r.subtitle },
]

export function SearchResults() {
  const { searchQuery, setSearchQuery } = useView()
  const q = searchQuery.trim()
  const results = useSearchResults(searchQuery)
  return (
    <div className="flex flex-col">
      <header
        data-page-header
        className="sticky top-0 z-30 flex min-h-[var(--height-pageheader)] flex-col justify-center border-b border-[var(--color-border)] bg-[var(--color-panel)] px-6 py-4"
      >
        <h1 className="text-lg font-semibold text-[var(--color-fg)]">横断検索</h1>
        <p className="mt-1 text-xs text-[var(--color-fg-muted)]">
          {q ? `「${q}」の検索結果 ${results.length} 件` : '案件 ID・業務名・担当者・Agent を横断検索します'}
        </p>
        {/* ページ自前の検索 input — 狭幅 (TopBar input が出ない lg 未満) でも /search が自己完結する */}
        <div className="relative mt-3 max-w-md">
          <SearchIcon
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-fg-subtle)]"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="案件 ID・業務名・担当者・Agent 名"
            aria-label="横断検索"
            className="h-9 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-panel-inset)] pl-9 pr-3 text-sm text-[var(--color-fg)] placeholder:text-[var(--color-fg-tertiary)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
          />
        </div>
      </header>

      <div className="p-4">
        {!q ? (
          <EmptyState
            subState="truly-empty"
            title="検索語を入力してください"
            description="TopBar の検索ボックスに案件 ID・業務名・担当者名・Agent 名を入力すると、ここに結果が表示されます。"
          />
        ) : (
          <DataTable
            rows={results}
            columns={columns}
            rowKey={(r) => `${r.kind}:${r.id}`}
            rowHref={(r) => r.href}
            ariaLabel="検索結果"
            emptyTitle={`「${q}」に一致する項目がありません`}
            emptyDescription="案件 ID・業務名・担当者名・Agent 名で再検索してください。"
            pageSize={10}
          />
        )}
      </div>
    </div>
  )
}
