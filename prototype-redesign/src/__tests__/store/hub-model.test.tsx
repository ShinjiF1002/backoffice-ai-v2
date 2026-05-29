import { renderHook } from '@testing-library/react'
import { StoreProvider } from '@/store/StoreProvider'
import { useHubModel } from '@/store/hooks'
import { clearPersisted } from '@/store/persist'
import { seed } from '@/store/seed'

// Phase 4b R1 — Hub を store から派生 (approval / attention / process total・dist)。
// SLA は datetime 化未整備のため static 仮説維持 (派生 scope 外)。
// 判断C (口座 case 追加) defer のため UC-BO-02 は空 = store-truth の正直な姿。
describe('useHubModel (Phase 4b R1)', () => {
  beforeEach(() => clearPersisted())

  it('approval KPI / process total を store から算出', () => {
    const { result } = renderHook(() => useHubModel(), { wrapper: StoreProvider })
    const s = seed()
    const baw = s.caseOrder.filter((id) => s.cases[id].status === 'business-approval-waiting').length

    expect(result.current.headline.find((k) => k.key === 'approval')!.total).toBe(baw)
    // 全 CASE_LIST は法人住所変更 (UC-BO-01) → total = seed 件数、UC-BO-02 は空 (判断C defer)
    expect(result.current.processes.find((p) => p.id === 'UC-BO-01')!.total).toBe(s.caseOrder.length)
    expect(result.current.processes.find((p) => p.id === 'UC-BO-02')!.total).toBe(0)
  })

  it('SLA KPI は static 仮説維持 (R1、派生しない)', () => {
    const { result } = renderHook(() => useHubModel(), { wrapper: StoreProvider })
    expect(result.current.headline.find((k) => k.key === 'sla')!.hypothetical).toBe(true)
  })

  it('attention KPI は ready + sent-back の合算', () => {
    const { result } = renderHook(() => useHubModel(), { wrapper: StoreProvider })
    const s = seed()
    const expected = s.caseOrder
      .map((id) => s.cases[id])
      .filter((c) => c.status === 'ready' || c.status === 'sent-back').length
    expect(result.current.headline.find((k) => k.key === 'attention')!.total).toBe(expected)
  })
})
