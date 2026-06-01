// CaseDetail premium Diff/Change Preview: before (5174) vs after (5175).
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
const OUT = '/tmp/bo-refresh-compare'
mkdirSync(OUT, { recursive: true })
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } })
async function shot(base, name) {
  await page.goto(`${base}/cases/CASE-2026-0142`, { waitUntil: 'networkidle', timeout: 15000 })
  await page.waitForTimeout(500)
  await page.screenshot({ path: `${OUT}/${name}.png` })
  console.log('OK', name)
}
await shot('http://localhost:5174', 'detail-before')
await shot('http://localhost:5175', 'detail-after')
await browser.close()
console.log('done')
