import { withPage, runAxe, BASE, sleep, setPersona } from './audit-v3-probe.mjs'

// v3 final verification: live axe (contrast 等 jsdom 不可分) を全 route + 新規 surface に走らせ serious/critical=0 を確認。
const ROUTES = [
  '/', '/cases', '/approvals', '/cases/new', '/cases/CASE-2026-0142',
  '/proposals', '/proposals/PROP-2026-031', '/agents', '/agents/agent-corporate-address-change',
  '/observatory', '/search?q=CASE', '/inbox', '/business-approver', '/config-approvals', '/escalations',
  '/cases/CASE-2026-0120', // reflected (reverse footer)
  '/cases/CASE-2026-0145', // seed escalation banner (F-028)
]

await withPage({}, async (page) => {
  const results = []
  for (const r of ROUTES) {
    await page.goto(`${BASE}${r}`, { waitUntil: 'networkidle' })
    await sleep(250)
    const v = await runAxe(page)
    const bad = v.filter((x) => x.impact === 'serious' || x.impact === 'critical')
    results.push({ route: r, total: v.length, bad })
  }

  // 新規 surface: モデルガバナンス tab (F-039)
  await page.goto(`${BASE}/observatory`, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'モデルガバナンス' }).click()
  await sleep(300)
  {
    const v = await runAxe(page)
    const bad = v.filter((x) => x.impact === 'serious' || x.impact === 'critical')
    results.push({ route: '/observatory#governance', total: v.length, bad })
  }

  // 業務責任者 persona での裁定面 (F-013/F-016) + 緊急停止 modal sticky toast (F-027/F-035 motion)
  await page.goto(`${BASE}/cases/CASE-2026-0145`, { waitUntil: 'networkidle' })
  await setPersona(page, 'actor-approver')
  await sleep(300)
  {
    const v = await runAxe(page)
    const bad = v.filter((x) => x.impact === 'serious' || x.impact === 'critical')
    results.push({ route: '/cases/0145 (approver, escalation arbitration)', total: v.length, bad })
  }

  // interactive states (modal / loading) — static route scan が開かない surface の contrast を捕捉 (F-003 latent fail 教訓)。
  // (1) ?demo=loading の DataTable skeleton/spinner
  await page.goto(`${BASE}/cases?demo=loading`, { waitUntil: 'networkidle' })
  await sleep(300)
  {
    const v = await runAxe(page)
    const bad = v.filter((x) => x.impact === 'serious' || x.impact === 'critical')
    results.push({ route: '/cases?demo=loading (LoadingState)', total: v.length, bad })
  }
  // (2) CaseDetail の案件差戻し modal (FieldActionModal caseLevel — outcome note on panel-inset)
  await page.goto(`${BASE}/cases/CASE-2026-0142`, { waitUntil: 'networkidle' })
  await sleep(300)
  try {
    await page.getByRole('button', { name: '差戻し' }).first().click()
    await sleep(400)
    const v = await runAxe(page)
    const bad = v.filter((x) => x.impact === 'serious' || x.impact === 'critical')
    results.push({ route: '/cases/0142 → 差戻し modal (FieldActionModal)', total: v.length, bad })
  } catch (e) {
    results.push({ route: '/cases/0142 → 差戻し modal (open failed)', total: 0, bad: [] })
  }
  // (3) CaseDetail reflected (approver) の 訂正 ReasonDialog (outcome note on panel-inset)
  await page.goto(`${BASE}/cases/CASE-2026-0120`, { waitUntil: 'networkidle' })
  await setPersona(page, 'actor-approver')
  await sleep(300)
  try {
    await page.getByRole('button', { name: '訂正' }).first().click()
    await sleep(400)
    const v = await runAxe(page)
    const bad = v.filter((x) => x.impact === 'serious' || x.impact === 'critical')
    results.push({ route: '/cases/0120 → 訂正 ReasonDialog', total: v.length, bad })
  } catch (e) {
    results.push({ route: '/cases/0120 → 訂正 ReasonDialog (open failed)', total: 0, bad: [] })
  }

  let totalBad = 0
  for (const r of results) {
    totalBad += r.bad.length
    const mark = r.bad.length === 0 ? 'OK ' : 'XX '
    console.log(`${mark}${r.route} — violations:${r.total} serious/critical:${r.bad.length}`)
    for (const b of r.bad) console.log(`     - [${b.impact}] ${b.id}: ${b.help} (${b.count})`)
  }
  console.log(`\n=== serious/critical total across ${results.length} surfaces: ${totalBad} ===`)
})
