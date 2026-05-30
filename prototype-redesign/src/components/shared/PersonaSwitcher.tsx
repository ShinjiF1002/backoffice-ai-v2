import { UserRoundCogIcon } from 'lucide-react'
import { DEMO_ACTORS, roleLabel } from '@/store/actors'
import { useCurrentActor, useStoreDispatch } from '@/store/hooks'

/**
 * PersonaSwitcher — demo 操作者 (persona) の切替 chrome (remediation B4、新 chrome)
 * SSOT: ia-overview-v2 §2 (TopBar chrome) + p0-remediation-plan §4 B4 (Gate 4a 承認済)
 *
 * 配置: TopBar 右、PrototypeModeLabel 近傍。session/switchActor を dispatch して currentActorId を切替える。
 * 役割: SoD (四眼原則) は単一端末 demo のため、入力者→承認者 を同端末で演じ分ける手段が要る。
 *   本 switcher は demo 専用 (本番 RBAC/IdP は scope-out)。CaseDetail/ProposalDetail の操作ビューは
 *   この actor role から導出され、自己承認 block は reducer が currentActorId で強制する。
 * JP-only / lucide Icon suffix / off-token hex 禁止 を遵守。
 */
export function PersonaSwitcher() {
  const actor = useCurrentActor()
  const dispatch = useStoreDispatch()

  return (
    <label
      title="操作者（デモ用の担当者）を切替えます。入力者と承認者を演じ分けて職務分離を確認できます。"
      className="flex items-center gap-1 rounded-md border border-[var(--color-border)] bg-[var(--color-panel-inset)] py-1 pl-2 pr-1 text-[11px] sm:gap-1.5"
    >
      <UserRoundCogIcon className="h-3.5 w-3.5 flex-shrink-0 text-[var(--color-fg-muted)]" aria-hidden="true" />
      {/* 狭幅では label を畳み icon + select のみ (mobile でも SoD 切替を可能に保つ)。 */}
      <span className="hidden whitespace-nowrap text-[var(--color-fg-muted)] sm:inline">操作者</span>
      <select
        aria-label="操作者（デモ用の担当者）の切替"
        value={actor?.id ?? ''}
        onChange={(e) => dispatch({ type: 'session/switchActor', actorId: e.target.value })}
        className="max-w-[10rem] cursor-pointer truncate rounded-[var(--radius-control)] border-0 bg-transparent py-0.5 pl-1 pr-0.5 text-[11px] font-medium text-[var(--color-fg)] outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--color-primary)]"
      >
        {DEMO_ACTORS.map((a) => (
          <option key={a.id} value={a.id}>
            {a.name}（{roleLabel(a.role)}）
          </option>
        ))}
      </select>
    </label>
  )
}
