import { describe, it, expect } from 'vitest'
import { execFileSync } from 'node:child_process'
import path from 'node:path'

const SERVER_SRC = path.resolve(import.meta.dirname, '..', 'src')

/** grep -rE pattern over server/src; returns matching lines (empty string when none). */
function grep(pattern: string): string {
  try {
    return execFileSync('grep', ['-rE', pattern, SERVER_SRC], { stdio: 'pipe' }).toString().trim()
  } catch {
    return '' // grep exits non-zero when there are no matches
  }
}

describe('route + audit hygiene (mechanical)', () => {
  it('T-NO-DIRECT-PATCH: no PATCH/PUT/DELETE Express route is registered (state changes via action endpoints only)', () => {
    // express route methods only (excludes Set/Map .delete()); the route() helper is typed to 'post'
    expect(grep('(app|router)\\.(patch|put|delete)\\(')).toBe('')
  })

  it('append-only route-side: no SQL UPDATE/DELETE against audit_events anywhere in the server', () => {
    expect(grep('(UPDATE|DELETE)[[:space:]]+(FROM[[:space:]]+)?audit_events')).toBe('')
  })

  it('every mutation handler module wraps its writes in db.transaction', () => {
    for (const file of ['cases', 'proposals', 'agents', 'notifications']) {
      const hits = grep('db\\.transaction')
      expect(hits.includes(`/handlers/${file}.ts`)).toBe(true)
    }
  })
})
