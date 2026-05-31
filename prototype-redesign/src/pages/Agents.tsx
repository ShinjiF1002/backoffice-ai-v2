import { AGENT_LIST } from '@/data/mock-agent-list'
import type { AgentListRow } from '@/data/mock-agent-list'
import type { TrustLevel } from '@/data/types'
import { MetaChip } from '@/components/shared/MetaChip'
import { MiniTrend } from '@/components/shared/MiniTrend'
import { DataTable } from '@/components/shared/DataTable'
import type { DataTableColumn, DataTableFilter } from '@/components/shared/DataTable'
import { useAgents } from '@/store/hooks'
import { useView } from '@/context/view-context'
import { useListData } from '@/hooks/useListData'

/**
 * エージェント一覧 (Agents, /agents) — B 型 queue / AI 管理者
 * SSOT: screen-contracts-v2 §7 / screens-v2/07-agents。Phase 3 で共通 DataTable に載せ替え。
 * Trust は業務語 + Tier-2 英語併記、直近推移は CSS MiniTrend、row → Agent 詳細。自動化Lv + 昇格可否 filter。
 */
const TRUST_LABEL: Record<TrustLevel, string> = {
  supervised: '全件確認',
  checkpoint: '要所確認',
  autonomous: '自動',
  'n/a': '—',
}
const TRUST_EN: Record<TrustLevel, string> = {
  supervised: 'Supervised',
  checkpoint: 'Checkpoint',
  autonomous: 'Autonomous',
  'n/a': '',
}

/** list mock + store の昇格申請状態 / 緊急停止状態を join した view row。 */
type AgentViewRow = AgentListRow & { promotionRequested: boolean; paused: boolean }

const columns: DataTableColumn<AgentViewRow>[] = [
  { key: 'name', header: 'Agent', className: 'text-[var(--color-fg)]', cell: (r) => r.name, sortValue: (r) => r.name },
  { key: 'workflow', header: '業務', className: 'text-[var(--color-fg-muted)]', cell: (r) => r.workflow },
  {
    key: 'trust',
    header: '自動化レベル',
    cell: (r) => (
      <span className="inline-flex items-baseline gap-1.5">
        <MetaChip tone="primary" label={TRUST_LABEL[r.trust]} />
        <span className="font-mono text-[10px] text-[var(--color-fg-tertiary)]">{TRUST_EN[r.trust]}</span>
        {r.paused && <MetaChip tone="alert" label="緊急停止中" />}
      </span>
    ),
  },
  {
    key: 'rate',
    header: '直近 承認率',
    cell: (r) => (
      <span className="flex items-center gap-2">
        <MiniTrend values={r.trend} tone={r.promotable ? 'success' : 'primary'} />
        <span className="font-mono text-xs text-[var(--color-fg)]">{r.approvalRate}</span>
        <span className="text-[10px] text-[var(--color-fg-tertiary)]">[仮説/要検証]</span>
      </span>
    ),
  },
  {
    key: 'promotable',
    header: '昇格可否',
    cell: (r) =>
      r.promotionRequested ? (
        <MetaChip tone="primary" label="申請済" />
      ) : r.promotable ? (
        <MetaChip tone="success" label="昇格可" />
      ) : (
        <span className="flex items-center gap-1.5">
          <MetaChip tone="alert" label="保留" />
          <span className="text-[11px] text-[var(--color-fg-muted)]">{r.promoteNote}</span>
        </span>
      ),
  },
]

const filters: DataTableFilter<AgentViewRow>[] = [
  {
    id: 'trust',
    label: '自動化レベル',
    options: [...new Set(AGENT_LIST.map((r) => r.trust))].map((t) => ({ value: t, label: TRUST_LABEL[t] })),
    predicate: (r, v) => v.includes(r.trust),
  },
  {
    id: 'promotable',
    label: '昇格可否',
    options: [
      { value: 'yes', label: '昇格可' },
      { value: 'no', label: '保留' },
    ],
    predicate: (r, v) => v.includes(r.promotable ? 'yes' : 'no'),
  },
]

const AGENT_BY_ID = Object.fromEntries(AGENT_LIST.map((r) => [r.id, r]))

export function Agents() {
  const { process } = useView()
  const agents = useAgents(process)
  // store entity → list row view-model (trust / 昇格申請は store-truth で reactive)
  const rows: AgentViewRow[] = agents.flatMap((e) => {
    const base = AGENT_BY_ID[e.id]
    if (!base) return []
    return [{ ...base, trust: e.trust, promotionRequested: e.promotionStatus === 'requested', paused: e.paused }]
  })
  const list = useListData(rows)
  return (
    <div className="flex flex-col">
      <header
        data-page-header
        className="sticky top-0 z-30 flex min-h-[var(--height-pageheader)] flex-col justify-center border-b border-[var(--color-border)] bg-[var(--color-panel)] px-6 py-4"
      >
        <h1 className="text-lg font-semibold text-[var(--color-fg)]">Agent 設定 — エージェント一覧</h1>
        <p className="mt-1 text-xs text-[var(--color-fg-muted)]">業務別 AI Agent の自動化レベルと直近の実績 · {rows.length} 件</p>
      </header>

      <div className="p-4">
        <DataTable
          rows={list.rows}
          status={list.status}
          onRetry={list.onRetry}
          columns={columns}
          rowKey={(r) => r.id}
          rowHref={(r) => `/agents/${r.id}`}
          ariaLabel="エージェント一覧"
          filters={filters}
        />
      </div>
    </div>
  )
}
