Requested output style: High Fidelity (Operational Premium Light、full color token + micro-interaction)
(New Session 作成時に mode = High Fidelity を選んでから本 prompt を paste)

# Page: エージェント詳細 (AgentDetail) — Process-First v2 (原則 A/B/C 適用)
Typology: C (Detail Workspace)  /  Route: /agents/:id  /  Role: AI 管理者
Goal: AI 管理者が、実績 (4 KPI) vs 閾値 と昇格の帰結を見て、Trust 昇格を申請するか決める。

## 前提 (Project context に登録済、再 paste 不要)
- design-system / ia-overview-v2 / screen-contracts-v2 / metric-vs-threshold-spec / consequence-panel-spec / allowed-actions-and-state-transitions / mock-fixture-spec-v2
  (A/B/C 原則は本 prompt の ★ section に inline 済、別 file 不要)
- TopBar: ProcessSelector `[業務: 法人住所変更 ▾]` + PrototypeModeLabel「プロトタイプ表示 — 外部システム未接続 / 証跡はモック」
- Sidebar nav: ハブ / 受信トレイ / AI 提案レビュー / Agent 設定 / モニタリング
- UI 言語規範: R-ID / event 名 / status enum / 内部語 (confidence / 突合) / (mock) / 英語断片を画面に出さない。Trust Level の英語固有名詞 (Supervised 等) は可。
- token: canvas #F8FAFC / panel white + 1px hairline #E5E7EB / primary #635BFF / radius 8-6-4 / Inter + Noto Sans JP + JetBrains Mono / 装飾禁止 / JP-only (Trust 英語固有名詞のみ可) / hardcode hex なし

## ★ 全画面共通 検証・操作原則 (cross-screen-refresh-findings、C 型に適用)
- **A 全体レビュー可能性**: **4 KPI を全件表示** (未達の承認率だけ出さない)。「進化要件 75% 集約値」は禁止。
- **B 証拠アンカー可視性**: 各 metric の裏付け = **実行履歴 / sample case を参照可能**に (数字から根拠 case へ drill)。
- **C 単一決定面**: standing は **「設定変更を申請」1 つ**。補助操作 (履歴閲覧 / rollback 説明) を競合 cluster にしない。

## Layout

### Header (sticky)
- breadcrumb: 法人住所変更 › Agent 設定 › agent-corporate-address-change
- h1: 法人住所変更 Agent + Trust Level badge「Supervised」+ subtitle「自動化レベルの昇格を判断」

### Body (2-col)
#### 主列 (左 ~7/12)
1. **実績 vs 閾値** = `<MetricVsThreshold>` **4 KPI 全件** (各行: 実績 / 閾値 / 判定 / 期間 / 分母 / 前回差、`[仮説/要検証]` 明示):
   - AI 入力承認率 **92%** (≥95% **未達 -3pt**、直近30日 1,240件、前月+2pt) ← alert tone
   - 人手上書き率 0.12 (≤0.15 達成、前月-0.01)
   - Alert 発生率 0.08 (≤0.10 達成)
   - 承認者差戻し率 0.05 (≤0.07 達成)
   - → 承認率のみ未達 = 「昇格は承認率が基準到達まで保留」が読める
2. **昇格の帰結** = `<ConsequencePanel>` (Supervised → Checkpoint):
   - 人レビュー 80→約30 件/日 ↓ / 自動入力 0→約50 件/日 ↑ / 🛡 rollback: 承認率が7日連続で閾値割れ → Supervised に自動降格

#### 補助列 (右 ~5/12) — 根拠 (原則 B)
- **実績の裏付け**: 直近の実行履歴 / sample case (各 KPI から該当 case 群へ drill 可)。Config 3 行 (model / 権限 / ツール、Tier 2 語彙)。

### Footer (sticky、1 セットのみ — 原則 C)
- [**設定変更を申請**] (4 KPI + consequence 確認後に enabled、未達があれば「承認率が基準未達」を理由表示)
- 申請以外の standing 決定ボタンを置かない (履歴/rollback は補助 link)

## Data (mock-fixture §5/§7、これ以外作らない)
- 4 KPI = §5 (承認率92%未達 / 上書き0.12 / Alert0.08 / 差戻し0.05) / consequence = §7 (80→30, 0→50, 7日閾値割れ降格)

## Anti-pattern
- ✗ 進化要件 75% 集約値 (F-06) → 4 KPI 実績 vs 閾値
- ✗ consequence なし (F-08) → ConsequencePanel
- ✗ 未達 KPI だけ見せ 4 KPI 全件を隠す (原則 A) → 全件表示
- ✗ metrics の裏付け sample が参照不可 (原則 B) → 実行履歴/sample drill
- ✗ 申請ボタンと別の決定セットが競合 (原則 C) → 申請 1 つ
- ✗ confidence 生数字 / R-ID / enum を画面に出す

## Acceptance check
- [ ] MetricVsThreshold が 4 KPI 全件 (集約値 75% でない、未達は alert tone)
- [ ] 各 KPI に期間 + 分母 + 前回差 + `[仮説/要検証]`
- [ ] ConsequencePanel (人レビュー↓ / 自動↑ / rollback)
- [ ] metrics の裏付け sample/履歴を参照できる (原則 B)
- [ ] footer は「設定変更を申請」1 つ (原則 C)
- [ ] sidebar nav = モニタリング / token 適用 / JP-only
