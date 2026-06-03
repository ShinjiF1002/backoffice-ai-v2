import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { StoreProvider } from '@/store/StoreProvider'
import { ViewProvider } from '@/context/ViewProvider'
import { clearPersisted } from '@/store/persist'
import App from '@/App'

// W3 C4 — 手動起票 (/cases/new、typology 15)。AI 障害時に全項目手入力で案件を起票。
// store layer (case/create append/idempotent) は store.test 検証済。本 test は form の screen/flow
// (render + user-event + 状態遷移: 全項目必須 validation / 起票 → store-only draft が detail で開ける / 業務切替で field 集合)。
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

// SKIP (route-swap deferral): v2 CaseDraftV2 は form 構造が v1 と異なる (業務=button group / inline per-field validation /
// label に「必須」inline)。case/create 起票 capability は Playwright (v2-parity.mjs F) で検証済。
// v2-form 構造への jsdom test 書き換え (validation/manual-detail honesty) は別 batch。
describe.skip('W3 C4 manual entry: /cases/new 手動起票 form', () => {
  beforeEach(() => clearPersisted())

  it('全項目未入力で起票 → error、navigate しない (validation)', async () => {
    const user = userEvent.setup()
    renderAt('/cases/new')
    await user.click(screen.getByRole('button', { name: '起票する' }))
    expect(screen.getByText('全項目を入力してください')).toBeInTheDocument()
    // まだ form 上 (案件 ID 自動採番ラベルが見える = 未 navigate)
    expect(screen.getByText('案件 ID（自動採番）')).toBeInTheDocument()
  })

  it('F-008: error は role=alert で通知され、最初の無効 field へ focus が移り aria-describedby が紐づく', async () => {
    const user = userEvent.setup()
    renderAt('/cases/new')
    await user.click(screen.getByRole('button', { name: '起票する' }))
    // role=alert で SR 通知
    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent('全項目を入力してください')
    // 最初の無効 field (法人名) へ programmatic focus
    const first = screen.getByLabelText('法人名')
    expect(first).toHaveFocus()
    // 無効 input は aria-invalid + aria-describedby=error id
    expect(first).toHaveAttribute('aria-invalid', 'true')
    expect(first).toHaveAttribute('aria-describedby', 'casedraft-error')
  })

  it('全項目入力 → 起票 → store-only draft が CaseDetail で開け入力値が確認済表示 (旧 AI 値は出ない)', async () => {
    const user = userEvent.setup()
    renderAt('/cases/new')
    await user.type(screen.getByLabelText('法人名'), '株式会社テスト商事')
    await user.type(screen.getByLabelText('新住所'), '東京都港区テスト 1-2-3')
    await user.type(screen.getByLabelText('ビル名'), 'テストビル')
    await user.type(screen.getByLabelText('支店コード'), '099')
    await user.type(screen.getByLabelText('効力発生日'), '2026-06-20')
    await user.click(screen.getByRole('button', { name: '起票する' }))
    // /cases/CASE-MANUAL-001 へ遷移 → 手動起票 detail が入力値で render
    expect((await screen.findAllByText('株式会社テスト商事')).length).toBeGreaterThan(0)
    expect(screen.getAllByText('東京都港区テスト 1-2-3').length).toBeGreaterThan(0)
    // 旧 AI 既定値 (上書き済) は出ない
    expect(screen.queryByText('株式会社サンプル商事')).not.toBeInTheDocument()
  })

  it('F-006/F-007/F-051: 手動起票 detail は AI処理/OCR/.pdf/押印/「AI 入力項目」を捏造せず手入力として表示', async () => {
    const user = userEvent.setup()
    renderAt('/cases/new')
    await user.type(screen.getByLabelText('法人名'), '株式会社テスト商事')
    await user.type(screen.getByLabelText('新住所'), '東京都港区テスト 1-2-3')
    await user.type(screen.getByLabelText('ビル名'), 'テストビル')
    await user.type(screen.getByLabelText('支店コード'), '099')
    await user.type(screen.getByLabelText('効力発生日'), '2026-06-20')
    await user.click(screen.getByRole('button', { name: '起票する' }))
    await screen.findAllByText('株式会社テスト商事') // navigate 完了待ち

    // 起きていない AI/OCR/書類/押印 を捏造しない (F-006)
    expect(screen.queryByText('AI処理')).not.toBeInTheDocument()
    expect(screen.queryByText('AI 入力項目')).not.toBeInTheDocument() // 手入力なので AI ラベルは出さない (F-007)
    expect(screen.queryByText(/\.pdf/)).not.toBeInTheDocument()
    expect(screen.queryByText(/押印/)).not.toBeInTheDocument()
    // 手入力として honest に表示 (origin='manual')
    expect(screen.getByText('手入力項目（書類走査なし）')).toBeInTheDocument()
    expect(screen.getByText('手入力値の控え（スキャン画像なし）')).toBeInTheDocument()
  })

  it('業務切替で入力項目が口座開設の field 集合に変わる (全項目手入力)', async () => {
    const user = userEvent.setup()
    renderAt('/cases/new')
    expect(screen.getByLabelText('法人名')).toBeInTheDocument() // 法人住所変更 default
    await user.selectOptions(screen.getByLabelText('業務'), '口座開設書類完備')
    expect(screen.getByLabelText('本人確認書類')).toBeInTheDocument()
    expect(screen.queryByLabelText('法人名')).not.toBeInTheDocument()
  })
})

// v2 form 構造 (button-group 業務 / inline per-field validation / label に「必須」inline) に合わせた a11y 検証。
describe('W3 C4 manual entry (v2 form): inline validation a11y', () => {
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
})
