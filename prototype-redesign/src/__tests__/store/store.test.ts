import { seed } from '@/store/seed'
import { storeReducer } from '@/store/reducer'
import { savePersisted, loadPersisted, clearPersisted } from '@/store/persist'
import { CASE_LIST } from '@/data/mock-case-list'

// Phase 1 — 状態基盤の foundation 検証 (seed / reducer 遷移 / persist round-trip)。
describe('store foundation (Phase 1)', () => {
  describe('seed', () => {
    it('list mock から entity を正規化し workflowId を解決する', () => {
      const s = seed()
      expect(s.caseOrder).toHaveLength(CASE_LIST.length)
      expect(s.proposalOrder).toHaveLength(3)
      expect(s.agentOrder).toHaveLength(2)
      expect(s.cases['CASE-2026-0142'].workflowId).toBe('UC-BO-01')
      expect(s.proposals['PROP-2026-024'].workflowId).toBe('UC-BO-02')
      // owner '—' は未割当 (undefined) に正規化
      expect(s.cases['CASE-2026-0150'].assignee).toBeUndefined()
      expect(s.cases['CASE-2026-0142'].assignee).toBe('山田太郎')
    })
    it('resolvedFieldIds を空配列で初期化 (Phase 4b overlay 前提)', () => {
      expect(seed().cases['CASE-2026-0142'].resolvedFieldIds).toEqual([])
    })
  })

  describe('reducer: 案件', () => {
    // CASE-2026-0139 = ready かつ flags 0 (承認可能)、CASE-2026-0142 = ready かつ flags 1 (要確認、承認不可)
    it('入力者承認: ready かつ flags0 → business-approval-waiting', () => {
      const s = storeReducer(seed(), { type: 'case/approve', id: 'CASE-2026-0139', by: 'input' })
      expect(s.cases['CASE-2026-0139'].status).toBe('business-approval-waiting')
    })
    it('要確認 (flags>0) の入力者承認は無変更 (R0 gate: 要確認残は承認不可)', () => {
      const s = storeReducer(seed(), { type: 'case/approve', id: 'CASE-2026-0142', by: 'input' })
      expect(s.cases['CASE-2026-0142'].status).toBe('ready')
    })
    it('承認者承認: business-approval-waiting → reflected', () => {
      const s = storeReducer(seed(), { type: 'case/approve', id: 'CASE-2026-0128', by: 'checker' })
      expect(s.cases['CASE-2026-0128'].status).toBe('reflected')
    })
    it('precondition 不一致の承認は無変更 (pending に入力者承認)', () => {
      const base = seed()
      const s = storeReducer(base, { type: 'case/approve', id: 'CASE-2026-0150', by: 'input' })
      expect(s.cases['CASE-2026-0150'].status).toBe('pending')
    })
    it('差戻し: 任意 → sent-back / 担当割当', () => {
      let s = storeReducer(seed(), { type: 'case/sendback', id: 'CASE-2026-0142' })
      expect(s.cases['CASE-2026-0142'].status).toBe('sent-back')
      s = storeReducer(s, { type: 'case/assign', id: 'CASE-2026-0150', assignee: '佐藤花子' })
      expect(s.cases['CASE-2026-0150'].assignee).toBe('佐藤花子')
    })
    it('一括承認: flags0 のみ遷移、flagged 案件 (flags>0) は skip', () => {
      const s = storeReducer(seed(), {
        type: 'case/bulkApprove',
        ids: ['CASE-2026-0142', 'CASE-2026-0139'], // 0142=flags1 (skip) / 0139=flags0 (遷移)
        by: 'input',
      })
      expect(s.cases['CASE-2026-0142'].status).toBe('ready') // 要確認残 → 一括承認されない
      expect(s.cases['CASE-2026-0139'].status).toBe('business-approval-waiting')
    })
    it('case/override: resolvedFieldIds 追加 + flags 減算 (冪等)', () => {
      // CASE-2026-0142 = flags1。override で flags0、再 override は無変更
      let s = storeReducer(seed(), { type: 'case/override', id: 'CASE-2026-0142', fieldLabel: 'ビル名' })
      expect(s.cases['CASE-2026-0142'].resolvedFieldIds).toEqual(['ビル名'])
      expect(s.cases['CASE-2026-0142'].flags).toBe(0)
      s = storeReducer(s, { type: 'case/override', id: 'CASE-2026-0142', fieldLabel: 'ビル名' })
      expect(s.cases['CASE-2026-0142'].flags).toBe(0)
      expect(s.cases['CASE-2026-0142'].resolvedFieldIds).toHaveLength(1)
    })
    it('case/override で要確認解消 → 入力者承認が通る (D1 フロー)', () => {
      let s = storeReducer(seed(), { type: 'case/override', id: 'CASE-2026-0142', fieldLabel: 'ビル名' })
      s = storeReducer(s, { type: 'case/approve', id: 'CASE-2026-0142', by: 'input' })
      expect(s.cases['CASE-2026-0142'].status).toBe('business-approval-waiting')
    })
  })

  describe('reducer: 提案 / Agent', () => {
    it('提案: pending-triage → forwarded → approved / reject', () => {
      let s = storeReducer(seed(), { type: 'proposal/forward', id: 'PROP-2026-031' })
      expect(s.proposals['PROP-2026-031'].status).toBe('forwarded')
      s = storeReducer(s, { type: 'proposal/approve', id: 'PROP-2026-031' })
      expect(s.proposals['PROP-2026-031'].status).toBe('approved')
      s = storeReducer(s, { type: 'proposal/reject', id: 'PROP-2026-028' })
      expect(s.proposals['PROP-2026-028'].status).toBe('rejected')
    })
    it('Agent: 昇格申請 / 緊急停止 toggle', () => {
      let s = storeReducer(seed(), { type: 'agent/requestPromotion', id: 'agent-corporate-address-change' })
      expect(s.agents['agent-corporate-address-change'].promotionRequested).toBe(true)
      s = storeReducer(s, { type: 'agent/togglePause', id: 'agent-corporate-address-change' })
      expect(s.agents['agent-corporate-address-change'].paused).toBe(true)
    })
  })

  describe('immutability / reset', () => {
    it('reducer は元 state を破壊しない', () => {
      const base = seed()
      storeReducer(base, { type: 'case/sendback', id: 'CASE-2026-0142' })
      expect(base.cases['CASE-2026-0142'].status).toBe('ready')
    })
    it('store/reset は seed に戻す', () => {
      const mutated = storeReducer(seed(), { type: 'case/sendback', id: 'CASE-2026-0142' })
      const reset = storeReducer(mutated, { type: 'store/reset' })
      expect(reset.cases['CASE-2026-0142'].status).toBe('ready')
    })
  })

  describe('persist: reload restore', () => {
    beforeEach(() => clearPersisted())

    it('save → load で操作結果が復元される', () => {
      // CASE-2026-0139 = flags0 (承認可能)。flagged 案件では遷移しないため round-trip にならない
      const mutated = storeReducer(seed(), { type: 'case/approve', id: 'CASE-2026-0139', by: 'input' })
      savePersisted(mutated)
      const restored = loadPersisted(seed())
      expect(restored.cases['CASE-2026-0139'].status).toBe('business-approval-waiting')
    })

    it('未保存時は fallback (seed) を返す', () => {
      expect(loadPersisted(seed()).caseOrder).toHaveLength(CASE_LIST.length)
    })

    it('schema version 不一致は fallback (旧 v1 localStorage → seed、R2)', () => {
      localStorage.setItem('bo-ai-v2:store', JSON.stringify({ v: 1, state: { caseOrder: [] } }))
      const restored = loadPersisted(seed())
      expect(restored.caseOrder).toHaveLength(CASE_LIST.length) // 旧 v1 は v2 と不一致 → seed fallback
    })

    it('同一 version でも形が壊れた state は fallback (shape guard: dict 欠落)', () => {
      // v は一致するが cases/proposals/agents 等を欠く → selector 白画面化を防ぐため seed に戻す
      localStorage.setItem('bo-ai-v2:store', JSON.stringify({ v: 2, state: { caseOrder: [] } }))
      const restored = loadPersisted(seed())
      expect(restored.caseOrder).toHaveLength(CASE_LIST.length)
      expect(restored.cases['CASE-2026-0142']).toBeDefined()
    })

    it('v2 だが case に resolvedFieldIds 欠落 → fallback (shape guard 深掘り、R2)', () => {
      localStorage.setItem(
        'bo-ai-v2:store',
        JSON.stringify({
          v: 2,
          state: {
            cases: { 'CASE-X': { id: 'CASE-X', status: 'ready', flags: 0 } }, // resolvedFieldIds 欠落
            caseOrder: ['CASE-X'],
            proposals: {},
            proposalOrder: [],
            agents: {},
            agentOrder: [],
          },
        }),
      )
      const restored = loadPersisted(seed())
      expect(restored.cases['CASE-2026-0142']).toBeDefined() // seed fallback
      expect(restored.cases['CASE-X']).toBeUndefined()
    })
  })
})
