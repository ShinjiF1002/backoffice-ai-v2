# Claude Design Input Bundle (Gate 1 + Gate 2)

Claude Design Chat (claude.ai/design) は独立した Chat service で、user が手で prompt + file を投入する必要がある。本 folder は **copy-paste 準備済 bundle**。Implementation Plan v3.0 §Claude Design Gate Specification 通り。

## Workflow

1. **PR 2 着手前**に Gate 1 を実施: `gate1-pr2-approval-trust/00-README.md` を読んで手順通り
2. **PR 4 着手前**に Gate 2 を実施: `gate2-pr4-cockpit-governance/00-README.md` を読んで手順通り

## Gate 別 scope

| Gate | 対応 Wave / PR | 対応 finding | 想定 prompt |
|---|---|---|---|
| Gate 1 | Wave 2 / PR 2 (Approval trust system) | F-2 Diff Preview + F-5 ActorBand + F-7 SLA per step | ~7 prompt |
| Gate 2 | Wave 4 / PR 4 (Cockpit + governance) | F-6 Dashboard 3-viewport + F-8 RACI default + F-9 permission scope | ~5 prompt |

合計 quota 想定 ~12 prompt (Pro / Max 内で運用可能)。

## Safety Rail (両 gate 共通、output 採用前 verify、5 軸)

| Rail | Check 内容 | Fail action |
|---|---|---|
| **1. Token SSOT** | output の color / radius / typography が Operational Premium Light SSOT (slate-50/white/indigo/emerald/amber/red、radius 8/6/4px、Inter + Noto Sans JP + JetBrains Mono) と整合 | 整合しない token は reject、Claude Code 実装時に SSOT token に置換 |
| **2. 装飾禁止** | gradient mesh / glow / glassmorphism / 3D / large rounded (>8px) / cream-beige / dark mode が混入していないか visual 確認 | 混入時は該当案 reject、再生成 or 別案採用 |
| **3. Day 19 重複** | output が Day 19 applied 18 finding と同一 fix を提案していないか (HypothesisChip / Disclosure / DetailDrawer / PageHelpDisclosure / NextActionStrip の rewrite 等) | 重複時は adjacent-to-Day19 tag で 別 angle のみ採用 or reject |
| **4. JP typography** | Noto Sans JP + Inter mono 組合せ維持、Chinese typesetting 問題 (apiyi review) 由来の JP rendering 崩れがないか確認 | 崩れ時は手動 typography 修正 or Claude Code 実装時に re-apply |
| **5. Quota 管理** | Gate 1 + Gate 2 合計 ~12 prompt 上限、超過時は Claude Code fallback | 超過時は残り finding を Claude Code 単独で実装 |

## Output 配置

- Gate 1 採用案: `prototype/audit/day-26/screenshots/wave2-design-exploration/F-{X}-adopted-{案番号}.{html,png}`
- Gate 1 decision: `gate1-pr2-approval-trust/gate1-decision.md` (PR 2 commit 対象)
- Gate 2 採用案: `screenshots/wave4-design-exploration/`
- Gate 2 decision: `gate2-pr4-cockpit-governance/gate2-decision.md` (PR 4 commit 対象)
- Reject 案 / 中間 generation: commit 対象外 (採用後削除)

## Reference

- Implementation Plan v3.0: `~/.claude/plans/tl-dr-approve-glistening-allen.md`
- Day 26 audit report v1.3: `prototype/audit/day-26-research-compounder-audit-report.md`
- research-compounder cards: `~/code/active/research-compounder/knowledge/`
