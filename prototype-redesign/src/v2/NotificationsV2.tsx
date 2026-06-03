import { useState } from 'react'
import { CornerUpLeftIcon, RotateCcwIcon, GavelIcon, CheckIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Tone } from '@/components/shared/StatusBadge'
import { useNotifications, useStoreDispatch } from '@/store/hooks'
import type { NotificationKind } from '@/store/hooks'
import { PageHeader } from './ui'
import { TONE_SOFT_BG, TONE_SOFT_FG } from './tokens'

/**
 * NotificationsV2 — 通知 (list、store 配線済)。差戻し受領 / 反映取消 / 裁定依頼 / 裁定結果 の業務イベント。
 * useNotifications() (store-derived selector、currentActor 宛のみ) を消費。kind→icon/tone は v1 KIND_META 相当の
 * 派生マップ (store NotificationItem は icon/tone を持たない)。行 click → 該当 case へ nav + notification/markRead (冪等)。
 */
const KIND_META: Record<NotificationKind, { icon: typeof CornerUpLeftIcon; tone: Tone }> = {
  sendback: { icon: CornerUpLeftIcon, tone: 'alert' },
  reversal: { icon: RotateCcwIcon, tone: 'alert' },
  escalation: { icon: GavelIcon, tone: 'primary' },
  'escalation-resolved': { icon: GavelIcon, tone: 'success' },
}

export function NotificationsV2() {
  const notifications = useNotifications()
  const dispatch = useStoreDispatch()
  const [unreadOnly, setUnreadOnly] = useState(false)
  const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id)
  const unread = unreadIds.length
  const visible = unreadOnly ? notifications.filter((n) => !n.read) : notifications

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="通知"
        sub={
          <>
            未読 <span className="v2-tnum font-medium text-[var(--v2-fg)]">{unread}</span> 件
          </>
        }
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setUnreadOnly((v) => !v)}
              aria-pressed={unreadOnly}
              className={
                'flex h-8 items-center rounded-[var(--v2-radius-control)] border px-3 text-[13px] font-medium transition-colors ' +
                (unreadOnly
                  ? 'border-[var(--v2-accent-soft-border)] bg-[var(--v2-accent-soft)] text-[var(--v2-accent-soft-fg)]'
                  : 'border-[var(--v2-border-strong)] bg-[var(--v2-panel)] text-[var(--v2-fg-muted)] hover:text-[var(--v2-fg)]')
              }
            >
              未読のみ
            </button>
            <button
              type="button"
              disabled={unread === 0}
              onClick={() => dispatch({ type: 'notification/markAllRead', ids: unreadIds })}
              className={
                'flex h-8 items-center gap-1.5 rounded-[var(--v2-radius-control)] px-3 text-[13px] font-medium ' +
                (unread === 0
                  ? 'cursor-not-allowed bg-[var(--v2-panel-inset)] text-[var(--v2-fg-subtle)]'
                  : 'bg-[var(--v2-accent)] text-white hover:bg-[var(--v2-accent-hover)]')
              }
            >
              <CheckIcon className="h-4 w-4" aria-hidden="true" />
              すべて既読
            </button>
          </div>
        }
      />
      <div className="mx-auto w-full max-w-[760px] flex-1 overflow-auto px-6 py-4">
        {visible.length === 0 ? (
          <div className="flex h-full items-center justify-center text-[13px] text-[var(--v2-fg-muted)]">{unreadOnly ? '未読の通知はありません' : '通知はありません'}</div>
        ) : (
          <ul className="flex flex-col gap-2">
            {visible.map((n) => {
              const meta = KIND_META[n.kind]
              return (
                <li key={n.id}>
                  <Link
                    to={n.href}
                    onClick={() => { if (!n.read) dispatch({ type: 'notification/markRead', id: n.id }) }}
                    className={
                      'flex items-start gap-3 rounded-[var(--v2-radius-card)] border p-3.5 ' +
                      (!n.read ? 'border-[var(--v2-border-strong)] bg-[var(--v2-panel)]' : 'border-[var(--v2-border)] bg-[var(--v2-canvas)]')
                    }
                  >
                    <span className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[var(--v2-radius-control)] ${TONE_SOFT_BG[meta.tone]} ${TONE_SOFT_FG[meta.tone]}`}>
                      <meta.icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-medium text-[var(--v2-fg)]">{n.title}</span>
                        {!n.read && (
                          <>
                            <span className="sr-only">未読</span>
                            <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--v2-accent)]" aria-hidden="true" />
                          </>
                        )}
                      </div>
                      <p className="mt-0.5 text-[12px] text-[var(--v2-fg-muted)]">{n.detail}</p>
                    </div>
                    <span className="v2-tnum flex-shrink-0 text-[11px] text-[var(--v2-fg-tertiary)]">{n.occurredAt}</span>
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
