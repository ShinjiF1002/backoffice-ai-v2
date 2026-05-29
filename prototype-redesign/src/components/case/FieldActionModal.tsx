import { useState, useEffect } from 'react'
import { XIcon, AlertTriangleIcon } from 'lucide-react'
import type { FieldReview } from '@/data/types'
import { cn } from '@/lib/cn'

/**
 * FieldActionModal — 統合「項目の対応」/「案件の差戻し」modal (rev.3 ③ 単一決定面、window.prompt 廃止)
 * SSOT: reconcile-panel-spec §5 + allowed-actions §4.1 + screen-contracts-v2 (差戻しコメント必須)
 *
 * field-level: 申請書類の値で確定 / 手入力で上書き / この項目で差戻し / エスカレーション。
 * case-level (caseLevel=true、footer 差戻しから): 差戻し理由カテゴリ + コメント必須。
 * 理由・コメント必須は未入力で確定不可 (即 error)。outcome を 1 行明示。audit event 名は UI に出さない。
 */
export type ActionKind = 'accept' | 'override' | 'sendback' | 'escalate'

const FIELD_ACTIONS: { kind: ActionKind; label: string; needsReason: boolean; outcome: string }[] = [
  { kind: 'accept', label: '申請書類の値で確定', needsReason: false, outcome: 'この案件内で確定し、承認へ進みます。' },
  { kind: 'override', label: '手入力で上書き', needsReason: true, outcome: 'この案件内で確定し、承認へ進みます。' },
  { kind: 'sendback', label: 'この項目で差戻し', needsReason: true, outcome: '案件全体を AI・申請者へ戻し、再処理後に確認待ちへ戻ります。' },
  { kind: 'escalate', label: 'エスカレーション', needsReason: true, outcome: '業務責任者の判断先へ送ります。' },
]

const SENDBACK_CATEGORIES = ['申請書類不備', '読み取り不能', 'AI 入力誤り', '業務ルール抵触', 'その他']

interface FieldActionModalProps {
  field: FieldReview | null
  /** footer からの案件全体の差戻し (field 未指定) */
  caseLevel?: boolean
  caseId?: string
  onClose: () => void
  /** detail: 理由/コメント payload (P2B-3 の監査/履歴表示に備え型を確保。実 data は scope-out) */
  onSubmit: (target: string, kind: ActionKind, detail: { reason?: string; category?: string }) => void
}

export function FieldActionModal({ field, caseLevel, caseId, onClose, onSubmit }: FieldActionModalProps) {
  const [kind, setKind] = useState<ActionKind>(caseLevel ? 'sendback' : 'accept')
  const [reason, setReason] = useState('')
  const [category, setCategory] = useState(SENDBACK_CATEGORIES[0])
  const [showError, setShowError] = useState(false)

  const open = caseLevel || !!field
  useEffect(() => {
    if (open) {
      setKind(caseLevel ? 'sendback' : 'accept')
      setReason('')
      setCategory(SENDBACK_CATEGORIES[0])
      setShowError(false)
    }
  }, [open, caseLevel, field])

  if (!open) return null

  const fieldAction = FIELD_ACTIONS.find((a) => a.kind === kind)!
  const needsReason = caseLevel ? true : fieldAction.needsReason
  const outcome = caseLevel
    ? '案件全体を AI・申請者へ戻し、再処理後に確認待ちへ戻ります。'
    : fieldAction.outcome

  const handleSubmit = () => {
    if (needsReason && !reason.trim()) {
      setShowError(true)
      return
    }
    onSubmit(caseLevel ? (caseId ?? '案件') : field!.fieldLabel, caseLevel ? 'sendback' : kind, {
      reason: reason.trim() || undefined,
      category: caseLevel || kind === 'sendback' ? category : undefined,
    })
    onClose()
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={caseLevel ? '案件の差戻し' : '項目の対応'}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--color-overlay)] p-6"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex w-[520px] max-w-full flex-col overflow-hidden rounded-[var(--radius-card)] bg-[var(--color-panel)] shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-3">
          <h2 className="text-sm font-semibold text-[var(--color-fg)]">{caseLevel ? '案件の差戻し' : '項目の対応'}</h2>
          <button type="button" onClick={onClose} aria-label="閉じる" className="rounded p-1 text-[var(--color-fg-muted)] hover:bg-[var(--color-panel-inset)]">
            <XIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col gap-4 p-5">
          {/* field-level: 対象 field 文脈 + 対応の選択 */}
          {!caseLevel && field && (
            <>
              <div className="rounded-[var(--radius-card)] bg-[var(--color-panel-inset)] p-3 text-sm">
                <div className="font-medium text-[var(--color-fg)]">{field.fieldLabel}</div>
                <div className="mt-1 grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-[var(--color-fg-muted)]">AI 入力</span><div className="text-[var(--color-fg)]">{field.aiValue}</div></div>
                  <div><span className="text-[var(--color-fg-muted)]">申請書類</span><div className="text-[var(--color-fg)]">{field.ocrRawValue ?? '—'}</div></div>
                </div>
                {field.sourceLocator && (
                  <div className="mt-2 font-mono text-[10px] text-[var(--color-fg-subtle)]">
                    {field.sourceLocator.doc} · {field.sourceLocator.page} · {field.sourceLocator.region}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {FIELD_ACTIONS.map((a) => (
                  <button
                    key={a.kind}
                    type="button"
                    onClick={() => setKind(a.kind)}
                    className={cn(
                      'rounded-[var(--radius-control)] border px-3 py-2 text-left text-sm',
                      kind === a.kind
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary-soft)] font-medium text-[var(--color-primary)]'
                        : 'border-[var(--color-border)] text-[var(--color-fg)] hover:bg-[var(--color-panel-inset)]'
                    )}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* case-level / sendback: 理由カテゴリ */}
          {(caseLevel || kind === 'sendback') && (
            <div>
              <label htmlFor="sendback-cat" className="mb-1 block text-xs font-medium text-[var(--color-fg)]">差戻し理由カテゴリ</label>
              <select
                id="sendback-cat"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-[var(--radius-control)] border border-[var(--color-border-strong)] bg-[var(--color-panel)] px-3 py-1.5 text-sm text-[var(--color-fg)]"
              >
                {SENDBACK_CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          )}

          {/* 理由 / コメント (必須時) */}
          {needsReason && (
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label htmlFor="action-reason" className="text-xs font-medium text-[var(--color-fg)]">
                  {caseLevel || kind === 'sendback' ? 'コメント (必須)' : '理由 (必須)'}
                </label>
                {showError && (
                  <span className="flex items-center gap-1 text-xs text-[var(--color-error-soft-fg)]">
                    <AlertTriangleIcon className="h-3 w-3 text-[var(--color-error)]" />
                    入力してください
                  </span>
                )}
              </div>
              <textarea
                id="action-reason"
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value)
                  if (showError && e.target.value.trim()) setShowError(false)
                }}
                rows={3}
                aria-invalid={showError}
                className={cn(
                  'w-full rounded-[var(--radius-control)] border px-3 py-2 text-sm outline-none',
                  showError
                    ? 'border-[var(--color-error)] bg-[var(--color-error-soft)]'
                    : 'border-[var(--color-border-strong)] bg-[var(--color-panel)] focus:border-[var(--color-primary)]'
                )}
                placeholder="差戻し先 (担当者・AI) が読んで直せるよう、具体的に記載してください。"
              />
            </div>
          )}

          <div className="rounded-[var(--radius-card)] bg-[var(--color-panel-inset)] px-3 py-2 text-xs text-[var(--color-fg-muted)]">
            {outcome}
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-[var(--color-border)] bg-[var(--color-panel-inset)] px-5 py-3">
          <button type="button" onClick={onClose} className="rounded-[var(--radius-control)] border border-[var(--color-border-strong)] bg-[var(--color-panel)] px-3 py-1.5 text-sm text-[var(--color-fg)] hover:bg-[var(--color-panel-inset)]">
            キャンセル
          </button>
          <button type="button" onClick={handleSubmit} className="rounded-[var(--radius-control)] bg-[var(--color-primary)] px-3 py-1.5 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)]">
            {caseLevel ? '差戻しを送信' : '確定'}
          </button>
        </div>
      </div>
    </div>
  )
}
