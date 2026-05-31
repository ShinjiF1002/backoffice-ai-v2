import { render } from '@testing-library/react'
import { axe } from 'jest-axe'
import { MemoryRouter } from 'react-router-dom'
import { StoreProvider } from '@/store/StoreProvider'
import { ViewProvider } from '@/context/ViewProvider'
import App from '@/App'

// W3 §4.2 G9/G11 — 15 route 全画面 axe smoke (構造 a11y: role/label/name/landmark/dup-id)。
// 注: jest-axe (jsdom) は color-contrast を評価しない (layout/canvas 不在で silent skip) → 本 gate は構造 a11y のみを担保し、
//     contrast は AR1/R7 token + check-design が別途担保する (over-claim しない)。
//     実 app context (AppShell + page) で render する = 静的近似でなく design-test-fidelity。
const ROUTES: string[] = [
  '/',
  '/cases',
  '/approvals',
  '/cases/new', // W3 C4
  '/cases/CASE-2026-0142',
  '/proposals',
  '/proposals/PROP-2026-031',
  '/agents',
  '/agents/agent-corporate-address-change',
  '/observatory',
  '/search',
  '/inbox',
  '/business-approver',
  '/config-approvals',
  '/escalations',
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

describe('W3 G9/G11 — 15 route 全画面 axe smoke (構造 a11y)', () => {
  it.each(ROUTES)('%s に axe violations がない', async (path) => {
    const { container } = renderAt(path)
    expect(await axe(container)).toHaveNoViolations()
  })
})
