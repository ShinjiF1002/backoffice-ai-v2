# ProposalDetail — Internal Spec

## Page identity

| 項目 | 値 |
|---|---|
| 旧 mapping | `prototype/src/pages/ProposalReview.tsx` |
| 新 route | `/proposals/:proposalId` (Sidebar nav `AI 提案レビュー`) |
| typology | C (Detail Workspace、2-col grid) |

## Goal

承認者が AI 提案 (staging → compiled 昇格) を判定基準 + 元案件と照合し、業務責任者へ送付するか差戻すかを判断する。

## Primary Action (1 つ)

- **"業務責任者へ送付"** — PrimaryAnchor strip CTA + Footer CTA (status === 審査中 で enabled)

## Mechanical metric (target)

| Metric | 旧 ProposalReview | 新 ProposalDetail |
|---|---|---|
| 提案メタ表示位置 | aux col に full 表示 5 element | **L2 compact (2-col grid、Confidence は progress bar)** |
| 未承認ヒント panel | L1 visible | **L3 Disclosure default closed** |
| PrimaryAnchor strip | なし | **Header 直下 strip + Footer CTA 二段** |
| Lifecycle Stepper 可視性 | Header 内、scroll で消える | **sticky Header 下、常時可視** |

## Layout 詳細

### Header (sticky)
- breadcrumb 3 segment
- h1 = proposal title (truncate)
- chip × 1 (status)
- Sticky Proposal Lifecycle Stepper (3 step、CaseDetail 5 step と同 pattern)

### Body 2-col
- primary 7/12: 判定基準 5 行 list + 元案件 link + 提案メタ 5 (L2 compact)
- aux 5/12: 未承認ヒント (L3 Disclosure) + Citation (L1) + 関連手順更新 alert (条件付き)

### Footer
- 業務責任者へ送付 (primary) / 差戻し / 草稿保存 + caption

## research-compounder 違反対応

- **Executive Dashboard Layout** (3 layer): 判定基準 + 元案件 (L1) / 提案メタ (L2) / 未承認ヒント + 詳細 (L3 Disclosure)
- **AI-native HIL Approval UI** (5 state、agent / human action 分離): Proposal は AI 提案、approve は human action、Stepper で明示

## Charter 適用

- One-Glance Hierarchy: PrimaryAnchor "業務責任者へ送付" + 判定基準 5 list で「何を判断するか」が即可視
- Progressive Disclosure: 未承認ヒント / 提案メタ詳細 / 関連手順を L3
- Action Proximity: 判定基準 → PrimaryAnchor CTA inline (画面開いたまま判断可能)
- State Transparency: Proposal Lifecycle Stepper で stage 明示、Confidence progress bar で「どの程度確信か」可視
- Subtract before Adding: 旧 aux 5 panel → L1 = 2 (Citation + 関連手順更新)
- Signal over Ornament: emerald badge (citation) / amber alert (関連手順更新) / slate (staging) は semantic
- Make the State Visible: Reversibility badge "Revertible" を visual で示す

## Phase 1A pilot 後 Step 2.6 patch 想定

- Proposal Lifecycle Stepper (3 step) と CaseDetail (5 step) の visual 一貫性
- L2 compact meta が cluttering せず 5 element 1 viewport で読めるか
- 未承認ヒント Disclosure の "citation 対象外" badge 強調が visual で伝わるか
