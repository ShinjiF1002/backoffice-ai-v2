import { Link } from 'react-router-dom'
import { ArrowRight, Target } from 'lucide-react'
import { cn } from '@/lib/cn'

/**
 * NextActionStrip — page L1 primary action anchor (Day 19 Commit 3c、Plan v1.4 U-13)
 *
 * SSOT: prototype/audit/day-19-ux-clarity-integrated-plan.md v1.4 Commit 3c
 *
 * Industry reference: NH1 Visibility + K5S 5-Second Test + NH7 Flexibility + NFC First-Click Test
 *
 * 用途:
 *  - Dashboard / Inbox: action mode (`actionHref` 付き)、`次に処理すべき案件` CTA
 *  - CaseReview / ProposalReview: summary mode (`actionHref={null}`)、L1 anchor は判定 summary、primary CTA は既存 footer button
 *
 * 規範:
 *  - 装飾排除 (Operational Premium Light §2.7)、shadow / motion なし
 *  - slate-50 background tint (PageHeader 直下 anchor、L1 visible)
 *  - 単一行 (overflow-truncate)、PageHeader と被らない密度
 */

interface NextActionStripProps {
  /** 左 label (例: `次に処理すべき案件`、`判定 summary`、`提案 summary`) */
  label: string
  /** 右 summary 本文 (例: `CASE-2026-0148 (経過 03:45:51)`、`AI 入力結果 5 field 確認、信頼度 0.84 で閾値未達`) */
  summary: string
  /** action mode 時の 行き先 URL (null = summary mode、CTA 非表示) */
  actionHref: string | null
  className?: string
}

export function NextActionStrip({ label, summary, actionHref, className }: NextActionStripProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-6 py-2.5',
        className
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        <Target className="h-3.5 w-3.5 shrink-0 text-[var(--color-primary)]" aria-hidden="true" />
        <span className="shrink-0 text-[11px] font-medium text-slate-700">{label}</span>
        <span className="text-slate-300" aria-hidden="true">·</span>
        <span className="truncate text-xs text-slate-700">{summary}</span>
      </div>
      {actionHref && (
        <Link
          to={actionHref}
          className="inline-flex shrink-0 items-center gap-1 rounded-md bg-[var(--color-primary)] px-2.5 py-1 text-[11px] font-medium text-white transition-colors hover:bg-[var(--color-primary-strong)]"
        >
          開く
          <ArrowRight className="h-3 w-3" aria-hidden="true" />
        </Link>
      )}
    </div>
  )
}
