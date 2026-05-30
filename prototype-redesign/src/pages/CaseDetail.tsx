import { useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronRightIcon, ShieldCheckIcon, CheckIcon, CornerUpLeftIcon } from 'lucide-react'
import { CASE_DETAILS, buildLifecycle } from '@/data/mock-case-detail'
import type { CaseDetailModel } from '@/data/mock-case-detail'
import type { FieldReview } from '@/data/types'
import { isResolved } from '@/lib/reconcile-display'
import { caseStatusToTone, caseStatusLabel } from '@/lib/status-tones'
import { useCase, useStoreDispatch, useCurrentActor, useCanApprove } from '@/store/hooks'
import { actorById } from '@/store/actors'
import { DocumentViewer } from '@/components/case/DocumentViewer'
import { LifecycleStepper } from '@/components/case/LifecycleStepper'
import { FieldActionModal } from '@/components/case/FieldActionModal'
import type { ActionKind } from '@/components/case/FieldActionModal'
import { ReconcilePanel } from '@/components/cross-cutting/ReconcilePanel'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
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
  const c = id ? CASE_DETAILS[id] : undefined
  const entity = useCase(id)
  const dispatch = useStoreDispatch()
  // 操作ビュー (入力者/承認者) は操作者 persona の role から導出 (remediation B4: 自己切替を廃し SoD を honest 化)。
  // 切替は TopBar の操作者 switcher (session/switchActor)。inputter は入力者ビュー、承認者/業務責任者は承認者ビュー。
  const actor = useCurrentActor()
  const mode: 'input' | 'checker' = actor?.role === 'inputter' ? 'input' : 'checker'
  const [activeFieldLabel, setActiveFieldLabel] = useState<string | undefined>(() => firstReviewLabel(c, entity?.resolvedFieldIds))
  const [modalField, setModalField] = useState<FieldReview | null>(null)
  const [caseSendbackOpen, setCaseSendbackOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  // :id 変更で同 component が再 render される時の local state reset (set-state-in-effect 回避、render 中 adjusting)
  const [prevId, setPrevId] = useState(id)
  if (id !== prevId) {
    setPrevId(id)
    setActiveFieldLabel(firstReviewLabel(c, entity?.resolvedFieldIds))
    setModalField(null)
    setCaseSendbackOpen(false)
    setToast(null)
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

  if (!c)
    return (
      <div className="flex h-full items-center justify-center p-8">
        <EmptyState
          subState="truly-empty"
          title="指定の案件が見つかりません。"
          action={
            <Link to="/cases" className="text-sm font-medium text-[var(--color-primary)] hover:underline">
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
  // SoD 表示の入力者は「実際に入力者承認した actor」(store の inputApprovedBy) を解決する。
  // 一覧 owner (c.inputter) は assignee であり承認 actor とは限らない (例 0128 は owner=鈴木課長 だが入力者承認は山田太郎)。
  // これを混同すると承認者 persona と同名になり「X ≠ X」の不正直な SoD 表示になるため、actor 解決名を使う。
  const inputApproverName = actorById(entity?.inputApprovedBy ?? '')?.name ?? c.inputter

  const showToast = (m: string) => {
    setToast(m)
    window.setTimeout(() => setToast(null), 2400)
  }

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
          <span>案件一覧</span>
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
            className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-panel-inset)] px-2.5 py-1 text-xs font-medium text-[var(--color-fg-muted)]"
          >
            <ShieldCheckIcon className="h-3.5 w-3.5 text-[var(--color-fg-muted)]" aria-hidden="true" />
            {mode === 'input' ? '入力者ビュー' : '承認者ビュー'}
          </span>
        </div>
        <LifecycleStepper steps={lifecycle} />
      </header>

      {/* Body: 文書アンカー 2-pane */}
      <div className="flex-1 overflow-hidden p-4">
        <div className="grid h-full grid-cols-1 gap-4 lg:grid-cols-[52fr_48fr]">
          <DocumentViewer document={c.document} activeFieldLabel={activeFieldLabel} onRowSelect={setActiveFieldLabel} />
          <div className="overflow-auto">
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
            {mode === 'checker' && (
              <div className="mb-3 flex items-center gap-2 rounded-[var(--radius-card)] border border-[var(--color-primary-soft-border)] bg-[var(--color-primary-soft)] p-3 text-xs">
                <ShieldCheckIcon className="h-4 w-4 text-[var(--color-primary-hover)]" aria-hidden="true" />
                <span className="text-[var(--color-fg)]">
                  承認者ビュー — 入力者 <strong>{inputApproverName}</strong> の確認結果を最終承認 (別担当者による確認: 承認者 ≠ 入力者)
                </span>
              </div>
            )}
            <ReconcilePanel
              fields={fields}
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
