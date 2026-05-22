import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

/**
 * AppShell — root layout wrapper
 * SSOT: docs/03-ui-prototype-design.md §5
 *
 * Layout: Sidebar (left, fixed) + (TopBar + Outlet) (right, scrollable)
 * PrototypeModeLabel は TopBar に常時表示 (全画面適用、§2.7 + §8)。
 */
export function AppShell() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--color-canvas)]">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
