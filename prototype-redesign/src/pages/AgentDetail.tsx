import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ChevronRightIcon, BotIcon, CheckIcon, AlertTriangleIcon, ArrowRightIcon } from 'lucide-react'
import { AGENT_DETAILS } from '@/data/mock-agent-detail'
import { useAgent, useStoreDispatch } from '@/store/hooks'
import { MetricVsThreshold } from '@/components/cross-cutting/MetricVsThreshold'
import { ConsequencePanel } from '@/components/cross-cutting/ConsequencePanel'
import { MetaChip } from '@/components/shared/MetaChip'
import { Modal } from '@/components/shared/Modal'
import { cn } from '@/lib/cn'

/**
 * AgentDetail (/agents/:id) — Process-First v2 / C 型 detail contract
 * SSOT: screens-v2/08-agent-detail/canonical-export.md + screen-contracts-v2 + canonical-design-spec §6
 * A 4 KPI 全件 (集約値を捨てる) / B 裏付け sample + 設定 / C 申請 1 ボタン (単一決定面)。
 * Trust は業務語 (全件確認 / 要所確認) を主表示、Tier 名 (Supervised) は補助 chip。
 */
/** 未知 id の not-found (業務語、token-clean inline)。 */
function AgentNotFound() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
      <p className="text-sm text-[var(--color-fg-muted)]">指定のエージェントが見つかりません。</p>
      <Link to="/agents" className="text-sm font-medium text-[var(--color-primary)] hover:underline">
        エージェント一覧へ戻る
      </Link>
    </div>
  )
}

export function AgentDetail() {
  const { id } = useParams()
  const a = id ? AGENT_DETAILS[id] : undefined
  const agentEntity = useAgent(id)
  const dispatch = useStoreDispatch()
  const [applyOpen, setApplyOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  // :id 変更時の local state reset (set-state-in-effect 回避、render 中 adjusting)
  const [prevId, setPrevId] = useState(id)
  if (id !== prevId) {
    setPrevId(id)
    setApplyOpen(false)
    setToast(null)
  }

  if (!a) return <AgentNotFound />

  const showToast = (m: string) => {
    setToast(m)
    window.setTimeout(() => setToast(null), 2600)
  }

  const hasUnmet = a.metrics.some((m) => !m.achieved)
  const requested = agentEntity?.promotionRequested ?? false

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <header
        data-page-header
        className="sticky top-0 z-30 flex min-h-[var(--height-pageheader)] flex-col justify-center gap-2 border-b border-[var(--color-border)] bg-[var(--color-panel)] px-6 py-3"
      >
        <div className="flex items-center gap-1.5 text-xs text-[var(--color-fg-muted)]">
          <span>{a.workflow}</span>
          <ChevronRightIcon className="h-3 w-3 text-[var(--color-fg-subtle)]" />
          <Link to="/agents" className="hover:text-[var(--color-fg)]">Agent 設定</Link>
          <ChevronRightIcon className="h-3 w-3 text-[var(--color-fg-subtle)]" />
          <span className="text-[var(--color-fg)]">{a.name}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[var(--radius-control)] bg-[var(--color-panel-inset)]">
            <BotIcon className="h-5 w-5 text-[var(--color-fg-muted)]" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="flex flex-wrap items-center gap-2 text-lg font-semibold text-[var(--color-fg)]">
              {a.name}
              <span className="inline-flex items-center gap-1.5">
                <MetaChip tone="primary" label={`現在 ${a.trustLabel}`} />
                <MetaChip tone="inset" label={a.trustEn} />
              </span>
            </h1>
            <p className="mt-0.5 text-xs text-[var(--color-fg-muted)]">自動化レベルの昇格を判断します</p>
          </div>
        </div>
      </header>

      {/* Body 2-pane */}
      <div className="flex-1 overflow-auto p-4">
        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[7fr_5fr]">
          {/* 主列: 4 KPI + 帰結 */}
          <div className="flex flex-col gap-3">
            <MetricVsThreshold
              title="実績 vs 閾値 (4 指標すべて)"
              subtitle="昇格の判断材料。1 指標でも未達なら、基準到達まで昇格は保留します。"
              rows={a.metrics}
            />
            <ConsequencePanel
              kind="agent"
              title="昇格の帰結 (全件確認 → 要所確認)"
              before={a.consequence.before}
              after={a.consequence.after}
              scope={a.consequence.scope}
              impacts={a.consequence.impacts}
            />
          </div>

          {/* 補助列: 裏付け (原則 B) + 設定 */}
          <div className="flex flex-col gap-3">
            <section className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-panel)]">
              <div className="border-b border-[var(--color-border)] px-4 py-2.5">
                <h3 className="text-sm font-semibold text-[var(--color-fg)]">実績の裏付け</h3>
                <p className="mt-0.5 text-[11px] text-[var(--color-fg-muted)]">上の数字は、これらの実行履歴の集計です。案件を選んで詳細へ。</p>
              </div>
              <div className="flex flex-col">
                {a.samples.map((s, i) => (
                  <Link
                    key={s.id}
                    to={`/cases/${s.id}`}
                    className={cn('flex items-start gap-2.5 px-4 py-2.5 hover:bg-[var(--color-panel-inset)]', i > 0 && 'border-t border-[var(--color-border)]')}
                  >
                    <MetaChip tone={s.tone} label={s.outcome} />
                    <div className="min-w-0 flex-1">
                      <div className="font-mono text-xs font-medium text-[var(--color-fg)]">{s.id}</div>
                      <div className="mt-0.5 text-[11px] text-[var(--color-fg-muted)]">{s.note}</div>
                    </div>
                    <ArrowRightIcon className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[var(--color-fg-subtle)]" aria-hidden="true" />
                  </Link>
                ))}
              </div>
            </section>

            <section className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-panel)]">
              <div className="border-b border-[var(--color-border)] px-4 py-2.5">
                <h3 className="text-sm font-semibold text-[var(--color-fg)]">設定</h3>
              </div>
              <div className="flex flex-col">
                {a.config.map((c, i) => (
                  <div
                    key={c.k}
                    className={cn('grid grid-cols-[72px_1fr] gap-3 px-4 py-2.5', i > 0 && 'border-t border-[var(--color-border)]')}
                  >
                    <span className="text-xs text-[var(--color-fg-muted)]">{c.k}</span>
                    <div>
                      <div className="text-sm text-[var(--color-fg)]">{c.v}</div>
                      <div className="mt-0.5 text-[11px] text-[var(--color-fg-muted)]">{c.meta}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Footer: 申請 1 ボタン (原則 C)、未達時は disabled + 理由明示 */}
      <footer className="sticky bottom-0 z-30 flex items-center justify-between border-t border-[var(--color-border)] bg-[var(--color-panel)] px-6 py-3">
        <div className="flex items-center gap-1.5 text-xs">
          {requested ? (
            <>
              <CheckIcon className="h-3.5 w-3.5 flex-shrink-0 text-[var(--color-primary)]" />
              <span className="font-medium text-[var(--color-primary)]">昇格を申請済み — 設定承認の待ちに入りました</span>
            </>
          ) : hasUnmet ? (
            <>
              <AlertTriangleIcon className="h-3.5 w-3.5 flex-shrink-0 text-[var(--color-alert-soft-fg)]" />
              <span className="font-medium text-[var(--color-alert-soft-fg)]">承認率が基準 (95%) に未達のため、現時点では昇格を申請できません</span>
            </>
          ) : (
            <>
              <CheckIcon className="h-3.5 w-3.5 flex-shrink-0 text-[var(--color-success-soft-fg)]" />
              <span className="font-medium text-[var(--color-success-soft-fg)]">全指標が基準達成 — 昇格を申請できます</span>
            </>
          )}
        </div>
        <button
          type="button"
          disabled={hasUnmet || requested}
          title={hasUnmet ? '承認率が基準に未達です' : requested ? '申請済みです' : undefined}
          onClick={() => setApplyOpen(true)}
          className={cn(
            'flex items-center gap-1.5 rounded-[var(--radius-control)] px-3 py-1.5 text-sm font-medium',
            hasUnmet || requested
              ? 'cursor-not-allowed bg-[var(--color-panel-inset)] text-[var(--color-fg-subtle)]'
              : 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]'
          )}
        >
          <BotIcon className="h-4 w-4" />
          {requested ? '申請済み' : '設定変更を申請'}
        </button>
      </footer>

      {/* 申請 confirm dialog (共通 Modal、Phase 2) */}
      <Modal
        open={applyOpen}
        onClose={() => setApplyOpen(false)}
        title="設定変更を申請"
        size="sm"
        footer={
          <>
            <button
              type="button"
              onClick={() => setApplyOpen(false)}
              className="rounded-[var(--radius-control)] border border-[var(--color-border-strong)] bg-[var(--color-panel)] px-3 py-1.5 text-sm text-[var(--color-fg)] hover:bg-[var(--color-panel-inset)]"
            >
              キャンセル
            </button>
            <button
              type="button"
              onClick={() => {
                setApplyOpen(false)
                if (id) dispatch({ type: 'agent/requestPromotion', id })
                showToast('昇格を申請しました')
              }}
              className="flex items-center gap-1.5 rounded-[var(--radius-control)] bg-[var(--color-primary)] px-3 py-1.5 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)]"
            >
              <CheckIcon className="h-4 w-4" />
              申請する
            </button>
          </>
        }
      >
        <div className="text-sm leading-relaxed text-[var(--color-fg)]">
          全件確認 → 要所確認 への昇格を申請します。承認後、人レビューが減り自動入力が増えます (帰結を参照)。
        </div>
      </Modal>

      {toast && (
        <div
          role="status"
          className="fixed bottom-20 left-1/2 z-[80] -translate-x-1/2 rounded-[var(--radius-card)] border border-[var(--color-success)] bg-[var(--color-success-soft)] px-4 py-2 text-sm font-medium text-[var(--color-success-soft-fg)] shadow-lg"
        >
          {toast}
        </div>
      )}
    </div>
  )
}
