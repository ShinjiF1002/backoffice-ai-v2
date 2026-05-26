| 項目 | 値 |
| --- | --- |
| 文書 ID | DOC-AUDIT-D26-GATE1-DECISION |
| 文書名 | Gate 1 (PR 2 Approval trust system) — Design Decision Record |
| 版数 | v0.1 (skeleton、PR 0 で作成) |
| ステータス | Skeleton (Gate 1 実施前)、Claude Design 実施後に user が完成、PR 2 commit に含める |
| オーナー | backoffice-ai-v2 maintainer (user 自身) |
| Evidence Status | TBD (Claude Design Chat session log + adopted HTML mock screenshots/wave2-design-exploration/) |

---

# Gate 1 Decision Record

Claude Design Chat session で生成した design 案から best 1 案を per finding 決定。Safety rail 5 軸 check も併せて記録。本 record は PR 2 Commit 2-5 の design spec source として参照される。

## Design Decision Table

| Finding | Generated案 数 | 採用案 | Rationale (1-2 sentence) | Export path | Safety rail check |
| --- | --- | --- | --- | --- | --- |
| F-2 DiffPreviewBlock + MetadataStrip | (TBD: 3 想定) | (TBD: A or B or C) | (TBD: user 記入) | `screenshots/wave2-design-exploration/F-2-{案番号}.html` + `.png` | (TBD: token ✓/✗ / 装飾 ✓/✗ / Day 19 ✓/✗ / JP ✓/✗ / quota: N prompt 消費) |
| F-5 ActorBand | (TBD: 2 想定) | (TBD: A or B) | (TBD) | `screenshots/wave2-design-exploration/F-5-{案番号}.html` + `.png` | (TBD) |
| F-7 SLA per step + Delegate | (TBD: 2 想定) | (TBD: A or B) | (TBD) | `screenshots/wave2-design-exploration/F-7-{案番号}.html` + `.png` | (TBD) |

## Safety Rail Detail (採用案 verify 後 user 記入)

### F-2
- [ ] Token SSOT verify (Operational Premium Light token のみ使用)
- [ ] 装飾禁止 verify (gradient / glow / glass / 3D / large rounded 不在)
- [ ] Day 19 重複 check (Day 19 U-4 EvidenceTimeline paraphrase と別 angle、`adjacent-to-Day19` tag 維持)
- [ ] JP typography 確認 (Noto Sans JP + Inter mono 維持)
- [ ] Quota: 約 3 prompt 想定、実消費 / 上限 N 確認

### F-5
- [ ] Token SSOT verify
- [ ] 装飾禁止 verify
- [ ] Day 19 重複 check (Day 19 actor visibility に明示触れず、new tag)
- [ ] JP typography
- [ ] Quota: 約 2 prompt

### F-7
- [ ] Token SSOT
- [ ] 装飾禁止
- [ ] Day 19 重複 (new tag)
- [ ] JP typography
- [ ] Quota: 約 2 prompt

## Primitive Spec for Claude Code Implementation (PR 2 Commit 2-5)

採用案を基に確定する Props shape (PR 2 着手時に Claude Code が typed React primitive として実装):

### DiffPreviewBlock (Commit 3)
```typescript
interface DiffPreviewBlockProps {
  // TBD by Gate 1 F-2 decision
}
```

### MetadataStrip (Commit 3)
```typescript
interface MetadataStripProps {
  // TBD by Gate 1 F-2 decision
}
```

### ActorBand (Commit 5)
```typescript
interface ActorBandProps {
  // TBD by Gate 1 F-5 decision
}
```

### LifecycleStepper SLA extension (Commit 5)
```typescript
// LifecycleStepperProps の拡張 field
// TBD by Gate 1 F-7 decision
```

## Total Quota Consumption

- Gate 1 想定: ~7 prompt
- 実消費: TBD prompt
- Pro/Max weekly limit 残: TBD

## Reject 案 / Discarded artifacts

- (TBD: 採用しなかった案を簡潔記録、commit 対象外)

## Next action

Gate 1 完了後:
1. 本 file を user が完成 (Decision Table + Safety rail + Primitive spec)
2. 採用 HTML mock を `screenshots/wave2-design-exploration/F-{X}-adopted-{案番号}.{html,png}` に保存
3. PR 2 Commit 2-5 を Claude Code で実装、本 decision record を design spec source として参照
4. PR 2 末で `closure-table.md` の F-2 / F-5 / F-7 row を closed に更新
