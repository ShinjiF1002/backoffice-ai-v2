import { describe, it, expect } from 'vitest'
import { auditTs } from '../src/audit.js'

// Contract 06 §auditSeq / 08 (b): occurred_at = deterministic auditTs(seq), tz-ISO, MONOTONIC.
describe('auditTs', () => {
  it('seq 0/1 = the demo base (18:00 +09:00) + minutes', () => {
    expect(auditTs(0)).toBe('2026-05-30T18:00:00+09:00')
    expect(auditTs(1)).toBe('2026-05-30T18:01:00+09:00')
  })

  it('rolls the DATE forward past midnight — monotonic past seq 360 (was the live %24 wrap bug)', () => {
    expect(auditTs(359)).toBe('2026-05-30T23:59:00+09:00')
    expect(auditTs(360)).toBe('2026-05-31T00:00:00+09:00') // NOT 2026-05-30T00:00
    expect(auditTs(360) > auditTs(359)).toBe(true)
  })

  it('is a pure function of seq (deterministic, no wall-clock)', () => {
    expect(auditTs(42)).toBe(auditTs(42))
    expect(auditTs(42)).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+09:00$/)
  })
})
