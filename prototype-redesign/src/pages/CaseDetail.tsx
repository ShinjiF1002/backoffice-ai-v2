import { useMemo, useState } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { ChevronRightIcon, ShieldCheckIcon, CheckIcon, CornerUpLeftIcon } from 'lucide-react'
import { CASE_DETAILS } from '@/data/mock-case-detail'
import type { CaseDetailModel } from '@/data/mock-case-detail'
import type { FieldReview } from '@/data/types'
import { isResolved } from '@/lib/reconcile-display'
import { DocumentViewer } from '@/components/case/DocumentViewer'
import { LifecycleStepper } from '@/components/case/LifecycleStepper'
import { FieldActionModal } from '@/components/case/FieldActionModal'
import { ReconcilePanel } from '@/components/cross-cutting/ReconcilePanel'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { cn } from '@/lib/cn'

/**
 * CaseDetail (rev.3 文書アンカー 2-pane) — Process-First v2 pilot / C 型 detail contract 基準
 * SSOT: reconcile-panel-spec §8 + screens-v2/04-case-detail/canonical-export.md
 * A 全体表示 (全項目可視) / B 証拠アンカー (左 申請書類ビューア) / C 単一決定面 (footer のみ)。
 */
/** 初期 active field: 最初の要確認、なければ先頭項目 (空配列なら undefined)。 */
function firstReviewLabel(c: CaseDetailModel | undefined): string | undefined {
  if (!c || c.fields.length === 0) return undefined
  const review = c.fields.find((f) => !isResolved(f.reconcileState))
  return (review ?? c.fields[0]).fieldLabel
}

/** 未知 id の not-found (業務語、token-clean inline)。 */
function CaseNotFound() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
      <p className="text-sm text-[var(--color-fg-muted)]">指定の案件が見つかりません。</p>
      <Link to="/cases" className="text-sm font-medium text-[var(--color-primary)] hover:underline">
        案件一覧へ戻る
      </Link>
    </div>
  )
}

export function CaseDetail() {
  const { id } = useParams()
  const c = id ? CASE_DETAILS[id] : undefined
  // Approvals (承認待ち) からは ?view=checker で承認者ビュー初期化 (screen-contract: row → checker)
  const [params] = useSearchParams()
  const [mode, setMode] = useState<'input' | 'checker'>(params.get('view') === 'checker' ? 'checker' : 'input')
  const [fields, setFields] = useState<FieldReview[]>(c?.fields ?? [])
  const [activeFieldLabel, setActiveFieldLabel] = useState<string | undefined>(() => firstReviewLabel(c))
  const [modalField, setModalField] = useState<FieldReview | null>(null)
  const [caseSendbackOpen, setCaseSendbackOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  // :id 変更で同 component が再 render される時の local state reset (set-state-in-effect 回避、render 中 adjusting)
  const [prevId, setPrevId] = useState(id)
  if (id !== prevId) {
    setPrevId(id)
    setFields(c?.fields ?? [])
    setActiveFieldLabel(firstReviewLabel(c))
    setModalField(null)
    setCaseSendbackOpen(false)
    setToast(null)
  }

  const openCount = useMemo(() => fields.filter((f) => !isResolved(f.reconcileState)).length, [fields])

  if (!c) return <CaseNotFound />

  const showToast = (m: string) => {
    setToast(m)
    window.setTimeout(() => setToast(null), 2400)
  }

  const handleAct = (fieldLabel: string, kind: 'accept' | 'override' | 'sendback' | 'escalate') => {
    if (kind === 'accept' || kind === 'override') {
      setFields((prev) => prev.map((f) => (f.fieldLabel === fieldLabel ? { ...f, reconcileState: 'manually_confirmed' } : f)))
      showToast(`${fieldLabel} を確定しました`)
    } else if (kind === 'sendback') {
      showToast(`${fieldLabel} を差戻しました — 再処理後に確認待ちへ`)
    } else {
      showToast(`${fieldLabel} をエスカレーションしました`)
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
            <StatusBadge tone="primary" label={c.statusLabel} />
          </div>
          {/* mode 切替 */}
          <div className="flex rounded-[var(--radius-control)] border border-[var(--color-border-strong)] bg-[var(--color-panel)] p-0.5">
            {(['input', 'checker'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={cn(
                  'rounded-[4px] px-3 py-1 text-xs font-medium transition-colors',
                  mode === m ? 'bg-[var(--color-fg)] text-white' : 'text-[var(--color-fg-muted)]'
                )}
              >
                {m === 'input' ? '入力者ビュー' : '承認者ビュー'}
              </button>
            ))}
          </div>
        </div>
        <LifecycleStepper steps={c.lifecycle} />
      </header>

      {/* Body: 文書アンカー 2-pane */}
      <div className="flex-1 overflow-hidden p-4">
        <div className="grid h-full grid-cols-1 gap-4 lg:grid-cols-[52fr_48fr]">
          <DocumentViewer document={c.document} activeFieldLabel={activeFieldLabel} onRowSelect={setActiveFieldLabel} />
          <div className="overflow-auto">
            {mode === 'checker' && (
              <div className="mb-3 flex items-center gap-2 rounded-[var(--radius-card)] border border-[var(--color-primary-soft-border)] bg-[var(--color-primary-soft)] p-3 text-xs">
                <ShieldCheckIcon className="h-4 w-4 text-[var(--color-primary-hover)]" aria-hidden="true" />
                <span className="text-[var(--color-fg)]">
                  承認者ビュー — 入力者 <strong>{c.inputter}</strong> の確認結果を最終承認 (別担当者による確認: 承認者 ≠ 入力者)
                </span>
              </div>
            )}
            <ReconcilePanel
              fields={fields}
              activeFieldLabel={activeFieldLabel}
              onSelectField={setActiveFieldLabel}
              onActOnField={(label) => setModalField(fields.find((f) => f.fieldLabel === label) ?? null)}
            />
          </div>
        </div>
      </div>

      {/* Footer: 単一決定面 (承認 / 差戻し) */}
      <footer className="sticky bottom-0 z-30 flex items-center justify-between border-t border-[var(--color-border)] bg-[var(--color-panel)] px-6 py-3">
        <div className="text-xs">
          {mode === 'checker' ? (
            <span className="flex items-center gap-1.5 text-[var(--color-fg-muted)]">
              <ShieldCheckIcon className="h-3.5 w-3.5 text-[var(--color-success-soft-fg)]" />
              入力者 <strong className="text-[var(--color-fg)]">{c.inputter}</strong> ≠ 承認者 <strong className="text-[var(--color-fg)]">{c.approver}</strong>
            </span>
          ) : openCount > 0 ? (
            <span className="text-[var(--color-alert-soft-fg)]">要確認 {openCount} 項目を解消してください</span>
          ) : (
            <span className="text-[var(--color-success-soft-fg)]">全項目確認済 — 承認できます</span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setCaseSendbackOpen(true)}
            className="flex items-center gap-1.5 rounded-[var(--radius-control)] border border-[var(--color-border-strong)] bg-[var(--color-panel)] px-3 py-1.5 text-sm text-[var(--color-fg)] hover:bg-[var(--color-panel-inset)]"
          >
            <CornerUpLeftIcon className="h-4 w-4" />
            差戻し
          </button>
          <button
            type="button"
            disabled={openCount > 0}
            title={openCount > 0 ? `要確認 ${openCount} 項目を解消してください` : undefined}
            onClick={() => showToast(mode === 'checker' ? '最終承認しました' : '承認しました — 承認者待ちへ')}
            className={cn(
              'flex items-center gap-1.5 rounded-[var(--radius-control)] px-3 py-1.5 text-sm font-medium',
              openCount > 0
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
        onSubmit={() => showToast('案件を差戻しました — 再処理後に確認待ちへ')}
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
