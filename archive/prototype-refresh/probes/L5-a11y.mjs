import { withPage, runAxe, BASE, setPersona } from '/Users/shinjifujiwara/code/active/backoffice-ai-v2/prototype-redesign/audit-v3-probe.mjs'

// L5-a11y deep verification: computed contrast ratios, target-size, duplicate labels, stepper overlap, focus.
const out = {}

await withPage({}, async (page) => {
  // ---- 1. computed contrast for the 3 systemic chrome failures on /observatory ----
  await page.goto(BASE + '/observatory', { waitUntil: 'networkidle' })
  await page.waitForTimeout(400)

  const computeContrast = async (sel) => {
    return await page.evaluate((s) => {
      const el = document.querySelector(s)
      if (!el) return { sel: s, found: false }
      const cs = getComputedStyle(el)
      // walk up for effective bg
      let bgEl = el, bg = 'rgba(0, 0, 0, 0)'
      while (bgEl) {
        const b = getComputedStyle(bgEl).backgroundColor
        if (b && b !== 'rgba(0, 0, 0, 0)' && b !== 'transparent') { bg = b; break }
        bgEl = bgEl.parentElement
      }
      return { sel: s, found: true, color: cs.color, bg, fontSize: cs.fontSize, fontWeight: cs.fontWeight, text: el.textContent.slice(0, 30) }
    }, sel)
  }
  out.observatoryContrast = []
  for (const sel of [
    'a[aria-current="page"] .truncate.flex-1',
    'span.sm\\:inline',
    'a[href^="/cases/CASE"]',
    'span.bg-\\[var\\(--color-primary-soft\\)\\]',
  ]) {
    out.observatoryContrast.push(await computeContrast(sel))
  }

  // ---- 2. target-size audit (WCAG 2.2 2.5.8 = 24x24 min; AAA 44; check interactive controls) ----
  out.smallTargets = await page.evaluate(() => {
    const res = []
    const els = document.querySelectorAll('button, a[href], [role="button"], input[type="checkbox"], input[type="radio"]')
    els.forEach((el) => {
      const r = el.getBoundingClientRect()
      if (r.width === 0 || r.height === 0) return
      if (r.width < 24 || r.height < 24) {
        res.push({ tag: el.tagName, w: Math.round(r.width), h: Math.round(r.height), label: (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 30) })
      }
    })
    return res.slice(0, 25)
  })

  // ---- 3. landmark structure ----
  out.landmarks = await page.evaluate(() => {
    const get = (s) => Array.from(document.querySelectorAll(s)).length
    return {
      main: get('main, [role="main"]'),
      nav: get('nav, [role="navigation"]'),
      banner: get('header[role="banner"], [role="banner"]'),
      h1: get('h1'),
      headerEls: get('header'),
    }
  })

  // ---- 4. duplicate accessible names (search input dup) ----
  await page.goto(BASE + '/search', { waitUntil: 'networkidle' })
  await page.waitForTimeout(300)
  out.searchDupLabels = await page.evaluate(() => {
    const inputs = Array.from(document.querySelectorAll('input'))
    return inputs.map((i) => ({ label: i.getAttribute('aria-label') || i.getAttribute('placeholder') || '', visible: i.offsetParent !== null, type: i.type }))
  })

  // ---- 5. LifecycleStepper mobile overlap on case detail @375 ----
  await page.setViewportSize({ width: 375, height: 800 })
  await page.goto(BASE + '/cases/CASE-2026-0142', { waitUntil: 'networkidle' })
  await page.waitForTimeout(400)
  out.stepperMobile = await page.evaluate(() => {
    // find stepper labels and check for overlap/clipping
    const candidates = Array.from(document.querySelectorAll('*')).filter((el) => /入力者|承認者|反映/.test(el.textContent || '') && el.children.length === 0)
    return candidates.slice(0, 6).map((el) => {
      const r = el.getBoundingClientRect()
      return { text: el.textContent.trim().slice(0, 16), w: Math.round(r.width), h: Math.round(r.height), overflow: getComputedStyle(el).overflow, ws: getComputedStyle(el).whiteSpace, fontSize: getComputedStyle(el).fontSize }
    })
  })
  await page.screenshot({ path: '/Users/shinjifujiwara/code/active/backoffice-ai-v2/prototype-redesign/probes/L5-stepper-mobile.png' })
  await page.setViewportSize({ width: 1440, height: 900 })

  // ---- 6. axe on a few key routes (confirm only color-contrast) ----
  out.axeByRoute = {}
  for (const r of ['/', '/cases', '/cases/new', '/inbox']) {
    await page.goto(BASE + r, { waitUntil: 'networkidle' })
    await page.waitForTimeout(300)
    const axe = await runAxe(page)
    out.axeByRoute[r] = (Array.isArray(axe) ? axe : []).map((v) => ({ id: v.id, impact: v.impact, nodes: (v.nodes || []).length }))
  }

  // ---- 7. CaseDraft form error: aria-live / describedby check ----
  await page.goto(BASE + '/cases/new', { waitUntil: 'networkidle' })
  await page.waitForTimeout(300)
  // click submit without filling
  const submit = page.getByRole('button', { name: /起票する/ })
  await submit.click().catch(() => {})
  await page.waitForTimeout(200)
  out.caseDraftError = await page.evaluate(() => {
    const errEls = Array.from(document.querySelectorAll('*')).filter((el) => /全項目を入力してください/.test(el.textContent || '') && el.children.length <= 2)
    const live = Array.from(document.querySelectorAll('[aria-live], [role="alert"], [role="status"]')).map((e) => ({ role: e.getAttribute('role'), live: e.getAttribute('aria-live'), text: (e.textContent || '').slice(0, 30) }))
    const invalidInputs = Array.from(document.querySelectorAll('[aria-invalid="true"]')).map((e) => ({ describedby: e.getAttribute('aria-describedby'), tag: e.tagName }))
    return { errPresent: errEls.length, liveRegions: live, invalidInputs }
  })
})

console.log(JSON.stringify(out, null, 2))
