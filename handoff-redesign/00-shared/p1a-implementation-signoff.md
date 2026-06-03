# P1a implementation — gate-2 sign-off 【2026-06-03】

Branch: `postv5/p1a-server` (base `main` @ `1e45ea7` = postv4). Default terminal = **approved PR, merge held**
(main 置換 = 最終 user gate; main merge は P1b+ と束ねる).

## Commits (foundational + 7 PRs + gate-2)

| Commit | PR | Scope |
|---|---|---|
| `55f7b80` | 0 | P0 contract package + P1a prompt + SSOT REBASELINE narrowing |
| `52d6a04` | PR1 | server scaffold + DB connection + `check:server` gate |
| `0d1706a` | PR2 | 21-table schema + migration runner + append-only triggers |
| `4bca215` | PR3 | source-derived parity seed + `seed:validate` |
| `c7a9a9b` | PR4 | identity (dual-ID HMAC token + jti revoke-on-reissue + exposure) |
| `c5e41f1` | PR5 | 22 mutation handlers + SoD/state/audit enforcement |
| `139af13` | PR6 | read endpoints + RBAC/IDOR + exposure middleware |
| `d12280a` | PR7 | operator≠persona dual-ID + `check:all` integration |
| `de2ef94` | gate-2 | adversarial-QC falsifiability gaps closed + read surface completed |

## Verification (all green)

- **`check:all` EXIT 0** = client lint / check:no-op / check:types / check:types:test / check:design / **check:server** / client test / client build. Passes with `BOAI_SESSION_SECRET` unset (07 §5c).
- **server**: 103 in-process tests (19 files, Vitest node project — no HTTP/supertest), `npm audit` 0 high.
- **client**: 278 pass / 8 pre-existing skips (no regression), build (tsc -b + vite) green.
- **`seed:validate`**: OK (parity + integrity).
- **client-unchanged gate**: zero `src/**` diff vs `main`; full diff surface = allowed additive only
  (`server/**`, `package.json`+lock, `.nvmrc`, `.gitignore`, `eslint.config.js`) + design docs.
- **mock core preserved**: no real LLM/OCR/customer data/PDF/external bank/regulatory cite — only
  SoD/execute/audit enforcement became real.

## Named-test coverage (04 §D / 09 / 03 §4 / 06 / 08 / 01)

SoD: T-SELF / T-PROP-SELF / T-PROMO-SELF / T-ARB (+ idor-actor-spoof via server-resolved
effective_actor_id). State: T-STATE discrete (a–n incl h/i/k) / T-FLAGS / T-DOUBLE / T-RESOLVED /
T-NOT-PAUSED / T-EMPTY (all 9) / T-DUP / T-INCOMPLETE / T-BULK-SELF / T-BULK-FLAGS. Audit:
append-only trigger (UPDATE+DELETE ABORT) / seq monotonic + occurred_at deterministic auditTs /
T-NO-AUDIT (all 10) / audit-emit +1 vs guard +0 / T-NO-DIRECT-PATCH + append-only-route grep /
audit-no-full-row-dump / no-confidence-column / both-ids-in-audit + persona-switch-passes-visibly.
Identity: tampered/expired/wrong-secret/revoked-jti/unknown-operator/unknown-actor / body-actorId-
not-promoted / T-OPERATOR-IMMUTABLE / secret-not-in-token + log-allowlist + secret-not-in-client-src.
Authz: T-GOV-NO-MUTATE / governance-read-gate / read-side IDOR (notifications + escalations,
NOT_FOUND). Injection: T-STRICT-BODY (UNKNOWN_FIELD) / input-enum (VALIDATION) / mass-assignment /
sql-injection-search / pagination-cap (clamp) + pagination-reject (VALIDATION) + allowlist.
Transaction: atomicity (audit-INSERT fault → domain rollback) + all-handlers-db.transaction grep.
Exposure: 127.0.0.1 bind / CSP exact-value / error-sanitizer / rate-limit RATE_LIMITED 429.
Destructive: reset-cli-disabled-by-default + reset-recreates-db-not-deletes-rows.

## Reviews

- **Gate-1** (PR-plan critical-review, 4 dims + synth): 0 BLOCKER/HIGH; 9 fixes applied to the prompt.
- **Gate-2** (implementation adversarial QC, 4 dims + synth): 0 BLOCKER, no security leak, no runtime
  divergence; 11 findings — **all ACCEPTED + fixed** (F1 notifications + IDOR test, F2 T-EMPTY 9/9,
  F3 T-STATE h/i/k, F4 escalate/emergencyStop coverage, F5 VALIDATION doc, F6 read-surface
  completion, F7–F10 nits, F11 confirmed right-sized). Convergence: the 6 previously-0-invocation
  handlers now have 3–4 test invocations each; check:all green post-fix.
- **Gate-3 (external Codex review-loop, 4-chunk × 3 rounds → final Claude sign-off)**: user-requested
  external second pass per review-loop Phase 3→4. Severity trend **R1: 12 (1 HIGH/6 MED/5 LOW) → R2:
  3 residuals (1 HIGH/1 MED/1 LOW) → R3: 0 BLOCKER/HIGH** (converged). All triaged vs contracts +
  reducer + the demo data; all accepted/fixed (reset failure-atomicity, auditTs midnight-monotonic,
  drift `===`, demo_clock-from-DB, token NaN/issued_at guards, log scalar-guard, headers-before-json,
  searchCases `instr()` literal, notification name-uniqueness invariant, approvalId in after_json,
  dead-schema cleanup; honest contract notes for VALIDATION FK-guards + idx PK-redundancy). Final
  **Claude sign-off = ship-ready** (independent re-verify of all 7 fix areas + the untested
  hadLive=true reset path empirically exercised; non-vacuous tests confirmed; 0 contract
  contradiction). Server tests 88 → **103**. Commits: `1ac8e6d` / `b77198c` / `2266930`.

## Honest contract fixes (reality → contract)

- 08: `cases.assignee_id`→`assignee_name` (live owner is a free display name incl non-actors
  佐藤花子/高橋); `case_fields` 154→145 (canonical 0142 has 5 fields live, not 9).
- 04: `VALIDATION` denialReason documented for the FK guards (escalate.to / create.workflowId).

## Open decisions carried (non-blocking, deferred to later phases)

- Deploy / `pages.yml` archive / README server手順 → P1a **deploy time** (D-2), not implementation.
- P1b (client API wiring + MSW), P2 (data volume), P3 (3-role UI), P4 (selector) → later phases.
- `src/legacy/` purge → a client-cleanup phase (P1a keeps client unchanged).

**Status: converged + signed off (gate-1 + gate-2 Claude + gate-3 Codex review-loop) → PR #26 (merge held).**
