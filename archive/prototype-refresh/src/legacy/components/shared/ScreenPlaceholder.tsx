import { ConstructionIcon } from 'lucide-react'

/**
 * ScreenPlaceholder — Phase 2B-1b の暫定画面
 *
 * 新 9 route を build/dev で通すための placeholder。pixel-parity 実装は P2B-2/3 で
 * screens-v2 の各 canonical-export を reference に各画面へ置換する。
 * sticky PageHeader 規範 (data-page-header / min-h-[var(--height-pageheader)]) は踏襲。
 */
interface ScreenPlaceholderProps {
  title: string
  route: string
  role: string
  typology: 'A' | 'B' | 'C'
  reference: string
}

export function ScreenPlaceholder({ title, route, role, typology, reference }: ScreenPlaceholderProps) {
  return (
    <div className="flex flex-col">
      <header
        data-page-header
        className="sticky top-0 z-30 flex min-h-[var(--height-pageheader)] flex-col justify-center border-b border-[var(--color-border)] bg-[var(--color-panel)] px-6 py-4"
      >
        <div className="flex items-baseline gap-3">
          <h1 className="text-lg font-semibold text-[var(--color-fg)]">{title}</h1>
          <span className="font-mono text-xs text-[var(--color-fg-subtle)]">{route}</span>
        </div>
        <p className="mt-1 text-xs text-[var(--color-fg-muted)]">
          {role} ／ typology {typology}
        </p>
      </header>

      <div className="p-4">
        <div className="flex items-start gap-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-panel-inset)] p-4">
          <ConstructionIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--color-fg-muted)]" aria-hidden="true" />
          <div className="text-sm text-[var(--color-fg)]">
            <p className="font-medium">この画面は次工程 (P2B-2/3) で実装します。</p>
            <p className="mt-1 text-[var(--color-fg-muted)]">
              共有 chrome (Sidebar / TopBar / ProcessSelector) と design token は適用済み。
              本体は pixel-parity reference{' '}
              <code className="font-mono text-xs text-[var(--color-fg)]">{reference}</code> を基に構築。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
