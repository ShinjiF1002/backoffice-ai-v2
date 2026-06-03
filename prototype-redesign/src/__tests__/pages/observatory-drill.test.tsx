import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { MemoryRouter } from 'react-router-dom'
import { StoreProvider } from '@/store/StoreProvider'
import { ObservatoryV2 } from '@/v2/ObservatoryV2'

// P1-7a — ObservatoryV2 drill 導線 (monitoring dead-end 解消)。case ID → case detail / 未達 KPI → 該当 Agent。

function renderObservatory() {
  return render(
    <MemoryRouter>
      <StoreProvider>
        <ObservatoryV2 />
      </StoreProvider>
    </MemoryRouter>,
  )
}

describe('P1-7a ObservatoryV2 drill', () => {
  it('監査 tab: 対象 case ID が case detail へ drill する link', () => {
    renderObservatory()
    expect(screen.getByRole('link', { name: 'CASE-2026-0142' })).toHaveAttribute('href', '/cases/CASE-2026-0142')
  })

  it('メトリクス tab: 未達 KPI が該当 Agent へ drill する link (達成 KPI は非リンク)', async () => {
    const user = userEvent.setup()
    renderObservatory()
    await user.click(screen.getByRole('button', { name: 'メトリクス' }))
    // 未達業務 (法人住所変更 92% / 改印・代表者変更届 93%) の「AI 入力承認率」= agent drill link。
    // 達成業務 (口座開設/口座振替/カード再発行) の同名 KPI は非リンク (PV2a で業務 2→5)。
    const rateLinks = screen.getAllByRole('link', { name: 'AI 入力承認率' })
    expect(rateLinks).toHaveLength(2)
    const hrefs = rateLinks.map((l) => l.getAttribute('href'))
    expect(hrefs).toContain('/agents/agent-corporate-address-change')
    expect(hrefs).toContain('/agents/agent-corp-notification')
  })

  it('F-039: モデルガバナンス tab に model 台帳 + drift 監視 + SR 26-2 honest framing が出る', async () => {
    const user = userEvent.setup()
    renderObservatory()
    await user.click(screen.getByRole('button', { name: 'モデルガバナンス' }))
    // honest framing (規制準拠は主張しない)
    expect(screen.getByText(/規制準拠（compliance）を主張するものではありません/)).toBeInTheDocument()
    // model 台帳 (版 + 検証状況)
    expect(screen.getByText('モデル台帳（model inventory）')).toBeInTheDocument()
    expect(screen.getAllByText('ocr-2.4').length).toBeGreaterThan(0)
    expect(screen.getAllByText('要再検証').length).toBeGreaterThan(0) // cls-1.8 = 要再検証
    // 台帳行から該当 Agent へ drill
    expect(screen.getAllByRole('link', { name: '帳票 OCR' })[0]).toHaveAttribute('href', '/agents/agent-corporate-address-change')
    // drift/bias 監視
    expect(screen.getByText('drift / bias 監視')).toBeInTheDocument()
    expect(screen.getAllByText(/入力分布 drift/).length).toBeGreaterThan(0)
  })

  it('F-039: モデルガバナンス tab に axe violations がない', async () => {
    const user = userEvent.setup()
    const { container } = renderObservatory()
    await user.click(screen.getByRole('button', { name: 'モデルガバナンス' }))
    expect(await axe(container)).toHaveNoViolations()
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
    // F-032: filter chip は JP 業務語。「入力者上書き」は 0142 のみが持つ操作 → 0142 だけ残り、他 case (0145) は消える
    await user.click(screen.getByRole('button', { name: '入力者上書き' }))
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

  it('メトリクス / ナレッジ tab に axe violations がない (W3 G11 補完: 非 default tab)', async () => {
    const user = userEvent.setup()
    const { container } = renderObservatory()
    await user.click(screen.getByRole('button', { name: 'メトリクス' }))
    expect(await axe(container)).toHaveNoViolations()
    await user.click(screen.getByRole('button', { name: 'ナレッジ' }))
    expect(await axe(container)).toHaveNoViolations()
  })
})
