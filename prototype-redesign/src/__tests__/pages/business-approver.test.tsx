import { renderHook, act, render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import type { Dispatch } from 'react'
import { StoreProvider } from '@/store/StoreProvider'
import { AgentDetail } from '@/pages/AgentDetail'
import type { StoreAction } from '@/store/types'
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

  it('useEscalations: escalate で queue 入り、裁定 (case/sendback) で queue closure (F2 regression)', () => {
    const { result } = renderHook(
      () => ({ esc: useEscalations(), dispatch: useStoreDispatch() }),
      { wrapper: StoreProvider },
    )
    expect(result.current.esc.length).toBe(0) // seed では escalation 0
    act(() =>
      result.current.dispatch({ type: 'case/escalate', id: 'CASE-2026-0142', reason: '判断困難', category: 'judgment_gap', to: 'actor-approver' }),
    )
    expect(result.current.esc.some((c) => c.id === 'CASE-2026-0142')).toBe(true)
    // 業務責任者が裁定 = case/sendback (ready→sent-back) → active queue から消える (裁定済が残り続けない)
    act(() => result.current.dispatch({ type: 'case/sendback', id: 'CASE-2026-0142', reason: '要件不足', category: 'judgment_gap' }))
    expect(result.current.esc.some((c) => c.id === 'CASE-2026-0142')).toBe(false)
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

describe('AgentDetail 承認者 mode (W2c/P1-3、F3 regression)', () => {
  // dispatch を render 中に capture し、act() で setup action を流す (store 事前 seed)。
  function renderAgentDetail(id: string) {
    let dispatch!: Dispatch<StoreAction>
    function Capture() {
      dispatch = useStoreDispatch()
      return null
    }
    render(
      <MemoryRouter initialEntries={[`/agents/${id}`]}>
        <StoreProvider>
          <Capture />
          <Routes>
            <Route path="/agents/:id" element={<AgentDetail />} />
          </Routes>
        </StoreProvider>
      </MemoryRouter>,
    )
    return dispatch
  }

  it('業務責任者 (owner) は未申請時に「設定変更を申請」を出さない (F3: 申請は manual のみ)', () => {
    // agent-account-opening = 全 KPI 達成 = manual なら申請ボタン活性 variant。owner では出てはいけない。
    const dispatch = renderAgentDetail('agent-account-opening')
    act(() => dispatch({ type: 'session/switchActor', actorId: 'actor-approver' }))
    expect(screen.queryByRole('button', { name: '設定変更を申請' })).not.toBeInTheDocument()
    expect(screen.getByText('承認待ちの設定変更はありません')).toBeInTheDocument()
  })

  it('owner + 昇格申請中 (別 actor 申請) は設定承認/差戻しを出し、承認は活性 (非自己)', () => {
    const dispatch = renderAgentDetail('agent-account-opening')
    // 入力者として申請 (requestedBy=actor-inputter) → 業務責任者へ切替
    act(() => dispatch({ type: 'agent/requestPromotion', id: 'agent-account-opening' }))
    act(() => dispatch({ type: 'session/switchActor', actorId: 'actor-approver' }))
    expect(screen.getByRole('button', { name: '設定承認' })).toBeEnabled()
    expect(screen.getByRole('button', { name: '差戻し' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '設定変更を申請' })).not.toBeInTheDocument()
  })
})
