import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ChevronRightIcon, ShieldCheckIcon, CheckIcon, XIcon, CornerUpLeftIcon, ArrowRightIcon } from 'lucide-react'
import { PROPOSAL_DETAILS } from '@/data/mock-proposal-detail'
import type { ProposalStatus } from '@/data/types'
import { proposalStatusToTone, proposalStatusLabel } from '@/lib/status-tones'
import { MetricVsThreshold } from '@/components/cross-cutting/MetricVsThreshold'
import { ConsequencePanel } from '@/components/cross-cutting/ConsequencePanel'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { MetaChip } from '@/components/shared/MetaChip'
import { ReasonDialog } from '@/components/shared/ReasonDialog'
import { cn } from '@/lib/cn'

/**
 * ProposalDetail (/proposals/:id) — Process-First v2 / C 型 detail contract
 * SSOT: screens-v2/06-proposal-detail/canonical-export.md + screen-contracts-v2 + canonical-design-spec §6
 * A 手順全体 before/after (diff だけでなく全 step) / B 根拠 差戻し case 原文 / C mode で決定 1 セット。
 * collapse は canonical token の inline 実装 (継承 Disclosure は off-token のため P2B-4 tokenize 待ち)。
 */
const STEPPER = ['生成', 'Manual 確認', '上長承認', '反映']

/** ProposalStatus → 4-step stepper の現在 index。 */
function proposalStepperCurrent(status: ProposalStatus): number {
  switch (status) {
    case 'pending-triage':
      return 1 // Manual 確認
    case 'forwarded':
      return 2 // 上長承認
    case 'approved':
      return 3 // 反映
    case 'rejected':
      return 1
  }
}

/** 未知 id の not-found (業務語、token-clean inline)。 */
function ProposalNotFound() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
      <p className="text-sm text-[var(--color-fg-muted)]">指定の提案が見つかりません。</p>
      <Link to="/proposals" className="text-sm font-medium text-[var(--color-primary)] hover:underline">
        提案一覧へ戻る
      </Link>
    </div>
  )
}

export function ProposalDetail() {
  const { id } = useParams()
  const p = id ? PROPOSAL_DETAILS[id] : undefined
  const [mode, setMode] = useState<'manual' | 'owner'>('manual')
  const [dialog, setDialog] = useState<'reject' | 'sendback' | null>(null)
  const [openEvidence, setOpenEvidence] = useState<Record<string, boolean>>(() =>
    p && p.sourceCases.length ? { [p.sourceCases[0].id]: true } : {},
  )
  const [hintOpen, setHintOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  // :id 変更時の local state reset (set-state-in-effect 回避、render 中 adjusting)
  const [prevId, setPrevId] = useState(id)
  if (id !== prevId) {
    setPrevId(id)
    setMode('manual')
    setDialog(null)
    setOpenEvidence(p && p.sourceCases.length ? { [p.sourceCases[0].id]: true } : {})
    setHintOpen(false)
    setToast(null)
  }

  if (!p) return <ProposalNotFound />
  const stepperCurrent = proposalStepperCurrent(p.status)

  const showToast = (m: string) => {
    setToast(m)
    window.setTimeout(() => setToast(null), 2600)
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header (sticky) */}
      <header
        data-page-header
        className="sticky top-0 z-30 flex min-h-[var(--height-pageheader)] flex-col justify-center gap-2 border-b border-[var(--color-border)] bg-[var(--color-panel)] px-6 py-3"
      >
        <div className="flex items-center gap-1.5 text-xs text-[var(--color-fg-muted)]">
          <span>{p.workflow}</span>
          <ChevronRightIcon className="h-3 w-3 text-[var(--color-fg-subtle)]" />
          <Link to="/proposals" className="hover:text-[var(--color-fg)]">AI 提案レビュー</Link>
          <ChevronRightIcon className="h-3 w-3 text-[var(--color-fg-subtle)]" />
          <span className="font-mono text-[var(--color-fg)]">{p.id}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <h1 className="flex min-w-0 items-baseline gap-2 text-lg font-semibold text-[var(--color-fg)]">
              <span className="flex-shrink-0 font-mono text-base">{p.id}</span>
              <span className="truncate">{p.changeTitle}</span>
            </h1>
            <StatusBadge tone={proposalStatusToTone(p.status)} label={proposalStatusLabel(p.status)} />
          </div>
          {/* mode 切替 */}
          <div className="flex flex-shrink-0 rounded-[var(--radius-control)] border border-[var(--color-border-strong)] bg-[var(--color-panel)] p-0.5">
            {(['manual', 'owner'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={cn(
                  'rounded-[4px] px-3 py-1 text-xs font-medium transition-colors',
                  mode === m ? 'bg-[var(--color-fg)] text-white' : 'text-[var(--color-fg-muted)]'
                )}
              >
                {m === 'manual' ? 'Manual 管理者' : '業務責任者'}
              </button>
            ))}
          </div>
        </div>
        {/* 4-step stepper (time なし、CaseDetail LifecycleStepper と視覚言語を共有) */}
        <ol className="flex items-center gap-0" aria-label="提案の進行状況">
          {STEPPER.map((step, i) => {
            const done = i < stepperCurrent
            const current = i === stepperCurrent
            const last = i === STEPPER.length - 1
            return (
              <li key={step} className={cn('flex items-center', !last && 'flex-1')}>
                <div className="flex flex-shrink-0 items-center gap-2">
                  <span
                    className={cn(
                      'flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-full border',
                      done
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary)]'
                        : current
                          ? 'border-[var(--color-primary)] bg-[var(--color-panel)]'
                          : 'border-[var(--color-border-strong)] bg-[var(--color-panel)]'
                    )}
                  >
                    {done && <CheckIcon className="h-3 w-3 text-white" strokeWidth={2.5} aria-hidden="true" />}
                    {current && <span className="h-2 w-2 rounded-full bg-[var(--color-primary)]" />}
                  </span>
                  <span
                    className={cn(
                      'text-xs',
                      current
                        ? 'font-semibold text-[var(--color-primary-hover)]'
                        : done
                          ? 'font-medium text-[var(--color-fg)]'
                          : 'text-[var(--color-fg-muted)]'
                    )}
                  >
                    {step}
                  </span>
                </div>
                {!last && (
                  <span className={cn('mx-3 h-px flex-1', done ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border-strong)]')} />
                )}
              </li>
            )
          })}
        </ol>
      </header>

      {/* Body */}
      <div className="flex-1 overflow-auto p-4">
        {mode === 'owner' && (
          <div className="mb-3 flex items-center gap-2 rounded-[var(--radius-card)] border border-[var(--color-primary-soft-border)] bg-[var(--color-primary-soft)] p-3 text-xs">
            <ShieldCheckIcon className="h-4 w-4 flex-shrink-0 text-[var(--color-primary-hover)]" aria-hidden="true" />
            <span className="text-[var(--color-fg)]">
              業務責任者の最終承認 — Manual 管理者 <strong>{p.queueOwner}</strong> が上長へ送付した提案です。実績値と帰結を確認してください。
            </span>
          </div>
        )}
        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[7fr_5fr]">
          {/* 主列: 判定基準 / 帰結 / 手順全体 */}
          <div className="flex flex-col gap-3">
            <MetricVsThreshold
              title="判定基準 vs 実績"
              subtitle="この改定が判定基準を満たすか、過去案件で試算した実測値"
              rows={p.criteria}
            />
            <ConsequencePanel
              kind="proposal"
              title="改定の帰結"
              before={p.consequence.before}
              after={p.consequence.after}
              scope={p.consequence.scope}
              impacts={p.consequence.impacts}
            />
            {/* 手順全体 (原則 A): changed step を全文の中で示す */}
            <section className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-panel)]">
              <div className="border-b border-[var(--color-border)] px-4 py-2.5">
                <h3 className="text-sm font-semibold text-[var(--color-fg)]">手順の変更箇所 (全体の中で確認)</h3>
                <p className="mt-0.5 text-[11px] text-[var(--color-fg-muted)]">変わるのは 1 ステップのみ。前後の手順は変わりません。</p>
              </div>
              <ol className="flex flex-col py-2">
                {p.procedureSteps.map((s) => (
                  <li key={s.n} className={s.changed ? 'px-2 py-1' : 'px-4 py-2'}>
                    {!s.changed ? (
                      <div className="flex gap-3 text-sm text-[var(--color-fg-muted)]">
                        <span className="font-mono text-[var(--color-fg-subtle)]">{s.n}.</span>
                        <span>{s.text}</span>
                      </div>
                    ) : (
                      <div className="rounded-[var(--radius-control)] border-l-[3px] border-[var(--color-primary)] bg-[var(--color-primary-soft)] px-3 py-2.5">
                        <div className="mb-2 flex flex-wrap items-center gap-2 text-sm font-semibold text-[var(--color-fg)]">
                          <span className="font-mono text-[var(--color-primary-hover)]">{s.n}.</span>
                          <span>{s.text}</span>
                          <MetaChip tone="primary" label="変更箇所" />
                        </div>
                        <div className="ml-6 flex flex-col gap-1">
                          <div className="rounded-[4px] bg-[var(--color-diff-del-bg)] px-2 py-1 text-xs text-[var(--color-diff-del)]">− {s.before}</div>
                          <div className="rounded-[4px] bg-[var(--color-diff-add-bg)] px-2 py-1 text-xs text-[var(--color-diff-add)]">＋ {s.after}</div>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ol>
            </section>
          </div>

          {/* 補助列: 根拠 (原則 B) + AI 補足 */}
          <div className="flex flex-col gap-3">
            <section className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-panel)]">
              <div className="border-b border-[var(--color-border)] px-4 py-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-[var(--color-fg)]">この提案の根拠</h3>
                  <MetaChip label={`${p.sourceCases.length} 件`} />
                </div>
                <p className="mt-0.5 text-[11px] text-[var(--color-fg-muted)]">日次提案分析が拾った、差戻しの実例。コメント原文で確認できます。</p>
              </div>
              <div className="flex flex-col">
                {p.sourceCases.map((sc, i) => {
                  const isOpen = !!openEvidence[sc.id]
                  return (
                    <div key={sc.id} className={cn(i > 0 && 'border-t border-[var(--color-border)]')}>
                      <button
                        type="button"
                        onClick={() => setOpenEvidence((prev) => ({ ...prev, [sc.id]: !prev[sc.id] }))}
                        aria-expanded={isOpen}
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-left hover:bg-[var(--color-panel-inset)]"
                      >
                        <ChevronRightIcon
                          className={cn('h-3 w-3 flex-shrink-0 text-[var(--color-fg-subtle)] transition-transform', isOpen && 'rotate-90')}
                          aria-hidden="true"
                        />
                        <span className="font-mono text-xs font-medium text-[var(--color-fg)]">{sc.id}</span>
                        <MetaChip tone="alert" label={sc.field} />
                        <span className="ml-auto font-mono text-[11px] text-[var(--color-fg-subtle)]">{sc.date}</span>
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-3 pl-9">
                          <div className="rounded-[var(--radius-control)] bg-[var(--color-panel-inset)] px-3 py-2.5 text-xs leading-relaxed text-[var(--color-fg)]">
                            <div className="mb-1 text-[11px] text-[var(--color-fg-muted)]">差戻しコメント (原文)</div>
                            「{sc.comment}」
                          </div>
                          <Link
                            to={`/cases/${sc.id}`}
                            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[var(--color-primary)] hover:underline"
                          >
                            元の案件を開く <ArrowRightIcon className="h-3 w-3" />
                          </Link>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>

            {/* AI 補足 (承認根拠にならない、collapse) */}
            <section className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-panel)] p-3">
              <button
                type="button"
                onClick={() => setHintOpen((o) => !o)}
                aria-expanded={hintOpen}
                className="flex w-full items-center gap-1.5 text-left text-xs font-medium text-[var(--color-fg-muted)]"
              >
                <ChevronRightIcon className={cn('h-3 w-3 flex-shrink-0 transition-transform', hintOpen && 'rotate-90')} aria-hidden="true" />
                <span className="text-[var(--color-fg)]">参考: AI の補足</span>
                <span className="ml-auto text-[11px] text-[var(--color-fg-subtle)]">承認の根拠にはなりません</span>
              </button>
              {hintOpen && (
                <div className="pt-2 text-xs leading-relaxed text-[var(--color-fg-muted)]">
                  <strong className="text-[var(--color-fg)]">この補足は AI の推測で、承認の根拠にはなりません。</strong>
                  <br />
                  同種の差戻しは直近 30 日で増加傾向。基準引き上げで同類型の見逃しを抑制できる見込み。
                </div>
              )}
            </section>
          </div>
        </div>
      </div>

      {/* Footer: 単一決定面 (mode で 1 セットのみ、原則 C) */}
      <footer className="sticky bottom-0 z-30 flex items-center justify-between border-t border-[var(--color-border)] bg-[var(--color-panel)] px-6 py-3">
        <div className="flex items-center gap-1.5 text-xs text-[var(--color-fg-muted)]">
          <CheckIcon className="h-3.5 w-3.5 text-[var(--color-success-soft-fg)]" />
          <span>判定基準は実測値で確認済 — {mode === 'manual' ? '上長へ送るか却下を選べます' : '承認または差戻しを選べます'}</span>
        </div>
        {mode === 'manual' ? (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setDialog('reject')}
              className="flex items-center gap-1.5 rounded-[var(--radius-control)] border border-[var(--color-border-strong)] bg-[var(--color-panel)] px-3 py-1.5 text-sm text-[var(--color-fg)] hover:bg-[var(--color-panel-inset)]"
            >
              <XIcon className="h-4 w-4" />
              却下 (理由必須)
            </button>
            <button
              type="button"
              onClick={() => showToast('上長へ送付しました — 業務責任者の承認待ちへ')}
              className="flex items-center gap-1.5 rounded-[var(--radius-control)] bg-[var(--color-primary)] px-3 py-1.5 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)]"
            >
              上長へ送付
              <ArrowRightIcon className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setDialog('sendback')}
              className="flex items-center gap-1.5 rounded-[var(--radius-control)] border border-[var(--color-border-strong)] bg-[var(--color-panel)] px-3 py-1.5 text-sm text-[var(--color-fg)] hover:bg-[var(--color-panel-inset)]"
            >
              <CornerUpLeftIcon className="h-4 w-4" />
              差戻し (理由必須)
            </button>
            <button
              type="button"
              onClick={() => showToast('提案を承認しました — 反映に進みます')}
              className="flex items-center gap-1.5 rounded-[var(--radius-control)] bg-[var(--color-primary)] px-3 py-1.5 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)]"
            >
              <CheckIcon className="h-4 w-4" />
              承認
            </button>
          </div>
        )}
      </footer>

      <ReasonDialog
        open={dialog === 'reject'}
        title="提案を却下"
        label="却下の理由 (必須)"
        placeholder="なぜ却下するか、提案元 (日次提案分析) の改善に役立つよう具体的に。例: 過剰な要確認が増える懸念が大きく、現時点では見送る。"
        submitLabel="却下する"
        outcome="却下すると、この提案は反映されません。"
        onClose={() => setDialog(null)}
        onSubmit={() => showToast('提案を却下しました')}
      />
      <ReasonDialog
        open={dialog === 'sendback'}
        title="提案を差戻し"
        label="差戻しの理由 (必須)"
        placeholder="Manual 管理者が再検討できるよう、何を直してほしいか具体的に。例: 影響件数の試算根拠を追記してほしい。"
        submitLabel="差戻す"
        outcome="差戻すと Manual 管理者の確認に戻ります。"
        onClose={() => setDialog(null)}
        onSubmit={() => showToast('提案を差戻しました — Manual 管理者の確認に戻ります')}
      />

      {toast && (
        <div
          role="status"
          className="fixed bottom-20 left-1/2 z-[80] -translate-x-1/2 rounded-[var(--radius-card)] border border-[var(--color-success)] bg-[var(--color-success-soft)] px-4 py-2 text-sm font-medium text-[var(--color-success-soft-fg)] shadow-lg"
        >
          {toast}
        </div>
      )}
    </div>
  )
}
