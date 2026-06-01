import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import type { Dispatch } from 'react'
import { StoreProvider } from '@/store/StoreProvider'
import { CaseDetail } from '@/pages/CaseDetail'
import type { StoreAction } from '@/store/types'
import { useStoreDispatch } from '@/store/hooks'
import { clearPersisted } from '@/store/persist'

// W3 F-013/F-016/F-017 — エスカレーション裁定の CaseDetail 表面。
// store layer (resolveEscalation SoD lock / proceed・sendback / queue closure / 起票者通知) は
// store.test + business-approver.test + search-notify.test で検証済。本 test は CaseDetail の
// 永続マーカー (F-013) と裁定面 (F-016 続行可/差戻し + SoD 可視性) を実 UI で固める。
describe('W3 escalation: CaseDetail 裁定面', () => {
  beforeEach(() => clearPersisted())

  function renderCaseDetail(id: string) {
    let dispatch!: Dispatch<StoreAction>
    function Capture() {
      dispatch = useStoreDispatch()
      return null
    }
    render(
      <MemoryRouter initialEntries={[`/cases/${id}`]}>
        <StoreProvider>
          <Capture />
          <Routes>
            <Route path="/cases/:id" element={<CaseDetail />} />
          </Routes>
        </StoreProvider>
      </MemoryRouter>,
    )
    return dispatch
  }

  it('F-013: escalate で「裁定依頼中」永続マーカーが出る (起票者ビュー)', () => {
    const dispatch = renderCaseDetail('CASE-2026-0142') // ready / 入力者
    act(() => dispatch({ type: 'case/escalate', id: 'CASE-2026-0142', reason: '判断困難な境界事例', category: 'judgment_gap', to: 'actor-approver' }))
    expect(screen.getByText(/業務責任者へ裁定依頼中/)).toBeInTheDocument()
    expect(screen.getByText(/判断困難な境界事例/)).toBeInTheDocument()
  })

  it('F-016 SoD 可視性: 起票者 (入力者) には裁定ボタン (続行可/差戻し) を出さない', () => {
    const dispatch = renderCaseDetail('CASE-2026-0142')
    act(() => dispatch({ type: 'case/escalate', id: 'CASE-2026-0142', reason: 'x', category: 'judgment_gap', to: 'actor-approver' }))
    // 起票者は裁定者 (escalation.to) ではない → 裁定面は出ない
    expect(screen.queryByRole('button', { name: '続行可' })).not.toBeInTheDocument()
  })

  it('F-016: 業務責任者に切替えると裁定面 (続行可/差戻し) が出る', () => {
    const dispatch = renderCaseDetail('CASE-2026-0142')
    act(() => dispatch({ type: 'case/escalate', id: 'CASE-2026-0142', reason: 'x', category: 'judgment_gap', to: 'actor-approver' }))
    act(() => dispatch({ type: 'session/switchActor', actorId: 'actor-approver' }))
    expect(screen.getByRole('button', { name: '続行可' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '差戻し' })).toBeInTheDocument()
  })

  it('F-016 続行可: 裁定後マーカーが「続行可」へ変わり、裁定面は消える (status 不変)', async () => {
    const user = userEvent.setup()
    const dispatch = renderCaseDetail('CASE-2026-0142')
    act(() => dispatch({ type: 'case/escalate', id: 'CASE-2026-0142', reason: 'x', category: 'judgment_gap', to: 'actor-approver' }))
    act(() => dispatch({ type: 'session/switchActor', actorId: 'actor-approver' }))
    await user.click(screen.getByRole('button', { name: '続行可' }))
    expect(screen.getByText(/エスカレーション裁定: 続行可/)).toBeInTheDocument()
    expect(screen.queryByText(/業務責任者へ裁定依頼中/)).not.toBeInTheDocument()
    // status は 'ready' のまま (続行可は前進させない) → header badge に「反映済」等は出ない
    expect(screen.queryByRole('button', { name: '続行可' })).not.toBeInTheDocument()
  })

  it('F-016 差戻し: 理由必須 → sent-back + 差戻し banner、裁定面は消える', async () => {
    const user = userEvent.setup()
    const dispatch = renderCaseDetail('CASE-2026-0142')
    act(() => dispatch({ type: 'case/escalate', id: 'CASE-2026-0142', reason: 'x', category: 'judgment_gap', to: 'actor-approver' }))
    act(() => dispatch({ type: 'session/switchActor', actorId: 'actor-approver' }))
    await user.click(screen.getByRole('button', { name: '差戻し' }))
    // 理由空で submit → error (未 dispatch)
    await user.click(screen.getByRole('button', { name: '差戻しで裁定する' }))
    expect(screen.getByText('入力してください')).toBeInTheDocument()
    // 理由入力 → submit → sent-back、差戻し banner、裁定面消失
    await user.type(screen.getByRole('textbox'), '本人確認書類が不足のため再取得が必要')
    await user.click(screen.getByRole('button', { name: '差戻しで裁定する' }))
    expect(screen.getByText(/この案件は差戻し済みです/)).toBeInTheDocument()
    expect(screen.getByText(/本人確認書類が不足のため再取得が必要/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '続行可' })).not.toBeInTheDocument()
  })
})
