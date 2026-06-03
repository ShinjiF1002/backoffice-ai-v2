import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { ViewProvider } from '@/context/ViewProvider'
import { ProcessSelector } from '@/components/shell/ProcessSelector'

// P1-6 keyboard a11y — ProcessSelector (roving listbox) を keyboard 駆動で操作できることを検証。
// 注 (honest scope): v1 の DocumentViewer / ReconcilePanel keyboard ケースは route-swap + dead-code 撤去で削除。
// v2 では文書行・要確認 card の row-select が mouse-only (`<div onClick>`、role/tabIndex/keydown なし) に簡素化され、
// v1 の row-level keyboard 選択経路は存在しない。field への実 action「対応」は per-row の native <button> で keyboard 操作可
// (CaseDetailV2)。route-level axe は構造 a11y のみで keyboard 操作性は未評価。
// → row-select の keyboard 化は別 a11y batch (FieldRow に role=button + tabIndex + onKeyDown 付与) として残課題。

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
})
