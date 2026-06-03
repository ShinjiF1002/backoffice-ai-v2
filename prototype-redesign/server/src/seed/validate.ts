import type { Db } from '../db/connection.js'
import { loadSeedData, type SeedData } from './seed.js'

const TZ_ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/
const LIFECYCLE_AI_STEPS = ['受付', 'AI処理', '入力者確認', '承認者承認', '反映']

function count(db: Db, table: string): number {
  return (db.prepare(`SELECT COUNT(*) AS c FROM ${table}`).get() as { c: number }).c
}

/**
 * seed:validate (contract 06 §契約2 / 08 / prompt PR3) — fail-fast parity + integrity gate.
 * Counts are re-derived from the source-derived seed arrays (no hand-typed literals). Returns
 * the full error list (empty = pass) so callers can assert green and tests can name each failure.
 */
export function validateSeed(db: Db, data: SeedData = loadSeedData()): { ok: boolean; errors: string[] } {
  const errors: string[] = []
  const fail = (msg: string): void => {
    errors.push(msg)
  }

  // (1) cardinality: every table count === its source-derived array length
  const tableArrays: [string, number][] = [
    ['workflows', data.workflows.length],
    ['roles', data.roles.length],
    ['actors', data.actors.length],
    ['cases', data.cases.length],
    ['case_fields', data.case_fields.length],
    ['case_documents', data.case_documents.length],
    ['case_document_rows', data.case_document_rows.length],
    ['lifecycle_events', data.lifecycle_events.length],
    ['agents', data.agents.length],
    ['agent_samples', data.agent_samples.length],
    ['proposals', data.proposals.length],
    ['proposal_source_cases', data.proposal_source_cases.length],
    ['governance_model_inventory', data.governance_model_inventory.length],
    ['drift_monitors', data.drift_monitors.length],
    ['escalations', data.escalations.length],
    ['synthetic_metric_rows', data.synthetic_metric_rows.length],
    ['historical_cases', data.historical_cases.length],
  ]
  for (const [table, expected] of tableArrays) {
    const actual = count(db, table)
    if (actual !== expected) fail(`cardinality: ${table} = ${actual}, expected ${expected} (source.length)`)
  }
  // append-only / read-state tables start empty
  if (count(db, 'audit_events') !== 0) fail('audit_events must be empty after seed (session log starts empty)')
  if (count(db, 'notifications_read_state') !== 0) fail('notifications_read_state must be empty after seed')

  // (2) 5 workflowId coverage
  const workflowIds = (db.prepare('SELECT id FROM workflows').all() as { id: string }[]).map((r) => r.id)
  for (const id of ['UC-BO-01', 'UC-BO-02', 'UC-BO-03', 'UC-BO-04', 'UC-BO-05'])
    if (!workflowIds.includes(id)) fail(`workflows missing ${id}`)

  // (3) CASE_DETAILS 相互参照: every seeded case has fields, a document, and lifecycle rows
  const caseIds = (db.prepare('SELECT id FROM cases').all() as { id: string }[]).map((r) => r.id)
  for (const cid of caseIds) {
    if (count(db, `case_fields WHERE case_id = '${cid}'`) === 0) fail(`case ${cid} has no case_fields`)
    const docs = db.prepare('SELECT id FROM case_documents WHERE case_id = ?').all(cid) as { id: number }[]
    if (docs.length !== 1) fail(`case ${cid} must have exactly 1 case_documents row (has ${docs.length})`)
    if (count(db, `lifecycle_events WHERE case_id = '${cid}'`) === 0) fail(`case ${cid} has no lifecycle_events`)
  }

  // (4) KPI 分母不変: UC-BO-02 AI 入力承認率 denominator pins 980
  const uc02 = db
    .prepare("SELECT denominator FROM synthetic_metric_rows WHERE workflow_id = 'UC-BO-02' AND metric_label = 'AI 入力承認率'")
    .get() as { denominator: string } | undefined
  if (!uc02 || !uc02.denominator.includes('980'))
    fail(`UC-BO-02 AI 入力承認率 denominator must contain 980 (got ${uc02?.denominator ?? 'none'})`)

  // (5) proposal.sourceCases ∈ (cases ∪ historical_cases)
  const histIds = (db.prepare('SELECT id FROM historical_cases').all() as { id: string }[]).map((r) => r.id)
  const universe = new Set([...caseIds, ...histIds])
  for (const row of db.prepare('SELECT case_id FROM proposal_source_cases').all() as { case_id: string }[])
    if (!universe.has(row.case_id)) fail(`proposal_source_cases.case_id ${row.case_id} not in cases ∪ historical_cases`)

  // (6) lifecycle state 整合: every reflected case carries the 5-step AI lifecycle in order, all done
  for (const cid of caseIds) {
    const status = (db.prepare('SELECT status FROM cases WHERE id = ?').get(cid) as { status: string }).status
    if (status !== 'reflected') continue
    const steps = db
      .prepare('SELECT step, done FROM lifecycle_events WHERE case_id = ? ORDER BY step_order')
      .all(cid) as { step: string; done: number }[]
    const labels = steps.map((s) => s.step)
    if (labels.join('>') !== LIFECYCLE_AI_STEPS.join('>'))
      fail(`reflected case ${cid} lifecycle = [${labels.join(',')}], expected [${LIFECYCLE_AI_STEPS.join(',')}]`)
    if (steps.some((s) => s.done !== 1)) fail(`reflected case ${cid} has non-done lifecycle steps`)
  }

  // (7) SoD actor 整合: baw cases have an actor input_approved_by; escalation actors exist
  const actorIds = new Set((db.prepare('SELECT id FROM actors').all() as { id: string }[]).map((r) => r.id))
  for (const c of db.prepare("SELECT id, input_approved_by FROM cases WHERE status = 'business-approval-waiting'").all() as {
    id: string
    input_approved_by: string | null
  }[]) {
    if (!c.input_approved_by || !actorIds.has(c.input_approved_by))
      fail(`baw case ${c.id} must have an actor input_approved_by (got ${c.input_approved_by ?? 'null'})`)
  }
  for (const e of db.prepare('SELECT case_id, escalated_to, escalated_from FROM escalations').all() as {
    case_id: string
    escalated_to: string
    escalated_from: string
  }[]) {
    if (!actorIds.has(e.escalated_to)) fail(`escalation ${e.case_id} escalated_to ${e.escalated_to} not an actor`)
    if (!actorIds.has(e.escalated_from)) fail(`escalation ${e.case_id} escalated_from ${e.escalated_from} not an actor`)
  }

  // (8) origin='manual' honesty: a manual case must NOT carry an AI処理 lifecycle step
  for (const c of db.prepare("SELECT id FROM cases WHERE origin = 'manual'").all() as { id: string }[]) {
    const hasAi = db.prepare("SELECT 1 FROM lifecycle_events WHERE case_id = ? AND step = 'AI処理'").get(c.id)
    if (hasAi) fail(`manual case ${c.id} fabricates an AI処理 lifecycle step (honesty violation)`)
  }

  // (9) timestamps: received_at (cases + historical) + demo_clock are full tz-ISO, never future, never date-only
  if (!TZ_ISO.test(data.demo_clock.now_iso)) fail(`demo_clock.now_iso not tz-ISO: ${data.demo_clock.now_iso}`)
  const nowMs = Date.parse(data.demo_clock.now_iso)
  const dated = [
    ...(db.prepare('SELECT id, received_at FROM cases').all() as { id: string; received_at: string }[]),
    ...(db.prepare('SELECT id, received_at FROM historical_cases').all() as { id: string; received_at: string }[]),
  ]
  for (const r of dated) {
    if (!TZ_ISO.test(r.received_at)) fail(`case ${r.id} received_at not tz-ISO (date-only parse risk): ${r.received_at}`)
    else if (Date.parse(r.received_at) > nowMs) fail(`case ${r.id} received_at is in the future: ${r.received_at}`)
  }

  // (10) verification-only fixtures (CASE-VRF-) must not be in the business universe
  for (const cid of caseIds) if (cid.startsWith('CASE-VRF-')) fail(`verification fixture ${cid} leaked into cases`)

  // (11) cases ∩ historical_cases id space disjoint
  for (const cid of caseIds) if (histIds.includes(cid)) fail(`id ${cid} is in both cases and historical_cases`)

  return { ok: errors.length === 0, errors }
}
