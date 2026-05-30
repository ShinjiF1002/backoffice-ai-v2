import { renderHook, act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { StoreProvider } from '@/store/StoreProvider'
import { ViewProvider } from '@/context/ViewProvider'
import { SearchResults } from '@/pages/SearchResults'
import { useSearchResults, useNotifications, useUnreadCount, useStoreDispatch } from '@/store/hooks'

// W2b/P1-2 — 横断検索 + 通知/inbox の wiring gate。
// input/NavLink/dispatch は check:no-op 対象外 (=<button> のみ) ゆえ behavioral test が唯一の配線検証。

describe('W2b/P1-2 横断検索 + 通知', () => {
  describe('useSearchResults (store-truth 部分一致)', () => {
    it('案件 ID でヒット', () => {
      const { result } = renderHook(() => useSearchResults('CASE-2026-0142'), { wrapper: StoreProvider })
      expect(result.current.some((r) => r.kind === 'case' && r.id === 'CASE-2026-0142')).toBe(true)
    })
    it('業務名で複数ヒット', () => {
      const { result } = renderHook(() => useSearchResults('法人住所変更'), { wrapper: StoreProvider })
      expect(result.current.length).toBeGreaterThan(1)
    })
    it('空クエリは空配列 (structurally-empty を画面側で分離)', () => {
      const { result } = renderHook(() => useSearchResults('   '), { wrapper: StoreProvider })
      expect(result.current).toEqual([])
    })
    it('一致なしは zero-result (空配列、専用文言は画面側)', () => {
      const { result } = renderHook(() => useSearchResults('存在しない案件ZZZ'), { wrapper: StoreProvider })
      expect(result.current).toEqual([])
    })
  })

  describe('useNotifications / useUnreadCount (actor 厳密 + 既読)', () => {
    it('seed: 山田太郎 宛の差戻し案件 (CASE-2026-0131) が通知に出る', () => {
      const { result } = renderHook(() => useNotifications(), { wrapper: StoreProvider })
      expect(result.current.some((n) => n.kind === 'sendback' && n.caseId === 'CASE-2026-0131')).toBe(true)
    })

    it('markRead で未読が 1 減る', () => {
      const { result } = renderHook(
        () => ({ notifications: useNotifications(), unread: useUnreadCount(), dispatch: useStoreDispatch() }),
        { wrapper: StoreProvider },
      )
      const before = result.current.unread
      expect(before).toBeGreaterThan(0)
      const firstId = result.current.notifications[0]!.id
      act(() => result.current.dispatch({ type: 'notification/markRead', id: firstId }))
      expect(result.current.unread).toBe(before - 1)
    })

    it('in-session の case/sendback が理由付き通知を生む', () => {
      const { result } = renderHook(
        () => ({ notifications: useNotifications(), dispatch: useStoreDispatch() }),
        { wrapper: StoreProvider },
      )
      const before = result.current.notifications.length
      // CASE-2026-0145 = 山田太郎 / ready → sendback で理由保持 (fallback 文言ではなく reason)
      act(() =>
        result.current.dispatch({ type: 'case/sendback', id: 'CASE-2026-0145', reason: 'ビル名不一致', category: 'edge_case' }),
      )
      const created = result.current.notifications.find((n) => n.caseId === 'CASE-2026-0145')
      expect(created).toBeDefined()
      expect(created!.detail).toBe('ビル名不一致')
      expect(result.current.notifications.length).toBe(before + 1)
    })

    it('markAllRead で未読 0', () => {
      const { result } = renderHook(
        () => ({ notifications: useNotifications(), unread: useUnreadCount(), dispatch: useStoreDispatch() }),
        { wrapper: StoreProvider },
      )
      const ids = result.current.notifications.map((n) => n.id)
      act(() => result.current.dispatch({ type: 'notification/markAllRead', ids }))
      expect(result.current.unread).toBe(0)
    })
  })
})

describe('SearchResults page (自前 input UI、狭幅自己完結)', () => {
  function renderSearch() {
    return render(
      <MemoryRouter initialEntries={['/search']}>
        <StoreProvider>
          <ViewProvider>
            <SearchResults />
          </ViewProvider>
        </StoreProvider>
      </MemoryRouter>,
    )
  }

  it('空クエリは prompt、ページ自前 input への入力で結果が出る (TopBar 非依存)', async () => {
    const user = userEvent.setup()
    renderSearch()
    // 空クエリ: prompt (structurally-empty を分離した専用文言)
    expect(screen.getByText('検索語を入力してください')).toBeInTheDocument()
    // ページ自前の searchbox に入力 → 結果が live 更新 (TopBar input が無い狭幅でも /search 自己完結)
    await user.type(screen.getByRole('searchbox', { name: '横断検索' }), 'CASE-2026-0142')
    // 結果 header (一意) で hit を確認。行 ID は table + mobile card の 2 箇所に出るため findAllByText で件数 confirm
    expect(await screen.findByText('「CASE-2026-0142」の検索結果 1 件')).toBeInTheDocument()
    expect(screen.getAllByText('CASE-2026-0142').length).toBeGreaterThan(0)
    expect(screen.queryByText('検索語を入力してください')).not.toBeInTheDocument()
  })
})
