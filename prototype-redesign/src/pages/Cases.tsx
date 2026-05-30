import { CASE_LIST } from '@/data/mock-case-list'
import type { CaseListRow } from '@/data/mock-case-list'
import type { CaseStatus } from '@/data/types'
import { caseStatusToTone, caseStatusLabel } from '@/lib/status-tones'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { MetaChip } from '@/components/shared/MetaChip'
import { DataTable } from '@/components/shared/DataTable'
import type { DataTableColumn, DataTableFilter } from '@/components/shared/DataTable'
import { useCases } from '@/store/hooks'
import { useView } from '@/context/view-context'
import { KPI_PROCESS_LABEL } from '@/data/mock-kpi'
import { useListData } from '@/hooks/useListData'

/**
 * 案件一覧 (Cases, /cases) — B 型 queue / 入力者
 * SSOT: screen-contracts-v2 §2 / screens-v2/02-cases。Phase 3 で共通 DataTable に載せ替え。
 * row → CaseDetail (入力者ビュー)。confidence 生数字なし、status は resolver 経由、要確認は MetaChip。
 * 状態 + 担当 filter / 列 sort / pagination / 要確認上部固定 (recommended)。
 */
function AttentionCell({ status, flags }: { status: string; flags: number }) {
  if (status === 'pending') return <span className="text-xs text-[var(--color-fg-tertiary)]">AI 処理待ち</span>
  if (status === 'sent-back') return <span className="text-xs text-[var(--color-fg-tertiary)]">AI 再処理中</span>
  if (status === 'reflected') return <span className="text-xs text-[var(--color-success-soft-fg)]">完了</span>
  if (flags > 0) return <MetaChip tone="alert" label={`要確認 ${flags} 項目`} />
  return <MetaChip tone="success" label="全項目一致" />
}

const STATUS_VALUES: CaseStatus[] = ['pending', 'ready', 'sent-back', 'business-approval-waiting', 'reflected']
const OWNER_VALUES = [...new Set(CASE_LIST.map((r) => r.owner))]

const columns: DataTableColumn<CaseListRow>[] = [
  { key: 'id', header: '案件 ID', className: 'font-mono text-[13px] text-[var(--color-fg)]', cell: (r) => r.id, sortValue: (r) => r.id },
  { key: 'workflow', header: '業務', className: 'text-[var(--color-fg-muted)]', cell: (r) => r.workflow },
  {
    key: 'status',
    header: '状態',
    cell: (r) => <StatusBadge tone={caseStatusToTone(r.status)} label={caseStatusLabel(r.status)} />,
    sortValue: (r) => r.status,
  },
  { key: 'elapsed', header: '経過', className: 'text-[var(--color-fg-muted)]', cell: (r) => r.elapsed },
  {
    key: 'owner',
    header: '担当',
    className: 'text-[var(--color-fg)]',
    cell: (r) => (r.owner === '—' ? <span className="text-[var(--color-fg-tertiary)]">未割当</span> : r.owner),
  },
  { key: 'attention', header: '確認', cell: (r) => <AttentionCell status={r.status} flags={r.flags} /> },
]

const filters: DataTableFilter<CaseListRow>[] = [
  {
    id: 'status',
    label: '状態',
    options: STATUS_VALUES.map((s) => ({ value: s, label: caseStatusLabel(s) })),
    predicate: (r, v) => v.includes(r.status),
  },
  {
    id: 'owner',
    label: '担当',
    options: OWNER_VALUES.map((o) => ({ value: o, label: o === '—' ? '未割当' : o })),
    predicate: (r, v) => v.includes(r.owner),
  },
]

export function Cases() {
  const { process } = useView()
  const cases = useCases(process)
  const processLabel = process === 'all' ? '全業務' : (KPI_PROCESS_LABEL[process] ?? '全業務')
  // store entity → list row view-model (status/flags/assignee は store-truth で reactive)
  const rows: CaseListRow[] = cases.map((e) => ({
    id: e.id,
    workflow: e.workflowName,
    status: e.status,
    elapsed: e.elapsedLabel,
    owner: e.assignee ?? '—',
    flags: e.flags,
  }))
  const list = useListData(rows)
  return (
    <div className="flex flex-col">
      <header
        data-page-header
        className="sticky top-0 z-30 flex min-h-[var(--height-pageheader)] flex-col justify-center border-b border-[var(--color-border)] bg-[var(--color-panel)] px-6 py-4"
      >
        <h1 className="text-lg font-semibold text-[var(--color-fg)]">受信トレイ — 案件一覧</h1>
        <p className="mt-1 text-xs text-[var(--color-fg-muted)]">{processLabel} · {rows.length} 件 ／ 行を選んで案件を確認</p>
      </header>

      <div className="p-4">
        <DataTable
          rows={list.rows}
          status={list.status}
          onRetry={list.onRetry}
          columns={columns}
          rowKey={(r) => r.id}
          rowHref={(r) => `/cases/${r.id}`}
          ariaLabel="案件一覧"
          pinTop={(r) => r.flags > 0}
          rowClassName={(r) => (r.flags > 0 ? 'bg-[var(--color-alert-soft)]' : undefined)}
          filters={filters}
          pageSize={10}
          caption="要確認のある案件を上部に強調表示しています。"
        />
      </div>
    </div>
  )
}
