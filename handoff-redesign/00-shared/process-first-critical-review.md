# Process-First UI/UX Critical Review

## TL;DR

**結論: Process-First への転換は正しい。ただし、現時点の handoff 一式は実装前 no-go。**

`operational-audit.md` と `ia-overview-v2.md` は、ユーザ指摘の核心である「業務 Process 起点 / master-detail / 実数値と閾値 / 突合 / 承認者画面」を正面から受けている。一方、README、画面別 spec、Claude Design prompt、HTML mockup、Phase 2 handoff は旧 6 画面集約版のままで、confidence、cron、75% 達成度、承認者画面 scope-out が残っている。この状態で外部レビューや React 化へ進むと、抽象方針だけ合格し、実オペレーション不成立のまま実装される。

## 決めるべきこと

**旧 6 画面成果物を破棄または historical 化し、v2 の 9 画面 Process-First pack を作り直してから次工程へ進むか。**

## 推奨判断

**9 画面 Process-First を採用。ただし P0 修正完了まで Claude Design / React 化は止める。**

## 最大の未確認事項

ReconcilePanel が参照する「申請書類 OCR 値」「マスタ値」「正規化後値」「人の判断結果」を mock data schema と画面 state にどう保持するかが未定義。

## 監査対象

| 種別 | 確認ファイル |
|---|---|
| 新方針 SSOT | `00-shared/operational-audit.md`, `00-shared/ia-overview-v2.md` |
| 外部レビュー依頼 | `00-shared/external-review-prompt.md` |
| 旧 handoff 実体 | `README.md`, `01-hub` から `06-observatory` の `spec.md` / `prompt-*.md` / `*output.html` |
| React 化 handoff | `99-claude-code-handoff/target-structure.md`, `phase-2-instructions.md` |
| 既存実装/データ | `prototype/src/data/types.ts`, `mock-*.ts`, `prototype/src/pages/*.tsx` |
| 上位制約 | `CLAUDE.md`, `docs/02-approval-model.md` |

## 強み

| 論点名 | 評価 |
|---|---|
| **機能集約をやめる判断** | 6 画面化で認知負荷を減らす発想から、業務 journey で必要な master と detail を戻す判断は正しい。 |
| **承認者画面を戻す判断** | 4-eyes を語るなら、承認者 queue / detail は demo でも欠かせない。旧 scope-out のままでは統制の説明が破綻する。 |
| **confidence 生数字の降格** | 0.84 を業務判断の UI に出すのは不適切。デフォルト表示を「一致 / 要確認 / 未取得」に変えるのは妥当。 |
| **実数値 vs 閾値への転換** | Agent / Proposal の判断では、達成度の集約値よりも分母、期間、閾値、未達差分が必要。方向性は正しい。 |
| **監査ドキュメント先行** | 実装前に role journey と gap を固定した点は、今回の批判への最低限の回答になっている。 |

## P0/P1 Findings

| severity | 論点名 | 指摘 | 推奨修正 |
|---|---|---|---|
| P0 | **SSOT 分裂を止める** | `ia-overview-v2.md` は 9 画面を現行 SSOT とするが、README / specs / prompts / Phase 2 handoff は 6 画面のまま。実装者は旧成果物を正として読む。 | v1 6 画面 pack を `archive/` または `historical/` に移動。README / target-structure / phase-2-instructions を 9 画面 route と v2 component に更新。 |
| P0 | **旧 mockup を採用禁止にする** | 既存 HTML output には `confidence 0.84`、`cron trigger`、0.96/0.84 drawer、75% 進化要件が残る。v2 方針と正面衝突。 | `mockup-output.html` は v2 参照不可と明記。外部レビュー添付時は「旧6画面の反例」として添付し、再利用禁止ラベルを付ける。 |
| P0 | **ReconcilePanel を仕様化する** | 現仕様は「文字列一致 / 差分」止まり。表記ゆれ、欠損、OCR raw、正規化値、マスタ値、人の上書き判断、source page が未定義。これでは操作完結できない。 | `reconcile-panel-spec.md` を作り、FieldReview schema、3者値、正規化ルール、source locator、manual decision、override reason、再処理/差戻し分岐を定義。 |
| P0 | **承認者 UI を scope-out から外す** | 上位 `CLAUDE.md` は承認者画面化を scope-out としており、v2 は `/approvals` 新設を P0 とする。計画上の衝突が残る。 | `CLAUDE.md` / plan / handoff pack を更新し、承認者 queue + CaseDetail checker mode を Session 4 demo scope に昇格。 |
| P0 | **18要件/16指摘の数を正す** | 外部 prompt は「16 指摘」と書くが 17 件を列挙し、audit は「18 要件」と書くが実表は 22 行相当。coverage matrix の信頼性が落ちる。 | 指摘 ID `F-01` から `F-17`、要件 ID `R-01` から `R-22` に正規化し、各指摘がどの screen/component/gate で閉じるかを表にする。 |
| P0 | **operate の完了条件を定義する** | 「見るべき情報」は増えたが、承認・差戻し・再処理・反映・例外エスカレーションの state transition と validation が未固定。 | 案件 / 提案 / Agent それぞれに `allowed actions by role/status` 表を追加。ボタン enabled 条件、必須コメント、遷移先、監査 event を明示。 |
| P1 | **Process selector を万能解にしない** | 2 Process では過剰に見え、10+ では dropdown が破綻する。さらに role が異なる task を同じ sidebar に並べると迷う。 | TopBar selector は維持。ただし role landing と saved view を追加し、10+ 時は searchable selector + grouped recent/favorite にする。 |
| P1 | **MetricVsThreshold に分母と期間を入れる** | 実績値 vs 閾値だけでは判断できない。件数、対象期間、対象 process、除外条件、仮説ラベル、前回差分が必要。 | 各行に `期間 / 分母 / 除外 / 前回差 / owner` を L2/L3 で表示。P0 gate には最低でも期間と分母を L1 に出す。 |
| P1 | **ConsequencePanel を before/after 以上にする** | 影響件数だけでは「何を捨てるか」が見えない。誰の確認が減るか、どの例外が増えるか、rollback 可能かが必要。 | Agent は review coverage 変化、例外 queue 増減、rollback 条件。Proposal は適用対象、誤検知/見逃し方向、既存案件への非遡及を表示。 |
| P1 | **監査 timeline を lifecyle 順だけで終えない** | 監査に必要なのは順序だけではない。actor, role, SoD evidence, before/after, source document, policy/version, approval id, exportability が必要。 | Observatory audit tab に case lifecycle view と raw event ledger view を分ける。UI 上は業務語、詳細は exportable event schema。 |

## 16/17 指摘の充足判定

| 指摘群 | v2 方針上の回答 | 現物上の状態 | 判定 |
|---|---|---|---|
| Observatory 1-5 | Process 別、AI時刻、承認者 event、cron 置換を定義 | 旧 prompt/output は confidence と cron を表示、case lifecycle view 未実装 | **未充足** |
| Agent 6-8 | Agent 一覧、実指標 vs 閾値、Consequence を定義 | 旧 prompt は 75% 達成度と confidence simulation を維持 | **未充足** |
| Proposal 9-11 | 提案一覧、実績値、before/after を定義 | 旧 prompt/detail は一覧なし、confidence 0.81、影響は浅い | **部分充足** |
| Case 12-15 | confidence 削除、reconcile、validation を定義 | 旧 prompt/output は confidence bar と field 平均を維持 | **未充足** |
| Queue 16 | drawer default 非表示、変更内容、confidence 削除を定義 | drawer はあるが 0.96/0.84 を表示。変更内容は薄い | **部分充足** |
| Hub 17 | Process tag / drill を定義 | 2業務 breakdown はあるが、原因仮説 drill は弱い | **部分充足** |

## 横断 Component Feedback

### ReconcilePanel

現方針の「confidence を UI から消す」は正しい。ただし **confidence を data から捨てるべきではない**。OCR confidence は business user には出さず、内部の routing / QA / audit metadata として保持するのが妥当。

最低仕様:

| 項目 | 必須内容 |
|---|---|
| 入力値 | AI 入力値、申請書類 OCR raw、OCR 正規化値、マスタ値、人の確定値 |
| 状態 | 一致 / 要確認 / 未取得 / 正規化一致 / 手入力確認済 / エスカレーション |
| 根拠 | document name, page, bounding box or field locator, source timestamp |
| 操作 | field accept, override, 差戻し理由、再OCR/再処理 request、escalate |
| validation | 要確認が残る場合の承認可否、コメント必須条件、差戻し category |

「AI が自信を持って間違える」ケースは confidence では拾えない。検出軸は、独立ソース突合、業務ルール、異常値、前回値との差分、同時更新項目、checker sampling で作る。

### MetricVsThreshold

実数値と閾値の比較は必要だが、現仕様は意思決定に不足する。少なくとも `期間 / 件数 / 分母 / 除外条件 / 仮説 or 実測 / owner / last updated` を持たせる。とくに demo では、数値が mock であることを L1/L2 で明示し、実績値のように見せない。

### ConsequencePanel

before/after だけでは弱い。意思決定者が知りたいのは「何が減り、何が増え、どこで止められるか」。Agent 昇格なら review coverage と例外 queue、Proposal 改定なら適用対象と見逃し/誤検知の方向、rollback 条件を表示する。

## 対案比較

| 案 | 内容 | 長所 | 短所 | 判断 |
|---|---|---|---|---|
| A | 旧 6 画面 pack を軽く patch して進む | 速い | 承認者画面、reconcile、master 欠落が残る | **却下** |
| B | 9 画面 Process-First pack を作り直す | ユーザ指摘に正面回答。実装後の説明整合が高い | 工数増、Claude Design 再実行が必要 | **推奨** |
| C | Role-first landing + Process filter に再設計 | 役割ごとの迷いは減る | Process-first の指摘への回答が弱まる | 補助案 |
| D | Demo 用 3画面だけ作り、残りは説明で逃がす | demo は速い | 「全画面 operational walkthrough」条件を満たさない | 却下 |

推奨は **B**。ただし B は「画面を増やす」ことが目的ではなく、各 role の queue → detail → decision → audit event を閉じるための画面増であることを明文化する。

## 次アクション

1. `operational-audit.md` の count と ID を修正し、指摘 `F-01..F-17` × 要件 `R-*` × screen/component/gate の coverage matrix を追加する。
2. `ia-overview-v2.md` に `allowed actions by role/status` と `state transition` を追加する。
3. `reconcile-panel-spec.md`, `metric-vs-threshold-spec.md`, `consequence-panel-spec.md` を新設する。
4. README / specs / prompts / output / target-structure / phase-2-instructions を v2 9画面に更新する。旧 6画面 HTML は `historical` として隔離する。
5. 外部レビューpromptに「添付旧mockupは反例であり、採用候補ではない」「現物 drift も指摘対象」を追加する。

## Go / No-Go

| Gate | 判定 |
|---|---|
| 外部レビュー prompt として使う | **条件付き Go**。ただし count 修正と drift 監査指示を追加する。 |
| Claude Design v2 生成へ進む | **No-Go**。v2 prompt pack 未生成。 |
| React 化へ進む | **No-Go**。Phase 2 handoff が 6 画面旧構造。 |
| 方針として Process-First を採用 | **Go**。ただし ProcessSelector 万能化と ReconcilePanel 過小仕様を修正。 |
