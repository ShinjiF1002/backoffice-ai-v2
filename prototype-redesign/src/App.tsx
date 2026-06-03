import { Routes, Route, Navigate } from 'react-router-dom'
import { V2Shell } from './v2/V2Shell'
import { HubV2 } from './v2/HubV2'
import { CasesV2 } from './v2/CasesV2'
import { CaseDraftV2 } from './v2/CaseDraftV2'
import { CaseDetailV2 } from './v2/CaseDetailV2'
import { ApprovalsV2 } from './v2/ApprovalsV2'
import { ProposalsV2 } from './v2/ProposalsV2'
import { ProposalDetailV2 } from './v2/ProposalDetailV2'
import { AgentsV2 } from './v2/AgentsV2'
import { AgentDetailV2 } from './v2/AgentDetailV2'
import { ObservatoryV2 } from './v2/ObservatoryV2'
import { SearchV2 } from './v2/SearchV2'
import { NotificationsV2 } from './v2/NotificationsV2'
import { BusinessApproverHubV2 } from './v2/BusinessApproverHubV2'
import { ConfigApprovalsV2 } from './v2/ConfigApprovalsV2'
import { EscalationsV2 } from './v2/EscalationsV2'

/**
 * Backoffice AI v2 — App Router (greenfield v2 = 本番、store 配線済)。
 * SSOT: prototype-redesign/CLAUDE.md + handoff-redesign/00-shared/ia-overview-v2.md / screen-contracts-v2.md
 *
 * V2Shell (Operator Console、graphite chrome × bright content) 配下に Process-First 15 画面:
 *   1. Hub `/`              2. Cases `/cases`           3. Approvals `/approvals`
 *   4. CaseDetail `/cases/:id` (入力者+承認者 mode)      5. Proposals `/proposals`
 *   6. ProposalDetail `/proposals/:id`                  7. Agents `/agents`
 *   8. AgentDetail `/agents/:id`                        9. Observatory `/observatory`
 *   10. SearchResults `/search`                         11. Notifications `/inbox`
 *   12. BusinessApproverHub `/business-approver`        13. ConfigApprovals `/config-approvals`
 *   14. Escalations `/escalations`                      15. CaseDraft `/cases/new` (手動起票)
 */
function App() {
  return (
    <Routes>
      <Route element={<V2Shell />}>
        <Route index element={<HubV2 />} />
        <Route path="hub" element={<HubV2 />} />
        <Route path="cases" element={<CasesV2 />} />
        {/* cases/new は cases/:id より先に宣言 (id='new' 誤マッチ回避) */}
        <Route path="cases/new" element={<CaseDraftV2 />} />
        <Route path="cases/:id" element={<CaseDetailV2 />} />
        <Route path="approvals" element={<ApprovalsV2 />} />
        <Route path="proposals" element={<ProposalsV2 />} />
        <Route path="proposals/:id" element={<ProposalDetailV2 />} />
        <Route path="agents" element={<AgentsV2 />} />
        <Route path="agents/:id" element={<AgentDetailV2 />} />
        <Route path="observatory" element={<ObservatoryV2 />} />
        <Route path="search" element={<SearchV2 />} />
        <Route path="inbox" element={<NotificationsV2 />} />
        <Route path="business-approver" element={<BusinessApproverHubV2 />} />
        <Route path="config-approvals" element={<ConfigApprovalsV2 />} />
        <Route path="escalations" element={<EscalationsV2 />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App
