import { useState } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { ChevronRight, Send, X, Sparkles, Users } from 'lucide-react'
import { cn } from '@/lib/cn'
import { getProposalById } from '@/data/mock-proposals'
import { ProposalLifecycleStepper } from '@/components/proposal/ProposalLifecycleStepper'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { DisabledAction } from '@/components/shared/DisabledAction'
import { DetailDrawer } from '@/components/shared/DetailDrawer'
import { NextActionStrip } from '@/components/shared/NextActionStrip'
import { PageFooter } from '@/components/shared/PageFooter'
import { DiffPreviewBlock } from '@/components/shared/DiffPreviewBlock'
import { MetadataStrip } from '@/components/shared/MetadataStrip'
import { proposalStatusToTone } from '@/lib/status-tones'
import type { ProposalSourceCase } from '@/data/types'

/**
 * 差戻し category (5-category enum 中 data_error 除外、§DOC-KNW-04 §4.5) を UI 表示文言に変換。
 * Day 12.4 CR R31 M3: ProposalReview 元案件 row に同種差戻し pattern を視覚化、判定基準 panel の「共通 pattern 一致度」を補完。
 */
const categoryLabel: Record<ProposalSourceCase['category'], string> = {
  misunderstanding: '誤読',
  ui_change: 'UI 差異',
  edge_case: '境界条件',
  judgment_gap: '判断境界',
}

/**
 * ProposalReview — Hero 2 (Demo Chapter 2 主画面、手順承認 loop)、Day 12 Page 2 wireframe
 *
 * SSOT:
 *  - docs/03-ui-prototype-design.md §4.5 + §2.7 (Operational Premium Light)
 *  - docs/02 §3 (手順承認 RACI: Proposal source = AI / R = Manual 管理者 / A = 業務責任者 / SoD: Queue owner ≠ Approver)
 *  - docs/04 §4 Compiled 昇格 logic (同種差戻し 3+ 件 / 共通 pattern 確認可 / staging 内部矛盾なし [仮説 / 要検証])
 *
 * Layout (CaseReview visual grammar 継承):
 *  - PageHeader (sticky): breadcrumb (受信トレイ › AI 提案レビュー › {proposal_id}) + h1 提案 title + workflow chip + status badge + 経過 + 提案ソース annotation + ProposalLifecycleStepper (整理 → 承認 → 反映、Day 12.4 CR R31 M1)
 *  - 3-column main body:
 *     左 (3/12): 判定基準 + 元案件 一覧 (caseId + 差戻し分類 chip JP / Day 12.4 CR R31 M3) + 未承認ヒント (元 staging snippets、引用根拠 対象外 panel inset)
 *     中 (6/12): summary + 提案 差分 sections (target file + § section + 変更前 / 変更後、border-l-2 hairline + tint /20、文書テキスト差分 明示 / Day 12.4 CR R31 M2)
 *     右 (3/12): RACI box (提案ソース / R · 整理担当 / A · 承認 / C · 相談 / I · 情報共有 + 職務分離 (SoD) note、JP-only / Day 12.4 CR R31 B1+B2+B3) + 提案メタ情報
 *  - Footer (sticky): status-conditional disabled actions (CR R28 lesson)、差戻し / 業務責任者へ送付 buttons に per-button JP tooltip (Day 12.4 CR R31 M5、Hero 2 demo climax 説明)
 *  - Prototype mode label は AppShell 経由
 *
 * CR R28 lesson 適用:
 *  - filter / sort chip は detail view に置かない (Inbox queue 専用)
 *  - 主要 action は disabled state、primary indigo + opacity-60、secondary outline + opacity-70 で visual hierarchy 保持
 *  - row / link focus visibility は global `:focus-visible` (index.css L73-77) に委譲
 */
export function ProposalReview() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  // Day 19 Commit 3b U-6: Demo Chapter 2 提案レビュー scene のみ drawer default open (Cluster 2 Q1 採用)
  // F-8 Wave 4 PR 4 Commit 10: `?demo=1` query gate 廃止、drawerOpen initial を true に変更 (gate2-decision.md F-8 案 A)
  // `isDemo` flag は backward compat で残置 (将来の NextActionStrip branching 等で使用予定、Day 19 U-13 既存実装は別 prop で実現済のため本変数は現状未参照)
  void searchParams.get('demo')
  const [drawerOpen, setDrawerOpen] = useState<boolean>(true)
  /**
   * F-2 Wave 2 PR 2 Commit 4: 業務責任者へ送付 button metadata gate (gate1-decision.md F-2-B 採用 spec)。
   * MetadataStrip (PageHeader 直下、placement='header') が viewport visible になった瞬間 ack、
   * ack 前の 送付 button は disabled、user に metadata 確認を強制。
   */
  const [metadataAcked, setMetadataAcked] = useState(false)
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
      <header
        data-page-header
        className="sticky top-0 z-30 min-h-[var(--height-pageheader)] border-b border-slate-200 bg-white px-6 py-3"
      >
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
            <StatusBadge tone={proposalStatusToTone(p.status)} label={p.statusLabel} className="shrink-0" />
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <span className="font-mono text-[11px] text-slate-500 tabular">経過 {p.elapsedLabel}</span>
          </div>
        </div>

        {/* Proposal source annotation */}
        <div className="mt-2.5 flex items-center gap-2 text-[11px] text-slate-600">
          <Sparkles className="h-3 w-3 text-[var(--color-primary)]" aria-hidden="true" />
          <span>
            提案ソース: <span className="font-medium text-slate-800">{p.raci.proposalSource}</span>
            <span className="text-slate-500"> · 判断根拠は左の判定基準 + 元案件 を参照</span>
          </span>
        </div>

        {/* ProposalLifecycleStepper (Day 12.4 CR R31 M1: CaseReview LifecycleStepper grammar 継承) */}
        <div className="mt-2.5">
          <ProposalLifecycleStepper status={p.status} />
        </div>
      </header>

      {/* === Day 19 Commit 3c U-13: NextActionStrip (summary mode、actionHref=null、L1 anchor は提案 summary、primary CTA は footer 業務責任者へ送付) === */}
      {/* v1.3 lock: `met` → `達成` paraphrase、Commit 4 grep scope と整合 */}
      <NextActionStrip
        label="提案要約"
        summary={`元案件 ${p.sourceCases.length} 件、判定基準 ${p.decisionCriteria.filter((d) => d.met).length}/${p.decisionCriteria.length} 達成、提案差分 ${p.proposedDiff.length} ファイル`}
        actionHref={null}
      />

      {/* === Day 19 Commit 3b U-6: 2-column main work area (4/12 + 8/12)、RACI + メタは DetailDrawer 化 === */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 gap-4 p-4 lg:grid-cols-12">
          {/* Left: 判定基準 + source case + staging === 4/12 (Day 19 Commit 3b 拡大) */}
          <section className="space-y-3 lg:col-span-4">
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

            {/* 元 案件 */}
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-900">元 案件</h2>
                <span className="font-mono text-[10px] text-slate-500">{p.sourceCases.length} 件</span>
              </div>
              <ul className="space-y-3">
                {p.sourceCases.map((sc) => (
                  <li key={sc.caseId} className="text-xs">
                    <div className="flex items-center gap-1.5">
                      <Link
                        to={`/cases/${sc.caseId}`}
                        className="inline-flex items-center gap-1 font-mono font-medium text-[var(--color-primary)] tabular hover:underline"
                      >
                        {sc.caseId}
                      </Link>
                      <span
                        className="inline-flex items-center rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-700"
                        title="差戻し分類 (同種傾向の根拠)"
                      >
                        {categoryLabel[sc.category]}
                      </span>
                    </div>
                    <p className="mt-0.5 text-slate-700">{sc.title}</p>
                    <p className="mt-0.5 text-[10px] leading-relaxed text-slate-500">{sc.sendbackReason}</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Day 19 Commit 4 U-9: 未承認ヒント — 引用根拠 対象外 (raw `citation` → 引用根拠 paraphrase) */}
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-900">未承認ヒント</h2>
                <span className="inline-flex items-center rounded bg-slate-200 px-1.5 py-0.5 font-mono text-[10px] text-slate-700">
                  引用根拠 対象外
                </span>
              </div>
              <p className="mb-2 text-[10px] leading-relaxed text-slate-500">
                本提案を支える未承認ナレッジ。承認後、正式手順 (承認済) に昇格予定。
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

          {/* Middle: summary + proposed diff === 8/12 (Day 19 Commit 3b 拡大、Hero 主役化) */}
          <section className="space-y-3 lg:col-span-8">
            {/* Day 19 Commit 3b U-6: DetailDrawer trigger (RACI + 提案メタ情報、右 column 廃止後の access path) */}
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                aria-expanded={drawerOpen}
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                <Users className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
                提案詳細を見る (RACI + メタ情報)
              </button>
            </div>
            {/* F-2 Wave 2 PR 2 Commit 4: ProposalReview MetadataStrip placement='header' (gate1-decision.md F-2-B spec)
              * 提案メタ (Change author=AI 日次分析 v1.2 / Reason=人手上書き率 / Confidence=0.81 / Affected scope=12 cases / Reversibility) を PageHeader 直下に配置、業務責任者へ送付 button gate trigger */}
            {(() => {
              const meta = p.proposedDiff.find((d) => d.changeAuthor || d.changeReason)
              const aggregateConfidence =
                p.decisionCriteria.find((c) => /pattern|一致/.test(c.label))?.value
              const confidenceNum = aggregateConfidence ? parseFloat(aggregateConfidence) : undefined
              if (!meta) return null
              return (
                <MetadataStrip
                  changeAuthor={meta.changeAuthor}
                  changeReason={meta.changeReason}
                  confidence={Number.isFinite(confidenceNum) ? confidenceNum : undefined}
                  affectedScope={meta.affectedScope}
                  reversibility={meta.reversibility}
                  placement="header"
                  onAck={() => setMetadataAcked(true)}
                />
              )
            })()}

            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="mb-2 flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-slate-900">
                  提案 差分 (変更前 / 変更後)
                  <span className="ml-2 font-mono text-[10px] font-normal text-slate-500">· 文書テキスト差分 (住所の行内差分とは別)</span>
                </h2>
                <span className="shrink-0 font-mono text-[10px] text-slate-500">{p.proposedDiff.length} ファイル</span>
              </div>
              <p className="mb-4 text-xs leading-relaxed text-slate-700">{p.summary}</p>

              {/* F-2 Wave 2 PR 2 Commit 4: DiffPreviewBlock (gate1-decision.md F-2-B 採用 spec)
                * defaultView='sideBySide' + availableViews=['sideBySide','inline']、proposedDiff を structured object として渡す */}
              <DiffPreviewBlock
                source={{ kind: 'sections', sections: p.proposedDiff }}
                defaultView="sideBySide"
                availableViews={['sideBySide', 'inline']}
              />
            </div>
          </section>

          {/* Day 19 Commit 3b U-6: 右 column (RACI + メタ情報) は廃止、`<DetailDrawer>` 内に移動 (page bottom) */}
        </div>
      </div>

      {/* === Day 19 Commit 3b U-6: DetailDrawer (RACI 5-row + 提案メタ 4-row、Demo Chapter 2 提案レビュー scene default open) === */}
      <DetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="提案詳細 (RACI + メタ情報)"
        width="480"
      >
        <div className="space-y-4">
          <section>
            <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-slate-900">
              <Users className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
              RACI
            </h3>
            <dl className="space-y-2.5 text-xs">
              <div>
                <dt className="text-[11px] text-slate-500">提案ソース</dt>
                <dd className="mt-0.5 font-medium text-slate-800">{p.raci.proposalSource}</dd>
              </div>
              <div>
                <dt className="text-[11px] text-slate-500">R · 整理担当</dt>
                <dd className="mt-0.5 font-medium text-slate-800">{p.raci.r}</dd>
                <dd className="mt-0.5 text-[10px] text-slate-500">{p.queueOwner}</dd>
              </div>
              <div>
                <dt className="text-[11px] text-slate-500">A · 承認</dt>
                <dd className="mt-0.5 font-medium text-slate-800">{p.raci.a}</dd>
                <dd className="mt-0.5 text-[10px] text-slate-500">{p.approver}</dd>
              </div>
              <div>
                <dt className="text-[11px] text-slate-500">C · 相談</dt>
                <dd className="mt-0.5 text-slate-700">{p.raci.c.join(' / ')}</dd>
              </div>
              <div>
                <dt className="text-[11px] text-slate-500">I · 情報共有</dt>
                <dd className="mt-0.5 text-slate-700">{p.raci.i.join(' / ')}</dd>
              </div>
            </dl>
            <p className="mt-3 border-t border-slate-100 pt-2 text-[10px] leading-relaxed text-slate-500">
              職務分離 (SoD): 整理担当 ≠ 承認者 (同一人物化禁止、Type A 既定)
            </p>
          </section>

          <section className="border-t border-slate-100 pt-4">
            <h3 className="mb-3 text-sm font-semibold text-slate-900">提案メタ情報</h3>
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
          </section>
        </div>
      </DetailDrawer>

      {/* === Sticky bottom action bar (Day 14 P1.5 C4: PageFooter primitive 経由、Day 12 wireframe では disabled) === */}
      <PageFooter
        left={
          <span className="text-xs text-slate-500">
            <span className="font-medium text-slate-700">{p.raci.r}:</span>{' '}
            提案を整理し、業務責任者へ送付するか差戻しを判断してください
          </span>
        }
        right={
          <>
            {/* Day 18.5 Commit 2: CR R32+R38 wrapper span title pattern を <DisabledAction mode="wrapper"> に SSOT 化 */}
            {/* Day 19 Commit 4 U-16: free-floating span 完全削除、per-button specific reason に SSOT 集約 */}
            <DisabledAction
              mode="wrapper"
              reason="差戻し動作は次の実装段階で対応 (差戻し理由をコメント付きで AI 日次分析にフィードバック)"
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-medium text-slate-400 opacity-70"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
              差戻し
            </DisabledAction>
            <DisabledAction
              mode="wrapper"
              reason={
                metadataAcked
                  ? `業務責任者送付動作は次の実装段階で対応 (業務責任者 ${p.approver} の承認者承認待ちへ転送、変更メタデータ確認済)`
                  : `画面上部の変更メタデータを確認してください (F-2 metadata gate)。送付動作自体は次の実装段階で対応`
              }
              className="inline-flex items-center gap-1.5 rounded-md bg-[var(--color-primary)] px-3.5 py-1.5 text-xs font-medium text-white opacity-60"
            >
              <Send className="h-3.5 w-3.5" />
              業務責任者へ送付
            </DisabledAction>
          </>
        }
      />
    </div>
  )
}
