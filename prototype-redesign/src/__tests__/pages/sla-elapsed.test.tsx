import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { StoreProvider } from '@/store/StoreProvider'
import { ViewProvider } from '@/context/ViewProvider'
import { clearPersisted } from '@/store/persist'
import App from '@/App'
import { elapsedLabelFrom, caseElapsedLabel, NOW_ISO } from '@/lib/dates'

// W3 SLA real computation — 静的 elapsed 文字列を受付 datetime からの算出 label に置換 (§4 G7 / audit §3.2 scope-0 本実装)。
// 純関数の bucket 検証 + Cases 一覧 render での実描画 (hook-only でなく screen evidence、W2 教訓)。
describe('W3 SLA: elapsedLabelFrom / caseElapsedLabel (受付 datetime 基準の経過算出)', () => {
  const NOW = '2026-05-30T18:00:00+09:00'

  it('60 分未満 → 約N分', () => {
    expect(elapsedLabelFrom('2026-05-30T17:22:00+09:00', NOW)).toBe('約38分')
  })
  it('60 分以上 24 時間未満 → 約N時間 (分は切り捨て)', () => {
    expect(elapsedLabelFrom('2026-05-30T16:40:00+09:00', NOW)).toBe('約1時間') // 80 分
    expect(elapsedLabelFrom('2026-05-30T12:30:00+09:00', NOW)).toBe('約5時間') // 330 分
  })
  it('24 時間以上 → N日', () => {
    expect(elapsedLabelFrom('2026-05-29T16:40:00+09:00', NOW)).toBe('1日') // 約 25 時間
  })
  it('不正 / 未来の receivedAt は防御的に — (白画面化回避)', () => {
    expect(elapsedLabelFrom('not-a-date', NOW)).toBe('—')
    expect(elapsedLabelFrom('2026-05-31T00:00:00+09:00', NOW)).toBe('—') // 未来
  })
  it('caseElapsedLabel: reflected は 処理済 (SLA clock 停止)、それ以外は経過', () => {
    expect(caseElapsedLabel('2026-05-29T16:40:00+09:00', 'reflected', NOW)).toBe('処理済')
    expect(caseElapsedLabel('2026-05-30T16:40:00+09:00', 'ready', NOW)).toBe('約1時間')
  })
  it('NOW_ISO は固定定数 (runtime clock 非依存、test 決定性)', () => {
    expect(NOW_ISO).toBe('2026-05-30T18:00:00+09:00')
  })
})

describe('W3 SLA: Cases 一覧の経過列が受付 datetime から算出される (render evidence)', () => {
  beforeEach(() => clearPersisted())

  it('reflected は 処理済 / 進行中は 約N時間 を表示 (旧静的文字列は出ない)', () => {
    render(
      <MemoryRouter initialEntries={['/cases']}>
        <StoreProvider>
          <ViewProvider>
            <App />
          </ViewProvider>
        </StoreProvider>
      </MemoryRouter>,
    )
    // 0142 (ready, 受付 16:40) → 約1時間、0120 (reflected) → 処理済
    expect(screen.getAllByText('約1時間').length).toBeGreaterThan(0)
    expect(screen.getAllByText('処理済').length).toBeGreaterThan(0)
    // 旧静的 elapsed 文字列は描画されない
    expect(screen.queryByText('1時間20分')).not.toBeInTheDocument()
  })
})
