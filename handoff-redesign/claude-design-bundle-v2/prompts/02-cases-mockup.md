Requested output style: High Fidelity (Operational Premium Light、full color token + micro-interaction)
(New Session 作成時に mode = High Fidelity を選んでから本 prompt を paste)

# Page: 案件一覧 (Cases Queue) — Process-First v2
Typology: B (Queue / List master)  /  Route: /cases  /  Role: 入力者
Goal: 入力者が次に処理する案件を選ぶ。row click で詳細 (CaseDetail) へ。

## 前提 (Project context に登録済、再 paste 不要)
- design-system / ia-overview-v2 / screen-contracts-v2 / reconcile-panel-spec / mock-fixture-spec-v2
- TopBar: ProcessSelector `[業務: 法人住所変更 ▾]` + PrototypeModeLabel「プロトタイプ表示 — 外部システム未接続 / 証跡はモック」
- Sidebar nav: ハブ / 受信トレイ / AI 提案レビュー / Agent 設定 / モニタリング
- UI 言語規範: R-ID / event 名 / status enum / 内部語 (confidence / OCR raw / 突合) / (mock) / 英語断片を画面に出さない。status は業務語。
- token: canvas #F8FAFC / panel white + 1px hairline #E5E7EB / primary #635BFF / radius 8-6-4 / Inter + Noto Sans JP + JetBrains Mono / 装飾禁止 / JP-only / hardcode hex なし

## Layout

### Header (sticky)
- h1「受信トレイ — 案件一覧」+ 件数 / status filter chip (確認待ち / 差戻し再処理 / 反映済 等、業務語)

### Table (5-6 列、高密度・1 行 1 案件)
列: 案件 ID (mono) / 業務 / **状態** (StatusBadge、業務語: 確認待ち 等) / 経過時間 / 担当 (入力者名) / **要確認サマリ** (例「要確認 1 項目」、reconcile の集約で confidence 生数字は出さない)
- **推奨行 highlight** (次に処理すべき 1 件を alert-soft で強調)
- row hover で行動可能に、row click で **CaseDetail へ navigate**

### 右パネル (drawer、default 非表示)
- **default は非表示**。row click で右から drawer が開き、案件サマリ (業務 / 状態 / 何が変わったか = 新住所 diff 等 / 要確認サマリ) を表示。drawer 内に「詳細を開く」→ CaseDetail。
- drawer 内も confidence 生数字を出さない (要確認 N 項目の reconcile サマリ)。

## Data (mock-fixture §3、UC-BO-01 法人住所変更 8 件、これ以外作らない)
- pending 2 / ready (確認待ち) 3 / sent-back (差戻し再処理) 1 / business-approval-waiting (承認待ち) 1 / reflected (反映済) 1
- 代表案件 CASE-2026-0142 (確認待ち、担当 山田太郎、要確認 1 項目 = ビル名)
- 全業務選択時は「業務」列で UC-BO-01 / UC-BO-02 を区別

## Anti-pattern
- ✗ 右パネル default 表示で clutter (F-16) → default 非表示、row click で開く
- ✗ confidence 生数字 0.96/0.84 (F-17) → reconcile 要確認サマリに置換
- ✗ status enum literal を画面に出す → 業務語 (確認待ち 等)

## Acceptance check
- [ ] table 5-6 列、status は業務語 StatusBadge
- [ ] 要確認サマリ列 (confidence 生数字なし)
- [ ] 右パネルは default 非表示、row click で drawer 表示
- [ ] 推奨行 highlight + row click → CaseDetail
- [ ] sidebar nav = モニタリング / token 適用 / JP-only
