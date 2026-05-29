Requested output style: High Fidelity (Operational Premium Light、full color token + micro-interaction)
(New Session 作成時に mode = High Fidelity を選んでから本 prompt を paste)

# Page: ハブ (Hub) — Process-First v2
Typology: A (Hub / Observatory)  /  Route: /  /  Role: 全 role (landing は role 別)
Goal: 今どの業務 (Process) に問題があるか・次に何を見るかを一目で掴み、該当画面へ drill する。

## 前提 (Project context に登録済、再 paste 不要)
- design-system / ia-overview-v2 / screen-contracts-v2 / process-selector-spec / mock-fixture-spec-v2
- TopBar: ProcessSelector `[業務: 全業務 ▾]` + PrototypeModeLabel「プロトタイプ表示 — 外部システム未接続 / 証跡はモック」
- Sidebar nav: ハブ / 受信トレイ / AI 提案レビュー / Agent 設定 / **モニタリング** (旧「観測」)
- UI 言語規範: R-ID / audit event 名 / status enum / 内部語 (confidence / OCR raw / 突合 / cron) / (mock) / 英語断片を画面に出さない。status は業務語。
- token: canvas #F8FAFC / panel white + 1px hairline #E5E7EB / primary #635BFF / radius 8-6-4 / Inter + Noto Sans JP + JetBrains Mono / 装飾禁止 (gradient/glow/glassmorphism/3D/dark) / JP-only / hardcode hex なし

## Layout

### Header (sticky)
- breadcrumb なし、h1「ハブ」+ 軽い subtitle「業務別の注意点と次のアクション」
- 右: 最終更新時刻 (mock)

### Headline KPI (3、各 Alert に Process tag 必須)
全業務選択時 = 横断 + **各 KPI に Process 別 breakdown**:
- **要対応の注意** N 件 — 内訳: 法人住所変更 / 口座開設書類完備 の件数 tag
- **SLA 経過** N 件 — 同上 Process tag
- **承認待ち** N 件 — 同上 Process tag
各 KPI は drill 可 (クリックで該当 Process の 案件一覧 / 承認待ち / Agent 設定 へ)。vanity KPI (累計処理数等) を Headline にしない。

### Process 別状況 (2 Process card)
- **法人住所変更**: 案件 8 件 (確認待ち 3 / 承認待ち 1 / 差戻し再処理 1 / 反映済 ほか)、Agent = Supervised、承認率 92% [仮説/要検証]。→「案件一覧へ」「Agent 設定へ」
- **口座開設書類完備**: 案件 5 件 (確認待ち 2 / 承認待ち 1 ほか)、Agent = Supervised。→ 同上
- 原因究明動線: 注意が多い Process は「低品質リクエストが多いのか / Agent 設定の問題か」を判断できるよう、該当案件・Agent への drill を 1 クリックで。

### PrimaryAnchor (1 画面 1 つ)
- 最も急ぐアクション (例: 「法人住所変更の承認待ち 1 件を確認」) を 1 つ強調、クリックで遷移。

### Diagnostic (L3 Disclosure、default closed)
- 「今日の処理サマリ」等の補足は折りたたみ。

## Data (mock-fixture §3/§5、これ以外作らない)
- 法人住所変更 案件 8 (pending 2 / ready 3 / sent-back 1 / business-approval-waiting 1 / reflected 1) — UI 表記は業務語
- 口座開設書類完備 案件 5 (pending 1 / ready 2 / business-approval-waiting 1 / reflected 1)
- 承認率 92% (≥95% 未達) [仮説/要検証]、上書き率 0.12、Alert 率 0.08、差戻し率 0.05

## Anti-pattern
- ✗ 全社合算で Process 不明 (F-19) → 各 Alert に Process tag + Process 別 card
- ✗ vanity KPI を Headline → 行動に繋がる注意 KPI のみ
- ✗ status enum / 内部語を画面に出す → 業務語

## Acceptance check
- [ ] Headline 3 KPI に Process tag + drill 動線
- [ ] Process 別 card 2 つ (法人住所変更 / 口座開設書類完備) + 該当画面への drill
- [ ] PrimaryAnchor 1 つ
- [ ] vanity KPI / 全社合算のみ になっていない
- [ ] confidence 生数字・status enum・内部語が画面にない
- [ ] sidebar nav = モニタリング / token 適用 / JP-only
