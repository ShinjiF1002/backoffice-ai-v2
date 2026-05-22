import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  ChevronRight,
  AlertTriangle,
  Inbox as InboxIcon,
  FileText,
  MessageSquare,
  Sparkles,
  Gauge,
  ArrowRight,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import { mockCases } from '@/data/mock-cases'
import { getWorkflowTrend } from '@/data/mock-metrics'
import { Sparkline } from '@/components/case/Sparkline'
import type { CaseRecord, CaseStatus } from '@/data/types'

/**
 * Dashboard — Demo Chapter 1/2 の入口、Day 12 Page 3 wireframe
 *
 * SSOT:
 *  - docs/03-ui-prototype-design.md §4.4 + §2.7 (Operational Premium Light)
 *  - prototype/CLAUDE.md (active workflow UC-BO-01 + UC-BO-02 のみ、国際送金 restricted boundary pack は card 化しない)
 *
 * Layout (CaseReview / Inbox / ProposalReview と register 共通、Dashboard 固有 page-specific layout):
 *  - PageHeader (sticky): breadcrumb (ダッシュボード、root level) + h1 + 件数 chip × 3 (案件数 / 注意 / 承認待ち) + 全 [仮説 / 要検証] label
 *  - 任意 attention strip (queue-level 注意 1 本まで、CaseReview の case alert strip と register 統一)
 *  - Main (scrollable):
 *    - 業務 card grid (2 並列、UC-BO-01 + UC-BO-02、card click → `/inbox?workflow=...` で filter 適用)
 *    - workflow lane (Demo Chapter 1+2 動線、5 node × 5 route Link、enabled no-op 0)
 *  - Footer (sticky): mock state + 次の実装段階 scope、PrototypeModeLabel と内容重複なし
 *
 * 規範:
 *  - PrototypeModeLabel は AppShell TopBar 経由で自動表示、本 page 内で重複しない
 *  - 国際送金 (restricted boundary pack) は card / metric / sparkline 全て 0、勘定系規制語 exact 0、高額閾値 exact 0
 *  - KPI / SLO / target values は表示時に必ず `[仮説 / 要検証]` label
 *  - enabled no-op 0: workflow lane の 5 node はすべて実 route、card link は Inbox 側で `?workflow=...` filter を実装済
 */

interface WorkflowCardStats {
  workflowId: string
  workflowName: string
  total: number
  alertCases: number
  totalAlerts: number
  businessApprovalWaiting: number
  byStatus: Record<CaseStatus, number>
  state: 'busy' | 'active' | 'quiet'
  stateLabel: string
}

function deriveStats(cases: CaseRecord[]): Map<string, WorkflowCardStats> {
  const init = (workflowId: string, workflowName: string): WorkflowCardStats => ({
    workflowId,
    workflowName,
    total: 0,
    alertCases: 0,
    totalAlerts: 0,
    businessApprovalWaiting: 0,
    byStatus: {
      pending: 0,
      ready: 0,
      'sent-back': 0,
      'business-approval-waiting': 0,
      reflected: 0,
    },
    state: 'quiet',
    stateLabel: '静穏',
  })

  const map = new Map<string, WorkflowCardStats>([
    ['UC-BO-01', init('UC-BO-01', '法人住所変更')],
    ['UC-BO-02', init('UC-BO-02', '口座開設書類完備')],
  ])

  for (const c of cases) {
    const stats = map.get(c.workflowId)
    if (!stats) continue // 国際送金等 restricted workflow は集計対象外
    stats.total += 1
    stats.byStatus[c.status] += 1
    if (c.alertCount > 0) {
      stats.alertCases += 1
      stats.totalAlerts += c.alertCount
    }
    if (c.businessApprovalStatus === '承認待ち') stats.businessApprovalWaiting += 1
  }

  // state 判定 (alert ratio + sent-back の有無、観察的 heuristic、wireframe 段階の placeholder logic [仮説 / 要検証])
  for (const s of map.values()) {
    const active = s.total - s.byStatus.reflected
    if (active === 0) {
      s.state = 'quiet'
      s.stateLabel = '静穏'
    } else {
      const alertRatio = s.alertCases / Math.max(active, 1)
      const sentBack = s.byStatus['sent-back']
      if (alertRatio >= 0.4 || sentBack >= 2) {
        s.state = 'busy'
        s.stateLabel = '要注意'
      } else {
        s.state = 'active'
        s.stateLabel = '通常稼働'
      }
    }
  }

  return map
}

/** 受信トレイ全体への注意 (queue-level)、現状は SLA 高経過 case の 1 本のみ */
function deriveAttention(cases: CaseRecord[]): Array<{
  id: string
  message: string
  linkTo: string
}> {
  const out: Array<{ id: string; message: string; linkTo: string }> = []
  // 入力者 SLA 対象 (pending / ready / sent-back) で経過 3h 以上の case
  const critical = cases.find((c) => {
    if (!['pending', 'ready', 'sent-back'].includes(c.status)) return false
    const hh = parseInt(c.elapsedLabel.split(':')[0] ?? '0', 10)
    return hh >= 3
  })
  if (critical) {
    out.push({
      id: 'attn-sla-high-elapsed',
      message: `入力者確認待ちで 3 時間以上経過した案件があります (${critical.id} · ${critical.workflowName} · 経過 ${critical.elapsedLabel} [仮説 / 要検証])`,
      linkTo: `/cases/${critical.id}`,
    })
  }
  return out
}

const WORKFLOW_LANE_STEPS = [
  { to: '/inbox', label: '受信トレイ', icon: InboxIcon, hint: '案件一覧の起点' },
  { to: '/cases/CASE-2026-0142', label: '案件レビュー', icon: FileText, hint: 'AI 入力結果 + 証跡 + ナレッジ' },
  { to: '/cases/CASE-2026-0142/comment', label: 'コメント付き差戻し', icon: MessageSquare, hint: '5 分類 + 自由記述' },
  { to: '/proposals/PROP-2026-031', label: 'AI 提案レビュー', icon: Sparkles, hint: '手順承認の循環' },
  { to: '/metrics', label: 'メトリクス確認', icon: Gauge, hint: 'KPI / KRI 観測 [仮説 / 要検証]' },
] as const

export function Dashboard() {
  const statsMap = useMemo(() => deriveStats(mockCases), [])
  const stats = useMemo(() => Array.from(statsMap.values()), [statsMap])
  const attention = useMemo(() => deriveAttention(mockCases), [])

  const totalCases = stats.reduce((a, s) => a + s.total, 0)
  const totalAlerts = stats.reduce((a, s) => a + s.totalAlerts, 0)
  const totalBusinessApprovalWaiting = stats.reduce((a, s) => a + s.businessApprovalWaiting, 0)

  return (
    <div className="flex h-full flex-col bg-[var(--color-canvas)]">
      {/* === PageHeader === */}
      <header className="border-b border-slate-200 bg-white px-6 py-3">
        {/* Breadcrumb (root level、Dashboard 自体が起点) */}
        <nav aria-label="breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500">
          <span className="text-slate-700">ダッシュボード</span>
        </nav>

        {/* Title row + compact chips */}
        <div className="mt-1.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-slate-900">ダッシュボード</h1>
            <span className="inline-flex items-center rounded bg-slate-100 px-2 py-0.5 font-mono text-xs font-medium text-slate-700 tabular">
              案件数 {totalCases}
            </span>
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded px-2 py-0.5 font-mono text-xs font-medium tabular',
                totalAlerts > 0
                  ? 'bg-[var(--color-alert-soft)] text-[var(--color-alert)]'
                  : 'bg-slate-100 text-slate-500'
              )}
            >
              <AlertTriangle className="h-3 w-3" aria-hidden="true" />
              注意 {totalAlerts}
            </span>
            <span
              className={cn(
                'inline-flex items-center rounded px-2 py-0.5 font-mono text-xs font-medium tabular',
                totalBusinessApprovalWaiting > 0
                  ? 'bg-[var(--color-primary-soft)] text-[var(--color-primary)]'
                  : 'bg-slate-100 text-slate-500'
              )}
            >
              承認待ち {totalBusinessApprovalWaiting}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px] text-slate-500 tabular">UC-BO-01 + UC-BO-02 [仮説 / 要検証]</span>
          </div>
        </div>
      </header>

      {/* === Attention strip (queue-level、CaseReview の case alert strip と register 統一) === */}
      {attention.length > 0 && (
        <div className="border-b border-amber-200 bg-amber-50/40 px-6 py-2.5">
          <div className="flex items-start gap-3">
            <span className="shrink-0 font-mono text-[10px] font-medium uppercase tracking-wide text-amber-700">
              注意 · {attention.length} 件
            </span>
            <div className="flex flex-1 flex-wrap gap-2">
              {attention.map((a) => (
                <div
                  key={a.id}
                  className="inline-flex max-w-3xl items-start gap-1.5 rounded-md border border-amber-200 bg-white px-2.5 py-1.5 text-[11px]"
                >
                  <AlertTriangle
                    className="mt-0.5 h-3 w-3 shrink-0 text-[var(--color-alert)]"
                    aria-hidden="true"
                  />
                  <p className="flex-1 leading-relaxed text-slate-800">{a.message}</p>
                  <Link
                    to={a.linkTo}
                    className="shrink-0 font-medium text-[var(--color-alert)] hover:underline"
                  >
                    確認
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* === Main body === */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* 業務 card grid (2 並列、UC-BO-01 + UC-BO-02 のみ、国際送金は card 化しない) */}
        <section aria-labelledby="dashboard-workflows" className="mb-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 id="dashboard-workflows" className="text-sm font-semibold text-slate-900">
              業務別の状況
            </h2>
            <span className="font-mono text-[10px] text-slate-500">
              表示対象: 登録済み 2 業務
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {stats.map((s) => {
              const trend = getWorkflowTrend(s.workflowId)
              return (
                <article
                  key={s.workflowId}
                  className="flex flex-col rounded-lg border border-slate-200 bg-white p-5"
                >
                  {/* Card header */}
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-mono text-[10px] uppercase tracking-wide text-slate-500">
                        {s.workflowId}
                      </p>
                      <h3 className="mt-0.5 truncate text-base font-semibold text-slate-900">
                        {s.workflowName}
                      </h3>
                    </div>
                    <span
                      className={cn(
                        'shrink-0 inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
                        s.state === 'busy' && 'bg-[var(--color-alert-soft)] text-amber-900',
                        s.state === 'active' && 'bg-[var(--color-primary-soft)] text-[var(--color-primary)]',
                        s.state === 'quiet' && 'bg-slate-100 text-slate-600'
                      )}
                    >
                      {s.stateLabel}
                    </span>
                  </div>

                  {/* Key counts (3 column) */}
                  <div className="mb-3 grid grid-cols-3 gap-3">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-wide text-slate-500">
                        案件数
                      </p>
                      <p className="mt-0.5 font-mono text-lg font-semibold text-slate-900 tabular">
                        {s.total}
                      </p>
                    </div>
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-wide text-slate-500">注意</p>
                      <p
                        className={cn(
                          'mt-0.5 font-mono text-lg font-semibold tabular',
                          s.totalAlerts > 0 ? 'text-[var(--color-alert)]' : 'text-slate-400'
                        )}
                      >
                        {s.totalAlerts}
                      </p>
                    </div>
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-wide text-slate-500">
                        承認待ち
                      </p>
                      <p
                        className={cn(
                          'mt-0.5 font-mono text-lg font-semibold tabular',
                          s.businessApprovalWaiting > 0
                            ? 'text-[var(--color-primary)]'
                            : 'text-slate-400'
                        )}
                      >
                        {s.businessApprovalWaiting}
                      </p>
                    </div>
                  </div>

                  {/* Breakdown chips */}
                  <dl className="mb-3 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-slate-600">
                    <div className="flex items-center justify-between">
                      <dt>AI 処理中</dt>
                      <dd className="font-mono tabular text-slate-800">{s.byStatus.pending}</dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt>入力者確認待ち</dt>
                      <dd className="font-mono tabular text-slate-800">{s.byStatus.ready}</dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt>再処理中</dt>
                      <dd className="font-mono tabular text-slate-800">{s.byStatus['sent-back']}</dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt>承認者承認待ち</dt>
                      <dd className="font-mono tabular text-slate-800">
                        {s.byStatus['business-approval-waiting']}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt>反映済</dt>
                      <dd className="font-mono tabular text-slate-800">{s.byStatus.reflected}</dd>
                    </div>
                  </dl>

                  {/* Sparkline */}
                  <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                    <span className="text-[10px] text-slate-500">
                      直近 7 日件数推移 <span className="font-mono">[仮説 / 要検証]</span>
                    </span>
                    {trend && (
                      <Sparkline
                        data={trend.caseVolume7Day}
                        width={88}
                        height={20}
                        color="var(--color-primary)"
                      />
                    )}
                  </div>

                  {/* CTA */}
                  <Link
                    to={`/inbox?workflow=${s.workflowId}`}
                    className="mt-3 inline-flex items-center gap-1 self-start text-xs font-medium text-[var(--color-primary)] hover:underline"
                  >
                    {s.workflowName} の案件を開く
                    <ChevronRight className="h-3 w-3" aria-hidden="true" />
                  </Link>
                </article>
              )
            })}
          </div>
        </section>

        {/* Workflow lane (Demo Chapter 1+2 動線、5 node × 5 route Link) */}
        <section
          aria-labelledby="dashboard-workflow-lane"
          className="rounded-lg border border-slate-200 bg-white p-5"
        >
          <div className="mb-3">
            <h2 id="dashboard-workflow-lane" className="text-sm font-semibold text-slate-900">
              業務オペレーション動線
            </h2>
            <p className="mt-0.5 text-[11px] text-slate-500">
              Demo Chapter 1+2 で辿る画面遷移。各ノードから該当画面へ遷移します。
            </p>
          </div>
          <ol className="flex flex-col gap-2 lg:flex-row lg:items-stretch lg:gap-1">
            {WORKFLOW_LANE_STEPS.map((step, idx) => {
              const Icon = step.icon
              const isLast = idx === WORKFLOW_LANE_STEPS.length - 1
              return (
                <li key={step.to} className="flex flex-1 items-stretch gap-1">
                  <Link
                    to={step.to}
                    className="flex flex-1 flex-col rounded-md border border-slate-200 bg-white px-3 py-2.5 transition-colors hover:border-slate-300 hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-1.5">
                      <Icon
                        className="h-3.5 w-3.5 shrink-0 text-[var(--color-primary)]"
                        aria-hidden="true"
                      />
                      <span className="text-xs font-medium text-slate-800">{step.label}</span>
                    </div>
                    <p className="mt-1 text-[10px] leading-relaxed text-slate-500">{step.hint}</p>
                    <span className="mt-1 font-mono text-[10px] text-slate-400 tabular">{step.to}</span>
                  </Link>
                  {!isLast && (
                    <span className="hidden items-center text-slate-300 lg:flex" aria-hidden="true">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  )}
                </li>
              )
            })}
          </ol>
        </section>
      </div>

      {/* === Footer === */}
      <footer className="border-t border-slate-200 bg-white px-6 py-3 text-xs text-slate-500">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span>
            業務カード・動線・注意行は画面内モック状態からの集計。検証用 KPI 表示の拡張を予定 <span className="font-mono">[仮説 / 要検証]</span>。
          </span>
          <span className="font-mono text-[10px] text-slate-400 tabular">
            表示対象: UC-BO-01 + UC-BO-02 (登録済み 2 業務)
          </span>
        </div>
      </footer>
    </div>
  )
}
