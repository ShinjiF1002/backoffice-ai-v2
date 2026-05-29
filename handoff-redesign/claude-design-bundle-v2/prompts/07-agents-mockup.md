Requested output style: High Fidelity (Operational Premium Light、full color token + micro-interaction)
(New Session 作成時に mode = High Fidelity を選んでから本 prompt を paste)

# Page: エージェント一覧 (Agents) — Process-First v2 ★新設
Typology: B (Queue / List master)  /  Route: /agents  /  Role: AI 管理者
Goal: AI 管理者が、どの Agent の Trust (自動化レベル) を見直すか選ぶ。row click で エージェント詳細 へ。

## 前提 (Project context に登録済、再 paste 不要)
- design-system / ia-overview-v2 / screen-contracts-v2 / mock-fixture-spec-v2
- TopBar: ProcessSelector `[業務: 全業務 ▾]` (全業務 = 全 Agent 横断) + PrototypeModeLabel「プロトタイプ表示 — 外部システム未接続 / 証跡はモック」
- Sidebar nav: ハブ / 受信トレイ / AI 提案レビュー / Agent 設定 / モニタリング
- UI 言語規範: R-ID / event 名 / status enum / 内部語 (confidence 等) / (mock) / 英語断片を画面に出さない。Trust Level は Tier 2 語彙 (Supervised 等) は可。
- token: canvas #F8FAFC / panel white + 1px hairline #E5E7EB / primary #635BFF / radius 8-6-4 / Inter + Noto Sans JP + JetBrains Mono / 装飾禁止 / JP-only (Trust Level の英語固有名詞は可) / hardcode hex なし

## Layout

### Header (sticky)
- h1「Agent 設定 — エージェント一覧」+ subtitle「業務別 AI Agent の自動化レベルと直近パフォーマンス」

### Table
列: Agent 名 / 業務 / **Trust Level** (Supervised / Checkpoint / Autonomous の badge) / **直近パフォーマンス** (承認率の sparkline、30日) / **昇格可否** flag (例「承認率が基準未達のため昇格保留」を平易語で) / →
- row click → **エージェント詳細**
- 昇格可否は理由付き (なぜ保留か = どの指標が未達か、平易語)

## Data (mock-fixture §1/§5、これ以外作らない)
- agent-corporate-address-change (法人住所変更): Trust = Supervised / 承認率 92% [仮説/要検証] / 昇格可否 = 保留 (承認率が基準 95% 未達)
- agent-account-opening (口座開設書類完備): Trust = Supervised / sparkline mock / 可否 mock
- 国際送金等の restricted boundary Agent は一覧に含めない

## Anti-pattern
- ✗ 一覧欠落 (F-07) → 全 Agent 一覧を成立
- ✗ 昇格可否が理由なし → 未達指標を平易語で
- ✗ confidence 生数字 / status enum を画面に出す

## Acceptance check
- [ ] table に Trust Level badge + 直近パフォーマンス sparkline + 昇格可否 (理由付き)
- [ ] row click → エージェント詳細
- [ ] confidence 生数字なし
- [ ] sidebar nav = モニタリング / token 適用 / JP-only (Trust 英語固有名詞のみ可)
