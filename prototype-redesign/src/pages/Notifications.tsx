import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CornerUpLeftIcon, AlertTriangleIcon, RotateCcwIcon, GavelIcon } from 'lucide-react'
import { useNotifications, useStoreDispatch } from '@/store/hooks'
import type { NotificationKind } from '@/store/hooks'
import { useListData } from '@/hooks/useListData'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { LoadingState } from '@/components/shared/LoadingState'
import { MetaChip } from '@/components/shared/MetaChip'
import type { MetaTone } from '@/components/shared/MetaChip'
import { PageHeader } from '@/components/shared/PageHeader'
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
  'escalation-resolved': { label: 'エスカレーション裁定', icon: GavelIcon, tone: 'success' },
}

export function Notifications() {
  const notifications = useNotifications()
  const dispatch = useStoreDispatch()
  // F-009: 取得状態 (?demo=loading/error) を全 list route で一貫させる demo seam (custom list ゆえ手動 render)。
  const list = useListData(notifications)
  const isDegraded = list.status === 'loading' || list.status === 'error'
  const unreadIds = isDegraded ? [] : notifications.filter((n) => !n.read).map((n) => n.id)
  // F-030: 未読のみ表示トグル (処理済を消化して triage を回復)。
  const [unreadOnly, setUnreadOnly] = useState(false)
  const visible = unreadOnly ? notifications.filter((n) => !n.read) : notifications

  return (
    <div className="flex flex-col">
      <PageHeader
        title="通知 — ワークインボックス"
        subtitle={<>自分宛の差戻し・エスカレーション{!isDegraded && ` ／ ${notifications.length} 件（未読 ${unreadIds.length}）`}</>}
        actions={
          !isDegraded && (
            <>
              {/* F-030: 未読のみ表示トグル (処理済を消化)。 */}
              <button
                type="button"
                aria-pressed={unreadOnly}
                onClick={() => setUnreadOnly((v) => !v)}
                className={cn(
                  'rounded-[var(--radius-control)] border px-3 py-1.5 text-xs font-medium transition-colors',
                  unreadOnly
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)]'
                    : 'border-[var(--color-border-strong)] bg-[var(--color-panel)] text-[var(--color-fg)] hover:bg-[var(--color-panel-inset)]',
                )}
              >
                未読のみ
              </button>
              {unreadIds.length > 0 && (
                <button
                  type="button"
                  onClick={() => dispatch({ type: 'notification/markAllRead', ids: unreadIds })}
                  className="rounded-[var(--radius-control)] border border-[var(--color-border-strong)] bg-[var(--color-panel)] px-3 py-1.5 text-xs font-medium text-[var(--color-fg)] hover:bg-[var(--color-panel-inset)]"
                >
                  すべて既読
                </button>
              )}
            </>
          )
        }
      />

      <div className="p-4">
        {list.status === 'loading' ? (
          <LoadingState variant="skeleton" rowCount={6} />
        ) : list.status === 'error' ? (
          <ErrorState title="通知の取得に失敗しました" onRetry={list.onRetry} />
        ) : visible.length === 0 ? (
          <EmptyState
            subState="truly-empty"
            title={unreadOnly ? '未読の通知はありません' : '通知はありません'}
            // F-030: 空状態コピーに 3 kind (差戻し受領・エスカレーション裁定依頼/結果・反映の訂正/取消) を反映。
            description={
              unreadOnly
                ? 'すべての通知が既読です。「未読のみ」を解除すると既読も表示します。'
                : '自分宛の通知（担当案件の差戻し受領・エスカレーションの裁定依頼/裁定結果・反映済の訂正/取消）がここに表示されます。'
            }
          />
        ) : (
          <ul className="flex flex-col gap-2">
            {visible.map((n) => {
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
                        {/* F-030: 発生時刻 (事実、偽 SLA でない) を控えめ表示。 */}
                        <span className="ml-auto flex-shrink-0 font-mono text-[10px] text-[var(--color-fg-tertiary)]">{n.occurredAt}</span>
                      </div>
                      <div className={cn('mt-1 truncate text-sm text-[var(--color-fg)]', !n.read && 'font-medium')}>{n.title}</div>
                      <div className="mt-0.5 truncate text-xs text-[var(--color-fg-tertiary)]">{n.detail}</div>
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
