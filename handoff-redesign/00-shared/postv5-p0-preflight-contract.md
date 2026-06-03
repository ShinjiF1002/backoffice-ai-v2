# postv5 P0 preflight contract — package cover & decision ledger 【APPROVED — SD-1…SD-5 ratified 2026-06-03】

> P0 preflight deliverable for `postv5-backend-ia-selector-prompt.md` (SQLite backend + 3-role IA + selector UX).
> Status: **P0 APPROVED.** 10 contract sections drafted → adversarially right-sized → cross-checked → realigned to the 5 ratified decisions → convergence verified clean. Next gate = SSOT update (1b) → P1a.
> Baseline verified: `main @ 1e45ea7` (postv4) — prompt's "branch: main @ postv4" is current, not stale. Working tree clean.

## How produced
Workflow `postv5-p0-preflight` (31 agents): 10 contracts × (draft against LIVE code → adversarial right-sizing + fidelity critique → revise) + 1 cross-contract consistency pass. Each section carries file:line citations verified against live `prototype-redesign/src`. Sections live in `postv5-p0/`.

## Contract sections (P0 #1–#9 + SSOT gate)
| # | Section | Covers |
|---|---|---|
| 1 | [`postv5-p0/01-deploy.md`](postv5-p0/01-deploy.md) | Deploy decision (#1) + exposure baseline (#9-7) |
| 2 | [`postv5-p0/02-auth-role.md`](postv5-p0/02-auth-role.md) | Auth-role taxonomy: persona → 入力者/承認者/ガバナンス (#2) |
| 3 | [`postv5-p0/03-auth-session.md`](postv5-p0/03-auth-session.md) | Identity / session, operator≠persona (#3 + #9-2) |
| 4 | [`postv5-p0/04-mutation-matrix.md`](postv5-p0/04-mutation-matrix.md) | Per-action mutation + security invariant matrix, 24 actions (#4 ⊕ #9-1) |
| 5 | [`postv5-p0/05-test-migration.md`](postv5-p0/05-test-migration.md) | Test migration plan, 31 files (#5) |
| 6 | [`postv5-p0/06-db-ops.md`](postv5-p0/06-db-ops.md) | DB operation contract (#6) |
| 7 | [`postv5-p0/07-package-layout.md`](postv5-p0/07-package-layout.md) | Package layout & scripts + dependency vetting (#7 + #9-8) |
| 8 | [`postv5-p0/08-data-model.md`](postv5-p0/08-data-model.md) | Data model DDL a–g, 21 tables (#8, incl. historical_cases #21) |
| 9 | [`postv5-p0/09-security.md`](postv5-p0/09-security.md) | RBAC/IDOR, injection, audit保全, destructive (#9-3,4,5,6) |
| 10 | [`postv5-p0/10-ssot-update.md`](postv5-p0/10-ssot-update.md) | SSOT update plan = gate 1b (P0 承認後 / P1a 前) |

## Cross-contract coherence
Consistency pass found 13 collisions (5 high / 5 medium / 3 low). All collapse into **5 strategic decisions**; the remainder are mechanical reconciliations (one secret-env name, one header name, one endpoint-path convention, one audit_events column set) that follow automatically once SD-1…SD-5 land.

## The 5 strategic decisions — RATIFIED (P0 approval gate, 2026-06-03)

> **Adjudication note:** the consistency pass optimized purely for *right-sizing* and on SD-1/SD-2/SD-3 recommended trimming controls the prompt's FINAL text **explicitly mandates**. The user ratified **honoring the prompt** on all three (keep the mandated controls, implement minimally) — these controls *are* the postv5 value proposition. Where the prompt forbids over-building (line 38: no full auth framework / IdP / RBAC engine), the *implementation* is trimmed, not the *control*.

| ID | Decision | **Ratified outcome** | Canonical convention applied |
|---|---|---|---|
| **SD-1** | Identity model | **Dual-ID signed token (honor #9-2)** | header `X-Operator-Token` (HMAC-SHA256, 30-min expiry, in-memory `Set<jti>` replay-reject); secret env `BOAI_SESSION_SECRET`; operator login `POST /api/session/operator`; persona via per-write `{ actorId }`; `/api/` prefix all endpoints; audit records `session_operator_id` + `effective_actor_id` (both NOT NULL) |
| **SD-2** | Server authorization | **Governance-boundary gate + IDOR (honor #9-3, right-sized)** | governance role = READ-ONLY (rejects all mutations) + governance-only read endpoints + object-level IDOR (`NOT_FOUND`→404); operational execute stays identity-SoD + state; #9's D1/D6/D7 fine-grained matrix dropped |
| **SD-3** | DB schema lifecycle | **schema_migrations + forward-only (honor #8f)** | `schema_migrations(version,name,applied_at,checksum)` (table #20) + forward-only boot-apply + rollback note + `db:reset-demo`; #7 un-rejected the runner |
| **SD-4** | Denial convention | **enum is truth (applied default)** | `{ok:false, denialReason}` asserted in tests (not bare code); 403 default, 404 only for IDOR; #6's 422 pin dropped |
| **SD-5** | Input validation | **Adopt zod** | every endpoint boundary `zod .strict()` (unknown-field reject = mass-assignment defense); server runtime deps 2→3; added to #7 dep-vetting table |

### Governance role — resolution (cascade of SD-2)
SD-2 required a real `governance` role to gate to, and item 3's 3-role IA names it (入力者/承認者/**ガバナンス担当者**). So `ActorRole` gains `'governance'` **additively** (read-only; zero four-eyes impact), with ≥2 net-new governance demo actors (`actor-gov-legal`/`actor-gov-compliance`, P2 cardinality). The user-facing 3-role nav groups {checker, business-approver} under 承認者. Reflected in #2/#8/#9. **Remaining low-stakes sub-decision (OD-1, user-overridable):** keep 4-enum (recommended, additive, preserves "only 業務責任者 does 設定承認") vs flatten to 3-enum.

### Applied defaults (low-stakes, not SD votes — overridable)
- **HTTP framework = Express** (#7 default; Fastify is the noted alternative).
- **MSW** (component-test devDep) + **@tanstack/react-query** (client cache) adopted per the prompt's architecture note.
- **DB_PATH** env-driven (dev default `prototype-redesign/server/data/dev.sqlite`, gitignored; hosted points outside repo tree). Startup test asserts gitignored + not in `git ls-files`.

## Convergence verification
Realignment workflow (10 section edits + verifier) reported **clean convergence** on all 8 canonical-decision categories. Main-loop follow-ups: fixed the governance-role contradiction in #2 (+ cascade to #8/#9), reconciled #9 camelCase endpoints to #4's kebab forms. Final grep confirms: 0 stray secret names/headers, 0 non-`/api/` endpoints, 0 stale "don't add governance" residue, actor counts aligned (3+≥2=5 in #2 and #8).

### External Codex review loop (2026-06-03) — CONVERGED
Per user request, an independent external model (Codex / GPT-5.x) reviewed the package in an iterative fix→re-review loop. The external pass caught **semantic** contradictions the internal string-convergence checks missed.

| Round | BLOCKER | HIGH | MED | LOW | Outcome |
|---|---|---|---|---|---|
| 1 | 4 | 6 | 3 | 1 | 14 findings — all fixed (workflow + canon R1–R14) |
| 2 | 0 | 1 | 1 | 0 | 12/14 confirmed; F-15 (actor universe), F-16 (reset/governance) → fixed (R15/R16) |
| 3 | 0 | 0 | 1 | 2 | F-15/F-16 resolved; 3 wording-residue lines → fixed (R3-01/02/03) |
| **4** | **0** | **0** | **0** | **0** | **CONVERGED** — "ready as the implementation source" |

Key semantic fixes the external pass forced: SoD subject = `effective_actor_id` (not operator); `session_operator_id` no-FK + CHECK; every write body carries `actorId` (zod `.strict()` compatibility); `allowed_actors` = 5 (governance-boundary tests reachable); `checksum` restored; audit triggers required (not excluded); deploy/#10 deferred to #1 option ②; `historical_cases` table #21 (proposal FK integrity); 6 missing-table DDL added; governance stays strictly read-only (HTTP reset → OUT-OF-P0).

## SSOT update gate (1b) — status
- ✅ **`backoffice-ai-v2/CLAUDE.md`** — postv5 REBASELINE 3 banner added (backend in-scope; mock core preserved; supersedes the "backend 実装しない / Connectivity scope-out / v2 でやらない: backend" statements).
- ✅ **`prototype-redesign/CLAUDE.md`** — postv5 REBASELINE banner added (state → SQLite + API; "mock data + in-memory state のみ" narrowed; mock core preserved).
- ⏭ **`pages.yml`** — DEFERRED to P1a deploy. Rationale: the redesign-job archive depends on OPEN decision D-2 (keep v1?), and removing it now would stop the still-live static demo before the postv5 server exists. Handled at P1a deploy per #1 A-3 mechanical definition.
- ⏭ **README** — DEFERRED to P1a. Rationale: it should document the actual `server:dev` / `db:reset-demo` commands, which P1a creates; writing them before the server exists would be premature.

## Next steps (post-approval)
1. **SSOT update gate (1b)** — ✅ CLAUDE.md ×2 done (banners). ⏭ pages.yml + README deferred to P1a deploy (deploy-time / D-2-dependent / commands don't exist yet). The blocking part of 1b (governance-doc contradiction) is cleared.
2. **P1a** — server shell + schema + minimal parity seed + `seed:validate`. Needs its own branch (Node + better-sqlite3 server from scratch, multi-PR). Gate: `check:server` green + audit append-only test + self-approval reject test + seed:validate (parity). **Recommended: draft a P1a build-sequence plan (PR breakdown) → critical-review → kickoff.**
3. Each subsequent phase = branch → gate → PR → 承認 → next (P1b client adapter → P2 data → P3 role IA → P4 selector). **main 置換 = final user gate.**

## Not done (correctly)
No implementation. P0 is the prompt's "実装開始前に user 承認必須 = 最大の gate". Nothing in `src/` was touched; only `handoff-redesign/00-shared/postv5-p0/` drafts + this cover were written.
