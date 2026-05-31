import { AlertTriangleIcon, CheckIcon, FileTextIcon, ArrowRightIcon } from 'lucide-react'
import type { FieldReview } from '@/data/types'
import { reconcileStateLabel, reconcileStateTone, isResolved } from '@/lib/reconcile-display'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { MetaChip } from '@/components/shared/MetaChip'
import { cn } from '@/lib/cn'

/**
 * ReconcilePanel — CaseDetail 右 pane: AI 入力 全項目 (rev.3、原則 A 全件表示)
 * SSOT: reconcile-panel-spec §8 + screens-v2/04-case-detail/canonical-export.md
 *
 * 全 field を default 表示 (一致を折りたたまない)。要確認/未取得 を上部・alert 強調、確認済も可視。
 * 状態の UI 表示は reconcile-display resolver 経由 (正規化一致→「一致」、内部語非露出)。
 * 行選択で左 PDF 該当欄と相互ハイライト、要確認行は「対応」で統合 modal を開く。
 */
interface ReconcilePanelProps {
  fields: FieldReview[]
  activeFieldLabel?: string
  onSelectField?: (fieldLabel: string) => void
  onActOnField?: (fieldLabel: string) => void
  /** 参照専用 (store に無い過去案件など): 対応ボタンを出さず空状態文言も参照専用にする */
  readOnly?: boolean
}

export function ReconcilePanel({ fields, activeFieldLabel, onSelectField, onActOnField, readOnly }: ReconcilePanelProps) {
  const open = fields.filter((f) => !isResolved(f.reconcileState))
  const resolved = fields.filter((f) => isResolved(f.reconcileState))

  return (
    <section className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-[var(--color-fg)]">
          <FileTextIcon className="h-4 w-4 text-[var(--color-fg-muted)]" aria-hidden="true" />
          AI 入力項目
        </h2>
        <div className="flex gap-1.5">
          {open.length > 0 && <MetaChip tone="alert" label={`要確認 ${open.length}`} />}
          <MetaChip tone="success" label={`確認済 ${resolved.length}`} />
        </div>
      </div>

      {/* 対応が必要な項目 (要確認 / 未取得) */}
      {open.length > 0 ? (
        <div className="flex flex-col gap-2">
          <div className="text-xs font-medium text-[var(--color-alert-soft-fg)]">対応が必要な項目 ({open.length})</div>
          {open.map((f) => (
            <div
              key={f.fieldLabel}
              className={cn(
                // W3 a11y: card 自体は role=button にしない (内側「対応」button との nested-interactive 回避)。
                // 項目選択は header の label button (keyboard 可)、行動作は「対応」button = 2 つの sibling button。
                'rounded-[var(--radius-card)] border border-[var(--color-alert-soft-border)] bg-[var(--color-alert-soft)] p-3',
                activeFieldLabel === f.fieldLabel && 'ring-2 ring-[var(--color-alert)]'
              )}
            >
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  aria-pressed={activeFieldLabel === f.fieldLabel}
                  onClick={() => onSelectField?.(f.fieldLabel)}
                  className="flex items-center gap-1.5 rounded text-sm font-medium text-[var(--color-fg)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-alert)]"
                >
                  <AlertTriangleIcon className="h-3.5 w-3.5 text-[var(--color-alert)]" aria-hidden="true" />
                  {f.fieldLabel}
                </button>
                <StatusBadge tone={reconcileStateTone(f.reconcileState)} label={reconcileStateLabel(f.reconcileState)} />
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[var(--color-fg-muted)]">AI 入力</span>
                  <div className="text-[var(--color-fg)]">{f.aiValue}</div>
                </div>
                <div>
                  <span className="text-[var(--color-fg-muted)]">申請書類</span>
                  <div className="font-medium text-[var(--color-alert-soft-fg)]">{f.ocrRawValue ?? '未取得'}</div>
                </div>
              </div>
              {/* P1-8: 現行登録値 → 確定値 (変更系 field のみ)。右辺は B1 確定値 (humanValue) 優先。 */}
              {f.previousValue && (
                <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="text-[var(--color-fg-muted)]">現在の登録値</span>
                  <span className="text-[var(--color-fg-tertiary)] line-through">{f.previousValue}</span>
                  <ArrowRightIcon className="h-3 w-3 flex-shrink-0 text-[var(--color-fg-tertiary)]" aria-hidden="true" />
                  <span className="font-medium text-[var(--color-fg)]">{f.humanValue ?? f.aiValue}</span>
                </div>
              )}
              <p className="mt-1.5 text-[11px] text-[var(--color-fg-muted)]">
                AI 入力と申請書類で値が違います。正しい方を確認してください。
              </p>
              <div className="mt-2 flex items-center justify-between">
                {f.sourceLocator && (
                  <span className="font-mono text-[10px] text-[var(--color-fg-tertiary)]">
                    {f.sourceLocator.page} {f.sourceLocator.region}
                  </span>
                )}
                {!readOnly && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onActOnField?.(f.fieldLabel)
                    }}
                    className="rounded-[var(--radius-control)] border border-[var(--color-border-strong)] bg-[var(--color-panel)] px-2.5 py-1 text-xs font-medium text-[var(--color-fg)] hover:bg-[var(--color-panel-inset)]"
                  >
                    対応
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-[var(--radius-card)] bg-[var(--color-success-soft)] p-3 text-sm text-[var(--color-success-soft-fg)]">
          <CheckIcon className="h-4 w-4" aria-hidden="true" />
          {readOnly ? '過去の案件 — 参照専用です' : '確認が必要な項目はありません — 承認できます'}
        </div>
      )}

      {/* 確認済 (全件可視、折りたたまない) */}
      {resolved.length > 0 && (
        <div className="flex flex-col">
          <div className="px-1 pb-1 pt-2 text-xs font-medium text-[var(--color-fg-muted)]">確認済 ({resolved.length})</div>
          {resolved.map((f) => (
            <div
              key={f.fieldLabel}
              className={cn(
                'flex items-center gap-2 border-t border-[var(--color-border)] px-1 py-2 first:border-t-0',
                activeFieldLabel === f.fieldLabel && 'bg-[var(--color-primary-soft)]'
              )}
            >
              <button
                type="button"
                onClick={() => onSelectField?.(f.fieldLabel)}
                className="flex flex-1 items-center justify-between gap-3 text-left text-sm"
              >
                <span className="w-24 flex-shrink-0 text-[var(--color-fg-muted)]">{f.fieldLabel}</span>
                {/* B1: 確認済行は訂正値 (humanValue) を優先表示、未上書きは AI 値据え置き。P1-8: previousValue 有る変更系 field は inline で現行登録値→確定値を併記。 */}
                <span className="flex flex-1 items-center gap-1.5 truncate text-[var(--color-fg)]">
                  {f.previousValue && (
                    <>
                      <span className="flex-shrink-0 text-[var(--color-fg-tertiary)] line-through">{f.previousValue}</span>
                      <ArrowRightIcon className="h-3 w-3 flex-shrink-0 text-[var(--color-fg-tertiary)]" aria-hidden="true" />
                    </>
                  )}
                  <span className={cn('truncate', f.mono && 'font-mono')}>{f.humanValue ?? f.aiValue}</span>
                </span>
                <StatusBadge tone={reconcileStateTone(f.reconcileState)} label={reconcileStateLabel(f.reconcileState)} />
              </button>
              {/* B1: 手入力で上書きした項目は「確認」で訂正値を read-only 再表示 (modal 再 open で訂正値が出る)。 */}
              {!readOnly && f.humanValue !== undefined && onActOnField && (
                <button
                  type="button"
                  onClick={() => onActOnField(f.fieldLabel)}
                  className="flex-shrink-0 rounded-[var(--radius-control)] border border-[var(--color-border-strong)] bg-[var(--color-panel)] px-2 py-0.5 text-[11px] font-medium text-[var(--color-fg-muted)] hover:bg-[var(--color-panel-inset)] hover:text-[var(--color-fg)]"
                >
                  確認
                </button>
              )}
            </div>
          ))}
          {resolved.some((f) => f.normalizationNote) && (
            <p className="px-1 pt-1.5 text-[10px] text-[var(--color-fg-tertiary)]">一部の項目は表記を自動補正しています。</p>
          )}
        </div>
      )}
    </section>
  )
}
