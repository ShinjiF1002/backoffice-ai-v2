import { describe, it, expect } from 'vitest'
import { storeReducer } from '@/store/reducer'
import { seed } from '@/store/seed'
import type { StoreState } from '@/store/types'

// F-002: 操作 (起票/承認/差戻し/訂正/取消…) が append-only な auditEvents に記録され、
// Observatory の useCrossLedger が静的台帳に append して表示する。actor は store identity 由来 (owner 非依存、F-001 SSOT 維持)。

const createManual = (s: StoreState, id: string) =>
  storeReducer(s, {
    type: 'case/create',
    id,
    workflowId: 'UC-BO-01',
    workflowName: '法人住所変更',
    assignee: '佐藤花子', // owner=佐藤花子 (demo actor ではない) — 台帳 actor がこれに引きずられないことを確認
    fieldLabels: ['法人名'],
    values: { 法人名: 'サンプル株式会社' },
    receivedAt: '2026-05-30T18:00:00',
  })

describe('F-002 auditEvents (append-only 操作証跡)', () => {
  it('seed は空、手動起票で 1 件 append (action=手動起票, caseId 一致)', () => {
    const s0 = seed()
    expect(s0.auditEvents).toHaveLength(0)
    expect(s0.auditSeq).toBe(0)
    const s1 = createManual(s0, 'CASE-MANUAL-001')
    expect(s1.auditEvents).toHaveLength(1)
    expect(s1.auditEvents[0]?.action).toBe('手動起票')
    expect(s1.auditEvents[0]?.caseId).toBe('CASE-MANUAL-001')
    expect(s1.auditSeq).toBe(1)
  })

  it('guardrail #1: 台帳 actor は操作者 (currentActorId) 由来で owner(佐藤花子) に引きずられない', () => {
    const s1 = createManual(seed(), 'CASE-MANUAL-002')
    // 既定 currentActorId = actor-inputter (山田太郎)。owner=佐藤花子 でも actor は山田太郎。
    expect(s1.auditEvents[0]?.actor).toBe('山田太郎')
    expect(s1.auditEvents[0]?.actor).not.toBe('佐藤花子')
  })

  it('入力者承認→承認者承認 が順に append され、既存 event は不変 (append-only)', () => {
    let s = createManual(seed(), 'CASE-MANUAL-003')
    const firstEvent = s.auditEvents[0]
    s = storeReducer(s, { type: 'case/approve', id: 'CASE-MANUAL-003', by: 'input' })
    expect(s.auditEvents.at(-1)?.action).toBe('入力者承認')
    s = storeReducer(s, { type: 'session/switchActor', actorId: 'actor-checker' })
    s = storeReducer(s, { type: 'case/approve', id: 'CASE-MANUAL-003', by: 'checker' })
    expect(s.auditEvents.at(-1)?.action).toBe('承認者承認')
    expect(s.auditEvents.at(-1)?.actor).toBe('鈴木課長')
    expect(s.auditEvents).toHaveLength(3) // 手動起票 + 入力者承認 + 承認者承認
    expect(s.auditEvents[0]).toBe(firstEvent) // 先頭 event は不変 (append-only、更新/削除なし)
  })

  it('SoD で block された承認は台帳に残さない (no state change → no event)', () => {
    let s = createManual(seed(), 'CASE-MANUAL-004')
    s = storeReducer(s, { type: 'case/approve', id: 'CASE-MANUAL-004', by: 'input' }) // inputApprovedBy=actor-inputter
    const before = s.auditEvents.length
    // 同一 actor (入力者) が承認者承認を試行 → SoD block → state 据え置き → event 無し
    const blocked = storeReducer(s, { type: 'case/approve', id: 'CASE-MANUAL-004', by: 'checker' })
    expect(blocked.auditEvents).toHaveLength(before)
    expect(blocked).toBe(s)
  })

  it('差戻しが台帳に append (action=差戻し)', () => {
    let s = createManual(seed(), 'CASE-MANUAL-005')
    s = storeReducer(s, { type: 'case/sendback', id: 'CASE-MANUAL-005', reason: '書類不足', category: '不備' })
    expect(s.auditEvents.at(-1)?.action).toBe('差戻し')
    expect(s.auditEvents.at(-1)?.caseId).toBe('CASE-MANUAL-005')
  })
})
