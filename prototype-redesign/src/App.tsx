import { Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from './components/shell/AppShell'
import { Hub } from './pages/Hub' // P2B-3d-1 (A 型、業務横断 landing)
import { Observatory } from './pages/Observatory' // P2B-3d-2 (A 型 3-tab、最後の placeholder 卒業)
import { CaseDetail } from './pages/CaseDetail' // P2B-2 本実装 (rev.3 文書アンカー)
import { CaseDraft } from './pages/CaseDraft' // W3 C4 (B 型 form、手動起票、typology 15)
import { Cases } from './pages/Cases' // P2B-3a
import { Approvals } from './pages/Approvals' // P2B-3a
import { Proposals } from './pages/Proposals' // P2B-3b
import { Agents } from './pages/Agents' // P2B-3b
import { ProposalDetail } from './pages/ProposalDetail' // P2B-3c-1 (C 型 doc-anchored)
import { AgentDetail } from './pages/AgentDetail' // P2B-3c-2 (C 型、Trust 昇格)
import { SearchResults } from './pages/SearchResults' // W2b/P1-2 (B 型、横断検索)
import { Notifications } from './pages/Notifications' // W2b/P1-2 (B 型、通知/inbox)
import { BusinessApproverHub } from './pages/BusinessApproverHub' // W2c/P1-3 (A 型、業務責任者 landing)
import { ConfigApprovals } from './pages/ConfigApprovals' // W2c/P1-3 (B 型、設定承認 queue)
import { Escalations } from './pages/Escalations' // W2c/P1-3 (B 型、escalation 受信)
import { V2Shell } from './v2/V2Shell' // greenfield v2 preview shell (checkpoint reference)
import { CaseDetailV2 } from './v2/CaseDetailV2' // greenfield v2 reference 画面
import { CasesV2 } from './v2/CasesV2' // greenfield v2 案件キュー
import { HubV2 } from './v2/HubV2' // greenfield v2 ハブ (dashboard)
import { CaseDraftV2 } from './v2/CaseDraftV2' // greenfield v2 起票 (form)
import { ObservatoryV2 } from './v2/ObservatoryV2' // greenfield v2 モニタリング (oversight)
import { ApprovalsV2 } from './v2/ApprovalsV2' // greenfield v2 承認待ち
import { ProposalsV2 } from './v2/ProposalsV2' // greenfield v2 AI 提案
import { AgentsV2 } from './v2/AgentsV2' // greenfield v2 Agent 設定
import { EscalationsV2 } from './v2/EscalationsV2' // greenfield v2 エスカレーション
import { NotificationsV2 } from './v2/NotificationsV2' // greenfield v2 通知
import { SearchV2 } from './v2/SearchV2' // greenfield v2 横断検索
import { ConfigApprovalsV2 } from './v2/ConfigApprovalsV2' // greenfield v2 設定承認
import { ProposalDetailV2 } from './v2/ProposalDetailV2' // greenfield v2 提案詳細
import { AgentDetailV2 } from './v2/AgentDetailV2' // greenfield v2 Agent 詳細
import { BusinessApproverHubV2 } from './v2/BusinessApproverHubV2' // greenfield v2 業務責任者ハブ

/**
 * Backoffice AI v2 (redesign) — App Router
 * SSOT: prototype-redesign/CLAUDE.md + handoff-redesign/00-shared/ia-overview-v2.md §2
 *
 * Process-First (旧 Dashboard/Inbox IA は廃止)。remediation で 9→ 拡張 (W2b: 11、W2c: 14、W3: 15):
 *   1. Hub `/`               2. Cases `/cases`        3. Approvals `/approvals`
 *   4. CaseDetail `/cases/:id` (入力者+承認者 mode)    5. Proposals `/proposals`
 *   6. ProposalDetail `/proposals/:id`                7. Agents `/agents`
 *   8. AgentDetail `/agents/:id`                      9. Observatory `/observatory` (モニタリング)
 *   10. SearchResults `/search` (W2b/P1-2)            11. Notifications `/inbox` (W2b/P1-2)
 *   12. BusinessApproverHub `/business-approver` (W2c) 13. ConfigApprovals `/config-approvals` (W2c)
 *   14. Escalations `/escalations` (W2c/P1-3、IA scope=(a))
 *   15. CaseDraft `/cases/new` (W3 C4、手動起票)
 */
function App() {
  return (
    <Routes>
      {/* greenfield v2 preview (§8 checkpoint reference、既存 app と非干渉) */}
      <Route path="/v2" element={<V2Shell />}>
        <Route index element={<HubV2 />} />
        <Route path="hub" element={<HubV2 />} />
        <Route path="cases" element={<CasesV2 />} />
        <Route path="cases/:id" element={<CaseDetailV2 />} />
        <Route path="draft" element={<CaseDraftV2 />} />
        <Route path="observatory" element={<ObservatoryV2 />} />
        <Route path="approvals" element={<ApprovalsV2 />} />
        <Route path="proposals" element={<ProposalsV2 />} />
        <Route path="agents" element={<AgentsV2 />} />
        <Route path="escalations" element={<EscalationsV2 />} />
        <Route path="inbox" element={<NotificationsV2 />} />
        <Route path="search" element={<SearchV2 />} />
        <Route path="config-approvals" element={<ConfigApprovalsV2 />} />
        <Route path="proposal" element={<ProposalDetailV2 />} />
        <Route path="agent" element={<AgentDetailV2 />} />
        <Route path="business" element={<BusinessApproverHubV2 />} />
      </Route>
      <Route element={<AppShell />}>
        <Route index element={<Hub />} />
        <Route path="cases" element={<Cases />} />
        <Route path="approvals" element={<Approvals />} />
        {/* cases/new は cases/:id より先に宣言 (id='new' 誤マッチ回避、W3 C4) */}
        <Route path="cases/new" element={<CaseDraft />} />
        <Route path="cases/:id" element={<CaseDetail />} />
        <Route path="proposals" element={<Proposals />} />
        <Route path="proposals/:id" element={<ProposalDetail />} />
        <Route path="agents" element={<Agents />} />
        <Route path="agents/:id" element={<AgentDetail />} />
        <Route path="observatory" element={<Observatory />} />
        <Route path="search" element={<SearchResults />} />
        <Route path="inbox" element={<Notifications />} />
        <Route path="business-approver" element={<BusinessApproverHub />} />
        <Route path="config-approvals" element={<ConfigApprovals />} />
        <Route path="escalations" element={<Escalations />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App
