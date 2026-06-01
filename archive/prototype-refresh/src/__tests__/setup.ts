// Vitest setup — jest-dom matchers + jest-axe (toHaveNoViolations) を vitest expect に登録。
// Phase 0: 検証基盤最小導入 (SSOT: ~/.claude/plans/reactive-percolating-gizmo.md Phase 0)。
import '@testing-library/jest-dom/vitest'
import { expect, afterEach } from 'vitest'
import { toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

// 各 test 後に localStorage を全消去し、test 間の永続状態リークを防ぐ。
// P1-1 で ProcessSelector が選択業務を localStorage 永続するため、業務切替を伴う test が
// 後続 test の既定業務 (UC-BO-01) を汚染しないようにする (clearPersisted は store key のみ消去)。
afterEach(() => {
  localStorage.clear()
})

// jsdom の localStorage 実装差異 (vitest 4 + jsdom 29 で setItem 非関数) を吸収する
// 決定的な in-memory mock。永続化ロジック (store/persist) の単体検証用 (Phase 1)。
class LocalStorageMock implements Storage {
  private store = new Map<string, string>()
  get length(): number {
    return this.store.size
  }
  clear(): void {
    this.store.clear()
  }
  getItem(key: string): string | null {
    return this.store.has(key) ? (this.store.get(key) as string) : null
  }
  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null
  }
  removeItem(key: string): void {
    this.store.delete(key)
  }
  setItem(key: string, value: string): void {
    this.store.set(key, String(value))
  }
}

Object.defineProperty(globalThis, 'localStorage', {
  value: new LocalStorageMock(),
  configurable: true,
  writable: true,
})
