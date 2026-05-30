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
  /** detail で確定/上書きした field の fieldLabel 群 (overlay 用、Phase 4b)。rich fields は dict 側 (S8 境界) */
  resolvedFieldIds: string[]
  /** 確定/上書きした field の訂正値 (fieldLabel → 値、remediation B1)。確認済表示は aiValue でなく此処を優先。 */
  overrides: Record<string, string>
  /** 入力者承認を行った actorId (remediation B4 SoD: 同一 actor の承認者承認を block する判定材料)。 */
  inputApprovedBy?: string
  /** 直近の差戻し理由 (remediation sendback-guard、受領入力者が参照)。 */
  sendback?: { reason: string; category: string }
  elapsedLabel: string
}

/** 提案 (操作対象 = status)。 */
export interface ProposalEntity {
  id: string
  workflowId: string
  workflowName: string
  status: ProposalStatus
  /** 却下/差戻し時の判断記録 (理由を捨てない、remediation sendback-guard)。 */
  decision?: { kind: 'reject' | 'sendback'; reason: string; category?: string }
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
  /** 現在の操作 actor (remediation B4 SoD、persona switcher で切替)。reducer が承認の四眼原則判定に使う。 */
  currentActorId: string
}

/**
 * 操作 Action union。reducer (storeReducer) が処理。
 * case/approve の `by` は入力者/承認者を区別 (ready→承認待ち / 承認待ち→反映)。SoD (四眼原則) は
 *   reducer が `state.currentActorId` を参照して強制する (同一 actor の入力者→承認者承認を block、remediation B4)。
 * 要確認 (flags > 0) の案件は入力者承認で前進しない (reducer 不変条件)。
 * case/override (remediation B1): field 確定/上書きで resolvedFieldIds に追加 + flags 減算 + 訂正値 (value) を overrides に格納。
 *   value は optional (UI 配線=P0-W3 完了までは旧 dispatch 互換、配線後に required 化)。
 * case/sendback / proposal/reject / proposal/sendback (remediation sendback-guard): reason/category は optional
 *   (理由を捨てず store に保持。UI 配線後に required 化)。case/sendback は precondition (ready / business-approval-waiting のみ)。
 *   `agent/togglePause` の命名は暫定。kill-switch (trust 降格) の正確な意味論は flywheel 観測化 (P0-W3) で確定。
 * TODO(P0-W3): 全 dispatch 配線 (FieldActionModal value 入力 / ReasonDialog reason) 完了後、value/reason の `?` を外して
 *   required 化し本注記を削除する。`grep -n "value?: string\|reason?: string" types.ts` が 0 になることを W3 gate に含める。
 */
export type StoreAction =
  | { type: 'case/approve'; id: string; by: 'input' | 'checker' }
  | { type: 'case/override'; id: string; fieldLabel: string; value?: string }
  | { type: 'case/sendback'; id: string; reason?: string; category?: string }
  | { type: 'case/assign'; id: string; assignee: string }
  | { type: 'case/bulkApprove'; ids: string[]; by: 'input' | 'checker' }
  | { type: 'proposal/forward'; id: string }
  | { type: 'proposal/approve'; id: string }
  | { type: 'proposal/reject'; id: string; reason?: string; category?: string }
  | { type: 'proposal/sendback'; id: string; reason?: string; category?: string }
  | { type: 'agent/requestPromotion'; id: string }
  | { type: 'agent/togglePause'; id: string }
  | { type: 'session/switchActor'; actorId: string }
  | { type: 'store/reset' }
