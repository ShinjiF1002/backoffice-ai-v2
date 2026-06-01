import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Building2Icon, WalletIcon, SparklesIcon, CheckIcon, DownloadIcon, RotateCcwIcon, SearchIcon, ShieldIcon, ActivityIcon } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import {
  OBS_CASE_ID,
  OBS_SOD,
  OBS_LIFECYCLE,
  OBS_METRICS,
  OBS_KNOWLEDGE,
  FLYWHEEL_STAGES,
} from '@/data/mock-observatory'
import type { LifecycleEvent, KnowledgeGroup } from '@/data/mock-observatory'
import { MODEL_INVENTORY, VALIDATION_TONE, DRIFT_MONITORS, DRIFT_TONE } from '@/data/mock-governance'
import { MetricVsThreshold } from '@/components/cross-cutting/MetricVsThreshold'
import { MetaChip } from '@/components/shared/MetaChip'
import type { MetaTone } from '@/components/shared/MetaChip'
import { Modal } from '@/components/shared/Modal'
import { Toast } from '@/components/shared/Toast'
import { useToast } from '@/hooks/useToast'
import { useStoreDispatch, useFlywheelLineage, useCrossLedger, useCases } from '@/store/hooks'
import { clearPersisted } from '@/store/persist'
import { cn } from '@/lib/cn'

/**
 * Observatory (/observatory「モニタリング」) — Process-First v2 / typology A、監査者向け参照画面
 * SSOT: screens-v2/09-observatory/canonical-export.md + screen-contracts-v2 + canonical-design-spec
 *
 * 3 tab: 監査 (案件の経過 lifecycle + 証跡台帳 ledger) / メトリクス (Process 別 KPI) / ナレッジ (Process 別)。
 * ▼ raw ledger 例外: actor / action / confidence 等の技術 schema は「証跡台帳」view 内だけに閉じる。
 *   lifecycle / metrics / knowledge は業務語のみ。confidence は本 file の ledger view にのみ出現 (型で保証)。
 *
 * F-009 注: 本画面は静的 fixture + store 由来 ledger を集約する監視 view で、list 取得 (fetch) を伴わない。
 * ゆえに ?demo=loading/error の取得縮退は **非対象** (list route の useListData seam とは別カテゴリ)。
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
const LEDGER_HEADERS = ['時刻', '案件', '業務', 'actor', 'role', 'action', 'before → after', '参照文書', 'policy', 'approval id', 'confidence (監査用)']
const LEDGER_WORKFLOWS = ['all', '法人住所変更', '口座開設書類完備'] as const
// W3 G2 / F-002: 横断台帳の actor / action 絞り込み候補は live 台帳 (静的参照 + セッション操作証跡) から component 内で導出する
// (固定 fixture からの module-const では live 操作で増えた actor/action が filter に出ないため)。
const LEDGER_PAGE_SIZE = 12

const TABS = [
  { k: 'audit', label: '監査' },
  { k: 'metrics', label: 'メトリクス' },
  { k: 'knowledge', label: 'ナレッジ' },
  // F-039: モデル台帳 / 独立検証 / drift・bias 監視 を規制担当向けに集約する net-new 統制 surface。
  { k: 'governance', label: 'モデルガバナンス' },
] as const
type TabKey = (typeof TABS)[number]['k']

export function Observatory() {
  const dispatch = useStoreDispatch()
  const lineage = useFlywheelLineage()
  // Operator Cockpit (集約指標ストリップ): 全業務の案件 live state から運用健全性を導出 (静的 fixture ではなく store-truth)。
  // /escalations 母集合と同義 (escalation あり かつ resolution 未確定 = 裁定待ち)。
  const allCases = useCases('all')
  const cockpit = useMemo(() => {
    const c = {
      total: allCases.length,
      inProgress: 0, // 処理中 (受付〜入力者確認の手前: pending / ready)
      approvalWaiting: 0, // 承認待ち (business-approval-waiting)
      needsCheck: 0, // 要確認 項目を抱える案件 (flags > 0)
      sentBack: 0, // 差戻し (sent-back)
      escalation: 0, // 業務責任者の裁定待ち (escalation あり・未裁定)
    }
    for (const e of allCases) {
      if (e.status === 'pending' || e.status === 'ready') c.inProgress += 1
      if (e.status === 'business-approval-waiting') c.approvalWaiting += 1
      if (e.status === 'sent-back') c.sentBack += 1
      if (e.flags > 0) c.needsCheck += 1
      if (e.escalation !== undefined && e.escalation.resolution === undefined) c.escalation += 1
    }
    return c
  }, [allCases])
  // 横並び集約指標。tone は注意喚起の段階のみ (要確認/差戻し/エスカレーションは alert 系、健全側は neutral)。
  const cockpitItems: { label: string; value: number; tone?: MetaTone; chip?: string }[] = [
    { label: '案件総数', value: cockpit.total },
    { label: '処理中', value: cockpit.inProgress },
    { label: '承認待ち', value: cockpit.approvalWaiting, tone: cockpit.approvalWaiting > 0 ? 'primary' : undefined, chip: cockpit.approvalWaiting > 0 ? '要対応' : undefined },
    { label: '要確認', value: cockpit.needsCheck, tone: cockpit.needsCheck > 0 ? 'alert' : undefined, chip: cockpit.needsCheck > 0 ? '注意' : undefined },
    { label: '差戻し', value: cockpit.sentBack, tone: cockpit.sentBack > 0 ? 'alert' : undefined },
    { label: 'エスカレーション', value: cockpit.escalation, tone: cockpit.escalation > 0 ? 'alert' : undefined, chip: cockpit.escalation > 0 ? '裁定待ち' : undefined },
  ]
  const [tab, setTab] = useState<TabKey>('audit')
  const [auditView, setAuditView] = useState<'lifecycle' | 'ledger'>('lifecycle')
  // P1-7: 横断台帳の 案件選択 (workflow) + free-text 検索 (Observatory ローカル、JG-2=b)。期間は「直近30日」固定 (JG-4=b)。
  const [ledgerWorkflow, setLedgerWorkflow] = useState<string>('all')
  const [ledgerActor, setLedgerActor] = useState<string>('all')
  const [ledgerAction, setLedgerAction] = useState<string>('all')
  const [ledgerSearch, setLedgerSearch] = useState('')
  const [ledgerPage, setLedgerPage] = useState(0)
  // F-002: 静的参照台帳 + 本セッションの append-only 操作証跡。操作で増えた actor/action も filter 候補に含める。
  const crossLedger = useCrossLedger()
  const ledgerActors = useMemo(() => ['all', ...new Set(crossLedger.map((e) => e.actor))], [crossLedger])
  const ledgerActions = useMemo(() => ['all', ...new Set(crossLedger.map((e) => e.action))], [crossLedger])
  const ledgerRows = crossLedger.filter((e) => {
    if (ledgerWorkflow !== 'all' && e.workflowName !== ledgerWorkflow) return false
    if (ledgerActor !== 'all' && e.actor !== ledgerActor) return false
    if (ledgerAction !== 'all' && e.action !== ledgerAction) return false
    const q = ledgerSearch.trim().toLowerCase()
    return !q || [e.caseId, e.actor, e.action, e.beforeAfter].some((v) => v.toLowerCase().includes(q))
  })
  // F-031: 非デフォルト filter が 1 つでもあれば全軸 1 ボタン reset を出す (証跡スライス操作の高コスト解消)。
  const hasLedgerFilter = ledgerWorkflow !== 'all' || ledgerActor !== 'all' || ledgerAction !== 'all' || ledgerSearch.trim() !== ''
  const clearLedgerFilters = () => {
    setLedgerWorkflow('all')
    setLedgerActor('all')
    setLedgerAction('all')
    setLedgerSearch('')
    setLedgerPage(0)
  }
  // W3 G2: pagination (Observatory ローカル)。filter 変更で page 0 へ戻す (各 filter setter に setLedgerPage(0) 配線)。
  const totalPages = Math.max(1, Math.ceil(ledgerRows.length / LEDGER_PAGE_SIZE))
  const safePage = Math.min(ledgerPage, totalPages - 1)
  const pageRows = ledgerRows.slice(safePage * LEDGER_PAGE_SIZE, (safePage + 1) * LEDGER_PAGE_SIZE)
  // ナレッジ tab の view (承認済 知識 ⇄ 改善の流れ lineage、Gate 5ii)。lineage は P1-7 監査台帳 drill とは別 seat (監査 tab)。
  const [knowledgeView, setKnowledgeView] = useState<'approved' | 'lineage'>('approved')
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false)
  const { toast, show: showToast, dismiss: dismissToast } = useToast()

  // 「表示データを初期化」: この端末の操作状態 (承認・差戻し・申請・上書き) を seed に戻す + 永続消去。confirm Modal 経由で実行。
  const handleReset = () => {
    dispatch({ type: 'store/reset' })
    clearPersisted()
    setResetConfirmOpen(false)
    showToast('表示データを初期化しました（この端末の操作状態をリセット）')
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header + tab nav。tab を bottom border に統合する特殊 header ゆえ PageHeader primitive ではなく自前構造を保持するが、
          F-036: --height-pageheader contract は遵守する (min-h + py で他画面と密度を揃える)。 */}
      <header
        data-page-header
        className="sticky top-0 z-30 flex min-h-[var(--height-pageheader)] flex-col justify-end gap-3 border-b border-[var(--color-border)] bg-[var(--color-panel)] px-6 pt-3"
      >
        {/* F-023: mobile 375px で title 行が 1 文字ずつ縦折れしないよう、min-w-0 + flex-wrap + sm 未満は縦 stack。 */}
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-3">
            <h1 className="whitespace-nowrap text-xl font-semibold text-[var(--color-fg)]">モニタリング</h1>
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
        <div className="mx-auto flex max-w-[1080px] flex-col gap-4">
          {/* Operator Cockpit — 集約指標ストリップ (T4 監視 console、boring-reliable)。
              全業務の案件 live state から運用健全性を一目で掴む。値は store-truth (静的 fixture ではない)。
              recessive chrome: shadow-sm + border、数値 tabular。glass / 派手 motion なし。 */}
          <section
            aria-label="運用サマリー（全業務の集約指標）"
            className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-panel)] p-4 shadow-sm"
          >
            <div className="mb-3 flex items-center gap-1.5">
              <ActivityIcon className="h-3.5 w-3.5 text-[var(--color-fg-muted)]" aria-hidden="true" />
              <h2 className="text-xs font-semibold text-[var(--color-fg-muted)]">運用サマリー（全業務・現時点）</h2>
            </div>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3 lg:grid-cols-6">
              {cockpitItems.map((it) => (
                <div key={it.label} className="flex flex-col gap-1 border-l border-[var(--color-border)] pl-3 first:border-l-0 first:pl-0">
                  <dt className="text-[11px] text-[var(--color-fg-muted)]">{it.label}</dt>
                  <dd className="flex items-baseline gap-2">
                    <span className="tabular text-2xl font-semibold leading-none text-[var(--color-fg)]">{it.value}</span>
                    {it.chip && it.tone && <MetaChip tone={it.tone} label={it.chip} />}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

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
                {/* 対象 case ラベルは lifecycle (単一 case の経過) のみ。ledger view は全案件横断ゆえ固定 case を出さない (誤誘導防止)。 */}
                {auditView === 'lifecycle' && (
                  <div className="text-xs text-[var(--color-fg-muted)]">
                    {/* P1-7: monitoring dead-end 解消 — case ID を detail へ drill。 */}
                    <Link to={`/cases/${OBS_CASE_ID}`} className="font-mono text-[var(--color-primary-strong)] hover:underline">
                      {OBS_CASE_ID}
                    </Link>{' '}
                    法人住所変更
                  </div>
                )}
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
                  <div className="mt-3 flex flex-col gap-1.5 border-t border-[var(--color-border)] pt-3">
                    <div className="flex items-center gap-2">
                      <MetaChip tone="success" label="職務分離" />
                      <span className="text-xs text-[var(--color-fg-muted)]">
                        入力者 <strong className="font-medium text-[var(--color-fg)]">{OBS_SOD.inputter}</strong> と承認者{' '}
                        <strong className="font-medium text-[var(--color-fg)]">{OBS_SOD.approver}</strong> は別人です。
                      </span>
                    </div>
                    {/* F-042/F-015: 四眼原則の強制モデルを honest に明記 (prototype は role 分離で強制、identity guard は本番 RBAC 向け defense-in-depth)。 */}
                    <p className="text-[11px] leading-relaxed text-[var(--color-fg-tertiary)]">
                      本プロトタイプの四眼原則は 3 アクター（入力者／承認者／業務責任者）の役割分離で強制しています。案件承認・手順承認・設定承認の 3 層には「申請・送付した本人は承認できない」identity ベースのガードも一貫して実装済みですが、役割が分離済みのデモ経路では発火しません（同一人物が両ステップを兼務する本番 RBAC 向けの defense-in-depth）。
                    </p>
                  </div>
                </section>
              ) : (
                /* 証跡台帳 (raw ledger 例外: actor/action/confidence をこの view 内のみ表示) */
                <section className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-panel)]">
                  <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
                    <div>
                      <h2 className="text-sm font-semibold text-[var(--color-fg)]">証跡台帳（全案件横断）</h2>
                      <p className="mt-0.5 text-[11px] text-[var(--color-fg-tertiary)]">
                        {/* F-031: 期間は固定窓である旨を明示 (期間セレクタ未提供を honest に — プロトタイプ)。 */}
                        監査用の詳細記録 · <span className="font-medium">直近 30 日固定（プロトタイプ）</span> · 出力 (エクスポート) 可能な形式です。
                      </p>
                      <p className="mt-0.5 text-[11px] text-[var(--color-fg-tertiary)]">
                        ※ 過去事例の参照記録に加え、この端末・このセッションの操作 (起票・承認・差戻し等) を時系列で追記表示します（mock）。本番の改竄防止・長期保持は別システムで担保します。
                      </p>
                    </div>
                    {/* F-020: 0 件 (空 filter 結果) で成功 toast を出さない。件数を toast に明示し、空エクスポートを誤認させない。 */}
                    <button
                      type="button"
                      disabled={ledgerRows.length === 0}
                      title={ledgerRows.length === 0 ? '出力対象の行がありません' : undefined}
                      onClick={() =>
                        showToast(`証跡台帳 ${ledgerRows.length} 件を出力しました（参考表示・外部システム未保存）`)
                      }
                      className="flex items-center gap-1.5 rounded-[var(--radius-control)] border border-[var(--color-border-strong)] bg-[var(--color-panel)] px-3 py-1.5 text-xs font-medium text-[var(--color-fg)] enabled:hover:bg-[var(--color-panel-inset)] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <DownloadIcon className="h-3.5 w-3.5" aria-hidden="true" />
                      エクスポート
                    </button>
                  </div>
                  {/* P1-7: 案件選択 (workflow filter) + free-text 検索 (Observatory ローカル、JG-2=b) */}
                  <div className="flex flex-wrap items-center gap-2 border-b border-[var(--color-border)] px-4 py-2.5">
                    <div className="flex gap-1">
                      {LEDGER_WORKFLOWS.map((w) => (
                        <button
                          key={w}
                          type="button"
                          onClick={() => {
                            setLedgerWorkflow(w)
                            setLedgerPage(0)
                          }}
                          className={cn(
                            'rounded-[var(--radius-control)] border px-2.5 py-1 text-xs font-medium transition-colors',
                            ledgerWorkflow === w
                              ? 'border-[var(--color-primary)] bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)]'
                              : 'border-[var(--color-border-strong)] bg-[var(--color-panel)] text-[var(--color-fg-muted)] hover:bg-[var(--color-panel-inset)]'
                          )}
                        >
                          {w === 'all' ? '全業務' : w}
                        </button>
                      ))}
                    </div>
                    <div className="relative ml-auto">
                      <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--color-fg-subtle)]" aria-hidden="true" />
                      <input
                        type="search"
                        value={ledgerSearch}
                        onChange={(e) => {
                          setLedgerSearch(e.target.value)
                          setLedgerPage(0)
                        }}
                        placeholder="案件 ID・actor・操作で検索"
                        aria-label="証跡台帳を検索"
                        className="h-8 w-56 rounded-md border border-[var(--color-border)] bg-[var(--color-panel-inset)] pl-8 pr-3 text-xs text-[var(--color-fg)] placeholder:text-[var(--color-fg-tertiary)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                      />
                    </div>
                    <span className="text-[11px] text-[var(--color-fg-muted)]">{ledgerRows.length} 件</span>
                  </div>
                  {/* W3 G2: actor / action 絞り込み (FilterChip、flex-wrap)。raw 値は監査台帳の sanctioned 例外。 */}
                  <div className="flex flex-wrap items-center gap-1.5 border-b border-[var(--color-border)] px-4 py-2">
                    <span className="mr-1 text-[11px] font-medium text-[var(--color-fg-muted)]">操作者</span>
                    {ledgerActors.map((a) => (
                      <button
                        key={`actor-${a}`}
                        type="button"
                        onClick={() => {
                          setLedgerActor(a)
                          setLedgerPage(0)
                        }}
                        className={cn(
                          'rounded-[var(--radius-control)] border px-2 py-0.5 text-[11px] font-medium transition-colors',
                          ledgerActor === a
                            ? 'border-[var(--color-primary)] bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)]'
                            : 'border-[var(--color-border-strong)] bg-[var(--color-panel)] text-[var(--color-fg-muted)] hover:bg-[var(--color-panel-inset)]'
                        )}
                      >
                        {a === 'all' ? '全員' : a}
                      </button>
                    ))}
                    <span className="ml-2 mr-1 text-[11px] font-medium text-[var(--color-fg-muted)]">操作</span>
                    {ledgerActions.map((a) => (
                      <button
                        key={`action-${a}`}
                        type="button"
                        onClick={() => {
                          setLedgerAction(a)
                          setLedgerPage(0)
                        }}
                        className={cn(
                          'rounded-[var(--radius-control)] border px-2 py-0.5 text-[11px] font-medium transition-colors',
                          ledgerAction === a
                            ? 'border-[var(--color-primary)] bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)]'
                            : 'border-[var(--color-border-strong)] bg-[var(--color-panel)] text-[var(--color-fg-muted)] hover:bg-[var(--color-panel-inset)]'
                        )}
                      >
                        {a === 'all' ? '全操作' : a}
                      </button>
                    ))}
                    {/* F-031: 全軸 (業務/操作者/操作/検索) を 1 ボタンで reset。 */}
                    {hasLedgerFilter && (
                      <button
                        type="button"
                        onClick={clearLedgerFilters}
                        className="ml-2 text-[11px] font-medium text-[var(--color-primary-strong)] hover:underline"
                      >
                        フィルタをクリア
                      </button>
                    )}
                  </div>
                  <div className="overflow-x-auto">
                    {ledgerRows.length === 0 ? (
                      <div className="px-4 py-8 text-center text-xs text-[var(--color-fg-muted)]">該当する証跡がありません。</div>
                    ) : (
                      <table className="w-full min-w-[1100px] border-collapse text-[11.5px]">
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
                          {pageRows.map((r, i) => (
                            <tr key={`${r.caseId}-${i}`} className="border-b border-[var(--color-border)] last:border-b-0">
                              <td className="whitespace-nowrap px-2.5 py-2 font-mono text-[var(--color-fg)]">{r.ts}</td>
                              <td className="whitespace-nowrap px-2.5 py-2">
                                {/* P1-7: 台帳行 → 該当 case detail へ drill。 */}
                                <Link to={`/cases/${r.caseId}`} className="font-mono text-[var(--color-primary-strong)] hover:underline">{r.caseId}</Link>
                              </td>
                              <td className="whitespace-nowrap px-2.5 py-2 text-[var(--color-fg-muted)]">{r.workflowName}</td>
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
                    )}
                  </div>
                  {/* W3 G2: pagination (totalPages>1 のみ表示)。前へ/次へ + 件数レンジ。 */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-[var(--color-border)] px-4 py-2 text-[11px] text-[var(--color-fg-muted)]">
                      <span>
                        {ledgerRows.length} 件中 {safePage * LEDGER_PAGE_SIZE + 1}–
                        {Math.min((safePage + 1) * LEDGER_PAGE_SIZE, ledgerRows.length)} 件
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={safePage === 0}
                          onClick={() => setLedgerPage(safePage - 1)}
                          className={cn(
                            'rounded-[var(--radius-control)] border border-[var(--color-border-strong)] bg-[var(--color-panel)] px-2.5 py-1 font-medium text-[var(--color-fg)] hover:bg-[var(--color-panel-inset)]',
                            safePage === 0 && 'cursor-not-allowed opacity-50 hover:bg-[var(--color-panel)]'
                          )}
                        >
                          前へ
                        </button>
                        <span className="font-mono">
                          {safePage + 1} / {totalPages}
                        </span>
                        <button
                          type="button"
                          disabled={safePage >= totalPages - 1}
                          onClick={() => setLedgerPage(safePage + 1)}
                          className={cn(
                            'rounded-[var(--radius-control)] border border-[var(--color-border-strong)] bg-[var(--color-panel)] px-2.5 py-1 font-medium text-[var(--color-fg)] hover:bg-[var(--color-panel-inset)]',
                            safePage >= totalPages - 1 && 'cursor-not-allowed opacity-50 hover:bg-[var(--color-panel)]'
                          )}
                        >
                          次へ
                        </button>
                      </div>
                    </div>
                  )}
                  <div className="border-t border-[var(--color-border)] px-4 py-2">
                    <span className="text-[11px] text-[var(--color-fg-muted)]">confidence は監査記録としてこの台帳にのみ残し、業務画面には表示しません。</span>
                  </div>
                </section>
              )}
            </div>
          )}

          {tab === 'metrics' && (
            <div className="flex flex-col gap-4">
              {/* F-048: 当日の操作 (台帳・手動起票含む) と過去30日 KPI は別母集合である旨を明示 (操作で母数が崩れない理由)。 */}
              <p className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-panel-inset)] px-3 py-2 text-[11px] leading-relaxed text-[var(--color-fg-tertiary)]">
                ※ 本 KPI は「過去 30 日の想定母集合」の集計（仮説値）です。この端末での当日操作（承認・差戻し・手動起票など、監査タブの証跡台帳に記録）とは<strong className="font-medium text-[var(--color-fg)]">別母集合</strong>で、操作しても再計算されません。
              </p>
              {OBS_METRICS.map((m) => {
                const Icon = PROCESS_ICON[m.icon]
                return (
                  <div key={m.process}>
                    <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-[var(--color-fg)]">
                      <Icon className="h-3.5 w-3.5 text-[var(--color-fg-muted)]" aria-hidden="true" />
                      {m.process}
                    </h2>
                    {/* F-019: synthetic KPI を「実績」と偽らず仮説/想定値として framing (実処理からの再計算ではない)。 */}
                    <MetricVsThreshold
                      title="AI 精度・処理 KPI"
                      subtitle="［仮説 / 要検証］この業務の直近 30 日の想定値（実処理からの再計算ではありません）"
                      rows={m.rows}
                    />
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
                      日次提案分析が現場の差戻し・誤確定パターンから手順改定の提案を生成しています。提案は{' '}
                      <Link to="/proposals" className="font-medium text-[var(--color-primary-strong)] hover:underline">AI 提案レビュー</Link>
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
                            <Link to={`/proposals/${l.proposalId}`} className="truncate text-sm font-medium text-[var(--color-fg)] hover:text-[var(--color-primary-strong)]">
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
                                <Link to={`/cases/${cid}`} className="font-mono text-[var(--color-primary-strong)] hover:underline">{cid}</Link>
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

          {/* F-039: モデルガバナンス — モデル台帳 / trust 昇格の独立検証 / drift・bias 監視 を規制担当向けに集約。
              honest framing: 統制を represent し規制準拠は主張しない (SR 26-2 の scope 区分を明示)。 */}
          {tab === 'governance' && (
            <div className="flex flex-col gap-4">
              {/* 規制 framing 注記 (honest) */}
              <div className="flex items-start gap-2.5 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-panel-inset)] p-3 text-[11px] leading-relaxed text-[var(--color-fg-tertiary)]">
                <ShieldIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--color-fg-muted)]" aria-hidden="true" />
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-[var(--color-fg)]">本画面は「統制の表現」であり、規制準拠（compliance）を主張するものではありません。</span>
                  <p>
                    帳票 OCR・項目分類などの<strong className="text-[var(--color-fg)]">非生成 model</strong>には SR 26-2（OCC/FRB/FDIC 合同 MRM ガイダンス）の原則を適用した governance を表します。
                    申請項目の照合は<strong className="text-[var(--color-fg)]">確定的な rule-based 処理</strong>で SR 26-2 上の「model」ではありません。
                    生成・agentic な orchestration 層は<strong className="text-[var(--color-fg)]">SR 26-2 が明示的に scope 外</strong>（脚注3）のため「MRM 準拠」は主張せず、組織が先んじて governance を可視化する good practice として表します。
                    モデルレジストリ・独立検証 pipeline・drift 監視の実体は<strong className="text-[var(--color-fg)]">本番の別 module（バックエンド）</strong>で、本画面は mock の参照表現です（[仮説 / 要検証]）。
                  </p>
                </div>
              </div>

              {/* (1) モデル台帳 (model inventory): 版/用途/所有者/検証状況。policy:v3.1 を個別 model 版に分解。 */}
              <section className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-panel)]">
                <div className="border-b border-[var(--color-border)] px-4 py-3">
                  <h2 className="text-sm font-semibold text-[var(--color-fg)]">モデル台帳（model inventory）</h2>
                  <p className="mt-0.5 text-[11px] text-[var(--color-fg-tertiary)]">各 AI/モデルの版・用途・所有者・独立検証状況。決定 lineage の policy 版はこの個別 model 版に分解されます。</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[48rem] text-[12px]">
                    <thead>
                      <tr className="border-b border-[var(--color-border)] bg-[var(--color-panel-inset)] text-left text-[11px] text-[var(--color-fg-tertiary)]">
                        <th className="px-3 py-2 font-medium">業務</th>
                        <th className="px-3 py-2 font-medium">モデル / 処理</th>
                        <th className="px-3 py-2 font-medium">版</th>
                        <th className="px-3 py-2 font-medium">用途</th>
                        <th className="px-3 py-2 font-medium">所有者</th>
                        <th className="px-3 py-2 font-medium">SR 26-2 区分</th>
                        <th className="px-3 py-2 font-medium">検証状況</th>
                        <th className="px-3 py-2 font-medium">直近独立検証</th>
                      </tr>
                    </thead>
                    <tbody>
                      {MODEL_INVENTORY.map((m, i) => (
                        <tr key={`${m.agentId}-${m.model}-${i}`} className="border-b border-[var(--color-border)] last:border-b-0">
                          <td className="px-3 py-2 text-[var(--color-fg-muted)]">{m.process}</td>
                          <td className="px-3 py-2">
                            <Link to={`/agents/${m.agentId}`} className="font-medium text-[var(--color-primary-strong)] hover:underline">{m.model}</Link>
                          </td>
                          <td className="px-3 py-2 font-mono text-[var(--color-fg)]">{m.version}</td>
                          <td className="px-3 py-2 text-[var(--color-fg-muted)]">{m.purpose}</td>
                          <td className="px-3 py-2 text-[var(--color-fg-muted)]">{m.owner}</td>
                          <td className="px-3 py-2 text-[11px] text-[var(--color-fg-tertiary)]">{m.scope}</td>
                          <td className="px-3 py-2"><MetaChip tone={VALIDATION_TONE[m.validation]} label={m.validation} /></td>
                          <td className="px-3 py-2 font-mono text-[11px] text-[var(--color-fg-tertiary)]">{m.lastValidated}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* (2) trust 昇格の独立検証 */}
              <section className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
                <h2 className="text-sm font-semibold text-[var(--color-fg)]">自動化レベル昇格の独立検証</h2>
                <p className="mt-0.5 text-[11px] leading-relaxed text-[var(--color-fg-tertiary)]">
                  全件確認 → 要所確認 → 自律 の昇格は、申請者と別系統の<strong className="text-[var(--color-fg)]">独立検証（challenger model / 検証チーム）</strong>の合格を前提とします。
                  本 prototype では昇格申請を四眼原則（設定承認）で表し、独立検証の実体（challenger 実行・バックテスト）は本番の別 module です。各 Agent の検証状況は上のモデル台帳および
                  <Link to="/agents" className="font-medium text-[var(--color-primary-strong)] hover:underline"> Agent 設定</Link>で確認できます。
                </p>
              </section>

              {/* (3) drift / bias 監視 */}
              <section className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-panel)]">
                <div className="border-b border-[var(--color-border)] px-4 py-3">
                  <h2 className="text-sm font-semibold text-[var(--color-fg)]">drift / bias 監視</h2>
                  <p className="mt-0.5 text-[11px] text-[var(--color-fg-tertiary)]">入力分布・精度の経時変化を監視し、閾値超過で再検証を促します（指標はすべて [仮説 / 要検証] の mock）。</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[36rem] text-[12px]">
                    <thead>
                      <tr className="border-b border-[var(--color-border)] bg-[var(--color-panel-inset)] text-left text-[11px] text-[var(--color-fg-tertiary)]">
                        <th className="px-3 py-2 font-medium">業務</th>
                        <th className="px-3 py-2 font-medium">監視指標</th>
                        <th className="px-3 py-2 font-medium">監視値</th>
                        <th className="px-3 py-2 font-medium">閾値</th>
                        <th className="px-3 py-2 font-medium">状態</th>
                      </tr>
                    </thead>
                    <tbody>
                      {DRIFT_MONITORS.map((d, i) => (
                        <tr key={`${d.process}-${d.metric}-${i}`} className="border-b border-[var(--color-border)] last:border-b-0">
                          <td className="px-3 py-2 text-[var(--color-fg-muted)]">{d.process}</td>
                          <td className="px-3 py-2 text-[var(--color-fg)]">{d.metric}</td>
                          <td className="px-3 py-2 font-mono text-[var(--color-fg)]">{d.value}</td>
                          <td className="px-3 py-2 font-mono text-[var(--color-fg-muted)]">{d.threshold}</td>
                          <td className="px-3 py-2"><MetaChip tone={DRIFT_TONE[d.status]} label={d.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
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
        <div className="flex flex-col gap-2 text-sm leading-relaxed text-[var(--color-fg)]">
          {/* F-046: 初期化の網羅主張を正確に — 操作状態に加え、操作者 (persona) と証跡台帳も初期化される旨を列挙。 */}
          <p>この端末の状態をすべて初期状態に戻します。元に戻せません。次の項目が初期化されます：</p>
          <ul className="ml-4 list-disc text-[13px] text-[var(--color-fg-muted)]">
            <li>案件・提案・Agent の操作状態（承認・差戻し・訂正/取消・申請・上書き・エスカレーション）</li>
            <li>操作者（persona）— 既定の「入力者」に戻ります</li>
            <li>このセッションの操作証跡（証跡台帳の追記分）・通知の既読状態</li>
          </ul>
        </div>
      </Modal>

      <Toast toast={toast} onDismiss={dismissToast} />
    </div>
  )
}
