import type { ReactNode } from 'react'

/**
 * PageHeader 共通 primitive (F-036) — 15 画面で手書き重複していた sticky page header を集約。
 * - title / subtitle / actions(右寄せ) slot + responsive collapse 内蔵 (mobile で actions が下段へ折返し)。
 * - `--height-pageheader` contract を全画面で統一保持 (Observatory 等の逸脱を解消し密度を揃える)。
 * - children は subtitle 直下の追加行 (persona hint / SoD 注記 / 自前 input 等) を載せる slot。
 *
 * 適用外: detail 3 画面 (CaseDetail/ProposalDetail/AgentDetail) は breadcrumb + stepper を伴う別 composition ゆえ
 *   本 primitive ではなく各自の richer header を保持する (型/構造が異なるため無理に共通化しない)。
 */
export interface PageHeaderProps {
  title: ReactNode
  subtitle?: ReactNode
  /** 右寄せの操作 (新規作成 / 既読など)。mobile では title 行の下へ wrap。 */
  actions?: ReactNode
  /** subtitle 直下の追加行 (hint / 自前 input 等)。 */
  children?: ReactNode
}

export function PageHeader({ title, subtitle, actions, children }: PageHeaderProps) {
  return (
    <header
      data-page-header
      className="sticky top-0 z-30 flex min-h-[var(--height-pageheader)] flex-col justify-center gap-1 border-b border-[var(--color-border)] bg-[var(--color-panel)] px-6 py-4"
    >
      <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
        <div className="min-w-0">
          {typeof title === 'string' ? (
            <h1 className="text-lg font-semibold text-[var(--color-fg)]">{title}</h1>
          ) : (
            title
          )}
          {subtitle && <p className="mt-1 text-xs text-[var(--color-fg-muted)]">{subtitle}</p>}
        </div>
        {actions && <div className="flex flex-shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {children}
    </header>
  )
}
