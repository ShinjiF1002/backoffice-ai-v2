/**
 * localStorage 永続化 (Phase 1 — 状態基盤)。
 * - 永続対象は store の操作 state のみ (監査台帳は含まない = S8)。
 * - schema 変更時は SCHEMA_VERSION を bump。不一致/破損は静かに fallback (= seed) し白画面化を防ぐ。
 *   ★ state 型 (types.ts StoreState) を変えたら必ず SCHEMA_VERSION を上げること。
 */
import type { StoreState } from './types'
import { actorById } from './actors'

const STORAGE_KEY = 'bo-ai-v2:store'
// 2→3: remediation P0-W1 で CaseEntity.overrides + StoreState.currentActorId 追加 (B1/B4)。
// 3→4: remediation P0-W3 で AgentEntity.pausedReason 追加 (flywheel kill-switch、togglePause→emergencyStop/resume)。
// 4→5: remediation W2a で StoreState.readNotificationIds + CaseEntity.escalation +
//      AgentEntity.promotionStatus/promotionRequestedBy/promotionSendbackReason (旧 promotionRequested boolean を統合) 追加 (P1-2/P1-3)。
// 5→6: remediation W3 で CaseEntity.reversal (反映済の訂正/取消、C3) 追加 + CaseEntity.elapsedLabel(静的文字列)→receivedAt
//      (SLA を NOW 基準で派生化、§4 G7 / S8 fact-only) に置換。case 形が変わるため bump。
//      ★ deploy は SCHEMA bump ゆえ 6/12 demo と別日に置く (roadmap §6.2 risk #1、旧 v5 localStorage は seed fallback)。
// 旧 version は不一致で seed fallback (白画面化を防ぐ)。
const SCHEMA_VERSION = 6

interface Persisted {
  v: number
  state: StoreState
}

/** 同一 version でも形が壊れた state (例 cases 欠落) を弾く shape guard。selector の白画面化を防ぐ。 */
function isStoreStateShape(s: unknown): s is StoreState {
  if (!s || typeof s !== 'object') return false
  const o = s as Record<string, unknown>
  const isDict = (v: unknown) => typeof v === 'object' && v !== null && !Array.isArray(v)
  if (
    !(
      isDict(o.cases) &&
      Array.isArray(o.caseOrder) &&
      isDict(o.proposals) &&
      Array.isArray(o.proposalOrder) &&
      isDict(o.agents) &&
      Array.isArray(o.agentOrder) &&
      typeof o.currentActorId === 'string' &&
      Array.isArray(o.readNotificationIds)
    )
  ) {
    return false
  }
  // currentActorId は実在 actor であること (B4 SoD の主キー、tampered localStorage の不正値化を防ぐ)。
  if (!actorById(o.currentActorId as string)) return false
  // v3 深掘り: 各 case は overlay 前提の resolvedFieldIds 配列 + overrides dict を持つこと (B1)。欠落は seed fallback。
  const casesValid = Object.values(o.cases as Record<string, unknown>).every((c) => {
    if (!isDict(c)) return false
    const cc = c as Record<string, unknown>
    return Array.isArray(cc.resolvedFieldIds) && isDict(cc.overrides)
  })
  if (!casesValid) return false
  // order↔dict 整合: order の各 id が対応 dict に実在すること。不整合は selector の undefined 参照 (白画面化) を招くため fallback。
  const cases = o.cases as Record<string, unknown>
  const proposals = o.proposals as Record<string, unknown>
  const agents = o.agents as Record<string, unknown>
  return (
    (o.caseOrder as unknown[]).every((id) => isDict(cases[id as string])) &&
    (o.proposalOrder as unknown[]).every((id) => isDict(proposals[id as string])) &&
    (o.agentOrder as unknown[]).every((id) => isDict(agents[id as string]))
  )
}

/** localStorage から復元。version 不一致 / shape 不正 / parse 失敗 / SSR 環境は fallback を返す。 */
export function loadPersisted(fallback: StoreState): StoreState {
  try {
    if (typeof localStorage === 'undefined') return fallback
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return fallback
    const parsed = JSON.parse(raw) as Persisted
    if (parsed?.v !== SCHEMA_VERSION || !isStoreStateShape(parsed.state)) return fallback
    return parsed.state
  } catch {
    return fallback
  }
}

/** 現 state を保存。quota 超過等は握り潰す (mock のため許容)。 */
export function savePersisted(state: StoreState): void {
  try {
    if (typeof localStorage === 'undefined') return
    const payload: Persisted = { v: SCHEMA_VERSION, state }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch {
    /* no-op */
  }
}

/** 永続化を消去 (「表示データを初期化」reset 用、Phase 4)。 */
export function clearPersisted(): void {
  try {
    if (typeof localStorage === 'undefined') return
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* no-op */
  }
}
