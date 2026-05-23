import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ChevronRight,
  AlertTriangle,
  Bot,
  User,
  ShieldCheck,
  FileText,
  Sparkles,
  RefreshCw,
  History,
  Cog,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import { getSendbackCategoryLabel } from '@/lib/sendback-categories'
import { mockAuditEvents, type AuditEvent, type EventType } from '@/data/mock-audit'
import { PageFooter } from '@/components/shared/PageFooter'

/**
 * AuditTrail — 9 画面の 1 つ (`/audit`)、Day 12 Page 7 wireframe
 *
 * SSOT:
 *  - docs/03-ui-prototype-design.md §4.7 (SCR-07 AuditTrail) + §6.2 (適用範囲 2 関連ルール更新 Alert)
 *  - docs/04-knowledge-pipeline.md §8.1 (15-row audit event model、関連項目 含む実 18)
 *  - prototype/CLAUDE.md (Operational Premium Light tokens + JP-only + governance term paraphrase)
 *
 * Layout (Operational Premium Light + 他 7 page と register 共通):
 *  - Sticky PageHeader: breadcrumb + h1 + 期間 chip + 業務 filter + event 数 meta
 *  - Main scrollable (full-width + p-4、Day 14 P1.5 C5 で max-w-5xl から full-width に統一):
 *    監査イベント timeline (時系列順、最新が上、各 row 折りたたみ式 expanded panel)
 *    各 event row: icon + timestamp + event type + case_id + actor + summary
 *    Click で 15-row schema 詳細展開 (snake_case label + JP value)
 *  - Sticky footer: ダッシュボード戻り link + 検証用 拡張は次の実装段階 caption
 *
 * 規範:
 *  - schema は SSOT snake_case で UI 表示 (case_id / workflow_id / agent_id / sendback_category 等)、value は JP-localized
 *  - 適用範囲 2 関連ルール更新 Alert (rule_update_alert event type) は timeline 上で inline 表示、§6.2 SSOT
 *  - workflow filter は本 page 全体に適用 (Metrics の section local pattern と異なり page-global、event timeline が主要 content)
 *  - 国際送金 (restricted boundary pack) は mock event source 対象外 (mock-audit.ts に未登録、§4.7 + DOC-OV-00 §2.1)
 *  - governance term paraphrase 規範 (CR R44 確立): review / trigger / Forced Downgrade / upgrade / precision / layout 等は user-facing 露出禁止
 *  - JSDoc / JSX comment 内の internal SSOT 参照 (`snake_case` schema field 名等) は keep
 */

const WORKFLOW_LABEL: Record<string, string> = {
  'UC-BO-01': '法人住所変更',
  'UC-BO-02': '口座開設書類完備',
}

const EVENT_TYPE_LABEL: Record<EventType, string> = {
  system_intake: 'PDF 受付',
  ai_input: 'AI 入力',
  human_review: '入力者確認',
  human_sendback: '入力者差戻し',
  ai_analysis: 'AI 日次分析',
  proposal_approve: '手順承認',
  business_approve: '承認者承認',
  reflect: '反映',
  rule_update_alert: '関連ルール更新',
  config_approve: '設定承認',
}

interface EventTypeStyle {
  icon: typeof FileText
  iconClass: string
  badgeClass: string
}

const EVENT_TYPE_STYLE: Record<EventType, EventTypeStyle> = {
  system_intake: {
    icon: FileText,
    iconClass: 'text-slate-500',
    badgeClass: 'bg-slate-100 text-slate-700',
  },
  ai_input: {
    icon: Bot,
    iconClass: 'text-[var(--color-primary)]',
    badgeClass: 'bg-[var(--color-primary-soft)] text-[var(--color-primary)]',
  },
  human_review: {
    icon: User,
    iconClass: 'text-emerald-600',
    badgeClass: 'bg-emerald-50 text-[var(--color-success-soft-fg)]',
  },
  human_sendback: {
    icon: AlertTriangle,
    iconClass: 'text-amber-600',
    badgeClass: 'bg-amber-50 text-[var(--color-alert-soft-fg)]',
  },
  ai_analysis: {
    icon: Sparkles,
    iconClass: 'text-[var(--color-primary)]',
    badgeClass: 'bg-[var(--color-primary-soft)] text-[var(--color-primary)]',
  },
  proposal_approve: {
    icon: ShieldCheck,
    iconClass: 'text-emerald-600',
    badgeClass: 'bg-emerald-50 text-[var(--color-success-soft-fg)]',
  },
  business_approve: {
    icon: ShieldCheck,
    iconClass: 'text-[var(--color-success-soft-fg)]',
    badgeClass: 'bg-emerald-100 text-[var(--color-success-soft-fg)]',
  },
  reflect: {
    icon: RefreshCw,
    iconClass: 'text-[var(--color-success-soft-fg)]',
    badgeClass: 'bg-emerald-100 text-[var(--color-success-soft-fg)]',
  },
  rule_update_alert: {
    icon: History,
    iconClass: 'text-amber-600',
    badgeClass: 'bg-amber-50 text-[var(--color-alert-soft-fg)]',
  },
  config_approve: {
    icon: Cog,
    iconClass: 'text-[var(--color-primary)]',
    badgeClass: 'bg-[var(--color-primary-soft)] text-[var(--color-primary)]',
  },
}

export function AuditTrail() {
  const [workflowFilter, setWorkflowFilter] = useState<string>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Sort events by timestamp DESC (newest first) and apply workflow filter
  const filteredEvents = useMemo(() => {
    const all =
      workflowFilter === 'all'
        ? mockAuditEvents
        : mockAuditEvents.filter((e) => e.workflowId === workflowFilter)
    return [...all].sort((a, b) => (a.timestamp > b.timestamp ? -1 : 1))
  }, [workflowFilter])

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  return (
    <div className="flex h-full flex-col bg-[var(--color-canvas)]">
      {/* === Sticky PageHeader === */}
      <header className="border-b border-slate-200 bg-white px-6 py-3">
        <nav aria-label="breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500">
          <Link to="/dashboard" className="hover:text-slate-700">
            ダッシュボード
          </Link>
          <ChevronRight className="h-3 w-3" aria-hidden="true" />
          <span className="text-slate-700">監査証跡</span>
        </nav>
        <div className="mt-1.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-slate-900">監査証跡</h1>
            <span className="inline-flex items-center rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
              直近 30 日 (検証用)
            </span>
            <span className="font-mono text-[10px] text-slate-500 tabular">
              15 項目構造 · 関連項目 含む実 18
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500">業務:</span>
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
          </div>
        </div>
      </header>

      {/* === Main body === */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-4 p-4">
          {/* SSOT framing 注 */}
          <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-[12px] leading-relaxed text-slate-700">
            <div className="flex items-start gap-2.5">
              <History className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-slate-900">
                  監査イベントは <span className="font-mono text-[11px]">15 項目構造</span>{' '}
                  (関連項目 含む実 18) で記録されます
                </p>
                <p className="mt-0.5 text-slate-600">
                  行を選択すると、案件 ID / 業務 / Agent 版数 / AI 提案 ID / 5 分類 / 承認済ナレッジ 参照 / 承認時刻 / 反映差分 等の詳細項目が展開されます。関連画面への遷移は次の実装段階で対応。
                </p>
              </div>
            </div>
          </div>

          {/* 監査イベント timeline */}
          <section
            aria-labelledby="audit-timeline"
            className="rounded-lg border border-slate-200 bg-white"
          >
            <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
              <div>
                <h2
                  id="audit-timeline"
                  className="text-sm font-semibold text-slate-900"
                >
                  監査イベント 時系列
                </h2>
                <p className="mt-1 text-[11px] text-slate-500">
                  最新が上、行を選択すると 15 項目 詳細展開
                </p>
              </div>
              <span className="font-mono text-[10px] text-slate-500 tabular">
                {filteredEvents.length} 件
              </span>
            </div>
            <ol className="divide-y divide-slate-100">
              {filteredEvents.map((event) => {
                const isExpanded = event.id === expandedId
                const style = EVENT_TYPE_STYLE[event.type]
                const TypeIcon = style.icon
                const isRuleUpdate = event.type === 'rule_update_alert'
                return (
                  <li key={event.id}>
                    <button
                      type="button"
                      onClick={() => toggleExpand(event.id)}
                      className={cn(
                        'flex w-full items-start gap-3 px-5 py-3 text-left transition-colors',
                        isExpanded
                          ? 'bg-slate-50'
                          : 'hover:bg-slate-50/50',
                        isRuleUpdate && !isExpanded && 'bg-amber-50/30'
                      )}
                      aria-expanded={isExpanded}
                    >
                      <span
                        className={cn(
                          'mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md',
                          style.badgeClass
                        )}
                      >
                        <TypeIcon className={cn('h-3.5 w-3.5', style.iconClass)} aria-hidden="true" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                          <span className="text-[12px] font-semibold text-slate-900">
                            {EVENT_TYPE_LABEL[event.type]}
                          </span>
                          <span className="font-mono text-[10px] text-slate-500 tabular">
                            {event.caseId}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400 tabular">
                            {event.workflowId} {event.workflowVersion}
                          </span>
                          {isRuleUpdate && (
                            <span className="inline-flex items-center rounded bg-amber-100 px-1.5 py-0.5 font-mono text-[10px] font-medium text-[var(--color-alert-soft-fg)] tabular">
                              過去案件への影響
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-[12px] leading-relaxed text-slate-700">
                          {event.summary}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 font-mono text-[10px] text-slate-500 tabular">
                          <span>{event.timestamp}</span>
                          <span aria-hidden="true">·</span>
                          <span>{event.actorLabel}</span>
                        </div>
                      </div>
                      <ChevronRight
                        className={cn(
                          'mt-2 h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform',
                          isExpanded && 'rotate-90'
                        )}
                        aria-hidden="true"
                      />
                    </button>
                    {/* Expanded panel: 15-row event model detail */}
                    {isExpanded && <DetailPanel event={event} />}
                  </li>
                )
              })}
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
        caption="検証用 監査機能の拡張は次の実装段階で対応"
      />
    </div>
  )
}

/** Expanded panel showing 15-row event model (JP label primary、SSOT snake_case key は sub-caption) */
function DetailPanel({ event }: { event: AuditEvent }) {
  return (
    <div className="border-t border-slate-100 bg-slate-50/30 px-5 py-4">
      <div className="mb-3 flex items-center gap-2">
        <h3 className="text-[11px] font-semibold text-slate-700">
          監査イベント 詳細 (15 項目)
        </h3>
        <span className="font-mono text-[10px] text-slate-500 tabular">
          DOC-KNW-04 §8.1
        </span>
      </div>
      <dl className="grid grid-cols-1 gap-x-6 gap-y-2 text-[11px] sm:grid-cols-2">
        <DetailRow label="案件 ID" schemaKey="case_id" value={event.caseId} />
        <DetailRow
          label="業務"
          schemaKey="workflow_id + workflow_version"
          value={`${event.workflowId} · ${event.workflowVersion}`}
        />
        {event.agentId && (
          <DetailRow
            label="Agent"
            schemaKey="agent_id + agent_version"
            value={`${event.agentId} · ${event.agentVersion ?? '—'}`}
          />
        )}
        {event.promptConfigVersion && (
          <DetailRow
            label="Prompt 設定 版数"
            schemaKey="prompt_config_version"
            value={event.promptConfigVersion}
            note="次の実装段階で実装予定 (検証用項目)"
          />
        )}
        {event.toolConfigVersion && (
          <DetailRow
            label="Tool 設定 版数"
            schemaKey="tool_config_version"
            value={event.toolConfigVersion}
            note="検証用項目"
          />
        )}
        {event.modelConfigVersion && (
          <DetailRow
            label="Model 設定 版数"
            schemaKey="model_config_version"
            value={event.modelConfigVersion}
            note="検証用項目"
          />
        )}
        {event.inputArtifactHash && (
          <DetailRow
            label="入力 PDF ハッシュ"
            schemaKey="input_artifact_hash"
            value={event.inputArtifactHash}
          />
        )}
        {event.aiProposalId && (
          <DetailRow
            label="AI 提案 ID"
            schemaKey="ai_proposal_id"
            value={event.aiProposalId}
          />
        )}
        {event.humanDecisionId && (
          <DetailRow
            label="人手判断 ID"
            schemaKey="human_decision_id"
            value={event.humanDecisionId}
          />
        )}
        {event.sendbackCategory && (
          <DetailRow
            label="差戻し分類"
            schemaKey="sendback_category"
            value={`${getSendbackCategoryLabel(event.sendbackCategory)} (5 分類)`}
          />
        )}
        {event.compiledKnowledgeCitationIds && (
          <DetailRow
            label="承認済ナレッジ 参照 ID"
            schemaKey="compiled_knowledge_citation_ids"
            value={event.compiledKnowledgeCitationIds.join(', ')}
            note="関連画面への遷移は次の実装段階で対応"
            wide
          />
        )}
        {event.approvalTimestamp && (
          <DetailRow
            label="承認時刻 + 承認者"
            schemaKey="approval_timestamp + approver_id"
            value={`${event.approvalTimestamp} · ${event.approverId ?? '—'}`}
          />
        )}
        {event.diffId && (
          <DetailRow
            label="反映差分 ID"
            schemaKey="diff_id"
            value={event.diffId}
            note="関連画面への遷移は次の実装段階で対応"
          />
        )}
        {event.rollbackRef && (
          <DetailRow
            label="ロールバック参照"
            schemaKey="rollback_ref"
            value={event.rollbackRef}
            note="緊急時 段階の強制引き下げ、本 v2 では次の実装段階で対応"
          />
        )}
        {event.screenshotStackId && (
          <DetailRow
            label="操作画面記録 ID"
            schemaKey="screenshot_stack_id"
            value={event.screenshotStackId}
            note="操作画面記録、次の実装段階で対応"
          />
        )}
      </dl>
    </div>
  )
}

interface DetailRowProps {
  /** JP-localized primary label */
  label: string
  /** SSOT snake_case schema key (sub-caption) */
  schemaKey: string
  value: string
  note?: string
  wide?: boolean
}

function DetailRow({ label, schemaKey, value, note, wide }: DetailRowProps) {
  return (
    <div
      className={cn(
        'flex items-start justify-between gap-3 border-b border-slate-100 pb-1.5 last:border-0',
        wide && 'sm:col-span-2'
      )}
    >
      <dt className="shrink-0">
        <div className="text-[11px] font-medium text-slate-700">{label}</div>
        <div className="font-mono text-[9px] text-slate-400 tabular">{schemaKey}</div>
      </dt>
      <dd className="min-w-0 flex-1 text-right">
        <div className="font-mono text-[11px] text-slate-800 tabular">{value}</div>
        {note && (
          <div className="mt-0.5 text-[10px] text-slate-500">{note}</div>
        )}
      </dd>
    </div>
  )
}
