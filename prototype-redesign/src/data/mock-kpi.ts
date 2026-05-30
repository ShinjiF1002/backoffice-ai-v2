import type { MetricRow } from '@/components/cross-cutting/MetricVsThreshold'

/**
 * KPI SSOT (remediation B3) — process 別の MetricRow を単一 source 化。
 * 従来 Observatory (OBS_METRICS) と AgentDetail (AGENT_DETAILS.metrics) が同一 KPI を手書きで二重保持し、
 * UC-BO-02 の分母が 820 (observatory) と 980 (agent-detail) で drift していた (監査 M1/M2)。
 * 本 module を唯一 source とし両 consumer が import することで画面間 drift を構造的に封じる。
 *
 * gate 2 決定: UC-BO-02 承認率 96% の分母は 980 に統一 (agent-level metric を canonical)。
 * 全 KPI 値は synthetic。閾値比較は表示用 ([仮説/要検証] は画面側 label 規律で担保)。
 */
export const KPI_ROWS: Record<string, MetricRow[]> = {
  'UC-BO-01': [
    { metricLabel: 'AI 入力承認率', actualValue: '92%', threshold: '≥ 95%', judgment: '未達 (-3pt)', achieved: false, period: '直近 30 日', denominator: '1,240 件', previousDelta: '前月 +2pt', exclusions: 'エスカレーション案件を除く' },
    { metricLabel: '人手上書き率', actualValue: '0.12', threshold: '≤ 0.15', judgment: '達成', achieved: true, period: '直近 30 日', denominator: '1,240 件', previousDelta: '前月 -0.01' },
    { metricLabel: 'Alert 発生率', actualValue: '0.08', threshold: '≤ 0.10', judgment: '達成', achieved: true, period: '直近 30 日', denominator: '1,240 件', previousDelta: '前月 ±0' },
    { metricLabel: '承認者差戻し率', actualValue: '0.05', threshold: '≤ 0.07', judgment: '達成', achieved: true, period: '直近 30 日', denominator: '1,140 件', previousDelta: '前月 -0.01' },
  ],
  'UC-BO-02': [
    { metricLabel: 'AI 入力承認率', actualValue: '96%', threshold: '≥ 95%', judgment: '達成 (+1pt)', achieved: true, period: '直近 30 日', denominator: '980 件', previousDelta: '前月 +2pt', exclusions: 'エスカレーション案件を除く' },
    { metricLabel: '人手上書き率', actualValue: '0.10', threshold: '≤ 0.15', judgment: '達成', achieved: true, period: '直近 30 日', denominator: '980 件', previousDelta: '前月 -0.02' },
    { metricLabel: 'Alert 発生率', actualValue: '0.06', threshold: '≤ 0.10', judgment: '達成', achieved: true, period: '直近 30 日', denominator: '980 件', previousDelta: '前月 ±0' },
    { metricLabel: '承認者差戻し率', actualValue: '0.04', threshold: '≤ 0.07', judgment: '達成', achieved: true, period: '直近 30 日', denominator: '910 件', previousDelta: '前月 -0.01' },
  ],
}

/** workflowId → process 表示名 (KPI consumer の整合用)。 */
export const KPI_PROCESS_LABEL: Record<string, string> = {
  'UC-BO-01': '法人住所変更',
  'UC-BO-02': '口座開設書類完備',
}
