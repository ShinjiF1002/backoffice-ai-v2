# 旧 prototype 9 画面 — Visual Inventory (text-only ASCII layout)

> Source: `~/code/active/backoffice-ai-v2/prototype/src/pages/*.tsx` (9 file)
> screenshot 不在でも「現状の visual と直したい点」を再現性高く Claude Design に伝える。

---

## 全画面共通 chrome (現状)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Sidebar (left, 224px, white panel)              │ TopBar (h-14, white) │
│ ─ B │ Backoffice AI v2 prototype                │ [Search...] [🔔] [Mode pill] [山田太郎] │
│ ─────────────────────────────                   │                                          │
│ ◉ ダッシュボード                                 │ ─────────────────────────────────────── │
│ ◉ 受信トレイ                                     │                                          │
│ ◉ 案件処理 (Inbox alias)                          │                                          │
│ ◉ AI 提案レビュー                                 │  Main (Outlet)                           │
│ ◉ Agent 設定                                      │                                          │
│ ◉ 監査証跡                                        │                                          │
│ ◉ メトリクス                                      │                                          │
│ ◉ ナレッジ                                        │                                          │
│ ─────────────────────────────                   │                                          │
│ 👤 山田太郎 / 入力者                              │                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

問題: Sidebar 8 nav (案件処理 = Inbox alias は cognitive load)、TopBar search / notification は static silhouette (enabled no-op、混乱を招く)。

---

## 画面 1: Dashboard (旧) — 認知負荷が最も濃い

```
┌── Main ──────────────────────────────────────────────────────────────────┐
│ Header (sticky, 88px):                                                    │
│   ダッシュボード                                                           │
│   ダッシュボード [案件数 13][注意 4][承認者承認待ち 2]  [仮説/要検証] UC-BO-01+02 │
│ ─────────────────────────────────────────────────────────────────────── │
│ ★ NextActionStrip (primary 1):                                            │
│   次に処理すべき案件: CASE-2026-0142 (経過 03:24:15)  [開く >]            │
│ ─────────────────────────────────────────────────────────────────────── │
│ ★ Cockpit (5 KPI strip): [仮説/要検証]                                    │
│   案件総数 13 | 注意 4 | 承認者承認待ち 2 | SLA 3h 超 1 | 反映済 (本日) 2 │
│   ↑ vanity metric「案件総数」「反映済」が混在                              │
│ ─────────────────────────────────────────────────────────────────────── │
│ ★ Attention strip (queue-level、SLA 3h 超 1 件):                          │
│   ⚠️ 注意 · 1 件   入力者確認待ちで 3 時間以上経過 (CASE-2026-... [確認]) │
│ ─────────────────────────────────────────────────────────────────────── │
│ Body:                                                                     │
│ ─ 業務別の状況 (2 card 並列、各 card に 11 element grid) ─                │
│ ┌──────────────────────────┐ ┌──────────────────────────┐                │
│ │ UC-BO-01 法人住所変更    │ │ UC-BO-02 口座開設書類完備 │                │
│ │ [要注意] (state badge)   │ │ [通常稼働]               │                │
│ │ 案件 8 / 注意 3 / 承認1 │ │ 案件 5 / 注意 1 / 承認 1 │                │
│ │ ─ Breakdown 5 行: ─     │ │ ─ Breakdown 5 行: ─     │                │
│ │  AI処理中 2              │ │  AI処理中 1              │                │
│ │  入力者確認待ち 3        │ │  入力者確認待ち 2        │                │
│ │  再処理中 1              │ │  再処理中 0              │                │
│ │  承認者承認待ち 1        │ │  承認者承認待ち 1        │                │
│ │  反映済 1                │ │  反映済 1                │                │
│ │ ─ Sparkline 7d 注意率 ─ │ │ ─ Sparkline 7d 注意率 ─ │                │
│ │ [法人住所変更の案件を開く>] │ [口座開設書類完備の案件を開く>]              │                │
│ └──────────────────────────┘ └──────────────────────────┘                │
│ ─ 業務オペレーション動線 (5 button shortcut bar) ─                        │
│   [受信トレイ 13] [案件レビュー] [コメント付き差戻し] [AI 提案レビュー] [メトリクス確認] │
│ ─────────────────────────────────────────────────────────────────────── │
│ Footer (sticky):                                                          │
│   業務カード・動線・注意行は画面内モック状態からの集計。                  │
└──────────────────────────────────────────────────────────────────────────┘
```

### 直したい点
- L1 primary action が 3 並列: NextActionStrip / 業務 card × 2 / Workflow lane 5 button = **8 entry-point**
- Cockpit 5 KPI に vanity (案件総数 / 反映済) が混在 → Headline tier として violate
- 業務 card 1 つに 11 element (chip + 3 数値 + 5 breakdown + sparkline + CTA)
- Workflow lane 5 button は demo 用 cmd shortcut、primary anchor を希釈
- 文字 token block ~45 個

---

## 画面 2: Inbox (旧)

```
Header (sticky):
  受信トレイ
  受信トレイ  [13 件]    [並び順: 受付順 ▾]
  🔍 業務:すべて | 状態:すべて | 担当者:すべて | 経過時間:すべて  ← filter chip 4 (disabled)
─────────────────────────────────────────────────────
NextActionStrip: 次に処理すべき案件 CASE-2026-0142  [開く]
─────────────────────────────────────────────────────
Table (7 columns):
┌────────────┬────────┬─────────┬──────┬────────┬───────┬──┐
│ 案件 ID    │ 業務   │ 状態    │ 経過 │ 担当者 │ 注意  │ >│
├────────────┼────────┼─────────┼──────┼────────┼───────┼──┤
│ CASE-..0142│ 法人住所│ 確認待ち│ 03:24│ 山田太郎│ ⚠️ 2  │ >│
│ CASE-..0138│ 法人住所│ AI処理中│ 02:11│ 佐藤花子│  —    │ >│
│ ...        │ ...    │ ...     │ ...  │ ...    │ ...   │ >│
└────────────┴────────┴─────────┴──────┴────────┴───────┴──┘
─────────────────────────────────────────────────────
Footer (sticky):
  1 - 13 / 13 件 | AI処理中 5 / 確認待ち 4 / 承認者待ち 2 / 差戻し 1 / 完了 1   [一括承認] [一括差戻し]
```

### 直したい点
- 7 列 table、column 多すぎ (案件 ID / 業務 / 状態 / 経過 / 担当者 / 注意 / >)
- filter chip 4 disabled (UI 上 enabled に見えるが no-op、混乱)
- Footer に 5 status counter inline (case 数 + AI処理中/確認待ち/承認者/差戻し/完了) — text 重複
- 一括 action 2 disabled (footer 内、混乱)

---

## 画面 3: CaseReview (旧、12-col grid)

```
Header (sticky):
  受信トレイ › 案件処理 › CASE-2026-0142
  CASE-2026-0142 法人住所変更    [入力者確認待ち] [⚠️ 注意 2] [経過 03:24:15]
  ─ Lifecycle Stepper ─: 受付 → AI処理 → ●入力者確認 → 承認者承認 → 反映
─────────────────────────────────────────────────────
Attention strip (1 行 1 件、注意 2 が strip 化)
─────────────────────────────────────────────────────
Body (12-col grid):
┌─ 7/12: AI 入力結果 (primary) ──────────┬─ 5/12: aux ──────────┐
│ ┌─ View toggle (raw / diff / value) ┐ │ ┌─ Citation panel ─┐ │
│ │ 法人名: 株式会社サンプル...        │ │ │ 承認済 (3 件)    │ │
│ │ 新住所: 東京都千代田区... [diff]   │ │ └────────────────┘ │
│ │ 旧: ...                            │ │ ┌─ Staging hint ─┐ │
│ │ 信頼度 0.84                       │ │ │ 未承認ヒント   │ │
│ └────────────────────────────────────┘ │ └────────────────┘ │
│ ┌─ Evidence Timeline ────────────────┐ │ ┌─ Confidence bar ┐ │
│ │ 受付 → OCR → DB照合 → AI生成 → ... │ │ │ 0.84            │ │
│ └────────────────────────────────────┘ │ └────────────────┘ │
└────────────────────────────────────────┴────────────────────┘
─────────────────────────────────────────────────────
Footer (sticky):
  [差戻し (コメント付き)] [承認] [BusinessApprovalChip mock]
```

### 直したい点
- aux col に Citation / Staging / Confidence / 関連 rule など 4-5 panel 積み重ね
- Lifecycle Stepper は Header 内、scroll で見えなくなる
- Evidence Timeline と AI 入力結果が primary col に同居、密度過剰

---

## 画面 4: SendBackComment (旧、CaseReview の child route)

```
Header (sticky):
  受信トレイ › 案件処理 › CASE-2026-0142 › 差戻しコメント
  CASE-2026-0142 差戻しコメント
─────────────────────────────────────────────────────
Body (max-w-3xl inner、form 中心):
  案件概要 (5 field grid)
  差戻し分類 (5-category radio: data_error / address_mismatch / ...)
  data_error warning (conditional)
  差戻し理由 textarea
  関連 evidence checklist
─────────────────────────────────────────────────────
Footer (sticky):
  [キャンセル] [差戻し送信]
```

### 直したい点
- 別 route (`/cases/:id/comment`) で context 切替が必要 → CaseDetail と同 page section 切替の方が flow 良い
- 5-category radio + data_error conditional warning は段階化されていない

---

## 画面 5: ProposalReview (旧、12-col grid)

```
Header (sticky):
  受信トレイ › AI 提案レビュー › PROP-2026-031
  提案 title (truncate)   [審査中] [経過 12h] [提案ソース v1.2]
  ─ Proposal Lifecycle Stepper ─: 整理 → ●承認 → 反映
─────────────────────────────────────────────────────
Body (12-col grid):
┌─ 7/12: 判定基準 + 元案件 + 未承認ヒント ──┬─ 5/12: 提案メタ ─┐
│ 判定基準 (3-5 行 list)                    │ Change author    │
│ 元案件 link                                │ Reason           │
│ 未承認ヒント (staging hint panel)           │ Confidence 0.81  │
│                                            │ Affected 12 cases│
│                                            │ Reversibility    │
└────────────────────────────────────────────┴──────────────────┘
─────────────────────────────────────────────────────
Footer (sticky):
  [差戻し] [業務責任者へ送付] (status-conditional disabled)
```

### 直したい点
- 提案メタ 5 element が aux col に full 表示、L3 Disclosure 化候補
- 未承認ヒント panel が L1 visible、staging governance を強調しすぎ

---

## 画面 6: AgentSettings (旧、縦 section)

```
Header (sticky):
  ダッシュボード › Agent 設定 › agent-corporate-address-change
  agent name    [trust: Supervised] [version v2.3]
─────────────────────────────────────────────────────
Body (縦 sections):
  Trust Progression (4 KPI grid、進化要件)
  Config (5 field grid: モデル / プロンプト / ツール / 権限 / 上限)
  Simulation (snapshot)
  History (timeline)
```

### 直したい点
- 4 section 縦並び、各 section 中身が dense
- Trust Progression の 4 KPI grid は L3 Disclosure 化候補

---

## 画面 7: AuditTrail (旧、縦 timeline)

```
Header (sticky):
  監査証跡
  監査証跡  [期間: 直近 7 日 ▾] [業務: すべて ▾] [event 数 124]
─────────────────────────────────────────────────────
Body:
  Filter strip (期間 / 業務 / actor)
  Timeline (1 行 1 event、actor band + time + before-after diff)
  ...
Footer:
  Pagination
```

### 直したい点
- Filter / Timeline / Pagination の縦並び、column 数固定
- 各 event 行が長文 (actor + action + before-after diff + meta)

---

## 画面 8: Metrics (旧、縦 section)

```
Header (sticky):
  メトリクス
  メトリクス  [期間] [業務 filter]
  ─ 仮説 framing 注 (mandatory inset) ─
─────────────────────────────────────────────────────
Body (縦 sections):
  4 KPI gate (横並び 4 grid)
  Auxiliary metrics (2x2 grid)
  9 KRI 監視 (R1-R9、3 col grid、state-conditional badge)
  Trends (2 col grid、chart)
```

### 直したい点
- 4 section 縦並び、各 section の grid が画面ごと別ルール (4 col / 2 col / 3 col / 2 col)
- 仮説 framing 注が常時表示、L4 level

---

## 画面 9: KnowledgeBrowser (旧、縦 list)

```
Header (sticky):
  ナレッジ
  ナレッジ  [期間] [業務 filter] [snippet 124]
  L4 expand: weight semantics + 補足 (citation governance core は L1 banner 残置)
─────────────────────────────────────────────────────
Body (縦 sections):
  Filter strip (期間 / 業務 / weight)
  List (snippet 1 行 1 件)
  ...
```

### 直したい点
- Filter / List の縦並び、AuditTrail / Metrics と layout 似ているが variant あり (column 数 / chip 種類)

---

## 9 → 6 集約 mapping (再掲、本 plan path β)

| 旧 | 新 | 統合方法 |
|---|---|---|
| Dashboard | Hub | 3-tier (Headline 3 / Drill 2 / Diagnostic) |
| Inbox | Queue | Table + Drawer + recommended row highlight |
| CaseReview + SendBackComment | CaseDetail | 2-col DetailBody + section 切替 (child route) |
| ProposalReview | ProposalDetail | 2-col DetailBody + meta L3 Disclosure |
| AgentSettings | AgentDetail | 2-col DetailBody + 4 KPI grid L3 |
| AuditTrail + Metrics + KnowledgeBrowser | Observatory | 1 画面 3 tab (`?tab=audit/metrics/knowledge`) |

---

## 共通の "直したい点" まとめ (Claude Design に伝える要旨)

1. **1 画面 1 Primary Action** — NextActionStrip / 業務 card / Workflow lane の 3 並列を 1 本に集約
2. **段階 Disclosure** — Cockpit 5 KPI / 業務 card breakdown / hedge 詳細を L3 default closed に降格
3. **3 typology lock** — A 型 (Hub / Observatory) / B 型 (Queue) / C 型 (Detail) のみ、画面間で同 skeleton
4. **JP density medium-high keep** — Operational Premium Light token は変更しない、IA と hierarchy のみ更新
