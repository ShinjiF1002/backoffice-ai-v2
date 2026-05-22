import { useParams } from 'react-router-dom'

/**
 * AgentSettings — 9 画面の 1 つ
 * Day 11 placeholder。Agent / Model / Tool / Prompt / 権限 + boundary 変更の設定承認 UI を Day 14-18 で実装。
 * SSOT: docs/03-ui-prototype-design.md §4.6
 */
export function AgentSettings() {
  const { id } = useParams()
  return (
    <div className="mx-auto max-w-7xl p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Agent 設定</h1>
        <p className="mt-1 font-mono text-xs text-slate-500">{id}</p>
      </div>
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-12 text-center">
        <p className="text-sm text-slate-500">
          Day 11 skeleton — Agent / Model / Tool / Prompt / 権限 + 設定承認 Type A/B/C を Day 14-18 で実装
        </p>
      </div>
    </div>
  )
}
