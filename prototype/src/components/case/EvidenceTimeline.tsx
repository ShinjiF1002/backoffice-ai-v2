import { useState } from 'react'
import { FileText, ScanLine, Database, Sparkles } from 'lucide-react'
import { cn } from '@/lib/cn'
import { DisabledAction } from '@/components/shared/DisabledAction'
import { DetailDrawer } from '@/components/shared/DetailDrawer'
import { SHOW_INTERNAL_METADATA } from '@/lib/show-internal'
import type { EvidenceStep } from '@/data/types'

/**
 * EvidenceTimeline — 証跡 vertical timeline rail (CaseReview 中央 column 主役)
 * SSOT: docs/03-ui-prototype-design.md §2.7.2 (Image 2 primary)
 *
 * 8px dots + 1px line、step ごとに icon + name + timestamp + 簡易 metadata line
 *
 * Day 11.3 #3a + #3b:
 *  - alerts prop は撤去 (CaseReview の LifecycleStepper 直下 strip に構造移動、timeline event と分離)
 *  - per-step に metadata line を追加、operational signature 強化
 *  - 「ALERT」uppercase 英語 header 削除 (alerts 移動で不要、§5a)
 *
 * Day 19 Commit 3b (U-4): raw prefix paraphrase + DetailDrawer 開閉
 *  - L1 metadata: schema key prefix (snake_case + colon 形式) を削除、actor label + 版数 + `信頼度` paraphrase
 *  - step click で `<DetailDrawer>` open、raw schema field は SHOW_INTERNAL_METADATA gate 経由でのみ visible (Commit 2 paradigm 継承)
 *  - PDR pattern: non-modal、page scroll 保持、background interactive
 */

function iconForLabel(label: string) {
  switch (label) {
    case 'PDF':
      return FileText
    case 'IMG':
      return ScanLine
    case 'DB':
      return Database
    case 'AI':
      return Sparkles
    default:
      return FileText
  }
}

function actorLabel(role: string): string {
  if (role === 'AI') return 'AI'
  if (role === 'system') return 'システム'
  return role
}

/**
 * source 末尾の version suffix (`-v2.3` 等) を抽出。
 * 例: `ai.address-extractor-v2.3` → `v2.3`、`db.address_master` → null
 */
function extractVersion(source?: string): string | null {
  if (!source) return null
  const match = source.match(/-(v\d+(?:\.\d+)?)$/)
  return match ? match[1] : null
}

function statusLabel(status: EvidenceStep['status']): string {
  switch (status) {
    case 'completed':
      return '完了'
    case 'warning':
      return '警告'
    case 'pending':
      return '待機'
    default:
      return status
  }
}

export function EvidenceTimeline({
  pdfName,
  pdfPages,
  steps,
}: {
  pdfName: string
  pdfPages: number
  steps: EvidenceStep[]
}) {
  const [selectedStep, setSelectedStep] = useState<EvidenceStep | null>(null)

  return (
    <div className="flex h-full flex-col">
      {/* Section heading */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900">証跡</h2>
        <span className="font-mono text-[10px] text-slate-500">{steps.length} step</span>
      </div>

      {/* PDF preview thumbnail */}
      <div className="mb-4 flex gap-3 rounded-md border border-slate-200 bg-slate-50 p-3">
        <div className="flex h-16 w-12 shrink-0 items-center justify-center rounded border border-slate-200 bg-white">
          <FileText className="h-5 w-5 text-slate-400" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-medium text-slate-900">{pdfName}</span>
          <span className="mt-0.5 font-mono text-[10px] text-slate-500">{pdfPages} ページ</span>
          {/* Day 18.5 拡張 Commit 0 (U-3): enabled no-op 解消、PDF 実 preview は Phase 1、Day 18.5 DisabledAction wrapper SSOT に統合 */}
          <DisabledAction
            mode="wrapper"
            reason="本 prototype では PDF プレビューは未実装、Phase 1 で実装予定"
            className="mt-1 text-left text-[11px] font-medium text-slate-400 opacity-70"
          >
            プレビュー →
          </DisabledAction>
        </div>
      </div>

      {/* Vertical timeline rail */}
      <ol className="relative space-y-3 border-l border-slate-200 pl-5">
        {steps.map((step) => {
          const Icon = iconForLabel(step.thumbnailLabel)
          const version = extractVersion(step.source)
          return (
            <li key={step.id} className="relative">
              {/* dot */}
              <span
                className={cn(
                  'absolute -left-[26px] top-1.5 h-2 w-2 rounded-full ring-2 ring-white',
                  step.status === 'completed' && 'bg-[var(--color-success)]',
                  step.status === 'warning' && 'bg-[var(--color-alert)]',
                  step.status === 'pending' && 'bg-slate-300'
                )}
                aria-hidden="true"
              />
              <button
                type="button"
                onClick={() => setSelectedStep(step)}
                aria-label={`${step.name} の証跡詳細を開く`}
                className="block w-full rounded-md border border-slate-200 bg-white p-2.5 text-left transition-colors hover:border-slate-300 hover:bg-slate-50"
              >
                <div className="flex items-start gap-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded border border-slate-200 bg-slate-50">
                    <Icon className="h-3.5 w-3.5 text-slate-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-slate-900">{step.name}</span>
                      <span className="font-mono text-[10px] text-slate-400 tabular">{step.timestamp}</span>
                    </div>
                    {/* Day 19 Commit 3b U-4 L1 paraphrase: raw prefix 削除、actor label + 版数 + 信頼度 */}
                    <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px] text-slate-500">
                      <span className="text-slate-700">{actorLabel(step.actor)}</span>
                      {version && (
                        <>
                          <span className="text-slate-300">·</span>
                          <span className="font-mono text-[10px] text-slate-600 tabular">{version}</span>
                        </>
                      )}
                      {typeof step.confidence === 'number' && (
                        <>
                          <span className="text-slate-300">·</span>
                          <span
                            className={cn(
                              'font-mono tabular',
                              step.confidence >= 0.85
                                ? 'text-[var(--color-success)]'
                                : step.confidence >= 0.65
                                  ? 'text-[var(--color-alert)]'
                                  : 'text-[var(--color-error)]'
                            )}
                          >
                            信頼度 {step.confidence.toFixed(2)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            </li>
          )
        })}
      </ol>

      {/* === Day 19 Commit 3b: DetailDrawer (non-modal PDR pattern、raw schema visibility は SHOW_INTERNAL_METADATA gate) === */}
      <DetailDrawer
        open={selectedStep !== null}
        onClose={() => setSelectedStep(null)}
        title={selectedStep ? `${selectedStep.name} — 証跡詳細` : ''}
        width="480"
      >
        {selectedStep && (
          <dl className="space-y-3 text-xs">
            {/* dt = JP label + (?debug=1 時) schemaKey sub-label / dd = 値、Commit 2 AuditTrail/KnowledgeBrowser pattern 継承 */}
            <div>
              <dt className="flex items-baseline gap-1.5 text-[11px] text-slate-500">
                step 名称
                {SHOW_INTERNAL_METADATA && (
                  <span className="font-mono text-[9px] text-slate-400">name</span>
                )}
              </dt>
              <dd className="mt-0.5 font-medium text-slate-900">{selectedStep.name}</dd>
              {SHOW_INTERNAL_METADATA && (
                <dd className="mt-0.5 font-mono text-[9px] text-slate-400">{selectedStep.id}</dd>
              )}
            </div>
            <div>
              <dt className="flex items-baseline gap-1.5 text-[11px] text-slate-500">
                タイムスタンプ
                {SHOW_INTERNAL_METADATA && (
                  <span className="font-mono text-[9px] text-slate-400">timestamp</span>
                )}
              </dt>
              <dd className="mt-0.5 font-mono text-slate-700 tabular">{selectedStep.timestamp}</dd>
            </div>
            <div>
              <dt className="flex items-baseline gap-1.5 text-[11px] text-slate-500">
                実行主体
                {SHOW_INTERNAL_METADATA && (
                  <span className="font-mono text-[9px] text-slate-400">actor</span>
                )}
              </dt>
              <dd className="mt-0.5 font-medium text-slate-900">{actorLabel(selectedStep.actor)}</dd>
              {SHOW_INTERNAL_METADATA && (
                <dd className="mt-0.5 font-mono text-[9px] text-slate-400">{selectedStep.actor}</dd>
              )}
            </div>
            {selectedStep.source && (
              <div>
                <dt className="flex items-baseline gap-1.5 text-[11px] text-slate-500">
                  処理モデル / ソース
                  {SHOW_INTERNAL_METADATA && (
                    <span className="font-mono text-[9px] text-slate-400">source</span>
                  )}
                </dt>
                <dd className="mt-0.5 font-mono text-slate-700">{selectedStep.source}</dd>
              </div>
            )}
            {typeof selectedStep.confidence === 'number' && (
              <div>
                <dt className="flex items-baseline gap-1.5 text-[11px] text-slate-500">
                  信頼度
                  {SHOW_INTERNAL_METADATA && (
                    <span className="font-mono text-[9px] text-slate-400">confidence</span>
                  )}
                </dt>
                <dd
                  className={cn(
                    'mt-0.5 font-mono tabular',
                    selectedStep.confidence >= 0.85
                      ? 'text-[var(--color-success)]'
                      : selectedStep.confidence >= 0.65
                        ? 'text-[var(--color-alert)]'
                        : 'text-[var(--color-error)]'
                  )}
                >
                  {selectedStep.confidence.toFixed(2)}
                </dd>
              </div>
            )}
            <div>
              <dt className="flex items-baseline gap-1.5 text-[11px] text-slate-500">
                状態
                {SHOW_INTERNAL_METADATA && (
                  <span className="font-mono text-[9px] text-slate-400">status</span>
                )}
              </dt>
              <dd className="mt-0.5 text-slate-700">{statusLabel(selectedStep.status)}</dd>
              {SHOW_INTERNAL_METADATA && (
                <dd className="mt-0.5 font-mono text-[9px] text-slate-400">{selectedStep.status}</dd>
              )}
            </div>
          </dl>
        )}
      </DetailDrawer>
    </div>
  )
}
