import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ChevronRight, Filter, ArrowUpDown, AlertTriangle, CheckSquare, X, AlertCircle } from 'lucide-react'
import { mockCases, getCaseById } from '@/data/mock-cases'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { PageFooter } from '@/components/shared/PageFooter'
import { FilterChip } from '@/components/shared/FilterChip'
import { MetaChip } from '@/components/shared/MetaChip'
import { DetailDrawer } from '@/components/shared/DetailDrawer'
import { DisabledAction } from '@/components/shared/DisabledAction'
import { ActorBand } from '@/components/shared/ActorBand'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingState } from '@/components/shared/LoadingState'
import { NextActionStrip } from '@/components/shared/NextActionStrip'
import { cn } from '@/lib/cn'
import { parseElapsed } from '@/lib/elapsed'
import { caseStatusToTone } from '@/lib/status-tones'
import type { CaseStatus } from '@/data/types'

/**
 * 業務 ID (workflowId) → UI 表示名。Dashboard card link で `?workflow=UC-BO-01` 等を渡された時に
 * filter chip 表示と filter logic で参照する。Day 12 Page 3 (Dashboard) 連携で追加。
 */
const workflowLabel: Record<string, string> = {
  'UC-BO-01': '法人住所変更',
  'UC-BO-02': '口座開設書類完備',
}

/**
 * Inbox — Demo Chapter 1 起点画面、Day 12 wireframe (CaseReview visual grammar 継承)
 *
 * SSOT:
 *  - docs/03-ui-prototype-design.md §4.1 Inbox Screen Card
 *  - Operational Premium Light §2.7 (slate-50 shell / white panel / 1px hairline / indigo primary / mono cadence)
 *  - prototype/CLAUDE.md (active workflow UC-BO-01 + UC-BO-02 のみ、国際送金 / Tier 3 規制語は mock 0)
 *
 * Layout:
 *  - PageHeader: breadcrumb + h1 + 件数 chip + (右) 並び順 selector / 下段 filter chip row (業務 / 状態 / 担当者 / 経過時間)
 *  - Main body: queue table (案件 ID mono / 業務名 / 状態 StatusBadge / 経過 mono SLA-tinted [status 連動: pending/ready/sent-back のみ tint、business-approval-waiting/reflected は normal 固定] / 担当者 / 注意 chip [amber-soft、alertCount > 0 のみ] / →)
 *  - Row click: navigate + Enter/Space keyboard、focus visibility は global :focus-visible (indigo 2px outline) で表現 (Day 12.2 CR R28 B2)
 *  - Footer: bulk action (一括承認 / 一括差戻し、DisabledAction wrapper + per-button reason) + 件数 summary。Day 19 Commit 4 U-7: footer caption 削除 / option Y SSOT (PrototypeModeLabel general framing で集約、page-level caption は重複削除)
 *  - URL search param `?workflow=UC-BO-XX` で業務別 filter 適用 (Day 12 Page 3 Dashboard card 動線連携、enabled no-op 0 を維持)、filter active 時は workflow chip が indigo soft で active state + X icon で解除可能
 *  - sort 切替 / 状態 / 担当者 / 経過時間 filter chip / pagination は visual のみ、動作は次の実装段階以降 (tooltip は demo noise 回避のため非表示、footer caption に集約 — Day 12.2 CR R28 M3)
 *  - Prototype mode label は AppShell 経由で自動表示
 *
 * CR R27 (Day 12.1 patch): JP-only tooltip + bulk action disabled + Alert 列 header → 注意 (CaseReview 注意 strip と register 統一)。
 * CR R28 (Day 12.2 patch): B2 row focus visibility に global :focus-visible 委譲 + M1 slaTone(status) で SLA 適用範囲を入力者 queue 対象に限定 + M3 tooltip 6 hit 集約 (footer caption 1 行のみ)。
 * Day 12 Page 3 (Dashboard 連携): useSearchParams で `?workflow=` を読み、workflow filter chip を active state + 解除動線として実機能化 (Dashboard card click → /inbox?workflow=UC-BO-XX で工程連動)。
 */

/**
 * SLA color band based on elapsed `HH:MM:SS` 先頭時間で 3 帯に分類。
 *
 * Day 12.2 / CR R28 M1: status により SLA 適用範囲を分岐。
 * 入力者 queue の SLA 対象 = `pending` / `ready` / `sent-back` のみ。
 * `business-approval-waiting` (承認者 queue 移行済) / `reflected` (完了) は normal 固定 (入力者責任範囲外、誤読防止)。
 */
function slaTone(label: string, status: CaseStatus): 'normal' | 'warn' | 'critical' {
  if (status === 'business-approval-waiting' || status === 'reflected') return 'normal'
  const hh = parseInt(label.split(':')[0] ?? '0', 10)
  if (isNaN(hh)) return 'normal'
  if (hh >= 3) return 'critical'
  if (hh >= 1) return 'warn'
  return 'normal'
}

export function Inbox() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const workflowFilter = searchParams.get('workflow')
  // Day 19 Commit 3b U-12: row click → DetailDrawer preview、drawer 内 CTA で full navigate
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null)
  const selectedCase = selectedCaseId ? getCaseById(selectedCaseId) : null

  // Day 19 Commit 3c U-13: NextActionStrip recommended case (v1.2 lock: ?demo=1 で CASE-2026-0142 固定、default は alert + 経過最大 で operational priority、queue table 行順序と無関係)
  const isDemo = searchParams.get('demo') === '1'
  const recommendedCase = useMemo(() => {
    if (isDemo) return mockCases.find((c) => c.id === 'CASE-2026-0142') ?? null
    const alertCases = mockCases.filter((c) => c.alertCount > 0)
    if (alertCases.length === 0) return null
    return [...alertCases].sort((a, b) => parseElapsed(b.elapsedLabel) - parseElapsed(a.elapsedLabel))[0]
  }, [isDemo])
  /**
   * Day 12 Page 3 (Dashboard) 連携: `/inbox?workflow=UC-BO-XX` で業務別 filter。
   * filter param 不一致 ID は完全空 list を返す (no fallback to all)、Dashboard card 動線が安全。
   * sort 切替 / 他 filter chip (状態 / 担当者 / 経過時間) は wireframe (Day 14-15 で interactive 化)。
   */
  const rows = useMemo(
    () => (workflowFilter ? mockCases.filter((c) => c.workflowId === workflowFilter) : mockCases),
    [workflowFilter]
  )
  const total = rows.length
  const workflowFilterLabel = workflowFilter ? workflowLabel[workflowFilter] ?? workflowFilter : 'すべて'
  const aiProcessingCount = useMemo(() => rows.filter((c) => c.status === 'pending').length, [rows])
  const readyCount = useMemo(() => rows.filter((c) => c.status === 'ready').length, [rows])
  const approvalWaitingCount = useMemo(() => rows.filter((c) => c.status === 'business-approval-waiting').length, [rows])
  const sentBackCount = useMemo(() => rows.filter((c) => c.status === 'sent-back').length, [rows])
  const doneCount = useMemo(() => rows.filter((c) => c.status === 'reflected').length, [rows])

  const filterOptions = [
    { key: 'workflow', label: '業務', value: workflowFilterLabel },
    { key: 'status', label: '状態', value: 'すべて' },
    { key: 'assignee', label: '担当者', value: 'すべて' },
    { key: 'elapsed', label: '経過時間', value: 'すべて' },
  ]

  return (
    <div className="flex h-full flex-col bg-[var(--color-canvas)]">
      {/* === PageHeader === */}
      <header
        data-page-header
        className="sticky top-0 z-30 min-h-[var(--height-pageheader)] border-b border-slate-200 bg-white px-6 py-3"
      >
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500">
          <span className="text-slate-700">受信トレイ</span>
        </nav>

        {/* Title row */}
        <div className="mt-1.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-slate-900">受信トレイ</h1>
            <span className="inline-flex items-center rounded bg-slate-100 px-2 py-0.5 font-mono text-xs font-medium text-slate-700 tabular">
              {total} 件
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* Day 12 CR R33 B2: 並び順は現状 read-only 表示 (sort 切替は次の実装段階)。span 化で enabled no-op を排除。 */}
            <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-500">
              <ArrowUpDown className="h-3 w-3" aria-hidden="true" />
              並び順: 受付順
            </span>
          </div>
        </div>

        {/* Filter chip row (Day 18.5 P0 / P1-2 反映: 未実装 filter は disabled FilterChip + footer caption pattern、active workflow filter は button keep 解除動線) */}
        <div className="mt-2.5 flex items-center gap-2">
          <Filter className="h-3 w-3 shrink-0 text-slate-400" aria-hidden="true" />
          {filterOptions.map((f) => {
            const isActive = f.value !== 'すべて'
            const isActiveWorkflowFilter = f.key === 'workflow' && isActive
            if (isActiveWorkflowFilter) {
              return (
                <FilterChip
                  key={f.key}
                  active={true}
                  onClick={() => navigate('/inbox')}
                  className="font-medium"
                >
                  <span>{f.label}:</span>
                  <span>{f.value}</span>
                  <X className="h-3 w-3" aria-label="filter 解除" />
                </FilterChip>
              )
            }
            return (
              <FilterChip
                key={f.key}
                disabled
              >
                <span className="font-medium">{f.label}:</span>
                <span className="text-slate-500">{f.value}</span>
              </FilterChip>
            )
          })}
        </div>
      </header>

      {/* === Day 19 Commit 3c U-13: NextActionStrip (L1 primary action anchor、PageHeader 直下、queue table 行と独立した operational priority) === */}
      {recommendedCase && (
        <NextActionStrip
          label="次に処理すべき案件"
          summary={`${recommendedCase.id} (経過 ${recommendedCase.elapsedLabel})`}
          actionHref={`/cases/${recommendedCase.id}`}
        />
      )}

      {/* === Main body queue table === */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/60 text-[10px] font-medium uppercase tracking-wide text-slate-500">
                <th className="px-3 py-2 text-left">案件 ID</th>
                <th className="px-3 py-2 text-left">業務</th>
                <th className="px-3 py-2 text-left">状態</th>
                <th className="px-3 py-2 text-left">経過</th>
                <th className="px-3 py-2 text-left">担当者</th>
                <th className="px-3 py-2 text-left">注意</th>
                <th className="px-3 py-2 text-right" aria-label="開く" />
              </tr>
            </thead>
            {/* F-3 Wave 3 PR 3 Commit 7: applicable filtered-empty / loading state (Inbox)
              * mock data 13 rows + filter 切替 disabled (Day 18.5) のため通常時は trigger せず、demo-state query で強制 trigger 可能 */}
            <tbody className="divide-y divide-slate-100">
              {searchParams.get('demo-state') === 'loading' && (
                <tr><td colSpan={7} className="px-3 py-4"><LoadingState variant="skeleton" rowCount={5} rowHeightClass="h-9" /></td></tr>
              )}
              {searchParams.get('demo-state') !== 'loading' && rows.length === 0 && (
                <tr><td colSpan={7} className="px-3 py-4">
                  <EmptyState
                    subState={workflowFilter ? 'filtered-empty' : 'truly-empty'}
                    title={workflowFilter ? 'フィルタに一致する案件がありません' : 'まだ案件がありません'}
                    description={workflowFilter ? '業務フィルタの条件を見直してください' : '新しい案件が登録されるとここに表示されます'}
                  />
                </td></tr>
              )}
              {searchParams.get('demo-state') !== 'loading' && rows.map((c) => {
                const tone = slaTone(c.elapsedLabel, c.status)
                return (
                  <tr
                    key={c.id}
                    onClick={() => setSelectedCaseId(c.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setSelectedCaseId(c.id)
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={`案件 ${c.id} ${c.workflowName} の概要を開く`}
                    className="cursor-pointer transition-colors hover:bg-slate-50"
                  >
                    <td className="px-3 py-2 font-mono text-xs text-slate-700 tabular">{c.id}</td>
                    <td className="px-3 py-2 text-xs text-slate-900">{c.workflowName}</td>
                    <td className="px-3 py-2">
                      <StatusBadge tone={caseStatusToTone(c.status)} label={c.statusLabel} />
                    </td>
                    <td className="px-3 py-2">
                      {tone === 'critical' ? (
                        <MetaChip label={c.elapsedLabel} tone="error" mono />
                      ) : tone === 'warn' ? (
                        <MetaChip label={c.elapsedLabel} tone="alert" mono />
                      ) : (
                        <span className="font-mono text-xs text-slate-600 tabular">{c.elapsedLabel}</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-700">
                      {/* F-5 Wave 2 PR 2 Commit 5: ActorBand (human assignee、Inbox queue 高密度行 size=sm)
                        * F-7 hybrid: delegate active 時は MetaChip「代理中 (from → to)」を併記 (gate1-decision.md F-7 案 B Inbox 部分) */}
                      {c.assignee ? (
                        <div className="flex flex-col items-start gap-0.5">
                          <ActorBand actor="human" label={c.assignee} size="sm" role="入力者" />
                          {c.delegate && (
                            <span
                              className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[9px] text-slate-600 tabular"
                              title={`不在: ${c.delegate.absentFrom} 〜 ${c.delegate.absentTo}`}
                            >
                              代理: {c.delegate.from} → {c.delegate.to}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {c.alertCount > 0 ? (
                        <span className="inline-flex items-center gap-1 rounded bg-[var(--color-alert-soft)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--color-alert)] tabular">
                          <AlertTriangle className="h-2.5 w-2.5" aria-hidden="true" />
                          {c.alertCount}
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <ChevronRight className="ml-auto h-4 w-4 text-slate-300" aria-hidden="true" />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* === Sticky bottom action bar (Day 14 P2 D1: PageFooter primitive swap) === */}
      <PageFooter
        left={
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-slate-500 tabular">1 - {total} / {total} 件</span>
            <span className="text-slate-300" aria-hidden="true">|</span>
            <span className="text-[10px] text-slate-400">
              AI処理中 {aiProcessingCount} / 確認待ち {readyCount} / 承認者承認待ち {approvalWaitingCount} / 差戻し {sentBackCount} / 完了 {doneCount}
            </span>
          </div>
        }
        right={
          <>
            {/* Day 19 Commit 4 U-7: 一括 action は DisabledAction wrapper + per-button reason に SSOT 化、footer caption 重複削除 */}
            <DisabledAction
              mode="wrapper"
              reason="一括承認動作は次の実装段階で対応"
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-400 opacity-70"
            >
              <CheckSquare className="h-3 w-3" aria-hidden="true" />
              一括承認
            </DisabledAction>
            <DisabledAction
              mode="wrapper"
              reason="一括差戻し動作は次の実装段階で対応"
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-400 opacity-70"
            >
              <X className="h-3 w-3" aria-hidden="true" />
              一括差戻し
            </DisabledAction>
          </>
        }
      />

      {/* === Day 19 Commit 3b U-12: row click → DetailDrawer preview (non-modal PDR、background interactive、body scroll 保持) === */}
      <DetailDrawer
        open={selectedCaseId !== null}
        onClose={() => setSelectedCaseId(null)}
        title={selectedCase ? `${selectedCase.id} 概要` : ''}
        width="480"
      >
        {selectedCase && (
          <div className="space-y-4 text-xs">
            <section>
              <h3 className="mb-2 text-sm font-semibold text-slate-900">{selectedCase.workflowName}</h3>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge tone={caseStatusToTone(selectedCase.status)} label={selectedCase.statusLabel} />
                <span className="font-mono text-[11px] text-slate-500 tabular">経過 {selectedCase.elapsedLabel}</span>
                {selectedCase.alertCount > 0 && (
                  <span className="inline-flex items-center gap-1 rounded bg-[var(--color-alert-soft)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--color-alert)] tabular">
                    <AlertTriangle className="h-2.5 w-2.5" aria-hidden="true" />
                    注意 {selectedCase.alertCount}
                  </span>
                )}
              </div>
            </section>

            <section className="border-t border-slate-100 pt-3">
              <h4 className="mb-2 text-[11px] font-medium text-slate-500">主要項目 (先頭 3 件)</h4>
              <dl className="space-y-2">
                {selectedCase.fields.slice(0, 3).map((f, i) => (
                  <div key={i}>
                    <dt className="text-[11px] text-slate-500">{f.label}</dt>
                    <dd className={cn('mt-0.5 text-slate-800', f.monospace && 'font-mono')}>{f.value}</dd>
                    {typeof f.confidence === 'number' && (
                      <dd className="mt-0.5 font-mono text-[10px] text-slate-400 tabular">信頼度 {f.confidence.toFixed(2)}</dd>
                    )}
                  </div>
                ))}
              </dl>
            </section>

            {selectedCase.alerts.length > 0 && (
              <section className="border-t border-slate-100 pt-3">
                <h4 className="mb-2 flex items-center gap-1 text-[11px] font-medium text-slate-500">
                  <AlertCircle className="h-3 w-3 text-[var(--color-alert)]" aria-hidden="true" />
                  注意 ({selectedCase.alerts.length})
                </h4>
                <ul className="space-y-1.5">
                  {selectedCase.alerts.map((a) => (
                    <li key={a.id} className="text-[11px] leading-relaxed text-slate-700">{a.message}</li>
                  ))}
                </ul>
              </section>
            )}

            <section className="border-t border-slate-100 pt-3">
              <h4 className="mb-2 text-[11px] font-medium text-slate-500">引用根拠</h4>
              <p className="font-mono text-[11px] text-slate-700 tabular">{selectedCase.citations.length} 件 (承認済ナレッジ)</p>
            </section>

            <div className="border-t border-slate-100 pt-4">
              <Link
                to={`/cases/${selectedCase.id}`}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-[var(--color-primary)] px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-[var(--color-primary-strong)]"
              >
                案件レビューを開く
                <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        )}
      </DetailDrawer>
    </div>
  )
}
