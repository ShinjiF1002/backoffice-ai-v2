import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ChevronRight, AlertTriangle, FileText, Send } from 'lucide-react'
import { cn } from '@/lib/cn'
import { SENDBACK_CATEGORIES } from '@/lib/sendback-categories'
import { getCaseById } from '@/data/mock-cases'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { caseStatusToTone } from '@/lib/status-tones'
import { LifecycleStepper } from '@/components/case/LifecycleStepper'
import type { SendBackCategory } from '@/data/types'

/**
 * SendBackComment — 9 画面の 1 つ (CaseReview の子 detail route、10 番目ではない)、Day 12 Page 4 wireframe
 *
 * SSOT:
 *  - docs/03-ui-prototype-design.md §4.3 (SCR-03 SendBackComment Screen Card)
 *  - docs/04-knowledge-pipeline.md §4 (5-category routing、data_error は §4.5 で別 routing)
 *  - prototype/CLAUDE.md (Operational Premium Light tokens + JP-only + enabled no-op 0)
 *
 * Layout (CaseReview / Inbox / ProposalReview / Dashboard と register 共通):
 *  - Sticky PageHeader: breadcrumb (受信トレイ › CASE-ID › 差戻しコメント) + h1 + workflow chip + StatusBadge + 経過 + LifecycleStepper
 *  - Main scrollable (max-w-3xl mx-auto): 案件概要 / 差戻し分類 5-category radio / data_error warning (conditional) / 差戻し理由 textarea / 関連 evidence checklist
 *  - Sticky footer: キャンセル link (戻る) + 差戻しを記録 disabled button (送信動作は次の実装段階)
 *
 * 規範:
 *  - data_error 選択時 warning: 「AI 責ではない判定、log / audit / 別 routing に回ります」 (§4.3 Day 11+ メモ準拠)
 *  - enabled no-op 0: 差戻しを記録 button は disabled、wrapper span title pattern (CR R32 Page 2.3 で確立、ProposalReview footer と同 paradigm)
 *  - State: composing のみ (submitting / submitted は Day 14-15+ で AppContext 経由 staging 生成 / toast feedback)
 *  - JSDoc / JSX comment 内の internal SSOT 参照 (data_error / 別 routing 等 enum identifier) は keep (R34/R35 と同 scope)
 */

export function SendBackComment() {
  const { id } = useParams()
  const navigate = useNavigate()
  const c = getCaseById(id || '')

  const [category, setCategory] = useState<SendBackCategory>('misunderstanding')
  const [comment, setComment] = useState('')
  const [evidenceSelected, setEvidenceSelected] = useState<string[]>([])

  if (!c) {
    return (
      <div className="p-8">
        <p className="text-sm text-slate-500">案件 {id} が見つかりません。</p>
        <Link
          to="/inbox"
          className="mt-3 inline-block text-sm font-medium text-[var(--color-primary)] hover:underline"
        >
          受信トレイに戻る
        </Link>
      </div>
    )
  }

  const isDataError = category === 'data_error'
  const charCount = comment.length

  const toggleEvidence = (evId: string) => {
    setEvidenceSelected((prev) =>
      prev.includes(evId) ? prev.filter((x) => x !== evId) : [...prev, evId]
    )
  }

  return (
    <div className="flex h-full flex-col bg-[var(--color-canvas)]">
      {/* === PageHeader === */}
      <header className="border-b border-slate-200 bg-white px-6 py-3">
        {/* Breadcrumb (3-level: 受信トレイ › 案件 ID › 差戻しコメント) */}
        <nav aria-label="breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500">
          <Link to="/inbox" className="hover:text-slate-700">
            受信トレイ
          </Link>
          <ChevronRight className="h-3 w-3" aria-hidden="true" />
          <Link to={`/cases/${c.id}`} className="font-mono hover:text-slate-700">
            {c.id}
          </Link>
          <ChevronRight className="h-3 w-3" aria-hidden="true" />
          <span className="text-slate-700">差戻しコメント</span>
        </nav>

        {/* Title row + case meta */}
        <div className="mt-1.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-slate-900">差戻しコメント</h1>
            <span className="inline-flex items-center rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
              {c.workflowName}
            </span>
            <StatusBadge tone={caseStatusToTone(c.status)} label={c.statusLabel} />
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px] text-slate-500 tabular">経過 {c.elapsedLabel}</span>
          </div>
        </div>

        {/* LifecycleStepper (current step は CaseReview と共通、入力者確認 派生 flow) */}
        <div className="mt-2.5">
          <LifecycleStepper current={c.currentStep} />
        </div>
      </header>

      {/* === Main body === */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl space-y-4 p-6">
          {/* 1. 案件概要 card */}
          <section
            aria-labelledby="sendback-context"
            className="rounded-lg border border-slate-200 bg-white p-5"
          >
            <h2 id="sendback-context" className="text-sm font-semibold text-slate-900">
              案件概要
            </h2>
            <p className="mt-1 text-[11px] text-slate-500">
              AI 入力結果からの抜粋。差戻し対象の文脈を確認してください。
            </p>
            <dl className="mt-3 grid grid-cols-1 gap-2 text-[12px] text-slate-700 sm:grid-cols-2">
              {c.fields.slice(0, 4).map((f) => (
                <div
                  key={f.label}
                  className="flex items-start justify-between border-b border-slate-100 pb-1.5"
                >
                  <dt className="shrink-0 pr-3 text-slate-500">{f.label}</dt>
                  <dd className={cn('flex-1 text-right', f.monospace && 'font-mono tabular')}>
                    {f.value}
                  </dd>
                </div>
              ))}
            </dl>
            <Link
              to={`/cases/${c.id}`}
              className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[var(--color-primary)] hover:underline"
            >
              案件レビューに戻る
              <ChevronRight className="h-3 w-3" aria-hidden="true" />
            </Link>
          </section>

          {/* 2. 差戻し分類 card */}
          <section
            aria-labelledby="sendback-category"
            className="rounded-lg border border-slate-200 bg-white p-5"
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <h2 id="sendback-category" className="text-sm font-semibold text-slate-900">
                  差戻し分類
                </h2>
                <p className="mt-1 text-[11px] text-slate-500">
                  5 分類から最も近いものを選択 (入力誤りは AI 責ではないため別経路)
                </p>
              </div>
              <span className="font-mono text-[10px] text-slate-500 tabular">5 分類</span>
            </div>
            <fieldset className="space-y-2">
              <legend className="sr-only">差戻し分類を選択</legend>
              {SENDBACK_CATEGORIES.map((cat) => {
                const isSelected = cat.value === category
                return (
                  <label
                    key={cat.value}
                    className={cn(
                      'flex cursor-pointer items-start gap-3 rounded-md border px-3 py-2.5 text-[12px] transition-colors',
                      isSelected
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary-soft)]'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    )}
                  >
                    <input
                      type="radio"
                      name="sendback-category"
                      value={cat.value}
                      checked={isSelected}
                      onChange={() => setCategory(cat.value)}
                      className="mt-0.5 h-3.5 w-3.5 accent-[var(--color-primary)]"
                      aria-describedby={`cat-desc-${cat.value}`}
                    />
                    <div className="min-w-0 flex-1">
                      <span
                        className={cn(
                          'font-medium',
                          isSelected ? 'text-[var(--color-primary)]' : 'text-slate-800'
                        )}
                      >
                        {cat.label}
                      </span>
                      <p
                        id={`cat-desc-${cat.value}`}
                        className="mt-0.5 leading-relaxed text-slate-500"
                      >
                        {cat.description}
                      </p>
                    </div>
                  </label>
                )
              })}
            </fieldset>
          </section>

          {/* 3. data_error 選択時 warning banner (conditional、§4.3 Day 11+ 実装メモ準拠) */}
          {isDataError && (
            <div className="rounded-lg border border-amber-200 bg-amber-50/40 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle
                  className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-alert)]"
                  aria-hidden="true"
                />
                <div className="min-w-0 flex-1 text-[12px] leading-relaxed text-[var(--color-alert-soft-fg)]">
                  <p className="font-medium">入力誤りは AI の学習対象になりません</p>
                  <p className="mt-0.5 text-[var(--color-alert-soft-fg)]">
                    記録・監査用の別経路に回り、未承認ナレッジへの昇格対象外となります。AI 入力結果の修正は通常の案件処理側で対応してください。
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 4. コメント textarea card */}
          <section
            aria-labelledby="sendback-comment"
            className="rounded-lg border border-slate-200 bg-white p-5"
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <h2 id="sendback-comment" className="text-sm font-semibold text-slate-900">
                  差戻し理由
                </h2>
                <p className="mt-1 text-[11px] text-slate-500">
                  具体的な差戻し理由・修正提案を記述してください
                </p>
              </div>
              <span className="font-mono text-[10px] text-slate-500 tabular">
                {charCount} 文字
              </span>
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="例: 福岡支店の住所マスタが旧形式 (- を含む) のため、新形式 (空白区切り) への正規化が必要です。"
              rows={6}
              className="w-full resize-y rounded-md border border-slate-200 bg-white px-3 py-2 text-[12px] leading-relaxed text-slate-800 placeholder:text-slate-400"
              aria-labelledby="sendback-comment"
            />
          </section>

          {/* 5. 関連 evidence checklist card (case.evidence から動的、wireframe phase は表示のみ) */}
          {c.evidence.length > 0 && (
            <section
              aria-labelledby="sendback-evidence"
              className="rounded-lg border border-slate-200 bg-white p-5"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <h2 id="sendback-evidence" className="text-sm font-semibold text-slate-900">
                    関連根拠 (任意)
                  </h2>
                  <p className="mt-1 text-[11px] text-slate-500">
                    差戻し対象に関連する根拠を選択してください (任意)
                  </p>
                </div>
                <span className="font-mono text-[10px] text-slate-500 tabular">
                  {evidenceSelected.length} / {c.evidence.length}
                </span>
              </div>
              <div className="space-y-1.5">
                {c.evidence.map((ev) => {
                  const isChecked = evidenceSelected.includes(ev.id)
                  return (
                    <label
                      key={ev.id}
                      className={cn(
                        'flex cursor-pointer items-start gap-3 rounded-md border px-3 py-2 text-[12px] transition-colors',
                        isChecked
                          ? 'border-[var(--color-primary)] bg-[var(--color-primary-soft)]'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleEvidence(ev.id)}
                        className="mt-0.5 h-3.5 w-3.5 accent-[var(--color-primary)]"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <FileText
                            className="h-3 w-3 shrink-0 text-slate-400"
                            aria-hidden="true"
                          />
                          <span className="font-medium text-slate-800">{ev.name}</span>
                        </div>
                        <p className="mt-0.5 font-mono text-[10px] text-slate-500 tabular">
                          {ev.timestamp}
                        </p>
                      </div>
                    </label>
                  )
                })}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* === Sticky footer === */}
      <footer className="border-t border-slate-200 bg-white px-6 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(`/cases/${c.id}`)}
              className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            >
              キャンセル
            </button>
            <span className="font-mono text-[10px] text-slate-400 tabular">
              送信動作は次の実装段階で対応
            </span>
          </div>
          <span
            className="inline-flex"
            title="差戻し理由を記録し AI の改善材料に反映"
          >
            <button
              type="button"
              disabled
              aria-disabled="true"
              className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-md bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-400 opacity-70"
            >
              <Send className="h-3.5 w-3.5" aria-hidden="true" />
              差戻しを記録
            </button>
          </span>
        </div>
      </footer>
    </div>
  )
}
