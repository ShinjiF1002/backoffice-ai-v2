import { useState } from 'react'
import { PatternDemo, DemoFrame } from '@/components/PatternShell'
import { cn } from '@/lib/cn'

type Tier = 'T1' | 'T2' | 'T3' | 'T4'

type Action = {
  tier: Tier
  label: string
  scope: string
  confirmation: 'none' | 'click' | 'typed' | 'second-factor'
  example: string
  auditAttach: boolean
}

const ACTIONS: Action[] = [
  { tier: 'T1', label: 'View logs',          scope: 'read-only',              confirmation: 'none',          example: 'agent 実行履歴の閲覧、metric の確認',                       auditAttach: false },
  { tier: 'T2', label: 'Pause agent',        scope: 'local mutation',         confirmation: 'click',         example: 'agent の一時停止、queue の throttle',                       auditAttach: true  },
  { tier: 'T3', label: 'Re-route queue',     scope: 'external mutation',     confirmation: 'typed',         example: '他 agent への振替、escalation先 変更、外部 system call',     auditAttach: true  },
  { tier: 'T4', label: 'Kill switch',        scope: 'critical / destructive', confirmation: 'second-factor', example: 'fleet 全停止、本番 data 削除、不可逆 transaction',           auditAttach: true  },
]

export function ActionConfirmationDemo() {
  const [showingTier, setShowingTier] = useState<Tier>('T3')
  const action = ACTIONS.find((a) => a.tier === showingTier) ?? ACTIONS[2]

  return (
    <PatternDemo
      notes={{
        useWhen: [
          'Agent / operator が取りうる action を read-only から critical まで 4 段階で扱う',
          '誤操作リスクと audit retention を tier ごとに揃える',
          'banking compliance で 2-person approval / second factor を明示要求される文脈',
        ],
        avoidWhen: [
          '全 action を同じ confirmation 1 通り (T1 が click 必須でフリクション過剰)',
          'T4 を visual だけ強調して typed / 2FA を省略 (誤操作で重大事故)',
          'audit attach 要件を tier に紐付けず action ごとに ad-hoc 決定',
        ],
      }}
    >
      <DemoFrame viewport="Desktop 1280×800 · Tier matrix + sample dialog">
        <div className="grid grid-cols-[320px_1fr] h-[460px]">
          {/* Tier list */}
          <div className="border-r border-[color:var(--color-border)] bg-[color:var(--color-panel-inset)]/30 overflow-y-auto">
            {ACTIONS.map((a) => (
              <button
                key={a.tier}
                onClick={() => setShowingTier(a.tier)}
                className={cn(
                  'w-full text-left px-4 py-4 border-b border-[color:var(--color-border)] transition-colors',
                  showingTier === a.tier
                    ? 'bg-[color:var(--color-panel)]'
                    : 'hover:bg-[color:var(--color-panel)]/60'
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <TierChip tier={a.tier} />
                  <span className="text-[13px] font-semibold text-[color:var(--color-ink)]">{a.label}</span>
                </div>
                <div className="text-[11px] text-[color:var(--color-fg-muted)] mb-1.5">{a.scope}</div>
                <div className="flex items-center gap-1.5">
                  <ConfirmationChip type={a.confirmation} />
                  {a.auditAttach && (
                    <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-medium bg-[color:var(--color-primary-soft)] text-[color:var(--color-primary)]">
                      audit attach
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Sample dialog for selected tier */}
          <div className="p-8 bg-[color:var(--color-panel-inset)]/40 flex items-center justify-center">
            <SampleDialog action={action} />
          </div>
        </div>
      </DemoFrame>
    </PatternDemo>
  )
}

function TierChip({ tier }: { tier: Tier }) {
  const map: Record<Tier, { bg: string; fg: string }> = {
    T1: { bg: 'bg-[color:var(--color-panel-inset)]',  fg: 'text-[color:var(--color-fg-muted)]' },
    T2: { bg: 'bg-[color:var(--color-success-soft)]', fg: 'text-[color:var(--color-success-soft-fg)]' },
    T3: { bg: 'bg-[color:var(--color-alert-soft)]',   fg: 'text-[color:var(--color-alert-soft-fg)]' },
    T4: { bg: 'bg-[color:var(--color-error-soft)]',   fg: 'text-[color:var(--color-error-soft-fg)]' },
  }
  const m = map[tier]
  return (
    <span className={cn('inline-flex items-center rounded px-1.5 py-0.5 text-[9px] font-bold tracking-wider', m.bg, m.fg)}>
      {tier}
    </span>
  )
}

function ConfirmationChip({ type }: { type: Action['confirmation'] }) {
  const map: Record<Action['confirmation'], string> = {
    none: 'no confirm',
    click: '1 click',
    typed: 'typed confirm',
    'second-factor': '2FA',
  }
  return (
    <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[9px] font-mono bg-[color:var(--color-panel)] border border-[color:var(--color-border)] text-[color:var(--color-fg-muted)]">
      {map[type]}
    </span>
  )
}

function SampleDialog({ action }: { action: Action }) {
  const [typed, setTyped] = useState('')
  const requiredTyped = action.tier === 'T3' ? 'CONFIRM' : 'EXECUTE-T4'

  if (action.confirmation === 'none') {
    return (
      <div className="w-full max-w-[440px] rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[color:var(--color-panel)] p-5 shadow-[var(--shadow-card)]">
        <TierChip tier={action.tier} />
        <h3 className="mt-3 text-[16px] font-semibold tracking-tight text-[color:var(--color-ink)]">
          {action.label}
        </h3>
        <p className="mt-1 text-[12px] text-[color:var(--color-fg-muted)] leading-[1.6]">
          {action.example}
        </p>
        <div className="mt-4 text-[11px] text-[color:var(--color-fg-subtle)]">
          T1 は confirmation なしで即時実行。Read-only につき audit attach 不要。
        </div>
      </div>
    )
  }

  if (action.confirmation === 'click') {
    return (
      <div className="w-full max-w-[440px] rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[color:var(--color-panel)] p-6 shadow-[var(--shadow-drawer)]">
        <TierChip tier={action.tier} />
        <h3 className="mt-3 text-[18px] font-semibold tracking-tight text-[color:var(--color-ink)]">
          {action.label} しますか？
        </h3>
        <p className="mt-2 text-[13px] text-[color:var(--color-fg-muted)] leading-[1.6]">
          {action.example}
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button className="text-[12px] px-3 py-2 rounded-[var(--radius-control)] text-[color:var(--color-fg-muted)] hover:bg-[color:var(--color-panel-inset)]">
            キャンセル
          </button>
          <button className="text-[12px] font-semibold px-4 py-2 rounded-[var(--radius-control)] bg-[color:var(--color-primary)] text-[color:var(--color-primary-fg)]">
            実行
          </button>
        </div>
      </div>
    )
  }

  if (action.confirmation === 'typed') {
    return (
      <div className="w-full max-w-[460px] rounded-[var(--radius-card)] border-2 border-[color:var(--color-alert)] bg-[color:var(--color-panel)] p-6 shadow-[var(--shadow-drawer)]">
        <div className="flex items-center gap-2 mb-2">
          <TierChip tier={action.tier} />
          <span className="text-[10px] uppercase tracking-wider font-bold text-[color:var(--color-alert-soft-fg)]">
            ⚠ External mutation
          </span>
        </div>
        <h3 className="text-[18px] font-semibold tracking-tight text-[color:var(--color-ink)]">
          {action.label}
        </h3>
        <p className="mt-2 text-[13px] text-[color:var(--color-fg-muted)] leading-[1.6]">
          {action.example}
        </p>
        <div className="mt-4">
          <label className="block text-[11px] font-medium text-[color:var(--color-fg)] mb-1.5">
            実行するには <code className="font-mono bg-[color:var(--color-panel-inset)] px-1 rounded">CONFIRM</code> と入力
          </label>
          <input
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder="CONFIRM"
            className="w-full rounded-[var(--radius-control)] border border-[color:var(--color-border)] bg-[color:var(--color-panel)] px-3 py-2 text-[13px] font-mono focus:outline-none focus:ring-2 focus:ring-[color:var(--color-alert)]/30 focus:border-[color:var(--color-alert)]"
          />
        </div>
        <div className="mt-5 flex items-center justify-between">
          <span className="text-[10px] text-[color:var(--color-fg-subtle)]">audit attach 必須</span>
          <div className="flex gap-2">
            <button className="text-[12px] px-3 py-2 rounded-[var(--radius-control)] text-[color:var(--color-fg-muted)] hover:bg-[color:var(--color-panel-inset)]">
              キャンセル
            </button>
            <button
              disabled={typed !== requiredTyped}
              className="text-[12px] font-semibold px-4 py-2 rounded-[var(--radius-control)] bg-[color:var(--color-alert)] text-white disabled:opacity-40 disabled:cursor-not-allowed"
            >
              実行
            </button>
          </div>
        </div>
      </div>
    )
  }

  // second-factor
  return (
    <div className="w-full max-w-[460px] rounded-[var(--radius-card)] border-2 border-[color:var(--color-error)] bg-[color:var(--color-panel)] p-6 shadow-[var(--shadow-drawer)]">
      <div className="flex items-center gap-2 mb-2">
        <TierChip tier={action.tier} />
        <span className="text-[10px] uppercase tracking-wider font-bold text-[color:var(--color-error-soft-fg)]">
          ✖ Critical / Destructive
        </span>
      </div>
      <h3 className="text-[18px] font-semibold tracking-tight text-[color:var(--color-ink)]">
        {action.label}
      </h3>
      <p className="mt-2 text-[13px] text-[color:var(--color-fg-muted)] leading-[1.6]">
        {action.example}
      </p>
      <div className="mt-4 rounded-[var(--radius-control)] border border-[color:var(--color-error-soft)] bg-[color:var(--color-error-soft)]/40 px-3 py-2.5 text-[11px] text-[color:var(--color-error-soft-fg)]">
        この操作は <strong>不可逆</strong> です。2-person approval が必要 — 別 operator の sign-off 待ち。
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-[var(--radius-control)] border border-[color:var(--color-border)] bg-[color:var(--color-panel-inset)] px-3 py-2">
          <div className="text-[9px] uppercase tracking-wider font-medium text-[color:var(--color-fg-subtle)]">Self</div>
          <div className="text-[11px] font-mono text-[color:var(--color-fg)] mt-0.5">u-12345 (you)</div>
          <div className="mt-1 inline-block text-[9px] font-medium rounded px-1.5 py-0.5 bg-[color:var(--color-success-soft)] text-[color:var(--color-success-soft-fg)]">
            ✓ requested
          </div>
        </div>
        <div className="rounded-[var(--radius-control)] border border-dashed border-[color:var(--color-border-strong)] px-3 py-2">
          <div className="text-[9px] uppercase tracking-wider font-medium text-[color:var(--color-fg-subtle)]">Peer</div>
          <div className="text-[11px] font-mono text-[color:var(--color-fg-muted)] mt-0.5">awaiting…</div>
          <div className="mt-1 inline-block text-[9px] font-medium rounded px-1.5 py-0.5 bg-[color:var(--color-alert-soft)] text-[color:var(--color-alert-soft-fg)]">
            pending 2FA
          </div>
        </div>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <button className="text-[12px] px-3 py-2 rounded-[var(--radius-control)] text-[color:var(--color-fg-muted)] hover:bg-[color:var(--color-panel-inset)]">
          リクエスト撤回
        </button>
      </div>
    </div>
  )
}
