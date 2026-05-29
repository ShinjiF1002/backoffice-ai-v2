import { ScreenPlaceholder } from '@/components/shared/ScreenPlaceholder'

/**
 * Phase 2B-1b 暫定 placeholder 群 (9 画面 Process-First)。
 * P2B-2/3 で各画面を screens-v2 pixel-parity の本実装に置換し、個別 file へ split する。
 */

export function Hub() {
  return <ScreenPlaceholder title="ハブ" route="/" role="全 role" typology="A" reference="screens-v2/01-hub/canonical-export.md" />
}
export function Cases() {
  return <ScreenPlaceholder title="案件一覧" route="/cases" role="入力者" typology="B" reference="screens-v2/02-cases/canonical-export.md" />
}
export function Approvals() {
  return <ScreenPlaceholder title="承認待ち" route="/approvals" role="承認者" typology="B" reference="screens-v2/03-approvals/canonical-export.md" />
}
export function CaseDetail() {
  return <ScreenPlaceholder title="案件詳細" route="/cases/:id" role="入力者 / 承認者" typology="C" reference="screens-v2/04-case-detail/canonical-export.md" />
}
export function Proposals() {
  return <ScreenPlaceholder title="提案一覧" route="/proposals" role="Manual 管理者" typology="B" reference="screens-v2/05-proposals/canonical-export.md" />
}
export function ProposalDetail() {
  return <ScreenPlaceholder title="提案詳細" route="/proposals/:id" role="Manual 管理者 / 業務責任者" typology="C" reference="screens-v2/06-proposal-detail/canonical-export.md" />
}
export function Agents() {
  return <ScreenPlaceholder title="エージェント一覧" route="/agents" role="AI 管理者" typology="B" reference="screens-v2/07-agents/canonical-export.md" />
}
export function AgentDetail() {
  return <ScreenPlaceholder title="エージェント詳細" route="/agents/:id" role="AI 管理者" typology="C" reference="screens-v2/08-agent-detail/canonical-export.md" />
}
export function Observatory() {
  return <ScreenPlaceholder title="モニタリング" route="/observatory" role="監査者" typology="A" reference="screens-v2/09-observatory/canonical-export.md" />
}
