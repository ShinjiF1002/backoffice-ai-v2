/**
 * seed-data generator (DEV TOOL — `npm run seed:gen`). Runs under tsx with the client @ alias
 * (tsconfig.gen.json) so it can import the LIVE fixtures, normalizes them to DB-row shape, and
 * writes server/src/seed/seed-data.generated.json (committed). The server runtime reads ONLY that
 * JSON — never client src — so `tsc -p server/tsconfig.server.json` stays decoupled (contract 07 §1).
 *
 * This is the contract-06 "同一 fixture を server seed スクリプトへ移植": the JSON IS the materialized
 * port of CASE_LIST/PROPOSAL_LIST/AGENT_LIST/etc. Cardinalities flow from source array lengths (no
 * hand-typed counts). Re-run after any client fixture change to refresh the JSON.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { seed } from '@/store/seed'
import { CASE_DETAILS } from '@/data/mock-case-detail'
import { PROPOSAL_LIST } from '@/data/mock-proposal-list'
import { PROPOSAL_DETAILS } from '@/data/mock-proposal-detail'
import { AGENT_LIST } from '@/data/mock-agent-list'
import { AGENT_DETAILS } from '@/data/mock-agent-detail'
import { MODEL_INVENTORY, DRIFT_MONITORS } from '@/data/mock-governance'
import { KPI_ROWS, KPI_PROCESS_LABEL, type KpiProcessKey } from '@/data/mock-kpi'
import { DEMO_ACTORS, roleLabel } from '@/store/actors'
import { NOW_ISO } from '@/lib/dates'

const NAME_TO_ID: Record<string, string> = Object.fromEntries(
  Object.entries(KPI_PROCESS_LABEL).map(([id, name]) => [name, id]),
)
const workflowIdFor = (name: string): string => NAME_TO_ID[name] ?? name
const milli = (c: number | undefined): number | null => (c === undefined ? null : Math.round(c * 1000))
const bit = (b: boolean | undefined): 0 | 1 => (b ? 1 : 0)

const state = seed()
const seededCaseIds = new Set(Object.keys(state.cases))

// ── workflows / roles / actors ──────────────────────────────────────────────
const workflows = Object.entries(KPI_PROCESS_LABEL).map(([id, name], i) => ({
  id,
  name,
  display_order: i + 1,
}))

const roles = [
  { id: 'inputter', label: roleLabel('inputter') },
  { id: 'checker', label: roleLabel('checker') },
  { id: 'business-approver', label: roleLabel('business-approver') },
  { id: 'governance', label: 'ガバナンス担当者' }, // net-new READ-ONLY role (P0 #2 ratified, not in client ActorRole)
]

const actors = [
  ...DEMO_ACTORS.map((a) => ({ id: a.id, name: a.name, role_id: a.role })),
  // ≥2 governance demo actors (net-new seed, names per contract 02). allowed_actors = 5.
  { id: 'actor-gov-legal', name: 'リーガル担当', role_id: 'governance' },
  { id: 'actor-gov-compliance', name: 'コンプラ担当', role_id: 'governance' },
]

// ── cases + children (from seed() state + CASE_DETAILS) ──────────────────────
const cases: unknown[] = []
const caseFields: unknown[] = []
const caseDocuments: unknown[] = []
const caseDocumentRows: unknown[] = []
const lifecycleEvents: unknown[] = []

for (const c of Object.values(state.cases)) {
  cases.push({
    id: c.id,
    workflow_id: c.workflowId,
    status: c.status,
    assignee_name: c.assignee ?? null,
    flags: c.flags,
    origin: 'ai', // seeded cases are all AI-originated (manual is only via case/create action)
    input_approved_by: c.inputApprovedBy ?? null,
    sendback_reason: c.sendback?.reason ?? null,
    sendback_category: c.sendback?.category ?? null,
    reversal_kind: c.reversal?.kind ?? null,
    reversal_reason: c.reversal?.reason ?? null,
    received_at: c.receivedAt,
  })

  const detail = CASE_DETAILS[c.id]
  if (!detail) throw new Error(`CASE_DETAILS missing for seeded case ${c.id}`)

  for (const f of detail.fields) {
    caseFields.push({
      case_id: c.id,
      field_label: f.fieldLabel,
      ai_value: f.aiValue ?? null,
      master_value: f.masterValue ?? null,
      previous_value: f.previousValue ?? null,
      human_value: f.humanValue ?? null,
      reconcile_state: f.reconcileState,
      resolved: 0, // seed resolvedFieldIds is empty (seed.ts)
      confidence_milli: milli(f.confidence),
    })
  }

  caseDocuments.push({
    case_id: c.id,
    file_name: detail.document.fileName,
    page: detail.document.page,
    page_count: detail.document.pageCount,
    title: detail.document.title,
  })
  detail.document.rows.forEach((r, i) => {
    caseDocumentRows.push({
      case_id: c.id,
      row_order: i,
      label: r.label,
      value: r.value,
      field_label: r.fieldLabel ?? null,
      highlight: bit(r.highlight),
    })
  })

  detail.lifecycle.forEach((e, i) => {
    lifecycleEvents.push({
      case_id: c.id,
      step_order: i,
      step: e.step,
      time_label: e.time,
      actor: e.actor,
      detail: e.detail,
      done: bit(e.done),
      is_current: bit(e.current),
    })
  })
}

// ── agents + samples ─────────────────────────────────────────────────────────
const agents = Object.values(state.agents).map((a) => ({
  id: a.id,
  workflow_id: a.workflowId,
  trust: a.trust,
  promotion_status: a.promotionStatus,
  promotion_requested_by: a.promotionRequestedBy ?? null,
  promotion_sendback_reason: a.promotionSendbackReason ?? null,
  paused: bit(a.paused),
  paused_reason: a.pausedReason ?? null,
  trust_before_pause: a.trustBeforePause ?? null,
}))

const agentSamples: unknown[] = []
for (const agent of AGENT_LIST) {
  const detail = AGENT_DETAILS[agent.id]
  if (!detail) throw new Error(`AGENT_DETAILS missing for ${agent.id}`)
  for (const s of detail.samples) {
    agentSamples.push({
      agent_id: agent.id,
      case_id: s.id,
      outcome: s.outcome,
      tone: s.tone,
      note: s.note,
      kpi: s.kpi,
    })
  }
}

// ── proposals + source_cases ──────────────────────────────────────────────────
const proposals = PROPOSAL_LIST.map((p) => {
  const detail = PROPOSAL_DETAILS[p.id]
  return {
    id: p.id,
    workflow_id: workflowIdFor(p.workflow),
    status: p.status,
    agent_id: detail?.agentId ?? null,
    forwarded_by: null, // seed sets status only (forwardedBy is set by the forward action)
    decision_kind: null,
    decision_reason: null,
    decision_category: null,
    change_area: p.changeArea,
    impact_count: p.impactCount,
  }
})

// case_id -> observed_date (used to derive historical received_at without touching client src)
const observedDateByCase: Record<string, string> = {}
const proposalSourceCases: unknown[] = []
for (const p of PROPOSAL_LIST) {
  const detail = PROPOSAL_DETAILS[p.id]
  if (!detail) continue
  for (const sc of detail.sourceCases) {
    proposalSourceCases.push({
      proposal_id: p.id,
      case_id: sc.id,
      field: sc.field,
      comment: sc.comment,
      observed_date: sc.date,
    })
    observedDateByCase[sc.id] = sc.date
  }
}

// ── governance / drift / metrics ───────────────────────────────────────────────
const governanceModelInventory = MODEL_INVENTORY.map((m) => ({
  agent_id: m.agentId,
  process: m.process,
  model: m.model,
  version: m.version,
  purpose: m.purpose,
  owner: m.owner,
  validation: m.validation,
  last_validated: m.lastValidated,
  scope: m.scope,
}))

const driftMonitors = DRIFT_MONITORS.map((d) => ({
  workflow_id: workflowIdFor(d.process),
  metric: d.metric,
  value: d.value,
  threshold: d.threshold,
  status: d.status,
}))

const syntheticMetricRows: unknown[] = []
for (const key of Object.keys(KPI_ROWS) as KpiProcessKey[]) {
  for (const m of KPI_ROWS[key]) {
    syntheticMetricRows.push({
      workflow_id: key,
      metric_label: m.metricLabel,
      actual_value: m.actualValue,
      threshold: m.threshold,
      achieved: bit(m.achieved),
      denominator: m.denominator,
      exclusions: m.exclusions ?? null,
      period: m.period,
    })
  }
}

// ── escalations (from seed() cases that carry an escalation overlay) ───────────
const escalations: unknown[] = []
for (const c of Object.values(state.cases)) {
  if (!c.escalation) continue
  escalations.push({
    case_id: c.id,
    reason: c.escalation.reason,
    category: c.escalation.category,
    escalated_to: c.escalation.to,
    escalated_from: c.escalation.from ?? null,
    resolution: c.escalation.resolution ?? null,
  })
}

// ── historical_cases (CASE_DETAILS entries not in cases, with a historyNote) ────
const historicalCases: unknown[] = []
for (const [id, detail] of Object.entries(CASE_DETAILS)) {
  if (seededCaseIds.has(id) || !detail.historyNote) continue
  const obs = observedDateByCase[id]
  historicalCases.push({
    id,
    workflow_id: workflowIdFor(detail.workflowName),
    status: 'reflected',
    owner_name: detail.inputter,
    // derive received_at from the source_case observed_date (matches live HISTORICAL_CASE_ROWS) — never future
    received_at: obs ? `${obs}T09:00:00+09:00` : '2026-05-01T09:00:00+09:00',
    history_note: detail.historyNote,
  })
}

// ── assemble + write ───────────────────────────────────────────────────────────
const out = {
  meta: {
    generatedFrom: 'live client fixtures (CASE_LIST/PROPOSAL_LIST/AGENT_LIST + detail dicts + governance/kpi)',
    note: 'DO NOT hand-edit. Regenerate via `npm run seed:gen`. Counts derive from source array lengths.',
    sourceCardinalities: {
      cases: cases.length,
      case_fields: caseFields.length,
      proposals: proposals.length,
      agents: agents.length,
      agent_samples: agentSamples.length,
      proposal_source_cases: proposalSourceCases.length,
      governance_model_inventory: governanceModelInventory.length,
      drift_monitors: driftMonitors.length,
      escalations: escalations.length,
      synthetic_metric_rows: syntheticMetricRows.length,
      historical_cases: historicalCases.length,
      workflows: workflows.length,
      roles: roles.length,
      actors: actors.length,
    },
  },
  demo_clock: { now_iso: NOW_ISO },
  workflows,
  roles,
  actors,
  cases,
  case_fields: caseFields,
  case_documents: caseDocuments,
  case_document_rows: caseDocumentRows,
  lifecycle_events: lifecycleEvents,
  agents,
  agent_samples: agentSamples,
  proposals,
  proposal_source_cases: proposalSourceCases,
  governance_model_inventory: governanceModelInventory,
  drift_monitors: driftMonitors,
  escalations,
  synthetic_metric_rows: syntheticMetricRows,
  historical_cases: historicalCases,
}

const here = path.dirname(fileURLToPath(import.meta.url))
const outPath = path.join(here, '..', 'src', 'seed', 'seed-data.generated.json')
fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, JSON.stringify(out, null, 2) + '\n', 'utf8')
console.log('[seed:gen] wrote', path.relative(process.cwd(), outPath))
console.log('[seed:gen] cardinalities:', JSON.stringify(out.meta.sourceCardinalities))
