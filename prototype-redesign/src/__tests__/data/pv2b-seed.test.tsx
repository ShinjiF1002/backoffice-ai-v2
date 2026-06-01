import { renderHook } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { StoreProvider } from '@/store/StoreProvider'
import { useEscalations, usePendingPromotions, useNotifications } from '@/store/hooks'
import { PROPOSAL_LIST } from '@/data/mock-proposal-list'

/**
 * PV2b 薄画面 seed の gate (reset-premised)。
 * renderHook + StoreProvider は fresh seed() で動く = localStorage 非依存の reset 状態。
 * 旗艦の薄画面 (/escalations・config-approvals/業務責任者ハブ・/notifications・/proposals 却下 filter) を駆動する
 * selector / list に seed が live で出ることを機械確認する (「reset 後に該当画面へ表示される」gate)。
 * 画面 render 自体の no-crash は smoke/routes.test が 15 route で別途担保。
 */
describe('PV2b 薄画面 seed — reset 状態 (fresh seed) で表示される', () => {
  it('/escalations: 未裁定 escalation が複数・業務横断 (初期 1 → 複数で queue/triage が成立)', () => {
    const { result } = renderHook(() => useEscalations(), { wrapper: StoreProvider })
    expect(result.current.length).toBeGreaterThanOrEqual(4)
    const workflows = new Set(result.current.map((c) => c.workflowName))
    expect(workflows.size).toBeGreaterThanOrEqual(3) // 業務横断 (法人住所/口座振替/改印届/カード再発行)
  })

  it('config-approvals / 業務責任者ハブ: 設定承認 (昇格申請) が 1 件 live (空タイル解消)', () => {
    const { result } = renderHook(() => usePendingPromotions(), { wrapper: StoreProvider })
    expect(result.current.length).toBe(1)
    expect(result.current[0]!.id).toBe('agent-direct-debit')
  })

  it('/notifications (既定 = 入力者 山田太郎): escalation-resolved + sendback が live', () => {
    const { result } = renderHook(() => useNotifications(), { wrapper: StoreProvider })
    expect(result.current.some((n) => n.kind === 'escalation-resolved')).toBe(true)
    expect(result.current.filter((n) => n.kind === 'sendback').length).toBeGreaterThanOrEqual(2) // PV2a 0131/0232
  })

  it('/proposals: 却下 (rejected) status の proposal が存在 (却下 filter chip 到達可能)', () => {
    expect(PROPOSAL_LIST.filter((p) => p.status === 'rejected').length).toBeGreaterThanOrEqual(1)
  })
})
