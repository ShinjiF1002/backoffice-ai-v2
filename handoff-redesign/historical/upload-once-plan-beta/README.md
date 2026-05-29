# upload-once — Step 1.5 で一度だけ Claude Design に upload する asset 群

> Step 1 (`design-system.md` paste) の後、本 dir 配下の 4 必須 file を順に upload してください。Step 1.5 は 1 度のみ実施、以降の 6 画面 prompt はこれを前提とします。

## Upload 順 (推奨)

| 順 | File | 目的 | 必須/任意 |
|---|---|---|---|
| 1 | `operational-premium-light-contact-sheet.md` | design system token の text contact sheet (color swatch / radius / typography stack の exact 値)。Step 1 の design-system.md と内容重複あり、Claude Design が token を確実に内部 register するため再渡し | 必須 |
| 2 | `charter-summary.md` | Design Charter v1.0 (4 設計原則 + 4 IA 原則 + 4 component 層 + Trade-offs) の summary。redesign の philosophical foundation | 必須 |
| 3 | `research-compounder-refs.md` | 3 card 違反 mapping (Executive Dashboard Layout / Enterprise SaaS IA / AI-native HIL Approval UI)、各画面 redesign の根拠 | 必須 |
| 4 | `prototype-current-reference.md` | 旧 9 画面の visual inventory (ASCII layout + element 位置 + 問題点 visual 表現)。screenshot 不在でも「現状の visual と直したい点」を再現性高く伝える | 必須 |
| 5 (任意) | `prototype-screenshot-*.png` / `*.jpg` | 旧 prototype の現状 screenshot。user が pre-redesign で取得済なら一緒に upload | 任意 |

## Upload 後の前置き文 (Claude Design に paste 推奨)

```
以下を design system / philosophical foundation / 改善根拠 / 現状 reference として恒久登録してください。以降の 6 画面 prompt はこの context を前提に解釈してください:

1. (token contact sheet — design-system 補強)
2. (Design Charter v1.0 summary — 4 原則 / 4 IA / 4 component 層)
3. (research-compounder 違反 mapping — redesign 根拠)
4. (旧 prototype visual inventory — 現状 vs 直したい点)
```

## Optional: screenshot 取得手順

user が旧 prototype を起動して screenshot を取得する場合:

```bash
cd ~/code/active/backoffice-ai-v2/prototype
npm install
npm run dev
# http://localhost:5173 で 9 画面の screenshot を取得
# 保存: handoff-redesign/00-shared/upload-once/prototype-screenshot-{01-hub,02-queue,03-case,04-proposal,05-agent,06-audit,07-metrics,08-knowledge,09-sendback}.png
```

screenshot は本 dir 配下に置けば `.gitignore` で ignore されます (PR review 対象外、user local のみ)。

## 注意

- Claude Design が「同じ token を 2 度受領する」ことは error にならず、token register の確実性を上げる目的
- upload は drag & drop で複数同時可能、time 効率上 4 file 一括 drag を推奨
