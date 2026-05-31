import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

/**
 * AppShell — root layout wrapper
 * SSOT: docs/03-ui-prototype-design.md §5
 *
 * Layout: desktop Sidebar (left) + mobile bottom nav + (TopBar + Outlet) (right, scrollable)
 * PrototypeModeLabel は TopBar に常時表示 (全画面適用、§2.7 + §8)。
 */
export function AppShell() {
  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[var(--color-canvas)] md:flex-row">
      {/* F-050: WCAG 2.4.1 Bypass Blocks — focus 時のみ可視の本文スキップ。Enter で <main> へ jump (sidebar の 25+ Tab を回避)。 */}
      <a
        href="#main-content"
        className="sr-only rounded-[var(--radius-control)] focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-[100] focus:bg-[var(--color-primary)] focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-white focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2"
      >
        本文へスキップ
      </a>
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar />
        {/* F-050: skip-link の着地点。tabIndex=-1 で programmatic focus を受ける landmark。 */}
        <main id="main-content" tabIndex={-1} className="flex-1 overflow-y-auto pb-16 outline-none md:pb-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
