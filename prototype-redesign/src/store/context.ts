/**
 * store の React context 定義 (Phase 1)。
 * Provider component (StoreProvider.tsx) と分離 = react-refresh/only-export-components 準拠。
 * state / dispatch を別 context にし、dispatch のみ使う component を state 変化で再 render させない。
 */
import { createContext } from 'react'
import type { Dispatch } from 'react'
import type { StoreState, StoreAction } from './types'

export const StoreStateContext = createContext<StoreState | null>(null)
export const StoreDispatchContext = createContext<Dispatch<StoreAction> | null>(null)
