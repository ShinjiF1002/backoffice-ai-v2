# ReconcilePanel Spec (R-RECON-01/02、CaseDetail pilot gate)

> confidence 生数字を捨て、AI 入力値を申請書類 (一次証拠) と照合した**突合結果**で示す。**全項目を可視にしたうえで「人が確認すべき項目」を上部に優先表示**する (rev.3、全件を隠さない)。入力者・承認者がこの panel で申請書類と見比べて案件処理を完結できることが目的。CaseDetail pilot の合否はこの spec の充足で判定する。

## 1. なぜ confidence を捨てるか

旧 UI は `confidence 0.84` を field 横に表示したが、ユーザーには「何を測り、どう行動すべきか」が不明 (user 指摘 Case#1/4)。0.84 が良いか悪いかは文脈なしに判断不能。

→ **生 confidence は UI から削除**。代わりに「AI 入力値が申請書類 / マスタと一致するか」という**行動に直結する突合結果**を示す。confidence は data 上 audit metadata として保持 (§6)。

## UI 言語規範 — operator 画面に出さない情報 (R-RECON、9 画面共通)

> pilot review ① で確定。画面に出してよいのは **operator が判断に使う情報だけ**。要件の traceability や system 内部語を「証拠」として画面に書くこと自体が認知負荷 (「文字が多い・一目でわからない」の再生産)。

**UI に出さない (spec / ledger / code comment 専用)**:
- 要件 ID: `R-RECON-02` `R-VALID-01` 等
- audit event 名: `human_sendback` `field_override` `escalate` 等
- status enum literal: `sent-back` `ready` `pending` 等 (UI は「確認待ち」「差戻し済」等の業務語で表示)
- system 内部語: `confidence` `OCR raw` `master` `正規化` `突合` `3 者` `field 平均`
- 開発注記: `(mock)` `(demo)` `requires resolve of …` 等の英語断片・実装メモ

**必要な情報は operator にわかる平易 JP に翻訳して出す** (削除 or 言い換え)。代表例:

| UI 露出 NG | → 平易 JP (operator 向け) |
|---|---|
| AI 入力 vs 申請書類 (OCR) vs マスタ の 3 者突合 | AI の入力値と申請書類を照合しました (or subtitle 削除、chip が件数を語る) |
| 検出経路: 独立ソース突合 — confidence では拾えない | AI 入力と申請書類で値が違います。正しい方を確認してください |
| confidence 生数字は audit metadata…(R-RECON-02) | (footer 行ごと削除。confidence 非表示は spec の責務、UI で宣言しない) |
| 突合判定の根拠とした承認済ナレッジ…(mock) | この案件で参照した、承認済の手順・ルール |
| 未入力で送信すると即 error…(R-VALID-01) | 差戻し先（担当者・AI）が読んで直せるよう、具体的に記載してください |
| status は sent-back→… audit event: human_sendback | 差戻すと AI が再処理し、再び確認待ちに戻ります |
| OCR raw / (= master 旧値) | 申請書類 / 現在の登録値 |

## 2. FieldReview schema (mock data 拡張方針)

各 field に以下を持たせる (実 TS 変更は Phase 2、本 spec は schema 定義のみ):

| key | 意味 | 例 (CASE-2026-0142 新住所) |
|---|---|---|
| `fieldLabel` | 項目名 | 新住所 |
| `aiValue` | AI 入力値 | 東京都千代田区丸の内 2 丁目 3 番 5 号 サンプルビル 8F |
| `ocrRawValue` | 申請書類 OCR 生値 | 東京都千代田区丸の内２－３－５ サンプルビル８Ｆ |
| `ocrNormalizedValue` | OCR 正規化後値 (全角→半角 / 丁目番地表記統一) | 東京都千代田区丸の内 2 丁目 3 番 5 号 サンプルビル 8F |
| `masterValue` | マスタ照合値 (該当時) | (旧住所のみマスタ存在、新住所は null) |
| `humanValue` | 人の確定値 (override 時のみ) | null |
| `reconcileState` | 下記 6 状態 | 正規化一致 |
| `sourceLocator` | document / page / field locator / timestamp | corp-address-change-CASE-2026-0142.pdf / P.2 / 住所欄 |

## 3. 6 reconcile 状態 (data/audit) と UI ラベル (operator 表示)

**data/audit は 6 状態を保持する。ただし operator UI に出すラベルは集約・平易化する** (下表「UI ラベル」列)。内部語 (`正規化` `突合` `3 者` 等) は UI に出さない (§UI 言語規範)。「正規化一致」は user がパッと意味を取れないため、UI 上は **「一致」に集約**する (表記の自動補正があった旨は控えめな注記 + 詳細 expand で表現)。

| data 状態 (audit) | **UI ラベル** | 条件 | tone | 人の操作 | 承認可否への影響 |
|---|---|---|---|---|---|
| 一致 | **一致** | aiValue = ocrRawValue (= masterValue) | success-soft | 確認のみ | 承認可 |
| 正規化一致 | **一致** (＋控えめに「表記を自動補正」注記、詳細 expand 可) | raw 不一致だが ocrNormalizedValue = aiValue | success-soft | 確認のみ | 承認可 |
| 要確認 | **要確認** | aiValue ≠ ocrNormalizedValue、or 業務ルール違反 | alert-soft | 「対応」(§5 統合 modal) | **残ると承認不可** |
| 未取得 | **未取得** | ocrRawValue なし (OCR 失敗 / 該当欄なし) | slate | 手入力確認 / 再取得 | 確認済まで承認不可 |
| 手入力確認済 | **確認済** | 人が override 済 (理由付き) | primary-soft | (確定) | 承認可 |
| エスカレーション | **エスカレーション** | 人も判断不能 | error-soft | escalate (上位へ) | escalate で案件 path 離脱 |

> data 層が 6 状態を持つのは audit/監査のため (Observatory raw event ledger で参照)。operator が見るのは集約後の平易ラベルだけ。

## 4. source locator (要確認・未取得 field に必須)

不一致 / 未取得 field には「**申請書類のどこを見れば確認できるか**」を表示:
- document name (corp-address-change-CASE-2026-0142.pdf)
- page (P.2)
- field locator (住所欄 / 印鑑欄 等。bounding box があれば highlight、なければ欄名)
- source timestamp (OCR 実行時刻)

AI 値と OCR raw 値を並置し、差分を視覚化 (diff 強調)。

## 5. 操作 — 単一決定面 (pilot review rev.3 ③、ボタンは 1 セットのみ)

**画面の standing button は case 単位の決定 1 セットだけ** = footer の **「承認」/「差戻し」**。field 単位の操作は**行クリック→統合 modal**に畳み込み、standing button cluster を作らない (旧 rev.2 の field 行に並んだ「申請値で確定」「対応」の 2 個目セットは廃止 — 2 セット併存が confusing だった)。

### 案件単位 (footer、唯一の standing button set)
- **承認**: 全 field が 一致 / 確認済 のときのみ enabled (要確認・未取得 残存で disabled + tooltip)
- **差戻し**: 「項目の対応」modal を field 未指定で開く (理由カテゴリ + コメント必須)

### field 単位 (行クリック → 統合 modal「項目の対応」、standing button なし)
要確認 / 未取得 行をクリック (または行内の控えめな「確認」affordance) で modal を開く。`window.prompt` は使わない。
- modal 上部: 対象 field の文脈 (項目名 / AI 入力値 / 申請書類値 / source locator)
- 対応の選択: **申請書類の値で確定** / **手入力で上書き** / **この項目で差戻し** / **エスカレーション**
  - 申請書類の値で確定 → `humanValue` = 申請書類値 (理由任意)
  - 手入力で上書き → 値入力 + **理由 (必須)**
  - この項目で差戻し → 理由カテゴリ + **コメント (必須)** (案件全体の差戻しと同 modal)
  - エスカレーション → 送り先 + 理由
- 共有 validation: 理由・コメント必須項目が未入力で確定不可 (即 error + focus)
- **結果 (outcome) を modal 内に 1 行明示**: 確定/上書き = この案件内で確定し承認へ進む / 差戻し = 案件全体を AI・申請者へ戻し再処理後に確認待ちへ
- 注: audit event (`field_override` / `human_sendback` / `escalate`) は **data 層で記録**、UI に event 名は出さない (§UI 言語規範)
- **再取得** (未取得 field): modal 内 or 行内で「申請書類の再読み取りを依頼」

## 6. confidence の扱い (UI 非表示・data 保持)

- **UI**: confidence 生数字を**一切表示しない** (CaseDetail / 承認待ち / Queue drawer)
- **data**: OCR engine の confidence は audit metadata として保持 (内部 routing / QA / 監査証跡)
- **Observatory raw event ledger** では confidence を表示可 (業務オペレーション UI ではなく監査 view のため)
- **将来**: ML calibrated confidence は学習データ蓄積後、表示方法は別途 UX 検討 (項目毎数字でなく優先確認順 等)

## 7. 「AI が自信を持って間違える」検出軸 (confidence では拾えない)

突合だけでは「AI も OCR も同じ間違いをする」ケースを拾えない。以下の独立軸で検出:

1. **独立ソース突合**: AI vs OCR vs マスタ の 3 者 (2 者一致でも 3 者目が異なれば要確認)
2. **業務ルール**: 効力発生日 > 受付日、支店コードは 3 桁、等の制約違反
3. **異常値**: 桁数 / format / 範囲の逸脱
4. **前回値差分**: 同一顧客の前回登録値との大きな乖離
5. **同時更新項目**: 住所変更時に関連項目 (支店等) も連動すべき場合の不整合
6. **checker sampling**: 承認者が一定率の「一致」case も抽出再確認 (over-trust 防止)

## 8. Layout — 文書アンカー型 2-pane 検証ワークスペース (pilot review rev.3 ②=A + A/B 原則)

**承認タスクの本質 = 申請書類 (一次証拠) と入力値の照合**。よって一次証拠を読めるサイズで併置し、入力項目は**全件を隠さず**注意順に並べ、決定ボタンは 1 セットに集約する。

### 全幅 2-pane (aux 列は drawer に降格、PDF を読めるサイズに)

```
┌─ Header (sticky): breadcrumb / CASE-2026-0142 法人住所変更 / status chip / [入力者|承認者] / LifecycleStepper ┐
├──────────────────────────────────┬──────────────────────────────────────────────┤
│ 申請書類 (左 ~52%)               │ 入力項目 全 5 件 (右 ~48%)                   │
│  ┌ ページ送り ◀ P.2/3 ▶  ⊕ ┐   │  対応が必要な項目 (1) ← 上部・alert 強調      │
│  │ 法人住所変更届            │   │   [要確認] ビル名                            │
│  │ 法人名 株式会社サンプルＨＤ│   │    AI 入力 サンプルビル / 申請 ビルディング   │
│  │ 支店コード 042            │   │    AI 入力と申請書類で値が違います…          │
│  │ ┏━ 住所欄 (該当ハイライト)┓│◄──►│    (行クリックで左 PDF 該当欄ハイライト連動)  │
│  │ ┃ 千代田区丸の内2-3-5     ┃│   │  ─────────────────────────────────────── │
│  │ ┃ サンプルビルディング8F  ┃│   │  確認済 (4) ← 隠さず全件可視 (compact 行)    │
│  │ ┗━━━━━━━━━━━━━━━━━━━━━━━━┛│   │   法人名 ✓ / 新住所 ✓ / 支店コード ✓ / 効力日✓│
│  │ 効力発生日 2026-06-15     │   │   各行クリックで PDF 該当欄へジャンプ          │
│  └ 押印/署名欄 ──────────────┘   │                                              │
├──────────────────────────────────┴──────────────────────────────────────────────┤
│ Footer (sticky): [差戻し]   状態文「要確認1項目を解消してください / 全項目確認済—承認可」   [承認] │
└────────────────────────────────────────────────────────────────────────────────┘
```

- **左 pane = 申請書類ビューア** (~52%、読めるサイズ): faux PDF (mock-fixture §11)、ページ送り + zoom、該当欄を枠でハイライト。row↔doc 相互リンク (右で field を選ぶ → 左 PDF の該当欄が光る、左 PDF の欄クリック → 右 field へ scroll)。
- **右 pane = 入力項目 全件** (~48%): **全 field を default 表示** (隠さない、原則 A)。順序は 要確認/未取得 を上部・alert 強調 → 確認済を下に compact 行。要確認行は AI 入力 vs 申請書類 を並置 + diff。確認済行も AI 値 + 状態 ✓ を可視 (折りたたみ default ではない)。
- **決定は footer の 1 セットのみ** (承認 / 差戻し、原則 C)。field 補正は行クリック→統合 modal (§5)。
- **aux (引用根拠 / 同 case audit / 未承認ヒント)** は右端の「詳細」drawer か Header 内 Disclosure に降格 (照合の主導線を塞がない)。独立 Alert panel は置かない (②)。
- 0 件時: 右 pane 上部「確認が必要な項目はありません — 承認できます」。
- 各 field 行: fieldLabel / AI 入力 / 申請書類値 (要確認時) / 状態 (UI ラベル) / source locator。standing 操作ボタンは行に置かない (§5)。

> **トレードオフ (意図的)**: PDF + 全項目併置は rev.2 より密度が上がるが、(i) sign-off の説明責任、(ii) §7「confidence では拾えない未フラグ誤り」の捕捉、には全項目可視が必須。訓練された operator 向け業務ツールゆえ密度許容 (MEMORY「When more text is correct」= 監査/検証文脈)。要確認を上部固定し「次に何をするか」は 1 viewport で把握できる。

## 9. Acceptance check (CaseDetail pilot gate、binary)

- [ ] confidence 生数字 (0.84 等) が画面に**一切出ない**
- [ ] **operator 画面に R-ID / audit event 名 / status enum / 内部語 (`OCR raw` `正規化` `突合` `3 者` `master`) / `(mock)` / 英語断片が出ない** (§UI 言語規範、pilot review ①)
- [ ] 各 field に **UI ラベル** (一致 / 要確認 / 未取得 / 確認済 / エスカレーション)。「正規化一致」は UI に出さず「一致」に集約
- [ ] 要確認 / 未取得 field に source locator (申請書類 P.X / 欄名)
- [ ] AI 入力値と申請書類値が並置され差分が視認できる
- [ ] **要確認 field 残存時、案件「承認」ボタンが disabled**
- [ ] **注意面は 1 つ**: 要確認/未取得/業務ルール/異常値を右 pane 上部に統合。aux に独立 Alert panel を置かない (pilot review ②)
- [ ] **申請書類ビューアが読めるサイズで左 pane に常時表示** (rev.3 ②、参照 chip ではない)。ページ送り + 該当欄ハイライト
- [ ] **入力項目は全件 default 表示** (rev.3 ①、一致を折りたたみ default にしない)。要確認を上部・alert 強調、確認済も可視
- [ ] **field 行と申請書類の該当欄が相互リンク** (行選択で PDF 該当欄ハイライト)
- [ ] **standing button は footer の「承認 / 差戻し」1 セットのみ** (rev.3 ③、field 行に 2 個目の button cluster を置かない)
- [ ] field 補正は行クリック→統合「項目の対応」modal (`window.prompt` なし)。理由・コメント必須項目が未入力で確定不可 + 即 error + focus (R-VALID-01)
- [ ] 入力者 mode / 承認者 mode が切替可能 (承認者 mode では入力者の判断 + 突合結果を表示)
- [ ] 1 viewport で「次に何をするか」(要確認) を把握でき、かつ全項目 + 申請書類を見比べられる
- [ ] 操作後の audit event が **data / spec 上で定義**されている (確定 / override / 差戻し / escalate → allowed-actions-and-state-transitions.md)。※ event 名は UI に出さない

## 10. 関連

- mock 値の具体例: `mock-fixture-spec-v2.md` § field review examples
- 操作 → status 遷移 / audit event: `allowed-actions-and-state-transitions.md`
- 監査での confidence 表示: `ia-overview-v2.md` §9.3 (Observatory raw event ledger)
