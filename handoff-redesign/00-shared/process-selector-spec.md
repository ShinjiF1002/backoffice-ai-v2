# ProcessSelector Spec (R-PROC-01)

> 業務 Process を第一階層の組織軸にする。全画面が Process context で動作。ユーザーの Process Driven メンタルモデルに一致させる。

## 配置

TopBar 左端: `[業務: 法人住所変更 ▾]`
選択肢: 法人住所変更 / 口座開設書類完備 / **全業務**

## 挙動

| selector | Sidebar nav | 各画面 |
|---|---|---|
| 特定 Process (例: 法人住所変更) | 全 nav (案件/承認待ち/提案/Agent/モニタリング) がその Process に scoped | 該当 Process のデータのみ |
| 全業務 | 横断表示 | 各一覧に「業務」列、Hub は全 Process Alert (Process tag)、Agent は全 Agent 一覧 |

- Process 切替は全画面で保持 (`?process=UC-BO-01` or context)
- pattern: Linear team switcher / Stripe account switcher

## role landing (P1-1)

各 role の既定着地画面 (login 後の初期表示):

| role | landing |
|---|---|
| 入力者 | 案件一覧 (自 Process) |
| 承認者 | 承認待ち |
| Manual 管理者 | 提案一覧 |
| AI 管理者 | エージェント一覧 |
| 監査者 | Observatory |
| 業務責任者 | 提案一覧 (承認待ち forward 分) |

## saved view

よく使う Process × filter の組合せを保存 (例: 「法人住所変更 × 要確認のみ」)。

## scalability (Process が増えた時)

- **2 Process (現状)**: dropdown で十分
- **10+ Process**: searchable selector + grouped (recent / favorite)。dropdown 一覧は破綻するため search 必須

## 旧との差分

旧 (Plan β) は機能横断フラット (Hub/Queue/Case...) で Process 軸なし。全指摘の最頻出テーマ T1 (Process 軸欠落: Hub#1 / Obs#1/4/5 / Agent#2 / Proposal#1) を本 selector + Process-scoped nav で解消。

## Acceptance check

- [ ] TopBar に Process selector (法人住所変更 / 口座開設 / 全業務)
- [ ] 特定 Process 選択で全 nav が scoped
- [ ] 全業務で横断表示 + 「業務」列
- [ ] role landing (role 別の既定着地画面)
- [ ] 全画面で Process context 保持

## 関連
- 9 画面の Process context 扱い: `screen-contracts-v2.md`
- 全 entity の workflowId: `mock-fixture-spec-v2.md` § Process
