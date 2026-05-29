# CaseDetail rev.3 — Claude Design コピペ手順 (これだけ見れば OK)

> rev.3 = 文書アンカー型への再設計 (申請書類を大きく併置 / 全項目表示 / ボタン 1 セット / 観測→モニタリング)。
> **CaseDetail だけ再生成する最短手順** ↓。他 8 画面は pilot 合格後。

---

## 最短: CaseDetail rev.3 を生成 (context 再 upload 不要)

`prompts/04-case-detail-mockup.md` は rev.3 の 3 変更を**自己完結で内包**。これだけで是正版が出ます。

1. claude.ai/design の既存 project を開く
2. **New Session 作成 → mode = High Fidelity**
3. 下記ファイルを開いて**全文 copy → session に paste**:
   `claude-design-bundle-v2/prompts/04-case-detail-mockup.md`
4. 生成 → export (zip/HTML どちらでも) → Downloads
5. 「saved to downloads」と私に投げる → 私が検証 + 配置 + ledger 更新

---

## 正確に context も最新化する場合 (8 画面に進む前に推奨)

rev.3 で **7 つの context を変更**しました。8 画面生成前に project context を最新化してください
(CaseDetail だけなら上の最短手順で OK、context 再 upload は不要)。

再 upload する 7 file (`context/` 配下):
```
01-design-system           (nav: 観測→モニタリング)
02-ia-overview-v2          (nav rename)
03-screen-contracts-v2     (全画面共通 検証・操作原則 A-D 追加)
04-reconcile-panel-spec    (文書アンカー 2-pane / 全項目 / 単一決定面)
07-process-selector-spec   (nav rename)
08-allowed-actions         (§5.1 単一決定面)
09-mock-fixture-spec-v2    (§11 申請書類 mock 追加)
```
やり方: project の context から旧 7 file を削除 → 上記を再 upload。
分かりにくければ **新 project を作り context/ 9 file 全部 upload** が確実 (古い context 混入なし)。

---

## rev.3 で何が変わるか (生成物の見るべき点)
- 左 = 申請書類ビューア (読めるサイズ、ページ送り、住所欄ハイライト)
- 右 = AI 入力 全 5 件 (要確認を上 + 確認済も隠さず可視)、行クリックで左 PDF 連動
- footer = 承認 / 差戻し の 1 セットのみ (field 行に 2 個目ボタンなし)
- 要確認行クリック → 統合 modal「項目の対応」
- sidebar nav = モニタリング (旧 観測)

詳細・合否条件: `prompts/04-case-detail-mockup.md` 末尾の Acceptance check。
全画面に効く原則と他画面の同種修正: `../00-shared/cross-screen-refresh-findings.md`。
