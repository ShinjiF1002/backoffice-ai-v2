# 画面横断 デザイン一貫性監査 (9 画面、2026-05-28)

> Claude Design で生成した 9 画面 (`screens-v2/0N-*`) の実 source を展開し、機械監査 (token diff / hex grep / icon coverage / tone mapping / chrome diff) + render smoke (01-hub / 04-case-detail) で確認。各画面は**独立した Claude Design セッション生成**だが共通 context を投入したため基盤は高度に一貫。drift は特定パターンに集中。
>
> 監査対象 = 実 UI file のみ (`*.jsx` のうち本体 + chrome/components)。**dev scaffolding (`tweaks-panel.jsx` / `wireframe-*.jsx` / `variants-*.jsx`) は実 UI ではないため除外** (これらに含まれる #D97757 等の off-palette 色は誤検知)。

## 1. 監査観点 (洗い出し、10 dimension)

| # | 観点 | 何を見るか |
|---|---|---|
| D1 | デザイントークン基盤 | color / spacing / radius / type token の定義が画面間で同一か (`tokens.css`) |
| D2 | 色の意味的トーン適用 | status・状態 → tone (alert/success/primary/slate/inset) のマッピングが概念単位で一貫か |
| D3 | ハードコード値 (token bypass) | token を使わず raw hex を直書きしていないか |
| D4 | アイコン | icon セット / スタイル (stroke 等) / 概念→icon マッピング / 欠けアイコン |
| D5 | クローム (Sidebar / TopBar / nav) | nav 項目・順序・ラベル・group・アクティブ表現の一貫性 |
| D6 | 共有 component primitive | StatusBadge / Btn / MetaChip / Disclosure が共有実装か、画面ごと再実装か |
| D7 | ステータス語彙 | 同一 status の表記が画面間で一致するか |
| D8 | タイポグラフィ | type scale / font-family の適用一貫性 |
| D9 | レイアウト / page-shell 構造 | header/body/footer・grid 構造の型一貫性 (typology) |
| D10 | モーション / インタラクション | transition / drawer / toast / hover の token 由来性 |

## 2. 横断監査結果 (evidence + 重大度)

重大度: 🔴 可視の破綻・不整合 / 🟡 drift-prone・軽微な可視差 / 🟢 良好

| # | 観点 | 結果 | 重大度 | 根拠 (mechanical) |
|---|---|---|---|---|
| D1 | トークン基盤 | **9 画面の `tokens.css` が完全一致** (308 行、diff 0) | 🟢 | `diff` 全 8 画面 vs 04 baseline = 0 行。primary #635BFF / canvas #F8FAFC / alert #F59E0B / success #10B981 / border #E5E7EB / fg #0F172A 全画面同値 |
| D2 | 意味的トーン | **各画面が status→tone を局所再宣言** (SSOT 不在)。概ね整合 (確認待ち→primary / 反映済・完了→success / 要確認・差戻し→alert / 承認待ち・送付済→slate / 受付・system→inset) だが中央定義が無く drift-prone | 🟡 | `cases.jsx` STATUS const / `proposals.jsx` STATUS / `hub.jsx` / `agent-detail.jsx` / `observatory.jsx` がそれぞれ独自に tone を定義 |
| D3 | ハードコード | **実 UI に off-palette hex は 0** (token 適用良好)。例外: ① soft-tint `-200` (#FDE68A amber / #C7D2FE indigo / #A7F3D0 emerald) が 04/03/06/09 でハードコード = **token 未定義 tier** ② 04 `docanchor.jsx` の紙文書グレー (#666 ×7 / #1a1a1a / #ccc / #bbb / #d0d0d0 / #999 / #E9EBEF) = 申請書類の紙再現で意図的だが未トークン化・未文書化 | 🟡 | 本体 jsx の非白 hex grep: 02/05/07/08 = 0、03/06/09 = #C7D2FE のみ、04 hi-fi = soft-tint + 紙グレー。dev scaffolding の #D97757 等は実 UI 外 (誤検知) |
| D4 | アイコン | 共有 Icon (chrome.jsx 23-set) を **8 画面で同一使用** ✅。**🔴 03-approvals が未定義 `pencil-dot` を参照** → 空描画。04 は独自 icon system (shell.jsx) + dev file に emoji。`inbox`/`inboxStack` は用途区別 (受信トレイ / 承認待ち) で OK、`check`/`check-circle` は重複候補 (要統一) | 🔴 (pencil-dot) / 🟡 (04・check 系) | chrome.jsx defined set に `pencil-dot` 無し。`03-approvals/approvals.jsx:30` が `icon="pencil-dot"` |
| D5 | クローム | **chrome.jsx が 8 画面で完全一致** (diff 0)、nav 6 項目 (ハブ/受信トレイ/承認待ち/AI 提案レビュー/Agent 設定/モニタリング) + group (処理/改善/監視) ✅。**🟡 04 のみ独自 shell.jsx**: nav は同 6 項目だが `group` 無し → **見出し無しの flat 表示** (他 8 は grouped) | 🟡 | `diff 01-hub/chrome.jsx 0N/chrome.jsx` = 0。04 shell.jsx:153-158 に group field 無し |
| D6 | 共有 primitive | StatusBadge / MetaChip / Btn / Disclosure / Sidebar / TopBar を chrome.jsx で共有 (8 画面同一) ✅。`components.jsx` も 06/08/09 で同一 ✅。**🟡 04 のみ shell.jsx で同等物を別実装** (parallel implementation = 構造的負債) | 🟡 | chrome.jsx に 10 primitive 定義、8 画面同一。04 は shell.jsx に独自定義 |
| D7 | ステータス語彙 | 確認待ち / 承認待ち / 差戻し再処理 / 反映済 / 要確認 は整合 ✅。**🟡 「受付」のゆれ**: fixture「受付」 vs cases「受付済」 | 🟡 | status 文字列 grep。`cases.jsx:8` pending='受付済'、fixture §3 = 受付 |
| D8 | タイポグラフィ | tokens.css 同一 = type scale (h1/h2/h3/caption) + font (Inter/Noto Sans JP/JetBrains Mono) 全画面同一 ✅ | 🟢 | tokens.css diff 0 (D1 と同根拠) |
| D9 | レイアウト構造 | typology は spec 通り (A: Hub/モニタリング / B: 一覧 4 / C: 詳細 3)。04 = 文書アンカー 2-pane (設計意図) で他 C 型 (06/08) と構造が違うが**意図的** | 🟢 | screen-contracts-v2 typology lock 準拠 |
| D10 | モーション | transition は共通 token `--ease` (cubic-bezier) を tokens.css で共有。drawer/toast/fade は各画面実装だが token 由来。prefers-reduced-motion も tokens.css に共通定義 | 🟢 | tokens.css 共通 (D1)。詳細精査は未実施 (低優先) |

## 3. 総括

- **基盤 (D1 token / D5 chrome / D6 primitive / D8 type) は高度に一貫** — 共通 context 投入が効いた。ユーザの「ばらついて見える」体感の主因は基盤ではなく下記の局所 drift。
- **drift は 5 パターンに集中**:
  1. **04-case-detail (pilot) が独自 chrome (shell.jsx)** — D4/D5/D6 の根。他 8 は chrome.jsx に収束したが、04 は template 確立前に作られ取り残された。nav が flat、独自 icon system。← **最大の構造要因**
  2. **status→tone の SSOT 不在** (D2) — 各画面が局所再宣言。今は概ね整合だが恒久的に drift-prone。
  3. **soft-tint `-200` tier が token 未定義** (D3) — #FDE68A/#C7D2FE/#A7F3D0 がハードコードに落ちる。
  4. **🔴 03-approvals の `pencil-dot` 欠けアイコン** (D4) — 唯一の可視破綻。
  5. **04 紙文書グレー + 「受付」語彙ゆれ** (D3/D7) — 軽微。
- **🔴 は 1 件のみ (pencil-dot)、他は 🟡/🟢**。全体として「破綻」ではなく「収束しきっていない」状態。

## 4. 修正方針 (複数案) と評価

評価軸: 一貫性効果 / 工数 (AI coding agent 基準) / 手戻りリスク / プロトタイプ段階の妥当性 / SSOT 永続性 (再生成・Phase 2 への効き)

### 案 A: Spec/context 側で SSOT 強化 → Claude Design で再生成
context に「status→tone table」「icon-per-concept table」「soft-tint `-200` token 追加」「04 も chrome.jsx 準拠」を明記し、ドリフトした画面を再生成。
- 一貫性: ◎ (根本) / 工数: △ (再生成 + 再検証、特に 04) / 手戻り: △ (再生成で別 drift の可能性) / プロトタイプ妥当性: ◎ / SSOT 永続性: ◎
- 注: Claude Design は毎回ばらつくため、再生成で別の微 drift が入りうる。

### 案 B: 生成物を直接後処理 (post-generation patch)
既存 9 画面の jsx を手で統一: chrome.jsx を 04 にも適用 / pencil-dot 修正 / soft-tint を token 化 / status map を共有 const 化。Claude Design を介さない。
- 一貫性: ◎ (確実) / 工数: ○ (機械的、AI 編集は安価) / 手戻り: ◎ (低、現物を直接) / プロトタイプ妥当性: △ (Claude Design 成果物を手編集 = 次の再生成で消える) / SSOT 永続性: △ (生成物のみ、spec に戻さないと揮発)

### 案 C: Phase 2 React 集約で吸収 (今は触らない、defer)
プロトタイプ段階の drift は許容し、React 化 (`prototype-redesign/`) で shared PageShell / StatusBadge / Icon / tokens に一元化する時に全 drift を解消。
- 一貫性: ◎ (React で構造的に強制) / 工数: ◎ (今ゼロ) / 手戻り: ◎ / プロトタイプ妥当性: △ (プロトタイプの見た目 drift は残る) / SSOT 永続性: ◎ (React 実装が SSOT 化)

### 案 D (推奨候補): ハイブリッド (🔴 即修正 + SSOT bake + 構造は defer)
1. 🔴 `pencil-dot` 欠けだけ即修正 (B 的、1 箇所)
2. SSOT を spec/context に bake (A 的): status→tone table / soft-tint `-200` token / icon-per-concept / 「受付」語彙統一 / 04 は chrome.jsx 準拠を明記
3. 04 の chrome 統一・全体再生成は急がず、次の一括再生成か Phase 2 React で吸収 (C 的)
- 一貫性: ○→◎ (即時は pencil-dot のみ、恒久は SSOT で担保) / 工数: ◎ (即修正は小、bake は doc 編集) / 手戻り: ◎ / プロトタイプ妥当性: ◎ / SSOT 永続性: ◎
- 利点: 唯一の可視破綻を潰しつつ、ばらつきの根 (SSOT 不在) を spec 側で恒久解決。Claude Design 再生成の不確実性に賭けない。

### 案 0 (do-nothing): 現状維持
基盤は一貫し 🔴 は 1 件のみ。プロトタイプの目的 (構想共有) には現状でも十分という判断もありうる。
- ただし pencil-dot 欠けは残る / Phase 2 で結局 SSOT 化は必要。

## 5. 推奨

**案 D (ハイブリッド)**。理由: ユーザ体感の「ばらつき」の根は基盤ではなく (a) 04 の独立実装と (b) SSOT 不在。(b) は spec bake で恒久解決でき Claude Design 再生成の不確実性を回避、(a) の全体統一は Phase 2 React で構造的に吸収するのが最も費用対効果が高い。🔴 pencil-dot のみ即修正。
