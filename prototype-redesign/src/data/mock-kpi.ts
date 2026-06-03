import type { MetricRow } from '@/components/cross-cutting/MetricVsThreshold'

/**
 * KPI SSOT (remediation B3 + v3 W5 F-055/F-019) — process 別の MetricRow を単一 source 化。
 * 従来 Observatory (OBS_METRICS) と AgentDetail (AGENT_DETAILS.metrics) が同一 KPI を手書きで二重保持し、
 * UC-BO-02 承認率の分母が 820 (observatory) と 980 (agent-detail) で drift していた (監査 M1/M2)。
 * 本 module を唯一 source とし両 consumer が import することで画面間 drift を構造的に封じる。
 *
 * gate 2 決定: **UC-BO-02 承認率の分母** を 980 に統一 (agent-level metric を canonical、旧 820 vs 980 drift を解消)。
 * これは「全 metric を単一分母に揃える」意味ではない (F-055 是正): metric ごとに母集合が異なるため分母は metric 単位で保持する。
 *   - 承認率 / 人手上書き率 / Alert 発生率 = AI 入力処理の全件が母集合 (UC-BO-01: 1,240 / UC-BO-02: 980)。
 *   - 承認者差戻し率 = 承認者レビューに到達した案件のみが母集合ゆえ小さい (UC-BO-01: 1,140 / UC-BO-02: 910)。各 row の exclusions に明示。
 * 全 KPI 値は **synthetic な想定値** (実処理からの再計算ではない)。仮説である旨は画面側 hypothesisLabel / subtitle で明示する (F-019)。
 */
/** KPI SSOT の process key (literal union、NUIA で literal-key access を non-undefined 化、W0)。 */
// PV0/PV1 (2026-06-01): 自動化対象業務 2→5。UC-BO-03/04/05 を追加 (Record<KpiProcessKey> 全 key 充足を同 commit で担保)。
// 各業務の母数は metric 単位で独立 (980 は UC-BO-02 専用、新業務は固有母数)。全値 synthetic、仮説表示は画面側 hypothesisLabel。
export type KpiProcessKey = 'UC-BO-01' | 'UC-BO-02' | 'UC-BO-03' | 'UC-BO-04' | 'UC-BO-05'

export const KPI_ROWS: Record<KpiProcessKey, MetricRow[]> = {
  'UC-BO-01': [
    { metricLabel: 'AI 入力承認率', actualValue: '92%', threshold: '≥ 95%', judgment: '未達 (-3pt)', achieved: false, period: '直近 30 日', denominator: '1,240 件', previousDelta: '前月 +2pt', exclusions: 'エスカレーション案件を除く' },
    { metricLabel: '人手上書き率', actualValue: '0.12', threshold: '≤ 0.15', judgment: '達成', achieved: true, period: '直近 30 日', denominator: '1,240 件', previousDelta: '前月 -0.01' },
    { metricLabel: 'Alert 発生率', actualValue: '0.08', threshold: '≤ 0.10', judgment: '達成', achieved: true, period: '直近 30 日', denominator: '1,240 件', previousDelta: '前月 ±0' },
    { metricLabel: '承認者差戻し率', actualValue: '0.05', threshold: '≤ 0.07', judgment: '達成', achieved: true, period: '直近 30 日', denominator: '1,140 件', previousDelta: '前月 -0.01', exclusions: '承認者レビュー到達分のみ（入力段階で差戻し/取消した分は母集合外）' },
  ],
  'UC-BO-02': [
    { metricLabel: 'AI 入力承認率', actualValue: '96%', threshold: '≥ 95%', judgment: '達成 (+1pt)', achieved: true, period: '直近 30 日', denominator: '980 件', previousDelta: '前月 +2pt', exclusions: 'エスカレーション案件を除く' },
    { metricLabel: '人手上書き率', actualValue: '0.10', threshold: '≤ 0.15', judgment: '達成', achieved: true, period: '直近 30 日', denominator: '980 件', previousDelta: '前月 -0.02' },
    { metricLabel: 'Alert 発生率', actualValue: '0.06', threshold: '≤ 0.10', judgment: '達成', achieved: true, period: '直近 30 日', denominator: '980 件', previousDelta: '前月 ±0' },
    { metricLabel: '承認者差戻し率', actualValue: '0.04', threshold: '≤ 0.07', judgment: '達成', achieved: true, period: '直近 30 日', denominator: '910 件', previousDelta: '前月 -0.01', exclusions: '承認者レビュー到達分のみ（入力段階で差戻し/取消した分は母集合外）' },
  ],
  // PV1 (2026-06-01) 新業務 — synthetic、母数は metric 単位 (980 不変、各業務固有母数)。
  'UC-BO-03': [
    { metricLabel: 'AI 入力承認率', actualValue: '95%', threshold: '≥ 95%', judgment: '達成 (±0)', achieved: true, period: '直近 30 日', denominator: '1,050 件', previousDelta: '前月 +1pt', exclusions: 'エスカレーション案件を除く' },
    { metricLabel: '人手上書き率', actualValue: '0.11', threshold: '≤ 0.15', judgment: '達成', achieved: true, period: '直近 30 日', denominator: '1,050 件', previousDelta: '前月 -0.01' },
    { metricLabel: 'Alert 発生率', actualValue: '0.07', threshold: '≤ 0.10', judgment: '達成', achieved: true, period: '直近 30 日', denominator: '1,050 件', previousDelta: '前月 ±0' },
    { metricLabel: '承認者差戻し率', actualValue: '0.05', threshold: '≤ 0.07', judgment: '達成', achieved: true, period: '直近 30 日', denominator: '980 件', previousDelta: '前月 ±0', exclusions: '承認者レビュー到達分のみ（入力段階で差戻し/取消した分は母集合外）' },
  ],
  'UC-BO-04': [
    { metricLabel: 'AI 入力承認率', actualValue: '93%', threshold: '≥ 95%', judgment: '未達 (-2pt)', achieved: false, period: '直近 30 日', denominator: '760 件', previousDelta: '前月 +1pt', exclusions: 'エスカレーション案件を除く' },
    { metricLabel: '人手上書き率', actualValue: '0.13', threshold: '≤ 0.15', judgment: '達成', achieved: true, period: '直近 30 日', denominator: '760 件', previousDelta: '前月 -0.01' },
    { metricLabel: 'Alert 発生率', actualValue: '0.09', threshold: '≤ 0.10', judgment: '達成', achieved: true, period: '直近 30 日', denominator: '760 件', previousDelta: '前月 +0.01' },
    { metricLabel: '承認者差戻し率', actualValue: '0.06', threshold: '≤ 0.07', judgment: '達成', achieved: true, period: '直近 30 日', denominator: '700 件', previousDelta: '前月 ±0', exclusions: '承認者レビュー到達分のみ（入力段階で差戻し/取消した分は母集合外）' },
  ],
  'UC-BO-05': [
    { metricLabel: 'AI 入力承認率', actualValue: '97%', threshold: '≥ 95%', judgment: '達成 (+2pt)', achieved: true, period: '直近 30 日', denominator: '1,520 件', previousDelta: '前月 +1pt', exclusions: 'エスカレーション案件を除く' },
    { metricLabel: '人手上書き率', actualValue: '0.08', threshold: '≤ 0.15', judgment: '達成', achieved: true, period: '直近 30 日', denominator: '1,520 件', previousDelta: '前月 -0.02' },
    { metricLabel: 'Alert 発生率', actualValue: '0.05', threshold: '≤ 0.10', judgment: '達成', achieved: true, period: '直近 30 日', denominator: '1,520 件', previousDelta: '前月 ±0' },
    { metricLabel: '承認者差戻し率', actualValue: '0.03', threshold: '≤ 0.07', judgment: '達成', achieved: true, period: '直近 30 日', denominator: '1,440 件', previousDelta: '前月 -0.01', exclusions: '承認者レビュー到達分のみ（入力段階で差戻し/取消した分は母集合外）' },
  ],
}

// 共有 mutable 参照の偶発 mutation を防ぐ (consumer は read-only、B3 SSOT 不変条件)。
Object.values(KPI_ROWS).forEach((rows) => {
  rows.forEach((r) => Object.freeze(r))
  Object.freeze(rows)
})
Object.freeze(KPI_ROWS)

/** workflowId → process 表示名 (KPI consumer の整合用)。 */
export const KPI_PROCESS_LABEL: Record<string, string> = {
  'UC-BO-01': '法人住所変更',
  'UC-BO-02': '口座開設書類完備',
  'UC-BO-03': '口座振替登録',
  'UC-BO-04': '改印・代表者変更届',
  'UC-BO-05': 'カード再発行',
}
