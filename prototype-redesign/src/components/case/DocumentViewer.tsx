import { useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon, ZoomInIcon, ZoomOutIcon } from 'lucide-react'
import type { CaseDetailModel } from '@/data/mock-case-detail'
import { cn } from '@/lib/cn'

/**
 * DocumentViewer — CaseDetail 左 pane の申請書類ビューア (rev.3 文書アンカー、原則 B)
 * 紙文書 token (canonical-design-spec §2.2) を使用。faux PDF を読めるサイズで表示し、
 * 該当欄を行クリックで右 pane field と相互ハイライト。実 PDF は使わない (mock)。
 * ページ送り / 拡大は機能実装 (no-op にしない)。詳細欄は P.2 のみ (mock)。
 */
interface DocumentViewerProps {
  document: CaseDetailModel['document']
  activeFieldLabel?: string
  onRowSelect?: (fieldLabel: string) => void
}

/** 詳細欄を持つページ (mock では P.2 のみ) */
const DETAIL_PAGE = 2

export function DocumentViewer({ document, activeFieldLabel, onRowSelect }: DocumentViewerProps) {
  const [page, setPage] = useState(DETAIL_PAGE)
  const [zoomed, setZoomed] = useState(false)
  const total = document.pageCount

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-paper-bg)]">
      {/* viewer header */}
      <div className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-2">
        <span className="font-mono text-[11px] text-[var(--color-fg)]">
          {document.fileName} · P.{page} / {total}
        </span>
        <div className="flex items-center gap-1 text-[var(--color-fg-muted)]">
          <button
            type="button"
            aria-label="前ページ"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded p-1 enabled:hover:bg-[var(--color-panel-inset)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeftIcon className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            aria-label="次ページ"
            disabled={page >= total}
            onClick={() => setPage((p) => Math.min(total, p + 1))}
            className="rounded p-1 enabled:hover:bg-[var(--color-panel-inset)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRightIcon className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            aria-label={zoomed ? '縮小' : '拡大'}
            aria-pressed={zoomed}
            onClick={() => setZoomed((z) => !z)}
            className="rounded p-1 hover:bg-[var(--color-panel-inset)]"
          >
            {zoomed ? <ZoomOutIcon className="h-3.5 w-3.5" /> : <ZoomInIcon className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* faux paper */}
      <div className="flex-1 overflow-auto p-5">
        <div
          className={cn('mx-auto bg-[var(--color-paper)] p-6 shadow-sm transition-all', zoomed ? 'max-w-xl' : 'max-w-md')}
          style={{ color: 'var(--color-paper-ink)' }}
        >
          <div className="text-center font-serif text-base font-bold">{document.title}</div>
          <div className="mx-auto mt-2 mb-4 h-0.5 w-14 bg-[var(--color-paper-ink)]" />
          {page === DETAIL_PAGE ? (
            <dl className="space-y-3 font-serif text-[13px] leading-relaxed">
              {document.rows.map((row) => {
                const active = row.fieldLabel && row.fieldLabel === activeFieldLabel
                const clickable = !!row.fieldLabel
                // P1-6: clickable row を keyboard 操作可能化 (role=button + Enter/Space)。非 clickable は role を付けない。
                const handleSelect = clickable && onRowSelect ? () => onRowSelect(row.fieldLabel!) : undefined
                return (
                  <div
                    key={row.label}
                    role={clickable ? 'button' : undefined}
                    tabIndex={clickable ? 0 : undefined}
                    aria-pressed={clickable ? !!active : undefined}
                    onClick={handleSelect}
                    onKeyDown={
                      handleSelect
                        ? (e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              handleSelect()
                            }
                          }
                        : undefined
                    }
                    className={cn(
                      'rounded px-2 py-1',
                      clickable && 'cursor-pointer',
                      row.highlight
                        ? 'border-2 border-[var(--color-alert)] bg-[var(--color-alert-soft)]'
                        : active
                          ? 'bg-[var(--color-primary-soft)]'
                          : clickable && 'hover:bg-[var(--color-paper-bg)]'
                    )}
                  >
                    <dt className="text-[11px]" style={{ color: 'var(--color-paper-label)' }}>{row.label}</dt>
                    <dd className="mt-0.5">{row.value}</dd>
                  </div>
                )
              })}
            </dl>
          ) : (
            <p className="py-10 text-center font-serif text-[12px]" style={{ color: 'var(--color-paper-label)' }}>
              このページに変更対象の記載はありません。
            </p>
          )}
          <div className="mt-6 text-right font-mono text-[10px]" style={{ color: 'var(--color-paper-label)' }}>
            P.{page} / {total}
          </div>
        </div>
      </div>
    </div>
  )
}
