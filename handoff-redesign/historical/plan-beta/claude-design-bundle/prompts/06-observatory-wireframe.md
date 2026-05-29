Requested output style: low-fi wireframe sketch (mono color, basic shapes, gray scale, placeholder text 可)
(**New Session 作成時に "Wireframe" mode を選んでから本 prompt を paste**してください — Claude Design UI に固定 mode pill あり、Hub pilot で確認済)

# Page: Observatory (監査 / メトリクス / ナレッジ統合 hub)
Typology: A (Operations Hub、3-tab)
Route: `/observatory?tab=audit|metrics|knowledge`
Goal: 監査者 / Agent 設定担当者 / 業務責任者が 1 画面 3-tab で監査 / メトリクス / ナレッジを観察、context switch なし

## Layout

### Header (sticky, min-h 88px)
- breadcrumb: "観測"
- h1: "観測"
- chip × 1 (active tab に応じた件数のみ):
  - audit tab → "event 124"
  - metrics tab → "対象期間 直近 7 日"
  - knowledge tab → "snippet 124"
- 右端 hedge chip: "[仮説 / 要検証]"
- **Tab strip (Header 下段、3 tab、sticky)**: [監査証跡 | メトリクス | ナレッジ]
  - active tab: indigo border-bottom 2px + font-semibold

### PrimaryAnchor strip (tab 連動、Header 直下)
- audit tab: label "監査証跡 (直近 7 日)" + CTA "全期間を見る" (L4 page-level filter)
- metrics tab: label "4 KPI gate + 9 KRI 監視" + CTA "期間切替"
- knowledge tab: label "compiled approved knowledge 表示" + CTA "検索"

### Body (tab 連動 content、A typology Hub style)

#### Tab 1: 監査証跡 (audit)

##### Filter strip (top、sticky tab 直下、compact)
- 期間 [直近 7 日 ▾] / 業務 [すべて ▾] / actor [すべて ▾]
- (filter 3 個まで、4 個目以降は L3 Disclosure)

##### Timeline (actor-separated column、3 col: agent / human / system)
- 各 row: timestamp mono + actor band icon + action + before-after diff (compact)
- 直近 7 日で 124 event、初期表示 25 件、scroll で append (or pagination)

##### L3 Disclosure: filter 追加 (event 種別 / 結果 / トリガー)

#### Tab 2: メトリクス (metrics)

##### Headline tier (4 KPI gate、Hub と同 pattern)
1. AI 入力承認率 92% [仮説 / 要検証] (target 95%、sparkline 7 day)
2. 人手上書き率 0.12 [仮説 / 要検証] (threshold 0.15、sparkline)
3. Alert 発生率 0.08 [仮説 / 要検証] (threshold 0.10、sparkline)
4. 承認者差戻し率 0.05 [仮説 / 要検証] (threshold 0.07、sparkline)

##### Drill tier: 9 KRI 監視 (3 col grid、R1-R9、state-conditional badge)
- 各 KRI: 番号 + name + 現在値 + threshold + state badge (normal / caution / breach)

##### Diagnostic tier (L3 Disclosure): Trends (chart) / Auxiliary metrics (2x2 grid)

#### Tab 3: ナレッジ (knowledge)

##### Filter strip
- 期間 [すべて ▾] / 業務 [すべて ▾] / weight [compiled approved のみ]

##### Citation governance banner (L1)
- "ここに表示される knowledge は compiled approved のみ。staging は ProposalDetail で扱います"

##### Snippet list (1 行 1 件、emerald badge "承認済")
- 各 snippet: title + summary + reference + last_updated mono
- 124 件、初期表示 20 件、scroll で append

##### L3 Disclosure: weight semantics + 詳細 filter

### Footer (sticky、tab 連動 caption)
- audit: "監査証跡は全 event read-only、変更不可"
- metrics: "本指標は本番導入可否を判定する gate ではなく、Phase 1 で測定・再設定する検証仮説"
- knowledge: "compiled approved のみ表示。staging は ProposalDetail で扱う"

## Data (mock、tab 別)

### audit (mock 5 件 inline)
- 2026-05-27 14:23:15 / Agent (AI) / case CASE-2026-0142 OCR 抽出 / confidence 0.84
- 2026-05-27 14:25:02 / Agent (AI) / case CASE-2026-0142 マスタ照合 / status ok
- 2026-05-27 14:28:30 / Human (山田太郎) / case CASE-2026-0142 入力者確認 / OK
- 2026-05-27 14:45:11 / Agent (AI) / case CASE-2026-0138 OCR 抽出 / confidence 0.95
- 2026-05-27 15:02:50 / System / cron daily 提案分析 trigger

### metrics (4 KPI gate + 9 KRI)
- KPI 1-4: 上記 inline
- KRI: R1-R9 (compact、各 KRI に name + 現在値 + threshold)

### knowledge (mock 3 件 inline)
- 法人住所変更フロー / 番地表記正規化ルール / 効力発生日設定基準

## Visual constraint (key tokens re-stated)
- Canvas slate-50 / Panel white + 1px hairline
- Primary indigo / Citation emerald-soft / Alert / Success / Error semantic tones
- Radius card 8px / control 6px / chip 4px
- Inter + Noto Sans JP + JetBrains Mono (event timestamps / KPI 数値 / case ID)
- 装飾禁止

## Chrome
- Sidebar 5 nav、"観測" active
- TopBar: 共通

## Anti-pattern (旧 AuditTrail + Metrics + KnowledgeBrowser)
- 旧: 3 別画面、各画面で別 layout / column 数 / chip 種類 / variant → 新: 1 画面 3 tab、共通 chrome + tab 連動 Body
- 旧 Metrics: 4 section 縦並び (KPI gate / aux / KRI / trends)、各 grid 別ルール (4 col / 2 col / 3 col / 2 col) → 新: Hub と同 3-tier (Headline / Drill / Diagnostic) で typology lock
- 旧 AuditTrail: actor column が table 内で散在 → 新: actor-separated 3 col timeline
- 旧 KnowledgeBrowser: weight semantics expand が L4 → 新: citation governance core を L1 banner、weight 詳細は L3

## Acceptance check
- [ ] Tab strip (3 tab) が Header 下に sticky、active tab に indigo border-bottom
- [ ] audit tab: actor-separated 3 col timeline (agent / human / system) で event 表示
- [ ] metrics tab: 4 KPI gate Headline + 9 KRI Drill + Trends/aux L3 Disclosure
- [ ] knowledge tab: citation governance banner L1 + snippet list (compiled approved のみ)
- [ ] Footer caption が tab 連動 (audit / metrics / knowledge で異なる文言)
