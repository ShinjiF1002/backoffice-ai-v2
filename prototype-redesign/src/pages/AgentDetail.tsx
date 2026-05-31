import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ChevronRightIcon, BotIcon, CheckIcon, AlertTriangleIcon, ArrowRightIcon, PauseIcon, PlayIcon, SparklesIcon, ShieldCheckIcon } from 'lucide-react'
import { AGENT_DETAILS } from '@/data/mock-agent-detail'
import { PROPOSAL_DETAILS } from '@/data/mock-proposal-detail'
import { useAgent, useStoreDispatch, useAgentAdoptedProposals, useCurrentActor } from '@/store/hooks'
import { useDetailDemo } from '@/hooks/useDetailDemo'
import { MetricVsThreshold } from '@/components/cross-cutting/MetricVsThreshold'
import { ConsequencePanel } from '@/components/cross-cutting/ConsequencePanel'
import { MetaChip } from '@/components/shared/MetaChip'
import { Modal } from '@/components/shared/Modal'
import { ReasonDialog } from '@/components/shared/ReasonDialog'
import { DetailDemoFallback } from '@/components/shared/DetailDemoFallback'
import { Toast } from '@/components/shared/Toast'
import { useToast } from '@/hooks/useToast'
import { trustLevelLabel } from '@/lib/status-tones'
import type { TrustLevel } from '@/data/types'
import { EmptyState } from '@/components/shared/EmptyState'
import { cn } from '@/lib/cn'

/**
 * AgentDetail (/agents/:id) — Process-First v2 / C 型 detail contract
 * SSOT: screens-v2/08-agent-detail/canonical-export.md + screen-contracts-v2 + canonical-design-spec §6
 * A 4 KPI 全件 (集約値を捨てる) / B 裏付け sample + 設定 / C 申請 1 ボタン (単一決定面)。
 * Trust は業務語 (全件確認 / 要所確認) を主表示、Tier 名 (Supervised) は補助 chip。
 */
export function AgentDetail() {
  const { id } = useParams()
  const a = id ? AGENT_DETAILS[id] : undefined
  const agentEntity = useAgent(id)
  const adopted = useAgentAdoptedProposals(id)
  const dispatch = useStoreDispatch()
  const actor = useCurrentActor()
  const [applyOpen, setApplyOpen] = useState(false)
  const [emergencyOpen, setEmergencyOpen] = useState(false)
  const [emergencyReason, setEmergencyReason] = useState('')
  const [emergencyError, setEmergencyError] = useState(false)
  // F-014: 再開は autonomy 再付与ゆえ確認 + 理由必須 (1-click 廃止)。
  const [resumeOpen, setResumeOpen] = useState(false)
  // P1-3 承認者 mode: 設定承認の差戻し理由入力 dialog (理由 state は ReasonDialog 内で管理)。
  const [configSendbackOpen, setConfigSendbackOpen] = useState(false)
  const { toast, show: showToast, dismiss: dismissToast } = useToast()
  // :id 変更時の local state reset (set-state-in-effect 回避、render 中 adjusting)
  const [prevId, setPrevId] = useState(id)
  if (id !== prevId) {
    setPrevId(id)
    setApplyOpen(false)
    setEmergencyOpen(false)
    setEmergencyReason('')
    setEmergencyError(false)
    setResumeOpen(false)
    setConfigSendbackOpen(false)
    dismissToast()
  }
  // F-009: detail route の取得状態 (?demo=loading/error) を list route と一貫させる demo seam。
  const demo = useDetailDemo()

  if (demo.status) return <DetailDemoFallback status={demo.status} onRetry={demo.onRetry} />

  if (!a)
    return (
      <div className="flex h-full items-center justify-center p-8">
        <EmptyState
          subState="truly-empty"
          title="指定のエージェントが見つかりません。"
          action={
            <Link to="/agents" className="text-sm font-medium text-[var(--color-primary-strong)] hover:underline">
              エージェント一覧へ戻る
            </Link>
          }
        />
      </div>
    )

  // F-035: flywheel lineage — この Agent の設定改定の出所 (relatedProposals)。model/test に在りながら未描画だったため UI に出す。
  const adoptedSet = new Set(adopted)
  const lineage = a.relatedProposals.map((pid) => ({
    id: pid,
    title: PROPOSAL_DETAILS[pid]?.changeTitle ?? pid,
    adopted: adoptedSet.has(pid),
  }))
  const hasUnmet = a.metrics.some((m) => !m.achieved)
  const requested = agentEntity?.promotionStatus === 'requested'
  // 緊急停止 (kill-switch) 状態 (flywheel 観測化)。paused は header「緊急コントロール」で可視化 + 再開可能。
  const paused = agentEntity?.paused ?? false
  const pausedReason = agentEntity?.pausedReason
  // F-014: trust 表示は store 真値由来 (kill-switch の実降格を反映)。停止中は trustBeforePause が再開後の原状。
  const TRUST_EN: Record<TrustLevel, string> = { supervised: 'Supervised', checkpoint: 'Checkpoint', autonomous: 'Autonomous', 'n/a': 'N/A' }
  const liveTrust: TrustLevel | undefined = agentEntity?.trust
  const trustLabelMain = liveTrust ? trustLevelLabel(liveTrust) : a.trustLabel
  const trustLabelEn = liveTrust ? TRUST_EN[liveTrust] : a.trustEn
  const restoreTrust = agentEntity?.trustBeforePause ?? liveTrust
  // P1-3 承認者 mode (ProposalDetail と同型): 業務責任者 persona は owner = 設定承認/差戻し、それ以外は manual = 申請。
  const mode: 'manual' | 'owner' = actor?.role === 'business-approver' ? 'owner' : 'manual'
  const promotionSendbackReason = agentEntity?.promotionSendbackReason
  // SoD (案件 B4 と同一思想): 申請した actor 自身は設定承認できない (reducer も hard-block、UI でも disabled + 理由)。
  const promotionRequestedBy = agentEntity?.promotionRequestedBy
  const isSelfPromotionApproval = promotionRequestedBy !== undefined && promotionRequestedBy === actor?.id
  const showOwnerPromotionControls = mode === 'owner' && requested
  // 設定承認済 = terminal。manual (申請) footer は approved を再申請可に見せない (reducer も no-op、false-success 防止)。
  const approved = agentEntity?.promotionStatus === 'approved'

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
                <MetaChip tone="primary" label={`現在 ${trustLabelMain}`} />
                <MetaChip tone="inset" label={trustLabelEn} />
                {paused && <MetaChip tone="alert" label="緊急停止中" />}
                {mode === 'owner' && <MetaChip tone="inset" label="業務責任者ビュー" />}
              </span>
            </h1>
            <p className="mt-0.5 text-xs text-[var(--color-fg-muted)]">
              自動化レベルの昇格を判断します{adopted.length > 0 ? ` · この Agent に反映された改善 ${adopted.length} 件` : ''}
            </p>
          </div>
          {/* 緊急コントロール (kill-switch、header 配置 / footer 第2 cluster にしない)。緊急停止→全件確認に降格、再開で復帰。 */}
          <div className="flex flex-shrink-0 flex-col items-end gap-1">
            {paused ? (
              <button
                type="button"
                onClick={() => setResumeOpen(true)}
                className="flex items-center gap-1.5 rounded-[var(--radius-control)] border border-[var(--color-border-strong)] bg-[var(--color-panel)] px-3 py-1.5 text-sm font-medium text-[var(--color-fg)] hover:bg-[var(--color-panel-inset)]"
              >
                <PlayIcon className="h-4 w-4" />
                再開
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setEmergencyReason('')
                  setEmergencyError(false)
                  setEmergencyOpen(true)
                }}
                className="flex items-center gap-1.5 rounded-[var(--radius-control)] border border-[var(--color-error)] bg-[var(--color-error-soft)] px-3 py-1.5 text-sm font-medium text-[var(--color-error-soft-fg)] hover:opacity-90"
              >
                <PauseIcon className="h-4 w-4" />
                緊急停止
              </button>
            )}
            {paused && pausedReason && (
              <span className="max-w-[12rem] truncate text-[10px] text-[var(--color-fg-muted)]" title={pausedReason}>
                停止理由: {pausedReason}
              </span>
            )}
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
            {/* F-039: 昇格は申請者と別系統の独立検証を前提とする旨を明示 + モデル台帳/drift 監視へ誘導 (規制担当の確認 surface)。 */}
            <div className="flex items-start gap-2.5 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-panel-inset)] p-3 text-[11px] leading-relaxed text-[var(--color-fg-tertiary)]">
              <ShieldCheckIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--color-fg-muted)]" aria-hidden="true" />
              <span>
                自動化レベルの昇格は、設定承認（四眼原則）に加え、申請者と別系統の<strong className="text-[var(--color-fg)]">独立検証（challenger / 検証チーム）</strong>の合格を前提とします（実体は本番の別 module）。
                この Agent が用いる embedded model の版・所有者・検証状況・drift 監視は{' '}
                <Link to="/observatory" className="font-medium text-[var(--color-primary-strong)] hover:underline">モニタリングの「モデルガバナンス」</Link>
                で確認できます。
              </span>
            </div>
          </div>

          {/* 補助列: Flywheel lineage (F-035) + 裏付け (原則 B) + 設定 */}
          <div className="flex flex-col gap-3">
            {/* F-035: 製品中核ナラティブ (差戻し→提案→承認→設定反映の flywheel) を Agent 設定の出所として可視化。 */}
            {lineage.length > 0 && (
              <section className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-primary-soft-border)] bg-[var(--color-primary-soft)]">
                <div className="flex items-center gap-1.5 border-b border-[var(--color-primary-soft-border)] px-4 py-2.5">
                  <SparklesIcon className="h-4 w-4 text-[var(--color-primary-strong)]" aria-hidden="true" />
                  <h3 className="text-sm font-semibold text-[var(--color-fg)]">改善の流れ（Flywheel）</h3>
                </div>
                <p className="px-4 pt-2 text-[11px] leading-relaxed text-[var(--color-fg-tertiary)]">
                  現場の差戻しから生まれた手順改定の提案が、この Agent の設定に反映されます。
                </p>
                <div className="flex flex-col p-2">
                  {lineage.map((l) => (
                    <Link
                      key={l.id}
                      to={`/proposals/${l.id}`}
                      className="flex items-center gap-2.5 rounded-[var(--radius-control)] px-2 py-2 hover:bg-[var(--color-panel)]"
                    >
                      <MetaChip tone={l.adopted ? 'success' : 'inset'} label={l.adopted ? '反映済' : '審議中'} />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-xs font-medium text-[var(--color-fg)]">{l.title}</div>
                        <div className="font-mono text-[10px] text-[var(--color-fg-tertiary)]">{l.id}</div>
                      </div>
                      <ArrowRightIcon className="h-3.5 w-3.5 flex-shrink-0 text-[var(--color-fg-subtle)]" aria-hidden="true" />
                    </Link>
                  ))}
                </div>
              </section>
            )}
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

      {/* Footer (原則 C 単一決定面、mode 出し分け): 業務責任者 owner = 設定承認/差戻し、それ以外 = 申請 */}
      {showOwnerPromotionControls ? (
        <footer className="sticky bottom-0 z-30 flex items-center justify-between border-t border-[var(--color-border)] bg-[var(--color-panel)] px-6 py-3">
          <div className="flex items-center gap-1.5 text-xs">
            {isSelfPromotionApproval ? (
              <>
                <AlertTriangleIcon className="h-3.5 w-3.5 flex-shrink-0 text-[var(--color-alert-soft-fg)]" />
                <span className="font-medium text-[var(--color-alert-soft-fg)]">申請者として承認できません — 別の業務責任者に切替えてください（四眼原則）</span>
              </>
            ) : (
              <>
                <BotIcon className="h-3.5 w-3.5 flex-shrink-0 text-[var(--color-primary-strong)]" />
                <span className="font-medium text-[var(--color-primary-strong)]">設定変更 (昇格) の申請を承認 / 差戻しできます</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setConfigSendbackOpen(true)}
              className="rounded-[var(--radius-control)] border border-[var(--color-border-strong)] bg-[var(--color-panel)] px-3 py-1.5 text-sm font-medium text-[var(--color-fg)] hover:bg-[var(--color-panel-inset)]"
            >
              差戻し
            </button>
            <button
              type="button"
              disabled={isSelfPromotionApproval}
              title={isSelfPromotionApproval ? '申請者は承認できません（四眼原則）' : undefined}
              onClick={() => {
                if (id) dispatch({ type: 'agent/approvePromotion', id })
                showToast('設定変更を承認しました — 昇格を反映します')
              }}
              className={cn(
                'flex items-center gap-1.5 rounded-[var(--radius-control)] px-3 py-1.5 text-sm font-medium',
                isSelfPromotionApproval
                  ? 'cursor-not-allowed bg-[var(--color-panel-inset)] text-[var(--color-fg-subtle)]'
                  : 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]'
              )}
            >
              <CheckIcon className="h-4 w-4" />
              設定承認
            </button>
          </div>
        </footer>
      ) : mode === 'owner' ? (
        /* owner だが昇格申請なし: 業務責任者は申請しない (申請 footer を出さない、F3)。read-only status のみ。 */
        <footer className="sticky bottom-0 z-30 flex items-center justify-between border-t border-[var(--color-border)] bg-[var(--color-panel)] px-6 py-3">
          <div className="flex items-center gap-1.5 text-xs">
            <BotIcon className="h-3.5 w-3.5 flex-shrink-0 text-[var(--color-fg-muted)]" aria-hidden="true" />
            <span className="font-medium text-[var(--color-fg-muted)]">
              {agentEntity?.promotionStatus === 'approved' ? '設定変更は承認済みです' : '承認待ちの設定変更はありません'}
            </span>
          </div>
        </footer>
      ) : (
        <footer className="sticky bottom-0 z-30 flex items-center justify-between border-t border-[var(--color-border)] bg-[var(--color-panel)] px-6 py-3">
          <div className="flex items-center gap-1.5 text-xs">
            {paused ? (
              <>
                <AlertTriangleIcon className="h-3.5 w-3.5 flex-shrink-0 text-[var(--color-alert-soft-fg)]" />
                <span className="font-medium text-[var(--color-alert-soft-fg)]">緊急停止中は昇格を申請できません（再開後に申請可能）</span>
              </>
            ) : requested ? (
              <>
                <CheckIcon className="h-3.5 w-3.5 flex-shrink-0 text-[var(--color-primary-strong)]" />
                <span className="font-medium text-[var(--color-primary-strong)]">昇格を申請済み — 設定承認の待ちに入りました</span>
              </>
            ) : approved ? (
              <>
                <CheckIcon className="h-3.5 w-3.5 flex-shrink-0 text-[var(--color-success-soft-fg)]" />
                <span className="font-medium text-[var(--color-success-soft-fg)]">設定変更は承認済みです（再申請は不要）</span>
              </>
            ) : promotionSendbackReason ? (
              <>
                <AlertTriangleIcon className="h-3.5 w-3.5 flex-shrink-0 text-[var(--color-alert-soft-fg)]" />
                <span className="font-medium text-[var(--color-alert-soft-fg)]">前回の設定承認で差戻し: {promotionSendbackReason} — 修正後に再申請できます</span>
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
            disabled={hasUnmet || requested || paused || approved}
            title={paused ? '緊急停止中は申請できません' : hasUnmet ? '承認率が基準に未達です' : requested ? '申請済みです' : approved ? '設定変更は承認済みです' : undefined}
            onClick={() => setApplyOpen(true)}
            className={cn(
              'flex items-center gap-1.5 rounded-[var(--radius-control)] px-3 py-1.5 text-sm font-medium',
              hasUnmet || requested || paused || approved
                ? 'cursor-not-allowed bg-[var(--color-panel-inset)] text-[var(--color-fg-subtle)]'
                : 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]'
            )}
          >
            <BotIcon className="h-4 w-4" />
            {requested ? '申請済み' : approved ? '承認済み' : '設定変更を申請'}
          </button>
        </footer>
      )}

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

      {/* 緊急停止 confirm dialog (kill-switch、理由は任意で pausedReason に保持)。 */}
      <Modal
        open={emergencyOpen}
        onClose={() => setEmergencyOpen(false)}
        title="Agent を緊急停止"
        size="sm"
        footer={
          <>
            <button
              type="button"
              onClick={() => setEmergencyOpen(false)}
              className="rounded-[var(--radius-control)] border border-[var(--color-border-strong)] bg-[var(--color-panel)] px-3 py-1.5 text-sm text-[var(--color-fg)] hover:bg-[var(--color-panel-inset)]"
            >
              キャンセル
            </button>
            <button
              type="button"
              onClick={() => {
                const r = emergencyReason.trim()
                if (!r) {
                  setEmergencyError(true)
                  return
                }
                if (id) dispatch({ type: 'agent/emergencyStop', id, reason: r })
                setEmergencyOpen(false)
                // F-027: 緊急停止 (kill-switch) は統制重要 — alert tone + sticky で見落とさせない (後追いは監査台帳)。
                showToast('Agent を緊急停止しました（全件確認に降格）', { tone: 'alert', sticky: true })
              }}
              className="flex items-center gap-1.5 rounded-[var(--radius-control)] border border-[var(--color-error)] bg-[var(--color-error-soft)] px-3 py-1.5 text-sm font-medium text-[var(--color-error-soft-fg)] hover:opacity-90"
            >
              <PauseIcon className="h-4 w-4" />
              緊急停止する
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <p className="text-sm leading-relaxed text-[var(--color-fg)]">
            この Agent を緊急停止し、全件確認（人による全件レビュー）に降格します。自動入力は止まり、一覧にも「緊急停止中」と表示されます。
          </p>
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label htmlFor="emergency-reason" className="text-xs font-medium text-[var(--color-fg)]">停止理由（必須）</label>
              {emergencyError && (
                <span id="emergency-reason-error" role="alert" className="flex items-center gap-1 text-xs text-[var(--color-error-soft-fg)]">
                  <AlertTriangleIcon className="h-3 w-3 text-[var(--color-error)]" />
                  入力してください
                </span>
              )}
            </div>
            <textarea
              id="emergency-reason"
              value={emergencyReason}
              onChange={(e) => {
                setEmergencyReason(e.target.value)
                if (emergencyError && e.target.value.trim()) setEmergencyError(false)
              }}
              rows={2}
              aria-invalid={emergencyError}
              aria-describedby={emergencyError ? 'emergency-reason-error' : undefined}
              className={cn(
                'w-full rounded-[var(--radius-control)] border px-3 py-2 text-sm outline-none',
                emergencyError
                  ? 'border-[var(--color-error)] bg-[var(--color-error-soft)]'
                  : 'border-[var(--color-border-strong)] bg-[var(--color-panel)] focus:border-[var(--color-primary)]'
              )}
              placeholder="例: 誤入力が急増したため一時停止"
            />
          </div>
        </div>
      </Modal>

      {/* F-014: 再開 confirm dialog (autonomy 再付与ゆえ確認 + 再開理由必須、1-click 廃止)。trust は原状回復し台帳に記録。 */}
      <ReasonDialog
        open={resumeOpen}
        title="Agent を再開"
        label="再開の理由（必須）"
        placeholder="例: 原因の入力誤りを修正し、再開可能と判断"
        submitLabel="再開する"
        outcome={`緊急停止を解除し、自動化レベルを「${restoreTrust ? trustLevelLabel(restoreTrust) : '原状'}」に戻します。再開理由は監査台帳に記録されます。`}
        onClose={() => setResumeOpen(false)}
        onSubmit={(reason) => {
          if (id) dispatch({ type: 'agent/resume', id, reason })
          showToast('Agent を再開しました（緊急停止を解除）')
        }}
      />

      {/* P1-3 設定承認の差戻し dialog (理由必須、approvePromotion と SoD 対。閉じは ReasonDialog 内で自動) */}
      <ReasonDialog
        open={configSendbackOpen}
        title="設定変更を差戻し"
        label="差戻しの理由 (必須)"
        placeholder="申請者が再検討できるよう、何を直してほしいか具体的に。例: 直近の承認率が基準ぎりぎりなので、もう 1 週間 supervised で様子を見たい。"
        submitLabel="差戻す"
        outcome="差戻すと申請は取り下げられ、申請者が修正後に再申請できます。"
        onClose={() => setConfigSendbackOpen(false)}
        onSubmit={(reason) => {
          if (id) dispatch({ type: 'agent/sendbackPromotion', id, reason })
          showToast('設定変更を差戻しました — 申請者の再検討に戻ります')
        }}
      />

      <Toast toast={toast} onDismiss={dismissToast} />
    </div>
  )
}
