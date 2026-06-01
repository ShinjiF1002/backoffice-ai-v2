/**
 * localStorage 永続化 (Phase 1 — 状態基盤)。
 * - 永続対象は store の操作 state。**静的参照台帳 (OBS_LEDGER) は含まない** (S8)。
 *   一方 **セッション操作証跡 (auditEvents、F-002) は永続化する** — 永続化済 case state (例 reflected) と台帳行を整合させるため。
 *   これは backend 証跡統制 (WORM/改竄防止/保持) の主張ではなく session 操作記録で、Observatory が honest disclaimer を併記する。
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
// 6→7: F-002 で StoreState.auditEvents + auditSeq (セッション操作証跡、append-only) 追加。旧 v6 は version 不一致で seed fallback。
//      ★ 同上 SCHEMA bump deploy 注意 (demo 当日と別日)。
// 7→8: v3 W3 で CaseEntity.escalation に from/resolution (F-016/F-017 裁定 closure) + AgentEntity.trustBeforePause
//      (F-014 kill-switch 実降格の原状保存) を追加。いずれも optional だが state 型変更ゆえ bump (旧 v7 は seed fallback)。
// 旧 version は不一致で seed fallback (白画面化を防ぐ)。
const SCHEMA_VERSION = 8

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
  // F-002: 同一 version でも auditEvents/auditSeq が malformed (非 array / 非 number) なら弾く。
  // 欠落 (undefined) は withAuditDefaults が補完するため許容、present-but-malformed のみ fallback させ
  // useCrossLedger の spread に壊れた値が流れないようにする。
  if (o.auditEvents !== undefined && !Array.isArray(o.auditEvents)) return false
  if (o.auditSeq !== undefined && typeof o.auditSeq !== 'number') return false
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

/**
 * F-002: 復元 state に auditEvents/auditSeq を補完。両 load path (loadPersisted / loadPersistedFromStorageEvent) で共用し、
 * 旧 shape や tampered で欠落しても selector (useCrossLedger の spread) を白画面化させない。
 */
function withAuditDefaults(state: StoreState): StoreState {
  return {
    ...state,
    auditEvents: Array.isArray(state.auditEvents) ? state.auditEvents : [],
    auditSeq: typeof state.auditSeq === 'number' ? state.auditSeq : 0,
  }
}

/** localStorage から復元。version 不一致 / shape 不正 / parse 失敗 / SSR 環境は fallback を返す。 */
export function loadPersisted(fallback: StoreState): StoreState {
  try {
    if (typeof localStorage === 'undefined') return fallback
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return fallback
    const parsed = JSON.parse(raw) as Persisted
    if (parsed?.v !== SCHEMA_VERSION || !isStoreStateShape(parsed.state)) return fallback
    return withAuditDefaults(parsed.state)
  } catch {
    return fallback
  }
}

/** 現 state を保存。quota 超過等は握り潰す (mock のため許容)。 */
export function savePersisted(state: StoreState): void {
  try {
    if (typeof localStorage === 'undefined') return
    const payload = JSON.stringify({ v: SCHEMA_VERSION, state })
    // 同値の再書き込みは skip (multi-tab の hydrate→save→storage event ping-pong を防ぐ + 無害な write 削減)。
    if (localStorage.getItem(STORAGE_KEY) === payload) return
    localStorage.setItem(STORAGE_KEY, payload)
  } catch {
    /* no-op */
  }
}

/**
 * 他タブの localStorage 書き込み (StorageEvent) から validated state を復元 (W3 multi-tab、last-write-wins)。
 * 対象 key 以外 / clear / 不正 shape / version 不一致は null (= 無視、現 state 据え置き)。StoreProvider が dispatch する。
 */
export function loadPersistedFromStorageEvent(e: StorageEvent): StoreState | null {
  if (e.key !== STORAGE_KEY) return null // ViewContext 等の別 key を無視
  if (!e.newValue) return null // removeItem / clear は無視 (現 state 据え置き)
  try {
    const parsed = JSON.parse(e.newValue) as Persisted
    if (parsed?.v !== SCHEMA_VERSION || !isStoreStateShape(parsed.state)) return null
    return withAuditDefaults(parsed.state)
  } catch {
    return null
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
