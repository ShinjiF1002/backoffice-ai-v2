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

  it('証跡台帳: 横断 ledger に複数案件が drill link、業務 filter で page reset & 絞り込み (P1-7b + W3 G2)', async () => {
    const user = userEvent.setup()
    renderObservatory()
    await user.click(screen.getByRole('button', { name: '証跡台帳 (詳細)' }))
    // 横断: page 1 に複数案件 (0142 / 0145、いずれも法人) が drill link で出る
    expect(screen.getAllByRole('link', { name: /CASE-2026-0142/ }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: /CASE-2026-0145/ }).length).toBeGreaterThan(0)
    // 業務 filter: 口座開設 → 法人 case (0145) が消え、口座 (0112) が page 1 に出る
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

  it('証跡台帳: action FilterChip で操作種別を絞る (W3 G2)', async () => {
    const user = userEvent.setup()
    renderObservatory()
    await user.click(screen.getByRole('button', { name: '証跡台帳 (詳細)' }))
    // field_override は 0142 のみが持つ操作 → 0142 だけ残り、他 case (0145) は消える
    await user.click(screen.getByRole('button', { name: 'field_override' }))
    expect(screen.getAllByRole('link', { name: /CASE-2026-0142/ }).length).toBeGreaterThan(0)
    expect(screen.queryByRole('link', { name: /CASE-2026-0145/ })).not.toBeInTheDocument()
  })

  it('証跡台帳: pagination で別ページに遷移し 0142 が消える、filter で page 1 に戻る (W3 G2)', async () => {
    const user = userEvent.setup()
    renderObservatory()
    await user.click(screen.getByRole('button', { name: '証跡台帳 (詳細)' }))
    expect(screen.getAllByRole('link', { name: /CASE-2026-0142/ }).length).toBeGreaterThan(0) // page 1 に 0142
    await user.click(screen.getByRole('button', { name: '次へ' }))
    expect(screen.queryByRole('link', { name: /CASE-2026-0142/ })).not.toBeInTheDocument() // page 2 では消える
    await user.click(screen.getByRole('button', { name: '全業務' })) // filter 変更で page reset
    expect(screen.getAllByRole('link', { name: /CASE-2026-0142/ }).length).toBeGreaterThan(0) // page 1 に戻る
  })
})
