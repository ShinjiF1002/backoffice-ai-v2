import { useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronRightIcon, ShieldCheckIcon, CheckIcon, CornerUpLeftIcon, RotateCcwIcon, PencilLineIcon, Undo2Icon, AlertTriangleIcon, GavelIcon } from 'lucide-react'
import { CASE_DETAILS, buildLifecycle, buildManualCaseDetail } from '@/data/mock-case-detail'
import type { CaseDetailModel } from '@/data/mock-case-detail'
import type { FieldReview } from '@/data/types'
import { isResolved } from '@/lib/reconcile-display'
import { caseStatusToTone, caseStatusLabel } from '@/lib/status-tones'
import { useCase, useStoreDispatch, useCurrentActor, useCanApprove, useCanReverse, useCaseAuditEvents } from '@/store/hooks'
import { useDetailDemo } from '@/hooks/useDetailDemo'
import { resolveCaseActors } from '@/store/selectors'
import { DocumentViewer } from '@/components/case/DocumentViewer'
import { LifecycleStepper } from '@/components/case/LifecycleStepper'
import { FieldActionModal } from '@/components/case/FieldActionModal'
import type { ActionKind } from '@/components/case/FieldActionModal'
import { ReconcilePanel } from '@/components/cross-cutting/ReconcilePanel'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { DetailDemoFallback } from '@/components/shared/DetailDemoFallback'
import { ReasonDialog } from '@/components/shared/ReasonDialog'
import { Toast } from '@/components/shared/Toast'
import { useToast } from '@/hooks/useToast'
import { cn } from '@/lib/cn'

/**
 * CaseDetail (rev.3 文書アンカー 2-pane) — Process-First v2 pilot / C 型 detail contract 基準
 * SSOT: reconcile-panel-spec §8 + screens-v2/04-case-detail/canonical-export.md
 * A 全体表示 (全項目可視) / B 証拠アンカー (左 申請書類ビューア) / C 単一決定面 (footer のみ)。
 */
/** 初期 active field: 最初の未解決 (store resolvedFieldIds overlay 後)、なければ先頭項目。 */
function firstReviewLabel(c: CaseDetailModel | undefined, resolvedIds: string[] = []): string | undefined {
  if (!c || c.fields.length === 0) return undefined
  const resolved = new Set(resolvedIds)
  const review = c.fields.find((f) => !resolved.has(f.fieldLabel) && !isResolved(f.reconcileState))
  return (review ?? c.fields[0])?.fieldLabel
}

export function CaseDetail() {
  const { id } = useParams()
  const entity = useCase(id)
  // 手動起票 (W3 C4) の store-only draft は CASE_DETAILS 不在 → 受付済 entity から faux detail を組む (EmptyState 回避)。
  const c = useMemo(
    () =>
      (id ? CASE_DETAILS[id] : undefined) ??
      (id && entity ? buildManualCaseDetail(id, entity.workflowName, entity.assignee, entity.overrides, entity.status) : undefined),
    [id, entity],
  )
  const dispatch = useStoreDispatch()
  // 操作ビュー (入力者/承認者) は操作者 persona の role から導出 (remediation B4: 自己切替を廃し SoD を honest 化)。
  // 切替は TopBar の操作者 switcher (session/switchActor)。inputter は入力者ビュー、承認者/業務責任者は承認者ビュー。
  const actor = useCurrentActor()
  const mode: 'input' | 'checker' = actor?.role === 'inputter' ? 'input' : 'checker'
  const [activeFieldLabel, setActiveFieldLabel] = useState<string | undefined>(() => firstReviewLabel(c, entity?.resolvedFieldIds))
  const [modalField, setModalField] = useState<FieldReview | null>(null)
  const [caseSendbackOpen, setCaseSendbackOpen] = useState(false)
  // 反映済の訂正/取消 (W3 C3) の理由入力 dialog: 捕捉中の kind (null = 閉)。
  const [reverseKind, setReverseKind] = useState<'訂正' | '取消' | null>(null)
  // F-016: エスカレーション差戻し裁定の理由入力 dialog (続行可は理由不要なので dialog なし)。
  const [arbitrateSendbackOpen, setArbitrateSendbackOpen] = useState(false)
  const { toast, show: showToast, dismiss: dismissToast } = useToast()
  // :id 変更で同 component が再 render される時の local state reset (set-state-in-effect 回避、render 中 adjusting)
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

  // overlay: dict の rich fields に store の resolvedFieldIds + overrides を被せる (store-truth)。
  // resolved は確認済表示に、override 済 field は humanValue (訂正値) を被せ確認済行/modal で訂正値を出す (B1)。
  const fields = useMemo(() => {
    const resolved = new Set(entity?.resolvedFieldIds ?? [])
    const overrides = entity?.overrides ?? {}
    return (c?.fields ?? []).map((f): FieldReview => {
      const ov = overrides[f.fieldLabel]
      const withHuman = ov !== undefined ? { ...f, humanValue: ov } : f
      return resolved.has(f.fieldLabel) ? { ...withHuman, reconcileState: 'manually_confirmed' } : withHuman
    })
  }, [c, entity?.resolvedFieldIds, entity?.overrides])
  const openCount = useMemo(() => fields.filter((f) => !isResolved(f.reconcileState)).length, [fields])
  // store に無い = 参照専用 (提案根拠の過去案件など)。全操作を抑止し false success を防ぐ。
  const readOnly = !entity
  // 承認可否 + disabled 理由を SoD + status precondition で 1 selector に集約 (B4)。自己承認は reducer + ここで block。
  const approveGate = useCanApprove(id, mode)
  // 反映済の訂正/取消 可否 (W3 C3)。承認者/業務責任者 + reflected + 未 reversal が条件 (reducer guard と一致)。
  const reverseGate = useCanReverse(id, mode)
  // F-018: reversal/差戻し の who/when は auditEvents (canonical) から参照 (CaseEntity に denormalize しない、W1.5 決定)。
  const caseEvents = useCaseAuditEvents(id)
  // F-009: detail route の取得状態 (?demo=loading/error) を list route と一貫させる demo seam。
  const demo = useDetailDemo()

  if (demo.status) return <DetailDemoFallback status={demo.status} onRetry={demo.onRetry} />

  if (!c)
    return (
      <div className="flex h-full items-center justify-center p-8">
        <EmptyState
          subState="truly-empty"
          title="指定の案件が見つかりません。"
          action={
            <Link to="/cases" className="text-sm font-medium text-[var(--color-primary-strong)] hover:underline">
              案件一覧へ戻る
            </Link>
          }
        />
      </div>
    )

  // status-badge-resolver (remediation 2b): header badge / stepper を store entity.status 由来で resolve。
  // liveStatus = 操作後の store 真値 (無ければ detail model の baseline)。badge tone は固定 'primary' を廃し resolver 経由。
  // lifecycle は live≠baseline (= 操作で前進) のとき再計算、一致時は model 既定 (canonical 0142 の bespoke time を温存)。
  const liveStatus = entity?.status ?? c.status
  const lifecycle = liveStatus === c.status ? c.lifecycle : buildLifecycle(liveStatus, c.inputter, c.approver)
  // 差戻し可否を precondition と一致 (false-action 防止、sendback-guard): ready / business-approval-waiting からのみ。
  const canSendback = !readOnly && (liveStatus === 'ready' || liveStatus === 'business-approval-waiting')
  // SoD 表示の入力者/承認者は actor SSOT (resolveCaseActors、F-001) で解決し Approvals/Observatory と一致させる。
  // 一覧 owner (c.inputter) は assignee であり入力者承認 actor とは限らない (例 0128 は owner=鈴木課長 だが入力者承認は山田太郎)。
  const inputApproverName = resolveCaseActors(entity, c).inputterName
  // F-018: 直近の reversal(訂正/取消) event を auditEvents から取得し who/when を banner に出す。
  const reversalEvent = [...caseEvents].reverse().find((e) => e.action === '訂正' || e.action === '取消')
  // F-018: 差戻し/取消 後の sent-back は再処理が必要な dead-end。入力者が再処理に入れる導線を出す。
  const canReprocess = !readOnly && mode === 'input' && liveStatus === 'sent-back'
  // F-041: 入力者承認後 (business-approval-waiting) の入力者ビューは、disabled 承認ボタンでなく次アクター (承認者待ち) への前向き状態カードを出す。
  const awaitingChecker = !readOnly && mode === 'input' && liveStatus === 'business-approval-waiting'
  // F-013/F-016: エスカレーション裁定。未裁定 (resolution 未確定) のとき永続マーカーを出す。
  // who/when は auditEvents (canonical) 由来 — 依頼 event と裁定 event をそれぞれ参照 (CaseEntity に denormalize しない)。
  const escalation = entity?.escalation
  const escalationPending = escalation !== undefined && escalation.resolution === undefined
  const escalationEvent = [...caseEvents].reverse().find((e) => e.action === 'エスカレーション')
  const arbitrationEvent = [...caseEvents].reverse().find((e) => e.action === 'エスカレーション裁定')
  // F-016: 裁定権は指名された裁定者 (escalation.to = 業務責任者) のみ。起票入力者の自己裁定を UI でも block (reducer と二重 gate)。
  const canArbitrate = escalationPending && !readOnly && escalation.to === actor?.id && liveStatus !== 'reflected'

  const handleAct = (fieldLabel: string, kind: ActionKind, detail: { reason?: string; category?: string; value?: string }) => {
    if (!id || readOnly) return
    if (kind === 'accept' || kind === 'override') {
      // B1: 確定値 (accept=申請書類値 / override=訂正値) を store の overrides に保存。確認済行に反映される。
      dispatch({ type: 'case/override', id, fieldLabel, value: detail.value ?? '' })
      showToast(`${fieldLabel} を確定しました`)
    } else if (kind === 'sendback') {
      // sendback-guard: 差戻し理由/カテゴリを store に保持 (理由を捨てない)。
      dispatch({ type: 'case/sendback', id, reason: detail.reason ?? '', category: detail.category ?? '' })
      showToast(`${fieldLabel} を差戻しました — 再処理後に確認待ちへ`)
    } else {
      // P1-3: エスカレーションを store 化 (showToast のみ → case/escalate)。受信 queue (/escalations) の母集合になる。
      // 宛先 = 業務責任者 (actor-approver)。裁定の帰結は業務責任者が case/sendback で行う (JG-3=a)。
      dispatch({ type: 'case/escalate', id, reason: detail.reason ?? '', category: detail.category ?? '', to: 'actor-approver' })
      showToast(`${fieldLabel} を業務責任者へエスカレーションしました`)
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header (sticky) */}
      <header
        data-page-header
        className="sticky top-0 z-30 flex min-h-[var(--height-pageheader)] flex-col justify-center gap-2 border-b border-[var(--color-border)] bg-[var(--color-panel)] px-6 py-3"
      >
        <div className="flex items-center gap-1.5 text-xs text-[var(--color-fg-muted)]">
          <span>{c.workflowName}</span>
          <ChevronRightIcon className="h-3 w-3 text-[var(--color-fg-subtle)]" />
          {/* F-012: 案件を捌いた後に一覧へ戻る明示導線 (非クリック span → Link、hover 下線 + focus ring)。 */}
          <Link
            to="/cases"
            className="rounded-[var(--radius-control)] hover:text-[var(--color-fg)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
          >
            案件一覧
          </Link>
          <ChevronRightIcon className="h-3 w-3 text-[var(--color-fg-subtle)]" />
          <span className="font-mono text-[var(--color-fg)]">{c.id}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="flex items-baseline gap-2 text-lg font-semibold text-[var(--color-fg)]">
              <span className="font-mono text-base">{c.id}</span>
              <span>{c.workflowName}</span>
            </h1>
            <StatusBadge tone={caseStatusToTone(liveStatus)} label={caseStatusLabel(liveStatus)} />
          </div>
          {/* 操作ビュー (read-only): 操作者 persona の role 由来。切替は TopBar の操作者 switcher (自己切替 block、SoD honest 化)。 */}
          <span
            title="操作ビューは操作者 (右上) の役割で切替わります"
            className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-panel-inset)] px-2.5 py-1 text-xs font-medium text-[var(--color-fg-tertiary)]"
          >
            <ShieldCheckIcon className="h-3.5 w-3.5 text-[var(--color-fg-tertiary)]" aria-hidden="true" />
            {mode === 'input' ? '入力者ビュー' : '承認者ビュー'}
          </span>
        </div>
        <LifecycleStepper steps={lifecycle} />
      </header>

      {/* Body: 文書アンカー 2-pane */}
      <div className="flex-1 overflow-hidden p-4">
        <div className="grid h-full grid-cols-1 gap-4 lg:grid-cols-[52fr_48fr]">
          <DocumentViewer document={c.document} origin={c.origin} activeFieldLabel={activeFieldLabel} onRowSelect={setActiveFieldLabel} />
          <div className="overflow-auto">
            {/* F-021: 参照専用の過去案件 (提案 sourceCases = 誤確定→是正の実例) に履歴注記を出し lineage と整合させる。 */}
            {c.historyNote && (
              <div className="mb-3 flex items-start gap-2 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-panel-inset)] p-3 text-xs">
                <RotateCcwIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--color-fg-muted)]" aria-hidden="true" />
                <p className="text-[var(--color-fg-tertiary)]">{c.historyNote}</p>
              </div>
            )}
            {/* F-013: エスカレーション裁定の永続マーカー。未裁定は「裁定依頼中」、続行可は裁定結果を残す（差戻し裁定は下の差戻し banner が担う）。 */}
            {escalationPending && (
              <div className="mb-3 flex items-start gap-2 rounded-[var(--radius-card)] border border-[var(--color-alert-soft-border)] bg-[var(--color-alert-soft)] p-3 text-xs">
                <AlertTriangleIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--color-alert)]" aria-hidden="true" />
                <div>
                  <div className="font-medium text-[var(--color-fg)]">
                    業務責任者へ裁定依頼中{escalation.category ? `（${escalation.category}）` : ''} — 裁定待ち
                  </div>
                  <p className="mt-0.5 text-[var(--color-fg-muted)]">依頼理由: {escalation.reason}</p>
                  {escalationEvent && (
                    <p className="mt-0.5 font-mono text-[10px] text-[var(--color-fg-tertiary)]">
                      {escalationEvent.actor}（{escalationEvent.role}） · {escalationEvent.ts}
                    </p>
                  )}
                </div>
              </div>
            )}
            {/* F-016: 続行可裁定の結果を永続表示 (差戻し裁定は status→sent-back ゆえ下の差戻し banner が担う)。 */}
            {escalation?.resolution === 'proceed' && (
              <div className="mb-3 flex items-start gap-2 rounded-[var(--radius-card)] border border-[var(--color-success-soft-border)] bg-[var(--color-success-soft)] p-3 text-xs">
                <GavelIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--color-success)]" aria-hidden="true" />
                <div>
                  <div className="font-medium text-[var(--color-fg)]">エスカレーション裁定: 続行可 — このまま処理を進められます</div>
                  {escalation.reason && <p className="mt-0.5 text-[var(--color-fg-muted)]">依頼理由: {escalation.reason}</p>}
                  {arbitrationEvent && (
                    <p className="mt-0.5 font-mono text-[10px] text-[var(--color-fg-tertiary)]">
                      {arbitrationEvent.actor}（{arbitrationEvent.role}） · {arbitrationEvent.ts}
                    </p>
                  )}
                </div>
              </div>
            )}
            {/* sendback-guard: 差戻し済みの案件は理由を read-only で再表示 (理由を捨てない)。 */}
            {entity?.sendback && (
              <div className="mb-3 flex items-start gap-2 rounded-[var(--radius-card)] border border-[var(--color-alert-soft-border)] bg-[var(--color-alert-soft)] p-3 text-xs">
                <CornerUpLeftIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--color-alert)]" aria-hidden="true" />
                <div>
                  <div className="font-medium text-[var(--color-fg)]">
                    この案件は差戻し済みです{entity.sendback.category ? `（${entity.sendback.category}）` : ''}
                  </div>
                  <p className="mt-0.5 text-[var(--color-fg-muted)]">差戻し理由: {entity.sendback.reason}</p>
                </div>
              </div>
            )}
            {/* W3 C3: 反映済からの訂正/取消 記録 (理由を捨てない、終端を可逆化したことを明示)。 */}
            {entity?.reversal && (
              <div className="mb-3 flex items-start gap-2 rounded-[var(--radius-card)] border border-[var(--color-primary-soft-border)] bg-[var(--color-primary-soft)] p-3 text-xs">
                <RotateCcwIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--color-primary-hover)]" aria-hidden="true" />
                <div>
                  <div className="font-medium text-[var(--color-fg)]">
                    この案件は反映済から{entity.reversal.kind}されました — 再処理が必要です
                  </div>
                  <p className="mt-0.5 text-[var(--color-fg-tertiary)]">{entity.reversal.kind}理由: {entity.reversal.reason}</p>
                  {/* F-018: who/when は auditEvents (canonical 証跡) 由来。CaseEntity に actor/timestamp を持たせない (W1.5 決定)。 */}
                  {reversalEvent && (
                    <p className="mt-0.5 font-mono text-[10px] text-[var(--color-fg-tertiary)]">
                      {reversalEvent.actor}（{reversalEvent.role}） · {reversalEvent.ts}
                    </p>
                  )}
                </div>
              </div>
            )}
            {/* PV3: 承認者ビューの SoD 説明 banner を削除 (header pill「承認者ビュー」+ LifecycleStepper の入力者/承認者 +
                footer「入力者 X ≠ 承認者 Y — 最終承認できます」が同情報を担保。本体 ReconcilePanel を押し下げる重複を排除)。 */}
            <ReconcilePanel
              fields={fields}
              origin={c.origin}
              approvable={approveGate.allowed}
              activeFieldLabel={activeFieldLabel}
              onSelectField={setActiveFieldLabel}
              onActOnField={(label) => setModalField(fields.find((f) => f.fieldLabel === label) ?? null)}
              readOnly={readOnly}
            />
          </div>
        </div>
      </div>

      {/* Footer: 単一決定面 (承認 / 差戻し) */}
      <footer className="sticky bottom-0 z-30 flex items-center justify-between border-t border-[var(--color-border)] bg-[var(--color-panel)] px-6 py-3">
        {reverseGate.allowed ? (
          // 反映済の単一決定面 (W3 C3): 承認/差戻し の代わりに 訂正/取消 を出す (2 個目の standing cluster を作らない、原則 C)。
          <>
            <div className="text-xs text-[var(--color-fg-muted)]">
              反映済 — 内容に誤りがあれば<strong className="text-[var(--color-fg)]">訂正</strong>、誤った反映なら
              <strong className="text-[var(--color-fg)]">取消</strong>できます（理由必須）
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setReverseKind('取消')}
                className="flex items-center gap-1.5 rounded-[var(--radius-control)] border border-[var(--color-border-strong)] bg-[var(--color-panel)] px-3 py-1.5 text-sm text-[var(--color-fg)] hover:bg-[var(--color-panel-inset)]"
              >
                <Undo2Icon className="h-4 w-4" />
                取消
              </button>
              <button
                type="button"
                onClick={() => setReverseKind('訂正')}
                className="flex items-center gap-1.5 rounded-[var(--radius-control)] bg-[var(--color-primary)] px-3 py-1.5 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)]"
              >
                <PencilLineIcon className="h-4 w-4" />
                訂正
              </button>
            </div>
          </>
        ) : canArbitrate ? (
          // F-016: エスカレーション裁定の単一決定面 (業務責任者のみ)。続行可 (肯定経路) と 差戻し の 2 出口を明示。
          <>
            <div className="flex items-center gap-1.5 text-xs text-[var(--color-fg-muted)]">
              <GavelIcon className="h-3.5 w-3.5 text-[var(--color-alert-soft-fg)]" aria-hidden="true" />
              エスカレーション裁定 — <strong className="text-[var(--color-fg)]">続行可</strong>（このまま処理）か
              <strong className="text-[var(--color-fg)]">差戻し</strong>（理由必須）を選びます。結果は起票者へ通知されます。
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setArbitrateSendbackOpen(true)}
                className="flex items-center gap-1.5 rounded-[var(--radius-control)] border border-[var(--color-border-strong)] bg-[var(--color-panel)] px-3 py-1.5 text-sm text-[var(--color-fg)] hover:bg-[var(--color-panel-inset)]"
              >
                <CornerUpLeftIcon className="h-4 w-4" />
                差戻し
              </button>
              <button
                type="button"
                onClick={() => {
                  if (id) dispatch({ type: 'case/resolveEscalation', id, resolution: 'proceed' })
                  showToast('続行可で裁定しました — 起票者へ通知しました')
                }}
                className="flex items-center gap-1.5 rounded-[var(--radius-control)] bg-[var(--color-primary)] px-3 py-1.5 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)]"
              >
                <CheckIcon className="h-4 w-4" />
                続行可
              </button>
            </div>
          </>
        ) : canReprocess ? (
          // F-018: 差戻し/取消後の sent-back を dead-end にしない。入力者が再処理に入れる単一決定面。
          <>
            <div className="text-xs text-[var(--color-fg-muted)]">
              差戻し/取消後の案件です — <strong className="text-[var(--color-fg)]">再処理</strong>して確認待ちに戻します
            </div>
            <button
              type="button"
              onClick={() => {
                if (id) dispatch({ type: 'case/reprocess', id })
                showToast('再処理を開始しました — 確認待ちに戻しました')
              }}
              className="flex items-center gap-1.5 rounded-[var(--radius-control)] bg-[var(--color-primary)] px-3 py-1.5 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)]"
            >
              <RotateCcwIcon className="h-4 w-4" />
              再処理する
            </button>
          </>
        ) : awaitingChecker ? (
          // F-041: 入力者承認後は disabled 承認でなく、次アクター (承認者) への前向き状態カード + キュー導線を出す。
          <>
            <div className="flex items-center gap-1.5 text-xs text-[var(--color-fg-muted)]">
              <ShieldCheckIcon className="h-3.5 w-3.5 flex-shrink-0 text-[var(--color-success-soft-fg)]" aria-hidden="true" />
              入力者確認は完了しました — <strong className="text-[var(--color-fg)]">承認者の最終承認待ち</strong>です（別担当者が承認します）
            </div>
            <Link
              to="/approvals"
              className="flex items-center gap-1.5 rounded-[var(--radius-control)] border border-[var(--color-border-strong)] bg-[var(--color-panel)] px-3 py-1.5 text-sm font-medium text-[var(--color-fg)] hover:bg-[var(--color-panel-inset)]"
            >
              承認待ちキューへ
              <ChevronRightIcon className="h-4 w-4" />
            </Link>
          </>
        ) : (
          <>
            <div className="text-xs">
              {readOnly ? (
                <span className="text-[var(--color-fg-muted)]">過去の案件 — 参照専用です（この画面では操作できません）</span>
              ) : approveGate.allowed ? (
                mode === 'checker' ? (
                  <span className="flex items-center gap-1.5 text-[var(--color-success-soft-fg)]">
                    <ShieldCheckIcon className="h-3.5 w-3.5" />
                    入力者 <strong className="text-[var(--color-fg)]">{inputApproverName}</strong> ≠ 承認者{' '}
                    <strong className="text-[var(--color-fg)]">{actor?.name ?? c.approver}</strong> — 最終承認できます
                  </span>
                ) : (
                  <span className="text-[var(--color-success-soft-fg)]">全項目確認済 — 承認できます</span>
                )
              ) : (
                // SoD block / status precondition の理由を 1 source (approveGate.reason) で表示。要確認残のみ alert tone。
                <span
                  className={cn(
                    'flex items-center gap-1.5',
                    mode === 'input' && openCount > 0 ? 'text-[var(--color-alert-soft-fg)]' : 'text-[var(--color-fg-muted)]'
                  )}
                >
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
                className={cn(
                  'flex items-center gap-1.5 rounded-[var(--radius-control)] border border-[var(--color-border-strong)] bg-[var(--color-panel)] px-3 py-1.5 text-sm text-[var(--color-fg)] hover:bg-[var(--color-panel-inset)]',
                  !canSendback && 'cursor-not-allowed opacity-50 hover:bg-[var(--color-panel)]'
                )}
              >
                <CornerUpLeftIcon className="h-4 w-4" />
                差戻し
              </button>
              <button
                type="button"
                disabled={!approveGate.allowed}
                title={approveGate.allowed ? undefined : approveGate.reason}
                onClick={() => {
                  if (id) dispatch({ type: 'case/approve', id, by: mode === 'checker' ? 'checker' : 'input' })
                  showToast(mode === 'checker' ? '最終承認しました' : '承認しました — 承認者待ちへ')
                }}
                className={cn(
                  'flex items-center gap-1.5 rounded-[var(--radius-control)] px-3 py-1.5 text-sm font-medium',
                  !approveGate.allowed
                    ? 'cursor-not-allowed bg-[var(--color-panel-inset)] text-[var(--color-fg-subtle)]'
                    : 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]'
                )}
              >
                <CheckIcon className="h-4 w-4" />
                {mode === 'checker' ? '最終承認' : '承認'}
              </button>
            </div>
          </>
        )}
      </footer>

      <FieldActionModal field={modalField} onClose={() => setModalField(null)} onSubmit={handleAct} />
      <FieldActionModal
        field={null}
        caseLevel={caseSendbackOpen}
        caseId={c.id}
        onClose={() => setCaseSendbackOpen(false)}
        onSubmit={(_target, _kind, detail) => {
          // sendback-guard: 案件全体の差戻し理由/カテゴリを store に保持 (理由を捨てない)。
          if (id) dispatch({ type: 'case/sendback', id, reason: detail.reason ?? '', category: detail.category ?? '' })
          showToast('案件を差戻しました — 再処理後に確認待ちへ')
        }}
      />

      {/* W3 C3: 反映済の訂正/取消 の理由入力 (理由必須 → reducer の case/reverse に dispatch)。 */}
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
            // F-027: 反映済の取消/訂正 は統制重要 — alert tone + sticky で見落とさせない (後追いは監査台帳)。
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
