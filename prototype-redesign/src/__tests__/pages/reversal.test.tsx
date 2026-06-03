import { act, render, screen, renderHook } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import type { Dispatch } from 'react'
import { StoreProvider } from '@/store/StoreProvider'
import { CaseDetailV2 } from '@/v2/CaseDetailV2'
import type { StoreAction } from '@/store/types'
import { useStoreDispatch, useNotifications } from '@/store/hooks'
import { clearPersisted } from '@/store/persist'

// W3 C3 — 反映済 (terminal) の訂正/取消 affordance (前進のみ→可逆)。
// store layer (case/reverse / 不可逆 guard) は store.test 検証済。本 test は CaseDetailV2 の screen/flow
// (render + user-event + 状態遷移、hook-only でなく実 UI の役割境界・理由必須・状態反映を検証)。
describe('W3 C3 reversal: CaseDetailV2 反映済の訂正/取消', () => {
  beforeEach(() => clearPersisted())

  // dispatch を render 中に capture し act() で persona 切替 (business-approver.test と同型)。
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
            <Route path="/cases/:id" element={<CaseDetailV2 />} />
          </Routes>
        </StoreProvider>
      </MemoryRouter>,
    )
    return dispatch
  }

  it('入力者 (inputter) は反映済の訂正/取消 を出さない (役割境界: 訂正/取消は承認者の責務)', () => {
    renderCaseDetail('CASE-2026-0120') // seed の reflected、default actor = inputter
    expect(screen.queryByRole('button', { name: '訂正' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '取消' })).not.toBeInTheDocument()
  })

  it('承認者に切替えると 反映済案件に 訂正/取消 が出る', () => {
    const dispatch = renderCaseDetail('CASE-2026-0120')
    act(() => dispatch({ type: 'session/switchActor', actorId: 'actor-approver' }))
    expect(screen.getByRole('button', { name: '訂正' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '取消' })).toBeInTheDocument()
  })

  it('承認者でも 反映済でない案件 (ready) には 訂正/取消 を出さない (不可逆 guard の UI 反映)', () => {
    const dispatch = renderCaseDetail('CASE-2026-0142') // ready
    act(() => dispatch({ type: 'session/switchActor', actorId: 'actor-approver' }))
    expect(screen.queryByRole('button', { name: '訂正' })).not.toBeInTheDocument()
  })

  it('訂正: 理由必須 → reflected→sent-back + reversal banner、反映済 badge が消える', async () => {
    const user = userEvent.setup()
    const dispatch = renderCaseDetail('CASE-2026-0120')
    act(() => dispatch({ type: 'session/switchActor', actorId: 'actor-approver' }))
    expect(screen.getByText('反映済')).toBeInTheDocument() // header badge
    await user.click(screen.getByRole('button', { name: '訂正' }))
    // 理由空で submit → error、dispatch されず dialog 残る
    await user.click(screen.getByRole('button', { name: '訂正のため差し戻す' }))
    expect(screen.getByText('入力してください')).toBeInTheDocument()
    expect(screen.getByText('反映済')).toBeInTheDocument() // まだ反映済 (未 dispatch)
    // 理由入力 → submit → reflected→ready、banner 出現、反映済 badge 消失
    await user.type(screen.getByRole('textbox'), '住所の番地に誤りがあったため訂正')
    await user.click(screen.getByRole('button', { name: '訂正のため差し戻す' }))
    // F-018: banner は「…されました — 再処理が必要です」+ who/when (auditEvents 由来)。
    expect(screen.getByText(/この案件は反映済から訂正されました — 再処理が必要です/)).toBeInTheDocument()
    expect(screen.getByText(/住所の番地に誤りがあったため訂正/)).toBeInTheDocument()
    expect(screen.queryByText('反映済')).not.toBeInTheDocument()
    // F-018: 承認者ビューで取消/訂正を行った actor は currentActorId=actor-approver (業務責任者) → banner の who に出る
    expect(screen.getByText(/業務責任者/)).toBeInTheDocument()
  })

  it('取消: reflected→sent-back + reversal banner (取消、理由保持)', async () => {
    const user = userEvent.setup()
    const dispatch = renderCaseDetail('CASE-2026-0120')
    act(() => dispatch({ type: 'session/switchActor', actorId: 'actor-approver' }))
    await user.click(screen.getByRole('button', { name: '取消' }))
    await user.type(screen.getByRole('textbox'), '別案件の取り違えで誤って反映')
    await user.click(screen.getByRole('button', { name: '取消して差し戻す' }))
    expect(screen.getByText(/この案件は反映済から取消されました — 再処理が必要です/)).toBeInTheDocument()
    expect(screen.getByText(/別案件の取り違えで誤って反映/)).toBeInTheDocument()
    expect(screen.queryByText('反映済')).not.toBeInTheDocument()
  })

  it('F-018: 差戻し/取消後の sent-back は入力者が再処理でき (dead-end 解消)、reversal event に who/when が残る', async () => {
    const user = userEvent.setup()
    const dispatch = renderCaseDetail('CASE-2026-0120')
    // 承認者で取消 → sent-back
    act(() => dispatch({ type: 'session/switchActor', actorId: 'actor-approver' }))
    await user.click(screen.getByRole('button', { name: '取消' }))
    await user.type(screen.getByRole('textbox'), '誤反映の取消')
    await user.click(screen.getByRole('button', { name: '取消して差し戻す' }))
    // 入力者に切替えると「再処理する」導線が出る (dead-end でない)
    act(() => dispatch({ type: 'session/switchActor', actorId: 'actor-inputter' }))
    const reprocess = await screen.findByRole('button', { name: '再処理する' })
    expect(reprocess).toBeInTheDocument()
    await user.click(reprocess)
    // 再処理 → 確認待ちへ (banner 消失 = ready に戻った)
    expect(screen.queryByText(/再処理が必要です/)).not.toBeInTheDocument()
  })

  it('取消した案件は assignee(入力者) に reversal 通知 (差戻し受領 と区別、取消理由を保持)', () => {
    const { result } = renderHook(() => ({ notes: useNotifications(), dispatch: useStoreDispatch() }), { wrapper: StoreProvider })
    // 承認者で 0120 を取消 → 入力者 (山田太郎 = 0120 assignee) に切替えて通知確認
    act(() => result.current.dispatch({ type: 'session/switchActor', actorId: 'actor-approver' }))
    act(() => result.current.dispatch({ type: 'case/reverse', id: 'CASE-2026-0120', kind: '取消', reason: '誤反映' }))
    act(() => result.current.dispatch({ type: 'session/switchActor', actorId: 'actor-inputter' }))
    const rev = result.current.notes.find((n) => n.caseId === 'CASE-2026-0120')
    expect(rev?.kind).toBe('reversal') // 'sendback' ではない
    expect(rev?.detail).toContain('取消')
    expect(rev?.detail).toContain('誤反映')
  })
})
