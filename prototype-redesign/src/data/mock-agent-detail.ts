import type { MetricRow } from '@/components/cross-cutting/MetricVsThreshold'
import type { ConsequenceImpact } from '@/components/cross-cutting/ConsequencePanel'

/**
 * エージェント詳細 (agent-corporate-address-change) detail 専用 model
 * SSOT: mock-fixture §5 (4 KPI) / §7 (consequence)、reference: screens-v2/08-agent-detail/agent-detail.jsx。
 * 平易 JP、旧 mock-agents の内部語は使わない。Trust は業務語を主・Tier 名を補助 (全件確認 / Supervised)。
 * 原則 A: 4 KPI 全件 / B: 裏付け sample + 設定 / C: 申請 1 ボタン。
 */
export interface AgentSampleCase {
  id: string
  outcome: string
  /** 結果の tone (MetaChip): 要確認/差戻し=alert、自動入力=success */
  tone: 'success' | 'alert'
  note: string
  /** 紐づく KPI (参照用、画面非表示) */
  kpi: string
}

export interface AgentConfigItem {
  /** 設定キー (モデル / 権限 / ツール) */
  k: string
  v: string
  meta: string
}

export interface AgentDetailModel {
  id: string
  name: string
  workflow: string
  trustLabel: string // 業務語 (全件確認) — 主表示
  trustEn: string // Tier-2 (Supervised) — 補助 chip
  metrics: MetricRow[]
  consequence: { before: string; after: string; scope: string; impacts: ConsequenceImpact[] }
  samples: AgentSampleCase[]
  config: AgentConfigItem[]
}

export const AGENT_CORP_ADDRESS: AgentDetailModel = {
  id: 'agent-corporate-address-change',
  name: '法人住所変更 Agent',
  workflow: '法人住所変更',
  trustLabel: '全件確認',
  trustEn: 'Supervised',
  // mock-fixture §5: 承認率のみ未達
  metrics: [
    { metricLabel: 'AI 入力承認率', actualValue: '92%', threshold: '≥ 95%', judgment: '未達 (-3pt)', achieved: false, period: '直近 30 日', denominator: '1,240 件', previousDelta: '前月 +2pt', exclusions: 'エスカレーション案件を除く' },
    { metricLabel: '人手上書き率', actualValue: '0.12', threshold: '≤ 0.15', judgment: '達成', achieved: true, period: '直近 30 日', denominator: '1,240 件', previousDelta: '前月 -0.01' },
    { metricLabel: 'Alert 発生率', actualValue: '0.08', threshold: '≤ 0.10', judgment: '達成', achieved: true, period: '直近 30 日', denominator: '1,240 件', previousDelta: '前月 ±0' },
    { metricLabel: '承認者差戻し率', actualValue: '0.05', threshold: '≤ 0.07', judgment: '達成', achieved: true, period: '直近 30 日', denominator: '1,140 件', previousDelta: '前月 -0.01' },
  ],
  // mock-fixture §7: 全件確認 → 要所確認 (業務語主、Tier 名は画面で補助 chip)
  consequence: {
    before: '全件確認',
    after: '要所確認',
    scope: '法人住所変更 Agent の自動化レベルを引き上げ',
    impacts: [
      { direction: 'down', label: '人レビュー 80 件/日 → 約 30 件/日 (高信頼は自動入力)' },
      { direction: 'up', label: '自動入力 0 件/日 → 約 50 件/日' },
      { direction: 'guard', label: '承認率が 7 日連続で基準割れ → 全件確認に自動降格' },
    ],
  },
  // 原則 B: 各 KPI の裏付け sample (outcome tone 付き)
  samples: [
    { id: 'CASE-2026-0142', outcome: '要確認', tone: 'alert', note: 'ビル名が申請書類と不一致 → 入力者が確認', kpi: '承認率' },
    { id: 'CASE-2026-0139', outcome: '自動入力', tone: 'success', note: '全項目一致、人の修正なし', kpi: '上書き率' },
    { id: 'CASE-2026-0131', outcome: '差戻し', tone: 'alert', note: '法人名の旧商号を誤入力 → 入力者が差戻し', kpi: '承認率' },
    { id: 'CASE-2026-0120', outcome: '自動入力', tone: 'success', note: '住所変更を正しく入力、承認済', kpi: '上書き率' },
  ],
  // 設定 (reference §CONFIG): モデル / 権限 / ツール
  config: [
    { k: 'モデル', v: '書類読み取り + 値生成モデル', meta: '法人住所変更 専用' },
    { k: '権限', v: '住所・支店コード・効力発生日の自動入力', meta: '要確認は入力者へ' },
    { k: 'ツール', v: '書類の文字読み取り / 登録情報の照合', meta: '読み取り結果を判定基準で振り分け' },
  ],
}

// ──────────────────────────────────────────────────────────────────────────
// Phase 4a — id-keyed detail dict。AGENT_LIST 全 2 件を網羅 (AGENT_CORP_ADDRESS 温存)。
// account-opening は全指標達成 = 昇格可 (footer の申請ボタンが活性になる variant)。
// ──────────────────────────────────────────────────────────────────────────

/** 口座開設書類完備 Agent (全指標達成 → 昇格申請可)。 */
export const AGENT_ACCOUNT_OPENING: AgentDetailModel = {
  id: 'agent-account-opening',
  name: '口座開設書類完備 Agent',
  workflow: '口座開設書類完備',
  trustLabel: '全件確認',
  trustEn: 'Supervised',
  metrics: [
    { metricLabel: 'AI 入力承認率', actualValue: '96%', threshold: '≥ 95%', judgment: '達成 (+1pt)', achieved: true, period: '直近 30 日', denominator: '980 件', previousDelta: '前月 +2pt', exclusions: 'エスカレーション案件を除く' },
    { metricLabel: '人手上書き率', actualValue: '0.10', threshold: '≤ 0.15', judgment: '達成', achieved: true, period: '直近 30 日', denominator: '980 件', previousDelta: '前月 -0.02' },
    { metricLabel: 'Alert 発生率', actualValue: '0.06', threshold: '≤ 0.10', judgment: '達成', achieved: true, period: '直近 30 日', denominator: '980 件', previousDelta: '前月 ±0' },
    { metricLabel: '承認者差戻し率', actualValue: '0.04', threshold: '≤ 0.07', judgment: '達成', achieved: true, period: '直近 30 日', denominator: '910 件', previousDelta: '前月 -0.01' },
  ],
  consequence: {
    before: '全件確認',
    after: '要所確認',
    scope: '口座開設書類完備 Agent の自動化レベルを引き上げ',
    impacts: [
      { direction: 'down', label: '人レビュー 60 件/日 → 約 20 件/日 (高信頼は自動入力)' },
      { direction: 'up', label: '自動入力 0 件/日 → 約 40 件/日' },
      { direction: 'guard', label: '承認率が 7 日連続で基準割れ → 全件確認に自動降格' },
    ],
  },
  samples: [
    { id: 'CASE-2026-0112', outcome: '自動入力', tone: 'success', note: '本人確認書類が完備、人の修正なし', kpi: '上書き率' },
    { id: 'CASE-2026-0104', outcome: '要確認', tone: 'alert', note: '在留カードの期限が間近 → 入力者が確認', kpi: '承認率' },
    { id: 'CASE-2026-0101', outcome: '自動入力', tone: 'success', note: '全項目一致、承認済', kpi: '上書き率' },
  ],
  config: [
    { k: 'モデル', v: '書類読み取り + 完備判定モデル', meta: '口座開設書類完備 専用' },
    { k: '権限', v: '記載事項の完備判定と要確認の振り分け', meta: '不備は入力者へ' },
    { k: 'ツール', v: '書類の文字読み取り / 記載項目チェック', meta: '有効期限の残存も確認' },
  ],
}

/** id-keyed dict。AGENT_LIST 全 id を網羅。 */
export const AGENT_DETAILS: Record<string, AgentDetailModel> = {
  'agent-corporate-address-change': AGENT_CORP_ADDRESS,
  'agent-account-opening': AGENT_ACCOUNT_OPENING,
}
