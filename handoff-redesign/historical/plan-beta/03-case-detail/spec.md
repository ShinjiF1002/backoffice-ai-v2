# CaseDetail — Internal Spec

## Page identity

| 項目 | 値 |
|---|---|
| 旧 mapping | `prototype/src/pages/CaseReview.tsx` + `SendBackComment.tsx` (統合) |
| 新 route | `/cases/:id` (主) + `/cases/:id/comment` (child、section 切替) |
| typology | C (Detail Workspace、2-col grid) |
| navigate from | Queue (`/queue`) の row click → Drawer → CTA |

## Goal

入力者が AI 入力結果を 1 viewport で全把握し、`承認` / `差戻し` / `コメント付き差戻し` を確実に判断する。SendBackComment は別 route ではなく同 page section 切替で flow を切らない。

## Primary Action (status 連動、1 つ)

| status | PrimaryAnchor CTA | Footer CTA |
|---|---|---|
| ready (入力者確認待ち) | "確認待ちアクション" — 承認 + 差戻し | 同 |
| pending (AI 処理中) | "AI 処理中 (操作不可)" — 監視 | disabled |
| sent-back (差戻し中、再処理) | "再処理中 (監視のみ)" | disabled |
| business-approval-waiting | "承認者承認待ち (監視のみ)" | disabled |
| reflected | "反映済" | disabled |

## Mechanical metric (target)

| Metric | 旧 CaseReview | 新 CaseDetail |
|---|---|---|
| Lifecycle Stepper の可視性 | scroll で消える | **sticky、常時可視** |
| aux col panel 数 | 4-5 (Citation / Staging / Confidence / Alert / 関連 rule) | **L1 = 2 (Citation + Alert)、L2 = 1 (Confidence)、L3 Disclosure = 残** |
| SendBackComment の route | 別 route `/cases/:id/comment` 独立 page | **同 page section 切替** (route 維持、UI は section toggle) |
| PrimaryAnchor strip | なし | **status 連動 strip** (Header 直下) |

## Layout 詳細

### Header (sticky)
- breadcrumb 3 segment
- h1 = `{case.id} {case.workflowName}`
- chip × 1 (status)
- L2: 経過 + 注意 + hedge
- Sticky Lifecycle Stepper (Header 下段)

### Body 2-col
- primary 7/12: AI 入力結果 (Section A) / 差戻しコメント form (Section B、`/comment` route 時に表示、smooth toggle)
- aux 5/12: Citation L1 / Alert L1 / Confidence L2 / Staging L3 / 関連 rule L3 / PDF preview L3 / Evidence Timeline L3

### Footer
- status 連動 CTA + BusinessApprovalChip mock (demoted)

## research-compounder 違反対応

- **AI-native HIL Approval UI** (5 state timeline 1 viewport): Lifecycle Stepper を sticky 化、5 state を常時 1 viewport
- **Executive Dashboard Layout** (3 layer 分離): Citation tier (L1) / Confidence tier (L2) / Diagnostic tier (L3 Disclosure)

## Charter 適用

- One-Glance Hierarchy: PrimaryAnchor + Lifecycle Stepper sticky で「今 status は何か / 何をすべきか」が画面開いた瞬間
- Progressive Disclosure: Staging / 関連 rule / Evidence Timeline / PDF preview を L3
- Action Proximity: Footer の 承認 / 差戻し CTA、PrimaryAnchor strip
- State Transparency: Lifecycle Stepper で全 state 可視
- Make the State Visible: status === ready / pending / sent-back 等で PrimaryAnchor / Footer の表現が変わる
- Subtract before Adding: aux 5 panel → L1 = 2 (Citation + Alert) のみ
- Signal over Ornament: diff block の emerald / red は semantic、装飾なし
- Invest in the Smallest Thing: confidence bar per field、Lifecycle dot 8px、信頼度 mono tabular

## Phase 1A pilot 後 Step 2.6 patch 想定

- Lifecycle Stepper sticky の Claude Design 描画が成立するか
- Section A → B (SendBackComment) の section 切替が同 conversation で表現できるか
- Drawer (Queue から) → CaseDetail へ navigate context の表現
