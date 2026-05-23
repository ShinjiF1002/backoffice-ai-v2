import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

/**
 * PageFooter — page sticky footer primitive (Day 14 P1.5 C4、Plan B-lite v2.6 / Review #1 F-04)
 *
 * Compositional layout shell:
 * - outer class (`border-t border-slate-200 bg-white px-6 py-3`) を primitive 内に固定
 * - 内部 layout は ReactNode 経由で柔軟 (disabled wrapper span / Link element / chip group / mono caption 等を吸収)
 *
 * Variant ではなく ReactNode props で構成 (Explore verify 済): 4 page (CaseReview / ProposalReview / Dashboard / Metrics) で異なる構成を 1 primitive で吸収。
 *
 * 用例:
 * - **CaseReview / ProposalReview** (actions): `<PageFooter left={<>explainer</>} right={<>BusinessApprovalChip + buttons</>} />`
 * - **Dashboard** (meta + caption): `<PageFooter left={<>explainer</>} caption={<>表示対象: UC-BO-01 + UC-BO-02</>} className="text-xs text-slate-500" />`
 * - **Metrics** (link + caption): `<PageFooter left={<Link>ダッシュボードに戻る</Link>} caption={<>検証用 KPI 表示の拡張...</>} />`
 */

interface Props {
  /** Left content (explainer text / breadcrumb hand-off link 等) */
  left?: ReactNode
  /** Right content (action group / chip / button cluster、内部で flex gap-2 適用) */
  right?: ReactNode
  /** Right-aligned mono caption (font-mono text-[10px] text-slate-400 tabular auto-applied) */
  caption?: ReactNode
  /** Outer className 上書き (例: Dashboard の `text-xs text-slate-500`) */
  className?: string
}

export function PageFooter({ left, right, caption, className }: Props) {
  return (
    <footer className={cn('border-t border-slate-200 bg-white px-6 py-3', className)}>
      <div className="flex items-center justify-between gap-3">
        <div>{left}</div>
        {(right || caption) && (
          <div className="flex items-center gap-3">
            {right && <div className="flex items-center gap-2">{right}</div>}
            {caption && (
              <span className="font-mono text-[10px] text-slate-400 tabular">{caption}</span>
            )}
          </div>
        )}
      </div>
    </footer>
  )
}
