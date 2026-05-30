import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { StoreProvider } from '@/store/StoreProvider'
import { ViewProvider } from '@/context/ViewProvider'
import App from '@/App'
import { CASE_LIST, VERIFICATION_EXTRA_CASES } from '@/data/mock-case-list'
import { PROPOSAL_LIST } from '@/data/mock-proposal-list'
import { AGENT_LIST } from '@/data/mock-agent-list'
import { CASE_DETAILS } from '@/data/mock-case-detail'
import { PROPOSAL_DETAILS } from '@/data/mock-proposal-detail'
import { AGENT_DETAILS } from '@/data/mock-agent-detail'
import { caseStatusLabel, caseResultTone } from '@/lib/status-tones'

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

describe('Phase 4b: evidence link coverage (根拠/裏付けリンクが NotFound に落ちない、CR P1)', () => {
  it('全 proposal sourceCases の case link が CASE_DETAILS に存在', () => {
    for (const p of Object.values(PROPOSAL_DETAILS)) {
      for (const sc of p.sourceCases) expect(CASE_DETAILS[sc.id]).toBeDefined()
    }
  })
  it('全 agent samples の case link が CASE_DETAILS に存在', () => {
    for (const a of Object.values(AGENT_DETAILS)) {
      for (const s of a.samples) expect(CASE_DETAILS[s.id]).toBeDefined()
    }
  })
  it('historical 根拠案件 (store 非存在) は参照専用 = 承認・差戻し disabled', () => {
    renderAt('/cases/CASE-2026-0098') // PROP-2026-031 の sourceCase、CASE_LIST 外
    expect(screen.getByRole('button', { name: '承認' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '差戻し' })).toBeDisabled()
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

describe('P0-W2 B2: 証拠アンカー内容整合 (「別明細なのに同じデータ」の解消)', () => {
  it('全 proposal sourceCases の link 先 detail が proposal と同 workflow', () => {
    // 口座開設提案 (PROP-024) の sourceCase 0112/0104/0101 を開くと口座開設 detail が出る (法人住所変更 detail ではない)。
    for (const p of Object.values(PROPOSAL_DETAILS)) {
      for (const sc of p.sourceCases) {
        expect(CASE_DETAILS[sc.id]).toBeDefined()
        expect(CASE_DETAILS[sc.id]!.workflowName).toBe(p.workflow)
      }
    }
  })

  it('全 agent samples の link 先 detail が agent と同 workflow', () => {
    for (const a of Object.values(AGENT_DETAILS)) {
      for (const s of a.samples) {
        expect(CASE_DETAILS[s.id]).toBeDefined()
        expect(CASE_DETAILS[s.id]!.workflowName).toBe(a.workflow)
      }
    }
  })

  it('proposal ↔ agent 双方向 link が対称 (agentId ↔ relatedProposals)', () => {
    for (const p of Object.values(PROPOSAL_DETAILS)) {
      const agent = AGENT_DETAILS[p.agentId]!
      expect(agent).toBeDefined()
      expect(agent.relatedProposals).toContain(p.id)
    }
    for (const a of Object.values(AGENT_DETAILS)) {
      for (const pid of a.relatedProposals) {
        expect(PROPOSAL_DETAILS[pid]).toBeDefined()
        expect(PROPOSAL_DETAILS[pid]!.agentId).toBe(a.id)
      }
    }
  })

  it('agent sample.tone は caseResultTone(status, flags) で導出される (手書き個別 tone の禁止)', () => {
    const byId = Object.fromEntries(CASE_LIST.map((r) => [r.id, r]))
    for (const a of Object.values(AGENT_DETAILS)) {
      for (const s of a.samples) {
        const row = byId[s.id]!
        expect(row).toBeDefined()
        expect(s.tone).toBe(caseResultTone(row.status, row.flags))
      }
    }
  })

  it('口座開設 case (0112/0104/0101) は口座開設業務として実体化 (HISTORICAL 二重登録なし)', () => {
    for (const id of ['CASE-2026-0112', 'CASE-2026-0104', 'CASE-2026-0101']) {
      expect(CASE_LIST.some((r) => r.id === id)).toBe(true)
      expect(CASE_DETAILS[id]!.workflowName).toBe('口座開設書類完備')
    }
  })

  it('口座開設 case の detail は口座開設書類 (法人住所変更届を表示しない)', () => {
    renderAt('/cases/CASE-2026-0112')
    // detail header は口座開設業務 (breadcrumb + h1)
    expect(screen.getAllByText('口座開設書類完備').length).toBeGreaterThan(0)
    // 申請書類ビューアは口座開設申込書 = 法人住所変更届データではない (B2 別明細整合)。
    // 注: TopBar ProcessSelector は既定業務名 '法人住所変更' を表示するため、detail 固有の文書名で判定する。
    expect(screen.getByText('口座開設申込書')).toBeInTheDocument()
    expect(screen.queryByText('法人住所変更届')).toBeNull()
  })
})

describe('P0-W2 2b: status-badge resolver (tone="primary" 固定の廃止)', () => {
  it('reflected 案件の header status badge は success tone (resolver 由来)', () => {
    renderAt('/cases/CASE-2026-0112') // 口座開設 reflected
    const badges = screen.getAllByText('反映済')
    expect(badges.some((b) => b.className.includes('success'))).toBe(true)
  })
})

describe('P0-W2 B3 (gate 3=案A): 検証 fixture は業務 case と分離', () => {
  it('VERIFICATION_EXTRA_CASES は CASE-VRF- 別 id 空間で CASE_LIST に含まれない', () => {
    const caseIds = new Set(CASE_LIST.map((r) => r.id))
    expect(VERIFICATION_EXTRA_CASES).toHaveLength(20)
    for (const v of VERIFICATION_EXTRA_CASES) {
      expect(v.id.startsWith('CASE-VRF-')).toBe(true)
      expect(caseIds.has(v.id)).toBe(false) // 業務母数 (Hub/KPI) に検証 noise を混ぜない
    }
  })
  it('業務 CASE_LIST は法人住所変更 8 + 口座開設 5 = 13 件', () => {
    expect(CASE_LIST).toHaveLength(13)
    expect(CASE_LIST.filter((r) => r.workflow === '口座開設書類完備')).toHaveLength(5)
  })
})

describe('Phase 4a gate: factory ↔ list row 整合 (gate 3、canonical 0142 除く)', () => {
  it.each(CASE_LIST.filter((r) => r.id !== 'CASE-2026-0142'))('$id', (row) => {
    const d = CASE_DETAILS[row.id]!
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
        expect(review[0]!.fieldLabel).toBe(row.change.field)
      }
    }
  })
})
