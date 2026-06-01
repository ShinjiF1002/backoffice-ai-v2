import { describe, it, expect } from 'vitest'
import { CASE_DETAILS } from '@/data/mock-case-detail'
import { PROPOSAL_DETAILS } from '@/data/mock-proposal-detail'

// F-021: flywheel lineage 起点 (提案 sourceCases = 誤確定→是正の実例) と drill-in 先の案件記録が整合する。
// 各 sourceCase は CASE_DETAILS に実在し (link が NotFound にならない)、履歴注記で「是正・再反映の実例」であることが明示される。

describe('F-021 lineage coherence (proposal sourceCases ↔ case detail)', () => {
  it('PROP-2026-031 の全 sourceCase が CASE_DETAILS に実在し履歴注記を持つ', () => {
    const sourceIds = PROPOSAL_DETAILS['PROP-2026-031']?.sourceCases.map((s) => s.id) ?? []
    expect(sourceIds.length).toBeGreaterThan(0)
    for (const id of sourceIds) {
      const detail = CASE_DETAILS[id]
      expect(detail, `sourceCase ${id} は CASE_DETAILS に実在すべき`).toBeDefined()
      // lineage の「誤確定→是正・再反映」claim と drill-in が整合
      expect(detail?.historyNote).toMatch(/是正・再反映/)
      expect(detail?.status).toBe('reflected')
    }
  })

  it('F-021: 起点案件の確定値が提案 sourceCase の根拠コメント (正しい値) と矛盾しない', () => {
    // 0098: comment「『サンプルビルディング』が正しい」⇔ ビル名 確定値 = サンプルビルディング (旧 hardcode 'サンプルビル' との矛盾解消)。
    const billing = CASE_DETAILS['CASE-2026-0098']?.fields.find((f) => f.fieldLabel === 'ビル名')
    expect(billing?.aiValue).toBe('サンプルビルディング')
    expect(billing?.previousValue).toBe('サンプルビル') // before/after で誤確定→是正が見える
    const comment = PROPOSAL_DETAILS['PROP-2026-031']?.sourceCases.find((s) => s.id === 'CASE-2026-0098')?.comment ?? ''
    expect(comment).toContain('サンプルビルディング')
  })

  it('F-022: 提案 metric は % 表記で raw decimal (0.xx) / 生 confidence を出さない', () => {
    for (const id of Object.keys(PROPOSAL_DETAILS)) {
      for (const c of PROPOSAL_DETAILS[id]?.criteria ?? []) {
        expect(c.actualValue, `${id} ${c.metricLabel} actualValue`).not.toMatch(/^0\.\d/)
        expect(c.threshold, `${id} ${c.metricLabel} threshold`).not.toMatch(/0\.\d/)
      }
    }
  })
})
