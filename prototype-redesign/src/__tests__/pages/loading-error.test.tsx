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

// SKIP (route-swap、意図的簡素化): v2 は in-memory 同期で fetch を伴わず loading/error 状態が発生しない。
// ?demo seam は v1 の取得縮退デモ機構で v2 に存在しない (偽の loading/error UI を作らない = honest)。
describe.skip('P1-5: loading/error が hidden seam (?demo) で到達可能', () => {
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
    // F-026: 取得失敗の body と矛盾する header 件数を出さない (`· N 件` が消える)
    expect(screen.queryByText(/· \d+ 件/)).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '再試行' }))

    // 再試行 → ready に回復し案件行 + header 件数が出る (既定 UC-BO-01)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getAllByText('CASE-2026-0142').length).toBeGreaterThan(0)
    expect(screen.getByText(/· \d+ 件/)).toBeInTheDocument()
  })

  it('F-026: /approvals?demo=error で header 件数と caption が body の取得失敗と矛盾しない', () => {
    renderAt('/approvals?demo=error')
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.queryByText(/· \d+ 件/)).not.toBeInTheDocument() // header 件数なし
    expect(screen.queryByText(/「修正済」は入力者が/)).not.toBeInTheDocument() // caption 非表示
  })

  it('?demo 無し (既定) は同期 ready で通常表示 (seam が既存挙動を変えない)', () => {
    renderAt('/cases')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.queryByRole('status', { name: '読み込み中' })).not.toBeInTheDocument()
    expect(screen.getAllByText('CASE-2026-0142').length).toBeGreaterThan(0)
  })

  // F-009: ?demo seam を全 list route で一貫配線 (以前 no-op だった escalations / config-approvals / inbox)。
  it.each(['/escalations', '/config-approvals', '/inbox'])('%s?demo=error で ErrorState が出る (旧 no-op 解消)', (path) => {
    renderAt(`${path}?demo=error`)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('F-009: detail route (/cases/:id?demo=error) も取得縮退する', async () => {
    const user = userEvent.setup()
    renderAt('/cases/CASE-2026-0142?demo=error')
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '再試行' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '再試行' }))
    // 回復で detail 本文 (案件 ID) が出る
    expect(screen.getAllByText('CASE-2026-0142').length).toBeGreaterThan(0)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
