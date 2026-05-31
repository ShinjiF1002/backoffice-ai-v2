// audit-v3-capture.mjs — Phase 0 live-evidence harness for the v3 production-readiness UI audit.
// Transient audit tool (untracked). Run from project root so `playwright` + `axe-core` resolve.
//   node audit-v3-capture.mjs
// Evidence written to /tmp/bo-v3-audit/evidence/. Re-runnable; one chromium, sequential (no collision).
import { chromium } from 'playwright'
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const AXE_SRC = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8')

const BASE = process.env.AUDIT_BASE || 'http://localhost:4174'
const OUT = process.env.AUDIT_OUT || '/tmp/bo-v3-audit/evidence'
const ONLY = process.env.AUDIT_ONLY ? process.env.AUDIT_ONLY.split(',') : null // smoke: route ids
mkdirSync(OUT, { recursive: true })

const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 812 },
}

// 15 routes (App.tsx SSOT) + representative detail IDs (routes-axe.test.tsx)
const ROUTES = [
  { id: 'hub', path: '/' },
  { id: 'cases', path: '/cases', list: true },
  { id: 'approvals', path: '/approvals', list: true, persona: true },
  { id: 'cases-new', path: '/cases/new' },
  { id: 'case-detail', path: '/cases/CASE-2026-0142', persona: true },
  { id: 'proposals', path: '/proposals', list: true },
  { id: 'proposal-detail', path: '/proposals/PROP-2026-031', persona: true },
  { id: 'agents', path: '/agents', list: true },
  { id: 'agent-detail', path: '/agents/agent-corporate-address-change', persona: true },
  { id: 'observatory', path: '/observatory' },
  { id: 'search', path: '/search', list: true },
  { id: 'inbox', path: '/inbox', list: true },
  { id: 'business-approver', path: '/business-approver', persona: true },
  { id: 'config-approvals', path: '/config-approvals', persona: true },
  { id: 'escalations', path: '/escalations', list: true, persona: true },
]

const PERSONAS = { inputter: 'actor-inputter', checker: 'actor-checker', approver: 'actor-approver' }

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function setPersona(page, actorId) {
  try {
    const sel = page.getByLabel('操作者（デモ用の担当者）の切替')
    await sel.selectOption(actorId, { timeout: 2000 })
    await sleep(250)
    return true
  } catch {
    return false
  }
}

async function runAxe(page) {
  try {
    await page.evaluate(AXE_SRC)
    return await page.evaluate(async () => {
      const r = await window.axe.run(document, { resultTypes: ['violations'] })
      return r.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        help: v.help,
        nodes: v.nodes.slice(0, 6).map((n) => ({ target: n.target, summary: n.failureSummary, html: (n.html || '').slice(0, 240) })),
        count: v.nodes.length,
      }))
    })
  } catch (e) {
    return [{ id: 'AXE_RUN_ERROR', impact: 'n/a', help: String(e), nodes: [], count: 0 }]
  }
}

async function extractInteractive(page) {
  try {
    return await page.evaluate(() => {
      const sel = 'a,button,input,select,textarea,[role="button"],[role="tab"],[role="menuitem"],[role="checkbox"],[role="switch"],[tabindex]:not([tabindex="-1"]),summary'
      const els = Array.from(document.querySelectorAll(sel))
      return els.slice(0, 400).map((el) => {
        const r = el.getBoundingClientRect()
        return {
          tag: el.tagName,
          type: el.getAttribute('type') || '',
          role: el.getAttribute('role') || '',
          name: (el.getAttribute('aria-label') || el.textContent || el.getAttribute('title') || el.getAttribute('placeholder') || '').trim().slice(0, 60),
          href: el.getAttribute('href') || '',
          disabled: el.hasAttribute('disabled') || el.getAttribute('aria-disabled') === 'true',
          hidden: el.getAttribute('aria-hidden') === 'true',
          visible: r.width > 0 && r.height > 0,
          w: Math.round(r.width),
          h: Math.round(r.height),
        }
      })
    })
  } catch (e) {
    return [{ error: String(e) }]
  }
}

async function focusTrace(page, max = 40) {
  try {
    await page.evaluate(() => { const a = document.querySelector('a,button,input,select,[tabindex]'); if (a) a.focus() })
    const trace = []
    for (let i = 0; i < max; i++) {
      await page.keyboard.press('Tab')
      const info = await page.evaluate(() => {
        const el = document.activeElement
        if (!el || el === document.body) return { tag: 'BODY', text: '', visibleRing: false }
        const cs = getComputedStyle(el)
        const ring = (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) || cs.boxShadow !== 'none'
        return {
          tag: el.tagName,
          role: el.getAttribute('role') || '',
          label: (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 50),
          inDialog: !!el.closest('[role="dialog"]'),
          visibleRing: ring,
        }
      })
      trace.push(info)
      if (info.tag === 'BODY' && i > 2) break
    }
    return trace
  } catch (e) {
    return [{ error: String(e) }]
  }
}

async function capture(browser, route, vpName, { persona = null, demo = null, label } = {}) {
  const cellId = label || `${route.id}__${vpName}${persona ? '__' + persona : ''}${demo ? '__' + demo : ''}`
  const ctx = await browser.newContext({ viewport: VIEWPORTS[vpName], deviceScaleFactor: 1, locale: 'ja-JP' })
  const page = await ctx.newPage()
  const console_ = []
  page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) console_.push(`[${m.type()}] ${m.text()}`.slice(0, 300)) })
  page.on('pageerror', (e) => console_.push(`[pageerror] ${String(e)}`.slice(0, 300)))
  const url = BASE + route.path + (demo ? (route.path.includes('?') ? '&' : '?') + 'demo=' + demo : '')
  const rec = { cellId, url, viewport: vpName, persona, demo }
  const step = async (name, fn) => { try { return await fn() } catch (e) { (rec.stepErrors ||= {})[name] = String(e).slice(0, 160); return undefined } }
  try {
    rec.nav = await step('goto', async () => { await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 }); return 'ok' })
    await sleep(400)
    if (persona) rec.personaSet = await step('persona', () => setPersona(page, PERSONAS[persona]))
    await sleep(200)
    await step('screenshot', () => page.screenshot({ path: `${OUT}/${cellId}.png`, fullPage: true }))
    rec.axe = (await step('axe', () => runAxe(page))) || []
    rec.axeSummary = { total: rec.axe.length, critical: rec.axe.filter((v) => v.impact === 'critical').length, serious: rec.axe.filter((v) => v.impact === 'serious').length, moderate: rec.axe.filter((v) => v.impact === 'moderate').length }
    rec.aria = await step('aria', async () => (await page.locator('body').ariaSnapshot()).slice(0, 30000))
    rec.console = console_
    if (vpName === 'desktop' && !demo && !persona) {
      rec.focusTrace = await step('focusTrace', () => focusTrace(page))
      rec.interactive = await step('interactive', () => extractInteractive(page))
      rec.interactiveCount = Array.isArray(rec.interactive) ? rec.interactive.filter((e) => e.visible && !e.hidden).length : 0
    }
    rec.dom = await step('dom', async () => (await page.content()).slice(0, 150000))
    writeFileSync(`${OUT}/${cellId}.json`, JSON.stringify(rec, null, 2))
    const se = rec.stepErrors ? ` stepErr:${Object.keys(rec.stepErrors).join(',')}` : ''
    console.log(`OK  ${cellId}  axe(c:${rec.axeSummary.critical} s:${rec.axeSummary.serious} m:${rec.axeSummary.moderate})  console:${console_.length}  focus:${rec.focusTrace?.length ?? '-'}${se}`)
  } catch (e) {
    rec.error = String(e)
    writeFileSync(`${OUT}/${cellId}.json`, JSON.stringify(rec, null, 2))
    console.log(`ERR ${cellId}  ${String(e).slice(0, 120)}`)
  } finally {
    await ctx.close()
  }
  return { cellId, axeSummary: rec.axeSummary, console: console_.length, error: rec.error || null }
}

const manifest = []
const ACTIVE = ONLY ? ROUTES.filter((r) => ONLY.includes(r.id)) : ROUTES
const browser = await chromium.launch({ headless: true })
// Base: all routes × 3 viewports (default persona/state) + desktop focus-trace
for (const route of ACTIVE) for (const vp of Object.keys(VIEWPORTS)) manifest.push(await capture(browser, route, vp))
if (ONLY) { await browser.close(); writeFileSync(`${OUT}/_smoke.json`, JSON.stringify(manifest, null, 2)); console.log(`SMOKE DONE: ${manifest.length} cells`); process.exit(0) }
// State: list routes × {loading, error} (desktop)
for (const route of ROUTES.filter((r) => r.list)) for (const demo of ['loading', 'error']) manifest.push(await capture(browser, route, 'desktop', { demo }))
// Persona: role-derived routes × {checker, approver} (desktop)
for (const route of ROUTES.filter((r) => r.persona)) for (const p of ['checker', 'approver']) manifest.push(await capture(browser, route, 'desktop', { persona: p }))
// Search empty-state
manifest.push(await capture(browser, { id: 'search', path: '/search?q=zzzznomatch9999' }, 'desktop', { label: 'search-empty__desktop' }))
await browser.close()

writeFileSync(`${OUT}/_manifest.json`, JSON.stringify({ generatedRoutes: ROUTES, viewports: VIEWPORTS, cells: manifest }, null, 2))
const totC = manifest.reduce((a, m) => a + (m.axeSummary?.critical || 0), 0)
const totS = manifest.reduce((a, m) => a + (m.axeSummary?.serious || 0), 0)
const errs = manifest.filter((m) => m.error).length
console.log(`\n=== DONE: ${manifest.length} cells | axe critical:${totC} serious:${totS} | capture-errors:${errs} | evidence: ${OUT}`)
