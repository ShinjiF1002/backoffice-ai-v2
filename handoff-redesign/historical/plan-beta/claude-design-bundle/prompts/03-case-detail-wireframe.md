Requested output style: low-fi wireframe sketch (mono color, basic shapes, gray scale, placeholder text 可)
(**New Session 作成時に "Wireframe" mode を選んでから本 prompt を paste**してください — Claude Design UI に固定 mode pill あり、Hub pilot で確認済)

# Page: CaseDetail (案件レビュー + 差戻しコメント)
Typology: C (Detail Workspace、2-col grid)
Route: `/cases/:id` + child `/cases/:id/comment` (section 切替で 1 page 表現、旧 SendBackComment を統合)
Goal: 入力者が AI 入力結果を 1 viewport で全把握し、承認 / 差戻し / コメント付き差戻し を確実に判断する

## Layout

### Header (sticky, min-h 88px)
- breadcrumb: "受信トレイ › 案件処理 › CASE-2026-0142"
- h1: "CASE-2026-0142 法人住所変更"
- chip × 1 (status のみ): "[入力者確認待ち]" (StatusBadge)
- 経過 + 注意 chip は L2 demoted (Header 下段 small text、chip 重複扱いせず)
- 右端 hedge chip: "[仮説 / 要検証]"
- **Lifecycle Stepper を Header の下段に sticky 配置**: 受付 → AI 処理 → ●入力者確認 → 承認者承認 → 反映 (current step indigo dot + font-semibold)
  - Lifecycle Stepper は scroll しても sticky で常時可視 (旧は Header 内で scroll で消えていた)

### PrimaryAnchor strip (Header 直下、status 連動)
- status === "入力者確認待ち" の場合:
  - label "確認待ちアクション"
  - CTA primary "承認" + secondary "差戻し (コメント付き)"
- status === "AI 処理中" の場合:
  - label "AI 処理中 (操作不可)"
  - CTA disabled "監視のみ"
- status === "承認者承認待ち" の場合:
  - label "承認者承認待ち"
  - CTA disabled "監視のみ" (入力者は手出しできない)

### Body — Detail typology (2-col、`lg:grid-cols-12`)

#### Primary (7/12 col)

##### Section A: AI 入力結果 (default 表示)
- View toggle (top-right): raw / diff / value (3 button group、default = value)
- Field list (5 field):
  - 法人名: 株式会社サンプルホールディングス (信頼度 0.96)
  - 旧住所 → 新住所 (diff block: 旧 strike-through + 新 emerald、信頼度 0.84)
  - 支店コード: 042 (mono、信頼度 1.0)
  - 効力発生日: 2026-06-15 (mono、信頼度 1.0)
- confidence bar (各 field 下)

##### Section B (child route で表示、`/cases/:id/comment`、tab or section 切替):
- form 中心 (max-w-3xl inner): 案件概要 (5 field grid) + 差戻し分類 5-category radio + textarea + evidence checklist
- Footer CTA: "差戻し送信" (alert tint) + "キャンセル" (戻る)

(NG: 別 route の独立 page にしない、同 page section 切替で表現)

#### Aux (5/12 col)

##### Citation panel (承認済ナレッジのみ、emerald badge)
- 3 件: weight high の compiled knowledge
- 各 entry: title + snippet + reference

##### Staging hint panel (L3 Disclosure default closed)
- toggle: "未承認ヒント (citation 対象外) を見る"
- 中身: weight low/medium の staging entry、別 background tint (slate-50 panel inset)、各 entry "citation 対象外" label

##### Alert strip (alertCount > 0 のとき、amber banner)
- 注意 2 件のリスト

##### Confidence bar (field 平均、L2)
- 0.84 (平均) + per-field detail link

##### L3 Disclosure
- "PDF preview" (旧 pdfName 経由)
- "Evidence Timeline" (受付 → OCR → DB照合 → AI 生成 → ...)
- "関連手順更新" alert banner (旧 Section)

### Footer (sticky, status 連動)
- 入力者確認待ちのとき:
  - [差戻し (コメント付き)] [承認] (primary)
  - + BusinessApprovalChip mock (右端、demoted text)
- 他 status: footer caption 1 文 + monitoring status

## Data (mock CASE-2026-0142)
- 法人名: 株式会社サンプルホールディングス (0.96)
- 旧住所: 東京都千代田区丸の内 1 丁目 1 番 1 号 サンプルビル 8F
- 新住所: 東京都千代田区丸の内 2 丁目 3 番 5 号 サンプルビル 8F (0.84、diff: 1丁目→2丁目、1番1号→3番5号)
- 支店コード: 042 (1.0)
- 効力発生日: 2026-06-15 (1.0)
- PDF: corp-address-change-CASE-2026-0142.pdf (3 pages)
- 注意 2 件: (1) OCR 信頼度 0.84 (閾値 0.85 未達)、(2) 番地表記の semantic 変更検知
- citation 3 件 (compiled approved): 法人住所変更フロー / 住所表記正規化ルール / 効力発生日設定基準

## Visual constraint (key tokens re-stated)
- Canvas slate-50 / Panel white
- Primary indigo #635BFF / Alert-soft / Success-soft (citation emerald) / Error-soft (diff strike-through)
- Diff-add bg #D1FAE5, Diff-del bg #FEE2E2
- Radius card 8px / control 6px / chip 4px
- Inter + Noto Sans JP + JetBrains Mono (mono は 案件 ID / 数値 / 住所セパレータ)
- 装飾禁止

## Chrome
- Sidebar 5 nav、CaseDetail は sidebar 非表示 (Queue row click 経由)、active 表示は "受信トレイ" のまま
- TopBar: Search / Notification / PrototypeModeLabel pill / UserMenu

## Anti-pattern (旧 CaseReview + SendBackComment)
- 旧: Lifecycle Stepper が Header 内、scroll で消える → 新: Header 直下に sticky stepper、常時可視
- 旧: aux col に Citation / Staging / Confidence / 関連 rule 4-5 panel 積み重ね → 新: Citation L1 keep、Staging L3 Disclosure、Confidence L2、関連 rule L3 Disclosure
- 旧: SendBackComment は別 route → 新: 同 page section 切替 (CaseDetail child route で内側 section toggle)
- 旧: PrimaryAnchor strip なし、status 判定が Footer まで scroll しないとできない → 新: Header 直下 PrimaryAnchor で status + CTA 即可視

## Acceptance check
- [ ] Lifecycle Stepper が Header 下に sticky (scroll しても常時 visible)
- [ ] PrimaryAnchor strip が status 連動 CTA を表示 (入力者確認待ち = 承認 + 差戻し)
- [ ] AI 入力結果 5 field が primary col に 1 viewport で全 visible
- [ ] Citation panel (3 件) は emerald badge、Staging panel は L3 Disclosure default closed
- [ ] Footer の差戻し / 承認 button は status 連動 (他 status では disabled)
