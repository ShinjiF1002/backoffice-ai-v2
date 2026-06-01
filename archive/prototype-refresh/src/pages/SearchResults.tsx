import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SearchIcon } from 'lucide-react'
import { DataTable } from '@/components/shared/DataTable'
import type { DataTableColumn, DataTableFilter } from '@/components/shared/DataTable'
import { MetaChip } from '@/components/shared/MetaChip'
import type { MetaTone } from '@/components/shared/MetaChip'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { useSearchResults } from '@/store/hooks'
import type { SearchResultItem } from '@/store/hooks'
import { useView } from '@/context/view-context'
import { useListData } from '@/hooks/useListData'

/**
 * 横断検索結果 (SearchResults, /search) — B 型 / 全 persona
 * SSOT: handoff-redesign/00-shared/remediation-roadmap §3.2 (P1-2)
 *
 * TopBar / ページ自前の検索 input (ViewContext searchQuery) を消費し、store-truth から案件/提案/Agent を横断検索。
 * 種別 chip + mono ID + row→各 detail。空クエリ (prompt) と zero-result (専用文言) を分離。
 */
const KIND_TONE: Record<SearchResultItem['kind'], MetaTone> = {
  case: 'primary',
  proposal: 'inset',
  agent: 'neutral',
}

const columns: DataTableColumn<SearchResultItem>[] = [
  // F-011: 種別 (kind) で sort 可能に (案件/提案/Agent をまとめて確認)。
  { key: 'kind', header: '種別', cell: (r) => <MetaChip tone={KIND_TONE[r.kind]} label={r.kindLabel} />, sortValue: (r) => r.kind },
  { key: 'id', header: 'ID', className: 'font-mono text-[13px] text-[var(--color-fg)]', cell: (r) => r.id, sortValue: (r) => r.id },
  { key: 'title', header: '名称', className: 'text-[var(--color-fg)]', cell: (r) => r.title },
  { key: 'subtitle', header: '詳細', className: 'text-[var(--color-fg-muted)]', cell: (r) => r.subtitle },
]

// F-011: 種別 (案件/提案/Agent) で絞り込み (横断検索の結果を種別で triage)。
const filters: DataTableFilter<SearchResultItem>[] = [
  {
    id: 'kind',
    label: '種別',
    options: [
      { value: 'case', label: '案件' },
      { value: 'proposal', label: '提案' },
      { value: 'agent', label: 'Agent' },
    ],
    predicate: (r, v) => v.includes(r.kind),
  },
]

export function SearchResults() {
  const { searchQuery, setSearchQuery } = useView()
  // F-010: 検索状態を URL ?q= に同期し deep-link / bookmark / 共有 / 戻る で再現可能にする (ephemeral 解消)。
  const [params, setParams] = useSearchParams()
  const urlQ = params.get('q') ?? ''
  // mount 時の双方向同期: URL に q があれば state へ復元、無ければ (cross-nav で来た) state を URL へ反映。
  useEffect(() => {
    if (urlQ && urlQ !== searchQuery) setSearchQuery(urlQ)
    else if (!urlQ && searchQuery) setParams({ q: searchQuery }, { replace: true })
    // mount once: URL ↔ state の初期整合のみ。以降は onSearchChange が両者を更新。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const onSearchChange = (v: string) => {
    setSearchQuery(v)
    setParams(v ? { q: v } : {}, { replace: true })
  }
  const q = searchQuery.trim()
  const results = useSearchResults(searchQuery)
  // F-009: 取得状態 (?demo=loading/error) を全 list route で一貫させる demo seam (クエリ有り時に発火)。
  const list = useListData(results)
  return (
    <div className="flex flex-col">
      <PageHeader
        title="横断検索"
        // F-046: 横断検索は ProcessSelector の業務 scope を無視する旨を明示 (「この業務だけ検索」の誤認防止)。
        subtitle={q ? `「${q}」の検索結果${!list.status ? ` ${results.length} 件` : ''} ・ 全業務横断（業務フィルタ非適用）` : '案件 ID・業務名・担当者・Agent を横断検索します（全業務横断・業務フィルタ非適用）'}
      >
        {/* ページ自前の検索 input — 狭幅 (TopBar input が出ない lg 未満) でも /search が自己完結する */}
        <div className="relative mt-2 max-w-md">
          <SearchIcon
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-fg-subtle)]"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="案件 ID・業務名・担当者・Agent 名"
            aria-label="横断検索"
            className="h-9 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-panel-inset)] pl-9 pr-3 text-sm text-[var(--color-fg)] placeholder:text-[var(--color-fg-tertiary)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
          />
        </div>
      </PageHeader>

      <div className="p-4">
        {!q ? (
          <EmptyState
            subState="truly-empty"
            title="検索語を入力してください"
            description="上の検索ボックスに案件 ID・業務名・担当者名・Agent 名を入力すると、ここに結果が表示されます。"
          />
        ) : (
          <DataTable
            rows={list.rows}
            status={list.status}
            onRetry={list.onRetry}
            columns={columns}
            rowKey={(r) => `${r.kind}:${r.id}`}
            rowHref={(r) => r.href}
            ariaLabel="検索結果"
            density
            filters={filters}
            emptyTitle={`「${q}」に一致する項目がありません`}
            emptyDescription="案件 ID・業務名・担当者名・Agent 名で再検索してください。"
            pageSize={10}
          />
        )}
      </div>
    </div>
  )
}
