import { useParams } from 'react-router-dom'

/**
 * ProposalReview — 9 画面の 1 つ
 * Day 11 placeholder。AI 日次分析 → Procedure Update Proposal の手順承認 UI を Day 14-18 で実装。
 * SSOT: docs/03-ui-prototype-design.md §4.5
 */
export function ProposalReview() {
  const { id } = useParams()
  return (
    <div className="mx-auto max-w-7xl p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">AI 提案レビュー</h1>
        <p className="mt-1 font-mono text-xs text-slate-500">提案 {id}</p>
      </div>
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-12 text-center">
        <p className="text-sm text-slate-500">
          Day 11 skeleton — Procedure Update Proposal (元 staging 一覧 + 提案 diff + 承認 / 差戻し / 修正) を Day 14-18 で実装
        </p>
      </div>
    </div>
  )
}
