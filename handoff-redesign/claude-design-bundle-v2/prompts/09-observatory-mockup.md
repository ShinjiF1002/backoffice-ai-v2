Requested output style: High Fidelity (Operational Premium Light、full color token + micro-interaction)
(New Session 作成時に mode = High Fidelity を選んでから本 prompt を paste)

# Page: モニタリング (Observatory) — Process-First v2 (旧「観測」を rename、3-tab)
Typology: A (Hub / Observatory)  /  Route: /observatory  /  Role: 監査者
Goal: 監査者が Process 別に 案件の証跡・AI 精度・ナレッジ を監視する。read-only。
※ UI ラベル・画面タイトル・breadcrumb・sidebar nav は全て「**モニタリング**」(route / 内部名のみ Observatory)。

## 前提 (Project context に登録済、再 paste 不要)
- design-system / ia-overview-v2 / screen-contracts-v2 / process-selector-spec / mock-fixture-spec-v2
- TopBar: ProcessSelector `[業務: 全業務 ▾]` (横断) / 特定選択で Process scoped + PrototypeModeLabel「プロトタイプ表示 — 外部システム未接続 / 証跡はモック」
- Sidebar nav: ハブ / 受信トレイ / AI 提案レビュー / Agent 設定 / **モニタリング**
- UI 言語規範: R-ID / status enum / 内部語 (cron / trigger / OCR raw / 突合) / (mock) / 英語断片を画面に出さない。**例外: 監査の raw event ledger view は exportable schema 性質上、技術 field 名・confidence を表示可** (業務 UI ではなく監査 view のため)。
- token: canvas #F8FAFC / panel white + 1px hairline #E5E7EB / primary #635BFF / radius 8-6-4 / Inter + Noto Sans JP + JetBrains Mono / 装飾禁止 / JP-only / hardcode hex なし

## Layout: 3 tab

### Header (sticky)
- h1「モニタリング」+ tab: `[監査] [メトリクス] [ナレッジ]`

### Tab 1: 監査 (2 view 切替)
- **(a) case lifecycle view** (業務順、default): CASE-2026-0142 の 5 event を**業務順**に timeline 表示:
  受付 09:00 (system) → **AI 入力 09:02 (AI、時刻明示)** → 入力者確認 10:15 (山田太郎、ビル名を申請書類値で確定 + 他 accept) → **承認者承認 11:30 (鈴木課長)** → 反映 11:31 (system)
  - 旧の論理矛盾を解消: AI 入力時刻を明示、承認者 event を含める、人確認の後に AI が処理する矛盾を作らない。
- **(b) raw event ledger view** (切替): exportable な行: timestamp / actor / role / action / before-after / source doc / policy version / approval id / confidence (※この view のみ confidence 表示可)。SoD evidence (入力者 ≠ 承認者) が分かる。

### Tab 2: メトリクス (Process 別)
- 全社合算でなく **Process 別 KPI**: 法人住所変更 / 口座開設書類完備 ごとに 承認率 / 上書き率 / Alert率 / 差戻し率 (`[仮説/要検証]`)。
- 法人住所変更: 承認率 92% (未達) ほか §5 の値。MetricVsThreshold 流用可。

### Tab 3: ナレッジ (Process 別 grouping)
- フラット並列でなく **Process 別に grouping**。各 Process の承認済ナレッジ (例: 法人住所変更 = 法人住所変更フロー / 番地表記正規化ルール / 効力発生日設定基準)。
- 「日次提案分析が差戻しパターンから提案を生成」を業務語で示す (cron / trigger は使わない)。

## Data (mock-fixture §8/§9/§5/§10、これ以外作らない)
- lifecycle 5 event = §8 / raw ledger schema = §9 / Process 別 KPI = §5 / 日次提案分析 = §10

## Anti-pattern
- ✗ Process 横断のみ (F-01/04/05) → 3 tab とも Process 別
- ✗ timeline 論理矛盾・AI 入力時刻なし・承認者 event 欠落 (F-02/03) → 業務順 + AI 時刻 + 承認者 event
- ✗「cron」露出 (F-03) → 「日次提案分析」
- ✗ nav/タイトルが「観測」のまま → 「モニタリング」
- ✗ 業務 UI に confidence (※ただし raw ledger view は例外で表示可)

## Acceptance check
- [ ] nav・h1・breadcrumb が「モニタリング」(観測なし)
- [ ] 監査 tab = lifecycle view (業務順 + AI 時刻 + 承認者 event) と raw ledger view の 2 view 切替
- [ ] メトリクス tab = Process 別 KPI (全社合算でない)
- [ ] ナレッジ tab = Process 別 grouping
- [ ]「日次提案分析」表記 (cron / trigger なし)
- [ ] confidence は raw ledger view のみ (業務 view では非表示)
- [ ] token 適用 / JP-only
