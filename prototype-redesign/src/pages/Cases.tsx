import { useNavigate } from 'react-router-dom'
import { ChevronRightIcon } from 'lucide-react'
import { CASE_LIST } from '@/data/mock-case-list'
import { caseStatusToTone, caseStatusLabel } from '@/lib/status-tones'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { MetaChip } from '@/components/shared/MetaChip'
import { cn } from '@/lib/cn'

/**
 * 案件一覧 (Cases, /cases) — B 型 queue / 入力者
 * SSOT: screen-contracts-v2 §2 / screens-v2/02-cases。row click → CaseDetail (入力者ビュー)。
 * confidence 生数字なし、status は resolver 経由 (業務語)、要確認サマリは MetaChip。
 */
function AttentionCell({ status, flags }: { status: string; flags: number }) {
  if (status === 'pending') return <span className="text-xs text-[var(--color-fg-subtle)]">AI 処理待ち</span>
  if (status === 'sent-back') return <span className="text-xs text-[var(--color-fg-subtle)]">AI 再処理中</span>
  if (status === 'reflected') return <span className="text-xs text-[var(--color-success-soft-fg)]">完了</span>
  if (flags > 0) return <MetaChip tone="alert" label={`要確認 ${flags} 項目`} />
  return <MetaChip tone="success" label="全項目一致" />
}

export function Cases() {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col">
      <header
        data-page-header
        className="sticky top-0 z-30 flex min-h-[var(--height-pageheader)] flex-col justify-center border-b border-[var(--color-border)] bg-[var(--color-panel)] px-6 py-4"
      >
        <h1 className="text-lg font-semibold text-[var(--color-fg)]">受信トレイ — 案件一覧</h1>
        <p className="mt-1 text-xs text-[var(--color-fg-muted)]">法人住所変更 · {CASE_LIST.length} 件 ／ 行を選んで案件を確認</p>
      </header>

      <div className="p-4">
        <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-panel)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-left text-xs text-[var(--color-fg-muted)]">
                <th className="px-4 py-2 font-medium">案件 ID</th>
                <th className="px-4 py-2 font-medium">業務</th>
                <th className="px-4 py-2 font-medium">状態</th>
                <th className="px-4 py-2 font-medium">経過</th>
                <th className="px-4 py-2 font-medium">担当</th>
                <th className="px-4 py-2 font-medium">確認</th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody>
              {CASE_LIST.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => navigate(`/cases/${row.id}`)}
                  className={cn(
                    'cursor-pointer border-b border-[var(--color-border)] last:border-b-0 hover:bg-[var(--color-panel-inset)]',
                    row.recommended && 'bg-[var(--color-alert-soft)]'
                  )}
                >
                  <td className="px-4 py-2.5 font-mono text-[13px] text-[var(--color-fg)]">{row.id}</td>
                  <td className="px-4 py-2.5 text-[var(--color-fg-muted)]">{row.workflow}</td>
                  <td className="px-4 py-2.5"><StatusBadge tone={caseStatusToTone(row.status)} label={caseStatusLabel(row.status)} /></td>
                  <td className="px-4 py-2.5 text-[var(--color-fg-muted)]">{row.elapsed}</td>
                  <td className="px-4 py-2.5 text-[var(--color-fg)]">{row.owner}</td>
                  <td className="px-4 py-2.5"><AttentionCell status={row.status} flags={row.flags} /></td>
                  <td className="px-2 py-2.5 text-[var(--color-fg-subtle)]"><ChevronRightIcon className="h-4 w-4" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 px-1 text-[10px] text-[var(--color-fg-subtle)]">要確認のある案件を上部に強調表示しています。</p>
      </div>
    </div>
  )
}
