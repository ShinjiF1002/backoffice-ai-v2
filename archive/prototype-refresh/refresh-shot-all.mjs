// Full refresh coverage: bespoke before/after + foundation-only screens.
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
const OUT = '/tmp/bo-refresh-compare'
mkdirSync(OUT, { recursive: true })
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
async function shot(base, path, name) {
  try {
    await page.goto(base + path, { waitUntil: 'networkidle', timeout: 15000 })
    await page.waitForTimeout(500)
    await page.screenshot({ path: `${OUT}/${name}.png` })
    console.log('OK', name)
  } catch (e) { console.log('FAIL', name, e.message) }
}
const B = 'http://localhost:5174', A = 'http://localhost:5175'
// bespoke before/after
await shot(B, '/observatory', 'observatory-before')
await shot(A, '/observatory', 'observatory-after')
await shot(B, '/', 'hub-before2')
await shot(A, '/', 'hub-after2')
await shot(B, '/proposals/PROP-2026-031', 'proposaldetail-before')
await shot(A, '/proposals/PROP-2026-031', 'proposaldetail-after')
// density list (after)
await shot(A, '/agents', 'agents-after')
await shot(A, '/escalations', 'escalations-after')
// foundation-only screens (after) to confirm
await shot(A, '/cases/new', 'casedraft-after')
await shot(A, '/agents/agent-corporate-address-change', 'agentdetail-after')
await shot(A, '/business-approver', 'businessapprover-after')
await browser.close(); console.log('done')
