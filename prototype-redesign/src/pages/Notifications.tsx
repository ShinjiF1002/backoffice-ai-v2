import { Link } from 'react-router-dom'
import { CornerUpLeftIcon, AlertTriangleIcon, RotateCcwIcon } from 'lucide-react'
import { useNotifications, useStoreDispatch } from '@/store/hooks'
import type { NotificationKind } from '@/store/hooks'
import { EmptyState } from '@/components/shared/EmptyState'
import { MetaChip } from '@/components/shared/MetaChip'
import type { MetaTone } from '@/components/shared/MetaChip'
import { cn } from '@/lib/cn'

/**
 * 通知 / ワークインボックス (Notifications, /inbox) — B 型 / 全 persona
 * SSOT: handoff-redesign/00-shared/remediation-roadmap §3.2 (P1-2)
 *
 * 自分宛 (currentActor) の差戻し受領・エスカレーションを派生 selector から行表示。
 * row click で markRead + 該当 case へ遷移。未読は primary-soft 背景 + 太字 + ドット。SLA は scope-0 (JG-b)。
 */
const KIND_META: Record<NotificationKind, { label: string; icon: typeof CornerUpLeftIcon; tone: MetaTone }> = {
  sendback: { label: '差戻し受領', icon: CornerUpLeftIcon, tone: 'alert' },
  reversal: { label: '反映の訂正・取消', icon: RotateCcwIcon, tone: 'alert' },
  escalation: { label: 'エスカレーション', icon: AlertTriangleIcon, tone: 'primary' },
}

export function Notifications() {
  const notifications = useNotifications()
  const dispatch = useStoreDispatch()
  const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id)

  return (
    <div className="flex flex-col">
      <header
        data-page-header
        className="sticky top-0 z-30 flex min-h-[var(--height-pageheader)] flex-col justify-center border-b border-[var(--color-border)] bg-[var(--color-panel)] px-6 py-4"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-lg font-semibold text-[var(--color-fg)]">通知 — ワークインボックス</h1>
            <p className="mt-1 text-xs text-[var(--color-fg-muted)]">
              自分宛の差戻し・エスカレーション ／ {notifications.length} 件（未読 {unreadIds.length}）
            </p>
          </div>
          {unreadIds.length > 0 && (
            <button
              type="button"
              onClick={() => dispatch({ type: 'notification/markAllRead', ids: unreadIds })}
              className="flex-shrink-0 rounded-[var(--radius-control)] border border-[var(--color-border-strong)] bg-[var(--color-panel)] px-3 py-1.5 text-xs font-medium text-[var(--color-fg)] hover:bg-[var(--color-panel-inset)]"
            >
              すべて既読
            </button>
          )}
        </div>
      </header>

      <div className="p-4">
        {notifications.length === 0 ? (
          <EmptyState
            subState="truly-empty"
            title="通知はありません"
            description="自分宛の差戻し・エスカレーションがここに表示されます。担当案件が差し戻されると通知が届きます。"
          />
        ) : (
          <ul className="flex flex-col gap-2">
            {notifications.map((n) => {
              const meta = KIND_META[n.kind]
              const Icon = meta.icon
              return (
                <li key={n.id}>
                  <Link
                    to={n.href}
                    onClick={() => {
                      if (!n.read) dispatch({ type: 'notification/markRead', id: n.id })
                    }}
                    className={cn(
                      'flex items-start gap-3 rounded-[var(--radius-card)] border p-3 transition-colors hover:bg-[var(--color-panel-inset)]',
                      n.read
                        ? 'border-[var(--color-border)] bg-[var(--color-panel)]'
                        : 'border-[var(--color-border)] bg-[var(--color-primary-soft)]',
                    )}
                  >
                    <span className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-[var(--radius-control)] bg-[var(--color-panel-inset)]">
                      <Icon className="h-4 w-4 text-[var(--color-fg-muted)]" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <MetaChip tone={meta.tone} label={meta.label} />
                        {!n.read && (
                          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-alert)]" aria-label="未読" />
                        )}
                      </div>
                      <div className={cn('mt-1 truncate text-sm text-[var(--color-fg)]', !n.read && 'font-medium')}>{n.title}</div>
                      <div className="mt-0.5 truncate text-xs text-[var(--color-fg-muted)]">{n.detail}</div>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
