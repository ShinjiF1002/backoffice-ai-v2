/**
 * Actor mapping table — Wave 2 F-5 ActorBand primitive 用
 *
 * SSOT:
 * - Implementation Plan v3.0 §PR 2 Commit 5 (F-5 ActorBand)
 * - gate1-decision.md Open Q Resolution #3 (両方 `'human'` に統合)
 *
 * Day 19 EvidenceTimeline paraphrase で表示する actor 名 (`'AI' | '入力者' | '承認者' | 'system'`) を
 * 3-enum (`'agent' | 'human' | 'system'`) に正規化し、ActorBand primitive の color band + icon 切替に使う。
 * Role 詳細 (入力者 vs 承認者) は ActorBand の label / aria-label / hover で表現。
 */
import type { Actor } from '../data/types'

/** EvidenceStep.actor (Day 19 既存 enum) → ActorBand 3-enum */
export const evidenceActorToActorBand: Record<'AI' | '入力者' | '承認者' | 'system', Actor> = {
  AI: 'agent',
  入力者: 'human',
  承認者: 'human',
  system: 'system',
}

/** CaseLifecycleStepSpec.approver.role → ActorBand 3-enum */
export const stepApproverRoleToActorBand: Record<
  '入力者' | '承認者' | 'AI' | 'system',
  Actor
> = {
  入力者: 'human',
  承認者: 'human',
  AI: 'agent',
  system: 'system',
}

/** Operational Premium Light token mapping (新規 token 追加なし、既存 token のみ binding) */
export const actorColorClass: Record<Actor, string> = {
  agent: 'bg-[var(--color-primary)]', // indigo (#635BFF)
  human: 'bg-slate-600',
  system: 'bg-slate-400',
}

/** Actor + icon name pair (lucide-react: Bot / User / Cog) */
export const actorIconName: Record<Actor, 'Bot' | 'User' | 'Cog'> = {
  agent: 'Bot',
  human: 'User',
  system: 'Cog',
}

/** Actor 日本語 label (aria-label / tooltip 用、role 情報は別途 prop) */
export const actorLabelJa: Record<Actor, string> = {
  agent: 'AI',
  human: '人',
  system: 'システム',
}
