# Claude Design Handoff Package — Executive Deck (Phase 1 投入計画)

> **本 README の目的**: Claude Design (別 agent / 別 session) に hand-off する際に必要なファイルと prompt を 1 箇所に集約。本 file を user が Claude Design に渡せば cold-start で executive deck (HTML) build 可能。

---

## 1. Prompt (Claude Design に paste する文字列)

以下を **そのまま** Claude Design の最初の message として paste する:

````
Backoffice AI v2 Phase 1 投入計画の executive deck (HTML) を build してください。

## Decision ask (本 deck で経営層に求めるもの)
Type B 設定承認の prerequisite として、本日 6 設計 doc + 7 PFC plan の sign-off。

## Audience
日本銀行 America division CXO + Risk Committee、30 min keynote (説明 15 / Q&A 15)。

## Input (self-contained)
**Primary spec (single source of truth)**:
- /Users/shinjifujiwara/code/active/backoffice-ai-v2/demo/handoff-to-claude-design/exec-deck-brief.md
  → 514 行、12 本編 + 6 appendix slide spec + visual design system + anti-pattern guardrails + production checklist が full pin 済。本 brief 単独で build 可能。

**Source content docs (claim verification 用、必要時参照)**:
- docs/07-data-model.md (DM-07 v1.7.2)
- docs/08-cloud-architecture.md (CA-08 v2.6)
- docs/09-pre-flight-execution-checklist.md (PFC-09 v0.2)
- docs/10-threat-model.md (TM-10 v0.1)
- docs/11-sre-runbook.md (SRE-11 v0.1)
- docs/12-compliance-evidence-matrix.md (CEM-12 v0.2)
- HANDOFF.md (PR-ready summary)

**Visual canon (style + anti-pattern reference)**:
- /Users/shinjifujiwara/code/shared/presentation-design/strategy-consulting-canon.md (62 principle、cluster C1-C8)

**Technical reference deck (同 stack)**:
- demo/slides/session-4.html (Day 22 Reveal.js + Tailwind CDN single-file HTML、本 deck と同 pattern)

## Output
1. demo/slides/exec-phase1-handoff.html (Reveal.js 5.x + Tailwind CDN single-file)
2. demo/screenshots/exec-phase1-handoff/slide-{01..18}.png (browser open 後 export)
3. demo/slides/exec-phase1-handoff-review.md (self-review report、brief §7.2 7 check 全件)

## Execution
1. brief §4 slide-by-slide spec 通り build (各 slide の action title / hero visual / supporting data / footnote / canon ref を厳守)
2. brief §3 visual design system (3-color #1a3a52/#c93838/#8a8a8a + typography + 16:9 layout + 40% empty rule) を strict 準拠
3. brief §6 anti-pattern guardrails 12 + 6 件 を全件 self-review でクリア
4. brief §7 production checklist 全 7 項目を実行
5. Self-review report を出力、user review に hand-off

## 重要 constraint
- 完成 wording 禁止 (brief §6.2 #13)、全 doc は Draft status
- NYDFS Part 500 は State 規制 (Federal ではない)
- RPO は 'target / [仮説 / 要検証] / Phase 1 実測 calibrate' wording、SLA ではない
- '規制 mapping 完備' overstatement 禁止、'control × evidence pointer mapping 作成済、counsel sign-off pending' に hedge
- Tier 3 規制語の事実主張禁止 (CLAUDE.md ルール準拠)

不明点があれば user に確認。Self-contained brief で build 開始可能。
````

---

## 2. 渡すべきファイル一覧 (絶対パス)

### 2.1 Primary (必須、これ 1 つで build 可能)

| File | Path | 役割 |
|---|---|---|
| **Design brief** | `/Users/shinjifujiwara/code/active/backoffice-ai-v2/demo/handoff-to-claude-design/exec-deck-brief.md` | 12 + 6 slide の full spec + visual design system + anti-pattern guardrails + production checklist。**Self-contained**、これだけで build 可能 |

### 2.2 Source content docs (claim verification 用、参照)

| File | Path | Version |
|---|---|---|
| Data model | `/Users/shinjifujiwara/code/active/backoffice-ai-v2/docs/07-data-model.md` | DM-07 v1.7.2 |
| Cloud architecture | `/Users/shinjifujiwara/code/active/backoffice-ai-v2/docs/08-cloud-architecture.md` | CA-08 v2.6 |
| Pre-flight checklist | `/Users/shinjifujiwara/code/active/backoffice-ai-v2/docs/09-pre-flight-execution-checklist.md` | PFC-09 v0.2 |
| Threat model | `/Users/shinjifujiwara/code/active/backoffice-ai-v2/docs/10-threat-model.md` | TM-10 v0.1 |
| SRE runbook | `/Users/shinjifujiwara/code/active/backoffice-ai-v2/docs/11-sre-runbook.md` | SRE-11 v0.1 |
| Compliance matrix | `/Users/shinjifujiwara/code/active/backoffice-ai-v2/docs/12-compliance-evidence-matrix.md` | CEM-12 v0.2 |
| PR-ready summary | `/Users/shinjifujiwara/code/active/backoffice-ai-v2/HANDOFF.md` | post-Cycle-16 |
| Project CLAUDE.md | `/Users/shinjifujiwara/code/active/backoffice-ai-v2/CLAUDE.md` | (Tier 1/2/3 語彙 + slogan + scope-out) |

### 2.3 Visual canon (style 規範)

| File | Path | 役割 |
|---|---|---|
| **Strategy canon** | `/Users/shinjifujiwara/code/shared/presentation-design/strategy-consulting-canon.md` | 62 principle、cluster C1-C8、anti-pattern catalog C8a |
| Presentation principles | `/Users/shinjifujiwara/code/shared/presentation-design/principles-62.md` | 62 principle 詳細 |

### 2.4 Technical reference (同 stack の既存 deck)

| File | Path | 役割 |
|---|---|---|
| Day 22 Session 4 deck | `/Users/shinjifujiwara/code/active/backoffice-ai-v2/demo/slides/session-4.html` | Reveal.js 5.x + Tailwind CDN single-file HTML pattern、本 deck と同 stack |

---

## 3. Hand-off の渡し方 (recommended)

### Option A: 全 file path を含む prompt を Claude Design に paste (推奨)

1. 本 README §1 prompt を copy
2. Claude Design (別 session) に paste
3. Claude Design が path から file を読み込んで build
4. 必要なら追加質問に答える

### Option B: Brief + 必要 file をまとめて送る

1. Brief (`exec-deck-brief.md`) のみ送付 + §1 prompt も paste
2. Source content docs / canon は Claude Design 側で path 読み込み (上記 prompt 内に path 列挙済)

### Option C: Local copy をまとめて zip

1. 以下を 1 zip にまとめる:
   - `exec-deck-brief.md` (primary)
   - 6 docs + HANDOFF.md + CLAUDE.md (source)
   - `strategy-consulting-canon.md` (canon)
   - `session-4.html` (reference)
2. zip + §1 prompt を hand-off

→ **Option A 推奨** (path 直渡しが最も clean、Claude Design が必要に応じて読み込む)

---

## 4. Hand-off 後の next action (user 側)

1. Claude Design 側で build 実行 (推定 1-2 hr)
2. Claude Design が `demo/slides/exec-phase1-handoff.html` + screenshot pack + self-review report を出力
3. User が pixel polish review (どこを直すか指示)
4. Final approval → Phase 1 着手 -90 day の経営層 review session で投入

---

## 5. File naming convention

| 出力 file | 想定 path |
|---|---|
| HTML deck | `demo/slides/exec-phase1-handoff.html` |
| Screenshot pack | `demo/screenshots/exec-phase1-handoff/slide-{01..18}.png` |
| Self-review report | `demo/slides/exec-phase1-handoff-review.md` |
| Speaker notes (optional) | `demo/slides/exec-phase1-handoff-speakernotes.md` |

---

## 6. 本 package 改版履歴

- v0.1 (2026-05-25): 初版作成、Cycle 16 後 handoff。本 README + exec-deck-brief.md の 2 file で Claude Design cold-start handoff package 完結
