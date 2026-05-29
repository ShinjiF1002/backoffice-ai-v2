import { ArrowDownIcon, ArrowUpIcon, ShieldCheckIcon, ArrowRightIcon } from 'lucide-react'

/**
 * ConsequencePanel — 変更の before/after + 適用対象 + 影響 (何が減り何が増え どこで止まるか、原則 B)
 * SSOT: handoff-redesign/00-shared/consequence-panel-spec.md
 * reference: screens-v2/06-proposal-detail + 08-agent-detail (title / before / after / scope / impacts)。
 * 適用: AgentDetail (Trust 昇格) / ProposalDetail (ルール改定)。
 */
export interface ConsequenceImpact {
  /** down=減る / up=増える / guard=安全条件 (非遡及・rollback) */
  direction: 'down' | 'up' | 'guard'
  label: string
}

export interface ConsequencePanelProps {
  kind: 'agent' | 'proposal'
  before: string
  after: string
  impacts: ConsequenceImpact[]
  /** 適用対象 / 影響範囲 (spec「適用対象」)。例: 法人住所変更の住所読み取り、過去 12 件で試算 */
  scope?: string
  /** 見出し override。未指定なら kind から既定文言 */
  title?: string
}

const ICON = {
  down: { Icon: ArrowDownIcon, color: 'var(--color-success-soft-fg)' },
  up: { Icon: ArrowUpIcon, color: 'var(--color-primary)' },
  guard: { Icon: ShieldCheckIcon, color: 'var(--color-fg-muted)' },
}

export function ConsequencePanel({ kind, before, after, impacts, scope, title }: ConsequencePanelProps) {
  const heading = title ?? `変更の帰結 (${kind === 'agent' ? 'Trust 昇格' : 'ルール改定'})`
  return (
    <section className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-panel)]">
      <div className="border-b border-[var(--color-border)] px-4 py-2.5">
        <h3 className="text-sm font-semibold text-[var(--color-fg)]">{heading}</h3>
        {scope && <p className="mt-0.5 text-[11px] leading-snug text-[var(--color-fg-muted)]">適用対象: {scope}</p>}
      </div>
      <div className="grid gap-3 p-4 sm:grid-cols-[auto_1fr]">
        {/* before → after */}
        <div className="flex items-center gap-2 self-start rounded-[var(--radius-card)] bg-[var(--color-panel-inset)] px-3 py-2 text-sm">
          <span className="text-[var(--color-fg-muted)]">{before}</span>
          <ArrowRightIcon className="h-4 w-4 text-[var(--color-fg-subtle)]" aria-hidden="true" />
          <span className="font-medium text-[var(--color-fg)]">{after}</span>
        </div>
        {/* 影響サマリ */}
        <ul className="flex flex-col gap-1.5">
          {impacts.map((im, i) => {
            const { Icon, color } = ICON[im.direction]
            return (
              <li key={i} className="flex items-center gap-2 text-sm text-[var(--color-fg)]">
                <Icon className="h-4 w-4 flex-shrink-0" style={{ color }} aria-hidden="true" />
                {im.label}
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
