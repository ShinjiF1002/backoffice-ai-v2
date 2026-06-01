import { Inbox, Filter, Lock } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

/**
 * EmptyState — F-3 Wave 3 PR 3 Commit 6 (Implementation Plan v3.0、Card 6 empty-error-loading-states)
 *
 * 3 sub-state (sub-state ごとに icon + 原因 + action 1 つ):
 *  - **truly-empty** (新規 / 未投入): 「まだ <X> がありません」+ primary CTA
 *  - **filtered-empty** (filter で 0): 「Filter で 0 件 一致しました」+ secondary `Reset filter` (primary 不要、誤操作回避)
 *  - **permission-empty** (権限不足): backlog (本 prototype 全 page N/A、Phase 1 で role-based access control 設計後に re-judge)
 *
 * Operational Premium Light 規範:
 *  - 装飾 0 (illustration / gradient なし、icon は lucide-react のみ)
 *  - 縦 stack centered、py-12 padding、text-slate-500 muted
 *  - action CTA は既存 button pattern (rounded-md + 既存 token) 経由
 */

type EmptySubState = 'truly-empty' | 'filtered-empty' | 'permission-empty'

interface EmptyStateProps {
  /** Sub-state (3 種、permission-empty は backlog で本 prototype 未使用) */
  subState: EmptySubState
  /** Title (e.g. '案件が登録されていません') */
  title: string
  /** Optional description (1 sentence、原因 / context 補足) */
  description?: string
  /** Action element (truly-empty では primary CTA、filtered-empty では secondary Reset、permission では Request access link) */
  action?: ReactNode
  className?: string
}

const iconMap: Record<EmptySubState, typeof Inbox> = {
  'truly-empty': Inbox,
  'filtered-empty': Filter,
  'permission-empty': Lock,
}

export function EmptyState({ subState, title, description, action, className }: EmptyStateProps) {
  const Icon = iconMap[subState]
  return (
    <div
      role="status"
      className={cn(
        'flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-slate-200 bg-slate-50/50 px-6 py-12 text-center',
        className
      )}
    >
      <Icon className="h-7 w-7 text-slate-400" aria-hidden="true" />
      <p className="text-sm font-medium text-slate-700">{title}</p>
      {description && (
        <p className="max-w-md text-xs leading-relaxed text-slate-500">{description}</p>
      )}
      {action && <div className="mt-1.5">{action}</div>}
    </div>
  )
}
