import { Info } from 'lucide-react'
import { useState } from 'react'

/**
 * Prototype mode label (必須、全画面 persistent pill)
 * SSOT: docs/03-ui-prototype-design.md §8 + §10 + prototype/CLAUDE.md
 *
 * 配置: `shared/` (1 file 1 component、9 画面横断 + BusinessApprovalView mock 共通)
 * 文言: "プロトタイプ表示 — 外部システム未接続 / 証跡はモック"
 * 色: muted (slate-100 background + slate-600 text)、警告色は使わない
 * a11y: role="status" + aria-label="prototype mode indicator"
 */
export function PrototypeModeLabel() {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      role="status"
      aria-label="prototype mode indicator"
      className="relative inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Info className="h-3.5 w-3.5" aria-hidden="true" />
      <span>プロトタイプ表示 — 外部システム未接続 / 証跡はモック</span>

      {hovered && (
        <div
          role="tooltip"
          className="absolute right-0 top-full z-50 mt-2 w-80 rounded-md border border-slate-200 bg-white p-3 text-xs leading-relaxed text-slate-700 shadow-md"
        >
          本 prototype は in-memory mock state です。
          <br />
          ・永続化なし
          <br />
          ・外部システム未接続
          <br />
          ・実顧客データ未使用
          <br />
          ・実規制 cite なし
        </div>
      )}
    </div>
  )
}
