import { persistProcess, loadProcess, DEFAULT_PROCESS } from '@/context/view-context'

// Phase 1 — ViewContext の永続化ロジック検証。
// 注: ProcessSelector の UI 配線 (選択 → setProcess → 全画面 filter) は Phase 5。
// 本 test は persistProcess / loadProcess の round-trip と fallback のみを対象とする。
describe('view persistence (Phase 1、UI 配線は Phase 5)', () => {
  beforeEach(() => localStorage.clear())

  it('persistProcess → loadProcess で選択業務が復元される', () => {
    persistProcess('all')
    expect(loadProcess()).toBe('all')
    persistProcess('UC-BO-02')
    expect(loadProcess()).toBe('UC-BO-02')
  })

  it('未保存時は DEFAULT_PROCESS', () => {
    expect(loadProcess()).toBe(DEFAULT_PROCESS)
  })

  it('localStorage アクセス失敗時は DEFAULT_PROCESS に安全 fallback', () => {
    const spy = vi.spyOn(localStorage, 'getItem').mockImplementation(() => {
      throw new Error('storage blocked')
    })
    try {
      expect(loadProcess()).toBe(DEFAULT_PROCESS)
    } finally {
      spy.mockRestore()
    }
  })
})
