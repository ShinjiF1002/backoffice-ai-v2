import { render } from '@testing-library/react'
import { axe } from 'jest-axe'
import { PrototypeModeLabel } from '@/components/shared/PrototypeModeLabel'
import { StatusBadge } from '@/components/shared/StatusBadge'

// Phase 0 最小 axe smoke — 検証 harness (jsdom + jest-axe + expect.extend) が動くことを 1 本で証明。
// 9 画面の網羅 axe は Phase 6 / R0 Gate で追加 (SSOT: plan Phase 0 Gate)。
describe('a11y smoke (Phase 0 harness 検証)', () => {
  it('PrototypeModeLabel に axe violations がない', async () => {
    const { container } = render(<PrototypeModeLabel />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('StatusBadge に axe violations がない', async () => {
    const { container } = render(<StatusBadge tone="success" label="承認済" />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
