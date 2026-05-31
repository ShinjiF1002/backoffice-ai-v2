import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PrototypeModeLabel } from '@/components/shared/PrototypeModeLabel'

// F-052: 法務免責の常時到達性。常時可視 pill が material な 3 事実を述べ、包括的免責本文は
// hover だけでなく click/keyboard で開ける disclosure (touch でも到達)。role=status の live region 誤用は排除。

describe('F-052 PrototypeModeLabel disclosure', () => {
  it('常時可視 pill が material な 4 事実 (プロトタイプ/外部未接続/実データなし/AI・証跡モック) を折り畳み非依存で表示', () => {
    render(<PrototypeModeLabel />)
    const pill = screen.getByText('プロトタイプ表示 — 外部未接続 / 実データなし / AI・証跡はモック')
    expect(pill).toBeInTheDocument()
    // material facts が常時可視 pill 内に含まれる (disclosure を開かずとも読める)
    expect(pill.textContent).toMatch(/実データなし/)
    expect(pill.textContent).toMatch(/AI・証跡はモック/)
  })

  it('click で disclosure が開く (aria-expanded toggle、hover 非依存)', async () => {
    const user = userEvent.setup()
    render(<PrototypeModeLabel />)
    const btn = screen.getByRole('button')
    expect(btn).toHaveAttribute('aria-expanded', 'false')
    await user.click(btn)
    expect(btn).toHaveAttribute('aria-expanded', 'true')
    await user.click(btn)
    expect(btn).toHaveAttribute('aria-expanded', 'false')
  })

  it('包括的免責本文が DOM に存在し到達可能 (常時 render、disclosure で可視化)', () => {
    render(<PrototypeModeLabel />)
    expect(screen.getByText(/実 LLM \/ 実行系・送金・台帳更新には未接続/)).toBeInTheDocument()
    expect(screen.getByText(/実顧客データ未使用/)).toBeInTheDocument()
  })

  it('静的 pill に role=status (live region) を使わない', () => {
    render(<PrototypeModeLabel />)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })
})
