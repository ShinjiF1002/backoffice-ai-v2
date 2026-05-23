import { useState } from 'react'
import { Info, ChevronDown } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

/**
 * PageHelpDisclosure — page-level help text expand toggle (Day 19 Commit 3a、Plan v1.4 U-5)
 *
 * SSOT: prototype/audit/day-19-ux-clarity-integrated-plan.md v1.4 Commit 3a
 *
 * 用途: Metrics / AuditTrail / KnowledgeBrowser の slate-50 framing 注 paragraph (L1 常時表示) を
 *      `<PageHelpDisclosure>` で L4 expand 化、page top に `ℹ️ 本画面の説明` icon button、
 *      default closed (Codex 案 Cluster 1 採用、localStorage 永続化なし)。
 *
 * 規範:
 *  - `<details>` semantic は使わず、button + state で制御 (chevron rotation + smooth transition のため)
 *  - `aria-expanded` + `aria-controls` 自動付与
 *  - 装飾排除 (Operational Premium Light §2.7)、shadow / motion なし、`hover:bg-slate-50` の minimum affordance のみ
 *
 * KnowledgeBrowser citation governance carve-out:
 *  - `AI が引用根拠として使えるのは承認済ナレッジのみ` 1 sentence は L1 PageHeader subtitle として残置 (regulated info)
 *  - その他 framing 注 paragraph (`ナレッジは 承認済 / 確認済 / 未承認 の 3 段階で管理されます` 等) は本 primitive で L4 expand 化
 */

interface PageHelpDisclosureProps {
  /** expand toggle button label (例: `本画面の説明`) */
  title: string
  /** expanded panel body (framing 注 paragraph 本体) */
  children: ReactNode
  /** id 上書き (default は React generated)、aria-controls 連携用 */
  id?: string
  className?: string
}

let _autoId = 0
function nextId() {
  return `page-help-disclosure-${++_autoId}`
}

export function PageHelpDisclosure({ title, children, id, className }: PageHelpDisclosureProps) {
  const [open, setOpen] = useState(false)
  const [contentId] = useState(() => id ?? nextId())

  return (
    <div className={cn('inline-block', className)}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-controls={contentId}
        className={cn(
          'inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-600 transition-colors hover:bg-slate-50',
          open && 'bg-slate-50'
        )}
      >
        <Info className="h-3 w-3" aria-hidden="true" />
        {title}
        <ChevronDown
          className={cn(
            'h-3 w-3 text-slate-400 transition-transform duration-150',
            open && 'rotate-180'
          )}
          aria-hidden="true"
        />
      </button>
      {open && (
        <div
          id={contentId}
          className="mt-2 rounded-md border border-slate-200 bg-slate-50 p-4 text-[12px] leading-relaxed text-slate-700"
        >
          {children}
        </div>
      )}
    </div>
  )
}
