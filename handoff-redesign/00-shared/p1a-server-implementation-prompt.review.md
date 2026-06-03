# P1a prompt — review-loop sign-off 【2026-06-03】

Target: `p1a-server-implementation-prompt.md` (P1a self-driving implementation prompt).
Process: `review-loop` skill — Claude 多視点 fan-out → SSOT-照合 triage 修正 → Codex review↔修正ループ → 最終 Claude 仕上げ.
Source SSOT: converged P0 contract package (`postv5-p0-preflight-contract.md` + `postv5-p0/01..10.md`, ratified SD-1..SD-5) + live code (`prototype-redesign/`).

## Severity trend

| Phase / round | BLOCKER | HIGH | MED | LOW | NIT | Outcome |
|---|---|---|---|---|---|---|
| Claude review (5 dims + synthesis) | 0 | 3 | 8 | 5 | 2 | 18 findings; 16 actionable applied (F17 folded into F10; F18 = cover-doc hygiene, fixed separately) |
| Codex round 1 | 0 | 3 | 3 | 0 | 0 | F-001..F-006 → all fixed |
| Codex round 2 | 0 | 0 | 0 | 0 | 0 | **CONVERGED** ("ready for executor handoff") |
| Final Claude polish | 0 | 0 | 0 | 1 | 0 | pagination-cap (clamp 200 → ≤100, `09 §2-2`) → fixed |

**Convergence confirmed**: 0 BLOCKER + 0 HIGH, verified by a POST-FIX external Codex round (round 2). External pass present (Codex, 2 rounds) — not degraded mode.

## Highest-leverage fixes applied
- Claude: added the #9-7 exposure baseline's 7 server-code controls (127.0.0.1 bind / error sanitizer / exact CSP / rate-limit `RATE_LIMITED` / DB 0600+gitignore / secret-not-in-bundle / dual-ID log allowlist) to P1a; PR1/PR2 `check:server` subset boundary made explicit; the server-invariant gate replaced collapsed prose with the `04 §D` + `09` named-test SSOT (T-NO-DIRECT-PATCH / T-NO-AUDIT / T-STATE discrete / IDOR×3 / T-EMPTY / idempotency family / seq monotonicity); client-unchanged gate broadened to a negative-pattern allowlist; "24 endpoint"→22; confidence-redaction re-pointed to governance ledgers (no confidence column on operational audit_events); "15 capability"→source-derived cardinality.
- Codex: removed the `src/legacy/` deletion allowance (gate contradiction); added `package-lock.json` to the allowlist; required a falsifiable read-endpoint manifest in PR6; moved the reset-recreates-db test from PR1 to PR3; dual-ID log fields; DB `0600` owner-only test.

## Open decisions (carried, non-blocking for P1a execution)
- OD-1 (from P0 #2): `ActorRole` enum granularity — keep 4 values (recommended/default, additive) vs flatten to 3. Default = keep 4.
- D-2 (from P0 #1): pages.yml v1 retention — decided at P1a *deploy* time (deferred, not a P1a build deliverable).
- HTTP framework = Express (applied default, user-overridable; Fastify is the alternative).

## Ready state
The P1a prompt is **ready for executor handoff.** Approval gate before execution (per the prompt's own §承認 gate 1): create branch `postv5/p1a-server` + critical-review the 7-PR breakdown, then execute. P1a default terminal = approved PR (merge held; main merge bundled with P1b+ per user).

---

## Gate-1 execution review 【2026-06-03、着手時】

User authorized execution ("上記のP1a Promptを実行してください"). Per §承認 gate 1, ran a focused critical-review of the **7-PR execution plan** (executable-sequence lens — distinct from the prose review loop above) as a 4-dimension Workflow fan-out (seq-buildability / gate-vs-contract-coverage / contract-fidelity / right-sizing-scope) + synthesis, all opus.

| Severity | BLOCKER | HIGH | MED | LOW | NIT | Outcome |
|---|---|---|---|---|---|---|
| Gate-1 fan-out (4 dims + synth) | 0 | 0 | 1 | 3 | 5 | 9 findings, **all ACCEPTED + applied** (additive gate-tightening + 1 PR1 disambiguation; 0 structural reordering) |

**Verdict (synthesis)**: 7-PR plan executable as sequenced; no re-ordering required. Pre-flight de-risk passed: better-sqlite3 builds on darwin-arm64 (prebuilt or node-gyp — python3/make/clang present), registry reachable (better-sqlite3 12.10.0 / zod 4.4.3 / express 5.2.1 — contract placeholders resolve-at-install), fixture cardinality matches contract 08 exactly (CASE_LIST=29 / PROPOSAL=4 / AGENT=5 / workflows=5).

**Applied fixes** (prompt now names every contract-mandated test it had left implicit):
- F1 (MED): auditSeq determinism (`06 §auditSeq`) — seed→0 / occurred_at deep-equals `auditTs(0..N-1)` / restart-continues → added to §Verification gates audit bullet + PR5 net.
- F2 (LOW): PR1 `migrate.ts`/`reset-demo.ts` = import-free shells (env-gate + empty-`migrations/` scan); PR2/PR3 complete the shared runner → PR1 `tsc --noEmit` unambiguously green.
- F3 (LOW): occurred_at tz-ISO regex assert + negative case (`08 (b) 基準5`) → audit bullet.
- F4 (LOW): `input-enum-rejection` (`09 §2-1`, distinct from mass-assignment/unknown-field) → injection bullet.
- F5–F9 (NIT): PRAGMA-smoke term clarity (PR1 bare-connection vs PR2 post-boot-apply), PR5⊇aggregate pointer, `persona-switch-passes-four-eyes-visibly` (`03 §4`) named in PR4/PR7, `AI入力`→`AI処理` enum label, `.nvmrc`/`.gitignore`→`prototype-redesign/` prefix disambiguation.

No re-Codex needed: all fixes align the prompt **to** the already-converged P0 contracts (the contracts already mandate these tests; the prompt merely hadn't named them) — not new design. No vantage-point false positives (reviewers correctly accounted for the executor's Workflow/codex/skill tools). **Gate-1 cleared → proceeding to branch `postv5/p1a-server` + PR1.**
