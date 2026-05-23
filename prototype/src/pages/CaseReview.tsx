import { useParams, Link, useNavigate } from 'react-router-dom'
import { ChevronRight, Send, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/cn'
import { getCaseById } from '@/data/mock-cases'
import { ConfidenceBar } from '@/components/case/ConfidenceBar'
import { AddressDiffBlock } from '@/components/case/AddressDiffBlock'
import { EvidenceTimeline } from '@/components/case/EvidenceTimeline'
import { CitationPanel } from '@/components/case/CitationPanel'
import { StagingHintPanel } from '@/components/case/StagingHintPanel'
import { RelatedRuleAlert } from '@/components/case/RelatedRuleAlert'
import { BusinessApprovalChip } from '@/components/case/BusinessApprovalChip'
import { StatusBadge } from '@/components/case/StatusBadge'
import { LifecycleStepper } from '@/components/case/LifecycleStepper'

/**
 * CaseReview — Hero 1 (Demo Chapter 1 主画面)、Day 11 Operational Premium Light benchmark
 *
 * SSOT:
 *  - docs/03-ui-prototype-design.md §4.2 + §2.7 (Operational Premium Light)
 *  - Composition: Image 2 base + Image 3 citation boundary + Image 1 diff block + case lifecycle 訂正
 *
 * Layout:
 *  - Header: breadcrumb + case_id + workflow + status + LifecycleStepper (手順承認 除外)
 *  - 3-column main:
 *     左: AI 入力結果 (form with ConfidenceBar per field + AddressDiffBlock for new address)
 *     中央: EvidenceTimeline (PDF + 4 step timeline rail + per-step mono metadata `actor · source · conf`、alerts は LifecycleStepper 直下の case alert strip に分離、Day 11.3 #3a)
 *     右: RelatedRuleAlert (amber banner、最上部、Day 11.1 Fix 1) + CitationPanel (high only) + StagingHintPanel (低/中 separated)
 *  - Footer: sticky bottom action bar (差戻し / 承認 / BusinessApprovalChip)
 */
export function CaseReview() {
  const { id } = useParams()
  const navigate = useNavigate()
  const c = getCaseById(id || '')

  if (!c) {
    return (
      <div className="p-8">
        <p className="text-sm text-slate-500">案件 {id} が見つかりません。</p>
        <Link to="/inbox" className="mt-3 inline-block text-sm font-medium text-[var(--color-primary)] hover:underline">
          受信トレイに戻る
        </Link>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col bg-[var(--color-canvas)]">
      {/* === Header (breadcrumb + case meta + LifecycleStepper) === */}
      <header className="border-b border-slate-200 bg-white px-6 py-3">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500">
          <Link to="/inbox" className="hover:text-slate-700">受信トレイ</Link>
          <ChevronRight className="h-3 w-3" aria-hidden="true" />
          <span className="font-mono text-slate-700">{c.id}</span>
        </nav>

        {/* Meta row */}
        <div className="mt-1.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-slate-900">案件処理</h1>
            <span className="inline-flex items-center rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
              {c.workflowName}
            </span>
            <StatusBadge status={c.status} label={c.statusLabel} />
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px] text-slate-500 tabular">経過 {c.elapsedLabel}</span>
          </div>
        </div>

        {/* LifecycleStepper (手順承認 除外、Plan v1.4.1 訂正後) */}
        <div className="mt-2.5">
          <LifecycleStepper current={c.currentStep} />
        </div>
      </header>

      {/* === Case alert strip (Day 11.3 #3a: timeline event と分離、case-level alerts を LifecycleStepper 直下に集約) === */}
      {c.alerts.length > 0 && (
        <div className="border-b border-amber-200 bg-amber-50/40 px-6 py-2.5">
          <div className="flex items-start gap-3">
            <span className="shrink-0 font-mono text-[10px] font-medium uppercase tracking-wide text-[var(--color-alert-soft-fg)]">
              注意 · {c.alerts.length} 件
            </span>
            <div className="flex flex-1 flex-wrap gap-2">
              {c.alerts.map((al) => (
                <div
                  key={al.id}
                  className={cn(
                    'inline-flex max-w-xl items-start gap-1.5 rounded-md border bg-white px-2.5 py-1.5 text-[11px]',
                    al.severity === 'caution' ? 'border-amber-200' : 'border-red-200'
                  )}
                >
                  <AlertTriangle
                    className={cn(
                      'mt-0.5 h-3 w-3 shrink-0',
                      al.severity === 'caution' ? 'text-[var(--color-alert)]' : 'text-[var(--color-error)]'
                    )}
                    aria-hidden="true"
                  />
                  <div className="flex-1">
                    <p className="leading-relaxed text-slate-800">{al.message}</p>
                    {al.sourceStep && (
                      <p className="mt-0.5 font-mono text-[10px] text-slate-500">
                        source: <span className="text-slate-700">{al.sourceStep}</span>
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* === 3-column main work area === */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 gap-4 p-4 lg:grid-cols-12">
          {/* Left: AI 入力結果 (form) === 4/12 */}
          <section className="lg:col-span-4">
            <div className="sticky top-0 rounded-lg border border-slate-200 bg-white p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-900">AI 入力結果</h2>
                <span className="font-mono text-[10px] text-slate-500">{c.fields.length} field</span>
              </div>

              <div className="space-y-3">
                {c.fields.map((f) => (
                  <div key={f.label}>
                    <div className="mb-1 flex items-center justify-between">
                      <label className="text-[11px] font-medium text-slate-600">{f.label}</label>
                      {/* Day 11.3 #5c: AI 提案 5 連噪音 → tiny indigo dot + tooltip に density 化 */}
                      <span
                        className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]"
                        role="img"
                        aria-label="AI 提案"
                        title="AI 提案"
                      />
                    </div>

                    {f.hasDiff && f.oldValue ? (
                      <AddressDiffBlock oldValue={f.oldValue} newValue={f.value} />
                    ) : (
                      <input
                        type="text"
                        defaultValue={f.value}
                        className={
                          'block w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-[var(--color-primary)] focus:outline-none ' +
                          (f.monospace ? 'font-mono tabular' : '')
                        }
                      />
                    )}

                    <ConfidenceBar
                      value={f.confidence}
                      showThresholdChip={f.hasDiff}
                      className="mt-1.5"
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Middle: 証跡 timeline === 4/12 */}
          <section className="lg:col-span-4">
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <EvidenceTimeline
                pdfName={c.pdfName}
                pdfPages={c.pdfPages}
                steps={c.evidence}
              />
            </div>
          </section>

          {/* Right: AI Proposal (related rule alert TOP + citation + staging hint) === 4/12
            * Day 11.1 Fix 1 (CR R22): RelatedRuleAlert を section 最上部に移動 (docs/03 §6.1 SSOT 「citation list の前」と整合、初期 viewport 内に可視) */}
          <section className="space-y-3 lg:col-span-4">
            <RelatedRuleAlert updates={c.relatedRuleUpdates} />
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <CitationPanel citations={c.citations} />
            </div>
            <StagingHintPanel hints={c.stagingHints} />
          </section>
        </div>
      </div>

      {/* === Sticky bottom action bar === */}
      <footer className="border-t border-slate-200 bg-white px-6 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            <span className="font-medium text-slate-700">入力者確認:</span> 内容を確認し、承認または差戻しを選択してください
          </div>
          <div className="flex items-center gap-2">
            <BusinessApprovalChip status={c.businessApprovalStatus} />
            <button
              type="button"
              onClick={() => navigate(`/cases/${c.id}/comment`)}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              差戻し
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-md bg-[var(--color-primary)] px-3.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[var(--color-primary-hover)]"
            >
              <Send className="h-3.5 w-3.5" />
              承認
            </button>
          </div>
        </div>
      </footer>
    </div>
  )
}
