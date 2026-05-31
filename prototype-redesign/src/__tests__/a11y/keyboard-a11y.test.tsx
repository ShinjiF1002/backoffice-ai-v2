import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { ViewProvider } from '@/context/ViewProvider'
import { ProcessSelector } from '@/components/shell/ProcessSelector'
import { DocumentViewer } from '@/components/case/DocumentViewer'
import { ReconcilePanel } from '@/components/cross-cutting/ReconcilePanel'
import { CASE_2026_0142 } from '@/data/mock-case-detail'
import { isResolved } from '@/lib/reconcile-display'

// P1-6 keyboard a11y — clickable row / dropdown を keyboard 駆動で操作できることを検証。
// DocumentViewer (役 PDF 行) / ReconcilePanel (要確認カード) / ProcessSelector (roving listbox)。

describe('P1-6 keyboard a11y', () => {
  describe('ProcessSelector (roving listbox + Esc + outside-click)', () => {
    // localStorage は setup.ts の afterEach で test 毎に clear 済 (永続 process リーク防止)。

    it('Arrow で roving し Enter で確定 (default UC-BO-01 → ArrowDown → 口座開設書類完備)', async () => {
      const user = userEvent.setup()
      render(
        <ViewProvider>
          <ProcessSelector />
        </ViewProvider>,
      )
      const trigger = screen.getByRole('button', { name: /法人住所変更/ })
      await user.click(trigger)
      expect(screen.getByRole('listbox')).toBeInTheDocument()
      // 開いた時点で現在値 (法人住所変更, index 1) に focus → ArrowDown で index 2 (口座開設書類完備)
      await user.keyboard('{ArrowDown}')
      await user.keyboard('{Enter}')
      // listbox は閉じ、trigger ラベルが選択値に更新される
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: /口座開設書類完備/ })).toBeInTheDocument()
    })

    it('Esc で閉じ trigger へ focus 復帰', async () => {
      const user = userEvent.setup()
      render(
        <ViewProvider>
          <ProcessSelector />
        </ViewProvider>,
      )
      const trigger = screen.getByRole('button', { name: /法人住所変更/ })
      await user.click(trigger)
      expect(screen.getByRole('listbox')).toBeInTheDocument()
      await user.keyboard('{Escape}')
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
      expect(trigger).toHaveFocus()
    })

    it('outside-click で閉じる', async () => {
      const user = userEvent.setup()
      render(
        <ViewProvider>
          <ProcessSelector />
          <button type="button">外側</button>
        </ViewProvider>,
      )
      await user.click(screen.getByRole('button', { name: /法人住所変更/ }))
      expect(screen.getByRole('listbox')).toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: '外側' }))
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })

    it('open 中の listbox に axe violations がない', async () => {
      const user = userEvent.setup()
      const { container } = render(
        <ViewProvider>
          <ProcessSelector />
        </ViewProvider>,
      )
      await user.click(screen.getByRole('button', { name: /法人住所変更/ }))
      expect(await axe(container)).toHaveNoViolations()
    })
  })

  describe('DocumentViewer (clickable row keyboard)', () => {
    it('clickable row を Enter で選択 (onRowSelect 発火)', () => {
      const onRowSelect = vi.fn()
      render(<DocumentViewer document={CASE_2026_0142.document} onRowSelect={onRowSelect} />)
      // clickable row は <div role=button aria-pressed> (zoom toggle <button> も aria-pressed を持つため tag で除外)
      const rowButtons = screen
        .getAllByRole('button')
        .filter((b) => b.tagName === 'DIV' && b.hasAttribute('aria-pressed'))
      expect(rowButtons.length).toBeGreaterThan(0)
      const firstClickable = CASE_2026_0142.document.rows.find((r) => r.fieldLabel)
      rowButtons[0]!.focus()
      fireEvent.keyDown(rowButtons[0]!, { key: 'Enter' })
      expect(onRowSelect).toHaveBeenCalledWith(firstClickable!.fieldLabel)
    })
  })

  describe('ReconcilePanel (要確認カード keyboard)', () => {
    it('要確認カードの項目選択 button を click で選択 (onSelectField 発火)', async () => {
      const user = userEvent.setup()
      const onSelectField = vi.fn()
      render(<ReconcilePanel fields={CASE_2026_0142.fields} onSelectField={onSelectField} />)
      // W3 a11y: card は role=button を廃し、項目 label の <button aria-pressed> が keyboard 選択を担う (内側「対応」との nested-interactive 回避)。
      const selectBtns = screen.getAllByRole('button').filter((b) => b.hasAttribute('aria-pressed'))
      const firstOpen = CASE_2026_0142.fields.find((f) => !isResolved(f.reconcileState))
      expect(firstOpen).toBeDefined()
      expect(selectBtns.length).toBeGreaterThan(0)
      await user.click(selectBtns[0]!)
      expect(onSelectField).toHaveBeenCalledWith(firstOpen!.fieldLabel)
    })
  })
})
