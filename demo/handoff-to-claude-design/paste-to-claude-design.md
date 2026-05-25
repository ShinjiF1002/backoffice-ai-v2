# PASTE THIS ENTIRE FILE TO CLAUDE DESIGN (web chat)

> **本 file の使い方**: 本 file 全文 を Claude Design (claude.ai 等) の最初の message として paste すれば、cold-start で executive deck (HTML) build 可能。file path 参照ではなく content 内蔵、external 依存なし。
> **想定 build 時間**: 1-2 hr。
> **Output**: HTML deck 1 file + screenshot pack + self-review report。

---

## §A. INSTRUCTIONS (Claude Design への直接 prompt)

あなたは戦略コンサル経験を持つ deck design specialist です。以下の仕様に従って executive deck の HTML を build してください。

### A.1 Task
Backoffice AI v2 Phase 1 投入計画の executive deck を Reveal.js + Tailwind CDN single-file HTML で build する。

### A.2 Decision ask
本 deck で経営層に求める判断は **「Type B 設定承認の prerequisite として、本日 6 設計 doc + 7 PFC plan の sign-off」**。Recommendation tone、Act 1 (S3) で PFC + counsel 未取得を honne として up-front 開示。

### A.3 Audience
日本銀行 America division の CXO + Risk Committee、30 min keynote (説明 15 + Q&A 15)。

### A.4 Output
1. **HTML deck** (single-file、Reveal.js 5.1+ + Tailwind CDN)
2. **Self-review report** (build 後、§F production checklist の 7 check を全件 self-verify)
3. 不明点があれば最初に質問、ただし本 file 単独で build 可能な setup になっている。

### A.5 Strict constraint
以下は絶対遵守:
- **「完成 / production-ready」wording 禁止**: 全 doc は Draft、本投入は Type B 承認後
- **NYDFS Part 500 は State 規制** (Federal ではない)、混同しない
- **RPO は "target / [仮説 / 要検証] / Phase 1 実測 calibrate"** wording、SLA ではない
- **「規制 mapping 完備」overstatement 禁止**、「control × evidence pointer mapping 作成済、counsel sign-off pending」に hedge
- **3-color strict**: `#1a3a52` navy / `#c93838` red / `#8a8a8a` grey、4 色目禁止
- **40% empty rule**: 各 slide で white space 40% 以上維持
- **1 slide 1 message**: bullet wall 禁止、各 slide 1 hero visual

---

## §B. SLIDE-BY-SLIDE SPEC (本編 12 + Appendix 6 = 計 18)

### B.0 Pyramid trace test (titles-only readout で governing thought 再生確認)

S2 → S12 の action title だけで読み下すと:

> 業務確認を減らし AI 設定承認は強化する仕組みを Phase 1 で投入したい → なぜなら業務量増 + AI 規制強化が同時進行 → そのため 12 layer cloud + 47 entity data model を作った → 5 段 flywheel で AI 学習を承認管理 + 9 規制 framework を control matrix で mapping + 4 段防御で primary risk closure → コストは breakeven 可能だが 7 件の外部 execution + 90 day counsel critical path が必要 → よって本日 prerequisite sign-off をいただきたい → 決まれば CDK skeleton + 12 month で本投入 + 30 日後 review timing 確定

→ governing thought 完全再生。**build 後の self-review でこの readout を必ず再確認**。

### B.1 Act 1 — Intro (S1-S3、SCQA + honne up-front)

---

#### **S1 Cover**

| Field | Spec |
|---|---|
| Header (slogan) | **「案件確認は減らす、ルール承認は残す。」** (48pt bold navy) |
| Subtitle | Backoffice AI v2 Phase 1 投入計画 — Type B 設定承認 Prerequisite Sign-off |
| Meta | 経営層 review session / Confidential / Internal |
| Layout | 中央配置、minimal、navy + grey、no chart |

---

#### **S2 Governing thought**

| Field | Spec |
|---|---|
| Action title (28pt bold) | 業務確認を減らし AI 設定承認は強化する仕組みを Phase 1 で投入、本日その prerequisite を求める |
| Hero (center) | 1 文 thesis box (中央 48pt navy)、下に 3 pillar horizontal box |
| 3 pillar | (1) 差戻し → staging → 手順承認 → 設定承認 の 5 段 flywheel / (2) 案件確認 + AI 設定変更 の 3 層承認 (Type A/B/C) / (3) 9 規制 framework を control matrix で逐条 mapping |
| Footer footnote | 出典: 設計 SSOT (6 doc) + HANDOFF.md |

---

#### **S3 SCQA + Honne disclosure**

| Field | Spec |
|---|---|
| Action title (28pt bold) | 業務量増 + AI 規制強化の同時進行に、PFC 7 項 + counsel sign-off を経て Phase 1 投入が必要 |
| Hero | **2-column layout**: 左 SCQA box (4 stacked card)、右 honne disclosure box (alert red border `#c93838`) |
| Left SCQA cards | **Situation**: 米州本邦銀行 backoffice の案件量増 + cost 構造、人手 review の限界 / **Complication**: AI 規制 (FRB SR 11-7 model risk / NYDFS Part 500 cybersecurity) 強化 + 競合 AI 投入加速 / **Question**: AI 自動化を「人間 control 下」で本投入するか / **Answer**: Yes、ただし prerequisite sign-off が前提 |
| Right honne box (alert red) | ⚠ **本投入決定の前に必要なもの** / (a) PFC 7 項 完了 (60-90 day) / (b) external counsel sign-off (PFC-02 が critical path) / (c) 経営層 Type B 設定承認 / **本日はその (c) prerequisite を求める** |
| Footer footnote | 出典: PFC-09 §1-§3 (7 PFC item + critical path) |

---

### B.2 Act 2 — Mechanism (S4-S7、何を作ったか / どう統制するか)

---

#### **S4 System architecture**

| Field | Spec |
|---|---|
| Action title (28pt bold) | AWS 12 layer cloud + 47 entity data model + Bedrock Geo CRIS で AI を人間 control 下に維持する |
| Hero | **12 layer stack diagram**、top → bottom |
| Layer stack | (1) User / Engineer → (2) H4 Frontend (S3 + CloudFront + WAF、9 画面 SPA) → (3) L5 API Gateway (HTTP + WebSocket) → (4) L3 Compute (Lambda + Fargate Computer Use sandbox + Step Functions) → (5) **L4 AI Runtime: Bedrock Claude Sonnet 4.6 Geo CRIS + Haiku 4.5 us-east-1 In-Region** [alert red box で highlight] → (6) L6 Persistence (Aurora PG 16 + S3 Object Lock + KMS + OpenSearch + pgvector) |
| Right sidebar (vertical) | L1 Identity (Cognito + IAM Identity Center) / L7 Observability (CloudWatch + X-Ray) / L8 CI/CD (CDK + GitHub Actions + Liquibase) / H1 Security baseline (SCP + GuardDuty + Macie) / H2 DR (us-east-1 + us-west-2 Aurora Global DB) / H3 Cost (Cost Explorer + Budgets) |
| Key callout (右下) | **Bedrock Geo CRIS** = US geography 内 routing (us-east-1 / us-east-2 / us-west-2)、Sonnet 4.6 In-Region 不在のため必須、data residency は US geography 単位で counsel sign-off pending |
| Footer footnote | 出典: CA-08 §3 (12 layer) + §7.1 (Bedrock) + §13 ADR-4 |

---

#### **S5 Flywheel + 3 層承認**

| Field | Spec |
|---|---|
| Action title (28pt bold) | 差戻し → staging → 手順承認 → 設定承認 の 5 段 flywheel で AI 学習を承認管理する |
| Hero | **2 横並び**: 左 5 phase circular flow / 右 3 層承認 RACI table |
| Left flywheel | 5 node circular arrow: (1) 差戻し記録 → (2) staging ナレッジ蓄積 (未承認ヒント) → (3) AI 日次分析 + 改善提案 → (4) 手順承認 → (5) compiled 反映 → (1 へ戻る) |
| Right RACI table | 3 row × 4 col: 列 = 承認種別 / Proposal source / Owner (R) / Approver (A) / Type / 反映 // 案件承認 (入力者 + 承認者 4-eyes) / 手順承認 (AI 自動生成 → 業務責任者承認) / 設定承認 (AI 管理者 + Type A/B/C co-A) |
| Slogan callout (24pt italic navy) | 「**AI に任せる量は段階的に増やすが、人によるコントロールは渡さない**」 |
| Footer footnote | 出典: 01-flywheel-and-knowledge §1-§7 + 02-approval-model §1-§9 + DM-07 §5.1 4-eyes trigger |

---

#### **S6 規制 framework × control coverage**

| Field | Spec |
|---|---|
| Action title (28pt bold) | NYDFS Part 500 + FRB SR 11-7 + BSA-AML を含む 9 規制 framework を control matrix で逐条 mapping した |
| Hero | **table-as-chart heatmap** (9 規制 framework × 6 主要 control) |
| Rows (9 framework、Federal 8 + State 1 group) | (Federal) FRB SR 11-7 model risk / OCC SR 11-7 + 2023-17 third-party / FFIEC IT + AIO / BSA-AML + USA PATRIOT 326 / OFAC / GLBA + Reg P + Safeguards / SOX 404 // (State) NYDFS Part 500 / State law family (NY SHIELD + CCPA-CPRA + VA + CO + CT + UT + IL BIPA + WA) |
| Cols (6 control) | Encryption / Access control / Audit trail / Incident notification / Model governance / Data residency |
| Cell status icon | ✅ Counsel signed-off (現状 0) / 🔍 Counsel review pending (大半) / ⏸ Draft mapping (一部) / ⚠ Gap identified (0) |
| Honne note (下) | 現状の大半は **🔍 Draft mapping / counsel review pending**、最終 verify は PFC-02 で取得 (90 day critical path)。**control × evidence pointer mapping は作成済、counsel sign-off は未取得** |
| Footer footnote | 出典: CEM-12 §2-§10 (counsel review input doc、status 列で各 cell 状態を pin) |

---

#### **S7 Risk control matrix**

| Field | Spec |
|---|---|
| Action title (28pt bold) | Computer Use prompt injection + cross-tenant leak + audit tampering は 4 段防御で primary risk closure |
| Hero | **3×3 heatmap** (Y軸 Impact × X軸 Likelihood)、9 risk plot、9 cell が認知上限 |
| 9 risk plotted | (a) Computer Use prompt injection [High Impact / Medium Likelihood、mitigation: 4 段防御 = action allowlist + pre-action confirmation + tenant cross-contamination check + screenshot redaction] / (b) Cross-tenant data leak (RLS bypass) [H / L、§5.10 column-level KMS DataKey-per-tenant] / (c) Audit chain tampering [H / L、§9 4 ring 防御 + cross-account S3 Object Lock] / (d) Bedrock model drift [M / M、canary 5% → promote → rollback] / (e) Insider 共謀 [H / L、external audit quarterly] / (f) Aurora primary failure [M / M、Global DB + 30 min RTO target] / (g) Supply chain (npm/container) [M / M、SBOM + cosign] / (h) KMS key compromise [H / VL、5 CMK 分離 + multi-Region] / (i) DDoS at scale [M / L、WAF + Shield Std] |
| Color rule | Impact High + Likelihood H/M = alert red `#c93838`、其他 = navy gradient |
| Bottom row | Residual risk register R1-R12 への bridge note (Appendix A2 で詳述) |
| Footer footnote | 出典: TM-10 §2 STRIDE + §3 AI/ML threat + §7 abuse case + §9 residual risk |

---

### B.3 Act 3 — Decision (S8-S10、何を決めるか)

---

#### **S8 Cost / ROI**

| Field | Spec |
|---|---|
| Action title (28pt bold) | Mid scenario 月 ~$5,100、人件費 0.6-0.8 FTE 相当で breakeven、Phase 1 投資回収可能 |
| Hero | **stacked bar chart** (3 scenario × 主要 component) |
| Bar 1 (Low、50 case/day) | ~$1,700/mo: Aurora $100 + Bedrock Sonnet $200 + Bedrock CU re-est $300 + Fargate $100 + その他 $1,000 |
| Bar 2 (Mid、300 case/day) | ~$5,100/mo: Aurora $300 + Bedrock Sonnet $1,200 + Bedrock CU re-est $1,400 + Fargate $300 + その他 $1,900 |
| Bar 3 (High、1000 case/day) | ~$13,500/mo: Aurora $800 + Bedrock Sonnet $4,000 + Bedrock CU re-est $3,000 + Fargate $800 + その他 $4,900 |
| Breakeven overlay | 横線で「FTE 1 名 $60-80k/yr ≒ $5-7k/mo」を overlay、Mid scenario が breakeven 領域 |
| Side panel (右) | Reserved / Savings Plan 1 year strategy で **-28-32% 削減可能**、Phase 1 cost approval gate (PFC-07) で実測 calibrate |
| Geo CRIS note (下) | Sonnet 4.6 Geo CRIS overhead = $0-$500/mo safety margin (AWS internal billing、token unit price 同等) |
| Footer footnote | 出典: CA-08 §14.1 cost table + §14.6 FinOps governance + §14.6.7 Geo CRIS cost deep dive |

---

#### **S9 Pre-flight 7 項 + critical path**

| Field | Spec |
|---|---|
| Action title (28pt bold) | Phase 1 着手まで 7 件の外部 execution が必要、counsel review は 90 day lead time の critical path |
| Hero | **horizontal Gantt + dependency graph** (7 PFC item)、critical path を alert red 太線で強調 |
| Timeline columns | M1 (-90 day) → M2 (-60 day) → M3 (-30 day) → M4 (-7 day) → M5 (Phase 1 着手) |
| Bars (7 PFC item) | (1) PFC-02 counsel review [**M1 → M4 = 60-90 day、alert red 太線**] / (2) PFC-03 Bedrock Geo CRIS verify [M1 → M2、14 day、navy] / (3) PFC-04 Computer Use isolation [M2 → M3、14 day] / (4) PFC-05 TLS inspection [M2 → M3、14 day] / (5) PFC-06 warm pool 実測 [M2 → M3、14 day] / (6) PFC-07 token cost re-estimate [M2 → M4、30 day] / (7) PFC-01 hand-off package bundle [M4 のみ、1-2 day] |
| Critical path callout | PFC-02 が 60-90 day で他 PFC 全件の completion 条件、**M1 (-90 day) kick-off の意思決定が本日 sign-off の核**。Counsel firm 選定 + engagement letter 開始から逆算 |
| Footer footnote | 出典: PFC-09 §3 統合 sign-off chain + §4 dependency graph |

---

#### **S10 Decision ask (本日 sign-off)**

| Field | Spec |
|---|---|
| Action title (28pt bold) | Type B 設定承認の prerequisite として、本日 6 設計 doc + 7 PFC plan の sign-off をいただきたい |
| Hero | **2 horizontal block** |
| Top block (navy): **Decision items 3 個** | ☐ (1) 6 設計 doc (DM-07 / CA-08 / PFC-09 / TM-10 / SRE-11 / CEM-12) を Phase 1 hand-off Draft として承認 / ☐ (2) 7 PFC execution plan + critical path (PFC-02 = 90 day) 承認 / ☐ (3) Next 30 day commitment (counsel firm 選定 + AWS sandbox provision) kick-off 承認 |
| Bottom block (alert red border): **Sign-off table** | 4 row × 3 col: Role / Name / Date 列、行 = AI 管理者 / Security 関係者 / 業務責任者 / **経営層 (final approver)**、各行に signature line |
| Visual emphasis | Decision items は navy box、Sign-off table は alert red border で重要性 visual cue |
| Footer footnote | 出典: PFC-09 §6 Type B 設定承認 agenda template |

---

### B.4 Act 4 — Close (S11-S12、決めた後 30 日)

---

#### **S11 Roadmap (Three Horizons)**

| Field | Spec |
|---|---|
| Action title (28pt bold) | Phase 1 sprint 0 で CDK skeleton 起稿、12 month 内に UC-BO-01 本番投入を達成する |
| Hero | **Three Horizons diagram**、X軸 timeline / Y軸 maturity、3 ascending curves |
| Horizon 1 (0-6 month、navy 濃) | Phase 1 sprint 0 → CDK skeleton + counsel review (PFC-02) + PFC sandbox 検証 (PFC-03~07) + Type B 設定承認 + UC-BO-01 (法人住所変更) 本投入 |
| Horizon 2 (6-12 month、navy 中) | UC-BO-02 (口座開設書類完備) 追加 + multi-tenant 拡張 + Bedrock Knowledge Bases 評価 + Aurora DSQL active-active 検討 |
| Horizon 3 (12-24 month、navy 薄) | Autonomous tier 拡張 + JP parent layer (DOC-CA-09) cross-border data flow + 他業務 expand |
| Milestone marker (vertical line) | M1 (-90 day) / M4 (-7 day) / M5 (Phase 1 着手) / +6 month review / +12 month Phase 2 gate |
| Footer footnote | 出典: CA-08 §13 ADR + §17 open question + HANDOFF.md §5 Remaining work |

---

#### **S12 Next 30 days commitment + review timing**

| Field | Spec |
|---|---|
| Action title (28pt bold) | 次 30 日で counsel firm 選定 + AWS sandbox provision、次回 review は Phase 1 -60 day |
| Hero | **30 day Gantt + owner**、5-7 milestone を 4 week timeline に plot |
| Week 1 | counsel firm bid request (3 firm 想定) [Compliance officer] / AWS account provision kick-off [Security 関係者] |
| Week 2 | counsel firm 選定 + engagement letter [Compliance officer] / AWS sandbox provision 完了 [SRE] |
| Week 3 | PFC-02 kickoff session (counsel + Compliance) / PFC-03 Bedrock model card archive [AI 管理者] |
| Week 4 | PFC-04 + PFC-05 sandbox 構築開始 [Security + Network team] |
| Closing callout (alert red box) | **次回 board review: Phase 1 -60 day** (PFC-02 mid-review + cost approval gate session) |
| Footer footnote | 出典: PFC-09 §3 M1-M5 milestone + §4 dependency graph |

---

### B.5 Appendix (A1-A6、deep-dive 質疑用)

| # | 内容 spec |
|---|---|
| **A1 Architecture detail** | 12 layer + 13 ADR + Bedrock Geo CRIS data flow 詳細図。Bedrock data flow: Lambda (us-east-1) → Bedrock Runtime us-east-1 endpoint → `us.anthropic.claude-sonnet-4-6` Geo CRIS profile → us-east-1 / us-east-2 / us-west-2 内 routing |
| **A2 Residual risk register R1-R12** | 12 risk × (description / acceptable status / Phase 2 mitigation roadmap) table。Phase 1 受容 (⚠) と Phase 2 mitigation 計画を visual に分離 |
| **A3 SLO/SLI + DR target (caveat 付き)** | 5 SLO (Availability 99.9% / Inbox latency P95 / Approval latency P95 / AI proposal quality / Audit chain integrity 100%) + DR target table (RPO < 1 sec target、各行 [仮説 / 要検証] label)。 **Caveat (alert red box)**: 全 RPO/RTO は設計目標値、AWS Aurora Global DB は typical performance per AWS docs、SLA ではない |
| **A4 Cost model detail** | 16 component × 3 scenario stacked breakdown table。Per-component breakdown + Reserved / Savings Plan ROI table |
| **A5 NYDFS Part 500 全 23 section status** | §500.02 ~ §500.23 table、各 row に Status icon (大半 Draft mapping / 🔍 Counsel review pending)。**特に focus**: §500.02 program / §500.06 audit trail (5yr) / §500.12 MFA / §500.15 encryption / §500.17 incident notification 72hr / §500.22 annual certification |
| **A6 Anticipated Q&A 6 件** | (Q1) Bedrock Sonnet 4.6 が In-Region 不在で Geo CRIS routing、NYDFS 500.15 / GLBA data residency は本当に充足するか? → (A1) US geography 単位で counsel sign-off pending、PFC-02 acceptance condition #2 強化、Geo CRIS は AWS internal で US geography 外に出ない / (Q2) Computer Use prompt injection が "primary risk"、4 段防御の bypass scenario は想定済か? → (A2) PFC-04 で 5 attack scenario sandbox 実証 (URL-based / OCR-based / instruction override / tenant switching / exfiltration)、Bedrock Guardrails で補強 / (Q3) Mid scenario $5,100/mo は楽観的か? Bedrock token cost spike scenario は? → (A3) Cost Anomaly Detection + Tier 1-4 budget alert + per-tenant tag、Tier 4 hard cap = budget × 1.2 で manual approval mode / (Q4) Counsel review 60-90 day、expedite は? → (A4) Phase 1 -90 day から並行で 3 firm bid + 既存 AWS counsel pre-engagement 推奨 / (Q5) Type B 承認は 1 回で済むか? → (A5) 6 doc + 7 PFC bundle で 1 回、ただし PFC-04 (prompt injection) + PFC-07 (cost) は実測後の追加 ratification 想定 / (Q6) Phase 2 multi-tenant 拡張で再 design 必要か? → (A6) DM-07 §5.10 row-level encryption + CA-08 §14A tenant onboarding/offboarding SOP で multi-tenant 対応設計済、Phase 2 で activation のみ |

---

## §C. VISUAL DESIGN SYSTEM

### C.1 Color palette (3-color strict)

```css
/* Tailwind config extension */
colors: {
  navy: '#1a3a52',         /* primary、header / title / chart main */
  'navy-light': '#2d5a7d', /* hover / lighter shade */
  'navy-soft': '#e8eef3',  /* surface tint */
  red: '#c93838',          /* alert / decision ask / critical path */
  'red-soft': '#fbe8e8',   /* alert background */
  grey: '#8a8a8a',         /* body / supporting / footnote */
  'grey-light': '#bababa',
  canvas: '#fafaf8',       /* slide background (off-white) */
  surface: '#f0f0ec',      /* panel / table row alt */
}
```

**禁則**: 4 色目 (緑 / 紫 / 黄 etc.) の使用。heatmap で gradation 必要時は navy の opacity 段階 (`#1a3a52` 100% → 60% → 30%) で表現。

### C.2 Typography (canon C3-11)

| Element | Font-family | Size | Weight | Use |
|---|---|---|---|---|
| Action title | Inter, Noto Sans JP | 28pt (1.75rem) | Bold (700) | header zone |
| Subtitle / section | Inter, Noto Sans JP | 16pt | SemiBold (600) | section label |
| Body | Inter, Noto Sans JP | 18pt | Regular (400) | content |
| Data emphasis | Inter | 36-48pt | Bold (700) | KPI numbers |
| Footer / footnote | Inter, Noto Sans JP | 10-12pt | Regular (400) | citation |
| Citation mono | JetBrains Mono | 10pt | Regular | code / case_id |

```css
.reveal {
  font-family: 'Inter', 'Noto Sans JP', system-ui, sans-serif;
  font-size: 18px;
  background-color: #fafaf8;
  color: #1a3a52;
}
.reveal h1 { font-size: 48px; font-weight: 700; }  /* Cover slogan */
.reveal h2 { font-size: 28px; font-weight: 700; }  /* Action title */
.reveal h3 { font-size: 16px; font-weight: 600; }  /* Section label */
.reveal p  { font-size: 18px; line-height: 1.6; color: #1a3a52; }
.reveal .footer { font-size: 11px; color: #8a8a8a; }
```

### C.3 Layout (canon C3-13 + C3-15)

```
┌────────────────────────────────────────────────┐ ← 16:9 (1920×1080)
│  HEADER ZONE (15% top、padding 80px)            │
│  Action title 28pt bold (12-15 words)           │
│  ────  (2px navy underline、60px width)         │
├────────────────────────────────────────────────┤
│  HERO ZONE (60% middle)                          │
│                                                  │
│        SINGLE HERO VISUAL                        │
│        (centered、white space 40% 維持)          │
│                                                  │
├────────────────────────────────────────────────┤
│  FOOTER ZONE (15% bottom)                        │
│  Supporting data points (3-5 bullets max)        │
│  ──── page X/12 · Source: [...] · Confidential   │
└────────────────────────────────────────────────┘
   ← 10% L margin           15% R margin →
```

- **40% empty rule** (canon C3-13): 各 slide で ink coverage < 60% を維持
- **Asymmetric margin**: 10% L / 15% R で右側 visual balance
- **No animation within slide**: distraction 排除
- **Transition**: `fade` のみ

---

## §D. ANTI-PATTERN GUARDRAILS (18 件、build 後 self-review で全件 check)

### D.1 Canon C8a 12 anti-pattern

1. ☐ **Bullet wall slide 禁止**: 各 slide 1 hero visual + supporting 3-5 bullet max、bullet 10+ は violation
2. ☐ **'TBD' / 'Coming soon' on hero 禁止**: 全 hero に確定 status / 数値、不確定は alert red qualifier 付き ([仮説 / 要検証])
3. ☐ **Multi-color palette overuse 禁止**: 3-color strict (navy / red / grey)、4 色目 (緑 / 紫 / 黄) 0 件
4. ☐ **Briefing → Recommendation tone 混在 禁止**: S10 で明示 decision ask、それ以前は mechanism、tone 切替を slide 間で linear
5. ☐ **Action title が takeaway なし 禁止**: 全 action title を S-V-O claim form、12-15 words、takeaway-first
6. ☐ **So-what 不在 禁止**: 各 hero visual 後の footer bullet で 'So what' を pin
7. ☐ **Footnote overload (10+ per slide) 禁止**: 各 slide 主要 footnote 1-2 件 + appendix reference
8. ☐ **Decision ask 不在 禁止**: S10 で明示、close (S12) で再確認
9. ☐ **Risk hidden in appendix 禁止**: S7 で 9 risk heatmap、S3 で honne up-front、appendix A2 で詳細
10. ☐ **Honne / tatemae 不整合 禁止**: S3 で PFC + counsel 未取得を up-front、tatemae 隠さない
11. ☐ **Pyramid trace fail 禁止**: title-only readout で governing thought 再生可能か confirm
12. ☐ **White space 不足 (>60% ink coverage) 禁止**: 40% empty rule 維持

### D.2 Project-specific 6 guardrail

13. ☐ **'design-complete / 完成' wording 禁止**: 全 doc は `Phase 1 hand-off Draft` / Draft status
14. ☐ **'primary regulator' 断定 禁止**: entity / license fact 依存、counsel 確認待ち、'NY 拠点で適用' 程度に hedge
15. ☐ **NYDFS を Federal 行に置く 禁止**: NYDFS は State 規制、必ず State 配置
16. ☐ **RPO < 1 sec を SLA wording 禁止**: AWS spec typical (per AWS docs)、'< 1 sec target / Phase 1 実測 calibrate / [仮説 / 要検証]' に
17. ☐ **'規制 mapping 完備' overstatement 禁止**: 'control × evidence pointer mapping 作成済、counsel sign-off pending' に hedge
18. ☐ **Tier 3 規制語の事実主張 禁止**: `[ai-operator paper §X.Y 参照]` の hedge 表現、Session 4 表層には完全に出さない

---

## §E. PRODUCTION CHECKLIST (build 後 必須実行)

### E.1 Build steps (5)

1. ☐ Reveal.js 5.x + Tailwind CDN single-file HTML を build (output filename: `exec-phase1-handoff.html` 推奨)
2. ☐ 12 本編 slide + 6 appendix slide = 計 18 slide を §B spec 通り build
3. ☐ Color palette / typography / layout を §C に strict 準拠
4. ☐ 各 slide footer に `page X/12 · Source: [...] · Confidential` を pin
5. ☐ Hero visual は **SVG inline** (chart) or **HTML table / CSS grid** (heatmap / Gantt) で実装、external image asset は使わない (single-file 維持)

### E.2 Self-review check (7、build 後必須)

1. ☐ **Pyramid trace test** (canon C2-10): action title 12 個だけで §B.0 readout 再生可能か confirm
2. ☐ **C8a 12 anti-pattern grep** (§D.1 全件): violation 0 件
3. ☐ **Project-specific 6 guardrail grep** (§D.2 全件): violation 0 件
4. ☐ **3-color check**: navy / red / grey 以外の color literal が CSS に 0 件 (canvas `#fafaf8` + surface `#f0f0ec` は許容)
5. ☐ **Action title length**: 全 12 title が 12-15 words ± 2 words 範囲
6. ☐ **40% empty rule**: 各 slide screenshot で ink coverage < 60% (目視 or screenshot pixel analysis)
7. ☐ **Source citation**: 全数値 claim に footnote source pointer

### E.3 Self-review report format

build 完了後、以下 format で self-review report を出力:

```markdown
# Exec Deck Self-Review Report

## E.2 7 check 結果
1. Pyramid trace test: ✅ / ⚠ / ❌ + 詳細
2. C8a 12 anti-pattern: ✅ all clear / ⚠ N 件 violation (list)
3. Project-specific 6: ✅ / ⚠ / ❌
4. 3-color check: ✅ / ⚠ N color literal 検出
5. Action title length: ✅ / ⚠ N title が 12-15 words 範囲外
6. 40% empty rule: ✅ / ⚠ N slide で ink coverage > 60%
7. Source citation: ✅ / ⚠ N claim で footnote 欠

## 残課題 / Open question (user review 用)
- ...

## Build summary
- Total slides: 18 (本編 12 + appendix 6)
- File size: ~XXX KB
- Reveal.js version: 5.x.x
- Tailwind version: CDN (latest)
```

---

## §F. REFERENCE HTML PATTERN (Reveal.js + Tailwind CDN skeleton)

以下を base として **必要に応じて** style / structure を expand。本 skeleton は **technical pattern reference**、§C の visual design system が prevailing spec。

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=1920, initial-scale=1.0" />
  <title>Backoffice AI v2 — Phase 1 投入計画 (Exec Deck)</title>

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
      padding: 80px 100px 80px 80px;  /* T R B L = 10% L / 15% R margin */
      box-sizing: border-box;
      height: 100%;
      background-color: #fafaf8;
    }
    .reveal h1 {
      font-size: 48px; font-weight: 700; line-height: 1.15;
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

    /* 3-pillar / 2-column / etc. utility classes via Tailwind */
  </style>
</head>

<body>
  <div class="reveal">
    <div class="slides">

      <!-- ============================================================
           S1 Cover (no h2、center slogan)
           ============================================================ -->
      <section data-transition="fade">
        <div class="h-full flex flex-col items-center justify-center text-center">
          <h1 class="text-navy text-7xl mb-8 leading-tight">
            案件確認は減らす、<br/>ルール承認は残す。
          </h1>
          <p class="text-grey text-xl mb-4">Backoffice AI v2 Phase 1 投入計画</p>
          <p class="text-navy text-lg font-semibold">Type B 設定承認 Prerequisite Sign-off</p>
        </div>
        <div class="footer">
          <span>経営層 review session</span>
          <span>Confidential / Internal</span>
        </div>
      </section>

      <!-- ============================================================
           S2 Governing thought (3 pillar)
           ============================================================ -->
      <section data-transition="fade">
        <h2>業務確認を減らし AI 設定承認は強化する仕組みを Phase 1 で投入、本日その prerequisite を求める</h2>

        <div class="mt-8 text-center">
          <div class="inline-block bg-navy-soft px-8 py-6 rounded-lg max-w-3xl">
            <p class="text-navy text-3xl font-bold leading-relaxed">
              「人に任せる量は段階的に増やすが、<br/>人によるコントロールは渡さない」
            </p>
          </div>
        </div>

        <div class="mt-12 grid grid-cols-3 gap-6">
          <div class="bg-white border-2 border-navy-soft rounded-lg p-5">
            <h3 class="text-navy">差戻し flywheel</h3>
            <p class="text-sm text-grey">差戻し → staging → 手順承認 → 設定承認 の 5 段</p>
          </div>
          <div class="bg-white border-2 border-navy-soft rounded-lg p-5">
            <h3 class="text-navy">3 層承認</h3>
            <p class="text-sm text-grey">案件 / 手順 / 設定承認、Type A/B/C SoD</p>
          </div>
          <div class="bg-white border-2 border-navy-soft rounded-lg p-5">
            <h3 class="text-navy">9 規制 framework</h3>
            <p class="text-sm text-grey">control matrix で逐条 mapping、counsel sign-off pending</p>
          </div>
        </div>

        <div class="footer">
          <span>出典: 設計 SSOT (6 doc) + HANDOFF.md</span>
          <span class="slide-number">2 / 12</span>
        </div>
      </section>

      <!-- ============================================================
           S3-S12 + A1-A6 同 pattern で expand
           各 slide で:
             - <section data-transition="fade">
             - <h2> action title (28pt bold navy + 2px navy underline)
             - hero visual (table / heatmap / Gantt / Three Horizons etc.)
             - <div class="footer"> page X/12 + source + confidential
           ============================================================ -->

      <!-- ... (S3 through S12, then A1-A6) ... -->

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

**Hero visual implementation hints** (Tailwind + HTML / SVG):
- **3×3 heatmap (S7)**: `<div class="grid grid-cols-3 gap-2">` + 各 cell に背景 navy/red opacity と label
- **Gantt (S9 / S12)**: `<div class="grid grid-cols-5">` (M1-M5 column) + `<div class="col-span-N bg-navy / bg-red h-8">` で bar
- **Three Horizons (S11)**: SVG inline path で 3 ascending curves、CSS で X axis label
- **Stacked bar (S8)**: `<div class="flex flex-col">` + 各 segment を `<div class="bg-navy h-X w-full">` で stack
- **Table-as-chart (S6)**: `<table class="w-full">` + 各 cell に icon (✅ 🔍 ⏸ ⚠) と背景 tint

---

## §G. CANON PRINCIPLE GLOSSARY (B-D 章で使用された参照、cold-start 用)

| Ref | 1-line explanation |
|---|---|
| C1-2 SCQA | Situation → Complication → Question → Answer の 4 段 pre-amble。Act 1 narrative arc の core pattern |
| C1-5 4-act | Workshop / executive deck の narrative arc: Intro → Mechanism → Decision → Close |
| C2-6 Action title | 12-15 words、claim form S-V-O、takeaway-first。bullet 形式ではない |
| C2-7 1 slide 1 message | Singleton test、1 slide に 1 message 以外載せない |
| C2-10 Pyramid trace test | Ship gate: action title だけ読み下しで governing thought 再生可能か confirm |
| C3-11 Typography | Action title 24-28pt bold、body 16-18pt、footer 10-12pt |
| C3-12 3-color rule | Primary + Accent + Neutral の 3 色のみ、4 色目禁止 |
| C3-13 White space | 10-15% safe margin + 40% empty rule (ink coverage < 60%) |
| C3-14 Footer | page number + source + footnote symbol chain |
| C3-15 Header | Action title above hero、section tracker 任意 |
| C4-20 Three Horizons | Baghai 1999 roadmap canonical、3 ascending curves on timeline |
| C4-21 Process flow | 4-5 step max + swimlane for actor 表現 |
| C4-22 Heatmap | 3×3 or 5×5 canonical、9 cell が認知上限 |
| C4-23 Table-as-chart | Cell-level shading + 1 highlight row |
| C5-26 Recommendation tone | Briefing tone (情報共有) と区別、明示 decision ask 必須 |
| C6-31 Honne / Tatemae | Internal alignment deck で本音 (honne) を up-front、tatemae 隠さない |
| C7-36 Anticipated Q&A | Appendix に 5-7 件 catalog、discussion-trigger 想定 |
| C7-38 Decision point marker | "Next 30 days" close convention で具体 action commit |
| C8a 12 anti-pattern | §D.1 12 件 (bullet wall / TBD / multi-color / etc.) |

---

## §H. 完了条件

build 完了 + §E.2 self-review 7 check 全 ✅ + self-review report 出力 → user review に hand-off。

不明点があれば最初に質問。本 file 単独で実行可能。
