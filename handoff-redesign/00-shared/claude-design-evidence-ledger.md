# Claude Design Evidence Ledger (生成証跡、template)

> Claude Design は監査ログ / usage tracking 非対応 (公式)。何を投入し何を生成したかをローカルで記録する。user が Claude Design 操作後に各行を記入。

## design system 登録 (Step 1)
| 項目 | 記録 |
|---|---|
| 登録日時 | `2026-05-28` (pilot export 時刻で確認) |
| 投入 file | context/01-design-system.md |
| 適用確認 (pilot) | **合格** — Operational Premium Light token を完全適用 (`tokens.css` が CLAUDE.md 第 1-10 章準拠、canvas/primary/semantic/radius/font/motion 全て一致) |
| token 適用率 (raw hex / var) | hi-fi 4 file (app/shell/reconcile/sendback) で非白 hardcoded hex は **4 箇所のみ** (`#FDE68A` `#C7D2FE` `#A7F3D0` = *-200 soft-border 中間 tint、token set 未定義分)、他は全て `var()`。Phase 2 で `--{tone}-soft-border` token 追加で解消 |

## context 投入 (Step 1.5)
| 項目 | 記録 |
|---|---|
| 投入日時 | `____-__-__ __:__` |
| 投入 file | context/01〜09 (9 file) |
| manifest 確認 | ✅ mock のみ / ❌ (機密混入: ____) |

## 画面別生成証跡

| 画面 | prompt | wireframe 生成日時 | mockup 生成日時 | export file | 修正回数 (chat/inline) | 最終判定 |
|---|---|---|---|---|---|---|
| 04 案件詳細 (pilot) | prompts/04-* | 2026-05-28 (※HTML render bug) | 2026-05-28 | screens-v2/04-case-detail/ (CaseDetail.html + 9 jsx + tokens.css + design-canvas.jsx) | Claude Design 内=不明 / 配置時 agent が 3 findings 検出 | **採用** (hi-fi、§9 を 8/10 完全+2 partial) |
| 01 Hub | prompts/01-* | | | screens-v2/01-hub/ | | |
| 02 案件一覧 | prompts/02-* | | | screens-v2/02-cases/ | | |
| 03 承認待ち | prompts/03-* | | | screens-v2/03-approvals/ | | |
| 05 提案一覧 | prompts/05-* | | | screens-v2/05-proposals/ | | |
| 06 提案詳細 | prompts/06-* | | | screens-v2/06-proposal-detail/ | | |
| 07 エージェント一覧 | prompts/07-* | | | screens-v2/07-agents/ | | |
| 08 エージェント詳細 | prompts/08-* | | | screens-v2/08-agent-detail/ | | |
| 09 Observatory | prompts/09-* | | | screens-v2/09-observatory/ | | |

## pilot gate 記録 (Step 2.5)
| 項目 | 記録 |
|---|---|
| CaseDetail pilot 判定 | **合格** (hi-fi `CaseDetail.html`、render smoke で console error 0 + 1 viewport 完結を確認) |
| 合格条件 (reconcile-panel-spec §9) 充足 | **8 / 10 完全 PASS + 2 partial** |
| §9 完全 PASS (8) | confidence 生数字なし / 6 状態 badge / source locator / AI vs 申請書類 並置+差分 / 要確認残存で承認 disabled+tooltip / 差戻しコメント未入力 即 error / 入力者・承認者 mode 切替 (checker は入力者判断+SoD 表示) / 1 viewport 完結 |
| partial (2) + 配置 finding (1) | ① override: 値は必須 (空で確定不可) だが**理由文**未収集 (`window.prompt` placeholder、「理由は次画面」) ② accept/override/escalate の **audit event 名が toast 未表示** (差戻し=`human_sendback` のみ明示) ③ `CaseDetail wireframes.html` が hi-fi `app.jsx` を load + 依存欠落で blank (exploratory、hi-fi が canonical なので gate 非該当) |
| 残り 8 画面に進んだか | **yes** — gate PASS。①② は 8 画面 prompt 共通 lesson に反映、③ は wireframe 再生成 or skip を user 判断 |
| **rev.3 最終サインオフ (2026-05-28)** | user「完成しました。いい感じです」=**正式サインオフ**。文書アンカー型 (左 申請書類ビューア / 右 全項目可視 / footer 単一ボタン / nav モニタリング)、render smoke console error 0、`docanchor.jsx` 追加。rev.3 §9 gate 充足、partial ①② も統合 modal + meta-text 削除で解消。→ 8 画面生成 (step 10) 解禁 |

## usage (参考、別枠 metering)
| 項目 | 記録 |
|---|---|
| pilot で消費した目安 | ____ |
| 残り 8 画面の見込み | ____ |

> 記入完了後、9 画面 export が `screens-v2/` に揃ったら `operational-walkthrough-evidence-v2.md` の QA へ。
