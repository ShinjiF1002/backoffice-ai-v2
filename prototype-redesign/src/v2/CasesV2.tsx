import { useState } from 'react'
import { StarIcon } from 'lucide-react'
import { CASE_LIST } from '@/data/mock-case-list'
import type { CaseStatus } from '@/data/types'
import { PageHeader, StatusChip, CountChip, FilterChip } from './ui'

/**
 * CasesV2 — 案件キュー (list archetype)。Tier 3 高密度。
 * status→tone は SSOT 再利用。行は単一 hit-target (<a> grid row) で stretched-link/table 競合を回避。
 */

const FILTERS: { key: CaseStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'すべて' },
  { key: 'ready', label: '確認待ち' },
  { key: 'business-approval-waiting', label: '承認待ち' },
  { key: 'sent-back', label: '差戻し' },
  { key: 'pending', label: '受付済' },
  { key: 'reflected', label: '反映済' },
]

const COLS = 'grid grid-cols-[148px_1fr_116px_104px_92px_104px] items-center gap-3'

function elapsed(iso: string): string {
  // ISO "2026-05-30T16:40:00+09:00" → "05/30 16:40"
  return iso.slice(5, 16).replace('T', ' ').replace('-', '/')
}

export function CasesV2() {
  const [filter, setFilter] = useState<CaseStatus | 'all'>('all')
  const rows = filter === 'all' ? CASE_LIST : CASE_LIST.filter((r) => r.status === filter)
  const countFor = (k: CaseStatus | 'all') => (k === 'all' ? CASE_LIST.length : CASE_LIST.filter((r) => r.status === k).length)

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="案件キュー"
        sub={
          <>
            処理待ちの案件 — <span className="v2-tnum font-medium text-[var(--v2-fg)]">{CASE_LIST.length}</span> 件
          </>
        }
        actions={
          <button className="flex h-8 items-center gap-1.5 rounded-[var(--v2-radius-control)] border border-[var(--v2-border-strong)] bg-[var(--v2-panel)] px-3 text-[13px] font-medium text-[var(--v2-fg)] hover:bg-[var(--v2-panel-inset)]">
            起票
          </button>
        }
      />

      {/* filters */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[var(--v2-border)] bg-[var(--v2-panel)] px-6 py-2.5">
        {FILTERS.map((f) => (
          <FilterChip key={f.key} label={f.label} count={countFor(f.key)} active={filter === f.key} onClick={() => setFilter(f.key)} />
        ))}
      </div>

      {/* table */}
      <div className="flex-1 overflow-auto px-6 py-4">
        <div className="overflow-hidden rounded-[var(--v2-radius-card)] border border-[var(--v2-border)] bg-[var(--v2-panel)] shadow-[var(--v2-shadow-sm)]">
          {/* header */}
          <div className={`${COLS} border-b border-[var(--v2-border)] bg-[var(--v2-panel-inset)] px-4 py-2 text-[11px] font-medium uppercase tracking-wide text-[var(--v2-fg-tertiary)]`}>
            <span>案件ID</span>
            <span>業務</span>
            <span>状態</span>
            <span>担当者</span>
            <span>要確認</span>
            <span className="text-right">受付</span>
          </div>
          {/* rows */}
          <ul>
            {rows.map((r) => (
              <li key={r.id}>
                <a
                  href={'/v2/cases/' + r.id}
                  className={`${COLS} border-b border-[var(--v2-hairline)] px-4 py-2.5 text-[13px] transition-colors last:border-b-0 hover:bg-[var(--v2-panel-inset)]`}
                >
                  <span className="v2-mono flex items-center gap-1.5 font-medium text-[var(--v2-fg)]">
                    {r.recommended && <StarIcon className="h-3 w-3 flex-shrink-0 text-[var(--v2-accent-strong)]" aria-label="推奨" />}
                    {r.id}
                  </span>
                  <span className="truncate text-[var(--v2-fg)]">{r.workflow}</span>
                  <span>
                    <StatusChip status={r.status} />
                  </span>
                  <span className="truncate text-[var(--v2-fg-muted)]">{r.owner === '—' ? '未割当' : r.owner}</span>
                  <span>
                    <CountChip n={r.flags} />
                  </span>
                  <span className="v2-tnum text-right text-[var(--v2-fg-tertiary)]">{elapsed(r.receivedAt)}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
