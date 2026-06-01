import { render, screen, act } from '@testing-library/react'
import type { Dispatch } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { StoreProvider } from '@/store/StoreProvider'
import { ViewProvider } from '@/context/ViewProvider'
import { useStoreDispatch } from '@/store/hooks'
import type { StoreAction } from '@/store/types'
import { clearPersisted } from '@/store/persist'
import App from '@/App'

// F-025 (2nd clause) — /approvals で action を押す前に権限可否を inline 提示する (事後 toast でなく事前)。
// 既定 persona=入力者 は最終承認できず自己承認も四眼で不可 → header に事前 hint。承認者へ切替えると hint が消える。
function renderApp(path: string) {
  let dispatch!: Dispatch<StoreAction>
  function Capture() {
    dispatch = useStoreDispatch()
    return null
  }
  render(
    <MemoryRouter initialEntries={[path]}>
      <StoreProvider>
        <ViewProvider>
          <Capture />
          <App />
        </ViewProvider>
      </StoreProvider>
    </MemoryRouter>,
  )
  return () => dispatch
}

describe('F-025 Approvals 事前権限提示', () => {
  beforeEach(() => clearPersisted())

  it('既定 persona=入力者 では「最終承認は承認者の操作」inline hint を事前提示する', () => {
    renderApp('/approvals')
    expect(screen.getByText(/最終承認は承認者の操作/)).toBeInTheDocument()
    expect(screen.getByText(/自分が入力者承認した案件は承認できません/)).toBeInTheDocument()
  })

  it('承認者(checker)に切替えると事前 hint が消える (有効な承認者ゆえ dead-end でない)', () => {
    const getDispatch = renderApp('/approvals')
    act(() => getDispatch()({ type: 'session/switchActor', actorId: 'actor-checker' }))
    expect(screen.queryByText(/最終承認は承認者の操作/)).not.toBeInTheDocument()
  })
})
