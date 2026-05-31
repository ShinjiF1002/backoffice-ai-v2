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

describe('W3 C4 manual entry: /cases/new 手動起票 form', () => {
  beforeEach(() => clearPersisted())

  it('全項目未入力で起票 → error、navigate しない (validation)', async () => {
    const user = userEvent.setup()
    renderAt('/cases/new')
    await user.click(screen.getByRole('button', { name: '起票する' }))
    expect(screen.getByText('全項目を入力してください')).toBeInTheDocument()
    // まだ form 上 (案件 ID 自動採番ラベルが見える = 未 navigate)
    expect(screen.getByText('案件 ID（自動採番）')).toBeInTheDocument()
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

  it('業務切替で入力項目が口座開設の field 集合に変わる (全項目手入力)', async () => {
    const user = userEvent.setup()
    renderAt('/cases/new')
    expect(screen.getByLabelText('法人名')).toBeInTheDocument() // 法人住所変更 default
    await user.selectOptions(screen.getByLabelText('業務'), '口座開設書類完備')
    expect(screen.getByLabelText('本人確認書類')).toBeInTheDocument()
    expect(screen.queryByLabelText('法人名')).not.toBeInTheDocument()
  })
})
