import { useId, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

/**
 * DisabledAction — disabled CTA shared component (Day 18.5 Commit 2、Plan v3.2 D3)
 * SSOT: docs/03-ui-prototype-design.md §2.x (Day 18.5 SSOT refresh で追記)
 *
 * 3-mode で disabled button の reason 伝達を統一:
 *  - **wrapper** (CR R32+R38 既存 precedent): native browser title (wrapper span)、UI の唯一 affordance source
 *  - **caption**: visible page/footer caption + `aria-describedby`、SR + visible 両方で affordance 明示
 *  - **inline**: button 直下に visible reason text + `aria-describedby`、advanced (Day 18.5 では未使用)
 *
 * 設計根拠 (Plan v3.2 R2 + P1-3):
 *  - HTML native `<button disabled>` は title が多くの browser で表示されない (FilterChip.tsx:20 docstring 参照)
 *  - そのため wrapper mode は `<span title>` 経由 (CR R32+R38)
 *  - caption mode + aria-describedby は disabled button 自体に直接適用 (SR で読み上げ)
 *  - `useId()` は関数先頭で無条件呼出 (Rules of Hooks)、inline mode で使用
 *
 * 使用例:
 *  - SendBackComment 差戻しを記録 (footer caption あり) → caption mode
 *  - AgentSettings 引き上げ申請 (section 内、footer caption 無関係) → wrapper mode
 *  - ProposalReview 差戻し / 業務責任者へ送付 → wrapper mode (CR R32+R38 既存 keep)
 */

type DisabledActionMode = 'wrapper' | 'caption' | 'inline'

interface DisabledActionProps {
  mode: DisabledActionMode
  /** wrapper mode の title 用 / caption / inline で SR 補強用 (空文字許容) */
  reason: string
  /** caption mode で必須: visible footer / page caption の id */
  captionId?: string
  /** button 内 element の className (rendering customize) */
  className?: string
  children: ReactNode
}

export function DisabledAction({
  mode,
  reason,
  captionId,
  className,
  children,
}: DisabledActionProps) {
  // Rules of Hooks: useId は関数先頭で無条件呼出、inline mode のみ使用
  const inlineId = useId()

  const buttonNode = (
    <button
      type="button"
      disabled
      aria-disabled="true"
      aria-describedby={
        mode === 'caption' ? captionId : mode === 'inline' ? inlineId : undefined
      }
      className={cn('cursor-not-allowed', className)}
    >
      {children}
    </button>
  )

  if (mode === 'wrapper') {
    // CR R32+R38 既存 pattern: native browser title
    return (
      <span className="inline-flex" title={reason}>
        {buttonNode}
      </span>
    )
  }

  if (mode === 'caption') {
    if (!captionId) {
      throw new Error('DisabledAction: captionId is required for mode="caption"')
    }
    return buttonNode
  }

  // mode === 'inline'
  return (
    <span className="inline-flex flex-col gap-1">
      {buttonNode}
      <span id={inlineId} className="text-xs text-slate-500">
        {reason}
      </span>
    </span>
  )
}
