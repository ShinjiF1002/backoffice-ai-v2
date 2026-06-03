import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { ChevronRightIcon, CheckIcon, CornerUpLeftIcon, ArrowRightIcon, XIcon, ShieldCheckIcon } from 'lucide-react'
import { PROPOSAL_DETAILS } from '@/data/mock-proposal-detail'
import type { ProposalStatus } from '@/data/types'
import { useProposal, useStoreDispatch, useCurrentActor } from '@/store/hooks'
import { proposalStatusToTone, proposalStatusLabel } from '@/lib/status-tones'
import { ReasonDialog } from '@/components/shared/ReasonDialog'
import { Toast } from '@/components/shared/Toast'
import { useToast } from '@/hooks/useToast'
import { ToneChip, Card } from './ui'

/**
 * ProposalDetailV2 — 提案詳細 (detail、store 配線済)。手順改定提案の根拠 + diff + 単一決定。
 * 本文 (criteria/diff/summary) は PROPOSAL_DETAILS[id] (静的 model) 由来、live status/decision/forwardedBy は useProposal。
 * footer は v1 ProposalDetail と同じ mode 出し分け: 手順管理者 (manual, pending-triage) = 却下/上長へ送付、
 * 業務責任者 (owner, forwarded, 非 self-forward) = 差戻し/承認 (四眼原則)。
 */
export function ProposalDetailV2() {
  const { id } = useParams()
  const p = id ? PROPOSAL_DETAILS[id] : undefined
  const entity = useProposal(id)
  const dispatch = useStoreDispatch()
  const actor = useCurrentActor()
  const mode: 'manual' | 'owner' = actor?.role === 'business-approver' ? 'owner' : 'manual'
  const { toast, show: showToast, dismiss: dismissToast } = useToast()
  const [dialog, setDialog] = useState<'reject' | 'sendback' | null>(null)
  const [prevId, setPrevId] = useState(id)
  if (id !== prevId) {
    setPrevId(id)
    setDialog(null)
    dismissToast()
  }

  if (!p)
    return (
      <div className="flex h-full items-center justify-center p-8 text-center">
        <div>
          <p className="text-[14px] font-medium text-[var(--v2-fg)]">指定の提案が見つかりません。</p>
          <a href="/proposals" className="mt-2 inline-block text-[13px] font-medium text-[var(--v2-accent-strong)] hover:underline">
            AI 提案へ戻る
          </a>
        </div>
      </div>
    )

  const liveStatus: ProposalStatus = entity?.status ?? p.status
  const decision = entity?.decision
  const isSelfForward = entity?.forwardedBy !== undefined && entity.forwardedBy === actor?.id
  const canManualAct = mode === 'manual' && liveStatus === 'pending-triage'
  const canOwnerAct = mode === 'owner' && liveStatus === 'forwarded' && !isSelfForward
  // 本文 display 派生 (real model data、合成しない): criteria は MetricRow→v2 shape、diff は changed step、summary は consequence。
  const criteria = p.criteria.map((c) => ({ label: c.metricLabel, value: c.actualValue, threshold: c.threshold, met: c.achieved }))
  const changedStep = p.procedureSteps.find((s) => s.changed)
  const benefit = p.consequence.impacts.find((i) => i.direction === 'down')

  const statusLine = (() => {
    if (liveStatus === 'approved') return 'この提案は承認され、反映されました'
    if (liveStatus === 'rejected') return 'この提案は却下されました'
    if (canManualAct) return '判定基準は実測値で確認済 — 上長へ送るか却下を選べます'
    if (canOwnerAct) return '判定基準は実測値で確認済 — 承認または差戻しを選べます'
    if (mode === 'owner' && liveStatus === 'forwarded' && isSelfForward) return '送付者本人のため承認できません（四眼原則：送付者 ≠ 承認者）'
    if (mode === 'owner') return '手順管理者の送付待ちです（業務責任者の承認段階ではありません）'
    return '業務責任者の承認待ちです'
  })()

  return (
    <div className="flex h-full flex-col">
      <header className="flex flex-shrink-0 flex-col gap-2 border-b border-[var(--v2-border)] bg-[var(--v2-panel)] px-6 py-3">
        <div className="flex items-center gap-1.5 text-[11px] text-[var(--v2-fg-muted)]">
          <a href="/proposals" className="hover:text-[var(--v2-fg)] hover:underline">AI 提案</a>
          <ChevronRightIcon className="h-3 w-3 text-[var(--v2-fg-subtle)]" aria-hidden="true" />
          <span className="v2-mono text-[var(--v2-fg)]">{p.id}</span>
        </div>
        <div className="flex items-center gap-3">
          <h1 className="text-[18px] font-semibold text-[var(--v2-fg)]">{p.changeTitle}</h1>
          <ToneChip tone={proposalStatusToTone(liveStatus)} label={proposalStatusLabel(liveStatus)} />
        </div>
        <div className="text-[12px] text-[var(--v2-fg-muted)]">{p.workflow}</div>
      </header>

      <div className="mx-auto w-full max-w-[860px] flex-1 overflow-auto px-6 py-5">
        {/* sendback-guard: 却下/差戻し済みは理由を read-only で再表示 (理由を捨てない)。 */}
        {decision && (
          <div className="mb-4 flex items-start gap-2 rounded-[var(--v2-radius-card)] border border-[var(--v2-alert-soft-border)] bg-[var(--v2-alert-soft)] p-3 text-[12px]">
            <CornerUpLeftIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--v2-alert-soft-fg)]" aria-hidden="true" />
            <div>
              <div className="font-medium text-[var(--v2-fg)]">{decision.kind === 'reject' ? 'この提案は却下されました' : 'この提案は差戻されました（手順管理者の再確認へ）'}</div>
              <p className="mt-0.5 text-[var(--v2-fg-muted)]">理由: {decision.reason}</p>
            </div>
          </div>
        )}
        {mode === 'owner' && (
          <div className="mb-4 flex items-center gap-2 rounded-[var(--v2-radius-card)] border border-[var(--v2-accent-soft-border)] bg-[var(--v2-accent-soft)] p-3 text-[12px]">
            <ShieldCheckIcon className="h-4 w-4 flex-shrink-0 text-[var(--v2-accent-soft-fg)]" aria-hidden="true" />
            <span className="text-[var(--v2-fg)]">業務責任者の最終承認 — 手順管理者 <strong>{p.queueOwner}</strong> が上長へ送付した提案です。実績値と帰結を確認してください。</span>
          </div>
        )}

        <Card className="p-4">
          <div className="text-[13px] font-medium text-[var(--v2-fg)]">提案の要旨</div>
          <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--v2-fg-muted)]">{p.consequence.scope}。{benefit ? benefit.label : ''}</p>
        </Card>

        {/* 判定基準 */}
        <Card className="mt-4 p-4">
          <div className="text-[13px] font-medium text-[var(--v2-fg)]">判定基準</div>
          <ul className="mt-2 flex flex-col gap-1.5">
            {criteria.map((c) => (
              <li key={c.label} className="flex items-center gap-3 text-[13px]">
                <span className="flex-1 text-[var(--v2-fg-muted)]">{c.label}</span>
                <span className="v2-tnum text-[var(--v2-fg)]">{c.value}</span>
                <span className="v2-tnum w-32 text-right text-[var(--v2-fg-tertiary)]">基準 {c.threshold}</span>
                <ToneChip tone={c.met ? 'success' : 'alert'} label={c.met ? '満たす' : '未達'} />
              </li>
            ))}
          </ul>
        </Card>

        {/* diff (変更前→変更後) */}
        <Card className="mt-4 p-4">
          <div className="flex items-center gap-2 text-[13px] font-medium text-[var(--v2-fg)]">
            変更案
            <span className="v2-mono text-[11px] text-[var(--v2-fg-tertiary)]">{p.workflow} 手順{changedStep ? ` · Step ${changedStep.n}` : ''}</span>
          </div>
          <div className="mt-2 grid grid-cols-1 items-stretch gap-2 md:grid-cols-[1fr_auto_1fr]">
            <div className="rounded-[var(--v2-radius-control)] bg-[var(--v2-diff-del-bg)] p-3 text-[12px] text-[var(--v2-fg)]">
              <div className="mb-1 text-[10px] font-semibold uppercase text-[var(--v2-error-soft-fg)]">変更前</div>
              {changedStep?.before ?? '—'}
            </div>
            <div className="hidden items-center justify-center text-[var(--v2-fg-subtle)] md:flex">
              <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
            </div>
            <div className="rounded-[var(--v2-radius-control)] bg-[var(--v2-diff-add-bg)] p-3 text-[12px] text-[var(--v2-fg)]">
              <div className="mb-1 text-[10px] font-semibold uppercase text-[var(--v2-success-soft-fg)]">変更後</div>
              {changedStep?.after ?? '—'}
            </div>
          </div>
        </Card>
      </div>

      {/* footer: 単一決定 (mode × live status で出し分け、原則 C) */}
      <footer className="flex flex-shrink-0 items-center justify-between border-t border-[var(--v2-border)] bg-[var(--v2-panel)] px-6 py-3">
        <span className="text-[12px] text-[var(--v2-fg-muted)]">{statusLine}</span>
        {canManualAct ? (
          <div className="flex gap-2">
            <button type="button" onClick={() => setDialog('reject')} className="flex items-center gap-1.5 rounded-[var(--v2-radius-control)] border border-[var(--v2-border-strong)] bg-[var(--v2-panel)] px-3.5 py-1.5 text-[13px] text-[var(--v2-fg)] hover:bg-[var(--v2-panel-inset)]">
              <XIcon className="h-4 w-4" aria-hidden="true" />
              却下
            </button>
            <button
              type="button"
              onClick={() => { if (id) dispatch({ type: 'proposal/forward', id }); showToast('上長へ送付しました — 業務責任者の承認待ちへ') }}
              className="flex items-center gap-1.5 rounded-[var(--v2-radius-control)] bg-[var(--v2-accent)] px-4 py-1.5 text-[13px] font-medium text-white hover:bg-[var(--v2-accent-hover)]"
            >
              上長へ送付
              <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        ) : canOwnerAct ? (
          <div className="flex gap-2">
            <button type="button" onClick={() => setDialog('sendback')} className="flex items-center gap-1.5 rounded-[var(--v2-radius-control)] border border-[var(--v2-border-strong)] bg-[var(--v2-panel)] px-3.5 py-1.5 text-[13px] text-[var(--v2-fg)] hover:bg-[var(--v2-panel-inset)]">
              <CornerUpLeftIcon className="h-4 w-4" aria-hidden="true" />
              差戻し
            </button>
            <button
              type="button"
              onClick={() => { if (id) dispatch({ type: 'proposal/approve', id }); showToast('提案を承認しました — 反映に進みます') }}
              className="flex items-center gap-1.5 rounded-[var(--v2-radius-control)] bg-[var(--v2-accent)] px-4 py-1.5 text-[13px] font-medium text-white hover:bg-[var(--v2-accent-hover)]"
            >
              <CheckIcon className="h-4 w-4" aria-hidden="true" />
              承認
            </button>
          </div>
        ) : null}
      </footer>

      <ReasonDialog
        open={dialog === 'reject'}
        title="提案を却下"
        label="却下の理由 (必須)"
        placeholder="なぜ却下するか、提案元 (日次提案分析) の改善に役立つよう具体的に。"
        submitLabel="却下する"
        outcome="却下すると、この提案は反映されません。"
        onClose={() => setDialog(null)}
        onSubmit={(reason) => { if (id) dispatch({ type: 'proposal/reject', id, reason }); showToast('提案を却下しました') }}
      />
      <ReasonDialog
        open={dialog === 'sendback'}
        title="提案を差戻し"
        label="差戻しの理由 (必須)"
        placeholder="手順管理者が再検討できるよう、何を直してほしいか具体的に。"
        submitLabel="差戻す"
        outcome="差戻すと手順管理者の確認に戻ります。"
        onClose={() => setDialog(null)}
        onSubmit={(reason) => { if (id) dispatch({ type: 'proposal/sendback', id, reason }); showToast('提案を差戻しました — 手順管理者の確認に戻ります') }}
      />

      <Toast toast={toast} onDismiss={dismissToast} />
    </div>
  )
}
