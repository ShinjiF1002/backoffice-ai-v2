| 項目 | 値 |
| --- | --- |
| 文書 ID | DOC-AUDIT-D19-UXC-REQ |
| 文書名 | Day 19+ UX Clarity 確定要件 (4-AI audit 統合後、user 質問攻め完了後の SSOT) |
| 版数 | v1.4 |
| ステータス | Final (Cluster 1+2+3 全 9 question + Cluster 4 7 findings + Cluster 5 v1.1 CR 4 findings + Cluster 6 v1.2 CR 5 findings + Cluster 7 v1.3 CR 3 hygiene findings surgical 反映、**Converged (v1.4 hygiene)**) |
| オーナー | backoffice-ai-v2 maintainer |
| 承認者 | user (Cluster 1+2+3 質問攻め回答により設定承認) |
| 閲覧対象 | Internal / Day 19+ patch 実装 session |
| 機密区分 | Internal |
| 関連文書 | DOC-AUDIT-D19-UXC-PROMPT v0.2 / 4-AI audit results (Claude Opus 4.7 + Codex + GPT-5.5 Pro + Claude design) / DOC-PROTO-CLAUDE / DOC-ROOT-CLAUDE |
| SSOT 区分 | 4-AI audit 統合後の Day 19+ patch 確定要件 (Unified Findings U-1〜U-21、採用 fix 方針、priority、scope-out) の SSOT。Implementation Plan SSOT = DOC-AUDIT-D19-UXC-PLAN |
| Evidence Status | empirical (4 audit × 13-15 findings = 52-60 finding を 21 unified finding に統合、convergence matrix で severity 確定、user 質問攻め 9 回答で要件 lock) |
| 改版履歴 | v1.0 (2026-05-23): 初版作成、4-AI audit 統合後の SSOT。Cluster 1 (U-3 + U-1 + U-10)、Cluster 2 (U-6 + U-8 + U-21)、Cluster 3 (U-13 + U-15/U-19 + mock trim) 全 9 question 回答済。v1.1 (2026-05-23): user critical review 7 findings 反映 — (1) P1 件数 8→9 / Day 19 patch 16→17 / 新規 primitive 4→5 正規化、(2) Commit 0 option A 確定 lock、(3) DEV gate → `?debug=1` query opt-in 定数 (`SHOW_INTERNAL_METADATA`)、(4) Commit 3 → 3a/3b/3c split (framing / drawer / NextActionStrip)、(5) DetailDrawer a11y = `<aside role="complementary">` non-modal、(6) footer caption SSOT option Y、(7) enabled no-op gate = regex + Playwright runtime DOM smoke。v1.2 (2026-05-23): v1.1 CR 4 findings surgical 反映 — gate 10 AST 化 + matrix Commit 3a/3b/3c + NextActionStrip rule + gate 16 non-modal。v1.3 (2026-05-23): v1.2 CR 5 findings surgical 反映 — (1) **P0**: gate 10 を `ts-morph` (未 install) から **既存 `typescript` devDependency (`~6.0.2`) の Compiler API** (`ts.createSourceFile` + `ts.forEachChild`) に変更、新規 dep 追加不要、(2) **P0**: §5 Day 18.5 拡張 commit verification (旧 regex + Playwright b.onclick wording) を AST gate に sync、(3) **P1**: gate 10 pass 条件から `onKeyDown` / `aria-disabled` 単独 pass を削除 (`<button>` mouse click no-op 防止 gate なので `onClick` / `disabled` / `type="submit"` / `type="reset"` の 4 条件のみ、`aria-disabled` は `disabled` 併用時の補助扱い)、(4) **P1**: Commit 3c NextActionStrip ProposalReview summary `${metCount}/3 met` → `${metCount}/3 達成` paraphrase + Commit 4 grep scope を `Metrics.tsx` 限定から `prototype/src/pages/*.tsx` 全体に拡張、(5) **P2**: integrated-plan title / 関連 docs / §9 / §10 / End of plan の v1.1 stale 表記を v1.3 に統一 + Commit 3b 内の Demo シーン表記を曖昧表現 (旧 Cluster 2 Q1 で `Demo 1 シーン` と記述された箇所) から `Demo Chapter 2 の提案レビュー scene` に明確化。v1.4 (2026-05-23): v1.3 CR 4 round 目 3 hygiene findings surgical 反映 — (1) **P1**: §1 matrix U-6 row + §4 Cluster 2 record の `Demo 1 シーンだけ` を plan 側 SSOT (`Demo Chapter 2 の提案レビュー sceneだけ`) に統一、req vs plan SSOT 不一致解消、(2) **P2**: integrated-plan H1 が v1.1 のまま → v1.3 に update、(3) **P2**: integrated-plan §8 Master Summary heading + Day 19 新規 8 gate sub-heading 2 箇所の `v1.1 強化` → `v1.3 強化` に sync。本 patch 完了で **CR 4 round Converged**、implementation 開始可 |

---

# Day 19+ UX Clarity 確定要件

## 0. Summary

- **4-AI audit 統合結果**: 13-15 findings/audit × 4 audit = 52-60 findings → **21 unified findings (U-1〜U-21)** に統合
- **Convergence verification**: source code 直接確認 + screenshot visual verify で **U-3 enabled no-op (GPT-5.5 Pro 独占検出) を最高 priority P0** に確定、**U-10 StagingHint fold (Claude design 独占検出) を P2 に格下げ**、**U-21 docs/03 SSOT loss (私 + Claude design 誤検出) を完全除外**
- **User 質問攻め (Cluster 1+2+3 / 9 question)** で全 priority decision lock
- **Day 18.5 patch との関係**: U-3 を Day 18.5 P0 拡張に追加 (1 batch fix)、他 P0/P1/P2 は Day 19 patch
- **最終分類**: Day 18.5 拡張 1 件 / Day 19 P0 4 件 / Day 19 P1 **9 件** / Day 19 P2 4 件 / Defer 2 件 / Excluded 1 件 = **20 actionable + 1 excluded = 21 unified**
- **Day 19 patch commit 数**: 7 commit (Commit 1 + 2 + 3a + 3b + 3c + 4 + 5)、+ Day 18.5 拡張 Commit 0 = **総 8 commit**
- **新規 shared primitive 数**: **5 件** (HypothesisChip + Disclosure + DetailDrawer + PageHelpDisclosure + NextActionStrip)

## 1. 4-AI Audit 統合 Coverage Matrix (verbatim 確定)

| Unified Finding | Claude v0.1 | Codex | GPT-5.5 Pro | Claude design | Convergence | **Final Decision** | **Final Priority** |
| --------------- | ----------- | ----- | ----------- | ------------- | ----------- | ------------------ | ------------------ |
| **U-1** `[仮説 / 要検証]` hedge over-display (25+ reps) | P0 F-2 (page-level) | P0 F-2 (**section-level**) | P1 F-8 | P0 F-1 (**HypothesisChip primitive**) | 3:1 P0 | **採用**: Codex section-level + Claude design HypothesisChip primitive 合成案 (Cluster 1 Q2) | **P0** (Day 19 Commit 1) |
| **U-2** Internal SSOT schema/DOC leak (snake_case + DOC-\*) | P1 F-3 | P1 F-3 | P1 F-3 | **P0 F-2** + dev-only gate | 4:0 detect | **採用**: dev-only flag gate (Claude design 案、本番 visible 0) | **P0** (Day 19 Commit 2) |
| **U-3** 🔴 残余 enabled no-op (CaseReview 承認 / EvidenceTimeline プレビュー / Sidebar user menu) | miss | miss | **P0 F-1** | miss | 1:3 detect、source 検証で確定 | **採用**: **Day 18.5 patch に追加 1 batch fix** (Cluster 1 Q1)、CaseReview 承認 button = **in-memory state 実動作化 (option A 確定 lock、v1.1)** | **P0** (**Day 18.5 拡張**、Day 19 とは別 commit) |
| **U-4** EvidenceTimeline `actor:/source:/conf:` mono cadence | (CR-4 embed) | (CR-4 embed) | partial F-3 | **P0 F-3** (systematic L1→L3 PDR drawer) | 2:2 detect、1 P0 | **採用**: Claude design systematic L1 paraphrase (`AI 抽出 v2.3 · 信頼度 92%`) + L3 PDR drawer expand (raw identifier visible) | **P0** (Day 19 **Commit 3b**) |
| **U-5** Framing 注 box L1→L4 expand (Metrics/Audit/Knowledge) | P0 F-1 | P0 F-1 | P2 F-12 | P1 implicit | 3:1 P0 | **採用**: PageHelpDisclosure 新規 primitive、KnowledgeBrowser citation governance 1 sentence は L1 subtitle 残置 carve-out | **P0** (Day 19 **Commit 3a**) |
| **U-6** ProposalReview 4-col → 2-col + right drawer | P1 F-6 | P1 F-6 | P1 F-6 | per-screen | 4:0 | **採用**: DetailDrawer 新規 primitive、**Demo Chapter 2 の提案レビュー sceneだけ RACI default open** (Cluster 2 Q1) | **P1** (Day 19 **Commit 3b**) |
| **U-7** Footer caption 9 page reps → PrototypeModeLabel 統合 | P1 F-4 | P1 F-4 | P1 F-5 | CR-4 target 1 | 4:0 | **採用**: PrototypeModeLabel tooltip 末尾拡張 + 9 page footer caption 削除 | **P1** (Day 19 Commit 4) |
| **U-8** Tier 1 vocab `承認待ち` vs `承認者承認待ち` vs `業務承認` | P1 F-5 | P1 F-5 | CR-5 only | CR-5 only | 2:2 split | **採用**: **「承認者承認」全統一**、`業務承認` legacy 全削除 (Cluster 2 Q2)、docs/02 §2.2 SSOT 整合 | **P1** (Day 19 Commit 4) |
| **U-9** Internal raw vocab (`citation` / `source:` / `field` / `step` / **`met/miss`**) | partial CR-4 | partial CR-4 | F-3 + **met/miss 独占** | CR-4 target 6 | 4:0 partial | **採用**: CR-4 11 verbatim targets 全 SSOT 化、`met/miss` → `達成/未達` (GPT-5.5 Pro 独占) | **P1** (Day 19 Commit 4) |
| **U-10** StagingHintPanel fold below loss (CaseReview 右列下端) | miss | miss | miss | P1 F-5 | 1:3 detect、screenshot verify 部分的 | **採用**: **P2 格下げ** (Cluster 1 Q3)、section header visible 確認、content fold acceptable、collapsed `<details>` は Day 20 polish | **P2** (Day 19 Commit 5) |
| **U-11** `(5 分類)` redundant suffix × 3 page | CR-4 embed | CR-4 embed | miss | P1 F-11 | 1:3 explicit | **採用**: 全 page で削除 (CR-4 target 5 と統合) | **P1** (Day 19 Commit 4) |
| **U-12** Inbox row click → preview drawer (PDR) gap | CR-1 gap | CR-1 gap | P1 F-4 (anchor framing) | P1 F-4 (PDR add) | 2:2 explicit | **採用**: DetailDrawer primitive (U-6 と共有)、row click → drawer preview + drawer 内 CTA で full navigate | **P1** (Day 19 **Commit 3b**) |
| **U-13** Dashboard "次に処理すべき案件" recommended anchor + `<NextActionStrip>` primitive | miss | miss | **P1 F-4** | miss | 1:3 detect | **採用**: shared primitive 4 page 適用 (Cluster 3 Q1)、**default = operational priority (SLA elapsed 最大、例: CASE-2026-0148) / `?demo=1` query 時 = Demo narrative 固定 (CASE-2026-0142)** の分岐 logic (v1.2 lock) | **P1** (Day 19 **Commit 3c**) |
| **U-14** SendBackComment 5-category radio description default | P2 per-screen | P2 per-screen | P1 F-7 | P1 F-9 | 2:2 P1 | **採用**: 選択時のみ visible (Disclosure primitive)、description は L3 demote | **P1** (Day 19 Commit 4) |
| **U-15** Dashboard workflow lane 削除 + hardcoded case_id | P2 F-7 | P2 F-7 | miss | P1 F-8 | 3:1 detect、P1/P2 split | **採用**: **Defer (Phase 1)** (Cluster 3 Q2)、`?demo=1` query gate 設計は Phase 1 で再判定 | **Defer** (Phase 1) |
| **U-16** ProposalReview footer free-floating span | CR-4 target 10 | CR-4 target 10 | miss | P1 F-6 | 1:3 explicit | **採用**: Day 18.5 SSOT (`<DisabledAction mode="caption">` + captionId) に統合、free-floating span 削除 | **P1** (Day 19 Commit 4) |
| **U-17** AgentSettings Hero 6-layer clutter | P2 F-9 | P2 F-9 | P2 F-11 | F-1 embed | 3:1 P2 | **採用**: U-1 fix で 50% 軽減、追加で 4 KPI grid → Disclosure expand 化 | **P2** (Day 19 Commit 5) |
| **U-18** CaseReview footer left explainer (NH6 violation) | P2 F-8 | P2 F-8 | miss | per-screen mention | 2:2 explicit | **採用**: footer left explainer 削除 (`差戻し / 承認` CTA で十分) | **P2** (Day 19 Commit 5) |
| **U-19** Inbox FilterToolbar 統合 (6 disabled surface) | P2 F-10 | P2 F-10 | Day 18.5 内 judge | Day 18.5 内 judge | 2:2 split | **採用**: **Defer (Day 18.5 patch 後再判定)** (Cluster 3 Q2)、Day 19 patch には含めず | **Defer** (Day 18.5 patch 後) |
| **U-20** Mock data trim pass | CR-3 | CR-3 | CR-3 | P2 F-10 | 4:0 detect | **採用**: UI 非依存 commit、PROP-2026-031 summary 100→60 字 (Cluster 3 Q3、framing 注 SSOT 経由)、alert message + agent tools description 短縮、Demo narrative 不変 | **P2** (Day 19 Commit 5) |
| **U-21** docs/03 SSOT status | 「上書き済」誤 | 「現 HEAD 存在」正 | 「verify-first」正 | 「上書き済」誤 | 2:2 split、現実 = Codex/GPT-5.5 Pro 正 | **採用**: **Day 19 patch から完全除外** (Cluster 2 Q3)、現 docs/03 = 498 行 SSOT 正常 (git log + 現物確認済) | **Excluded** |

## 2. Final Priority Distribution

| Priority | Count | Findings | Commit |
| -------- | ----- | -------- | ------ |
| **🔴 Day 18.5 拡張** | 1 | U-3 enabled no-op | **Commit 0 (Day 18.5 拡張、別 patch)** |
| **🔴 Day 19 P0** | 4 | U-1 hedge / U-2 SSOT leak / U-4 EvidenceTimeline / U-5 framing 注 | Day 19 Commit 1 (U-1) / Commit 2 (U-2) / Commit 3a (U-5) / Commit 3b (U-4) |
| **🟡 Day 19 P1** | **9** | U-6 ProposalReview drawer / U-7 footer caption / U-8 Tier 1 vocab / U-9 raw vocab / U-11 `(5 分類)` / U-12 Inbox preview drawer / U-13 NextActionStrip / U-14 SendBackComment radio / U-16 ProposalReview span | Day 19 Commit 3b (U-6 + U-12) / Commit 3c (U-13) / Commit 4 (U-7 + U-8 + U-9 + U-11 + U-14 + U-16) |
| **🟢 Day 19 P2** | 4 | U-10 StagingHint / U-17 AgentSettings Hero / U-18 CaseReview footer / U-20 mock trim | Day 19 Commit 5 |
| **Defer** | 2 | U-15 Dashboard lane (Phase 1) / U-19 Inbox FilterToolbar (Day 18.5 後) | — |
| **Excluded** | 1 | U-21 docs/03 復旧 (現 SSOT 正常) | — |

**合計**: Day 18.5 拡張 1 + Day 19 patch **17** + Defer 2 + Excluded 1 = **20 actionable + 1 excluded = 21 unified findings**

## 3. Multi-AI Audit Value Analysis

| 種別 | Count | Examples |
| ---- | ----- | -------- |
| **4-way agree (4/4)** | 5 | U-1, U-2 (split severity), U-6, U-7, U-9, U-20 |
| **3-way agree, 1 dissent (3/4)** | 4 | U-5 (GPT-5.5 P2), U-15 (GPT-5.5 miss), U-17, U-18 |
| **2-way agree, 2 split (2/2)** | 3 | U-8 (Tier 1 vocab、CR vs top finding split)、U-12 (Inbox drawer)、U-14 (SendBack radio) |
| **1-way unique detect** | 3 + 1 | **U-3 GPT-5.5 Pro 独占 (P0、最重要、source 検証で確定)**、**U-10 Claude design 独占 (P2、screenshot 部分検証)**、**U-13 GPT-5.5 Pro 独占 (P1、NextActionStrip primitive)**、+ U-21 Codex/GPT-5.5 Pro 共同正解 (私と Claude design は誤検出) |

**Multi-AI value 確証**: U-3 が単一 AI (GPT-5.5 Pro) でしか検出されず、3/4 audit が miss した critical regression。これが本 4-AI audit framework の最大 value。

## 4. Confirmed User Decisions (Cluster 1+2+3、9 question 全回答)

### Cluster 1 (最重要 fix 方針)
1. **U-3 enabled no-op fix**: ✅ Day 18.5 patch に追加 1 batch fix
2. **U-1 hedge 集約**: ✅ Codex section-level + Claude design HypothesisChip primitive 合成案
3. **U-10 StagingHint fold**: ✅ Screenshot verify 後 P2 格下げ (section header visible 確認)

### Cluster 2 (drawer + Tier 1 + docs/03)
4. **U-6 ProposalReview drawer narrative**: ✅ drawer 採用、Demo Chapter 2 の提案レビュー sceneだけ RACI default open
5. **U-8 Tier 1 vocab**: ✅ 「承認者承認」全統一、`業務承認` legacy 全削除
6. **U-21 docs/03 status**: ✅ Day 19 patch から完全除外 (現 SSOT 正常)

### Cluster 3 (primitive + Defer 整理)
7. **U-13 NextActionStrip**: ✅ shared primitive として 4 page 適用 (Dashboard/Inbox/CaseReview/ProposalReview)
8. **U-15/U-19 Defer**: ✅ 両方 Defer (Phase 1 / Day 20 polish)
9. **CR-3 mock trim PROP-2026-031**: ✅ 60字 trim 採用、hedge 部分は framing 注 SSOT 経由

## 5. Day 18.5 拡張 commit specification (U-3、option A 確定 lock)

| Item | 内容 |
| ---- | ---- |
| **目的** | Day 18.5 P0 (Inbox filter chip / TopBar Notification disabled) と同 scope で **CaseReview 承認 button + EvidenceTimeline プレビュー + Sidebar user menu** の 3 残余 enabled no-op を解消、regulated UI 信頼性 baseline 拡張 |
| **Touch files** | `prototype/src/pages/CaseReview.tsx:210-216` (承認 button)、`prototype/src/components/case/EvidenceTimeline.tsx:57-59` (プレビュー button)、`prototype/src/components/shell/Sidebar.tsx:100-108` (user menu button) |
| **Fix detail (v1.1 lock)** | **(a) CaseReview 承認 button: option A 確定 = in-memory state で実動作化** (`caseApproved=true` mock state set + footer `<div role="status">本案件は承認されました (mock)</div>` flash + 3 秒後 `/inbox` navigate、Demo Chapter 1 narrative 整合、Plan v1.4 P0-3 in-memory mock state 原則遵守)、(b) EvidenceTimeline プレビュー: `<DisabledAction mode="wrapper">` 化 (PDF 実 preview は Phase 1)、(c) Sidebar user menu: `<button>` → `<div>` semantic 化 (user role 切替は scope-out、`<DisabledAction>` は form submit context と非整合) |
| **Verification (v1.3 AST 化)** | (1) **主 gate = TypeScript Compiler API AST script** (`prototype/scripts/check-no-op.mjs`、既存 `typescript: ~6.0.2` devDependency 使用、新規 dep 追加なし): `pnpm exec node prototype/scripts/check-no-op.mjs` で全 `.tsx` の JSX `<button>` (JsxOpeningElement + JsxSelfClosingElement) を `ts.createSourceFile` + `ts.forEachChild` で走査、`onClick` / `disabled` / `type="submit"` / `type="reset"` いずれも欠落 = enabled no-op として `process.exit(1)` 検出。**`aria-disabled` 単独は pass 条件に含めない** (native disabled でない、visual のみ、`disabled` 併用時補助)、**`onKeyDown` 単独も pass 条件に含めない** (`<button>` は browser native で Enter/Space click event 発火、`onClick` で十分)。Whitelist: `<DisabledAction>` JSX wrapper (button tag ではない)、form submit context 内 `type="submit"` button。(2) **補助 gate = Playwright role audit** (DOM role + Tab order + `:focus-visible` 整合性のみ、`b.onclick` は React synthetic event のため使用不可)、(3) keyboard Tab で 3 場所 disabled focus 確認、(4) Day 18.5 既存 8 verification gate retain |
| **Scope-out** | Phase 1 backend 接続時の実 functionality、user role 切替の実装 |

**v1.1 lock**: option A 確定済 (Cluster 4 user 最終回答)、本要件 doc + Implementation Plan で「decision point / user 判断必要」表現を全削除。

## 6. Day 19 Commit Plan Skeleton (v1.1、7 commit + Day 18.5 拡張 1)

| Commit | Scope | Findings | 想定 LOC | 新規 primitive |
| ------ | ----- | -------- | -------- | --------------- |
| Commit 1 | U-1 hedge 集約 | HypothesisChip primitive + Metrics 16→3 section-level + AgentSettings/Dashboard page-level | ~150 | `HypothesisChip.tsx` |
| Commit 2 | U-2 SSOT leak | **`?debug=1` query opt-in 定数 (`SHOW_INTERNAL_METADATA`) gate** (AuditTrail + KnowledgeBrowser expand panel)、`import.meta.env.DEV` 不使用 (demo / production / dev server 全 default hidden) | ~80 | — |
| **Commit 3a** | U-5 framing disclosure | PageHelpDisclosure primitive + 3 page framing 注 box → L4 expand 化 (KnowledgeBrowser citation governance carve-out) | ~120 | `PageHelpDisclosure.tsx` |
| **Commit 3b** | U-4 + U-6 + U-12 drawer primitives | Disclosure + DetailDrawer 2 primitive + EvidenceTimeline L1 paraphrase + L3 drawer / ProposalReview 4-col→2-col + drawer / Inbox row click → drawer preview | ~220 | `Disclosure.tsx` + `DetailDrawer.tsx` (`<aside role="complementary">` non-modal、focus trap なし、body scroll 保持、ESC + backdrop close) |
| **Commit 3c** | U-13 NextActionStrip | NextActionStrip primitive + 4 page (Dashboard/Inbox/CaseReview/ProposalReview) で L1 primary action anchor 追加 | ~90 | `NextActionStrip.tsx` |
| Commit 4 | U-7 + U-8 + U-9 + U-11 + U-14 + U-16 microcopy SSOT | CR-4 11 verbatim targets + Tier 1 vocab 統一 + `met/miss` JP 化 + `(5 分類)` 削除 + ProposalReview span 削除 + SendBackComment radio L3 demote + **PageFooter caption 全 9 page で削除 (option Y: DisabledAction reason + PrototypeModeLabel general framing に SSOT 集約)** | ~250 | — |
| Commit 5 | U-10 + U-17 + U-18 + U-20 P2 batch | StagingHint collapsed (Commit 3 carry-along 撤回、本 Commit 5 で実装) / AgentSettings Hero trim / CaseReview footer 削除 / mock trim | ~180 | — |

**合計**: **7 commits / ~1,090 LOC + 5 新規 primitive**。Day 18.5 拡張 Commit 0 (~50 LOC) と分離 = 総 8 commit / ~1,140 LOC / 5 primitive。

## 7. Scope-out (Day 19 patch 適用外、明示分離)

| Scope-out | 理由 |
| --------- | ---- |
| **U-15 Dashboard workflow lane** | Defer Phase 1、`?demo=1` query gate 設計後判断 |
| **U-19 Inbox FilterToolbar 統合** | Defer Day 18.5 patch 適用後 visual 再評価 |
| **U-21 docs/03 SSOT 復旧** | 現 docs/03 = 498 行で正常 (verified)、復旧不要 |
| **新規 route 追加** | 9 routes exactly SSOT (`prototype/CLAUDE.md`) |
| **Day 18.5 既存 P0/P1 patch の re-scope** | Day 18.5 patch と co-exist 設計、両 patch 同 Day 19 内 apply 可 |
| **Day 14-15 medium-fi register / token drift** | 8 grep gate 全 0 hit、re-audit 禁止 |
| **PROP-2026-031 narrative core (`OCR 信頼度閾値 0.85→0.88 引き上げ`)** | Demo Chapter 2 narrative integrity 保持必須 (Cluster 3 Q3) |
| **CASE-2026-0142 narrative core** | Demo Chapter 1 narrative integrity 保持必須 |

## 8. Verification Gate 拡張 (Day 18.5 既存 8 + Day 19 新規)

| # | Gate (既存 Day 18.5) | 期待値 |
| - | --------------------- | ------ |
| 1 | `pnpm build` warning 0 / error 0 | pass |
| 2 | 8 grep gate 全 0 hit | retain |
| 3 | 9 route DOM smoke (console error 0) | retain |
| 4 | sticky top=56px | retain |
| 5 | chip taxonomy 3 系統 | retain |
| 6 | Lighthouse a11y target | retain |
| 7 | keyboard focus check | retain |
| 8 | Day 18.5 P0+P1 patch retain | retain + **U-3 拡張部分追加** |

| # | Gate (Day 19 新規 sub-check) | 期待値 |
| - | ---------------------------- | ------ |
| 9 | First-click test (NFC) Dashboard/Inbox/CaseReview/ProposalReview で primary action 5 秒識別 | pass |
| 10 | **enabled no-op gate (v1.3 typescript Compiler API + pass 条件 strict)**: (a) **主 gate** = **既存 `typescript: ~6.0.2` devDependency 使用の AST script** (`prototype/scripts/check-no-op.mjs`、`import ts from 'typescript'` + `ts.createSourceFile` + `ts.forEachChild`、**新規 dep `ts-morph` 不要**) で全 `.tsx` の JSX `<button>` を走査、**pass 条件 = `onClick` / `disabled` / `type="submit"` / `type="reset"` の 4 条件のみ** (`onKeyDown` は `<button>` browser native で Enter/Space → click 自動発火のため不要、`aria-disabled` 単独は visual のみで native disabled でないため `disabled` 併用時補助扱い)、4 条件いずれも欠落 = exit 1。Whitelist: `<DisabledAction>` JSX wrapper (button tag ではない)、form submit context 内 `type="submit"` button。(b) **補助 gate** = Playwright role audit (Tab order + `:focus-visible` 整合性のみ、`b.onclick` 不使用)。**理由**: v1.1 grep `-E` lookahead は POSIX ERE 不対応エラー、Playwright `b.onclick` は React event delegation で false negative、ts-morph は既存 dep 外で追加不要 | pass |
| 11 | text density audit: `[仮説 / 要検証]` reps per page ≤ 3 (framing + summary + carve-out limit) | pass |
| 12 | internal vocabulary leakage grep (DOC-\* / SSOT / snake_case / `citation` raw / `source:` raw / `met` / `miss`) user-facing 0 hit | pass |
| 13 | JP-only check pass | pass |
| 14 | Demo narrative integrity check (CASE-2026-0142 / PROP-2026-031) | pass |
| 15 | NextActionStrip primitive 4 page render 確認 | pass |
| 16 | **5 primitive smoke test** (HypothesisChip / Disclosure / **DetailDrawer non-modal a11y** (`role="complementary"` + ESC + backdrop click + body scroll 保持、**focus trap なし**) / PageHelpDisclosure / NextActionStrip) | pass |

## 9. Reviewer-back Question 解消 record (4 audit からの未確認事項)

| Audit 元 | Reviewer-back question | 解消方法 |
| -------- | ---------------------- | -------- |
| 私 (Claude v0.1) Q1 | PageHelpDisclosure defaultOpen state 戦略 | **default closed / no persistence** (Codex 案採用、Commit 3) |
| 私 (Claude v0.1) Q2 | HedgeBanner + KnowledgeBrowser carve-out 両立 | **citation governance 1 sentence subtitle として L1 keep** (carve-out 確定、Commit 3) |
| 私 (Claude v0.1) Q3 | DetailDrawer 1 page only proof of concept | **NextActionStrip (4 page) + DetailDrawer (Inbox + ProposalReview の 2 page)** で抽出基準 (3+ instance) 確保 (Commit 3) |
| 私 (Claude v0.1) Q4 | Tier 1 vocab `業務承認` → `承認者承認` 全削除 OK か | **OK、全削除確定** (Cluster 2 Q2、Commit 4) |
| 私 (Claude v0.1) Q5 | docs/03 復旧 A 案 vs B 案 | **excluded、Day 19 patch 対象外** (Cluster 2 Q3、現 SSOT 正常) |
| Codex Q (同上) | (上記と重複) | (上記で解消) |
| GPT-5.5 Pro Q1 | CaseReview 承認 in-memory state vs disabled | **Day 18.5 拡張 commit 内で別途 mode 確認** (要件 doc §5 で lock、Implementation Plan で詳細) |
| GPT-5.5 Pro Q2 | Demo 中 Evidence drawer default open | **drawer trigger pattern (default closed) + Disclosure pattern for StagingHint** (Commit 3) |
| GPT-5.5 Pro Q3 | Dashboard/Inbox next-case 選び方 (SLA vs Demo CASE-2026-0142) | **v1.2 lock**: **default (`?demo=1` なし) = operational priority (SLA elapsed 最大、例: CASE-2026-0148)** / **`?demo=1` query 時 = Demo narrative 固定 (CASE-2026-0142)** の分岐 logic。NextActionStrip 内部または page-side で `URLSearchParams.get('demo') === '1'` 判定 (Commit 3c 設計、Demo facilitator + 実 user 業務 flow 両立) |
| GPT-5.5 Pro Q4 | `[仮説 / 要検証]` consolidation 妥当性 | **Codex section-level + HypothesisChip primitive で per-card 削減 + section header retain** (Cluster 1 Q2、Commit 1) |
| GPT-5.5 Pro Q5 | main repo docs/03 verify | **Codex / GPT-5.5 Pro 正、私の v0.1 誤、現 498 行で正常** (Cluster 2 Q3) |
| Claude design Q1 | EvidenceTimeline L3 demote vs L2 keep | **L1 paraphrase + L3 expand 2 段階構造** (採用、Commit 3) |
| Claude design Q2 | Inbox row click 1st preview / 2nd full navigate 妥当性 | **Phase 1 で測定する仮説、Day 19 patch では PDR pattern として実装** (Commit 3、Cluster 3 Q1 NextActionStrip と統合判断) |
| Claude design Q3 | hedge per-value rituals 業務文化 | **summary chip + section-level + per-card border color で hedge 性質伝達**、user-validation は Phase 1 (Commit 1) |
| Claude design Q4 | Dashboard workflow lane retain / drop | **Defer Phase 1、`?demo=1` query gate 設計後判断** (Cluster 3 Q2) |
| Claude design Q5 | docs/03 復旧 priority | **Excluded、現 SSOT 正常** (Cluster 2 Q3) |

全 reviewer-back question 解消済、implementation phase へ移行可能。

End of requirements.
