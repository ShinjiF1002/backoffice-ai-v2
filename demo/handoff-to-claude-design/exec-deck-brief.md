# Executive Deck Design Brief — Backoffice AI v2 Phase 1 投入計画

> **For Claude Design (cold-start handoff)**: 本 brief は backoffice-ai-v2 prod-ready design loop (Cycle 1-16) の autonomous loop で確定した executive deck の構成 spec。Claude Design 側で本 brief を input として HTML deck (Reveal.js + Tailwind single-file) を build する。本 brief 単独で実行可能、prior 文脈不要。

| 項目 | 値 |
|---|---|
| 文書 ID | DOC-HANDOFF-EXEC-DECK-BRIEF |
| 文書名 | Executive Deck Design Brief (Phase 1 投入計画、Type B prerequisite sign-off ask) |
| 版数 | v0.1 (2026-05-25、Cycle 16 後 handoff) |
| Source repo | `/Users/shinjifujiwara/code/active/backoffice-ai-v2` |
| Source branch | `feature/prod-ready-design-loop` @ `25b74c3` |
| Source docs | DM-07 v1.7.2 + CA-08 v2.6 + PFC-09 v0.2 + TM-10 v0.1 + SRE-11 v0.1 + CEM-12 v0.2 + _SSOT.md v0.13 + HANDOFF.md |
| Strategy canon | `/Users/shinjifujiwara/code/shared/presentation-design/strategy-consulting-canon.md` (62 principle、cluster C1-C8) |
| Principles ref | `/Users/shinjifujiwara/code/shared/presentation-design/principles-62.md` |
| Reference deck pattern | Day 22 Session 4 deck (`demo/slides/session-4.html`、Reveal.js + Tailwind CDN 同 stack) |

---

## 0. Brief at a glance (designer 用 30 秒要約)

- **Audience**: 日本銀行 America division 経営層 (CXO + Risk Committee)、30 min keynote (説明 15 / Q&A 15)
- **Decision ask**: **Type B 設定承認の prerequisite として、本日 6 設計 doc + 7 PFC plan の sign-off をいただきたい** (= recommendation tone)
- **Honne 位置付け**: Act 1 (S3 SCQA) で「PFC 未完了 + counsel 90 day lead time」を up-front 開示
- **Slide count**: 本編 12 + Appendix 6 = 計 18
- **Narrative arc**: 4-act (Intro 3 / Mechanism 4 / Decision 3 / Close 2)、canon C1-5
- **Visual stack**: Reveal.js 5.x + Tailwind CDN single-file HTML、16:9、3-color palette
- **Output**: `demo/slides/exec-phase1-handoff.html` (or similar)

---

## 1. Audience + Decision ask + Tone

### 1.1 Audience

- **Primary**: CXO + Risk Committee (= Phase 1 投入意思決定の最終 gate)
- **Secondary**: Security 関係者 + 業務責任者 + AI 管理者 (co-sign 想定)
- **Tertiary** (deep-dive 質疑): Compliance officer + Model Risk Management

### 1.2 Decision ask (本日の sign-off)

**「Type B 設定承認の prerequisite として、本日 6 設計 doc + 7 PFC plan の sign-off をいただきたい」**

具体 sign-off items:
1. 6 設計 doc (DM-07 / CA-08 / PFC-09 / TM-10 / SRE-11 / CEM-12) を Phase 1 hand-off Draft として承認
2. 7 PFC item (DOC-PFC-09 §1) の execution plan + critical path (PFC-02 counsel = -90 day) を承認
3. Next 30 day commitment: counsel firm 選定 + AWS sandbox provision の kick-off

### 1.3 Tone (canon C5-26)

- **Recommendation tone** (briefing tone ではない)
- **Honne up-front** (PFC 未完了 + counsel 未取得 を Act 1 で開示、隠さない)
- 規制 cite は IR convention (C6-30): `[NYDFS Part 500.15]` 形式で footnote
- **No '完成' wording** — 全 doc は Draft、本投入は decision 後

---

## 2. 4-act Narrative Arc (canon C1-5)

```
Act 1: Intro (S1-S3) ── SCQA + honne up-front
  S1 Cover
  S2 Governing thought (1 文 thesis)
  S3 SCQA + Honne disclosure

Act 2: Mechanism (S4-S7) ── 何を作ったか / どう統制するか
  S4 System architecture
  S5 Flywheel + 3 層承認
  S6 規制 framework × control coverage
  S7 Risk control matrix

Act 3: Decision (S8-S10) ── 何を決めるか
  S8 Cost / ROI
  S9 Pre-flight 7 項 + critical path
  S10 Decision ask (sign-off block)

Act 4: Close (S11-S12) ── 決めた後 30 日
  S11 Roadmap (Three Horizons)
  S12 Next 30 days commitment

Appendix (A1-A6) ── deep-dive 質疑用
```

### 2.1 Pyramid trace test (canon C2-10 ship gate)

S2 → S12 を **action title だけで読み下す** と:

> 業務確認を減らし AI 設定承認は強化する仕組みを Phase 1 で投入したい → なぜなら業務量増 + AI 規制強化が同時進行 → そのため 12 layer cloud + 47 entity data model を作った → 5 段 flywheel で AI 学習を承認管理 + 9 規制 framework を control matrix で mapping + 4 段防御で primary risk closure → コストは breakeven 可能だが 7 件の外部 execution + 90 day counsel critical path が必要 → よって本日 prerequisite sign-off をいただきたい → 決まれば CDK skeleton + 12 month で本投入 + 30 日後の review timing は確定

= governing thought 完全再生、title chain alone で意思決定 ask に到達。

---

## 3. Visual Design System

### 3.1 Color palette (3-color rule、canon C3-12)

| Role | Hex | 使用 |
|---|---|---|
| Primary (corporate navy) | `#1a3a52` | Header / title text / primary chart bar |
| Accent (alert / decision red) | `#c93838` | Risk / decision ask / critical path / honne disclosure |
| Neutral (supporting grey) | `#8a8a8a` | Body text / secondary data / footnote |
| Background (off-white) | `#fafaf8` | slide canvas |
| Surface (light grey panel) | `#f0f0ec` | callout box / data table row alt |

**禁則**: 4 色目を使わない (heatmap 等で gradation 必要な場合は primary navy の opacity 段階で表現)

### 3.2 Typography (canon C3-11)

| Element | Font | Size | Weight |
|---|---|---|---|
| Action title (header) | Inter / Noto Sans JP | 28pt | Bold |
| Subtitle / section label | Inter / Noto Sans JP | 16pt | SemiBold |
| Body text | Inter / Noto Sans JP | 18pt | Regular |
| Data / numbers (emphasis) | Inter | 36-48pt | Bold |
| Footer / footnote | Inter / Noto Sans JP | 10-12pt | Regular |
| Citation (footnote) | Inter monospace | 10pt | Regular |

JP / EN 混在: Inter で 数字 + 英語、Noto Sans JP で日本語。`font-family: Inter, "Noto Sans JP", sans-serif;` で自動 fallback。

### 3.3 Layout (canon C3-13 / C3-15)

```
┌────────────────────────────────────────────────┐  Header zone (15% top、80px margin top)
│  Action title 28pt bold                         │  ← 12-15 words、claim form S-V-O
│  ─────────────                                  │  ← 2px navy underline (60px width)
├────────────────────────────────────────────────┤  Hero zone (60% middle)
│                                                 │
│        SINGLE HERO VISUAL                       │  ← 1 chart / 1 diagram / 1 matrix
│        (centered、white space 40% 維持)         │     C3-13 40% empty rule
│                                                 │
├────────────────────────────────────────────────┤  Footer zone (15% bottom)
│  Supporting data point (3-5 bullets max)        │
│  ─────────────                                  │
│  Page X/12  ·  Source: [DOC-XX-YY §X.Y]  ·  ¹   │  ← C3-14 footer convention
└────────────────────────────────────────────────┘
   ← 10% left margin                15% right →
```

- 16:9 aspect ratio (1920×1080 baseline、Reveal.js default)
- Safe margin: 10% L / 15% R (right はやや広く asymmetric balance)
- White space rule: 各 slide で **40% 以上 empty** を維持 (C3-13)

### 3.4 Animation

- Slide transition: `fade` (Reveal.js `transition="fade"`、過剰演出禁止)
- Within-slide: no animation (executive deck では distraction)

---

## 4. Slide-by-slide Spec

### 4.1 共通 footer convention (canon C3-14)

各 slide footer に以下を pin:

```
<page X/12>  ·  Source: [DOC-XX §X.Y]  ·  Footnote ¹  ·  Confidential / Internal
```

### Act 1: Intro

---

#### S1 Cover

| Field | Spec |
|---|---|
| Action title | (none、cover slide) |
| Header text | 「**案件確認は減らす、ルール承認は残す。**」(slogan、48pt bold) |
| Subtitle | Backoffice AI v2 Phase 1 投入計画 — Type B 設定承認 Prerequisite Sign-off |
| Date / Audience | YYYY-MM-DD / CXO + Risk Committee / Confidential |
| Visual | 中央に slogan、下に subtitle + footer の minimal layout |
| Reference | CLAUDE.md slogan |

---

#### S2 Governing thought

| Field | Spec |
|---|---|
| Action title | 業務確認を減らし AI 設定承認は強化する仕組みを Phase 1 で投入、本日その prerequisite を求める |
| Hero visual | 中央 1 文 thesis box (48pt bold navy) + 下に 3 pillar (差戻し flywheel / 人間 control / 規制統制) horizontal layout |
| 3 pillar text | (1) 差戻し → 手順承認 (5 段 flywheel) / (2) AI 設定変更は 3 層承認 (Type A/B/C) / (3) 9 規制 framework を control matrix で逐条 mapping |
| Footnote | Source: HANDOFF.md §0 + CA-08 v2.6 + DM-07 v1.7.2 |
| Canon | C1-2 SCQA pre-amble、C2-7 1 slide 1 message |

---

#### S3 SCQA + Honne disclosure

| Field | Spec |
|---|---|
| Action title | 業務量増 + AI 規制強化の同時進行に、PFC 7 項 + counsel sign-off を経て Phase 1 投入が必要 |
| Hero visual | **2-column layout**: 左 SCQA box (4 stacked card)、右 honne disclosure box (alert red border) |
| Left SCQA | **S**ituation: 米州本邦銀行 backoffice 案件量 + cost 構造 / **C**omplication: NYDFS Part 500 + FRB SR 11-7 強化 + 競合 AI 投入加速 / **Q**uestion: AI 自動化を「人間 control 下」で本投入するか / **A**nswer: Yes、ただし prerequisite sign-off が前提 |
| Right honne (alert red `#c93838`) | ⚠ **本投入決定の前に必要なもの** / (a) PFC 7 項 完了 (60-90 day) / (b) external counsel sign-off (PFC-02 critical path) / (c) 経営層 Type B 設定承認 / **本日はその (c) prerequisite を求める** |
| Footnote | Source: HANDOFF.md §0 + DOC-PFC-09 v0.2 §1 |
| Canon | C1-2 SCQA + C6-31 honne up-front |

---

### Act 2: Mechanism

---

#### S4 System architecture

| Field | Spec |
|---|---|
| Action title | AWS 12 layer cloud + 47 entity data model + Bedrock Geo CRIS で AI を人間 control 下に維持する |
| Hero visual | **12 layer stack diagram** (top to bottom)、簡素化版 |
| Layer stack (top to bottom) | User → H4 Frontend (S3 + CloudFront) → L5 API Gateway → L3 Compute (Lambda + Fargate CU + Step Fn) → **L4 AI Runtime (Bedrock Sonnet 4.6 Geo CRIS + Haiku 4.5 us-east-1)** [alert red callout] → L6 Persistence (Aurora PG 16 + S3 Object Lock + KMS) |
| Side annotation | 右側に L1 Identity + L7 Observability + L8 CI/CD + H1 Security + H2 DR + H3 Cost の縦列 |
| Key callout | **Bedrock Geo CRIS** = US geography 内 routing (us-east-1 / us-east-2 / us-west-2)、Sonnet 4.6 In-Region 不在のため必須 |
| Footnote | Source: CA-08 v2.6 §3 + ADR-4 |
| Canon | Custom layered architecture (canon に直接 match なし、C2-7 1 message で 12 layer 簡素化) |

---

#### S5 Flywheel + 3 層承認

| Field | Spec |
|---|---|
| Action title | 差戻し → staging → 手順承認 → 設定承認 の 5 段 flywheel で AI 学習を承認管理する |
| Hero visual | **2 横並び**: 左 5 phase circular flow (差戻し → staging → AI 日次分析 → 手順承認 → compiled 反映) / 右 3 層承認 RACI table (案件 / 手順 / 設定) |
| Left flywheel | 5 node circular arrow diagram、各 node に icon + 1 line description |
| Right RACI | Table-as-chart: 案件承認 (入力者 + 承認者) / 手順承認 (Manual 管理者 + 業務責任者) / 設定承認 (AI 管理者 + Type A/B/C co-A)、4-eyes SoD 強調 |
| Slogan callout | 「**AIに任せる量は段階的に増やすが、人によるコントロールは渡さない**」(CLAUDE.md Matrix B、24pt italic navy) |
| Footnote | Source: DOC-FW-01 §1-§7 + DOC-APP-02 §1-§9.8 + DM-07 §5.1 4-eyes trigger |
| Canon | C4-21 process flow + swimlane |

---

#### S6 規制 framework × control coverage

| Field | Spec |
|---|---|
| Action title | NYDFS Part 500 + FRB SR 11-7 + BSA-AML 含む 9 規制 framework を control matrix で逐条 mapping した |
| Hero visual | **table-as-chart heatmap** (9 framework × 5-6 主要 control) |
| Rows (9 framework) | Federal: FRB SR 11-7 / OCC SR 11-7 + 2023-17 / FFIEC IT + AIO / BSA-AML + USA PATRIOT / OFAC / GLBA + Reg P + Safeguards / SOX 404 // State: NYDFS Part 500 / NY SHIELD + CCPA-CPRA + State law |
| Cols (主要 control) | Encryption / Access control / Audit trail / Incident notification / Model governance / Data residency |
| Cell shading | Status icon: ✅ Counsel signed-off (現状 0) / 🔍 Counsel review pending (現状 大半) / ⏸ Draft mapping / ⚠ Gap identified (0) |
| Honne note | 現状の大半は **🔍 Draft mapping**、counsel sign-off は PFC-02 で取得 (90 day critical path)、本 deck は **control × evidence pointer mapping は完備、counsel sign-off は未取得** を明示 |
| Footnote | Source: DOC-CEM-12 v0.2 §2-§10 (counsel review input doc) |
| Canon | C4-23 table-as-chart + cell-level shading |

---

#### S7 Risk control matrix

| Field | Spec |
|---|---|
| Action title | Computer Use prompt injection + cross-tenant leak + audit tampering は 4 段防御で primary risk closure |
| Hero visual | **3×3 heatmap** (Likelihood × Impact)、9 cell が認知上限 (canon C4-22) |
| 9 risk plotted | (1) Computer Use prompt injection [Impact: H / Likelihood: M、mitigation: 4 段防御] / (2) Cross-tenant data leak (RLS bypass) [H / L、§5.10 column-level encryption] / (3) Audit chain tampering [H / L、§9 4 ring + cross-account] / (4) Bedrock model drift [M / M、§7.6 canary + rollback] / (5) Insider 共謀 [H / L、external audit] / (6) Aurora primary failure [M / M、Global DB + 30 min RTO] / (7) Supply chain (npm/container) [M / M、SBOM + cosign] / (8) KMS key compromise [H / VL、5 CMK 分離] / (9) DDoS at scale [M / L、WAF + Shield Std] |
| Color | Impact H + Likelihood H/M = alert red `#c93838`、其他 = primary navy gradient |
| Footnote | Source: DOC-TM-10 v0.1 §2-§7 + Residual risk register R1-R12 (§9) |
| Canon | C4-22 heatmap 9 cell |

---

### Act 3: Decision

---

#### S8 Cost / ROI

| Field | Spec |
|---|---|
| Action title | Mid scenario 月 ~$5,100、人件費 0.6-0.8 FTE 相当で breakeven、Phase 1 投資回収可能 |
| Hero visual | **bar chart**: 3 scenario (Low 50 case/day / Mid 300 / High 1000)、各 bar に主要 component 内訳 (Bedrock token / Aurora / Fargate / Observability / Network) を stacked |
| Bar values | Low ~$1,700/mo / Mid ~$5,100/mo / High ~$13,500/mo |
| Breakeven line | 横線で「FTE 1 名 $60-80k/yr ≒ $5-7k/mo」を overlay、Mid scenario が breakeven 領域に入ることを示す |
| Side annotation | Reserved / Savings Plan 1 year strategy で -28-32% 削減可能、Phase 1 cost approval gate (PFC-07) で実測 calibrate |
| Geo CRIS note | Sonnet 4.6 Geo CRIS overhead = $0-$500/mo safety margin (AWS internal billing、token unit price 同等) |
| Footnote | Source: CA-08 v2.6 §14.1-§14.6 + §14.6.7 Geo CRIS cost deep dive |
| Canon | C4-23 table-as-chart with cell shading |

---

#### S9 Pre-flight 7 項 + critical path

| Field | Spec |
|---|---|
| Action title | Phase 1 着手まで 7 件の外部 execution が必要、counsel review は 90 day lead time の critical path |
| Hero visual | **horizontal Gantt + dependency graph** (7 PFC item)、critical path を alert red で強調 |
| 7 PFC items (Gantt) | M1 (-90 day): PFC-02 counsel review **kick-off** [60-90 day duration、alert red 太線] // M2 (-60 day): PFC-03 Bedrock Geo CRIS verify [14 day] + PFC-04 CU isolation [14 day] // M3 (-30 day): PFC-05 TLS inspection [14 day] + PFC-06 warm pool 実測 [14 day] + PFC-07 token cost [30 day] // M4 (-7 day): PFC-02 counsel **final opinion** + PFC-01 bundle // M5 (Phase 1 着手): Type B 設定承認 + ops start |
| Critical path callout | PFC-02 が 60-90 day で他 PFC 全件の completion 条件、**M1 (-90 day) kick-off の意思決定が本日 sign-off の核** |
| Footnote | Source: DOC-PFC-09 v0.2 §3 統合 sign-off chain + §4 dependency graph |
| Canon | C4-21 process flow + C7-33 time-box marker + C7-38 next 30 days |

---

#### S10 Decision ask (本日 sign-off)

| Field | Spec |
|---|---|
| Action title | Type B 設定承認の prerequisite として、本日 6 設計 doc + 7 PFC plan の sign-off をいただきたい |
| Hero visual | **2 horizontal block** |
| Top block: **Decision items** | 3 行 checkbox: (1) ☐ 6 設計 doc (DM-07 / CA-08 / PFC-09 / TM-10 / SRE-11 / CEM-12) を Phase 1 hand-off Draft として承認 / (2) ☐ 7 PFC execution plan + critical path 承認 / (3) ☐ Next 30 day commitment (counsel firm 選定 + AWS sandbox provision) kick-off 承認 |
| Bottom block: **Sign-off table** | 4 行 × 3 列 (Role / Name / Date)、行 = AI 管理者 / Security 関係者 / 業務責任者 / **経営層 (final approver)**、空欄に signature line |
| Color | Decision items は navy、Sign-off table は alert red border (重要性 visual cue) |
| Footnote | Source: DOC-PFC-09 v0.2 §6 Type B 設定承認 agenda template |
| Canon | C7-38 decision point marker |

---

### Act 4: Close

---

#### S11 Roadmap (Three Horizons)

| Field | Spec |
|---|---|
| Action title | Phase 1 sprint 0 で CDK skeleton 起稿、12 month 内に UC-BO-01 本番投入を達成する |
| Hero visual | **Three Horizons diagram** (canon C4-20 / C5-25)、3 ascending curves on timeline |
| Horizon 1 (0-6 month、navy) | Phase 1 sprint 0 → CDK skeleton + counsel review + PFC sandbox 検証 + Type B 設定承認 + UC-BO-01 本投入 |
| Horizon 2 (6-12 month、navy lighter) | UC-BO-02 (口座開設書類完備) 追加 + multi-tenant 拡張 + Bedrock Knowledge Bases 評価 + Aurora DSQL active-active 検討 |
| Horizon 3 (12-24 month、neutral) | Autonomous tier 拡張 + JP parent layer (DOC-CA-09) cross-border data flow + 他業務 expand |
| Milestone marker | M1 (-90 day) / M4 (-7 day) / M5 (Phase 1 着手) / +6 month review / +12 month Phase 2 gate |
| Footnote | Source: CA-08 v2.6 §13 ADR + §17 open question + HANDOFF.md §5 Remaining work |
| Canon | C4-20 / C5-25 Three Horizons |

---

#### S12 Next 30 days commitment + review timing

| Field | Spec |
|---|---|
| Action title | 次 30 日で counsel firm 選定 + AWS sandbox provision、次回 review は Phase 1 -60 day |
| Hero visual | **30 day Gantt + owner**、5-7 milestone を時系列 plot |
| Activities (week 1-4) | W1: counsel firm bid request (3 firm 想定) → AWS account provision kick-off (Security 関係者) / W2: counsel firm 選定 + engagement letter (Compliance officer) → AWS sandbox provision 完了 (SRE) / W3: PFC-02 kickoff session (counsel + Compliance) → PFC-03 Bedrock model card archive (AI 管理者) / W4: PFC-04 + PFC-05 sandbox 構築開始 (Security + Network team) |
| Closing callout | **次回 board review: Phase 1 -60 day** (PFC-02 mid-review + cost approval gate session) |
| Footnote | Source: DOC-PFC-09 v0.2 §3 M1-M5 milestone + §4 dependency graph |
| Canon | C7-38 next 30 days close |

---

### Appendix

#### A1 Architecture detail

| Spec |
|---|
| Title: 12 layer + 13 ADR + Bedrock Geo CRIS data flow |
| Hero: detailed architecture diagram (L1-L8 + H1-H4) with all 13 ADR callout |
| Bedrock Geo CRIS data flow: Lambda (us-east-1) → Bedrock Runtime us-east-1 endpoint → `us.anthropic.claude-sonnet-4-6` Geo CRIS profile → us-east-1 / us-east-2 / us-west-2 routing |
| Source: CA-08 v2.6 §3-§13 |

#### A2 Residual risk register R1-R12

| Spec |
|---|
| Title: 12 residual risk (acceptable / ⚠ Phase 1 受容 / Phase 2 mitigation roadmap) |
| Hero: full R1-R12 table (Risk ID / description / acceptable status / Phase 2 mitigation) |
| Source: DOC-TM-10 v0.1 §9 |

#### A3 SLO/SLI + DR target

| Spec |
|---|
| Title: 5 SLO + RPO/RTO target (caveat: AWS spec typical / SLA ではない) |
| Hero: SLO table (Availability 99.9% / Inbox latency P95 / Approval latency P95 / AI proposal quality / Audit chain integrity) + DR target table with [仮説 / 要検証] label |
| **Caveat note (alert red)**: 全 RPO/RTO は **設計目標値 / Phase 1 sandbox 実測 calibration**、AWS Aurora Global DB replication は typical performance (per AWS docs)、SLA ではない |
| Source: DOC-SRE-11 v0.1 §2 + CA-08 v2.6 §15.1 |

#### A4 Cost model detail

| Spec |
|---|
| Title: Per-component cost + Geo CRIS overhead + Reserved / Savings Plan strategy |
| Hero: detailed cost breakdown table (16 component × 3 scenario) + Reserved / Savings Plan ROI table |
| Source: CA-08 v2.6 §14.1-§14.6 |

#### A5 NYDFS Part 500 全 23 section status

| Spec |
|---|
| Title: NYDFS 23 section × control × counsel review status |
| Hero: full §500.02 ~ §500.23 table with Status column (大半 Draft / 🔍 Review、PFC-02 で sign-off) |
| Source: DOC-CEM-12 v0.2 §2 |

#### A6 Anticipated Q&A (6 件)

| Q# | Anticipated question (例) |
|---|---|
| Q1 | Bedrock Sonnet 4.6 が In-Region 不在で Geo CRIS routing になるが、NYDFS 500.15 / GLBA data residency は本当に充足するか? |
| Q2 | Computer Use prompt injection が "primary risk" とのことだが、4 段防御の bypass scenario は想定済か? |
| Q3 | Phase 1 cost $5,100/mo (Mid) は楽観的ではないか? Bedrock token cost spike scenario の上限は? |
| Q4 | Counsel review 60-90 day は long、可能性 expedite は? |
| Q5 | 経営層 Type B 設定承認は 1 回でよいか、繰返し承認 frame は必要か? |
| Q6 | Phase 2 で multi-tenant 拡張時、本設計は再 design 必要か? |

各 Q に 2-3 sentence answer を pin、canon C7-36 anticipated Q&A catalog format。

---

## 5. Data Sources (claim verification)

各 slide の数値 / claim を verify する source pointer:

| Slide | Source file | Section |
|---|---|---|
| S2 | HANDOFF.md / CLAUDE.md | governing thought + slogan |
| S3 | DOC-PFC-09 v0.2 | §1 PFC catalog + §3 sign-off chain (lead time 60-90 day) |
| S4 | CA-08 v2.6 | §3.1 12 layer + §7.1 Bedrock Geo CRIS + §13 ADR-4 |
| S5 | DOC-FW-01 / DOC-APP-02 / DM-07 | Flywheel + 3 層承認 + §5.1 4-eyes |
| S6 | DOC-CEM-12 v0.2 | §2-§10 全 9 framework × control matrix |
| S7 | DOC-TM-10 v0.1 | §2 STRIDE + §3 AI/ML threat + §9 residual risk |
| S8 | CA-08 v2.6 | §14.1 cost table + §14.6.2 budget tier + §14.6.7 Geo CRIS overhead |
| S9 | DOC-PFC-09 v0.2 | §3 sign-off chain + §4 dependency graph |
| S10 | DOC-PFC-09 v0.2 | §6 Type B agenda template |
| S11 | CA-08 v2.6 + HANDOFF.md | §13 ADR + §17 open question + §5 Remaining work |
| S12 | DOC-PFC-09 v0.2 | §3 M1-M5 milestone |
| A1 | CA-08 v2.6 | §3-§13 全体 |
| A2 | DOC-TM-10 v0.1 | §9 R1-R12 |
| A3 | DOC-SRE-11 v0.1 / CA-08 §15 | SLO + DR target |
| A4 | CA-08 v2.6 | §14.1-§14.6 |
| A5 | DOC-CEM-12 v0.2 | §2 NYDFS Part 500 |
| A6 | DOC-PFC-09 / DOC-TM-10 / 本 brief | 6 Q&A items |

---

## 6. Anti-pattern Guardrails (canon C8a + project-specific)

### 6.1 Canon C8a 12 anti-pattern (回避必須)

| # | Anti-pattern | 本 deck での回避策 |
|---|---|---|
| 1 | Bullet wall slide | 各 slide 1 hero visual + supporting 3-5 bullet max |
| 2 | 'TBD' / 'Coming soon' on hero | 全 hero に確定 status / 数値、不確定は alert red qualifier 付き ([仮説 / 要検証]) |
| 3 | Multi-color palette overuse | 3-color strict (navy / red / grey)、4 色目禁止 |
| 4 | Briefing → Recommendation tone 混在 | S10 で明示 decision ask、それ以前は mechanism 説明、tone 切替を slide 間で linear |
| 5 | Action title が takeaway なし | 全 action title を S-V-O claim form、12-15 words、takeaway-first |
| 6 | So-what 不在 | 各 hero visual 後の footer bullet で 'So what' を pin |
| 7 | Footnote overload (10+ per slide) | 各 slide 主要 footnote 1-2 件 + appendix reference |
| 8 | Decision ask 不在 | S10 で明示、close (S12) で再確認 |
| 9 | Risk hidden in appendix | S7 で 9 risk heatmap、S3 で honne up-front、appendix A2 で詳細 |
| 10 | Honne / tatemae 不整合 | S3 で PFC + counsel 未取得を up-front、tatemae 隠さない |
| 11 | Pyramid trace fail (title-only readout 不能) | §2.1 で trace 確認済、title chain alone で governing thought 再生可能 |
| 12 | White space 不足 (>60% ink coverage) | C3-13 40% empty rule 維持、各 slide で margin + breathing room |

### 6.2 Project-specific guardrails

| # | Project-specific 禁則 | 理由 |
|---|---|---|
| 13 | 'design-complete / 完成' wording | 全 doc は `Phase 1 hand-off Draft` / Draft status、Cycle 16 で soften 済、HANDOFF.md §0 と整合 |
| 14 | 'primary regulator' 断定 | entity / license fact 依存、counsel 確認待ち、'NY 拠点で適用' 程度に hedge |
| 15 | NYDFS を Federal 行に置く | Doc 内では State 配置、本 brief / deck でも State 側 |
| 16 | RPO < 1 sec を SLA wording | AWS spec typical (per AWS docs)、SLA ではない、'< 1 sec target / Phase 1 実測 calibrate / [仮説 / 要検証]' に |
| 17 | '規制 mapping 完備' overstatement | CEM-12 control matrix は 'mapping 作成済'、counsel sign-off は未取得、'control × evidence pointer 完備、counsel review pending' に hedge |
| 18 | Tier 3 規制語 (具体 list は prior-art-map.md) | CLAUDE.md 規制語 hedge ルール準拠、事実主張禁止、`[ai-operator paper §X.Y 参照]` の hedge 表現 |

---

## 7. Production Checklist (Claude Design 側 execution)

### 7.1 Build steps

1. ☐ Reveal.js 5.x + Tailwind CDN single-file HTML を `demo/slides/exec-phase1-handoff.html` (or similar) に生成
2. ☐ 12 本編 slide + 6 appendix slide = 計 18 slide を本 brief §4 spec 通り build
3. ☐ Color palette / typography / layout を §3 visual design system に strict 準拠
4. ☐ 各 slide footer に `page X/12 · Source: [...] · Confidential` を pin
5. ☐ Hero visual は SVG inline (chart) or HTML table / CSS grid (heatmap / Gantt) で実装、external image asset は使わない (single-file 維持)
6. ☐ 印刷可能 (Reveal.js PDF export 互換)

### 7.2 Self-review checks (build 後 必須)

1. ☐ **Pyramid trace test** (canon C2-10): action title 12 個だけ並べて読み下し、governing thought 再生可能か confirm
2. ☐ **C8a 12 anti-pattern grep** (§6.1 全件): bullet wall / TBD / multi-color / multi-message 等の violation 0 件
3. ☐ **Project-specific guardrail grep** (§6.2 6 件): 'design-complete' / 'primary regulator' / 'RPO < 1 sec (SLA)' / '完備' 等の violation 0 件
4. ☐ **3-color check**: navy / red / grey 以外の color literal が CSS に 0 件 (`#fafaf8` background と `#f0f0ec` surface は許容)
5. ☐ **Action title length**: 全 12 title が 12-15 words ± 2 words 範囲
6. ☐ **40% empty rule**: 各 slide screenshot で ink coverage < 60% 確認
7. ☐ **Source citation**: 全数値 claim に footnote source pointer (CA-08 §X.Y / DM-07 §X.Y etc.)

### 7.3 User review handoff

1. ☐ Build 完了後、`demo/slides/exec-phase1-handoff.html` を browser で open + screenshot 18 枚 export
2. ☐ Screenshot pack を `demo/screenshots/exec-phase1-handoff/` に保存
3. ☐ Self-review check 結果 (7.2 全 7 項目) を 1-page report に summary
4. ☐ User review に hand-off (next: pixel polish + Q&A rehearsal)

---

## 8. File Naming + Delivery Format

| File | Path |
|---|---|
| HTML deck | `demo/slides/exec-phase1-handoff.html` |
| Screenshot pack | `demo/screenshots/exec-phase1-handoff/slide-{01..18}.png` |
| Self-review report | `demo/slides/exec-phase1-handoff-review.md` |
| Speaker notes (optional) | `demo/slides/exec-phase1-handoff-speakernotes.md` |

---

## 9. Context References (cold-start designer 用)

本 brief 単独で実行可能だが、深い理解が必要な場合の参照先:

- **Strategy canon**: `/Users/shinjifujiwara/code/shared/presentation-design/strategy-consulting-canon.md` (62 principle、cluster C1-C8)
- **Principles**: `/Users/shinjifujiwara/code/shared/presentation-design/principles-62.md`
- **Project CLAUDE.md**: `/Users/shinjifujiwara/code/active/backoffice-ai-v2/CLAUDE.md` (Tier 1/2/3 語彙 + slogan + scope-out)
- **Source docs (6)**: `docs/{07-data-model.md, 08-cloud-architecture.md, 09-pre-flight-execution-checklist.md, 10-threat-model.md, 11-sre-runbook.md, 12-compliance-evidence-matrix.md}`
- **HANDOFF.md**: `HANDOFF.md` (PR-ready review summary + Cycle 1-15 trace)
- **Reference deck (technical pattern)**: `demo/slides/session-4.html` (Day 22 Reveal.js + Tailwind CDN deck、同 stack)
- **PR**: https://github.com/ShinjiF1002/backoffice-ai-v2/pull/5 (本 design loop 全 commit)

---

## 10. 本 brief の改版履歴

- v0.1 (2026-05-25、Cycle 16 後 handoff、autonomous prod-ready loop 終結): 初版作成、12 + 6 slide spec + 3-color visual system + canon C8a 12 anti-pattern + project-specific 6 guardrail + 18 source pointer + production checklist + cold-start designer 参照
