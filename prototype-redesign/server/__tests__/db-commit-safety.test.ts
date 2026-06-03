import { describe, it, expect, afterEach } from 'vitest'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { openDb } from '../src/db/connection.js'

const REPO_ROOT = path.resolve(import.meta.dirname, '..', '..', '..') // backoffice-ai-v2/
const SERVER_DIR = path.resolve(import.meta.dirname, '..') // prototype-redesign/server/
const PROTO_DIR = path.resolve(SERVER_DIR, '..') // prototype-redesign/

const created: string[] = []
afterEach(() => {
  for (const dir of created.splice(0)) fs.rmSync(dir, { recursive: true, force: true })
})

// Contract 01 §B-1 #6: DB file is commit-safe (gitignored, not tracked) + owner-only mode.
describe('DB file commit-safety + permissions', () => {
  it('default dev DB path is gitignored (git check-ignore matches)', () => {
    const devDb = path.join(SERVER_DIR, 'data', 'dev.sqlite')
    let ignored = false
    try {
      execFileSync('git', ['check-ignore', devDb], { cwd: REPO_ROOT, stdio: 'pipe' })
      ignored = true
    } catch {
      ignored = false
    }
    expect(ignored).toBe(true)
  })

  it('*.sqlite and *.db patterns are present in prototype-redesign/.gitignore', () => {
    const gi = fs.readFileSync(path.join(PROTO_DIR, '.gitignore'), 'utf8')
    expect(gi).toMatch(/\*\.sqlite/)
    expect(gi).toMatch(/\*\.db/)
  })

  it('no *.sqlite/*.db file is tracked by git', () => {
    const tracked = execFileSync('git', ['ls-files', '*.sqlite', '*.db'], {
      cwd: REPO_ROOT,
      stdio: 'pipe',
    })
      .toString()
      .trim()
    expect(tracked).toBe('')
  })

  it('opened DB file is owner-only (0600 on POSIX; equivalent best-effort elsewhere)', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'boai-mode-'))
    created.push(dir)
    const dbPath = path.join(dir, 'mode.sqlite')
    const db = openDb(dbPath)
    db.close()
    if (process.platform !== 'win32') {
      expect(fs.statSync(dbPath).mode & 0o777).toBe(0o600)
    } else {
      expect(fs.existsSync(dbPath)).toBe(true)
    }
  })
})
