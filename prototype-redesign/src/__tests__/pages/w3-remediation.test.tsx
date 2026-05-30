import { render, screen, renderHook } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { StoreProvider } from '@/store/StoreProvider'
import { ViewProvider } from '@/context/ViewProvider'
import { useFlywheelLineage } from '@/store/hooks'
import { clearPersisted } from '@/store/persist'
import App from '@/App'

// P0-W3 — UI 配線 + 観測可能化の screen-level evidence を自動化 (p0-plan §6 の目視確認を behavioral test 化)。
// 実コンポーネント + StoreProvider + ViewProvider + 実 route を踏む (design-test-fidelity: 静的近似でなく app context)。
function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <StoreProvider>
        <ViewProvider>
          <App />
        </ViewProvider>
      </StoreProvider>
    </MemoryRouter>,
  )
}

describe('P0-W3 B1: 手入力で上書き → 確認済行が訂正値 (humanValue) を表示', () => {
  beforeEach(() => clearPersisted())

  it('0142 ビル名 を手入力上書き → 確認済行に訂正値が出る (AI 値でない)', async () => {
    const user = userEvent.setup()
    renderAt('/cases/CASE-2026-0142') // ready / flags1 / ビル名 = needs_review (AI: サンプルビル)

    // 要確認 ビル名 の「対応」で統合 modal を開く
    await user.click(screen.getByRole('button', { name: '対応' }))
    // 「手入力で上書き」→ 訂正値入力欄が出る
    await user.click(screen.getByRole('button', { name: '手入力で上書き' }))
    const valueInput = screen.getByLabelText('訂正後の値 (必須)')
    await user.type(valueInput, '丸の内ビルディング')
    await user.click(screen.getByRole('button', { name: '確定' }))

    // 確認済行に訂正値が出る (humanValue ?? aiValue)
    expect(screen.getByText('丸の内ビルディング')).toBeInTheDocument()

    // modal 再 open: 確認済行の「確認」で訂正値を read-only 再表示 (項目の確認 = review view)
    await user.click(screen.getByRole('button', { name: '確認' }))
    expect(screen.getByText('項目の確認')).toBeInTheDocument()
    expect(screen.getByText('現在値')).toBeInTheDocument()
    expect(screen.getAllByText('丸の内ビルディング').length).toBeGreaterThan(1) // 行 + modal
  })

  it('訂正値未入力では確定不可 (value 必須 validation)', async () => {
    const user = userEvent.setup()
    renderAt('/cases/CASE-2026-0142')
    await user.click(screen.getByRole('button', { name: '対応' }))
    await user.click(screen.getByRole('button', { name: '手入力で上書き' }))
    // 値を入れずに確定 → error 表示、modal は閉じない (確定不可)
    await user.click(screen.getByRole('button', { name: '確定' }))
    expect(screen.getByText('入力してください')).toBeInTheDocument()
    expect(screen.getByLabelText('訂正後の値 (必須)')).toBeInTheDocument() // modal 残存
  })
})

describe('P0-W3 B4: persona 切替で操作ビュー + 承認 gate が変わる (SoD)', () => {
  beforeEach(() => clearPersisted())

  it('入力者 persona では承認待ち案件を承認不可、承認者へ切替で最終承認可', async () => {
    const user = userEvent.setup()
    renderAt('/cases/CASE-2026-0128') // business-approval-waiting (一覧 owner=鈴木課長 / 入力者承認 actor=山田太郎)

    // 既定 persona = 入力者 → 入力者ビュー → baw は入力者確認段階でないため承認 disabled
    expect(screen.getByRole('button', { name: '承認' })).toBeDisabled()

    // 操作者を承認者 (鈴木課長) に切替 → 承認者ビュー → SoD 成立 (入力者≠承認者) で最終承認可
    await user.selectOptions(screen.getByRole('combobox', { name: '操作者（デモ用の担当者）の切替' }), 'actor-checker')
    expect(screen.getByRole('button', { name: '最終承認' })).toBeEnabled()
  })

  it('SoD 表示は実際の入力者承認 actor (山田太郎) を出す — 一覧 owner 名 (鈴木課長) を入力者に混同しない', async () => {
    const user = userEvent.setup()
    renderAt('/cases/CASE-2026-0128') // owner=鈴木課長 だが入力者承認は山田太郎 (= 承認者 persona と同名にしない)
    await user.selectOptions(screen.getByRole('combobox', { name: '操作者（デモ用の担当者）の切替' }), 'actor-checker')
    // 承認者ビューの SoD 表示: 入力者=山田太郎 (actor 解決名)。owner の鈴木課長を入力者として出すと「鈴木課長 ≠ 鈴木課長」になり破綻する。
    expect(screen.getAllByText('山田太郎').length).toBeGreaterThan(0)
    expect(screen.getByText(/最終承認できます/)).toBeInTheDocument()
  })
})

describe('P0-W3 sendback: 案件差戻し → 理由を read-only で再表示', () => {
  beforeEach(() => clearPersisted())

  it('ready 案件を理由付きで差戻し → 差戻し理由が再表示される', async () => {
    const user = userEvent.setup()
    renderAt('/cases/CASE-2026-0142') // ready

    await user.click(screen.getByRole('button', { name: '差戻し' }))
    await user.type(screen.getByLabelText('コメント (必須)'), 'ビル名を申請書類で再確認してください')
    await user.click(screen.getByRole('button', { name: '差戻しを送信' }))

    expect(screen.getByText(/この案件は差戻し済みです/)).toBeInTheDocument()
    expect(screen.getByText(/ビル名を申請書類で再確認してください/)).toBeInTheDocument()
  })
})

describe('P0-W3 reset: データ初期化が confirm Modal 経由 (即時 reset しない)', () => {
  beforeEach(() => clearPersisted())

  it('「表示データを初期化」で confirm Modal が出る (直結 reset でない)', async () => {
    const user = userEvent.setup()
    renderAt('/observatory')
    await user.click(screen.getByRole('button', { name: /表示データを初期化/ }))
    // confirm Modal: 「初期化する」ボタン + 不可逆の注意文
    expect(screen.getByRole('button', { name: '初期化する' })).toBeInTheDocument()
    expect(screen.getByText(/元に戻せません/)).toBeInTheDocument()
  })
})

describe('P0-W3 flywheel: ナレッジ「改善の流れ」に承認段階の提案が出る', () => {
  beforeEach(() => clearPersisted())

  it('useFlywheelLineage は forwarded/approved 提案を adopted 区別で派生 (seed)', () => {
    const { result } = renderHook(() => useFlywheelLineage(), { wrapper: StoreProvider })
    // seed: PROP-2026-024=approved (adopted) / PROP-2026-028=forwarded (未 adopted) / PROP-2026-031=pending-triage (除外)
    const ids = result.current.map((l) => l.proposalId)
    expect(ids).toContain('PROP-2026-024')
    expect(ids).toContain('PROP-2026-028')
    expect(ids).not.toContain('PROP-2026-031')
    expect(result.current.find((l) => l.proposalId === 'PROP-2026-024')!.adopted).toBe(true)
    expect(result.current.find((l) => l.proposalId === 'PROP-2026-028')!.adopted).toBe(false)
  })

  it('Observatory ナレッジ → 改善の流れ view に承認済 提案 + staging 段が出る', async () => {
    const user = userEvent.setup()
    renderAt('/observatory')
    await user.click(screen.getByRole('button', { name: 'ナレッジ' }))
    await user.click(screen.getByRole('button', { name: '改善の流れ' }))
    // 承認済 (adopted) 提案 PROP-024 の改定内容 + 承認済 chip + staging 段ラベル
    expect(screen.getByText('本人確認書類の有効期限チェックを追加')).toBeInTheDocument()
    expect(screen.getAllByText('承認済').length).toBeGreaterThan(0)
    expect(screen.getAllByText('改善ヒント（未承認）').length).toBeGreaterThan(0)
  })
})

describe('P0-W3 flywheel: AgentDetail 緊急停止 → 一覧反映', () => {
  beforeEach(() => clearPersisted())

  it('緊急停止は理由必須、停止すると header に緊急停止中が出る', async () => {
    const user = userEvent.setup()
    renderAt('/agents/agent-account-opening')

    await user.click(screen.getByRole('button', { name: '緊急停止' }))
    // 理由未入力では停止不可
    await user.click(screen.getByRole('button', { name: '緊急停止する' }))
    expect(screen.getByText('入力してください')).toBeInTheDocument()
    // 理由を入れて停止 → 緊急停止中 が出る + 昇格申請ボタンが disabled (P0 evidence)
    await user.type(screen.getByLabelText('停止理由（必須）'), '誤入力が急増したため')
    await user.click(screen.getByRole('button', { name: '緊急停止する' }))
    expect(screen.getAllByText('緊急停止中').length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: '設定変更を申請' })).toBeDisabled()
  })

  it('緊急停止後、一覧 (/agents) の該当行に緊急停止中が反映される (P0 evidence)', async () => {
    const user = userEvent.setup()
    renderAt('/agents/agent-account-opening')

    // P1-1: account-opening は UC-BO-02。Process-First filter (既定 UC-BO-01) で一覧に出すため業務を全業務に切替。
    await user.click(screen.getByRole('button', { name: '法人住所変更' }))
    await user.click(screen.getByRole('option', { name: '全業務' }))

    await user.click(screen.getByRole('button', { name: '緊急停止' }))
    await user.type(screen.getByLabelText('停止理由（必須）'), '誤入力が急増したため')
    await user.click(screen.getByRole('button', { name: '緊急停止する' }))

    // breadcrumb (page header 内) から一覧へ戻る。sidebar / mobile-nav の同名 'Agent 設定' link と
    // 衝突するため data-page-header 内に scope して breadcrumb を一意に取る。
    const toList = screen
      .getAllByRole('link', { name: 'Agent 設定' })
      .find((el) => el.closest('[data-page-header]'))!
    await user.click(toList)

    // 一覧へ遷移し、該当 Agent 行に緊急停止中 chip が store-truth で join されている (Agents.tsx)。
    expect(screen.getByRole('heading', { name: 'Agent 設定 — エージェント一覧' })).toBeInTheDocument()
    expect(screen.getAllByText('緊急停止中').length).toBeGreaterThan(0)
  })
})
