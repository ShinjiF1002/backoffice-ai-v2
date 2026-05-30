import { renderHook, act } from '@testing-library/react'
import { StoreProvider } from '@/store/StoreProvider'
import {
  useForwardedProposals,
  usePendingPromotions,
  useEscalations,
  useBusinessApproverInbox,
  useStoreDispatch,
} from '@/store/hooks'

// W2c/P1-3 — 業務責任者 3 受け口 selector + escalate flow の wiring gate。
// (approvePromotion SoD no-op / sendbackPromotion / escalate 格納 は store.test で検証済。)

describe('W2c/P1-3 業務責任者 selector', () => {
  it('useForwardedProposals: proposal/forward で forwarded が queue に入る', () => {
    const { result } = renderHook(
      () => ({ forwarded: useForwardedProposals(), dispatch: useStoreDispatch() }),
      { wrapper: StoreProvider },
    )
    const before = result.current.forwarded.length
    act(() => result.current.dispatch({ type: 'proposal/forward', id: 'PROP-2026-031' }))
    expect(result.current.forwarded.some((p) => p.id === 'PROP-2026-031')).toBe(true)
    expect(result.current.forwarded.length).toBe(before + 1)
  })

  it('usePendingPromotions: requestPromotion で昇格申請が queue に入る', () => {
    const { result } = renderHook(
      () => ({ pending: usePendingPromotions(), dispatch: useStoreDispatch() }),
      { wrapper: StoreProvider },
    )
    act(() => result.current.dispatch({ type: 'agent/requestPromotion', id: 'agent-corporate-address-change' }))
    expect(result.current.pending.some((a) => a.id === 'agent-corporate-address-change')).toBe(true)
  })

  it('useEscalations: case/escalate された案件が受信 queue に入る', () => {
    const { result } = renderHook(
      () => ({ esc: useEscalations(), dispatch: useStoreDispatch() }),
      { wrapper: StoreProvider },
    )
    expect(result.current.esc.length).toBe(0) // seed では escalation 0
    act(() =>
      result.current.dispatch({ type: 'case/escalate', id: 'CASE-2026-0142', reason: '判断困難', category: 'judgment_gap', to: 'actor-approver' }),
    )
    expect(result.current.esc.some((c) => c.id === 'CASE-2026-0142')).toBe(true)
  })

  it('useBusinessApproverInbox: 3 受け口 (手順承認/設定承認/escalation) を集約', () => {
    const { result } = renderHook(
      () => ({ inbox: useBusinessApproverInbox(), dispatch: useStoreDispatch() }),
      { wrapper: StoreProvider },
    )
    act(() => {
      result.current.dispatch({ type: 'proposal/forward', id: 'PROP-2026-031' })
      result.current.dispatch({ type: 'agent/requestPromotion', id: 'agent-corporate-address-change' })
      result.current.dispatch({ type: 'case/escalate', id: 'CASE-2026-0142', reason: 'x', category: 'judgment_gap', to: 'actor-approver' })
    })
    expect(result.current.inbox.forwardedProposals.length).toBeGreaterThan(0)
    expect(result.current.inbox.pendingPromotions.length).toBeGreaterThan(0)
    expect(result.current.inbox.escalations.length).toBeGreaterThan(0)
  })
})
