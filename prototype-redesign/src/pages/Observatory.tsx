import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Building2Icon, WalletIcon, SparklesIcon, CheckIcon, DownloadIcon, RotateCcwIcon } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import {
  OBS_CASE_ID,
  OBS_SOD,
  OBS_LIFECYCLE,
  OBS_LEDGER,
  OBS_METRICS,
  OBS_KNOWLEDGE,
  FLYWHEEL_STAGES,
} from '@/data/mock-observatory'
import type { LifecycleEvent, KnowledgeGroup } from '@/data/mock-observatory'
import { MetricVsThreshold } from '@/components/cross-cutting/MetricVsThreshold'
import { MetaChip } from '@/components/shared/MetaChip'
import type { MetaTone } from '@/components/shared/MetaChip'
import { Modal } from '@/components/shared/Modal'
import { useStoreDispatch, useFlywheelLineage } from '@/store/hooks'
import { clearPersisted } from '@/store/persist'
import { cn } from '@/lib/cn'

/**
 * Observatory (/observatory「モニタリング」) — Process-First v2 / typology A、監査者向け参照画面
 * SSOT: screens-v2/09-observatory/canonical-export.md + screen-contracts-v2 + canonical-design-spec
 *
 * 3 tab: 監査 (案件の経過 lifecycle + 証跡台帳 ledger) / メトリクス (Process 別 KPI) / ナレッジ (Process 別)。
 * ▼ raw ledger 例外: actor / action / confidence 等の技術 schema は「証跡台帳」view 内だけに閉じる。
 *   lifecycle / metrics / knowledge は業務語のみ。confidence は本 file の ledger view にのみ出現 (型で保証)。
 */
const PROCESS_ICON: Record<KnowledgeGroup['icon'], LucideIcon> = {
  building: Building2Icon,
  wallet: WalletIcon,
}
const TL_DOT: Record<LifecycleEvent['tone'], string> = {
  inset: 'border-[var(--color-border-strong)]',
  primary: 'border-[var(--color-primary)]',
  alert: 'border-[var(--color-alert)]',
  success: 'border-[var(--color-success)]',
}
const LEDGER_HEADERS = ['時刻', 'actor', 'role', 'action', 'before → after', '参照文書', 'policy', 'approval id', 'confidence (監査用)']

const TABS = [
  { k: 'audit', label: '監査' },
  { k: 'metrics', label: 'メトリクス' },
  { k: 'knowledge', label: 'ナレッジ' },
] as const
type TabKey = (typeof TABS)[number]['k']

export function Observatory() {
  const dispatch = useStoreDispatch()
  const lineage = useFlywheelLineage()
  const [tab, setTab] = useState<TabKey>('audit')
  const [auditView, setAuditView] = useState<'lifecycle' | 'ledger'>('lifecycle')
  // ナレッジ tab の view (承認済 知識 ⇄ 改善の流れ lineage、Gate 5ii)。lineage は P1-7 監査台帳 drill とは別 seat (監査 tab)。
  const [knowledgeView, setKnowledgeView] = useState<'approved' | 'lineage'>('approved')
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (m: string) => {
    setToast(m)
    window.setTimeout(() => setToast(null), 2600)
  }

  // 「表示データを初期化」: この端末の操作状態 (承認・差戻し・申請・上書き) を seed に戻す + 永続消去。confirm Modal 経由で実行。
  const handleReset = () => {
    dispatch({ type: 'store/reset' })
    clearPersisted()
    setResetConfirmOpen(false)
    showToast('表示データを初期化しました（この端末の操作状態をリセット）')
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header + tab nav */}
      <header
        data-page-header
        className="sticky top-0 z-30 flex flex-col gap-3 border-b border-[var(--color-border)] bg-[var(--color-panel)] px-6 pt-3"
      >
        <div className="flex items-baseline justify-between gap-3">
          <div className="flex items-baseline gap-3">
            <h1 className="text-xl font-semibold text-[var(--color-fg)]">モニタリング</h1>
            <span className="text-xs text-[var(--color-fg-muted)]">監査者向けの参照画面。業務別に証跡・AI 精度・ナレッジを確認します。</span>
          </div>
          <button
            type="button"
            onClick={() => setResetConfirmOpen(true)}
            title="この端末の操作状態 (承認・差戻し・申請など) を初期化します"
            className="flex flex-shrink-0 items-center gap-1.5 rounded-[var(--radius-control)] border border-[var(--color-border-strong)] bg-[var(--color-panel)] px-2.5 py-1 text-xs font-medium text-[var(--color-fg-muted)] hover:bg-[var(--color-panel-inset)] hover:text-[var(--color-fg)]"
          >
            <RotateCcwIcon className="h-3.5 w-3.5" aria-hidden="true" />
            表示データを初期化
          </button>
        </div>
        <div className="flex gap-1">
          {TABS.map((t) => (
            <button
              key={t.k}
              type="button"
              onClick={() => setTab(t.k)}
              className={cn(
                '-mb-px border-b-2 px-4 py-2 text-sm transition-colors',
                tab === t.k
                  ? 'border-[var(--color-primary)] font-semibold text-[var(--color-primary-hover)]'
                  : 'border-transparent font-medium text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      {/* Body (A 型: 決定 footer なし) */}
      <div className="flex-1 overflow-auto p-5">
        <div className="mx-auto max-w-[1080px]">
          {tab === 'audit' && (
            <div className="flex flex-col gap-3">
              {/* view 切替 + 対象 case */}
              <div className="flex items-center justify-between">
                <div className="flex rounded-[var(--radius-control)] border border-[var(--color-border-strong)] bg-[var(--color-panel)] p-0.5">
                  {(['lifecycle', 'ledger'] as const).map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setAuditView(v)}
                      className={cn(
                        'rounded-[4px] px-3 py-1 text-xs font-medium transition-colors',
                        auditView === v ? 'bg-[var(--color-fg)] text-white' : 'text-[var(--color-fg-muted)]'
                      )}
                    >
                      {v === 'lifecycle' ? '案件の経過' : '証跡台帳 (詳細)'}
                    </button>
                  ))}
                </div>
                <div className="text-xs text-[var(--color-fg-muted)]">
                  {/* P1-7: monitoring dead-end 解消 — case ID を detail へ drill。 */}
                  <Link to={`/cases/${OBS_CASE_ID}`} className="font-mono text-[var(--color-primary)] hover:underline">
                    {OBS_CASE_ID}
                  </Link>{' '}
                  法人住所変更
                </div>
              </div>

              {auditView === 'lifecycle' ? (
                /* 案件の経過 (業務語のみ、confidence なし) */
                <section className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-panel)] p-5">
                  <h2 className="mb-4 text-sm font-semibold text-[var(--color-fg)]">案件の経過 (業務の流れ順)</h2>
                  <ol className="flex flex-col">
                    {OBS_LIFECYCLE.map((e, i) => {
                      const last = i === OBS_LIFECYCLE.length - 1
                      return (
                        <li key={i} className="grid grid-cols-[124px_20px_1fr] gap-3">
                          <div className="pt-0.5 text-right">
                            <span className="font-mono text-[11px] text-[var(--color-fg)]">{e.time}</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className={cn('mt-1 h-3 w-3 flex-shrink-0 rounded-full border-2 bg-[var(--color-panel)]', TL_DOT[e.tone])} />
                            {!last && <span className="w-px flex-1 bg-[var(--color-border)]" />}
                          </div>
                          <div className={cn(last ? 'pb-0' : 'pb-5')}>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-semibold text-[var(--color-fg)]">{e.title}</span>
                              <MetaChip tone={e.tone === 'inset' ? 'inset' : (e.tone as MetaTone)} label={e.role} />
                              <span className="text-xs text-[var(--color-fg-muted)]">{e.actor}</span>
                            </div>
                            <p className="mt-1 text-xs text-[var(--color-fg-muted)]">{e.body}</p>
                          </div>
                        </li>
                      )
                    })}
                  </ol>
                  <div className="mt-3 flex items-center gap-2 border-t border-[var(--color-border)] pt-3">
                    <MetaChip tone="success" label="職務分離" />
                    <span className="text-xs text-[var(--color-fg-muted)]">
                      入力者 <strong className="font-medium text-[var(--color-fg)]">{OBS_SOD.inputter}</strong> と承認者{' '}
                      <strong className="font-medium text-[var(--color-fg)]">{OBS_SOD.approver}</strong> は別人です。
                    </span>
                  </div>
                </section>
              ) : (
                /* 証跡台帳 (raw ledger 例外: actor/action/confidence をこの view 内のみ表示) */
                <section className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-panel)]">
                  <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
                    <div>
                      <h2 className="text-sm font-semibold text-[var(--color-fg)]">証跡台帳</h2>
                      <p className="mt-0.5 text-[11px] text-[var(--color-fg-muted)]">監査用の詳細記録。出力 (エクスポート) 可能な形式です。</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => showToast('証跡台帳の控えを出力しました（参考表示・外部システム未保存）')}
                      className="flex items-center gap-1.5 rounded-[var(--radius-control)] border border-[var(--color-border-strong)] bg-[var(--color-panel)] px-3 py-1.5 text-xs font-medium text-[var(--color-fg)] hover:bg-[var(--color-panel-inset)]"
                    >
                      <DownloadIcon className="h-3.5 w-3.5" aria-hidden="true" />
                      エクスポート
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[980px] border-collapse text-[11.5px]">
                      <thead>
                        <tr className="bg-[var(--color-panel-inset)]">
                          {LEDGER_HEADERS.map((h) => (
                            <th key={h} className="whitespace-nowrap border-b border-[var(--color-border)] px-2.5 py-2 text-left text-[10.5px] font-semibold text-[var(--color-fg-muted)]">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {OBS_LEDGER.map((r, i) => (
                          <tr key={i} className="border-b border-[var(--color-border)] last:border-b-0">
                            <td className="whitespace-nowrap px-2.5 py-2 font-mono text-[var(--color-fg)]">{r.ts}</td>
                            <td className="whitespace-nowrap px-2.5 py-2 font-mono text-[var(--color-fg)]">{r.actor}</td>
                            <td className="px-2.5 py-2 text-[var(--color-fg-muted)]">{r.role}</td>
                            <td className="px-2.5 py-2 font-mono text-[var(--color-fg)]">{r.action}</td>
                            <td className="px-2.5 py-2 text-[var(--color-fg)]">{r.beforeAfter}</td>
                            <td className="whitespace-nowrap px-2.5 py-2 font-mono text-[var(--color-fg-muted)]">{r.doc}</td>
                            <td className="px-2.5 py-2 font-mono text-[var(--color-fg-muted)]">{r.policy}</td>
                            <td className="px-2.5 py-2 font-mono text-[var(--color-fg-muted)]">{r.approvalId}</td>
                            <td className="px-2.5 py-2 font-mono text-[var(--color-fg-muted)]">{r.confidence}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="border-t border-[var(--color-border)] px-4 py-2">
                    <span className="text-[11px] text-[var(--color-fg-muted)]">confidence は監査記録としてこの台帳にのみ残し、業務画面には表示しません。</span>
                  </div>
                </section>
              )}
            </div>
          )}

          {tab === 'metrics' && (
            <div className="flex flex-col gap-4">
              {OBS_METRICS.map((m) => {
                const Icon = PROCESS_ICON[m.icon]
                return (
                  <div key={m.process}>
                    <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-[var(--color-fg)]">
                      <Icon className="h-3.5 w-3.5 text-[var(--color-fg-muted)]" aria-hidden="true" />
                      {m.process}
                    </h2>
                    <MetricVsThreshold title="AI 精度・処理 KPI" subtitle="この業務の直近 30 日の実績" rows={m.rows} />
                  </div>
                )
              })}
            </div>
          )}

          {tab === 'knowledge' && (
            <div className="flex flex-col gap-4">
              {/* view 切替: 承認済 知識 ⇄ 改善の流れ (Flywheel lineage、Gate 5ii)。P1-7 監査台帳 drill は別 seat (監査 tab)。 */}
              <div className="flex rounded-[var(--radius-control)] border border-[var(--color-border-strong)] bg-[var(--color-panel)] p-0.5">
                {(['approved', 'lineage'] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setKnowledgeView(v)}
                    className={cn(
                      'rounded-[4px] px-3 py-1 text-xs font-medium transition-colors',
                      knowledgeView === v ? 'bg-[var(--color-fg)] text-white' : 'text-[var(--color-fg-muted)]'
                    )}
                  >
                    {v === 'approved' ? '承認済' : '改善の流れ'}
                  </button>
                ))}
              </div>

              {knowledgeView === 'approved' ? (
                <>
                  {/* 日次提案分析 banner (token-clean、#C7D2FE 不使用) */}
                  <div className="flex items-center gap-2.5 rounded-[var(--radius-card)] border border-[var(--color-primary-soft-border)] bg-[var(--color-primary-soft)] p-3">
                    <SparklesIcon className="h-4 w-4 flex-shrink-0 text-[var(--color-primary-hover)]" aria-hidden="true" />
                    <span className="text-xs text-[var(--color-fg)]">
                      日次提案分析が差戻しパターンから手順改定の提案を生成しています。提案は{' '}
                      <Link to="/proposals" className="font-medium text-[var(--color-primary)] hover:underline">AI 提案レビュー</Link>
                      {' '}で確認できます。
                    </span>
                  </div>
                  {OBS_KNOWLEDGE.map((g) => {
                    const Icon = PROCESS_ICON[g.icon]
                    return (
                      <section key={g.process} className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-panel)]">
                        <div className="flex items-center gap-2 border-b border-[var(--color-border)] px-4 py-3">
                          <Icon className="h-4 w-4 text-[var(--color-fg-muted)]" aria-hidden="true" />
                          <h2 className="text-sm font-semibold text-[var(--color-fg)]">{g.process}</h2>
                          <MetaChip label={`承認済 ${g.items.length} 件`} className="ml-auto" />
                        </div>
                        {g.items.map((it, i) => (
                          <div key={it.id} className={cn('flex items-center gap-2.5 px-4 py-2.5', i > 0 && 'border-t border-[var(--color-border)]')}>
                            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded bg-[var(--color-success-soft)] text-[var(--color-success-soft-fg)]">
                              <CheckIcon className="h-3.5 w-3.5" strokeWidth={2.2} aria-hidden="true" />
                            </span>
                            <span className="flex-1 text-sm font-medium text-[var(--color-fg)]">{it.title}</span>
                            <span className="font-mono text-[11px] text-[var(--color-fg-tertiary)]">{it.id} · {it.version}</span>
                          </div>
                        ))}
                      </section>
                    )
                  })}
                </>
              ) : (
                /* 改善の流れ (Flywheel lineage、staging disclaimer 付き)。差戻し→改善ヒント(未承認)→手順承認→設定承認。 */
                <div className="flex flex-col gap-3">
                  <div className="flex items-start gap-2.5 rounded-[var(--radius-card)] border border-[var(--color-primary-soft-border)] bg-[var(--color-primary-soft)] p-3">
                    <SparklesIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--color-primary-hover)]" aria-hidden="true" />
                    <div className="text-xs text-[var(--color-fg)]">
                      <div className="font-medium">差戻しが、次の正解手順に変わる流れ</div>
                      <p className="mt-0.5 leading-relaxed text-[var(--color-fg-muted)]">
                        {FLYWHEEL_STAGES.map((s) => s.label).join(' → ')} の順で改善が進みます。
                        <strong className="text-[var(--color-fg)]">改善ヒント（未承認）は AI が自動実行する根拠にはなりません。</strong>
                        承認された手順だけが AI に反映されます。
                      </p>
                    </div>
                  </div>

                  {lineage.length === 0 ? (
                    <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-panel)] p-5 text-center text-sm text-[var(--color-fg-muted)]">
                      まだ承認段階に入った改善はありません。提案が上長へ送付されると、ここに流れが現れます。
                    </div>
                  ) : (
                    lineage.map((l) => (
                      <section key={l.proposalId} className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-panel)]">
                        <div className="flex items-center gap-2 border-b border-[var(--color-border)] px-4 py-3">
                          <SparklesIcon className="h-4 w-4 flex-shrink-0 text-[var(--color-primary-hover)]" aria-hidden="true" />
                          <div className="min-w-0 flex-1">
                            <Link to={`/proposals/${l.proposalId}`} className="truncate text-sm font-medium text-[var(--color-fg)] hover:text-[var(--color-primary)]">
                              {l.title}
                            </Link>
                            <div className="text-[11px] text-[var(--color-fg-muted)]">{l.workflow} · <span className="font-mono">{l.proposalId}</span></div>
                          </div>
                          <MetaChip tone={l.adopted ? 'success' : 'primary'} label={l.adopted ? '承認済' : '手順承認待ち'} />
                        </div>
                        {/* 4 段の流れ。reached: 差戻し/改善ヒント/手順承認 は到達済、設定承認 は adopted のみ。 */}
                        <ol className="flex items-center px-4 py-3">
                          {FLYWHEEL_STAGES.map((stage, i) => {
                            const reached = stage.key !== 'config' || l.adopted
                            const last = i === FLYWHEEL_STAGES.length - 1
                            return (
                              <li key={stage.key} className={cn('flex items-center', !last && 'flex-1')}>
                                <span className="flex flex-shrink-0 items-center gap-1.5">
                                  <span className={cn('h-2 w-2 rounded-full', reached ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border-strong)]')} />
                                  <span className={cn('text-[11px]', reached ? 'font-medium text-[var(--color-fg)]' : 'text-[var(--color-fg-tertiary)]')}>{stage.label}</span>
                                </span>
                                {!last && <span className={cn('mx-2 h-px flex-1', reached ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border)]')} />}
                              </li>
                            )
                          })}
                        </ol>
                        {l.sourceCaseIds.length > 0 && (
                          <div className="border-t border-[var(--color-border)] px-4 py-2.5 text-[11px] text-[var(--color-fg-muted)]">
                            起点の差戻し {l.sourceCaseIds.length} 件:{' '}
                            {l.sourceCaseIds.map((cid, idx) => (
                              <span key={cid}>
                                {idx > 0 && ' / '}
                                <Link to={`/cases/${cid}`} className="font-mono text-[var(--color-primary)] hover:underline">{cid}</Link>
                              </span>
                            ))}
                          </div>
                        )}
                      </section>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* reset confirm Modal: handleReset 直結を廃し confirm 経由に (誤操作防止、既存 Modal primitive 流用)。 */}
      <Modal
        open={resetConfirmOpen}
        onClose={() => setResetConfirmOpen(false)}
        title="表示データを初期化"
        size="sm"
        footer={
          <>
            <button
              type="button"
              onClick={() => setResetConfirmOpen(false)}
              className="rounded-[var(--radius-control)] border border-[var(--color-border-strong)] bg-[var(--color-panel)] px-3 py-1.5 text-sm text-[var(--color-fg)] hover:bg-[var(--color-panel-inset)]"
            >
              キャンセル
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 rounded-[var(--radius-control)] bg-[var(--color-primary)] px-3 py-1.5 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)]"
            >
              <RotateCcwIcon className="h-4 w-4" />
              初期化する
            </button>
          </>
        }
      >
        <div className="text-sm leading-relaxed text-[var(--color-fg)]">
          この端末の操作状態（承認・差戻し・申請・上書き）をすべて初期状態に戻します。元に戻せません。
        </div>
      </Modal>

      {toast && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 z-[80] -translate-x-1/2 rounded-[var(--radius-card)] border border-[var(--color-success)] bg-[var(--color-success-soft)] px-4 py-2 text-sm font-medium text-[var(--color-success-soft-fg)] shadow-lg"
        >
          {toast}
        </div>
      )}
    </div>
  )
}
