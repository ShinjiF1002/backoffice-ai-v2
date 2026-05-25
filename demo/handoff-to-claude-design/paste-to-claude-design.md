# PASTE THIS ENTIRE FILE TO CLAUDE DESIGN (web chat)

> **本 file の使い方**: 本 file 全文 を Claude Design (claude.ai 等) の最初の message として paste すれば、cold-start で concept-share HTML deck を build 可能。file path 参照ではなく content 内蔵、external 依存なし。
> **想定 build 時間**: 30 min - 1 hr (6 slide 短編)。
> **Output**: HTML deck 1 file + screenshot pack + self-review report。

> **本 file 改版履歴**:
> - v0.1 / v0.2 (旧、Cycle 16-17): **Phase 1 投入 decision deck** (Type B 設定承認 prerequisite sign-off、18 slide、CXO+Risk Committee 単独 audience) — **superseded**
> - **v0.3 (本版、Cycle 18)**: **Concept share + automation feasibility 説明 deck** に story pivot。6 slide、Mixed audience (経営層 + 業務責任者 + Security + Compliance)、Linear sequence + Cover slogan opening (III+A、research-compounder narrative card 由来) に再構築

---

## §A. INSTRUCTIONS (Claude Design への直接 prompt)

あなたは戦略コンサル経験を持つ deck design specialist です。以下の仕様に従って **concept-share + automation feasibility 説明 deck** の HTML を build してください。

### A.1 Task
Backoffice AI v2 (銀行 backoffice の AI 自動化 project) の **概要説明** + **オペレーション自動化が可能な根拠** を伝える 6-slide HTML deck を Reveal.js + Tailwind CDN single-file で build する。

### A.2 Primary purpose
1. **プロジェクトの概要** を 1 sitting で伝える
2. **「なぜ自動化が可能か」の根拠** を D 軸 (組織 feasibility: 段階成長 + 人間役割 shift + headcount evolution) を core に説明する

### A.3 Audience
**Mixed cross-functional** (経営層 + 業務責任者 + Security 関係者 + Compliance officer)、30 min concept share workshop format。

### A.4 Tone
- **Concept share + belief alignment** (Recommendation tone ではない)
- **Discussion-inviting** (本日 decision は ask しない、議論起動が purpose)
- **Politics-aware** (S6 headcount reduction は sensitive、hedge inline mandatory)

### A.5 Decision ask
**本日は decision ask しない**。概要理解 + automation feasibility 認識 + 各機能の関与点 identify が outcome。

### A.6 Output
1. **HTML deck** (single-file、Reveal.js 5.1+ + Tailwind CDN)
2. **Self-review report** (build 後、§E.2 7 check 全件)
3. 不明点があれば最初に質問、ただし本 file 単独で build 可能な setup。

### A.7 Strict constraints (絶対遵守)

- **「完成 / production-ready」wording 禁止**: project は Draft、本投入は Phase 1 着手後
- **NYDFS Part 500 は State 規制**: Federal と混同しない
- **役割 shift / headcount は politics-sensitive**: hedge 4 件 mandatory inline
  - 「数値は [仮説 / 要検証]、Phase 1 実測 calibrate」
  - 「即時 layoff ではない、自然退職 + re-skilling + gradual 移行」
  - 「役割が深くなる、operations の dignity 保持」
  - 「1 role count ではなく operations 工数 index」
- **3-color strict**: `#1a3a52` navy / `#c93838` red / `#8a8a8a` grey、4 色目禁止
- **40% empty rule**: 各 slide で white space 40% 以上維持
- **1 slide 1 message**: bullet wall 禁止、各 slide 1 hero visual
- **Tier 3 規制語の事実主張禁止**: hedge 表現 (`[ai-operator paper §X.Y 参照]`)

---

## §B. SLIDE-BY-SLIDE SPEC (6 slide、Linear + Cover slogan / 改善案 III+A)

### B.0 Narrative arc

```
S1 Cover (slogan punchline)
   ↓
S2 Project = 何を作るか (what)
   ↓
S3 業務現状 + Flywheel = どう動くか (how it flows)
   ↓
S4 3 層承認 + 4-eyes = どう統制するか (how it's controlled)
   ↓
S5 接続層 4 tier = どう繋ぐか (how it integrates)
   ↓
S6 役割 shift + Headcount evolution = どう育つか + Cover slogan 回収 (how it grows + closing)
```

### B.0.1 Pyramid trace test (titles-only readout)

S2 → S6 の action title だけで読み下すと:

> 差戻しを次の正解手順に変える仕組みを AWS Bedrock + Aurora で構築 → 案件処理は「手順実行 + 案件確認」の繰返し、差戻し flywheel で AI 学習を承認管理 → 案件/手順/設定 の 3 層承認 + 4-eyes で control は人間保持 → 既存 system への接続は 4 tier (API/MQ/RPA-CU/DB) で実装 → 人間役割は operations → 検証/高 risk/高難易度/例外 へ shift、phase ごと operations 減 + AI gov 増 + net 削減

= Cover slogan「**小さく POC で大きく成長させる**」の **実装が S2-S6 で unfold**、S6 で回収される rhetorical bookend。

### B.1 共通 footer convention (各 slide 下部に固定)

```
出典: <DOC-XX §X.Y>  ·  page X/6  ·  Concept share / Internal
```

---

### **S1 Cover**

| Field | Spec |
|---|---|
| **Headline (slogan)** | 「**小さく POC で大きく成長させる**」(48-56pt bold navy、中央配置) |
| Subtitle (24pt grey) | Backoffice AI v2 — オペレーション自動化の概念共有 |
| Meta line (16pt grey) | 経営層 + 業務責任者 + Security + Compliance / Concept share workshop |
| Date | YYYY-MM-DD |
| Layout | 中央配置、minimal、navy + grey only、no chart |
| Footer | Concept share / Internal |

---

### **S2 Project 1-page**

| Field | Spec |
|---|---|
| **Action title (28pt bold navy)** | 差戻しを次の正解手順に変える仕組みを、AWS Bedrock + Aurora で構築する |
| **Hero (3-column 1-page summary、中央配置)** | |
| Col 1: **何を** (navy box) | AI 案件処理 + 差戻し flywheel + 3 層承認管理 |
| Col 2: **どう** (navy box) | AWS Bedrock Sonnet 4.6 (Geo CRIS) + Aurora PG 16 + Computer Use Fargate sandbox + 3 層承認 governance |
| Col 3: **どこから** (navy box) | UC-BO-01 法人住所変更 を Phase 1 baseline、検証後に scale |
| Bottom slogan | 「**承認された手順だけを AI に覚えさせる**」 |
| Footer | 出典: CA-08 §3 + DM-07 §3 + CLAUDE.md 中核 message |

---

### **S3 業務現状 + Flywheel mechanism** (元 S5+S6 統合)

| Field | Spec |
|---|---|
| **Action title** | 案件処理は「手順実行 + 案件確認」の繰返し、差戻し → staging → 手順承認 の flywheel で AI 学習を承認管理する |
| **Hero (2-zone vertical layout)** | |
| **Top zone (40%): 現状業務 step horizontal flow** | (1) 案件受付 → (2) AI 入力 → (3) 入力者確認 → (4) 承認者承認 → (5) 反映 // 各 step に「確認」マーク (現状: 各 step で人間 review 発生) |
| **Bottom zone (60%): 5-phase flywheel circular** | (1) 差戻し記録 → (2) staging ナレッジ蓄積 (未承認ヒント) → (3) AI 日次分析 + 改善提案 → (4) 手順承認 → (5) compiled 反映 → 1 へ |
| **Center slogan (24pt italic navy)** | 「**減らせるのは確認、残すのは判断**」 |
| Footer | 出典: 01-flywheel-and-knowledge §1-§7 |

---

### **S4 3 層承認 + 4-eyes SoD**

| Field | Spec |
|---|---|
| **Action title** | 案件 / 手順 / 設定 の 3 層承認と 4-eyes SoD で、AI に任せる量を増やしても control は人間が保持する |
| **Hero (2-block horizontal layout)** | |
| **Left (60%): 3 層承認 RACI table** | 4-col table:<br>**承認種別** / **Proposal source** / **Owner (R)** / **Approver (A)** + Type<br>--- (3 row) ---<br>**案件承認** / 入力者 + 承認者 / 入力者 / 承認者 (4-eyes 必須)<br>**手順承認** / AI 自動生成 / Manual 管理者 / 業務責任者 + SME 合議<br>**設定承認** / AI 管理者 / AI 管理者 / Type A/B/C co-A (Security / 業務責任者) |
| **Right (40%): 4-eyes diagram** | 入力者 (icon) → 案件 (icon) → 承認者 (icon)、間に「≠」symbol で SoD 強調 |
| **Center slogan (24pt italic navy)** | 「**AI に任せる量は段階的に増やすが、人によるコントロールは渡さない**」 |
| Footer | 出典: 02-approval-model §1-§9 + DM-07 §5.1 4-eyes trigger |

---

### **S5 接続層 4 tier**

| Field | Spec |
|---|---|
| **Action title** | 既存業務システムへの接続は API / MQ / RPA-Computer Use / DB 直接続 の 4 tier で実装する |
| **Hero (4-row matrix table、tier × 接続方式 × 用途 × 例)** | |
| Row 1 **標準** (navy soft 背景) | API / 通常想定の接続方式 / 業務 system core API |
| Row 2 **準標準** (navy soft 背景) | MQ / event / file bridge / レガシー連携 + 非同期 / 基幹勘定系 batch |
| Row 3 **代替** (alert soft 背景、Computer Use 強調) | RPA / **Computer Use** / MCP / API 不在のレガシー / 一部 portal の screen 操作 |
| Row 4 **例外** (red soft 背景) | DB 直接続 / **原則 read-only、write は明示承認 + 限定条件** / 旧 master data 参照 |
| **Bottom slogan (20pt italic navy)** | 「**API が default、Computer Use は API 不在の bridge、DB 直接続は最終手段**」 |
| Footer | 出典: 00-overview §2.2 + _SSOT §1.5 接続層 4 tier |

---

### **S6 人間役割 shift + Headcount evolution** (元 S9+S10+S11 統合、Cover slogan 回収)

| Field | Spec |
|---|---|
| **Action title** | 人間の役割は operations → 検証 + 高 risk + 高難易度 + 例外 へ shift、phase ごと operations 人員は減少 / AI gov role は増加、net で削減する |
| **Hero (2-block vertical layout)** | |
| **Top block (50%): Role shift 2-column** | |
| Left half: **Current human role** | `[████████████████████] 100% — 案件確認 + 手順実行 + escalation 判断` (横長 bar、navy soft 塗) |
| Right half: **Future human role (4 category vertical bar)** | `[██] 検証` — AI 出力の妥当性確認 + edge case 判断 / `[██] 高 risk` — 国際送金 boundary、高額案件 / `[██] 高難易度` — 新規 pattern、規制 ambiguity 解釈 / `[██] 例外ケース` — AI confidence 低出力、初見 case<br>合計 Future bar 長 < Current bar 長 (= 工数 net 減を visual 暗示) |
| **Bottom block (50%): Headcount evolution stacked area chart** | X 軸: Now → Phase 1 (6mo) → Phase 2 (12mo) → Phase 3 (24mo)<br>Layer 1 (navy、declining): Operations role 100 → 80 → 55 → 30<br>Layer 2 (red、rising): AI governance role 0 → 5 → 12 → 22<br>Total (黒線): 100 → 85 → 67 → 52 (-15% → -33% → -48%)<br>**全数値に [仮説 / 要検証] label**<br>**Net annotation**: Phase 3 で total -48%、ただし AI gov role +22 = re-skilling target |
| **Hedge box (alert red border、bottom)** | ⚠ **本図の前提 (politics-aware framing)**<br>(1) 数値は [仮説 / 要検証]、Phase 1 実測で calibrate<br>(2) 即時 layoff ではない、自然退職 + re-skilling + gradual 移行<br>(3) 役割が深くなる、operations の dignity 保持<br>(4) **1 role count ではなく operations 工数 index**、新 AI governance role は既存社員の re-skilling path を内包 |
| **Closing slogan (24pt italic、Cover slogan の call-back)** | 「**Cover で提示した『小さく POC で大きく成長』は、本図 Phase 1 → 2 → 3 移行が その実装**」 |
| Footer | 出典: CA-08 §14A Tenant lifecycle + canon C4-20 Three Horizons + research-compounder D 軸 (target-operating-model + strangler-fig + org-redesign + RACI) |

---

## §C. VISUAL DESIGN SYSTEM

### C.1 Color palette (3-color strict)

```css
colors: {
  navy: '#1a3a52',         /* primary、header / title / chart main */
  'navy-light': '#2d5a7d',
  'navy-soft': '#e8eef3',  /* surface tint、navy soft 背景 */
  red: '#c93838',          /* alert / hedge box border / DB 直接続 row */
  'red-soft': '#fbe8e8',
  grey: '#8a8a8a',         /* body / supporting / footnote */
  'grey-light': '#bababa',
  canvas: '#fafaf8',       /* slide background (off-white) */
  surface: '#f0f0ec',      /* panel / table row alt */
}
```

**禁則**: 4 色目 (緑 / 紫 / 黄 etc.) 0 件。

### C.2 Typography (canon C3-11)

| Element | Font-family | Size | Weight |
|---|---|---|---|
| Cover slogan | Inter, Noto Sans JP | 48-56pt | Bold |
| Action title | Inter, Noto Sans JP | 28pt | Bold |
| Subtitle / section | Inter, Noto Sans JP | 16pt | SemiBold |
| Body | Inter, Noto Sans JP | 18pt | Regular |
| Data emphasis | Inter | 36-48pt | Bold |
| Slogan (italic) | Inter | 20-24pt | Regular italic |
| Footer / footnote | Inter | 10-12pt | Regular |

### C.3 Layout (canon C3-13 + C3-15)

```
┌────────────────────────────────────────────────┐ ← 16:9 (1920×1080)
│  HEADER (15% top、padding 80px)                  │
│  Action title 28pt bold + 2px navy underline    │
├────────────────────────────────────────────────┤
│  HERO (60% middle、white space 40% 維持)         │
│        SINGLE HERO VISUAL                        │
├────────────────────────────────────────────────┤
│  FOOTER (15% bottom)                             │
│  Slogan (optional、center)                       │
│  ──── 出典 · page X/6 · Concept share / Internal │
└────────────────────────────────────────────────┘
   ← 10% L                          15% R →
```

### C.4 Animation

- Slide transition: `fade` (Reveal.js `transition="fade"`)
- Within-slide: no animation

---

## §D. ANTI-PATTERN GUARDRAILS (build 後 self-review で全件 check)

### D.1 Canon C8a 12 anti-pattern

1. ☐ **Bullet wall slide 禁止**: 各 slide 1 hero visual + supporting 3-5 bullet max
2. ☐ **'TBD' / 'Coming soon' on hero 禁止**: 全 hero に確定 status / 数値、不確定は alert red qualifier 付き ([仮説 / 要検証])
3. ☐ **Multi-color palette overuse 禁止**: 3-color strict (navy / red / grey)、4 色目 0 件
4. ☐ **Briefing → Recommendation tone 混在 禁止**: 本 deck は **concept share tone 一貫**、recommendation tone を混在させない
5. ☐ **Action title が takeaway なし 禁止**: 全 S2-S6 action title を S-V-O claim form、12-15 words、takeaway-first
6. ☐ **So-what 不在 禁止**: 各 hero visual の slogan で 'So what' を pin
7. ☐ **Footnote overload (10+ per slide) 禁止**: 各 slide 主要 footnote 1-2 件
8. ☐ **Decision ask 不在 OK** (本 deck は concept share、decision ask しない): 代わりに **belief alignment** が outcome
9. ☐ **Risk hidden 禁止**: S6 で headcount honne を up-front、hedge inline で politics-aware
10. ☐ **Honne / tatemae 不整合 禁止**: S6 で operations 削減を honest に出す、tatemae 隠さない
11. ☐ **Pyramid trace fail 禁止**: title-only readout で governing thought 再生確認 (§B.0.1)
12. ☐ **White space 不足 (>60% ink coverage) 禁止**: 40% empty rule 維持

### D.2 Project-specific 6 guardrail (本 deck では 6 件中 4 件適用、Type B 承認 deck から限定)

13. ☐ **'design-complete / 完成' wording 禁止**: project は Draft、本投入は Phase 1 着手後
14. ☐ **'primary regulator' 断定 禁止**: entity / license fact 依存、counsel 確認待ち、'NY 拠点で適用' 程度に hedge
15. ☐ **NYDFS を Federal 行に置く 禁止**: NYDFS は State 規制、必ず State 配置 (本 deck では出ないが念のため keep)
16. ☐ **Tier 3 規制語の事実主張 禁止**: hedge 表現 `[ai-operator paper §X.Y 参照]`

### D.3 Politics-sensitive guardrail (S6 特有、新規 6 件)

17. ☐ **Headcount 削減を冷酷 wording で出す 禁止**: 「人員減」より「役割が深くなる」「総量は減るが質は高まる」
18. ☐ **数値を確定数で出す 禁止**: 全 headcount 数値に [仮説 / 要検証] label 必須
19. ☐ **Layoff を直接 imply する wording 禁止**: 「自然退職 + re-skilling + gradual 移行」を hedge box で必ず明示
20. ☐ **具体 業務名 (= 削減 target 推測される) を roadmap chart に書く 禁止**: 業務名抽象化、operations 工数 index で表現
21. ☐ **Future 人間役割 4 category を「楽な仕事」風 wording で出す 禁止**: 「検証 / 高 risk / 高難易度 / 例外」= 価値高い judgment work であることを 明示
22. ☐ **Cover slogan「小さく POC で大きく」を S6 で回収しない 禁止**: rhetorical bookend を必ず close、bottom slogan で explicit call-back

---

## §E. PRODUCTION CHECKLIST

### E.1 Build steps (5)

1. ☐ Reveal.js 5.x + Tailwind CDN single-file HTML を build (filename 推奨: `concept-share.html`)
2. ☐ 6 slide を §B spec 通り build (no appendix)
3. ☐ Color palette / typography / layout を §C に strict 準拠
4. ☐ 各 slide footer に `出典 · page X/6 · Concept share / Internal` を pin
5. ☐ Hero visual は **SVG inline** or **HTML table / CSS grid** で実装、external image asset 不要

### E.2 Self-review check (7、build 後必須)

1. ☐ **Pyramid trace test** (canon C2-10): §B.0.1 readout 再生可能か confirm
2. ☐ **C8a 12 anti-pattern grep** (§D.1): violation 0 件
3. ☐ **Project-specific 4 guardrail** (§D.2): violation 0 件
4. ☐ **Politics-sensitive 6 guardrail** (§D.3): S6 で全 6 件 ✅
5. ☐ **3-color check**: navy / red / grey 以外 0 件 (canvas + surface は許容)
6. ☐ **Action title length**: S2-S6 全 5 title が 12-15 words ± 2 words
7. ☐ **40% empty rule**: 各 slide で ink coverage < 60%

### E.3 Self-review report format

build 完了後、以下 format で report:

```markdown
# Concept Share Deck Self-Review Report

## E.2 7 check 結果
1. Pyramid trace test: ✅ / ⚠ / ❌ + 詳細
2. C8a 12 anti-pattern: ✅ all clear / ⚠ N 件 (list)
3. Project-specific 4: ✅ / ⚠ / ❌
4. Politics-sensitive 6 (S6): ✅ / ⚠ N 件 (詳細)
5. 3-color check: ✅ / ⚠ N color literal 検出
6. Action title length: ✅ / ⚠ N title が範囲外
7. 40% empty rule: ✅ / ⚠ N slide で 60% 超

## 残課題 / Open question (user review 用)
- ...

## Build summary
- Total slides: 6 (no appendix)
- File size: ~XXX KB
- Reveal.js / Tailwind version
```

---

## §F. REFERENCE HTML PATTERN (Reveal.js + Tailwind CDN skeleton)

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=1920, initial-scale=1.0" />
  <title>Backoffice AI v2 — オペレーション自動化の概念共有</title>

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
      font-size: 18px;
      background-color: #fafaf8;
      color: #1a3a52;
    }
    .reveal .slides { text-align: left; }
    .reveal .slides section {
      padding: 80px 100px 80px 80px;
      box-sizing: border-box;
      height: 100%;
      background-color: #fafaf8;
    }
    .reveal h1 {
      font-size: 56px; font-weight: 700; line-height: 1.15;
      color: #1a3a52; margin: 0 0 20px 0; letter-spacing: -0.02em;
    }
    .reveal h2 {  /* Action title */
      font-size: 28px; font-weight: 700; line-height: 1.3;
      color: #1a3a52; margin: 0 0 24px 0; letter-spacing: -0.015em;
      padding-bottom: 12px;
      border-bottom: 2px solid #1a3a52;
      display: inline-block;
    }
    .reveal h3 { font-size: 16px; font-weight: 600; color: #1a3a52; margin: 0 0 12px 0; }
    .reveal p { font-size: 18px; line-height: 1.6; color: #1a3a52; margin: 0 0 12px 0; }
    .reveal .slogan { font-size: 24px; font-style: italic; color: #1a3a52; }
    .reveal .footer {
      position: absolute;
      bottom: 24px;
      left: 80px;
      right: 100px;
      font-size: 11px;
      color: #8a8a8a;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .reveal .progress { color: #1a3a52; }
    .reveal .slide-number {
      background-color: rgba(26, 58, 82, 0.08);
      color: #1a3a52;
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      padding: 4px 8px;
      border-radius: 4px;
    }
    .tabular { font-variant-numeric: tabular-nums; }
  </style>
</head>

<body>
  <div class="reveal">
    <div class="slides">

      <!-- ============================================================
           S1 Cover (slogan punchline)
           ============================================================ -->
      <section data-transition="fade">
        <div class="h-full flex flex-col items-center justify-center text-center">
          <h1 class="text-navy text-7xl mb-8 leading-tight">
            小さく POC で<br/>大きく成長させる。
          </h1>
          <p class="text-grey text-2xl mb-4">Backoffice AI v2 — オペレーション自動化の概念共有</p>
          <p class="text-navy text-lg">経営層 + 業務責任者 + Security + Compliance / Concept share workshop</p>
        </div>
        <div class="footer">
          <span>Concept share workshop</span>
          <span>Internal</span>
        </div>
      </section>

      <!-- ============================================================
           S2 Project 1-page (3-column)
           ============================================================ -->
      <section data-transition="fade">
        <h2>差戻しを次の正解手順に変える仕組みを、AWS Bedrock + Aurora で構築する</h2>

        <div class="mt-8 grid grid-cols-3 gap-6">
          <div class="bg-navy-soft rounded-lg p-6 border-l-4 border-navy">
            <h3 class="text-navy mb-4">何を</h3>
            <p class="text-base">AI 案件処理 + 差戻し flywheel + 3 層承認管理</p>
          </div>
          <div class="bg-navy-soft rounded-lg p-6 border-l-4 border-navy">
            <h3 class="text-navy mb-4">どう</h3>
            <p class="text-base">AWS Bedrock Sonnet 4.6 (Geo CRIS) + Aurora PG 16 + Computer Use Fargate sandbox + 3 層承認 governance</p>
          </div>
          <div class="bg-navy-soft rounded-lg p-6 border-l-4 border-navy">
            <h3 class="text-navy mb-4">どこから</h3>
            <p class="text-base">UC-BO-01 法人住所変更 を Phase 1 baseline、検証後に scale</p>
          </div>
        </div>

        <div class="mt-10 text-center">
          <p class="slogan">「承認された手順だけを AI に覚えさせる」</p>
        </div>

        <div class="footer">
          <span>出典: CA-08 §3 + DM-07 §3 + CLAUDE.md 中核 message</span>
          <span class="slide-number">2 / 6</span>
        </div>
      </section>

      <!-- ============================================================
           S3-S6 同 pattern で expand
           各 slide で:
             - <section data-transition="fade">
             - <h2> action title (28pt bold navy + 2px navy underline)
             - hero visual (table / flow diagram / matrix / chart etc.)
             - center slogan (italic、必要に応じ)
             - <div class="footer"> 出典 · page X/6 · Concept share / Internal
           ============================================================ -->

      <!-- ... (S3 through S6) ... -->

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

- **S3 業務 step + Flywheel**: `<div class="grid grid-cols-5">` で horizontal flow (現状 step)、下に `<svg>` で 5-phase circular flow (Flywheel)
- **S4 RACI table + 4-eyes**: `<table class="w-full">` で RACI、右に SVG icon (入力者 → 案件 → 承認者 + "≠" symbol)
- **S5 4 tier matrix**: `<table>` で 4 row × 4 col、Row 3 (Computer Use) を `bg-red-soft` で highlight
- **S6 Role shift + Headcount chart**: 上部 2-column (Current 100% bar / Future 4 bar)、下部 stacked area chart (SVG inline、Phase 1/2/3 timeline)、bottom に hedge box (red border)
- 全 chart は **SVG inline** (single-file 維持、external 不要)

---

## §G. CANON PRINCIPLE GLOSSARY (本 deck で使用、cold-start 用)

| Ref | 1-line explanation |
|---|---|
| C2-6 Action title | 12-15 words、claim form S-V-O、takeaway-first |
| C2-7 1 slide 1 message | Singleton test、1 slide に 1 message 以外載せない |
| C2-10 Pyramid trace test | Ship gate: action title だけ読み下しで governing thought 再生可能か |
| C3-11 Typography | Action title 28pt bold、body 18pt、slogan 24pt italic |
| C3-12 3-color rule | Primary + Accent + Neutral の 3 色のみ、4 色目禁止 |
| C3-13 White space | 10-15% safe margin + 40% empty rule (ink coverage < 60%) |
| C3-14 Footer | 出典 + page number + audience indicator |
| C3-15 Header | Action title above hero + 2px underline |
| C4-20 Three Horizons | Baghai 1999、3 ascending curves on timeline。S6 headcount chart の inspiration |
| C4-21 Process flow | 4-5 step max + swimlane。S3 現状 step / S4 RACI / S5 4 tier matrix で適用 |
| C4-23 Table-as-chart | Cell-level shading + 1 highlight row。S5 で Computer Use row を highlight |
| C8a 12 anti-pattern | §D.1 12 件 (bullet wall / TBD / multi-color / etc.) |

---

## §H. RESEARCH-COMPOUNDER CARDS USED (本 deck 構成 anchor)

本 deck の narrative arc は以下 research-compounder card を anchor として構築:

| Card | 使用 section |
|---|---|
| `slides-executive/workshop-opening-deck-pattern.md` | Tone setting / Outcome promise は drop、Mechanism walk-through を core に採用 |
| `slides-executive/storytelling-spine-and-narrative-arc.md` | Linear sequence (Cover → Project → Flywheel → 統制 → 接続 → 育成) を SCR の compressed 版として運用 |
| `slides-executive/vision-setting-deck-pattern.md` | Cover slogan「小さく POC で大きく」の future-pull opening + S6 closing 回収 (call-back) |
| `modernize-transformation/target-operating-model-1page.md` | S6 の TOM 4 role + 役割 shift framing |
| `modernize-transformation/phased-modernization-strangler-fig.md` | S6 の "段階成長" mechanism、slogan「小さく POC で大きく」の technical underpinning |
| `modernize-transformation/org-redesign-for-ai-native.md` | S6 の "新 AI governance role" 創出 + re-skilling path |
| `ai-agents-automation/raci-on-agent-action.md` | S4 の 3 層承認 RACI structure |
| `banking-finance/three-lines-of-defense-and-ai.md` | S4 の 統制 governance backing (本 deck では explicit に出さないが背景 evidence) |

---

## §I. 完了条件

build 完了 + §E.2 self-review 7 check 全 ✅ + self-review report 出力 → user review に hand-off。

不明点があれば最初に質問。本 file 単独で実行可能。
