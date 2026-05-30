import { useRef, useState } from 'react'
import type { RefObject } from 'react'
import { AlertTriangleIcon } from 'lucide-react'
import type { FieldReview } from '@/data/types'
import { cn } from '@/lib/cn'
import { Modal } from '@/components/shared/Modal'

/**
 * FieldActionModal — 統合「項目の対応」/「案件の差戻し」modal (rev.3 ③ 単一決定面、window.prompt 廃止)
 * SSOT: reconcile-panel-spec §5 + allowed-actions §4.1 + screen-contracts-v2 (差戻しコメント必須)
 *
 * field-level: 申請書類の値で確定 / 手入力で上書き / この項目で差戻し / エスカレーション。
 * case-level (caseLevel=true、footer 差戻しから): 差戻し理由カテゴリ + コメント必須。
 * 理由・コメント必須は未入力で確定不可 (即 error)。outcome を 1 行明示。audit event 名は UI に出さない。
 * Phase 2: shell を共通 Modal に移譲。state / validation は本 component が保持 (挙動不変)。
 */
export type ActionKind = 'accept' | 'override' | 'sendback' | 'escalate'

// needsValue (B1): 手入力で上書き は訂正値の入力を必須にする。accept は申請書類値を確定値に充てる (入力欄なし)。
const FIELD_ACTIONS: { kind: ActionKind; label: string; needsReason: boolean; needsValue: boolean; outcome: string }[] = [
  { kind: 'accept', label: '申請書類の値で確定', needsReason: false, needsValue: false, outcome: 'この案件内で確定し、承認へ進みます。' },
  { kind: 'override', label: '手入力で上書き', needsReason: false, needsValue: true, outcome: 'この案件内で確定し、承認へ進みます。' },
  { kind: 'sendback', label: 'この項目で差戻し', needsReason: true, needsValue: false, outcome: '案件全体を AI・申請者へ戻し、再処理後に確認待ちへ戻ります。' },
  { kind: 'escalate', label: 'エスカレーション', needsReason: true, needsValue: false, outcome: '業務責任者の判断先へ送ります。' },
]

const SENDBACK_CATEGORIES = ['申請書類不備', '読み取り不能', 'AI 入力誤り', '業務ルール抵触', 'その他']

interface FieldActionModalProps {
  field: FieldReview | null
  /** footer からの案件全体の差戻し (field 未指定) */
  caseLevel?: boolean
  caseId?: string
  onClose: () => void
  /** detail: 確定値 (value、B1) + 理由/コメント payload (差戻し理由 store 保持に使用) */
  onSubmit: (target: string, kind: ActionKind, detail: { reason?: string; category?: string; value?: string }) => void
}

export function FieldActionModal({ field, caseLevel, caseId, onClose, onSubmit }: FieldActionModalProps) {
  const [kind, setKind] = useState<ActionKind>(caseLevel ? 'sendback' : 'accept')
  const [reason, setReason] = useState('')
  const [value, setValue] = useState('') // B1: 手入力で上書き の訂正値
  const [category, setCategory] = useState(SENDBACK_CATEGORIES[0])
  const [showError, setShowError] = useState(false)
  const [showValueError, setShowValueError] = useState(false)
  const reasonRef = useRef<HTMLTextAreaElement>(null)

  const open = caseLevel || !!field
  // open / 対象 (caseLevel・fieldLabel) が変わったら入力を初期化 (render 中の変化検知、set-state-in-effect 回避)。
  // 比較は object 参照でなく安定 key (fieldLabel)。overlay で field object が毎 render 新規でも spurious reset を防ぐ (Phase 4b hardening)。
  const fieldLabel = field?.fieldLabel ?? null
  const [prev, setPrev] = useState({ open, caseLevel, fieldLabel })
  if (prev.open !== open || prev.caseLevel !== caseLevel || prev.fieldLabel !== fieldLabel) {
    setPrev({ open, caseLevel, fieldLabel })
    if (open) {
      setKind(caseLevel ? 'sendback' : 'accept')
      setReason('')
      setValue('')
      setCategory(SENDBACK_CATEGORIES[0])
      setShowError(false)
      setShowValueError(false)
    }
  }

  // B1 再 open: 既に確定済み (manually_confirmed) の項目を開いた時は read-only の確認 view にする
  // (確定済みを silent 再上書きさせない。値の変更は案件差戻しで)。確認済行から再 open すると訂正値が出る。
  const isReview = !caseLevel && field?.reconcileState === 'manually_confirmed'
  const fieldAction = FIELD_ACTIONS.find((a) => a.kind === kind)!
  const needsReason = !isReview && (caseLevel ? true : fieldAction.needsReason)
  const needsValue = !isReview && !caseLevel && fieldAction.needsValue
  const outcome = caseLevel
    ? '案件全体を AI・申請者へ戻し、再処理後に確認待ちへ戻ります。'
    : fieldAction.outcome

  const handleSubmit = () => {
    if (needsValue && !value.trim()) {
      setShowValueError(true)
      return
    }
    if (needsReason && !reason.trim()) {
      setShowError(true)
      return
    }
    const submitKind = caseLevel ? 'sendback' : kind
    // 確定値 (B1): override は手入力の訂正値、accept は申請書類値 (ocrRawValue ?? aiValue) を確定値に充てる。
    const submitValue =
      submitKind === 'override'
        ? value.trim()
        : submitKind === 'accept'
          ? field?.ocrRawValue ?? field?.aiValue
          : undefined
    onSubmit(caseLevel ? (caseId ?? '案件') : field!.fieldLabel, submitKind, {
      reason: reason.trim() || undefined,
      category: caseLevel || kind === 'sendback' ? category : undefined,
      value: submitValue,
    })
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={caseLevel ? '案件の差戻し' : isReview ? '項目の確認' : '項目の対応'}
      size="md"
      initialFocusRef={reasonRef as RefObject<HTMLElement | null>}
      footer={
        isReview ? (
          <button
            type="button"
            onClick={onClose}
            className="rounded-[var(--radius-control)] bg-[var(--color-primary)] px-3 py-1.5 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)]"
          >
            閉じる
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={onClose}
              className="rounded-[var(--radius-control)] border border-[var(--color-border-strong)] bg-[var(--color-panel)] px-3 py-1.5 text-sm text-[var(--color-fg)] hover:bg-[var(--color-panel-inset)]"
            >
              キャンセル
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="rounded-[var(--radius-control)] bg-[var(--color-primary)] px-3 py-1.5 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)]"
            >
              {caseLevel ? '差戻しを送信' : '確定'}
            </button>
          </>
        )
      }
    >
      <div className="flex flex-col gap-4">
        {/* field-level: 対象 field 文脈 (review でも表示 = 確定済の訂正値を再確認できる) */}
        {!caseLevel && field && (
          <div className="rounded-[var(--radius-card)] bg-[var(--color-panel-inset)] p-3 text-sm">
            <div className="font-medium text-[var(--color-fg)]">{field.fieldLabel}</div>
            <div className="mt-1 grid grid-cols-2 gap-2 text-xs">
              {/* B1: 既に上書き済 (humanValue) ならその訂正値を、未上書きなら AI 入力値を表示 (modal 再 open で訂正値が出る)。 */}
              <div><span className="text-[var(--color-fg-muted)]">{field.humanValue !== undefined ? '現在値' : 'AI 入力'}</span><div className="text-[var(--color-fg)]">{field.humanValue ?? field.aiValue}</div></div>
              <div><span className="text-[var(--color-fg-muted)]">申請書類</span><div className="text-[var(--color-fg)]">{field.ocrRawValue ?? '—'}</div></div>
            </div>
            {field.sourceLocator && (
              <div className="mt-2 font-mono text-[10px] text-[var(--color-fg-tertiary)]">
                {field.sourceLocator.doc} · {field.sourceLocator.page} · {field.sourceLocator.region}
              </div>
            )}
          </div>
        )}

        {/* 確定済み項目の再 open は read-only 確認 (silent 再上書きを防ぐ。変更は案件差戻しで)。 */}
        {isReview && (
          <div className="rounded-[var(--radius-card)] bg-[var(--color-panel-inset)] px-3 py-2 text-xs text-[var(--color-fg-muted)]">
            この項目は確定済みです。値を変更する場合は、フッターの「差戻し」で案件を差戻してください。
          </div>
        )}

        {/* 対応の選択 (確定/上書き/差戻し/エスカレーション) — 確定済の確認 view では非表示 */}
        {!isReview && !caseLevel && field && (
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
        )}

        {/* B1: 手入力で上書き の訂正値 (必須)。確認済行・申請書類ビューアにこの値が反映される。 */}
        {needsValue && (
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label htmlFor="override-value" className="text-xs font-medium text-[var(--color-fg)]">訂正後の値 (必須)</label>
              {showValueError && (
                <span className="flex items-center gap-1 text-xs text-[var(--color-error-soft-fg)]">
                  <AlertTriangleIcon className="h-3 w-3 text-[var(--color-error)]" />
                  入力してください
                </span>
              )}
            </div>
            <input
              id="override-value"
              type="text"
              value={value}
              onChange={(e) => {
                setValue(e.target.value)
                if (showValueError && e.target.value.trim()) setShowValueError(false)
              }}
              aria-invalid={showValueError}
              className={cn(
                'w-full rounded-[var(--radius-control)] border px-3 py-2 text-sm outline-none',
                showValueError
                  ? 'border-[var(--color-error)] bg-[var(--color-error-soft)]'
                  : 'border-[var(--color-border-strong)] bg-[var(--color-panel)] focus:border-[var(--color-primary)]'
              )}
              placeholder="正しい値を入力してください（例: サンプルビルディング）"
            />
          </div>
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
              ref={reasonRef}
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

        {!isReview && (
          <div className="rounded-[var(--radius-card)] bg-[var(--color-panel-inset)] px-3 py-2 text-xs text-[var(--color-fg-muted)]">
            {outcome}
          </div>
        )}
      </div>
    </Modal>
  )
}
