/**
 * Client store の操作 state 型 (Phase 1 — 状態基盤)。
 * SSOT: ~/.claude/plans/reactive-percolating-gizmo.md Phase 1 / Track A。
 *
 * 方針:
 * - store が保持するのは「操作で変わる最小集合」のみ (status / assignee / trust 等)。
 * - 文書・lifecycle・citations 等の rich static data は store に載せず、各 mock dict から id 引き (Phase 4)。
 * - 監査台帳 (OBS_LEDGER) は store に載せない = 永続化が「証跡統制」を誤認させない型上の保証 (S8)。
 */
import type { CaseStatus, ProposalStatus, TrustLevel } from '@/data/types'

/** 案件 (操作対象 = status / assignee / 要確認数)。rich data は mock-case-detail dict 側。 */
export interface CaseEntity {
  id: string
  workflowId: string
  workflowName: string
  status: CaseStatus
  /** 担当者 (未割当は undefined) */
  assignee?: string
  /** 要確認 項目数 (0 = 全項目一致)。一括承認の gate: >0 は一括承認不可 */
  flags: number
  elapsedLabel: string
}

/** 提案 (操作対象 = status)。 */
export interface ProposalEntity {
  id: string
  workflowId: string
  workflowName: string
  status: ProposalStatus
}

/** Agent (操作対象 = trust / 昇格申請 / 緊急停止)。 */
export interface AgentEntity {
  id: string
  workflowId: string
  workflowName: string
  trust: TrustLevel
  /** 設定変更 (昇格) 申請済みか */
  promotionRequested: boolean
  /** 緊急停止 (kill-switch) で全件確認へ降格された状態 (Phase 7 で UI 接続) */
  paused: boolean
}

export interface StoreState {
  cases: Record<string, CaseEntity>
  caseOrder: string[]
  proposals: Record<string, ProposalEntity>
  proposalOrder: string[]
  agents: Record<string, AgentEntity>
  agentOrder: string[]
}

/**
 * 操作 Action union。reducer (storeReducer) が処理。
 * case/approve の `by` は入力者/承認者を区別 (ready→承認待ち / 承認待ち→反映)。
 * 要確認 (flags > 0) の案件は入力者承認で前進しない (reducer 不変条件)。
 *
 * ★ Phase 4 で追加予定 (現 union 未収載、field-action dispatch 配線時):
 *   - `case/override` or `case/resolveFlag` — field 確定/上書きで flags を減らし、要確認を解消する操作。
 *     これが無いと flagged 'ready' 案件は承認に前進できない (Phase 1 では UI dispatch が無いため非 blocker)。
 *   - `agent/togglePause` の命名は暫定。kill-switch (trust 降格) の正確な意味論は Phase 7 で確定。
 */
export type StoreAction =
  | { type: 'case/approve'; id: string; by: 'input' | 'checker' }
  | { type: 'case/sendback'; id: string }
  | { type: 'case/assign'; id: string; assignee: string }
  | { type: 'case/bulkApprove'; ids: string[]; by: 'input' | 'checker' }
  | { type: 'proposal/forward'; id: string }
  | { type: 'proposal/approve'; id: string }
  | { type: 'proposal/reject'; id: string }
  | { type: 'agent/requestPromotion'; id: string }
  | { type: 'agent/togglePause'; id: string }
  | { type: 'store/reset' }
