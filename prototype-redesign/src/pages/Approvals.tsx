import { useNavigate } from 'react-router-dom'
import { ChevronRightIcon, PencilLineIcon, ShieldCheckIcon } from 'lucide-react'
import { APPROVAL_LIST } from '@/data/mock-approvals'
import { MetaChip } from '@/components/shared/MetaChip'

/**
 * 承認待ち (Approvals, /approvals) — B 型 queue / 承認者
 * SSOT: screen-contracts-v2 §3 / screens-v2/03-approvals。
 * row click → CaseDetail (承認者ビュー、?view=checker)。別担当者による確認 (承認者 ≠ 入力者) を明示。
 */
export function Approvals() {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col">
      <header
        data-page-header
        className="sticky top-0 z-30 flex min-h-[var(--height-pageheader)] flex-col justify-center border-b border-[var(--color-border)] bg-[var(--color-panel)] px-6 py-4"
      >
        <h1 className="text-lg font-semibold text-[var(--color-fg)]">承認待ち</h1>
        <p className="mt-1 text-xs text-[var(--color-fg-muted)]">入力者が確認済の案件を最終承認 · {APPROVAL_LIST.length} 件</p>
      </header>

      <div className="p-4">
        <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-panel)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-left text-xs text-[var(--color-fg-muted)]">
                <th className="px-4 py-2 font-medium">案件 ID</th>
                <th className="px-4 py-2 font-medium">業務</th>
                <th className="px-4 py-2 font-medium">入力者の判断</th>
                <th className="px-4 py-2 font-medium">担当 (入力者 → 承認者)</th>
                <th className="px-4 py-2 font-medium">経過</th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody>
              {APPROVAL_LIST.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => navigate(`/cases/${row.id}?view=checker`)}
                  className="cursor-pointer border-b border-[var(--color-border)] last:border-b-0 hover:bg-[var(--color-panel-inset)]"
                >
                  <td className="px-4 py-2.5 font-mono text-[13px] text-[var(--color-fg)]">{row.id}</td>
                  <td className="px-4 py-2.5 text-[var(--color-fg-muted)]">{row.workflow}</td>
                  <td className="px-4 py-2.5">
                    {row.judgement === 'modified'
                      ? <MetaChip tone="primary" label={`修正あり ${row.modifiedCount} 件`} />
                      : <MetaChip tone="success" label="確認のみ (修正なし)" />}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="flex items-center gap-1.5 text-xs text-[var(--color-fg-muted)]">
                      <ShieldCheckIcon className="h-3.5 w-3.5 text-[var(--color-success-soft-fg)]" aria-hidden="true" />
                      <strong className="text-[var(--color-fg)]">{row.inputter}</strong>
                      <ChevronRightIcon className="h-3 w-3" />
                      <strong className="text-[var(--color-fg)]">{row.approver}</strong>
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-[var(--color-fg-muted)]">{row.elapsed}</td>
                  <td className="px-2 py-2.5 text-[var(--color-fg-subtle)]"><ChevronRightIcon className="h-4 w-4" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 flex items-center gap-1 px-1 text-[10px] text-[var(--color-fg-subtle)]">
          {/* lucide icon — pencil-dot は使わない */}
          <PencilLineIcon className="h-3 w-3" aria-hidden="true" />
          「修正あり」は入力者が項目を上書き済。承認者は別担当者として最終確認します。
        </p>
      </div>
    </div>
  )
}
