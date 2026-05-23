import { Info } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

/**
 * HypothesisChip — `[仮説 / 要検証]` hedge consolidation primitive (Day 19 Commit 1、Plan v1.4 U-1)
 *
 * SSOT: prototype/audit/day-19-ux-clarity-integrated-plan.md v1.4 Commit 1
 *
 * 4-AI audit 統合で確定: per-card `[仮説 / 要検証]` 反復 25+ surface を section-level + page-level に集約。
 * Codex section-level approach + Claude design HypothesisChip primitive の合成案。
 *
 * 2 mode:
 *  - **framing**: section/page top の slate-50 inset banner、Info icon + 全文 hedge 説明。
 *    用途: Metrics framing 注、KnowledgeBrowser citation governance (carve-out で別途使用)
 *  - **summary**: section heading 横の compact chip、`仮判定 2/4` 等の short summary。
 *    用途: Hero KPI gate、補助 KPI 表、KRI grid、Sparkline section、KPI 進化要件
 *
 * 規範:
 *  - MetaChip 系列 (Day 16 C1a chip taxonomy、`rounded-md` 6px、border なし)
 *  - Tier 1 governance 違反なし (hedge は KPI/SLO 値の Phase 1 検証仮説性質を retain)
 *  - 装飾排除 (Operational Premium Light §2.7、gradient / glow / motion なし)
 */

type HypothesisKind = 'framing' | 'summary'

interface HypothesisChipProps {
  kind: HypothesisKind
  /** chip / banner 内に表示する文字列 or ReactNode */
  children: ReactNode
  className?: string
}

export function HypothesisChip({ kind, children, className }: HypothesisChipProps) {
  if (kind === 'framing') {
    return (
      <div
        className={cn(
          'rounded-md border border-slate-200 bg-slate-50 p-4 text-[12px] leading-relaxed text-slate-700',
          className
        )}
      >
        <div className="flex items-start gap-2.5">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </div>
    )
  }

  // summary kind = compact mono chip (MetaChip 系列、border-less、slate-100 bg + slate-600 text)
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[10px] text-slate-600 tabular',
        className
      )}
    >
      <Info className="h-2.5 w-2.5" aria-hidden="true" />
      {children}
    </span>
  )
}
