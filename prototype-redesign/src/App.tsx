import { Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from './components/shell/AppShell'
import { Hub } from './pages/Hub' // P2B-3d-1 (A 型、業務横断 landing)
import { Observatory } from './pages/Observatory' // P2B-3d-2 (A 型 3-tab、最後の placeholder 卒業)
import { CaseDetail } from './pages/CaseDetail' // P2B-2 本実装 (rev.3 文書アンカー)
import { Cases } from './pages/Cases' // P2B-3a
import { Approvals } from './pages/Approvals' // P2B-3a
import { Proposals } from './pages/Proposals' // P2B-3b
import { Agents } from './pages/Agents' // P2B-3b
import { ProposalDetail } from './pages/ProposalDetail' // P2B-3c-1 (C 型 doc-anchored)
import { AgentDetail } from './pages/AgentDetail' // P2B-3c-2 (C 型、Trust 昇格)
import { SearchResults } from './pages/SearchResults' // W2b/P1-2 (B 型、横断検索)
import { Notifications } from './pages/Notifications' // W2b/P1-2 (B 型、通知/inbox)

/**
 * Backoffice AI v2 (redesign) — App Router
 * SSOT: prototype-redesign/CLAUDE.md + handoff-redesign/00-shared/ia-overview-v2.md §2
 *
 * Process-First (旧 Dashboard/Inbox IA は廃止)。remediation で 9→ 拡張中 (W2b: 11、W2c: 14):
 *   1. Hub `/`               2. Cases `/cases`        3. Approvals `/approvals`
 *   4. CaseDetail `/cases/:id` (入力者+承認者 mode)    5. Proposals `/proposals`
 *   6. ProposalDetail `/proposals/:id`                7. Agents `/agents`
 *   8. AgentDetail `/agents/:id`                      9. Observatory `/observatory` (モニタリング)
 *   10. SearchResults `/search` (W2b/P1-2)            11. Notifications `/inbox` (W2b/P1-2)
 *
 * 業務責任者面 (/business-approver, /config-approvals, /escalations) は W2c (P1-3) で 14 へ。
 */
function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Hub />} />
        <Route path="cases" element={<Cases />} />
        <Route path="approvals" element={<Approvals />} />
        <Route path="cases/:id" element={<CaseDetail />} />
        <Route path="proposals" element={<Proposals />} />
        <Route path="proposals/:id" element={<ProposalDetail />} />
        <Route path="agents" element={<Agents />} />
        <Route path="agents/:id" element={<AgentDetail />} />
        <Route path="observatory" element={<Observatory />} />
        <Route path="search" element={<SearchResults />} />
        <Route path="inbox" element={<Notifications />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App
