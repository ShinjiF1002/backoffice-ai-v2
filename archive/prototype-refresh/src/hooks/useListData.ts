import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { DataTableStatus } from '@/components/shared/DataTable'

/**
 * useListData — list の取得状態 (loading/error) を到達可能にする demo seam (P1-5、AR/state-coverage)。
 *
 * 設計 (P1-5 / roadmap §3.5、CR 条件):
 * - **既定 (query 無し) は同期 'ready' で既存挙動不変** (status=undefined → DataTable が rows から empty/ready 自動判定)。
 * - **hidden QA seam**: stakeholder demo の chrome に dev affordance を出さず、URL query で QA のみ発火させる:
 *     `?demo=loading` → skeleton / `?demo=error` → ErrorState + 再試行。再試行で ready に回復 (retried)。
 * - store domain state ではなく「データ取得の非同期性」ゆえ store 契約は非 touch (S8 境界、SCHEMA bump と直交)。
 *
 * 再現手順 (browser proof / roadmap closure に記録): 任意の list route に `?demo=loading` / `?demo=error` を付与。
 *   例: `/cases?demo=loading` / `/cases?demo=error` / `/approvals?demo=error`。
 */
export function useListData<T>(rows: T[]): {
  status: DataTableStatus | undefined
  rows: T[]
  onRetry: (() => void) | undefined
} {
  const [searchParams] = useSearchParams()
  const [retried, setRetried] = useState(false)
  const demo = searchParams.get('demo')

  if (!retried && demo === 'loading') {
    return { status: 'loading', rows: [], onRetry: () => setRetried(true) }
  }
  if (!retried && demo === 'error') {
    return { status: 'error', rows: [], onRetry: () => setRetried(true) }
  }
  // 既定: 同期 ready。status 未指定で DataTable に empty/filtered-empty/ready の自動判定を委ねる。
  return { status: undefined, rows, onRetry: undefined }
}
