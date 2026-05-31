import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRef, useState } from 'react'
import type { RefObject } from 'react'
import { Modal } from '@/components/shared/Modal'
import { ReasonDialog } from '@/components/shared/ReasonDialog'

// Phase 2 gate — 共通 Modal の a11y (focus 移動/Esc/trap/復帰/overlay) + dialog の submit gate。
function ModalHarness() {
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  return (
    <div>
      <button onClick={() => setOpen(true)}>トリガー</button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="テスト"
        initialFocusRef={inputRef as RefObject<HTMLElement | null>}
        footer={<button>確定</button>}
      >
        <input ref={inputRef} aria-label="入力" />
        <button>中間</button>
      </Modal>
    </div>
  )
}

describe('Modal a11y (Phase 2)', () => {
  it('open 時に initialFocusRef へ focus が移る', async () => {
    const user = userEvent.setup()
    render(<ModalHarness />)
    await user.click(screen.getByText('トリガー'))
    expect(screen.getByLabelText('入力')).toHaveFocus()
  })

  it('Esc で閉じ、trigger に focus 復帰する', async () => {
    const user = userEvent.setup()
    render(<ModalHarness />)
    const trigger = screen.getByText('トリガー')
    await user.click(trigger)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })

  it('overlay click で閉じる', async () => {
    const user = userEvent.setup()
    render(<ModalHarness />)
    await user.click(screen.getByText('トリガー'))
    // role=dialog は panel 側。backdrop = panel の親。座標 click は panel に当たり stopPropagation されるため
    // backdrop の onClick を fireEvent で直接検証する
    const panel = screen.getByRole('dialog')
    fireEvent.click(panel.parentElement!)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('focus trap: Tab を繰り返しても dialog 外へ出ない', async () => {
    const user = userEvent.setup()
    render(<ModalHarness />)
    await user.click(screen.getByText('トリガー'))
    const dialog = screen.getByRole('dialog')
    for (let i = 0; i < 6; i++) {
      await user.tab()
      expect(dialog.contains(document.activeElement)).toBe(true)
    }
  })
})

describe('ReasonDialog submit gate (Phase 2、載せ替え後も validation 不変)', () => {
  it('空 reason は submit されず error 表示、入力後は submit される', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    const onClose = vi.fn()
    render(
      <ReasonDialog
        open
        title="却下"
        label="理由 (必須)"
        placeholder="理由を記載"
        submitLabel="却下する"
        outcome="却下します。"
        onClose={onClose}
        onSubmit={onSubmit}
      />,
    )
    await user.click(screen.getByText('却下する'))
    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByText('入力してください')).toBeInTheDocument()

    await user.type(screen.getByRole('textbox'), '理由テスト')
    await user.click(screen.getByText('却下する'))
    expect(onSubmit).toHaveBeenCalledWith('理由テスト')
    expect(onClose).toHaveBeenCalled()
  })
})

// W3 §4.2 G5 — modal hardening: body scroll-lock + dirty-dismiss guard。
function DirtyModalHarness({ dirty }: { dirty: boolean }) {
  const [open, setOpen] = useState(true)
  return (
    <Modal open={open} onClose={() => setOpen(false)} title="編集" dirty={dirty} confirmOnDismiss footer={<button>保存</button>}>
      <input aria-label="入力" />
    </Modal>
  )
}

describe('Modal W3 G5 (scroll-lock + dirty-dismiss guard)', () => {
  it('open 中は body scroll-lock、close で前値へ復元', async () => {
    const user = userEvent.setup()
    render(<ModalHarness />)
    const before = document.body.style.overflow
    await user.click(screen.getByText('トリガー'))
    expect(document.body.style.overflow).toBe('hidden')
    await user.keyboard('{Escape}')
    expect(document.body.style.overflow).toBe(before)
  })

  it('dirty + confirmOnDismiss: Esc で即閉じず破棄確認、編集に戻るで継続 / 破棄して閉じるで閉じる', async () => {
    const user = userEvent.setup()
    render(<DirtyModalHarness dirty />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    await user.keyboard('{Escape}')
    expect(screen.getByRole('dialog')).toBeInTheDocument() // 即閉じない
    expect(screen.getByText('入力内容を破棄して閉じますか？')).toBeInTheDocument()
    await user.click(screen.getByText('編集に戻る'))
    expect(screen.queryByText('入力内容を破棄して閉じますか？')).not.toBeInTheDocument()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    await user.keyboard('{Escape}')
    await user.click(screen.getByText('破棄して閉じる'))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('backdrop click も dirty 時は破棄確認 (即閉じない)', () => {
    render(<DirtyModalHarness dirty />)
    const panel = screen.getByRole('dialog')
    fireEvent.click(panel.parentElement!)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('入力内容を破棄して閉じますか？')).toBeInTheDocument()
  })

  it('dirty=false: Esc で即閉じ (guard なし = 既存挙動)', async () => {
    const user = userEvent.setup()
    render(<DirtyModalHarness dirty={false} />)
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
