# CaseDetail pilot — review notes

> Claude Design export (`redesign2.zip`, 2026-05-28) に対する user レビュー + agent 検証 + 対応方針。
> evidence ledger の判定根拠。pilot gate = **合格 (採用)**、ただし下記 3 点を反映して 04 prompt を更新 → 再生成。

## agent 検証サマリ (2026-05-28)
- hi-fi `CaseDetail.html` render smoke (1440×912): console error 0、reconcile 全体が無 scroll 1 viewport 完結。
- reconcile-panel-spec §9 = **8/10 完全 PASS** (confidence 生数字なし / 6 状態 badge / source locator / AI vs 申請書類 並置+差分 / 要確認残存で承認 disabled+tooltip / 差戻しコメント未入力 即 error / 入力者・承認者 mode 切替+SoD / 1 viewport)。
- design system: Operational Premium Light 完全適用 (hi-fi 4 file で非白 hardcoded hex 4 つのみ = token 未定義の *-200 tint)。
- prototype/ baseline 不変。
- mock-fixture 完全準拠 (ビル名 AI「サンプルビル」/OCR「サンプルビルディング」、KB-FLOW-022 等)。

## user レビュー (3 点) と対応方針

### ① 内部用語・要件 traceability が operator 画面に露出 → 平易 JP 化 or 削除
**根本原則 (新設)**: 画面に出してよいのは operator が判断に使う情報だけ。要件 ID (`R-*`) / audit event 名 (`human_sendback` 等) / status enum (`sent-back` 等) / 内部語 (`confidence` `OCR raw` `master` `正規化` `突合` `3 者`) / 開発注記 (`(mock)`) / 英語断片 (`requires resolve of`) は **spec・ledger・code comment 専用**。

- badge「正規化一致」→ UI label は **「一致」** に集約 (data/audit は 6 状態維持、UI label は別 layer)。
- 露出していた 7 文字列の是正:
  1. `3 者突合。requires resolve of…` → subtitle 削除 (chip が件数を語る)。残すなら「AI の入力値と申請書類を照合しました」
  2. `検出経路: 独立ソース突合…confidence では拾えない` → 削除。operator 向けは「AI 入力と申請書類で値が違います。正しい方を確認してください」
  3. `raw 正規化後の rule expand 可` → 「一致」集約で大半消滅。補正時のみ「表記を自動補正（詳細）」
  4. `confidence 生数字は…(R-RECON-02) 合計 5 field` → footer 行ごと削除
  5. `突合判定の根拠とした承認済ナレッジ…(mock)` → 「この案件で参照した、承認済の手順・ルール」
  6. `未入力で送信すると即 error…(R-VALID-01)` → 「差戻し先（担当者・AI）が読んで直せるよう、具体的に記載してください」
  7. `status は sent-back→…audit event: human_sendback` → 「差戻すと AI が再処理し、再び確認待ちに戻ります」
- 同類: 「OCR raw」→「申請書類」/「(= master 旧値)」→「現在の登録値」。
- **9 画面共通 lesson** (提案/Agent/Observatory も同種の漏れが再発するため screen-contracts-v2 §global に明文化)。

### ② 右下 Alert panel の矛盾 → 単一 band 統合 (A、採択)
- 矛盾の正体: field レベル不一致 (要確認/左上) と 案件レベル業務ルール抵触・異常値 (Alert/右下) が別 corner + ideal mock で値が逆 → 自己矛盾に見える。
- **採択 = A**: 上部に単一 band「対応が必要な項目」を置き、要確認/未取得 + 業務ルール/異常値 を重要度順に統合。右下 Alert panel 廃止。0 件時は「確認が必要な項目はありません — 承認できます」の 1 表示。aux 列は参照情報 (引用根拠/同 case audit/ヒント) のみ。

### ③ Override と差戻しの入力 popup を統合
- 単一 modal「項目の対応」: 対象 field 文脈 + 対応選択 (手入力で上書き / 差戻し / エスカレーション) + 共有の理由欄 (必須・即 validation)。現状の `window.prompt` 廃止 → partial #7 (override 理由必須) も同時解消。
- 留意: 上書き=この案件内で確定し承認へ前進 / 差戻し=案件全体を AI・申請者へ戻し再処理。結果が違うため modal 内に 1 行明示。SoD・status 遷移・audit event は data 層で別管理 (UI には event 名を出さない)。

## agent 配置時 finding (gate 非該当・記録)
- 🔴 `CaseDetail wireframes.html` が blank: hi-fi `app.jsx` を最後に load + その依存未 load。variants A-D は定義済だが gallery render entry が不在 (= user 指摘の「添付漏れ」と整合)。hi-fi が canonical なので gate 非該当。完全 file set 添付後に再 smoke。

## rev.2 検証 (2026-05-28、hosted link 経由)

user が ①②③ を反映して Claude Design で再生成 → hosted link 共有。WebFetch が gzip tar (project 全体) を返したので展開し source + render smoke で検証。**①②③ すべて反映確認**:
- ① 平易 JP 化: 「正規化一致」→「一致」(badge から削除) / 「AI 入力と申請書類で値が違います。正しい方を確認してください」/ 「現在の登録値」「申請書類」/ 引用根拠「この案件で参照した、承認済の手順・ルール」/ footer の confidence 行削除。meta-text (R-ID / event 名 / enum / (mock) / OCR raw / 突合 / 3 者 / confidence) は**全て code comment のみ、実 UI に不在**。
- ② 単一 band「対応が必要な項目 (1)」+「すべて解消すると承認できます」、aux の独立 Alert panel **廃止**、0 件時「確認が必要な項目はありません — 承認できます」。
- ③ `field-action.jsx` 新規 = 統合 modal「項目の対応」(上書き/差戻し/エスカレーション)。`window.prompt` 廃止 (実呼び出し 0、comment のみ)。`CaseDetail.html` は `field-action.jsx` を load (旧 `sendback.jsx` 消滅)。
- render smoke (1440×912): **console error 0**、単一 band が無 scroll 1 viewport 完結。
- bonus: hosted project の `uploads/` に hash 付き `03/04/08` = 私の rev.2 spec を Claude Design project context に**再 upload 済**を確認 (8 画面生成時に 9 画面共通 lesson が効く)。

→ rev.3 で再設計 (下記)。現 repo placed HTML は rev.2 のまま、rev.3 生成・検証後に差し替え。

## rev.3 設計 (2026-05-28、新軸 = 検証完全性・証拠アンカー・操作単純化)

user 指摘 3 点 → 文書アンカー型に再設計。新軸は前回 (ワークフロー言語化) と直交。

- **① 全項目 + PDF 併置**: 承認には全入力項目のレビューが必要だが rev.2 は「対応が必要な項目」だけ default 表示、PDF は小さい参照 chip 止まり。→ 文書アンカー型 2-pane (左=申請書類ビューア 読めるサイズ / 右=入力項目 全件)。一致も隠さない。根拠: sign-off 説明責任 + reconcile §7「confidence では拾えない未フラグ誤り」は隠した所に潜む (自分の脅威モデルとの矛盾解消)。
- **② ボタン 1 セット**: rev.2 は field「申請値で確定/対応」+ footer「承認/差戻し」の 2 セットで confusing。→ standing は footer「承認/差戻し」1 セットのみ。field 補正は行クリック→統合 modal。
- **③ 観測 rename**: 不明瞭 → 「**モニタリング**」(nav UI label、route/内部名 Observatory 維持)。

### 他画面波及 (analyze 成果、`cross-screen-refresh-findings.md`)
4 原則 A (全体レビュー可能性) / B (証拠アンカー可視性) / C (単一決定面) / D (nav 平易化) を抽出。C 型 detail 3 画面が A・B・C 全該当:
- **ProposalDetail (6)**: diff だけ→手順 before/after 全体 (A) / 根拠差戻し case を読める形 (B) / forward-reject と承認-差戻しを mode 出し分け (C)
- **AgentDetail (8)**: 4 KPI 全件 (A) / metrics の裏 sample 参照可 (B) / 申請ボタン整理 (C)
- **モニタリング (9)**: 観測→モニタリング (D)
原則 A-C は `screen-contracts-v2.md §全画面共通 検証・操作原則` に bake → 8 画面生成時に自動適用。

### 反映済 (rev.3、handoff = CaseDetail のみ、8 画面は pilot 合格後)
- spec: `reconcile-panel-spec` §5 (単一決定面) / §8 (文書アンカー 2-pane) / §9 (rev.3 gate) ・ `mock-fixture` §11 (申請書類 mock) ・ `screen-contracts` (原則 A-D + 4/6/8/9 anti-pattern) ・ `allowed-actions` §5.1 ・ `ia-overview`/`process-selector`/`design-system` (rename)
- prompt: `prompts/04-case-detail-mockup.md` を rev.3 に書き換え (自己完結)
- bundle: context 7 file 同期 ・ `HANDOFF-rev3.md` (コピペ最短手順) 作成
- 新規: `cross-screen-refresh-findings.md`

→ **user が rev.3 prompt で Claude Design 再生成 → Downloads → 私が検証・配置**。合格で pilot 正式サインオフ → 8 画面へ。
