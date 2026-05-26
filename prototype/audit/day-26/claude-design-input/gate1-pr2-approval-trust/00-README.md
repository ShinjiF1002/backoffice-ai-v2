# Gate 1 — Wave 2 Approval Trust System (F-2 + F-5 + F-7)

PR 2 着手前の visual decision gate。Claude Design Chat (claude.ai/design) で実施。

## 投入順序 (Claude Design Chat へ)

1. 新規 conversation を開く (claude.ai/design)
2. **Prompt**: `05-prompt-template.md` の Gate 1 prompt section を copy-paste
3. **Constraints**: `01-design-system-constraints.md` を attached file or paste
4. **Audit findings**: `02-audit-findings-context.md` を attached file or paste
5. **Cards**: `04-cards-claim-verbatim.md` を attached file or paste
6. **Source files**: `03-existing-source/` 内の .tsx + .ts を attached file or paste
   - 投入 priority 順: pages-CaseReview.tsx → pages-ProposalReview.tsx → components-case-AddressDiffBlock.tsx → components-case-LifecycleStepper.tsx → 5 shared primitives → data-types.ts → data-mock-cases-subset.ts → data-mock-proposals-subset.ts (admin guide 推奨で subdirectory 限定)
7. **Generation**: 各 finding 別に prompt 投入
   - F-2 Diff Preview: 3 案生成 (Inline default / Side-by-side / Field table view variant + Metadata strip 5 element 配置)
   - F-5 ActorBand: 2 案 (icon prefix + color band の組合せ visual hierarchy)
   - F-7 SLA per step: 2 案 (LifecycleStepper SLA badge + Inbox delegate flag)
8. **Export**: 結果 HTML / PNG を `screenshots/wave2-design-exploration/F-{X}-{案番号}.{html,png}` に保存
9. **Decision**: best 1 案を per finding 決定、`gate1-decision.md` に記録 (Safety rail 5 軸 check 含む)

## Quota 想定: ~7 prompt (F-2 ×3 + F-5 ×2 + F-7 ×2)

## Wave 2 PR 2 着手時の design spec source

`gate1-decision.md` 内の採用 case が PR 2 Commit 3-5 の design spec source として参照される。Claude Code 実装時、採用案の HTML mock を referrence として typed React primitive (`DiffPreviewBlock` / `MetadataStrip` / `ActorBand` / `LifecycleStepper.tsx` 拡張) を構築。
