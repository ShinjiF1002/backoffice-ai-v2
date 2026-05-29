# Disclosure Rules — L1/L2/L3/L4 段階規範

## 目的

旧 prototype の「文字が多すぎる」「一目で何をしたら良いかわからない」問題を、段階表示で解消する。

## 4 階層の定義

| Layer | visible default | 内容 | 上限 |
|---|---|---|---|
| **L1** | Always visible | Header title + 1 chip + PrimaryAnchor + main artifact (table / diff / form) | ≤8 token block |
| **L2** | Always visible、demoted | 補助情報 1-2 card、small text、actor band、breadcrumb | ≤6 token block |
| **L3** | Disclosure default closed | 詳細 KPI / breakdown / hedge / 関連 history / 統計補足 | per Disclosure ≤15 token block |
| **L4** | Page-specific (Observatory tab 内側のみ) | 全 hedge / 全 citation / 全 timeline / 全 audit event | unbounded |

「token block」= 1 つの意味単位 (chip 1 個 / heading 1 行 / paragraph 1 行 / card 1 個 / button 1 個)。

## L1 規範

- 画面開いた瞬間に**全て visible**、scroll 不要 (viewport 内)
- `<PageShell.PrimaryAnchor>` は 1 画面 1 個まで
- Header chip は 1 個まで
- main artifact (table / diff form / config grid) は 1 個

## L2 規範

- L1 と同じ viewport だが、視覚的に demoted (font 1 size 小、色 muted)
- 補助情報 (filter / sort / breadcrumb / sparkline)
- L1 から目を逸らさず scan 可能な distance

## L3 規範

- Disclosure component (`<details>` ベース) で default closed
- toggle 文言は「詳細を見る」「集計を展開」「補足」等で、何が出てくるかを明示
- expand transition 250ms
- expand 後は inline expand (modal でなく、context を失わない)

## L4 規範

- Observatory (`/observatory?tab=audit|metrics|knowledge`) tab 内側のみ
- 「監査を全部見る」「全 metrics を見る」「全 knowledge を見る」用途
- page-level pagination / filter / sort あり
- Disclosure 不要、page そのものが L4

## 画面別 Disclosure 化対象 (主要)

### Hub
- L3 行き: 旧 Cockpit 5 KPI のうち vanity 2 (案件総数 / 反映済)、業務 card の status breakdown 5 行 (AI処理中 / 確認待ち / 承認者待ち / 差戻し / 反映済)
- L3 行き: 旧 Workflow lane 5 button (cmd palette or shortcut menu に隠す検討)

### Queue
- L3 行き: filter chip 4 種 (業務 / 状態 / 担当者 / 経過時間)、bulk action (一括承認 / 一括差戻し)
- L2 行き: footer の status counter (5 status)

### CaseDetail
- L3 行き: PDF preview / OCR raw / 全 evidence timeline / hedge 詳細
- L1 keep: AI 入力結果 diff / Citation panel / 注意 strip

### ProposalDetail
- L3 行き: meta 詳細 (author / reason / confidence / scope / reversibility) — sticky に compact 表示、expand で詳細
- L1 keep: 提案 title / 元案件 link / 判定基準 / 業務責任者へ送付 CTA

### AgentDetail
- L3 行き: 4 KPI 進化要件 grid、設定 history、simulation 詳細
- L1 keep: agent name / trust level current / config primary 3 行

### Observatory (3-tab)
- audit tab: timeline は L4 (page-level)、filter sticky
- metrics tab: gate / aux / kri / trends を grid、各 KPI Disclosure 可
- knowledge tab: list + filter、citation governance core は L1 banner
