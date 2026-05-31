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
      expect(s.cases['CASE-2026-0142']!.workflowId).toBe('UC-BO-01')
      expect(s.proposals['PROP-2026-024']!.workflowId).toBe('UC-BO-02')
      // owner '—' は未割当 (undefined) に正規化
      expect(s.cases['CASE-2026-0150']!.assignee).toBeUndefined()
      expect(s.cases['CASE-2026-0142']!.assignee).toBe('山田太郎')
    })
    it('resolvedFieldIds を空配列で初期化 (Phase 4b overlay 前提)', () => {
      expect(seed().cases['CASE-2026-0142']!.resolvedFieldIds).toEqual([])
    })
  })

  describe('reducer: 案件', () => {
    // CASE-2026-0139 = ready かつ flags 0 (承認可能)、CASE-2026-0142 = ready かつ flags 1 (要確認、承認不可)
    it('入力者承認: ready かつ flags0 → business-approval-waiting', () => {
      const s = storeReducer(seed(), { type: 'case/approve', id: 'CASE-2026-0139', by: 'input' })
      expect(s.cases['CASE-2026-0139']!.status).toBe('business-approval-waiting')
    })
    it('要確認 (flags>0) の入力者承認は無変更 (R0 gate: 要確認残は承認不可)', () => {
      const s = storeReducer(seed(), { type: 'case/approve', id: 'CASE-2026-0142', by: 'input' })
      expect(s.cases['CASE-2026-0142']!.status).toBe('ready')
    })
    it('承認者承認: business-approval-waiting → reflected (承認者 persona に切替えて)', () => {
      // seeded baw 案件は inputApprovedBy=入力者 (backfill)。SoD のため承認者 persona に切替えてから承認。
      let s = storeReducer(seed(), { type: 'session/switchActor', actorId: 'actor-checker' })
      s = storeReducer(s, { type: 'case/approve', id: 'CASE-2026-0128', by: 'checker' })
      expect(s.cases['CASE-2026-0128']!.status).toBe('reflected')
    })
    it('precondition 不一致の承認は無変更 (pending に入力者承認)', () => {
      const base = seed()
      const s = storeReducer(base, { type: 'case/approve', id: 'CASE-2026-0150', by: 'input' })
      expect(s.cases['CASE-2026-0150']!.status).toBe('pending')
    })
    it('差戻し: 任意 → sent-back / 担当割当', () => {
      let s = storeReducer(seed(), { type: 'case/sendback', id: 'CASE-2026-0142', reason: 'ビル名不一致', category: 'edge_case' })
      expect(s.cases['CASE-2026-0142']!.status).toBe('sent-back')
      s = storeReducer(s, { type: 'case/assign', id: 'CASE-2026-0150', assignee: '佐藤花子' })
      expect(s.cases['CASE-2026-0150']!.assignee).toBe('佐藤花子')
    })
    it('一括承認: flags0 のみ遷移、flagged 案件 (flags>0) は skip', () => {
      const s = storeReducer(seed(), {
        type: 'case/bulkApprove',
        ids: ['CASE-2026-0142', 'CASE-2026-0139'], // 0142=flags1 (skip) / 0139=flags0 (遷移)
        by: 'input',
      })
      expect(s.cases['CASE-2026-0142']!.status).toBe('ready') // 要確認残 → 一括承認されない
      expect(s.cases['CASE-2026-0139']!.status).toBe('business-approval-waiting')
    })
    it('case/override: resolvedFieldIds 追加 + flags 減算 (冪等)', () => {
      // CASE-2026-0142 = flags1。override で flags0、再 override は無変更
      let s = storeReducer(seed(), { type: 'case/override', id: 'CASE-2026-0142', fieldLabel: 'ビル名', value: 'サンプルビルディング' })
      expect(s.cases['CASE-2026-0142']!.resolvedFieldIds).toEqual(['ビル名'])
      expect(s.cases['CASE-2026-0142']!.flags).toBe(0)
      s = storeReducer(s, { type: 'case/override', id: 'CASE-2026-0142', fieldLabel: 'ビル名', value: 'サンプルビルディング' })
      expect(s.cases['CASE-2026-0142']!.flags).toBe(0)
      expect(s.cases['CASE-2026-0142']!.resolvedFieldIds).toHaveLength(1)
    })
    it('case/override で要確認解消 → 入力者承認が通る (D1 フロー)', () => {
      let s = storeReducer(seed(), { type: 'case/override', id: 'CASE-2026-0142', fieldLabel: 'ビル名', value: 'サンプルビルディング' })
      s = storeReducer(s, { type: 'case/approve', id: 'CASE-2026-0142', by: 'input' })
      expect(s.cases['CASE-2026-0142']!.status).toBe('business-approval-waiting')
    })
  })

  describe('reducer: 提案 / Agent', () => {
    it('提案: pending-triage → forwarded → approved / reject', () => {
      let s = storeReducer(seed(), { type: 'proposal/forward', id: 'PROP-2026-031' })
      expect(s.proposals['PROP-2026-031']!.status).toBe('forwarded')
      s = storeReducer(s, { type: 'proposal/approve', id: 'PROP-2026-031' })
      expect(s.proposals['PROP-2026-031']!.status).toBe('approved')
      s = storeReducer(s, { type: 'proposal/reject', id: 'PROP-2026-028', reason: '影響範囲が大きい' })
      expect(s.proposals['PROP-2026-028']!.status).toBe('rejected')
    })
    it('Agent: 昇格申請 / 緊急停止 (emergencyStop) → 再開 (resume)', () => {
      let s = storeReducer(seed(), { type: 'agent/requestPromotion', id: 'agent-corporate-address-change' })
      expect(s.agents['agent-corporate-address-change']!.promotionStatus).toBe('requested')
      // kill-switch: 緊急停止で paused + 理由保持、再開で解除 (remediation flywheel、togglePause 分割)
      s = storeReducer(s, { type: 'agent/emergencyStop', id: 'agent-corporate-address-change', reason: '誤入力が急増' })
      expect(s.agents['agent-corporate-address-change']!.paused).toBe(true)
      expect(s.agents['agent-corporate-address-change']!.pausedReason).toBe('誤入力が急増')
      s = storeReducer(s, { type: 'agent/resume', id: 'agent-corporate-address-change' })
      expect(s.agents['agent-corporate-address-change']!.paused).toBe(false)
      expect(s.agents['agent-corporate-address-change']!.pausedReason).toBeUndefined()
    })
  })

  describe('remediation P0-W1 (B1 / B4 SoD / sendback-guard)', () => {
    it('seed: overrides 空 + currentActorId 初期化 (B1/B4)', () => {
      const s = seed()
      expect(s.cases['CASE-2026-0142']!.overrides).toEqual({})
      expect(s.currentActorId).toBe('actor-inputter')
    })

    it('case/override: 訂正値を overrides に保存 (B1)', () => {
      const s = storeReducer(seed(), {
        type: 'case/override',
        id: 'CASE-2026-0142',
        fieldLabel: 'ビル名',
        value: 'サンプルビルディング',
      })
      expect(s.cases['CASE-2026-0142']!.overrides['ビル名']).toBe('サンプルビルディング')
      expect(s.cases['CASE-2026-0142']!.resolvedFieldIds).toEqual(['ビル名'])
      expect(s.cases['CASE-2026-0142']!.flags).toBe(0)
    })

    it('SoD: 同一 actor の入力者→承認者承認は無効、persona 切替後は承認可 (B4 四眼原則)', () => {
      let s = storeReducer(seed(), { type: 'case/approve', id: 'CASE-2026-0139', by: 'input' })
      expect(s.cases['CASE-2026-0139']!.status).toBe('business-approval-waiting')
      expect(s.cases['CASE-2026-0139']!.inputApprovedBy).toBe('actor-inputter')
      // 同一 actor (入力者のまま) の承認者承認 → no-op
      const same = storeReducer(s, { type: 'case/approve', id: 'CASE-2026-0139', by: 'checker' })
      expect(same.cases['CASE-2026-0139']!.status).toBe('business-approval-waiting')
      // persona を承認者に切替 → 承認可
      s = storeReducer(s, { type: 'session/switchActor', actorId: 'actor-checker' })
      s = storeReducer(s, { type: 'case/approve', id: 'CASE-2026-0139', by: 'checker' })
      expect(s.cases['CASE-2026-0139']!.status).toBe('reflected')
    })

    it('case/sendback: ready→sent-back + 理由保存、終端 reflected は逆行不可 (I2 precondition)', () => {
      const s = storeReducer(seed(), { type: 'case/sendback', id: 'CASE-2026-0142', reason: 'ビル名不一致', category: 'edge_case' })
      expect(s.cases['CASE-2026-0142']!.status).toBe('sent-back')
      expect(s.cases['CASE-2026-0142']!.sendback?.reason).toBe('ビル名不一致')
      // CASE-2026-0120 = reflected (終端) → 差戻し no-op
      const reflected = storeReducer(seed(), { type: 'case/sendback', id: 'CASE-2026-0120', reason: 'x', category: 'edge_case' })
      expect(reflected.cases['CASE-2026-0120']!.status).toBe('reflected')
    })

    it('proposal/reject: forwarded→rejected + 理由保存 (decision、理由を捨てない)', () => {
      const s = storeReducer(seed(), { type: 'proposal/reject', id: 'PROP-2026-028', reason: '影響範囲が大きい', category: 'edge_case' })
      expect(s.proposals['PROP-2026-028']!.status).toBe('rejected')
      expect(s.proposals['PROP-2026-028']!.decision).toEqual({ kind: 'reject', reason: '影響範囲が大きい', category: 'edge_case' })
    })

    it('proposal/sendback: forwarded→pending-triage + 理由保存 (triage へ戻す)', () => {
      const s = storeReducer(seed(), { type: 'proposal/sendback', id: 'PROP-2026-028', reason: '再検討', category: 'judgment_gap' })
      expect(s.proposals['PROP-2026-028']!.status).toBe('pending-triage')
      expect(s.proposals['PROP-2026-028']!.decision?.kind).toBe('sendback')
    })

    it('session/switchActor: currentActorId を切替', () => {
      const s = storeReducer(seed(), { type: 'session/switchActor', actorId: 'actor-checker' })
      expect(s.currentActorId).toBe('actor-checker')
    })

    it('SoD: seeded 承認待ち案件も入力者 persona のままでは承認不可 (inputApprovedBy backfill)', () => {
      // CASE-2026-0128 = seed 時点で baw、inputApprovedBy=actor-inputter。currentActor=入力者のまま承認者承認 → no-op
      const s = storeReducer(seed(), { type: 'case/approve', id: 'CASE-2026-0128', by: 'checker' })
      expect(s.cases['CASE-2026-0128']!.inputApprovedBy).toBe('actor-inputter')
      expect(s.cases['CASE-2026-0128']!.status).toBe('business-approval-waiting')
    })

    it('case/sendback: precondition 外 (pending / sent-back) は no-op、理由も付かない', () => {
      const base = seed()
      const fromPending = storeReducer(base, { type: 'case/sendback', id: 'CASE-2026-0150', reason: 'x', category: 'edge_case' })
      expect(fromPending.cases['CASE-2026-0150']!.status).toBe('pending')
      expect(fromPending.cases['CASE-2026-0150']!.sendback).toBeUndefined()
    })

    it('session/switchActor: 未知 actorId は no-op (検証)', () => {
      const s = storeReducer(seed(), { type: 'session/switchActor', actorId: 'actor-nonexistent' })
      expect(s.currentActorId).toBe('actor-inputter')
    })
  })

  describe('remediation W2a (P1-2/P1-3 新 action)', () => {
    it('seed: promotionStatus=none + readNotificationIds 空 (W2a schema)', () => {
      const s = seed()
      expect(s.agents['agent-corporate-address-change']!.promotionStatus).toBe('none')
      expect(s.readNotificationIds).toEqual([])
    })

    it('agent/requestPromotion: 申請 actor を保持 (P1-3 SoD 判定材料)', () => {
      const s = storeReducer(seed(), { type: 'agent/requestPromotion', id: 'agent-corporate-address-change' })
      expect(s.agents['agent-corporate-address-change']!.promotionStatus).toBe('requested')
      expect(s.agents['agent-corporate-address-change']!.promotionRequestedBy).toBe('actor-inputter')
    })

    it('agent/approvePromotion: 自己承認は no-op、別 actor で approved (設定層 SoD = 案件と共通 helper)', () => {
      let s = storeReducer(seed(), { type: 'agent/requestPromotion', id: 'agent-corporate-address-change' })
      // 申請者 (入力者) のまま設定承認 → 自己承認で no-op
      const self = storeReducer(s, { type: 'agent/approvePromotion', id: 'agent-corporate-address-change' })
      expect(self.agents['agent-corporate-address-change']!.promotionStatus).toBe('requested')
      // 業務責任者 persona に切替 → approved
      s = storeReducer(s, { type: 'session/switchActor', actorId: 'actor-approver' })
      s = storeReducer(s, { type: 'agent/approvePromotion', id: 'agent-corporate-address-change' })
      expect(s.agents['agent-corporate-address-change']!.promotionStatus).toBe('approved')
    })

    it('agent/approvePromotion: requested 以外は no-op (precondition)', () => {
      const s = storeReducer(seed(), { type: 'agent/approvePromotion', id: 'agent-corporate-address-change' })
      expect(s.agents['agent-corporate-address-change']!.promotionStatus).toBe('none')
    })

    it('agent/sendbackPromotion: requested→none + 理由保持、再申請で理由クリア (C1 解消)', () => {
      let s = storeReducer(seed(), { type: 'agent/requestPromotion', id: 'agent-corporate-address-change' })
      s = storeReducer(s, { type: 'agent/sendbackPromotion', id: 'agent-corporate-address-change', reason: 'サンプル不足' })
      expect(s.agents['agent-corporate-address-change']!.promotionStatus).toBe('none')
      expect(s.agents['agent-corporate-address-change']!.promotionSendbackReason).toBe('サンプル不足')
      expect(s.agents['agent-corporate-address-change']!.promotionRequestedBy).toBeUndefined()
      // 再申請 → requested に戻り sendbackReason はクリア
      s = storeReducer(s, { type: 'agent/requestPromotion', id: 'agent-corporate-address-change' })
      expect(s.agents['agent-corporate-address-change']!.promotionStatus).toBe('requested')
      expect(s.agents['agent-corporate-address-change']!.promotionSendbackReason).toBeUndefined()
    })

    it('case/escalate: escalation を記録し status は不変 (裁定の帰結は別 action、JG-3=a)', () => {
      const s = storeReducer(seed(), {
        type: 'case/escalate',
        id: 'CASE-2026-0142',
        reason: '判断困難',
        category: 'judgment_gap',
        to: 'actor-approver',
      })
      expect(s.cases['CASE-2026-0142']!.escalation).toEqual({ reason: '判断困難', category: 'judgment_gap', to: 'actor-approver' })
      expect(s.cases['CASE-2026-0142']!.status).toBe('ready')
    })

    it('notification/markRead + markAllRead: 既読集合に冪等追記 (重複排除)', () => {
      let s = storeReducer(seed(), { type: 'notification/markRead', id: 'sendback:CASE-2026-0142' })
      expect(s.readNotificationIds).toEqual(['sendback:CASE-2026-0142'])
      s = storeReducer(s, { type: 'notification/markRead', id: 'sendback:CASE-2026-0142' }) // 冪等
      expect(s.readNotificationIds).toHaveLength(1)
      s = storeReducer(s, {
        type: 'notification/markAllRead',
        ids: ['sendback:CASE-2026-0142', 'escalation:CASE-2026-0150'],
      })
      expect(s.readNotificationIds).toEqual(['sendback:CASE-2026-0142', 'escalation:CASE-2026-0150'])
    })
  })

  describe('remediation W3 (reversal C3 / manual-entry C4)', () => {
    // CASE-2026-0120 = seed の reflected (反映済) 案件、CASE-2026-0142 = ready
    it('case/reverse 訂正: reflected → ready + reversal 記録 (前進のみ→可逆)', () => {
      const s = storeReducer(seed(), { type: 'case/reverse', id: 'CASE-2026-0120', kind: '訂正', reason: '住所の訂正' })
      expect(s.cases['CASE-2026-0120']!.status).toBe('ready')
      expect(s.cases['CASE-2026-0120']!.reversal).toEqual({ kind: '訂正', reason: '住所の訂正' })
    })
    it('case/reverse 取消: reflected → sent-back + reversal 記録', () => {
      const s = storeReducer(seed(), { type: 'case/reverse', id: 'CASE-2026-0120', kind: '取消', reason: '誤反映のため取消' })
      expect(s.cases['CASE-2026-0120']!.status).toBe('sent-back')
      expect(s.cases['CASE-2026-0120']!.reversal!.kind).toBe('取消')
    })
    it('不可逆 guard: 非 reflected (ready) の reverse は no-op (状態不変)', () => {
      const before = seed()
      const s = storeReducer(before, { type: 'case/reverse', id: 'CASE-2026-0142', kind: '訂正', reason: 'x' })
      expect(s.cases['CASE-2026-0142']!.status).toBe('ready')
      expect(s.cases['CASE-2026-0142']!.reversal).toBeUndefined()
      expect(s).toBe(before)
    })
    it('不可逆 guard: 二重 reverse は no-op (reversal 済は再 reverse 不可)', () => {
      const once = storeReducer(seed(), { type: 'case/reverse', id: 'CASE-2026-0120', kind: '訂正', reason: '一度目' })
      const twice = storeReducer(once, { type: 'case/reverse', id: 'CASE-2026-0120', kind: '取消', reason: '二度目' })
      expect(twice.cases['CASE-2026-0120']!.reversal).toEqual({ kind: '訂正', reason: '一度目' })
      expect(twice).toBe(once)
    })
    it('case/create: 草案を caseOrder 末尾に追記 + 入力値を overrides に格納', () => {
      const before = seed()
      const s = storeReducer(before, {
        type: 'case/create',
        id: 'CASE-MANUAL-001',
        workflowId: 'UC-BO-01',
        workflowName: '法人住所変更',
        assignee: '山田太郎',
        fieldLabels: ['新住所'],
        values: { 新住所: '東京都港区 1-1' },
        receivedAt: '2026-05-30T18:00:00+09:00',
      })
      expect(s.caseOrder).toHaveLength(before.caseOrder.length + 1)
      expect(s.caseOrder[s.caseOrder.length - 1]).toBe('CASE-MANUAL-001')
      const draft = s.cases['CASE-MANUAL-001']!
      expect(draft.status).toBe('ready')
      expect(draft.flags).toBe(0)
      expect(draft.overrides).toEqual({ 新住所: '東京都港区 1-1' })
      expect(draft.resolvedFieldIds).toEqual(['新住所'])
    })
    it('case/create: id 重複は冪等 no-op (既存 case を上書きしない)', () => {
      const before = seed()
      const s = storeReducer(before, {
        type: 'case/create',
        id: 'CASE-2026-0142',
        workflowId: 'UC-BO-01',
        workflowName: '法人住所変更',
        fieldLabels: [],
        values: {},
        receivedAt: '2026-05-30T18:00:00+09:00',
      })
      expect(s).toBe(before)
      expect(s.caseOrder).toHaveLength(before.caseOrder.length)
    })
    it('persist round-trip: reversal / receivedAt が v6 で復元される', () => {
      const reversed = storeReducer(seed(), { type: 'case/reverse', id: 'CASE-2026-0120', kind: '取消', reason: '取消理由' })
      savePersisted(reversed)
      const restored = loadPersisted(seed())
      expect(restored.cases['CASE-2026-0120']!.reversal).toEqual({ kind: '取消', reason: '取消理由' })
      expect(restored.cases['CASE-2026-0142']!.receivedAt).toBe('2026-05-30T16:40:00+09:00')
    })
  })

  describe('immutability / reset', () => {
    it('reducer は元 state を破壊しない', () => {
      const base = seed()
      storeReducer(base, { type: 'case/sendback', id: 'CASE-2026-0142', reason: 'x', category: 'edge_case' })
      expect(base.cases['CASE-2026-0142']!.status).toBe('ready')
    })
    it('store/reset は seed に戻す', () => {
      const mutated = storeReducer(seed(), { type: 'case/sendback', id: 'CASE-2026-0142', reason: 'x', category: 'edge_case' })
      const reset = storeReducer(mutated, { type: 'store/reset' })
      expect(reset.cases['CASE-2026-0142']!.status).toBe('ready')
    })
  })

  describe('persist: reload restore', () => {
    beforeEach(() => clearPersisted())

    it('save → load で操作結果が復元される', () => {
      // CASE-2026-0139 = flags0 (承認可能)。flagged 案件では遷移しないため round-trip にならない
      const mutated = storeReducer(seed(), { type: 'case/approve', id: 'CASE-2026-0139', by: 'input' })
      savePersisted(mutated)
      const restored = loadPersisted(seed())
      expect(restored.cases['CASE-2026-0139']!.status).toBe('business-approval-waiting')
    })

    it('未保存時は fallback (seed) を返す', () => {
      expect(loadPersisted(seed()).caseOrder).toHaveLength(CASE_LIST.length)
    })

    it('schema version 不一致は fallback (旧 v1 localStorage → seed、R2)', () => {
      localStorage.setItem('bo-ai-v2:store', JSON.stringify({ v: 1, state: { caseOrder: [] } }))
      const restored = loadPersisted(seed())
      expect(restored.caseOrder).toHaveLength(CASE_LIST.length) // 旧 v1 は v6 と不一致 → seed fallback
    })

    it('旧 v2 localStorage (overrides/currentActorId 欠落) は v6 不一致で安全に fallback (B1/B4 migration)', () => {
      localStorage.setItem(
        'bo-ai-v2:store',
        JSON.stringify({
          v: 2,
          state: {
            cases: { 'CASE-X': { id: 'CASE-X', status: 'ready', flags: 0, resolvedFieldIds: [] } }, // overrides 無 = 旧 v2
            caseOrder: ['CASE-X'],
            proposals: {},
            proposalOrder: [],
            agents: {},
            agentOrder: [],
          },
        }),
      )
      const restored = loadPersisted(seed())
      expect(restored.cases['CASE-2026-0142']).toBeDefined() // seed fallback (白画面化しない)
      expect(restored.cases['CASE-X']).toBeUndefined()
    })

    it('旧 v4 localStorage (readNotificationIds 欠落) は v6 不一致で安全に fallback (W2a 4→5 migration)', () => {
      localStorage.setItem(
        'bo-ai-v2:store',
        JSON.stringify({
          v: 4,
          state: {
            cases: {},
            caseOrder: [],
            proposals: {},
            proposalOrder: [],
            agents: {},
            agentOrder: [],
            currentActorId: 'actor-inputter', // v4 は readNotificationIds/promotionStatus を持たない
          },
        }),
      )
      const restored = loadPersisted(seed())
      expect(restored.caseOrder).toHaveLength(CASE_LIST.length) // v4 ≠ v6 → seed fallback (白画面化しない)
    })

    it('旧 v5 localStorage は v6 不一致で安全に fallback (W3 5→6 migration: elapsedLabel→receivedAt / reversal)', () => {
      // 旧 v5 は CaseEntity.elapsedLabel を持ち receivedAt/reversal を持たない → v6 と不一致で seed fallback (白画面化しない)。
      localStorage.setItem(
        'bo-ai-v2:store',
        JSON.stringify({
          v: 5,
          state: {
            cases: { 'CASE-X': { id: 'CASE-X', status: 'ready', flags: 0, resolvedFieldIds: [], overrides: {}, elapsedLabel: '1時間' } },
            caseOrder: ['CASE-X'],
            proposals: {},
            proposalOrder: [],
            agents: {},
            agentOrder: [],
            currentActorId: 'actor-inputter',
            readNotificationIds: [],
          },
        }),
      )
      const restored = loadPersisted(seed())
      expect(restored.cases['CASE-2026-0142']).toBeDefined() // seed fallback
      expect(restored.cases['CASE-X']).toBeUndefined()
    })

    it('同一 version でも形が壊れた state は fallback (shape guard: dict 欠落)', () => {
      // v は一致するが cases/proposals/agents 等を欠く → selector 白画面化を防ぐため seed に戻す
      localStorage.setItem('bo-ai-v2:store', JSON.stringify({ v: 6, state: { caseOrder: [] } }))
      const restored = loadPersisted(seed())
      expect(restored.caseOrder).toHaveLength(CASE_LIST.length)
      expect(restored.cases['CASE-2026-0142']).toBeDefined()
    })

    it('現 version だが case に resolvedFieldIds 欠落 → fallback (shape guard 深掘り、R2)', () => {
      localStorage.setItem(
        'bo-ai-v2:store',
        JSON.stringify({
          v: 6,
          state: {
            cases: { 'CASE-X': { id: 'CASE-X', status: 'ready', flags: 0, overrides: {} } }, // resolvedFieldIds 欠落
            caseOrder: ['CASE-X'],
            proposals: {},
            proposalOrder: [],
            agents: {},
            agentOrder: [],
            currentActorId: 'actor-inputter',
            readNotificationIds: [], // 他 field は揃え、欠落は resolvedFieldIds のみに絞る
          },
        }),
      )
      const restored = loadPersisted(seed())
      expect(restored.cases['CASE-2026-0142']).toBeDefined() // seed fallback
      expect(restored.cases['CASE-X']).toBeUndefined()
    })

    it('現 version だが currentActorId 欠落 → fallback (B4 shape guard)', () => {
      localStorage.setItem(
        'bo-ai-v2:store',
        JSON.stringify({
          v: 6,
          state: { cases: {}, caseOrder: [], proposals: {}, proposalOrder: [], agents: {}, agentOrder: [], readNotificationIds: [] }, // currentActorId 欠落
        }),
      )
      const restored = loadPersisted(seed())
      expect(restored.caseOrder).toHaveLength(CASE_LIST.length) // seed fallback
    })
  })
})
