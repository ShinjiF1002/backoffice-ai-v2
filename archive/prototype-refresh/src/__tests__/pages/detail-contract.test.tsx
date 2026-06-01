import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { StoreProvider } from '@/store/StoreProvider'
import { CaseDetail } from '@/pages/CaseDetail'
import { ProposalDetail } from '@/pages/ProposalDetail'
import { AgentDetail } from '@/pages/AgentDetail'
import { clearPersisted } from '@/store/persist'
import { CASE_DETAILS } from '@/data/mock-case-detail'

// F-056 — canonical-design-spec §6「C 型 detail contract」を runtime で担保する contract test。
// 旧 spec は「dev assert で強制」と記したが runtime dev assert は未実装だった (SSOT over-claim)。
// 本 test が C (単一決定面 = sticky footer 1) と A (全体レビュー可能性 = 対象集合の全件表示) を実 render で検証し、
// spec の「型 + test で担保」主張を真にする。
function renderDetail(node: ReactNode, path: string, route: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <StoreProvider>
        <Routes>
          <Route path={route} element={node} />
        </Routes>
      </StoreProvider>
    </MemoryRouter>,
  )
}

describe('F-056 C 型 detail contract (単一決定面)', () => {
  beforeEach(() => clearPersisted())

  it('CaseDetail は sticky footer を 1 つだけ持つ (C 単一決定面)', () => {
    const { container } = renderDetail(<CaseDetail />, '/cases/CASE-2026-0142', '/cases/:id')
    expect(container.querySelectorAll('footer')).toHaveLength(1)
  })

  it('ProposalDetail は sticky footer を 1 つだけ持つ', () => {
    const { container } = renderDetail(<ProposalDetail />, '/proposals/PROP-2026-031', '/proposals/:id')
    expect(container.querySelectorAll('footer')).toHaveLength(1)
  })

  it('AgentDetail は (mode 分岐後も) sticky footer を 1 つだけ持つ', () => {
    const { container } = renderDetail(<AgentDetail />, '/agents/agent-corporate-address-change', '/agents/:id')
    expect(container.querySelectorAll('footer')).toHaveLength(1)
  })

  it('CaseDetail は A 全体レビュー可能性: 対象案件の全項目を default 表示 (折りたたまない)', () => {
    renderDetail(<CaseDetail />, '/cases/CASE-2026-0142', '/cases/:id')
    // CASE-2026-0142 の全 field ラベルが既定で可視 (resolved/一致 を折りたたみ default にしない)。
    const expected = CASE_DETAILS['CASE-2026-0142']!.fields.map((f) => f.fieldLabel)
    for (const label of expected) {
      expect(screen.getAllByText(label).length).toBeGreaterThan(0)
    }
  })
})
