import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronRight, Send, TrendingUp, Gauge, Wrench } from 'lucide-react'
import { cn } from '@/lib/cn'
import { getAgentById } from '@/data/mock-agents'
import { mockKpiHypotheses } from '@/data/mock-metrics'
import { TrustLevelBadge } from '@/components/shared/TrustLevelBadge'
import { PageFooter } from '@/components/shared/PageFooter'
import type { ApprovalType } from '@/data/types'

/**
 * AgentSettings — 9 画面の 1 つ (`/agents/:id`)、Day 12 Page 5 wireframe
 *
 * SSOT:
 *  - docs/03-ui-prototype-design.md §4.6 (SCR-06 AgentSettings、route = `/agents/:id`)
 *  - docs/02-approval-model.md §4 (Type A/B/C 設定承認) + §7 (Matrix B 主表現)
 *  - workflows/_index.md §2 (Trust Level Progression: Supervised → Checkpoint → Autonomous)
 *  - prototype/CLAUDE.md (Operational Premium Light tokens + JP-only + enabled no-op 0)
 *
 * Layout (CaseReview / Inbox / ProposalReview / Dashboard / SendBackComment と register 共通):
 *  - Sticky PageHeader: breadcrumb (ダッシュボード › Agent 設定 › agent_id) + h1 + workflow chip + TrustLevelBadge compact + agent_version
 *  - Main scrollable (full-width + p-4、Day 14 P1.5 C5 で max-w-5xl から full-width に統一):
 *    1. Hero: Trust Level Progression (Wow factor 中核、Slide 7 Matrix B 視覚化、3-stage stepper + 4 KPI 進化要件 + 引き上げ申請 disabled)
 *    2. Agent 構成 5 領域 (Model / Prompt / Tool / 権限 / Trust Level、read-only viewing state)
 *    3. 変更 simulation panel (Type A/B/C mock judgment、3 シナリオ click で承認者 / co-A 要件表示)
 *    4. 設定承認 history (直近 3 件 mock、AuditTrail link)
 *  - Sticky footer: ダッシュボード戻り link + 変更を申請 disabled button (wrapper span title pattern)
 *
 * 規範:
 *  - Trust Level Progression は Wow factor 中核、Matrix B「AIに任せる量は段階的に増やすが、人によるコントロールは渡さない」を画面で見える化
 *  - 5 領域 read-only (Day 14-15+ で編集 form / submit-approval / approval-pending state)、Day 12 wireframe は viewing + simulation panel mock のみ
 *  - enabled no-op 0: 引き上げ申請 / 変更を申請 / 設定編集 link は wrapper span title pattern + disabled state
 *  - 国際送金 (restricted boundary pack) は Trust Level Progression 対象外 (`trust_level: 'n/a'`)、本 page mock data に含めない
 *  - JSDoc / JSX comment 内の internal SSOT 参照は keep (R34/R35/R37/R38 と同 scope)
 */

interface KpiProgressionEntry {
  id: string
  label: string
  target: string
}

// CR R40 M5 closure (Day 12 Page 6 で実施): `mock-metrics.ts` の mockKpiHypotheses (4 KPI gate) を import で再利用、SSOT 単一化、KPI label/target drift 防止
const KPI_PROGRESSION: ReadonlyArray<KpiProgressionEntry> = mockKpiHypotheses.map((k) => ({
  id: k.id,
  label: k.name,
  target: k.target,
}))

interface SimulationScenario {
  id: string
  type: ApprovalType
  title: string
  description: string
  approvers: string
  rule: string
}

const SIMULATION_SCENARIOS: ReadonlyArray<SimulationScenario> = [
  {
    id: 'sim-a',
    type: 'A',
    title: 'Prompt v0.1 → v0.2 (minor update)',
    description: '既存 prompt の信頼度閾値調整、新規 tool 追加なし、Trust Level 不変',
    approvers: 'AI 管理者 (起票 ≠ 承認 SoD 強制)、別 AI 管理者または fallback で業務責任者 co-A',
    rule: '判定ルール例: model / prompt 変更 + Trust Level 不変 → Type A',
  },
  {
    id: 'sim-b',
    type: 'B',
    title: '外部 AI サービス 追加 (個人情報アクセス範囲の拡張)',
    description:
      '外部 AI サービスの追加や新規 個人情報アクセス範囲の拡張、認証方式変更等、情報管理に影響する変更',
    approvers: 'AI 管理者 + 情報管理責任者 + リスク確認担当 の co-A 必須',
    rule: '判定ルール例: 外部 AI サービス追加 + 権限拡張 → Type B',
  },
  {
    id: 'sim-c',
    type: 'C',
    title: 'Trust Level Supervised → Checkpoint 引き上げ',
    description:
      'Automation Maturity 段階変更、案件確認の介在頻度を全件 → 重要分岐のみに縮小、4 KPI 進化要件の達成が前提',
    approvers: 'AI 管理者 + 業務責任者 (業務リスク受容) の co-A 必須',
    rule: '判定ルール例: Trust Level 変更 → Type C',
  },
] as const

export function AgentSettings() {
  const { id } = useParams()
  const a = getAgentById(id || '')

  const [simulationId, setSimulationId] = useState<string | null>(null)

  if (!a) {
    return (
      <div className="p-8">
        <p className="text-sm text-slate-500">Agent {id} が見つかりません。</p>
        <Link
          to="/dashboard"
          className="mt-3 inline-block text-sm font-medium text-[var(--color-primary)] hover:underline"
        >
          ダッシュボードに戻る
        </Link>
      </div>
    )
  }

  const selectedScenario = SIMULATION_SCENARIOS.find((s) => s.id === simulationId)

  return (
    <div className="flex h-full flex-col bg-[var(--color-canvas)]">
      {/* === PageHeader === */}
      <header
        data-page-header
        className="sticky top-0 z-30 min-h-[var(--height-pageheader)] border-b border-slate-200 bg-white px-6 py-3"
      >
        {/* Breadcrumb (3-level) */}
        <nav aria-label="breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500">
          <Link to="/dashboard" className="hover:text-slate-700">
            ダッシュボード
          </Link>
          <ChevronRight className="h-3 w-3" aria-hidden="true" />
          <span className="text-slate-700">Agent 設定</span>
          <ChevronRight className="h-3 w-3" aria-hidden="true" />
          <span className="text-slate-700">{a.name}</span>
        </nav>

        {/* Title row + meta */}
        <div className="mt-1.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-slate-900">{a.name}</h1>
            <span className="inline-flex items-center rounded bg-slate-100 px-2 py-0.5 font-mono text-xs font-medium text-slate-700 tabular">
              {a.workflowId}
            </span>
            <TrustLevelBadge current={a.trustLevel} variant="compact" />
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px] text-slate-500 tabular">
              Agent 版数 {a.version}
            </span>
          </div>
        </div>
      </header>

      {/* === Main body === */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-4 p-4">
          {/* 1. Hero: Trust Level Progression (Wow 中核、Slide 7 Matrix B 視覚化) */}
          <section
            aria-labelledby="agent-trust-progression"
            className="rounded-lg border-2 border-[var(--color-primary)]/30 bg-white p-6"
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h2
                  id="agent-trust-progression"
                  className="text-base font-semibold text-slate-900"
                >
                  Trust Level の進化段階
                </h2>
                <p className="mt-1 text-[12px] leading-relaxed text-slate-700">
                  <span className="font-medium text-slate-900">
                    AIに任せる量は段階的に増やすが、人によるコントロールは渡さない。
                  </span>{' '}
                  案件確認は減らす。手順承認 / 設定承認は同強度で残る。
                </p>
              </div>
              <span className="shrink-0 font-mono text-[10px] text-slate-500 tabular">
                統制原則
              </span>
            </div>

            {/* 3-stage stepper */}
            <TrustLevelBadge current={a.trustLevel} variant="progression" />

            {/* 4 KPI 進化要件 */}
            <div className="mt-5 rounded-md border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex items-center gap-2">
                <Gauge className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
                <h3 className="text-xs font-semibold text-slate-800">
                  4 KPI 進化要件
                </h3>
              </div>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5 sm:grid-cols-4">
                {KPI_PROGRESSION.map((kpi) => (
                  <div key={kpi.id} className="flex flex-col">
                    <dt className="text-[11px] text-slate-600">{kpi.label}</dt>
                    <dd className="mt-0.5 flex items-baseline gap-1">
                      <span className="font-mono text-sm font-semibold text-slate-900 tabular">
                        {kpi.target}
                      </span>
                      <span className="font-mono text-[10px] text-slate-500 tabular">
                        [仮説 / 要検証]
                      </span>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* 引き上げ申請 disabled button */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-[11px] leading-relaxed text-slate-600">
                Trust Level 引き上げは{' '}
                <span className="font-medium text-slate-800">Type C 設定承認</span> (AI 管理者 + 業務責任者 co-A 必須) で判定されます。
              </p>
              <span
                className="inline-flex"
                title="Trust Level 引き上げ申請 (動作は次の実装段階で対応)"
              >
                <button
                  type="button"
                  disabled
                  aria-disabled="true"
                  className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-md bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-400 opacity-70"
                >
                  <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
                  Checkpoint へ引き上げ申請
                </button>
              </span>
            </div>
          </section>

          {/* 2. Agent 構成 5 領域 (read-only viewing state) */}
          <section
            aria-labelledby="agent-config"
            className="rounded-lg border border-slate-200 bg-white p-5"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 id="agent-config" className="text-sm font-semibold text-slate-900">
                  Agent 構成
                </h2>
                <p className="mt-1 text-[11px] text-slate-500">
                  5 領域の現状設定 (閲覧のみ)、編集は次の実装段階で対応
                </p>
              </div>
              <span className="font-mono text-[10px] text-slate-500 tabular">5 領域</span>
            </div>
            <dl className="space-y-3 text-[12px]">
              {/* Model */}
              <div className="grid grid-cols-1 gap-1.5 border-b border-slate-100 pb-3 sm:grid-cols-[140px_1fr] sm:gap-3">
                <dt className="font-medium text-slate-700">Model</dt>
                <dd>
                  <span className="font-mono tabular text-slate-900">{a.modelLabel}</span>
                  <span className="ml-2 inline-flex items-center rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-600 tabular">
                    {a.version}
                  </span>
                </dd>
              </div>
              {/* Prompt */}
              <div className="grid grid-cols-1 gap-1.5 border-b border-slate-100 pb-3 sm:grid-cols-[140px_1fr] sm:gap-3">
                <dt className="font-medium text-slate-700">Prompt</dt>
                <dd>
                  <span className="font-mono tabular text-slate-900">{a.promptVersion}</span>
                  <p className="mt-1 leading-relaxed text-slate-700">{a.promptSummary}</p>
                </dd>
              </div>
              {/* Tool */}
              <div className="grid grid-cols-1 gap-1.5 border-b border-slate-100 pb-3 sm:grid-cols-[140px_1fr] sm:gap-3">
                <dt className="font-medium text-slate-700">
                  Tool{' '}
                  <span className="font-mono text-[10px] text-slate-500 tabular">
                    ({a.tools.length})
                  </span>
                </dt>
                <dd>
                  <ul className="space-y-1.5">
                    {a.tools.map((t) => (
                      <li key={t.id} className="flex items-start gap-2">
                        <Wrench
                          className="mt-0.5 h-3 w-3 shrink-0 text-slate-400"
                          aria-hidden="true"
                        />
                        <div className="min-w-0 flex-1">
                          <span className="font-medium text-slate-800">{t.name}</span>
                          <p className="text-[11px] leading-relaxed text-slate-500">
                            {t.description}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
              {/* 権限 */}
              <div className="grid grid-cols-1 gap-1.5 border-b border-slate-100 pb-3 sm:grid-cols-[140px_1fr] sm:gap-3">
                <dt className="font-medium text-slate-700">権限 / 範囲</dt>
                <dd>
                  <p className="text-slate-700">{a.permissions.dataScope}</p>
                  <p className="mt-1 text-[11px] text-slate-500">{a.permissions.boundary}</p>
                </dd>
              </div>
              {/* Trust Level (summary、詳細は上部 Hero) */}
              <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-[140px_1fr] sm:gap-3">
                <dt className="font-medium text-slate-700">Trust Level</dt>
                <dd>
                  <TrustLevelBadge current={a.trustLevel} variant="compact" />
                  <p className="mt-1 text-[11px] text-slate-500">
                    詳細は上部 Trust Level Progression セクション参照
                  </p>
                </dd>
              </div>
            </dl>
          </section>

          {/* 3. 変更 simulation panel (Type A/B/C judgment mock) */}
          <section
            aria-labelledby="agent-simulation"
            className="rounded-lg border border-slate-200 bg-white p-5"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 id="agent-simulation" className="text-sm font-semibold text-slate-900">
                  変更影響の事前確認
                </h2>
                <p className="mt-1 text-[11px] text-slate-500">
                  変更内容を選ぶと、設定承認 Type 区分と co-A 要件の判定例を確認できます
                </p>
              </div>
            </div>
            <div className="space-y-2">
              {SIMULATION_SCENARIOS.map((scen) => {
                const isSelected = scen.id === simulationId
                return (
                  <button
                    key={scen.id}
                    type="button"
                    onClick={() => setSimulationId(isSelected ? null : scen.id)}
                    className={cn(
                      'flex w-full items-start gap-3 rounded-md border px-3 py-2.5 text-left text-[12px] transition-colors',
                      isSelected
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary-soft)]'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    )}
                  >
                    <span
                      className={cn(
                        'inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md font-mono text-xs font-semibold tabular',
                        scen.type === 'A' && 'bg-slate-100 text-slate-700',
                        scen.type === 'B' && 'bg-amber-50 text-[var(--color-alert-soft-fg)]',
                        scen.type === 'C' && 'bg-[var(--color-primary-soft)] text-[var(--color-primary)]'
                      )}
                    >
                      {scen.type}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-slate-800">{scen.title}</div>
                      <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">
                        {scen.description}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
            {selectedScenario && (
              <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 p-3">
                <p className="text-[11px] font-semibold text-slate-700">
                  Type {selectedScenario.type} 判定 — 承認者 / co-A 要件
                </p>
                <p className="mt-1 text-[12px] leading-relaxed text-slate-700">
                  {selectedScenario.approvers}
                </p>
                <p className="mt-2 font-mono text-[10px] text-slate-500 tabular">
                  {selectedScenario.rule}
                </p>
              </div>
            )}
          </section>

          {/* 4. 設定承認 history (直近 N 件) */}
          <section
            aria-labelledby="agent-history"
            className="rounded-lg border border-slate-200 bg-white p-5"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 id="agent-history" className="text-sm font-semibold text-slate-900">
                  設定承認 履歴
                </h2>
                <p className="mt-1 text-[11px] text-slate-500">
                  直近 {a.changeHistory.length} 件の設定変更 (詳細表示は次の実装段階で対応)
                </p>
              </div>
              <span className="font-mono text-[10px] text-slate-500 tabular">
                直近 {a.changeHistory.length} 件
              </span>
            </div>
            <ol className="space-y-2.5">
              {a.changeHistory.map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-start gap-3 border-b border-slate-100 pb-2.5 last:border-0 last:pb-0"
                >
                  <span
                    className={cn(
                      'inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md font-mono text-[11px] font-semibold tabular',
                      entry.type === 'A' && 'bg-slate-100 text-slate-700',
                      entry.type === 'B' && 'bg-amber-50 text-[var(--color-alert-soft-fg)]',
                      entry.type === 'C' && 'bg-[var(--color-primary-soft)] text-[var(--color-primary)]'
                    )}
                  >
                    {entry.type}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-medium text-slate-800">{entry.summary}</p>
                    <p className="mt-0.5 font-mono text-[10px] text-slate-500 tabular">
                      {entry.date} · 承認: {entry.approver}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>

      {/* === Sticky footer (Day 14 P2 D1: PageFooter primitive swap) === */}
      <PageFooter
        left={
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          >
            ダッシュボードに戻る
          </Link>
        }
        right={
          <span className="inline-flex" title="設定変更を Type A/B/C 区分で申請 (動作は次の実装段階で対応)">
            <button
              type="button"
              disabled
              aria-disabled="true"
              className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-md bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-400 opacity-70"
            >
              <Send className="h-3.5 w-3.5" aria-hidden="true" />
              変更を申請
            </button>
          </span>
        }
        caption="設定変更・申請は次の実装段階で対応"
      />
    </div>
  )
}
