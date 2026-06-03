import { describe, it, expect, afterEach } from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { resetDemo } from '../src/db/reset.js'
import { loadConfig } from '../src/config.js'

const created: string[] = []
afterEach(() => {
  for (const dir of created.splice(0)) fs.rmSync(dir, { recursive: true, force: true })
})
function tmpDir(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'boai-reset-'))
  created.push(dir)
  return dir
}

// Contract 09 §4: reset-cli-disabled-by-default (non-zero exit + 0 writes when env unset).
describe('db:reset-demo gate', () => {
  it('refuses with zero writes when DEMO_RESET_ENABLED is unset', () => {
    const dbPath = path.join(tmpDir(), 'demo.sqlite')
    const result = resetDemo(loadConfig({ DB_PATH: dbPath })) // DEMO_RESET_ENABLED unset
    expect(result.ok).toBe(false)
    expect(fs.existsSync(dbPath)).toBe(false) // 0 writes — no no-op-success
  })

  it('recreates the DB when DEMO_RESET_ENABLED=true', () => {
    const dbPath = path.join(tmpDir(), 'demo.sqlite')
    const result = resetDemo(loadConfig({ DB_PATH: dbPath, DEMO_RESET_ENABLED: 'true' }))
    expect(result.ok).toBe(true)
    expect(fs.existsSync(dbPath)).toBe(true)
  })
})
