import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ChevronRight, Send, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/cn'
import { getCaseById } from '@/data/mock-cases'
import { ConfidenceBar } from '@/components/case/ConfidenceBar'
import { AddressDiffBlock } from '@/components/case/AddressDiffBlock'
import { EvidenceTimeline } from '@/components/case/EvidenceTimeline'
import { CitationPanel } from '@/components/case/CitationPanel'
import { StagingHintPanel } from '@/components/case/StagingHintPanel'
import { RelatedRuleAlert } from '@/components/case/RelatedRuleAlert'
import { ConfidenceLegend } from '@/components/case/ConfidenceLegend'
import { BusinessApprovalChip } from '@/components/shared/BusinessApprovalChip'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { PageFooter } from '@/components/shared/PageFooter'
import { NextActionStrip } from '@/components/shared/NextActionStrip'
import { DiffPreviewBlock } from '@/components/shared/DiffPreviewBlock'
import { MetadataStrip } from '@/components/shared/MetadataStrip'
import { caseStatusToTone } from '@/lib/status-tones'
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
 *     中央: EvidenceTimeline (PDF + 4 step timeline rail + per-step JP metadata、Day 19 Commit 3b U-4 で raw schema prefix paraphrase + DetailDrawer 化、alerts は LifecycleStepper 直下の case alert strip に分離、Day 11.3 #3a)
 *     右: RelatedRuleAlert (amber banner、最上部、Day 11.1 Fix 1) + CitationPanel (high only) + StagingHintPanel (低/中 separated)
 *  - Footer: sticky bottom action bar (差戻し / 承認 / BusinessApprovalChip)
 */
export function CaseReview() {
  const { id } = useParams()
  const navigate = useNavigate()
  const c = getCaseById(id || '')

  /**
   * Day 18.5 拡張 Commit 0 (U-3、Plan v1.4 option A): 承認 button enabled no-op 解消。
   * in-memory state で実動作化、3 秒間 success flash → /inbox navigate。
   * Plan v1.4 P0-3 in-memory mock state 原則遵守、Demo Chapter 1 narrative 整合 (承認 → next case 遷移 mock)。
   * setTimeout は useEffect で cleanup し、unmount 時の double navigate を防ぐ。
   */
  const [caseApproved, setCaseApproved] = useState(false)
  /**
   * F-2 Wave 2 PR 2 Commit 4: 承認 button metadata gate (gate1-decision.md F-2-A 採用案 spec)。
   * MetadataStrip が viewport に visible (IntersectionObserver 60% threshold) になった瞬間 ack、
   * ack 前の 承認 button は disabled、user に metadata 確認を強制。
   * Day 18.5 U-3 拡張 in-memory state は preserve、metadata ack は新規 gate。
   */
  const [metadataAcked, setMetadataAcked] = useState(false)
  /**
   * F-2 Wave 2 PR 2 Commit 4: AI 入力結果 view toggle (gate1-decision.md F-2-A 採用案 spec)。
   * default='inline' (existing 既存 field-by-field form rendering、ConfidenceBar 含む)、
   * 'fieldTable' (DiffPreviewBlock fieldTable view、structured before/after column 一覧)。
   */
  const [fieldsView, setFieldsView] = useState<'inline' | 'fieldTable'>('inline')

  useEffect(() => {
    if (!caseApproved) return
    const timer = setTimeout(() => navigate('/inbox'), 3000)
    return () => clearTimeout(timer)
  }, [caseApproved, navigate])

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
      <header
        data-page-header
        className="sticky top-0 z-30 min-h-[var(--height-pageheader)] border-b border-slate-200 bg-white px-6 py-3"
      >
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500">
          <Link to="/inbox" className="hover:text-slate-700">受信トレイ</Link>
          <ChevronRight className="h-3 w-3" aria-hidden="true" />
          <span className="text-slate-600">案件処理</span>
          <ChevronRight className="h-3 w-3" aria-hidden="true" />
          <span className="font-mono text-slate-700">{c.id}</span>
        </nav>

        {/* Meta row */}
        <div className="mt-1.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-slate-900">{c.id} {c.workflowName}</h1>
            <StatusBadge tone={caseStatusToTone(c.status)} label={c.statusLabel} />
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px] text-slate-500 tabular">経過 {c.elapsedLabel}</span>
          </div>
        </div>

        {/* LifecycleStepper (手順承認 除外、Plan v1.4.1 訂正後)
          * F-7 Wave 2 PR 2 Commit 5: lifecycleSpecs を渡して per-step SLA badge + approver hover を有効化 */}
        <div className="mt-2.5">
          <LifecycleStepper current={c.currentStep} specs={c.lifecycleSpecs} />
        </div>
      </header>

      {/* === Day 19 Commit 3c U-13 + v1.4.1 F-1: NextActionStrip (summary mode、JP-only paraphrase = `判定要約`、`項目`、L1 anchor、primary CTA は footer 差戻し / 承認) === */}
      <NextActionStrip
        label="判定要約"
        summary={(() => {
          const fieldCount = c.fields.length
          const minConfidence = Math.min(...c.fields.map((f) => f.confidence ?? 1.0))
          const belowThreshold = minConfidence < 0.85
          if (belowThreshold && c.alertCount > 0) {
            return `AI 入力結果 ${fieldCount} 項目確認、信頼度 ${minConfidence.toFixed(2)} で閾値未達、注意 ${c.alertCount} 件`
          }
          if (belowThreshold) {
            return `AI 入力結果 ${fieldCount} 項目確認、信頼度 ${minConfidence.toFixed(2)} で閾値未達`
          }
          if (c.alertCount > 0) {
            return `AI 入力結果 ${fieldCount} 項目確認、注意 ${c.alertCount} 件`
          }
          return `AI 入力結果 ${fieldCount} 項目確認`
        })()}
        actionHref={null}
      />

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
                        <span className="text-slate-700">{al.sourceStep}</span>
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
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-slate-900">AI 入力結果</h2>
                <div className="flex items-center gap-2">
                  {/* F-2 view toggle (gate1-decision.md F-2-A: inline default + fieldTable toggle) */}
                  <div role="group" aria-label="表示モード" className="inline-flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setFieldsView('inline')}
                      className={cn(
                        'rounded-md px-2 py-0.5 text-[10px] transition-colors',
                        fieldsView === 'inline'
                          ? 'bg-[var(--color-primary-soft)] font-medium text-[var(--color-primary)]'
                          : 'text-slate-500 hover:bg-slate-50'
                      )}
                      aria-pressed={fieldsView === 'inline'}
                    >
                      フォーム
                    </button>
                    <button
                      type="button"
                      onClick={() => setFieldsView('fieldTable')}
                      className={cn(
                        'rounded-md px-2 py-0.5 text-[10px] transition-colors',
                        fieldsView === 'fieldTable'
                          ? 'bg-[var(--color-primary-soft)] font-medium text-[var(--color-primary)]'
                          : 'text-slate-500 hover:bg-slate-50'
                      )}
                      aria-pressed={fieldsView === 'fieldTable'}
                    >
                      項目表
                    </button>
                  </div>
                  <span className="font-mono text-[10px] text-slate-500">{c.fields.length} 項目</span>
                </div>
              </div>

              {fieldsView === 'fieldTable' ? (
                <DiffPreviewBlock
                  source={{ kind: 'fields', fields: c.fields }}
                  defaultView="fieldTable"
                  availableViews={['fieldTable']}
                  className="border-0 shadow-none"
                />
              ) : (
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
              )}
              {fieldsView === 'inline' && (
                <ConfidenceLegend className="mt-1 border-t border-slate-100" />
              )}
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

        {/* === F-2 Wave 2 PR 2 Commit 4: MetadataStrip footer 直上 (gate1-decision.md F-2-A 採用 spec、placement='footer')
          * AI 入力結果 の diff-bearing field (新住所) の metadata 5 element を 1 行で表示、承認 button gate trigger */}
        {(() => {
          const fieldWithMeta = c.fields.find((f) => f.changeAuthor || f.changeReason)
          if (!fieldWithMeta) return null
          return (
            <div className="px-4 pb-4">
              <MetadataStrip
                changeAuthor={fieldWithMeta.changeAuthor}
                changeReason={fieldWithMeta.changeReason}
                confidence={fieldWithMeta.confidence}
                affectedScope={fieldWithMeta.affectedScope}
                reversibility={fieldWithMeta.reversibility}
                placement="footer"
                onAck={() => setMetadataAcked(true)}
              />
            </div>
          )
        })()}
      </div>

      {/* === Sticky bottom action bar (Day 14 P1.5 C4: PageFooter primitive 経由)
        * Day 18.5 拡張 Commit 0 (U-3、Plan v1.4 option A): 承認後は success flash 表示 + 3 秒で /inbox 遷移。
        * 承認 button は in-memory state 動作化 (Demo Chapter 1 narrative 整合)、差戻し / 承認 両 button は caseApproved 中 disabled で double-click 防止。 */}
      {/* Day 19 Commit 5 U-18: footer left explainer 削除 (StatusBadge + footer button で recall 不要、NH6 解消)、success flash は Commit 0 dynamic feedback として keep */}
      <PageFooter
        left={
          caseApproved ? (
            <div
              role="status"
              aria-live="polite"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-success-soft-fg)]"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-[var(--color-success)]" aria-hidden="true" />
              本案件は承認されました (モック動作) — 受信トレイへ遷移します
            </div>
          ) : null
        }
        right={
          <>
            <BusinessApprovalChip status={c.businessApprovalStatus} />
            <button
              type="button"
              onClick={() => navigate(`/cases/${c.id}/comment`)}
              disabled={caseApproved}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              差戻し
            </button>
            {/* F-2 Wave 2 PR 2 Commit 4: metadata gate — MetadataStrip が viewport visible になるまで disabled
              * gate1-decision.md F-2-A 採用 spec: 承認 button = MetadataStrip ack で active 化 */}
            <button
              type="button"
              onClick={() => setCaseApproved(true)}
              disabled={caseApproved || !metadataAcked}
              title={!metadataAcked ? '変更内容を確認してください (画面下部の変更メタデータを確認)' : undefined}
              aria-describedby={!metadataAcked ? 'approve-gate-hint' : undefined}
              className="inline-flex items-center gap-1.5 rounded-md bg-[var(--color-primary)] px-3.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
              承認
            </button>
          </>
        }
      />
    </div>
  )
}
