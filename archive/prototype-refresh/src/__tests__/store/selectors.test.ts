import { describe, it, expect } from 'vitest'
import { resolveCaseActors } from '@/store/selectors'
import { DEMO_ACTORS } from '@/store/actors'
import type { CaseEntity } from '@/store/types'

// F-001: 四眼原則 (SoD) の actor identity を単一 SSOT で解決し、
// 一覧 (Approvals) / 詳細 (CaseDetail) / 台帳 (Observatory) で同一案件が同一の入力者・承認者名を示すことを保証する。

const baseEntity = (over: Partial<CaseEntity>): CaseEntity => ({
  id: 'CASE-2026-0128',
  workflowId: 'UC-BO-01',
  workflowName: '法人住所変更',
  status: 'business-approval-waiting',
  flags: 0,
  resolvedFieldIds: [],
  overrides: {},
  receivedAt: '2026-05-30T10:00:00',
  ...over,
})

describe('resolveCaseActors (F-001 SoD identity SSOT)', () => {
  it('入力者は inputApprovedBy actor 由来で、owner(assignee) の free-name に引きずられない', () => {
    // CASE-2026-0128 は owner=鈴木課長 だが入力者承認は actor-inputter(山田太郎)
    const e = baseEntity({ inputApprovedBy: 'actor-inputter', assignee: '鈴木課長' })
    const r = resolveCaseActors(e, { inputter: '鈴木課長', approver: '田中部長' })
    expect(r.inputterName).toBe('山田太郎')
    expect(r.inputterActorId).toBe('actor-inputter')
  })

  it('承認者は checker actor 固定 (Observatory OBS_SOD と同一 identity)', () => {
    const checker = DEMO_ACTORS.find((a) => a.role === 'checker')!
    const r = resolveCaseActors(baseEntity({ inputApprovedBy: 'actor-inputter' }))
    expect(r.approverName).toBe(checker.name) // 鈴木課長
    expect(r.approverActorId).toBe(checker.id)
  })

  it('四眼原則: 解決後の 入力者 ≠ 承認者 が常に成立', () => {
    const r = resolveCaseActors(baseEntity({ inputApprovedBy: 'actor-inputter' }))
    expect(r.inputterName).not.toBe(r.approverName)
  })

  it('actor 解決不能 (inputApprovedBy 未設定) のときのみ fallback 名を使う', () => {
    const r = resolveCaseActors(baseEntity({ inputApprovedBy: undefined }), { inputter: '高橋', approver: 'x' })
    expect(r.inputterName).toBe('高橋')
    expect(r.inputterActorId).toBeUndefined()
  })
})
