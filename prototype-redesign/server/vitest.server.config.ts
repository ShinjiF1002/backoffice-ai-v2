import { defineConfig } from 'vitest/config'

// server invariant/security test project: node environment, in-process handler
// invocation (no HTTP server, no supertest — contract 05 OD-5 / 09 D5).
// root is pinned to this dir so `__tests__/**` resolves to server/__tests__ regardless of cwd.
export default defineConfig({
  root: import.meta.dirname,
  test: {
    environment: 'node',
    include: ['__tests__/**/*.test.ts'],
    // native module — never transform, load the prebuilt/compiled binary directly.
    server: {
      deps: {
        external: ['better-sqlite3'],
      },
    },
  },
})
