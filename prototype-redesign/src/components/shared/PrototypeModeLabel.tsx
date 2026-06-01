import { InfoIcon } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/cn'

/**
 * Prototype mode label (必須、全画面 persistent pill)
 * SSOT: docs/03-ui-prototype-design.md §8 + §10 + prototype/CLAUDE.md
 *
 * 配置: `shared/` (1 file 1 component、9 画面横断 + BusinessApprovalView mock 共通)
 * 文言 (常時可視): "プロトタイプ表示 — 外部未接続 / 実データなし / AI・証跡はモック" — 法的に material な 4 事実
 *   (プロトタイプ / 外部システム未接続 / 実顧客データなし / AI・証跡はモック) を **折り畳みに依存せず常時表示**。詳細は disclosure。
 * 色: AA token (panel-inset 背景 + fg-tertiary text、W1 contrast 是正済)。警告色は使わない。
 *
 * F-052 (法務免責の常時到達性): 包括的免責本文を **hover だけに頼らず click / keyboard で開ける disclosure** にする
 *   (touch では hover が無いため、唯一の包括免責が読めない問題を解消)。`role="status"` (live region) は静的 pill に
 *   不適ゆえ button + `aria-expanded`/`aria-controls` の disclosure semantics に置換。詳細は hover でも展開 (desktop 利便)。
 */
export function PrototypeModeLabel() {
  const [open, setOpen] = useState(false)
  const [hovered, setHovered] = useState(false)
  const showDetail = open || hovered

  return (
    <div
      className="relative inline-flex max-w-full"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls="prototype-detail"
        aria-label="プロトタイプ表示 — 外部未接続・実データなし・AI と証跡はモック。詳細な免責事項を開く"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex max-w-full items-center gap-1.5 rounded-md border border-[var(--color-border)] bg-[var(--color-panel-inset)] px-2.5 py-1 text-[11px] font-medium leading-tight text-[var(--color-fg-tertiary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)] sm:text-xs"
      >
        <InfoIcon className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
        <span className="whitespace-nowrap">プロトタイプ表示 — 外部未接続 / 実データなし / AI・証跡はモック</span>
      </button>

      <div
        id="prototype-detail"
        role="note"
        className={cn(
          'absolute right-0 top-full z-50 mt-2 w-80 rounded-md border border-[var(--color-border)] bg-[var(--color-panel)] p-3 text-xs leading-relaxed text-[var(--color-fg)] shadow-md transition-opacity',
          showDetail ? 'visible opacity-100' : 'pointer-events-none invisible opacity-0'
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
        ・AI の入力・分析・自動化は模擬 (実 LLM / 実行系・送金・台帳更新には未接続)
      </div>
    </div>
  )
}
