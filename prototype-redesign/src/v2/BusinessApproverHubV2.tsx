import { SlidersHorizontalIcon, AlertTriangleIcon, ChevronRightIcon } from 'lucide-react'
import { PageHeader, Card } from './ui'

/** BusinessApproverHubV2 — 業務責任者ハブ (hub)。設定承認 + エスカレーション裁定の 2 責務を 1 面に。 */
const CONFIG_QUEUE = [
  { id: 'CFG-2026-014', label: '法人住所変更 Agent の判定基準更新', meta: '種別 A · 手順管理者' },
  { id: 'CFG-2026-013', label: '口座開設 Agent に有効期限チェック追加', meta: '種別 C · 手順承認済' },
]
const ESC_QUEUE = [
  { id: 'CASE-2026-0142', label: '法人住所変更 — ビル名の判定に疑義', meta: '起票: 山田太郎' },
  { id: 'CASE-2026-0104', label: '口座開設 — 有効期限の読み取りに疑義', meta: '起票: 高橋' },
]

function QueueCard({ title, icon: Icon, items, href }: { title: string; icon: typeof SlidersHorizontalIcon; items: { id: string; label: string; meta: string }[]; href: string }) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-[var(--v2-border)] px-4 py-2.5">
        <span className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--v2-fg)]">
          <Icon className="h-4 w-4 text-[var(--v2-fg-muted)]" aria-hidden="true" />
          {title}
        </span>
        <span className="v2-tnum rounded-full bg-[var(--v2-accent-soft)] px-2 text-[12px] font-medium text-[var(--v2-accent-soft-fg)]">{items.length}</span>
      </div>
      <ul>
        {items.map((it) => (
          <li key={it.id}>
            <a href={href} className="flex items-center justify-between gap-3 border-b border-[var(--v2-hairline)] px-4 py-2.5 transition-colors last:border-b-0 hover:bg-[var(--v2-panel-inset)]">
              <span className="min-w-0">
                <span className="block truncate text-[13px] text-[var(--v2-fg)]">{it.label}</span>
                <span className="v2-mono block truncate text-[11px] text-[var(--v2-fg-tertiary)]">{it.id} · {it.meta}</span>
              </span>
              <ChevronRightIcon className="h-4 w-4 flex-shrink-0 text-[var(--v2-fg-subtle)]" aria-hidden="true" />
            </a>
          </li>
        ))}
      </ul>
    </Card>
  )
}

export function BusinessApproverHubV2() {
  return (
    <div className="flex h-full flex-col overflow-auto">
      <PageHeader title="業務責任者ハブ" sub="設定承認とエスカレーション裁定 — あなたの判断待ち" />
      <div className="mx-auto w-full max-w-[1080px] px-6 py-5">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <QueueCard title="設定承認待ち" icon={SlidersHorizontalIcon} items={CONFIG_QUEUE} href="/v2/config-approvals" />
          <QueueCard title="エスカレーション裁定待ち" icon={AlertTriangleIcon} items={ESC_QUEUE} href="/v2/cases/CASE-2026-0142" />
        </div>
      </div>
    </div>
  )
}
