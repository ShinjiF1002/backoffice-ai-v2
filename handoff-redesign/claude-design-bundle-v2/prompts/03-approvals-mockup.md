Requested output style: High Fidelity (Operational Premium Light、full color token + micro-interaction)
(New Session 作成時に mode = High Fidelity を選んでから本 prompt を paste)

# Page: 承認待ち (Approvals Queue) — Process-First v2 ★新設
Typology: B (Queue / List master)  /  Route: /approvals  /  Role: 承認者
Goal: 承認者が、入力者確認済の案件を最終承認する順に選ぶ。row click で CaseDetail (承認者 mode) へ。

## 前提 (Project context に登録済、再 paste 不要)
- design-system / ia-overview-v2 / screen-contracts-v2 / allowed-actions-and-state-transitions / mock-fixture-spec-v2
- TopBar: ProcessSelector `[業務: 法人住所変更 ▾]` + PrototypeModeLabel「プロトタイプ表示 — 外部システム未接続 / 証跡はモック」
- Sidebar nav: ハブ / 受信トレイ / AI 提案レビュー / Agent 設定 / モニタリング
- UI 言語規範: R-ID / event 名 / status enum / 内部語 / (mock) / 英語断片を画面に出さない。status は業務語。
- token: canvas #F8FAFC / panel white + 1px hairline #E5E7EB / primary #635BFF / radius 8-6-4 / Inter + Noto Sans JP + JetBrains Mono / 装飾禁止 / JP-only / hardcode hex なし

## Layout

### Header (sticky)
- h1「承認待ち」+ 件数 + subtitle「入力者が確認済の案件を最終承認」

### Table (承認待ち = business-approval-waiting のみ)
列: 案件 ID (mono) / 業務 / **入力者の判断** (承認 / 修正あり、誰が = 入力者名) / **確認結果サマリ** (要確認は解消済 / 修正 N 件 等、confidence 生数字なし) / 経過 / →
- row click → **CaseDetail (承認者 mode)**: 入力者の判断 + 突合結果を表示
- **SoD 明示**: 承認者 ≠ 入力者 (system 強制) を column か注記で示す (例: 入力者 山田太郎 → 承認者 鈴木課長)

## Data (mock-fixture §3、business-approval-waiting、これ以外作らない)
- UC-BO-01 法人住所変更: 1 件 (CASE-2026-0142、入力者 山田太郎 が確認済 = ビル名を申請書類値で確定 + 他 accept、承認者 鈴木課長 待ち)
- UC-BO-02 口座開設書類完備: 1 件
- 全業務選択時は「業務」列で区別

## Anti-pattern
- ✗ 画面欠落 (旧 scope-out、R-APPR-01) → 本画面で承認者導線を成立
- ✗ 入力者の判断が見えない → 「入力者の判断」列で承認/修正を明示
- ✗ SoD が不可視 → 入力者 ≠ 承認者 を明示
- ✗ status enum / 内部語を画面に出す → 業務語

## Acceptance check
- [ ] 承認待ち案件のみ table 表示
- [ ] 「入力者の判断」+ 確認結果サマリ列 (confidence 生数字なし)
- [ ] SoD (承認者 ≠ 入力者) が画面で分かる
- [ ] row click → CaseDetail 承認者 mode
- [ ] sidebar nav = モニタリング / token 適用 / JP-only
