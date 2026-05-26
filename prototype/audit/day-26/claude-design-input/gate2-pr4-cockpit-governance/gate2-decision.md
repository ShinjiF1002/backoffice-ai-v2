| 項目 | 値 |
| --- | --- |
| 文書 ID | DOC-AUDIT-D26-GATE2-DECISION |
| 文書名 | Gate 2 (PR 4 Cockpit + governance) — Design Decision Record |
| 版数 | v0.1 (skeleton、PR 0 で作成) |
| ステータス | Skeleton (Gate 2 実施前)、Claude Design 実施後に user が完成、PR 4 commit に含める |
| オーナー | backoffice-ai-v2 maintainer (user 自身) |
| Evidence Status | TBD (Claude Design Chat session log + adopted HTML mock screenshots/wave4-design-exploration/) |

---

# Gate 2 Decision Record

Claude Design Chat session で生成した design 案から best 1 案を per finding 決定。Safety rail 5 軸 check も併せて記録。本 record は PR 4 Commit 9-10 の design spec source として参照される。

## Design Decision Table

| Finding | Generated案 数 | 採用案 | Rationale (1-2 sentence) | Export path | Safety rail check |
| --- | --- | --- | --- | --- | --- |
| F-6 Dashboard 3-viewport cockpit | (TBD: 2 想定) | (TBD: A or B) | (TBD: user 記入) | `screenshots/wave4-design-exploration/F-6-{案番号}.html` + `.png` | (TBD: token / 装飾 / Day 19 / JP / quota) |
| F-8 RACI default surface | (TBD: 2 想定) | (TBD: A or B) | (TBD) | `screenshots/wave4-design-exploration/F-8-{案番号}.html` + `.png` | (TBD) |
| F-9 permission scope badge | (TBD: 1 想定) | (TBD: A) | (TBD) | `screenshots/wave4-design-exploration/F-9-A.html` + `.png` | (TBD) |

## Safety Rail Detail (採用案 verify 後 user 記入)

### F-6
- [ ] Token SSOT verify (Operational Premium Light token のみ使用)
- [ ] 装飾禁止 verify (gradient / glow / glass / 3D / large rounded 不在)
- [ ] Day 19 重複 check (Day 19 NextActionStrip + 業務 card 不変、preserve + wrap、`new` tag)
- [ ] JP typography
- [ ] Quota: 約 2 prompt

### F-8
- [ ] Token SSOT
- [ ] 装飾禁止
- [ ] Day 19 重複 check (Day 19 U-6 DetailDrawer 移動は applied、本 F-8 は default open + query gate 廃止で別 angle、`adjacent-to-Day19` tag)
- [ ] JP typography
- [ ] Quota: 約 2 prompt

### F-9
- [ ] Token SSOT
- [ ] 装飾禁止
- [ ] Day 19 重複 check (new tag)
- [ ] JP typography
- [ ] Quota: 約 1 prompt

## Implementation Spec for Claude Code (PR 4 Commit 9-10)

採用案を基に確定する spec (PR 4 着手時に Claude Code が実装):

### Dashboard 3-viewport refactor (Commit 9、F-6)
```
- Aggregate KPI strip: 5 指標 + mock-metrics.ts 拡張
- Per-workflow grid: 現状維持 (Day 19 不変)
- Drill-down: DetailDrawer (Day 19 primitive 再利用) or inline Disclosure
- 動線 5 button: 配置 TBD by Gate 2 F-6 decision
```

### ProposalReview RACI default open (Commit 10、F-8)
```
- Default visibility: TBD by Gate 2 F-8 decision (Drawer default open vs PageHelpDisclosure 連携)
- `?demo=1` query gate deprecated
- Day 19 DetailDrawer primitive reuse
```

### AgentSettings tool scope badge (Commit 10、F-9)
```
- Tool object に scope field 追加: 'read' | 'write' | 'approval-gated'
- MetaChip pattern で inline badge (tool row 末尾)
- mock-agents.ts Tool 拡張 spec TBD by Gate 2 F-9 decision
```

## Total Quota Consumption

- Gate 2 想定: ~5 prompt
- 実消費: TBD prompt
- Pro/Max weekly limit 残: TBD

## Reject 案 / Discarded artifacts

- (TBD: 採用しなかった案を簡潔記録、commit 対象外)

## Next action

Gate 2 完了後:
1. 本 file を user が完成 (Decision Table + Safety rail + Implementation spec)
2. 採用 HTML mock を `screenshots/wave4-design-exploration/F-{X}-adopted-{案番号}.{html,png}` に保存
3. PR 4 Commit 9-10 を Claude Code で実装、本 decision record を design spec source として参照
4. PR 4 末で `closure-table.md` の F-6 / F-8 / F-9 row を closed に更新、PR 4 末 = closure-table.md v1.0 lock
