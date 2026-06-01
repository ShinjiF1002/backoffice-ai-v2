import { describe, it, expect } from 'vitest'
import { buildManualCaseDetail, CASE_DETAILS, CASE_2026_0142 } from '@/data/mock-case-detail'

// F-006/F-007/F-051: 手動起票 (origin='manual') 案件は起きていない AI 処理・OCR・スキャン書類・押印を捏造しない。
// AI 案件 (origin='ai') の押印欄は「サンプル」明示で実印影を主張しない。

const manual = () => buildManualCaseDetail('CASE-MANUAL-101', '法人住所変更', '山田太郎', { 法人名: '株式会社テスト', 新住所: '東京都', ビル名: 'テストビル', 支店コード: '042', 効力発生日: '2026-06-15' }, 'ready')

describe('manual-entry honesty (F-006/F-007)', () => {
  it('origin=manual', () => {
    expect(manual().origin).toBe('manual')
  })

  it('F-006: lifecycle に AI処理 step を持たない (起きていない AI 処理を捏造しない)', () => {
    const steps = manual().lifecycle.map((e) => e.step)
    expect(steps).not.toContain('AI処理')
    expect(steps).toContain('受付')
    expect(steps).toContain('入力者確認')
  })

  it('F-006: 書類は「スキャン画像なし」で .pdf / 押印欄を出さない', () => {
    const doc = manual().document
    expect(doc.fileName).not.toMatch(/\.pdf$/)
    expect(doc.rows.some((r) => r.label.includes('押印'))).toBe(false)
  })

  it('F-006: field は手入力値のみで OCR / sourceLocator を捏造しない', () => {
    const f = manual().fields[0]
    expect(f?.humanValue).toBeDefined()
    expect(f?.ocrRawValue).toBeUndefined()
    expect(f?.sourceLocator).toBeUndefined()
  })
})

describe('AI-case honesty (F-051)', () => {
  it('生成 AI 案件は origin=ai', () => {
    const ai = CASE_DETAILS['CASE-2026-0142']
    expect(ai?.origin).toBe('ai')
  })

  it('F-051: 押印欄は「サンプル」明示で実印影を主張しない', () => {
    const seal = CASE_2026_0142.document.rows.find((r) => r.label.includes('押印'))
    expect(seal?.value).toContain('サンプル')
  })
})
