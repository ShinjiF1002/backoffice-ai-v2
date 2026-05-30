import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { StoreProvider } from '@/store/StoreProvider'
import { ViewProvider } from '@/context/ViewProvider'
import App from '@/App'

// P1-5 — loading/error 状態の到達可能化 (state-coverage)。
// hidden QA seam: list route に `?demo=loading` / `?demo=error` を付与すると発火 (default OFF、demo chrome 非汚染)。
// 再現手順 (browser proof / roadmap closure と一致): /cases?demo=loading, /cases?demo=error。
function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <StoreProvider>
        <ViewProvider>
          <App />
        </ViewProvider>
      </StoreProvider>
    </MemoryRouter>,
  )
}

describe('P1-5: loading/error が hidden seam (?demo) で到達可能', () => {
  it('?demo=loading → skeleton が出て案件行は出ない', () => {
    renderAt('/cases?demo=loading')
    expect(screen.getByRole('status', { name: '読み込み中' })).toBeInTheDocument()
    expect(screen.queryAllByText('CASE-2026-0142')).toHaveLength(0) // loading 中は行なし
    // 取得状態に操作 UI を残さない (CR: filter chip 非表示)
    expect(screen.queryByRole('button', { name: '受付済' })).not.toBeInTheDocument()
  })

  it('?demo=error → ErrorState + 再試行で ready に回復', async () => {
    const user = userEvent.setup()
    renderAt('/cases?demo=error')

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '再試行' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '受付済' })).not.toBeInTheDocument() // filter 非表示

    await user.click(screen.getByRole('button', { name: '再試行' }))

    // 再試行 → ready に回復し案件行が出る (既定 UC-BO-01)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getAllByText('CASE-2026-0142').length).toBeGreaterThan(0)
  })

  it('?demo 無し (既定) は同期 ready で通常表示 (seam が既存挙動を変えない)', () => {
    renderAt('/cases')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.queryByRole('status', { name: '読み込み中' })).not.toBeInTheDocument()
    expect(screen.getAllByText('CASE-2026-0142').length).toBeGreaterThan(0)
  })
})
