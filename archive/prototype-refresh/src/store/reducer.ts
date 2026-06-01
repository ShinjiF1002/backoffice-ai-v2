/**
 * storeReducer — pure。操作 Action を状態遷移に適用 (Phase 1 — 状態基盤)。
 * status 遷移は CaseStatus / ProposalStatus enum の業務フローに従う:
 *   案件: ready --(入力者承認)--> business-approval-waiting --(承認者承認)--> reflected / 任意 --(差戻し)--> sent-back
 *         反映済 (reflected) は終端だが訂正/取消 (case/reverse) で可逆: 訂正・取消とも sent-back へ (前進のみ→可逆、W3 C3)
 *   提案: pending-triage --(送付)--> forwarded --(承認)--> approved / 任意 --(却下)--> rejected
 * UI 配線 (どの操作面が dispatch するか) は Phase 4/7。reducer はここで意味論を固める。
 */
import type { StoreState, StoreAction, CaseEntity, ProposalEntity, AgentEntity, LedgerEvent } from './types'
import { seed } from './seed'
import { actorById, roleLabel } from './actors'
import { trustLevelLabel } from '@/lib/status-tones'

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
 * 操作証跡の決定的 ts (F-002、Date.now 不使用で reducer 純粋性維持)。
 * mock 基準日 2026-05-30 の 18:00 起点 + auditSeq 分 (seed の最終 reflect 17:36 より後 / 未来日 gate 内)。
 */
function auditTs(seq: number): string {
  const total = 18 * 60 + seq
  const hh = String(Math.floor(total / 60) % 24).padStart(2, '0')
  const mm = String(total % 60).padStart(2, '0')
  return `2026-05-30 ${hh}:${mm}:00`
}

/**
 * 操作証跡を append-only に記録 (F-002)。actor は store identity (currentActorId or 明示 actorId) から解決し、
 * owner / CASE_DETAILS / c.inputter は使わない (F-001 の actor SSOT を再汚染しない)。system 操作は 'システム'。
 * 失敗 (guard で no-op) した操作は本関数を呼ばないため、台帳には「実際に起きた状態変化」だけが残る。
 */
function logEvent(
  state: StoreState,
  ev: { caseId: string; workflowName: string; action: string; beforeAfter: string; actorId?: string; system?: boolean; approvalId?: string },
): StoreState {
  const actor = ev.system ? undefined : actorById(ev.actorId ?? state.currentActorId)
  const event: LedgerEvent = {
    ts: auditTs(state.auditSeq),
    actor: actor?.name ?? 'システム',
    role: actor ? roleLabel(actor.role) : 'システム',
    action: ev.action,
    beforeAfter: ev.beforeAfter,
    doc: '—',
    policy: '—',
    approvalId: ev.approvalId ?? '—',
    confidence: '—',
    caseId: ev.caseId,
    workflowName: ev.workflowName,
  }
  return { ...state, auditEvents: [...state.auditEvents, event], auditSeq: state.auditSeq + 1 }
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
    const next = patchCase(state, id, { status: 'business-approval-waiting', inputApprovedBy: state.currentActorId })
    return logEvent(next, { caseId: id, workflowName: cur.workflowName, action: '入力者承認', beforeAfter: '確認済 → 承認待ち' })
  }
  if (by === 'checker' && cur.status === 'business-approval-waiting') {
    // SoD: 入力者承認と同一 actor は承認者承認できない (四眼原則を system で強制、設定承認と共通 helper)
    if (isSelfApproval(cur.inputApprovedBy, state.currentActorId)) return state
    const next = patchCase(state, id, { status: 'reflected' })
    return logEvent(next, { caseId: id, workflowName: cur.workflowName, action: '承認者承認', beforeAfter: '承認待ち → 反映済', approvalId: `A-${8000 + state.auditSeq}` })
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
      const next = patchCase(state, action.id, {
        resolvedFieldIds: [...cur.resolvedFieldIds, action.fieldLabel],
        overrides: { ...cur.overrides, [action.fieldLabel]: action.value },
        flags: Math.max(0, cur.flags - 1),
      })
      return logEvent(next, { caseId: action.id, workflowName: cur.workflowName, action: '項目確定', beforeAfter: `${action.fieldLabel} を確定` })
    }
    case 'case/sendback': {
      // 差戻し precondition (remediation): ready / business-approval-waiting からのみ。終端 (reflected) / pending / sent-back は逆行させない。
      // reason/category は required (差戻し理由必須 modal が保証)。
      const cur = state.cases[action.id]
      if (!cur || (cur.status !== 'ready' && cur.status !== 'business-approval-waiting')) return state
      const next = patchCase(state, action.id, {
        status: 'sent-back',
        sendback: { reason: action.reason, category: action.category },
      })
      return logEvent(next, { caseId: action.id, workflowName: cur.workflowName, action: '差戻し', beforeAfter: `差戻し（${action.category}）: ${action.reason}` })
    }
    case 'case/escalate': {
      // 業務責任者へのエスカレーション (remediation P1-3 + W3 F-013): 裁定依頼を記録 (status 不変、JG-3=a)。
      // 受信 queue (/escalations) は escalation 有り & resolution 未確定で母集合判定。裁定 (続行可/差戻し) は case/resolveEscalation。
      // from = 起票 actor を記録し、裁定 closure を起票者へ因果として戻す (F-017)。重複 escalate は最新依頼で上書き (resolution リセット)。
      const cur = state.cases[action.id]
      if (!cur) return state
      const next = patchCase(state, action.id, {
        escalation: { reason: action.reason, category: action.category, to: action.to, from: state.currentActorId },
      })
      return logEvent(next, { caseId: action.id, workflowName: cur.workflowName, action: 'エスカレーション', beforeAfter: `裁定依頼 → ${action.to}（${action.category}）` })
    }
    case 'case/resolveEscalation': {
      // エスカレーション裁定 (W3 F-016/F-017、業務責任者の裁定面)。
      // SoD lock: 現 actor が escalation.to (指名された裁定者) でなければ no-op = 起票入力者の自己裁定を block (F-016)。
      // 未裁定 (resolution 未設定) の escalation のみ対象。proceed=続行可 (status 不変)、sendback=差戻し (status→sent-back)。
      const cur = state.cases[action.id]
      if (!cur || !cur.escalation || cur.escalation.resolution !== undefined) return state
      if (state.currentActorId !== cur.escalation.to) return state
      if (action.resolution === 'proceed') {
        // 肯定的裁定 (続行可): status は据え置き、escalation を resolved 化して queue/通知を閉じる (F-016 affirmative path)。
        const next = patchCase(state, action.id, { escalation: { ...cur.escalation, resolution: 'proceed' } })
        return logEvent(next, { caseId: action.id, workflowName: cur.workflowName, action: 'エスカレーション裁定', beforeAfter: `続行可（${cur.escalation.category}）` })
      }
      // 差戻し裁定: sent-back へ遷移 + sendback 記録 (case/sendback と同型) + escalation を resolved 化。理由は裁定者入力か元依頼を継承。
      const reason = action.reason ?? cur.escalation.reason
      const category = action.category ?? cur.escalation.category
      const next = patchCase(state, action.id, {
        status: 'sent-back',
        sendback: { reason, category },
        escalation: { ...cur.escalation, resolution: 'sendback' },
      })
      return logEvent(next, { caseId: action.id, workflowName: cur.workflowName, action: 'エスカレーション裁定', beforeAfter: `差戻し（${category}）: ${reason}` })
    }
    case 'case/assign':
      return patchCase(state, action.id, { assignee: action.assignee })
    case 'case/bulkApprove':
      return action.ids.reduce((acc, id) => approveCase(acc, id, action.by), state)
    case 'case/reverse': {
      // 反映済の訂正/取消 (remediation W3 C3、前進のみ→可逆)。
      // 不可逆 guard: reflected かつ未 reversal のみ可逆 (非終端 / 既 reversal は no-op)。
      // 訂正・取消 とも sent-back (差戻し再処理) へ。reversal 記録 (kind/理由) で intent を保持し通知/banner が区別する。
      // ready 直行を廃したのは false-success 回避 (反映済 field は確認済のままで、ready だと 1-click 再反映できてしまう)。
      // sent-back は再処理段階で 1-click 承認不可 → 訂正/取消の意味 (再処理が要る) と整合。
      const cur = state.cases[action.id]
      if (!cur || cur.status !== 'reflected' || cur.reversal !== undefined) return state
      const next = patchCase(state, action.id, {
        status: 'sent-back',
        reversal: { kind: action.kind, reason: action.reason },
      })
      return logEvent(next, { caseId: action.id, workflowName: cur.workflowName, action: action.kind, beforeAfter: `反映済を${action.kind}: ${action.reason}` })
    }
    case 'case/create': {
      // 手動起票 (remediation W3 C4、AI 障害時の業務継続)。id 重複は冪等 no-op。
      // 全項目 人手入力ゆえ flags 0 / status ready、入力値は overrides に載せ humanValue overlay (B1) で表示。
      if (state.cases[action.id]) return state
      const draft: CaseEntity = {
        id: action.id,
        workflowId: action.workflowId,
        workflowName: action.workflowName,
        status: 'ready',
        assignee: action.assignee,
        flags: 0,
        resolvedFieldIds: [...action.fieldLabels],
        overrides: { ...action.values },
        receivedAt: action.receivedAt,
      }
      const next = { ...state, cases: { ...state.cases, [action.id]: draft }, caseOrder: [...state.caseOrder, action.id] }
      return logEvent(next, { caseId: action.id, workflowName: action.workflowName, action: '手動起票', beforeAfter: '手動起票（全項目 人手入力、書類走査なし）' })
    }
    case 'case/reprocess': {
      // 差戻し/取消(reversal) 後の再処理 (F-018、dead-end 解消): sent-back → ready で入力者の再処理段階へ。
      // sendback/reversal 記録はクリア (再処理 = fresh handling)。who/when の証跡は auditEvents に残る (canonical)。
      const cur = state.cases[action.id]
      if (!cur || cur.status !== 'sent-back') return state
      const next = patchCase(state, action.id, { status: 'ready', sendback: undefined, reversal: undefined })
      return logEvent(next, { caseId: action.id, workflowName: cur.workflowName, action: '再処理', beforeAfter: '差戻し/取消 → 確認待ち（再処理）' })
    }
    case 'proposal/forward':
      // 上長へ送付: forwardedBy に送付 actor を記録 (W3 F-015 SoD の判定材料、案件 B4 / 設定 P1-3 と同型)。
      return state.proposals[action.id]?.status === 'pending-triage'
        ? patchProposal(state, action.id, { status: 'forwarded', forwardedBy: state.currentActorId })
        : state
    case 'proposal/approve': {
      // 提案承認 (W3 F-015): forwarded のみ。四眼原則 identity-SoD: 送付 actor 本人は承認不可 (案件/設定と共通 helper)。
      // デモは role 分離ゆえ非発火だが、3 承認層 (案件/手順/設定) で四眼強制ロジックを対称化する (asymmetry 解消)。
      const cur = state.proposals[action.id]
      if (!cur || cur.status !== 'forwarded') return state
      if (isSelfApproval(cur.forwardedBy, state.currentActorId)) return state
      return patchProposal(state, action.id, { status: 'approved' })
    }
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
      // kill-switch (W3 F-014): trust を 'supervised'(全件確認) へ実降格 (原状を trustBeforePause に保存) + paused + 理由保持。
      // 二重停止は冪等 (既 paused は原状を上書きしない)。停止を監査台帳に append (理由付き、Observatory で可視)。
      const cur = state.agents[action.id]
      if (!cur) return state
      if (cur.paused) return patchAgent(state, action.id, { pausedReason: action.reason })
      const next = patchAgent(state, action.id, {
        paused: true,
        pausedReason: action.reason,
        trustBeforePause: cur.trust,
        trust: 'supervised',
      })
      return logEvent(next, {
        caseId: action.id,
        workflowName: cur.workflowName,
        action: '緊急停止',
        beforeAfter: `${trustLevelLabel(cur.trust)} → 全件確認（緊急停止）: ${action.reason}`,
      })
    }
    case 'agent/resume': {
      // 緊急停止からの復帰 (W3 F-014): trust を原状回復 + paused/理由クリア + 再開理由を台帳に append。
      // 未停止は no-op (false 操作防止)。再開理由は UI で必須 (autonomy 再付与の根拠を捨てない)。
      const cur = state.agents[action.id]
      if (!cur || !cur.paused) return state
      const restored = cur.trustBeforePause ?? cur.trust
      const next = patchAgent(state, action.id, {
        paused: false,
        pausedReason: undefined,
        trust: restored,
        trustBeforePause: undefined,
      })
      return logEvent(next, {
        caseId: action.id,
        workflowName: cur.workflowName,
        action: '再開',
        beforeAfter: `全件確認 → ${trustLevelLabel(restored)}（緊急停止を解除）: ${action.reason}`,
      })
    }
    case 'store/hydrate':
      // W3 multi-tab: 他タブの外部書き込みを再 hydrate (last-write-wins)。validated state (persist guard 通過) をそのまま採用。
      return action.state
    case 'store/reset':
      return seed()
    default: {
      // 網羅性 check: 新 action 追加時に compile error で気付く
      const _exhaustive: never = action
      return _exhaustive
    }
  }
}
