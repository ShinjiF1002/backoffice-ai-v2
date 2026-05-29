import { useNavigate } from 'react-router-dom'
import { ChevronRightIcon } from 'lucide-react'
import { PROPOSAL_LIST } from '@/data/mock-proposal-list'
import { proposalStatusToTone, proposalStatusLabel } from '@/lib/status-tones'
import { StatusBadge } from '@/components/shared/StatusBadge'

/**
 * 提案一覧 (Proposals, /proposals) — B 型 queue / Manual 管理者
 * SSOT: screen-contracts-v2 §5 / screens-v2/05-proposals。
 * 「日次提案分析」表記 (cron/trigger なし)、status resolver 経由、row → 提案詳細。
 */
export function Proposals() {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col">
      <header
        data-page-header
        className="sticky top-0 z-30 flex min-h-[var(--height-pageheader)] flex-col justify-center border-b border-[var(--color-border)] bg-[var(--color-panel)] px-6 py-4"
      >
        <h1 className="text-lg font-semibold text-[var(--color-fg)]">AI 提案レビュー — 提案一覧</h1>
        <p className="mt-1 text-xs text-[var(--color-fg-muted)]">日次提案分析が差戻しパターンから生成した手順改定の候補 · {PROPOSAL_LIST.length} 件</p>
      </header>

      <div className="p-4">
        <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-panel)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-left text-xs text-[var(--color-fg-muted)]">
                <th className="px-4 py-2 font-medium">提案 ID</th>
                <th className="px-4 py-2 font-medium">業務</th>
                <th className="px-4 py-2 font-medium">どの部分の改定か</th>
                <th className="px-4 py-2 font-medium">影響件数</th>
                <th className="px-4 py-2 font-medium">状態</th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody>
              {PROPOSAL_LIST.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => navigate(`/proposals/${row.id}`)}
                  className="cursor-pointer border-b border-[var(--color-border)] last:border-b-0 hover:bg-[var(--color-panel-inset)]"
                >
                  <td className="px-4 py-2.5 font-mono text-[13px] text-[var(--color-fg)]">{row.id}</td>
                  <td className="px-4 py-2.5 text-[var(--color-fg-muted)]">{row.workflow}</td>
                  <td className="px-4 py-2.5 text-[var(--color-fg)]">{row.changeArea}</td>
                  <td className="px-4 py-2.5 text-[var(--color-fg-muted)]">過去 {row.impactCount} 件相当</td>
                  <td className="px-4 py-2.5"><StatusBadge tone={proposalStatusToTone(row.status)} label={proposalStatusLabel(row.status)} /></td>
                  <td className="px-2 py-2.5 text-[var(--color-fg-subtle)]"><ChevronRightIcon className="h-4 w-4" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 px-1 text-[10px] text-[var(--color-fg-subtle)]">毎日の差戻し分析から自動生成された改定候補です。承認すると正式手順に反映されます。</p>
      </div>
    </div>
  )
}
