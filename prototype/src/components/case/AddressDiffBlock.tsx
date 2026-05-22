/**
 * AddressDiffBlock — common-prefix/suffix-based single-run inline diff
 * SSOT: docs/03-ui-prototype-design.md §2.7.2 (Image 1 diff borrow、char-level inline single-run)
 *
 * Day 11.3 #1a + #1b: 旧/新 stacked chip layout から token inline diff に rewrite
 *   prefix (plain) + removed (red strikethrough) + added (green underline + soft bg) + suffix (plain)
 * Meta row (mono): `diff: 1 field · 1 segment`
 *
 * Mock 用途では LCS 不要、平均 20-40 chars の住所差分なら common prefix/suffix 検出で足る。
 * 複数 segment が必要になれば Day 14-15 で library or explicit segments 再評価。
 */

interface DiffSegments {
  prefix: string
  removed: string
  added: string
  suffix: string
}

function computeAddressDiff(oldValue: string, newValue: string): DiffSegments {
  // Common prefix (左端から一致する範囲)
  let prefixLen = 0
  const minLen = Math.min(oldValue.length, newValue.length)
  while (prefixLen < minLen && oldValue[prefixLen] === newValue[prefixLen]) {
    prefixLen++
  }

  // Common suffix (右端から一致、prefix と overlap させない)
  let suffixLen = 0
  const maxSuffix = minLen - prefixLen
  while (
    suffixLen < maxSuffix &&
    oldValue[oldValue.length - 1 - suffixLen] === newValue[newValue.length - 1 - suffixLen]
  ) {
    suffixLen++
  }

  return {
    prefix: oldValue.slice(0, prefixLen),
    removed: oldValue.slice(prefixLen, oldValue.length - suffixLen),
    added: newValue.slice(prefixLen, newValue.length - suffixLen),
    suffix: oldValue.slice(oldValue.length - suffixLen),
  }
}

export function AddressDiffBlock({ oldValue, newValue }: { oldValue: string; newValue: string }) {
  const { prefix, removed, added, suffix } = computeAddressDiff(oldValue, newValue)
  const segmentCount = removed === '' && added === '' ? 0 : 1

  return (
    <div className="space-y-1.5 rounded-md border border-slate-200 bg-slate-50 p-3">
      {/* Diff scope meta row (Day 11.3 #1b、mono) */}
      <div className="font-mono text-[10px] text-slate-500">
        diff: 1 field · {segmentCount} segment
      </div>

      {/* Inline single-run diff string (Day 11.3 #1a) */}
      <div className="text-xs leading-relaxed text-slate-900">
        <span>{prefix}</span>
        {removed && (
          <span className="text-[var(--color-diff-del)] line-through decoration-[var(--color-diff-del)] decoration-2">
            {removed}
          </span>
        )}
        {added && (
          <span className="rounded bg-[var(--color-diff-add-bg)] px-0.5 font-medium text-[var(--color-diff-add)] underline decoration-[var(--color-diff-add)] decoration-2 underline-offset-2">
            {added}
          </span>
        )}
        <span>{suffix}</span>
      </div>
    </div>
  )
}
