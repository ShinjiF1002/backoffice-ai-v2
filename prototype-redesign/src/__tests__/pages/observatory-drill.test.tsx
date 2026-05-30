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

  it('証跡台帳: 横断 ledger に複数案件が出て、案件 ID が drill link、業務 filter が効く (P1-7b)', async () => {
    const user = userEvent.setup()
    renderObservatory()
    await user.click(screen.getByRole('button', { name: '証跡台帳 (詳細)' }))
    // 横断: 口座開設 (0112) も法人住所変更 (0145、top ラベルの 0142 とは別) も ledger 行に出る
    expect(screen.getAllByRole('link', { name: /CASE-2026-0112/ }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: /CASE-2026-0145/ }).length).toBeGreaterThan(0)
    // 業務 filter: 口座開設書類完備 → 法人住所変更 case (0145) が ledger から消える、口座開設 (0112) は残る
    await user.click(screen.getByRole('button', { name: '口座開設書類完備' }))
    expect(screen.queryByRole('link', { name: /CASE-2026-0145/ })).not.toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /CASE-2026-0112/ }).length).toBeGreaterThan(0)
  })

  it('証跡台帳: free-text 検索で案件を絞り込む (P1-7b)', async () => {
    const user = userEvent.setup()
    renderObservatory()
    await user.click(screen.getByRole('button', { name: '証跡台帳 (詳細)' }))
    await user.type(screen.getByRole('searchbox', { name: '証跡台帳を検索' }), 'CASE-2026-0112')
    expect(screen.getAllByRole('link', { name: /CASE-2026-0112/ }).length).toBeGreaterThan(0)
    expect(screen.queryByRole('link', { name: /CASE-2026-0145/ })).not.toBeInTheDocument()
  })
})
