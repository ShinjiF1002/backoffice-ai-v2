# Audit Findings Context — Gate 2 (F-6 + F-8 + F-9)

`unified-findings.md` から該当 finding row verbatim 抽出。Claude Design に投入する audit context。

## F-6 (P1、new) — Operator Cockpit 3 viewport pattern 不在

**Symptom**: Dashboard で aggregate KPI strip absent (top に独立 strip なし、業務 card 内分散)、per-workflow card 2 only (3-30 想定の scale 想定)、in-page drill-down 不在 (route 遷移)。Metrics は Tier 2 Manager dashboard で別 page、Dashboard が Tier 3 Operator console との role separation 明確でない。

**Evidence**: observation-log D-01 + D-08

**Card reference**: Card 7 operator-cockpit-multi-agent-oversight-ui (`04-cards-claim-verbatim.md` 参照)

**Day 19 重複 check**: 0 件 (Day 19 U-15 Dashboard lane は defer、本 audit angle と無関係)

**Fix proposal**: Commit 9 (PR 4) で:
- (a) Top aggregate KPI strip (5 指標: throughput / queue / error / pending escalation / SLA)
- (b) Per-workflow grid (existing 2 card 維持)
- (c) Right DetailDrawer drill-down (route 遷移を in-page drawer に置換、Day 19 DetailDrawer primitive 再利用)
- (d) mock-metrics.ts 拡張 aggregate KPI

## F-8 (P2、adjacent-to-Day19) — RACI-A 5-role default closed (Demo Chapter 2 限定 visible)

**Symptom**: ProposalReview default で RACI 列 visible でない、`?demo=1` query で DetailDrawer expand 必要。1st-time user / 入力者 が 5-role surface に到達するのに query gate がある、disclosure surface 要件 partial。

**Evidence**: observation-log D-05 + D-05b

**Card reference**: Card 9 raci-on-agent-action (`04-cards-claim-verbatim.md` 参照)

**Day 19 重複 check**: partial (Day 19 U-6 DetailDrawer 移動は適用済、default closed は別 finding `adjacent-to-Day19`)

**Fix proposal**: Commit 10 (PR 4) で:
- ProposalReview DetailDrawer default open (`?demo=1` query 不要化)
- OR PageHelpDisclosure pattern で 5-role surface を 1-click 到達

## F-9 (P2、new) — Agent permission scope (read/write/approval) visible 不在

**Symptom**: AgentSettings の Tool list で各 tool の scope (read-only / write / approval-gated) 不可視、tool description 4-line のみ。least-privilege expression 弱、RBAC sub-check rbac-4 fail。

**Evidence**: observation-log D-06

**Card reference**: Card 9 + R7 deferred ledger rbac sub-check

**Day 19 重複 check**: 0 件

**Fix proposal**: Commit 10 (PR 4) で:
- AgentSettings Tool list に scope badge (`read` / `write` / `approval-gated` の 3 variant)
- 各 tool 行 inline 表示

## Common context for all 3 findings

- Day 19 5 primitive (HypothesisChip / Disclosure / DetailDrawer / PageHelpDisclosure / NextActionStrip) を rewrite せず、reuse + extend のみ
- Dashboard 3-viewport は Day 19 NextActionStrip + 業務 card と co-existence 必要 (preserve + wrap)
- Operational Premium Light token 厳守
- JP-only UI copy
- 装飾要素 (gradient / glow / glass / 3D / large rounded) 完全 0
