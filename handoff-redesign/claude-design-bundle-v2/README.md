# claude-design-bundle-v2 — Claude Design 手動コピペ手順 (9 画面)

> Claude Design は独立チャット型サービスで手動コピペ前提。本 dir の context/ + prompts/ を順に投入する。**CaseDetail (04) pilot を先行**し、合格まで残り 8 画面に進まない。

> ⚡ **CaseDetail を再生成 → `HANDOFF-rev3.md`** (rev.3 文書アンカー型)。
> ⚡ **残り 8 画面を作る → `HANDOFF-8screens.md`** (context 9 file + 8 prompt、コピペ手順 + 保存先表)。
> 本 README は 9 画面通しの背景手順。

## 前提
- Claude Design subscription (Pro / Max / Team / Enterprise)
- **mock / synthetic のみ投入** (`00-shared/claude-design-upload-manifest.md` で許可/禁止を確認)
- データレジデンシー非対応のため実顧客・実銀行資料・機密は投入禁止

## Step 1: project 作成 + design system 登録 (5 分)
1. claude.ai/design で新 project 作成
2. `context/01-design-system.md` を全選択 + paste、前置き「以下を design system spec として恒久登録」
3. `00-shared/design-system-registration-check.md` の gate を後で pilot で確認

## Step 1.5: context 投入 (manifest 確認後、3-5 分)
`context/` の **9 file** を upload (drag & drop):
```
01-design-system / 02-ia-overview-v2 / 03-screen-contracts-v2 /
04-reconcile-panel-spec / 05-metric-vs-threshold-spec / 06-consequence-panel-spec /
07-process-selector-spec / 08-allowed-actions-and-state-transitions / 09-mock-fixture-spec-v2
```
前置き「これらを設計 context として登録。9 画面はこの context に従う」

## Step 2: CaseDetail pilot (04 のみ先行、20-40 分)
1. **Wireframe session** 作成 (mode = Wireframe) → `prompts/04-case-detail-wireframe.md` を paste
   - export → `screens-v2/04-case-detail/wireframe-output.html` に保存
2. **High Fidelity session** 作成 (mode = High Fidelity) → `prompts/04-case-detail-mockup.md` を paste
   - export → `screens-v2/04-case-detail/mockup-output.html` に保存
3. **Acceptance check** (prompt 末尾の pilot gate) を visual で判定
4. `00-shared/claude-design-evidence-ledger.md` の CaseDetail 行に記録

## Step 2.5: pilot gate (合否判定、必須)
合格条件 (reconcile-panel-spec §9):
- confidence 生数字なし / reconcile state badge / source locator / 要確認残存で承認 disabled / 差戻しコメント未入力で error / 入力者-承認者 mode / design system 適用

→ **合格**: Step 3 (残り 8 画面) に進む。`screens-v2/04-case-detail/review-notes.md` に合格記録。
→ **不合格**: 残り 8 画面 prompt 生成に**進まない**。Claude Code に戻し「pilot findings を踏まえ 04 prompt を修正」を依頼。

## Step 3: 残り 8 画面 (pilot 合格後、Claude Code が prompt 生成 → user が Claude Design)
Claude Code が `prompts/` に 16 prompt (8 画面 × wireframe/mockup) を生成後:
- 01-hub / 02-cases / 03-approvals / 05-proposals / 06-proposal-detail / 07-agents / 08-agent-detail / 09-observatory
- 各 wireframe + mockup を Step 2 と同手順、export → `screens-v2/0N-{page}/`

## Step 4: walkthrough QA (9 画面後)
`00-shared/operational-walkthrough-evidence-v2.md` で 6 role × 2 process の journey を画面横断で検証。

## トラブルシュート
- 構造変更は chat、局所修正は inline comment (comment 消失時は chat に貼り直し)
- design system が外れる → `design-system-registration-check.md` fallback (project-level prompt + token 適用率 grep)
- usage が別枠 metering → pilot 後分割で消費管理

## 投入順 cheat sheet
Step 1 (01-design-system) → Step 1.5 (context 02-09) → Step 2 (prompts/04 wireframe → mockup) → gate → Step 3 (残り 8)
