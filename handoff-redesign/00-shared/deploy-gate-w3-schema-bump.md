# Deploy Gate — W3 (SCHEMA 5→6)

> **Post-merge ops handoff (2026-05-31)。deploy 判断者向け。** W3 (production polish) は PR #18 で `main` (`c6a5738`) に squash-merge 済。
> **merge と deploy は別 gate** — main 入りは完了、本番反映は本書の gate を通してから。実装 SSOT は `remediation-roadmap-p0-p1-p2-2026-05-29.md` (§4末 closure ledger / §6.2 risk #1)。

## 状態 (確認済)

- W3 merged to `main` (`c6a5738`)。`npm run check:all` green (**test 212** / 21 files / build) / check-design 違反 0 / working tree clean。
- 変更は **SCHEMA_VERSION 5→6** を含む: `CaseEntity.reversal` 追加 + `elapsedLabel`(静的文字列)→`receivedAt`。

## Deploy gate (必須、順守)

1. **6/12 demo (Session 4) と別日に deploy する** (roadmap §6.2 risk #1)。SCHEMA bump は旧 localStorage の migration を伴うため。
2. **localStorage migration 挙動**: 旧 v5 persisted state は v6 と version 不一致 → `loadPersisted` が **seed fallback**。= **白画面化しない**が、ユーザの in-session 操作状態 (承認 / 差戻し / 上書き / persona 切替 / 既読 等) は初回 v6 ロードで **初期化**される。mock prototype (実データ無し) ゆえ許容。
3. **demo 当日に deploy しない**: demo 進行中に schema が切替わると、進行中の操作状態が seed に戻り demo が破綻し得る。

## Pre-deploy verify (deploy 対象 commit で)

- `npm run check:all` green (lint / check:no-op / check:types(app+test) / check:design / test / build)。
- 本番 build boot smoke (`npm run build && npm run preview`、index / JS / CSS が 200)。

## 残スコープ (deploy blocker ではない、R1 / backend へ defer)

roadmap §4末 scope-out 参照。要点: sent-back→ready 遷移 (backend AI 再処理) / manual-entry の server 採番 (現 count ベースは multi-tab 同時 create で衝突し得る) / route-level code-split / Observatory raw-ledger 英語見出しの和訳 / modal background の literal `inert` を超える portal 化 a11y。いずれも production-ready の必須要件ではなく、運用上の deploy を妨げない。

## 品質根拠 (green ≠ 挙動正、W2 教訓)

- adversarial review (5-dim Opus + per-finding verify): green gate を通過した実 bug 8 件を merge 前に是正 (最大 = reversal 訂正→ready false-success)。
- Playwright visual/print proof (8 shot): 全 surface を実ブラウザ確認 + cross-screen 時系列不整合 1 件 fix。
- **注意 (over-claim 回避)**: 15-route axe は **構造 a11y** (role/label/name/landmark/dup-id) の証明であり、**color-contrast は含まない** (jsdom 非評価)。contrast は AR1/R7 + check-design (R7) が別途担保。a11y「完全 pass」とは言わない。
