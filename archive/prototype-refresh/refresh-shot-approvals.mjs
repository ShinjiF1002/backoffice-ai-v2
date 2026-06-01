// Approvals HIL lifecycle: before (5174) vs after (5175) + expand.
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
const OUT = '/tmp/bo-refresh-compare'
mkdirSync(OUT, { recursive: true })
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
async function go(base) { await page.goto(`${base}/approvals`, { waitUntil: 'networkidle', timeout: 15000 }); await page.waitForTimeout(500) }
async function shot(n) { await page.waitForTimeout(300); await page.screenshot({ path: `${OUT}/${n}.png` }); console.log('OK', n) }

await go('http://localhost:5174'); await shot('approvals-before')
await go('http://localhost:5175'); await shot('approvals-after-default')
try { await page.getByRole('button', { name: /の詳細を展開$/ }).first().click(); await shot('approvals-after-expanded') }
catch (e) { console.log('expand FAIL', e.message) }
await browser.close(); console.log('done')
