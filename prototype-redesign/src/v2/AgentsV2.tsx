import { CheckIcon } from 'lucide-react'
import { AGENT_LIST } from '@/data/mock-agent-list'
import { useAgents } from '@/store/hooks'
import { useView } from '@/context/view-context'
import { trustTone, trustLevelLabel } from '@/lib/status-tones'
import { PageHeader, ToneChip } from './ui'
import { DataTable } from './DataTable'

/**
 * AgentsV2 — Agent 設定 (list、store 配線済)。業務を担当する AI Agent と信頼レベル。
 * trust は store-truth (useAgents、緊急停止で全件確認へ実降格が reactive に反映)、表示列 (name/workflow/approvalRate/promotable)
 * は list mock 由来。昇格申請/緊急停止/設定承認の操作は行 click → AgentDetailV2 (/agents/:id) に集約 (この画面は read-only)。
 */
export function AgentsV2() {
  const { process } = useView()
  const agents = useAgents(process)
  const rows = agents.flatMap((e) => {
    const base = AGENT_LIST.find((r) => r.id === e.id)
    return base ? [{ ...base, trust: e.trust, promotionStatus: e.promotionStatus, paused: e.paused }] : []
  })

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="Agent 設定"
        sub={
          <>
            業務を担当する AI Agent — <span className="v2-tnum font-medium text-[var(--v2-fg)]">{rows.length}</span> 件（信頼レベルは実績で昇格）
          </>
        }
      />
      <div className="flex-1 overflow-auto px-6 py-4">
        <DataTable
          gridCols="grid-cols-[1fr_150px_124px_88px_96px]"
          rows={rows}
          getKey={(r) => r.id}
          rowHref={(r) => '/agents/' + r.id}
          cols={[
            { label: 'Agent', render: (r) => <span className="truncate font-medium text-[var(--v2-fg)]">{r.name}</span> },
            { label: '業務', render: (r) => <span className="truncate text-[var(--v2-fg-muted)]">{r.workflow}</span> },
            { label: '信頼レベル', render: (r) => <ToneChip tone={trustTone(r.trust)} label={trustLevelLabel(r.trust)} /> },
            { label: '承認率', render: (r) => <span className="v2-tnum text-[var(--v2-fg)]">{r.approvalRate}</span> },
            {
              label: '昇格',
              // store-truth を優先: 停止中 / 承認済 / 申請済 を先に反映し、静的 promotable は未申請時のみ。
              render: (r) =>
                r.paused ? (
                  <span className="text-[12px] text-[var(--v2-alert-soft-fg)]">停止中</span>
                ) : r.promotionStatus === 'approved' ? (
                  <span className="text-[12px] text-[var(--v2-success-soft-fg)]">承認済</span>
                ) : r.promotionStatus === 'requested' ? (
                  <span className="text-[12px] text-[var(--v2-accent-soft-fg)]">申請済</span>
                ) : r.promotable ? (
                  <span className="inline-flex items-center gap-1 text-[12px] text-[var(--v2-success-soft-fg)]">
                    <CheckIcon className="h-3 w-3" aria-hidden="true" />可
                  </span>
                ) : (
                  <span className="text-[12px] text-[var(--v2-fg-tertiary)]">保留</span>
                ),
            },
          ]}
        />
      </div>
    </div>
  )
}
