# ARCHIVED — prototype-refresh (UI Refresh Studio)

**退避日**: 2026-05-31
**理由**: 本 studio の刷新内容を `prototype-redesign/` 本体へ back-port 完了したため、active から退避。

## 統合 (back-port) の内容
`prototype-redesign` を canonical とし、本 studio の刷新 **17 src ファイル**を取り込んだ:

- `src/index.css` (OKLCH token / elevation-over-borders / recessive chrome / density・substrate token)
- `src/components/shell/{Sidebar,TopBar}.tsx` (recessive chrome)
- `src/components/shared/DataTable.tsx` (Data Table Premium: density トグル + 行 inline 展開 peek + shadow)
- `src/components/cross-cutting/ReconcilePanel.tsx` (premium diff / confidence band / reversibility tier)
- `src/data/{types,mock-case-detail}.ts` (FieldReview に confidence?/reversibility?)
- 10 ページ (Hub/Cases/Approvals/Observatory/Proposals/Agents/ProposalDetail/SearchResults/ConfigApprovals/Escalations)

## 統合時の追加修正 (本 studio には無い)
back-port 時に、`DataTable.tsx` の **stretched-link (`::after inset-0` を `<tr position:relative>` で包む)** が
**Safari/WebKit で containing block を確立できず、overlay が table 全体を覆い「最後の行」が全 click を奪う
不具合** (= 別画面に飛ぶ / 二度押し) を発見・修正した。**row-level onClick + useNavigate** に置換し、
先頭セルは実 `<Link>` (a11y / ⌘+click 新規タブ) を残置、内側操作要素は `stopPropagation` で分離。
→ 本 studio (および統合前の prototype-redesign) の DataTable は同バグを抱えていたが、統合版で解消済。

## 検証
統合後 `prototype-redesign` で `npm run check:all` green (lint / types / **272 test** / build / check-design 違反0)、
Chromium + WebKit nav smoke 0 FAIL、実機 Safari で挙動確認済。

## 元の studio doc
刷新の手法・トレンド ledger・screen step log は本ディレクトリの `REFRESH.md` を参照。
再稼働する場合は `npm install` 後 `npm run dev` (port 5175)。
