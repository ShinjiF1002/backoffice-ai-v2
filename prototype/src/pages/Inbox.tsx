import { useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ChevronRight, Filter, ArrowUpDown, AlertTriangle, CheckSquare, X } from 'lucide-react'
import { mockCases } from '@/data/mock-cases'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { PageFooter } from '@/components/shared/PageFooter'
import { FilterChip } from '@/components/shared/FilterChip'
import { MetaChip } from '@/components/shared/MetaChip'
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
 *  - Footer: bulk action chips (一括承認 / 一括差戻し、disabled state) + 件数 summary。「(一括操作は次の実装段階で対応)」caption が wireframe の唯一の signal
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
                aria-describedby="inbox-filter-caption"
              >
                <span className="font-medium">{f.label}:</span>
                <span className="text-slate-500">{f.value}</span>
              </FilterChip>
            )
          })}
        </div>
      </header>

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
            <tbody className="divide-y divide-slate-100">
              {rows.map((c) => {
                const tone = slaTone(c.elapsedLabel, c.status)
                return (
                  <tr
                    key={c.id}
                    onClick={() => navigate(`/cases/${c.id}`)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        navigate(`/cases/${c.id}`)
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={`案件 ${c.id} ${c.workflowName} を開く`}
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
                    <td className="px-3 py-2 text-xs text-slate-700">{c.assignee ?? '—'}</td>
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
              AI処理中 {aiProcessingCount} / 確認待ち {readyCount} / 承認待ち {approvalWaitingCount} / 差戻し {sentBackCount} / 完了 {doneCount}
            </span>
          </div>
        }
        right={
          <>
            <button
              type="button"
              disabled
              aria-disabled="true"
              aria-describedby="inbox-filter-caption"
              className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-400 opacity-70"
            >
              <CheckSquare className="h-3 w-3" aria-hidden="true" />
              一括承認
            </button>
            <button
              type="button"
              disabled
              aria-disabled="true"
              aria-describedby="inbox-filter-caption"
              className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-400 opacity-70"
            >
              <X className="h-3 w-3" aria-hidden="true" />
              一括差戻し
            </button>
          </>
        }
        caption="フィルタ・並び順・一括操作は次の実装段階で対応"
        captionId="inbox-filter-caption"
      />
    </div>
  )
}
