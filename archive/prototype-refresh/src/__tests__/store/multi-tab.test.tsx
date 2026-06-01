import { render, screen, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { StoreProvider } from '@/store/StoreProvider'
import { ViewProvider } from '@/context/ViewProvider'
import { clearPersisted, savePersisted } from '@/store/persist'
import { seed } from '@/store/seed'
import { storeReducer } from '@/store/reducer'
import App from '@/App'

// W3 §8 multi-tab — 他タブの localStorage 書き込み (StorageEvent) で state を再 hydrate (last-write-wins)。
// store/hydrate action + StoreProvider の storage listener + loadPersistedFromStorageEvent guard の screen 検証。
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

describe('W3 multi-tab: StorageEvent で state 再 hydrate', () => {
  beforeEach(() => clearPersisted())

  it('他タブが新しい state を書く → storage event で UI が再 hydrate (last-write-wins)', () => {
    renderAt('/cases/CASE-2026-0120') // 0120 = reflected
    expect(screen.getByText('反映済')).toBeInTheDocument() // header badge

    // 他タブが 0120 を訂正 (reverse) した state を localStorage に書き、その newValue で storage event を発火 (他タブ書き込み模擬)。
    const external = storeReducer(seed(), { type: 'case/reverse', id: 'CASE-2026-0120', kind: '訂正', reason: '他タブで訂正' })
    savePersisted(external)
    const payload = window.localStorage.getItem('bo-ai-v2:store')
    act(() => {
      window.dispatchEvent(new StorageEvent('storage', { key: 'bo-ai-v2:store', newValue: payload }))
    })
    // last-write-wins: 外部 state を反映 → reflected→ready で反映済 badge が消える
    expect(screen.queryByText('反映済')).not.toBeInTheDocument()
  })

  it('無関係 key / 不正 payload は無視 (state 不変、白画面化しない)', () => {
    renderAt('/cases/CASE-2026-0120')
    expect(screen.getByText('反映済')).toBeInTheDocument()
    act(() => {
      window.dispatchEvent(new StorageEvent('storage', { key: 'other-key', newValue: '{}' })) // 別 key
      window.dispatchEvent(new StorageEvent('storage', { key: 'bo-ai-v2:store', newValue: 'not-json' })) // 不正 JSON
      window.dispatchEvent(new StorageEvent('storage', { key: 'bo-ai-v2:store', newValue: null })) // clear
    })
    expect(screen.getByText('反映済')).toBeInTheDocument() // 無視 → 不変
  })
})
