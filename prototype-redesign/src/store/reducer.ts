/**
 * storeReducer — pure。操作 Action を状態遷移に適用 (Phase 1 — 状態基盤)。
 * status 遷移は CaseStatus / ProposalStatus enum の業務フローに従う:
 *   案件: ready --(入力者承認)--> business-approval-waiting --(承認者承認)--> reflected / 任意 --(差戻し)--> sent-back
 *   提案: pending-triage --(送付)--> forwarded --(承認)--> approved / 任意 --(却下)--> rejected
 * UI 配線 (どの操作面が dispatch するか) は Phase 4/7。reducer はここで意味論を固める。
 */
import type { StoreState, StoreAction, CaseEntity, ProposalEntity, AgentEntity } from './types'
import { seed } from './seed'

function patchCase(state: StoreState, id: string, patch: Partial<CaseEntity>): StoreState {
  const cur = state.cases[id]
  if (!cur) return state
  return { ...state, cases: { ...state.cases, [id]: { ...cur, ...patch } } }
}

function patchProposal(state: StoreState, id: string, patch: Partial<ProposalEntity>): StoreState {
  const cur = state.proposals[id]
  if (!cur) return state
  return { ...state, proposals: { ...state.proposals, [id]: { ...cur, ...patch } } }
}

function patchAgent(state: StoreState, id: string, patch: Partial<AgentEntity>): StoreState {
  const cur = state.agents[id]
  if (!cur) return state
  return { ...state, agents: { ...state.agents, [id]: { ...cur, ...patch } } }
}

/**
 * 入力者/承認者の承認による案件 status 遷移 (precondition 不一致なら無変更)。
 * 不変条件 (R0 gate「要確認残は承認不可」): 要確認 (flags > 0) の案件は入力者承認で前進させない。
 * flags を 0 にする手段 (case/override or case/resolveFlag = field-action) は Phase 4 で追加 (types.ts 参照)。
 * bulkApprove も本関数経由なので、flagged 案件は自動的に skip される。
 */
function approveCase(state: StoreState, id: string, by: 'input' | 'checker'): StoreState {
  const cur = state.cases[id]
  if (!cur) return state
  if (by === 'input' && cur.status === 'ready' && cur.flags === 0) {
    return patchCase(state, id, { status: 'business-approval-waiting' })
  }
  if (by === 'checker' && cur.status === 'business-approval-waiting') {
    return patchCase(state, id, { status: 'reflected' })
  }
  return state
}

export function storeReducer(state: StoreState, action: StoreAction): StoreState {
  switch (action.type) {
    case 'case/approve':
      return approveCase(state, action.id, action.by)
    case 'case/override': {
      // field 確定/上書き: resolvedFieldIds に追加 (冪等) + flags 減算 (要確認解消)。
      const cur = state.cases[action.id]
      if (!cur || cur.resolvedFieldIds.includes(action.fieldLabel)) return state
      return patchCase(state, action.id, {
        resolvedFieldIds: [...cur.resolvedFieldIds, action.fieldLabel],
        flags: Math.max(0, cur.flags - 1),
      })
    }
    case 'case/sendback':
      return patchCase(state, action.id, { status: 'sent-back' })
    case 'case/assign':
      return patchCase(state, action.id, { assignee: action.assignee })
    case 'case/bulkApprove':
      return action.ids.reduce((acc, id) => approveCase(acc, id, action.by), state)
    case 'proposal/forward':
      return state.proposals[action.id]?.status === 'pending-triage'
        ? patchProposal(state, action.id, { status: 'forwarded' })
        : state
    case 'proposal/approve':
      return state.proposals[action.id]?.status === 'forwarded'
        ? patchProposal(state, action.id, { status: 'approved' })
        : state
    case 'proposal/reject':
      return patchProposal(state, action.id, { status: 'rejected' })
    case 'agent/requestPromotion':
      return patchAgent(state, action.id, { promotionRequested: true })
    case 'agent/togglePause': {
      const cur = state.agents[action.id]
      return cur ? patchAgent(state, action.id, { paused: !cur.paused }) : state
    }
    case 'store/reset':
      return seed()
    default: {
      // 網羅性 check: 新 action 追加時に compile error で気付く
      const _exhaustive: never = action
      return _exhaustive
    }
  }
}
