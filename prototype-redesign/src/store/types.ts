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

/**
 * Agent 設定変更 (昇格) 申請の承認状態 (remediation P1-3、旧 promotionRequested boolean を統合)。
 * none → (requestPromotion) → requested → (approvePromotion) → approved / (sendbackPromotion) → none (理由保持)。
 * sent-back は none + promotionSendbackReason で表現し再申請を許す (C1「昇格が永久停止」解消)。
 */
export type PromotionStatus = 'none' | 'requested' | 'approved'

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
  /**
   * 業務責任者へのエスカレーション (remediation P1-3、難案件の裁定依頼)。
   * 受信 queue (/escalations) の母集合判定 = この field が存在する case。
   * 裁定の帰結 (JG-3=a) は既存 case/sendback (差戻し) を再利用し、本 field は依頼記録に徹する (status は変えない)。
   */
  escalation?: { reason: string; category: string; to: string }
  /**
   * 反映済 (terminal) の訂正/取消 記録 (remediation W3 C3、前進のみ→可逆)。
   * 存在 = 既に reversal 済 = 不可逆 guard の discriminant (二重 reversal を block)。理由を捨てない。
   */
  reversal?: { kind: '訂正' | '取消'; reason: string }
  /** 受付日時 (ISO、SLA 経過の基準 fact)。表示 label は lib/dates で派生 (S8: 派生表示を store に持たない)。 */
  receivedAt: string
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
  /** 設定変更 (昇格) 申請の承認状態 (remediation P1-3、旧 promotionRequested boolean を統合)。 */
  promotionStatus: PromotionStatus
  /** 昇格を申請した actorId (remediation P1-3 SoD: 同一 actor の設定承認を block する判定材料、案件 B4 と同型)。 */
  promotionRequestedBy?: string
  /** 直近の設定承認差戻し理由 (remediation P1-3、申請者が参照し再申請に活かす。理由を捨てない)。 */
  promotionSendbackReason?: string
  /** 緊急停止 (kill-switch) で全件確認へ降格された状態 (remediation flywheel、AgentDetail/Agents で可視化)。 */
  paused: boolean
  /** 緊急停止の理由 (kill-switch 操作時に保持、resume で解除)。理由を捨てない。 */
  pausedReason?: string
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
  /**
   * 既読化した通知 id 群 (remediation P1-2、/inbox 未読バッジの算出材料)。
   * 通知自体は store entity ではなく派生 selector で都度算出する (S8 境界)。本 field は既読 fact のみ保持し、
   * 通知 id = 由来 entity から決定的に導く安定文字列 (例 `sendback:${caseId}`)。未読数 = 派生通知数 − 既読集合。
   */
  readNotificationIds: string[]
}

/**
 * 操作 Action union。reducer (storeReducer) が処理。
 * case/approve の `by` は入力者/承認者を区別 (ready→承認待ち / 承認待ち→反映)。SoD (四眼原則) は
 *   reducer が `state.currentActorId` を参照して強制する (同一 actor の入力者→承認者承認を block、remediation B4)。
 * 要確認 (flags > 0) の案件は入力者承認で前進しない (reducer 不変条件)。
 * case/override (remediation B1): field 確定/上書きで resolvedFieldIds に追加 + flags 減算 + 訂正値 (value) を overrides に格納。
 *   value は「人が確定した値」を表す単一概念で、「申請書類の値で確定」(value=申請書類値) と「手入力で上書き」(value=手入力値) の
 *   両方を 1 action で表現する (accept も confirmed 値の persist/表示が要るため、両者の reducer 挙動は同一)。
 *   Gate 1 既定の case/confirm + case/override 2 action 分離は label のみの差で挙動同一のため deferred (W1 単一 action を踏襲)。
 *   value は P0-W3 UI 配線 (FieldActionModal 訂正値入力欄) 完了で required 化済 (空で確定不可を modal が保証)。
 * case/sendback / proposal/reject / proposal/sendback (remediation sendback-guard): reason は P0-W3 UI 配線後に
 *   required 化済 (理由必須 modal が保証、理由を捨てず store に保持)。case/sendback は precondition (ready / business-approval-waiting のみ)。
 *   category は case/sendback は必須、proposal は任意 (ReasonDialog が category を持たないため)。
 * agent/emergencyStop / agent/resume (remediation flywheel、旧 togglePause を分割): kill-switch で全件確認へ降格 / 復帰。
 *   emergencyStop は停止理由を必須で pausedReason に保持 (AI 停止の根拠を捨てない、理由必須 modal が保証)。
 * agent/approvePromotion / sendbackPromotion (remediation P1-3、設定承認): requested → approved / none。
 *   SoD (四眼原則を設定層へ拡張): 申請 actor (promotionRequestedBy) と承認 actor (state.currentActorId) が同一なら no-op block。
 *   案件 B4 と同一 helper (isSelfApproval) を再利用し SoD を 案件/設定 で統一する (再発明しない)。承認 actor は store の現 actor を用いる。
 * case/escalate (remediation P1-3): 難案件を業務責任者へ裁定依頼。escalation 記録のみ (status は変えない、裁定の帰結は別途 case/sendback)。
 * case/reverse (remediation W3 C3、前進のみ→可逆): 反映済の訂正/取消。不可逆 guard = reflected かつ未 reversal のみ (二重 reversal は no-op)。
 *   訂正 → ready (入力者が再確認) / 取消 → sent-back (再処理 queue)。reversal 記録で kind/理由を保持 (理由を捨てない)。
 * case/create (remediation W3 C4、手動起票 = AI 障害時の業務継続): id 重複は冪等 no-op。全項目 人手入力ゆえ flags 0 / status ready、
 *   入力値は overrides に載せ humanValue overlay (B1) で表示。受付日時は action.receivedAt (UI が NOW を供給、store は lib/dates 非依存)。
 * notification/markRead / markAllRead (remediation P1-2): /inbox の既読化。冪等。markAllRead は現 selector が算出した通知 id 群を ids で受ける
 *   (通知 universe の算出責務を selector 側に閉じ、reducer は既読 fact の追記に徹する)。
 */
export type StoreAction =
  | { type: 'case/approve'; id: string; by: 'input' | 'checker' }
  | { type: 'case/override'; id: string; fieldLabel: string; value: string }
  | { type: 'case/sendback'; id: string; reason: string; category: string }
  | { type: 'case/escalate'; id: string; reason: string; category: string; to: string }
  | { type: 'case/assign'; id: string; assignee: string }
  | { type: 'case/bulkApprove'; ids: string[]; by: 'input' | 'checker' }
  | { type: 'case/reverse'; id: string; kind: '訂正' | '取消'; reason: string }
  | {
      type: 'case/create'
      id: string
      workflowId: string
      workflowName: string
      assignee?: string
      fieldLabels: string[]
      values: Record<string, string>
      receivedAt: string
    }
  | { type: 'proposal/forward'; id: string }
  | { type: 'proposal/approve'; id: string }
  | { type: 'proposal/reject'; id: string; reason: string; category?: string }
  | { type: 'proposal/sendback'; id: string; reason: string; category?: string }
  | { type: 'agent/requestPromotion'; id: string }
  | { type: 'agent/approvePromotion'; id: string }
  | { type: 'agent/sendbackPromotion'; id: string; reason: string }
  | { type: 'agent/emergencyStop'; id: string; reason: string }
  | { type: 'agent/resume'; id: string }
  | { type: 'notification/markRead'; id: string }
  | { type: 'notification/markAllRead'; ids: string[] }
  | { type: 'session/switchActor'; actorId: string }
  | { type: 'store/hydrate'; state: StoreState }
  | { type: 'store/reset' }
