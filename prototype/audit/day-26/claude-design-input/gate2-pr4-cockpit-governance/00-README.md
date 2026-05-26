# Gate 2 — Wave 4 Cockpit + Governance (F-6 + F-8 + F-9)

PR 4 着手前の visual decision gate。Claude Design Chat (claude.ai/design) で実施。

## 投入順序 (Claude Design Chat へ)

1. 新規 conversation を開く (claude.ai/design)
2. **Prompt**: `05-prompt-template.md` の Gate 2 prompt section を copy-paste
3. **Constraints**: `01-design-system-constraints.md` を attached file or paste
4. **Audit findings**: `02-audit-findings-context.md` を attached file or paste
5. **Cards**: `04-cards-claim-verbatim.md` を attached file or paste
6. **Source files**: `03-existing-source/` 内の .tsx + .ts を attached file or paste
   - 投入 priority 順: pages-Dashboard.tsx → pages-ProposalReview.tsx → pages-AgentSettings.tsx → components-shared-DetailDrawer.tsx → components-shared-NextActionStrip.tsx → data-types.ts → data-mock-agents.ts → data-mock-metrics.ts
7. **Generation**: 各 finding 別に prompt 投入
   - F-6 Dashboard 3-viewport: 2 案生成 (aggregate KPI strip + per-workflow grid + drill-down drawer の配置 variant)
   - F-8 RACI default surface: 2 案 (DetailDrawer default open vs PageHelpDisclosure 連携 vs inline RACI panel の比較)
   - F-9 permission scope badge: 1 案 (scope badge taxonomy: read/write/approval-gated の visual treatment)
8. **Export**: 結果 HTML / PNG を `screenshots/wave4-design-exploration/F-{X}-{案番号}.{html,png}` に保存
9. **Decision**: best 1 案を per finding 決定、`gate2-decision.md` に記録 (Safety rail 5 軸 check 含む)

## Quota 想定: ~5 prompt (F-6 ×2 + F-8 ×2 + F-9 ×1)

## Wave 4 PR 4 着手時の design spec source

`gate2-decision.md` 内の採用 case が PR 4 Commit 9-10 の design spec source として参照される。Claude Code 実装時、採用案の HTML mock を referrence として Dashboard 3-viewport refactor + ProposalReview RACI default open + AgentSettings tool scope badge を構築。
