/**
 * Metrics — 9 画面の 1 つ
 * Day 11 placeholder。4 KPI multi-criteria 仮説 gate + 7 KPI + 9 KRI を Day 14-18 で実装。
 * SSOT: docs/03-ui-prototype-design.md §4.8 + docs/05-metrics-and-gates.md
 *
 * 重要: PageHeader 直下に「本番導入可否を判定する gate ではない、Phase 1 で測定・再設定する検証仮説」注を必ず表示
 */
export function Metrics() {
  return (
    <div className="mx-auto max-w-7xl p-8">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold text-slate-900">メトリクス</h1>
        <p className="mt-1 text-sm text-slate-500">
          4 KPI multi-criteria 仮説 gate + 7 KPI catalogue + 9 KRI catalogue
        </p>
      </div>

      {/* 仮説 gate framing 注 (Plan v1.4 P0-2 / v1.4.1 Fix 2 必須) */}
      <div className="mb-6 rounded-md border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed text-slate-700">
        <strong className="font-medium text-slate-900">注:</strong> 本画面に表示される閾値はすべて
        <code className="mx-1 rounded bg-white px-1.5 py-0.5 font-mono text-[11px] text-slate-700">[仮説 / 要検証]</code>
        です。本番導入可否を判定する gate ではなく、Phase 1 で測定・再設定する検証仮説。Session 4 で示す数値は target hypothesis であり実績値ではない。
      </div>

      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-12 text-center">
        <p className="text-sm text-slate-500">
          Day 11 skeleton — 4 KPI card + 7 KPI + 9 KRI + sparkline trend を Day 14-18 で実装
        </p>
      </div>
    </div>
  )
}
