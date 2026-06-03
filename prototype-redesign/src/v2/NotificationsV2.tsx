import { CornerUpLeftIcon, RotateCcwIcon, CheckIcon, GavelIcon } from 'lucide-react'
import type { Tone } from '@/components/shared/StatusBadge'
import { PageHeader } from './ui'
import { TONE_SOFT_BG, TONE_SOFT_FG } from './tokens'

/** NotificationsV2 — 通知 (list)。差戻し受領 / 裁定依頼 / 提案承認 / 反映取消 等の業務イベント。 */
const NOTES: { id: string; icon: typeof CornerUpLeftIcon; tone: Tone; title: string; body: string; time: string; unread: boolean }[] = [
  { id: 'n1', icon: CornerUpLeftIcon, tone: 'alert', title: '差戻し受領 — CASE-2026-0131', body: '入力者から差戻しを受け取りました（法人名）。', time: '10分前', unread: true },
  { id: 'n2', icon: GavelIcon, tone: 'primary', title: 'エスカレーション裁定依頼 — CASE-2026-0142', body: '業務責任者の裁定が必要です。', time: '25分前', unread: true },
  { id: 'n3', icon: CheckIcon, tone: 'success', title: '提案が承認されました — PROP-2026-024', body: '有効期限チェックの追加が設定承認されました。', time: '1時間前', unread: true },
  { id: 'n4', icon: RotateCcwIcon, tone: 'alert', title: '反映の取消 — CASE-2026-0120', body: '反映済の案件が取消され、再処理に戻りました。', time: '2時間前', unread: false },
]

export function NotificationsV2() {
  const unread = NOTES.filter((n) => n.unread).length
  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="通知"
        sub={
          <>
            未読 <span className="v2-tnum font-medium text-[var(--v2-fg)]">{unread}</span> 件
          </>
        }
      />
      <div className="mx-auto w-full max-w-[760px] flex-1 overflow-auto px-6 py-4">
        <ul className="flex flex-col gap-2">
          {NOTES.map((n) => (
            <li
              key={n.id}
              className={
                'flex items-start gap-3 rounded-[var(--v2-radius-card)] border p-3.5 ' +
                (n.unread ? 'border-[var(--v2-border-strong)] bg-[var(--v2-panel)]' : 'border-[var(--v2-border)] bg-[var(--v2-canvas)]')
              }
            >
              <span className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[var(--v2-radius-control)] ${TONE_SOFT_BG[n.tone]} ${TONE_SOFT_FG[n.tone]}`}>
                <n.icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-medium text-[var(--v2-fg)]">{n.title}</span>
                  {n.unread && (
                    <>
                      <span className="sr-only">未読</span>
                      <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--v2-accent)]" aria-hidden="true" />
                    </>
                  )}
                </div>
                <p className="mt-0.5 text-[12px] text-[var(--v2-fg-muted)]">{n.body}</p>
              </div>
              <span className="v2-tnum flex-shrink-0 text-[11px] text-[var(--v2-fg-tertiary)]">{n.time}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
