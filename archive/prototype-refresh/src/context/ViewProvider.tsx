/**
 * ViewProvider — 横断 view filter の Provider (Phase 1)。component のみ export。
 * context / hook / 永続化ヘルパは ./view-context。
 */
import { useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import { ViewContext, loadProcess, persistProcess } from './view-context'

export function ViewProvider({ children }: { children: ReactNode }) {
  const [process, setProcessState] = useState<string>(loadProcess)
  const [searchQuery, setSearchQuery] = useState('')

  const setProcess = useCallback((id: string) => {
    setProcessState(id)
    persistProcess(id)
  }, [])

  return (
    <ViewContext.Provider value={{ process, setProcess, searchQuery, setSearchQuery }}>
      {children}
    </ViewContext.Provider>
  )
}
