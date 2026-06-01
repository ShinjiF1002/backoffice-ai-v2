import { withPage, BASE } from '/Users/shinjifujiwara/code/active/backoffice-ai-v2/prototype-redesign/audit-v3-probe.mjs'

const out = {}
await withPage({}, async (page) => {
  // Hub banner white/85 contrast
  await page.goto(BASE + '/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(400)
  out.hubBanner = await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll('.text-white\\/85'))
    return els.map((e) => {
      const cs = getComputedStyle(e)
      let bgEl = e, bg = ''
      while (bgEl) { const b = getComputedStyle(bgEl).backgroundColor; if (b && b !== 'rgba(0, 0, 0, 0)') { bg = b; break } bgEl = bgEl.parentElement }
      return { text: e.textContent.slice(0, 24), color: cs.color, bg, fontSize: cs.fontSize, fontWeight: cs.fontWeight }
    })
  })

  // Stepper mobile @375 — measure ol bounding & whether it overflows / wraps
  await page.setViewportSize({ width: 375, height: 800 })
  await page.goto(BASE + '/cases/CASE-2026-0142', { waitUntil: 'networkidle' })
  await page.waitForTimeout(500)
  out.stepper = await page.evaluate(() => {
    const ol = document.querySelector('ol[aria-label="案件の進行状況"]')
    if (!ol) return { found: false }
    const r = ol.getBoundingClientRect()
    const parent = ol.parentElement.getBoundingClientRect()
    // gather step label spans (text-xs labels)
    const lis = Array.from(ol.querySelectorAll('li'))
    const items = lis.map((li) => {
      const lblSpan = li.querySelector('.flex.flex-col span')
      const rr = lblSpan ? lblSpan.getBoundingClientRect() : null
      return lblSpan ? { text: lblSpan.textContent.trim(), left: Math.round(rr.left), right: Math.round(rr.right), w: Math.round(rr.width) } : null
    }).filter(Boolean)
    // detect overlap: any label's left < previous label's right
    let overlaps = []
    for (let i = 1; i < items.length; i++) {
      if (items[i].left < items[i-1].right) overlaps.push([items[i-1].text, items[i].text])
    }
    return { found: true, olWidth: Math.round(r.width), olRight: Math.round(r.right), parentWidth: Math.round(parent.width), viewportClip: r.right > 375, scrollW: ol.scrollWidth, clientW: ol.clientWidth, overflowsContent: ol.scrollWidth > ol.clientWidth + 1, items, overlaps }
  })
  await page.locator('ol[aria-label="案件の進行状況"]').screenshot({ path: '/Users/shinjifujiwara/code/active/backoffice-ai-v2/prototype-redesign/probes/L5-stepper-375.png' }).catch(() => {})

  // focus-visible check on key interactive elements (keyboard ring present?)
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto(BASE + '/cases', { waitUntil: 'networkidle' })
  await page.waitForTimeout(300)
  await page.keyboard.press('Tab')
  await page.keyboard.press('Tab')
  out.focusRing = await page.evaluate(() => {
    const el = document.activeElement
    if (!el) return null
    const cs = getComputedStyle(el)
    return { tag: el.tagName, label: (el.textContent || el.getAttribute('aria-label') || '').slice(0, 24), outline: cs.outlineWidth + ' ' + cs.outlineStyle + ' ' + cs.outlineColor, boxShadow: cs.boxShadow.slice(0, 40) }
  })

  // DataTable sortable header — keyboard operable & aria-sort?
  out.tableSort = await page.evaluate(() => {
    const ths = Array.from(document.querySelectorAll('th'))
    return ths.map((th) => ({ text: (th.textContent || '').trim().slice(0, 12), ariaSort: th.getAttribute('aria-sort'), hasButton: !!th.querySelector('button'), role: th.getAttribute('role'), tabindex: th.getAttribute('tabindex') })).slice(0, 8)
  })
})
console.log(JSON.stringify(out, null, 2))
