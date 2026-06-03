import { CheckIcon } from 'lucide-react'
import { AGENT_LIST } from '@/data/mock-agent-list'
import { trustTone, trustLevelLabel } from '@/lib/status-tones'
import { PageHeader, ToneChip } from './ui'
import { DataTable } from './DataTable'

/** AgentsV2 — Agent 設定 (list)。業務を担当する AI Agent と信頼レベル。 */
export function AgentsV2() {
  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="Agent 設定"
        sub={
          <>
            業務を担当する AI Agent — <span className="v2-tnum font-medium text-[var(--v2-fg)]">{AGENT_LIST.length}</span> 件（信頼レベルは実績で昇格）
          </>
        }
      />
      <div className="flex-1 overflow-auto px-6 py-4">
        <DataTable
          gridCols="grid-cols-[1fr_150px_124px_88px_96px]"
          rows={AGENT_LIST}
          getKey={(r) => r.id}
          rowHref={() => '/v2/agent'}
          cols={[
            { label: 'Agent', render: (r) => <span className="truncate font-medium text-[var(--v2-fg)]">{r.name}</span> },
            { label: '業務', render: (r) => <span className="truncate text-[var(--v2-fg-muted)]">{r.workflow}</span> },
            { label: '信頼レベル', render: (r) => <ToneChip tone={trustTone(r.trust)} label={trustLevelLabel(r.trust)} /> },
            { label: '承認率', render: (r) => <span className="v2-tnum text-[var(--v2-fg)]">{r.approvalRate}</span> },
            {
              label: '昇格',
              render: (r) =>
                r.promotable ? (
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
