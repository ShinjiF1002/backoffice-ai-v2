# ProcessSelector Spec (R-PROC-01)

> 業務 Process を第一階層の組織軸にする。全画面が Process context で動作。ユーザーの Process Driven メンタルモデルに一致させる。

## 配置

TopBar 左端: `[業務: 法人住所変更 ▾]`
選択肢: 法人住所変更 / 口座開設書類完備 / 口座振替登録 / 改印・代表者変更届 / カード再発行 / **全業務**

> **業務拡張 (PV0、2026-06-01)**: 自動化対象業務を 2 → **5** に拡張。新規 (canonical workflowName、freeze 済) = **口座振替登録** (UC-BO-03、supervised) / **改印・代表者変更届** (UC-BO-04、supervised) / **カード再発行** (UC-BO-05、**checkpoint** = trust 多様性)。国際送金 (boundary-only) は従来通り自動化対象外ゆえ selector 非掲載。
>
> **業務数 count gate = 5** の surface は 2 層:
> - **PV0 doc surface (業務名 enumeration、5 doc、本 PV0 で更新済)**: 本 spec / `ia-overview-v2` / master plan REBASELINE / `backoffice-ai-v2/CLAUDE.md` / `prototype-redesign/CLAUDE.md`。
> - **PV1 code control surface (hardcode 列挙、PV1 で +3 → 5 業務化、下記 Acceptance check)**: `ProcessSelector.PROCESSES` / `CaseDraft.WORKFLOWS` / `seed.WORKFLOW_NAME_TO_ID` / `mock-kpi.{KpiProcessKey,KPI_ROWS,KPI_PROCESS_LABEL}` / `Observatory.LEDGER_WORKFLOWS` / `mock-hub.HUB_PROCESSES`。
> - **非対象**: `screen-contracts-v2` / `coverage-matrix-v2` は業務を enumeration せず generic「全業務」参照のみ → count surface 外。

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

- **2 Process (旧)**: dropdown で十分
- **5 Process (現状、PV0)**: dropdown 許容 (全業務 + 5 = 6 項目以内)。grouped/search は不要
- **10+ Process**: searchable selector + grouped (recent / favorite)。dropdown 一覧は破綻するため search 必須

## 旧との差分

旧 (Plan β) は機能横断フラット (Hub/Queue/Case...) で Process 軸なし。全指摘の最頻出テーマ T1 (Process 軸欠落: Hub#1 / Obs#1/4/5 / Agent#2 / Proposal#1) を本 selector + Process-scoped nav で解消。

## Acceptance check

- [ ] TopBar に Process selector (法人住所変更 / 口座開設 / 口座振替登録 / 改印・代表者変更届 / カード再発行 / 全業務 = 5 業務 + 全業務)
- [ ] 特定 Process 選択で全 nav が scoped
- [ ] 全業務で横断表示 + 「業務」列
- [ ] role landing (role 別の既定着地画面)
- [ ] 全画面で Process context 保持
- [ ] **(PV1 code gate)** 業務 hardcode 列挙 6 surface が全て 5 業務化: `ProcessSelector.PROCESSES` / `CaseDraft.WORKFLOWS` / `seed.WORKFLOW_NAME_TO_ID` / `mock-kpi.{KpiProcessKey,KPI_ROWS(全key充足),KPI_PROCESS_LABEL}` / `Observatory.LEDGER_WORKFLOWS` / `mock-hub.HUB_PROCESSES`。grep で 5 業務 × 全 surface 一致を機械確認

## 関連
- 9 画面の Process context 扱い: `screen-contracts-v2.md`
- 全 entity の workflowId: `mock-fixture-spec-v2.md` § Process
