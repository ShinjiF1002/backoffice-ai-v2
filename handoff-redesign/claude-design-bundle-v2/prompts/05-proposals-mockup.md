Requested output style: High Fidelity (Operational Premium Light、full color token + micro-interaction)
(New Session 作成時に mode = High Fidelity を選んでから本 prompt を paste)

# Page: 提案一覧 (Proposals) — Process-First v2 ★新設
Typology: B (Queue / List master)  /  Route: /proposals  /  Role: Manual 管理者
Goal: Manual 管理者が、AI が差戻しパターンから生成した手順改定提案を triage する順に選ぶ。row click で 提案詳細 へ。

## 前提 (Project context に登録済、再 paste 不要)
- design-system / ia-overview-v2 / screen-contracts-v2 / mock-fixture-spec-v2
- TopBar: ProcessSelector `[業務: 法人住所変更 ▾]` + PrototypeModeLabel「プロトタイプ表示 — 外部システム未接続 / 証跡はモック」
- Sidebar nav: ハブ / 受信トレイ / AI 提案レビュー / Agent 設定 / モニタリング
- UI 言語規範: R-ID / event 名 / status enum / 内部語 (cron / trigger / 突合) / (mock) / 英語断片を画面に出さない。status は業務語。
- token: canvas #F8FAFC / panel white + 1px hairline #E5E7EB / primary #635BFF / radius 8-6-4 / Inter + Noto Sans JP + JetBrains Mono / 装飾禁止 / JP-only / hardcode hex なし

## Layout

### Header (sticky)
- h1「AI 提案レビュー — 提案一覧」+ subtitle「日次提案分析が差戻しパターンから生成した手順改定の候補」(※「cron」「trigger」は使わない、業務語「日次提案分析」)

### Table
列: 提案 ID (mono) / 業務 / **どの部分の改定か** (例「OCR 信頼度の閾値引き上げ」= 平易表現、内部語 OCR raw 等は避け一般語) / **影響件数** (過去 case 何件相当) / 状態 (確認待ち / 上長へ送付済 等、業務語) / →
- row click → **提案詳細**
- 「どの Process のどの部分の話か」が一覧で分かること

## Data (mock-fixture §6、これ以外作らない)
- PROP-2026-031: 業務 = 法人住所変更 / 改定 =「住所読み取りの判定基準を厳しめに調整 (0.85→0.88 相当、UI は平易語)」/ 影響 = 過去 12 case 相当 / 状態 = 確認待ち
- (一覧の見栄えのため同種 1-2 件を mock で足してよいが、数値は fixture を超えない範囲の synthetic)

## Anti-pattern
- ✗ 一覧欠落・どの Process か不明 (F-09) → 業務列 + 改定内容を明示
- ✗「cron」「trigger」露出 → 「日次提案分析」
- ✗ status enum / 内部語を画面に出す → 業務語

## Acceptance check
- [ ] table に 業務 / どの部分の改定か / 影響件数 / 状態
- [ ] 「日次提案分析」表記 (cron / trigger なし)
- [ ] row click → 提案詳細
- [ ] sidebar nav = モニタリング / token 適用 / JP-only
