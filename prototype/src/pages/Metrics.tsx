import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/cn'
import {
  mockKpiHypotheses,
  mockAuxiliaryKpis,
  mockKriCatalogue,
  mockWorkflowTrends,
  type KriState,
} from '@/data/mock-metrics'
import { Sparkline } from '@/components/shared/Sparkline'
import { PageFooter } from '@/components/shared/PageFooter'

/**
 * Metrics — 9 画面の 1 つ (`/metrics`)、Day 12 Page 6 wireframe
 *
 * SSOT:
 *  - docs/03-ui-prototype-design.md §4.8 (SCR-08 Metrics)
 *  - docs/05-metrics-and-gates.md §4 (4 KPI multi-criteria gate) + §5 (7 KPI catalogue) + §6 (9 KRI catalogue)
 *  - prototype/CLAUDE.md (Operational Premium Light tokens + JP-only + 仮説 / 要検証 ラベル discipline)
 *
 * Layout (CaseReview / Inbox / ProposalReview / Dashboard / SendBackComment / AgentSettings と register 共通):
 *  - Sticky PageHeader: breadcrumb + h1 + 期間 chip + meta + 業務 filter (全業務 / UC-BO-01 / UC-BO-02)
 *  - Main scrollable (full-width + p-4、Day 14 P1.5 C5 で max-w-7xl から full-width に統一):
 *    1. 仮説 framing 注 (mandatory、PageHeader 直下、slate-50 inset、Plan v1.4 P0-2 / v1.4.1 Fix 2)
 *    2. Hero — 4 KPI 進化要件 (multi-criteria gate visualization、border-2 primary 強調、Slide 8 視覚化中核)
 *    3. 補助 KPI 一覧 (K5-K7 表形式、内容 + target + 現在値)
 *    4. 9 KRI 監視 (R1-R9 grid、state-conditional badge、trigger 条件 + 対応)
 *    5. 業務別 推移 (UC-BO-01 + UC-BO-02 sparkline、案件数 + Alert 発生率)
 *  - Sticky footer: ダッシュボード戻り link + 実装段階 caption
 *
 * 規範:
 *  - 全 KPI / KRI 数値に [仮説 / 要検証] ラベル必須 (DOC-MON-05 §4.1 SSOT)
 *  - 「本番導入可否を判定する gate ではない、Phase 1 で測定・再設定する検証仮説」注を PageHeader 直下に必ず表示
 *  - 国際送金 (restricted boundary pack) は表示対象外 (mockWorkflowTrends に未登録、DOC-OV-00 §2.1)
 *  - KPI_PROGRESSION (AgentSettings Hero) は mockKpiHypotheses を import で共有 (CR R40 M5 closure、drift 防止)
 */

const WORKFLOW_LABEL: Record<string, string> = {
  'UC-BO-01': '法人住所変更',
  'UC-BO-02': '口座開設書類完備',
}

const KRI_STATE: Record<
  KriState,
  { label: string; classes: string; dot: string }
> = {
  normal: {
    label: '正常',
    classes: 'border-emerald-200 bg-emerald-50 text-[var(--color-success-soft-fg)]',
    dot: 'bg-emerald-500',
  },
  caution: {
    label: '注意',
    classes: 'border-amber-200 bg-amber-50 text-[var(--color-alert-soft-fg)]',
    dot: 'bg-amber-500',
  },
  warning: {
    label: '警告',
    classes: 'border-red-200 bg-red-50 text-[var(--color-error-soft-fg)]',
    dot: 'bg-red-500',
  },
}

/** 4 KPI gate 達成判定 (mock 簡略化: 現在値 / target を文字列 parse) */
function evaluateGate(current: string, target: string): 'meets' | 'misses' {
  const cur = parseFloat(current.replace('%', ''))
  if (isNaN(cur)) return 'misses'
  if (target.startsWith('≥')) {
    const t = parseFloat(target.replace('≥', '').replace('%', '').trim())
    return cur >= t ? 'meets' : 'misses'
  }
  if (target.startsWith('≤')) {
    const t = parseFloat(target.replace('≤', '').replace('%', '').trim())
    return cur <= t ? 'meets' : 'misses'
  }
  return 'misses'
}

export function Metrics() {
  const [workflowFilter, setWorkflowFilter] = useState<string>('all')

  // 4 KPI gate aggregation
  const gateResults = mockKpiHypotheses.map((k) => ({
    ...k,
    gateState: evaluateGate(k.current, k.target),
  }))
  const gateAllMet = gateResults.every((g) => g.gateState === 'meets')
  const metCount = gateResults.filter((g) => g.gateState === 'meets').length

  // KRI state aggregation
  const kriByState = mockKriCatalogue.reduce(
    (acc, k) => {
      acc[k.state] = (acc[k.state] || 0) + 1
      return acc
    },
    { normal: 0, caution: 0, warning: 0 } as Record<KriState, number>
  )

  // Workflow trends filter
  const filteredTrends =
    workflowFilter === 'all'
      ? mockWorkflowTrends
      : mockWorkflowTrends.filter((t) => t.workflowId === workflowFilter)

  return (
    <div className="flex h-full flex-col bg-[var(--color-canvas)]">
      {/* === Sticky PageHeader === */}
      <header className="border-b border-slate-200 bg-white px-6 py-3">
        <nav aria-label="breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500">
          <Link to="/dashboard" className="hover:text-slate-700">
            ダッシュボード
          </Link>
          <ChevronRight className="h-3 w-3" aria-hidden="true" />
          <span className="text-slate-700">メトリクス</span>
        </nav>
        <div className="mt-1.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-slate-900">メトリクス</h1>
            <span className="inline-flex items-center rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
              直近 7 日 (検証用)
            </span>
            <span className="font-mono text-[10px] text-slate-500 tabular">
              4 KPI 進化判断 目安 + 補助 3 KPI + 9 KRI
            </span>
          </div>
        </div>
      </header>

      {/* === Main body === */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-4 p-4">
          {/* 1. 仮説 framing 注 (mandatory、PageHeader 直下) */}
          <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-[12px] leading-relaxed text-slate-700">
            <div className="flex items-start gap-2.5">
              <AlertTriangle
                className="mt-0.5 h-4 w-4 shrink-0 text-amber-600"
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-slate-900">
                  注: 本画面の閾値・現在値・推移はすべて{' '}
                  <span className="font-mono text-[11px]">[仮説 / 要検証]</span> です
                </p>
                <p className="mt-0.5 text-slate-600">
                  本番導入可否を判定する基準ではなく、Phase 1 で測定・再設定する検証仮説。本画面に表示される数値は目標仮説値であり、実績値ではありません。
                </p>
              </div>
            </div>
          </div>

          {/* 2. Hero — 4 KPI 進化要件 (multi-criteria gate visualization、Slide 8 中核) */}
          <section
            aria-labelledby="metrics-gate"
            className="rounded-lg border-2 border-[var(--color-primary)]/30 bg-white p-6"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2
                  id="metrics-gate"
                  className="text-base font-semibold text-slate-900"
                >
                  4 KPI 進化判断 目安
                </h2>
                <p className="mt-1 text-[11px] leading-relaxed text-slate-600">
                  全 4 KPI が目標仮説値を満たすと{' '}
                  <strong className="font-medium text-slate-800">
                    自動化段階 進化検討対象
                  </strong>
                  。Supervised → Checkpoint で 3 ヶ月以上連続達成{' '}
                  <span className="font-mono text-[10px]">[仮説 / 要検証]</span>
                </p>
              </div>
              <span
                className={cn(
                  'inline-flex shrink-0 items-center gap-1 rounded px-2 py-1 font-mono text-[11px] font-medium tabular',
                  gateAllMet ? 'bg-emerald-50 text-[var(--color-success-soft-fg)]' : 'bg-amber-50 text-[var(--color-alert-soft-fg)]'
                )}
              >
                {gateAllMet ? (
                  <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                ) : (
                  <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                )}
                仮判定 {metCount} / 4
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {gateResults.map((k) => {
                const meets = k.gateState === 'meets'
                return (
                  <div
                    key={k.id}
                    className={cn(
                      'rounded-md border p-4 transition-colors',
                      meets
                        ? 'border-emerald-200 bg-emerald-50/30'
                        : 'border-amber-200 bg-amber-50/30'
                    )}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] font-medium uppercase tracking-wide text-slate-500 tabular">
                        {k.id}
                      </span>
                      <span className="text-sm font-semibold text-slate-900">
                        {k.name}
                      </span>
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="font-mono text-[20px] font-semibold text-slate-900 tabular">
                        {k.current}
                      </span>
                      <span className="font-mono text-[10px] text-slate-500 tabular">
                        / {k.target}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] text-slate-500 tabular">
                        [仮説 / 要検証]
                      </span>
                      <Sparkline
                        data={k.trend}
                        width={80}
                        height={20}
                        color={meets ? 'var(--color-success)' : 'var(--color-alert)'}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          {/* 3. 補助 KPI 一覧 (K5-K7) */}
          <section
            aria-labelledby="metrics-aux"
            className="rounded-lg border border-slate-200 bg-white p-5"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2
                  id="metrics-aux"
                  className="text-sm font-semibold text-slate-900"
                >
                  補助 KPI 一覧
                </h2>
                <p className="mt-1 text-[11px] text-slate-500">
                  進化判断には直接使わない 推移 観測対象 (K5-K7)
                </p>
              </div>
              <span className="font-mono text-[10px] text-slate-500 tabular">
                {mockAuxiliaryKpis.length} 件
              </span>
            </div>
            <div className="overflow-hidden rounded-md border border-slate-100">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-3 py-2 text-left font-mono text-[10px] font-medium text-slate-600 tabular">
                      #
                    </th>
                    <th className="px-3 py-2 text-left text-[11px] font-medium text-slate-700">
                      KPI 名
                    </th>
                    <th className="px-3 py-2 text-left text-[11px] font-medium text-slate-700">
                      内容
                    </th>
                    <th className="px-3 py-2 text-right text-[11px] font-medium text-slate-700">
                      目標仮説
                    </th>
                    <th className="px-3 py-2 text-right text-[11px] font-medium text-slate-700">
                      現在値
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {mockAuxiliaryKpis.map((k, idx) => (
                    <tr
                      key={k.id}
                      className={cn(
                        'border-b border-slate-100 last:border-0',
                        idx % 2 === 0 ? '' : 'bg-slate-50/40'
                      )}
                    >
                      <td className="px-3 py-2 font-mono text-slate-500 tabular">
                        {k.id}
                      </td>
                      <td className="px-3 py-2 font-medium text-slate-800">{k.name}</td>
                      <td className="px-3 py-2 leading-relaxed text-slate-600">
                        {k.description}
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-slate-700 tabular">
                        {k.target}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <span className="font-mono font-semibold text-slate-900 tabular">
                          {k.current}
                        </span>
                        <div className="font-mono text-[10px] text-slate-500 tabular">
                          [仮説 / 要検証]
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 4. 9 KRI 監視 */}
          <section
            aria-labelledby="metrics-kri"
            className="rounded-lg border border-slate-200 bg-white p-5"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2
                  id="metrics-kri"
                  className="text-sm font-semibold text-slate-900"
                >
                  9 KRI 監視
                </h2>
                <p className="mt-1 text-[11px] text-slate-500">
                  異常検知の検知条件、閾値超過時は手順管理者 / AI 管理者に通知
                </p>
              </div>
              <div className="flex items-center gap-2 font-mono text-[10px] tabular">
                <span className="inline-flex items-center gap-1 text-[var(--color-success-soft-fg)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                  正常 {kriByState.normal}
                </span>
                <span className="inline-flex items-center gap-1 text-[var(--color-alert-soft-fg)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden="true" />
                  注意 {kriByState.caution}
                </span>
                <span className="inline-flex items-center gap-1 text-[var(--color-error-soft-fg)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500" aria-hidden="true" />
                  警告 {kriByState.warning}
                </span>
              </div>
            </div>
            <ul className="grid grid-cols-1 gap-2 lg:grid-cols-3">
              {mockKriCatalogue.map((k) => {
                const stateInfo = KRI_STATE[k.state]
                return (
                  <li
                    key={k.id}
                    className="rounded-md border border-slate-200 bg-white p-3 text-[12px]"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex min-w-0 flex-1 items-center gap-1.5">
                        <span className="font-mono text-[10px] font-medium uppercase tracking-wide text-slate-500 tabular">
                          {k.id}
                        </span>
                        <span className="truncate font-medium text-slate-800">
                          {k.name}
                        </span>
                      </div>
                      <span
                        className={cn(
                          'inline-flex shrink-0 items-center gap-1 rounded border px-1.5 py-0.5 font-mono text-[10px] font-medium tabular',
                          stateInfo.classes
                        )}
                      >
                        <span
                          className={cn('h-1.5 w-1.5 rounded-full', stateInfo.dot)}
                          aria-hidden="true"
                        />
                        {stateInfo.label}
                      </span>
                    </div>
                    <p className="mt-1.5 leading-relaxed text-slate-600">
                      {k.triggerCondition}{' '}
                      <span className="font-mono text-[10px] text-slate-500 tabular">
                        [仮説 / 要検証]
                      </span>
                    </p>
                    <p className="mt-1 font-mono text-[10px] leading-relaxed text-slate-500 tabular">
                      対応: {k.responseAction}
                    </p>
                  </li>
                )
              })}
            </ul>
          </section>

          {/* 5. 業務別 推移 (UC-BO-01 + UC-BO-02 sparkline) */}
          {filteredTrends.length > 0 && (
            <section
              aria-labelledby="metrics-trends"
              className="rounded-lg border border-slate-200 bg-white p-5"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h2
                    id="metrics-trends"
                    className="text-sm font-semibold text-slate-900"
                  >
                    業務別 推移 (直近 7 日)
                  </h2>
                  <p className="mt-1 text-[11px] text-slate-500">
                    件数推移 + Alert 発生率、
                    {workflowFilter === 'all'
                      ? '全業務 を並べて表示'
                      : `${WORKFLOW_LABEL[workflowFilter]} のみ表示`}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {(['all', 'UC-BO-01', 'UC-BO-02'] as const).map((wid) => {
                    const isActive = wid === workflowFilter
                    const label = wid === 'all' ? '全業務' : WORKFLOW_LABEL[wid]
                    return (
                      <button
                        key={wid}
                        type="button"
                        onClick={() => setWorkflowFilter(wid)}
                        className={cn(
                          'rounded-md px-2 py-0.5 font-mono text-[11px] tabular transition-colors',
                          isActive
                            ? 'bg-[var(--color-primary-soft)] text-[var(--color-primary)]'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        )}
                        aria-pressed={isActive}
                      >
                        {label}
                      </button>
                    )
                  })}
                  <span className="font-mono text-[10px] text-slate-500 tabular">
                    {filteredTrends.length} 業務
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {filteredTrends.map((t) => (
                  <div
                    key={t.workflowId}
                    className="rounded-md border border-slate-100 bg-slate-50/40 p-4"
                  >
                    <div className="mb-3 flex items-center gap-2">
                      <span className="font-mono text-[10px] font-medium uppercase tracking-wide text-slate-500 tabular">
                        {t.workflowId}
                      </span>
                      <span className="text-sm font-semibold text-slate-900">
                        {WORKFLOW_LABEL[t.workflowId]}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="mb-1 font-mono text-[10px] text-slate-500 tabular">
                          案件数 (推移)
                        </p>
                        <Sparkline
                          data={t.caseVolume7Day}
                          width={160}
                          height={30}
                          color="var(--color-primary)"
                        />
                      </div>
                      <div>
                        <p className="mb-1 font-mono text-[10px] text-slate-500 tabular">
                          Alert 発生率 (推移)
                        </p>
                        <Sparkline
                          data={t.alertRatio7Day}
                          width={160}
                          height={30}
                          color="var(--color-alert)"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* === Sticky footer (Day 14 P1.5 C4: PageFooter primitive 経由) === */}
      <PageFooter
        left={
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          >
            ダッシュボードに戻る
          </Link>
        }
        caption={<>検証用 KPI 表示の拡張は次の実装段階で対応</>}
      />
    </div>
  )
}
