import { withPage, setPersona, PERSONAS, BASE, sleep } from '/Users/shinjifujiwara/code/active/backoffice-ai-v2/prototype-redesign/audit-v3-probe.mjs'
import { mkdirSync } from 'node:fs'

const OUT = '/tmp/bo-v3-audit/probes/cases-id'
mkdirSync(OUT, { recursive: true })

const footerSnapshot = (page) => page.evaluate(() => {
  const footer = document.querySelector('footer')
  const btns = footer ? [...footer.querySelectorAll('button')].map((b) => ({
    label: b.textContent.trim(),
    disabled: b.disabled,
  })) : []
  const msg = footer ? (footer.querySelector('div')?.textContent || '').trim() : ''
  // ReconcilePanel readiness banner anywhere in body
  const readyBanner = [...document.querySelectorAll('div')].map((d) => d.textContent.trim())
    .filter((t) => t.includes('承認できます') || t.includes('確認が必要な項目はありません'))
  // reversal banner
  const revBanner = [...document.querySelectorAll('div')].map((d) => d.textContent.trim())
    .filter((t) => t.includes('反映済から') && (t.includes('訂正') || t.includes('取消')))
  // lifecycle steps
  const steps = [...document.querySelectorAll('ol[aria-label="案件の進行状況"] li')].map((li) => {
    const label = li.querySelector('span.text-xs')?.textContent.trim() || ''
    const time = li.querySelector('span.font-mono')?.textContent.trim() || ''
    const hasCheck = !!li.querySelector('svg')
    return { label, time, hasCheck }
  })
  const statusBadge = document.querySelector('header [class*="StatusBadge"], header span')?.textContent || ''
  const headerBadges = [...document.querySelectorAll('header span')].map((s) => s.textContent.trim()).filter(Boolean)
  return { btns, msg, readyBanner, revBanner, steps, headerBadges }
})

await withPage({}, async (page) => {
  const result = {}

  // ===== F-041: inputter approves a ready case → disabled approve残存 + no forward導線 =====
  await page.goto(BASE + '/cases/CASE-2026-0139', { waitUntil: 'networkidle' })
  await setPersona(page, PERSONAS.inputter)
  await sleep(300)
  result.f041_before = await footerSnapshot(page)
  await page.screenshot({ path: `${OUT}/f041-01-before.png` })
  // click 承認 (input mode, ready, flags=0 → should be enabled)
  const approveBtn = page.locator('footer button', { hasText: /^承認$/ }).last()
  const approveDisabledBefore = await approveBtn.isDisabled().catch(() => 'no-btn')
  await approveBtn.click({ timeout: 3000 }).catch((e) => { result.f041_approveClickErr = String(e).slice(0, 120) })
  await sleep(600)
  result.f041_approveDisabledBefore = approveDisabledBefore
  result.f041_after = await footerSnapshot(page)
  await page.screenshot({ path: `${OUT}/f041-02-after-approve.png` })
  // is there a forward-looking 承認者待ち導線? check for link to /approvals or text 承認者...待ち that is a CTA
  result.f041_forwardCue = await page.evaluate(() => {
    const links = [...document.querySelectorAll('footer a, main a')].map((a) => ({ text: a.textContent.trim(), href: a.getAttribute('href') }))
    const waitText = [...document.querySelectorAll('footer *')].map((e) => e.textContent.trim()).filter((t) => t.includes('承認者') && t.includes('待ち'))
    return { links, waitText }
  })

  // ===== F-018: reversal on a reflected case (checker) → who/when, dead-end, 承認できます誤誘導 =====
  await page.goto(BASE + '/cases/CASE-2026-0120', { waitUntil: 'networkidle' })
  await setPersona(page, PERSONAS.checker)
  await sleep(300)
  result.f018_reflected = await footerSnapshot(page)
  await page.screenshot({ path: `${OUT}/f018-01-reflected.png` })
  // footer should show 訂正/取消 buttons (reverseGate.allowed)
  const teiseiBtn = page.locator('footer button', { hasText: /訂正/ })
  result.f018_hasReverseButtons = (await teiseiBtn.count()) > 0
  // click 訂正 → ReasonDialog
  if (result.f018_hasReverseButtons) {
    await teiseiBtn.click()
    await sleep(350)
    result.f018_dialogOpen = (await page.locator('[role="dialog"]').count()) > 0
    // fill reason and submit
    const ta = page.locator('[role="dialog"] textarea, [role="dialog"] input[type="text"]').first()
    await ta.fill('ビル名の誤りを訂正します（監査検証）').catch(() => {})
    await sleep(150)
    const submitBtn = page.locator('[role="dialog"] button', { hasText: /訂正のため差し戻す|差し戻す|訂正/ }).last()
    await submitBtn.click().catch((e) => { result.f018_submitErr = String(e).slice(0, 120) })
    await sleep(700)
  }
  result.f018_afterReverse = await footerSnapshot(page)
  await page.screenshot({ path: `${OUT}/f018-02-after-reverse.png` })
  // reversal banner: does it show who / when?
  result.f018_reversalBannerText = await page.evaluate(() => {
    const cands = [...document.querySelectorAll('div')].map((d) => d.textContent.trim())
      .filter((t) => t.includes('反映済から') && t.length < 200)
    return cands[0] || null
  })
  // who/when heuristics: does banner mention an actor name or a timestamp/date?
  result.f018_bannerMentionsActor = await page.evaluate(() => {
    const banner = [...document.querySelectorAll('div')].find((d) => /反映済から(訂正|取消)されました/.test(d.textContent))
    if (!banner) return null
    const t = banner.textContent
    const actors = ['山田太郎', '鈴木課長', '田中部長', '佐藤花子', '高橋']
    const hasActor = actors.some((a) => t.includes(a))
    const hasTime = /\d{4}|\d{1,2}:\d{2}|\d{1,2}月|\d{1,2}\/\d{1,2}|完了|時|分/.test(t)
    return { text: t.slice(0, 220), hasActor, hasTime }
  })
  // dead-end: after reversed→sent-back, are both footer buttons disabled and 承認できます shown in ReconcilePanel?
  result.f018_footerAfter = await footerSnapshot(page)
  // sent-back→ready re-process action present?
  result.f018_reprocessAction = await page.evaluate(() => {
    const all = [...document.querySelectorAll('button, a')].map((e) => e.textContent.trim())
    return all.filter((t) => t.includes('再処理') || t.includes('再度') || t.includes('確認待ちへ') || t.includes('ready'))
  })

  // ===== F-018 secondary: check reversal record persisted in store (who/when via window state if exposed) =====
  result.f018_storeReversal = await page.evaluate(() => {
    // attempt to read persisted store from localStorage
    try {
      const keys = Object.keys(localStorage)
      const storeKey = keys.find((k) => /store|backoffice|bo-/.test(k))
      if (!storeKey) return { keys }
      const raw = JSON.parse(localStorage.getItem(storeKey))
      const c = raw?.cases?.['CASE-2026-0120'] || raw?.state?.cases?.['CASE-2026-0120']
      return { storeKey, reversal: c?.reversal ?? null, status: c?.status ?? null }
    } catch (e) { return { err: String(e).slice(0, 120) } }
  })

  console.log(JSON.stringify(result, null, 2))
})
