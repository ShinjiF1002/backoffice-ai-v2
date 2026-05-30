/**
 * storeReducer — pure。操作 Action を状態遷移に適用 (Phase 1 — 状態基盤)。
 * status 遷移は CaseStatus / ProposalStatus enum の業務フローに従う:
 *   案件: ready --(入力者承認)--> business-approval-waiting --(承認者承認)--> reflected / 任意 --(差戻し)--> sent-back
 *   提案: pending-triage --(送付)--> forwarded --(承認)--> approved / 任意 --(却下)--> rejected
 * UI 配線 (どの操作面が dispatch するか) は Phase 4/7。reducer はここで意味論を固める。
 */
import type { StoreState, StoreAction, CaseEntity, ProposalEntity, AgentEntity } from './types'
import { seed } from './seed'
import { actorById } from './actors'

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
 * SoD (remediation B4、四眼原則): 入力者承認した actor (inputApprovedBy) と同一 actor の承認者承認は無効
 *   (state.currentActorId で判定)。bulkApprove も本関数経由なので flagged / 自己承認は自動 skip。
 */
function approveCase(state: StoreState, id: string, by: 'input' | 'checker'): StoreState {
  const cur = state.cases[id]
  if (!cur) return state
  if (by === 'input' && cur.status === 'ready' && cur.flags === 0) {
    return patchCase(state, id, { status: 'business-approval-waiting', inputApprovedBy: state.currentActorId })
  }
  if (by === 'checker' && cur.status === 'business-approval-waiting') {
    // SoD: 入力者承認と同一 actor は承認者承認できない (四眼原則を system で強制)
    if (cur.inputApprovedBy !== undefined && cur.inputApprovedBy === state.currentActorId) return state
    return patchCase(state, id, { status: 'reflected' })
  }
  return state
}

export function storeReducer(state: StoreState, action: StoreAction): StoreState {
  switch (action.type) {
    case 'case/approve':
      return approveCase(state, action.id, action.by)
    case 'case/override': {
      // field 確定/上書き: resolvedFieldIds に追加 (冪等) + flags 減算 (要確認解消) + 訂正値を overrides に格納 (B1)。
      const cur = state.cases[action.id]
      if (!cur || cur.resolvedFieldIds.includes(action.fieldLabel)) return state
      return patchCase(state, action.id, {
        resolvedFieldIds: [...cur.resolvedFieldIds, action.fieldLabel],
        overrides: action.value !== undefined ? { ...cur.overrides, [action.fieldLabel]: action.value } : cur.overrides,
        flags: Math.max(0, cur.flags - 1),
      })
    }
    case 'case/sendback': {
      // 差戻し precondition (remediation): ready / business-approval-waiting からのみ。終端 (reflected) / pending / sent-back は逆行させない。
      const cur = state.cases[action.id]
      if (!cur || (cur.status !== 'ready' && cur.status !== 'business-approval-waiting')) return state
      return patchCase(state, action.id, {
        status: 'sent-back',
        sendback: action.reason !== undefined ? { reason: action.reason, category: action.category ?? '' } : cur.sendback,
      })
    }
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
    case 'proposal/reject': {
      // 却下 precondition (remediation): pending-triage / forwarded のみ。理由を decision に保持 (理由を捨てない)。
      const cur = state.proposals[action.id]
      if (!cur || (cur.status !== 'pending-triage' && cur.status !== 'forwarded')) return state
      return patchProposal(state, action.id, {
        status: 'rejected',
        decision: action.reason !== undefined ? { kind: 'reject', reason: action.reason, category: action.category } : cur.decision,
      })
    }
    case 'proposal/sendback': {
      // 業務責任者の提案差戻し (remediation): forwarded → pending-triage (triage キューへ戻す) + 理由保持。
      const cur = state.proposals[action.id]
      if (!cur || cur.status !== 'forwarded') return state
      return patchProposal(state, action.id, {
        status: 'pending-triage',
        decision: action.reason !== undefined ? { kind: 'sendback', reason: action.reason, category: action.category } : cur.decision,
      })
    }
    case 'session/switchActor':
      // 未知 actorId は no-op (SoD 判定の主キーを不正値化させない、defensive)。
      return actorById(action.actorId) ? { ...state, currentActorId: action.actorId } : state
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
