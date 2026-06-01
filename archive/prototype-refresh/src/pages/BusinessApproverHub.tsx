import { Link } from 'react-router-dom'
import { SparklesIcon, BotIcon, AlertTriangleIcon, ArrowRightIcon } from 'lucide-react'
import { useBusinessApproverInbox, useCurrentActor } from '@/store/hooks'
import { roleLabel } from '@/store/actors'
import { PageHeader } from '@/components/shared/PageHeader'
import { cn } from '@/lib/cn'

/**
 * 業務責任者ハブ (BusinessApproverHub, /business-approver) — A 型 landing / 業務責任者
 * SSOT: handoff-redesign/00-shared/remediation-roadmap §3.3 (P1-3、IA scope=(a))
 *
 * 業務責任者の 3 受け口を集約 drill する role landing (§5a / §8 persona gap 解消)。
 *  - 手順承認 (forwarded 提案) → /config-approvals
 *  - 設定承認 (Agent 昇格申請) → /config-approvals
 *  - エスカレーション裁定 (case/escalate) → /escalations
 *
 * F-009 注: 本画面は store 由来の派生件数を集約する landing で、list 取得 (fetch) を伴わない。
 * ゆえに ?demo=loading/error の取得縮退は **非対象** (list route の useListData seam とは別カテゴリ)。
 */
type Receptacle = {
  key: string
  icon: typeof SparklesIcon
  label: string
  count: number
  href: string
  desc: string
  urgent?: boolean
}

export function BusinessApproverHub() {
  const { forwardedProposals, pendingPromotions, escalations } = useBusinessApproverInbox()
  // F-025: 既定 persona=入力者 では「あなたが判断」は偽。操作者の role で文言を分岐し、権限が無ければ切替を促す。
  const actor = useCurrentActor()
  const isBusinessApprover = actor?.role === 'business-approver'
  const receptacles: Receptacle[] = [
    // F-024: 手順承認 / 設定承認 は同一 /config-approvals でも ?kind で着地時の絞り込みを変え、ハブの 2 受け口の区別を保つ。
    { key: 'proposals', icon: SparklesIcon, label: '手順承認', count: forwardedProposals.length, href: '/config-approvals?kind=proposal', desc: '現場の改善提案を正式手順に反映するか確認します' },
    { key: 'promotions', icon: BotIcon, label: '設定承認', count: pendingPromotions.length, href: '/config-approvals?kind=promotion', desc: 'Agent の自動化レベル昇格（設定変更）を確認します' },
    { key: 'escalations', icon: AlertTriangleIcon, label: 'エスカレーション裁定', count: escalations.length, href: '/escalations', desc: '現場が判断に迷う難案件を裁定（続行可・差戻し）します', urgent: true },
  ]
  const total = forwardedProposals.length + pendingPromotions.length + escalations.length

  return (
    <div className="flex flex-col">
      <PageHeader
        title="業務責任者ハブ"
        // F-043: 緊急 (裁定) を分離表示し緊急度階層を保つ (urgent と routine の等価合算を解消)。
        subtitle={
          <>
            {`${isBusinessApprover ? 'あなたが' : '業務責任者が'}判断待ち ${total} 件`}
            {escalations.length > 0 && <span className="font-medium text-[var(--color-alert-soft-fg)]">（うち裁定 {escalations.length} 件）</span>}
            {' ／ 手順承認・設定承認・エスカレーション裁定の受け口'}
          </>
        }
      >
        {!isBusinessApprover && (
          <p className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[var(--color-alert-soft-fg)]">
            <AlertTriangleIcon className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
            現在の操作者は「{actor ? roleLabel(actor.role) : '—'}」です。裁定・承認するには右上で業務責任者に切替えてください。
          </p>
        )}
      </PageHeader>

      <div className="grid gap-3 p-4 sm:grid-cols-3">
        {receptacles.map((r) => {
          const Icon = r.icon
          const active = r.count > 0
          // F-043: 0 件カードは遷移先が空ゆえ非リンク化 + 沈静化 (CTA を出さず「新規なし」)。空 queue への無駄誘導を防ぐ。
          const countClass = cn(
            'font-mono text-2xl font-semibold tabular-nums',
            active ? (r.urgent ? 'text-[var(--color-alert-soft-fg)]' : 'text-[var(--color-fg)]') : 'text-[var(--color-fg-tertiary)]',
          )
          const body = (
            <>
              <div className="flex items-start justify-between gap-2">
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[var(--radius-control)] bg-[var(--color-panel-inset)]">
                  <Icon className="h-5 w-5 text-[var(--color-fg-muted)]" aria-hidden="true" />
                </span>
                <span className={countClass}>{r.count}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-semibold text-[var(--color-fg)]">{r.label}</span>
                <span className="text-xs leading-relaxed text-[var(--color-fg-muted)]">{r.desc}</span>
              </div>
            </>
          )
          if (!active) {
            // 沈静化した非リンクカード (CTA なし、「新規なし」)。urgent でも 0 件なら alert にしない。
            return (
              // 沈静化は opacity でなく非 CTA + muted な count/「新規なし」で表現 (opacity は文字 contrast を AA 未満に落とすため使わない)。
              <div
                key={r.key}
                className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-panel)] p-4"
              >
                {body}
                <span className="mt-auto text-xs font-medium text-[var(--color-fg-tertiary)]">新規なし</span>
              </div>
            )
          }
          return (
            <Link
              key={r.key}
              to={r.href}
              className={cn(
                'group flex flex-col gap-3 rounded-[var(--radius-card)] border bg-[var(--color-panel)] p-4 transition-colors hover:bg-[var(--color-panel-inset)]',
                // urgent (裁定) は件数>0 で alert tone の枠を出し緊急度を視覚化。
                r.urgent ? 'border-[var(--color-alert-soft-border)] hover:border-[var(--color-alert)]' : 'border-[var(--color-border)] hover:border-[var(--color-border-strong)]',
              )}
            >
              {body}
              <span className="mt-auto inline-flex items-center gap-1 text-xs font-medium text-[var(--color-primary-strong)]">
                {`${r.count} 件を確認`}
                <ArrowRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
