import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { StoreProvider } from '@/store/StoreProvider'
import { ViewProvider } from '@/context/ViewProvider'
import { clearPersisted } from '@/store/persist'
import App from '@/App'

// W4 F-011/F-029 — 受信トレイ (/cases) の triage 操作性。
// F-011: 経過/担当/要確認 列が sort 可能 (DataTable sortValue 配線)。
// F-029: 全項目一致(確認待ち)の一括「入力者確認」(要確認残/確認待ち以外を含む選択は disabled)。
// 注: DataTable は desktop table + mobile card の二重 render (CSS で出し分け) ゆえ checkbox は getAllByRole[0] で取る。
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

describe('F-011 受信トレイ列 sort', () => {
  beforeEach(() => clearPersisted())

  it('経過・担当・確認の列ヘッダが sort ボタン化されている', () => {
    renderAt('/cases')
    for (const header of ['経過', '担当', '確認']) {
      expect(screen.getByRole('button', { name: header })).toBeInTheDocument()
    }
  })
})

describe('F-029 受信トレイ一括操作', () => {
  beforeEach(() => clearPersisted())

  it('全項目一致(ready/flags0)を選択 → 一括入力者確認 が活性', async () => {
    const user = userEvent.setup()
    renderAt('/cases')
    // CASE-2026-0139 = 法人住所変更 / ready / flags0 (default process filter UC-BO-01 で可視)。
    await user.click(screen.getAllByRole('checkbox', { name: 'CASE-2026-0139 を選択' })[0]!)
    const bulk = await screen.findByRole('button', { name: /全項目一致をまとめて入力者確認/ })
    expect(bulk).toBeEnabled()
  })

  it('要確認残のある案件(flags1)を含む選択は一括操作 disabled', async () => {
    const user = userEvent.setup()
    renderAt('/cases')
    // CASE-2026-0142 = flags1 (要確認残) → 選択すると一括 disabled (個別判断要は個別のまま)
    await user.click(screen.getAllByRole('checkbox', { name: 'CASE-2026-0142 を選択' })[0]!)
    const bulk = await screen.findByRole('button', { name: /全項目一致をまとめて入力者確認/ })
    expect(bulk).toBeDisabled()
  })
})
