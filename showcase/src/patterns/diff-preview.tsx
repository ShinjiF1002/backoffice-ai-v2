import { useState } from 'react'
import { PatternDemo, DemoFrame } from '@/components/PatternShell'
import { Kbd, EmptyState } from '@/components/Kbd'
import { cn } from '@/lib/cn'

type Field = { key: string; label: string; before: string | null; after: string | null; changed: boolean }

const FIELDS: Field[] = [
  { key: 'company',  label: '法人名',   before: '株式会社 ◯◯ コーポレーション', after: '株式会社 ◯◯ コーポレーション', changed: false },
  { key: 'zip',      label: '郵便番号', before: '106-6126', after: '100-0005', changed: true },
  { key: 'addr1',    label: '住所 1',   before: '東京都港区六本木 6-10-1', after: '東京都千代田区丸の内 1-3-1', changed: true },
  { key: 'addr2',    label: '住所 2',   before: '六本木ヒルズ森タワー 35F', after: '新丸の内ビルディング 22F', changed: true },
  { key: 'phone',    label: '電話番号', before: '03-1234-5678', after: '03-1234-5678', changed: false },
  { key: 'rep',      label: '代表者',   before: '山田 太郎', after: '山田 太郎', changed: false },
  { key: 'effDate',  label: '効力発生', before: '—', after: '2026-06-01', changed: true },
]

export function DiffPreviewDemo() {
  const [showOnlyChanges, setShowOnlyChanges] = useState(false)
  const [reason, setReason] = useState('')
  const filtered = showOnlyChanges ? FIELDS.filter((f) => f.changed) : FIELDS
  const changeCount = FIELDS.filter((f) => f.changed).length

  return (
    <PatternDemo
      notes={{
        useWhen: [
          'Agent proposal の Before / After を 1 画面で operator が判断する必要がある',
          'field-level に highlight して「何が変わるか」を秒で読めるようにする',
          '変更点が複数ある時、changes-only filter で集中レビューしたい',
        ],
        avoidWhen: [
          '変更が単一 field の単純承認 (overkill、inline diff で足りる)',
          'free-form text (long description) 主体の change (text diff tool へ)',
          'reason 入力を必須化せずに approve させたい (audit 観点 NG)',
        ],
      }}
    >
      <DemoFrame viewport="Desktop 1280×800 · Side-by-side diff">
        <div className="flex flex-col">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-[color:var(--color-border)] bg-[color:var(--color-panel-inset)]/60">
            <div className="flex items-center gap-3">
              <span className="text-[12px] text-[color:var(--color-fg-muted)]">
                <span className="font-mono text-[11px]">CASE-2026-0142</span> · 法人住所変更
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-[color:var(--color-alert-soft)] px-2 py-0.5 text-[10px] font-medium text-[color:var(--color-alert-soft-fg)]">
                {changeCount} fields changed
              </span>
            </div>
            <label className="flex items-center gap-2 text-[11px] text-[color:var(--color-fg-muted)] cursor-pointer">
              <input
                type="checkbox"
                checked={showOnlyChanges}
                onChange={(e) => setShowOnlyChanges(e.target.checked)}
                className="h-3 w-3 accent-[color:var(--color-primary)]"
              />
              Show only changes
            </label>
          </div>

          {/* Diff column header */}
          <div className="grid grid-cols-[160px_1fr_1fr] border-b border-[color:var(--color-border)] text-[10px] uppercase tracking-wider font-medium text-[color:var(--color-fg-subtle)]">
            <div className="px-5 py-2.5">Field</div>
            <div className="px-5 py-2.5 border-l border-[color:var(--color-border)] bg-[color:var(--color-error-soft)]/30">
              Before
            </div>
            <div className="px-5 py-2.5 border-l border-[color:var(--color-border)] bg-[color:var(--color-success-soft)]/30">
              After
            </div>
          </div>

          {/* Rows */}
          <div className="max-h-[340px] overflow-y-auto">
            {filtered.length === 0 ? (
              <EmptyState
                variant="filtered"
                message="変更された field がありません"
                action={{ label: 'Show all fields', onClick: () => setShowOnlyChanges(false) }}
              />
            ) : (
              filtered.map((f, i) => (
              <div
                key={f.key}
                className={cn(
                  'grid grid-cols-[160px_1fr_1fr] items-center text-[12px]',
                  i > 0 && 'border-t border-[color:var(--color-border)]',
                  f.changed && 'bg-[color:var(--color-alert-soft)]/15'
                )}
              >
                <div className="px-5 py-3 text-[11px] font-medium text-[color:var(--color-fg-muted)] flex items-center gap-1.5">
                  {f.changed && (
                    <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--color-alert)]" aria-label="changed" />
                  )}
                  {f.label}
                </div>
                <div className={cn(
                  'px-5 py-3 border-l border-[color:var(--color-border)] font-mono text-[11px]',
                  f.changed ? 'text-[color:var(--color-error-soft-fg)]' : 'text-[color:var(--color-fg-muted)]'
                )}>
                  {f.changed ? <span className="line-through opacity-70">{f.before}</span> : f.before}
                </div>
                <div className={cn(
                  'px-5 py-3 border-l border-[color:var(--color-border)] font-mono text-[11px]',
                  f.changed ? 'text-[color:var(--color-success-soft-fg)] font-medium' : 'text-[color:var(--color-fg-muted)]'
                )}>
                  {f.after}
                </div>
              </div>
              ))
            )}
          </div>

          {/* Reason + footer */}
          <div className="border-t border-[color:var(--color-border)] px-5 py-4 bg-[color:var(--color-panel-inset)]/40">
            <label className="text-[10px] uppercase tracking-wider font-medium text-[color:var(--color-fg-subtle)] block mb-1.5">
              承認理由 (audit に attach)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="例: 顧客からの本店移転届を確認、登記簿謄本と整合済"
              rows={2}
              className="w-full rounded-[var(--radius-control)] border border-[color:var(--color-border)] bg-[color:var(--color-panel)] px-3 py-2 text-[12px] resize-none focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]/30 focus:border-[color:var(--color-primary)]"
            />
            <div className="mt-3 flex items-center justify-between">
              <span className="text-[10px] text-[color:var(--color-fg-subtle)]">
                Reason は 10 文字以上必須・audit log に append されます
              </span>
              <div className="flex gap-2">
                <button className="inline-flex items-center gap-2 text-[12px] px-3 py-2 rounded-[var(--radius-control)] text-[color:var(--color-fg-muted)] hover:bg-[color:var(--color-panel)] transition-colors">
                  差戻し <Kbd>⌘⌫</Kbd>
                </button>
                <button
                  disabled={reason.length < 10}
                  className="inline-flex items-center gap-2 text-[12px] font-semibold px-4 py-2 rounded-[var(--radius-control)] bg-[color:var(--color-primary)] text-[color:var(--color-primary-fg)] hover:bg-[color:var(--color-primary-hover)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  承認 ({changeCount} 件変更) <Kbd tone="on-primary">⌘↵</Kbd>
                </button>
              </div>
            </div>
          </div>
        </div>
      </DemoFrame>
    </PatternDemo>
  )
}
