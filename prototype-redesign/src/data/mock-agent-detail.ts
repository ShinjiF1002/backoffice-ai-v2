import type { MetricRow } from '@/components/cross-cutting/MetricVsThreshold'
import type { ConsequenceImpact } from '@/components/cross-cutting/ConsequencePanel'
import { KPI_ROWS } from './mock-kpi'
import { CASE_LIST } from './mock-case-list'
import { caseResultTone } from '@/lib/status-tones'

/**
 * エージェント詳細 (agent-corporate-address-change) detail 専用 model
 * SSOT: mock-fixture §5 (4 KPI) / §7 (consequence)、reference: screens-v2/08-agent-detail/agent-detail.jsx。
 * 平易 JP、旧 mock-agents の内部語は使わない。Trust は業務語を主・Tier 名を補助 (全件確認 / Supervised)。
 * 原則 A: 4 KPI 全件 / B: 裏付け sample + 設定 / C: 申請 1 ボタン。
 */
export interface AgentSampleCase {
  id: string
  outcome: string
  /** 結果の tone (MetaChip): 要確認/差戻し=alert、自動入力=success。remediation B2: 手書きせず caseResultTone で導出。 */
  tone: 'success' | 'alert'
  note: string
  /** 紐づく KPI (参照用、画面非表示) */
  kpi: string
}

/** 裏付け sample の authored 部分 (tone は持たない = caseResultTone で導出するため)。 */
interface AgentSampleSpec {
  id: string
  outcome: string
  note: string
  kpi: string
}

/** id → 業務 case row。sample tone を case の status/flags から導出するための lookup (B2 tone drift 防止)。 */
const CASE_BY_ID = Object.fromEntries(CASE_LIST.map((r) => [r.id, r]))

/** sample spec に caseResultTone(status, flags) 由来の tone を付与 (手書き個別 tone を排し status-tones SSOT で一元化)。 */
function buildSamples(specs: AgentSampleSpec[]): AgentSampleCase[] {
  return specs.map((s): AgentSampleCase => {
    const row = CASE_BY_ID[s.id]
    return { ...s, tone: row ? caseResultTone(row.status, row.flags) : 'alert' }
  })
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
  /** この Agent を改定対象とする提案 (remediation B2: agent→proposal 双方向 link、PROPOSAL_DETAILS.agentId と対称)。 */
  relatedProposals: string[]
}

export const AGENT_CORP_ADDRESS: AgentDetailModel = {
  id: 'agent-corporate-address-change',
  name: '法人住所変更 Agent',
  workflow: '法人住所変更',
  trustLabel: '全件確認',
  trustEn: 'Supervised',
  // KPI は mock-kpi.ts SSOT を参照 (observatory との手書き drift を解消、B3)。
  metrics: KPI_ROWS['UC-BO-01'],
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
  // 原則 B: 各 KPI の裏付け sample (tone は caseResultTone で導出、手書きしない)
  samples: buildSamples([
    { id: 'CASE-2026-0142', outcome: '要確認', note: 'ビル名が申請書類と不一致 → 入力者が確認', kpi: '承認率' },
    { id: 'CASE-2026-0139', outcome: '自動入力', note: '全項目一致、人の修正なし', kpi: '上書き率' },
    { id: 'CASE-2026-0131', outcome: '差戻し', note: '法人名の旧商号を誤入力 → 入力者が差戻し', kpi: '承認率' },
    { id: 'CASE-2026-0120', outcome: '自動入力', note: '住所変更を正しく入力、承認済', kpi: '上書き率' },
  ]),
  // 設定 (reference §CONFIG): モデル / 権限 / ツール
  config: [
    { k: 'モデル', v: '書類読み取り + 値生成モデル', meta: '法人住所変更 専用' },
    { k: '権限', v: '住所・支店コード・効力発生日の自動入力', meta: '要確認は入力者へ' },
    { k: 'ツール', v: '書類の文字読み取り / 登録情報の照合', meta: '読み取り結果を判定基準で振り分け' },
  ],
  relatedProposals: ['PROP-2026-031', 'PROP-2026-028'],
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
  // KPI は mock-kpi.ts SSOT を参照 (UC-BO-02 分母 980 統一、observatory との drift 解消、B3)。
  metrics: KPI_ROWS['UC-BO-02'],
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
  samples: buildSamples([
    { id: 'CASE-2026-0112', outcome: '自動入力', note: '本人確認書類が完備、人の修正なし', kpi: '上書き率' },
    { id: 'CASE-2026-0104', outcome: '要確認', note: '在留カードの期限が間近 → 入力者が確認', kpi: '承認率' },
    { id: 'CASE-2026-0101', outcome: '自動入力', note: '全項目一致、承認済', kpi: '上書き率' },
  ]),
  config: [
    { k: 'モデル', v: '書類読み取り + 完備判定モデル', meta: '口座開設書類完備 専用' },
    { k: '権限', v: '記載事項の完備判定と要確認の振り分け', meta: '不備は入力者へ' },
    { k: 'ツール', v: '書類の文字読み取り / 記載項目チェック', meta: '有効期限の残存も確認' },
  ],
  relatedProposals: ['PROP-2026-024'],
}

// ──────────────────────────────────────────────────────────────────────────
// PV2a (2026-06-01) 新業務 Agent ×3。metrics は KPI_ROWS SSOT 参照、samples は実 case id (CASE_DETAILS 整合)。
// relatedProposals は PV2b まで [] (提案不在ゆえ NotFound link を作らない)。
// ──────────────────────────────────────────────────────────────────────────

/** 口座振替登録 Agent (UC-BO-03、supervised)。 */
export const AGENT_DIRECT_DEBIT: AgentDetailModel = {
  id: 'agent-direct-debit',
  name: '口座振替登録 Agent',
  workflow: '口座振替登録',
  trustLabel: '全件確認',
  trustEn: 'Supervised',
  metrics: KPI_ROWS['UC-BO-03'],
  consequence: {
    before: '全件確認',
    after: '要所確認',
    scope: '口座振替登録 Agent の自動化レベルを引き上げ',
    impacts: [
      { direction: 'down', label: '人レビュー 70 件/日 → 約 25 件/日 (高信頼は自動入力)' },
      { direction: 'up', label: '自動入力 0 件/日 → 約 45 件/日' },
      { direction: 'guard', label: '承認率が 7 日連続で基準割れ → 全件確認に自動降格' },
    ],
  },
  samples: buildSamples([
    { id: 'CASE-2026-0201', outcome: '要確認', note: '口座番号が依頼書と 1 桁相違 → 入力者が確認', kpi: '承認率' },
    { id: 'CASE-2026-0204', outcome: '自動入力', note: '振替開始月を正しく入力、承認済', kpi: '上書き率' },
    { id: 'CASE-2026-0202', outcome: '自動入力', note: '全項目一致、人の修正なし', kpi: '上書き率' },
  ]),
  config: [
    { k: 'モデル', v: '依頼書読み取り + 値生成モデル', meta: '口座振替登録 専用' },
    { k: '権限', v: '金融機関コード・口座番号・収納企業コードの自動入力', meta: '要確認は入力者へ' },
    { k: 'ツール', v: '依頼書の文字読み取り / 口座情報の照合', meta: '読み取り結果を判定基準で振り分け' },
  ],
  relatedProposals: [],
}

/** 改印・代表者変更届 Agent (UC-BO-04、supervised、承認率 93% 未達)。 */
export const AGENT_CORP_NOTIFICATION: AgentDetailModel = {
  id: 'agent-corp-notification',
  name: '改印・代表者変更届 Agent',
  workflow: '改印・代表者変更届',
  trustLabel: '全件確認',
  trustEn: 'Supervised',
  metrics: KPI_ROWS['UC-BO-04'],
  consequence: {
    before: '全件確認',
    after: '要所確認',
    scope: '改印・代表者変更届 Agent の自動化レベルを引き上げ',
    impacts: [
      { direction: 'down', label: '人レビュー 50 件/日 → 約 20 件/日 (高信頼は自動入力)' },
      { direction: 'up', label: '自動入力 0 件/日 → 約 30 件/日' },
      { direction: 'guard', label: '承認率が基準 (95%) 未達のため、現時点では昇格しない' },
    ],
  },
  samples: buildSamples([
    { id: 'CASE-2026-0231', outcome: '要確認', note: '新代表者名の表記が届出書と不一致 → 入力者が確認', kpi: '承認率' },
    { id: 'CASE-2026-0232', outcome: '差戻し', note: '届出種別の判定を誤り → 入力者が差戻し', kpi: '承認率' },
    { id: 'CASE-2026-0234', outcome: '自動入力', note: '全項目一致、承認済', kpi: '上書き率' },
  ]),
  config: [
    { k: 'モデル', v: '届出書読み取り + 値生成モデル', meta: '改印・代表者変更届 専用' },
    { k: '権限', v: '法人名・支店コード・届出種別の自動入力', meta: '要確認は入力者へ' },
    { k: 'ツール', v: '届出書の文字読み取り / 法人マスタの照合', meta: '読み取り結果を判定基準で振り分け' },
  ],
  // PV2b: 却下 proposal PROP-2026-019 (届出種別の自動判定、判定精度未達で却下) の逆リンク (B2 対称性)。
  //   lineage 表示は forwarded/approved のみゆえ rejected は active 改善として非露出 (data link のみ保持)。
  relatedProposals: ['PROP-2026-019'],
}

/** カード再発行 Agent (UC-BO-05、checkpoint = trust 多様性)。 */
export const AGENT_CARD_REISSUE: AgentDetailModel = {
  id: 'agent-card-reissue',
  name: 'カード再発行 Agent',
  workflow: 'カード再発行',
  trustLabel: '要所確認',
  trustEn: 'Checkpoint',
  metrics: KPI_ROWS['UC-BO-05'],
  // checkpoint variant: 「全件確認→要所確認」ではなく「要所確認→高信頼のみ自動入力」。
  // guard で「自動化Lvが上がっても承認 gate は残す」を明示 (中核 message: 人のコントロールは渡さない)。
  consequence: {
    before: '要所確認',
    after: '高信頼案件のみ自動入力',
    scope: 'カード再発行 Agent の自動化範囲を拡大 (要所確認は継続)',
    impacts: [
      { direction: 'down', label: '要所確認 60 件/日 → 約 25 件/日 (高信頼は自動入力)' },
      { direction: 'up', label: '自動入力 40 件/日 → 約 75 件/日' },
      { direction: 'guard', label: '要所判定が 7 日連続で基準割れ → 全件確認に自動降格。設定変更・手順変更の承認は引き続き人が行う（自動化レベルが上がっても承認 gate は残す）' },
    ],
  },
  samples: buildSamples([
    { id: 'CASE-2026-0241', outcome: '要確認', note: '送付先住所が会員情報と相違 → 入力者が確認', kpi: '承認率' },
    { id: 'CASE-2026-0244', outcome: '自動入力', note: '本人確認書類が完備、人の修正なし', kpi: '上書き率' },
    { id: 'CASE-2026-0245', outcome: '自動入力', note: '全項目一致、承認済', kpi: '上書き率' },
  ]),
  config: [
    { k: 'モデル', v: '依頼書読み取り + 本人確認照合モデル', meta: 'カード再発行 専用' },
    { k: '権限', v: '会員番号・カード種別・送付先の自動入力', meta: '高信頼は自動、要所は入力者へ' },
    { k: 'ツール', v: '依頼書の文字読み取り / 会員情報の照合', meta: '本人確認書類の有効性も確認' },
  ],
  relatedProposals: [],
}

/** id-keyed dict。AGENT_LIST 全 id を網羅 (PV2a で 2→5)。 */
export const AGENT_DETAILS: Record<string, AgentDetailModel> = {
  'agent-corporate-address-change': AGENT_CORP_ADDRESS,
  'agent-account-opening': AGENT_ACCOUNT_OPENING,
  'agent-direct-debit': AGENT_DIRECT_DEBIT,
  'agent-corp-notification': AGENT_CORP_NOTIFICATION,
  'agent-card-reissue': AGENT_CARD_REISSUE,
}
