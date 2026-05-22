import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, Filter, ArrowUpDown, AlertTriangle, CheckSquare, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { mockCases } from '@/data/mock-cases'
import { StatusBadge } from '@/components/case/StatusBadge'
import type { CaseStatus } from '@/data/types'

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
 *  - filter chip / sort selector / pagination は visual のみ、動作は次の実装段階以降 (tooltip は demo noise 回避のため非表示、footer caption に集約 — Day 12.2 CR R28 M3)
 *  - Prototype mode label は AppShell 経由で自動表示
 *
 * CR R27 (Day 12.1 patch): JP-only tooltip + bulk action disabled + Alert 列 header → 注意 (CaseReview 注意 strip と register 統一)。
 * CR R28 (Day 12.2 patch): B2 row focus visibility に global :focus-visible 委譲 + M1 slaTone(status) で SLA 適用範囲を入力者 queue 対象に限定 + M3 tooltip 6 hit 集約 (footer caption 1 行のみ)。
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

const FILTER_OPTIONS = [
  { key: 'workflow', label: '業務' },
  { key: 'status', label: '状態' },
  { key: 'assignee', label: '担当者' },
  { key: 'elapsed', label: '経過時間' },
] as const

export function Inbox() {
  const navigate = useNavigate()
  // Sort by 受付順 default (= mock data 配列順、Day 14-15 で interactive sort 切替)
  const rows = useMemo(() => mockCases, [])
  const total = rows.length

  return (
    <div className="flex h-full flex-col bg-[var(--color-canvas)]">
      {/* === PageHeader === */}
      <header className="border-b border-slate-200 bg-white px-6 py-3">
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
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700 transition-colors hover:bg-slate-50"
            >
              <ArrowUpDown className="h-3 w-3" aria-hidden="true" />
              並び順: 受付順
            </button>
          </div>
        </div>

        {/* Filter chip row */}
        <div className="mt-2.5 flex items-center gap-2">
          <Filter className="h-3 w-3 shrink-0 text-slate-400" aria-hidden="true" />
          {FILTER_OPTIONS.map((f) => (
            <button
              key={f.key}
              type="button"
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-700 transition-colors hover:bg-slate-50"
            >
              <span className="font-medium">{f.label}:</span>
              <span className="text-slate-500">すべて</span>
            </button>
          ))}
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
                      <StatusBadge status={c.status} label={c.statusLabel} />
                    </td>
                    <td
                      className={cn(
                        'px-3 py-2 font-mono text-xs tabular',
                        tone === 'critical' && 'text-[var(--color-error)]',
                        tone === 'warn' && 'text-[var(--color-alert)]',
                        tone === 'normal' && 'text-slate-600'
                      )}
                    >
                      {c.elapsedLabel}
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

      {/* === Sticky bottom action bar === */}
      <footer className="border-t border-slate-200 bg-white px-6 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled
              aria-disabled="true"
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-400 opacity-70 cursor-not-allowed"
            >
              <CheckSquare className="h-3 w-3" aria-hidden="true" />
              一括承認
            </button>
            <button
              type="button"
              disabled
              aria-disabled="true"
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-400 opacity-70 cursor-not-allowed"
            >
              <X className="h-3 w-3" aria-hidden="true" />
              一括差戻し
            </button>
            <span className="ml-1 text-[10px] text-slate-400">(一括操作は次の実装段階で対応)</span>
          </div>
          <div className="font-mono text-xs text-slate-500 tabular">
            1 - {total} / {total} 件
          </div>
        </div>
      </footer>
    </div>
  )
}
