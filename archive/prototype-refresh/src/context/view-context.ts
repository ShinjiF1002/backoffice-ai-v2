/**
 * 横断 view filter 状態の context + hook + 永続化ヘルパ (Phase 1)。
 * Provider component (ViewProvider.tsx) と分離 = react-refresh/only-export-components 準拠。
 * - process: ProcessSelector の選択業務。localStorage に永続 (P1-1 配線済、全画面 list filter と同期)。
 * - searchQuery: TopBar 検索語。ephemeral (永続しない)。W2b/P1-2 で TopBar input → useSearchResults → /search に配線。
 */
import { createContext, useContext } from 'react'

const PROCESS_KEY = 'bo-ai-v2:view:process'
export const DEFAULT_PROCESS = 'UC-BO-01' // 現 ProcessSelector の初期値と一致 (Phase 1 で見た目不変)

export interface ViewContextValue {
  process: string
  setProcess: (id: string) => void
  searchQuery: string
  setSearchQuery: (q: string) => void
}

export const ViewContext = createContext<ViewContextValue | null>(null)

export function loadProcess(): string {
  try {
    if (typeof localStorage === 'undefined') return DEFAULT_PROCESS
    return localStorage.getItem(PROCESS_KEY) ?? DEFAULT_PROCESS
  } catch {
    return DEFAULT_PROCESS
  }
}

export function persistProcess(id: string): void {
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(PROCESS_KEY, id)
  } catch {
    /* no-op */
  }
}

export function useView(): ViewContextValue {
  const v = useContext(ViewContext)
  if (!v) throw new Error('useView must be used within <ViewProvider>')
  return v
}
