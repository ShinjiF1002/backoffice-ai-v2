import { ChevronRightIcon, ShieldCheckIcon, PencilLineIcon, CheckIcon, AlertTriangleIcon } from 'lucide-react'
import { useApprovals, useStoreDispatch, useCurrentActor } from '@/store/hooks'
import { roleLabel } from '@/store/actors'
import { Toast } from '@/components/shared/Toast'
import { useToast } from '@/hooks/useToast'
import { PageHeader } from '@/components/shared/PageHeader'
import { useView } from '@/context/view-context'
import { useListData } from '@/hooks/useListData'
import { caseElapsedLabel } from '@/lib/dates'
import { CASE_DETAILS } from '@/data/mock-case-detail'
import { resolveCaseActors } from '@/store/selectors'
import { MetaChip } from '@/components/shared/MetaChip'
import { DataTable } from '@/components/shared/DataTable'
import type { DataTableColumn, DataTableFilter } from '@/components/shared/DataTable'

/**
 * 承認待ち (Approvals, /approvals) — B 型 queue / 承認者
 * SSOT: screen-contracts-v2 §3 / screens-v2/03-approvals。Phase 4b で store-truth 化。
 * rows は useApprovals() (business-approval-waiting) 由来。承認すると queue から消える (D1/D9)。
 * inputter/approver は detail dict から join、modifiedCount は store の resolvedFieldIds.length 由来
 * (この端末での修正件数。過去履歴の事実ではない、R3)。一括承認は case/bulkApprove(by:checker)。
 */
interface ApprovalViewRow {
  id: string
  workflow: string
  inputter: string
  approver: string
  /** この端末で確定/上書きした項目数 (resolvedFieldIds.length) */
  modifiedCount: number
  /** 残要確認 (business-approval-waiting は通常 0、一括承認 gate 用) */
  flags: number
  /** 入力者承認した actorId (B4 SoD: 一括承認で自己承認案件を skip する判定材料)。 */
  inputApprovedBy?: string
  elapsed: string
  /** 経過列の数値 sort 基準 (F-011、整形済 elapsed 文字列では時系列 sort 不能)。 */
  receivedAt: string
}

const columns: DataTableColumn<ApprovalViewRow>[] = [
  { key: 'id', header: '案件 ID', className: 'font-mono text-[13px] text-[var(--color-fg)]', cell: (r) => r.id, sortValue: (r) => r.id },
  { key: 'workflow', header: '業務', className: 'text-[var(--color-fg-muted)]', cell: (r) => r.workflow },
  {
    key: 'modified',
    header: '入力者の確認',
    // F-011: 修正件数で sort 可能に (この端末で多く手を入れた案件を確認上位へ)。
    sortValue: (r) => r.modifiedCount,
    cell: (r) =>
      r.modifiedCount > 0 ? (
        <MetaChip tone="primary" label={`この端末で修正済 ${r.modifiedCount} 件`} />
      ) : (
        <MetaChip tone="success" label="修正なし" />
      ),
  },
  {
    key: 'assignee',
    header: '担当 (入力者 → 承認者)',
    // F-011: 入力者で sort 可能に (担当者別の triage)。
    sortValue: (r) => r.inputter,
    cell: (r) => (
      <span className="flex items-center gap-1.5 text-xs text-[var(--color-fg-muted)]">
        <ShieldCheckIcon className="h-3.5 w-3.5 text-[var(--color-success-soft-fg)]" aria-hidden="true" />
        <strong className="text-[var(--color-fg)]">{r.inputter}</strong>
        <ChevronRightIcon className="h-3 w-3" />
        <strong className="text-[var(--color-fg)]">{r.approver}</strong>
      </span>
    ),
  },
  // F-011: 経過(滞留)で triage できるよう receivedAt を数値 sortValue に (整形済文字列では時系列 sort 不能)。
  { key: 'elapsed', header: '経過', className: 'text-[var(--color-fg-muted)]', cell: (r) => r.elapsed, sortValue: (r) => new Date(r.receivedAt).getTime() },
]

export function Approvals() {
  const { process } = useView()
  const approvals = useApprovals(process)
  const dispatch = useStoreDispatch()
  const actor = useCurrentActor()
  const { toast, show: showToast, dismiss } = useToast()
  // store entity → view row。入力者/承認者は actor SSOT (resolveCaseActors、F-001) で解決し
  // CaseDetail/Observatory と同一 identity にする (一覧 owner は assignee で入力者承認 actor とは別)。修正件数は resolvedFieldIds 由来 (R3)。
  const rows: ApprovalViewRow[] = approvals.map((e) => {
    const { inputterName, approverName } = resolveCaseActors(e, CASE_DETAILS[e.id])
    return {
      id: e.id,
      workflow: e.workflowName,
      inputter: inputterName,
      approver: approverName,
      modifiedCount: e.resolvedFieldIds.length,
      flags: e.flags,
      inputApprovedBy: e.inputApprovedBy,
      elapsed: caseElapsedLabel(e.receivedAt, e.status),
      receivedAt: e.receivedAt,
    }
  })
  const list = useListData(rows)
  // F-025: action を押す前に権限可否を提示。最終承認は承認者/業務責任者の操作 + 自分が入力者承認した案件は四眼原則で承認不可。
  //   現操作者が入力者、または可視行すべてを自分が入力者承認している (= 押しても全件 skip) 場合は事前 inline hint を出す。
  const blocksAll = !list.status && rows.length > 0 && rows.every((r) => r.inputApprovedBy !== undefined && r.inputApprovedBy === actor?.id)
  const showPermissionHint = actor?.role === 'inputter' || blocksAll
  const inputters = [...new Set(rows.map((r) => r.inputter))]
  const filters: DataTableFilter<ApprovalViewRow>[] = [
    { id: 'inputter', label: '入力者', options: inputters.map((i) => ({ value: i, label: i })), predicate: (r, v) => v.includes(r.inputter) },
  ]

  return (
    <div className="flex flex-col">
      <PageHeader title="承認待ち" subtitle={<>入力者が確認済の案件を最終承認{!list.status && ` · ${rows.length} 件`}</>}>
        {showPermissionHint && (
          // F-025: 操作前の権限提示 (事後 toast でなく inline)。入力者は最終承認できず、自己承認は四眼原則で不可。
          <p className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[var(--color-alert-soft-fg)]">
            <AlertTriangleIcon className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
            現在の操作者は「{actor ? roleLabel(actor.role) : '—'}」です。最終承認は承認者の操作で、自分が入力者承認した案件は承認できません（四眼原則）。右上で承認者に切替えてください。
          </p>
        )}
      </PageHeader>

      <div className="p-4">
        <DataTable
          rows={list.rows}
          status={list.status}
          onRetry={list.onRetry}
          columns={columns}
          rowKey={(r) => r.id}
          // F-045: mode は persona role が SSOT (F-001) ゆえ ?view=checker は無効な歴史的 query。URL を統制ロジックと一致させ除去。
          rowHref={(r) => `/cases/${r.id}`}
          ariaLabel="承認待ち"
          filters={filters}
          // 一括承認 = case/bulkApprove(by:checker)。要確認残 (flags>0) があれば一括不可。
          // SoD: 自分が入力者承認した案件は reducer が四眼原則で skip → 承認/スキップ件数を toast で可視化 (B4)。
          selection={{
            actions: [
              {
                label: '一括承認',
                icon: <CheckIcon className="h-3 w-3" aria-hidden="true" />,
                onRun: (ids) => {
                  const selected = rows.filter((r) => ids.includes(r.id))
                  const skipped = selected.filter((r) => r.inputApprovedBy !== undefined && r.inputApprovedBy === actor?.id).length
                  dispatch({ type: 'case/bulkApprove', ids, by: 'checker' })
                  const approved = selected.length - skipped
                  // F-027: SoD skip>0 は統制重要 — alert tone + sticky で見落とさせない (後追いは監査台帳)。
                  if (skipped > 0) {
                    showToast(`${approved} 件を最終承認しました（自己承認 ${skipped} 件は四眼原則によりスキップ — 承認者に切替えてください）`, { tone: 'alert', sticky: true })
                  } else {
                    showToast(`${approved} 件を最終承認しました`)
                  }
                },
                // F-025: 操作前に無効化 — 要確認残あり、または選択がすべて自己承認 (押しても全件 skip の no-op) なら disabled + 理由。
                disabled: (selectedRows) =>
                  selectedRows.some((r) => r.flags > 0) ||
                  (selectedRows.length > 0 && selectedRows.every((r) => r.inputApprovedBy !== undefined && r.inputApprovedBy === actor?.id)),
                disabledReason: (selectedRows) =>
                  selectedRows.some((r) => r.flags > 0)
                    ? '要確認の残る案件は一括承認できません'
                    : '選択した案件はすべて自分が入力者承認したため承認できません（四眼原則）。承認者に切替えてください。',
              },
            ],
          }}
          caption={
            <span className="flex items-center gap-1">
              <PencilLineIcon className="h-3 w-3" aria-hidden="true" />
              「修正済」は入力者がこの端末で項目を上書きした件数です。承認者は別担当者として最終確認します。
            </span>
          }
        />
      </div>

      <Toast toast={toast} onDismiss={dismiss} />
    </div>
  )
}
