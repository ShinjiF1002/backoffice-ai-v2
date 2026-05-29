import { useNavigate } from 'react-router-dom'
import { ChevronRightIcon } from 'lucide-react'
import { AGENT_LIST } from '@/data/mock-agent-list'
import type { TrustLevel } from '@/data/types'
import { MetaChip } from '@/components/shared/MetaChip'
import { MiniTrend } from '@/components/shared/MiniTrend'

/**
 * エージェント一覧 (Agents, /agents) — B 型 queue / AI 管理者
 * SSOT: screen-contracts-v2 §7 / screens-v2/07-agents。
 * Trust Level は業務語 + Tier-2 英語併記、直近推移は CSS MiniTrend (SVG なし)、row → Agent 詳細。
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

export function Agents() {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col">
      <header
        data-page-header
        className="sticky top-0 z-30 flex min-h-[var(--height-pageheader)] flex-col justify-center border-b border-[var(--color-border)] bg-[var(--color-panel)] px-6 py-4"
      >
        <h1 className="text-lg font-semibold text-[var(--color-fg)]">Agent 設定 — エージェント一覧</h1>
        <p className="mt-1 text-xs text-[var(--color-fg-muted)]">業務別 AI Agent の自動化レベルと直近の実績 · {AGENT_LIST.length} 件</p>
      </header>

      <div className="p-4">
        <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-panel)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-left text-xs text-[var(--color-fg-muted)]">
                <th className="px-4 py-2 font-medium">Agent</th>
                <th className="px-4 py-2 font-medium">業務</th>
                <th className="px-4 py-2 font-medium">自動化レベル</th>
                <th className="px-4 py-2 font-medium">直近 承認率</th>
                <th className="px-4 py-2 font-medium">昇格可否</th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody>
              {AGENT_LIST.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => navigate(`/agents/${row.id}`)}
                  className="cursor-pointer border-b border-[var(--color-border)] last:border-b-0 hover:bg-[var(--color-panel-inset)]"
                >
                  <td className="px-4 py-2.5 text-[var(--color-fg)]">{row.name}</td>
                  <td className="px-4 py-2.5 text-[var(--color-fg-muted)]">{row.workflow}</td>
                  <td className="px-4 py-2.5">
                    <span className="inline-flex items-baseline gap-1.5">
                      <MetaChip tone="primary" label={TRUST_LABEL[row.trust]} />
                      <span className="font-mono text-[10px] text-[var(--color-fg-subtle)]">{TRUST_EN[row.trust]}</span>
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="flex items-center gap-2">
                      <MiniTrend values={row.trend} tone={row.promotable ? 'success' : 'primary'} />
                      <span className="font-mono text-xs text-[var(--color-fg)]">{row.approvalRate}</span>
                      <span className="text-[10px] text-[var(--color-fg-subtle)]">[仮説/要検証]</span>
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    {row.promotable
                      ? <MetaChip tone="success" label="昇格可" />
                      : <span className="flex items-center gap-1.5"><MetaChip tone="alert" label="保留" /><span className="text-[11px] text-[var(--color-fg-muted)]">{row.promoteNote}</span></span>}
                  </td>
                  <td className="px-2 py-2.5 text-[var(--color-fg-subtle)]"><ChevronRightIcon className="h-4 w-4" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
