Requested output style: low-fi wireframe sketch (mono color, basic shapes, gray scale, placeholder text 可)
(New Session 作成時に "Wireframe" mode を選んでから本 prompt を paste してください)

# Page: 案件詳細 (CaseDetail) — Process-First v2 ★pilot gate
Typology: C (Detail Workspace、2-col)
Route: /cases/:id (入力者 mode) + checker mode (承認者)
Goal: 入力者が AI 入力を申請書類 (OCR) と突合 (reconcile) し、要確認項目を解消してから承認 or 差戻し。承認者 mode では入力者の判断 + 突合結果を見て最終承認。

## 前提 (Project context に登録済、再 paste 不要)
- design-system (Operational Premium Light)
- reconcile-panel-spec (FieldReview 6 状態 / source locator / validation)
- allowed-actions-and-state-transitions (validation / status 遷移 / SoD)
- mock-fixture-spec-v2 (CASE-2026-0142 の field review examples)

## Layout

### TopBar
- ProcessSelector `[業務: 法人住所変更 ▾]`
- PrototypeModeLabel「プロトタイプ表示 — 外部システム未接続 / 証跡はモック」

### Header (sticky)
- breadcrumb: 法人住所変更 › 案件一覧 › CASE-2026-0142
- h1: CASE-2026-0142 法人住所変更
- chip × 1: status「入力者確認待ち」
- mode 切替: `[入力者 mode | 承認者 mode]`
- LifecycleStepper: 受付 → AI処理 → ●入力者確認 → 承認者承認 → 反映

### Body (2-col、lg:grid-cols-12)

#### Primary (7/12): AI 入力結果 = ReconcilePanel
**⚠️ 要確認 (1) を上部 priority 表示:**
- ビル名: AI「サンプルビル」/ 申請書類「サンプルビルディング」
  - source locator: [corp-address-change-CASE-2026-0142.pdf P.2 住所欄]
  - state badge: 要確認 (alert tone)
  - 操作: [accept] [override (理由必須)] [差戻し]

**✓ 一致 (3、折りたたみ可):**
- 法人名: 株式会社サンプルHD — 正規化一致
- 新住所: AI「2丁目3番5号」/ 申請「２－３－５」— 正規化一致 [正規化内容を見る ▾]
- 支店コード: 042 — 一致 / 効力発生日: 2026-06-15 — 一致

**重要: confidence 生数字 (0.84 等) は一切表示しない。「field 平均」も表示しない。**

#### Aux (5/12)
- 引用根拠 (承認済ナレッジ 3 件、emerald badge)
- Alert strip (注意あれば amber)
- 未承認ヒント は L3 Disclosure (default closed)

### Footer (sticky、status + mode 連動)
- **入力者 mode**: [差戻し (コメント付き)] [承認] — 要確認残存で承認 disabled
- **承認者 mode**: [差戻し] [最終承認] — SoD (承認者 ≠ 入力者) 明示

## Validation (reconcile-panel-spec / allowed-actions)
- 要確認 field 残存 → 承認 button **disabled** (tooltip:「要確認 1 項目を解消してください」)
- 差戻し → 5-category 選択 + コメント、**未入力で即 error + 入力 focus**
- override → 理由未入力で確定不可

## Data (mock-fixture-spec-v2 CASE-2026-0142、これ以外の数値を作らない)
- 法人名 株式会社サンプルHD (AI=master、OCR 全角差 → 正規化一致)
- 新住所 東京都千代田区丸の内 2 丁目 3 番 5 号 (申請 ２－３－５ → 正規化一致)
- 支店コード 042 (一致) / 効力発生日 2026-06-15 (一致)
- ビル名 AI サンプルビル / 申請 サンプルビルディング → **要確認** (独立ソース突合: AI=master だが OCR 異なる)
- citation 3 件 (法人住所変更フロー / 番地表記正規化ルール / 効力発生日設定基準)

## Visual constraint
- Canvas slate-50 #F8FAFC / Panel white + 1px hairline #E5E7EB / Primary indigo #635BFF
- reconcile tone: 一致/正規化一致 = success-soft / 要確認 = alert-soft / 未取得 = slate
- Radius card 8px / control 6px / chip 4px、Inter + Noto Sans JP + JetBrains Mono
- 装飾禁止 (gradient/glow/glassmorphism/3D/dark mode)、JP-only

## Anti-pattern (旧 Plan β で直す点)
- 旧: confidence 0.96/0.84 + 「field 平均 (5 field)」表示 → **削除**、reconcile state に置換 (F-12/15)
- 旧: 差戻し別 route → 同 page section (R-CASE-01)
- 旧: 承認者画面なし → mode 切替で checker mode (R-APPR-02)

## Acceptance check (pilot gate、不合格なら残り 8 画面に進まない)
- [ ] confidence 生数字が画面に一切ない
- [ ] 各 field に reconcile state (一致 / 正規化一致 / 要確認)
- [ ] 要確認 field に source locator (申請書類 P.2 住所欄)
- [ ] AI 値と申請書類値が並置され差分が見える
- [ ] 要確認残存で承認 button disabled
- [ ] 差戻しコメント未入力で即 error
- [ ] 入力者 mode / 承認者 mode 切替可能
- [ ] 1 viewport で要確認項目を把握できる
- [ ] design system (token) 適用
