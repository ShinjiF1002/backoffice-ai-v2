/**
 * localStorage 永続化 (Phase 1 — 状態基盤)。
 * - 永続対象は store の操作 state のみ (監査台帳は含まない = S8)。
 * - schema 変更時は SCHEMA_VERSION を bump。不一致/破損は静かに fallback (= seed) し白画面化を防ぐ。
 *   ★ state 型 (types.ts StoreState) を変えたら必ず SCHEMA_VERSION を上げること。
 */
import type { StoreState } from './types'

const STORAGE_KEY = 'bo-ai-v2:store'
const SCHEMA_VERSION = 2 // Phase 4b: CaseEntity に resolvedFieldIds 追加 (1→2)

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
      Array.isArray(o.agentOrder)
    )
  ) {
    return false
  }
  // v2 深掘り (R2): 各 case は overlay 前提の resolvedFieldIds 配列を持つこと。欠落は seed fallback。
  return Object.values(o.cases as Record<string, unknown>).every(
    (c) => isDict(c) && Array.isArray((c as Record<string, unknown>).resolvedFieldIds),
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
