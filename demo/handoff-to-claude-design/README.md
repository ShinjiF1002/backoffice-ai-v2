# Claude Design Handoff — Directory Index

> Claude Design (claude.ai 等の独立 web チャット) に hand-off するための package。File path 参照は使えないため、必要 content は全て **paste-to-claude-design.md** に inline 済。

## 使い方 (1 step)

1. **`paste-to-claude-design.md` 全文をコピー**
2. **Claude Design (web チャット) の最初の message として paste**
3. Build 完了を待つ (推定 1-2 hr)、必要に応じて clarification 質問対応
4. Output 3 file を受け取って user review

## 本 directory の構成

| File | 役割 | 用途 |
|---|---|---|
| **`paste-to-claude-design.md`** ⭐ | **Claude Design に paste する唯一の file** (self-contained、external 依存なし) | Web チャット handoff の primary deliverable |
| `exec-deck-brief.md` | Canonical design spec (本 directory の origin) | 内部 reference、設計判断の trace 用、Claude Design への paste は不要 |
| `README.md` (本 file) | Directory index | 使い方の説明のみ |
| `autonomous-rebuild/` | (空、別 phase 用 reserved) | 未使用 |

## paste-to-claude-design.md の中身 (8 章 / ~1,100 行)

- §A INSTRUCTIONS (Claude Design への prompt、task + decision ask + audience + output + strict constraint)
- §B SLIDE-BY-SLIDE SPEC (本編 12 + Appendix 6 = 計 18 slide、各 slide に action title + hero visual + supporting data + footnote)
- §C VISUAL DESIGN SYSTEM (3-color palette + typography + 16:9 layout + 40% empty rule)
- §D ANTI-PATTERN GUARDRAILS (canon C8a 12 件 + project-specific 6 件 = 18 件)
- §E PRODUCTION CHECKLIST (5 build step + 7 self-review check + report format)
- §F REFERENCE HTML PATTERN (Reveal.js 5.x + Tailwind CDN skeleton + S1/S2 example slide HTML)
- §G CANON PRINCIPLE GLOSSARY (18 ref、cold-start 用 1-line explanation)
- §H 完了条件

## Expected output (Claude Design 側 deliverable)

| Output | Filename 想定 |
|---|---|
| HTML deck | `exec-phase1-handoff.html` (single-file、Reveal.js + Tailwind CDN) |
| Screenshot pack | `slide-{01..18}.png` |
| Self-review report | `exec-phase1-handoff-review.md` (§E.2 7 check 結果 + 残課題) |

## Cycle 17 改版履歴

- v0.1 (Cycle 16 後): `exec-deck-brief.md` + `README.md` 起稿、Claude Code agent 内部参照前提 (path 引き渡し想定)
- **v0.2 (Cycle 17、本版)**: User feedback「Claude Design は独立 web チャット、コピペ渡し必要」を反映、`paste-to-claude-design.md` (~1,100 行、self-contained inline) を新設、handoff workflow を 1-step 化
