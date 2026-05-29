# IA Overview — 6 画面 / 5 nav / 3 typology / Disclosure 規範

## 目的

旧 prototype 9 画面の 3 つの認知負荷問題 (文字過多 / 一目不明 / レイアウト不統一) を、**画面集約 + typology lock + Disclosure 段階化** で解消する。

## 1. 9 → 6 画面集約 (path β)

| # | 新画面 | typology | 旧画面 mapping | 主たる役割 |
|---|---|---|---|---|
| 1 | **Hub** | A (Operations) | Dashboard | 「次の案件を開く」の primary anchor |
| 2 | **Queue** | B (Master) | Inbox | Table + Drawer master view |
| 3 | **CaseDetail** | C (Detail Workspace) | CaseReview + SendBackComment (child route `/cases/:id/comment`) | 承認 / 差戻し workspace |
| 4 | **ProposalDetail** | C (Detail Workspace) | ProposalReview | AI 提案レビュー |
| 5 | **AgentDetail** | C (Detail Workspace) | AgentSettings | Agent 設定 |
| 6 | **Observatory** | A (3-tab Hub) | AuditTrail + Metrics + KnowledgeBrowser | 監査 / メトリクス / ナレッジを 1 画面 3-tab に統合 |

## 2. Typology lock (画面間の認知一貫性)

3 typology のみ。画面ごと variant 禁止。

### A 型 — Operations Hub (Hub / Observatory)
3-tier 構造:
- **Headline tier** (上、3-5 KPI、actionable のみ)
- **Drill tier** (中、2-3 card / chart)
- **Diagnostic tier** (下、Disclosure default collapsed)

### B 型 — Queue Master (Queue)
- Master: full-width table、固定 column set
- Detail: Drawer (右から slide-in)、row click で開く
- 状態: recommended row highlight (NextActionStrip を table 内 1 row highlight に格上げ)

### C 型 — Detail Workspace (CaseDetail / ProposalDetail / AgentDetail)
- 2-col grid (`lg:grid-cols-12`)
- **primary** = 7/12 col (主 artifact、diff / form / config)
- **aux** = 5/12 col (補助、meta / citations / history / Disclosure)
- Sticky PageHeader + PageFooter (action button、status-conditional disabled)

## 3. Sidebar 5 nav

| # | label | path | activePrefix |
|---|---|---|---|
| 1 | ハブ | `/` | (default) |
| 2 | 受信トレイ | `/queue` | (default) |
| 3 | AI 提案レビュー | `/proposals/PROP-2026-031` | `/proposals/` |
| 4 | Agent 設定 | `/agents/agent-corporate-address-change` | `/agents/` |
| 5 | 観測 | `/observatory?tab=audit` | `/observatory` |

**CaseDetail (`/cases/:id`)** は Queue row click から navigate、sidebar 非表示 (master-detail 規範)。
**SendBackComment (`/cases/:id/comment`)** は CaseDetail の child route、page section 切替で表現。

## 4. 4-slot skeleton (全画面共通)

```
PageShell
├─ Header           : breadcrumb + h1 + 1 chip (件数 or status、複数禁止)
├─ PrimaryAnchor    : 1 画面 1 つ (NextActionStrip を昇格)
├─ Body            : typology に応じて HubBody / QueueBody / DetailBody
└─ Footer          : 1 文 caption only (status counter / action 禁止)
```

## 5. Disclosure 規範 (L1-L4)

詳細は `disclosure-rules.md` 参照。要約:

- **L1** (Always visible、≤8 token block): Header + PrimaryAnchor + main artifact
- **L2** (Always visible、demoted): 補助 1-2 card、small text、actor band
- **L3** (Disclosure default closed): 詳細 KPI / breakdown / hedge / 関連 history
- **L4** (Page-specific only、AuditTrail 等): 全 hedge / 全 citation / 全 timeline

## 6. research-compounder 違反 mapping (Layer 1 ref)

詳細は `upload-once/research-compounder-refs.md` 参照。要約:

| Card | 規範 | 旧 prototype violation | 新 redesign での対応 |
|---|---|---|---|
| `executive-dashboard-layout-pattern.md` | Headline 3-5 / Drill / Diagnostic の 3 layer 分離、vanity metric 禁止 | Dashboard で 3 layer co-existence + vanity (案件総数 / 反映済) | Hub で Headline 3 actionable のみ、vanity は Diagnostic Disclosure |
| `enterprise-saas-information-architecture.md` | Master-detail default、card grid は visual 用途のみ | Dashboard 業務 card grid が非 visual | Hub では Drill tier の 2 業務 card は 1-liner (4 element 1 row) |
| `ai-native-hil-approval-ui.md` | 5 state timeline を 1 viewport で常時露出 | Inbox は table chip 散在、CaseReview LifecycleStepper のみ | CaseDetail で LifecycleStepper を sticky 化、Queue table の status column を timeline 圧縮表現 |

## 7. 6 画面の primary action (1 画面 1 つ)

| 画面 | primary action | trigger 条件 |
|---|---|---|
| Hub | 「次に処理すべき案件を開く」 | 注意 + 経過最大の 1 件 (recommendedCase) |
| Queue | 上位 1 件 row を recommended highlight、CTA「開く」 | 同上 |
| CaseDetail | 「承認」 or 「差戻し」 | status 連動 (ready 時 = 承認 / 差戻し、business-approval-waiting 時 = 監視のみ) |
| ProposalDetail | 「業務責任者へ送付」 | meta 全 visible + lifecycle complete 時 enabled |
| AgentDetail | 「設定変更を申請」 | trust progression 観察後 |
| Observatory | tab 内側で 1 action (audit: filter適用 / metrics: 期間切替 / knowledge: 検索) | tab ごと固定 |
