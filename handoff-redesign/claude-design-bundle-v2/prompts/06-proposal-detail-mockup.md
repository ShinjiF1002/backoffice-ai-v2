Requested output style: High Fidelity (Operational Premium Light、full color token + micro-interaction)
(New Session 作成時に mode = High Fidelity を選んでから本 prompt を paste)

# Page: 提案詳細 (ProposalDetail) — Process-First v2 (原則 A/B/C 適用)
Typology: C (Detail Workspace)  /  Route: /proposals/:id  /  Role: Manual 管理者 / 業務責任者 (mode 切替)
Goal: 手順改定提案の判定基準・実績・帰結・根拠を見て、forward/reject (Manual) または 承認/差戻し (業務責任者) を決める。

## 前提 (Project context に登録済、再 paste 不要)
- design-system / ia-overview-v2 / screen-contracts-v2 / metric-vs-threshold-spec / consequence-panel-spec / allowed-actions-and-state-transitions / mock-fixture-spec-v2
  (A/B/C 原則は本 prompt の ★ section に inline 済、別 file 不要)
- TopBar: ProcessSelector `[業務: 法人住所変更 ▾]` + PrototypeModeLabel「プロトタイプ表示 — 外部システム未接続 / 証跡はモック」
- Sidebar nav: ハブ / 受信トレイ / AI 提案レビュー / Agent 設定 / モニタリング
- UI 言語規範: R-ID / event 名 / status enum / 内部語 (cron / trigger / OCR raw / 突合) / (mock) / 英語断片を画面に出さない。status は業務語。
- token: canvas #F8FAFC / panel white + 1px hairline #E5E7EB / primary #635BFF / radius 8-6-4 / Inter + Noto Sans JP + JetBrains Mono / 装飾禁止 / JP-only / hardcode hex なし

## ★ 全画面共通 検証・操作原則 (cross-screen-refresh-findings、C 型に適用)
- **A 全体レビュー可能性**: 改定 diff だけでなく **手順全体の before/after** を見せ、どこが変わるか全体の中で示す。
- **B 証拠アンカー可視性**: 提案の根拠 = AI が拾った**実際の差戻し case 群**を要約でなく**原文 (差戻しコメント) を読める形**でリスト + 開閉。
- **C 単一決定面**: **Manual 管理者 mode = forward / reject**、**業務責任者 mode = 承認 / 差戻し** を **mode 切替で 1 セットのみ**表示 (2 セット同時禁止)。

## Layout

### Header (sticky)
- breadcrumb: 法人住所変更 › AI 提案レビュー › PROP-2026-031
- h1: PROP-2026-031「住所読み取りの判定基準を厳しめに調整」+ status chip (業務語) + mode 切替 `[Manual 管理者 | 業務責任者]`
- Proposal Lifecycle Stepper: 生成 → triage (Manual) → 上長承認 (業務責任者) → 反映

### Body (2-col)
#### 主列 (左 ~7/12)
1. **判定基準 vs 実績** = `<MetricVsThreshold>` (基準 + 実測値 + 達成判定、`[仮説/要検証]` 明示):
   - 「番地表記の精度 > 0.90」: 実測 **0.93 達成**
   - 「影響は 20 件以下」: **12 件 達成**
2. **改定の帰結** = `<ConsequencePanel>` (before/after + 影響):
   - 適用対象: 法人住所変更の住所読み取り、過去 12 case 相当
   - trade-off: 基準を厳しく → 見逃し↓ (人確認に多く回す) / 過剰な要確認↑
   - 非遡及: 既存の承認済 case には適用しない
3. **手順 before/after 全体** (原則 A): 改定箇所 diff を**手順全文の中で**ハイライト (どこが変わるか全体把握)。

#### 補助列 (右 ~5/12) — 根拠 (原則 B)
- **この提案の根拠**: 日次提案分析が拾った差戻し case 群 (例 3-4 件)。各 case の **差戻しコメント原文**を読める形でリスト + 開閉 (要約だけにしない)。元案件への link。
- 未承認ヒント L3 Disclosure (承認の根拠にはならない明示)。

### Footer (sticky、mode で 1 セットのみ — 原則 C)
- **Manual 管理者 mode**: [reject (理由必須)] [上長へ forward] (実績値確認後 enabled)
- **業務責任者 mode**: [差戻し (理由必須)] [承認] (consequence 確認後 enabled)
- 2 セットを同時表示しない。

## Data (mock-fixture §6/§10、これ以外作らない)
- PROP-2026-031 / 基準: 番地表記精度>0.90 実測0.93・影響≤20件 実測12件 / trade-off + 非遡及 = §6 / 根拠 = 日次提案分析 (cron 表記なし)

## Anti-pattern
- ✗ 実績値なし (F-10) → MetricVsThreshold で実測併記
- ✗ 影響不明 (F-11) → ConsequencePanel
- ✗ diff だけで手順全体を見せない (原則 A) → 全文 + ハイライト
- ✗ 根拠 case が要約のみ・原文参照不可 (原則 B) → 差戻しコメント原文リスト
- ✗ forward/reject と承認/差戻しを 2 セット同時表示 (原則 C) → mode 出し分け
- ✗「cron」「trigger」露出 → 「日次提案分析」

## Acceptance check
- [ ] MetricVsThreshold (基準 + 実測 + 判定 + `[仮説/要検証]`)
- [ ] ConsequencePanel (適用対象 / trade-off 方向 / 非遡及)
- [ ] 手順 before/after 全体を表示 (diff だけにしない、原則 A)
- [ ] 根拠の差戻し case を原文で読める (原則 B)
- [ ] footer は mode で 1 セットのみ (原則 C)
- [ ]「日次提案分析」表記 (cron / trigger なし) / R-ID・enum・内部語なし
- [ ] sidebar nav = モニタリング / token 適用 / JP-only
