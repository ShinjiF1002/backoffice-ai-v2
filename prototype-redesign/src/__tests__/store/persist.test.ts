import { describe, it, expect, beforeEach } from 'vitest'
import { loadPersisted, savePersisted, clearPersisted } from '@/store/persist'
import { seed } from '@/store/seed'
import type { LedgerEvent } from '@/store/types'

// F-002 W1.5: persist guard が同一 version (現 SCHEMA) の malformed auditEvents を弾き、
// 欠落は withAuditDefaults で補完して useCrossLedger の spread を白画面化させないことを保証する。

const KEY = 'bo-ai-v2:store'
const sampleEvent: LedgerEvent = {
  ts: '2026-05-30 18:00:00', actor: '山田太郎', role: '入力者', action: '手動起票',
  beforeAfter: 'x', doc: '—', policy: '—', approvalId: '—', confidence: '—',
  caseId: 'CASE-MANUAL-001', workflowName: '法人住所変更',
}

describe('persist guard (F-002 auditEvents)', () => {
  beforeEach(() => clearPersisted())

  it('valid 状態は round-trip し auditEvents/auditSeq を保持', () => {
    const s = seed()
    s.auditEvents = [sampleEvent]
    s.auditSeq = 1
    savePersisted(s)
    const loaded = loadPersisted(seed())
    expect(loaded.auditEvents).toHaveLength(1)
    expect(loaded.auditSeq).toBe(1)
  })

  it('現 version で malformed auditEvents (非 array) は fallback(seed) へ', () => {
    savePersisted(seed())
    const raw = JSON.parse(localStorage.getItem(KEY) ?? '{}')
    raw.state.auditEvents = 'notanarray'
    localStorage.setItem(KEY, JSON.stringify(raw))
    const fb = seed()
    expect(loadPersisted(fb)).toBe(fb) // shape guard 不通過 → fallback 参照そのもの
  })

  it('現 version で auditSeq が非 number でも fallback へ', () => {
    savePersisted(seed())
    const raw = JSON.parse(localStorage.getItem(KEY) ?? '{}')
    raw.state.auditSeq = 'NaN'
    localStorage.setItem(KEY, JSON.stringify(raw))
    const fb = seed()
    expect(loadPersisted(fb)).toBe(fb)
  })

  it('現 version で auditEvents/auditSeq 欠落は [] / 0 に補完 (白画面化しない)', () => {
    savePersisted(seed())
    const raw = JSON.parse(localStorage.getItem(KEY) ?? '{}')
    delete raw.state.auditEvents
    delete raw.state.auditSeq
    localStorage.setItem(KEY, JSON.stringify(raw))
    const loaded = loadPersisted(seed())
    expect(Array.isArray(loaded.auditEvents)).toBe(true)
    expect(loaded.auditEvents).toHaveLength(0)
    expect(loaded.auditSeq).toBe(0)
  })
})
