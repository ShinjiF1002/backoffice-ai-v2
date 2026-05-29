/**
 * StoreProvider — client store の Provider (Phase 1 — 状態基盤)。component のみ export。
 * context 定義は ./context、selector は ./hooks に分離。
 * hydrate は lazy reducer initializer (StrictMode double-invoke 安全、effect で hydrate しない)。
 */
import { useEffect, useReducer } from 'react'
import type { ReactNode } from 'react'
import { storeReducer } from './reducer'
import { seed } from './seed'
import { loadPersisted, savePersisted } from './persist'
import { StoreStateContext, StoreDispatchContext } from './context'

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(storeReducer, undefined, () => loadPersisted(seed()))

  // state 変化を localStorage に追従保存 (idempotent、同一 state の再書き込みは無害)。
  useEffect(() => {
    savePersisted(state)
  }, [state])

  return (
    <StoreStateContext.Provider value={state}>
      <StoreDispatchContext.Provider value={dispatch}>{children}</StoreDispatchContext.Provider>
    </StoreStateContext.Provider>
  )
}
