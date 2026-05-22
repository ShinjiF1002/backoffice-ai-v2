import { Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from './components/shell/AppShell'
import { Dashboard } from './pages/Dashboard'
import { Inbox } from './pages/Inbox'
import { CaseReview } from './pages/CaseReview'
import { SendBackComment } from './pages/SendBackComment'
import { ProposalReview } from './pages/ProposalReview'
import { AgentSettings } from './pages/AgentSettings'
import { AuditTrail } from './pages/AuditTrail'
import { Metrics } from './pages/Metrics'
import { KnowledgeBrowser } from './pages/KnowledgeBrowser'

/**
 * Backoffice AI v2 — App Router
 * SSOT: prototype/CLAUDE.md (9 routes、exactly 9 page route)
 *       docs/03-ui-prototype-design.md §2.7.5
 *
 * Exactly 9 page components (10 番目の独立画面禁止):
 *   1. Dashboard
 *   2. Inbox
 *   3. CaseReview
 *   4. SendBackComment (CaseReview の子 detail route、9 画面の 1 つ)
 *   5. ProposalReview
 *   6. AgentSettings
 *   7. AuditTrail
 *   8. Metrics
 *   9. KnowledgeBrowser
 */
function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="inbox" element={<Inbox />} />
        <Route path="cases/:id" element={<CaseReview />} />
        <Route path="cases/:id/comment" element={<SendBackComment />} />
        <Route path="proposals/:id" element={<ProposalReview />} />
        <Route path="agents/:id/settings" element={<AgentSettings />} />
        <Route path="audit" element={<AuditTrail />} />
        <Route path="metrics" element={<Metrics />} />
        <Route path="knowledge" element={<KnowledgeBrowser />} />
      </Route>
    </Routes>
  )
}

export default App
