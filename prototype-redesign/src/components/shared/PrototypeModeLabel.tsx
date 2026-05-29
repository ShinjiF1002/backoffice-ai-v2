import { Info } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/cn'

/**
 * Prototype mode label (必須、全画面 persistent pill)
 * SSOT: docs/03-ui-prototype-design.md §8 + §10 + prototype/CLAUDE.md
 *
 * 配置: `shared/` (1 file 1 component、9 画面横断 + BusinessApprovalView mock 共通)
 * 文言: "プロトタイプ表示 — 外部システム未接続 / 証跡はモック"
 * 色: muted (token: panel-inset 背景 + fg-muted text)、警告色は使わない
 * a11y: role="status" + aria-label JP + stable aria-describedby
 */
export function PrototypeModeLabel() {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      role="status"
      aria-label="プロトタイプ表示の説明"
      aria-describedby="prototype-tooltip"
      tabIndex={0}
      className="relative inline-flex max-w-full items-center gap-1.5 rounded-md border border-[var(--color-border)] bg-[var(--color-panel-inset)] px-2.5 py-1 text-[11px] font-medium leading-tight text-[var(--color-fg-muted)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)] sm:text-xs"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      <Info className="h-3.5 w-3.5" aria-hidden="true" />
      <span className="whitespace-nowrap">プロトタイプ表示 — 外部システム未接続 / 証跡はモック</span>

      <div
        id="prototype-tooltip"
        role="tooltip"
        className={cn(
          'pointer-events-none absolute right-0 top-full z-50 mt-2 w-80 rounded-md border border-[var(--color-border)] bg-[var(--color-panel)] p-3 text-xs leading-relaxed text-[var(--color-fg)] shadow-md transition-opacity',
          hovered ? 'visible opacity-100' : 'invisible opacity-0'
        )}
      >
        本プロトタイプは表示確認用で、操作内容は実システムに反映されません。
        <br />
        ・表示状態はこの端末内のみに保存 (外部システム未保存)
        <br />
        ・外部システム未接続
        <br />
        ・実顧客データ未使用
        <br />
        ・実規制の引用なし
        <br />
        ・検索 / 通知 / 一括操作 / フィルタ等の機能は次の実装段階で対応
      </div>
    </div>
  )
}
