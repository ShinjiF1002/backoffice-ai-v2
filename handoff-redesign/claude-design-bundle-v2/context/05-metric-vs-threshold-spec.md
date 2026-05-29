# MetricVsThreshold Spec (R-AGENT-02 / R-PROP-02)

> 「進化要件達成度 75%」のような集約値を捨て、各指標の **実績値 vs 閾値 vs 達成判定** を示す。申請者が「どの指標が基準に未達か」を即判断できる。

## 適用画面

- **AgentDetail**: Trust 昇格判断 (4 KPI vs 閾値)
- **ProposalDetail**: 判定基準の実績値 (ルール改定が基準を満たすか)

## schema (各指標行)

| key | 意味 | 例 |
|---|---|---|
| `metricLabel` | 指標名 | AI 入力承認率 |
| `actualValue` | 実績値 | 92% |
| `threshold` | 閾値 | ≥ 95% |
| `judgment` | 達成判定 + 差分 | 未達 (-3pt) |
| `period` | 対象期間 | 直近 30 日 |
| `denominator` | 分母 (母数) | 1,240 件 |
| `exclusions` | 除外条件 | エスカレーション case 除く |
| `previousDelta` | 前回差分 | 前月比 +2pt |
| `owner` | 対象 | UC-BO-01 Agent |
| `hypothesisLabel` | 仮説ラベル | [仮説 / 要検証] |

## Layout

table 形式。**L1 (必須表示)**: 指標 / 実績値 / 閾値 / 判定 / 期間 / 分母。**L2/L3**: 除外条件 / 前回差 / owner。
未達指標は alert tone で視覚区別、全達成なら success tone。

## demo mock 明示 (critical)

全数値は mock。**L1 に `[仮説 / 要検証]` + 「mock 値」を明示**し、実績のように見せない。閾値は Phase 1 で要定義の仮値である旨を注記。

## 旧との差分

| 旧 (Plan β) | 新 (v2) |
|---|---|
| 進化要件達成度 75% (集約 progress bar) | 4 指標の実績値 vs 閾値 vs 判定の table |
| 何が未達か不明 | 未達指標が差分付きで明示 |
| 期間 / 分母 なし | 期間 + 分母 を L1 表示 |

## Acceptance check

- [ ] 集約値 (75%) でなく**指標ごとの 実績値 vs 閾値 vs 判定**
- [ ] 各指標に期間 + 分母 (最低 L1)
- [ ] 未達指標が alert tone で区別
- [ ] mock 明示 (`[仮説 / 要検証]`)
- [ ] 前回差分 (改善/悪化方向)

## 関連
- mock 数値: `mock-fixture-spec-v2.md` § metric values
- 昇格の帰結: `consequence-panel-spec.md`
