import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ChevronRight,
  BookOpen,
  CheckCircle2,
  CircleDashed,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import {
  getSendbackCategoryLabel,
  SENDBACK_CATEGORY_LABELS,
} from '@/lib/sendback-categories'
import {
  KNOWLEDGE_CATEGORY_DISABLED,
  KNOWLEDGE_WEIGHT_STYLE,
  formatKnowledgeSourceLabel,
} from '@/lib/knowledge-labels'
import { mockKnowledge, type KnowledgeSnippet } from '@/data/mock-knowledge'
import { getAgentById } from '@/data/mock-agents'
import type { SendBackCategory, Weight } from '@/data/types'

/**
 * KnowledgeBrowser — 9 画面の 1 つ (`/knowledge`)、Day 12 Page 8 wireframe
 *
 * SSOT:
 *  - docs/03-ui-prototype-design.md §4.9 (SCR-09 KnowledgeBrowser) + §9.2 (weight インジケータ)
 *  - docs/04-knowledge-pipeline.md (staging / compiled 区分、frontmatter 8 field schema)
 *  - prototype/CLAUDE.md (Operational Premium Light + JP-only + Citation/Staging Governance)
 *
 * Layout (他 8 page と register 共通):
 *  - Sticky PageHeader: breadcrumb + h1 + 期間 chip + 業務 filter + snippet count meta
 *  - Main scrollable (full-width + p-4、Day 14 P1.5 C5 で max-w-5xl から full-width に統一):
 *    framing 注 (承認済 vs 未承認の区別)
 *    分類 + 重要度 filter chip row (section header に局所化)
 *    snippet list (各 row 折りたたみ式 expanded detail panel)
 *    各 card: weight dot + title + 抜粋 + meta (業務 / 分類 / 記録日 / 案件 ID)
 *    Click で 8 項目 frontmatter 詳細展開 (JP label primary + snake_case sub-caption + 本文)
 *  - Sticky footer: ダッシュボード戻り link + 検証用 caption
 *
 * 規範 (CR R37+R40+R44+R46+R47 paradigm):
 *  - enum value は shared label helper 経由 (SendBackCategory + Weight)、raw enum identifier UI 露出禁止
 *  - JP label primary (11px) + snake_case sub-caption (9px mono) dual display (R46 paradigm)
 *  - staging → 未承認、compiled approved → 承認済 (Tier 1 語彙)、citation → 引用根拠
 *  - StrictMode setState 直接 closure 形式優先 (R46 bug fix)
 *  - data_error category snippet には「AI 引用対象外」badge (§4.9 #9、§9.2 defensive)
 *  - 国際送金 (restricted boundary pack) は mock-knowledge.ts に含めない
 *  - JSDoc / JSX comment 内の internal SSOT 参照 (snake_case schema field 名等) は keep
 */

const WORKFLOW_LABEL: Record<string, string> = {
  'UC-BO-01': '法人住所変更',
  'UC-BO-02': '口座開設書類完備',
}

export function KnowledgeBrowser() {
  const [workflowFilter, setWorkflowFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<'all' | SendBackCategory>('all')
  const [weightFilter, setWeightFilter] = useState<'all' | Weight>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Filter + sort by date DESC (newest first)
  const filteredSnippets = useMemo(() => {
    const filtered = mockKnowledge.filter((s) => {
      if (workflowFilter !== 'all' && s.workflowId !== workflowFilter) return false
      if (categoryFilter !== 'all' && s.category !== categoryFilter) return false
      if (weightFilter !== 'all' && s.weight !== weightFilter) return false
      return true
    })
    return [...filtered].sort((a, b) => (a.date > b.date ? -1 : 1))
  }, [workflowFilter, categoryFilter, weightFilter])

  // CR R46 paradigm: StrictMode setState 直接 closure 形式 (function-form は dev で double-invoke される)
  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  // weight 別 count (footer summary 用)
  const counts = useMemo(() => {
    return {
      high: filteredSnippets.filter((s) => s.weight === 'high').length,
      medium: filteredSnippets.filter((s) => s.weight === 'medium').length,
      low: filteredSnippets.filter((s) => s.weight === 'low').length,
    }
  }, [filteredSnippets])

  return (
    <div className="flex h-full flex-col bg-[var(--color-canvas)]">
      {/* === Sticky PageHeader === */}
      <header className="border-b border-slate-200 bg-white px-6 py-3">
        <nav aria-label="breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500">
          <Link to="/dashboard" className="hover:text-slate-700">
            ダッシュボード
          </Link>
          <ChevronRight className="h-3 w-3" aria-hidden="true" />
          <span className="text-slate-700">ナレッジ</span>
        </nav>
        <div className="mt-1.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-slate-900">ナレッジ</h1>
            <span className="inline-flex items-center rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
              全期間 (検証用)
            </span>
            <span className="font-mono text-[10px] text-slate-500 tabular">
              {filteredSnippets.length} 件 ({KNOWLEDGE_WEIGHT_STYLE.high.shortLabel} {counts.high} · {KNOWLEDGE_WEIGHT_STYLE.medium.shortLabel} {counts.medium} · {KNOWLEDGE_WEIGHT_STYLE.low.shortLabel} {counts.low})
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
          {/* SSOT framing 注: weight semantics + citation governance */}
          <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-[12px] leading-relaxed text-slate-700">
            <div className="flex items-start gap-2.5">
              <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-slate-900">
                  ナレッジは <span className="font-mono text-[11px]">{KNOWLEDGE_WEIGHT_STYLE.high.shortLabel} / {KNOWLEDGE_WEIGHT_STYLE.medium.shortLabel} / {KNOWLEDGE_WEIGHT_STYLE.low.shortLabel}</span> の 3 段階で管理されます
                </p>
                <p className="mt-0.5 text-slate-600">
                  AI が <strong>引用根拠</strong> として使えるのは <strong>{KNOWLEDGE_WEIGHT_STYLE.high.shortLabel}</strong> ナレッジのみです。{KNOWLEDGE_WEIGHT_STYLE.medium.shortLabel} / {KNOWLEDGE_WEIGHT_STYLE.low.shortLabel} は AI 提案の補助 (未承認ヒント) としては可視ですが、引用根拠 にはなりません。
                </p>
              </div>
            </div>
          </div>

          {/* 分類 + 重要度 filter chip row */}
          <section
            aria-labelledby="kb-filter"
            className="rounded-lg border border-slate-200 bg-white p-4"
          >
            <h2 id="kb-filter" className="sr-only">
              絞り込み
            </h2>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2.5">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-medium text-slate-700">分類:</span>
                <button
                  type="button"
                  onClick={() => setCategoryFilter('all')}
                  className={cn(
                    'rounded-md px-2 py-0.5 text-[11px] transition-colors',
                    categoryFilter === 'all'
                      ? 'bg-[var(--color-primary-soft)] text-[var(--color-primary)]'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  )}
                  aria-pressed={categoryFilter === 'all'}
                >
                  全分類
                </button>
                {(Object.keys(SENDBACK_CATEGORY_LABELS) as SendBackCategory[]).map((cat) => {
                  const isActive = cat === categoryFilter
                  const isDisabled = KNOWLEDGE_CATEGORY_DISABLED[cat]
                  // CR R49 M3: data_error は staging から除外 SSOT (DOC-KNW-04 §4.5)、
                  // 本一覧では disabled chip + title note で根拠提示、active 系 4 分類のみ filter 動作。
                  const button = (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        if (isDisabled) return
                        setCategoryFilter(cat)
                      }}
                      disabled={isDisabled}
                      className={cn(
                        'rounded-md px-2 py-0.5 text-[11px] transition-colors',
                        isDisabled
                          ? 'cursor-not-allowed bg-slate-50 text-slate-400'
                          : isActive
                            ? 'bg-[var(--color-primary-soft)] text-[var(--color-primary)]'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      )}
                      aria-pressed={isActive}
                      aria-disabled={isDisabled}
                    >
                      {getSendbackCategoryLabel(cat)}
                    </button>
                  )
                  return isDisabled ? (
                    <span
                      key={cat}
                      title="入力誤りは個別差戻し時に処理するため、本一覧の対象外 (DOC-KNW-04 §4.5)"
                    >
                      {button}
                    </span>
                  ) : (
                    button
                  )
                })}
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-medium text-slate-700">重要度:</span>
                <button
                  type="button"
                  onClick={() => setWeightFilter('all')}
                  className={cn(
                    'rounded-md px-2 py-0.5 text-[11px] transition-colors',
                    weightFilter === 'all'
                      ? 'bg-[var(--color-primary-soft)] text-[var(--color-primary)]'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  )}
                  aria-pressed={weightFilter === 'all'}
                >
                  全段階
                </button>
                {(['high', 'medium', 'low'] as Weight[]).map((w) => {
                  const isActive = w === weightFilter
                  const ws = KNOWLEDGE_WEIGHT_STYLE[w]
                  return (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setWeightFilter(w)}
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] transition-colors',
                        isActive
                          ? 'bg-[var(--color-primary-soft)] text-[var(--color-primary)]'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      )}
                      aria-pressed={isActive}
                    >
                      <span
                        className={cn('inline-block h-1.5 w-1.5 rounded-full', ws.dotClass)}
                        aria-hidden="true"
                      />
                      {ws.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </section>

          {/* Snippet list */}
          <section
            aria-labelledby="kb-list"
            className="rounded-lg border border-slate-200 bg-white"
          >
            <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
              <div>
                <h2 id="kb-list" className="text-sm font-semibold text-slate-900">
                  ナレッジ一覧
                </h2>
                <p className="mt-1 text-[11px] text-slate-500">
                  記録日が新しい順、行を選択すると 8 項目 詳細展開
                </p>
              </div>
              <span className="font-mono text-[10px] text-slate-500 tabular">
                {filteredSnippets.length} 件
              </span>
            </div>
            {filteredSnippets.length === 0 ? (
              <div className="px-5 py-12 text-center text-[12px] text-slate-500">
                該当するナレッジはありません。絞り込み条件を変更してください。
              </div>
            ) : (
              <ol className="divide-y divide-slate-100">
                {filteredSnippets.map((snippet) => {
                  const isExpanded = snippet.id === expandedId
                  const ws = KNOWLEDGE_WEIGHT_STYLE[snippet.weight]
                  const isDataError = snippet.category === 'data_error'
                  return (
                    <li key={snippet.id}>
                      <button
                        type="button"
                        onClick={() => toggleExpand(snippet.id)}
                        className={cn(
                          'flex w-full items-start gap-3 px-5 py-3 text-left transition-colors',
                          isExpanded ? 'bg-slate-50' : 'hover:bg-slate-50/50'
                        )}
                        aria-expanded={isExpanded}
                      >
                        <span
                          className={cn(
                            'mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full',
                            ws.dotClass
                          )}
                          aria-hidden="true"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                            <span className="text-[12px] font-semibold text-slate-900">
                              {snippet.title}
                            </span>
                            <span
                              className={cn(
                                'inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium',
                                ws.badgeClass
                              )}
                            >
                              {ws.label}
                            </span>
                            {isDataError && (
                              <span className="inline-flex items-center gap-0.5 rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-medium text-slate-700">
                                <AlertCircle className="h-3 w-3" aria-hidden="true" />
                                AI 引用対象外
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-[12px] leading-relaxed text-slate-700 line-clamp-2">
                            {snippet.body}
                          </p>
                          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 font-mono text-[10px] text-slate-500 tabular">
                            <span>{snippet.date}</span>
                            <span aria-hidden="true">·</span>
                            <span>{WORKFLOW_LABEL[snippet.workflowId]}</span>
                            <span aria-hidden="true">·</span>
                            <span>{getSendbackCategoryLabel(snippet.category)} (5 分類)</span>
                            <span aria-hidden="true">·</span>
                            <span>{snippet.sourceCase}</span>
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
                      {isExpanded && <DetailPanel snippet={snippet} />}
                    </li>
                  )
                })}
              </ol>
            )}
          </section>
        </div>
      </div>

      {/* === Sticky footer === */}
      <footer className="border-t border-slate-200 bg-white px-6 py-3">
        <div className="flex items-center justify-between gap-3">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          >
            ダッシュボードに戻る
          </Link>
          <span className="font-mono text-[10px] text-slate-400 tabular">
            未承認 → 提案レビューへの送付は次の実装段階で対応
          </span>
        </div>
      </footer>
    </div>
  )
}

/** Expanded panel: 8 項目 frontmatter 詳細 (JP label primary + snake_case sub-caption) + 本文 */
function DetailPanel({ snippet }: { snippet: KnowledgeSnippet }) {
  const ws = KNOWLEDGE_WEIGHT_STYLE[snippet.weight]
  const agentName = getAgentById(snippet.agentId)?.name ?? snippet.agentId
  return (
    <div className="border-t border-slate-100 bg-slate-50/30 px-5 py-4">
      <div className="mb-3 flex items-center gap-2">
        <h3 className="text-[11px] font-semibold text-slate-700">
          ナレッジ詳細 (8 項目)
        </h3>
        <span className="font-mono text-[10px] text-slate-500 tabular">
          DOC-ROOT-_SSOT §1.4
        </span>
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium',
            ws.chipClass
          )}
        >
          {snippet.weight === 'high' ? (
            <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
          ) : (
            <CircleDashed className="h-3 w-3" aria-hidden="true" />
          )}
          {ws.label}
        </span>
      </div>
      <dl className="grid grid-cols-1 gap-x-6 gap-y-2 text-[11px] sm:grid-cols-2">
        <DetailRow label="ナレッジ ID" schemaKey="id" value={snippet.id} />
        <DetailRow label="記録日" schemaKey="date" value={snippet.date} />
        <DetailRow
          label="業務"
          schemaKey="workflow_id + workflow_slug"
          value={`${WORKFLOW_LABEL[snippet.workflowId]} · ${snippet.workflowId}`}
        />
        <DetailRow
          label="Agent"
          schemaKey="agent_id + agent_version"
          value={`${agentName} · ${snippet.agentVersion}`}
        />
        <DetailRow
          label="元 案件"
          schemaKey="source_case"
          value={snippet.sourceCase}
          note="関連画面への遷移は次の実装段階で対応"
        />
        <DetailRow
          label="分類"
          schemaKey="category"
          value={`${getSendbackCategoryLabel(snippet.category)} (5 分類)`}
        />
        <DetailRow
          label="重要度"
          schemaKey="weight"
          value={ws.label}
          note={
            snippet.weight === 'high'
              ? 'AI の引用根拠として使用可'
              : 'AI の引用根拠 対象外 (未承認ヒントとしては可視)'
          }
        />
        <DetailRow
          label="ファイル"
          schemaKey="source_path"
          value={formatKnowledgeSourceLabel(snippet.weight, snippet.date)}
          wide
        />
      </dl>
      {/* 本文 (markdown 体裁 = 段落 + 改行保持、CR R50 M3 で 3 段 nested card → border-t flat divider に圧縮、AuditTrail / Metrics expanded panel density と整合) */}
      <div className="mt-4 border-t border-slate-200 pt-3">
        <div className="mb-1.5 flex items-center gap-2">
          <span className="text-[11px] font-medium text-slate-700">本文</span>
          <span className="font-mono text-[9px] text-slate-400 tabular">body</span>
        </div>
        <p className="whitespace-pre-wrap text-[12px] leading-relaxed text-slate-800">
          {snippet.body}
        </p>
      </div>
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
        <div className="font-mono text-[11px] text-slate-800 tabular break-all">{value}</div>
        {note && <div className="mt-0.5 text-[10px] text-slate-500">{note}</div>}
      </dd>
    </div>
  )
}
