import { loadConfig } from './config.js'
import { resetDemo } from './db/reset.js'

// CLI: `npm run db:reset-demo` (tsx). Env-gated (DEMO_RESET_ENABLED); refuses with a non-zero
// exit and zero writes when disabled — never a silent no-op success (contract 09 §4).
const result = resetDemo(loadConfig())
if (!result.ok) {
  console.error(`[db:reset-demo] refused: ${result.reason}`)
  process.exit(1)
}
console.log(`[db:reset-demo] DB recreated (${result.migrationsApplied} migration(s) applied).`)
