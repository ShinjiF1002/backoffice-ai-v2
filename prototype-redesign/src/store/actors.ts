/**
 * Demo persona (B4 SoD = 入力者≠承認者の四眼原則)。
 * remediation P0-W1: SoD は reducer が `state.currentActorId` を参照して強制する。
 * persona switcher (UI) は P0-W3 で `session/switchActor` を dispatch して currentActorId を切替える。
 * これは demo 用の最小 actor 集合 (本番 RBAC/IdP は scope-out、production-remediation R1-3 に carve)。
 */
export type ActorRole = 'inputter' | 'checker' | 'business-approver'

export interface DemoActor {
  id: string
  /** 表示名 (mock-case-list の owner 氏名と整合) */
  name: string
  role: ActorRole
}

/** demo の操作 actor。入力者と承認者は別人 = SoD が成立する最小構成。 */
export const DEMO_ACTORS: DemoActor[] = [
  { id: 'actor-inputter', name: '山田太郎', role: 'inputter' },
  { id: 'actor-checker', name: '鈴木課長', role: 'checker' },
  { id: 'actor-approver', name: '業務責任者', role: 'business-approver' },
]

/** 初期 actor (入力者)。seed() / store reset の currentActorId。 */
export const DEFAULT_ACTOR_ID = 'actor-inputter'

export function actorById(id: string): DemoActor | undefined {
  return DEMO_ACTORS.find((a) => a.id === id)
}

/** role → 業務語ラベル (persona switcher / Sidebar / SoD 表示で共通利用、Tier 1 語彙)。 */
const ROLE_LABEL: Record<ActorRole, string> = {
  inputter: '入力者',
  checker: '承認者',
  'business-approver': '業務責任者',
}

export function roleLabel(role: ActorRole): string {
  return ROLE_LABEL[role]
}
