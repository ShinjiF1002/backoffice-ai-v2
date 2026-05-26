| 項目 | 値 |
| --- | --- |
| 文書 ID | DOC-AUDIT-D26-CLOSURE-TABLE |
| 文書名 | Day 26 Findings Closure Table (F-1〜F-10、per-PR append、PR 4 末で v1.0 lock) |
| 版数 | v0.1 (skeleton、PR 0 で作成) |
| ステータス | Skeleton (PR 1-4 末で per-finding append、PR 4 末で v1.0 lock) |
| オーナー | backoffice-ai-v2 maintainer |
| 関連文書 | DOC-AUDIT-D26-RC-REPORT v1.3 / DOC-AUDIT-D26-UNIFIED-FINDINGS / Implementation Plan v3.0 (`~/.claude/plans/tl-dr-approve-glistening-allen.md`) |
| SSOT 区分 | Findings closure status の SSOT (per-PR end で append 更新、PR 4 末で all 10 finding 確定) |
| Evidence Status | skeleton (PR 0 時点)、PR 1-4 実装 commit + verification 経て evidence pointer 付与 |
| 改版履歴 | v0.1 (2026-05-26): PR 0 closure commit で skeleton 作成、F-1〜F-10 全 row status=pending 初期化。v0.2 (2026-05-26): PR 1 Wave 1 完了で F-1 row update → closed (mobile responsive shell)。v0.3 (2026-05-26): PR 2 Wave 2 完了で F-2 + F-5 + F-7 row update → closed (DiffPreviewBlock + MetadataStrip + 承認 button gate + ActorBand + LifecycleStepper SLA + Inbox delegate hybrid、Gate 1 採用 spec 通り、Open Q 3 件 resolved) |

---

# Day 26 Findings Closure Table

各 finding × commit ID × verification evidence × status (closed / partial-Phase 1 / N/A) を per-PR end で記録。

## Closure Status Table (skeleton、PR 1-4 末で append 更新)

| Finding | Severity | Tag | Wave / PR | Implementation commit | Verification evidence | Safety rail check | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| F-1 | P0 | new | Wave 1 / PR 1 | (PR 1 commit、本 commit、hash post-push) | preview MCP 1440×900 + 390×844 visual smoke pass、check:all (lint clean / no-op 37 .tsx / build 424kb gzip 118kb) | Sidebar `hidden md:flex` + mobile bottom nav `fixed inset-x-0 bottom-0 md:hidden` (drawer pattern ではなく bottom nav に変更) / AppShell `flex-col md:flex-row` / TopBar `hidden sm:flex` search+bell / Dashboard PageHeader `flex-col lg:flex-row` / PrototypeModeLabel `whitespace-nowrap`、Day 19 5 primitive と co-existence | **closed** |
| F-2 | P0 | adjacent-to-Day19 | Wave 2 / PR 2 | Commit 2-4 (本 PR) | gate1-decision.md F-2-A + F-2-B 採用 / DiffPreviewBlock 3-view + MetadataStrip 5-element + 承認 button gate (IntersectionObserver) / preview 1440 visual smoke pass | Safety rail 5 軸 pass (token SSOT / 装飾 0 / Day 19 U-4 と adjacent-but-orthogonal / JP-only / quota ~7 prompt 消費) | **closed** |
| F-3 | P1 | new | Wave 3 / PR 3 | (TBD: PR 3 Commit 6-7 hashes) | (TBD: screenshots/wave3/) | (TBD: per-page applicable/N/A matrix) | **pending** |
| F-4 | P1 | adjacent-to-Day19 | Wave 3 / PR 3 | (TBD: PR 3 Commit 8 hash) | (TBD: screenshots/wave3/) | (TBD: 7 outcome state column + 5 facet) | **pending** |
| F-5 | P1 | new | Wave 2 / PR 2 | Commit 5 (本 PR) | gate1-decision.md F-5 案 A 採用 / ActorBand primitive (4px ::before band + lucide icon Bot/User/Cog + size sm/md) / Inbox 担当者 column integration | actor mapping `lib/actor-mapping.ts` (入力者/承認者 → 'human' 統合)、新 token 0 (既存 --color-primary / slate-600/400 binding)、Day 19 EvidenceTimeline paraphrase と整合 | **closed** |
| F-6 | P1 | new | Wave 4 / PR 4 | (TBD: PR 4 Commit 9 hash) | (TBD: screenshots/wave4/ + gate2-decision.md) | (TBD: 3-viewport cockpit) | **pending** |
| F-7 | P2 | new | Wave 2 / PR 2 | Commit 2 (mock data) + Commit 5 (本 PR、F-5 と同 commit) | gate1-decision.md F-7 hybrid 採用 / LifecycleStepper per-step SLA badge (target/elapsed chip + over=red / current=amber / done=slate) + approver hover tooltip / Inbox delegate MetaChip「代理: from → to」 | mock data 3 case delegate (CASE-0142/0118/0095)、SLA に `[仮説 / 要検証]` label suffix、approver role 別 prop (入力者/承認者) | **closed** |
| F-8 | P2 | adjacent-to-Day19 | Wave 4 / PR 4 | (TBD: PR 4 Commit 10 hash) | (TBD: screenshots/wave4/ + gate2-decision.md) | (TBD: RACI default open) | **pending** |
| F-9 | P2 | new | Wave 4 / PR 4 | (TBD: PR 4 Commit 10 hash、F-8 と同 commit) | (TBD: screenshots/wave4/) | (TBD: scope badge taxonomy) | **pending** |
| F-10 | Defer | new | Wave 3 / PR 3 (Defer 解除済) | (TBD: PR 3 Commit 8 hash、F-4 と同 commit) | (TBD: screenshots/wave3/) | (TBD: failed event row visible) | **pending** |

## Day 19 重複 Overlap Check (PR 4 末で final lock)

| Day 19 applied finding | 重複 risk | Day 26 finding adjacent tag | Check status |
| --- | --- | --- | --- |
| U-1〜U-21 全 18 applied | 0 件 想定 (本 audit ledger 通過後) | F-2 (U-4 と adjacent) / F-4 (U-2 と adjacent) / F-8 (U-6 と adjacent) | (TBD: PR 4 末で final verify) |

## Status Legend

- **pending**: PR 着手前
- **in-progress**: 該当 PR 内で実装中
- **closed**: PR merge + verification evidence 完備 + Safety rail 5 軸 pass
- **partial-Phase 1**: 本 v3.0 plan では部分実装、残り Phase 1 で完了
- **N/A**: 該当 page で applicable でない (例: F-3 9 page applicable / N/A matrix 参照)

## PR ごとの append 順序

- **PR 0 (本 commit、Wave 0)**: 本 skeleton 作成、全 row status=pending
- **PR 1 末 (Wave 1)**: F-1 row update → closed (or partial)
- **PR 2 末 (Wave 2)**: F-2 / F-5 / F-7 row update + Gate 1 Safety rail 5 軸 check 記録
- **PR 3 末 (Wave 3)**: F-3 / F-4 / F-10 row update
- **PR 4 末 (Wave 4 + final)**: F-6 / F-8 / F-9 row update + Day 19 重複 check final lock + a11y manual smoke gate evidence + version v1.0 lock
