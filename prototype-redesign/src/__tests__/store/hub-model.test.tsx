import { renderHook } from '@testing-library/react'
import { StoreProvider } from '@/store/StoreProvider'
import { useHubModel } from '@/store/hooks'
import { clearPersisted } from '@/store/persist'
import { seed } from '@/store/seed'

// Phase 4b R1 / remediation B3 — Hub を store から派生 (approval / attention / process total・dist)。
// SLA は datetime 化未整備のため static 仮説維持 (派生 scope 外)。
// 口座開設 (UC-BO-02) 5 件が正規 CASE_LIST 入り (B3 業務追加) → UC-BO-02 total が 0→5 に実体化。
// total/dist は HUB_PROCESSES から物理削除済 = useHubModel が唯一の算出 source (drift 不能、型で強制)。
describe('useHubModel (Phase 4b R1 / B3)', () => {
  beforeEach(() => clearPersisted())

  it('approval KPI / process total を store から算出 (UC-BO-01/02 とも workflowId filter 数式)', () => {
    const { result } = renderHook(() => useHubModel(), { wrapper: StoreProvider })
    const s = seed()
    const baw = s.caseOrder.filter((id) => s.cases[id].status === 'business-approval-waiting').length
    const uc01 = s.caseOrder.filter((id) => s.cases[id].workflowId === 'UC-BO-01').length
    const uc02 = s.caseOrder.filter((id) => s.cases[id].workflowId === 'UC-BO-02').length

    expect(result.current.headline.find((k) => k.key === 'approval')!.total).toBe(baw)
    // process total は workflowId 別の実数 (UC-BO-01 = 法人住所変更、UC-BO-02 = 口座開設 5 件)
    expect(result.current.processes.find((p) => p.id === 'UC-BO-01')!.total).toBe(uc01)
    expect(result.current.processes.find((p) => p.id === 'UC-BO-02')!.total).toBe(uc02)
    expect(uc02).toBe(5) // B3 契約: 口座開設 5 件 (0→5、監査 UC-BO-02 空破綻の解消)
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
