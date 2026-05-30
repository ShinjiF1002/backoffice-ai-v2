import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { StoreProvider } from '@/store/StoreProvider'
import { ViewProvider } from '@/context/ViewProvider'
import App from '@/App'

// P1-1 — ProcessSelector → ViewContext 配線の behavioral gate。
// 業務選択が全画面の list filter (useCases/useApprovals/useProposals/useAgents) に伝播することを実 route で検証。
// CASE-2026-0142 = 法人住所変更 (UC-BO-01) / CASE-2026-0112 = 口座開設書類完備 (UC-BO-02)。
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

describe('P1-1: ProcessSelector が /cases の list filter に伝播する', () => {
  // DataTable は responsive で desktop/mobile 二重 render するため getAllByText で件数を見る。
  it('既定 (UC-BO-01) は法人住所変更のみ、口座開設は非表示', () => {
    renderAt('/cases')
    expect(screen.getAllByText('CASE-2026-0142').length).toBeGreaterThan(0) // UC-BO-01
    expect(screen.queryAllByText('CASE-2026-0112')).toHaveLength(0) // UC-BO-02 は除外
  })

  it('口座開設書類完備 に切替 → 口座開設のみ、法人住所変更は非表示', async () => {
    const user = userEvent.setup()
    renderAt('/cases')

    await user.click(screen.getByRole('button', { name: '法人住所変更' })) // ProcessSelector trigger
    await user.click(screen.getByRole('option', { name: '口座開設書類完備' }))

    expect(screen.getAllByText('CASE-2026-0112').length).toBeGreaterThan(0) // UC-BO-02
    expect(screen.queryAllByText('CASE-2026-0142')).toHaveLength(0) // UC-BO-01 は除外
  })

  it('全業務 に切替 → 両業務の案件が表示', async () => {
    const user = userEvent.setup()
    renderAt('/cases')

    await user.click(screen.getByRole('button', { name: '法人住所変更' }))
    await user.click(screen.getByRole('option', { name: '全業務' }))

    expect(screen.getAllByText('CASE-2026-0142').length).toBeGreaterThan(0) // UC-BO-01
    expect(screen.getAllByText('CASE-2026-0112').length).toBeGreaterThan(0) // UC-BO-02
  })
})
