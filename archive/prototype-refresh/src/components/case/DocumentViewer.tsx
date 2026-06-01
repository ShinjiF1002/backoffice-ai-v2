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
  /** 起票経路 (F-006/F-051)。'manual' は「手入力値の控え（スキャン画像なし）」として表示し faux PDF を主張しない。既定 'ai'。 */
  origin?: 'ai' | 'manual'
  activeFieldLabel?: string
  onRowSelect?: (fieldLabel: string) => void
}

/** 詳細欄を持つページ (mock では P.2 のみ) */
const DETAIL_PAGE = 2

export function DocumentViewer({ document, origin = 'ai', activeFieldLabel, onRowSelect }: DocumentViewerProps) {
  const isManual = origin === 'manual'
  const [page, setPage] = useState(isManual ? 1 : DETAIL_PAGE)
  const [zoomed, setZoomed] = useState(false)
  const total = document.pageCount
  const showRows = isManual || page === DETAIL_PAGE

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-paper-bg)]">
      {/* viewer header */}
      <div className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-2">
        <span className="font-mono text-[11px] text-[var(--color-fg)]">
          {isManual ? '手入力値の控え（スキャン画像なし）' : `${document.fileName} · P.${page} / ${total}`}
        </span>
        {/* 手動起票はページ送り/拡大の対象書類が無いので操作を出さない (F-006) */}
        {!isManual && (
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
        )}
      </div>

      {/* faux paper */}
      <div className="flex-1 overflow-auto p-5">
        <div
          className={cn('mx-auto bg-[var(--color-paper)] p-6 shadow-sm transition-all', zoomed ? 'max-w-xl' : 'max-w-md')}
          style={{ color: 'var(--color-paper-ink)' }}
        >
          {/* F-051: 文書が prototype の mock サンプルであることを明示し、実書類・実押印を主張しない。 */}
          <div className="mb-2 flex justify-center">
            <span
              className="rounded-full border border-[var(--color-paper-line)] px-2 py-0.5 font-sans text-[10px] font-medium"
              style={{ color: 'var(--color-paper-label)' }}
            >
              {isManual ? 'サンプル・手入力控え（モック）' : 'サンプル文書（モック）'}
            </span>
          </div>
          <div className="text-center font-serif text-base font-bold">{document.title}</div>
          <div className="mx-auto mt-2 mb-4 h-0.5 w-14 bg-[var(--color-paper-ink)]" />
          {isManual && (
            <p className="mb-3 font-sans text-[11px] leading-relaxed" style={{ color: 'var(--color-paper-label)' }}>
              本案件は手動起票のため、スキャンした申請書類はありません。以下は入力者が手入力した値の控えです。
            </p>
          )}
          {showRows ? (
            // dl→div: clickable row が role=button のため dl-child 制約 (dt/dd/div のみ) を避ける (W3 axe)。
            <div className="space-y-3 font-serif text-[13px] leading-relaxed">
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
                          ? // active は bg を primary-soft に変えず ring で示す (paper-label が primary-soft 上で AA 未達になるのを回避)。
                            'shadow-[inset_0_0_0_2px_var(--color-primary)]'
                          : clickable && 'hover:bg-[var(--color-paper-bg)]'
                    )}
                  >
                    <div className="text-[11px]" style={{ color: 'var(--color-paper-label)' }}>{row.label}</div>
                    <div className="mt-0.5">{row.value}</div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="py-10 text-center font-serif text-[12px]" style={{ color: 'var(--color-paper-label)' }}>
              このページに変更対象の記載はありません。
            </p>
          )}
          {!isManual && (
            <div className="mt-6 text-right font-mono text-[10px]" style={{ color: 'var(--color-paper-label)' }}>
              P.{page} / {total}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
