# PASTE THIS ENTIRE FILE TO CLAUDE DESIGN (web chat)

> **本 file の使い方**: 本 file 全文 を Claude Design (claude.ai 等) の最初の message として paste すれば、cold-start で **Before/After 5-slide concept-share HTML deck** を build 可能。file path 参照ではなく content 内蔵、external 依存なし。
> **想定 build 時間**: 30-60 min (5 slide 短編)
> **Output**: HTML deck 1 file + screenshot pack + self-review report

> **本 file 改版履歴**:
> - v0.1/v0.2 (Cycle 16-17): **Phase 1 投入 decision deck** (Type B 設定承認 prerequisite sign-off、18 slide) — superseded
> - v0.3 (Cycle 18): **Concept share v0.3** (Linear + Cover slogan opening、6 slide) — superseded
> - **v0.4 (本版、Cycle 19)**: **Before/After Parallel Column pattern** (`side-by-side-comparison-slide` + `before-after-and-flywheel-patterns` card 由来)、**5 slide** (S3+S4 merger 反映)、素人理解可能性 最優先

---

## §A. INSTRUCTIONS (Claude Design への直接 prompt)

あなたは戦略コンサル経験を持つ deck design specialist です。以下の仕様に従って **Before/After 対比 5-slide concept-share deck** の HTML を build してください。

### A.1 Task
Backoffice AI v2 (銀行 backoffice の AI 自動化 project) の **概要説明** + **オペレーション自動化が可能な根拠** を、**全 slide を Before/After 2-column 対比 format** で 5-slide HTML deck (Reveal.js + Tailwind CDN single-file) で build する。

### A.2 Primary purpose
1. **プロジェクトの概要** を 5 軸 (案件処理 / 業務全体 / system 接続 / 人員構成) で **現状 vs 未来 対比** で 1 sitting で伝える
2. **「なぜ自動化が可能か」の根拠** を **対比 visualization で jargon を contrast に置換**

### A.3 Audience
**Mixed cross-functional non-technical** (経営層 + 業務責任者 + Security 関係者 + Compliance officer)、30 min concept share workshop format。**素人理解可能性が最優先**、技術用語は対比で見せる。

### A.4 Tone
- **Concept share + belief alignment** (Recommendation tone ではない)
- **Discussion-inviting** (本日 decision は ask しない)
- **Politics-aware** (S5 headcount は sensitive、hedge box mandatory)

### A.5 Output
1. **HTML deck** (single-file、Reveal.js 5.1+ + Tailwind CDN、5 slide)
2. **Self-review report** (build 後、§E.2 7 check)
3. 不明点は最初に質問、本 file 単独で build 可能。

### A.6 Strict constraints (絶対遵守)

- **全 5 slide を Before/After 2-column 対比 format に統一** (S1 Cover を除く)
- **共通 row dimension 4-6 件** per slide、After 列の改善点を **navy bold + ✓ icon** で highlight
- **中央 transformation lever** 列 (10% width) — 「→」+ 1 行 lever 名
- **3-color strict**: `#1a3a52` navy / `#c93838` red / `#8a8a8a` grey、4 色目禁止 (After highlight は navy bold で、red は alert/hedge 専用)
- **「完成 / production-ready」wording 禁止**: project は Draft
- **NYDFS Part 500 は State 規制** (本 deck 出ないが念のため)
- **S5 politics-sensitive hedge box mandatory**: 数値 [仮説 / 要検証] / 自然退職 / re-skilling / gradual / role count ではなく工数 index
- **Tier 3 規制語の事実主張禁止**: hedge 表現
- **40% empty rule**: 各 slide で white space 40% 以上維持
- **1 slide 1 message**: bullet wall 禁止

---

## §B. SLIDE-BY-SLIDE SPEC (5 slide、Before/After Parallel Column)

### B.0 共通 layout pattern (`before-after-and-flywheel-patterns.md` + `side-by-side-comparison-slide.md` canonical)

```
┌──────────────────────────────────────────────────────────┐
│  Action title 28pt bold + 2px navy underline               │
├─────────────────────┬───────────────┬────────────────────┤
│ Before (現状)        │   Lever       │ After (未来)        │
│ 45% width            │   10% width   │ 45% width           │
│                      │               │                     │
│  dim 1   value 1     │   → lever 1   │  dim 1   ✓value 1' │
│  dim 2   value 2     │   → lever 2   │  dim 2   ✓value 2' │
│  dim 3   value 3     │   → lever 3   │  dim 3   ✓value 3' │
│  dim 4   value 4     │   → lever 4   │  dim 4   ✓value 4' │
│  dim 5   value 5     │   → lever 5   │  dim 5   ✓value 5' │
│                      │               │                     │
└─────────────────────┴───────────────┴────────────────────┘
       Bottom slogan (24pt italic navy、So-what pin)
   出典 · page X/5 · Concept share / Internal
```

- **Common row dimension** = 全 slide で 5 row、各 slide で dimension は独自 (5 軸 = 処理 / 業務 / system / 統制 / 人員)
- **After highlight** = navy bold + `✓` prefix (3-color 維持、red は alert/hedge 専用)
- **Lever column** = 10% width、矢印 `→` + 1 行 lever 名
- **Background**: After column = `navy-soft` (#e8eef3) tint で visual contrast

### B.0.1 Pyramid trace test (titles-only readout)

S2 → S5 の action title:

> 案件 1 件の処理時間は 12 → 4 min、step は同じだが確認が判断に shift → 業務全体が「人手 100% + ad-hoc 統制」から「AI + 3 層承認 + flywheel」に再構成 → 既存 system 接続は「個別 silo」から「4 tier 構造」に整理 → Operations 人員は減、AI governance role が新規立ち上がり、net で削減・役割は深化

= **「Before の人手 silo から After の AI-hybrid + 統制された operating model へ、段階的に transformation」** が再生。

### B.1 共通 footer

```
出典: <DOC-XX §X.Y>  ·  page X/5  ·  Concept share / Internal
```

---

### **S1 Cover**

| Field | Spec |
|---|---|
| **Headline (slogan)** | 「**小さく POC で大きく成長させる**」(48-56pt bold navy、中央配置) |
| Subtitle (24pt grey) | Backoffice AI v2 — 業務処理を 5 軸で対比する |
| Meta (16pt grey) | 経営層 + 業務責任者 + Security + Compliance / Concept share workshop |
| Layout | 中央配置、minimal、navy + grey only、no chart |

---

### **S2 — 案件 1 件の処理: 現状 vs 未来**

**Action title (28pt bold)**: 案件 1 件の処理時間は 12 → 4 min、step 数は同じだが「確認」が「判断」に shift する

**Hero (2-column Before/After table)**:

| dim | **Before (現状)** | Lever | **After (Phase 1 投入後)** |
|---|---|:---:|---|
| 処理時間 / 件 | 12 min | → AI 入力支援 | **✓ 4 min** |
| Step 数 | 5 (受付→入力→確認→承認→反映) | (同じ) | 5 (同) |
| 担当者 work | 確認 100% (情報突合・形式 check) | → 役割 shift | **✓ AI 提案確認 + 判断 (例外/高 risk のみ)** |
| 差戻し時の処理 | ad-hoc memo、属人化 | → staging → 学習 | **✓ staging 記録 → AI 日次分析 → 手順承認** |
| 担当者 mental load | backlog 不安 + 単純作業 | → focus shift | **✓ 判断 work に集中、単純作業は AI 側** |

**Bottom slogan (24pt italic navy)**: 「**減らせるのは確認、残すのは判断**」

**Footer 出典**: 03-ui-prototype-design §4 + DM-07 §3.3 case_record

---

### **S3 — 業務全体構造: 現状 vs 未来** (元 S3+S4 merged)

**Action title**: 業務全体が「人手 100% + ad-hoc 統制」から「AI + 3 層承認 + flywheel」に再構成される

**Hero (2-column Before/After table)**:

| dim | **Before (現状)** | Lever | **After (Phase 1 投入後)** |
|---|---|:---:|---|
| 案件処理 flow | 受付→入力→確認→承認→反映 (全人手) | → AI 化 + 4-eyes | **✓ 同 flow + AI 入力 + 入力者確認 + 承認者承認 (4-eyes)** |
| 学習 mechanism | 個人 know-how 暗黙知 | → 5 段 flywheel | **✓ 差戻し → staging → AI 日次分析 → 手順承認 → compiled 反映** |
| 統制 layer | 案件ごと個別 review、暗黙 SoD | → 3 層分離 | **✓ 案件 / 手順 / 設定 の 3 層承認 + 4-eyes (入力者 ≠ 承認者)** |
| 承認の type 区分 | undocumented | → Type A/B/C | **✓ Type A (通常) / B (Security-impacting) / C (Trust Level 変更)** |
| KPI 可視性 | 差戻し率 etc. ad-hoc | → continuous monitor | **✓ 4 KPI gate (AI 入力承認率/人手上書き率/Alert 発生率/差戻し率) [仮説 / 要検証]** |

**Bottom slogan**: 「**AI に任せる量は段階的に増やすが、人によるコントロールは渡さない**」

**Footer 出典**: 01-flywheel-and-knowledge §1-§7 + 02-approval-model §1-§9 + DM-07 §5.1 4-eyes

---

### **S4 — 既存 system への接続: 現状 vs 未来**

**Action title**: 既存 system 接続は「個別 silo」から「API / MQ / RPA-CU / DB の 4 tier 構造」に整理される

**Hero (2-column Before/After table)**:

| dim | **Before (現状)** | Lever | **After (Phase 1 投入後)** |
|---|---|:---:|---|
| 接続方式 | 個別接続 / 手作業 / undocumented | → 4 tier 化 | **✓ API / MQ / RPA-CU / DB 直接続 の 4 tier 構造化** |
| 標準 system | API 不在 or undocumented | → API default | **✓ API が default の接続方式** |
| レガシー連携 | 個別対応、人手 polling | → MQ / event | **✓ MQ / event / file bridge で非同期化** |
| API 不在 system | 手作業 or 部分 RPA | → Computer Use sandbox | **✓ Computer Use sandbox (1 case = 1 ephemeral task)** |
| DB 直接続 | read/write 区別不明 | → SoP enforce | **✓ 原則 read-only、write は明示承認 + 限定条件** |

**Bottom slogan**: 「**API が default、Computer Use は API 不在の bridge、DB 直接続は最終手段**」

**Footer 出典**: 00-overview §2.2 + _SSOT §1.5 接続層 4 tier

---

### **S5 — 人員構成 + 役割: 現状 vs 未来 (Phase 3 完了時)**

**Action title**: Operations 人員は減少、AI governance role が新規立ち上がり、net で削減・役割は深化する

**Hero (2-column Before/After table)**:

| dim | **Before (現状)** | Lever | **After (Phase 3 完了時、[仮説 / 要検証])** |
|---|---|:---:|---|
| 総人員 index | 100 | → -48% (gradual) | **52** |
| Operations role | 100 (全 confirm + 手順実行) | → 自動化 + 自然退職 | **30 (-70%)** |
| AI governance role | 0 (該当 role 未在) | → 新規創出 | **✓ +22 (AI 管理者 / Security AI / Compliance AI / Model Risk / Audit AI)** |
| 人間 work | 100% 確認・手順実行 | → 役割 shift | **✓ 検証 / 高 risk / 高難易度 / 例外ケース** |
| 移行 path | n/a | → re-skilling + 自然退職 | **gradual 移行 + re-skilling (即時 layoff ではない)** |

**Hedge box (alert red border、bottom、mandatory)**:

> ⚠ **本図の前提 (politics-aware framing)**
> - 数値 全件 **[仮説 / 要検証]**、Phase 1 実測で calibrate
> - **即時 layoff ではない**、自然退職 + re-skilling + gradual 移行
> - 「**役割が深くなる**」 — Future 4 category は judgment work、operations の dignity 保持
> - **1 role count ではなく operations 工数 index**、新 AI gov role は既存社員の re-skilling path 内包
> - **段階的 transition**: Phase 1 (-15%) → Phase 2 (-33%) → Phase 3 (-48%)

**Bottom slogan (24pt italic、Cover slogan 回収 mandatory)**:

> 「**人数は減る、役割は深くなる、移行は段階的** — Cover で提示した『**小さく POC で大きく成長**』の実装が本図」

**Footer 出典**: CA-08 §14A Tenant lifecycle + modernize-transformation/target-operating-model + canon C4-20 Three Horizons

---

## §C. VISUAL DESIGN SYSTEM

### C.1 Color palette (3-color strict)

```css
colors: {
  navy: '#1a3a52',           /* primary、header / title / chart main / After highlight */
  'navy-light': '#2d5a7d',
  'navy-soft': '#e8eef3',    /* After column 背景 tint */
  red: '#c93838',            /* alert / S5 hedge box border のみ */
  'red-soft': '#fbe8e8',
  grey: '#8a8a8a',           /* Before column / supporting / footnote */
  'grey-light': '#bababa',
  canvas: '#fafaf8',         /* slide background */
  surface: '#f0f0ec',        /* table row alt */
}
```

**After highlight rule**: navy bold + `✓` prefix。red 系は **S5 hedge box border のみ**、それ以外で red 使用禁止。

### C.2 Typography

| Element | Font | Size | Weight |
|---|---|---|---|
| Cover slogan | Inter + Noto Sans JP | 48-56pt | Bold |
| Action title | Inter + Noto Sans JP | 28pt | Bold |
| Table row dim | Inter + Noto Sans JP | 14pt | SemiBold (grey) |
| Table cell value | Inter + Noto Sans JP | 16pt | Regular (Before grey) / **Bold (After navy)** |
| Lever 矢印 | Inter | 20pt | Regular |
| Bottom slogan | Inter | 24pt | Regular italic (navy) |
| Hedge box | Inter + Noto Sans JP | 13pt | Regular |
| Footer | Inter | 10-12pt | Regular grey |

### C.3 Layout

```
┌────────────────────────────────────────────────────────┐ ← 16:9 (1920×1080)
│  HEADER (12% top、padding 80px)                          │
│  Action title 28pt bold + 2px navy underline             │
├─────────────────────┬───────────────┬───────────────────┤
│ HERO (65% middle)   │               │                   │
│ Before (45% width)  │ Lever (10%)   │ After (45% width) │
│  grey bg            │ centered →    │ navy-soft bg      │
│  5 row dim          │ 5 lever       │ 5 row dim         │
├─────────────────────┴───────────────┴───────────────────┤
│ FOOTER (23% bottom)                                       │
│ Bottom slogan (24pt italic navy、center)                  │
│ (S5 only: hedge box with red border above slogan)         │
│ ──── 出典 · page X/5 · Concept share / Internal           │
└────────────────────────────────────────────────────────┘
   ← 8% L                                  8% R →
```

- **40% empty rule** 維持: row 5 件 + lever + slogan で 60% ink coverage 上限
- **Asymmetric vs symmetric margin**: Before/After symmetric (visual balance)、Cover/Footer は asymmetric (8% L/R margin)

### C.4 Animation

- Slide transition: `fade`
- Within-slide: no animation

---

## §D. ANTI-PATTERN GUARDRAILS (build 後 self-review で全件 check)

### D.1 Canon C8a 12 anti-pattern

1. ☐ Bullet wall slide 禁止 (本 deck は Before/After table format で自然回避)
2. ☐ 'TBD' / 'Coming soon' on hero 禁止
3. ☐ Multi-color palette overuse 禁止 (3-color strict、After highlight = navy bold + ✓ で red 不使用)
4. ☐ Briefing → Recommendation tone 混在 禁止 (本 deck は concept share 一貫)
5. ☐ Action title が takeaway なし 禁止
6. ☐ So-what 不在 禁止 (bottom slogan で each slide pin)
7. ☐ Footnote overload 禁止
8. ☐ Decision ask 不在 OK (本 deck は concept share)
9. ☐ Risk hidden 禁止 (S5 で headcount honne を Before/After で up-front)
10. ☐ Honne / tatemae 不整合 禁止
11. ☐ Pyramid trace fail 禁止 (§B.0.1 readout 確認)
12. ☐ White space 不足 (>60% ink) 禁止

### D.2 Project-specific 4 guardrail

13. ☐ 'design-complete / 完成' wording 禁止
14. ☐ 'primary regulator' 断定 禁止
15. ☐ NYDFS を Federal 行に置く 禁止 (本 deck 出ない、念のため keep)
16. ☐ Tier 3 規制語の事実主張 禁止

### D.3 Politics-sensitive 6 guardrail (S5 専用)

17. ☐ Headcount 削減を冷酷 wording 禁止 → 「役割が深くなる」「総量は減るが質は高まる」
18. ☐ 数値を確定数で出す 禁止 → 全 [仮説 / 要検証] label
19. ☐ Layoff direct imply 禁止 → 「自然退職 + re-skilling + gradual」
20. ☐ 具体 業務名 (削減 target 推測) を chart に書く 禁止
21. ☐ Future 4 category を「楽な仕事」風 wording 禁止 → judgment work 明示
22. ☐ Cover slogan を S5 で回収しない 禁止 → bottom slogan で explicit call-back

### D.4 Before/After-specific 4 guardrail (v0.4 新規)

23. ☐ **Before / After 列幅不均等 禁止**: 必ず 45% / 10% / 45% 等幅 (canon `side-by-side-comparison-slide`)
24. ☐ **Row dimension 全 slide で 統一数 (5 件) 推奨**: dimension は各 slide 独自で OK、ただし数は 5 件で揃える (cognitive consistency)
25. ☐ **After 列で改善点を highlight しない 禁止**: 必ず navy bold + ✓ prefix で visual distinction
26. ☐ **Lever 列が空 or 1 lever のみで全 row 説明 禁止**: 各 row に独立した lever 1 行 (transformation の因果関係を pin)

---

## §E. PRODUCTION CHECKLIST

### E.1 Build steps (5)

1. ☐ Reveal.js 5.x + Tailwind CDN single-file HTML を build (filename: `concept-share-ba.html` 推奨、ba = Before/After)
2. ☐ 5 slide を §B spec 通り build (S1 Cover + S2-S5 Before/After 4 slide、no appendix)
3. ☐ Color palette / typography / layout を §C strict 準拠
4. ☐ 各 slide footer に `出典 · page X/5 · Concept share / Internal`
5. ☐ Before/After table は HTML table or CSS grid で実装、SVG / external image 不要

### E.2 Self-review check (7)

1. ☐ Pyramid trace test (canon C2-10): §B.0.1 readout 再生可能
2. ☐ C8a 12 anti-pattern (§D.1): violation 0
3. ☐ Project-specific 4 (§D.2): violation 0
4. ☐ Politics-sensitive 6 (§D.3、S5): ✅ all
5. ☐ **Before/After-specific 4 (§D.4、新規)**: ✅ all
6. ☐ 3-color check (navy/red/grey 以外 0 件、canvas + surface 許容)
7. ☐ 40% empty rule (各 slide ink coverage < 60%)

### E.3 Self-review report format

```markdown
# Concept Share Deck (Before/After) Self-Review Report

## E.2 7 check 結果
1. Pyramid trace: ✅ / ⚠ / ❌
2. C8a 12: ✅ / ⚠ N 件
3. Project 4: ✅ / ⚠
4. Politics 6: ✅ / ⚠
5. Before/After 4: ✅ / ⚠
6. 3-color: ✅ / ⚠
7. 40% empty: ✅ / ⚠

## Build summary
- Total slides: 5
- File size: ~XXX KB
```

---

## §F. REFERENCE HTML PATTERN (Reveal.js + Tailwind CDN skeleton)

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=1920, initial-scale=1.0" />
  <title>Backoffice AI v2 — 業務処理を 5 軸で対比する</title>

  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@5.1.0/dist/reveal.min.css" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link
    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+JP:wght@400;500;600;700;900&family=JetBrains+Mono:wght@400;500&display=swap"
    rel="stylesheet"
  />
  <script src="https://cdn.tailwindcss.com"></script>

  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            sans: ['Inter', 'Noto Sans JP', 'system-ui', 'sans-serif'],
            mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
          },
          colors: {
            navy: '#1a3a52',
            'navy-light': '#2d5a7d',
            'navy-soft': '#e8eef3',
            red: '#c93838',
            'red-soft': '#fbe8e8',
            grey: '#8a8a8a',
            'grey-light': '#bababa',
            canvas: '#fafaf8',
            surface: '#f0f0ec',
          },
        },
      },
    }
  </script>

  <style>
    .reveal {
      font-family: 'Inter', 'Noto Sans JP', system-ui, sans-serif;
      font-size: 16px;
      background-color: #fafaf8;
      color: #1a3a52;
    }
    .reveal .slides { text-align: left; }
    .reveal .slides section {
      padding: 60px 80px 60px 80px;
      box-sizing: border-box;
      height: 100%;
      background-color: #fafaf8;
    }
    .reveal h1 {
      font-size: 56px; font-weight: 700; line-height: 1.15;
      color: #1a3a52; letter-spacing: -0.02em;
    }
    .reveal h2 {  /* Action title */
      font-size: 28px; font-weight: 700; line-height: 1.3;
      color: #1a3a52; margin: 0 0 24px 0; letter-spacing: -0.015em;
      padding-bottom: 12px;
      border-bottom: 2px solid #1a3a52;
      display: inline-block;
    }
    .reveal h3 { font-size: 16px; font-weight: 600; color: #1a3a52; margin: 0 0 12px 0; }
    .reveal p { font-size: 16px; line-height: 1.6; color: #1a3a52; }
    .reveal .slogan { font-size: 24px; font-style: italic; color: #1a3a52; }
    .reveal .footer {
      position: absolute;
      bottom: 20px;
      left: 80px;
      right: 80px;
      font-size: 11px;
      color: #8a8a8a;
      display: flex;
      justify-content: space-between;
    }
    .reveal .progress { color: #1a3a52; }
    .reveal .slide-number {
      background-color: rgba(26, 58, 82, 0.08);
      color: #1a3a52;
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      padding: 4px 8px;
      border-radius: 4px;
    }
    /* Before/After table styles */
    .ba-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      margin: 20px 0;
    }
    .ba-table thead th {
      padding: 12px 16px;
      font-weight: 700;
      font-size: 18px;
      text-align: left;
    }
    .ba-table thead th.before { color: #8a8a8a; }
    .ba-table thead th.lever { text-align: center; color: #1a3a52; }
    .ba-table thead th.after { color: #1a3a52; background: #e8eef3; }
    .ba-table tbody td {
      padding: 14px 16px;
      vertical-align: top;
      font-size: 15px;
      line-height: 1.5;
      border-top: 1px solid rgba(26, 58, 82, 0.08);
    }
    .ba-table tbody td.dim { font-weight: 600; color: #8a8a8a; font-size: 14px; }
    .ba-table tbody td.before { color: #8a8a8a; }
    .ba-table tbody td.lever { text-align: center; color: #1a3a52; font-size: 13px; }
    .ba-table tbody td.after {
      background: #e8eef3;
      color: #1a3a52;
      font-weight: 700;
    }
    .ba-table tbody td.after::before { content: "✓ "; }
    .hedge-box {
      border: 2px solid #c93838;
      background: #fbe8e8;
      padding: 16px 20px;
      margin-top: 24px;
      border-radius: 4px;
      font-size: 12px;
      line-height: 1.6;
      color: #1a3a52;
    }
    .hedge-box strong { color: #c93838; }
  </style>
</head>

<body>
  <div class="reveal">
    <div class="slides">

      <!-- S1 Cover -->
      <section data-transition="fade">
        <div class="h-full flex flex-col items-center justify-center text-center">
          <h1 class="text-navy text-7xl mb-8 leading-tight">
            小さく POC で<br/>大きく成長させる。
          </h1>
          <p class="text-grey text-2xl mb-4">Backoffice AI v2 — 業務処理を 5 軸で対比する</p>
          <p class="text-navy text-lg">経営層 + 業務責任者 + Security + Compliance / Concept share workshop</p>
        </div>
        <div class="footer">
          <span>Concept share workshop</span>
          <span>Internal</span>
        </div>
      </section>

      <!-- S2 案件 1 件の処理 (Before/After table example) -->
      <section data-transition="fade">
        <h2>案件 1 件の処理時間は 12 → 4 min、step 数は同じだが「確認」が「判断」に shift する</h2>

        <table class="ba-table">
          <colgroup>
            <col style="width: 15%" />
            <col style="width: 35%" />
            <col style="width: 15%" />
            <col style="width: 35%" />
          </colgroup>
          <thead>
            <tr>
              <th></th>
              <th class="before">Before (現状)</th>
              <th class="lever">Lever</th>
              <th class="after">After (Phase 1 投入後)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="dim">処理時間 / 件</td>
              <td class="before">12 min</td>
              <td class="lever">→ AI 入力支援</td>
              <td class="after">4 min</td>
            </tr>
            <tr>
              <td class="dim">Step 数</td>
              <td class="before">5 (受付→入力→確認→承認→反映)</td>
              <td class="lever">(同じ)</td>
              <td class="after" style="background: transparent; color: #8a8a8a; font-weight: 400;">5 (同)</td>
            </tr>
            <tr>
              <td class="dim">担当者 work</td>
              <td class="before">確認 100% (情報突合・形式 check)</td>
              <td class="lever">→ 役割 shift</td>
              <td class="after">AI 提案確認 + 判断 (例外/高 risk のみ)</td>
            </tr>
            <tr>
              <td class="dim">差戻し時の処理</td>
              <td class="before">ad-hoc memo、属人化</td>
              <td class="lever">→ staging → 学習</td>
              <td class="after">staging 記録 → AI 日次分析 → 手順承認</td>
            </tr>
            <tr>
              <td class="dim">担当者 mental load</td>
              <td class="before">backlog 不安 + 単純作業</td>
              <td class="lever">→ focus shift</td>
              <td class="after">判断 work に集中、単純作業は AI 側</td>
            </tr>
          </tbody>
        </table>

        <div class="mt-6 text-center">
          <p class="slogan">「減らせるのは確認、残すのは判断」</p>
        </div>

        <div class="footer">
          <span>出典: 03-ui-prototype-design §4 + DM-07 §3.3</span>
          <span class="slide-number">2 / 5</span>
        </div>
      </section>

      <!-- S3-S5 同 pattern で expand
           S5 のみ <div class="hedge-box"> を slogan の前に追加 (politics-sensitive content) -->

      <!-- S5 hedge-box example: -->
      <!--
      <div class="hedge-box">
        <strong>⚠ 本図の前提 (politics-aware framing)</strong>
        <ul class="mt-2 space-y-1">
          <li>・ 数値 全件 <strong>[仮説 / 要検証]</strong>、Phase 1 実測で calibrate</li>
          <li>・ <strong>即時 layoff ではない</strong>、自然退職 + re-skilling + gradual 移行</li>
          <li>・ 「役割が深くなる」 — Future 4 category は judgment work、operations の dignity 保持</li>
          <li>・ 1 role count ではなく <strong>operations 工数 index</strong>、新 AI gov role は既存社員の re-skilling path 内包</li>
          <li>・ 段階的 transition: Phase 1 (-15%) → Phase 2 (-33%) → Phase 3 (-48%)</li>
        </ul>
      </div>
      -->

    </div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/reveal.js@5.1.0/dist/reveal.min.js"></script>
  <script>
    Reveal.initialize({
      width: 1920,
      height: 1080,
      margin: 0,
      controls: true,
      progress: true,
      slideNumber: 'c/t',
      hash: true,
      transition: 'fade',
    });
  </script>
</body>
</html>
```

### Hero visual implementation hints

- **全 S2-S5**: 同 `.ba-table` class で 4-column (dim / before / lever / after) 5 row、After 列に `navy-soft` 背景 + `✓` prefix
- **S5 のみ**: `.ba-table` の後に `.hedge-box` (red border、4 bullet hedge)、その後 bottom slogan
- 全 chart は HTML table or CSS grid、SVG inline、external image asset 不要

---

## §G. CANON PRINCIPLE GLOSSARY (本 deck で使用)

| Ref | 1-line explanation |
|---|---|
| C2-6 Action title | 12-15 words、claim form S-V-O、takeaway-first |
| C2-7 1 slide 1 message | Singleton test、1 slide に 1 message |
| C2-10 Pyramid trace test | Title-only readout で governing thought 再生確認 |
| C3-11 Typography | Action title 28pt bold、body 16pt、slogan 24pt italic |
| C3-12 3-color rule | navy / red / grey 3 色のみ |
| C3-13 White space | 40% empty rule |
| C3-14 Footer | 出典 + page number + audience indicator |
| C3-15 Header | Action title + 2px underline |
| **C4-23 Table-as-chart** | **本 deck core: cell-level shading + 1 highlight 列**。Before/After で必須 |
| **side-by-side-comparison-slide** | **2-3 列等幅、共通 row、cell に 1-2 行 fact、最終 row が verdict** |
| **before-after-and-flywheel-patterns** | **2 column 同 dimension 4-6 row、After 強調 color、center transformation lever** |
| C8a 12 anti-pattern | §D.1 12 件 |

---

## §H. RESEARCH-COMPOUNDER CARDS USED

本 deck v0.4 の構成 anchor:

| Card | Use |
|---|---|
| **`slide-design/before-after-and-flywheel-patterns.md`** | **Primary anchor**: 2-column Before/After layout、After 改善点 highlight、center transformation lever |
| **`slide-design/side-by-side-comparison-slide.md`** | **Primary anchor**: 共通 row dimension、column 等幅、各 cell 1-2 行 fact、最終 row verdict 形式 |
| `ux-design/jtbd-customer-journey-mapping.md` | S2 dimension 設計 (1 件処理時間 / mental load / 担当者 work) の JTBD framing 由来 |
| `slides-executive/storytelling-spine-and-narrative-arc.md` | Pyramid trace test の readout 確認 (§B.0.1) |
| `modernize-transformation/target-operating-model-1page.md` | S5 役割 shift framing |
| `modernize-transformation/phased-modernization-strangler-fig.md` | S5 段階成長 underpinning、Cover slogan の根拠 |
| `modernize-transformation/org-redesign-for-ai-native.md` | S5 新 AI governance role + re-skilling |
| `ai-agents-automation/raci-on-agent-action.md` | S3 3 層承認 RACI structure |

---

## §I. 完了条件

build 完了 + §E.2 self-review 7 check 全 ✅ + self-review report 出力 → user review に hand-off。不明点は最初に質問。本 file 単独で実行可能。
