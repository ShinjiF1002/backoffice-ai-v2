import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { StoreProvider } from '@/store/StoreProvider'
import { ViewProvider } from '@/context/ViewProvider'
import App from '@/App'

// Phase 1 — provider (StoreProvider / ViewProvider) 挿入後、9 routes が white screen せず render するか。
// main.tsx と同じ構造 (Router > Store > View > App) を MemoryRouter で再現。jsdom render レベルの smoke
// (pixel/visual ではない)。R0 Gate の coverage matrix の起点にもなる。
const ROUTES: string[] = [
  '/',
  '/cases',
  '/approvals',
  '/cases/CASE-2026-0142',
  '/proposals',
  '/proposals/PROP-2026-031',
  '/agents',
  '/agents/agent-corporate-address-change',
  '/observatory',
  '/search', // W2b/P1-2
  '/inbox', // W2b/P1-2
]

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

describe('9 routes smoke (Phase 1: provider 挿入後の no-white-screen)', () => {
  it.each(ROUTES)('%s が AppShell ごと render する (PrototypeModeLabel 表示)', (path) => {
    renderAt(path)
    // 全 route が AppShell 配下 → TopBar の prototype 表示が必ず出る = white screen でない証左
    expect(screen.getByText(/プロトタイプ表示/)).toBeInTheDocument()
  })
})
