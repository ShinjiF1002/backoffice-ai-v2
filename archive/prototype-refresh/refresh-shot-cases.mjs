// Cases premium DataTable: before (orig 5174) vs after (studio 5175) + density/expand interactions.
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const OUT = '/tmp/bo-refresh-compare'
mkdirSync(OUT, { recursive: true })
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

async function shot(name) {
  await page.waitForTimeout(400)
  await page.screenshot({ path: `${OUT}/${name}.png` })
  console.log('OK', name)
}

// before
await page.goto('http://localhost:5174/cases', { waitUntil: 'networkidle', timeout: 15000 })
await shot('cases-before')

// after — default premium
await page.goto('http://localhost:5175/cases', { waitUntil: 'networkidle', timeout: 15000 })
await shot('cases-after-default')

// after — expand first expandable row (peek)
try {
  await page.getByRole('button', { name: /の詳細を展開$/ }).first().click()
  await shot('cases-after-expanded')
} catch (e) { console.log('expand FAIL', e.message) }

// after — compact density
try {
  await page.getByRole('button', { name: '狭い' }).click()
  await shot('cases-after-compact')
} catch (e) { console.log('density FAIL', e.message) }

await browser.close()
console.log('done')
