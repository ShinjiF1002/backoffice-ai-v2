// audit-v3-probe.mjs — reusable Playwright helper for the v3 audit fleet.
// Each agent imports this and writes its own short probe script → its own isolated chromium
// (no cross-agent browser collision; the :4174 preview server is stateless, per-context app state).
//
// Usage (agent writes e.g. /tmp/bo-v3-audit/probes/<agent>.mjs):
//   import { withPage, runAxe, modalProbe, tabReach, BASE } from '/Users/shinjifujiwara/code/active/backoffice-ai-v2/prototype-redesign/audit-v3-probe.mjs'
//   await withPage({ viewport:{width:1440,height:900} }, async (page) => {
//     await page.goto(BASE + '/cases')
//     const ax = await runAxe(page)
//     // ...click every button, assert behavior, screenshot to /tmp/bo-v3-audit/probes/<agent>/<step>.png
//   })
import { chromium } from 'playwright'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
export const AXE_SRC = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8')
export const BASE = process.env.AUDIT_BASE || 'http://localhost:4174'
export const PERSONAS = { inputter: 'actor-inputter', checker: 'actor-checker', approver: 'actor-approver' }
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

export async function withPage(opts = {}, fn) {
  const browser = await chromium.launch({ headless: true })
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'ja-JP', ...opts })
  const page = await ctx.newPage()
  const logs = []
  page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) logs.push(`[${m.type()}] ${m.text()}`) })
  page.on('pageerror', (e) => logs.push(`[pageerror] ${String(e)}`))
  page.__logs = logs
  try { return await fn(page) } finally { await ctx.close(); await browser.close() }
}

export async function runAxe(page) {
  await page.evaluate(AXE_SRC)
  return await page.evaluate(async () => {
    const r = await window.axe.run(document, { resultTypes: ['violations'] })
    return r.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, count: v.nodes.length, nodes: v.nodes.slice(0, 8).map((n) => ({ target: n.target, summary: n.failureSummary })) }))
  })
}

export async function setPersona(page, actorId) {
  const sel = page.getByLabel('操作者（デモ用の担当者）の切替')
  await sel.selectOption(actorId, { timeout: 3000 })
  await sleep(300)
}

// Probe a modal/dialog opened by clicking `openLocator`: does focus move in, Esc close, Tab trap, focus restore?
export async function modalProbe(page, openLocator) {
  const out = { opened: false, focusMovedIn: false, escClosed: false, tabEscapesDialog: false, focusRestored: false }
  const triggerTag = await page.evaluate(() => document.activeElement?.tagName || '')
  await openLocator.click()
  await sleep(350)
  const dlg = page.locator('[role="dialog"]')
  out.opened = await dlg.count() > 0
  if (!out.opened) return out
  out.focusMovedIn = await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]'))
  for (let i = 0; i < 25; i++) {
    await page.keyboard.press('Tab')
    const inDlg = await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]'))
    if (!inDlg) { out.tabEscapesDialog = true; break }
  }
  await page.keyboard.press('Escape')
  await sleep(300)
  out.escClosed = (await dlg.count()) === 0
  if (out.escClosed) out.focusRestored = await page.evaluate((tag) => document.activeElement?.tagName === tag, triggerTag)
  return out
}

// Tab through the page; return focus order + whether every interactive el is reachable + ring visible.
export async function tabReach(page, max = 60) {
  await page.evaluate(() => { const a = document.querySelector('a,button,input,select,[tabindex]'); a && a.focus() })
  const order = []
  for (let i = 0; i < max; i++) {
    await page.keyboard.press('Tab')
    const info = await page.evaluate(() => {
      const el = document.activeElement
      if (!el || el === document.body) return { tag: 'BODY' }
      const cs = getComputedStyle(el)
      return { tag: el.tagName, role: el.getAttribute('role') || '', label: (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 40), ring: (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) || cs.boxShadow !== 'none' }
    })
    order.push(info)
    if (info.tag === 'BODY' && i > 2) break
  }
  return order
}
