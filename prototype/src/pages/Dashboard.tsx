/**
 * Dashboard — 9 画面の 1 つ
 * Day 11 placeholder。Day 14-18 で medium-fi → high-fi。
 * SSOT: docs/03-ui-prototype-design.md §4.0 (Dashboard Screen Card)
 */
export function Dashboard() {
  return (
    <div className="mx-auto max-w-7xl p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">ダッシュボード</h1>
        <p className="mt-1 text-sm text-slate-500">
          UC-BO-01 法人住所変更 + UC-BO-02 口座開設書類完備 の並列カード (Day 14-18 で実装)
        </p>
      </div>
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-12 text-center">
        <p className="text-sm text-slate-500">Day 11 skeleton — 詳細は Day 14-18 で実装</p>
      </div>
    </div>
  )
}
