import { ChevronRightIcon, ShieldCheckIcon, CheckIcon, ArrowUpIcon } from 'lucide-react'
import type { TrustLevel } from '@/data/types'
import { trustTone, trustLevelLabel } from '@/lib/status-tones'
import { ToneChip, Card } from './ui'

/** AgentDetailV2 — Agent 詳細 (detail)。信頼レベルの ladder + 実績 + 昇格判定 + 単一決定 (設定承認経由)。 */
const AGENT = {
  name: '法人住所変更 Agent',
  workflow: '法人住所変更',
  trust: 'supervised' as TrustLevel,
  approvalRate: '92%',
  trend: [88, 90, 89, 91, 90, 92, 92],
  promotable: false,
  promoteNote: '承認率が基準 (95%) に未達のため、昇格は保留しています。',
}
const LADDER: { key: TrustLevel; label: string; note: string }[] = [
  { key: 'supervised', label: '全件確認', note: 'すべての処理を人が確認' },
  { key: 'checkpoint', label: '要所確認', note: '要所のみ人が確認' },
  { key: 'autonomous', label: '自律', note: '実績に基づき自律実行' },
]

export function AgentDetailV2() {
  const max = Math.max(...AGENT.trend)
  const min = Math.min(...AGENT.trend)
  return (
    <div className="flex h-full flex-col">
      <header className="flex flex-shrink-0 flex-col gap-2 border-b border-[var(--v2-border)] bg-[var(--v2-panel)] px-6 py-3">
        <div className="flex items-center gap-1.5 text-[11px] text-[var(--v2-fg-muted)]">
          <a href="/v2/agents" className="hover:text-[var(--v2-fg)] hover:underline">Agent 設定</a>
          <ChevronRightIcon className="h-3 w-3 text-[var(--v2-fg-subtle)]" aria-hidden="true" />
          <span className="text-[var(--v2-fg)]">{AGENT.name}</span>
        </div>
        <div className="flex items-center gap-3">
          <h1 className="text-[18px] font-semibold text-[var(--v2-fg)]">{AGENT.name}</h1>
          <ToneChip tone={trustTone(AGENT.trust)} label={trustLevelLabel(AGENT.trust)} />
        </div>
        <div className="text-[12px] text-[var(--v2-fg-muted)]">{AGENT.workflow}</div>
      </header>

      <div className="mx-auto w-full max-w-[860px] flex-1 overflow-auto px-6 py-5">
        {/* trust ladder */}
        <Card className="p-4">
          <div className="flex items-center gap-2 text-[13px] font-medium text-[var(--v2-fg)]">
            <ShieldCheckIcon className="h-4 w-4 text-[var(--v2-fg-muted)]" aria-hidden="true" />
            信頼レベル（実績で昇格、人のコントロールは渡さない）
          </div>
          <ol className="mt-3 grid grid-cols-3 gap-2">
            {LADDER.map((l) => {
              const current = l.key === AGENT.trust
              return (
                <li
                  key={l.key}
                  className={
                    'rounded-[var(--v2-radius-control)] border p-3 ' +
                    (current ? 'border-[var(--v2-accent-soft-border)] bg-[var(--v2-accent-soft)]' : 'border-[var(--v2-hairline)] bg-[var(--v2-panel-inset)]')
                  }
                >
                  <div className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--v2-fg)]">
                    {l.label}
                    {current && <span className="rounded-[var(--v2-radius-chip)] bg-[var(--v2-accent)] px-1.5 py-0.5 text-[10px] font-medium text-white">現在</span>}
                  </div>
                  <p className="mt-1 text-[11px] text-[var(--v2-fg-tertiary)]">{l.note}</p>
                </li>
              )
            })}
          </ol>
        </Card>

        {/* 実績 */}
        <Card className="mt-4 p-4">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-[var(--v2-fg)]">直近の承認率</span>
            <span className="v2-tnum text-[20px] font-semibold text-[var(--v2-fg)]">{AGENT.approvalRate}</span>
          </div>
          <div className="mt-3 flex h-12 items-end gap-1">
            {AGENT.trend.map((v, i) => (
              <span
                key={i}
                className="flex-1 rounded-t-[2px] bg-[var(--v2-accent)]"
                style={{ height: `${max === min ? 100 : ((v - min) / (max - min)) * 80 + 20}%` }}
                aria-hidden="true"
              />
            ))}
          </div>
          <div className="mt-1 text-[11px] text-[var(--v2-fg-tertiary)]">7 日推移 [仮説 / 要検証]</div>
        </Card>

        {/* 昇格判定 */}
        <Card className="mt-4 flex items-start gap-2 p-4">
          <ArrowUpIcon className={'mt-0.5 h-4 w-4 flex-shrink-0 ' + (AGENT.promotable ? 'text-[var(--v2-success-soft-fg)]' : 'text-[var(--v2-fg-subtle)]')} aria-hidden="true" />
          <div>
            <div className="text-[13px] font-medium text-[var(--v2-fg)]">昇格判定: {AGENT.promotable ? '昇格可' : '保留'}</div>
            <p className="mt-0.5 text-[12px] text-[var(--v2-fg-muted)]">{AGENT.promoteNote}</p>
          </div>
        </Card>
      </div>

      {/* footer: 単一決定 (昇格申請は設定承認を経由) */}
      <footer className="flex flex-shrink-0 items-center justify-between border-t border-[var(--v2-border)] bg-[var(--v2-panel)] px-6 py-3">
        <span className="text-[12px] text-[var(--v2-fg-muted)]">昇格は設定承認（業務責任者）を経て反映されます。</span>
        <button
          type="button"
          disabled={!AGENT.promotable}
          className={
            'flex items-center gap-1.5 rounded-[var(--v2-radius-control)] px-4 py-1.5 text-[13px] font-medium ' +
            (AGENT.promotable ? 'bg-[var(--v2-accent)] text-white hover:bg-[var(--v2-accent-hover)]' : 'cursor-not-allowed bg-[var(--v2-panel-inset)] text-[var(--v2-fg-subtle)]')
          }
        >
          <CheckIcon className="h-4 w-4" aria-hidden="true" />
          昇格を申請
        </button>
      </footer>
    </div>
  )
}
