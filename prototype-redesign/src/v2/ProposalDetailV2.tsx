import { ChevronRightIcon, CheckIcon, CornerUpLeftIcon, ArrowRightIcon } from 'lucide-react'
import type { ProposalStatus } from '@/data/types'
import { proposalStatusToTone, proposalStatusLabel } from '@/lib/status-tones'
import { ToneChip, Card } from './ui'

/** ProposalDetailV2 — 提案詳細 (detail)。手順改定提案の根拠 + diff + 単一決定 (業務責任者の手順承認)。 */
const PROP = {
  id: 'PROP-2026-031',
  workflow: '法人住所変更',
  status: 'pending-triage' as ProposalStatus,
  title: '住所読み取りの判定基準を厳しめに調整',
  summary: '直近の差戻し 12 件中 8 件が住所のビル名読み取りに起因。判定基準を厳しめにし、低信頼時は自動確定せず要確認に回す。',
  criteria: [
    { label: '同種差戻しの件数', value: '12 件', threshold: '≥ 5 件', met: true },
    { label: '是正後の再発', value: '0 件', threshold: '= 0 件', met: true },
    { label: '影響範囲', value: '12 案件', threshold: '— [仮説 / 要検証]', met: true },
  ],
  diff: {
    file: 'approval-policy.md',
    section: '§3 住所判定',
    before: 'ビル名は OCR の読み取り値をそのまま採用する。',
    after: 'ビル名は OCR + 登録マスタ照合で一致した場合のみ自動確定し、不一致は要確認に回す。',
  },
}

export function ProposalDetailV2() {
  return (
    <div className="flex h-full flex-col">
      <header className="flex flex-shrink-0 flex-col gap-2 border-b border-[var(--v2-border)] bg-[var(--v2-panel)] px-6 py-3">
        <div className="flex items-center gap-1.5 text-[11px] text-[var(--v2-fg-muted)]">
          <a href="/v2/proposals" className="hover:text-[var(--v2-fg)] hover:underline">AI 提案</a>
          <ChevronRightIcon className="h-3 w-3 text-[var(--v2-fg-subtle)]" aria-hidden="true" />
          <span className="v2-mono text-[var(--v2-fg)]">{PROP.id}</span>
        </div>
        <div className="flex items-center gap-3">
          <h1 className="text-[18px] font-semibold text-[var(--v2-fg)]">{PROP.title}</h1>
          <ToneChip tone={proposalStatusToTone(PROP.status)} label={proposalStatusLabel(PROP.status)} />
        </div>
        <div className="text-[12px] text-[var(--v2-fg-muted)]">{PROP.workflow}</div>
      </header>

      <div className="mx-auto w-full max-w-[860px] flex-1 overflow-auto px-6 py-5">
        <Card className="p-4">
          <div className="text-[13px] font-medium text-[var(--v2-fg)]">提案の要旨</div>
          <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--v2-fg-muted)]">{PROP.summary}</p>
        </Card>

        {/* 判定基準 */}
        <Card className="mt-4 p-4">
          <div className="text-[13px] font-medium text-[var(--v2-fg)]">判定基準</div>
          <ul className="mt-2 flex flex-col gap-1.5">
            {PROP.criteria.map((c) => (
              <li key={c.label} className="flex items-center gap-3 text-[13px]">
                <span className="flex-1 text-[var(--v2-fg-muted)]">{c.label}</span>
                <span className="v2-tnum text-[var(--v2-fg)]">{c.value}</span>
                <span className="v2-tnum w-32 text-right text-[var(--v2-fg-tertiary)]">基準 {c.threshold}</span>
                <ToneChip tone={c.met ? 'success' : 'alert'} label={c.met ? '満たす' : '未達'} />
              </li>
            ))}
          </ul>
        </Card>

        {/* diff (変更前→変更後) */}
        <Card className="mt-4 p-4">
          <div className="flex items-center gap-2 text-[13px] font-medium text-[var(--v2-fg)]">
            変更案
            <span className="v2-mono text-[11px] text-[var(--v2-fg-tertiary)]">{PROP.diff.file} · {PROP.diff.section}</span>
          </div>
          <div className="mt-2 grid grid-cols-1 items-stretch gap-2 md:grid-cols-[1fr_auto_1fr]">
            <div className="rounded-[var(--v2-radius-control)] bg-[var(--v2-diff-del-bg)] p-3 text-[12px] text-[var(--v2-fg)]">
              <div className="mb-1 text-[10px] font-semibold uppercase text-[var(--v2-error-soft-fg)]">変更前</div>
              {PROP.diff.before}
            </div>
            <div className="hidden items-center justify-center text-[var(--v2-fg-subtle)] md:flex">
              <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
            </div>
            <div className="rounded-[var(--v2-radius-control)] bg-[var(--v2-diff-add-bg)] p-3 text-[12px] text-[var(--v2-fg)]">
              <div className="mb-1 text-[10px] font-semibold uppercase text-[var(--v2-success-soft-fg)]">変更後</div>
              {PROP.diff.after}
            </div>
          </div>
        </Card>
      </div>

      {/* footer: 単一決定 (手順承認 / 差戻し) */}
      <footer className="flex flex-shrink-0 items-center justify-between border-t border-[var(--v2-border)] bg-[var(--v2-panel)] px-6 py-3">
        <span className="text-[12px] text-[var(--v2-fg-muted)]">業務責任者が手順改定を承認すると、設定承認の対象になります（人のコントロールは渡さない）。</span>
        <div className="flex gap-2">
          <button type="button" className="flex items-center gap-1.5 rounded-[var(--v2-radius-control)] border border-[var(--v2-border-strong)] bg-[var(--v2-panel)] px-3.5 py-1.5 text-[13px] text-[var(--v2-fg)] hover:bg-[var(--v2-panel-inset)]">
            <CornerUpLeftIcon className="h-4 w-4" aria-hidden="true" />
            差戻し
          </button>
          <button type="button" className="flex items-center gap-1.5 rounded-[var(--v2-radius-control)] bg-[var(--v2-accent)] px-4 py-1.5 text-[13px] font-medium text-white hover:bg-[var(--v2-accent-hover)]">
            <CheckIcon className="h-4 w-4" aria-hidden="true" />
            手順承認
          </button>
        </div>
      </footer>
    </div>
  )
}
