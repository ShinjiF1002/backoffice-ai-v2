# Audit Findings Context — Gate 1 (F-2 + F-5 + F-7)

`unified-findings.md` から該当 finding row verbatim 抽出。Claude Design に投入する audit context。

## F-2 (P0、adjacent-to-Day19) — Diff / Change Preview の 3-view + metadata strip 5-element craft gap ★

**Symptom**: CaseReview / ProposalReview の承認 surface で Inline diff のみ、Side-by-side / Field table absent、metadata strip Confidence + author 部分のみ (Change reason / Affected scope / Reversibility 不在)、承認 button の metadata gate 不在。

**Evidence**: observation-log D-03 + D-05

**Card reference**: Card 2 ★ diff-and-change-preview-ui (`04-cards-claim-verbatim.md` 参照)

**Day 19 重複 check**: Day 19 U-4 EvidenceTimeline paraphrase は actor/source/conf raw label paraphrase の craft、Card 2 の 3-view + metadata strip pattern とは別 angle (adjacent-to-Day19)

**Fix proposal**: Commit 2-4 (PR 2) で:
- (Commit 2) types.ts + mock schema 拡張: `CaseField` interface に optional `changeAuthor` / `changeReason` / `affectedScope` / `reversibility` 追加、`ProposalDiffSection` 同様、`mock-cases-subset.ts` + `mock-proposals-subset.ts` に値投入
- (Commit 3) `DiffPreviewBlock` 新規 primitive (3 view: Inline default / Side-by-side / Field table) + `MetadataStrip` 新規 primitive (5 element conditional render: author / reason / confidence / affectedScope / reversibility)
- (Commit 4) CaseReview AI 入力結果 5 項目 → DiffPreviewBlock fieldTable view wrap + MetadataStrip footer 上配置、ProposalReview ProposalDiffSection → DiffPreviewBlock sideBySide wrap、承認 button metadata gate (scroll-into-view または click trigger)

**Severity rationale**: 承認 surface の core craft、Session 4 demo の信頼性要

## F-5 (P1、new) — HIL actor band + icon prefix の visual hierarchy 不足

**Symptom**: Inbox / Dashboard / AuditTrail で agent / human / system 区別が text / 色のみ、icon prefix + color band の併用なし、scrolling 中の actor 判定速度低下。

**Evidence**: observation-log D-02 + D-01 + D-07

**Card reference**: Card 1 ai-native-hil-approval-ui (`04-cards-claim-verbatim.md` 参照)

**Day 19 重複 check**: Day 19 U-4 EvidenceTimeline paraphrase は内容 paraphrase で、actor visual band 軸は touched せず (0 重複)

**Fix proposal**: Commit 5 (PR 2) で:
- `ActorBand` 新規 primitive (4px color band + icon prefix: bot / user / cog system、`{ actor: 'agent' | 'human' | 'system', size?: 'sm' | 'md', className? }`)
- Inbox 担当者 column + Dashboard 業務 card breakdown + AuditTrail row に integrate、Day 19 EvidenceTimeline actor paraphrase と整合

## F-7 (P2、new) — Multi-step approval の SLA per step + Delegate model 不在

**Symptom**: CaseReview Lifecycle 5 step は visible だが per-step SLA (4h/24h target) 不可視、out-of-office delegate routing 不在、All approvers (具体 name) は anonymous step label に隠れている。経過時間 case-level のみ、step-level breakdown なし。

**Evidence**: observation-log D-02 + D-03

**Card reference**: Card 8 multi-step-approval-and-workflow (`04-cards-claim-verbatim.md` 参照)

**Day 19 重複 check**: 0 件

**Fix proposal**: Commit 5 (PR 2) で:
- `LifecycleStepper.tsx` 拡張: per-step SLA badge (4h target / 24h escalation、CASE-2026-0142 mock data 拡張)
- Inbox 担当者 column に Delegate flag (out-of-office routing 表示)
- Lifecycle stepper hover で specific approver name visible

## Common context for all 3 findings

- Demo Chapter 1 (CASE-2026-0142 法人住所変更) + Demo Chapter 2 (PROP-2026-031 OCR 信頼度引き上げ) を破壊しない
- Day 19 applied 18 finding と同一 fix proposal 重複禁止 (`adjacent-to-Day19` tag は同 surface 別 angle で許可)
- Operational Premium Light token 厳守 (`01-design-system-constraints.md` 参照)
- JP-only UI copy
- 装飾要素 (gradient / glow / glass / 3D / large rounded) 完全 0
