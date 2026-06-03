import { useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ChevronRightIcon,
  ShieldCheckIcon,
  CheckIcon,
  CornerUpLeftIcon,
  AlertTriangleIcon,
  FileTextIcon,
  ArrowRightIcon,
  RotateCcwIcon,
  Undo2Icon,
  GavelIcon,
  PencilLineIcon,
} from 'lucide-react'
import { CASE_DETAILS, buildLifecycle, buildManualCaseDetail } from '@/data/mock-case-detail'
import type { CaseDetailModel } from '@/data/mock-case-detail'
import type { FieldReview, ReconcileState } from '@/data/types'
import { isResolved } from '@/lib/reconcile-display'
import { caseStatusToTone, caseStatusLabel } from '@/lib/status-tones'
import { useCase, useStoreDispatch, useCurrentActor, useCanApprove, useCanReverse, useCaseAuditEvents } from '@/store/hooks'
import { resolveCaseActors } from '@/store/selectors'
import { FieldActionModal } from '@/components/case/FieldActionModal'
import type { ActionKind } from '@/components/case/FieldActionModal'
import { ReasonDialog } from '@/components/shared/ReasonDialog'
import { Toast } from '@/components/shared/Toast'
import { useToast } from '@/hooks/useToast'
import { statusBadgeCls } from './tokens'
import { ToneChip } from './ui'

/**
 * CaseDetailV2 — 案件詳細 (detail、store 配線済)。
 * C 型契約 (A 全体可視 / B 証拠アンカー 2-pane / C 単一決定 footer) + four-eyes hard (useCanApprove)。
 * 生 confidence 非表示 → reconcile 状態。承認/差戻し/field 確定は store dispatch。
 */

const RECON: Record<ReconcileState, { label: string; tone: 'success' | 'alert' | 'error' }> = {
  matched: { label: '一致', tone: 'success' },
  normalized_match: { label: '一致', tone: 'success' },
  manually_confirmed: { label: '確認済', tone: 'success' },
  needs_review: { label: '要確認', tone: 'alert' },
  not_extracted: { label: '未取得', tone: 'alert' },
  escalated: { label: 'エスカレーション', tone: 'error' },
}

function ReconBadge({ state }: { state: ReconcileState }) {
  const m = RECON[state]
  return (
    <span className={`inline-flex flex-shrink-0 items-center gap-1 rounded-[var(--v2-radius-chip)] border px-1.5 py-0.5 text-[11px] font-medium ${statusBadgeCls(m.tone)}`}>
      {m.tone === 'success' ? <CheckIcon className="h-3 w-3" aria-hidden="true" /> : <AlertTriangleIcon className="h-3 w-3" aria-hidden="true" />}
      {m.label}
    </span>
  )
}

function FieldRow({ f, active, readOnly, onSelect, onAct }: { f: FieldReview; active: boolean; readOnly: boolean; onSelect: () => void; onAct: () => void }) {
  const mono = f.mono ? 'v2-mono' : ''
  const changed = f.previousValue !== undefined
  const normalized = f.reconcileState === 'normalized_match' && f.ocrRawValue !== undefined && f.ocrRawValue !== f.aiValue
  const review = f.reconcileState === 'needs_review'
  return (
    <div
      onClick={onSelect}
      className={
        'w-full rounded-[var(--v2-radius-card)] border bg-[var(--v2-panel)] p-3 text-left transition-colors ' +
        (active ? 'border-[var(--v2-accent)] ring-1 ring-[var(--v2-accent)]' : 'border-[var(--v2-border)] hover:border-[var(--v2-border-strong)]')
      }
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[13px] font-medium text-[var(--v2-fg)]">{f.fieldLabel}</span>
        <ReconBadge state={f.reconcileState} />
      </div>
      <div className="mt-2 text-[13px]">
        {changed ? (
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className={`rounded-[var(--v2-radius-chip)] bg-[var(--v2-diff-del-bg)] px-1.5 py-0.5 text-[var(--v2-fg-muted)] line-through ${mono}`}>
              <span className="sr-only">変更前 </span>
              {f.previousValue}
            </span>
            <ArrowRightIcon className="h-3.5 w-3.5 text-[var(--v2-fg-subtle)]" aria-hidden="true" />
            <span className={`rounded-[var(--v2-radius-chip)] bg-[var(--v2-diff-add-bg)] px-1.5 py-0.5 font-medium text-[var(--v2-fg)] ${mono}`}>
              <span className="sr-only">変更後 </span>
              {f.humanValue ?? f.aiValue}
            </span>
          </div>
        ) : review ? (
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[12px]">
            <dt className="text-[var(--v2-fg-muted)]">AI 入力</dt>
            <dd className={`text-[var(--v2-fg)] ${mono}`}>{f.aiValue}</dd>
            <dt className="text-[var(--v2-fg-muted)]">申請書類</dt>
            <dd className={`text-[var(--v2-alert-soft-fg)] ${mono}`}>{f.ocrRawValue}</dd>
            {f.masterValue && (
              <>
                <dt className="text-[var(--v2-fg-muted)]">登録値</dt>
                <dd className={`text-[var(--v2-fg)] ${mono}`}>{f.masterValue}</dd>
              </>
            )}
          </dl>
        ) : (
          <span className={`text-[var(--v2-fg)] ${mono}`}>{f.humanValue ?? f.aiValue}</span>
        )}
        {normalized && !changed && (
          <p className="mt-1 text-[11px] text-[var(--v2-fg-tertiary)]">
            申請書類「{f.ocrRawValue}」を正規化{f.normalizationNote ? `（${f.normalizationNote}）` : ''}
          </p>
        )}
      </div>
      <div className="mt-2 flex items-center justify-between">
        {f.sourceLocator ? (
          <span className="flex items-center gap-1 text-[11px] text-[var(--v2-fg-tertiary)]">
            <FileTextIcon className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
            <span className="v2-mono">{f.sourceLocator.doc} · {f.sourceLocator.page} · {f.sourceLocator.region}</span>
          </span>
        ) : (
          <span />
        )}
        {!readOnly && !isResolved(f.reconcileState) && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onAct() }}
            className="flex items-center gap-1 rounded-[var(--v2-radius-control)] border border-[var(--v2-border-strong)] bg-[var(--v2-panel)] px-2 py-0.5 text-[11px] font-medium text-[var(--v2-fg)] hover:bg-[var(--v2-panel-inset)]"
          >
            対応
          </button>
        )}
        {!readOnly && isResolved(f.reconcileState) && f.humanValue !== undefined && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onAct() }}
            className="flex items-center gap-1 rounded-[var(--v2-radius-control)] border border-[var(--v2-border-strong)] bg-[var(--v2-panel)] px-2 py-0.5 text-[11px] font-medium text-[var(--v2-fg-muted)] hover:bg-[var(--v2-panel-inset)] hover:text-[var(--v2-fg)]"
          >
            確認
          </button>
        )}
      </div>
    </div>
  )
}

function firstReviewLabel(c: CaseDetailModel | undefined, resolvedIds: string[] = []): string {
  if (!c || c.fields.length === 0) return ''
  const resolved = new Set(resolvedIds)
  const review = c.fields.find((f) => !resolved.has(f.fieldLabel) && !isResolved(f.reconcileState))
  return (review ?? c.fields[0])?.fieldLabel ?? ''
}

export function CaseDetailV2() {
  const { id } = useParams()
  const entity = useCase(id)
  const dispatch = useStoreDispatch()
  const actor = useCurrentActor()
  const mode: 'input' | 'checker' = actor?.role === 'inputter' ? 'input' : 'checker'
  const { toast, show: showToast, dismiss: dismissToast } = useToast()

  const c = useMemo(
    () =>
      (id ? CASE_DETAILS[id] : undefined) ??
      (id && entity ? buildManualCaseDetail(id, entity.workflowName, entity.assignee, entity.overrides, entity.status) : undefined),
    [id, entity],
  )

  const [activeFieldLabel, setActiveFieldLabel] = useState<string>(() => firstReviewLabel(c, entity?.resolvedFieldIds))
  // field-level / case-level の対応 modal、反映済 訂正/取消 dialog、escalation 差戻し裁定 dialog (v1 CaseDetail parity)。
  const [modalField, setModalField] = useState<FieldReview | null>(null)
  const [caseSendbackOpen, setCaseSendbackOpen] = useState(false)
  const [reverseKind, setReverseKind] = useState<'訂正' | '取消' | null>(null)
  const [arbitrateSendbackOpen, setArbitrateSendbackOpen] = useState(false)
  const [prevId, setPrevId] = useState(id)
  if (id !== prevId) {
    setPrevId(id)
    setActiveFieldLabel(firstReviewLabel(c, entity?.resolvedFieldIds))
    setModalField(null)
    setCaseSendbackOpen(false)
    setReverseKind(null)
    setArbitrateSendbackOpen(false)
    dismissToast()
  }

  // store overlay: resolvedFieldIds + overrides を dict fields に被せる (store-truth)。
  const fields = useMemo(() => {
    const resolved = new Set(entity?.resolvedFieldIds ?? [])
    const overrides = entity?.overrides ?? {}
    return (c?.fields ?? []).map((f): FieldReview => {
      const ov = overrides[f.fieldLabel]
      const withHuman = ov !== undefined ? { ...f, humanValue: ov } : f
      return resolved.has(f.fieldLabel) ? { ...withHuman, reconcileState: 'manually_confirmed' } : withHuman
    })
  }, [c, entity?.resolvedFieldIds, entity?.overrides])

  const approveGate = useCanApprove(id, mode)
  // 反映済の訂正/取消 可否 (W3 C3) + 操作証跡 (F-018、reversal/escalation の who/when を canonical 台帳から)。
  const reverseGate = useCanReverse(id, mode)
  const caseEvents = useCaseAuditEvents(id)

  if (!c)
    return (
      <div className="flex h-full items-center justify-center p-8 text-center">
        <div>
          <p className="text-[14px] font-medium text-[var(--v2-fg)]">指定の案件が見つかりません。</p>
          <Link to="/cases" className="mt-2 inline-block text-[13px] font-medium text-[var(--v2-accent-strong)] hover:underline">
            案件キューへ戻る
          </Link>
        </div>
      </div>
    )

  const readOnly = !entity
  const openCount = fields.filter((f) => !isResolved(f.reconcileState)).length
  const liveStatus = entity?.status ?? c.status
  const lifecycle = liveStatus === c.status ? c.lifecycle : buildLifecycle(liveStatus, c.inputter, c.approver)
  const canSendback = !readOnly && (liveStatus === 'ready' || liveStatus === 'business-approval-waiting')
  const inputApproverName = resolveCaseActors(entity, c).inputterName
  // F-018: 直近の reversal/escalation/裁定 event を auditEvents (canonical 証跡) から取得し who/when を banner に出す。
  const reversalEvent = [...caseEvents].reverse().find((e) => e.action === '訂正' || e.action === '取消')
  const escalation = entity?.escalation
  const escalationPending = escalation !== undefined && escalation.resolution === undefined
  const escalationEvent = [...caseEvents].reverse().find((e) => e.action === 'エスカレーション')
  const arbitrationEvent = [...caseEvents].reverse().find((e) => e.action === 'エスカレーション裁定')
  // F-018: 差戻し/取消後の sent-back は再処理が必要な dead-end。入力者が再処理に入れる導線を出す。
  const canReprocess = !readOnly && mode === 'input' && liveStatus === 'sent-back'
  // F-041: 入力者承認後 (business-approval-waiting) の入力者ビューは、disabled 承認でなく承認者待ちの前向き状態カードを出す。
  const awaitingChecker = !readOnly && mode === 'input' && liveStatus === 'business-approval-waiting'
  // F-016: 裁定権は指名された裁定者 (escalation.to = 業務責任者) のみ。起票入力者の自己裁定を UI でも block (reducer と二重 gate)。
  const canArbitrate = escalationPending && !readOnly && escalation.to === actor?.id && liveStatus !== 'reflected'

  // FieldActionModal (field-level) の onSubmit: 確定/上書き → case/override、差戻し → case/sendback、エスカレーション → case/escalate。
  const handleAct = (fieldLabel: string, kind: ActionKind, detail: { reason?: string; category?: string; value?: string }) => {
    if (!id || readOnly) return
    if (kind === 'accept' || kind === 'override') {
      dispatch({ type: 'case/override', id, fieldLabel, value: detail.value ?? '' })
      showToast(`${fieldLabel} を確定しました`)
    } else if (kind === 'sendback') {
      dispatch({ type: 'case/sendback', id, reason: detail.reason ?? '', category: detail.category ?? '' })
      showToast(`${fieldLabel} を差戻しました — 再処理後に確認待ちへ`)
    } else {
      dispatch({ type: 'case/escalate', id, reason: detail.reason ?? '', category: detail.category ?? '', to: 'actor-approver' })
      showToast(`${fieldLabel} を業務責任者へエスカレーションしました`)
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="flex flex-shrink-0 flex-col justify-center gap-2 border-b border-[var(--v2-border)] bg-[var(--v2-panel)] px-6 py-3">
        <div className="flex items-center gap-1.5 text-[11px] text-[var(--v2-fg-muted)]">
          <span>{c.workflowName}</span>
          <ChevronRightIcon className="h-3 w-3 text-[var(--v2-fg-subtle)]" aria-hidden="true" />
          <Link to="/cases" className="hover:text-[var(--v2-fg)] hover:underline">案件キュー</Link>
          <ChevronRightIcon className="h-3 w-3 text-[var(--v2-fg-subtle)]" aria-hidden="true" />
          <span className="v2-mono text-[var(--v2-fg)]">{c.id}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="flex items-baseline gap-2 text-[18px] font-semibold text-[var(--v2-fg)]">
              <span className="v2-mono text-[15px] text-[var(--v2-fg-muted)]">{c.id}</span>
              <span>{c.workflowName}</span>
            </h1>
            <ToneChip tone={caseStatusToTone(liveStatus)} label={caseStatusLabel(liveStatus)} />
          </div>
          <span
            title="操作ビューは操作者 (右上) の役割で切替わります"
            className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-[var(--v2-radius-control)] border border-[var(--v2-border)] bg-[var(--v2-panel-inset)] px-2.5 py-1 text-[12px] font-medium text-[var(--v2-fg-tertiary)]"
          >
            <ShieldCheckIcon className="h-3.5 w-3.5" aria-hidden="true" />
            {mode === 'input' ? '入力者ビュー' : '承認者ビュー'}
          </span>
        </div>
        <ol className="mt-1 flex items-center gap-1">
          {lifecycle.map((s, i) => (
            <li key={s.step} className="flex flex-1 items-center gap-1">
              <span
                className={
                  'flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ' +
                  (s.done ? 'bg-[var(--v2-accent)] text-white' : s.current ? 'border-2 border-[var(--v2-accent)] bg-[var(--v2-panel)] text-[var(--v2-accent-strong)]' : 'border border-[var(--v2-border-strong)] bg-[var(--v2-panel)] text-[var(--v2-fg-subtle)]')
                }
              >
                {s.done ? <CheckIcon className="h-3 w-3" aria-hidden="true" /> : i + 1}
              </span>
              <span className={'truncate text-[11px] ' + (s.current ? 'font-medium text-[var(--v2-fg)]' : 'text-[var(--v2-fg-muted)]')}>{s.step}</span>
              {i < lifecycle.length - 1 && <span className={'h-px flex-1 ' + (s.done ? 'bg-[var(--v2-accent)]' : 'bg-[var(--v2-border)]')} />}
            </li>
          ))}
        </ol>
      </header>

      {/* Body: 2-pane */}
      <div className="flex-1 overflow-hidden p-4">
        <div className="grid h-full grid-cols-1 gap-4 lg:grid-cols-[52fr_48fr]">
          <section className="flex min-h-0 flex-col overflow-hidden rounded-[var(--v2-radius-card)] border border-[var(--v2-border)] bg-[var(--v2-panel)] shadow-[var(--v2-shadow-sm)]">
            <div className="flex items-center justify-between border-b border-[var(--v2-hairline)] px-4 py-2.5">
              <span className="flex items-center gap-1.5 text-[12px] font-medium text-[var(--v2-fg)]">
                <FileTextIcon className="h-4 w-4 text-[var(--v2-fg-muted)]" aria-hidden="true" />
                申請書類
              </span>
              <span className="v2-mono text-[11px] text-[var(--v2-fg-tertiary)]">{c.document.fileName} · {c.document.page}/{c.document.pageCount}</span>
            </div>
            <div className="flex-1 overflow-auto p-5">
              <div className="mx-auto max-w-[440px] rounded-[var(--v2-radius-control)] border border-[var(--v2-paper-line)] bg-[var(--v2-paper)] p-5 shadow-[var(--v2-shadow-xs)]">
                <h2 className="mb-4 border-b border-[var(--v2-paper-line)] pb-2 text-center text-[14px] font-semibold tracking-wide text-[var(--v2-paper-ink)]">{c.document.title}</h2>
                <dl className="flex flex-col">
                  {c.document.rows.map((r) => {
                    const isActive = r.fieldLabel !== undefined && r.fieldLabel === activeFieldLabel
                    return (
                      <div key={r.label} className={'grid grid-cols-[88px_1fr] gap-3 rounded-[5px] px-2 py-2 ' + (isActive ? 'bg-[var(--v2-accent-soft)] ring-1 ring-[var(--v2-accent-soft-border)]' : r.highlight ? 'bg-[var(--v2-alert-soft)]' : '')}>
                        <dt className="text-[11px] text-[var(--v2-paper-label)]">{r.label}</dt>
                        <dd className="text-[13px] text-[var(--v2-paper-ink)]">{r.value}</dd>
                      </div>
                    )
                  })}
                </dl>
              </div>
            </div>
          </section>

          <section className="flex min-h-0 flex-col overflow-hidden">
            <div className="mb-2 text-[12px] text-[var(--v2-fg-muted)]">
              突合結果 — 全 {fields.length} 項目中{' '}
              {openCount > 0 ? <strong className="text-[var(--v2-alert-soft-fg)]">要確認 {openCount} 件</strong> : <strong className="text-[var(--v2-success-soft-fg)]">すべて確認済</strong>}
            </div>
            {/* F-021: 参照専用の過去案件 (提案 sourceCases = 誤確定→是正の実例) に履歴注記。 */}
            {c.historyNote && (
              <div className="mb-2 flex items-start gap-2 rounded-[var(--v2-radius-card)] border border-[var(--v2-border)] bg-[var(--v2-panel-inset)] px-3 py-2 text-[12px]">
                <RotateCcwIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--v2-fg-muted)]" aria-hidden="true" />
                <p className="text-[var(--v2-fg-tertiary)]">{c.historyNote}</p>
              </div>
            )}
            {/* F-013: エスカレーション裁定の永続マーカー (未裁定 = 裁定待ち)。 */}
            {escalationPending && (
              <div className="mb-2 flex items-start gap-2 rounded-[var(--v2-radius-card)] border border-[var(--v2-alert-soft-border)] bg-[var(--v2-alert-soft)] px-3 py-2 text-[12px]">
                <AlertTriangleIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--v2-alert-soft-fg)]" aria-hidden="true" />
                <div>
                  <div className="font-medium text-[var(--v2-fg)]">業務責任者へ裁定依頼中{escalation.category ? `（${escalation.category}）` : ''} — 裁定待ち</div>
                  <p className="mt-0.5 text-[var(--v2-fg-muted)]">依頼理由: {escalation.reason}</p>
                  {escalationEvent && (
                    <p className="mt-0.5 v2-mono text-[10px] text-[var(--v2-fg-tertiary)]">{escalationEvent.actor}（{escalationEvent.role}） · {escalationEvent.ts}</p>
                  )}
                </div>
              </div>
            )}
            {/* F-016: 続行可裁定の結果を永続表示 (差戻し裁定は status→sent-back ゆえ下の差戻し banner)。 */}
            {escalation?.resolution === 'proceed' && (
              <div className="mb-2 flex items-start gap-2 rounded-[var(--v2-radius-card)] border border-[var(--v2-success-soft-border)] bg-[var(--v2-success-soft)] px-3 py-2 text-[12px]">
                <GavelIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--v2-success-soft-fg)]" aria-hidden="true" />
                <div>
                  <div className="font-medium text-[var(--v2-fg)]">エスカレーション裁定: 続行可 — このまま処理を進められます</div>
                  {escalation.reason && <p className="mt-0.5 text-[var(--v2-fg-muted)]">依頼理由: {escalation.reason}</p>}
                  {arbitrationEvent && (
                    <p className="mt-0.5 v2-mono text-[10px] text-[var(--v2-fg-tertiary)]">{arbitrationEvent.actor}（{arbitrationEvent.role}） · {arbitrationEvent.ts}</p>
                  )}
                </div>
              </div>
            )}
            {/* sendback-guard: 差戻し済の理由を read-only 再表示 (理由を捨てない)。 */}
            {entity?.sendback && (
              <div className="mb-2 flex items-start gap-2 rounded-[var(--v2-radius-card)] border border-[var(--v2-alert-soft-border)] bg-[var(--v2-alert-soft)] px-3 py-2 text-[12px]">
                <CornerUpLeftIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--v2-alert-soft-fg)]" aria-hidden="true" />
                <div>
                  <div className="font-medium text-[var(--v2-fg)]">この案件は差戻し済みです{entity.sendback.category ? `（${entity.sendback.category}）` : ''}</div>
                  <p className="mt-0.5 text-[var(--v2-fg-muted)]">差戻し理由: {entity.sendback.reason}</p>
                </div>
              </div>
            )}
            {/* W3 C3: 反映済からの訂正/取消 記録 (終端を可逆化したことを明示)。 */}
            {entity?.reversal && (
              <div className="mb-2 flex items-start gap-2 rounded-[var(--v2-radius-card)] border border-[var(--v2-accent-soft-border)] bg-[var(--v2-accent-soft)] px-3 py-2 text-[12px]">
                <RotateCcwIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--v2-accent-soft-fg)]" aria-hidden="true" />
                <div>
                  <div className="font-medium text-[var(--v2-fg)]">この案件は反映済から{entity.reversal.kind}されました — 再処理が必要です</div>
                  <p className="mt-0.5 text-[var(--v2-fg-tertiary)]">{entity.reversal.kind}理由: {entity.reversal.reason}</p>
                  {reversalEvent && (
                    <p className="mt-0.5 v2-mono text-[10px] text-[var(--v2-fg-tertiary)]">{reversalEvent.actor}（{reversalEvent.role}） · {reversalEvent.ts}</p>
                  )}
                </div>
              </div>
            )}
            {mode === 'checker' && (
              <div className="mb-2 flex items-center gap-2 rounded-[var(--v2-radius-card)] border border-[var(--v2-accent-soft-border)] bg-[var(--v2-accent-soft)] px-3 py-2 text-[12px]">
                <ShieldCheckIcon className="h-4 w-4 flex-shrink-0 text-[var(--v2-accent-soft-fg)]" aria-hidden="true" />
                <span className="text-[var(--v2-fg)]">承認者ビュー — 入力者 <strong>{inputApproverName}</strong> の確認結果を最終承認（承認者 ≠ 入力者）</span>
              </div>
            )}
            <div className="flex flex-col gap-2 overflow-auto pr-0.5">
              {[...fields]
                .sort((a, b) => (a.reconcileState === 'needs_review' ? -1 : 0) - (b.reconcileState === 'needs_review' ? -1 : 0))
                .map((f) => (
                  <FieldRow key={f.fieldLabel} f={f} readOnly={readOnly} active={f.fieldLabel === activeFieldLabel} onSelect={() => setActiveFieldLabel(f.fieldLabel)} onAct={() => setModalField(f)} />
                ))}
            </div>
          </section>
        </div>
      </div>

      {/* Footer: 単一決定面 (v1 parity: reverse > arbitrate > reprocess > awaitingChecker > default) */}
      <footer className="flex flex-shrink-0 items-center justify-between border-t border-[var(--v2-border)] bg-[var(--v2-panel)] px-6 py-3">
        {reverseGate.allowed ? (
          // W3 C3: 反映済の単一決定面 — 承認/差戻し でなく 訂正/取消 を出す (2 個目の standing cluster を作らない)。
          <>
            <div className="text-[12px] text-[var(--v2-fg-muted)]">
              反映済 — 内容に誤りがあれば<strong className="text-[var(--v2-fg)]">訂正</strong>、誤った反映なら<strong className="text-[var(--v2-fg)]">取消</strong>できます（理由必須）
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setReverseKind('取消')} className="flex items-center gap-1.5 rounded-[var(--v2-radius-control)] border border-[var(--v2-border-strong)] bg-[var(--v2-panel)] px-3.5 py-1.5 text-[13px] text-[var(--v2-fg)] hover:bg-[var(--v2-panel-inset)]">
                <Undo2Icon className="h-4 w-4" aria-hidden="true" />
                取消
              </button>
              <button type="button" onClick={() => setReverseKind('訂正')} className="flex items-center gap-1.5 rounded-[var(--v2-radius-control)] px-4 py-1.5 text-[13px] font-medium bg-[var(--v2-accent)] text-white hover:bg-[var(--v2-accent-hover)]">
                <PencilLineIcon className="h-4 w-4" aria-hidden="true" />
                訂正
              </button>
            </div>
          </>
        ) : canArbitrate ? (
          // F-016: エスカレーション裁定の単一決定面 (業務責任者のみ)。続行可 (肯定経路) と 差戻し の 2 出口。
          <>
            <div className="flex items-center gap-1.5 text-[12px] text-[var(--v2-fg-muted)]">
              <GavelIcon className="h-3.5 w-3.5 text-[var(--v2-alert-soft-fg)]" aria-hidden="true" />
              エスカレーション裁定 — <strong className="text-[var(--v2-fg)]">続行可</strong>（このまま処理）か<strong className="text-[var(--v2-fg)]">差戻し</strong>（理由必須）を選びます。結果は起票者へ通知されます。
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setArbitrateSendbackOpen(true)} className="flex items-center gap-1.5 rounded-[var(--v2-radius-control)] border border-[var(--v2-border-strong)] bg-[var(--v2-panel)] px-3.5 py-1.5 text-[13px] text-[var(--v2-fg)] hover:bg-[var(--v2-panel-inset)]">
                <CornerUpLeftIcon className="h-4 w-4" aria-hidden="true" />
                差戻し
              </button>
              <button
                type="button"
                onClick={() => { if (id) dispatch({ type: 'case/resolveEscalation', id, resolution: 'proceed' }); showToast('続行可で裁定しました — 起票者へ通知しました') }}
                className="flex items-center gap-1.5 rounded-[var(--v2-radius-control)] px-4 py-1.5 text-[13px] font-medium bg-[var(--v2-accent)] text-white hover:bg-[var(--v2-accent-hover)]"
              >
                <CheckIcon className="h-4 w-4" aria-hidden="true" />
                続行可
              </button>
            </div>
          </>
        ) : canReprocess ? (
          // F-018: 差戻し/取消後の sent-back を dead-end にしない。入力者が再処理に入れる単一決定面。
          <>
            <div className="text-[12px] text-[var(--v2-fg-muted)]">
              差戻し/取消後の案件です — <strong className="text-[var(--v2-fg)]">再処理</strong>して確認待ちに戻します
            </div>
            <button
              type="button"
              onClick={() => { if (id) dispatch({ type: 'case/reprocess', id }); showToast('再処理を開始しました — 確認待ちに戻しました') }}
              className="flex items-center gap-1.5 rounded-[var(--v2-radius-control)] px-4 py-1.5 text-[13px] font-medium bg-[var(--v2-accent)] text-white hover:bg-[var(--v2-accent-hover)]"
            >
              <RotateCcwIcon className="h-4 w-4" aria-hidden="true" />
              再処理する
            </button>
          </>
        ) : awaitingChecker ? (
          // F-041: 入力者承認後は disabled 承認でなく、承認者への前向き状態カード + キュー導線。
          <>
            <div className="flex items-center gap-1.5 text-[12px] text-[var(--v2-fg-muted)]">
              <ShieldCheckIcon className="h-3.5 w-3.5 flex-shrink-0 text-[var(--v2-success-soft-fg)]" aria-hidden="true" />
              入力者確認は完了しました — <strong className="text-[var(--v2-fg)]">承認者の最終承認待ち</strong>です（別担当者が承認します）
            </div>
            <Link
              to="/approvals"
              className="flex items-center gap-1.5 rounded-[var(--v2-radius-control)] border border-[var(--v2-border-strong)] bg-[var(--v2-panel)] px-3.5 py-1.5 text-[13px] font-medium text-[var(--v2-fg)] hover:bg-[var(--v2-panel-inset)]"
            >
              承認待ちキューへ
              <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
            </Link>
          </>
        ) : (
          <>
            <div className="text-[12px]">
              {readOnly ? (
                <span className="text-[var(--v2-fg-muted)]">過去の案件 — 参照専用です</span>
              ) : approveGate.allowed ? (
                <span className="flex items-center gap-1.5 text-[var(--v2-success-soft-fg)]">
                  <ShieldCheckIcon className="h-3.5 w-3.5" aria-hidden="true" />
                  {mode === 'checker' ? <>入力者 <strong className="text-[var(--v2-fg)]">{inputApproverName}</strong> ≠ 承認者 — 最終承認できます</> : '全項目確認済 — 承認できます'}
                </span>
              ) : (
                <span className={'flex items-center gap-1.5 ' + (mode === 'input' && openCount > 0 ? 'text-[var(--v2-alert-soft-fg)]' : 'text-[var(--v2-fg-muted)]')}>
                  {mode === 'input' && openCount > 0 && <AlertTriangleIcon className="h-3.5 w-3.5" aria-hidden="true" />}
                  {approveGate.reason}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={!canSendback}
                title={!canSendback && !readOnly ? 'この段階では差戻しできません' : undefined}
                onClick={() => setCaseSendbackOpen(true)}
                className={'flex items-center gap-1.5 rounded-[var(--v2-radius-control)] border border-[var(--v2-border-strong)] bg-[var(--v2-panel)] px-3.5 py-1.5 text-[13px] text-[var(--v2-fg)] hover:bg-[var(--v2-panel-inset)] ' + (!canSendback ? 'cursor-not-allowed opacity-50 hover:bg-[var(--v2-panel)]' : '')}
              >
                <CornerUpLeftIcon className="h-4 w-4" aria-hidden="true" />
                差戻し
              </button>
              <button
                type="button"
                disabled={!approveGate.allowed}
                title={approveGate.allowed ? undefined : approveGate.reason}
                onClick={() => { if (id) { dispatch({ type: 'case/approve', id, by: mode === 'checker' ? 'checker' : 'input' }); showToast(mode === 'checker' ? '最終承認しました' : '承認しました — 承認者待ちへ') } }}
                className={'flex items-center gap-1.5 rounded-[var(--v2-radius-control)] px-4 py-1.5 text-[13px] font-medium ' + (!approveGate.allowed ? 'cursor-not-allowed bg-[var(--v2-panel-inset)] text-[var(--v2-fg-subtle)]' : 'bg-[var(--v2-accent)] text-white hover:bg-[var(--v2-accent-hover)]')}
              >
                <CheckIcon className="h-4 w-4" aria-hidden="true" />
                {mode === 'checker' ? '最終承認' : '承認'}
              </button>
            </div>
          </>
        )}
      </footer>

      {/* 項目の対応 (確定/上書き/差戻し/エスカレーション) */}
      <FieldActionModal field={modalField} onClose={() => setModalField(null)} onSubmit={handleAct} />
      {/* 案件全体の差戻し (理由カテゴリ + コメント必須) */}
      <FieldActionModal
        field={null}
        caseLevel={caseSendbackOpen}
        caseId={c.id}
        onClose={() => setCaseSendbackOpen(false)}
        onSubmit={(_target, _kind, detail) => {
          if (id) dispatch({ type: 'case/sendback', id, reason: detail.reason ?? '', category: detail.category ?? '' })
          showToast('案件を差戻しました — 再処理後に確認待ちへ')
        }}
      />

      {/* W3 C3: 反映済の訂正/取消 の理由入力 (理由必須 → case/reverse)。 */}
      <ReasonDialog
        open={reverseKind !== null}
        title={reverseKind === '取消' ? '反映済の案件を取消' : '反映済の案件を訂正'}
        label={`${reverseKind === '取消' ? '取消' : '訂正'}の理由 (必須)`}
        placeholder={reverseKind === '取消' ? 'なぜ取消すか（誤反映の理由など）を記入' : 'どの項目をどう訂正するかを記入'}
        submitLabel={reverseKind === '取消' ? '取消して差し戻す' : '訂正のため差し戻す'}
        outcome={
          reverseKind === '取消'
            ? '反映済の案件を差戻し（再処理）に戻します。取消理由は記録されます。'
            : '反映済の案件を差戻し（再処理）に戻します。再処理のうえ訂正してください。'
        }
        onClose={() => setReverseKind(null)}
        onSubmit={(reason) => {
          if (id && reverseKind) {
            dispatch({ type: 'case/reverse', id, kind: reverseKind, reason })
            showToast(reverseKind === '取消' ? '案件を取消しました — 再処理へ差し戻し' : '案件を訂正のため差し戻しました', { tone: 'alert', sticky: true })
          }
        }}
      />

      {/* F-016: エスカレーション差戻し裁定の理由入力 (理由必須 → case/resolveEscalation sendback)。category は元依頼を継承。 */}
      <ReasonDialog
        open={arbitrateSendbackOpen}
        title="エスカレーションを差戻しで裁定"
        label="差戻しの理由 (必須)"
        placeholder="なぜ差戻すか（不足情報・要再処理の理由など）を記入"
        submitLabel="差戻しで裁定する"
        outcome="案件を差戻し（再処理）に戻し、起票者へ裁定結果を通知します。理由は記録されます。"
        onClose={() => setArbitrateSendbackOpen(false)}
        onSubmit={(reason) => {
          if (id) dispatch({ type: 'case/resolveEscalation', id, resolution: 'sendback', reason, category: escalation?.category })
          showToast('差戻しで裁定しました — 起票者へ通知しました')
        }}
      />

      <Toast toast={toast} onDismiss={dismissToast} />
    </div>
  )
}
