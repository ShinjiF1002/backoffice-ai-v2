import { render, screen } from '@testing-library/react'
import { ReconcilePanel } from '@/components/cross-cutting/ReconcilePanel'
import { CASE_DETAILS } from '@/data/mock-case-detail'

// P1-8 — 現行登録値 → 確定値 (before/after)。変更系 field のみ表示、新規登録 (口座開設) は非表示。

describe('P1-8 before/after (現行登録値→確定値)', () => {
  it('data: 0142 新住所が previousValue を持ち、口座開設 (0112) は持たない', () => {
    const addr = CASE_DETAILS['CASE-2026-0142']!.fields.find((f) => f.fieldLabel === '新住所')
    expect(addr?.previousValue).toBe('東京都千代田区丸の内 1 丁目 1 番 1 号')
    const acct = CASE_DETAILS['CASE-2026-0112']!.fields
    expect(acct.length).toBeGreaterThan(0)
    expect(acct.every((f) => f.previousValue === undefined)).toBe(true)
  })

  it('render: 変更系 field は現行登録値 (変更前) を表示 (0142 新住所)', () => {
    render(<ReconcilePanel fields={CASE_DETAILS['CASE-2026-0142']!.fields} />)
    // previousValue (旧住所) が before/after として描画される (aiValue=新住所とは別物)
    expect(screen.getByText('東京都千代田区丸の内 1 丁目 1 番 1 号')).toBeInTheDocument()
  })

  it('render: 新規登録 (口座開設 0112) は before/after を表示しない', () => {
    render(<ReconcilePanel fields={CASE_DETAILS['CASE-2026-0112']!.fields} />)
    expect(screen.queryByText('現在の登録値')).not.toBeInTheDocument()
  })
})
