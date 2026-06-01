import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'

/**
 * useDetailDemo — detail route の取得状態 (loading/error) を到達可能にする demo seam (F-009、useListData の detail 版)。
 *
 * list route の `useListData` と対称: 既定 (query 無し) は status=undefined で既存挙動不変。
 * `?demo=loading` → 取得中 skeleton / `?demo=error` → ErrorState + 再試行 (retried で回復)。
 * store domain state ではなく「取得の非同期性」ゆえ store 契約は非 touch (S8 境界)。
 *
 * 再現: 任意の detail route に `?demo=loading` / `?demo=error` を付与 (例 `/cases/CASE-2026-0142?demo=error`)。
 */
export function useDetailDemo(): { status: 'loading' | 'error' | undefined; onRetry: () => void } {
  const [searchParams] = useSearchParams()
  const [retried, setRetried] = useState(false)
  const demo = searchParams.get('demo')
  const onRetry = () => setRetried(true)
  if (!retried && demo === 'loading') return { status: 'loading', onRetry }
  if (!retried && demo === 'error') return { status: 'error', onRetry }
  return { status: undefined, onRetry }
}
