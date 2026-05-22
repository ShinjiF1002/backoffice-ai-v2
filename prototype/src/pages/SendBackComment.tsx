import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

/**
 * SendBackComment — 9 画面の 1 つ (CaseReview の子 detail route、10 番目ではない)
 * SSOT: docs/03-ui-prototype-design.md §4.3
 *
 * Day 11 placeholder。差戻し 5-category 選択 + コメント入力 UI を Day 14-18 で実装。
 */
export function SendBackComment() {
  const { id } = useParams()
  const navigate = useNavigate()
  return (
    <div className="mx-auto max-w-3xl p-8">
      <button
        onClick={() => navigate(`/cases/${id}`)}
        className="mb-4 inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        案件処理に戻る
      </button>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">差戻しコメント</h1>
        <p className="mt-1 font-mono text-xs text-slate-500">案件 {id}</p>
      </div>
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-12 text-center">
        <p className="text-sm text-slate-500">
          Day 11 skeleton — 5-category 選択 (misunderstanding / ui_change / edge_case / judgment_gap / data_error) + コメント入力 + 送信、Day 14-18 で実装
        </p>
      </div>
    </div>
  )
}
