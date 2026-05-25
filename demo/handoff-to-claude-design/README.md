# Claude Design Handoff — Directory Index

> Claude Design (claude.ai 等の独立 web チャット) に hand-off するための package。File path 参照は使えないため、必要 content は全て **paste-to-claude-design.md** に inline 済。

## 使い方 (1 step)

1. **`paste-to-claude-design.md` 全文をコピー**
2. **Claude Design (web チャット) の最初の message として paste**
3. Build 完了を待つ (推定 30 min - 1 hr、6 slide 短編)
4. Output 3 file (HTML / screenshot pack / self-review report) を受け取って user review

## 本 directory の構成

| File | 役割 | 用途 |
|---|---|---|
| **`paste-to-claude-design.md`** ⭐ | **Claude Design に paste する唯一の file** (self-contained、external 依存なし) | Web チャット handoff の primary deliverable |
| `exec-deck-brief.md` | **Superseded** (Cycle 16 までの旧 Phase 1 投入 decision deck spec、historical reference) | 内部参照のみ、Claude Design への paste は不要 |
| `README.md` (本 file) | Directory index | 使い方の説明のみ |
| `autonomous-rebuild/` | (空、別 phase 用 reserved) | 未使用 |

## 現行 paste-to-claude-design.md の核 (v0.4、Cycle 19)

- **Primary purpose**: プロジェクト概要 + オペレーション自動化が可能な根拠 の説明 + **素人理解可能性 最優先**
- **Audience**: Mixed cross-functional non-technical (経営層 + 業務責任者 + Security + Compliance)、30 min concept share workshop
- **Tone**: Concept share + belief alignment + discussion-inviting
- **Decision ask**: 本日 ask しない、概要理解 + automation feasibility 認識 が outcome
- **Slide count**: **5** (S3+S4 merged、no appendix)
- **Pattern**: **Before/After Parallel Column** — 全 S2-S5 を 2-column (現状 vs 未来) で対比、jargon を visual contrast に置換
- **Core feasibility argument**: D 軸 組織 feasibility、ただし全 slide を 5 軸対比 (案件処理 / 業務全体 / system 接続 / 人員構成) で render

## paste-to-claude-design.md の 9 章 (~700 行)

- §A INSTRUCTIONS (task + audience + tone + decision ask + output + 7 strict constraint)
- §B SLIDE-BY-SLIDE SPEC (6 slide、各 slide に action title + hero visual + slogan + footer)
- §C VISUAL DESIGN SYSTEM (3-color + typography + 16:9 layout + 40% empty rule)
- §D ANTI-PATTERN GUARDRAILS (canon C8a 12 + project 4 + **politics-sensitive 6 (S6 専用)** = 22 件)
- §E PRODUCTION CHECKLIST (5 build step + 7 self-review check + report format)
- §F REFERENCE HTML PATTERN (Reveal.js + Tailwind CDN skeleton + S1/S2 example slide HTML)
- §G CANON PRINCIPLE GLOSSARY (12 ref、cold-start 用 1-line explanation)
- §H **RESEARCH-COMPOUNDER CARDS USED** (8 card、本 deck 構成 anchor の trace)
- §I 完了条件

## Expected output (Claude Design 側 deliverable)

| Output | Filename 想定 |
|---|---|
| HTML deck | `concept-share.html` (single-file、6 slide) |
| Screenshot pack | `slide-{01..06}.png` |
| Self-review report | `concept-share-review.md` (§E.2 7 check 結果 + 残課題) |

## 改版履歴

- v0.1 (Cycle 16): `exec-deck-brief.md` + `README.md` 起稿、Claude Code agent 内部参照前提 (path 引き渡し)
- v0.2 (Cycle 17): User feedback「Claude Design は web チャット、コピペ渡し」反映、`paste-to-claude-design.md` を inline 化、handoff workflow を 1-step 化 (旧 18-slide decision deck)
- v0.3 (Cycle 18): Story pivot — Concept share + automation feasibility 説明 deck、6 slide Linear + Cover slogan III+A arc、D 軸 (組織 feasibility) core
- **v0.4 (本版、Cycle 19)**: **素人理解可能性 pivot** — 全 slide を **Before/After Parallel Column pattern** に統一、S3+S4 merger で **5 slide**。`side-by-side-comparison-slide` + `before-after-and-flywheel-patterns` card を primary anchor。Jargon を visual contrast (現状 vs 未来) に置換、cross-functional non-technical audience の理解可能性最優先
