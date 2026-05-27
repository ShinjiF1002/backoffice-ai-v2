import { PatternDemo, DemoFrame } from '@/components/PatternShell'
import { cn } from '@/lib/cn'

type Tier = 'T1' | 'T2' | 'T3'
type Freshness = 'breaking' | 'monthly' | 'quarterly' | 'stable'

type Citation = {
  tier: Tier
  freshness: Freshness
  title: string
  domain: string
  passage: string
  accessedAt: string
  staging: boolean
}

const CITATIONS: Citation[] = [
  {
    tier: 'T1', freshness: 'stable',
    title: '商業登記法 第 8 条 — 登記事項の変更登記',
    domain: 'e-Gov 法令検索',
    passage: '登記事項に変更が生じたときは、二週間以内に、その本店の所在地において、変更の登記をしなければならない。',
    accessedAt: '2026-05-26',
    staging: false,
  },
  {
    tier: 'T1', freshness: 'monthly',
    title: '法務省 登記情報提供サービス — 商業法人登記情報',
    domain: 'houmukyoku.moj.go.jp',
    passage: '登記事項証明書のオンライン取得は、申請から平均 30 分以内に交付される。',
    accessedAt: '2026-05-24',
    staging: false,
  },
  {
    tier: 'T2', freshness: 'quarterly',
    title: '銀行内部規程 BO-003 — 法人住所変更の本人確認',
    domain: 'internal-policy-vault',
    passage: '住所変更届の受領時は、登記簿謄本または公的書類の写しを 1 通取得し、現住所との整合を確認する。',
    accessedAt: '2026-04-12',
    staging: false,
  },
  {
    tier: 'T3', freshness: 'breaking',
    title: '社内 Slack #ops-bot に operator がメモした暫定運用',
    domain: 'slack.com (staging hint)',
    passage: '丸の内移転 6/1 effective 案件は当面 manual review pinning とする (要 audit 6/15 まで)。',
    accessedAt: '2026-05-25',
    staging: true,
  },
]

export function CitationDisclosureDemo() {
  const verified = CITATIONS.filter((c) => !c.staging)
  const staging = CITATIONS.filter((c) => c.staging)

  return (
    <PatternDemo
      notes={{
        useWhen: [
          'Agent の判断根拠を operator / regulator に開示する必要がある',
          'Evidence Strength (T1 primary / T2 secondary / T3 derived) × Freshness で source 信頼度を可視化',
          '確定 source と staging hint (未承認暫定 memo) を視覚分離して evidence 誤用を防ぐ',
        ],
        avoidWhen: [
          'Free-text 「自然言語の根拠説明」だけで済む文脈 (audit 観点で source URL がない)',
          'source を 1 つにまとめて要約表示 (regulator review で actor / source 不能)',
          '「AI が判断したので」と source 開示なしで approve させる (compliance 違反)',
        ],
      }}
    >
      <DemoFrame viewport="Desktop 1280×800 · Evidence panel">
        <div className="flex flex-col">
          {/* Verified sources */}
          <div className="px-5 py-3 border-b border-[color:var(--color-border)] bg-[color:var(--color-panel)]">
            <div className="flex items-center gap-2 mb-3">
              <span className="h-2 w-2 rounded-full bg-[color:var(--color-success)]" />
              <h4 className="text-[11px] uppercase tracking-wider font-semibold text-[color:var(--color-success-soft-fg)]">
                Verified sources — citation 可能
              </h4>
              <span className="text-[10px] text-[color:var(--color-fg-subtle)]">{verified.length} 件</span>
            </div>
            <div className="space-y-2.5">
              {verified.map((c, i) => (
                <SourceCard key={i} c={c} />
              ))}
            </div>
          </div>

          {/* Staging divider */}
          <div className="relative px-5 py-2.5 bg-[color:var(--color-alert-soft)]/30 border-y border-[color:var(--color-alert-soft)]">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-bold text-[color:var(--color-alert-soft-fg)]">
              <DividerIcon />
              Staging hint — citation 不可、audit 承認後に格上げ
            </div>
          </div>

          {/* Staging hints */}
          <div className="px-5 py-3 bg-[color:var(--color-alert-soft)]/15">
            <div className="space-y-2.5">
              {staging.map((c, i) => (
                <SourceCard key={i} c={c} />
              ))}
            </div>
          </div>
        </div>
      </DemoFrame>
    </PatternDemo>
  )
}

function SourceCard({ c }: { c: Citation }) {
  return (
    <article
      className={cn(
        'rounded-[var(--radius-control)] border p-3.5 text-[color:var(--color-fg)]',
        c.staging
          ? 'border-[color:var(--color-alert-soft)] bg-[color:var(--color-panel)] border-dashed'
          : 'border-[color:var(--color-border)] bg-[color:var(--color-panel)]'
      )}
    >
      {/* Primary anchor: Tier badge promoted to lead, freshness inline + meta right-aligned */}
      <div className="flex items-start gap-2 mb-2">
        <TierBadge tier={c.tier} />
        <div className="flex-1 min-w-0">
          <h5 className="text-[14px] font-semibold text-[color:var(--color-ink)] tracking-tight leading-[1.4]">
            {c.title}
          </h5>
          <div className="mt-0.5 flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-mono text-[color:var(--color-fg-subtle)]">{c.domain}</span>
            <span className="text-[color:var(--color-fg-subtle)]" aria-hidden>·</span>
            <FreshnessBadge fr={c.freshness} />
          </div>
        </div>
        <span className="text-[11px] font-mono tabular text-[color:var(--color-fg-subtle)] flex-none mt-0.5">
          {c.accessedAt}
        </span>
      </div>

      {/* Quote: PD1 collapsed-by-default、details で reading-mode を deep-read に明示 expand */}
      <details className="group/quote">
        <summary className="list-none cursor-pointer inline-flex items-center gap-1.5 text-[12px] font-medium text-[color:var(--color-primary)] hover:underline">
          <ChevronIcon />
          引用文を読む
        </summary>
        <blockquote
          className={cn(
            'mt-2 border-l-2 pl-3 py-1 text-[12px] leading-[1.75] text-[color:var(--color-fg)]',
            c.staging
              ? 'border-[color:var(--color-alert)] bg-[color:var(--color-alert-soft)]/30 italic'
              : 'border-[color:var(--color-border-strong)]'
          )}
        >
          {c.passage}
        </blockquote>
      </details>
    </article>
  )
}

function ChevronIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="transition-transform group-open/quote:rotate-90" aria-hidden>
      <path d="M3.5 2.5l3 2.5-3 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function TierBadge({ tier }: { tier: Tier }) {
  const map: Record<Tier, { bg: string; fg: string; label: string }> = {
    T1: { bg: 'bg-[color:var(--color-success-soft)]', fg: 'text-[color:var(--color-success-soft-fg)]', label: 'T1' },
    T2: { bg: 'bg-[color:var(--color-primary-soft)]', fg: 'text-[color:var(--color-primary)]',         label: 'T2' },
    T3: { bg: 'bg-[color:var(--color-panel-inset)]', fg: 'text-[color:var(--color-fg-muted)]',         label: 'T3' },
  }
  const m = map[tier]
  // primary anchor: 大型 chip 化、aspect-1 で目立たせる
  return (
    <span
      className={cn(
        'inline-flex h-7 min-w-[44px] items-center justify-center rounded-md px-2 text-[12px] font-bold tracking-wider flex-none',
        m.bg, m.fg
      )}
      aria-label={`Source tier ${m.label}`}
    >
      {m.label}
    </span>
  )
}

function FreshnessBadge({ fr }: { fr: Freshness }) {
  const map: Record<Freshness, { fg: string; label: string }> = {
    breaking:  { fg: 'text-[color:var(--color-error-soft-fg)]', label: 'breaking' },
    monthly:   { fg: 'text-[color:var(--color-alert-soft-fg)]', label: 'monthly' },
    quarterly: { fg: 'text-[color:var(--color-primary)]', label: 'quarterly' },
    stable:    { fg: 'text-[color:var(--color-success-soft-fg)]', label: 'stable' },
  }
  const m = map[fr]
  return (
    <span className={cn('inline-flex items-center gap-1 text-[11px] font-medium', m.fg)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
      {m.label}
    </span>
  )
}

function DividerIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
      <path d="M6 1v10M2 6h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="6" cy="6" r="2" fill="currentColor" opacity="0.5" />
    </svg>
  )
}
