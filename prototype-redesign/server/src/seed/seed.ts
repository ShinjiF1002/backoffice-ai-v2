import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Db } from '../db/connection.js'

type Row = Record<string, string | number | null>

export interface SeedData {
  meta: { sourceCardinalities: Record<string, number> }
  demo_clock: { now_iso: string }
  workflows: { id: string; name: string; display_order: number }[]
  roles: { id: string; label: string }[]
  actors: { id: string; name: string; role_id: string }[]
  cases: Array<{
    id: string
    workflow_id: string
    status: string
    assignee_name: string | null
    flags: number
    origin: string
    input_approved_by: string | null
    sendback_reason: string | null
    sendback_category: string | null
    reversal_kind: string | null
    reversal_reason: string | null
    received_at: string
  }>
  case_fields: Row[]
  case_documents: Array<{ case_id: string; file_name: string; page: string; page_count: number; title: string }>
  case_document_rows: Array<{
    case_id: string
    row_order: number
    label: string
    value: string
    field_label: string | null
    highlight: number
  }>
  lifecycle_events: Array<{
    case_id: string
    step_order: number
    step: string
    time_label: string
    actor: string
    detail: string
    done: number
    is_current: number
  }>
  agents: Row[]
  agent_samples: Array<{ agent_id: string; case_id: string; outcome: string; tone: string; note: string; kpi: string }>
  proposals: Row[]
  proposal_source_cases: Array<{ proposal_id: string; case_id: string; field: string; comment: string; observed_date: string }>
  governance_model_inventory: Row[]
  drift_monitors: Row[]
  escalations: Array<{
    case_id: string
    reason: string
    category: string
    escalated_to: string
    escalated_from: string | null
    resolution: string | null
  }>
  synthetic_metric_rows: Array<{
    workflow_id: string
    metric_label: string
    actual_value: string
    threshold: string
    achieved: number
    denominator: string
    exclusions: string | null
    period: string
  }>
  historical_cases: Array<{
    id: string
    workflow_id: string
    status: string
    owner_name: string
    received_at: string
    history_note: string
  }>
}

let cached: SeedData | null = null

/** Load the committed, source-derived seed fixture (server/src/seed/seed-data.generated.json). */
export function loadSeedData(): SeedData {
  if (!cached) {
    const here = path.dirname(fileURLToPath(import.meta.url))
    cached = JSON.parse(fs.readFileSync(path.join(here, 'seed-data.generated.json'), 'utf8')) as SeedData
  }
  return cached
}

/**
 * Idempotent demo seed (contract 06 §契約2). Inserts the full fixture in FK order inside one
 * transaction. Re-running on an already-seeded DB is a NO-OP (returns seeded:false) — no duplicate
 * rows. seed never writes audit_events / notifications_read_state (those start empty).
 */
export function seedDemo(db: Db, data: SeedData = loadSeedData()): { seeded: boolean } {
  const existing = (db.prepare('SELECT COUNT(*) AS c FROM cases').get() as { c: number }).c
  if (existing > 0) return { seeded: false }

  const run = db.transaction(() => {
    db.prepare('INSERT INTO demo_clock (id, now_iso) VALUES (1, ?)').run(data.demo_clock.now_iso)

    for (const w of data.workflows)
      db.prepare('INSERT INTO workflows (id,name,display_order) VALUES (@id,@name,@display_order)').run(w)
    for (const r of data.roles) db.prepare('INSERT INTO roles (id,label) VALUES (@id,@label)').run(r)
    for (const a of data.actors) db.prepare('INSERT INTO actors (id,name,role_id) VALUES (@id,@name,@role_id)').run(a)

    for (const c of data.cases)
      db.prepare(
        `INSERT INTO cases (id,workflow_id,status,assignee_name,flags,origin,input_approved_by,
           sendback_reason,sendback_category,reversal_kind,reversal_reason,received_at)
         VALUES (@id,@workflow_id,@status,@assignee_name,@flags,@origin,@input_approved_by,
           @sendback_reason,@sendback_category,@reversal_kind,@reversal_reason,@received_at)`,
      ).run(c)

    for (const f of data.case_fields)
      db.prepare(
        `INSERT INTO case_fields (case_id,field_label,ai_value,master_value,previous_value,human_value,
           reconcile_state,resolved,confidence_milli)
         VALUES (@case_id,@field_label,@ai_value,@master_value,@previous_value,@human_value,
           @reconcile_state,@resolved,@confidence_milli)`,
      ).run(f)

    const docIdByCase: Record<string, number> = {}
    for (const d of data.case_documents) {
      const res = db
        .prepare('INSERT INTO case_documents (case_id,file_name,page,page_count,title) VALUES (@case_id,@file_name,@page,@page_count,@title)')
        .run(d)
      docIdByCase[d.case_id] = Number(res.lastInsertRowid)
    }
    for (const row of data.case_document_rows) {
      const docId = docIdByCase[row.case_id]
      if (docId === undefined) throw new Error(`seed: no case_documents row for case ${row.case_id}`)
      db.prepare(
        'INSERT INTO case_document_rows (document_id,row_order,label,value,field_label,highlight) VALUES (?,?,?,?,?,?)',
      ).run(docId, row.row_order, row.label, row.value, row.field_label, row.highlight)
    }

    for (const e of data.lifecycle_events)
      db.prepare(
        'INSERT INTO lifecycle_events (case_id,step_order,step,time_label,actor,detail,done,is_current) VALUES (@case_id,@step_order,@step,@time_label,@actor,@detail,@done,@is_current)',
      ).run(e)

    for (const a of data.agents)
      db.prepare(
        `INSERT INTO agents (id,workflow_id,trust,promotion_status,promotion_requested_by,
           promotion_sendback_reason,paused,paused_reason,trust_before_pause)
         VALUES (@id,@workflow_id,@trust,@promotion_status,@promotion_requested_by,
           @promotion_sendback_reason,@paused,@paused_reason,@trust_before_pause)`,
      ).run(a)

    for (const s of data.agent_samples)
      db.prepare('INSERT INTO agent_samples (agent_id,case_id,outcome,tone,note,kpi) VALUES (@agent_id,@case_id,@outcome,@tone,@note,@kpi)').run(s)

    for (const p of data.proposals)
      db.prepare(
        `INSERT INTO proposals (id,workflow_id,status,agent_id,forwarded_by,decision_kind,
           decision_reason,decision_category,change_area,impact_count)
         VALUES (@id,@workflow_id,@status,@agent_id,@forwarded_by,@decision_kind,
           @decision_reason,@decision_category,@change_area,@impact_count)`,
      ).run(p)

    for (const sc of data.proposal_source_cases)
      db.prepare('INSERT INTO proposal_source_cases (proposal_id,case_id,field,comment,observed_date) VALUES (@proposal_id,@case_id,@field,@comment,@observed_date)').run(sc)

    for (const m of data.governance_model_inventory)
      db.prepare(
        'INSERT INTO governance_model_inventory (agent_id,process,model,version,purpose,owner,validation,last_validated,scope) VALUES (@agent_id,@process,@model,@version,@purpose,@owner,@validation,@last_validated,@scope)',
      ).run(m)

    for (const d of data.drift_monitors)
      db.prepare('INSERT INTO drift_monitors (workflow_id,metric,value,threshold,status) VALUES (@workflow_id,@metric,@value,@threshold,@status)').run(d)

    for (const e of data.escalations)
      db.prepare('INSERT INTO escalations (case_id,reason,category,escalated_to,escalated_from,resolution) VALUES (@case_id,@reason,@category,@escalated_to,@escalated_from,@resolution)').run(e)

    for (const m of data.synthetic_metric_rows)
      db.prepare(
        'INSERT INTO synthetic_metric_rows (workflow_id,metric_label,actual_value,threshold,achieved,denominator,exclusions,period) VALUES (@workflow_id,@metric_label,@actual_value,@threshold,@achieved,@denominator,@exclusions,@period)',
      ).run(m)

    for (const h of data.historical_cases)
      db.prepare('INSERT INTO historical_cases (id,workflow_id,status,owner_name,received_at,history_note) VALUES (@id,@workflow_id,@status,@owner_name,@received_at,@history_note)').run(h)
  })

  run()
  return { seeded: true }
}
