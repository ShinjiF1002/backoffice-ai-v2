import { withPage, runAxe, BASE, sleep } from '/Users/shinjifujiwara/code/active/backoffice-ai-v2/prototype-redesign/audit-v3-probe.mjs'

const out = {}

await withPage({}, async (page) => {
  await page.goto(BASE + '/business-approver', { waitUntil: 'networkidle' })
  await sleep(400)

  // ── Card inventory: label, count, cta, href, computed accessible name, DOM order ──
  out.cards = await page.evaluate(() => {
    const main = document.querySelector('main') || document.body
    // hub cards are <a> inside the grid (not sidebar). Find links to /config-approvals or /escalations within main content grid
    const grid = [...document.querySelectorAll('div.grid')].find((g) => g.querySelector('a[href]'))
    const links = grid ? [...grid.querySelectorAll('a[href]')] : []
    return links.map((a) => {
      const spans = [...a.querySelectorAll('span')].map((s) => (s.textContent || '').trim()).filter(Boolean)
      return {
        href: a.getAttribute('href'),
        ariaLabel: a.getAttribute('aria-label'),
        accName: (a.textContent || '').replace(/\s+/g, ' ').trim(),
        spanOrder: spans,
        ctaText: spans[spans.length - 1] || null,
      }
    })
  })

  // ── Header total text ──
  out.headerText = await page.evaluate(() => {
    const h = document.querySelector('[data-page-header]')
    return h ? (h.textContent || '').replace(/\s+/g, ' ').trim() : null
  })

  // ── Duplicate accessible name "設定承認" across full page (sidebar + card) ──
  out.dupSettei = await page.evaluate(() => {
    const matches = []
    document.querySelectorAll('a[href]').forEach((a) => {
      const t = (a.textContent || '').replace(/\s+/g, ' ').trim()
      // 設定承認 appears as full accessible name (sidebar) or as substring of card
      if (t === '設定承認' || /^設定承認/.test(t) || /設定承認/.test(t)) {
        matches.push({ href: a.getAttribute('href'), name: t })
      }
    })
    return matches
  })

  // exact-name "設定承認" links (collision per WCAG 4.1.2 = same name same role different destination/context)
  out.exactSettei = out.dupSettei.filter((m) => m.name === '設定承認')

  // ── Navigate: click 手順承認 card and observe landing H1 ──
  // find the 手順承認 card link
  const proposalCard = page.locator('div.grid a[href="/config-approvals"]').first()
  out.proposalCardExists = (await proposalCard.count()) > 0
  if (out.proposalCardExists) {
    await proposalCard.click()
    await page.waitForLoadState('networkidle')
    await sleep(300)
    out.afterUrl = page.url()
    out.afterH1 = await page.evaluate(() => {
      const h1 = document.querySelector('h1')
      return h1 ? (h1.textContent || '').trim() : null
    })
    out.afterHeader = await page.evaluate(() => {
      const h = document.querySelector('[data-page-header]')
      return h ? (h.textContent || '').replace(/\s+/g, ' ').trim() : null
    })
  }

  out.axe = await runAxe(page)
})

console.log(JSON.stringify(out, null, 2))
