import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { ChevronRightIcon, ShieldCheckIcon, CheckIcon, ArrowUpIcon, PauseIcon, PlayIcon, AlertTriangleIcon, BotIcon } from 'lucide-react'
import type { TrustLevel } from '@/data/types'
import { AGENT_DETAILS } from '@/data/mock-agent-detail'
import { AGENT_LIST } from '@/data/mock-agent-list'
import { useAgent, useStoreDispatch, useCurrentActor } from '@/store/hooks'
import { trustTone, trustLevelLabel } from '@/lib/status-tones'
import { Modal } from '@/components/shared/Modal'
import { ReasonDialog } from '@/components/shared/ReasonDialog'
import { Toast } from '@/components/shared/Toast'
import { useToast } from '@/hooks/useToast'
import { ToneChip, Card } from './ui'

/**
 * AgentDetailV2 — Agent 詳細 (detail、store 配線済)。信頼レベル ladder + 実績 + 昇格判定 + 単一決定。
 * 静的本文 (name/workflow/metrics) は AGENT_DETAILS[id]、承認率/推移 (sparkline、[仮説/要検証]) は AGENT_LIST、
 * live trust/paused/promotion は useAgent。footer は v1 AgentDetail と同じ mode 出し分け (manual=昇格申請 / owner=設定承認・差戻し)。
 * header に kill-switch (緊急停止/再開)。SoD: 申請者本人は設定承認不可 (reducer も hard-block)。
 */
const LADDER: { key: TrustLevel; label: string; note: string }[] = [
  { key: 'supervised', label: '全件確認', note: 'すべての処理を人が確認' },
  { key: 'checkpoint', label: '要所確認', note: '要所のみ人が確認' },
  { key: 'autonomous', label: '自律', note: '実績に基づき自律実行' },
]

export function AgentDetailV2() {
  const { id } = useParams()
  const a = id ? AGENT_DETAILS[id] : undefined
  const listRow = AGENT_LIST.find((r) => r.id === id)
  const agentEntity = useAgent(id)
  const dispatch = useStoreDispatch()
  const actor = useCurrentActor()
  const { toast, show: showToast, dismiss: dismissToast } = useToast()
  const [applyOpen, setApplyOpen] = useState(false)
  const [emergencyOpen, setEmergencyOpen] = useState(false)
  const [emergencyReason, setEmergencyReason] = useState('')
  const [emergencyError, setEmergencyError] = useState(false)
  const [resumeOpen, setResumeOpen] = useState(false)
  const [configSendbackOpen, setConfigSendbackOpen] = useState(false)
  const [prevId, setPrevId] = useState(id)
  if (id !== prevId) {
    setPrevId(id)
    setApplyOpen(false)
    setEmergencyOpen(false)
    setEmergencyReason('')
    setEmergencyError(false)
    setResumeOpen(false)
    setConfigSendbackOpen(false)
    dismissToast()
  }

  if (!a)
    return (
      <div className="flex h-full items-center justify-center p-8 text-center">
        <div>
          <p className="text-[14px] font-medium text-[var(--v2-fg)]">指定のエージェントが見つかりません。</p>
          <a href="/agents" className="mt-2 inline-block text-[13px] font-medium text-[var(--v2-accent-strong)] hover:underline">
            Agent 設定へ戻る
          </a>
        </div>
      </div>
    )

  const liveTrust: TrustLevel = agentEntity?.trust ?? 'supervised'
  const hasUnmet = a.metrics.some((m) => !m.achieved)
  const requested = agentEntity?.promotionStatus === 'requested'
  const approved = agentEntity?.promotionStatus === 'approved'
  const paused = agentEntity?.paused ?? false
  const pausedReason = agentEntity?.pausedReason
  const promotionSendbackReason = agentEntity?.promotionSendbackReason
  const promotionRequestedBy = agentEntity?.promotionRequestedBy
  const isSelfPromotionApproval = promotionRequestedBy !== undefined && promotionRequestedBy === actor?.id
  const mode: 'manual' | 'owner' = actor?.role === 'business-approver' ? 'owner' : 'manual'
  const showOwnerPromotionControls = mode === 'owner' && requested
  const restoreTrust = agentEntity?.trustBeforePause ?? liveTrust
  const promotable = !hasUnmet && !requested && !paused && !approved
  const approvalRate = listRow?.approvalRate ?? '—'
  const trend = listRow?.trend ?? []
  const max = trend.length ? Math.max(...trend) : 0
  const min = trend.length ? Math.min(...trend) : 0
  const judgmentTitle = approved ? '承認済' : requested ? '申請済' : promotable ? '昇格可' : '保留'
  const judgmentNote = paused
    ? '緊急停止中は昇格を申請できません（再開後に申請可能）'
    : requested
      ? '昇格を申請済み — 設定承認の待ちに入りました'
      : approved
        ? '設定承認が完了しています。'
        : promotionSendbackReason
          ? `前回の設定承認で差戻し: ${promotionSendbackReason} — 修正後に再申請できます`
          : hasUnmet
            ? '承認率が基準 (95%) に未達のため、現時点では昇格を申請できません'
            : '全指標が基準達成 — 昇格を申請できます'

  return (
    <div className="flex h-full flex-col">
      <header className="flex flex-shrink-0 flex-col gap-2 border-b border-[var(--v2-border)] bg-[var(--v2-panel)] px-6 py-3">
        <div className="flex items-center gap-1.5 text-[11px] text-[var(--v2-fg-muted)]">
          <a href="/agents" className="hover:text-[var(--v2-fg)] hover:underline">Agent 設定</a>
          <ChevronRightIcon className="h-3 w-3 text-[var(--v2-fg-subtle)]" aria-hidden="true" />
          <span className="text-[var(--v2-fg)]">{a.name}</span>
        </div>
        <div className="flex items-center gap-3">
          <h1 className="text-[18px] font-semibold text-[var(--v2-fg)]">{a.name}</h1>
          <ToneChip tone={trustTone(liveTrust)} label={trustLevelLabel(liveTrust)} />
          {paused && <ToneChip tone="alert" label="緊急停止中" />}
          {mode === 'owner' && <ToneChip tone="inset" label="業務責任者ビュー" />}
          <div className="ml-auto flex flex-shrink-0 items-center gap-2">
            {paused ? (
              <button
                type="button"
                onClick={() => setResumeOpen(true)}
                className="flex items-center gap-1.5 rounded-[var(--v2-radius-control)] border border-[var(--v2-border-strong)] bg-[var(--v2-panel)] px-3 py-1.5 text-[13px] font-medium text-[var(--v2-fg)] hover:bg-[var(--v2-panel-inset)]"
              >
                <PlayIcon className="h-4 w-4" aria-hidden="true" />
                再開
              </button>
            ) : (
              <button
                type="button"
                onClick={() => { setEmergencyReason(''); setEmergencyError(false); setEmergencyOpen(true) }}
                className="flex items-center gap-1.5 rounded-[var(--v2-radius-control)] border border-[var(--v2-error-soft-border)] bg-[var(--v2-error-soft)] px-3 py-1.5 text-[13px] font-medium text-[var(--v2-error-soft-fg)] hover:opacity-90"
              >
                <PauseIcon className="h-4 w-4" aria-hidden="true" />
                緊急停止
              </button>
            )}
          </div>
        </div>
        {paused && pausedReason && (
          <div className="text-[11px] text-[var(--v2-fg-muted)]">停止理由: {pausedReason}</div>
        )}
        <div className="text-[12px] text-[var(--v2-fg-muted)]">{a.workflow}</div>
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
              const current = l.key === liveTrust
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
            <span className="v2-tnum text-[20px] font-semibold text-[var(--v2-fg)]">{approvalRate}</span>
          </div>
          <div className="mt-3 flex h-12 items-end gap-1">
            {trend.map((v, i) => (
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

        {/* 昇格判定 (store-derived) */}
        <Card className="mt-4 flex items-start gap-2 p-4">
          <ArrowUpIcon className={'mt-0.5 h-4 w-4 flex-shrink-0 ' + (promotable ? 'text-[var(--v2-success-soft-fg)]' : 'text-[var(--v2-fg-subtle)]')} aria-hidden="true" />
          <div>
            <div className="text-[13px] font-medium text-[var(--v2-fg)]">昇格判定: {judgmentTitle}</div>
            <p className="mt-0.5 text-[12px] text-[var(--v2-fg-muted)]">{judgmentNote}</p>
          </div>
        </Card>
      </div>

      {/* footer: 単一決定 (mode 出し分け、原則 C) */}
      {showOwnerPromotionControls ? (
        <footer className="flex flex-shrink-0 items-center justify-between border-t border-[var(--v2-border)] bg-[var(--v2-panel)] px-6 py-3">
          <span className="flex items-center gap-1.5 text-[12px]">
            {isSelfPromotionApproval ? (
              <>
                <AlertTriangleIcon className="h-3.5 w-3.5 flex-shrink-0 text-[var(--v2-alert-soft-fg)]" aria-hidden="true" />
                <span className="font-medium text-[var(--v2-alert-soft-fg)]">申請者として承認できません — 別の業務責任者に切替えてください（四眼原則）</span>
              </>
            ) : (
              <>
                <BotIcon className="h-3.5 w-3.5 flex-shrink-0 text-[var(--v2-accent-strong)]" aria-hidden="true" />
                <span className="font-medium text-[var(--v2-accent-strong)]">設定変更 (昇格) の申請を承認 / 差戻しできます</span>
              </>
            )}
          </span>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setConfigSendbackOpen(true)} className="rounded-[var(--v2-radius-control)] border border-[var(--v2-border-strong)] bg-[var(--v2-panel)] px-3.5 py-1.5 text-[13px] font-medium text-[var(--v2-fg)] hover:bg-[var(--v2-panel-inset)]">
              差戻し
            </button>
            <button
              type="button"
              disabled={isSelfPromotionApproval}
              title={isSelfPromotionApproval ? '申請者は承認できません（四眼原則）' : undefined}
              onClick={() => { if (id) dispatch({ type: 'agent/approvePromotion', id }); showToast('設定変更を承認しました — 昇格を反映します') }}
              className={'flex items-center gap-1.5 rounded-[var(--v2-radius-control)] px-4 py-1.5 text-[13px] font-medium ' + (isSelfPromotionApproval ? 'cursor-not-allowed bg-[var(--v2-panel-inset)] text-[var(--v2-fg-subtle)]' : 'bg-[var(--v2-accent)] text-white hover:bg-[var(--v2-accent-hover)]')}
            >
              <CheckIcon className="h-4 w-4" aria-hidden="true" />
              設定承認
            </button>
          </div>
        </footer>
      ) : mode === 'owner' ? (
        <footer className="flex flex-shrink-0 items-center justify-between border-t border-[var(--v2-border)] bg-[var(--v2-panel)] px-6 py-3">
          <span className="flex items-center gap-1.5 text-[12px]">
            <BotIcon className="h-3.5 w-3.5 flex-shrink-0 text-[var(--v2-fg-muted)]" aria-hidden="true" />
            <span className="font-medium text-[var(--v2-fg-muted)]">{approved ? '設定変更は承認済みです' : '承認待ちの設定変更はありません'}</span>
          </span>
        </footer>
      ) : (
        <footer className="flex flex-shrink-0 items-center justify-between border-t border-[var(--v2-border)] bg-[var(--v2-panel)] px-6 py-3">
          <span className="flex items-center gap-1.5 text-[12px]">
            {paused ? (
              <>
                <AlertTriangleIcon className="h-3.5 w-3.5 flex-shrink-0 text-[var(--v2-alert-soft-fg)]" aria-hidden="true" />
                <span className="font-medium text-[var(--v2-alert-soft-fg)]">緊急停止中は昇格を申請できません（再開後に申請可能）</span>
              </>
            ) : requested ? (
              <>
                <CheckIcon className="h-3.5 w-3.5 flex-shrink-0 text-[var(--v2-accent-strong)]" aria-hidden="true" />
                <span className="font-medium text-[var(--v2-accent-strong)]">昇格を申請済み — 設定承認の待ちに入りました</span>
              </>
            ) : approved ? (
              <>
                <CheckIcon className="h-3.5 w-3.5 flex-shrink-0 text-[var(--v2-success-soft-fg)]" aria-hidden="true" />
                <span className="font-medium text-[var(--v2-success-soft-fg)]">設定変更は承認済みです（再申請は不要）</span>
              </>
            ) : promotionSendbackReason ? (
              <>
                <AlertTriangleIcon className="h-3.5 w-3.5 flex-shrink-0 text-[var(--v2-alert-soft-fg)]" aria-hidden="true" />
                <span className="font-medium text-[var(--v2-alert-soft-fg)]">前回の設定承認で差戻し: {promotionSendbackReason} — 修正後に再申請できます</span>
              </>
            ) : hasUnmet ? (
              <>
                <AlertTriangleIcon className="h-3.5 w-3.5 flex-shrink-0 text-[var(--v2-alert-soft-fg)]" aria-hidden="true" />
                <span className="font-medium text-[var(--v2-alert-soft-fg)]">承認率が基準 (95%) に未達のため、現時点では昇格を申請できません</span>
              </>
            ) : (
              <>
                <CheckIcon className="h-3.5 w-3.5 flex-shrink-0 text-[var(--v2-success-soft-fg)]" aria-hidden="true" />
                <span className="font-medium text-[var(--v2-success-soft-fg)]">全指標が基準達成 — 昇格を申請できます</span>
              </>
            )}
          </span>
          <button
            type="button"
            disabled={hasUnmet || requested || paused || approved}
            title={paused ? '緊急停止中は申請できません' : hasUnmet ? '承認率が基準に未達です' : requested ? '申請済みです' : approved ? '設定変更は承認済みです' : undefined}
            onClick={() => setApplyOpen(true)}
            className={'flex items-center gap-1.5 rounded-[var(--v2-radius-control)] px-4 py-1.5 text-[13px] font-medium ' + (hasUnmet || requested || paused || approved ? 'cursor-not-allowed bg-[var(--v2-panel-inset)] text-[var(--v2-fg-subtle)]' : 'bg-[var(--v2-accent)] text-white hover:bg-[var(--v2-accent-hover)]')}
          >
            <BotIcon className="h-4 w-4" aria-hidden="true" />
            {requested ? '申請済み' : approved ? '承認済み' : '設定変更を申請'}
          </button>
        </footer>
      )}

      {/* 申請 confirm dialog (shared Modal) */}
      <Modal
        open={applyOpen}
        onClose={() => setApplyOpen(false)}
        title="設定変更を申請"
        size="sm"
        footer={
          <>
            <button type="button" onClick={() => setApplyOpen(false)} className="rounded-[var(--radius-control)] border border-[var(--color-border-strong)] bg-[var(--color-panel)] px-3 py-1.5 text-sm text-[var(--color-fg)] hover:bg-[var(--color-panel-inset)]">
              キャンセル
            </button>
            <button
              type="button"
              onClick={() => { setApplyOpen(false); if (id) dispatch({ type: 'agent/requestPromotion', id }); showToast('昇格を申請しました') }}
              className="flex items-center gap-1.5 rounded-[var(--radius-control)] bg-[var(--color-primary)] px-3 py-1.5 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)]"
            >
              <CheckIcon className="h-4 w-4" aria-hidden="true" />
              申請する
            </button>
          </>
        }
      >
        <div className="text-sm leading-relaxed text-[var(--color-fg)]">
          全件確認 → 要所確認 への昇格を申請します。承認後、人レビューが減り自動入力が増えます (帰結を参照)。
        </div>
      </Modal>

      {/* 緊急停止 confirm dialog (kill-switch、理由必須) */}
      <Modal
        open={emergencyOpen}
        onClose={() => setEmergencyOpen(false)}
        title="Agent を緊急停止"
        size="sm"
        footer={
          <>
            <button type="button" onClick={() => setEmergencyOpen(false)} className="rounded-[var(--radius-control)] border border-[var(--color-border-strong)] bg-[var(--color-panel)] px-3 py-1.5 text-sm text-[var(--color-fg)] hover:bg-[var(--color-panel-inset)]">
              キャンセル
            </button>
            <button
              type="button"
              onClick={() => {
                const r = emergencyReason.trim()
                if (!r) { setEmergencyError(true); return }
                if (id) dispatch({ type: 'agent/emergencyStop', id, reason: r })
                setEmergencyOpen(false)
                showToast('Agent を緊急停止しました（全件確認に降格）', { tone: 'alert', sticky: true })
              }}
              className="flex items-center gap-1.5 rounded-[var(--radius-control)] border border-[var(--color-error)] bg-[var(--color-error-soft)] px-3 py-1.5 text-sm font-medium text-[var(--color-error-soft-fg)] hover:opacity-90"
            >
              <PauseIcon className="h-4 w-4" aria-hidden="true" />
              緊急停止する
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <p className="text-sm leading-relaxed text-[var(--color-fg)]">
            この Agent を緊急停止し、全件確認（人による全件レビュー）に降格します。自動入力は止まり、一覧にも「緊急停止中」と表示されます。
          </p>
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label htmlFor="emergency-reason" className="text-xs font-medium text-[var(--color-fg)]">停止理由（必須）</label>
              {emergencyError && (
                <span id="emergency-reason-error" role="alert" className="flex items-center gap-1 text-xs text-[var(--color-error-soft-fg)]">
                  <AlertTriangleIcon className="h-3 w-3 text-[var(--color-error)]" aria-hidden="true" />
                  入力してください
                </span>
              )}
            </div>
            <textarea
              id="emergency-reason"
              value={emergencyReason}
              onChange={(e) => { setEmergencyReason(e.target.value); if (emergencyError && e.target.value.trim()) setEmergencyError(false) }}
              rows={2}
              aria-invalid={emergencyError}
              aria-describedby={emergencyError ? 'emergency-reason-error' : undefined}
              className={'w-full rounded-[var(--radius-control)] border px-3 py-2 text-sm outline-none ' + (emergencyError ? 'border-[var(--color-error)] bg-[var(--color-error-soft)]' : 'border-[var(--color-border-strong)] bg-[var(--color-panel)] focus:border-[var(--color-primary)]')}
              placeholder="例: 誤入力が急増したため一時停止"
            />
          </div>
        </div>
      </Modal>

      {/* 再開 dialog (理由必須、trust 原状回復) */}
      <ReasonDialog
        open={resumeOpen}
        title="Agent を再開"
        label="再開の理由（必須）"
        placeholder="例: 原因の入力誤りを修正し、再開可能と判断"
        submitLabel="再開する"
        outcome={`緊急停止を解除し、自動化レベルを「${trustLevelLabel(restoreTrust)}」に戻します。再開理由は監査台帳に記録されます。`}
        onClose={() => setResumeOpen(false)}
        onSubmit={(reason) => { if (id) dispatch({ type: 'agent/resume', id, reason }); showToast('Agent を再開しました（緊急停止を解除）') }}
      />

      {/* 設定承認の差戻し dialog (理由必須、approvePromotion と SoD 対) */}
      <ReasonDialog
        open={configSendbackOpen}
        title="設定変更を差戻し"
        label="差戻しの理由 (必須)"
        placeholder="申請者が再検討できるよう、何を直してほしいか具体的に。"
        submitLabel="差戻す"
        outcome="差戻すと申請は取り下げられ、申請者が修正後に再申請できます。"
        onClose={() => setConfigSendbackOpen(false)}
        onSubmit={(reason) => { if (id) dispatch({ type: 'agent/sendbackPromotion', id, reason }); showToast('設定変更を差戻しました — 申請者の再検討に戻ります') }}
      />

      <Toast toast={toast} onDismiss={dismissToast} />
    </div>
  )
}
