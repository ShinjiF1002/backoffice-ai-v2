import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { StoreProvider } from '@/store/StoreProvider'
import { ViewProvider } from '@/context/ViewProvider'
import { clearPersisted } from '@/store/persist'
import App from '@/App'

// W3 C4 — 手動起票 (/cases/new、typology 15)。AI 障害時に全項目手入力で案件を起票。
// store layer (case/create append/idempotent) は store.test、手入力 detail の honesty (origin='manual'、
// AI/OCR/.pdf/押印 を捏造しない) は manual-honesty.test で検証済。本 test は v2 form の screen/flow
// (inline validation a11y / 業務切替 field 集合 / 起票→navigate→手動起票 detail の end-to-end 統合)。
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

// v2 form 構造 (button-group 業務 / inline per-field validation / label に「必須」inline) に合わせた検証。
describe('W3 C4 manual entry (v2 form)', () => {
  beforeEach(() => clearPersisted())

  it('F-008(v2): 全項目未入力で起票 → 最初の無効 field へ focus が移り aria-invalid が付く', async () => {
    const user = userEvent.setup()
    renderAt('/cases/new')
    await user.click(screen.getByRole('button', { name: '起票する' }))
    const first = screen.getByLabelText(/法人名/) // v2 label は「法人名 必須」ゆえ regex
    expect(first).toHaveFocus()
    expect(first).toHaveAttribute('aria-invalid', 'true')
    // 未 navigate (form 上に残る = 業務 selector が見える)
    expect(screen.getByRole('button', { name: '起票する' })).toBeInTheDocument()
  })

  it('v2: 業務切替 (button group) で入力項目が口座開設の field 集合に変わる', async () => {
    const user = userEvent.setup()
    renderAt('/cases/new')
    expect(screen.getByLabelText(/法人名/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '口座開設書類完備' }))
    expect(screen.getByLabelText(/本人確認書類/)).toBeInTheDocument()
    expect(screen.queryByLabelText(/法人名/)).not.toBeInTheDocument()
  })

  it('v2 統合: 全項目入力 → 起票 → 手動起票 detail が入力値で開き、AI/書類走査を捏造しない (F-006/F-051)', async () => {
    const user = userEvent.setup()
    renderAt('/cases/new')
    await user.type(screen.getByLabelText(/法人名/), '株式会社テスト商事')
    await user.type(screen.getByLabelText(/新住所/), '東京都港区テスト 1-2-3')
    await user.type(screen.getByLabelText(/ビル名/), 'テストビル')
    await user.type(screen.getByLabelText(/支店コード/), '099')
    await user.type(screen.getByLabelText(/効力発生日/), '2026-06-20')
    await user.click(screen.getByRole('button', { name: '起票する' }))
    // /cases/CASE-MANUAL-001 へ navigate → 手動起票 detail が入力値で render
    expect((await screen.findAllByText('株式会社テスト商事')).length).toBeGreaterThan(0)
    expect(screen.getAllByText('東京都港区テスト 1-2-3').length).toBeGreaterThan(0)
    // 旧 AI 既定値 (上書き済) は出ない
    expect(screen.queryByText('株式会社サンプル商事')).not.toBeInTheDocument()
    // F-006/F-051: 手入力案件で起きていない AI処理 step / .pdf 書類を捏造しない
    expect(screen.queryByText('AI処理')).not.toBeInTheDocument()
    expect(screen.queryByText(/\.pdf/)).not.toBeInTheDocument()
  })
})
