import { useParams, Link } from 'react-router-dom'
import { ChevronRight, Send, X, Sparkles, Users } from 'lucide-react'
import { cn } from '@/lib/cn'
import { getProposalById } from '@/data/mock-proposals'

/**
 * ProposalReview — Hero 2 (Demo Chapter 2 主画面、手順承認 loop)、Day 12 Page 2 wireframe
 *
 * SSOT:
 *  - docs/03-ui-prototype-design.md §4.5 + §2.7 (Operational Premium Light)
 *  - docs/02 §3 (手順承認 RACI: Proposal source = AI / R = Manual 管理者 / A = 業務責任者 / SoD: Queue owner ≠ Approver)
 *  - docs/04 §4 Compiled 昇格 logic (同種差戻し 3+ 件 / 共通 pattern 確認可 / staging 内部矛盾なし [仮説 / 要検証])
 *
 * Layout (CaseReview visual grammar 継承):
 *  - PageHeader (sticky): breadcrumb (受信トレイ › AI 提案レビュー › {proposal_id}) + h1 提案 title + workflow chip + status badge + 経過 + Proposal source annotation
 *  - 3-column main body:
 *     左 (3/12): 判定基準 + source case 一覧 + 元 staging snippets (citation 対象外 panel inset)
 *     中 (6/12): summary + proposed diff sections (target file + § section + before/after color coded)
 *     右 (3/12): RACI box (Proposal source / R / A / C / I + SoD note) + 提案 metadata
 *  - Footer (sticky): status-conditional actions (Day 12 wireframe では disabled state、CR R28 lesson: enabled no-op 複製禁止)
 *  - Prototype mode label は AppShell 経由
 *
 * CR R28 lesson 適用:
 *  - filter / sort chip は detail view に置かない (Inbox queue 専用)
 *  - 主要 action は disabled state、primary indigo + opacity-60、secondary outline + opacity-70 で visual hierarchy 保持
 *  - row / link focus visibility は global `:focus-visible` (index.css L73-77) に委譲
 */
export function ProposalReview() {
  const { id } = useParams()
  const p = getProposalById(id || '')

  if (!p) {
    return (
      <div className="p-8">
        <p className="text-sm text-slate-500">提案 {id} が見つかりません。</p>
        <Link to="/inbox" className="mt-3 inline-block text-sm font-medium text-[var(--color-primary)] hover:underline">
          受信トレイに戻る
        </Link>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col bg-[var(--color-canvas)]">
      {/* === Header (breadcrumb + meta + Proposal source annotation) === */}
      <header className="border-b border-slate-200 bg-white px-6 py-3">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500">
          <Link to="/inbox" className="hover:text-slate-700">受信トレイ</Link>
          <ChevronRight className="h-3 w-3" aria-hidden="true" />
          <span className="text-slate-700">AI 提案レビュー</span>
          <ChevronRight className="h-3 w-3" aria-hidden="true" />
          <span className="font-mono text-slate-700 tabular">{p.id}</span>
        </nav>

        {/* Title row */}
        <div className="mt-1.5 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <h1 className="truncate text-lg font-semibold text-slate-900">{p.proposalTitle}</h1>
            <span className="shrink-0 inline-flex items-center rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
              {p.workflowName}
            </span>
            <span className="shrink-0 inline-flex items-center rounded-md bg-[var(--color-primary-soft)] px-2 py-0.5 text-xs font-medium text-[var(--color-primary)]">
              {p.statusLabel}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <span className="font-mono text-[11px] text-slate-500 tabular">経過 {p.elapsedLabel}</span>
          </div>
        </div>

        {/* Proposal source annotation */}
        <div className="mt-2.5 flex items-center gap-2 text-[11px] text-slate-600">
          <Sparkles className="h-3 w-3 text-[var(--color-primary)]" aria-hidden="true" />
          <span>
            Proposal source: <span className="font-medium text-slate-800">{p.raci.proposalSource}</span>
            <span className="text-slate-500"> · 判断根拠は左 panel の 判定基準 + 元 case を参照</span>
          </span>
        </div>
      </header>

      {/* === 3-column main work area === */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 gap-4 p-4 lg:grid-cols-12">
          {/* Left: 判定基準 + source case + staging === 3/12 */}
          <section className="space-y-3 lg:col-span-3">
            {/* 判定基準 */}
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <h2 className="mb-3 text-sm font-semibold text-slate-900">判定基準</h2>
              <ul className="space-y-2">
                {p.decisionCriteria.map((d) => (
                  <li key={d.label} className="text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-slate-600">{d.label}</span>
                      <span
                        className={cn(
                          'font-mono font-medium tabular',
                          d.met ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'
                        )}
                      >
                        {d.value}
                      </span>
                    </div>
                    <p className="mt-0.5 font-mono text-[10px] text-slate-400">基準: {d.threshold}</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* source case */}
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-900">元 case</h2>
                <span className="font-mono text-[10px] text-slate-500">{p.sourceCases.length} 件</span>
              </div>
              <ul className="space-y-3">
                {p.sourceCases.map((sc) => (
                  <li key={sc.caseId} className="text-xs">
                    <Link
                      to={`/cases/${sc.caseId}`}
                      className="inline-flex items-center gap-1 font-mono font-medium text-[var(--color-primary)] tabular hover:underline"
                    >
                      {sc.caseId}
                    </Link>
                    <p className="mt-0.5 text-slate-700">{sc.title}</p>
                    <p className="mt-0.5 text-[10px] leading-relaxed text-slate-500">{sc.sendbackReason}</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* staging snippets (citation 対象外、CaseReview StagingHintPanel と register 統一) */}
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-900">未承認ヒント</h2>
                <span className="inline-flex items-center rounded bg-slate-200 px-1.5 py-0.5 font-mono text-[10px] text-slate-700">
                  citation 対象外
                </span>
              </div>
              <p className="mb-2 text-[10px] leading-relaxed text-slate-500">
                本提案を支える未承認 staging knowledge。承認後 compiled に昇格予定。
              </p>
              <ul className="space-y-2.5">
                {p.stagingSnippets.map((s) => (
                  <li key={s.knowledgeId} className="text-xs">
                    <div className="flex items-start gap-1.5">
                      <span
                        className={cn(
                          'mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full',
                          s.weight === 'medium' ? 'bg-[var(--color-alert)]' : 'bg-slate-400'
                        )}
                        aria-hidden="true"
                      />
                      <span className="font-medium text-slate-800">{s.title}</span>
                    </div>
                    <p className="mt-1 text-[10px] leading-relaxed text-slate-600">{s.excerpt}</p>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Middle: summary + proposed diff === 6/12 */}
          <section className="lg:col-span-6">
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-900">提案 diff (変更前 / 変更後)</h2>
                <span className="font-mono text-[10px] text-slate-500">{p.proposedDiff.length} ファイル</span>
              </div>
              <p className="mb-4 text-xs leading-relaxed text-slate-700">{p.summary}</p>

              <div className="space-y-4">
                {p.proposedDiff.map((d, i) => (
                  <div key={i} className="overflow-hidden rounded-md border border-slate-200">
                    <div className="border-b border-slate-200 bg-slate-50 px-3 py-2">
                      <p className="font-mono text-[11px] text-slate-600 tabular">{d.targetFile}</p>
                      <p className="mt-0.5 text-[11px] font-medium text-slate-900">{d.section}</p>
                    </div>
                    {/* 変更前 */}
                    <div className="border-b border-slate-100 bg-red-50/40 p-3">
                      <p className="mb-1 text-[10px] font-medium tracking-wide text-[var(--color-error)]">
                        − 変更前
                      </p>
                      <p className="text-xs leading-relaxed text-slate-700">{d.before}</p>
                    </div>
                    {/* 変更後 */}
                    <div className="bg-emerald-50/40 p-3">
                      <p className="mb-1 text-[10px] font-medium tracking-wide text-[var(--color-success)]">
                        ＋ 変更後
                      </p>
                      <p className="text-xs leading-relaxed text-slate-700">{d.after}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Right: RACI + metadata === 3/12 */}
          <section className="space-y-3 lg:col-span-3">
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                <Users className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
                RACI
              </h2>
              <dl className="space-y-2.5 text-xs">
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-wide text-slate-500">Proposal source</dt>
                  <dd className="mt-0.5 font-medium text-slate-800">{p.raci.proposalSource}</dd>
                </div>
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-wide text-slate-500">R · Queue owner</dt>
                  <dd className="mt-0.5 font-medium text-slate-800">{p.raci.r}</dd>
                  <dd className="mt-0.5 text-[10px] text-slate-500">{p.queueOwner}</dd>
                </div>
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-wide text-slate-500">A · Approver</dt>
                  <dd className="mt-0.5 font-medium text-slate-800">{p.raci.a}</dd>
                  <dd className="mt-0.5 text-[10px] text-slate-500">{p.approver}</dd>
                </div>
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-wide text-slate-500">C · Consult</dt>
                  <dd className="mt-0.5 text-slate-700">{p.raci.c.join(' / ')}</dd>
                </div>
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-wide text-slate-500">I · Inform</dt>
                  <dd className="mt-0.5 text-slate-700">{p.raci.i.join(' / ')}</dd>
                </div>
              </dl>
              <p className="mt-3 border-t border-slate-100 pt-2 text-[10px] leading-relaxed text-slate-500">
                SoD: Queue owner ≠ Approver (同一人物化禁止、Type A 既定)
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <h2 className="mb-3 text-sm font-semibold text-slate-900">提案 metadata</h2>
              <dl className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <dt className="text-slate-500">提案 ID</dt>
                  <dd className="font-mono font-medium text-slate-700 tabular">{p.id}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-slate-500">業務</dt>
                  <dd className="text-slate-700">{p.workflowName}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-slate-500">生成日時</dt>
                  <dd className="font-mono text-slate-700 tabular">{p.createdAt}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-slate-500">経過</dt>
                  <dd className="font-mono text-slate-700 tabular">{p.elapsedLabel}</dd>
                </div>
              </dl>
            </div>
          </section>
        </div>
      </div>

      {/* === Sticky bottom action bar (status-conditional、Day 12 wireframe では disabled) === */}
      <footer className="border-t border-slate-200 bg-white px-6 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            <span className="font-medium text-slate-700">{p.raci.r}:</span>{' '}
            提案を triage し、業務責任者へ送付するか差戻しを判断してください
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled
              aria-disabled="true"
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-medium text-slate-400 opacity-70 cursor-not-allowed"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
              差戻し
            </button>
            <button
              type="button"
              disabled
              aria-disabled="true"
              className="inline-flex items-center gap-1.5 rounded-md bg-[var(--color-primary)] px-3.5 py-1.5 text-xs font-medium text-white opacity-60 cursor-not-allowed"
            >
              <Send className="h-3.5 w-3.5" />
              業務責任者へ送付
            </button>
            <span className="ml-1 text-[10px] text-slate-400">(承認動作は次の実装段階で対応)</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
