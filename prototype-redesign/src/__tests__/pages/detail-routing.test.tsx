import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { StoreProvider } from '@/store/StoreProvider'
import { ViewProvider } from '@/context/ViewProvider'
import App from '@/App'
import { CASE_LIST } from '@/data/mock-case-list'
import { PROPOSAL_LIST } from '@/data/mock-proposal-list'
import { AGENT_LIST } from '@/data/mock-agent-list'
import { CASE_DETAILS } from '@/data/mock-case-detail'
import { PROPOSAL_DETAILS } from '@/data/mock-proposal-detail'
import { AGENT_DETAILS } from '@/data/mock-agent-detail'
import { caseStatusLabel } from '@/lib/status-tones'

// Phase 4a — detail が :id に連動 (X-10 解消) / 未知 id は not-found / factory が list と整合。
// routes.test と同じ構造 (Router > Store > View > App) で実 route を踏む jsdom smoke。
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

describe('Phase 4a: detail が :id に連動 (X-10 解消)', () => {
  it('別の case 行は別の detail を開く (固定 0142 でない)', () => {
    renderAt('/cases/CASE-2026-0145')
    expect(screen.getAllByText('CASE-2026-0145').length).toBeGreaterThan(0)
    expect(screen.queryByText('CASE-2026-0142')).toBeNull()
  })

  it('別の proposal 行は別の detail を開く', () => {
    renderAt('/proposals/PROP-2026-028')
    expect(screen.getByText('法人名の表記ゆれ補正ルールを追加')).toBeInTheDocument()
    // 031 の changeTitle は出ない
    expect(screen.queryByText('住所読み取りの判定基準を厳しめに調整')).toBeNull()
  })

  it('別の agent 行は別の detail を開く', () => {
    renderAt('/agents/agent-account-opening')
    // breadcrumb + h1 の 2 箇所に出るため getAllByText
    expect(screen.getAllByText('口座開設書類完備 Agent').length).toBeGreaterThan(0)
    expect(screen.queryByText('法人住所変更 Agent')).toBeNull()
  })
})

describe('Phase 4a: 未知 id は not-found (gate 2)', () => {
  it('case 未知 id', () => {
    renderAt('/cases/CASE-9999-0000')
    expect(screen.getByText('指定の案件が見つかりません。')).toBeInTheDocument()
  })
  it('proposal 未知 id', () => {
    renderAt('/proposals/PROP-9999-999')
    expect(screen.getByText('指定の提案が見つかりません。')).toBeInTheDocument()
  })
  it('agent 未知 id', () => {
    renderAt('/agents/unknown-agent')
    expect(screen.getByText('指定のエージェントが見つかりません。')).toBeInTheDocument()
  })
})

describe('Phase 4a: 要確認ゼロ / change なし の detail も落ちない (activeFieldLabel 空ケース)', () => {
  // CASE-2026-0150 = pending / flags 0 / change なし、CASE-2026-0120 = reflected / flags 0
  it('pending (未処理) detail が render する', () => {
    renderAt('/cases/CASE-2026-0150')
    expect(screen.getAllByText('CASE-2026-0150').length).toBeGreaterThan(0)
  })
  it('reflected (反映済) detail が render する', () => {
    renderAt('/cases/CASE-2026-0120')
    expect(screen.getAllByText('CASE-2026-0120').length).toBeGreaterThan(0)
  })
})

describe('Phase 4b: 承認ボタンが reducer precondition と整合 (false success 防止、CR P1)', () => {
  it('pending 案件 (入力者ビュー) は承認 disabled', () => {
    renderAt('/cases/CASE-2026-0150')
    expect(screen.getByRole('button', { name: '承認' })).toBeDisabled()
  })
  it('ready かつ要確認0 の案件 (入力者ビュー) は承認可能', () => {
    renderAt('/cases/CASE-2026-0139')
    expect(screen.getByRole('button', { name: '承認' })).toBeEnabled()
  })
  it('承認待ち案件を入力者ビューで開くと承認 disabled (input は ready のみ前進)', () => {
    renderAt('/cases/CASE-2026-0128')
    expect(screen.getByRole('button', { name: '承認' })).toBeDisabled()
  })
})

describe('Phase 4a gate: dict coverage (gate 1 — 全 list id が detail を持つ)', () => {
  it('CASE_LIST 全 id が CASE_DETAILS に存在', () => {
    for (const row of CASE_LIST) expect(CASE_DETAILS[row.id]).toBeDefined()
  })
  it('PROPOSAL_LIST 全 id が PROPOSAL_DETAILS に存在', () => {
    for (const row of PROPOSAL_LIST) expect(PROPOSAL_DETAILS[row.id]).toBeDefined()
  })
  it('AGENT_LIST 全 id が AGENT_DETAILS に存在', () => {
    for (const row of AGENT_LIST) expect(AGENT_DETAILS[row.id]).toBeDefined()
  })
})

describe('Phase 4a gate: factory ↔ list row 整合 (gate 3、canonical 0142 除く)', () => {
  it.each(CASE_LIST.filter((r) => r.id !== 'CASE-2026-0142'))('$id', (row) => {
    const d = CASE_DETAILS[row.id]
    expect(d.id).toBe(row.id)
    expect(d.statusLabel).toBe(caseStatusLabel(row.status))
    expect(d.inputter).toBe(row.owner === '—' ? '未割当' : row.owner)
    expect(d.fields.length).toBeGreaterThan(0)

    // lifecycle current 整合 (reflected は current なし・全 done、他は current 1 件)
    const currents = d.lifecycle.filter((s) => s.current)
    if (row.status === 'reflected') {
      expect(currents).toHaveLength(0)
      expect(d.lifecycle.every((s) => s.done)).toBe(true)
    } else {
      expect(currents).toHaveLength(1)
    }

    // flags 由来の要確認数 (ready のみ needs_review を flags 件、change.field を先頭割当)
    const review = d.fields.filter((f) => f.reconcileState === 'needs_review')
    if (row.status === 'ready') {
      expect(review).toHaveLength(row.flags)
      if (row.flags > 0 && row.change) {
        expect(review[0].fieldLabel).toBe(row.change.field)
      }
    }
  })
})
