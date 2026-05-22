/**
 * KnowledgeBrowser — 9 画面の 1 つ
 * Day 11 placeholder。staging / compiled knowledge browser + weight filter + 5-category facet を Day 14-18 で実装。
 * SSOT: docs/03-ui-prototype-design.md §4.9 + docs/04-knowledge-pipeline.md
 *
 * Governance: citation = compiled approved (high) のみ、staging (low/medium) は別 facet で視覚分離
 */
export function KnowledgeBrowser() {
  return (
    <div className="mx-auto max-w-7xl p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">ナレッジ</h1>
        <p className="mt-1 text-sm text-slate-500">
          compiled approved (引用根拠) + staging (未承認ヒント) の browser
        </p>
      </div>
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-12 text-center">
        <p className="text-sm text-slate-500">
          Day 11 skeleton — facet (weight / category / workflow) + snippet card + staging lifecycle indicator を Day 14-18 で実装
        </p>
      </div>
    </div>
  )
}
