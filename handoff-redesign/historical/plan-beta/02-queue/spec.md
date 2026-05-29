# Queue — Internal Spec

## Page identity

| 項目 | 値 |
|---|---|
| 旧 mapping | `prototype/src/pages/Inbox.tsx` |
| 新 route | `/queue` (Sidebar nav `受信トレイ`) |
| typology | B (Master、Table + Drawer) |

## Goal

入力者が table 1 viewport で全案件を scan、recommended row を highlight として認識、Drawer で 5 秒 preview してから CaseDetail へ進める。

## Primary Action (1 つ)

- **PrimaryAnchor "次に処理すべき案件を開く"** — Header 直下 strip
- CTA → 該当 row の Drawer 開く、CaseDetail へ進める

## Mechanical metric (target)

| Metric | 旧 Inbox | 新 Queue (target) |
|---|---|---|
| Table column 数 | 7 | **5** |
| Filter chip 表示数 (default L1) | 4 disabled visible | **0** (L3 Disclosure 行き) |
| Footer 内 status counter | 5 inline | **0** (caption 1 文 only) |
| Bulk action button (default L1) | 2 disabled visible | **0** (L3 Disclosure 行き) |

## Layout 詳細

- Table 5 column: 案件 ID (mono ~140) / 業務 (~120) / 状態+経過 (flex-grow) / 担当者 (ActorBand ~100) / 注意 (chip ~60)
- Recommended row: `alertCount > 0 && parseElapsed max` の 1 件、alert-soft tint highlight + 1px border-left alert
- Drawer 480px、row click で slide-in、non-modal
- L3 Disclosure: filter chip 4 + sort selector + bulk action 2

## research-compounder 違反対応

- **Enterprise SaaS IA** (master-detail、Table + Drawer default): 旧は table + detail page (URL share)、新は Drawer 併用で context 維持 + Drawer 内 CTA で CaseDetail へ
- **AI-native HIL Approval UI** (timeline 列で 5 state 1 viewport): 旧は status chip ばらまき → 新は status + 経過 + actor を 1 column に圧縮 timeline 表現

## Charter 適用

- One-Glance Hierarchy: PrimaryAnchor + recommended row highlight で「次にやること」が画面開いた瞬間に分かる
- Progressive Disclosure: filter / sort / bulk を L3 Disclosure
- Action Proximity: row click → Drawer CTA inline
- Subtract before Adding: 7 column → 5 column、4 filter chip → 0 L1
- Make the State Visible: status badge semantic tone + 経過 status-tinted

## Phase 1A pilot で Hub 完了後の Step 2.6 で patch 想定の項目

- Claude Design が 5 column table を 1 viewport で render できるか (横 scroll しないか)
- Drawer の non-modal 表現が成立するか (background scrollable)
- recommended row highlight の visual が alert-soft tint で十分か (border-left も必要か)
