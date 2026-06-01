// before/after screenshot: original (5174) vs refresh studio (5175). Transient research tool.
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const OUT = '/tmp/bo-refresh-compare'
mkdirSync(OUT, { recursive: true })

const BASES = [
  { tag: 'before', base: 'http://localhost:5174' },
  { tag: 'after', base: 'http://localhost:5175' },
]
const ROUTES = [
  { id: 'hub', path: '/' },
  { id: 'cases', path: '/cases' },
  { id: 'observatory', path: '/observatory' },
]

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
for (const { tag, base } of BASES) {
  for (const r of ROUTES) {
    const url = base + r.path
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 })
      await page.waitForTimeout(500)
      const file = `${OUT}/${r.id}-${tag}.png`
      await page.screenshot({ path: file })
      console.log('OK', file)
    } catch (e) {
      console.log('FAIL', url, e.message)
    }
  }
}
await browser.close()
console.log('done')
