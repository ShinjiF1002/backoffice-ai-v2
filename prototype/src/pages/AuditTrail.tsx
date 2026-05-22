/**
 * AuditTrail — 9 画面の 1 つ
 * Day 11 placeholder。Audit evidence event model 15-row timeline を Day 14-18 で実装。
 * SSOT: docs/03-ui-prototype-design.md §4.7 + docs/04-knowledge-pipeline.md §8
 *
 * Alert UI 適用範囲 2: 承認済み過去 case の関連ルール更新履歴 timeline 表示
 */
export function AuditTrail() {
  return (
    <div className="mx-auto max-w-7xl p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">監査証跡</h1>
        <p className="mt-1 text-sm text-slate-500">
          Audit evidence event model (15 行) + 過去 case 関連ルール更新履歴
        </p>
      </div>
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-12 text-center">
        <p className="text-sm text-slate-500">
          Day 11 skeleton — filter chip + event timeline + expanded event panel + 過去 case Alert UI 適用範囲 2 を Day 14-18 で実装
        </p>
      </div>
    </div>
  )
}
