import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  SearchIcon,
  ArrowRightIcon,
  CornerUpLeftIcon,
  SparklesIcon,
  ClipboardCheckIcon,
  ShieldCheckIcon,
  ActivityIcon,
  RotateCcwIcon,
} from 'lucide-react'
import { FLYWHEEL_STAGES, OBS_SOD, OBS_CASE_ID, OBS_METRICS, OBS_KNOWLEDGE } from '@/data/mock-observatory'
import { MODEL_INVENTORY, VALIDATION_TONE, DRIFT_MONITORS, DRIFT_TONE } from '@/data/mock-governance'
import { PROPOSAL_DETAILS } from '@/data/mock-proposal-detail'
import { useCrossLedger, useFlywheelLineage, useStoreDispatch } from '@/store/hooks'
import { clearPersisted } from '@/store/persist'
import { Modal } from '@/components/shared/Modal'
import { Toast } from '@/components/shared/Toast'
import { useToast } from '@/hooks/useToast'
import { PageHeader, Card, ToneChip } from './ui'

/**
 * ObservatoryV2 — 監視 (oversight、store 配線済)。5 tab cockpit: 監査 / メトリクス / ナレッジ / モデルガバナンス / 証跡台帳。
 * complacency 対策 (抜き取り確認) + flywheel + KPI drill + model governance (SR 26-2 honest framing) + 横断証跡台帳
 * (業務 filter / free-text / action chip / pagination / 案件 drill)。confidence 生数字は監査台帳のみ (sanctioned 例外)。
 */
const FLY_ICON = { sendback: CornerUpLeftIcon, staging: SparklesIcon, procedure: ClipboardCheckIcon, config: ShieldCheckIcon } as const
const TABS = ['監査', 'メトリクス', 'ナレッジ', 'モデルガバナンス', '証跡台帳 (詳細)'] as const
type Tab = (typeof TABS)[number]
const LEDGER_PROC = [
  { id: 'all', label: '全業務' },
  { id: '法人住所変更', label: '法人住所変更' },
  { id: '口座開設書類完備', label: '口座開設書類完備' },
] as const
const PAGE_SIZE = 8

export function ObservatoryV2() {
  const ledger = useCrossLedger()
  const lineage = useFlywheelLineage()
  const dispatch = useStoreDispatch()
  const { toast, show: showToast, dismiss: dismissToast } = useToast()
  const [tab, setTab] = useState<Tab>('監査')
  const [resetOpen, setResetOpen] = useState(false)
  const [flywheelOpen, setFlywheelOpen] = useState(false)
  // 証跡台帳 (詳細) の filter/search/action/page (filter 変更で page reset)。
  const [ledProc, setLedProc] = useState<string>('all')
  const [ledSearch, setLedSearch] = useState('')
  const [ledAction, setLedAction] = useState<string | null>(null)
  const [ledPage, setLedPage] = useState(0)

  const auditLedger = ledger.filter((e) => e.caseId === OBS_CASE_ID) // 監査 tab = 代表 case
  const actions = [...new Set(ledger.map((e) => e.action))]
  const q = ledSearch.trim().toLowerCase()
  const filteredLedger = ledger.filter(
    (e) =>
      (ledProc === 'all' || e.workflowName === ledProc) &&
      (!ledAction || e.action === ledAction) &&
      (!q || `${e.caseId} ${e.workflowName} ${e.action}`.toLowerCase().includes(q)),
  )
  const totalPages = Math.max(1, Math.ceil(filteredLedger.length / PAGE_SIZE))
  const page = Math.min(ledPage, totalPages - 1)
  const pageRows = filteredLedger.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE)
  const resetPage = <T,>(set: (v: T) => void) => (v: T) => { set(v); setLedPage(0) }

  const tabBtn = (t: Tab) =>
    'rounded-[var(--v2-radius-control)] px-3 py-1.5 text-[13px] font-medium transition-colors ' +
    (tab === t ? 'bg-[var(--v2-accent-soft)] text-[var(--v2-accent-soft-fg)]' : 'text-[var(--v2-fg-muted)] hover:bg-[var(--v2-panel-inset)] hover:text-[var(--v2-fg)]')

  return (
    <div className="flex h-full flex-col overflow-auto">
      <PageHeader
        title="モニタリング"
        sub="業務の健全性・統制・証跡"
        actions={
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-[var(--v2-radius-chip)] border border-[var(--v2-border)] bg-[var(--v2-panel-inset)] px-2 py-1 text-[12px] text-[var(--v2-fg-tertiary)]">
              <ShieldCheckIcon className="h-3.5 w-3.5" aria-hidden="true" />
              四眼: 入力者 {OBS_SOD.inputter} ≠ 承認者 {OBS_SOD.approver}
            </span>
            <button
              type="button"
              onClick={() => setResetOpen(true)}
              className="flex h-8 items-center gap-1.5 rounded-[var(--v2-radius-control)] border border-[var(--v2-border-strong)] bg-[var(--v2-panel)] px-3 text-[13px] font-medium text-[var(--v2-fg-muted)] hover:bg-[var(--v2-panel-inset)] hover:text-[var(--v2-fg)]"
            >
              <RotateCcwIcon className="h-3.5 w-3.5" aria-hidden="true" />
              表示データを初期化
            </button>
          </div>
        }
      />

      {/* tab bar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-[var(--v2-border)] bg-[var(--v2-panel)] px-6 py-2">
        {TABS.map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)} aria-pressed={tab === t} className={tabBtn(t)}>
            {t}
          </button>
        ))}
      </div>

      <div className="mx-auto w-full max-w-[1080px] px-6 py-5">
        {/* === 監査 tab (default): 抜き取り + flywheel + 代表 case 監査台帳 === */}
        {tab === '監査' && (
          <>
            <Card className="border-[var(--v2-accent-soft-border)] bg-[var(--v2-accent-soft)] p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[var(--v2-radius-control)] bg-[var(--v2-accent)] text-white">
                    <SearchIcon className="h-4.5 w-4.5" aria-hidden="true" />
                  </span>
                  <div>
                    <div className="text-[14px] font-semibold text-[var(--v2-fg)]">本日の自動確定を抜き取り確認</div>
                    <p className="mt-1 max-w-[640px] text-[13px] text-[var(--v2-fg-muted)]">
                      AI が確定した <span className="v2-tnum font-medium text-[var(--v2-fg)]">28</span> 件のうち、
                      <span className="v2-tnum font-medium text-[var(--v2-fg)]"> 3</span> 件を無作為抽出して確認することを推奨します。「すべて緑」で見落とすことを防ぐ能動チェックです。
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => showToast('抜き取り確認の対象 3 件を選びました（プロトタイプ — 外部システム未接続）')}
                  className="flex flex-shrink-0 items-center gap-1.5 rounded-[var(--v2-radius-control)] bg-[var(--v2-accent)] px-3.5 py-2 text-[13px] font-medium text-white hover:bg-[var(--v2-accent-hover)]"
                >
                  抜き取りを開始
                  <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </Card>

            <Card className="mt-4 p-4">
              <div className="flex items-center gap-2 text-[13px] font-medium text-[var(--v2-fg)]">
                <ActivityIcon className="h-4 w-4 text-[var(--v2-fg-muted)]" aria-hidden="true" />
                改善の流れ（差戻しを次の正解手順に変える）
              </div>
              <ol className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-stretch">
                {FLYWHEEL_STAGES.map((s, i) => {
                  const Icon = FLY_ICON[s.key]
                  return (
                    <li key={s.key} className="contents">
                      <div className="rounded-[var(--v2-radius-control)] border border-[var(--v2-hairline)] bg-[var(--v2-panel-inset)] p-3">
                        <div className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--v2-fg)]">
                          <Icon className="h-4 w-4 flex-shrink-0 text-[var(--v2-accent-strong)]" aria-hidden="true" />
                          {s.label}
                        </div>
                        <p className="mt-1 text-[11px] leading-relaxed text-[var(--v2-fg-tertiary)]">{s.note}</p>
                      </div>
                      {i < FLYWHEEL_STAGES.length - 1 && (
                        <div className="hidden items-center justify-center text-[var(--v2-fg-subtle)] md:flex">
                          <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
                        </div>
                      )}
                    </li>
                  )
                })}
              </ol>
            </Card>

            <Card className="mt-4 overflow-hidden">
              <div className="flex items-center justify-between border-b border-[var(--v2-border)] px-4 py-2.5">
                <span className="text-[13px] font-medium text-[var(--v2-fg)]">
                  監査台帳 — <Link to={`/cases/${OBS_CASE_ID}`} className="text-[var(--v2-accent-strong)] hover:underline">{OBS_CASE_ID}</Link>
                </span>
                <span className="text-[11px] text-[var(--v2-fg-tertiary)]">後から完全に説明できる証跡（生の confidence は監査用）</span>
              </div>
              <div className="overflow-x-auto">
                <div className="min-w-[760px]">
                  <div className="grid grid-cols-[150px_92px_104px_1fr_180px] gap-3 border-b border-[var(--v2-border)] bg-[var(--v2-panel-inset)] px-4 py-2 text-[11px] font-medium uppercase tracking-wide text-[var(--v2-fg-tertiary)]">
                    <span>時刻</span><span>役割</span><span>アクション</span><span>変更内容</span><span>confidence（監査用）</span>
                  </div>
                  {auditLedger.map((e) => (
                    <div key={e.ts} className="grid grid-cols-[150px_92px_104px_1fr_180px] gap-3 border-b border-[var(--v2-hairline)] px-4 py-2 text-[12px] last:border-b-0">
                      <span className="v2-mono text-[var(--v2-fg-tertiary)]">{e.ts}</span>
                      <span className="text-[var(--v2-fg-muted)]">{e.role}</span>
                      <span className="font-medium text-[var(--v2-fg)]">{e.action}</span>
                      <span className="text-[var(--v2-fg-muted)]">{e.beforeAfter}</span>
                      <span className="v2-mono text-[var(--v2-fg-tertiary)]">{e.confidence}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </>
        )}

        {/* === メトリクス tab: process 別 KPI、未達は該当 Agent へ drill === */}
        {tab === 'メトリクス' && (
          <div className="flex flex-col gap-4">
            {OBS_METRICS.map((p) => (
              <Card key={p.process} className="overflow-hidden">
                <div className="border-b border-[var(--v2-border)] px-4 py-2.5 text-[13px] font-medium text-[var(--v2-fg)]">{p.process} — KPI [仮説 / 要検証]</div>
                <div className="flex flex-col">
                  {p.rows.map((r) => (
                    <div key={r.metricLabel} className="grid grid-cols-[1fr_92px_104px_120px] items-center gap-3 border-b border-[var(--v2-hairline)] px-4 py-2.5 text-[13px] last:border-b-0">
                      <span className="text-[var(--v2-fg)]">
                        {r.agentHref ? (
                          <Link to={r.agentHref} className="font-medium text-[var(--v2-accent-strong)] hover:underline">{r.metricLabel}</Link>
                        ) : (
                          r.metricLabel
                        )}
                      </span>
                      <span className="v2-tnum text-[var(--v2-fg)]">{r.actualValue}</span>
                      <span className="v2-tnum text-[var(--v2-fg-tertiary)]">基準 {r.threshold}</span>
                      <ToneChip tone={r.achieved ? 'success' : 'alert'} label={r.judgment} />
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* === ナレッジ tab: KB groups + 改善の流れ (flywheel lineage) === */}
        {tab === 'ナレッジ' && (
          <div className="flex flex-col gap-4">
            <Card className="p-4">
              <button
                type="button"
                onClick={() => setFlywheelOpen((o) => !o)}
                aria-expanded={flywheelOpen}
                className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--v2-accent-strong)]"
              >
                <SparklesIcon className="h-4 w-4" aria-hidden="true" />
                改善の流れ
              </button>
              {flywheelOpen && (
                <div className="mt-3 flex flex-col gap-2">
                  <p className="text-[12px] text-[var(--v2-fg-muted)]">
                    現場の{FLYWHEEL_STAGES[0]?.label} → <span className="font-medium text-[var(--v2-fg)]">{FLYWHEEL_STAGES[1]?.label}</span> → {FLYWHEEL_STAGES[2]?.label} → {FLYWHEEL_STAGES[3]?.label} の lineage。
                  </p>
                  {lineage.map((l) => (
                    <div key={l.proposalId} className="flex items-center gap-2.5 rounded-[var(--v2-radius-control)] border border-[var(--v2-hairline)] bg-[var(--v2-panel-inset)] px-3 py-2">
                      <ToneChip tone={l.adopted ? 'success' : 'inset'} label={l.adopted ? '承認済' : '審議中'} />
                      <span className="min-w-0 flex-1 truncate text-[13px] text-[var(--v2-fg)]">{PROPOSAL_DETAILS[l.proposalId]?.changeTitle ?? l.title}</span>
                      <Link to={`/proposals/${l.proposalId}`} className="v2-mono flex-shrink-0 text-[11px] text-[var(--v2-accent-strong)] hover:underline">{l.proposalId}</Link>
                    </div>
                  ))}
                  {lineage.length === 0 && <p className="text-[12px] text-[var(--v2-fg-tertiary)]">まだ承認段階に入った改善はありません。</p>}
                </div>
              )}
            </Card>
            {OBS_KNOWLEDGE.map((g) => (
              <Card key={g.process} className="overflow-hidden">
                <div className="border-b border-[var(--v2-border)] px-4 py-2.5 text-[13px] font-medium text-[var(--v2-fg)]">{g.process}</div>
                <div className="flex flex-col">
                  {g.items.map((it) => (
                    <div key={it.id} className="flex items-center gap-3 border-b border-[var(--v2-hairline)] px-4 py-2.5 text-[13px] last:border-b-0">
                      <span className="flex-1 text-[var(--v2-fg)]">{it.title}</span>
                      <span className="v2-mono text-[11px] text-[var(--v2-fg-tertiary)]">{it.id}</span>
                      <span className="v2-mono text-[11px] text-[var(--v2-fg-tertiary)]">{it.version}</span>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* === モデルガバナンス tab (F-039): honest framing + model 台帳 + drift/bias === */}
        {tab === 'モデルガバナンス' && (
          <div className="flex flex-col gap-4">
            <div className="rounded-[var(--v2-radius-card)] border border-[var(--v2-border)] bg-[var(--v2-panel-inset)] p-3 text-[11px] leading-relaxed text-[var(--v2-fg-tertiary)]">
              本プロトタイプは統制を represent するものであり、<strong className="text-[var(--v2-fg)]">規制準拠（compliance）を主張するものではありません</strong>。
              帳票 OCR / 項目分類 など embedded な非生成 model に SR 26-2 (MRM) 原則を適用した governance を表します。照合は deterministic な rule-based 処理 (model 定義外)、生成・agentic 層は SR 26-2 scope 外。実体は本番の別 module、本画面は mock の参照表現。
            </div>
            <Card className="overflow-hidden">
              <div className="border-b border-[var(--v2-border)] px-4 py-2.5 text-[13px] font-medium text-[var(--v2-fg)]">モデル台帳（model inventory）</div>
              <div className="overflow-x-auto">
                <div className="min-w-[820px]">
                  <div className="grid grid-cols-[120px_120px_96px_1fr_120px_110px] gap-3 border-b border-[var(--v2-border)] bg-[var(--v2-panel-inset)] px-4 py-2 text-[11px] font-medium uppercase tracking-wide text-[var(--v2-fg-tertiary)]">
                    <span>業務</span><span>モデル</span><span>版</span><span>用途 / 所有者</span><span>SR 26-2 区分</span><span>検証状況</span>
                  </div>
                  {MODEL_INVENTORY.map((m) => (
                    <div key={m.process + m.model + m.version} className="grid grid-cols-[120px_120px_96px_1fr_120px_110px] items-center gap-3 border-b border-[var(--v2-hairline)] px-4 py-2.5 text-[12px] last:border-b-0">
                      <span className="text-[var(--v2-fg-muted)]">{m.process}</span>
                      <Link to={`/agents/${m.agentId}`} className="font-medium text-[var(--v2-accent-strong)] hover:underline">{m.model}</Link>
                      <span className="v2-mono text-[var(--v2-fg-tertiary)]">{m.version}</span>
                      <span className="text-[var(--v2-fg-muted)]">{m.purpose} · {m.owner}</span>
                      <span className="text-[11px] text-[var(--v2-fg-tertiary)]">{m.scope}</span>
                      <ToneChip tone={VALIDATION_TONE[m.validation]} label={m.validation} />
                    </div>
                  ))}
                </div>
              </div>
            </Card>
            <Card className="overflow-hidden">
              <div className="border-b border-[var(--v2-border)] px-4 py-2.5 text-[13px] font-medium text-[var(--v2-fg)]">drift / bias 監視 <span className="text-[11px] font-normal text-[var(--v2-fg-tertiary)]">[仮説 / 要検証]</span></div>
              <div className="flex flex-col">
                {DRIFT_MONITORS.map((d) => (
                  <div key={d.process + d.metric} className="grid grid-cols-[120px_1fr_104px_104px_96px] items-center gap-3 border-b border-[var(--v2-hairline)] px-4 py-2.5 text-[12px] last:border-b-0">
                    <span className="text-[var(--v2-fg-muted)]">{d.process}</span>
                    <span className="text-[var(--v2-fg)]">{d.metric}</span>
                    <span className="v2-tnum text-[var(--v2-fg)]">{d.value}</span>
                    <span className="v2-tnum text-[var(--v2-fg-tertiary)]">基準 {d.threshold}</span>
                    <ToneChip tone={DRIFT_TONE[d.status]} label={d.status} />
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* === 証跡台帳 (詳細) tab: 横断 ledger + 業務 filter / free-text / action chip / pagination / 案件 drill === */}
        {tab === '証跡台帳 (詳細)' && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {LEDGER_PROC.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => resetPage(setLedProc)(p.id)}
                  aria-pressed={ledProc === p.id}
                  className={
                    'rounded-[var(--v2-radius-control)] border px-2.5 py-1 text-[13px] transition-colors ' +
                    (ledProc === p.id ? 'border-[var(--v2-accent-soft-border)] bg-[var(--v2-accent-soft)] font-medium text-[var(--v2-accent-soft-fg)]' : 'border-[var(--v2-border)] bg-[var(--v2-panel)] text-[var(--v2-fg-muted)] hover:border-[var(--v2-border-strong)]')
                  }
                >
                  {p.label}
                </button>
              ))}
              <div className="ml-auto flex h-8 w-full max-w-[260px] items-center gap-2 rounded-[var(--v2-radius-control)] border border-[var(--v2-border-strong)] bg-[var(--v2-panel)] px-2.5">
                <SearchIcon className="h-4 w-4 flex-shrink-0 text-[var(--v2-fg-muted)]" aria-hidden="true" />
                <input
                  type="search"
                  value={ledSearch}
                  onChange={(e) => resetPage(setLedSearch)(e.target.value)}
                  aria-label="証跡台帳を検索"
                  placeholder="案件・業務・操作で検索"
                  className="w-full bg-transparent text-[13px] text-[var(--v2-fg)] placeholder:text-[var(--v2-fg-subtle)] focus:outline-none"
                />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <button type="button" onClick={() => resetPage(setLedAction)(null)} aria-pressed={ledAction === null} className={'rounded-[var(--v2-radius-chip)] border px-2 py-0.5 text-[11px] ' + (ledAction === null ? 'border-[var(--v2-accent-soft-border)] bg-[var(--v2-accent-soft)] text-[var(--v2-accent-soft-fg)]' : 'border-[var(--v2-border)] text-[var(--v2-fg-muted)]')}>すべて</button>
              {actions.map((a) => (
                <button key={a} type="button" onClick={() => resetPage(setLedAction)(a)} aria-pressed={ledAction === a} className={'rounded-[var(--v2-radius-chip)] border px-2 py-0.5 text-[11px] ' + (ledAction === a ? 'border-[var(--v2-accent-soft-border)] bg-[var(--v2-accent-soft)] text-[var(--v2-accent-soft-fg)]' : 'border-[var(--v2-border)] text-[var(--v2-fg-muted)] hover:border-[var(--v2-border-strong)]')}>{a}</button>
              ))}
            </div>
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <div className="min-w-[820px]">
                  <div className="grid grid-cols-[150px_150px_92px_104px_1fr] gap-3 border-b border-[var(--v2-border)] bg-[var(--v2-panel-inset)] px-4 py-2 text-[11px] font-medium uppercase tracking-wide text-[var(--v2-fg-tertiary)]">
                    <span>案件</span><span>時刻</span><span>役割</span><span>アクション</span><span>変更内容</span>
                  </div>
                  {pageRows.map((e, i) => (
                    <div key={e.caseId + e.ts + i} className="grid grid-cols-[150px_150px_92px_104px_1fr] gap-3 border-b border-[var(--v2-hairline)] px-4 py-2 text-[12px] last:border-b-0">
                      <Link to={`/cases/${e.caseId}`} className="v2-mono text-[var(--v2-accent-strong)] hover:underline">{e.caseId}</Link>
                      <span className="v2-mono text-[var(--v2-fg-tertiary)]">{e.ts}</span>
                      <span className="text-[var(--v2-fg-muted)]">{e.role}</span>
                      <span className="font-medium text-[var(--v2-fg)]">{e.action}</span>
                      <span className="truncate text-[var(--v2-fg-muted)]">{e.beforeAfter}</span>
                    </div>
                  ))}
                  {pageRows.length === 0 && <div className="px-4 py-6 text-center text-[12px] text-[var(--v2-fg-tertiary)]">該当する証跡がありません。</div>}
                </div>
              </div>
            </Card>
            {totalPages > 1 && (
              <div className="flex items-center justify-end gap-2 text-[12px]">
                <button type="button" disabled={page === 0} onClick={() => setLedPage(page - 1)} className={'rounded-[var(--v2-radius-control)] border border-[var(--v2-border-strong)] px-2.5 py-1 ' + (page === 0 ? 'cursor-not-allowed text-[var(--v2-fg-subtle)]' : 'text-[var(--v2-fg)] hover:bg-[var(--v2-panel-inset)]')}>前へ</button>
                <span className="v2-tnum text-[var(--v2-fg-muted)]">{page + 1} / {totalPages}</span>
                <button type="button" disabled={page >= totalPages - 1} onClick={() => setLedPage(page + 1)} className={'rounded-[var(--v2-radius-control)] border border-[var(--v2-border-strong)] px-2.5 py-1 ' + (page >= totalPages - 1 ? 'cursor-not-allowed text-[var(--v2-fg-subtle)]' : 'text-[var(--v2-fg)] hover:bg-[var(--v2-panel-inset)]')}>次へ</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* reset confirm */}
      <Modal
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        title="表示データを初期化"
        size="sm"
        footer={
          <>
            <button type="button" onClick={() => setResetOpen(false)} className="rounded-[var(--radius-control)] border border-[var(--color-border-strong)] bg-[var(--color-panel)] px-3 py-1.5 text-sm text-[var(--color-fg)] hover:bg-[var(--color-panel-inset)]">
              キャンセル
            </button>
            <button
              type="button"
              onClick={() => { dispatch({ type: 'store/reset' }); clearPersisted(); setResetOpen(false); showToast('表示データを初期化しました') }}
              className="rounded-[var(--radius-control)] bg-[var(--color-primary)] px-3 py-1.5 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)]"
            >
              初期化する
            </button>
          </>
        }
      >
        <div className="text-sm leading-relaxed text-[var(--color-fg)]">
          このセッションの操作 (承認 / 差戻し / 起票 / 訂正 等) をすべて破棄し、初期状態に戻します。<strong>元に戻せません</strong>。
        </div>
      </Modal>

      <Toast toast={toast} onDismiss={dismissToast} />
    </div>
  )
}
