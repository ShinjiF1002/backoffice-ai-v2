import { Routes, Route, Link } from 'react-router-dom'
import { Landing } from './pages/Landing'
import { PatternDetail } from './pages/PatternDetail'

export default function App() {
  return (
    <div className="min-h-screen bg-[color:var(--color-canvas)] text-[color:var(--color-fg)]">
      <SiteHeader />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/p/:id" element={<PatternDetail />} />
      </Routes>
      <SiteFooter />
    </div>
  )
}

function SiteHeader() {
  return (
    <header className="border-b border-[color:var(--color-border)] bg-[color:var(--color-panel)]/80 backdrop-blur sticky top-0 z-30">
      <div className="mx-auto flex h-14 max-w-[var(--container-wide)] items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="h-6 w-6 rounded-md bg-[color:var(--color-ink)] grid place-items-center text-[color:var(--color-panel)] text-[11px] font-bold">
            BO
          </div>
          <div className="leading-tight">
            <div className="text-[13px] font-semibold tracking-tight">Backoffice AI v2 — Pattern Showcase</div>
            <div className="text-[11px] text-[color:var(--color-fg-muted)]">research-compounder × Figma MCP</div>
          </div>
        </Link>
        <nav className="flex items-center gap-6 text-[13px]">
          <a
            href="https://github.com/"
            className="text-[color:var(--color-fg-muted)] hover:text-[color:var(--color-fg)] transition-colors"
            rel="noreferrer"
          >
            GitHub
          </a>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--color-alert-soft)] px-2.5 py-0.5 text-[11px] font-medium text-[color:var(--color-alert-soft-fg)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--color-alert)]" />
            外部システム未接続 / モック
          </span>
        </nav>
      </div>
    </header>
  )
}

function SiteFooter() {
  return (
    <footer className="border-t border-[color:var(--color-border)] mt-24">
      <div className="mx-auto max-w-[var(--container-wide)] px-6 py-8 flex flex-col gap-2 text-[12px] text-[color:var(--color-fg-muted)] md:flex-row md:items-center md:justify-between">
        <div>
          backoffice-ai-v2 / showcase ・ Pattern catalog for AI-native backoffice operator UX
        </div>
        <div className="flex gap-4">
          <a
            href="https://github.com/"
            className="hover:text-[color:var(--color-fg)] transition-colors"
            rel="noreferrer"
          >
            source
          </a>
          <span>research-compounder R7 recipe</span>
        </div>
      </div>
    </footer>
  )
}
