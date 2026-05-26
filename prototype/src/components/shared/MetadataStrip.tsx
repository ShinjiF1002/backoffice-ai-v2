import { useEffect, useRef, useState } from 'react'
import { CircleCheck, Eye } from 'lucide-react'
import type { Reversibility } from '@/data/types'
import { cn } from '@/lib/cn'

/**
 * MetadataStrip — F-2 Wave 2 PR 2 Commit 3 (Implementation Plan v3.0、gate1-decision.md spec)
 *
 * Card 2 ★ diff-and-change-preview-ui の "1 metadata strip" 部分:
 *  - Change author / Change reason / Confidence / Affected scope / Reversibility の 5 element
 *  - Header (PageHeader 直下) / Footer (sticky action bar 直上) の 2 placement
 *  - 承認 button gate: `onAck` を IntersectionObserver で trigger、user が strip を 1 度見たことを ack 化
 *
 * Operational Premium Light 規範:
 *  - bg-slate-50 (soft) + border-slate-200 hairline、装飾要素 0
 *  - inline-flex で horizontal 1 行 (mobile flex-wrap で 2-3 行に折返し許容)
 *  - text 10-11px、JetBrains Mono は confidence numeric のみ
 *
 * Day 19 5 primitive と整合 (HypothesisChip と同じ shared/ 配置、cn() + Tailwind density baseline)
 */

interface MetadataStripProps {
  /** Change author (AI agent name + model version) */
  changeAuthor?: string
  /** Change reason (operational rationale) */
  changeReason?: string
  /** AI confidence (0-1、numeric 表示) */
  confidence?: number
  /** Affected scope (customer count / $ amount / regulator-touchable Y/N) */
  affectedScope?: string
  /** Reversibility (Revertible / Partial / Irreversible) */
  reversibility?: Reversibility
  /** Placement: PageHeader 直下 / sticky footer 直上 */
  placement?: 'header' | 'footer'
  /** Approval gate trigger — strip が viewport に入った瞬間 fire (IntersectionObserver) */
  onAck?: () => void
  className?: string
}

const reversibilityLabel: Record<Reversibility, string> = {
  Revertible: 'rollback 可',
  Partial: 'rollback 部分',
  Irreversible: 'rollback 不可',
}

const reversibilityToneClass: Record<Reversibility, string> = {
  Revertible: 'text-emerald-700 bg-emerald-50',
  Partial: 'text-amber-800 bg-amber-50',
  Irreversible: 'text-red-700 bg-red-50',
}

export function MetadataStrip({
  changeAuthor,
  changeReason,
  confidence,
  affectedScope,
  reversibility,
  placement = 'footer',
  onAck,
  className,
}: MetadataStripProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [acked, setAcked] = useState(false)

  useEffect(() => {
    if (!onAck || acked) return
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            setAcked(true)
            onAck()
            observer.disconnect()
            break
          }
        }
      },
      { threshold: 0.6 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [onAck, acked])

  // すべての field が undefined なら render しない
  if (!changeAuthor && !changeReason && confidence === undefined && !affectedScope && !reversibility) {
    return null
  }

  return (
    <div
      ref={ref}
      role="region"
      aria-label="変更メタデータ"
      className={cn(
        'flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-700',
        placement === 'header' ? 'mb-3' : 'mt-3',
        className
      )}
    >
      {acked && onAck && (
        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700">
          <CircleCheck className="h-3 w-3" aria-hidden="true" />
          <span>確認済</span>
        </span>
      )}
      {!acked && onAck && (
        <span className="inline-flex items-center gap-1 text-[10px] text-slate-500">
          <Eye className="h-3 w-3" aria-hidden="true" />
          <span>内容を確認してください</span>
        </span>
      )}
      {changeAuthor && (
        <span className="inline-flex items-center gap-1">
          <span className="text-slate-500">変更者</span>
          <span className="font-medium text-slate-900">{changeAuthor}</span>
        </span>
      )}
      {changeReason && (
        <span className="inline-flex min-w-0 items-center gap-1">
          <span className="text-slate-500">理由</span>
          <span className="truncate text-slate-700" title={changeReason}>
            {changeReason}
          </span>
        </span>
      )}
      {confidence !== undefined && (
        <span className="inline-flex items-center gap-1">
          <span className="text-slate-500">信頼度</span>
          <span className="font-mono font-medium tabular text-slate-900">{confidence.toFixed(2)}</span>
        </span>
      )}
      {affectedScope && (
        <span className="inline-flex items-center gap-1">
          <span className="text-slate-500">影響範囲</span>
          <span className="text-slate-700">{affectedScope}</span>
        </span>
      )}
      {reversibility && (
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium',
            reversibilityToneClass[reversibility]
          )}
        >
          {reversibilityLabel[reversibility]}
        </span>
      )}
    </div>
  )
}
