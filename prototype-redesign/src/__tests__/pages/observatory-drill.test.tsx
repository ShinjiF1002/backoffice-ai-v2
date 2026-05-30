import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { StoreProvider } from '@/store/StoreProvider'
import { Observatory } from '@/pages/Observatory'

// P1-7a — Observatory drill 導線 (monitoring dead-end 解消)。case ID → case detail / 未達 KPI → 該当 Agent。

function renderObservatory() {
  return render(
    <MemoryRouter>
      <StoreProvider>
        <Observatory />
      </StoreProvider>
    </MemoryRouter>,
  )
}

describe('P1-7a Observatory drill', () => {
  it('監査 tab: 対象 case ID が case detail へ drill する link', () => {
    renderObservatory()
    expect(screen.getByRole('link', { name: 'CASE-2026-0142' })).toHaveAttribute('href', '/cases/CASE-2026-0142')
  })

  it('メトリクス tab: 未達 KPI が該当 Agent へ drill する link (達成 KPI は非リンク)', async () => {
    const user = userEvent.setup()
    renderObservatory()
    await user.click(screen.getByRole('button', { name: 'メトリクス' }))
    // 法人住所変更の「AI 入力承認率」= 未達 → agent drill link (口座開設の同名 KPI は達成=非リンクなので link は 1 つ)
    expect(screen.getByRole('link', { name: 'AI 入力承認率' })).toHaveAttribute('href', '/agents/agent-corporate-address-change')
  })
})
