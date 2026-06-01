import { LoadingState } from './LoadingState'
import { ErrorState } from './ErrorState'

/**
 * DetailDemoFallback — detail route の取得状態 (loading/error) 縮退ビュー (F-009、list の DataTable status と対称)。
 * `useDetailDemo()` の status を受け、取得中 skeleton / 取得失敗 ErrorState+再試行 を一貫表示する。
 */
export function DetailDemoFallback({ status, onRetry }: { status: 'loading' | 'error'; onRetry: () => void }) {
  if (status === 'loading') {
    return (
      <div className="p-4">
        <LoadingState variant="skeleton" rowCount={6} />
      </div>
    )
  }
  return (
    <div className="flex h-full items-center justify-center p-8">
      <ErrorState title="データの取得に失敗しました" onRetry={onRetry} />
    </div>
  )
}
