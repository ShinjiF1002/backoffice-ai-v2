Requested output style: High Fidelity (Operational Premium Light、full color token + micro-interaction)
(New Session 作成時に "High Fidelity" mode を選んでから本 prompt を paste してください)
(pilot review rev.3 — 文書アンカー型に再設計。前回 rev.2 からの 3 変更を反映)

# Page: 案件詳細 (CaseDetail) — Process-First v2 ★pilot gate (rev.3 文書アンカー型)
Typology: C (Detail Workspace)
Route: /cases/:id (入力者 mode) + checker mode (承認者)
Goal: 入力者/承認者が「申請書類 (一次証拠)」と「AI 入力 全項目」を見比べ、要確認を解消してから 承認 or 差戻し を 1 アクションで決める。

## 前提 (Project context に登録済、再 paste 不要)
- design-system (Operational Premium Light)
- reconcile-panel-spec rev.3 (文書アンカー 2-pane / 全項目表示 / 単一決定面 / 統合 modal / UI 言語規範)
- allowed-actions §5.1 (単一決定面) / mock-fixture-spec-v2 §4 (field) + §11 (申請書類 mock)

## ★ rev.3 の最重要 (rev.2 からの 3 変更)
1. **文書アンカー型 2-pane**: 左に「申請書類ビューア」を**読めるサイズ**で常時表示 (旧 rev.2 は参照 chip だけで小さすぎた)。右に AI 入力項目。左右を相互リンク。
2. **入力項目は全件 default 表示**: 「対応が必要な項目」(要確認) を上部・alert 強調しつつ、**確認済 (一致) も隠さず可視**にする (旧 rev.2 は一致を折りたたみ default にして全体が見えなかった → 承認者が未フラグ誤りを捕捉できない)。
3. **ボタンは 1 セットのみ**: footer の「承認 / 差戻し」だけ。**field 行に「申請値で確定」「対応」の 2 個目ボタンセットを置かない** (rev.2 の 2 セット併存が confusing だった)。field 補正は要確認行クリック→統合 modal「項目の対応」。

## Layout

### TopBar
- ProcessSelector `[業務: 法人住所変更 ▾]`
- sidebar nav の「観測」は「**モニタリング**」に変更 (他 nav: ハブ/受信トレイ/AI 提案レビュー/Agent 設定)
- PrototypeModeLabel「プロトタイプ表示 — 外部システム未接続 / 証跡はモック」

### Header (sticky)
- breadcrumb: 法人住所変更 › 案件一覧 › CASE-2026-0142
- h1: CASE-2026-0142 法人住所変更 / chip × 1: status「入力者確認待ち」
- mode 切替: `[入力者 mode | 承認者 mode]`
- LifecycleStepper: 受付 → AI処理 → ●入力者確認 → 承認者承認 → 反映

### Body = 全幅 2-pane (aux は drawer に降格)

#### 左 pane (~52%): 申請書類ビューア (読めるサイズ)
- ヘッダ: `CASE-2026-0142.pdf · P.2 / 3` + ページ送り ◀ ▶ + zoom ⊕
- faux PDF (明朝体 Noto Serif JP、白紙に届出フォーム描画) = mock-fixture §11:
  - タイトル「法人住所変更届」
  - 法人名 株式会社サンプルＨＤ / 支店コード 042
  - **住所欄を amber 枠 + ラベルでハイライト**: 千代田区丸の内２－３－５ / サンプル**ビルディング**８Ｆ (ビルディングを強調)
  - 効力発生日 2026-06-15 / 押印・署名欄 (枠のみ)
  - 右下に P.2 / 3

#### 右 pane (~48%): AI 入力項目 全 5 件 (隠さない)
- 上部 chip: 要確認 1 / 確認済 4
- **対応が必要な項目 (1)** — 上部・alert tone:
  - [要確認] ビル名 / AI 入力「サンプルビル」・現在の登録値 / 申請書類「サンプル**ビルディング**」(diff 強調)
  - 「AI 入力と申請書類で値が違います。正しい方を確認してください」
  - source locator [P.2 住所欄] → **クリックで左 PDF の住所欄ハイライトへスクロール連動**
  - 行クリックで統合 modal「項目の対応」を開く (standing ボタンは置かない)
- **確認済 (4)** — 隠さず compact 行で全件可視 (折りたたみ default にしない):
  - 法人名 株式会社サンプルHD ✓ / 新住所 東京都千代田区丸の内 2 丁目 3 番 5 号 ✓ (表記を自動補正、詳細 expand 可) / 支店コード 042 ✓ / 効力発生日 2026-06-15 ✓
  - 各行クリックで左 PDF の該当欄へジャンプ
- **confidence 生数字も「field 平均」も表示しない。**

### Footer (sticky、唯一の standing button set)
- 左: 状態文「要確認 1 項目を解消してください」/ 解消後「全項目確認済 — 承認できます」
- 右: **[差戻し] [承認]** の 1 セットのみ
- 入力者 mode = 承認 / 差戻し、承認者 mode = 最終承認 / 差戻し (SoD: 承認者 鈴木課長 ≠ 入力者 山田太郎 明示)

### aux (引用根拠 / 同 case 経過 / 未承認ヒント) — drawer か Header 内 Disclosure に降格
- 「詳細」ボタンで右端 drawer or Header 配下 Disclosure。照合の主導線 (2-pane) を塞がない。独立 Alert panel は置かない。
- 引用根拠「この案件で参照した、承認済の手順・ルール」3 件 / 同 case 経過 timeline / 未承認ヒント (承認の根拠にならない明示)

## 統合「項目の対応」modal (要確認行クリックで開く、window.prompt 廃止)
- 上部: 対象 field 文脈 (項目名 / AI 入力値 / 申請書類値 / source locator)
- 対応: **申請書類の値で確定** / **手入力で上書き** (理由必須) / **この項目で差戻し** (理由カテゴリ + コメント必須) / **エスカレーション**
- 共有 validation: 必須項目未入力で確定不可 → 即 error + focus
- 結果 1 行明示: 確定/上書き=この案件内で確定し承認へ進む / 差戻し=案件全体を AI・申請者へ戻し再処理後に確認待ちへ

## Validation
- 要確認残存 → 承認 disabled (tooltip「要確認 1 項目を解消してください」)
- modal の必須未入力 → 即 error + focus / 差戻し helper は行動文 (R-ID 出さない)

## Data (mock-fixture §4 + §11、これ以外作らない)
- 法人名 株式会社サンプルHD (一致+補正) / 新住所 2丁目3番5号 (一致+補正) / 支店コード 042 (一致) / 効力発生日 2026-06-15 (一致)
- ビル名 AI サンプルビル / 申請 サンプルビルディング → **要確認**
- 申請書類 = §11 の法人住所変更届 P.2 / citation 3 件

## Visual constraint
- Canvas slate-50 #F8FAFC / Panel white + 1px hairline #E5E7EB / Primary indigo #635BFF
- tone: 一致 = success-soft / 要確認 = alert-soft / 未取得 = slate
- PDF pane: 紙=白、本文 Noto Serif JP、ハイライト欄 amber / 右 pane: Inter+Noto Sans JP
- Radius card 8px / control 6px / chip 4px、装飾禁止 (gradient/glow/glassmorphism/3D/dark mode)、JP-only
- micro-interaction: 行↔PDF ハイライト連動 / hover / 差戻し送信 toast「再び確認待ちに戻ります」(event 名は出さない)
- token を hardcode hex に展開しない

## Anti-pattern (rev.2 + 旧 Plan β の是正点)
- ✗ 申請書類が小さい参照 chip 止まり → 読めるサイズで左 pane 併置 (rev.3 ②、原則 B)
- ✗ 一致を折りたたみ default で全項目を隠す → 全件 default 表示 (rev.3 ①、原則 A)
- ✗ field 行と footer の 2 ボタンセット併存 → footer 1 セットのみ (rev.3 ③、原則 C)
- ✗ 内部語・R-ID・event 名・enum・(mock)・英語断片を画面に出す (rev.2 ①) → 平易 JP / 削除
- ✗ badge「正規化一致」→「一致」に集約 / ✗ aux 独立 Alert panel → 置かない (rev.2 ②)
- ✗ override が window.prompt → 統合 modal (rev.2 ③) / ✗ confidence 0.84 + field 平均 → 削除 (F-12/15)
- ✗ 別 route 差戻し → 同 page modal (R-CASE-01) / ✗ 承認者画面なし → mode 切替 (R-APPR-02)

## Acceptance check (pilot gate rev.3)
- [ ] 申請書類ビューアが読めるサイズで左 pane に常時表示 (ページ送り + 該当欄ハイライト)
- [ ] 入力項目は全 5 件 default 表示 (確認済を折りたたみ default にしない)、要確認を上部 alert 強調
- [ ] field 行クリックで左 PDF の該当欄がハイライト連動
- [ ] standing button は footer「承認 / 差戻し」1 セットのみ (field 行に 2 個目ボタンなし)
- [ ] 要確認行クリック→統合 modal「項目の対応」(window.prompt なし)、必須未入力で即 error
- [ ] 要確認残存で承認 disabled / 差戻しコメント必須
- [ ] confidence 生数字なし / R-ID・event 名・enum・内部語・(mock)・英語断片が画面にない
- [ ] 状態は UI ラベル (一致 / 要確認 / 未取得 / 確認済)、「正規化一致」表記なし
- [ ] sidebar nav が「モニタリング」(旧 観測)
- [ ] 入力者 / 承認者 mode 切替 (checker は入力者判断 + SoD 表示)
- [ ] design system token 適用、hardcode hex なし
