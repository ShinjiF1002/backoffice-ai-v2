import {
  SearchIcon,
  ArrowRightIcon,
  CornerUpLeftIcon,
  SparklesIcon,
  ClipboardCheckIcon,
  ShieldCheckIcon,
  ActivityIcon,
} from 'lucide-react'
import { FLYWHEEL_STAGES, OBS_LEDGER, OBS_SOD } from '@/data/mock-observatory'
import { PageHeader, Card } from './ui'

/**
 * ObservatoryV2 — 監視 (oversight archetype)。
 * 自動化が進むほど operator の主リスクは見落とし→automation complacency に構造シフトする。
 * → 「抜き取り確認」surface を能動的に置き silent green wall を破る (direction doc の distinctive 決定)。
 * Flywheel lineage (差戻し→改善ヒント→手順承認→設定承認) + 監査台帳 (raw confidence は台帳のみ = sanctioned 例外)。
 */

const FLY_ICON = { sendback: CornerUpLeftIcon, staging: SparklesIcon, procedure: ClipboardCheckIcon, config: ShieldCheckIcon } as const

export function ObservatoryV2() {
  return (
    <div className="flex h-full flex-col overflow-auto">
      <PageHeader
        title="モニタリング"
        sub="業務の健全性・統制・証跡"
        actions={
          <span className="inline-flex items-center gap-1.5 rounded-[var(--v2-radius-chip)] border border-[var(--v2-border)] bg-[var(--v2-panel-inset)] px-2 py-1 text-[12px] text-[var(--v2-fg-tertiary)]">
            <ShieldCheckIcon className="h-3.5 w-3.5" aria-hidden="true" />
            四眼: 入力者 {OBS_SOD.inputter} ≠ 承認者 {OBS_SOD.approver}
          </span>
        }
      />

      <div className="mx-auto w-full max-w-[1080px] px-6 py-5">
        {/* 抜き取り確認 surface (complacency 対策 — silent green wall を破る) */}
        <Card className="border-[var(--v2-accent-soft-border)] bg-[var(--v2-accent-soft)] p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[var(--v2-radius-control)] bg-[var(--v2-accent)] text-white">
                <SearchIcon className="h-4.5 w-4.5" aria-hidden="true" />
              </span>
              <div>
                <div className="text-[14px] font-semibold text-[var(--v2-fg)]">本日の自動確定を抜き取り確認</div>
                <p className="mt-1 max-w-[640px] text-[13px] text-[var(--v2-fg-muted)]">
                  AI が確定した <span className="v2-tnum font-medium text-[var(--v2-fg)]">28</span> 件のうち、
                  <span className="v2-tnum font-medium text-[var(--v2-fg)]"> 3</span> 件を無作為抽出して確認することを推奨します。
                  「すべて緑」で見落とすことを防ぐための能動チェックです。
                </p>
              </div>
            </div>
            <button className="flex flex-shrink-0 items-center gap-1.5 rounded-[var(--v2-radius-control)] bg-[var(--v2-accent)] px-3.5 py-2 text-[13px] font-medium text-white hover:bg-[var(--v2-accent-hover)]">
              抜き取りを開始
              <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </Card>

        {/* Flywheel lineage */}
        <Card className="mt-4 p-4">
          <div className="flex items-center gap-2 text-[13px] font-medium text-[var(--v2-fg)]">
            <ActivityIcon className="h-4 w-4 text-[var(--v2-fg-muted)]" aria-hidden="true" />
            改善の流れ（差戻しを次の正解手順に変える）
          </div>
          <ol className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-stretch">
            {FLYWHEEL_STAGES.map((s, i) => {
              const Icon = FLY_ICON[s.key]
              return (
                <li key={s.key} className="contents">
                  <div className="rounded-[var(--v2-radius-control)] border border-[var(--v2-hairline)] bg-[var(--v2-panel-inset)] p-3">
                    <div className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--v2-fg)]">
                      <Icon className="h-4 w-4 flex-shrink-0 text-[var(--v2-accent-strong)]" aria-hidden="true" />
                      {s.label}
                    </div>
                    <p className="mt-1 text-[11px] leading-relaxed text-[var(--v2-fg-tertiary)]">{s.note}</p>
                  </div>
                  {i < FLYWHEEL_STAGES.length - 1 && (
                    <div className="hidden items-center justify-center text-[var(--v2-fg-subtle)] md:flex">
                      <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
                    </div>
                  )}
                </li>
              )
            })}
          </ol>
        </Card>

        {/* 監査台帳 (raw event ledger — confidence raw は監査台帳のみの sanctioned 例外) */}
        <Card className="mt-4 overflow-hidden">
          <div className="flex items-center justify-between border-b border-[var(--v2-border)] px-4 py-2.5">
            <span className="text-[13px] font-medium text-[var(--v2-fg)]">監査台帳 — CASE-2026-0142</span>
            <span className="text-[11px] text-[var(--v2-fg-tertiary)]">後から完全に説明できる証跡（生の confidence は監査用）</span>
          </div>
          <div className="overflow-x-auto">
            <div className="min-w-[760px]">
              <div className="grid grid-cols-[150px_92px_104px_1fr_180px] gap-3 border-b border-[var(--v2-border)] bg-[var(--v2-panel-inset)] px-4 py-2 text-[11px] font-medium uppercase tracking-wide text-[var(--v2-fg-tertiary)]">
                <span>時刻</span>
                <span>役割</span>
                <span>アクション</span>
                <span>変更内容</span>
                <span>confidence（監査用）</span>
              </div>
              {OBS_LEDGER.map((e) => (
                <div key={e.ts} className="grid grid-cols-[150px_92px_104px_1fr_180px] gap-3 border-b border-[var(--v2-hairline)] px-4 py-2 text-[12px] last:border-b-0">
                  <span className="v2-mono text-[var(--v2-fg-tertiary)]">{e.ts}</span>
                  <span className="text-[var(--v2-fg-muted)]">{e.role}</span>
                  <span className="font-medium text-[var(--v2-fg)]">{e.action}</span>
                  <span className="text-[var(--v2-fg-muted)]">{e.beforeAfter}</span>
                  <span className="v2-mono text-[var(--v2-fg-tertiary)]">{e.confidence}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
