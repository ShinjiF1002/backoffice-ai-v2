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
 * SoD (四眼原則) の自己承認判定 (remediation B4 + P1-3 で共通化、再発明しない)。
 * 申請/入力を行った actor (requesterId) と承認しようとする現 actor (currentActorId) が同一なら true = block。
 * 案件承認 (inputApprovedBy) と設定承認 (promotionRequestedBy) の双方で同一論理を使い 案件/設定 の SoD を統一する。
 */
function isSelfApproval(requesterId: string | undefined, currentActorId: string): boolean {
  return requesterId !== undefined && requesterId === currentActorId
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
    // SoD: 入力者承認と同一 actor は承認者承認できない (四眼原則を system で強制、設定承認と共通 helper)
    if (isSelfApproval(cur.inputApprovedBy, state.currentActorId)) return state
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
      // value は required (FieldActionModal が確定/上書きの両方で値を供給、空は modal が弾く)。
      const cur = state.cases[action.id]
      if (!cur || cur.resolvedFieldIds.includes(action.fieldLabel)) return state
      return patchCase(state, action.id, {
        resolvedFieldIds: [...cur.resolvedFieldIds, action.fieldLabel],
        overrides: { ...cur.overrides, [action.fieldLabel]: action.value },
        flags: Math.max(0, cur.flags - 1),
      })
    }
    case 'case/sendback': {
      // 差戻し precondition (remediation): ready / business-approval-waiting からのみ。終端 (reflected) / pending / sent-back は逆行させない。
      // reason/category は required (差戻し理由必須 modal が保証)。
      const cur = state.cases[action.id]
      if (!cur || (cur.status !== 'ready' && cur.status !== 'business-approval-waiting')) return state
      return patchCase(state, action.id, {
        status: 'sent-back',
        sendback: { reason: action.reason, category: action.category },
      })
    }
    case 'case/escalate': {
      // 業務責任者へのエスカレーション (remediation P1-3): 裁定依頼を記録するのみ (status 不変、JG-3=a)。
      // 受信 queue (/escalations) は escalation 有無で母集合判定。裁定の帰結 (差戻し) は別途 case/sendback。
      const cur = state.cases[action.id]
      if (!cur) return state
      return patchCase(state, action.id, {
        escalation: { reason: action.reason, category: action.category, to: action.to },
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
      // 却下 precondition (remediation): pending-triage / forwarded のみ。理由を decision に保持 (理由を捨てない、reason required)。
      const cur = state.proposals[action.id]
      if (!cur || (cur.status !== 'pending-triage' && cur.status !== 'forwarded')) return state
      return patchProposal(state, action.id, {
        status: 'rejected',
        decision: { kind: 'reject', reason: action.reason, category: action.category },
      })
    }
    case 'proposal/sendback': {
      // 業務責任者の提案差戻し (remediation): forwarded → pending-triage (triage キューへ戻す) + 理由保持 (reason required)。
      const cur = state.proposals[action.id]
      if (!cur || cur.status !== 'forwarded') return state
      return patchProposal(state, action.id, {
        status: 'pending-triage',
        decision: { kind: 'sendback', reason: action.reason, category: action.category },
      })
    }
    case 'notification/markRead': {
      // /inbox 既読化 (P1-2、冪等)。既読集合に追加 (重複は no-op)。
      if (state.readNotificationIds.includes(action.id)) return state
      return { ...state, readNotificationIds: [...state.readNotificationIds, action.id] }
    }
    case 'notification/markAllRead': {
      // 一括既読 (P1-2、冪等)。selector が算出した通知 id 群を merge (重複排除)。差分が無ければ state を据え置く。
      const merged = [...new Set([...state.readNotificationIds, ...action.ids])]
      return merged.length === state.readNotificationIds.length ? state : { ...state, readNotificationIds: merged }
    }
    case 'session/switchActor':
      // 未知 actorId は no-op (SoD 判定の主キーを不正値化させない、defensive)。
      return actorById(action.actorId) ? { ...state, currentActorId: action.actorId } : state
    case 'agent/requestPromotion': {
      // 昇格申請: 申請 actor を保持 (P1-3 SoD の判定材料)。差戻し済 (none + sendbackReason) からの再申請も許す。
      const cur = state.agents[action.id]
      if (!cur || cur.promotionStatus === 'approved') return state
      return patchAgent(state, action.id, {
        promotionStatus: 'requested',
        promotionRequestedBy: state.currentActorId,
        promotionSendbackReason: undefined,
      })
    }
    case 'agent/approvePromotion': {
      // 設定承認 (P1-3): requested のみ。SoD: 申請者と同一 actor は承認不可 (案件 B4 と共通 helper)。
      const cur = state.agents[action.id]
      if (!cur || cur.promotionStatus !== 'requested') return state
      if (isSelfApproval(cur.promotionRequestedBy, state.currentActorId)) return state
      return patchAgent(state, action.id, { promotionStatus: 'approved', promotionSendbackReason: undefined })
    }
    case 'agent/sendbackPromotion': {
      // 設定承認差戻し (P1-3): requested → none + 理由保持 (理由を捨てない)。再申請を許す (C1 解消)。reason required。
      const cur = state.agents[action.id]
      if (!cur || cur.promotionStatus !== 'requested') return state
      return patchAgent(state, action.id, {
        promotionStatus: 'none',
        promotionSendbackReason: action.reason,
        promotionRequestedBy: undefined,
      })
    }
    case 'agent/emergencyStop': {
      // kill-switch: 全件確認へ降格 (paused) + 理由保持 (任意)。flywheel 観測化 (remediation)。
      const cur = state.agents[action.id]
      return cur ? patchAgent(state, action.id, { paused: true, pausedReason: action.reason }) : state
    }
    case 'agent/resume': {
      // 緊急停止からの復帰: paused 解除 + 理由クリア。
      const cur = state.agents[action.id]
      return cur ? patchAgent(state, action.id, { paused: false, pausedReason: undefined }) : state
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
