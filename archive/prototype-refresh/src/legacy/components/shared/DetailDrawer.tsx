import { useEffect, useId, useRef } from 'react'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

/**
 * DetailDrawer — non-modal right-side drawer (Day 19 Commit 3b、Plan v1.4 U-6 + U-12)
 *
 * SSOT: prototype/audit/day-19-ux-clarity-integrated-plan.md v1.4 Commit 3b
 *
 * Industry reference: PDR (Pencil & Paper Right-side Drawer pattern):
 *  - `<aside role="complementary" aria-labelledby={headingId}>` (NOT `<dialog role="dialog">`、v1.4.1 F-4: aria-label → aria-labelledby に lock spec 準拠)
 *  - NO focus trap (background remains keyboard-interactive、Tab can move to page elements)
 *  - NO body scroll lock (page scrolls while drawer open)
 *  - NO `aria-modal` attribute (semantic = supplementary content, not blocking modal)
 *  - ESC closes drawer
 *  - Click outside drawer (= "backdrop click") closes drawer
 *
 * Positioning (v1.4.1 F-4):
 *  - `top-14` (= TopBar h-14 = 56px) で AppShell TopBar を覆わない
 *  - PrototypeModeLabel persistent pill を drawer open 中も visible に維持
 *
 * Anti-pattern 回避:
 *  - Modal cascade なし (drawer 内 modal 禁止、本 primitive は drawer 内に focus trap 持つ control を含まない)
 *  - Background interactive (Tab で page 要素にも focus 移動可、accessibility 上は L1 page と L3 drawer の並列関係)
 *
 * 用途:
 *  - ProposalReview RACI + 提案メタ情報 (右 column → drawer 化、4-col → 2-col 拡大、Demo Chapter 2 提案レビュー scene で `?demo=1` query → defaultOpen)
 *  - Inbox row click → drawer preview (full navigate せず L3 preview、drawer 内 CTA で full navigate)
 *  - 将来: CaseReview EvidenceTimeline step expand (本 Commit 3b 内 EvidenceTimeline は raw prefix 削除のみ、drawer は overlap 回避で defer)
 */

interface DetailDrawerProps {
  /** drawer 開閉 state (parent 制御) */
  open: boolean
  /** close handler (ESC + outside click + 内部 close button) */
  onClose: () => void
  /** header title */
  title: string
  /** drawer body content */
  children: ReactNode
  /** drawer 幅 (default '480'、Plan v1.4 で 480-640px range 規定) */
  width?: '480' | '560' | '640'
  className?: string
}

const widthClass: Record<NonNullable<DetailDrawerProps['width']>, string> = {
  '480': 'w-[480px]',
  '560': 'w-[560px]',
  '640': 'w-[640px]',
}

export function DetailDrawer({
  open,
  onClose,
  title,
  children,
  width = '480',
  className,
}: DetailDrawerProps) {
  const drawerRef = useRef<HTMLElement>(null)
  // v1.4.1 F-4: aria-labelledby を h2 id と連携、plan spec lock 準拠
  const headingId = useId()

  // ESC key + outside click handlers (non-modal pattern、focus trap なし)
  useEffect(() => {
    if (!open) return

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    function handleClickOutside(e: MouseEvent) {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    // mousedown to capture before any inner click logic
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <aside
      ref={drawerRef}
      role="complementary"
      aria-labelledby={headingId}
      className={cn(
        // v1.4.1 F-4: top-0 → top-14 で AppShell TopBar (h-14 = 56px) を覆わず、PrototypeModeLabel persistent pill を visible 維持
        // 高さは calc(100vh - 56px) で TopBar 直下から viewport bottom まで
        'fixed right-0 top-14 z-40 flex h-[calc(100vh-56px)] flex-col border-l border-slate-200 bg-white shadow-[-4px_0_16px_-8px_rgba(15,23,42,0.12)]',
        widthClass[width],
        className
      )}
    >
      {/* Header */}
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
        <h2 id={headingId} className="truncate text-sm font-semibold text-slate-900">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="閉じる"
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </header>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4">{children}</div>
    </aside>
  )
}
