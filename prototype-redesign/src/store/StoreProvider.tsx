/**
 * StoreProvider — client store の Provider (Phase 1 — 状態基盤)。component のみ export。
 * context 定義は ./context、selector は ./hooks に分離。
 * hydrate は lazy reducer initializer (StrictMode double-invoke 安全、effect で hydrate しない)。
 */
import { useEffect, useReducer } from 'react'
import type { ReactNode } from 'react'
import { storeReducer } from './reducer'
import { seed } from './seed'
import { loadPersisted, savePersisted, loadPersistedFromStorageEvent } from './persist'
import { StoreStateContext, StoreDispatchContext } from './context'

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(storeReducer, undefined, () => loadPersisted(seed()))

  // state 変化を localStorage に追従保存 (idempotent、同一 state の再書き込みは savePersisted 側で skip)。
  useEffect(() => {
    savePersisted(state)
  }, [state])

  // W3 multi-tab: 他タブの localStorage 書き込み (StorageEvent) を購読し state を再 hydrate (last-write-wins)。
  // 'storage' は他タブでのみ発火 → 自タブの savePersisted と feedback loop しない (同値 skip と併せ二重に保護)。
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      const next = loadPersistedFromStorageEvent(e)
      if (next) dispatch({ type: 'store/hydrate', state: next })
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  return (
    <StoreStateContext.Provider value={state}>
      <StoreDispatchContext.Provider value={dispatch}>{children}</StoreDispatchContext.Provider>
    </StoreStateContext.Provider>
  )
}
