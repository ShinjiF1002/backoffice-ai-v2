/**
 * AddressDiffBlock — character-level diff for old → new address values
 * SSOT: docs/03-ui-prototype-design.md §2.7.2 (Image 1 diff borrow)
 *
 * red strikethrough on old / green underline on new、explicit 旧 / 新 label
 */
export function AddressDiffBlock({ oldValue, newValue }: { oldValue: string; newValue: string }) {
  return (
    <div className="space-y-1.5 rounded-md border border-slate-200 bg-slate-50 p-3">
      <div className="flex gap-2 text-xs">
        <span className="inline-flex shrink-0 items-center rounded bg-[var(--color-diff-del-bg)] px-1.5 py-0.5 font-mono font-medium text-[var(--color-diff-del)]">
          旧
        </span>
        <span className="text-slate-700 line-through decoration-[var(--color-diff-del)] decoration-2">
          {oldValue}
        </span>
      </div>
      <div className="flex gap-2 text-xs">
        <span className="inline-flex shrink-0 items-center rounded bg-[var(--color-diff-add-bg)] px-1.5 py-0.5 font-mono font-medium text-[var(--color-diff-add)]">
          新
        </span>
        <span className="font-medium text-slate-900 underline decoration-[var(--color-diff-add)] decoration-2 underline-offset-2">
          {newValue}
        </span>
      </div>
    </div>
  )
}
